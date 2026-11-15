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
  // Starved: a black figure with its skin pulled tight over the bones. Its outline is the walker's own (the same height,
  // reach, shoulders and hips, and every pose), but the limbs are thin, narrowing to the joints and swelling at the knobs of
  // the knees and the elbows, the wrists and the ankles thinner still; the shoulders are points of bone, the torso narrow
  // and sunk in under a ribcage that flares out over a hollow belly, the neck a stalk of tendons, the fingers long bones
  // knotted at the knuckles. Close to, the bone under the skin catches the light: subtle greys on the black (GREY), the
  // collarbones, the breastbone, each rib and the arch of the ribcage over the belly, the hip bones, the kneecaps and the
  // points of the elbows, the shins, the knuckles. Far off none of that shows (boneA), and it is a black figure.
  GREY: { ridge: [27, 26, 31], hollow: [54, 49, 53], lite: [118, 111, 115] },
  // how much of the bone shows at d metres: none far off, all of it from 6 m
  boneA(d) { return clamp((18 - d) / 12, 0, 1); },
  // widths of its limbs (metres): the root (hip or shoulder), above the joint, the joint's knob (a radius), below the
  // joint, the wrist or ankle, and its own small knob (a radius)
  LEG: [0.066, 0.046, 0.034, 0.05, 0.028, 0.019],
  ARM: [0.05, 0.034, 0.027, 0.036, 0.021, 0.015],
  // a tapered stroke from p (w0 wide) to q (w1 wide), rounded at both ends
  seg(ctx, p, q, w0, w1, color) {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
    P_poly(ctx, [[p[0] + nx * w0 / 2, p[1] + ny * w0 / 2], [q[0] + nx * w1 / 2, q[1] + ny * w1 / 2], [q[0] - nx * w1 / 2, q[1] - ny * w1 / 2], [p[0] - nx * w0 / 2, p[1] - ny * w0 / 2]], color);
    P_ell(ctx, p[0], p[1], w0 / 2, w0 / 2, color); P_ell(ctx, q[0], q[1], w1 / 2, w1 / 2, color);
  },
  // with alpha a (times whatever it is drawn at) for the bone that shows through
  faint(ctx, a, fn) { if (a <= 0) return; const a0 = ctx.globalAlpha; ctx.globalAlpha = a0 * a; fn(); ctx.globalAlpha = a0; },
  // a starved limb from its root (a hip or a shoulder) to a joint (the knee or the elbow) to its end (the ankle or the
  // wrist), W its widths (LEG or ARM, times k): the bone narrowing to a knob of a joint and on to a thin wrist or ankle,
  // the joint's cap and the bone of the shin or the forearm catching the light close to
  limb(ctx, a, j, e, W, body, ridge, ba, k) {
    const s = k || 1;
    this.seg(ctx, a, j, W[0] * s, W[1] * s, body);
    this.seg(ctx, j, e, W[3] * s, W[4] * s, body);
    const ang = Math.atan2(e[1] - a[1], e[0] - a[0]) + Math.PI / 2;   // the knob of the joint, longer than it is wide
    P_ell(ctx, j[0], j[1], W[2] * s * 0.86, W[2] * s, body, ang);
    P_ell(ctx, e[0], e[1], W[5] * s, W[5] * s, body);
    this.faint(ctx, ba, () => {
      P_ell(ctx, j[0], j[1] + W[2] * s * 0.25, W[2] * s * 0.42, W[2] * s * 0.32, ridge);   // the kneecap, the point of the elbow
      this.faint(ctx, 0.7, () => P_line(ctx, lerp(j[0], e[0], 0.25), lerp(j[1], e[1], 0.25), lerp(j[0], e[0], 0.8), lerp(j[1], e[1], 0.8), 0.006, ridge));   // the shin, the forearm
    });
  },
  // a point of bone at a shoulder
  shoulder(ctx, x, y, body, ridge, ba) {
    P_ell(ctx, x, y, 0.032, 0.028, body);
    this.faint(ctx, ba, () => P_ell(ctx, x, y + 0.01, 0.012, 0.009, ridge));
  },
  // the torso over the quad bl, br, tr, tl (bottom left and right, top right and left), drawn in its own black: narrow,
  // the ribcage flaring out over a belly sunk in under it, the hips jutting below that; and close to, the bone under the
  // skin. front: seen from the front (collarbones, breastbone, ribs either side, the arch of the ribcage, the hip bones);
  // otherwise side on, facing the br/tr side (the ribs curving round and down to the front, the knobs of its spine
  // along its back, the belly sunk in under the ribs)
  chest(ctx, body, ridge, ba, bl, br, tr, tl, front) {
    const at = (u, v) => { const q = (u + 1) / 2; return [lerp(lerp(bl[0], br[0], q), lerp(tl[0], tr[0], q), v), lerp(lerp(bl[1], br[1], q), lerp(tl[1], tr[1], q), v)]; };
    const line = (pts, w) => P_limb(ctx, pts.map(p => at(p[0], p[1])), w, ridge);
    if (front) {
      P_poly(ctx, [[-0.66, 0], [0.66, 0], [0.9, 0.1], [0.64, 0.27], [0.8, 0.4], [1, 0.54], [1, 1], [-1, 1], [-1, 0.54], [-0.8, 0.4], [-0.64, 0.27], [-0.9, 0.1]].map(p => at(p[0], p[1])), body);
      this.faint(ctx, ba, () => {
        for (const s of [-1, 1]) {
          line([[s * 0.08, 0.93], [s * 0.45, 0.905], [s * 0.86, 0.955]], 0.012);   // the collarbone
          for (let i = 0; i < 4; i++) {   // the ribs either side, longer and dropping further down the cage
            const v = 0.8 - i * 0.075, r = 0.72 + i * 0.06;
            line([[s * 0.3, v], [s * r * 0.75, v - 0.025], [s * r, v - 0.075 - i * 0.012]], 0.009);
          }
          line([[s * 0.08, 0.6], [s * 0.45, 0.535], [s * 0.82, 0.44]], 0.01);   // the arch of the ribcage, over the hollow belly
          line([[s * 0.66, 0.16], [s * 0.86, 0.09]], 0.012);  // the hip bone
          this.faint(ctx, 0.6, () => line([[s * 0.72, 0.42], [s * 0.54, 0.3], [s * 0.6, 0.18]], 0.008));   // the belly, sunk in under the ribs
        }
        line([[0, 0.88], [0, 0.64]], 0.01);   // the breastbone
      });
    } else {
      P_poly(ctx, [[-1, 0], [0.9, 0], [0.62, 0.16], [0.5, 0.3], [0.78, 0.46], [1, 0.62], [1, 1], [-1, 1]].map(p => at(p[0], p[1])), body);
      for (let i = 0; i < 6; i++) { const p = at(-1, 0.3 + i * 0.12); P_ell(ctx, p[0], p[1], 0.022, 0.022, body); }   // the knobs of its spine
      this.faint(ctx, ba, () => {
        for (let i = 0; i < 4; i++) { const v = 0.86 - i * 0.08; line([[-0.6, v], [0, v - 0.03], [0.66, v - 0.1 - i * 0.02]], 0.009); }
        line([[0.95, 0.58], [0.6, 0.47], [0.4, 0.4]], 0.012);   // the bottom of the ribcage
        line([[-0.2, 0.14], [0.3, 0.12], [0.62, 0.05]], 0.013);  // the hip bone
        line([[0.4, 0.97], [0.95, 0.95]], 0.014);   // the collarbone
      });
    }
  },
  // its neck, from (0, y0) up to (0, y1): a thin stalk, its tendons standing out
  neck(ctx, y0, y1, body, ridge, ba) {
    P_line(ctx, 0, y0, 0, y1, 0.056, body);
    this.faint(ctx, ba, () => { for (const s of [-1, 1]) P_line(ctx, s * 0.021, y1 + 0.01, s * 0.007, y0, 0.007, ridge); });
  },
  // its face, the pale grey of it on its black head, gaunt: the temples and the cheeks sunk in under the cheekbones,
  // the jaw showing, the eyes in sunken sockets; the eyes round and blank, pale, no pupils (eye height ey, radius er);
  // the mouth (mrx by mry) opening as it nears
  face(ctx, P, skin, eye, body, ey, er, mrx, mry) {
    const G = this.GREY, hol = P.col(G.hollow), lite = P.col(G.lite);
    P_ell(ctx, 0, 0.285, 0.085, 0.13, skin);
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0.285, 0.085, 0.13, 0, 0, TAU); ctx.clip();
    for (const s of [-1, 1]) {
      P_ell(ctx, s * 0.084, 0.33, 0.02, 0.045, hol);                  // the temple, sunk in
      P_ell(ctx, s * 0.058, 0.218, 0.024, 0.05, hol, s * 0.22);       // the cheek, sunk in under the cheekbone
      P_ell(ctx, s * 0.036, ey, er * 1.9, er * 1.9, hol);             // the socket
      P_line(ctx, s * 0.08, 0.2, s * 0.03, 0.163, 0.007, lite);        // the jaw
    }
    ctx.restore();
    for (const s of [-1, 1]) P_ell(ctx, s * 0.036, ey, er, er, eye);   // blank and round: no pupils
    P_ell(ctx, 0, 0.205, mrx, mry, body);
  },
  // its long fingers (as fingers() spreads them), bones knotted at the knuckles, the last of each one a black nail:
  // blacker than the rest of it, which the light and the fog lift toward grey, so the hooked ends of them read as nails
  // in every pose
  claws(ctx, x, y, angle, spread, len, w, body, P, ba) {
    const nail = P.col([0, 0, 0]), ridge = P.col(this.GREY.ridge);
    for (let i = 0; i < 4; i++) {
      const a = angle + (i - 1.5) * spread, l = len * ((i === 0 || i === 3) ? 0.82 : 1), ca = Math.cos(a), sa = Math.sin(a);
      P_line(ctx, x, y, x + ca * l, y + sa * l, w * 0.8, body);
      for (const [f, r] of [[0.3, 0.72], [0.56, 0.6]]) P_ell(ctx, x + ca * l * f, y + sa * l * f, w * r, w * r, body);   // the knuckles
      P_line(ctx, x + ca * l * 0.7, y + sa * l * 0.7, x + ca * l * 1.06, y + sa * l * 1.06, w * 1.05, nail);
      this.faint(ctx, ba, () => { for (const f of [0.3, 0.56]) P_ell(ctx, x + ca * l * f, y + sa * l * f, w * 0.3, w * 0.3, ridge); });
    }
  },
  // its fingers hooked over the top of a board (the board's top edge at oy + 0.1), drawn over it: long bones knotted at
  // the knuckle where they bend over the edge and again halfway down, the nails black, leaning in toward its face (side
  // is +1 for the hand on the right of the view), the hand at ox
  grip(ctx, P, side, ox, oy) {
    const body = P.col([6, 6, 10]), nail = P.col([0, 0, 0]), ridge = P.col(this.GREY.ridge);
    for (let i = 0; i < 4; i++) {
      const x = ox + side * (i - 1.5) * 0.026, len = [0.07, 0.085, 0.078, 0.056][i], lean = -side * 0.01;
      const kn = [x + lean * 0.4, oy + 0.107], mid = [x + lean * 0.75, oy + 0.1 - len * 0.5], tip = [x + lean, oy + 0.1 - len];
      P_limb(ctx, [[x, oy + 0.13], kn, mid, tip], 0.014, body);
      P_ell(ctx, kn[0], kn[1], 0.0125, 0.012, body);   // the knuckle, over the edge
      P_ell(ctx, mid[0], mid[1], 0.0095, 0.0095, body);
      P_ell(ctx, kn[0], kn[1] + 0.002, 0.0045, 0.004, ridge); P_ell(ctx, mid[0], mid[1], 0.0035, 0.0035, ridge);
      P_ell(ctx, tip[0], tip[1] + 0.008, 0.006, 0.008, nail);
    }
  },
  draw(ctx, c, P) {
    if (c.runPose || c.charge) { c.duck = 0; (c.runPose ? this.drawRun : this.drawCharge).call(this, ctx, c, P); return; }   // upright again after either
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const body = P.col([6, 6, 10]);
    const skin = P.col([92, 84, 88]);
    const eye = P.col([225, 218, 205]);
    const ridge = P.col(this.GREY.ridge), ba = this.boneA(c.dist);
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
      this.limb(ctx, [hx, hipY], [kx, hipY * 0.5 + lift * 0.75], [fx, lift + 0.03], this.LEG, body, ridge, ba);
      P_line(ctx, fx - 0.03, lift + 0.03, fx + s * 0.09, lift + 0.03, 0.045, body);   // the foot, bone and tendon
    }
    // torso: far too narrow, sunk in under the ribs; bent at you under a lintel, its back rounds up behind its head between the shoulders
    if (dk > 0.02) P_ell(ctx, sway * 0.6, top - 0.02, sw + 0.02, this.DUCK.back * dk + 0.02, body);
    this.chest(ctx, body, ridge, ba, [-0.15 + sway, hipY - 0.06], [0.15 + sway, hipY - 0.06], [sw + sway * 0.6, top], [-sw + sway * 0.6, top], true);
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
      this.limb(ctx, [sx, sy], [ex, ey], [hx, hy], this.ARM, body, ridge, ba);
      this.shoulder(ctx, sx, sy, body, ridge, ba);
      const ang = lerp(lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), lerp(s > 0 ? -Math.PI * 0.56 : -Math.PI * 0.44, s > 0 ? Math.PI * 0.42 : Math.PI * 0.58, lift), pk);
      this.claws(ctx, hx, hy, ang, lerp(lerp(0.16, 0.3, raise), lerp(0.1, 0.3, lift), pk), 0.17 + raise * 0.05, 0.018, body, P, ba);
    }
    // neck and head with a snapping tilt (ducking, the head is thrust out at you, low between the shoulders)
    const tilt = headTiltJerk(t, 2.7, 0.33) * (1 - (c.lunge || 0)) * (1 - 0.6 * dk);
    ctx.save();
    ctx.translate(sway * 0.6, top);
    ctx.rotate(tilt);
    this.neck(ctx, 0, 0.12, body, ridge, ba);
    if (pk || dk) { ctx.translate(0, st.headDy); ctx.scale(st.headK, st.headK); }   // leaning in: the neck foreshortened, the head nearer
    P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      this.face(ctx, P, skin, eye, body, 0.315, 0.014, 0.028 + near * 0.012, 0.012 + near * 0.03 + (c.lunge || 0) * 0.045);
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
    const ridge = P.col(this.GREY.ridge), ba = this.boneA(c.dist);
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
      this.limb(ctx, [hx, hipY], [kx, ky], [fx, fy], this.LEG, body, ridge, ba, 1 + lift / 3);
      if (fy < 0.2) P_line(ctx, fx - 0.04, fy, fx + 0.04, fy, 0.045, body);   // the foot, toes at you
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
      this.limb(ctx, [sx, sy], [ex, ey], [hx, hy], this.ARM, body, ridge, ba);
      this.shoulder(ctx, sx, sy, body, ridge, ba);
      const ang = lerp(Math.atan2(hy - ey, hx - ex) + s * 0.25, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, reach);
      this.claws(ctx, hx, hy, ang, lerp(0.14, 0.3, reach), lerp(0.08 + 0.09 * Math.abs(fwd), 0.22, reach), 0.018, body, P, ba);   // pointing at you, the fingers are foreshortened too
    };
    for (const s of [-1, 1]) arm(s, false);
    this.chest(ctx, body, ridge, ba, [-0.14, hipY - 0.06], [0.14, hipY - 0.06], [0.22, top], [-0.22, top], true);   // the torso, bent at you: shorter, and still far too narrow
    for (const s of [-1, 1]) arm(s, true);
    // the head, low and thrust out ahead of the shoulders, nearer and so a little bigger; the mouth open
    ctx.translate(0, top - 0.24); ctx.scale(1.15, 1.15);
    this.neck(ctx, 0.08, 0.2, body, ridge, ba);
    P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {
      ctx.globalAlpha = faceA;
      this.face(ctx, P, skin, eye, body, 0.318, 0.0155, 0.034, 0.042 + 0.012 * reach);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
  // flat out, seen from the side: leaning far forward, the long legs reaching and kicking up behind, the arms pumping,
  // the head pushed out ahead. c.runDir is +1 running to the right of the view, -1 to the left; c.runGait its stride.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, body = P.col([6, 6, 10]), eye = P.col([225, 218, 205]), ridge = P.col(this.GREY.ridge), ba = this.boneA(c.dist);
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
      this.limb(ctx, [hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy], this.LEG, body, ridge, ba);
      P_line(ctx, hipX + l.fx - 0.02, hipY + l.fy, hipX + l.fx + 0.11, hipY + l.fy - 0.01, 0.045, body);   // the foot, toes forward
      // the arm on the other side swings against this leg
      const aa = -Math.sin(l.ph) * 1.0, ex = sx + Math.sin(aa) * upper, ey = sy - Math.cos(aa) * upper, fa = aa + 1.0;
      const hx = ex + Math.sin(fa) * fore, hy = ey - Math.cos(fa) * fore;
      this.limb(ctx, [sx, sy], [ex, ey], [hx, hy], this.ARM, body, ridge, ba);
      this.shoulder(ctx, sx, sy, body, ridge, ba);
      this.claws(ctx, hx, hy, Math.atan2(hy - ey, hx - ex), 0.14, 0.17, 0.018, body, P, ba);
    };
    limb(legs[1]);   // the far side first
    this.chest(ctx, body, ridge, ba, [hipX - 0.12, hipY - 0.05], [hipX + 0.1, hipY - 0.05], [sx + 0.13, sy], [sx - 0.15, sy - 0.02], false);   // the torso, side on: still far too narrow
    limb(legs[0]);
    // the neck and the head, thrust forward of the shoulders
    const nx = sx + Math.sin(lean + 0.5) * 0.16, ny = sy + Math.cos(lean + 0.5) * 0.16;
    P_line(ctx, sx, sy, nx, ny, 0.056, body);
    this.faint(ctx, ba, () => P_line(ctx, lerp(sx, nx, 0.1) + 0.012, lerp(sy, ny, 0.1), lerp(sx, nx, 0.9) + 0.006, lerp(sy, ny, 0.9), 0.007, ridge));   // a tendon
    const hx = nx + Math.sin(lean + 0.3) * 0.17, hy = ny + Math.cos(lean + 0.3) * 0.17;
    P_ell(ctx, hx, hy, 0.12, 0.16, body, -lean * 0.6);
    const faceA = clamp((26 - c.dist) / 22, 0, 1);
    if (faceA > 0) {   // side on: the eye in its socket and the line of the jaw
      const hol = P.col(this.GREY.hollow);
      ctx.globalAlpha = faceA;
      P_ell(ctx, hx + 0.07, hy + 0.03, 0.027, 0.027, hol);
      P_ell(ctx, hx + 0.07, hy + 0.03, 0.015, 0.015, eye);
      ctx.globalAlpha = faceA * ba;
      P_line(ctx, hx - 0.02, hy - 0.05, hx + 0.08, hy - 0.11, 0.008, ridge);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};
