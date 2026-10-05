import { fillVerticalGradient, seededRandom } from '../paint-utils';
import { HORIZON_Y, NAVAL, swell } from './palette';

const SPARKLES = (() => {
  const random = seededRandom(47);
  return Array.from({ length: 70 }, () => ({ x: random() * 1700 - 300, y: HORIZON_Y + 10 + random() * 260, len: 10 + random() * 34, phase: random() * 6.28 }));
})();

/** Far sea: horizon, an island with a lighthouse, sun glitter on the water. Bobs with the swell. */
export function paintFarSea(ctx: CanvasRenderingContext2D, t: number): void {
  const dy = swell(t) * 0.4;
  ctx.save();
  ctx.translate(0, dy);
  fillVerticalGradient(ctx, -300, HORIZON_Y, 1680, 1300, [
    [0, NAVAL.teal],
    [0.18, NAVAL.deepTeal],
    [1, NAVAL.navy],
  ]);
  // Island with a lighthouse on the left horizon.
  ctx.fillStyle = '#123a4f';
  ctx.beginPath();
  ctx.moveTo(-120, HORIZON_Y + 2);
  ctx.quadraticCurveTo(80, HORIZON_Y - 70, 300, HORIZON_Y + 2);
  ctx.fill();
  ctx.fillStyle = NAVAL.cream;
  ctx.fillRect(176, HORIZON_Y - 120, 18, 76);
  ctx.fillStyle = NAVAL.coral;
  ctx.fillRect(176, HORIZON_Y - 100, 18, 12);
  ctx.fillRect(176, HORIZON_Y - 74, 18, 12);
  const beam = 0.5 + 0.5 * Math.sin(t / 600);
  ctx.fillStyle = `rgba(255,210,122,${(0.35 + 0.5 * beam).toFixed(3)})`;
  ctx.fillRect(172, HORIZON_Y - 132, 26, 14);

  for (const s of SPARKLES) {
    const a = 0.25 + 0.35 * Math.sin(t / 380 + s.phase);
    if (a <= 0) continue;
    ctx.fillStyle = `rgba(255,226,160,${a.toFixed(3)})`;
    const nearSun = 1 - Math.min(1, Math.abs(s.x - 720) / 700);
    ctx.fillRect(s.x, s.y, s.len * (0.4 + nearSun), 3);
  }
  ctx.restore();
}

/** Rolling wave bands closer to the boat, moving faster than the far sea. */
export function paintWaves(ctx: CanvasRenderingContext2D, t: number): void {
  const dy = swell(t);
  for (let row = 0; row < 5; row++) {
    const y = HORIZON_Y + 140 + row * 90 + dy * (0.6 + row * 0.15);
    const amplitude = 10 + row * 4;
    const speed = 0.04 + row * 0.02;
    ctx.fillStyle = row % 2 === 0 ? 'rgba(14,77,100,.85)' : 'rgba(22,54,90,.85)';
    ctx.beginPath();
    ctx.moveTo(-300, y + 300);
    for (let x = -300; x <= 1380; x += 30) ctx.lineTo(x, y + Math.sin((x + t * speed) / 70 + row) * amplitude);
    ctx.lineTo(1380, y + 300);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(191,231,224,.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = -300; x <= 1380; x += 30) {
      const wy = y + Math.sin((x + t * speed) / 70 + row) * amplitude;
      if (x === -300) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
}

/** Two gulls gliding across the sky. */
export function paintGulls(ctx: CanvasRenderingContext2D, t: number): void {
  ctx.strokeStyle = NAVAL.cream;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const [offset, y, speed] of [[0, 520, 0.05], [700, 640, 0.035]] as const) {
    const x = ((offset + t * speed) % 1700) - 300;
    const flap = Math.sin(t / 160 + offset) * 10;
    ctx.beginPath();
    ctx.moveTo(x - 26, y - flap);
    ctx.quadraticCurveTo(x - 10, y - 14, x, y);
    ctx.quadraticCurveTo(x + 10, y - 14, x + 26, y - flap);
    ctx.stroke();
  }
}
