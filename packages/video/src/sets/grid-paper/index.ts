import type { SetDefinition } from '../set-definition';
import { GridLines } from './GridLines';

const MOTES = (() => {
  let seed = 5;
  const random = (): number => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 40 }, () => ({ x: random() * 1400 - 160, y: random() * 2200, size: 6 + Math.floor(random() * 3) * 4, speed: 0.01 + random() * 0.025, hue: random() }));
})();

function paintBackdrop(ctx: CanvasRenderingContext2D): void {
  const g = ctx.createRadialGradient(560, 820, 60, 540, 960, 1300);
  g.addColorStop(0, '#4a2a52');
  g.addColorStop(0.45, '#2b1d3a');
  g.addColorStop(1, '#140f1c');
  ctx.fillStyle = g;
  ctx.fillRect(-400, -400, 1880, 2720);
}

function paintMotes(ctx: CanvasRenderingContext2D, t: number): void {
  for (const m of MOTES) {
    const y = (((m.y - t * m.speed) % 2400) + 2400) % 2400 - 240;
    ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t / 900 + m.hue * 6);
    ctx.fillStyle = m.hue > 0.6 ? '#f7c873' : m.hue > 0.3 ? '#e8743b' : '#f5e6c8';
    ctx.fillRect(m.x, y, m.size, m.size);
  }
  ctx.globalAlpha = 1;
}

function paintFloorGlow(ctx: CanvasRenderingContext2D): void {
  const g = ctx.createRadialGradient(270, 1560, 10, 270, 1560, 260);
  g.addColorStop(0, 'rgba(244,162,89,.35)');
  g.addColorStop(1, 'rgba(244,162,89,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 1300, 560, 520);
  ctx.fillStyle = 'rgba(10,5,15,.45)';
  ctx.beginPath();
  ctx.ellipse(250, 1556, 150, 22, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Neutral backdrop: a dark plum notebook grid with a warm glow and drifting pixel motes. */
export const gridPaper: SetDefinition = {
  id: 'grid-paper',
  description: 'Abstract cosy backdrop: dark plum notebook grid, warm glow, floating pixel motes. Works for any topic.',
  background: '#1d1526',
  layers: [
    { id: 'backdrop', depth: 0.1, paint: paintBackdrop },
    { id: 'grid', depth: 0.45, component: GridLines },
    { id: 'motes', depth: 0.75, paint: paintMotes },
    { id: 'floor-glow', depth: 0.95, paint: paintFloorGlow },
    'character',
  ],
  character: { x: 60, bottom: 1560, height: 640 },
};
