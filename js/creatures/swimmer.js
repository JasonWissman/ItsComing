'use strict';
// The swimmer: a drowned head, mossy and wet, only the crown and the staring eyes above the water.
// It surfaces for a few seconds, slow and visible, then goes under (unseen by definition, and fast)
// and comes up closer with a splash panned to its lane. Its feet are at the water line (lane.y).
// The Boathouse's easter egg throws it a life ring (js/levels/night06.js): c.ringPend while it is under on its way to where
// the ring will be (c.ringD metres off; c.ringReady once the ring is on the water there), then c.ringOn: it has come up
// through it (c.ringT when, on its own clock), and from then on it does not go under: it comes on steadily, paddling
// (c.padGait its paws), at the pace its going under and coming up came to, and wears the ring in every pose after.
CREATURES.swimmer = {
  name: 'the swimmer', h: 0.5, w: 0.6, faceY: 0.06, stepRate: 0, catchDist: 1.6, sound: null,
  // (pose: it stamps the moment the lunge began, c.burstT, on its own clock, so the water it comes up out of goes on moving
  // once the lunge itself is done, and how high the lunge lifts it, c.burstY, as game.js's 'dying' lifts it: to eye level)
  death: {
    delay: 0.2, dur: 0.45, sting: 'stingWet',
    pose(c, k) { if (k > 0 && c.burstT === undefined) { const CR = CREATURES.swimmer; c.burstT = c.t - k * CR.death.dur; c.burstY = G.L.eyeH - CR.faceY - c.pos().y; } },
  },
  voice: { kind: 'gurgle', every: [4, 9] },
  init(c) { c.mode = 'up'; c.modeT = -1.0; c.upFor = 3.2; c.downFor = 2 + c.rand() * 2; c.diveDist = c.dist; c.diveT = 0; c.surfaced = 0; },
  hidden(c) { return c.mode === 'down' && !c.lunge && !c.frozen && !G.L.won; },
  // a night can send it sideways, swimming (The Boathouse's way round from a shut door to an open one): c.runLat metres
  // to its right, c.runPose on, c.runDir +1 swimming to the right of the view and -1 to the left, c.runGait its stroke
  lateral(c) { return c.runLat || 0; },
  speedMult(c, dt, seen) {
    if (c.frozen || c.dead || G.L.won) { c.mode = 'up'; return 0; }
    c.modeT += dt;
    const pan = Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
    if (c.ringOn) {
      // in the ring: it looks at it a moment, then paddles in. Its pace is what a whole turn of its usual round comes to (up
      // for RING_UP seconds at 0.55, under for RING_DOWN at 2.5 and never seen there), so it arrives when it would have:
      // the game multiplies this by whether it is seen, as it does the surfaced share of the usual round
      const g0 = c.padGait || 0, looking = c.t - c.ringT < this.RING_LOOK;
      c.padGait = g0 + dt * (c.moving ? 9 : 5.5);
      if (!looking && c.mode === 'up' && Math.floor(c.padGait / Math.PI) !== Math.floor(g0 / Math.PI)) AUDIO.sfx('paddle', pan, true);   // a paw going in
      if (looking) return 0;
      const gaze = (seen ? c.seenMult : c.unseenMult) || 1;
      return (this.RING_UP * 0.55 + this.RING_DOWN * 2.5 * c.unseenMult / gaze) / (this.RING_UP + this.RING_DOWN);
    }
    if (c.ringPend) {
      // the ring is on its way: under, as fast as ever, to where it will float, and up through it once it is there
      const there = c.dist <= c.ringD + 0.01 || c.modeT > c.downFor + 2;
      c.mode = 'down';
      if (there && c.ringReady && c.modeT > c.downFor) { c.ringPend = false; c.ringOn = true; c.ringT = c.t; c.padGait = 0; c.mode = 'up'; c.modeT = 0; c.surfaced = G.L.t; AUDIO.sfx('splash', pan); return 0; }
      return there ? 0 : 2.5;
    }
    if (c.mode === 'up' && c.modeT > c.upFor) { c.mode = 'down'; c.modeT = 0; c.downFor = 2 + c.rand() * 2; c.diveDist = c.dist; c.diveT = G.L.t; AUDIO.sfx('dive', pan); }
    else if (c.mode === 'down' && c.modeT > c.downFor) { c.mode = 'up'; c.modeT = 0; c.upFor = 2.6 + c.rand() * 0.9; c.surfaced = G.L.t; AUDIO.sfx('splash', pan); }
    return c.mode === 'down' ? 2.5 : 0.55;
  },
  // in the ring: how long it looks at it before it paddles on (s), and the mean lengths of its usual turns up and under
  // (init and speedMult above: up 2.6 to 3.5 s, under 2 to 4), which set its steady pace
  RING_LOOK: 0.6, RING_UP: 3.05, RING_DOWN: 3,
  // the ring as it is worn and as it floats: the radius of the hoop (to the middle of its tube) and of the tube, in
  // metres, and how open it shows from where you stand, d metres off (flat on the water, seen from above: never so
  // nearly edge on that it stops reading as a ring)
  // RING_H: how much higher it rides in the ring than it shows without one; RING_Y: where the ring sits on it, under the
  // arms, measured as the head and the body are drawn (so in the ring the hoop floats just above the water line)
  RING_R: 0.3, RING_TUBE: 0.075, RING_H: 0.33, RING_Y: -0.3,
  ringK(d) { return clamp(1.8 / Math.max(d, 0.1), 0.22, 0.5); },
  draw(ctx, c, P) {
    if (c.mode === 'down' && !c.lunge && !G.L.won) return;
    if (c.runPose && !c.lunge) { this.drawSwim(ctx, c, P); return; }
    if (c.ringOn && !c.lunge) { this.drawRinged(ctx, c, P); return; }
    const t = c.t, near = clamp(1 - c.dist / 10, 0, 1), lunge = c.lunge || 0;
    const ring = [150, 165, 175];
    const fresh = clamp(1 - (G.L.t - c.surfaced) / 1.2, 0, 1);
    // it rises a little as it closes, and all the way out when it lunges; the water line is y = 0 until the lunge lifts the
    // whole drawing toward the eye (c.yOff): then it is y = -c.yOff, and the rings stay down there on the water and fade
    // (in the life ring it rode higher, held up by it: the lunge begins from there, the ring round its chest)
    const ringed = !!c.ringOn, rk = ringed ? lerp(this.ringK(c.dist), 0.16, smoothstep(lunge)) : 0;
    const rise = (0.02 + near * 0.08 + Math.sin(t * 1.1) * 0.015) * (1 - lunge) + (ringed ? this.RING_H * (1 - smoothstep(lunge)) : 0);   // the death lift is the game's: the face ends at eye height
    const wl = -(c.yOff || 0), calm = 1 - lunge;
    // the seconds since the lunge began (stamped by death.pose; drawn without it, the lunge's own share of death.dur)
    const s = lunge > 0 ? (c.burstT === undefined ? lunge * this.death.dur : Math.max(0, c.t - c.burstT)) : 0;
    for (let i = 0; i < 3; i++) { const k = (fresh + i * 0.33 + t * 0.12) % 1; P_ell(ctx, 0, wl, 0.26 + k * 0.55, 0.04 + k * 0.05, P.cola(ring, 0.32 * (1 - k) * calm)); }
    const lift = c.burstY === undefined ? G.L.eyeH - this.faceY : c.burstY;   // how high the lunge lifts it all told
    if (lunge > 0) this.burst(ctx, P, wl, s, lift, false);   // the water it bursts up out of: the most of it behind it
    ctx.save(); ctx.beginPath(); ctx.rect(-4, wl, 8, 4 - wl); ctx.clip(); // nothing below the water line is drawn: the water shows there
    ctx.translate(0, rise);
    if (ringed) this.lifeRing(ctx, P, 0, this.RING_Y, this.RING_R, rk, 0.3, 'back', this.RING_TUBE);
    if (lunge > 0) this.drawBody(ctx, P, lunge, t, ringed ? () => this.lifeRing(ctx, P, 0, this.RING_Y, this.RING_R, rk, 0.3, 'front', this.RING_TUBE) : null);   // what comes up out of the water under the head
    this.head(ctx, P, t, near, lunge);
    ctx.restore();
    // drips off the chin and the weed, and the ring where the water meets it
    for (let i = 0; i < 3; i++) { const k = (t * 0.9 + i * 0.37) % 1, y = rise + 0.05 - k * 0.12; if (y > wl) P_ell(ctx, -0.1 + i * 0.1, y, 0.008, 0.014, P.cola([200, 214, 210], 0.6 * (1 - k))); }
    if (calm > 0.01) P_ell(ctx, 0, wl, 0.24, 0.025, P.cola(ring, 0.5 * calm));
    if (lunge > 0) { this.burst(ctx, P, wl, s, lift, true); this.shed(ctx, P, wl, lunge, s, t); }   // the rest of the spray in front of it, and the water pouring off it
  },
  // the head, as it shows above the water: near, how close it has come (0..1); lunge, its death lunge (0..1); look, where
  // it is looking, [across, down] (-1..1: the face turned and tipped that way, as it looks down at the ring it finds itself
  // in), and with it a small round mouth
  head(ctx, P, t, near, lunge, look) {
    const skin = P.col([146, 156, 148]), skinD = P.col([98, 110, 102]), socket = P.col([36, 40, 38]), moss = P.col([52, 76, 40]), mossL = P.col([78, 102, 56]);
    const weed = P.col([18, 26, 18]), eye = P.col([196, 204, 192]), mouth = P.col([10, 8, 8]), wet = P.cola([230, 240, 235], 0.3);
    const lx = look ? look[0] : 0, ly = look ? look[1] : 0, fx = lx * 0.05, fy = -ly * 0.075;
    // the head: a long drowned skull, grey and wet, moss grown over the crown in patches
    P_ell(ctx, 0, 0.1, 0.17, 0.27, skin);
    P_ell(ctx, 0.06, 0.05, 0.1, 0.22, skinD);
    for (const [x, y, rx, ry, c2] of [[0, 0.33, 0.12, 0.05, moss], [-0.09, 0.28, 0.07, 0.05, mossL], [0.08, 0.3, 0.07, 0.04, moss], [0.13, 0.19, 0.035, 0.06, mossL], [-0.14, 0.14, 0.03, 0.07, moss], [0.02, 0.25, 0.04, 0.025, mossL]]) P_ell(ctx, x, y, rx, ry, c2);
    P_ell(ctx, -0.07, 0.27, 0.04, 0.015, wet, -0.4);
    // sunken sockets just above the water, and in them small blank milky eyes that do not blink
    const eyeY = 0.045 + lunge * 0.02 + fy, open = 0.016 + near * 0.008 + lunge * 0.014;
    for (const s2 of [-1, 1]) { P_ell(ctx, fx + s2 * 0.068, eyeY + 0.004, 0.05, 0.034, socket); P_ell(ctx, fx * 1.25 + s2 * 0.068, eyeY - Math.max(0, ly) * 0.006, 0.03, open, eye); }
    P_line(ctx, fx * 1.3, eyeY - 0.012, fx * 1.5 + 0.006, eyeY - 0.075, 0.026, skinD);
    if (look && look[2] > 0.01) P_ell(ctx, fx * 1.5, eyeY - 0.125, 0.022 * look[2], 0.03 * look[2], mouth);
    if (lunge > 0) P_ell(ctx, 0, -0.14, 0.05 + lunge * 0.05, 0.03 + lunge * 0.11, mouth);
    // weed hangs straight down from the crown like wet hair, parted over the eyes
    for (let i = 0; i < 13; i++) {
      const x = -0.16 + i * 0.0267; if (Math.abs(x) > 0.035 && Math.abs(Math.abs(x) - 0.075) < 0.03) continue;
      const l = 0.2 + ((i * 37) % 11) / 11 * 0.16 + lunge * 0.15, sway = Math.sin(t * 0.8 + i * 1.7) * 0.012;
      P_limb(ctx, [[x * 0.9, 0.34], [x + sway, 0.34 - l * 0.5], [x * 1.05 + sway * 2, 0.34 - l]], 0.011, weed);
    }
  },
  // A life ring: a fat hoop, white with four red bands, a round tube seen at a slant. x, y its middle; rx its radius, to
  // the middle of the tube; k how open it shows (1 face on, 0 edge on; over 1, a hoop standing on edge seen from its side);
  // spin, the bands' turn round it; part, 'back' (the far half only), 'front' (the near half) or neither (all of it, far
  // half first); tube, the tube's radius. Stroked along the hoop at the tube's width, which is how a tube shows from any side
  lifeRing(ctx, P, x, y, rx, k, spin, part, tube) {
    const w = (tube || rx * 0.25) * 2, ry = Math.max(rx * k, 0.0001), Q = Math.PI / 2, sp = ((spin % Q) + Q) % Q;
    const cols = [[P.col([150, 150, 146]), P.col([120, 30, 28])], [P.col([230, 226, 214]), P.col([196, 46, 38])]];   // [white, red]: in its own shade underneath, lit on top
    const arc = (a0, a1, col, dy, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(x, y + dy, rx, ry, 0, a0, a1); ctx.stroke(); };
    ctx.lineCap = 'butt';
    for (const half of part ? [part] : ['back', 'front']) {
      const h0 = half === 'back' ? 0 : Math.PI, h1 = h0 + Math.PI;
      for (let pass = 0; pass < 2; pass++) {
        const dy = pass ? w * 0.13 : 0, lw = pass ? w * 0.7 : w;
        arc(h0, h1, cols[pass][0], dy, lw);
        for (let j = -1; j < 5; j++) { const a0 = Math.max(h0, sp + j * Q), a1 = Math.min(h1, sp + j * Q + Q * 0.4); if (a1 > a0) arc(a0, a1, cols[pass][1], dy, lw); }
      }
    }
  },
  // In the life ring. It comes up through it from under the water, the head and both arms up through the hole, the ring
  // round its chest under the arms, the water it came up through thrown up round it and streaming off it; it holds its
  // hands up out of the way and looks down at the ring, one side and the other, and then at you (RING_LOOK seconds: it
  // does not move on meanwhile); then the arms come down over the front of the ring and it paddles in like a dog, the head
  // held up out of the water, the hands going round one after the other in small quick circles in front of the ring, a
  // little splash where each goes in, the whole of it bobbing. q is the seconds since it came up; with reduced motion the
  // bobbing and the splashes are gentler, the timing the same.
  drawRinged(ctx, c, P) {
    const t = c.t, q = Math.max(0, t - (c.ringT || 0)), g = c.padGait || 0, h = this.hash, soft = SAVE.data.settings.reducedMotion ? 0.45 : 1;
    const R = this.RING_R, TB = this.RING_TUBE, k = this.ringK(c.dist);
    const arm = P.col([150, 160, 150]), armD = P.col([96, 108, 98]), mass = P.col([26, 40, 22]), dark = P.col([12, 20, 11]), mid = P.col([40, 60, 30]);
    const rip = [150, 165, 175], foam = [214, 224, 228];
    const pad = smoothstep((q - this.RING_LOOK) / 0.3);   // 0 looking at the ring, 1 paddling
    // up through the hole from under the water, a little too far, and settling; then the bob of its paddling
    const pop = -0.8 * (1 - easeOut(q / 0.17)) + 0.07 * soft * Math.sin(Math.PI * clamp(q / 0.45, 0, 1));
    const bob = (Math.sin(g * 2) * 0.026 * pad + Math.sin(t * 1.3) * 0.012) * soft;
    const yR = this.RING_H + this.RING_Y + bob * 0.7 + 0.05 * soft * Math.sin(Math.PI * clamp(q / 0.4, 0, 1)) * Math.exp(-q * 3), yB = pop + bob;   // the ring, knocked up as it comes through, and the body
    // where it looks: down at the ring to one side, then the other, then up at you; paddling, the chin held up
    const dn = smoothstep((q - 0.16) / 0.1) - smoothstep((q - 0.6) / 0.12);
    const look = [-0.9 * smoothstep((q - 0.16) / 0.1) + 1.8 * smoothstep((q - 0.36) / 0.1) - 0.9 * smoothstep((q - 0.6) / 0.12), dn - 0.3 * pad, dn];
    // the water round it: rings going out, and what it threw up coming through (most of it behind it)
    for (let i = 0; i < 3; i++) { const u = (i * 0.33 + t * (0.12 + 0.2 * pad)) % 1; P_ell(ctx, 0, 0, R + 0.1 + u * 0.6, (R + 0.1 + u * 0.6) * k * 0.9, P.cola(rip, 0.3 * (1 - u))); }
    const burst = front => { if (q < 1.4) { ctx.save(); ctx.scale(0.62 * (0.7 + 0.3 * soft), 0.62 * (0.55 + 0.45 * soft)); this.burst(ctx, P, 0, q, 0.9, front); ctx.restore(); } };
    burst(false);
    this.lifeRing(ctx, P, 0, yR, R, k, 0.3, 'back', TB);
    ctx.save(); ctx.beginPath(); ctx.rect(-4, 0, 8, 4); ctx.clip();   // what is in the hole, from the water up
    ctx.translate(0, yB);
    // the shoulders, a mass of wet weed filling the hole, a few strands of it hanging over the ring behind
    P_poly(ctx, [[-0.21, -0.2], [-0.23, 0.1], [-0.15, 0.2], [-0.06, 0.26], [0.06, 0.26], [0.15, 0.2], [0.23, 0.1], [0.21, -0.2]], mass);
    for (let i = 0; i < 6; i++) P_ell(ctx, (h(i, 91) - 0.5) * 0.34, 0.02 + h(i, 92) * 0.16, 0.04 + 0.03 * h(i, 93), 0.03 + 0.02 * h(i, 94), i % 2 ? dark : mid, (h(i, 95) - 0.5));
    // the arms: up through the hole beside the head, then held up and out of the way while it looks (the hands hanging
    // from the wrists); paddling, they come forward over the front of the ring, the elbows resting on it, and the hands
    // go round one after the other in small quick circles in the water before it (drawn lower: it is nearer you)
    const yW = -(R + TB + 0.1) * k - yB, out = smoothstep(q / 0.26);   // the water the hands go into; and the arms spreading once they are through
    const arms = [-1, 1].map(sd => {
      const ph = g + (sd > 0 ? 0 : Math.PI), sh = [sd * 0.19, 0.16];
      const el = [sd * lerp(lerp(0.2, 0.42, out), 0.27, pad), lerp(0.22 + 0.02 * Math.sin(t * 9 + sd), yR - yB - R * k * 0.55 + TB * 0.6, pad)];
      const hd = [sd * lerp(lerp(0.16, 0.5, out), 0.15 + 0.06 * Math.cos(ph), pad), lerp(0.5 + 0.015 * Math.sin(t * 11 + sd * 2), yW + 0.1 + 0.09 * Math.sin(ph), pad)];
      return { sd, ph, sh, el, hd };
    });
    ctx.save(); ctx.translate(0, this.RING_H); ctx.rotate(-look[0] * 0.1 * (1 - pad) + Math.sin(g) * 0.075 * pad * soft); this.head(ctx, P, t, 0.5, 0, look); ctx.restore();
    ctx.restore();
    this.lifeRing(ctx, P, 0, yR, R, k, 0.3, 'front', TB);
    P_ell(ctx, 0, yR - R * k - TB * 0.72, R * 0.92, 0.02, P.cola(foam, 0.34 + 0.12 * Math.sin(t * 5)));   // the water against the front of it
    // (over the ring: nothing of them shows under the water they came up out of, or the water they paddle in)
    ctx.save(); ctx.translate(0, yB);
    ctx.beginPath(); ctx.rect(-4, pad > 0.5 ? yW : -yB, 8, 6); ctx.clip();
    for (const a of arms) {
      const up = 1 - pad, hx = a.hd[0], hy = a.hd[1];
      P_limb(ctx, [a.sh, a.el], 0.058, armD);
      P_limb(ctx, [a.sh, [lerp(a.sh[0], a.el[0], 0.55), lerp(a.sh[1], a.el[1], 0.55) + 0.015]], 0.052, mass);   // (weed draped on the upper arm)
      P_limb(ctx, [a.el, a.hd], 0.046, arm);
      // the hand: a small palm, the fingers hanging from it (up, they hang off the limp wrist; paddling, they claw down at the water)
      P_ell(ctx, hx, hy - 0.012, 0.054, 0.046, arm);
      fingers(ctx, hx, hy - 0.035, -Math.PI / 2 + a.sd * 0.25 * up + 0.35 * Math.cos(a.ph) * pad * a.sd, 0.27, 0.1, 0.022, arm);
    }
    ctx.restore();
    // a little splash where each hand goes in, one after the other
    if (pad > 0.5) for (const a of arms) {
      const s = ((((a.ph - Math.PI * 4 / 3) % TAU) + TAU) % TAU) / 2.8;   // from when it comes down onto the water
      if (s > 1) continue;
      const x = a.sd * 0.14, y = -(R + TB + 0.1) * k;
      P_ell(ctx, x, y, 0.07 + s * 0.13, 0.016 + s * 0.016, P.cola(foam, 0.7 * (1 - s)));
      for (let i = 0; i < 7; i++) P_ell(ctx, x + (i - 3) * 0.04 * (1 + s), y + Math.sin(s * Math.PI) * (0.05 + (i % 3) * 0.045) * soft, 0.015, 0.021, P.cola(foam, 0.9 * (1 - s)));
    }
    // the water streaming off it for a while after it comes up: off the chin, the hands and the elbows, and off the ring
    const wet = 1 - smoothstep((q - 0.9) / 1.2);
    if (wet > 0.01) for (let i = 0; i < 14; i++) {
      const a = arms[i % 2], src = i % 7, x0 = src < 2 ? a.hd[0] : src < 4 ? a.el[0] : src < 5 ? (h(i, 96) - 0.5) * 0.2 : (h(i, 96) - 0.5) * 2 * R;
      const y0 = (src < 2 ? a.hd[1] - 0.08 : src < 4 ? a.el[1] - 0.03 : src < 5 ? this.RING_H - 0.18 : yR - yB - TB * 0.5) + yB;
      const ph = (q * (1.5 + h(i, 97)) + h(i, 98)) % 1, y = y0 - 0.5 * ph * ph - 0.1 * ph, low = src >= 5 ? yR - R * k - TB : 0;
      if (y < Math.min(low, 0) - 0.02) continue;
      P_ell(ctx, x0, y, 0.008, 0.014 + 0.012 * ph, P.cola([218, 230, 236], 0.75 * (1 - ph) * wet));
    }
    burst(true);
  },
  // a steady scatter for the splash: the same drop does the same thing every frame
  hash(i, q) { const x = Math.sin(i * 12.9898 + q * 78.233) * 43758.5453; return x - Math.floor(x); },
  // The water it bursts up out of, as the lighthouse's sea takes the thing that falls into it (night07, s.splash), seen
  // from the side: a heap of white where it breaks the surface, thrown up and collapsing; the foam spreading from it in
  // rings on the water; and the spray, drops dragged up after it out of the water and flung out, each on its own arc,
  // rising, slowing and falling back, gone where it meets the water again. wl is the water line, s the seconds since the
  // lunge began. Drawn twice: behind the thing (front false: the heap, the foam, most of the spray) and in front of it
  // (a quarter of the drops, and the white at its foot).
  burst(ctx, P, wl, s, lift, front) {
    const h = this.hash, GR = 9.8, dur = this.death.dur, up = tt => lift * smoothstep(tt / dur), upV = tt => { const u = clamp(tt / dur, 0, 1); return lift * 6 * u * (1 - u) / dur; };
    if (!front) {
      // the foam: two rings spreading on the water and fading, the second after the first, their edges ragged
      for (const [d0, a0] of [[0, 0.55], [0.18, 0.4]]) {
        const q = s - d0; if (q <= 0) continue;
        const r = 0.3 + 1.3 * easeOut(Math.min(1, q / 1.3)), a = a0 * (1 - smoothstep((q - 0.25) / 1.1));
        if (a < 0.01) continue;
        const col = P.cola([196, 210, 216], a);
        for (let i = 0; i < 40; i++) {
          if (h(i, 20 + d0 * 10) < 0.15) continue;   // gaps in it
          const th0 = i / 40 * TAU, th1 = (i + 1) / 40 * TAU, w = r * (1 + 0.05 * Math.sin(i * 1.7 + q * 5));
          P_line(ctx, Math.cos(th0) * w, wl + Math.sin(th0) * w * 0.16, Math.cos(th1) * w, wl + Math.sin(th1) * w * 0.16, 0.022 * (1 - 0.5 * Math.min(1, q)) * (0.5 + h(i, 22)), col);
        }
      }
    }
    // the heap of white where it came up: thrown up at once and falling back into itself, its top torn into lobes
    const hk = Math.min(1, s / 0.55), hh = 0.55 * Math.sin(Math.PI * hk) * (1 - 0.4 * hk), ha = 0.85 * (1 - smoothstep((s - 0.15) / 0.75));
    if (ha > 0.01 && hh > 0.01) {
      const wide = (0.3 + 0.45 * easeOut(Math.min(1, s / 0.4))) * (front ? 0.85 : 1), pts = [[-wide, wl]];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12, x = lerp(-wide, wide, u), lobe = 0.55 + 0.45 * h(i, 21) + 0.12 * Math.sin(s * 14 + i * 2.1);
        pts.push([x * (1 + 0.15 * hk), wl + (front ? 0.35 : 1) * hh * Math.pow(Math.sin(Math.PI * u), 0.6) * lobe]);
      }
      pts.push([wide, wl]);
      P_poly(ctx, pts, P.cola(front ? [228, 236, 240] : [206, 220, 228], ha * (front ? 0.75 : 0.5)));
    }
    // the spray: most of it dragged up after it as fast as it comes and flung out, a few jets straight up past its head;
    // each drop drawn out along its path (where it was a moment ago to where it is), so it streaks while it flies fast
    // and rounds into a bead as it slows at the top and turns to fall
    for (let i = 0; i < 48; i++) {
      if ((i % 4 === 0) !== front) continue;
      const jet = i % 12 === 4, side = h(i, 1) * 2 - 1, q = s - h(i, 2) * 0.22;
      if (q <= 0) continue;
      const x0 = side * (0.08 + 0.22 * h(i, 3)), vx = jet ? side * 0.2 : side * (0.3 + 1.6 * h(i, 4)), vy = jet ? 7 + 1.5 * h(i, 5) : 2.5 + 4.5 * h(i, 6);
      const pt = tt => { const u = Math.max(0, tt); return [x0 + vx * u, wl + vy * u - GR * u * u / 2]; };
      const p1 = pt(q); if (p1[1] < wl) continue;
      const a = 0.75 * (1 - smoothstep((q - 0.5) / 0.6)), r = jet ? 0.011 : 0.003 + 0.009 * h(i, 7);
      if (a < 0.02) continue;
      const p0 = pt(q - 0.014);
      P_line(ctx, p0[0], p0[1], p1[0], p1[1], r * 2, P.cola([206, 222, 232], a * 0.6)); P_ell(ctx, p1[0], p1[1], r * 0.55, r * 0.55, P.cola([240, 246, 248], a));   // clear water, a glint in it
      if (i % 3 === 1) { const p2 = pt(q - 0.07); P_ell(ctx, p2[0] + side * 0.012, p2[1], r * 0.6, r * 0.7, P.cola([226, 236, 240], a * 0.6)); }   // a smaller drop it shed behind it
    }
    // and the water flung off it as it comes: drops leaving its head and shoulders at the speed it rises and thrown out,
    // flying on up past it as it slows at your face, and falling away (each in the water's own frame: launched at t0 from
    // where that point of it was then, drawn where it is now less how far it has risen since)
    for (let i = 0; i < 36; i++) {
      if ((i % 3 === 0) !== front) continue;
      const t0 = 0.04 + 0.34 * h(i, 81), dt = s - t0;
      if (dt <= 0) continue;
      const side = h(i, 82) < 0.5 ? -1 : 1, x0 = side * (0.06 + 0.36 * h(i, 83)), y0 = lerp(-0.25, 0.32, h(i, 84)) - 0.3 * Math.max(0, Math.abs(x0) - 0.17);
      const vx = side * (0.4 + 1.6 * h(i, 85)), vy = upV(t0) * (0.75 + 0.35 * h(i, 86)) + 0.4 + 1.6 * h(i, 87);
      const at = d => [x0 + vx * d, y0 + up(t0) + vy * d - GR * d * d / 2];   // (x, height above the water)
      const p1 = at(dt); if (p1[1] < 0) continue;
      const a = 0.75 * (1 - smoothstep((dt - 0.35) / 0.5)), r = 0.003 + 0.009 * h(i, 88);
      if (a < 0.02) continue;
      const p0 = at(Math.max(0, dt - 0.014));
      P_line(ctx, p0[0], p0[1] + wl, p1[0], p1[1] + wl, r * 2, P.cola([206, 222, 232], a * 0.6)); P_ell(ctx, p1[0], p1[1] + wl, r * 0.55, r * 0.55, P.cola([240, 246, 248], a));
    }
  },
  // the water coming up with it and pouring off it: runnels sliding down over its face and off its shoulders, and drops
  // falling off its chin and its jaw, each falling away faster than it rises, so it streams down it all the while it comes
  // up (k the lunge, s its seconds)
  shed(ctx, P, wl, k, s, t) {
    const h = this.hash;
    for (let i = 0; i < 16; i++) {
      const head = i < 6, x = head ? (h(i, 31) - 0.5) * 0.24 : Math.sign(h(i, 35) - 0.5) * (0.16 + 0.26 * h(i, 31));
      const y0 = head ? 0.3 - 0.06 * h(i, 32) : -0.1 - 0.25 * (Math.abs(x) - 0.16) - 0.08 * h(i, 32);
      const ph = (s * (head ? 1.8 : 2.4) + h(i, 33)) % 1, y = y0 - ph * (head ? 0.42 : 0.6), len = 0.08 + 0.1 * h(i, 34), wob = Math.sin(t * 4 + i * 2.3) * 0.006;
      if (y - len < wl) continue;
      P_limb(ctx, [[x, y], [x + wob, y - len * 0.5], [x - wob * 0.5, y - len]], head ? 0.007 : 0.011, P.cola([206, 222, 230], (head ? 0.3 : 0.36) * Math.sin(Math.PI * ph)));
    }
    for (let i = 0; i < 12; i++) {
      const x = i < 5 ? (h(i, 41) - 0.5) * 0.14 : Math.sign(h(i, 44) - 0.5) * (0.12 + 0.3 * h(i, 41)), y0 = i < 5 ? -0.17 - 0.12 * k : -0.12 - 0.3 * Math.abs(x);
      const ph = (s * (1.6 + h(i, 42)) + h(i, 43)) % 1, y = y0 - 0.9 * ph * ph - 0.2 * ph;
      if (y < wl) continue;
      P_ell(ctx, x, y, 0.008, 0.014 + 0.01 * ph, P.cola([218, 230, 236], 0.75 * (1 - ph)));
    }
  },
  // Lunging, it comes up out of the water with a body under the head: no more than a mass of dark, rotten, swampy weed in
  // the shape of shoulders, hanging in ragged strands that sway and drip, and out of it two long thin arms draped in the
  // same weed, coming up out of the water and reaching out at you, the hands nearer than the head and so larger, the long
  // hooked fingers spread to take hold. k is the lunge, 0..1; drawn under the head, the water line cutting off whatever
  // is still under it (the caller's clip).
  drawBody(ctx, P, k, t, between) {
    const h = this.hash, e = easeOut(k);
    const mass = P.col([26, 40, 22]), dark = P.col([12, 20, 11]), mid = P.col([36, 54, 28]), lite = P.col([54, 76, 38]), slime = P.cola([160, 196, 120], 0.2);
    const skin = P.col([54, 66, 50]), skinD = P.col([40, 50, 36]);
    const weedy = [dark, mid, mass, lite];
    // the mass: shoulders out from under the jaw, the outline torn into hanging tatters at the sides
    const edge = (sd, i) => { const v = i / 8, y = lerp(-0.06, -1.6, v); return [sd * (0.12 + 0.32 * Math.min(1, v * 4) - 0.04 * v + 0.035 * Math.sin(t * 1.6 + i * 1.7 + sd) + 0.05 * h(i, 52 + sd)), y]; };
    const pts = [];
    for (let i = 0; i <= 8; i++) { const p = edge(1, i); pts.push(p); if (i < 8) pts.push([p[0] - 0.06 - 0.05 * h(i, 54), p[1] - 0.12]); }
    for (let i = 8; i >= 0; i--) { const p = edge(-1, i); if (i < 8) pts.push([p[0] + 0.06 + 0.05 * h(i, 55), p[1] - 0.12]); pts.push(p); }
    P_poly(ctx, pts, mass);
    // clumps and folds in it, darker and paler, and a wet sheen on the shoulders
    for (let i = 0; i < 10; i++) { const x = (h(i, 56) - 0.5) * 0.62, y = -0.18 - h(i, 57) * 0.9; P_ell(ctx, x, y, 0.05 + 0.06 * h(i, 58), 0.04 + 0.05 * h(i, 59), i % 3 ? dark : mid, (h(i, 60) - 0.5) * 0.8); }
    for (const sd of [-1, 1]) P_ell(ctx, sd * 0.2, -0.2 - 0.03 * sd, 0.09, 0.024, slime, sd * 0.35);
    // the weed hanging off it in long ragged strands, swaying, lifting off it as it comes up
    for (let i = 0; i < 18; i++) {
      const x = (i / 17 - 0.5) * 0.9, y0 = -0.05 - 0.24 * Math.abs(x) - 0.05 * h(i, 61), l = 0.4 + 0.6 * h(i, 62), w = 0.012 + 0.012 * h(i, 63);
      const sw = j => Math.sin(t * 1.5 + i * 1.7 + j * 1.1) * 0.03 * j;   // swaying more the further down it hangs
      const p = [[x, y0], [x * 1.06 + sw(1), y0 - l * 0.3], [x * 1.12 - sw(2) * 0.6, y0 - l * 0.62], [x * 1.2 + sw(3), y0 - l]];
      P_limb(ctx, p.slice(0, 3), w, weedy[i % 4]); P_limb(ctx, p.slice(2), w * 0.6, weedy[i % 4]);   // tapering
    }
    if (between) between();   // (the near half of the life ring it wears, round the mass and under the arms)
    // the arms: out of the weed at the shoulders, the elbows wide and low, the forearms coming up and in, the hands
    // reaching out at you and growing as they come
    for (const sd of [-1, 1]) {
      const sh = [sd * 0.27, -0.24], el = [sd * lerp(0.4, 0.6, e), lerp(-0.75, -0.42, e) + 0.015 * Math.sin(t * 5 + sd)];
      const hd = [sd * lerp(0.36, 0.46, e), lerp(-0.85, -0.02, e) + 0.02 * Math.sin(t * 6 + sd * 2)], big = 1 + 0.4 * e;
      P_limb(ctx, [sh, el], 0.05, skinD);
      P_limb(ctx, [el, hd], 0.036 * big, skin);
      // the hand: a long bony palm, the four long fingers a little apart and hooked over to take hold, the thumb in
      const ang = Math.PI / 2 - sd * lerp(0.05, 0.3, e);
      P_ell(ctx, hd[0], hd[1] + 0.02 * big, 0.032 * big, 0.048 * big, skin, -sd * 0.2);
      for (let f = 0; f < 5; f++) {
        const thumb = f === 4, a = thumb ? ang + sd * 1.1 : ang + (f - 1.5) * 0.15, l = (thumb ? 0.08 : 0.15 + (f === 1 || f === 2 ? 0.03 : 0)) * big;
        const b0 = [hd[0] + Math.cos(a) * 0.035 * big, hd[1] + 0.02 * big + Math.sin(a) * 0.035 * big], hook = sd * (thumb ? -0.5 : 1.0 + 0.12 * f) + 0.08 * Math.sin(t * 7 + f);
        const m = [b0[0] + Math.cos(a) * l * 0.55, b0[1] + Math.sin(a) * l * 0.55], tip = [m[0] + Math.cos(a + hook) * l * 0.45, m[1] + Math.sin(a + hook) * l * 0.45];
        P_limb(ctx, [b0, m, tip], 0.013 * big, skin);
      }
      // the weed draped over the arm: a rope of it wound round the upper arm, and strands hanging off it all along, swinging
      P_limb(ctx, [sh, [lerp(sh[0], el[0], 0.5), lerp(sh[1], el[1], 0.5) + 0.04], el], 0.04, mass);
      for (let j = 0; j < 8; j++) {
        const u = (j + 0.5) / 8, p = u < 0.4 ? [lerp(sh[0], el[0], u / 0.4), lerp(sh[1], el[1], u / 0.4)] : [lerp(el[0], hd[0], (u - 0.4) / 0.6 * 0.85), lerp(el[1], hd[1], (u - 0.4) / 0.6 * 0.85)];
        const l = 0.1 + 0.22 * h(j, 71 + sd), sw = Math.sin(t * 2.2 + j * 1.3 + sd) * 0.03 * (1 + e);
        P_limb(ctx, [p, [p[0] + sw * 0.5, p[1] - l * 0.5], [p[0] + sw, p[1] - l]], 0.012 + 0.008 * h(j, 73 + sd), weedy[(j + (sd > 0 ? 1 : 0)) % 4]);
        if (j % 3 === 1) { const ph = (t * 1.3 + h(j, 75 + sd)) % 1; P_ell(ctx, p[0] + sw, p[1] - l - ph * 0.3, 0.006, 0.011, P.cola([210, 224, 230], 0.6 * (1 - ph))); }   // and dripping
      }
    }
  },
  // flat out across the water, seen from the side: low in it, the head pushed ahead with its chin in the water and turned
  // to look at you, the long grey arms coming over one after the other and clawing in ahead, the weed streaming back off
  // the crown, the back breaking the surface behind, a wake spreading out after it. Nothing under the water line shows.
  drawSwim(ctx, c, P) {
    const g = c.runGait || 0, t = c.t;
    const skin = P.col([146, 156, 148]), skinD = P.col([98, 110, 102]), near = P.col([122, 134, 124]), far = P.col([80, 92, 84]), socket = P.col([36, 40, 38]);
    const moss = P.col([52, 76, 40]), mossL = P.col([78, 102, 56]), weed = P.col([18, 26, 18]), eye = P.col([196, 204, 192]);
    const ring = [150, 165, 175], foam = [214, 224, 228];
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    // the wake behind it, and the wave its head pushes ahead
    for (let i = 0; i < 5; i++) { const k = (t * 1.6 + i / 5) % 1; P_ell(ctx, -0.35 - k * 1.1, 0, 0.16 + k * 0.32, 0.02 + k * 0.025, P.cola(ring, 0.38 * (1 - k))); }
    P_ell(ctx, 0.32, 0.004, 0.13, 0.026, P.cola(foam, 0.6));
    ctx.save(); ctx.beginPath(); ctx.rect(-3, 0, 6, 3); ctx.clip();   // above the water only
    const bob = Math.sin(g * 2) * 0.012;
    // an arm over the water: out behind, up and over with the elbow high, in ahead with the long fingers hooked down. The
    // pull, under the water, does not show
    const arm = (ph, sx, col, w) => {
      const u = (((ph % TAU) + TAU) % TAU) / Math.PI;   // 0..1 coming over, 1..2 pulling under
      if (u > 1.15) return;
      const k = Math.min(u, 1), lift = Math.sin(k * Math.PI);
      const hx = lerp(-0.42, 0.62, k), hy = lift * 0.34 - Math.max(0, u - 1) * 0.6;
      const ex = lerp(sx - 0.24, sx + 0.18, k), ey = 0.12 + lift * 0.3;
      P_limb(ctx, [[sx, -0.02], [ex, ey], [hx, hy]], w, col);
      fingers(ctx, hx, hy, -0.9 - (1 - k) * 0.9, 0.22, 0.12, w * 0.45, col);
    };
    arm(g + Math.PI, -0.02, far, 0.032);   // the far arm, behind the head
    // the back and shoulders just breaking the surface, moss on them
    P_ell(ctx, -0.3, -0.01 + bob * 0.5, 0.3, 0.075, skinD);
    P_ell(ctx, -0.36, 0.03, 0.09, 0.03, moss); P_ell(ctx, -0.18, 0.04, 0.06, 0.022, mossL);
    // in the life ring (The Boathouse's easter egg): the hoop round its chest, standing up out of the water over its back
    if (c.ringOn) { ctx.save(); ctx.translate(-0.2, -0.02 + bob * 0.5); ctx.rotate(-0.22); this.lifeRing(ctx, P, 0, 0, 0.12, 2.7, 0.5, null, this.RING_TUBE); ctx.restore(); }
    // the weed off the crown, streaming back along the water
    for (let i = 0; i < 9; i++) {
      const y0 = 0.16 - i * 0.012, l = 0.4 + ((i * 37) % 11) / 11 * 0.35, sw = Math.sin(t * 3 + i * 1.3) * 0.02;
      P_limb(ctx, [[0.02 - i * 0.012, y0 + bob], [-0.15 - l * 0.4, y0 * 0.5 + sw], [-0.1 - l, 0.01 + sw * 0.5]], 0.011, weed);
    }
    // the head, low and long, its chin in the water, turned three quarters to you: both eyes, the nearer one larger
    ctx.save(); ctx.translate(0.08, 0.02 + bob); ctx.rotate(-0.12);
    P_ell(ctx, 0, 0.02, 0.24, 0.15, skin); P_ell(ctx, -0.06, 0, 0.18, 0.12, skinD);
    for (const [x, y, rx, ry, c2] of [[-0.08, 0.13, 0.12, 0.04, moss], [-0.17, 0.09, 0.06, 0.04, mossL], [0, 0.15, 0.06, 0.025, mossL]]) P_ell(ctx, x, y, rx, ry, c2);
    P_ell(ctx, -0.04, 0.15, 0.05, 0.012, P.cola([230, 240, 235], 0.3), -0.2);
    for (const [x, k] of [[0.09, 1], [0.17, 0.75]]) { P_ell(ctx, x, 0.065, 0.045 * k, 0.03 * k, socket); P_ell(ctx, x, 0.062, 0.027 * k, 0.018 * k, eye); }
    ctx.restore();
    arm(g, -0.08, near, 0.04);   // the near arm, over the head
    ctx.restore();
    // where a hand goes in, a burst of water and a ring of foam
    for (const ph of [g, g + Math.PI]) {
      const u = (((ph % TAU) + TAU) % TAU) / Math.PI, s = (u - 0.92) / 0.5;
      if (s < 0 || s > 1) continue;
      P_ell(ctx, 0.62, 0, 0.07 + s * 0.16, 0.018 + s * 0.012, P.cola(foam, 0.55 * (1 - s)));
      for (let i = 0; i < 6; i++) P_ell(ctx, 0.62 + (i - 2.5) * 0.045 * (1 + s), Math.sin(s * Math.PI) * (0.05 + (i % 3) * 0.035), 0.012, 0.018, P.cola(foam, 0.75 * (1 - s)));
    }
    ctx.restore();
  },
};
