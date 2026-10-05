import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { z } from 'zod';

export const EPISODES_DIR = join(import.meta.dirname, '..', '..', '..', 'episodes');
const AUDIO_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.aac', '.ogg', '.flac', '.webm'];

/** Files of one episode, in pipeline order. Only `input.*` is provided by the user. */
export function episodePaths(slug: string): {
  dir: string;
  source: string;
  transcript: string;
  cuts: string;
  clean: string;
  timeline: string;
} {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`invalid episode slug "${slug}": use lowercase letters, digits and dashes`);
  const dir = join(EPISODES_DIR, slug);
  return {
    dir,
    source: join(dir, 'source.wav'),
    transcript: join(dir, 'transcript.json'),
    cuts: join(dir, 'cuts.json'),
    clean: join(dir, 'clean.wav'),
    timeline: join(dir, 'timeline.json'),
  };
}

export function findInput(slug: string): string {
  const { dir } = episodePaths(slug);
  if (!existsSync(dir)) throw new Error(`episode folder not found: ${dir}`);
  const input = readdirSync(dir).find((f) => f.startsWith('input.') && AUDIO_EXTENSIONS.some((ext) => f.toLowerCase().endsWith(ext)));
  if (!input) throw new Error(`no input audio in ${dir}: expected input${AUDIO_EXTENSIONS.join(' | input')}`);
  return join(dir, input);
}

export function readJson<T>(path: string, schema: z.ZodType<T>): T {
  return schema.parse(JSON.parse(readFileSync(path, 'utf8')));
}

export function writeJson<T>(path: string, schema: z.ZodType<T>, value: T): void {
  writeFileSync(path, `${JSON.stringify(schema.parse(value), null, 2)}\n`);
}
