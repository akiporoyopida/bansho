// @title 縮図の利用・縮尺
/*
  見本レッスン：算数 小6「縮図の利用・縮尺」（板書2枚 → source/）
  構成と読み取りは notes.md。エンジンの使い方は .claude/skills/whiteboard-lesson-video/references/engine-api.md
*/

// この単元の色の意味（凡例にも出す）：赤＝縮図の長さ、青＝実際の長さ（先生の赤ペン・青ペンに合わせた）
Object.assign(RGB, { map: RGB.red, real: RGB.blue });

/* ---------- bottom formulas ---------- */
const FORMS = {
  pairs: (p = 99) => {
    const g = i => { const a = S(p, [3.15, 4.35, 5.55][i], [3.55, 4.75, 5.95][i]);
      return [v(['A', 'B', 'C'][i], 'real', { a }), ar('r', 1.0, { a }), v(['A′', 'B′', 'C′'][i], 'map', { a })]; };
    return [...g(0), sp(1.1), ...g(1), sp(1.1), ...g(2)];
  },
  def: () => [j('{縮尺|しゅくしゃく}'), op('='), fr([j('{縮図上|しゅくずじょう}の{長|なが}さ', 'map')], [j('{実際|じっさい}の{長|なが}さ', 'real')])],
  s1a: () => [n('4', 'map'), u('cm', 'map'), ar('lr', 1.2), n('100', 'real'), u('m', 'real')],
  s1b: () => [n('1'), u('m'), op('='), n('100'), u('cm')],
  s1d: () => [fr([n('1', 'map')], [n('2500', 'real')]), ar('lr', 1.2), n('1', 'map'), op(':'), n('2500', 'real')],
  s1e: () => [n('1', 'map'), u('cm', 'map'), op('×'), n('2500'), op('='), n('2500', 'real'), u('cm', 'real'), op('='), n('25', 'real'), u('m', 'real')],
  s2a: () => [j('{縮尺|しゅくしゃく}'), op('='), fr([n('1')], [n('4000')])],
  s2b: () => [n('800', 'real'), u('m', 'real'), op('='), n('80000', 'real'), u('cm', 'real')],
  s2c: () => [j('{実際|じっさい}の{長|なが}さ', 'real'), op('÷'), n('4000'), op('='), j('{縮図|しゅくず}の{長|なが}さ', 'map')],
  s2d: () => [j('{縮図|しゅくず}の{長|なが}さ', 'map'), op('×'), n('4000'), op('='), j('{実際|じっさい}の{長|なが}さ', 'real')],
  s3a: () => [j('{校舎|こうしゃ}の{高|たか}さ'), op('='), n('?')],
  s3b: () => [j('{縮尺|しゅくしゃく}'), op('='), fr([n('1')], [n('200')])],
  s3c: () => [n('1000', 'real'), u('cm', 'real'), op('÷'), n('200'), op('='), n('5', 'map'), u('cm', 'map')],
  s3d: () => [j('{底辺|ていへん}'), n('5', 'map'), u('cm', 'map'), sp(.9), j('{角度|かくど}'), n('50°')],
  s3f: () => [j('たての{長|なが}さ'), op('='), j('{約|やく}', 'map'), n('6', 'map'), u('cm', 'map')],
  s3g: () => [n('6', 'map'), op('×'), n('200'), op('='), n('1200', 'real'), u('cm', 'real'), op('='), n('12', 'real'), u('m', 'real')],
  s3h: () => [n('12', 'real'), u('m', 'real'), op('+'), n('1.4', 'real'), u('m', 'real'), op('='), n('13.4', 'real'), u('m', 'real')],
  sum: () => [n('1'), u('m'), op('='), n('100'), u('cm')]
};

/* ================= scenes ================= */

