// @title 対頂角・同位角・錯角（問題編）
/*
  数学 中2「対頂角・同位角・錯角 ② 問題編」（板書2枚 → source/）
  読み取り・検算・構成は notes.md。エンジンの使い方は .claude/skills/whiteboard-lesson-video/references/engine-api.md
*/

// 色の意味：青＝わかっている角（問題の角と、とちゅうでわかった角）、赤＝求める角（先生の赤ペン）
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

/* ---------- このレッスンの小さな道具 ---------- */
const hold = (lt, t0, t1, te) => S(lt, t0, t1) * (1 - S(lt, te, te + .5));   // t0〜t1 で出て、te から消える
const tag = (s, P, c, al) => text(s, P[0], P[1], fJ(26, 500), c, al);      // 「左上」などの位置のことば
const lbl = (s, P, c = 'w', al = 1, glow = 0) => text(s, P[0], P[1] - 4, fI(42), c, al, 'center', 'middle', glow);
function glowL(a, b, al){ if (al > 0) line(a, b, 1, 'w', 3.2, .9 * al, { glow: 10 }); }
function travel(A, B, t0, t1, lt){ const f = S(lt, t0, t1); if (f > 0 && f < 1) dot(lp(A, B, f), 7, 'w', 1, 14); }
// 対頂角：C のまわりに 180°回す
function spinV(C, d0, d1, r, rp){
  if (rp <= 0 || rp >= 1) return;
  wedge(C, d0 + 180 * rp, d1 + 180 * rp, r, 1, mixRGB('given', 'answer', rp), 1, .22, 12);
}
// 錯角：交わる線にそって C → C2 へ移しながら向きを 180°変える（c1 は行き先の色）
function slideZ(C, C2, d0, d1, r, rp, c1 = 'given'){
  if (rp <= 0 || rp >= 1) return;
  wedge(lp(C, C2, rp), d0 + 180 * rp, d1 + 180 * rp, r, 1, c1 === 'given' ? 'given' : mixRGB('given', c1, rp), 1, .22, 12);
}
function lm(y, x0, x1, p, name, al = 1){ // 平行な直線 ℓ / m と名前
  line([x0, y], [x1, y], p, 'w', 2.2, .85 * al);
  text(name, x1 + 36, y - (name === 'm' ? 4 : 0), fI(46), 'w', .9 * S(p, .7, 1) * al);
}

/* ---------- 下の数式 ---------- */
const FORMS = {
  rule: () => [j('{平行|へいこう}なら'), sp(.3), j('{同位角|どういかく}'), op('='), j('{錯角|さっかく}'), sp(.6), j('{一直線|いっちょくせん}'), op('='), n('180°')],
  a0: () => [v('ℓ'), n(' // '), v('m')],
  a1: () => [j('{同位角|どういかく}'), ar('r', 1.2), n('70°', 'given')],
  a2: () => [...ANG('x', 'answer'), op('='), n('70°', 'answer')],
  a3: () => [j('{同位角|どういかく}'), ar('r', 1.2), n('55°', 'given')],
  a4: () => [...ANG('y', 'answer'), op('='), n('180'), op('−'), n('55'), op('='), n('125°', 'answer')],
  b1: () => [...ANG('x', 'answer'), op('='), n('41°', 'answer')],
  b2: () => [...ANG('y'), j('の{同位角|どういかく}'), op('='), ...ANG('x'), op('+'), n('80°')],
  b3: () => [...ANG('y', 'answer'), op('='), n('41'), op('+'), n('80'), op('='), n('121°', 'answer')],
  c1: () => [...ANG('y', 'answer'), op('='), n('76°', 'answer')],
  c2: () => [n('180'), op('−'), n('('), n('76'), op('+'), n('23'), n(')'), op('='), n('180'), op('−'), n('99'), op('='), n('81°')],
  c3: () => [...ANG('x', 'answer'), op('='), n('81°', 'answer')],
  d1: () => [n('180'), op('−'), n('137'), op('='), n('43°', 'given')],
  d2: () => [j('{頂点|ちょうてん}を{通|とお}る{平行|へいこう}な{直線|ちょくせん}')],
  d3: () => [j('{錯角|さっかく}'), ar('r', 1.2), n('43°', 'given')],
  d4: () => [j('{錯角|さっかく}'), ar('r', 1.2), n('29°', 'given')],
  d5: () => [...ANG('x', 'answer'), op('='), n('43'), op('+'), n('29'), op('='), n('72°', 'answer')],
  sum: () => [j('{等|ひと}しい{角|かく}にうつして、たす・ひく')]
};

