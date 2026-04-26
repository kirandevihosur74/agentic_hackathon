/**
 * run-digest.ts — synthesize signals into a digest and email it.
 * Usage: npm run digest
 *
 * Reads all undigested signals for demo customer, calls TokenRouter strong
 * model to write the digest, emails to dkiran760@gmail.com.
 */
import { randomUUID } from 'crypto';
import { db, initSchema } from '../db/init.js';
import { synthesize, type DigestSignal } from '../intelligence/synthesizer.js';
import { sendDigest } from '../delivery/email.js';
import 'dotenv/config';

initSchema();

const CUSTOMER_ID = 'demo-customer-001';
const CUSTOMER_EMAIL = 'dkiran760@gmail.com';

// Load all signals not yet included in a digest
const signals = db.prepare(`
  SELECT ch.id, ch.diff_summary, ch.source_type, ch.classifier_reason, ch.importance,
         comp.name as competitor_name
  FROM changes ch
  JOIN competitors comp ON ch.competitor_id = comp.id
  WHERE comp.customer_id = ?
    AND ch.is_signal = 1
    AND ch.importance >= 2
    AND ch.id NOT IN (
      SELECT json_each.value FROM digests, json_each(digests.change_ids)
      WHERE digests.customer_id = ?
    )
  ORDER BY ch.importance DESC
  LIMIT 7
`).all(CUSTOMER_ID, CUSTOMER_ID) as any[];

if (signals.length === 0) {
  console.log('No new signals to digest. Run npm run scrape first.');
  process.exit(0);
}

console.log(`Found ${signals.length} signals to synthesize...\n`);
signals.forEach((s: any) => {
  console.log(`  [${s.importance}/5] ${s.competitor_name} (${s.source_type}) — ${s.diff_summary}`);
});
console.log();

const digestSignals: DigestSignal[] = signals.map((s: any) => ({
  competitor_name: s.competitor_name,
  source_type: s.source_type,
  category: s.classifier_reason,
  headline: s.diff_summary,
  importance: s.importance,
  detail: s.diff_summary,
  detected_at: Date.now(),
}));

const weekLabel = new Date().toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric'
});

console.log('Synthesizing digest via TokenRouter (strong model)...');

const markdown = await synthesize({
  customer_email: CUSTOMER_EMAIL,
  signals: digestSignals,
  week_label: weekLabel,
  customer_focus: 'AI API pricing, model releases, enterprise strategy, developer tools',
});

const digest_id = randomUUID();
db.prepare(`
  INSERT INTO digests (id, customer_id, content, change_ids, sent_at)
  VALUES (?, ?, ?, ?, ?)
`).run(
  digest_id,
  CUSTOMER_ID,
  markdown,
  JSON.stringify(signals.map((s: any) => s.id)),
  Math.floor(Date.now() / 1000)
);

console.log('Sending email...');
await sendDigest(CUSTOMER_EMAIL, `Your Weekly Signal — ${weekLabel}`, markdown, digest_id);

console.log(`\n✓ Digest sent to ${CUSTOMER_EMAIL}`);
console.log('\n── Digest Preview ────────────────────────────────\n');
console.log(markdown);
