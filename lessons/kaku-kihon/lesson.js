// @title 対頂角・同位角・錯角（基本編）
/*
  数学 中2「対頂角・同位角・錯角 ① 基本編」（板書2枚 → source/）
  読み取り・検算・構成は notes.md。エンジンの使い方は .claude/skills/whiteboard-lesson-video/references/engine-api.md
*/

// 色の意味：青＝わかっている角（問題に出てくる角）、赤＝求める角（先生の赤ペン）
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

/* ---------- 下の数式 ---------- */
const FORMS = {
  q1: () => [j('①'), sp(.3), ...ANG('b', 'given'), j('の{対頂角|たいちょうかく}'), op('='), ...ANG('d', 'answer')],
  q2: () => [j('②'), sp(.3), ...ANG('e', 'given'), j('の{対頂角|たいちょうかく}'), op('='), ...ANG('g', 'answer')],
  q3: () => [j('③'), sp(.3), ...ANG('d', 'given'), j('の{同位角|どういかく}'), op('='), ...ANG('h', 'answer')],
  q4: () => [j('④'), sp(.3), ...ANG('f', 'given'), j('の{同位角|どういかく}'), op('='), ...ANG('b', 'answer')],
  q5: () => [j('⑤'), sp(.3), ...ANG('a', 'given'), j('の{錯角|さっかく}'), op('='), ...ANG('g', 'answer')],
  q6: () => [j('⑥'), sp(.3), ...ANG('h', 'given'), j('の{錯角|さっかく}'), op('='), ...ANG('b', 'answer')],
  par: () => [v('ℓ'), n(' // '), v('m'), sp(.5), j('（{平行|へいこう}）')],
  q7: () => [j('⑦'), op('='), n('30°', 'answer')],
  q9: () => [j('⑨'), op('='), n('30°', 'answer')],
  q8: () => [j('⑧'), op('='), n('180'), op('−'), n('30'), op('='), n('150°', 'answer')],
  sum: () => [j('{一直線|いっちょくせん}の{角|かく}'), op('='), n('180°')]
};

/* ================= 図1：2本の直線に1本の直線が交わる（平行ではない） ================= */
const P1 = [500, 400], P2 = at(P1, 290, 380), LY = P2[1];      // 上の交点・下の交点（下の直線は水平）
// 各交点の4つの角 [交点, 向きの始まり, 終わり]
const AN = {
  a: [P1, 110, 190], b: [P1, 190, 290], c: [P1, 290, 370], d: [P1, 10, 110],
  e: [P2, 110, 180], f: [P2, 180, 290], g: [P2, 290, 360], h: [P2, 0, 110]
};
const POS = { a: '{左上|ひだりうえ}', d: '{右上|みぎうえ}', b: '{左下|ひだりした}', c: '{右下|みぎした}',
              e: '{左上|ひだりうえ}', h: '{右上|みぎうえ}', f: '{左下|ひだりした}', g: '{右下|みぎした}' };
function fig1Lines(pa, pb, pc, al = .85){
  ray(P1, 10, -430, 440, pa, 'w', 2.2, al);
  line([100, LY], [980, LY], pb, 'w', 2.2, al);
  line(at(P1, 110, 170), at(P2, 290, 170), pc, 'w', 2.2, al);
}
function letter(k, al, c = 'w', glow = 0){
  const [C, d0, d1] = AN[k], m = mid(C, d0, d1, 68);
  text(k, m[0], m[1] - 4, fI(42), c, al, 'center', 'middle', glow);
}
function angK(k, p, c, al = 1, glow = 0, r = 44){ const [C, d0, d1] = AN[k]; wedge(C, d0, d1, r, p, c, al, .22, glow); }
function spin(k, O, rp, c0, c1, r = 44){ // 角 k を半回転させながら O へ（対頂角は O＝同じ交点、錯角は O＝もう1つの交点）
  if (rp <= 0 || rp >= 1) return;
  const [C, d0, d1] = AN[k];
  wedge(lp(C, O, rp), d0 + 180 * rp, d1 + 180 * rp, r, 1, mixRGB(c0, c1, rp), 1, .22, 12);
}
function posTag(k, al, c = 'w', r = 128){ const [C, d0, d1] = AN[k], m = mid(C, d0, d1, r); text(POS[k], m[0], m[1], fJ(26, 500), c, al); }
// 図1をそのまま出す（前のシーンからつながる）。hi に入っている文字は色を付けて光らせる
function fig1(lt, hi = {}){
  const a = S(lt, 0, .5);
  fig1Lines(1, 1, 1, .85 * a);
  for (const k of 'abcdefgh') if (!hi[k]) letter(k, .42 * a);
  for (const k in hi) letter(k, hi[k][1] * a, hi[k][0], 12 * hi[k][1]);
}

