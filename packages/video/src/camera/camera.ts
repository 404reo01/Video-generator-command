import type { CameraMove, Framing, Style } from '@mappa/shared';
import { VIDEO } from '../theme/tokens';

/** A rectangle of the world (1080x1920 design space) shown full-frame. */
export interface View {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const WORLD: View = { x: 0, y: 0, width: VIDEO.width, height: VIDEO.height };
const ASPECT = VIDEO.height / VIDEO.width;

/** How far a camera move travels over a whole shot, by pace (fraction of the view). */
const MOVE_AMOUNT: Record<Style['pace'], number> = { calm: 0.05, balanced: 0.08, dynamic: 0.12 };
// Close-ups show the face at about a third of the frame width.
const CLOSE_UP_FACE_SHARE = 0.34;
const MEDIUM_ZOOM = 1.45;

function viewAround(cx: number, cy: number, width: number): View {
  const height = width * ASPECT;
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

/** Keeps a view inside the world so the camera never shows past the set's edges. */
export function clampView(view: View, bounds: View = WORLD): View {
  const width = Math.min(view.width, bounds.width);
  const height = width * ASPECT;
  return {
    x: Math.min(Math.max(view.x, bounds.x), bounds.x + bounds.width - width),
    y: Math.min(Math.max(view.y, bounds.y), bounds.y + bounds.height - height),
    width,
    height,
  };
}

/** Resting view of a framing, before the camera move is applied. */
export function framingView(framing: Framing, character: Rect, face: Rect): View {
  switch (framing) {
    case 'wide':
      return WORLD;
    case 'medium': {
      // Character in the lower third, room above and beside for an illustration.
      const width = WORLD.width / MEDIUM_ZOOM;
      return clampView(viewAround(character.x + character.width / 2 + width * 0.22, character.y + character.height * 0.15, width));
    }
    case 'close': {
      const width = face.width / CLOSE_UP_FACE_SHARE;
      // Face slightly below centre, leaving the top of the frame for a keyword.
      return clampView(viewAround(face.x + face.width / 2, face.y + face.height / 2 - width * ASPECT * 0.08, width));
    }
    case 'text':
    case 'illustration':
      // Background plate behind full-screen overlays: a gentle zoom so the set still reads.
      return clampView(viewAround(WORLD.width / 2, WORLD.height / 2, WORLD.width / 1.12));
  }
}

/** Applies the camera move: `progress` goes 0 -> 1 over the shot. */
export function moveView(view: View, move: CameraMove, progress: number, pace: Style['pace']): View {
  const amount = MOVE_AMOUNT[pace];
  const cx = view.x + view.width / 2;
  const cy = view.y + view.height / 2;
  switch (move) {
    case 'static':
      return view;
    case 'push-in':
      return clampView(viewAround(cx, cy, view.width * (1 - amount * progress)));
    case 'pull-out':
      return clampView(viewAround(cx, cy, view.width * (1 - amount * (1 - progress))));
    case 'pan-left':
      return clampView(viewAround(cx + view.width * amount * (0.5 - progress), cy, view.width * (1 - amount)));
    case 'pan-right':
      return clampView(viewAround(cx - view.width * amount * (0.5 - progress), cy, view.width * (1 - amount)));
    case 'drift':
      return clampView(viewAround(cx + Math.sin(progress * Math.PI) * view.width * amount * 0.3, cy - progress * view.height * amount * 0.2, view.width * (1 - amount * 0.4)));
  }
}

/**
 * View of a layer at `depth` (1 = the character's plane). Far layers (depth < 1) zoom and travel less
 * than the camera, near ones (> 1) more: that difference is the parallax.
 */
export function layerView(camera: View, depth: number): View {
  const zoom = WORLD.width / camera.width;
  const layerZoom = Math.max(0.2, 1 + (zoom - 1) * depth);
  const wcx = WORLD.width / 2;
  const wcy = WORLD.height / 2;
  const cx = wcx + (camera.x + camera.width / 2 - wcx) * depth;
  const cy = wcy + (camera.y + camera.height / 2 - wcy) * depth;
  const width = WORLD.width / layerZoom;
  return { x: cx - width / 2, y: cy - (width * ASPECT) / 2, width, height: width * ASPECT };
}

/** Scale and offset that map world coordinates seen through `view` onto the 1080x1920 screen. */
export function viewTransform(view: View): { scale: number; dx: number; dy: number } {
  const scale = VIDEO.width / view.width;
  return { scale, dx: -view.x * scale, dy: -view.y * scale };
}

/** Where a world rectangle lands on screen through `view`. */
export function toScreen(rect: Rect, view: View): Rect {
  const { scale, dx, dy } = viewTransform(view);
  return { x: rect.x * scale + dx, y: rect.y * scale + dy, width: rect.width * scale, height: rect.height * scale };
}
