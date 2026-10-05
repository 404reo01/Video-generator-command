# @mappa/shared

## Purpose
Contracts shared by every pipeline stage: Zod schemas for the JSON files exchanged between stages, their inferred types, and time/frame helpers.

## Domain Rules
- Every JSON file written to `episodes/<slug>/` has a schema here. A stage validates its input with `Schema.parse` before doing any work.
- Types are inferred from schemas (`z.infer`), never written by hand next to them.
- Time is stored in integer milliseconds in data files. Conversion to frames happens only at render time, via `msToFrame`.
- `msToFrame` floors: a visual cue must never appear before the word that triggers it is spoken.

## Entry Points
- `src/index.ts` — public API of the package; import from `@mappa/shared` only.

## Folder Structure
```
shared/
├── package.json       # workspace package, exports TS source directly (no build step)
├── README.md          # this file
└── src/
    ├── index.ts            # public exports
    ├── audio-contracts.ts  # Transcript, CutList (removals + flags), Timeline schemas
    ├── scene-plan.ts(+test) # ScenePlan: style, shots, text, illustrations, call to action, emotions
    ├── time.ts             # ms <-> frame conversion, default fps
    └── time.test.ts        # unit tests for time.ts
```

## External Dependencies
- `zod` — schema validation and type inference.

## What NOT to do
- Do not import other `@mappa/*` packages here: `shared` is the leaf of the dependency graph.
- Do not put runtime I/O (file system, network) here: schemas and pure helpers only.
- Do not store frames in data files: fps is a render-time decision.
