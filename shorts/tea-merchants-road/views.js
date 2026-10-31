// The six prints. Static scenery is drawn once per block (g0 key, g1 blues, g2 secondary, g3 reds);
// figures, weather and props are painted live each frame.
import { clamp, lerp, seg, ss, eio, eo, mulberry, vnoise, TAU } from '/core/lib.js';
import { W, H, FR, PAL, smooth, carve, bokashi, kasumi, rgba, mix } from './print.js';
import { person, bowl, steam, shape } from './rig.js';
import { T, q8, q12 } from './story.js';

const S = PAL.sumi;
// block-aware primitives
const F = (x, g, grp, path, col) => { if (g !== grp) return; x.fillStyle = col; x.beginPath(); path(x); x.fill(); };
const Kp = (x, g, path, lw = 2.6, col = S) => { if (g !== 0) return; x.strokeStyle = col; x.lineWidth = lw; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); path(x); x.stroke(); };
const rect = (a, b, c, d) => x => x.rect(a, b, c - a, d - b);
const poly = p => x => { x.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) x.lineTo(p[i][0], p[i][1]); x.closePath(); };
const sm = (p, closed = true) => x => smooth(x, p, closed);
const both = (x, g, grp, path, col, lw = 2.6) => { F(x, g, grp, path, col); Kp(x, g, path, lw); };

