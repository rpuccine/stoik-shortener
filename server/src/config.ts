import 'dotenv/config';
import { z } from 'zod';

/**
 * Validates and normalizes environment configuration using Zod.
 * This ensures type-safety and early failure on misconfiguration.
 */
const envSchema = z.object({
  PORT: z.string().transform(v => Number(v)).catch(3000).pipe(z.number().int().positive()),
  FRONT_ORIGIN: z.string().url().catch('http://localhost:5173'),
  DB_FILE: z.string().min(1).catch('./data/url.db'),
  RATE_LIMIT_WINDOW_MIN: z.string().transform(v => Number(v)).catch(15).pipe(z.number().int().positive()),
  RATE_LIMIT_MAX: z.string().transform(v => Number(v)).catch(100).pipe(z.number().int().positive()),
  NODE_ENV: z.enum(['development', 'test', 'production']).catch('development')
});

const env = envSchema.parse(process.env);

export const config = {
  /** Port for HTTP server */
  port: env.PORT,
  /** Allowed CORS origin for the frontend */
  frontOrigin: env.FRONT_ORIGIN,
  /** Path to SQLite database file */
  dbFile: env.DB_FILE,
  /** Rate limit window in minutes */
  rateLimitWindowMin: env.RATE_LIMIT_WINDOW_MIN,
  /** Maximum requests per window per IP */
  rateLimitMax: env.RATE_LIMIT_MAX,
  /** Current environment */
  nodeEnv: env.NODE_ENV
};

export type AppConfig = typeof config;
