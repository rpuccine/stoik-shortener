import { UrlService } from '../src/services/urlService';
import { InMemoryUrlRepository } from '../src/repositories/InMemoryUrlRepository';

describe('UrlService', () => {
  it('rejects invalid URLs', async () => {
    const svc = new UrlService(new InMemoryUrlRepository());
    await expect(svc.shorten({ url: 'ftp://example.com' })).rejects.toThrow();
    await expect(svc.shorten({ url: 'not-a-url' })).rejects.toThrow();
  });

  it('idempotent: same URL returns same slug', async () => {
    const repo = new InMemoryUrlRepository();
    const svc = new UrlService(repo);
    const a = await svc.shorten({ url: 'https://example.com/path' });
    const b = await svc.shorten({ url: 'https://example.com/path/' });
    expect(a.slug).toBe(b.slug);
  });

  it('expiration prevents increment', async () => {
    const repo = new InMemoryUrlRepository();
    const svc = new UrlService(repo);
    const rec = await svc.shorten({ url: 'https://expired.test', expiresInDays: 0 });
    const r = await svc.resolve(rec.slug);
    expect(r?.expired).toBe(true);
    const s = await svc.stats(rec.slug);
    expect(s?.hits).toBe(0);
  });

  it('resolve increments hits', async () => {
    const repo = new InMemoryUrlRepository();
    const svc = new UrlService(repo);
    const rec = await svc.shorten({ url: 'https://count.me' });
    await svc.resolve(rec.slug);
    await svc.resolve(rec.slug);
    const s = await svc.stats(rec.slug);
    expect(s?.hits).toBe(2);
  });
});
