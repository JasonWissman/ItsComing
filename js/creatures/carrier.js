'use strict';
// The carrier: hunched, sack-bodied, arms wrapped round itself, a face you would rather not see up close.
// Its pace depends on how much you are carrying: the night sets c.load to the size of your inventory.
// A night can send it sideways, running (The Barn's run round to its other way in): c.runLat metres to its right,
// c.runPose on, c.runDir +1 running to the right of the view and -1 to the left, c.runGait its stride, c.runPace 1 for a
// run and less for a walk along a fire. c.recoil (0..1) rears it back from a fire with an arm across its face.
CREATURES.carrier = {
  name: 'the carrier', h: 1.7, w: 1.6, faceY: 1.35, stepRate: 0.9, catchDist: 1.5, sound: 'walker',
  death: { delay: 0.2, dur: 0.4, sting: 'sting' },
  voice: { kind: 'slow', every: [5, 10] },
  init(c) { c.load = 0; c.sitting = false; },
  // empty-handed it creeps; each thing in your hands adds a little over a quarter of that again
  speedMult(c, dt, seen) { if (c.sitting) return 0; return 0.55 + 0.15 * (c.load || 0); },
  lateral(c) { return c.runLat || 0; },
  draw(ctx, c, P) {
    if (c.runPose && !c.sitting) { this.drawRun(ctx, c, P); return; }
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 12, 0, 1), lunge = c.lunge || 0;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), skin = P.col([160, 140, 122]), black = P.col([8, 6, 6]), teeth = P.col([220, 210, 190]);
    const load = clamp((c.load || 0) / 6, 0, 1);
    if (c.sitting) {
      // sat facing the loft, knees drawn up and its arms locked round them, its head sunk between its shoulders and its
      // eyes still on you: a hunched shape, not a ring (a dark middle drawn inside the body read as a hole at a distance)
      P_poly(ctx, [[-0.5, 0.02], [0.5, 0.02], [0.46, 0.46], [0.3, 0.78], [-0.3, 0.78], [-0.46, 0.46]], sackD);   // its back and haunches
      P_ell(ctx, 0, 0.62, 0.44, 0.24, sack);                                                                    // the hunched shoulders
      for (const sx of [-1, 1]) { P_ell(ctx, sx * 0.2, 0.06, 0.13, 0.06, sackD); P_ell(ctx, sx * 0.16, 0.38, 0.15, 0.25, sack); }   // feet; the knees, drawn up
      P_line(ctx, -0.02, 0.2, -0.02, 0.56, 0.012, sackD); P_line(ctx, 0.3, 0.56, 0.36, 0.7, 0.012, sackD);       // a seam or two
      for (const sx of [-1, 1]) P_limb(ctx, [[sx * 0.42, 0.64], [sx * 0.36, 0.36], [sx * 0.07, 0.3]], 0.1, sackD);   // the arms round the knees
      P_ell(ctx, -0.05, 0.3, 0.06, 0.045, skin); P_ell(ctx, 0.06, 0.31, 0.06, 0.045, skin);                      // the hands, clasped
      ctx.save(); ctx.translate(Math.sin(t * 0.9) * 0.012, 0);
      strands(ctx, 0, 0.97, 12, 0.28, P.col([120, 100, 60]), 9, t);
      P_ell(ctx, 0, 0.79, 0.17, 0.19, skin);
      P_ell(ctx, -0.07, 0.83, 0.032, 0.022, black); P_ell(ctx, 0.07, 0.83, 0.032, 0.022, black);
      P_ell(ctx, 0, 0.71, 0.05, 0.012, black);
      ctx.restore();
      return;
    }
    // rearing back from a fire: it straightens, its head goes back and aside, one arm comes up across its face and its
    // mouth opens; the other arm never lets go of what it carries
    const rec = smoothstep(clamp(c.recoil || 0, 0, 1));
    const bob = c.moving ? Math.abs(Math.sin(g)) * 0.06 : Math.sin(t * 1.4) * 0.02, hunch = (0.25 + load * 0.15) * (1 - rec * 0.8);
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = c.moving ? Math.max(0, Math.sin(ph)) * 0.18 : 0;
      P_limb(ctx, [[s * 0.16, 0.75 + bob], [s * 0.22 + Math.sin(ph) * 0.08 + s * rec * 0.06, 0.4 + lift * 0.6], [s * 0.2 + Math.sin(ph) * 0.14 + s * rec * 0.1, lift + 0.03]], 0.1, sackD);
    }
    // the body: a sack, sagging, patched, the seams showing
    ctx.save(); ctx.translate(0, bob + rec * 0.06);
    P_ell(ctx, 0, 0.95, 0.5 + load * 0.08, 0.5, sack);
    P_poly(ctx, [[-0.42, 0.7], [0.42, 0.7], [0.36, 1.25 - hunch * 0.3], [-0.36, 1.25 - hunch * 0.3]], sack);
    for (let k = 0; k < 4; k++) P_line(ctx, -0.3 + k * 0.2, 0.75, -0.25 + k * 0.2, 1.2, 0.012, sackD);
    P_rect(ctx, -0.12, 0.85, 0.22, 0.16, sackD);
    // arms wrapped round itself; when it lunges they open
    for (const s of [-1, 1]) {
      const open = lunge, up = s > 0 ? rec : 0;
      if (up > 0.02) {   // the arm thrown up in front of its face, the fingers spread against the light
        const ex = s * lerp(0.1 + open * 0.55, 0.52, up), ey = lerp(0.95 + open * 0.3, 1.36, up), hx = -s * lerp(0.25 - open * 0.7, -0.08, up), hy = lerp(1.05 + open * 0.4, 1.66, up);
        P_limb(ctx, [[s * 0.38, 1.15], [ex, ey], [hx, hy]], 0.11, sack);
        fingers(ctx, hx, hy, Math.PI / 2 + s * 0.3, 0.32, 0.13 * up, 0.025, skin);
        continue;
      }
      P_limb(ctx, [[s * 0.38, 1.15], [s * (0.1 + open * 0.55), 0.95 + open * 0.3], [-s * (0.25 - open * 0.7), 1.05 + open * 0.4]], 0.11, sack);
      if (open > 0.2) fingers(ctx, -s * (0.25 - open * 0.7), 1.05 + open * 0.4, -s * 0.4 + Math.PI / 2, 0.4, 0.14, 0.025, skin);
    }
    // the head: low, pushed forward, hair like straw, a mouth full of small teeth
    ctx.save(); ctx.translate(-rec * 0.08, 1.2 - hunch * 0.2 + rec * 0.05); ctx.rotate(headTiltJerk(t, 3.3, 0.14) * (1 - lunge) * (1 - rec) - rec * 0.38);
    strands(ctx, 0, 0.42, 12, 0.3, P.col([120, 100, 60]), 9, t);
    P_ell(ctx, 0, 0.22, 0.2, 0.22, skin);
    P_ell(ctx, -0.08, 0.27, 0.035, 0.025 * (1 - rec * 0.7), black); P_ell(ctx, 0.08, 0.27, 0.035, 0.025 * (1 - rec * 0.7), black);   // screwed shut against the glare
    const mw = 0.08 + near * 0.05 + lunge * 0.08 + rec * 0.04, mh = 0.02 + near * 0.04 + lunge * 0.09 + rec * 0.07;
    P_ell(ctx, 0, 0.1, mw, mh, black);
    if (near > 0.15 || lunge > 0 || rec > 0.3) for (let i = -3; i <= 3; i++) P_rect(ctx, i * mw * 0.27 - 0.008, 0.1 + mh * 0.5 - 0.03, 0.016, 0.03, teeth);
    ctx.restore();
    ctx.restore();
  },
  // flat out, seen from the side, and still bent double round what it carries: the sack of its body tipped forward over
  // short legs going like pistons, the bundle clutched to its front in both arms, the head thrust out low ahead with its
  // straw hair streaming back. At a walk (c.runPace below 1) the stride shortens and it rides more upright.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, t = c.t, pace = c.runPace === undefined ? 1 : c.runPace, load = clamp((c.load || 0) / 6, 0, 1);
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), sackL = P.col([126, 108, 82]), skin = P.col([160, 140, 122]), skinD = P.col([118, 100, 86]);
    const black = P.col([8, 6, 6]), teeth = P.col([220, 210, 190]), hair = P.col([120, 100, 60]), bundle = P.col([134, 114, 82]), bundleD = P.col([98, 82, 58]), twine = P.col([48, 36, 24]);
    const lean = 0.32 + 0.33 * pace, thigh = 0.36, shin = 0.37, rot = Math.PI / 2 - lean;   // lean from upright; rot, the spine's angle
    const sp = [Math.sin(lean), Math.cos(lean)], fw = [Math.cos(lean), -Math.sin(lean)];       // up its spine; out of its front (forward and down)
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const legs = [0, Math.PI].map(o => {
      const ph = g + o, a = Math.sin(ph) * (0.3 + 0.55 * pace), bend = 0.2 + 1.3 * pace * Math.max(0, Math.cos(ph));   // the knee folds as the leg swings through
      const kx = Math.sin(a) * thigh, ky = -Math.cos(a) * thigh;
      return { kx, ky, fx: kx + Math.sin(a - bend) * shin, fy: ky - Math.cos(a - bend) * shin };
    });
    const hipX = -0.06, hipY = 0.06 - Math.min(legs[0].fy, legs[1].fy);   // whichever foot is lowest is on the ground
    const leg = (l, col, foot) => {
      P_limb(ctx, [[hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy]], 0.13, col);
      P_ell(ctx, hipX + l.fx + 0.05, hipY + l.fy - 0.01, 0.1, 0.04, foot);   // a broad bare foot, pale, toes forward
    };
    leg(legs[1], sackD, skinD);   // the far leg, in its own shadow
    // the body: a sack slung forward from the hips, sagging at the belly, the light along its back, a seam or two
    const cx = hipX + sp[0] * 0.4 + 0.03, cy = hipY + sp[1] * 0.4;
    P_ell(ctx, cx, cy, 0.5, 0.37 + load * 0.05, sack, rot);
    P_ell(ctx, cx + fw[0] * 0.13, cy + fw[1] * 0.13, 0.38, 0.22, sackD, rot);
    P_ell(ctx, cx - fw[0] * 0.19, cy - fw[1] * 0.19, 0.36, 0.11, sackL, rot);
    for (const u of [-0.12, 0.14]) P_line(ctx, cx + sp[0] * u - fw[0] * 0.3, cy + sp[1] * u - fw[1] * 0.3, cx + sp[0] * u + fw[0] * 0.1, cy + sp[1] * u + fw[1] * 0.1, 0.014, sackD);
    const shX = hipX + sp[0] * 0.76, shY = hipY + sp[1] * 0.76;   // the shoulders, out over its front
    // the bundle, held to its chest: tied, lumpy, never put down
    const bx = cx + fw[0] * 0.34 + sp[0] * 0.08, by = cy + fw[1] * 0.34 + sp[1] * 0.08 + Math.sin(g * 2) * 0.012;
    P_ell(ctx, bx, by, 0.21, 0.17, bundleD, 0.3); P_ell(ctx, bx - 0.02, by + 0.03, 0.17, 0.12, bundle, 0.3);
    P_line(ctx, bx - 0.17, by - 0.05, bx + 0.12, by + 0.13, 0.018, twine); P_line(ctx, bx - 0.06, by + 0.15, bx + 0.08, by - 0.14, 0.018, twine);
    // the near arm wrapped round it, the hand clawed over the top
    const hx = bx - 0.02, hy = by + 0.15;
    P_limb(ctx, [[shX - 0.04, shY - 0.04], [bx + 0.22, by - 0.06], [bx + 0.14, by + 0.12], [hx, hy]], 0.11, sack);
    fingers(ctx, hx, hy, Math.PI + 0.6, 0.24, 0.1, 0.024, skin);
    // the head, low and thrust out ahead of the shoulders, the face in profile on its front
    const nod = Math.sin(g * 2) * 0.02 * pace, hdx = shX + 0.17, hdy = shY + 0.05 + nod;
    for (let i = 0; i < 9; i++) {   // the straw hair, streaming back as it goes
      const a = Math.PI * (0.66 + i * 0.04) + Math.sin(t * 9 + i * 1.7) * 0.06 * pace, l = 0.22 + 0.1 * Math.sin(i * 2.1) + 0.14 * pace;
      const x0 = hdx - 0.06 + i * 0.014, y0 = hdy + 0.15 - i * 0.016;
      P_line(ctx, x0, y0, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l * 0.55, 0.016, hair);
    }
    P_ell(ctx, hdx, hdy, 0.17, 0.19, skin, -0.25);
    P_ell(ctx, hdx - 0.07, hdy + 0.01, 0.09, 0.14, skinD, -0.25);                                         // the side of the skull, shadowed
    P_ell(ctx, hdx + 0.07, hdy + 0.06, 0.032, 0.024, black);                                               // the eye
    const mo = 0.035 + 0.03 * pace;
    P_ell(ctx, hdx + 0.11, hdy - 0.08, 0.065, mo, black, -0.25);                                           // the mouth, open as it runs
    for (let i = 0; i < 3; i++) P_rect(ctx, hdx + 0.07 + i * 0.03, hdy - 0.08 + mo * 0.5 - 0.028, 0.014, 0.028, teeth);
    leg(legs[0], sack, skin);   // the near leg, in front of the body
    ctx.restore();
  },
};
