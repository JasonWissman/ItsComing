'use strict';
// The demon: every shape that came before, and the one under them: a tall thing in a black hooded robe that falls to the
// ground, its face lost in the dark of the hood but for two pale points, its eyes. c.anger (set by the night) is how much
// you are still holding and drives the pace; c.rage (the night eases it toward anger) is how it looks: anything at all in
// your hands and it is plainly enraged: its eyes burn red, a snarling mouth opens in the dark under them, it shakes, and it
// comes on in fits (demonFit): it lurches, stops dead, staggers aside, its head twitching. Empty-handed it is only tall,
// and it walks.
// For the ending the night also sets c.calm (it settles: no rage left in its body, a little smaller), c.soft (the dark
// lightens), c.dance and c.fade; c.mood, the face it makes while it holds you (see DEMON_MOODS), and c.unveil, how far that
// face has come up out of the dark of the hood (0: still only the two eyes); c.hug, its arms coming out to you and closing
// round you; c.tilt0 and c.settle (its head comes level from where it was), and c.still (reduced motion: no trembling, no
// tear running).
// The faces it goes through, in order: angry, neutral, angry, confused, sad, neutral, content, happy. c.mood 0 is the first
// and 7 the last, and between two whole numbers it is part way from one to the next. Each is a set of numbers, so any two
// blend smoothly. Measured from fy (see draw): the eyes sit at fy + 0.03, brows bi (inner end) and bo (outer end) above
// them, bq one brow raised and the other lowered by that much; er, eh the eye's half width and height, open how far it is
// open, lid its slant (outer corner down), lidLine an upper lid drawn over it, sock a dark socket, glow red light in it, pup
// a pupil (0: blank), gaze where the pupil looks, arc closed happy eyes; the mouth: corners my below fy and mc higher than
// that, its upper lip's middle mu above the corners and its lower lip's md, mr how round it is, mk how far it is twisted
// (one corner up, the other down), teeth, joy (a red mouth with a tongue), tears, blush; jaw a longer face, fw a wider one,
// tilt of the head and trem a tremble.
const DEMON_ANGRY = { skin: [156, 42, 36], fw: 0.004, jaw: 0.6, brow: 1, bi: 0.006, bo: 0.044, bw: 0.017, bq: 0, er: 0.026, eh: 0.011, open: 1, lid: -0.26, lidLine: 0, sock: 1, glow: 1, pup: 0, gaze: 0, arc: 0, my: -0.098, mw: 0.056, mc: -0.008, mu: 0.03, md: -0.052, mr: 0.75, mk: 0, teeth: 1, joy: 0, tears: 0, blush: 0, tilt: 0.04, trem: 0.8 };
const DEMON_NEUTRAL = { skin: [150, 142, 148], fw: 0, jaw: 0, brow: 0.85, bi: 0.036, bo: 0.036, bw: 0.011, bq: 0, er: 0.017, eh: 0.011, open: 0.85, lid: 0, lidLine: 0.7, sock: 0.12, glow: 0, pup: 0.0062, gaze: 0, arc: 0, my: -0.078, mw: 0.034, mc: 0, mu: 0.003, md: -0.003, mr: 0.15, mk: 0, teeth: 0, joy: 0, tears: 0, blush: 0, tilt: 0, trem: 0 };
const DEMON_MOODS = [
  // angry: red, the eyes burning slits in dark sockets under brows driven down, a snarl full of teeth, shaking
  DEMON_ANGRY,
  // neutral: grey, the brows level, the eyes open with dark pupils, the mouth a flat closed line
  DEMON_NEUTRAL,
  // angry again
  Object.assign({}, DEMON_ANGRY, { tilt: -0.03 }),
  // confused: one brow up and the other down, the eyes wide, the head on one side, a small mouth twisted to one side
  { skin: [164, 154, 164], fw: 0, jaw: 0.1, brow: 1, bi: 0.044, bo: 0.05, bw: 0.012, bq: 0.024, er: 0.018, eh: 0.015, open: 1, lid: 0, lidLine: 0.6, sock: 0.1, glow: 0, pup: 0.0058, gaze: 0.003, arc: 0, my: -0.082, mw: 0.024, mc: 0, mu: 0.007, md: -0.009, mr: 0.55, mk: 0.32, teeth: 0, joy: 0, tears: 0, blush: 0, tilt: -0.2, trem: 0 },
  // sad: the brows up in the middle, heavy lids, eyes cast down, tears running, the mouth turned down and trembling
  { skin: [168, 162, 182], fw: 0.004, jaw: 0, brow: 1, bi: 0.052, bo: 0.016, bw: 0.012, bq: 0, er: 0.018, eh: 0.012, open: 0.5, lid: 0.3, lidLine: 1, sock: 0.2, glow: 0, pup: 0.0062, gaze: -0.0045, arc: 0, my: -0.086, mw: 0.032, mc: -0.018, mu: 0.005, md: -0.008, mr: 0.3, mk: 0, teeth: 0, joy: 0, tears: 1, blush: 0.15, tilt: 0.15, trem: 0.35 },
  // neutral again, a little warmer, the tears gone
  Object.assign({}, DEMON_NEUTRAL, { skin: [190, 176, 172] }),
  // content: warmer, the brows soft, the eyes half closed, the corners of the mouth turned up in a small closed smile
  { skin: [224, 202, 186], fw: 0.012, jaw: 0, brow: 0.6, bi: 0.038, bo: 0.032, bw: 0.01, bq: 0, er: 0.018, eh: 0.012, open: 0.45, lid: 0.1, lidLine: 1, sock: 0, glow: 0, pup: 0.0066, gaze: -0.001, arc: 0, my: -0.07, mw: 0.04, mc: 0.012, mu: -0.006, md: -0.013, mr: 0.3, mk: 0, teeth: 0, joy: 0.1, tears: 0, blush: 0.4, tilt: 0.05, trem: 0 },
  // happy: eyes closed in two arches, round pink cheeks, a wide open smile
  { skin: [240, 214, 186], fw: 0.02, jaw: 0, brow: 0, bi: 0.04, bo: 0.036, bw: 0.01, bq: 0, er: 0.016, eh: 0.012, open: 0, lid: 0, lidLine: 0, sock: 0, glow: 0, pup: 0, gaze: 0, arc: 1, my: -0.045, mw: 0.05, mc: 0, mu: 0, md: -0.04, mr: 1, mk: 0, teeth: 0, joy: 1, tears: 0, blush: 1, tilt: 0, trem: 0 },
];
const DEMON_MOOD_NAMES = ['angry', 'neutral', 'angry', 'confused', 'sad', 'neutral', 'content', 'happy'];
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
  ctx.save(); if (Math.abs(F.mk) > 0.001) { ctx.translate(0, cy); ctx.rotate(F.mk); ctx.translate(0, -cy); }   // (twisted: one corner up, the other down)
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
  ctx.restore();
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
    if (F.brow > 0.02) P_line(ctx, s * 0.068, ey + F.bo + s * F.bq, s * 0.013, ey + F.bi + s * F.bq * 0.6, F.bw, P.cola([0, 0, 0], F.brow));   // (bq: the one raised, the other lowered)
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
// Enraged it comes on in fits, each beat (a third of a second) one of three: it stops dead, it steps, or it lurches (fast,
// pitching over to one side and dipping); each beat that it moves it may jerk aside to a new place; and its head, still a
// moment, snaps to a new angle, faster than its steps. All of it from c.t, so it is the same every time; it is scaled by how
// enraged it is (draw, speedMult, lateral). pace averages about 1, so in all it comes no faster than it walks.
function demonFit(c) {
  const h = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const t = c.t, B = 0.32, k = Math.floor(t / B), f = t - k * B, beat = h(k), b = beat < 0.34 ? 0 : beat < 0.66 ? 1 : 2;
  const snap = smoothstep(clamp(f / 0.06, 0, 1)), sideOf = j => (h(j + 0.31) < 0.34 ? 0 : h(j + 0.47) - 0.5) * 0.5;
  const bend = Math.sin(Math.PI * f / B);
  const H = 0.15, j = Math.floor(t / H), headOf = n => (h(n + 0.53) < 0.45 ? (h(n + 0.91) - 0.5) * 0.9 : 0);
  return {
    pace: [0.08, 1, 2.1][b],
    side: lerp(sideOf(k - 1), sideOf(k), snap),
    lean: b === 2 ? (h(k + 0.77) < 0.5 ? -1 : 1) * 0.13 * bend : 0,
    dip: b === 2 ? 0.08 * bend : 0,
    head: lerp(headOf(j - 1), headOf(j), smoothstep(clamp((t - j * H) / 0.035, 0, 1))),
  };
}
// how enraged it is, as it looks (rage, less any calm)
const demonRage = c => clamp(c.rage || 0, 0, 1) * (1 - (c.calm || 0));
// how high its eyes are, from its feet, as draw() puts them (the robe, the bob of its step, the hood all grow with rage; a
// lurch dips it)
function demonEyesY(c) {
  const calm = c.calm || 0, a = demonRage(c), dip = a > 0.001 ? demonFit(c).dip * a : 0;
  const top = 1.3 + a * 0.35 + 0.85 + Math.abs(Math.sin(c.gait)) * (0.04 + a * 0.06) - dip;
  return (top + 0.285 + a * 0.1 + 0.03) * (1 - 0.2 * calm);
}
// how its head is tilted when it is making no face for the ending: now and then it cocks its head to the other side, more
// often and further enraged, and enraged it twitches
function demonTilt(c) {
  const a = demonRage(c), still = SAVE.data.settings.reducedMotion;
  return headTiltJerk(c.t, 2.7 - a * 1.5, 0.16 + a * 0.3) + (a > 0.001 && !still ? demonFit(c).head * a : 0);
}
CREATURES.demon = {
  name: 'the demon', h: 2.6, w: 1.6, faceY: 2.35, stepRate: 0.55, catchDist: 1.2, sound: 'walker',
  // the lunge brings faceY to eye level; enraged, it is taller and its face sits higher than that, so the pose lifts it the
  // rest of the way and the last thing you see is its face, not its chest
  death: {
    delay: 0.25, dur: 0.5, sting: 'sting',
    pose(c, k) { c.yOff -= (demonEyesY(c) - CREATURES.demon.faceY) * smoothstep(k); },
  },
  voice: { kind: 'exhale', every: [4, 8] },
  eyesY: demonEyesY, tilt: demonTilt, fit: demonFit, moods: DEMON_MOODS.length, moodNames: DEMON_MOOD_NAMES,   // for the ending and the tests
  init(c) { c.anger = 0; c.rage = 0; c.calm = 0; c.soft = 0; c.dance = 0; c.fade = 1; },
  // enraged, it comes in fits: stopping dead, stepping, lurching
  speedMult(c, dt, seen) { const a = demonRage(c); return (1 + 0.45 * (c.anger || 0)) * (a > 0.001 ? lerp(1, demonFit(c).pace, a) : 1); },
  // and jerks aside (less as it comes up to you)
  lateral(c) { const a = demonRage(c); return a > 0.001 && !c.frozen ? demonFit(c).side * a * clamp((c.dist - 1.5) / 2.5, 0, 1) : 0; },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 14, 0, 1), lunge = c.lunge || 0;
    const calm = c.calm || 0, soft = c.soft || 0, dance = c.dance || 0;
    const a = demonRage(c), still = SAVE.data.settings.reducedMotion;
    const fit = a > 0.001 ? demonFit(c) : null;
    ctx.save();
    if (c.fade < 1) ctx.globalAlpha *= Math.max(0, c.fade);
    // enraged it shakes, pitches over as it lurches and dips; happy it shrinks to fit a bedroom; dancing it hops and swings
    const hop = dance * Math.abs(Math.sin(t * 5.2)) * 0.14, swing = dance * Math.sin(t * 5.2) * 0.1, shake = a * Math.sin(t * 47) * 0.014;
    const lean = fit && !still ? fit.lean * a : 0, dip = fit ? fit.dip * a : 0;
    ctx.translate(shake, hop - dip); ctx.rotate(swing + lean); ctx.scale(1 - 0.2 * calm, 1 - 0.2 * calm);
    // all of it black: the robe, a shade lighter at the edge of the hood where it catches what light there is, and blacker in
    // its folds; the dark in the hood blackest of all. As the light comes, it lightens with the dark
    // (taking only a little of the light it stands in, so its own red light does not make it red)
    const take = lerp(0.3, 1, soft);
    const robe = P.col(mixc([12, 10, 15], [34, 31, 40], soft), take), fold = P.col(mixc([3, 2, 5], [14, 12, 18], soft), take), rim = P.col(mixc([26, 23, 32], [62, 58, 72], soft), take * 1.6);
    const black = P.col([0, 0, 0], 0.1);
    const bob = Math.abs(Math.sin(g)) * (0.04 + a * 0.06), sway = Math.sin(g) * (0.03 + a * 0.05);
    const legL = 1.3 + a * 0.35, armL = 0.9 + a * 0.6, top = legL + 0.85 + bob;
    // the robe, from the shoulders to the ground, flaring; its hem swings with each step and the folds with it
    const step = Math.sin(g) * (0.05 + a * 0.04), hemW = 0.36 + a * 0.1, sh = sway * 0.6;
    ctx.fillStyle = robe; ctx.beginPath();
    ctx.moveTo(-0.24 + sh, top);
    ctx.quadraticCurveTo(-0.27 + sway * 0.4, legL * 0.55, -hemW + step, 0.03);
    for (let i = 1; i <= 8; i++) { const u = i / 8; ctx.lineTo(lerp(-hemW, hemW, u) + step * (1 - Math.abs(u - 0.5)), 0.012 + 0.022 * Math.abs(Math.sin(i * 1.9 + g))); }
    ctx.quadraticCurveTo(0.27 + sway * 0.4, legL * 0.55, 0.24 + sh, top);
    ctx.closePath(); ctx.fill();
    for (const [x0, x1, w] of [[-0.1, -0.2, 0.026], [0.02, 0.05, 0.03], [0.12, 0.24, 0.022]]) {
      ctx.strokeStyle = fold; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0 * 0.6 + sh, top - 0.18); ctx.quadraticCurveTo(x0 + sway * 0.4, legL * 0.6, x1 + step * 0.8, 0.06); ctx.stroke();
    }
    // its shoulders under the fall of the hood
    P_ell(ctx, sh, top - 0.03, 0.26, 0.085, robe);
    // the arms in their long sleeves; enraged they are longer, and the hands, long-fingered and black, hang lower
    const raise = smoothstep(Math.max(near * (0.5 + a * 0.5), lunge));
    const sleeve = 0.1 - a * 0.012;
    const hug = c.hug ? { S: [], E: [], H: [], f: [] } : null;   // holding you: the arms are drawn last, over the head (see demonHugArms)
    for (const s of [-1, 1]) {
      const sx = s * 0.22 + sh, sy = top - 0.05;
      let ex = s * lerp(0.28, 0.55 + a * 0.3, raise), ey = lerp(top - 0.5, top - 0.3, raise);
      let hx = s * lerp(0.3, 0.42 + a * 0.35, raise), hy = lerp(top - armL, top + 0.05, raise);
      if (dance) { const wave = Math.sin(t * 5.2 + s) * 0.12; ex = lerp(ex, s * 0.42, dance); ey = lerp(ey, top + 0.2 + wave, dance); hx = lerp(hx, s * (0.36 + wave), dance); hy = lerp(hy, top + 0.62, dance); } // hands up, waving
      const fa = dance ? Math.PI / 2 : lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), fs = lerp(0.16, 0.34 + a * 0.1, raise), fl = 0.18 + a * 0.16;
      if (hug) { const i = s > 0 ? 1 : 0; hug.S[i] = [sx, sy, 0]; hug.E[i] = [ex, ey, 0]; hug.H[i] = [hx, hy, 0]; hug.f[i] = { angle: fa, spread: fs, len: fl }; continue; }
      const cuff = [lerp(ex, hx, 0.72), lerp(ey, hy, 0.72)];
      P_line(ctx, cuff[0], cuff[1], hx, hy, 0.04, robe);   // the wrist, out of the sleeve
      fingers(ctx, hx, hy, fa, fs, fl, 0.018, robe);
      P_limb(ctx, [[sx, sy], [ex, ey], cuff], sleeve, robe);
      P_ell(ctx, cuff[0], cuff[1], sleeve * 0.62, sleeve * 0.5, fold, Math.atan2(hy - ey, hx - ex));   // the dark in the sleeve's mouth
    }
    // the head, in its hood. Making a face for the ending (c.mood), its head comes level from where it was and leans as the
    // face does
    const F = c.mood !== undefined && c.mood !== null ? demonMood(c.mood) : null;
    const tilt = F ? lerp(c.tilt0 || 0, F.tilt + (c.still ? 0 : F.trem * Math.sin(t * 31) * 0.018), c.settle === undefined ? 1 : c.settle) + dance * Math.sin(t * 2.6) * 0.18
      : demonTilt(c) * (1 - lunge) * (1 - calm) + dance * Math.sin(t * 2.6) * 0.18;
    ctx.save(); ctx.translate(sh, top); ctx.rotate(tilt);
    const hc = 0.3 + a * 0.1, hr = 0.168 + a * 0.02, hh = 0.235 + a * 0.05;
    ctx.fillStyle = robe; ctx.beginPath();
    ctx.moveTo(-0.25, -0.05);
    ctx.quadraticCurveTo(-hr * 1.2, hc - 0.08, -hr, hc + 0.02);
    ctx.bezierCurveTo(-hr, hc + hh * 0.85, -0.05, hc + hh * 1.05, 0.012, hc + hh + 0.04);   // the hood's peak, falling a little to one side
    ctx.bezierCurveTo(0.05, hc + hh * 1.0, hr, hc + hh * 0.85, hr, hc + 0.02);
    ctx.quadraticCurveTo(hr * 1.2, hc - 0.08, 0.25, -0.05);
    ctx.closePath(); ctx.fill();
    // the opening of the hood, and the dark in it
    const fy = 0.285 + a * 0.1, oy = fy - 0.015 - a * 0.015, orx = 0.098 + a * 0.012, ory = 0.152 + a * 0.04;
    P_ell(ctx, 0, oy, orx + 0.014, ory + 0.014, rim);
    P_ell(ctx, 0, oy, orx, ory, black);
    // the face it makes for the ending comes up out of the dark of the hood (c.unveil), and the hood's shadow lies over its brow
    const show = F ? (c.unveil === undefined ? 1 : clamp(c.unveil, 0, 1)) : 0;
    if (F && show > 0.004) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, oy, orx, ory, 0, 0, TAU); ctx.clip();
      ctx.globalAlpha *= show;
      demonMoodFace(ctx, c, P, fy, F);
      const shade = ctx.createLinearGradient(0, oy + ory, 0, fy + 0.02);
      shade.addColorStop(0, P.cola([0, 0, 0], 0.85)); shade.addColorStop(0.45, P.cola([0, 0, 0], 0.3)); shade.addColorStop(1, P.cola([0, 0, 0], 0));
      ctx.fillStyle = shade; ctx.fillRect(-orx, fy + 0.02, orx * 2, ory * 2);
      ctx.restore();
    }
    if (show < 0.996) {
      ctx.save(); ctx.globalAlpha *= 1 - show;
      const er = mixc([228, 224, 214], [255, 44 + (1 - a) * 40, 24], smoothstep(clamp(a * 1.6, 0, 1)));
      // enraged: a mouth in the dark, wide and turned down in a snarl, lit from inside a dull red, teeth along its edges
      if (a > 0.02) {
        ctx.save(); ctx.globalAlpha *= smoothstep(clamp(a * 1.4, 0, 1));
        // (its corners pulled down below the arch of its upper lip; the lower lip a little below the corners, more as it lunges)
        const mw = 0.05 + a * 0.012 + lunge * 0.006, cy = fy - 0.112 - a * 0.012, top = cy + 0.036 + a * 0.006, bot = cy - 0.012 - a * 0.008 - lunge * 0.03;
        const mouth = () => { ctx.beginPath(); ctx.moveTo(-mw, cy); ctx.quadraticCurveTo(0, 2 * top - cy, mw, cy); ctx.quadraticCurveTo(0, 2 * bot - cy, -mw, cy); ctx.closePath(); };
        mouth(); ctx.fillStyle = rgba([150, 18, 12], 0.95); ctx.fill();
        ctx.save(); mouth(); ctx.clip();
        P_ell(ctx, 0, (top + bot) / 2 - 0.004, mw * 0.6, (top - bot) * 0.32, rgba([40, 0, 0], 0.9));   // its throat
        const tooth = P.col([214, 204, 190]), edge = (y, x) => cy + (y - cy) * (1 - (x / mw) * (x / mw));
        for (let i = -3; i <= 3; i++) {
          const x = i * mw * 0.27, up = edge(top, x), dn = edge(bot, x), long = (top - bot) * (Math.abs(i) === 2 ? 0.55 : 0.36);   // (a fang each side)
          ctx.fillStyle = tooth; ctx.beginPath(); ctx.moveTo(x - 0.007, up + 0.01); ctx.lineTo(x + 0.007, up + 0.01); ctx.lineTo(x, up - long); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x - 0.006, dn - 0.01); ctx.lineTo(x + 0.006, dn - 0.01); ctx.lineTo(x, dn + (top - bot) * 0.3); ctx.closePath(); ctx.fill();
        }
        ctx.restore(); ctx.restore();
      }
      // the eyes: two small pale points, or, enraged, two red slits slanting down to the middle, burning. Far off in the dark
      // they are all there is of it: two points that stay a pixel or two across, in a faint haze
      const far = clamp((c.dist - 5) / 12, 0, 1);
      if (far > 0) P_ell(ctx, 0, fy + 0.03, c.dist * 0.009, c.dist * 0.006, rgba(er, (0.06 + 0.1 * a) * far));
      for (const s of [-1, 1]) {
        const ex = s * 0.036, ey = fy + 0.03;
        if (a > 0.02) P_ell(ctx, ex, ey, 0.036 + a * 0.01, 0.018, rgba(er, 0.28 * a), s * 0.3 * a);
        const rx = lerp(0.011, 0.024, a), ry = lerp(0.011, 0.008, a);
        // (their own light: they show through the dark, the pale ones a little dimmed by it far off)
        P_ell(ctx, ex, ey, Math.max(rx, c.dist * 0.0013 * far), Math.max(ry, c.dist * 0.0011 * far), rgba(mixc(er, P.fogColor || [0, 0, 0], (1 - a) * 0.45 * (P.fog || 0))), s * 0.3 * a);
      }
      ctx.restore();
    }
    ctx.restore();
    if (hug) demonHugArms(ctx, c, P, robe, hug.S, hug.E, hug.H, sleeve, hug.f);
    ctx.restore();
  }
};
