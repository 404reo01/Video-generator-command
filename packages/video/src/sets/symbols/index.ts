import type { SetDefinition } from '../set-definition';
import { SymbolsLayer } from './SymbolsLayer';

/** Plain backdrop for text and illustration shots, in the episode's own colours. */
export const symbols: SetDefinition = {
  id: 'symbols',
  description: 'Plain backdrop for text and illustration shots: the episode colours with faint drifting pixel icons. Not for talking shots.',
  background: '#1d1526',
  layers: [{ id: 'symbols', depth: 0.4, component: SymbolsLayer }, 'character'],
  character: { x: 60, bottom: 1560, height: 640 },
  backdrop: true,
};
