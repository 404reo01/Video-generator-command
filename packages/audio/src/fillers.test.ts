import { describe, expect, it } from 'vitest';
import { isFalseStart, isFiller, isKeptEvent, normalizeWord } from './fillers';

describe('isFiller', () => {
  it.each(['euh', 'Euh,', 'euuuh...', 'heu', 'hum', 'hmm', 'mhm', 'uh', 'um'])('treats "%s" as a filler', (word) => {
    expect(isFiller(word)).toBe(true);
  });

  it.each(['bah', 'ben', 'bon', 'voilà', 'eux', 'heure', 'humain', 'Europe'])('keeps the meaningful word "%s"', (word) => {
    expect(isFiller(word)).toBe(false);
  });
});

describe('normalizeWord', () => {
  it('strips case, accents and punctuation', () => {
    expect(normalizeWord('Voilà !')).toBe('voila');
    expect(normalizeWord("aujourd'hui,")).toBe("aujourd'hui");
  });
});

describe('isFalseStart', () => {
  it('detects a word cut off with a dash', () => {
    expect(isFalseStart('compl-')).toBe(true);
    expect(isFalseStart('peut-être')).toBe(false);
  });
});

describe('isKeptEvent', () => {
  it('keeps laughter but not other noises', () => {
    expect(isKeptEvent('(rires)')).toBe(true);
    expect(isKeptEvent('(toux)')).toBe(false);
  });
});
