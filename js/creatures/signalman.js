'use strict';
// The signalman: tall, a long coat and a cap, walking in step down the middle of the street with a lantern in one hand,
// eyes shut until he is close. He keeps the same pace whether you watch him or not. While c.held is set he stands still;
// once c.away is set (the night has let you go) he has turned round, and you see his back as he walks off.
CREATURES.signalman = {
  name: 'the signalman', h: 2.3, w: 1.2, faceY: 2.05, stepRate: 0.6, catchDist: 1.6, sound: 'walker', ignoresGaze: true,
  death: { delay: 0.3, dur: 0.5, sting: 'stingGlass' },
  voice: { kind: 'hum', every: [7, 13] },
  init(c) { c.held = false; c.away = false; },
  speedMult(c, dt, seen) { return c.held ? 0 : 1; },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 10, 0, 1), lunge = c.lunge || 0, back = !!c.away && !lunge;
    const coat = P.col([24, 22, 26]), coatL = P.col([44, 40, 46]), skin = P.col([206, 196, 184]), black = P.col([6, 4, 6]), brass = P.col([170, 140, 70]), hair = P.col([30, 26, 24]);
    const hand = P.col([150, 141, 132]), shade = P.col([118, 110, 104]);   // the hands and the neck, in the shadow of the coat
    const held = c.held && !lunge;
    const bob = (c.moving ? Math.abs(Math.sin(g)) * 0.04 : 0);
    // seen from behind everything is mirrored: the lantern is in the same hand, which is now on the other side
    if (back) { ctx.save(); ctx.scale(-1, 1); }
    // legs: long, even strides
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = c.moving ? Math.max(0, Math.sin(ph)) * 0.22 : 0;
      P_limb(ctx, [[s * 0.1, 1.05 + bob], [s * 0.14 + Math.sin(ph) * 0.12, 0.55 + lift * 0.6], [s * 0.15 + Math.sin(ph) * 0.2, lift + 0.03]], 0.11, coat);
      P_ell(ctx, s * 0.15 + Math.sin(ph) * 0.2, lift + 0.03, 0.1, 0.04, black);
    }
    // the coat: long, buttoned, the collar up; from behind, a seam and a vent
    P_poly(ctx, [[-0.34, 0.55 + bob], [0.34, 0.55 + bob], [0.3, 1.95 + bob], [-0.3, 1.95 + bob]], coat);
    if (!back) {
      P_poly(ctx, [[-0.03, 0.6 + bob], [0.03, 0.6 + bob], [0.03, 1.9 + bob], [-0.03, 1.9 + bob]], coatL);
      for (let k = 0; k < 4; k++) P_ell(ctx, 0.08, 0.85 + k * 0.28 + bob, 0.02, 0.02, brass);
    } else {
      P_line(ctx, 0, 0.56 + bob, 0, 1.88 + bob, 0.012, coatL); P_line(ctx, 0, 0.56 + bob, 0.04, 0.95 + bob, 0.01, coatL);
      P_line(ctx, -0.26, 1.2 + bob, 0.26, 1.2 + bob, 0.02, coatL);   // the half-belt across the back
    }
    // arms: one at his side, one carrying the lantern, swinging
    P_limb(ctx, [[-0.3, 1.85 + bob], [-0.36, 1.35 + bob], [-0.33, 0.95 + bob]], 0.09, coat);
    P_ell(ctx, -0.33, 0.91 + bob, 0.044, 0.062, hand);
    const sw = c.moving ? Math.sin(g) * 0.08 : Math.sin(t * 1.2) * 0.03;
    P_limb(ctx, [[0.3, 1.85 + bob], [0.42 + sw, 1.4 + bob], [0.44 + sw * 1.5, 1.05 + bob]], 0.09, coat);
    P_ell(ctx, 0.44 + sw * 1.5, 1.01 + bob, 0.044, 0.062, hand);
    ctx.save(); ctx.translate(0.46 + sw * 1.8, 0.6 + bob + sw * 0.1); ctx.rotate(-sw * 0.8); ctx.scale(0.24, 0.34); ICONS.lantern(ctx, Object.assign({}, P, { lit: true })); ctx.restore();
    // the head: a cap, a long pale face with the eyes shut; from behind, the back of his head under the cap
    ctx.save(); ctx.translate(0, 1.92 + bob);
    if (!back) {
      P_rect(ctx, -0.045, -0.02, 0.09, 0.11, shade);   // the neck, only ever seen in the V of the collar
      P_ell(ctx, 0, 0.24, 0.12, 0.17, skin);
      const open = clamp(near * 2 - 0.6 + lunge, 0, 1);
      for (const s of [-1, 1]) { if (open > 0.05) { P_ell(ctx, s * 0.045, 0.27, 0.03, 0.02 * open, P.col([240, 240, 236])); P_ell(ctx, s * 0.045, 0.27, 0.01, 0.01 * open, black); } else P_line(ctx, s * 0.075, 0.27, s * 0.02, 0.27, 0.012, P.col([120, 100, 96])); }
      P_line(ctx, -0.04, 0.13, 0.04, 0.13, 0.012, P.col([120, 100, 96]));
      if (lunge > 0.4) P_ell(ctx, 0, 0.13, 0.04, 0.03 + lunge * 0.05, black);
      // the collar, turned up either side of the jaw and meeting under it
      for (const s of [-1, 1]) { P_poly(ctx, [[s * 0.22, -0.05], [0, -0.035], [s * 0.06, 0.1], [s * 0.17, 0.13]], coat); P_line(ctx, 0, -0.03, s * 0.06, 0.1, 0.012, coatL); P_line(ctx, s * 0.06, 0.1, s * 0.17, 0.13, 0.014, coatL); }
    } else {
      P_line(ctx, 0, 0, 0, 0.08, 0.1, skin);
      P_ell(ctx, 0, 0.24, 0.12, 0.17, hair); P_ell(ctx, 0, 0.12, 0.07, 0.035, P.col([150, 138, 128]));   // the back of his head; the nape in shadow
      P_rect(ctx, -0.16, -0.02, 0.32, 0.13, coat); P_line(ctx, -0.16, 0.11, 0.16, 0.11, 0.015, coatL);   // the collar, turned up
    }
    P_ell(ctx, 0, 0.38, 0.14, 0.05, coat); P_rect(ctx, -0.12, 0.36, 0.24, 0.1, coat); P_line(ctx, -0.13, 0.36, 0.14, 0.36, 0.02, coatL);
    ctx.restore();
    if (back) ctx.restore();
    if (held && !c.moving) P_ell(ctx, 0, 0.02, 0.5, 0.05, P.cola([0, 0, 0], 0.25));
  }
};
