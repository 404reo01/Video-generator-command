import { resolveEmotion, type CharacterManifest } from '@mappa/shared';
import type { CSSProperties, JSX } from 'react';
import { Img, staticFile } from 'remotion';
import { toScreen, type Rect, type View } from '../camera/camera';
import { enter } from '../timing/envelope';

interface CharacterStickerProps {
  readonly manifest: CharacterManifest;
  readonly emotion: string;
  readonly emotionSinceMs: number;
  /** World rectangle of the sticker. */
  readonly rect: Rect;
  readonly view: View;
  readonly t: number;
  readonly style?: CSSProperties;
}

export function stickerSrc(manifest: CharacterManifest, emotion: string): string {
  return staticFile(`characters/${manifest.name}/${resolveEmotion(emotion, manifest.emotions)}.png`);
}

/** The character's emotion sticker, placed in the world and seen through the camera. */
export function CharacterSticker({ manifest, emotion, emotionSinceMs, rect, view, t, style }: CharacterStickerProps): JSX.Element {
  const screen = toScreen(rect, view);
  // A short squash-and-settle when the emotion changes, and a slow breathing bob.
  const pop = 1 + 0.05 * (1 - enter(t, emotionSinceMs, 220));
  const breath = Math.sin(t / 900) * screen.height * 0.004;
  return (
    <Img
      src={stickerSrc(manifest, emotion)}
      style={{
        position: 'absolute',
        left: screen.x,
        top: screen.y + breath,
        width: screen.width,
        height: screen.height,
        imageRendering: manifest.style === 'pixel' ? 'pixelated' : 'auto',
        scale: `${pop.toFixed(3)} ${(2 - pop).toFixed(3)}`,
        transformOrigin: '50% 100%',
        ...style,
      }}
    />
  );
}
