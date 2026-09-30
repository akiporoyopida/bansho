// @title 1次関数の式を求める
/*
  数学 中2「3章 1次関数」P93 章の問題B 大問1（板書 → source/board-p93-answers.png）
  読み取り・検算・構成は notes.md。エンジンの使い方は .claude/skills/whiteboard-lesson-video/references/engine-api.md
*/

// 色の意味（9394-1〜4 で共通）：青＝わかっている点・式、赤＝求める式・答え
Object.assign(RGB, { given: RGB.blue, answer: RGB.red });

/* ---------- 座標平面の道具（このレッスン用） ---------- */
function plane(o){ const G = Object.assign({}, o); G.P = (x, y) => [G.ox + x * G.u, G.oy - y * G.u]; return G; }
const mnum = x => (x < 0 ? '−' + (-x) : String(x));
function drawPlane(G, a, lab = 2){
  if (a <= 0) return;
  const [L, T] = G.P(G.x0, G.y1), [R, B] = G.P(G.x1, G.y0);
  grid(L, T, R, B, G.u, .07 * a);
  arrow([L - 10, G.oy], [R + 28, G.oy], 1, 'w', 1.8, .7 * a, 11);
  arrow([G.ox, B + 10], [G.ox, T - 18], 1, 'w', 1.8, .7 * a, 11);
  text('x', R + 48, G.oy, fI(34), 'w', .85 * a);
  text('y', G.ox + 22, T - 22, fI(34), 'w', .85 * a);
  text('O', G.ox - 17, G.oy + 21, fI(26), 'w', .6 * a);
  for (let x = Math.ceil(G.x0 / lab) * lab; x <= G.x1; x += lab) if (x !== 0){ const p = G.P(x, 0); text(mnum(x), p[0], p[1] + 22, fM(23), 'w', .45 * a); }
  for (let y = Math.ceil(G.y0 / lab) * lab; y <= G.y1; y += lab) if (y !== 0){ const p = G.P(0, y); text(mnum(y), p[0] - 12, p[1], fM(23), 'w', .45 * a, 'right'); }
}
function gSeg(G, m, b){ // 直線 y = mx + b の、平面の中の部分
  let xa = G.x0, xb = G.x1;
  if (m !== 0){ const xs = [(G.y0 - b) / m, (G.y1 - b) / m].sort((p, q) => p - q); xa = Math.max(xa, xs[0]); xb = Math.min(xb, xs[1]); }
  return [G.P(xa, m * xa + b), G.P(xb, m * xb + b)];
}
function gLine(G, m, b, p, c = 'w', w = 2.6, al = 1, o = {}){ const [A, B] = gSeg(G, m, b); line(A, B, p, c, w, al, o); }
function gPt(G, x, y, c, a, glow = 10, lab = null, dx = 0, dy = -30){
  if (a <= 0) return;
  const p = G.P(x, y);
  dot(p, 7 * clamp01(eback(a)), c, a, glow);
  if (lab) text(lab, p[0] + dx, p[1] + dy, fM(28), c, a);
}
function pulse(p, t0, lt, c = 'w'){ const q = S(lt, t0, t0 + .8); if (q > 0 && q < 1) ring(p, lerp(8, 36, q), c, (1 - q) * .9, 2); }
function brace(x, y0, y1, a){ // 連立方程式の左の「{」
  if (a <= 0) return;
  const m = (y0 + y1) / 2, w = 12;
  ctx.save(); setStroke('w', 2.2, .85 * a); ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(x + w, y0); ctx.quadraticCurveTo(x, y0, x, y0 + w); ctx.lineTo(x, m - w);
  ctx.quadraticCurveTo(x, m, x - w, m); ctx.quadraticCurveTo(x, m, x, m + w); ctx.lineTo(x, y1 - w);
  ctx.quadraticCurveTo(x, y1, x + w, y1); ctx.stroke(); ctx.restore();
}
const F = (a, b) => fr([n(a)], [n(b)]);