/* ----- intro ----- */
function drawIntro(lt){
  const O = [150, 715], k = .38;
  const V = [[520, 860], [960, 860], [520, 600]];                                  // A, B, C  (実際)
  const V2 = V.map(P => [O[0] + k * (P[0] - O[0]), O[1] + k * (P[1] - O[1])]);   // A′, B′, C′ (縮図)
  const NM = ['A', 'B', 'C'], NM2 = ['A′', 'B′', 'C′'];
  const OFF = [[-30, 30], [30, 30], [-28, -24]], OFF2 = [[-28, 28], [26, 28], [-28, -22]];
  const T0 = [2.2, 3.4, 4.6];                                                     // one vertex at a time
  fillPoly(V, 'real', .07 * S(lt, 1.0, 1.8));
  poly([V[2], V[0], V[1], V[2]], S(lt, .1, 1.4), 'real', 2.4, .95, { glow: 5 });
  dot(O, 3.5, 'w', .6 * S(lt, 1.0, 1.4), 6);
  const pr = S(lt, 1.2, 2.0);
  V.forEach(P => line(O, P, pr, 'w', 1.2, .22, { dash: [3, 9] }));
  V.forEach((P, i) => {
    const Q = V2[i], t0 = T0[i];
    const act = S(lt, t0 - .3, t0) * (1 - S(lt, t0 + 1.3, t0 + 1.8));             // this pair is in focus
    text(NM[i], P[0] + OFF[i][0], P[1] + OFF[i][1], fI(40), 'real', .95 * S(lt, 1.0, 1.6), 'center', 'middle', 14 * act);
    if (act > 0){
      line(P, Q, 1, 'w', 2, .5 * act);
      ring(P, 10 + 10 * S(lt, t0 - .3, t0 + .4), 'real', .85 * act * (1 - S(lt, t0 + .1, t0 + .6)), 2);
    }
    const mv = S(lt, t0, t0 + 1.0);
    if (mv > 0 && mv < 1) dot(lp(P, Q, mv), 7, mixRGB('real', 'map', mv), 1, 14);
    const arr = S(lt, t0 + .9, t0 + 1.3);
    if (arr > 0){
      dot(Q, 5, 'map', arr, 10);
      ring(Q, lerp(6, 28, arr), 'map', (1 - arr) * .9, 2);
      text(NM2[i], Q[0] + OFF2[i][0], Q[1] + OFF2[i][1], fI(36), 'map', arr, 'center', 'middle', 14 * act);
    }
  });
  fillPoly(V2, 'map', .10 * S(lt, 6.2, 6.8));
  poly([V2[2], V2[0], V2[1], V2[2]], S(lt, 5.9, 6.7), 'map', 2.4, 1, { glow: 10 });
  const lb = S(lt, 6.5, 7.1);
  text('{実際|じっさい}', 740, 906, fJ(30, 500), 'real', lb);
  text('{縮図|しゅくず}', (V2[0][0] + V2[1][0]) / 2, V2[0][1] + 62, fJ(30, 500), 'map', lb);
  // corresponding sides, one pair at a time: AB↔A′B′, BC↔B′C′, CA↔C′A′
  [[0, 1], [1, 2], [2, 0]].forEach(([a, b], i) => {
    const t0 = 7.9 + i * 1.0, h = S(lt, t0, t0 + .3) * (1 - S(lt, t0 + .7, t0 + 1.0));
    if (h > 0){ line(V[a], V[b], 1, 'real', 5, h, { glow: 16 }); line(V2[a], V2[b], 1, 'map', 5, h, { glow: 16 }); }
  });
}

