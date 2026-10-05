import { z } from 'zod';

/**
 * `scene-plan.json` — the director's cut of one episode, written by Claude from the timeline and the
 * user's `/mappa` instructions. All times are clean-audio milliseconds (same clock as `timeline.json`).
 */
const Ms = z.number().int().nonnegative();
const Slug = z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, digits and dashes only');
const Hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'expected a #rrggbb colour');

/** How the video is filmed, derived from the "ambiance" instruction. */
export const StyleSchema = z.object({
  /** Drives shot lengths, camera speed and transition durations. */
  pace: z.enum(['calm', 'balanced', 'dynamic']),
  /** Font pairing: `cozy` = pixel titles, `modern` = bold sans titles, `mono` = code-like titles. */
  typography: z.enum(['cozy', 'modern', 'mono']),
  colors: z.object({ ink: Hex, surface: Hex, accent: Hex, accent2: Hex, muted: Hex }),
});
export type Style = z.infer<typeof StyleSchema>;

export const FramingSchema = z.enum(['wide', 'medium', 'close', 'text', 'illustration']);
export type Framing = z.infer<typeof FramingSchema>;
export const CameraMoveSchema = z.enum(['static', 'push-in', 'pull-out', 'pan-left', 'pan-right', 'drift']);
export type CameraMove = z.infer<typeof CameraMoveSchema>;
export const ShotTransitionSchema = z.enum(['cut', 'fade', 'sweep', 'whip']);
export type ShotTransition = z.infer<typeof ShotTransitionSchema>;
export const CaptionModeSchema = z.enum(['bubble', 'subtitle', 'none']);
export type CaptionMode = z.infer<typeof CaptionModeSchema>;

/** Big animated words. Each line pops in at `atMs`; `emphasis` lines take the accent colour. */
export const KineticTextSchema = z.object({
  lines: z.array(z.object({ text: z.string().min(1).max(40), atMs: Ms, emphasis: z.boolean().optional() })).min(1).max(4),
});
export type KineticText = z.infer<typeof KineticTextSchema>;

const Timed = { atMs: Ms };
const Icon = Slug;

export const ListIllustrationSchema = z.object({
  kind: z.literal('list'),
  title: z.string().max(40).optional(),
  items: z.array(z.object({ ...Timed, label: z.string().min(1).max(32), icon: Icon.optional() })).min(1).max(6),
});
export const FlowIllustrationSchema = z.object({
  kind: z.literal('flow'),
  title: z.string().max(40).optional(),
  direction: z.enum(['horizontal', 'vertical']),
  nodes: z.array(z.object({ ...Timed, label: z.string().min(1).max(24), icon: Icon.optional() })).min(2).max(5),
});
const CompareSide = z.object({ label: z.string().min(1).max(24), points: z.array(z.string().min(1).max(32)).min(1).max(4) });
export const CompareIllustrationSchema = z.object({
  kind: z.literal('compare'),
  title: z.string().max(40).optional(),
  before: CompareSide,
  after: CompareSide,
  /** When the "after" side appears; the "before" side is visible from the start of the shot. */
  revealAtMs: Ms,
});
export const CodeIllustrationSchema = z.object({
  kind: z.literal('code'),
  variant: z.enum(['terminal', 'editor']),
  title: z.string().max(40).optional(),
  lines: z.array(z.object({ ...Timed, text: z.string().max(48), kind: z.enum(['command', 'output', 'code']) })).min(1).max(8),
});
export const NumberIllustrationSchema = z.object({
  kind: z.literal('number'),
  ...Timed,
  value: z.number(),
  prefix: z.string().max(4).optional(),
  suffix: z.string().max(6).optional(),
  label: z.string().min(1).max(40),
});
export const IconsIllustrationSchema = z.object({
  kind: z.literal('icons'),
  title: z.string().max(40).optional(),
  items: z.array(z.object({ ...Timed, icon: Icon, label: z.string().max(24).optional() })).min(1).max(4),
});

export const IllustrationSchema = z.discriminatedUnion('kind', [
  ListIllustrationSchema,
  FlowIllustrationSchema,
  CompareIllustrationSchema,
  CodeIllustrationSchema,
  NumberIllustrationSchema,
  IconsIllustrationSchema,
]);
export type Illustration = z.infer<typeof IllustrationSchema>;
export type IllustrationKind = Illustration['kind'];

/** A "subscribe" button that pops in at `atMs`; a cursor clicks it at `clickAtMs` and it turns into `doneLabel`. */
export const SubscribeCtaSchema = z
  .object({
    kind: z.literal('subscribe'),
    ...Timed,
    clickAtMs: Ms,
    label: z.string().min(1).max(20),
    doneLabel: z.string().min(1).max(20),
  })
  .refine((c) => c.clickAtMs > c.atMs, { message: 'the button is clicked after it appears' });

/** Call-to-action overlays for talking shots (the outro). */
export const CtaSchema = z.discriminatedUnion('kind', [SubscribeCtaSchema]);
export type Cta = z.infer<typeof CtaSchema>;

export const ShotSchema = z
  .object({
    id: Slug,
    startMs: Ms,
    endMs: Ms,
    /** Id of a set registered in packages/video/src/sets. */
    set: Slug,
    framing: FramingSchema,
    move: CameraMoveSchema,
    /** How this shot replaces the previous one. Ignored on the first shot. */
    transitionIn: ShotTransitionSchema,
    captions: CaptionModeSchema,
    text: KineticTextSchema.optional(),
    illustration: IllustrationSchema.optional(),
    cta: CtaSchema.optional(),
  })
  .refine((s) => s.endMs > s.startMs, { message: 'a shot must end after it starts' })
  .refine((s) => s.framing !== 'text' || s.text !== undefined, { message: 'a "text" shot needs `text`' })
  .refine((s) => s.framing !== 'illustration' || s.illustration !== undefined, { message: 'an "illustration" shot needs `illustration`' })
  .refine((s) => s.framing !== 'close' || s.illustration === undefined, { message: 'a close-up has no room for an illustration' })
  .refine((s) => s.cta === undefined || s.framing === 'close' || s.framing === 'medium', { message: 'a call to action goes on a close-up or medium talking shot' });
export type Shot = z.infer<typeof ShotSchema>;

export const EmotionCueSchema = z.object({ atMs: Ms, emotion: Slug });
export type EmotionCue = z.infer<typeof EmotionCueSchema>;

export const ScenePlanSchema = z
  .object({
    style: StyleSchema,
    /** Character sticker pack (packages/sprites/characters/<name>). */
    character: Slug,
    speaker: z.string().min(1).max(16),
    /** Fixes transcription mistakes in displayed text, e.g. { "Ryan": "Rayan" }. Keys match whole words. */
    corrections: z.record(z.string().min(1), z.string()),
    emotions: z.array(EmotionCueSchema),
    shots: z.array(ShotSchema).min(1),
    /** Background music from library/music, ducked under the voice; null for none. */
    music: z.object({ track: Slug, volume: z.number().min(0).max(1) }).nullable(),
    /** Automatic sound effects on transitions and appearing elements. */
    sfx: z.boolean(),
  })
  .refine((plan) => plan.shots.every((s, i) => i === 0 || s.startMs >= (plan.shots[i - 1]?.endMs ?? 0)), {
    message: 'shots must be in order and must not overlap',
  });
export type ScenePlan = z.infer<typeof ScenePlanSchema>;
