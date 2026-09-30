// @title 動く点と三角形の面積
/*
  数学 中2 3章「1次関数」P93 章の問題B 大問2（板書 → source/board-p93-answers.png）
  読み取り・検算・構成は notes.md。エンジンの使い方は .claude/skills/whiteboard-lesson-video/references/engine-api.md
*/

// 色の意味（9394-1〜4 で共通）：青＝わかっている点・式・長さ、赤＝求める式・答え（この動画では面積 y）
Object.assign(RGB, { given: RGB.blue, answer: RGB.red });

/* ---------- 下の数式 ---------- */
const HALF = () => fr([n('1')], [n('2')]);
const FORMS = {
  xy: () => [v('x'), j('：Pが{動|うご}いた{長|なが}さ'), sp(1.0), v('y'), j('：△APCの{面積|めんせき}')],
  area: () => [j('{三角形|さんかくけい}の{面積|めんせき}'), op('='), j('{底辺|ていへん}'), op('×'), j('{高|たか}さ'), op('×'), HALF()],
  f1: () => [v('y', 'answer'), op('='), fr([n('3', 'answer')], [n('2', 'answer')]), v('x', 'answer')],
  f2: () => [v('y', 'answer'), op('='), n('−2', 'answer'), v('x', 'answer'), op('+'), n('14', 'answer')],
  both: () => [v('y'), op('='), fr([n('3')], [n('2')]), v('x'), sp(1.4), v('y'), op('='), n('−2'), v('x'), op('+'), n('14')],
  peak: () => [v('x'), op('='), n('4'), j('のとき'), sp(.3), v('y'), op('='), n('6', 'answer'), u('cm²', 'answer')]
};

/* ---------- 三角形の図 ---------- */
// 大きい図（1cm＝110px）：A 左下、B 右下（直角）、C 右上
const BIG = { A: [270, 640], B: [710, 640], C: [710, 310] };
// (3) の小さい図（1cm＝50px）
const SML = { A: [100, 540], B: [300, 540], C: [300, 390] };
const Pat = (T, x) => x <= 4 ? lp(T.A, T.B, x / 4) : lp(T.B, T.C, (x - 4) / 3);   // A から x cm 動いた P
function triangle(T, p, al = .85, sz = 42){
  poly([T.A, T.B, T.C, T.A], p, 'w', 2.2, al);
  const la = al * S(p, .7, 1);
  rightMark(T.B, [-1, 0], [0, -1], sz * .45, .6 * la);
  text('A', T.A[0] - sz * .7, T.A[1] + sz * .5, fI(sz), 'w', .9 * la);
  text('B', T.B[0] + sz * .7, T.B[1] + sz * .5, fI(sz), 'w', .9 * la);
  text('C', T.C[0] + sz * .7, T.C[1] - sz * .3, fI(sz), 'w', .9 * la);
}
function shade(T, P, al){ // △APC（面積 y）
  if (al <= 0) return;
  fillPoly([T.A, P, T.C], 'answer', .16 * al);
  poly([T.A, P, T.C], 1, 'answer', 1.6, .6 * al);
}
function pDot(P, al, lab, off = [0, 36], sz = 38){
  if (al <= 0) return;
  dot(P, 7, 'w', al, 14);
  if (lab > 0) text('P', P[0] + off[0], P[1] + off[1], fI(sz), 'w', .95 * lab);
}
function glowSeg(a, b, c, al, w = 4){ if (al > 0) line(a, b, 1, c, w, al, { glow: 12 }); }
function under(L, i, s, y, al){ // 式のトークン i の下に「底辺」「高さ」などの小さな書きこみ
  if (al <= 0) return;
  const b = L.boxes[i], cx = (b.x0 + b.x1) / 2;
  text(s, cx, y, fJ(26, 500), 'w', .7 * al);
}
function underR(L, i0, i1, s, y, al){ // トークン i0〜i1 のまん中の下
  if (al <= 0) return;
  const cx = (L.boxes[i0].x0 + L.boxes[i1].x1) / 2;
  line([L.boxes[i0].x0 + 4, y - 30], [L.boxes[i1].x1 - 4, y - 30], 1, 'w', 1.4, .5 * al);
  text(s, cx, y, fJ(26, 500), 'w', .7 * al);
}

