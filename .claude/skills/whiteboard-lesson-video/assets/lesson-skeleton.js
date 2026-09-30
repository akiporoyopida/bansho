// @title 長方形のまわりの長さ（見本）
/*
  lesson.js のひな形（このまま build すると動く見本）。中身を今回の板書の内容に書きかえて使う。
  エンジンの関数はすべてそのまま呼べる → references/engine-api.md
  書き方の約束:
   - 画面は 1080×1350。図は y=200〜960、字幕と下の数式はエンジンが描く。
   - draw(lt) は「シーン内の経過秒 lt」だけで絵を決める（同じ lt なら同じ絵）。出現は S(lt, 開始, 終了) で 0→1。
   - 画面に出る漢字にはすべてふりがな: '{漢字|かんじ}'。図の記号（A, A′）は '$A′$'。
   - 動く点は「表しているものの数」まで。1つずつ動かすと対応がわかりやすい。
*/

// この単元での色の意味（2色まで。凡例にも出す）
Object.assign(RGB, { given: RGB.blue, answer: RGB.red });

/* ---- 下の数式（ステップごとに f: 'キー' で指定） ---- */
const FORMS = {
  rule: () => [j('まわりの{長|なが}さ'), op('='), n('('), j('たて'), op('+'), j('{横|よこ}'), n(')'), op('×'), n('2')],
  calc: () => [n('('), n('3', 'given'), op('+'), n('4', 'given'), n(')'), op('×'), n('2'), op('='), n('14', 'answer'), u('cm', 'answer')]
};

/* ---- シーン1 ---- */
const RECT = { A: [300, 720], B: [780, 720], C: [780, 360], D: [300, 360] };   // 横4cm×たて3cm（1cm = 120px）
function drawPerimeter(lt){
  const { A, B, C, D } = RECT;
  // ステップ1（0秒〜）: 形をかいて、わかっている長さを出す
  poly([A, B, C, D, A], S(lt, .2, 1.6), 'w', 2, .85);
  drawQty(qtyLayout('4', 'cm', 540, 766, 42), 'given', S(lt, 1.6, 2.2));
  drawQty(qtyLayout('3', 'cm', 228, 540, 42), 'given', S(lt, 1.8, 2.4));
  // ステップ2（5.8秒〜）: 点を1つだけ動かして1しゅう。通った辺から光る
  const path = [A, B, C, D, A], cum = [0, 480, 840, 1320, 1680].map(v => v / 1680);   // 辺の長さの累積（割合）
  const f = S(lt, 6.2, 9.4);
  if (lt >= 6.2){
    for (let i = 0; i < 4; i++){
      const s = seg(f, cum[i], cum[i + 1]);
      if (s > 0) line(path[i], path[i + 1], s, 'given', 3.2, 1, { glow: 8 });
    }
    if (f < 1) dot(alongPath(path, f), 7, 'given', 1, 14);
  }
  // 計算を図の下に出し、答えに先生のような「＿＿//」
  const L = formula(FORMS.calc(), 540, 860, 60, S(lt, 9.6, 10.2));
  answerLine(L.boxes[8].x0 - 6, L.boxes[9].x1 + 6, 910, S(lt, 10.4, 11.2));
}

/* ---- まとめ ---- */
function drawSummary(lt){
  formula(FORMS.rule(), 540, 520, 62, S(lt, .3, 1.0));
}

/* ---- シーンとステップ（字幕は2行まで、1行22文字くらいまで） ---- */
const SCENE_LIST = [
  { title: '{長方形|ちょうほうけい}のまわりの{長|なが}さ', legend: true, dur: 12, draw: drawPerimeter, beats: [
    { t: 0, cd: .8, cap: 'たて3cm、{横|よこ}4cmの{長方形|ちょうほうけい}。\nまわりの{長|なが}さを{求|もと}めます。', f: 'rule', fd: 2.4 },
    { t: 5.8, cap: 'まわりを1しゅうすると、たて2{本|ほん}と{横|よこ}2{本|ほん}。\n(3＋4)×2＝14 で、14cm。', f: 'rule' }] },
  { title: 'まとめ', legend: false, dur: 6, draw: drawSummary, beats: [
    { t: 0, cd: .6, cap: '{長方形|ちょうほうけい}のまわりの{長|なが}さは\n(たて＋{横|よこ})×2 で{求|もと}められます。', f: null }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{長|なが}さ' }, { c: 'answer', label: '{答|こた}え' }],
  poster: 5
});
