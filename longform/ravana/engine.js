// Shared drawing engine (from the Ganesha short): helpers, props, characters, backgrounds.
// "Ganesha and the Race Around the World" — a storybook short.
// Everything is drawn procedurally in a 360x640 logical space, rendered at 3x.
const C = document.getElementById('c'), X = C.getContext('2d');   // shared engine for the five-story film
const W = 360, H = 640, S = 3;

// ---------- helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeIn = t => { t = clamp(t, 0, 1); return t * t * t; };
const easeOut = t => { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
const TAU = Math.PI * 2;
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgba(c, a) { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; }

const PAL = {
  gold: '#e9bb62', gold2: '#b9852f', red: '#b5402e', red2: '#7e2419', teal: '#5fb7a8',
  cream: '#f3e5c4', ink: '#1c130c', wall: '#2c1e14', wall2: '#170f09',
  shiva: '#6aa3c6', parvati: '#e2a274', gan: '#e59a55', kart: '#e7b88a', hl: '#82d8c9'
};

let SIL = false;       // silhouette mode: everything flat dark
let SILC = '#1e150e';
function P(f) { X.beginPath(); f(); }
function fs(fill, stroke = PAL.gold, lw = 0.9) {
  if (SIL) { if (fill) { X.fillStyle = SILC; X.fill(); } return; }
  if (fill) { X.fillStyle = fill; X.fill(); }
  if (stroke) { X.strokeStyle = stroke; X.lineWidth = lw; X.stroke(); }
}
function ell(x, y, rx, ry, rot = 0) { X.ellipse(x, y, rx, ry, rot, 0, TAU); }
function glow(x, y, r, col, a = 1) {
  if (SIL || a <= 0) return;
  const g = X.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(0.4, rgba(col, a * 0.35)); g.addColorStop(1, rgba(col, 0));
  X.fillStyle = g; X.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function limb(pts, col, w) { // thick limb with gold outline
  const path = () => { X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]); };
  X.lineCap = 'round'; X.lineJoin = 'round';
  if (!SIL) { P(path); X.strokeStyle = PAL.gold; X.lineWidth = w + 1.8; X.stroke(); }
  P(path); X.strokeStyle = SIL ? SILC : col; X.lineWidth = w; X.stroke();
}
function trim(f, col = PAL.gold, dash = [1, 2.2], lw = 0.9) {
  if (SIL) return; P(f); X.setLineDash(dash); X.strokeStyle = col; X.lineWidth = lw; X.stroke(); X.setLineDash([]);
}
function rods(pts) { // shadow-puppet control rods
  X.save(); X.strokeStyle = 'rgba(15,9,5,0.85)'; X.lineWidth = 1.1;
  for (const [x, y] of pts) { P(() => { X.moveTo(x, y); X.lineTo(x + (x > 0 ? 8 : -8), 400); }); X.stroke(); }
  X.restore();
}
function sparkle(x, y, r, a, col = '#fff6dc') {
  if (a <= 0) return;
  X.save(); X.globalAlpha = a; X.fillStyle = col; X.translate(x, y);
  P(() => { X.moveTo(0, -r); X.quadraticCurveTo(0, 0, r, 0); X.quadraticCurveTo(0, 0, 0, r); X.quadraticCurveTo(0, 0, -r, 0); X.quadraticCurveTo(0, 0, 0, -r); });
  X.fill(); X.restore(); glow(x, y, r * 2.5, '#ffe7a8', a * 0.5);
}

// ---------- props ----------
function fruit(x, y, s, g = 1) {
  glow(x, y, 46 * s * (0.8 + 0.2 * g), '#ffd36b', 0.55 * g);
  X.save(); X.translate(x, y); X.scale(s, s);
  const gr = X.createRadialGradient(-4, -4, 1, 0, 0, 13);
  gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.5, '#f4c443'); gr.addColorStop(1, '#c9831f');
  P(() => { X.moveTo(0, -12); X.bezierCurveTo(11, -12, 13, 4, 4, 11); X.bezierCurveTo(-3, 15, -12, 8, -11, -1); X.bezierCurveTo(-10, -9, -5, -12, 0, -12); });
  fs(SIL ? SILC : gr, '#8a5714', 0.8);
  P(() => { X.moveTo(0, -12); X.quadraticCurveTo(8, -20, 15, -15); X.quadraticCurveTo(7, -10, 0, -12); }); fs('#6f9a4a', '#3d5a26', 0.6);
  X.restore();
}
function modak(x, y) { P(() => { X.moveTo(x - 4, y + 3); X.quadraticCurveTo(x, y - 9, x + 4, y + 3); X.closePath(); }); fs('#f4ead2', PAL.gold2, 0.6); }