/* ----- 導入 ----- */
function drawIntro(lt){
  const T = BIG;
  triangle(T, S(lt, .2, 1.6));
  const la = S(lt, 1.6, 2.2);
  drawQty(qtyLayout('4', 'cm', 490, 694, 38), 'given', la);
  const q3 = qtyLayout('3', 'cm', 0, 475, 38); q3.nx += 740 - q3.x0; q3.ux += 740 - q3.x0; drawQty(q3, 'given', la);
  // b1：P が A を出発して AB 上を進む（1つの点）
  const x = 2.5 * S(lt, 6.2, 8.2), pa = S(lt, 5.8, 6.2);
  const P = Pat(T, x);
  shade(T, P, S(lt, 6.4, 7.0));
  if (x > .05) glowSeg(T.A, P, 'given', .9 * S(lt, 6.4, 6.8), 3.2);
  pDot(P, pa, pa);
  const xa = S(lt, 8.2, 8.7);
  formula([v('x', 'given'), u('cm', 'given')], (T.A[0] + P[0]) / 2, 610, 36, xa);
  formula([v('y', 'answer'), u('cm²', 'answer')], 600, 560, 36, S(lt, 8.8, 9.3));
}

/* ----- (1) P が AB 上 ----- */
function drawS1(lt){
  const T = BIG;
  triangle(T, 1);
  const x = lt < 19.4 ? 2.5 : lerp(2.5, 4, S(lt, 19.6, 21.2)), P = Pat(T, x);
  const atB = S(lt, 20.6, 21.2);
  shade(T, P, 1 - atB * .3);
  drawQty(qtyLayout('4', 'cm', 490, 694, 38), 'given', .45);
  // b0：底辺 AP＝x
  glowSeg(T.A, P, 'given', .95 * S(lt, 1.0, 1.5), 3.4);
  formula([v('x', 'given'), u('cm', 'given')], (T.A[0] + P[0]) / 2, 610, 36, S(lt, 1.3, 1.8) * (1 - S(lt, 19.4, 19.8)));
  text('{底辺|ていへん}', (T.A[0] + P[0]) / 2, 566, fJ(26, 500), 'given', .8 * S(lt, 2.0, 2.5) * (1 - S(lt, 19.4, 19.8)));
  // b1：高さ BC＝3
  glowSeg(T.B, T.C, 'given', .95 * S(lt, 6.8, 7.3), 3.4);
  const ha = lerp(.45, 1, S(lt, 6.8, 7.3));
  const q3 = qtyLayout('3', 'cm', 0, 475, 38); q3.nx += 740 - q3.x0; q3.ux += 740 - q3.x0; drawQty(q3, 'given', ha);
  text('{高|たか}さ', 740, 420, fJ(26, 500), 'given', .8 * S(lt, 7.3, 7.8), 'left');
  pDot(P, 1, 1 - atB, [0, 36]);
  // b2：y＝x×3×½（下に「面積」「底辺」「高さ」の書きこみ）
  const ca = S(lt, 12.9, 13.5) * (1 - S(lt, 19.2, 19.7));
  if (ca > 0){
    const L = formula([v('y', 'answer'), op('='), v('x', 'given'), op('×'), n('3', 'given'), op('×'), HALF()], 540, 812, 58, ca);
    under(L, 0, '{面積|めんせき}', 890, ca); under(L, 2, '{底辺|ていへん}', 890, ca); under(L, 4, '{高|たか}さ', 890, ca);
  }
  // b3：B に着くと x＝4、y＝6
  const da = S(lt, 21.2, 21.8);
  if (da > 0){
    const L = formula([v('x'), op('='), n('4'), sp(.8), ar('r', 1.3), sp(.8), v('y'), op('='), fr([n('3')], [n('2')]), op('×'), n('4'), op('='), n('6', 'answer')], 540, 812, 54, da);
    answerLine(L.boxes[12].x0 - 10, L.boxes[12].x1 + 10, 862, S(lt, 22.2, 23.0), 'w', .9);
  }
}

