'use strict';
// The watcher: a robed stone figure that only moves while nothing is looking at it. A night can send it running
// (The Quarry's going round to the other gate): c.runPose on, side-on, facing c.runDir (1 right, -1 left), its stride
// at c.runGait, which only moves while it does; caught by a look it is a statue caught mid-stride. At a gate it can
// hold the bars (pose 4: both hands on bars either side of its face, at c.grip [left, right] from its middle; 5: the left
// one there, the other reaching through the gap at c.reach).
CREATURES.watcher = {
  name: 'the watcher', h: 2.15, w: 1.5, faceY: 1.8, stepRate: 0.8, catchDist: 1.6, sound: null, silentWhenSeen: true,
  death: { delay: 0.05, dur: 0.04, sting: 'stingStone' },
  init(c) { c.pose = 0; c.seenLast = true; },
  onSeen(c) {
    // it is never in the same pose twice in a row
    let p; do { p = 1 + Math.floor(c.rand() * 3); } while (p === c.pose);
    if (c.dist < 4) p = c.rand() < 0.5 ? 1 : 2;
    c.pose = p;
  },
  speedMult(c, dt, seen) { return seen ? 0 : 1; },
  draw(ctx, c, P) {
    if (c.runPose && !c.lunge) { this.drawRun(ctx, c, P); return; }
    const stone = P.col([104, 106, 108]), stoneD = P.col([58, 60, 64]), stoneL = P.col([132, 134, 136]);
    const hole = P.col([8, 8, 10]);
    const pale = P.col([200, 200, 196]);
    const pose = c.lunge ? 2 : c.pose;
    // at the bars (the night has told it where they are), screaming with its head cocked it stands a little over, so its
    // face is in the gap in the middle of them and not behind a bar
    if (pose === 2 && c.grip && !c.lunge) ctx.translate(0.09, 0);
    // robe
    P_poly(ctx, [[-0.55, 0], [0.55, 0], [0.3, 1.5], [-0.3, 1.5]], stone);
    P_poly(ctx, [[-0.12, 0], [0.02, 0], [0.06, 1.45], [-0.08, 1.45]], stoneD);
    P_poly(ctx, [[0.25, 0], [0.42, 0], [0.24, 1.42], [0.16, 1.42]], stoneD);
    // hood
    P_poly(ctx, [[-0.33, 1.42], [0.33, 1.42], [0.24, 2.05], [0, 2.15], [-0.24, 2.05]], stone);
    P_poly(ctx, [[-0.2, 1.5], [0.2, 1.5], [0.15, 2.0], [0, 2.06], [-0.15, 2.0]], hole);
    const shoulder = s => [s * 0.3, 1.45];
    if (pose === 0) {
      // covering its face
      for (const s of [-1, 1]) {
        P_limb(ctx, [shoulder(s), [s * 0.42, 1.1], [s * 0.1, 1.72]], 0.1, stone);
        P_ell(ctx, s * 0.07, 1.78, 0.085, 0.12, stoneL, s * 0.25);
      }
    } else if (pose === 1) {
      // reaching for you
      for (const s of [-1, 1]) {
        P_limb(ctx, [shoulder(s), [s * 0.5, 1.25], [s * 0.36, 1.05]], 0.1, stone);
        P_ell(ctx, s * 0.36, 1.05, 0.07, 0.06, stoneL);
        fingers(ctx, s * 0.36, 1.05, -Math.PI / 2 + s * 0.3, 0.35, 0.16, 0.03, stoneL);
      }
      P_ell(ctx, -0.055, 1.83, 0.02, 0.014, pale); P_ell(ctx, 0.055, 1.83, 0.02, 0.014, pale);
    } else if (pose === 2) {
      // screaming, head cocked
      for (const s of [-1, 1]) {
        P_limb(ctx, [shoulder(s), [s * 0.55, 1.3], [s * 0.62, 1.7]], 0.1, stone);
        fingers(ctx, s * 0.62, 1.7, Math.PI / 2 + s * 0.2, 0.35, 0.15, 0.03, stoneL);
      }
      ctx.save(); ctx.translate(0, 1.5); ctx.rotate(0.35);
      P_poly(ctx, [[-0.2, 0], [0.2, 0], [0.15, 0.5], [0, 0.56], [-0.15, 0.5]], hole);
      P_ell(ctx, -0.055, 0.33, 0.022, 0.016, pale); P_ell(ctx, 0.055, 0.33, 0.022, 0.016, pale);
      P_ell(ctx, 0, 0.15, 0.06, 0.09 + (c.lunge || 0) * 0.05, stoneD);
      P_ell(ctx, 0, 0.15, 0.045, 0.075 + (c.lunge || 0) * 0.05, hole);
      ctx.restore();
    } else if (pose === 4 || pose === 5) {
      // holding two of the gate's bars, one either side of its face (pose 5: the right hand through a gap, at you). The
      // night says where, in its own measure as it is drawn: c.grip where the bars it holds are, left and right of its
      // middle, c.reach the middle of the gap it reaches through. Its fists are just where the bars cross them, so the
      // bars, drawn over it, go between its knuckles and its fingertips
      const grip = c.grip || [-0.845, 0.845], rx = c.reach || 0.2;
      for (const s of pose === 4 ? [-1, 1] : [-1]) {
        const gx = s < 0 ? -grip[0] : grip[1];
        P_limb(ctx, [shoulder(s), [s * (0.3 + (gx - 0.3) * 0.58), 1.2], [s * (gx - 0.025), 1.4]], 0.1, stone);
        P_ell(ctx, s * gx, 1.41, 0.07, 0.085, stoneL);
        for (let k = 0; k < 4; k++) P_line(ctx, s * (gx + 0.05), 1.355 + k * 0.034, s * (gx - 0.05), 1.365 + k * 0.034, 0.026, stoneD);   // fingers round the bar
      }
      if (pose === 5) {
        P_limb(ctx, [shoulder(1), [rx + 0.22, 1.2], [rx, 1.08]], 0.1, stone);
        P_ell(ctx, rx, 1.08, 0.08, 0.075, stoneL);
        fingers(ctx, rx, 1.08, -Math.PI / 2 - 0.5, 0.42, 0.17, 0.032, stoneL);
      }
      P_ell(ctx, -0.055, 1.82, 0.022, 0.015, pale); P_ell(ctx, 0.055, 1.82, 0.022, 0.015, pale);
    } else {
      // pointing at you
      P_limb(ctx, [shoulder(-1), [-0.45, 1.15], [-0.36, 0.85]], 0.1, stone);
      P_limb(ctx, [shoulder(1), [0.5, 1.35], [0.28, 1.3]], 0.1, stone);
      P_ell(ctx, 0.28, 1.3, 0.07, 0.06, stoneL);
      P_line(ctx, 0.28, 1.3, 0.2, 1.27, 0.035, stoneL);
      P_ell(ctx, -0.055, 1.83, 0.02, 0.014, pale); P_ell(ctx, 0.055, 1.83, 0.02, 0.014, pale);
    }
    // cracks
    ctx.strokeStyle = stoneD; ctx.lineWidth = 0.012; ctx.beginPath();
    ctx.moveTo(-0.2, 0.3); ctx.lineTo(-0.1, 0.7); ctx.lineTo(-0.16, 0.95);
    ctx.moveTo(0.3, 0.2); ctx.lineTo(0.22, 0.55);
    ctx.stroke();
  },
  // side-on, running flat out: stone legs striding from under the robe, the robe leaning into the run with its hem
  // flung out behind it in hard folds, the hood forward with its dark opening and one pale eye toward where it is going,
  // the arms pumping, a hand clawing ahead. Drawn facing right; c.runDir -1 mirrors it
  drawRun(ctx, c, P) {
    const stone = P.col([104, 106, 108]), stoneD = P.col([58, 60, 64]), stoneL = P.col([132, 134, 136]), hole = P.col([8, 8, 10]), pale = P.col([200, 200, 196]);
    const g = c.runGait || 0, sw = Math.sin(g);
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const bob = Math.abs(Math.cos(g)) * 0.05;
    for (const o of [Math.PI, 0]) {   // the far leg first, darker
      const ph = g + o, a = Math.sin(ph) * 0.72, bend = 0.2 + 1.3 * Math.max(0, Math.cos(ph));
      const hip = [0.04, 0.9 + bob], knee = [hip[0] + Math.sin(a) * 0.47, hip[1] - Math.cos(a) * 0.47], foot = [knee[0] + Math.sin(a - bend) * 0.47, knee[1] - Math.cos(a - bend) * 0.47];
      const col = o ? stoneD : stone;
      P_limb(ctx, [hip, knee, foot], 0.1, col);
      P_line(ctx, foot[0] - 0.05, foot[1] - 0.01, foot[0] + 0.12, foot[1] + 0.01, 0.065, col);
    }
    ctx.save(); ctx.translate(0.04, 0.88 + bob); ctx.rotate(-0.36);   // leaning into it
    // the far arm, swung back as the near one comes forward
    P_limb(ctx, [[-0.02, 0.5], [-0.26 - sw * 0.1, 0.24], [-0.42 - sw * 0.12, 0.36]], 0.09, stoneD);
    // the robe: the back of it flung out behind, the front falling straight, two deep folds
    P_poly(ctx, [[-0.2, 0.56], [0.17, 0.56], [0.26, -0.42], [-0.14, -0.5], [-0.62, -0.36], [-0.34, 0.06]], stone);
    P_poly(ctx, [[-0.08, 0.5], [0.0, 0.5], [-0.14, -0.46], [-0.26, -0.44]], stoneD);
    P_poly(ctx, [[-0.3, 0.1], [-0.24, 0.08], [-0.5, -0.33], [-0.58, -0.34]], stoneD);
    // the hood, pushed forward, its opening toward where it runs, one eye in the dark of it
    P_poly(ctx, [[-0.22, 0.5], [0.2, 0.52], [0.34, 0.86], [0.2, 1.12], [-0.06, 1.12], [-0.24, 0.84]], stone);
    P_poly(ctx, [[0.12, 0.6], [0.3, 0.7], [0.32, 0.9], [0.2, 1.04], [0.1, 0.92]], hole);
    P_ell(ctx, 0.25, 0.86, 0.022, 0.015, pale);
    // the near arm, forward, the hand clawing at the air ahead of it
    const hx = 0.5 + sw * 0.1, hy = 0.42 + sw * 0.06;
    P_limb(ctx, [[0.02, 0.48], [0.3, 0.3 + sw * 0.04], [hx, hy]], 0.1, stone);
    P_ell(ctx, hx, hy, 0.065, 0.055, stoneL);
    fingers(ctx, hx, hy, 0.25, 0.32, 0.15, 0.028, stoneL);
    // cracks
    ctx.strokeStyle = stoneD; ctx.lineWidth = 0.012; ctx.beginPath();
    ctx.moveTo(0.1, 0.3); ctx.lineTo(0.02, -0.05); ctx.lineTo(0.08, -0.25); ctx.moveTo(-0.4, -0.2); ctx.lineTo(-0.3, 0.0);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
};
