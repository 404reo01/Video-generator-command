import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { prepareSource, renderCleanAudio } from './ffmpeg';
import { buildCutFilter } from './ffmpeg-filter';
import { wavDurationMs } from './wav';

/** Mono 16-bit PCM WAV of a 440 Hz tone. */
function toneWav(durationMs: number, sampleRate = 44100): Buffer {
  const samples = Math.round((durationMs / 1000) * sampleRate);
  const buffer = Buffer.alloc(44 + samples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples * 2, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) buffer.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 8000), 44 + i * 2);
  return buffer;
}

describe('buildCutFilter', () => {
  it('trims, fades and joins every kept span', () => {
    const filter = buildCutFilter([{ startMs: 0, endMs: 1000 }, { startMs: 1500, endMs: 2000 }]);
    expect(filter).toContain('atrim=start=0.000:end=1.000');
    expect(filter).toContain('atrim=start=1.500:end=2.000');
    expect(filter).toContain('concat=n=2:v=0:a=1');
  });

  it('refuses an edit that keeps nothing', () => {
    expect(() => buildCutFilter([])).toThrow(/nothing left/);
  });
});

describe('wavDurationMs', () => {
  it('reads the duration from the header', () => {
    expect(wavDurationMs(toneWav(1500))).toBe(1500);
  });
});

// Runs the real ffmpeg-static binary: proves the edit works on this machine, not just the filter string.
describe('ffmpeg pipeline', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mappa-test-'));
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

  it('converts the input and renders only the kept spans', async () => {
    writeFileSync(join(dir, 'input.wav'), toneWav(3000));
    await prepareSource(join(dir, 'input.wav'), join(dir, 'source.wav'));
    expect(wavDurationMs(readFileSync(join(dir, 'source.wav')))).toBe(3000);

    await renderCleanAudio(join(dir, 'source.wav'), [{ startMs: 0, endMs: 1000 }, { startMs: 2000, endMs: 2500 }], join(dir, 'clean.wav'));
    expect(Math.abs(wavDurationMs(readFileSync(join(dir, 'clean.wav'))) - 1500)).toBeLessThanOrEqual(5);
  }, 30_000);
});
