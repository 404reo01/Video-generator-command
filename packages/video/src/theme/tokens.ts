/** Cozy sunset palette: the cozy-desk set and the defaults of `DEFAULT_STYLE` use it. */
export const COLORS = {
  night: '#1d1526',
  plum: '#2b1d3a',
  plum2: '#3a2649',
  line: '#553a5e',
  wine: '#7a2f4a',
  coral: '#c8553d',
  orange: '#e8743b',
  amber: '#f4a259',
  honey: '#f7c873',
  cream: '#f5e6c8',
  creamDim: '#c9b79e',
  muted: '#9a87a3',
  dusk: '#6f7fb0',
  sage: '#8fbf8a',
  wood: '#6b4226',
  woodLight: '#b5774c',
  woodMid: '#8a5a3c',
  coffee: '#4a2e22',
  frame: '#5a3a2a',
} as const;

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

/**
 * Screen bands in px of the 1080x1920 frame. TikTok covers the top ~140px, the bottom ~365px
 * and the right ~125px with its UI, so text stays inside `SAFE`.
 */
export const SAFE = { top: 160, bottom: 1540, left: 64, right: 950 } as const;

/** Where overlays sit on screen, per role. */
export const LAYOUT = {
  /** Illustration panel beside the character in medium shots, and full panel in illustration shots. */
  sidePanel: { left: 64, top: 230, width: 886 },
  fullPanel: { left: 64, top: 300, width: 886 },
  /** Classic subtitles: centred, two lines max, just above TikTok's caption area. */
  subtitle: { top: 1390, left: 90, width: 840 },
  /** Picture-in-picture bubble of the character during illustration shots. */
  pip: { left: 64, top: 1180, size: 300 },
  /** Call-to-action button of the outro: above the character's head in close-ups and medium shots. */
  cta: { top: 560 },
} as const;
