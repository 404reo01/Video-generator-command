import type { z } from 'zod';
import type { FlowIllustrationSchema } from '@mappa/shared';
import { Fragment, type JSX } from 'react';
import { useStyle, withAlpha } from '../theme/style-context';
import { enter, progress } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';
import { Icon } from './Icon';
import { IllustrationTitle } from './IllustrationTitle';

/** Boxes connected by arrows that draw themselves from one step to the next. */
export function FlowView({ illustration }: { readonly illustration: z.infer<typeof FlowIllustrationSchema> }): JSX.Element {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  const vertical = illustration.direction === 'vertical';
  const iconSize = vertical ? 64 : 80;
  return (
    <div>
      <IllustrationTitle title={illustration.title} />
      <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        {illustration.nodes.map((node, i) => {
          const k = enter(t, node.atMs, 360);
          const shown = t >= node.atMs;
          const next = illustration.nodes[i + 1];
          const link = next ? progress(t, node.atMs + 150, next.atMs) : 0;
          return (
            <Fragment key={node.label}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: vertical ? 'row' : 'column',
                  alignItems: 'center',
                  gap: vertical ? 24 : 14,
                  width: vertical ? '100%' : 230,
                  padding: vertical ? '18px 26px' : '22px 12px',
                  borderRadius: 22,
                  background: shown ? withAlpha(colors.accent, 0.16) : withAlpha(colors.ink, 0.04),
                  border: `3px solid ${shown ? colors.accent : withAlpha(colors.ink, 0.12)}`,
                  opacity: shown ? 1 : 0.35,
                  scale: String(shown ? 0.85 + 0.15 * k : 0.95),
                  textAlign: vertical ? 'left' : 'center',
                }}
              >
                {node.icon ? <Icon name={node.icon} size={iconSize} /> : null}
                <span style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: vertical ? 44 : 36, lineHeight: 1.15, visibility: shown ? 'visible' : 'hidden' }}>{node.label}</span>
              </div>
              {next ? (
                <div style={{ position: 'relative', width: vertical ? 8 : 46, height: vertical ? 46 : 8, background: withAlpha(colors.ink, 0.12), borderRadius: 4, flex: 'none' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: vertical ? '100%' : `${(link * 100).toFixed(1)}%`, height: vertical ? `${(link * 100).toFixed(1)}%` : '100%', background: colors.accent2, borderRadius: 4 }} />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
