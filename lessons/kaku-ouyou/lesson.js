// @title 対頂角・同位角・錯角（応用編）
/*
  数学 中2「対頂角・同位角・錯角 ③ 応用編」（板書2枚 → source/）
  読み取り・検算・構成は notes.md。エンジンの使い方は .claude/skills/whiteboard-lesson-video/references/engine-api.md
*/

// 色の意味：青＝わかっている角（問題に出てくる角）、赤＝求める角（先生の赤ペン）。途中で求めた角は白
Object.assign(RGB, { given: RGB.blue, answer: RGB.red });

/* ---------- 角の図の道具（kaku-kihon / kaku-mondai / kaku-ouyou で共通） ---------- */
// 向きは「数学の角度（度）」：0°＝右、90°＝上、180°＝左、270°＝下（画面は y が下向きなので sin を反転）
const at = (P, d, r) => [P[0] + r * Math.cos(d * DEG), P[1] - r * Math.sin(d * DEG)];
function rotP(P, O, d){ // 点 P を O のまわりに d 度（反時計回り）
  const c = Math.cos(d * DEG), s = Math.sin(d * DEG), dx = P[0] - O[0], dy = P[1] - O[1];
  return [O[0] + dx * c + dy * s, O[1] - dx * s + dy * c];
}
function meet(P, dp, Q, dq){ // P を通る向き dp の直線と、Q を通る向き dq の直線の交点
  const a = [Math.cos(dp * DEG), -Math.sin(dp * DEG)], b = [Math.cos(dq * DEG), -Math.sin(dq * DEG)];
  const den = a[0] * b[1] - a[1] * b[0], t = ((Q[0] - P[0]) * b[1] - (Q[1] - P[1]) * b[0]) / den;
  return [P[0] + a[0] * t, P[1] + a[1] * t];
}
function wedge(C, d0, d1, r, p, c, al = 1, fa = .2, glow = 0, w = 2.4){ // 角：向き d0 → d1 を反時計回りに（弧とうすいぬり）
  if (p <= 0 || al <= 0) return;
  const e = d0 + (d1 - d0) * p;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(C[0], C[1]); ctx.arc(C[0], C[1], r, -d0 * DEG, -e * DEG, true); ctx.closePath();
  ctx.fillStyle = col(c, fa * al); ctx.fill();
  setStroke(c, w, al, null, glow);
  ctx.beginPath(); ctx.arc(C[0], C[1], r, -d0 * DEG, -e * DEG, true); ctx.stroke();
  ctx.restore();
}
function arcA(C, d0, d1, r, p, c = 'w', al = 1, w = 1.8){ angleArc(C, r, -d0 * DEG, -d1 * DEG, p, c, al, w); }
const mid = (C, d0, d1, r) => at(C, (d0 + d1) / 2, r);
function ray(P, d, r0, r1, p = 1, c = 'w', w = 2.2, al = .85, o = {}){ line(at(P, d, r0), at(P, d, r1), p, c, w, al, o); }
function parMark(P, d, c = 'w', al = 1, s = 15, glow = 0){ // 平行のしるし「>」（向き d のほうを指す）
  if (al <= 0) return;
  poly([at(P, d + 150, s), P, at(P, d - 150, s)], 1, c, 2.4, al, { glow });
}
const degT = (s, P, size, c = 'w', al = 1, glow = 0) => text(s, P[0], P[1], fM(size), c, al, 'center', 'middle', glow);
const ANG = (s, c = 'w', o = {}) => [j('∠', c, o), v(s, c, o)];   // 下の数式の「∠x」（∠ は日本語フォントにしかない）

