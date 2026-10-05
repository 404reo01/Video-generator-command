import { z } from 'zod';

const Ms = z.number().int().nonnegative();

export const TimeSpanSchema = z
  .object({ startMs: Ms, endMs: Ms })
  .refine((s) => s.endMs >= s.startMs, { message: 'endMs must be >= startMs' });
export type TimeSpan = z.infer<typeof TimeSpanSchema>;

/** `transcript.json` — every spoken token of the source audio, fillers included (verbatim). */
export const TranscriptWordSchema = z.object({
  text: z.string().min(1),
  startMs: Ms,
  endMs: Ms,
  /** `event` = non-speech sound tagged by the provider, e.g. "(rires)". */
  kind: z.enum(['word', 'event']),
  confidence: z.number().min(0).max(1).optional(),
});
export type TranscriptWord = z.infer<typeof TranscriptWordSchema>;

export const TranscriptSchema = z.object({
  provider: z.string().min(1),
  language: z.string().min(2),
  durationMs: Ms,
  words: z.array(TranscriptWordSchema),
});
export type Transcript = z.infer<typeof TranscriptSchema>;

/** `cuts.json` — what gets removed from the source audio, and why. Edited by the user before rendering. */
export const RemovalSchema = z.object({
  startMs: Ms,
  endMs: Ms,
  reason: z.enum(['filler', 'pause', 'event', 'trim']),
  text: z.string().optional(),
});
export type Removal = z.infer<typeof RemovalSchema>;

/** A suspicious passage that is NOT cut unless `accepted` is set: cutting it wrongly would change the meaning. */
export const FlagSchema = z.object({
  id: z.string().min(1),
  startMs: Ms,
  endMs: Ms,
  reason: z.enum(['repetition', 'false-start']),
  text: z.string(),
  accepted: z.boolean(),
});
export type Flag = z.infer<typeof FlagSchema>;

export const CutListSchema = z.object({
  sourceDurationMs: Ms,
  removals: z.array(RemovalSchema),
  flags: z.array(FlagSchema),
});
export type CutList = z.infer<typeof CutListSchema>;

/** `timeline.json` — words placed on the CLEAN audio's clock; the only timing the video reads. */
export const TimelineWordSchema = z.object({
  text: z.string().min(1),
  startMs: Ms,
  endMs: Ms,
  sourceStartMs: Ms,
});
export type TimelineWord = z.infer<typeof TimelineWordSchema>;

export const TimelineSchema = z.object({
  durationMs: Ms,
  words: z.array(TimelineWordSchema),
});
export type Timeline = z.infer<typeof TimelineSchema>;
