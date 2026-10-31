// The Tea Merchant's Road · 茶の道 — a vertical Ukiyo-e short.
// Prints hang one below another on a tall hanging scroll; the camera travels down it.
import { clamp, lerp, seg, ss, eio, eo, ei, hash, TAU } from '/core/lib.js';
import { W, H, FR, PAL, TX, mk, buildTextures, inkify, stampLayer, stampFn, drawSeal, cartouche, sealCanvas, carve } from './print.js';
import { VIEWS } from './views.js';
import { bowl, shape } from './rig.js';
import { DUR, VO, T, q8 } from './story.js';

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const QS = new URLSearchParams(location.search);
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const LINES = (await J('lines.json')) || [], DURS = (await J('voice/dur.json')) || {};
const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
await document.fonts.load('400 40px Yuji', '茶の道一二三四五六旅立ち渡しの雨峠の雪祭りの夜申し出家路');
await document.fonts.load('500 40px Shippori', 'Aa'); await document.fonts.load('700 40px Shippori', 'Aa');
buildTextures();

// —— subtitles ——
export const SUBS = Object.entries(VO).map(([id, t0]) => ({ id, t0, t1: t0 + Math.max(1.8, (DURS[id] || 4) + .6), text: LINE[id]?.sub || LINE[id]?.text || '' }));
SUBS.forEach((s, i) => { if (SUBS[i + 1] && s.t1 > SUBS[i + 1].t0 - .1) s.t1 = SUBS[i + 1].t0 - .1; });

// —— block cache ——
const REG = [[0, 0], [2.2, -1.4], [-1.9, 1.8], [1.6, 2.1]];
const SHIFT = [[4, -6], [-6, 5], [6, 5], [-5, -5]];
const cache = new Map();
function layer(i, g) {
  const k = i * 10 + g; if (cache.has(k)) return cache.get(k);
  const c = mk(), x = c.getContext('2d'); VIEWS[i].bg(x, g);
  const hk = hash(k * 3.1);
  inkify(c, g === 0 ? { speck: .12 } : { speck: .3, grain: (VIEWS[i].grain[g] || 0) * 1.7, gx: hk * 300 - 150, baren: .36, bx: (hk - .5) * 300, by: (hash(hk) - .5) * 300 });
  cache.set(k, c); return c;
}
const revFor = (i, g, t) => i === 0 ? clamp((t - T.open[g]) / .34) : i === 5 ? clamp((t - T.dusk[g]) / .34) : 1;

// —— hanging scroll geometry ——
const GAP = 320, SY = i => i * (H + GAP);
const CART = [
  { x: 984, y: 84, title: '一 旅立ち', t: T.cart.s0 },
  { x: 96, y: 84, title: '二 渡しの雨', t: T.cart.s1 },
  { x: 984, y: 84, title: '三 峠の雪', t: T.cart.s2 },
  { x: 96, y: 84, title: '四 祭りの夜', t: T.cart.s3 },
  { x: 984, y: 84, title: '五 申し出', t: T.cart.s4 },
  { x: 920, y: 84, title: '六 家路', t: T.cart.s5 },
];

