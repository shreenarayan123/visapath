import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { VisaType } from '../models/VisaType';
import { logger } from '../utils/logger';

dotenv.config();

const visaTypesData = [
  // United States
  {
    countryCode: 'US',
    countryName: 'United States',
    visaTypeId: 'o1a',
    visaName: 'O-1A Visa',
    description: 'For individuals with extraordinary ability in sciences, education, business, or athletics',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'Professional CV/Resume' },
      { documentType: 'education', isRequired: true, description: 'Diplomas, transcripts, certifications' },
      { documentType: 'experience', isRequired: true, description: 'Employment letters, awards, publications' },
      { documentType: 'personal_statement', isRequired: true, description: 'Letter explaining extraordinary achievements' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 5,
      minEducationLevel: 'bachelor',
      specializations: ['science', 'education', 'business', 'athletics', 'technology'],
      languageRequirement: 'b2'
    },
    scoringWeights: { experience: 30, education: 25, specialization: 20, language: 15, documentQuality: 10 },
    maxScoreCap: 85,
    processingTimeWeeks: 12,
    successRatePercent: 45,
    officialLink: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement'
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    visaTypeId: 'h1b',
    visaName: 'H-1B Visa',
    description: 'For specialty occupations requiring theoretical or technical expertise',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'Professional CV/Resume' },
      { documentType: 'education', isRequired: true, description: 'Bachelor\'s degree or higher' },
      { documentType: 'experience', isRequired: false, description: 'Employment verification letters' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 2,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'engineering', 'medicine', 'mathematics', 'science'],
      languageRequirement: 'b1'
    },
    scoringWeights: { experience: 25, education: 30, specialization: 25, language: 10, documentQuality: 10 },
    maxScoreCap: 80,
    processingTimeWeeks: 16,
    successRatePercent: 35,
    officialLink: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations'
  },

  // United Kingdom
  {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    visaTypeId: 'tier2',
    visaName: 'Skilled Worker Visa (Tier 2)',
    description: 'For skilled workers with a job offer from a UK employer',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'CV with employment history' },
      { documentType: 'education', isRequired: true, description: 'Degree certificates' },
      { documentType: 'language_certificate', isRequired: true, description: 'English language test certificate' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 3,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'healthcare', 'engineering', 'education'],
      languageRequirement: 'b1',
      minimumSalary: 25600
    },
    scoringWeights: { experience: 28, education: 25, specialization: 22, language: 15, documentQuality: 10 },
    maxScoreCap: 82,
    processingTimeWeeks: 8,
    successRatePercent: 65,
    officialLink: 'https://www.gov.uk/skilled-worker-visa'
  },

  // Canada
  {
    countryCode: 'CA',
    countryName: 'Canada',
    visaTypeId: 'express_entry',
    visaName: 'Express Entry (Federal Skilled Worker)',
    description: 'Points-based system for skilled workers to immigrate to Canada',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'Work experience documentation' },
      { documentType: 'education', isRequired: true, description: 'Educational Credential Assessment (ECA)' },
      { documentType: 'language_certificate', isRequired: true, description: 'IELTS or CELPIP results' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 1,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'healthcare', 'engineering', 'skilled_trades'],
      languageRequirement: 'b2'
    },
    scoringWeights: { experience: 30, education: 28, specialization: 17, language: 18, documentQuality: 7 },
    maxScoreCap: 88,
    processingTimeWeeks: 24,
    successRatePercent: 70,
    officialLink: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html'
  },

  // Germany
  {
    countryCode: 'DE',
    countryName: 'Germany',
    visaTypeId: 'eu_blue_card',
    visaName: 'EU Blue Card',
    description: 'For highly qualified non-EU workers',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'Professional CV' },
      { documentType: 'education', isRequired: true, description: 'University degree' },
      { documentType: 'experience', isRequired: true, description: 'Employment contract' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 3,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'engineering', 'science', 'medicine'],
      languageRequirement: 'a1',
      minimumSalary: 43800
    },
    scoringWeights: { experience: 27, education: 28, specialization: 25, language: 12, documentQuality: 8 },
    maxScoreCap: 86,
    processingTimeWeeks: 12,
    successRatePercent: 72,
    officialLink: 'https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card'
  },

  // Australia
  {
    countryCode: 'AU',
    countryName: 'Australia',
    visaTypeId: 'skilled_independent',
    visaName: 'Skilled Independent Visa (Subclass 189)',
    description: 'Points-based visa for skilled workers without employer sponsorship',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'Skills assessment' },
      { documentType: 'education', isRequired: true, description: 'Qualifications and credentials' },
      { documentType: 'language_certificate', isRequired: true, description: 'IELTS or equivalent' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 3,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'healthcare', 'engineering', 'education'],
      languageRequirement: 'b2'
    },
    scoringWeights: { experience: 30, education: 26, specialization: 20, language: 16, documentQuality: 8 },
    maxScoreCap: 85,
    processingTimeWeeks: 20,
    successRatePercent: 60,
    officialLink: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189'
  },

  // Ireland
  {
    countryCode: 'IE',
    countryName: 'Ireland',
    visaTypeId: 'critical_skills',
    visaName: 'Critical Skills Employment Permit',
    description: 'For highly skilled workers in strategic sectors',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'CV and employment history' },
      { documentType: 'education', isRequired: true, description: 'Degree certificates' },
      { documentType: 'experience', isRequired: true, description: 'Job offer letter' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 2,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'healthcare', 'engineering', 'science'],
      languageRequirement: 'b1',
      minimumSalary: 32000
    },
    scoringWeights: { experience: 26, education: 27, specialization: 24, language: 14, documentQuality: 9 },
    maxScoreCap: 83,
    processingTimeWeeks: 10,
    successRatePercent: 68,
    officialLink: 'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/'
  },

  // France
  {
    countryCode: 'FR',
    countryName: 'France',
    visaTypeId: 'talent_passport',
    visaName: 'Talent Passport',
    description: 'For highly qualified professionals, investors, and researchers',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'Professional portfolio' },
      { documentType: 'education', isRequired: true, description: 'Diplomas and qualifications' },
      { documentType: 'experience', isRequired: true, description: 'Employment contract or project details' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 5,
      minEducationLevel: 'master',
      specializations: ['technology', 'research', 'business', 'arts'],
      languageRequirement: 'a2',
      minimumSalary: 53836
    },
    scoringWeights: { experience: 28, education: 30, specialization: 22, language: 12, documentQuality: 8 },
    maxScoreCap: 84,
    processingTimeWeeks: 14,
    successRatePercent: 58,
    officialLink: 'https://www.service-public.fr/particuliers/vosdroits/F16922'
  },

  // Netherlands
  {
    countryCode: 'NL',
    countryName: 'Netherlands',
    visaTypeId: 'highly_skilled_migrant',
    visaName: 'Highly Skilled Migrant Visa',
    description: 'For knowledge workers with a job offer from a recognized sponsor',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'CV and credentials' },
      { documentType: 'education', isRequired: true, description: 'Educational certificates' },
      { documentType: 'experience', isRequired: true, description: 'Employment contract' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 2,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'engineering', 'research', 'business'],
      languageRequirement: 'b1',
      minimumSalary: 38961
    },
    scoringWeights: { experience: 25, education: 28, specialization: 23, language: 15, documentQuality: 9 },
    maxScoreCap: 82,
    processingTimeWeeks: 10,
    successRatePercent: 75,
    officialLink: 'https://ind.nl/en/work/working_in_the_Netherlands/pages/highly-skilled-migrant.aspx'
  },

  // Poland
  {
    countryCode: 'PL',
    countryName: 'Poland',
    visaTypeId: 'work_permit',
    visaName: 'Work Permit (Type A)',
    description: 'For foreign workers with a job offer in Poland',
    requiredDocuments: [
      { documentType: 'resume', isRequired: true, description: 'CV and work history' },
      { documentType: 'education', isRequired: true, description: 'Educational documents' },
      { documentType: 'experience', isRequired: false, description: 'Employment agreement' }
    ],
    eligibilityCriteria: {
      minExperienceYears: 1,
      minEducationLevel: 'bachelor',
      specializations: ['technology', 'manufacturing', 'services', 'education'],
      languageRequirement: 'a2'
    },
    scoringWeights: { experience: 24, education: 26, specialization: 20, language: 18, documentQuality: 12 },
    maxScoreCap: 78,
    processingTimeWeeks: 8,
    successRatePercent: 80,
    officialLink: 'https://www.gov.pl/web/gov/apply-for-a-work-permit-in-poland'
  }
];

const seedVisaTypes = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/visa_evaluation';
    await mongoose.connect(mongoUri);

    logger.info('Connected to MongoDB');

    // Clear existing visa types
    await VisaType.deleteMany({});
    logger.info('Cleared existing visa types');

    // Insert new visa types
    const inserted = await VisaType.insertMany(visaTypesData);
    logger.info(`Inserted ${inserted.length} visa types`);

    // Display summary
    const summary = inserted.reduce((acc, visa) => {
      acc[visa.countryCode] = (acc[visa.countryCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Visa Types Summary:');
    Object.entries(summary).forEach(([code, count]) => {
      const countryName = inserted.find(v => v.countryCode === code)?.countryName;
      console.log(`   ${code} (${countryName}): ${count} visa type(s)`);
    });

    console.log(`\n✅ Successfully seeded ${inserted.length} visa types!\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seedVisaTypes();