/* ----- 導入：角が8つ ----- */
function drawIntro(lt){
  fig1Lines(S(lt, .2, 1.4), S(lt, .5, 1.7), S(lt, .8, 2.0));
  const ord = 'adbcehfg';
  for (let i = 0; i < 8; i++){
    const t0 = 2.3 + i * .38, a = S(lt, t0, t0 + .35), pulse = 1 - S(lt, t0 + .3, t0 + 1.1);
    letter(ord[i], .9 * a, 'w', 14 * pulse);
  }
  // b1：交わる点ごとに 左上・右上・左下・右下
  'adbc'.split('').forEach((k, i) => posTag(k, .75 * S(lt, 7.0 + i * .45, 7.4 + i * .45)));
  'ehfg'.split('').forEach(k => posTag(k, .75 * S(lt, 9.2, 9.8)));
  const pr = S(lt, 6.9, 7.3) * (1 - S(lt, 10.4, 11.0));
  if (pr > 0){ ring(P1, 16, 'w', .8 * pr, 2); ring(P2, 16, 'w', .8 * S(lt, 9.0, 9.4) * (1 - S(lt, 10.4, 11.0)), 2); }
}

/* ----- 対頂角 ①② ----- */
function xGlow(C, dA, dB, al){ if (al <= 0) return; ray(C, dA, -190, 190, 1, 'w', 3, al, { glow: 10 }); ray(C, dB, -170, 170, 1, 'w', 3, al, { glow: 10 }); }
function drawTai(lt){
  const d1 = lerp(1, .35, S(lt, 7.0, 7.5));                          // ①は ② のときに暗く
  const hi = {};
  if (lt > .4) hi.b = ['given', S(lt, .4, .9) * d1];
  if (lt > 3.4) hi.d = ['answer', S(lt, 3.4, 3.8) * d1];
  if (lt > 7.4) hi.e = ['given', S(lt, 7.4, 7.9)];
  if (lt > 10.4) hi.g = ['answer', S(lt, 10.4, 10.8)];
  fig1(lt, hi);
  // ① ∠b → ∠d：交わる2本の線を光らせ、∠b を 180°回すと ∠d にぴったり重なる
  xGlow(P1, 10, 110, .9 * S(lt, 1.1, 1.6) * (1 - S(lt, 7.1, 7.6)));
  angK('b', S(lt, .5, 1.0), 'given', d1);
  spin('b', P1, S(lt, 2.0, 3.5), 'given', 'answer');
  if (lt >= 3.5) angK('d', 1, 'answer', d1, 12 * (1 - S(lt, 3.6, 4.6)) + 4);
  // ② ∠e → ∠g
  xGlow(P2, 0, 110, .9 * S(lt, 8.1, 8.6) * 1);
  angK('e', S(lt, 7.5, 8.0), 'given');
  spin('e', P2, S(lt, 9.0, 10.5), 'given', 'answer');
  if (lt >= 10.5) angK('g', 1, 'answer', 1, 12 * (1 - S(lt, 10.6, 11.6)) + 4);
}

