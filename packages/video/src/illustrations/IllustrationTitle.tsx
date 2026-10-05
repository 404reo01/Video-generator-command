import type { JSX } from 'react';
import { useStyle } from '../theme/style-context';

export function IllustrationTitle({ title }: { readonly title: string | undefined }): JSX.Element | null {
  const { colors, fonts } = useStyle();
  if (!title) return null;
  return <div style={{ fontFamily: fonts.title, fontWeight: fonts.titleWeight, fontSize: 60, lineHeight: 1.05, color: colors.accent2, marginBottom: 34 }}>{title}</div>;
}