/* ----- 導入：使うきまり（ふりかえり） ----- */
function drawIntro(lt){
  const cell = [[290, 420], [790, 420], [290, 740], [790, 740]];
  const A = i => S(lt, .3 + i * .9, .9 + i * .9);
  // 対頂角
  let [cx, cy] = cell[0], a = A(0);
  ray([cx, cy], 25, -130, 130, a, 'w', 2, .8); ray([cx, cy], 118, -115, 115, a, 'w', 2, .8);
  wedge([cx, cy], 25, 118, 36, a, 'given'); wedge([cx, cy], 205, 298, 36, a, 'answer');
  // 同位角・錯角
  [1, 2].forEach(i => {
    const [x, y] = cell[i], b = A(i), T = [x - 28, y + 60], U = [x + 28, y - 60];
    line([x - 150, y - 60], [x + 150, y - 60], b, 'w', 2, .8); line([x - 150, y + 60], [x + 150, y + 60], b, 'w', 2, .8);
    ray(T, 65, -55, 190, b, 'w', 2, .8);
    parMark([x + (i === 1 ? -100 : 105), y - 60], 0, 'w', .7 * b, 11); parMark([x + (i === 1 ? -100 : 105), y + 60], 0, 'w', .7 * b, 11);
    if (i === 1){ wedge(U, 0, 65, 34, b, 'given'); wedge(T, 0, 65, 34, b, 'answer'); }
    else { poly([[x - 150, y - 60], U, T, [x + 150, y + 60]], S(lt, 2.4, 3.2), 'w', 3, .9, { glow: 8 }); wedge(U, 180, 245, 34, b, 'given'); wedge(T, 0, 65, 34, b, 'answer'); }
  });
  // 一直線は 180°
  [cx, cy] = cell[3]; a = A(3);
  const C = [cx, cy + 30];
  line([cx - 150, C[1]], [cx + 150, C[1]], a, 'w', 2, .8); ray(C, 55, 0, 120, a, 'w', 2, .8);
  wedge(C, 0, 55, 34, a, 'given'); wedge(C, 55, 180, 26, a, 'answer');
  arcA(C, 0, 180, 70, S(lt, 3.4, 4.4), 'w', .6, 1.6);
  degT('180°', [cx, C[1] - 96], 30, 'w', .85 * S(lt, 4.0, 4.5));
  ['{対頂角|たいちょうかく}', '{同位角|どういかく}', '{錯角|さっかく}', '{一直線|いっちょくせん}'].forEach((s, i) =>
    text(s, cell[i][0], cell[i][1] + 122, fJ(32, 500), 'w', .92 * A(i)));
}

