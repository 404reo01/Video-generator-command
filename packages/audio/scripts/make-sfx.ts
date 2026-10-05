/**
 * Synthesises the sound-effect library into library/sfx/ with ffmpeg: no downloads, no licences.
 * Re-run after changing a recipe.
 *
 * Usage: npm run make-sfx -w @mappa/audio
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { synthesize } from '../src/ffmpeg';

const SFX_DIR = join(import.meta.dirname, '..', '..', '..', 'library', 'sfx');

/** ffmpeg lavfi recipes. Kept quiet (peaks around -12 dBFS): they sit under the voice. */
const RECIPES: Record<string, string> = {
  // Pink-noise swell through a band-pass: a soft air whoosh for sweeps and whip pans.
  whoosh: 'anoisesrc=d=0.55:c=pink:a=0.6,highpass=f=350,lowpass=f=2600,afade=t=in:d=0.28:curve=qsin,afade=t=out:st=0.28:d=0.27:curve=qsin,volume=0.7',
  // Short sine blip with a fast decay: items popping in.
  pop: 'sine=f=740:d=0.09,afade=t=in:d=0.004,afade=t=out:st=0.012:d=0.078:curve=exp,volume=0.45',
  // Filtered white-noise tick: a keyboard click for code lines.
  click: 'anoisesrc=d=0.03:c=white:a=0.5,highpass=f=2500,afade=t=out:d=0.03:curve=exp,volume=0.5',
  // Two harmonics ringing out: a soft bell for numbers and results.
  ding: 'sine=f=1318:d=0.7,volume=0.35[a];sine=f=1976:d=0.7,volume=0.12[b];[a][b]amix=inputs=2,afade=t=out:st=0.03:d=0.67:curve=exp',
};

mkdirSync(SFX_DIR, { recursive: true });
for (const [name, recipe] of Object.entries(RECIPES)) await synthesize(recipe, join(SFX_DIR, `${name}.wav`));
console.log(`wrote ${String(Object.keys(RECIPES).length)} sound effects to ${SFX_DIR}`);
