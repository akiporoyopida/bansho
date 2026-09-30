// @title 2直線と三角形の面積
/*
  数学 中2「1次関数」P93 章の問題B ― 大問3（板書 → source/board-p93-answers.png）
  読み取り・検算・構成は notes.md。エンジンの使い方は .claude/skills/whiteboard-lesson-video/references/engine-api.md
*/

// 色の意味（9394-1〜4 で共通）：青＝わかっている点・式、赤＝求める式・答え
Object.assign(RGB, { given: RGB.blue, answer: RGB.red });

/* ---------- 座標平面（1目もり＝56px。x は −3〜11、y は −1〜10） ---------- */
const UN = 56, X0 = 308, Y0 = 860;
const Q = (x, y) => [X0 + UN * x, Y0 - UN * y];
const A = Q(-2, 0), B = Q(10, 0), P = Q(2, 8), M = Q(4, 0), HF = Q(2, 0);
const mEnd = [Q(-2.5, -1), Q(3, 10)];          // 直線m  y＝2x＋4
const nEnd = [Q(0.4, 9.6), Q(11, -1)];         // 直線n  y＝−x＋10
const kEnd = [Q(1.5, 10), Q(4.25, -1)];        // 答えの直線  y＝−4x＋16
function plane(a){
  if (a <= 0) return;
  grid(Q(-3, 0)[0], Q(0, 10)[1], Q(11, 0)[0], Q(0, -1)[1], UN, .07 * a);
  arrow([Q(-3, 0)[0], Y0], [Q(11.4, 0)[0], Y0], 1, 'w', 1.8, .6 * a, 11);
  arrow([X0, Q(0, -1)[1]], [X0, Q(0, 10.4)[1]], 1, 'w', 1.8, .6 * a, 11);
  text('x', Q(11.4, 0)[0] + 20, Y0, fI(34), 'w', .8 * a);
  text('y', X0 + 22, Q(0, 10.4)[1] + 4, fI(34), 'w', .8 * a);
  text('O', X0 - 18, Y0 + 20, fI(28), 'w', .7 * a);
  for (const k of [2, 4, 6, 8]) text(String(k), X0 - 14, Q(0, k)[1], fM(22), 'w', .45 * a, 'right');
}
function pt(p, al, c = 'w', glow = 8){ dot(p, 6, c, al, glow); }
function name(s, p, dx, dy, al, c = 'w'){ text(s, p[0] + dx, p[1] + dy, fI(38), c, al); }
function coord(xs, ys, cx, cy, al, c = 'w', size = 28){ // 「(−2, 0)」。x・y の文字の中心を返す（数を飛ばすとき用）
  const L = formula([n('(', c), n(xs, c), n(',', c), sp(.28), n(ys, c), n(')', c)], cx, cy, size, al);
  return { x: (L.boxes[1].x0 + L.boxes[1].x1) / 2, y: (L.boxes[4].x0 + L.boxes[4].x1) / 2 };
}
function pulse(p, t0, lt, c = 'w'){ const r = S(lt, t0, t0 + .9); if (r > 0 && r < 1) ring(p, lerp(8, 40, r), c, .9 * (1 - r), 2); }
function plate(al){ // 右上の計算スペース（方眼をかくす黒い下地）
  if (al <= 0) return;
  ctx.save(); ctx.fillStyle = col([0, 0, 0], .88 * al); roundRect(596, 304, 336, 262, 14); ctx.fill();
  ctx.strokeStyle = col('w', .16 * al); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
}
const PX = 764, ROW = [348, 408, 468, 530];
function row(i, toks, al, size = 40){ return formula(toks, PX, ROW[i], size, al); }
// 上の見出し：直線 m・n の式（b がわかったら 4 にかわる）
function header(al, bKnown, glowM = 0, glowN = 0){
  if (al <= 0) return;
  const bT = bKnown >= 1 ? n('4', 'given', { g: glowM }) : v('b', 'given', { g: glowM });
  const L = formula([v('m', 'w'), j('：'), v('y', 'given', { g: glowM }), op('='), n('2', 'given', { g: glowM }), v('x', 'given', { g: glowM }), op('+'), bT], 330, 236, 36, al);
  if (bKnown > 0 && bKnown < 1){ // b → 4 のいれかわり
    const bx = L.boxes[7];
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(bx.x0, 236 - 26, bx.x1 - bx.x0 + 6, 52); ctx.restore();
    numC('4', (bx.x0 + bx.x1) / 2 + 2, 236 - 12 * (1 - bKnown), 36, 'answer', bKnown, 10);
    text('b', (bx.x0 + bx.x1) / 2, 236 + 12 * bKnown, fI(36), 'given', 1 - bKnown);
  }
  formula([v('n', 'w'), j('：'), v('y', 'given', { g: glowN }), op('='), n('−', 'given', { g: glowN }), v('x', 'given', { g: glowN }), op('+'), n('10', 'given', { g: glowN })], 760, 236, 36, al);
}
function lineM(p, al, glow = 0, c = 'w'){ line(mEnd[0], mEnd[1], p, c, 2.2, al, { glow }); }
function lineN(p, al, glow = 0, c = 'w'){ line(nEnd[0], nEnd[1], p, c, 2.2, al, { glow }); }
function lineLabels(al){
  text('m', Q(3, 10)[0] + 20, Q(3, 10)[1] + 8, fI(34), 'w', .85 * al);
  text('n', Q(11, -1)[0] + 22, Q(11, -1)[1] - 6, fI(34), 'w', .85 * al);
}
// A・B・P の名前（場所はどのシーンでも同じ）
function namesABP(al){
  name('A', A, -26, -26, al); name('B', B, 26, -26, al); name('P', P, -34, 0, al);
}

