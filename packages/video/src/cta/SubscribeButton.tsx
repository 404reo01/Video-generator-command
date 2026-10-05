import type { Cta } from '@mappa/shared';
import type { JSX } from 'react';
import { Icon } from '../illustrations/Icon';
import { LAYOUT } from '../theme/tokens';
import { useStyle, withAlpha } from '../theme/style-context';
import { enter, exit, progress } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';
import { PixelCursor } from './PixelCursor';

// Feel of the click, in ms: the press is quick, the release bounces back, the ripple and sparks outlast it.
const PRESS_MS = 90;
const RELEASE_MS = 360;
const RIPPLE_MS = 600;
const SPARK_COUNT = 8;
const CURSOR_SIZE = 110;

/** Outro button: pops in, a pixel cursor glides onto it and clicks, it turns into the "done" state with sparks. */
export function SubscribeButton({ cta, endMs }: { readonly cta: Cta; readonly endMs: number }): JSX.Element | null {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  if (t < cta.atMs || t >= endMs) return null;

  const k = enter(t, cta.atMs, 420);
  const clicked = t >= cta.clickAtMs;
  const press = clicked ? (t < cta.clickAtMs + PRESS_MS ? 1 - progress(t, cta.clickAtMs, cta.clickAtMs + PRESS_MS) * 0.12 : 0.88 + 0.12 * enter(t, cta.clickAtMs + PRESS_MS, RELEASE_MS)) : 1;
  const ripple = progress(t, cta.clickAtMs, cta.clickAtMs + RIPPLE_MS);
  const label = clicked ? cta.doneLabel : cta.label;
  const fontSize = 64;

  // The cursor glides in from the lower right, lands just before the click, then fades away.
  const glide = progress(t, cta.atMs + 250, cta.clickAtMs - 120);
  const cursorOpacity = Math.min(progress(t, cta.atMs + 250, cta.atMs + 450), 1 - progress(t, cta.clickAtMs + 500, cta.clickAtMs + 800));
  const cursorX = 120 + (1 - glide) * 280;
  const cursorY = 30 + (1 - glide) * 260;

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: LAYOUT.cta.top, display: 'flex', justifyContent: 'center', opacity: exit(t, endMs) }}>
      <div style={{ position: 'relative', scale: String((0.6 + 0.4 * k) * press), opacity: Math.min(1, k * 1.5) }}>
        {clicked && ripple < 1 ? (
          <div style={{ position: 'absolute', inset: -12 - ripple * 70, borderRadius: 999, border: `6px solid ${withAlpha(colors.accent2, 1 - ripple)}` }} />
        ) : null}
        {clicked
          ? Array.from({ length: SPARK_COUNT }, (_, i) => {
              const angle = (i / SPARK_COUNT) * Math.PI * 2;
              const d = 150 + ripple * 230;
              return (
                <div
                  key={i}
                  style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 18, background: i % 2 === 0 ? colors.accent2 : colors.accent, opacity: 1 - ripple, translate: `${(Math.cos(angle) * d * 1.4 - 9).toFixed(1)}px ${(Math.sin(angle) * d * 0.6 - 9).toFixed(1)}px` }}
                />
              );
            })
          : null}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '30px 64px',
            borderRadius: 999,
            background: clicked ? colors.ink : colors.accent,
            border: `5px solid ${clicked ? colors.accent2 : withAlpha(colors.ink, 0.35)}`,
            boxShadow: `0 20px 50px ${withAlpha(colors.surface, 0.6)}`,
            fontFamily: fonts.title,
            fontWeight: fonts.titleWeight,
            fontSize,
            lineHeight: 1,
            color: clicked ? colors.surface : colors.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {clicked ? <Icon name="check" size={fontSize} /> : null}
          {label}
        </div>
        {cursorOpacity > 0 ? (
          <div style={{ position: 'absolute', left: '50%', top: '50%', translate: `${cursorX.toFixed(1)}px ${cursorY.toFixed(1)}px`, opacity: cursorOpacity, scale: clicked && t < cta.clickAtMs + PRESS_MS * 2 ? '0.9' : '1' }}>
            <PixelCursor size={CURSOR_SIZE} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
