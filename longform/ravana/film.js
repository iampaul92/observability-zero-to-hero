// "Ravana": wide 16:9 sets, scenes, chapter cards, captions and the frame loop.
// World and screen share a 640x360 logical space, drawn at 3x (1920x1080).
const WL = 640, HL = 360, GY = 300;               // ground line
const V = TL.voice, CT = TL.ct, DUR = TL.dur;
const vt = (sc, k) => V[Math.min(sc.first + k, V.length - 1)][0];   // start of the k-th line of a scene
const ve = (sc, k) => V[Math.min(sc.first + k, V.length - 1)][1];

// ---------------- sets ----------------
const starsW = (() => { const r = rng(31); return Array.from({ length: 160 }, () => [r() * 760 - 60, r() * 220, r() * 1.1 + .3, r() * TAU]); })();
function sky(top, mid, bot, stars = 0, t = 0) {
  const g = X.createLinearGradient(0, 0, 0, HL); g.addColorStop(0, top); g.addColorStop(.6, mid); g.addColorStop(1, bot);
  X.fillStyle = g; X.fillRect(-100, -100, WL + 200, HL + 200);
  if (stars) for (const [x, y, r, p] of starsW) { X.fillStyle = `rgba(255,240,210,${stars * (.5 + .5 * Math.sin(t * 2 + p * 3))})`; P(() => X.arc(x, y, r * .7, 0, TAU)); X.fill(); }
}
function ground(col = '#2a1d14', y = GY) {
  const g = X.createLinearGradient(0, y, 0, HL); g.addColorStop(0, col); g.addColorStop(1, '#0d0907');
  P(() => { X.moveTo(-100, y); X.quadraticCurveTo(WL / 2, y - 8, WL + 100, y); X.lineTo(WL + 100, HL + 100); X.lineTo(-100, HL + 100); X.closePath(); }); X.fillStyle = g; X.fill();
  X.strokeStyle = 'rgba(233,187,98,.4)'; X.lineWidth = .8; P(() => { X.moveTo(-100, y); X.quadraticCurveTo(WL / 2, y - 8, WL + 100, y); }); X.stroke();
}
const TREES = (() => { const r = rng(9); return Array.from({ length: 22 }, () => [r() * 760 - 60, 200 + r() * 70, 40 + r() * 60, r()]); })();
function forestSet(t, o = {}) {
  sky(o.night ? '#0c1626' : '#1d3346', o.night ? '#24314a' : '#5f6f6a', o.night ? '#3a2f3a' : '#c48d55', o.night ? .8 : .25, t);
  if (!o.night) { glow(500, 230, 160, '#ffbe6a', .45); }
  P(() => { X.moveTo(-100, 250); X.quadraticCurveTo(160, 200, 330, 240); X.quadraticCurveTo(480, 205, 760, 235); X.lineTo(760, 400); X.lineTo(-100, 400); X.closePath(); }); X.fillStyle = '#26332f'; X.fill();
  for (const [x, y, h, k] of TREES) { P(() => { X.moveTo(x, y + 60); X.lineTo(x, y); }); X.strokeStyle = '#1b2220'; X.lineWidth = 4; X.stroke(); P(() => ell(x, y - h * .25, h * .34, h * .42)); fs(k > .5 ? '#22382e' : '#1c2e27', 'rgba(233,187,98,.22)', .6); }
  ground(o.night ? '#211a16' : '#3d2c1c');
  if (o.hut) hut(o.hut, GY);
  for (let i = 0; i < 3; i++) glow(((t * 6 + i * 230) % 900) - 120, 280 + i * 6, 110, '#c9b49a', .1);
}
function hut(x, y) {
  P(() => { X.moveTo(x - 46, y); X.lineTo(x - 46, y - 46); X.lineTo(x + 46, y - 46); X.lineTo(x + 46, y); X.closePath(); }); fs('#6b4a2a');
  P(() => { X.moveTo(x - 62, y - 40); X.lineTo(x, y - 88); X.lineTo(x + 62, y - 40); X.closePath(); }); fs('#b99a55');
  for (let i = 0; i < 11; i++) trim(() => { X.moveTo(x, y - 86); X.lineTo(x - 56 + i * 11, y - 42); }, '#7a6235', [], .6);
  P(() => X.rect(x - 10, y - 32, 20, 32)); fs('#1c130c', null);
}
function seaSet(t, o = {}) {
  sky(o.dusk ? '#1a1430' : '#0e1c33', o.dusk ? '#5a3048' : '#30486a', o.dusk ? '#e08a4a' : '#8fa3b8', o.dusk ? .3 : .6, t);
  if (o.city !== false) lankaCity(o.cityX ?? 470, 228, o.fire || 0, t, o.cityS || 1);
  const g = X.createLinearGradient(0, 230, 0, HL); g.addColorStop(0, '#2a5a7a'); g.addColorStop(1, '#0c1e2c');
  X.fillStyle = g; X.fillRect(-100, 232, WL + 200, 200);
  for (let k = 0; k < 6; k++) { X.strokeStyle = `rgba(200,230,240,${.35 - k * .04})`; X.lineWidth = 1; X.setLineDash([12, 10]); X.lineDashOffset = -t * (8 + k * 4); P(() => { for (let x = -60; x <= 700; x += 8) { const y = 245 + k * 20 + Math.sin(x * .03 + t * 1.4 + k) * 2.5; x === -60 ? X.moveTo(x, y) : X.lineTo(x, y); } }); X.stroke(); }
  X.setLineDash([]);
  if (o.shore) { P(() => { X.moveTo(-100, 300); X.quadraticCurveTo(120, 280, 260, 300); X.lineTo(260, 400); X.lineTo(-100, 400); X.closePath(); }); X.fillStyle = '#3d2c1c'; X.fill(); X.strokeStyle = 'rgba(233,187,98,.4)'; X.stroke(); }
}
function lankaCity(cx, base, burn, t, s = 1) {
  X.save(); X.translate(cx, base); X.scale(s, s);
  P(() => { X.moveTo(-170, 6); X.quadraticCurveTo(-120, -14, -40, -16); X.quadraticCurveTo(60, -24, 170, 6); X.closePath(); }); X.fillStyle = '#3a2a1c'; X.fill();
  const towers = [[-110, 40, 14], [-80, 70, 18], [-50, 54, 15], [-20, 96, 22], [14, 78, 18], [44, 110, 24], [80, 66, 16], [110, 48, 14]];
  for (const [x, h, w] of towers) {
    const g = X.createLinearGradient(0, -h - 20, 0, 0); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#b8801f');
    P(() => { X.moveTo(x - w / 2, -12); X.lineTo(x - w / 2, -h); X.quadraticCurveTo(x, -h - 22, x + w / 2, -h); X.lineTo(x + w / 2, -12); X.closePath(); }); X.fillStyle = SIL ? SILC : g; X.fill(); X.strokeStyle = '#8a5e16'; X.lineWidth = .6; X.stroke();
    P(() => { X.moveTo(x, -h - 18); X.lineTo(x, -h - 30); }); X.stroke();
    for (let k = 1; k < 4; k++) { X.fillStyle = 'rgba(122,31,43,.7)'; X.fillRect(x - 2, -h + k * h / 4, 4, 5); }
  }
  glow(0, -50, 180, '#ffd36b', .3 * (1 - burn));
  if (burn > 0) { for (const [x, h] of towers) fire(x, -h * .6, 26, 40 * burn, t + x, burn); glow(0, -40, 220, '#ff6a2a', .4 * burn); }
  X.restore();
}
function courtSet(t, o = {}) {
  const g = X.createLinearGradient(0, 0, 0, HL); g.addColorStop(0, '#2a0c12'); g.addColorStop(1, '#120507');
  X.fillStyle = g; X.fillRect(-100, -100, WL + 200, HL + 200);
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 112;
    const pg = X.createLinearGradient(x - 14, 0, x + 14, 0); pg.addColorStop(0, '#8a5e16'); pg.addColorStop(.5, '#f0c860'); pg.addColorStop(1, '#8a5e16');
    X.fillStyle = pg; X.fillRect(x - 12, 40, 24, GY - 40); X.fillStyle = '#c99a2e'; X.fillRect(x - 18, 34, 36, 10); X.fillRect(x - 18, GY - 10, 36, 10);
  }
  X.fillStyle = 'rgba(122,31,43,.55)'; for (let i = 0; i < 5; i++) { P(() => { X.moveTo(70 + i * 112, 40); X.quadraticCurveTo(96 + i * 112, 90, 122 + i * 112, 40); X.closePath(); }); X.fill(); }
  for (const [x, y] of [[90, 120], [550, 120]]) lamp(x, y, t, x);
  // floor
  const fg = X.createLinearGradient(0, GY, 0, HL); fg.addColorStop(0, '#4a1f14'); fg.addColorStop(1, '#140806');
  X.fillStyle = fg; X.fillRect(-100, GY, WL + 200, 100);
  X.strokeStyle = 'rgba(233,187,98,.35)'; X.lineWidth = .6; for (let i = -10; i <= 10; i++) { P(() => { X.moveTo(320 + i * 40, GY); X.lineTo(320 + i * 90, HL + 20); }); X.stroke(); }
  if (o.throne !== false) throne(o.throneX ?? 470);
}
function throne(x) {
  P(() => { X.moveTo(x - 44, GY); X.lineTo(x - 44, GY - 30); X.lineTo(x - 36, GY - 120); X.quadraticCurveTo(x, GY - 150, x + 36, GY - 120); X.lineTo(x + 44, GY - 30); X.lineTo(x + 44, GY); X.closePath(); }); fs('#c99a2e', '#7a5214', 1.2);
  P(() => { X.moveTo(x - 30, GY - 34); X.lineTo(x + 30, GY - 34); X.lineTo(x + 30, GY - 110); X.quadraticCurveTo(x, GY - 132, x - 30, GY - 110); X.closePath(); }); fs('#7a1f2b', PAL.gold, .8);
  glow(x, GY - 90, 90, '#ffd36b', .2);
}
function stageSet(col1 = '#d8b47a', col2 = '#2a1c11', cx = 320, cy = 200) {
  const g = X.createRadialGradient(cx, cy, 10, cx, cy, 380); g.addColorStop(0, col1); g.addColorStop(.5, '#7a5a38'); g.addColorStop(1, col2);
  X.fillStyle = g; X.fillRect(-100, -100, WL + 200, HL + 200);
  X.strokeStyle = 'rgba(40,25,14,.6)'; X.lineWidth = 1; P(() => { X.moveTo(-100, GY + 2); X.lineTo(WL + 100, GY + 2); }); X.stroke();
}
function kailashSet(t, press = 0) {
  sky('#0b1229', '#2a2647', '#4a3346', .9, t);
  moon(540, 70, 14);
  const lift = -14 * (1 - press) * Math.min(1, t);   // the mountain rises while Ravana lifts it
  X.save(); X.translate(0, lift);
  const mg = X.createLinearGradient(220, 40, 420, 300); mg.addColorStop(0, '#a6b6d0'); mg.addColorStop(1, '#3d4866');
  P(() => { X.moveTo(150, GY); X.lineTo(290, 80); X.quadraticCurveTo(320, 50, 350, 80); X.lineTo(490, GY); X.closePath(); }); X.fillStyle = mg; X.fill();
  P(() => { X.moveTo(272, 116); X.lineTo(290, 80); X.quadraticCurveTo(320, 50, 350, 80); X.lineTo(368, 116); X.lineTo(350, 108); X.lineTo(334, 126); X.lineTo(320, 108); X.lineTo(304, 128); X.lineTo(290, 110); X.closePath(); }); X.fillStyle = '#eef2f8'; X.fill();
  X.strokeStyle = 'rgba(233,187,98,.5)'; X.lineWidth = .8; P(() => { X.moveTo(150, GY); X.lineTo(290, 80); X.quadraticCurveTo(320, 50, 350, 80); X.lineTo(490, GY); }); X.stroke();
  seated(320, 82, .42, 'shiva', { trident: true });
  X.restore();
  ground('#1e1712');
}
function groveSet(t) {
  sky('#140f22', '#3a2238', '#6a3a3a', .7, t);
  moon(90, 60, 12);
  for (const [x, s] of [[110, 1.1], [300, .8], [540, 1.2]]) {
    P(() => { X.moveTo(x, GY); X.bezierCurveTo(x - 6, GY - 60, x + 8, GY - 110, x, GY - 150 * s); }); X.strokeStyle = '#3a2416'; X.lineWidth = 10 * s; X.lineCap = 'round'; X.stroke();
    const r = rng(x); for (let i = 0; i < 26; i++) { const lx = x + (r() - .5) * 140 * s, ly = GY - 150 * s + (r() - .5) * 80 * s; P(() => ell(lx, ly, 16 * s, 11 * s)); fs(r() > .5 ? '#2f5a3a' : '#264a30', 'rgba(233,187,98,.25)', .5); if (r() > .45) { P(() => X.arc(lx + 4, ly - 3, 3.2 * s, 0, TAU)); X.fillStyle = r() > .5 ? '#ff7a2a' : '#e8452c'; X.fill(); } }
  }
  ground('#2a1a14');
  for (let i = 0; i < 14; i++) { const r = rng(i + 40), x = r() * WL, y = ((r() * HL + t * 12 * (1 + r())) % (GY - 40)) + 20; P(() => X.arc(x + Math.sin(t + i) * 6, y, 1.6, 0, TAU)); X.fillStyle = '#ff7a2a'; X.fill(); }
}
function battleSet(t) {
  sky('#2a0e0c', '#7a2a18', '#d8743a', .0, t);
  glow(500, 220, 220, '#ffb06a', .35);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) {
    const x = i * 28 - 20 + (row % 2) * 14, y = 250 + row * 14;
    X.fillStyle = `rgba(20,10,8,${.5 + row * .2})`; P(() => { X.arc(x, y - 10, 4, 0, TAU); X.rect(x - 4, y - 7, 8, 14); }); X.fill();
    if (i % 4 === row) { P(() => { X.moveTo(x + 4, y - 4); X.lineTo(x + 8, y - 36); }); X.strokeStyle = 'rgba(20,10,8,.8)'; X.lineWidth = 1; X.stroke(); P(() => { X.moveTo(x + 8, y - 36); X.lineTo(x + 20, y - 32); X.lineTo(x + 8, y - 28); }); X.fillStyle = row % 2 ? '#7a1f2b' : '#c99a2e'; X.fill(); }
  }
  for (let i = 0; i < 18; i++) { const r = rng(i + 7), p = ((t * .5 + r()) % 1); arrowFly(-40 + r() * 200, 60 + r() * 80, 700, 40 + r() * 140, p, 'rgba(30,15,10,.8)', 0); }
  ground('#3a1a10');
  for (let i = 0; i < 4; i++) glow(((t * 20 + i * 200) % 900) - 120, 290, 130, '#c9906a', .14);
}

