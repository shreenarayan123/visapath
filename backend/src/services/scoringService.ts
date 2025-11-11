import { IVisaType } from '../models/VisaType';

export interface UserProfile {
  experience: number; // Years of experience
  education: 'high_school' | 'bachelor' | 'master' | 'phd';
  specialization: string;
  languageLevel: string; // CEFR: a1, a2, b1, b2, c1, c2
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
  };
  scoreCategory: 'strong_candidate' | 'moderate_fit' | 'consider_alternatives' | 'not_recommended';
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  reasoning: string;
}

/**
 * Main scoring function
 */
export const calculateScore = (userProfile: UserProfile, visaType: IVisaType): ScoringResult => {
  const breakdown = {
    experience: 0,
    education: 0,
    specialization: 0,
    language: 0,
    documentQuality: 0
  };

  // Calculate individual scores
  breakdown.experience = calculateExperienceScore(
    userProfile.experience,
    visaType.eligibilityCriteria.minExperienceYears
  );

  breakdown.education = calculateEducationScore(
    userProfile.education,
    visaType.eligibilityCriteria.minEducationLevel
  );

  breakdown.specialization = calculateSpecializationScore(
    userProfile.specialization,
    visaType.eligibilityCriteria.specializations
  );

  breakdown.language = calculateLanguageScore(
    userProfile.languageLevel,
    visaType.eligibilityCriteria.languageRequirement
  );

  breakdown.documentQuality = calculateDocumentScore(
    userProfile.documentCount,
    userProfile.hasAllRequiredDocs
  );

  // Apply weights and calculate final score
  const weights = visaType.scoringWeights;
  let weightedScore = 0;

  weightedScore += (breakdown.experience / 100) * weights.experience;
  weightedScore += (breakdown.education / 100) * weights.education;
  weightedScore += (breakdown.specialization / 100) * weights.specialization;
  weightedScore += (breakdown.language / 100) * weights.language;
  weightedScore += (breakdown.documentQuality / 100) * weights.documentQuality;

  // Apply max score cap
  const cappedScore = Math.min(weightedScore, visaType.maxScoreCap);
  const finalScore = Math.round(cappedScore);

  // Determine category
  const category = determineScoreCategory(finalScore);

  // Generate insights
  const { strengths, improvements, nextSteps } = generateInsights(
    breakdown,
    userProfile,
    visaType,
    finalScore
  );

  // Generate reasoning
  const reasoning = generateReasoning(breakdown, visaType, weights, finalScore);

  return {
    score: finalScore,
    scoreBreakdown: breakdown,
    scoreCategory: category,
    strengths,
    improvements,
    nextSteps,
    reasoning
  };
};

/**
 * Calculate experience score (0-100)
 */
const calculateExperienceScore = (years: number, minRequired: number): number => {
  if (years < minRequired) {
    // Penalty for not meeting minimum
    const ratio = years / minRequired;
    return Math.round(ratio * 50); // Max 50 if below minimum
  }

  if (years >= minRequired + 10) {
    return 100; // Cap at 10+ years above minimum
  }

  // Linear scale from minimum to +10 years
  const yearsAboveMin = years - minRequired;
  return Math.round(50 + (yearsAboveMin / 10) * 50);
};

/**
 * Calculate education score (0-100)
 */
const calculateEducationScore = (
  level: string,
  minRequired: string
): number => {
  const levels: Record<string, number> = {
    high_school: 40,
    bachelor: 65,
    master: 85,
    phd: 100
  };

  const userScore = levels[level] || 0;
  const requiredScore = levels[minRequired] || 0;

  if (userScore < requiredScore) {
    // Penalty for not meeting minimum
    return Math.round((userScore / requiredScore) * 50);
  }

  return userScore;
};

/**
 * Calculate specialization match score (0-100)
 */