/* ---------- 下の数式 ---------- */
const FORMS = {
  i1: () => [v('m'), j('：'), v('y'), op('='), n('2'), v('x'), op('+'), v('b'), sp(.9), v('n'), j('：'), v('y'), op('='), n('−'), v('x'), op('+'), n('10')],
  i2: () => [j('$A$・$B$は$x${軸|じく}との{交点|こうてん}'), sp(.6), j('$P$は2{直線|ちょくせん}の{交点|こうてん}')],
  s1a: () => [v('A'), n('(−2, 0)', 'given')],
  s1b: () => [v('x'), op('='), n('−2', 'given'), n(','), sp(.5), v('y'), op('='), n('0', 'given'), sp(.3), j('を{代入|だいにゅう}')],
  s1c: () => [v('b'), op('='), n('4', 'answer')],
  s2a: () => [j('{交点|こうてん}'), v('P'), op('='), j('{連立方程式|れんりつほうていしき}の{解|かい}')],
  s2b: () => [n('2'), v('x'), op('+'), n('4'), op('='), n('−'), v('x'), op('+'), n('10'), sp(.7), n('3'), v('x'), op('='), n('6')],
  s2c: () => [j('$x${軸上|じくじょう}の{点|てん}'), sp(.3), v('y'), op('='), n('0')],
  s2d: () => [j('{底辺|ていへん}'), v('AB'), op('='), n('10'), op('−'), n('(−2)'), op('='), n('12')],
  s2e: () => [j('{高|たか}さ'), op('='), j('$P$の$y${座標|ざひょう}'), op('='), n('8')],
  s2f: () => [j('{面積|めんせき}'), op('='), j('{底辺|ていへん}'), op('×'), j('{高|たか}さ'), op('×'), fr([n('1')], [n('2')])],
  s3a: () => [j('{底辺|ていへん}$AB$を2{等分|とうぶん}する{点|てん}を{通|とお}る')],
  s3b: () => [n('−2'), op('+'), n('6'), op('='), n('4', 'answer')],
  s3c: () => [n('6'), op('×'), n('8'), op('×'), fr([n('1')], [n('2')]), op('='), n('24'), u('cm²')],
  s3d: () => [j('{傾|かたむ}き'), op('='), fr([n('−8')], [n('2')]), op('='), n('−4', 'answer')],
  s3e: () => [v('y', 'answer'), op('='), n('−4', 'answer'), v('x', 'answer'), op('+'), n('16', 'answer')],
  sum: () => [j('{交点|こうてん}は{連立方程式|れんりつほうていしき}'), sp(.6), j('$x${軸|じく}は$y$＝0')]
};

