#!/usr/bin/env python3
"""入口: `python lesson.py build shukuzu` のように使う（本体は .claude/skills/whiteboard-lesson-video/scripts/lesson.py）。"""
import pathlib, runpy, sys
here = pathlib.Path(__file__).resolve().parent
for cand in (here / '.claude/skills/whiteboard-lesson-video/scripts/lesson.py',
             pathlib.Path.home() / '.claude/skills/whiteboard-lesson-video/scripts/lesson.py'):
    if cand.exists():
        sys.argv[0] = str(cand)
        runpy.run_path(str(cand), run_name='__main__')
        break
else:
    sys.exit('whiteboard-lesson-video スキルが見つかりません（.claude/skills/ を確認）')
