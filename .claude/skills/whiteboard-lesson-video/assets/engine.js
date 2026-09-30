/*
  Lesson animation engine — shared by every lesson (lessons/<slug>/lesson.js).
  build: lesson.py wraps  engine.js + lesson.js  in one closure, so lesson code can call everything here directly.
  API reference: ../references/engine-api.md
  Logical canvas 1080x1350. renderAt(t) is deterministic: the same t always draws the same frame (needed for MP4 export).
*/
const W = 1080, H = 1350;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const wrap = document.getElementById('wrap');
const EXPORT = /[?&]export=1/.test(location.search);
if (EXPORT) document.documentElement.classList.add('export');
let K = 1, NOW = 0;

/* ---------- colors & fonts ---------- */
// palette: lessons give these colours a meaning, e.g. Object.assign(RGB, { map: RGB.red, real: RGB.blue })
const RGB = { w:[255,255,255], red:[255,123,114], blue:[134,168,255], green:[118,214,160], amber:[255,196,106], violet:[190,162,255] };
const col = (c, a = 1) => { const v = Array.isArray(c) ? c : (RGB[c] || RGB.w); return `rgba(${v[0] | 0},${v[1] | 0},${v[2] | 0},${a})`; };
const mixRGB = (a, b, t) => { const A = Array.isArray(a) ? a : RGB[a], B = Array.isArray(b) ? b : RGB[b]; return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const JPF = '"ZKG","Zen Kaku Gothic New","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';
const MRF = '"STIXr","STIX Two Text","Times New Roman",serif';
const MIF = '"STIXi","STIX Two Text","Times New Roman",serif';
const fJ = (s, w = 400) => `${w} ${s}px ${JPF}`;
const fM = s => `400 ${s}px ${MRF}`;
const fI = s => `italic 400 ${s}px ${MIF}`;

/* ---------- math helpers ---------- */
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const eback = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const S = (t, a, b) => eio(seg(t, a, b));
const lerp = (a, b, t) => a + (b - a) * t;
const lp = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const DEG = Math.PI / 180;

/* ---------- drawing helpers ---------- */
function setStroke(c, w, a, dash, glow){
  ctx.strokeStyle = col(c, a); ctx.lineWidth = w;
  ctx.setLineDash(dash || []);
  if (glow){ ctx.shadowColor = col(c, Math.min(1, .75 * a)); ctx.shadowBlur = glow * K; }
}
function line(a, b, p = 1, c = 'w', w = 2, al = 1, o = {}){
  if (p <= 0 || al <= 0) return;
  const e = lp(a, b, p);
  ctx.save(); setStroke(c, w, al, o.dash, o.glow);
  if (o.flow) ctx.lineDashOffset = -o.flow;
  ctx.lineCap = o.cap || 'round';
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.restore();
}
function poly(pts, p = 1, c = 'w', w = 2, al = 1, o = {}){
  if (p <= 0 || al <= 0) return;
  const L = []; let total = 0;
  for (let i = 1; i < pts.length; i++){ const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); total += d; }
  let rem = total * p;
  ctx.save(); setStroke(c, w, al, o.dash, o.glow); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (o.flow) ctx.lineDashOffset = -o.flow;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && rem > 0; i++){
    const d = L[i - 1];
    if (rem >= d){ ctx.lineTo(pts[i][0], pts[i][1]); rem -= d; }
    else { const t = rem / d; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)); rem = 0; }
  }
  ctx.stroke(); ctx.restore();
}
function fillPoly(pts, c, al){
  if (al <= 0) return;
  ctx.save(); ctx.fillStyle = col(c, al); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function dot(p, r, c = 'w', al = 1, glow = 0){
  if (al <= 0 || r <= 0) return;
  ctx.save(); ctx.fillStyle = col(c, al);
  if (glow){ ctx.shadowColor = col(c, Math.min(1, .9 * al)); ctx.shadowBlur = glow * K; }
  ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function ring(p, r, c = 'w', al = 1, w = 2){
  if (al <= 0 || r <= 0) return;
  ctx.save(); ctx.strokeStyle = col(c, al); ctx.lineWidth = w; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
/* ---------- furigana (ruby) : write kanji as "{漢字|かんじ}" ---------- */
const RUBY_RE = /\{([^|}]+)\|([^}]+)\}|\$([^$]+)\$/g;           // {漢字|かんじ} ruby, $A′$ math-italic letters
const hasRuby = s => typeof s === 'string' && (s.indexOf('{') >= 0 || s.indexOf('$') >= 0);
const plain = s => s.replace(RUBY_RE, (m0, b, r, mth) => mth != null ? mth : b);
function rubySegs(str){
  const out = []; let last = 0, m;
  RUBY_RE.lastIndex = 0;
  while ((m = RUBY_RE.exec(str))){
    if (m.index > last) out.push({ b: str.slice(last, m.index) });
    if (m[3] != null) out.push({ b: m[3], m: true }); else out.push({ b: m[1], r: m[2] });
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push({ b: str.slice(last) });
  return out;
}
function fontSW(font){ const m = /^(\d+) ([\d.]+)px/.exec(font); return m ? { w: +m[1], s: +m[2] } : { w: 400, s: 40 }; }
function rubyFont(font){ const f = fontSW(font); return fJ(Math.max(12, f.s * .5), Math.max(400, f.w)); }
function rubyLayout(str, bfont, rfont){
  const segs = rubySegs(str), rs = fontSW(rfont).s, bs = fontSW(bfont).s;
  for (const g of segs){
    if (g.m){ g.mf = fI(bs * 1.1); ctx.font = g.mf; g.bw = ctx.measureText(g.b).width + bs * .12; continue; }
    ctx.font = bfont; g.bw = ctx.measureText(g.b).width; if (g.r){ ctx.font = rfont; g.rw = ctx.measureText(g.r).width; }
  }
  let w = 0;
  segs.forEach((g, i) => {
    g.padL = g.padR = 0;
    if (g.r){
      const ex = g.rw + 2 - g.bw;
      if (ex > 0){ // reading wider than its kanji: overhang neighbouring kana (never another reading), otherwise make room
        const ov = nb => !nb ? Math.min(ex / 2, rs) : nb.r ? 0 : Math.min(ex / 2, rs, nb.bw / 2);
        g.padL = ex / 2 - ov(segs[i - 1]); g.padR = ex / 2 - ov(segs[i + 1]);
      }
    }
    g.adv = g.padL + g.bw + g.padR; w += g.adv;
  });
  return { segs, w };
}
function twidth(s, font){ if (hasRuby(s)) return rubyLayout(s, font, rubyFont(font)).w; ctx.font = font; return ctx.measureText(s).width; }
function rubyDraw(L, x, yb, bfont, rfont, ry){ // x = left edge, yb = base line y, ry = centre of the ruby line
  ctx.textAlign = 'left';
  for (const g of L.segs){
    const bx = x + g.padL;
    if (g.m){ // math-italic letters: caps centred like the kana around them
      const tb = ctx.textBaseline, ms = fontSW(g.mf.replace('italic ', '')).s;
      ctx.font = g.mf; ctx.textBaseline = 'alphabetic';
      ctx.fillText(g.b, bx + ms * .05, tb === 'middle' ? yb + ms * .33 : yb);
      ctx.textBaseline = tb; x += g.adv; continue;
    }
    ctx.font = bfont; ctx.fillText(g.b, bx, yb);
    if (g.r){
      const tb = ctx.textBaseline, ga = ctx.globalAlpha;
      ctx.font = rfont; ctx.textBaseline = 'middle'; ctx.globalAlpha = ga * .9;
      ctx.fillText(g.r, bx + (g.bw - g.rw) / 2, ry);
      ctx.textBaseline = tb; ctx.globalAlpha = ga;
    }
    x += g.adv;
  }
}
function text(s, x, y, font, c = 'w', al = 1, align = 'center', base = 'middle', glow = 0){
  if (al <= 0) return;
  ctx.save(); ctx.fillStyle = col(c, al); ctx.textBaseline = base;
  if (glow){ ctx.shadowColor = col(c, Math.min(1, .8 * al)); ctx.shadowBlur = glow * K; }
  if (hasRuby(s)){
    const f = fontSW(font), rf = rubyFont(font), rs = Math.max(12, f.s * .5), L = rubyLayout(s, font, rf);
    const x0 = align === 'center' ? x - L.w / 2 : align === 'right' ? x - L.w : x;
    rubyDraw(L, x0, y, font, rf, y - f.s * .5 - Math.max(1.5, f.s * .05) - rs / 2);
  } else { ctx.font = font; ctx.textAlign = align; ctx.fillText(s, x, y); }
  ctx.restore();
}
function numC(s, cx, cy, size, c = 'w', al = 1, glow = 0){ // digits, visually centred on cy
  if (al <= 0) return;
  ctx.save(); ctx.font = fM(size); ctx.fillStyle = col(c, al); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (glow){ ctx.shadowColor = col(c, .8 * al); ctx.shadowBlur = glow * K; }
  ctx.fillText(s, cx, cy + size * .335); ctx.restore();
}
function opC(s, cx, cy, size, c = 'w', al = 1){ // operators centred on the math axis
  if (al <= 0) return;
  ctx.save(); ctx.font = fM(size); ctx.fillStyle = col(c, al); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, cx, cy + size * .25); ctx.restore();
}
function spaced(s, x, y, font, spacing, c = 'w', al = 1){
  if (al <= 0) return;
  ctx.save(); ctx.fillStyle = col(c, al); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const f = fontSW(font), rf = rubyFont(font), rs = Math.max(12, f.s * .5), rsp = rs * .12;
  const ry = y - f.s * .5 - Math.max(1.5, f.s * .06) - rs / 2;
  const segs = rubySegs(s).map(g => {
    ctx.font = font;
    const ch = [...g.b], ws = ch.map(k => k === ' ' ? ctx.measureText('　').width * .5 : ctx.measureText(k).width);
    const bw = ws.reduce((a, b) => a + b, 0) + spacing * (ch.length - 1);
    let rch = [], rws = [], rw = 0;
    if (g.r){ ctx.font = rf; rch = [...g.r]; rws = rch.map(k => ctx.measureText(k).width); rw = rws.reduce((a, b) => a + b, 0) + rsp * (rch.length - 1); }
    return { ch, ws, bw, rch, rws, rw, adv: Math.max(bw, rw) };
  });
  const total = segs.reduce((a, g) => a + g.adv, 0) + spacing * (segs.length - 1);
  let cx = x - total / 2;
  segs.forEach(g => {
    let bx = cx + (g.adv - g.bw) / 2;
    ctx.font = font;
    g.ch.forEach((k, i) => { if (k !== ' ') ctx.fillText(k, bx, y); bx += g.ws[i] + spacing; });
    if (g.rch.length){
      let rx = cx + (g.adv - g.rw) / 2; const ga = ctx.globalAlpha;
      ctx.font = rf; ctx.globalAlpha = ga * .9;
      g.rch.forEach((k, i) => { ctx.fillText(k, rx, ry); rx += g.rws[i] + rsp; });
      ctx.globalAlpha = ga;
    }
    cx += g.adv + spacing;
  });
  ctx.restore();
}
function alongPath(pts, f){ // point at fraction f (0..1) of a polyline's length — for a single moving dot
  let total = 0; const L = [];
  for (let i = 1; i < pts.length; i++){ const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); total += d; }
  let rem = clamp01(f) * total;
  for (let i = 1; i < pts.length; i++){ if (rem <= L[i - 1]) return lp(pts[i - 1], pts[i], L[i - 1] ? rem / L[i - 1] : 0); rem -= L[i - 1]; }
  return pts[pts.length - 1].slice();
}
function roundRect(x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function arrow(a, b, p = 1, c = 'w', w = 2, al = 1, head = 12){
  if (p <= 0 || al <= 0) return;
  const e = lp(a, b, p);
  line(a, e, 1, c, w, al);
  const hp = clamp01((p - .55) / .45);
  if (hp <= 0) return;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  ctx.save(); setStroke(c, w, al * hp); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(e[0] - head * Math.cos(ang - .5), e[1] - head * Math.sin(ang - .5));
  ctx.lineTo(e[0], e[1]);
  ctx.lineTo(e[0] - head * Math.cos(ang + .5), e[1] - head * Math.sin(ang + .5));
  ctx.stroke(); ctx.restore();
}
function dimV(x, y0, y1, p, c, al){ const m = (y0 + y1) / 2; arrow([x, m], [x, y0], p, c, 1.8, al, 10); arrow([x, m], [x, y1], p, c, 1.8, al, 10); }
function dimH(y, x0, x1, p, c, al){ const m = (x0 + x1) / 2; arrow([m, y], [x0, y], p, c, 1.8, al, 10); arrow([m, y], [x1, y], p, c, 1.8, al, 10); }
function tickV(p, len, c, al){ line([p[0], p[1] - len / 2], [p[0], p[1] + len / 2], 1, c, 2.4, al); }
function grid(x0, y0, x1, y1, step, al){
  if (al <= 0) return;
  ctx.save(); ctx.strokeStyle = col('w', al); ctx.lineWidth = 1; ctx.beginPath();
  for (let x = x0; x <= x1 + .1; x += step){ ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
  for (let y = y0; y <= y1 + .1; y += step){ ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke(); ctx.restore();
}
function rightMark(p0, dA, dB, s, al, c = 'w'){
  if (al <= 0) return;
  const a = [p0[0] + dA[0] * s, p0[1] + dA[1] * s], cc = [p0[0] + dB[0] * s, p0[1] + dB[1] * s], b = [a[0] + dB[0] * s, a[1] + dB[1] * s];
  poly([a, b, cc], 1, c, 1.6, al);
}
function angleArc(c, r, a0, a1, p, cl = 'w', al = 1, w = 1.8){
  if (p <= 0 || al <= 0) return;
  ctx.save(); setStroke(cl, w, al); ctx.beginPath(); ctx.arc(c[0], c[1], r, a0, a0 + (a1 - a0) * p, a1 < a0); ctx.stroke(); ctx.restore();
}
function handCircle(cx, cy, rx, ry, p, c = 'w', al = 1, w = 2.2){
  if (p <= 0 || al <= 0) return;
  const a0 = -Math.PI * .62, sweep = Math.PI * 2 * 1.1 * p, N = 72;
  ctx.save(); setStroke(c, w, al); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let i = 0; i <= N; i++){
    const a = a0 + sweep * i / N, wob = 1 + .045 * Math.sin(a * 2.3 + 1.1) + .03 * (a - a0) / (Math.PI * 2);
    const x = cx + rx * wob * Math.cos(a), y = cy + ry * wob * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke(); ctx.restore();
}
function answerLine(x0, x1, y, p, c = 'w', al = 1){ // teacher-style underline with "//"
  if (p <= 0 || al <= 0) return;
  const p1 = clamp01(p / .7), p2 = clamp01((p - .7) / .3);
  line([x0, y], [x1, y], eo(p1), c, 2.4, al);
  for (let i = 0; i < 2; i++){
    const pi = clamp01(p2 * 2 - i); if (pi <= 0) continue;
    const bx = x1 - 2 + i * 11;
    line([bx - 5, y + 9], [bx + 5, y - 9], pi, c, 2.2, al);
  }
}
function qtyLayout(num, unit, cx, cy, s){
  ctx.font = fM(s);
  const wn = ctx.measureText(num).width, wu = ctx.measureText(unit).width, g = s * .2, w = wn + g + wu, x0 = cx - w / 2;
  return { num, unit, s, cy, x0, nx: x0, ux: x0 + wn + g, x1: x0 + w, wn, wu };
}
function drawQty(q, c, al, glow = 0){
  if (al <= 0) return;
  ctx.save(); ctx.font = fM(q.s); ctx.fillStyle = col(c, al); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (glow){ ctx.shadowColor = col(c, .8 * al); ctx.shadowBlur = glow * K; }
  ctx.fillText(q.num, q.nx, q.cy + q.s * .335); ctx.fillText(q.unit, q.ux, q.cy + q.s * .335); ctx.restore();
}
function rulerH(x0, y, len, cm, al){ // zero at x0, measuring edge at y, body below
  if (al <= 0) return;
  const pad = 24, body = 46;
  ctx.save();
  ctx.fillStyle = col('w', .05 * al); ctx.strokeStyle = col('w', .5 * al); ctx.lineWidth = 1.4;
  roundRect(x0 - pad, y, len + pad * 2, body, 6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle = col('w', .55 * al); ctx.lineWidth = 1.2;
  const nmm = Math.floor(len / cm * 10 + .001);
  for (let i = 0; i <= nmm; i++){ const x = x0 + i * cm / 10, L = i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 6; ctx.moveTo(x, y); ctx.lineTo(x, y + L); }
  ctx.stroke();
  ctx.fillStyle = col('w', .7 * al); ctx.font = fM(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i * cm <= len + .1; i++) ctx.fillText(String(i), x0 + i * cm, y + 30);
  ctx.restore();
}
function rulerV(x, y0, len, cm, al){ // zero at y0 (bottom), measuring edge at x, body to the right
  if (al <= 0) return;
  const pad = 24, body = 46;
  ctx.save();
  ctx.fillStyle = col('w', .05 * al); ctx.strokeStyle = col('w', .5 * al); ctx.lineWidth = 1.4;
  roundRect(x, y0 - len - pad, body, len + pad * 2, 6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle = col('w', .55 * al); ctx.lineWidth = 1.2;
  const nmm = Math.floor(len / cm * 10 + .001);
  for (let i = 0; i <= nmm; i++){ const y = y0 - i * cm / 10, L = i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 6; ctx.moveTo(x, y); ctx.lineTo(x + L, y); }
  ctx.stroke();
  ctx.fillStyle = col('w', .7 * al); ctx.font = fM(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i * cm <= len + .1; i++) ctx.fillText(String(i), x + 32, y0 - i * cm);
  ctx.restore();
}
function protractor(c, r, al){
  if (al <= 0) return;
  ctx.save();
  ctx.fillStyle = col('w', .045 * al); ctx.strokeStyle = col('w', .5 * al); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(c[0], c[1], r, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle = col('w', .22 * al); ctx.arc(c[0], c[1], r * .6, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle = col('w', .5 * al); ctx.lineWidth = 1.2;
  for (let d = 0; d <= 180; d += 5){
    const a = -d * DEG, L = d % 10 === 0 ? 14 : 7;
    ctx.moveTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r);
    ctx.lineTo(c[0] + Math.cos(a) * (r - L), c[1] + Math.sin(a) * (r - L));
  }
  ctx.stroke();
  ctx.fillStyle = col('w', .55 * al); ctx.font = fM(17); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let d = 0; d <= 180; d += 30){ const a = -d * DEG; ctx.fillText(String(d), c[0] + Math.cos(a) * (r - 30), c[1] + Math.sin(a) * (r - 30)); }
  ctx.restore();
  dot(c, 3, 'w', .8 * al);
}
function setSquare(q, dx, al){
  if (al <= 0) return;
  const a = [q[0] + dx, q[1]], b = [q[0] + dx + 150, q[1]], c = [q[0] + dx, q[1] - 260];
  fillPoly([a, b, c], 'w', .05 * al);
  poly([a, b, c, a], 1, 'w', 1.4, .55 * al);
  const g = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
  const sh = P => [g[0] + (P[0] - g[0]) * .42, g[1] + (P[1] - g[1]) * .42];
  poly([sh(a), sh(b), sh(c), sh(a)], 1, 'w', 1.2, .28 * al);
}

/* ---------- formula engine ---------- */
const n = (s, c = 'w', o = {}) => Object.assign({ k: 'n', s, c }, o);   // number (upright)
const u = (s, c = 'w', o = {}) => Object.assign({ k: 'u', s, c }, o);   // unit
const op = (s, o = {}) => Object.assign({ k: 'o', s, c: 'w' }, o);      // operator
const j = (s, c = 'w', o = {}) => Object.assign({ k: 'j', s, c }, o);   // Japanese
const fr = (num, den, o = {}) => Object.assign({ k: 'f', num, den, c: 'w' }, o);
const ar = (dir = 'r', w = 1.3, o = {}) => Object.assign({ k: 'a', dir, w, c: 'w' }, o);
const sp = w => ({ k: 's', w });
const v = (s, c = 'w', o = {}) => Object.assign({ k: 'v', s, c }, o);   // italic letter (A, A′ …)

function tokW(t, s){
  switch (t.k){
    case 'n': ctx.font = fM(s); return ctx.measureText(t.s).width;
    case 'v': ctx.font = fI(s); return ctx.measureText(t.s).width + s * .08;
    case 'u': ctx.font = fM(s); return ctx.measureText(t.s).width + s * .2;
    case 'o': ctx.font = fM(s); return ctx.measureText(t.s).width + s * .56;
    case 'j': { const js = s * (t.z || .68); return twidth(t.s, fJ(js, t.wt || 400)) + s * .24; }
    case 'f': { const fs = s * (t.z || .86); return Math.max(seqW(t.num, fs), seqW(t.den, fs)) + s * .36; }
    case 'a': return s * (t.w + .5);
    case 's': return s * t.w;
  }
  return 0;
}
function seqW(ts, s){ let w = 0; for (const t of ts) w += tokW(t, s); return w; }
function strikeChars(t, x, yc, s, a){
  ctx.save(); ctx.font = fM(s);
  const ch = [...t.s], N = ch.length; let cx = x;
  ctx.strokeStyle = col(t.sc || 'w', a); ctx.lineWidth = Math.max(1.6, s * .04); ctx.lineCap = 'round';
  for (let i = 0; i < N; i++){
    const cw = ctx.measureText(ch[i]).width, pi = clamp01(t.st * N - i);
    if (pi > 0){
      const x0 = cx + cw * .12, y0 = yc + s * .34, x1 = cx + cw * .88, y1 = yc - s * .38;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, pi), lerp(y0, y1, pi)); ctx.stroke();
    }
    cx += cw;
  }
  ctx.restore();
}
function drawTok(t, x, yc, s, w, a){
  const c = t.c || 'w';
  if (t.k === 'f'){
    const fs = s * (t.z || .86), nw = seqW(t.num, fs), dw = seqW(t.den, fs), cx = x + w / 2;
    drawSeq(t.num, cx - nw / 2, yc - fs * .54, fs, a);
    const dxr = t.den.some(k => k.k === 'j' && hasRuby(k.s)) ? fs * .31 : 0; // room for ruby under the bar
    drawSeq(t.den, cx - dw / 2, yc + fs * .54 + dxr, fs, a);
    const bw = Math.max(nw, dw) + s * .16;
    line([cx - bw / 2, yc], [cx + bw / 2, yc], 1, c, Math.max(1.8, s * .045), a, { cap: 'butt' });
    return;
  }
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (t.g){ ctx.shadowColor = col(c, .85 * a); ctx.shadowBlur = t.g * K; }
  switch (t.k){
    case 'n': ctx.font = fM(s); ctx.fillStyle = col(c, a * (t.st ? 1 - .55 * t.st : 1)); ctx.fillText(t.s, x, yc + s * .335); break;
    case 'v': ctx.font = fI(s); ctx.fillStyle = col(c, a); ctx.fillText(t.s, x + s * .02, yc + s * .335); break;
    case 'u': ctx.font = fM(s); ctx.fillStyle = col(c, a); ctx.fillText(t.s, x + s * .2, yc + s * .335); break;
    case 'o': ctx.font = fM(s); ctx.fillStyle = col(c, a); ctx.fillText(t.s, x + s * .28, yc + s * .25); break;
    case 'j': {
      const js = s * (t.z || .68), f = fJ(js, t.wt || 400); ctx.fillStyle = col(c, a);
      if (hasRuby(t.s)){ const rf = rubyFont(f), rs = Math.max(12, js * .5); rubyDraw(rubyLayout(t.s, f, rf), x + s * .12, yc + js * .36, f, rf, yc - js * .57 - rs / 2); }
      else { ctx.font = f; ctx.fillText(t.s, x + s * .12, yc + js * .36); }
      break;
    }
    case 'a': {
      const x0 = x + s * .25, x1 = x0 + s * t.w, h = s * .17;
      ctx.strokeStyle = col(c, a); ctx.lineWidth = Math.max(1.8, s * .042); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x0, yc); ctx.lineTo(x1, yc);
      if (t.dir === 'r' || t.dir === 'lr'){ ctx.moveTo(x1 - h, yc - h * .72); ctx.lineTo(x1, yc); ctx.lineTo(x1 - h, yc + h * .72); }
      if (t.dir === 'l' || t.dir === 'lr'){ ctx.moveTo(x0 + h, yc - h * .72); ctx.lineTo(x0, yc); ctx.lineTo(x0 + h, yc + h * .72); }
      ctx.stroke();
      if (t.lab){ ctx.shadowBlur = 0; ctx.font = fM(s * .5); ctx.fillStyle = col('w', a * .75); ctx.textAlign = 'center'; ctx.fillText(t.lab, (x0 + x1) / 2, yc - s * .26); }
      break;
    }
  }
  ctx.restore();
  if (t.k === 'n' && t.st) strikeChars(t, x, yc, s, a);
}
function drawSeq(toks, x, yc, s, al = 1, boxes = null){
  for (const t of toks){
    const w = tokW(t, s), a = al * (t.a == null ? 1 : t.a);
    if (a > .002 && t.k !== 's') drawTok(t, x, yc, s, w, a);
    if (boxes) boxes.push({ x0: x, x1: x + w });
    x += w;
  }
  return x;
}
function formula(toks, cx, yc, s, al = 1){
  const w = seqW(toks, s), boxes = [];
  drawSeq(toks, cx - w / 2, yc, s, al, boxes);
  return { x0: cx - w / 2, x1: cx + w / 2, boxes };
}
function formulaL(toks, x, yc, s, al = 1){ const boxes = []; const x1 = drawSeq(toks, x, yc, s, al, boxes); return { x0: x, x1, boxes }; }
function layoutF(toks, cx, s){
  const w = seqW(toks, s), boxes = []; let x = cx - w / 2;
  for (const t of toks){ const tw = tokW(t, s); boxes.push({ x0: x, x1: x + tw }); x += tw; }
  return { x0: cx - w / 2, x1: cx + w / 2, boxes };
}

/* ================= timeline (set by startLesson) ================= */
let SCENES = [], FORM = {}, LEGEND = null, POSTER = 0, GAP = .8, TOTAL = 0, NAV = [], PAUSES = [];

/* ---------- header / caption / formula ---------- */
function legend(y, a){ // colour key under the title; items come from startLesson({ legend })
  if (a <= 0 || !LEGEND || !LEGEND.length) return;
  const LF = fJ(27), r = 6, g = 12, between = 46, ws = LEGEND.map(it => twidth(it.label, LF));
  const total = ws.reduce((acc, w) => acc + r * 2 + g + w, 0) + between * (LEGEND.length - 1);
  let x = W / 2 - total / 2;
  LEGEND.forEach((it, i) => {
    dot([x + r, y], r, it.c, a); x += r * 2 + g;
    text(it.label, x, y, LF, 'w', .72 * a, 'left'); x += ws[i] + between;
  });
}
function caption(str, a, dy){
  if (!str || a <= 0) return;
  const lines = str.split('\n'), lh = 72, y0 = 1058 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => {
    let size = 40; const w = twidth(ln, fJ(size)); if (w > 960) size = Math.floor(40 * 960 / w);
    text(ln, W / 2, y0 + i * lh + dy, fJ(size), 'w', .92 * a);
  });
}
function bottomFormula(key, a, beat, p){
  if (!key || a <= 0) return;
  const L = formula(FORM[key](beat ? p : 99), W / 2, 1192, 52, a);
  if (beat && beat.ul){ const [i0, i1, t0, t1] = beat.ul; answerLine(L.boxes[i0].x0 + 8, L.boxes[i1].x1 + 4, 1192 + 44, S(p, t0, t1), 'w', .9 * a); }
}
function beatIndex(sc, L){ let bi = 0; sc.beats.forEach((b, i) => { if (L >= b.t) bi = i; }); return bi; }
function drawOverlay(sc, L){
  const bi = beatIndex(sc, L), b = sc.beats[bi], p = L - b.t, pb = bi > 0 ? sc.beats[bi - 1] : null;
  if (pb) caption(pb.cap, 1 - seg(p, 0, .22), 0);
  const cd = b.cd == null ? .15 : b.cd, fi = S(p, cd, cd + .45);
  caption(b.cap, fi, (1 - fi) * 10);
  if (pb && pb.f && pb.f === b.f){ bottomFormula(b.f, 1, b, p); return; }
  if (pb && pb.f) bottomFormula(pb.f, 1 - seg(p, 0, .25), pb, 99);   // keep the previous step's answer underline while it fades (step-mode pause frame)
  const fd = b.fd == null ? .3 : b.fd;
  bottomFormula(b.f, S(p, fd, fd + .5), b, p);
}
function sceneAt(t){ for (let i = 0; i < SCENES.length; i++) if (t < SCENES[i].g1 + GAP / 2) return i; return SCENES.length - 1; }
function renderAt(t){
  NOW = t;
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const si = sceneAt(t), sc = SCENES[si], lt = t - sc.g0;
  let a = 1;
  if (si > 0) a = Math.min(a, clamp01((lt + GAP / 2) / (GAP / 2)));
  if (si < SCENES.length - 1) a = Math.min(a, clamp01((sc.dur + GAP / 2 - lt) / (GAP / 2)));
  if (a <= 0) return;
  const L = Math.max(0, Math.min(sc.dur, lt));
  ctx.globalAlpha = eio(a);
  try {
    spaced(sc.title, W / 2, 108, fJ(38, 300), 14, 'w', .92 * S(L, 0, .6));
    if (sc.legend) legend(172, S(L, .3, .9));
    sc.draw(L);
    drawOverlay(sc, L);
  } catch (e){ console.error(e); }
  ctx.globalAlpha = 1;
}

/* ================= player ================= */
let T = 0, playing = false, last = 0, speed = 1, stepMode = false, lastCap = '';
const $ = id => document.getElementById(id);
const fmt = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function updateUI(){
  if (EXPORT) return;
  $('time').textContent = fmt(T) + ' / ' + fmt(TOTAL);
  $('prog').querySelector('.fill').style.width = (T / TOTAL * 100) + '%';
  $('prog').setAttribute('aria-valuenow', String(Math.round(T)));
  $('prog').setAttribute('aria-valuetext', fmt(T));
  const ended = T >= TOTAL - 1e-3;
  $('icoPlay').style.display = !playing && !ended ? '' : 'none';
  $('icoPause').style.display = playing ? '' : 'none';
  $('icoReplay').style.display = !playing && ended ? '' : 'none';
  $('play').setAttribute('aria-label', playing ? '一時停止' : ended ? 'もう一度再生' : '再生');
  const si = sceneAt(T), sc = SCENES[si], L = Math.max(0, Math.min(sc.dur, T - sc.g0)), cap = plain(sc.beats[beatIndex(sc, L)].cap).replace(/\n/g, '');
  if (cap !== lastCap){ lastCap = cap; $('sr').textContent = cap; }
}
function draw(){ if (!SCENES.length) return; renderAt(T); updateUI(); }
function setPlaying(v){ playing = v; last = performance.now(); updateUI(); }
function play(){ if (T >= TOTAL - 1e-3) T = 0; setPlaying(true); }
function seek(t){ T = Math.max(0, Math.min(TOTAL, t)); draw(); }
function tick(now){
  if (playing){
    const dt = Math.min(.1, (now - last) / 1000) * speed;
    let nt = T + dt;
    if (stepMode){ const p = PAUSES.find(x => x > T + 1e-6 && x <= nt); if (p !== undefined){ nt = p; playing = false; } }
    if (nt >= TOTAL){ nt = TOTAL; playing = false; }
    T = nt; draw();
  }
  last = now;
  requestAnimationFrame(tick);
}
function goNext(){
  const here = NAV.find(x => Math.abs(x - T) < .06);
  if (!playing && here !== undefined){ seek(here); setPlaying(true); return; }
  const t = NAV.find(x => x > T + .05); seek(t === undefined ? TOTAL : t); if (t !== undefined) setPlaying(true);
}
function goPrev(){ let t = 0; for (const x of NAV) if (x < T - .6) t = x; seek(t); setPlaying(true); }
function fit(){
  if (EXPORT){
    wrap.style.width = W + 'px'; wrap.style.height = H + 'px';
    cv.width = W; cv.height = H; cv.style.width = W + 'px'; cv.style.height = H + 'px'; K = 1; draw(); return;
  }
  const bw = document.body.clientWidth, bh = document.body.clientHeight, barH = 64;
  const pad = Math.min(16, bw * .03);
  const s = Math.min((bw - pad * 2) / W, (bh - pad * 2 - barH) / H);
  const cw = Math.floor(W * s), ch = Math.floor(H * s);
  wrap.style.width = cw + 'px'; wrap.style.height = ch + 'px';
  wrap.style.setProperty('--u', s + 'px');
  $('bar').style.width = cw + 'px';
  $('step').innerHTML = cw < 400 ? '<span class="lbl">ステップ</span>' : '<span class="lbl">ステップで<ruby>止<rt>と</rt></ruby>める</span>';
  const dpr = window.devicePixelRatio || 1;
  K = Math.min(cw * dpr / W, 2);
  cv.width = Math.round(W * K); cv.height = Math.round(H * K);
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  draw();
}

/* controls */
$('play').addEventListener('click', () => { playing ? setPlaying(false) : play(); });
$('next').addEventListener('click', goNext);
$('prev').addEventListener('click', goPrev);
const SPEEDS = [1, .75, 1.25];
$('speed').addEventListener('click', () => {
  speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
  $('speed').textContent = speed + '×';
  $('speed').setAttribute('aria-label', '再生速度 ' + speed + '倍');
});
$('step').addEventListener('click', () => { stepMode = !stepMode; $('step').setAttribute('aria-pressed', String(stepMode)); });
cv.addEventListener('click', () => { playing ? setPlaying(false) : play(); });
const prog = $('prog');
let dragging = false;
const seekFromEvent = e => { const r = prog.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * TOTAL); };
prog.addEventListener('pointerdown', e => { dragging = true; prog.setPointerCapture(e.pointerId); seekFromEvent(e); });
prog.addEventListener('pointermove', e => { if (dragging) seekFromEvent(e); });
prog.addEventListener('pointerup', () => { dragging = false; });
prog.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft'){ seek(T - 5); e.preventDefault(); e.stopPropagation(); }
  if (e.key === 'ArrowRight'){ seek(T + 5); e.preventDefault(); e.stopPropagation(); }
});
document.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
  if (e.key === ' ' || e.key === 'k'){ playing ? setPlaying(false) : play(); e.preventDefault(); }
  else if (e.key === 'ArrowRight'){ goNext(); e.preventDefault(); }
  else if (e.key === 'ArrowLeft'){ goPrev(); e.preventDefault(); }
  else if (e.key === 's' || e.key === 'S'){ $('step').click(); }
});
window.addEventListener('resize', fit);
if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);