function drawSheet(i, t, M) {
  const v = VIEWS[i], oy = SY(i);
  ctx.save(); ctx.setTransform(M[0], M[1], M[2], M[3], M[4] + M[2] * oy, M[5] + M[3] * oy);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  ctx.drawImage(TX.paper, 0, 0);
  const ma = i === 4 && t >= T.ma[0], end = i === 5 ? ss(seg(t, ...T.washEnd)) : 0;
  if (!ma) {
    ctx.save(); ctx.beginPath(); ctx.rect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0); ctx.clip();
    for (const g of [1, 2, 3, 0]) stampLayer(ctx, layer(i, g), revFor(i, g, t), REG[g], SHIFT[g]);
    if (revFor(i, 3, t) > .6) { ctx.save(); ctx.globalAlpha = ss(seg(revFor(i, 3, t), .6, 1)); v.paint(ctx, t); ctx.restore(); }
    ctx.restore();
    const rb = revFor(i, 0, t);
    stampFn(ctx, x => { x.strokeStyle = PAL.sumi; x.lineWidth = 3.4; x.strokeRect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0); x.lineWidth = 1.3; x.strokeRect(FR.x0 - 9, FR.y0 - 9, FR.x1 - FR.x0 + 18, FR.y1 - FR.y0 + 18); }, rb, SHIFT[0]);
    // view cartouche drops in, seal stamps
    const C = CART[i], p = clamp((t - C.t) / .35), sp = clamp((t - C.t - .45) / .3);
    if (p > 0) {
      ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - ss(p)) * -14);
      C.b = cartouche(ctx, C.x, C.y, C.title, { series: '茶の道', w: 82, size: 46, ssize: 26 });
      ctx.restore();
      drawSeal(ctx, '茶', C.x, C.b.y0 + C.b.h + 46, 56, sp, { seed: i + 3, rot: (hash(i) - .5) * .08 });
    }
    // wash to paper
    const wash = i === 4 ? ss(seg(t, ...T.wash)) : end;
    if (wash > 0) { ctx.globalAlpha = wash; ctx.drawImage(TX.paper, 0, 0); ctx.globalAlpha = 1; }
    if (i === 5 && end > 0) { const C5 = CART[5]; if (C5.b) drawSeal(ctx, '茶', C5.x, C5.b.y0 + C5.b.h + 46, 56, 1, { seed: 8, rot: (hash(5) - .5) * .08 }); drawSeal(ctx, '茶道', W / 2, 1000, 120, clamp((t - T.bell) / .3), { seed: 31, rot: .02 }); }
  } else maBowl(t);
  ctx.globalAlpha = 1; ctx.drawImage(TX.fiber, 0, 0);
  ctx.restore(); ctx.restore();
}

