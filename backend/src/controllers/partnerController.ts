import { Request, Response } from 'express';
import { Evaluation } from '../models/Evaluation';
import { Partner } from '../models/Partner';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../middleware/asyncHandler';
import { z } from 'zod';

/**
 * Get partner evaluations
 * GET /api/partner/evaluations
 */
export const getPartnerEvaluations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.partner) {
    throw ApiError.unauthorized('Partner authentication required');
  }

  const {
    limit = '20',
    offset = '0',
    country,
    visaType,
    scoreMin,
    scoreMax,
    dateFrom,
    dateTo,
    status
  } = req.query;

  // Build query
  const query: any = {
    partnerKey: req.partner._id.toString()
  };

  if (country) {
    query.targetCountry = country;
  }

  if (visaType) {
    query.visaType = visaType;
  }

  if (scoreMin || scoreMax) {
    query.score = {};
    if (scoreMin) query.score.$gte = parseInt(scoreMin as string);
    if (scoreMax) query.score.$lte = parseInt(scoreMax as string);
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
    if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
  }

  if (status) {
    query.status = status;
  }

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Get evaluations
  const [evaluations, total] = await Promise.all([
    Evaluation.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(offsetNum)
      .select('_id email targetCountry visaType score scoreCategory createdAt status'),
    Evaluation.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: evaluations,
    pagination: {
      total,
      limit: limitNum,
      offset: offsetNum,
      hasMore: total > offsetNum + limitNum
    }
  });
});

/**
 * Get partner statistics
 * GET /api/partner/stats
 */
export const getPartnerStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.partner) {
    throw ApiError.unauthorized('Partner authentication required');
  }

  const partnerId = req.partner._id.toString();

  // Date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  // Aggregations
  const [
    totalSubmissions,
    thisMonth,
    thisWeek,
    avgScore,
    topCountries,
    topVisaTypes
  ] = await Promise.all([
    Evaluation.countDocuments({ partnerKey: partnerId }),
    Evaluation.countDocuments({ partnerKey: partnerId, createdAt: { $gte: startOfMonth } }),
    Evaluation.countDocuments({ partnerKey: partnerId, createdAt: { $gte: startOfWeek } }),
    Evaluation.aggregate([
      { $match: { partnerKey: partnerId } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]),
    Evaluation.aggregate([
      { $match: { partnerKey: partnerId } },
      { $group: { _id: '$targetCountry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Evaluation.aggregate([
      { $match: { partnerKey: partnerId } },
      { $group: { _id: '$visaType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalSubmissions,
      thisMonth,
      thisWeek,
      averageScore: avgScore[0]?.avgScore ? Math.round(avgScore[0].avgScore * 10) / 10 : 0,
      topCountries: topCountries.map((c) => ({
        country: c._id,
        count: c.count
      })),
      topVisaTypes: topVisaTypes.map((v) => ({
        visa: v._id,
        count: v.count
      }))
    }
  });
});

/**
 * Export partner evaluations as CSV
 * GET /api/partner/evaluations/export
 */
export const exportEvaluations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.partner) {
    throw ApiError.unauthorized('Partner authentication required');
  }

  const evaluations = await Evaluation.find({ partnerKey: req.partner._id.toString() })
    .sort({ createdAt: -1 })
    .limit(1000);

  // Generate CSV
  const csvHeaders = [
    'ID',
    'Email',
    'Name',
    'Country',
    'Visa Type',
    'Score',
    'Category',
    'Date'
  ].join(',');

  const csvRows = evaluations.map((e) =>
    [
      e._id,
      e.email,
      `${e.firstName} ${e.lastName}`,
      e.targetCountry,
      e.visaType,
      e.score,
      e.scoreCategory,
      new Date(e.createdAt).toISOString()
    ].join(',')
  );

  const csv = [csvHeaders, ...csvRows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=evaluations.csv');
  res.send(csv);
});

/**
 * Create partner (admin only - simplified version)
 * POST /api/partner/create
 */
const createPartnerSchema = z.object({
  partnerName: z.string().min(1),
  email: z.string().email(),
  companyWebsite: z.string().url().optional(),
  allowedOrigins: z.array(z.string()).optional()
});

export const createPartner = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createPartnerSchema.parse(req.body);

  // Generate API key
  const { generateApiKey, hashApiKey } = await import('../utils/crypto');
  const apiKey = generateApiKey();
  const hashedKey = hashApiKey(apiKey);

  const partner = await Partner.create({
    partnerName: validatedData.partnerName,
    email: validatedData.email,
    companyWebsite: validatedData.companyWebsite,
    apiKey: hashedKey,
    allowedOrigins: validatedData.allowedOrigins || [],
    isActive: true
  });

  // Send welcome email
  const { sendPartnerWelcomeEmail } = await import('../services/emailService');
  await sendPartnerWelcomeEmail(partner.email, partner.partnerName, apiKey);

  res.status(201).json({
    success: true,
    data: {
      partnerId: partner._id,
      partnerName: partner.partnerName,
      email: partner.email,
      apiKey: apiKey, // Only shown once!
      message: 'Partner created successfully. API key has been emailed.'
    }
  });
});