// ---------------------------------------------------------------- the doorway (dawn and dusk share one key block)
const BENCH = 1365;
function doorway(x, g, dusk) {
  // sky
  if (g === 1) {
    if (!dusk) bokashi(x, 0, FR.y0, W, 330, PAL.prus, .75, 0, { rough: 24, seed: 3 });
    else bokashi(x, 0, FR.y0, W, 470, PAL.prusD, 1, .15, { rough: 24, seed: 4, col2: PAL.prus });
  }
  if (g === 3) {
    if (!dusk) bokashi(x, 0, 250, W, 470, PAL.beniP, 0, .8, { rough: 20, seed: 5 });
    else bokashi(x, 0, 330, W, 480, PAL.beni, 0, .75, { rough: 20, seed: 6 });
  }
  // roof
  const roof = poly([[FR.x0 - 10, 405], [FR.x1 + 10, 385], [FR.x1 + 10, 545], [FR.x0 - 10, 565]]);
  F(x, g, 2, roof, dusk ? mix(PAL.greyD, PAL.prusD, .35) : PAL.greyD);
  if (g === 0) {
    Kp(x, g, roof, 3);
    for (let r = 0; r < 5; r++) Kp(x, g, x => { const y = 420 + r * 30; x.moveTo(FR.x0, y + 0); x.lineTo(FR.x1, y - 20); }, 1.4);
    for (let i = 0; i < 40; i++) { const X = FR.x0 + 12 + i * 25.5; Kp(x, g, x => { x.moveTo(X, 405 - i * .5 + 5); x.lineTo(X, 560 - i * .5); }, 1.1, PAL.sumiL); }
  }
  both(x, g, 2, rect(FR.x0, 560, FR.x1, 592), PAL.woodD);
  // wall
  F(x, g, 2, rect(FR.x0, 592, FR.x1, 1440), dusk ? mix(PAL.plaster, PAL.prusL, .28) : PAL.plaster);
  for (const [a, b] of [[70, 108], [520, 558], [932, 970]]) both(x, g, 2, rect(a, 592, b, 1440), dusk ? mix(PAL.wood, PAL.prusD, .3) : PAL.wood);
  both(x, g, 2, rect(FR.x0, 1404, FR.x1, 1440), PAL.woodD);
  // lattice window
  both(x, g, 2, rect(150, 760, 462, 1062), dusk ? '#3b3530' : PAL.greyD);
  if (dusk) F(x, g, 3, rect(156, 766, 456, 1056), rgba(PAL.ochreL, .9));      // lamplight inside
  for (let i = 0; i <= 13; i++) both(x, g, 2, rect(150 + i * 23, 760, 157 + i * 23, 1062), PAL.woodL, 1.2);
  both(x, g, 2, rect(140, 748, 472, 762), PAL.woodD); both(x, g, 2, rect(140, 1060, 472, 1074), PAL.woodD);
  // doorway + noren
  both(x, g, 2, rect(586, 700, 906, 1404), dusk ? '#2f2a26' : '#4a4540');
  if (dusk) F(x, g, 3, rect(600, 980, 892, 1404), rgba(PAL.ochre, .55));
  for (let i = 0; i < 3; i++) {
    const a = 590 + i * 104, p = poly([[a, 700], [a + 100, 700], [a + 100, 955 - (i === 1 ? 0 : 6)], [a, 955 - (i === 1 ? 6 : 0)]]);
    F(x, g, 1, p, PAL.ai); Kp(x, g, p, 2.4);
  }
  // crest on the middle panel: paper left unprinted
  if (g === 1) { x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(746, 830, 38, 0, TAU); x.fill(); x.restore(); }
  Kp(x, g, x => x.arc(746, 830, 38, 0, TAU), 2.4); Kp(x, g, x => { x.moveTo(746, 800); x.lineTo(746, 862); x.moveTo(722, 820); x.lineTo(770, 820); x.moveTo(728, 845); x.lineTo(764, 845); }, 3);
  both(x, g, 2, rect(570, 684, 922, 702), PAL.woodD);
  // bench (engawa)
  both(x, g, 2, rect(120, BENCH, 500, BENCH + 20), PAL.woodL);
  for (const a of [140, 470]) both(x, g, 2, rect(a, BENCH + 20, a + 14, 1440), PAL.woodD);
  // ground
  if (g === 2) bokashi(x, 0, 1440, W, FR.y1, PAL.ochreL, .75, .25, { rough: 14, seed: 8 });
  if (g === 2 && dusk) bokashi(x, 0, 1440, W, FR.y1, PAL.prusL, .15, .45, { rough: 14, seed: 9 });
  for (const [cx, cy, rx] of [[720, 1520, 62], [810, 1600, 70], [900, 1690, 76], [985, 1790, 80]]) both(x, g, 2, x => x.ellipse(cx, cy, rx, rx * .32, 0, 0, TAU), PAL.greyL, 2);
  Kp(x, g, x => { x.moveTo(FR.x0, 1440); x.lineTo(FR.x1, 1440); }, 3);
  // foreground branch: plum at dawn, maple at dusk
  if (g === 0) carve(x, [[FR.x0 - 20, 300], [150, 250], [280, 160], [430, 120], [560, 60]], 22, { seed: 3, col: S, taper: [0, .5] });
  if (g === 0) { carve(x, [[200, 220], [250, 280], [330, 300]], 8, { seed: 5, col: S }); carve(x, [[360, 135], [420, 200], [470, 210]], 7, { seed: 6, col: S }); }
  const R = mulberry(dusk ? 21 : 12);
  for (let i = 0; i < 24; i++) {
    const tt = R(), bx = lerp(60, 540, tt) + (R() - .5) * 60, by = lerp(290, 90, tt) + (R() - .5) * 70, r = 11 + R() * 7;
    if (!dusk) {
      const pet = x => { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; x.moveTo(bx + Math.cos(a) * r, by + Math.sin(a) * r); x.arc(bx + Math.cos(a) * r * .55, by + Math.sin(a) * r * .55, r * .45, 0, TAU); } };
      F(x, g, 3, pet, PAL.beniP); Kp(x, g, pet, 1.4);
      F(x, g, 3, x => x.arc(bx, by, r * .22, 0, TAU), PAL.beni);
    } else {
      const a0 = R() * TAU, leaf = x => { for (let k = 0; k < 5; k++) { const a = a0 + (k - 2) * .55; x.moveTo(bx, by); x.lineTo(bx + Math.cos(a - .18) * r * .6, by + Math.sin(a - .18) * r * .6); x.lineTo(bx + Math.cos(a) * r * 1.3, by + Math.sin(a) * r * 1.3); x.lineTo(bx + Math.cos(a + .18) * r * .6, by + Math.sin(a + .18) * r * .6); x.closePath(); } };
      F(x, g, 3, leaf, i % 3 ? PAL.beni : PAL.ochre); Kp(x, g, leaf, 1.3);
    }
  }
  // dusk lantern by the door
  if (dusk) {
    both(x, g, 2, rect(960, 600, 1000, 612), PAL.woodD);
    Kp(x, g, x => { x.moveTo(985, 612); x.lineTo(985, 640); }, 2);
    const lan = sm([[985, 640], [1015, 655], [1024, 700], [1015, 745], [985, 760], [955, 745], [946, 700], [955, 655]]);
    F(x, g, 3, lan, PAL.beni); Kp(x, g, lan, 2.6);
    both(x, g, 2, rect(962, 634, 1008, 646), S); both(x, g, 2, rect(962, 754, 1008, 766), S);
    if (g === 3) { x.fillStyle = PAL.ochreL; x.beginPath(); x.ellipse(985, 700, 16, 40, 0, 0, TAU); x.fill(); }
  }
}