/* ----- 同位角 ③④ ----- */
function travel(A, B, t0, t1, lt){ // 1つの点が交わる線にそって A → B
  const f = S(lt, t0, t1);
  if (f > 0 && f < 1) dot(lp(A, B, f), 7, 'w', 1, 14);
}
function drawDoui(lt){
  const d1 = lerp(1, .35, S(lt, 7.5, 8.0));
  const hi = {};
  if (lt > .4) hi.d = ['given', S(lt, .4, .9) * d1];
  if (lt > 3.6) hi.h = ['answer', S(lt, 3.6, 4.0) * d1];
  if (lt > 7.9) hi.f = ['given', S(lt, 7.9, 8.4)];
  if (lt > 11.2) hi.b = ['answer', S(lt, 11.2, 11.6)];
  fig1(lt, hi);
  // ③ 右上 → 右上
  angK('d', S(lt, .5, 1.0), 'given', d1);
  posTag('d', S(lt, 1.2, 1.7) * d1, 'given');
  travel(P1, P2, 2.2, 3.5, lt);
  angK('h', S(lt, 3.5, 4.0), 'answer', d1, 12 * (1 - S(lt, 4.0, 5.0)) + 4);
  posTag('h', S(lt, 3.8, 4.3) * d1, 'answer');
  // ④ 左下 → 左下
  angK('f', S(lt, 8.0, 8.5), 'given');
  posTag('f', S(lt, 8.7, 9.2), 'given');
  travel(P2, P1, 9.7, 11.0, lt);
  angK('b', S(lt, 11.0, 11.5), 'answer', 1, 12 * (1 - S(lt, 11.5, 12.5)) + 4);
  posTag('b', S(lt, 11.3, 11.8), 'answer');
}

/* ----- 錯角 ⑤⑥ ----- */
function drawSak(lt){
  const d1 = lerp(1, .35, S(lt, 7.5, 8.0));
  const hi = {};
  if (lt > .4) hi.a = ['given', S(lt, .4, .9) * d1];
  if (lt > 3.9) hi.g = ['answer', S(lt, 3.9, 4.3) * d1];
  if (lt > 7.9) hi.h = ['given', S(lt, 7.9, 8.4)];
  if (lt > 11.4) hi.b = ['answer', S(lt, 11.4, 11.8)];
  fig1(lt, hi);
  // ⑤ 交わる線をはさんで、ななめ反対側：∠a（上の左上）→ ∠g（下の右下）
  const tg = S(lt, 1.1, 1.6) * (1 - S(lt, 7.6, 8.1));
  line(at(P1, 110, 170), at(P2, 290, 170), 1, 'w', 3.2, .9 * tg, { glow: 10 });
  angK('a', S(lt, .5, 1.0), 'given', d1);
  posTag('a', S(lt, 1.2, 1.7) * (1 - S(lt, 7.5, 8.0)), 'given');
  arrow(mid(P1, 110, 190, 100), mid(P2, 290, 360, 100), S(lt, 2.3, 3.7), 'w', 1.8, .55 * (1 - S(lt, 7.5, 8.0)), 14);
  angK('g', S(lt, 3.7, 4.2), 'answer', d1, 12 * (1 - S(lt, 4.2, 5.2)) + 4);
  posTag('g', S(lt, 4.0, 4.5) * (1 - S(lt, 7.5, 8.0)), 'answer');
  // ⑥ ∠h → ∠b：2つの角をつなぐと Z の形
  angK('h', S(lt, 8.0, 8.5), 'given');
  const zA = S(lt, 8.8, 10.4) * (1 - S(lt, 14.2, 14.8) * .5);
  poly([at(P1, 190, 260), P1, P2, at(P2, 0, 260)], zA, 'w', 3.2, .95, { glow: 10 });
  spin('h', P1, S(lt, 10.0, 11.4), 'given', 'answer');
  angK('b', lt >= 11.4 ? 1 : 0, 'answer', 1, 12 * (1 - S(lt, 11.5, 12.5)) + 4);
}