// ---------------- chapter card ----------------
const ROMAN = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
function chapterCard(t, sc) {
  const g = X.createRadialGradient(320, 180, 10, 320, 180, 360); g.addColorStop(0, '#3a1c12'); g.addColorStop(1, '#0c0605');
  X.fillStyle = g; X.fillRect(-100, -100, WL + 200, HL + 200);
  const p = ease(seg(t, sc.a + .1, sc.a + .9));
  const title = TL.caps[sc.first].replace(/^Chapter \w+\.\s*/, '').replace(/\*/g, '').replace(/\.$/, '');
  X.save(); X.globalAlpha = p; X.textAlign = 'center'; X.textBaseline = 'middle';
  X.font = '700 9px Cinzel'; X.fillStyle = '#82d8c9'; X.fillText('CHAPTER ' + ROMAN[sc.ch], 320, 150);
  X.font = '700 28px CinzelDeco, Cinzel'; X.fillStyle = PAL.gold; X.shadowColor = 'rgba(255,200,90,.5)'; X.shadowBlur = 14; X.fillText(title, 320, 182 + (1 - p) * 6); X.shadowBlur = 0;
  X.strokeStyle = 'rgba(233,187,98,.7)'; X.lineWidth = 1; const w = 150 * p;
  P(() => { X.moveTo(320 - w, 208); X.lineTo(320 + w, 208); }); X.stroke();
  for (const dx of [-w, w]) { P(() => { X.moveTo(320 + dx, 204); X.lineTo(320 + dx + Math.sign(dx) * 6, 208); X.lineTo(320 + dx, 212); X.lineTo(320 + dx - Math.sign(dx) * 6, 208); X.closePath(); }); X.fillStyle = PAL.gold; X.fill(); }
  X.restore();
  lamp(200, 250, t, 3); lamp(440, 250, t, 5);
}

