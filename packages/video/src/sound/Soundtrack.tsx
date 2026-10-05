import { Audio } from '@remotion/media';
import type { ScenePlan, Timeline } from '@mappa/shared';
import type { JSX } from 'react';
import { Sequence, staticFile, useVideoConfig } from 'remotion';
import { useLibrary } from '../episode/library-context';
import { duckedVolume } from './ducking';
import { sfxCues } from './sfx-cues';

/** Voice, background music ducked under it, and the plan's sound effects. */
export function Soundtrack({ episode, timeline, plan }: { readonly episode: string; readonly timeline: Timeline; readonly plan: ScenePlan }): JSX.Element {
  const { fps } = useVideoConfig();
  const library = useLibrary();
  const music = plan.music ? library.music.find((m) => m.id === plan.music?.track) : undefined;
  const musicVolume = plan.music?.volume ?? 0;

  return (
    <>
      <Audio src={staticFile(`episodes/${episode}/clean.wav`)} premountFor={fps} />
      {music ? <Audio src={staticFile(`music/${music.file}`)} loop premountFor={fps} volume={(frame) => duckedVolume(musicVolume, timeline.words, (frame / fps) * 1000)} /> : null}
      {sfxCues(plan)
        .filter((cue) => library.sfx.includes(cue.sound))
        .map((cue, i) => (
          <Sequence key={i} from={Math.round((cue.atMs / 1000) * fps)} durationInFrames={fps * 2} premountFor={fps}>
            <Audio src={staticFile(`sfx/${cue.sound}.wav`)} volume={cue.volume} />
          </Sequence>
        ))}
    </>
  );
}