/* ================= 図2：ℓ // m と 30° ================= */
const PL = [740, 440], PM = at(PL, 210, 640);
const LBL = { n7: at(PL, 15, 112), n9: at(PM, 15, 112), n8: at(PM, 105, 96), g30: at(PL, 195, 125) };
function fig2(lt){
  const la = S(lt, .2, 1.4), ma = S(lt, .4, 1.6), ta = S(lt, .7, 1.9);
  line([70, PL[1]], [930, PL[1]], la, 'w', 2.2, .85);
  line([70, PM[1]], [930, PM[1]], ma, 'w', 2.2, .85);
  line(at(PM, 210, 90), at(PL, 30, 150), ta, 'w', 2.2, .85);
  const lb = S(lt, 1.4, 1.9);
  text('ℓ', 965, PL[1], fI(46), 'w', .9 * lb);
  text('m', 965, PM[1] - 4, fI(46), 'w', .9 * lb);
  const pm = S(lt, 2.2, 2.7), pg = 14 * Math.max(0, Math.sin(Math.PI * seg(lt, 2.7, 4.2)));
  parMark([300, PL[1]], 0, 'w', .9 * pm, 15, pg);
  parMark([560, PM[1]], 0, 'w', .9 * pm, 15, pg);
  // わかっている 30°
  wedge(PL, 180, 210, 64, S(lt, 3.4, 3.9), 'given', 1, .22);
  degT('30°', LBL.g30, 34, 'given', S(lt, 3.6, 4.1));
  // ⑦⑧⑨（まだ答えは出さない）
  const qa = S(lt, 4.4, 5.0);
  arcA(PL, 0, 30, 64, qa, 'w', .7); arcA(PM, 0, 30, 64, qa, 'w', .7); arcA(PM, 30, 180, 52, qa, 'w', .7);
  text('⑦', LBL.n7[0], LBL.n7[1], fJ(34, 500), 'w', .85 * qa);
  text('⑨', LBL.n9[0], LBL.n9[1], fJ(34, 500), 'w', .85 * qa);
  text('⑧', LBL.n8[0], LBL.n8[1], fJ(34, 500), 'w', .85 * qa);
}
function drawPar(lt){
  fig2(lt);
  // ⑦：30°を交点のまわりに 180°回すと ⑦ に重なる（対頂角）
  const xg = .9 * S(lt, 8.0, 8.5) * (1 - S(lt, 15.1, 15.6));
  if (xg > 0){ line([PL[0] - 200, PL[1]], [PL[0] + 190, PL[1]], 1, 'w', 3, xg, { glow: 10 }); ray(PL, 30, -200, 150, 1, 'w', 3, xg, { glow: 10 }); }
  const r7 = S(lt, 8.8, 10.3);
  if (r7 > 0 && r7 < 1) wedge(PL, 180 + 180 * r7, 210 + 180 * r7, 64, 1, mixRGB('given', 'answer', r7), 1, .22, 12);
  if (lt >= 10.3) wedge(PL, 0, 30, 64, 1, 'answer', 1, .22, 12 * (1 - S(lt, 10.4, 11.4)) + 3);
  degT('30°', [LBL.n7[0] + 64, LBL.n7[1]], 34, 'answer', S(lt, 10.5, 11.0));
  // ⑨：Z の形。交わる線にそって下の交点へ移しながら半回転すると ⑨ に重なる（錯角）
  poly([at(PL, 180, 270), PL, PM, at(PM, 0, 270)], S(lt, 15.4, 16.8) * (1 - S(lt, 23.1, 23.6)), 'w', 3.2, .95, { glow: 10 });
  const r9 = S(lt, 17.2, 19.0);
  if (r9 > 0 && r9 < 1) wedge(lp(PL, PM, r9), 180 + 180 * r9, 210 + 180 * r9, 64, 1, mixRGB('given', 'answer', r9), 1, .22, 12);
  const g9 = lt >= 26.0 ? 12 * Math.max(0, Math.sin(Math.PI * seg(lt, 26.0, 27.4))) : 12 * (1 - S(lt, 19.1, 20.1));
  if (lt >= 19.0) wedge(PM, 0, 30, 64, 1, 'answer', 1, .22, g9 + 3);
  degT('30°', [LBL.n9[0] + 62, LBL.n9[1]], 34, 'answer', S(lt, 19.2, 19.7));
  // ⑧：一直線は 180°。180 − 30 ＝ 150°
  const mg = .9 * S(lt, 23.4, 23.9);
  if (mg > 0) line([PM[0] - 150, PM[1]], [PM[0] + 290, PM[1]], 1, 'w', 3, mg, { glow: 10 });
  const sa = S(lt, 24.2, 25.4) * (1 - S(lt, 27.4, 27.9));
  arcA(PM, 0, 180, 92, sa, 'w', .85, 2);
  degT('180°', at(PM, 72, 124), 32, 'w', .9 * S(lt, 25.0, 25.5) * (1 - S(lt, 27.4, 27.9)));
  wedge(PM, 30, 180, 52, S(lt, 27.6, 28.5), 'answer', 1, .22, 12 * (1 - S(lt, 28.6, 29.6)) + 3);
  degT('150°', [LBL.n8[0], LBL.n8[1] - 48], 34, 'answer', S(lt, 28.4, 28.9));
}

