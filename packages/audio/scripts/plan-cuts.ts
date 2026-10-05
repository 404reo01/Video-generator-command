/**
 * Step 2: transcript.json -> cuts.json, and prints the cut report for review.
 * Flags (repetitions, false starts) are not cut until set to "accepted": true in cuts.json.
 *
 * Usage: npm run plan-cuts -w @mappa/audio -- --episode <slug>
 */
import { parseArgs } from 'node:util';
import { CutListSchema, TranscriptSchema } from '@mappa/shared';
import { formatCutReport } from '../src/cut-report';
import { episodePaths, readJson, writeJson } from '../src/episode';
import { planCuts } from '../src/plan-cuts';

const { values } = parseArgs({ options: { episode: { type: 'string' } } });
if (!values.episode) throw new Error('missing --episode <slug>');

const paths = episodePaths(values.episode);
const cuts = planCuts(readJson(paths.transcript, TranscriptSchema));
writeJson(paths.cuts, CutListSchema, cuts);
console.log(formatCutReport(cuts));
console.log(`\n-> ${paths.cuts}`);