/* ----- scene 1 : 縮尺を分数と比で ----- */
const S1 = { A: [300, 500], B: [780, 500], C: [300, 290] };
function drawS1(lt){
  const { A, B, C } = S1;
  const pT = S(lt, .2, 1.6);
  poly([A, C, B], pT, 'w', 2, .85);
  line(A, B, pT, 'map', 2.8, 1, { glow: 8 });
  const pl = S(lt, 1.4, 2.0);
  text('A', A[0] - 30, A[1] + 30, fI(42), 'w', .9 * pl);
  text('B', B[0] + 30, B[1] + 30, fI(42), 'w', .9 * pl);
  text('C', C[0] - 30, C[1] - 22, fI(42), 'w', .9 * pl);
  rightMark(A, [1, 0], [0, -1], 20, .55 * pl);

  const q4 = qtyLayout('4', 'cm', 540, 552, 44);
  drawQty(q4, 'map', S(lt, 2.0, 2.6) * (1 - S(lt, 25.0, 25.4)));

  /* b1–b2 : 100 m → 10000 cm */
  const q100 = qtyLayout('100', 'm', 540, 690, 64);
  const out3 = 1 - S(lt, 11.5, 12.0);
  const a100 = S(lt, 2.8, 3.4) * out3;
  text('ABの{実際|じっさい}の{長|なが}さ', 540, 634, fJ(26), 'real', .85 * a100);
  drawQty(q100, 'real', a100);
  handCircle(q100.ux + q100.wu / 2, 690 + 64 * .11, q100.wu / 2 + 16, 32, S(lt, 5.9, 6.7), 'w', .85 * out3);
  arrow([540, 736], [540, 792], S(lt, 6.8, 7.4), 'w', 2, .75 * out3, 12);
  text('×100', 562, 764, fM(30), 'w', .75 * S(lt, 7.0, 7.4) * out3, 'left');
  const t10k = [n('100', 'real'), n('00', 'real'), u('cm', 'real')];
  if (lt < 11.5){
    const g = 14 * (1 - S(lt, 8.6, 9.6));
    formula([n('100', 'real'), n('00', 'real', { g }), u('cm', 'real')], 540, 840, 64, S(lt, 7.4, 8.0));
  }

  /* b3–b4 : fraction → ratio */
  if (lt >= 11.5){
    const FX = 380, BY = 760, NY = 708, DY = 814;
    const ff = S(lt, 11.7, 12.7), fo = 1 - S(lt, 19.5, 20.1);
    const L10 = layoutF(t10k, 540, 64);
    const src10 = (L10.boxes[0].x0 + L10.boxes[1].x1) / 2, src4 = q4.nx + q4.wn / 2;
    formula([n('100', 'real', { a: 0 }), n('00', 'real', { a: 0 }), u('cm', 'real', { a: 1 - S(lt, 11.5, 11.9) })], 540, 840, 64, 1);
    if (fo > 0){
      numC('4', lerp(src4, FX, ff), lerp(552, NY, ff), lerp(44, 76, ff), 'map', fo);
      numC('10000', lerp(src10, FX, ff), lerp(840, DY, ff), lerp(64, 76, ff), 'real', fo);
      const bp = S(lt, 12.5, 13.0), bw = 230;
      line([FX - bw / 2 * bp, BY], [FX + bw / 2 * bp, BY], 1, 'w', 2.2, .9 * fo, { cap: 'butt' });
      const tg = S(lt, 12.8, 13.3) * fo;
      text('{縮図|しゅくず}', FX - 140, NY, fJ(28, 500), 'map', tg, 'right');
      text('{実際|じっさい}', FX - 140, DY, fJ(28, 500), 'real', tg, 'right');
      const d4 = S(lt, 13.8, 14.4) * fo;
      text('÷4', FX + 34, NY - 24, fM(30), 'w', .72 * d4, 'left');
      text('÷4', FX + 106, DY + 26, fM(30), 'w', .72 * d4, 'left');
      opC('=', 552, BY, 76, 'w', S(lt, 14.6, 15.0) * fo);
    }
    // result 1/2500 → 1 : 2500
    const ra = S(lt, 15.0, 15.8), rdy = (1 - ra) * 10, rx = lerp(722, 540, S(lt, 19.8, 20.6)), mo = S(lt, 20.9, 22.1);
    ctx.font = fM(80);
    const w1 = ctx.measureText('1').width, wc = ctx.measureText(':').width, w2 = ctx.measureText('2500').width, g = 80 * .32;
    const tot = w1 + g + wc + g + w2, x0 = 540 - tot / 2;
    const c1 = x0 + w1 / 2, cc = x0 + w1 + g + wc / 2, c2 = x0 + w1 + g + wc + g + w2 / 2;
    const b5 = S(lt, 25.0, 25.6);
    ctx.save();
    ctx.translate(540, lerp(760, 832, b5)); ctx.scale(lerp(1, .7, b5), lerp(1, .7, b5)); ctx.translate(-540, -760);
    const ral = lerp(1, .5, b5);
    numC('1', lerp(rx, c1, mo), lerp(NY + rdy, BY, mo), lerp(76, 80, mo), 'map', ra * ral);
    numC('2500', lerp(rx, c2, mo), lerp(DY + rdy, BY, mo), lerp(76, 80, mo), 'real', ra * ral);
    const rbw = 210 * ra * (1 - mo);
    if (rbw > 1) line([rx - rbw / 2, BY], [rx + rbw / 2, BY], 1, 'w', 2.2, .9 * (1 - mo), { cap: 'butt' });
    opC(':', cc, BY, 80, 'w', S(lt, 21.6, 22.2) * ral);
    ctx.restore();
    answerLine(rx - 100, rx + 100, 872, S(lt, 16.2, 17.0), 'w', .9 * (1 - S(lt, 19.5, 19.9)));
    answerLine(x0 - 14, x0 + tot + 14, 814, S(lt, 22.4, 23.2), 'w', .9 * (1 - S(lt, 25.0, 25.4)));
  }

  /* b5 : 1 cm = 25 m */
  if (lt >= 25){
    const tk = S(lt, 25.4, 26.0);
    for (let i = 0; i <= 4; i++){ const x = 300 + 120 * i; line([x, 488], [x, 512], tk, 'w', 1.8, .85); }
    let cnt = 0;
    for (let i = 0; i < 4; i++){
      const t0 = 26.2 + i * 1.1, si = S(lt, t0, t0 + .5);
      if (si <= 0) continue;
      if (lt >= t0 + .2) cnt = i + 1;
      const x0 = 300 + 120 * i, pulse = 1 - S(lt, t0 + .4, t0 + 1.3);
      line([x0 + 5, 500], [x0 + 115, 500], 1, 'map', 3.4, si, { glow: 6 + 16 * pulse });
      drawQty(qtyLayout('1', 'cm', x0 + 60, 543, 28), 'map', si);
      drawQty(qtyLayout('25', 'm', x0 + 60, 586, 32), 'real', S(lt, t0 + .2, t0 + .7));
    }
    if (cnt > 0){
      const ts = 26.2 + (cnt - 1) * 1.1 + .2, fa = S(lt, ts, ts + .35);
      drawQty(qtyLayout(String(25 * cnt), 'm', 540, 690 + (1 - fa) * 10, 64), 'real', fa);
      if (cnt > 1 && fa < 1) drawQty(qtyLayout(String(25 * (cnt - 1)), 'm', 540, 690 - fa * 10, 64), 'real', 1 - fa);
    }
    answerLine(540 - 92, 540 + 92, 740, S(lt, 30.4, 31.2), 'w', .9);
  }
}

