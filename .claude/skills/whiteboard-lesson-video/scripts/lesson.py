#!/usr/bin/env python3
"""ホワイトボードの授業 → 解説アニメーション（HTML）と動画（MP4）を作るツール。

プロジェクトのルート（lessons/ があるフォルダ）で実行する:
  python lesson.py new <slug> --title "単元名"      lessons/<slug>/ をひな形から作る
  python lesson.py build <slug>                     dist/<slug>.html を作る（フォント埋め込み＋チェック）
  python lesson.py shots <slug> --beats             各ステップの最後の画面を qa/<slug>/ に出力（一覧画像つき）
  python lesson.py shots <slug> --times 3,12.5       指定した時刻（秒）の画面を出力
  python lesson.py export <slug>                    dist/<slug>.mp4 を書き出す（1080x1350, 30fps）
  python lesson.py export <slug> --from 0 --to 15   一部だけ書き出す（確認用）
  python lesson.py fonts                            フォントをダウンロード（build で自動実行される）

必要なもの: Python 3.9+, pip install -r requirements.txt, python -m playwright install chromium, ffmpeg
"""
import argparse, asyncio, base64, html as htmllib, io, pathlib, re, shutil, subprocess, sys, time, urllib.request

SKILL = pathlib.Path(__file__).resolve().parent.parent
ASSETS = SKILL / 'assets'
FONT_DIR = ASSETS / 'fonts'
ROOT = pathlib.Path.cwd()
W, H = 1080, 1350

FONT_SRC = {   # Google Fonts リポジトリ（OFL ライセンス）
    'ZenKakuGothicNew-Light.ttf': 'ofl/zenkakugothicnew/ZenKakuGothicNew-Light.ttf',
    'ZenKakuGothicNew-Regular.ttf': 'ofl/zenkakugothicnew/ZenKakuGothicNew-Regular.ttf',
    'ZenKakuGothicNew-Medium.ttf': 'ofl/zenkakugothicnew/ZenKakuGothicNew-Medium.ttf',
    'STIXTwoText[wght].ttf': 'ofl/stixtwotext/STIXTwoText%5Bwght%5D.ttf',
    'STIXTwoText-Italic[wght].ttf': 'ofl/stixtwotext/STIXTwoText-Italic%5Bwght%5D.ttf',
}
KANJI = re.compile(r'[\u3400-\u4DBF\u4E00-\u9FFF\u3005\u3007]')
RUBY = re.compile(r'\{[^|{}]+\|[^{}]+\}')


def die(msg):
    print('エラー: ' + msg, file=sys.stderr)
    sys.exit(1)


def lesson_paths(slug):
    d = ROOT / 'lessons' / slug
    if not (d / 'lesson.js').exists():
        die(f'lessons/{slug}/lesson.js がありません（先に: python lesson.py new {slug}）')
    return d, ROOT / 'dist' / f'{slug}.html'


# ---------------------------------------------------------------- fonts
def cmd_fonts(_a=None):
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    for name, path in FONT_SRC.items():
        dst = FONT_DIR / name
        if dst.exists() and dst.stat().st_size > 10000:
            continue
        url = 'https://raw.githubusercontent.com/google/fonts/main/' + path
        print(f'  フォントを取得: {name}')
        with urllib.request.urlopen(url, timeout=60) as r, open(dst, 'wb') as f:
            shutil.copyfileobj(r, f)
    return True


def subset_b64(path, text, instance=None):
    from fontTools import subset
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    f = TTFont(path)
    if instance:
        f = instancer.instantiateVariableFont(f, instance)
    cmap = set(f.getBestCmap())
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    s = subset.Subsetter(options=opts)
    s.populate(text=text)
    s.subset(f)
    buf = io.BytesIO()
    f.flavor = 'woff2'
    f.save(buf)
    return base64.b64encode(buf.getvalue()).decode(), cmap, len(buf.getvalue())


# ---------------------------------------------------------------- checks
def strip_comments(js):
    js = re.sub(r'/\*.*?\*/', lambda m: '\n' * m.group(0).count('\n'), js, flags=re.S)
    return re.sub(r'(^|[^:\\])//.*$', r'\1', js, flags=re.M)


