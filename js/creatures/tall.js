'use strict';
// The tall one: the walker's shape, a head taller than anyone, stooping under the door frame or standing in front of the
// hanging clothes, moving in extreme slow motion. Its own clock runs at timeScale so every jerk is slowed. It is all but
// black, even in the lamp's light; only its eyes show, two round pale lights.
// Close to the bed it bows over it, so its face stays in sight. It is always drawn whole: what is between you and it (the
// bed, the furniture) is drawn over it. Only the wall either side of the opening it is behind is its own business:
// c.showX: [x0, x1] across it, outside which that wall hides it; c.showTop: the height above which the wall over the
//   opening hides it.
// c.headroom (metres above its feet, or undefined): the height it must keep under, the lintel of the opening it is coming
//   through: it stoops as far as it must (stoopFor), its shoulders and head bent down and forward, its knees giving.
// c.feet (pace, below): where its feet are while it walks, so that it steps and does not glide: each { x: across from where
//   it is, dz: toward you, lift: off the floor }, in metres. Without them its legs follow c.gait.
// The night drives the rest of what it does (js/levels/night12.js):
// c.peer (0..1): it stands behind the wall at the side of the opening and only its head leans out round the edge, toward
//   c.peerSide (+1: the right of the view), its fingers curled round the frame;
// c.flinch (0..1): an arm thrown up across its face, its head turned from the light;
// c.duck (0..1): it is down on its haunches, folded up like a spider, its knees up beside its shoulders, low enough to put
//   its eyes at c.eyeTo (world height above its feet), peering up, its eyes wide; lower still it is on all fours;
// c.reach (0..1): its arms up to the edge of the bed, its hands at c.gripY (world height; the night draws the hands on the
//   covers over the edge); c.faceAway (over 0.5): its face turned down, only the dark of its head showing.
// Its lunge (death.pose): its hands shoot out at you and take hold; then, all at once, its face is right in front of yours,
// twitching; then its whole head swells out over everything until the black of it is all there is. While its hands are
// coming at you, c.armsApart (set by the night) leaves its arms out of its own drawing, and c.part === 'arms' draws only
// them: the night draws them in front of the bed, which is in front of the rest of it.
// Light slows it (c.inLight), in case it is ever in the light and not already down out of it.
CREATURES.tall = {
  name: 'the tall one', h: 2.3, w: 1.1, faceY: 2.0, stepRate: 1.3, catchDist: 1.0, sound: 'tall', timeScale: 0.12,
  voice: { kind: 'slow', every: [6, 12] },
  SCALE: 0.77,   // drawn at three metres, stood at two and a bit
  STOOP: { top: 0.3, sink: 0.24, hip: 0.14 },   // all the way stooped: how far its shoulders come down, its head on down past them, its hips
  BODY: [8, 7, 10],
  DARK: 0.05,   // how much of the light it takes: it stays all but black in the lamp's light
  // The lunge, in seconds: its hands are at you by grab; at cut its face is right in front of yours (near metres off), and
  // its head twitches until twitch; then it swells until dur
  LUNGE: { grab: 0.2, cut: 0.32, twitch: 0.62, dur: 1.4, near: 0.17 },
  death: {
    delay: 0.35, dur: 1.4, sting: 'stingHum',
    pose(c, k) { CREATURES.tall.lungePose(c, k); },
  },
  // where it is through its lunge (k: 0..1 over LUNGE.dur, after the death's delay), over what the game would do with it
  lungePose(c, k) {
    const U = this.LUNGE, s = k * U.dur, cam = typeof G !== 'undefined' && G.cam, eyeH = (typeof G !== 'undefined' && G.L && G.L.eyeH) || 1.15;
    if (!c.lunge0) {   // where it was: the view turns to it there
      c.lunge0 = { d: c.lungeFrom === undefined ? c.dist : c.lungeFrom, lat: c.runLat !== undefined ? c.runLat : (c.lat || 0) };
      if (cam && c.pos) { const p = c.pos(), yaw = Math.atan2(p.x, p.z); cam.tYaw = cam.yaw + wrapPi(yaw - cam.yaw); cam.tPitch = 0; }
    }
    const o = c.lunge0;
    c.grabK = clamp(s / U.grab, 0, 1);
    if (s < U.cut) { c.dist = o.d; c.lat = o.lat; c.yOff = 0; c.close = 0; }
    else {
      // all at once it is right in front of you, on the line from your eye to where it was, its eyes level with yours
      const r = Math.max(0.3, Math.hypot(o.d, o.lat)), q = U.near / r;
      c.dist = o.d * q; c.lat = o.lat * q; c.yOff = eyeH - this.faceY - (c.pos ? c.pos().y : 0);
      if (!c.close && cam) { cam.yaw = cam.tYaw; cam.pitch = cam.tPitch = 0; }
      c.close = 1;
    }
    c.twitchT = s - U.cut;
    c.gulp = smoothstep((s - U.twitch) / (U.dur - U.twitch));
  },
  init(c) { c.inLight = false; },
  speedMult(c, dt, seen) { return c.inLight ? 0.25 : 1; },
  // how far it stoops (0..1) to keep the top of its head under c.headroom: the head (0.54 up from its neck, at its size) on
  // its neck at top - sink, allowing for its breathing, which stretches it up to 1.4% taller
  stoopFor(c, top0, sink0, scale) {
    if (c.headroom === undefined) return 0;
    const S = this.STOOP, k = this.SCALE * 1.015, peak = (top0 - sink0 + 0.54 * scale) * k;
    return clamp((peak - c.headroom) / ((S.top + S.sink) * k), 0, 1);
  },
  // Its steps. Called each frame with where it is going (toD along its way, toLat across it), instead of moving it there:
  // it gets there a step at a time, in its slow motion. A foot comes up, slowly, hangs, then swings over and comes down
  // with a jerk, and its weight goes over onto it; a moment, and then the other. Sideways, the foot on that side goes
  // first and the other closes up to it. If where it is going runs on ahead it steps longer and quicker to keep up, and is
  // simply put there (its feet together) if that is far off (first, or put somewhere else). Returns c.walk, with where it
  // is now (d, lat) and its steps so far (n); sets c.feet.
  STEP: { len: 0.3, dur: 1.5, rest: 0.3, lift: 0.14, half: 0.14 },
  pace(c, dt, toD, toLat) {
    const S = this.STEP;
    let w = c.walk;
    if (!w || Math.hypot(toD - w.d, toLat - w.lat) > 1.2) {
      w = c.walk = { d: toD, lat: toLat, feet: [-1, 1].map(s => ({ d: toD, lat: toLat + s * S.half, lift: 0 })), step: null, wait: 0, n: 0, last: -1 };
    }
    const ed = toD - w.d, el = toLat - w.lat, e = Math.hypot(ed, el), lag = Math.max(0, e - S.len) / S.len;
    if (!w.step) {
      w.wait -= dt;
      if (e > 0.04 && w.wait <= 0) {
        const len = S.len * (1 + Math.min(lag, 2) * 0.5), k = Math.min(1, len / e), bd = w.d + ed * k, bl = w.lat + el * k;
        const lead = Math.abs(el) > 0.03 ? (el > 0 ? 1 : 0) : 0, i = w.last < 0 ? lead : 1 - w.last;
        const f = w.feet[i];
        w.step = { i, u: 0, f0: { d: f.d, lat: f.lat }, f1: { d: bd, lat: bl + (i ? 1 : -1) * S.half }, b0: { d: w.d, lat: w.lat }, b1: { d: bd, lat: bl } };
      }
    }
    if (w.step) {
      const st = w.step, f = w.feet[st.i];
      st.u = Math.min(1, st.u + dt * (1 + lag * 2) / S.dur);
      const u = st.u;
      // up (and a hitch as it hangs there), over, and down; its weight over onto it as it comes down
      const up = smoothstep(u / 0.32) * (1 - smoothstep((u - 0.62) / 0.16)) + (u > 0.3 && u < 0.6 ? Math.sin((u - 0.3) * 60) * 0.03 : 0);
      const over = smoothstep((u - 0.36) / 0.3), weight = smoothstep((u - 0.5) / 0.28);
      f.d = lerp(st.f0.d, st.f1.d, over); f.lat = lerp(st.f0.lat, st.f1.lat, over); f.lift = Math.max(0, up) * S.lift;
      w.d = lerp(st.b0.d, st.b1.d, weight); w.lat = lerp(st.b0.lat, st.b1.lat, weight);
      if (u >= 1) { f.lift = 0; w.step = null; w.last = st.i; w.n++; w.wait = S.rest / (1 + lag * 2); }
    }
    c.feet = w.feet.map(f => ({ x: f.lat - w.lat, dz: w.d - f.d, lift: f.lift }));
    return w;
  },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 3.2, 0, 1), lunge = c.lunge || 0, K = this.SCALE, S = this.STOOP, U = this.LUNGE;
    // in its lunge it lets go of whatever it was doing at once, and stands up straight
    const free = 1 - clamp(lunge * U.dur / 0.15, 0, 1), grabK = lunge > 0 ? (c.grabK || 0) : 0;
    const peer = (c.peer || 0) * free, ps = c.peerSide || 1, flinch = (c.flinch || 0) * free, duck = (c.duck || 0) * free, reach = (c.reach || 0) * free;
    const body = P.col(this.BODY, this.DARK), part = c.part;
    // seen from where: how far off it is (its drawing is in the plane it stands in) and how high your eye is over its feet
    const R0 = Math.max(0.2, Math.hypot(c.dist, c.lat || 0)), eyeH = (typeof G !== 'undefined' && G.L && G.L.eyeH) || 1.15, E = eyeH - (c.yOff || 0);
    // it bows over the foot of the bed as it comes: seen from in front, its shoulders hunch up and its head comes forward
    // and down between them (it straightens as it lunges)
    const lean = smoothstep((2.5 - c.dist) / 0.7) * free * (1 - peer) * (1 - duck);
    // walking on its own feet (c.feet), it rises a little over the foot it stands on and its hips go over it
    const ft = c.feet, liftAny = ft ? Math.max(ft[0].lift, ft[1].lift) : 0;
    const bob = ft ? liftAny * 0.12 : Math.abs(Math.sin(g)) * 0.03;
    const sway = ft ? clamp(((ft[0].lift > ft[1].lift ? ft[1].x : ft[0].x) * (liftAny > 0.01 ? 0.35 : 0) + (ft[0].x + ft[1].x) * 0.5) / K, -0.12, 0.12) : Math.sin(g) * 0.03;
    const hs = 1 + lean * 0.08;
    // under a lintel it stoops
    const top0 = 2.4 + bob - (0.18 + lean * 0.2), sink0 = lean * 0.36 + peer * 0.06;
    const st = this.stoopFor(c, top0, sink0, hs) * free * (1 - duck);
    ctx.save();
    // what is hidden of it: beyond the sides of the opening it is behind and above it, and nothing of it below the floor
    // (down low)
    {
      const y0 = (duck > 0 ? 0 : -1) - (c.yOff || 0) - (part === 'arms' ? 9 : 0);
      const sx0 = c.showX ? c.showX[0] : -9, sx1 = c.showX ? c.showX[1] : 9, yT = c.showTop === undefined ? 99 : c.showTop;
      ctx.beginPath(); ctx.rect(sx0, y0, Math.max(0, sx1 - sx0), Math.max(0, yT - y0)); ctx.clip();
    }
    ctx.scale(K, K);
    // standing (stooped as far as it must be), and down on its haunches with its eyes at c.eyeTo: the one blended into
    // the other as it goes down
    const top = top0 - st * S.top, sink = sink0 + st * S.sink, hipS = 1.45 + bob - st * S.hip;
    const Ey = (c.eyeTo === undefined ? 0.6 : c.eyeTo) / K;   // its eyes, down there (drawn units)
    const hyC = Ey - 0.36 * hs, topC = hyC + 0.1, hipC = Math.max(0.04, topC - 0.5);
    const kneeC = clamp(topC + 0.12, 0.3, 1.15);
    const tp = lerp(top, topC, duck), hip = lerp(hipS, hipC, duck), hunch = lean * 0.08 + st * 0.05 + duck * 0.06, sw = 0.26 + lean * 0.04 + duck * 0.04;
    const hx = sway * 0.6 + peer * ps * 0.44, hy = lerp(top - sink, hyC, duck);
    c.headTop = (hy + 0.54 * hs) * K;   // (the top of its head, as drawn: metres above its feet)
    if (part !== 'arms') {
      // legs: hip, knee, foot (down there the knees are up and out beside its shoulders). On its own feet, each foot is
      // where it is on the floor (nearer you, lower in the view), lifted as it steps
      for (const s of [-1, 1]) {
        const f = ft && duck < 0.01 ? ft[s > 0 ? 1 : 0] : null;
        const ph = g + (s > 0 ? Math.PI : 0), lift = f ? f.lift / K : Math.max(0, Math.sin(ph)) * 0.22 * (1 - duck * 0.6);
        const fx = f ? f.x / K : lerp(s * 0.18 + sway * 0.3, s * 0.32, duck), fy = lift + 0.03 - (f ? E * f.dz / Math.max(0.2, R0 - f.dz) / K : 0);
        const hpx = lerp(s * 0.1 + sway, s * 0.12, duck), kx = f ? lerp(hpx, fx, 0.5) + s * (0.04 + st * 0.08) + lift * s * 0.3 : lerp(s * (0.14 + st * 0.08) + sway * 0.6, s * 0.44, duck);
        const ky = f ? lerp(lerp(0.75, 0.68, st), (hip + fy) * 0.5, 0.25) + lift * 0.75 : lerp(lerp(0.75, 0.68, st) + lift * 0.7, kneeC + lift * 0.3, duck);
        P_limb(ctx, [[hpx, hip + 0.05], [kx, ky], [fx, fy]], 0.085, body);
        P_line(ctx, fx - 0.03 * s, fy, fx + s * 0.11, fy - (f ? lift * 0.3 : 0), 0.08, body);
      }
      P_poly(ctx, [[-0.17 + sway, hip], [0.17 + sway, hip], [sw + sway * 0.6, tp + hunch], [sway * 0.6, tp], [-sw + sway * 0.6, tp + hunch]], body);
      if (st > 0.02 || duck > 0.02) P_ell(ctx, sway * 0.6, tp + hunch * 0.5, sw, 0.03 + 0.1 * Math.max(st, duck), body);   // its back rounded up behind its head
    }
    // arms: down to the knees, rising very slowly as it comes; down there, its hands flat on the floor in front of it
    const raise = smoothstep(near * 0.8) * (1 - duck);
    const grip = (c.gripY === undefined ? 0.7 : c.gripY) / K;   // the edge of the bed, where its hands take hold
    let late = null;
    // (right in front of you its hands are on you, out of sight either side)
    const showArms = part === 'arms' || !(c.armsApart && grabK > 0) && !c.close;
    for (const s of [-1, 1]) {
      const sx = s * (sw - 0.01) + sway * 0.6, sy = tp - 0.08 + hunch;
      let ex = s * lerp(0.28, 0.62, raise), ey = lerp(1.6, 1.9, raise) - lean * 0.1 - st * 0.25;
      let px = s * lerp(0.3, 0.5, raise), py = lerp(0.85, 2.35, raise) - lean * 0.1 * raise - st * 0.2;
      let ang = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), spread = lerp(0.16, 0.32, raise), len = 0.24 + raise * 0.06;
      const mix = (k, e2, f2, p2, q2, a2, sp2, l2) => { ex = lerp(ex, e2, k); ey = lerp(ey, f2, k); px = lerp(px, p2, k); py = lerp(py, q2, k); ang = lerp(ang, a2, k); spread = lerp(spread, sp2, k); len = lerp(len, l2, k); };
      if (duck > 0) mix(duck, s * 0.52, Math.max(0.3, topC * 0.75), s * 0.36, 0.05, -Math.PI / 2 + s * 0.5, 0.2, 0.2);
      // peering: the hand on the opening's side is up on the frame beside its face, its fingers curled round the edge
      if (peer > 0 && s === ps) mix(peer, s * 0.36, hy - 0.3, s * 0.5, hy - 0.06, s > 0 ? -0.15 : Math.PI + 0.15, 0.2, 0.2);
      // the light: the arm on that side up across its face, the back of the hand to it
      if (flinch > 0 && s === (c.flinchSide || 1)) mix(flinch, s * 0.46, tp + 0.05, -s * 0.06, hy + 0.36, s > 0 ? Math.PI * 0.95 : Math.PI * 0.05, 0.22, 0.26);
      // up over the edge of the bed: the hands on it, wide apart, the fingers hooked over onto the covers
      if (reach > 0) mix(reach, s * 0.66, grip - 0.42, s * 0.4, grip, -Math.PI / 2 + s * 0.2, 0.13, 0.17);
      const arm = () => {
        if (grabK > 0) { this.grabArm(ctx, s, sx, sy, px, py, grabK, R0, E, body); return; }
        P_limb(ctx, [[sx, sy], [ex, ey], [px, py]], 0.065, body);
        fingers(ctx, px, py, ang, spread, len, 0.02, body);
        if (reach > 0.3) P_ell(ctx, px, py + 0.01, 0.06, 0.045, body);   // the back of the hand, knuckles up
      };
      if (!showArms) continue;
      // the arm thrown up across its face from the light goes in front of the head: drawn after it
      if (flinch > 0.02 && s === (c.flinchSide || 1)) late = arm; else arm();
    }
    if (part === 'arms') { ctx.restore(); return; }
    // the head, bent under the frame and turned to you; leaning out round an edge it tips over that way; flinching it turns
    // from the light; down there it holds still, peering up
    const still = free * (1 - peer) * (1 - duck);
    let tilt = headTiltJerk(t, 2.7, 0.3) * still * (1 - grabK) + (0.35 * 0.18 + 0.1 * lean) * (1 - peer) * (1 - duck) * free - peer * ps * 0.5 + flinch * (c.flinchSide || 1) * 0.35;
    if (peer > 0) P_line(ctx, sway * 0.6, tp - 0.04, hx, hy + 0.06, 0.09, body);   // the neck, stretched out round the edge
    ctx.save(); ctx.translate(hx, hy);
    // right in front of you its head twitches, for a moment, hard and fast
    const tw = c.close && c.twitchT !== undefined ? c.twitchT : -1;
    if (tw >= 0 && tw < U.twitch - U.cut) {
      const j = Math.sin(tw * 93) * Math.sin(tw * 151 + 1.3), j2 = Math.sin(tw * 127 + 0.4) * Math.sin(tw * 71);
      tilt += j * 0.22; ctx.translate(j2 * 0.04, j * 0.025);
    }
    ctx.rotate(tilt); ctx.scale(hs, hs);
    // and then it swallows you: its whole head keeps on coming, swelling out over everything from just under its eyes,
    // until the black of it is all there is
    const gulp = lunge > 0 ? (c.gulp || 0) : 0;
    if (gulp > 0) { const mc = 0.3, gg = 1 + gulp * gulp * 90; ctx.translate(0, mc); ctx.scale(gg, gg); ctx.translate(0, -mc); }
    P_line(ctx, 0, 0, 0, 0.14, 0.08, body);
    P_ell(ctx, 0, 0.34, 0.13, 0.2, body);
    if ((c.faceAway || 0) > 0.5 && lunge <= 0) { ctx.restore(); if (late) late(); ctx.restore(); return; }   // its face down: the dark of its head
    // its face is nothing but two round pale eyes in the dark of its head, a soft glow round each, the same in any light
    // (peering up, they widen; right in front of you they are wide)
    const er = 0.017 * (1 + duck * 0.2 + (c.close ? 0.3 : grabK * 0.15));
    for (const s of [-1, 1]) {
      const x = s * 0.046, y = 0.37, gr = er * 3.2, gl = ctx.createRadialGradient(x, y, 0, x, y, gr);
      gl.addColorStop(0, rgba([235, 228, 210], 0.3)); gl.addColorStop(1, rgba([235, 228, 210], 0));
      ctx.fillStyle = gl; ctx.fillRect(x - gr, y - gr, gr * 2, gr * 2);
      P_ell(ctx, x, y, er, er, P.raw([235, 228, 210]));
    }
    ctx.restore();
    if (late) late();
    ctx.restore();
  },
  // one arm shooting out at you, its hand open, and taking hold (k: 0..1): from its shoulder (sx, sy) and where its hand
  // was (px, py), drawn units, to a hand's breadth from your face, low at that side. The hand is drawn where it is seen in
  // the plane it stands in (r metres off, your eye E over its feet): bigger and further out the nearer it comes
  grabArm(ctx, s, sx, sy, px, py, k, r, E, col) {
    const K = this.SCALE, a = 1 - Math.pow(1 - k, 3);
    // the hand in the eye's frame (across, up from the eye, off from it), metres
    const hz = lerp(r - 0.25, 0.26, a), hxw = lerp(px * K, s * 0.19, a), hyw = lerp(py * K - E, -0.13, a);
    const sc = r / hz, X = hxw * sc / K, Y = (E + hyw * sc) / K;
    // the elbow, out to the side, half way
    const mz = (r + hz) / 2, msc = r / mz, MX = (lerp(sx * K, hxw, 0.5) + s * 0.08) * msc / K, MY = (E + lerp(sy * K - E, hyw, 0.5) * msc) / K;
    const limb = (x0, y0, w0, x1, y1, w1) => {
      const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      P_poly(ctx, [[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], col);
      P_ell(ctx, x1, y1, w1, w1, col);
    };
    limb(sx, sy, 0.033, MX, MY, 0.033 * msc); limb(MX, MY, 0.033 * msc, X, Y, 0.03 * sc);
    // the hand: its palm toward you, the long fingers spread wide as it comes, then closing on you
    const close = smoothstep((k - 0.75) / 0.25), spread = lerp(0.36, 0.2, close), len = lerp(0.3, 0.17, close);
    ctx.save(); ctx.translate(X, Y); ctx.scale(sc, sc);
    P_ell(ctx, 0, 0.01, 0.052, 0.065, col);
    fingers(ctx, 0, 0.05, Math.PI / 2 - s * 0.2, spread, len, 0.022, col);
    P_line(ctx, -s * 0.04, -0.01, -s * lerp(0.17, 0.1, close), lerp(0.07, 0.04, close), 0.024, col);   // the thumb
    ctx.restore();
  },
};
