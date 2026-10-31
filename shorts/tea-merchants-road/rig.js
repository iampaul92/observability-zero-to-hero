// Flat woodblock figures and props, drawn live: colour fills slightly out of register under a sumi key line.
import { clamp, lerp, TAU } from '/core/lib.js';
import { PAL, smooth } from './print.js';

const K = PAL.sumi, KW = 2.6;            // key line
const REGF = [1.7, 1.3];                 // colour block offset against the key line

// fill a path (offset) then key it
export function shape(x, path, fill, { key = true, lw = KW, keyCol = K } = {}) {
  if (fill) { x.save(); x.translate(REGF[0], REGF[1]); x.fillStyle = fill; x.beginPath(); path(x); x.fill(); x.restore(); }
  if (key) { x.strokeStyle = keyCol; x.lineWidth = lw; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); path(x); x.stroke(); }
}
const circ = (cx, cy, r) => x => x.arc(cx, cy, r, 0, TAU);
const pl = (p, closed = true) => x => { x.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) x.lineTo(p[i][0], p[i][1]); if (closed) x.closePath(); };
const sm = (p, closed = true) => x => smooth(x, p, closed);
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const dirv = a => [Math.cos(a), Math.sin(a)];

// two-bone IK: shoulder S, target T → elbow
function ik(S, T, l1, l2, bend) {
  let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy);
  const dd = clamp(d, Math.abs(l1 - l2) + .01, l1 + l2 - .01);
  const base = Math.atan2(dy, dx), a = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
  const E = add(S, dirv(base + bend * a), l1), H = add(E, dirv(Math.atan2(T[1] - E[1], T[0] - E[0])), l2);
  return [E, d > l1 + l2 ? H : T];
}

// arm with a hanging kimono sleeve
function arm(x, S, T, u, col, skin, bend, back) {
  const [E, Hd] = ik(S, T, 15 * u, 14 * u, bend), aw = 6.2 * u;
  const c = back ? mixd(col) : col;
  const path = x => { x.moveTo(S[0], S[1]); x.lineTo(E[0], E[1]); x.lineTo(Hd[0], Hd[1]); };
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = K; x.lineWidth = aw + KW * 2; x.beginPath(); path(x); x.stroke();
  x.save(); x.translate(REGF[0], REGF[1]); x.strokeStyle = c; x.lineWidth = aw; x.beginPath(); path(x); x.stroke(); x.restore();
  // sleeve (tamoto) hangs from the forearm
  const A = [lerp(S[0], E[0], .45), lerp(S[1], E[1], .45)];
  const Am = [lerp(A[0], E[0], .5), lerp(A[1], E[1], .5)];
  shape(x, sm([A, Am, [Am[0] - 1 * u, Am[1] + 8 * u], [A[0] - 2 * u, A[1] + 10 * u]], true), c, { lw: 2 });
  shape(x, circ(Hd[0], Hd[1], 2.7 * u), skin, { lw: 2 });
  return Hd;
}
function mixd(c) { // slightly darker for the far arm
  const n = parseInt(c.slice(1), 16), f = .82;
  return `rgb(${((n >> 16) & 255) * f | 0},${((n >> 8) & 255) * f | 0},${(n & 255) * f | 0})`;
}

// —— props ——
export function teapot(x, H, u, tilt) {   // small iron pot (tetsubin), handle over the top, spout forward
  x.save(); x.translate(H[0], H[1]); x.rotate(tilt);
  shape(x, x => { x.moveTo(-3 * u, -2 * u); x.quadraticCurveTo(-1 * u, -12 * u, 9 * u, -7 * u); }, null, { lw: 2.2 });
  shape(x, sm([[-2 * u, 2 * u], [-1 * u, 7 * u], [6 * u, 9 * u], [13 * u, 7 * u], [14 * u, 2 * u], [11 * u, -1 * u], [2 * u, -1 * u]]), PAL.sumiL);
  shape(x, pl([[13 * u, 3 * u], [19 * u, -1 * u], [20 * u, 0], [14 * u, 6 * u]]), PAL.sumiL);
  shape(x, pl([[4 * u, -1 * u], [9 * u, -1 * u], [9 * u, -2.5 * u], [4 * u, -2.5 * u]]), PAL.woodD, { lw: 1.6 });
  x.restore();
  const c = Math.cos(tilt), s = Math.sin(tilt);
  return [H[0] + c * 19.5 * u - s * -0.5 * u, H[1] + s * 19.5 * u + c * -0.5 * u];
}

