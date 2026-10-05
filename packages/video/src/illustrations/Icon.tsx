import type { JSX } from 'react';
import { Img, staticFile } from 'remotion';
import { useLibrary } from '../episode/library-context';
import { useStyle, withAlpha } from '../theme/style-context';

/** A 16x16 pixel icon from the library, scaled without smoothing; a soft dot if the icon is missing. */
export function Icon({ name, size }: { readonly name: string; readonly size: number }): JSX.Element {
  const { icons } = useLibrary();
  const { colors } = useStyle();
  if (!icons.includes(name)) {
    return <div style={{ width: size * 0.5, height: size * 0.5, margin: size * 0.25, borderRadius: '50%', background: withAlpha(colors.accent, 0.7) }} />;
  }
  return <Img src={staticFile(`icons/${name}.png`)} style={{ width: size, height: size, imageRendering: 'pixelated', flex: 'none' }} />;
}
