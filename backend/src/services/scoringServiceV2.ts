import { IVisaType } from '../models/VisaType';
import { analyzeO1AApplication, generatePersonalizedRecommendations, AIProfileAnalysis } from './aiAnalysisService';
import { ParsedDocument } from './documentParsingService';

/**
 * NEW AI-Powered Scoring Service with Official USCIS Criteria
 * Replaces the old rule-based system with strict, realistic evaluation
 */

export interface UserProfile {
  experience: number;
  education: 'high_school' | 'bachelor' | 'master' | 'phd';
  specialization: string;
  languageLevel: string;
  documentCount: number;
  hasAllRequiredDocs: boolean;
}

export interface ScoringResult {
  score: number;
  scoreBreakdown: {
    experience: number;
    education: number;
    specialization: number;
    language: number;
    documentQuality: number;
    // New O-1A specific breakdowns
    o1aCriteriaMet?: number;
    nationalRecognition?: number;
    originalContributions?: number;
  };
  scoreCategory: 'strong_candidate' | 'moderate_fit' | 'consider_alternatives' | 'not_recommended';
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  reasoning: string;

  // New detailed analysis
  aiAnalysis?: AIProfileAnalysis;
  detailedRecommendations?: {
    priorityActions: Array<{ priority: number; action: string; timeline: string; impact: string }>;
    longTermStrategy: string;
    resourceLinks: string[];
  };
}

/**
 * Calculate score using AI analysis for O-1A visa
 */
export const calculateScoreWithAI = async (
  professionalSummary: string,
  parsedDocuments: ParsedDocument[],
  visaType: IVisaType
): Promise<ScoringResult> => {

  // Combine all document text
  const documentContents = parsedDocuments
    .filter(doc => doc.parseSuccess && doc.extractedText.length > 0)
    .map(doc => `--- ${doc.documentType.toUpperCase()}: ${doc.fileName} ---\n${doc.extractedText}`)
    .join('\n\n');

  // For O-1A visa, use strict AI-powered analysis
  if (visaType.visaName.includes('O-1A') || visaType.visaName.includes('O-1')) {
    return await calculateO1AScore(
      professionalSummary,
      documentContents,
      parsedDocuments,
      visaType
    );
  }

  // For other visa types, can use the old method or adapt
  // For now, fallback to basic extraction
  return calculateBasicScore(professionalSummary, parsedDocuments, visaType);
};

/**
 * O-1A specific scoring using official USCIS criteria
 */
