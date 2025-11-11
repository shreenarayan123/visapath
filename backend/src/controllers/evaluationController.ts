import { Request, Response } from 'express';
import { Evaluation } from '../models/Evaluation';
import { VisaType } from '../models/VisaType';
import { UserSubmission } from '../models/UserSubmission';
import { Partner } from '../models/Partner';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../middleware/asyncHandler';
import { createEvaluationSchema, emailResultsSchema } from '../validators/evaluationValidator';
import { calculateScore, extractUserProfile } from '../services/scoringService';
import { calculateScoreWithAI } from '../services/scoringServiceV2';
import { parseDocument } from '../services/documentParsingService';
import { sendResultsEmail } from '../services/emailService';
import { generateEvaluationPDF } from '../services/pdfService';
import { generateEvaluationPDF as generateEvaluationPDFV2 } from '../services/pdfServiceV2';
import { generateEvaluationPDF as generateEvaluationPDFV3 } from '../services/pdfServiceV3';
import { getFileUrl } from '../middleware/upload';
import { logger } from '../utils/logger';

/**
 * Create a new visa evaluation
 * POST /api/evaluations
 */
export const createEvaluation = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = createEvaluationSchema.parse(req.body);

  // Check if visa type exists
  const visaType = await VisaType.findOne({ visaTypeId: validatedData.visaTypeId });
  if (!visaType) {
    throw ApiError.notFound('Visa type not found');
  }

  // Process uploaded files
  const uploadedFiles = req.files as Express.Multer.File[] || [];
  const uploadedDocuments = uploadedFiles.map((file) => ({
    documentType: file.fieldname || 'other',
    fileName: file.originalname,
    fileUrl: getFileUrl(req, file.filename),
    uploadedAt: new Date(),
    fileSize: file.size,
    filePath: file.path // Store path for parsing
  }));

  // NEW: Parse documents to extract text content
  logger.info(`Parsing ${uploadedFiles.length} uploaded documents...`);
  const parsedDocuments = [];
  for (const file of uploadedFiles) {
    try {
      const parsed = await parseDocument(
        file.path,
        file.originalname,
        file.fieldname || 'other'
      );
      parsedDocuments.push(parsed);
      logger.info(`Parsed ${file.originalname}: ${parsed.wordCount} words, success: ${parsed.parseSuccess}`);
    } catch (error) {
      logger.error(`Error parsing ${file.originalname}:`, error);
      parsedDocuments.push({
        fileName: file.originalname,
        documentType: file.fieldname || 'other',
        extractedText: '',
        wordCount: 0,
        parseSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // NEW: Use AI-powered scoring for better accuracy
  let scoringResult;
  try {
    logger.info('Using AI-powered evaluation...');
    scoringResult = await calculateScoreWithAI(
      validatedData.professionalSummary,
      parsedDocuments,
      visaType
    );
    logger.info(`AI evaluation complete. Score: ${scoringResult.score}/100`);
  } catch (error) {
    logger.error('AI evaluation failed, falling back to basic scoring:', error);
    // Fallback to old method if AI fails
    const userProfile = extractUserProfile(validatedData.professionalSummary, uploadedDocuments);
    scoringResult = calculateScore(userProfile, visaType);
  }

  // Generate summary
  const summary = `Based on your profile, you scored ${scoringResult.score}/100 for the ${visaType.visaName}. ${
    scoringResult.scoreCategory === 'strong_candidate'
      ? 'You are a strong candidate for this visa type!'
      : scoringResult.scoreCategory === 'moderate_fit'
      ? 'You have a moderate fit for this visa type.'
      : 'You may want to consider improving certain areas or exploring alternative visa options.'
  }`;

  // Create evaluation
  const evaluation = await Evaluation.create({
    userId: validatedData.email,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    email: validatedData.email,
    phone: validatedData.phone,
    currentLocation: validatedData.currentLocation,
    professionalSummary: validatedData.professionalSummary,
    targetCountry: validatedData.targetCountry,
    visaType: validatedData.visaType,
    visaTypeId: validatedData.visaTypeId,
    uploadedDocuments,
    score: scoringResult.score,
    scoreBreakdown: scoringResult.scoreBreakdown,
    scoreCategory: scoringResult.scoreCategory,
    strengths: scoringResult.strengths,
    improvements: scoringResult.improvements,
    nextSteps: scoringResult.nextSteps,
    summary,
    reasoning: scoringResult.reasoning,
    evaluatedAt: new Date(),
    status: 'completed',
    partnerKey: req.partner?._id?.toString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  });

  // Update user submissions
  await UserSubmission.findOneAndUpdate(
    { email: validatedData.email },
    {
      $push: { evaluationIds: evaluation._id },
      $set: { lastSubmissionAt: new Date() }
    },
    { upsert: true }
  );

  // Update partner submission count if applicable
  if (req.partner) {
    await Partner.findByIdAndUpdate(req.partner._id, {
      $inc: { submissionCount: 1 }
    });
  }

  logger.info(`Evaluation created: ${evaluation._id} for ${validatedData.email}`);

  res.status(201).json({
    success: true,
    data: {
      evaluationId: evaluation._id,
      email: evaluation.email,
      status: evaluation.status,
      score: evaluation.score,
      scoreCategory: evaluation.scoreCategory,
      message: 'Evaluation completed successfully'
    }
  });
});

/**
 * Get evaluation by ID
 * GET /api/evaluations/:id
 */
export const getEvaluation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const evaluation = await Evaluation.findById(id);

  if (!evaluation) {
    throw ApiError.notFound('Evaluation not found');
  }

  res.status(200).json({
    success: true,
    data: {
      evaluationId: evaluation._id,
      firstName: evaluation.firstName,
      lastName: evaluation.lastName,
      email: evaluation.email,
      phone: evaluation.phone,
      currentLocation: evaluation.currentLocation,
      targetCountry: evaluation.targetCountry,
      visaType: evaluation.visaType,
      score: evaluation.score,
      scoreCategory: evaluation.scoreCategory,
      scoreBreakdown: evaluation.scoreBreakdown,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      nextSteps: evaluation.nextSteps,
      reasoning: evaluation.reasoning,
      uploadedDocuments: evaluation.uploadedDocuments,
      evaluatedAt: evaluation.evaluatedAt,
      createdAt: evaluation.createdAt
    }
  });
});

