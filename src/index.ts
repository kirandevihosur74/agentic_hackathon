import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { db, initSchema } from './db/init.js';
import { createCheckout, type Plan } from './billing/checkout.js';
import { handleStripeWebhook } from './billing/webhook.js';
import { runWeeklyDigestForCustomer } from './agent.js';
import { landingPage } from './landing.js';
import { sendDigest } from './delivery/email.js';
import { randomUUID } from 'crypto';
import 'dotenv/config';

initSchema();

// ── Shared UI helpers ──────────────────────────────────────────────────────
function sharedHead() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=JetBrains+Mono:wght@400;500;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--cream:#F5EDD8;--ink:#100D09;--signal:#A86E09;--signal-bg:rgba(168,110,9,0.1);--signal-border:rgba(168,110,9,0.25);--muted:#7A6958;--surface:#EDE3C8;--border:#C8BA9A;--white:#FBF6ED}
  </style>`;
}
function sharedNav() {
  return `<nav style="background:var(--ink);color:var(--cream);display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:56px;position:sticky;top:0;z-index:100">
  <a href="/" style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--cream);text-decoration:none">Signal<em style="font-style:italic;color:#C8960E">Digest</em></a>
</nav>`;
}
function sharedFooter() {
  return `<footer style="text-align:center;padding:32px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)">
  <a href="/" style="color:var(--muted);text-decoration:none">SignalDigest</a> &nbsp;·&nbsp; <a href="/unsubscribe" style="color:var(--muted);text-decoration:none">Unsubscribe</a>
</footer>`;
}
// ──────────────────────────────────────────────────────────────────────────

const app = new Hono();

// --- Landing page ---
app.get('/', (c) => c.html(landingPage()));

// --- Demo shortcut: latest digest for demo customer ---
app.get('/demo', (c) => {
  const row = db.prepare(
    `SELECT d.id FROM digests d JOIN customers cu ON d.customer_id = cu.id WHERE cu.email = 'dkiran760@gmail.com' ORDER BY d.created_at DESC LIMIT 1`
  ).get() as any;
  if (!row) return c.redirect('/');
  return c.redirect('/digest/' + row.id);
});

// --- Free trial signup (no card required) ---
app.post('/trial', async (c) => {
  const body = await c.req.parseBody();
  const email = (body.email as string)?.trim().toLowerCase();
  const plan = (body.plan as string) ?? 'starter';
  if (!email) return c.text('email required', 400);

  const existing = db.prepare(`SELECT id FROM customers WHERE email = ?`).get(email);
  if (existing) return c.redirect('/onboarding?email=' + encodeURIComponent(email));

  const trialEndsAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO customers (id, email, plan, active, trial_ends_at) VALUES (?, ?, ?, 1, ?)`
  ).run(id, email, plan, trialEndsAt);

  return c.redirect('/onboarding?email=' + encodeURIComponent(email));
});

// --- Stripe checkout (post-trial upgrade) ---
app.post('/checkout', async (c) => {
  const body = await c.req.parseBody();
  const email = body.email as string;
  const plan = (body.plan as Plan) ?? 'starter';
  const session = await createCheckout(email, plan);
  return c.redirect(session.url!);
});

// --- Stripe webhook ---
app.post('/webhook/stripe', handleStripeWebhook);

