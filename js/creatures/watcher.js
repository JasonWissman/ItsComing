'use strict';
CREATURES.watcher = {
  name: 'the watcher', h: 2.15, w: 1.5, faceY: 1.8, stepRate: 0.8, catchDist: 1.6, sound: null, silentWhenSeen: true,
  death: { delay: 0.05, dur: 0.04, sting: 'stingStone' },
  init(c) { c.pose = 0; c.seenLast = true; },
  onSeen(c) {
    // it is never in the same pose twice in a row
    let p; do { p = 1 + Math.floor(c.rand() * 3); } while (p === c.pose);
    if (c.dist < 4) p = c.rand() < 0.5 ? 1 : 2;
    c.pose = p;
  },
  speedMult(c, dt, seen) { return seen ? 0 : 1; },
  draw(ctx, c, P) {
    const stone = P.col([104, 106, 108]), stoneD = P.col([58, 60, 64]), stoneL = P.col([132, 134, 136]);
    const hole = P.col([8, 8, 10]);
    const pale = P.col([200, 200, 196]);
    const pose = c.lunge ? 2 : c.pose;
    // robe
    P_poly(ctx, [[-0.55, 0], [0.55, 0], [0.3, 1.5], [-0.3, 1.5]], stone);
    P_poly(ctx, [[-0.12, 0], [0.02, 0], [0.06, 1.45], [-0.08, 1.45]], stoneD);
    P_poly(ctx, [[0.25, 0], [0.42, 0], [0.24, 1.42], [0.16, 1.42]], stoneD);
    // hood
    P_poly(ctx, [[-0.33, 1.42], [0.33, 1.42], [0.24, 2.05], [0, 2.15], [-0.24, 2.05]], stone);
    P_poly(ctx, [[-0.2, 1.5], [0.2, 1.5], [0.15, 2.0], [0, 2.06], [-0.15, 2.0]], hole);
    const shoulder = s => [s * 0.3, 1.45];
    if (pose === 0) {
      // covering its face
      for (const s of [-1, 1]) {
        P_limb(ctx, [shoulder(s), [s * 0.42, 1.1], [s * 0.1, 1.72]], 0.1, stone);
        P_ell(ctx, s * 0.07, 1.78, 0.085, 0.12, stoneL, s * 0.25);
      }
    } else if (pose === 1) {
      // reaching for you
      for (const s of [-1, 1]) {
        P_limb(ctx, [shoulder(s), [s * 0.5, 1.25], [s * 0.36, 1.05]], 0.1, stone);
        P_ell(ctx, s * 0.36, 1.05, 0.07, 0.06, stoneL);
        fingers(ctx, s * 0.36, 1.05, -Math.PI / 2 + s * 0.3, 0.35, 0.16, 0.03, stoneL);
      }
      P_ell(ctx, -0.055, 1.83, 0.02, 0.014, pale); P_ell(ctx, 0.055, 1.83, 0.02, 0.014, pale);
    } else if (pose === 2) {
      // screaming, head cocked
      for (const s of [-1, 1]) {
        P_limb(ctx, [shoulder(s), [s * 0.55, 1.3], [s * 0.62, 1.7]], 0.1, stone);
        fingers(ctx, s * 0.62, 1.7, Math.PI / 2 + s * 0.2, 0.35, 0.15, 0.03, stoneL);
      }
      ctx.save(); ctx.translate(0, 1.5); ctx.rotate(0.35);
      P_poly(ctx, [[-0.2, 0], [0.2, 0], [0.15, 0.5], [0, 0.56], [-0.15, 0.5]], hole);
      P_ell(ctx, -0.055, 0.33, 0.022, 0.016, pale); P_ell(ctx, 0.055, 0.33, 0.022, 0.016, pale);
      P_ell(ctx, 0, 0.15, 0.06, 0.09 + (c.lunge || 0) * 0.05, stoneD);
      P_ell(ctx, 0, 0.15, 0.045, 0.075 + (c.lunge || 0) * 0.05, hole);
      ctx.restore();
    } else {
      // pointing at you
      P_limb(ctx, [shoulder(-1), [-0.45, 1.15], [-0.36, 0.85]], 0.1, stone);
      P_limb(ctx, [shoulder(1), [0.5, 1.35], [0.28, 1.3]], 0.1, stone);
      P_ell(ctx, 0.28, 1.3, 0.07, 0.06, stoneL);
      P_line(ctx, 0.28, 1.3, 0.2, 1.27, 0.035, stoneL);
      P_ell(ctx, -0.055, 1.83, 0.02, 0.014, pale); P_ell(ctx, 0.055, 1.83, 0.02, 0.014, pale);
    }
    // cracks
    ctx.strokeStyle = stoneD; ctx.lineWidth = 0.012; ctx.beginPath();
    ctx.moveTo(-0.2, 0.3); ctx.lineTo(-0.1, 0.7); ctx.lineTo(-0.16, 0.95);
    ctx.moveTo(0.3, 0.2); ctx.lineTo(0.22, 0.55);
    ctx.stroke();
  }
};
