import { cozyDesk, cozyDeskNight } from './cozy-desk';
import { gridPaper } from './grid-paper';
import { navalDeck } from './naval-deck';
import { reoOffice } from './reo-office';
import type { SetDefinition } from './set-definition';
import { symbols } from './symbols';

/**
 * Every set available to scene plans, by id. The director registers each new set here
 * (one import + one entry) in the same change that adds its folder.
 */
export const SETS: Readonly<Record<string, SetDefinition>> = Object.fromEntries(
  [cozyDesk, cozyDeskNight, gridPaper, navalDeck, symbols, reoOffice].map((set) => [set.id, set]),
);

export function getSet(id: string): SetDefinition {
  const set = SETS[id];
  if (!set) throw new Error(`unknown set "${id}": register it in packages/video/src/sets/registry.ts`);
  return set;
}