/* ----- scene 2 : 縮図と実際のきょり ----- */
const S2 = { G: [220, 470], H: [860, 470], St: [802.4, 546.8] };
function drawS2(lt){
  const { G, H, St } = S2;
  const ga = S(lt, 0, .8);
  grid(124, 342, 956, 630, 32, .075 * ga);
  if (ga > 0){ ctx.save(); ctx.strokeStyle = col('w', .2 * ga); ctx.lineWidth = 1.2; roundRect(124, 342, 832, 288, 8); ctx.stroke(); ctx.restore(); }

  const redGH = S(lt, 15.1, 15.5);
  line(G, H, S(lt, 1.0, 2.2), 'w', 2.2, .9 * (1 - redGH));
  if (redGH > 0) line(G, H, 1, 'map', 2.8, redGH, { glow: 8 });
  line(H, St, S(lt, 1.6, 2.2), 'map', 2.8, 1, { glow: 8 });
  line(St, G, S(lt, 1.8, 2.8), 'w', 1.6, .4);
  const pg = eback(seg(lt, .4, .9)), ph = eback(seg(lt, .6, 1.1)), ps = eback(seg(lt, .8, 1.3));
  const gl = 9 + 3 * Math.sin(NOW * 2.2);
  dot(G, 7 * pg, 'w', 1, gl); dot(H, 7 * ph, 'w', 1, gl); dot(St, 7 * ps, 'w', 1, gl);
  text('{学校|がっこう}', G[0] - 22, G[1], fJ(32, 500), 'w', .9 * clamp01(pg), 'right');
  text('{家|いえ}', H[0] + 22, H[1], fJ(32, 500), 'w', .9 * clamp01(ph), 'left');
  text('{駅|えき}', St[0], St[1] + 56, fJ(32, 500), 'w', .9 * clamp01(ps));
  drawQty(qtyLayout('3', 'cm', 888, 530, 36), 'map', S(lt, 2.2, 2.8));
  formula([j('{縮尺|しゅくしゃく}'), fr([n('1')], [n('4000')])], 224, 386, 34, .85 * S(lt, 2.4, 3.0));

  /* b1–b2 : 800 m → 80000 cm */
  text('{実際|じっさい}の{道|みち}のり', 540, 388, fJ(24), 'real', .85 * S(lt, 3.0, 3.6) * (1 - S(lt, 12.0, 12.4)));
  const q800 = qtyLayout('800', 'm', 540, 430, 48), o800 = 1 - S(lt, 7.4, 7.9);
  drawQty(q800, 'real', S(lt, 3.0, 3.6) * o800);
  handCircle(q800.ux + q800.wu / 2, 430 + 48 * .11, q800.wu / 2 + 13, 26, S(lt, 6.3, 7.1), 'w', .85 * o800);
  const g80 = 14 * (1 - S(lt, 8.6, 9.6));
  formula([n('800', 'real'), n('00', 'real', { g: g80 }), u('cm', 'real')], 540, 430, 48, S(lt, 7.6, 8.2) * (1 - S(lt, 14.6, 15.1)));
  drawQty(qtyLayout('20', 'cm', 540, 430, 48), 'map', S(lt, 15.0, 15.6), 10 * (1 - S(lt, 15.6, 16.6)));

  /* b3 : real line shrinks ÷4000 */
  if (lt >= 12.2 && lt < 15.6){
    const ap = S(lt, 12.2, 12.9), q = S(lt, 13.2, 15.4);
    const hl = Math.exp(lerp(Math.log(900), Math.log(320), q)) * ap;
    const c = mixRGB('real', 'map', S(lt, 14.4, 15.4));
    const L0 = [540 - hl, 470], L1 = [540 + hl, 470];
    line(L0, L1, 1, c, 3.2, 1, { glow: 9 });
    tickV(L0, 18, c, ap); tickV(L1, 18, c, ap);
  }
  formula([op('÷'), n('4000')], 540, 386, 40, .85 * S(lt, 13.2, 13.7) * (1 - S(lt, 15.8, 16.3)));
  const ca = S(lt, 15.6, 16.2) * (1 - S(lt, 23.0, 23.5));
  if (ca > 0){
    const ea = S(lt, 18.7, 19.3);
    const L = formula([n('80'), n('000', 'w', { st: S(lt, 16.8, 17.6) }), op('÷'), n('4'), n('000', 'w', { st: S(lt, 17.7, 18.5) }),
      op('=', { a: ea }), n('20', 'map', { a: ea }), u('cm', 'map', { a: ea })], 540, 760, 66, ca);
    answerLine(L.boxes[6].x0 - 6, L.boxes[7].x1 + 6, 814, S(lt, 19.5, 20.3), 'w', .9 * ca);
  }

  /* b4 : 3 cm ×4000 */
  if (lt >= 23.4){
    const lf = S(lt, 23.4, 24.6), q = S(lt, 24.9, 27.0);
    let A0 = lp(St, [492, 720], lf), A1 = lp(H, [588, 720], lf);
    if (q > 0){ const hl = Math.exp(lerp(Math.log(48), Math.log(900), q)); A0 = [540 - hl, 720]; A1 = [540 + hl, 720]; }
    const c = mixRGB('map', 'real', S(lt, 25.2, 26.6)), fl = 1 - .45 * S(lt, 28.0, 28.6);
    line(A0, A1, 1, c, 3.2, fl, { glow: 9 });
    if (lf >= 1){ tickV(A0, 18, c, fl); tickV(A1, 18, c, fl); }
    drawQty(qtyLayout('3', 'cm', lerp(888, 540, lf), lerp(530, 682, lf), 36), 'map', 1 - S(lt, 25.0, 25.4));
    formula([op('×'), n('4000')], 540, 638, 40, .85 * S(lt, 24.9, 25.4) * (1 - S(lt, 27.6, 28.0)));
    formula([n('12000', 'real'), u('cm', 'real')], 540, 682, 44, S(lt, 26.8, 27.4));
    const c4 = S(lt, 27.4, 28.0);
    if (c4 > 0){
      const L = formula([n('3', 'map'), op('×'), n('4000'), op('='), n('12000', 'real'), u('cm', 'real')], 540, 800, 58, c4);
      const L2 = formulaL([op('='), n('120', 'real'), u('m', 'real')], L.boxes[3].x0, 878, 58, S(lt, 28.4, 29.0));
      answerLine(L2.boxes[1].x0 - 6, L2.boxes[2].x1 + 6, 926, S(lt, 29.2, 30.0), 'w', .9);
    }
    drawQty(qtyLayout('120', 'm', 888, 572, 36), 'real', S(lt, 30.0, 30.6));
  }
}

