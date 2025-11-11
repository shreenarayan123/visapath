import OpenAI from 'openai';

/**
 * AI-powered analysis service for visa applications using official USCIS criteria
 */

// Lazy-initialize OpenAI client to ensure env vars are loaded
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured. Please add it to your .env file. ' +
        'Get your API key from: https://platform.openai.com/api-keys'
      );
    }

    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

export interface O1ACriteriaAnalysis {
  criteriaName: string;
  officialDescription: string;
  evidenceFound: string[];
  evidenceQuality: 'none' | 'weak' | 'moderate' | 'strong' | 'exceptional';
  score: number; // 0-100
  specificGaps: string[];
  recommendations: string[];
}

export interface AIProfileAnalysis {
  // O-1A Specific: Must meet 3 of 8 criteria
  o1aCriteria: O1ACriteriaAnalysis[];
  criteriaMet: number; // How many of 8 criteria are met

  // Detailed profile extraction
  yearsOfExperience: number;
  educationLevel: string;
  fieldOfExpertise: string;
  languageProficiency: string;

  // Evidence assessment
  hasNationalInternationalRecognition: boolean;
  hasAwardsOrPrizes: boolean;
  hasPublishedWork: boolean;
  hasJudgedOthersWork: boolean;
  hasPressCoverage: boolean;
  hasOriginalContributions: boolean;
  hasLeadershipRoles: boolean;
  hasHighCompensation: boolean;

  // Scoring
  overallScore: number; // 0-100, strict evaluation
  approvalLikelihood: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

  // Detailed insights
  strengths: string[];
  criticalWeaknesses: string[];
  specificRecommendations: string[];
  nextSteps: string[];

  // Quality assessment
  documentQuality: 'poor' | 'fair' | 'good' | 'excellent';
  documentQualityNotes: string;
}

/**
 * Official O-1A criteria from USCIS
 * Reference: https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement
 */
const O1A_OFFICIAL_CRITERIA = [
  {
    name: 'Major Awards or Prizes',
    description: 'Receipt of nationally or internationally recognized prizes or awards for excellence in the field of endeavor',
    examples: ['Nobel Prize', 'Pulitzer Prize', 'Olympic Medal', 'Academy Award', 'Major industry awards']
  },
  {
    name: 'Membership in Associations',
    description: 'Membership in associations in the field which require outstanding achievements of their members, as judged by recognized national or international experts',
    examples: ['Fellow of IEEE', 'Member of National Academy of Sciences', 'Prestigious professional societies']
  },
  {
    name: 'Published Material About You',
    description: 'Published material in professional or major trade publications or major media about the beneficiary, relating to work in the field',
    examples: ['Feature articles in major newspapers', 'Magazine profiles', 'Industry publication coverage', 'Interviews in major media']
  },
  {
    name: 'Judging Others\' Work',
    description: 'Participation on a panel, or individually, as a judge of the work of others in the same or in an allied field',
    examples: ['Journal peer reviewer', 'Grant proposal reviewer', 'Competition judge', 'Conference program committee']
  },
  {
    name: 'Original Contributions',
    description: 'Original scientific, scholarly, or business-related contributions of major significance in the field',
    examples: ['Groundbreaking research', 'Patents with significant impact', 'Revolutionary methodologies', 'Industry-changing innovations']
  },
  {
    name: 'Scholarly Articles',
    description: 'Authorship of scholarly articles in the field, in professional journals, or other major media',
    examples: ['Peer-reviewed publications', 'Books', 'Book chapters', 'Conference papers in top-tier venues']
  },
  {
    name: 'Critical/Essential Capacity',
    description: 'Employment in a critical or essential capacity for organizations and establishments that have a distinguished reputation',
    examples: ['Key role at leading company', 'Essential position at renowned institution', 'Critical role with distinguished org']
  },
  {
    name: 'High Salary',
    description: 'A high salary or other remuneration for services evidenced by contracts or other reliable evidence',
    examples: ['Top 10% compensation in field', 'Significantly above industry average', 'Executive-level compensation']
  }
];

/**
 * Analyze documents and profile using AI against official O-1A criteria
 */
