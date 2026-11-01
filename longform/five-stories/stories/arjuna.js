// Story I: Arjuna and the Bird's Eye (scenes from the Arjuna short; closing curtain removed)
STORIES.arjuna = (function () {
const TL = LT.stories.arjuna, CAPTEXT = TL.caps, DURATION = TL.dur;
// ================= Arjuna and the Bird's Eye: characters, sets, scenes =================
const CT = TL.ct, SCN = TL.scenes;
const ca = i => CT[i][0], cb = i => CT[i][1];
const VO = i => TL.voice[i][0];

// ---------- archer (feet at origin, faces +x) ----------
function archer(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  const skin = o.skin || PAL.kart, cloth = o.cloth || PAL.red;
  if (o.rods !== false) rods([[-16, -82], [20, -100]]);
  const wk = o.walk != null ? o.walk : null, sw = wk != null ? Math.sin(wk) * 6 : 0, bob = wk != null ? -Math.abs(Math.sin(wk)) * 2 : 0;
  X.translate(0, bob);
  limb([[-6, -58], [-8 + sw * .5, -30], [-7 + sw, 0]], skin, 7); limb([[6, -58], [8 - sw * .5, -30], [7 - sw, 0]], skin, 7);
  P(() => { X.moveTo(-15, -84); X.lineTo(15, -84); X.lineTo(18, -40); X.quadraticCurveTo(0, -33, -18, -40); X.closePath(); }); fs(cloth);
  trim(() => { X.moveTo(-17, -44); X.quadraticCurveTo(0, -37, 17, -44); });
  P(() => { X.moveTo(-14, -124); X.lineTo(14, -124); X.lineTo(12, -84); X.lineTo(-12, -84); X.closePath(); }); fs(skin);
  trim(() => { X.moveTo(-12, -122); X.lineTo(10, -86); }, '#f7f0e2', [], 1);
  trim(() => { X.arc(0, -122, 9, 0.3, Math.PI - 0.3); }, PAL.gold, [1.4, 1.8], 1.6);
  // quiver on the back
  P(() => { X.moveTo(-16, -128); X.lineTo(-10, -132); X.lineTo(-4, -88); X.lineTo(-10, -86); X.closePath(); }); fs('#7a4a24');
  for (let i = 0; i < 3; i++) { P(() => { X.moveTo(-14 + i * 2, -130); X.lineTo(-17 + i * 3, -142); }); X.strokeStyle = SIL ? SILC : '#d9c79a'; X.lineWidth = 1; X.stroke(); }
  // arms + bow
  const up = o.bowUp ?? 0, a = o.aim ?? -0.9, dr = o.draw ?? 0;
  const SF = [12, -118], SB = [-8, -118], dv = [Math.cos(a), Math.sin(a)], pv = [-dv[1], dv[0]];
  const rest = [18, -76];
  const H1 = [lerp(rest[0], SF[0] + dv[0] * 44, up), lerp(rest[1], SF[1] + dv[1] * 44, up)];
  const pull = 12 + 26 * dr;
  const H2 = up > .5 ? [H1[0] - dv[0] * pull, H1[1] - dv[1] * pull] : [-14, -80];
  const E2 = [lerp(-20, (SB[0] + H2[0]) / 2 - pv[0] * 8, up), lerp(-98, (SB[1] + H2[1]) / 2 - pv[1] * 8 - 6, up)];
  limb([SB, E2, H2], skin, 5.5);
  // bow: tips bend back as it is drawn
  const ba = up > .01 ? 1 : 0, bdv = up > .5 ? dv : [0, -1], bpv = up > .5 ? pv : [1, 0];
  const L = 40, flex = 8 + 10 * dr;
  const T1 = [H1[0] + bpv[0] * L - bdv[0] * flex, H1[1] + bpv[1] * L - bdv[1] * flex], T2 = [H1[0] - bpv[0] * L - bdv[0] * flex, H1[1] - bpv[1] * L - bdv[1] * flex];
  if (!SIL) { P(() => { X.moveTo(T1[0], T1[1]); X.quadraticCurveTo(H1[0] + bdv[0] * 10, H1[1] + bdv[1] * 10, T2[0], T2[1]); }); X.strokeStyle = PAL.gold; X.lineWidth = 4.2; X.lineCap = 'round'; X.stroke(); }
  P(() => { X.moveTo(T1[0], T1[1]); X.quadraticCurveTo(H1[0] + bdv[0] * 10, H1[1] + bdv[1] * 10, T2[0], T2[1]); }); X.strokeStyle = SIL ? SILC : '#7a4a24'; X.lineWidth = 2.6; X.stroke();
  const nock = up > .5 ? H2 : [H1[0] - bdv[0] * flex, H1[1] - bdv[1] * flex];
  P(() => { X.moveTo(T1[0], T1[1]); X.lineTo(nock[0], nock[1]); X.lineTo(T2[0], T2[1]); }); X.strokeStyle = SIL ? SILC : '#efe6cf'; X.lineWidth = .7; X.stroke();
  if (o.arrow && up > .5) {
    const tip = [H2[0] + dv[0] * 62, H2[1] + dv[1] * 62];
    P(() => { X.moveTo(H2[0], H2[1]); X.lineTo(tip[0], tip[1]); }); X.strokeStyle = SIL ? SILC : '#d9c79a'; X.lineWidth = 1.4; X.stroke();
    P(() => { X.moveTo(tip[0] + dv[0] * 5, tip[1] + dv[1] * 5); X.lineTo(tip[0] + pv[0] * 2.5, tip[1] + pv[1] * 2.5); X.lineTo(tip[0] - pv[0] * 2.5, tip[1] - pv[1] * 2.5); X.closePath(); }); fs('#cfcfcf', '#7a7a7a', .5);
    P(() => { X.moveTo(H2[0] + dv[0] * 6, H2[1] + dv[1] * 6); X.lineTo(H2[0] - pv[0] * 3, H2[1] - pv[1] * 3); X.lineTo(H2[0] + dv[0] * 2, H2[1] + dv[1] * 2); X.lineTo(H2[0] + pv[0] * 3, H2[1] + pv[1] * 3); X.closePath(); }); fs(PAL.red, null);
  }
  limb([SF, [lerp(24, (SF[0] + H1[0]) / 2, up), lerp(-100, (SF[1] + H1[1]) / 2, up)], H1], skin, 5.5);
  // head (profile right), crown
  P(() => X.rect(-4, -132, 8, 8)); fs(skin, null);
  P(() => ell(0, -142, 11, 12)); fs(skin);
  if (!SIL) {
    const ey = o.focus ? 1.0 : 1.9;
    P(() => ell(4.5, -144, 1.7, ey)); X.fillStyle = '#1b120b'; X.fill();
    P(() => { X.moveTo(1.5, -136); X.quadraticCurveTo(4.5, -134 + (o.smile ? 2 : 0), 7.5, -136); }); X.strokeStyle = '#7a3a1c'; X.lineWidth = .9; X.stroke();
    P(() => { X.moveTo(-11, -144); X.quadraticCurveTo(-15, -128, -9, -120); X.lineTo(-6, -140); X.closePath(); }); X.fillStyle = '#1d140e'; X.fill();
    P(() => ell(1, -144.5, 1.2, 1.2)); X.fillStyle = PAL.red; X.fill();
  }
  const cr = o.crown || '#e9bb3a';
  P(() => { X.moveTo(-11, -150); X.lineTo(11, -150); X.lineTo(7, -168); X.lineTo(0, -184 - (o.tall ? 6 : 0)); X.lineTo(-7, -168); X.closePath(); }); fs(cr, '#9b6a1c', .8);
  trim(() => { X.moveTo(-9, -158); X.lineTo(9, -158); }, PAL.red, [], 1.3);
  if (o.feather && !SIL) { P(() => { X.moveTo(4, -170); X.quadraticCurveTo(14, -190, 8, -200); X.quadraticCurveTo(4, -186, 4, -170); }); fs('#2f7fb8', PAL.gold, .5); P(() => ell(8.5, -194, 2, 3)); fs('#d8b545', null); }
  X.restore();
  return { H1: [x + (o.dir || 1) * s * H1[0], y + s * (H1[1] + bob)], H2: [x + (o.dir || 1) * s * H2[0], y + s * (H2[1] + bob)], dv: [dv[0] * (o.dir || 1), dv[1]] };
}

// ---------- Guru Drona ----------
function drona(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  if (o.rods !== false) rods([[-14, -80], [18, -100]]);
  const skin = '#d9a777';
  // staff
  P(() => { X.moveTo(-22, 2); X.lineTo(-22, -160); }); X.strokeStyle = SIL ? SILC : '#7a4a24'; X.lineWidth = 2.4; X.stroke();
  // long dhoti + shawl
  P(() => { X.moveTo(-17, -86); X.lineTo(17, -86); X.lineTo(21, 0); X.lineTo(-21, 0); X.closePath(); }); fs('#d9822b');
  trim(() => { X.moveTo(-20, -4); X.lineTo(20, -4); });
  P(() => { X.moveTo(-15, -126); X.lineTo(15, -126); X.lineTo(14, -86); X.lineTo(-14, -86); X.closePath(); }); fs(skin);
  P(() => { X.moveTo(-15, -126); X.lineTo(4, -126); X.lineTo(16, -88); X.lineTo(4, -84); X.closePath(); }); fs('#e9a24a');
  trim(() => { X.moveTo(-12, -122); X.lineTo(12, -90); }, PAL.gold, [1.4, 1.8], 1.4);
  // arms
  const pt = o.point || 0, bl = o.bless || 0;
  limb([[-13, -120], [-20, -100], [-22, -86]], skin, 5.5);
  const hx = lerp(16, 34, pt) + bl * 2, hy = lerp(-82, -150, pt) + lerp(0, -40, bl);
  limb([[13, -120], [lerp(22, 26, pt), lerp(-100, -134, pt) + bl * -18], [hx, hy]], skin, 5.5);
  if (pt > .5) { P(() => { X.moveTo(hx, hy); X.lineTo(hx + 4, hy - 7); }); X.strokeStyle = SIL ? SILC : skin; X.lineWidth = 2.4; X.stroke(); }
  if (bl > .3) { P(() => ell(hx, hy - 3, 4, 6)); fs(skin); glow(hx, hy - 3, 24, '#ffd27a', .4 * bl); }
  // head, white beard, hair bun
  P(() => X.rect(-4, -134, 8, 8)); fs(skin, null);
  P(() => ell(0, -144, 11, 12)); fs(skin);
  P(() => { X.moveTo(-7, -140); X.quadraticCurveTo(-4, -112, 6, -110); X.quadraticCurveTo(14, -122, 11, -140); X.quadraticCurveTo(4, -134, -7, -140); }); fs('#efe9dc', '#b9b0a0', .6);
  P(() => { X.moveTo(-12, -146); X.quadraticCurveTo(-8, -160, 4, -158); X.quadraticCurveTo(12, -156, 11, -148); X.quadraticCurveTo(0, -152, -12, -146); }); fs('#e2dccd', '#b9b0a0', .6);
  P(() => ell(-4, -162, 7, 6)); fs('#e2dccd', '#b9b0a0', .6);
  if (!SIL) { P(() => ell(4.5, -145, 1.6, 1.2)); X.fillStyle = '#1b120b'; X.fill(); trim(() => { X.moveTo(1, -149); X.lineTo(8, -150); }, '#f4efe4', [], 1.4); trim(() => { X.moveTo(-6, -152); X.lineTo(6, -152); X.moveTo(-6, -154.5); X.lineTo(6, -154.5); }, '#f4efe4', [], .7); P(() => ell(0, -153, 1, 1.6)); X.fillStyle = PAL.red; X.fill(); }
  X.restore();
}

// ---------- sets ----------
const forestTrees = (() => { const r = rng(17); return Array.from({ length: 14 }, (_, i) => [r() * 400 - 20, 360 + r() * 90, 40 + r() * 50, r()]); })();
function forestBG(t) {
  const g = X.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#13283a'); g.addColorStop(.45, '#3d5560'); g.addColorStop(.62, '#c98a52'); g.addColorStop(.75, '#2a1d15'); g.addColorStop(1, '#120c08');
  X.fillStyle = g; X.fillRect(-200, -200, W + 400, H + 400);
  starfield(t, .35, 200);
  glow(90, 400, 140, '#ffbe6a', .55); P(() => X.arc(90, 400, 20, 0, TAU)); X.fillStyle = '#ffd9a0'; X.fill();
  // hills
  P(() => { X.moveTo(-200, 430); X.quadraticCurveTo(60, 370, 200, 420); X.quadraticCurveTo(300, 380, 560, 410); X.lineTo(560, 700); X.lineTo(-200, 700); X.closePath(); }); X.fillStyle = '#2c3a3a'; X.fill();
  // tree line silhouettes with gold rim
  for (const [x, y, h, k] of forestTrees) {
    P(() => { X.moveTo(x, y + 60); X.lineTo(x, y); }); X.strokeStyle = '#1d2422'; X.lineWidth = 4; X.stroke();
    P(() => { ell(x, y - h * .25, h * .32, h * .4); }); fs(k > .5 ? '#22352e' : '#1c2b27', 'rgba(233,187,98,.25)', .6);
  }
  // ashram hut
  P(() => { X.moveTo(-30, 470); X.lineTo(-30, 420); X.lineTo(60, 420); X.lineTo(60, 470); X.closePath(); }); fs('#6b4a2a');
  P(() => { X.moveTo(-50, 425); X.lineTo(15, 380); X.lineTo(80, 425); X.closePath(); }); fs('#b99a55');
  for (let i = 0; i < 9; i++) trim(() => { X.moveTo(15, 382); X.lineTo(-44 + i * 15, 424); }, '#7a6235', [], .6);
  P(() => X.rect(8, 440, 18, 30)); fs('#1c130c', null);
  // ground
  const gg = X.createLinearGradient(0, 465, 0, H); gg.addColorStop(0, '#4a3520'); gg.addColorStop(1, '#140d08');
  P(() => { X.moveTo(-200, 470); X.quadraticCurveTo(180, 455, 560, 470); X.lineTo(560, 900); X.lineTo(-200, 900); X.closePath(); }); X.fillStyle = gg; X.fill();
  X.strokeStyle = 'rgba(233,187,98,.4)'; X.lineWidth = .8; P(() => { X.moveTo(-200, 470); X.quadraticCurveTo(180, 455, 560, 470); }); X.stroke();
  // mist
  for (let i = 0; i < 3; i++) glow(((t * 5 + i * 150) % 520) - 80, 450 + i * 10, 100, '#c9b49a', .12);
}

const BIRD = [262, 168];
const LEAVES = (() => { const r = rng(5); const out = []; for (const [cx, cy, n, rad] of [[262, 175, 9, 60], [330, 230, 7, 50], [200, 230, 7, 46], [300, 300, 6, 46], [240, 120, 6, 44]]) for (let i = 0; i < n; i++) out.push([cx + (r() - .5) * rad * 1.6, cy + (r() - .5) * rad, 16 + r() * 12, r()]); return out; })();
function tree(t, o = {}) {
  // trunk + branches
  const trunk = () => { X.moveTo(300, 600); X.bezierCurveTo(286, 500, 300, 420, 290, 330); X.lineTo(290, 330); };
  for (const [w, c] of [[24, PAL.gold], [21, '#5a3a20']]) {
    X.lineCap = 'round'; X.strokeStyle = SIL ? SILC : c; X.lineWidth = w; P(trunk); X.stroke();
    X.lineWidth = w * .45;
    P(() => { X.moveTo(292, 360); X.quadraticCurveTo(270, 260, BIRD[0] - 4, BIRD[1] + 14); }); X.stroke();
    P(() => { X.moveTo(294, 380); X.quadraticCurveTo(330, 300, 345, 240); }); X.stroke();
    P(() => { X.moveTo(290, 400); X.quadraticCurveTo(230, 330, 205, 245); }); X.stroke();
    P(() => { X.moveTo(292, 420); X.quadraticCurveTo(320, 360, 310, 310); }); X.stroke();
  }
  // perch twig under the bird
  P(() => { X.moveTo(BIRD[0] - 22, BIRD[1] + 13); X.lineTo(BIRD[0] + 20, BIRD[1] + 11); }); X.strokeStyle = SIL ? SILC : '#5a3a20'; X.lineWidth = 3; X.stroke();
  // leaf clusters (sway gently)
  for (const [x, y, r, k] of LEAVES) {
    const sx = Math.sin(t * 1.2 + k * 6) * 1.5;
    if (Math.hypot(x - BIRD[0], y - BIRD[1]) < 22) continue;
    P(() => ell(x + sx, y, r, r * .72)); fs(k > .6 ? '#2f6b4a' : k > .3 ? '#3f7d4f' : '#285a40', 'rgba(233,187,98,.6)', .7);
    if (!SIL) trim(() => { X.moveTo(x + sx - r * .5, y); X.quadraticCurveTo(x + sx, y - r * .3, x + sx + r * .5, y); }, 'rgba(233,187,98,.5)', [], .6);
  }
  if (o.hl) o.hl();
  bird(t, o);
}
function bird(t, o = {}) {
  const [bx, by] = BIRD;
  X.save(); X.translate(bx, by);
  P(() => { X.moveTo(-14, 2); X.quadraticCurveTo(-4, -10, 8, -6); X.quadraticCurveTo(14, 4, 2, 10); X.quadraticCurveTo(-10, 10, -14, 2); }); fs('#b07a3e', '#5a3a20', .8);
  P(() => { X.moveTo(-14, 2); X.lineTo(-24, -4); X.lineTo(-22, 6); X.closePath(); }); fs('#9a6a34', '#5a3a20', .7);
  trim(() => { X.moveTo(-8, 2); X.quadraticCurveTo(-2, -2, 4, 2); X.moveTo(-6, 6); X.quadraticCurveTo(0, 3, 5, 6); }, '#5a3a20', [], .7);
  P(() => X.arc(8, -8, 6, 0, TAU)); fs('#c08a4c', '#5a3a20', .8);
  P(() => { X.moveTo(13, -9); X.lineTo(19, -7); X.lineTo(13, -6); X.closePath(); }); fs(PAL.red, '#5a3a20', .5);
  // the eye
  if (!SIL) { P(() => X.arc(9.5, -9, 1.9, 0, TAU)); X.fillStyle = '#fbf3df'; X.fill(); P(() => X.arc(10, -9, 1.0, 0, TAU)); X.fillStyle = '#0d0a08'; X.fill(); }
  X.restore();
  if (o.arrowIn) {   // arrow struck in the eye
    const ex = bx + 10, ey = by - 9, dv = o.arrowIn;
    P(() => { X.moveTo(ex, ey); X.lineTo(ex - dv[0] * 58, ey - dv[1] * 58); }); X.strokeStyle = '#d9c79a'; X.lineWidth = 1.5; X.stroke();
    const fx = ex - dv[0] * 56, fy = ey - dv[1] * 56, pv = [-dv[1], dv[0]];
    P(() => { X.moveTo(fx, fy); X.lineTo(fx - dv[0] * 6 + pv[0] * 3.5, fy - dv[1] * 6 + pv[1] * 3.5); X.lineTo(fx + dv[0] * 4, fy + dv[1] * 4); X.lineTo(fx - dv[0] * 6 - pv[0] * 3.5, fy - dv[1] * 6 - pv[1] * 3.5); X.closePath(); }); fs(PAL.red, null);
  }
}
const EYE = [BIRD[0] + 10, BIRD[1] - 9];
function ring(x, y, r, a = 1) { if (a <= 0) return; X.save(); X.strokeStyle = `rgba(255,222,140,${a})`; X.lineWidth = 1.6; X.shadowColor = '#ffd27a'; X.shadowBlur = 10; P(() => X.arc(x, y, r, 0, TAU)); X.stroke(); X.restore(); }
function hlAt(list, t, i) { // highlight rings that pop as their word is spoken: [frac, x, y, r]
  const a = VO(i), d = TL.voice[i][1] - TL.voice[i][0];
  for (const [f, x, y, r] of list) { const p = seg(t, a + f * d - .1, a + f * d + .3); const out = 1 - seg(t, cb(i) - .3, cb(i)); ring(x, y, r * (1.25 - .25 * easeOut(p)), p * out * .95); if (p > 0 && p < 1) sparkle(x, y - r, 3, 1 - p); }
}
// darkness everywhere except a hole (world → screen is the camera, so the hole is drawn in world space)
function focusDark(cx, cy, r, a) {
  if (a <= 0) return;
  const g = X.createRadialGradient(cx, cy, r, cx, cy, r * 1.8 + 6);
  g.addColorStop(0, 'rgba(8,5,3,0)'); g.addColorStop(1, `rgba(8,5,3,${a})`);
  X.fillStyle = g; X.fillRect(-400, -400, W + 800, H + 800);
}
const AIM = Math.atan2(EYE[1] - 455, EYE[0] - 128);   // from the archer's bow hand to the eye

const PRINCES = [
  { cloth: '#f1e4c6', crown: '#e9bb3a' },              // the eldest
  { cloth: PAL.red, crown: '#d9a12b' },
  { cloth: '#6a4a86', crown: '#c9a33a' },
  { cloth: '#2f7a6a', crown: '#e9bb3a', feather: true }, // Arjuna
];
const ARJ = PRINCES[3];

// ---------- scenes ----------
function sSchool(lt, t) {
  forestBG(t);
  const pt = ease(seg(t, ca(1), ca(1) + .5));
  drona(110, 575, .78, { point: pt });
  PRINCES.forEach((p, i) => archer(190 + i * 42, 585 + (i % 2) * 6, .6, { ...p, dir: -1, bowUp: 0 }));
}
function sTree(lt, t) {
  forestBG(t);
  tree(t);
  const sp = seg(t, ca(2) + 1.2, ca(2) + 2.6);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t; sparkle(BIRD[0] + Math.cos(a) * 26, BIRD[1] + Math.sin(a) * 18, 2.2, sp * (1 - seg(t, ca(3), ca(3) + .5)) * (.5 + .5 * Math.sin(t * 5 + i))); }
  drona(95, 575, .95, { point: ease(seg(t, ca(3) - .2, ca(3) + .4)) });
  if (t > ca(4)) ring(EYE[0], EYE[1], 9 + 2 * Math.sin(t * 4), .8 * seg(t, ca(4), ca(4) + .4));
}
function sTest(lt, t, k) {   // k = 0: eldest (lines 5–7), 1: the next prince (8–9)
  forestBG(t);
  const line = k === 0 ? 6 : 8, aside = k === 0 ? 7 : 9;
  tree(t, { hl: () => hlAt(k === 0 ? [[.16, 292, 470, 34], [.35, 312, 270, 30], [.55, 210, 230, 26]] : [[.22, 120, 120, 40], [.42, BIRD[0], BIRD[1], 22]], t, line) });
  const p = PRINCES[k];
  drona(38, 575, .7, {});
  if (k === 1) hlAt([[.75, 38, 500, 30]], t, line);
  if (k === 0) { hlAt([[.9, 60, 535, 28]], t, line); archer(30, 600, .5, { ...PRINCES[2], dir: 1 }); archer(56, 604, .5, { ...PRINCES[3], dir: 1 }); }
  const up = ease(seg(t, (k === 0 ? ca(5) : ca(8)) + .2, (k === 0 ? ca(5) : ca(8)) + 1.2)) * (1 - ease(seg(t, ca(aside), ca(aside) + .6)));
  const leave = ease(seg(t, ca(aside) + .6, cb(aside)));
  archer(lerp(128, -80, leave), 580, .82, { ...p, bowUp: up, draw: up * .8, aim: AIM, arrow: true, dir: leave > .02 ? -1 : 1, walk: leave > .02 ? t * 9 : null });
  if (t > ca(aside) - .1 && t < ca(aside) + 1.2) drona(38, 575, .7, { point: ease(seg(t, ca(aside), ca(aside) + .3)) });
}
function sOneByOne(lt, t) {
  forestBG(t); tree(t);
  drona(38, 575, .7, {});
  const a = ca(10), d = cb(10) - a;
  [0, 1, 2].forEach(i => { const p = ease(seg(t, a + i * d * .25, a + i * d * .25 + .9)); archer(lerp(110 + i * 40, -90, p), 595, .62, { ...PRINCES[i], dir: p > .02 ? -1 : 1, walk: p > .02 ? t * 9 : null }); });
}
function sArjuna(lt, t) {
  forestBG(t); tree(t);
  drona(38, 575, .7, { point: ease(seg(t, ca(12), ca(12) + .3)) * (1 - ease(seg(t, cb(12), cb(12) + .3))) });
  const enter = ease(seg(t, ca(11) - .3, ca(11) + 1.2));
  const up = ease(seg(t, ca(11) + 1.2, ca(11) + 2.2));
  const rel = TL.release, dr = up * (.75 + .25 * seg(t, ca(13), ca(15)));
  const loose = t > rel - .25;
  archer(lerp(-60, 128, enter), 580, .82, { ...ARJ, bowUp: up, draw: loose ? 0 : dr, aim: AIM, arrow: !loose, walk: enter < 1 ? t * 9 : null, focus: t > ca(13) });
  // the world goes dark: first everything but the bird, then everything but its eye
  const f1 = ease(seg(t, ca(13) + .2, ca(13) + 1.4)), f2 = ease(seg(t, ca(15), ca(15) + .9));
  const r = lerp(lerp(600, 30, f1), 3.5, f2);
  focusDark(f2 > 0 ? EYE[0] : BIRD[0], f2 > 0 ? EYE[1] : BIRD[1], r, .93 * f1);
  if (f2 > 0) { glow(EYE[0], EYE[1], 26, '#ffe7a8', .6 * f2); ring(EYE[0], EYE[1], 6 + Math.sin(t * 6) * .8, f2 * .9); }
  if (loose) { const p = seg(t, rel - .25, rel); sparkle(128 + Math.cos(AIM) * 40, 455 + Math.sin(AIM) * 40, 6 * (1 - p), 1 - p); }
}
function sArrow(lt, t) {
  forestBG(t); tree(t);
  focusDark(EYE[0], EYE[1], 3.5, .93);
  glow(EYE[0], EYE[1], 26, '#ffe7a8', .6);
  const p = easeIn(seg(t, SCN.s7[0], SCN.s7[1] - .05));
  const sx = 128 + Math.cos(AIM) * 60, sy = 455 + Math.sin(AIM) * 60;
  const ax = lerp(sx, EYE[0] - Math.cos(AIM) * 4, p), ay = lerp(sy, EYE[1] - Math.sin(AIM) * 4, p);
  const dv = [Math.cos(AIM), Math.sin(AIM)], pv = [-dv[1], dv[0]];
  for (let i = 1; i < 10; i++) { X.strokeStyle = `rgba(255,226,150,${.35 * (1 - i / 10)})`; X.lineWidth = 2; P(() => { X.moveTo(ax - dv[0] * i * 8, ay - dv[1] * i * 8); X.lineTo(ax - dv[0] * (i * 8 + 6), ay - dv[1] * (i * 8 + 6)); }); X.stroke(); }
  glow(ax, ay, 30, '#fff1c4', .5);
  P(() => { X.moveTo(ax, ay); X.lineTo(ax - dv[0] * 56, ay - dv[1] * 56); }); X.strokeStyle = '#efe0b8'; X.lineWidth = 1.6; X.stroke();
  P(() => { X.moveTo(ax + dv[0] * 6, ay + dv[1] * 6); X.lineTo(ax + pv[0] * 3, ay + pv[1] * 3); X.lineTo(ax - pv[0] * 3, ay - pv[1] * 3); X.closePath(); }); fs('#e6e6e6', '#8a8a8a', .5);
  const fx = ax - dv[0] * 54, fy = ay - dv[1] * 54;
  P(() => { X.moveTo(fx, fy); X.lineTo(fx - dv[0] * 6 + pv[0] * 3.5, fy - dv[1] * 6 + pv[1] * 3.5); X.lineTo(fx + dv[0] * 4, fy + dv[1] * 4); X.lineTo(fx - dv[0] * 6 - pv[0] * 3.5, fy - dv[1] * 6 - pv[1] * 3.5); X.closePath(); }); fs(PAL.red, null);
}
function sBlessing(lt, t) {
  forestBG(t);
  const back = 1 - ease(seg(t, SCN.s8[0], SCN.s8[0] + 1.2));
  tree(t, { arrowIn: [Math.cos(AIM), Math.sin(AIM)] });
  // impact flash
  const fl = 1 - seg(t, SCN.s8[0], SCN.s8[0] + .6);
  glow(EYE[0], EYE[1], 140 * (1 - fl * .5), '#fff1c4', fl);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, p = seg(t, SCN.s8[0], SCN.s8[0] + .9); sparkle(EYE[0] + Math.cos(a) * 50 * p, EYE[1] + Math.sin(a) * 50 * p, 3, 1 - p); }
  const bl = ease(seg(t, ca(18), ca(18) + .8));
  glow(128, 480, 120, '#ffd27a', .45 * bl);
  drona(lerp(38, 70, bl), 575, .7, { bless: bl });
  archer(128, 580, .82, { ...ARJ, bowUp: 1 - ease(seg(t, SCN.s8[0] + .8, SCN.s8[0] + 1.8)), draw: 0, aim: AIM, smile: t > ca(18) });
  focusDark(EYE[0], EYE[1], lerp(600, 3.5, back), .93 * back);
}
const DISTRACT = (() => { const r = rng(23); return Array.from({ length: 40 }, () => [r() * 340 + 10, r() * 420 + 120, r() * 3 + 2, r() * 4 | 0, r() * TAU]); })();
function sLesson(lt, t) {
  const g = X.createRadialGradient(180, 360, 10, 180, 360, 340); g.addColorStop(0, '#d8b47a'); g.addColorStop(.5, '#8a6a42'); g.addColorStop(1, '#2a1c11');
  X.fillStyle = g; X.fillRect(-100, -100, W + 200, H + 200);
  X.strokeStyle = 'rgba(40,25,14,.6)'; X.lineWidth = 1; P(() => { X.moveTo(-100, 590); X.lineTo(460, 590); }); X.stroke();
  const TG = [270, 230];
  const many = ease(seg(t, ca(19), ca(19) + 1.5)) * (1 - ease(seg(t, ca(20), ca(20) + .8)));
  DISTRACT.forEach(([x, y, r, k, ph], i) => {
    const a = many * (.5 + .5 * Math.sin(t * 3 + ph)); if (a <= .01) return;
    const xx = x + Math.sin(t * .8 + ph) * 8, yy = y + Math.cos(t * .7 + ph) * 6;
    X.save(); X.globalAlpha = a; X.strokeStyle = '#3a2410'; X.fillStyle = 'rgba(255,236,190,.8)'; X.lineWidth = 1;
    P(() => { if (k === 0) X.arc(xx, yy, r * 2, 0, TAU); else if (k === 1) { X.moveTo(xx, yy - r * 2.4); X.lineTo(xx + r * 2, yy); X.lineTo(xx, yy + r * 2.4); X.lineTo(xx - r * 2, yy); X.closePath(); } else if (k === 2) X.rect(xx - r * 1.6, yy - r * 1.6, r * 3.2, r * 3.2); else { X.moveTo(xx - r * 2, yy + r * 1.6); X.lineTo(xx, yy - r * 2); X.lineTo(xx + r * 2, yy + r * 1.6); X.closePath(); } });
    X.fill(); X.stroke(); X.restore();
  });
  const goal = ease(seg(t, ca(20) + .3, ca(20) + 1.1));
  if (goal > 0) { for (const [r, a] of [[26, .9], [17, .9], [8, 1]]) ring(TG[0], TG[1], r * (0.7 + .3 * goal), a * goal); glow(TG[0], TG[1], 60, '#ffd27a', .35 * goal); }
  SIL = true;
  archer(110, 580, .9, { ...ARJ, bowUp: 1, draw: t < ca(21) + .3 ? .9 : 0, aim: Math.atan2(TG[1] - 470, TG[0] - 128), arrow: t < ca(21) + .3, rods: true });
  SIL = false;
  const shot = seg(t, ca(21) + .3, ca(21) + .8);
  if (shot > 0) {
    const sx = 150, sy = 430, ax = lerp(sx, TG[0], easeIn(shot)), ay = lerp(sy, TG[1], easeIn(shot));
    if (shot < 1) { P(() => { X.moveTo(ax, ay); X.lineTo(ax - (TG[0] - sx) * .2, ay - (TG[1] - sy) * .2); }); X.strokeStyle = '#2a1a0e'; X.lineWidth = 2; X.stroke(); }
    else { const hp = seg(t, ca(21) + .8, ca(21) + 1.6); glow(TG[0], TG[1], 90 * (1 + hp), '#fff1c4', 1 - hp * .6); ring(TG[0], TG[1], 26 + hp * 40, 1 - hp); P(() => { X.moveTo(TG[0], TG[1]); X.lineTo(TG[0] - 24, TG[1] + 30); }); X.strokeStyle = '#2a1a0e'; X.lineWidth = 2; X.stroke(); }
  }
}
function sEnd(lt, t) {
  sLesson(lt, Math.min(t, SCN.s10[0]));
  const c = ease(seg(lt, 0.2, 1.8));
  for (const side of [-1, 1]) {
    X.save(); X.translate(180, 0); X.scale(side, 1); X.translate(-180, 0);
    const xEdge = lerp(-40, 182, c);
    const cg = X.createLinearGradient(xEdge - 220, 0, xEdge, 0);
    for (let i = 0; i <= 10; i++) cg.addColorStop(i / 10, i % 2 ? '#8a2418' : '#c3402f');
    P(() => { X.moveTo(-120, -20); X.lineTo(xEdge, -20); X.quadraticCurveTo(xEdge - 6, 320, xEdge + 4, H + 20); X.lineTo(-120, H + 20); X.closePath(); }); X.fillStyle = cg; X.fill();
    X.restore();
  }
  X.fillStyle = '#8f2619'; X.fillRect(-20, -20, W + 40, 48);
  for (let i = 0; i < 12; i++) { P(() => X.arc(i * 32 + 16, 28, 16, 0, Math.PI)); X.fillStyle = '#8f2619'; X.fill(); X.strokeStyle = PAL.gold; X.lineWidth = 1.2; X.stroke(); P(() => X.arc(i * 32 + 16, 46, 2.2, 0, TAU)); X.fillStyle = PAL.gold; X.fill(); }
  X.strokeStyle = PAL.gold; X.lineWidth = 1.5; P(() => { X.moveTo(-20, 28); X.lineTo(W + 20, 28); }); X.stroke();
  X.fillStyle = 'rgba(0,0,0,0.25)'; X.fillRect(-20, 300, W + 40, 400);
}

