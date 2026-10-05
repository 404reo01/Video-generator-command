import type { TimeOfDay } from './options';
import { roundRect, seededRandom, WINDOW, type Ctx } from './primitives';

interface Building {
  readonly x: number;
  readonly w: number;
  readonly h: number;
  readonly antenna: boolean;
}

function skyline(seed: number, minH: number, maxH: number, minW: number, maxW: number): Building[] {
  const random = seededRandom(seed);
  const buildings: Building[] = [];
  let x = WINDOW.x0 - 70;
  while (x < WINDOW.x1 + 60) {
    const w = minW + random() * (maxW - minW);
    buildings.push({ x, w, h: minH + random() * (maxH - minH), antenna: random() > 0.6 });
    x += w + random() * 8;
  }
  return buildings;
}

const FAR = skyline(7, 30, 80, 30, 70);
const NEAR = skyline(8, 50, 160, 28, 74);
const LIT_WINDOWS = (() => {
  const random = seededRandom(9);
  const windows: { x: number; y: number; seed: number }[] = [];
  for (const b of NEAR) {
    for (let y = WINDOW.y1 - b.h + 10; y < WINDOW.y1 - 10; y += 13) {
      for (let x = b.x + 6; x < b.x + b.w - 8; x += 10) if (random() > 0.64) windows.push({ x, y, seed: random() });
    }
  }
  return windows;
})();

export function paintCity(ctx: Ctx, t: number, timeOfDay: TimeOfDay): void {
  ctx.fillStyle = timeOfDay === 'sunset' ? '#6a2f4c' : '#241a33';
  // Buildings run 80px below the sill: parallax can lift the city layer above it.
  for (const b of FAR) ctx.fillRect(b.x, WINDOW.y1 - b.h * 0.6, b.w, b.h + 80);
  ctx.fillStyle = timeOfDay === 'sunset' ? '#3a2242' : '#140f20';
  for (const b of NEAR) {
    ctx.fillRect(b.x, WINDOW.y1 - b.h, b.w, b.h + 80);
    if (b.antenna) ctx.fillRect(b.x + b.w / 2 - 1.5, WINDOW.y1 - b.h - 16, 3, 16);
  }
  // Windows switch on and off every ~0.9 s; more of them are lit at night.
  const slot = Math.floor(t / 900);
  const threshold = timeOfDay === 'night' ? 0.2 : 0.32;
  for (const w of LIT_WINDOWS) {
    if ((w.seed * 997 + slot * 0.37) % 1 > threshold) roundRect(ctx, w.x, w.y, 4, 5, 1, (w.seed * 31) % 1 > 0.8 ? '#fff0c8' : '#f7c873');
  }
}
