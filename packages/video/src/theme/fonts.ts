import type { Style } from '@mappa/shared';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadLexend } from '@remotion/google-fonts/Lexend';
import { loadFont as loadPixelifySans } from '@remotion/google-fonts/PixelifySans';

// loadFont() blocks rendering until the font is ready, so no frame is captured with a fallback face.
const pixel = loadPixelifySans('normal', { weights: ['500', '600'], subsets: ['latin'] });
const sans = loadLexend('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext'] });
const mono = loadJetBrainsMono('normal', { weights: ['400', '600', '700'], subsets: ['latin', 'latin-ext'] });

export interface FontSet {
  /** Titles and kinetic text. */
  readonly title: string;
  readonly titleWeight: number;
  /** Subtitles, bubble text, labels in illustrations. */
  readonly body: string;
  /** Small caps labels, numbers, code. */
  readonly label: string;
}

const FONT_SETS: Record<Style['typography'], FontSet> = {
  cozy: { title: pixel.fontFamily, titleWeight: 600, body: sans.fontFamily, label: mono.fontFamily },
  modern: { title: sans.fontFamily, titleWeight: 700, body: sans.fontFamily, label: mono.fontFamily },
  mono: { title: mono.fontFamily, titleWeight: 700, body: sans.fontFamily, label: mono.fontFamily },
};

export function fontSet(typography: Style['typography']): FontSet {
  return FONT_SETS[typography];
}

/** The speaker tag keeps the pixel face whatever the typography: it is the channel's signature. */
export const SIGNATURE_FONT = pixel.fontFamily;
