import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UrlService } from '../services/urlService';

/** Simple async error wrapper to forward rejections to Express error handler. */
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Builds the HTTP API routes for URL shortener operations.
 */
export function buildRoutes(svc: UrlService) {
  const router = Router();

  const slugSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,32}$/);

  router.post('/api/shorten', asyncHandler(async (req: Request, res: Response) => {
    const rec = await svc.shorten(req.body);
    const host = req.get('host');
    const proto = req.protocol;
    const payload = {
      original_url: rec.originalUrl,
      short_url: rec.slug,
      short_link: `${proto}://${host}/${rec.slug}`,
      expires_at: rec.expiresAt ? rec.expiresAt.toISOString() : null
    };
    res.status(201).json(payload);
  }));

  router.get('/api/stats/:slug', asyncHandler(async (req: Request, res: Response) => {
    const slug = slugSchema.parse(req.params.slug);
    const s = await svc.stats(slug);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json({
      original_url: s.originalUrl,
      created_at: s.createdAt.toISOString(),
      hits: s.hits,
      expires_at: s.expiresAt ? s.expiresAt.toISOString() : null
    });
  }));

  router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
    const slug = slugSchema.parse(req.params.slug);
    const r = await svc.resolve(slug);
    if (!r) return res.status(404).send('Not found');
    if (r.expired) return res.status(410).send('Gone');
    return res.redirect(r.target);
  }));

  return router;
}