/* ----- 導入 ----- */
function drawIntro(lt){
  plane(S(lt, 0, .8));
  lineM(S(lt, .6, 1.8), .9); lineN(S(lt, 1.0, 2.2), .9);
  lineLabels(S(lt, 2.0, 2.5));
  header(S(lt, 1.6, 2.2), 0);
  // b1：A・B・P
  const t = [6.2, 6.8, 7.4], pp = [A, B, P];
  pp.forEach((p, i) => { pt(p, S(lt, t[i], t[i] + .3)); pulse(p, t[i], lt); });
  namesABP(S(lt, 6.2, 7.8));
  fillPoly([A, B, P], 'w', .07 * S(lt, 8.0, 8.8));
}

/* ----- (1) b の値 ----- */
function drawS1(lt){
  const a = S(lt, 0, .4);
  plane(a); lineM(1, .9 * a, 10 * S(lt, 17.0, 17.6)); lineN(1, .5 * a); lineLabels(a);
  header(a, S(lt, 16.6, 17.4), 10 * S(lt, 17.0, 17.6));
  pt(A, a, 'given', 10); pt(B, .5 * a); pt(P, .5 * a); namesABP(.8 * a);
  pulse(A, .6, lt, 'given'); pulse(A, 1.6, lt, 'given');
  // A の座標：x は −2、x軸の上なので y は 0
  const ca = S(lt, 1.2, 1.8);
  const C = coord('−2', '0', A[0] - 82, Y0 + 30, ca, 'given');
  // b1：y＝2x＋b に代入（−2 と 0 が式へ飛ぶ）
  const pa = S(lt, 6.6, 7.2);
  plate(pa);
  row(0, [v('y'), op('='), n('2'), v('x'), op('+'), v('b')], S(lt, 6.8, 7.3));
  const r1 = [n('0', 'given', { a: 0 }), op('='), n('2'), op('×'), n('(−2)', 'given', { a: 0 }), op('+'), v('b')];
  const L1 = layoutF(r1, PX, 40), fl = S(lt, 8.4, 9.6);
  row(1, r1, S(lt, 7.8, 8.3));
  if (lt >= 8.4){
    const tx0 = (L1.boxes[0].x0 + L1.boxes[0].x1) / 2, tx4 = (L1.boxes[4].x0 + L1.boxes[4].x1) / 2;
    numC('0', lerp(C.y, tx0, fl), lerp(Y0 + 30, ROW[1], fl), lerp(28, 40, fl), 'given', 1, 10 * (1 - S(lt, 9.6, 10.6)));
    numC(fl < 1 ? '−2' : '(−2)', lerp(C.x, tx4, fl), lerp(Y0 + 30, ROW[1], fl), lerp(28, 40, fl), 'given', 1, 10 * (1 - S(lt, 9.6, 10.6)));
  }
  // b2：計算して b＝4
  row(2, [n('0'), op('='), n('−4'), op('+'), v('b')], S(lt, 13.4, 13.9));
  const L3 = row(3, [v('b'), op('='), n('4', 'answer')], S(lt, 14.6, 15.1), 44);
  answerLine(L3.x0 - 8, L3.x1 + 8, ROW[3] + 32, S(lt, 15.4, 16.2), 'w', .9);
}

