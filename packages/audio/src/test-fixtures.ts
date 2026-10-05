import type { Transcript, TranscriptWord } from '@mappa/shared';

/** Builds a transcript from [text, startMs, endMs] tuples; texts in parentheses are sound events. */
export function transcriptOf(durationMs: number, words: readonly (readonly [string, number, number])[]): Transcript {
  return {
    provider: 'test',
    language: 'fr',
    durationMs,
    words: words.map(([text, startMs, endMs]): TranscriptWord => ({ text, startMs, endMs, kind: text.startsWith('(') ? 'event' : 'word' })),
  };
}
