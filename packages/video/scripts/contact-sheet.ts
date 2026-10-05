/**
 * Renders one still per shot (at the moment its content is fully on screen) and a contact sheet of all of them,
 * into episodes/<slug>/review/. This is what Claude and the reviewer look at before anything is rendered in full.
 *
 * Usage: npm run contact-sheet -w @mappa/video -- --episode <slug> [--scale 0.25]
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import { episodePaths, readJson } from '@mappa/audio';
import { ScenePlanSchema, type Shot } from '@mappa/shared';
import { composeGrid, readPng, writePng } from '@mappa/sprites';
import { VIDEO } from '../src/theme/tokens';

const COLUMNS = 5;
const GAP = 12;

/** When a shot looks complete: just after its last timed element appears, else at 60% of its length. */
function showcaseMs(shot: Shot): number {
  const times = [
    ...(shot.text?.lines.map((l) => l.atMs) ?? []),
    ...(shot.illustration ? ('items' in shot.illustration ? shot.illustration.items.map((i) => i.atMs) : []) : []),
    ...(shot.illustration?.kind === 'flow' ? shot.illustration.nodes.map((n) => n.atMs) : []),
    ...(shot.illustration?.kind === 'code' ? shot.illustration.lines.map((l) => l.atMs) : []),
    ...(shot.illustration?.kind === 'compare' ? [shot.illustration.revealAtMs] : []),
    ...(shot.illustration?.kind === 'number' ? [shot.illustration.atMs + 1100] : []),
  ];
  const target = times.length > 0 ? Math.max(...times) + 500 : shot.startMs + (shot.endMs - shot.startMs) * 0.6;
  return Math.min(shot.endMs - 150, Math.max(shot.startMs + 300, target));
}

const { values } = parseArgs({ options: { episode: { type: 'string' }, scale: { type: 'string', default: '0.25' } } });
if (!values.episode) throw new Error('missing --episode <slug>');
const scale = Number(values.scale);

const paths = episodePaths(values.episode);
const plan = readJson(join(paths.dir, 'scene-plan.json'), ScenePlanSchema);
const reviewDir = join(paths.dir, 'review');
rmSync(reviewDir, { recursive: true, force: true });
mkdirSync(reviewDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: join(import.meta.dirname, '..', 'src', 'index.ts'), publicDir: join(import.meta.dirname, '..', 'public') });
const inputProps = { episode: values.episode, data: null };
const composition = await selectComposition({ serveUrl, id: 'Episode', inputProps });
const browser = await openBrowser('chrome');

const stills: { index: number; id: string; atMs: number; file: string }[] = [];
try {
  for (const [index, shot] of plan.shots.entries()) {
    const atMs = showcaseMs(shot);
    const file = join(reviewDir, `shot-${String(index + 1).padStart(2, '0')}-${shot.id}.png`);
    await renderStill({ composition, serveUrl, inputProps, output: file, frame: Math.round((atMs / 1000) * VIDEO.fps), scale, imageFormat: 'png', puppeteerInstance: browser });
    stills.push({ index: index + 1, id: shot.id, atMs, file });
  }
} finally {
  await browser.close({ silent: true });
}

writePng(join(reviewDir, 'contact-sheet.png'), composeGrid(stills.map((s) => readPng(s.file)), COLUMNS, GAP, { r: 20, g: 15, b: 28, a: 255 }));
writeFileSync(join(reviewDir, 'stills.json'), `${JSON.stringify(stills.map(({ index, id, atMs }) => ({ index, id, atMs })), null, 2)}\n`);
console.log(`rendered ${String(stills.length)} shots -> ${join(reviewDir, 'contact-sheet.png')} (left to right, top to bottom, ${String(COLUMNS)} per row)`);