/* ----- scene 3 : 校舎の高さ ----- */
const S3 = { E: [160, 838.4], F: [600, 838.4], T: [600, 314], GY: 900, P: [430, 820], Q: [750, 820] };
S3.R = [750, 820 - 5 * Math.tan(50 * DEG) * 64];
S3.RAY = [430 + 560 * Math.cos(50 * DEG), 820 - 560 * Math.sin(50 * DEG)];
function drawPerson(a){
  if (a <= 0) return;
  const x = 160;
  ctx.save(); ctx.strokeStyle = col('w', a); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.arc(x, 838.4, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, 849); ctx.lineTo(x, 874); ctx.moveTo(x, 874); ctx.lineTo(x - 9, 900); ctx.moveTo(x, 874); ctx.lineTo(x + 9, 900);
  ctx.moveTo(x, 856); ctx.lineTo(x - 11, 868); ctx.moveTo(x, 856); ctx.lineTo(x + 11, 868);
  ctx.stroke(); ctx.restore();
}
function drawWindows(a){
  if (a <= 0) return;
  ctx.save(); ctx.strokeStyle = col('w', a); ctx.lineWidth = 1.4;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++){
    const x = 628 + c * 64, y = 350 + r * 104, w = 42, h = 36;
    ctx.strokeRect(x, y, w, h); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
  }
  ctx.restore();
}
function drawRealScene(lt, dimF){
  const { E, F, T, GY } = S3;
  line([60, GY], [1020, GY], S(lt, 0, .8), 'w', 1.6, .55 * dimF);
  poly([[600, GY], [600, 314], [760, 314], [760, GY]], S(lt, .4, 1.5), 'w', 2, .85 * dimF);
  drawWindows(S(lt, 1.1, 1.7) * .38 * dimF);
  drawPerson(S(lt, 1.2, 1.8) * .95 * dimF);
  line(E, F, S(lt, 1.8, 2.4), 'w', 1.6, .55, { dash: [2, 8] });

  const morph = lt >= 37.9 && lt < 39.5, after = lt >= 39.5;
  const tv = morph ? 0 : after ? 1 : S(lt, 6.3, 7.0);
  fillPoly([E, F, T], 'w', .06 * (after ? S(lt, 39.5, 40.0) : tv));
  if (tv > 0){
    line(E, F, 1, 'real', 2.6, tv, { glow: 6 });
    line(F, T, 1, after ? 'real' : 'w', after ? 2.8 : 2.2, tv, { glow: after ? 8 : 0 });
    rightMark(F, [-1, 0], [0, -1], 18, .7 * tv);
  }
  if (!morph) line(E, T, S(lt, 2.2, 3.0), 'w', 1.9, .9, { dash: [10, 8], flow: NOW * 20 });
  angleArc(E, 64, 0, -50 * DEG, S(lt, 2.8, 3.3), 'w', .85);
  text('50°', 245, 799, fM(34), 'w', .9 * S(lt, 3.0, 3.4));
  const a14 = S(lt, 3.2, 3.8);
  dimV(128, GY, E[1], a14, 'real', .9);
  const q14 = qtyLayout('1.4', 'm', 0, 869, 34); q14.nx += 116 - q14.x1; q14.ux += 116 - q14.x1;
  drawQty(q14, 'real', a14);
  const a10 = S(lt, 3.4, 4.0);
  dimH(914, E[0], F[0], a10, 'real', .9);
  drawQty(qtyLayout('10', 'm', 380, 942, 36), 'real', a10);
  numC('?', 568, 580, 60, 'w', S(lt, 3.8, 4.3) * (1 - S(lt, 37.5, 38.0)));
  const a12 = S(lt, 39.6, 40.2);
  if (a12 > 0){ const toks = [j('{約|やく}', 'real'), n('12', 'real'), u('m', 'real')], w = seqW(toks, 46); formula(toks, 585 - w / 2, 580, 46, a12); }

  /* b8 : add the eye height */
  const hp = S(lt, 43.8, 44.6);
  if (hp > 0){
    const pz = S(lt, 45.9, 47.3), pulse = 1 + 1.4 * Math.max(0, Math.sin(Math.PI * 4 * pz));
    line([600, 838.4], [600, GY], hp, 'real', 3.4, 1, { glow: 8 * pulse });
    const q = qtyLayout('1.4', 'm', 0, 869, 34); q.nx += 585 - q.x1; q.ux += 585 - q.x1;
    drawQty(q, 'real', S(lt, 44.2, 44.8));
    const bk = S(lt, 44.6, 45.6);
    line([790, GY], [790, 314], bk, 'real', 2, .9);
    const ta = S(lt, 45.2, 45.8);
    for (const y of [314, 838.4, GY]) line([780, y], [800, y], 1, 'real', 2, .9 * ta);
    if (pz > 0) line([790, 838.4], [790, GY], 1, 'real', 3.4, Math.sin(Math.PI * pz), { glow: 10 * pulse });
    drawQty(qtyLayout('12', 'm', 0, 576, 34), 'real', 0);
    const q12 = qtyLayout('12', 'm', 0, 576, 34); q12.nx += 810 - q12.x0; q12.ux += 810 - q12.x0; drawQty(q12, 'real', ta);
    const qb = qtyLayout('1.4', 'm', 0, 869, 34); qb.nx += 810 - qb.x0; qb.ux += 810 - qb.x0; drawQty(qb, 'real', ta);
    const tt = S(lt, 47.0, 47.8);
    if (tt > 0){
      const L = formula([j('{約|やく}', 'real'), n('13.4', 'real'), u('m', 'real')], 790, 258, 50, tt);
      answerLine(L.x0 - 4, L.x1 + 4, 292, S(lt, 47.8, 48.6), 'w', .9);
    }
  }
}
function drawPaper(lt){
  if (lt < 13.0 || lt >= 39.5) return;
  const { P, Q, R, RAY, E, F, T } = S3;
  const out = 1 - S(lt, 37.5, 38.0);
  grid(366, 308, 942, 884, 64, .07 * S(lt, 13.2, 14.0) * out);

  /* b3 : 10 m → 1000 cm → 5 cm */
  const fo = 1 - S(lt, 19.0, 19.5);
  const chain = [
    n('10', 'real', { a: S(lt, 13.8, 14.2) * fo }), u('m', 'real', { a: S(lt, 13.8, 14.2) * fo }),
    ar('r', 1.9, { a: S(lt, 14.4, 14.8) * fo, lab: '×100' }),
    n('1000', 'real', { a: S(lt, 14.8, 15.2) * fo }), u('cm', 'real', { a: S(lt, 14.8, 15.2) * fo }),
    ar('r', 1.9, { a: S(lt, 15.6, 16.0) * fo, lab: '÷200' }),
    n('5', 'map', { a: 0 }), u('cm', 'map', { a: 0 })
  ];
  if (lt < 19.6) formula(chain, 630, 600, 54, 1);
  const LC = layoutF(chain, 630, 54);
  const c5 = (LC.boxes[6].x0 + LC.boxes[7].x1) / 2;
  const fly = S(lt, 19.1, 20.1), a5 = S(lt, 16.0, 16.4) * out;
  drawQty(qtyLayout('5', 'cm', lerp(c5, 640, fly), lerp(600, 792, fly), lerp(54, 40, fly)), 'map', a5, 12 * (1 - S(lt, 16.6, 17.6)));

  /* b4 : base with ruler, 50° with protractor */
  const rin = S(lt, 19.4, 20.2);
  rulerH(P[0] - (1 - rin) * 160, 828, 384, 64, rin * (1 - S(lt, 21.3, 21.8)));
  if (lt >= 37.9){
    const mp = S(lt, 37.9, 39.5);
    const Pm = lp(P, E, mp), Qm = lp(Q, F, mp), Rm = lp(R, T, mp), c = mixRGB('map', 'real', mp);
    line(Pm, Qm, 1, c, 2.8, 1, { glow: 6 }); line(Qm, Rm, 1, c, 2.8, 1, { glow: 6 }); line(Pm, Rm, 1, 'w', 2, .95);
    return;
  }
  const bp = S(lt, 20.2, 21.2);
  line(P, Q, bp, 'map', 2.8, 1, { glow: 6 });
  if (bp > 0 && bp < 1) dot(lp(P, Q, bp), 5, 'map', 1, 12);
  protractor(P, 150, S(lt, 21.6, 22.2) * (1 - S(lt, 24.3, 24.9)));
  const sw = S(lt, 22.2, 23.3);
  if (sw > 0 && lt < 24.4){ const a = -50 * DEG * sw; line(P, [P[0] + 190 * Math.cos(a), P[1] + 190 * Math.sin(a)], 1, 'w', 2, .9); }
  angleArc(P, 64, 0, -50 * DEG, sw, 'w', .85 * out);
  dot([P[0] + 150 * Math.cos(-50 * DEG), P[1] + 150 * Math.sin(-50 * DEG)], 4, 'w', S(lt, 23.2, 23.6) * (1 - S(lt, 24.3, 24.9)), 10);
  text('50°', 519, 780, fM(32), 'w', .9 * S(lt, 23.3, 23.8) * out);
  // the long ray, split at R so the overshoot can fade
  const rl = S(lt, 23.4, 24.4), rayE = lp(P, RAY, rl), fR = (R[0] - P[0]) / (RAY[0] - P[0]);
  const ov = lerp(1, .18, S(lt, 28.7, 29.3)) * out;
  if (rl > 0){
    if (rl <= fR) line(P, rayE, 1, 'w', 2, .95);
    else { line(P, R, 1, 'w', 2, .95); line(R, rayE, 1, 'w', 2, .95 * ov); }
  }

  /* b5 : right angle at Q with a set square → apex */
  const ssIn = S(lt, 25.7, 26.5);
  setSquare(Q, (1 - ssIn) * 140, ssIn * (1 - S(lt, 28.1, 28.7)));
  const vl = S(lt, 26.5, 27.7), vE = lp(Q, [750, 370], vl), fV = (Q[1] - R[1]) / (Q[1] - 370);
  const meas = S(lt, 32.6, 34.0);
  if (vl > 0){
    if (vl <= fV) line(Q, vE, 1, 'w', 2, .95);
    else { line(Q, R, 1, 'w', 2, .95); line(R, vE, 1, 'w', 2, .95 * ov); }
  }
  rightMark(Q, [-1, 0], [0, -1], 18, .7 * S(lt, 27.3, 27.9));
  const ip = S(lt, 27.7, 28.4);
  if (ip > 0){ ring(R, lerp(4, 34, ip), 'w', (1 - ip) * .9, 2); dot(R, 5, 'w', ip, 12); }
  text('てっぺん', 732, 406, fJ(26, 500), 'w', .85 * S(lt, 28.2, 28.8) * out, 'right');

  /* b6 : measure the height ≈ 6 cm */
  const rv = S(lt, 31.7, 32.5);
  rulerV(766 + (1 - rv) * 70, 820, 416, 64, rv * out);
  if (meas > 0){
    line(Q, lp(Q, R, meas), 1, 'map', 3, 1, { glow: 8 });
    const my = lerp(Q[1], R[1], meas);
    line([750, my], [772, my], 1, 'map', 2.4, (1 - S(lt, 34.2, 34.8)) * out);
  }
  const rd = S(lt, 34.0, 34.6) * out;
  if (rd > 0){
    line([752, R[1]], [800, R[1]], 1, 'map', 2, .9 * rd);
    formulaL([j('{約|やく}', 'map'), n('6', 'map'), u('cm', 'map')], 818, 629, 44, rd);
  }
}
function drawS3(lt){
  const m = S(lt, 12.0, 13.4) * (1 - S(lt, 37.9, 39.5));
  const sc = lerp(1, .38, m), ox = lerp(0, 35.8, m), oy = lerp(0, 104.8, m);
  const dimF = lerp(1, .4, S(lt, 6.0, 6.6));
  ctx.save(); ctx.translate(ox, oy); ctx.scale(sc, sc);
  drawRealScene(lt, dimF);
  ctx.restore();
  const fa = S(lt, 13.0, 13.4) * (1 - S(lt, 37.9, 38.4));
  if (fa > 0){ ctx.save(); ctx.strokeStyle = col('w', .16 * fa); ctx.lineWidth = 1.2; roundRect(34, 203, 320, 282, 14); ctx.stroke(); ctx.restore(); }
  drawPaper(lt);
}

