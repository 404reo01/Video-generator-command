import { describe, expect, it } from 'vitest';
import { keptSpans, planCuts } from './plan-cuts';
import { retime, toCleanTime } from './retime';
import { transcriptOf } from './test-fixtures';

describe('toCleanTime', () => {
  const kept = [{ startMs: 0, endMs: 1000 }, { startMs: 3000, endMs: 4000 }];

  it('shifts times after a cut back by the cut length', () => {
    expect(toCleanTime(3500, kept)).toBe(1500);
  });

  it('snaps a time inside a cut to the start of the next kept audio', () => {
    expect(toCleanTime(2000, kept)).toBe(1000);
  });
});

describe('retime', () => {
  it('drops fillers and moves the following words earlier', () => {
    const t = transcriptOf(3000, [['je', 100, 300], ['euh', 500, 1500], ['pense', 2000, 2400]]);
    const kept = keptSpans(planCuts(t));
    const timeline = retime(t, kept);
    expect(timeline.words.map((w) => w.text)).toEqual(['je', 'pense']);
    const pense = timeline.words[1];
    expect(pense?.sourceStartMs).toBe(2000);
    expect(pense && pense.startMs < 2000).toBe(true);
    expect(timeline.durationMs).toBe(kept.reduce((s, k) => s + k.endMs - k.startMs, 0));
  });

  it('keeps words in order and inside the clean duration', () => {
    const t = transcriptOf(6000, [['un', 1200, 1500], ['deux', 3500, 3900], ['trois', 4000, 4300]]);
    const timeline = retime(t, keptSpans(planCuts(t)));
    const starts = timeline.words.map((w) => w.startMs);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(Math.max(...timeline.words.map((w) => w.endMs))).toBeLessThanOrEqual(timeline.durationMs);
  });
});
