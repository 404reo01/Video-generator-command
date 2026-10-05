import type { Rect } from '../camera/camera';
import { SAFE } from '../theme/tokens';

export interface BubblePlacement {
  readonly left: number;
  readonly top: number;
  readonly tail: 'left' | 'bottom';
}

const GAP = 30;
// Keep the bubble clear of the subtitle band and of TikTok's bottom UI.
const LOWEST_TOP_MARGIN = 160;

/**
 * Puts the speech bubble next to the face on screen: to the right if it fits, otherwise above.
 * Returns null when neither fits (e.g. extreme close-up); the shot then falls back to subtitles.
 */
export function placeBubble(face: Rect, bubble: { width: number; height: number }): BubblePlacement | null {
  const lowest = SAFE.bottom - bubble.height - LOWEST_TOP_MARGIN;
  const right = { left: face.x + face.width + GAP, top: Math.min(lowest, Math.max(SAFE.top + 40, face.y - bubble.height * 0.55)) };
  if (right.left >= SAFE.left && right.left + bubble.width <= SAFE.right) return { ...right, tail: 'left' };

  const above = {
    left: Math.min(SAFE.right - bubble.width, Math.max(SAFE.left, face.x + face.width / 2 - 110)),
    top: face.y - bubble.height - GAP,
  };
  if (above.top >= SAFE.top && above.top <= lowest) return { ...above, tail: 'bottom' };
  return null;
}