/* ----- (2) △ABP の面積 ----- */
function drawS2(lt){
  const a = S(lt, 0, .4);
  const gl = S(lt, .4, 1.0) * (1 - S(lt, 6.6, 7.1));
  plane(a); lineM(1, .9 * a, 10 * gl); lineN(1, .9 * a, 10 * (gl + S(lt, 14.4, 15.0) * (1 - S(lt, 20.6, 21.1)))); lineLabels(a);
  header(a, 1, 10 * gl, 10 * gl);
  pt(A, a, 'given'); namesABP(.85 * a);
  coord('−2', '0', A[0] - 82, Y0 + 30, .85 * a, 'given');
  // b0–b1：連立方程式 → P(2, 8)
  const p0 = S(lt, 1.2, 1.8) * (1 - S(lt, 13.9, 14.3));
  plate(Math.max(p0, S(lt, 14.2, 14.6) * (1 - S(lt, 20.4, 20.8)), S(lt, 33.8, 34.3)));
  if (p0 > 0){
    numC('{', 640, (ROW[0] + ROW[1]) / 2, 92, 'w', .8 * S(lt, 1.4, 2.0) * p0);
    formulaL([v('y'), op('='), n('2'), v('x'), op('+'), n('4')], 668, ROW[0], 38, S(lt, 1.4, 2.0) * p0);
    formulaL([v('y'), op('='), n('−'), v('x'), op('+'), n('10')], 668, ROW[1], 38, S(lt, 1.8, 2.4) * p0);
    row(2, [n('2'), v('x'), op('+'), n('4'), op('='), n('−'), v('x'), op('+'), n('10')], S(lt, 7.0, 7.5) * p0, 36);
  }
  pulse(P, 2.6, lt); pulse(P, 3.6, lt);
  const r3 = [v('x'), op('='), n('2', 'given'), n(','), sp(.5), v('y'), op('='), n('8', 'given')];
  const L3 = row(3, r3, S(lt, 8.4, 8.9) * p0, 40);
  const pP = S(lt, 10.6, 11.0), fp = S(lt, 9.4, 10.6);
  const cP = [P[0] + 72, P[1] - 42];
  if (fp > 0 && fp < 1){ // 2 と 8 が P の座標へ飛ぶ
    const C = coord('2', '8', cP[0], cP[1], 0, 'given');
    const q2 = lp([(L3.boxes[2].x0 + L3.boxes[2].x1) / 2, ROW[3]], [C.x, cP[1]], fp), q8 = lp([(L3.boxes[7].x0 + L3.boxes[7].x1) / 2, ROW[3]], [C.y, cP[1]], fp);
    numC('2', q2[0], q2[1], lerp(40, 28, fp), 'given', 1, 10); numC('8', q8[0], q8[1], lerp(40, 28, fp), 'given', 1, 10);
  }
  coord('2', '8', cP[0], cP[1], pP, 'given');
  pt(P, Math.max(.5 * a, pP), pP > 0 ? 'given' : 'w', 8 + 8 * pP);
  // b2：B は x軸上 → y＝0 を代入 → B(10, 0)
  const pb = S(lt, 14.4, 14.8) * (1 - S(lt, 20.4, 20.8));
  row(0, [v('y'), op('='), n('−'), v('x'), op('+'), n('10')], S(lt, 14.6, 15.1) * pb);
  row(1, [n('0'), op('='), n('−'), v('x'), op('+'), n('10')], S(lt, 15.4, 15.9) * pb);
  const LB = row(2, [v('x'), op('='), n('10', 'given')], S(lt, 16.4, 16.9) * pb);
  const fb = S(lt, 17.2, 18.4), cb = [B[0] - 66, Y0 + 30];
  if (fb > 0 && fb < 1) numC('10', lerp((LB.boxes[2].x0 + LB.boxes[2].x1) / 2, cb[0] - 22, fb), lerp(ROW[2], cb[1], fb), lerp(40, 28, fb), 'given', 1, 10);
  const bB = S(lt, 18.3, 18.7);
  coord('10', '0', cb[0], cb[1], bB, 'given');
  pt(B, Math.max(.5 * a, bB), bB > 0 ? 'given' : 'w', 8 + 8 * bB);
  pulse(B, 18.4, lt, 'given');
  // b3：底辺 AB＝12
  const ab = S(lt, 21.0, 22.0), abg = 12 * (1 - S(lt, 26.6, 27.2)) + 3;
  if (ab > 0) line(A, lp(A, B, ab), 1, 'w', 3.2, 1, { glow: abg });
  const dimA = S(lt, 22.2, 22.8);
  dimH(Y0 - 24, A[0] + 2, B[0] - 2, dimA, 'w', .8);
  text('{底辺|ていへん} 12', 660, Y0 - 58, fJ(28, 500), 'w', .9 * S(lt, 22.6, 23.1));
  // b4：高さ 8（P の y 座標）
  const hp = S(lt, 27.4, 28.4);
  line(P, lp(P, HF, hp), 1, 'w', 2, .85, { dash: [8, 8] });
  if (hp >= 1) rightMark(HF, [1, 0], [0, -1], 16, .6);
  const ha = S(lt, 28.4, 28.9);
  text('{高|たか}さ 8', HF[0] + 16, (P[1] + HF[1]) / 2 - 20, fJ(28, 500), 'w', .9 * ha, 'left');
  if (ha > 0 && lt < 33.4){ const hg = 1 - S(lt, 28.9, 30.0); line(P, HF, 1, 'w', 3, hg, { glow: 12 }); }
  // b5：面積 48 cm²
  fillPoly([A, B, P], 'w', .12 * S(lt, 33.8, 34.6));
  const L5 = row(1, [n('12'), op('×'), n('8'), op('×'), fr([n('1')], [n('2')])], S(lt, 34.4, 34.9), 40);
  const L6 = row(2, [op('='), n('48', 'answer'), u('cm²', 'answer')], S(lt, 35.4, 35.9), 46);
  answerLine(L6.boxes[1].x0 - 6, L6.boxes[2].x1 + 6, ROW[2] + 38, S(lt, 36.2, 37.0), 'w', .9);
}

