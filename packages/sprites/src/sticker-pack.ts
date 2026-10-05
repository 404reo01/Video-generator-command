import { z } from 'zod';

/**
 * `characters/<name>/stickers.json` — a pack of ordinary images (drawings, photos, AI renders)
 * instead of pixel grids. Each emotion is `stickers/<emotion>.png`, all the same size and framing.
 */
export const StickerPackSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/),
  /** `pixel` packs are scaled without smoothing even when they are plain PNGs. */
  style: z.enum(['pixel', 'smooth']),
  /** Face box in image pixels, used to frame close-ups. */
  face: z.object({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative(), width: z.number().int().positive(), height: z.number().int().positive() }),
});
export type StickerPack = z.infer<typeof StickerPackSchema>;
