# URL Shortener — Backend (Node 22.18, TypeScript, SQLite)

**Stack:** Express + TypeScript + SQLite (better-sqlite3) + Zod + Helmet + Rate limiting.  
**Features:** shorten, redirect, idempotency, slug collision retries, expiration, stats, tests.

## Quickstart

```bash
cp .env.example .env         # customize if needed
npm install
npm start                    # dev mode (ts-node-dev)
# or: npm run build && npm run start:prod
```

- API: `http://localhost:${PORT:-3000}`
- Endpoints:
  - `POST /api/shorten` body `{ url, expiresInDays? }`
  - `GET /:slug` → 302/410/404
  - `GET /api/stats/:slug`

SQLite file path: `DB_FILE` (default `./data/url.db`). The schema is created automatically on boot.
