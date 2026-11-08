'use strict';
// The swimmer: a drowned head, mossy and wet, only the crown and the staring eyes above the water.
// It surfaces for a few seconds, slow and visible, then goes under (unseen by definition, and fast)
// and comes up closer with a splash panned to its lane. Its feet are at the water line (lane.y).
CREATURES.swimmer = {
  name: 'the swimmer', h: 0.5, w: 0.6, faceY: 0.06, stepRate: 0, catchDist: 1.6, sound: null,
  death: { delay: 0.2, dur: 0.45, sting: 'stingWet' },
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
    if (c.mode === 'up' && c.modeT > c.upFor) { c.mode = 'down'; c.modeT = 0; c.downFor = 2 + c.rand() * 2; c.diveDist = c.dist; c.diveT = G.L.t; AUDIO.sfx('dive', pan); }
    else if (c.mode === 'down' && c.modeT > c.downFor) { c.mode = 'up'; c.modeT = 0; c.upFor = 2.6 + c.rand() * 0.9; c.surfaced = G.L.t; AUDIO.sfx('splash', pan); }
    return c.mode === 'down' ? 2.5 : 0.55;
  },
  draw(ctx, c, P) {
    if (c.mode === 'down' && !c.lunge && !G.L.won) return;
    if (c.runPose && !c.lunge) { this.drawSwim(ctx, c, P); return; }
    const t = c.t, near = clamp(1 - c.dist / 10, 0, 1), lunge = c.lunge || 0;
    const skin = P.col([146, 156, 148]), skinD = P.col([98, 110, 102]), socket = P.col([36, 40, 38]), moss = P.col([52, 76, 40]), mossL = P.col([78, 102, 56]);
    const weed = P.col([18, 26, 18]), eye = P.col([196, 204, 192]), iris = P.col([128, 132, 122]), mouth = P.col([10, 8, 8]);
    const wet = P.cola([230, 240, 235], 0.3), ring = [150, 165, 175];
    const fresh = clamp(1 - (G.L.t - c.surfaced) / 1.2, 0, 1);
    // it rises a little as it closes, and all the way out when it lunges; the water line is y = 0 until the lunge lifts the
    // whole drawing toward the eye (c.yOff): then it is y = -c.yOff, and the rings stay down there on the water and fade
    const rise = (0.02 + near * 0.08 + Math.sin(t * 1.1) * 0.015) * (1 - lunge);   // the death lift is the game's: the face ends at eye height
    const wl = -(c.yOff || 0), calm = 1 - lunge;
    for (let i = 0; i < 3; i++) { const k = (fresh + i * 0.33 + t * 0.12) % 1; P_ell(ctx, 0, wl, 0.26 + k * 0.55, 0.04 + k * 0.05, P.cola(ring, 0.32 * (1 - k) * calm)); }
    ctx.save(); ctx.beginPath(); ctx.rect(-1, wl, 2, 3 - wl); ctx.clip(); // nothing below the water line is drawn: the water shows there
    ctx.translate(0, rise);
    // the head: a long drowned skull, grey and wet, moss grown over the crown in patches
    P_ell(ctx, 0, 0.1, 0.17, 0.27, skin);
    P_ell(ctx, 0.06, 0.05, 0.1, 0.22, skinD);
    for (const [x, y, rx, ry, c2] of [[0, 0.33, 0.12, 0.05, moss], [-0.09, 0.28, 0.07, 0.05, mossL], [0.08, 0.3, 0.07, 0.04, moss], [0.13, 0.19, 0.035, 0.06, mossL], [-0.14, 0.14, 0.03, 0.07, moss], [0.02, 0.25, 0.04, 0.025, mossL]]) P_ell(ctx, x, y, rx, ry, c2);
    P_ell(ctx, -0.07, 0.27, 0.04, 0.015, wet, -0.4);
    // sunken sockets just above the water, and in them small milky eyes that do not blink
    const eyeY = 0.045 + lunge * 0.02, open = 0.016 + near * 0.008 + lunge * 0.014;
    for (const s2 of [-1, 1]) { P_ell(ctx, s2 * 0.068, eyeY + 0.004, 0.05, 0.034, socket); P_ell(ctx, s2 * 0.068, eyeY, 0.03, open, eye); P_ell(ctx, s2 * 0.064, eyeY, 0.011, Math.min(open, 0.011), iris); }
    P_line(ctx, 0, eyeY - 0.012, 0.006, eyeY - 0.075, 0.026, skinD);
    if (lunge > 0) P_ell(ctx, 0, -0.14, 0.05 + lunge * 0.05, 0.03 + lunge * 0.11, mouth);
    // weed hangs straight down from the crown like wet hair, parted over the eyes
    for (let i = 0; i < 13; i++) {
      const x = -0.16 + i * 0.0267; if (Math.abs(x) > 0.035 && Math.abs(Math.abs(x) - 0.075) < 0.03) continue;
      const l = 0.2 + ((i * 37) % 11) / 11 * 0.16 + lunge * 0.15, sway = Math.sin(t * 0.8 + i * 1.7) * 0.012;
      P_limb(ctx, [[x * 0.9, 0.34], [x + sway, 0.34 - l * 0.5], [x * 1.05 + sway * 2, 0.34 - l]], 0.011, weed);
    }
    ctx.restore();
    // drips off the chin and the weed, and the ring where the water meets it
    for (let i = 0; i < 3; i++) { const k = (t * 0.9 + i * 0.37) % 1, y = rise + 0.05 - k * 0.12; if (y > wl) P_ell(ctx, -0.1 + i * 0.1, y, 0.008, 0.014, P.cola([200, 214, 210], 0.6 * (1 - k))); }
    if (calm > 0.01) P_ell(ctx, 0, wl, 0.24, 0.025, P.cola(ring, 0.5 * calm));
  },
  // flat out across the water, seen from the side: low in it, the head pushed ahead with its chin in the water and turned
  // to look at you, the long grey arms coming over one after the other and clawing in ahead, the weed streaming back off
  // the crown, the back breaking the surface behind, a wake spreading out after it. Nothing under the water line shows.
  drawSwim(ctx, c, P) {
    const g = c.runGait || 0, t = c.t;
    const skin = P.col([146, 156, 148]), skinD = P.col([98, 110, 102]), near = P.col([122, 134, 124]), far = P.col([80, 92, 84]), socket = P.col([36, 40, 38]);
    const moss = P.col([52, 76, 40]), mossL = P.col([78, 102, 56]), weed = P.col([18, 26, 18]), eye = P.col([196, 204, 192]), iris = P.col([128, 132, 122]);
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
    for (const [x, k] of [[0.09, 1], [0.17, 0.75]]) { P_ell(ctx, x, 0.065, 0.045 * k, 0.03 * k, socket); P_ell(ctx, x, 0.062, 0.027 * k, 0.018 * k, eye); P_ell(ctx, x + 0.004, 0.062, 0.01 * k, 0.01 * k, iris); }
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
