import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryUrlRepository } from '../src/repositories/InMemoryUrlRepository';

function makeApp() {
  return createApp(new InMemoryUrlRepository());
}

describe('API', () => {
  it('POST /api/shorten creates a short link', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    expect(res.status).toBe(201);
    expect(res.body.short_url).toBeDefined();
    expect(res.body.short_link).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//);
  });

  it('POST /api/shorten invalid input -> 400', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/shorten').send({ url: 'foo' });
    expect(res.status).toBe(400);
  });

  it('GET /:slug redirects (302)', async () => {
    const app = makeApp();
    const a = await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    const slug = a.body.short_url;
    const r = await request(app).get(`/${slug}`);
    expect(r.status).toBe(302);
    expect(r.headers.location).toBe('https://example.com/');
  });

  it('GET /api/stats/:slug returns stats', async () => {
    const app = makeApp();
    const a = await request(app).post('/api/shorten').send({ url: 'https://example.com' });
    const slug = a.body.short_url;
    await request(app).get(`/${slug}`);
    const st = await request(app).get(`/api/stats/${slug}`);
    expect(st.status).toBe(200);
    expect(st.body.hits).toBe(1);
  });
});
