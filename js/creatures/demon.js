'use strict';
// The demon: every shape that came before, and the one under them. c.anger (set by the night) is how much
// you are still holding: it lengthens the limbs, opens the face, and drives the pace. At zero it is only tall.
CREATURES.demon = {
  name: 'the demon', h: 2.6, w: 1.6, faceY: 2.35, stepRate: 0.55, catchDist: 1.2, sound: 'walker',
  death: { delay: 0.25, dur: 0.5, sting: 'sting' },
  voice: { kind: 'exhale', every: [4, 8] },
  init(c) { c.anger = 0; c.calm = 0; },
  speedMult(c, dt, seen) { return 1 + 0.45 * (c.anger || 0); },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 14, 0, 1), lunge = c.lunge || 0;
    const a = clamp((c.anger || 0) / 6, 0, 1) * (1 - (c.calm || 0));
    const body = P.col([4, 3, 6]), skin = P.col(mixc([110, 100, 104], [150, 30, 30], a)), eye = P.col([236, 232, 220]), black = P.col([0, 0, 0]);
    const bob = Math.abs(Math.sin(g)) * (0.04 + a * 0.06), sway = Math.sin(g) * (0.03 + a * 0.05);
    const legL = 1.3 + a * 0.35, armL = 0.9 + a * 0.6;
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * (0.2 + a * 0.2);
      P_limb(ctx, [[s * 0.1 + sway, legL + bob], [s * (0.14 + a * 0.12) + sway * 0.6, legL * 0.5 + lift * 0.7], [s * (0.17 + a * 0.2) + sway * 0.3, lift + 0.03]], 0.08 - a * 0.02, body);
    }
    const top = legL + 0.85 + bob;
    P_poly(ctx, [[-0.16 + sway, legL - 0.05 + bob], [0.16 + sway, legL - 0.05 + bob], [0.24 + sway * 0.6, top], [-0.24 + sway * 0.6, top]], body);
    const raise = smoothstep(Math.max(near * (0.5 + a * 0.5), lunge));
    for (const s of [-1, 1]) {
      const sx = s * 0.22 + sway * 0.6, sy = top - 0.05;
      const ex = s * lerp(0.26, 0.55 + a * 0.3, raise), ey = lerp(top - 0.5, top - 0.3, raise);
      const hx = s * lerp(0.28, 0.42 + a * 0.35, raise), hy = lerp(top - armL, top + 0.05, raise);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.06 - a * 0.015, body);
      fingers(ctx, hx, hy, lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), lerp(0.16, 0.34, raise), 0.18 + a * 0.16, 0.018, body);
    }
    // the head: the walker's face, and behind it, as it angers, the mouth opening the whole face
    const tilt = headTiltJerk(t, 2.7 - a * 1.5, 0.3 + a * 0.3) * (1 - lunge);
    ctx.save(); ctx.translate(sway * 0.6, top); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12 + a * 0.1, 0.07, body);
    P_ell(ctx, 0, 0.3 + a * 0.1, 0.115 + a * 0.03, 0.175 + a * 0.06, body);
    const fy = 0.285 + a * 0.1;
    P_ell(ctx, 0, fy, 0.085, 0.13, skin);
    P_ell(ctx, -0.036, fy + 0.03, 0.016 + a * 0.01, 0.012 + a * 0.008, eye); P_ell(ctx, 0.036, fy + 0.03, 0.016 + a * 0.01, 0.012 + a * 0.008, eye);
    const mw = 0.028 + near * 0.012 + a * 0.05, mh = 0.012 + near * 0.03 + lunge * 0.045 + a * 0.09;
    P_ell(ctx, 0, fy - 0.08, mw, mh, black);
    if (a > 0.3) for (let i = -2; i <= 2; i++) P_line(ctx, i * mw * 0.4, fy - 0.08 + mh * 0.9, i * mw * 0.4, fy - 0.08 + mh * 0.9 - mh * 0.5 * (a - 0.3), 0.01, P.col([220, 210, 200]));
    ctx.restore();
  }
};
