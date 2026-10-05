import { describe, expect, it } from 'vitest';
import { complement, mergeSpans, overlapMs } from './spans';

describe('spans', () => {
  it('merges overlapping and touching spans', () => {
    expect(mergeSpans([{ startMs: 5, endMs: 8 }, { startMs: 0, endMs: 3 }, { startMs: 3, endMs: 4 }])).toEqual([
      { startMs: 0, endMs: 4 },
      { startMs: 5, endMs: 8 },
    ]);
  });

  it('returns what is left between removed spans', () => {
    expect(complement(10, [{ startMs: 2, endMs: 4 }, { startMs: 8, endMs: 12 }])).toEqual([
      { startMs: 0, endMs: 2 },
      { startMs: 4, endMs: 8 },
    ]);
  });

  it('measures overlap', () => {
    expect(overlapMs({ startMs: 0, endMs: 10 }, [{ startMs: 5, endMs: 20 }, { startMs: 8, endMs: 9 }])).toBe(6);
  });
});
