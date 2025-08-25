import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { IUrlRepository } from '../repositories/IUrlRepository';

/**
 * Zod schema for input validation (defense-in-depth).
 * Only http/https protocols are allowed; length capped to avoid abuse.
 */
const shortenInputSchema = z.object({
  url: z.string().trim().max(2048).url().refine(u => u.startsWith('http://') || u.startsWith('https://'), 'Only http/https are allowed'),
  expiresInDays: z.number().int().min(0).max(3650).optional(),
});

export type ShortenInput = z.infer<typeof shortenInputSchema>;

/**
 * Application service responsible for URL shortening, resolution, and stats.
 *
 * Encapsulates validation, normalization, idempotency, and expiration logic
 * while delegating persistence to an `IUrlRepository` implementation.
 */
export class UrlService {
  private alphaNumSlug = customAlphabet(alphanumeric, 6);

  constructor(private readonly repo: IUrlRepository) {}

  /**
   * Creates or reuses a shortened URL for the provided input.
   * Returns an existing record if the original URL already exists (idempotent).
   */
  async shorten(input: unknown) {
    const { url, expiresInDays } = shortenInputSchema.parse(input);

    const normalized = this.normalizeUrl(url);

    // Idempotency
    const existing = await this.repo.findByOriginal(normalized);
    if (existing) return existing;

    const now = new Date();
    const expiresAt =
      expiresInDays === undefined
        ? null
        : (expiresInDays === 0
          ? now
          : this.addDays(now, expiresInDays));

    let attempts = 0;
    while (attempts < 5) {
      try {
        const slug = this.alphaNumSlug();
        const created = await this.repo.createUnique(slug, normalized, expiresAt);
        return created;
      } catch (err: any) {
        if (err && err.code === 'SQLITE_CONSTRAINT') {
          attempts += 1;
          continue;
        }
        throw err;
      }
    }
    throw new Error('Failed to generate a unique slug after several attempts');
  }

  /**
   * Resolves a slug to its target URL and increments hit counter if not expired.
   */
  async resolve(slug: string): Promise<{ target: string; expired: boolean } | null> {
    const rec = await this.repo.findBySlug(slug);
    if (!rec) return null;
    const expired = !!(rec.expiresAt && rec.expiresAt.getTime() <= Date.now());
    if (!expired) {
      await this.repo.incrementHits(slug);
    }
    return { target: rec.originalUrl, expired };
  }

  /** Returns statistics for a given slug or null if not found. */
  async stats(slug: string) {
    return this.repo.stats(slug);
  }

  /** Normalizes a URL to ensure consistent storage and idempotency checks. */
  private normalizeUrl(input: string): string {
    const u = new URL(input);
    u.hostname = u.hostname.toLowerCase();
    if (u.port === '80' && u.protocol === 'http:') u.port = '';
    if (u.port === '443' && u.protocol === 'https:') u.port = '';
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  }

  /** Returns a new Date offset by the provided number of days. */
  private addDays(d: Date, days: number) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
  }
}
