'use strict';
// The other: a back-lit smear of a person, always behind you, only ever seen in a mirror. It moves only
// while no mirror shows it. c.follow is cleared by the night when it is lured away to the music box.
CREATURES.other = {
  name: 'the other', h: 2.4, w: 1.3, faceY: 2.1, stepRate: 0.5, catchDist: 1.4, sound: null,
  death: { delay: 0.4, dur: 0.6, sting: 'stingHum' },
  voice: { kind: 'hum', every: [6, 11] },
  init(c) { c.lured = false; c.dance = 0; },
  speedMult(c, dt, seen) { if (c.lured) return 0.9; return seen ? 0 : 1; },
  draw(ctx, c, P) {
    const t = c.t, near = clamp(1 - c.dist / 9, 0, 1), lunge = c.lunge || 0;
    const body = P.col([8, 6, 10]), rim = P.cola([255, 214, 160], 0.75), rimD = P.cola([255, 170, 90], 0.35), smear = P.cola([230, 200, 170], 0.5);
    const sway = c.lured ? Math.sin(t * 2.6) * 0.12 : 0, lean = c.lured ? Math.sin(t * 1.3) * 0.05 : 0;
    ctx.save(); ctx.translate(sway, 0); ctx.rotate(lean);
    // a tall dark shape, back-lit: a bright rim down one side and the edges of the head and shoulders
    P_poly(ctx, [[-0.3, 0], [0.3, 0], [0.34, 1.5], [0.3, 2.0], [0.2, 2.1], [0.16, 2.4], [-0.16, 2.4], [-0.2, 2.1], [-0.3, 2.0], [-0.34, 1.5]], body);
    for (const s of [-1, 1]) P_limb(ctx, [[s * 0.3, 1.95], [s * (0.44 + lunge * 0.3), 1.35 - lunge * 0.2], [s * (0.36 + lunge * 0.5), 0.75 + lunge * 1.0]], 0.1, body);
    P_line(ctx, 0.31, 0.05, 0.34, 1.5, 0.03, rim); P_line(ctx, 0.3, 2.0, 0.17, 2.38, 0.025, rim); P_line(ctx, -0.16, 2.4, 0.16, 2.4, 0.02, rimD);
    P_line(ctx, -0.34, 1.5, -0.3, 2.0, 0.02, rimD);
    // the face: vertical smears where features should be, sliding as it comes
    ctx.globalAlpha = 0.35 + near * 0.5;
    for (let k = 0; k < 5; k++) { const x = -0.1 + k * 0.05 + Math.sin(t * 0.7 + k) * 0.01; P_line(ctx, x, 2.0 + Math.sin(t * 1.1 + k * 2) * 0.03, x + 0.01, 2.3, 0.02 + near * 0.01, smear); }
    if (lunge > 0.3) P_ell(ctx, 0, 2.08, 0.07 + lunge * 0.05, 0.05 + lunge * 0.1, P.col([2, 1, 2]));
    ctx.globalAlpha = 1;
    ctx.restore();
  }
};