/* ---------- このレッスンで足した道具 ---------- */
function slideTurn(C0, C1, d0, d1, rp, r, c0, c1){ // 錯角：交わる線にそって C0 → C1 へ移しながら、向きを 180°回す
  if (rp <= 0 || rp >= 1) return;
  wedge(lp(C0, C1, rp), d0 + 180 * rp, d1 + 180 * rp, r, 1, mixRGB(c0, c1, rp), 1, .22, 12);
}
function slide(C0, C1, d0, d1, rp, r, c0, c1){ // 同位角：向きはそのまま C0 → C1 へ
  if (rp <= 0 || rp >= 1) return;
  wedge(lp(C0, C1, rp), d0, d1, r, 1, mixRGB(c0, c1, rp), 1, .22, 12);
}
function aux(P, x0, x1, p, al = 1, mk = [], mg = 0){ // 頂点を通る補助の平行線（破線）と「>」
  line([x0, P[1]], [x1, P[1]], p, 'w', 1.8, .6 * al, { dash: [10, 8] });
  mk.forEach(x => parMark([x, P[1]], 0, 'w', .8 * al * S(p, .6, 1), 13, mg));
}
function zGlow(pts, p, al){ if (al > 0) poly(pts, p, 'w', 3.2, .95 * al, { glow: 10 }); }
function plate(P, w, h, al = 1){ if (al <= 0) return; ctx.save(); ctx.fillStyle = col([0, 0, 0], al); ctx.fillRect(P[0] - w / 2, P[1] - h / 2, w, h); ctx.restore(); }
function foldPt(P, P0, d, t){ // 直線（P0, 向き d）で折る：t=0 そのまま、t=1 うら返し
  const u = [Math.cos(d * DEG), -Math.sin(d * DEG)], k = (P[0] - P0[0]) * u[0] + (P[1] - P0[1]) * u[1];
  const f = [P0[0] + u[0] * k, P0[1] + u[1] * k], c = Math.cos(Math.PI * t);
  return [f[0] + (P[0] - f[0]) * c, f[1] + (P[1] - f[1]) * c];
}
function foldWedge(C, d0, d1, r, P0, d, t, c, al = 1, glow = 0){ // 角を折り目で折り返しながら動かす
  if (al <= 0) return;
  const arc = []; for (let i = 0; i <= 24; i++) arc.push(foldPt(at(C, lerp(d0, d1, i / 24), r), P0, d, t));
  const C2 = foldPt(C, P0, d, t);
  fillPoly([C2, ...arc], c, .22 * al);
  poly(arc, 1, c, 2.4, al, { glow });
}

/* ---------- 下の数式 ---------- */
const FORMS = {
  par: () => [v('ℓ'), n(' // '), v('m')],
  a1: () => [n('180'), op('−'), n('130', 'given'), op('='), n('50°')],
  a3: () => [n('112', 'given'), op('−'), n('50'), op('='), n('62°')],
  a4: () => [v('x', 'answer'), op('='), n('62°', 'answer')],
  b0: () => [v('AD'), n(' // '), v('BC')],
  b1: () => [n('180'), op('−'), n('64', 'given'), op('='), n('116°')],
  b2: () => [v('x', 'answer'), op('='), n('116'), op('÷'), n('2'), op('='), n('58°', 'answer')],
  b3: () => [...ANG('BFE'), op('='), n('64', 'given'), op('+'), n('58'), op('='), n('122°')],
  b4: () => [v('y', 'answer'), op('='), n('122°', 'answer')],
  c3: () => [n('79', 'given'), op('−'), n('27', 'given'), op('='), n('52°')],
  c6: () => [v('x', 'answer'), op('='), n('51'), op('+'), n('52'), op('='), n('103°', 'answer')],
};

