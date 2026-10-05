import type { JSX } from 'react';
import { Img, staticFile } from 'remotion';
import { useLibrary } from '../../episode/library-context';
import { useStyle, withAlpha } from '../../theme/style-context';
import { DomLayer } from '../layers';
import type { SetLayerProps } from '../set-definition';

const CELL = 170;
const ICON = 56;
// Icons that read as "ideas, work, tech" without meaning anything specific.
const PREFERRED = ['lightbulb', 'code', 'star', 'cloud', 'coffee', 'chart', 'rocket', 'heart', 'gear', 'check'];
// Pixels per ms: the pattern drifts diagonally, slow enough to feel calm.
const DRIFT = 0.012;

/** A calm backdrop in the episode's colours: soft gradient and a faint grid of drifting pixel icons. */
export function SymbolsLayer({ t, view }: SetLayerProps): JSX.Element {
  const { colors } = useStyle();
  const { icons } = useLibrary();
  const pool = PREFERRED.filter((name) => icons.includes(name));
  const offset = (t * DRIFT) % CELL;
  const cells: JSX.Element[] = [];
  for (let row = -2; row < 1920 / CELL + 2; row++) {
    for (let col = -2; col < 1080 / CELL + 2; col++) {
      const name = pool[Math.abs(row * 7 + col * 3) % Math.max(1, pool.length)];
      if (!name) continue;
      // Every other row is shifted by half a cell: a staggered pattern reads as texture, not as a grid.
      const x = col * CELL + (row % 2 === 0 ? 0 : CELL / 2) + offset;
      const y = row * CELL - offset;
      cells.push(<Img key={`${String(row)}-${String(col)}`} src={staticFile(`icons/${name}.png`)} style={{ position: 'absolute', left: x, top: y, width: ICON, height: ICON, imageRendering: 'pixelated', opacity: 0.09 }} />);
    }
  }
  return (
    <DomLayer view={view}>
      <div style={{ position: 'absolute', left: -300, top: -300, width: 1680, height: 2520, background: `radial-gradient(circle at 50% 42%, ${withAlpha(colors.accent, 0.16)}, ${colors.surface} 62%)` }} />
      {cells}
    </DomLayer>
  );
}
