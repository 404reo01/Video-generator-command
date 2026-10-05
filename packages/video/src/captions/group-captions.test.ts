import type { TimelineWord } from '@mappa/shared';
import { describe, expect, it } from 'vitest';
import { applyCorrections, groupCaptions } from './group-captions';

function words(text: string, gapAfter: Record<number, number> = {}): TimelineWord[] {
  let t = 0;
  return text.split(' ').map((w, i) => {
    const word = { text: w, startMs: t, endMs: t + 200, sourceStartMs: t };
    t += 250 + (gapAfter[i] ?? 0);
    return word;
  });
}

const texts = (captions: ReturnType<typeof groupCaptions>): string[] => captions.map((c) => c.words.map((w) => w.text).join(' '));

describe('groupCaptions', () => {
  it('breaks at the end of each sentence', () => {
    expect(texts(groupCaptions(words('Salut toi. Ça va ? Oui.')))).toEqual(['Salut toi.', 'Ça va ?', 'Oui.']);
  });

  it('never exceeds the character budget', () => {
    const long = words('un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept');
    for (const c of groupCaptions(long, { maxChars: 30, softBreakChars: 20, pauseBreakMs: 600 })) {
      expect(c.words.map((w) => w.text).join(' ').length).toBeLessThanOrEqual(30);
    }
  });

  it('breaks at a comma once the caption is long enough', () => {
    const result = texts(groupCaptions(words('Next.js pour le front, Postgres pour les données'), { maxChars: 64, softBreakChars: 15, pauseBreakMs: 600 }));
    expect(result).toEqual(['Next.js pour le front,', 'Postgres pour les données']);
  });

  it('breaks on a long pause', () => {
    expect(texts(groupCaptions(words('alors voilà la suite', { 1: 900 })))).toEqual(['alors voilà', 'la suite']);
  });

  it('glues a lone punctuation token to the previous caption', () => {
    expect(texts(groupCaptions(words('« À quoi tu sers ? » Donc voilà.')))).toEqual(['« À quoi tu sers ? »', 'Donc voilà.']);
  });

  it('keeps word timings for the typing effect', () => {
    const [first] = groupCaptions(words('Salut toi.'));
    expect([first?.startMs, first?.endMs]).toEqual([0, 450]);
  });
});

describe('applyCorrections', () => {
  it('replaces whole words and keeps punctuation', () => {
    const fixed = applyCorrections(words('Mais Ryan, Ryanair'), { Ryan: 'Rayan' });
    expect(fixed.map((w) => w.text)).toEqual(['Mais', 'Rayan,', 'Ryanair']);
  });
});
