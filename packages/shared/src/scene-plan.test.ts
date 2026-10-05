import { describe, expect, it } from 'vitest';
import { ShotSchema } from './scene-plan';

const shot = { id: 'outro', startMs: 0, endMs: 6000, set: 'reo-office', move: 'static', transitionIn: 'cut', captions: 'subtitle' } as const;
const cta = { kind: 'subscribe', atMs: 1000, clickAtMs: 2000, label: "S'abonner", doneLabel: 'Abonné' } as const;

describe('ShotSchema call to action', () => {
  it('accepts a subscribe button on a close-up', () => {
    expect(ShotSchema.safeParse({ ...shot, framing: 'close', cta }).success).toBe(true);
  });

  it('rejects a button clicked before it appears', () => {
    expect(ShotSchema.safeParse({ ...shot, framing: 'close', cta: { ...cta, clickAtMs: 500 } }).success).toBe(false);
  });

  it('rejects a call to action on a visual shot', () => {
    expect(ShotSchema.safeParse({ ...shot, framing: 'text', text: { lines: [{ text: 'Hi', atMs: 0 }] }, cta }).success).toBe(false);
  });
});
