# SignalDigest

> Competitor intelligence for SaaS founders. Crayon sends 200 alerts/week. We send 5 — and they're the right 5.

Built for the **AI Agent Economy Hackathon** (April 25, 2026) — AgentHansa × FluxA × TokenRouter × BotLearn × SUN.

---

## The Problem

Crayon costs ~$1,000/month. Klue is enterprise-only. Kompyte starts at $400/month. Meanwhile, indie SaaS founders need to know when a competitor changes pricing, makes a key hire, or ships a feature — without wading through 200 weekly noise alerts.

**SignalDigest is the $50/month version.** Scrape. Classify. Learn. Deliver 5 signals that matter.

---

## How It Works

```
[Apify]  ──────►  Scrapes competitor data
                  • Pricing pages
                  • Changelogs / blog posts
                  • Job postings
                  • Google News

[TokenRouter]  ►  Routes to the right model
                  • Haiku/Flash: classify each change (signal vs noise, 1–5 importance)
                  • Opus: synthesize weekly digest markdown

[BotLearn]  ───►  Learns per-customer preferences
                  • Thumbs up/down feedback loop
                  • Adjusts classifier prompt per customer

[Delivery]  ───►  Email digest via Resend + optional Slack webhook

[Stripe]  ─────►  Subscription billing ($50–$150/mo, 7-day free trial)
```

---

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 20 / TypeScript |
| Web framework | [Hono](https://hono.dev) |
| Scraping | [Apify SDK](https://apify.com) |
| LLM routing | [TokenRouter](https://tokenrouter.ai) |
| Memory/learning | [BotLearn](https://botlearn.ai) |
| Email | [Resend](https://resend.com) |
| Billing | [Stripe](https://stripe.com) Checkout + Webhooks |
| Storage | SQLite (Postgres-ready schema) |

---

## Project Structure

```
signaldigest/
├── src/
│   ├── index.ts                  # Hono server + all HTTP routes
│   ├── agent.ts                  # Weekly digest agent loop
│   ├── tokenrouter.ts            # TokenRouter API client
│   ├── landing.ts                # Landing page HTML
│   ├── db/
│   │   └── init.ts               # SQLite schema + connection
│   ├── scrapers/
│   │   └── apify.ts              # Pricing / changelog / jobs / news scrapers
│   ├── intelligence/
│   │   ├── classifier.ts         # Signal vs noise per change (cheap model)
│   │   └── synthesizer.ts        # Weekly digest synthesis (strong model)
│   ├── memory/
│   │   └── preferences.ts        # BotLearn preference retrieval
│   ├── delivery/
│   │   └── email.ts              # Resend email dispatch
│   └── billing/
│       ├── checkout.ts           # Stripe Checkout session
│       └── webhook.ts            # Stripe webhook handler
├── video/                        # Remotion demo video
│   ├── src/Demo.tsx
│   └── src/Root.tsx
├── out/demo.mp4                  # Pre-rendered demo video
└── data/signaldigest.db          # SQLite database
```

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/kirandevihosur74/agentic_hackathon
cd agentic_hackathon
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```


### 3. Initialize database

```bash
npm run db:init
```

### 4. Run dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## User Flow

1. **Sign up** — enter email, start 7-day free trial (no card required)
2. **Add competitors** — up to 3 names + optional pricing URLs
3. **Watch** — live progress screen while Apify scrapes + TokenRouter classifies
4. **Read digest** — top 5 signals ranked by importance
5. **Send to inbox** — one click to email the digest via Resend
6. **Give feedback** — thumbs up/down trains BotLearn per-customer signal model
7. **Upgrade** — Stripe Checkout for $50/month Starter or $150/month Pro

---

## Scripts

```bash
npm run dev           # Start dev server with hot reload
npm run build         # Compile TypeScript
npm run db:init       # Initialize SQLite schema
npm run scrape        # Run scraper manually
npm run digest        # Run digest generation manually
npm run demo:seed     # Seed database with demo data (Linear, Height, Shortcut)
npm run video:render  # Render demo video with Remotion
npm run video:preview # Preview demo video
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Landing page |
| `GET` | `/demo` | Redirect to latest demo digest |
| `POST` | `/trial` | Start free trial |
| `GET` | `/onboarding` | Add competitors form |
| `POST` | `/competitors` | Save competitors + kick off digest |
| `GET` | `/generating` | Live progress polling page |
| `GET` | `/digest/status` | JSON: is digest ready? |
| `GET` | `/digest/:id` | View rendered digest |
| `POST` | `/digest/:id/send` | Email digest via Resend |
| `POST` | `/feedback` | Submit thumbs up/down |
| `POST` | `/checkout` | Create Stripe Checkout session |
| `POST` | `/webhook/stripe` | Stripe webhook handler |
| `GET` | `/health` | Health check |

---

## Intelligence Pipeline

### Classification (cheap model — Haiku)

Each scraped diff is sent through `src/intelligence/classifier.ts`. Output:

```json
{
  "is_signal": true,
  "importance": 4,
  "category": "pricing",
  "headline": "Linear raised Pro plan from $8 to $10/seat",
  "reason": "Direct pricing change affects competitive positioning"
}
```

Only changes with `is_signal: true` and `importance >= 3` enter the digest.

### Synthesis (strong model — Opus)

Signals above the threshold are passed to `src/intelligence/synthesizer.ts`, which produces a ranked markdown digest. TokenRouter routes cheap classification (high volume) to Haiku and expensive synthesis (once/week) to Opus — demonstrating real cost routing.

### Learning (BotLearn)

User feedback (thumbs up/down per signal) is sent to BotLearn. Subsequent classifier calls include learned customer preferences in the system prompt, so the agent gets smarter over time per customer.

---

## Pricing

| Plan | Price | Competitors | Digest frequency |
|---|---|---|---|
| Free trial | 7 days | 3 | Weekly |
| Starter | $50/month | 3 | Weekly |
| Pro | $150/month | 10 | Weekly + on-demand |

Crayon starts at ~$1,000/month. This is the gap.

---

## Sponsors

- **[TokenRouter](https://tokenrouter.ai)** — LLM routing for cost-optimized inference
- **[BotLearn](https://botlearn.ai)** — Per-customer agent memory and preference learning
- **[AgentHansa](https://agenthansa.com)** — Agent marketplace hosting
- **[Apify](https://apify.com)** — Web scraping infrastructure
- **[FluxA](https://fluxa.ai)** — Hackathon co-host