// ---------- characters (feet at origin, ~1 unit = 1px at s=1) ----------
function ganesha(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  const wk = o.walk || 0, bob = o.walk != null ? -Math.abs(Math.sin(wk)) * 2.5 : 0;
  if (o.rods !== false) rods([[-30, -70], [30, -78]]);
  X.translate(0, bob);
  const sw = o.walk != null ? Math.sin(wk) * 6 : 0;
  P(() => X.roundRect(-19 + sw, -32, 14, 32, 5)); fs(PAL.gan);
  P(() => X.roundRect(5 - sw, -32, 14, 32, 5)); fs(PAL.gan);
  // upper body can bow
  X.translate(0, -58); X.rotate(o.bow || 0); X.translate(0, 58);
  // dhoti
  P(() => { X.moveTo(-27, -64); X.lineTo(27, -64); X.lineTo(23, -24); X.quadraticCurveTo(0, -16, -23, -24); X.closePath(); }); fs('#d8a127');
  trim(() => { X.moveTo(-24, -27); X.quadraticCurveTo(0, -20, 24, -27); });
  // belly
  P(() => ell(0, -80, 27, 23)); fs(PAL.gan);
  P(() => { X.moveTo(-22, -96); X.quadraticCurveTo(0, -72, 25, -64); }); X.strokeStyle = SIL ? SILC : PAL.red; X.lineWidth = 3; X.stroke();
  // arms
  if (o.namaste) {
    limb([[-22, -96], [-16, -78], [-3, -90]], PAL.gan, 7); limb([[22, -96], [16, -78], [3, -90]], PAL.gan, 7);
    P(() => { X.moveTo(-3, -84); X.lineTo(0, -102); X.lineTo(3, -84); X.closePath(); }); fs(PAL.gan);
  } else {
    limb([[-23, -96], [-33, -78], [-30, -64]], PAL.gan, 7);
    const hy = o.hold ? -76 : -100;
    limb([[23, -96], [34, -86], [30, hy]], PAL.gan, 7);
    if (!o.hold) { P(() => ell(31, hy - 3, 5, 6)); fs(PAL.gan); }
    modak(-29, -61);
    P(() => ell(-31, -68, 4, 1.4)); fs(PAL.gold, null);
  }
  // back arms (faint) with axe and lotus
  if (!SIL) {
    X.save(); X.globalAlpha = 0.85;
    limb([[-20, -100], [-38, -112], [-42, -124]], PAL.gan, 5); limb([[20, -100], [38, -112], [42, -124]], PAL.gan, 5);
    P(() => { X.moveTo(-42, -124); X.lineTo(-46, -150); }); X.strokeStyle = PAL.gold2; X.lineWidth = 1.5; X.stroke();
    P(() => { X.moveTo(-46, -150); X.quadraticCurveTo(-56, -146, -52, -138); X.lineTo(-45, -143); X.closePath(); }); fs('#d9d4c9', PAL.gold2, 0.6);
    for (let i = -2; i <= 2; i++) { P(() => ell(42 + i * 2.5, -128, 2.4, 6, i * 0.35)); fs('#f08aa0', '#b04a64', 0.5); }
    X.restore();
  } else {
    limb([[-20, -100], [-38, -112], [-42, -124]], PAL.gan, 5); limb([[20, -100], [38, -112], [42, -124]], PAL.gan, 5);
  }
  // necklace
  trim(() => { X.arc(0, -104, 12, 0.3, Math.PI - 0.3); }, PAL.gold, [1.4, 1.8], 1.6);
  // ears
  for (const sx of [-1, 1]) {
    P(() => { X.moveTo(sx * 10, -142); X.bezierCurveTo(sx * 36, -150, sx * 38, -114, sx * 16, -110); X.closePath(); }); fs(PAL.gan);
    P(() => { X.moveTo(sx * 13, -138); X.bezierCurveTo(sx * 30, -143, sx * 31, -119, sx * 17, -115); X.closePath(); }); fs('#e8857a', null);
  }
  // head
  P(() => ell(0, -128, 17, 18)); fs(PAL.gan);
  // trunk
  const tw = (o.trunk || 0);
  const trunkPath = () => { X.moveTo(0, -120); X.bezierCurveTo(4, -100, -4, -92, 6 + tw * 4, -84); X.quadraticCurveTo(14 + tw * 6, -82, 13 + tw * 4, -90); };
  X.lineCap = 'round';
  if (!SIL) { P(trunkPath); X.strokeStyle = PAL.gold; X.lineWidth = 10.5; X.stroke(); }
  P(trunkPath); X.strokeStyle = SIL ? SILC : PAL.gan; X.lineWidth = 8.5; X.stroke();
  trim(() => { X.moveTo(-3, -110); X.lineTo(3, -110); X.moveTo(-3, -104); X.lineTo(3, -104); X.moveTo(-2, -98); X.lineTo(4, -97); }, '#b86a35', [], 0.7);
  // tusk
  P(() => { X.moveTo(8, -116); X.quadraticCurveTo(15, -112, 17, -104); X.lineTo(11, -110); X.closePath(); }); fs('#fbf3df', '#b9a27a', 0.5);
  // eyes + smile
  if (!SIL) {
    const blink = o.blink ? 0.2 : 1;
    for (const ex of [-7, 7]) { P(() => ell(ex, -131, 2.2, 2.6 * blink)); X.fillStyle = '#1b120b'; X.fill(); P(() => ell(ex + 0.7, -132, 0.7, 0.7)); X.fillStyle = '#fff'; X.fill(); }
    const sm = o.smile || 0;
    P(() => { X.moveTo(-9, -118); X.quadraticCurveTo(-5, -114 + sm * 4, -1, -117); }); X.strokeStyle = '#7a3a1c'; X.lineWidth = 0.9 + sm * 0.5; X.stroke();
    P(() => ell(0, -142, 2.2, 3)); X.fillStyle = PAL.red; X.fill();
    trim(() => { X.moveTo(-8, -137); X.quadraticCurveTo(0, -140, 8, -137); }, '#f8f0e0', [], 1.2);
  }
  // crown
  P(() => { X.moveTo(-15, -142); X.lineTo(15, -142); X.lineTo(11, -156); X.lineTo(7, -170); X.lineTo(3, -184); X.lineTo(0, -192); X.lineTo(-3, -184); X.lineTo(-7, -170); X.lineTo(-11, -156); X.closePath(); }); fs('#e9bb3a', '#9b6a1c', 0.8);
  trim(() => { X.moveTo(-12, -156); X.lineTo(12, -156); X.moveTo(-8, -170); X.lineTo(8, -170); }, PAL.red, [], 1.4);
  P(() => ell(0, -149, 3, 3)); fs(PAL.red, PAL.gold, 0.6);
  X.restore();
}

