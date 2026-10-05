import type { Shot } from '@mappa/shared';
import { describe, expect, it } from 'vitest';
import { emotionAt, shotFrameAt, TRANSITION_MS } from './shot-timing';

function shot(id: string, startMs: number, endMs: number, transitionIn: Shot['transitionIn'] = 'cut'): Shot {
  return { id, startMs, endMs, set: 'grid-paper', framing: 'wide', move: 'static', transitionIn, captions: 'subtitle' };
}

describe('shotFrameAt', () => {
  const shots = [shot('a', 0, 3000), shot('b', 3000, 6000, 'fade'), shot('c', 6000, 9000)];
  const half = TRANSITION_MS.balanced / 2;

  it('shows one shot with no mix away from transitions', () => {
    expect(shotFrameAt(shots, 1000, 'balanced')).toEqual({ index: 0, mix: null });
  });

  it('blends in the incoming shot before a fade', () => {
    const frame = shotFrameAt(shots, 3000 - half / 2, 'balanced');
    expect(frame.index).toBe(0);
    expect(frame.mix).toMatchObject({ other: 1, kind: 'fade', otherIsPrevious: false });
    expect(frame.mix?.progress).toBeCloseTo(0.25, 5);
  });

  it('keeps blending the outgoing shot after the boundary', () => {
    const frame = shotFrameAt(shots, 3000 + half / 2, 'balanced');
    expect(frame.index).toBe(1);
    expect(frame.mix).toMatchObject({ other: 0, otherIsPrevious: true });
    expect(frame.mix?.progress).toBeCloseTo(0.75, 5);
  });

  it('never mixes across a hard cut', () => {
    expect(shotFrameAt(shots, 6000 - 10, 'balanced').mix).toBeNull();
    expect(shotFrameAt(shots, 6000 + 10, 'balanced')).toEqual({ index: 2, mix: null });
  });
});

describe('emotionAt', () => {
  it('starts neutral and follows the latest cue', () => {
    const cues = [{ atMs: 2000, emotion: 'happy' }, { atMs: 500, emotion: 'thinking' }];
    expect(emotionAt(cues, 100).emotion).toBe('neutral');
    expect(emotionAt(cues, 1000)).toEqual({ emotion: 'thinking', sinceMs: 500 });
    expect(emotionAt(cues, 2500)).toEqual({ emotion: 'happy', sinceMs: 2000 });
  });
});
