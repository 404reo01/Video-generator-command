/**
 * Installs a sticker pack from a folder of PNGs (one per emotion, named after it):
 * checks size, transparency and required emotions, estimates the face box, writes
 * characters/<name>/stickers/ + stickers.json, and renders a preview sheet to check the face box.
 *
 * Usage: npm run stickers -w @mappa/sprites -- --name <character> [--from ../../stickers] [--pixel]
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { characterDir } from '../src/character-store';
import { createImage, getPixel, setPixel, type RgbaImage } from '../src/image';
import { readPng, writePng } from '../src/png';
import { composeGrid } from '../src/render';
import { emotionFromFileName, estimateFace, hasTransparentBackground, RECOMMENDED_EMOTIONS, silhouetteBox, type FaceBox } from '../src/sticker-check';
import { StickerPackSchema } from '../src/sticker-pack';

const PREVIEW_HEIGHT = 360;
// Margin kept around the union of all silhouettes when cropping, as a share of its size.
const CROP_MARGIN = 0.03;

/** Smallest box containing every sticker's silhouette (with a margin): one crop for the whole pack keeps framing identical. */
function unionBox(images: readonly RgbaImage[]): FaceBox {
  const boxes = images.map((img) => silhouetteBox(img)).filter((b): b is FaceBox => b !== null);
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.width));
  const y1 = Math.max(...boxes.map((b) => b.y + b.height));
  const first = images[0];
  const mx = Math.round((x1 - x0) * CROP_MARGIN);
  const my = Math.round((y1 - y0) * CROP_MARGIN);
  const x = Math.max(0, x0 - mx);
  const y = Math.max(0, y0 - my);
  return { x, y, width: Math.min(first?.width ?? x1, x1 + mx) - x, height: Math.min(first?.height ?? y1, y1 + my) - y };
}

function crop(image: RgbaImage, box: FaceBox): RgbaImage {
  const out = createImage(box.width, box.height);
  for (let y = 0; y < box.height; y++) out.data.set(image.data.subarray(((box.y + y) * image.width + box.x) * 4, ((box.y + y) * image.width + box.x + box.width) * 4), y * box.width * 4);
  return out;
}
const FACE_COLOR = { r: 255, g: 122, b: 61, a: 255 };

/** Nearest-neighbour downscale to a given height, with the face box outlined. */
function thumbnail(image: RgbaImage, face: FaceBox): RgbaImage {
  const scale = PREVIEW_HEIGHT / image.height;
  const out = createImage(Math.max(1, Math.round(image.width * scale)), PREVIEW_HEIGHT);
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const p = getPixel(image, Math.min(image.width - 1, Math.floor(x / scale)), Math.min(image.height - 1, Math.floor(y / scale)));
      // Checkerboard behind transparent pixels so the cut-out is visible.
      const bg = (Math.floor(x / 12) + Math.floor(y / 12)) % 2 === 0 ? 70 : 50;
      const a = p.a / 255;
      setPixel(out, x, y, { r: Math.round(p.r * a + bg * (1 - a)), g: Math.round(p.g * a + bg * (1 - a)), b: Math.round(p.b * a + (bg + 10) * (1 - a)), a: 255 });
    }
  }
  const [x0, y0, x1, y1] = [face.x, face.y, face.x + face.width, face.y + face.height].map((v) => Math.round(v * scale));
  for (let t = 0; t < 3; t++) {
    for (let x = (x0 ?? 0); x <= (x1 ?? 0); x++) {
      setPixel(out, Math.min(out.width - 1, x), (y0 ?? 0) + t, FACE_COLOR);
      setPixel(out, Math.min(out.width - 1, x), Math.min(out.height - 1, (y1 ?? 0) - t), FACE_COLOR);
    }
    for (let y = (y0 ?? 0); y <= (y1 ?? 0); y++) {
      setPixel(out, (x0 ?? 0) + t, Math.min(out.height - 1, y), FACE_COLOR);
      setPixel(out, Math.min(out.width - 1, (x1 ?? 0) - t), Math.min(out.height - 1, y), FACE_COLOR);
    }
  }
  return out;
}

