import crypto from 'crypto';
import { errorResponse } from '../utils/responseHelper.js';
import { config } from '../config/env.js';

export function csrfTokenProvider(req, res, next) {
  if (!req.session) {
    return next();
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  // Expose via response cookie or let client query /api/csrf-token
  res.cookie('XSRF-TOKEN', req.session.csrfToken, {
    httpOnly: false, // Accessible to frontend client to include in headers
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  next();
}

export function csrfProtection(req, res, next) {
  // Safe HTTP methods do not require CSRF check
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Bypass CSRF in testing environment if configured
  if (config.NODE_ENV === 'test' && req.headers['x-bypass-csrf-for-testing']) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'] || req.body?._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!sessionToken || !clientToken || clientToken !== sessionToken) {
    return errorResponse(res, 'Invalid or missing CSRF token', 403);
  }

  next();
}
