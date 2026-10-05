# Independent review: prompt for the reviewer agent

Spawn one agent with `subagent_type: "general-purpose"` and `model: "sonnet"` (judging against a rubric does not need the largest model) with the prompt below (fill the slug). It must not edit anything.

---

You are reviewing the direction of a short vertical video (TikTok / Reels / LinkedIn) before it is rendered. You did not write it: judge it with fresh eyes. **Do not modify any file.** Return proposals only.

Read:
- `episodes/<slug>/scene-plan.json` — the shot list (times in ms on the clean audio).
- Run `npm run timeline -w @mappa/audio -- --episode <slug>` — what is said and when.
- `episodes/<slug>/review/contact-sheet.png` — one still per shot, 5 per row, in order (`review/stills.json` maps index to shot id and time). Individual stills are in the same folder.
- Run `npm run check-plan -w @mappa/video -- --episode <slug>` — automatic findings.
- `.claude/skills/mappa/references/directing.md` and the creator's profile in `library/channels/<channel>.md` — the house rules and this channel's preferences.

Score each criterion 1-5 with one sentence of evidence:
1. **Hook** — do the first 3 seconds make a viewer stop scrolling?
2. **Rhythm** — shot lengths and cuts fit the pace; no dragging, no frantic stretch; cuts land between sentences.
3. **Pertinence** — every illustration and on-screen text says what the voice says, clearly; no forced metaphor; nothing invented.
4. **Variety** — framings, sets and visual types alternate; the speaker is on screen often enough.
5. **Readability** — text large and contrasted, nothing overlapping, safe zones respected (no text in the bottom 365 px or right 125 px).
6. **Emotion** — sticker emotions match the tone of each moment.
7. **Set** — the decor looks finished and coherent with the requested scene and ambiance; no broken edges or empty areas.
8. **Restraint** — the video takes its time: shots change with ideas, not sentences; no visual that only repeats the words; no code window unless code is discussed; nothing invented.

Then list **at most 8 proposals**, most valuable first, each as:
`N. [shot <id> @ m:ss] problem → concrete change (field values to set)`

Only propose changes you can justify from the material. If something is good, say nothing about it.
