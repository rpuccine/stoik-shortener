/**
 * Represents a persisted URL record.
 */
export interface UrlRecord {
  id: number;
  slug: string;
  originalUrl: string;
  createdAt: Date;
  hits: number;
  expiresAt: Date | null;
}

/**
 * Abstraction over URL storage. Enables multiple backends (SQLite, memory, etc.).
 */
export interface IUrlRepository {
  findBySlug(slug: string): Promise<UrlRecord | null>;
  findByOriginal(originalUrl: string): Promise<UrlRecord | null>;
  createUnique(slug: string, originalUrl: string, expiresAt?: Date | null): Promise<UrlRecord>;
  incrementHits(slug: string): Promise<void>;
  stats(slug: string): Promise<Pick<UrlRecord, 'originalUrl' | 'createdAt' | 'hits' | 'expiresAt'> | null>;
}
