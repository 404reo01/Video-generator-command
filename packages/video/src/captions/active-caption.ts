import type { Caption } from './group-captions';

// A caption opens slightly before its first word and lingers after its last so it can be read.
export const LEAD_MS = 150;
export const LINGER_MS = 900;

/** The caption on screen at `nowMs` and the window it occupies, if any. */
export function activeCaption(captions: readonly Caption[], nowMs: number): { caption: Caption; startMs: number; endMs: number } | null {
  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i];
    if (!caption) continue;
    const nextStart = captions[i + 1]?.startMs ?? Number.POSITIVE_INFINITY;
    const startMs = caption.startMs - LEAD_MS;
    const endMs = Math.min(nextStart - LEAD_MS, caption.endMs + LINGER_MS);
    if (nowMs >= startMs && nowMs < endMs) return { caption, startMs, endMs };
  }
  return null;
}

/** Typed text of a caption at `nowMs`: finished words in full, the current word letter by letter. */
export function typedText(caption: Caption, nowMs: number): { text: string; typing: boolean } {
  let text = '';
  for (const word of caption.words) {
    if (nowMs >= word.endMs) text += `${word.text} `;
    else if (nowMs >= word.startMs) {
      const share = (nowMs - word.startMs) / Math.max(1, word.endMs - word.startMs);
      return { text: text + word.text.slice(0, Math.max(1, Math.ceil(share * word.text.length))), typing: true };
    } else break;
  }
  return { text: text.trimEnd(), typing: false };
}