// ---------------------------------------------------------------- river in rain
function river(x, g) {
  if (g === 1) { bokashi(x, 0, FR.y0, W, 700, PAL.greyD, .95, .05, { rough: 26, seed: 11, col2: PAL.grey }); }
  // far bank hills
  const hills = sm([[FR.x0 - 20, 760], [120, 690], [260, 655], [420, 690], [560, 640], [760, 620], [900, 670], [FR.x1 + 20, 650], [FR.x1 + 20, 780], [FR.x0 - 20, 780]]);
  F(x, g, 2, hills, PAL.greyL); Kp(x, g, sm([[FR.x0 - 20, 760], [120, 690], [260, 655], [420, 690], [560, 640], [760, 620], [900, 670], [FR.x1 + 20, 650]], false), 1.6, PAL.greyD);
  if (g === 2) kasumi(x, 520, 740, 900, 52, PAL.paper, .9);
  // water: banded blues with bokashi between bands
  if (g === 1) {
    x.fillStyle = PAL.skyL; x.fillRect(0, 760, W, 560);
    bokashi(x, 0, 780, W, 960, PAL.sky, 0, .9, { rough: 16, seed: 12 });
    bokashi(x, 0, 940, W, 1180, PAL.prusL, 0, .85, { rough: 18, seed: 13 });
    bokashi(x, 0, 1120, W, 1320, PAL.prus, 0, .95, { rough: 20, seed: 14 });
  }
  if (g === 0) for (let i = 0; i < 26; i++) { const y = 800 + i * 20, R = mulberry(i + 3), a = R() * 600, b = a + 120 + R() * 300; Kp(x, g, x => { x.moveTo(FR.x0 + a, y); x.lineTo(FR.x0 + b, y + 2); }, 1.4, i < 9 ? PAL.prusL : PAL.prusD); }
  // tiny ferry boat mid-river
  const boat = poly([[600, 1010], [760, 1010], [740, 1028], [620, 1028]]);
  both(x, g, 2, boat, PAL.woodD, 2); Kp(x, g, x => { x.moveTo(705, 1010); x.lineTo(760, 905); }, 2);
  both(x, g, 2, x => x.ellipse(690, 996, 9, 10, 0, 0, TAU), PAL.straw, 1.6);
  // near bank
  const bank = sm([[FR.x0 - 20, 1330], [300, 1290], [700, 1300], [FR.x1 + 20, 1270], [FR.x1 + 20, FR.y1 + 20], [FR.x0 - 20, FR.y1 + 20]]);
  F(x, g, 2, bank, PAL.greenL); Kp(x, g, sm([[FR.x0 - 20, 1330], [300, 1290], [700, 1300], [FR.x1 + 20, 1270]], false), 3);
  if (g === 2) bokashi(x, 0, 1300, W, FR.y1, PAL.greenD, .1, .7, { rough: 18, seed: 15 });
  // reeds
  const R = mulberry(31);
  for (let i = 0; i < 40; i++) { const bx = FR.x0 + R() * 1000, by = 1300 + R() * 40, hgt = 40 + R() * 70, lean = (R() - .3) * 30; if (bx > 300 && bx < 820) continue; Kp(x, g, x => { x.moveTo(bx, by); x.quadraticCurveTo(bx + lean * .3, by - hgt * .6, bx + lean, by - hgt); }, 2, PAL.greenD); }
  // shelter
  for (const a of [300, 790]) both(x, g, 2, rect(a, 1120, a + 16, 1460), PAL.wood);
  const roof = poly([[250, 1150], [860, 1150], [800, 1035], [310, 1035]]);
  F(x, g, 2, roof, PAL.straw); Kp(x, g, roof, 3);
  if (g === 0) for (let i = 0; i < 30; i++) { const X = 270 + i * 20; Kp(x, g, x => { x.moveTo(X + 6, 1045); x.lineTo(X, 1145); }, 1.2, PAL.woodD); }
  both(x, g, 2, rect(330, 1380, 520, 1396), PAL.woodL);   // bench
  for (const a of [340, 500]) both(x, g, 2, rect(a, 1396, a + 10, 1460), PAL.woodD);
  // foreground mooring post with rope
  both(x, g, 2, rect(955, 300, 1012, FR.y1 + 10), PAL.woodD, 3);
  if (g === 0) for (let i = 0; i < 9; i++) Kp(x, g, x => { x.moveTo(962, 360 + i * 120); x.lineTo(1005, 420 + i * 120); }, 1.2, S);
  for (let i = 0; i < 4; i++) both(x, g, 2, x => x.ellipse(983, 1180 + i * 14, 36, 9, 0, 0, TAU), PAL.straw, 2);
}