// ---------------- scenes ----------------
// each: (t, sc) → draws; vt(sc,k) is when line k of the scene is spoken
const RAMA = { skin: '#4d6fa8', cloth: '#d9a12b', crown: '#e9bb3a', tall: true };
const LAKS = { skin: '#e7b88a', cloth: '#b5402e', crown: '#d9a12b' };
const SITA = { skin: '#e8b48c', sari: '#c0392b', crown: true, smile: true };
const SCENES = {
  hook(t, sc) {
    sky('#140a0e', '#3a1a14', '#7a3a1c', .3, t);
    lankaCity(320, 250, 0, t, 1.15); ground('#1e130c', 268);
    const r = ease(seg(t, sc.a + .3, vt(sc, 0) + 1.8));
    ravana(320, 330, 1.25, { heads: Math.round(lerp(1, 10, r)), raise: ease(seg(t, vt(sc, 2), vt(sc, 2) + .6)), sword: t > vt(sc, 2), angry: t > vt(sc, 2) });
    if (t > vt(sc, 1)) for (let i = 0; i < 10; i++) sparkle(320 + Math.cos(i / 10 * TAU + t) * 70, 170 + Math.sin(i / 10 * TAU + t) * 30, 2.5, seg(t, vt(sc, 1), vt(sc, 1) + 1) * (.5 + .5 * Math.sin(t * 4 + i)));
    if (t > vt(sc, 3)) { X.fillStyle = `rgba(0,0,0,${.6 * ease(seg(t, vt(sc, 3), vt(sc, 3) + 1.4))})`; X.fillRect(-100, -100, WL + 200, HL + 200); }
  },
  hook2(t, sc) {
    stageSet('#b08a5a', '#140c08');
    SIL = true; ravana(320, GY, 1.3, { rods: true }); SIL = false;
    const b = seg(t, vt(sc, 1), vt(sc, 1) + .8);
    if (b > 0) { glow(270, 120, 40 * b, '#000000', .0); P(() => X.arc(275, 112, 9 * ease(b), 0, TAU)); X.fillStyle = '#05030a'; X.fill(); X.strokeStyle = `rgba(255,230,160,${b})`; X.lineWidth = 1.2; P(() => X.arc(275, 112, 13 * ease(b), 0, TAU)); X.stroke(); }
    if (t > vt(sc, 2)) { const p = ease(seg(t, vt(sc, 2), vt(sc, 2) + 1)); X.save(); X.globalAlpha = p; X.textAlign = 'center'; X.font = '700 40px CinzelDeco, Cinzel'; X.fillStyle = PAL.gold; X.shadowColor = 'rgba(255,190,80,.6)'; X.shadowBlur = 18; X.fillText('RAVANA', 320, 78); X.restore(); }
  },
  card(t, sc) { chapterCard(t, sc); },
  birth(t, sc) {
    forestSet(t, { hut: 130 });
    drona(250, GY + 4, .85, {});
    woman(320, GY + 4, .85, { ...SITA, sari: '#5a2a6a', crown: false, smile: true, pose: 'pray', dir: -1 });
    const k = seg(t, vt(sc, 1), vt(sc, 1) + .8); glow(286, 230, 40, '#ffd36b', .6 * k); for (let i = 0; i < 6; i++) sparkle(286 + Math.cos(i + t) * 16, 230 + Math.sin(i * 2 + t) * 10, 2, k * .8);
    const s = seg(t, vt(sc, 2) - .2, vt(sc, 2) + .8);
    if (s > 0) { X.save(); X.globalAlpha = s; ravana(500, GY + 6, .8, { heads: 1, skin: '#6a5a4a', cloth: '#3a2a3a', noCape: true, dir: -1, raise: 0 }); X.restore(); tagText('SUMALI', 500, 140, s); }
  },
  kubera(t, sc) {
    seaSet(t, { shore: true, cityX: 440 });
    pushpaka(440, 90 + Math.sin(t) * 4, .8, {});
    seatedGod(440, 70 + Math.sin(t) * 4, .3, { skin: '#e9b24a', cloth: '#2f7a6a' });
    const q = seg(t, vt(sc, 3), vt(sc, 3) + 1);
    ravana(120, GY + 4, .9, { heads: 10, noCape: true, angry: q > .5 });
    if (q > 0) { X.save(); X.globalAlpha = q; X.font = '700 12px Cinzel'; X.fillStyle = '#82d8c9'; X.textAlign = 'center'; X.fillText('why not me?', 150, 120); X.restore(); }
    tagText('KUBERA · GOD OF WEALTH', 440, 30, seg(t, vt(sc, 0), vt(sc, 0) + .6));
  },
  brothers(t, sc) {
    stageSet('#c9a46a', '#22150c');
    const p = k => ease(seg(t, vt(sc, k), vt(sc, k) + .7));
    ravana(320, GY, 1.0, { heads: 10 });
    if (p(1) > 0) { X.save(); X.globalAlpha = p(1); archer(170, GY + 4, 1.45, { skin: '#5a4a3a', cloth: '#3a2a1a', crown: '#8a7a5a' }); X.restore(); tagText('KUMBHAKARNA', 170, 40, p(1)); }
    if (p(2) > 0) { X.save(); X.globalAlpha = p(2); drona(470, GY + 4, .9, {}); X.restore(); tagText('VIBHISHANA', 470, 120, p(2)); }
    if (t > vt(sc, 3)) for (const [x, y] of [[170, 70], [320, 150], [470, 150]]) glow(x, y, 50, '#ffd36b', .3 * p(3));
  },
  penance(t, sc) {
    forestSet(t, { night: true });
    const fx = 380; fire(fx, GY + 2, 50, 54, t, 1);
    const offer = seg(t, vt(sc, 2) - .2, vt(sc, 3) + 1.4);
    const heads = 10 - Math.floor(offer * 9.99);
    ravana(250, GY + 6, 1.0, { heads: Math.max(1, heads), noCape: true, raise: t > vt(sc, 3) ? ease(seg(t, vt(sc, 3), vt(sc, 3) + .6)) : 0, sword: t > vt(sc, 3) });
    if (offer > 0 && offer < 1) { const f = (offer * 9.99) % 1; sparkle(lerp(260, fx, f), lerp(130, GY - 20, f) - Math.sin(f * Math.PI) * 40, 4, 1 - f, '#ffcf7a'); }
    if (t > vt(sc, 0) && t < vt(sc, 2)) { X.fillStyle = 'rgba(255,240,200,.08)'; X.fillRect(-100, -100, WL + 200, HL + 200); }
  },
  brahma(t, sc) {
    forestSet(t, { night: true });
    const ap = ease(seg(t, sc.a, sc.a + 1.4));
    glow(420, 140, 200, '#ffe7a8', .45 * ap);
    X.save(); X.globalAlpha = ap; seatedGod(430, 200 - ap * 20, 1.05, { skin: '#f0c060', cloth: '#d9822b', heads: 4, beard: true }); X.restore();
    ravana(170, GY + 6, 1.0, { heads: 10, noCape: true });
    const sh = ease(seg(t, vt(sc, 2), vt(sc, 2) + 1.2));
    shield(170, GY, 120, sh);
    const ic = (k, x, y, lbl, col) => { const a = seg(t, wordT(sc, 2, lbl), wordT(sc, 2, lbl) + .5); if (a <= 0) return; X.save(); X.globalAlpha = a; X.font = '700 8px Cinzel'; X.fillStyle = col; X.textAlign = 'center'; X.fillText(lbl.toUpperCase(), x, y + 18); X.restore(); glow(x, y, 16, '#ffd36b', .5 * a); P(() => X.arc(x, y, 7, 0, TAU)); X.fillStyle = col; X.globalAlpha = a; X.fill(); X.globalAlpha = 1; };
    ic(0, 60, 120, 'gods', '#ffe08a'); ic(1, 120, 70, 'demons', '#e8452c'); ic(2, 220, 70, 'celestial', '#82d8c9');
    const hm = seg(t, vt(sc, 3), vt(sc, 3) + .6);
    if (hm > 0) { X.save(); X.globalAlpha = hm; archer(330, GY + 4, .35, { cloth: '#d9a12b', rods: false }); X.font = '700 8px Cinzel'; X.fillStyle = '#e9e8f0'; X.textAlign = 'center'; X.fillText('HUMANS', 330, GY + 20); X.restore(); }
    if (t > vt(sc, 5)) { const p = .5 + .5 * Math.sin(t * 5); X.strokeStyle = `rgba(255,230,160,${p})`; X.lineWidth = 1.2; P(() => X.arc(330, GY - 30, 30, 0, TAU)); X.stroke(); }
  },
  kumbha(t, sc) {
    stageSet('#a88a5a', '#1a120c');
    X.save(); X.translate(220, GY); X.rotate(-Math.PI / 2 + .05); archer(0, 0, 1.25, { skin: '#5a4a3a', cloth: '#3a2a1a', crown: '#8a7a5a', rods: false }); X.restore();
    if (t > vt(sc, 1)) for (let i = 0; i < 3; i++) { const p = ((t * .6 + i / 3) % 1); X.save(); X.globalAlpha = (1 - p) * seg(t, vt(sc, 1), vt(sc, 1) + .4); X.font = `700 ${10 + p * 10}px Cinzel`; X.fillStyle = '#e9e8f0'; X.fillText('z', 150 - p * 20, 200 - p * 60); X.restore(); }
    const v = seg(t, vt(sc, 2), vt(sc, 2) + .8);
    drona(470, GY + 4, .9, {});
    if (v > 0) { glow(470, 160, 90, '#ffe7a8', .5 * v); for (let i = 0; i < 8; i++) sparkle(470 + Math.cos(i / 8 * TAU + t) * 40, 160 + Math.sin(i / 8 * TAU + t) * 20, 2.4, v); }
  },
  lanka(t, sc) {
    seaSet(t, { shore: true, cityX: 470 });
    const m = ease(seg(t, sc.a, sc.b));
    for (let i = 0; i < 9; i++) { X.save(); SIL = true; ravana(lerp(-60, 210, m) - i * 28, GY + 6, .45, { heads: 1, noCape: true, rods: false, walk: t * 8 + i }); SIL = false; X.restore(); }
    ravana(lerp(-20, 250, m), GY + 6, .85, { heads: 10, sword: true, raise: .3, walk: t * 8 });
    const fl = seg(t, vt(sc, 1), vt(sc, 1) + 2);
    if (fl > 0) { pushpaka(lerp(470, 760, ease(fl)), lerp(150, 60, ease(fl)), .5, {}); }
  },
  pushpaka(t, sc) {
    sky('#0e1c33', '#30486a', '#a07a5a', .5, t);
    for (let i = 0; i < 6; i++) { P(() => ell(((i * 170 - t * 30) % 900) - 120, 260 + (i % 3) * 18, 90, 20)); X.fillStyle = 'rgba(230,226,216,.25)'; X.fill(); }
    const x = 320 + Math.sin(t * .4) * 40, y = 170 + Math.sin(t * .8) * 6;
    pushpaka(x, y, 1.5, {});
    ravana(x - 10, y - 32, .55, { heads: 10, rods: false, noCape: false });
    if (t > vt(sc, 1)) { SIL = true; for (let i = 0; i < 5; i++) archer(60 + i * 30, 330, .4, { rods: false }); SIL = false; }
    const md = seg(t, vt(sc, 2), vt(sc, 2) + .8); if (md > 0) { X.save(); X.globalAlpha = md; woman(x + 26, y - 30, .5, { sari: '#d9a12b', crown: true, rods: false, dir: -1 }); X.restore(); tagText('MANDODARI', x + 26, y - 130, md); }
  },
  kailash(t, sc) {
    const press = ease(seg(t, vt(sc, 1), vt(sc, 1) + .5));
    kailashSet(t, press);
    const lift = ease(seg(t, vt(sc, 0) + 1, vt(sc, 0) + 2.2));
    const y = GY + 8 + press * 30;
    ravana(320, y, .95, { heads: 10, raise: lift * (1 - press * .6), angry: press > .5 });
    if (press > 0 && press < 1) { X.fillStyle = `rgba(255,255,255,${(1 - press) * .3})`; X.fillRect(-100, -100, WL + 200, HL + 200); }
    const sing = seg(t, vt(sc, 3), vt(sc, 3) + 1);
    if (sing > 0) for (let i = 0; i < 6; i++) { const p = ((t * .4 + i / 6) % 1); X.save(); X.globalAlpha = sing * (1 - p); X.font = '700 12px serif'; X.fillStyle = PAL.gold; X.fillText('♪', 330 + Math.sin(i * 2 + t) * 30, 200 - p * 110); X.restore(); }
    const fg = seg(t, vt(sc, 4), vt(sc, 4) + 1); if (fg > 0) glow(320, 80, 140, '#ffe7a8', .5 * fg);
    const st = seg(t, vt(sc, 5), vt(sc, 5) + .8); tagText('SHIVA TANDAVA STOTRAM', 320, 30, st);
  },
  scholar(t, sc) {
    courtSet(t, { throneX: 470 });
    ravana(470, GY - 8, .95, { heads: 10 });
    // veena and scrolls
    P(() => { X.moveTo(150, GY - 10); X.lineTo(250, GY - 70); }); X.strokeStyle = '#8a5e16'; X.lineWidth = 4; X.stroke(); P(() => ell(150, GY - 10, 14, 12)); fs('#c99a2e', '#7a5214', .8); P(() => ell(250, GY - 70, 8, 7)); fs('#c99a2e', '#7a5214', .8);
    for (let i = 0; i < 4; i++) { P(() => X.rect(90 + i * 22, GY - 26 - (i % 2) * 6, 18, 26)); fs('#e9d9b0', '#8a5e16', .6); }
    const pw = seg(t, vt(sc, 3), vt(sc, 3) + .8);
    if (pw > 0) { glow(470, 150, 120, '#ff6a2a', .35 * pw); for (let i = 0; i < 12; i++) sparkle(470 + Math.cos(i / 12 * TAU + t) * 60, 160 + Math.sin(i / 12 * TAU + t) * 40, 2.4, pw * .8, '#ffd36b'); }
  },
  forest(t, sc) {
    forestSet(t, { hut: 480 });
    archer(230, GY + 4, .85, { ...RAMA, bowUp: 0, dir: 1 });
    woman(290, GY + 4, .85, { ...SITA, dir: -1, pose: 'rest' });
    archer(170, GY + 4, .8, { ...LAKS, bowUp: 0 });
    tagText('RAMA', 230, 70, seg(t, vt(sc, 0), vt(sc, 0) + .5)); tagText('SITA', 290, 92, seg(t, wordT(sc, 3, 'Sita'), wordT(sc, 3, 'Sita') + .5)); tagText('LAKSHMANA', 170, 92, seg(t, wordT(sc, 3, 'Lakshmana'), wordT(sc, 3, 'Lakshmana') + .5));
    const ay = seg(t, vt(sc, 1), vt(sc, 2) + 1); if (ay > 0 && ay < 1) tagText('AYODHYA · 14 YEARS OF EXILE', 320, 30, Math.min(1, ay * 3) * (1 - seg(ay, .9, 1)));
  },
  surpanakha(t, sc) {
    forestSet(t, { hut: 520 });
    const ap = ease(seg(t, sc.a, vt(sc, 0) + 1.5)), atk = seg(t, vt(sc, 1), vt(sc, 1) + 1.4), flee = ease(seg(t, vt(sc, 2), vt(sc, 2) + 1.4));
    archer(330, GY + 4, .85, { ...RAMA, dir: -1 });
    woman(410, GY + 4, .85, { ...SITA, dir: -1, pose: atk > .2 ? 'away' : 'rest' });
    archer(250, GY + 4, .8, { ...LAKS, bowUp: atk > .4 ? 1 : 0, aim: -.2, dir: 1 });
    const sx = flee > 0 ? lerp(300, -80, flee) : lerp(-60, 290, ap) + (atk > 0 && atk < .5 ? atk * 60 : 0);
    woman(sx, GY + 4, .85, { sari: '#3a5a2a', skin: '#b5835a', fangs: true, pose: atk > .4 ? 'face' : 'reach', dir: flee > 0 ? -1 : 1, walk: (ap < 1 || flee > 0) ? t * 9 : null, crown: false });
    if (atk > .4 && atk < .7) for (let i = 0; i < 6; i++) sparkle(sx + 10, GY - 120, 6 * (1 - Math.abs(atk - .55) * 6), .9, '#ffffff');
    tagText('SHURPANAKHA', sx, 70, ap * (1 - flee));
  },
  court(t, sc) {
    courtSet(t);
    ravana(470, GY - 8, .95, { heads: 10, angry: t > vt(sc, 1) });
    woman(300, GY + 4, .85, { sari: '#3a5a2a', skin: '#b5835a', fangs: true, pose: 'face', crown: false });
    const th = seg(t, vt(sc, 2), vt(sc, 2) + 1);
    if (th > 0) { X.save(); X.globalAlpha = th; P(() => ell(400, 80, 80, 50)); X.fillStyle = 'rgba(255,240,210,.12)'; X.fill(); X.strokeStyle = 'rgba(255,230,160,.6)'; X.stroke(); for (const [cx, cy, r] of [[440, 140, 5], [452, 152, 3]]) { P(() => X.arc(cx, cy, r, 0, TAU)); X.stroke(); } woman(400, 120, .45, { ...SITA, rods: false }); X.restore(); glow(400, 80, 90, '#ffe7a8', .3 * th); }
    if (t > vt(sc, 1) && t < vt(sc, 2)) glow(470, 140, 110, '#ff3a2a', .3 * seg(t, vt(sc, 1), vt(sc, 1) + .5));
  },
  maricha(t, sc) {
    seaSet(t, { shore: true, city: false, dusk: true });
    drona(420, GY + 4, .85, { dir: -1, point: ease(seg(t, vt(sc, 1), vt(sc, 1) + .4)) * (1 - ease(seg(t, vt(sc, 2), vt(sc, 2) + .4))) });
    tagText('MARICHA', 420, 100, seg(t, vt(sc, 0), vt(sc, 0) + .5));
    const th = seg(t, wordT(sc, 2, 'threatened'), wordT(sc, 2, 'threatened') + .5);
    ravana(230, GY + 6, .95, { heads: 10, sword: th > 0, raise: th, angry: th > 0 });
    if (t > vt(sc, 2)) tagText('WARNING 1', 420, 30, seg(t, vt(sc, 2), vt(sc, 2) + .5), '#ff8a6a');
    const tr = seg(t, vt(sc, 3), vt(sc, 3) + 1.2);
    if (tr > 0) { glow(420, 220, 80, '#ffd36b', .6 * tr); X.save(); X.globalAlpha = tr; deer(430, GY + 4, 1.2, { glow: tr }); X.restore(); }
  },
  deer(t, sc) {
    forestSet(t, { hut: 140 });
    const chase = ease(seg(t, vt(sc, 2), vt(sc, 2) + 2.6));
    const dx = lerp(400, 760, chase) + Math.sin(t * 2) * 20 * (1 - chase);
    deer(dx, GY + 2 - Math.abs(Math.sin(t * 6)) * 8, 1.1, { run: t * 10 });
    woman(220, GY + 4, .85, { ...SITA, pose: t > vt(sc, 1) && t < vt(sc, 2) + .5 ? 'point' : 'rest' });
    archer(lerp(280, 820, chase), GY + 4, .85, { ...RAMA, walk: chase > 0 && chase < 1 ? t * 9 : null, bowUp: 0 });
    const lk = ease(seg(t, wordT(sc, 2, 'Then'), wordT(sc, 2, 'Then') + 2)); archer(lerp(170, 820, lk), GY + 4, .8, { ...LAKS, walk: lk > 0 && lk < 1 ? t * 9 : null });
  },
  abduct(t, sc) {
    forestSet(t, { hut: 140 });
    const tr = seg(t, vt(sc, 1) - .3, vt(sc, 1) + .4), fly = ease(seg(t, vt(sc, 1) + .6, sc.b));
    if (tr < .5) { drona(330, GY + 4, .85, { dir: -1 }); woman(240, GY + 4, .85, { ...SITA, pose: 'rest' }); }
    else if (fly <= 0) { ravana(330, GY + 6, .95, { heads: 10, angry: true, dir: -1 }); woman(240, GY + 4, .85, { ...SITA, pose: 'face' }); }
    if (tr > 0 && tr < 1) { X.fillStyle = `rgba(255,240,220,${Math.sin(tr * Math.PI) * .7})`; X.fillRect(-100, -100, WL + 200, HL + 200); }
    if (fly > 0) { const x = lerp(300, 620, fly), y = lerp(250, 60, fly); pushpaka(x, y, .9, {}); ravana(x - 8, y - 20, .4, { heads: 10, rods: false }); woman(x + 14, y - 20, .38, { ...SITA, pose: 'reach', rods: false, dir: -1 }); }
  },
  jatayu(t, sc) {
    sky('#1a2340', '#4a5a7a', '#c48d55', .2, t);
    for (let i = 0; i < 6; i++) { P(() => ell(((i * 150 - t * 60) % 900) - 120, 290 + (i % 3) * 12, 100, 22)); X.fillStyle = 'rgba(230,226,216,.3)'; X.fill(); }
    const px = 420, py = 150 + Math.sin(t) * 6;
    pushpaka(px, py, 1.2, {}); ravana(px - 8, py - 28, .45, { heads: 10, rods: false, sword: true, raise: .7, angry: true }); woman(px + 18, py - 26, .42, { ...SITA, pose: 'reach', rods: false, dir: -1 });
    const fall = ease(seg(t, vt(sc, 1) + .4, vt(sc, 1) + 2));
    const jx = lerp(240, 200, fall), jy = lerp(130, 330, fall);
    jatayu(jx + Math.sin(t * 3) * 10 * (1 - fall), jy, .9, { flap: t * 9 * (1 - fall), rot: fall * 1.2 });
    if (fall > .2 && fall < .5) for (let i = 0; i < 6; i++) sparkle(jx + Math.cos(i) * 30, jy + Math.sin(i * 2) * 20, 3, .8);
    if (t > vt(sc, 2)) { const p = seg(t, vt(sc, 2), vt(sc, 2) + .6); X.fillStyle = `rgba(10,6,4,${.55 * p})`; X.fillRect(-100, -100, WL + 200, HL + 200); archer(140, GY + 30, .7, { ...RAMA }); glow(200, 300, 60, '#ffd36b', .3 * p); }
  },
  ashoka(t, sc) {
    groveSet(t);
    woman(250, GY + 4, .9, { ...SITA, smile: false, pose: t > vt(sc, 2) ? 'away' : 'pray', dir: 1 });
    const g = seg(t, vt(sc, 1), vt(sc, 1) + .6);
    ravana(420, GY + 6, .95, { heads: 10, dir: -1, gift: g > 0, raise: g * .2 });
    const p = seg(t, vt(sc, 3), vt(sc, 3) + 1); if (p > 0) { glow(250, 180, 80, '#ffe7a8', .35 * p); }
  },
  warn(t, sc) {
    courtSet(t);
    const out = ease(seg(t, vt(sc, 2) + .6, vt(sc, 3) + .5));
    ravana(470, GY - 8, .95, { heads: 10, angry: t > vt(sc, 2), raise: t > vt(sc, 2) ? .8 : 0 });
    drona(lerp(320, -80, out), GY + 4, .9, { walk: out > 0 ? t * 8 : undefined, point: t < vt(sc, 2) ? .6 : 0, dir: out > 0 ? -1 : 1 });
    tagText('VIBHISHANA', lerp(320, -80, out), 100, seg(t, vt(sc, 0), vt(sc, 0) + .5) * (1 - out));
    tagText('WARNING 2', 320, 30, seg(t, vt(sc, 1), vt(sc, 1) + .5), '#ff8a6a');
  },
  hanuman(t, sc) {
    seaSet(t, { fire: ease(seg(t, vt(sc, 1), vt(sc, 1) + 1.5)), cityX: 500 });
    const lp = ease(seg(t, sc.a, vt(sc, 0) + 2.2));
    hanuman(lerp(60, 470, lp), lerp(240, 230, lp) - Math.sin(lp * Math.PI) * 150, .9, { leap: Math.sin(lp * Math.PI), rot: lerp(-.4, .4, lp), fireTail: t > vt(sc, 1) });
  },
  bridge(t, sc) {
    seaSet(t, { cityX: 560, cityS: .7, fire: .15 });
    const prog = ease(seg(t, sc.a, sc.b));
    for (let i = 0; i < 40; i++) { const x = 40 + i * 12, built = x < 40 + prog * 460; if (!built) continue; P(() => ell(x, 262 + Math.sin(i) * 1.5, 7, 4)); fs('#9a958c', '#5a5650', .5); }
    for (let i = 0; i < 12; i++) monkeyFig(30 + ((i * 37 + t * 20) % (40 + prog * 460)), 262, .8, { bob: t * 8 + i, stone: i % 3 === 0 });
    ravana(560, 150, .5, { heads: 10, rods: false, dir: -1 });
    tagText('NOTHING TO FEAR?', 560, 30, seg(t, vt(sc, Math.max(0, sc.last - sc.first)), vt(sc, Math.max(0, sc.last - sc.first)) + .5), '#ff8a6a');
  },
  kumbha2(t, sc) {
    courtSet(t, { throneX: 520 });
    const wake = ease(seg(t, vt(sc, 0), vt(sc, 0) + 1.5));
    X.save(); X.translate(240, GY); X.rotate((-Math.PI / 2 + .05) * (1 - wake)); archer(0, 0, 1.3, { skin: '#5a4a3a', cloth: '#3a2a1a', crown: '#8a7a5a', rods: false }); X.restore();
    for (let i = 0; i < 4; i++) { const p = seg(t, vt(sc, 0) + i * .2, vt(sc, 0) + i * .2 + .4); if (p > 0 && p < 1) { X.strokeStyle = `rgba(255,220,150,${1 - p})`; X.lineWidth = 2; P(() => X.arc(240, GY - 60, 20 + p * 80, 0, TAU)); X.stroke(); } }
    ravana(520, GY - 8, .9, { heads: 10, dir: -1 });
    tagText('“YOU WERE WRONG.”', 240, 30, seg(t, vt(sc, 1), vt(sc, 1) + .5), '#ff8a6a');
  },
  war(t, sc) {
    battleSet(t);
    archer(140, GY + 6, .8, { ...RAMA, bowUp: 1, draw: .8, aim: -.2, arrow: true });
    hanuman(70, GY + 6, .7, {});
    ravana(500, GY + 6, .9, { heads: 10, sword: true, raise: .5, dir: -1 });
    const k = seg(t, vt(sc, 1), vt(sc, 1) + .6); if (k > 0) { SIL = true; X.save(); X.globalAlpha = k * .9; archer(590, GY + 8, 1.1, { rods: false }); archer(430, GY + 8, .7, { rods: false }); X.restore(); SIL = false; }
  },
  duel(t, sc) {
    battleSet(t);
    const fire2 = vt(sc, 2) - .6, hit = vt(sc, 2) + .2;
    archer(150, GY + 6, 1.0, { ...RAMA, bowUp: 1, draw: t < fire2 ? .9 : 0, aim: -.08, arrow: t < fire2 });
    const fall = ease(seg(t, hit + .2, hit + 1.6));
    ravana(490, GY + 6, 1.05, { heads: 10, sword: fall === 0, raise: .4 * (1 - fall), dir: -1, fall, angry: true });
    arrowFly(200, GY - 120, 480, GY - 130, seg(t, fire2, hit));
    if (t > hit && t < hit + .5) { const p = seg(t, hit, hit + .5); glow(480, GY - 130, 140 * p, '#fff1c4', 1 - p); }
    if (t > vt(sc, 3)) { const p = seg(t, vt(sc, 3), vt(sc, 3) + .8); glow(150, GY - 100, 100, '#ffd36b', .4 * p); }
  },
  lesson(t, sc) {
    battleSet(t); X.fillStyle = 'rgba(10,5,3,.55)'; X.fillRect(-100, -100, WL + 200, HL + 200);
    X.save(); X.translate(400, GY + 6); X.rotate(-1.4); ravana(0, 0, .95, { heads: 10, rods: false, noCape: true }); X.restore();
    const w = ease(seg(t, vt(sc, 0) + 1, vt(sc, 0) + 3));
    archer(lerp(160, 290, w), GY + 6, .85, { ...LAKS, walk: w > 0 && w < 1 ? t * 8 : null });
    archer(110, GY + 6, .85, { ...RAMA });
    if (t > vt(sc, 1)) glow(330, 260, 90, '#ffe7a8', .4 * seg(t, vt(sc, 1), vt(sc, 1) + 1));
  },
  lesson2(t, sc) {
    stageSet('#b08a5a', '#140c08');
    SIL = true; ravana(320, GY, 1.0, { rods: true }); SIL = false;
    shield(320, GY, 150, .9, seg(t, vt(sc, 7) - .2, vt(sc, 7) + .6));
    const p = seg(t, vt(sc, 7), vt(sc, 7) + 1.2);
    arrowFly(-40, 120, 210, 160, p);
    if (p >= 1) { P(() => { X.moveTo(210, 160); X.lineTo(184, 156); }); X.strokeStyle = '#efe0b8'; X.lineWidth = 1.6; X.stroke(); }
    const lab = [[2, 'POWER', 'PEOPLE'], [3, 'INSULTS', 'WARNINGS']];
    for (const [k, a, b] of lab) { const q = seg(t, vt(sc, k), vt(sc, k) + .5); if (q <= 0) continue; X.save(); X.globalAlpha = q * (1 - seg(t, vt(sc, k + 1), vt(sc, k + 1) + .3)); X.font = '700 16px Cinzel'; X.textAlign = 'center'; X.fillStyle = PAL.gold; X.fillText(a, 150, 120); X.fillStyle = 'rgba(233,232,240,.45)'; X.fillText(b, 490, 120); X.strokeStyle = 'rgba(233,232,240,.45)'; X.lineWidth = 1; P(() => { X.moveTo(440, 114); X.lineTo(540, 114); }); X.stroke(); X.restore(); }
  },
  lesson3(t, sc) {
    stageSet('#3a3a52', '#0c0c14');
    SIL = true; archer(320, GY, 1.0, { rods: false }); SIL = false;
    const items = [[1, 140, 150, 'A PERSON'], [1, 320, 70, 'A WARNING'], [1, 500, 150, 'A HABIT'], [2, 200, 230, 'A COLLEAGUE'], [2, 440, 230, 'A FRIEND']];
    for (const [k, x, y, lbl] of items) { const q = seg(t, vt(sc, k), vt(sc, k) + 1); if (q <= 0) continue; const pulse = .5 + .5 * Math.sin(t * 3 + x); glow(x, y, 30 + 10 * pulse, '#ffe7a8', .5 * q); P(() => X.arc(x, y, 3, 0, TAU)); X.fillStyle = '#fff6dc'; X.fill(); X.save(); X.globalAlpha = q; X.font = '700 8px Cinzel'; X.fillStyle = '#e9e8f0'; X.textAlign = 'center'; X.fillText(lbl, x, y + 18); X.restore(); }
    const h = seg(t, vt(sc, 3), vt(sc, 3) + 1.2); if (h > 0) { lamp(320, 150, t, 9); glow(320, 140, 140, '#ffd27a', .35 * h); }
    const tb = seg(t, vt(sc, 4), vt(sc, 4) + .8); if (tb > 0) { X.save(); X.globalAlpha = tb; ravana(560, GY, .55, { heads: 10, rods: false, dir: -1 }); X.restore(); P(() => X.arc(541, GY - 80, 4 * tb, 0, TAU)); X.fillStyle = '#05030a'; X.fill(); X.strokeStyle = 'rgba(255,230,160,.9)'; X.stroke(); }
  },
  outro(t, sc) {
    const g = X.createRadialGradient(320, 180, 10, 320, 180, 360); g.addColorStop(0, '#3a1c12'); g.addColorStop(1, '#0c0605');
    X.fillStyle = g; X.fillRect(-100, -100, WL + 200, HL + 200);
    const p = ease(seg(t, sc.a + .2, sc.a + 1.2));
    X.save(); X.globalAlpha = p; X.textAlign = 'center';
    X.font = '700 26px CinzelDeco, Cinzel'; X.fillStyle = PAL.gold; X.fillText('Ten heads. One blind spot.', 320, 150);
    X.font = '700 11px Cinzel'; X.fillStyle = '#82d8c9'; X.fillText('SUBSCRIBE FOR MORE ANCIENT STORIES', 320, 186);
    X.restore();
    SIL = true; X.save(); X.globalAlpha = .9 * p; ravana(320, 330, .6, { heads: 10 }); X.restore(); SIL = false;
    lamp(200, 250, t, 3); lamp(440, 250, t, 5);
  },
};
function tagText(txt, x, y, a, col = '#82d8c9') {
  if (a <= 0) return;
  X.save(); X.globalAlpha = Math.min(1, a); X.font = '700 8px Cinzel'; X.textAlign = 'center';
  const w = X.measureText(txt).width + 14; X.fillStyle = 'rgba(10,6,4,.6)'; X.fillRect(x - w / 2, y - 9, w, 14); X.strokeStyle = col; X.lineWidth = .6; X.strokeRect(x - w / 2, y - 9, w, 14);
  X.fillStyle = col; X.fillText(txt, x, y + 1.5); X.restore();
}
function wordT(sc, k, word) { const i = sc.first + k, txt = TL.caps[i].replace(/\*/g, ''), j = txt.indexOf(word); return V[i][0] + (V[i][1] - V[i][0]) * Math.max(0, j) / txt.length * .95; }

