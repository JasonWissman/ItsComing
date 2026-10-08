'use strict';
// The sackhead: skinned, red to the bone, a cloth sack over its head with holes cut in it, a bone shiv in one hand,
// a rag over one shoulder. It stalks: knees bent, toes long, one leg dragged. Its flesh is the spot colour.
CREATURES.sackhead = {
  name: 'the sackhead', h: 1.95, w: 1.7, faceY: 1.72, stepRate: 1.1, catchDist: 1.3, sound: null, lab: true,
  init(c) { c.lurch = 0; },
  speedMult(c, dt, seen) { c.lurch = (c.lurch + dt) % 2.6; return c.lurch < 1.7 ? 1.4 : 0.15; },   // a stride and a pause
  draw(ctx, c, P) {
    const spot = P.spot || P.col, g = c.gait, t = c.t, lunge = c.lunge || 0, near = clamp(1 - c.dist / 16, 0, 1);
    const flesh = spot([150, 40, 36]), fleshD = spot([92, 20, 18]), sinew = spot([196, 80, 70]), sack = P.col([208, 200, 186]), sackD = P.col([140, 132, 118]);
    const ink = P.col([5, 3, 4]), rag = P.col([22, 20, 22]), bone = P.col([220, 212, 196]), blood = spot([130, 8, 12]);
    const bob = Math.abs(Math.sin(g)) * 0.05, lean = 0.12 + near * 0.08;
    // the rag over the left shoulder, hanging down the back
    P_tatter(ctx, [[-0.3, 1.5 + bob], [0.05, 1.55 + bob], [0.1, 0.8 + bob, 't'], [-0.38, 0.75 + bob]], rag, 41, 0.1, 8);
    // legs: long, bent, the right one dragging; long toes
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), drag = s > 0 ? 0.5 : 1, lift = Math.max(0, Math.sin(ph)) * 0.28 * drag;
      const hx = s * 0.1, hy = 1.0 + bob, kx = s * 0.22 + 0.12, ky = 0.55 + lift * 0.6, fx = s * 0.2 + 0.05 - lift * 0.1, fy = lift * 0.5 + 0.03;
      P_limb(ctx, [[hx, hy], [kx, ky], [fx, fy]], 0.075, flesh);
      P_limb(ctx, [[hx, hy], [kx, ky]], 0.03, sinew);
      P_ell(ctx, kx, ky, 0.045, 0.04, fleshD);
      fingers(ctx, fx, fy, s > 0 ? 0.2 : Math.PI - 0.2, 0.3, 0.14, 0.018, fleshD);
    }
    // the torso, hunched forward, ribs showing as sinew
    const torso = [[-0.17, 0.95 + bob], [0.17, 0.95 + bob], [0.27 + lean, 1.5 + bob], [-0.13 + lean, 1.52 + bob]];
    P_poly(ctx, torso, flesh);
    P_hatch(ctx, torso, 0.03, 0.3, 0.008, fleshD, { from: 0.08, to: 0.5 });
    for (let i = 0; i < 4; i++) P_line(ctx, -0.1 + lean * 0.5 + i * 0.01, 1.12 + i * 0.08 + bob, 0.2 + lean, 1.1 + i * 0.08 + bob, 0.01, sinew);
    // arms: the left swings, the right holds the shiv low; both too long
    const raise = smoothstep(lunge);
    for (const s of [-1, 1]) {
      const sw = s < 0 ? Math.sin(g) * 0.12 : 0;
      const sx = s * 0.2 + lean, sy = 1.45 + bob, ex = s * 0.4 + sw, ey = lerp(1.1, 1.5, raise), hx = s * lerp(0.36, 0.3, raise) + sw * 1.5, hy = lerp(0.62, 1.6, raise);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.065, flesh);
      P_limb(ctx, [[sx, sy], [ex, ey]], 0.025, sinew);
      P_ell(ctx, hx, hy, 0.045, 0.05, fleshD);
      fingers(ctx, hx, hy, lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, raise), 0.3, 0.16, 0.016, flesh);
      if (s > 0) { P_line(ctx, hx + 0.03, hy - 0.05, hx + 0.06, hy - 0.42, 0.03, bone); P_line(ctx, hx + 0.06, hy - 0.42, hx + 0.07, hy - 0.5, 0.012, bone); P_drip(ctx, hx + 0.065, hy - 0.46, 0.08, 0.01, blood, t, 7); }
    }
    // the sack: a square of cloth over the head, three holes, a seam, blood soaking through at the bottom
    ctx.save(); ctx.translate(0.1 + lean * 0.6, 1.5 + bob); ctx.rotate(Math.sin(t * 2.1) * 0.05 * (1 - lunge) - lean * 0.5);
    P_line(ctx, 0, 0, 0, 0.08, 0.09, flesh);
    const head = [[-0.17, 0.05], [0.17, 0.05], [0.19, 0.4], [0.14, 0.45], [-0.14, 0.45], [-0.19, 0.4]];
    P_poly(ctx, head, sack);
    P_hatch(ctx, head, 0.022, 1.2, 0.005, sackD, { from: 0.03, to: 0.4 });
    for (let i = 0; i < 4; i++) P_line(ctx, -0.12 + i * 0.08, 0.44, -0.09 + i * 0.08, 0.41, 0.006, sackD);
    P_ell(ctx, -0.07, 0.3, 0.032, 0.036, ink); P_ell(ctx, 0.07, 0.3, 0.032, 0.036, ink); P_ell(ctx, 0.0, 0.16, 0.028, 0.03, ink);
    P_poly(ctx, [[-0.17, 0.05], [0.17, 0.05], [0.15, 0.12], [-0.15, 0.1]], blood);
    P_drip(ctx, 0.05, 0.06, 0.12, 0.012, blood, t, 3); P_drip(ctx, -0.09, 0.06, 0.08, 0.01, blood, t, 4);
    ctx.restore();
  }
};
