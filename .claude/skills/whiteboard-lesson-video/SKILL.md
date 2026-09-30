---
name: whiteboard-lesson-video
description: ホワイトボード・黒板の授業画像（問題と先生の解き方）から、黒背景ミニマルスタイルの算数・数学の解説アニメーション（再生ボタン付きHTML）と縦型動画（MP4, 1080×1350）を作る。板書・ホワイトボード・黒板・授業プリントの画像を渡されて「動画にして」「アニメーションにして」「いつものスタイルで」と頼まれたとき、lessons/ のレッスンを新しく作る・直す・書き出すとき、字幕・ふりがな・図の動きを直すときは、必ずこのスキルを使うこと。Use this for turning whiteboard/blackboard lesson photos into step-by-step math explainer animations and MP4 videos in this repository's house style.
---

# 板書 → 解説アニメーション・動画

板書（ホワイトボード）の画像1〜数枚から、いつも同じスタイルの解説アニメーションと動画を作る手順。
完成例は `lessons/shukuzu/`（算数 小6「縮図の利用・縮尺」。板書2枚 → 約2分20秒）。

## できあがるもの
- `dist/<slug>.html` … 1ファイルで動く再生ページ（再生・一時停止、前後のステップ、速さ、「ステップで止める」）。
- `dist/<slug>.mp4` … 1080×1350・30fps の縦型動画（音声なし）。
- 画面：上に字間の広いタイトルと色の凡例、中央に図、下に2行の字幕、いちばん下に数式。黒背景・細い白線・意味のある2色。

## 準備（初回だけ、プロジェクトのルートで）
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium
# ffmpeg も必要（Mac: brew install ffmpeg）。フォントは最初の build で自動ダウンロード。
```

## 作業の流れ

### 1. 受け取る
- 画像を `lessons/<slug>/source/` に置く（チャットで渡された画像もここへコピー）。slug は半角英小文字とハイフン（例 `hirei-graph`）。
- `python lesson.py new <slug> --title "単元名"` でひな形を作る。lesson.js には動く見本、notes.md にはメモの型が入る。

### 2. 読み取って検算する（notes.md の 1〜3）
- 問題文、数値と単位、先生の解き方の順番、答え、板書の目じるし（赤・青の色、丸でかこむ、0を消す斜線、答えの下線「//」）を、板書のとおりに書き出す。
- 自分でも計算しなおす。**板書と合わないとき・読めない所があるときは、作業を止めてユーザーに確認する。** まちがいを動画にすると、子どもがそのまま覚えてしまうため。

### 3. 構成を決める（notes.md の 4〜6）
- 導入（単元の考え方を絵で）→ 問題ごとに1シーン → まとめ。全体 2〜3 分。
- 1ステップ＝1つの考え。字幕・図の動き・下の数式を表にする。考え方は `references/lesson-design.md`。
- 意味のある色を2色までで決める（見本：赤＝縮図の長さ、青＝実際の長さ）。凡例にも出す。
- 表ができたら、ユーザーに短く見せて確認してから実装する（「おまかせ」と言われていればそのまま進める）。

### 4. lesson.js を書く
- `references/engine-api.md` の関数を使う。似た場面は見本 `lessons/shukuzu/lesson.js` からまねる（約分、単位の変換、地図と縮尺、ものさし・分度器・三角定規での作図、頂点の対応、答えの下線など。対応表は engine-api.md の 8 章）。
- 画面に出る漢字にはすべてふりがな：`{漢字|かんじ}`。熟語はまとめて `{直角三角形|ちょっかくさんかくけい}`。図の記号は `$A′$`。
- 見た目と動きは `references/style-guide.md` に合わせる。
- engine.js はレッスンのために書きかえない。全レッスンで使える機能として足すときだけ変え、変えたら見本が変わっていないか確かめる（`python lesson.py build shukuzu && python lesson.py shots shukuzu`）。

### 5. ビルドとチェック
```bash
python lesson.py build <slug>
```
- 「ふりがなのない漢字」「どのフォントにもない文字」の警告を0にしてから次へ。

### 6. 画面を見て直す
```bash
python lesson.py shots <slug> --beats            # 各ステップの最後の画面 → qa/<slug>/sheet.png
python lesson.py shots <slug> --times 3.2,15.8   # 動きの途中を見たいとき
```
- 一覧画像を実際に開いて見て、`references/lesson-design.md` の確認リストでチェックする。気になる画面は `qa/<slug>/` の1枚ずつの画像で拡大して見る。
- 直したら 5〜6 をくりかえす。

### 7. 書き出して最終確認
```bash
python lesson.py export <slug>                   # dist/<slug>.mp4 と qa/<slug>/mp4_sheet.png
python lesson.py export <slug> --from 20 --to 35 # 一部だけ（動きの確認に）
```
- `mp4_sheet.png`（動画そのものから取り出した画面）を見て、shots と同じになっているか確かめる。

### 8. 渡す
- `dist/<slug>.html` と `dist/<slug>.mp4` の場所、全体の長さ、シーンごとの内容（1行ずつ）、板書から変えた点があればそれを短く伝える。

## 大事なルール
- **答えと数値は板書どおり。** 測って求める値には「約」をつける（≈ はフォントにないので使わない）。
- **1ステップで目立たせる変化は1つ。** ほかは暗く・小さくして、新しく出たものに目がいくようにする。
- **動く点は、表しているものの数まで。** 対応を見せるときは1つずつ動かし、行き先に名前（A→A′）を付け、下の数式にも対応を並べる。点をたくさん流し続けると、どれがどれかわからなくなる（見本で実際に指摘されて直した点）。
- **ステップの最後の画面は、止めたままでも意味がわかる絵にする。** 先生は「ステップで止める」で止めて、子どもに問いかけながら使う。
- **色の意味はレッスンの最後まで同じ。**
- 字幕は2行まで（1行22字くらい）。言葉は板書・教科書の言葉にそろえる。

## 参照ファイル
| ファイル | 読むとき |
|---|---|
| `references/engine-api.md` | lesson.js を書く・直すとき（座標、シーンの書き方、関数、数式トークン、見本の場所） |
| `references/style-guide.md` | 見た目・動きを決めるとき |
| `references/lesson-design.md` | 構成を考えるとき、確認リスト、これまでの失敗と直し方 |
| `lessons/shukuzu/notes.md` と `lesson.js` | 完成例（読み取り → 構成表 → コードの対応） |

## コマンド早見表
| やること | コマンド |
|---|---|
| ひな形を作る | `python lesson.py new <slug> --title "単元名"` |
| ビルド | `python lesson.py build <slug>` |
| 確認用の画面 | `python lesson.py shots <slug> --beats` |
| 動画の書き出し | `python lesson.py export <slug>` |

`python lesson.py` はプロジェクトのルートにある入口。本体は `scripts/lesson.py`（スキルを別の場所に置いたときは `python <スキルのフォルダ>/scripts/lesson.py …` でも動く）。
