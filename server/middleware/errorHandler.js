import { errorResponse } from '../utils/responseHelper.js';
import { config } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, next) {
  // Safe logging on server side
  console.error('[SERVER ERROR]', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    ...(config.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });

  // Handle common Mongoose / JWT / Validation errors safely
  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Validation Error', 400, err.errors);
  }
  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid resource identifier', 400);
  }
  if (err.code === 11000) {
    return errorResponse(res, 'Duplicate resource key or field value', 409);
  }
  if (err.name === 'CSRFError' || err.code === 'EBADCSRFTOKEN') {
    return errorResponse(res, 'Invalid or missing CSRF token', 403);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && config.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
}