// —— the ma: a blank sheet, the bowl's key line, then the road's colours print onto it ——
const BB = [540, 1240], BW = 640;
function bigBowlPath(x) {
  const w = BW, h = w * .62, cx = BB[0], cy = BB[1], tilt = w * .05;
  const p = [[-w / 2, -h + tilt], [-w * .47, -h * .55], [-w * .33, -h * .14], [-w * .14, -2], [w * .14, -2], [w * .34, -h * .16], [w * .48, -h * .58], [w / 2, -h - tilt * .3], [0, -h - tilt * .2]];
  const n = p.length, m = i => [(p[i % n][0] + p[(i + 1) % n][0]) / 2 + cx, (p[i % n][1] + p[(i + 1) % n][1]) / 2 + cy];
  const s = m(n - 1); x.moveTo(s[0], s[1]); for (let i = 0; i < n; i++) { const e = m(i); x.quadraticCurveTo(p[i][0] + cx, p[i][1] + cy, e[0], e[1]); } x.closePath();
}
function maBowl(t) {
  const h = BW * .62, top = BB[1] - h;
  const blk = k => clamp((t - T.blk[k]) / .4);
  const inBowl = fn => x => { x.save(); x.beginPath(); bigBowlPath(x); x.clip(); fn(x); x.restore(); };
  // 1 · rain: Prussian blue rising from the foot
  stampFn(ctx, inBowl(x => {
    const g = x.createLinearGradient(0, BB[1], 0, top + h * .35); g.addColorStop(0, PAL.prusD); g.addColorStop(.7, PAL.prus); g.addColorStop(1, 'rgba(29,58,102,0)');
    x.fillStyle = g; x.fillRect(BB[0] - BW, top, BW * 2, h + 10);
    x.strokeStyle = 'rgba(188,208,214,.5)'; x.lineWidth = 2; for (let i = 0; i < 46; i++) { const a = BB[0] - BW / 2 + i * 15; x.beginPath(); x.moveTo(a, BB[1] - h * .5); x.lineTo(a - 12, BB[1]); x.stroke(); }
  }), blk(0), [-8, 6]);
  // 2 · snow: pale dapples, paper flecks
  stampFn(ctx, inBowl(x => {
    for (let i = 0; i < 70; i++) { const a = BB[0] + (hash(i) - .5) * BW, b = top + h * .2 + hash(i + 50) * h * .6, r = 8 + hash(i + 9) * 22; x.fillStyle = 'rgba(188,208,214,.85)'; x.beginPath(); x.arc(a, b, r, 0, TAU); x.fill(); }
    for (let i = 0; i < 90; i++) { const a = BB[0] + (hash(i + 3) - .5) * BW, b = top + hash(i + 77) * h; x.fillStyle = PAL.white; x.beginPath(); x.arc(a, b, 3 + hash(i) * 4, 0, TAU); x.fill(); }
  }), blk(1), [7, 6]);
  // 3 · lanterns: beni rim and a red run down the side
  stampFn(ctx, inBowl(x => {
    x.fillStyle = PAL.beni; x.beginPath(); x.moveTo(BB[0] - BW, top - 40);
    for (let i = 0; i <= 64; i++) { const X = BB[0] - BW / 2 + BW * i / 64; x.lineTo(X, top + h * (.15 + .035 * Math.sin(i * .45) + .025 * Math.sin(i * 1.3 + 1))); }
    x.lineTo(BB[0] + BW, top - 40); x.fill();
    x.beginPath(); x.ellipse(BB[0] + BW * .28, top + h * .38, 18, 80, .1, 0, TAU); x.fill();
  }), blk(2), [-6, -6]);
  // key line on top
  stampFn(ctx, x => {
    x.strokeStyle = PAL.sumi; x.lineWidth = 7; x.lineJoin = 'round'; x.beginPath(); bigBowlPath(x); x.stroke();
    x.lineWidth = 6; x.beginPath(); x.moveTo(BB[0] - BW * .18, BB[1] - 2); x.lineTo(BB[0] - BW * .16, BB[1] + h * .08); x.lineTo(BB[0] + BW * .16, BB[1] + h * .08); x.lineTo(BB[0] + BW * .18, BB[1] - 2); x.stroke();
    x.lineWidth = 4; x.beginPath(); x.moveTo(BB[0] - BW * .485, top + BW * .045); x.quadraticCurveTo(BB[0], top + BW * .1, BB[0] + BW * .49, top - BW * .005); x.stroke();
  }, clamp((t - T.key5) / .45), [0, -8]);
  // the seal of the house, stamped in the corner as the last colour lands
  drawSeal(ctx, '茶', 900, 1640, 70, clamp((t - T.blk[2] - .3) / .3), { seed: 44 });
}

