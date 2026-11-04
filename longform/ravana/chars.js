// Characters and props for "Ravana" (puppet style: gold outlines, rods, flat colour). Feet at the origin, facing +x.

// ---------- Ravana: ten heads ----------
function ravanaHead(x, y, r, o = {}) {
  P(() => ell(x, y, r, r * 1.08)); fs(o.skin || '#3f7d6e');
  if (!SIL) {
    P(() => ell(x + r * .35, y - r * .1, r * .16, r * .12)); X.fillStyle = '#fbf3df'; X.fill();
    P(() => ell(x + r * .38, y - r * .1, r * .08, r * .09)); X.fillStyle = '#1b120b'; X.fill();
    const br = o.angry ? .25 : -.05;
    P(() => { X.moveTo(x + r * .12, y - r * (.36 - br)); X.lineTo(x + r * .62, y - r * .32); }); X.strokeStyle = '#120c08'; X.lineWidth = r * .12; X.stroke();
    P(() => { X.moveTo(x + r * .05, y + r * .32); X.quadraticCurveTo(x + r * .4, y + r * .18, x + r * .78, y + r * .38); X.quadraticCurveTo(x + r * .95, y + r * .52, x + r * .86, y + r * .62); }); X.lineWidth = r * .14; X.stroke();
    P(() => ell(x, y - r * .45, r * .1, r * .14)); X.fillStyle = PAL.red; X.fill();
  }
  // crown
  P(() => { X.moveTo(x - r * .9, y - r * .55); X.lineTo(x + r * .9, y - r * .55); X.lineTo(x + r * .55, y - r * 1.5); X.lineTo(x, y - r * 2.3); X.lineTo(x - r * .55, y - r * 1.5); X.closePath(); }); fs('#e9bb3a', '#8a5e16', .7);
  trim(() => { X.moveTo(x - r * .7, y - r * .9); X.lineTo(x + r * .7, y - r * .9); }, PAL.red, [], r * .14);
}
function ravana(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  if (o.rods !== false) rods([[-18, -86], [22, -100]]);
  const skin = o.skin || '#3f7d6e', cloth = o.cloth || '#7a1f2b';
  const wk = o.walk, sw = wk != null ? Math.sin(wk) * 6 : 0;
  X.save(); if (o.fall) { X.translate(0, 0); X.rotate(-o.fall * 1.35); }
  limb([[-7, -60], [-9 + sw * .5, -30], [-8 + sw, 0]], skin, 8); limb([[7, -60], [9 - sw * .5, -30], [8 - sw, 0]], skin, 8);
  P(() => { X.moveTo(-18, -88); X.lineTo(18, -88); X.lineTo(22, -36); X.quadraticCurveTo(0, -28, -22, -36); X.closePath(); }); fs(cloth);
  trim(() => { X.moveTo(-20, -40); X.quadraticCurveTo(0, -32, 20, -40); });
  // armour
  P(() => { X.moveTo(-17, -132); X.lineTo(17, -132); X.lineTo(15, -88); X.lineTo(-15, -88); X.closePath(); }); fs('#c99a2e', '#7a5214', .8);
  for (let i = 0; i < 4; i++) trim(() => { X.moveTo(-14, -124 + i * 9); X.quadraticCurveTo(0, -120 + i * 9, 14, -124 + i * 9); }, '#7a5214', [], .8);
  P(() => ell(0, -110, 5, 5)); fs(PAL.red, PAL.gold, .6);
  // cape behind
  if (!o.noCape) { X.save(); X.globalCompositeOperation = 'destination-over'; P(() => { X.moveTo(-16, -130); X.quadraticCurveTo(-34, -70, -30, -8); X.lineTo(-8, -20); X.lineTo(-10, -128); X.closePath(); }); X.fillStyle = SIL ? SILC : '#3a0f17'; X.fill(); X.restore(); }
  // arms
  const ra = o.raise || 0;
  limb([[-15, -126], [-26, -104], [-22, -86]], skin, 6.5);
  const hx = lerp(26, 30, ra), hy = lerp(-86, -168, ra);
  limb([[15, -126], [lerp(28, 32, ra), lerp(-106, -140, ra)], [hx, hy]], skin, 6.5);
  if (o.sword) { P(() => { X.moveTo(hx, hy); X.quadraticCurveTo(hx + 30, hy - 40 * (1 - ra) + 10 * ra, hx + 22, hy - 62); }); X.strokeStyle = SIL ? SILC : '#d8dde2'; X.lineWidth = 3; X.stroke(); glow(hx + 22, hy - 60, 12, '#cfe6ff', .4); }
  if (o.gift) { P(() => ell(hx + 6, hy - 4, 10, 6)); fs('#e9bb3a', '#8a5e16', .6); for (let i = 0; i < 4; i++) sparkle(hx + 2 + i * 4, hy - 10 - (i % 2) * 4, 2, .8); }
  // heads: the classic row, four to one side and five to the other, the tenth in front
  const n = o.heads ?? 10, hr = 11;
  const slots = [-4, 5, -3, 4, -2, 3, -1, 2, 1];   // offered from the outside in
  const keep = new Set(slots.slice(Math.max(0, 9 - Math.max(0, n - 1))));
  for (const k of [-4, -3, -2, -1, 1, 2, 3, 4, 5]) { if (!keep.has(k)) continue; ravanaHead(k * 15.5, -140 + Math.abs(k) * 1.6, hr * .8, o); }
  if (n >= 1) ravanaHead(0, -142, hr, o);
  X.restore();
  X.restore();
}