// --- Onboarding: pick competitors after trial signup ---
app.get('/onboarding', (c) => {
  const email = c.req.query('email') ?? '';
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Add competitors — SignalDigest</title>
  ${sharedHead()}
  <style>
    body{background:var(--cream);color:var(--ink);font-family:'Libre Baskerville',Georgia,serif;min-height:100vh;-webkit-font-smoothing:antialiased}
    .wrap{max-width:560px;margin:0 auto;padding:64px 32px}
    .step-indicator{display:flex;align-items:center;gap:8px;margin-bottom:40px}
    .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;flex-shrink:0}
    .step-dot.done{background:var(--signal);color:#FBF6ED}
    .step-dot.active{background:var(--ink);color:var(--cream)}
    .step-dot.pending{background:var(--surface);color:var(--muted);border:1px solid var(--border)}
    .step-line{flex:1;height:1px;background:var(--border)}
    .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
    h1{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;margin-bottom:8px;letter-spacing:-0.3px}
    .sub{font-size:15px;color:var(--muted);margin-bottom:40px;line-height:1.6}
    .form-card{background:var(--white);border:1px solid var(--border);border-radius:3px;padding:36px}
    .field-group{margin-bottom:28px}
    .field-group:last-of-type{margin-bottom:0}
    .field-label{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;display:block}
    .field-hint{font-size:12px;color:var(--muted);margin-bottom:8px;font-style:italic}
    .comp-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    input{width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:2px;color:var(--ink);font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:border-color 0.15s}
    input:focus{border-color:var(--signal)}
    input::placeholder{color:var(--muted);opacity:0.6}
    input[readonly]{background:var(--surface);color:var(--muted);cursor:default}
    .divider{height:1px;background:var(--border);margin:24px 0}
    .btn-primary{width:100%;padding:14px;background:var(--signal);color:#FBF6ED;border:none;border-radius:2px;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:500;letter-spacing:0.04em;cursor:pointer;transition:background 0.15s;margin-top:28px}
    .btn-primary:hover{background:#8B5C08}
    .note{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);text-align:center;margin-top:12px}
    @media(max-width:500px){.comp-row{grid-template-columns:1fr}.wrap{padding:40px 20px}}
  </style>
</head>
<body>
${sharedNav()}
<div class="wrap">
  <div class="step-indicator">
    <div class="step-dot done">✓</div>
    <div class="step-line"></div>
    <div class="step-dot active">2</div>
    <div class="step-line"></div>
    <div class="step-dot pending">3</div>
  </div>

  <div class="eyebrow">Step 2 of 3</div>
  <h1>Who are you watching?</h1>
  <p class="sub">Add up to 3 competitors. We'll scrape their pricing pages, job boards, and news — then surface only what matters.</p>

  <div class="form-card">
    <form method="post" action="/competitors">
      <input type="hidden" name="email" value="${email}" />

      <div class="field-group">
        <span class="field-label">Your email</span>
        <input type="email" value="${email}" readonly />
      </div>

      <div class="divider"></div>

      <div class="field-group">
        <span class="field-label">Competitor 1 <span style="color:var(--signal)">*</span></span>
        <div class="comp-row">
          <input type="text" name="comp1" placeholder="e.g. Linear" required />
          <input type="url" name="comp1_pricing" placeholder="Pricing URL (optional)" />
        </div>
      </div>

      <div class="field-group">
        <span class="field-label">Competitor 2</span>
        <div class="comp-row">
          <input type="text" name="comp2" placeholder="e.g. Height" />
          <input type="url" name="comp2_pricing" placeholder="Pricing URL (optional)" />
        </div>
      </div>

      <div class="field-group">
        <span class="field-label">Competitor 3</span>
        <div class="comp-row">
          <input type="text" name="comp3" placeholder="e.g. Shortcut" />
          <input type="url" name="comp3_pricing" placeholder="Pricing URL (optional)" />
        </div>
      </div>

      <button type="submit" class="btn-primary">Run first digest →</button>
    </form>
    <p class="note">Scraping takes 2–4 min. We'll show you a live progress screen.</p>
  </div>
</div>
${sharedFooter()}
</body>
</html>`);
});

app.post('/competitors', async (c) => {
  const body = await c.req.parseBody();
  const customer = db.prepare(`SELECT * FROM customers WHERE email = ?`).get(body.email as string) as any;
  if (!customer) return c.text('account not found — sign up at /', 404);

  for (const idx of [1, 2, 3]) {
    const name = (body[`comp${idx}`] as string)?.trim();
    if (!name) continue;
    db.prepare(
      `INSERT OR IGNORE INTO competitors (id, customer_id, name, pricing_url) VALUES (?, ?, ?, ?)`
    ).run(randomUUID(), customer.id, name, (body[`comp${idx}_pricing`] as string) || null);
  }

  // Fire digest async — redirect to polling page immediately
  runWeeklyDigestForCustomer(customer.id).catch((e) => console.error('digest error:', e));

  return c.redirect('/generating?customer_id=' + customer.id);
});

// --- Generating page (polls until digest ready) ---
app.get('/generating', (c) => {
  const customer_id = c.req.query('customer_id') ?? '';
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Building your digest — SignalDigest</title>
  ${sharedHead()}
  <style>
    body{background:var(--cream);color:var(--ink);font-family:'Libre Baskerville',Georgia,serif;min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}
    .main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;gap:32px}
    .step-indicator{display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;flex-shrink:0}
    .step-dot.done{background:var(--signal);color:#FBF6ED}
    .step-dot.active{background:var(--ink);color:var(--cream)}
    .step-dot.pending{background:var(--surface);color:var(--muted);border:1px solid var(--border)}
    .step-line{width:40px;height:1px;background:var(--border)}
    .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);text-align:center}
    h1{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;text-align:center;letter-spacing:-0.3px}
    .steps-card{background:var(--white);border:1px solid var(--border);border-radius:3px;overflow:hidden;width:100%;max-width:440px;box-shadow:0 2px 16px rgba(16,13,9,0.06)}
    .step-row{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.04em;color:var(--muted);transition:all 0.3s}
    .step-row:last-child{border-bottom:none}
    .step-row.active{color:var(--ink);background:var(--surface)}
    .step-row.active .step-label{font-weight:500}
    .step-row.done{color:#4A7C59}
    .step-icon{width:20px;text-align:center;font-size:14px;flex-shrink:0}
    .spinner{width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--signal);border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0}
    @keyframes spin{to{transform:rotate(360deg)}}
    .step-sub{font-size:10px;color:var(--muted);opacity:0.7;margin-top:2px;display:block}
    .hint{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);text-align:center;max-width:380px;line-height:1.7}
    .hint strong{color:var(--ink);font-weight:500}
  </style>
</head>
<body>
${sharedNav()}
<div class="main">
  <div>
    <div class="step-indicator" style="justify-content:center">
      <div class="step-dot done">✓</div>
      <div class="step-line"></div>
      <div class="step-dot done">✓</div>
      <div class="step-line"></div>
      <div class="step-dot active">3</div>
    </div>
  </div>
  <div>
    <p class="eyebrow" style="margin-bottom:10px">Step 3 of 3</p>
    <h1>Building your digest…</h1>
  </div>

  <div class="steps-card">
    <div class="step-row active" id="s1">
      <div class="spinner"></div>
      <div><span class="step-label">Scraping competitor websites</span><span class="step-sub">Apify crawling pricing pages, job boards &amp; news</span></div>
    </div>
    <div class="step-row" id="s2">
      <span class="step-icon">○</span>
      <div><span class="step-label">Classifying signals vs noise</span><span class="step-sub">TokenRouter scoring each change 1–5</span></div>
    </div>
    <div class="step-row" id="s3">
      <span class="step-icon">○</span>
      <div><span class="step-label">Synthesizing weekly brief</span><span class="step-sub">Claude Opus writing your digest</span></div>
    </div>
    <div class="step-row" id="s4">
      <span class="step-icon">○</span>
      <div><span class="step-label">Digest ready</span><span class="step-sub">Redirecting you now…</span></div>
    </div>
  </div>

  <p class="hint">First run takes <strong>2–4 minutes</strong>. Subsequent weekly runs are faster as we only process diffs.</p>
</div>
${sharedFooter()}
<script>
  const id = ${JSON.stringify(customer_id)};
  let tick = 0;
  function markDone(n) {
    const el = document.getElementById('s' + n);
    el.className = 'step-row done';
    const ic = el.querySelector('.spinner, .step-icon');
    if (ic) ic.outerHTML = '<span class="step-icon">✓</span>';
  }
  function markActive(n) {
    const el = document.getElementById('s' + n);
    el.className = 'step-row active';
    const ic = el.querySelector('.step-icon');
    if (ic) ic.outerHTML = '<div class="spinner"></div>';
  }
  async function poll() {
    tick++;
    if (tick === 8)  { markDone(1); markActive(2); }
    if (tick === 16) { markDone(2); markActive(3); }
    const res = await fetch('/digest/status?customer_id=' + encodeURIComponent(id));
    const data = await res.json();
    if (data.digest_id) {
      markDone(3); markActive(4);
      setTimeout(() => { window.location = '/digest/' + data.digest_id; }, 800);
    } else {
      setTimeout(poll, 5000);
    }
  }
  setTimeout(poll, 5000);
</script>
</body>
</html>`);
});

