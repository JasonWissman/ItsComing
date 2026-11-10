'use strict';
// The signalman: too tall, in a long coat and a peaked cap, walking in step down the middle of the street with a lantern in
// one hand. The coat hangs wrong on him: the shoulders narrow and sloping, one dragged down by the lantern, the hem wide
// and ragged and swinging a beat behind his stride, the rain running down it and dripping off the hem and the peak. The
// other arm is far too long, the hand hanging below the hem, the long fingers loose and now and then twitching. Under the
// peak there is no face at all, only dark, and below it a long pale jaw and a grin, lit from underneath by the lantern;
// his eyes are shut until he is close, and then two points of light open in the dark under the peak. While nobody looks
// at him his head is turned aside; a moment after you look, it snaps round to you. Near the glass he straightens, his neck
// coming up out of the collar, and you see up under the peak. Coming at you, the jaw drops open far too wide.
// He keeps the same pace whether you watch him or not. While c.held is set he stands still; once c.away is set (the
// night has let you go) he has turned round, and you see his back as he walks off.
CREATURES.signalman = {
  name: 'the signalman', h: 2.3, w: 1.2, faceY: 2.28, stepRate: 0.6, catchDist: 1.6, sound: 'walker', ignoresGaze: true,
  death: { delay: 0.3, dur: 0.5, sting: 'stingGlass' },
  voice: { kind: 'hum', every: [7, 13] },
  init(c) { c.held = false; c.away = false; c.lookT = -9; c.unseenFor = 9; c.wasSeen = false; },
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
    const held = c.held && !lunge, mv = c.moving ? 1 : 0;
    const bob = mv * Math.abs(Math.sin(g)) * 0.04;
    const tw = this.twitch(t, 2.1, 5);
    // seen from behind everything is mirrored: the lantern is in the same hand, which is now on the other side
    if (back) { ctx.save(); ctx.scale(-1, 1); }
    // legs: long, even strides, thin as sticks under the coat
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = mv * Math.max(0, Math.sin(ph)) * 0.22;
      P_limb(ctx, [[s * 0.09, 1.05 + bob], [s * 0.12 + Math.sin(ph) * 0.12, 0.55 + lift * 0.6], [s * 0.14 + Math.sin(ph) * 0.2, lift + 0.03]], 0.085, coat);
      P_ell(ctx, s * 0.14 + Math.sin(ph) * 0.2, lift + 0.03, 0.1, 0.035, black);
    }
    // the coat: the shoulders narrow and falling away, the right one dragged down by the lantern, the hem wide, ragged and
    // swinging a beat behind the stride
    const hs = mv * Math.sin(g - 1.1) * 0.05, sy = 1.9 + bob;
    const hem = [[0.42 + hs, 0.53], [0.3 + hs, 0.44], [0.17 + hs, 0.5], [0.05 + hs, 0.43], [-0.08 + hs, 0.5], [-0.22 + hs, 0.42], [-0.4 + hs, 0.52]];
    P_poly(ctx, hem.concat([[-0.25, sy + 0.01], [-0.12, sy + 0.08], [0.12, sy + 0.06], [0.23, sy - 0.07]]), coat);
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
    // the free arm, far too long: the hand hanging below the hem, the fingers loose and twitching; coming at you it comes up
    // at your face, the fingers spread
    const rk = smoothstep(lunge * 1.5), sw0 = mv * Math.sin(g + Math.PI) * 0.06;
    const lsh = [-0.24, sy - 0.03], lel = [lerp(-0.33 + sw0 * 0.5, -0.46, rk), lerp(1.3 + bob, 1.6, rk)], lha = [lerp(-0.31 + sw0, -0.3, rk), lerp(0.62 + bob, 2.15, rk)];
    const cuff = [lerp(lel[0], lha[0], 0.86), lerp(lel[1], lha[1], 0.86)];
    P_limb(ctx, [lsh, lel, cuff], 0.085, coat);
    P_line(ctx, cuff[0], cuff[1], lha[0], lha[1], 0.035, hand);
    this.hand(ctx, hand, lha[0], lha[1], lerp(-Math.PI / 2 - 0.08, 0.75, rk), lerp(0.07 + Math.abs(tw) * 0.3, 0.2, rk), lerp(0.2, 0.22, rk), lerp(0.2, 0.45, rk));
    // the lantern arm: swinging, the hand round the bail
    const sw = c.moving ? Math.sin(g) * 0.08 : Math.sin(t * 1.2) * 0.03;
    P_limb(ctx, [[0.22, sy - 0.08], [0.38 + sw, 1.4 + bob], [0.44 + sw * 1.5, 1.05 + bob]], 0.085, coat);
    P_ell(ctx, 0.44 + sw * 1.5, 1.01 + bob, 0.044, 0.062, hand);
    ctx.save(); ctx.translate(0.46 + sw * 1.8, 0.6 + bob + sw * 0.1); ctx.rotate(-sw * 0.8); ctx.scale(0.24, 0.34); ICONS.lantern(ctx, Object.assign({}, P, { lit: true })); ctx.restore();
    // the head. Looked at, it is turned aside, and snaps round to you a moment later; now and then it jerks over. Close,
    // the neck comes up out of the collar and lifts the face out of the peak's shadow
    const since = t - (c.lookT === undefined ? -9 : c.lookT);
    const turn = back || lunge ? 0 : since < 0.5 ? 1 - smoothstep((since - 0.38) / 0.07) : 0;
    const tilt = (headTiltJerk(t, 3.4, 0.07) + tw * 0.25) * (1 - lunge) + turn * 0.12 - lunge * 0.12;
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
    const open = clamp((12 - c.dist) / 4 + lunge, 0, 1);
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
      const pr = clamp(0.0018 * c.dist, 0.0045, 0.018);
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