/* ----- ① 同位角と対頂角、一直線 ----- */
const A1 = [340, 420], B1 = meet(A1, 70, [0, 720], 0), C1 = [680, 420], D1 = meet(C1, 125, [0, 720], 0);
function drawQ1(lt){
  const dx = lerp(1, .38, S(lt, 20.0, 20.6));                    // ∠x の問いは ∠y のときに暗く
  lm(420, 100, 950, S(lt, .2, 1.4), 'ℓ'); lm(720, 100, 950, S(lt, .4, 1.6), 'm');
  const tA = S(lt, .7, 1.9);
  line(at(B1, 250, 110), at(A1, 70, 150), tA, 'w', 2.2, .85);
  line(at(D1, 305, 110), at(C1, 125, 150), tA, 'w', 2.2, .85);
  const pm = S(lt, 1.8, 2.3);
  parMark([500, 420], 0, 'w', .9 * pm); parMark([560, 720], 0, 'w', .9 * pm);
  const ga = S(lt, 2.2, 2.8), qa = S(lt, 3.0, 3.6);
  wedge(A1, 180, 250, 40, ga, 'given', dx); degT('70°', at(A1, 215, 88), 32, 'given', ga * dx);
  wedge(D1, 125, 180, 40, ga, 'given'); degT('55°', at(D1, 152.5, 88), 32, 'given', ga);
  arcA(B1, 0, 70, 44, qa, 'w', .7 * dx); lbl('x', at(B1, 35, 84), 'w', .9 * qa * dx);
  arcA(C1, 0, 125, 40, qa, 'w', .7); lbl('y', at(C1, 62, 78), 'w', .9 * qa);
  // b1：70° は ℓ の左下 → 同位角の m の左下も 70°
  glowL(at(B1, 250, 110), at(A1, 70, 150), hold(lt, 6.9, 7.4, 13.5));
  tag('{左下|ひだりした}', at(A1, 215, 150), 'given', S(lt, 7.4, 7.9) * dx);
  travel(A1, B1, 8.2, 9.5, lt);
  wedge(B1, 180, 250, 40, S(lt, 9.5, 10.0), 'given', dx, .22, 10 * (1 - S(lt, 10.0, 11.0)));
  degT('70°', at(B1, 215, 80), 30, 'given', S(lt, 9.7, 10.2) * dx);
  tag('{左下|ひだりした}', at(B1, 215, 140), 'given', S(lt, 9.9, 10.4) * dx);
  // b2：∠x は対頂角
  const xg = hold(lt, 13.9, 14.4, 20.0);
  glowL([B1[0] - 130, 720], [B1[0] + 170, 720], xg); glowL(at(B1, 250, 110), at(B1, 70, 170), xg);
  spinV(B1, 180, 250, 40, S(lt, 15.0, 16.5));
  if (lt >= 16.5) wedge(B1, 0, 70, 44, 1, 'answer', dx, .22, 12 * (1 - S(lt, 16.6, 17.6)) + 3);
  if (lt >= 16.5) lbl('x', at(B1, 35, 84), 'answer', dx);
  degT('70°', [at(B1, 35, 84)[0] + 58, at(B1, 35, 84)[1]], 32, 'answer', S(lt, 16.8, 17.3) * dx);
  // b3：55° は m の左上 → 同位角の ℓ の左上も 55°
  glowL(at(D1, 305, 110), at(C1, 125, 150), hold(lt, 20.4, 20.9, 27.0));
  tag('{左上|ひだりうえ}', at(D1, 152.5, 150), 'given', S(lt, 20.9, 21.4));
  travel(D1, C1, 21.7, 23.0, lt);
  const g55 = lt >= 28.6 ? 10 * Math.max(0, Math.sin(Math.PI * seg(lt, 28.6, 29.8))) : 10 * (1 - S(lt, 23.5, 24.5));
  wedge(C1, 125, 180, 40, S(lt, 23.0, 23.5), 'given', 1, .22, g55);
  degT('55°', at(C1, 152.5, 84), 30, 'given', S(lt, 23.2, 23.7));
  tag('{左上|ひだりうえ}', at(C1, 152.5, 142), 'given', S(lt, 23.4, 23.9));
  // b4：一直線で 180°、∠y＝180−55
  glowL([C1[0] - 200, 420], [C1[0] + 240, 420], S(lt, 27.4, 27.9));
  const sa = S(lt, 27.9, 29.0) * (1 - S(lt, 30.6, 31.1));
  arcA(C1, 0, 180, 104, sa, 'w', .8, 2);
  degT('180°', at(C1, 90, 132), 30, 'w', .9 * S(lt, 28.6, 29.1) * (1 - S(lt, 30.6, 31.1)));
  wedge(C1, 0, 125, 40, S(lt, 30.8, 31.6), 'answer', 1, .22, 12 * (1 - S(lt, 31.7, 32.7)) + 3);
  if (lt >= 30.8) lbl('y', at(C1, 62, 78), 'answer', S(lt, 30.8, 31.2));
  degT('125°', at(C1, 30, 128), 32, 'answer', S(lt, 31.4, 31.9));
}

