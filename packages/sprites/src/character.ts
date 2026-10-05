import { z } from 'zod';

const SymbolSchema = z.string().length(1);

export const PaletteEntrySchema = z.object({
  hex: z.string().regex(/^#[0-9a-f]{6}$/i, 'expected a #rrggbb colour'),
  name: z.string().min(1),
});

/** `characters/<name>/character.json`: dimensions and the palette shared by every pose. */
export const CharacterSchema = z
  .object({
    name: z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, digits and dashes only'),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    transparent: SymbolSchema,
    palette: z.record(SymbolSchema, PaletteEntrySchema),
    /** Face box in grid pixels, used to frame close-ups. Defaults to the top third when absent. */
    face: z.object({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative(), width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
  })
  .refine((c) => !(c.transparent in c.palette), { message: 'the transparent symbol cannot also be a palette colour' });

export type Character = z.infer<typeof CharacterSchema>;
export type PaletteEntry = z.infer<typeof PaletteEntrySchema>;

/** Symbols handed out to palette colours, darkest first. Avoids characters that look alike (0/O, 1/l/I). */
export const PALETTE_SYMBOLS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