function kartikeya(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  if (o.rods !== false) rods([[-18, -80], [22, -96]]);
  const breathe = o.pant ? Math.sin(o.pant) * 1.5 : 0;
  X.translate(0, breathe * 0.5);
  limb([[-6, -58], [-8, -30], [-7, 0]], PAL.kart, 7); limb([[6, -58], [8, -30], [7, 0]], PAL.kart, 7);
  P(() => { X.moveTo(-14, -82); X.lineTo(14, -82); X.lineTo(17, -40); X.quadraticCurveTo(0, -34, -17, -40); X.closePath(); }); fs(PAL.red);
  trim(() => { X.moveTo(-16, -44); X.quadraticCurveTo(0, -38, 16, -44); });
  P(() => { X.moveTo(-14, -122 - breathe); X.lineTo(14, -122 - breathe); X.lineTo(12, -82); X.lineTo(-12, -82); X.closePath(); }); fs(PAL.kart);
  trim(() => { X.moveTo(-12, -120); X.lineTo(10, -84); }, '#f7f0e2', [], 1);
  trim(() => { X.arc(0, -120, 9, 0.3, Math.PI - 0.3); }, PAL.gold, [1.4, 1.8], 1.6);
  // arms + spear (vel)
  limb([[-14, -118], [-22, -96], [-16, -80]], PAL.kart, 5.5);
  limb([[14, -118], [24, -102], [26, -112]], PAL.kart, 5.5);
  if (!o.noSpear) {
    P(() => { X.moveTo(27, 8); X.lineTo(27, -178); }); X.strokeStyle = SIL ? SILC : '#8b5a2b'; X.lineWidth = 2; X.stroke();
    P(() => { X.moveTo(27, -200); X.quadraticCurveTo(36, -186, 27, -174); X.quadraticCurveTo(18, -186, 27, -200); }); fs('#f0c85a', '#8e6118', 0.7);
    glow(27, -188, 14, '#ffe08a', 0.35);
  }
  // head
  P(() => X.rect(-4, -130, 8, 8)); fs(PAL.kart, null);
  P(() => ell(0, -140, 11, 12)); fs(PAL.kart);
  if (!SIL) {
    P(() => ell(4, -142, 1.6, 1.9)); X.fillStyle = '#1b120b'; X.fill();
    P(() => { X.moveTo(1, -134); X.quadraticCurveTo(4, -132 + (o.tired ? -1.5 : 1.5), 7, -134); }); X.strokeStyle = '#7a3a1c'; X.lineWidth = 0.9; X.stroke();
    P(() => { X.moveTo(-11, -142); X.quadraticCurveTo(-15, -128, -9, -120); X.lineTo(-6, -138); X.closePath(); }); X.fillStyle = '#1d140e'; X.fill();
  }
  P(() => { X.moveTo(-11, -148); X.lineTo(11, -148); X.lineTo(6, -170); X.lineTo(0, -190); X.lineTo(-6, -170); X.closePath(); }); fs('#e9bb3a', '#9b6a1c', 0.8);
  trim(() => { X.moveTo(-8, -158); X.lineTo(8, -158); X.moveTo(-5, -170); X.lineTo(5, -170); }, PAL.red, [], 1.3);
  if (o.tired && !SIL) { for (let i = 0; i < 2; i++) { const p = ((o.pant || 0) / 4 + i * 0.5) % 1; P(() => ell(-14 - p * 4, -150 + p * 18, 1.4, 2.2)); X.fillStyle = `rgba(160,220,255,${1 - p})`; X.fill(); } }
  X.restore();
}