// per-scene camera: [z0, z1, cx0, cy0, cx1, cy1]
const CAM = { hook: [1.0, 1.08, 320, 200, 320, 175], hook2: [1.0, 1.06, 320, 180, 320, 170], birth: [1, 1.08, 320, 190, 300, 200], kubera: [1, 1.05, 320, 180, 330, 175], brothers: [1, 1.06, 320, 180, 320, 175],
  penance: [1.05, 1.15, 320, 200, 300, 190], brahma: [1, 1.05, 320, 180, 300, 180], kumbha: [1, 1.05, 320, 180, 340, 185], lanka: [1, 1.04, 320, 180, 330, 180], pushpaka: [1, 1.08, 320, 180, 320, 170],
  kailash: [1, 1.05, 320, 172, 320, 180], scholar: [1, 1.06, 320, 180, 360, 175], forest: [1, 1.06, 320, 185, 300, 190], surpanakha: [1, 1.04, 320, 185, 320, 185], court: [1, 1.06, 340, 180, 380, 170],
  maricha: [1, 1.06, 320, 185, 340, 185], deer: [1, 1.04, 320, 185, 360, 185], abduct: [1, 1.05, 320, 180, 360, 170], jatayu: [1, 1.06, 320, 180, 300, 190], ashoka: [1, 1.08, 330, 185, 330, 180],
  warn: [1, 1.04, 380, 180, 340, 180], hanuman: [1, 1.04, 320, 180, 350, 180], bridge: [1, 1.05, 320, 180, 360, 180], kumbha2: [1, 1.05, 340, 180, 330, 175], war: [1, 1.05, 320, 185, 320, 180],
  duel: [1, 1.08, 320, 185, 330, 180], lesson: [1, 1.08, 300, 200, 320, 205], lesson2: [1, 1.06, 320, 180, 320, 175], lesson3: [1, 1.05, 320, 175, 320, 170], outro: [1, 1, 320, 180, 320, 180], card: [1, 1, 320, 180, 320, 180] };

