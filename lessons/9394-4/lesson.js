// @title ドローンのバッテリー
/*
  数学 中2「3章 1次関数」P93 章の問題B 大問4（板書 → source/board-p93-answers.png の右下）
  板書は「参考までに答えを示します」だけで、問題文とグラフは写っていない。板書の数字だけで答えを確かめる（notes.md）。
*/

// 色の意味（9394-1〜4 で同じ）：青＝わかっている点・式、赤＝求める式・答え
Object.assign(RGB, { given: RGB.blue, answer: RGB.red });

/* ---------- 座標平面（x：分、y：%） ---------- */
const OX = 170, OY = 900, KX = 22, KY = 8.4;             // 1分＝22px、1%＝8.4px
const X = x => OX + x * KX, Y = y => OY - y * KY, PT = (x, y) => [X(x), Y(y)];
const P10 = PT(10, 60), P20 = PT(20, 35), P34 = PT(34, 0);
function plane(a){
  if (a <= 0) return;
  ctx.save(); ctx.strokeStyle = col('w', .07 * a); ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 10; x <= 36; x += 10){ ctx.moveTo(X(x), OY); ctx.lineTo(X(x), Y(72)); }
  for (let y = 10; y <= 70; y += 10){ ctx.moveTo(OX, Y(y)); ctx.lineTo(X(36), Y(y)); }
  ctx.stroke(); ctx.restore();
  arrow([OX, OY], [X(37.5), OY], 1, 'w', 1.8, .6 * a, 12);
  arrow([OX, OY], [OX, Y(76)], 1, 'w', 1.8, .6 * a, 12);
  for (let x = 10; x <= 30; x += 10) text(String(x), X(x), OY + 28, fM(26), 'w', .55 * a);
  for (let y = 10; y <= 70; y += 10) text(String(y), OX - 14, Y(y), fM(26), 'w', .55 * a, 'right');
  text('0', OX - 14, OY + 24, fM(26), 'w', .55 * a, 'right');
  text('x', 1012, OY + 34, fI(34), 'w', .85 * a, 'right');
  text('（{分|ふん}）', 988, OY + 34, fJ(24), 'w', .7 * a, 'right');
  text('y', OX + 22, Y(76) + 4, fI(34), 'w', .85 * a, 'left');
  text('（%）', OX + 44, Y(76) + 4, fJ(24), 'w', .7 * a, 'left');
}
// わかっている2点と、その間のグラフ（板書「ドローンが戻ってくる時のグラフ」）
function knownPts(p, al = 1){
  if (p <= 0) return;
  const g = S(p, 0, .3), q = S(p, .45, .75), l = S(p, .7, 1);
  line(P10, [X(10), OY], g, 'w', 1.2, .3 * al, { dash: [4, 7] }); line(P10, [OX, P10[1]], g, 'w', 1.2, .3 * al, { dash: [4, 7] });
  line(P20, [X(20), OY], q, 'w', 1.2, .3 * al, { dash: [4, 7] }); line(P20, [OX, P20[1]], q, 'w', 1.2, .3 * al, { dash: [4, 7] });
  line(P10, P20, l, 'w', 2.4, .9 * al);
  dot(P10, 7 * eback(g), 'given', al, 10); dot(P20, 7 * eback(q), 'given', al, 10);
  text('(10, 60)', P10[0] - 16, P10[1] - 30, fM(30), 'given', g * al, 'right');
  text('(20, 35)', P20[0] - 18, P20[1] + 34, fM(30), 'given', q * al, 'right');
}

/* ---------- 下の数式 ---------- */
const FORMS = {
  axes: () => [v('x'), j('：{分|ふん}'), sp(1.2), v('y'), j('：{残量|ざんりょう}（%）')],
  pts: () => [v('x'), op('='), n('10', 'given'), j('のとき'), v('y'), op('='), n('60', 'given'), sp(1), v('x'), op('='), n('20', 'given'), j('のとき'), v('y'), op('='), n('35', 'given')],
  q1: () => [j('(1)'), sp(.4), j('1{分間|ぷんかん}あたりに{変化|へんか}する{残量|ざんりょう}', 'answer')],
  slope: () => [j('{傾|かたむ}き'), op('='), fr([n('35'), op('−'), n('60')], [n('20'), op('−'), n('10')]), op('='), op('−'), fr([n('25')], [n('10')])],
  per: () => [n('1'), j('{分間|ぷんかん}に'), fr([n('25')], [n('10')]), u('%'), j('へる')],
  rest: () => [j('もどった{時|とき}の{残量|ざんりょう}'), op('='), n('35', 'given'), u('%', 'given')],
  q2: () => [n('35'), op('÷'), fr([n('25')], [n('10')]), op('='), n('35'), op('×'), fr([n('10')], [n('25')]), op('='), n('14', 'answer'), j('{分間|ふんかん}', 'answer')],
  sum: () => [j('{残|のこ}り'), op('÷'), j('1{分間|ぷんかん}あたりの{変化|へんか}'), op('='), j('{時間|じかん}')]
};

