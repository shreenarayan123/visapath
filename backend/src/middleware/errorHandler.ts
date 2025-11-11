import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  // reference next to avoid TS6133 unused parameter error when running ts-node
  void next;
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        statusCode: 422,
        message: 'Validation failed',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      error: {
        statusCode: 422,
        message: 'Validation failed',
        details: err.message
      }
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        message: 'Invalid ID format',
        details: err.message
      }
    });
    return;
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    const message = err.message === 'File too large'
      ? 'File size exceeds maximum limit (10MB)'
      : err.message;

    res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        message: 'File upload error',
        details: message
      }
    });
    return;
  }

  // Handle custom ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        statusCode: err.statusCode,
        message: err.message,
        ...(err.details && { details: err.details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
    return;
  }

  // Handle unknown errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
};