// ---------------------------------------------------------------- snow on the pass (paper is the white)
function pass(x, g) {
  if (g === 1) { bokashi(x, 0, FR.y0, W, 520, PAL.grey, .8, 0, { rough: 26, seed: 21, col2: PAL.greyL }); }
  const m1 = [[FR.x0 - 20, 1000], [180, 760], [330, 470], [400, 420], [470, 480], [640, 800], [760, 1000]];
  const m2 = [[420, 1050], [640, 700], [780, 560], [850, 540], [930, 610], [FR.x1 + 20, 760], [FR.x1 + 20, 1100]];
  for (const m of [m2, m1]) {
    F(x, g, 2, poly([...m, [m[m.length - 1][0], 1150], [m[0][0], 1150]]), PAL.paper);
    if (g === 1) { x.save(); x.beginPath(); poly([...m, [m[m.length - 1][0], 1150], [m[0][0], 1150]])(x); x.clip(); bokashi(x, 0, m === m1 ? 600 : 650, W, 1100, PAL.greyL, 0, .6, { rough: 30, seed: m === m1 ? 22 : 23 }); x.restore(); }
    if (g === 0) carve(x, m, 4, { seed: m === m1 ? 2 : 4, col: PAL.greyD, taper: [.15, .15] });
  }
  if (g === 0) for (let i = 0; i < 7; i++) carve(x, [[400 + i * 4, 440 + i * 30], [360 + i * 25, 640 + i * 40], [330 + i * 40, 900]], 2.2, { seed: 30 + i, col: PAL.grey });
  if (g === 2) { kasumi(x, 560, 960, 1000, 70, PAL.skyL, .8); kasumi(x, 360, 1090, 700, 46, PAL.skyL, .7); }
  // snowy ground and the path
  const ground = sm([[FR.x0 - 20, 1180], [400, 1150], [FR.x1 + 20, 1170], [FR.x1 + 20, FR.y1 + 20], [FR.x0 - 20, FR.y1 + 20]]);
  F(x, g, 2, ground, PAL.white); Kp(x, g, sm([[FR.x0 - 20, 1180], [400, 1150], [FR.x1 + 20, 1170]], false), 2.4, PAL.greyD);
  const path = poly([[540, 1170], [640, 1170], [FR.x1 + 20, 1880], [700, FR.y1 + 20]]);
  F(x, g, 2, path, rgba(PAL.ochreL, .55)); Kp(x, g, x => { x.moveTo(540, 1170); x.lineTo(700, FR.y1 + 20); x.moveTo(640, 1170); x.lineTo(FR.x1 + 20, 1880); }, 1.6, PAL.grey);
  // rock
  const rock = sm([[300, 1440], [320, 1370], [380, 1340], [470, 1350], [510, 1400], [500, 1445]]);
  F(x, g, 2, rock, PAL.grey); Kp(x, g, rock, 2.6);
  F(x, g, 2, sm([[318, 1372], [380, 1336], [470, 1346], [440, 1360], [360, 1366]]), PAL.white);
  // pine with snow on flat needle pads
  if (g === 0) carve(x, [[150, 1460], [170, 1250], [140, 1050], [190, 860], [240, 720]], 40, { seed: 7, col: S, taper: [0, .7] });
  if (g === 2) carve(x, [[150, 1460], [170, 1250], [140, 1050], [190, 860], [240, 720]], 33, { seed: 7, col: PAL.woodD, taper: [0, .7] });
  // branches reach out to flat needle pads: a flat top, a fringe of needle fans below, snow lying on top
  const pads = [[260, 700, 150, 230, 760], [90, 850, 120, 175, 900], [330, 900, 180, 200, 960], [100, 1060, 130, 160, 1100], [300, 1120, 160, 175, 1150]];
  for (const [cx, cy, w, bx, by] of pads) {
    if (g === 0) carve(x, [[bx, by], [(bx + cx) / 2, cy + 20], [cx, cy + 10]], 10, { seed: cx, col: S, taper: [0, .6] });
    if (g === 2) carve(x, [[bx, by], [(bx + cx) / 2, cy + 20], [cx, cy + 10]], 7, { seed: cx, col: PAL.woodD, taper: [0, .6] });
    const n = Math.round(w / 18), fan = x => { x.moveTo(cx - w / 2, cy); x.lineTo(cx + w / 2, cy); for (let i = n; i >= 0; i--) { const X = cx - w / 2 + i * w / n; x.lineTo(X, cy + 22 + (i % 2) * 6); } x.closePath(); };
    F(x, g, 2, fan, PAL.pine); Kp(x, g, fan, 2.2);
    if (g === 0) for (let i = 0; i < n * 3; i++) { const X = cx - w / 2 + (i + .5) * w / (n * 3); Kp(x, g, x => { x.moveTo(X, cy + 2); x.lineTo(X + (i % 3 - 1) * 3, cy + 20); }, .9, PAL.greenL); }
    const cap = sm([[cx - w / 2 - 6, cy + 3], [cx - w * .3, cy - 12], [cx + w * .1, cy - 16], [cx + w * .4, cy - 9], [cx + w / 2 + 6, cy + 3]]);
    F(x, g, 2, cap, PAL.white); Kp(x, g, sm([[cx - w / 2 - 6, cy + 3], [cx - w * .3, cy - 12], [cx + w * .1, cy - 16], [cx + w * .4, cy - 9], [cx + w / 2 + 6, cy + 3]], false), 1.6, PAL.grey);
  }
}

