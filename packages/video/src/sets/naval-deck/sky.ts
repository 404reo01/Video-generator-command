import { fillVerticalGradient, paintGlow, seededRandom } from '../paint-utils';
import { HORIZON_Y, NAVAL } from './palette';

const CLOUDS = (() => {
  const random = seededRandom(31);
  return Array.from({ length: 6 }, () => ({ x: random() * 1500 - 200, y: 180 + random() * 520, w: 180 + random() * 260, speed: 0.008 + random() * 0.012 }));
})();

/** Golden-hour sky: navy to warm horizon, a low sun and flat clouds sliding by. */
export function paintSky(ctx: CanvasRenderingContext2D, t: number): void {
  fillVerticalGradient(ctx, -300, -300, 1680, HORIZON_Y + 500, [
    [0, NAVAL.navy],
    [0.35, NAVAL.navyLight],
    [0.62, NAVAL.deepTeal],
    [0.82, '#c9775a'],
    [1, NAVAL.sun],
  ]);
  paintGlow(ctx, 720, HORIZON_Y - 60, 520, NAVAL.sun, 0.5);
  ctx.fillStyle = '#fff1c9';
  ctx.beginPath();
  ctx.arc(720, HORIZON_Y - 70, 78, 0, Math.PI * 2);
  ctx.fill();

  for (const c of CLOUDS) {
    const span = 1900;
    const x = ((c.x + t * c.speed) % span) - 400;
    ctx.fillStyle = 'rgba(247,239,225,.16)';
    ctx.beginPath();
    ctx.roundRect(x, c.y, c.w, 26, 13);
    ctx.roundRect(x + c.w * 0.2, c.y - 20, c.w * 0.5, 26, 13);
    ctx.fill();
  }
}
