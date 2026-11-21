'use strict';
// The crawler: pale, on all fours, in bursts. A night can send it scuttling sideways (The Road's shying out of the
// lights, and its runs round the car): c.runPose on, side-on, facing c.runDir (1 right, -1 left), its legs at c.runGait.
// Hit by a car (The Road: you drove straight into it), it is drawn as c.struck has it (struck(T), drawStruck): thrown,
// lying in a heap, twitching, getting up and standing.
CREATURES.crawler = {
  name: 'the crawler', h: 1.1, w: 2.0, faceY: 0.3, stepRate: 2.4, catchDist: 1.3, sound: 'crawler',
  death: { delay: 0.08, dur: 0.28, sting: 'stingShriek' },
  voice: { kind: 'clicks', every: [3, 7] },
  init(c) { c.mode = 'pause'; c.modeT = 0.4; },
  speedMult(c, dt, seen) {
    c.modeT += dt;
    if (c.mode === 'pause' && c.modeT > 1.05) { c.mode = 'scuttle'; c.modeT = 0; }
    else if (c.mode === 'scuttle' && c.modeT > 0.7) { c.mode = 'pause'; c.modeT = 0; }
    return c.mode === 'scuttle' ? 2.3 : 0.1;
  },
  draw(ctx, c, P) {
    if (c.struck && !c.lunge) { this.drawStruck(ctx, c, P); return; }
    if (c.runPose && !c.lunge) { this.drawRun(ctx, c, P); return; }
    const t = c.t;
    const scut = c.mode === 'scuttle' && !c.frozen;
    const near = clamp(1 - c.dist / 18, 0, 1);
    const lit = c.lit || 0;
    const skinC = mixc([84, 78, 72], [118, 111, 103], lit);
    const skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.56));
    const dark = P.col([34, 26, 29]);
    const mouthC = P.col([12, 6, 8]);
    const j = k => (scut ? Math.sin(t * 57 + k * 7.3) * 0.035 + Math.sin(t * 91 + k * 3.1) * 0.02 : 0);
    const lift = c.mode === 'pause' ? smoothstep(Math.min(1, c.modeT / 0.5)) * 0.14 : 0;
    const lunge = c.lunge || 0;
    // rear legs (long, knees way out)
    for (const s of [-1, 1]) {
      P_limb(ctx, [[s * 0.2, 0.55 + j(1)], [s * 0.86 + j(2 + s), 0.78 + j(3)], [s * 0.98 + j(4 + s), 0.02]], 0.07, skinD);
      fingers(ctx, s * 0.98 + j(4 + s), 0.02, s > 0 ? 0.2 : Math.PI - 0.2, 0.35, 0.13, 0.02, skinD);
    }
    // hump of the back, spine showing
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.moveTo(-0.44, 0.26); ctx.bezierCurveTo(-0.4, 1.02 + j(5), 0.4, 1.02 + j(6), 0.44, 0.26); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 6; i++) { const a = -0.35 + i * 0.14; P_ell(ctx, a, 0.88 - Math.abs(a) * 1.15 + j(7 + i) * 0.5, 0.035, 0.028, skinD); }
    // front arms: elbows above the back
    for (const s of [-1, 1]) {
      const ex = s * 0.64 + j(8 + s), ey = 0.98 + j(9 + s), hx = s * 0.6 + j(10 + s);
      P_limb(ctx, [[s * 0.28, 0.6], [ex, ey], [hx, 0.02]], 0.075, skin);
      fingers(ctx, hx, 0.02, s > 0 ? 0.35 : Math.PI - 0.35, 0.4, 0.16, 0.022, skin);
    }
    // head: low, in front, no eyes, big mouth
    const hy = 0.3 + lift + lunge * 0.1;
    ctx.save(); ctx.translate(j(11) * 0.5, hy); ctx.rotate(lift * 1.2 + (scut ? Math.sin(t * 40) * 0.08 : 0));
    strands(ctx, 0, 0.06, 9, 0.28, dark, 3, t);
    P_ell(ctx, 0, 0, 0.16, 0.125, skin);
    P_ell(ctx, 0, 0.04, 0.12, 0.06, skinD);      // brow shadow
    const mw = 0.05 + (near * 0.5 + lunge) * 0.07, mh = 0.025 + (near * 0.5 + lunge) * 0.09;
    P_ell(ctx, 0, -0.045, mw, mh, mouthC);
    if (near > 0.2) for (let i = -2; i <= 2; i++) P_line(ctx, i * mw * 0.35, -0.045 + mh * 0.9, i * mw * 0.35, -0.045 + mh * 0.9 - mh * 0.45, 0.012, skin);
    ctx.restore();
  },
  // side-on, scuttling: the long back humped low, the spine along it, the head thrust out in front with its mouth open and
  // its hair streaming back, the long legs folded up high over the back and flung out and down in turn, fast. Drawn facing
  // right; c.runDir -1 mirrors it
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, t = c.t, lit = c.lit || 0;
    const skinC = mixc([84, 78, 72], [118, 111, 103], lit), skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.56)), dark = P.col([34, 26, 29]), mouthC = P.col([12, 6, 8]);
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const bob = Math.abs(Math.sin(g * 2)) * 0.04;
    // a leg from the hip: the knee folded up over the back, the hand or foot reaching out along the ground and pulled back
    const leg = (hx, hy, ph, reach, col, w) => {
      const sw = Math.sin(ph), lift = Math.max(0, Math.cos(ph)) * 0.14, fx = hx + sw * reach, fy = lift;
      const kx = (hx + fx) / 2 + (reach > 0 ? 0.12 : -0.12), ky = 0.98 + bob + lift * 0.4;
      P_limb(ctx, [[hx, hy + bob], [kx, ky], [fx, fy + 0.02]], w, col);
      fingers(ctx, fx, fy + 0.02, sw > 0 ? 0.25 : -0.1, 0.35, 0.12, 0.018, col);
    };
    leg(-0.3, 0.5, g + Math.PI, 0.42, skinD, 0.06); leg(0.28, 0.55, g, 0.4, skinD, 0.065);            // the far pair
    ctx.fillStyle = skin;                                                                                 // the back, long and low
    ctx.beginPath(); ctx.moveTo(-0.62, 0.36 + bob); ctx.bezierCurveTo(-0.5, 0.86 + bob, 0.3, 0.92 + bob, 0.56, 0.4 + bob); ctx.lineTo(0.5, 0.3 + bob); ctx.bezierCurveTo(0.2, 0.36 + bob, -0.3, 0.3 + bob, -0.62, 0.36 + bob); ctx.fill();
    for (let i = 0; i < 7; i++) { const x = -0.48 + i * 0.15, y = 0.4 + bob + 0.42 * Math.sin((x + 0.62) / 1.18 * Math.PI) - 0.04; P_ell(ctx, x, y, 0.035, 0.026, skinD); }   // the spine
    // the head, thrust out in front, low, its hair streaming back over the shoulders
    ctx.save(); ctx.translate(0.72, 0.36 + bob); ctx.rotate(-0.18 + Math.sin(t * 40) * 0.05);
    for (let i = 0; i < 7; i++) P_line(ctx, -0.04, 0.08 - i * 0.02, -0.34 - i * 0.03 + Math.sin(t * 30 + i) * 0.03, 0.14 - i * 0.035, 0.016, dark);
    P_ell(ctx, 0, 0, 0.15, 0.12, skin);
    P_ell(ctx, 0.03, 0.04, 0.11, 0.05, skinD);                        // the brow
    P_ell(ctx, 0.1, -0.05, 0.06, 0.055, mouthC);                      // the mouth, open, toward where it goes
    for (let i = 0; i < 3; i++) P_line(ctx, 0.07 + i * 0.03, -0.0, 0.07 + i * 0.03, -0.03, 0.01, skin);
    ctx.restore();
    leg(-0.34, 0.48, g, 0.46, skin, 0.07); leg(0.3, 0.52, g + Math.PI, 0.44, skin, 0.075);             // the near pair, over the body
    ctx.restore();
  },

  // ---- hit by a car (The Road: you drove straight into it) ----
  // What it does from the moment the car hits it, T seconds on. It goes up off the bumper and down the road, turning over
  // twice in the air, its limbs thrown about; it comes down at STRUCK.land, bounces low and slides to where it lies
  // (STRUCK.rest), a heap in the road: on its side, its head on the tarmac, one arm bent up into the air. It lies still.
  // From STRUCK.twitch that arm jerks, and again (STRUCK.jerks). From STRUCK.rise it gets its limbs under it one at a time,
  // the raised arm first, its head still hanging on one side; from STRUCK.stand it stands up on its hind legs, in jolts
  // (a crack of its joints at each: STRUCK.cracks), taller than a man, bow-legged, its arms hanging to its knees; at
  // STRUCK.look the head snaps up straight at you and the mouth opens; at STRUCK.crouch it drops forward onto all fours
  // again, and at STRUCK.leap it comes (the night's death lunge goes on from there, in its usual shape).
  // struck(T) is that as numbers: stage (thrown, down, twitch, rise, look, leap); along (0 at the bumper to 1 where it
  // lies); y (how high off the road, m); spin (how far over it has turned); fl (its limbs flung out, in the air); down
  // (1 in a heap, 0 on all fours); up (1 standing); tw (a jerk, now); hang (the head on one side); look (the head up at you)
  STRUCK: { land: 0.8, rest: 1.45, twitch: 2.5, rise: 3.9, stand: 5.0, look: 6.9, crouch: 7.7, leap: 7.9, jerks: [2.5, 3.05, 3.2, 3.7], cracks: [3.9, 5.0, 5.55, 6.1] },
  struck(T) {
    const K = this.STRUCK, fl = clamp(T / K.land, 0, 1), bo = clamp((T - K.land) / 0.36, 0, 1), lie = smoothstep((T - K.land + 0.12) / (K.rest - K.land + 0.12));
    const jolt = k => { const n = 3, i = Math.min(n - 1, Math.floor(k * n)); return (i + smoothstep((k * n - i) / 0.4)) / n; };   // up in three jolts, a wait after each
    const look = smoothstep((T - K.look) / 0.09);
    return {
      stage: T < K.rest ? 'thrown' : T < K.twitch ? 'down' : T < K.rise ? 'twitch' : T < K.look ? 'rise' : T < K.crouch ? 'look' : 'leap',
      along: 1 - Math.pow(1 - clamp(T / K.rest, 0, 1), 2.2),
      y: T < K.land ? 1.55 * 4 * fl * (1 - fl) : 0.22 * 4 * bo * (1 - bo),
      spin: TAU * 2 * Math.pow(1 - clamp(T / (K.land + 0.3), 0, 1), 1.3),
      fl: smoothstep(T / 0.12) * (1 - lie),
      down: T < K.rise ? lie : 1 - clamp((T - K.rise) / (K.stand - K.rise), 0, 1),
      up: T < K.stand ? 0 : T < K.crouch ? jolt(clamp((T - K.stand) / (K.look - 0.25 - K.stand), 0, 1)) : 1 - smoothstep((T - K.crouch) / (K.leap - K.crouch)),
      tw: K.jerks.reduce((m, tj) => { const x = (T - tj) / 0.24; return x > 0 && x < 1 ? Math.max(m, Math.sin(Math.PI * Math.sqrt(x))) : m; }, 0),
      hang: clamp(T / K.rest, 0, 1) * (1 - look),
      look,
    };
  },
  // Its shapes then, each the same parts as numbers, so one goes over into the next part by part: the trunk (its base, how
  // high its dome is drawn to, its half width), the head (x, y, how far it is tipped over), and four limbs (root, joint
  // and end, x and y, and the way the fingers point): the hind legs, then the arms. crawl is its usual shape on all fours
  POSES: {
    crawl: [0.26, 1.02, 0.44, 0, 0.3, 0, -0.2, 0.55, -0.86, 0.78, -0.98, 0.02, 2.94, 0.2, 0.55, 0.86, 0.78, 0.98, 0.02, 0.2, -0.28, 0.6, -0.64, 0.98, -0.6, 0.02, 2.79, 0.28, 0.6, 0.64, 0.98, 0.6, 0.02, 0.35],
    heap: [0, 0.5, 0.5, -0.56, 0.13, 1.25, -0.1, 0.2, 0.15, 0.52, 0.5, 0.3, 0.3, 0.25, 0.18, 0.72, 0.62, 1.02, 0.04, 0.1, -0.3, 0.2, -0.8, 0.14, -1.08, 0.03, 3.3, 0.1, 0.3, 0.3, 0.78, 0.56, 0.6, 0.9],
    flail: [0.15, 0.8, 0.38, 0, 0.2, 0.4, -0.2, 0.5, -0.7, 0.95, -1.1, 0.7, 2.6, 0.2, 0.5, 0.8, 0.75, 1.15, 1, 0.6, -0.28, 0.5, -0.75, 0.3, -1.05, -0.1, 3.6, 0.28, 0.5, 0.7, 0.15, 0.95, -0.25, -0.5],
    up: [0.9, 1.98, 0.27, 0.1, 1.74, 0.95, -0.15, 0.96, -0.52, 0.52, -0.3, 0.02, 2.94, 0.15, 0.96, 0.44, 0.6, 0.26, 0.02, 0.2, -0.25, 1.55, -0.6, 1.1, -0.5, 0.45, 4.6, 0.25, 1.55, 0.66, 1.22, 0.62, 0.52, -1.45],
  },
  drawStruck(ctx, c, P) {
    const p = c.struck, t = c.t, lit = c.lit || 0, Z = this.POSES;
    const skinC = mixc([84, 78, 72], [118, 111, 103], lit), skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.56)), dark = P.col([34, 26, 29]), mouthC = P.col([12, 6, 8]);
    // from one shape to another, each part in its own time (ks: the trunk, the head, the two hind legs, the two arms)
    const mix = (a, b, ks) => a.map((v, i) => lerp(v, b[i], ks[i < 3 ? 0 : i < 6 ? 1 : 2 + Math.floor((i - 6) / 7)]));
    const each = (u, w) => w.map(([a, b]) => smoothstep((u - a) / (b - a)));
    let q = Z.crawl;
    if (p.up > 0) q = mix(q, Z.up, each(p.up, [[0.1, 0.8], [0.2, 0.9], [0, 0.6], [0, 0.55], [0.35, 1], [0.3, 0.95]]));           // the legs first, the arms trailing
    else if (p.down > 0) q = mix(Z.heap, q, each(1 - p.down, [[0.3, 0.9], [0.6, 1], [0.55, 0.95], [0.15, 0.5], [0.45, 0.8], [0, 0.35]]));   // up out of the heap, the raised arm first
    if (p.fl > 0) q = mix(q, Z.flail, [p.fl, p.fl, p.fl, p.fl, p.fl, p.fl]);
    else q = q.slice();
    const j = (k, f) => Math.sin(t * f + k * 2.1);
    if (p.fl > 0) for (const i of [10, 11, 17, 18, 24, 25, 31, 32]) q[i] += 0.07 * p.fl * j(i, 23);   // its limbs thrown about as it goes over
    if (p.tw > 0) {   // a jerk: the raised arm, the knee beside it, the head
      q[29] += 0.03 * p.tw * j(1, 61); q[31] += 0.13 * p.tw * j(2, 53); q[32] += 0.15 * p.tw * Math.abs(j(3, 47)); q[33] += 0.5 * p.tw * j(6, 39);
      q[16] += 0.09 * p.tw * j(4, 58); q[5] += 0.12 * p.tw * j(5, 44); q[1] += 0.025 * p.tw;
    }
    const sx = Math.sin(t * 1.3) * 0.035 * p.up;   // standing, it sways
    for (const i of [20, 22, 24, 27, 29, 31]) q[i] += sx;
    ctx.save();
    if (p.spin) { ctx.translate(0, 0.42); ctx.rotate(p.spin); ctx.translate(0, -0.42); }
    const limb = (i, w, col, fl, fw) => { P_limb(ctx, [[q[i], q[i + 1]], [q[i + 2], q[i + 3]], [q[i + 4], q[i + 5]]], w, col); fingers(ctx, q[i + 4], q[i + 5], q[i + 6], 0.37, fl, fw, col); };
    limb(6, 0.07, skinD, 0.13, 0.02); limb(13, 0.07, skinD, 0.13, 0.02);
    // the back (standing, its trunk, the hips under it), the spine showing along it
    const b0 = q[0], b1 = q[1], hw = q[2], X = [-hw, -hw * 0.91 + sx, hw * 0.91 + sx, hw], Y = [b0, b1, b1, b0];
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.moveTo(X[0], Y[0]); ctx.bezierCurveTo(X[1], Y[1], X[2], Y[2], X[3], Y[3]); ctx.closePath(); ctx.fill();
    if (p.up > 0) {   // standing: its hips, and its ribs down the front of it
      P_ell(ctx, 0, b0, hw * 0.95, 0.1 * p.up, skin);
      const top = b0 + 0.75 * (b1 - b0);
      for (let k = 0; k < 4; k++) {
        const f = 0.34 + k * 0.13, y = lerp(b0, top, f), w = hw * (0.68 - k * 0.07) * p.up;
        for (const sd of [-1, 1]) P_line(ctx, sd * 0.03 + sx * f, y, sd * w + sx * f, y - 0.05, 0.02, skinD);
      }
    }
    for (let i = 0; i < 6; i++) {
      const u = 0.2 + i * 0.12, v = 1 - u, bz = A => v * v * v * A[0] + 3 * v * v * u * A[1] + 3 * v * u * u * A[2] + u * u * u * A[3];
      P_ell(ctx, bz(X), bz(Y) + 0.03 + (p.tw ? j(7 + i, 50) * 0.008 * p.tw : 0), 0.035, 0.028, skinD);
    }
    limb(20, 0.075, skin, 0.16, 0.022); limb(27, 0.075, skin, 0.16, 0.022);
    // the head: tipped over on one side until it looks at you, its hair hanging (short where it lies on the road)
    const hx = lerp(q[3], 0, p.look) + sx * 1.2, hy = q[4] + 0.06 * p.look * p.up, open = 0.2 + p.look * 0.62 + p.tw * 0.25;
    ctx.translate(hx, hy);
    strands(ctx, 0, 0.06, 9, Math.min(0.28, hy + 0.04), dark, 3, t);
    ctx.rotate(lerp(lerp(q[5], 0.95, p.hang), 0, p.look) + (p.look ? Math.sin(t * 31) * 0.03 * p.look : 0));
    P_ell(ctx, 0, 0, 0.16, 0.125, skin);
    P_ell(ctx, 0, 0.04, 0.12, 0.06, skinD);
    const mw = 0.05 + open * 0.07, mh = 0.025 + open * 0.09;
    P_ell(ctx, 0, -0.045, mw, mh, mouthC);
    if (open > 0.5) for (let i = -2; i <= 2; i++) P_line(ctx, i * mw * 0.35, -0.045 + mh * 0.9, i * mw * 0.35, -0.045 + mh * 0.45, 0.012, skin);
    ctx.restore();
  }
};