def kanji_without_ruby(js):
    """ふりがな（{漢字|かんじ}）の付いていない漢字を行ごとに返す。コメントは対象外。"""
    out = []
    for i, line in enumerate(strip_comments(js).split('\n'), 1):
        ks = KANJI.findall(RUBY.sub('', line))
        if ks:
            out.append((i, ''.join(dict.fromkeys(ks)), line.strip()[:70]))
    return out


# ---------------------------------------------------------------- build
def cmd_build(a):
    d, out = lesson_paths(a.slug)
    lesson_js = (d / 'lesson.js').read_text('utf-8')
    engine = (ASSETS / 'engine.js').read_text('utf-8')
    template = (ASSETS / 'template.html').read_text('utf-8')
    m = re.search(r'^//\s*@title\s+(.+)$', lesson_js, re.M)
    title = htmllib.escape(m.group(1).strip() if m else a.slug)
    script = ("(() => {\n'use strict';\n" + engine + f"\n/* ================= lesson: {a.slug} ================= */\n"
              + lesson_js + "\n})();")
    page = template.replace('<!--TITLE-->', title).replace('/*SCRIPT*/', script)

    cmd_fonts()
    used = set(page) | {chr(c) for c in range(0x20, 0x7f)} | set('　、。「」・…①②③④⑤⑥→←×÷＝：°（）′')
    text = ''.join(sorted(ch for ch in used if ch >= ' '))
    faces, cmaps = [], []
    for wt, fn in [(300, 'ZenKakuGothicNew-Light.ttf'), (400, 'ZenKakuGothicNew-Regular.ttf'), (500, 'ZenKakuGothicNew-Medium.ttf')]:
        b, cm, _ = subset_b64(FONT_DIR / fn, text)
        cmaps.append(cm)
        faces.append(f'@font-face{{font-family:"ZKG";font-weight:{wt};font-style:normal;font-display:block;src:url(data:font/woff2;base64,{b}) format("woff2");}}')
    b, cm, _ = subset_b64(FONT_DIR / 'STIXTwoText[wght].ttf', text, {'wght': 400})
    cmaps.append(cm)
    faces.append(f'@font-face{{font-family:"STIXr";font-weight:400;font-style:normal;font-display:block;src:url(data:font/woff2;base64,{b}) format("woff2");}}')
    b, cm, _ = subset_b64(FONT_DIR / 'STIXTwoText-Italic[wght].ttf', text, {'wght': 400})
    faces.append(f'@font-face{{font-family:"STIXi";font-weight:400;font-style:italic;font-display:block;src:url(data:font/woff2;base64,{b}) format("woff2");}}')
    page = page.replace('/*FONTS*/', '\n'.join(faces))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding='utf-8')
    print(f'✓ {out.relative_to(ROOT)}  ({len(page) // 1024} KB)')

    # --- checks (warnings) ---
    warn = 0
    for line, ks, src in kanji_without_ruby(lesson_js):
        print(f'  ⚠ ふりがなのない漢字  lesson.js {line}行目「{ks}」: {src}')
        warn += 1
    visible = set(strip_comments(lesson_js)) | set(strip_comments(engine))
    missing = sorted(ch for ch in visible if ord(ch) > 0x7f and not ch.isspace()
                     and not any(ord(ch) in c for c in cmaps + [cm]))
    if missing:
        print(f'  ⚠ どのフォントにもない文字: {" ".join(missing)}（例: ≈ は「約」で書く）')
        warn += 1
    if warn and a.strict:
        die('警告があります（--strict）')
    if not warn:
        print('  ふりがな・文字チェック: OK')
    return out


# ---------------------------------------------------------------- browser helpers
async def open_lesson(p, html_path):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    await pg.goto(html_path.resolve().as_uri() + '?export=1')
    await pg.wait_for_function('window.__lesson && window.__lesson.ready', timeout=30000)
    info = await pg.evaluate('({ total: __lesson.total, pauses: __lesson.pauses, nav: __lesson.nav, scenes: __lesson.scenes })')
    return b, pg, errs, info


def beat_labels(info):
    labels, k = [], 0
    for si, s in enumerate(info['scenes']):
        for bi in range(s['beats']):
            labels.append(f'S{si}-{bi + 1}')
            k += 1
    return labels