export async function analyzeO1AApplication(
  professionalSummary: string,
  documentContents: string,
  requiredYears: number,
  requiredEducation: string,
  fieldOfWork: string
): Promise<AIProfileAnalysis> {

  const prompt = `You are an expert immigration attorney specializing in O-1A visas for individuals with extraordinary ability. You will analyze an applicant's profile and documents against the official USCIS O-1A criteria.

CRITICAL CONTEXT:
- O-1A visa requires EXTRAORDINARY ability (top 1-3% in field)
- Must meet AT LEAST 3 of the 8 criteria listed below
- Evidence must be STRONG and VERIFIABLE
- Approval rate is around 40-50%, meaning standards are HIGH
- Be STRICT and REALISTIC in your evaluation

OFFICIAL O-1A CRITERIA (from USCIS):
${O1A_OFFICIAL_CRITERIA.map((c, i) => `${i + 1}. ${c.name}: ${c.description}\n   Examples: ${c.examples.join(', ')}`).join('\n\n')}

APPLICANT INFORMATION:
Professional Summary:
${professionalSummary}

Supporting Documents Content:
${documentContents || '[No documents provided or documents could not be parsed]'}

EVALUATION REQUIREMENTS:
For EACH of the 8 criteria, analyze:
1. What evidence (if any) is present
2. Quality of evidence: none/weak/moderate/strong/exceptional
3. Score for this criterion: 0-100 (be strict: 0-20=none, 21-40=weak, 41-60=moderate, 61-80=strong, 81-100=exceptional)
4. Specific gaps in evidence
5. Specific recommendations to strengthen this criterion

Then provide:
- Overall assessment: How many criteria are met (need 3+ with strong evidence)
- Realistic approval likelihood: very_low/low/moderate/high/very_high
- Overall score: 0-100 (be VERY strict: <20 = no chance, 20-40 = very unlikely, 40-60 = possible but needs work, 60-80 = competitive, 80+ = strong candidate)
- Critical weaknesses that would likely cause denial
- Specific, actionable recommendations with priority order
- Next steps with timeline

BE HONEST AND STRICT. A typical skilled professional should score 15-30. Only truly extraordinary individuals should score 70+.

Return your analysis as a JSON object with this exact structure:
{
  "o1aCriteria": [
    {
      "criteriaName": "Major Awards or Prizes",
      "officialDescription": "Receipt of nationally or internationally recognized prizes...",
      "evidenceFound": ["list specific evidence or empty array"],
      "evidenceQuality": "none|weak|moderate|strong|exceptional",
      "score": 0-100,
      "specificGaps": ["what's missing"],
      "recommendations": ["specific actions to take"]
    }
    // ... repeat for all 8 criteria
  ],
  "criteriaMet": 0-8,
  "yearsOfExperience": number,
  "educationLevel": "high_school|bachelor|master|phd",
  "fieldOfExpertise": "specific field",
  "languageProficiency": "a1|a2|b1|b2|c1|c2",
  "hasNationalInternationalRecognition": boolean,
  "hasAwardsOrPrizes": boolean,
  "hasPublishedWork": boolean,
  "hasJudgedOthersWork": boolean,
  "hasPressCoverage": boolean,
  "hasOriginalContributions": boolean,
  "hasLeadershipRoles": boolean,
  "hasHighCompensation": boolean,
  "overallScore": 0-100,
  "approvalLikelihood": "very_low|low|moderate|high|very_high",
  "strengths": ["specific strengths"],
  "criticalWeaknesses": ["specific critical issues"],
  "specificRecommendations": ["detailed, prioritized recommendations"],
  "nextSteps": ["concrete actions with timeline"],
  "documentQuality": "poor|fair|good|excellent",
  "documentQualityNotes": "assessment of documentation provided"
}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Use GPT-4 for better analysis
      messages: [
        {
          role: 'system',
          content: 'You are an expert immigration attorney specializing in O-1A visas. You provide strict, realistic evaluations based on official USCIS criteria. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual analysis
      response_format: { type: 'json_object' }
    });

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(analysisText) as AIProfileAnalysis;

    // Validate the response has required fields
    if (!analysis.o1aCriteria || !Array.isArray(analysis.o1aCriteria)) {
      throw new Error('Invalid analysis structure returned from AI');
    }

    return analysis;

  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate specific, personalized recommendations based on profile gaps
 */
export async function generatePersonalizedRecommendations(
  analysis: AIProfileAnalysis,
  visaType: string,
  targetField: string
): Promise<{
  priorityActions: Array<{ priority: number; action: string; timeline: string; impact: string }>;
  longTermStrategy: string;
  resourceLinks: string[];
}> {

  const prompt = `Based on this O-1A visa application analysis, generate a detailed action plan.

ANALYSIS SUMMARY:
- Criteria Met: ${analysis.criteriaMet}/8 (need 3+)
- Overall Score: ${analysis.overallScore}/100
- Field: ${targetField}
- Critical Weaknesses: ${analysis.criticalWeaknesses.join('; ')}

WEAK CRITERIA:
${analysis.o1aCriteria
  .filter(c => c.score < 60)
  .map(c => `- ${c.criteriaName}: ${c.score}/100. Gaps: ${c.specificGaps.join(', ')}`)
  .join('\n')}

Generate a detailed action plan with:
1. Priority Actions: 5-10 specific, actionable items ranked by priority (1=highest)
   - For each: timeline (e.g., "1-3 months"), expected impact (high/medium/low)
2. Long-term strategy: 2-3 paragraph roadmap for becoming O-1A eligible
3. Resource links: Official USCIS pages, professional associations, relevant resources

Return as JSON:
{
  "priorityActions": [
    {
      "priority": 1,
      "action": "specific action",
      "timeline": "timeframe",
      "impact": "high|medium|low"
    }
  ],
  "longTermStrategy": "detailed strategy",
  "resourceLinks": ["url1", "url2"]
}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an immigration strategy advisor. Provide specific, actionable recommendations based on official USCIS requirements.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);

  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Return fallback recommendations
    return {
      priorityActions: [
        {
          priority: 1,
          action: 'Consult with an immigration attorney for personalized guidance',
          timeline: 'Immediate',
          impact: 'high'
        }
      ],
      longTermStrategy: 'Focus on building strong evidence for O-1A criteria. Document all achievements and obtain letters of recommendation.',
      resourceLinks: ['https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement']
    };
  }
}
