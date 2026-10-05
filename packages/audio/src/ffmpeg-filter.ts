import type { TimeSpan } from '@mappa/shared';
import { spanLength } from './spans';

// 8 ms: long enough to remove the click of a hard cut, short enough to be inaudible on speech.
export const CUT_FADE_MS = 8;
// -14 LUFS integrated, -1.5 dBTP: the loudness TikTok, Reels and LinkedIn normalise speech to.
const LOUDNORM = 'loudnorm=I=-14:TP=-1.5:LRA=11';

const seconds = (ms: number): string => (ms / 1000).toFixed(3);

/**
 * ffmpeg filter graph that keeps `kept` spans of input 0, fades each edge, joins them and normalises loudness.
 * Written to a script file by the caller: a long edit exceeds the Windows command-line limit.
 */
export function buildCutFilter(kept: readonly TimeSpan[], fadeMs: number = CUT_FADE_MS): string {
  if (kept.length === 0) throw new Error('nothing left to keep: every span of the audio was cut');
  const parts = kept.map((span, i) => {
    const fade = Math.min(fadeMs, spanLength(span) / 4);
    const length = spanLength(span);
    return (
      `[0:a]atrim=start=${seconds(span.startMs)}:end=${seconds(span.endMs)},asetpts=PTS-STARTPTS,` +
      `afade=t=in:st=0:d=${seconds(fade)},afade=t=out:st=${seconds(length - fade)}:d=${seconds(fade)}[s${String(i)}]`
    );
  });
  const inputs = kept.map((_, i) => `[s${String(i)}]`).join('');
  return `${parts.join(';\n')};\n${inputs}concat=n=${String(kept.length)}:v=0:a=1,${LOUDNORM}[out]`;
}
