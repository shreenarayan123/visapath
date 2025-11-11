import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Partner } from '../models/Partner';
import { hashApiKey } from '../utils/crypto';

// Extend Express Request to include partner
declare global {
  namespace Express {
    interface Request {
      partner?: any;
    }
  }
}

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  void res; // reference unused param to avoid TS6133
  try {
    const apiKey = req.headers['x-api-key'] as string;

    // If no API key provided, allow public access
    if (!apiKey) {
      return next();
    }

    // Hash and find partner
    const hashedKey = hashApiKey(apiKey);
    const partner = await Partner.findOne({ apiKey: hashedKey });

    if (!partner) {
      throw ApiError.unauthorized('Invalid API key');
    }

    if (!partner.isActive) {
      throw ApiError.forbidden('Partner account is inactive');
    }

    // Verify CORS origin if configured
    const origin = req.headers['origin'];
    if (partner.allowedOrigins && partner.allowedOrigins.length > 0 && origin) {
      if (!partner.allowedOrigins.includes(origin)) {
        throw ApiError.forbidden('Origin not allowed for this API key');
      }
    }

    // Attach partner to request
    req.partner = partner;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  void res; // reference unused param to avoid TS6133
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw ApiError.unauthorized('API key is required');
    }

    // Hash and find partner
    const hashedKey = hashApiKey(apiKey);
    const partner = await Partner.findOne({ apiKey: hashedKey });

    if (!partner) {
      throw ApiError.unauthorized('Invalid API key');
    }

    if (!partner.isActive) {
      throw ApiError.forbidden('Partner account is inactive');
    }

    // Attach partner to request
    req.partner = partner;

    next();
  } catch (error) {
    next(error);
  }
};