// --- Digest status check (used by polling page) ---
app.get('/digest/status', (c) => {
  const customer_id = c.req.query('customer_id') ?? '';
  const row = db.prepare(`SELECT id FROM digests WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1`).get(customer_id) as any;
  return c.json({ digest_id: row?.id ?? null });
});

// --- Digest preview page ---
app.get('/digest/:id', (c) => {
  const digest = db.prepare(`SELECT d.*, cu.email FROM digests d JOIN customers cu ON d.customer_id = cu.id WHERE d.id = ?`).get(c.req.param('id')) as any;
  if (!digest) return c.text('digest not found', 404);

  const mdHtml = digest.content
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '');

  const sent = digest.sent_at
    ? `<p class="sent-note">✓ Sent to ${digest.email}</p>`
    : `<form method="post" action="/digest/${digest.id}/send">
        <button type="submit" class="btn-send">Send to ${digest.email} →</button>
       </form>`;

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Your Signal Digest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=JetBrains+Mono:wght@400;500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--cream:#F5EDD8;--ink:#100D09;--signal:#A86E09;--muted:#7A6958;--surface:#EDE3C8;--border:#C8BA9A;--white:#FBF6ED}
    body{background:var(--cream);color:var(--ink);font-family:'Libre Baskerville',Georgia,serif;line-height:1.7;-webkit-font-smoothing:antialiased}
    nav{background:var(--ink);color:var(--cream);display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:56px}
    .logo{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--cream);text-decoration:none}
    .logo em{font-style:italic;color:#C8960E}
    .wrap{max-width:720px;margin:0 auto;padding:56px 32px}
    .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
    .page-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:900;margin-bottom:6px;letter-spacing:-0.5px}
    .page-sub{font-size:15px;color:var(--muted);margin-bottom:36px}
    .action-bar{display:flex;align-items:center;gap:16px;padding:20px 24px;background:var(--white);border:1px solid var(--border);border-radius:3px;margin-bottom:40px}
    .action-bar p{flex:1;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted)}
    .btn-send{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:500;padding:11px 24px;background:var(--signal);color:#FBF6ED;border:none;border-radius:2px;cursor:pointer;transition:background 0.15s;white-space:nowrap}
    .btn-send:hover{background:#8B5C08}
    .sent-note{font-family:'JetBrains Mono',monospace;font-size:13px;color:#4A7C59;background:rgba(74,124,89,0.1);border:1px solid rgba(74,124,89,0.25);padding:11px 24px;border-radius:2px}
    .digest-card{background:var(--white);border:1px solid var(--border);border-radius:3px;padding:40px 44px;box-shadow:0 2px 16px rgba(16,13,9,0.06)}
    .digest-card h1{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;margin:32px 0 12px;letter-spacing:-0.3px}
    .digest-card h1:first-child{margin-top:0}
    .digest-card h2{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin:28px 0 10px;color:var(--ink)}
    .digest-card h3{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;margin:20px 0 8px;color:var(--signal)}
    .digest-card p{margin:10px 0;font-size:15px}
    .digest-card ul{margin:10px 0 10px 20px}
    .digest-card li{margin:6px 0;font-size:15px}
    .digest-card strong{color:var(--ink)}
    hr.rule{border:none;border-top:1px solid var(--border);margin:32px 0}
    footer{text-align:center;padding:32px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)}
    footer a{color:var(--muted);text-decoration:none}
    @media(max-width:600px){.wrap{padding:40px 20px}.digest-card{padding:28px 24px}}
  </style>
</head>
<body>
<nav>
  <a href="/" class="logo">Signal<em>Digest</em></a>
</nav>
<div class="wrap">
  <div class="eyebrow">Your weekly intelligence brief</div>
  <h1 class="page-title">Signal Digest</h1>
  <p class="page-sub">Generated for ${digest.email}</p>

  <div class="action-bar">
    <p>Review your digest below, then send it to your inbox.</p>
    ${sent}
  </div>

  <div class="digest-card">
    <p>${mdHtml}</p>
  </div>
</div>
<footer>
  <a href="/">SignalDigest</a> &nbsp;·&nbsp; <a href="/unsubscribe">Unsubscribe</a>
</footer>
</body>
</html>`);
});

// --- Send digest email ---
app.post('/digest/:id/send', async (c) => {
  const digest = db.prepare(`SELECT d.*, cu.email FROM digests d JOIN customers cu ON d.customer_id = cu.id WHERE d.id = ?`).get(c.req.param('id')) as any;
  if (!digest) return c.text('digest not found', 404);
  if (digest.sent_at) return c.redirect('/digest/' + digest.id);

  const weekLabel = new Date(digest.created_at * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  await sendDigest(digest.email, `Your weekly signal — ${weekLabel}`, digest.content, digest.id);

  db.prepare(`UPDATE digests SET sent_at = ? WHERE id = ?`).run(Date.now(), digest.id);
  return c.redirect('/digest/' + digest.id);
});

// --- Feedback endpoint (thumbs up/down) ---
app.post('/feedback', async (c) => {
  const { customer_id, change_id, vote } = await c.req.json();
  const customer = db.prepare(`SELECT * FROM customers WHERE id = ?`).get(customer_id) as any;
  const change = db.prepare(`SELECT c.*, comp.name as comp_name FROM changes c JOIN competitors comp ON c.competitor_id = comp.id WHERE c.id = ?`).get(change_id) as any;

  if (!customer || !change) return c.json({ error: 'not found' }, 404);

  db.prepare(`INSERT INTO feedback (id, customer_id, change_id, vote) VALUES (?, ?, ?, ?)`)
    .run(randomUUID(), customer_id, change_id, vote);

  return c.json({ ok: true });
});

// --- Health ---
app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`SignalDigest running on http://localhost:${port}`);
