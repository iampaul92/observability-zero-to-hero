// Story III: Ganesha's Race Around the World (scenes from the Ganesha short; closing curtain removed)
STORIES.ganesha = (function () {
const DURATION = LT.stories.ganesha.dur;
// ---------- scenes (lt = local time) ----------
function sKailash(lt, t) {
  kailashBG(t);
  const fall = seg(lt, 2.6, 5.0);
  const fy = lerp(-30, 220, easeOut(fall)), fx = lerp(230, 180, easeOut(fall));
  if (lt > 2.6) {
    for (let i = 1; i < 14; i++) { const p = clamp(fall - i * 0.025, 0, 1); sparkle(lerp(230, 180, easeOut(p)), lerp(-30, 220, easeOut(p)), 3 - i * 0.18, (1 - i / 14) * 0.8 * (fall < 1 ? 1 : 1 - seg(lt, 5, 6))); }
    const hover = Math.sin(lt * 2) * 3 * seg(lt, 5, 6);
    const g = 1 + seg(lt, 6.2, 7.5) * 1.2;
    fruit(fx, fy + hover, 1.1, g);
    if (lt > 6.2) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + lt * 0.6, r = 30 + 6 * Math.sin(lt * 2 + i); sparkle(180 + Math.cos(a) * r, 220 + hover + Math.sin(a) * r, 2.2, seg(lt, 6.2, 7) * (0.5 + 0.5 * Math.sin(lt * 4 + i))); }
  } else sparkle(230, 40, 4 + 3 * seg(lt, 0.5, 2.6), seg(lt, 0.3, 1.5));
}

function sCourt(lt, t) {
  palaceBG(t); dais(182, 470, 150);
  seated(145, 462, 0.95, 'shiva', { trident: true, blink: (lt % 3.7) < 0.12 });
  seated(222, 462, 0.9, 'parvati', { blink: ((lt + 1.3) % 4.1) < 0.12 });
  fruit(183, 300 + Math.sin(lt * 2) * 3, 0.9, 1.2);
  const sa = ease(seg(lt, 2.5, 3.5));
  if (sa > 0) {
    X.save(); X.globalAlpha = sa;
    const kh = seg(lt, 4.8, 5.4) * (1 - seg(lt, 6.6, 7.0)), gh = seg(lt, 6.6, 7.0);
    glow(62, 470, 90, '#ffd27a', 0.35 * kh); glow(298, 480, 90, '#ffd27a', 0.35 * gh);
    peacock(38, 585, 0.7, { fan: 0.55, dir: 1 });
    kartikeya(70, 600, 0.9, {});
    ganesha(298, 600, 0.82, { dir: -1, smile: gh, blink: (lt % 3.1) < 0.12 });
    mouse(250, 602, 0.8, { dir: 1, hop: Math.max(0, Math.sin(lt * 6)) * 2 * gh });
    X.restore();
  }
}

function sDecree(lt, t) {
  palaceBG(t); dais(180, 478, 120);
  const raise = ease(seg(lt, 0.2, 1.2));
  seated(180, 470, 1.15, 'shiva', { raise, trident: true });
  const ga = ease(seg(lt, 0.8, 1.8)) * (1 - ease(seg(lt, 5.2, 5.8)));
  const rot = lt * 0.8;
  if (ga > 0) {
    globe(180, 215, 40, rot, { a: ga });
    const lap = seg(lt, 3.0, 5.0) * 3;
    if (lap > 0) {
      X.save(); X.globalAlpha = ga; X.strokeStyle = 'rgba(130,216,201,0.85)'; X.lineWidth = 1.4;
      P(() => X.ellipse(180, 215, 56, 18, -0.25, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(lap, 1))); X.stroke(); X.restore();
      const a = -Math.PI / 2 + TAU * lap; const px = 180 + Math.cos(a) * 56 * Math.cos(-0.25) - Math.sin(a) * 18 * Math.sin(-0.25), py = 215 + Math.cos(a) * 56 * Math.sin(-0.25) + Math.sin(a) * 18 * Math.cos(-0.25);
      sparkle(px, py, 4, ga);
      for (let k = 1; k <= Math.min(3, Math.floor(lap + 0.001)); k++) sparkle(130 + k * 25, 160, 3, ga);
    }
  }
  const fa = ease(seg(lt, 5.4, 6.2));
  if (fa > 0) { X.save(); X.globalAlpha = fa; fruit(180, 215 + Math.sin(lt * 2) * 3, 1.3, 1.6); X.restore(); }
}

function sLaunch(lt, t) {
  kailashBG(t);
  const jump = seg(lt, 0.8, 1.6), go = easeIn(seg(lt, 3.0, 3.8));
  const px = lerp(140, 470, go), py = lerp(540, 60, go);
  // flash + streak
  if (lt > 3.0) {
    X.save(); X.lineCap = 'round';
    const pts = []; for (let i = 0; i <= 24; i++) { const p = i / 24 * Math.min(1, go); const zx = lerp(140, 470, p), zy = lerp(520, 40, p) + Math.sin(i * 1.3) * 6; pts.push([zx, zy]); }
    const fade = 1 - seg(lt, 4.2, 5.8);
    for (const [w, c] of [[9, 'rgba(95,183,168,0.25)'], [3.5, 'rgba(160,240,225,0.95)']]) { X.strokeStyle = c; X.lineWidth = w; X.globalAlpha = fade; P(() => { pts.forEach(([a, b], i) => i ? X.lineTo(a, b) : X.moveTo(a, b)); }); X.stroke(); }
    X.restore();
    glow(140, 520, 160, '#fff1c4', 0.8 * (1 - seg(lt, 3.0, 3.7)));
  }
  if (go < 1) {
    if (lt < 3.0) {
      peacock(140, 545, 1.1, { fan: lerp(0.9, 0, seg(lt, 2.2, 2.9)) });
      if (jump < 1) {
        const kx = lerp(260, 138, jump), ky = lerp(560, 520, jump) - Math.sin(jump * Math.PI) * 50;
        kartikeya(kx, ky, lerp(0.95, 0.5, jump), { dir: -1 });
      } else kartikeya(138, 520, 0.5, { rods: false });
    } else {
      X.save(); X.translate(px, py); X.rotate(-0.6 * go);
      riderGroup(0, 0, lerp(1.1, 0.5, go), { flap: lt * 22 }); X.restore();
    }
  }
  for (let i = 0; i < 12 && lt > 3.0; i++) { const a = seg(lt, 3.0 + i * 0.05, 4.8); sparkle(140 + Math.cos(i) * 60 * a, 520 - Math.sin(i * 2.1) * 50 * a - 30 * a, 3, (1 - a) * 0.9); }
}

function sMouse(lt, t) {
  palaceBG(t);
  const sm = ease(seg(lt, 3.3, 4.0));
  ganesha(262, 600, 1.15, { dir: -1, smile: sm, trunk: Math.sin(lt * 1.5) * 0.5, blink: (lt % 2.9) < 0.12 });
  const hop = lt < 3.3 ? Math.max(0, Math.sin(lt * 5)) * 3 : Math.max(0, Math.sin(lt * 9)) * 6;
  mouse(110, 604, 1.5, { dir: 1, hop, look: true });
  if (lt > 1.2 && lt < 3.3) { X.save(); X.globalAlpha = seg(lt, 1.2, 1.6); X.fillStyle = PAL.cream; X.font = '700 16px Cinzel'; X.fillText('?', 128, 560 - seg(lt, 1.2, 2) * 6); X.restore(); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + lt; sparkle(240 + Math.cos(a) * 38, 440 + Math.sin(a) * 26, 2.6, sm * (0.5 + 0.5 * Math.sin(lt * 5 + i))); }
}

function sTravel(lt, t) {
  const sub = lt < 2 ? 0 : lt < 4 ? 1 : 2, st = sub === 0 ? lt : sub === 1 ? lt - 2 : lt - 4;
  if (sub === 0) { // oceans
    const g = X.createLinearGradient(0, 0, 0, 340); g.addColorStop(0, '#1c2d52'); g.addColorStop(1, '#c47c4a'); X.fillStyle = g; X.fillRect(-100, -100, W + 200, 460);
    glow(250, 330, 120, '#ffb36a', 0.6); P(() => X.arc(250, 330, 26, 0, TAU)); X.fillStyle = '#ffd59a'; X.fill();
    for (let L = 0; L < 7; L++) {
      const y0 = 330 + L * 46, sp = (L + 1) * 14, col = L % 2 ? '#1f6d7c' : '#2a8794';
      P(() => { X.moveTo(-50, H + 50); for (let x = -50; x <= W + 50; x += 6) X.lineTo(x, y0 + Math.sin((x + st * sp * 3) * 0.05 + L) * 6); X.lineTo(W + 50, H + 50); X.closePath(); }); X.fillStyle = col; X.fill();
      X.strokeStyle = 'rgba(240,248,240,0.75)'; X.lineWidth = 1.2; X.setLineDash([10, 8]); X.lineDashOffset = -st * sp;
      P(() => { for (let x = -50; x <= W + 50; x += 6) { const yy = y0 + Math.sin((x + st * sp * 3) * 0.05 + L) * 6; x === -50 ? X.moveTo(x, yy) : X.lineTo(x, yy); } }); X.stroke(); X.setLineDash([]);
    }
    riderGroup(lerp(-60, 430, st / 2), 230 + Math.sin(st * 5) * 8, 1.1, { flap: t * 20 });
  } else if (sub === 1) { // mountains
    const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#101a38'); g.addColorStop(1, '#5a4060'); X.fillStyle = g; X.fillRect(-100, -100, W + 200, H + 200);
    starfield(t, 0.8, 360);
    const ranges = [['#3b4466', 380, 10, 90], ['#2b3150', 450, 30, 110], ['#1b1d30', 530, 70, 120]];
    ranges.forEach(([col, base, sp, h], k) => {
      const off = -(st * sp * 4) % 120;
      P(() => { X.moveTo(-100, H + 50); for (let i = -1; i < 7; i++) { const x = off + i * 120; X.lineTo(x, base); X.lineTo(x + 60, base - h * (0.7 + 0.3 * ((i * 7 + k) % 3) / 2)); } X.lineTo(W + 150, base); X.lineTo(W + 150, H + 50); X.closePath(); });
      X.fillStyle = col; X.fill();
      for (let i = -1; i < 7; i++) { const x = off + i * 120, hh = h * (0.7 + 0.3 * ((i * 7 + k) % 3) / 2); P(() => { X.moveTo(x + 60, base - hh); X.lineTo(x + 60 - 14, base - hh + 22); X.lineTo(x + 60, base - hh + 16); X.lineTo(x + 60 + 14, base - hh + 22); X.closePath(); }); X.fillStyle = 'rgba(235,240,250,0.85)'; X.fill(); }
      if (k === 0) riderGroup(lerp(-60, 430, st / 2), 200 + Math.sin(st * 5) * 8, 0.95, { flap: t * 20 });
    });
  } else { // every land — orbit the globe
    X.fillStyle = '#0c1024'; X.fillRect(-100, -100, W + 200, H + 200); starfield(t, 1);
    const a = st * 2.4 - 1.2, ox = 180 + Math.cos(a) * 150, oy = 360 + Math.sin(a) * 50, behind = Math.sin(a) < 0;
    const drawRider = () => { const vx = -Math.sin(a); riderGroup(ox, oy - 10, behind ? 0.55 : 0.8, { flap: t * 20, dir: vx >= 0 ? 1 : -1 }); };
    X.strokeStyle = 'rgba(130,216,201,0.35)'; X.lineWidth = 1.2; P(() => ell(180, 360, 150, 50)); X.stroke();
    if (behind) drawRider();
    globe(180, 360, 115, st * 0.9);
    if (!behind) drawRider();
  }
  // quick dips between sub-scenes
  const dip = Math.max(1 - Math.abs(lt - 2) / 0.12, 1 - Math.abs(lt - 4) / 0.12, 0);
  if (dip > 0) { X.fillStyle = `rgba(0,0,0,${dip})`; X.fillRect(-100, -100, W + 200, H + 200); }
}

function sCircle(lt, t) {
  palaceBG(t);
  const cx = 180, cy = 445, rx = 128, ry = 42;
  const lapT = seg(lt, 1.5, 7.5) * 3;            // 0..3 laps
  const th = Math.PI / 2 + lapT * TAU;
  // path glow
  const drawn = Math.min(lapT, 1);
  X.save(); X.lineCap = 'round';
  const lw = 1.5 + Math.min(lapT, 3) * 0.9;
  X.strokeStyle = 'rgba(255,214,120,0.25)'; X.lineWidth = lw * 4; P(() => X.ellipse(cx, cy, rx, ry, 0, Math.PI / 2 - 0.0001, Math.PI / 2 + drawn * TAU)); X.stroke();
  X.strokeStyle = 'rgba(255,224,150,0.9)'; X.lineWidth = lw; P(() => X.ellipse(cx, cy, rx, ry, 0, Math.PI / 2 - 0.0001, Math.PI / 2 + drawn * TAU)); X.stroke();
  X.restore();
  for (const k of [3.5, 5.5, 7.5]) { const p = seg(lt, k, k + 1.2); if (p > 0 && p < 1) { X.strokeStyle = `rgba(255,230,160,${1 - p})`; X.lineWidth = 2; P(() => ell(cx, cy, rx * (1 + p * 0.5), ry * (1 + p * 0.5))); X.stroke(); } }
  // ganesha pos: param x = cx + rx*cos(th), y = cy + ry*sin(th)
  const walking = lt > 0.2 && lt < 7.5;
  let gx, gy, gth;
  if (lt < 1.5) { gth = Math.PI / 2; const p = ease(seg(lt, 0.2, 1.5)); gx = lerp(390, cx, p); gy = lerp(cy + ry + 30, cy + ry, p); }
  else { gth = th; gx = cx + rx * Math.cos(gth); gy = cy + ry * Math.sin(gth); }
  if (lt >= 7.5) { gx = cx; gy = cy + ry; }
  const depth = (gy - (cy - ry)) / (2 * ry); // 0 back .. 1 front
  const vx = lt < 1.5 ? -1 : -Math.sin(gth);
  const mth = gth - 0.45, mx = cx + rx * Math.cos(mth), my = cy + ry * Math.sin(mth), mdepth = (my - (cy - ry)) / (2 * ry);
  const drawG = () => ganesha(gx, gy, lerp(0.42, 0.62, depth), { dir: lt >= 7.5 ? 1 : (vx >= 0 ? 1 : -1), walk: walking ? lt * 9 : null, smile: 0.6, namaste: lt >= 7.6 });
  const drawM = () => { if (lt > 1.5 && lt < 7.5) mouse(mx, my, lerp(0.55, 0.85, mdepth), { dir: -Math.sin(mth) >= 0 ? 1 : -1, hop: Math.max(0, Math.sin(lt * 14)) * 2 }); };
  if (depth < 0.5) drawG(); if (mdepth < 0.5) drawM();
  dais(cx, 452, 130);
  seated(150, 446, 0.78, 'shiva', { blink: (lt % 3.3) < 0.12 }); seated(212, 446, 0.74, 'parvati', { blink: ((lt + 1) % 3.9) < 0.12 });
  if (depth >= 0.5) drawG(); if (mdepth >= 0.5) drawM();
  if (lt > 7.5) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + lt * 0.5; sparkle(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 2.5, seg(lt, 7.5, 8) * (0.5 + 0.5 * Math.sin(lt * 4 + i))); }
}

