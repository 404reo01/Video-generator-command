import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CHARACTERS_DIR, loadCharacter, loadIcons, loadPoses } from './character-store';

describe('icon library', () => {
  it('loads every glyph at 16x16 with known colours', () => {
    const { glyphs } = loadIcons();
    expect(glyphs.length).toBeGreaterThanOrEqual(20);
  });
});

// Guards hand-edited pose files: every committed character must load and every pose must match its grid.
describe.each(readdirSync(CHARACTERS_DIR))('character "%s"', (name) => {
  const character = loadCharacter(name);

  it('has a neutral pose, used as the fallback emotion in videos', () => {
    expect(loadPoses(character).map((p) => p.name)).toContain('neutral');
  });

  it('uses every palette colour in at least one pose', () => {
    const used = new Set(loadPoses(character).flatMap((p) => p.rows.flatMap((row) => Array.from({ length: row.length }, (_, i) => row.charAt(i)))));
    expect(Object.keys(character.palette).filter((symbol) => !used.has(symbol))).toEqual([]);
  });
});