/* ----- 導入：板書の答えから ----- */
function drawIntro(lt){
  plane(S(lt, .2, 1.2));
  knownPts(seg(lt, 7.3, 10.3));
}

/* ----- (1) 傾きが表すもの ----- */
function drawQ1(lt){
  plane(1);
  knownPts(1);
  const hl = S(lt, .6, 1.2);
  if (hl > 0) line(P10, P20, 1, 'w', 3.4, hl, { glow: 12 });
  const ca = S(lt, 1.6, 2.2);
  text('{傾|かたむ}き', 780, 380, fJ(34, 500), 'w', .9 * ca);
  text('＝1{分間|ぷんかん}あたりに', 780, 440, fJ(30, 500), 'answer', ca);
  text('{変化|へんか}する{残量|ざんりょう}', 780, 494, fJ(30, 500), 'answer', ca);
  answerLine(660, 900, 526, S(lt, 3.0, 3.8), 'answer', .9);
}

/* ----- (2) 飛び続けられる時間 ----- */
function drawQ2(lt){
  plane(1);
  const dimK = lerp(1, .55, S(lt, 15.2, 15.8));
  knownPts(1, dimK);
  // b0：横に10、たてに −25（階段）
  const C = [P20[0], P10[1]];
  const big = S(lt, .8, 2.2), bigA = 1 - .75 * S(lt, 8.2, 8.8);
  poly([P10, C, P20], big, 'w', 2.4, .9 * bigA, { glow: 6 * (1 - S(lt, 8.2, 8.8)) });
  text('+10', (P10[0] + C[0]) / 2, P10[1] - 26, fM(32), 'w', .9 * S(lt, 1.6, 2.1) * (1 - S(lt, 8.2, 8.8)));
  text('−25', C[0] + 16, (C[1] + P20[1]) / 2, fM(32), 'w', .9 * S(lt, 2.1, 2.6) * bigA, 'left');
  // b1：10回に分けると、1分で 25/10 % ずつ
  const st = S(lt, 9.0, 11.6);
  if (st > 0){
    const pts = [P10];
    for (let i = 1; i <= 10; i++){ pts.push(PT(10 + i, 60 - 2.5 * (i - 1))); pts.push(PT(10 + i, 60 - 2.5 * i)); }
    poly(pts, st, 'w', 1.8, .85 * (1 - .5 * S(lt, 15.2, 15.8)));
    const f1 = S(lt, 12.0, 12.5) * (1 - .6 * S(lt, 15.2, 15.8));
    poly([P10, PT(11, 60), PT(11, 57.5)], f1, 'answer', 3.2, 1, { glow: 10 });
    if (f1 > 0) formulaL([n('1', 'answer'), j('{分|ぷん}で', 'answer'), fr([n('25', 'answer')], [n('10', 'answer')]), u('%', 'answer'), j('へる', 'answer')], P10[0] + 30, P10[1] - 62, 30, f1);
  }
  // b2：もどった時の残量 35%
  const ra = S(lt, 15.6, 16.4);
  if (ra > 0){
    line(P20, [X(20), OY], ra, 'given', 3, 1, { glow: 8 });
    text('35%', X(20) - 16, Y(17), fM(32), 'given', S(lt, 16.2, 16.7), 'right');
  }
  // b3：35 ÷ 25/10 ＝ 14分間 → 残り 0% になるまでの横の長さ
  const ex = S(lt, 24.6, 26.2);
  line(P20, P34, ex, 'answer', 2.4, .9, { dash: [10, 8] });
  if (ex >= 1) dot(P34, 6, 'answer', 1, 10);
  const hz = S(lt, 26.4, 27.8);
  line([X(20), OY], [X(34), OY], hz, 'answer', 4, 1, { glow: 10 });
  tickV([X(34), OY], 18, 'answer', S(lt, 27.6, 28.0));
  text('14{分間|ふんかん}', X(27), OY - 36, fJ(32, 500), 'answer', S(lt, 27.8, 28.4));
}