// ---------------------------------------------------------------- festival night
const LANT = [];
{ for (let row = 0; row < 3; row++) { const n = 6 - row % 2; for (let i = 0; i < n; i++) { const u = (i + .5) / n, X = lerp(FR.x0 + 40, FR.x1 - 40, u); LANT.push({ row, X, Y: 330 + row * 180 + Math.sin(u * Math.PI) * 60, ph: row * 1.3 + i * .7 }); } } }
function festival(x, g) {
  if (g === 1) { x.fillStyle = PAL.prusD; x.fillRect(0, 0, W, 1250); bokashi(x, 0, 700, W, 1150, PAL.prus, 0, 1, { rough: 22, seed: 41 }); }
  // strings
  for (let row = 0; row < 3; row++) Kp(x, g, x => { for (let i = 0; i <= 40; i++) { const u = i / 40, X = lerp(FR.x0 - 10, FR.x1 + 10, u), Y = 300 + row * 180 + Math.sin(u * Math.PI) * 60; i ? x.lineTo(X, Y) : x.moveTo(X, Y); } }, 1.6, S);
  // stalls
  for (const [a, b] of [[40, 380], [700, 1040]]) {
    const roof = poly([[a - 10, 930], [b + 10, 930], [b - 20, 870], [a + 20, 870]]);
    F(x, g, 2, roof, PAL.woodD); Kp(x, g, roof, 2.4);
    both(x, g, 2, rect(a + 10, 930, b - 10, 1100), '#3a3028');
    F(x, g, 3, rect(a + 20, 945, b - 20, 990), rgba(PAL.ochreL, .9));
    for (let k = 0; k < 4; k++) { const L = a + 40 + k * (b - a - 80) / 3; F(x, g, 3, x => x.ellipse(L, 905, 14, 20, 0, 0, TAU), PAL.beni); Kp(x, g, x => x.ellipse(L, 905, 14, 20, 0, 0, TAU), 1.6); }
  }
  // crowd silhouettes
  const R = mulberry(51);
  for (let i = 0; i < 26; i++) {
    const cx = FR.x0 + 10 + i * 39 + (R() - .5) * 14, top = 1060 + R() * 50, w = 32 + R() * 10;
    const body = sm([[cx - w / 2, 1260], [cx - w * .45, top + 34], [cx, top + 24], [cx + w * .45, top + 34], [cx + w / 2, 1260]]);
    F(x, g, 2, body, i % 3 ? '#2b2f3a' : '#3a2f33'); Kp(x, g, body, 1.4);
    F(x, g, 2, x => x.arc(cx, top + 12, 12, 0, TAU), '#1f1d22');
    if (i % 5 === 2) both(x, g, 3, poly([[cx + 6, top + 20], [cx + 34, top - 4], [cx + 36, top + 26]]), PAL.beniL, 1.2);
  }
  // ground
  F(x, g, 2, rect(FR.x0, 1250, FR.x1, FR.y1), '#5b5148');
  if (g === 2) bokashi(x, 0, 1250, W, FR.y1, '#2a2622', .2, .85, { rough: 16, seed: 42 });
  Kp(x, g, x => { x.moveTo(FR.x0, 1250); x.lineTo(FR.x1, 1250); }, 2.6);
  if (g === 3) bokashi(x, 0, 1250, W, 1420, PAL.ochre, .35, 0, { rough: 16, seed: 43 });
}
function lanterns(x, t, bright = 1) {
  const tq = q8(t);
  for (const L of LANT) {
    const sw = Math.sin(tq * 2.2 + L.ph) * .07;
    x.save(); x.translate(L.X, L.Y); x.rotate(sw);
    shape(x, x => { x.moveTo(0, 0); x.lineTo(0, 16); }, null, { lw: 1.6 });
    const body = x => smooth(x, [[0, 16], [26, 26], [34, 62], [26, 98], [0, 108], [-26, 98], [-34, 62], [-26, 26]], true);
    shape(x, body, L.row === 1 ? PAL.ochre : PAL.beni);
    x.fillStyle = rgba(PAL.ochreL, .85 * bright); x.beginPath(); x.ellipse(0, 62, 13, 32, 0, 0, TAU); x.fill();
    shape(x, x => x.rect(-18, 10, 36, 9), PAL.sumi, { lw: 1.4 }); shape(x, x => x.rect(-18, 104, 36, 9), PAL.sumi, { lw: 1.4 });
    x.strokeStyle = PAL.sumi; x.lineWidth = 1.2; for (const yy of [40, 62, 84]) { x.beginPath(); x.moveTo(-32, yy); x.lineTo(32, yy); x.stroke(); }
    x.restore();
  }
}