function sGift(lt, t) {
  palaceBG(t); dais(150, 462, 160);
  seated(112, 455, 0.9, 'shiva', { raise: ease(seg(lt, 2.8, 3.6)) * (1 - ease(seg(lt, 5, 5.8))), blink: (lt % 3.1) < 0.12 });
  seated(190, 455, 0.86, 'parvati', { blink: ((lt + 2) % 3.6) < 0.12 });
  const hold = lt > 5.0;
  ganesha(290, 600, 1.0, { dir: -1, namaste: !hold, hold, bow: hold ? 0 : -0.12 * ease(seg(lt, 0.3, 1.2)), smile: 0.7 + 0.3 * seg(lt, 5, 5.5) });
  mouse(330, 606, 0.8, { dir: -1 });
  const fp = ease(seg(lt, 3.3, 5.0));
  if (lt > 3.0) {
    const fx = lerp(138, 262, fp), fy = lerp(360, 525, fp) - Math.sin(fp * Math.PI) * 70;
    for (let i = 1; i < 10; i++) { const p = clamp(fp - i * 0.03, 0, 1); sparkle(lerp(138, 262, p), lerp(360, 525, p) - Math.sin(p * Math.PI) * 70, 2.6 - i * 0.2, (1 - i / 10) * 0.7 * (1 - seg(lt, 5, 5.6))); }
    fruit(fx, fy, lerp(0.6, 0.85, fp), 1.3 + seg(lt, 5, 5.4) * 1.5);
  }
  for (let i = 0; i < 14; i++) { const p = seg(lt, 5.0, 6.3), a = i / 14 * TAU; sparkle(262 + Math.cos(a) * p * 70, 525 + Math.sin(a) * p * 70, 3, (1 - p) * (lt > 5 ? 1 : 0)); }
}