/* ----- ② 同位角を2回 ----- */
const P2 = [460, 420], Q2 = meet(P2, 59, [0, 780], 0), R2 = meet(P2, 139, [0, 780], 0);
function drawQ2(lt){
  const dx = lerp(1, .38, S(lt, 14.0, 14.6));
  lm(420, 100, 950, S(lt, .2, 1.4), 'ℓ'); lm(780, 100, 950, S(lt, .4, 1.6), 'm');
  const tA = S(lt, .7, 1.9);
  line(at(Q2, 239, 90), at(P2, 59, 150), tA, 'w', 2.2, .85);
  line(at(R2, 319, 80), at(P2, 139, 150), tA, 'w', 2.2, .85);
  const pm = S(lt, 1.8, 2.3);
  parMark([760, 420], 0, 'w', .9 * pm); parMark([560, 780], 0, 'w', .9 * pm);
  const ga = S(lt, 2.2, 2.8), qa = S(lt, 3.0, 3.6);
  wedge(P2, 59, 139, 44, ga, 'given'); degT('80°', at(P2, 99, 84), 30, 'given', ga);
  wedge(R2, 139, 180, 48, ga, 'given', dx); degT('41°', at(R2, 159.5, 92), 30, 'given', ga * dx);
  arcA(P2, 139, 180, 60, qa, 'w', .7); lbl('x', at(P2, 159.5, 98), 'w', .9 * qa);
  arcA(Q2, 59, 180, 44, qa, 'w', .7); lbl('y', at(Q2, 120, 80), 'w', .9 * qa);
  // b1：41° と ∠x は右の直線の同位角（どちらも左上）
  glowL(at(R2, 319, 80), at(P2, 139, 150), hold(lt, 7.0, 7.5, 14.0));
  tag('{左上|ひだりうえ}', at(R2, 159.5, 160), 'given', S(lt, 7.5, 8.0) * dx);
  travel(R2, P2, 8.3, 9.8, lt);
  const gx = lt >= 21.3 ? 10 * Math.max(0, Math.sin(Math.PI * seg(lt, 21.3, 22.6))) : 12 * (1 - S(lt, 10.0, 11.0));
  if (lt >= 9.8) wedge(P2, 139, 180, 60, 1, 'answer', 1, .22, gx + 3);
  if (lt >= 9.8) lbl('x', at(P2, 159.5, 98), 'answer', S(lt, 9.8, 10.2));
  degT('41°', [298, 384], 32, 'answer', S(lt, 10.2, 10.7));
  // b2：∠y の同位角は上の点の左上（左の直線と ℓ の間）
  glowL(at(Q2, 239, 90), at(P2, 59, 150), hold(lt, 14.4, 14.9, 21.0));
  tag('{左上|ひだりうえ}', at(Q2, 166, 122), 'w', .85 * S(lt, 14.9, 15.4));
  travel(Q2, P2, 15.6, 17.0, lt);
  const big = S(lt, 17.0, 18.2);
  if (big > 0){ arcA(P2, 59, 180, 118, big, 'w', .9, 2.6); fillWedgeSoft(P2, 59, 180, 118, .07 * big); }
  // b3：∠y ＝ 41＋80
  wedge(Q2, 59, 180, 44, S(lt, 23.2, 24.0), 'answer', 1, .22, 12 * (1 - S(lt, 24.1, 25.1)) + 3);
  if (lt >= 23.2) lbl('y', at(Q2, 120, 80), 'answer', S(lt, 23.2, 23.6));
  degT('121°', at(Q2, 108, 150), 32, 'answer', S(lt, 23.8, 24.3));
}
function fillWedgeSoft(C, d0, d1, r, al){ if (al <= 0) return; ctx.save(); ctx.beginPath(); ctx.moveTo(C[0], C[1]); ctx.arc(C[0], C[1], r, -d0 * DEG, -d1 * DEG, true); ctx.closePath(); ctx.fillStyle = col('w', al); ctx.fill(); ctx.restore(); }

