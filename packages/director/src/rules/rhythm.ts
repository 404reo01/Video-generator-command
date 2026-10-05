import type { Style } from '@mappa/shared';
import type { Finding, Rule } from '../finding';

/** Comfortable shot lengths per pace, in ms. Text-only shots may be shorter: they are read at a glance. */
// Shots change when the idea changes, not every sentence: too many cuts tire viewers and dilute the message.
export const SHOT_LENGTH: Record<Style['pace'], { min: number; max: number }> = {
  calm: { min: 5000, max: 12000 },
  balanced: { min: 3500, max: 9000 },
  dynamic: { min: 2000, max: 6000 },
};
/** Upper bound of shots per minute of video, by pace. */
export const SHOTS_PER_MINUTE: Record<Style['pace'], number> = { calm: 7, balanced: 10, dynamic: 16 };
const TEXT_SHOT_MIN_MS = 1800;
// A cut this far inside a word chops it audibly in the viewer's perception.
const CUT_INSIDE_WORD_MS = 80;
/** Share of the video where the character is on screen talking (not hidden behind a full illustration). */
const TALKING_SHARE = { min: 0.45, max: 0.9 };
// Visuals (illustrations and text shots) should support the talk, not replace it.
const MAX_VISUAL_SHARE = 0.45;

export const shotLength: Rule = ({ plan }) => {
  const bounds = SHOT_LENGTH[plan.style.pace];
  const findings: Finding[] = [];
  for (const shot of plan.shots) {
    const length = shot.endMs - shot.startMs;
    const min = shot.framing === 'text' ? TEXT_SHOT_MIN_MS : bounds.min;
    if (length < min) findings.push({ severity: 'warning', rule: 'shot-length', shotId: shot.id, message: `${String(length)} ms is short for a "${plan.style.pace}" pace (min ${String(min)})`, suggestion: 'merge it with a neighbour or make it a text shot' });
    if (length > bounds.max) findings.push({ severity: 'warning', rule: 'shot-length', shotId: shot.id, message: `${String(length)} ms is long for a "${plan.style.pace}" pace (max ${String(bounds.max)})`, suggestion: 'split it at a sentence boundary or add a camera move' });
  }
  return findings;
};

/** Not too many cuts per minute for the pace. */
export const shotRate: Rule = ({ plan, timeline }) => {
  const perMinute = plan.shots.length / Math.max(1 / 60, timeline.durationMs / 60000);
  const max = SHOTS_PER_MINUTE[plan.style.pace];
  return perMinute > max
    ? [{ severity: 'warning', rule: 'shot-rate', message: `${perMinute.toFixed(1)} shots per minute (max ${String(max)} for "${plan.style.pace}")`, suggestion: 'merge shots that carry the same idea; change shot when the idea changes' }]
    : [];
};

/** Illustrations and overlays are spice: most of the time the speaker carries the video. */
export const visualShare: Rule = ({ plan, timeline }) => {
  const visual = plan.shots.filter((s) => s.illustration !== undefined || s.framing === 'text').reduce((sum, s) => sum + s.endMs - s.startMs, 0);
  const share = visual / Math.max(1, timeline.durationMs);
  return share > MAX_VISUAL_SHARE
    ? [{ severity: 'warning', rule: 'visual-share', message: `illustrations or text cover ${String(Math.round(share * 100))}% of the video`, suggestion: `keep them under ${String(Math.round(MAX_VISUAL_SHARE * 100))}%: illustrate only what the voice alone cannot show` }]
    : [];
};

/** Cuts should fall between words, not in the middle of one. */
export const cutOnWord: Rule = ({ plan, timeline }) =>
  plan.shots.slice(1).flatMap((shot): Finding[] => {
    const word = timeline.words.find((w) => shot.startMs > w.startMs + CUT_INSIDE_WORD_MS && shot.startMs < w.endMs - CUT_INSIDE_WORD_MS);
    return word
      ? [{ severity: 'warning', rule: 'cut-on-word', shotId: shot.id, atMs: shot.startMs, message: `the cut falls inside the word "${word.text}"`, suggestion: `move it to ${String(word.startMs - 40)} or ${String(word.endMs + 40)}` }]
      : [];
  });

