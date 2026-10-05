import { fillRoundRect, fillVerticalGradient } from '../paint-utils';
import { NAVAL } from './palette';

/** Top of the railing: everything of the speaker below it is hidden, like standing at the ship's side. */
export const RAIL_TOP = 1640;

/** Foreground railing across the frame, with a life ring hanging on it. */
export function paintRailing(ctx: CanvasRenderingContext2D): void {
  fillRoundRect(ctx, -300, RAIL_TOP - 8, 1680, 44, 14, NAVAL.wood);
  ctx.fillStyle = NAVAL.woodLight;
  ctx.fillRect(-300, RAIL_TOP - 6, 1680, 8);
  // Solid bulwark under the rail: the speaker's legs must never show between the posts.
  fillVerticalGradient(ctx, -300, RAIL_TOP + 30, 1680, 800, [[0, '#7a4526'], [0.2, '#5a321a'], [1, '#3a1f10']]);
  for (let x = -260; x < 1400; x += 150) fillVerticalGradient(ctx, x, RAIL_TOP + 30, 30, 800, [[0, NAVAL.woodLight], [1, NAVAL.woodDark]]);

  // Life ring: orange and cream quarters with rope.
  const cx = 720;
  const cy = RAIL_TOP + 150;
  for (let q = 0; q < 4; q++) {
    ctx.strokeStyle = q % 2 === 0 ? NAVAL.orange : NAVAL.cream;
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.arc(cx, cy, 92, (q * Math.PI) / 2, ((q + 1) * Math.PI) / 2);
    ctx.stroke();
  }
  ctx.strokeStyle = NAVAL.rope;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 92, 0, Math.PI * 2);
  ctx.stroke();
}
