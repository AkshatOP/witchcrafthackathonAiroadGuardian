import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.path });

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  return errorResponse(res, code, message, statusCode);
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
};
