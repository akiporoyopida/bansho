# このプロジェクト
ホワイトボード（板書）の画像から、黒背景ミニマルスタイルの解説アニメーション（HTML）と縦型動画（MP4）を量産する作業場。

- レッスンを作る・直す・書き出すときは、スキル `whiteboard-lesson-video`（`.claude/skills/whiteboard-lesson-video/SKILL.md`）の手順に従う。
- 完成例は `lessons/shukuzu/`（算数 小6「縮図の利用・縮尺」）。迷ったら notes.md と lesson.js を見る。

## コマンド（ルートで実行）
```bash
python lesson.py new <slug> --title "単元名"   # ひな形
python lesson.py build <slug>                   # dist/<slug>.html
python lesson.py shots <slug> --beats           # qa/<slug>/sheet.png
python lesson.py export <slug>                  # dist/<slug>.mp4
```

## フォルダ
- `lessons/<slug>/` … `source/`（板書の画像）、`notes.md`（読み取り・検算・構成表）、`lesson.js`（中身）
- `dist/` … できあがり ／ `qa/` … 確認用の画像（git に入れない）
- `.claude/skills/whiteboard-lesson-video/` … 手順書、参照資料、エンジン（assets/engine.js）、ツール（scripts/lesson.py）

## 約束
- ユーザーへの返事、字幕、メモは日本語。画面に出る漢字にはすべてふりがな。
- 答え・数値は板書と自分の検算の両方で確かめる。合わないときは作業を止めてユーザーに聞く。
- レッスン固有のことは lesson.js に書く。engine.js は全レッスン共通なので、変えるなら互換性を保ち、変えたあと見本（shukuzu）を build と shots で確かめる。
- 仕上げる前に、必ず shots と書き出し後の mp4_sheet.png を自分の目で見る。
