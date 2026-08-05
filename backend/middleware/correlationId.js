/**
 * correlationId.js - Correlation ID Trajectory Propagation Middleware
 * Assigns or propagates X-Correlation-ID (CID-xxxxxx) across all incoming requests.
 */

export const correlationIdMiddleware = (req, res, next) => {
  const incomingCid = req.headers['x-correlation-id'];
  const cid = incomingCid || `CID-${Math.floor(100000 + Math.random() * 900000)}`;
  
  req.correlationId = cid;
  res.setHeader('X-Correlation-ID', cid);
  next();
};
