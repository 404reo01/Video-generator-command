import { describe, expect, it } from 'vitest';
import { createImage, setPixel } from './image';
import { emotionFromFileName, estimateFace, hasTransparentBackground, silhouetteBox } from './sticker-check';

/** 100x200 sticker: a 40px-wide head on top of a 80px-wide body, on a transparent background. */
function figure(): ReturnType<typeof createImage> {
  const image = createImage(100, 200);
  const paint = (x0: number, y0: number, w: number, h: number): void => {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) setPixel(image, x, y, { r: 200, g: 150, b: 120, a: 255 });
  };
  paint(30, 10, 40, 45); // head
  paint(10, 55, 80, 135); // body
  return image;
}

describe('emotionFromFileName', () => {
  it('turns file names into emotion slugs', () => {
    expect(emotionFromFileName('Happy.PNG')).toBe('happy');
    expect(emotionFromFileName('laughing (1).png')).toBe('laughing-1');
    expect(emotionFromFileName('01_neutral.png')).toBe('neutral');
    expect(emotionFromFileName('15_serein.png')).toBe('calm');
    expect(emotionFromFileName('Surpris.png')).toBe('surprised');
  });
});

describe('sticker checks', () => {
  it('detects a transparent background and the silhouette', () => {
    const image = figure();
    expect(hasTransparentBackground(image)).toBe(true);
    expect(silhouetteBox(image)).toEqual({ x: 10, y: 10, width: 80, height: 180 });
  });

  it('rejects an opaque background', () => {
    const image = createImage(10, 10);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) setPixel(image, x, y, { r: 255, g: 255, b: 255, a: 255 });
    expect(hasTransparentBackground(image)).toBe(false);
  });

  it('finds the head at the top of the silhouette', () => {
    const face = estimateFace(figure());
    expect(face?.y).toBe(10);
    expect(face?.x).toBe(30);
    expect(face?.width).toBe(40);
  });
});
