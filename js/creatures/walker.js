'use strict';
CREATURES.walker = {
  name: 'the walker', h: 2.45, w: 1.5, faceY: 2.25, stepRate: 0.55, catchDist: 1.5, sound: 'walker',
  voice: { kind: 'exhale', every: [5, 10] },
  init(c) { },
  speedMult(c, dt, seen) { return 1; },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const body = P.col([6, 6, 10]);
    const skin = P.col([92, 84, 88]);
    const eye = P.col([225, 218, 205]);
    const bob = Math.abs(Math.sin(g)) * 0.05;
    const sway = Math.sin(g) * 0.035;
    const hipY = 1.22 + bob;
    // legs (front view: feet lift alternately)
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.24;
      const hx = s * 0.08 + sway, kx = s * 0.12 + sway * 0.6, fx = s * 0.15 + sway * 0.3;
      P_limb(ctx, [[hx, hipY], [kx, hipY * 0.5 + lift * 0.75], [fx, lift + 0.03]], 0.075, body);
      P_line(ctx, fx - 0.03, lift + 0.03, fx + s * 0.09, lift + 0.03, 0.07, body);
    }
    // torso: far too narrow
    P_poly(ctx, [[-0.15 + sway, hipY - 0.06], [0.15 + sway, hipY - 0.06], [0.22 + sway * 0.6, 2.0 + bob], [-0.22 + sway * 0.6, 2.0 + bob]], body);
    // arms: hang to the knees; rise toward you when close
    const raise = smoothstep(Math.max(near, c.lunge || 0));
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? 0 : Math.PI);
      const swing = Math.sin(ph) * 0.05 * (1 - raise);
      const sx = s * 0.21 + sway * 0.6, sy = 1.95 + bob;
      const ex = s * lerp(0.24, 0.52, raise) + swing, ey = lerp(1.38, 1.55, raise);
      const hx = s * lerp(0.27, 0.4, raise) + swing * 2, hy = lerp(0.72, 1.95, raise);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
      const ang = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise);
      fingers(ctx, hx, hy, ang, lerp(0.16, 0.3, raise), 0.17 + raise * 0.05, 0.018, body);
    }
    // neck and head with a snapping tilt
    const tilt = headTiltJerk(t, 2.7, 0.33) * (1 - (c.lunge || 0));
    ctx.save();
    ctx.translate(sway * 0.6, 2.0 + bob);
    ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12, 0.07, body);
    P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      P_ell(ctx, 0, 0.285, 0.085, 0.13, skin);
      P_ell(ctx, -0.036, 0.315, 0.016, 0.012, eye);
      P_ell(ctx, 0.036, 0.315, 0.016, 0.012, eye);
      P_ell(ctx, -0.036, 0.315, 0.006, 0.006, body);
      P_ell(ctx, 0.036, 0.315, 0.006, 0.006, body);
      const mouth = 0.012 + near * 0.03 + (c.lunge || 0) * 0.045;
      P_ell(ctx, 0, 0.205, 0.028 + near * 0.012, mouth, body);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
};
