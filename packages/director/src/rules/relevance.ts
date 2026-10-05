import type { Finding, Rule } from '../finding';
import { findMention, tokens, wordsBetween } from '../spoken';

// An element may appear slightly before its word (anticipation) but not long after it.
const SYNC_EARLY_MS = 250;
const SYNC_LATE_MS = 800;
// Search window around a shot when looking for the word an element illustrates.
const MENTION_MARGIN_MS = 1000;
const TOP_TEXT_MAX_CHARS = 26;

/** Each list item, flow node or icon must match something said, and appear when it is said. */
export const illustrationSync: Rule = ({ plan, timeline }) =>
  plan.shots.flatMap((shot): Finding[] => {
    const ill = shot.illustration;
    const elements = ill?.kind === 'list' ? ill.items.map((i) => ({ label: i.label, atMs: i.atMs })) : ill?.kind === 'flow' ? ill.nodes : ill?.kind === 'icons' ? ill.items.map((i) => ({ label: i.label ?? i.icon, atMs: i.atMs })) : [];
    const nearby = wordsBetween(timeline.words, shot.startMs - MENTION_MARGIN_MS, shot.endMs + MENTION_MARGIN_MS);
    return elements.flatMap((el): Finding[] => {
      // Labels made only of short words ("De A à Z") cannot be matched reliably: no verdict.
      if (tokens(el.label).length === 0) return [];
      const word = findMention(el.label, nearby);
      if (!word) return [{ severity: 'warning', rule: 'relevance', shotId: shot.id, atMs: el.atMs, message: `"${el.label}" is never said around this shot`, suggestion: 'use words from the voice-over, or drop the element' }];
      const delta = el.atMs - word.startMs;
      if (delta < -SYNC_EARLY_MS || delta > SYNC_LATE_MS) {
        return [{ severity: 'warning', rule: 'sync', shotId: shot.id, atMs: el.atMs, message: `"${el.label}" appears ${String(delta)} ms ${delta < 0 ? 'before' : 'after'} "${word.text}" is said`, suggestion: `set atMs to ${String(word.startMs)}` }];
      }
      return [];
    });
  });

/** Kinetic text should echo the voice-over: at least half of its words are said during the shot. */
export const textEchoesVoice: Rule = ({ plan, timeline }) =>
  plan.shots.flatMap((shot): Finding[] => {
    if (!shot.text) return [];
    const spoken = wordsBetween(timeline.words, shot.startMs - 300, shot.endMs + 300);
    const all = shot.text.lines.flatMap((l) => tokens(l.text));
    if (all.length === 0) return [];
    const echoed = all.filter((t) => findMention(t, spoken) !== undefined).length;
    const findings: Finding[] = [];
    if (echoed / all.length < 0.5) findings.push({ severity: 'warning', rule: 'relevance', shotId: shot.id, message: 'the on-screen text says something different from the voice-over', suggestion: 'reuse the words actually said' });
    if (shot.framing !== 'text') {
      for (const line of shot.text.lines) if (line.text.length > TOP_TEXT_MAX_CHARS) findings.push({ severity: 'warning', rule: 'readability', shotId: shot.id, message: `"${line.text}" is long for a keyword over the set`, suggestion: `keep it under ${String(TOP_TEXT_MAX_CHARS)} characters` });
    }
    return findings;
  });

/** A terminal or code window only when the speaker talks about code or commands: its lines must echo the voice. */
export const codeIsSaid: Rule = ({ plan, timeline }) =>
  plan.shots.flatMap((shot): Finding[] => {
    if (shot.illustration?.kind !== 'code') return [];
    const spoken = wordsBetween(timeline.words, shot.startMs - 300, shot.endMs + 300);
    const all = shot.illustration.lines.flatMap((l) => tokens(l.text));
    const echoed = all.filter((t) => findMention(t, spoken) !== undefined).length;
    return all.length === 0 || echoed / all.length < 0.5
      ? [{ severity: 'warning', rule: 'relevance', shotId: shot.id, message: 'a code window whose content is not what is said', suggestion: 'only show code or commands when the speaker talks about them; otherwise keep the speaker on screen' }]
      : [];
  });

/** Viewers often watch muted: every shot where the character talks needs captions. */
export const captionsPresent: Rule = ({ plan }) =>
  plan.shots.flatMap((shot): Finding[] =>
    shot.captions === 'none' && shot.framing !== 'text'
      ? [{ severity: 'warning', rule: 'readability', shotId: shot.id, message: 'no captions on a talking shot: muted viewers lose the message', suggestion: 'use "subtitle" or "bubble"' }]
      : [],
  );

/** A speech bubble next to the character competes with an illustration panel in a medium shot. */
export const bubbleVsPanel: Rule = ({ plan }) =>
  plan.shots.flatMap((shot): Finding[] =>
    shot.framing === 'medium' && shot.illustration && shot.captions === 'bubble'
      ? [{ severity: 'warning', rule: 'layout', shotId: shot.id, message: 'bubble and illustration panel compete for space', suggestion: 'use "subtitle" captions in this shot' }]
      : [],
  );
