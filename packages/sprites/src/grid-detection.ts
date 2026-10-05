import { colorDistance, getPixel, type RgbaImage } from './image';

/** Where the "logical pixels" of an upscaled pixel-art image sit in the source image. */
export interface PixelGrid {
  readonly pitch: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly columns: number;
  readonly rows: number;
}

export interface GridDetectionOptions {
  readonly minPitch?: number;
  readonly maxPitch?: number;
}

const OPAQUE_ALPHA = 128;
const PITCH_STEP = 0.01;
const OFFSET_STEP = 0.05;

/**
 * Edge profile along one axis: entry `i` sums how much colour changes between line `i - 1` and line `i`.
 * In upscaled pixel art, colour only changes at logical-pixel boundaries, so peaks mark the grid.
 */
function edgeProfile(image: RgbaImage, axis: 'x' | 'y'): Float64Array {
  const length = axis === 'x' ? image.width : image.height;
  const span = axis === 'x' ? image.height : image.width;
  const profile = new Float64Array(length);
  for (let i = 1; i < length; i++) {
    let sum = 0;
    for (let j = 0; j < span; j++) {
      const a = axis === 'x' ? getPixel(image, i - 1, j) : getPixel(image, j, i - 1);
      const b = axis === 'x' ? getPixel(image, i, j) : getPixel(image, j, i);
      if (a.a < OPAQUE_ALPHA && b.a < OPAQUE_ALPHA) continue;
      sum += a.a < OPAQUE_ALPHA || b.a < OPAQUE_ALPHA ? 255 : Math.sqrt(colorDistance(a, b));
    }
    profile[i] = sum;
  }
  return profile;
}

/**
 * Score of a grid on one axis: (edge energy found on predicted boundaries)^2 / (number of boundaries).
 * Equivalent to precision x recall, so it peaks at the true pitch: a multiple of it misses half the
 * boundaries (recall halves) and a fraction of it predicts boundaries inside pixels (precision halves).
 */
function axisScore(profile: Float64Array, pitch: number, offset: number): number {
  let captured = 0;
  let count = 0;
  for (let b = offset; b < profile.length - 1; b += pitch) {
    if (b < 1) continue;
    // Linear interpolation rather than max(floor, ceil): a 1 px tolerance would let nearby pitches tie.
    const frac = b - Math.floor(b);
    captured += (profile[Math.floor(b)] ?? 0) * (1 - frac) + (profile[Math.ceil(b)] ?? 0) * frac;
    count += 1;
  }
  return count === 0 ? 0 : (captured * captured) / count;
}

function bestOffset(profile: Float64Array, pitch: number): { offset: number; score: number } {
  let best = { offset: 0, score: -1 };
  for (let offset = 0; offset < pitch; offset += OFFSET_STEP) {
    const score = axisScore(profile, pitch, offset);
    if (score > best.score) best = { offset: Number(offset.toFixed(2)), score };
  }
  return best;
}

/** Finds the (possibly non-integer) pixel pitch and offset of an upscaled, anti-aliased pixel-art image. */
export function detectPixelGrid(image: RgbaImage, options: GridDetectionOptions = {}): PixelGrid {
  const minPitch = options.minPitch ?? 3;
  const maxPitch = options.maxPitch ?? 16;
  const columnsProfile = edgeProfile(image, 'x');
  const rowsProfile = edgeProfile(image, 'y');

  let best = { pitch: minPitch, offsetX: 0, offsetY: 0, score: -1 };
  for (let pitch = minPitch; pitch <= maxPitch + 1e-9; pitch += PITCH_STEP) {
    const x = bestOffset(columnsProfile, pitch);
    const y = bestOffset(rowsProfile, pitch);
    const score = x.score + y.score;
    if (score > best.score) best = { pitch: Number(pitch.toFixed(2)), offsetX: x.offset, offsetY: y.offset, score };
  }

  return {
    pitch: best.pitch,
    offsetX: best.offsetX,
    offsetY: best.offsetY,
    columns: Math.floor((image.width - best.offsetX) / best.pitch),
    rows: Math.floor((image.height - best.offsetY) / best.pitch),
  };
}
