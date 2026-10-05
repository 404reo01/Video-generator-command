import type { TimelineWord } from '@mappa/shared';

// Music level while the voice speaks, as a share of the plan's music volume.
const DUCKED_SHARE = 0.35;
// Ramp before/after each word so the music breathes instead of pumping on every syllable.
const RAMP_MS = 350;

/** 1 while a word is being said, easing to 0 over `RAMP_MS` around it. */
export function speechLevel(words: readonly TimelineWord[], nowMs: number): number {
  let level = 0;
  for (const w of words) {
    if (w.startMs - RAMP_MS > nowMs) break;
    if (nowMs >= w.startMs && nowMs <= w.endMs) return 1;
    const distance = nowMs < w.startMs ? w.startMs - nowMs : nowMs - w.endMs;
    level = Math.max(level, 1 - distance / RAMP_MS);
  }
  return Math.max(0, level);
}

/** Music volume at `nowMs`: full volume in pauses, ducked under the voice. */
export function duckedVolume(baseVolume: number, words: readonly TimelineWord[], nowMs: number): number {
  return baseVolume * (1 - (1 - DUCKED_SHARE) * speechLevel(words, nowMs));
}
