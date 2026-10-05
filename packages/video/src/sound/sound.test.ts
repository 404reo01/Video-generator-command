import type { ScenePlan } from '@mappa/shared';
import { describe, expect, it } from 'vitest';
import { duckedVolume, speechLevel } from './ducking';
import { sfxCues } from './sfx-cues';

const words = [{ text: 'salut', startMs: 1000, endMs: 1400, sourceStartMs: 1000 }];

describe('ducking', () => {
  it('is fully ducked while a word is said and free in long pauses', () => {
    expect(speechLevel(words, 1200)).toBe(1);
    expect(speechLevel(words, 3000)).toBe(0);
    expect(duckedVolume(0.4, words, 3000)).toBeCloseTo(0.4, 6);
    expect(duckedVolume(0.4, words, 1200)).toBeCloseTo(0.14, 6);
  });

  it('ramps around words instead of switching abruptly', () => {
    const level = speechLevel(words, 1575);
    expect(level).toBeGreaterThan(0);
    expect(level).toBeLessThan(1);
  });
});

describe('sfxCues', () => {
  const plan: ScenePlan = {
    style: { pace: 'balanced', typography: 'cozy', colors: { ink: '#ffffff', surface: '#000000', accent: '#ff0000', accent2: '#00ff00', muted: '#888888' } },
    character: 'reo',
    speaker: 'REO',
    corrections: {},
    emotions: [],
    music: null,
    sfx: true,
    shots: [
      { id: 'a', startMs: 0, endMs: 2000, set: 'grid-paper', framing: 'wide', move: 'static', transitionIn: 'cut', captions: 'subtitle' },
      {
        id: 'b', startMs: 2000, endMs: 5000, set: 'grid-paper', framing: 'illustration', move: 'static', transitionIn: 'sweep', captions: 'subtitle',
        illustration: { kind: 'list', items: [{ label: 'Code', atMs: 2500 }, { label: 'Cloud', atMs: 3500 }] },
      },
    ],
  };

  it('adds a whoosh before a sweep and a pop per list item', () => {
    expect(sfxCues(plan).map((c) => c.sound)).toEqual(['whoosh', 'pop', 'pop']);
  });

  it('pops the subscribe button in and clicks it', () => {
    const outro: ScenePlan = {
      ...plan,
      shots: [{ id: 'outro', startMs: 0, endMs: 4000, set: 'grid-paper', framing: 'close', move: 'static', transitionIn: 'cut', captions: 'subtitle', cta: { kind: 'subscribe', atMs: 1000, clickAtMs: 2000, label: 'Subscribe', doneLabel: 'Subscribed' } }],
    };
    expect(sfxCues(outro)).toEqual([
      { atMs: 1000, sound: 'pop', volume: 0.4 },
      { atMs: 2000, sound: 'click', volume: 0.5 },
    ]);
  });

  it('stays silent when sfx are off', () => {
    expect(sfxCues({ ...plan, sfx: false })).toEqual([]);
  });
});
