'use strict';
// The signalman: too tall, in a long coat and a peaked cap, walking in step down the middle of the street in the dark, with
// no light of his own: he is seen as he passes under the street lamps, and as a shape against the wet haze between them.
// The coat hangs wrong on him: the shoulders narrow and sloping, the hem wide and ragged and swinging a beat behind his
// stride, the rain running down it and dripping off the hem and the peak. His arms are far too long, the hands hanging
// below the hem, the long fingers loose and now and then twitching. Under the peak there is no face at all, only dark, and
// below it a long pale jaw and a grin; his eyes are shut until he is close, and then two points of light open in the dark
// under the peak. While nobody looks
// at him his head is turned aside; a moment after you look, it snaps round to you. Near the glass he straightens, his neck
// coming up out of the collar, and you see up under the peak. Coming at you, the jaw drops open far too wide.
// He keeps the same pace whether you watch him or not. While c.held is set he stands still; once c.away is set (the
// night has let you go) he has turned round, and you see his back as he walks off.
// The night moves him (night 9: from street lamp to street lamp) and tells him what he is doing: c.side, how far to the
// side of his way he is; c.reach (0..1), one arm unfolding up out of its sleeve, far too long, to c.reachTo (across and up
// from his feet, in metres; c.reachSide the arm), the hand closing on what it reaches (c.grip); c.rush (0..1), running,
// stooped, the arms flung about and the coat flying; c.dark, out of the light, where his eyes catch what light there is.
CREATURES.signalman = {
  name: 'the signalman', h: 2.3, w: 1.2, faceY: 2.28, stepRate: 0.6, catchDist: 1.6, sound: 'walker', ignoresGaze: true,
  death: { delay: 0.3, dur: 0.5, sting: 'stingGlass' },
  voice: { kind: 'hum', every: [7, 13] },
  init(c) { c.held = false; c.away = false; c.lookT = -9; c.unseenFor = 9; c.wasSeen = false; c.side = 0; c.reach = 0; c.rush = 0; c.grip = 0; c.dark = false; },
  lateral(c) { return c.side || 0; },
  speedMult(c, dt, seen) {
    // the head: looked at after a while unwatched, it is still turned aside, and a moment later it snaps round to you
    if (seen && !c.wasSeen && c.unseenFor > 0.8) c.lookT = c.t;
    c.unseenFor = seen ? 0 : (c.unseenFor || 0) + dt; c.wasSeen = seen;
    return c.held ? 0 : 1;
  },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, lunge = c.lunge || 0, back = !!c.away && !lunge;
    const close = Math.max(smoothstep((5 - c.dist) / 3), lunge);
    const coat = P.col([22, 20, 24]), coatL = P.col([44, 40, 46]), skin = P.col([200, 196, 184]), black = P.col([6, 4, 6]), brass = P.col([170, 140, 70]), hair = P.col([30, 26, 24]);
    const hand = P.col([140, 134, 126]), shade = P.col([118, 110, 104]), wet = P.cola([176, 184, 200], 0.16), drop = P.cola([200, 210, 226], 0.55);
    const hole = rgba(mixc([2, 0, 1], P.fogColor || [0, 0, 0], P.fog || 0));
    const held = c.held && !lunge, mv = c.moving ? 1 : 0, ru = back || lunge ? 0 : (c.rush || 0);
    const bob = mv * Math.abs(Math.sin(g)) * (0.04 + 0.05 * ru) - ru * 0.12;   // (running, stooped: lower)
    const tw = this.twitch(t, 2.1, 5), tw2 = this.twitch(t + 0.9, 2.6, 11);
    // seen from behind everything is mirrored, so his two arms do not trade their ways of hanging as he turns
    if (back) { ctx.save(); ctx.scale(-1, 1); }
    // legs: long, even strides, thin as sticks under the coat
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = mv * Math.max(0, Math.sin(ph)) * 0.22;
      P_limb(ctx, [[s * 0.09, 1.05 + bob], [s * 0.12 + Math.sin(ph) * 0.12, 0.55 + lift * 0.6], [s * 0.14 + Math.sin(ph) * 0.2, lift + 0.03]], 0.085, coat);
      P_ell(ctx, s * 0.14 + Math.sin(ph) * 0.2, lift + 0.03, 0.1, 0.035, black);
    }
    // the coat: the shoulders narrow and falling away, one lower than the other, the hem wide, ragged and swinging a beat
    // behind the stride
    const hs = mv * Math.sin(g - 1.1) * (0.05 + 0.12 * ru), sy = 1.9 + bob;
    const hem = [[0.42 + hs, 0.53], [0.3 + hs, 0.44], [0.17 + hs, 0.5], [0.05 + hs, 0.43], [-0.08 + hs, 0.5], [-0.22 + hs, 0.42], [-0.4 + hs, 0.52]];
    P_poly(ctx, hem.concat([[-0.25, sy + 0.01], [-0.12, sy + 0.08], [0.12, sy + 0.07], [0.24, sy - 0.03]]), coat);
    if (!back) {
      P_poly(ctx, [[-0.025 + hs * 0.6, 0.5], [0.025 + hs * 0.6, 0.5], [0.03, sy], [-0.03, sy]], coatL);
      for (let k = 0; k < 4; k++) P_ell(ctx, 0.07 + hs * (0.4 - k * 0.1), 0.85 + k * 0.26 + bob, 0.018, 0.018, brass);
    } else {
      P_line(ctx, hs * 0.6, 0.5, 0, sy - 0.02, 0.012, coatL); P_line(ctx, hs * 0.6, 0.5, 0.04 + hs * 0.4, 0.95 + bob, 0.01, coatL);
      P_line(ctx, -0.27, 1.2 + bob, 0.27, 1.2 + bob, 0.02, coatL);   // the half-belt across the back
    }
    // the rain on it: the wet running down the coat in streaks, drops sliding down them and falling off the hem
    ctx.strokeStyle = wet; ctx.lineWidth = 0.01; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const x = -0.26 + i * 0.17; ctx.moveTo(x * 0.85, sy - 0.12); ctx.lineTo(x + hs, 0.56); }
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const x = -0.26 + i * 0.17, u = (t * 0.7 + i * 0.37) % 1, y = lerp(sy - 0.12, 0.6, u);
      P_ell(ctx, lerp(x * 0.85, x + hs, u), y, 0.008, 0.022, drop);
      const f = (t * 1.6 + i * 0.29) % 1;   // off the hem
      P_ell(ctx, hem[i * 2][0], hem[i * 2][1] - f * 0.5, 0.006, 0.018, P.cola([200, 210, 226], 0.5 * (1 - f)));
    }
    // the arms, far too long: the hands hanging below the hem, the fingers loose and twitching, the right one a little
    // shorter and swinging against the stride; coming at you they come up at your face, the fingers spread
    const rk = smoothstep(lunge * 1.5), rk2 = smoothstep(lunge * 1.5 - 0.15);
    const arm = (side, sh, sw, drop, k, twk) => {
      const el = [lerp(side * 0.33 + sw * 0.5, side * 0.46, k), lerp(1.3 + bob, 1.6, k)], ha = [lerp(side * 0.31 + sw, side * 0.3, k), lerp(drop + bob, 2.15, k)];
      const cuff = [lerp(el[0], ha[0], 0.86), lerp(el[1], ha[1], 0.86)];
      P_limb(ctx, [sh, el, cuff], 0.085, coat);
      P_line(ctx, cuff[0], cuff[1], ha[0], ha[1], 0.035, hand);
      const down = side < 0 ? -Math.PI / 2 - 0.08 : -Math.PI / 2 + 0.08, upAt = side < 0 ? 0.75 : Math.PI - 0.75;   // (hanging; reaching up and out)
      this.hand(ctx, hand, ha[0], ha[1], lerp(down, upAt, k), lerp(0.07 + Math.abs(twk) * 0.3, 0.2, k), lerp(0.2, 0.22, k), lerp(0.2, 0.45, k) * (side < 0 ? 1 : -1));
    };
    // the arm reaching up to a lamp: out of the sleeve a bare arm unfolds, thin and far too long, the elbow out to the side
    // as it comes up and the fingers spread, closing on what it reaches
    const reachArm = (side, sh) => {
      const e = smoothstep(c.reach), T = c.reachTo, hang = [side * 0.31, 0.62 + bob], ha = [lerp(hang[0], T.x, e), lerp(hang[1], T.y, e)];
      const dx = ha[0] - sh[0], dy = ha[1] - sh[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len * side, ny = dx / len * side;
      const out = (0.3 * (1 - e) + 0.05) * Math.min(1, len / 1.4) * -1;
      const el = [sh[0] + dx * 0.32 + nx * out, sh[1] + dy * 0.32 + ny * out], cuff = [lerp(sh[0], el[0], 0.75), lerp(sh[1], el[1], 0.75)];
      P_limb(ctx, [sh, cuff], 0.085, coat);
      P_limb(ctx, [cuff, el, ha], 0.026, hand); P_ell(ctx, el[0], el[1], 0.02, 0.02, shade);   // the bony elbow
      const ang = Math.atan2(ha[1] - el[1], ha[0] - el[0]);
      this.hand(ctx, hand, ha[0], ha[1], ang, lerp(0.32, 0.12, c.grip || 0), 0.26, lerp(0.15, 1.1, c.grip || 0) * -side);
    };
    const reaching = c.reach > 0.001 && c.reachTo && !back && !lunge ? (c.reachSide || 1) : 0;
    const fl = 0.06 + 0.22 * ru;   // how far the arms swing: flung about, running
    if (reaching === -1) reachArm(-1, [-0.24, sy - 0.03]); else arm(-1, [-0.24, sy - 0.03], mv * Math.sin(g + Math.PI) * fl, 0.62 + ru * 0.2, rk, tw);
    if (reaching === 1) reachArm(1, [0.22, sy - 0.05]); else arm(1, [0.22, sy - 0.05], c.moving ? Math.sin(g) * fl : Math.sin(t * 1.2) * 0.02, 0.7 + ru * 0.2, rk2, tw2);
    // the head. Looked at, it is turned aside, and snaps round to you a moment later; now and then it jerks over. Close,
    // the neck comes up out of the collar and lifts the face out of the peak's shadow
    const since = t - (c.lookT === undefined ? -9 : c.lookT);
    const turn = back || lunge ? 0 : since < 0.5 ? 1 - smoothstep((since - 0.38) / 0.07) : 0;
    const tilt = (headTiltJerk(t, 3.4, 0.07) + tw * 0.25) * (1 - lunge) + turn * 0.12 - lunge * 0.12 + ru * 0.22 * Math.sin(g * 0.5) + (reaching ? -reaching * 0.1 * smoothstep(c.reach) : 0);
    const neck = (back ? 0 : 0.12 * close);
    ctx.save(); ctx.translate(0, sy + 0.02);
    if (!back) {
      ctx.rotate(tilt);
      P_rect(ctx, -0.04, -0.03, 0.08, 0.12 + neck, shade);   // the neck, coming up out of the collar
      ctx.translate(turn * 0.03, neck);
      this.face(ctx, P, c, { skin, shade, black, hole, hole0: rgba([20, 14, 14], 0), hollow: P.cola([96, 88, 84], 0.3), coat, coatL }, turn, close, lunge);
    } else {
      P_line(ctx, 0, 0, 0, 0.08, 0.1, skin);
      P_ell(ctx, 0, 0.24, 0.115, 0.18, hair); P_ell(ctx, 0, 0.12, 0.07, 0.035, P.col([150, 138, 128]));   // the back of his head; the nape in shadow
      P_rect(ctx, -0.16, -0.02, 0.32, 0.13, coat); P_line(ctx, -0.16, 0.11, 0.16, 0.11, 0.015, coatL);   // the collar, turned up
      P_ell(ctx, 0, 0.4, 0.14, 0.05, coat); P_rect(ctx, -0.12, 0.38, 0.24, 0.1, coat); P_line(ctx, -0.13, 0.38, 0.14, 0.38, 0.02, coatL);
    }
    ctx.restore();
    if (!back) {   // the collar, turned up either side of the jaw, over the neck
      for (const s of [-1, 1]) { P_poly(ctx, [[s * 0.2, sy - 0.04], [0, sy - 0.02], [s * 0.06, sy + 0.12], [s * 0.16, sy + 0.16]], coat); P_line(ctx, s * 0.06, sy + 0.12, s * 0.16, sy + 0.16, 0.014, coatL); }
    }
    if (back) ctx.restore();
    if (held && !c.moving) P_ell(ctx, 0, 0.02, 0.5, 0.05, P.cola([0, 0, 0], 0.25));
  },
  // the face, in the frame of the top of the neck: a long pale jaw and a grin too wide for it, lit from below; above that
  // the peak's shadow, black, with the eyes in it, shut until he is close and then two points of light. Close, the shadow
  // lifts off the sockets; coming at you, the jaw drops open far too wide and the eyes flare
  face(ctx, P, c, K, turn, close, lunge) {
    const gape = smoothstep(lunge * 1.4), fx = turn * 0.05;
    const open = Math.max(clamp((12 - c.dist) / 4 + lunge, 0, 1), c.dark && !c.away ? 0.6 : 0);   // (in the dark they catch the light)
    const jaw = 0.04 * close + gape * 0.2;
    P_ell(ctx, fx * 0.5, 0.17 - jaw * 0.5, 0.085, 0.13 + jaw * 0.5, K.skin);   // the long jaw
    P_ell(ctx, fx * 0.4, 0.25, 0.1, 0.14, K.skin);
    for (const s of [-1, 1]) P_ell(ctx, fx + s * 0.066, 0.175 - jaw * 0.2, 0.014, 0.04, K.hollow);   // the cheeks, sunk
    // the sockets, deep (only ever seen close, up under the peak)
    for (const s of [-1, 1]) {
      const ex = fx + s * 0.043, sg = ctx.createRadialGradient(ex, 0.25, 0.008, ex, 0.25, 0.04);
      sg.addColorStop(0, K.hole); sg.addColorStop(0.55, K.hole); sg.addColorStop(1, K.hole0);
      ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(ex, 0.25, 0.04, 0.036, 0, 0, TAU); ctx.fill();
    }
    // the grin: right across the jaw, a crescent of dark full of long narrow teeth
    const gw = 0.078 - Math.abs(turn) * 0.01, gy = 0.12 - jaw * 0.3, lo = gy - 0.03 - close * 0.02 - gape * 0.22;
    const shape = () => { ctx.beginPath(); ctx.moveTo(fx - gw, gy + 0.03); ctx.quadraticCurveTo(fx, gy - 0.02, fx + gw, gy + 0.03); ctx.quadraticCurveTo(fx, lo - 0.02, fx - gw, gy + 0.03); ctx.closePath(); };
    ctx.fillStyle = K.hole; shape(); ctx.fill();
    ctx.save(); shape(); ctx.clip();
    ctx.fillStyle = P.col([216, 208, 180]); ctx.beginPath();
    for (let i = -6; i <= 6; i++) {   // long and narrow, needle-pointed, no two the same length
      const q = i / 6.5, x = fx + i * gw / 6.5, top = gy + 0.035 - 0.025 * (1 - q * q), bot = lo + 0.01 + 0.012 * (1 - q * q);
      const lt = (0.024 + 0.014 * Math.abs(Math.sin(i * 2.3))) * (1 + gape * 0.9), lb = (0.016 + 0.012 * Math.abs(Math.cos(i * 1.7))) * (0.4 + close * 0.6 + gape);
      ctx.moveTo(x - 0.0048, top); ctx.lineTo(x + 0.0048, top); ctx.lineTo(x + 0.0008, top - lt);   // top
      if (close > 0.1 && i % 3) { ctx.moveTo(x - 0.0045, bot); ctx.lineTo(x + 0.0045, bot); ctx.lineTo(x - 0.0008, bot + lb); }   // bottom, some gone
    }
    ctx.fill();
    ctx.restore();
    // the peak's shadow over all but the jaw: lifting off the eyes as he comes up close
    const sh = 1 - 0.75 * close;
    if (sh > 0.01) {
      const gr = ctx.createLinearGradient(0, 0.36, 0, 0.12);
      gr.addColorStop(0, rgba([0, 0, 0], sh)); gr.addColorStop(0.55, rgba([0, 0, 0], sh * 0.92)); gr.addColorStop(1, rgba([0, 0, 0], 0));
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(fx * 0.4, 0.25, 0.104, 0.145, 0, 0, TAU); ctx.fill();
    }
    // the eyes: shut, nothing; open, two points of light in the dark, the far one lost as the head is turned
    if (open > 0.02) {
      const m = ctx.getTransform(), px = 1 / (Math.hypot(m.a, m.b) || 1);   // a device pixel, here
      const pr = Math.max(clamp(0.0018 * c.dist, 0.0045, 0.018), c.dark ? 1.1 * px : 0);
      const lit = P.raw([228, 236, 196]), halo = rgba([228, 236, 196], (c.dist > 3 ? 0.28 : 0.12) * open);
      for (const s of [-1, 1]) {
        const a = s > 0 ? 1 : 1 - turn;
        if (a < 0.05) continue;
        const x = fx * 1.6 + s * 0.043;
        P_ell(ctx, x, 0.25, pr * 2, pr * 2 * open, halo);
        ctx.save(); ctx.globalAlpha *= a; P_ell(ctx, x, 0.25, pr, pr * open, lit); ctx.restore();
      }
    }
    // the cap: the crown, the band, and the peak jutting out over the face
    P_ell(ctx, fx * 0.3, 0.44, 0.15, 0.05, K.coat); P_rect(ctx, -0.125 + fx * 0.3, 0.37, 0.25, 0.08, K.coat);
    P_line(ctx, -0.125 + fx * 0.3, 0.385, 0.125 + fx * 0.3, 0.385, 0.018, K.coatL);
    P_poly(ctx, [[-0.13 + fx, 0.37], [0.13 + fx, 0.37], [0.15 + fx * 1.4, 0.335], [-0.15 + fx * 1.4, 0.335]], K.black);
  },
  // a hand: a narrow palm at (x, y) and four long jointed fingers from it pointing along ang, spread apart by spread, each
  // len long, bent at the middle joint by curl
  hand(ctx, col, x, y, ang, spread, len, curl) {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    P_ell(ctx, x, y, 0.026, 0.04, col, ang - Math.PI / 2);
    ctx.strokeStyle = col; ctx.lineWidth = 0.012; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5, a = ang + o * spread, l = len * (o * o > 1 ? 0.8 : 1), b = a - curl - o * 0.05;
      const bx = x + ca * 0.03 - sa * o * 0.011, by = y + sa * 0.03 + ca * o * 0.011;
      const mx = bx + Math.cos(a) * l * 0.55, my = by + Math.sin(a) * l * 0.55;
      ctx.moveTo(bx, by); ctx.lineTo(mx, my); ctx.lineTo(mx + Math.cos(b) * l * 0.45, my + Math.sin(b) * l * 0.45);
    }
    ctx.moveTo(x + sa * 0.014, y - ca * 0.014); ctx.lineTo(x + Math.cos(ang - 0.7) * len * 0.36, y + Math.sin(ang - 0.7) * len * 0.36);   // the thumb
    ctx.stroke();
  },
  // a jerk: now and then (not every period, by a hash of which one it is) a sharp shudder at the start of a period
  twitch(t, period, seed) {
    const k = Math.floor(t / period), f = t - k * period, r = Math.abs(Math.sin((k + seed) * 127.1) * 43758.5) % 1;
    return r > 0.5 ? Math.exp(-f * 11) * Math.sin(f * 46) : 0;
  },
};