/* ---------- 下の数式 ---------- */
const FORMS = {
  gen: () => [v('y'), op('='), v('a'), v('x'), op('+'), v('b')],
  ex: () => [v('y'), op('='), n('2'), v('x'), op('+'), n('1')],
  xax: () => [j('$x${軸上|じくじょう}の{点|てん}'), ar('r', 1.1), v('y'), op('='), n('0')],
  gen1: () => [v('y'), op('='), v('a'), v('x'), op('+'), v('b')],
  sub: () => [j('{下|した}の{式|しき}−{上|うえ}の{式|しき}'), sp(.3), n('8'), v('a'), op('='), n('−2')],
  par: () => [j('{平行|へいこう}'), ar('r', 1.1), j('{傾|かたむ}きが{同|おな}じ')],
  sum: () => [v('y'), op('='), v('a'), v('x'), op('+'), v('b')]
};

/* ================= 導入：y = ax + b ================= */
const G0 = plane({ ox: 480, oy: 690, u: 52, x0: -4, x1: 6, y0: -2, y1: 8 });
function drawIntro(lt){
  drawPlane(G0, S(lt, .1, .9));
  gLine(G0, 2, 1, S(lt, 1.0, 2.2), 'w', 2.8, .95, { glow: 6 });
  // b：y軸と交わる点（切片）
  const P = G0.P(0, 1), ib = S(lt, 2.6, 3.1);
  gPt(G0, 0, 1, 'w', ib, 12);
  pulse(P, 2.6, lt);
  text('$b$ ＝ {切片|せっぺん}', P[0] - 30, P[1] + 8, fJ(30, 500), 'w', .9 * S(lt, 3.0, 3.5), 'right');
  // a：右へ1、上へa（ここでは 2）
  const A = G0.P(1, 3), B = G0.P(2, 3), C = G0.P(2, 5);
  const r1 = S(lt, 6.6, 7.4), u1 = S(lt, 7.6, 8.6);
  line(A, B, r1, 'w', 2.4, .85, { dash: [6, 6] });
  line(B, C, u1, 'given', 3, 1, { glow: 8 });
  text('1', (A[0] + B[0]) / 2, A[1] + 26, fM(30), 'w', .85 * S(lt, 7.0, 7.4));
  text('2', B[0] + 22, (B[1] + C[1]) / 2, fM(32), 'given', S(lt, 8.2, 8.6));
  text('$a$ ＝ {傾|かたむ}き', B[0] + 48, (B[1] + C[1]) / 2, fJ(30, 500), 'given', S(lt, 8.6, 9.1), 'left');
}

