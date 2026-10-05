import type { RgbaImage } from './image';

export interface FaceBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// Alpha below this counts as background.
const OPAQUE = 32;
// A sticker needs a transparent background: at least this share of transparent pixels.
const MIN_TRANSPARENT_SHARE = 0.05;
// In a head-to-hips framing, the face sits in roughly the top quarter of the silhouette.
const FACE_SHARE_OF_HEIGHT = 0.26;

export const RECOMMENDED_EMOTIONS = [
  'neutral', 'happy', 'thinking', 'explaining', 'pointing', 'surprised',
  'laughing', 'confused', 'proud', 'serious', 'idea', 'calm', 'wink', 'sad', 'angry',
] as const;

/** French (and common) names people give their stickers, mapped to the standard emotion names. */
const EMOTION_ALIASES: Readonly<Record<string, string>> = {
  neutre: 'neutral', content: 'happy', joyeux: 'happy', heureux: 'happy', sourire: 'happy',
  pensif: 'thinking', reflechit: 'thinking', reflexion: 'thinking', explique: 'explaining', explication: 'explaining',
  montre: 'pointing', pointe: 'pointing', surpris: 'surprised', etonne: 'surprised', rire: 'laughing', rigole: 'laughing',
  confus: 'confused', perdu: 'confused', fier: 'proud', serieux: 'serious', idee: 'idea', serein: 'calm', calme: 'calm',
  'clin-d-oeil': 'wink', triste: 'sad', colere: 'angry', enerve: 'angry',
};

/**
 * File names become emotion slugs: "Happy.PNG" -> "happy", "01_neutral.png" -> "neutral" (order prefixes
 * are dropped), "serein.png" -> "calm" (French names are mapped to the standard emotions).
 */
export function emotionFromFileName(file: string): string {
  const slug = file
    .replace(/\.png$/i, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^\d+[\s._-]*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return EMOTION_ALIASES[slug] ?? slug;
}

export function transparentShare(image: RgbaImage): number {
  let transparent = 0;
  for (let i = 3; i < image.data.length; i += 4) if ((image.data[i] ?? 0) < OPAQUE) transparent++;
  return transparent / (image.width * image.height);
}

export function hasTransparentBackground(image: RgbaImage): boolean {
  return transparentShare(image) >= MIN_TRANSPARENT_SHARE;
}

/** Bounding box of the opaque pixels. */
export function silhouetteBox(image: RgbaImage): FaceBox | null {
  let minX = image.width, minY = image.height, maxX = -1, maxY = -1;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if ((image.data[(y * image.width + x) * 4 + 3] ?? 0) < OPAQUE) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  return maxX < 0 ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const percentile = (values: number[], p: number): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] ?? 0;
};

/**
 * Estimates the face box of a head-to-hips sticker: the top ~quarter of the silhouette, horizontally
 * bounded by the typical left/right edges of those rows (percentiles ignore raised hands and hair tufts).
 * A guess to check on the preview sheet, editable in stickers.json.
 */
export function estimateFace(image: RgbaImage): FaceBox | null {
  const body = silhouetteBox(image);
  if (!body) return null;
  const bandHeight = Math.max(1, Math.round(body.height * FACE_SHARE_OF_HEIGHT));
  const lefts: number[] = [];
  const rights: number[] = [];
  for (let y = body.y; y < body.y + bandHeight; y++) {
    let left = -1, right = -1;
    for (let x = body.x; x < body.x + body.width; x++) {
      if ((image.data[(y * image.width + x) * 4 + 3] ?? 0) < OPAQUE) continue;
      if (left < 0) left = x;
      right = x;
    }
    if (left >= 0) {
      lefts.push(left);
      rights.push(right);
    }
  }
  if (lefts.length === 0) return null;
  const x = percentile(lefts, 0.5);
  const width = Math.max(1, percentile(rights, 0.5) - x + 1);
  return { x, y: body.y, width, height: bandHeight };
}