// the crooked tea bowl, side view; w = rim width
export function bowl(x, cx, cy, w, { blocks = 1, glaze = '#9a6a3c', drip = '#5e3f27', rim = PAL.beni, wide = false } = {}) {
  const h = w * .62, tilt = w * .05;
  const out = [[-w / 2, -h + tilt], [-w * .47, -h * .55], [-w * .33, -h * .14], [-w * .14, -2], [w * .14, -2], [w * .34, -h * .16], [w * .48, -h * .58], [w / 2, -h - tilt * .3]];
  const P = p => p.map(([a, b]) => [cx + a, cy + b]);
  const body = sm(P([...out, [0, -h - tilt * .2]]), true);
  shape(x, body, glaze, { lw: wide ? 5 : 2.4 });
  if (blocks > 1) {
    // darker glaze drip band near the rim
    x.save(); x.beginPath(); body(x); x.clip();
    x.fillStyle = drip; x.beginPath(); x.moveTo(cx - w, cy - h * .7);
    for (let i = 0; i <= 12; i++) { const X = -w / 2 + w * i / 12; x.lineTo(cx + X, cy - h * (.62 - (i % 2 ? .1 + .08 * Math.sin(i * 1.7) : 0))); }
    x.lineTo(cx + w, cy - h * 1.3); x.lineTo(cx - w, cy - h * 1.3); x.fill(); x.restore();
  }
  shape(x, pl(P([[-w * .18, -2], [w * .18, -2], [w * .16, h * .08], [-w * .16, h * .08]])), glaze, { lw: wide ? 4 : 2 });
  shape(x, sm(P([[-w / 2, -h + tilt], [0, -h - tilt * .2 - w * .05], [w / 2, -h - tilt * .3], [0, -h - tilt * .2 + w * .05]]), true), '#3a2a1e', { lw: wide ? 4 : 2 });
  return { top: [cx, cy - h] };
}

export function steam(x, cx, cy, s, t, a = 1) {   // three wisps, stepped at 8 fps
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = PAL.greyL; x.lineWidth = 2.2; x.lineCap = 'round';
  for (let k = -1; k <= 1; k++) {
    x.beginPath();
    for (let i = 0; i <= 10; i++) { const yy = cy - i * 5.5 * s, xx = cx + k * 9 * s + Math.sin(i * .6 + t * 5 + k * 2) * 4 * s; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }
    x.stroke();
  }
  x.restore();
}

