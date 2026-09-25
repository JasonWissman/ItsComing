'use strict';
// The signalman: tall, a long coat and a cap, walking the sleepers in step with a lamp in one hand,
// eyes shut. He obeys the signal: while c.held is set he stands. The train is the only thing that stops him.
CREATURES.signalman = {
  name: 'the signalman', h: 2.3, w: 1.2, faceY: 2.05, stepRate: 0.6, catchDist: 1.6, sound: 'walker', ignoresGaze: true,
  death: { delay: 0.3, dur: 0.5, sting: 'stingGlass' },
  voice: { kind: 'hum', every: [7, 13] },
  init(c) { c.held = false; c.taken = false; },
  speedMult(c, dt, seen) { return c.held || c.taken ? 0 : 1; },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 10, 0, 1), lunge = c.lunge || 0;
    const coat = P.col([24, 22, 26]), coatL = P.col([44, 40, 46]), skin = P.col([206, 196, 184]), black = P.col([6, 4, 6]), brass = P.col([170, 140, 70]);
    if (c.taken) {
      // what the train left: a coat across the sleepers, the lamp still burning beside it
      P_ell(ctx, 0.1, 0.12, 0.75, 0.12, coat); P_line(ctx, -0.5, 0.15, -0.8, 0.3, 0.08, coat);
      P_ell(ctx, -0.95, 0.14, 0.13, 0.12, skin);
      ctx.save(); ctx.translate(0.7, 0); ctx.scale(0.26, 0.36); ICONS.lantern(ctx, Object.assign({}, P, { lit: true })); ctx.restore();
      return;
    }
    const held = c.held && !lunge;
    const bob = (c.moving ? Math.abs(Math.sin(g)) * 0.04 : 0);
    // legs: long, even strides on the sleepers
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = c.moving ? Math.max(0, Math.sin(ph)) * 0.22 : 0;
      P_limb(ctx, [[s * 0.1, 1.05 + bob], [s * 0.14 + Math.sin(ph) * 0.12, 0.55 + lift * 0.6], [s * 0.15 + Math.sin(ph) * 0.2, lift + 0.03]], 0.11, coat);
      P_ell(ctx, s * 0.15 + Math.sin(ph) * 0.2, lift + 0.03, 0.1, 0.04, black);
    }
    // the coat: long, buttoned, the collar up
    P_poly(ctx, [[-0.34, 0.55 + bob], [0.34, 0.55 + bob], [0.3, 1.95 + bob], [-0.3, 1.95 + bob]], coat);
    P_poly(ctx, [[-0.03, 0.6 + bob], [0.03, 0.6 + bob], [0.03, 1.9 + bob], [-0.03, 1.9 + bob]], coatL);
    for (let k = 0; k < 4; k++) P_ell(ctx, 0.08, 0.85 + k * 0.28 + bob, 0.02, 0.02, brass);
    // arms: one at his side, one carrying the lamp, swinging
    P_limb(ctx, [[-0.3, 1.85 + bob], [-0.36, 1.35 + bob], [-0.33, 0.95 + bob]], 0.09, coat);
    P_ell(ctx, -0.33, 0.9 + bob, 0.05, 0.07, skin);
    const sw = c.moving ? Math.sin(g) * 0.08 : Math.sin(t * 1.2) * 0.03;
    P_limb(ctx, [[0.3, 1.85 + bob], [0.42 + sw, 1.4 + bob], [0.44 + sw * 1.5, 1.05 + bob]], 0.09, coat);
    P_ell(ctx, 0.44 + sw * 1.5, 1.0 + bob, 0.05, 0.07, skin);
    ctx.save(); ctx.translate(0.46 + sw * 1.8, 0.6 + bob + sw * 0.1); ctx.rotate(-sw * 0.8); ctx.scale(0.24, 0.34); ICONS.lantern(ctx, Object.assign({}, P, { lit: true })); ctx.restore();
    // the head: a cap, a long pale face with the eyes shut
    ctx.save(); ctx.translate(0, 1.92 + bob);
    P_line(ctx, 0, 0, 0, 0.08, 0.1, skin);
    P_ell(ctx, 0, 0.24, 0.12, 0.17, skin);
    const open = clamp(near * 2 - 0.6 + lunge, 0, 1);
    for (const s of [-1, 1]) { if (open > 0.05) { P_ell(ctx, s * 0.045, 0.27, 0.03, 0.02 * open, P.col([240, 240, 236])); P_ell(ctx, s * 0.045, 0.27, 0.01, 0.01 * open, black); } else P_line(ctx, s * 0.075, 0.27, s * 0.02, 0.27, 0.012, P.col([120, 100, 96])); }
    P_line(ctx, -0.04, 0.13, 0.04, 0.13, 0.012, P.col([120, 100, 96]));
    if (lunge > 0.4) P_ell(ctx, 0, 0.13, 0.04, 0.03 + lunge * 0.05, black);
    P_ell(ctx, 0, 0.38, 0.14, 0.05, coat); P_rect(ctx, -0.12, 0.36, 0.24, 0.1, coat); P_line(ctx, -0.13, 0.36, 0.14, 0.36, 0.02, coatL);
    ctx.restore();
    if (held && !c.moving) P_ell(ctx, 0, 0.02, 0.5, 0.05, P.cola([0, 0, 0], 0.25));
  }
};
