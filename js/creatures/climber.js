'use strict';
// The climber: grey, hook-fingered, its face always turned up to you. It climbs the outside of the
// tower (a lane that goes down: you only see it looking over the rail) and moves only while unseen.
// Drawn as seen from above: arms spread up the wall, the face looking straight up at the viewer.
CREATURES.climber = {
  name: 'the climber', h: 2.0, w: 1.7, faceY: 1.75, stepRate: 0.9, catchDist: 1.5, sound: 'climber',
  death: { delay: 0.12, dur: 0.35, sting: 'stingScrape' },
  voice: { kind: 'exhale', every: [6, 12] },
  init(c) { c.look = 0; c.slideTo = null; },
  onSeen(c) { c.look = 1; },
  speedMult(c, dt, seen) { c.look = Math.max(0, c.look - dt * 0.6); return seen ? 0 : 1; },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 16, 0, 1), lunge = c.lunge || 0;
    const grey = P.col([118, 118, 124]), greyD = P.col([66, 66, 72]), face = P.col([204, 200, 192]), black = P.col([10, 8, 10]), eye = P.col([236, 236, 230]);
    const moving = c.moving && !c.frozen;
    // legs: splayed, toes hooked into the stone
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 0.16 * (moving ? 1 : 0);
      P_limb(ctx, [[s * 0.14, 0.95], [s * 0.42, 0.55 + lift], [s * 0.5, 0.08 + lift]], 0.075, greyD);
      fingers(ctx, s * 0.5, 0.08 + lift, -Math.PI / 2 + s * 0.4, 0.3, 0.1, 0.02, greyD);
    }
    // the body: long, thin, pressed to the wall
    P_poly(ctx, [[-0.18, 0.9], [0.18, 0.9], [0.24, 1.55], [-0.24, 1.55]], grey);
    for (let i = 0; i < 5; i++) P_ell(ctx, 0, 1.0 + i * 0.12, 0.05, 0.03, greyD);   // the spine, showing
    // arms: reaching up and out, hooked hands gripping above the head
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? 0 : Math.PI), reach = Math.sin(ph) * 0.12 * (moving ? 1 : 0);
      const ex = s * 0.55, ey = 1.72 + reach * 0.5, hx = s * (0.72 - lunge * 0.3), hy = 1.95 + reach - lunge * 0.4;
      P_limb(ctx, [[s * 0.22, 1.5], [ex, ey], [hx, hy]], 0.07, grey);
      const hs = 1 + lunge * 1.4;
      ctx.save(); ctx.translate(hx, hy); ctx.scale(hs, hs);
      P_ell(ctx, 0, 0, 0.07, 0.06, grey);
      fingers(ctx, 0, 0, Math.PI / 2 + s * 0.3, 0.42, 0.2, 0.026, greyD);
      for (let i = 0; i < 4; i++) { const a = Math.PI / 2 + s * 0.3 + (i - 1.5) * 0.42; const l = 0.2 * ((i === 0 || i === 3) ? 0.82 : 1); P_line(ctx, Math.cos(a) * l, Math.sin(a) * l, Math.cos(a) * l + Math.cos(a + s * 1.4) * 0.07, Math.sin(a) * l + Math.sin(a + s * 1.4) * 0.07, 0.024, greyD); }
      ctx.restore();
    }
    // the head, bent right back: the face is what you see
    const jerk = headTiltJerk(t, 3.1, 0.18) * (1 - lunge);
    ctx.save(); ctx.translate(0, 1.62); ctx.rotate(jerk);
    P_ell(ctx, 0, 0.12, 0.17, 0.2, grey);
    P_ell(ctx, 0, 0.13, 0.13, 0.16, face);
    P_ell(ctx, -0.055, 0.17, 0.03, 0.028, eye); P_ell(ctx, 0.055, 0.17, 0.03, 0.028, eye);
    P_ell(ctx, -0.055, 0.17, 0.009, 0.009, black); P_ell(ctx, 0.055, 0.17, 0.009, 0.009, black);
    const mo = 0.02 + near * 0.04 + lunge * 0.07 + c.look * 0.02;
    P_ell(ctx, 0, 0.03, 0.035 + near * 0.015, mo, black);
    ctx.restore();
  }
};
