import { z } from 'zod';

// 30 fps: standard for TikTok/Reels/LinkedIn vertical video and halves render time vs 60 fps.
export const DEFAULT_FPS = 30;

export const FpsSchema = z.number().int().positive();

/** Frame on which a moment in milliseconds falls. Floors so a word never appears before it is spoken. */
export function msToFrame(ms: number, fps: number = DEFAULT_FPS): number {
  if (ms < 0) throw new RangeError(`ms must be >= 0, received ${String(ms)}`);
  return Math.floor((ms / 1000) * FpsSchema.parse(fps));
}

/** Start time of a frame in milliseconds. */
export function frameToMs(frame: number, fps: number = DEFAULT_FPS): number {
  if (frame < 0) throw new RangeError(`frame must be >= 0, received ${String(frame)}`);
  return (frame / FpsSchema.parse(fps)) * 1000;
}
