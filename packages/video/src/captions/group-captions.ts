import type { TimelineWord } from '@mappa/shared';

export interface Caption {
  readonly words: readonly TimelineWord[];
  readonly startMs: number;
  readonly endMs: number;
}

export interface CaptionOptions {
  /** ~3 lines of the bubble at 44px Lexend. */
  readonly maxChars: number;
  /** After this many characters, a comma is a good enough place to break. */
  readonly softBreakChars: number;
  /** A silence this long always starts a new caption. */
  readonly pauseBreakMs: number;
}

export const DEFAULT_CAPTION_OPTIONS: CaptionOptions = { maxChars: 64, softBreakChars: 34, pauseBreakMs: 600 };

/** Replaces whole words using the plan's corrections ("Ryan" -> "Rayan"), keeping surrounding punctuation. */
export function applyCorrections(words: readonly TimelineWord[], corrections: Readonly<Record<string, string>>): TimelineWord[] {
  const entries = Object.entries(corrections);
  if (entries.length === 0) return [...words];
  return words.map((w) => {
    let text = w.text;
    for (const [from, to] of entries) {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(`(^|[^\\p{L}])${escaped}(?=$|[^\\p{L}])`, 'gu'), `$1${to}`);
    }
    return { ...w, text };
  });
}

const length = (words: readonly TimelineWord[]): number => words.reduce((n, w) => n + w.text.length + 1, -1);

/** Splits the timeline into bubble-sized captions, preferring sentence ends, then commas, then pauses. */
export function groupCaptions(words: readonly TimelineWord[], options: CaptionOptions = DEFAULT_CAPTION_OPTIONS): Caption[] {
  const captions: Caption[] = [];
  let current: TimelineWord[] = [];
  const flush = (): void => {
    const first = current[0];
    const last = current.at(-1);
    if (first && last) captions.push({ words: current, startMs: first.startMs, endMs: last.endMs });
    current = [];
  };

  words.forEach((word, i) => {
    const next = words[i + 1];
    // Providers emit punctuation as separate tokens ("»", "?"): glue a lone one to the previous caption.
    const previous = captions.at(-1);
    if (current.length === 0 && previous && !/[\p{L}\p{N}]/u.test(word.text)) {
      captions[captions.length - 1] = { words: [...previous.words, word], startMs: previous.startMs, endMs: Math.max(previous.endMs, word.endMs) };
      return;
    }
    if (current.length > 0 && length([...current, word]) > options.maxChars) flush();
    current.push(word);
    const size = length(current);
    const sentenceEnd = /[.!?…]["»]?$/.test(word.text);
    const softEnd = /[,;:]$/.test(word.text) && size >= options.softBreakChars;
    const pause = next !== undefined && next.startMs - word.endMs >= options.pauseBreakMs;
    if (sentenceEnd || softEnd || pause) flush();
  });
  flush();
  return captions;
}
