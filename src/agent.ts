import { db } from './db/init.js';
import { scrapePage, scrapeJobs, scrapeNews } from './scrapers/apify.js';
import { classify } from './intelligence/classifier.js';
import { synthesize, type DigestSignal } from './intelligence/synthesizer.js';
import { getPreferences } from './memory/preferences.js';
import { randomUUID } from 'crypto';

/**
 * The agent loop. This is what runs on a weekly cron.
 *
 * For each customer → for each competitor → scrape all sources →
 * diff against last scrape → classify changes → store signals →
 * synthesize digest → email.
 */
export async function runWeeklyDigestForCustomer(customer_id: string) {
  const customer = db.prepare(`SELECT * FROM customers WHERE id = ? AND active = 1`).get(customer_id) as any;
  if (!customer) {
    console.log(`Customer ${customer_id} not active, skipping`);
    return;
  }

  console.log(`Running weekly digest for ${customer.email}`);

  const competitors = db
    .prepare(`SELECT * FROM competitors WHERE customer_id = ?`)
    .all(customer_id) as any[];

  const customerPrefs = getPreferences(customer.id);

  const allSignals: DigestSignal[] = [];

  for (const comp of competitors) {
    console.log(`  Scraping ${comp.name}...`);

    const scrapeResults = await Promise.allSettled([
      comp.pricing_url && scrapePage(comp.pricing_url, 'pricing'),
      comp.changelog_url && scrapePage(comp.changelog_url, 'changelog'),
      scrapeJobs(comp.name, comp.jobs_url),
      scrapeNews(comp.name),
    ].filter(Boolean) as Promise<any>[]);

    for (const result of scrapeResults) {
      if (result.status !== 'fulfilled') continue;
      const scrape = result.value;

      // Compare with last scrape of same source
      const last = db
        .prepare(
          `SELECT * FROM scrapes WHERE competitor_id = ? AND source_type = ? ORDER BY scraped_at DESC LIMIT 1`
        )
        .get(comp.id, scrape.source_type) as any;

      if (last && last.content_hash === scrape.content_hash) {
        // No change, skip
        continue;
      }

      // Store new scrape
      db.prepare(
        `INSERT INTO scrapes (id, competitor_id, source_type, content_hash, raw_content) VALUES (?, ?, ?, ?, ?)`
      ).run(randomUUID(), comp.id, scrape.source_type, scrape.content_hash, scrape.content);

      // Build a "diff" — for hackathon, we just send the new content;
      // a real impl would compute a proper diff.
      const diff = last
        ? `PREVIOUS:\n${last.raw_content.slice(0, 1500)}\n\nNEW:\n${scrape.content.slice(0, 1500)}`
        : scrape.content.slice(0, 3000);

      // Classify
      const classification = await classify({
        competitor_name: comp.name,
        source_type: scrape.source_type,
        diff,
        customer_preferences: customerPrefs,
      }).catch((e) => {
        console.error('classify error:', e);
        return null;
      });

      if (!classification) continue;

      const change_id = randomUUID();
      db.prepare(
        `INSERT INTO changes (id, competitor_id, source_type, diff_summary, is_signal, importance, classifier_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        change_id,
        comp.id,
        scrape.source_type,
        classification.headline,
        classification.is_signal ? 1 : 0,
        classification.importance,
        classification.reason
      );

      if (classification.is_signal && classification.importance >= 3) {
        allSignals.push({
          competitor_name: comp.name,
          source_type: scrape.source_type,
          category: classification.category,
          headline: classification.headline,
          importance: classification.importance,
          detail: scrape.content.slice(0, 800),
          detected_at: scrape.scraped_at,
        });
      }
    }
  }

  if (allSignals.length === 0) {
    console.log(`No meaningful signals this week for ${customer.email}`);
    return;
  }

  // Synthesize digest
  const weekLabel = formatWeekLabel(new Date());
  const markdown = await synthesize({
    customer_email: customer.email,
    signals: allSignals,
    week_label: weekLabel,
    customer_focus: customerPrefs,
  });

  // Persist — caller decides when/whether to email
  const digest_id = randomUUID();
  db.prepare(
    `INSERT INTO digests (id, customer_id, content, change_ids) VALUES (?, ?, ?, ?)`
  ).run(
    digest_id,
    customer_id,
    markdown,
    JSON.stringify(allSignals.map((_s, i) => i))
  );

  console.log(`✓ Digest ready for ${customer.email} (${allSignals.length} signals)`);
  return digest_id;
}

function formatWeekLabel(d: Date): string {
  const start = new Date(d);
  start.setDate(d.getDate() - 6);
  const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `${fmt(start)}–${fmt(d)}, ${d.getFullYear()}`;
}

export async function runWeeklyDigestForAll() {
  const customers = db.prepare(`SELECT id FROM customers WHERE active = 1`).all() as { id: string }[];
  for (const { id } of customers) {
    try {
      await runWeeklyDigestForCustomer(id);
    } catch (e) {
      console.error(`Failed digest for ${id}:`, e);
    }
  }
}
