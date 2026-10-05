import { describe, expect, it } from 'vitest';
import { SAFE } from '../theme/tokens';
import { placeBubble } from './bubble-placement';

const bubble = { width: 584, height: 250 };

describe('placeBubble', () => {
  it('puts the bubble to the right of a small face on the left', () => {
    const placement = placeBubble({ x: 120, y: 1290, width: 150, height: 150 }, bubble);
    expect(placement?.tail).toBe('left');
    expect(placement && placement.left + bubble.width).toBeLessThanOrEqual(SAFE.right);
  });

  it('goes above a face that leaves no room on the right', () => {
    expect(placeBubble({ x: 300, y: 900, width: 420, height: 420 }, bubble)?.tail).toBe('bottom');
  });

  it('gives up when the face fills the frame', () => {
    expect(placeBubble({ x: 100, y: 200, width: 880, height: 880 }, bubble)).toBeNull();
  });
});
