export function landingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SignalDigest — Competitive Intelligence for SaaS Founders</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream: #F5EDD8;
      --ink: #100D09;
      --signal: #A86E09;
      --signal-bg: rgba(168, 110, 9, 0.1);
      --signal-border: rgba(168, 110, 9, 0.25);
      --noise: #8B1A1A;
      --noise-bg: rgba(139, 26, 26, 0.07);
      --muted: #7A6958;
      --surface: #EDE3C8;
      --border: #C8BA9A;
      --white: #FBF6ED;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--cream);
      color: var(--ink);
      font-family: 'Libre Baskerville', Georgia, serif;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }

    /* Grain overlay */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity: 0.035;
      pointer-events: none;
      z-index: 9999;
    }

    /* ─── NAV MASTHEAD ─── */
    nav {
      background: var(--ink);
      color: var(--cream);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px;
      height: 60px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .masthead-logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--cream);
    }
    .masthead-logo em {
      font-style: italic;
      color: #C8960E;
    }
    .masthead-right {
      display: flex;
      align-items: center;
      gap: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(245, 237, 216, 0.45);
      letter-spacing: 0.08em;
    }
    .masthead-live {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #5FC97E;
    }
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #5FC97E;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* ─── HERO ─── */
    .hero {
      max-width: 900px;
      margin: 0 auto;
      padding: 88px 32px 64px;
      text-align: center;
    }
    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--signal);
      margin-bottom: 40px;
      padding: 6px 14px;
      border: 1px solid var(--signal-border);
      border-radius: 2px;
      background: var(--signal-bg);
      opacity: 0;
      animation: fadeUp 0.6s ease forwards;
      animation-delay: 0.1s;
    }

    /* Central comparison */
    .hero-comparison {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 40px;
      opacity: 0;
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.2s;
    }
    .hero-num {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px;
    }
    .hero-num .big-num {
      font-family: 'Playfair Display', serif;
      font-size: clamp(88px, 14vw, 148px);
      font-weight: 900;
      line-height: 1;
      display: block;
    }
    .hero-num .num-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 10px;
      display: block;
    }
    .num-noise .big-num {
      color: var(--noise);
      position: relative;
      display: inline-block;
    }
    .num-noise .big-num::after {
      content: '';
      position: absolute;
      left: -4px;
      right: -4px;
      top: 50%;
      height: 5px;
      background: var(--noise);
      transform-origin: left;
      transform: scaleX(0);
      animation: strikethrough 0.5s ease forwards;
      animation-delay: 1.2s;
    }
    @keyframes strikethrough {
      to { transform: scaleX(1); }
    }
    .num-noise .num-label { color: var(--noise); opacity: 0.65; }
    .num-signal .big-num {
      color: var(--signal);
    }
    .num-signal .num-label { color: var(--signal); }

    .hero-vs {
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .hero-vs-line {
      width: 1px;
      height: 60px;
      background: var(--border);
    }
    .hero-vs-text {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 18px;
      color: var(--muted);
    }

    .hero-headline {
      font-family: 'Playfair Display', serif;
      font-size: clamp(26px, 4.5vw, 42px);
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.5px;
      margin-bottom: 20px;
      opacity: 0;
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.35s;
    }
    .hero-headline em {
      font-style: italic;
      color: var(--signal);
    }

    .hero-sub {
      font-size: 17px;
      color: var(--muted);
      max-width: 560px;
      margin: 0 auto 36px;
      line-height: 1.7;
      opacity: 0;
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.5s;
    }

    .hero-price-bar {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      padding: 10px 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 2px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      margin-bottom: 40px;
      opacity: 0;
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.6s;
    }
    .price-crossed {
      color: var(--noise);
      text-decoration: line-through;
      opacity: 0.7;
    }
    .price-arrow { color: var(--muted); }
    .price-us { color: var(--signal); font-weight: 600; }

    .hero-cta-row {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      opacity: 0;
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.7s;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── BUTTONS ─── */
    .btn {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 13px 28px;
      border-radius: 2px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }
    .btn-signal {
      background: var(--signal);
      color: #FBF6ED;
    }
    .btn-signal:hover {
      background: #8B5C08;
      transform: translateY(-1px);
    }
    .btn-outline {
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--border);
    }
    .btn-outline:hover {
      border-color: var(--ink);
      transform: translateY(-1px);
    }
    .btn-ghost-dark {
      background: transparent;
      color: var(--cream);
      border: 1px solid rgba(245, 237, 216, 0.2);
    }
    .btn-ghost-dark:hover {
      border-color: rgba(245, 237, 216, 0.5);
    }
    .btn-arrow {
      font-size: 16px;
      transition: transform 0.15s;
    }
    .btn:hover .btn-arrow { transform: translateX(3px); }

    /* ─── DIVIDERS ─── */
    .rule {
      border: none;
      border-top: 1px solid var(--border);
      max-width: 960px;
      margin: 0 auto;
    }
    .rule-full {
      border: none;
      border-top: 1px solid var(--border);
    }

    /* ─── SAMPLE DIGEST ─── */
    .digest-wrap {
      max-width: 960px;
      margin: 0 auto;
      padding: 80px 32px;
    }
    .digest-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .digest-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(28px, 4vw, 38px);
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }
    .digest-subtitle {
      font-size: 16px;
      color: var(--muted);
      margin-bottom: 48px;
    }

    .digest-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(16, 13, 9, 0.06), 0 8px 32px rgba(16, 13, 9, 0.04);
    }
    .digest-header {
      background: var(--ink);
      color: var(--cream);
      padding: 20px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .digest-header-left {
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }
    .digest-header-title {
      font-size: 20px;
      font-weight: 700;
    }
    .digest-header-date {
      font-size: 13px;
      opacity: 0.55;
      margin-top: 2px;
      font-style: normal;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.04em;
    }
    .digest-header-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 5px 10px;
      border: 1px solid rgba(200, 150, 14, 0.4);
      color: #C8960E;
      border-radius: 2px;
    }

    .digest-body { padding: 0; }

    .signal-row {
      display: flex;
      align-items: flex-start;
      gap: 0;
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
      cursor: default;
    }
    .signal-row:last-child { border-bottom: none; }
    .signal-row:hover { background: var(--surface); }

    .signal-rank {
      min-width: 64px;
      padding: 22px 0 22px 28px;
      display: flex;
      align-items: flex-start;
      padding-top: 24px;
    }
    .rank-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      opacity: 0.6;
    }

    .signal-content {
      flex: 1;
      padding: 22px 28px;
      border-left: 1px solid var(--border);
      border-right: 1px solid var(--border);
    }
    .signal-company {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 5px;
    }
    .signal-headline {
      font-family: 'Playfair Display', serif;
      font-size: 17px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .signal-action {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.5;
      font-style: italic;
    }

    .signal-meta {
      min-width: 110px;
      padding: 22px 24px 22px 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      padding-top: 24px;
    }
    .score-bar {
      display: flex;
      gap: 3px;
      align-items: center;
    }
    .score-pip {
      width: 8px;
      height: 8px;
      border-radius: 1px;
      background: var(--border);
    }
    .score-pip.active { background: var(--signal); }
    .signal-type-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 7px;
      border-radius: 2px;
    }
    .badge-pricing { background: var(--noise-bg); color: var(--noise); border: 1px solid rgba(139, 26, 26, 0.18); }
    .badge-hiring { background: rgba(59, 130, 246, 0.08); color: #1D4ED8; border: 1px solid rgba(59, 130, 246, 0.2); }
    .badge-product { background: var(--signal-bg); color: var(--signal); border: 1px solid var(--signal-border); }
    .badge-funding { background: rgba(16, 185, 129, 0.08); color: #065F46; border: 1px solid rgba(16, 185, 129, 0.2); }

    .digest-footer-bar {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 14px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--muted);
    }
    .digest-footer-thumb {
      display: flex;
      gap: 12px;
    }
    .thumb-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: 2px;
      padding: 4px 10px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--muted);
      font-family: inherit;
    }
    .thumb-btn:hover { border-color: var(--signal); background: var(--signal-bg); }

    /* ─── HOW IT WORKS ─── */
    .steps-wrap {
      max-width: 960px;
      margin: 0 auto;
      padding: 80px 32px;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border: 1px solid var(--border);
      border-radius: 3px;
      overflow: hidden;
      background: var(--white);
    }
    .step-cell {
      padding: 36px 28px;
      border-right: 1px solid var(--border);
      position: relative;
    }
    .step-cell:last-child { border-right: none; }
    .step-cell::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    .step-cell:nth-child(1)::before { background: #C8960E; }
    .step-cell:nth-child(2)::before { background: #8B1A1A; }
    .step-cell:nth-child(3)::before { background: #1D4ED8; }
    .step-cell:nth-child(4)::before { background: #065F46; }
    .step-num-large {
      font-family: 'JetBrains Mono', monospace;
      font-size: 48px;
      font-weight: 600;
      line-height: 1;
      color: var(--border);
      margin-bottom: 20px;
      display: block;
    }
    .step-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    .step-desc {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.6;
    }
    .step-tag {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 3px 7px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 2px;
      color: var(--muted);
      margin-top: 14px;
    }

    /* ─── COMPARE ─── */
    .compare-wrap {
      background: var(--ink);
      color: var(--cream);
    }
    .compare-inner {
      max-width: 960px;
      margin: 0 auto;
      padding: 80px 32px;
    }
    .compare-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(245, 237, 216, 0.4);
      margin-bottom: 12px;
    }
    .compare-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(28px, 4vw, 40px);
      font-weight: 700;
      margin-bottom: 48px;
    }
    .compare-title em { font-style: italic; color: #C8960E; }

    table.cmp {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
    }
    .cmp th {
      text-align: left;
      padding: 14px 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(245, 237, 216, 0.4);
      border-bottom: 1px solid rgba(245, 237, 216, 0.08);
    }
    .cmp td {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(245, 237, 216, 0.06);
      vertical-align: middle;
    }
    .cmp tr:last-child td { border-bottom: none; }
    .cmp td:first-child {
      color: rgba(245, 237, 216, 0.65);
      font-size: 14px;
      font-family: 'Libre Baskerville', serif;
    }
    .cmp td.bad { color: #D97070; }
    .cmp td.good { color: #C8960E; font-weight: 600; }
    .cmp .check { color: #5FC97E; }
    .cmp .cross { color: #D97070; }

    /* ─── PRICING ─── */
    .pricing-wrap {
      max-width: 960px;
      margin: 0 auto;
      padding: 80px 32px;
    }
    .pricing-header { margin-bottom: 48px; }
    .section-label-dark {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .section-heading {
      font-family: 'Playfair Display', serif;
      font-size: clamp(28px, 4vw, 40px);
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    .plan-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 3px;
      padding: 40px 36px;
      position: relative;
      overflow: hidden;
    }
    .plan-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--border);
    }
    .plan-card.featured::before {
      background: var(--signal);
    }
    .plan-card.featured {
      border-color: var(--signal-border);
    }

    .plan-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 16px;
    }
    .plan-name.featured-name { color: var(--signal); }
    .plan-price-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 6px;
    }
    .plan-dollar {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--muted);
    }
    .plan-amount {
      font-family: 'Playfair Display', serif;
      font-size: 72px;
      font-weight: 900;
      line-height: 1;
      color: var(--ink);
      letter-spacing: -2px;
    }
    .plan-period {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 32px;
    }
    .plan-divider {
      height: 1px;
      background: var(--border);
      margin-bottom: 28px;
    }
    .plan-features {
      list-style: none;
      margin-bottom: 36px;
    }
    .plan-features li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
      font-size: 15px;
      border-bottom: 1px solid var(--border);
    }
    .plan-features li:last-child { border-bottom: none; }
    .feat-check {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #5FC97E;
      flex-shrink: 0;
      margin-top: 3px;
    }
    .feat-text { color: var(--ink); line-height: 1.5; }
    .feat-note {
      display: block;
      font-size: 12px;
      color: var(--muted);
      font-style: italic;
      margin-top: 2px;
    }

    .checkout-form { display: flex; flex-direction: column; gap: 10px; }
    .checkout-input {
      width: 100%;
      padding: 13px 16px;
      background: var(--cream);
      border: 1px solid var(--border);
      border-radius: 2px;
      color: var(--ink);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s;
    }
    .checkout-input:focus { border-color: var(--signal); }
    .checkout-input::placeholder { color: var(--muted); opacity: 0.6; }
    .trial-note {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--muted);
      opacity: 0.7;
      margin-top: 4px;
    }

    /* ─── SPONSORS ─── */
    .sponsors-wrap {
      background: var(--ink);
      padding: 40px 32px;
    }
    .sponsors-inner {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 32px;
      flex-wrap: wrap;
    }
    .sponsors-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(245, 237, 216, 0.3);
      white-space: nowrap;
    }
    .sponsor-chip {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 500;
      color: rgba(245, 237, 216, 0.55);
      padding: 6px 14px;
      border: 1px solid rgba(245, 237, 216, 0.1);
      border-radius: 2px;
      letter-spacing: 0.04em;
    }

    /* ─── FOOTER ─── */
    footer {
      background: var(--ink);
      border-top: 1px solid rgba(245, 237, 216, 0.08);
      padding: 32px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(245, 237, 216, 0.3);
      flex-wrap: wrap;
      gap: 16px;
    }
    footer a {
      color: rgba(245, 237, 216, 0.3);
      text-decoration: none;
    }
    footer a:hover { color: rgba(245, 237, 216, 0.7); }
    .footer-links { display: flex; gap: 24px; }

    /* ─── RESPONSIVE ─── */
    @media (max-width: 768px) {
      nav { padding: 0 20px; }
      .hero { padding: 60px 20px 48px; }
      .hero-num .big-num { font-size: 88px; }
      .steps-grid { grid-template-columns: repeat(2, 1fr); }
      .step-cell { border-right: none; border-bottom: 1px solid var(--border); }
      .step-cell:nth-last-child(-n+2) { border-bottom: none; }
      .step-cell:nth-child(odd) { border-right: 1px solid var(--border); }
      .pricing-grid { grid-template-columns: 1fr; }
      .digest-wrap, .steps-wrap, .pricing-wrap { padding: 60px 20px; }
      .compare-inner { padding: 60px 20px; }
      .digest-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .signal-meta { display: none; }
      footer { padding: 24px 20px; }
      .masthead-right { display: none; }
    }
    @media (max-width: 480px) {
      .steps-grid { grid-template-columns: 1fr; }
      .step-cell { border-right: none; }
      .step-cell:nth-child(odd) { border-right: none; }
    }
  </style>
