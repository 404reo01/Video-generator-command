import type { Style } from '@mappa/shared';
import { createContext, useContext, type JSX, type ReactNode } from 'react';
import { fontSet, type FontSet } from './fonts';
import { COLORS } from './tokens';

export interface ResolvedStyle {
  readonly pace: Style['pace'];
  readonly colors: Style['colors'];
  readonly fonts: FontSet;
}

export const DEFAULT_STYLE: Style = {
  pace: 'balanced',
  typography: 'cozy',
  colors: { ink: COLORS.cream, surface: COLORS.night, accent: COLORS.orange, accent2: COLORS.honey, muted: COLORS.creamDim },
};

const StyleContext = createContext<ResolvedStyle>({ pace: DEFAULT_STYLE.pace, colors: DEFAULT_STYLE.colors, fonts: fontSet(DEFAULT_STYLE.typography) });

export function StyleProvider({ style, children }: { readonly style: Style; readonly children: ReactNode }): JSX.Element {
  return <StyleContext.Provider value={{ pace: style.pace, colors: style.colors, fonts: fontSet(style.typography) }}>{children}</StyleContext.Provider>;
}

/** Colours, fonts and pace of the current episode. */
export function useStyle(): ResolvedStyle {
  return useContext(StyleContext);
}

/** `#rrggbb` + alpha -> `rgba()`, for translucent surfaces built from the style colours. */
export function withAlpha(hex: string, alpha: number): string {
  const v = Number.parseInt(hex.slice(1), 16);
  return `rgba(${String((v >> 16) & 255)}, ${String((v >> 8) & 255)}, ${String(v & 255)}, ${String(alpha)})`;
}
