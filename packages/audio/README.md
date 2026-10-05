# @mappa/audio

## Purpose
Turns a raw voice recording into clean audio (hesitations and dead air removed, loudness normalised) and a word timeline on the clean audio's clock.

## Domain Rules
- Pipeline per episode, in `episodes/<slug>/`: `input.*` -> `source.wav` -> `transcript.json` -> `cuts.json` -> `clean.wav` + `timeline.json`.
- Transcription must be **verbatim** (fillers kept with timings): we can only cut what we can see.
- Cut automatically: fillers (`euh`, `hum`...), non-speech events except laughter, silences over 700 ms (shortened to 350 ms), dead air at both ends.
- Where a filler is removed, only 220 ms of silence remains: a full pause there still sounds like hesitating.
- Never cut automatically: repetitions and false starts. They are **flags** in `cuts.json`, cut only when `accepted: true` (or `--accept`). Removing the wrong one changes the meaning.
- Words like `bah`, `ben`, `bon`, `voilà` are not fillers: often meaningful in French.
- Every cut edge gets an 8 ms fade (no clicks); output is normalised to -14 LUFS, the level social platforms play speech at.
- `timeline.json` is the only timing the video reads. Words more than half cut are dropped from it.

## Entry Points
- `npm run transcribe -w @mappa/audio -- --episode <slug> [--language fr]` — needs `ELEVENLABS_API_KEY` in `.env`.
- `npm run plan-cuts -w @mappa/audio -- --episode <slug>` — writes `cuts.json`, prints the review report.
- `npm run apply-cuts -w @mappa/audio -- --episode <slug> [--accept f1,f2 | --accept all]`.
- `src/index.ts` — library API.

## Folder Structure
```
audio/
├── scripts/
│   ├── transcribe.ts            # input -> source.wav -> transcript.json
│   ├── plan-cuts.ts             # transcript.json -> cuts.json + report
│   └── apply-cuts.ts            # cuts.json -> clean.wav + timeline.json
└── src/
    ├── fillers.ts(+test)        # filler / false-start / kept-event rules, word normalisation
    ├── spans.ts(+test)          # time-span merge, complement, overlap
    ├── plan-cuts.ts(+test)      # decides removals and flags; keptSpans()
    ├── retime.ts(+test)         # source clock -> clean clock, builds the timeline
    ├── ffmpeg-filter.ts         # filter graph: trim + fade + concat + loudnorm
    ├── ffmpeg.ts(+test)         # runs ffmpeg-static: prepareSource, renderCleanAudio
    ├── wav.ts                   # WAV header duration
    ├── cut-report.ts            # human-readable review of a cut list
    ├── episode.ts               # episode folder paths, JSON read/write through Zod
    ├── test-fixtures.ts         # transcript builder for tests
    ├── providers/
    │   ├── transcription-provider.ts  # interface any STT service implements
    │   └── elevenlabs.ts(+test)       # ElevenLabs Scribe v2 implementation + response mapping
    └── index.ts                 # public exports
```

## External Dependencies
- `ffmpeg-static` — pinned ffmpeg binary, installed by npm (nothing to install system-wide).
- ElevenLabs Speech-to-Text API (`scribe_v2`) — free tier ~30 min/month.
- `@mappa/shared` — `Transcript`, `CutList`, `Timeline` schemas.

## What NOT to do
- Do not pass `no_verbatim: true` to the provider: fillers would vanish from the transcript but stay in the audio.
- Do not read timings from `transcript.json` in the video: they are on the source clock, use `timeline.json`.
- Do not pass the filter graph on the command line: long edits exceed the Windows limit; it goes through a script file.
- Never log or print `ELEVENLABS_API_KEY`.
