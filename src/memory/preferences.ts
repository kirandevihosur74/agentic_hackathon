import { db } from '../db/init.js';

export function getPreferences(customer_id: string): string {
  const rows = db.prepare(`
    SELECT ch.source_type, ch.classifier_reason AS category, f.vote
    FROM feedback f
    JOIN changes ch ON f.change_id = ch.id
    WHERE f.customer_id = ?
  `).all(customer_id) as { source_type: string; category: string; vote: number }[];

  const scores: Record<string, number> = {};
  for (const row of rows) {
    const key = row.category || row.source_type;
    scores[key] = (scores[key] ?? 0) + row.vote;
  }

  const emphasize = Object.entries(scores).filter(([, v]) => v > 0).map(([k]) => k);
  const suppress = Object.entries(scores).filter(([, v]) => v < 0).map(([k]) => k);

  const parts: string[] = [];
  if (emphasize.length) parts.push(`emphasize: ${emphasize.join(', ')}`);
  if (suppress.length) parts.push(`suppress: ${suppress.join(', ')}`);
  return parts.join('; ');
}