function seated(x, y, s, kind, o = {}) {
  const skin = kind === 'shiva' ? PAL.shiva : PAL.parvati;
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  // halo
  if (!SIL) {
    P(() => X.arc(0, -86, 30, 0, TAU)); X.fillStyle = 'rgba(233,187,98,0.12)'; X.fill();
    trim(() => X.arc(0, -86, 30, 0, TAU), PAL.gold, [], 1.2);
    trim(() => X.arc(0, -86, 34, 0, TAU), PAL.gold, [1, 3], 1);
  }
  if (kind === 'parvati') { P(() => { X.moveTo(-12, -96); X.quadraticCurveTo(-20, -50, -14, -30); X.lineTo(10, -30); X.quadraticCurveTo(16, -60, 12, -96); X.closePath(); }); fs('#1d140e', null); }
  // lap / legs
  const lap = kind === 'shiva' ? '#d48a3a' : PAL.red;
  P(() => { X.moveTo(-40, -2); X.quadraticCurveTo(-44, -26, -14, -30); X.lineTo(14, -30); X.quadraticCurveTo(44, -26, 40, -2); X.quadraticCurveTo(0, 6, -40, -2); }); fs(lap);
  if (kind === 'shiva' && !SIL) { X.strokeStyle = '#3a2210'; X.lineWidth = 1.6; for (let i = -3; i <= 3; i++) { P(() => { X.moveTo(i * 10 - 3, -24); X.quadraticCurveTo(i * 10, -14, i * 10 + 2, -6); }); X.stroke(); } }
  trim(() => { X.moveTo(-38, -4); X.quadraticCurveTo(0, 4, 38, -4); });
  // torso
  P(() => { X.moveTo(-17, -30); X.lineTo(17, -30); X.lineTo(14, -72); X.quadraticCurveTo(0, -78, -14, -72); X.closePath(); }); fs(skin);
  if (kind === 'parvati') { P(() => { X.moveTo(-17, -30); X.lineTo(4, -30); X.lineTo(12, -72); X.lineTo(4, -72); X.closePath(); }); fs(PAL.red); trim(() => { X.moveTo(-14, -32); X.lineTo(10, -70); }); }
  // arms
  const raise = o.raise || 0;
  limb([[-14, -68], [-24, -46], [-12, -34]], skin, 6);
  limb([[14, -68], [lerp(24, 26, raise), lerp(-46, -82, raise)], [lerp(14, 28, raise), lerp(-36, -100, raise)]], skin, 6);
  if (raise > 0.5 && !SIL) { P(() => ell(28, -104, 4, 6)); fs(skin); }
  // neck ornaments
  if (kind === 'shiva') {
    trim(() => X.arc(0, -70, 10, 0.2, Math.PI - 0.2), '#7a4a2a', [1.6, 1.4], 2);
    if (!SIL) { P(() => { X.moveTo(-12, -74); X.quadraticCurveTo(0, -60, 12, -74); X.quadraticCurveTo(16, -82, 18, -88); }); X.strokeStyle = '#3f8a72'; X.lineWidth = 2.5; X.stroke(); P(() => ell(18, -89, 2.6, 1.8, -0.6)); X.fillStyle = '#3f8a72'; X.fill(); }
  } else trim(() => X.arc(0, -72, 9, 0.2, Math.PI - 0.2), PAL.gold, [1.4, 1.6], 1.8);
  // head
  P(() => X.rect(-4, -80, 8, 6)); fs(skin, null);
  P(() => ell(0, -88, 12, 13)); fs(skin);
  if (!SIL) {
    const bl = o.blink ? 0.2 : 1;
    for (const ex of [-4.5, 4.5]) { P(() => ell(ex, -89, 2.2, 1.2 * bl)); X.fillStyle = '#1b120b'; X.fill(); }
    P(() => { X.moveTo(-3, -82); X.quadraticCurveTo(0, -80, 3, -82); }); X.strokeStyle = '#6a2a1a'; X.lineWidth = 0.9; X.stroke();
    if (kind === 'shiva') { trim(() => { X.moveTo(-6, -96); X.lineTo(6, -96); X.moveTo(-6, -98); X.lineTo(6, -98); }, '#f4efe4', [], 0.7); P(() => ell(0, -97, 1.2, 2)); X.fillStyle = PAL.red; X.fill(); }
    else { P(() => ell(0, -96, 1.5, 1.5)); X.fillStyle = PAL.red; X.fill(); }
  }
  if (kind === 'shiva') {
    P(() => { X.moveTo(-11, -96); X.quadraticCurveTo(-14, -118, -2, -126); X.quadraticCurveTo(10, -124, 11, -96); X.closePath(); }); fs('#20170f', '#4a3424', 0.8);
    trim(() => { X.moveTo(-8, -108); X.lineTo(8, -108); X.moveTo(-6, -116); X.lineTo(6, -116); }, '#6b5132', [], 1);
    if (!SIL) { P(() => { X.arc(8, -122, 6, -1.9, 1.1); X.arc(10, -124, 5, 1.1, -1.9, true); }); X.fillStyle = '#f6f0d8'; X.fill(); }
    if (o.trident) { P(() => { X.moveTo(-46, 0); X.lineTo(-46, -140); }); X.strokeStyle = SIL ? SILC : '#8d8d8d'; X.lineWidth = 2; X.stroke();
      P(() => { X.moveTo(-56, -150); X.quadraticCurveTo(-56, -136, -46, -136); X.quadraticCurveTo(-36, -136, -36, -150); X.moveTo(-46, -136); X.lineTo(-46, -158); }); X.strokeStyle = SIL ? SILC : '#cfcfcf'; X.lineWidth = 2; X.stroke(); }
  } else {
    P(() => { X.moveTo(-12, -94); X.lineTo(12, -94); X.lineTo(9, -110); X.lineTo(4, -104); X.lineTo(0, -118); X.lineTo(-4, -104); X.lineTo(-9, -110); X.closePath(); }); fs('#e9bb3a', '#9b6a1c', 0.7);
  }
  X.restore();
}

