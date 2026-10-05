# Set: symbols

## Purpose
Plain backdrop for `text` and `illustration` shots: a soft gradient in the episode's `surface`/`accent` colours with a faint staggered pattern of pixel icons drifting diagonally. It keeps the eye on the content instead of competing with it.

## Domain Rules
- `backdrop: true`: shown sharp (no blur) and without the character in the scene; the picture-in-picture shows them.
- Colours come from the plan's style (`useStyle`), so it matches every episode.
- Icons at 9% opacity, 56 px, 170 px apart; drift 0.012 px/ms. Only icons present in the library are used.
- Not meant for talking shots (`wide`, `medium`, `close`): there is no decor around the character.

## Entry Points
- `index.ts` — `symbols` set definition.

## Folder Structure
```
symbols/
├── index.ts          # set definition (backdrop)
└── SymbolsLayer.tsx  # gradient + drifting icon pattern
```

## What NOT to do
- Do not raise the icon opacity much above 0.1: text and diagrams sit on top.