// ---------- women ----------
function woman(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  if (o.rods !== false) rods([[-14, -78], [18, -96]]);
  const skin = o.skin || '#e2a274', sari = o.sari || '#c0392b', border = o.border || PAL.gold;
  const wk = o.walk, sw = wk != null ? Math.sin(wk) * 4 : 0;
  // skirt
  P(() => { X.moveTo(-12, -82); X.lineTo(12, -82); X.quadraticCurveTo(20 + sw, -30, 18 + sw, 0); X.lineTo(-18 + sw * .5, 0); X.quadraticCurveTo(-20, -30, -12, -82); }); fs(sari);
  trim(() => { X.moveTo(-18 + sw * .5, -4); X.lineTo(18 + sw, -4); }, border, [1.4, 1.4], 2);
  for (let i = -1; i <= 1; i++) trim(() => { X.moveTo(i * 5, -78); X.lineTo(i * 7 + sw * .5, -2); }, rgba('#000000', .25), [], .8);
  // torso + pallu
  P(() => { X.moveTo(-11, -122); X.lineTo(11, -122); X.lineTo(10, -82); X.lineTo(-10, -82); X.closePath(); }); fs(skin);
  P(() => { X.moveTo(-12, -124); X.lineTo(2, -124); X.lineTo(14, -84); X.lineTo(4, -82); X.closePath(); }); fs(sari);
  trim(() => { X.moveTo(-10, -122); X.lineTo(10, -86); }, border, [1.2, 1.2], 1.4);
  if (o.pallu !== false) { X.save(); X.globalCompositeOperation = 'destination-over'; P(() => { X.moveTo(-10, -126); X.quadraticCurveTo(-30, -90, -26, -40 + sw); X.lineTo(-14, -52); X.lineTo(-8, -120); X.closePath(); }); X.fillStyle = SIL ? SILC : sari; X.fill(); X.restore(); }
  // arms
  const pose = o.pose || 'rest';
  if (pose === 'pray') { limb([[-10, -118], [-6, -100], [2, -112]], skin, 5); limb([[10, -118], [10, -100], [3, -112]], skin, 5); }
  else if (pose === 'point') { limb([[-10, -118], [-18, -98], [-14, -84]], skin, 5); limb([[10, -118], [28, -126], [44, -134]], skin, 5); }
  else if (pose === 'face') { limb([[-10, -118], [-16, -100], [-12, -86]], skin, 5); limb([[10, -118], [18, -122], [8, -138]], skin, 5); }
  else if (pose === 'away') { limb([[-10, -118], [-6, -100], [6, -106]], skin, 5); limb([[10, -118], [6, -100], [-4, -104]], skin, 5); }
  else if (pose === 'reach') { limb([[-10, -118], [6, -110], [26, -116]], skin, 5); limb([[10, -118], [28, -112], [44, -116]], skin, 5); }
  else { limb([[-10, -118], [-16, -100], [-12, -84]], skin, 5); limb([[10, -118], [16, -100], [12, -84]], skin, 5); }
  // head
  P(() => X.rect(-3.5, -130, 7, 8)); fs(skin, null);
  const turn = pose === 'away' ? -1 : 1;
  P(() => ell(0, -140, 10, 11)); fs(skin);
  if (!SIL) {
    P(() => ell(4.5 * turn, -142, 1.5, 1.8)); X.fillStyle = '#1b120b'; X.fill();
    P(() => ell(0, -146, 1.2, 1.2)); X.fillStyle = PAL.red; X.fill();
    if (o.smile) { P(() => { X.moveTo(2 * turn, -135); X.quadraticCurveTo(4.5 * turn, -133, 7 * turn, -135); }); X.strokeStyle = '#6a2a1a'; X.lineWidth = .8; X.stroke(); }
    if (o.fangs) { P(() => { X.moveTo(4, -134); X.lineTo(5, -131); X.lineTo(6, -134); }); X.fillStyle = '#fff'; X.fill(); }
  }
  // hair: bun or long braid
  P(() => { X.moveTo(-10 * turn, -140); X.quadraticCurveTo(-11 * turn, -153, 0, -152); X.quadraticCurveTo(8 * turn, -152, 9 * turn, -145); X.quadraticCurveTo(0, -149, -10 * turn, -140); }); fs(o.hair || '#1d140e', null);
  if (o.braid !== false) { P(() => { X.moveTo(-8 * turn, -142); X.quadraticCurveTo(-16 * turn, -110, -12 * turn, -70); X.lineTo(-8 * turn, -72); X.quadraticCurveTo(-10 * turn, -110, -4 * turn, -138); X.closePath(); }); fs(o.hair || '#1d140e', null); }
  if (o.crown) { P(() => { X.moveTo(-8, -150); X.lineTo(8, -150); X.lineTo(5, -160); X.lineTo(0, -166); X.lineTo(-5, -160); X.closePath(); }); fs('#e9bb3a', '#8a5e16', .6); }
  trim(() => X.arc(0, -124, 7, .3, Math.PI - .3), PAL.gold, [1.2, 1.4], 1.4);
  X.restore();
}

