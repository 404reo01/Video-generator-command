import type { JSX } from 'react';
import { LAYOUT } from '../theme/tokens';
import { useStyle, withAlpha } from '../theme/style-context';
import { enter, exit } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';
import { activeCaption } from './active-caption';
import type { Caption } from './group-captions';

/** Classic two-line subtitles at the bottom of the safe area; the word being said lights up. */
export function Subtitle({ captions, left = LAYOUT.subtitle.left, width = LAYOUT.subtitle.width }: { readonly captions: readonly Caption[]; readonly left?: number; readonly width?: number }): JSX.Element | null {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  const active = activeCaption(captions, t);
  if (!active) return null;
  const k = Math.min(enter(t, active.startMs, 200), exit(t, active.endMs, 160));
  return (
    <div style={{ position: 'absolute', left, top: LAYOUT.subtitle.top, width, display: 'flex', justifyContent: 'center', opacity: k, translate: `0 ${((1 - k) * 18).toFixed(1)}px` }}>
      <div style={{ background: withAlpha(colors.surface, 0.82), backdropFilter: 'blur(8px)', borderRadius: 22, padding: '16px 30px', textAlign: 'center', fontFamily: fonts.body, fontWeight: 600, fontSize: 50, lineHeight: 1.22, color: colors.ink }}>
        {active.caption.words.map((word, i) => {
          const speaking = t >= word.startMs && t < word.endMs + 80;
          return (
            <span key={i} style={{ color: speaking ? colors.accent2 : t >= word.startMs ? colors.ink : withAlpha(colors.ink, 0.72) }}>
              {word.text}
              {i < active.caption.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}
