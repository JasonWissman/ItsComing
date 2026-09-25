'use strict';
// The customer: man-shaped, dressed like someone, too straight, its features smoothed away.
// It moves only while you are looking at it (faster the better you see it), and freely in the dark.
// c.dark is set by the night each frame.
CREATURES.customer = {
  name: 'the customer', h: 2.0, w: 1.2, faceY: 1.82, stepRate: 0.75, catchDist: 1.5, sound: 'shoes',
  death: { delay: 0.35, dur: 0.55, sting: 'stingGlass' },
  init(c) { c.dark = false; c.away = false; },
  speedMult(c, dt, seen) {
    if (c.dead) return 0;
    if (c.dark) return seen ? Math.max(1, 1.6 * c.visFrac) : 1;
    return seen ? 1.6 * c.visFrac : 0;
  },
  draw(ctx, c, P) {
    const g = c.gait, near = clamp(1 - c.dist / 8, 0, 1), lunge = c.lunge || 0;
    const suit = P.col([14, 12, 16]), suitL = P.col([30, 28, 34]), shirt = P.col([210, 206, 198]), skin = P.col([212, 198, 186]), skinD = P.col([170, 152, 140]), black = P.col([6, 4, 6]);
    const back = !!c.away;
    const lift = c.moving ? 0.05 : 0;
    // legs: small, even steps, never bending much
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), l = Math.max(0, Math.sin(ph)) * lift;
      P_limb(ctx, [[s * 0.1, 1.0], [s * 0.11, 0.5 + l * 0.5], [s * 0.12, l + 0.03]], 0.11, suit);
      P_ell(ctx, s * 0.13, l + 0.03, 0.09, 0.035, black);
    }
    // the coat, buttoned; a collar and tie at the front
    P_poly(ctx, [[-0.24, 0.95], [0.24, 0.95], [0.28, 1.68], [-0.28, 1.68]], suit);
    if (!back) { P_poly(ctx, [[-0.07, 1.4], [0.07, 1.4], [0.11, 1.68], [-0.11, 1.68]], shirt); P_poly(ctx, [[-0.02, 1.35], [0.02, 1.35], [0.035, 1.62], [-0.035, 1.62]], suitL); }
    else P_line(ctx, 0, 1.0, 0, 1.64, 0.012, suitL);
    // arms: straight down at the sides, hands open and still
    for (const s of [-1, 1]) {
      P_limb(ctx, [[s * 0.27, 1.62], [s * 0.31, 1.25], [s * 0.3, 0.92]], 0.085, suit);
      P_ell(ctx, s * 0.3, 0.86, 0.045, 0.07, skin);
    }
    // the head: smooth, pale, a hat with a brim
    ctx.save(); ctx.translate(0, 1.66);
    P_line(ctx, 0, 0, 0, 0.06, 0.09, skin);
    P_ell(ctx, 0, 0.19, 0.115, 0.15, skin);
    if (!back) {
      // where the features should be: faint dents, then something opening
      const fa = 0.2 + near * 0.5;
      P_ell(ctx, -0.045, 0.22, 0.03, 0.02, P.cola([170, 152, 140], fa)); P_ell(ctx, 0.045, 0.22, 0.03, 0.02, P.cola([170, 152, 140], fa));
      P_line(ctx, -0.04, 0.1, 0.04, 0.1, 0.012, P.cola([170, 152, 140], fa));
      if (lunge > 0.5) { const k = (lunge - 0.5) * 2; P_ell(ctx, 0, 0.1, 0.03 + k * 0.05, 0.02 + k * 0.09, black); }
    } else P_ell(ctx, 0, 0.14, 0.09, 0.08, skinD);
    P_ell(ctx, 0, 0.3, 0.2, 0.035, suit);
    P_rect(ctx, -0.11, 0.3, 0.22, 0.13, suit);
    P_rect(ctx, -0.11, 0.3, 0.22, 0.025, suitL);
    ctx.restore();
  }
};
