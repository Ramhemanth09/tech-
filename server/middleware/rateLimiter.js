import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/responseHelper.js';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: (req, res) => errorResponse(res, 'Too many requests, please try again later.', 429),
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: (req, res) => errorResponse(res, 'Too many authentication attempts, please try again in 15 minutes.', 429),
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: (req, res) => errorResponse(res, 'Contact rate limit exceeded. Please wait a few moments before sending more inquiries.', 429),
  standardHeaders: true,
  legacyHeaders: false,
});
