# Channel profiles

## Purpose
One profile per creator using `/mappa` in this repository: who they are on screen and what they like. The director reads the active profile at the start of every video and appends what it learns from their feedback, so each creator's videos get closer to their taste over time — and nobody inherits someone else's identity.

## Domain Rules
- One file per channel: `<channel>.md`, built from `_template.md` (Identity, Look, Rhythm, Sound, Captions, Character, Learned).
- The active channel is chosen, in order: named in the `/mappa` request → `.active` (local, git-ignored, remembers the last one used on this machine) → the only profile if there is one → ask the user.
- A creator without a profile gets one on their first video: the director fills it from their request (display name, character, default set, ambiance, music) and their answers, then writes `.active`.
- Lessons are added under **Learned** only after the creator agrees to them.
- Channel-wide spelling fixes live in `library/glossary.json` (shared by everyone in this repository).

## Folder Structure
```
channels/
├── README.md       # this file
├── _template.md    # empty profile to copy
├── reo.md          # REO's profile
└── .active         # local: channel used last on this machine (git-ignored)
```

## What NOT to do
- Do not write another creator's lessons into the active profile.
- Do not put secrets or personal data (emails, keys) in a profile.