function peacock(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  const fan = o.fan || 0, fly = o.fly, fl = o.flap || 0;
  if (fan > 0.01) {
    const n = 15;
    for (let i = 0; i < n; i++) {
      const a = lerp(-Math.PI / 2 - 0.2, -Math.PI / 2 - 0.2, 0) + lerp(-1.25, 1.25, i / (n - 1)) * fan - 0.35;
      X.save(); X.translate(-8, -18); X.rotate(a + Math.PI / 2);
      const L = 60 * (0.6 + 0.4 * fan);
      P(() => ell(0, -L / 2, 7, L / 2)); fs('#2c6e5a', '#1a4a3c', 0.6);
      P(() => ell(0, -L + 8, 6, 7)); fs('#d8b545', null); P(() => ell(0, -L + 8, 4, 5)); fs('#2a8aa0', null); P(() => ell(0, -L + 8.5, 2, 2.6)); fs('#152a55', null);
      X.restore();
    }
  } else {
    // trailing tail
    for (let i = -3; i <= 3; i++) {
      X.save(); X.translate(-14, -12); X.rotate(Math.PI + i * 0.06 + (fly ? Math.sin(fl * 0.7 + i) * 0.03 : 0.35));
      P(() => ell(32, 0, 34, 4)); fs('#2c6e5a', '#1a4a3c', 0.5);
      P(() => ell(58, 0, 5, 4)); fs('#d8b545', null); P(() => ell(58, 0, 3, 2.6)); fs('#152a55', null);
      X.restore();
    }
  }
  if (!fly) { limb([[-2, -8], [-4, 8]], '#b98a4a', 1.5); limb([[4, -8], [6, 8]], '#b98a4a', 1.5); }
  // body
  const bg = SIL ? SILC : (() => { const g = X.createLinearGradient(0, -30, 0, 0); g.addColorStop(0, '#2f7fb8'); g.addColorStop(1, '#1d4f86'); return g; })();
  P(() => { X.moveTo(-20, -12); X.bezierCurveTo(-14, -30, 10, -28, 14, -18); X.bezierCurveTo(16, -8, 4, -2, -8, -4); X.quadraticCurveTo(-16, -6, -20, -12); }); fs(bg);
  // wing
  const wa = fly ? Math.sin(fl) * 0.9 : 0;
  X.save(); X.translate(0, -16); X.rotate(-0.2 - wa * 0.6);
  P(() => { X.moveTo(0, 0); X.bezierCurveTo(-10, -6 - wa * 14, -26, -6 - wa * 20, -30, 2 - wa * 20); X.bezierCurveTo(-20, 4, -8, 6, 0, 0); }); fs('#c08a4c', '#7a5226', 0.6);
  X.restore();
  // neck + head
  P(() => { X.moveTo(6, -24); X.bezierCurveTo(12, -40, 14, -46, 18, -50); X.lineTo(24, -48); X.bezierCurveTo(20, -40, 18, -30, 14, -18); X.closePath(); }); fs('#2468b0', '#e9bb62', 0.6);
  P(() => ell(21, -51, 5, 4.5)); fs('#2468b0');
  P(() => { X.moveTo(25, -52); X.lineTo(31, -50); X.lineTo(25, -48.5); X.closePath(); }); fs('#d9c79a', null);
  if (!SIL) { P(() => ell(22, -52, 1.1, 1.1)); X.fillStyle = '#0d0a08'; X.fill(); trim(() => { X.moveTo(19, -54); X.lineTo(23, -54); }, '#fff', [], 0.8); }
  for (let i = 0; i < 3; i++) { P(() => { X.moveTo(19, -55); X.lineTo(15 + i * 3, -64); }); X.strokeStyle = SIL ? SILC : '#2468b0'; X.lineWidth = 0.6; X.stroke(); P(() => ell(15 + i * 3, -64.5, 1.2, 1.2)); fs('#2a8aa0', null); }
  X.restore();
}

