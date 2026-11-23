'use strict';
// The tall one: the walker's shape, a head taller than anyone, stooping under the door frame or standing in front of the
// hanging clothes, moving in extreme slow motion. Its own clock runs at timeScale, and nothing it does is sudden (until it lunges): it glides. It is all but
// black, even in the lamp's light; only its eyes show, two round pale lights.
// Close to the bed it bows over it, so its face stays in sight. It is always drawn whole: what is between you and it (the
// bed, the furniture) is drawn over it. Only the wall either side of the opening it is behind is its own business:
// c.showX: [x0, x1] across it, outside which that wall hides it; c.showTop: the height above which the wall over the
//   opening hides it.
// c.headroom (metres above its feet, or undefined): the height it must keep under, the lintel of the opening it is coming
//   through: it stoops as far as it must (stoopFor), its shoulders and head bent down and forward, its knees giving.
// c.feet (pace, below): where its feet are while it walks, so that its feet step under it as it glides: each { x: across
//   from where it is, dz: toward you, lift: off the floor }, in metres. Without them its legs follow c.gait (and down on its
//   haunches they fold from the one into the other).
// The night drives the rest of what it does (js/levels/night12.js):
// c.peer (0..1): it stands behind the wall at the side of the opening and only its head leans out round the edge, toward
//   c.peerSide (+1: the right of the view), its fingers curled round the frame;
// c.flinch (0..1): an arm thrown up across its face, its head turned from the light;
// c.duck (0..1): it is down on its haunches, folded up like a spider, its knees up beside its shoulders, low enough to put
//   its eyes at c.eyeTo (world height above its feet), peering up, its eyes wide; lower still it is on all fours. Down
//   there it crawls: c.crawl (radians, CRAWL of them a metre: the night adds as far as it has gone) moves its legs and arms,
//   each foot and the hand on the other side together, lifted and brought on, then the others; its eyes stay on you;
// c.reach (0..1): its arms up to the edge of the bed, its hands at c.gripY (world height; the night draws the hands on the
//   covers over the edge); c.faceAway (0..1): its face turning down, its eyes going, until only the dark of its head shows.
// Its lunge (death.pose): its hands shoot out at you and take hold; then its face comes at you, fast, until it is right
// in front of yours, twitching; then its whole head swells out over everything until the black of it is all there is.
// While its hands are coming at you, c.armsApart (set by the night) leaves its arms out of its own drawing, and c.part === 'arms' draws only
// them: the night draws them in front of the bed, which is in front of the rest of it.
// Light slows it (c.inLight), in case it is ever in the light and not already down out of it.
// The tooth fairy (the night's easter egg), c.fairy, or nothing: { lean (0..1: bowed far in over the bed toward you from
//   the foot of it, its head and its shoulders drawn as near as they are: FAIRY), offer (0..1: one long arm held out to
//   you, the hand open and palm up at `hand`: [x, y], drawn units about its feet, where that hand is seen in the plane it
//   stands in, handK times as big as it is, being that much nearer you; its other hand down on the end of the bed),
//   tooth (the tooth lying in its palm), shut (0..1: its fingers closed over it), wings (0..1: its butterfly wings
//   unfurled from behind its back), beat (how far open they are swept just now: 1 spread flat to you, toward 0 edge on),
//   gone (0..1: all of it fading away), t (seconds, for the sheen on its wings), still (reduced motion: the sheen stands),
//   steady (reduced flashes: nothing on them twinkles) }. Held out to you over the bed, its arms are drawn apart from it
//   (c.armsApart and c.part === 'arms', as in its lunge).
CREATURES.tall = {
  name: 'the tall one', h: 2.3, w: 1.1, faceY: 2.0, stepRate: 1.3, catchDist: 1.0, sound: 'tall', timeScale: 0.12,
  voice: { kind: 'slow', every: [6, 12] },
  SCALE: 0.77,   // drawn at three metres, stood at two and a bit
  CRAWL: 2 * Math.PI / 0.45,   // down on all fours: its crawl's phase, a metre (a stride, both sides, about 0.45 m)
  STOOP: { top: 0.3, sink: 0.24, hip: 0.14 },   // all the way stooped: how far its shoulders come down, its head on down past them, its hips
  BODY: [8, 7, 10],
  DARK: 0.05,   // how much of the light it takes: it stays all but black in the lamp's light
  // The lunge, in seconds: its hands are at you by grab; then its face comes at you, fast but smooth, until at cut it is
  // right in front of yours (near metres off), and its head twitches until twitch; then it swells until dur
  LUNGE: { grab: 0.2, cut: 0.42, twitch: 0.72, dur: 1.4, near: 0.17 },
  // The tooth fairy, bowed in over the bed: how far in toward you from its feet, and how high, its shoulders and its head
  // are (metres); and the side of the view its offering arm is on
  FAIRY: { shoulders: [0.85, 1.42], head: [1.1, 1.36], side: 1 },
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
      // its own death (the soft chord, stingHum: not the scream of its hands having you) has a very low growl under it
      if (typeof AUDIO !== 'undefined' && typeof G !== 'undefined' && G.state === 'dying' && (c.deathSpec || this.death).sting === 'stingHum') AUDIO.sfx('growlLow');
    }
    const o = c.lunge0;
    c.grabK = clamp(s / U.grab, 0, 1);
    if (s < U.grab) { c.dist = o.d; c.lat = o.lat; c.yOff = 0; c.close = 0; c.closeK = 0; }
    else {
      // then its face comes in at you along the line from your eye to where it was, quickly, its eyes coming level with
      // yours, until it is right in front of you (evenly in how big it looks: its nearness goes from 1/r to 1/near)
      const r = Math.max(0.3, Math.hypot(o.d, o.lat)), e = smoothstep((s - U.grab) / (U.cut - U.grab)), q = 1 / lerp(1, r / U.near, e);
      c.dist = o.d * q; c.lat = o.lat * q; c.yOff = e * (eyeH - this.faceY - (c.pos ? c.pos().y : 0)); c.closeK = e;
      if (e > 0.5) {   // past the foot of the bed: in front of everything, its arms gone past the edges of the view
        if (!c.close && cam) { cam.yaw = cam.tYaw; cam.pitch = cam.tPitch = 0; }
        c.close = 1;
      } else c.close = 0;
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
  // where its hips would be over its feet (metres across): between them, and over the one it stands on as the other lifts
  swayOver(ft) { const liftAny = Math.max(ft[0].lift, ft[1].lift); return (ft[0].lift > ft[1].lift ? ft[1].x : ft[0].x) * 0.35 * smoothstep(liftAny / 0.05) + (ft[0].x + ft[1].x) * 0.5; },
  // How it moves: it glides. Called each frame with where it is going (toD along its way, toLat across it), instead of moving
  // it there: its body drifts after that point, slowly and evenly, never faster than GLIDE.v and never starting or stopping
  // all at once (a damped spring, its speed and its pull both capped), so wherever the point goes, it does not jump. Its
  // feet keep up underneath it: one at a time, a foot comes up, slowly, drifts over to where it will be under it, a little
  // ahead the way it is going, and settles; then the other. With c.glideFeet its feet do not step but drift along with it.
  // Returns c.walk, with where it is now (d, lat) and its steps so far (n); sets c.feet.
  STEP: { half: 0.14, lift: 0.12, dur: 1.6, min: 0.9, rest: 0.25, reach: 0.1, lead: 0.8 },
  GLIDE: { v: 0.45, acc: 0.6, w: 2.6, path: 0.24, pathAcc: 0.2, gain: 1.2 },
  pace(c, dt, toD, toLat) {
    const S = this.STEP, V = this.GLIDE;
    let w = c.walk;
    if (!w) {   // where it already is (feet together under it)
      const d0 = c.dist, l0 = c.runLat !== undefined ? c.runLat : (c.lat || 0);
      w = c.walk = { d: d0, lat: l0, vd: 0, vl: 0, feet: [-1, 1].map(s => ({ d: d0, lat: l0 + s * S.half, lift: 0 })), step: null, wait: 0, n: 0, last: -1 };
    }
    const d0 = w.d, l0 = w.lat;
    let ad = V.w * V.w * (toD - w.d) - 2 * V.w * w.vd, al = V.w * V.w * (toLat - w.lat) - 2 * V.w * w.vl;
    const a = Math.hypot(ad, al); if (a > V.acc) { ad *= V.acc / a; al *= V.acc / a; }
    w.vd += ad * dt; w.vl += al * dt;
    const v = Math.hypot(w.vd, w.vl); if (v > V.v) { w.vd *= V.v / v; w.vl *= V.v / v; }
    w.d += w.vd * dt; w.lat += w.vl * dt;
    const sp = Math.min(V.v, Math.hypot(w.vd, w.vl));
    // where each foot would be: beside it, a little ahead of it the way it is going
    const spot = i => ({ d: w.d + w.vd * S.lead, lat: w.lat + w.vl * S.lead + (i ? 1 : -1) * S.half });
    if (c.glideFeet) for (const f of w.feet) { f.d += w.d - d0; f.lat += w.lat - l0; }
    if (w.step && c.glideFeet) { const st = w.step; for (const q of [st.f0, st.f1]) { q.d += w.d - d0; q.lat += w.lat - l0; } }
    if (!w.step) {
      w.wait -= dt;
      if (w.wait <= 0 && !c.glideFeet) {
        const err = w.feet.map((f, i) => { const q = spot(i); return Math.hypot(f.d - q.d, f.lat - q.lat); });
        const i = err[0] > err[1] + 0.03 ? 0 : err[1] > err[0] + 0.03 ? 1 : (w.last < 0 ? 0 : 1 - w.last);
        if (err[i] > S.reach) { const f = w.feet[i]; w.step = { i, u: 0, f0: { d: f.d, lat: f.lat }, f1: spot(i), held: false }; }
      }
    }
    if (w.step) {
      const st = w.step, f = w.feet[st.i];
      // the quicker it goes, the quicker its steps, so that none is longer than a stride
      st.u = Math.min(1, st.u + dt / clamp(0.3 / Math.max(sp, 0.01) - S.rest, S.min, S.dur));
      const u = st.u;
      if (!st.held && !c.glideFeet) { st.f1 = spot(st.i); if (u > 0.6) st.held = true; }   // (where it will come down: settled before it does)
      const over = smoothstep((u - 0.08) / 0.84);
      f.d = lerp(st.f0.d, st.f1.d, over); f.lat = lerp(st.f0.lat, st.f1.lat, over);
      f.lift = S.lift * smoothstep(u / 0.4) * (1 - smoothstep((u - 0.5) / 0.4));
      if (u >= 1) { f.lift = 0; w.step = null; w.last = st.i; w.n++; w.wait = S.rest; }
    }
    c.feet = w.feet.map(f => ({ x: f.lat - w.lat, dz: w.d - f.d, lift: f.lift }));
    // its hips go over its feet, slowly (they follow where they would be, a beat behind)
    const sw = this.swayOver(c.feet);
    w.sway = w.sway === undefined ? sw : w.sway + (sw - w.sway) * (1 - Math.exp(-dt / 0.4));
    c.feetSway = w.sway;
    return w;
  },
  // Along a way (latOf(d): where it is across it at each distance d), toward toD on it: it keeps to that line, at no more than
  // GLIDE.path metres a second along it, however far the line swings across (round the edge of an opening, it goes the
  // more slowly nearer you), easing into it and out of it; its body glides after that (pace). c.along: how far along it is.
  along(c, dt, toD, latOf) {
    const V = this.GLIDE;
    let g = c.along;
    if (!g) g = c.along = { d: c.dist, v: 0 };
    const J = Math.hypot(1, (latOf(g.d - 0.01) - latOf(g.d + 0.01)) / 0.02);   // metres of the line per metre nearer
    const want = clamp((g.d - toD) * V.gain * J, 0, V.path);
    g.v += clamp(want - g.v, -V.pathAcc * dt, V.pathAcc * dt);
    g.d -= Math.max(0, g.v) / J * dt;
    return this.pace(c, dt, g.d, latOf(g.d));
  },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - Math.hypot(c.dist, c.lat || 0) / 3.2, 0, 1), lunge = c.lunge || 0, K = this.SCALE, S = this.STOOP, U = this.LUNGE;
    // in its lunge it lets go of whatever it was doing at once, and stands up straight
    const free = 1 - clamp(lunge * U.dur / 0.15, 0, 1), grabK = lunge > 0 ? (c.grabK || 0) : 0;
    const peer = (c.peer || 0) * free, ps = c.peerSide || 1, flinch = (c.flinch || 0) * free, duck = (c.duck || 0) * free, reach = (c.reach || 0) * free;
    const body = P.col(this.BODY, this.DARK), part = c.part;
    // the tooth fairy (c.fairy): bowed in over the bed, an arm held out; fading away at the last
    const fy = c.fairy || null, F = this.FAIRY, bow = fy ? (fy.lean || 0) * free : 0, offer = fy ? (fy.offer || 0) * free : 0, gone = fy ? clamp(fy.gone || 0, 0, 1) : 0;
    if (gone >= 1) return;
    // seen from where: how far off it is (its drawing is in the plane it stands in) and how high your eye is over its feet
    const R0 = Math.max(0.2, Math.hypot(c.dist, c.lat || 0)), eyeH = (typeof G !== 'undefined' && G.L && G.L.eyeH) || 1.15, E = eyeH - (c.yOff || 0);
    // it bows over the foot of the bed as it comes: seen from in front, its shoulders hunch up and its head comes forward
    // and down between them (it straightens as it lunges)
    const lean = smoothstep((2.5 - R0) / 0.7) * free * (1 - peer) * (1 - duck);
    // walking on its own feet (c.feet), it rises a little over the foot it stands on and its hips go over it
    const ft = c.feet, liftAny = ft ? Math.max(ft[0].lift, ft[1].lift) : 0;
    // down on all fours, crawling (c.crawl): how far into it (as far as it is down, and not reaching up the bed)
    const crawlK = smoothstep((duck - 0.6) / 0.4) * (1 - reach), crawlPh = c.crawl || 0;
    const bob = ft ? liftAny * 0.12 : Math.abs(Math.sin(g)) * 0.03;
    const sway = ft ? clamp((c.feetSway !== undefined ? c.feetSway : this.swayOver(ft)) / K, -0.12, 0.12) : Math.sin(g) * 0.03;
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
    if (gone > 0) ctx.globalAlpha *= 1 - gone;
    // standing (stooped as far as it must be), and down on its haunches with its eyes at c.eyeTo: the one blended into
    // the other as it goes down
    const top = top0 - st * S.top, sink = sink0 + st * S.sink, hipS = 1.45 + bob - st * S.hip;
    const Ey = (c.eyeTo === undefined ? 0.6 : c.eyeTo) / K;   // its eyes, down there (drawn units)
    const hyC = Ey - 0.36 * hs, topC = hyC + 0.1, hipC = Math.max(0.04, topC - 0.5);
    const kneeC = clamp(topC + 0.12, 0.3, 1.15);
    const hip = lerp(hipS, hipC, duck), hunch = lean * 0.08 + st * 0.05 + duck * 0.06;
    let tp = lerp(top, topC, duck), sw = 0.26 + lean * 0.04 + duck * 0.04;
    const hx = sway * 0.6 + peer * ps * 0.44;
    let hy = lerp(top - sink, hyC, duck);
    // bowed in over the bed, its shoulders and its head are that much nearer you than its feet: each is drawn as big and
    // as high as it is seen from where you sit (bowS, hk: how many times as big), in the plane its feet stand in
    const nearS = R0 / Math.max(0.5, R0 - F.shoulders[0]), nearH = R0 / Math.max(0.4, R0 - F.head[0]), bowS = lerp(1, nearS, bow), hk = lerp(1, nearH, bow);
    if (bow > 0) { tp = lerp(tp, (E + (F.shoulders[1] - E) * nearS) / K, bow); sw *= bowS; hy = lerp(hy, (E + (F.head[1] - E) * nearH) / K - 0.34 * hs * nearH, bow); }
    c.headTop = (hy + 0.54 * hs * hk) * K;   // (the top of its head, as drawn: metres above its feet)
    // where its parts were drawn this frame (drawn units, about its feet), for the checks that it never jumps
    const drawn = part === 'arms' ? null : (c.drawn = { at: c.t / (c.timeScale || 1), lat: c.lat || 0, dist: c.dist, head: [hx, hy], neck: [sway * 0.6, tp + hunch], hip: [sway, hip], feet: [], hands: [], tilt: 0 });
    if (part !== 'arms') {
      if (fy && (fy.wings || 0) > 0.002) this.wings(ctx, sway * 0.6, tp - 0.12, fy);   // its wings, behind all of it
      // legs: hip, knee, foot (down there the knees are up and out beside its shoulders). On its own feet, each foot is
      // where it is on the floor (nearer you, lower in the view), lifted as it steps
      // (on its own feet as it goes down on its haunches, its legs fold from the one into the other)
      for (const s of [-1, 1]) {
        const f = ft ? ft[s > 0 ? 1 : 0] : null, fb = f ? 1 - duck : 0;
        const hpx = lerp(s * 0.1 + sway, s * 0.12, duck);
        const ph = g + (s > 0 ? Math.PI : 0), gl = Math.max(0, Math.sin(ph)) * 0.22 * (1 - duck * 0.6);
        let fx = lerp(s * 0.18 + sway * 0.3, s * 0.32, duck), fy = gl + 0.03, toe = 0;
        let kx = lerp(s * (0.14 + st * 0.08) + sway * 0.6, s * 0.44, duck), ky = lerp(lerp(0.75, 0.68, st) + gl * 0.7, kneeC + gl * 0.3, duck);
        // crawling: the foot comes up and on, its knee lifting higher beside its shoulder, and back down (smooth in the phase)
        if (crawlK > 0) { const cl = Math.max(0, Math.sin(crawlPh + (s > 0 ? Math.PI : 0))), sl = Math.cos(crawlPh + (s > 0 ? Math.PI : 0)); fy += cl * 0.12 * crawlK; fx += s * sl * 0.05 * crawlK; ky += cl * 0.16 * crawlK; kx += s * cl * 0.05 * crawlK; }
        if (f) {
          const fl = f.lift / K, ffx = f.x / K, ffy = fl + 0.03 - E * f.dz / Math.max(0.2, R0 - f.dz) / K;
          const fkx = lerp(hpx, ffx, 0.5) + s * (0.04 + st * 0.08) + fl * s * 0.3, fky = lerp(lerp(0.75, 0.68, st), (hip + ffy) * 0.5, 0.25) + fl * 0.75;
          fx = lerp(fx, ffx, fb); fy = lerp(fy, ffy, fb); kx = lerp(kx, fkx, fb); ky = lerp(ky, fky, fb); toe = fl * 0.3 * fb;
        }
        P_limb(ctx, [[hpx, hip + 0.05], [kx, ky], [fx, fy]], 0.085, body);
        if (drawn) drawn.feet.push([fx, fy], [kx, ky]);
        P_line(ctx, fx - 0.03 * s, fy, fx + s * 0.11, fy - toe, 0.08, body);
      }
      P_poly(ctx, [[-0.17 + sway, hip], [0.17 + sway, hip], [sw + sway * 0.6, tp + hunch], [sway * 0.6, tp], [-sw + sway * 0.6, tp + hunch]], body);
      const rb = Math.max(st, duck, bow), rk = smoothstep(rb / 0.2);
      if (rk > 0) P_ell(ctx, sway * 0.6, tp + hunch * 0.5, sw * rk, (0.03 * rk + 0.1 * rb) * bowS, body);   // its back rounded up behind its head
    }
    // arms: down to the knees, rising very slowly as it comes; down there, its hands flat on the floor in front of it
    const raise = smoothstep(near * 0.8) * (1 - duck);
    const grip = (c.gripY === undefined ? 0.7 : c.gripY) / K;   // the edge of the bed, where its hands take hold
    let late = null;
    // (right in front of you its hands are on you, out of sight either side)
    const showArms = part === 'arms' || !(c.armsApart && (grabK > 0 || bow > 0)) && !c.close;
    for (const s of [-1, 1]) {
      const sx = s * (sw - 0.01) + sway * 0.6, sy = tp - 0.08 * bowS + hunch;
      let ex = s * lerp(0.28, 0.62, raise), ey = lerp(1.6, 1.9, raise) - lean * 0.1 - st * 0.25;
      let px = s * lerp(0.3, 0.5, raise), py = lerp(0.85, 2.35, raise) - lean * 0.1 * raise - st * 0.2;
      let ang = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), spread = lerp(0.16, 0.32, raise), len = 0.24 + raise * 0.06;
      const mix = (k, e2, f2, p2, q2, a2, sp2, l2) => { ex = lerp(ex, e2, k); ey = lerp(ey, f2, k); px = lerp(px, p2, k); py = lerp(py, q2, k); ang = lerp(ang, a2, k); spread = lerp(spread, sp2, k); len = lerp(len, l2, k); };
      if (duck > 0) mix(duck, s * 0.52, Math.max(0.3, topC * 0.75), s * 0.36, 0.05, -Math.PI / 2 + s * 0.5, 0.2, 0.2);
      // crawling: the hand on this side goes with the foot on the other, lifted, brought on and put down flat again
      if (crawlK > 0) { const cl = Math.max(0, Math.sin(crawlPh + (s > 0 ? 0 : Math.PI))), sl = Math.cos(crawlPh + (s > 0 ? 0 : Math.PI)); py += cl * 0.1 * crawlK; px += s * sl * 0.05 * crawlK; ey += cl * 0.12 * crawlK; ex += s * cl * 0.04 * crawlK; }
      // peering: the arm on the opening's side is up behind the wall, its hand on the frame (only its fingers, round the
      // edge, show: the night draws them); nothing of the arm is out in the opening
      if (peer > 0 && s === ps) mix(peer, s * 0.29, hy - 0.42, s * 0.27, hy - 0.1, Math.PI / 2, 0.16, 0.18);
      // the light: the arm on that side up across its face, the back of the hand to it
      if (flinch > 0 && s === (c.flinchSide || 1)) mix(flinch, s * 0.46, tp + 0.05, -s * 0.06, hy + 0.36, s > 0 ? Math.PI * 0.95 : Math.PI * 0.05, 0.22, 0.26);
      // up over the edge of the bed: the hands on it, wide apart, the fingers hooked over onto the covers
      if (reach > 0) mix(reach, s * 0.66, grip - 0.42, s * 0.4, grip, -Math.PI / 2 + s * 0.2, 0.13, 0.17);
      // the tooth fairy, bowed in: the hand that is not held out to you is down on the end of the bed
      if (bow > 0 && s !== F.side) mix(bow, s * (sw + 0.14), lerp(sy, grip, 0.55), s * 0.34, grip, -Math.PI / 2 + s * 0.2, 0.13, 0.17);
      const arm = () => {
        if (grabK > 0) { this.grabArm(ctx, s, sx, sy, px, py, grabK, R0, E, body); return; }
        if (offer > 0.01 && s === F.side) { this.offerArm(ctx, s, sx, sy, px, py, fy, offer, bowS, body, P); return; }
        P_limb(ctx, [[sx, sy], [ex, ey], [px, py]], 0.065, body);
        if (drawn) drawn.hands.push([px, py], [ex, ey]);
        fingers(ctx, px, py, ang, spread, len, 0.02, body);
        if (reach > 0.3 || bow > 0.3) P_ell(ctx, px, py + 0.01, 0.06, 0.045, body);   // the back of the hand, knuckles up
      };
      if (!showArms) continue;
      // the arm thrown up across its face from the light goes in front of the head: drawn after it
      if (flinch > 0.02 && s === (c.flinchSide || 1)) late = arm; else arm();
    }
    if (part === 'arms') { ctx.restore(); return; }
    // the head, bent under the frame and turned to you; leaning out round an edge it tips over that way; flinching it turns
    // from the light; down there it holds still, peering up
    const still = free * (1 - peer) * (1 - duck);
    let tilt = -0.3 * Math.cos(Math.PI * t / 2.7) * still * (1 - grabK) * (1 - 0.55 * bow) + (0.35 * 0.18 + 0.1 * lean) * (1 - peer) * (1 - duck) * free - peer * ps * 0.5 + flinch * (c.flinchSide || 1) * 0.35;
    if (drawn) drawn.tilt = tilt;
    if (peer > 0) P_line(ctx, sway * 0.6, tp - 0.04, hx, hy + 0.06, 0.09, body);   // the neck, stretched out round the edge
    ctx.save(); ctx.translate(hx, hy);
    // right in front of you its head twitches, for a moment, hard and fast
    const tw = c.close && c.twitchT !== undefined ? c.twitchT : -1;
    if (tw >= 0 && tw < U.twitch - U.cut) {
      const j = Math.sin(tw * 93) * Math.sin(tw * 151 + 1.3), j2 = Math.sin(tw * 127 + 0.4) * Math.sin(tw * 71);
      tilt += j * 0.22; ctx.translate(j2 * 0.04, j * 0.025);
    }
    ctx.rotate(tilt); ctx.scale(hs * hk, hs * hk);
    // and then it swallows you: its whole head keeps on coming, swelling out over everything from just under its eyes,
    // until the black of it is all there is
    const gulp = lunge > 0 ? (c.gulp || 0) : 0;
    if (gulp > 0) { const mc = 0.3, gg = 1 + gulp * gulp * 90; ctx.translate(0, mc); ctx.scale(gg, gg); ctx.translate(0, -mc); }
    P_line(ctx, 0, 0, 0, 0.14, 0.08, body);
    P_ell(ctx, 0, 0.34, 0.13, 0.2, body);
    // its face turned down, only the dark of its head: its eyes go as it turns
    const look = lunge > 0 ? 1 : 1 - smoothstep(((c.faceAway || 0) - 0.3) / 0.4);
    if (look <= 0) { ctx.restore(); if (late) late(); ctx.restore(); return; }
    ctx.globalAlpha *= look;
    // its face is nothing but two round pale eyes in the dark of its head, a soft glow round each, the same in any light
    // (peering up, they widen; right in front of you they are wide)
    const er = 0.017 * (1 + duck * 0.2 + lerp(grabK * 0.15, 0.3, c.closeK === undefined ? (c.close ? 1 : 0) : c.closeK));
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
  // a limb that is nearer you at one end than the other: w0 wide at (x0, y0), w1 at (x1, y1), its end rounded
  taper(ctx, x0, y0, w0, x1, y1, w1, col) {
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    P_poly(ctx, [[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], col);
    P_ell(ctx, x1, y1, w1, w1, col);
  },
  // The tooth fairy's arm held out to you (k: 0..1 out), from its shoulder (sx, sy: bowS times as big as it is, being as
  // near as it is) to its hand where the night has it (f.hand, f.handK times as big: nearer still), from where it hung
  // (px, py). The hand is open, palm up, seen from a little above: the long fingers toward you, a little spread, the thumb
  // out to the side; f.tooth: the tooth lying in the palm, small and pale; f.shut: the fingers closed up over it, a fist
  offerArm(ctx, s, sx, sy, px, py, f, k, bowS, col, P) {
    const a = smoothstep(k), H = f.hand || [s * 0.6, 0.6], sc = lerp(1, f.handK || 3, a), X = lerp(px, H[0], a), Y = lerp(py, H[1], a);
    const msc = (bowS + sc) / 2, MX = lerp(sx, X, 0.5) + s * 0.13 * msc * a, MY = lerp(sy, Y, 0.5) - 0.08 * msc * a;   // the elbow: out to the side, and low
    this.taper(ctx, sx, sy, 0.033 * bowS, MX, MY, 0.033 * msc, col); this.taper(ctx, MX, MY, 0.033 * msc, X, Y + 0.02 * sc, 0.027 * sc, col);
    const shut = clamp(f.shut || 0, 0, 1);
    ctx.save(); ctx.translate(X, Y); ctx.scale(sc, sc);
    P_ell(ctx, 0, 0, 0.066, 0.044, col);                                                                   // the palm
    P_line(ctx, s * 0.05, 0.008, s * lerp(0.125, 0.055, shut), lerp(0.03, 0, shut), 0.022, col);         // the thumb, out to the side
    P_ell(ctx, 0, 0.004, 0.046 * (1 - shut), 0.027 * (1 - shut), P.raw([25, 23, 31]));                   // the hollow of it: the palm is up
    if (f.tooth && shut < 0.85) {   // the tooth in it
      const pale = P.raw([236, 230, 212]);
      ctx.save(); ctx.globalAlpha *= 1 - smoothstep((shut - 0.45) / 0.4);
      P_ell(ctx, 0, 0.008, 0.0105, 0.01, pale); P_ell(ctx, -0.005, -0.002, 0.004, 0.008, pale); P_ell(ctx, 0.005, -0.002, 0.004, 0.008, pale);
      ctx.restore();
    }
    // its fingers: out toward you, long, a little spread; closing, they curl up over the palm
    fingers(ctx, 0, -0.016 + 0.014 * shut, -Math.PI / 2 + s * 0.08, lerp(0.34, 0.12, shut), lerp(0.135, 0.045, shut), 0.021, col);
    if (shut > 0.4) P_ell(ctx, 0, -0.004, 0.066, lerp(0.044, 0.052, shut), col);
    ctx.restore();
  },
  // Its wings (the tooth fairy's): the one beautiful thing there is. A butterfly's, two each side, from between its
  // shoulders (x, y, drawn units), each far longer than its arms: the fore pair blue, from the deep violet of their roots
  // out through azure and turquoise to a pale gold edge; the hind pair rose, from purple out through magenta and apricot
  // to gold, each drawn out into a little tail; dark veins, a dark margin with a row of pale spots along it, an eye on
  // each. They are their own light, the same in any dark. f.wings unfurls them, up and out from folded shut behind its
  // back, the hind pair a little after the fore; f.beat is how far open they are swept just now (1: spread flat to you;
  // toward 0: edge on); a slow sheen runs out along them and a few points on them twinkle (f.still: the sheen stands;
  // f.steady: no twinkling)
  WING: {
    // each wing's outline: where it starts at the root, then its curves (two control points and an end, each), going
    // out along its leading edge, round its outer margin (the curve numbered `margin`), and back along its trailing edge
    fore: { from: [0.02, 0.03], curves: [[0.2, 0.62, 0.95, 1.08, 1.62, 1.0], [1.94, 0.95, 2.0, 0.6, 1.74, 0.36], [1.4, 0.04, 0.62, -0.16, 0.02, -0.06]], margin: 1, fold: 0.75, mid: [0.98, 0.46],
      grad: [0.08, 0.06, 1.98, [[0, [26, 16, 84]], [0.2, [62, 44, 190]], [0.46, [44, 138, 236]], [0.7, [62, 222, 208]], [0.88, [182, 246, 204]], [1, [255, 240, 170]]]],
      veins: [[0.85, 1.0], [1.3, 1.04], [1.7, 0.94], [1.92, 0.68], [1.8, 0.42], [1.42, 0.14], [0.9, -0.06]], cell: [0.52, 0.34, 0.4, 0.15, 0.52],
      eye: [1.52, 0.7, 0.13, [[1, [255, 214, 110]], [0.74, [22, 14, 62]], [0.5, [86, 200, 255]], [0.2, [255, 255, 255]]]],
      stars: [[0.7, 0.62], [1.2, 0.42], [1.05, 0.86], [1.66, 0.52], [0.42, 0.16]] },
    hind: { from: [0.02, -0.02], curves: [[0.5, 0, 1.2, -0.1, 1.36, -0.5], [1.5, -0.88, 1.2, -1.18, 0.86, -1.14], [0.82, -1.36, 0.64, -1.54, 0.5, -1.52], [0.54, -1.36, 0.5, -1.22, 0.42, -1.1], [0.22, -0.9, 0.06, -0.5, 0.02, -0.02]], margin: 1, fold: -0.5, mid: [0.66, -0.56],
      grad: [0.06, -0.06, 1.56, [[0, [44, 18, 86]], [0.24, [128, 48, 178]], [0.5, [230, 74, 156]], [0.76, [255, 156, 96]], [1, [255, 226, 140]]]],
      veins: [[1.1, -0.1], [1.38, -0.46], [1.36, -0.86], [1.04, -1.15], [0.6, -1.44], [0.3, -0.98]], cell: [0.44, -0.3, 0.3, 0.13, -0.6],
      eye: [0.92, -0.64, 0.19, [[1, [255, 234, 160]], [0.78, [32, 16, 74]], [0.56, [255, 100, 170]], [0.34, [70, 220, 232]], [0.13, [255, 255, 255]]]],
      stars: [[0.6, -0.5], [1.12, -0.36], [0.74, -1.0], [1.2, -0.84]] },
  },
  wings(ctx, x, y, f) {
    const k = clamp(f.wings || 0, 0, 1), beat = clamp(f.beat === undefined ? 1 : f.beat, 0.04, 1.4), T = f.t || 0;
    const bez = (p, c, u) => { const v = 1 - u; return [v * v * v * p[0] + 3 * v * v * u * c[0] + 3 * v * u * u * c[2] + u * u * u * c[4], v * v * v * p[1] + 3 * v * v * u * c[1] + 3 * v * u * u * c[3] + u * u * u * c[5]]; };
    const path = W => { ctx.beginPath(); ctx.moveTo(W.from[0], W.from[1]); for (const c of W.curves) ctx.bezierCurveTo(c[0], c[1], c[2], c[3], c[4], c[5]); ctx.closePath(); };
    const wing = (W, e, ph) => {
      if (e <= 0) return;
      ctx.save();
      // folded shut it stands narrow behind its back; it swings out and spreads
      ctx.rotate(W.fold * (1 - e)); ctx.scale(lerp(0.1, 1, e) * beat, lerp(0.55, 1, e));
      ctx.globalAlpha *= smoothstep(e / 0.3) * 0.94;
      // a breath of its colour round it
      for (const [g, a] of [[1.1, 0.07], [1.05, 0.1]]) { ctx.save(); ctx.scale(g, g); path(W); ctx.fillStyle = rgba(W.grad[3][2][1], a); ctx.fill(); ctx.restore(); }
      path(W);
      const gr = ctx.createRadialGradient(W.grad[0], W.grad[1], 0.02, W.grad[0], W.grad[1], W.grad[2]);
      for (const [o, col] of W.grad[3]) gr.addColorStop(o, rgba(col));
      ctx.fillStyle = gr; ctx.fill();
      ctx.save(); ctx.clip();
      // bands across it, light and dark, round from its root
      ctx.lineCap = 'butt';
      for (const [r, wd, col] of [[0.74, 0.1, 'rgba(255,255,255,0.1)'], [1.02, 0.045, 'rgba(22,12,70,0.3)'], [1.3, 0.12, 'rgba(255,255,255,0.09)'], [1.52, 0.04, 'rgba(22,12,70,0.26)']]) { ctx.beginPath(); ctx.arc(W.grad[0], W.grad[1], r * W.grad[2] / 1.98, 0, TAU); ctx.lineWidth = wd; ctx.strokeStyle = col; ctx.stroke(); }
      P_ell(ctx, W.cell[0], W.cell[1], W.cell[2], W.cell[3], 'rgba(214,236,255,0.2)', W.cell[4]);   // the pale cell by its root
      // its veins, out from the root, each a little bowed
      ctx.strokeStyle = 'rgba(16,10,48,0.5)'; ctx.lineWidth = 0.011; ctx.lineCap = 'round';
      for (const [vx, vy] of W.veins) { ctx.beginPath(); ctx.moveTo(W.from[0], W.from[1]); ctx.quadraticCurveTo(vx * 0.5 - vy * 0.08, vy * 0.5 + vx * 0.08, vx, vy); ctx.stroke(); }
      // the dark margin, and the pale spots along it
      path(W); ctx.lineWidth = 0.15; ctx.strokeStyle = 'rgba(14,8,40,0.84)'; ctx.stroke();
      { const p0 = W.curves[W.margin - 1].slice(4), cv = W.curves[W.margin];
        for (let i = 0; i < 7; i++) { const q = bez(p0, cv, 0.06 + i * 0.147), d = Math.hypot(W.mid[0] - q[0], W.mid[1] - q[1]) || 1, r = i % 2 ? 0.016 : 0.024; P_ell(ctx, q[0] + (W.mid[0] - q[0]) / d * 0.042, q[1] + (W.mid[1] - q[1]) / d * 0.042, r, r, 'rgba(255,250,226,0.92)'); } }
      // its eye: ring in ring, and a point of light on it
      for (const [r, col] of W.eye[3]) P_ell(ctx, W.eye[0], W.eye[1], W.eye[2] * r, W.eye[2] * r, rgba(col));
      P_ell(ctx, W.eye[0] - W.eye[2] * 0.28, W.eye[1] + W.eye[2] * 0.3, W.eye[2] * 0.1, W.eye[2] * 0.1, 'rgba(255,255,255,0.85)');
      // the sheen running out along it
      { const at = f.still ? 1.1 : ((T * 0.42 + ph) % 1.9) * 1.3 - 0.2, sh = ctx.createLinearGradient(at - 0.3, 0, at + 0.3, 0.2);
        sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.2)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sh; ctx.fillRect(-0.2, -1.7, 2.4, 3); }
      ctx.restore();
      path(W); ctx.lineWidth = 0.012; ctx.strokeStyle = 'rgba(10,6,30,0.9)'; ctx.stroke();   // its edge
      // and the points on it that twinkle
      W.stars.forEach(([sx, sy], i) => {
        const a = f.steady ? 0.45 : Math.pow(Math.max(0, Math.sin(T * (2.1 + i * 0.37) + i * 1.9 + ph * 5)), 3), r = 0.05 + 0.02 * (i % 2);
        if (a < 0.02) return;
        ctx.strokeStyle = rgba([255, 255, 244], a); ctx.lineWidth = 0.009; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx - r, sy); ctx.lineTo(sx + r, sy); ctx.moveTo(sx, sy - r); ctx.lineTo(sx, sy + r); ctx.stroke();
        P_ell(ctx, sx, sy, 0.012, 0.012, rgba([255, 255, 255], a));
      });
      ctx.restore();
    };
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.translate(x, y); ctx.scale(sd, 1);
      wing(this.WING.hind, smoothstep((k - 0.18) / 0.82), sd > 0 ? 0.5 : 0.1);
      wing(this.WING.fore, smoothstep(k / 0.8), sd > 0 ? 0 : 0.6);
      ctx.restore();
    }
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
