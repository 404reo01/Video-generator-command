import type { CutList } from '@mappa/shared';
import { keptSpans } from './plan-cuts';
import { spanLength } from './spans';

const clock = (ms: number): string => {
  const s = ms / 1000;
  return `${String(Math.floor(s / 60))}:${(s % 60).toFixed(1).padStart(4, '0')}`;
};

/** Human-readable summary of a cut list, printed for review before rendering. */
export function formatCutReport(cuts: CutList): string {
  const keptMs = keptSpans(cuts).reduce((sum, s) => sum + spanLength(s), 0);
  const byReason = (reason: string): number => cuts.removals.filter((r) => r.reason === reason).reduce((sum, r) => sum + spanLength(r), 0);
  const fillers = cuts.removals.filter((r) => r.reason === 'filler' || r.reason === 'event');
  const lines = [
    `Duration: ${clock(cuts.sourceDurationMs)} -> ${clock(keptMs)} (-${((1 - keptMs / Math.max(1, cuts.sourceDurationMs)) * 100).toFixed(0)}%)`,
    `Fillers and noises removed: ${String(fillers.length)} (${(byReason('filler') / 1000 + byReason('event') / 1000).toFixed(1)} s)`,
    ...fillers.map((r) => `  ${clock(r.startMs)}  ${r.text ?? ''}`),
    `Pauses shortened: ${(byReason('pause') / 1000).toFixed(1)} s, start/end trimmed: ${(byReason('trim') / 1000).toFixed(1)} s`,
    `Flags to review (not cut unless accepted): ${String(cuts.flags.length)}`,
    ...cuts.flags.map((f) => `  [${f.id}] ${clock(f.startMs)}  ${f.reason}: "${f.text}"${f.accepted ? '  (accepted)' : ''}`),
  ];
  return lines.join('\n');
}