/* ================= (1) 2点を通る直線 ================= */
const G1 = plane({ ox: 444, oy: 460, u: 48, x0: -4, x1: 8, y0: -4, y1: 4 });
const EQ1 = [[n('−2'), v('a'), op('+'), v('b'), op('='), n('2')], [n('6'), v('a'), op('+'), v('b'), op('='), n('0')]];
function drawQ1(lt){
  drawPlane(G1, S(lt, 0, .8));
  // 点(−2, 2) と 直線 y = x − 6（わかっているもの）
  const dim = 1 - .5 * S(lt, 28.6, 29.2);
  gLine(G1, 1, -6, S(lt, 1.8, 3.0), 'given', 2.4, .9 * dim);
  formula([v('y', 'given'), op('='), v('x', 'given'), op('−'), n('6', 'given')], 915, G1.P(8, 2)[1] + 4, 32, S(lt, 2.6, 3.1) * dim);
  gPt(G1, -2, 2, 'given', S(lt, 1.0, 1.4), 10, '(−2, 2)', 0, -32);
  pulse(G1.P(-2, 2), 1.0, lt, 'given');
  // x軸を光らせる → (6, 0)
  const xg = S(lt, 4.0, 4.6) * (1 - S(lt, 14.3, 14.8));
  if (xg > 0) line(G1.P(G1.x0, 0), G1.P(G1.x1, 0), 1, 'w', 3, .8 * xg, { glow: 12 });
  const q6 = S(lt, 9.8, 10.3);
  gPt(G1, 6, 0, 'given', q6, 10, '(6, 0)', -56, -28);
  pulse(G1.P(6, 0), 9.8, lt, 'given');
  if (lt < 4.6){ const qa = S(lt, 4.2, 4.6); text('?', G1.P(6, 0)[0], G1.P(6, 0)[1] - 34, fM(36), 'w', .85 * qa); }
  else if (lt < 10.2) text('?', G1.P(6, 0)[0], G1.P(6, 0)[1] - 34, fM(36), 'w', .85 * (1 - S(lt, 9.6, 10.0)));
  // b1：0 = x − 6 → x = 6
  const e1 = S(lt, 7.6, 8.1) * (1 - S(lt, 14.3, 14.8));
  formula([n('0'), op('='), v('x'), op('−'), n('6')], 540, 740, 56, e1);
  formula([v('x'), op('='), n('6', 'given')], 540, 830, 56, S(lt, 8.8, 9.3) * (1 - S(lt, 14.3, 14.8)));

  /* b2：y = ax + b に2点を代入 → 連立方程式 */
  const LX = 250, Y1 = 730, Y2 = 830;
  const out = 1 - S(lt, 29.0, 29.6);
  const sysA = lerp(1, .45, S(lt, 21.4, 22.0)) * out;
  const r1 = S(lt, 15.2, 15.8), r2 = S(lt, 17.8, 18.4);
  pulse(G1.P(-2, 2), 15.0, lt, 'given'); pulse(G1.P(6, 0), 17.6, lt, 'given');
  brace(LX - 20, Y1 - 36, Y2 + 36, S(lt, 15.0, 15.4) * sysA);
  formulaL(EQ1[0], LX, Y1, 52, r1 * sysA);
  formulaL(EQ1[1], LX, Y2, 52, r2 * sysA);
  text('(−2, 2) を{代入|だいにゅう}', LX + 300, Y1, fJ(24), 'given', .8 * r1 * (1 - S(lt, 21.4, 21.8)), 'left');
  text('(6, 0) を{代入|だいにゅう}', LX + 300, Y2, fJ(24), 'given', .8 * r2 * (1 - S(lt, 21.4, 21.8)), 'left');

  /* b3：解くと a = −1/4、b = 3/2 */
  const RX = 700, fly = S(lt, 29.8, 31.0);
  arrow([LX + 330, (Y1 + Y2) / 2], [RX - 40, (Y1 + Y2) / 2], S(lt, 22.0, 22.6), 'w', 2, .7 * out, 12);
  const ra = S(lt, 23.4, 24.0), rb = S(lt, 25.2, 25.8);
  const Ta = [v('a'), op('='), n('−', 'answer'), F('1', '4')], Tb = [v('b'), op('='), F('3', '2')];
  // 答えの式（ここへ a と b が飛ぶ）
  const TT = [v('y', 'answer'), op('='), n('−', 'answer'), fr([n('1', 'answer')], [n('4', 'answer')]), v('x', 'answer'), op('+'), fr([n('3', 'answer')], [n('2', 'answer')])];
  const AY = 790, LT = layoutF(TT, 540, 64);
  const La = layoutF(Ta, 0, 52), Lb = layoutF(Tb, 0, 52);
  const offA = RX - La.x0, offB = RX - Lb.x0;
  if (lt < 31.0){
    formulaL(Ta.slice(0, 2), RX, Y1, 52, ra * (1 - S(lt, 29.6, 30.0)));
    formulaL(Tb.slice(0, 2), RX, Y2, 52, rb * (1 - S(lt, 29.6, 30.0)));
    // 飛んでいく a（−1/4）と b（3/2）
    const sa = [(La.boxes[2].x0 + La.boxes[3].x1) / 2 + offA, Y1], ta = [(LT.boxes[2].x0 + LT.boxes[3].x1) / 2, AY];
    const sb = [(Lb.boxes[2].x0 + Lb.boxes[2].x1) / 2 + offB, Y2], tb = [(LT.boxes[6].x0 + LT.boxes[6].x1) / 2, AY];
    const pa = lp(sa, ta, fly), pb = lp(sb, tb, fly), sz = lerp(52, 64, fly);
    formula([n('−', 'answer'), fr([n('1', 'answer')], [n('4', 'answer')])], pa[0], pa[1], sz, ra);
    formula([fr([n('3', 'answer')], [n('2', 'answer')])], pb[0], pb[1], sz, rb);
  }
  /* b4：y = −1/4 x + 3/2 */
  const tf = S(lt, 29.4, 30.0);
  if (tf > 0){
    const toks = TT.map((t, i) => (i === 2 || i === 3 || i === 6) ? Object.assign({}, t, { a: lt >= 31.0 ? 1 : 0 }) : t);
    const L = formula(toks, 540, AY, 64, tf);
    answerLine(L.x0 - 6, L.x1 + 6, AY + 70, S(lt, 34.6, 35.4), 'w', .9);
  }
  gLine(G1, -.25, 1.5, S(lt, 31.6, 33.4), 'answer', 3, 1, { glow: 8 });
  if (lt > 33.2){ pulse(G1.P(-2, 2), 33.2, lt, 'answer'); pulse(G1.P(6, 0), 33.4, lt, 'answer'); }
}

