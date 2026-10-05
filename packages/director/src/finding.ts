import type { ScenePlan, Timeline } from '@mappa/shared';

/**
 * - `error`: the video would be broken or wrong (gap in the timeline, unknown set). Must be fixed.
 * - `warning`: a craft problem (rhythm, sync, relevance, readability). Proposed to the user.
 * - `info`: an observation worth knowing; no action needed.
 */
export type Severity = 'error' | 'warning' | 'info';

export interface Finding {
  readonly severity: Severity;
  readonly rule: string;
  readonly message: string;
  readonly shotId?: string;
  readonly atMs?: number;
  readonly suggestion?: string;
}

/** Everything a rule may look at. Lists of available assets come from the video package's library. */
export interface PlanContext {
  readonly plan: ScenePlan;
  readonly timeline: Timeline;
  readonly sets: readonly string[];
  readonly emotions: readonly string[];
  readonly icons: readonly string[];
  readonly music: readonly string[];
}

export type Rule = (context: PlanContext) => Finding[];
