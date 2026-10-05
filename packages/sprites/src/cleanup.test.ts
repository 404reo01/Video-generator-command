import { describe, expect, it } from 'vitest';
import { removeStrayPixels } from './cleanup';
import { TRANSPARENT, cropToContent, type IndexedSprite } from './indexed-sprite';

const PALETTE = [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }];

function sprite(rows: string[]): IndexedSprite {
  const width = rows[0]?.length ?? 0;
  const pixels = Int16Array.from(rows.join('').split(''), (c) => (c === '.' ? TRANSPARENT : Number(c)));
  return { width, height: rows.length, pixels, palette: PALETTE };
}

describe('removeStrayPixels', () => {
  it('repaints a lone pixel surrounded by another colour', () => {
    const cleaned = removeStrayPixels(sprite(['000', '010', '000']));
    expect(cleaned.pixels[4]).toBe(0);
  });

  it('keeps a pixel that touches its own colour', () => {
    const cleaned = removeStrayPixels(sprite(['000', '011', '000']));
    expect(cleaned.pixels[4]).toBe(1);
  });

  it('keeps a lone pixel when the neighbourhood has no clear majority', () => {
    const cleaned = removeStrayPixels(sprite(['00.', '01.', '..0']));
    expect(cleaned.pixels[4]).toBe(1);
  });
});

describe('cropToContent', () => {
  it('trims transparent borders and keeps the margin', () => {
    const cropped = cropToContent(sprite(['....', '.01.', '....', '....']), 1);
    expect([cropped.width, cropped.height]).toEqual([4, 3]);
    expect(cropped.pixels[5]).toBe(0);
  });
});
