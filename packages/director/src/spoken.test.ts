import { describe, expect, it } from 'vitest';
import { findMention, tokens } from './spoken';

const say = (...texts: string[]): { text: string; startMs: number; endMs: number; sourceStartMs: number }[] =>
  texts.map((text, i) => ({ text, startMs: i * 100, endMs: i * 100 + 80, sourceStartMs: i * 100 }));

describe('tokens', () => {
  it('splits elisions and drops short words', () => {
    expect(tokens("L'impact du produit")).toEqual(['impact', 'produit']);
  });
});

describe('findMention', () => {
  it('matches a word spoken with an elision', () => {
    expect(findMention("L'ergonomie", say('le', 'code,', "l'ergonomie"))?.text).toBe("l'ergonomie");
  });

  it('matches inflected forms by stem', () => {
    expect(findMention('Déploiement', say("j'automatise", 'les', 'déploiements'))?.text).toBe('déploiements');
  });

  it('returns nothing when the label is never said', () => {
    expect(findMention('Kubernetes', say('le', 'cloud', 'et', 'DevOps'))).toBeUndefined();
  });
});
