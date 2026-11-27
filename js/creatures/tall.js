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
//   tooth (the tooth lying in its open palm, and kept there to the last), wings (0..1: its butterfly wings
//   unfurled from behind its back), beat (how far open they are swept just now: 1 spread flat to you, toward 0 edge on),
//   gone (0..1: all of it fading away), t (seconds, for the sheen on its wings), still (reduced motion: the sheen stands),
//   steady (reduced flashes: nothing on them twinkles), look (0..1, a little past 1 as it snaps: its head bowed to look
//   down at the hand it holds out, or at its hands), cup (0..1: its two hands brought together in front of its chest,
//   cupped round the tooth), fling (0..1, past 1 as it snaps: its arms thrown out wide to its sides, the hands open), pop
//   (how big its wings are drawn as they burst open: a little past 1 and back), eyes (0..1: open; 0 shut, their light
//   out), shimmer (0..1: its eyes no longer pale but iridescent, blue and rose as its wings are, twinkling) }. Held out to you over the bed, its arms are drawn apart from it
//   (c.armsApart and c.part === 'arms', as in its lunge), from the same shoulders as the rest of it is drawn with: bowed
//   in, each arm's root is tucked in under the corner of its shoulders, inside the line of its body, so the nearer layer
//   of arms always joins the body behind it.
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
    const cupK = fy ? (fy.cup || 0) * free : 0, fling = fy ? (fy.fling || 0) * free : 0, lookK = fy ? (fy.look || 0) * free : 0;
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
    // the head, bent under the frame and turned to you; leaning out round an edge it tips over that way; flinching it turns
    // from the light; down there it holds still, peering up
    const still = free * (1 - peer) * (1 - duck);
    let tilt = -0.3 * Math.cos(Math.PI * t / 2.7) * still * (1 - grabK) * (1 - 0.55 * bow) + (0.35 * 0.18 + 0.1 * lean) * (1 - peer) * (1 - duck) * free - peer * ps * 0.5 + flinch * (c.flinchSide || 1) * 0.35;
    if (drawn) drawn.tilt = tilt;
    // (the tooth fairy's head bowed to look down at what it holds: down, and tipped toward the hand it holds out)
    if (lookK) tilt -= F.side * 0.14 * lookK;
    const headX = hx + F.side * 0.03 * lookK * (1 - cupK), headY = hy - 0.07 * lookK;
    // the tooth fairy's arms, drawn apart from it (nearer than the bed), go behind its head: nothing of them is drawn
    // over its head and its eyes
    if (part === 'arms' && fy) {
      ctx.beginPath(); ctx.rect(-9, -9, 18, 99);
      ctx.save(); ctx.translate(headX, headY); ctx.rotate(tilt); ctx.scale(hs * hk, hs * hk); ctx.moveTo(0.13, 0.34); ctx.ellipse(0, 0.34, 0.13, 0.2, 0, 0, TAU); ctx.restore();
      ctx.clip('evenodd');
    }
    // (right in front of you its hands are on you, out of sight either side)
    const showArms = part === 'arms' || !(c.armsApart && (grabK > 0 || bow > 0)) && !c.close;
    // (the tooth fairy's hands are its long hands as they take hold of the covers, as big: fairyHand; on the end of the
    // bed they are that much nearer you than its feet)
    const hcol = fy ? P.col(this.HAND, this.DARK) : body, restK = lerp(1, R0 / Math.max(0.5, R0 - 0.4), bow);
    for (const s of [-1, 1]) {
      // (each arm's root at its shoulder: bowed in, tucked in under the corner of the shoulders and inside the slope of its
      // side below them, so an arm drawn apart from the body, nearer, always meets it)
      const sx = s * (sw - lerp(0.01, 0.045 * bowS, bow)) + sway * 0.6, sy = tp + hunch - lerp(0.08, 0.04, bow) * bowS;
      let ex = s * lerp(0.28, 0.62, raise), ey = lerp(1.6, 1.9, raise) - lean * 0.1 - st * 0.25;
      let px = s * lerp(0.3, 0.5, raise), py = lerp(0.85, 2.35, raise) - lean * 0.1 * raise - st * 0.2;
      let ang = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), spread = lerp(0.16, 0.32, raise), len = 0.24 + raise * 0.06;
      // (the tooth fairy's hand: how far open, which side its thumb is on, how big)
      let hOpen = 0.6, hTh = -s, hK = 1;
      const mix = (k, e2, f2, p2, q2, a2, sp2, l2) => { ex = lerp(ex, e2, k); ey = lerp(ey, f2, k); px = lerp(px, p2, k); py = lerp(py, q2, k); ang = lerp(ang, a2, k); spread = lerp(spread, sp2, k); len = lerp(len, l2, k); };
      const hand = (k, o2, t2, k2) => { hOpen = lerp(hOpen, o2, k); hTh = lerp(hTh, t2, k); hK = lerp(hK, k2, k); };
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
      // the tooth fairy, bowed in: the hand that is not held out to you is down on the end of the bed, flat on it, the
      // long fingers toward you
      if (bow > 0 && s !== F.side) { mix(bow, s * (sw + 0.14), lerp(sy, grip, 0.55), s * 0.36, grip + 0.05, -Math.PI / 2 + s * 0.12, 0.13, 0.17); hand(bow, 0.4, -s, restK); }
      // its hands together, cupped round the tooth in front of its chest (the fingers curled over toward each other, the
      // thumbs up); and then flung out wide, the fingers spread, the palms to you (each hand turned in toward the other,
      // and then up and out: the same way round on both sides)
      if (cupK > 0) { mix(cupK, s * (sw + 0.05), tp - 0.36, s * 0.14, tp - 0.3, s > 0 ? -Math.PI * 1.15 : Math.PI * 0.15, 0.1, 0.12); hand(cupK, 0, -s, 1); }
      if (fling > 0) { mix(fling, s * (sw + 0.34), tp + 0.06, s * 1.12, tp + 0.2, s > 0 ? 0.25 - TAU : Math.PI - 0.25, 0.42, 0.3); hand(fling, 1, s, 1); }
      const arm = () => {
        if (grabK > 0) { this.grabArm(ctx, s, sx, sy, px, py, grabK, R0, E, body); return; }
        if (offer > 0.01 && s === F.side) { this.offerArm(ctx, s, sx, sy, px, py, fy, offer, bowS, hcol, P, { ang, open: hOpen, th: hTh, k: hK }); return; }
        if (drawn) drawn.hands.push([px, py], [ex, ey]);
        if (fy) {   // the tooth fairy's: the forearm thickening a little to the wrist of its long hand
          P_limb(ctx, [[sx, sy], [ex, ey]], 0.065, body);
          this.taper(ctx, ex, ey, 0.0325, px, py, 0.022 * this.HAND_K / K * hK, hcol);
          this.fairyHand(ctx, px, py, ang, hK, hTh, hOpen, hcol, 0);
          return;
        }
        P_limb(ctx, [[sx, sy], [ex, ey], [px, py]], 0.065, body);
        fingers(ctx, px, py, ang, spread, len, 0.02, body);
        if (reach > 0.3 || bow > 0.3) P_ell(ctx, px, py + 0.01, 0.06, 0.045, body);   // the back of the hand, knuckles up
      };
      if (!showArms) continue;
      // the arm thrown up across its face from the light goes in front of the head: drawn after it
      if (flinch > 0.02 && s === (c.flinchSide || 1)) late = arm; else arm();
    }
    if (part === 'arms') { ctx.restore(); return; }
    if (peer > 0) P_line(ctx, sway * 0.6, tp - 0.04, hx, hy + 0.06, 0.09, body);   // the neck, stretched out round the edge
    ctx.save(); ctx.translate(headX, headY);
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
    // (peering up, they widen; right in front of you they are wide). The tooth fairy's: looking down they are lower in
    // its face and narrowed; shut, they are gone; shimmering, they are blue and rose by turns as its wings are, brighter,
    // the glow round each wider, and they twinkle
    const er = 0.017 * (1 + duck * 0.2 + lerp(grabK * 0.15, 0.3, c.closeK === undefined ? (c.close ? 1 : 0) : c.closeK));
    const open = fy && fy.eyes !== undefined ? Math.max(0, fy.eyes) : 1, shim = fy ? fy.shimmer || 0 : 0, T = fy ? fy.t || 0 : 0;
    if (open > 0.02) for (const s of [-1, 1]) {
      const x = s * 0.046, y = 0.37 - 0.085 * lookK, ry = er * Math.min(open, 1.2) * (1 - 0.45 * clamp(lookK, 0, 1));
      const hue = fy && fy.steady ? 0.5 : 0.5 + 0.5 * Math.sin(T * 2.7 + s * 1.9), col = mixc([235, 228, 210], mixc([90, 206, 255], [255, 112, 196], hue), shim);
      const gr = er * (3.2 + 2.4 * shim), gl = ctx.createRadialGradient(x, y, 0, x, y, gr);
      gl.addColorStop(0, rgba(col, (0.3 + 0.3 * shim) * Math.min(1, open))); gl.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = gl; ctx.fillRect(x - gr, y - gr, gr * 2, gr * 2);
      P_ell(ctx, x, y, er * (1 + 0.15 * shim), ry * (1 + 0.15 * shim), P.raw(col));
      if (shim > 0) {   // a point of white in each, and a glint off it that twinkles
        P_ell(ctx, x - er * 0.3, y + ry * 0.3, er * 0.32, er * 0.32 * Math.min(1, open), rgba([255, 255, 255], 0.9 * shim));
        const a = shim * Math.min(1, open) * (fy.steady ? 0.4 : Math.pow(Math.max(0, Math.sin(T * 6.3 + s * 2.2)), 2)), r = er * 2.6;
        if (a > 0.02) { ctx.strokeStyle = rgba([255, 255, 250], a); ctx.lineWidth = 0.006; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); }
      }
    }
    ctx.restore();
    if (late) late();
    ctx.restore();
  },
  // One of its long hands: the hands that take hold of the covers (night 12 draws those, drawGrip, as does the Creature
  // Lab), and the tooth fairy's. In metres (as big as it is), about the middle of the back of the hand, the fingers down
  // (toward you, lying on the cloth), the wrist up: the long fingers spread straight (open 1) or bent down at the knuckle
  // and their tips curled back under (open 0); th: the side the thumb is on (+1, -1, or between as the hand turns over).
  // palm (0..1): how much it is turned palm up to you, its hollow a little less dark than the rest of it. It is drawn
  // HAND_K times as big as it is (the night's hands on the covers are), and the wrist meets an arm at (WRIST) from it
  HAND: [10, 9, 12], HAND_K: 1.3, WRIST: [0, 0.06],
  hand(ctx, th, open, col, palm) {
    P_line(ctx, -th * 0.006, 0.06, 0, 0.01, 0.05, col);   // the wrist
    P_ell(ctx, 0, 0, 0.05, 0.032, col);                    // the back of the hand (or its palm)
    for (let i = 0; i < 4; i++) {
      const x0 = (i - 1.5) * 0.022, l = (i === 0 || i === 3 ? 0.07 : 0.088) * (1 + 0.15 * open);
      const mid = [lerp(x0 * 1.1, x0 * 1.3, open), -0.01 - l * lerp(0.42, 0.5, open)], tip = [lerp(x0 * 1.0 - th * 0.004, x0 * 1.7, open), -0.01 - l * lerp(0.3, 1.0, open)];
      P_limb(ctx, [[x0, -0.01], mid, tip], 0.013, col);
      if (open < 0.5) P_ell(ctx, mid[0], mid[1], 0.009, 0.007, col);   // the bent knuckle
    }
    P_limb(ctx, [[th * 0.045, 0], [th * lerp(0.045, 0.08, open), -0.03], [th * lerp(0.03, 0.085, open), -lerp(0.05, 0.07, open)]], 0.013, col);   // the thumb
    if (palm > 0.01) {   // palm up: its hollow, softly, and the creases where the fingers start
      const g = ctx.createRadialGradient(0, -0.004, 0, 0, -0.004, 0.04);
      g.addColorStop(0, rgba([34, 31, 40], 0.9 * palm)); g.addColorStop(0.6, rgba([26, 24, 31], 0.5 * palm)); g.addColorStop(1, rgba([26, 24, 31], 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -0.004, 0.042, 0.027, 0, 0, TAU); ctx.fill();
    }
  },
  // one of its hands where the tooth fairy holds it (drawn units): its wrist at (x, y), the fingers pointing along ang,
  // k times as big as it is drawn there for being nearer you (as the hands on the covers are drawn)
  fairyHand(ctx, x, y, ang, k, th, open, col, palm) {
    const g = this.HAND_K / this.SCALE * k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); ctx.scale(g, g); ctx.translate(-this.WRIST[0], -this.WRIST[1]);
    this.hand(ctx, th, open, col, palm);
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
  // out to the side; f.tooth: the tooth lying in the palm, small and pale with a faint glow round it, and drawn a little
  // larger the further off the hand is, so it can still be made out lying there as it steps back
  // (h: how that hand is held where it hung: { ang, open, th, k }, as fairyHand has them; it turns over from the one to
  // the other as it comes in)
  offerArm(ctx, s, sx, sy, px, py, f, k, bowS, col, P, h) {
    const a = smoothstep(k), H = f.hand || [s * 0.6, 0.6], sc = lerp(h.k, f.handK || 3, a), X = lerp(px, H[0], a), Y = lerp(py, H[1], a);
    // the hand: open, palm up, seen from a little above, the long fingers out toward you, a little spread, the thumb out
    // to the side (its middle, where the tooth lies, at X, Y); its wrist behind it
    const ang = lerp(h.ang, -Math.PI / 2 + s * 0.06, a), g = this.HAND_K / this.SCALE * sc, wr = this.WRIST[1] * g, WX = X - Math.cos(ang) * wr * a, WY = Y - Math.sin(ang) * wr * a;
    const msc = (bowS + sc) / 2, MX = lerp(sx, WX, 0.5) + s * 0.13 * msc * a, MY = lerp(sy, WY, 0.5) - 0.08 * msc * a;   // the elbow: out to the side, and low
    this.taper(ctx, sx, sy, 0.033 * bowS, MX, MY, 0.033 * msc, col); this.taper(ctx, MX, MY, 0.033 * msc, WX, WY, 0.022 * g, col);
    this.fairyHand(ctx, WX, WY, ang, sc, lerp(h.th, s, a), lerp(h.open, 0.85, a), col, a);
    ctx.save(); ctx.translate(WX + Math.cos(ang) * wr, WY + Math.sin(ang) * wr); ctx.scale(sc, sc);
    if (f.tooth) {   // the tooth in it
      const z = clamp(2.6 / sc, 1, 2.2), pale = P.raw([236, 230, 212]), gl = ctx.createRadialGradient(0, 0.006, 0, 0, 0.006, 0.03 * z);
      gl.addColorStop(0, rgba([240, 234, 214], 0.28)); gl.addColorStop(1, rgba([240, 234, 214], 0));
      ctx.fillStyle = gl; ctx.fillRect(-0.03 * z, 0.006 - 0.03 * z, 0.06 * z, 0.06 * z);
      ctx.save(); ctx.translate(0, 0.004); ctx.scale(z, z);
      P_ell(ctx, 0, 0.004, 0.0105, 0.01, pale); P_ell(ctx, -0.005, -0.006, 0.004, 0.008, pale); P_ell(ctx, 0.005, -0.006, 0.004, 0.008, pale);
      ctx.restore();
    }
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
    const pop = f.pop || 1;   // (bursting open: drawn a little past their size, and back)
    f.glitterN = 0;
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.translate(x, y); ctx.scale(sd * pop, pop);
      wing(this.WING.hind, smoothstep((k - 0.18) / 0.82), sd > 0 ? 0.5 : 0.1);
      wing(this.WING.fore, smoothstep(k / 0.8), sd > 0 ? 0 : 0.6);
      f.glitterN += this.glitter(ctx, f, sd);
      ctx.restore();
    }
  },
  // One mote of glitter (the fairy dust's, and the glitter off its wings): a soft halo, a bright point, and on the bigger
  // ones a little cross of light (x, y, r: where and how big, in whatever units the drawing is in; col, a: colour, alpha)
  sparkle(ctx, x, y, r, col, a) {
    P_ell(ctx, x, y, r * 2.4, r * 2.4, rgba(col, a * 0.22)); P_ell(ctx, x, y, r, r, rgba(col, a));
    if (r > 0.02) { ctx.strokeStyle = rgba([255, 255, 255], a * 0.8); ctx.lineWidth = 0.006; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r * 3, y); ctx.lineTo(x + r * 3, y); ctx.moveTo(x, y - r * 3); ctx.lineTo(x, y + r * 3); ctx.stroke(); }
  },
  // The glitter thrown off its wings as they burst open (f.glit: seconds since; below 0, none): a small spray of motes off
  // the edges of each wing, in its colours, thrown outward and slowing, drifting down a little and twinkling as they fade,
  // gone in about a second. A little of it, not a second flash: each is tiny. With motion reduced, a third as many and
  // thrown less far; with flashes reduced, a third as many and none twinkles. In the frame of one side's wings (sd);
  // returns how many it drew
  GLITTER: null,
  glitter(ctx, f, sd) {
    const q = f.glit === undefined ? -1 : f.glit;
    if (q < 0 || q > 1.4) return 0;
    const G2 = this.GLITTER || (this.GLITTER = (() => {
      const rnd = mulberry32(4711), out = [], bez = (p, c, u) => { const v = 1 - u; return [v * v * v * p[0] + 3 * v * v * u * c[0] + 3 * v * u * u * c[2] + u * u * u * c[4], v * v * v * p[1] + 3 * v * v * u * c[1] + 3 * v * u * u * c[3] + u * u * u * c[5]]; };
      const cols = { fore: [[156, 222, 255], [190, 255, 220], [255, 240, 170], [255, 255, 255]], hind: [[255, 176, 214], [255, 226, 140], [255, 196, 150], [255, 255, 255]] };
      for (const name of ['fore', 'hind']) {
        const W = this.WING[name];
        for (let i = 0; i < 9; i++) {
          // a point on its outer edge (along the curves of its margin and the ones either side of it)
          const ci = clamp(W.margin - 1 + Math.floor(rnd() * 3), 0, W.curves.length - 1), p0 = ci ? W.curves[ci - 1].slice(4) : W.from, at = bez(p0, W.curves[ci], 0.1 + 0.8 * rnd());
          const dx = at[0] - W.mid[0], dy = at[1] - W.mid[1], d = Math.hypot(dx, dy) || 1, sp = 0.75 + 0.8 * rnd(), tw = (rnd() - 0.5) * 0.6;
          out.push({ x: at[0], y: at[1], vx: (dx / d) * sp - (dy / d) * tw * sp, vy: (dy / d) * sp + (dx / d) * tw * sp + 0.12, r: 0.012 + 0.022 * rnd() * rnd(), life: 0.8 + 0.5 * rnd(), ph: rnd() * TAU, rate: 9 + rnd() * 9, col: cols[name][Math.floor(rnd() * 4)], few: i % 3 === 0 });
        }
      }
      return out;
    })());
    const rm = !!f.still, steady = !!f.steady, e = (1 - Math.exp(-q * 3.2)) / 3.2 * (rm ? 0.45 : 1);
    let n = 0;
    for (const m of G2) {
      if ((rm || steady) && !m.few) continue;
      if (q > m.life) continue;
      const a = smoothstep(q / 0.05) * (1 - smoothstep((q - m.life * 0.35) / (m.life * 0.65))) * (steady ? 0.75 : 0.45 + 0.55 * Math.abs(Math.sin(q * m.rate + m.ph)));
      if (a < 0.02) continue;
      this.sparkle(ctx, m.x + m.vx * e, m.y + m.vy * e - 0.25 * q * q, m.r, m.col, a * 0.9);
      n++;
    }
    return n;
  },
  // The cloud of its dust as its wings beat (the tooth fairy's: night 12 draws it, and the Creature Lab), qd seconds
  // after it burst up, about where it stood (metres: x across, y up), wide and tall enough for all of it, wings and all:
  // it billows up round it as the wings sweep (dense seconds: then nothing behind it shows through), holds a moment, and
  // thins away (clear: from, to), in the time T gives (the night's), or CLOUD's.
  // It is nothing but soft puffs of glittering haze, of many sizes and of the wings' colours made pale, each solid in
  // its middle (or not at all) and fading out to nothing at its edge (puffOf: one drawn once for each colour and kept),
  // laid over one another (puffs, made once): the big ones at its heart (core), whose solid middles together cover all
  // of it at its height, so that nothing of it shows through; through them billows softly shadowed, lit and tinged, so
  // it is uneven all through; round them the billows of its edge, lighter, rolling outward and curling as it billows;
  // and wisps drawn out from its edge, trailing off. Each comes up a moment after the one inside it as it bursts up,
  // and thins away in its own time, the edge first, so that it breaks up and drifts apart as it goes. With motion
  // reduced (rm) it hardly drifts and nothing curls; with flashes reduced (steady) nothing in it flickers.
  // (It is all soft, so it is drawn small, on a canvas of its own kept for it, CLOUD.px a metre over all the room it can
  // drift out into (box), and laid over the view in one: a few dozen puffs drawn full size over the view each frame
  // would cost far more. It moves slowly, so it is drawn again only every CLOUD.every seconds.)
  CLOUD: { y: 1.5, dense: 0.2, clear: [0.6, 3.05], px: 24, box: [-7, -0.5, 14, 6.5], every: 1 / 30 },
  puffOf(col, solid) {   // (a puff: solid out to `solid` of its radius, and fading smoothly to nothing)
    const P = this.puffCache || (this.puffCache = {}), key = col.join() + '/' + solid;
    if (P[key]) return P[key];
    const N = 64, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const g = cv.getContext('2d'), gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    gr.addColorStop(0, rgba(col, 1)); if (solid > 0) gr.addColorStop(solid, rgba(col, 1));
    for (let i = 1; i <= 8; i++) { const u = i / 8, a = Math.pow(1 - smoothstep(u), 1.6); gr.addColorStop(solid + (1 - solid) * u, rgba(col, a)); }
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
    return (P[key] = cv);
  },
  puffs() {
    if (this.puffList) return this.puffList;
    const rnd = mulberry32(4421), out = [], Y = this.CLOUD.y;
    const pale = [[212, 204, 238], [230, 212, 226], [202, 212, 240], [226, 220, 210], [208, 226, 230], [220, 206, 240]];
    const tint = [[214, 196, 250], [255, 214, 232], [186, 222, 255], [255, 232, 196], [200, 246, 232], [232, 200, 255]];
    // its heart: three rows of big puffs, solid through the middle, from the floor to over its wings
    [[0.85, [-1.4, -0.5, 0.45, 1.35]], [1.6, [-1.35, -0.45, 0.45, 1.4]], [2.35, [-1.3, -0.4, 0.5, 1.3]]].forEach(([y, xs], j) => xs.forEach((x, i) => {
      out.push({ kind: 'core', x: x + (rnd() - 0.5) * 0.2, y: y + (rnd() - 0.5) * 0.15, r: 1.35 + rnd() * 0.3, solid: 0.52, col: pale[(i + j * 2) % pale.length], a: 1,
        dx: x * 0.05, dy: 0.06 + rnd() * 0.06, curl: 0.06 + rnd() * 0.05, w: 0.5 + rnd() * 0.4, ph: rnd() * TAU, at: 0.02 * Math.hypot(x, y - Y), off: rnd() * 0.8, stretch: 1, rot: 0 });
    }));
    // through it, billows: softly shadowed, lit, and tinged with the wings' colours
    const shade = [[150, 140, 192], [172, 160, 206], [140, 150, 196]], lit = [[255, 248, 255], [250, 252, 255]];
    for (let i = 0; i < 26; i++) {
      const kd = i % 3, x = (rnd() * 2 - 1) * 2.0, y = 0.6 + rnd() * 2.1;
      out.push({ kind: 'body', x, y, r: 0.35 + rnd() * 0.5, solid: kd === 0 ? 0.25 : 0, col: kd === 0 ? shade[i % shade.length] : kd === 1 ? lit[i % lit.length] : tint[i % tint.length], a: kd === 0 ? 0.3 + rnd() * 0.2 : 0.22 + rnd() * 0.18,
        dx: x * 0.08, dy: 0.05 + rnd() * 0.08, curl: 0.12 + rnd() * 0.1, w: 0.5 + rnd() * 0.5, ph: rnd() * TAU, at: 0.03 + 0.05 * rnd(), off: 0.1 + rnd() * 0.7, stretch: 1, rot: 0 });
    }
    // its billowing edge, all the way round, and wisps trailing off it
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * TAU + (rnd() - 0.5) * 0.3, e = 0.85 + rnd() * 0.35, ca = Math.cos(a), sa = Math.sin(a);
      out.push({ kind: 'edge', x: ca * 2.35 * e, y: Y + sa * 1.45 * e, r: 0.4 + rnd() * 0.5, solid: 0.38, col: i % 3 ? pale[i % pale.length] : tint[i % tint.length], a: 0.55 + rnd() * 0.35,
        dx: ca * (0.18 + rnd() * 0.22), dy: sa * 0.12 + 0.07, curl: 0.1 + rnd() * 0.1, w: 0.6 + rnd() * 0.6, ph: rnd() * TAU, at: 0.05 + 0.08 * rnd(), off: -0.2 + rnd() * 0.6, stretch: 1, rot: 0 });
    }
    for (let i = 0; i < 12; i++) {
      const a = rnd() * TAU, ca = Math.cos(a), sa = Math.sin(a);
      out.push({ kind: 'wisp', x: ca * 2.7, y: Y + sa * 1.7, r: 0.38 + rnd() * 0.3, solid: 0, col: tint[i % tint.length], a: 0.22 + rnd() * 0.2,
        dx: ca * (0.35 + rnd() * 0.3), dy: sa * 0.18 + 0.1, curl: 0.16 + rnd() * 0.1, w: 0.4 + rnd() * 0.4, ph: rnd() * TAU, at: 0.12 + 0.1 * rnd(), off: -0.6 + rnd() * 0.5, stretch: 2.2 + rnd(), rot: a + Math.PI / 2 + (rnd() - 0.5) * 0.6 });
    }
    return (this.puffList = out);
  },
  dustCloud(out, qd, rm, steady, T) {
    if (qd < 0) return;
    const C = this.CLOUD, B = C.box, key = rm + '/' + steady;
    if (!this.cloudCv) { this.cloudCv = document.createElement('canvas'); this.cloudCv.width = B[2] * C.px; this.cloudCv.height = B[3] * C.px; }
    const at = this.cloudAt;
    if (!at || at.key !== key || qd < at.qd || qd - at.qd >= C.every - 1e-6) { this.cloudAt = { qd, key }; this.puffsOn(this.cloudCv, qd, rm, steady, T || C); }
    out.save(); out.imageSmoothingEnabled = true; out.drawImage(this.cloudCv, B[0], B[1], B[2], B[3]); out.restore();
  },
  puffsOn(cv, qd, rm, steady, T) {
    const C = this.CLOUD, B = C.box, S = C.px, ctx = cv.getContext('2d'), c0 = T.clear[0], cl = T.clear[1] - T.clear[0], drift = Math.max(0, qd - T.dense) * (rm ? 0.3 : 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of this.puffs()) {
      // up out of the middle as it bursts (each a moment after the ones inside it), and thinning away in its own time
      const up = smoothstep((qd - p.at) / Math.max(0.12, T.dense - p.at)), thin = 1 - smoothstep((qd - c0 - p.off * cl * 0.5) / (cl * (p.kind === 'core' ? 0.9 : 0.75)));
      const a = p.a * up * thin * (steady || p.kind === 'core' ? 1 : 0.88 + 0.12 * Math.sin(qd * p.w * 2.4 + p.ph));
      if (a <= 0.004) continue;
      const grow = lerp(0.5, 1, up) * (1 + (p.kind === 'core' ? 0.05 : 0.14) * drift), cu = rm ? 0 : p.curl * Math.min(1, qd / 0.6);
      const x = p.x * lerp(0.6, 1, up) + p.dx * drift + cu * Math.cos(qd * p.w + p.ph), y = C.y + (p.y - C.y) * lerp(0.6, 1, up) + p.dy * drift + cu * Math.sin(qd * p.w * 0.8 + p.ph);
      const r = p.r * grow;
      // (metres, y up the rows: laid over the view the right way up)
      ctx.globalAlpha = Math.min(1, a); ctx.setTransform(S, 0, 0, S, (x - B[0]) * S, (y - B[1]) * S);
      if (p.stretch !== 1) { ctx.rotate(p.rot + (rm ? 0 : 0.15 * Math.sin(qd * p.w + p.ph))); ctx.scale(p.stretch, 1); }
      ctx.drawImage(this.puffOf(p.col, p.solid), -r, -r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
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
