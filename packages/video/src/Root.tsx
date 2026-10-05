import type { JSX } from 'react';
import { Composition } from 'remotion';
import { EpisodeVideo } from './episode/EpisodeVideo';
import { loadEpisode } from './episode/load-episode';

export function RemotionRoot(): JSX.Element {
  return (
    <Composition
      id="Episode"
      component={EpisodeVideo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={300}
      // Empty episode = the last one synced (public/current.json), so Studio always previews the latest video.
      defaultProps={{ episode: '', data: null }}
      calculateMetadata={loadEpisode}
    />
  );
}
