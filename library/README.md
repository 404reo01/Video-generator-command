# library

## Purpose
Everything the director reuses across videos: sound effects, background music, the channel glossary, and the drop folder for new emotion stickers.

## Domain Rules
- `sfx/` is generated, never downloaded: `npm run make-sfx -w @mappa/audio` synthesises `whoosh`, `pop`, `click`, `ding` with ffmpeg. No licence questions.
- `music/` holds background tracks listed in `music/music.json` (schema: `MusicLibrarySchema` in `@mappa/shared`). A track is only used if it is listed there **with its licence and source page**.
- Only use music whose licence allows commercial use on social platforms without per-video clearance (e.g. Pixabay Content License). Platforms mute or block videos with unlicensed music.
- The director picks a track whose `moods` match the requested ambiance; the video ducks it under the voice automatically.
- `glossary.json` fixes words the transcription gets wrong (names, brands) in every video's on-screen text; a plan's own `corrections` win.

## Folder Structure
```
library/
├── README.md
├── glossary.json   # channel-wide spelling fixes for on-screen text
├── stickers/       # drop new emotion stickers here, then `npm run stickers` (PNGs are git-ignored)
├── channels/       # one profile per creator: identity, tastes, lessons learned (see its README)
├── sets/           # illustrated decors as images + generation prompts (see its README)
├── sfx/            # generated sound effects (wav)
└── music/
    ├── music.json  # track list: id, file, title, artist, source, license, moods, bpm
    └── *.mp3       # the tracks themselves
```

## What NOT to do
- Do not add a track without its licence and source in `music.json`.
- Do not commit tracks whose licence forbids redistribution; keep them local (git-ignored) and list them anyway.
