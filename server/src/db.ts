import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config';

const dir = path.dirname(config.dbFile);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(config.dbFile);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  hits INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NULL
);
CREATE INDEX IF NOT EXISTS idx_slug ON urls(slug);
CREATE INDEX IF NOT EXISTS idx_original_url ON urls(original_url);
`);
