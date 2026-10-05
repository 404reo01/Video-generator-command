/**
 * Validates an episode's scene plan against its timeline and the available sets, stickers, icons and music.
 * Exits with code 1 when there are errors. Run `npm run sync` first (it fills public/ with the library).
 *
 * Usage: npm run check-plan -w @mappa/video -- --episode <slug>
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { episodePaths, readJson } from '@mappa/audio';
import { formatReport, validatePlan } from '@mappa/director';
import { CharacterManifestSchema, ScenePlanSchema, TimelineSchema } from '@mappa/shared';
import { LibrarySchema } from '../src/episode/library-context';
import { SETS } from '../src/sets/registry';

const PUBLIC_DIR = join(import.meta.dirname, '..', 'public');

const { values } = parseArgs({ options: { episode: { type: 'string' } } });
if (!values.episode) throw new Error('missing --episode <slug>');

const paths = episodePaths(values.episode);
const plan = readJson(join(paths.dir, 'scene-plan.json'), ScenePlanSchema);
const timeline = readJson(paths.timeline, TimelineSchema);
const manifestPath = join(PUBLIC_DIR, 'characters', plan.character, 'manifest.json');
const libraryPath = join(PUBLIC_DIR, 'library.json');
if (!existsSync(manifestPath) || !existsSync(libraryPath)) throw new Error('public/ is not synced: run "npm run sync -w @mappa/video -- --episode <slug>" first');

const library = readJson(libraryPath, LibrarySchema);
const findings = validatePlan({
  plan,
  timeline,
  sets: Object.keys(SETS),
  emotions: readJson(manifestPath, CharacterManifestSchema).emotions,
  icons: library.icons,
  music: library.music.map((m) => m.id),
});
console.log(formatReport(findings));
if (findings.some((f) => f.severity === 'error')) process.exitCode = 1;