/* ----- まとめ ----- */
function drawSum(lt){
  const CX = [200, 540, 880], Y0 = 400, Y1 = 560;
  const a1 = S(lt, .3, 1.0), a2 = S(lt, .8, 1.5), a3 = S(lt, 1.3, 2.0);
  // 対頂角：X
  const C = [CX[0], 480];
  ray(C, 25, -130, 130, a1, 'w', 2, .8); ray(C, 118, -120, 120, a1, 'w', 2, .8);
  wedge(C, 25, 118, 40, a1, 'given'); wedge(C, 205, 298, 40, a1, 'answer');
  // 同位角：同じ位置
  const T = 65, A = [CX[1] + 37, Y0], B = [CX[1] - 37, Y1];
  line([CX[1] - 130, Y0], [CX[1] + 130, Y0], a2, 'w', 2, .8); line([CX[1] - 130, Y1], [CX[1] + 130, Y1], a2, 'w', 2, .8);
  ray(B, T, -60, 250, a2, 'w', 2, .8);
  parMark([CX[1] - 90, Y0], 0, 'w', .7 * a2, 11); parMark([CX[1] - 90, Y1], 0, 'w', .7 * a2, 11);
  wedge(A, 0, T, 40, a2, 'given'); wedge(B, 0, T, 40, a2, 'answer');
  // 錯角：Z
  const A3 = [CX[2] + 37, Y0], B3 = [CX[2] - 37, Y1];
  line([CX[2] - 130, Y0], [CX[2] + 130, Y0], a3, 'w', 2, .8); line([CX[2] - 130, Y1], [CX[2] + 130, Y1], a3, 'w', 2, .8);
  ray(B3, T, -60, 250, a3, 'w', 2, .8);
  parMark([CX[2] + 95, Y0], 0, 'w', .7 * a3, 11); parMark([CX[2] + 95, Y1], 0, 'w', .7 * a3, 11);
  poly([[CX[2] - 130, Y0], A3, B3, [CX[2] + 130, Y1]], S(lt, 2.2, 3.2), 'w', 3, .9, { glow: 8 });
  wedge(A3, 180, 180 + T, 40, a3, 'given'); wedge(B3, 0, T, 40, a3, 'answer');
  // 名前と、いつ等しいか
  [['{対頂角|たいちょうかく}', a1], ['{同位角|どういかく}', a2], ['{錯角|さっかく}', a3]].forEach(([s, a], i) => text(s, CX[i], 680, fJ(34, 500), 'w', .92 * a));
  const e1 = S(lt, 3.4, 4.0), e2 = S(lt, 4.6, 5.2);
  text('いつも{等|ひと}しい', CX[0], 750, fJ(28), 'w', .75 * e1);
  text('{平行|へいこう}なら', CX[1], 750, fJ(28), 'w', .75 * e2);
  text('{平行|へいこう}なら', CX[2], 750, fJ(28), 'w', .75 * e2);
  text('{等|ひと}しい', CX[1], 800, fJ(28), 'w', .75 * e2);
  text('{等|ひと}しい', CX[2], 800, fJ(28), 'w', .75 * e2);
}

