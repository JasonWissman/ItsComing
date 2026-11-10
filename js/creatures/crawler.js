'use strict';
// The crawler: pale, on all fours, in bursts. A night can send it scuttling sideways (The Road's shying out of the
// lights): c.runPose on, side-on, facing c.runDir (1 right, -1 left), its legs at c.runGait.
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
    if (c.runPose && !c.lunge) { this.drawRun(ctx, c, P); return; }
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
  },
  // side-on, scuttling: the long back humped low, the spine along it, the head thrust out in front with its mouth open and
  // its hair streaming back, the long legs folded up high over the back and flung out and down in turn, fast. Drawn facing
  // right; c.runDir -1 mirrors it
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, t = c.t, lit = c.lit || 0;
    const skinC = mixc([150, 142, 130], [232, 224, 210], lit), skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.62)), dark = P.col([40, 30, 34]), mouthC = P.col([12, 6, 8]);
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const bob = Math.abs(Math.sin(g * 2)) * 0.04;
    // a leg from the hip: the knee folded up over the back, the hand or foot reaching out along the ground and pulled back
    const leg = (hx, hy, ph, reach, col, w) => {
      const sw = Math.sin(ph), lift = Math.max(0, Math.cos(ph)) * 0.14, fx = hx + sw * reach, fy = lift;
      const kx = (hx + fx) / 2 + (reach > 0 ? 0.12 : -0.12), ky = 0.98 + bob + lift * 0.4;
      P_limb(ctx, [[hx, hy + bob], [kx, ky], [fx, fy + 0.02]], w, col);
      fingers(ctx, fx, fy + 0.02, sw > 0 ? 0.25 : -0.1, 0.35, 0.12, 0.018, col);
    };
    leg(-0.3, 0.5, g + Math.PI, 0.42, skinD, 0.06); leg(0.28, 0.55, g, 0.4, skinD, 0.065);            // the far pair
    ctx.fillStyle = skin;                                                                                 // the back, long and low
    ctx.beginPath(); ctx.moveTo(-0.62, 0.36 + bob); ctx.bezierCurveTo(-0.5, 0.86 + bob, 0.3, 0.92 + bob, 0.56, 0.4 + bob); ctx.lineTo(0.5, 0.3 + bob); ctx.bezierCurveTo(0.2, 0.36 + bob, -0.3, 0.3 + bob, -0.62, 0.36 + bob); ctx.fill();
    for (let i = 0; i < 7; i++) { const x = -0.48 + i * 0.15, y = 0.4 + bob + 0.42 * Math.sin((x + 0.62) / 1.18 * Math.PI) - 0.04; P_ell(ctx, x, y, 0.035, 0.026, skinD); }   // the spine
    // the head, thrust out in front, low, its hair streaming back over the shoulders
    ctx.save(); ctx.translate(0.72, 0.36 + bob); ctx.rotate(-0.18 + Math.sin(t * 40) * 0.05);
    for (let i = 0; i < 7; i++) P_line(ctx, -0.04, 0.08 - i * 0.02, -0.34 - i * 0.03 + Math.sin(t * 30 + i) * 0.03, 0.14 - i * 0.035, 0.016, dark);
    P_ell(ctx, 0, 0, 0.15, 0.12, skin);
    P_ell(ctx, 0.03, 0.04, 0.11, 0.05, skinD);                        // the brow
    P_ell(ctx, 0.1, -0.05, 0.06, 0.055, mouthC);                      // the mouth, open, toward where it goes
    for (let i = 0; i < 3; i++) P_line(ctx, 0.07 + i * 0.03, -0.0, 0.07 + i * 0.03, -0.03, 0.01, skin);
    ctx.restore();
    leg(-0.34, 0.48, g, 0.46, skin, 0.07); leg(0.3, 0.52, g + Math.PI, 0.44, skin, 0.075);             // the near pair, over the body
    ctx.restore();
  }
};
