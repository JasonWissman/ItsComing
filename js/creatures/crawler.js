'use strict';
CREATURES.crawler = {
  name: 'the crawler', h: 1.1, w: 2.0, faceY: 0.3, stepRate: 2.4, catchDist: 1.3, sound: 'crawler',
  death: { delay: 0.08, dur: 0.28, sting: 'stingShriek' },
  voice: { kind: 'clicks', every: [3, 7] },
  init(c) { c.mode = 'pause'; c.modeT = 0.4; },
  speedMult(c, dt, seen) {
    c.modeT += dt;
    if (c.mode === 'pause' && c.modeT > 1.05) { c.mode = 'scuttle'; c.modeT = 0; }
    else if (c.mode === 'scuttle' && c.modeT > 0.7) { c.mode = 'pause'; c.modeT = 0; }
    return c.mode === 'scuttle' ? 2.3 : 0.1;
  },
  draw(ctx, c, P) {
    const t = c.t;
    const scut = c.mode === 'scuttle' && !c.frozen;
    const near = clamp(1 - c.dist / 18, 0, 1);
    const lit = c.lit || 0;
    const skinC = mixc([150, 142, 130], [232, 224, 210], lit);
    const skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.62));
    const dark = P.col([40, 30, 34]);
    const mouthC = P.col([12, 6, 8]);
    const j = k => (scut ? Math.sin(t * 57 + k * 7.3) * 0.035 + Math.sin(t * 91 + k * 3.1) * 0.02 : 0);
    const lift = c.mode === 'pause' ? smoothstep(Math.min(1, c.modeT / 0.5)) * 0.14 : 0;
    const lunge = c.lunge || 0;
    // rear legs (long, knees way out)
    for (const s of [-1, 1]) {
      P_limb(ctx, [[s * 0.2, 0.55 + j(1)], [s * 0.86 + j(2 + s), 0.78 + j(3)], [s * 0.98 + j(4 + s), 0.02]], 0.07, skinD);
      fingers(ctx, s * 0.98 + j(4 + s), 0.02, s > 0 ? 0.2 : Math.PI - 0.2, 0.35, 0.13, 0.02, skinD);
    }
    // hump of the back, spine showing
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.moveTo(-0.44, 0.26); ctx.bezierCurveTo(-0.4, 1.02 + j(5), 0.4, 1.02 + j(6), 0.44, 0.26); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 6; i++) { const a = -0.35 + i * 0.14; P_ell(ctx, a, 0.88 - Math.abs(a) * 1.15 + j(7 + i) * 0.5, 0.035, 0.028, skinD); }
    // front arms: elbows above the back
    for (const s of [-1, 1]) {
      const ex = s * 0.64 + j(8 + s), ey = 0.98 + j(9 + s), hx = s * 0.6 + j(10 + s);
      P_limb(ctx, [[s * 0.28, 0.6], [ex, ey], [hx, 0.02]], 0.075, skin);
      fingers(ctx, hx, 0.02, s > 0 ? 0.35 : Math.PI - 0.35, 0.4, 0.16, 0.022, skin);
    }
    // head: low, in front, no eyes, big mouth
    const hy = 0.3 + lift + lunge * 0.1;
    ctx.save(); ctx.translate(j(11) * 0.5, hy); ctx.rotate(lift * 1.2 + (scut ? Math.sin(t * 40) * 0.08 : 0));
    strands(ctx, 0, 0.06, 9, 0.28, dark, 3, t);
    P_ell(ctx, 0, 0, 0.16, 0.125, skin);
    P_ell(ctx, 0, 0.04, 0.12, 0.06, skinD);      // brow shadow
    const mw = 0.05 + (near * 0.5 + lunge) * 0.07, mh = 0.025 + (near * 0.5 + lunge) * 0.09;
    P_ell(ctx, 0, -0.045, mw, mh, mouthC);
    if (near > 0.2) for (let i = -2; i <= 2; i++) P_line(ctx, i * mw * 0.35, -0.045 + mh * 0.9, i * mw * 0.35, -0.045 + mh * 0.9 - mh * 0.45, 0.012, skin);
    ctx.restore();
  }
};