function sReturn(lt, t) {
  kailashBG(t);
  const land = easeOut(seg(lt, 0, 1.3));
  if (land < 1) { X.save(); X.translate(lerp(-60, 100, land), lerp(150, 560, land)); X.rotate(0.4 * (1 - land)); riderGroup(0, 0, 0.9, { flap: t * 16 }); X.restore(); }
  else {
    peacock(70, 590, 0.9, { fan: 0.15 });
    kartikeya(118, 600, 0.95, { pant: lt * 9, tired: true, dir: 1 });
  }
  ganesha(282, 600, 0.95, { dir: -1, hold: true, smile: 0.9 });
  fruit(254, 527, 0.8, 1.3 + 0.2 * Math.sin(lt * 3));
  mouse(325, 604, 0.8, { dir: -1, hop: Math.max(0, Math.sin(lt * 7)) * 2 });
}

function sMoral(lt, t) {
  const g = X.createRadialGradient(180, 380, 10, 180, 380, 330); g.addColorStop(0, '#d8b47a'); g.addColorStop(0.5, '#8a6a42'); g.addColorStop(1, '#2a1c11');
  X.fillStyle = g; X.fillRect(-100, -100, W + 200, H + 200);
  // big world that shrinks into the circle
  const shrink = ease(seg(lt, 2.4, 5.0));
  const R = lerp(230, 0, shrink);
  if (R > 2) globe(180, 330, R, lt * 0.3, { line: true, a: 0.7 * (1 - shrink * 0.5) });
  // floor line
  X.strokeStyle = 'rgba(40,25,14,0.6)'; X.lineWidth = 1; P(() => { X.moveTo(-100, 462); X.lineTo(460, 462); }); X.stroke();
  const ring = ease(seg(lt, 4.0, 5.5));
  X.save(); X.globalCompositeOperation = 'lighter';
  glow(180, 440, 190 * (0.6 + ring * 0.6), '#ffd890', 0.25 + 0.35 * ease(seg(lt, 5.5, 7.5)));
  X.restore();
  SIL = true;
  seated(150, 455, 0.85, 'shiva', { trident: true }); seated(214, 455, 0.8, 'parvati');
  ganesha(182, 545, 0.6, { dir: -1, namaste: true, rods: false });
  peacock(52, 560, 0.7, { fan: 0.5 }); kartikeya(84, 568, 0.7, { rods: false });
  mouse(230, 548, 0.7, { dir: -1 });
  SIL = false;
  if (ring > 0) { X.save(); X.lineCap = 'round'; X.strokeStyle = `rgba(255,226,150,${0.9 * ring})`; X.lineWidth = 2.2;
    X.shadowColor = '#ffd27a'; X.shadowBlur = 12; P(() => X.ellipse(182, 490, 120, 34, 0, Math.PI / 2, Math.PI / 2 + TAU * ring)); X.stroke(); X.restore(); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + lt * 0.4; sparkle(182 + Math.cos(a) * 120, 490 + Math.sin(a) * 34, 2.4, ring * (0.4 + 0.6 * Math.sin(lt * 3 + i)) * seg(lt, 5.5, 6.5)); }
}

