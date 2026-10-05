import type { ScenePlan, Shot, Timeline } from '@mappa/shared';
import { describe, expect, it } from 'vitest';
import type { PlanContext } from './finding';
import { formatReport, validatePlan } from './validate-plan';

const timeline: Timeline = {
  durationMs: 9000,
  words: [
    ['Salut', 100, 500], ['je', 600, 700], ['fais', 750, 1000], ['du', 1050, 1150], ['code', 1200, 1600], ['et', 1700, 1800],
    ['du', 1850, 1950], ['cloud.', 2000, 2500], ['Abonne-toi', 6000, 6800], ['vite.', 6900, 7400],
  ].map(([text, startMs, endMs]) => ({ text: String(text), startMs: Number(startMs), endMs: Number(endMs), sourceStartMs: Number(startMs) })),
};

function shot(overrides: Partial<Shot> & Pick<Shot, 'id' | 'startMs' | 'endMs'>): Shot {
  return { set: 'grid-paper', framing: 'medium', move: 'static', transitionIn: 'cut', captions: 'subtitle', ...overrides };
}

function context(shots: Shot[], overrides: Partial<PlanContext> = {}): PlanContext {
  const plan: ScenePlan = {
    style: { pace: 'balanced', typography: 'modern', colors: { ink: '#ffffff', surface: '#000000', accent: '#ff0000', accent2: '#00ff00', muted: '#888888' } },
    character: 'reo', speaker: 'REO', corrections: {}, emotions: [{ atMs: 0, emotion: 'happy' }], music: null, sfx: true, shots,
  };
  return { plan, timeline, sets: ['grid-paper', 'cozy-desk'], emotions: ['neutral', 'happy'], icons: ['code', 'cloud'], music: [], ...overrides };
}

const good = [
  shot({ id: 'hook', startMs: 0, endMs: 2900, framing: 'close', text: { lines: [{ text: 'Code et cloud', atMs: 1200 }] } }),
  shot({ id: 'stack', startMs: 2900, endMs: 5900, framing: 'illustration', set: 'cozy-desk', illustration: { kind: 'icons', items: [{ icon: 'code', label: 'Code', atMs: 2950 }] } }),
  shot({ id: 'cta', startMs: 5900, endMs: 9000, framing: 'wide', captions: 'bubble' }),
];
const rules = (c: PlanContext): string[] => validatePlan(c).map((f) => `${f.severity}:${f.rule}`);

describe('validatePlan', () => {
  it('accepts a well-built plan without errors', () => {
    expect(validatePlan(context(good)).filter((f) => f.severity === 'error')).toEqual([]);
  });

  it('reports gaps between shots and a short ending', () => {
    const broken = [shot({ id: 'a', startMs: 0, endMs: 3000 }), shot({ id: 'b', startMs: 3500, endMs: 8000, framing: 'wide' })];
    expect(rules(context(broken)).filter((r) => r === 'error:coverage')).toHaveLength(2);
  });

  it('reports unknown sets as errors and missing stickers as warnings', () => {
    const result = rules(context([shot({ id: 'a', startMs: 0, endMs: 9000, set: 'boat' })], { emotions: ['neutral'] }));
    expect(result).toContain('error:references');
    expect(result).toContain('warning:references');
  });

  it('flags an illustration element that is never said', () => {
    const shots = [good[0], shot({ id: 'stack', startMs: 2900, endMs: 5900, framing: 'illustration', illustration: { kind: 'icons', items: [{ icon: 'code', label: 'Kubernetes', atMs: 3000 }] } }), good[2]].filter((s): s is Shot => s !== undefined);
    expect(rules(context(shots))).toContain('warning:relevance');
  });

  it('flags an element shown long after its word', () => {
    const shots = [shot({ id: 'a', startMs: 0, endMs: 4000, framing: 'illustration', illustration: { kind: 'list', items: [{ label: 'Code', atMs: 3500 }] } }), shot({ id: 'b', startMs: 4000, endMs: 9000, framing: 'wide' })];
    expect(rules(context(shots))).toContain('warning:sync');
  });

  it('reports a subscribe button clicked after its shot ends', () => {
    const cta = { kind: 'subscribe', atMs: 6000, clickAtMs: 9500, label: "S'abonner", doneLabel: 'Abonné' } as const;
    const shots = [good[0], good[1], shot({ id: 'cta', startMs: 5900, endMs: 9000, framing: 'close', cta })].filter((s): s is Shot => s !== undefined);
    expect(rules(context(shots))).toContain('error:timed-inside-shot');
  });

  it('flags a cut in the middle of a word', () => {
    const shots = [shot({ id: 'a', startMs: 0, endMs: 6400, framing: 'close' }), shot({ id: 'b', startMs: 6400, endMs: 9000, framing: 'wide' })];
    expect(rules(context(shots))).toContain('warning:cut-on-word');
  });

  it('flags two identical shots in a row and talking shots without captions', () => {
    const shots = [shot({ id: 'a', startMs: 0, endMs: 4500, captions: 'none' }), shot({ id: 'b', startMs: 4500, endMs: 9000 })];
    const result = rules(context(shots));
    expect(result).toContain('warning:variety');
    expect(result).toContain('warning:readability');
  });

  it('flags emotions changing too fast and too many showy transitions', () => {
    const shots = [
      shot({ id: 'a', startMs: 0, endMs: 3000, framing: 'close' }),
      shot({ id: 'b', startMs: 3000, endMs: 6000, framing: 'wide', transitionIn: 'sweep' }),
      shot({ id: 'c', startMs: 6000, endMs: 9000, framing: 'medium', transitionIn: 'whip' }),
    ];
    const c = context(shots);
    const result = rules({ ...c, plan: { ...c.plan, emotions: [{ atMs: 0, emotion: 'happy' }, { atMs: 500, emotion: 'neutral' }] } });
    expect(result).toContain('warning:emotion-spacing');
    expect(rules({ ...c, timeline: { ...timeline, durationMs: 9000 } })).not.toContain('warning:transition-budget');
  });

  it('flags too many cuts, too many visuals and a code window nobody talks about', () => {
    const shots = Array.from({ length: 6 }, (_, i) =>
      shot({
        id: `s${String(i)}`,
        startMs: i * 1500,
        endMs: (i + 1) * 1500,
        framing: 'illustration',
        illustration: { kind: 'code', variant: 'terminal', lines: [{ text: 'terraform apply', kind: 'command', atMs: i * 1500 + 100 }] },
      }),
    );
    const result = rules(context(shots));
    expect(result).toContain('warning:shot-rate');
    expect(result).toContain('warning:visual-share');
    expect(result).toContain('warning:relevance');
  });

  it('formats a readable report', () => {
    const report = formatReport(validatePlan(context([shot({ id: 'a', startMs: 0, endMs: 9000, set: 'boat' })])));
    expect(report).toMatch(/^Plan check: 1 error/);
    expect(report).toContain('[ERROR] references (shot a)');
  });
});