/* ================= 導入：頂点を通る平行線 ================= */
const I = { LY: 380, MY: 760, V: [640, 570] };
I.A = meet(I.V, 135, [0, I.LY], 0); I.B = meet(I.V, 220, [0, I.MY], 0);
function introFig(lt, al = 1){
  const { LY, MY, V, A, B } = I;
  line([130, LY], [950, LY], S(lt, .1, 1.2), 'w', 2.2, .85 * al);
  line([130, MY], [950, MY], S(lt, .3, 1.4), 'w', 2.2, .85 * al);
  poly([at(A, 135, 90), A, V, B, at(B, 220, 90)], S(lt, .6, 2.0), 'w', 2.2, .85 * al);
  const pm = S(lt, 1.2, 1.6) * al;
  parMark([300, LY], 0, 'w', .9 * pm); parMark([300, MY], 0, 'w', .9 * pm);
  text('ℓ', 980, LY, fI(44), 'w', .9 * pm); text('m', 980, MY - 4, fI(44), 'w', .9 * pm);
  wedge(V, 135, 220, 44, S(lt, 2.0, 2.6), 'w', .8 * al, .12);
  text('?', at(V, 177, 90)[0], at(V, 177, 90)[1], fM(44), 'w', .9 * S(lt, 2.4, 2.9) * al * (1 - S(lt, 5.2, 5.6)));
}
function drawIntro(lt){
  const { V, A, B } = I;
  introFig(lt);
  aux(V, 130, 950, S(lt, 5.4, 6.4), 1, [300]);
  // 上の組（錯角）→ 下の組（錯角）を1つずつ
  zGlow([at(A, 0, 200), A, V, at(V, 180, 200)], S(lt, 6.6, 7.4), 1 - S(lt, 8.6, 8.9));
  wedge(A, 315, 360, 50, S(lt, 6.8, 7.2), 'given');
  slideTurn(A, V, 315, 360, S(lt, 7.3, 8.4), 50, 'given', 'given');
  if (lt >= 8.4) wedge(V, 135, 180, 50, 1, 'given', 1, .22, 3);
  zGlow([at(V, 180, 200), V, B, at(B, 0, 200)], S(lt, 8.9, 9.7), 1);
  wedge(B, 0, 40, 60, S(lt, 9.1, 9.5), 'given');
  slideTurn(B, V, 0, 40, S(lt, 9.6, 10.7), 60, 'given', 'given');
  if (lt >= 10.7) wedge(V, 180, 220, 60, 1, 'given', 1, .22, 3);
}

/* ================= ① 折れ線の角が1つ ================= */
const Q1 = { LY: 360, MY: 720, V: [640, 540] };
Q1.A = meet(Q1.V, 118, [0, Q1.LY], 0); Q1.B = meet(Q1.V, 230, [0, Q1.MY], 0);
function drawQ1(lt){
  const { LY, MY, V, A, B } = Q1;
  line([120, LY], [930, LY], S(lt, .1, 1.2), 'w', 2.2, .85);
  line([120, MY], [930, MY], S(lt, .3, 1.4), 'w', 2.2, .85);
  poly([at(A, 118, 110), A, V, B, at(B, 230, 110)], S(lt, .5, 1.9), 'w', 2.2, .85);
  const la = S(lt, 1.4, 1.9);
  text('ℓ', 960, LY, fI(44), 'w', .9 * la); text('m', 960, MY - 4, fI(44), 'w', .9 * la);
  parMark([260, LY], 0, 'w', .9 * la); parMark([260, MY], 0, 'w', .9 * la);
  // わかっている角 112°・130°、求める x
  const g = S(lt, 2.0, 2.6), dim112 = 1 - .65 * S(lt, 14.2, 14.8);
  wedge(V, 118, 230, 38, g, 'given', dim112, .16);
  degT('112°', [V[0] - 150, V[1] - 2], 34, 'given', g * (1 - S(lt, 14.2, 14.8)));
  wedge(B, 230, 360, 34, g, 'given', 1 - .5 * S(lt, 14.2, 14.8), .16);
  degT('130°', at(B, 300, 78), 34, 'given', g * (1 - .5 * S(lt, 14.2, 14.8)));
  const xa = S(lt, 2.8, 3.3);
  arcA(A, 118, 180, 50, xa, 'w', .8);
  text('x', at(A, 149, 88)[0], at(A, 149, 88)[1], fI(42), 'w', .9 * xa);

  // b1：m は一直線 → 上の角は 180−130＝50°
  const mg = .9 * S(lt, 7.3, 7.8) * (1 - S(lt, 14.1, 14.6));
  if (mg > 0) line([B[0] - 160, MY], [B[0] + 240, MY], 1, 'w', 3, mg, { glow: 10 });
  arcA(B, 0, 180, 70, S(lt, 8.0, 9.2) * (1 - S(lt, 10.8, 11.3)), 'w', .8, 2);
  wedge(B, 0, 50, 50, S(lt, 10.6, 11.4), 'w', 1, .2, 10 * (1 - S(lt, 11.4, 12.4)));
  degT('50°', at(B, 25, 96), 34, 'w', S(lt, 11.2, 11.7));

  // b2：頂点に平行線、錯角で下の部分も 50°
  aux(V, 120, 930, S(lt, 14.4, 15.4), 1, [760]);
  zGlow([at(V, 180, 230), V, B, at(B, 0, 230)], S(lt, 15.8, 17.0), 1 - S(lt, 21.6, 22.1));
  slideTurn(B, V, 0, 50, S(lt, 17.4, 19.0), 50, 'w', 'w');
  if (lt >= 19.0) wedge(V, 180, 230, 50, 1, 'w', 1, .2, 10 * (1 - S(lt, 19.1, 20.1)));
  const l50 = at(V, 205, 100);
  plate(l50, 56, 34, S(lt, 19.1, 19.5)); degT('50°', l50, 32, 'w', S(lt, 19.1, 19.6));

  // b3：112 − 50 ＝ 62°（上の部分）
  const up = S(lt, 22.0, 22.8);
  wedge(V, 118, 180, 58, up, 'w', 1, .2, 10 * (1 - S(lt, 23.0, 24.0)));
  const l62 = at(V, 149, 104);
  degT('62°', l62, 32, 'w', S(lt, 22.6, 23.1));

  // b4：x は 62° と同位角（向きそのままで上へ）
  const fg = S(lt, 29.0, 29.8);
  if (fg > 0){
    line([V[0] - 250, LY], [V[0] + 200, LY], 1, 'w', 3, .9 * fg, { glow: 10 });
    line([V[0] - 250, V[1]], [V[0] + 60, V[1]], 1, 'w', 3, .9 * fg, { glow: 10 });
    line(at(A, 118, 110), V, 1, 'w', 3, .9 * fg, { glow: 10 });
  }
  slide(V, A, 118, 180, S(lt, 30.2, 31.8), 58, 'w', 'answer');
  if (lt >= 31.8) wedge(A, 118, 180, 50, 1, 'answer', 1, .22, 12 * (1 - S(lt, 31.9, 32.9)) + 3);
  degT('62°', [A[0] - 150, A[1] - 44], 36, 'answer', S(lt, 32.0, 32.5));
}

