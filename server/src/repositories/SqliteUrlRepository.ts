import { db } from '../db';
import { IUrlRepository, UrlRecord } from './IUrlRepository';

/**
 * SQLite implementation of `IUrlRepository` using better-sqlite3 prepared statements.
 */
export class SqliteUrlRepository implements IUrlRepository {
  private findBySlugStmt = db.prepare(`SELECT id, slug, original_url, created_at, hits, expires_at FROM urls WHERE slug = ?`);
  private findByOriginalStmt = db.prepare(`SELECT id, slug, original_url, created_at, hits, expires_at FROM urls WHERE original_url = ?`);
  private insertStmt = db.prepare(`INSERT INTO urls (slug, original_url, expires_at) VALUES (?, ?, ?)`);
  private incHitsStmt = db.prepare(`UPDATE urls SET hits = hits + 1 WHERE slug = ?`);
  private statsStmt = db.prepare(`SELECT original_url, created_at, hits, expires_at FROM urls WHERE slug = ?`);

  /** Returns a record by slug or null if not found. */
  async findBySlug(slug: string): Promise<UrlRecord | null> {
    const r = this.findBySlugStmt.get(slug);
    return r ? this.toRecord(r) : null;
  }

  /** Returns a record by original URL or null if not found. */
  async findByOriginal(originalUrl: string): Promise<UrlRecord | null> {
    const r = this.findByOriginalStmt.get(originalUrl);
    return r ? this.toRecord(r) : null;
  }

  /** Inserts a new unique record; throws if slug/original already exist. */
  async createUnique(slug: string, originalUrl: string, expiresAt?: Date | null): Promise<UrlRecord> {
    try {
      this.insertStmt.run(slug, originalUrl, expiresAt ? expiresAt.toISOString() : null);
      const created = this.findBySlugStmt.get(slug);
      return this.toRecord(created);
    } catch (err: any) {
      if (String(err.code || '').startsWith('SQLITE_CONSTRAINT')) {
        const e: any = new Error('Unique constraint failed');
        e.code = 'SQLITE_CONSTRAINT';
        throw e;
      }
      throw err;
    }
  }

  /** Atomically increments hit counter for a slug. */
  async incrementHits(slug: string): Promise<void> {
    this.incHitsStmt.run(slug);
  }

  /** Retrieves lightweight stats for a slug. */
  async stats(slug: string): Promise<Pick<UrlRecord, 'originalUrl' | 'createdAt' | 'hits' | 'expiresAt'> | null> {
    const s = this.statsStmt.get(slug);
    if (!s) return null;
    return {
      originalUrl: String((s as any).original_url),
      createdAt: new Date(String((s as any).created_at)),
      hits: Number((s as any).hits),
      expiresAt: (s as any).expires_at ? new Date(String((s as any).expires_at)) : null
    };
  }

  /** Maps a raw SQLite row to a typed `UrlRecord`. */
  private toRecord(row: any): UrlRecord {
    return {
      id: Number(row.id),
      slug: String(row.slug),
      originalUrl: String(row.original_url),
      createdAt: new Date(String(row.created_at)),
      hits: Number(row.hits),
      expiresAt: row.expires_at ? new Date(String(row.expires_at)) : null
    };
  }
}
