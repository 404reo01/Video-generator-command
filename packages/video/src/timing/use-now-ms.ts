import { useCurrentFrame, useVideoConfig } from 'remotion';

/** Current time in ms on the clean-audio clock: every plan and timeline time is expressed on it. */
export function useNowMs(): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame / fps) * 1000;
}
