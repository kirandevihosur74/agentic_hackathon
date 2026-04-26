# SignalDigest — Competitor Intelligence Agent

## Project Overview
SignalDigest is an AI agent that monitors competitor websites, pricing pages, job postings, and news, then sends a weekly digest of *meaningful* changes (not noise) to SaaS founders. Think "Crayon for the rest of us" — $50/month vs. their $1K/month enterprise pricing.

**Built for:** AI Agent Economy Hackathon (April 25, 2026)
**Hosts:** AgentHansa, FluxA | **Co-hosts:** TokenRouter, BotLearn, SUN

## Core Value Proposition
Crayon sends 200 alerts/week. We send 5 — and they're the right 5. The agent learns per-customer what counts as signal vs. noise via BotLearn, compounding intelligence over time.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SignalDigest Agent                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Apify] ──────► Scrapes competitor data                    │
│     │            • Pricing pages                            │
│     │            • Changelogs / blog                        │
│     │            • Job postings                             │
│     │            • Google News                              │
│     ▼                                                       │
│  [TokenRouter] ─► Classifies signal vs noise                │
│     │            • Cheap model: per-change classifier       │
│     │            • Strong model: weekly digest synthesis    │
│     ▼                                                       │
│  [BotLearn] ───► Learns user preferences                    │
│     │            • Thumbs up/down feedback loop             │
│     │            • Per-customer signal model                │
│     ▼                                                       │
│  [Delivery] ───► Email + Slack digest                       │
│                                                             │
│  [Stripe] ─────► Subscription billing ($50–$150/mo)         │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack
- **Runtime:** Node.js 20+ / TypeScript
- **Web framework:** Hono (fast, lightweight, edge-ready)
- **Scraping:** Apify SDK (Google Search, Web Scraper, Jobs scrapers)
- **LLM routing:** TokenRouter API (one endpoint, 60+ models)
- **Memory/learning:** BotLearn API
- **Billing:** Stripe Checkout + Webhooks
- **Storage:** SQLite for hackathon (Postgres-ready schema)
- **Email delivery:** Resend
- **Slack:** Slack Web API (optional integration)

## Project Structure
```
signaldigest/
├── CLAUDE.md                  # This file — read first
├── README.md                  # Public-facing docs
├── package.json
├── .env.example               # API key template
├── src/
│   ├── index.ts               # Entry point + cron scheduler
│   ├── api/                   # HTTP routes (Stripe webhooks, dashboard)
│   ├── scrapers/              # Apify integration per source type
│   │   ├── pricing.ts
│   │   ├── changelog.ts
│   │   ├── jobs.ts
│   │   └── news.ts
│   ├── intelligence/          # TokenRouter calls
│   │   ├── classifier.ts      # Signal vs noise per change
│   │   └── synthesizer.ts     # Weekly digest generation
│   ├── memory/                # BotLearn integration
│   │   └── feedback.ts        # User preference learning
│   ├── delivery/              # Output channels
│   │   ├── email.ts
│   │   └── slack.ts
│   └── billing/               # Stripe
│       ├── checkout.ts
│       └── webhook.ts
└── data/
    └── signaldigest.db        # SQLite

```

## Build Order (Hackathon Time-Boxed)

### Phase 1 — Skeleton (30 min)
- Set up TypeScript project, install deps
- Wire env vars, build basic Hono server
- SQLite schema: `customers`, `competitors`, `changes`, `digests`, `feedback`

### Phase 2 — Scraping (45 min)
- Apify integration for one source (pricing page) end-to-end
- Diff detection: compare new scrape against last
- Store changes in `changes` table

### Phase 3 — Intelligence (45 min)
- TokenRouter classifier: each change → {signal: bool, importance: 1-5, reason}
- Use cheap model (Haiku/Flash) for classification
- TokenRouter synthesizer: weekly digest using stronger model (Opus/GPT-4o)

### Phase 4 — Memory (30 min)
- BotLearn integration: send feedback, retrieve customer signal model
- Adjust classifier prompt with learned preferences per customer

### Phase 5 — Delivery + Billing (45 min)
- Stripe Checkout flow for $50/$150/mo plans
- Resend email digest with thumbs up/down links
- Stripe webhook → activate subscription

### Phase 6 — Demo polish (45 min)
- Seed with real data: track Linear, Height, Shortcut
- Pre-generate a digest for the demo
- Record 1-min video showing: signup → first digest → feedback → improved digest

## Key Design Decisions

**Why TokenRouter for both models?**
Demonstrates the sponsor's value prop authentically. Cheap classification (10K+ changes/week per customer) on Haiku, expensive synthesis (1 digest/week) on Opus. Show the cost savings on stage.

**Why BotLearn instead of just storing preferences?**
BotLearn's pitch is "agents that compound experience over time." Our agent gets smarter the longer you're a customer — that's a real moat. Stand-alone preference storage is a weekend project; BotLearn-powered learning is a thesis match for judges.

**Why $50/month specifically?**
Crayon starts at ~$1K/mo. Klue is enterprise. Kompyte is $400+/mo. There's a wide gap below $200/mo for SMB SaaS founders. $50 is "expense it without asking" pricing.

## API Keys Needed (.env)
```
APIFY_TOKEN=
TOKENROUTER_API_KEY=        # $200 free credit from hackathon
BOTLEARN_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SLACK_BOT_TOKEN=            # optional
DATABASE_URL=file:./data/signaldigest.db
```

## Demo Script (1 minute)

1. **(0:00–0:10)** "SaaS founders need competitive intel. Crayon costs $1K/month. We built the $50/month version."
2. **(0:10–0:25)** Show signup → enter 3 competitors → Stripe checkout → success.
3. **(0:25–0:45)** Show generated digest with 5 ranked signals (pricing change, key hire, new feature, funding, partnership).
4. **(0:45–0:55)** Click thumbs-down on one alert → BotLearn updates → re-run shows that category suppressed.
5. **(0:55–1:00)** "Built on Apify + TokenRouter + BotLearn + Stripe. Live on AgentHansa today."

## Judging Rubric Alignment

The rubric is 4-dimensional. Hit each:
- **Real business value:** Crayon proves the market. We're 20× cheaper.
- **Technical execution:** Real scraping, real LLM routing, real billing.
- **Sponsor integration:** TokenRouter (intelligence), BotLearn (memory) — both core, not bolted on.
- **Stays alive after event:** Stripe is live, scrapers run on cron, agent listed on AgentHansa.

## What NOT to Build (Time Sinks)
- Don't build a frontend dashboard. Email is the product. A landing page with Stripe Checkout button is enough.
- Don't support arbitrary sites in the demo. Hardcode 3 real competitors.
- Don't OAuth integrate Slack. Use a webhook URL for the demo.
- Don't write tests beyond a smoke test. Hackathon, not enterprise.