/* ----- ③ 3本の直線が1点で交わる ----- */
const O3 = [540, 580];
function drawQ3(lt){
  const pa = S(lt, .2, 1.4);
  line([130, O3[1]], [950, O3[1]], pa, 'w', 2.2, .85);
  ray(O3, 104, -290, 300, S(lt, .5, 1.7), 'w', 2.2, .85);
  ray(O3, 23, -330, 330, S(lt, .8, 2.0), 'w', 2.2, .85);
  const ga = S(lt, 2.2, 2.8), qa = S(lt, 3.0, 3.6);
  const d76 = lerp(1, .5, S(lt, 13.5, 14.0));
  wedge(O3, 104, 180, 56, ga, 'given', d76); degT('76°', at(O3, 142, 100), 32, 'given', ga);
  wedge(O3, 0, 23, 92, ga, 'given', d76); degT('23°', at(O3, 11.5, 150), 32, 'given', ga);
  arcA(O3, 284, 360, 56, qa, 'w', .7); lbl('y', at(O3, 322, 100), 'w', .9 * qa);
  arcA(O3, 203, 284, 66, qa, 'w', .7); lbl('x', at(O3, 243.5, 106), 'w', .9 * qa);
  // b1：∠y は 76° の対頂角
  const xg = hold(lt, 6.9, 7.4, 13.5);
  glowL([O3[0] - 330, O3[1]], [O3[0] + 330, O3[1]], xg); glowL(at(O3, 284, 290), at(O3, 104, 300), xg);
  spinV(O3, 104, 180, 56, S(lt, 8.0, 9.6));
  if (lt >= 9.6) wedge(O3, 284, 360, 56, 1, 'answer', 1, .22, 12 * (1 - S(lt, 9.7, 10.7)) + 3);
  if (lt >= 9.6) lbl('y', at(O3, 322, 100), 'answer', 1);
  degT('76°', [at(O3, 322, 100)[0] + 56, at(O3, 322, 100)[1]], 32, 'answer', S(lt, 9.9, 10.4));
  // b2：横の直線の上は 180°。残りは 81°
  glowL([O3[0] - 330, O3[1]], [O3[0] + 330, O3[1]], hold(lt, 13.9, 14.4, 21.0));
  arcA(O3, 0, 180, 190, S(lt, 14.4, 15.6), 'w', .75, 2);
  degT('180°', at(O3, 68, 222), 30, 'w', .9 * S(lt, 15.2, 15.7));
  const q = S(lt, 16.6, 17.4);
  fillWedgeSoft(O3, 23, 104, 120, .1 * q); arcA(O3, 23, 104, 120, q, 'w', .95, 2.6);
  degT(lt < 18.4 ? '?' : '81°', at(O3, 63.5, 150), 34, 'w', .95 * (lt < 18.4 ? q * (1 - S(lt, 18.0, 18.4)) : S(lt, 18.4, 18.9)));
  // b3：∠x は 81° の対頂角
  const xg2 = hold(lt, 21.4, 21.9, 30);
  glowL(at(O3, 203, 330), at(O3, 23, 330), xg2); glowL(at(O3, 284, 290), at(O3, 104, 300), xg2);
  spinV(O3, 23, 104, 66, S(lt, 22.4, 24.0));
  if (lt >= 24.0) wedge(O3, 203, 284, 66, 1, 'answer', 1, .22, 12 * (1 - S(lt, 24.1, 25.1)) + 3);
  if (lt >= 24.0) lbl('x', at(O3, 243.5, 106), 'answer', 1);
  degT('81°', at(O3, 243.5, 162), 32, 'answer', S(lt, 24.3, 24.8));
}