// ---------- seated god (Brahma has four faces) ----------
function seatedGod(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const skin = o.skin || '#e9b24a', cloth = o.cloth || '#c0392b';
  if (!SIL) { P(() => X.arc(0, -86, 34, 0, TAU)); X.fillStyle = 'rgba(255,214,120,.18)'; X.fill(); trim(() => X.arc(0, -86, 34, 0, TAU), PAL.gold, [], 1.3); }
  // lotus
  for (let i = -3; i <= 3; i++) { P(() => { X.moveTo(i * 12, 4); X.quadraticCurveTo(i * 14 - 8, -10, i * 15, -16); X.quadraticCurveTo(i * 14 + 8, -10, i * 12, 4); }); fs('#f0a3b4', '#b04a64', .6); }
  P(() => { X.moveTo(-40, -2); X.quadraticCurveTo(-44, -26, -14, -30); X.lineTo(14, -30); X.quadraticCurveTo(44, -26, 40, -2); X.quadraticCurveTo(0, 6, -40, -2); }); fs(cloth);
  P(() => { X.moveTo(-17, -30); X.lineTo(17, -30); X.lineTo(14, -72); X.quadraticCurveTo(0, -78, -14, -72); X.closePath(); }); fs(skin);
  limb([[-14, -68], [-30, -60], [-34, -76]], skin, 6); limb([[14, -68], [30, -60], [34, -76]], skin, 6);
  limb([[-14, -64], [-24, -44], [-12, -34]], skin, 6); limb([[14, -64], [24, -44], [12, -34]], skin, 6);
  if (o.heads === 4) { for (const dx of [-14, 14]) { P(() => ell(dx, -84, 9, 10)); fs(skin); } }
  P(() => ell(0, -88, 12, 13)); fs(skin);
  if (!SIL) { for (const ex of [-4.5, 4.5]) { P(() => ell(ex, -89, 2, 1.1)); X.fillStyle = '#1b120b'; X.fill(); } if (o.beard) { P(() => { X.moveTo(-7, -82); X.quadraticCurveTo(0, -66, 7, -82); X.closePath(); }); X.fillStyle = '#efe9dc'; X.fill(); } }
  P(() => { X.moveTo(-12, -98); X.lineTo(12, -98); X.lineTo(8, -116); X.lineTo(0, -128); X.lineTo(-8, -116); X.closePath(); }); fs('#e9bb3a', '#8a5e16', .7);
  X.restore();
}

