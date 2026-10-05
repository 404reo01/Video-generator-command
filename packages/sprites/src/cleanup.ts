import { TRANSPARENT, indexAt, type IndexedSprite } from './indexed-sprite';

// Neighbours (out of 8) that must agree before a lone pixel is repainted with their colour.
const MAJORITY = 5;

function neighbours(sprite: IndexedSprite, x: number, y: number): number[] {
  const values: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx !== 0 || dy !== 0) values.push(indexAt(sprite, x + dx, y + dy));
    }
  }
  return values;
}

function mostFrequent(values: readonly number[]): { value: number; count: number } {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = { value: TRANSPARENT, count: 0 };
  for (const [value, count] of counts) if (count > best.count) best = { value, count };
  return best;
}

/**
 * Repaints stray pixels — a pixel sharing its colour with none of its 8 neighbours
 * while most of them agree on another colour (or on transparency). Those are
 * artefacts of downsampling an AI-upscaled image, never intentional detail.
 */
export function removeStrayPixels(sprite: IndexedSprite): IndexedSprite {
  const pixels = Int16Array.from(sprite.pixels);
  for (let y = 0; y < sprite.height; y++) {
    for (let x = 0; x < sprite.width; x++) {
      const current = indexAt(sprite, x, y);
      const around = neighbours(sprite, x, y);
      if (around.includes(current)) continue;
      const majority = mostFrequent(around);
      if (majority.count >= MAJORITY) pixels[y * sprite.width + x] = majority.value;
    }
  }
  return { ...sprite, pixels };
}