/* ---------- シーンとステップ ---------- */
const SCENE_LIST = [
  { title: '{角|かく}の{位置|いち}', legend: false, dur: 13, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: '2{本|ほん}の{直線|ちょくせん}に、1{本|ぽん}の{直線|ちょくせん}が{交|まじ}わると、\n{角|かく}が8つできます。', f: null },
    { t: 6.6, cap: '{交|まじ}わる{点|てん}ごとに、{左上|ひだりうえ}・{右上|みぎうえ}・\n{左下|ひだりした}・{右下|みぎした}の4つの{角|かく}があります。', f: null }] },
  { title: '{対頂角|たいちょうかく}', legend: true, dur: 14.5, draw: drawTai, beats: [
    { t: 0, cd: .4, cap: '{向|む}かい{合|あ}う{角|かく}を、{対頂角|たいちょうかく}といいます。\n∠$b$の{対頂角|たいちょうかく}は、∠$d$。', f: 'q1', fd: 3.6, ul: [6, 7, 4.4, 5.2] },
    { t: 7, cap: '∠$e$の{対頂角|たいちょうかく}は、∠$g$。\n{回|まわ}すとぴったり{重|かさ}なるので、{大|おお}きさは{等|ひと}しい。', f: 'q2', fd: 3.6, ul: [6, 7, 4.4, 5.2] }] },
  { title: '{同位角|どういかく}', legend: true, dur: 15, draw: drawDoui, beats: [
    { t: 0, cd: .4, cap: '{同|おな}じ{位置|いち}にある{角|かく}を、{同位角|どういかく}といいます。\n∠$d$は{右上|みぎうえ}。{下|した}の{右上|みぎうえ}は ∠$h$。', f: 'q3', fd: 3.8, ul: [6, 7, 4.6, 5.4] },
    { t: 7.5, cap: '∠$f$ は{左下|ひだりした}。\n{上|うえ}の{左下|ひだりした}は ∠$b$。これが{同位角|どういかく}です。', f: 'q4', fd: 3.8, ul: [6, 7, 4.6, 5.4] }] },
  { title: '{錯角|さっかく}', legend: true, dur: 15.5, draw: drawSak, beats: [
    { t: 0, cd: .4, cap: '{交|まじ}わる{直線|ちょくせん}をはさんで、ななめ{反対側|はんたいがわ}の{角|かく}が{錯角|さっかく}。\n∠$a$の{錯角|さっかく}は ∠$g$。', f: 'q5', fd: 4.0, ul: [6, 7, 4.6, 5.4] },
    { t: 7.5, cap: '∠$h$の{錯角|さっかく}は ∠$b$。\n2つの{角|かく}をつなぐと、Zの{形|かたち}になります。', f: 'q6', fd: 4.0, ul: [6, 7, 4.6, 5.4] }] },
  { title: '{平行線|へいこうせん}と{角|かく}', legend: true, dur: 32, draw: drawPar, beats: [
    { t: 0, cd: .6, cap: '$ℓ$と$m$は{平行|へいこう}。{平行|へいこう}な2{直線|ちょくせん}では、\n{同位角|どういかく}や{錯角|さっかく}の{大|おお}きさが{等|ひと}しくなります。', f: 'par', fd: 2.2 },
    { t: 7.5, cap: '⑦は、30°の{角|かく}と{向|む}かい{合|あ}う{対頂角|たいちょうかく}。\nだから ⑦＝30°。', f: 'q7', fd: 3.2, ul: [2, 2, 3.6, 4.4] },
    { t: 15, cap: '⑨は、30°の{角|かく}と{錯角|さっかく}（Zの{形|かたち}）。\n$ℓ$//$m$ なので{等|ひと}しく、⑨＝30°。', f: 'q9', fd: 4.4, ul: [2, 2, 4.8, 5.6] },
    { t: 23, cap: '⑧と⑨を{合|あ}わせると、{一直線|いっちょくせん}で180°。\n⑧＝180−30＝150°。', f: 'q8', fd: 5.2, ul: [6, 6, 5.8, 6.6] }] },
  { title: 'まとめ', legend: true, dur: 13, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: '{対頂角|たいちょうかく}は、いつも{等|ひと}しい。\n{同位角|どういかく}・{錯角|さっかく}は、{平行|へいこう}なら{等|ひと}しい。', f: 'sum', fd: 5.4 }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'given', label: 'わかっている{角|かく}' }, { c: 'answer', label: '{求|もと}める{角|かく}' }],
  poster: 12
});
