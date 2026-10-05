import { createImage, setPixel } from '@mappa/sprites';
import { describe, expect, it } from 'vitest';
import { camelCase, detectDeskTop, imageRowToWorldY, isVertical916, topHalfTransparency } from './image-set';

function foreground(width: number, height: number, deskTop: number): ReturnType<typeof createImage> {
  const image = createImage(width, height);
  for (let y = deskTop; y < height; y++) for (let x = 0; x < width; x++) setPixel(image, x, y, { r: 120, g: 80, b: 50, a: 255 });
  // Objects standing on the desk (here covering 60% of the width) must not be taken for the desk top.
  for (let y = deskTop - 20; y < deskTop; y++) for (let x = 0; x < width * 0.6; x++) setPixel(image, x, y, { r: 20, g: 20, b: 30, a: 255 });
  return image;
}

describe('image sets', () => {
  it('accepts 9:16 images only', () => {
    expect(isVertical916(createImage(1080, 1920))).toBe(true);
    expect(isVertical916(createImage(1080, 1080))).toBe(false);
  });

  it('finds the desk top below the objects standing on it', () => {
    expect(detectDeskTop(foreground(90, 160, 130))).toBe(130);
  });

  it('measures how much of the top half is see-through', () => {
    expect(topHalfTransparency(foreground(90, 160, 130))).toBe(1);
  });

  it('maps image rows to world y with the overscan', () => {
    expect(imageRowToWorldY(0, 1920)).toBeLessThan(0);
    expect(imageRowToWorldY(960, 1920)).toBeCloseTo(960, 6);
  });

  it('turns set ids into identifiers', () => {
    expect(camelCase('my-cozy-office-2')).toBe('myCozyOffice2');
  });
});
