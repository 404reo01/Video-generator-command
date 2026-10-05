import type { SetDefinition } from '../set-definition';
import { paintDeck } from './deck';
import { NAVAL } from './palette';
import { paintRailing, RAIL_TOP } from './railing';
import { paintFarSea, paintGulls, paintWaves } from './sea';
import { paintSky } from './sky';

// Standing behind the railing: about 390 px of the sticker shows above the rail (head to waist).
const CHARACTER_HEIGHT = 540;
const VISIBLE_ABOVE_RAIL = 400;

/** On the deck of a sailing boat at golden hour: sea, lighthouse island, mast and pennant, railing in front. */
export const navalDeck: SetDefinition = {
  id: 'naval-deck',
  description: 'Deck of a sailing boat at golden hour: open sea with a lighthouse, gulls, mast and pennant, railing and life ring in front.',
  background: NAVAL.navy,
  layers: [
    { id: 'sky', depth: 0.08, paint: paintSky },
    { id: 'far-sea', depth: 0.25, paint: paintFarSea },
    { id: 'gulls', depth: 0.35, paint: paintGulls },
    { id: 'waves', depth: 0.6, paint: paintWaves },
    { id: 'deck', depth: 0.9, paint: paintDeck },
    'character',
    { id: 'railing', depth: 1.1, paint: paintRailing },
  ],
  character: { x: 70, bottom: RAIL_TOP - VISIBLE_ABOVE_RAIL + CHARACTER_HEIGHT, height: CHARACTER_HEIGHT },
};
