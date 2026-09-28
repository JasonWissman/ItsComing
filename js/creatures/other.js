'use strict';
// The other: a porcelain doll the size of a small girl, always behind you, only ever seen in a mirror. It moves only
// while no mirror you are facing shows it. Lured to the music box it steps in through the boards, smiling, and dances.
// c.back (set by the night while it draws a reflection) draws it from behind.
CREATURES.other = {
  name: 'the doll', h: 1.35, w: 0.72, faceY: 1.14, stepRate: 1.6, catchDist: 1.3, sound: null, seenFrac: 0.6,
  death: { delay: 0.4, dur: 0.6, sting: 'stingHum' },
  voice: { kind: 'hum', every: [6, 11] },
  init(c) { c.lured = false; c.back = false; },
  speedMult(c, dt, seen) { if (c.lured) return 2.4; return seen ? 0 : 1; },
  draw(ctx, c, P) {
    const t = c.t, g = c.gait || 0, lunge = c.lunge || 0, back = !!c.back, dancing = !!c.lured;
    const porcelain = P.col([234, 224, 210]), porcelainD = P.col([198, 186, 172]), hair = P.col([40, 27, 22]), hairL = P.col([68, 46, 34]);
    const dress = P.col([178, 128, 142]), dressD = P.col([130, 88, 102]), lace = P.col([228, 220, 206]), ribbon = P.col([118, 22, 34]);
    const stocking = P.col([216, 210, 200]), shoe = P.col([16, 12, 14]), glass = P.col([24, 20, 30]), lip = P.col([168, 34, 44]);
    // a doll does not walk: it rocks from foot to foot, stiffly, and sways when it dances
    const rock = dancing ? Math.sin(t * 2.6) * 0.1 : (c.moving ? Math.sin(g) * 0.07 : 0);
    ctx.save(); ctx.rotate(rock);
    for (const s of [-1, 1]) {
      const lift = (c.moving || dancing) ? Math.max(0, Math.sin((dancing ? t * 2.6 : g) + (s > 0 ? Math.PI : 0))) * 0.04 : 0;
      P_line(ctx, s * 0.07, 0.44, s * 0.075, 0.06 + lift, 0.07, stocking);
      P_ell(ctx, s * 0.085, 0.035 + lift, 0.06, 0.035, shoe);
    }
    // the dress: a bell of faded pink over petticoats, a scalloped lace hem, a sash tied at the back
    P_poly(ctx, [[-0.13, 0.8], [0.13, 0.8], [0.3, 0.43], [-0.3, 0.43]], dress);
    for (let k = 0; k < 7; k++) P_ell(ctx, -0.27 + k * 0.09, 0.43, 0.05, 0.035, lace);
    P_poly(ctx, [[-0.12, 0.8], [0.12, 0.8], [0.12, 0.98], [-0.12, 0.98]], dress);
    P_rect(ctx, -0.125, 0.76, 0.25, 0.05, dressD);
    if (back) { P_ell(ctx, -0.06, 0.785, 0.06, 0.035, ribbon); P_ell(ctx, 0.06, 0.785, 0.06, 0.035, ribbon); P_line(ctx, 0.02, 0.77, 0.07, 0.6, 0.03, ribbon); P_line(ctx, -0.02, 0.77, -0.06, 0.6, 0.03, ribbon); }
    else { P_ell(ctx, -0.045, 0.975, 0.05, 0.03, lace); P_ell(ctx, 0.045, 0.975, 0.05, 0.03, lace); }
    // arms: jointed and stiff, a little out from the sides; dancing, they come up as if to take someone's hands
    for (const s of [-1, 1]) {
      const up = dancing ? 0.6 + Math.sin(t * 2.6 + s) * 0.15 : 0;
      P_ell(ctx, s * 0.13, 0.94, 0.05, 0.045, dress);
      const ex = s * (0.19 + lunge * 0.05), ey = 0.8 + up * 0.1 + lunge * 0.12, hx = s * (0.22 + lunge * 0.14 - up * 0.04), hy = 0.64 + up * 0.3 + lunge * 0.36;
      P_limb(ctx, [[s * 0.14, 0.92], [ex, ey], [hx, hy]], 0.045, porcelainD);
      P_ell(ctx, hx, hy - 0.01, 0.028, 0.034, porcelain);
    }
    // the head: too big for the body, tilted, snapping now and then to the other side; dancing, it lolls with the tune
    const tilt = (dancing ? Math.sin(t * 1.3) * 0.2 : headTiltJerk(t, 2.7, 0.16)) * (1 - lunge);
    ctx.save(); ctx.translate(0, 1.0); ctx.rotate(tilt);
    P_rect(ctx, -0.025, -0.02, 0.05, 0.05, porcelainD);
    if (back) {
      // from behind: a mass of ringlets and the bow, no face at all
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) P_ell(ctx, s * (0.1 + (k & 1) * 0.02), 0.12 - k * 0.055, 0.036, 0.04, (k & 1) ? hairL : hair);
      P_ell(ctx, 0, 0.14, 0.13, 0.145, hair);
      for (let k = 0; k < 3; k++) P_ell(ctx, -0.055 + k * 0.055, 0.03 - (k & 1) * 0.02, 0.032, 0.05, (k & 1) ? hairL : hair);
    } else {
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) P_ell(ctx, s * (0.125 + (k & 1) * 0.015), 0.13 - k * 0.058, 0.034, 0.038, (k & 1) ? hairL : hair);
      P_ell(ctx, 0, 0.13, 0.115, 0.135, porcelain);
      P_ell(ctx, 0, 0.225, 0.118, 0.055, hair);
      // glass eyes, too big and too dark, with painted lashes; the right one sits a little lower than the left
      for (const s of [-1, 1]) {
        const ey = 0.135 - (s > 0 ? 0.006 : 0), er = 0.027 + lunge * 0.01;
        P_ell(ctx, s * 0.045, ey, er, er * 1.15, glass);
        P_ell(ctx, s * 0.045 + 0.009, ey + 0.01, 0.007, 0.007, P.cola([255, 255, 255], 0.75));
        for (let k = -1; k <= 1; k++) P_line(ctx, s * 0.045 + k * 0.012, ey + 0.034, s * 0.045 + k * 0.018, ey + 0.048, 0.004, glass);
      }
      P_ell(ctx, -0.07, 0.09, 0.022, 0.016, P.cola([224, 112, 124], 0.55)); P_ell(ctx, 0.07, 0.09, 0.022, 0.016, P.cola([224, 112, 124], 0.55));
      P_limb(ctx, [[-0.01, 0.2], [-0.03, 0.17], [-0.02, 0.155], [-0.05, 0.11]], 0.005, P.col([96, 80, 74]));   // a hairline crack
      if (lunge > 0.25) P_ell(ctx, 0, 0.055, 0.02 + lunge * 0.035, 0.01 + lunge * 0.05, P.col([10, 4, 6]));
      else if (dancing) {
        // the smile: painted on, and much too wide
        ctx.strokeStyle = lip; ctx.lineWidth = 0.011; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0.095, 0.058, Math.PI + 0.45, TAU - 0.45); ctx.stroke();
        P_ell(ctx, -0.05, 0.075, 0.006, 0.006, lip); P_ell(ctx, 0.05, 0.075, 0.006, 0.006, lip);
      } else P_ell(ctx, 0, 0.055, 0.016, 0.01, lip);
    }
    // a big bow on top
    P_poly(ctx, [[0, 0.27], [-0.13, 0.32], [-0.12, 0.2]], ribbon); P_poly(ctx, [[0, 0.27], [0.13, 0.32], [0.12, 0.2]], ribbon);
    P_ell(ctx, 0, 0.265, 0.03, 0.025, ribbon);
    ctx.restore();
    ctx.restore();
  }
};
