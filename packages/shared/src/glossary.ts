import { z } from 'zod';

/**
 * `library/glossary.json` — channel-wide spelling fixes for on-screen text (names, brands, jargon the
 * transcription gets wrong). Applied to every episode; a plan's own `corrections` win on conflicts.
 */
export const GlossarySchema = z.object({ corrections: z.record(z.string().min(1), z.string()) });
export type Glossary = z.infer<typeof GlossarySchema>;

/** Glossary corrections overlaid with the plan's: the plan has the last word for its episode. */
export function mergeCorrections(glossary: Glossary, planCorrections: Readonly<Record<string, string>>): Record<string, string> {
  return { ...glossary.corrections, ...planCorrections };
}
