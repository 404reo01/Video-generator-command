import type { CharacterManifest } from '@mappa/shared';
import type { JSX } from 'react';
import { AbsoluteFill } from 'remotion';
import { layerView, type Rect, type View } from '../camera/camera';
import { CharacterSticker } from '../character/CharacterSticker';
import { ImageLayerView } from '../sets/ImageLayerView';
import { CanvasLayer } from '../sets/layers';
import type { SetDefinition } from '../sets/set-definition';

interface WorldProps {
  readonly set: SetDefinition;
  readonly camera: View;
  readonly t: number;
  readonly manifest: CharacterManifest;
  readonly emotion: string;
  readonly emotionSinceMs: number;
  readonly characterRect: Rect;
  readonly showCharacter: boolean;
}

/** A set's layers, back to front, each seen through its own parallax view, with the character in place. */
export function World({ set, camera, t, manifest, emotion, emotionSinceMs, characterRect, showCharacter }: WorldProps): JSX.Element {
  return (
    <AbsoluteFill style={{ background: set.background, overflow: 'hidden' }}>
      {set.layers.map((layer) => {
        if (layer === 'character') {
          return showCharacter ? (
            <CharacterSticker key="character" manifest={manifest} emotion={emotion} emotionSinceMs={emotionSinceMs} rect={characterRect} view={layerView(camera, 1)} t={t} />
          ) : null;
        }
        const view = layerView(camera, layer.depth);
        if ('paint' in layer) return <CanvasLayer key={layer.id} view={view} t={t} paint={layer.paint} />;
        if ('image' in layer) return <ImageLayerView key={layer.id} layer={layer} view={view} />;
        const Layer = layer.component;
        return <Layer key={layer.id} t={t} view={view} />;
      })}
    </AbsoluteFill>
  );
}
