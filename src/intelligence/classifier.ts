import { chatJSON } from '../tokenrouter.js';

export interface ClassifierInput {
  competitor_name: string;
  source_type: 'pricing' | 'changelog' | 'jobs' | 'news';
  diff: string;                    // diff or new content vs. previous scrape
  customer_preferences?: string;
}

export interface ClassifierOutput {
  is_signal: boolean;
  importance: 1 | 2 | 3 | 4 | 5;
  category: string;          // e.g. "pricing-change", "key-hire", "feature-launch"
  headline: string;          // 1-line summary for digest
  reason: string;            // why classifier thinks this is signal/noise
}

const SYSTEM_PROMPT = `You are a competitive intelligence analyst classifying changes to competitor websites.

Your job: separate SIGNAL (actionable strategic info) from NOISE (cosmetic, routine, irrelevant).

SIGNAL examples:
- Pricing page: tier added/removed, price changed, plan repositioned
- Changelog: major feature launches, platform shifts, deprecations
- Jobs: senior leadership hires, big hiring sprees in a function (5+ ML engineers = AI bet)
- News: funding rounds, partnerships, executive changes, acquisitions

NOISE examples:
- Cosmetic copy edits, design tweaks
- Bug fixes, minor patch releases
- Junior or volume hiring with no signal
- SEO content, blog posts about general industry topics
- Press releases for trivial events

Importance scale:
1 — barely a signal
2 — minor signal, worth noting
3 — clear signal
4 — strategic signal, customer should know
5 — major event, immediate action item

Output strict JSON: { is_signal, importance, category, headline, reason }`;

export async function classify(input: ClassifierInput): Promise<ClassifierOutput> {
  const userPrompt = `Competitor: ${input.competitor_name}
Source: ${input.source_type}
${input.customer_preferences ? `\nThis customer has indicated they care about: ${input.customer_preferences}\n` : ''}

Change detected:
"""
${input.diff.slice(0, 4000)}
"""

Classify this change. Output JSON only.`;

  return chatJSON<ClassifierOutput>({
    tier: 'cheap',
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    max_tokens: 400,
    temperature: 0.2,
  });
}