/* ================= ② 長方形を折る ================= */
const R = { A: [140, 400], B: [140, 660], C: [800, 660], D: [800, 400], E: [400, 400] };
R.F = meet(R.E, 238, R.B, 0);
R.A2 = foldPt(R.A, R.E, 238, 1); R.B2 = foldPt(R.B, R.E, 238, 1);
R.X = meet(R.A2, Math.atan2(-(R.B2[1] - R.A2[1]), R.B2[0] - R.A2[0]) / DEG, R.B, 0);   // 折った紙の辺が BC と交わる所
function rectFig(lt, al = 1){
  const { A, B, C, D, E, F, X } = R;
  const draw = S(lt, .1, 1.5), fold = S(lt, 2.2, 4.4);
  poly([E, D, C, X], draw, 'w', 2.2, .85 * al);
  line(X, F, draw, 'w', 2.2, .85 * al * (1 - S(lt, 4.0, 4.4)));
  if (fold <= 0) poly([E, A, B, F], draw, 'w', 2.2, .85 * al);
  else {
    const A1 = foldPt(A, E, 238, fold), B1 = foldPt(B, E, 238, fold);
    fillPoly([E, A1, B1, F], 'w', .05 * al);
    poly([E, A1, B1, F], 1, 'w', 2.2, .85 * al);
    poly([E, A, B, F], 1, 'w', 1.6, .5 * fold * al, { dash: [4, 8] });
    line(E, F, 1, 'w', 2.2, .85 * al);
  }
  const la = S(lt, 1.2, 1.7) * al;
  text('A', A[0] - 28, A[1] - 26, fI(40), 'w', .9 * la);
  text('D', D[0] + 26, D[1] - 26, fI(40), 'w', .9 * la);
  text('B', B[0] - 28, B[1] + 28, fI(40), 'w', .9 * la);
  text('C', C[0] + 26, C[1] + 28, fI(40), 'w', .9 * la);
  const le = S(lt, 4.4, 4.9) * al;
  text('E', E[0] + 26, E[1] - 26, fI(36), 'w', .85 * le);
  text('F', F[0] - 26, F[1] + 26, fI(36), 'w', .85 * le);
}
function drawQ2(lt){
  const { E, F, A2 } = R;
  rectFig(lt);
  // わかっている 64°、求める x・y
  const g = S(lt, 4.8, 5.3);
  wedge(E, 296, 360, 44, g, 'given');
  degT('64°', at(E, 328, 94), 34, 'given', g);
  const qa = S(lt, 5.4, 5.9);
  arcA(E, 180, 238, 44, qa, 'w', .8);
  text('x', at(E, 209, 80)[0], at(E, 209, 80)[1], fI(40), 'w', .9 * qa);
  arcA(F, 296, 418, 30, qa, 'w', .8);
  text('y', at(F, 357, 60)[0], at(F, 357, 60)[1], fI(40), 'w', .9 * qa);

  // b1：AD は一直線。折り返した2つの角をあわせて 180−64＝116°
  const ag = .9 * S(lt, 7.8, 8.3) * (1 - S(lt, 14.3, 14.8));
  if (ag > 0) line([R.A[0], E[1]], R.D, 1, 'w', 3, ag, { glow: 10 });
  const w116 = S(lt, 9.4, 10.6), d116 = 1 - S(lt, 14.8, 15.3);
  wedge(E, 180, 296, 64, w116, 'w', .9 * d116, .12, 10 * (1 - S(lt, 10.8, 11.8)));
  degT('116°', [E[0] - 60, E[1] - 42], 34, 'w', S(lt, 10.4, 10.9) * lerp(1, .45, S(lt, 14.8, 15.3)));

  // b2：折り返した角は等しい → x＝58°
  const fx = S(lt, 15.8, 17.6);
  if (fx > 0) foldWedge(E, 180, 238, 44, E, 238, fx, 'w', 1, 10 * Math.sin(Math.PI * fx));
  wedge(E, 180, 238, 44, S(lt, 15.2, 15.7), 'answer', 1, .22, lt < 18.4 ? 0 : 12 * (1 - S(lt, 18.6, 19.6)) + 3);
  const l58 = at(E, 267, 88);
  degT('58°', l58, 30, 'w', S(lt, 17.6, 18.1));
  degT('58°', [at(E, 209, 80)[0] - 64, at(E, 209, 80)[1]], 34, 'answer', S(lt, 18.6, 19.1));

  // b3：AD // BC、錯角で ∠BFE ＝ 64＋58 ＝ 122°
  const pm = S(lt, 22.3, 22.8);
  parMark([620, E[1]], 0, 'w', .9 * pm, 13, 10 * Math.sin(Math.PI * seg(lt, 22.8, 24.0)));
  parMark([620, F[1]], 0, 'w', .9 * pm, 13, 10 * Math.sin(Math.PI * seg(lt, 22.8, 24.0)));
  zGlow([at(E, 0, 260), E, F, at(F, 180, 97)], S(lt, 23.0, 24.2), 1 - S(lt, 29.6, 30.1));
  const w122 = S(lt, 24.4, 25.0);
  wedge(E, 238, 360, 64, w122, 'w', .8 * (1 - S(lt, 27.6, 28.2)), .12);
  slideTurn(E, F, 238, 360, S(lt, 25.4, 27.4), 34, 'w', 'w');
  if (lt >= 27.4) wedge(F, 58, 180, 34, 1, 'w', 1, .2, 10 * (1 - S(lt, 27.5, 28.5)));
  degT('122°', at(F, 122, 78), 32, 'w', S(lt, 27.4, 27.9));

  // b4：y は ∠BFE を折り返した角 → y＝122°
  const fy = S(lt, 30.4, 32.2);
  if (fy > 0 && fy < 1) foldWedge(F, 58, 180, 34, E, 238, fy, mixRGB('w', 'answer', fy), 1, 10);
  if (lt >= 32.2) wedge(F, 296, 418, 30, 1, 'answer', 1, .22, 12 * (1 - S(lt, 32.3, 33.3)) + 3);
  degT('122°', [F[0] + 132, F[1] + 3], 34, 'answer', S(lt, 32.4, 32.9));
  void A2;
}

