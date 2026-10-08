'use strict';
// The gaunt: the walker's cousin, starved to the bone, hair standing on end, eyes too big and too white, every
// finger a claw. Drawn as ink and wash: a dark red-brown body, a grey-green head, hatched ribs. It lopes, arms
// swinging wide, and leans at you as it closes.
CREATURES.gaunt = {
  name: 'the gaunt', h: 2.1, w: 1.5, faceY: 1.9, stepRate: 0.8, catchDist: 1.4, sound: null, lab: true,
  init(c) { },
  speedMult(c, dt, seen) { return 1; },
  draw(ctx, c, P) {
    const spot = P.spot || P.col, g = c.gait, t = c.t, lunge = c.lunge || 0, near = clamp(1 - c.dist / 20, 0, 1);
    const body = P.col([112, 58, 46]), bodyD = P.col([62, 28, 22]), head = P.col([122, 140, 128]), headD = P.col([70, 86, 78]);
    const ink = P.col([6, 4, 5]), white = spot([244, 242, 236]), teeth = P.col([225, 218, 205]), hair = P.col([18, 14, 14]);
    const bob = Math.abs(Math.sin(g)) * 0.06, lean = near * 0.14;
    // legs: long, knees knobbed, the stride wide
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 0.3;
      const hx = s * 0.08, hy = 1.08 + bob, kx = s * 0.14 + lift * 0.25, ky = 0.55 + lift * 0.5, fx = s * 0.16 + lift * 0.1, fy = lift * 0.6 + 0.03;
      P_limb(ctx, [[hx, hy], [kx, ky], [fx, fy]], 0.055, body);
      P_ell(ctx, kx, ky, 0.04, 0.035, bodyD);
      fingers(ctx, fx, fy, s > 0 ? 0.2 : Math.PI - 0.2, 0.28, 0.1, 0.012, bodyD);
    }
    // the torso: narrow, the belly sunk, the ribs as hatching
    const torso = [[-0.13, 1.0 + bob], [0.13, 1.0 + bob], [0.2 + lean, 1.62 + bob], [-0.2 + lean, 1.62 + bob]];
    P_poly(ctx, torso, body);
    P_hatch(ctx, [[-0.18 + lean * 0.7, 1.25 + bob], [0.18 + lean * 0.7, 1.25 + bob], [0.2 + lean, 1.58 + bob], [-0.2 + lean, 1.58 + bob]], 0.032, 0.15, 0.009, bodyD);
    P_hatch(ctx, torso, 0.03, 1.2, 0.007, bodyD, { from: 0.06, to: 0.4 });
    P_poly(ctx, [[-0.06 + lean * 0.5, 1.02 + bob], [0.06 + lean * 0.5, 1.02 + bob], [0.03 + lean * 0.7, 1.24 + bob], [-0.03 + lean * 0.7, 1.24 + bob]], bodyD);   // the sunk belly
    // arms: swinging wide, claws
    const raise = smoothstep(Math.max(near * 0.6, lunge));
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? 0 : Math.PI), swing = Math.sin(ph) * 0.18 * (1 - raise);
      const sx = s * 0.2 + lean, sy = 1.58 + bob, ex = s * lerp(0.36, 0.5, raise) + swing, ey = lerp(1.2, 1.45, raise) + swing * 0.3, hx = s * lerp(0.32, 0.42, raise) + swing * 2, hy = lerp(0.72, 1.85, raise);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.045, body);
      P_ell(ctx, ex, ey, 0.03, 0.03, bodyD);
      fingers(ctx, hx, hy, lerp(-Math.PI / 2 + swing, s > 0 ? Math.PI * 0.4 : Math.PI * 0.6, raise), lerp(0.2, 0.32, raise), 0.22 + raise * 0.05, 0.013, bodyD);
    }
    // the neck and head: grey, the eyes huge, the mouth all teeth, the hair standing up
    const tilt = headTiltJerk(t, 3.1, 0.22) * (1 - lunge) - lean * 0.6;
    ctx.save(); ctx.translate(lean * 0.9, 1.6 + bob); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.14, 0.07, head);
    for (let i = 0; i < 4; i++) P_line(ctx, -0.03, 0.02 + i * 0.03, 0.03, 0.02 + i * 0.03, 0.006, headD);   // the strings of the neck
    P_wildHair(ctx, 0, 0.36, 24, 0.36, 0.008, hair, 9, t);
    P_ell(ctx, 0, 0.28, 0.105, 0.145, head);
    P_hatchEll(ctx, 0, 0.28, 0.105, 0.145, 0.02, 0.005, headD, 2.2, 0.4);
    for (const s of [-1, 1]) { P_ell(ctx, s * 0.045, 0.31, 0.034, 0.036, white); P_ell(ctx, s * 0.045, 0.31, 0.009, 0.009, ink); P_ell(ctx, s * 0.045, 0.335, 0.034, 0.012, headD); }
    P_ell(ctx, 0, 0.26, 0.012, 0.018, headD);
    const mw = 0.06 + near * 0.02, mh = 0.025 + near * 0.025 + lunge * 0.03;
    P_ell(ctx, 0, 0.18, mw, mh, ink);
    ctx.strokeStyle = teeth; ctx.lineWidth = 0.009; ctx.beginPath(); for (let i = -3; i <= 3; i++) { ctx.moveTo(i * mw * 0.27, 0.18 + mh * 0.9); ctx.lineTo(i * mw * 0.27, 0.18 + mh * 0.2); } ctx.stroke();
    ctx.restore();
  }
};
