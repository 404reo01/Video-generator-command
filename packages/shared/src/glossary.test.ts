import { describe, expect, it } from 'vitest';
import { mergeCorrections } from './glossary';

describe('mergeCorrections', () => {
  it('applies the glossary and lets the plan override it', () => {
    expect(mergeCorrections({ corrections: { Ryan: 'Rayan', Reo: 'REO' } }, { Reo: 'Réo' })).toEqual({ Ryan: 'Rayan', Reo: 'Réo' });
  });
});