/* start after fonts */
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fontList = ['300 40px ZKG', '400 40px ZKG', '500 40px ZKG', '400 40px STIXr', 'italic 400 40px STIXi'];
const wait = ms => new Promise(r => setTimeout(r, ms));
const faceOK = fam => { try { return [...document.fonts].some(f => f.family.replace(/["']/g, '') === fam && f.status === 'loaded'); } catch (e){ return true; } };
async function ensureFonts(){
  if (!document.fonts) return;
  await Promise.race([Promise.all(fontList.map(f => document.fonts.load(f, '縮図1Aa'))).catch(() => {}), wait(2500)]);
  if (EXPORT || (faceOK('ZKG') && faceOK('STIXr'))) return;
  // embedded fonts unavailable here: load the same typefaces from Google Fonts instead
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital@0;1&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap';
  await new Promise(r => { l.onload = r; l.onerror = r; setTimeout(r, 2500); document.head.appendChild(l); });
  await Promise.race([Promise.all(['300 40px "Zen Kaku Gothic New"', '400 40px "Zen Kaku Gothic New"', '500 40px "Zen Kaku Gothic New"', '400 40px "STIX Two Text"', 'italic 400 40px "STIX Two Text"']
    .map(f => document.fonts.load(f, '縮図の長さ1A'))).catch(() => {}), wait(2500)]);
}

/* ================= entry point ================= */
// lesson.js ends with: startLesson({ scenes, forms, legend, poster, gap })
function startLesson(L){
  SCENES = L.scenes; FORM = L.forms || {}; LEGEND = L.legend || null; POSTER = L.poster || 0;
  if (L.gap != null) GAP = L.gap;
  let acc = 0;
  SCENES.forEach((s, i) => { s.g0 = acc; s.g1 = acc + s.dur; acc = s.g1 + (i < SCENES.length - 1 ? GAP : 0); });
  TOTAL = acc; NAV = []; PAUSES = [];
  SCENES.forEach(s => s.beats.forEach((b, bi) => {
    NAV.push(s.g0 + (bi === 0 ? 0 : b.t));
    PAUSES.push(s.g0 + (bi < s.beats.length - 1 ? s.beats[bi + 1].t : s.dur));
  }));
  SCENES.slice(1).forEach(s => { const d = document.createElement('div'); d.className = 'tick'; d.style.left = (s.g0 / TOTAL * 100) + '%'; prog.querySelector('.track').appendChild(d); });
  prog.setAttribute('aria-valuemax', String(Math.round(TOTAL)));
  window.__lesson = {                       // used by lesson.py (shots / export)
    total: TOTAL, pauses: PAUSES.slice(), nav: NAV.slice(),
    scenes: SCENES.map(s => ({ title: plain(s.title), g0: s.g0, g1: s.g1, beats: s.beats.length })),
    render: t => { renderAt(t); return true; }, ready: false
  };
  ensureFonts().then(() => {
    fit();
    if (EXPORT){ window.__lesson.ready = true; return; }
    if (reduce){ T = POSTER; stepMode = true; $('step').setAttribute('aria-pressed', 'true'); draw(); }
    else play();
    requestAnimationFrame(tick);
  });
}