</head>
<body>

<!-- ── MASTHEAD NAV ── -->
<nav>
  <div class="masthead-logo">Signal<em>Digest</em></div>
  <div class="masthead-right">
    <span class="masthead-live">
      <span class="live-dot"></span>
      LIVE
    </span>
    <span>AI AGENT ECONOMY HACKATHON · APRIL 2026</span>
  </div>
</nav>

<!-- ── HERO ── -->
<section class="hero">
  <div class="hero-eyebrow">
    ▸ Competitive intelligence, automated
  </div>

  <div class="hero-comparison">
    <div class="hero-num num-noise">
      <span class="big-num">200</span>
      <span class="num-label">alerts/week from Crayon</span>
    </div>
    <div class="hero-vs">
      <div class="hero-vs-line"></div>
      <div class="hero-vs-text">vs</div>
      <div class="hero-vs-line"></div>
    </div>
    <div class="hero-num num-signal">
      <span class="big-num">5</span>
      <span class="num-label">signals that matter</span>
    </div>
  </div>

  <h1 class="hero-headline">
    We built Crayon for the rest of us.<br/>
    <em>$50/month. The 5 right ones.</em>
  </h1>

  <p class="hero-sub">
    SignalDigest monitors your competitors&rsquo; pricing, hiring, and product
    launches — then sends a weekly digest with only the signals worth
    acting on. AI-ranked. Gets smarter the longer you use it.
  </p>

  <div class="hero-price-bar">
    <span class="price-crossed">Crayon: $1,000/mo</span>
    <span class="price-arrow">→</span>
    <span class="price-us">SignalDigest: $50/mo</span>
  </div>

  <div class="hero-cta-row">
    <a href="#pricing" class="btn btn-signal">
      Start free trial <span class="btn-arrow">→</span>
    </a>
    <a href="#digest-demo" class="btn btn-outline">
      See sample digest
    </a>
  </div>
