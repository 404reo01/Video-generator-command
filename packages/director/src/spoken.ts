import { normalizeWord } from '@mappa/audio';
import type { TimelineWord } from '@mappa/shared';

// Words this short ("le", "de", "et") say nothing about relevance.
const MIN_TOKEN_LENGTH = 3;

/** Meaningful lowercase tokens of a label or a line ("L'impact produit" -> ["impact", "produit"]). */
export function tokens(text: string): string[] {
  return text
    .split(/[\s'’/·+-]+/)
    .map((t) => normalizeWord(t))
    .filter((t) => t.length >= MIN_TOKEN_LENGTH);
}

/** Words spoken between two times. */
export function wordsBetween(words: readonly TimelineWord[], fromMs: number, toMs: number): TimelineWord[] {
  return words.filter((w) => w.startMs >= fromMs && w.startMs < toMs);
}

// Comparing the first 5 letters matches inflections ("déploiements" ~ "déploie") without matching unrelated words.
const STEM_LENGTH = 5;
const sameStem = (a: string, b: string): boolean => a.slice(0, STEM_LENGTH) === b.slice(0, STEM_LENGTH);

/** First spoken word sharing a stem with one of the label's tokens. Elisions are split: "l'impact" -> "impact". */
export function findMention(label: string, words: readonly TimelineWord[]): TimelineWord | undefined {
  const wanted = tokens(label);
  return words.find((w) => tokens(w.text).some((spoken) => wanted.some((t) => sameStem(spoken, t))));
}
