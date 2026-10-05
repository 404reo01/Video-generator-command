import type { z } from 'zod';
import type { CompareIllustrationSchema } from '@mappa/shared';
import type { JSX } from 'react';
import { useStyle, withAlpha } from '../theme/style-context';
import { enter } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';
import { IllustrationTitle } from './IllustrationTitle';

type Side = z.infer<typeof CompareIllustrationSchema>['before'];

function CompareCard({ side, tone, k }: { readonly side: Side; readonly tone: 'before' | 'after'; readonly k: number }): JSX.Element {
  const { colors, fonts } = useStyle();
  const accent = tone === 'after' ? colors.accent : colors.muted;
  return (
    <div style={{ padding: '28px 26px', borderRadius: 24, background: withAlpha(accent, tone === 'after' ? 0.16 : 0.08), border: `3px solid ${withAlpha(accent, 0.6)}`, opacity: k, translate: `0 ${((1 - k) * 40).toFixed(1)}px` }}>
      <div style={{ fontFamily: fonts.label, fontWeight: 600, fontSize: 30, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 20 }}>{side.label}</div>
      {side.points.map((point) => (
        <div key={point} style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontFamily: fonts.body, fontWeight: 500, fontSize: 38, lineHeight: 1.25, marginTop: 12 }}>
          <span style={{ color: accent, fontWeight: 700 }}>{tone === 'after' ? '✓' : '✕'}</span>
          <span>{point}</span>
        </div>
      ))}
    </div>
  );
}

/** Two cards side by side: the "before" from the start, the "after" revealed when it is said. */
export function CompareView({ illustration, startMs }: { readonly illustration: z.infer<typeof CompareIllustrationSchema>; readonly startMs: number }): JSX.Element {
  const t = useNowMs();
  return (
    <div>
      <IllustrationTitle title={illustration.title} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <CompareCard side={illustration.before} tone="before" k={enter(t, startMs + 150, 340)} />
        <CompareCard side={illustration.after} tone="after" k={t >= illustration.revealAtMs ? enter(t, illustration.revealAtMs, 380) : 0} />
      </div>
    </div>
  );
}
