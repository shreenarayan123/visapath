import { Request, Response } from 'express';
import { VisaType } from '../models/VisaType';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get all countries with their visa types
 * GET /api/countries
 */
export const getAllCountries = asyncHandler(async (req: Request, res: Response) => {
  const visaTypes = await VisaType.find().sort({ countryName: 1, visaName: 1 });

  // Group by country
  const countriesMap = new Map();

  visaTypes.forEach((visa) => {
    if (!countriesMap.has(visa.countryCode)) {
      countriesMap.set(visa.countryCode, {
        countryCode: visa.countryCode,
        countryName: visa.countryName,
        visaTypes: []
      });
    }

    const country = countriesMap.get(visa.countryCode);
    country.visaTypes.push({
      visaTypeId: visa.visaTypeId,
      visaName: visa.visaName,
      description: visa.description,
      requiredDocuments: visa.requiredDocuments,
      minExperienceYears: visa.eligibilityCriteria.minExperienceYears,
      minEducationLevel: visa.eligibilityCriteria.minEducationLevel,
      maxScoreCap: visa.maxScoreCap,
      processingTimeWeeks: visa.processingTimeWeeks,
      successRatePercent: visa.successRatePercent
    });
  });

  const countries = Array.from(countriesMap.values());

  res.status(200).json({
    success: true,
    data: countries,
    count: countries.length
  });
});

/**
 * Get visa types by country
 * GET /api/countries/:countryCode
 */
export const getCountryVisaTypes = asyncHandler(async (req: Request, res: Response) => {
  const { countryCode } = req.params;

  const visaTypes = await VisaType.find({ countryCode: countryCode.toUpperCase() })
    .sort({ visaName: 1 });

  if (visaTypes.length === 0) {
    throw ApiError.notFound('Country not found or no visa types available');
  }

  res.status(200).json({
    success: true,
    data: {
      countryCode: visaTypes[0].countryCode,
      countryName: visaTypes[0].countryName,
      visaTypes: visaTypes.map((visa) => ({
        visaTypeId: visa.visaTypeId,
        visaName: visa.visaName,
        description: visa.description,
        requiredDocuments: visa.requiredDocuments,
        eligibilityCriteria: visa.eligibilityCriteria,
        scoringWeights: visa.scoringWeights,
        maxScoreCap: visa.maxScoreCap,
        processingTimeWeeks: visa.processingTimeWeeks,
        successRatePercent: visa.successRatePercent,
        officialLink: visa.officialLink
      }))
    }
  });
});

/**
 * Get specific visa type details
 * GET /api/countries/:countryCode/visa-types/:visaTypeId
 */
export const getVisaTypeDetails = asyncHandler(async (req: Request, res: Response) => {
  const { countryCode, visaTypeId } = req.params;

  const visaType = await VisaType.findOne({
    countryCode: countryCode.toUpperCase(),
    visaTypeId: visaTypeId.toLowerCase()
  });

  if (!visaType) {
    throw ApiError.notFound('Visa type not found');
  }

  res.status(200).json({
    success: true,
    data: {
      countryCode: visaType.countryCode,
      countryName: visaType.countryName,
      visaTypeId: visaType.visaTypeId,
      visaName: visaType.visaName,
      description: visaType.description,
      requiredDocuments: visaType.requiredDocuments,
      eligibilityCriteria: visaType.eligibilityCriteria,
      scoringWeights: visaType.scoringWeights,
      maxScoreCap: visaType.maxScoreCap,
      processingTimeWeeks: visaType.processingTimeWeeks,
      successRatePercent: visaType.successRatePercent,
      officialLink: visaType.officialLink
    }
  });
});

/**
 * Search visa types
 * GET /api/visa-types/search?q=query
 */
export const searchVisaTypes = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    throw ApiError.badRequest('Search query is required');
  }

  const visaTypes = await VisaType.find({
    $or: [
      { visaName: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { countryName: { $regex: q, $options: 'i' } }
    ]
  }).limit(20);

  res.status(200).json({
    success: true,
    data: visaTypes.map((visa) => ({
      countryCode: visa.countryCode,
      countryName: visa.countryName,
      visaTypeId: visa.visaTypeId,
      visaName: visa.visaName,
      description: visa.description,
      maxScoreCap: visa.maxScoreCap
    })),
    count: visaTypes.length
  });
});