</section>

<hr class="rule" />

<!-- ── SAMPLE DIGEST ── -->
<section class="digest-wrap" id="digest-demo">
  <div class="digest-label">Live example</div>
  <h2 class="digest-title">Your weekly intelligence brief</h2>
  <p class="digest-subtitle">
    This is what lands in your inbox every Monday morning.
  </p>

  <div class="digest-card">
    <div class="digest-header">
      <div class="digest-header-left">
        <div class="digest-header-title">Signal Digest</div>
        <div class="digest-header-date">Week of April 21–27, 2026 · 5 signals</div>
      </div>
      <div class="digest-header-badge">AI-ranked</div>
    </div>
    <div class="digest-body">
      <!-- Signal 1 -->
      <div class="signal-row">
        <div class="signal-rank"><span class="rank-num">01</span></div>
        <div class="signal-content">
          <div class="signal-company">Linear · Pricing</div>
          <div class="signal-headline">Team plan raised 20% — $16 → $20/seat</div>
          <div class="signal-action">Ahead of Series C. Consider repositioning your free tier messaging. Opportunity: target Linear customers on annual contracts expiring Q3.</div>
        </div>
        <div class="signal-meta">
          <div class="score-bar">
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
          </div>
          <div class="signal-type-badge badge-pricing">Pricing</div>
        </div>
      </div>
      <!-- Signal 2 -->
      <div class="signal-row">
        <div class="signal-rank"><span class="rank-num">02</span></div>
        <div class="signal-content">
          <div class="signal-company">Height · Hiring</div>
          <div class="signal-headline">4 ML engineers hired in 3 weeks</div>
          <div class="signal-action">Signals AI-native roadmap acceleration. Expect product announcement Q3 2026 — draft competitive response now, not after launch.</div>
        </div>
        <div class="signal-meta">
          <div class="score-bar">
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip"></div>
          </div>
          <div class="signal-type-badge badge-hiring">Hiring</div>
        </div>
      </div>
      <!-- Signal 3 -->
      <div class="signal-row">
        <div class="signal-rank"><span class="rank-num">03</span></div>
        <div class="signal-content">
          <div class="signal-company">Shortcut · Product</div>
          <div class="signal-headline">Slack integration v2 launched — bi-directional sync</div>
          <div class="signal-action">Removes a key differentiator you&rsquo;ve been citing. Update your comparison page and sales deck before the next demo cycle.</div>
        </div>
        <div class="signal-meta">
          <div class="score-bar">
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip"></div>
          </div>
          <div class="signal-type-badge badge-product">Product</div>
        </div>
      </div>
      <!-- Signal 4 -->
      <div class="signal-row">
        <div class="signal-rank"><span class="rank-num">04</span></div>
        <div class="signal-content">
          <div class="signal-company">Linear · Hiring</div>
          <div class="signal-headline">VP of Sales posted — first enterprise sales hire</div>
          <div class="signal-action">Linear moving upmarket. SMB window may be narrowing. Opportunity to capture displaced Linear customers who prefer non-enterprise tools.</div>
        </div>
        <div class="signal-meta">
          <div class="score-bar">
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip"></div>
            <div class="score-pip"></div>
          </div>
          <div class="signal-type-badge badge-hiring">Hiring</div>
        </div>
      </div>
      <!-- Signal 5 -->
      <div class="signal-row">
        <div class="signal-rank"><span class="rank-num">05</span></div>
        <div class="signal-content">
          <div class="signal-company">Height · Product</div>
          <div class="signal-headline">New changelog: subtasks, custom fields, API v2</div>
          <div class="signal-action">Three features your users have requested. Review your Q2 roadmap priorities — this may shift your sequencing.</div>
        </div>
        <div class="signal-meta">
          <div class="score-bar">
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip active"></div>
            <div class="score-pip"></div>
            <div class="score-pip"></div>
          </div>
          <div class="signal-type-badge badge-product">Product</div>
        </div>
      </div>
    </div>
    <div class="digest-footer-bar">
      <span>Was this signal useful? Train your digest:</span>
      <div class="digest-footer-thumb">
        <button class="thumb-btn" title="Signal — keep sending these">👍 Signal</button>
        <button class="thumb-btn" title="Noise — filter these out">👎 Noise</button>
      </div>
    </div>
  </div>
