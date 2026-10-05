import type { Timeline, TimeSpan, Transcript } from '@mappa/shared';
import { complement, overlapMs, spanLength } from './spans';

/** Maps a time on the source clock to the clean clock; a time inside a removed span snaps to the next kept audio. */
export function toCleanTime(sourceMs: number, kept: readonly TimeSpan[]): number {
  let offset = 0;
  for (const span of kept) {
    if (sourceMs < span.startMs) return offset;
    if (sourceMs <= span.endMs) return offset + (sourceMs - span.startMs);
    offset += spanLength(span);
  }
  return offset;
}

/**
 * Places every surviving word on the clean audio's clock.
 * A word loses its place when most of it was cut (fillers, accepted repetitions).
 */
export function retime(transcript: Transcript, kept: readonly TimeSpan[]): Timeline {
  const removed = complement(transcript.durationMs, kept);
  const words = transcript.words
    .filter((w) => w.kind === 'word')
    .filter((w) => {
      const length = Math.max(1, w.endMs - w.startMs);
      return overlapMs(w, removed) / length <= 0.5;
    })
    .map((w) => ({
      text: w.text,
      startMs: toCleanTime(w.startMs, kept),
      endMs: Math.max(toCleanTime(w.startMs, kept), toCleanTime(w.endMs, kept)),
      sourceStartMs: w.startMs,
    }));
  return { durationMs: kept.reduce((sum, s) => sum + spanLength(s), 0), words };
}