/* ----- summary ----- */
function drawSum(lt){
  formula(FORMS.def(), 540, 330, 62, S(lt, .3, 1.0));
  text('{長|なが}さの{単位|たんい}は、そろえてから', 540, 452, fJ(28), 'w', .6 * S(lt, .9, 1.5));
  const small = [[250, 672], [350, 672], [250, 612]], big = [[690, 692], [870, 692], [690, 584]];
  const a1 = S(lt, 1.2, 1.8), a2 = S(lt, 1.4, 2.0);
  fillPoly(small, 'map', .1 * a1); poly([...small, small[0]], a1, 'map', 2.4, 1, { glow: 8 });
  fillPoly(big, 'real', .08 * a2); poly([...big, big[0]], a2, 'real', 2.4, 1, { glow: 8 });
  const la = S(lt, 1.6, 2.2);
  text('{縮図|しゅくず}', 300, 716, fJ(30, 500), 'map', la);
  text('{実際|じっさい}', 780, 736, fJ(30, 500), 'real', la);
  arrow([395, 604], [665, 604], S(lt, 2.2, 3.0), 'w', 2, .85, 14);
  formula([op('×'), n('4000')], 530, 566, 40, .9 * S(lt, 2.6, 3.0));
  arrow([665, 668], [395, 668], S(lt, 3.2, 4.0), 'w', 2, .85, 14);
  formula([op('÷'), n('4000')], 530, 708, 40, .9 * S(lt, 3.6, 4.0));
  text('（4000{分|ぶん}の1の{縮図|しゅくず}のとき）', 540, 800, fJ(26), 'w', .55 * S(lt, 4.2, 4.8));
  if (lt > 4.0){
    const pa = S(lt, 4.0, 4.8);
    for (let i = 0; i < 3; i++){
      const ph = (NOW * .35 + i / 3) % 1, s = Math.sin(Math.PI * ph) * .85 * pa;
      dot([lerp(405, 650, ph), 604], 3, mixRGB('map', 'real', ph), s, 8);
      dot([lerp(655, 410, ph), 668], 3, mixRGB('real', 'map', ph), s, 8);
    }
  }
}