/* ----- (3) 面積を2等分する直線 ----- */
function drawS3(lt){
  const a = S(lt, 0, .4);
  plane(a); lineM(1, .6 * a); lineN(1, .6 * a); lineLabels(a);
  header(a, 1);
  fillPoly([A, B, P], 'w', .09 * a * (1 - S(lt, 13.8, 14.4)));
  pt(A, a, 'given'); pt(B, a, 'given'); pt(P, a, 'given');
  namesABP(.85 * a);
  coord('−2', '0', A[0] - 82, Y0 + 30, .85 * a, 'given'); coord('10', '0', B[0] - 66, Y0 + 30, .85 * a, 'given');
  coord('2', '8', P[0] + 72, P[1] - 42, .85 * a, 'given');
  // b0：底辺 AB を光らせ、P を示す
  const bg = S(lt, .6, 1.2) * (1 - S(lt, 7.0, 7.4));
  if (bg > 0) line(A, B, 1, 'w', 3.2, bg, { glow: 12 });
  pulse(P, 1.6, lt, 'given'); pulse(P, 2.6, lt, 'given');
  // b1：12 の半分は 6 → (4, 0)
  const s1 = S(lt, 7.6, 8.6), s2 = S(lt, 9.2, 10.2);
  dimH(Y0 - 24, A[0] + 2, M[0] - 2, s1, 'w', .8);
  dimH(Y0 - 24, M[0] + 2, B[0] - 2, s2, 'w', .8);
  numC('6', (A[0] + M[0]) / 2, Y0 - 52, 30, 'w', .9 * S(lt, 8.4, 8.9));
  numC('6', (M[0] + B[0]) / 2, Y0 - 52, 30, 'w', .9 * S(lt, 10.0, 10.5));
  const mA = S(lt, 10.8, 11.2);
  pt(M, mA, 'answer', 12); pulse(M, 10.8, lt, 'answer');
  coord('4', '0', M[0] - 58, Y0 + 30, mA, 'answer');
  // b2：P と (4, 0) を結ぶと、左右は底辺6・高さ8 の三角形
  const kp = S(lt, 14.0, 15.2);
  line(P, lp(P, M, kp), 1, 'answer', 2.8, 1, { glow: 8 });
  const ka = S(lt, 15.0, 15.6);
  fillPoly([A, M, P], 'w', .17 * ka); fillPoly([M, B, P], 'w', .06 * ka);
  line(P, HF, 1, 'w', 1.6, .5 * ka, { dash: [8, 8] });
  const la = S(lt, 16.2, 16.8), rb = S(lt, 17.2, 17.8);
  text('24 cm²', 364, 700, fM(28), 'w', .95 * la);
  text('24 cm²', 626, 750, fM(28), 'w', .95 * rb);
  // 答えの直線を全部かく（b4 で）
  const full = S(lt, 29.4, 30.4);
  if (full > 0){ line(P, kEnd[0], full, 'answer', 2.8, 1, { glow: 8 }); line(M, kEnd[1], full, 'answer', 2.8, 1, { glow: 8 }); }
  // b3：傾き。P から右へ 2、下へ 8
  const r1 = S(lt, 21.2, 22.0), r2 = S(lt, 22.6, 23.8);
  const K = Q(4, 8);
  arrow(P, K, r1, 'w', 2, .85, 11);
  arrow(K, [M[0], M[1] - 8], r2, 'w', 2, .85, 11);
  text('+2', (P[0] + K[0]) / 2 + 8, P[1] + 26, fM(30), 'w', .9 * S(lt, 21.6, 22.1));
  text('−8', K[0] + 16, 680, fM(30), 'w', .9 * S(lt, 23.4, 23.9), 'left');
  const pl3 = S(lt, 24.2, 24.6) * (1 - S(lt, 27.5, 27.9));
  plate(Math.max(pl3, S(lt, 27.8, 28.2)));
  const Ls = row(1, [j('{傾|かたむ}き'), op('='), fr([n('−8')], [n('2')]), op('='), n('−4', 'answer')], S(lt, 24.4, 25.0) * (1 - S(lt, 27.5, 27.9)), 40);
  // b4：y＝−4x＋b に (4, 0) を代入 → b＝16
  row(0, [v('y'), op('='), n('−4'), v('x'), op('+'), v('b')], S(lt, 28.0, 28.5));
  row(1, [n('0'), op('='), n('−4'), op('×'), n('4', 'answer'), op('+'), v('b')], S(lt, 28.8, 29.3));
  row(2, [v('b'), op('='), n('16')], S(lt, 29.8, 30.3));
  const L4 = row(3, [v('y', 'answer'), op('='), n('−4', 'answer'), v('x', 'answer'), op('+'), n('16', 'answer')], S(lt, 30.8, 31.3), 44);
  answerLine(L4.x0 - 8, L4.x1 + 8, ROW[3] + 32, S(lt, 31.6, 32.4), 'w', .9);
}

