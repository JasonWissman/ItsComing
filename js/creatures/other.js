'use strict';
// The other: a porcelain doll the size of a small girl, always behind you, only ever seen in a mirror. It moves only
// while no mirror you are facing shows it. c.back draws it from behind: the night sets it for the glass behind it while
// it lunges, and as it turns round on the spot before it comes out for the box.
// When the music box plays on the odd mirror's pedestal it comes out through that glass for the box, and the night drives
// it: c.rush (0..1) runs it at you, rocking hard on its stiff legs (c.runGait its stride); c.smile paints the smile on;
// c.arms[-1 | 1] = { k: 0..1, to: [x, y] } puts that arm out to a point (its own left of the view is -1); c.carry draws
// the box in its arms (at carryAt); and c.runPose runs it off side on in drawRun (c.runDir, c.runGait, c.runLat, as the
// walker runs round the house). c.angry (0..1) is its temper when the box is cranked before the wrong mirror: the painted
// brows come down hard, the lids drop over the glass eyes to a red glare, the face flushes, the lips draw back off its
// little teeth, and it stands stiff with its fists out from its sides, its head down. When it has you it is angry all
// the way in (night 10 sets it as it catches you): the glare and the snarl stay as it lunges, the jaw dropping and the
// fists opening to take hold.
// In the glass it dances on the spot (dancePose): c.dance (0..1) is how far it is in its dance, c.danceT the dance's
// clock (the night runs it, so every mirror shows the same moment), and c.danceMir -1 draws the mirror image of it.
// c.tint (a light, as LIGHT.at gives) lights it by hand where the night has the renderer leave it unlit.
CREATURES.other = {
  name: 'the doll', h: 1.35, w: 0.72, faceY: 1.14, stepRate: 1.6, catchDist: 1.3, sound: null, seenFrac: 0.6,
  death: { delay: 0.4, dur: 0.6, sting: 'stingHum' },
  voice: { kind: 'hum', every: [6, 11] },
  carryAt: { y: 0.55, w: 0.34 },   // where c.carry's box sits in its arms: base height and size, in metres
  init(c) { c.back = false; c.dance = 1; c.danceT = 0; c.danceMir = 1; },
  speedMult(c, dt, seen) { return seen ? 0 : 1; },
  lateral(c) { return c.runLat || 0; },
  // The dance: a wind-up doll's, slow and stiff, every move made in little clockwork ticks with a stop between (the ticks of
  // its arms, its rock from foot to foot and its wrist fall between one another, so it is never still for more than a
  // moment). Its lead arm (the one on the left of the view) goes out with the forearm hanging off the elbow, up high,
  // flops over at the wrist and rolls it, and comes down bent like a broken toy's; the knee on the other side comes up,
  // twice; the head snaps over, mostly away from the lead arm; and all the while it rocks from foot to foot. Each key is
  // one beat's pose: aL/aR each upper arm's angle out from hanging (radians), bL/bR each forearm's bend out from its upper
  // arm, kL/kR each knee's lift (0..1), tilt the head's (+: toward the left of the view) and sway the body's lean (+: to
  // the left).
  danceBeat: 1.05,
  danceKeys: [
    { aL: 0.39, bL: -0.21, aR: 0.39, bR: -0.21, kL: 0, kR: 0, tilt: 0.1, sway: 0 },          // standing, waiting
    { aL: 1.45, bL: -1.25, aR: 0.45, bR: -0.2, kL: 0, kR: 0, tilt: -0.3, sway: 0.03 },       // the lead arm out, its forearm dangling
    { aL: 2.5, bL: 0.3, aR: 0.5, bR: -0.25, kL: 0, kR: 0.95, tilt: -0.38, sway: 0.06 },      // up high, and the other knee up
    { aL: 2.6, bL: -0.95, aR: 0.4, bR: -0.2, kL: 0, kR: 0.1, tilt: 0.26, sway: 0.03 },       // the hand flops over; the head snaps to it
    { aL: 1.6, bL: 1.25, aR: 1.1, bR: -0.95, kL: 0, kR: 0, tilt: -0.32, sway: -0.04 },       // bent up square; the other arm half out, hanging
    { aL: 0.7, bL: -0.3, aR: 1.0, bR: -1.05, kL: 0, kR: 0.85, tilt: -0.36, sway: 0.05 },     // the knee again
    { aL: 0.42, bL: -0.2, aR: 0.55, bR: -0.4, kL: 0, kR: 0, tilt: 0.3, sway: -0.03 },        // arms down, the head over the other way
    { aL: 0.6, bL: 1.5, aR: 0.6, bR: 1.5, kL: 0.3, kR: 0, tilt: 0.05, sway: -0.02 },          // both forearms jerk up, even, and drop again
  ],
  // from 0 to 1 in n clockwork ticks over the first `over` of a beat: each a quick snap and a stop
  tick(f, n, over) { const x = clamp(f / over, 0, 1) * n, i = Math.min(n - 1, Math.floor(x)); return (i + smoothstep(clamp((x - i) / 0.45, 0, 1))) / n; },
  // its pose at dance time t; mir -1 is exactly the same pose with left and right swapped (rL/rR: each wrist's roll)
  dancePose(t, mir) {
    const K = this.danceKeys, N = K.length, b = t / this.danceBeat, n = Math.floor(b), f = b - n;
    const A = K[((n % N) + N) % N], B = K[(((n + 1) % N) + N) % N], e = this.tick(f, 3, 0.66), h = smoothstep(clamp((f - 0.22) / 0.1, 0, 1));
    const p = {};
    for (const k of ['aL', 'bL', 'aR', 'bR', 'kL', 'kR', 'sway']) p[k] = lerp(A[k], B[k], e);
    p.tilt = lerp(A.tilt, B.tilt, h);   // the head does not tick round: it snaps
    // from foot to foot every beat, in three ticks over the whole of it, the foot it comes off lifting a little
    const tock = Math.cos(Math.PI * (n + this.tick(f, 3, 1)));
    p.sway += tock * 0.035; p.kR = Math.min(1, p.kR + Math.max(0, tock) * 0.2); p.kL = Math.min(1, p.kL + Math.max(0, -tock) * 0.2);
    // a raised hand rolls at the wrist, over and back, in four ticks over the beat
    const roll = Math.cos(Math.PI * (n + this.tick(f, 4, 1)));
    p.rL = roll * 1.3 * clamp((p.aL - 0.8) / 1.2, 0, 1); p.rR = -roll * 0.6 * clamp((p.aR - 0.8) / 1.2, 0, 1);
    return mir < 0 ? this.mirrorPose(p) : p;
  },
  mirrorPose(p) { return { aL: p.aR, bL: p.bR, rL: p.rR, kL: p.kR, aR: p.aL, bR: p.bL, rR: p.rL, kR: p.kL, tilt: -p.tilt, sway: -p.sway }; },
  colours(P) {
    return {
      porcelain: P.col([234, 224, 210]), porcelainD: P.col([198, 186, 172]), hair: P.col([40, 27, 22]), hairL: P.col([68, 46, 34]),
      dress: P.col([178, 128, 142]), dressD: P.col([130, 88, 102]), lace: P.col([228, 220, 206]), ribbon: P.col([118, 22, 34]),
      stocking: P.col([216, 210, 200]), stockingD: P.col([176, 170, 162]), shoe: P.col([16, 12, 14]), glass: P.col([24, 20, 30]), lip: P.col([168, 34, 44]),
    };
  },
  draw(ctx, c, P) {
    if (c.tint) { const li = c.tint, Q = P; P = Object.assign({}, Q, { col: k => Q.col(LIGHT.apply(k, li)), cola: (k, a) => Q.cola(LIGHT.apply(k, li), a) }); }
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    const t = c.t, lunge = c.lunge || 0, back = !!c.back, rush = c.rush || 0, g = rush ? (c.runGait || 0) : (c.gait || 0);
    const K = this.colours(P), fury = clamp(c.angry || 0, 0, 1) * (1 - rush), fist = c.carry ? 0 : fury * (1 - lunge);   // its fists open as it reaches for you
    // its dance, as far as it is in it (the night eases it out when it is angry or comes for the box; lunging, running or
    // reaching it has none), and the pose it is in: pose[s] for its arm and knee on that side of the view
    const w = clamp(c.dance || 0, 0, 1) * (1 - lunge) * (1 - rush) * (c.carry || c.arms ? 0 : 1);
    const dp = w > 0 ? this.dancePose(c.danceT || 0, c.danceMir || 1) : null;
    c.pose = dp;
    const pose = dp && { [-1]: { a: dp.aL, b: dp.bL, r: dp.rL, k: dp.kL }, 1: { a: dp.aR, b: dp.bR, r: dp.rR, k: dp.kR } };
    // far back in the glass its arms are kept two pixels across and its legs one and a half, so the dance still reads
    const m0 = ctx.getTransform(), pxM = 1 / Math.max(1e-6, Math.hypot(m0.a, m0.b)), armW = Math.max(0.045, pxM * 2);
    // a doll does not walk: it rocks from foot to foot, stiffly. Running at you it rocks harder and kicks its feet up
    const stepping = c.moving || rush > 0;
    const rock = stepping ? Math.sin(g) * (0.07 + 0.05 * rush) : 0;
    ctx.save(); ctx.rotate(rock + (dp ? dp.sway * w : 0));
    for (const s of [-1, 1]) {
      const lift = stepping ? Math.max(0, Math.sin(g + (s > 0 ? Math.PI : 0))) * (0.04 + 0.08 * rush) : 0;
      // a knee coming up: the foot rises off the floor and the knee turns out under the hem, stiffly, as a doll's would
      const kn = pose ? pose[s].k * w : 0, fy = 0.06 + lift + 0.2 * kn;
      P_limb(ctx, [[s * 0.07, 0.44], [s * (0.072 + 0.075 * kn), 0.25 + 0.17 * kn], [s * (0.075 + 0.02 * kn), fy]], Math.max(0.07, pxM * 1.5), K.stocking);
      P_ell(ctx, s * (0.085 + 0.02 * kn), fy - 0.025, 0.06, 0.035, K.shoe);
    }
    // the dress: a bell of faded pink over petticoats, a scalloped lace hem, a sash tied at the back
    P_poly(ctx, [[-0.13, 0.8], [0.13, 0.8], [0.3, 0.43], [-0.3, 0.43]], K.dress);
    for (let k = 0; k < 7; k++) P_ell(ctx, -0.27 + k * 0.09, 0.43, 0.05, 0.035, K.lace);
    P_poly(ctx, [[-0.12, 0.8], [0.12, 0.8], [0.12, 0.98], [-0.12, 0.98]], K.dress);
    P_rect(ctx, -0.125, 0.76, 0.25, 0.05, K.dressD);
    if (back) { P_ell(ctx, -0.06, 0.785, 0.06, 0.035, K.ribbon); P_ell(ctx, 0.06, 0.785, 0.06, 0.035, K.ribbon); P_line(ctx, 0.02, 0.77, 0.07, 0.6, 0.03, K.ribbon); P_line(ctx, -0.02, 0.77, -0.06, 0.6, 0.03, K.ribbon); }
    else { P_ell(ctx, -0.045, 0.975, 0.05, 0.03, K.lace); P_ell(ctx, 0.045, 0.975, 0.05, 0.03, K.lace); }
    // arms: jointed and stiff, a little out from the sides, swinging as it runs; reaching, one goes out to what it wants
    for (const s of [-1, 1]) {
      P_ell(ctx, s * 0.13, 0.94 + fury * 0.025 * (1 - w), 0.05, 0.045, K.dress);   // angry, its shoulders come up (as the dance goes out of it)
      if (c.carry) continue;
      const swing = rush ? Math.sin(g + (s > 0 ? 0 : Math.PI)) * 0.09 * rush : 0;
      let ex = s * (0.19 + lunge * 0.05 + fist * 0.05), ey = 0.8 + lunge * 0.12 + swing * 0.4, hx = s * (0.22 + lunge * 0.14 + fist * 0.11), hy = 0.64 + lunge * 0.36 + swing - fist * 0.03;
      let hand = [hx, hy - 0.01, 0.028 + fist * 0.006, 0.034 - fist * 0.004, 0], thumb = 0;   // balled into a fist when it is angry
      if (pose) {
        // dancing: the upper arm out at its angle from the shoulder, the forearm bent off it, stiff as a jointed doll's;
        // the hand hangs off the end along the forearm, and rolls: narrowing as it turns edge on, its thumb coming round
        const q = pose[s], dx = s * (0.14 + 0.13 * Math.sin(q.a)), dy = 0.92 - 0.13 * Math.cos(q.a), fa = q.a + q.b;
        const gx = dx + s * 0.163 * Math.sin(fa), gy = dy - 0.163 * Math.cos(fa), rot = Math.atan2(gx - dx, dy - gy);
        ex = lerp(ex, dx, w); ey = lerp(ey, dy, w); hx = lerp(hx, gx, w); hy = lerp(hy, gy, w);
        const along = [Math.sin(rot) * 0.012, -Math.cos(rot) * 0.012];
        hand = [lerp(hand[0], hx + along[0], w), lerp(hand[1], hy + along[1], w), lerp(hand[2], 0.028 * (0.55 + 0.45 * Math.abs(Math.cos(q.r))), w), lerp(hand[3], 0.036, w), rot * w];
        thumb = s * Math.sin(q.r) * w;
      }
      const arm = c.arms && c.arms[s];
      if (arm && arm.k > 0) {
        const k = smoothstep(arm.k), [tx, ty] = arm.to;
        ex = lerp(ex, (s * 0.14 + tx) / 2, k); ey = lerp(ey, (0.92 + ty) / 2 + 0.03, k); hx = lerp(hx, tx, k); hy = lerp(hy, ty, k);
        hand = [hx, hy - 0.01, 0.028 + fist * 0.006, 0.034 - fist * 0.004, 0];
      }
      P_limb(ctx, [[s * 0.14, 0.92], [ex, ey], [hx, hy]], armW, K.porcelainD);
      P_ell(ctx, hand[0], hand[1], hand[2], hand[3], K.porcelain, hand[4]);
      if (thumb) P_ell(ctx, hand[0] + Math.cos(hand[4]) * thumb * 0.026, hand[1] + Math.sin(hand[4]) * thumb * 0.026 + 0.004, 0.01 * Math.abs(thumb), 0.014 * Math.abs(thumb), K.porcelain, hand[4]);
    }
    // holding the box: it is in front of it in both arms, its hands on the box's sides
    if (c.carry) {
      const A = this.carryAt;
      for (const s of [-1, 1]) P_limb(ctx, [[s * 0.14, 0.92], [s * 0.21, 0.78], [s * 0.17, A.y + A.w * 0.3]], 0.045, K.porcelainD);
      ctx.save(); ctx.translate(0, A.y); ctx.scale(A.w, A.w); c.carry(ctx, P); ctx.restore();
      for (const s of [-1, 1]) P_ell(ctx, s * 0.165, A.y + A.w * 0.27, 0.028, 0.034, K.porcelain);
    }
    // the head: too big for the body, tilted, snapping now and then to the other side; dancing, it goes where the dance puts it
    const tilt = lerp(headTiltJerk(t, 2.7, 0.16) * (1 - lunge) * (1 - rush * 0.7) * (1 - fury), dp ? dp.tilt : 0, w);   // angry, it holds its head still, and down
    ctx.save(); ctx.translate(0, 1.0 - fury * 0.02 * (1 - w)); ctx.rotate(tilt);
    P_rect(ctx, -0.025, -0.02, 0.05, 0.05, K.porcelainD);
    if (back) {
      // from behind: a mass of ringlets and the bow, no face at all
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) P_ell(ctx, s * (0.1 + (k & 1) * 0.02), 0.12 - k * 0.055, 0.036, 0.04, (k & 1) ? K.hairL : K.hair);
      P_ell(ctx, 0, 0.14, 0.13, 0.145, K.hair);
      for (let k = 0; k < 3; k++) P_ell(ctx, -0.055 + k * 0.055, 0.03 - (k & 1) * 0.02, 0.032, 0.05, (k & 1) ? K.hairL : K.hair);
    } else {
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) P_ell(ctx, s * (0.125 + (k & 1) * 0.015), 0.13 - k * 0.058, 0.034, 0.038, (k & 1) ? K.hairL : K.hair);
      P_ell(ctx, 0, 0.13, 0.115, 0.135, K.porcelain);
      // glass eyes, too big and too dark, with painted lashes; the right one sits a little lower than the left.
      // Angry, the lids come down over them on a slant, low at the nose, the face flushes, and under the lids the glint is red
      const eyeY = s => 0.135 - (s > 0 ? 0.006 : 0), er = 0.027 + lunge * 0.01;
      for (const s of [-1, 1]) {
        P_ell(ctx, s * 0.045, eyeY(s), er, er * 1.15, K.glass);
        if (fury > 0.5) { const lt = 0.034 + lunge * 0.014; P_poly(ctx, [[s * 0.01, eyeY(s) + lt], [s * 0.094, eyeY(s) + lt], [s * 0.094, eyeY(s) + 0.016], [s * 0.01, eyeY(s) - 0.012]], K.porcelain); }
      }
      if (fury > 0) P_ell(ctx, 0, 0.115, 0.1, 0.105, P.cola([214, 64, 64], 0.42 * fury));
      P_ell(ctx, 0, 0.225, 0.118, 0.055, K.hair);
      // far back in the glass the glare is what reads: its red points are kept a pixel or two across, and the fog does not
      // dull them
      const m = ctx.getTransform(), px = 1 / Math.max(1e-6, Math.hypot(m.a, m.b));
      for (const s of [-1, 1]) {
        const ey = eyeY(s);
        if (fury > 0.5) {
          P_ell(ctx, s * 0.045, ey - 0.01, 0.04, 0.028, P.cola([255, 40, 24], 0.45 * fury));
          P_ell(ctx, s * 0.043, ey - 0.011, Math.max(0.014, px * 1.1), Math.max(0.012, px), P.raw([255, 70, 44]));
          P_line(ctx, s * 0.094, ey + 0.05, s * 0.01, ey + 0.004, 0.02, K.hair);   // the painted brow, pulled down hard
        } else {
          P_ell(ctx, s * 0.045 + 0.009, ey + 0.01, 0.007, 0.007, P.cola([255, 255, 255], 0.75));
          for (let k = -1; k <= 1; k++) P_line(ctx, s * 0.045 + k * 0.012, ey + 0.034, s * 0.045 + k * 0.018, ey + 0.048, 0.004, K.glass);
        }
      }
      P_ell(ctx, -0.07, 0.09, 0.022, 0.016, P.cola([224, 112, 124], 0.55)); P_ell(ctx, 0.07, 0.09, 0.022, 0.016, P.cola([224, 112, 124], 0.55));
      // a hairline crack down the temple onto the cheek, outside the eye on the left of the view: clear of the eye, its lid and
      // its glare at their widest (lunging, angry) and of the snarl, in every look it has
      P_limb(ctx, [[-0.108, 0.152], [-0.098, 0.124], [-0.104, 0.104], [-0.088, 0.084], [-0.092, 0.068]], 0.005, P.col([96, 80, 74]));
      if (fury > 0.5) {
        // the painted lips drawn back off two rows of little teeth, the corners down: a snarl. Lunging at you it keeps it,
        // the jaw dropping and the teeth parting as it comes
        ctx.save(); ctx.translate(0, 0.052); ctx.scale(1 + lunge * 0.4, 1 + lunge * 0.8); ctx.translate(0, -0.052);
        P_poly(ctx, [[-0.066, 0.042], [-0.036, 0.08], [0.036, 0.08], [0.066, 0.042], [0.036, 0.026], [-0.036, 0.026]], K.lip);
        P_poly(ctx, [[-0.052, 0.045], [-0.03, 0.07], [0.03, 0.07], [0.052, 0.045], [0.03, 0.034], [-0.03, 0.034]], P.col([34, 8, 12]));
        P_rect(ctx, -0.034, 0.055, 0.068, 0.014, K.lace); P_rect(ctx, -0.028, 0.036, 0.056, 0.01, K.lace);
        for (let k = -2; k <= 2; k++) P_line(ctx, k * 0.0135, 0.055, k * 0.0135, 0.069, 0.003, K.porcelainD);
        for (let k = -2; k <= 1; k++) P_line(ctx, k * 0.013 + 0.0065, 0.036, k * 0.013 + 0.0065, 0.046, 0.003, K.porcelainD);
        ctx.restore();
      } else if (lunge > 0.25) P_ell(ctx, 0, 0.055, 0.02 + lunge * 0.035, 0.01 + lunge * 0.05, P.col([10, 4, 6]));
      else if (c.smile) {
        // the smile: painted on, and much too wide
        ctx.strokeStyle = K.lip; ctx.lineWidth = 0.011; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0.095, 0.058, Math.PI + 0.45, TAU - 0.45); ctx.stroke();
        P_ell(ctx, -0.05, 0.075, 0.006, 0.006, K.lip); P_ell(ctx, 0.05, 0.075, 0.006, 0.006, K.lip);
      } else P_ell(ctx, 0, 0.055, 0.016, 0.01, K.lip);
    }
    // a big bow on top
    P_poly(ctx, [[0, 0.27], [-0.13, 0.32], [-0.12, 0.2]], K.ribbon); P_poly(ctx, [[0, 0.27], [0.13, 0.32], [0.12, 0.2]], K.ribbon);
    P_ell(ctx, 0, 0.265, 0.03, 0.025, K.ribbon);
    ctx.restore();
    ctx.restore();
  },
  // flat out, side on, as it takes the box away: a doll's stiff legs swinging from the hip like a wind-up toy's (there are
  // no knees to bend), so it bobs down as they spread; the skirt blown back, the sash's tails and the ringlets flying, the
  // box hugged to its chest, the painted smile seen from the side. c.runDir is +1 running to the right of the view, -1 to
  // the left; c.runGait its stride.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, K = this.colours(P), fly = Math.sin(g * 2) * 0.02;
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const legs = [g + Math.PI, g].map(ph => { const a = Math.sin(ph) * 0.62; return { fx: Math.sin(a) * 0.4, fy: 0.44 - Math.cos(a) * 0.4 }; });
    ctx.translate(0, 0.035 - Math.min(legs[0].fy, legs[1].fy));   // whichever foot is lowest is on the ground
    const leg = (l, col) => { P_line(ctx, 0, 0.44, l.fx, l.fy, 0.07, col); P_ell(ctx, l.fx + 0.035, l.fy - 0.004, 0.065, 0.032, K.shoe); };
    leg(legs[0], K.stockingD);
    leg(legs[1], K.stocking);
    // the far arm, round the back of the box
    P_limb(ctx, [[-0.01, 0.92], [0.06, 0.77], [0.25, 0.72]], 0.04, K.porcelainD);
    // the skirt, blown out behind it, its lace hem, and the sash's tails flying
    P_poly(ctx, [[-0.1, 0.8], [0.08, 0.8], [0.19, 0.47], [0.04, 0.43], [-0.2, 0.44 + fly], [-0.36, 0.52 - fly]], K.dress);
    for (let k = 0; k < 6; k++) { const u = k / 5; P_ell(ctx, lerp(0.17, -0.34, u), lerp(0.46, 0.52, u) + (k & 1 ? fly : -fly) * 0.5, 0.045, 0.03, K.lace); }
    P_poly(ctx, [[-0.08, 0.79], [0.08, 0.79], [0.07, 0.98], [-0.07, 0.98]], K.dress);
    P_rect(ctx, -0.085, 0.76, 0.17, 0.05, K.dressD);
    P_ell(ctx, -0.11, 0.79, 0.045, 0.03, K.ribbon); P_line(ctx, -0.12, 0.78, -0.28, 0.66 + fly * 2, 0.026, K.ribbon); P_line(ctx, -0.11, 0.77, -0.24, 0.6 - fly * 2, 0.026, K.ribbon);
    P_ell(ctx, 0.0, 0.94, 0.055, 0.045, K.dress);
    // the box, hugged to its chest, and the near arm over it
    if (c.carry) { const A = this.carryAt; ctx.save(); ctx.translate(0.2, A.y + 0.04); ctx.scale(A.w * 0.85, A.w * 0.85); c.carry(ctx, P); ctx.restore(); }
    P_limb(ctx, [[0.0, 0.92], [0.07, 0.78], [0.27, 0.74]], 0.045, K.porcelainD);
    P_ell(ctx, 0.27, 0.735, 0.03, 0.028, K.porcelain);
    // the head, side on: ringlets flying out behind, the big glass eye, a blush, the smile running back along the cheek
    ctx.save(); ctx.translate(0.02, 1.0); ctx.rotate(-0.1);
    P_rect(ctx, -0.02, -0.02, 0.045, 0.05, K.porcelainD);
    P_ell(ctx, -0.03, 0.15, 0.11, 0.135, K.hair);
    for (let k = 0; k < 4; k++) P_ell(ctx, -0.11 - k * 0.025 - Math.abs(fly) * 2, 0.14 - k * 0.05 + (k & 1 ? fly : -fly), 0.036, 0.04, (k & 1) ? K.hairL : K.hair);
    P_ell(ctx, 0.035, 0.125, 0.09, 0.122, K.porcelain);
    P_ell(ctx, 0.0, 0.22, 0.1, 0.055, K.hair);
    P_ell(ctx, 0.07, 0.135, 0.022, 0.03, K.glass); P_ell(ctx, 0.078, 0.146, 0.006, 0.006, P.cola([255, 255, 255], 0.75));
    for (let k = 0; k < 3; k++) P_line(ctx, 0.06 + k * 0.012, 0.165, 0.066 + k * 0.018, 0.18, 0.004, K.glass);
    P_ell(ctx, 0.11, 0.115, 0.012, 0.01, K.porcelainD);
    P_ell(ctx, 0.05, 0.085, 0.024, 0.016, P.cola([224, 112, 124], 0.55));
    P_limb(ctx, [[0.115, 0.07], [0.09, 0.055], [0.05, 0.075]], 0.011, K.lip);
    P_limb(ctx, [[-0.01, 0.2], [0.0, 0.17], [-0.005, 0.15]], 0.005, P.col([96, 80, 74]));
    P_poly(ctx, [[-0.02, 0.27], [-0.13, 0.33], [-0.12, 0.2]], K.ribbon); P_poly(ctx, [[-0.02, 0.27], [0.07, 0.33], [0.08, 0.22]], K.ribbon);
    P_ell(ctx, -0.02, 0.265, 0.03, 0.025, K.ribbon);
    ctx.restore();
    ctx.restore();
  },
};
