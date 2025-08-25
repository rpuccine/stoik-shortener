import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { buildRoutes } from './routes/urlRoutes';
import { UrlService } from './services/urlService';
import { IUrlRepository } from './repositories/IUrlRepository';

/**
 * Creates and configures an Express application instance.
 */
export function createApp(repo: IUrlRepository) {
  const app = express();

  // Security and parsing middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'same-origin' }
  }));
  app.use(cors({ origin: config.frontOrigin, credentials: true }));
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: false }));

  // Respect upstream reverse proxy headers in non-dev environments
  if (config.nodeEnv !== 'development') {
    app.set('trust proxy', 1);
  }

  app.use('/api', apiLimiter);

  const svc = new UrlService(repo);
  app.use(buildRoutes(svc));

  // Catch-all 404 handler for unrecognized routes
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Centralized error handler (must be last)
  app.use(errorHandler);
  
  return app;
}
