import type { JSX } from 'react';
import { SIGNATURE_FONT } from '../theme/fonts';
import { useStyle, withAlpha } from '../theme/style-context';
import { useNowMs } from '../timing/use-now-ms';
import { Panel } from '../ui/Panel';
import { activeCaption, typedText } from './active-caption';
import type { Caption } from './group-captions';

export const BUBBLE_WIDTH = 584;
export const BUBBLE_HEIGHT = 250;

interface DialogBubbleProps {
  readonly captions: readonly Caption[];
  readonly speaker: string;
  /** Top-left corner on screen, chosen by the shot next to the character's head. */
  readonly left: number;
  readonly top: number;
  /** Side of the bubble the tail points from, towards the character. */
  readonly tail: 'left' | 'bottom';
}

/** Speech bubble next to the character: the subtitles, typed in sync with the voice. */
export function DialogBubble({ captions, speaker, left, top, tail }: DialogBubbleProps): JSX.Element | null {
  const t = useNowMs();
  const { colors, fonts } = useStyle();
  const active = activeCaption(captions, t);
  if (!active) return null;
  const { text, typing } = typedText(active.caption, t);
  const caretOn = typing || Math.floor(t / 450) % 2 === 0;
  const tailColor = withAlpha(colors.ink, 0.22);

  return (
    <Panel startMs={active.startMs} endMs={active.endMs} style={{ left, top, width: BUBBLE_WIDTH, padding: '46px 40px 38px', transformOrigin: tail === 'left' ? '0 100%' : '20% 100%' }}>
      {tail === 'left' ? (
        <div style={{ position: 'absolute', left: -28, bottom: 44, width: 28, height: 34, background: tailColor, clipPath: 'polygon(100% 0, 0 100%, 100% 70%)' }} />
      ) : (
        <div style={{ position: 'absolute', left: 70, bottom: -28, width: 34, height: 28, background: tailColor, clipPath: 'polygon(0 0, 100% 0, 10% 100%)' }} />
      )}
      <div style={{ position: 'absolute', top: -30, left: 34, background: colors.accent, color: colors.surface, fontFamily: SIGNATURE_FONT, fontWeight: 600, fontSize: 36, letterSpacing: '0.1em', padding: '4px 22px', borderRadius: 12 }}>{speaker}</div>
      <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 46, lineHeight: 1.28, minHeight: '3.84em', overflowWrap: 'anywhere' }}>
        {text}
        {caretOn ? <span style={{ display: 'inline-block', width: '0.12em', height: '0.95em', background: colors.accent2, marginLeft: '0.08em', verticalAlign: '-0.12em', borderRadius: 2 }} /> : null}
      </div>
    </Panel>
  );
}
