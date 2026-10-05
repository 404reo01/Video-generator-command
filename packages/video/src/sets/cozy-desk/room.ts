import { COLORS } from '../../theme/tokens';
import { glow, H, OVERSCAN, roundRect, W, WINDOW, type Ctx } from './primitives';

/** Wall with the window cut out, window frame, sill, plant and hanging lamp. */
export function paintRoom(ctx: Ctx): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(-OVERSCAN, -OVERSCAN, W + OVERSCAN * 2, H + OVERSCAN * 2);
  ctx.rect(WINDOW.x1, WINDOW.y0, WINDOW.x0 - WINDOW.x1, WINDOW.y1 - WINDOW.y0);
  ctx.clip('evenodd');
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#2f1d2c');
  wall.addColorStop(0.6, '#3b2534');
  wall.addColorStop(1, '#2a1a27');
  ctx.fillStyle = wall;
  ctx.fillRect(-OVERSCAN, -OVERSCAN, W + OVERSCAN * 2, H + OVERSCAN * 2);
  ctx.restore();

  ctx.strokeStyle = COLORS.frame;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.roundRect(WINDOW.x0 - 7, WINDOW.y0 - 7, WINDOW.x1 - WINDOW.x0 + 14, WINDOW.y1 - WINDOW.y0 + 14, 6);
  ctx.stroke();
  ctx.strokeStyle = '#7a5038';
  ctx.lineWidth = 2;
  ctx.strokeRect(WINDOW.x0, WINDOW.y0, WINDOW.x1 - WINDOW.x0, WINDOW.y1 - WINDOW.y0);
  ctx.fillStyle = COLORS.frame;
  ctx.fillRect(266, WINDOW.y0, 9, WINDOW.y1 - WINDOW.y0);
  ctx.fillRect(WINDOW.x0, 286, WINDOW.x1 - WINDOW.x0, 9);

  ctx.fillStyle = 'rgba(255,240,210,.05)';
  for (const [x, w] of [[60, 40], [120, 14], [320, 50], [395, 16]] as const) {
    ctx.beginPath();
    ctx.moveTo(x, WINDOW.y0);
    ctx.lineTo(x + w, WINDOW.y0);
    ctx.lineTo(x + w - 90, WINDOW.y1);
    ctx.lineTo(x - 90, WINDOW.y1);
    ctx.closePath();
    ctx.fill();
  }

  roundRect(ctx, WINDOW.x0 - 22, WINDOW.y1 + 2, WINDOW.x1 - WINDOW.x0 + 44, 18, 4, COLORS.wood);
  ctx.fillStyle = COLORS.woodLight;
  ctx.fillRect(WINDOW.x0 - 20, WINDOW.y1 + 3, WINDOW.x1 - WINDOW.x0 + 40, 2);

  roundRect(ctx, 440, WINDOW.y1 - 30, 36, 32, 5, COLORS.coral);
  ctx.fillStyle = '#e07a55';
  ctx.fillRect(442, WINDOW.y1 - 30, 32, 4);
  ctx.fillStyle = '#5f8a4f';
  for (const [x, y, rx, ry, a] of [[458, -52, 9, 22, -0.3], [446, -46, 8, 18, -0.9], [472, -46, 8, 18, 0.8], [458, -66, 7, 16, 0.1]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, WINDOW.y1 + y, rx, ry, a, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = COLORS.night;
  ctx.fillRect(409, 0, 2, 78);
  const shade = ctx.createLinearGradient(380, 78, 440, 104);
  shade.addColorStop(0, COLORS.amber);
  shade.addColorStop(1, COLORS.coral);
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.moveTo(396, 78);
  ctx.lineTo(424, 78);
  ctx.lineTo(442, 104);
  ctx.lineTo(378, 104);
  ctx.closePath();
  ctx.fill();
  roundRect(ctx, 400, 102, 20, 7, 3, '#fff0c8');
  glow(ctx, 410, 112, 210, COLORS.honey, 0.28);
}
