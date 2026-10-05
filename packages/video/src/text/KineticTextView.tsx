import type { KineticText } from '@mappa/shared';
import type { JSX } from 'react';
import { SAFE } from '../theme/tokens';
import { useStyle, withAlpha } from '../theme/style-context';
import { enter, exit } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';

interface KineticTextViewProps {
  readonly text: KineticText;
  readonly endMs: number;
  /** `full` = centred, the subject of the shot; `top` = a keyword above the character. */
  readonly placement: 'full' | 'top';
}

/** Big words popping in line by line; emphasis lines take the accent colour. */
export function KineticTextView({ text, endMs, placement }: KineticTextViewProps): JSX.Element {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  const longest = Math.max(...text.lines.map((l) => l.text.length));
  // Size so the longest line fits the safe width: ~0.55em per character for these faces.
  // 170 px caps a full-screen punchline of a few short words: it fills the width without becoming a wall.
  const fontSize = Math.min(placement === 'full' ? 170 : 96, Math.floor((SAFE.right - SAFE.left) / (longest * 0.56)));
  const out = exit(t, endMs, 200);

  return (
    <div
      style={{
        position: 'absolute',
        isolation: 'isolate',
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: placement === 'full' ? 0 : SAFE.top + 60,
        height: placement === 'full' ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: fontSize * 0.18,
        textAlign: 'center',
        opacity: out,
      }}
    >
      {placement === 'top' ? (
        // Darkens the busy set behind a keyword so it reads over any background.
        <div style={{ position: 'absolute', inset: '-120px -200px', background: `radial-gradient(closest-side, ${withAlpha(colors.surface, 0.7)}, ${withAlpha(colors.surface, 0)})`, zIndex: -1 }} />
      ) : null}
      {text.lines.map((line, i) => {
        // A line set at 0 ms is already there on the first frame: it is the video's thumbnail.
        const k = line.atMs === 0 ? 1 : enter(t, line.atMs, 320);
        return (
          <div
            key={i}
            style={{
              fontFamily: fonts.title,
              fontWeight: fonts.titleWeight,
              fontSize,
              lineHeight: 1.05,
              color: line.emphasis ? colors.accent2 : colors.ink,
              textShadow: `0 6px 30px rgba(10,5,15,.55)`,
              opacity: t >= line.atMs ? Math.min(1, k * 1.4) : 0,
              translate: `0 ${((1 - k) * 50).toFixed(1)}px`,
              scale: String(0.85 + 0.15 * k),
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
}
