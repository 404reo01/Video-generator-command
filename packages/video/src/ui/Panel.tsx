import type { CSSProperties, JSX, ReactNode } from 'react';
import { useStyle, withAlpha } from '../theme/style-context';
import { enter, exit } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';

interface PanelProps {
  readonly startMs: number;
  readonly endMs: number;
  readonly style: CSSProperties;
  readonly children: ReactNode;
}

/** Frosted-glass card in the episode's colours; slides up at `startMs` and fades out at `endMs`. */
export function Panel({ startMs, endMs, style, children }: PanelProps): JSX.Element | null {
  const t = useNowMs();
  const { colors } = useStyle();
  if (t < startMs || t >= endMs) return null;
  const k = enter(t, startMs);
  const out = exit(t, endMs);
  return (
    <div
      style={{
        position: 'absolute',
        background: withAlpha(colors.surface, 0.78),
        backdropFilter: 'blur(14px)',
        border: `3px solid ${withAlpha(colors.ink, 0.22)}`,
        borderRadius: 28,
        boxShadow: `0 24px 60px ${withAlpha('#0a050f', 0.45)}`,
        color: colors.ink,
        opacity: Math.min(k, out),
        translate: `0 ${((1 - k) * 40).toFixed(1)}px`,
        scale: String(0.94 + 0.06 * k),
        transformOrigin: '50% 100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
