import type { Character } from './character';
import { createImage, fromHex, setPixel, type Rgba, type RgbaImage } from './image';
import type { Pose } from './pose';

const CLEAR: Rgba = { r: 0, g: 0, b: 0, a: 0 };

/** Renders a pose to RGBA, each logical pixel becoming a `scale` x `scale` block (nearest neighbour). */
export function renderPose(pose: Pose, character: Character, scale = 1): RgbaImage {
  const colors = new Map<string, Rgba>(
    Object.entries(character.palette).map(([symbol, entry]) => [symbol, { ...fromHex(entry.hex), a: 255 }]),
  );
  const image = createImage(character.width * scale, character.height * scale);
  pose.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = colors.get(row.charAt(x)) ?? CLEAR;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) setPixel(image, x * scale + dx, y * scale + dy, color);
      }
    }
  });
  return image;
}

/** Lays same-size images out in a grid of `columns`, separated by `gap` pixels of `background`. */
export function composeGrid(images: readonly RgbaImage[], columns: number, gap: number, background: Rgba): RgbaImage {
  const cellW = Math.max(0, ...images.map((img) => img.width));
  const cellH = Math.max(0, ...images.map((img) => img.height));
  const rows = Math.ceil(images.length / columns);
  const sheet = createImage(columns * cellW + (columns + 1) * gap, rows * cellH + (rows + 1) * gap);
  for (let y = 0; y < sheet.height; y++) for (let x = 0; x < sheet.width; x++) setPixel(sheet, x, y, background);
  images.forEach((img, i) => {
    const ox = gap + (i % columns) * (cellW + gap);
    const oy = gap + Math.floor(i / columns) * (cellH + gap);
    for (let y = 0; y < img.height; y++) sheet.data.set(img.data.subarray(y * img.width * 4, (y + 1) * img.width * 4), ((oy + y) * sheet.width + ox) * 4);
  });
  return sheet;
}

/** Lays images out left to right on one sheet, separated by `gap` pixels of `background`. */
export function composeSheet(images: readonly RgbaImage[], gap: number, background: Rgba): RgbaImage {
  const width = images.reduce((sum, img) => sum + img.width, 0) + gap * (images.length + 1);
  const height = Math.max(0, ...images.map((img) => img.height)) + gap * 2;
  const sheet = createImage(width, height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) setPixel(sheet, x, y, background);
  let offsetX = gap;
  for (const img of images) {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4;
        if ((img.data[i + 3] ?? 0) === 0) continue;
        setPixel(sheet, offsetX + x, gap + y, { r: img.data[i] ?? 0, g: img.data[i + 1] ?? 0, b: img.data[i + 2] ?? 0, a: 255 });
      }
    }
    offsetX += img.width + gap;
  }
  return sheet;
}