</section>

<hr class="rule-full" />

<!-- ── HOW IT WORKS ── -->
<section class="steps-wrap">
  <div class="section-label-dark">How it works</div>
  <h2 class="section-heading" style="margin-bottom:40px">From 10,000 changes to 5 signals</h2>
  <div class="steps-grid">
    <div class="step-cell">
      <span class="step-num-large">01</span>
      <div class="step-title">You name your competitors</div>
      <p class="step-desc">Enter 3–10 competitor names. We find their pricing pages, changelogs, job boards, and Google News automatically.</p>
      <span class="step-tag">Setup · 2 min</span>
    </div>
    <div class="step-cell">
      <span class="step-num-large">02</span>
      <div class="step-title">Apify scrapes every week</div>
      <p class="step-desc">Our scrapers crawl each source and diff it against last week. Only actual changes move forward — no reruns, no spam.</p>
      <span class="step-tag">Powered by Apify</span>
    </div>
    <div class="step-cell">
      <span class="step-num-large">03</span>
      <div class="step-title">AI filters the noise</div>
      <p class="step-desc">TokenRouter classifies each change: signal vs. noise, importance 1–5, suggested action. Cheap model on the bulk work.</p>
      <span class="step-tag">Powered by TokenRouter</span>
    </div>
    <div class="step-cell">
      <span class="step-num-large">04</span>
      <div class="step-title">Your digest gets smarter</div>
      <p class="step-desc">Thumbs up/down feedback trains your personal signal model via BotLearn. The longer you use it, the better it gets.</p>
      <span class="step-tag">Powered by BotLearn</span>
    </div>
  </div>