function mouse(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  const hop = o.hop || 0; X.translate(0, -hop);
  P(() => { X.moveTo(-12, -4); X.bezierCurveTo(-24, -6, -28, 4, -36, -2); }); X.strokeStyle = SIL ? SILC : '#8a7d73'; X.lineWidth = 1.4; X.stroke();
  P(() => ell(-2, -8, 13, 9)); fs('#a59a90', '#e9bb62', 0.6);
  P(() => ell(10, -13, 7, 6, -0.3)); fs('#a59a90', '#e9bb62', 0.6);
  P(() => ell(7, -19, 4, 4.5)); fs('#a59a90', '#e9bb62', 0.6); if (!SIL) { P(() => ell(7, -19, 2.4, 3)); X.fillStyle = '#e8a4a0'; X.fill(); }
  if (!SIL) {
    P(() => ell(17, -12, 1.5, 1.5)); X.fillStyle = '#e57b86'; X.fill();
    P(() => ell(12, -14.5, 1.3, o.look ? 1.6 : 1.3)); X.fillStyle = '#0d0a08'; X.fill();
    X.strokeStyle = 'rgba(240,230,210,0.7)'; X.lineWidth = 0.4; P(() => { X.moveTo(16, -11); X.lineTo(23, -13); X.moveTo(16, -11); X.lineTo(23, -9); }); X.stroke();
    // tiny saddle cloth
    P(() => { X.moveTo(-8, -16); X.quadraticCurveTo(-2, -18, 4, -16); X.lineTo(3, -8); X.lineTo(-7, -8); X.closePath(); }); fs(PAL.red, PAL.gold, 0.5);
  }
  limb([[-6, -2], [-7, 0]], '#a59a90', 2); limb([[4, -2], [5, 0]], '#a59a90', 2);
  X.restore();
}

function riderGroup(x, y, s, o = {}) { // Kartikeya standing on the flying peacock
  X.save(); X.translate(x, y); X.scale(s * (o.dir || 1), s);
  kartikeya(-2, -16, 0.42, { rods: false });
  peacock(0, 0, 1, { fly: true, flap: o.flap || 0 });
  X.restore();
}

// ---------- backgrounds ----------
const stars = (() => { const r = rng(7); return Array.from({ length: 120 }, () => [r() * W, r() * H * 0.75, r() * 1.2 + 0.3, r() * TAU]); })();
function starfield(t, a = 1, ymax = H) {
  for (const [x, y, r, p] of stars) { if (y > ymax) continue; const tw = 0.55 + 0.45 * Math.sin(t * 2 + p * 3); X.fillStyle = `rgba(255,240,210,${a * tw})`; P(() => X.arc(x, y, r * 0.7, 0, TAU)); X.fill(); }
}
const moonSprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const m = c.getContext('2d');
  m.fillStyle = '#f6ebcb'; m.beginPath(); m.arc(64, 64, 60, 0, TAU); m.fill();
  m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.arc(64 + 27, 64 - 12, 54, 0, TAU); m.fill(); return c; })();
function moon(x, y, r) {
  glow(x, y, r * 4, '#f5e6c0', 0.18);
  X.drawImage(moonSprite, x - r * 1.0667, y - r * 1.0667, r * 2.1333, r * 2.1333);
}
function kailashBG(t, o = {}) {
  const g = X.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b1229'); g.addColorStop(0.55, '#2a2647'); g.addColorStop(0.85, '#4a3346'); g.addColorStop(1, '#1a120d');
  X.fillStyle = g; X.fillRect(-200, -200, W + 400, H + 400);
  starfield(t, 0.9, 420);
  moon(285, 120, 16);
  // far range
  P(() => { X.moveTo(-60, 470); X.lineTo(20, 400); X.lineTo(60, 430); X.lineTo(110, 380); X.lineTo(150, 420); X.lineTo(250, 410); X.lineTo(300, 370); X.lineTo(420, 460); X.lineTo(420, 700); X.lineTo(-60, 700); X.closePath(); });
  X.fillStyle = '#2b3150'; X.fill();
  // Kailash
  const mg = X.createLinearGradient(130, 240, 230, 500); mg.addColorStop(0, '#9fb0cc'); mg.addColorStop(1, '#3d4866');
  P(() => { X.moveTo(40, 520); X.lineTo(150, 280); X.quadraticCurveTo(180, 236, 210, 280); X.lineTo(330, 520); X.closePath(); }); X.fillStyle = mg; X.fill();
  P(() => { X.moveTo(132, 320); X.lineTo(150, 280); X.quadraticCurveTo(180, 236, 210, 280); X.lineTo(228, 320); X.lineTo(210, 312); X.lineTo(196, 330); X.lineTo(180, 312); X.lineTo(162, 334); X.lineTo(150, 314); X.closePath(); }); X.fillStyle = '#eef2f8'; X.fill();
  X.strokeStyle = 'rgba(230,238,250,0.35)'; X.lineWidth = 1;
  for (let i = 0; i < 6; i++) { P(() => { X.moveTo(166 + i * 6, 330); X.lineTo(150 + i * 12, 500); }); X.stroke(); }
  X.strokeStyle = 'rgba(233,187,98,0.5)'; X.lineWidth = 0.8;
  P(() => { X.moveTo(40, 520); X.lineTo(150, 280); X.quadraticCurveTo(180, 236, 210, 280); X.lineTo(330, 520); }); X.stroke();
  // mist
  for (let i = 0; i < 3; i++) { const mx = ((t * 6 + i * 140) % 520) - 80; glow(mx, 470 + i * 14, 110, '#8e88a8', 0.18); }
  // ground
  const gg = X.createLinearGradient(0, 500, 0, H); gg.addColorStop(0, '#2a1d15'); gg.addColorStop(1, '#120c08');
  P(() => { X.moveTo(-200, 520); X.quadraticCurveTo(180, 490, 560, 520); X.lineTo(560, 900); X.lineTo(-200, 900); X.closePath(); }); X.fillStyle = gg; X.fill();
  X.strokeStyle = 'rgba(233,187,98,0.35)'; X.lineWidth = 0.8; P(() => { X.moveTo(-200, 520); X.quadraticCurveTo(180, 490, 560, 520); }); X.stroke();
}