/* ----- まとめ ----- */
function drawSum(lt){
  const rows = [
    ['2{直線|ちょくせん}の{交点|こうてん}', '{連立方程式|れんりつほうていしき}を{解|と}く'],
    ['$x${軸|じく}との{交点|こうてん}', '$y$＝0 を{代入|だいにゅう}する'],
    ['{面積|めんせき}を2{等分|とうぶん}する{直線|ちょくせん}', '{底辺|ていへん}のまん{中|なか}の{点|てん}を{通|とお}る']
  ];
  rows.forEach(([h, s], i) => {
    const al = S(lt, .4 + i * 1.2, 1.0 + i * 1.2), y = 360 + i * 190;
    dot([200, y], 7, 'w', .8 * al, 8);
    text(h, 230, y, fJ(40, 500), 'w', .95 * al, 'left');
    text('→ ' + s, 250, y + 64, fJ(32), 'w', .72 * al, 'left');
  });
}

/* ---------- シーンとステップ ---------- */
const SCENE_LIST = [
  { title: '2{直線|ちょくせん}と{三角形|さんかくけい}', legend: false, dur: 11, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: '{直線|ちょくせん}$m$は $y$＝2$x$＋$b$、\n{直線|ちょくせん}$n$は $y$＝−$x$＋10。', f: 'i1', fd: 2.4 },
    { t: 5.8, cap: '$P$は2つの{直線|ちょくせん}の{交点|こうてん}。\n$A$・$B$は、$x${軸|じく}との{交点|こうてん}です。', f: 'i2', fd: 1.6 }] },
  { title: '(1)  $b$の{値|あたい}', legend: true, dur: 19.5, draw: drawS1, beats: [
    { t: 0, cd: .6, cap: '$A$の$x${座標|ざひょう}は−2。$x${軸上|じくじょう}の{点|てん}なので、\n$y${座標|ざひょう}は0。$A$(−2, 0)です。', f: 's1a', fd: 2.0 },
    { t: 6.5, cap: '$A$は{直線|ちょくせん}$m$の{上|うえ}の{点|てん}。\n$y$＝2$x$＋$b$ に、$x$＝−2、$y$＝0 を{代入|だいにゅう}。', f: 's1b', fd: 1.6 },
    { t: 13, cap: '0＝−4＋$b$ なので、$b$＝4。\n{直線|ちょくせん}$m$の{式|しき}は $y$＝2$x$＋4 です。', f: 's1c', fd: 2.0, ul: [2, 2, 2.6, 3.4] }] },
  { title: '(2)  △$ABP$の{面積|めんせき}', legend: true, dur: 41, draw: drawS2, beats: [
    { t: 0, cd: .6, cap: '$P$は2{直線|ちょくせん}の{交点|こうてん}。2つの{式|しき}を\n{連立方程式|れんりつほうていしき}として{解|と}きます。', f: 's2a', fd: 2.4 },
    { t: 6.5, cap: '2$x$＋4＝−$x$＋10 を{解|と}くと、$x$＝2。\n$y$＝8 なので、$P$(2, 8)。', f: 's2b', fd: 1.0 },
    { t: 14, cap: '$B$は$x${軸上|じくじょう}なので、$y$＝0 を{代入|だいにゅう}。\n0＝−$x$＋10 から $x$＝10、$B$(10, 0)。', f: 's2c', fd: .8 },
    { t: 20.5, cap: '$A$(−2, 0)から$B$(10, 0)までの{長|なが}さは、\n10−(−2)＝12。これが{底辺|ていへん}です。', f: 's2d', fd: 1.4 },
    { t: 27, cap: '{高|たか}さは、$P$から$x${軸|じく}までの{長|なが}さ。\n$P$の$y${座標|ざひょう}と{同|おな}じ 8 です。', f: 's2e', fd: 1.4 },
    { t: 33.5, cap: '{面積|めんせき}は {底辺|ていへん}×{高|たか}さ×½。\n12×8×½＝48 で、48cm²。', f: 's2f', fd: .6 }] },
  { title: '(3)  {面積|めんせき}を2{等分|とうぶん}する{直線|ちょくせん}', legend: true, dur: 35, draw: drawS3, beats: [
    { t: 0, cd: .6, cap: '$P$を{通|とお}って、△$ABP$の{面積|めんせき}を2{等分|とうぶん}する{直線|ちょくせん}。\n{底辺|ていへん}$AB$のまん{中|なか}の{点|てん}を{通|とお}ります。', f: 's3a', fd: 2.0 },
    { t: 7, cap: '$AB$＝12 の{半分|はんぶん}は6。\n$A$(−2, 0)から6{進|すす}んで、(4, 0)。', f: 's3b', fd: 1.4, ul: [4, 4, 4.4, 5.2] },
    { t: 13.5, cap: '$P$と(4, 0)を{結|むす}ぶと、どちらも{底辺|ていへん}6・{高|たか}さ8。\n6×8×½＝24 で、{面積|めんせき}は{半分|はんぶん}ずつ。', f: 's3c', fd: 3.0 },
    { t: 20.5, cap: '$P$(2, 8)から(4, 0)へは、{右|みぎ}へ2、{下|した}へ8。\n{傾|かたむ}きは −8÷2＝−4。', f: 's3d', fd: 3.4, ul: [4, 4, 5.0, 5.8] },
    { t: 27.5, cap: '$y$＝−4$x$＋$b$ に(4, 0)を{代入|だいにゅう}して、$b$＝16。\n{答|こた}えは $y$＝−4$x$＋16。', f: 's3e', fd: 3.2, ul: [0, 5, 4.0, 4.8] }] },
  { title: 'まとめ', legend: false, dur: 11, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: '{交点|こうてん}は{連立方程式|れんりつほうていしき}、$x${軸|じく}との{交点|こうてん}は$y$＝0。\n{面積|めんせき}の2{等分|とうぶん}は、{底辺|ていへん}のまん{中|なか}を{通|とお}る。', f: null }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{点|てん}・{式|しき}' }, { c: 'answer', label: '{求|もと}める{式|しき}・{答|こた}え' }],
  poster: 60
});
