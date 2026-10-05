import type { CharacterManifest, ScenePlan, Timeline } from '@mappa/shared';
import type { JSX } from 'react';
import { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { applyCorrections, groupCaptions } from '../captions/group-captions';
import { ShotView, type ShotViewProps } from '../shots/ShotView';
import { emotionAt, shotFrameAt, type ShotMix } from '../shots/shot-timing';
import { SweepOverlay } from '../shots/SweepOverlay';
import { Soundtrack } from '../sound/Soundtrack';
import { StyleProvider } from '../theme/style-context';
import { VIDEO } from '../theme/tokens';
import { useNowMs } from '../timing/use-now-ms';
import { LibraryProvider, type Library } from './library-context';

// A type, not an interface: Remotion's defaultProps typing needs an index-compatible object type.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EpisodeProps = {
  readonly episode: string;
  /** Filled by `calculateMetadata` from public/. */
  readonly data: EpisodeData | null;
};

export interface EpisodeData {
  readonly timeline: Timeline;
  readonly plan: ScenePlan;
  readonly character: CharacterManifest;
  readonly library: Library;
}

// Whip pans travel 60% of the frame width with a motion blur.
const WHIP_TRAVEL = 0.6;
const WHIP_BLUR_PX = 36;

function whipStyle(mix: ShotMix): { translate: string; filter: string } {
  const outgoing = !mix.otherIsPrevious;
  const p = outgoing ? mix.progress * 2 : (1 - mix.progress) * 2;
  const x = (outgoing ? -1 : 1) * p * VIDEO.width * WHIP_TRAVEL;
  return { translate: `${x.toFixed(1)}px 0`, filter: `blur(${(p * WHIP_BLUR_PX).toFixed(1)}px)` };
}

/** One episode: the shot list played over the clean audio, with transitions between shots. */
export function EpisodeVideo({ episode, data }: EpisodeProps): JSX.Element | null {
  const t = useNowMs();
  const words = data?.timeline.words;
  const corrections = data?.plan.corrections;
  const captions = useMemo(() => {
    const corrected = applyCorrections(words ?? [], corrections ?? {});
    return { bubble: groupCaptions(corrected), subtitle: groupCaptions(corrected, { maxChars: 40, softBreakChars: 22, pauseBreakMs: 500 }) };
  }, [words, corrections]);
  if (!data) return null;

  const { plan } = data;
  const frame = shotFrameAt(plan.shots, t, plan.style.pace);
  const { emotion, sinceMs } = emotionAt(plan.emotions, t);
  const common: Omit<ShotViewProps, 'shot'> = {
    t,
    manifest: data.character,
    emotion,
    emotionSinceMs: sinceMs,
    speaker: plan.speaker,
    bubbleCaptions: captions.bubble,
    subtitleCaptions: captions.subtitle,
  };
  const current = plan.shots[frame.index];
  const mix = frame.mix;
  const other = mix ? plan.shots[mix.other] : undefined;
  if (!current) return null;

  return (
    <StyleProvider style={plan.style}>
      <LibraryProvider library={data.library}>
        <AbsoluteFill style={{ background: plan.style.colors.surface, overflow: 'hidden' }}>
          {mix?.kind === 'fade' && other ? (
            <>
              <ShotView shot={mix.otherIsPrevious ? other : current} {...common} />
              <AbsoluteFill style={{ opacity: mix.progress }}>
                <ShotView shot={mix.otherIsPrevious ? current : other} {...common} />
              </AbsoluteFill>
            </>
          ) : (
            <AbsoluteFill style={mix?.kind === 'whip' ? whipStyle(mix) : {}}>
              <ShotView shot={current} {...common} />
            </AbsoluteFill>
          )}
          {mix?.kind === 'sweep' ? <SweepOverlay progress={mix.progress} /> : null}
          <Soundtrack episode={episode} timeline={data.timeline} plan={plan} />
        </AbsoluteFill>
      </LibraryProvider>
    </StyleProvider>
  );
}
