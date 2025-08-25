import rateLimit from 'express-rate-limit';
import { config } from '../config';

/** Basic IP rate limiter for API routes. */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMin * 60 * 1000,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
