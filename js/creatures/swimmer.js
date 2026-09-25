'use strict';
// The swimmer: bloated, weed-haired, only the crown, the shoulders and one hand above the water.
// It surfaces for a few seconds, slow and visible, then goes under (unseen by definition, and fast)
// and comes up closer with a splash panned to its lane. Its feet are at the water line (lane.y).
CREATURES.swimmer = {
  name: 'the swimmer', h: 0.95, w: 1.4, faceY: 0.62, stepRate: 0, catchDist: 1.6, sound: null,
  death: { delay: 0.2, dur: 0.45, sting: 'stingWet' },
  voice: { kind: 'gurgle', every: [4, 9] },
  init(c) { c.mode = 'up'; c.modeT = -1.0; c.upFor = 3.2; c.downFor = 2 + c.rand() * 2; c.diveDist = c.dist; c.diveT = 0; c.surfaced = 0; },
  hidden(c) { return c.mode === 'down' && !c.lunge && !c.frozen && !G.L.won; },
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
    const t = c.t, near = clamp(1 - c.dist / 12, 0, 1), lunge = c.lunge || 0;
    const skin = P.col([128, 138, 116]), skinD = P.col([84, 92, 76]), hair = P.col([20, 26, 18]), eye = P.col([226, 228, 214]), mouth = P.col([14, 10, 12]);
    const water = P.cola([150, 165, 175], 0.35);
    const fresh = clamp(1 - (G.L.t - c.surfaced) / 1.2, 0, 1);
    const bob = Math.sin(t * 1.1) * 0.035;
    // rings on the water where it came up, and the bow wave it pushes
    for (let i = 0; i < 2; i++) { const k = (fresh + i * 0.35) % 1; P_ell(ctx, 0, 0.02, 0.35 + k * 0.6, 0.06 + k * 0.05, P.cola([150, 165, 175], 0.35 * (1 - k))); }
    P_ell(ctx, 0, 0.03, 0.5 + Math.sin(t * 1.7) * 0.04, 0.05, water);
    ctx.save();
    ctx.translate(0, bob + lunge * 1.0);
    if (lunge > 0) {
      // it comes up out of the water: the chest, and both arms reaching
      P_poly(ctx, [[-0.42, -1.0], [0.42, -1.0], [0.36, 0.3], [-0.36, 0.3]], skin);
      for (const s of [-1, 1]) {
        P_limb(ctx, [[s * 0.3, 0.32], [s * 0.6, 0.55 + lunge * 0.2], [s * 0.5, 0.8 + lunge * 0.35]], 0.09, skin);
        fingers(ctx, s * 0.5, 0.8 + lunge * 0.35, Math.PI / 2 - s * 0.3, 0.32, 0.16, 0.026, skin);
      }
    }
    // the shoulders: a hump, weed hanging off it
    P_ell(ctx, 0, 0.26, 0.44, 0.3, skin);
    P_ell(ctx, 0, 0.2, 0.42, 0.14, skinD);
    for (const [x, l] of [[-0.3, 0.2], [0.34, 0.16], [-0.1, 0.12]]) P_line(ctx, x, 0.4, x + Math.sin(t * 0.9 + x * 5) * 0.03, 0.4 - l, 0.02, hair);
    // one hand, raised, fingers spread
    if (lunge <= 0) {
      const hx = 0.52 + Math.sin(t * 1.7) * 0.03, hy = 0.62 + Math.sin(t * 1.3) * 0.03;
      P_limb(ctx, [[0.3, 0.3], [0.56, 0.42], [hx, hy]], 0.085, skin);
      P_ell(ctx, hx, hy, 0.07, 0.06, skin);
      fingers(ctx, hx, hy, Math.PI / 2 + 0.15 + Math.sin(t * 2.1) * 0.08, 0.34, 0.15, 0.024, skin);
      P_line(ctx, hx + 0.02, hy - 0.05, hx + 0.06, hy - 0.22, 0.015, hair);
    }
    // the head: the crown, hair plastered flat and hanging over the face
    const tilt = -0.25 + near * 0.5 + lunge * 0.4;
    ctx.save(); ctx.translate(0, 0.62); ctx.rotate(tilt * 0.3);
    P_ell(ctx, 0, 0, 0.19, 0.22, skin);
    const faceA = clamp(near * 1.6 + lunge, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      P_ell(ctx, -0.07, 0.03, 0.045, 0.03, eye); P_ell(ctx, 0.07, 0.03, 0.045, 0.03, eye);
      P_ell(ctx, 0, -0.1, 0.05 + lunge * 0.04, 0.03 + near * 0.03 + lunge * 0.06, mouth);
      ctx.globalAlpha = 1;
    }
    P_ell(ctx, 0, 0.16, 0.2, 0.09, hair);
    strands(ctx, 0, 0.2, 11, 0.34, hair, 7, t * 0.6);
    ctx.restore();
    ctx.restore();
  }
};