/* ================= (2) 交点を通り、平行な直線 ================= */
const G2 = plane({ ox: 474, oy: 470, u: 44, x0: -3, x1: 6, y0: -4, y1: 5 });
function drawQ2(lt){
  drawPlane(G2, S(lt, 0, .8));
  const dimG = 1 - .45 * S(lt, 15.2, 15.7);
  gLine(G2, .5, 0, S(lt, 1.0, 2.0), 'given', 2.4, .9 * dimG);
  gLine(G2, -2, 5, S(lt, 1.6, 2.6), 'given', 2.4, .9 * dimG);
  const la = S(lt, 2.2, 2.7) * dimG;
  formula([v('y', 'given'), op('='), fr([n('1', 'given')], [n('2', 'given')]), v('x', 'given')], 830, G2.P(5, 2.5)[1] - 40, 30, la);
  formula([v('y', 'given'), op('='), n('−2', 'given'), v('x', 'given'), op('+'), n('5', 'given')], 250, G2.P(0, 4.6)[1] + 6, 28, la);
  // y = 3x − 1（平行にする直線）→ 最後に平行に動いて y = 3x − 5 へ
  const mv = S(lt, 30.4, 32.2), bNow = lerp(-1, -5, mv);
  const gl = lt >= 15.4 && lt < 30.4 ? 8 * S(lt, 15.4, 16.0) : 0;
  gLine(G2, 3, -1, S(lt, 3.0, 4.0), 'given', 2.2, .85 * (mv > 0 ? .45 : 1), { dash: [10, 8], glow: gl });
  const lab31 = S(lt, 3.6, 4.1);
  formula([v('y', 'given'), op('='), n('3', 'given', { g: gl }), v('x', 'given'), op('−'), n('1', 'given')], 610, G2.P(0, 5)[1] - 28, 28, lab31 * (mv > 0 ? .5 : 1));
  if (mv > 0){
    gLine(G2, 3, bNow, 1, mixRGB('given', 'answer', mv), 3, 1, { glow: 8 });
  }
  // 交点 (2, 1)
  const ip = S(lt, 12.0, 12.5);
  gPt(G2, 2, 1, lt >= 30.4 ? 'answer' : 'given', ip, 12, '(2, 1)', 44, 22);
  pulse(G2.P(2, 1), 12.0, lt, 'given');
  if (lt > 32.0) pulse(G2.P(2, 1), 32.0, lt, 'answer');

  /* b1：連立方程式 → 交点 */
  const LX = 300, Y1 = 740, Y2 = 840, o1 = 1 - S(lt, 15.1, 15.6);
  brace(LX - 20, Y1 - 40, Y2 + 36, S(lt, 7.4, 7.8) * o1);
  formulaL([v('y'), op('='), F('1', '2'), v('x')], LX, Y1, 50, S(lt, 7.6, 8.1) * o1);
  formulaL([v('y'), op('='), n('−2'), v('x'), op('+'), n('5')], LX, Y2, 50, S(lt, 7.9, 8.4) * o1);
  arrow([LX + 290, (Y1 + Y2) / 2], [LX + 390, (Y1 + Y2) / 2], S(lt, 9.2, 9.8), 'w', 2, .7 * o1, 12);
  formulaL([v('x'), op('='), n('2', 'given')], LX + 430, Y1, 50, S(lt, 10.2, 10.7) * o1);
  formulaL([v('y'), op('='), n('1', 'given')], LX + 430, Y2, 50, S(lt, 10.8, 11.3) * o1);

  /* b2：平行 → y = 3x + b */
  const pb = S(lt, 16.4, 17.0);
  const T3 = [v('y'), op('='), n('3', 'given', { g: 10 * (1 - S(lt, 17.2, 18.4)) }), v('x'), op('+'), v('b')];
  formula(T3, 540, 740, 60, pb * (1 - S(lt, 29.6, 30.1)));
  /* b3：(2, 1) を代入 → b = −5 */
  const s1 = S(lt, 23.4, 24.0), s2 = S(lt, 25.4, 26.0);
  formula([n('1', 'given'), op('='), n('3'), op('×'), n('2', 'given'), op('+'), v('b')], 540, 830, 52, s1 * (1 - S(lt, 29.6, 30.1)));
  formula([v('b'), op('='), n('−5', 'answer')], 540, 910, 52, s2 * (1 - S(lt, 29.6, 30.1)));
  /* b4：y = 3x − 5 */
  const ta = S(lt, 30.0, 30.6);
  if (ta > 0){
    const L = formula([v('y', 'answer'), op('='), n('3', 'answer'), v('x', 'answer'), op('−'), n('5', 'answer')], 540, 790, 66, ta);
    answerLine(L.x0 - 6, L.x1 + 6, 846, S(lt, 33.0, 33.8), 'w', .9);
  }
}

