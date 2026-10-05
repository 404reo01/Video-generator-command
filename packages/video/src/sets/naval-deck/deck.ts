import { fillRoundRect, fillVerticalGradient } from '../paint-utils';
import { NAVAL } from './palette';

const MAST_X = 860;
const DECK_Y = 1470;

/** Mast with rigging and a waving pennant on the right, deck planks under the speaker. */
export function paintDeck(ctx: CanvasRenderingContext2D, t: number): void {
  // Rigging lines from the masthead down to the deck.
  ctx.strokeStyle = 'rgba(217,183,126,.75)';
  ctx.lineWidth = 4;
  for (const toX of [520, 1240]) {
    ctx.beginPath();
    ctx.moveTo(MAST_X + 18, 260);
    ctx.lineTo(toX, DECK_Y);
    ctx.stroke();
  }
  fillVerticalGradient(ctx, MAST_X, 200, 36, DECK_Y - 200, [[0, NAVAL.woodLight], [1, NAVAL.woodDark]]);
  ctx.fillStyle = NAVAL.woodDark;
  ctx.fillRect(MAST_X - 140, 640, 316, 18);

  // Pennant: a triangle whose tip waves.
  const wave = Math.sin(t / 220) * 18;
  ctx.fillStyle = NAVAL.orange;
  ctx.beginPath();
  ctx.moveTo(MAST_X + 36, 210);
  ctx.quadraticCurveTo(MAST_X + 110, 220 + wave * 0.5, MAST_X + 190, 232 + wave);
  ctx.lineTo(MAST_X + 36, 262);
  ctx.closePath();
  ctx.fill();

  // Deck planks, slightly lighter towards the viewer.
  fillVerticalGradient(ctx, -300, DECK_Y, 1680, 760, [[0, NAVAL.woodDark], [0.25, NAVAL.wood], [1, '#8a5532']]);
  ctx.strokeStyle = 'rgba(60,32,16,.55)';
  ctx.lineWidth = 3;
  for (let y = DECK_Y + 40; y < 2200; y += 46) {
    ctx.beginPath();
    ctx.moveTo(-300, y);
    ctx.lineTo(1380, y);
    ctx.stroke();
  }
  // Rope coil and a crate by the mast.
  fillRoundRect(ctx, MAST_X - 60, DECK_Y - 120, 150, 130, 10, NAVAL.woodDark);
  ctx.strokeStyle = NAVAL.woodLight;
  ctx.lineWidth = 4;
  ctx.strokeRect(MAST_X - 52, DECK_Y - 112, 134, 114);
  ctx.strokeStyle = NAVAL.rope;
  ctx.lineWidth = 9;
  for (let r = 18; r <= 54; r += 12) {
    ctx.beginPath();
    ctx.ellipse(640, DECK_Y + 30, r * 1.8, r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