/* ----- ④ 折れ線：頂点を通る平行線 ----- */
const V4 = [320, 600], K4 = meet(V4, 43, [0, 340], 0), J4 = meet(V4, 331, [0, 820], 0);
function drawQ4(lt){
  lm(340, 110, 940, S(lt, .2, 1.4), 'ℓ'); lm(820, 110, 940, S(lt, .4, 1.6), 'm');
  poly([K4, V4, J4], S(lt, .8, 2.0), 'w', 2.2, .85);
  const pm = S(lt, 1.8, 2.3);
  parMark([250, 340], 0, 'w', .9 * pm); parMark([300, 820], 0, 'w', .9 * pm);
  const ga = S(lt, 2.2, 2.8), qa = S(lt, 3.0, 3.6), fin = lerp(1, .45, S(lt, 34.0, 34.6));
  wedge(K4, 223, 360, 40, ga, 'given'); degT('137°', at(K4, 291.5, 88), 32, 'given', ga);
  wedge(J4, 151, 180, 90, ga, 'given'); degT('29°', at(J4, 165.5, 150), 32, 'given', ga);
  arcA(V4, -29, 43, 50, qa, 'w', .7);
  const xl = at(V4, 18, 86);
  if (lt < 34.6) lbl('x', xl, 'w', .9 * qa);
  // b1：137° のとなりは 180−137＝43°
  glowL([K4[0] - 300, 340], [K4[0] + 300, 340], hold(lt, 6.9, 7.4, 13.5));
  arcA(K4, 180, 360, 64, S(lt, 7.6, 8.8) * (1 - S(lt, 11.4, 11.9)), 'w', .8, 2);
  wedge(K4, 180, 223, 50, S(lt, 9.6, 10.4), 'given', 1, .22, 10 * (1 - S(lt, 10.4, 11.4)));
  degT('43°', at(K4, 201.5, 96), 32, 'given', S(lt, 9.9, 10.4));
  // b2：頂点を通って ℓ・m に平行な直線（補助線）
  const aux = S(lt, 14.0, 15.4);
  line([110, 600], [940, 600], aux, 'w', 1.8, .7, { dash: [10, 8] });
  const am = S(lt, 15.4, 15.9), apg = 12 * Math.max(0, Math.sin(Math.PI * seg(lt, 15.9, 17.4)));
  parMark([200, 600], 0, 'w', .9 * am, 15, apg);
  parMark([250, 340], 0, 'w', .9 * am, 15, apg); parMark([300, 820], 0, 'w', .9 * am, 15, apg);
  // b3：上の Z（錯角）で 43°
  poly([at(K4, 180, 240), K4, V4, at(V4, 0, 300)], S(lt, 20.4, 21.8) * (1 - S(lt, 27.0, 27.5) * .75), 'w', 3.2, .95, { glow: 10 });
  slideZ(K4, V4, 180, 223, 50, S(lt, 22.2, 23.8));
  wedge(V4, 0, 43, 50, lt >= 23.8 ? 1 : 0, 'given', fin, .22, 12 * (1 - S(lt, 23.9, 24.9)));
  degT('43°', at(V4, 21.5, 158), 32, 'given', S(lt, 24.0, 24.5) * (1 - S(lt, 34.0, 34.6)));
  // b4：下の Z（錯角）で 29°
  poly([at(J4, 180, 300), J4, V4, at(V4, 0, 300)], S(lt, 27.4, 28.8) * (1 - S(lt, 34.0, 34.5) * .75), 'w', 3.2, .95, { glow: 10 });
  slideZ(J4, V4, 151, 180, 50, S(lt, 29.2, 30.8));
  wedge(V4, 331, 360, 50, lt >= 30.8 ? 1 : 0, 'given', fin, .22, 12 * (1 - S(lt, 30.9, 31.9)));
  degT('29°', at(V4, 345.5, 158), 32, 'given', S(lt, 31.0, 31.5) * (1 - S(lt, 34.0, 34.6)));
  // b5：∠x ＝ 43＋29＝72°
  wedge(V4, -29, 43, 54, S(lt, 34.6, 35.6), 'answer', 1, .22, 12 * (1 - S(lt, 35.7, 36.7)) + 3);
  if (lt >= 34.6) lbl('x', xl, 'answer', 1);
  degT('72°', at(V4, 14, 138), 34, 'answer', S(lt, 35.8, 36.3));
}