// ---------- Hanuman ----------
function hanuman(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s); X.rotate(o.rot || 0);
  const skin = '#d0703a', fur = '#b85a2a';
  // tail
  P(() => { X.moveTo(-10, -60); X.bezierCurveTo(-50, -60, -60, -120, -30, -140); }); X.strokeStyle = SIL ? SILC : PAL.gold; X.lineWidth = 7; X.lineCap = 'round'; X.stroke(); X.strokeStyle = SIL ? SILC : fur; X.lineWidth = 5; X.stroke();
  if (o.fireTail) for (let i = 0; i < 6; i++) glow(-30 + Math.sin(i) * 4, -140 - i * 3, 14 - i, '#ff8a2a', .7);
  const leap = o.leap || 0;
  limb([[-6, -58], [lerp(-8, -22, leap), lerp(-30, -40, leap)], [lerp(-7, -36, leap), lerp(0, -30, leap)]], skin, 7);
  limb([[6, -58], [lerp(8, 18, leap), lerp(-30, -44, leap)], [lerp(7, 34, leap), lerp(0, -56, leap)]], skin, 7);
  P(() => { X.moveTo(-14, -84); X.lineTo(14, -84); X.lineTo(17, -44); X.quadraticCurveTo(0, -38, -17, -44); X.closePath(); }); fs(PAL.red);
  P(() => { X.moveTo(-14, -124); X.lineTo(14, -124); X.lineTo(12, -84); X.lineTo(-12, -84); X.closePath(); }); fs(skin);
  limb([[-13, -118], [-24, -100], [-20, -84]], skin, 6);
  limb([[13, -118], [lerp(26, 30, leap), lerp(-104, -140, leap)], [lerp(30, 40, leap), lerp(-118, -168, leap)]], skin, 6);
  // mace
  const mx = lerp(30, 40, leap), my = lerp(-118, -168, leap);
  P(() => { X.moveTo(mx, my); X.lineTo(mx + 4, my - 30); }); X.strokeStyle = SIL ? SILC : '#8a5e16'; X.lineWidth = 2.5; X.stroke();
  P(() => ell(mx + 5, my - 36, 8, 9)); fs('#e9bb3a', '#8a5e16', .8);
  // monkey head
  P(() => X.rect(-4, -132, 8, 8)); fs(skin, null);
  P(() => ell(0, -142, 12, 12)); fs(fur);
  P(() => ell(5, -137, 8, 6)); fs('#f2c9a0');
  if (!SIL) { P(() => ell(4, -145, 1.6, 1.8)); X.fillStyle = '#1b120b'; X.fill(); P(() => { X.moveTo(3, -134); X.quadraticCurveTo(7, -132, 11, -135); }); X.strokeStyle = '#5a2a12'; X.lineWidth = .9; X.stroke(); }
  P(() => { X.moveTo(-10, -150); X.lineTo(10, -150); X.lineTo(6, -164); X.lineTo(0, -174); X.lineTo(-6, -164); X.closePath(); }); fs('#e9bb3a', '#8a5e16', .7);
  X.restore();
}

