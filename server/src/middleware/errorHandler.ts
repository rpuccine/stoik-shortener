import { NextFunction, Request, Response } from 'express';
import { config } from '../config';

/** Centralized error handler that avoids leaking details in production. */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const isProd = config.nodeEnv === 'production';
  if (!isProd) {
    // eslint-disable-next-line no-console
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
  }

  // Gestion des erreurs de validation Zod
  if (err && err.name === 'ZodError') {
    return res.status(400).json({ 
      error: 'Validation error',
      details: err.issues?.[0]?.message || 'Invalid input' 
    });
  }

  // Gestion des erreurs de base de données SQLite
  if (err && err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({ 
      error: 'Database error',
      details: 'An error occurred while accessing the database'
    });
  }

  // Gestion des erreurs génériques
  return res.status(500).json({ 
    error: 'Internal Server Error',
    details: isProd ? 'Something went wrong' : err.message
  });
}
