import type { z } from 'zod';
import type { ListIllustrationSchema } from '@mappa/shared';
import type { JSX } from 'react';
import { useStyle, withAlpha } from '../theme/style-context';
import { enter } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';
import { Icon } from './Icon';
import { IllustrationTitle } from './IllustrationTitle';

/** Items sliding in one by one as they are named. */
export function ListView({ illustration }: { readonly illustration: z.infer<typeof ListIllustrationSchema> }): JSX.Element {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  // Long lists get tighter rows so the panel never reaches the speaker's face in medium shots.
  const compact = illustration.items.length > 4;
  return (
    <div>
      <IllustrationTitle title={illustration.title} />
      <div style={{ display: 'grid', gap: compact ? 14 : 22 }}>
        {illustration.items.map((item) => {
          const k = enter(t, item.atMs, 340);
          const shown = t >= item.atMs;
          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: compact ? '10px 22px' : '18px 24px',
                borderRadius: 20,
                background: shown ? withAlpha(colors.ink, 0.07) : 'transparent',
                border: `3px ${shown ? 'solid' : 'dashed'} ${withAlpha(colors.ink, shown ? 0.16 : 0.1)}`,
                opacity: shown ? Math.min(1, k * 1.3) : 0.35,
                translate: `${((1 - k) * -60).toFixed(1)}px 0`,
              }}
            >
              {item.icon ? <Icon name={item.icon} size={compact ? 56 : 72} /> : <div style={{ width: 22, height: 22, borderRadius: 6, background: colors.accent, margin: '0 10px' }} />}
              <span style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: compact ? 42 : 48, visibility: shown ? 'visible' : 'hidden' }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
