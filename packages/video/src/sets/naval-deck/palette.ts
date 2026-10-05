/** Golden-hour sea: deep navy and teal against warm orange and sun gold. */
export const NAVAL = {
  navy: '#0b1d33',
  navyLight: '#16365a',
  deepTeal: '#0e4d64',
  teal: '#1f8a8a',
  foam: '#bfe7e0',
  sun: '#ffd27a',
  orange: '#ff7a3d',
  coral: '#e8573a',
  cream: '#f7efe1',
  wood: '#a8693f',
  woodLight: '#c98a55',
  woodDark: '#6b3f22',
  rope: '#d9b77e',
} as const;

/** The sea's horizon line in world pixels; the sea bobs around it to suggest the boat rocking. */
export const HORIZON_Y = 1000;

/** Vertical offset of the sea at time `t`: a slow swell, the boat's rocking seen from the deck. */
export function swell(t: number): number {
  return Math.sin(t / 1300) * 10 + Math.sin(t / 530) * 3;
}
