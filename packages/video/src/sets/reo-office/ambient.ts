import { imageLayerRect } from '../set-definition';

/**
 * Ambient motion painted over the illustrated images. Positions are measured on the 1080x1920 source
 * images (library/sets/reo-office/) and converted to world coordinates with the image overscan.
 */
const RECT = imageLayerRect();
const SCALE = RECT.width / 1080;
const wx = (x: number): number => RECT.x + x * SCALE;
const wy = (y: number): number => RECT.y + y * SCALE;

const MUG = { x: wx(368), y: wy(1210) };
const CAT = { x: wx(745), y: wy(845) };
const LAMP = { x: wx(335), y: wy(318) };
const SCREEN = { x: wx(610), y: wy(940), width: 320 * SCALE, height: 220 * SCALE };
const WINDOW = { x: wx(400), y: wy(210), width: 510 * SCALE, height: 700 * SCALE };

const MOTES = Array.from({ length: 26 }, (_, i) => ({ x: (i * 0.618) % 1, y: (i * 0.377) % 1, speed: 0.004 + ((i * 7) % 5) * 0.002, phase: i * 1.7 }));

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

/** Behind the character: dust in the window light, the lamp's breathing glow, the cat's "z". */
export function paintRoomAmbience(ctx: CanvasRenderingContext2D, t: number): void {
  glow(ctx, LAMP.x, LAMP.y + 20, 260, '#ffd27a', 0.16 + 0.03 * Math.sin(t / 1400));
  for (const m of MOTES) {
    const y = WINDOW.y + ((m.y * WINDOW.height - t * m.speed) % WINDOW.height + WINDOW.height) % WINDOW.height;
    const x = WINDOW.x + m.x * WINDOW.width + Math.sin(t / 1600 + m.phase) * 12;
    ctx.globalAlpha = 0.18 + 0.15 * Math.sin(t / 700 + m.phase);
    ctx.fillStyle = '#fff1c9';
    ctx.fillRect(Math.round(x), Math.round(y), 4, 4);
  }
  ctx.globalAlpha = 1;
  const k = (t % 2800) / 2800;
  ctx.globalAlpha = Math.sin(k * Math.PI) * 0.85;
  ctx.fillStyle = '#f7efe1';
  ctx.font = `bold ${String(Math.round(22 + k * 14))}px monospace`;
  ctx.fillText('z', CAT.x + k * 30, CAT.y - k * 70);
  ctx.globalAlpha = 1;
}

/** In front of the desk: the screen's soft glow and steam rising from the mug. */
export function paintDeskAmbience(ctx: CanvasRenderingContext2D, t: number): void {
  glow(ctx, SCREEN.x + SCREEN.width / 2, SCREEN.y + SCREEN.height / 2, 300, '#7aa2ff', 0.07 + 0.02 * Math.sin(t / 900));
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const k = (t / 2400 + i / 3) % 1;
    const y = MUG.y - 10 - k * 110;
    ctx.strokeStyle = `rgba(245,236,220,${(0.42 * (1 - k)).toFixed(3)})`;
    ctx.lineWidth = 7 - k * 4;
    ctx.beginPath();
    ctx.moveTo(MUG.x + Math.sin(t / 500 + i) * 6, y + 26);
    ctx.bezierCurveTo(MUG.x - 14, y + 12, MUG.x + 14, y, MUG.x + Math.sin(t / 420 + i * 2) * 9, y - 20);
    ctx.stroke();
  }
}