const SCENE_LIST = [
  { title: '{縮図|しゅくず}の{利用|りよう}・{縮尺|しゅくしゃく}', legend: false, dur: 11.8, draw: drawIntro, beats: [
    { t: 0, cd: .6, cap: '{頂点|ちょうてん}$A$は $A′$へ、$B$は $B′$へ、$C$は $C′$へ。\n{対応|たいおう}する{頂点|ちょうてん}に、1つずつうつります。', f: 'pairs', fd: 0 },
    { t: 7.4, cap: '{縮図|しゅくず}は、{形|かたち}を{変|か}えずに\nどの{辺|へん}も{同|おな}じ{割合|わりあい}で{縮|ちぢ}めた{図|ず}です。', f: 'def', fd: .5 }] },
  { title: '{縮尺|しゅくしゃく}を{分数|ぶんすう}と{比|ひ}で{表|あらわ}す', legend: true, dur: 33, draw: drawS1, beats: [
    { t: 0, cd: .8, cap: 'ABの{実際|じっさい}の{長|なが}さ100mを、\n{縮図|しゅくず}では4cmで{表|あらわ}しています。', f: 's1a', fd: 2.8 },
    { t: 5.5, cap: 'くらべる{前|まえ}に、{単位|たんい}をそろえます。\n100mを cmになおすと 10000cm。', f: 's1b', fd: .6 },
    { t: 11.5, cap: '① {縮尺|しゅくしゃく}＝{縮図上|しゅくずじょう}の{長|なが}さ÷{実際|じっさい}の{長|なが}さ。\n10000{分|ぶん}の4を{約分|やくぶん}して、2500{分|ぶん}の1。', f: 'def', fd: .4 },
    { t: 19.5, cap: '② {比|ひ}で{表|あらわ}すと 1：2500。\n{分数|ぶんすう}でも{比|ひ}でも、{同|おな}じ{意味|いみ}です。', f: 's1d', fd: 1.0 },
    { t: 25, cap: 'つまり、{縮図|しゅくず}の1cmは{実際|じっさい}の2500cm＝25m。\n4cmなら、25m×4＝100m。', f: 's1e', fd: .5 }] },
  { title: '{縮図|しゅくず}と{実際|じっさい}のきょり', legend: true, dur: 32, draw: drawS2, beats: [
    { t: 0, cd: .8, cap: 'ゼブラさんの{家|いえ}のまわりの4000{分|ぶん}の1の{縮図|しゅくず}。\n{家|いえ}から{学校|がっこう}までの{実際|じっさい}の{道|みち}のりは800m。', f: 's2a', fd: 2.4 },
    { t: 6, cap: 'まず{単位|たんい}をそろえます。\n800mを cmになおすと 80000cm。', f: 's2b', fd: .6 },
    { t: 12, cap: '③ {実際|じっさい}→{縮図|しゅくず}は、÷4000。\n80000÷4000＝20 なので、{縮図|しゅくず}では20cm。', f: 's2c', fd: .5 },
    { t: 23, cap: '④ {縮図|しゅくず}→{実際|じっさい}は、×4000。\n3×4000＝12000cm＝120m。', f: 's2d', fd: .5 }] },
  { title: '{校舎|こうしゃ}の{高|たか}さを{求|もと}める', legend: true, dur: 51, draw: drawS3, beats: [
    { t: 0, cd: .8, cap: '{目|め}の{高|たか}さは1.4m。{校舎|こうしゃ}から10mはなれて、\nてっぺんを{見上|みあ}げた{角度|かくど}は50°。', f: 's3a', fd: 3.6 },
    { t: 6, cap: '{目|め}の{高|たか}さの{線|せん}と{見上|みあ}げる{線|せん}でできる{直角三角形|ちょっかくさんかくけい}。\nこの200{分|ぶん}の1の{縮図|しゅくず}をかいて{考|かんが}えます。', f: 's3b', fd: .8 },
    { t: 12, cap: '10mは1000cm。200{分|ぶん}の1にするので、\n1000÷200＝5。{底辺|ていへん}は5cmです。', f: 's3c', fd: 2.0 },
    { t: 19, cap: '{底辺|ていへん}5cmをひいて、はしに{分度器|ぶんどき}をあて、\n50°の{線|せん}をひきます。', f: 's3d', fd: 1.0 },
    { t: 25.5, cap: 'もう{一方|いっぽう}のはしから{直角|ちょっかく}に{線|せん}を{立|た}てると、\n2{本|ほん}の{線|せん}が{交|まじ}わった{点|てん}が{校舎|こうしゃ}のてっぺん。', f: null },
    { t: 31.5, cap: 'たての{長|なが}さを{定規|じょうぎ}ではかると、{約|やく}6cm。', f: 's3f', fd: 2.6 },
    { t: 37.5, cap: '{実際|じっさい}の{長|なが}さにもどすには、×200。\n6×200＝1200cm＝12m。', f: 's3g', fd: .8 },
    { t: 43.5, cap: '{三角形|さんかくけい}は、{目|め}の{高|たか}さから{上|うえ}の{部分|ぶぶん}。\n{目|め}の{高|たか}さ1.4mをたして、12＋1.4＝13.4m。', f: 's3h', fd: .6, ul: [6, 7, 4.0, 4.8] }] },
  { title: 'まとめ', legend: true, dur: 12, draw: drawSum, beats: [
    { t: 0, cd: .8, cap: '{縮図|しゅくず}→{実際|じっさい}は かけ{算|ざん}、{実際|じっさい}→{縮図|しゅくず}は わり{算|ざん}。\n{目|め}の{高|たか}さのような{長|なが}さは、さいごにたそう。', f: 'sum', fd: 3.4 }] }
];

startLesson({
  scenes: SCENE_LIST,
  forms: FORMS,
  legend: [{ c: 'map', label: '{縮図|しゅくず}の{長|なが}さ' }, { c: 'real', label: '{実際|じっさい}の{長|なが}さ' }],
  poster: 7.3            // 「動きを減らす」設定の端末で最初に止めて見せる時刻
});
