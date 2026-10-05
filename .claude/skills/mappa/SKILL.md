---
name: mappa
description: Turn a voice recording into an edited, animated 9:16 video. Use when the user runs /mappa or asks to make a video from an audio file, optionally with a scene, an ambiance, a rhythm and things to show.
---

# /mappa — direct a video from a voice recording

The user gives an audio file and, in free text, what they want: a **scene** (where), an **ambiance** (how it feels), a **rhythm**, things to show, an outro… You are the director: you edit the audio, reuse or write the set, cut the video into shots, pick the character's emotions and illustrations, check your work, and **propose** — the user validates at each checkpoint.

Talk to the user in French. Everything written into the repo is in English (see `.claude/developer_guide.md`).

## Read first (and only this, at the start)
1. **The creator's channel profile** `library/channels/<channel>.md` — who they are on screen and what they like. Pick the channel (see `library/channels/README.md`): named in the request → `library/channels/.active` → the only profile → ask "pour quelle chaîne ?". **No profile yet** (a new creator): copy `_template.md` to `<channel>.md` and fill it from their request and two or three quick questions (name shown in the bubble, sticker pack, default set, ambiance, music); then write the channel id to `.active`.
2. `.claude/skills/mappa/catalog.md` — every set, character emotion, illustration kind, icon and music track available. Do **not** list folders or read set READMEs to discover what exists; open a set's code only to modify it or to use it as a model for a new one.
3. `references/directing.md` — the directing rules (read once per session).

## Inputs
- **audio**: a path (drag-and-drop in the terminal gives one). Required.
- **scene**: default = the default set of the channel profile. Build or pick another set only when the user explicitly asks for a different scene.
- **ambiance / rhythm**: map to `style.pace` and `style.typography` (directing.md § Style); default from the channel profile.
- **"rapide" / "sans relecture"**: skip the independent review (step 9).
Episode slug: lowercase-dashed from the file name or topic; add `-2`, `-3` if `episodes/<slug>/` exists.

## Workflow
Run commands from the repo root. `-w` targets a workspace package.

1. **Set up** — `mkdir episodes/<slug>`, copy the audio as `episodes/<slug>/input.<ext>`.
2. **Audio** — `npm run transcribe -w @mappa/audio -- --episode <slug>` then `npm run plan-cuts …`.
   - **Checkpoint 1 (only if flags)**: list each repetition / false start and ask which to cut.
   - `npm run apply-cuts -w @mappa/audio -- --episode <slug> [--accept f1,f2]`.
3. **Read the timeline** — `npm run timeline -w @mappa/audio -- --episode <slug>`. Misheard names or jargon: add them to `library/glossary.json` (channel-wide, applied to every video) rather than to one plan.
4. **Sets** — reuse from the catalog. A new scene → **prefer an illustrated set**: give the user the prompts in `library/sets/README.md`, let them generate the images, then run `set-from-images` (a few k tokens). Code a set by hand (`references/set-authoring.md`) only if they cannot generate images. Text and illustration shots go on the `symbols` backdrop unless the profile says otherwise.
5. **Write `episodes/<slug>/scene-plan.json`** following `references/directing.md` and the channel profile (`speaker` and `character` come from its Identity). Schema: `packages/shared/src/scene-plan.ts`.
6. **Check** — `npm run sync -w @mappa/video -- --episode <slug>` then `npm run check-plan …`. Fix every error; fix warnings unless you have a reason (say it in the proposal).
7. **Look** — `npm run contact-sheet -w @mappa/video -- --episode <slug>`, read `episodes/<slug>/review/contact-sheet.png` once. Fix what is visibly wrong, re-run 6-7 only if you changed something visible.
8. **Missing feature?** If the request needs something the catalog does not have (a new illustration kind, an outro element), implement it in `packages/video` with a schema change, a test and a README update — then it is in the catalog for every future video.
9. **Independent review** (skip if "rapide") — spawn one agent with `subagent_type: "general-purpose"` and **`model: "sonnet"`**, prompt from `references/review-rubric.md`. It returns proposals; it changes nothing.
10. **Checkpoint 2 — propose**: contact sheet path, one line per shot (time, framing, what is on screen), the check report, the reviewer's proposals. Apply only what the user accepts.
11. **Draft** — `npm run render-episode -w @mappa/video -- --episode <slug> --draft --concurrency 1` → `episodes/<slug>/draft.mp4`.
    - **Checkpoint 3**: the user watches it; iterate on their feedback.
12. **Final** — only when asked: `npm run render-episode -w @mappa/video -- --episode <slug> --concurrency 1` → `episodes/<slug>/final.mp4`.
13. **Learn** — propose the lessons from the user's feedback as one-line additions to the **Learned** section of their channel profile; write them once they agree. Never write into another creator's profile.

## Characters (sticker packs)
The character is `plan.character` (see the catalog). To install a user's own stickers dropped in `stickers/`: `npm run stickers -w @mappa/sprites -- --name <character>` — it checks sizes, transparency and `neutral`, estimates the face box and writes a preview at `packages/sprites/out/<name>/stickers-preview.png` (show it to the user).

## Music
Pick a track from the catalog whose moods match the ambiance (`plan.music = { track, volume }`, volume from the channel profile). Never download music without the user's explicit agreement, and only under a licence allowing commercial use on social platforms; register it in `library/music/music.json`.

## Token economy
- Read the catalog, not folders. Read the timeline once. Read the contact sheet once per change.
- Prefer editing the plan with small targeted changes over rewriting it.
- Reuse sets and features; new ones are an investment that later videos get for free.

## Rules
- Never cut a flag the user has not accepted; never render the final video unasked; never apply reviewer proposals unasked.
- Never invent content the speaker did not say.
- New sets and features are code: same quality bar as the rest of the repo (`npm run check` passes).
- If renders get killed for memory, keep `--concurrency 1` and close Remotion Studio.
