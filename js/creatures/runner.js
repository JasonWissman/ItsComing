'use strict';
CREATURES.runner = {
  name: 'the runner', h: 2.05, w: 1.7, faceY: 1.8, stepRate: 0.7, catchDist: 1.4, sound: 'runner',
  init(c) { c.mode = 'crouch'; c.modeT = -0.5; c.hits = 0; c.wounded = false; c.dead = false; c.hurtFlash = 0; },
  speedMult(c, dt, seen) {
    if (c.dead) return 0;
    c.modeT += dt;
    if (c.hurtFlash > 0) c.hurtFlash -= dt;
    if (c.wounded) {
      if (c.mode === 'stumble') { if (c.modeT > 1.5) { c.mode = 'sprint'; c.modeT = 0; } return 0; }
      return 1.6;
    }
    if (c.mode === 'sprint' && c.modeT > 2.3) { c.mode = 'crouch'; c.modeT = 0; }
    else if (c.mode === 'crouch' && c.modeT > 1.25) { c.mode = 'sprint'; c.modeT = 0; }
    return c.mode === 'sprint' ? 1.5 : 0;
  },
  lateral(c) { return c.dead ? c.latHold || 0 : Math.sin(c.t * 0.85) * 1.1 * clamp((c.dist - 4) / 10, 0, 1); },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 20, 0, 1);
    const rags = P.col([26, 22, 22]), ragsL = P.col([48, 40, 38]);
    const skin = P.col([196, 184, 172]), skinD = P.col([120, 104, 96]);
    const black = P.col([6, 4, 6]);
    const blood = P.col([120, 10, 12]);
    const lunge = c.lunge || 0;
    const hurt = c.hurtFlash > 0;
    if (c.dead) {
      // lying face-up in the snow
      P_ell(ctx, 0, 0.16, 0.95, 0.15, rags);
      P_line(ctx, -0.6, 0.2, -0.9, 0.45, 0.07, rags); P_line(ctx, 0.7, 0.18, 0.95, 0.05, 0.07, rags);
      P_ell(ctx, -0.95, 0.2, 0.16, 0.14, skin);
      P_ell(ctx, -0.5, 0.06, 0.55, 0.06, blood);
      return;
    }
    const crouch = c.mode === 'crouch' || c.mode === 'stumble';
    if (crouch && !lunge) {
      const stumble = c.mode === 'stumble';
      const lift = smoothstep(Math.min(1, Math.max(0, c.modeT) / 0.4));
      // on all fours, head raised toward you
      for (const s of [-1, 1]) {
        P_limb(ctx, [[s * 0.22, 0.62], [s * 0.6, 0.55], [s * 0.72, 0.02]], 0.08, rags);
        P_limb(ctx, [[s * 0.25, 0.75], [s * 0.48, 0.4], [s * 0.42, 0.02]], 0.07, skin);
        fingers(ctx, s * 0.42, 0.02, s > 0 ? 0.3 : Math.PI - 0.3, 0.35, 0.14, 0.02, skin);
      }
      ctx.fillStyle = rags; ctx.beginPath(); ctx.moveTo(-0.34, 0.3); ctx.bezierCurveTo(-0.3, 1.0, 0.3, 1.0, 0.34, 0.3); ctx.closePath(); ctx.fill();
      if (stumble) P_ell(ctx, 0.1, 0.55, 0.14, 0.1, blood);
      const hy = 0.55 + lift * 0.22;
      ctx.save(); ctx.translate(0, hy); ctx.rotate(Math.sin(t * 2.2) * 0.12);
      strands(ctx, 0, 0.1, 9, 0.36, black, 5, t);
      P_ell(ctx, 0, 0, 0.14, 0.17, skin);
      P_ell(ctx, -0.055, 0.03, 0.036, 0.04, black); P_ell(ctx, 0.055, 0.03, 0.036, 0.04, black);
      P_ell(ctx, 0, -0.1, 0.045, 0.06 + near * 0.03, black);
      ctx.restore();
      if (hurt) { ctx.globalAlpha = 0.5; P_ell(ctx, 0, 0.5, 0.9, 0.6, blood); ctx.globalAlpha = 1; }
      return;
    }
    // sprinting (or lunging)
    const bob = Math.abs(Math.sin(g)) * 0.09 * (1 - lunge);
    const lean = 0.12 * (1 - lunge);
    const wounded = c.wounded ? 1 : 0;
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.55 * (1 - lunge);
      const hx = s * 0.1, hy = 1.0 + bob;
      P_limb(ctx, [[hx, hy], [s * (0.2 + lift * 0.25), 0.55 + lift * 0.55], [s * (0.22 + lift * 0.1), lift * 0.65 + 0.03]], 0.085, rags);
      P_ell(ctx, s * (0.22 + lift * 0.1), lift * 0.65 + 0.03, 0.06, 0.04, skinD);
    }
    // torso leaning at you
    P_poly(ctx, [[-0.2, 0.95 + bob], [0.2, 0.95 + bob], [0.27 + lean, 1.6 + bob - wounded * 0.1], [-0.27 + lean, 1.6 + bob - wounded * 0.1]], rags);
    P_poly(ctx, [[-0.08, 1.0 + bob], [0.1, 1.05 + bob], [0.14, 1.5 + bob], [-0.05, 1.45 + bob]], ragsL);
    if (c.wounded) P_ell(ctx, 0.12, 1.25 + bob, 0.12, 0.14, blood);
    // arms: pumping wildly, elbows out; reaching when lunging
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? 0 : Math.PI);
      const sw = Math.sin(ph) * (1 - lunge);
      const sx = s * 0.25 + lean, sy = 1.55 + bob;
      const ex = s * lerp(0.42, 0.5, lunge) + sw * 0.05, ey = lerp(1.2 + sw * 0.25, 1.45, lunge);
      const hx = s * lerp(0.28, 0.3, lunge) + sw * 0.1, hy = lerp(1.35 + sw * 0.35, 1.35, lunge);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.07, rags);
      P_ell(ctx, hx, hy, 0.045, 0.055, skin);
      fingers(ctx, hx, hy, lerp(-Math.PI / 2 + sw * 0.5, s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, lunge), 0.3, 0.12 + lunge * 0.06, 0.018, skin);
    }
    // head: sockets and a slack jaw
    ctx.save(); ctx.translate(lean * 0.8, 1.6 + bob); ctx.rotate(Math.sin(g * 0.5) * 0.08 * (1 - lunge));
    P_line(ctx, 0, 0, 0, 0.08, 0.08, skin);
    strands(ctx, 0, 0.3, 9, 0.34, black, 5, t);
    P_ell(ctx, 0, 0.22, 0.13, 0.16, skin);
    P_ell(ctx, -0.052, 0.25, 0.036, 0.042, black); P_ell(ctx, 0.052, 0.25, 0.036, 0.042, black);
    P_ell(ctx, 0, 0.1, 0.045 + lunge * 0.01, 0.055 + near * 0.025 + lunge * 0.03, black);
    ctx.restore();
    if (hurt) { ctx.globalAlpha = 0.5; P_ell(ctx, 0, 1.1, 0.7, 0.9, blood); ctx.globalAlpha = 1; }
  }
};
