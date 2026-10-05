/**
 * Step 3: source.wav + cuts.json -> clean.wav (edited, loudness-normalised) + timeline.json (words on the clean clock).
 *
 * Usage: npm run apply-cuts -w @mappa/audio -- --episode <slug> [--accept f1,f3 | --accept all]
 */
import { parseArgs } from 'node:util';
import { CutListSchema, TimelineSchema, TranscriptSchema } from '@mappa/shared';
import { formatCutReport } from '../src/cut-report';
import { episodePaths, readJson, writeJson } from '../src/episode';
import { renderCleanAudio } from '../src/ffmpeg';
import { keptSpans } from '../src/plan-cuts';
import { retime } from '../src/retime';

const { values } = parseArgs({ options: { episode: { type: 'string' }, accept: { type: 'string' } } });
if (!values.episode) throw new Error('missing --episode <slug>');

const paths = episodePaths(values.episode);
let cuts = readJson(paths.cuts, CutListSchema);
if (values.accept) {
  const ids = new Set(values.accept.split(',').map((s) => s.trim()));
  const unknown = [...ids].filter((id) => id !== 'all' && !cuts.flags.some((f) => f.id === id));
  if (unknown.length > 0) throw new Error(`unknown flag id(s): ${unknown.join(', ')}`);
  cuts = { ...cuts, flags: cuts.flags.map((f) => (ids.has('all') || ids.has(f.id) ? { ...f, accepted: true } : f)) };
  writeJson(paths.cuts, CutListSchema, cuts);
}

const kept = keptSpans(cuts);
await renderCleanAudio(paths.source, kept, paths.clean);
const timeline = retime(readJson(paths.transcript, TranscriptSchema), kept);
writeJson(paths.timeline, TimelineSchema, timeline);

console.log(formatCutReport(cuts));
console.log(`\n-> ${paths.clean}\n-> ${paths.timeline} (${String(timeline.words.length)} words)`);