def contact_sheet(items, out, cols=5, tw=270):
    from PIL import Image, ImageDraw
    th = int(tw * H / W)
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 30) + 8), (60, 60, 60))
    dr = ImageDraw.Draw(sheet)
    for i, (img, label) in enumerate(items):
        x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 30)
        sheet.paste(img.convert('RGB').resize((tw, th)), (x, y))
        dr.text((x + 2, y + th + 6), label, fill=(235, 235, 235))
    sheet.save(out)


# ---------------------------------------------------------------- shots
def cmd_shots(a):
    from PIL import Image
    d, html_path = lesson_paths(a.slug)
    if not html_path.exists() or a.build:
        cmd_build(argparse.Namespace(slug=a.slug, strict=False))
    qa = ROOT / 'qa' / a.slug
    qa.mkdir(parents=True, exist_ok=True)

    async def run():
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            b, pg, errs, info = await open_lesson(p, html_path)
            if a.times:
                times = [float(x) for x in a.times.split(',') if x.strip()]
                labels = [f'{t:.1f}s' for t in times]
            else:  # --beats (default): the end of every step = where step mode pauses
                times = info['pauses']
                labels = [f'{l} {t:.1f}s' for l, t in zip(beat_labels(info), times)]
            items = []
            for t, label in zip(times, labels):
                data = await pg.evaluate('t => { __lesson.render(t); return document.getElementById("cv").toDataURL("image/png"); }', t)
                img = Image.open(io.BytesIO(base64.b64decode(data.split(',', 1)[1])))
                name = qa / f'{t:07.2f}.png'
                img.save(name)
                items.append((img, label))
            contact_sheet(items, qa / 'sheet.png', cols=a.cols)
            await b.close()
            print(f'✓ {len(items)}枚 → {(qa / "sheet.png").relative_to(ROOT)}（1枚ずつ: {qa.relative_to(ROOT)}/）  全体 {info["total"]:.1f}秒')
            if errs:
                print('  ⚠ ブラウザのエラー:\n   ' + '\n   '.join(errs[:10]))
    asyncio.run(run())


# ---------------------------------------------------------------- export
def cmd_export(a):
    from PIL import Image
    if not shutil.which('ffmpeg'):
        die('ffmpeg が見つかりません（Mac: brew install ffmpeg）')
    d, html_path = lesson_paths(a.slug)
    if not html_path.exists() or a.build:
        cmd_build(argparse.Namespace(slug=a.slug, strict=False))
    out = pathlib.Path(a.out) if a.out else ROOT / 'dist' / f'{a.slug}.mp4'
    out.parent.mkdir(parents=True, exist_ok=True)

    async def run():
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            b, pg, errs, info = await open_lesson(p, html_path)
            total = info['total']
            t0 = max(0.0, a.t_from or 0.0)
            t1 = min(total, a.t_to if a.t_to is not None else total)
            hold = a.hold if t1 >= total - 1e-6 else 0.0
            n = int(round((t1 - t0 + hold) * a.fps))
            ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(a.fps), '-c:v', 'mjpeg', '-i', '-',
                                   '-c:v', 'libx264', '-preset', 'medium', '-crf', str(a.crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out)],
                                  stdin=subprocess.PIPE)
            start = time.time()
            for i in range(0, n, 30):
                ts = [min(t0 + k / a.fps, t1) for k in range(i, min(n, i + 30))]
                urls = await pg.evaluate('ts => ts.map(t => { __lesson.render(t); return document.getElementById("cv").toDataURL("image/jpeg", 0.95); })', ts)
                for u in urls:
                    ff.stdin.write(base64.b64decode(u.split(',', 1)[1]))
                if i % 900 == 0:
                    print(f'  {i}/{n} フレーム  {time.time() - start:.0f}秒', flush=True)
            ff.stdin.close()
            ff.wait()
            await b.close()
            if ff.returncode != 0:
                die('ffmpeg が失敗しました')
            print(f'✓ {out}  {n}フレーム（{(t1 - t0 + hold):.1f}秒）  {out.stat().st_size / 1e6:.1f} MB  {time.time() - start:.0f}秒')
            if errs:
                print('  ⚠ ブラウザのエラー:\n   ' + '\n   '.join(errs[:10]))
            if a.no_check:
                return
            # 書き出した動画そのものから各ステップの最後の画面を取り出して一覧にする
            qa = ROOT / 'qa' / a.slug
            qa.mkdir(parents=True, exist_ok=True)
            items = []
            for label, t in zip(beat_labels(info), info['pauses']):
                if not (t0 <= t <= t1):
                    continue
                png = qa / f'mp4_{t:07.2f}.png'
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t - t0 - 0.05):.3f}', '-i', str(out), '-frames:v', '1', str(png)], check=False)
                if png.exists():
                    items.append((Image.open(png), f'{label} {t:.1f}s'))
            if items:
                contact_sheet(items, qa / 'mp4_sheet.png', cols=5)
                print(f'  動画から取り出した確認用の一覧: {(qa / "mp4_sheet.png").relative_to(ROOT)}')
    asyncio.run(run())


