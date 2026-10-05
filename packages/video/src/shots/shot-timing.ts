import type { EmotionCue, Shot, Style } from '@mappa/shared';

/** Full duration of a non-cut transition, centred on the shot boundary. */
export const TRANSITION_MS: Record<Style['pace'], number> = { calm: 700, balanced: 500, dynamic: 340 };
const WHIP_MS = 280;

export interface ShotMix {
  /** Index of the shot shown alongside the current one during a transition. */
  readonly other: number;
  readonly kind: 'fade' | 'sweep' | 'whip';
  /** 0 -> 1 across the whole transition window (0.5 = exactly on the cut). */
  readonly progress: number;
  /** Whether `other` is the outgoing shot (true) or the incoming one (false). */
  readonly otherIsPrevious: boolean;
}

export interface ShotFrame {
  readonly index: number;
  readonly mix: ShotMix | null;
}

export function shotIndexAt(shots: readonly Shot[], nowMs: number): number {
  let index = 0;
  shots.forEach((shot, i) => {
    if (shot.startMs <= nowMs) index = i;
  });
  return index;
}

function windowMs(kind: ShotMix['kind'], pace: Style['pace']): number {
  return kind === 'whip' ? WHIP_MS : TRANSITION_MS[pace];
}

/** Which shot to draw at `nowMs`, and which neighbour to blend in if a transition is running. */
export function shotFrameAt(shots: readonly Shot[], nowMs: number, pace: Style['pace']): ShotFrame {
  const index = shotIndexAt(shots, nowMs);
  const current = shots[index];
  const next = shots[index + 1];
  if (current && index > 0 && current.transitionIn !== 'cut') {
    const half = windowMs(current.transitionIn, pace) / 2;
    if (nowMs < current.startMs + half) {
      return { index, mix: { other: index - 1, kind: current.transitionIn, progress: 0.5 + (nowMs - current.startMs) / (2 * half), otherIsPrevious: true } };
    }
  }
  if (next && next.transitionIn !== 'cut') {
    const half = windowMs(next.transitionIn, pace) / 2;
    if (nowMs >= next.startMs - half) {
      return { index, mix: { other: index + 1, kind: next.transitionIn, progress: 0.5 - (next.startMs - nowMs) / (2 * half), otherIsPrevious: false } };
    }
  }
  return { index, mix: null };
}

/** Emotion in effect at `nowMs` and when it started (for the little pop on change). */
export function emotionAt(cues: readonly EmotionCue[], nowMs: number): { emotion: string; sinceMs: number } {
  let current = { emotion: 'neutral', sinceMs: 0 };
  for (const cue of [...cues].sort((a, b) => a.atMs - b.atMs)) if (cue.atMs <= nowMs) current = { emotion: cue.emotion, sinceMs: cue.atMs };
  return current;
}
