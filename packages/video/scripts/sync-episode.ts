/**
 * Copies everything the video needs into public/ (Remotion only serves files from there):
 * - the episode's clean audio, timeline and scene plan (validated);
 * - the plan's character as one PNG per emotion + manifest.json (pixel grids are rendered, image packs copied);
 * - the icon library, sound effects and music, plus library.json listing what is available;
 * - channel-wide glossary corrections merged into the plan, and the director's catalog regenerated.
 *
 * Usage: npm run sync -w @mappa/video -- --episode <slug>
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseArgs } from 'node:util';
import { episodePaths, readJson, writeJson } from '@mappa/audio';
import { CharacterManifestSchema, GlossarySchema, mergeCorrections, MusicLibrarySchema, ScenePlanSchema, TimelineSchema, type CharacterManifest } from '@mappa/shared';
import { characterDir, loadCharacter, loadIcons, loadPoses, readPng, renderPose, StickerPackSchema, writePng } from '@mappa/sprites';
import { LibrarySchema } from '../src/episode/library-context';
import { CurrentEpisodeSchema } from '../src/episode/load-episode';
import { writeCatalog } from './build-catalog';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public');
const SFX_DIR = join(ROOT, 'library', 'sfx');
const MUSIC_DIR = join(ROOT, 'library', 'music');
const GLOSSARY = join(ROOT, 'library', 'glossary.json');

/** Renders a pixel-grid character, or copies an image sticker pack, and describes it in manifest.json. */
function syncCharacter(name: string): CharacterManifest {
  const target = join(PUBLIC_DIR, 'characters', name);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const packFile = join(characterDir(name), 'stickers.json');

  let manifest: CharacterManifest;
  if (existsSync(packFile)) {
    const pack = readJson(packFile, StickerPackSchema);
    const dir = join(characterDir(name), 'stickers');
    const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'));
    const first = files[0];
    if (!first) throw new Error(`no PNG stickers in ${dir}`);
    const { width, height } = readPng(join(dir, first));
    for (const file of files) copyFileSync(join(dir, file), join(target, file.toLowerCase()));
    manifest = { name, style: pack.style, width, height, emotions: files.map((f) => basename(f, '.png').toLowerCase()), face: pack.face };
  } else {
    const character = loadCharacter(name);
    const poses = loadPoses(character);
    for (const pose of poses) writePng(join(target, `${pose.name}.png`), renderPose(pose, character, 1));
    // Without a face box, assume a portrait framing: face in the top third, centred.
    const face = character.face ?? { x: Math.round(character.width / 4), y: 0, width: Math.round(character.width / 2), height: Math.round(character.height / 3) };
    manifest = { name, style: 'pixel', width: character.width, height: character.height, emotions: poses.map((p) => p.name), face };
  }
  writeJson(join(target, 'manifest.json'), CharacterManifestSchema, manifest);
  return manifest;
}

function syncIcons(): string[] {
  const { set, glyphs } = loadIcons();
  for (const glyph of glyphs) writePng(join(PUBLIC_DIR, 'icons', `${glyph.name}.png`), renderPose(glyph, set, 1));
  return glyphs.map((g) => g.name);
}

/** Image sets: library/sets/<id>/*.png -> public/sets/<id>/ (previews stay out). */
function syncImageSets(): void {
  const dir = join(ROOT, 'library', 'sets');
  if (!existsSync(dir)) return;
  for (const id of readdirSync(dir)) {
    if (!existsSync(join(dir, id, 'background.png'))) continue;
    mkdirSync(join(PUBLIC_DIR, 'sets', id), { recursive: true });
    for (const file of readdirSync(join(dir, id)).filter((f) => f.endsWith('.png') && f !== 'preview.png')) copyFileSync(join(dir, id, file), join(PUBLIC_DIR, 'sets', id, file));
  }
}

function syncSfx(): string[] {
  if (!existsSync(SFX_DIR)) return [];
  mkdirSync(join(PUBLIC_DIR, 'sfx'), { recursive: true });
  const files = readdirSync(SFX_DIR).filter((f) => f.endsWith('.wav'));
  for (const file of files) copyFileSync(join(SFX_DIR, file), join(PUBLIC_DIR, 'sfx', file));
  return files.map((f) => basename(f, '.wav'));
}

function syncMusic(): { id: string; file: string }[] {
  const manifest = join(MUSIC_DIR, 'music.json');
  if (!existsSync(manifest)) return [];
  mkdirSync(join(PUBLIC_DIR, 'music'), { recursive: true });
  return readJson(manifest, MusicLibrarySchema)
    .tracks.filter((track) => existsSync(join(MUSIC_DIR, track.file)))
    .map((track) => {
      copyFileSync(join(MUSIC_DIR, track.file), join(PUBLIC_DIR, 'music', track.file));
      return { id: track.id, file: track.file };
    });
}

const { values } = parseArgs({ options: { episode: { type: 'string' } } });
if (!values.episode) throw new Error('missing --episode <slug>');

const source = episodePaths(values.episode);
const target = join(PUBLIC_DIR, 'episodes', values.episode);
mkdirSync(target, { recursive: true });
copyFileSync(source.clean, join(target, 'clean.wav'));
writeJson(join(target, 'timeline.json'), TimelineSchema, readJson(source.timeline, TimelineSchema));
const plan = readJson(join(source.dir, 'scene-plan.json'), ScenePlanSchema);
const glossary = existsSync(GLOSSARY) ? readJson(GLOSSARY, GlossarySchema) : { corrections: {} };
writeJson(join(target, 'scene-plan.json'), ScenePlanSchema, { ...plan, corrections: mergeCorrections(glossary, plan.corrections) });

const character = syncCharacter(plan.character);
syncImageSets();
const library = { icons: syncIcons(), sfx: syncSfx(), music: syncMusic() };
writeJson(join(PUBLIC_DIR, 'library.json'), LibrarySchema, library);
writeJson(join(PUBLIC_DIR, 'current.json'), CurrentEpisodeSchema, { episode: values.episode });
writeCatalog();

console.log(
  `synced "${values.episode}": character ${character.name} (${String(character.emotions.length)} emotions), ` +
    `${String(library.icons.length)} icons, ${String(library.sfx.length)} sfx, ${String(library.music.length)} music tracks`,
);
