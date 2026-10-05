import type { JSX } from 'react';
import { SvgLayer } from '../layers';
import type { SetLayerProps } from '../set-definition';

const CELL = 72;
const EXTENT = 1600;
const STROKE = '#f5e6c8';

/** Notebook grid that drifts slowly upward; every fourth line is stronger. */
export function GridLines({ t, view }: SetLayerProps): JSX.Element {
  const offset = (t * 0.01) % CELL;
  const lines: JSX.Element[] = [];
  for (let i = -EXTENT / CELL; i <= (1080 + EXTENT) / CELL; i++) {
    const x = i * CELL;
    lines.push(<line key={`v${String(i)}`} x1={x} y1={-EXTENT} x2={x} y2={1920 + EXTENT} stroke={STROKE} strokeOpacity={i % 4 === 0 ? 0.1 : 0.045} strokeWidth={2} />);
  }
  for (let j = -EXTENT / CELL; j <= (1920 + EXTENT) / CELL; j++) {
    const y = j * CELL - offset;
    lines.push(<line key={`h${String(j)}`} x1={-EXTENT} y1={y} x2={1080 + EXTENT} y2={y} stroke={STROKE} strokeOpacity={j % 4 === 0 ? 0.1 : 0.045} strokeWidth={2} />);
  }
  return <SvgLayer view={view}>{lines}</SvgLayer>;
}
