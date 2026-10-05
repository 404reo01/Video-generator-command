# Set: cozy-desk

## Purpose
The channel's home office: a window on a city, a sleeping cat on the sill, the character standing behind a desk with a monitor, keyboard, books and a steaming mug. Two variants: `cozy-desk` (sunset) and `cozy-desk-night` (night, rain, cat awake).

## Domain Rules
- Painters draw in a 540x960 space; layers scale it x2 into world coordinates.
- Layers back to front: `sky` (0.15), `city` (0.35), `room` (0.85, wall + window + cat), character, `desk` (1.08).
- Background layers paint past the window (`OVERSCAN`): with parallax they move less than the window frame.
- Character: x 30, sticker bottom at world y 1732, 600px tall; head around y 1250, the desk top at y 1632 hides the legs (stickers keep headroom above the head for effects).
- Every painter is a pure function of time; randomness comes from seeded generators.

## Entry Points
- `index.ts` — `cozyDesk`, `cozyDeskNight` set definitions.
- `create-cozy-desk.ts` — builds a variant from `CozyDeskOptions`.

## Folder Structure
```
cozy-desk/
├── index.ts               # registered variants
├── create-cozy-desk.ts    # layer painters, depths and character placement
├── options.ts             # variant options (time of day, rain, cat, monitor)
├── primitives.ts          # painting space, seeded random, rounded rects, glow
├── sky.ts                 # gradient sky, sun or moon and stars, drifting clouds
├── city.ts                # two skyline layers, blinking windows
├── rain.ts                # rain streaks
├── room.ts                # wall with window cut-out, frame, sill, plant, lamp
├── cat.ts                 # cat on the sill (asleep / awake / none)
└── desk.ts                # desk, monitor screen, keyboard, books, mug, steam
```

## What NOT to do
- Do not clip background layers to the window: parallax would show the clip edges.
- Do not move the character without moving the desk top: the legs would show.
