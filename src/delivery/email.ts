import { Resend } from 'resend';
import 'dotenv/config';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = 'SignalDigest <onboarding@resend.dev>';
const DEMO_TO = 'dkiran760@gmail.com';

export async function sendDigest(
  to: string,
  subject: string,
  markdown: string,
  digest_id: string
) {
  const html = renderHtml(markdown, digest_id);

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: DEMO_TO,
    subject,
    html,
    text: markdown,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
}

/**
 * Quick markdown → HTML renderer with embedded thumbs-up/down feedback links.
 * For hackathon — a real version would use a proper markdown lib.
 */
function renderHtml(markdown: string, digest_id: string): string {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  // Naive but works for our digest format
  let html = markdown
    .replace(/^# (.*)$/gm, '<h1 style="font-size:24px;margin:24px 0 12px">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 style="font-size:18px;margin:20px 0 8px">$1</h2>')
    .replace(/^### (.*)$/gm, '<h3 style="font-size:16px;margin:16px 0 6px">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul style="margin:8px 0">$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>');

  return `
    <div style="max-width:600px;margin:0 auto;padding:24px;font-family:-apple-system,system-ui,sans-serif;color:#111">
      ${html}
      <hr style="margin:32px 0;border:none;border-top:1px solid #eee" />
      <p style="font-size:13px;color:#666">
        Thumbs up/down individual items in the next digest, or
        <a href="${appUrl}/feedback?digest=${digest_id}">give feedback now</a>.
      </p>
      <p style="font-size:12px;color:#999">
        SignalDigest • <a href="${appUrl}/unsubscribe">unsubscribe</a>
      </p>
    </div>
  `;
}
