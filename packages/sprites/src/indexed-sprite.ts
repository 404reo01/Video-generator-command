import type { Rgb } from './image';

export const TRANSPARENT = -1;

/** A sprite as palette indices; `TRANSPARENT` marks empty pixels. */
export interface IndexedSprite {
  readonly width: number;
  readonly height: number;
  readonly pixels: Int16Array;
  readonly palette: readonly Rgb[];
}

/** Crops away fully transparent borders, keeping `margin` empty pixels on each side. */
export function cropToContent(sprite: IndexedSprite, margin: number): IndexedSprite {
  let minX = sprite.width, minY = sprite.height, maxX = -1, maxY = -1;
  for (let y = 0; y < sprite.height; y++) {
    for (let x = 0; x < sprite.width; x++) {
      if (indexAt(sprite, x, y) === TRANSPARENT) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) return sprite;
  const width = maxX - minX + 1 + margin * 2;
  const height = maxY - minY + 1 + margin * 2;
  const pixels = new Int16Array(width * height).fill(TRANSPARENT);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) pixels[(y - minY + margin) * width + (x - minX + margin)] = indexAt(sprite, x, y);
  }
  return { width, height, pixels, palette: sprite.palette };
}

export function indexAt(sprite: IndexedSprite, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) return TRANSPARENT;
  return sprite.pixels[y * sprite.width + x] ?? TRANSPARENT;
}
