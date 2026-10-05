import { describe, expect, it } from 'vitest';
import { resolveEmotion } from './character-manifest';

describe('resolveEmotion', () => {
  const pack = ['neutral', 'happy', 'thinking', 'surprised'];

  it('uses the requested emotion when the pack has it', () => {
    expect(resolveEmotion('thinking', pack)).toBe('thinking');
  });

  it('falls back to the closest emotion', () => {
    expect(resolveEmotion('confused', pack)).toBe('thinking');
    expect(resolveEmotion('laughing', pack)).toBe('happy');
  });

  it('falls back to neutral for unknown emotions', () => {
    expect(resolveEmotion('nostalgic', pack)).toBe('neutral');
  });

  it('uses the first sticker when there is no neutral', () => {
    expect(resolveEmotion('nostalgic', ['happy', 'sad'])).toBe('happy');
  });
});
