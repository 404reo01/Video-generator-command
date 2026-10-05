/**
 * Turns an upscaled pixel-art image into an editable character:
 * detect grid -> downsample -> reduce palette -> remove stray pixels -> crop -> write character.json + poses/base.txt.
 *
 * Usage: npm run extract -w @mappa/sprites -- --name reo [--source path.png] [--colors 16] [--force]
 */
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { PALETTE_SYMBOLS, type Character } from '../src/character';
import { characterExists, saveCharacter, savePose } from '../src/character-store';
import { removeStrayPixels } from '../src/cleanup';
import { detectPixelGrid } from '../src/grid-detection';
import { luminance, toHex } from '../src/image';
import { cropToContent } from '../src/indexed-sprite';
import { readPng } from '../src/png';
import { poseFromIndexed } from '../src/pose';
import { quantize } from '../src/quantize';
import { sampleGrid } from '../src/sample-grid';

const TRANSPARENT_SYMBOL = '.';
const CROP_MARGIN = 1;

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    source: { type: 'string' },
    colors: { type: 'string', default: '16' },
    force: { type: 'boolean', default: false },
  },
});

const name = values.name;
if (!name) throw new Error('missing --name (e.g. --name reo)');
if (characterExists(name) && !values.force) {
  throw new Error(`character "${name}" already exists; pass --force to overwrite its palette and base pose`);
}
const maxColors = Number(values.colors);
if (!Number.isInteger(maxColors) || maxColors < 2 || maxColors > PALETTE_SYMBOLS.length) {
  throw new Error(`--colors must be an integer between 2 and ${String(PALETTE_SYMBOLS.length)}`);
}

const sourcePath = values.source ?? join(import.meta.dirname, '..', 'assets', 'source', `${name}.png`);
const source = readPng(sourcePath);
const grid = detectPixelGrid(source);
const quantized = quantize(sampleGrid(source, grid), maxColors);
const sprite = cropToContent(removeStrayPixels(quantized), CROP_MARGIN);

// Darkest colour gets "A": symbols then read roughly from shadow to highlight when editing poses by hand.
const order = sprite.palette.map((color, index) => ({ color, index })).sort((a, b) => luminance(a.color) - luminance(b.color));
const symbols: string[] = [];
const palette: Character['palette'] = {};
order.forEach(({ color, index }, rank) => {
  const symbol = PALETTE_SYMBOLS.charAt(rank);
  symbols[index] = symbol;
  palette[symbol] = { hex: toHex(color), name: `color-${String(rank + 1).padStart(2, '0')}` };
});

const character: Character = { name, width: sprite.width, height: sprite.height, transparent: TRANSPARENT_SYMBOL, palette };
saveCharacter(character);
savePose(character, poseFromIndexed('base', sprite, symbols, TRANSPARENT_SYMBOL));

console.log(`grid: pitch ${grid.pitch.toFixed(2)} px, offset (${String(grid.offsetX)}, ${String(grid.offsetY)}), ${String(grid.columns)} x ${String(grid.rows)} cells`);
console.log(`character "${name}": ${String(sprite.width)} x ${String(sprite.height)} px, ${String(sprite.palette.length)} colours`);