// ---------------- captions (bottom, word by word, keywords in teal) ----------------
function caption(t) {
  for (let i = 0; i < CT.length; i++) {
    const [a, b] = CT[i]; if (t < a || t > b) continue;
    if (TL.caps[i].startsWith('Chapter ')) continue;   // the chapter card already shows it
    const out = 1 - seg(t, b - .2, b);
    let inside = false; const words = TL.caps[i].split(' ').map(raw => { const st = raw.replace(/^[“"]/, '').startsWith('*'); if (st) inside = true; const f = inside; if (raw.replace(/[.,!?:;”’…]+$/, '').endsWith('*')) inside = false; return [raw.replace(/\*/g, ''), f]; });
    X.font = '700 14px Cinzel'; const sp = X.measureText(' ').width, maxW = 520;
    const lines = [[]]; let lw = 0;
    for (const w of words) { const ww = X.measureText(w[0]).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([...w, ww]); lw += ww + sp; }
    const n = words.length, dw = Math.min(.16, (V[i][1] - V[i][0]) * .8 / n);
    let idx = 0; const y0 = HL - 26 - (lines.length - 1) * 19;
    X.save(); X.fillStyle = `rgba(0,0,0,${.35 * out})`; X.fillRect(0, y0 - 18, WL, lines.length * 19 + 16); X.restore();
    lines.forEach((ln, li) => {
      const tw = ln.reduce((s, w) => s + w[2], 0) + sp * (ln.length - 1); let x = WL / 2 - tw / 2; const y = y0 + li * 19;
      for (const [w, h, ww] of ln) { const p = ease(seg(t, V[i][0] + idx * dw - .05, V[i][0] + idx * dw + .2)); idx++;
        X.save(); X.globalAlpha = p * out; X.shadowColor = 'rgba(0,0,0,.9)'; X.shadowBlur = 5; X.fillStyle = h ? PAL.hl : PAL.cream; X.fillText(w, x, y + (1 - p) * 3); X.restore(); x += ww + sp; }
    });
  }
}

// ---------------- frame ----------------
const dustW = (() => { const r = rng(99); return Array.from({ length: 60 }, () => [r() * WL, r() * HL, r() * .8 + .4, r() * TAU, r() * 6 + 2]); })();
function render(t) {
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = '#000'; X.fillRect(0, 0, C.width, C.height);
  X.setTransform(S, 0, 0, S, 0, 0);
  const si = TL.scenes.findIndex(s => t >= s.a && t < s.b), sc = TL.scenes[si < 0 ? TL.scenes.length - 1 : si];
  const d = sc.b - sc.a, lt = t - sc.a, p = ease(lt / d);
  const [z0, z1, x0, y0, x1, y1] = CAM[sc.key] || [1, 1, 320, 180, 320, 180];
  const z = lerp(z0, z1, p);
  X.save(); X.translate(WL / 2, HL / 2); X.scale(z, z); X.translate(-lerp(x0, x1, p), -lerp(y0, y1, p));
  (SCENES[sc.key] || SCENES.card)(t, sc);
  X.restore();
  X.save(); X.globalCompositeOperation = 'lighter';
  for (const [x, y, r, ph, sp] of dustW) { const yy = ((y - t * sp) % HL + HL) % HL, xx = x + Math.sin(t * .5 + ph) * 10; X.fillStyle = `rgba(255,220,160,${.18 + .15 * Math.sin(t * 2 + ph)})`; P(() => X.arc(xx, yy, r, 0, TAU)); X.fill(); }
  X.restore();
  const v = X.createRadialGradient(320, 180, 140, 320, 180, 420); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.7)'); X.fillStyle = v; X.fillRect(0, 0, WL, HL);
  const fin = si === 0 ? seg(lt, 0, 1) : seg(lt, 0, .3), fout = sc.b >= DUR ? 1 - seg(t, DUR - 1.2, DUR) : 1 - seg(lt, d - .3, d);
  const fa = 1 - Math.min(fin, fout); if (fa > 0) { X.fillStyle = `rgba(0,0,0,${fa})`; X.fillRect(0, 0, WL, HL); }
  caption(t);
}
window.DURATION = DUR;
window.ready = (async () => { await document.fonts.load('700 14px Cinzel'); await document.fonts.load('700 26px CinzelDeco'); await document.fonts.ready; render(0); return true; })();
window.frame = (t, q = .9) => { render(t); return C.toDataURL('image/jpeg', q); };
