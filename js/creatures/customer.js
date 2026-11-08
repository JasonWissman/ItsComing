'use strict';
// The customer: man-shaped, dressed like someone, too straight, its features smoothed away.
// It is drawn to light, and it does not care whether you look at it. While the place it is coming for is lit it comes
// fast; in the dark it walks at an ordinary pace. The night sets c.drawn (whether its light is on) and c.drawnMult (how
// much faster the light makes it) every frame.
// A night can send it sideways, running (The Diner, from a shut window to one still open): c.runPose on, c.runTurn 0..1
// as it turns side on and back (it pivots on the spot, stiffly, like a figure on a turntable), c.runDir +1 running to
// the right of the view and -1 to the left, c.runGait its stride and c.runAmt 0..1 how hard it is running.
CREATURES.customer = {
  name: 'the customer', h: 2.0, w: 1.2, faceY: 1.82, stepRate: 0.75, catchDist: 1.5, sound: 'shoes', ignoresGaze: true,
  death: { delay: 0.35, dur: 0.55, sting: 'stingGlass' },
  init(c) { c.drawn = false; c.drawnMult = 1; c.away = false; },
  speedMult(c) {
    if (c.dead) return 0;
    return c.drawn ? c.drawnMult : 1;
  },
  draw(ctx, c, P) {
    // turning to run, or back: squeezed edge on at the half-way point, the front before it and the side after
    const turn = c.runPose ? (c.runTurn === undefined ? 1 : c.runTurn) : 0;
    if (turn <= 0) { this.drawFront(ctx, c, P); return; }
    ctx.save(); ctx.scale(Math.max(0.08, Math.abs(Math.cos(turn * Math.PI))), 1);
    if (turn >= 0.5) this.drawRun(ctx, c, P); else this.drawFront(ctx, c, P);
    ctx.restore();
  },
  drawFront(ctx, c, P) {
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
  },
  // running, seen from the side, and too straight about it: the body bolt upright and dead level however hard it runs,
  // the hat never bobbing, the arms straight as rods swinging from the shoulder with the hands flat; only the legs work,
  // long scissoring strides under it, and the coat's tails fly out behind. From the side its face is one smooth curve,
  // no nose and no brow. Drawn facing +x and mirrored by c.runDir; c.runAmt 0 is standing side on, 1 flat out.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, k = c.runAmt === undefined ? 1 : c.runAmt, near = clamp(1 - c.dist / 8, 0, 1);
    const suit = P.col([14, 12, 16]), suitL = P.col([30, 28, 34]), suitD = P.col([7, 6, 9]), shirt = P.col([210, 206, 198]), skin = P.col([212, 198, 186]), skinD = P.col([170, 152, 140]), black = P.col([6, 4, 6]);
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const hipY = lerp(1.03, 0.94, k), top = hipY + 0.7, S = 0.42 * k, lift = 0.36 * k, seg = 0.5;
    // a foot: on the ground and going back under it for half the stride, then up behind and through to the front. The
    // knee is wherever two equal bones from the hip put it, bending forward.
    const leg = o => {
      const u = (((g + o) / TAU) % 1 + 1) % 1, v = u < 0.5 ? 0 : (u - 0.5) * 2;
      let fx = u < 0.5 ? S * (1 - 4 * u) : -S + 2 * S * smoothstep(v), fy = 0.035 + (u < 0.5 ? 0 : lift * Math.sin(Math.PI * Math.pow(v, 0.7)));
      let dx = fx, dy = fy - hipY;
      const n = Math.hypot(dx, dy) || 1, d = Math.min(n, 2 * seg * 0.999);
      dx *= d / n; dy *= d / n; fx = dx; fy = hipY + dy;
      const h = Math.sqrt(seg * seg - d * d / 4);
      return { u, v, fx, fy, kx: dx / 2 - dy / d * h, ky: hipY + dy / 2 + dx / d * h };
    };
    const legs = [leg(0), leg(Math.PI)];
    const drawLeg = (l, col) => {
      P_limb(ctx, [[0, hipY], [l.kx, l.ky], [l.fx, l.fy]], 0.11, col);
      const rot = l.u < 0.5 ? 0 : 0.7 * Math.sin(Math.PI * l.v) * k;   // the heel comes up as the foot leaves the ground
      P_ell(ctx, l.fx + Math.cos(rot) * 0.05, l.fy + Math.sin(rot) * 0.05, 0.11, 0.038, black, rot);
    };
    // an arm: straight from the shoulder, swinging against the leg on its own side
    const sh = [0.0, top - 0.06];
    const drawArm = (l, col) => {
      const a = -Math.cos(l.u * TAU) * 0.85 * k, ex = sh[0] + Math.sin(a) * 0.6, ey = sh[1] - Math.cos(a) * 0.6;
      P_limb(ctx, [sh, [ex, ey]], 0.085, col);
      P_ell(ctx, ex + Math.sin(a) * 0.06, ey - Math.cos(a) * 0.06, 0.035, 0.08, skin, a);
    };
    drawArm(legs[1], suitD); drawLeg(legs[1], suitD);   // the far side first
    // the coat, side on: buttoned at the front, its tails flying out behind
    const flare = k * (0.08 + 0.025 * Math.sin(g * 2));
    P_poly(ctx, [[-0.12, top], [0.09, top - 0.02], [0.135, top - 0.3], [0.12, hipY - 0.06], [0.03, hipY - 0.1], [-0.11 - flare, hipY - 0.1 + flare * 0.9], [-0.13, hipY + 0.25]], suit);
    P_poly(ctx, [[0.05, top - 0.005], [0.105, top - 0.03], [0.135, top - 0.26], [0.115, top - 0.3], [0.085, top - 0.1]], shirt);   // the collar and the shirt front between the lapels
    P_line(ctx, 0.118, top - 0.06, 0.13, top - 0.28, 0.022, suitL);   // the tie
    P_line(ctx, 0.07, top - 0.03, 0.115, top - 0.36, 0.014, suitL);   // the lapel
    drawLeg(legs[0], suit); drawArm(legs[0], suit);
    P_line(ctx, sh[0] + 0.02, sh[1] + 0.02, sh[0] + 0.02, sh[1] - 0.04, 0.1, suit);   // the near shoulder, over the top of the arm
    // the head, dead level: the face a smooth curve, a faint dent where the eye should be, the hat square on it
    ctx.save(); ctx.translate(0.01, top);
    P_line(ctx, 0, -0.02, 0.01, 0.06, 0.09, skin);
    P_ell(ctx, 0.02, 0.19, 0.115, 0.15, skin);
    P_ell(ctx, -0.035, 0.18, 0.07, 0.12, skinD);   // the back of the head, in its own shadow
    const fa = 0.2 + near * 0.5;
    P_ell(ctx, 0.095, 0.22, 0.022, 0.014, P.cola([150, 132, 120], fa));
    P_line(ctx, 0.085, 0.1, 0.125, 0.1, 0.01, P.cola([150, 132, 120], fa));
    P_ell(ctx, 0.02, 0.3, 0.2, 0.035, suit);
    P_rect(ctx, -0.09, 0.3, 0.21, 0.13, suit);
    P_rect(ctx, -0.09, 0.3, 0.21, 0.025, suitL);
    ctx.restore();
    ctx.restore();
  },
};