async function calculateO1AScore(
  professionalSummary: string,
  documentContents: string,
  parsedDocuments: ParsedDocument[],
  visaType: IVisaType
): Promise<ScoringResult> {

  try {
    // Use AI to analyze against official O-1A criteria
    const aiAnalysis = await analyzeO1AApplication(
      professionalSummary,
      documentContents,
      visaType.eligibilityCriteria.minExperienceYears,
      visaType.eligibilityCriteria.minEducationLevel,
      visaType.eligibilityCriteria.specializations.join(', ')
    );

    // Generate personalized recommendations
    const detailedRecommendations = await generatePersonalizedRecommendations(
      aiAnalysis,
      visaType.visaName,
      aiAnalysis.fieldOfExpertise
    );

    // Calculate breakdown scores based on AI analysis
    const breakdown = {
      experience: calculateExperienceFromAI(aiAnalysis.yearsOfExperience, visaType.eligibilityCriteria.minExperienceYears),
      education: calculateEducationFromAI(aiAnalysis.educationLevel, visaType.eligibilityCriteria.minEducationLevel),
      specialization: calculateSpecializationScore(aiAnalysis.fieldOfExpertise, visaType.eligibilityCriteria.specializations),
      language: calculateLanguageScore(aiAnalysis.languageProficiency, visaType.eligibilityCriteria.languageRequirement),
      documentQuality: calculateDocumentQualityFromAI(aiAnalysis.documentQuality, parsedDocuments),

      // O-1A specific scores
      o1aCriteriaMet: (aiAnalysis.criteriaMet / 8) * 100, // Percentage of 8 criteria met
      nationalRecognition: aiAnalysis.hasNationalInternationalRecognition ? 100 : 0,
      originalContributions: aiAnalysis.hasOriginalContributions ? 100 : 0
    };

    // Use AI's overall score as the primary score (it's already strict)
    const finalScore = aiAnalysis.overallScore;

    // Apply visa type's max score cap if exists
    const cappedScore = visaType.maxScoreCap
      ? Math.min(finalScore, visaType.maxScoreCap)
      : finalScore;

    // Determine category based on O-1A specific thresholds
    let category: ScoringResult['scoreCategory'];
    if (aiAnalysis.approvalLikelihood === 'very_high' || aiAnalysis.approvalLikelihood === 'high') {
      category = 'strong_candidate';
    } else if (aiAnalysis.approvalLikelihood === 'moderate') {
      category = 'moderate_fit';
    } else if (aiAnalysis.approvalLikelihood === 'low') {
      category = 'consider_alternatives';
    } else {
      category = 'not_recommended';
    }

    // Build detailed reasoning
    const reasoning = buildO1AReasoning(aiAnalysis, visaType, cappedScore);

    return {
      score: Math.round(cappedScore),
      scoreBreakdown: breakdown,
      scoreCategory: category,
      strengths: aiAnalysis.strengths,
      improvements: aiAnalysis.criticalWeaknesses,
      nextSteps: aiAnalysis.nextSteps,
      reasoning,
      aiAnalysis,
      detailedRecommendations
    };

  } catch (error) {
    console.error('Error in AI scoring:', error);
    // Fallback to basic scoring if AI fails
    console.warn('Falling back to basic scoring due to AI error');
    return calculateBasicScore(professionalSummary, parsedDocuments, visaType);
  }
}

/**
 * Build detailed reasoning for O-1A evaluation
 */
function buildO1AReasoning(
  analysis: AIProfileAnalysis,
  visaType: IVisaType,
  score: number
): string {
  const parts: string[] = [];

  parts.push('=== O-1A VISA EVALUATION (Extraordinary Ability) ===\n');

  parts.push(`Overall Assessment Score: ${score}/100`);
  parts.push(`Approval Likelihood: ${analysis.approvalLikelihood.replace('_', ' ').toUpperCase()}\n`);

  parts.push('--- USCIS O-1A CRITERIA ANALYSIS (Must Meet 3 of 8) ---');
  parts.push(`Criteria Met: ${analysis.criteriaMet}/8 ${analysis.criteriaMet >= 3 ? '✓ MEETS MINIMUM' : '✗ BELOW MINIMUM (Need 3)'}\n`);

  // Show each criterion with score
  analysis.o1aCriteria.forEach((criterion, index) => {
    const status = criterion.score >= 60 ? '✓' : '✗';
    parts.push(`${index + 1}. ${criterion.criteriaName}: ${criterion.score}/100 ${status}`);
    parts.push(`   Quality: ${criterion.evidenceQuality.toUpperCase()}`);
    if (criterion.evidenceFound.length > 0) {
      parts.push(`   Evidence: ${criterion.evidenceFound.join(', ')}`);
    } else {
      parts.push(`   Evidence: None found`);
    }
    if (criterion.specificGaps.length > 0) {
      parts.push(`   Gaps: ${criterion.specificGaps.join('; ')}`);
    }
  });

  parts.push('\n--- PROFILE SUMMARY ---');
  parts.push(`Field of Expertise: ${analysis.fieldOfExpertise}`);
  parts.push(`Years of Experience: ${analysis.yearsOfExperience}`);
  parts.push(`Education Level: ${analysis.educationLevel.toUpperCase()}`);
  parts.push(`Language Proficiency: ${analysis.languageProficiency.toUpperCase()}`);

  parts.push('\n--- KEY EVIDENCE FLAGS ---');
  parts.push(`National/International Recognition: ${analysis.hasNationalInternationalRecognition ? 'YES ✓' : 'NO ✗'}`);
  parts.push(`Major Awards/Prizes: ${analysis.hasAwardsOrPrizes ? 'YES ✓' : 'NO ✗'}`);
  parts.push(`Published Work: ${analysis.hasPublishedWork ? 'YES ✓' : 'NO ✗'}`);
  parts.push(`Judged Others' Work: ${analysis.hasJudgedOthersWork ? 'YES ✓' : 'NO ✗'}`);
  parts.push(`Press Coverage: ${analysis.hasPressCoverage ? 'YES ✓' : 'NO ✗'}`);
  parts.push(`Original Contributions: ${analysis.hasOriginalContributions ? 'YES ✓' : 'NO ✗'}`);
  parts.push(`Leadership Roles: ${analysis.hasLeadershipRoles ? 'YES ✓' : 'NO ✗'}`);
  parts.push(`High Compensation: ${analysis.hasHighCompensation ? 'YES ✓' : 'NO ✗'}`);

  parts.push('\n--- DOCUMENTATION QUALITY ---');
  parts.push(`Quality Assessment: ${analysis.documentQuality.toUpperCase()}`);
  parts.push(`Notes: ${analysis.documentQualityNotes}`);

  if (visaType.successRatePercent) {
    parts.push(`\nHistorical O-1A Success Rate: ~${visaType.successRatePercent}%`);
  }

  if (visaType.processingTimeWeeks) {
    parts.push(`Average Processing Time: ${visaType.processingTimeWeeks} weeks`);
  }

  parts.push(`\nOfficial USCIS Resource: ${visaType.officialLink}`);

  return parts.join('\n');
}

