import type { Finding, PlanContext, Rule } from './finding';
import { bubbleVsPanel, captionsPresent, codeIsSaid, illustrationSync, textEchoesVoice } from './rules/relevance';
import { cutOnWord, emotionSpacing, hook, shotLength, shotRate, talkingShare, transitionBudget, variety, visualShare } from './rules/rhythm';
import { coverage, references, timedInsideShot } from './rules/structure';

const RULES: readonly Rule[] = [coverage, references, timedInsideShot, shotLength, shotRate, cutOnWord, variety, talkingShare, visualShare, hook, emotionSpacing, transitionBudget, illustrationSync, textEchoesVoice, codeIsSaid, captionsPresent, bubbleVsPanel];
const ORDER = { error: 0, warning: 1, info: 2 } as const;

/** Runs every rule on a plan. Findings are sorted by severity, then by time. */
export function validatePlan(context: PlanContext): Finding[] {
  return RULES.flatMap((rule) => rule(context)).sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || (a.atMs ?? 0) - (b.atMs ?? 0));
}

const clock = (ms: number): string => `${String(Math.floor(ms / 60000))}:${((ms % 60000) / 1000).toFixed(1).padStart(4, '0')}`;

/** Report printed to the console and read by Claude (and the user) before going further. */
export function formatReport(findings: readonly Finding[]): string {
  if (findings.length === 0) return 'Plan check: no findings.';
  const count = (s: Finding['severity']): number => findings.filter((f) => f.severity === s).length;
  const lines = [`Plan check: ${String(count('error'))} error(s), ${String(count('warning'))} warning(s), ${String(count('info'))} note(s)`];
  for (const f of findings) {
    const where = [f.shotId ? `shot ${f.shotId}` : null, f.atMs !== undefined ? clock(f.atMs) : null].filter(Boolean).join(' @ ');
    lines.push(`  [${f.severity.toUpperCase()}] ${f.rule}${where ? ` (${where})` : ''}: ${f.message}${f.suggestion ? ` -> ${f.suggestion}` : ''}`);
  }
  return lines.join('\n');
}
