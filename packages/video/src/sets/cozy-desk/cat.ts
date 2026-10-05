import type { CatState } from './options';
import { WINDOW, type Ctx } from './primitives';

const FUR = '#d9773f';
const STRIPES = '#b45a2c';

/** Orange cat curled on the window sill: breathing and "z" when asleep, eyes open when awake. */
export function paintCat(ctx: Ctx, t: number, state: CatState): void {
  if (state === 'none') return;
  const sill = WINDOW.y1 + 2;
  const breath = state === 'asleep' ? 1 + 0.05 * Math.sin(t / 650) : 1;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c9662f';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(112, sill - 8);
  ctx.bezierCurveTo(126, sill - 2, 110, sill + 2, 76, sill - 3);
  ctx.stroke();
  ctx.fillStyle = FUR;
  ctx.beginPath();
  ctx.ellipse(84, sill - 15 * breath, 32, 15 * breath, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = STRIPES;
  ctx.lineWidth = 3;
  for (const x of [74, 86, 98]) {
    ctx.beginPath();
    ctx.arc(x, sill - 15 * breath, 13 * breath, -2.3, -1.1);
    ctx.stroke();
  }
  ctx.fillStyle = FUR;
  ctx.beginPath();
  ctx.arc(54, sill - 12, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(43, sill - 18);
  ctx.lineTo(45, sill - 33);
  ctx.lineTo(54, sill - 23);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(57, sill - 23);
  ctx.lineTo(66, sill - 32);
  ctx.lineTo(66, sill - 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f3c9a0';
  ctx.beginPath();
  ctx.ellipse(56, sill - 6, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state === 'asleep') {
    ctx.strokeStyle = '#3a2216';
    ctx.lineWidth = 1.6;
    for (const x of [48, 59]) {
      ctx.beginPath();
      ctx.arc(x, sill - 13, 3, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    const k = (t % 2600) / 2600;
    ctx.fillStyle = `rgba(245,230,200,${(0.85 * Math.sin(k * Math.PI)).toFixed(3)})`;
    ctx.font = `600 ${String(Math.round(11 + k * 7))}px monospace`;
    ctx.fillText('z', 66 + k * 14, sill - 34 - k * 34);
  } else {
    // Awake cats blink every ~4 s.
    const blinking = t % 4000 < 140;
    ctx.fillStyle = '#3a2216';
    for (const x of [48, 59]) ctx.fillRect(x - 1.5, sill - 15, 3, blinking ? 1 : 4);
  }
  ctx.restore();
}
