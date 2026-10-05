import { COLORS } from '../../theme/tokens';
import type { TimeOfDay } from './options';
import { glow, H, OVERSCAN, seededRandom, W, WINDOW, type Ctx } from './primitives';

const SKIES: Record<TimeOfDay, readonly (readonly [number, string])[]> = {
  sunset: [[0, '#2b1d3a'], [0.32, '#5a2846'], [0.58, '#a8434a'], [0.78, '#e8743b'], [0.92, '#f4a259'], [1, '#f7c873']],
  night: [[0, '#0f0b1a'], [0.45, '#1d1526'], [0.8, '#2f2145'], [1, '#4a2a52']],
};

const STARS = (() => {
  const random = seededRandom(11);
  return Array.from({ length: 70 }, () => ({ x: WINDOW.x0 + random() * (WINDOW.x1 - WINDOW.x0), y: WINDOW.y0 + random() * 300, phase: random() * 6.28 }));
})();

export function paintSky(ctx: Ctx, t: number, timeOfDay: TimeOfDay): void {
  const g = ctx.createLinearGradient(0, WINDOW.y0, 0, WINDOW.y1);
  for (const [stop, color] of SKIES[timeOfDay]) g.addColorStop(stop, color);
  ctx.fillStyle = g;
  // Overscan: with parallax the sky layer moves less than the window, so it must extend past it.
  ctx.fillRect(-OVERSCAN, -OVERSCAN, W + OVERSCAN * 2, H + OVERSCAN * 2);

  if (timeOfDay === 'sunset') {
    glow(ctx, 190, 455, 230, COLORS.honey, 0.55);
    const sun = ctx.createRadialGradient(182, 445, 6, 190, 455, 54);
    sun.addColorStop(0, '#fff4d8');
    sun.addColorStop(0.7, '#fbe0a0');
    sun.addColorStop(1, COLORS.honey);
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(190, 455, 54, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.save();
  for (const star of STARS) {
    ctx.globalAlpha = 0.45 + 0.4 * Math.sin(t / 700 + star.phase);
    ctx.fillStyle = COLORS.cream;
    ctx.fillRect(star.x, star.y, 2, 2);
  }
  ctx.restore();
  glow(ctx, 400, 150, 120, '#d9d2f0', 0.25);
  ctx.fillStyle = '#f3ecdc';
  ctx.beginPath();
  ctx.arc(400, 150, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f0b1a';
  ctx.beginPath();
  ctx.arc(414, 142, 27, 0, Math.PI * 2);
  ctx.fill();
}

export function paintClouds(ctx: Ctx, t: number, timeOfDay: TimeOfDay): void {
  const tint: readonly [string, string, string] = timeOfDay === 'sunset' ? ['#9a3f4f', '#e98a5a', '#f7b98a'] : ['#1a1428', '#2f2440', '#3d3052'];
  const clouds = [[40, 120, 1.1, 0.018], [300, 175, 0.8, 0.013], [160, 238, 1.3, 0.01], [420, 330, 0.7, 0.015]] as const;
  ctx.save();
  ctx.globalAlpha = 0.75;
  for (const [x0, y, s, speed] of clouds) {
    const span = WINDOW.x1 - WINDOW.x0 + 200;
    const x = WINDOW.x0 - 100 + ((x0 + t * speed) % span);
    ctx.fillStyle = tint[0];
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * s, 70 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tint[1];
    ctx.beginPath();
    ctx.ellipse(x - 10 * s, y, 56 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 26 * s, y - 4 * s, 34 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tint[2];
    ctx.beginPath();
    ctx.ellipse(x - 2 * s, y - 7 * s, 36 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