</section>

<!-- ── COMPARISON ── -->
<div class="compare-wrap">
  <div class="compare-inner">
    <div class="compare-label">The numbers</div>
    <h2 class="compare-title">Crayon for the <em>rest of us</em></h2>
    <table class="cmp">
      <thead>
        <tr>
          <th style="width:35%"></th>
          <th>Crayon / Klue / Kompyte</th>
          <th>SignalDigest</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Monthly price</td>
          <td class="bad">$1,000 – $2,500</td>
          <td class="good">$50 – $150</td>
        </tr>
        <tr>
          <td>Alerts per week</td>
          <td class="bad">200+</td>
          <td class="good">5 curated</td>
        </tr>
        <tr>
          <td>Time to first insight</td>
          <td class="bad">Weeks (CSM onboarding)</td>
          <td class="good">2 minutes</td>
        </tr>
        <tr>
          <td>AI-ranked signals</td>
          <td class="cross">✕</td>
          <td class="check">✓</td>
        </tr>
        <tr>
          <td>Learns your preferences</td>
          <td class="cross">✕</td>
          <td class="check">✓ via BotLearn</td>
        </tr>
        <tr>
          <td>Target customer</td>
          <td style="color:rgba(245,237,216,0.45)">Enterprise teams</td>
          <td class="good">SaaS founders</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- ── PRICING ── -->
