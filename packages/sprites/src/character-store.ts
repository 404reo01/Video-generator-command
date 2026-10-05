import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { CharacterSchema, type Character } from './character';
import { parsePose, serializePose, type Pose } from './pose';

/** Root folder holding one sub-folder per character: `character.json` + `poses/*.txt`. */
export const CHARACTERS_DIR = join(import.meta.dirname, '..', 'characters');
/** Icon library: `icons.json` (16x16 grid + palette) and one glyph per file in `glyphs/`. */
export const ICONS_DIR = join(import.meta.dirname, '..', 'icons');

export function characterDir(name: string): string {
  return join(CHARACTERS_DIR, name);
}

function readGridSet(file: string): Character {
  const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
  return CharacterSchema.parse(raw);
}

function readPoses(character: Character, dir: string): Pose[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.txt'))
    .sort()
    .map((file) => parsePose(basename(file, '.txt'), readFileSync(join(dir, file), 'utf8'), character));
}

export function loadCharacter(name: string): Character {
  return readGridSet(join(characterDir(name), 'character.json'));
}

export function saveCharacter(character: Character): void {
  const dir = characterDir(character.name);
  mkdirSync(join(dir, 'poses'), { recursive: true });
  writeFileSync(join(dir, 'character.json'), `${JSON.stringify(CharacterSchema.parse(character), null, 2)}\n`);
}

export function characterExists(name: string): boolean {
  return existsSync(join(characterDir(name), 'character.json'));
}

export function loadPoses(character: Character): Pose[] {
  return readPoses(character, join(characterDir(character.name), 'poses'));
}

export function savePose(character: Character, pose: Pose): void {
  writeFileSync(join(characterDir(character.name), 'poses', `${pose.name}.txt`), serializePose(pose));
}

/** The icon library: its grid definition and every glyph, named by file. */
export function loadIcons(): { set: Character; glyphs: Pose[] } {
  const set = readGridSet(join(ICONS_DIR, 'icons.json'));
  return { set, glyphs: readPoses(set, join(ICONS_DIR, 'glyphs')) };
}