/**
 * Helper functions for score calculation
 */

function calculateExperienceFromAI(years: number, minRequired: number): number {
  if (years >= minRequired + 5) return 90;
  if (years >= minRequired + 3) return 80;
  if (years >= minRequired) return 70;
  if (years >= minRequired - 1) return 50;
  if (years >= minRequired - 2) return 30;
  return Math.max(0, (years / minRequired) * 40);
}

function calculateEducationFromAI(level: string, required: string): number {
  const levels: Record<string, number> = {
    'high_school': 30,
    'bachelor': 60,
    'master': 80,
    'phd': 100
  };

  const requiredScore = levels[required] || 60;
  const userScore = levels[level] || 30;

  if (userScore >= requiredScore) return userScore;
  return (userScore / requiredScore) * 50; // Penalty for not meeting requirement
}

function calculateSpecializationScore(field: string, allowed: string[]): number {
  const fieldLower = field.toLowerCase();

  // Exact match
  if (allowed.some(spec => fieldLower === spec.toLowerCase())) {
    return 100;
  }

  // Partial match
  if (allowed.some(spec => fieldLower.includes(spec.toLowerCase()) || spec.toLowerCase().includes(fieldLower))) {
    return 70;
  }

  // No match
  return 40;
}

function calculateLanguageScore(level: string, required: string): number {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  const userIndex = levels.indexOf(level.toLowerCase());
  const requiredIndex = levels.indexOf(required.toLowerCase());

  if (userIndex === -1 || requiredIndex === -1) return 60; // Default

  if (userIndex >= requiredIndex) {
    // Meets or exceeds requirement
    return 70 + ((userIndex - requiredIndex) * 10);
  } else {
    // Below requirement
    const gap = requiredIndex - userIndex;
    return Math.max(20, 60 - (gap * 15));
  }
}

function calculateDocumentQualityFromAI(quality: string, documents: ParsedDocument[]): number {
  let baseScore = 0;

  switch (quality) {
    case 'excellent': baseScore = 95; break;
    case 'good': baseScore = 75; break;
    case 'fair': baseScore = 50; break;
    case 'poor': baseScore = 25; break;
    default: baseScore = 40;
  }

  // Bonus for number of successfully parsed documents
  const parsedCount = documents.filter(d => d.parseSuccess).length;
  if (parsedCount >= 5) baseScore += 5;
  if (parsedCount >= 8) baseScore += 5;

  return Math.min(100, baseScore);
}

/**
 * Fallback basic scoring (for non-O-1A or when AI fails)
 * Uses simple extraction from professional summary
 */
