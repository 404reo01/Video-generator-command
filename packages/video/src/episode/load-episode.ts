import { CharacterManifestSchema, ScenePlanSchema, TimelineSchema } from '@mappa/shared';
import { staticFile, type CalculateMetadataFunction } from 'remotion';
import { z } from 'zod';
import { VIDEO } from '../theme/tokens';
import type { EpisodeProps } from './EpisodeVideo';
import { LibrarySchema } from './library-context';

/** `public/current.json`, written by sync: the episode Studio previews when none is given. */
export const CurrentEpisodeSchema = z.object({ episode: z.string().min(1) });

// Half a second of picture after the last word, so the video does not end on a cut-off syllable.
const TAIL_MS = 500;

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(staticFile(path));
  if (!response.ok) throw new Error(`missing public/${path}: run "npm run sync -w @mappa/video -- --episode <slug>" first`);
  return response.json();
}

/** Loads and validates everything an episode needs, and sizes the video to the clean audio. */
export const loadEpisode: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const episode = props.episode || CurrentEpisodeSchema.parse(await fetchJson('current.json')).episode;
  const timeline = TimelineSchema.parse(await fetchJson(`episodes/${episode}/timeline.json`));
  const plan = ScenePlanSchema.parse(await fetchJson(`episodes/${episode}/scene-plan.json`));
  const character = CharacterManifestSchema.parse(await fetchJson(`characters/${plan.character}/manifest.json`));
  const library = LibrarySchema.parse(await fetchJson('library.json'));
  return {
    fps: VIDEO.fps,
    durationInFrames: Math.ceil(((timeline.durationMs + TAIL_MS) / 1000) * VIDEO.fps),
    props: { ...props, episode, data: { timeline, plan, character, library } },
  };
};
