/**
 * run-scrape.ts — scrape one competitor (OpenAI) and classify all changes.
 * Usage: npm run scrape
 *
 * Demo scenario: "I'm Anthropic — what's OpenAI doing this week?"
 */
import { randomUUID } from 'crypto';
import { db, initSchema } from '../db/init.js';
import { scrapePage, scrapeJobs, scrapeNews } from '../scrapers/apify.js';
import { classify } from '../intelligence/classifier.js';
import 'dotenv/config';

initSchema();

const CUSTOMER_ID = 'demo-customer-001';
const CUSTOMER_EMAIL = 'dkiran760@gmail.com';

// Upsert demo customer (Anthropic)
db.prepare(`
  INSERT INTO customers (id, email, plan, active)
  VALUES (?, ?, 'starter', 1)
  ON CONFLICT(email) DO UPDATE SET active = 1
`).run(CUSTOMER_ID, CUSTOMER_EMAIL);

// Upsert OpenAI as the competitor to track
const COMP_ID = 'comp-openai';
db.prepare(`
  INSERT INTO competitors (id, customer_id, name, pricing_url, changelog_url, jobs_url, domain)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO NOTHING
`).run(
  COMP_ID,
  CUSTOMER_ID,
  'OpenAI',
  'https://openai.com/api/pricing',
  'https://openai.com/news',
  null,
  'openai.com'
);

console.log('🔍 SignalDigest — scraping OpenAI for Anthropic...\n');

const sources: Array<() => Promise<any>> = [
  () => scrapePage('https://openai.com/api/pricing', 'pricing'),
  () => scrapePage('https://openai.com/news', 'changelog'),
  () => scrapeJobs('OpenAI'),
  () => scrapeNews('OpenAI'),
];

const sourceLabels = ['pricing', 'changelog', 'jobs', 'news'];
let signalCount = 0;
let noiseCount = 0;

for (let i = 0; i < sources.length; i++) {
  const label = sourceLabels[i];
  console.log(`  Scraping ${label}...`);

  try {
    const scrape = await sources[i]();

    // Compare with last scrape
    const last = db.prepare(`
      SELECT * FROM scrapes
      WHERE competitor_id = ? AND source_type = ?
      ORDER BY scraped_at DESC LIMIT 1
    `).get(COMP_ID, scrape.source_type) as any;

    // Store scrape
    db.prepare(`
      INSERT INTO scrapes (id, competitor_id, source_type, content_hash, raw_content)
      VALUES (?, ?, ?, ?, ?)
    `).run(randomUUID(), COMP_ID, scrape.source_type, scrape.content_hash, scrape.content);

    if (last && last.content_hash === scrape.content_hash) {
      console.log(`    → no change detected\n`);
      continue;
    }

    const diff = last
      ? `PREVIOUS:\n${last.raw_content.slice(0, 1500)}\n\nNEW:\n${scrape.content.slice(0, 1500)}`
      : scrape.content.slice(0, 3000);

    console.log(`    → change detected, classifying...`);

    const result = await classify({
      competitor_name: 'OpenAI',
      source_type: scrape.source_type,
      diff,
      customer_preferences: 'AI API pricing, model releases, enterprise strategy',
    });

    db.prepare(`
      INSERT INTO changes (id, competitor_id, source_type, diff_summary, is_signal, importance, classifier_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      COMP_ID,
      scrape.source_type,
      result.headline,
      result.is_signal ? 1 : 0,
      result.importance,
      result.category
    );

    if (result.is_signal) {
      signalCount++;
      console.log(`    ✓ SIGNAL [${result.importance}/5] ${result.headline}`);
    } else {
      noiseCount++;
      console.log(`    – noise: ${result.reason}`);
    }
    console.log();
  } catch (err: any) {
    console.error(`    ✗ ${label} failed: ${err.message}\n`);
  }
}

console.log(`\n✓ Scrape complete`);
console.log(`  Signals: ${signalCount}`);
console.log(`  Noise:   ${noiseCount}`);
console.log(`\nRun 'npm run digest' to synthesize and send the digest.`);