// —— the figure ——
// o: {x, y (feet), h, dir, pose: stand|kneel|seat, bow, kimono, obi, skin, hair, face, step,
//     front: world target for the near hand, back: world target for the far hand, pot: tilt, bundle, mino, kasa, crest}
export function person(x, o) {
  const u = o.h / 100, dir = o.dir || 1, skin = o.skin || PAL.skin, kim = o.kimono, obi = o.obi || PAL.straw;
  const L = p => [(p[0] - o.x) * dir, p[1] - o.y];                 // world → local
  const Wd = p => [o.x + p[0] * dir, o.y + p[1]];                    // local → world
  x.save(); x.translate(o.x, o.y); x.scale(dir, 1);
  const pose = o.pose || 'stand', st = o.step || 0;
  const hip = pose === 'stand' ? [0, -48 * u] : pose === 'kneel' ? [0, -23 * u] : [0, -33 * u];
  const ta = -Math.PI / 2 + (o.bow || 0), td = dirv(ta), nv = [td[1], -td[0]];   // nv points backward
  const Sh = add(hip, td, 28 * u), N = add(hip, td, 31 * u), Hc = add(add(hip, td, 38.5 * u), [1.2 * u, 0]);
  const Sf = add(Sh, nv, -2 * u), Sb = add(Sh, nv, 2.5 * u);
  const rest = (S, k) => add(S, [k * 4 * u, 26 * u]);
  // far arm
  const tb = o.back ? L(o.back) : rest(Sb, .3);
  arm(x, Sb, tb, u, kim, skin, -1, true);
  // bundle on the back
  if (o.bundle) {
    const B = add(add(hip, td, 22 * u), nv, 10 * u);
    shape(x, sm([[B[0] - 9 * u, B[1] - 10 * u], [B[0] + 4 * u, B[1] - 13 * u], [B[0] + 9 * u, B[1] + 1 * u], [B[0] + 3 * u, B[1] + 12 * u], [B[0] - 9 * u, B[1] + 9 * u]], true), PAL.ai);
    x.fillStyle = PAL.white; for (const [a, b] of [[-4, -4], [3, -6], [-2, 5], [4, 4]]) { x.beginPath(); x.arc(B[0] + a * u, B[1] + b * u, 1.3 * u, 0, TAU); x.fill(); }
  }
  // lower body
  let lower;
  if (pose === 'stand') lower = [[hip[0] - 8.5 * u, hip[1] - 2 * u], [hip[0] + 8 * u, hip[1] - 2 * u], [11 * u + st * u, -3 * u], [-10 * u + st * .4 * u, -3 * u]];
  else if (pose === 'kneel') lower = [[-12 * u, -27 * u], [7 * u, -27 * u], [17 * u, -13 * u], [17 * u, -1 * u], [-13 * u, -1 * u], [-15 * u, -10 * u]];
  else lower = [[-9 * u, -37 * u], [8 * u, -37 * u], [20 * u, -33 * u], [21 * u, -25 * u], [19 * u, -2 * u], [9 * u, -2 * u], [8 * u, -24 * u], [-9 * u, -27 * u]];
  if (pose === 'stand') { shape(x, x => x.ellipse(st * u, -1 * u, 5 * u, 2 * u, 0, 0, TAU), PAL.woodD, { lw: 2 }); shape(x, x => x.ellipse(-st * .6 * u, -1 * u, 5 * u, 2 * u, 0, 0, TAU), PAL.woodD, { lw: 2 }); }
  if (pose === 'seat') shape(x, x => x.ellipse(19 * u, -1 * u, 5 * u, 2 * u, 0, 0, TAU), PAL.woodD, { lw: 2 });
  shape(x, pl(lower), kim);
  if (pose === 'stand') { x.strokeStyle = K; x.lineWidth = 1.6; x.beginPath(); x.moveTo(hip[0] + 2 * u, hip[1]); x.lineTo(4 * u + st * .5 * u, -4 * u); x.stroke(); }
  // straw cape
  if (o.mino) {
    const p = [add(Sh, nv, 5 * u), add(add(Sh, nv, -9 * u), td, -2 * u), add(add(hip, nv, -11 * u), td, 6 * u), add(add(hip, nv, 13 * u), td, 2 * u)];
    shape(x, pl(p), PAL.straw);
    x.strokeStyle = K; x.lineWidth = 1.4;
    for (let i = 1; i < 9; i++) { const a = [lerp(p[0][0], p[3][0], i / 9), lerp(p[0][1], p[3][1], i / 9)], b = [lerp(p[1][0], p[2][0], i / 9), lerp(p[1][1], p[2][1], i / 9)]; x.beginPath(); x.moveTo(lerp(a[0], b[0], .2), lerp(a[1], b[1], .2)); x.lineTo(lerp(a[0], b[0], .55), lerp(a[1], b[1], .55)); x.stroke(); }
  }
  // torso
  const torso = [add(hip, nv, 9 * u), add(hip, nv, -8.5 * u), add(Sh, nv, -8 * u), add(Sh, nv, 8 * u)];
  if (!o.mino) shape(x, pl(torso), kim);
  // obi
  if (!o.mino) shape(x, pl([add(add(hip, td, 2 * u), nv, 9 * u), add(add(hip, td, 2 * u), nv, -8.6 * u), add(add(hip, td, 9 * u), nv, -8.4 * u), add(add(hip, td, 9 * u), nv, 8.8 * u)]), obi);
  if (o.crest) for (const k of [-1, 1]) { const c = add(add(Sh, td, -6 * u), nv, k * 4.5 * u); shape(x, circ(c[0], c[1], 1.8 * u), PAL.ochre, { lw: 1.4 }); }
  // collar
  x.strokeStyle = PAL.white; x.lineWidth = 2.4 * u; x.lineCap = 'round';
  const C0 = add(Sh, nv, 3 * u), C1 = add(add(hip, td, 15 * u), nv, -4 * u);
  x.beginPath(); x.moveTo(C0[0], C0[1]); x.lineTo(C1[0], C1[1]); x.stroke();
  x.strokeStyle = K; x.lineWidth = 1.4; x.beginPath(); x.moveTo(C0[0] + 1.2 * u, C0[1]); x.lineTo(C1[0] + 1.2 * u, C1[1]); x.stroke();
  // neck + head
  shape(x, pl([add(N, nv, 2.6 * u), add(N, nv, -2.6 * u), add(add(N, td, 5 * u), nv, -2.6 * u), add(add(N, td, 5 * u), nv, 2.6 * u)]), skin, { key: false });
  head(x, Hc, u, o, skin);
  // near arm
  const tf = o.front ? L(o.front) : rest(Sf, 1);
  const Hf = arm(x, Sf, tf, u, kim, skin, -1, false);
  let spout = null;
  if (o.pot != null) { const sp = teapot(x, Hf, u, o.pot); spout = Wd(sp); }
  if (o.kasa) {   // wide straw hat
    const c = add(Hc, [0, -5 * u]);
    shape(x, pl([[c[0] - 20 * u, c[1] + 3 * u], [c[0] + 1 * u, c[1] - 9 * u], [c[0] + 21 * u, c[1] + 3 * u]]), PAL.straw);
    x.strokeStyle = K; x.lineWidth = 1.2; for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(c[0] + 1 * u, c[1] - 9 * u); x.lineTo(c[0] + i * 6 * u, c[1] + 3 * u); x.stroke(); }
  }
  x.restore();
  return { spout, hand: Wd(Hf), head: Wd(Hc) };
}

