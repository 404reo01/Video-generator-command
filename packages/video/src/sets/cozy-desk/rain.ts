import { seededRandom, WINDOW, type Ctx } from './primitives';

const DROPS = (() => {
  const random = seededRandom(21);
  return Array.from({ length: 90 }, () => ({ x: random(), y: random(), speed: 0.6 + random() * 0.6, length: 10 + random() * 14 }));
})();

/** Slanted rain streaks behind the glass. Positions are a pure function of time, so renders are reproducible. */
export function paintRain(ctx: Ctx, t: number): void {
  const width = WINDOW.x1 - WINDOW.x0;
  const height = WINDOW.y1 - WINDOW.y0;
  ctx.save();
  ctx.fillStyle = 'rgba(29,21,38,.25)';
  ctx.fillRect(WINDOW.x0, WINDOW.y0, width, height);
  ctx.strokeStyle = 'rgba(220,210,240,.35)';
  ctx.lineWidth = 1.4;
  for (const d of DROPS) {
    const y = WINDOW.y0 + ((d.y * height + t * 0.9 * d.speed) % (height + 40)) - 20;
    const x = WINDOW.x0 + ((d.x * width + (y - WINDOW.y0) * 0.25) % width);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - d.length * 0.25, y + d.length);
    ctx.stroke();
  }
  ctx.restore();
}