function calculateBasicScore(
  professionalSummary: string,
  parsedDocuments: ParsedDocument[],
  visaType: IVisaType
): ScoringResult {

  // Extract basic profile
  const summary = professionalSummary.toLowerCase();

  // Extract years
  let experience = 0;
  const expMatch = summary.match(/(\d+)\+?\s*(years?|yrs?)/i);
  if (expMatch) experience = parseInt(expMatch[1]);

  // Extract education
  let education: UserProfile['education'] = 'bachelor';
  if (summary.includes('phd')) education = 'phd';
  else if (summary.includes('master')) education = 'master';
  else if (summary.includes('bachelor')) education = 'bachelor';
  else education = 'high_school';

  // Extract specialization
  let specialization = 'general';
  for (const spec of visaType.eligibilityCriteria.specializations) {
    if (summary.includes(spec.toLowerCase())) {
      specialization = spec;
      break;
    }
  }

  // Extract language
  let languageLevel = 'b2';
  const langMatch = summary.match(/([abc][12])/i);
  if (langMatch) languageLevel = langMatch[1].toLowerCase();

  // Calculate scores
  const breakdown = {
    experience: calculateExperienceFromAI(experience, visaType.eligibilityCriteria.minExperienceYears),
    education: calculateEducationFromAI(education, visaType.eligibilityCriteria.minEducationLevel),
    specialization: calculateSpecializationScore(specialization, visaType.eligibilityCriteria.specializations),
    language: calculateLanguageScore(languageLevel, visaType.eligibilityCriteria.languageRequirement),
    documentQuality: parsedDocuments.filter(d => d.parseSuccess).length >= 3 ? 70 : 40
  };

  // Calculate weighted final score
  const weights = visaType.scoringWeights;
  const finalScore =
    (breakdown.experience * weights.experience / 100) +
    (breakdown.education * weights.education / 100) +
    (breakdown.specialization * weights.specialization / 100) +
    (breakdown.language * weights.language / 100) +
    (breakdown.documentQuality * weights.documentQuality / 100);

  // Apply cap
  const cappedScore = visaType.maxScoreCap
    ? Math.min(finalScore, visaType.maxScoreCap)
    : finalScore;

  // Determine category
  let category: ScoringResult['scoreCategory'];
  if (cappedScore >= 75) category = 'strong_candidate';
  else if (cappedScore >= 60) category = 'moderate_fit';
  else if (cappedScore >= 40) category = 'consider_alternatives';
  else category = 'not_recommended';

  return {
    score: Math.round(cappedScore),
    scoreBreakdown: breakdown,
    scoreCategory: category,
    strengths: ['Basic profile extraction - AI analysis recommended for detailed evaluation'],
    improvements: ['Upload detailed documentation for AI-powered analysis'],
    nextSteps: [`Visit official website: ${visaType.officialLink}`],
    reasoning: `Basic scoring (AI analysis not available). Score: ${Math.round(cappedScore)}/100`
  };
}

/**
 * Extract user profile (backward compatibility)
 */
export const extractUserProfile = (professionalSummary: string, documents: any[]): UserProfile => {
  const summary = professionalSummary.toLowerCase();

  let experience = 0;
  const expMatch = summary.match(/(\d+)\+?\s*(years?|yrs?)/i);
  if (expMatch) experience = parseInt(expMatch[1]);

  let education: UserProfile['education'] = 'bachelor';
  if (summary.includes('phd')) education = 'phd';
  else if (summary.includes('master')) education = 'master';
  else if (summary.includes('bachelor')) education = 'bachelor';
  else education = 'high_school';

  let specialization = 'general';
  const specializations = ['technology', 'engineering', 'medicine', 'business', 'arts', 'science', 'education'];
  for (const spec of specializations) {
    if (summary.includes(spec)) {
      specialization = spec;
      break;
    }
  }

  let languageLevel = 'b2';
  const langMatch = summary.match(/([abc][12])/i);
  if (langMatch) languageLevel = langMatch[1].toLowerCase();

  return {
    experience,
    education,
    specialization,
    languageLevel,
    documentCount: documents.length,
    hasAllRequiredDocs: documents.length >= 3
  };
};