/* ----- まとめ ----- */
function drawSum(lt){
  const rows = [
    ['{等|ひと}しい{角|かく}にうつす', '{対頂角|たいちょうかく}・{同位角|どういかく}・{錯角|さっかく}（{平行|へいこう}のとき）'],
    ['{一直線|いっちょくせん}は180°', 'となりの{角|かく}は 180 からひく'],
    ['{折|お}れ{線|せん}には{平行|へいこう}な{線|せん}をひく', '{錯角|さっかく}が2つできて、たすだけ']
  ];
  rows.forEach(([h, s], i) => {
    const a = S(lt, .4 + i * 1.2, 1.0 + i * 1.2), y = 360 + i * 200;
    dot([250, y], 7, 'w', .8 * a, 8);
    text(h, 280, y, fJ(40, 500), 'w', .95 * a, 'left');
    text(s, 280, y + 64, fJ(28), 'w', .65 * a, 'left');
  });
}

/* ---------- シーンとステップ ---------- */
const SCENE_LIST = [
  { title: '{使|つか}うきまり', legend: false, dur: 10, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: '{使|つか}うのは、{対頂角|たいちょうかく}・{同位角|どういかく}・{錯角|さっかく}と、\n「{一直線|いっちょくせん}は180°」のきまり。', f: 'rule', fd: 4.6 }] },
  { title: '{問題|もんだい}①', legend: true, dur: 34.5, draw: drawQ1, beats: [
    { t: 0, cd: .6, cap: '$ℓ$//$m$ のとき、∠$x$と∠$y$を{求|もと}めます。\nまずは ∠$x$ から。', f: 'a0', fd: 2.0 },
    { t: 6.5, cap: '70°は、$ℓ$との{交点|こうてん}の{左下|ひだりした}。\n{同位角|どういかく}の、$m$の{左下|ひだりした}も70°。', f: 'a1', fd: 3.4 },
    { t: 13.5, cap: '∠$x$は、その70°と{向|む}かい{合|あ}う{対頂角|たいちょうかく}。\nだから ∠$x$＝70°。', f: 'a2', fd: 3.2, ul: [3, 3, 3.8, 4.6] },
    { t: 20, cap: '55°は、$m$との{交点|こうてん}の{左上|ひだりうえ}。\n{同位角|どういかく}の、$ℓ$の{左上|ひだりうえ}も55°。', f: 'a3', fd: 3.2 },
    { t: 27, cap: '∠$y$と55°を{合|あ}わせると、{一直線|いっちょくせん}で180°。\n∠$y$＝180−55＝125°。', f: 'a4', fd: 3.6, ul: [7, 7, 4.8, 5.6] }] },
  { title: '{問題|もんだい}②', legend: true, dur: 28, draw: drawQ2, beats: [
    { t: 0, cd: .6, cap: '2{本|ほん}の{直線|ちょくせん}が、$ℓ$の{上|うえ}の{点|てん}で{交|まじ}わっています。\n80°と41°から、∠$x$と∠$y$を{求|もと}めます。', f: 'a0', fd: 2.0 },
    { t: 6.5, cap: '41°と∠$x$は、どちらも{左上|ひだりうえ}の{同位角|どういかく}。\nだから ∠$x$＝41°。', f: 'b1', fd: 3.6, ul: [3, 3, 4.2, 5.0] },
    { t: 14, cap: '∠$y$の{同位角|どういかく}は、{上|うえ}の{点|てん}の{左上|ひだりうえ}。\n{左|ひだり}の{直線|ちょくせん}と$ℓ$の{間|あいだ}の{角|かく}です。', f: 'b2', fd: 4.0 },
    { t: 21, cap: 'その{角|かく}は、∠$x$と80°を{合|あ}わせた{大|おお}きさ。\n∠$y$＝41＋80＝121°。', f: 'b3', fd: 1.8, ul: [7, 7, 3.4, 4.2] }] },
  { title: '{問題|もんだい}③', legend: true, dur: 28, draw: drawQ3, beats: [
    { t: 0, cd: .6, cap: '3{本|ぼん}の{直線|ちょくせん}が、1つの{点|てん}で{交|まじ}わっています。\n76°と23°から、∠$x$と∠$y$を{求|もと}めます。', f: null },
    { t: 6.5, cap: '∠$y$は、76°と{向|む}かい{合|あ}う{対頂角|たいちょうかく}。\nだから ∠$y$＝76°。', f: 'c1', fd: 3.4, ul: [3, 3, 4.0, 4.8] },
    { t: 13.5, cap: '{横|よこ}の{直線|ちょくせん}の{上|うえ}は、{合|あ}わせて180°。\n76＋23＝99 なので、{残|のこ}りは180−99＝81°。', f: 'c2', fd: 3.2 },
    { t: 21, cap: '∠$x$は、その81°と{向|む}かい{合|あ}う{対頂角|たいちょうかく}。\nだから ∠$x$＝81°。', f: 'c3', fd: 3.2, ul: [3, 3, 3.8, 4.6] }] },
  { title: '{問題|もんだい}④', legend: true, dur: 41, draw: drawQ4, beats: [
    { t: 0, cd: .6, cap: '$ℓ$//$m$。{折|お}れ{線|せん}のところの∠$x$を{求|もと}めます。\nわかっているのは137°と29°。', f: 'a0', fd: 2.0 },
    { t: 6.5, cap: '137°ととなりの{角|かく}で、{一直線|いっちょくせん}の180°。\n180−137＝43°。', f: 'd1', fd: 3.2 },
    { t: 13.5, cap: '∠$x$の{頂点|ちょうてん}を{通|とお}って、\n$ℓ$・$m$に{平行|へいこう}な{直線|ちょくせん}をひきます。', f: 'd2', fd: 1.4 },
    { t: 20, cap: '{上|うえ}の2{本|ほん}の{平行線|へいこうせん}で、Zの{形|かたち}の{錯角|さっかく}。\n∠$x$の{上|うえ}の{部分|ぶぶん}は43°。', f: 'd3', fd: 3.8 },
    { t: 27, cap: '{下|した}の2{本|ほん}の{平行線|へいこうせん}でも、{錯角|さっかく}。\n∠$x$の{下|した}の{部分|ぶぶん}は29°。', f: 'd4', fd: 3.8 },
    { t: 34, cap: '∠$x$は、この2つを{合|あ}わせた{角|かく}。\n∠$x$＝43＋29＝72°。', f: 'd5', fd: 1.6, ul: [7, 7, 3.0, 3.8] }] },
  { title: 'まとめ', legend: false, dur: 11, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: '{等|ひと}しい{角|かく}にうつしてから、たしたり ひいたり。\n{折|お}れ{線|せん}は、{平行|へいこう}な{線|せん}をひくのがコツ。', f: null }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{角|かく}' }, { c: 'answer', label: '{求|もと}める{角|かく}' }],
  poster: 20
});
