import type { Character } from './character';
import { TRANSPARENT, indexAt, type IndexedSprite } from './indexed-sprite';

/** One frame of a character, stored as a text grid: one line per row, one palette symbol per pixel. */
export interface Pose {
  readonly name: string;
  readonly rows: readonly string[];
}

export class PoseFormatError extends Error {
  constructor(poseName: string, detail: string) {
    super(`pose "${poseName}": ${detail}`);
    this.name = 'PoseFormatError';
  }
}

export function parsePose(name: string, text: string, character: Character): Pose {
  const rows = text.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
  if (rows.length !== character.height) {
    throw new PoseFormatError(name, `expected ${String(character.height)} rows, found ${String(rows.length)}`);
  }
  rows.forEach((row, y) => {
    if (row.length !== character.width) {
      throw new PoseFormatError(name, `row ${String(y + 1)} has ${String(row.length)} columns, expected ${String(character.width)}`);
    }
    for (let x = 0; x < row.length; x++) {
      const symbol = row.charAt(x);
      if (symbol !== character.transparent && !(symbol in character.palette)) {
        throw new PoseFormatError(name, `unknown symbol "${symbol}" at row ${String(y + 1)}, column ${String(x + 1)}`);
      }
    }
  });
  return { name, rows };
}

export function serializePose(pose: Pose): string {
  return `${pose.rows.join('\n')}\n`;
}

/** Converts quantized pixels to a pose, mapping palette index `i` to `symbols[i]`. */
export function poseFromIndexed(name: string, sprite: IndexedSprite, symbols: readonly string[], transparent: string): Pose {
  const rows: string[] = [];
  for (let y = 0; y < sprite.height; y++) {
    let row = '';
    for (let x = 0; x < sprite.width; x++) {
      const index = indexAt(sprite, x, y);
      row += index === TRANSPARENT ? transparent : (symbols[index] ?? transparent);
    }
    rows.push(row);
  }
  return { name, rows };
}
