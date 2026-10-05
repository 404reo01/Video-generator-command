import { colorDistance, getPixel, type Rgb, type RgbaImage } from './image';
import { TRANSPARENT, type IndexedSprite } from './indexed-sprite';

const ITERATIONS = 24;
// Two clusters closer than this (weighted squared distance) are visually the same colour and get merged.
const MERGE_DISTANCE = 300;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function nearest(color: Rgb, palette: readonly Rgb[]): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  palette.forEach((p, i) => {
    const d = colorDistance(color, p);
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  });
  return best;
}

/** k-means++ seeding: deterministic for a given seed so re-running extraction gives the same palette. */
function seedCentroids(colors: readonly Rgb[], k: number, random: () => number): Rgb[] {
  const first = colors[Math.floor(random() * colors.length)];
  if (!first) return [];
  const centroids: Rgb[] = [first];
  while (centroids.length < k) {
    const weights = colors.map((c) => colorDistance(c, centroids[nearest(c, centroids)] ?? first));
    const total = weights.reduce((s, w) => s + w, 0);
    if (total === 0) break;
    let pick = random() * total;
    let index = 0;
    for (; index < weights.length - 1; index++) {
      pick -= weights[index] ?? 0;
      if (pick <= 0) break;
    }
    centroids.push(colors[index] ?? first);
  }
  return centroids;
}

function mergeClose(palette: readonly Rgb[]): Rgb[] {
  const merged: Rgb[] = [];
  for (const color of palette) {
    if (!merged.some((m) => colorDistance(m, color) < MERGE_DISTANCE)) merged.push(color);
  }
  return merged;
}

/** Reduces an image to at most `maxColors` opaque colours with k-means. */
export function quantize(image: RgbaImage, maxColors: number, seed = 1): IndexedSprite {
  const opaque: Rgb[] = [];
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const p = getPixel(image, x, y);
      if (p.a > 0) opaque.push({ r: p.r, g: p.g, b: p.b });
    }
  }

  let palette = seedCentroids(opaque, maxColors, seededRandom(seed));
  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    const sums = palette.map(() => ({ r: 0, g: 0, b: 0, n: 0 }));
    for (const color of opaque) {
      const sum = sums[nearest(color, palette)];
      if (!sum) continue;
      sum.r += color.r;
      sum.g += color.g;
      sum.b += color.b;
      sum.n += 1;
    }
    palette = sums.filter((s) => s.n > 0).map((s) => ({ r: Math.round(s.r / s.n), g: Math.round(s.g / s.n), b: Math.round(s.b / s.n) }));
  }
  palette = mergeClose(palette);

  const pixels = new Int16Array(image.width * image.height).fill(TRANSPARENT);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const p = getPixel(image, x, y);
      if (p.a > 0) pixels[y * image.width + x] = nearest(p, palette);
    }
  }
  return { width: image.width, height: image.height, pixels, palette };
}
