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
  // c.headroom (metres above its feet as drawn, or undefined) is a height it must keep under: the lintel of a doorway it is
  // coming in through (The Field's are a head too low for it). It ducks under it, as far as it must (duckFor): the
  // head and shoulders bent down and forward at you, the hips dropped and the knees bent out, the elbows down and the
  // hands up by its shoulders, reaching for you, and it straightens as the headroom comes back. c.duck is how far down it is (0..1).
  // DUCK is the pose all the way down: the hips, the shoulders, the head brought down in front of them (and nearer, so
  // bigger; it goes down ahead of the rest), the hands, and how far its back rounds up behind its head.
  DUCK: { hip: 0.92, top: 1.58, head: -0.36, headK: 0.12, hand: -0.15, back: 0.12, rise: 3 },
  // where it is at stoop dk, for the stoop and the peer (pk, bl) together: the shoulders, the hips, the head's own drop and
  // scale, and how high its hands are; and peak, the highest of all of it (the top of its head or its back, or a fingertip)
  stance(c, dk, pk, bl, bob, raise) {
    const D = this.DUCK, lifts = c.handLift || [0, 0];
    const hipY = lerp(lerp(1.22, 0.86, pk), D.hip, dk) + bob, top = lerp(lerp(2.0, 1.39, pk), D.top, dk) + bob - bl * 0.03;
    const hk = Math.min(1, dk * 1.5), headDy = -0.1 * pk + D.head * hk, headK = 1 + 0.12 * pk + 0.08 * bl + D.headK * hk;
    const handY = s => { const lift = smoothstep(lifts[s > 0 ? 1 : 0] || 0); return lerp(lerp(lerp(0.72, 1.95, raise), 1.53 + lift * 0.47, pk), top + D.hand, dk); };
    const reach = 0.17 + raise * 0.05 + 0.012;   // the longest finger, and its width
    return { hipY, top, headDy, headK, handY, peak: Math.max(top + headDy + 0.475 * headK, top + D.back * dk, handY(-1) + reach, handY(1) + reach) };
  },
  // the least stoop that keeps it under c.headroom (allowing for its breathing, which stretches it up to 1.4% taller)
  duckFor(c, pk, bl, bob, raise) {
    const room = c.headroom === undefined ? Infinity : c.headroom / 1.015;
    if (this.stance(c, 0, pk, bl, bob, raise).peak <= room) return 0;
    let lo = 0, hi = 1;
    for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (this.stance(c, m, pk, bl, bob, raise).peak <= room) hi = m; else lo = m; }
    return hi;
  },
  // its long fingers (as fingers() spreads them), the last of each one a black nail: blacker than the rest of it, which
  // the light and the fog lift toward grey, so the hooked ends of them read as nails in every pose
  claws(ctx, x, y, angle, spread, len, w, body, P) {
    fingers(ctx, x, y, angle, spread, len, w, body);
    const nail = P.col([0, 0, 0]);
    for (let i = 0; i < 4; i++) {
      const a = angle + (i - 1.5) * spread, l = len * ((i === 0 || i === 3) ? 0.82 : 1), ca = Math.cos(a), sa = Math.sin(a);
      P_line(ctx, x + ca * l * 0.7, y + sa * l * 0.7, x + ca * l * 1.06, y + sa * l * 1.06, w * 1.05, nail);
    }
  },
  // its head is in a sack: a bag of coarse pale burlap pulled down over it, the only pale thing about it. Drawn in the
  // frame of the head (y = 0 where the neck leaves the shoulders, the crown at 0.47, as stance() allows for), from the
  // front. Two holes roughly cut for eyes, black right through, nothing in them; the mouth a crooked slit cut across and
  // stitched over, which tears open (tear 0..1) when it gets you; a stitched seam up the middle of the face and over the
  // crown and another round the side; the cloth drawn in at the neck by a cord and hanging loose below it in folds onto
  // the shoulders, a ragged hem and a loose thread or two. Far off the sack and its holes are all there is; detail
  // (0..1) brings up the seams, the frayed edges and the weave as it nears.
  SACK: [[-0.07, 0.13], [-0.15, 0.17, -0.148, 0.33, -0.122, 0.4], [-0.085, 0.476, 0.0, 0.47], [0.09, 0.472, 0.126, 0.392], [0.152, 0.32, 0.15, 0.17, 0.07, 0.13]],
  // the hem of the loose cloth, left to right (it sags lowest where a fold comes down to it), and the folds, from the cord
  HEM: [[-0.195, -0.02], [-0.165, -0.07], [-0.125, -0.055], [-0.08, -0.105], [-0.035, -0.07], [0.015, -0.118], [0.07, -0.078], [0.115, -0.1], [0.165, -0.058], [0.192, -0.025]],
  FOLDS: [[-0.05, -0.165, -0.07], [-0.025, -0.08, -0.105], [0.005, 0.015, -0.118], [0.035, 0.115, -0.1]],
  // the eye holes, cut by hand: [x, y, rx, ry, turn]; RAG, how far each point round a cut edge strays
  HOLES: [[-0.05, 0.315, 0.034, 0.025, 0.16], [0.049, 0.321, 0.031, 0.028, -0.22]],
  RAG: [0.06, 0.12, 0.03, -0.06, -0.11, -0.03, 0.07, 0.13, 0.0, -0.07, -0.12, -0.01, 0.09, 0.02],
  sackPath(ctx) {
    const [m, a, b, d, e] = this.SACK;
    ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.bezierCurveTo(...a); ctx.quadraticCurveTo(...b); ctx.quadraticCurveTo(...d); ctx.bezierCurveTo(...e); ctx.closePath();
  },
  sackCols(P) { return { bag: P.col([158, 148, 126]), bagM: P.col([138, 128, 108]), bagS: P.col([112, 102, 86]), bagD: P.col([78, 68, 56]), thread: P.col([56, 48, 40]), hole: P.col([0, 0, 0]) }; },
  // a hole cut in the cloth, its edge ragged and darkened; frayed, threads stick out over the black from the cut edge
  hole(ctx, K, x, y, rx, ry, rot, k, detail) {
    const R = this.RAG, n = R.length, cr = Math.cos(rot), sr = Math.sin(rot);
    const ring = (g, j) => R.map((_, i) => {
      const a = i / n * TAU, r = (1 + R[(i + j) % n]) * g, ex = Math.cos(a) * rx * r, ey = Math.sin(a) * ry * r;
      return [x + ex * cr - ey * sr, y + ex * sr + ey * cr];
    });
    if (detail > 0) { ctx.save(); ctx.globalAlpha *= detail; P_poly(ctx, ring(1.28, k + 3), K.bagD); ctx.restore(); }
    const edge = ring(1, k);
    P_poly(ctx, edge, K.hole);
    const fray = clamp((detail - 0.85) / 0.15, 0, 1);   // (only close up: from further off a fleck in the black would read as an eye)
    if (fray > 0) {
      ctx.save(); ctx.globalAlpha *= fray; ctx.strokeStyle = K.bagS; ctx.lineWidth = 0.003; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = k % 3; i < n; i += 3) { const [px, py] = edge[i], l = 0.12 + Math.abs(R[(i + 5) % n]); ctx.moveTo(px, py); ctx.lineTo(px + (x - px) * l, py + (y - py) * l); }
      ctx.stroke(); ctx.restore();
    }
  },
  // a seam: the cloth puckered along it and stitched across in thick thread
  seam(ctx, K, pts, detail) {
    if (detail <= 0) return;
    ctx.save(); ctx.globalAlpha *= detail;
    P_limb(ctx, pts, 0.008, K.bagS);
    ctx.strokeStyle = K.thread; ctx.lineWidth = 0.0045; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / l * 0.009, ny = (x1 - x0) / l * 0.009;
      for (const f of [0.25, 0.75]) { const sx = lerp(x0, x1, f), sy = lerp(y0, y1, f); ctx.moveTo(sx - nx, sy - ny - 0.003); ctx.lineTo(sx + nx, sy + ny + 0.003); }
    }
    ctx.stroke(); ctx.restore();
  },
  sack(ctx, c, P, detail, tear) {
    const K = this.sackCols(P), t = c.t;
    // the loose cloth below the cord, hanging onto the shoulders in folds, a thread or two off the hem
    const H = this.HEM;
    ctx.beginPath(); ctx.moveTo(-0.07, 0.125); ctx.quadraticCurveTo(-0.15, 0.06, H[0][0], H[0][1]);
    for (let i = 1; i < H.length - 1; i++) ctx.quadraticCurveTo(H[i][0], H[i][1], (H[i][0] + H[i + 1][0]) / 2, (H[i][1] + H[i + 1][1]) / 2);
    ctx.lineTo(H[H.length - 1][0], H[H.length - 1][1]); ctx.quadraticCurveTo(0.15, 0.06, 0.07, 0.125); ctx.closePath();
    ctx.fillStyle = K.bagM; ctx.fill();
    for (const [x0, x1, y1] of this.FOLDS) P_limb(ctx, [[x0, 0.11], [(x0 * 2 + x1) / 3, 0.03], [x1 * 0.97, y1 + 0.03]], 0.011, K.bagS);
    if (detail > 0) {
      ctx.save(); ctx.globalAlpha *= detail;
      for (const [x, y, l, ph] of [[-0.125, -0.055, 0.07, 0], [0.115, -0.1, 0.06, 2], [0.04, -0.09, 0.035, 4]]) { const sw = Math.sin(t * 1.7 + ph) * 0.008; P_limb(ctx, [[x, y], [x + sw * 0.5, y - l * 0.5], [x + sw, y - l]], 0.0035, K.bagS); }
      ctx.restore();
    }
    // the sack over the head, a little shaded down its right, the coarse weave of it showing near
    this.sackPath(ctx); ctx.fillStyle = K.bag; ctx.fill();
    ctx.save(); this.sackPath(ctx); ctx.clip();
    P_ell(ctx, 0.15, 0.27, 0.06, 0.22, K.bagS);
    if (detail > 0) {
      ctx.globalAlpha *= detail * 0.7; ctx.strokeStyle = K.bagS; ctx.lineWidth = 0.004; ctx.beginPath();
      for (let i = 0; i < 9; i++) { const x = -0.11 + i * 0.027, y = 0.17 + ((i * 7) % 5) * 0.06; ctx.moveTo(x, y); ctx.lineTo(x + 0.035, y + 0.018); ctx.moveTo(x + 0.01, y + 0.03); ctx.lineTo(x + 0.04, y + 0.044); }
      for (let i = 0; i < 6; i++) { const x = -0.1 + i * 0.04, y = 0.42 - ((i * 3) % 4) * 0.075; ctx.moveTo(x, y); ctx.lineTo(x + 0.028, y - 0.012); }
      ctx.stroke();
    }
    ctx.restore();
    // drawn in at the neck: the cloth bunched over the cord, creased into it
    P_ell(ctx, 0, 0.125, 0.082, 0.026, K.bag);
    P_line(ctx, -0.078, 0.118, 0.078, 0.112, 0.011, K.thread);
    if (detail > 0) {
      ctx.save(); ctx.globalAlpha *= detail;
      for (const x of [-0.055, -0.025, 0.01, 0.045]) { P_line(ctx, x, 0.13, x + 0.006, 0.152, 0.005, K.bagS); P_line(ctx, x + 0.012, 0.108, x + 0.008, 0.09, 0.005, K.bagD); }
      P_limb(ctx, [[0.07, 0.112], [0.085, 0.08], [0.079, 0.05]], 0.005, K.thread);   // the end of the cord
      ctx.restore();
    }
    // the seams: up the middle of the face and over the crown, and round its left side
    this.seam(ctx, K, [[0.001, 0.15], [0.004, 0.18], [-0.003, 0.24], [0.003, 0.28], [-0.002, 0.35], [0.004, 0.41], [0.0, 0.47]], detail);
    this.seam(ctx, K, [[-0.092, 0.452], [-0.122, 0.39], [-0.137, 0.31], [-0.128, 0.22], [-0.098, 0.15]], detail);
    this.HOLES.forEach(([x, y, rx, ry, rot], i) => this.hole(ctx, K, x, y, rx, ry, rot, i * 5, detail));
    // the mouth: a crooked slit, stitched across; tearing, the stitches give and it gapes, ragged, threads across the dark
    const M = [[-0.046, 0.203], [-0.024, 0.197], [-0.004, 0.2], [0.018, 0.194], [0.043, 0.19]];
    const tr = clamp(tear || 0, 0, 1), w = 1 + tr * 0.45;
    if (tr < 0.03) P_limb(ctx, M, 0.008, K.hole);
    else {
      // the cut torn wider (to the ends of the slit and past them) and down: the upper edge lifts a little, the lower one
      // sags open, both of them ragged
      const R = this.RAG, gape = tr * 0.05, n = 9, top = [], bot = [];
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1) * 4, a = M[Math.min(3, Math.floor(u))], b = M[Math.min(4, Math.floor(u) + 1)], f = u - Math.min(3, Math.floor(u));
        const x = lerp(a[0], b[0], f) * w, y = lerp(a[1], b[1], f), k = Math.sin(i / (n - 1) * Math.PI);
        top.push([x, y + gape * (0.25 * k + 0.12 * R[i] * k)]);
        bot.unshift([x, y - 0.003 - gape * Math.pow(k, 0.7) * (1 + 1.5 * R[i + 4])]);
      }
      if (detail > 0) { ctx.save(); ctx.globalAlpha *= detail; P_poly(ctx, top.map(([x, y]) => [x * 1.06, y + 0.005]).concat(bot.map(([x, y]) => [x * 1.06, y - 0.006])), K.bagD); ctx.restore(); }
      P_poly(ctx, top.concat(bot), K.hole);
      if (detail > 0 && tr > 0.25) {   // a thread or two of the stitching, still across it
        ctx.save(); ctx.globalAlpha *= detail;
        P_limb(ctx, [top[2], [top[2][0] + 0.003, (top[2][1] + bot[6][1]) / 2 - 0.004], bot[6]], 0.003, K.bagS);
        P_line(ctx, top[5][0], top[5][1], bot[2][0] - 0.008, bot[2][1] + gape * 0.4, 0.003, K.bagS);
        ctx.restore();
      }
    }
    if (detail > 0 && tr < 0.4) {   // the stitches across it
      ctx.save(); ctx.globalAlpha *= detail * (1 - tr / 0.4); ctx.strokeStyle = K.thread; ctx.lineWidth = 0.005; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 4; i++) { const [x0, y0] = M[i], [x1, y1] = M[i + 1], x = (x0 + x1) / 2 * w, y = (y0 + y1) / 2; ctx.moveTo(x - 0.004, y + 0.014 + tr * 0.03); ctx.lineTo(x + 0.004, y - 0.014 - tr * 0.04); }
      ctx.stroke(); ctx.restore();
    }
  },
  // the sack side on, facing +x, about the middle of the head: the one eye hole toward where it goes, the slit at the
  // front, the seam over the crown and down the side, drawn in by the cord under the back of it
  sackSide(ctx, c, P, detail) {
    const K = this.sackCols(P);
    ctx.beginPath(); ctx.moveTo(-0.07, -0.15); ctx.bezierCurveTo(-0.15, -0.08, -0.15, 0.12, -0.08, 0.16); ctx.quadraticCurveTo(0.02, 0.19, 0.09, 0.13);
    ctx.bezierCurveTo(0.15, 0.07, 0.14, -0.08, 0.1, -0.13); ctx.quadraticCurveTo(0.02, -0.17, -0.07, -0.15); ctx.closePath(); ctx.fillStyle = K.bag; ctx.fill();
    P_ell(ctx, -0.05, -0.15, 0.07, 0.025, K.bag, 0.3);
    P_line(ctx, -0.11, -0.16, 0.0, -0.145, 0.011, K.thread);   // the cord
    this.seam(ctx, K, [[0.11, 0.1], [0.06, 0.155], [-0.01, 0.17], [-0.06, 0.13], [-0.08, 0.05], [-0.075, -0.04], [-0.06, -0.12]], detail);
    this.hole(ctx, K, 0.074, 0.03, 0.022, 0.028, 0.1, 2, detail);
    P_limb(ctx, [[0.122, -0.058], [0.104, -0.06], [0.086, -0.066]], 0.008, K.hole);
  },
  draw(ctx, c, P) {
    if (c.runPose || c.charge) { c.duck = 0; (c.runPose ? this.drawRun : this.drawCharge).call(this, ctx, c, P); return; }   // upright again after either
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const body = P.col([6, 6, 10]);
    const bob = Math.abs(Math.sin(g)) * 0.05;
    const sway = Math.sin(g) * 0.035;
    const pk = smoothstep(c.peer || 0), bl = (c.blow || 0) * pk;   // stooping to look in: the hips drop, the knees splay, the body leans in at you
    const raise = smoothstep(Math.max(near, c.lunge || 0));   // the arms rise toward you when close
    // ducking under a lintel: at once as far as it must, and straightening no faster than DUCK.rise (a night that lets it
    // stand, as The Field does the moment it is won, does not jerk it upright)
    const since = clamp(c.t - (c.duckAt === undefined ? c.t : c.duckAt), 0, 0.1);
    const dk = c.duck = Math.max(this.duckFor(c, pk, bl, bob, raise), (c.duck || 0) - since * this.DUCK.rise);
    c.duckAt = c.t;
    const st = this.stance(c, dk, pk, bl, bob, raise), hipY = st.hipY, top = st.top, sw = lerp(0.22, 0.26, pk) + 0.04 * dk;
    // legs (front view: feet lift alternately)
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.24;
      const hx = s * 0.08 + sway, kx = s * (0.12 + 0.12 * pk + 0.1 * dk) + sway * 0.6, fx = s * 0.15 + sway * 0.3;
      P_limb(ctx, [[hx, hipY], [kx, hipY * 0.5 + lift * 0.75], [fx, lift + 0.03]], 0.075, body);
      P_line(ctx, fx - 0.03, lift + 0.03, fx + s * 0.09, lift + 0.03, 0.07, body);
    }
    // torso: far too narrow; bent at you under a lintel, its back rounds up behind its head between the shoulders
    P_poly(ctx, [[-0.15 + sway, hipY - 0.06], [0.15 + sway, hipY - 0.06], [sw + sway * 0.6, top], [-sw + sway * 0.6, top]], body);
    if (dk > 0.02) P_ell(ctx, sway * 0.6, top - 0.02, sw + 0.02, this.DUCK.back * dk + 0.02, body);
    // arms: hang to the knees; rise toward you when close
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? 0 : Math.PI);
      const swing = Math.sin(ph) * 0.05 * (1 - raise);
      const sx = s * (sw - 0.01) + sway * 0.6, sy = top - 0.05;
      // stooping, the elbows go out and the hands come down on the board under the gap, the fingers over its edge; a
      // hand raised to strike goes up out of sight behind the board above. Ducking, the elbows come down and out and the
      // hands up by its shoulders, reaching for you.
      const lift = smoothstep((c.handLift && c.handLift[s > 0 ? 1 : 0]) || 0);
      const ex = s * lerp(lerp(lerp(0.24, 0.52, raise), lerp(0.62, 0.58, lift), pk), 0.5, dk) + swing, ey = lerp(lerp(lerp(1.38, 1.55, raise), lerp(1.3, 1.66, lift), pk), top - 0.42, dk);
      const hx = s * lerp(lerp(lerp(0.27, 0.4, raise), lerp(0.36, 0.42, lift), pk), 0.36, dk) + swing * 2, hy = st.handY(s);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
      const ang = lerp(lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), lerp(s > 0 ? -Math.PI * 0.56 : -Math.PI * 0.44, s > 0 ? Math.PI * 0.42 : Math.PI * 0.58, lift), pk);
      this.claws(ctx, hx, hy, ang, lerp(lerp(0.16, 0.3, raise), lerp(0.1, 0.3, lift), pk), 0.17 + raise * 0.05, 0.018, body, P);
    }
    // neck and head with a snapping tilt (ducking, the head is thrust out at you, low between the shoulders)
    const tilt = headTiltJerk(t, 2.7, 0.33) * (1 - (c.lunge || 0)) * (1 - 0.6 * dk);
    ctx.save();
    ctx.translate(sway * 0.6, top);
    ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12, 0.07, body);
    if (pk || dk) { ctx.translate(0, st.headDy); ctx.scale(st.headK, st.headK); }   // leaning in: the neck foreshortened, the head nearer
    this.sack(ctx, c, P, clamp((26 - c.dist) / 22, 0, 1), (c.lunge || 0) + near * 0.06);   // (the slit parts a little, near)
    ctx.restore();
  },
  // flat out, straight at you, seen from the front: bent forward so the shoulders come down and the head is thrust out
  // ahead of them, a knee driving up at you with each stride while the other leg is down and pushing off, the long arms
  // pumping, a hand coming up past its chin each stride. In the last few metres the arms come up and out for the boards.
  // Its legs go by c.gait, which the night strides out to the speed it is going.
  drawCharge(ctx, c, P) {
    const g = c.gait, body = P.col([6, 6, 10]);
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
      this.claws(ctx, hx, hy, ang, lerp(0.14, 0.3, reach), lerp(0.08 + 0.09 * Math.abs(fwd), 0.22, reach), 0.018, body, P);   // pointing at you, the fingers are foreshortened too
    };
    for (const s of [-1, 1]) arm(s, false);
    P_poly(ctx, [[-0.14, hipY - 0.06], [0.14, hipY - 0.06], [0.22, top], [-0.22, top]], body);   // the torso, bent at you: shorter, and still far too narrow
    for (const s of [-1, 1]) arm(s, true);
    // the head, low and thrust out ahead of the shoulders, nearer and so a little bigger; the slit parting
    ctx.translate(0, top - 0.24); ctx.scale(1.15, 1.15);
    P_line(ctx, 0, 0.08, 0, 0.2, 0.07, body);
    this.sack(ctx, c, P, clamp((26 - c.dist) / 22, 0, 1), 0.1 + 0.15 * reach);
    ctx.restore();
  },
  // flat out, seen from the side: leaning far forward, the long legs reaching and kicking up behind, the arms pumping,
  // the head pushed out ahead. c.runDir is +1 running to the right of the view, -1 to the left; c.runGait its stride.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, body = P.col([6, 6, 10]);
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
      this.claws(ctx, hx, hy, Math.atan2(hy - ey, hx - ex), 0.14, 0.17, 0.018, body, P);
    };
    limb(legs[1]);   // the far side first
    P_poly(ctx, [[hipX - 0.12, hipY - 0.05], [hipX + 0.1, hipY - 0.05], [sx + 0.13, sy], [sx - 0.15, sy - 0.02]], body);   // the torso, side on: still far too narrow
    limb(legs[0]);
    // the neck and the head, thrust forward of the shoulders
    const nx = sx + Math.sin(lean + 0.5) * 0.16, ny = sy + Math.cos(lean + 0.5) * 0.16;
    P_line(ctx, sx, sy, nx, ny, 0.07, body);
    const hx = nx + Math.sin(lean + 0.3) * 0.17, hy = ny + Math.cos(lean + 0.3) * 0.17;
    // the loose cloth of the sack below the cord, blown back over the shoulders
    const fl = Math.sin(g * 2) * 0.02, K = this.sackCols(P);
    P_poly(ctx, [[nx + 0.02, ny + 0.02], [nx - 0.04, ny + 0.05], [sx - 0.1, sy - 0.01 + fl], [sx - 0.17, sy - 0.07 + fl], [sx - 0.12, sy - 0.06 + fl], [sx - 0.08, sy - 0.1 + fl * 0.5], [sx - 0.02, sy - 0.08], [sx + 0.03, sy - 0.12 + fl * 0.3], [sx + 0.07, sy - 0.05], [nx + 0.06, ny - 0.04]], K.bagM);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-lean * 0.6);
    this.sackSide(ctx, c, P, clamp((26 - c.dist) / 22, 0, 1));
    ctx.restore();
    ctx.restore();
  },
};