<section class="pricing-wrap" id="pricing">
  <div class="pricing-header">
    <div class="section-label-dark">Pricing</div>
    <h2 class="section-heading">Expense it without asking</h2>
  </div>
  <div class="pricing-grid">

    <!-- Starter -->
    <div class="plan-card">
      <div class="plan-name">Starter</div>
      <div class="plan-price-row">
        <span class="plan-dollar">$</span>
        <span class="plan-amount">50</span>
      </div>
      <div class="plan-period">per month &nbsp;·&nbsp; 7-day free trial</div>
      <div class="plan-divider"></div>
      <ul class="plan-features">
        <li><span class="feat-check">✓</span><span class="feat-text">3 competitors tracked<span class="feat-note">Pricing, jobs, changelog, news</span></span></li>
        <li><span class="feat-check">✓</span><span class="feat-text">Weekly email digest<span class="feat-note">Top 5 signals, Monday morning</span></span></li>
        <li><span class="feat-check">✓</span><span class="feat-text">AI signal ranking<span class="feat-note">Importance score 1–5 per change</span></span></li>
        <li><span class="feat-check">✓</span><span class="feat-text">Feedback learning<span class="feat-note">Thumbs up/down personalisation</span></span></li>
      </ul>
      <form class="checkout-form" method="post" action="/trial">
        <input type="hidden" name="plan" value="starter" />
        <input class="checkout-input" type="email" name="email" placeholder="you@startup.com" required />
        <button type="submit" class="btn btn-outline" style="width:100%;justify-content:center">
          Start free trial <span class="btn-arrow">→</span>
        </button>
      </form>
      <p class="trial-note">No credit card during trial</p>
    </div>

    <!-- Pro -->
    <div class="plan-card featured">
      <div class="plan-name featured-name">Pro &nbsp;·&nbsp; Most popular</div>
      <div class="plan-price-row">
        <span class="plan-dollar" style="color:var(--signal)">$</span>
        <span class="plan-amount">150</span>
      </div>
      <div class="plan-period">per month &nbsp;·&nbsp; 7-day free trial</div>
      <div class="plan-divider"></div>
      <ul class="plan-features">
        <li><span class="feat-check">✓</span><span class="feat-text">10 competitors tracked<span class="feat-note">Pricing, jobs, changelog, news</span></span></li>
        <li><span class="feat-check">✓</span><span class="feat-text">Weekly email + Slack alerts<span class="feat-note">Instant Slack ping for 5/5 signals</span></span></li>
        <li><span class="feat-check">✓</span><span class="feat-text">Priority AI synthesis<span class="feat-note">Claude Opus for weekly digest</span></span></li>
        <li><span class="feat-check">✓</span><span class="feat-text">Advanced BotLearn memory<span class="feat-note">Category-level preference model</span></span></li>
      </ul>
      <form class="checkout-form" method="post" action="/trial">
        <input type="hidden" name="plan" value="pro" />
        <input class="checkout-input" type="email" name="email" placeholder="you@startup.com" required />
        <button type="submit" class="btn btn-signal" style="width:100%;justify-content:center">
          Start free trial <span class="btn-arrow">→</span>
        </button>
      </form>
      <p class="trial-note">No credit card during trial</p>
    </div>

  </div>
</section>

<!-- ── SPONSORS ── -->
<div class="sponsors-wrap">
  <div class="sponsors-inner">
    <span class="sponsors-label">Built with</span>
    <span class="sponsor-chip">Apify</span>
    <span class="sponsor-chip">TokenRouter</span>
    <span class="sponsor-chip">BotLearn</span>
    <span class="sponsor-chip">Stripe</span>
    <span class="sponsor-chip">Resend</span>
    <span class="sponsor-chip">AgentHansa</span>
  </div>
</div>

<!-- ── FOOTER ── -->
<footer>
  <span class="masthead-logo" style="font-size:16px">Signal<em>Digest</em></span>
  <div class="footer-links">
    <a href="/privacy">Privacy</a>
    <a href="/unsubscribe">Unsubscribe</a>
    <a href="mailto:kirandevihosur74@gmail.com">Contact</a>
  </div>
  <span>© 2026 SignalDigest</span>
</footer>

</body>
</html>`;
}