function lamp(x, y, t, seed) {
  X.strokeStyle = '#6b4a25'; X.lineWidth = 0.7; P(() => { X.moveTo(x, -50); X.lineTo(x, y - 8); }); X.stroke();
  P(() => { X.moveTo(x - 9, y - 6); X.lineTo(x + 9, y - 6); X.lineTo(x + 5, y); X.lineTo(x - 5, y); X.closePath(); }); fs('#c98f33', '#7a5220', 0.6);
  const f = 1 + 0.15 * Math.sin(t * 13 + seed) + 0.1 * Math.sin(t * 7.3 + seed * 2);
  glow(x, y - 12, 50 * f, '#ffb24a', 0.45);
  P(() => { X.moveTo(x, y - 18 * f); X.quadraticCurveTo(x + 4, y - 9, x, y - 6); X.quadraticCurveTo(x - 4, y - 9, x, y - 18 * f); }); X.fillStyle = '#ffe2a0'; X.fill();
}

function palaceBG(t, o = {}) {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1e140d'); g.addColorStop(0.5, PAL.wall); g.addColorStop(1, '#130c07');
  X.fillStyle = g; X.fillRect(-200, -200, W + 400, H + 400);
  // pillars
  for (const px of [-10, 330]) {
    P(() => X.rect(px, 0, 40, 470)); fs('#3a2717', '#7a5426', 1);
    for (let i = 0; i < 4; i++) { P(() => X.arc(px + 20, 90 + i * 100, 8, 0, TAU)); fs(null, PAL.red, 1.4); P(() => X.arc(px + 20, 90 + i * 100, 3, 0, TAU)); fs(PAL.red, null); }
    trim(() => { X.moveTo(px + 6, 0); X.lineTo(px + 6, 470); X.moveTo(px + 34, 0); X.lineTo(px + 34, 470); }, PAL.gold2, [2, 3], 0.8);
  }
  // arch window
  const arch = () => { X.moveTo(110, 360); X.lineTo(110, 180); X.quadraticCurveTo(110, 110, 180, 80); X.quadraticCurveTo(250, 110, 250, 180); X.lineTo(250, 360); X.closePath(); };
  X.save(); P(arch); X.clip();
  const sg = X.createLinearGradient(0, 80, 0, 360); sg.addColorStop(0, '#15204a'); sg.addColorStop(1, '#2d3f74'); X.fillStyle = sg; X.fillRect(100, 70, 160, 300);
  for (const [x, y, r, p] of stars.slice(0, 40)) { const sx = 112 + (x / W) * 136, sy = 90 + (y / H) * 260; X.fillStyle = `rgba(255,236,190,${0.5 + 0.5 * Math.sin(t * 2 + p * 4)})`; P(() => X.arc(sx, sy, r * 0.6, 0, TAU)); X.fill(); }
  moon(205, 170, 11);
  // hanging stars
  for (const [sx, l] of [[140, 80], [163, 120], [228, 100]]) { X.strokeStyle = 'rgba(233,187,98,0.6)'; X.lineWidth = 0.5; P(() => { X.moveTo(sx, 80); X.lineTo(sx, 80 + l); }); X.stroke(); sparkle(sx, 84 + l, 4, 0.9, '#f2cf73'); }
  X.restore();
  P(arch); fs(null, PAL.gold, 2); X.save(); X.translate(180, 225); X.scale(1.09, 1.05); X.translate(-180, -225); P(arch); fs(null, PAL.gold2, 0.8); X.restore();
  // curtains
  for (const side of [-1, 1]) {
    X.save(); X.translate(180, 0); X.scale(side, 1); X.translate(-180, 0);
    const cg = X.createLinearGradient(70, 0, 118, 0);
    for (let i = 0; i <= 6; i++) cg.addColorStop(i / 6, i % 2 ? '#8d2a1d' : '#c4473a');
    const sway = Math.sin(t * 0.9 + side) * 2;
    P(() => { X.moveTo(64, 60); X.lineTo(122, 60); X.quadraticCurveTo(112 + sway, 200, 96 + sway, 300); X.quadraticCurveTo(90, 360, 104, 400); X.lineTo(60, 400); X.closePath(); }); X.fillStyle = cg; X.fill();
    glow(100, 300, 60, '#ff5a3a', 0.12);
    X.restore();
  }
  lamp(68, 290, t, 1); lamp(292, 290, t, 2);
  // floor
  const fg = X.createLinearGradient(0, 455, 0, H); fg.addColorStop(0, '#3b2818'); fg.addColorStop(1, '#100a06');
  X.fillStyle = fg; X.fillRect(-200, 455, W + 400, 400);
  X.strokeStyle = 'rgba(233,187,98,0.12)'; X.lineWidth = 0.6;
  for (let i = -8; i <= 8; i++) { P(() => { X.moveTo(180 + i * 20, 455); X.lineTo(180 + i * 70, 700); }); X.stroke(); }
  for (const yy of [480, 515, 565, 630]) { P(() => { X.moveTo(-200, yy); X.lineTo(560, yy); }); X.stroke(); }
  X.strokeStyle = 'rgba(233,187,98,0.45)'; P(() => { X.moveTo(-200, 455); X.lineTo(560, 455); }); X.stroke();
  // soft light beam from window
  X.save(); X.globalCompositeOperation = 'lighter';
  const bgm = X.createLinearGradient(0, 120, 0, 600); bgm.addColorStop(0, 'rgba(120,150,220,0.10)'); bgm.addColorStop(1, 'rgba(120,150,220,0)');
  P(() => { X.moveTo(130, 140); X.lineTo(230, 140); X.lineTo(290, 620); X.lineTo(70, 620); X.closePath(); }); X.fillStyle = bgm; X.fill();
  X.restore();
}