// —— camera ——
const C = (i, x = W / 2, y = H / 2) => [x, SY(i) + y];
const lz = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));
function camera(t) {
  const K = (p, z) => ({ c: p, z });
  const mixc = (A, B, u) => ({ c: [lerp(A.c[0], B.c[0], u), lerp(A.c[1], B.c[1], u)], z: lz(A.z, B.z, u) });
  const s0 = K(C(0), 1), s0b = K(C(0, 520, 1250), 2.4), s0e = K(C(0), 1.04);
  const f1 = K(C(1, 560, 1240), 1.42), s1 = K(C(1), 1);
  const s2 = K(C(2, 540, 760), 1), s2b = K(C(2, 540, 1000), 1), f2 = K(C(2, 520, 1240), 1.42);
  const s3 = K(C(3), 1), f3 = K(C(3, 530, 1200), 1.4);
  const s4 = K(C(4), 1), f4 = K(C(4, 560, 1360), 1.5);
  const s5 = K(C(5), 1.04), l5 = K(C(5, 980, 700), 2.6), f5 = K(C(5, 480, 1220), 1.32), e5 = K(C(5), .86);
  if (t < T.pull[0]) return s0b;
  if (t < T.pull[1]) return mixc(s0b, s0, eio(seg(t, ...T.pull)));
  if (t < T.slide1[0]) return mixc(s0, s0e, ss(seg(t, T.pull[1], T.slide1[0])));
  if (t < T.slide1[1]) return mixc(s0e, s1, eio(seg(t, ...T.slide1)));
  if (t < T.slide2[0]) return mixc(s1, f1, ss(seg(t, 13.4, 18.4)));
  if (t < T.slide2[1]) return mixc(f1, s2, eio(seg(t, ...T.slide2)));
  if (t < 23.4) return mixc(s2, s2b, ss(seg(t, 20.9, 23.4)));
  if (t < T.slide3[0]) return mixc(s2b, f2, ss(seg(t, 23.4, 26.0)));
  if (t < T.slide3[1]) return mixc(f2, s3, eio(seg(t, ...T.slide3)));
  if (t < T.cut4) return mixc(s3, f3, ss(seg(t, 28.6, 32.6)));
  if (t < T.ma[0]) return mixc(s4, f4, ss(seg(t, T.cut4, T.wash[0])));
  if (t < T.zoom5[0]) return s4;
  if (t < T.zoom5[1]) return mixc(s4, K(C(4, 560, 1150), 9), ei(seg(t, ...T.zoom5)));
  if (t < 48.6) return mixc(l5, s5, eo(seg(t, T.zoom5[1], 48.6)));
  if (t < T.pullEnd[0]) return mixc(s5, f5, ss(seg(t, 49.2, 51.8)));
  return mixc(f5, e5, eio(seg(t, ...T.pullEnd)));
}
const camMatrix = cam => [cam.z, 0, 0, cam.z, W / 2 - cam.z * cam.c[0], H / 2 - cam.z * cam.c[1]];

// —— hanging scroll mount ——
function drawMount(M) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#241b15'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.setTransform(...M);
  const y0 = -GAP, y1 = SY(5) + H + GAP;
  ctx.fillStyle = PAL.mount; ctx.fillRect(-150, y0, W + 300, y1 - y0);
  ctx.globalAlpha = .5; ctx.globalCompositeOperation = 'multiply';
  for (let Y = y0; Y < y1; Y += H) ctx.drawImage(TX.paper, -150, Y, W + 300, H);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // brocade side bands
  for (const a of [-150, W + 110]) { ctx.fillStyle = '#5b3a2c'; ctx.fillRect(a, y0, 40, y1 - y0); ctx.fillStyle = 'rgba(207,159,74,.35)'; for (let Y = y0; Y < y1; Y += 46) { ctx.beginPath(); ctx.arc(a + 20, Y, 6, 0, TAU); ctx.fill(); } }
  // thin ichimonji strips above and below each sheet
  for (let i = 0; i < 6; i++) { ctx.fillStyle = PAL.mountD; ctx.fillRect(-20, SY(i) - 34, W + 40, 16); ctx.fillRect(-20, SY(i) + H + 18, W + 40, 16); }
  ctx.restore();
}

// —— subtitle cartouche (screen space) ——
function wrap(text, maxW) { const words = text.split(' '), out = []; let cur = ''; for (const w of words) { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > maxW && cur) { out.push(cur); cur = w; } else cur = tst; } out.push(cur); return out; }
function subtitle(t) {
  if (QS.has('nosub')) return;
  const s = SUBS.find(s => t >= s.t0 - .05 && t < s.t1); if (!s) return;
  const a = clamp((t - s.t0 + .05) / .22), fo = 1 - clamp((t - (s.t1 - .25)) / .25);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = '500 40px Shippori'; const lines = wrap(s.text, 780), tw = Math.max(...lines.map(l => ctx.measureText(l).width));
  const w = tw + 140, h = 34 + lines.length * 52, x0 = (W - w) / 2, y0 = H - 120 - h;
  ctx.globalAlpha = fo;
  stampFn(ctx, x => {
    x.fillStyle = 'rgba(243,231,198,.96)'; x.fillRect(x0, y0, w, h);
    x.strokeStyle = PAL.sumi; x.lineWidth = 2.6; x.strokeRect(x0, y0, w, h); x.lineWidth = 1; x.strokeRect(x0 + 5, y0 + 5, w - 10, h - 10);
    x.fillStyle = PAL.sumi; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '500 40px Shippori';
    lines.forEach((l, k) => x.fillText(l, x0 + w / 2 + 28, y0 + 17 + 26 + k * 52));
  }, a, [0, 0]);
  const sc = sealCanvas('茶', 38, { seed: 17 }); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = fo * a * .92; ctx.drawImage(sc, x0 + 22, y0 + h / 2 - sc.height / 2);
  ctx.restore();
}

