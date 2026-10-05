import type { TimeSpan } from '@mappa/shared';

export function spanLength(span: TimeSpan): number {
  return span.endMs - span.startMs;
}

/** Sorts spans and merges the ones that overlap or touch. */
export function mergeSpans(spans: readonly TimeSpan[]): TimeSpan[] {
  const sorted = spans.filter((s) => s.endMs > s.startMs).sort((a, b) => a.startMs - b.startMs);
  const merged: TimeSpan[] = [];
  for (const span of sorted) {
    const last = merged.at(-1);
    if (last && span.startMs <= last.endMs) merged[merged.length - 1] = { startMs: last.startMs, endMs: Math.max(last.endMs, span.endMs) };
    else merged.push({ ...span });
  }
  return merged;
}

/** Parts of [0, totalMs] not covered by `removed`. */
export function complement(totalMs: number, removed: readonly TimeSpan[]): TimeSpan[] {
  const kept: TimeSpan[] = [];
  let cursor = 0;
  for (const span of mergeSpans(removed)) {
    if (span.startMs > cursor) kept.push({ startMs: cursor, endMs: Math.min(span.startMs, totalMs) });
    cursor = Math.max(cursor, span.endMs);
  }
  if (cursor < totalMs) kept.push({ startMs: cursor, endMs: totalMs });
  return kept.filter((s) => s.endMs > s.startMs);
}

/** Total length of the overlap between `span` and a set of spans. */
export function overlapMs(span: TimeSpan, others: readonly TimeSpan[]): number {
  return others.reduce((sum, o) => sum + Math.max(0, Math.min(span.endMs, o.endMs) - Math.max(span.startMs, o.startMs)), 0);
}
