import { createContext, useContext, type JSX, type ReactNode } from 'react';
import { z } from 'zod';

/** `public/library.json`, written by `npm run sync`: shared assets available to every episode. */
export const LibrarySchema = z.object({
  icons: z.array(z.string()),
  sfx: z.array(z.string()),
  music: z.array(z.object({ id: z.string(), file: z.string() })),
});
export type Library = z.infer<typeof LibrarySchema>;

const EMPTY: Library = { icons: [], sfx: [], music: [] };
const LibraryContext = createContext<Library>(EMPTY);

export function LibraryProvider({ library, children }: { readonly library: Library; readonly children: ReactNode }): JSX.Element {
  return <LibraryContext.Provider value={library}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): Library {
  return useContext(LibraryContext);
}
