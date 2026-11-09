'use strict';
// The demon: every shape that came before, and the one under them. c.anger (set by the night) is how much you are
// still holding and drives the pace; c.rage (the night eases it toward anger) is how it looks: anything at all in your
// hands and it is plainly enraged, red-eyed, snarling and shaking, its limbs long. Empty-handed it is only tall.
// For the ending the night also sets c.calm (it settles: no rage left in its body, a little smaller), c.soft (the dark
// lightens), c.dance and c.fade; c.mood, the face it makes while it holds you (see DEMON_MOODS); c.hug, its arms coming
// out to you and closing round you; c.tilt0 and c.settle (its head comes level from where it was), and c.still (reduced
// motion: no trembling, no tear running).
// The faces it goes through, in order: c.mood 0 is the face it came with, 6 is happy, and between two whole numbers it is
// part way from one to the next. Each is a set of numbers, so any two blend smoothly. Measured from fy (see draw): the eyes
// sit at fy + 0.03, brows bi (inner end) and bo (outer end) above them; er, eh the eye's half width and height, open how far
// it is open, lid its slant (outer corner down), lidLine an upper lid drawn over it, sock a dark socket, glow red light in
// it, pup a pupil (0: blank), gaze where the pupil looks, arc closed happy eyes; the mouth: corners my below fy and mc
// higher than that, its upper lip's middle mu above the corners and its lower lip's md, mr how round it is, teeth, joy (a
// red mouth with a tongue), tears, blush; jaw a longer face, fw a wider one, tilt of the head and trem a tremble.
const DEMON_MOODS = [
  // as it came: blank white eyes and a round open mouth
  { skin: [110, 100, 104], fw: 0, jaw: 0, brow: 0, bi: 0.03, bo: 0.03, bw: 0.012, er: 0.016, eh: 0.012, open: 1, lid: 0, lidLine: 0, sock: 0, glow: 0, pup: 0, gaze: 0, arc: 0, my: -0.08, mw: 0.039, mc: 0, mu: 0.04, md: -0.04, mr: 1, teeth: 0, joy: 0, tears: 0, blush: 0, tilt: 0, trem: 0 },
  // rage: red, the eyes burning slits in dark sockets under brows driven down, a snarl full of teeth, shaking
  { skin: [160, 34, 30], fw: 0.004, jaw: 1, brow: 1, bi: 0.008, bo: 0.042, bw: 0.017, er: 0.028, eh: 0.011, open: 1, lid: -0.24, lidLine: 0, sock: 1, glow: 1, pup: 0, gaze: 0, arc: 0, my: -0.1, mw: 0.062, mc: -0.004, mu: 0.045, md: -0.07, mr: 0.85, teeth: 1, joy: 0, tears: 0, blush: 0, tilt: 0.04, trem: 1 },
  // anguish: the brows wrenched up in the middle, the eyes screwed shut, the mouth dragged down and open in a wail
  { skin: [150, 92, 96], fw: 0.004, jaw: 0.8, brow: 1, bi: 0.064, bo: 0.02, bw: 0.014, er: 0.022, eh: 0.013, open: 0.2, lid: 0.34, lidLine: 1, sock: 0.5, glow: 0, pup: 0, gaze: 0, arc: 0, my: -0.105, mw: 0.052, mc: -0.026, mu: 0.034, md: -0.058, mr: 0.55, teeth: 0.12, joy: 0, tears: 0.45, blush: 0, tilt: -0.13, trem: 0.6 },
  // fear: pale, the brows high, the eyes wide with tiny pupils, the mouth stretched open
  { skin: [184, 190, 202], fw: 0, jaw: 0.45, brow: 1, bi: 0.062, bo: 0.05, bw: 0.012, er: 0.023, eh: 0.02, open: 1, lid: 0.04, lidLine: 0.6, sock: 0.25, glow: 0, pup: 0.0045, gaze: 0, arc: 0, my: -0.092, mw: 0.046, mc: -0.012, mu: 0.016, md: -0.042, mr: 0.5, teeth: 0.3, joy: 0, tears: 0, blush: 0, tilt: 0.06, trem: 1 },
  // sorrow: the brows up in the middle, heavy lids, eyes cast down, tears running, the mouth turned down and trembling
  { skin: [172, 164, 178], fw: 0.004, jaw: 0, brow: 1, bi: 0.05, bo: 0.016, bw: 0.012, er: 0.018, eh: 0.012, open: 0.5, lid: 0.3, lidLine: 1, sock: 0.2, glow: 0, pup: 0.0062, gaze: -0.0045, arc: 0, my: -0.086, mw: 0.032, mc: -0.016, mu: 0.005, md: -0.008, mr: 0.3, teeth: 0, joy: 0, tears: 1, blush: 0.15, tilt: 0.15, trem: 0.35 },
  // calm: warmer, the brows level, soft open eyes, the corners of the mouth just up
  { skin: [222, 200, 184], fw: 0.012, jaw: 0, brow: 0.6, bi: 0.036, bo: 0.034, bw: 0.01, er: 0.017, eh: 0.012, open: 0.72, lid: 0.08, lidLine: 0.8, sock: 0, glow: 0, pup: 0.0068, gaze: 0, arc: 0, my: -0.07, mw: 0.036, mc: 0.009, mu: -0.002, md: -0.01, mr: 0.3, teeth: 0, joy: 0.2, tears: 0.15, blush: 0.3, tilt: 0.04, trem: 0 },
  // happy: eyes closed in two arches, round pink cheeks, a wide open smile
  { skin: [240, 214, 186], fw: 0.02, jaw: 0, brow: 0, bi: 0.04, bo: 0.036, bw: 0.01, er: 0.016, eh: 0.012, open: 0, lid: 0, lidLine: 0, sock: 0, glow: 0, pup: 0, gaze: 0, arc: 1, my: -0.045, mw: 0.05, mc: 0, mu: 0, md: -0.04, mr: 1, teeth: 0, joy: 1, tears: 0, blush: 1, tilt: 0, trem: 0 },
];
function demonMood(m) {
  const i = clamp(Math.floor(m), 0, DEMON_MOODS.length - 2), k = smoothstep(clamp(m - i, 0, 1)), A = DEMON_MOODS[i], B = DEMON_MOODS[i + 1], F = {};
  for (const key in A) F[key] = Array.isArray(A[key]) ? mixc(A[key], B[key], k) : lerp(A[key], B[key], k);
  return F;
}
// the face for c.mood, drawn in the head's frame (fy as draw() has it)
function demonMoodFace(ctx, c, P, fy, F) {
  const t = c.t, black = P.col([0, 0, 0]), move = c.still ? 0 : 1;
  const fh = 0.13 + 0.045 * F.jaw, fc = fy - 0.03 * F.jaw, ey = fy + 0.03;
  P_ell(ctx, 0, fc, 0.085 + F.fw, fh, P.col(F.skin));
  // the mouth first, so the eyes are never under it: corners, the middle of each lip, and how round its ends are
  const q = move * F.trem * Math.sin(t * 23) * 0.003, w = F.mw, cy = fy + F.my + F.mc, uy = fy + F.my + F.mu + q, dy = fy + F.my + F.md - q, xr = lerp(0.3, 1, F.mr);
  const cu = (uy - 0.25 * cy) / 0.75, cd = (dy - 0.25 * cy) / 0.75;
  const mouth = () => { ctx.beginPath(); ctx.moveTo(-w, cy); ctx.bezierCurveTo(-w * xr, cu, w * xr, cu, w, cy); ctx.bezierCurveTo(w * xr, cd, -w * xr, cd, -w, cy); ctx.closePath(); };
  mouth(); ctx.fillStyle = P.col(mixc([0, 0, 0], [120, 34, 44], F.joy)); ctx.fill();
  if (F.teeth > 0.02 || F.joy > 0.02) {
    ctx.save(); mouth(); ctx.clip();
    const tooth = P.cola([224, 212, 200], Math.min(1, F.teeth * 1.5)), edge = (y0, x) => cy + (y0 - cy) * (1 - (x / w) * (x / w));
    if (F.teeth > 0.02) for (let i = -2; i <= 2; i++) {
      const x = i * w * 0.38, up = edge(uy, x), dn = edge(dy, x);
      P_line(ctx, x, up + 0.02, x, up - Math.abs(up - dn) * 0.36 * F.teeth, 0.011, tooth);
      P_line(ctx, x, dn - 0.02, x, dn + Math.abs(up - dn) * 0.26 * F.teeth, 0.011, tooth);
    }
    if (F.joy > 0.02) P_ell(ctx, 0, dy + 0.013, w * 0.44, 0.011, P.cola([230, 120, 130], F.joy));
    ctx.restore();
  }
  if (F.blush > 0.02) for (const s of [-1, 1]) P_ell(ctx, s * 0.06, fy - 0.025, 0.02, 0.014, P.cola([236, 120, 130], 0.7 * F.blush));
  const er = [255, 50, 30], open = 1 - F.arc;
  for (const s of [-1, 1]) {
    const ex = s * 0.036, rot = -s * F.lid, ry = Math.max(0.0015, F.eh * F.open);
    if (F.sock > 0.02) P_ell(ctx, ex, ey, 0.032, 0.02 + 0.004 * F.lid, P.cola([0, 0, 0], F.sock), rot);
    if (F.glow > 0.02) P_ell(ctx, ex, ey, 0.046, 0.022, rgba(er, 0.25 * F.glow), rot);
    if (open > 0.02) {
      ctx.save(); ctx.globalAlpha *= open;
      P_ell(ctx, ex, ey, F.er, ry, P.col([236, 232, 220]), rot);
      if (F.glow > 0.02) P_ell(ctx, ex, ey, F.er, ry, rgba(er, F.glow), rot);
      if (F.pup > 0.0005) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, F.er, ry, rot, 0, TAU); ctx.clip();
        P_ell(ctx, ex, ey + F.gaze, F.pup, F.pup, black); P_ell(ctx, ex + 0.003, ey + F.gaze + 0.003, F.pup * 0.35, F.pup * 0.35, P.col([255, 255, 255]));
        ctx.restore();
      }
      if (F.lidLine > 0.02) { ctx.strokeStyle = P.cola([20, 12, 16], F.lidLine); ctx.lineWidth = 0.007; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(ex, ey, F.er * 1.08, ry + 0.002, rot, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke(); }
      ctx.restore();
    }
    if (F.arc > 0.02) { ctx.strokeStyle = P.cola([0, 0, 0], F.arc); ctx.lineWidth = 0.012; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(ex, ey - 0.01, 0.02, 0.25, Math.PI - 0.25); ctx.stroke(); }
    if (F.brow > 0.02) P_line(ctx, s * 0.068, ey + F.bo, s * 0.013, ey + F.bi, F.bw, P.cola([0, 0, 0], F.brow));
    if (F.tears > 0.02) {
      // a wet line down from the lower lid, and a drop running down it
      const x0 = s * 0.04, y0 = ey - ry - 0.002, x1 = s * 0.054, y1 = ey - 0.085, tear = [200, 228, 255];
      ctx.strokeStyle = rgba(tear, 0.7 * F.tears); ctx.lineWidth = 0.006; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(s * 0.05, ey - 0.03, x1, y1); ctx.stroke();
      P_ell(ctx, ex, y0 + 0.001, F.er * 0.85, 0.003, rgba(tear, 0.6 * F.tears));
      const u = move ? (t * 0.42 + (s > 0 ? 0 : 0.5)) % 1 : 0.62, a = F.tears * Math.min(1, (1 - u) * 6), px = lerp(lerp(x0, s * 0.05, u), lerp(s * 0.05, x1, u), u), py = lerp(lerp(y0, ey - 0.03, u), lerp(ey - 0.03, y1, u), u);
      P_ell(ctx, px, py, 0.0065, 0.009, rgba(tear, 0.9 * a)); P_ell(ctx, px - 0.002, py + 0.003, 0.002, 0.003, rgba([255, 255, 255], a));
    }
  }
}
// the arms coming out to you and closing round you (c.hug: reach 0..1, wrap 0..1, eyeY: the eye's height above its feet).
// Each joint is placed in front of it (z: metres toward you) and drawn where it would fall on its own plane as seen from
// the eye, so an arm coming toward you grows and swings out past the edges of the view; a part nearer than a hand's
// breadth from the eye is not drawn. At reach 0 and wrap 0 it is the arm as draw() has it.
function demonHugArms(ctx, c, P, body, S0, E0, H0, wid, fing) {
  const h = c.hug, d = Math.max(0.6, c.dist), eY = h.eyeY, r = smoothstep(h.reach), w = smoothstep(h.wrap), zc = d - 0.12;
  const proj = p => { const k = d / Math.max(0.12, d - p[2]); return [p[0] * k, eY + (p[1] - eY) * k, k]; };
  const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const squeeze = (c.still ? 0 : Math.sin(c.t * 1.3) * 0.5 + 0.5) * w * 0.04;
  const seg = (A, B, wa, wb) => {
    if (A[2] >= zc) return null;
    if (B[2] > zc) { const k = (zc - A[2]) / (B[2] - A[2]); B = mix3(A, B, k); wb = lerp(wa, wb, k); }
    const a = proj(A), b = proj(B), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1e-6, nx = -dy / l, ny = dx / l, ha = wa * a[2] / 2, hb = wb * b[2] / 2;
    ctx.beginPath(); ctx.moveTo(a[0] + nx * ha, a[1] + ny * ha); ctx.lineTo(b[0] + nx * hb, b[1] + ny * hb); ctx.lineTo(b[0] - nx * hb, b[1] - ny * hb); ctx.lineTo(a[0] - nx * ha, a[1] - ny * ha); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(a[0], a[1], ha, 0, TAU); ctx.fill();
    if (B[2] < zc) { ctx.beginPath(); ctx.arc(b[0], b[1], hb, 0, TAU); ctx.fill(); }
    return b;
  };
  ctx.fillStyle = body;
  for (const s of [-1, 1]) {
    const i = s > 0 ? 1 : 0;
    // reaching: up and out toward you, hands open; closed: the elbows beside you, the hands round behind you
    const E1 = [s * 0.38, eY - 0.18, d * 0.22], H1 = [s * 0.2, eY - 0.06, d * 0.5];
    const E2 = [s * (0.42 - squeeze), eY + 0.1, d * 0.72], H2 = [s * (0.12 - squeeze), eY + 0.05, d * 1.35];
    const S = S0[i], E = mix3(mix3(E0[i], E1, r), E2, w), H = mix3(mix3(H0[i], H1, r), H2, w);
    seg(S, E, wid, wid * 0.95);
    const hb = seg(E, H, wid * 0.95, wid * 0.85);
    if (!hb || H[2] >= zc) continue;
    // the fingers: as draw() has them at rest, then open toward you, then curling in round you
    const f0 = fing[i], dir = [H[0] - E[0], H[1] - E[1], H[2] - E[2]], dl = Math.hypot(dir[0], dir[1], dir[2]) || 1;
    for (let k = 0; k < 4; k++) {
      const len = (k === 0 || k === 3 ? 0.82 : 1) * lerp(f0.len, 0.15, r), sp = (k - 1.5) * 0.42;
      const T3 = [H[0] + (dir[0] / dl) * len * 0.6 + s * len * 0.25 * (1 - w) - s * len * 0.5 * w, H[1] + (dir[1] / dl) * len * 0.6 + sp * len, H[2] + (dir[2] / dl) * len * 0.6 + len * 0.55];
      const a = f0.angle + (k - 1.5) * f0.spread, rest = [H0[i][0] + Math.cos(a) * len, H0[i][1] + Math.sin(a) * len, 0];
      const tip = mix3(mix3(rest, T3, r), T3, w);
      seg(H, tip, 0.024, 0.016);
    }
  }
}
// how high its eyes are, from its feet, as draw() puts them (legs, the bob of its step, torso, neck and face all grow with rage)
function demonEyesY(c) {
  const calm = c.calm || 0, a = clamp(c.rage || 0, 0, 1) * (1 - calm);
  const top = 1.3 + a * 0.35 + 0.85 + Math.abs(Math.sin(c.gait)) * (0.04 + a * 0.06);
  return (top + 0.285 + a * 0.1 + 0.03) * (1 - 0.2 * calm);
}
CREATURES.demon = {
  name: 'the demon', h: 2.6, w: 1.6, faceY: 2.35, stepRate: 0.55, catchDist: 1.2, sound: 'walker',
  // the lunge brings faceY to eye level; enraged, its legs and neck are longer and its face sits higher than that, so the
  // pose lifts it the rest of the way and the last thing you see is its face, not its chest
  death: {
    delay: 0.25, dur: 0.5, sting: 'sting',
    pose(c, k) { c.yOff -= (demonEyesY(c) - CREATURES.demon.faceY) * smoothstep(k); },
  },
  voice: { kind: 'exhale', every: [4, 8] },
  eyesY: demonEyesY, moods: DEMON_MOODS.length,   // for the ending: where its eyes are, and how many faces it has
  init(c) { c.anger = 0; c.rage = 0; c.calm = 0; c.soft = 0; c.dance = 0; c.fade = 1; },
  speedMult(c, dt, seen) { return 1 + 0.45 * (c.anger || 0); },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 14, 0, 1), lunge = c.lunge || 0;
    const calm = c.calm || 0, soft = c.soft || 0, dance = c.dance || 0;
    const a = clamp(c.rage || 0, 0, 1) * (1 - calm);
    ctx.save();
    if (c.fade < 1) ctx.globalAlpha *= Math.max(0, c.fade);
    // enraged it shakes; happy it shrinks to fit a bedroom; dancing it hops and swings
    const hop = dance * Math.abs(Math.sin(t * 5.2)) * 0.14, swing = dance * Math.sin(t * 5.2) * 0.1, shake = a * Math.sin(t * 47) * 0.014;
    ctx.translate(shake, hop); ctx.rotate(swing); ctx.scale(1 - 0.2 * calm, 1 - 0.2 * calm);
    const body = P.col(mixc([4, 3, 6], [104, 90, 126], soft)), black = P.col([0, 0, 0]);
    const skin = P.col(mixc(mixc([110, 100, 104], [160, 34, 30], a), [240, 214, 186], calm)), eye = P.col([236, 232, 220]);
    const bob = Math.abs(Math.sin(g)) * (0.04 + a * 0.06), sway = Math.sin(g) * (0.03 + a * 0.05);
    const legL = 1.3 + a * 0.35, armL = 0.9 + a * 0.6;
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0) + dance * t * 5.2, lift = Math.max(0, Math.sin(ph)) * (0.2 + a * 0.2) * (dance ? 0.6 : 1);
      P_limb(ctx, [[s * 0.1 + sway, legL + bob], [s * (0.14 + a * 0.12) + sway * 0.6, legL * 0.5 + lift * 0.7], [s * (0.17 + a * 0.2) + sway * 0.3, lift + 0.03]], 0.08 - a * 0.02, body);
    }
    const top = legL + 0.85 + bob;
    P_poly(ctx, [[-0.16 + sway, legL - 0.05 + bob], [0.16 + sway, legL - 0.05 + bob], [0.24 + sway * 0.6, top], [-0.24 + sway * 0.6, top]], body);
    const raise = smoothstep(Math.max(near * (0.5 + a * 0.5), lunge));
    const hug = c.hug ? { S: [], E: [], H: [], f: [] } : null;   // holding you: the arms are drawn last, over the head (see demonHugArms)
    for (const s of [-1, 1]) {
      const sx = s * 0.22 + sway * 0.6, sy = top - 0.05;
      let ex = s * lerp(0.26, 0.55 + a * 0.3, raise), ey = lerp(top - 0.5, top - 0.3, raise);
      let hx = s * lerp(0.28, 0.42 + a * 0.35, raise), hy = lerp(top - armL, top + 0.05, raise);
      if (dance) { const wave = Math.sin(t * 5.2 + s) * 0.12; ex = lerp(ex, s * 0.42, dance); ey = lerp(ey, top + 0.2 + wave, dance); hx = lerp(hx, s * (0.36 + wave), dance); hy = lerp(hy, top + 0.62, dance); } // hands up, waving
      const fa = dance ? Math.PI / 2 : lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), fs = lerp(0.16, 0.34 + a * 0.1, raise), fl = 0.18 + a * 0.16;
      if (hug) { const i = s > 0 ? 1 : 0; hug.S[i] = [sx, sy, 0]; hug.E[i] = [ex, ey, 0]; hug.H[i] = [hx, hy, 0]; hug.f[i] = { angle: fa, spread: fs, len: fl }; continue; }
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.06 - a * 0.015, body);
      fingers(ctx, hx, hy, fa, fs, fl, 0.018, body);
    }
    // the head: the walker's face; enraged, red eyes under a scowl and the mouth hanging open down the face; calmed, a happy one.
    // Making a face for the ending (c.mood), its head comes level from where it was and leans as the face does
    const F = c.mood !== undefined && c.mood !== null ? demonMood(c.mood) : null;
    const tilt = F ? lerp(c.tilt0 || 0, F.tilt + (c.still ? 0 : F.trem * Math.sin(t * 31) * 0.018), c.settle === undefined ? 1 : c.settle) + dance * Math.sin(t * 2.6) * 0.18
      : headTiltJerk(t, 2.7 - a * 1.5, 0.3 + a * 0.3) * (1 - lunge) * (1 - calm) + dance * Math.sin(t * 2.6) * 0.18;
    ctx.save(); ctx.translate(sway * 0.6, top); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12 + a * 0.1, 0.07, body);
    P_ell(ctx, 0, 0.3 + a * 0.1, 0.115 + a * 0.03, 0.175 + a * 0.06, body);
    const fy = 0.285 + a * 0.1, fc = fy - a * 0.03, fh = 0.13 + a * 0.05;   // enraged, the face is longer: the jaw has dropped
    if (F) demonMoodFace(ctx, c, P, fy, F);
    else P_ell(ctx, 0, fc, 0.085 + calm * 0.02, fh, skin);
    if (!F && calm > 0.5) {
      // happy: eyes closed in two arches, round pink cheeks, a wide open smile
      ctx.strokeStyle = black; ctx.lineWidth = 0.012; ctx.lineCap = 'round';
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 0.036, fy + 0.02, 0.02, 0.25, Math.PI - 0.25); ctx.stroke(); }
      P_ell(ctx, -0.06, fy - 0.025, 0.02, 0.014, P.cola([236, 120, 130], 0.7)); P_ell(ctx, 0.06, fy - 0.025, 0.02, 0.014, P.cola([236, 120, 130], 0.7));
      ctx.fillStyle = P.col([120, 34, 44]); ctx.beginPath(); ctx.ellipse(0, fy - 0.045, 0.05, 0.04, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
      P_ell(ctx, 0, fy - 0.07, 0.022, 0.01, P.col([230, 120, 130]));
    } else if (!F) {
      // the mouth first, so the eyes are never under it. Enraged, it hangs open from just under the eyes to just above the
      // chin, a dark hole inside the red face, and the teeth stand along its edges, top and bottom
      const lip = fy + 0.004, chin = fc - fh + 0.014;
      const mw = Math.min(0.028 + near * 0.012 + a * 0.06, 0.068), mh = Math.min(0.012 + near * 0.03 + lunge * 0.045 + a * 0.1, (lip - chin) / 2);
      const my = lerp(fy - 0.08, lip - mh, a);
      P_ell(ctx, 0, my, mw, mh, black);
      if (a > 0.2) for (let i = -2; i <= 2; i++) {
        const x = i * mw * 0.4, e = mh * Math.sqrt(1 - (x / mw) * (x / mw)) * 0.94, tooth = P.col([224, 212, 200]);
        P_line(ctx, x, my + e, x, my + e - mh * 0.42 * a, 0.01, tooth);
        P_line(ctx, x, my - e, x, my - e + mh * 0.32 * a, 0.01, tooth);
      }
      if (a > 0.02) {
        // enraged: red glowing eyes, narrowed, under brows driven down to the middle
        const er = [255, 50 + (1 - a) * 60, 30];
        // far off in the dark they are all there is of it: two red points that stay a pixel or two across, in a faint haze
        const far = clamp((c.dist - 5) / 12, 0, 1) * a;
        if (far > 0) P_ell(ctx, 0, fy + 0.03, c.dist * 0.009, c.dist * 0.006, rgba(er, 0.16 * far));
        for (const s of [-1, 1]) {
          P_ell(ctx, s * 0.036, fy + 0.03, 0.032, 0.02 + (1 - a) * 0.004, black);   // a dark socket, so the eye glows out of it, not out of its red face
          P_ell(ctx, s * 0.036, fy + 0.03, 0.036 + a * 0.01, 0.022, P.cola(er, 0.25 * a));
          P_line(ctx, s * 0.065, fy + 0.068, s * 0.012, fy + 0.042, 0.014, black);
          P_ell(ctx, s * 0.036, fy + 0.03, Math.max(0.022 + a * 0.006, c.dist * 0.0015 * far), Math.max(0.01 + (1 - a) * 0.005, c.dist * 0.0012 * far), P.raw(er));
        }
      } else { P_ell(ctx, -0.036, fy + 0.03, 0.016, 0.012, eye); P_ell(ctx, 0.036, fy + 0.03, 0.016, 0.012, eye); }
    }
    ctx.restore();
    if (hug) demonHugArms(ctx, c, P, body, hug.S, hug.E, hug.H, 0.06 - a * 0.015, hug.f);
    ctx.restore();
  }
};
