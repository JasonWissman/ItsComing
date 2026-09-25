'use strict';
CREATURES.smiler = {
  name: 'the smiler', h: 1.95, w: 1.0, faceY: 1.72, stepRate: 1.3, catchDist: 1.4, sound: 'smiler',
  death: { delay: 0.5, dur: 1.3, sting: 'stingHum' },
  voice: { kind: 'hum', every: [6, 12] },
  init(c) { c.nextHitch = 4.5; c.hitchT = 0; c.hitchFlash = 0; },
  speedMult(c, dt, seen) {
    c.hitchT += dt;
    if (c.hitchFlash > 0) c.hitchFlash -= dt;
    if (c.hitchT >= c.nextHitch && !c.frozen) {
      c.hitchT = 0; c.nextHitch = 3.2 + c.rand() * 3;
      c.u = Math.min(0.995, c.u + 0.02); c.hitchFlash = 0.18; c.hitched = true;
    }
    return 1;
  },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const coat = P.col([16, 14, 20]), coatL = P.col([30, 27, 36]);
    const skin = P.col([216, 208, 198]);
    const white = P.col([246, 242, 236]);
    const black = P.col([4, 4, 6]);
    const bob = Math.abs(Math.sin(g)) * 0.028;
    const jx = c.hitchFlash > 0 ? (c.rand() - 0.5) * 0.09 : 0;
    const lunge = c.lunge || 0;
    ctx.save(); ctx.translate(jx, 0);
    // legs
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.16;
      P_limb(ctx, [[s * 0.1, 0.95 + bob], [s * 0.12, 0.5 + lift * 0.6], [s * 0.13, lift + 0.03]], 0.11, coat);
      P_line(ctx, s * 0.1, lift + 0.03, s * 0.18, lift + 0.03, 0.06, black);
    }
    // long coat
    P_poly(ctx, [[-0.27, 0.62 + bob], [0.27, 0.62 + bob], [0.25, 1.62 + bob], [-0.25, 1.62 + bob]], coat);
    P_poly(ctx, [[-0.04, 1.0 + bob], [0.04, 1.0 + bob], [0.05, 1.6 + bob], [-0.05, 1.6 + bob]], coatL);
    // arms: perfectly still at the sides
    for (const s of [-1, 1]) {
      const ex = s * lerp(0.3, 0.36, lunge), hy = lerp(0.82, 1.35, lunge), hx = s * lerp(0.31, 0.22, lunge);
      P_limb(ctx, [[s * 0.26, 1.58 + bob], [ex, 1.15 + bob], [hx, hy + bob]], 0.075, coat);
      P_ell(ctx, hx, hy - 0.04 + bob, 0.04, 0.07, skin);
      if (near > 0.3 || lunge > 0) fingers(ctx, hx, hy - 0.08 + bob, lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, lunge), 0.2, 0.09 + near * 0.06, 0.016, skin);
    }
    // head, tilting further as it comes
    const tilt = (0.06 + near * 0.55 + lunge * 0.3) * (Math.floor(t / 7) % 2 ? -1 : 1);
    ctx.save(); ctx.translate(0, 1.62 + bob); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.08, 0.09, skin);
    P_ell(ctx, 0, 0.22, 0.125, 0.155, skin);
    // hair: slick, dark
    P_poly(ctx, [[-0.125, 0.25], [-0.1, 0.36], [0, 0.39], [0.1, 0.36], [0.125, 0.25], [0.06, 0.31], [-0.06, 0.31]], coat);
    // eyes: wide, whites showing
    const er = 0.026 + near * 0.014 + lunge * 0.01;
    P_ell(ctx, -0.047, 0.245, er, er * 1.05, white); P_ell(ctx, 0.047, 0.245, er, er * 1.05, white);
    P_ell(ctx, -0.047, 0.243, 0.008, 0.009, black); P_ell(ctx, 0.047, 0.243, 0.008, 0.009, black);
    // the grin
    const gw = 0.085 + near * 0.03 + lunge * 0.02, gd = 0.045 + near * 0.03 + lunge * 0.03;
    ctx.fillStyle = white; ctx.beginPath();
    ctx.moveTo(-gw, 0.15); ctx.quadraticCurveTo(0, 0.15 - gd * 0.25, gw, 0.15);
    ctx.quadraticCurveTo(0, 0.15 - gd * 2.2, -gw, 0.15); ctx.closePath(); ctx.fill();
    if (near > 0.15 || lunge > 0) {
      ctx.strokeStyle = P.cola([60, 40, 40], 0.8); ctx.lineWidth = 0.006; ctx.beginPath();
      for (let i = -3; i <= 3; i++) { const x = i * gw * 0.26; const d = gd * (1 - Math.abs(i) / 4.2); ctx.moveTo(x, 0.15 - d * 0.1); ctx.lineTo(x, 0.15 - d * 1.1); }
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }
};
