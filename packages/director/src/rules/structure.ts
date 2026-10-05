import type { Finding, Rule } from '../finding';

// Tolerances in ms: below this, a gap or overlap is rounding, not a mistake.
const JOIN_TOLERANCE_MS = 40;
const END_TOLERANCE_MS = 250;

/** Shots must tile the whole clean audio, end to end, with no gap or overlap. */
export const coverage: Rule = ({ plan, timeline }) => {
  const findings: Finding[] = [];
  const first = plan.shots[0];
  const last = plan.shots.at(-1);
  if (first && first.startMs > JOIN_TOLERANCE_MS) {
    findings.push({ severity: 'error', rule: 'coverage', shotId: first.id, message: `the first shot starts at ${String(first.startMs)} ms, not at 0`, suggestion: 'start it at 0' });
  }
  if (last && Math.abs(last.endMs - timeline.durationMs) > END_TOLERANCE_MS) {
    findings.push({ severity: 'error', rule: 'coverage', shotId: last.id, message: `the last shot ends at ${String(last.endMs)} ms but the audio lasts ${String(timeline.durationMs)} ms`, suggestion: `end it at ${String(timeline.durationMs)}` });
  }
  plan.shots.forEach((shot, i) => {
    const previous = plan.shots[i - 1];
    if (previous && Math.abs(shot.startMs - previous.endMs) > JOIN_TOLERANCE_MS) {
      findings.push({ severity: 'error', rule: 'coverage', shotId: shot.id, atMs: shot.startMs, message: `${shot.startMs > previous.endMs ? 'gap' : 'overlap'} of ${String(Math.abs(shot.startMs - previous.endMs))} ms after "${previous.id}"`, suggestion: `start "${shot.id}" at ${String(previous.endMs)}` });
    }
  });
  return findings;
};

/** Sets, emotions, icons and music must exist; a missing emotion or icon falls back, so it is a warning. */
export const references: Rule = ({ plan, sets, emotions, icons, music }) => {
  const findings: Finding[] = [];
  for (const shot of plan.shots) {
    if (!sets.includes(shot.set)) findings.push({ severity: 'error', rule: 'references', shotId: shot.id, message: `unknown set "${shot.set}"`, suggestion: `use one of: ${sets.join(', ')}, or create the set` });
    const ill = shot.illustration;
    const used = ill?.kind === 'list' || ill?.kind === 'flow' ? (ill.kind === 'list' ? ill.items : ill.nodes).map((x) => x.icon) : ill?.kind === 'icons' ? ill.items.map((x) => x.icon) : [];
    for (const icon of used) {
      if (icon !== undefined && !icons.includes(icon)) findings.push({ severity: 'warning', rule: 'references', shotId: shot.id, message: `icon "${icon}" is not in the library (a dot will be shown)`, suggestion: `use one of: ${icons.join(', ')}` });
    }
  }
  for (const cue of plan.emotions) {
    if (!emotions.includes(cue.emotion)) findings.push({ severity: 'warning', rule: 'references', atMs: cue.atMs, message: `the character has no "${cue.emotion}" sticker; the closest one will be used`, suggestion: `available: ${emotions.join(', ')}` });
  }
  if (plan.music && !music.includes(plan.music.track)) findings.push({ severity: 'error', rule: 'references', message: `music track "${plan.music.track}" is not in library/music/music.json` });
  return findings;
};

/** Every timed element must happen inside its own shot. */
export const timedInsideShot: Rule = ({ plan, timeline }) => {
  const findings: Finding[] = [];
  for (const shot of plan.shots) {
    const ill = shot.illustration;
    const times: number[] = [
      ...(shot.text?.lines.map((l) => l.atMs) ?? []),
      ...(ill?.kind === 'list' || ill?.kind === 'icons' ? ill.items.map((x) => x.atMs) : []),
      ...(ill?.kind === 'flow' ? ill.nodes.map((x) => x.atMs) : []),
      ...(ill?.kind === 'code' ? ill.lines.map((x) => x.atMs) : []),
      ...(ill?.kind === 'compare' ? [ill.revealAtMs] : []),
      ...(ill?.kind === 'number' ? [ill.atMs] : []),
      ...(shot.cta ? [shot.cta.atMs, shot.cta.clickAtMs] : []),
    ];
    for (const atMs of times) {
      if (atMs < shot.startMs || atMs > shot.endMs - 100) {
        findings.push({ severity: 'error', rule: 'timed-inside-shot', shotId: shot.id, atMs, message: `an element appears at ${String(atMs)} ms, outside its shot (${String(shot.startMs)}-${String(shot.endMs)})` });
      }
    }
  }
  for (const cue of plan.emotions) {
    if (cue.atMs > timeline.durationMs) findings.push({ severity: 'error', rule: 'timed-inside-shot', atMs: cue.atMs, message: 'emotion cue after the end of the video' });
  }
  return findings;
};
