'use strict';
// The customer: man-shaped, dressed like someone, and wrong in every measure of it. Too tall and too thin, the suit too
// short for it, the arms hanging to its knees with long pale fingers, the neck too long and the head laid over on it much
// too far, the hat still square on the tilted head. Its skin is like wet wax under the neon: smooth, shining, sagging,
// running at the jaw. Where its eyes should be are two pits, and deep in each a pinprick that catches the diner's light;
// under them a smile too wide for the face, that opens as it comes, and at the glass it mouths at you. Its walk has a
// hitch in it, a stall and a lurch every stride, one foot dragging, and every so often the whole of it jerks, the head
// snapping over. Near the glass its hands come up, palms out, as if to press them flat on it.
// It is drawn to light, and it does not care whether you look at it. While the place it is coming for is lit it comes
// fast; in the dark it walks at an ordinary pace. The night sets c.drawn (whether its light is on) and c.drawnMult (how
// much faster the light makes it) every frame.
// A night can send it sideways, running (The Diner, from a shut window to one still open): c.runPose on, c.runTurn 0..1
// as it turns side on and back (it pivots on the spot, stiffly, like a figure on a turntable), c.runDir +1 running to
// the right of the view and -1 to the left, c.runGait its stride and c.runAmt 0..1 how hard it is running. Its body runs
// side on; its head stays turned to you.
CREATURES.customer = {
  name: 'the customer', h: 2.25, w: 1.2, faceY: 2.0, stepRate: 0.75, catchDist: 1.5, sound: 'shoes', ignoresGaze: true,
  death: { delay: 0.35, dur: 0.55, sting: 'stingGlass' },
  init(c) { c.drawn = false; c.drawnMult = 1; c.away = false; },
  speedMult(c) {
    if (c.dead) return 0;
    return c.drawn ? c.drawnMult : 1;
  },
  // a jerk: now and then (not every period, by a hash of which one it is) a sharp shudder at the start of a period
  twitch(t, period, seed) {
    const k = Math.floor(t / period), f = t - k * period, r = Math.abs(Math.sin((k + seed) * 127.1) * 43758.5) % 1;
    return r > 0.45 ? Math.exp(-f * 11) * Math.sin(f * 46) * (r > 0.8 ? 1 : 0.55) : 0;
  },
  pal(P, c) {
    const glint = c.drawn ? [255, 250, 236] : [150, 148, 136];   // the pinpricks: the diner's light in them, or what is left of it
    const hole = mixc([2, 0, 1], P.fogColor || [0, 0, 0], P.fog || 0);   // where the light does not get in
    return {
      suit: P.col([14, 12, 16]), suitL: P.col([32, 30, 36]), suitD: P.col([7, 6, 9]), shirt: P.col([200, 196, 184]),
      skin: P.col([222, 214, 190]), skinD: P.col([168, 156, 134]), skinS: P.cola([150, 136, 116], 0.55), black: P.col([6, 4, 6]), hole: rgba(hole),
      sheen: P.cola([255, 252, 240], 0.4), pit: rgba(hole, 1), pit0: P.cola([120, 104, 88], 0), drip: P.cola([70, 52, 44], 0.7), teeth: P.col([214, 204, 172]),
      glint: P.raw(glint), glintA: rgba(glint, 0.25),
    };
  },
  draw(ctx, c, P) {
    // turning to run, or back: squeezed edge on at the half-way point, the front before it and the side after
    const turn = c.runPose ? (c.runTurn === undefined ? 1 : c.runTurn) : 0;
    if (turn <= 0) { this.drawFront(ctx, c, P); return; }
    ctx.save(); ctx.scale(Math.max(0.08, Math.abs(Math.cos(turn * Math.PI))), 1);
    if (turn >= 0.5) this.drawRun(ctx, c, P); else this.drawFront(ctx, c, P);
    ctx.restore();
  },
  // a hand: a narrow palm at (x, y) and four long jointed fingers from it pointing along ang, spread apart by spread, each
  // len long, all hooked one way (side s) at the middle joint by curl; the thumb off the other side of the palm
  hand(ctx, K, x, y, ang, spread, len, curl, s) {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    P_ell(ctx, x, y, 0.026, 0.04, K.skin, ang - Math.PI / 2);
    ctx.strokeStyle = K.skin; ctx.lineWidth = 0.013; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5, a = ang + o * spread, l = len * (o * o > 1 ? 0.8 : 1), b = a - o * curl * 0.12 - curl * s;
      const bx = x + ca * 0.032 - sa * o * 0.012, by = y + sa * 0.032 + ca * o * 0.012;
      const mx = bx + Math.cos(a) * l * 0.55, my = by + Math.sin(a) * l * 0.55;
      ctx.moveTo(bx, by); ctx.lineTo(mx, my); ctx.lineTo(mx + Math.cos(b) * l * 0.45, my + Math.sin(b) * l * 0.45);
    }
    const ta = ang - s * 0.8;   // the thumb
    ctx.moveTo(x - sa * s * 0.016, y + ca * s * 0.016); ctx.lineTo(x + Math.cos(ta) * len * 0.38, y + Math.sin(ta) * len * 0.38);
    ctx.stroke();
  },
  // the head, face on, in its own frame: its middle at (0, 0), 0.1 across and 0.15 up from there; the hat on top of it.
  // near 0..1 how near it is, open how far its mouth is open (mouthing), lunge 0..1 coming at you
  drawHead(ctx, c, P, K, near, open, lunge, back) {
    const gape = smoothstep(lunge * 1.4);
    if (back) {
      P_ell(ctx, 0, 0, 0.1, 0.15, K.skin); P_ell(ctx, 0, -0.07, 0.07, 0.06, K.skinS);
    } else {
      // the jaw, sagging further as the mouth opens, and dropping away entirely as it comes at you
      const jaw = open * 0.03 + gape * 0.15;
      P_ell(ctx, 0, -0.05 - jaw * 0.5, 0.086 - gape * 0.012, 0.1 + jaw * 0.5, K.skin);
      P_ell(ctx, 0, 0, 0.1, 0.15, K.skin);
      // the wax: sunk under the cheekbones, a wet shine down one side, a run of it hanging off the jaw
      for (const s of [-1, 1]) P_ell(ctx, s * 0.062, -0.045 - jaw * 0.3, 0.026, 0.05 + jaw * 0.2, K.skinS);
      P_ell(ctx, -0.05, 0.06, 0.014, 0.05, K.sheen, -0.25);
      P_limb(ctx, [[0.064, -0.11 - jaw], [0.068, -0.15 - jaw], [0.066, -0.17 - jaw]], 0.012, K.skin);
      // the eyes: deep pits, darkest in the middle, and running down from each a dark streak where the wax has slid; far
      // down in each a pinprick of light
      const er = 0.026 + near * 0.004 + gape * 0.006, ey = 0.028;
      for (const s of [-1, 1]) {
        const ex = s * 0.042;
        P_limb(ctx, [[ex, ey - 0.01], [ex + s * 0.003, -0.03], [ex + s * 0.001, -0.065 - near * 0.02]], 0.007, K.drip);
        const sg = ctx.createRadialGradient(ex, ey, er * 0.35, ex, ey, er * 1.7);
        sg.addColorStop(0, K.pit); sg.addColorStop(0.5, K.pit); sg.addColorStop(1, K.pit0);
        ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(ex, ey, er * 1.7, er * 1.9, 0, 0, TAU); ctx.fill();
      }
      const pr = clamp(0.0016 * c.dist, 0.0035, 0.012) * (1 + gape * 0.3);   // big enough to show from out in the lot
      for (const s of [-1, 1]) { if (c.dist > 4) P_ell(ctx, s * 0.042, ey, pr * 1.8, pr * 1.8, K.glintA); P_ell(ctx, s * 0.042, ey, pr, pr, K.glint); }
      // the smile, too wide for the face: its corners right out at the cheeks and drawn up into them. It opens as it comes
      // (mouthing at you at the glass) onto nothing but dark and a row of small uneven teeth; coming at you, it opens far
      // further than a mouth goes, the teeth top and bottom
      const mw = 0.09, my = -0.064, cy = my + 0.026, lo = my - 0.008 - open * 0.06 - gape * 0.25;
      const shape = () => { ctx.beginPath(); ctx.moveTo(-mw, cy); ctx.quadraticCurveTo(0, my - 0.03, mw, cy); ctx.quadraticCurveTo(0, lo - 0.024, -mw, cy); ctx.closePath(); };
      ctx.fillStyle = K.hole; shape(); ctx.fill();
      if (open + gape > 0.08) {
        ctx.save(); shape(); ctx.clip();
        ctx.fillStyle = K.teeth; ctx.beginPath();
        for (let i = -7; i <= 7; i++) {   // along the top lip, pointed, every one a different length
          const x = i * mw / 8, y = cy - 0.03 * (1 - (i / 8) * (i / 8)) + 0.006, l = (0.012 + 0.008 * Math.abs(Math.sin(i * 2.7))) * (1 + gape);
          ctx.moveTo(x - 0.0055, y + 0.004); ctx.lineTo(x + 0.0055, y + 0.004); ctx.lineTo(x + 0.001, y - l);
        }
        if (gape > 0.2) for (let i = -5; i <= 5; i++) {   // and the bottom, far down in the dark
          const x = i * mw / 7, y = lo + 0.02 * (1 - (i / 6) * (i / 6)) - 0.012, l = (0.012 + 0.008 * Math.abs(Math.sin(i * 1.9))) * gape * 1.6;
          ctx.moveTo(x - 0.0055, y - 0.004); ctx.lineTo(x + 0.0055, y - 0.004); ctx.lineTo(x - 0.001, y + l);
        }
        ctx.fill();
        ctx.restore();
      }
      for (const s of [-1, 1]) P_limb(ctx, [[s * mw, cy], [s * (mw + 0.006), cy + 0.016], [s * (mw - 0.002), cy + 0.034]], 0.005, K.skinD);   // the creases the corners are drawn up into
    }
    // the hat, square on the tilted head
    P_ell(ctx, 0, 0.13, 0.17, 0.028, K.suit);
    P_rect(ctx, -0.094, 0.13, 0.188, 0.1, K.suit);
    P_rect(ctx, -0.094, 0.133, 0.188, 0.02, K.suitL);
  },
  drawFront(ctx, c, P) {
    const t = c.t, near = clamp(1 - c.dist / 8, 0, 1), lunge = c.lunge || 0, K = this.pal(P, c);
    const back = !!c.away && !lunge;
    // the walk: a stall and a lurch in every stride (the phase drags, then catches up), the right foot barely lifting
    const g = c.gait - 0.55 * Math.sin(c.gait);
    const mv = c.moving ? 1 : 0, lift = 0.07 * mv;
    const jerk = this.twitch(t, 1.7, 3) * (1 - lunge), jerk2 = this.twitch(t + 0.4, 2.3, 11) * (1 - lunge);
    const bx = Math.sin(g) * 0.03 * mv + jerk * 0.025;   // the body lurching over onto each foot
    const press = lunge ? 0 : smoothstep((7.4 - c.dist) / 1.8);   // at the glass, the hands up and flat against it
    const reach = Math.max(press, smoothstep(lunge * 1.6));
    const mouthK = back ? 0 : smoothstep((10 - c.dist) / 4);
    const open = mouthK * clamp(0.12 + 0.6 * Math.max(0, Math.sin(t * 4.3)) * (0.55 + 0.45 * Math.sin(t * 1.37)), 0, 1);
    const hipY = 1.1, top = 1.74;
    // legs: too long, thin, the knees turned in; small stiff steps
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), l = Math.max(0, Math.sin(ph)) * lift * (s > 0 ? 0.35 : 1);
      P_limb(ctx, [[s * 0.085 + bx * 0.5, hipY], [s * 0.06 + bx * 0.25, 0.56 + l * 0.5], [s * 0.115, l + 0.03]], 0.085, K.suit);
      P_ell(ctx, s * 0.125 - (s > 0 ? 0.015 : 0), l + 0.03, 0.08, 0.03, K.black, s > 0 ? 0.25 : 0);   // the dragging foot turned in
    }
    ctx.save(); ctx.translate(bx, 0); ctx.rotate(jerk * 0.04 + Math.sin(g) * 0.012 * mv);
    // the coat, buttoned, narrow; a collar and tie at the front
    P_poly(ctx, [[-0.2, 0.98], [0.2, 0.98], [0.255, top - 0.04], [0.15, top + 0.02], [-0.15, top + 0.02], [-0.255, top - 0.06]], K.suit);
    if (!back) { P_poly(ctx, [[-0.06, top - 0.32], [0.06, top - 0.32], [0.1, top + 0.01], [-0.1, top + 0.01]], K.shirt); P_poly(ctx, [[-0.018, top - 0.38], [0.018, top - 0.38], [0.03, top - 0.03], [-0.03, top - 0.03]], K.suitL); }
    else P_line(ctx, 0, 1.0, 0, top - 0.04, 0.012, K.suitL);
    // arms: hanging to its knees, the sleeves too short, the wrists bare; near the glass they come up, the elbows out and
    // the palms flat toward you either side of its face, the long fingers spread; coming at you, they reach for your face
    for (const s of [-1, 1]) {
      const sh = [s * 0.235, top - 0.05 + (s > 0 ? jerk2 * 0.03 : 0)];
      const sw = Math.sin(g + (s > 0 ? 0 : Math.PI)) * 0.03 * mv;
      const hang = { e: [s * 0.27 + sw * 0.5, 1.25], h: [s * 0.25 + sw, 0.72] };
      const slide = lunge ? 0 : ((t * 0.09 + (s > 0 ? 0.5 : 0)) % 1) * 0.12 + (s > 0 ? 0.08 : 0);   // dragging down the glass
      const up = { e: [s * lerp(0.48, 0.5, lunge), lerp(1.62 - slide, 1.72, lunge)], h: [s * lerp(0.38 + slide * 0.3, 0.36, lunge), lerp(2.02 - slide, 1.96, lunge)] };
      const r = reach, ex = lerp(hang.e[0], up.e[0], r), ey = lerp(hang.e[1], up.e[1], r), hx = lerp(hang.h[0], up.h[0], r), hy = lerp(hang.h[1], up.h[1], r);
      const cx = lerp(ex, hx, 0.62), cy = lerp(ey, hy, 0.62);   // the cuff, short of the wrist
      P_limb(ctx, [sh, [ex, ey], [cx, cy]], 0.075, K.suit);
      P_line(ctx, cx, cy, hx, hy, 0.04, K.skin);   // the bare wrist
      // hanging, the fingers hooked a little; at the glass up and spread flat; coming at you, curled in at your face
      const ang = Math.atan2(hy - ey, hx - ex), fa = lunge ? lerp(Math.PI / 2 - s * 0.2, Math.PI / 2 + s * 0.95, smoothstep(lunge * 1.6)) : lerp(ang, Math.PI / 2 - s * 0.12, r);
      const tw = s > 0 ? Math.abs(jerk2) * 0.3 : 0;   // the fingers of one hand twitch
      this.hand(ctx, K, hx, hy, fa, lerp(0.07, 0.2, r) + tw - lunge * 0.06, lerp(0.17, 0.18, r) + lunge * 0.02, lerp(0.25, 0.05, press) + lunge * 0.25, -s);
    }
    // the neck, too long and bare, and the head laid over on it much too far, jerking further now and then
    const tilt = (back ? 0.36 : 0.6) * (1 - lunge * 0.4) + headTiltJerk(t, 2.9, 0.06) * (1 - lunge) + jerk * 0.3;
    ctx.translate(0, top - 0.02); ctx.rotate(tilt * 0.45);
    P_line(ctx, 0, 0, 0, 0.15, 0.06, K.skin);
    if (!back) P_line(ctx, 0.012, 0.02, 0.012, 0.13, 0.018, K.skinS);
    ctx.translate(0, 0.15); ctx.rotate(tilt * 0.55);
    ctx.translate(0, 0.11);
    { const k = 1 + lunge * 0.12 + press * 0.08; ctx.scale(k, k); }
    this.drawHead(ctx, c, P, K, near, open, lunge, back);
    ctx.restore();
  },
  // running, seen from the side, and too straight about it: the body bolt upright and dead level however hard it runs,
  // the arms straight as rods swinging from the shoulder with the long fingers trailing; only the legs work, long
  // scissoring strides under it, and the coat's tails fly out behind. Its head does not run with it: it is turned to you,
  // laid over on its neck, the pits and the smile on you the whole way. Drawn facing +x and mirrored by c.runDir; c.runAmt
  // 0 is standing side on, 1 flat out.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, k = c.runAmt === undefined ? 1 : c.runAmt, near = clamp(1 - c.dist / 8, 0, 1), K = this.pal(P, c);
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const hipY = lerp(1.12, 1.03, k), top = 1.74, S = 0.46 * k, lift = 0.4 * k, seg = 0.56;
    // a foot: on the ground and going back under it for half the stride, then up behind and through to the front. The
    // knee is wherever two equal bones from the hip put it, bending forward.
    const leg = o => {
      const u = (((g + o) / TAU) % 1 + 1) % 1, v = u < 0.5 ? 0 : (u - 0.5) * 2;
      let fx = u < 0.5 ? S * (1 - 4 * u) : -S + 2 * S * smoothstep(v), fy = 0.035 + (u < 0.5 ? 0 : lift * Math.sin(Math.PI * Math.pow(v, 0.7)));
      let dx = fx, dy = fy - hipY;
      const n = Math.hypot(dx, dy) || 1, d = Math.min(n, 2 * seg * 0.999);
      dx *= d / n; dy *= d / n; fx = dx; fy = hipY + dy;
      const h = Math.sqrt(seg * seg - d * d / 4);
      return { u, v, fx, fy, kx: dx / 2 - dy / d * h, ky: hipY + dy / 2 + dx / d * h };
    };
    const legs = [leg(0), leg(Math.PI)];
    const drawLeg = (l, col) => {
      P_limb(ctx, [[0, hipY], [l.kx, l.ky], [l.fx, l.fy]], 0.09, col);
      const rot = l.u < 0.5 ? 0 : 0.7 * Math.sin(Math.PI * l.v) * k;   // the heel comes up as the foot leaves the ground
      P_ell(ctx, l.fx + Math.cos(rot) * 0.05, l.fy + Math.sin(rot) * 0.05, 0.1, 0.034, K.black, rot);
    };
    // an arm: straight from the shoulder, too long, swinging against the leg on its own side, the fingers trailing
    const sh = [0.0, top - 0.06];
    const drawArm = (l, col) => {
      const a = -Math.cos(l.u * TAU) * 0.8 * k, L1 = 0.5, L2 = 0.2;
      const cx = sh[0] + Math.sin(a) * L1, cy = sh[1] - Math.cos(a) * L1, hx = cx + Math.sin(a) * L2, hy = cy - Math.cos(a) * L2;
      P_limb(ctx, [sh, [cx, cy]], 0.075, col);
      P_line(ctx, cx, cy, hx, hy, 0.04, K.skin);
      this.hand(ctx, K, hx, hy, a - Math.PI / 2, 0.05, 0.16, 0.3, 1);
    };
    drawArm(legs[1], K.suitD); drawLeg(legs[1], K.suitD);   // the far side first
    // the coat, side on: buttoned at the front, its tails flying out behind
    const flare = k * (0.08 + 0.025 * Math.sin(g * 2));
    P_poly(ctx, [[-0.11, top], [0.08, top - 0.02], [0.12, top - 0.3], [0.11, hipY - 0.06], [0.03, hipY - 0.1], [-0.1 - flare, hipY - 0.1 + flare * 0.9], [-0.12, hipY + 0.25]], K.suit);
    P_poly(ctx, [[0.045, top - 0.005], [0.095, top - 0.03], [0.12, top - 0.26], [0.105, top - 0.3], [0.075, top - 0.1]], K.shirt);   // the collar and the shirt front between the lapels
    P_line(ctx, 0.108, top - 0.06, 0.118, top - 0.28, 0.02, K.suitL);   // the tie
    P_line(ctx, 0.065, top - 0.03, 0.105, top - 0.36, 0.013, K.suitL);   // the lapel
    drawLeg(legs[0], K.suit); drawArm(legs[0], K.suit);
    P_line(ctx, sh[0] + 0.02, sh[1] + 0.02, sh[0] + 0.02, sh[1] - 0.04, 0.09, K.suit);   // the near shoulder, over the top of the arm
    // the long neck, and the head on it turned to you and laid over; the face is undone by the mirror so it is the same
    // face whichever way it runs
    const tilt = 0.55 + headTiltJerk(c.t, 2.9, 0.06) + this.twitch(c.t, 1.7, 3) * 0.3;
    ctx.translate(0.0, top - 0.02);
    P_line(ctx, 0, 0, 0.01, 0.15, 0.06, K.skin);
    ctx.translate(0.01, 0.15); ctx.scale(c.runDir || 1, 1); ctx.rotate(tilt * 0.7); ctx.translate(0, 0.11);
    const mouthK = smoothstep((10 - c.dist) / 4), open = mouthK * clamp(0.1 + 0.5 * Math.max(0, Math.sin(c.t * 4.3)), 0, 1);
    this.drawHead(ctx, c, P, K, near, open, 0, false);
    ctx.restore();
  },
};
