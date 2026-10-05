# @mappa/sprites

## Purpose
Turns an upscaled pixel-art character image into editable poses, and renders poses to PNG for the video.

## Domain Rules
- A character is `characters/<name>/character.json` (size + palette) plus `poses/<pose>.txt`.
- A pose is a text grid: one line per row, one palette symbol per pixel, `.` = transparent. Every pose of a character has the same size, so swapping poses never moves the character.
- A pose file is named after the emotion it shows (`happy`, `thinking`...): the director picks stickers by emotion. `neutral` is mandatory, it is the fallback.
- `face` in `character.json` (grid pixels) tells the camera where to frame close-ups.
- Palette symbols are sorted darkest first (`A` = outline). Edit poses by hand or with a script; `npm run check` validates every pose file.
- Source images are often AI-generated "fake" pixel art: non-integer pixel size and anti-aliased edges. `detectPixelGrid` finds the real grid from colour edges; never assume an integer scale.
- Character art stays pixel art; it is rendered with nearest-neighbour scaling only.

## Entry Points
- `npm run extract -w @mappa/sprites -- --name <name> [--source img.png] [--colors 16] [--force]` — image -> `character.json` + `poses/base.txt`.
- `npm run render -w @mappa/sprites -- --name <name> [--scale 4]` — every pose -> `out/<name>/*.png` + `sheet.png`.
- `npm run stickers -w @mappa/sprites -- --name <name> [--from ../../stickers] [--pixel]` — install an image sticker pack: checks size, transparency, `neutral`; estimates the face box; writes `characters/<name>/stickers/` + `stickers.json` and `out/<name>/stickers-preview.png`.
- `src/index.ts` — library API (`loadCharacter`, `loadPoses`, `renderPose`, ...).

## Folder Structure
```
sprites/
├── assets/source/reo.png        # original upscaled sprite (input of extract)
├── characters/reo/
│   ├── character.json           # size, transparent symbol, named palette
│   └── poses/*.txt              # one emotion per file: neutral, calm, happy, explaining, pointing, thinking, surprised, idea
├── scripts/
│   ├── extract.ts               # CLI: detect grid -> sample -> quantize -> clean -> crop -> save
│   ├── install-stickers.ts      # CLI: validate and install an image sticker pack + preview
│   └── render.ts                # CLI: poses -> PNG files + review sheet
├── src/
│   ├── image.ts                 # RGBA buffer, colour helpers (distance, hex, luminance)
│   ├── grid-detection.ts(+test) # finds non-integer pixel pitch and offset from edge profiles
│   ├── sample-grid.ts           # one median-filtered sample per grid cell
│   ├── quantize.ts(+test)       # deterministic k-means palette reduction
│   ├── cleanup.ts(+test)        # repaints stray single pixels
│   ├── indexed-sprite.ts        # palette-index sprite type, crop to content
│   ├── character.ts             # Zod schema of character.json, palette symbols
│   ├── pose.ts(+test)           # text grid <-> pose, validation with exact error positions
│   ├── render.ts                # pose -> scaled RGBA, review sheet composition
│   ├── character-store.ts(+test)# load/save characters and poses on disk
│   ├── png.ts                   # PNG read/write (pngjs)
│   ├── sticker-check.ts(+test)  # emotion names from files, transparency, face box estimate
│   ├── sticker-pack.ts          # Zod schema of stickers.json
│   └── index.ts                 # public exports
└── out/                         # rendered PNGs (git-ignored)
```

## External Dependencies
- `pngjs` — PNG decoding/encoding.
- `zod` — `character.json` validation.

## What NOT to do
- Do not resize rendered sprites with smoothing; scale by integer factors only.
- Do not re-run `extract --force` on an existing character: it overwrites the palette names that poses rely on.
- Do not add a pose with a different grid size; pad the character instead and update every pose.
