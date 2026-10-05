import { getPixel, type RgbaImage } from '@mappa/sprites';
import { IMAGE_OVERSCAN } from '../src/sets/set-definition';

// A row counts as the desk top when opaque pixels cover this share of the width: objects standing on the
// desk (books, screen, plant) can cover more than half of it, the desk top itself spans nearly all of it.
const DESK_ROW_COVERAGE = 0.8;
const OPAQUE = 128;
// Allowed deviation from 9:16 before an image is rejected.
const ASPECT_TOLERANCE = 0.03;

/** Character placement relative to the desk top, tuned on cozy-desk: head around 380 px above the desk. */
export const BEHIND_DESK = { x: 30, height: 600, belowDeskTop: 100 } as const;
/** Without a foreground the character stands full-body on the floor, above TikTok's bottom UI. */
export const FULL_BODY = { x: 60, bottom: 1560, height: 640 } as const;

export function isVertical916(image: RgbaImage): boolean {
  return Math.abs(image.width / image.height - 9 / 16) <= (9 / 16) * ASPECT_TOLERANCE;
}

/** First row (from the top) where the foreground is mostly opaque: the top edge of the desk. */
export function detectDeskTop(foreground: RgbaImage): number | null {
  for (let y = 0; y < foreground.height; y++) {
    let opaque = 0;
    for (let x = 0; x < foreground.width; x++) if (getPixel(foreground, x, y).a >= OPAQUE) opaque++;
    if (opaque / foreground.width >= DESK_ROW_COVERAGE) return y;
  }
  return null;
}

/** Share of the top half of an image that is transparent: a foreground must leave the scene visible. */
export function topHalfTransparency(image: RgbaImage): number {
  let transparent = 0;
  const rows = Math.floor(image.height / 2);
  for (let y = 0; y < rows; y++) for (let x = 0; x < image.width; x++) if (getPixel(image, x, y).a < OPAQUE) transparent++;
  return transparent / (rows * image.width);
}

/** Image row -> world y, for an image layer drawn on its overscanned rectangle. */
export function imageRowToWorldY(row: number, imageHeight: number): number {
  return -960 * IMAGE_OVERSCAN + (row / imageHeight) * 1920 * (1 + IMAGE_OVERSCAN);
}

/** Average colour of an image, as #rrggbb: the set's fallback background. */
export function averageColor(image: RgbaImage): string {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < image.height; y += 8) {
    for (let x = 0; x < image.width; x += 8) {
      const p = getPixel(image, x, y);
      r += p.r;
      g += p.g;
      b += p.b;
      n++;
    }
  }
  const hex = (v: number): string => Math.round(v / Math.max(1, n)).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export function camelCase(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}
