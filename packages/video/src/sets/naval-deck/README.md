# Set: naval-deck

## Purpose
On the deck of a sailing boat at golden hour: punchy navy/teal vs orange/gold palette, constant motion (swell, waves, gulls, pennant, lighthouse). An example of a set coded by hand for a requested scene.

## Domain Rules
- Layers back to front: `sky` (0.08), `far-sea` (0.25), `gulls` (0.35), `waves` (0.6), `deck` (0.9, mast, rigging, pennant, planks, crate, rope), character, `railing` (1.1, rail and life ring).
- The boat rocking is suggested by the sea bobbing (`swell(t)` in `palette.ts`), not by moving the deck: the speaker and text stay stable.
- Horizon at world y 1000; the sun sits at x 720 so sun glitter lands right of the speaker.
- Character: x 70, 540 px tall, 400 px visible above the rail top (y 1640); a solid bulwark under the rail hides the legs.
- Backgrounds paint 300 px past the frame for parallax.

## Entry Points
- `index.ts` — `navalDeck` set definition.

## Folder Structure
```
naval-deck/
├── index.ts     # layers, depths, character placement
├── palette.ts   # colours, horizon line, swell motion
├── sky.ts       # golden-hour gradient, sun, sliding clouds
├── sea.ts       # far sea + lighthouse island + glitter, wave bands, gulls
├── deck.ts      # mast, rigging, pennant, deck planks, crate, rope coil
└── railing.ts   # foreground railing and life ring
```

## What NOT to do
- Do not rock the deck layer: the speaker would slide relative to it.
- Do not brighten the sea glitter in the band y 1380-1520: subtitles sit there.