# ---------------------------------------------------------------- new
def cmd_new(a):
    if not re.fullmatch(r'[a-z0-9][a-z0-9_-]*', a.slug):
        die('slug は半角英小文字・数字・ハイフンで（例: hirei-graph）')
    d = ROOT / 'lessons' / a.slug
    if (d / 'lesson.js').exists():
        die(f'lessons/{a.slug}/ はもうあります')
    (d / 'source').mkdir(parents=True, exist_ok=True)
    title = a.title or a.slug
    js = (ASSETS / 'lesson-skeleton.js').read_text('utf-8').replace('@title 長方形のまわりの長さ（見本）', '@title ' + title)
    (d / 'lesson.js').write_text(js, encoding='utf-8')
    notes = (ASSETS / 'notes-template.md').read_text('utf-8').replace('{{TITLE}}', title).replace('{{SLUG}}', a.slug)
    (d / 'notes.md').write_text(notes, encoding='utf-8')
    print(f'✓ lessons/{a.slug}/ を作りました')
    print(f'  1) 板書の画像を lessons/{a.slug}/source/ に置く')
    print(f'  2) notes.md に読み取りと構成を書く → 3) lesson.js を書く（今は動作見本が入っています）')
    print(f'  4) python lesson.py build {a.slug} → shots {a.slug} → export {a.slug}')


def main():
    ap = argparse.ArgumentParser(description='ホワイトボードの授業 → 解説アニメーション・動画')
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('new', help='レッスンのひな形を作る')
    p.add_argument('slug')
    p.add_argument('--title', default='')
    p.set_defaults(fn=cmd_new)
    p = sub.add_parser('build', help='dist/<slug>.html を作る')
    p.add_argument('slug')
    p.add_argument('--strict', action='store_true', help='警告があれば失敗にする')
    p.set_defaults(fn=cmd_build)
    p = sub.add_parser('shots', help='確認用の静止画')
    p.add_argument('slug')
    g = p.add_mutually_exclusive_group()
    g.add_argument('--beats', action='store_true', help='各ステップの最後の画面（既定）')
    g.add_argument('--times', help='秒をカンマ区切りで（例: 3,12.5）')
    p.add_argument('--cols', type=int, default=5)
    p.add_argument('--build', action='store_true', help='先にビルドする')
    p.set_defaults(fn=cmd_shots)
    p = sub.add_parser('export', help='MP4 を書き出す')
    p.add_argument('slug')
    p.add_argument('--out')
    p.add_argument('--fps', type=int, default=30)
    p.add_argument('--crf', type=int, default=18)
    p.add_argument('--hold', type=float, default=1.5, help='最後の画面を止めておく秒数')
    p.add_argument('--from', dest='t_from', type=float)
    p.add_argument('--to', dest='t_to', type=float)
    p.add_argument('--no-check', action='store_true', help='書き出し後の確認画像を作らない')
    p.add_argument('--build', action='store_true', help='先にビルドする')
    p.set_defaults(fn=cmd_export)
    p = sub.add_parser('fonts', help='フォントをダウンロード')
    p.set_defaults(fn=cmd_fonts)
    a = ap.parse_args()
    a.fn(a)


if __name__ == '__main__':
    main()