/* ----- まとめ ----- */
function drawSum(lt){
  const a1 = S(lt, .4, 1.0), a2 = S(lt, 2.2, 2.8);
  // 左：2点 → 連立方程式
  const L = plane({ ox: 170, oy: 560, u: 36, x0: -1, x1: 7, y0: -1, y1: 6 });
  const R = plane({ ox: 620, oy: 560, u: 36, x0: -1, x1: 7, y0: -1, y1: 6 });
  [[L, a1], [R, a2]].forEach(([G, a]) => {
    const [x0, y0] = G.P(G.x0, G.y1), [x1, y1] = G.P(G.x1, G.y0);
    grid(x0, y0, x1, y1, G.u, .06 * a);
    line(G.P(G.x0, 0), G.P(G.x1, 0), 1, 'w', 1.4, .5 * a); line(G.P(0, G.y0), G.P(0, G.y1), 1, 'w', 1.4, .5 * a);
  });
  gLine(L, .6, 1, a1, 'answer', 2.8, 1, { glow: 6 });
  gPt(L, 1, 1.6, 'given', a1, 8); gPt(L, 5, 4, 'given', a1, 8);
  gLine(R, .6, -.2, a2, 'given', 2, .7, { dash: [8, 7] });
  gLine(R, .6, 1.4, a2, 'answer', 2.8, 1, { glow: 6 });
  gPt(R, 3, 3.2, 'given', a2, 8);
  text('2つの{点|てん}', 296, 350, fJ(34, 500), 'w', .92 * a1);
  text('→ {連立方程式|れんりつほうていしき}', 296, 620, fJ(28), 'w', .75 * a1);
  text('{傾|かたむ}きと1つの{点|てん}', 746, 350, fJ(34, 500), 'w', .92 * a2);
  text('→ {代入|だいにゅう}して b', 746, 620, fJ(28), 'w', .75 * a2);
  text('{平行|へいこう}なら{傾|かたむ}きは{同|おな}じ', 746, 690, fJ(26), 'w', .6 * S(lt, 3.6, 4.2));
}

