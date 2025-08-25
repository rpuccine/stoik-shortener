import { IUrlRepository, UrlRecord } from './IUrlRepository';

let autoId = 1;

/**
 * In-memory implementation for testing or local development.
 */
export class InMemoryUrlRepository implements IUrlRepository {
  private store = new Map<string, UrlRecord>(); // by slug
  private byOriginal = new Map<string, UrlRecord>();

  async findBySlug(slug: string): Promise<UrlRecord | null> {
    return this.store.get(slug) ?? null;
  }
  async findByOriginal(originalUrl: string): Promise<UrlRecord | null> {
    return this.byOriginal.get(originalUrl) ?? null;
  }
  async createUnique(slug: string, originalUrl: string, expiresAt?: Date | null): Promise<UrlRecord> {
    if (this.store.has(slug) || this.byOriginal.has(originalUrl)) {
      const e: any = new Error('Unique constraint failed');
      e.code = 'SQLITE_CONSTRAINT';
      throw e;
    }
    const rec: UrlRecord = {
      id: autoId++,
      slug,
      originalUrl,
      createdAt: new Date(),
      hits: 0,
      expiresAt: expiresAt ?? null
    };
    this.store.set(slug, rec);
    this.byOriginal.set(originalUrl, rec);
    return rec;
  }
  async incrementHits(slug: string): Promise<void> {
    const r = this.store.get(slug);
    if (r) r.hits += 1;
  }
  async stats(slug: string) {
    const r = this.store.get(slug);
    if (!r) return null;
    return { originalUrl: r.originalUrl, createdAt: r.createdAt, hits: r.hits, expiresAt: r.expiresAt };
  }
}