/* ----- (2) P が BC 上 ----- */
function drawS2(lt){
  const T = BIG;
  triangle(T, 1);
  const x = lerp(4, 5.5, S(lt, .4, 1.8)), P = Pat(T, x);
  shade(T, P, 1);
  // b0：A→B→P が x cm
  const pa = S(lt, 2.0, 3.0) * (1 - S(lt, 12.8, 13.3));
  poly([T.A, T.B, P], S(lt, 2.0, 3.0), 'w', 3.4, .9 * (1 - S(lt, 12.8, 13.3)), { glow: 10 });
  formula([v('A'), v('B'), op('+'), v('B'), v('P'), op('='), v('x'), u('cm')], 490, 694, 38, S(lt, 2.8, 3.3) * (1 - S(lt, 12.8, 13.3)));   // x は AB だけでなく A→B→P の長さ
  // b1：PC＝4＋3−x
  glowSeg(P, T.C, 'given', .95 * S(lt, 7.0, 7.5), 3.4);
  const pc = S(lt, 7.4, 8.0);
  formulaL([n('(', 'given'), n('4', 'given'), op('+'), n('3', 'given'), op('−'), v('x', 'given'), n(')', 'given'), u('cm', 'given')], 740, (P[1] + T.C[1]) / 2, 34, pc);
  text('{底辺|ていへん}', 740, (P[1] + T.C[1]) / 2 - 48, fJ(26, 500), 'given', .8 * pc, 'left');
  // b2：高さ AB＝4
  glowSeg(T.A, T.B, 'given', .95 * S(lt, 13.4, 13.9), 3.4);
  const ha = S(lt, 13.6, 14.1);
  drawQty(qtyLayout('4', 'cm', 490, 694, 38), 'given', ha);
  text('{高|たか}さ', 490, 742, fJ(26, 500), 'given', .8 * ha);
  pDot(P, 1, 1, [-34, 0]);
  // b3：y＝(4＋3−x)×4×½
  const ca = S(lt, 19.9, 20.5);
  if (ca > 0){
    const L = formula([v('y', 'answer'), op('='), n('('), n('4'), op('+'), n('3'), op('−'), v('x'), n(')'), op('×'), n('4', 'given'), op('×'), HALF()], 540, 830, 56, ca);
    under(L, 0, '{面積|めんせき}', 906, ca); underR(L, 2, 8, '{底辺|ていへん}', 906, ca); under(L, 10, '{高|たか}さ', 906, ca);
  }
}