/**
 * Email evaluation results
 * POST /api/evaluations/:id/email-results
 */
export const emailResults = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = emailResultsSchema.parse(req.body);

  const evaluation = await Evaluation.findById(id);

  if (!evaluation) {
    throw ApiError.notFound('Evaluation not found');
  }

  // Verify email matches
  if (evaluation.email !== validatedData.email) {
    throw ApiError.forbidden('Email does not match evaluation');
  }

  // Generate PDF (use V3 for best layout)
  let pdfBuffer;
  try {
    pdfBuffer = await generateEvaluationPDFV3(evaluation);
  } catch (error) {
    logger.error('PDF V3 generation failed, trying V2:', error);
    try {
      pdfBuffer = await generateEvaluationPDFV2(evaluation);
    } catch (error2) {
      logger.error('PDF V2 also failed, using V1 fallback:', error2);
      pdfBuffer = await generateEvaluationPDF(evaluation);
    }
  }

  // Send email
  await sendResultsEmail(evaluation, pdfBuffer);

  res.status(200).json({
    success: true,
    message: 'Results emailed successfully'
  });
});

/**
 * Download evaluation PDF
 * GET /api/evaluations/:id/download-pdf
 */
export const downloadPDF = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const evaluation = await Evaluation.findById(id);

  if (!evaluation) {
    throw ApiError.notFound('Evaluation not found');
  }

  // Generate PDF (use V3 for best layout)
  let pdfBuffer;
  try {
    pdfBuffer = await generateEvaluationPDFV3(evaluation);
  } catch (error) {
    logger.error('PDF V3 generation failed, trying V2:', error);
    try {
      pdfBuffer = await generateEvaluationPDFV2(evaluation);
    } catch (error2) {
      logger.error('PDF V2 also failed, using V1 fallback:', error2);
      pdfBuffer = await generateEvaluationPDF(evaluation);
    }
  }

  // Set headers for download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=visa_evaluation_${id}.pdf`);
  res.setHeader('Content-Length', pdfBuffer.length);

  res.send(pdfBuffer);
});

/**
 * Get user's evaluation history
 * GET /api/evaluations/user/:email
 */
export const getUserEvaluations = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params;

  const evaluations = await Evaluation.find({ email })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('_id targetCountry visaType score scoreCategory createdAt evaluatedAt');

  res.status(200).json({
    success: true,
    data: evaluations,
    count: evaluations.length
  });
});
