import type { PixelGrid } from './grid-detection';
import { createImage, getPixel, setPixel, type RgbaImage } from './image';

// Alpha above which a logical pixel is kept; anti-aliased edges below it become transparent.
const OPAQUE_ALPHA = 140;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Downsamples an upscaled image to one pixel per grid cell.
 * Uses the per-channel median of the 3x3 block around each cell centre to ignore anti-aliasing noise.
 */
export function sampleGrid(image: RgbaImage, grid: PixelGrid): RgbaImage {
  const out = createImage(grid.columns, grid.rows);
  for (let gy = 0; gy < grid.rows; gy++) {
    for (let gx = 0; gx < grid.columns; gx++) {
      const cx = Math.round(grid.offsetX + (gx + 0.5) * grid.pitch);
      const cy = Math.round(grid.offsetY + (gy + 0.5) * grid.pitch);
      const r: number[] = [];
      const g: number[] = [];
      const b: number[] = [];
      const a: number[] = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const p = getPixel(image, Math.min(image.width - 1, Math.max(0, cx + dx)), Math.min(image.height - 1, Math.max(0, cy + dy)));
          r.push(p.r);
          g.push(p.g);
          b.push(p.b);
          a.push(p.a);
        }
      }
      const alpha = median(a) >= OPAQUE_ALPHA ? 255 : 0;
      setPixel(out, gx, gy, { r: median(r), g: median(g), b: median(b), a: alpha });
    }
  }
  return out;
}
