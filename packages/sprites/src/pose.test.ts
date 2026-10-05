import { describe, expect, it } from 'vitest';
import { CharacterSchema, type Character } from './character';
import { PoseFormatError, parsePose, serializePose } from './pose';
import { renderPose } from './render';

const character: Character = CharacterSchema.parse({
  name: 'tiny',
  width: 3,
  height: 2,
  transparent: '.',
  palette: { A: { hex: '#000000', name: 'outline' }, B: { hex: '#ff8000', name: 'skin' } },
});

describe('parsePose', () => {
  it('round-trips through serializePose', () => {
    const pose = parsePose('idle', 'AB.\n.BA\n', character);
    expect(parsePose('idle', serializePose(pose), character)).toEqual(pose);
  });

  it('accepts Windows line endings', () => {
    expect(parsePose('idle', 'AB.\r\n.BA\r\n', character).rows).toEqual(['AB.', '.BA']);
  });

  it('reports the position of an unknown symbol', () => {
    expect(() => parsePose('idle', 'AB.\n.ZA\n', character)).toThrow(/"Z" at row 2, column 2/);
  });

  it('rejects a grid of the wrong size', () => {
    expect(() => parsePose('idle', 'AB\n.B\n', character)).toThrow(PoseFormatError);
    expect(() => parsePose('idle', 'AB.\n', character)).toThrow(/expected 2 rows/);
  });
});

describe('CharacterSchema', () => {
  it('rejects a transparent symbol that is also a colour', () => {
    expect(() => CharacterSchema.parse({ ...character, transparent: 'A' })).toThrow();
  });
});

describe('renderPose', () => {
  it('scales each logical pixel to a block and leaves transparent pixels clear', () => {
    const image = renderPose(parsePose('idle', 'AB.\n.BA\n', character), character, 2);
    expect([image.width, image.height]).toEqual([6, 4]);
    expect(Array.from(image.data.slice(8, 12))).toEqual([255, 128, 0, 255]);
    expect(image.data[4 * 4 + 3]).toBe(0);
  });
});
