import type { MonitorState } from './options';
import { COLORS } from '../../theme/tokens';
import { DESK_Y, glow, H, OVERSCAN, roundRect, W, type Ctx } from './primitives';

const CODE_ROWS: readonly (readonly (readonly [string, number])[])[] = [
  [[COLORS.orange, 26], [COLORS.cream, 40], [COLORS.sage, 30]],
  [[COLORS.cream, 18], [COLORS.dusk, 34]],
  [[COLORS.orange, 22], [COLORS.amber, 26], [COLORS.cream, 44]],
  [[COLORS.cream, 12], [COLORS.sage, 56]],
  [[COLORS.dusk, 30], [COLORS.cream, 30]],
  [[COLORS.orange, 40], [COLORS.cream, 20], [COLORS.amber, 22]],
  [[COLORS.cream, 16], [COLORS.sage, 40], [COLORS.cream, 14]],
  [[COLORS.dusk, 24], [COLORS.orange, 30]],
];

/** Desk surface, monitor, keyboard, mouse, books and mug. Drawn in front of the character. */
export function paintDesk(ctx: Ctx, monitor: MonitorState): void {
  if (monitor === 'code') glow(ctx, 455, DESK_Y, 200, COLORS.orange, 0.22);
  const top = ctx.createLinearGradient(0, DESK_Y, 0, DESK_Y + 30);
  top.addColorStop(0, COLORS.woodLight);
  top.addColorStop(0.12, COLORS.woodMid);
  top.addColorStop(1, '#7a4c30');
  ctx.fillStyle = top;
  // Overscan left/right/bottom: the foreground layer moves more than the camera.
  ctx.fillRect(-OVERSCAN, DESK_Y, W + OVERSCAN * 2, 30);
  const front = ctx.createLinearGradient(0, DESK_Y + 30, 0, H);
  front.addColorStop(0, '#5e3920');
  front.addColorStop(1, '#3a2216');
  ctx.fillStyle = front;
  ctx.fillRect(-OVERSCAN, DESK_Y + 30, W + OVERSCAN * 2, H - DESK_Y - 30 + OVERSCAN);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.fillRect(0, DESK_Y + 30, W, 4);
  ctx.strokeStyle = 'rgba(255,220,180,.06)';
  ctx.lineWidth = 2;
  for (let y = DESK_Y + 50; y < H; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(180, y - 6, 360, y + 6, W, y);
    ctx.stroke();
  }

  roundRect(ctx, 448, 790, 16, 28, 2, '#241a33');
  ctx.fillStyle = '#241a33';
  ctx.beginPath();
  ctx.ellipse(456, DESK_Y + 4, 34, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, 378, 680, 156, 114, 8, '#161020');

  roundRect(ctx, 236, DESK_Y + 8, 140, 18, 4, '#241a33');
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 13; k++) {
      const lit = (r === 1 && (k === 2 || k === 9)) || (r === 2 && k === 6);
      roundRect(ctx, 242 + k * 10.2, DESK_Y + 11 + r * 4.6, 8, 3.4, 1, lit ? COLORS.amber : COLORS.plum2);
    }
  }
  roundRect(ctx, 388, DESK_Y + 9, 16, 16, 8, '#241a33');

  roundRect(ctx, 12, DESK_Y - 22, 74, 10, 2, COLORS.coral);
  roundRect(ctx, 18, DESK_Y - 12, 66, 12, 2, COLORS.dusk);
  roundRect(ctx, 10, DESK_Y - 32, 70, 10, 2, '#d9c7a3');

  ctx.strokeStyle = COLORS.cream;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(230, DESK_Y - 22, 10, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  roundRect(ctx, 196, DESK_Y - 40, 34, 40, 5, COLORS.cream);
  ctx.fillStyle = COLORS.orange;
  ctx.fillRect(196, DESK_Y - 24, 34, 6);
  ctx.fillStyle = COLORS.coffee;
  ctx.beginPath();
  ctx.ellipse(213, DESK_Y - 38, 15, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(222, DESK_Y - 40, 8, 40);
}

/** Monitor content: scrolling coloured code lines, or a dark screen. */
export function paintScreen(ctx: Ctx, t: number, monitor: MonitorState): void {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(386, 688, 140, 98, 4);
  ctx.clip();
  const g = ctx.createLinearGradient(0, 688, 0, 786);
  g.addColorStop(0, monitor === 'code' ? COLORS.plum : '#120d1c');
  g.addColorStop(1, monitor === 'code' ? '#221830' : '#0c0914');
  ctx.fillStyle = g;
  ctx.fillRect(386, 688, 140, 98);
  if (monitor === 'code') {
    const lineH = 11;
    const scroll = (t / 55) % (CODE_ROWS.length * lineH);
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 12; i++) {
      const y = 698 + i * lineH - (scroll % lineH);
      const row = CODE_ROWS[(i + Math.floor(scroll / lineH)) % CODE_ROWS.length] ?? [];
      let x = 396 + (i % 3 === 1 ? 10 : 0);
      for (const [color, w] of row) {
        roundRect(ctx, x, y, w * 0.9, 4, 2, color);
        x += w * 0.9 + 5;
      }
    }
  }
  ctx.restore();
  if (monitor === 'code') glow(ctx, 456, 736, 120, COLORS.amber, 0.08);
}

export function paintSteam(ctx: Ctx, t: number): void {
  ctx.save();
  ctx.lineCap = 'round';
  for (const [x, phase] of [[206, 0], [220, 1.9]] as const) {
    for (let i = 0; i < 3; i++) {
      const k = (t / 2200 + i / 3 + phase / 7) % 1;
      const y = DESK_Y - 44 - k * 70;
      ctx.strokeStyle = `rgba(245,230,200,${(0.32 * (1 - k)).toFixed(3)})`;
      ctx.lineWidth = 4 - k * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(t / 500 + phase + i) * 4, y + 16);
      ctx.bezierCurveTo(x - 8, y + 8, x + 8, y, x + Math.sin(t / 420 + i + phase) * 6, y - 12);
      ctx.stroke();
    }
  }
  ctx.restore();
}
