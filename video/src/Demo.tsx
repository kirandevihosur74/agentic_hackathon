import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import React from 'react';

const CREAM = '#F5EDD8';
const INK = '#100D09';
const SIGNAL = '#A86E09';
const SIGNAL_LIGHT = 'rgba(168,110,9,0.12)';
const NOISE = '#8B1A1A';
const MUTED = '#7A6958';
const SURFACE = '#EDE3C8';
const BORDER = '#C8BA9A';
const WHITE = '#FBF6ED';
const GREEN = '#4A7C59';

function useFade(startFrame: number, duration = 20) {
  const frame = useCurrentFrame();
  return interpolate(frame - startFrame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function useSlideUp(startFrame: number, delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame - delay,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  return {
    opacity: interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
    transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
  };
}

// ── Scene 1: Title (0–120) ────────────────────────────────────────────────
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const tagOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tagY = interpolate(frame, [40, 70], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const badgeOpacity = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      {/* Grain */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(168,110,9,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(139,26,26,0.06) 0%, transparent 60%)' }} />

      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: 96,
        fontWeight: 900,
        color: CREAM,
        letterSpacing: '-2px',
        opacity: logoSpring,
        transform: `scale(${interpolate(logoSpring, [0, 1], [0.8, 1])})`,
      }}>
        Signal<em style={{ fontStyle: 'italic', color: '#C8960E' }}>Digest</em>
      </div>

      <div style={{
        opacity: tagOpacity,
        transform: `translateY(${tagY}px)`,
        fontFamily: 'monospace',
        fontSize: 18,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'rgba(245,237,216,0.5)',
      }}>
        Competitive Intelligence · Built for SaaS Founders
      </div>

      <div style={{
        opacity: badgeOpacity,
        display: 'flex',
        gap: 12,
        marginTop: 8,
      }}>
        {['Apify', 'TokenRouter', 'BotLearn', 'Stripe'].map((s) => (
          <div key={s} style={{
            fontFamily: 'monospace',
            fontSize: 12,
            padding: '6px 14px',
            border: '1px solid rgba(245,237,216,0.15)',
            color: 'rgba(245,237,216,0.4)',
            borderRadius: 2,
            letterSpacing: '0.06em',
          }}>{s}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: The Problem (120–360) ────────────────────────────────────────
const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelStyle = useSlideUp(0, 0);
  const num200Style = useSlideUp(0, 5);
  const vsStyle = useSlideUp(0, 15);
  const num5Style = useSlideUp(0, 20);
  const subStyle = useSlideUp(0, 40);

  // Animated counter: 200 counting up
  const counterProgress = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const counterVal = Math.round(interpolate(counterProgress, [0, 1], [0, 200]));

  // Strike animation
  const strikeProgress = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 5 fades in
  const fiveOpacity = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fiveScale = spring({ frame: frame - 100, fps, config: { damping: 12, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(168,110,9,0.04) 0%, transparent 70%)' }} />

      <div style={{ ...labelStyle, fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginBottom: 48 }}>
        The problem with competitor alerts
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        {/* 200 */}
        <div style={{ ...num200Style, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: 200,
              fontWeight: 900,
              color: NOISE,
              lineHeight: 1,
              opacity: 0.85,
            }}>
              {counterVal}
            </div>
            {/* Strike */}
            <div style={{
              position: 'absolute',
              top: '48%',
              left: -8,
              right: -8,
              height: 10,
              background: NOISE,
              transformOrigin: 'left',
              transform: `scaleX(${strikeProgress})`,
              borderRadius: 2,
            }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', color: NOISE, marginTop: 8, opacity: 0.7 }}>
            alerts / week from Crayon
          </div>
        </div>

        {/* VS */}
        <div style={{ ...vsStyle, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 48, color: MUTED, opacity: 0.5 }}>vs</div>

        {/* 5 */}
        <div style={{ textAlign: 'center', opacity: fiveOpacity }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: 200,
            fontWeight: 900,
            color: SIGNAL,
            lineHeight: 1,
            transform: `scale(${fiveScale})`,
            display: 'inline-block',
          }}>
            5
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', color: SIGNAL, marginTop: 8 }}>
            signals that matter
          </div>
        </div>
      </div>

      <div style={{ ...subStyle, fontFamily: 'Georgia, serif', fontSize: 22, color: MUTED, marginTop: 48, fontStyle: 'italic', textAlign: 'center' }}>
        We built Crayon for the rest of us — at $50/month.
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: How It Works (360–600) ──────────────────────────────────────
const steps = [
  { num: '01', title: 'You name competitors', desc: 'Linear, Height, Shortcut — we find their pricing, jobs, changelog, and news.', color: '#C8960E' },
  { num: '02', title: 'Apify scrapes weekly', desc: 'Crawls each source and diffs it. Only actual changes move forward.', color: NOISE },
  { num: '03', title: 'AI filters noise', desc: 'TokenRouter classifies: signal vs noise, importance 1–5 per change.', color: '#1D4ED8' },
  { num: '04', title: 'You get 5 bullets', desc: 'Weekly email with ranked signals + suggested action for each.', color: GREEN },
];

const SceneHowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleStyle = useSlideUp(0, 0);

  return (
    <AbsoluteFill style={{ background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 120px', gap: 48 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(168,110,9,0.06) 0%, transparent 60%)' }} />

      <div style={{ ...titleStyle, textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,237,216,0.35)', marginBottom: 12 }}>How it works</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 900, color: CREAM, letterSpacing: '-1px' }}>
          From 10,000 changes to <em style={{ fontStyle: 'italic', color: '#C8960E' }}>5 signals</em>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, width: '100%' }}>
        {steps.map((step, i) => {
          const progress = spring({ frame: frame - i * 10, fps, config: { damping: 16, stiffness: 120 } });
          const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
          const y = interpolate(progress, [0, 1], [30, 0]);

          return (
            <div key={step.num} style={{
              background: 'rgba(245,237,216,0.04)',
              border: '1px solid rgba(245,237,216,0.08)',
              borderTop: `3px solid ${step.color}`,
              borderRadius: 3,
              padding: '28px 24px',
              opacity,
              transform: `translateY(${y}px)`,
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: 40, fontWeight: 600, color: 'rgba(245,237,216,0.1)', lineHeight: 1, marginBottom: 16 }}>{step.num}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: CREAM, marginBottom: 10, lineHeight: 1.3 }}>{step.title}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: 'rgba(245,237,216,0.5)', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Sample Digest (600–1080) ─────────────────────────────────────
const signals = [
  { rank: '01', company: 'Linear · Pricing', headline: 'Team plan raised 20% — $16 → $20/seat', action: 'Consider repositioning your free tier. Target expiring Linear annual contracts.', score: 5, badge: 'Pricing', badgeColor: NOISE },
  { rank: '02', company: 'Height · Hiring', headline: '4 ML engineers hired in 3 weeks', action: 'AI-native roadmap incoming Q3 2026. Draft competitive response now.', score: 4, badge: 'Hiring', badgeColor: '#1D4ED8' },
  { rank: '03', company: 'Shortcut · Product', headline: 'Slack integration v2 — bi-directional sync', action: 'Removes a key differentiator. Update your comparison page before next demo.', score: 4, badge: 'Product', badgeColor: SIGNAL },
  { rank: '04', company: 'Linear · Hiring', headline: 'VP of Sales posted — first enterprise hire', action: 'Linear moving upmarket. SMB window narrowing. Opportunity for displaced users.', score: 3, badge: 'Hiring', badgeColor: '#1D4ED8' },
  { rank: '05', company: 'Height · Product', headline: 'Subtasks, custom fields, API v2 shipped', action: 'Three features your users requested. Review Q2 roadmap priorities.', score: 3, badge: 'Product', badgeColor: SIGNAL },
];

const SignalRow: React.FC<{ signal: typeof signals[0]; startFrame: number }> = ({ signal, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 130 } });
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const x = interpolate(progress, [0, 1], [-40, 0]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 0,
      borderBottom: `1px solid ${BORDER}`,
      opacity,
      transform: `translateX(${x}px)`,
    }}>
      <div style={{ minWidth: 56, padding: '18px 0 18px 20px', fontFamily: 'monospace', fontSize: 11, color: MUTED, opacity: 0.6 }}>{signal.rank}</div>
      <div style={{ flex: 1, padding: '18px 20px', borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
        <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 5 }}>{signal.company}</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: INK, marginBottom: 5, lineHeight: 1.3 }}>{signal.headline}</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: MUTED, fontStyle: 'italic', lineHeight: 1.5 }}>{signal.action}</div>
      </div>
      <div style={{ minWidth: 100, padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[1, 2, 3, 4, 5].map((p) => (
            <div key={p} style={{ width: 8, height: 8, borderRadius: 1, background: p <= signal.score ? SIGNAL : BORDER }} />
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 7px', background: `rgba(168,110,9,0.1)`, border: `1px solid rgba(168,110,9,0.25)`, color: signal.badgeColor, borderRadius: 2 }}>
          {signal.badge}
        </div>
      </div>
    </div>
  );
};

const SceneDigest: React.FC = () => {
  const frame = useCurrentFrame();
  const titleStyle = useSlideUp(0, 0);
  const cardOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 100px', gap: 32 }}>
      <div style={{ ...titleStyle, textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>Your weekly intelligence brief</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 42, fontWeight: 900, color: INK, letterSpacing: '-1px' }}>This week in competitors</div>
      </div>

      <div style={{ width: '100%', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden', opacity: cardOpacity, boxShadow: '0 4px 32px rgba(16,13,9,0.08)' }}>
        {/* Header */}
        <div style={{ background: INK, padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: CREAM }}>Signal Digest</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(245,237,216,0.45)', marginTop: 2, letterSpacing: '0.04em' }}>Week of April 19–25, 2026 · 5 signals</div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 10px', border: '1px solid rgba(200,150,14,0.4)', color: '#C8960E', borderRadius: 2 }}>AI-RANKED</div>
        </div>

        {/* Signals */}
        {signals.map((s, i) => (
          <SignalRow key={s.rank} signal={s} startFrame={20 + i * 18} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Feedback Learning (1080–1320) ────────────────────────────────
const SceneFeedback: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleStyle = useSlideUp(0, 0);
  const cardStyle = useSlideUp(0, 20);

  const thumbDownProgress = spring({ frame: frame - 60, fps, config: { damping: 14, stiffness: 150 } });
  const suppressProgress = spring({ frame: frame - 100, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 160px', gap: 48 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 100%, rgba(74,124,89,0.08) 0%, transparent 60%)' }} />

      <div style={{ ...titleStyle, textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,237,216,0.35)', marginBottom: 12 }}>Gets smarter over time</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 48, fontWeight: 900, color: CREAM, letterSpacing: '-1px' }}>
          Powered by <em style={{ fontStyle: 'italic', color: '#C8960E' }}>BotLearn</em>
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: 'rgba(245,237,216,0.5)', marginTop: 12, fontStyle: 'italic' }}>
          Thumbs down a signal → that category suppressed for you forever
        </div>
      </div>

      <div style={{ ...cardStyle, background: 'rgba(245,237,216,0.04)', border: '1px solid rgba(245,237,216,0.1)', borderRadius: 3, padding: 32, width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Signal row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(245,237,216,0.03)', border: '1px solid rgba(245,237,216,0.08)', borderRadius: 2 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(245,237,216,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Linear · Hiring</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: CREAM, fontWeight: 700 }}>New SDR hired in Austin office</div>
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 24,
            cursor: 'pointer',
            transform: `scale(${interpolate(thumbDownProgress, [0, 0.5, 1], [1, 1.4, 1])})`,
            filter: thumbDownProgress > 0.3 ? 'none' : 'grayscale(1) opacity(0.4)',
            transition: 'filter 0.3s',
          }}>👎</div>
        </div>

        {/* Suppressed notice */}
        <div style={{
          opacity: suppressProgress,
          transform: `translateY(${interpolate(suppressProgress, [0, 1], [10, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: 'rgba(74,124,89,0.1)',
          border: '1px solid rgba(74,124,89,0.25)',
          borderRadius: 2,
        }}>
          <div style={{ fontSize: 18 }}>✓</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#5FC97E', letterSpacing: '0.04em' }}>
            BotLearn updated — junior hiring signals suppressed for your account
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 6: Pricing (1320–1560) ──────────────────────────────────────────
const ScenePricing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleStyle = useSlideUp(0, 0);

  const starterProgress = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 120 } });
  const proProgress = spring({ frame: frame - 40, fps, config: { damping: 16, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 160px', gap: 48 }}>
      <div style={{ ...titleStyle, textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginBottom: 12 }}>Pricing</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 52, fontWeight: 900, color: INK, letterSpacing: '-1.5px' }}>
          Expense it without asking
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, width: '100%', maxWidth: 800 }}>
        {/* Starter */}
        <div style={{
          flex: 1,
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderTop: `4px solid ${BORDER}`,
          borderRadius: 3,
          padding: '36px 32px',
          opacity: interpolate(starterProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(starterProgress, [0, 1], [30, 0])}px)`,
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 16 }}>Starter</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 72, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-2px' }}>
            <span style={{ fontSize: 24, verticalAlign: 'top', marginTop: 14, display: 'inline-block' }}>$</span>50
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: MUTED, marginBottom: 28 }}>per month · 7-day free trial</div>
          {['3 competitors', 'Weekly email digest', 'AI signal ranking', 'BotLearn memory'].map((f) => (
            <div key={f} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${BORDER}`, fontFamily: 'Georgia, serif', fontSize: 14, color: INK }}>
              <span style={{ color: GREEN, fontFamily: 'monospace', fontSize: 12 }}>✓</span> {f}
            </div>
          ))}
        </div>

        {/* Pro */}
        <div style={{
          flex: 1,
          background: WHITE,
          border: `1px solid rgba(168,110,9,0.3)`,
          borderTop: `4px solid ${SIGNAL}`,
          borderRadius: 3,
          padding: '36px 32px',
          opacity: interpolate(proProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(proProgress, [0, 1], [30, 0])}px)`,
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: SIGNAL, marginBottom: 16 }}>Pro · Most popular</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 72, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-2px' }}>
            <span style={{ fontSize: 24, verticalAlign: 'top', marginTop: 14, display: 'inline-block', color: SIGNAL }}>$</span>150
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: MUTED, marginBottom: 28 }}>per month · 7-day free trial</div>
          {['10 competitors', 'Email + Slack alerts', 'Claude Opus synthesis', 'Advanced BotLearn'].map((f) => (
            <div key={f} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${BORDER}`, fontFamily: 'Georgia, serif', fontSize: 14, color: INK }}>
              <span style={{ color: GREEN, fontFamily: 'monospace', fontSize: 12 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* vs Crayon */}
      <div style={{
        opacity: interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        fontFamily: 'monospace',
        fontSize: 13,
        color: MUTED,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span style={{ color: NOISE, textDecoration: 'line-through' }}>Crayon: $1,000/mo</span>
        <span>→</span>
        <span style={{ color: SIGNAL, fontWeight: 600 }}>SignalDigest: $50/mo</span>
        <span style={{ opacity: 0.5 }}>· 20× cheaper</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 7: CTA (1560–1800) ──────────────────────────────────────────────
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const subStyle = useSlideUp(0, 30);
  const urlStyle = useSlideUp(0, 60);
  const sponsorsStyle = useSlideUp(0, 90);

  return (
    <AbsoluteFill style={{ background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 60%, rgba(168,110,9,0.07) 0%, transparent 50%), radial-gradient(circle at 70% 40%, rgba(139,26,26,0.05) 0%, transparent 50%)' }} />

      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: 88,
        fontWeight: 900,
        color: CREAM,
        letterSpacing: '-2px',
        opacity: logoSpring,
        transform: `scale(${interpolate(logoSpring, [0, 1], [0.85, 1])})`,
      }}>
        Signal<em style={{ fontStyle: 'italic', color: '#C8960E' }}>Digest</em>
      </div>

      <div style={{ ...subStyle, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: 'rgba(245,237,216,0.55)', textAlign: 'center' }}>
        Crayon for the rest of us.
      </div>

      <div style={{ ...urlStyle, fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.08em', color: '#C8960E', padding: '12px 28px', border: '1px solid rgba(200,150,14,0.3)', borderRadius: 2 }}>
        signaldigest.ai · $50/month · 7-day free trial
      </div>

      <div style={{ ...sponsorsStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,237,216,0.25)' }}>Built with</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Apify', 'TokenRouter', 'BotLearn', 'Stripe', 'AgentHansa'].map((s) => (
            <div key={s} style={{ fontFamily: 'monospace', fontSize: 11, padding: '5px 12px', border: '1px solid rgba(245,237,216,0.1)', color: 'rgba(245,237,216,0.4)', borderRadius: 2, letterSpacing: '0.04em' }}>{s}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Fade transition helper ──────────────────────────────────────────���─────
const FadeTransition: React.FC<{ children: React.ReactNode; durationIn?: number; durationOut?: number; totalFrames: number }> = ({
  children, durationIn = 15, durationOut = 15, totalFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, durationIn, totalFrames - durationOut, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <div style={{ opacity, width: '100%', height: '100%' }}>{children}</div>;
};

// ── Root composition ──────────────────────────────────────────────────────
export const SignalDigestDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={120}>
        <FadeTransition totalFrames={120}><SceneTitle /></FadeTransition>
      </Sequence>
      <Sequence from={120} durationInFrames={240}>
        <FadeTransition totalFrames={240}><SceneProblem /></FadeTransition>
      </Sequence>
      <Sequence from={360} durationInFrames={240}>
        <FadeTransition totalFrames={240}><SceneHowItWorks /></FadeTransition>
      </Sequence>
      <Sequence from={600} durationInFrames={480}>
        <FadeTransition totalFrames={480}><SceneDigest /></FadeTransition>
      </Sequence>
      <Sequence from={1080} durationInFrames={240}>
        <FadeTransition totalFrames={240}><SceneFeedback /></FadeTransition>
      </Sequence>
      <Sequence from={1320} durationInFrames={240}>
        <FadeTransition totalFrames={240}><ScenePricing /></FadeTransition>
      </Sequence>
      <Sequence from={1560} durationInFrames={240}>
        <FadeTransition totalFrames={240}><SceneCTA /></FadeTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