/* ----- (3) グラフ ----- */
const GO = [450, 880], GU = 70;
const G = (x, y) => [GO[0] + x * GU, GO[1] - y * GU];
function axes(a){
  if (a <= 0) return;
  grid(GO[0], GO[1] - 6 * GU, GO[0] + 7 * GU, GO[1], GU, .08 * a);
  arrow([GO[0] - 16, GO[1]], [GO[0] + 7.7 * GU, GO[1]], 1, 'w', 1.8, .8 * a, 11);
  arrow([GO[0], GO[1] + 16], [GO[0], GO[1] - 6.7 * GU], 1, 'w', 1.8, .8 * a, 11);
  for (let i = 1; i <= 7; i++) numC(String(i), G(i, 0)[0], GO[1] + 30, 26, 'w', .7 * a);
  for (let i = 1; i <= 6; i++) numC(String(i), GO[0] - 24, G(0, i)[1], 26, 'w', .7 * a);
  text('O', GO[0] - 22, GO[1] + 26, fI(28), 'w', .7 * a);
  formulaL([v('x'), n('(cm)')], GO[0] + 7.75 * GU, GO[1] + 4, 28, .8 * a);
  formula([v('y'), n('(cm²)')], GO[0], GO[1] - 6.7 * GU - 26, 28, .8 * a);
}
function drawS3(lt){
  const T = SML;
  const a0 = S(lt, .2, 1.2);
  triangle(T, a0, .85, 32);
  axes(S(lt, .6, 1.6));
  // P の動き（6.6〜9.8 秒で A→B、13.6〜16.8 秒で B→C）とグラフの点を同時に
  const f1 = S(lt, 6.6, 9.8), f2 = S(lt, 13.6, 16.8);
  const x = 4 * f1 + 3 * f2, y = x <= 4 ? 1.5 * x : -2 * x + 14;
  const P = Pat(T, x), back = S(lt, 20.3, 20.9), pa = S(lt, 6.0, 6.5) * (1 - back);
  shade(T, P, pa);
  pDot(P, pa, pa, x <= 4 ? [0, 28] : [-26, 0], 30);
  // b3：いちばん大きいのは P が B にあるとき → 図の P を B に置き直し、グラフの点を (4, 6) に
  if (back > 0){ shade(T, T.B, back); pDot(T.B, back, back, [0, 30], 30); dot(G(4, 6), 7, 'answer', back, 14); }
  if (f1 > 0) line(G(0, 0), G(4, 6), f1, 'answer', 3, 1, { glow: 8 });
  if (f2 > 0) line(G(4, 6), G(7, 0), f2, 'answer', 3, 1, { glow: 8 });
  if (pa > 0) dot(G(x, y), 7, 'answer', pa, 14);
  const moving = (f1 > 0 && f1 < 1) || (f2 > 0 && f2 < 1);
  if (moving){ const Q = G(x, y); line([Q[0], GO[1]], Q, 1, 'w', 1.2, .35, { dash: [4, 6] }); line([GO[0], Q[1]], Q, 1, 'w', 1.2, .35, { dash: [4, 6] }); }
  // 式のラベル（止めた画面でもわかるように）
  formula([v('y', 'answer'), op('='), fr([n('3', 'answer')], [n('2', 'answer')]), v('x', 'answer')], 540, 580, 30, .9 * S(lt, 9.6, 10.2));
  formula([v('y', 'answer'), op('='), n('−2', 'answer'), v('x', 'answer'), op('+'), n('14', 'answer')], 915, 620, 28, .9 * S(lt, 16.6, 17.2));
  // b3：いちばん大きいところ
  const pk = S(lt, 20.6, 21.2);
  if (pk > 0){
    const Q = G(4, 6);
    line([Q[0], GO[1]], Q, pk, 'w', 1.4, .55, { dash: [5, 6] });
    line([GO[0], Q[1]], Q, pk, 'w', 1.4, .55, { dash: [5, 6] });
    ring(Q, lerp(8, 30, S(lt, 21.0, 22.0)), 'answer', .9 * (1 - S(lt, 21.0, 22.0)), 2);
    text('(4, 6)', Q[0] - 70, Q[1] - 26, fM(30), 'answer', pk);
  }
}

/* ----- まとめ ----- */
function drawSum(lt){
  const a1 = S(lt, .3, 1.0), a2 = S(lt, 1.2, 1.9), a3 = S(lt, 2.4, 3.0);
  text('Pが{辺|へん}AB{上|じょう}（$x$が0から4）', 540, 330, fJ(32, 500), 'w', .85 * a1);
  formula([v('y', 'answer'), op('='), fr([n('3', 'answer')], [n('2', 'answer')]), v('x', 'answer')], 540, 420, 58, a1);
  text('Pが{辺|へん}BC{上|じょう}（$x$が4から7）', 540, 540, fJ(32, 500), 'w', .85 * a2);
  formula([v('y', 'answer'), op('='), n('−2', 'answer'), v('x', 'answer'), op('+'), n('14', 'answer')], 540, 612, 58, a2);
  text('グラフは (4, 6) で{折|お}れ{曲|ま}がる{折|お}れ{線|せん}', 540, 740, fJ(30), 'w', .75 * a3);
  // 小さな山の形
  const O = [420, 900], k = 34;
  poly([O, [O[0] + 4 * k, O[1] - 6 * k * .5], [O[0] + 7 * k, O[1]]], a3, 'answer', 2.6, .9, { glow: 6 });
  line([O[0] - 20, O[1]], [O[0] + 8 * k, O[1]], a3, 'w', 1.4, .5);
}

