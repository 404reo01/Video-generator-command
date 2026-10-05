import { z } from 'zod';

/**
 * `public/characters/<name>/manifest.json` — what the video knows about a character's sticker pack.
 * One PNG per emotion, all with the same size and framing; the file name IS the emotion.
 */
const Px = z.number().int().nonnegative();
export const EmotionSchema = z.string().regex(/^[a-z0-9-]+$/, 'emotion names are lowercase slugs, e.g. "surprised"');
export type Emotion = z.infer<typeof EmotionSchema>;

export const CharacterManifestSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/),
  /** `pixel` stickers are scaled by whole factors without smoothing; `smooth` ones are normal images. */
  style: z.enum(['pixel', 'smooth']),
  width: Px,
  height: Px,
  emotions: z.array(EmotionSchema).min(1),
  /** Face box in sticker pixels: the camera frames it for close-ups. */
  face: z.object({ x: Px, y: Px, width: Px, height: Px }),
});
export type CharacterManifest = z.infer<typeof CharacterManifestSchema>;

/**
 * Recommended emotion names. Packs may use others; when a plan asks for a missing emotion,
 * the closest available one is used (see `resolveEmotion`).
 */
export const EMOTION_FALLBACKS: Readonly<Record<string, readonly string[]>> = {
  neutral: ['calm', 'explaining', 'happy'],
  calm: ['neutral'],
  happy: ['laughing', 'excited', 'proud', 'neutral'],
  laughing: ['happy', 'excited'],
  excited: ['happy', 'surprised', 'laughing'],
  proud: ['happy', 'neutral'],
  explaining: ['neutral', 'pointing'],
  pointing: ['explaining', 'idea'],
  thinking: ['confused', 'neutral', 'calm'],
  confused: ['thinking', 'surprised'],
  surprised: ['excited', 'confused'],
  idea: ['pointing', 'happy', 'excited'],
  serious: ['neutral', 'thinking'],
  sad: ['calm', 'serious', 'neutral'],
  angry: ['serious', 'surprised'],
  wink: ['happy', 'laughing'],
};

/** Picks the emotion to display: the requested one, else its closest fallback, else neutral, else the first. */
export function resolveEmotion(requested: string, available: readonly string[]): string {
  if (available.includes(requested)) return requested;
  const fallback = (EMOTION_FALLBACKS[requested] ?? []).find((e) => available.includes(e));
  return fallback ?? (available.includes('neutral') ? 'neutral' : (available[0] ?? requested));
}
