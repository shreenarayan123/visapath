import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper function to handle async route handlers
 * Eliminates the need for try-catch in every async route
 */
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