/* ----- まとめ ----- */
function drawSum(lt){
  const a1 = S(lt, .3, 1.0), a2 = S(lt, 1.6, 2.3);
  text('{傾|かたむ}き', 540, 380, fJ(40, 500), 'w', .95 * a1);
  text('＝ 1{分間|ぷんかん}あたりに{変化|へんか}する{量|りょう}', 540, 450, fJ(34), 'w', .8 * a1);
  const L = formula([n('35', 'given'), u('%', 'given'), op('÷'), fr([n('25')], [n('10')]), u('%'), op('='), n('14', 'answer'), j('{分間|ふんかん}', 'answer')], 540, 640, 56, a2);
  text('{残|のこ}り', (L.boxes[0].x0 + L.boxes[1].x1) / 2, 560, fJ(26), 'w', .65 * a2);
  text('1{分間|ぷんかん}に へる{量|りょう}', (L.boxes[3].x0 + L.boxes[4].x1) / 2, 540, fJ(26), 'w', .65 * a2);
  text('{時間|じかん}', (L.boxes[6].x0 + L.boxes[7].x1) / 2, 560, fJ(26), 'w', .65 * a2);
}

/* ---------- シーンとステップ ---------- */
const SCENE_LIST = [
  { title: '{大問|だいもん}4 バッテリーの{残量|ざんりょう}', legend: false, dur: 14, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: 'ここは{板書|ばんしょ}の{答|こた}えから{考|かんが}えます。\n$x${分後|ふんご}のバッテリーの{残量|ざんりょう}を $y$%とします。', f: 'axes', fd: 1.4 },
    { t: 7, cap: 'ドローンが{戻|もど}ってくる{時|とき}のグラフより、\n$x$＝10 のとき $y$＝60、$x$＝20 のとき $y$＝35。', f: 'pts', fd: 1.2 }] },
  { title: '(1) {傾|かたむ}きが{表|あらわ}すもの', legend: true, dur: 8, draw: drawQ1, beats: [
    { t: 0, cd: .5, cap: 'このグラフの{傾|かたむ}きは、\n1{分間|ぷんかん}あたりに{変化|へんか}するバッテリーの{残量|ざんりょう}。', f: 'q1', fd: 1.8, ul: [2, 2, 2.8, 3.6] }] },
  { title: '(2) {飛|と}び{続|つづ}けられる{時間|じかん}', legend: true, dur: 32, draw: drawQ2, beats: [
    { t: 0, cd: .5, cap: '$x$が10ふえると、$y$は25へる。\n{傾|かたむ}きは、−10{分|ぶん}の25。', f: 'slope', fd: 2.8 },
    { t: 8.4, cap: '10{分|ぷん}で25へるので、1{分間|ぷんかん}に\n10{分|ぶん}の25 % ずつバッテリーが{減|へ}ります。', f: 'per', fd: 3.6 },
    { t: 15.2, cap: '{戻|もど}った{時|とき}の{残量|ざんりょう}は35%。\nこれが0%になるまで、あと{何分|なんぷん}{飛|と}べるか。', f: 'rest', fd: 1.2 },
    { t: 23.6, cap: '35÷10{分|ぶん}の25＝35×25{分|ぶん}の10＝14。\nさらに{飛|と}び{続|つづ}けられるのは14{分間|ふんかん}。', f: 'q2', fd: .8, ul: [8, 9, 4.6, 5.4] }] },
  { title: 'まとめ', legend: true, dur: 10, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: '{傾|かたむ}きは、1{分間|ぷんかん}あたりの{変化|へんか}の{量|りょう}。\n{残|のこ}り÷1{分間|ぷんかん}の{量|りょう}で、{時間|じかん}が{求|もと}められます。', f: null }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{点|てん}・{式|しき}' }, { c: 'answer', label: '{求|もと}める{式|しき}・{答|こた}え' }],
  poster: 10
});
