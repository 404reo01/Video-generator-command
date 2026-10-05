/** Lowercases and strips punctuation (and accents unless asked) so "Euh," and "euh..." compare equal. */
export function normalizeWord(text: string, options: { keepAccents?: boolean } = {}): string {
  const lower = text.toLowerCase();
  const base = options.keepAccents ? lower : lower.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return base.replace(/[^\p{L}\p{N}'-]/gu, '').replace(/-+$/, '');
}

/**
 * French and English hesitation sounds. Deliberately excludes words like "bah", "ben", "bon", "genre"
 * or "voilà": they are often meaningful, so removing them automatically would change what was said.
 */
const FILLER_PATTERNS: readonly RegExp[] = [
  /^h?e+u+h*$/, // euh, euuuh, heu, eu
  /^h?e+uh+$/,
  /^u+h+m*$/, // uh, uhm
  /^u+m+$/, // um, umm
  /^h+u*m+$/, // hm, hum, hmm
  /^m+h*m+$/, // mm, mhm
  /^e+r+m*$/, // er, erm
];

export function isFiller(text: string): boolean {
  const word = normalizeWord(text);
  return word.length > 0 && FILLER_PATTERNS.some((p) => p.test(word));
}

/** A word cut off mid-way, which providers transcribe with a trailing dash ("compl-"). */
export function isFalseStart(text: string): boolean {
  return /[-–—]$/.test(text.trim());
}

/** Laughter carries intent and stays in the edit; coughs, breaths and other noises go. */
export function isKeptEvent(text: string): boolean {
  return /rire|laugh|chuckle/i.test(text);
}