/* ---------- シーンとステップ ---------- */
const SCENE_LIST = [
  { title: '{動|うご}く{点|てん}と{三角形|さんかくけい}の{面積|めんせき}', legend: true, dur: 11.5, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: '∠B＝90°の{直角三角形|ちょっかくさんかくけい}ABC。\nAB＝4cm、BC＝3cmです。', f: null },
    { t: 5.5, cap: '{点|てん}PはAを{出発|しゅっぱつ}して、Bを{通|とお}りCまで{動|うご}きます。\n$x$ cm {動|うご}いたときの△APCの{面積|めんせき}が $y$ cm²。', f: 'xy', fd: 3.0 }] },
  { title: '(1) Pが{辺|へん}AB{上|じょう}', legend: true, dur: 25, draw: drawS1, beats: [
    { t: 0, cd: .6, cap: 'Pが{辺|へん}AB{上|じょう}にあるとき、\n△APCの{底辺|ていへん}は AP＝$x$ cm。', f: 'area', fd: 2.4 },
    { t: 6.5, cap: '{高|たか}さは、Cから{辺|へん}ABまでの\nBC＝3cm。', f: 'area' },
    { t: 12.5, cap: '$y$＝$x$×3×2{分|ぶん}の1 なので、\n$y$＝2{分|ぶん}の3 $x$。', f: 'f1', fd: 2.0, ul: [0, 3, 2.8, 3.6] },
    { t: 19, cap: 'PがBに{着|つ}くと $x$＝4。\nこのとき $y$＝2{分|ぶん}の3×4＝6。', f: 'f1', ul: [0, 3, -1, 0] }] },
  { title: '(2) Pが{辺|へん}BC{上|じょう}', legend: true, dur: 26.5, draw: drawS2, beats: [
    { t: 0, cd: .6, cap: 'Pが{辺|へん}BC{上|じょう}にあるとき、\nAからBを{通|とお}ってPまでが $x$ cm。', f: 'area', fd: 3.0 },
    { t: 6.5, cap: '{底辺|ていへん}はPC。AからCまでの4＋3cmから\n$x$ をひいて、PC＝4＋3−$x$。', f: 'area' },
    { t: 13, cap: '{高|たか}さは、Aから{辺|へん}BCまでの\nAB＝4cm。', f: 'area' },
    { t: 19.5, cap: '$y$＝(4＋3−$x$)×4×2{分|ぶん}の1 を{計算|けいさん}して、\n$y$＝−2$x$＋14。', f: 'f2', fd: 2.2, ul: [0, 5, 3.0, 3.8] }] },
  { title: '(3) {面積|めんせき}の{変化|へんか}のグラフ', legend: true, dur: 26.5, draw: drawS3, beats: [
    { t: 0, cd: .6, cap: '(1)と(2)の{式|しき}をもとに、\n$x$と$y$の{関係|かんけい}をグラフに{表|あらわ}します。', f: 'both', fd: 1.6 },
    { t: 6, cap: 'Pが AB{上|じょう}のとき、$y$＝2{分|ぶん}の3 $x$。\n(0, 0)から(4, 6)までの{直線|ちょくせん}。', f: 'f1', fd: .4 },
    { t: 13, cap: 'Pが BC{上|じょう}のとき、$y$＝−2$x$＋14。\n(4, 6)から(7, 0)までの{直線|ちょくせん}。', f: 'f2', fd: .4 },
    { t: 20, cap: 'PがBにあるとき（$x$＝4）がいちばん{大|おお}きく、\n$y$＝6。グラフは{山|やま}の{形|かたち}になります。', f: 'peak', fd: 1.6, ul: [7, 8, 2.6, 3.4] }] },
  { title: 'まとめ', legend: false, dur: 12, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: 'Pがどの{辺|へん}にあるかで、{底辺|ていへん}と{高|たか}さが\n{変|か}わるので、{式|しき}も{変|か}わります。', f: null }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{点|てん}・{式|しき}' }, { c: 'answer', label: '{求|もと}める{式|しき}・{答|こた}え' }],
  poster: 9.5
});
