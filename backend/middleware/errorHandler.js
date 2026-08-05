/**
 * errorHandler.js - Standardized API Error Response DTO Middleware
 * Formats all uncaught errors into OpenTelemetry-compatible JSON structures.
 */

export const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  const errorResponse = {
    code: errorCode,
    message: err.message || 'An unexpected internal error occurred',
    requestId: req.headers['x-request-id'] || `req-${Date.now()}`,
    correlationId: req.correlationId || 'CID-UNKNOWN',
    traceId: req.headers['x-trace-id'] || `trace-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    details: err.details || []
  };

  res.status(statusCode).json(errorResponse);
};
