/**
 * Prints the clean timeline sentence by sentence with millisecond times, then every word with its start time.
 * This is what the director reads to cut shots on sentence boundaries and sync elements to words.
 *
 * Usage: npm run timeline -w @mappa/audio -- --episode <slug>
 */
import { parseArgs } from 'node:util';
import { TimelineSchema } from '@mappa/shared';
import { episodePaths, readJson } from '../src/episode';

const { values } = parseArgs({ options: { episode: { type: 'string' } } });
if (!values.episode) throw new Error('missing --episode <slug>');

const timeline = readJson(episodePaths(values.episode).timeline, TimelineSchema);
console.log(`Clean audio: ${String(timeline.durationMs)} ms, ${String(timeline.words.length)} words\n`);

let sentence: typeof timeline.words = [];
const flush = (): void => {
  const first = sentence[0];
  const last = sentence.at(-1);
  if (first && last) console.log(`[${String(first.startMs).padStart(6)} - ${String(last.endMs).padStart(6)}] ${sentence.map((w) => w.text).join(' ')}`);
  sentence = [];
};
for (const word of timeline.words) {
  sentence.push(word);
  if (/[.!?…]["»]?$/.test(word.text)) flush();
}
flush();

console.log('\nWords (start ms):');
console.log(timeline.words.map((w) => `${w.text}@${String(w.startMs)}`).join(' '));
