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
  // A scarecrow left out too many years: the black thing is dressed in a farmhand's cast-offs, an old work coat faded to
  // the colour of dirt, sewn patches on it, its hem torn ragged, a twist of rope for a belt; old trousers tied off above
  // the ankle with twine, and the sleeves tied at the wrist; straw sticking out at the cuffs, the ankles, the collar and
  // through a rip in the coat; its long fingers dead twigs, sharp at the ends. Everything stays inside the black shape it
  // always had (the coat and the clothes are drawn in from its edges, which are left black), so its outline, its
  // proportions and its poses are the walker's own; only the straw sticks out a little, and never above its head.
  // KIT is the colours, before the night's light and fog: muted, dirty and dark, so at night it is still a dark figure.
  KIT: { coat: [37, 34, 27], seam: [18, 17, 14], trousers: [27, 28, 31], patch: [[55, 42, 33], [34, 39, 42], [47, 45, 33]],
    stitch: [96, 86, 64], rope: [78, 66, 46], ropeD: [46, 38, 26], straw: [118, 101, 62], strawD: [82, 70, 43], bark: [42, 34, 25] },
  kit(P) { const K = this.KIT, o = {}; for (const k in K) o[k] = k === 'patch' ? K.patch.map(c => P.col(c)) : P.col(K[k]); o.black = P.col([0, 0, 0]); return o; },
  // a tuft of straw at (x, y), n stiff strands fanning out around angle a, stirring a little
  straw(ctx, k, x, y, a, n, len, spread, t, seed) {
    for (let i = 0; i < n; i++) {
      const h = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453, r = h - Math.floor(h);
      const b = a + (i - (n - 1) / 2) * spread + (r - 0.5) * spread * 0.8 + Math.sin(t * 1.7 + seed + i) * 0.04, l = len * (0.55 + 0.45 * r);
      P_line(ctx, x, y, x + Math.cos(b) * l, y + Math.sin(b) * l, 0.009, i % 2 ? k.strawD : k.straw);
    }
  },
  // twine wound round a limb at (x, y), across the line of it (angle a)
  tie(ctx, k, x, y, a, half) {
    const cx = Math.cos(a + Math.PI / 2) * half, cy = Math.sin(a + Math.PI / 2) * half;
    P_line(ctx, x - cx, y - cy, x + cx, y + cy, 0.022, k.ropeD);
    P_line(ctx, x - cx * 0.8, y - cy * 0.8, x + cx * 0.8, y + cy * 0.8, 0.012, k.rope);
  },
  // a sleeve over an arm (shoulder, elbow, hand), tied at the wrist, the straw coming out of the cuff
  sleeve(ctx, k, s, e, h, t, seed) {
    const cu = [lerp(e[0], h[0], 0.74), lerp(e[1], h[1], 0.74)], a = Math.atan2(h[1] - e[1], h[0] - e[0]);
    P_limb(ctx, [s, e, cu], 0.034, k.coat);
    this.straw(ctx, k, cu[0], cu[1], a, 5, Math.hypot(h[0] - cu[0], h[1] - cu[1]) * 0.95, 0.32, t, seed);
    this.tie(ctx, k, cu[0], cu[1], a, 0.032);
  },
  // a trouser leg over a leg (hip, knee, foot), tied off above the ankle, the straw coming out under it; w the leg's width
  trouser(ctx, k, hp, kn, ft, w, t, seed) {
    const hem = [lerp(kn[0], ft[0], 0.78), lerp(kn[1], ft[1], 0.78)], a = Math.atan2(ft[1] - kn[1], ft[0] - kn[0]);
    P_limb(ctx, [hp, kn, hem], w - 0.026, k.trousers);
    this.straw(ctx, k, hem[0], hem[1], a, 6, Math.hypot(ft[0] - hem[0], ft[1] - hem[1]) * 0.8, 0.34, t, seed);
    this.tie(ctx, k, hem[0], hem[1], a, w * 0.5);
  },
  // the coat over the torso, the quad bl, br, tr, tl (bottom left and right, top right and left): inside its black edge, its
  // hem torn ragged below it, patched, a rope belt, a rip with straw coming through it, and straw at the collar.
  // front: seen from the front (the coat's opening and its buttons); hump: the rounded back behind its head ([x, y, rx, ry]).
  coat(ctx, k, bl, br, tr, tl, t, front, hump) {
    const at = (u, v) => { const q = (u + 1) / 2; return [lerp(lerp(bl[0], br[0], q), lerp(tl[0], tr[0], q), v), lerp(lerp(bl[1], br[1], q), lerp(tl[1], tr[1], q), v)]; };
    const len = Math.hypot(tl[0] - bl[0], tl[1] - bl[1]), dn = [(bl[0] - tl[0]) / len, (bl[1] - tl[1]) / len];   // down the coat
    const DROP = [0.02, 0.07, 0.03, 0.09, 0.04, 0.06, 0.015, 0.08, 0.03];   // the rags of its hem
    const hem = DROP.map((d, i) => { const p = at(1 - i / 4, 0); return [p[0] + dn[0] * d, p[1] + dn[1] * d]; });
    const shape = [tl, tr, ...hem];
    if (hump) P_ell(ctx, hump[0], hump[1], hump[2], hump[3], k.coat);
    P_poly(ctx, shape, k.coat);
    ctx.save();   // its black edge, inside the coat
    ctx.beginPath(); shape.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.clip();
    P_limb(ctx, [...shape, shape[0]], 0.03, k.seam);
    // the patches, sewn on with big stitches
    const PATCH = [[-0.78, -0.18, 0.5, 0.73, 0], [0.18, 0.72, 0.2, 0.36, 1], [-0.62, -0.1, 0.06, 0.16, 2]];
    for (const [u0, u1, v0, v1, ci] of PATCH) {
      const q = [at(u0, v0 + 0.02), at(u1, v0), at(u1 - 0.04, v1), at(u0, v1 - 0.015)];
      P_poly(ctx, q, k.patch[ci]);
      for (let e = 0; e < 4; e++) {
        const p0 = q[e], p1 = q[(e + 1) % 4], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), m = Math.max(2, Math.round(L / 0.035));
        const nx = -(p1[1] - p0[1]) / L * 0.012, ny = (p1[0] - p0[0]) / L * 0.012;
        for (let j = 0; j < m; j++) { const f = (j + 0.5) / m, x = lerp(p0[0], p1[0], f), y = lerp(p0[1], p1[1], f); P_line(ctx, x - nx, y - ny, x + nx, y + ny, 0.006, k.stitch); }
      }
    }
    if (front) {   // the coat's opening, and what is left of its buttons
      const o0 = at(0.06, 1), o1 = at(-0.04, 0.02);
      P_line(ctx, o0[0], o0[1], o1[0], o1[1], 0.012, k.seam);
      for (const [v, r] of [[0.66, 0.013], [0.44, 0.011]]) { const b = at(0.1, v); P_ell(ctx, b[0], b[1], r, r, k.ropeD); }
    }
    // a rip, the straw through it
    const rp = at(0.42, 0.6), rq = at(0.62, 0.48);
    P_poly(ctx, [rp, [lerp(rp[0], rq[0], 0.5) + 0.012, lerp(rp[1], rq[1], 0.5) + 0.01], rq, [lerp(rp[0], rq[0], 0.5) - 0.01, lerp(rp[1], rq[1], 0.5) - 0.012]], k.black);
    ctx.restore();
    this.straw(ctx, k, lerp(rp[0], rq[0], 0.5), lerp(rp[1], rq[1], 0.5), Math.atan2(-dn[1], -dn[0]) - 0.9, 4, 0.06, 0.35, t, 3);
    // the rope belt, knotted, its ends hanging
    const b0 = at(-1, 0.17), b1 = at(1, 0.17), kn = at(0.32, 0.17);
    P_line(ctx, b0[0], b0[1], b1[0], b1[1], 0.032, k.ropeD);
    P_line(ctx, b0[0], b0[1], b1[0], b1[1], 0.016, k.rope);
    for (const [dx, l] of [[-0.012, 0.13], [0.014, 0.1]]) P_line(ctx, kn[0] + dx, kn[1], kn[0] + dx * 2.5 + dn[0] * l, kn[1] + dn[1] * l, 0.014, k.rope);
    P_ell(ctx, kn[0], kn[1], 0.022, 0.02, k.rope);
    // straw at the collar, either side of its neck
    for (const u of [-0.45, 0.45]) { const c = at(u, 1); this.straw(ctx, k, c[0], c[1], Math.atan2(-dn[1], -dn[0]) + u * 1.1, 5, 0.075, 0.28, t, 7 + u * 4); }
  },
  // the twine tying its head on, round the neck (in the head's own frame, the neck going up from (0, 0))
  neckTie(ctx, k) { P_line(ctx, -0.04, 0.06, 0.04, 0.075, 0.024, k.ropeD); P_line(ctx, -0.034, 0.061, 0.034, 0.074, 0.012, k.rope); },
  // a twig finger from (x, y), angle a, length l: kinked at a knot, a spur off it, the end of it black and sharp
  twig(ctx, k, x, y, a, l, w, i) {
    const bend = (i % 2 ? 1 : -1) * 0.2, ca = Math.cos(a), sa = Math.sin(a);
    const kx = x + ca * l * 0.5, ky = y + sa * l * 0.5, b = a + bend, tx = kx + Math.cos(b) * l * 0.56, ty = ky + Math.sin(b) * l * 0.56;
    P_limb(ctx, [[x, y], [kx, ky], [tx, ty]], w, k.bark);
    P_ell(ctx, kx, ky, w * 0.7, w * 0.7, k.bark);
    if (i === 1 || i === 2) { const s = a - bend * 3; P_line(ctx, kx, ky, kx + Math.cos(s) * l * 0.22, ky + Math.sin(s) * l * 0.22, w * 0.5, k.bark); }
    P_line(ctx, lerp(kx, tx, 0.5), lerp(ky, ty, 0.5), tx + Math.cos(b) * l * 0.04, ty + Math.sin(b) * l * 0.04, w * 0.7, k.black);
  },
  // its long fingers (spread as fingers() spreads them): dead twigs, sharp and black at the ends, so the hooked ends of
  // them read as nails in every pose
  claws(ctx, x, y, angle, spread, len, w, body, P) {
    const k = this.kit(P);
    for (let i = 0; i < 4; i++) this.twig(ctx, k, x, y, angle + (i - 1.5) * spread, len * ((i === 0 || i === 3) ? 0.82 : 1), w, i);
  },
  // its fingers hooked over the top of a board (the board's top edge at oy + 0.1), drawn over it: twigs, bent over the
  // edge, leaning in toward its face (side is +1 for the hand on the right of the view), the hand at ox
  grip(ctx, P, side, ox, oy) {
    const k = this.kit(P);
    for (let i = 0; i < 4; i++) {
      const x = ox + side * (i - 1.5) * 0.026, len = [0.07, 0.085, 0.078, 0.056][i], lean = -side * 0.01, y0 = oy + 0.13, y1 = oy + 0.107;
      P_limb(ctx, [[x, y0], [x + lean * 0.4, y1], [x + lean + (i % 2 ? 0.006 : -0.006), oy + 0.1 - len * 0.55], [x + lean, oy + 0.1 - len]], 0.018, k.bark);
      P_ell(ctx, x + lean * 0.4, y1, 0.012, 0.012, k.bark);   // the knuckle, knotted, over the edge
      P_line(ctx, x + lean, oy + 0.1 - len * 0.7, x + lean, oy + 0.1 - len - 0.006, 0.012, k.black);
    }
  },
  draw(ctx, c, P) {
    if (c.runPose || c.charge) { c.duck = 0; (c.runPose ? this.drawRun : this.drawCharge).call(this, ctx, c, P); return; }   // upright again after either
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const body = P.col([6, 6, 10]);
    const skin = P.col([92, 84, 88]);
    const eye = P.col([225, 218, 205]);
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
    const k = this.kit(P);
    // legs (front view: feet lift alternately)
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.24;
      const hx = s * 0.08 + sway, kx = s * (0.12 + 0.12 * pk + 0.1 * dk) + sway * 0.6, fx = s * 0.15 + sway * 0.3;
      const leg = [[hx, hipY], [kx, hipY * 0.5 + lift * 0.75], [fx, lift + 0.03]];
      P_limb(ctx, leg, 0.075, body);
      P_line(ctx, fx - 0.03, lift + 0.03, fx + s * 0.09, lift + 0.03, 0.07, body);
      this.trouser(ctx, k, ...leg, 0.075, t, s + 2);
    }
    // torso: far too narrow, in its old coat; bent at you under a lintel, its back rounds up behind its head between the shoulders
    const torso = [[-0.15 + sway, hipY - 0.06], [0.15 + sway, hipY - 0.06], [sw + sway * 0.6, top], [-sw + sway * 0.6, top]];
    P_poly(ctx, torso, body);
    if (dk > 0.02) P_ell(ctx, sway * 0.6, top - 0.02, sw + 0.02, this.DUCK.back * dk + 0.02, body);
    this.coat(ctx, k, ...torso, t, true, dk > 0.02 ? [sway * 0.6, top - 0.02, sw - 0.01, this.DUCK.back * dk - 0.01] : null);
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
      this.sleeve(ctx, k, [sx, sy], [ex, ey], [hx, hy], t, s + 5);
      const ang = lerp(lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), lerp(s > 0 ? -Math.PI * 0.56 : -Math.PI * 0.44, s > 0 ? Math.PI * 0.42 : Math.PI * 0.58, lift), pk);
      this.claws(ctx, hx, hy, ang, lerp(lerp(0.16, 0.3, raise), lerp(0.1, 0.3, lift), pk), 0.17 + raise * 0.05, 0.018, body, P);
    }
    // neck and head with a snapping tilt (ducking, the head is thrust out at you, low between the shoulders)
    const tilt = headTiltJerk(t, 2.7, 0.33) * (1 - (c.lunge || 0)) * (1 - 0.6 * dk);
    ctx.save();
    ctx.translate(sway * 0.6, top);
    ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12, 0.07, body);
    this.neckTie(ctx, k);
    if (pk || dk) { ctx.translate(0, st.headDy); ctx.scale(st.headK, st.headK); }   // leaning in: the neck foreshortened, the head nearer
    P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      P_ell(ctx, 0, 0.285, 0.085, 0.13, skin);
      P_ell(ctx, -0.036, 0.315, 0.014, 0.014, eye);   // blank and round: no pupils
      P_ell(ctx, 0.036, 0.315, 0.014, 0.014, eye);
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
    const g = c.gait, body = P.col([6, 6, 10]), skin = P.col([92, 84, 88]), eye = P.col([225, 218, 205]), k = this.kit(P), t = c.t;
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
      this.trouser(ctx, k, [hx, hipY], [kx, ky], [fx, fy], 0.075 + 0.025 * lift, t, s + 2);
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
      this.sleeve(ctx, k, [sx, sy], [ex, ey], [hx, hy], t, s + 5);
      const ang = lerp(Math.atan2(hy - ey, hx - ex) + s * 0.25, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, reach);
      this.claws(ctx, hx, hy, ang, lerp(0.14, 0.3, reach), lerp(0.08 + 0.09 * Math.abs(fwd), 0.22, reach), 0.018, body, P);   // pointing at you, the fingers are foreshortened too
    };
    for (const s of [-1, 1]) arm(s, false);
    const torso = [[-0.14, hipY - 0.06], [0.14, hipY - 0.06], [0.22, top], [-0.22, top]];   // the torso, bent at you: shorter, and still far too narrow
    P_poly(ctx, torso, body); this.coat(ctx, k, ...torso, t, true);
    for (const s of [-1, 1]) arm(s, true);
    // the head, low and thrust out ahead of the shoulders, nearer and so a little bigger; the mouth open
    ctx.translate(0, top - 0.24); ctx.scale(1.15, 1.15);
    P_line(ctx, 0, 0.08, 0, 0.2, 0.07, body);
    ctx.save(); ctx.translate(0, 0.08); this.neckTie(ctx, k); ctx.restore();
    P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      P_ell(ctx, 0, 0.285, 0.085, 0.13, skin);
      for (const x of [-0.036, 0.036]) P_ell(ctx, x, 0.318, 0.0155, 0.0155, eye);   // blank eyes, round: no pupils
      P_ell(ctx, 0, 0.205, 0.034, 0.042 + 0.012 * reach, body);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
  // flat out, seen from the side: leaning far forward, the long legs reaching and kicking up behind, the arms pumping,
  // the head pushed out ahead. c.runDir is +1 running to the right of the view, -1 to the left; c.runGait its stride.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, body = P.col([6, 6, 10]), eye = P.col([225, 218, 205]), k = this.kit(P), t = c.t;
    const lean = 0.42, thigh = 0.62, shin = 0.64, upper = 0.56, fore = 0.52;
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const legs = [0, Math.PI].map(o => {
      const ph = g + o, a = Math.sin(ph) * 0.75, bend = 0.25 + 1.4 * Math.max(0, Math.cos(ph));   // the knee folds as the leg swings through
      const kx = Math.sin(a) * thigh, ky = -Math.cos(a) * thigh;
      return { ph, kx, ky, fx: kx + Math.sin(a - bend) * shin, fy: ky - Math.cos(a - bend) * shin };
    });
    const hipY = 0.03 - Math.min(legs[0].fy, legs[1].fy), hipX = 0;   // whichever foot is lowest is on the ground
    const sx = hipX + Math.sin(lean) * 0.82, sy = hipY + Math.cos(lean) * 0.82;
    const limb = (l, n) => {
      const leg = [[hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy]];
      P_limb(ctx, leg, 0.075, body);
      P_line(ctx, hipX + l.fx - 0.02, hipY + l.fy, hipX + l.fx + 0.11, hipY + l.fy - 0.01, 0.065, body);   // the foot, toes forward
      this.trouser(ctx, k, ...leg, 0.075, t, n + 2);
      // the arm on the other side swings against this leg
      const aa = -Math.sin(l.ph) * 1.0, ex = sx + Math.sin(aa) * upper, ey = sy - Math.cos(aa) * upper, fa = aa + 1.0;
      const hx = ex + Math.sin(fa) * fore, hy = ey - Math.cos(fa) * fore;
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
      this.sleeve(ctx, k, [sx, sy], [ex, ey], [hx, hy], t, n + 5);
      this.claws(ctx, hx, hy, Math.atan2(hy - ey, hx - ex), 0.14, 0.17, 0.018, body, P);
    };
    limb(legs[1], 1);   // the far side first
    const torso = [[hipX - 0.12, hipY - 0.05], [hipX + 0.1, hipY - 0.05], [sx + 0.13, sy], [sx - 0.15, sy - 0.02]];   // the torso, side on: still far too narrow
    P_poly(ctx, torso, body); this.coat(ctx, k, ...torso, t, false);
    limb(legs[0], -1);
    // the neck and the head, thrust forward of the shoulders
    const nx = sx + Math.sin(lean + 0.5) * 0.16, ny = sy + Math.cos(lean + 0.5) * 0.16;
    P_line(ctx, sx, sy, nx, ny, 0.07, body);
    this.tie(ctx, k, lerp(sx, nx, 0.55), lerp(sy, ny, 0.55), Math.atan2(ny - sy, nx - sx), 0.04);   // the twine tying its head on
    const hx = nx + Math.sin(lean + 0.3) * 0.17, hy = ny + Math.cos(lean + 0.3) * 0.17;
    P_ell(ctx, hx, hy, 0.12, 0.16, body, -lean * 0.6);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) { ctx.globalAlpha = faceA; P_ell(ctx, hx + 0.07, hy + 0.03, 0.015, 0.015, eye); ctx.globalAlpha = 1; }
    ctx.restore();
  },
};
