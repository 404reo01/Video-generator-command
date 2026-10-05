import type { z } from 'zod';
import type { NumberIllustrationSchema } from '@mappa/shared';
import type { JSX } from 'react';
import { useStyle } from '../theme/style-context';
import { progress } from '../timing/envelope';
import { useNowMs } from '../timing/use-now-ms';

/** One key number counting up from zero when it is said. */
export function NumberView({ illustration }: { readonly illustration: z.infer<typeof NumberIllustrationSchema> }): JSX.Element {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  const k = progress(t, illustration.atMs, illustration.atMs + 1100);
  const decimals = Number.isInteger(illustration.value) ? 0 : 1;
  const shown = (illustration.value * k).toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontFamily: fonts.title, fontWeight: fonts.titleWeight, fontSize: 190, lineHeight: 1, color: colors.accent2, fontVariantNumeric: 'tabular-nums', opacity: t >= illustration.atMs ? 1 : 0.25 }}>
        {illustration.prefix ?? ''}
        {shown}
        {illustration.suffix ?? ''}
      </div>
      <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 46, marginTop: 26 }}>{illustration.label}</div>
    </div>
  );
}