// ---------------------------------------------------------------- the city room
function city(x, g) {
  // transom and shoji
  both(x, g, 2, rect(FR.x0, FR.y0, FR.x1, 300), PAL.woodD);
  if (g === 0) for (let i = 0; i < 9; i++) Kp(x, g, x => { const X = 80 + i * 110; x.moveTo(X, 120); x.bezierCurveTo(X + 30, 70, X + 80, 170, X + 110, 120); }, 2, PAL.woodL);
  F(x, g, 2, rect(FR.x0, 300, FR.x1, 1200), PAL.white);
  if (g === 2) bokashi(x, 0, 300, W, 900, PAL.ochreL, .45, 0, { rough: 20, seed: 61 });
  for (let i = 0; i <= 4; i++) both(x, g, 2, rect(FR.x0 + i * 245 - 6, 300, FR.x0 + i * 245 + 8, 1200), PAL.wood, 2);
  if (g === 0) { for (let r = 1; r < 9; r++) Kp(x, g, x => { x.moveTo(FR.x0, 300 + r * 100); x.lineTo(FR.x1, 300 + r * 100); }, 1.3, PAL.woodD); for (let c = 0; c < 16; c++) Kp(x, g, x => { const X = FR.x0 + 61 + c * 61; x.moveTo(X, 300); x.lineTo(X, 1200); }, 1.3, PAL.woodD); }
  // a hanging scroll painting on the wall: a single gold coin (what this house values)
  both(x, g, 2, rect(140, 380, 330, 980), PAL.paperD);
  both(x, g, 3, x => x.ellipse(235, 640, 50, 80, 0, 0, TAU), PAL.ochre);
  // tatami: parallel, slanted lines
  F(x, g, 2, rect(FR.x0, 1200, FR.x1, FR.y1), PAL.straw);
  if (g === 2) bokashi(x, 0, 1200, W, FR.y1, PAL.woodL, .1, .55, { rough: 16, seed: 62 });
  Kp(x, g, x => { x.moveTo(FR.x0, 1200); x.lineTo(FR.x1, 1200); }, 3);
  for (const [ya, yb] of [[1200, 1880], [1520, 1520]]) if (ya !== yb) for (let i = -2; i < 6; i++) { const p = poly([[FR.x0 + i * 300, ya], [FR.x0 + i * 300 + 10, ya], [FR.x0 + i * 300 + 10 + 240, yb], [FR.x0 + i * 300 + 240, yb]]); F(x, g, 2, p, PAL.greenD); }
  Kp(x, g, x => { x.moveTo(FR.x0, 1520); x.lineTo(FR.x1, 1520); }, 1.6);
  F(x, g, 2, rect(FR.x0, 1514, FR.x1, 1526), PAL.greenD);
}

