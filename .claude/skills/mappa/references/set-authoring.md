# Writing a set (decor) for an episode

> First choice: an **illustrated set** from images (`library/sets/README.md`, `npm run set-from-images`). It looks better and costs far fewer tokens. Code a set by hand only when the user cannot generate images, or to add ambient motion (painted layers) on top of an image set.

A set is code, written per video when no existing set fits the requested scene. It stays in the library afterwards. Quality bar: the same as the rest of the repo — `npm run check` passes, README present, pure functions of time.

## Contract
`packages/video/src/sets/set-definition.ts`:
- `id` (kebab-case, = folder name), one-line `description` (used to find it again).
- `background`: solid colour behind everything.
- `layers`: back to front, with `'character'` placed where the speaker stands. Each layer has an `id`, a `depth` and either:
  - `image` + `pixelated` — a PNG served from `public/` (illustrated sets; see `library/sets/`).
  - `paint(ctx, t)` — canvas drawing in **world coordinates** (1080x1920, the full frame of a wide shot). The context is already transformed for the camera; never reset the transform.
  - `component` — a React component receiving `{ t, view }`; wrap SVG in `<SvgLayer view={view}>` or HTML in `<DomLayer view={view}>` (`sets/layers.tsx`).
- `character`: `{ x, bottom, height }` in world pixels — left edge, feet line, sticker height.

## Depth and parallax
- `0.05-0.2` sky, horizon, far backdrop · `0.3-0.5` distant scenery · `0.7-0.9` the room or deck around the speaker · `1` the speaker's plane · `1.05-1.2` foreground in front (desk, railing, plants).
- Layers that move less than the camera can reveal their edges: **paint backgrounds 150-300 px past the frame** on every side, and never clip a far layer to an opening (a window) drawn in a nearer layer.
- A foreground layer (> 1) can hide the speaker's legs: put its top edge where the body should be cut.

## Character placement
- Standing behind something (desk, railing, counter): `height` ~500-560, feet hidden below the foreground's top edge; the head should land around y 1250-1350 so medium and close-ups frame well.
- Full body on a floor: `height` ~600-680, feet around y 1540-1580 (just above TikTok's bottom UI).
- Keep `x` between 40 and 200: the speaker sits on the left, bubbles and panels go right/above.

## Craft
- Palette: 6-10 colours, coherent with the ambiance; reuse them in the plan's `style.colors`.
- Motion: give every set 1-3 ambient motions (waves, clouds, steam, blinking lights, drifting particles) — slow, looping, driven by `t` only.
- Randomness: seeded generators at module level, never `Math.random()`; never `Date`, timers or CSS animations.
- Detail where the camera looks: around the speaker's head and the upper half (close-ups and kinetic text sit there). Keep the area behind text reasonably calm.
- Readability: avoid high-contrast busy patterns behind the top third (keywords) and the bottom band y 1380-1520 (subtitles).
- One component per file; painters may share a module. Name by intent (`paintWaves`, `RailingLayer`).

## Steps
1. `mkdir packages/video/src/sets/<id>`; write `index.ts` exporting the `SetDefinition` and any layer files.
2. Register it in `packages/video/src/sets/registry.ts` (one import, one array entry).
3. Write `README.md` (Purpose, Domain Rules with layers and depths, Entry Points, Folder Structure, What NOT to do) — under 100 lines.
4. `npm run typecheck && npm run lint`.
5. Use it in the plan, sync, contact sheet — look at wide, medium and close shots of it; fix gaps, edges and clutter.
6. Commit with the episode: `feat(video): add <id> set`.
