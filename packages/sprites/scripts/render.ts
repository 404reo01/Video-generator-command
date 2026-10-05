/**
 * Renders every pose of a character to PNG, plus a side-by-side sheet for review.
 *
 * Usage: npm run render -w @mappa/sprites -- --name reo [--scale 4]
 */
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { loadCharacter, loadPoses } from '../src/character-store';
import { writePng } from '../src/png';
import { composeSheet, renderPose } from '../src/render';

const SHEET_GAP = 16;
const SHEET_BACKGROUND = { r: 43, g: 29, b: 58, a: 255 };

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    scale: { type: 'string', default: '4' },
  },
});

const name = values.name;
if (!name) throw new Error('missing --name (e.g. --name reo)');
const scale = Number(values.scale);
if (!Number.isInteger(scale) || scale < 1) throw new Error('--scale must be a positive integer');

const character = loadCharacter(name);
const poses = loadPoses(character);
const outDir = join(import.meta.dirname, '..', 'out', name);
const images = poses.map((pose) => {
  const image = renderPose(pose, character, scale);
  writePng(join(outDir, `${pose.name}.png`), image);
  return image;
});
writePng(join(outDir, 'sheet.png'), composeSheet(images, SHEET_GAP, SHEET_BACKGROUND));
console.log(`rendered ${String(poses.length)} pose(s) to ${outDir}: ${poses.map((p) => p.name).join(', ')}`);
