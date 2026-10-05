import type { JSX } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import { VIDEO } from '../theme/tokens';
import { useStyle } from '../theme/style-context';

const SLANT = VIDEO.width * 0.5;
const BAND = 440;

/**
 * Diagonal sweep with an accent-coloured leading edge. `progress` runs 0 -> 1 across the whole
 * transition: the frame is fully covered at 0.5, exactly on the cut.
 */
export function SweepOverlay({ progress }: { readonly progress: number }): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  const { colors } = useStyle();

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const { width: W, height: H } = VIDEO;
    ctx.clearRect(0, 0, W, H);
    const covering = progress < 0.5;
    const p = covering ? progress * 2 : (progress - 0.5) * 2;
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const edge = -SLANT - BAND + eased * (W + SLANT + BAND * 2);
    const trail: [number, string][] = [[0, colors.surface], [0.4, colors.accent], [0.75, colors.accent2], [1, 'rgba(0,0,0,0)']];
    const band = ctx.createLinearGradient(edge, 0, edge + BAND, 0);
    for (const [offset, color] of trail) band.addColorStop(covering ? offset : 1 - offset, color);

    ctx.fillStyle = colors.surface;
    ctx.beginPath();
    if (covering) {
      ctx.moveTo(-10, 0);
      ctx.lineTo(edge, 0);
      ctx.lineTo(edge + SLANT, H);
      ctx.lineTo(-10, H);
    } else {
      ctx.moveTo(edge + BAND, 0);
      ctx.lineTo(W + 10, 0);
      ctx.lineTo(W + 10, H);
      ctx.lineTo(edge + BAND + SLANT, H);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = band;
    ctx.beginPath();
    ctx.moveTo(edge, 0);
    ctx.lineTo(edge + BAND, 0);
    ctx.lineTo(edge + BAND + SLANT, H);
    ctx.lineTo(edge + SLANT, H);
    ctx.closePath();
    ctx.fill();
  }, [progress, colors]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
}
