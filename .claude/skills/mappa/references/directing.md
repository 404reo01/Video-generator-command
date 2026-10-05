# Directing an episode: writing `scene-plan.json`

Source of truth for the format: `packages/shared/src/scene-plan.ts` (Zod).

## Style (from the ambiance)
| Ambiance words | pace | typography | Notes |
|---|---|---|---|
| calme, posé, cosy, doux, chill | `calm` | `cozy` | long shots, slow push-ins, fades |
| (default), clair, pédagogique | `balanced` | `modern` | mix of cuts and fades |
| dynamique, énergique, rapide, punchy, moderne | `dynamic` | `modern` | short shots, whips and sweeps, more text shots |
| technique, geek, code, terminal | any | `mono` | more `code` illustrations |

Colours: `ink` (text), `surface` (panels, dark), `accent` (main), `accent2` (highlights), `muted`. Derive them from the set's palette so overlays belong to the image. Keep `ink` vs `surface` contrast high (light text on dark surface).

## Take your time
Restraint makes the video. The speaker carries it; visuals are spice.
- **Change shot when the idea changes**, not at every sentence. Several sentences on one idea = one shot (a slow camera move keeps it alive).
- **Illustrate only what the voice alone cannot show** (a sequence, a comparison, a list worth seeing). If a picture would only repeat the words, keep the speaker on screen.
- **No code or terminal window unless the speaker talks about code or commands.** Never invent commands, ticket numbers, tools or figures that are not said.
- Illustrations and text shots: at most ~45% of the video, and rarely two in a row.

## Shots: the core rules
1. **Shots tile the whole audio**: first starts at 0, last ends at the timeline duration, each starts where the previous ends.
2. **Cut on sentence or clause boundaries** — between words, never inside one (the timeline printer gives exact ms).
3. **Lengths by pace**: calm 5-12 s, balanced 3.5-9 s, dynamic 2-6 s (text shots from 1.8 s). Shots per minute: calm <= 7, balanced <= 10, dynamic <= 16.
4. **Vary**: never the same framing on the same set twice in a row. Alternate talking shots and visuals.
5. **At least half of the time, the speaker talking** (wide / medium / close). Not every sentence needs an illustration.
6. **Hook**: open with a close-up or a text shot under 3.5 s that states the question or promise. The first frame is the thumbnail: put the hook text at `atMs: 0` so it is already on screen.
7. **End** on the call to action, close-up or medium. When the speaker asks to subscribe, a `cta` of kind `subscribe` can sit on that shot: `atMs` on the word, `clickAtMs` ~0.8 s later.

## Framings
| Framing | Use for | Captions |
|---|---|---|
| `wide` | establishing the set, breathing moments, scene changes | `bubble` |
| `medium` | default talking shot; may carry an `illustration` panel beside the speaker, or a keyword `text` | `bubble` alone, `subtitle` if there is an illustration |
| `close` | strong statements, emotions, the hook, the CTA; optional keyword `text` (max ~26 chars) | `subtitle` (a bubble often has no room) |
| `text` | one idea to remember, a question, a punchline; the words ARE the voice-over; set `symbols` | `none` |
| `illustration` | something that needs explaining: a process, a list, a comparison, code, a number; set `symbols` | `subtitle` |

Camera moves: `push-in` (tension, focus), `pull-out` (reveal, conclusion), `pan-left/right` (lists, transitions of thought), `drift` (calm ambience), `static` (dense illustrations).
Transitions between shots: `cut` (default, most of them), `fade` (calm topic change), `sweep` (new section), `whip` (energetic jump). Use non-cut transitions at section changes only (2-4 per minute).

## Illustrations — pertinence first
- Illustrate **literally** what is said. A metaphor only if it makes the idea clearer, never to be clever.
- Labels reuse the speaker's words; each element's `atMs` = start of the word that names it (from the timeline). The checker flags elements never said or out of sync.
- `list`: enumerations (2-6 items). `flow`: a process or sequence (2-5 steps; `vertical` reads best in 9:16). `compare`: before/after, with/without. `code`: commands, code, terminal output. `number`: one key figure. `icons`: 1-4 concepts as pictures.
- Icons: use names from `packages/video/public/library.json` (`icons`). Missing icon = a dot; prefer omitting the icon.
- Kinetic `text` lines max 40 chars (26 over a set); 1-4 lines; `emphasis` on the key line only.

## Emotions
`emotions` is a track of `{ atMs, emotion }` cues, independent of shots. Change emotion when the tone changes (question → thinking, revelation → surprised, explanation → explaining, idea → idea, CTA → happy/pointing), roughly every 3-8 s, never more than once per 1.5 s. Use names from the character manifest; unknown names fall back to the closest one.

## Stickers (character packs)
A user drops one transparent PNG per emotion in `library/stickers/` (same size and framing, `neutral` required; English or French names, numbered or not) and runs `npm run stickers -w @mappa/sprites -- --name <name> [--pixel]`. The pack lands in `packages/sprites/characters/<name>/stickers/` with a `stickers.json` (style, face box for close-ups); check `packages/sprites/out/<name>/stickers-preview.png`.
Recommended emotions: neutral, happy, laughing, thinking, surprised, explaining, pointing, confused, proud, serious, idea, calm.

## Corrections
`corrections` maps misheard words to the right spelling in on-screen text (`{ "Ryan": "Rayan" }`). Check names, brands and jargon in the transcript.
