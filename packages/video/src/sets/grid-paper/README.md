# Set: grid-paper

## Purpose
Neutral, topic-agnostic backdrop in the channel's colours: dark plum notebook grid, warm central glow, drifting pixel motes. The character stands full-body on a soft light pool.

## Domain Rules
- Layers back to front: `backdrop` (0.1), `grid` (0.45, SVG), `motes` (0.75), `floor-glow` (0.95), character.
- The grid drifts upward slowly (0.01 px/ms) so static shots still feel alive.
- Character: x 60, feet at world y 1560, 640px tall (full body visible, no foreground).

## Entry Points
- `index.ts` — `gridPaper` set definition.

## Folder Structure
```
grid-paper/
├── index.ts        # set definition: painted backdrop, motes and floor glow
└── GridLines.tsx   # SVG notebook grid layer
```

## What NOT to do
- Do not raise the grid opacity above ~0.1: it competes with text overlays.
