import type { z } from 'zod';
import type { IconsIllustrationSchema } from '@mappa/shared';
import type { JSX } from 'react';
import { useStyle } from '../theme/style-context';
import { enter } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';
import { Icon } from './Icon';
import { IllustrationTitle } from './IllustrationTitle';

/** One to four big pixel icons popping in, each with an optional label: a quick visual for a concept. */
export function IconsView({ illustration }: { readonly illustration: z.infer<typeof IconsIllustrationSchema> }): JSX.Element {
  const t = useNowMs();
  const { fonts } = useStyle();
  const size = illustration.items.length <= 2 ? 240 : 170;
  return (
    <div>
      <IllustrationTitle title={illustration.title} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${String(Math.min(2, illustration.items.length))}, 1fr)`, gap: 36, justifyItems: 'center' }}>
        {illustration.items.map((item) => {
          const k = enter(t, item.atMs, 380);
          const shown = t >= item.atMs;
          return (
            <div key={item.icon} style={{ display: 'grid', justifyItems: 'center', gap: 18, opacity: shown ? 1 : 0, scale: String(0.6 + 0.4 * k), translate: `0 ${((1 - k) * 30).toFixed(1)}px` }}>
              <Icon name={item.icon} size={size} />
              {item.label ? <span style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 44, textAlign: 'center' }}>{item.label}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
