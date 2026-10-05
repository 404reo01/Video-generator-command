import { describe, expect, it } from 'vitest';
import { clampView, framingView, layerView, moveView, toScreen, WORLD } from './camera';

const character = { x: 40, y: 1230, width: 300, height: 522 };
const face = { x: 112, y: 1284, width: 156, height: 156 };

describe('framingView', () => {
  it('shows the whole set in a wide shot', () => {
    expect(framingView('wide', character, face)).toEqual(WORLD);
  });

  it('keeps every framing inside the world', () => {
    for (const framing of ['medium', 'close', 'text', 'illustration'] as const) {
      const v = framingView(framing, character, face);
      expect(v.x).toBeGreaterThanOrEqual(0);
      expect(v.y).toBeGreaterThanOrEqual(0);
      expect(v.x + v.width).toBeLessThanOrEqual(WORLD.width + 1e-6);
      expect(v.y + v.height).toBeLessThanOrEqual(WORLD.height + 1e-6);
    }
  });

  it('makes the face about a third of the frame in a close-up', () => {
    const v = framingView('close', character, face);
    expect(toScreen(face, v).width).toBeCloseTo(1080 * 0.34, 0);
  });
});

describe('moveView', () => {
  it('push-in ends tighter than it starts', () => {
    const v = framingView('medium', character, face);
    expect(moveView(v, 'push-in', 1, 'balanced').width).toBeLessThan(moveView(v, 'push-in', 0, 'balanced').width);
  });

  it('moves further at a dynamic pace than a calm one', () => {
    const v = framingView('wide', character, face);
    expect(moveView(v, 'push-in', 1, 'dynamic').width).toBeLessThan(moveView(v, 'push-in', 1, 'calm').width);
  });
});

describe('layerView', () => {
  const camera = framingView('close', character, face);

  it('follows the camera exactly at depth 1', () => {
    const v = layerView(camera, 1);
    expect(v.width).toBeCloseTo(camera.width, 6);
    expect(v.x).toBeCloseTo(camera.x, 6);
  });

  it('zooms less on far layers than on near ones', () => {
    expect(layerView(camera, 0.3).width).toBeGreaterThan(layerView(camera, 1.1).width);
  });

  it('does not move the background at depth 0', () => {
    expect(layerView(camera, 0)).toEqual(WORLD);
  });
});

describe('clampView', () => {
  it('pulls a view back inside the world', () => {
    const v = clampView({ x: -100, y: 1800, width: 540, height: 960 });
    expect([v.x, v.y]).toEqual([0, 960]);
  });
});
