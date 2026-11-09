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
// the arms coming out to you and closing round you (c.hug: reach 0..1, wrap 0..1). A thing this close is drawn as you see
// it, in the view's own pixels: from its shoulders (where draw() has them) its arms come slowly up out of the bottom of the
// view toward you, the hands open and growing as they come; then they go up round the sides of the view, the forearms
// along its edges, the hands at its top corners and the long fingers curling in over the top, round the back of your head.
// At reach 0 and wrap 0 it is the arm as draw() has it.
function demonHugArms(ctx, c, P, body, S0, E0, H0, wid, fing) {
  const h = c.hug, r = h.reach, w = h.wrap, g = Math.max(r, w);
  const M = ctx.getTransform(), dpr = ctx.canvas.width / R.W, W = R.W, H = R.H, cx = W / 2;
  const scr = p => { const q = M.transformPoint({ x: p[0], y: p[1] }); return [q.x / dpr, q.y / dpr - R.viewY]; };
  const k = Math.hypot(M.a, M.b) / dpr;   // the view's pixels to one of its metres, across
  const mix2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const unit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const turn = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const squeeze = (c.still ? 0 : Math.sin(c.t * 1.3) * 0.5 + 0.5) * w * 0.008 * W;   // holding on, it draws you in a little now and then
  // its own dark, as its light has it, and that light catching the inner edge of the arms
  const base = mixc([4, 3, 6], [104, 90, 126], c.soft || 0), rim = P.col(mixc(base, [150, 130, 140], 0.6));
  // a limb in the view: from a to b round the control point m, its width going from wa to wb, round at both ends
  const limb = (a, m, b, wa, wb, col, dx) => {
    const n = 12, L = [], Rt = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * m[0] + u * u * b[0] + (dx || 0), y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * m[1] + u * u * b[1];
      const tx = 2 * (1 - u) * (m[0] - a[0]) + 2 * u * (b[0] - m[0]), ty = 2 * (1 - u) * (m[1] - a[1]) + 2 * u * (b[1] - m[1]), tl = Math.hypot(tx, ty) || 1, hw = lerp(wa, wb, u) / 2;
      L.push([x - ty / tl * hw, y + tx / tl * hw]); Rt.push([x + ty / tl * hw, y - tx / tl * hw]);
    }
    ctx.fillStyle = col; ctx.beginPath(); L.concat(Rt.reverse()).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(a[0] + (dx || 0), a[1], wa / 2, 0, TAU); ctx.moveTo(b[0] + (dx || 0) + wb / 2, b[1]); ctx.arc(b[0] + (dx || 0), b[1], wb / 2, 0, TAU); ctx.fill();
  };
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, R.viewY * dpr);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // first the light along the edges of both arms and hands, then the arms and hands over it, so no edge shows across a wrist
  for (const pass of g > 0.01 ? [0, 1] : [1]) for (const s of [-1, 1]) {
    const i = s > 0 ? 1 : 0, edge = s > 0 ? W : 0, X = u => edge - s * (u - (1 - w) * 0.05 * W + squeeze);   // u: how far in from that edge
    // the shoulder where it is; the elbow below the bottom of the view and then out past its side; the wrist low beside its
    // chest, reaching, and then high in the corner, holding
    const S = scr(S0[i]);
    const E = mix2(mix2(scr(E0[i]), [cx + s * 0.66 * H, 1.1 * H], r), [X(-0.08 * W), 0.72 * H], w);
    const Wr = mix2(mix2(scr(H0[i]), [cx + s * 0.42 * H, 0.7 * H], r), [X(0.075 * W), 0.15 * H], w);
    const Cm = mix2(mix2(E, Wr, 0.5), [X(0.058 * W), 0.45 * H], w);
    if (pass) (h.wrists = h.wrists || [])[i] = [Wr[0] / W, Wr[1] / H];   // where its hands are in the view (for the tests)
    // nearer, it is bigger: an arm's own width at rest, a forearm's breadth reaching, and wider still against your face
    const wU = lerp(lerp(wid * k, 0.075 * H, r), 0.15 * H, w), wE = lerp(lerp(wid * k, 0.085 * H, r), 0.11 * W, w), wW = lerp(lerp(wid * k, 0.07 * H, r), 0.075 * W, w);
    const a0 = ctx.globalAlpha;
    if (pass === 0) {
      if (w > 0.01) { ctx.globalAlpha = a0 * 0.3 * w; limb(E, Cm, Wr, wE + 0.014 * W, wW + 0.014 * W, body); }   // soft at the edge: too near the eye to be sharp
      ctx.globalAlpha = a0 * g; limb(E, Cm, Wr, wE + 0.008 * H, wW + 0.008 * H, rim, -s * 0.004 * W * w);   // its light along the edge
    } else { limb(S, mix2(S, E, 0.5), E, wid * k, wU, body); limb(E, Cm, Wr, wE, wW, body); }
    // the hand: from the fingers hanging as draw() has them, to open with the palm toward you and the fingers spread up, to
    // turned in over the top of the view with the fingers curled down round your head
    const f0 = fing[i], rest = [Math.cos(f0.angle), -Math.sin(f0.angle)];
    const dir = unit(mix2(unit(mix2(rest, unit([s * 0.42, -1]), r)), unit([-s, -0.3]), w)), out = turn(dir, s * Math.PI / 2);   // along the hand; across it, to the little finger
    const pl = 0.07 * H * g * (1 + 0.2 * w), pw = 0.075 * H * g * (1 + 0.2 * w), top = [Wr[0] + dir[0] * pl, Wr[1] + dir[1] * pl];
    const at = (p, u, v) => [p[0] + dir[0] * u + out[0] * v, p[1] + dir[1] * u + out[1] * v];
    const fl = lerp(lerp(f0.len * k, 0.15 * H, r), 0.16 * H, w), fw = lerp(lerp(0.018 * k, 0.026 * H, r), 0.03 * H, w);
    const sp = lerp(lerp(f0.spread, 0.2, r), 0.12, w), bend = lerp(0.12 * r, 0.85, w);   // how far the fingers fan, and curl
    const parts = [];   // [from, to, width] for each bone of the fingers and the thumb
    for (let j = 0; j < 4; j++) {   // the index finger nearest the thumb, the little finger outermost
      const L = fl * [0.9, 1, 0.95, 0.74][j], o = mix2(Wr, at(top, 0, pw * lerp(-0.36, 0.38, j / 3)), g), d1 = turn(dir, s * (j - 1.2) * sp), d2 = turn(d1, -s * bend);
      const m = [o[0] + d1[0] * L * 0.55, o[1] + d1[1] * L * 0.55];
      parts.push([o, m, fw], [m, [m[0] + d2[0] * L * 0.45, m[1] + d2[1] * L * 0.45], fw * 0.78]);
    }
    if (g > 0.01) {   // the thumb, from low on the inside of the palm, out and up (tucked in as it holds you)
      const o = at(Wr, pl * 0.25, -pw * 0.42), d1 = turn(dir, -s * lerp(0.95, 0.4, w)), d2 = turn(d1, s * 0.35), L = fl * 0.6 * g;
      const m = [o[0] + d1[0] * L * 0.5, o[1] + d1[1] * L * 0.5];
      parts.push([o, m, fw * 1.1], [m, [m[0] + d2[0] * L * 0.5, m[1] + d2[1] * L * 0.5], fw * 0.85]);
    }
    const palm = [at(Wr, 0, -pw * 0.32), at(Wr, 0, pw * 0.3), at(top, 0, pw * 0.5), at(top, pl * 0.08, 0), at(top, 0, -pw * 0.46)];
    const col = pass ? body : rim, more = pass ? 0 : 0.008 * H;   // its light round the edge, then the hand
    ctx.strokeStyle = col; ctx.fillStyle = col;
    if (g > 0.01) { ctx.lineWidth = more * 2 + 1e-3; ctx.beginPath(); palm.forEach((p, n) => (n ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); if (more) ctx.stroke(); }
    for (const [p, q, ww] of parts) { ctx.lineWidth = ww + more; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    ctx.globalAlpha = a0;
  }
  ctx.restore();
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