function head(x, c, u, o, skin) {
  const r = 7.6 * u, hair = o.hair || 'topknot';
  // round head, small nose forward (+x)
  shape(x, pl([[c[0] + r * .82, c[1] - r * .45], [c[0] + r * 1.18, c[1] + r * .12], [c[0] + r * .8, c[1] + r * .3]]), skin, { lw: 2 });
  shape(x, circ(c[0], c[1], r), skin);
  x.save(); x.translate(REGF[0], REGF[1]); x.fillStyle = skin; x.beginPath(); x.arc(c[0] + r * .6, c[1] - r * .08, r * .45, 0, TAU); x.fill(); x.restore();
  const hc = hair === 'bun' ? PAL.greyL : hair === 'grey' ? PAL.grey : K;
  if (hair === 'topknot' || hair === 'grey') {
    shape(x, x => { x.arc(c[0], c[1], r * 1.02, Math.PI * .55, Math.PI * 1.45); x.lineTo(c[0] - r * .1, c[1] - r * .4); x.lineTo(c[0] - r * .15, c[1] + r * .35); x.closePath(); }, hc);
    shape(x, x => { x.arc(c[0], c[1], r * 1.02, Math.PI * 1.45, Math.PI * 1.85); x.lineTo(c[0], c[1] - r * .3); x.closePath(); }, '#c9cbc2');   // shaved pate
    shape(x, sm([[c[0] - r * .55, c[1] - r * 1.05], [c[0] + r * .35, c[1] - r * 1.35], [c[0] + r * .6, c[1] - r * 1.15], [c[0] - r * .3, c[1] - r * .85]], true), hc);
  } else if (hair === 'bun') {
    shape(x, x => { x.arc(c[0], c[1], r * 1.04, Math.PI * .5, Math.PI * 1.75); x.quadraticCurveTo(c[0] + r * .2, c[1] - r * .55, c[0] - r * .2, c[1] + r * .2); x.closePath(); }, hc);
    shape(x, circ(c[0] - r * .95, c[1] - r * .7, r * .5), hc);
    shape(x, pl([[c[0] - r * 1.4, c[1] - r * 1.1], [c[0] - r * .5, c[1] - r * .35]], false), null, { lw: 2.2 });
  } else if (hair === 'girl') {
    shape(x, x => { x.arc(c[0], c[1], r * 1.08, Math.PI * .45, Math.PI * 1.9); x.lineTo(c[0] + r * .55, c[1] - r * .2); x.lineTo(c[0] - r * .2, c[1] - r * .1); x.lineTo(c[0] - r * .35, c[1] + r * 1.0); x.closePath(); }, K);
    shape(x, sm([[c[0] - r * .6, c[1] - r * 1.1], [c[0] - r * .1, c[1] - r * 1.5], [c[0] + r * .2, c[1] - r * 1.05]], true), PAL.beni, { lw: 1.6 });
  }
  // face in a few strokes
  const f = o.face || 'calm';
  x.strokeStyle = K; x.lineWidth = 2; x.lineCap = 'round';
  x.beginPath();
  if (f === 'smile' || f === 'warm') { x.moveTo(c[0] + r * .28, c[1] - r * .02); x.quadraticCurveTo(c[0] + r * .45, c[1] - r * .22, c[0] + r * .62, c[1] - r * .02); }
  else if (f === 'sad') { x.moveTo(c[0] + r * .3, c[1] - r * .2); x.lineTo(c[0] + r * .62, c[1] - r * .05); }
  else { x.moveTo(c[0] + r * .3, c[1] - r * .08); x.lineTo(c[0] + r * .62, c[1] - r * .1); }
  x.stroke();
  x.lineWidth = 1.6; x.beginPath(); x.moveTo(c[0] + r * .28, c[1] - r * .38); x.quadraticCurveTo(c[0] + r * .45, c[1] - r * (f === 'sad' ? .3 : .46), c[0] + r * .66, c[1] - r * (f === 'sad' ? .48 : .4)); x.stroke();
  x.beginPath();
  if (f === 'smile' || f === 'warm') { x.moveTo(c[0] + r * .55, c[1] + r * .5); x.quadraticCurveTo(c[0] + r * .7, c[1] + r * .62, c[0] + r * .82, c[1] + r * .48); }
  else { x.moveTo(c[0] + r * .58, c[1] + r * .55); x.lineTo(c[0] + r * .8, c[1] + r * .55); }
  x.stroke();
  if (f === 'sad') { x.fillStyle = PAL.sky; x.beginPath(); x.ellipse(c[0] + r * .4, c[1] + r * .4, r * .1, r * .18, 0, 0, TAU); x.fill(); }
  // ear
  x.lineWidth = 1.5; x.beginPath(); x.arc(c[0] - r * .1, c[1] + r * .05, r * .2, -1.2, 1.9); x.stroke();
}