// ---------- animals and machines ----------
function jatayu(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s); X.rotate(o.rot || 0);
  const f = o.flap || 0, wa = Math.sin(f) * .7;
  for (const side of [-1, 1]) {
    X.save(); X.scale(1, side === -1 ? 1 : .9); X.rotate(-(.3 + wa) * (side === -1 ? 1 : .6));
    P(() => { X.moveTo(0, 0); X.bezierCurveTo(-30, -40, -90, -50, -120, -30); X.lineTo(-110, -18); X.lineTo(-100, -22); X.lineTo(-92, -10); X.lineTo(-80, -14); X.lineTo(-70, -2); X.quadraticCurveTo(-30, 8, 0, 0); }); fs(side === -1 ? '#6a4a2c' : '#5a3c22', PAL.gold, .8);
    X.restore();
  }
  P(() => ell(0, 0, 26, 13)); fs('#6a4a2c');
  P(() => { X.moveTo(-24, 2); X.lineTo(-44, 10); X.lineTo(-40, -2); X.closePath(); }); fs('#4a3018');
  P(() => ell(26, -8, 9, 7)); fs('#efe9dc');
  P(() => ell(34, -10, 7, 6)); fs('#d9c79a');
  P(() => { X.moveTo(40, -12); X.quadraticCurveTo(48, -10, 44, -4); X.lineTo(39, -7); X.closePath(); }); fs('#e9bb3a', '#8a5e16', .5);
  if (!SIL) { P(() => ell(36, -12, 1.2, 1.2)); X.fillStyle = '#1b120b'; X.fill(); }
  X.restore();
}
function deer(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  const r = o.run || 0, legs = [[-14, 1], [-8, -1], [12, 1], [18, -1]];
  legs.forEach(([lx, ph]) => limb([[lx, -28], [lx + Math.sin(r + ph * 2) * 6, -14], [lx + Math.sin(r + ph * 2) * 8, 0]], '#e0a92c', 3));
  P(() => { X.moveTo(-22, -30); X.bezierCurveTo(-20, -44, 18, -46, 22, -32); X.quadraticCurveTo(0, -20, -22, -30); }); fs('#efbe3c');
  for (let i = 0; i < 7; i++) { P(() => ell(-14 + i * 5, -36 + (i % 2) * 3, 1.6, 1.6)); fs('#fff6dc', null); }
  P(() => { X.moveTo(16, -40); X.lineTo(26, -60); X.lineTo(32, -58); X.lineTo(24, -36); X.closePath(); }); fs('#efbe3c');
  P(() => ell(32, -62, 7, 5, -.3)); fs('#efbe3c');
  if (!SIL) { P(() => ell(33, -63, 1, 1)); X.fillStyle = '#1b120b'; X.fill(); }
  for (const dx of [0, 4]) { P(() => { X.moveTo(28 + dx, -66); X.lineTo(24 + dx, -82); X.lineTo(20 + dx, -78); X.moveTo(24 + dx, -82); X.lineTo(30 + dx, -80); }); X.strokeStyle = SIL ? SILC : '#c99a2e'; X.lineWidth = 1.4; X.stroke(); }
  glow(0, -36, 50, '#ffd36b', .35 * (o.glow ?? 1));
  X.restore();
}
function pushpaka(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  for (let i = 0; i < 5; i++) { P(() => ell(-50 + i * 25, 12 + (i % 2) * 4, 22, 9)); X.fillStyle = SIL ? SILC : 'rgba(240,236,226,.85)'; X.fill(); }
  P(() => { X.moveTo(-60, 0); X.quadraticCurveTo(0, 18, 60, 0); X.lineTo(52, -8); X.lineTo(-52, -8); X.closePath(); }); fs('#e9bb3a', '#8a5e16', 1);
  for (let k = 0; k < 3; k++) {
    const w = 44 - k * 13, yy = -8 - k * 15;
    P(() => X.rect(-w, yy - 12, w * 2, 12)); fs(k % 2 ? '#c99a2e' : '#e9bb3a', '#8a5e16', .8);
    for (let i = -2; i <= 2; i++) { P(() => X.rect(i * w / 2.6 - 2, yy - 10, 4, 8)); fs('#7a1f2b', null); }
  }
  P(() => { X.moveTo(-8, -53); X.lineTo(0, -68); X.lineTo(8, -53); X.closePath(); }); fs('#e9bb3a', '#8a5e16', .8);
  P(() => { X.moveTo(0, -68); X.lineTo(0, -80); X.lineTo(10, -76); X.lineTo(0, -72); }); X.strokeStyle = SIL ? SILC : PAL.red; X.lineWidth = 1.2; X.stroke();
  glow(0, -20, 90, '#ffd36b', .25);
  X.restore();
}
function monkeyFig(x, y, s, o = {}) {   // small army monkey, for crowds
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  const b = o.bob || 0; X.translate(0, -Math.abs(Math.sin(b)) * 3);
  P(() => { X.moveTo(-6, -14); X.bezierCurveTo(-18, -16, -22, -34, -12, -38); }); X.strokeStyle = SIL ? SILC : '#8a4a22'; X.lineWidth = 2.5; X.stroke();
  P(() => ell(0, -16, 8, 11)); fs('#a85a2a', PAL.gold, .5);
  P(() => ell(2, -32, 7, 7)); fs('#a85a2a', PAL.gold, .5);
  P(() => ell(5, -30, 4, 3)); fs('#f2c9a0', null);
  limb([[-3, -6], [-4, 0]], '#a85a2a', 3); limb([[3, -6], [4, 0]], '#a85a2a', 3);
  if (o.stone) { P(() => ell(10, -40, 6, 4)); fs('#9a958c', '#5a5650', .5); limb([[4, -22], [10, -36]], '#a85a2a', 2.5); }
  X.restore();
}
function shield(x, y, r, a, crack = 0) {   // the boon, drawn as a dome of light
  if (a <= 0) return;
  X.save(); X.globalAlpha = a;
  const g = X.createRadialGradient(x, y, r * .2, x, y, r); g.addColorStop(0, 'rgba(255,214,120,0)'); g.addColorStop(.85, 'rgba(255,214,120,.18)'); g.addColorStop(1, 'rgba(255,230,160,.55)');
  P(() => X.arc(x, y, r, Math.PI, TAU)); X.lineTo(x + r, y); X.closePath(); X.fillStyle = g; X.fill();
  X.strokeStyle = 'rgba(255,230,160,.9)'; X.lineWidth = 1.4; P(() => X.arc(x, y, r, Math.PI, TAU)); X.stroke();
  if (crack > 0) { X.strokeStyle = `rgba(255,255,255,${crack})`; X.lineWidth = 1.2; P(() => { X.moveTo(x - r * .72, y - r * .69); X.lineTo(x - r * .6, y - r * .55); X.lineTo(x - r * .66, y - r * .45); X.lineTo(x - r * .55, y - r * .32); }); X.stroke(); }
  X.restore();
}
function arrowFly(x0, y0, x1, y1, p, col = '#efe0b8', gl = 1) {
  if (p <= 0 || p >= 1) return;
  const x = lerp(x0, x1, p), y = lerp(y0, y1, p), a = Math.atan2(y1 - y0, x1 - x0), dv = [Math.cos(a), Math.sin(a)];
  for (let i = 1; i < 8 && gl; i++) { X.strokeStyle = `rgba(255,226,150,${.4 * gl * (1 - i / 8)})`; X.lineWidth = 2; P(() => { X.moveTo(x - dv[0] * i * 7, y - dv[1] * i * 7); X.lineTo(x - dv[0] * (i * 7 + 5), y - dv[1] * (i * 7 + 5)); }); X.stroke(); }
  P(() => { X.moveTo(x, y); X.lineTo(x - dv[0] * 34, y - dv[1] * 34); }); X.strokeStyle = col; X.lineWidth = 1.6; X.stroke();
  if (gl) glow(x, y, 26, '#fff1c4', .7 * gl);
}
function fire(x, y, w, h, t, a = 1) {
  for (let i = 0; i < 9; i++) {
    const fx = x + (i / 8 - .5) * w, fh = h * (.6 + .4 * Math.sin(t * 9 + i * 1.7)), fw = w / 7;
    const g = X.createLinearGradient(0, y, 0, y - fh); g.addColorStop(0, `rgba(255,120,30,${a})`); g.addColorStop(.6, `rgba(255,190,60,${a * .8})`); g.addColorStop(1, 'rgba(255,240,180,0)');
    P(() => { X.moveTo(fx - fw, y); X.quadraticCurveTo(fx - fw * .4, y - fh * .6, fx + Math.sin(t * 5 + i) * 3, y - fh); X.quadraticCurveTo(fx + fw * .4, y - fh * .6, fx + fw, y); X.closePath(); }); X.fillStyle = g; X.fill();
  }
  glow(x, y - h * .4, w * 1.2, '#ff9a3a', .35 * a);
}
