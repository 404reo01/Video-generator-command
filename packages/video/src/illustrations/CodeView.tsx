import type { z } from 'zod';
import type { CodeIllustrationSchema } from '@mappa/shared';
import type { JSX } from 'react';
import { useStyle, withAlpha } from '../theme/style-context';
import { useNowMs } from '../timing/use-now-ms';

// Typing speed of commands and code; outputs print at once, like a real shell.
const MS_PER_CHAR = 34;

/** Terminal or editor window; each line appears at its own time. */
export function CodeView({ illustration }: { readonly illustration: z.infer<typeof CodeIllustrationSchema> }): JSX.Element {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  const visible = illustration.lines.filter((l) => t >= l.atMs);
  const last = visible.at(-1);
  return (
    <div style={{ margin: '-8px', borderRadius: 22, overflow: 'hidden', background: withAlpha('#0c0814', 0.55), border: `2px solid ${withAlpha(colors.ink, 0.12)}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 26px', background: withAlpha(colors.ink, 0.06) }}>
        {[colors.accent, colors.accent2, colors.muted].map((c, i) => (
          <span key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 14, fontFamily: fonts.label, fontSize: 28, color: colors.muted }}>{illustration.title ?? (illustration.variant === 'terminal' ? 'terminal' : 'editor')}</span>
      </div>
      <div style={{ padding: '26px 30px 34px', fontFamily: fonts.label, fontSize: 36, lineHeight: 1.55, minHeight: 300 }}>
        {visible.map((line, i) => {
          const typed = line.kind === 'output' ? line.text : line.text.slice(0, Math.floor((t - line.atMs) / MS_PER_CHAR));
          return (
            <div key={i} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: line.kind === 'output' ? colors.accent2 : colors.ink }}>
              {line.kind === 'command' ? <span style={{ color: colors.accent }}>$ </span> : null}
              {line.kind === 'code' ? <span style={{ color: colors.muted }}>{String(i + 1).padStart(2, ' ')}  </span> : null}
              {typed}
              {line === last && Math.floor(t / 450) % 2 === 0 ? <span style={{ display: 'inline-block', width: '0.55em', height: '1em', background: colors.accent2, verticalAlign: '-0.15em' }} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
