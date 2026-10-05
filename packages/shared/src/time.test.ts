import { describe, expect, it } from 'vitest';
import { frameToMs, msToFrame } from './time';

describe('msToFrame', () => {
  it('converts milliseconds to the frame they fall on at 30 fps', () => {
    expect(msToFrame(4200)).toBe(126);
  });

  it('floors partial frames so content never appears early', () => {
    expect(msToFrame(33)).toBe(0);
    expect(msToFrame(34)).toBe(1);
  });

  it('rejects negative times', () => {
    expect(() => msToFrame(-1)).toThrow(RangeError);
  });

  it('rejects a non-integer fps', () => {
    expect(() => msToFrame(1000, 29.97)).toThrow();
  });
});

describe('frameToMs', () => {
  it('is the inverse of msToFrame on frame boundaries', () => {
    expect(msToFrame(frameToMs(126))).toBe(126);
  });
});
