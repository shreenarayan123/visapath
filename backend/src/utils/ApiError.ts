export class ApiError extends Error {
  public statusCode: number;
  public details: any;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, details: any = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  // Convenience static methods for common errors
  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: any): ApiError {
    return new ApiError(401, message, details);
  }

  static forbidden(message: string = 'Forbidden', details?: any): ApiError {
    return new ApiError(403, message, details);
  }

  static notFound(message: string = 'Resource not found', details?: any): ApiError {
    return new ApiError(404, message, details);
  }

  static unprocessableEntity(message: string, details?: any): ApiError {
    return new ApiError(422, message, details);
  }

  static internal(message: string = 'Internal server error', details?: any): ApiError {
    return new ApiError(500, message, details, false);
  }
}
