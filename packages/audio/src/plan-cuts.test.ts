import { describe, expect, it } from 'vitest';
import { DEFAULT_CUT_OPTIONS, keptSpans, planCuts } from './plan-cuts';
import { overlapMs, spanLength } from './spans';
import { transcriptOf } from './test-fixtures';

const removedMs = (cuts: ReturnType<typeof planCuts>, reason: string): number =>
  cuts.removals.filter((r) => r.reason === reason).reduce((s, r) => s + spanLength(r), 0);

describe('planCuts', () => {
  it('removes a filler entirely and leaves a short pause in its place', () => {
    const t = transcriptOf(2000, [['je', 100, 300], ['euh', 500, 800], ['pense', 1000, 1400]]);
    const cuts = planCuts(t);
    const kept = keptSpans(cuts);
    expect(overlapMs({ startMs: 500, endMs: 800 }, kept)).toBe(0);
    const pause = kept.reduce((s, k) => s + overlapMs({ startMs: 300, endMs: 1000 }, [k]), 0);
    expect(pause).toBe(DEFAULT_CUT_OPTIONS.fillerPauseMs);
  });

  it('shortens a long silence to the target pause, cutting from its middle', () => {
    const t = transcriptOf(4000, [['un', 100, 400], ['deux', 2400, 2800]]);
    const cuts = planCuts(t);
    const pause = cuts.removals.find((r) => r.reason === 'pause');
    expect(removedMs(cuts, 'pause')).toBe(2000 - DEFAULT_CUT_OPTIONS.targetPauseMs);
    expect(pause && pause.startMs - 400).toBe(pause && 2400 - pause.endMs);
  });

  it('keeps natural pauses untouched', () => {
    const t = transcriptOf(1200, [['un', 100, 400], ['deux', 900, 1100]]);
    expect(removedMs(planCuts(t), 'pause')).toBe(0);
  });

  it('trims dead air at the start and the end', () => {
    const t = transcriptOf(5000, [['salut', 1500, 1900]]);
    const kept = keptSpans(planCuts(t));
    expect(kept[0]?.startMs).toBe(1500 - DEFAULT_CUT_OPTIONS.leadMs);
    expect(kept.at(-1)?.endMs).toBe(1900 + DEFAULT_CUT_OPTIONS.tailMs);
  });

  it('removes noises but keeps laughter', () => {
    const t = transcriptOf(3000, [['un', 100, 400], ['(toux)', 500, 700], ['deux', 800, 1000], ['(rires)', 1100, 1500], ['trois', 1600, 1900]]);
    const kept = keptSpans(planCuts(t));
    expect(overlapMs({ startMs: 500, endMs: 700 }, kept)).toBe(0);
    expect(overlapMs({ startMs: 1100, endMs: 1500 }, kept)).toBe(400);
  });

  it('flags repetitions and false starts without cutting them', () => {
    const t = transcriptOf(4000, [
      ['je', 100, 200], ['je', 300, 400], ['pense', 500, 800],
      ['compl-', 900, 1100], ['complètement', 1200, 1700],
      ['il', 1800, 1900], ['faut', 1950, 2100], ['il', 2200, 2300], ['faut', 2350, 2500], ['voir', 2600, 2900],
    ]);
    const cuts = planCuts(t);
    expect(cuts.flags.map((f) => [f.reason, f.text])).toEqual([
      ['repetition', 'je'],
      ['false-start', 'compl-'],
      ['repetition', 'il faut'],
    ]);
    expect(overlapMs({ startMs: 100, endMs: 200 }, keptSpans(cuts))).toBe(100);
  });

  it('does not flag words that only differ by an accent', () => {
    const t = transcriptOf(2000, [['de', 100, 200], ['A', 300, 400], ['à', 450, 500], ['Z', 600, 800]]);
    expect(planCuts(t).flags).toEqual([]);
  });

  it('cuts a flag once it is accepted', () => {
    const t = transcriptOf(1000, [['je', 100, 200], ['je', 300, 400], ['pense', 500, 800]]);
    const cuts = planCuts(t);
    const accepted = { ...cuts, flags: cuts.flags.map((f) => ({ ...f, accepted: true })) };
    expect(overlapMs({ startMs: 100, endMs: 200 }, keptSpans(accepted))).toBe(0);
  });
});
