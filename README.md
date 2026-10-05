# Mappa

**Turn a voice recording into an animated vertical video — from one command in Claude Code.**

You record yourself talking. Mappa cuts your hesitations, puts your animated character in a decor, illustrates what you say, adds captions, sound effects and lofi music, and renders a 9:16 video for TikTok, Reels or LinkedIn. Claude directs the video; you validate at each step.

```
/mappa episodes/my-video/input.m4a
Chill rhythm. Highlight my 3 key points. Outro with a subscribe button.
```

## How it works
1. **Audio** — your recording is transcribed word by word (fillers included), then "euh", "um", noises and long silences are cut. Repetitions and false starts are only *flagged*: you decide. Loudness is normalised for social platforms.
2. **Direction** — Claude reads what you said and writes a shot list: close-ups, wide and medium shots, full-screen text, illustrations (lists, flows, comparisons, code, numbers, icons), your character's emotion at each moment, transitions, captions.
3. **Checks** — automatic rules (rhythm, sync, relevance, readability, restraint), a contact sheet of every shot, and an independent AI reviewer that *proposes* fixes.
4. **Render** — a fast draft, then the final MP4, rendered locally with Remotion.

## What you need
| | |
|---|---|
| Node.js 24+ | `node -v` |
| Claude Code | with a Claude subscription or API key |
| ElevenLabs API key | free plan (~30 min of audio per month), restricted to *Speech to Text* |
| ~8 GB of RAM | rendering runs a headless browser |

## Install
```bash
git clone https://github.com/404reo01/Video-generator-command.git mappa
cd mappa
npm install                 # ffmpeg comes with it
cp .env.example .env        # paste your ElevenLabs key
npm run check               # typecheck + lint + tests
```

## Prepare before your first video

### 1. Your script — the hook matters most
The first 3 seconds decide if people keep watching. Open with a promise, a surprising statement, a pain point or a number — not with "Hi, today I'm going to talk about…". Record in a quiet room, 30 s to 3 min, any common format (m4a, mp3, wav).

### 2. Your character: emotion stickers
Generate one image per emotion (with any image generator) and drop them in `library/stickers/`:
- transparent PNG, **all the same size and framing** (full body or head to hips, centred);
- named after the emotion, in English or French, numbered or not (`01_neutral.png`, `content.png`…);
- `neutral` is required. Recommended: happy, thinking, explaining, pointing, surprised, laughing, confused, proud, serious, idea, calm, wink, sad, angry.

Then ask Claude "install my stickers as <name>", or run `npm run stickers -w @mappa/sprites -- --name <name> [--pixel]`. It checks the pack, crops it, finds your face for close-ups and writes a preview.

### 3. Your decor (optional)
The included sets work out of the box. For your own, generate two images with the prompts in [`library/sets/README.md`](library/sets/README.md) (the room, then the desk on a transparent background), drop them in `library/sets/<name>/` and ask Claude to install them. Your character is placed behind the desk automatically, and ambient motion is added on top.

### 4. Music (optional)
Add royalty-free tracks to `library/music/` and list them with their licence in `library/music/music.json` (see [`library/README.md`](library/README.md)). Tracks are never committed.

### 5. Your words
Add your name, brand and jargon to `library/glossary.json` so captions spell them right.

## Make a video
Open Claude Code in the project folder and type:
```
/mappa path/to/recording.m4a
<rhythm / ambiance> <what to highlight> <outro, scene, anything else>
```
- **The first time**, Claude creates your profile (`library/channels/<you>.md`): name shown in the speech bubble, character, default decor, tastes. After each video it suggests lessons from your feedback and keeps them — your videos get closer to your taste.
- **You validate at each checkpoint**: flagged repetitions, then the shot list with its contact sheet and the reviewer's proposals, then the draft video.
- **Output**: `episodes/<name>/draft.mp4`, then `final.mp4` when you ask for it.
- **Preview** anytime: `npm run studio -w @mappa/video` → http://localhost:3000

Start each video in a **new Claude Code conversation**: a shorter context keeps it fast and cheap. Each new decor or feature is built once and reused by every later video.

## Project map
| Folder | What it holds |
|---|---|
| `episodes/<name>/` | one folder per video (git-ignored) |
| `library/` | shared by every video: profiles, decor images, music, sfx, glossary, sticker drop folder |
| `packages/audio` | transcription, cuts, ffmpeg |
| `packages/video` | Remotion: sets, camera, shots, illustrations, captions, sound |
| `packages/director` | the automatic checks |
| `packages/sprites` | characters, sticker packs, pixel icons |
| `packages/shared` | data contracts (Zod) |
| `.claude/skills/mappa` | the `/mappa` command: workflow, directing rules, reviewer rubric |

Contribution rules: [`.claude/developer_guide.md`](.claude/developer_guide.md). Agent context: [`CLAUDE.md`](CLAUDE.md).