const calculateSpecializationScore = (
  userSpec: string,
  requiredSpecs: string[]
): number => {
  if (!requiredSpecs || requiredSpecs.length === 0) {
    return 80; // Default if no specific requirements
  }

  // Exact match
  if (requiredSpecs.includes(userSpec.toLowerCase())) {
    return 100;
  }

  // Partial match (check if any keyword matches)
  const userKeywords = userSpec.toLowerCase().split(/[\s,]+/);
  const hasPartialMatch = requiredSpecs.some(req =>
    userKeywords.some(keyword => req.toLowerCase().includes(keyword))
  );

  if (hasPartialMatch) {
    return 75;
  }

  // No match
  return 50;
};

/**
 * Calculate language proficiency score (0-100)
 */
const calculateLanguageScore = (proficiency: string, requirement: string): number => {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

  const userLevel = levels.indexOf(proficiency.toLowerCase());
  const requiredLevel = levels.indexOf(requirement.toLowerCase());

  if (userLevel === -1 || requiredLevel === -1) {
    return 60; // Default if levels not recognized
  }

  if (userLevel < requiredLevel) {
    // Below requirement
    const gap = requiredLevel - userLevel;
    return Math.max(30, 60 - (gap * 10));
  }

  if (userLevel === requiredLevel) {
    return 80; // Meets requirement
  }

  // Above requirement
  const bonus = (userLevel - requiredLevel) * 5;
  return Math.min(100, 80 + bonus);
};

/**
 * Calculate document quality score (0-100)
 */
