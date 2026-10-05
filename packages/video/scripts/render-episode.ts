/**
 * Renders an episode to MP4 in its folder: `draft.mp4` (half resolution, fast, for review) or `final.mp4`.
 * Concurrency is kept low by default: rendering runs a headless browser per worker and can exhaust memory.
 *
 * Usage: npm run render-episode -w @mappa/video -- --episode <slug> [--draft] [--concurrency 2]
 */
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { episodePaths } from '@mappa/audio';

const { values } = parseArgs({ options: { episode: { type: 'string' }, draft: { type: 'boolean', default: false }, concurrency: { type: 'string', default: '2' } } });
if (!values.episode) throw new Error('missing --episode <slug>');

const output = join(episodePaths(values.episode).dir, values.draft ? 'draft.mp4' : 'final.mp4');
const serveUrl = await bundle({ entryPoint: join(import.meta.dirname, '..', 'src', 'index.ts'), publicDir: join(import.meta.dirname, '..', 'public') });
const inputProps = { episode: values.episode, data: null };
const composition = await selectComposition({ serveUrl, id: 'Episode', inputProps });

let lastLogged = -1;
await renderMedia({
  composition,
  serveUrl,
  inputProps,
  codec: 'h264',
  outputLocation: output,
  scale: values.draft ? 0.5 : 1,
  concurrency: Number(values.concurrency),
  // Social platforms re-encode anyway; CRF 18 keeps the pixel art crisp before they do.
  crf: values.draft ? 28 : 18,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== lastLogged) {
      lastLogged = pct;
      console.log(`rendering ${String(pct)}%`);
    }
  },
});
console.log(`-> ${output}`);