// camera per scene: [z0, z1, x0, y0, x1, y1]; a function may override per frame
const SC = [
  { a: SCN.s1[0], b: SCN.s1[1], cam: [1.0, 1.1, 180, 360, 190, 380], f: sSchool },
  { a: SCN.s2[0], b: SCN.s2[1], cam: [1, 1, 180, 320, 180, 320], f: sTree,
    camf: t => { const up = ease(seg(t, SCN.s2[0], ca(2) + 1.6)), back = ease(seg(t, ca(3) - .4, ca(3) + .8));
      return { z: lerp(lerp(1.15, 2.2, up), 1.25, back), x: lerp(lerp(250, BIRD[0], up), 160, back), y: lerp(lerp(470, BIRD[1] + 30, up), 380, back) }; } },
  { a: SCN.s3[0], b: SCN.s3[1], cam: [1.05, 1.12, 180, 380, 185, 370], f: (lt, t) => sTest(lt, t, 0) },
  { a: SCN.s4[0], b: SCN.s4[1], cam: [1.08, 1.14, 180, 370, 185, 360], f: (lt, t) => sTest(lt, t, 1) },
  { a: SCN.s5[0], b: SCN.s5[1], cam: [1.1, 1.05, 170, 380, 175, 370], f: sOneByOne },
  { a: SCN.s6[0], b: SCN.s6[1], cam: [1, 1, 180, 360, 180, 360], f: sArjuna,
    camf: t => { const p = ease(seg(t, ca(14) - .2, ca(15) + .6)), q = ease(seg(t, ca(11) - .3, ca(13)));
      return { z: lerp(lerp(1.05, 1.15, q), 2.4, p), x: lerp(lerp(170, 175, q), EYE[0] - 30, p), y: lerp(lerp(390, 360, q), EYE[1] + 40, p) }; } },
  { a: SCN.s7[0], b: SCN.s7[1], cam: [1, 1, 180, 320, 180, 320], f: sArrow,
    camf: t => { const p = easeIn(seg(t, SCN.s7[0], SCN.s7[1] - .05)); const ax = lerp(128 + Math.cos(AIM) * 60, EYE[0], p), ay = lerp(455 + Math.sin(AIM) * 60, EYE[1], p); return { z: 2.6, x: ax, y: ay }; } },
  { a: SCN.s8[0], b: SCN.s8[1], cam: [1, 1, 180, 320, 180, 320], f: sBlessing,
    camf: t => { const p = ease(seg(t, SCN.s8[0] + .5, SCN.s8[0] + 2.5)); return { z: lerp(2.6, 1.1, p), x: lerp(EYE[0], 175, p), y: lerp(EYE[1], 380, p) }; } },
  { a: SCN.s9[0], b: SCN.s9[1], cam: [1.0, 1.08, 180, 360, 185, 350], f: sLesson },
  { a: SCN.s10[0], b: SCN.s10[1], cam: [1, 1, 180, 320, 180, 320], f: sEnd },
];
const CAPS = CAPTEXT.map((text, i) => [CT[i][0], CT[i][1], text]);
// cuts inside a story beat stay hard (no fade): the release → arrow → impact
const NOFADE = new Set([SCN.s7[0], SCN.s8[0]]);

SC.pop();
return { SC, CAPS, NOFADE };
})();