// ---------------------------------------------------------------- views
const KEN = { kimono: PAL.ai, obi: PAL.straw, hair: 'topknot' };
const pourPose = (t, a, b) => { const p = seg(t, a, b); return { raise: ss(seg(p, 0, .25)) * (1 - ss(seg(p, .82, 1))), tilt: ss(seg(p, .22, .4)) * (1 - ss(seg(p, .78, .92))), stream: p > .38 && p < .82 }; };
function pourScene(x, t, a, b, bowlP, kenX, kenY, kenH, pose, extra = {}) {
  const P = pourPose(q8(t), a, b);
  const hold = [bowlP[0] + 70, bowlP[1] - 60 - 40 * P.raise];
  const r = person(x, { x: kenX, y: kenY, h: kenH, dir: -1, pose, ...KEN, bundle: true, face: t > b ? 'warm' : 'calm', front: [lerp(kenX - 40, hold[0], P.raise), lerp(kenY - kenH * .45, hold[1], P.raise)], back: [kenX - 10, kenY - kenH * .5], pot: -P.tilt * 1.05, ...extra });
  if (P.stream && r.spout) {
    x.strokeStyle = PAL.ochreL; x.lineWidth = 3.5; x.lineCap = 'round';
    x.beginPath(); x.moveTo(r.spout[0], r.spout[1]); x.quadraticCurveTo(r.spout[0] - 6, (r.spout[1] + bowlP[1]) / 2, bowlP[0] + 4, bowlP[1] - 34); x.stroke();
  }
  return P;
}

export const VIEWS = [
  { id: 'dawn', bg: (x, g) => doorway(x, g, false), grain: [0, .12, .06, .08],
    paint(x, t) {
      const hand = ss(seg(t, T.hand[0], T.hand[1]));
      const bw = [lerp(492, 600, hand), lerp(1292, 1302, hand) - Math.sin(hand * Math.PI) * 16];
      // grandmother
      person(x, { x: 330, y: 1440, h: 290, dir: 1, bow: .22, kimono: PAL.greyD, obi: PAL.ochre, hair: 'bun', face: 'warm', front: hand < .5 ? [bw[0] + 30, bw[1] - 18] : [400, 1250], back: hand < .5 ? [bw[0] - 22, bw[1] - 14] : [360, 1270] });
      // Kenji: receives, bows, turns and walks out
      const bowP = ss(seg(t, T.bow[0], T.bow[0] + .35)) * (1 - ss(seg(t, T.bow[1] - .3, T.bow[1])));
      const walking = t > T.walk[0], wt = q8(t), wx = walking ? lerp(700, 1220, seg(wt, T.walk[0], T.walk[1])) : 700;
      if (!walking) person(x, { x: 700, y: 1440, h: 330, dir: -1, bow: .45 * bowP, ...KEN, bundle: true, face: 'calm', front: hand > .5 ? [bw[0] + 34, bw[1] - 16] : [640, 1240], back: hand > .5 ? [bw[0] - 18, bw[1] - 12] : [690, 1260] });
      else person(x, { x: wx, y: 1440, h: 330, dir: 1, ...KEN, bundle: true, face: 'calm', step: Math.sin(wt * 9) * 6, front: [wx + 14, 1262], back: [wx - 6, 1264] });
      if (!walking) bowl(x, bw[0], bw[1], 64, { blocks: 2 });
    } },
  { id: 'river', bg: river, grain: [0, .16, .06, 0],
    paint(x, t) {
      const bw = [560, 1268];
      person(x, { x: 420, y: 1440, h: 280, dir: 1, pose: 'seat', kimono: PAL.greyD, hair: 'grey', mino: true, kasa: true, face: t > T.pour1[1] ? 'warm' : 'calm', front: [bw[0] + 26, bw[1] - 16], back: [bw[0] - 24, bw[1] - 12] });
      bowl(x, bw[0], bw[1], 58, { blocks: 2 });
      pourScene(x, t, ...T.pour1, bw, 720, 1440, 330, 'stand');
      steam(x, bw[0], bw[1] - 44, 1, q8(t), ss(seg(t, T.pour1[0] + 1.2, T.pour1[1] + .4)));
      rain(x, t);
    } },
  { id: 'pass', bg: pass, grain: [0, .1, .05, 0],
    paint(x, t) {
      const bw = [530, 1262];
      person(x, { x: 400, y: 1430, h: 270, dir: 1, pose: 'seat', kimono: PAL.prusL, obi: PAL.greyD, hair: 'bun', bow: .12, face: t > T.pour2[1] ? 'warm' : 'calm', front: [bw[0] + 26, bw[1] - 16], back: [bw[0] - 24, bw[1] - 12] });
      bowl(x, bw[0], bw[1], 56, { blocks: 2 });
      pourScene(x, t, ...T.pour2, bw, 690, 1440, 330, 'stand');
      steam(x, bw[0], bw[1] - 42, 1, q8(t), ss(seg(t, T.pour2[0] + 1.2, T.pour2[1] + .4)));
      snow(x, t);
    } },
  { id: 'festival', bg: festival, grain: [0, .14, .05, .06],
    paint(x, t) {
      lanterns(x, t);
      const bw = [508, 1300], has = t > T.pour3[0] - .3;
      person(x, { x: 420, y: 1460, h: 205, dir: 1, kimono: PAL.beni, obi: PAL.ochre, hair: 'girl', face: has ? (t > T.pour3[1] - .3 ? 'smile' : 'calm') : 'sad', front: has ? [bw[0] + 22, bw[1] - 12] : [470, 1340], back: has ? [bw[0] - 22, bw[1] - 10] : [452, 1336] });
      if (has) bowl(x, bw[0], bw[1], 48, { blocks: 2 });
      pourScene(x, t, ...T.pour3, bw, 660, 1460, 330, 'kneel');
      if (has) steam(x, bw[0], bw[1] - 36, .9, q8(t), ss(seg(t, T.pour3[0] + 1.2, T.pour3[1] + .4)));
    } },
  { id: 'city', bg: city, grain: [0, 0, .06, .05],
    paint(x, t) {
      person(x, { x: 300, y: 1430, h: 320, dir: 1, pose: 'kneel', kimono: '#2a2a30', obi: PAL.greyD, hair: 'topknot', crest: true, face: 'calm', front: [400, 1300], back: [340, 1330] });
      const push = ss(seg(t, T.coins[0], T.coins[1]));
      const tx = lerp(470, 560, push), ty = 1440;
      shape(x, x => x.rect(tx - 110, ty - 22, 220, 26), '#201b18'); shape(x, x => x.rect(tx - 110, ty - 26, 220, 6), PAL.beni, { lw: 1.6 });
      for (let i = 0; i < 10; i++) { const cx = tx - 82 + (i % 5) * 41, cy = ty - 42 - (i < 5 ? 0 : 14); shape(x, x => x.ellipse(cx, cy, 15, 23, 0, 0, TAU), PAL.ochre, { lw: 2 }); x.strokeStyle = PAL.woodD; x.lineWidth = 1; for (const d of [-8, 0, 8]) { x.beginPath(); x.moveTo(cx - 9, cy + d); x.lineTo(cx + 9, cy + d); x.stroke(); } }
      person(x, { x: 820, y: 1430, h: 330, dir: -1, pose: 'kneel', ...KEN, bundle: true, face: 'calm', front: [748, 1318], back: [770, 1322] });
      bowl(x, 742, 1340, 56, { blocks: 2 });
    } },
  { id: 'dusk', bg: (x, g) => doorway(x, g, true), grain: [0, .12, .06, .08],
    paint(x, t) {
      const bw = [478, 1262];
      person(x, { x: 300, y: 1440, h: 270, dir: 1, pose: 'seat', kimono: PAL.greyD, obi: PAL.ochre, hair: 'bun', bow: .15, face: t > T.pour6[0] + 1 ? 'warm' : 'calm', front: [bw[0] + 24, bw[1] - 14], back: [bw[0] - 22, bw[1] - 12] });
      bowl(x, bw[0], bw[1], 54, { blocks: 2 });
      pourScene(x, t, ...T.pour6, bw, 640, 1440, 330, 'kneel', { bundle: false });
      steam(x, bw[0], bw[1] - 40, 1, q8(t), ss(seg(t, T.pour6[0] + 1.2, T.pour6[1] + 2)));
    } },
];

