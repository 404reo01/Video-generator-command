import type { CharacterManifest, Shot } from '@mappa/shared';
import type { JSX } from 'react';
import { AbsoluteFill } from 'remotion';
import { framingView, layerView, moveView, toScreen, type Rect } from '../camera/camera';
import { BUBBLE_HEIGHT, BUBBLE_WIDTH, DialogBubble } from '../captions/DialogBubble';
import type { Caption } from '../captions/group-captions';
import { Subtitle } from '../captions/Subtitle';
import { IllustrationView } from '../illustrations/IllustrationView';
import { getSet } from '../sets/registry';
import { characterRect } from '../sets/set-definition';
import { SubscribeButton } from '../cta/SubscribeButton';
import { KineticTextView } from '../text/KineticTextView';
import { LAYOUT, SAFE } from '../theme/tokens';
import { useStyle } from '../theme/style-context';
import { Panel } from '../ui/Panel';
import { placeBubble } from './bubble-placement';
import { PictureInPicture } from './PictureInPicture';
import { World } from './World';

export interface ShotViewProps {
  readonly shot: Shot;
  readonly t: number;
  readonly manifest: CharacterManifest;
  readonly emotion: string;
  readonly emotionSinceMs: number;
  readonly speaker: string;
  readonly bubbleCaptions: readonly Caption[];
  readonly subtitleCaptions: readonly Caption[];
}

/** One shot, fully composed: the set through the camera, then text, illustration and captions on top. */
export function ShotView({ shot, t, manifest, emotion, emotionSinceMs, speaker, bubbleCaptions, subtitleCaptions }: ShotViewProps): JSX.Element {
  const { pace } = useStyle();
  const set = getSet(shot.set);
  const character = characterRect(set, manifest);
  const scale = character.height / manifest.height;
  const face: Rect = { x: character.x + manifest.face.x * scale, y: character.y + manifest.face.y * scale, width: manifest.face.width * scale, height: manifest.face.height * scale };
  const progress = Math.min(1, Math.max(0, (t - shot.startMs) / (shot.endMs - shot.startMs)));
  const camera = moveView(framingView(shot.framing, character, face), shot.move, progress, pace);
  const backdrop = shot.framing === 'text' || shot.framing === 'illustration';
  // Plain backdrop sets are made to sit behind content: no blur, no character in the scene (PiP shows them).
  const softenWorld = backdrop && set.backdrop !== true;

  const bubble = shot.captions === 'bubble' && !backdrop ? placeBubble(toScreen(face, layerView(camera, 1)), { width: BUBBLE_WIDTH, height: BUBBLE_HEIGHT }) : null;
  // A bubble that cannot fit next to the face becomes subtitles rather than covering it.
  const subtitles = shot.captions === 'subtitle' || (shot.captions === 'bubble' && bubble === null);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: softenWorld ? 'blur(14px) brightness(0.5) saturate(0.9)' : 'none' }}>
        <World set={set} camera={camera} t={t} manifest={manifest} emotion={emotion} emotionSinceMs={emotionSinceMs} characterRect={character} showCharacter={!(backdrop && set.backdrop === true)} />
      </AbsoluteFill>

      {shot.text ? <KineticTextView text={shot.text} endMs={shot.endMs} placement={shot.framing === 'text' ? 'full' : 'top'} /> : null}

      {shot.illustration ? (
        <Panel startMs={shot.startMs} endMs={shot.endMs} style={{ ...(shot.framing === 'illustration' ? LAYOUT.fullPanel : LAYOUT.sidePanel), padding: '46px 46px 50px' }}>
          <IllustrationView illustration={shot.illustration} startMs={shot.startMs} />
        </Panel>
      ) : null}

      {shot.cta ? <SubscribeButton cta={shot.cta} endMs={shot.endMs} /> : null}

      {shot.framing === 'illustration' ? <PictureInPicture manifest={manifest} emotion={emotion} startMs={shot.startMs} t={t} /> : null}

      {bubble ? <DialogBubble captions={bubbleCaptions} speaker={speaker} left={bubble.left} top={bubble.top} tail={bubble.tail} /> : null}
      {subtitles && shot.framing === 'illustration' ? (
        <Subtitle captions={subtitleCaptions} left={LAYOUT.pip.left + LAYOUT.pip.size + 24} width={SAFE.right - (LAYOUT.pip.left + LAYOUT.pip.size + 24)} />
      ) : subtitles ? (
        <Subtitle captions={subtitleCaptions} />
      ) : null}
    </AbsoluteFill>
  );
}
