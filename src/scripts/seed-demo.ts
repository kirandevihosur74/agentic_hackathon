/**
 * Demo seed script — inserts realistic competitor data + pre-generates digest.
 * Run: npm run demo:seed
 */
import { randomUUID } from 'crypto';
import { db, initSchema } from '../db/init.js';
import { synthesize, type DigestSignal } from '../intelligence/synthesizer.js';
import 'dotenv/config';

initSchema();

const CUSTOMER_ID = 'demo-customer-001';
const CUSTOMER_EMAIL = 'dkiran760@gmail.com';

// ── 1. Upsert demo customer ──────────────────────────────────────────────────
const trialEnd = Math.floor(Date.now()/1000) + 7*86400;
db.prepare(`INSERT OR IGNORE INTO customers (id, email, plan, active, trial_ends_at) VALUES (?, ?, 'starter', 1, ?)`).run(CUSTOMER_ID, CUSTOMER_EMAIL, trialEnd);
db.prepare(`UPDATE customers SET active = 1, trial_ends_at = ? WHERE email = ?`).run(trialEnd, CUSTOMER_EMAIL);
// Use whichever ID is actually in the DB (may differ if user already signed up)
const actualCustomer = db.prepare(`SELECT id FROM customers WHERE email = ?`).get(CUSTOMER_EMAIL) as any;
const ACTUAL_CUSTOMER_ID: string = actualCustomer.id;

// ── 2. Upsert demo competitors ───────────────────────────────────────────────
const competitors = [
  {
    id: 'comp-linear',
    name: 'Linear',
    pricing_url: 'https://linear.app/pricing',
    changelog_url: 'https://linear.app/changelog',
    jobs_url: null,
    domain: 'linear.app',
  },
  {
    id: 'comp-height',
    name: 'Height',
    pricing_url: 'https://height.app/pricing',
    changelog_url: 'https://height.app/changelog',
    jobs_url: null,
    domain: 'height.app',
  },
  {
    id: 'comp-shortcut',
    name: 'Shortcut',
    pricing_url: 'https://www.shortcut.com/pricing',
    changelog_url: 'https://www.shortcut.com/blog',
    jobs_url: null,
    domain: 'shortcut.com',
  },
];

for (const c of competitors) {
  db.prepare(`
    INSERT INTO competitors (id, customer_id, name, pricing_url, changelog_url, jobs_url, domain)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `).run(c.id, ACTUAL_CUSTOMER_ID, c.name, c.pricing_url, c.changelog_url, c.jobs_url, c.domain);
}

// ── 3. Seed realistic changes ────────────────────────────────────────────────
const now = Math.floor(Date.now() / 1000);

const changeRows = [
  {
    id: randomUUID(),
    competitor_id: 'comp-linear',
    source_type: 'pricing',
    diff_summary: 'Linear raised Free plan limit from 250 to 1,000 issues. Plus plan dropped from $10 to $8/seat/mo.',
    is_signal: 1,
    importance: 5,
    classifier_reason: 'pricing_change',
  },
  {
    id: randomUUID(),
    competitor_id: 'comp-linear',
    source_type: 'jobs',
    diff_summary: 'Linear posted 3 new roles: Head of Enterprise Sales, Enterprise Account Executive (NYC), Solutions Engineer. Signals a push into enterprise.',
    is_signal: 1,
    importance: 4,
    classifier_reason: 'key_hire',
  },
  {
    id: randomUUID(),
    competitor_id: 'comp-height',
    source_type: 'changelog',
    diff_summary: 'Height shipped AI task triage: automatically assigns priorities and labels based on past patterns. First competitor to ship AI-native triage.',
    is_signal: 1,
    importance: 5,
    classifier_reason: 'product_launch',
  },
  {
    id: randomUUID(),
    competitor_id: 'comp-height',
    source_type: 'news',
    diff_summary: 'Height raised $25M Series B led by Accel. Will use funds to double engineering team and expand into EU market.',
    is_signal: 1,
    importance: 5,
    classifier_reason: 'funding',
  },
  {
    id: randomUUID(),
    competitor_id: 'comp-shortcut',
    source_type: 'changelog',
    diff_summary: 'Shortcut rebranded from Clubhouse to Shortcut and launched Shortcut AI — in-app sprint planning assistant powered by GPT-4o.',
    is_signal: 1,
    importance: 4,
    classifier_reason: 'product_launch',
  },
  {
    id: randomUUID(),
    competitor_id: 'comp-shortcut',
    source_type: 'pricing',
    diff_summary: 'Shortcut added annual billing discount (20% off). Team plan now $8.50/user/mo annually vs $10 monthly.',
    is_signal: 1,
    importance: 3,
    classifier_reason: 'pricing_change',
  },
  {
    id: randomUUID(),
    competitor_id: 'comp-linear',
    source_type: 'news',
    diff_summary: 'Linear announced partnership with Figma — deep design-to-issue linking. Figma designs auto-attach to Linear issues from the Figma plugin.',
    is_signal: 1,
    importance: 3,
    classifier_reason: 'partnership',
  },
];

const insertChange = db.prepare(`
  INSERT INTO changes (id, competitor_id, source_type, diff_summary, is_signal, importance, classifier_reason, detected_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const row of changeRows) {
  insertChange.run(row.id, row.competitor_id, row.source_type, row.diff_summary, row.is_signal, row.importance, row.classifier_reason, now);
}

console.log(`✓ Seeded ${changeRows.length} changes`);

// ── 4. Build signals array ───────────────────────────────────────────────────
const compMap: Record<string, string> = {
  'comp-linear': 'Linear',
  'comp-height': 'Height',
  'comp-shortcut': 'Shortcut',
};

const signals: DigestSignal[] = changeRows.map((c) => ({
  competitor_name: compMap[c.competitor_id],
  source_type: c.source_type,
  category: c.classifier_reason,
  headline: c.diff_summary.split('.')[0],
  importance: c.importance,
  detail: c.diff_summary,
  detected_at: now,
}));

// ── 5–6. Synthesize + store (async) ──────────────────────────────────────────
(async () => {
  console.log('Synthesizing digest via TokenRouter...');
  const weekLabel = 'April 19–25, 2026';

  const markdown = await synthesize({
    customer_email: CUSTOMER_EMAIL,
    signals,
    week_label: weekLabel,
    customer_focus: 'product-led growth, SMB SaaS, pricing strategy',
  });

  const digest_id = randomUUID();
  db.prepare(`
    INSERT INTO digests (id, customer_id, content, change_ids)
    VALUES (?, ?, ?, ?)
  `).run(digest_id, ACTUAL_CUSTOMER_ID, markdown, JSON.stringify(changeRows.map((c) => c.id)));

  console.log(`\n✓ Demo seed complete!`);
  console.log(`  Customer    : ${CUSTOMER_EMAIL}`);
  console.log(`  Competitors : Linear, Height, Shortcut`);
  console.log(`  Changes     : ${changeRows.length}`);
  console.log(`\n  ➜  http://localhost:3000/demo\n`);
})();
