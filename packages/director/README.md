# @mappa/director

## Purpose
Automatic checks of a scene plan against what is said and what is available: the safety net between Claude writing a plan and the user seeing it. Pure functions, no I/O.

## Domain Rules
- Findings have a severity: `error` (broken video, must fix), `warning` (craft problem, proposed to the user), `info` (observation).
- Rules (`src/rules/`):
  - structure: shots tile the audio; sets, emotions, icons, music exist; timed elements (text, illustration, call to action) sit inside their shot.
  - rhythm: shot lengths and shots per minute by pace (shots change when the idea changes), cuts between words, variety, talking share >= 45%, visuals <= 45%, hook, emotion changes >= 1.5 s apart, at most 4 non-cut transitions per minute.
  - relevance: illustration elements are said and shown in sync (-250/+800 ms); kinetic text and code windows echo the voice; captions on talking shots; no bubble beside an illustration panel.
- Word matching compares 5-letter stems of tokens of 3+ letters, with elisions split ("l'impact" ~ "impact"). Labels made only of short words are not judged.
- The checker never edits a plan; it reports.

## Entry Points
- `src/index.ts` — `validatePlan(context)`, `formatReport(findings)`.
- CLI: `npm run check-plan -w @mappa/video -- --episode <slug>` (lives in the video package, which knows the sets).

## Folder Structure
```
director/
└── src/
    ├── index.ts                 # public exports
    ├── finding.ts               # Finding, Severity, PlanContext, Rule
    ├── spoken.ts(+test)         # tokens, words in a window, mention finding
    ├── validate-plan.ts(+test)  # runs all rules, sorts, formats the report
    └── rules/
        ├── structure.ts         # coverage, references, timed elements inside shots
        ├── rhythm.ts            # shot length, cuts on words, variety, talking share, hook, emotions, transitions
        └── relevance.ts         # sync, relevance, readability, layout
```

## External Dependencies
- `@mappa/shared` — plan and timeline types.
- `@mappa/audio` — `normalizeWord`.

## What NOT to do
- Do not make a rule fail on taste: rules check facts (time, presence, overlap); taste goes to the reviewer agent.
- Do not add I/O here: callers pass lists of available sets, emotions, icons and music.