const calculateDocumentScore = (count: number, hasAllRequired: boolean): number => {
  let score = 60; // Base score

  if (hasAllRequired) {
    score += 25;
  } else {
    score -= 20;
  }

  // Bonus for additional documents
  if (count >= 5) {
    score += 15;
  } else if (count >= 3) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Determine score category
 */
const determineScoreCategory = (
  score: number
): 'strong_candidate' | 'moderate_fit' | 'consider_alternatives' | 'not_recommended' => {
  if (score >= 75) return 'strong_candidate';
  if (score >= 60) return 'moderate_fit';
  if (score >= 40) return 'consider_alternatives';
  return 'not_recommended';
};

/**
 * Generate insights (strengths, improvements, next steps)
 */
const generateInsights = (
  breakdown: Record<string, number>,
  userProfile: UserProfile,
  visaType: IVisaType,
  finalScore: number
): { strengths: string[]; improvements: string[]; nextSteps: string[] } => {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const nextSteps: string[] = [];

  // Analyze strengths
  if (breakdown.experience >= 80) {
    strengths.push(`Strong professional background with ${userProfile.experience} years of experience`);
  }

  if (breakdown.education >= 85) {
    const eduLevel = userProfile.education.replace('_', ' ');
    strengths.push(`Advanced educational qualification (${eduLevel} degree)`);
  }

  if (breakdown.specialization >= 90) {
    strengths.push(`Excellent specialization match for ${visaType.visaName}`);
  }

  if (breakdown.language >= 85) {
    strengths.push(`Strong language proficiency (${userProfile.languageLevel.toUpperCase()})`);
  }

  if (breakdown.documentQuality >= 80) {
    strengths.push('Comprehensive documentation provided');
  }

  // Analyze improvements
  if (breakdown.experience < 60) {
    const minYears = visaType.eligibilityCriteria.minExperienceYears;
    improvements.push(`Gain more relevant work experience (minimum ${minYears} years required)`);
  }

  if (breakdown.education < 65) {
    const minEdu = visaType.eligibilityCriteria.minEducationLevel.replace('_', ' ');
    improvements.push(`Consider pursuing higher education (minimum ${minEdu} required)`);
  }

  if (breakdown.language < 70) {
    const reqLevel = visaType.eligibilityCriteria.languageRequirement.toUpperCase();
    improvements.push(`Improve language proficiency to ${reqLevel} level`);
  }

  if (breakdown.documentQuality < 70) {
    improvements.push('Ensure all required documents are complete and up-to-date');
  }

  if (breakdown.specialization < 60) {
    improvements.push('Consider gaining experience in specialized areas relevant to this visa type');
  }

  // Generate next steps
  if (finalScore >= 75) {
    nextSteps.push(`Prepare comprehensive application for ${visaType.visaName}`);
    nextSteps.push('Gather all supporting documentation and certifications');
    nextSteps.push('Consider consulting with an immigration attorney');
  } else if (finalScore >= 60) {
    nextSteps.push('Address the improvement areas mentioned above');
    nextSteps.push('Gather additional supporting evidence for your application');
    nextSteps.push('Consider alternative visa options that may be a better fit');
  } else {
    nextSteps.push('Focus on building qualifications in key areas (experience, education)');
    nextSteps.push('Explore alternative visa types that match your current profile');
    nextSteps.push('Consider professional development and certifications');
  }

  nextSteps.push(`Visit official website: ${visaType.officialLink || 'Contact immigration authority'}`);

  return { strengths, improvements, nextSteps };
};

/**
 * Generate detailed reasoning
 */
const generateReasoning = (
  breakdown: Record<string, number>,
  visaType: IVisaType,
  weights: any,
  finalScore: number
): string => {
  const parts: string[] = [];

  parts.push(`Score calculated for ${visaType.visaName} in ${visaType.countryName}:`);
  parts.push('');
  parts.push('Component Scores:');
  parts.push(`- Experience: ${breakdown.experience}/100 (weight: ${weights.experience}%)`);
  parts.push(`- Education: ${breakdown.education}/100 (weight: ${weights.education}%)`);
  parts.push(`- Specialization: ${breakdown.specialization}/100 (weight: ${weights.specialization}%)`);
  parts.push(`- Language: ${breakdown.language}/100 (weight: ${weights.language}%)`);
  parts.push(`- Documents: ${breakdown.documentQuality}/100 (weight: ${weights.documentQuality}%)`);
  parts.push('');
  parts.push(`Final Score: ${finalScore}/100 (capped at ${visaType.maxScoreCap})`);
  parts.push('');

  if (visaType.successRatePercent) {
    parts.push(`Historical success rate: ${visaType.successRatePercent}%`);
  }

  if (visaType.processingTimeWeeks) {
    parts.push(`Average processing time: ${visaType.processingTimeWeeks} weeks`);
  }

  return parts.join('\n');
};

/**
 * Extract user profile from professional summary (simple extraction)
 * In production, you might want to use AI (GPT-4, Claude) for better parsing
 */
export const extractUserProfile = (professionalSummary: string, documents: any[]): UserProfile => {
  // This is a simplified extraction
  // In production, use AI to parse the summary more intelligently

  const summary = professionalSummary.toLowerCase();

  // Extract years of experience (look for patterns like "5 years", "10+ years")
  let experience = 0;
  const expMatch = summary.match(/(\d+)\+?\s*(years?|yrs?)/i);
  if (expMatch) {
    experience = parseInt(expMatch[1]);
  }

  // Extract education level
  let education: UserProfile['education'] = 'bachelor';
  if (summary.includes('phd') || summary.includes('doctorate')) {
    education = 'phd';
  } else if (summary.includes('master') || summary.includes('msc') || summary.includes('mba')) {
    education = 'master';
  } else if (summary.includes('bachelor') || summary.includes('bsc') || summary.includes('ba ')) {
    education = 'bachelor';
  } else if (summary.includes('high school') || summary.includes('diploma')) {
    education = 'high_school';
  }

  // Extract specialization (simplified - just get first keyword)
  let specialization = 'general';
  const specializations = ['technology', 'engineering', 'medicine', 'business', 'arts', 'science', 'education'];
  for (const spec of specializations) {
    if (summary.includes(spec)) {
      specialization = spec;
      break;
    }
  }

  // Extract language level (look for CEFR levels)
  let languageLevel = 'b2'; // Default
  const langMatch = summary.match(/([abc][12])/i);
  if (langMatch) {
    languageLevel = langMatch[1].toLowerCase();
  }

  return {
    experience,
    education,
    specialization,
    languageLevel,
    documentCount: documents.length,
    hasAllRequiredDocs: documents.length >= 3 // Simplified check
  };
};