// weather, stepped
function rain(x, t) {
  const tq = q12(t), R = mulberry(Math.floor(tq * 12) + 7);
  x.save(); x.strokeStyle = rgba(PAL.sumiL, .55); x.lineWidth = 1.3;
  for (let i = 0; i < 260; i++) { const a = R() * (W + 300) - 150, b = R() * H, L = 70 + R() * 90; x.beginPath(); x.moveTo(a, b); x.lineTo(a - L * .12, b + L); x.stroke(); }
  x.strokeStyle = rgba(PAL.greyD, .35); x.lineWidth = 1;
  for (let i = 0; i < 140; i++) { const a = R() * (W + 300) - 150, b = R() * H, L = 60 + R() * 60; x.beginPath(); x.moveTo(a, b); x.lineTo(a - L * .2, b + L); x.stroke(); }
  x.restore();
}
function snow(x, t) {
  const tq = q8(t), R = mulberry(77);
  x.save();
  for (let i = 0; i < 140; i++) { const a = R() * W, b0 = R() * H, sp = 40 + R() * 50, r = 2.5 + R() * 4, yy = (b0 + tq * sp) % H, xx = a + Math.sin(tq * 1.3 + i) * 10; x.fillStyle = PAL.white; x.beginPath(); x.arc(xx, yy, r, 0, TAU); x.fill(); x.strokeStyle = rgba(PAL.grey, .5); x.lineWidth = .8; x.stroke(); }
  x.restore();
}