/* ================= ③ 頂点が2つ ================= */
const Q3 = { LY: 300, MY: 780, T: [600, 300] };
Q3.V1 = at(Q3.T, 231, 170); Q3.V2 = at(Q3.V1, 308, 190); Q3.Q = meet(Q3.V2, 207, [0, Q3.MY], 0);
function drawQ3(lt){
  const { LY, MY, T, V1, V2, Q } = Q3;
  line([110, LY], [940, LY], S(lt, .1, 1.2), 'w', 2.2, .85);
  line([110, MY], [940, MY], S(lt, .3, 1.4), 'w', 2.2, .85);
  poly([at(T, 51, 90), T, V1, V2, Q, at(Q, 207, 90)], S(lt, .5, 2.0), 'w', 2.2, .85);
  const la = S(lt, 1.4, 1.9);
  text('ℓ', 970, LY, fI(44), 'w', .9 * la); text('m', 970, MY - 4, fI(44), 'w', .9 * la);
  parMark([820, LY], 0, 'w', .9 * la); parMark([820, MY], 0, 'w', .9 * la);
  // わかっている 51°・79°・27°、求める x
  const g = S(lt, 2.0, 2.6);
  wedge(T, 180, 231, 44, g, 'given');
  degT('51°', at(T, 205, 90), 32, 'given', g);
  const d79 = 1 - .6 * S(lt, 21.8, 22.4);
  wedge(V2, 128, 207, 36, g, 'given', d79, .16);
  const l79 = [V2[0] + 30, V2[1] + 62];
  degT('79°', l79, 32, 'given', g * d79);
  wedge(Q, 180, 207, 60, g, 'given');
  degT('27°', at(Q, 193, 112), 32, 'given', g);
  const xa = S(lt, 2.8, 3.3), xd = 1 - S(lt, 42.6, 43.0);
  arcA(V1, 308, 411, 30, xa, 'w', .8 * xd);
  const lx = at(V1, 0, 84);
  plate(lx, 34, 40, S(lt, 7.6, 8.0) * xd);
  text('x', lx[0], lx[1] - 4, fI(40), 'w', .9 * xa * xd);

  // b1：それぞれの頂点を通る平行線
  aux(V1, 110, 940, S(lt, 7.4, 8.6), 1, [820], 10 * Math.sin(Math.PI * seg(lt, 9.0, 10.4)));
  aux(V2, 110, 940, S(lt, 8.2, 9.4), 1, [820], 10 * Math.sin(Math.PI * seg(lt, 9.0, 10.4)));

  // b2：27°は同位角 → 下の頂点の下の部分も 27°
  const fg = .9 * S(lt, 14.4, 15.0) * (1 - S(lt, 21.4, 21.9));
  if (fg > 0){ line(V2, at(Q, 207, 90), 1, 'w', 3, fg, { glow: 10 }); line([110, MY], [Q[0] + 200, MY], 1, 'w', 3, fg, { glow: 10 }); line([110, V2[1]], [V2[0] + 40, V2[1]], 1, 'w', 3, fg, { glow: 10 }); }
  slide(Q, V2, 180, 207, S(lt, 15.6, 17.4), 60, 'given', 'w');
  if (lt >= 17.4) wedge(V2, 180, 207, 60, 1, 'w', 1, .2, 10 * (1 - S(lt, 17.5, 18.5)));
  const l27 = at(V2, 193.5, 108);
  plate(l27, 50, 30, S(lt, 17.4, 17.8)); degT('27°', l27, 30, 'w', S(lt, 17.5, 18.0));

  // b3：79 − 27 ＝ 52°（上の部分）
  wedge(V2, 128, 180, 50, S(lt, 22.2, 23.0), 'w', 1, .2, 10 * (1 - S(lt, 23.2, 24.2)));
  const l52b = at(V2, 154, 104);
  plate(l52b, 50, 30, S(lt, 22.8, 23.1)); degT('52°', l52b, 30, 'w', S(lt, 22.8, 23.3));

  // b4：錯角で、上の頂点の下の部分も 52°
  zGlow([at(V2, 180, 200), V2, V1, at(V1, 0, 200)], S(lt, 28.8, 29.9), 1 - S(lt, 35.4, 35.9));
  slideTurn(V2, V1, 128, 180, S(lt, 30.2, 31.8), 50, 'w', 'w');
  if (lt >= 31.8) wedge(V1, 308, 360, 50, 1, 'w', 1, .2, 10 * (1 - S(lt, 31.9, 32.9)));
  const l52 = at(V1, 334, 104);
  plate(l52, 50, 30, S(lt, 31.8, 32.1)); degT('52°', l52, 30, 'w', S(lt, 31.9, 32.4));

  // b5：51°も錯角 → 上の部分は 51°
  zGlow([at(T, 180, 200), T, V1, at(V1, 0, 200)], S(lt, 35.8, 36.9), 1 - S(lt, 42.4, 42.9));
  slideTurn(T, V1, 180, 231, S(lt, 37.2, 38.8), 50, 'given', 'w');
  if (lt >= 38.8) wedge(V1, 0, 51, 50, 1, 'w', 1, .2, 10 * (1 - S(lt, 38.9, 39.9)));
  const l51 = at(V1, 25.5, 104);
  degT('51°', l51, 30, 'w', S(lt, 38.9, 39.4));

  // b6：x ＝ 51＋52 ＝ 103°
  const xr = S(lt, 42.9, 43.8);
  wedge(V1, 308, 411, 30, xr, 'answer', 1, .25, 12 * (1 - S(lt, 44.0, 45.0)) + 3);
  const lx2 = [V1[0] - 110, V1[1]];
  plate(lx2, 76, 36, S(lt, 43.6, 44.1)); degT('103°', lx2, 34, 'answer', S(lt, 43.6, 44.1));
}

