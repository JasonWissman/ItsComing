'use strict';
// The candlebearer: a thing in a trailing robe with the long skull of an animal, candles burning on its horns, its
// hands held out and dripping. It does not walk; it comes on like a procession. The candles are real light in the
// scene (the lab turns them into point lights) and the only warm thing in the picture.
CREATURES.candlebearer = {
  name: 'the candlebearer', h: 2.7, w: 1.9, faceY: 2.3, stepRate: 0.2, catchDist: 1.6, sound: null, lab: true, selfLit: true,
  init(c) { c.flames = []; },
  speedMult(c, dt, seen) { return 1; },
  draw(ctx, c, P) {
    const spot = P.spot || P.col, t = c.t, lunge = c.lunge || 0, near = clamp(1 - c.dist / 20, 0, 1);
    const robe = P.col([38, 14, 16]), robeL = P.col([70, 26, 30]), robeD = P.col([14, 5, 7]), bone = P.col([206, 196, 178]), boneD = P.col([140, 128, 112]);
    const ink = P.col([5, 3, 4]), blood = spot([150, 12, 18]), wax = P.col([226, 214, 190]), rune = P.col([120, 100, 80]);
    const sway = Math.sin(t * 0.9) * 0.025, breathe = Math.sin(t * 0.6) * 0.01;
    ctx.save(); ctx.translate(sway, 0);
    // the banners hang from the horns, behind everything
    for (const s of [-1, 1]) {
      const x = s * 0.36, ripple = Math.sin(t * 1.4 + s) * 0.02;
      P_tatter(ctx, [[x - 0.05, 2.62], [x + 0.05, 2.62], [x + 0.06 + ripple, 1.25, 't'], [x - 0.06 + ripple, 1.3]], robeD, 11 + s, 0.05, 5);
      for (let i = 0; i < 6; i++) P_line(ctx, x - 0.025, 2.45 - i * 0.18, x + 0.025 * (i % 2 ? 1 : -1), 2.4 - i * 0.18, 0.008, rune);
    }
    // the robe: a tall shape widening to a torn hem that spreads on the ground, the shoulders hunched and high
    const hem = [[-0.2, 2.1 + breathe], [0.2, 2.1 + breathe], [0.42, 2.0], [0.26, 1.4], [0.62, 0.0, 't'], [-0.62, 0.0], [-0.26, 1.4], [-0.42, 2.0]];
    P_tatter(ctx, hem, robe, 5, 0.12, 14);
    P_hatch(ctx, [[0.0, 2.05], [0.42, 2.0], [0.26, 1.4], [0.6, 0.02], [0.05, 0.02]], 0.05, 1.25, 0.009, robeD, { from: 0.05, to: 1.6 });
    P_poly(ctx, [[-0.08, 1.95], [0.08, 1.95], [0.04, 0.6], [-0.04, 0.6]], robeL);
    // arms out to the sides, long hands open, fingers running
    const raise = smoothstep(Math.max(near * 0.7, lunge));
    for (const s of [-1, 1]) {
      const sx = s * 0.4, sy = 2.0, ex = s * lerp(0.78, 0.6, raise), ey = lerp(1.72, 2.05, raise), hx = s * lerp(0.95, 0.55, raise), hy = lerp(1.5, 2.2, raise);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.075, robe);
      P_limb(ctx, [[ex, ey], [hx, hy]], 0.045, boneD);
      P_ell(ctx, hx, hy, 0.07, 0.08, bone);
      const ang = lerp(-Math.PI / 2 - s * 0.3, s > 0 ? Math.PI * 0.75 : Math.PI * 0.25, raise);
      fingers(ctx, hx, hy, ang, lerp(0.22, 0.34, raise), 0.3, 0.02, bone);
      for (let i = 0; i < 3; i++) { const a = ang + (i - 1) * lerp(0.22, 0.34, raise); P_drip(ctx, hx + Math.cos(a) * 0.3, hy + Math.sin(a) * 0.3, 0.14, 0.014, blood, t, 20 + s * 3 + i); }
    }
    // the head: a long skull, eye sockets, a wedge of a snout, the horns, and the candles on the horns
    ctx.save(); ctx.translate(0, 2.08 + breathe); ctx.rotate(Math.sin(t * 0.5) * 0.04);
    P_poly(ctx, [[-0.15, 0.0], [0.15, 0.0], [0.2, 0.3], [-0.2, 0.3]], robeD);   // the cowl behind
    P_ell(ctx, 0, 0.26, 0.105, 0.17, bone);
    P_poly(ctx, [[-0.07, 0.14], [0.07, 0.14], [0.035, -0.08], [-0.035, -0.08]], bone);
    P_hatchEll(ctx, 0, 0.26, 0.105, 0.17, 0.02, 0.005, boneD, 2.2, 0.45);
    P_ell(ctx, -0.042, 0.3, 0.028, 0.034, ink); P_ell(ctx, 0.042, 0.3, 0.028, 0.034, ink);
    P_ell(ctx, 0, 0.18, 0.012, 0.02, ink);
    for (const s of [-1, 1]) {
      P_brush(ctx, [[s * 0.07, 0.38], [s * 0.2, 0.5], [s * 0.32, 0.58], [s * 0.38, 0.52]], 0.05, boneD);
      P_brush(ctx, [[s * 0.07, 0.38], [s * 0.2, 0.5], [s * 0.32, 0.58], [s * 0.38, 0.52]], 0.03, bone);
    }
    const spots = [[-0.3, 0.6], [-0.15, 0.5], [0, 0.44], [0.15, 0.5], [0.3, 0.6]];
    c.flames.length = 0;
    spots.forEach(([x, y], i) => {
      P_rect(ctx, x - 0.016, y, 0.032, 0.09, wax);
      const f = P_flame(ctx, x, y + 0.09, 0.09 + near * 0.02, t, i * 1.7, P);
      if (P.glow) P.glow(f.x, f.y, 0.22, [255, 170, 70], 0.55);
      c.flames.push({ x: f.x + sway, y: 2.08 + breathe + f.y });
    });
    ctx.restore();
    ctx.restore();
  }
};
