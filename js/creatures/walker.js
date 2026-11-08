'use strict';
CREATURES.walker = {
  name: 'the walker', h: 2.45, w: 1.5, faceY: 2.25, stepRate: 0.55, catchDist: 1.5, sound: 'walker',
  voice: { kind: 'exhale', every: [5, 10] },
  init(c) { },
  speedMult(c, dt, seen) { return 1; },
  // a night can send it sideways, running (The Field's run round the house): c.runLat metres to its right, c.runPose on.
  // c.charge on: it runs straight at you instead (drawCharge). c.peer (0..1) stoops it, knees bent and leaning in, until
  // its eyes are at the height of yours: at the boards across a doorway, it looks in through the gap left between them,
  // its hands on the board under the gap. c.handLift ([left, right], 0..1) raises a hand off the board to strike it, and
  // c.blow (1 at a blow, falling away) throws its head and shoulders in at the boards.
  lateral(c) { return c.runLat || 0; },
  draw(ctx, c, P) {
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    if (c.charge) { this.drawCharge(ctx, c, P); return; }
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const body = P.col([6, 6, 10]);
    const skin = P.col([92, 84, 88]);
    const eye = P.col([225, 218, 205]);
    const bob = Math.abs(Math.sin(g)) * 0.05;
    const sway = Math.sin(g) * 0.035;
    const pk = smoothstep(c.peer || 0), bl = (c.blow || 0) * pk;   // stooping to look in: the hips drop, the knees splay, the body leans in at you
    const hipY = lerp(1.22, 0.86, pk) + bob, top = lerp(2.0, 1.39, pk) + bob - bl * 0.03, sw = lerp(0.22, 0.26, pk);
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
      // stooping, the elbows go out and the hands come down on the board under the gap, the fingers over its edge; a
      // hand raised to strike goes up out of sight behind the board above
      const lift = smoothstep((c.handLift && c.handLift[s > 0 ? 1 : 0]) || 0);
      const ex = s * lerp(lerp(0.24, 0.52, raise), lerp(0.62, 0.58, lift), pk) + swing, ey = lerp(lerp(1.38, 1.55, raise), lerp(1.3, 1.66, lift), pk);
      const hx = s * lerp(lerp(0.27, 0.4, raise), lerp(0.36, 0.42, lift), pk) + swing * 2, hy = lerp(lerp(0.72, 1.95, raise), 1.53 + lift * 0.47, pk);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
      const ang = lerp(lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), lerp(s > 0 ? -Math.PI * 0.56 : -Math.PI * 0.44, s > 0 ? Math.PI * 0.42 : Math.PI * 0.58, lift), pk);
      fingers(ctx, hx, hy, ang, lerp(lerp(0.16, 0.3, raise), lerp(0.1, 0.3, lift), pk), 0.17 + raise * 0.05, 0.018, body);
    }
    // neck and head with a snapping tilt
    const tilt = headTiltJerk(t, 2.7, 0.33) * (1 - (c.lunge || 0));
    ctx.save();
    ctx.translate(sway * 0.6, top);
    ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12, 0.07, body);
    if (pk) { const k = 1 + 0.12 * pk + 0.08 * bl; ctx.translate(0, -0.1 * pk); ctx.scale(k, k); }   // leaning in: the neck foreshortened, the head nearer
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
  // flat out, straight at you, seen from the front: bent forward so the shoulders come down and the head is thrust out
  // ahead of them, a knee driving up at you with each stride while the other leg is down and pushing off, the long arms
  // pumping, a hand coming up past its chin each stride. In the last few metres the arms come up and out for the boards.
  // Its legs go by c.gait, which the night strides out to the speed it is going.
  drawCharge(ctx, c, P) {
    const g = c.gait, body = P.col([6, 6, 10]), skin = P.col([92, 84, 88]), eye = P.col([225, 218, 205]);
    const reach = smoothstep((6.5 - c.dist) / 3.5);
    const bob = Math.abs(Math.sin(g)) * 0.08;   // in the air between footfalls
    const roll = Math.sin(g) * 0.05 * (1 - reach);   // the shoulders roll with the stride
    const hipY = 1.1 + bob, top = 1.7 + bob;
    ctx.save(); ctx.rotate(roll);
    // legs, seen from the front: half the stride a leg is down and taking its weight, the other half it swings through,
    // the heel kicked up behind it, then the knee driving up at you (the thigh foreshortened to almost nothing, the shin
    // hanging from it), then reaching down for the ground. SWING: through the swing, the knee's height as a share of the
    // hip's, and the foot's
    const SWING = [[0, 0.5, 0.12], [0.25, 0.62, 0.55], [0.5, 0.86, 0.55], [0.8, 0.6, 0.14], [1.01, 0.5, 0.03]];
    for (const s of [-1, 1]) {
      const u = (((g + (s > 0 ? Math.PI : 0)) / Math.PI) % 2 + 2) % 2;
      let kr = 0.5, fy = 0.03;
      if (u < 1) {
        const i = SWING.findIndex(f => f[0] > u), a = SWING[i - 1], b = SWING[i], k = smoothstep((u - a[0]) / (b[0] - a[0]));
        kr = lerp(a[1], b[1], k); fy = lerp(a[2], b[2], k);
      }
      const lift = (kr - 0.5) / 0.36, hx = s * 0.08, kx = s * (0.12 + 0.05 * lift), ky = hipY * kr, fx = s * (0.13 - 0.04 * lift);
      P_limb(ctx, [[hx, hipY], [kx, ky], [fx, fy]], 0.075 + 0.025 * lift, body);
      if (fy < 0.2) P_line(ctx, fx - 0.045, fy, fx + 0.045, fy, 0.065, body);   // the foot, toes at you
    }
    // the arms swing against the legs, bent hard at the elbow: fwd 1 is the upper arm swung forward at you and the hand up
    // by its chin, 0 hanging with the forearm pointing at you (so the hand is by the elbow), -1 swung back, the elbow up
    // behind and the hand down by the hip. The upper arm swings th from hanging, the forearm th + 1.6 from hanging.
    const arm = (s, front) => {
      const fwd = s * Math.sin(g);
      if ((fwd > 0) !== front) return;
      const th = fwd * 1.1, sx = s * 0.21, sy = top - 0.04;
      const ex = s * lerp(0.3 - 0.05 * Math.abs(fwd), 0.5, reach), ey = lerp(sy - 0.56 * Math.cos(th), top - 0.15, reach);
      const hx = s * lerp(0.27 - 0.13 * Math.max(0, fwd) + 0.03 * Math.max(0, -fwd), 0.42, reach), hy = lerp(ey - 0.52 * Math.cos(th + 1.6), top + 0.2, reach);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
      const ang = lerp(Math.atan2(hy - ey, hx - ex) + s * 0.25, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, reach);
      fingers(ctx, hx, hy, ang, lerp(0.14, 0.3, reach), lerp(0.08 + 0.09 * Math.abs(fwd), 0.22, reach), 0.018, body);   // pointing at you, the fingers are foreshortened too
    };
    for (const s of [-1, 1]) arm(s, false);
    P_poly(ctx, [[-0.14, hipY - 0.06], [0.14, hipY - 0.06], [0.22, top], [-0.22, top]], body);   // the torso, bent at you: shorter, and still far too narrow
    for (const s of [-1, 1]) arm(s, true);
    // the head, low and thrust out ahead of the shoulders, nearer and so a little bigger; the mouth open
    ctx.translate(0, top - 0.24); ctx.scale(1.15, 1.15);
    P_line(ctx, 0, 0.08, 0, 0.2, 0.07, body);
    P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      P_ell(ctx, 0, 0.285, 0.085, 0.13, skin);
      for (const x of [-0.036, 0.036]) { P_ell(ctx, x, 0.318, 0.017, 0.014, eye); P_ell(ctx, x, 0.316, 0.006, 0.007, body); }
      P_ell(ctx, 0, 0.205, 0.034, 0.042 + 0.012 * reach, body);
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
