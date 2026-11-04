// Archer and sage rigs, from the Arjuna short.
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

