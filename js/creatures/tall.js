'use strict';
// The tall one: the walker's shape, three metres of it, ducking under the door frame or standing among the
// hanging clothes, moving in extreme slow motion. Its own clock runs at timeScale so every jerk is slowed.
// Light slows it further (c.inLight is set by the night).
CREATURES.tall = {
  name: 'the tall one', h: 3.0, w: 1.4, faceY: 2.6, stepRate: 1.3, catchDist: 1.0, sound: 'tall', timeScale: 0.12,
  death: { delay: 0.6, dur: 1.4, sting: 'stingHum' },
  voice: { kind: 'slow', every: [6, 12] },
  init(c) { c.inLight = false; },
  speedMult(c, dt, seen) { return c.inLight ? 0.25 : 1; },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 3.2, 0, 1), lunge = c.lunge || 0;
    const body = P.col([8, 7, 10]), skin = P.col([120, 108, 110]), eye = P.col([232, 228, 214]), black = P.col([2, 2, 3]);
    const duck = 0.18;   // it is too tall for the room
    const bob = Math.abs(Math.sin(g)) * 0.03, sway = Math.sin(g) * 0.03;
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 0.22;
      P_limb(ctx, [[s * 0.1 + sway, 1.5 + bob], [s * 0.14 + sway * 0.6, 0.75 + lift * 0.7], [s * 0.18 + sway * 0.3, lift + 0.03]], 0.085, body);
      P_line(ctx, s * 0.18 + sway * 0.3 - 0.03, lift + 0.03, s * 0.18 + sway * 0.3 + s * 0.11, lift + 0.03, 0.08, body);
    }
    P_poly(ctx, [[-0.17 + sway, 1.45 + bob], [0.17 + sway, 1.45 + bob], [0.26 + sway * 0.6, 2.4 + bob - duck], [-0.26 + sway * 0.6, 2.4 + bob - duck]], body);
    // arms: down to the knees, rising very slowly as it comes
    const raise = smoothstep(Math.max(near * 0.8, lunge));
    for (const s of [-1, 1]) {
      const sx = s * 0.25 + sway * 0.6, sy = 2.32 + bob - duck;
      const ex = s * lerp(0.28, 0.62, raise), ey = lerp(1.6, 1.9, raise);
      const hx = s * lerp(0.3, 0.5, raise), hy = lerp(0.85, 2.35, raise);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.065, body);
      fingers(ctx, hx, hy, lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), lerp(0.16, 0.32, raise), 0.24 + raise * 0.06, 0.02, body);
    }
    // the head, bent under the frame, the face lit by the moon and turned to you
    const tilt = headTiltJerk(t, 2.7, 0.3) * (1 - lunge) + 0.35 * duck;
    ctx.save(); ctx.translate(sway * 0.6, 2.4 + bob - duck); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.14, 0.08, body);
    P_ell(ctx, 0, 0.34, 0.13, 0.2, body);
    P_ell(ctx, 0, 0.32, 0.095, 0.15, skin);
    P_ell(ctx, -0.04, 0.36, 0.02, 0.016, eye); P_ell(ctx, 0.04, 0.36, 0.02, 0.016, eye);
    P_ell(ctx, -0.04, 0.36, 0.007, 0.007, black); P_ell(ctx, 0.04, 0.36, 0.007, 0.007, black);
    const mouth = 0.015 + near * 0.04 + lunge * 0.05;
    P_ell(ctx, 0, 0.23, 0.03 + near * 0.015, mouth, black);
    ctx.restore();
  }
};
