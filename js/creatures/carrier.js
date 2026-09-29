'use strict';
// The carrier: hunched, sack-bodied, arms wrapped round itself, a face you would rather not see up close.
// Its pace depends on how much you are carrying: the night sets c.load to the size of your inventory.
CREATURES.carrier = {
  name: 'the carrier', h: 1.7, w: 1.6, faceY: 1.35, stepRate: 0.9, catchDist: 1.5, sound: 'walker',
  death: { delay: 0.2, dur: 0.4, sting: 'sting' },
  voice: { kind: 'slow', every: [5, 10] },
  init(c) { c.load = 0; c.sitting = false; },
  speedMult(c, dt, seen) { if (c.sitting) return 0; return 0.4 + 0.3 * (c.load || 0); },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 12, 0, 1), lunge = c.lunge || 0;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), skin = P.col([160, 140, 122]), black = P.col([8, 6, 6]), teeth = P.col([220, 210, 190]);
    const load = clamp((c.load || 0) / 6, 0, 1);
    if (c.sitting) {
      // sat in the yard, facing the loft, arms round its knees
      P_ell(ctx, 0, 0.42, 0.62, 0.42, sack); P_ell(ctx, 0, 0.35, 0.5, 0.2, sackD);
      P_ell(ctx, 0, 0.95, 0.24, 0.26, sack); P_ell(ctx, 0, 0.92, 0.17, 0.19, skin);
      P_ell(ctx, -0.07, 0.96, 0.03, 0.02, black); P_ell(ctx, 0.07, 0.96, 0.03, 0.02, black);
      return;
    }
    const bob = c.moving ? Math.abs(Math.sin(g)) * 0.06 : Math.sin(t * 1.4) * 0.02, hunch = 0.25 + load * 0.15;
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = c.moving ? Math.max(0, Math.sin(ph)) * 0.18 : 0;
      P_limb(ctx, [[s * 0.16, 0.75 + bob], [s * 0.22 + Math.sin(ph) * 0.08, 0.4 + lift * 0.6], [s * 0.2 + Math.sin(ph) * 0.14, lift + 0.03]], 0.1, sackD);
    }
    // the body: a sack, sagging, patched, the seams showing
    ctx.save(); ctx.translate(0, bob);
    P_ell(ctx, 0, 0.95, 0.5 + load * 0.08, 0.5, sack);
    P_poly(ctx, [[-0.42, 0.7], [0.42, 0.7], [0.36, 1.25 - hunch * 0.3], [-0.36, 1.25 - hunch * 0.3]], sack);
    for (let k = 0; k < 4; k++) P_line(ctx, -0.3 + k * 0.2, 0.75, -0.25 + k * 0.2, 1.2, 0.012, sackD);
    P_rect(ctx, -0.12, 0.85, 0.22, 0.16, sackD);
    // arms wrapped round itself; when it lunges they open
    for (const s of [-1, 1]) {
      const open = lunge;
      P_limb(ctx, [[s * 0.38, 1.15], [s * (0.1 + open * 0.55), 0.95 + open * 0.3], [-s * (0.25 - open * 0.7), 1.05 + open * 0.4]], 0.11, sack);
      if (open > 0.2) fingers(ctx, -s * (0.25 - open * 0.7), 1.05 + open * 0.4, -s * 0.4 + Math.PI / 2, 0.4, 0.14, 0.025, skin);
    }
    // the head: low, pushed forward, hair like straw, a mouth full of small teeth
    ctx.save(); ctx.translate(0, 1.2 - hunch * 0.2); ctx.rotate(headTiltJerk(t, 3.3, 0.14) * (1 - lunge));
    strands(ctx, 0, 0.42, 12, 0.3, P.col([120, 100, 60]), 9, t);
    P_ell(ctx, 0, 0.22, 0.2, 0.22, skin);
    P_ell(ctx, -0.08, 0.27, 0.035, 0.025, black); P_ell(ctx, 0.08, 0.27, 0.035, 0.025, black);
    const mw = 0.08 + near * 0.05 + lunge * 0.08, mh = 0.02 + near * 0.04 + lunge * 0.09;
    P_ell(ctx, 0, 0.1, mw, mh, black);
    if (near > 0.15 || lunge > 0) for (let i = -3; i <= 3; i++) P_rect(ctx, i * mw * 0.27 - 0.008, 0.1 + mh * 0.5 - 0.03, 0.016, 0.03, teeth);
    ctx.restore();
    ctx.restore();
  }
};