/** Variety: no two consecutive shots with the same framing on the same set. */
export const variety: Rule = ({ plan }) =>
  plan.shots.slice(1).flatMap((shot, i): Finding[] => {
    const previous = plan.shots[i];
    return previous?.framing === shot.framing && previous.set === shot.set
      ? [{ severity: 'warning', rule: 'variety', shotId: shot.id, message: `same "${shot.framing}" framing on the same set as "${previous.id}"`, suggestion: 'change the framing, the set or merge the two shots' }]
      : [];
  });

/** The character should be on screen talking for a good share of the video, not hidden behind visuals. */
export const talkingShare: Rule = ({ plan, timeline }) => {
  const talking = plan.shots.filter((s) => s.framing === 'wide' || s.framing === 'medium' || s.framing === 'close').reduce((sum, s) => sum + s.endMs - s.startMs, 0);
  const share = talking / Math.max(1, timeline.durationMs);
  if (share < TALKING_SHARE.min) return [{ severity: 'warning', rule: 'talking-share', message: `the character talks on screen ${String(Math.round(share * 100))}% of the time`, suggestion: 'turn some illustration or text shots into medium shots with the illustration beside you' }];
  if (share > TALKING_SHARE.max) return [{ severity: 'info', rule: 'talking-share', message: `the character talks on screen ${String(Math.round(share * 100))}% of the time: few visuals` }];
  return [];
};

// Faster sticker swaps read as flicker rather than expression.
const MIN_EMOTION_GAP_MS = 1500;
// Beyond this, showy transitions stop marking sections and become noise.
const MAX_SHOWY_TRANSITIONS_PER_MINUTE = 4;

/** Emotion changes need room to be read. */
export const emotionSpacing: Rule = ({ plan }) => {
  const cues = [...plan.emotions].sort((a, b) => a.atMs - b.atMs);
  return cues.slice(1).flatMap((cue, i): Finding[] => {
    const previous = cues[i];
    return previous && cue.atMs - previous.atMs < MIN_EMOTION_GAP_MS
      ? [{ severity: 'warning', rule: 'emotion-spacing', atMs: cue.atMs, message: `"${previous.emotion}" -> "${cue.emotion}" only ${String(cue.atMs - previous.atMs)} ms apart`, suggestion: `keep at least ${String(MIN_EMOTION_GAP_MS)} ms between emotion changes` }]
      : [];
  });
};

/** Fades, sweeps and whips mark section changes; too many of them and nothing stands out. */
export const transitionBudget: Rule = ({ plan, timeline }) => {
  const showy = plan.shots.slice(1).filter((s) => s.transitionIn !== 'cut').length;
  const budget = Math.max(2, Math.round((timeline.durationMs / 60000) * MAX_SHOWY_TRANSITIONS_PER_MINUTE));
  return showy > budget
    ? [{ severity: 'warning', rule: 'transition-budget', message: `${String(showy)} non-cut transitions for ${String(Math.round(timeline.durationMs / 1000))} s (budget ${String(budget)})`, suggestion: 'keep sweeps/whips/fades for section changes, use cuts elsewhere' }]
    : [];
};

/** The first seconds must hook: a close-up or big text, and short. */
export const hook: Rule = ({ plan }) => {
  const first = plan.shots[0];
  if (!first) return [];
  const strong = first.framing === 'close' || first.framing === 'text';
  return strong && first.endMs - first.startMs <= 3500 ? [] : [{ severity: 'info', rule: 'hook', shotId: first.id, message: 'the opening shot is not a short close-up or text shot', suggestion: 'open on a close-up with the key question as text' }];
};
