/**
 * Step 1: episodes/<slug>/input.* -> source.wav (mono 48 kHz) -> transcript.json (verbatim, word timings).
 *
 * Usage: npm run transcribe -w @mappa/audio -- --episode <slug> [--language fr]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { TranscriptSchema } from '@mappa/shared';
import { episodePaths, findInput, writeJson } from '../src/episode';
import { prepareSource } from '../src/ffmpeg';
import { ElevenLabsProvider } from '../src/providers/elevenlabs';
import { wavDurationMs } from '../src/wav';

const ENV_FILE = join(import.meta.dirname, '..', '..', '..', '.env');
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const { values } = parseArgs({ options: { episode: { type: 'string' }, language: { type: 'string', default: 'fr' } } });
if (!values.episode) throw new Error('missing --episode <slug>');

const paths = episodePaths(values.episode);
await prepareSource(findInput(values.episode), paths.source);
const durationMs = wavDurationMs(readFileSync(paths.source));

const provider = new ElevenLabsProvider(process.env.ELEVENLABS_API_KEY ?? '');
const transcript = await provider.transcribe({ audioPath: paths.source, durationMs, languageCode: values.language });
writeJson(paths.transcript, TranscriptSchema, transcript);

const events = transcript.words.filter((w) => w.kind === 'event').length;
console.log(`transcribed ${(durationMs / 1000).toFixed(1)} s: ${String(transcript.words.length - events)} words, ${String(events)} sound events -> ${paths.transcript}`);