/* ----- まとめ ----- */
function drawSum(lt){
  const a1 = S(lt, .3, 1.0), a2 = S(lt, 1.2, 1.9);
  ctx.save(); ctx.translate(70, 240); ctx.scale(.6, .6); ctx.translate(-130, -300);
  introFig(99, a1); aux(I.V, 130, 950, 1, a1, [300]);
  wedge(I.V, 135, 180, 50, 1, 'given', a1); wedge(I.V, 180, 220, 60, 1, 'given', a1);
  wedge(I.A, 315, 360, 50, 1, 'given', a1); wedge(I.B, 0, 40, 60, 1, 'given', a1);
  ctx.restore();
  ctx.save(); ctx.translate(80, 640); ctx.scale(.6, .6); ctx.translate(-100, -370);
  rectFig(99, a2);
  wedge(R.E, 180, 238, 44, 1, 'answer', a2); wedge(R.E, 238, 296, 44, 1, 'answer', a2);
  ctx.restore();
  text('{頂点|ちょうてん}を{通|とお}る{平行線|へいこうせん}をひく', 810, 400, fJ(30, 500), 'w', .9 * S(lt, 1.8, 2.4));
  text('{折|お}り{返|かえ}した{角|かく}は{等|ひと}しい', 810, 760, fJ(30, 500), 'w', .9 * S(lt, 2.6, 3.2));
}

