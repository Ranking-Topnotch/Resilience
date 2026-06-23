import { Request, Response, NextFunction } from 'express';

export class BusinessError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof BusinessError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.errorCode
    });
    return;
  }

  // Handle standard framework or structural parsing errors (HTTP 400 validation failures)
  if (err.name === 'ValidationError' || err.status === 400) {
     res.status(400).json({
      status: 'error',
      message: err.message || 'Validation failed'
    });
     return;
  }

  // Fallback for unexpected server exceptions
  console.error('Unexpected Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'An internal server error occurred.'
  });
};