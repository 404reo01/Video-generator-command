import type { JSX } from 'react';
import { useStyle } from '../theme/style-context';

// Classic arrow pointer, 11x17 pixels: X = outline, o = fill.
const GRID = [
  'X..........',
  'XX.........',
  'XoX........',
  'XooX.......',
  'XoooX......',
  'XooooX.....',
  'XoooooX....',
  'XooooooX...',
  'XoooooooX..',
  'XooooooooX.',
  'XoooooXXXXX',
  'XooXooX....',
  'XoX.XooX...',
  'XX..XooX...',
  'X....XooX..',
  '.....XooX..',
  '......XX...',
];

/** Pixel-art mouse pointer whose tip is the top-left corner; drawn with the episode's ink and surface colours. */
export function PixelCursor({ size }: { readonly size: number }): JSX.Element {
  const { colors } = useStyle();
  const width = GRID[0]?.length ?? 0;
  return (
    <svg width={(size * width) / GRID.length} height={size} viewBox={`0 0 ${String(width)} ${String(GRID.length)}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
      {GRID.flatMap((row, y) =>
        Array.from(row, (cell, x) => (cell === '.' ? null : <rect key={`${String(x)}-${String(y)}`} x={x} y={y} width={1} height={1} fill={cell === 'X' ? colors.surface : colors.ink} />)),
      )}
    </svg>
  );
}