/* ---------- シーンとステップ ---------- */
const SCENE_LIST = [
  { title: '{折|お}れ{線|せん}と{平行線|へいこうせん}', legend: false, dur: 12, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: '$ℓ$//$m$のとき、{折|お}れ{線|せん}の{角|かく}は\nそのままでは{求|もと}められません。', f: 'par', fd: 1.8 },
    { t: 5.2, cap: '{頂点|ちょうてん}を{通|とお}る{平行線|へいこうせん}をひくと、\n{錯角|さっかく}が{使|つか}えるようになります。', f: 'par' }] },
  { title: '① {折|お}れ{線|せん}の{角|かく}', legend: true, dur: 36, draw: drawQ1, beats: [
    { t: 0, cd: .6, cap: '$ℓ$//$m$。{折|お}れ{線|せん}の{角|かく}は112°、\n$m$との{角|かく}は130°。$x$を{求|もと}めます。', f: 'par', fd: 2.2 },
    { t: 7, cap: '$m$は{一直線|いっちょくせん}なので、\n{上|うえ}の{角|かく}は 180−130＝50°。', f: 'a1', fd: 3.6 },
    { t: 14, cap: '{頂点|ちょうてん}を{通|とお}る、$ℓ$・$m$に{平行|へいこう}な{線|せん}をひくと、\n{錯角|さっかく}で、{下|した}の{部分|ぶぶん}も50°。', f: 'a1' },
    { t: 21.5, cap: '112°のうち、{下|した}が50°。\n{上|うえ}の{部分|ぶぶん}は 112−50＝62°。', f: 'a3', fd: 1.2 },
    { t: 28.5, cap: '$x$は、{上|うえ}の62°と{同位角|どういかく}。\n{平行|へいこう}なので {等|ひと}しく、$x$＝62°。', f: 'a4', fd: 3.6, ul: [2, 2, 4.2, 5.0] }] },
  { title: '② {長方形|ちょうほうけい}を{折|お}る', legend: true, dur: 37, draw: drawQ2, beats: [
    { t: 0, cd: .6, cap: '{長方形|ちょうほうけい}$ABCD$を、$EF$で{折|お}りました。\n64°がわかっています。', f: null },
    { t: 7.5, cap: '$AD$は{一直線|いっちょくせん}。{折|お}り{返|かえ}した2つの{角|かく}で\n180−64＝116°。', f: 'b1', fd: 3.0 },
    { t: 15, cap: '{折|お}り{返|かえ}した{角|かく}は{等|ひと}しいので、\n$x$＝116÷2＝58°。', f: 'b2', fd: 3.0, ul: [6, 6, 3.8, 4.6] },
    { t: 22, cap: '$AD$//$BC$なので、{錯角|さっかく}で\n∠$BFE$＝64＋58＝122°。', f: 'b3', fd: 5.0 },
    { t: 29.5, cap: '$y$は、∠$BFE$を{折|お}り{返|かえ}した{角|かく}。\nだから $y$＝122°。', f: 'b4', fd: 2.8, ul: [2, 2, 3.4, 4.2] }] },
  { title: '③ {頂点|ちょうてん}が2つ', legend: true, dur: 49.5, draw: drawQ3, beats: [
    { t: 0, cd: .6, cap: '$ℓ$//$m$。{折|お}れ{線|せん}の{頂点|ちょうてん}が2つあります。\n$x$の{大|おお}きさを{求|もと}めます。', f: 'par', fd: 2.2 },
    { t: 7, cap: 'それぞれの{頂点|ちょうてん}を{通|とお}って、\n$ℓ$・$m$に{平行|へいこう}な{線|せん}をひきます。', f: 'par' },
    { t: 14, cap: '27°は、{下|した}の{頂点|ちょうてん}の{角|かく}と{同位角|どういかく}。\n{下|した}の{部分|ぶぶん}も27°です。', f: null },
    { t: 21.5, cap: '79°のうち、{下|した}が27°。\n{上|うえ}の{部分|ぶぶん}は 79−27＝52°。', f: 'c3', fd: 1.2 },
    { t: 28.5, cap: '{錯角|さっかく}で、{上|うえ}の{頂点|ちょうてん}の\n{下|した}の{部分|ぶぶん}も52°。', f: 'c3' },
    { t: 35.5, cap: '51°も{錯角|さっかく}で、\n{上|うえ}の{部分|ぶぶん}は51°。', f: 'c3' },
    { t: 42.5, cap: '$x$は、2つの{部分|ぶぶん}をあわせて\n51＋52＝103°。', f: 'c6', fd: 1.4, ul: [6, 6, 2.2, 3.0] }] },
  { title: 'まとめ', legend: true, dur: 12, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: '{折|お}れ{線|せん}の{角|かく}は、{頂点|ちょうてん}に{平行線|へいこうせん}をひいて{錯角|さっかく}。\n{折|お}り{返|かえ}した{角|かく}は、{大|おお}きさが{等|ひと}しい。', f: null }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{角|かく}' }, { c: 'answer', label: '{求|もと}める{角|かく}' }],
  poster: 30
});
