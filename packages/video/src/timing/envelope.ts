import { Easing, interpolate } from 'remotion';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0 -> 1 eased progress of an element entering at `startMs` over `durationMs`. */
export function enter(nowMs: number, startMs: number, durationMs = 380): number {
  return interpolate(nowMs, [startMs, startMs + durationMs], [0, 1], { ...CLAMP, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
}

/** 1 -> 0 eased progress of an element leaving at `endMs`. */
export function exit(nowMs: number, endMs: number, durationMs = 220): number {
  return interpolate(nowMs, [endMs - durationMs, endMs], [1, 0], { ...CLAMP, easing: Easing.bezier(0.4, 0, 1, 1) });
}

/** Linear 0 -> 1 between two times, eased in and out. */
export function progress(nowMs: number, fromMs: number, toMs: number): number {
  return interpolate(nowMs, [fromMs, Math.max(fromMs + 1, toMs)], [0, 1], { ...CLAMP, easing: Easing.bezier(0.65, 0, 0.35, 1) });
}
