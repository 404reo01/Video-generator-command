import { z } from 'zod';

/** One background track in `library/music/`. The licence is recorded so every video stays publishable. */
export const MusicTrackSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  file: z.string().regex(/\.(mp3|wav|ogg|m4a)$/i),
  title: z.string().min(1),
  artist: z.string().min(1),
  /** Page the track was taken from. */
  source: z.url(),
  /** e.g. "Pixabay Content License": free for commercial use, no attribution required. */
  license: z.string().min(1),
  /** Free tags the director matches against the requested ambiance, e.g. ["lofi", "jazz", "calm"]. */
  moods: z.array(z.string().min(1)).min(1),
  bpm: z.number().int().positive().optional(),
});
export type MusicTrack = z.infer<typeof MusicTrackSchema>;

/** `library/music/music.json`. */
export const MusicLibrarySchema = z.object({ tracks: z.array(MusicTrackSchema) });
export type MusicLibrary = z.infer<typeof MusicLibrarySchema>;
