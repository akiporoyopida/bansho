# 板書 → 解説アニメーション・動画キット

日本語 | [English](README.en.md)

ホワイトボードの授業画像から、「縮図の利用・縮尺」と同じスタイルの解説アニメーション（HTML）と縦型動画（MP4）を作るためのフォルダです。Claude Code で開いて使います。

## はじめに（1回だけ）
1. Python 3.9 以上と ffmpeg を入れる（Mac: `brew install python ffmpeg`）
2. このフォルダで次を実行する
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python -m playwright install chromium
   ```
3. 動作確認：`python lesson.py build shukuzu` → `dist/shukuzu.html` をブラウザで開く
   （フォントは最初の build のときに自動でダウンロードされます）

※ 次からは、ターミナルを開くたびに `source .venv/bin/activate` を先に実行します。

## Claude Code での使い方
1. このフォルダで `claude` を起動する
2. 板書の画像を渡して、たとえばこう頼む
   - 「この板書（画像）を、いつものスタイルで動画にして。slug は hirei にして」
   - 「lessons/hirei/source に板書を入れました。アニメーションと動画を作って」
3. Claude が「読み取り・検算 → 構成（ここで確認があります）→ 作成 → 画面チェック → 書き出し」と進めます。できあがりは `dist/` に入ります。

直したいときは「導入の点の動きをもっとゆっくり」「ステップ3の字幕を短く」のように、そのまま伝えてください。

## 自分でコマンドを使うとき
| やること | コマンド |
|---|---|
| 新しいレッスンのひな形 | `python lesson.py new <slug> --title "単元名"` |
| HTML を作る | `python lesson.py build <slug>` |
| 確認用の画面一覧 | `python lesson.py shots <slug> --beats` → `qa/<slug>/sheet.png` |
| 動画を書き出す | `python lesson.py export <slug>` → `dist/<slug>.mp4` |

## 中身
```
CLAUDE.md                 Claude Code が毎回読むメモ
lesson.py                 コマンドの入口
lessons/shukuzu/          完成例（メモ・lesson.js。板書の画像は著作物なので公開していません）
dist/                     できあがり
.claude/skills/whiteboard-lesson-video/
  SKILL.md                作り方の手順（Claude Code が必要なときに読む）
  references/             見た目のルール、構成の考え方、エンジンの使い方
  assets/                 エンジン（engine.js）、HTMLのひな形、lesson.js のひな形
  scripts/lesson.py       ビルド・確認・書き出しの本体
```

## メモ
- `.claude` は隠しフォルダです（Mac の Finder では ⌘ + Shift + . で表示）。
- ほかのフォルダでも使いたいときは、`.claude/skills/whiteboard-lesson-video` を `~/.claude/skills/` にコピーし、ルートの `lesson.py` も一緒にコピーしてください。
- フォント：Zen Kaku Gothic New、STIX Two Text（どちらも SIL Open Font License）。