function dais(x, y, w) { P(() => X.rect(x - w / 2, y - 8, w, 12)); fs('#5a3a1e', PAL.gold, 1); trim(() => { X.moveTo(x - w / 2 + 3, y - 2); X.lineTo(x + w / 2 - 3, y - 2); }); }

// globe
const continents = (() => { const r = rng(42); const out = []; for (let k = 0; k < 7; k++) { const lon0 = r() * TAU, lat0 = (r() - 0.5) * 2.2, rad = 0.35 + r() * 0.35; const pts = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, rr = rad * (0.7 + 0.5 * r()); pts.push([lon0 + Math.cos(a) * rr * 1.3, clamp(lat0 + Math.sin(a) * rr, -1.4, 1.4)]); } out.push(pts); } return out; })();
function globe(x, y, R, rot, o = {}) {
  glow(x, y, R * 1.6, '#5fb7a8', 0.25 * (o.a ?? 1));
  X.save(); X.globalAlpha = o.a ?? 1;
  const og = X.createRadialGradient(x - R * 0.35, y - R * 0.35, R * 0.1, x, y, R); og.addColorStop(0, '#3f9bb0'); og.addColorStop(1, '#173a5c');
  P(() => X.arc(x, y, R, 0, TAU)); X.fillStyle = o.line ? 'rgba(0,0,0,0)' : og; X.fill();
  X.save(); P(() => X.arc(x, y, R, 0, TAU)); X.clip();
  if (!o.line) {
    for (const pts of continents) {
      const [clo, cla] = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
      const vis = Math.cos(cla) * Math.cos(clo - rot);
      if (vis < 0.05) continue;
      X.save(); X.globalAlpha *= clamp(vis * 3, 0, 1);
      P(() => { pts.forEach(([lo, la], i) => { const l = lo - rot; const px = x + R * Math.cos(la) * Math.sin(l), py = y - R * Math.sin(la); i ? X.lineTo(px, py) : X.moveTo(px, py); }); X.closePath(); });
      X.fillStyle = '#d7b25e'; X.fill(); X.strokeStyle = '#8a6a2a'; X.lineWidth = 0.8; X.stroke(); X.restore();
    }
  }
  X.strokeStyle = o.line ? 'rgba(233,187,98,0.8)' : 'rgba(255,240,200,0.18)'; X.lineWidth = o.line ? 1.2 : 0.6;
  for (let i = 0; i < 6; i++) { const l = ((i / 6) * Math.PI + rot) % Math.PI; P(() => ell(x, y, Math.abs(Math.cos(l)) * R, R)); X.stroke(); }
  for (let i = -2; i <= 2; i++) { const la = i * 0.5; P(() => ell(x, y - R * Math.sin(la), R * Math.cos(la), R * Math.cos(la) * 0.12)); X.stroke(); }
  X.restore();
  P(() => X.arc(x, y, R, 0, TAU)); X.strokeStyle = PAL.gold; X.lineWidth = 1.5; X.stroke();
  X.restore();
}