const { values } = parseArgs({ options: { name: { type: 'string' }, from: { type: 'string', default: join(import.meta.dirname, '..', '..', '..', 'library', 'stickers') }, pixel: { type: 'boolean', default: false } } });
if (!values.name) throw new Error('missing --name (e.g. --name reo)');
const from = resolve(values.from);
const files = readdirSync(from).filter((f) => f.toLowerCase().endsWith('.png'));
if (files.length === 0) throw new Error(`no PNG files in ${from}`);

const problems: string[] = [];
const notes: string[] = [];
const stickers = files.map((file) => ({ file, emotion: emotionFromFileName(file), image: readPng(join(from, file)) }));
const first = stickers[0];
if (!first) throw new Error('unreachable');
for (const s of stickers) {
  if (s.image.width !== first.image.width || s.image.height !== first.image.height) problems.push(`${s.file}: ${String(s.image.width)}x${String(s.image.height)}, expected ${String(first.image.width)}x${String(first.image.height)} like ${first.file}`);
  if (!hasTransparentBackground(s.image)) problems.push(`${s.file}: no transparent background`);
  if (!(RECOMMENDED_EMOTIONS as readonly string[]).includes(s.emotion)) notes.push(`"${s.emotion}" is not a standard emotion name: it will only be used if a plan asks for it by name`);
}
const neutral = stickers.find((s) => s.emotion === 'neutral');
if (!neutral) problems.push('neutral.png is required (fallback emotion)');
const missing = RECOMMENDED_EMOTIONS.slice(0, 6).filter((e) => !stickers.some((s) => s.emotion === e));
if (missing.length > 0) notes.push(`missing recommended emotions: ${missing.join(', ')} (closest ones will be used)`);

if (problems.length > 0 || !neutral) {
  console.log(`Sticker pack NOT installed:\n  - ${problems.join('\n  - ')}`);
  process.exitCode = 1;
} else {
  // Crop every sticker to the same tight box: empty margins would shrink and shift the character in sets.
  const box = unionBox(stickers.map((s) => s.image));
  const cropped = stickers.map((s) => ({ ...s, image: crop(s.image, box) }));
  const croppedNeutral = cropped.find((s) => s.emotion === 'neutral');
  const face = croppedNeutral ? estimateFace(croppedNeutral.image) : null;
  if (!face) throw new Error('neutral.png is fully transparent');
  const dir = characterDir(values.name);
  rmSync(join(dir, 'stickers'), { recursive: true, force: true });
  mkdirSync(join(dir, 'stickers'), { recursive: true });
  for (const s of cropped) writePng(join(dir, 'stickers', `${s.emotion}.png`), s.image);
  const pack = StickerPackSchema.parse({ name: values.name, style: values.pixel ? 'pixel' : 'smooth', face });
  writeFileSync(join(dir, 'stickers.json'), `${JSON.stringify(pack, null, 2)}\n`);
  const preview = join(import.meta.dirname, '..', 'out', values.name, 'stickers-preview.png');
  writePng(preview, composeGrid(cropped.map((s) => thumbnail(s.image, face)), 6, 12, { r: 30, g: 22, b: 40, a: 255 }));
  console.log(`Cropped from ${String(first.image.width)}x${String(first.image.height)} to ${String(box.width)}x${String(box.height)} (same box for every sticker)`);
  console.log(`Installed ${String(stickers.length)} stickers for "${values.name}": ${stickers.map((s) => s.emotion).join(', ')}`);
  console.log(`Face box (orange on the preview, editable in stickers.json): ${JSON.stringify(face)}`);
  console.log(`Preview: ${preview}`);
  if (existsSync(join(dir, 'character.json'))) console.log('Note: this character also has pixel grids; the sticker pack now takes priority in videos.');
}
if (notes.length > 0) console.log(`Notes:\n  - ${notes.join('\n  - ')}`);
