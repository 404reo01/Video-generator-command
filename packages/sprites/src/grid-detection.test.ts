import { describe, expect, it } from 'vitest';
import { detectPixelGrid } from './grid-detection';
import { createImage, setPixel } from './image';

/** Builds an upscaled random-colour pixel-art image with a known, non-integer pitch. */
function upscaledFixture(columns: number, rows: number, pitch: number, offset: number): ReturnType<typeof createImage> {
  let seed = 3;
  const random = (): number => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const cells = Array.from({ length: columns * rows }, () => ({
    r: Math.floor(random() * 256),
    g: Math.floor(random() * 256),
    b: Math.floor(random() * 256),
    a: 255,
  }));
  const width = Math.ceil(offset + columns * pitch);
  const height = Math.ceil(offset + rows * pitch);
  const image = createImage(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx = Math.floor((x - offset) / pitch);
      const gy = Math.floor((y - offset) / pitch);
      const cell = gx >= 0 && gy >= 0 && gx < columns && gy < rows ? cells[gy * columns + gx] : undefined;
      if (cell) setPixel(image, x, y, cell);
    }
  }
  return image;
}

describe('detectPixelGrid', () => {
  it('recovers a non-integer pitch and the grid size', () => {
    const grid = detectPixelGrid(upscaledFixture(20, 24, 7.46, 2), { minPitch: 4, maxPitch: 12 });
    expect(grid.pitch).toBeCloseTo(7.46, 1);
    expect(grid.columns).toBe(20);
    expect(grid.rows).toBe(24);
  });

  it('does not lock onto half the true pitch', () => {
    const grid = detectPixelGrid(upscaledFixture(16, 16, 8, 0), { minPitch: 3, maxPitch: 12 });
    expect(grid.pitch).toBeCloseTo(8, 1);
  });
});
