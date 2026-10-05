# Developer Guide

Both human developers and AI agents must follow this guide. It applies to this TypeScript monorepo that renders video with Remotion.

---

## Chapter 1 — Readability & Documentation

**Comment only when the "why" is non-obvious.**

| Comment | Required? |
|---|---|
| Rule that doesn't emerge from code (e.g. "floor so text never appears early") | Yes |
| Intentional workaround or architectural exception | Yes |
| Magic values (thresholds, durations, frame counts, colors outside the palette) | Yes |
| Self-explanatory code | No |

```ts
// GOOD
// 300 ms: shorter pauses sound rushed once fillers are removed; longer ones read as dead air.
const MAX_PAUSE_MS = 300;
```

**Everything in the repository is in English**: identifiers, comments, docs, commit messages, test names. Conversations with Claude may be in French; the repo never is.

---

## Chapter 2 — TypeScript

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` are on. Do not relax them.
- **`any` is forbidden** (ESLint error). An exception needs an inline comment explaining why and explicit approval.
- Exported functions declare their return type.
- Use `import type` for type-only imports.
- Name by intent, not implementation: `detectFillerWords`, not `filterArray`.

## Chapter 3 — Data Contracts (Zod)

- The pipeline is a chain of stages exchanging JSON files in `episodes/<slug>/`.
- **Every such file has a Zod schema in `@mappa/shared`.** Types come from `z.infer`.
- A stage `parse`s its input before working and writes only data that passes its output schema.
- Time is integer milliseconds in data; frames exist only inside the video package.

## Chapter 4 — Packages

```
packages/
  shared/    # schemas, types, pure helpers — depends on nothing internal
  audio/     # transcription, cut detection, ffmpeg editing, retiming
  sprites/   # pixel-grid character poses -> PNG
  video/     # Remotion project
```

- Dependency direction: `audio`, `sprites`, `video` -> `shared`. Never the reverse, never sideways without a README note.
- Packages export TypeScript source directly (`"exports": "./src/index.ts"`); there is no build step.
- External services sit behind an interface (e.g. `TranscriptionProvider`) so they can be swapped.
- Side effects (file system, network, child processes) live at the edges; core logic is pure and unit-tested.

## Chapter 5 — Remotion Components

- **One component per file**, PascalCase, single responsibility.
- A component is a **pure function of the current frame and its props**. Never use `Math.random()`, `Date.now()` or timers: use Remotion's `random(seed)` and `useCurrentFrame()`.
- Every scene component has a Zod props schema; the scene plan is validated against it before render.
- Colors, fonts and spacing come from the theme tokens, never literals in components.
- Generic, reusable UI (dialog box, pixel border, HUD corners) lives in `video/src/ui/`; scene components live in `video/src/scenes/`.

## Chapter 6 — Tests

- Vitest, co-located: `foo.ts` -> `foo.test.ts` in the same folder.
- Pure logic (cut detection, retiming, grid transforms) is tested before it is wired to I/O.
- `npm run check` (typecheck + lint + tests) must pass before any commit.

## Chapter 7 — Git

- Branches: `type/short-description` (`feature`, `fix`, `ui`, `refactor`, `docs`, `test`).
- Conventional Commits, lowercase, imperative, English: `feat(audio): detect filler words`.
- Scope = package name (`shared`, `audio`, `sprites`, `video`) or `repo`.
- Never commit `.env`, API keys, or episode media.

## Chapter 8 — AI-Agent Optimization

Every package and every complex component folder **must** have a `README.md` under 100 lines:

```md
# [Name]
## Purpose
## Domain Rules
## Entry Points
## Folder Structure      # every file, one-line annotation
## External Dependencies
## What NOT to do
```

- README > comments for module-level context; comments only for line-level "why".
- Keep files short and single-purpose.
- Update the README in the same change that alters the structure it describes.
