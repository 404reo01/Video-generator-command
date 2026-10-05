import { describe, expect, it } from 'vitest';
import { createImage, setPixel, toHex } from './image';
import { TRANSPARENT } from './indexed-sprite';
import { quantize } from './quantize';

describe('quantize', () => {
  it('keeps exact colours when there are fewer than the limit', () => {
    const image = createImage(2, 2);
    setPixel(image, 0, 0, { r: 255, g: 0, b: 0, a: 255 });
    setPixel(image, 1, 0, { r: 0, g: 0, b: 255, a: 255 });
    setPixel(image, 0, 1, { r: 255, g: 0, b: 0, a: 255 });
    const sprite = quantize(image, 8);
    expect(sprite.palette.map(toHex).sort()).toEqual(['#0000ff', '#ff0000']);
    expect(sprite.pixels[3]).toBe(TRANSPARENT);
  });

  it('never returns more colours than requested', () => {
    const image = createImage(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) setPixel(image, x, y, { r: x * 16, g: y * 16, b: 128, a: 255 });
    expect(quantize(image, 6).palette.length).toBeLessThanOrEqual(6);
  });

  it('is deterministic for a given seed', () => {
    const image = createImage(8, 8);
    for (let i = 0; i < 64; i++) setPixel(image, i % 8, Math.floor(i / 8), { r: i * 4, g: 255 - i * 4, b: i * 2, a: 255 });
    expect(quantize(image, 4, 7).palette).toEqual(quantize(image, 4, 7).palette);
  });
});