function sCurtain(lt, t) {
  sMoral(9 + lt, t);
  const c = ease(seg(lt, 0.2, 1.8));
  for (const side of [-1, 1]) {
    X.save(); X.translate(180, 0); X.scale(side, 1); X.translate(-180, 0);
    const xEdge = lerp(-40, 182, c);
    const cg = X.createLinearGradient(xEdge - 220, 0, xEdge, 0);
    for (let i = 0; i <= 10; i++) cg.addColorStop(i / 10, i % 2 ? '#8a2418' : '#c3402f');
    P(() => { X.moveTo(-120, -20); X.lineTo(xEdge, -20); X.quadraticCurveTo(xEdge - 6, 320, xEdge + 4, H + 20); X.lineTo(-120, H + 20); X.closePath(); }); X.fillStyle = cg; X.fill();
    X.restore();
  }
  // valance
  X.fillStyle = '#8f2619'; X.fillRect(-20, -20, W + 40, 48);
  for (let i = 0; i < 12; i++) { P(() => X.arc(i * 32 + 16, 28, 16, 0, Math.PI)); X.fillStyle = '#8f2619'; X.fill(); X.strokeStyle = PAL.gold; X.lineWidth = 1.2; X.stroke(); P(() => X.arc(i * 32 + 16, 46, 2.2, 0, TAU)); X.fillStyle = PAL.gold; X.fill(); }
  X.strokeStyle = PAL.gold; X.lineWidth = 1.5; P(() => { X.moveTo(-20, 28); X.lineTo(W + 20, 28); }); X.stroke();
  X.fillStyle = 'rgba(0,0,0,0.25)'; X.fillRect(-20, 300, W + 40, 400);
}

