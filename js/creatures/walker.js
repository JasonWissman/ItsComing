'use strict';
CREATURES.walker = {
  name: 'the walker', h: 2.45, w: 1.5, faceY: 2.25, stepRate: 0.55, catchDist: 1.5, sound: 'walker',
  voice: { kind: 'exhale', every: [5, 10] },
  init(c) { },
  speedMult(c, dt, seen) { return 1; },
  // a night can send it sideways, running (The Field's run round the house): c.runLat metres to its right, c.runPose on.
  // c.peer (0..1) stoops it, knees bent and leaning in, until its face is at the height of your eyes: at the boards
  // across a doorway, it looks in through the gap left between them.
  lateral(c) { return c.runLat || 0; },
  draw(ctx, c, P) {
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const body = P.col([6, 6, 10]);
    const skin = P.col([92, 84, 88]);
    const eye = P.col([225, 218, 205]);
    const bob = Math.abs(Math.sin(g)) * 0.05;
    const sway = Math.sin(g) * 0.035;
    const pk = smoothstep(c.peer || 0);   // stooping to look in: the hips drop, the knees splay, the body leans in at you
    const hipY = lerp(1.22, 0.92, pk) + bob, top = lerp(2.0, 1.5, pk) + bob, sw = lerp(0.22, 0.26, pk);
    // legs (front view: feet lift alternately)
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.24;
      const hx = s * 0.08 + sway, kx = s * (0.12 + 0.12 * pk) + sway * 0.6, fx = s * 0.15 + sway * 0.3;
      P_limb(ctx, [[hx, hipY], [kx, hipY * 0.5 + lift * 0.75], [fx, lift + 0.03]], 0.075, body);
      P_line(ctx, fx - 0.03, lift + 0.03, fx + s * 0.09, lift + 0.03, 0.07, body);
    }
    // torso: far too narrow
    P_poly(ctx, [[-0.15 + sway, hipY - 0.06], [0.15 + sway, hipY - 0.06], [sw + sway * 0.6, top], [-sw + sway * 0.6, top]], body);
    // arms: hang to the knees; rise toward you when close
    const raise = smoothstep(Math.max(near, c.lunge || 0));
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? 0 : Math.PI);
      const swing = Math.sin(ph) * 0.05 * (1 - raise);
      const sx = s * (sw - 0.01) + sway * 0.6, sy = top - 0.05;
      const ex = s * lerp(lerp(0.24, 0.52, raise), 0.64, pk) + swing, ey = lerp(lerp(1.38, 1.55, raise), 1.6, pk);   // stooping, the elbows go out and the hands up to the boards
      const hx = s * lerp(lerp(0.27, 0.4, raise), 0.5, pk) + swing * 2, hy = lerp(lerp(0.72, 1.95, raise), 1.98, pk);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
      const ang = lerp(lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), s > 0 ? Math.PI * 0.42 : Math.PI * 0.58, pk);
      fingers(ctx, hx, hy, ang, lerp(0.16, 0.3, raise), 0.17 + raise * 0.05, 0.018, body);
    }
    // neck and head with a snapping tilt
    const tilt = headTiltJerk(t, 2.7, 0.33) * (1 - (c.lunge || 0));
    ctx.save();
    ctx.translate(sway * 0.6, top);
    ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12, 0.07, body);
    if (pk) { ctx.translate(0, -0.1 * pk); ctx.scale(1 + 0.12 * pk, 1 + 0.12 * pk); }   // leaning in: the neck foreshortened, the head nearer
    P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      P_ell(ctx, 0, 0.285, 0.085, 0.13, skin);
      P_ell(ctx, -0.036, 0.315, 0.016, 0.012, eye);
      P_ell(ctx, 0.036, 0.315, 0.016, 0.012, eye);
      P_ell(ctx, -0.036, 0.315, 0.006, 0.006, body);
      P_ell(ctx, 0.036, 0.315, 0.006, 0.006, body);
      const mouth = 0.012 + near * 0.03 + (c.lunge || 0) * 0.045;
      P_ell(ctx, 0, 0.205, 0.028 + near * 0.012, mouth, body);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
  // flat out, seen from the side: leaning far forward, the long legs reaching and kicking up behind, the arms pumping,
  // the head pushed out ahead. c.runDir is +1 running to the right of the view, -1 to the left; c.runGait its stride.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, body = P.col([6, 6, 10]), eye = P.col([225, 218, 205]);
    const lean = 0.42, thigh = 0.62, shin = 0.64, upper = 0.56, fore = 0.52;
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const legs = [0, Math.PI].map(o => {
      const ph = g + o, a = Math.sin(ph) * 0.75, bend = 0.25 + 1.4 * Math.max(0, Math.cos(ph));   // the knee folds as the leg swings through
      const kx = Math.sin(a) * thigh, ky = -Math.cos(a) * thigh;
      return { ph, kx, ky, fx: kx + Math.sin(a - bend) * shin, fy: ky - Math.cos(a - bend) * shin };
    });
    const hipY = 0.03 - Math.min(legs[0].fy, legs[1].fy), hipX = 0;   // whichever foot is lowest is on the ground
    const sx = hipX + Math.sin(lean) * 0.82, sy = hipY + Math.cos(lean) * 0.82;
    const limb = l => {
      P_limb(ctx, [[hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy]], 0.075, body);
      P_line(ctx, hipX + l.fx - 0.02, hipY + l.fy, hipX + l.fx + 0.11, hipY + l.fy - 0.01, 0.065, body);   // the foot, toes forward
      // the arm on the other side swings against this leg
      const aa = -Math.sin(l.ph) * 1.0, ex = sx + Math.sin(aa) * upper, ey = sy - Math.cos(aa) * upper, fa = aa + 1.0;
      const hx = ex + Math.sin(fa) * fore, hy = ey - Math.cos(fa) * fore;
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
      fingers(ctx, hx, hy, Math.atan2(hy - ey, hx - ex), 0.14, 0.17, 0.018, body);
    };
    limb(legs[1]);   // the far side first
    P_poly(ctx, [[hipX - 0.12, hipY - 0.05], [hipX + 0.1, hipY - 0.05], [sx + 0.13, sy], [sx - 0.15, sy - 0.02]], body);   // the torso, side on: still far too narrow
    limb(legs[0]);
    // the neck and the head, thrust forward of the shoulders
    const nx = sx + Math.sin(lean + 0.5) * 0.16, ny = sy + Math.cos(lean + 0.5) * 0.16;
    P_line(ctx, sx, sy, nx, ny, 0.07, body);
    const hx = nx + Math.sin(lean + 0.3) * 0.17, hy = ny + Math.cos(lean + 0.3) * 0.17;
    P_ell(ctx, hx, hy, 0.12, 0.16, body, -lean * 0.6);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) { ctx.globalAlpha = faceA; P_ell(ctx, hx + 0.07, hy + 0.03, 0.018, 0.013, eye); ctx.globalAlpha = 1; }
    ctx.restore();
  },
};
