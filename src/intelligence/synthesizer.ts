import { chat } from '../tokenrouter.js';

export interface DigestSignal {
  competitor_name: string;
  source_type: string;
  category: string;
  headline: string;
  importance: number;
  detail: string;
  detected_at: number;
}

export interface SynthesizerInput {
  customer_email: string;
  signals: DigestSignal[];
  week_label: string;            // e.g. "April 21–27, 2026"
  customer_focus?: string;       // optional: what they care about
}

const SYSTEM_PROMPT = `You are SignalDigest's weekly intelligence briefer for SaaS founders.

Write a short, scannable digest. The reader is a busy founder — they will give you 90 seconds.

Format the digest in markdown:

# Your Weekly Signal — {week_label}

**TL;DR:** 1–2 sentences. The single most important thing.

## What changed

For each signal, ranked by importance (5 first):

### {emoji} {Competitor} — {headline}
- **What:** 1 sentence
- **Why it matters:** 1 sentence with a strategic angle (NOT generic)
- **Suggested move:** 1 specific action the reader could take

Use these emojis:
- 💰 pricing/funding
- 🚀 product launch
- 👥 key hire
- 🤝 partnership
- 📊 strategy shift
- ⚠️ risk to watch

End with: "Reply with thumbs-up/down on any item to train your agent."

Keep the whole digest under 400 words. Cut ruthlessly.`;

export async function synthesize(input: SynthesizerInput): Promise<string> {
  const sorted = [...input.signals].sort((a, b) => b.importance - a.importance);
  const top = sorted.slice(0, 7);

  const userPrompt = `Week: ${input.week_label}
Customer focus: ${input.customer_focus ?? 'general SaaS competitive intel'}

Signals to include (ranked highest importance first):

${top
  .map(
    (s, i) => `${i + 1}. [${s.importance}/5] ${s.competitor_name} (${s.source_type}, ${s.category})
   Headline: ${s.headline}
   Detail: ${s.detail.slice(0, 600)}`
  )
  .join('\n\n')}

Write the digest now. Markdown only. No preamble.`;

  return chat({
    tier: 'strong',
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    max_tokens: 1500,
    temperature: 0.5,
  });
}
