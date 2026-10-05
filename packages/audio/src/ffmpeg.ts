import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import type { TimeSpan } from '@mappa/shared';
import { buildCutFilter } from './ffmpeg-filter';

// 48 kHz mono 16-bit: the video pipeline's audio format; mono because the source is a single voice.
const SAMPLE_RATE = '48000';

function runFfmpeg(args: readonly string[]): Promise<void> {
  if (!ffmpegPath) throw new Error('ffmpeg-static has no binary for this platform');
  const binary = ffmpegPath;
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with ${String(code)}: ${stderr.trim()}`));
    });
  });
}

/** Converts any input format (wav, mp3, m4a...) to the mono 48 kHz WAV every later step works on. */
export function prepareSource(inputPath: string, outputPath: string): Promise<void> {
  return runFfmpeg(['-i', inputPath, '-ac', '1', '-ar', SAMPLE_RATE, '-c:a', 'pcm_s16le', outputPath]);
}

/** Renders an ffmpeg lavfi filter graph (a synthesis recipe) to a mono 48 kHz WAV. */
export function synthesize(recipe: string, outputPath: string): Promise<void> {
  return runFfmpeg(['-f', 'lavfi', '-i', recipe, '-ac', '1', '-ar', SAMPLE_RATE, '-c:a', 'pcm_s16le', outputPath]);
}

/** Writes the edited, loudness-normalised audio made of the `kept` spans of `sourcePath`. */
export async function renderCleanAudio(sourcePath: string, kept: readonly TimeSpan[], outputPath: string): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'mappa-'));
  const script = join(dir, 'cuts.filter');
  try {
    writeFileSync(script, buildCutFilter(kept));
    await runFfmpeg(['-i', sourcePath, '-filter_complex_script', script, '-map', '[out]', '-ar', SAMPLE_RATE, '-c:a', 'pcm_s16le', outputPath]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