const SC = [
  { a: 0, b: 9, cam: [1.0, 1.12, 180, 330, 180, 300], f: sKailash },
  { a: 9, b: 17.5, cam: [1.0, 1.06, 180, 340, 180, 350], f: sCourt },
  { a: 17.5, b: 25, cam: [1.22, 1.32, 180, 330, 180, 310], f: sDecree },
  { a: 25, b: 31, cam: [1.0, 1.06, 180, 340, 185, 330], f: sLaunch },
  { a: 31, b: 37, cam: [1.12, 1.25, 195, 470, 200, 470], f: sMouse },
  { a: 37, b: 44, cam: [1, 1.04, 180, 320, 180, 320], f: sTravel },
  { a: 44, b: 54, cam: [1.05, 1.12, 180, 380, 180, 400], f: sCircle },
  { a: 54, b: 60.5, cam: [1.05, 1.15, 200, 420, 210, 440], f: sGift },
  { a: 60.5, b: 65, cam: [1.05, 1.1, 190, 400, 190, 410], f: sReturn },
  { a: 65, b: 74, cam: [1.0, 1.08, 180, 340, 180, 380], f: sMoral },
  { a: 74, b: DURATION, cam: [1, 1, 180, 320, 180, 320], f: sCurtain },
];

const CAPS = [
  [0.4, 3.0, 'Long ago, on *Mount Kailash*,'],
  [3.0, 6.2, 'a *golden fruit* fell from the heavens.'],
  [6.2, 8.8, 'The fruit of *all wisdom*.'],
  [9.3, 11.6, 'But it could not be *shared*.'],
  [11.6, 14.0, 'And Shiva had *two sons*.'],
  [14.0, 15.8, '*Kartikeya*, the swift,'],
  [15.8, 17.3, 'and *Ganesha*, the wise.'],
  [17.7, 20.5, '“Whoever circles the *whole world*'],
  [20.5, 22.5, '*three times* first,'],
  [22.5, 24.8, 'wins the fruit.”'],
  [25.2, 28.0, 'Kartikeya leapt onto his *peacock*'],
  [28.0, 30.8, 'and was gone in a *flash*.'],
  [31.2, 34.5, 'Ganesha looked at his *little mouse*.'],
  [34.5, 36.8, 'And *smiled*.'],
  [37.0, 39.0, 'Over *oceans*.'],
  [39.0, 41.0, 'Over *mountains*.'],
  [41.0, 43.8, 'Across *every land*.'],
  [44.2, 47.5, 'Ganesha simply walked around his *parents*.'],
  [47.5, 49.5, '*Once*.'],
  [49.5, 51.5, '*Twice*.'],
  [51.5, 53.8, '*Three times*.'],
  [54.2, 57.4, '“You are my *whole world*.”'],
  [57.4, 60.3, 'And the fruit was *his*.'],
  [60.7, 64.8, 'When Kartikeya returned, the race was *already won*.'],
  [65.2, 67.5, 'That is why they say,'],
  [67.5, 70.5, 'the world is not *out there*.'],
  [70.5, 73.8, 'It is the ones who *made you*.'],
  [75.6, DURATION, 'Follow for more *stories*.', 520],
];

SC.pop(); CAPS.pop();
return { SC, CAPS, NOFADE: new Set() };
})();
