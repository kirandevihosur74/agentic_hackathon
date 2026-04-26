import 'dotenv/config';

const BASE_URL = process.env.TOKENROUTER_BASE_URL ?? 'https://api.tokenrouter.ai/v1';
const API_KEY = process.env.TOKENROUTER_API_KEY!;

export type ModelTier = 'cheap' | 'strong';

const MODEL_MAP: Record<ModelTier, string> = {
  cheap: process.env.TOKENROUTER_CHEAP_MODEL ?? 'anthropic/claude-haiku-4-5',
  strong: process.env.TOKENROUTER_STRONG_MODEL ?? 'anthropic/claude-opus-4-7',
};

export interface ChatOptions {
  tier: ModelTier;
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  json?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export async function chat(opts: ChatOptions): Promise<string> {
  const body: any = {
    model: MODEL_MAP[opts.tier],
    messages: [
      ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
      ...opts.messages,
    ],
    max_tokens: opts.max_tokens ?? 1024,
    temperature: opts.temperature ?? 0.3,
  };

  if (opts.json) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`TokenRouter ${res.status}: ${txt}`);
  }

  const data: any = await res.json();
  return data.choices[0].message.content;
}

export async function chatJSON<T = any>(opts: Omit<ChatOptions, 'json'>): Promise<T> {
  const text = await chat({ ...opts, json: true });
  return JSON.parse(text) as T;
}
