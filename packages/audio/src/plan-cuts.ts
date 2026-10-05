import type { CutList, Flag, Removal, TimeSpan, Transcript, TranscriptWord } from '@mappa/shared';
import { isFalseStart, isFiller, isKeptEvent, normalizeWord } from './fillers';
import { complement, mergeSpans, spanLength } from './spans';

export interface CutOptions {
  /** Silences longer than this between two kept words are shortened to `targetPauseMs`. */
  readonly maxPauseMs: number;
  readonly targetPauseMs: number;
  /** Silence left where a filler was removed; a full pause there still sounds like hesitating. */
  readonly fillerPauseMs: number;
  /** Margin removed around a filler so its attack and tail go too. */
  readonly fillerPadMs: number;
  readonly leadMs: number;
  readonly tailMs: number;
}

export const DEFAULT_CUT_OPTIONS: CutOptions = {
  maxPauseMs: 700,
  targetPauseMs: 350,
  fillerPauseMs: 220,
  fillerPadMs: 20,
  leadMs: 150,
  tailMs: 400,
};

function isRemovable(word: TranscriptWord): boolean {
  return word.kind === 'event' ? !isKeptEvent(word.text) : isFiller(word.text);
}

/** Removes `excessMs` from the silent parts of a gap, longest silence first, keeping each cut centred. */
function trimSilence(silences: TimeSpan[], excessMs: number): Removal[] {
  const removals: Removal[] = [];
  let remaining = excessMs;
  for (const silence of [...silences].sort((a, b) => spanLength(b) - spanLength(a))) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, spanLength(silence));
    const startMs = Math.round(silence.startMs + (spanLength(silence) - take) / 2);
    removals.push({ startMs, endMs: startMs + take, reason: 'pause' });
    remaining -= take;
  }
  return removals;
}

function detectFlags(kept: readonly TranscriptWord[]): Flag[] {
  const flags: Flag[] = [];
  // Accents matter here: "de A à Z" must not read as a repeated "a".
  const norm = kept.map((w) => normalizeWord(w.text, { keepAccents: true }));
  const add = (from: number, to: number, reason: Flag['reason']): void => {
    const first = kept[from];
    const next = kept[to];
    if (!first || !next) return;
    const text = kept.slice(from, to).map((w) => w.text).join(' ');
    flags.push({ id: `f${String(flags.length + 1)}`, startMs: first.startMs, endMs: next.startMs, reason, text, accepted: false });
  };
  for (let i = 0; i < kept.length - 1; i++) {
    const word = kept[i];
    if (word && isFalseStart(word.text)) add(i, i + 1, 'false-start');
    else if (norm[i] !== '' && norm[i] === norm[i + 1]) add(i, i + 1, 'repetition');
    else if (i < kept.length - 3 && norm[i] === norm[i + 2] && norm[i + 1] === norm[i + 3]) add(i, i + 2, 'repetition');
  }
  return flags;
}

/**
 * Decides what to remove: fillers and noise events, over-long silences, and the dead air at both ends.
 * Repetitions and false starts are only flagged — cutting them is a meaning decision the user makes.
 */
export function planCuts(transcript: Transcript, options: CutOptions = DEFAULT_CUT_OPTIONS): CutList {
  const kept = transcript.words.filter((w) => !isRemovable(w));
  const removed = transcript.words.filter(isRemovable);
  const removals: Removal[] = [];

  kept.forEach((word, i) => {
    const prevEnd = kept[i - 1]?.endMs ?? 0;
    // Fillers between the previous kept word and this one.
    const gap: TimeSpan = { startMs: prevEnd, endMs: word.startMs };
    const fillers = removed.filter((f) => f.startMs >= gap.startMs && f.endMs <= gap.endMs);
    const fillerCuts = fillers.map((f): Removal => ({
      startMs: Math.max(gap.startMs, f.startMs - options.fillerPadMs),
      endMs: Math.min(gap.endMs, f.endMs + options.fillerPadMs),
      reason: f.kind === 'event' ? 'event' : 'filler',
      text: f.text,
    }));
    removals.push(...fillerCuts);
    if (i === 0) return;
    const silences = complement(spanLength(gap), fillerCuts.map((c) => ({ startMs: c.startMs - gap.startMs, endMs: c.endMs - gap.startMs }))).map(
      (s) => ({ startMs: s.startMs + gap.startMs, endMs: s.endMs + gap.startMs }),
    );
    const silenceMs = silences.reduce((sum, s) => sum + spanLength(s), 0);
    const allowed = fillerCuts.length > 0 ? options.fillerPauseMs : silenceMs > options.maxPauseMs ? options.targetPauseMs : silenceMs;
    if (silenceMs > allowed) removals.push(...trimSilence(silences, silenceMs - allowed));
  });

  const first = kept[0];
  const last = kept.at(-1);
  if (first && first.startMs > options.leadMs) removals.push({ startMs: 0, endMs: first.startMs - options.leadMs, reason: 'trim' });
  if (last && transcript.durationMs - last.endMs > options.tailMs) {
    removals.push({ startMs: last.endMs + options.tailMs, endMs: transcript.durationMs, reason: 'trim' });
  }
  // Fillers after the last kept word fall inside the tail trim or are cut here.
  for (const f of removed) if (last && f.startMs >= last.endMs) removals.push({ startMs: f.startMs, endMs: f.endMs, reason: f.kind === 'event' ? 'event' : 'filler', text: f.text });

  return {
    sourceDurationMs: transcript.durationMs,
    removals: removals.filter((r) => r.endMs > r.startMs).sort((a, b) => a.startMs - b.startMs),
    flags: detectFlags(kept),
  };
}

/** Spans of source audio that survive the edit: everything minus removals and accepted flags. */
export function keptSpans(cuts: CutList): TimeSpan[] {
  const cut = mergeSpans([...cuts.removals, ...cuts.flags.filter((f) => f.accepted)]);
  return complement(cuts.sourceDurationMs, cut);
}
