import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import 'dotenv/config';

const DB_PATH = process.env.DATABASE_URL || './data/signaldigest.db';
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan TEXT DEFAULT 'starter',
      slack_webhook TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      active INTEGER DEFAULT 0,
      trial_ends_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS competitors (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      pricing_url TEXT,
      changelog_url TEXT,
      jobs_url TEXT,
      domain TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS scrapes (
      id TEXT PRIMARY KEY,
      competitor_id TEXT NOT NULL,
      source_type TEXT NOT NULL, -- 'pricing' | 'changelog' | 'jobs' | 'news'
      content_hash TEXT NOT NULL,
      raw_content TEXT NOT NULL,
      scraped_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (competitor_id) REFERENCES competitors(id)
    );

    CREATE TABLE IF NOT EXISTS changes (
      id TEXT PRIMARY KEY,
      competitor_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      diff_summary TEXT NOT NULL,    -- raw diff or new content
      is_signal INTEGER,             -- classifier output: 1 = signal, 0 = noise
      importance INTEGER,            -- 1–5 scale from classifier
      classifier_reason TEXT,
      detected_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (competitor_id) REFERENCES competitors(id)
    );

    CREATE TABLE IF NOT EXISTS digests (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      content TEXT NOT NULL,         -- markdown digest
      change_ids TEXT NOT NULL,      -- JSON array of included change ids
      sent_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      change_id TEXT NOT NULL,
      vote INTEGER NOT NULL,         -- 1 = up, -1 = down
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (change_id) REFERENCES changes(id)
    );

    CREATE INDEX IF NOT EXISTS idx_competitors_customer ON competitors(customer_id);
    CREATE INDEX IF NOT EXISTS idx_changes_competitor ON changes(competitor_id);
    CREATE INDEX IF NOT EXISTS idx_changes_detected ON changes(detected_at);
    CREATE INDEX IF NOT EXISTS idx_scrapes_competitor_source ON scrapes(competitor_id, source_type);
  `);

  // Migrations: add columns that may not exist in older DBs
  try { db.exec(`ALTER TABLE customers ADD COLUMN trial_ends_at INTEGER`); } catch {}

  console.log('✓ Schema initialized at', DB_PATH);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initSchema();
}
