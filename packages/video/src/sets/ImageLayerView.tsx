import type { JSX } from 'react';
import { Img, staticFile } from 'remotion';
import type { View } from '../camera/camera';
import { DomLayer } from './layers';
import { imageLayerRect, type ImageLayer } from './set-definition';

/** A picture layer placed on its overscanned world rectangle and seen through the layer's view. */
export function ImageLayerView({ layer, view }: { readonly layer: ImageLayer; readonly view: View }): JSX.Element {
  const rect = imageLayerRect();
  return (
    <DomLayer view={view}>
      <Img
        src={staticFile(layer.image)}
        style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height, imageRendering: layer.pixelated ? 'pixelated' : 'auto' }}
      />
    </DomLayer>
  );
}
