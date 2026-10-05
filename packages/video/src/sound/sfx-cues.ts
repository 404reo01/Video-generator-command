import type { ScenePlan } from '@mappa/shared';
import { TRANSITION_MS } from '../shots/shot-timing';

export type SfxName = 'whoosh' | 'pop' | 'click' | 'ding';

export interface SfxCue {
  readonly atMs: number;
  readonly sound: SfxName;
  readonly volume: number;
}

/** Sound effects implied by the plan: whooshes on sweeps and whips, pops on items, clicks on code and on the subscribe button, a ding on numbers. */
export function sfxCues(plan: ScenePlan): SfxCue[] {
  if (!plan.sfx) return [];
  const cues: SfxCue[] = [];
  plan.shots.forEach((shot, i) => {
    if (i > 0 && (shot.transitionIn === 'sweep' || shot.transitionIn === 'whip')) {
      const lead = shot.transitionIn === 'whip' ? 140 : TRANSITION_MS[plan.style.pace] / 2;
      cues.push({ atMs: Math.max(0, shot.startMs - lead), sound: 'whoosh', volume: 0.5 });
    }
    const ill = shot.illustration;
    if (ill?.kind === 'list') for (const item of ill.items) cues.push({ atMs: item.atMs, sound: 'pop', volume: 0.35 });
    if (ill?.kind === 'flow') for (const node of ill.nodes) cues.push({ atMs: node.atMs, sound: 'pop', volume: 0.35 });
    if (ill?.kind === 'icons') for (const item of ill.items) cues.push({ atMs: item.atMs, sound: 'pop', volume: 0.4 });
    if (ill?.kind === 'code') for (const line of ill.lines) if (line.kind !== 'output') cues.push({ atMs: line.atMs, sound: 'click', volume: 0.3 });
    if (ill?.kind === 'number') cues.push({ atMs: ill.atMs + 1100, sound: 'ding', volume: 0.4 });
    if (shot.cta) cues.push({ atMs: shot.cta.atMs, sound: 'pop', volume: 0.4 }, { atMs: shot.cta.clickAtMs, sound: 'click', volume: 0.5 });
    if (shot.framing === 'text') for (const line of shot.text?.lines ?? []) cues.push({ atMs: line.atMs, sound: 'pop', volume: 0.25 });
  });
  return cues.sort((a, b) => a.atMs - b.atMs);
}