/* ---------- シーンとステップ ---------- */
const SCENE_LIST = [
  { title: '1{次関数|じかんすう}の{式|しき}', legend: false, dur: 12.5, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: '1{次関数|じかんすう} $y$＝$ax$＋$b$ のグラフは{直線|ちょくせん}。\n$b$は、$y${軸|じく}と{交|まじ}わる{点|てん}（{切片|せっぺん}）。', f: 'gen', fd: 1.2 },
    { t: 6.2, cap: '$a$は{傾|かたむ}き。{右|みぎ}へ1{進|すす}むと、{上|うえ}へ$a${進|すす}む。\nこの{直線|ちょくせん}は $y$＝2$x$＋1。', f: 'ex', fd: 2.6 }] },
  { title: '(1) 2つの{点|てん}を{通|とお}る{直線|ちょくせん}', legend: true, dur: 37, draw: drawQ1, beats: [
    { t: 0, cd: .6, cap: 'グラフは{点|てん}(−2, 2)を{通|とお}り、{直線|ちょくせん}\n$y$＝$x$−6 と$x${軸上|じくじょう}の{点|てん}で{交|まじ}わる。', f: null },
    { t: 7, cap: '$x${軸上|じくじょう}の{点|てん}は$y$＝0。0＝$x$−6 より$x$＝6。\nもう1つの{点|てん}は(6, 0)です。', f: 'xax', fd: .6 },
    { t: 14.2, cap: '$y$＝$ax$＋$b$に、2つの{点|てん}の\n$x$と$y$を{代入|だいにゅう}します。', f: 'gen1', fd: .4 },
    { t: 21.2, cap: '{連立方程式|れんりつほうていしき}を{解|と}くと、\n$a$＝−4{分|ぶん}の1、$b$＝2{分|ぶん}の3。', f: 'sub', fd: .8 },
    { t: 29.2, cap: '$a$と$b$を$y$＝$ax$＋$b$に{入|い}れて、\n$y$＝−4{分|ぶん}の1$x$＋2{分|ぶん}の3。', f: null }] },
  { title: '(2) {交点|こうてん}を{通|とお}り、{平行|へいこう}な{直線|ちょくせん}', legend: true, dur: 36, draw: drawQ2, beats: [
    { t: 0, cd: .6, cap: 'グラフは2{直線|ちょくせん}の{交点|こうてん}を{通|とお}り、\n{直線|ちょくせん} $y$＝3$x$−1 に{平行|へいこう}。', f: null },
    { t: 7, cap: '2つの{式|しき}を{連立方程式|れんりつほうていしき}にして{解|と}くと、\n{交点|こうてん}は(2, 1)。', f: null },
    { t: 15, cap: '{平行|へいこう}な{直線|ちょくせん}は、{傾|かたむ}きが{同|おな}じ。\nだから $y$＝3$x$＋$b$ とおけます。', f: 'par', fd: .6 },
    { t: 22.4, cap: '(2, 1)を{代入|だいにゅう}すると、1＝3×2＋$b$。\n$b$＝−5。', f: null },
    { t: 29.4, cap: '{答|こた}えは $y$＝3$x$−5。\n$y$＝3$x$−1 を、{平行|へいこう}に{動|うご}かした{直線|ちょくせん}です。', f: null }] },
  { title: 'まとめ', legend: true, dur: 11, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: '{式|しき}を{決|き}めるには、2つの{点|てん}か、\n{傾|かたむ}きと1つの{点|てん}がわかればよい。', f: 'sum', fd: 4.4 }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{点|てん}・{式|しき}' }, { c: 'answer', label: '{求|もと}める{式|しき}・{答|こた}え' }],
  poster: 10
});
