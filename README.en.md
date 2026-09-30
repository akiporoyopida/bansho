# Whiteboard → Explainer Animation & Video Kit

[日本語](README.md) | English

A folder for turning photos of a whiteboard lesson into a step-by-step math explainer animation (HTML) and a vertical video (MP4), in the same style as the sample lesson "Scale drawings and scale" (縮図の利用・縮尺). It is meant to be opened and used with Claude Code.

The lessons are written in Japanese: captions, notes, and furigana (reading aids above kanji) on every kanji shown on screen.

## Setup (once)
1. Install Python 3.9+ and ffmpeg (Mac: `brew install python ffmpeg`)
2. Run the following in this folder
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python -m playwright install chromium
   ```
3. Check that it works: `python lesson.py build shukuzu` → open `dist/shukuzu.html` in a browser
   (fonts are downloaded automatically on the first build)

Note: each time you open a new terminal, run `source .venv/bin/activate` first.

## Using it with Claude Code
1. Start `claude` in this folder
2. Give it photos of the whiteboard and ask, for example:
   - "Turn this whiteboard (image) into a video in the usual style. Use the slug hirei."
   - "I put the whiteboard photos in lessons/hirei/source. Make the animation and the video."
3. Claude works through "read & double-check the math → plan the scenes (it asks you to confirm here) → build → check the frames → export". The results go to `dist/`.

To change something, just say it, e.g. "make the dots in the intro move more slowly" or "shorten the caption in step 3".

## Running the commands yourself
| Task | Command |
|---|---|
| Create a new lesson skeleton | `python lesson.py new <slug> --title "Unit title"` |
| Build the HTML | `python lesson.py build <slug>` |
| Contact sheet of frames for review | `python lesson.py shots <slug> --beats` → `qa/<slug>/sheet.png` |
| Export the video | `python lesson.py export <slug>` → `dist/<slug>.mp4` |

## Contents
```
CLAUDE.md                 Notes Claude Code reads every session
lesson.py                 Entry point for the commands
lessons/shukuzu/          Finished sample (notes and lesson.js; the whiteboard photos are
                          copyrighted and are not included)
dist/                     Output
.claude/skills/whiteboard-lesson-video/
  SKILL.md                Step-by-step workflow (Claude Code reads it when needed)
  references/             Visual rules, how to structure a lesson, engine API
  assets/                 Engine (engine.js), HTML template, lesson.js template
  scripts/lesson.py       Build, review, and export tool
```

## Notes
- `.claude` is a hidden folder (in the Mac Finder, press ⌘ + Shift + . to show it).
- To use the kit in another folder, copy `.claude/skills/whiteboard-lesson-video` to `~/.claude/skills/` and copy `lesson.py` from the root along with it.
- Fonts: Zen Kaku Gothic New and STIX Two Text (both under the SIL Open Font License).
