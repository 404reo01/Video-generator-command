# @mappa/video

## Purpose
Remotion project that films one episode as a 1080x1920 video: a list of shots, each a camera framing on a layered set with the character's emotion sticker, plus kinetic text, illustrations, captions, transitions and sound — all driven by the clean audio's timeline and the scene plan.

## Domain Rules
- Inputs per episode are copied to `public/` by `npm run sync`: clean audio, timeline, scene plan, character stickers + manifest, icons, sfx, music, `library.json`.
- Every visual is a pure function of the current time (`useNowMs()`): no `Math.random`, timers or CSS animations. Randomness uses seeded PRNGs.
- World coordinates: 1080x1920, the full frame of a wide shot. Sets draw in world coordinates; the camera picks a `View` per framing and move; each layer gets a parallax view from its `depth`.
- Shots tile the timeline; transitions (`fade`, `sweep`, `whip`) are centred on the cut and blend two shots.
- A shot may carry a `cta` (close-up or medium only): the subscribe button pops in at `atMs` and is clicked at `clickAtMs`, with a pop and a click sound.
- Captions per shot: `bubble` (placed beside the face, falls back to subtitles when it does not fit), `subtitle`, or `none`.
- Text stays inside `SAFE` (TikTok UI covers the top ~140px, bottom ~365px, right ~125px).
- Sets are written per video by the director (see `.claude/skills/mappa/references/set-authoring.md`) and registered in `sets/registry.ts`.

## Entry Points
- `npm run sync -w @mappa/video -- --episode <slug>` — copy everything into `public/`.
- `npm run check-plan -w @mappa/video -- --episode <slug>` — validate the plan (`@mappa/director` rules).
- `npm run contact-sheet -w @mappa/video -- --episode <slug>` — one still per shot + grid in `episodes/<slug>/review/`.
- `npm run render-episode -w @mappa/video -- --episode <slug> [--draft]` — `draft.mp4` (half size) or `final.mp4`.
- `npm run catalog -w @mappa/video` — regenerate `.claude/skills/mappa/catalog.md` (also done by sync).
- `npm run set-from-images -w @mappa/video -- --id <id> --description "..." [--pixel]` — turn `library/sets/<id>/` images into a set.
- `npm run studio -w @mappa/video` — live preview at http://localhost:3000 of the last synced episode (`public/current.json`).

## Folder Structure
```
video/
├── remotion.config.ts
├── scripts/                 # sync-episode, check-plan, contact-sheet, render-episode, catalog (+ build-catalog)
└── src/
    ├── index.ts / Root.tsx  # registerRoot, Episode composition
    ├── episode/             # EpisodeVideo (shots + transitions), load-episode, library context
    ├── camera/              # framings, moves, parallax views (+test)
    ├── sets/                # set contract, layer helpers, paint utils, registry
    │   ├── cozy-desk/       # home office, sunset and night variants
    │   ├── grid-paper/      # neutral notebook-grid backdrop
    │   ├── naval-deck/      # example of a set coded for a request
    │   └── symbols/         # plain backdrop for text and illustration shots
    ├── shots/               # ShotView, World, timing (+test), bubble placement (+test), PiP, sweep
    ├── character/           # emotion sticker in the world
    ├── captions/            # caption grouping (+test), bubble, subtitles
    ├── text/                # kinetic text
    ├── cta/                 # outro call to action: subscribe button clicked by a pixel cursor
    ├── illustrations/       # list, flow, compare, code, number, icons
    ├── sound/               # soundtrack, music ducking and sfx cues (+test)
    ├── theme/               # tokens, fonts per typography, style context
    ├── timing/              # useNowMs, easing envelopes
    └── ui/                  # glass Panel
```

## External Dependencies
- `remotion`, `@remotion/cli`, `@remotion/media`, `@remotion/google-fonts`, `@remotion/bundler`, `@remotion/renderer` — all pinned to the same version.
- `zod` pinned to the version Remotion expects (4.5.4).
- `@mappa/shared` (contracts); scripts: `@mappa/sprites`, `@mappa/audio`, `@mappa/director`.

## What NOT to do
- Do not upgrade one Remotion package alone: mismatched versions break rendering.
- Do not read `transcript.json`: its timings are on the source clock.
- Do not clip far set layers to openings drawn in nearer layers: parallax shows the edges.
- Do not render with high concurrency on small machines: each worker is a headless browser.