// —— frame ——
window.DUR = DUR;
window.render = t => {
  const cam = camera(t), M = camMatrix(cam);
  drawMount(M);
  const halfH = H / 2 / cam.z;
  for (let i = 0; i < VIEWS.length; i++) {
    if (SY(i) + H < cam.c[1] - halfH || SY(i) > cam.c[1] + halfH) continue;
    if (i === 5 && t < T.zoom5[1]) continue;        // the dusk print does not exist until we come back
    if (i === 4 && t < T.cut4 - .001) continue;      // the city is reached by a hard cut, not by the scroll
    drawSheet(i, t, M);
  }
  // the crash-zoom lands in the woodgrain, which becomes the next print
  if (t > T.zoom5[0] && t < T.zoom5[1] + .3) {
    const a = ss(seg(t, T.zoom5[1] - .35, T.zoom5[1])) * (1 - ss(seg(t, T.zoom5[1], T.zoom5[1] + .3)));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.drawImage(TX.paper, 0, 0); ctx.globalAlpha = a * .6; ctx.drawImage(TX.grain, 0, 0); ctx.restore();
  }
  subtitle(t);
};

// —— sound events for the mixer ——
const EV = [];
T.open.forEach((t, g) => EV.push({ t, type: 'rub', g }));
T.dusk.forEach((t, g) => EV.push({ t, type: 'rub', g }));
Object.entries(T.cart).forEach(([k, t]) => { EV.push({ t, type: 'cart' }); EV.push({ t: t + .45, type: 'seal' }); });
EV.push({ t: T.hand[0] + .5, type: 'cloth' });
EV.push({ t: T.bow[0], type: 'cloth' });
for (let s = T.walk[0]; s < T.walk[1]; s += .5) EV.push({ t: s, type: 'step' });
[T.slide1, T.slide2, T.slide3].forEach(([a, b]) => EV.push({ t: a, type: 'slide', dur: b - a }));
[T.pour1, T.pour2, T.pour3, T.pour6].forEach(([a, b]) => EV.push({ t: a + (b - a) * .38, type: 'pour', dur: (b - a) * .44 }));
EV.push({ t: T.cut4, type: 'cut' });
EV.push({ t: T.coins[0], type: 'coins', dur: T.coins[1] - T.coins[0] });
EV.push({ t: T.wash[0], type: 'wash', dur: T.wash[1] - T.wash[0] });
EV.push({ t: T.ma[0], type: 'silence', dur: T.ma[1] - T.ma[0] });
EV.push({ t: T.key5, type: 'rub', g: 0 });
T.blk.forEach((t, k) => EV.push({ t, type: 'block', k }));
EV.push({ t: T.blk[2] + .3, type: 'seal' });
EV.push({ t: T.zoom5[0], type: 'zoom', dur: T.zoom5[1] - T.zoom5[0] });
EV.push({ t: T.washEnd[0], type: 'wash', dur: T.washEnd[1] - T.washEnd[0] });
EV.push({ t: T.bell, type: 'seal' }, { t: T.bell, type: 'bell' });
SUBS.forEach(s => EV.push({ t: s.t0, type: 'voice', id: s.id }));
window.EV = EV.sort((a, b) => a.t - b.t);
window.SUBS = SUBS;
window.READY = true;
