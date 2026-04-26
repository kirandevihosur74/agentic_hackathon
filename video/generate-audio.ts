import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import 'dotenv/config';

const API_KEY = process.env.TOKENROUTER_API_KEY!;
const BASE_URL = process.env.TOKENROUTER_BASE_URL ?? 'https://api.tokenrouter.com/v1';

const SCRIPT = `
Signal Digest.

Competitive intelligence for SaaS founders.

Here is the problem. Tools like Crayon send you two hundred alerts every single week. Two hundred. That is not intelligence. That is noise.

We built Signal Digest to send you just five. And they are always the right five.

Here is how it works.

You name your competitors �� Linear, Height, Shortcut — and we handle everything else. Every week, Apify crawls their pricing pages, their job boards, their changelogs, and their news feeds. Every change gets captured.

Then TokenRouter routes each change through an AI classifier. Signal or noise. Importance ranked one to five. Only the highest-ranked signals make it through.

This is what lands in your inbox every Monday morning. Five signals, each with a clear suggested action.

Linear raised their team plan by twenty percent. That is a pricing opportunity for you.

Height hired four machine learning engineers in three weeks. Expect a major AI announcement by Q3.

Shortcut shipped a new Slack integration. That removes one of your key differentiators. Update your comparison page now.

Every signal tells you exactly what to do next.

And it gets smarter over time. Click thumbs down on a signal — BotLearn remembers your preference and suppresses that category forever. The longer you use Signal Digest, the more precisely it learns what matters to your business.

Fifty dollars a month for the Starter plan. A hundred and fifty for Pro, which adds Slack alerts and priority AI synthesis. Crayon costs one thousand dollars a month. We are twenty times cheaper, and we send you twenty times fewer alerts — on purpose.

Seven day free trial. No credit card required.

Signal Digest. The five signals that matter. Every Monday morning.
`.trim();

async function generateVoiceover() {
  console.log('Generating voiceover via TokenRouter audio model...');

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-audio-mini',
      modalities: ['text', 'audio'],
      audio: { voice: 'onyx', format: 'pcm16' },
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are a professional voiceover narrator. Read the script in a clear, confident, engaging tone. Pace naturally — about 60 seconds total.',
        },
        { role: 'user', content: SCRIPT },
      ],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    throw new Error(`TokenRouter ${res.status}: ${await res.text()}`);
  }

  const chunks: string[] = [];
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') continue;
      try {
        const evt = JSON.parse(json);
        const audioChunk = evt?.choices?.[0]?.delta?.audio?.data;
        if (audioChunk) chunks.push(audioChunk);
      } catch {}
    }
  }

  if (chunks.length === 0) throw new Error('No audio chunks received');

  const outDir = join(dirname(new URL(import.meta.url).pathname), 'public');
  mkdirSync(outDir, { recursive: true });

  // Write raw PCM16 then convert to MP3 via ffmpeg
  const pcmPath = join(outDir, 'voiceover.pcm');
  const mp3Path = join(outDir, 'voiceover.mp3');
  writeFileSync(pcmPath, Buffer.from(chunks.join(''), 'base64'));
  execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${pcmPath}" "${mp3Path}"`, { stdio: 'inherit' });
  console.log(`✓ Voiceover saved → ${mp3Path}`);
}

generateVoiceover().catch((e) => { console.error('Failed:', e.message); process.exit(1); });
