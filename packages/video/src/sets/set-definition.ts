import type { ComponentType } from 'react';
import type { Rect, View } from '../camera/camera';

/** Props every set layer receives: the time and the part of the world it must show. */
export interface SetLayerProps {
  readonly t: number;
  readonly view: View;
}

interface LayerBase {
  readonly id: string;
  /**
   * Distance from the camera relative to the character (1). 0 = infinitely far (never moves),
   * 0.2-0.5 = background, 0.7-0.9 = room, >1 = foreground in front of the character.
   */
  readonly depth: number;
}

/** A layer drawn on a canvas: `paint` receives a context already transformed to world coordinates. */
export interface PaintedLayer extends LayerBase {
  readonly paint: (ctx: CanvasRenderingContext2D, t: number) => void;
}

/** A layer rendered by a React component (SVG or HTML, see `SvgLayer` / `DomLayer`). */
export interface ComponentLayer extends LayerBase {
  readonly component: ComponentType<SetLayerProps>;
}

/**
 * A layer that is a picture (an illustrated decor exported as PNG), served from `public/`.
 * The image covers the world (1080x1920) enlarged by `IMAGE_OVERSCAN` around its centre, so parallax
 * never reveals its edges.
 */
export interface ImageLayer extends LayerBase {
  /** Path inside `public/`, e.g. `sets/my-office/background.png` (copied from `library/sets/` by sync). */
  readonly image: string;
  /** Pixel art: scaled without smoothing. */
  readonly pixelated: boolean;
}

export type SetLayer = PaintedLayer | ComponentLayer | ImageLayer;

/** Extra size of image layers around the frame (share of the world), hidden by default and revealed by parallax. */
export const IMAGE_OVERSCAN = 0.05;

/** World rectangle an image layer is drawn into. */
export function imageLayerRect(): Rect {
  return { x: -540 * IMAGE_OVERSCAN, y: -960 * IMAGE_OVERSCAN, width: 1080 * (1 + IMAGE_OVERSCAN), height: 1920 * (1 + IMAGE_OVERSCAN) };
}

/**
 * A set (decor) the episode is filmed in. Sets are written per video by the director (Claude) and
 * kept in this folder, so every video grows the library. Drawing happens in world coordinates:
 * a 1080x1920 design space, the full frame of a wide shot.
 */
export interface SetDefinition {
  readonly id: string;
  /** One line: what the set shows, used by the director to pick or reuse sets. */
  readonly description: string;
  /** Solid colour behind every layer (visible only if a layer leaves a gap). */
  readonly background: string;
  /** Back-to-front. The string 'character' marks where the character is drawn. */
  readonly layers: readonly (SetLayer | 'character')[];
  /** Where the character stands, in world pixels; the sticker is scaled to `height`. */
  readonly character: { readonly x: number; readonly bottom: number; readonly height: number };
  /**
   * A plain backdrop for text and illustration shots: shown sharp (no blur) and without the character
   * in the scene (the picture-in-picture shows them). Takes the episode's style colours.
   */
  readonly backdrop?: boolean;
}

/** World rectangle covered by the character's sticker. */
export function characterRect(set: SetDefinition, sticker: { width: number; height: number }): Rect {
  const scale = set.character.height / sticker.height;
  const width = sticker.width * scale;
  return { x: set.character.x, y: set.character.bottom - set.character.height, width, height: set.character.height };
}
