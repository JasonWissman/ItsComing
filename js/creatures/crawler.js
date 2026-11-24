'use strict';
// The crawler: pale, on all fours, in bursts. A night can send it scuttling sideways (The Road's shying out of the
// lights, and its runs round the car): c.runPose on, side-on, facing c.runDir (1 right, -1 left), its legs at c.runGait.
// Springing into the road in front of the car (The Road), it is drawn side-on in one bound, as c.leap (0..1) has it (drawLeap).
// Hit by a car (The Road: you drove straight into it), it is drawn as c.struck has it (struck(T), drawStruck): knocked
// back down the road, lying in a heap, twitching, getting up and standing up on its hind legs. And it stays up: from
// then on it is drawn as c.up has it (upright, drawUp), coming back at the car on two legs, badly; the upright death
// lunges, and its spring over the bonnet if the car comes at it again, are drawn the same way (c.up's lunge, crouch, dive).
CREATURES.crawler = {
  name: 'the crawler', h: 1.1, w: 2.0, faceY: 0.3, stepRate: 2.4, catchDist: 1.3, sound: 'crawler',
  death: { delay: 0.08, dur: 0.28, sting: 'stingShriek' },
  voice: { kind: 'clicks', every: [3, 7] },
  init(c) { c.mode = 'pause'; c.modeT = 0.4; },
  speedMult(c, dt, seen) {
    if (c.up) return this.upSpeed(c, dt);
    c.modeT += dt;
    if (c.mode === 'pause' && c.modeT > 1.05) { c.mode = 'scuttle'; c.modeT = 0; }
    else if (c.mode === 'scuttle' && c.modeT > 0.7) { c.mode = 'pause'; c.modeT = 0; }
    return c.mode === 'scuttle' ? 2.3 : 0.1;
  },
  draw(ctx, c, P) {
    if (c.up && !c.struck) { this.drawUp(ctx, c, P); return; }
    if (c.struck && !c.lunge) { this.drawStruck(ctx, c, P); return; }
    if (c.leap !== undefined && !c.lunge) { this.drawLeap(ctx, c, P); return; }
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
      const fx = s * 0.98 + j(4 + s);
      P_limb(ctx, [[s * 0.2, 0.55 + j(1)], [s * 0.86 + j(2 + s), 0.78 + j(3)], [fx, 0.02]], 0.07, skinD);
      fingers(ctx, fx, 0.02, s > 0 ? 0.2 : Math.PI - 0.2, 0.35, 0.13, 0.02, skinD);
    }
    // hump of the back, spine showing
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.moveTo(-0.44, 0.26); ctx.bezierCurveTo(-0.4, 1.02 + j(5), 0.4, 1.02 + j(6), 0.44, 0.26); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 6; i++) { const a = -0.35 + i * 0.14; P_ell(ctx, a, 0.88 - Math.abs(a) * 1.15 + j(7 + i) * 0.5, 0.035, 0.028, skinD); }
    // front arms: elbows above the back
    for (const s of [-1, 1]) {
      const hx = s * 0.6 + j(10 + s);
      P_limb(ctx, [[s * 0.28, 0.6], [s * 0.64 + j(8 + s), 0.98 + j(9 + s)], [hx, 0.02]], 0.075, skin);
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
  // side-on, in one long low bound (The Road: it springs into the road in front of the moving car): c.leap 0..1. It is
  // down on its hands, its hind legs driving it off; then stretched out flat in the air, the arms flung out ahead, the
  // long legs trailing straight out behind, its mouth wide; then nose down, the hands reaching for the road and the legs
  // coming up under it. Drawn facing right; c.runDir -1 mirrors it. (How high it is off the road is the night's: c.yOff)
  drawLeap(ctx, c, P) {
    const k = clamp(c.leap || 0, 0, 1), t = c.t, lit = c.lit || 0;
    const skinC = mixc([84, 78, 72], [118, 111, 103], lit), skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.56)), dark = P.col([34, 26, 29]), mouthC = P.col([12, 6, 8]);
    const tri = (a, b, d) => (k < 0.4 ? lerp(a, b, smoothstep(k / 0.4)) : lerp(b, d, smoothstep((k - 0.4) / 0.6)));   // off the ground, in the air, coming down
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    ctx.translate(0, 0.5); ctx.rotate(tri(0.42, 0.1, -0.4)); ctx.translate(0, -0.5);
    const limb = (hx, hy, kx, ky, fx, fy, a, col, w) => { P_limb(ctx, [[hx, hy], [kx, ky], [fx, fy]], w, col); fingers(ctx, fx, fy, a, 0.5, 0.14, 0.018, col); };
    const arm = (o, col, w) => limb(0.3, 0.52, tri(0.52, 0.74, 0.62), tri(0.92, 0.68 + o, 0.56 + o), tri(0.6, 1.16, 0.98), tri(0.16, 0.52 + o * 1.6, 0.04 + o), tri(0.2, 0.1, -0.7), col, w);
    const leg = (o, col, w) => limb(-0.3, 0.5, tri(-0.5, -0.8, -0.4), tri(0.95, 0.6 + o, 0.92 + o), tri(-0.66, -1.26, -0.56), tri(0, 0.44 - o * 1.6, 0.32 - o), Math.PI - tri(0.2, -0.25, 0.5), col, w);
    leg(0.09, skinD, 0.06); arm(0.1, skinD, 0.065);                                                       // the far pair
    ctx.fillStyle = skin;                                                                                 // the back, long and low
    ctx.beginPath(); ctx.moveTo(-0.62, 0.36); ctx.bezierCurveTo(-0.5, tri(0.9, 0.74, 0.86), 0.3, tri(0.92, 0.76, 0.9), 0.56, 0.4); ctx.lineTo(0.5, 0.3); ctx.bezierCurveTo(0.2, 0.36, -0.3, 0.3, -0.62, 0.36); ctx.fill();
    for (let i = 0; i < 7; i++) { const x = -0.48 + i * 0.15, y = 0.4 + tri(0.42, 0.3, 0.4) * Math.sin((x + 0.62) / 1.18 * Math.PI) - 0.04; P_ell(ctx, x, y, 0.035, 0.026, skinD); }   // the spine
    ctx.save(); ctx.translate(0.72, 0.38); ctx.rotate(tri(0.1, -0.1, 0.3) + Math.sin(t * 40) * 0.04);   // the head, out in front, its hair streaming back
    for (let i = 0; i < 7; i++) P_line(ctx, -0.04, 0.08 - i * 0.02, -0.38 - i * 0.03 + Math.sin(t * 30 + i) * 0.03, 0.12 - i * 0.03, 0.016, dark);
    P_ell(ctx, 0, 0, 0.15, 0.12, skin);
    P_ell(ctx, 0.03, 0.04, 0.11, 0.05, skinD);                        // the brow
    P_ell(ctx, 0.09, -0.05, 0.07, 0.075, mouthC);                     // the mouth, wide open
    for (let i = 0; i < 3; i++) P_line(ctx, 0.06 + i * 0.03, 0.015, 0.06 + i * 0.03, -0.02, 0.01, skin);
    ctx.restore();
    leg(-0.07, skin, 0.07); arm(-0.08, skin, 0.075);                                                      // the near pair, over the body
    ctx.restore();
  },

  // ---- hit by a car (The Road: you drove straight into it) ----
  // What it does from the moment the car hits it, T seconds on. It is knocked back off the bumper and down the road,
  // turning over twice in the air, its limbs thrown about; it comes down at STRUCK.land, bounces low and slides to where
  // it lies (STRUCK.rest), a heap in the road: on its side, its head on the tarmac, one arm bent up into the air. It
  // lies a beat. At STRUCK.twitch that arm jerks, and again (STRUCK.jerks). From STRUCK.rise it gets its limbs under it
  // one at a time, the raised arm first, its head still hanging on one side; from STRUCK.stand it stands up on its hind
  // legs, in jolts (a crack of its joints at each: STRUCK.cracks), taller than a man, bow-legged, its arms hanging to
  // its knees; at STRUCK.look the head snaps up straight at you and the mouth opens; and at STRUCK.go it comes, as it
  // is, up on its hind legs (the night lets it go from there: c.up, drawUp).
  // struck(T, K) is that as numbers, by the times K (STRUCK, or knock(gentle): the same, but for reduced motion it is
  // knocked back lower and turns over once): stage (thrown, down, twitch, rise, look); along (0 at the bumper to 1
  // where it lies); y (how high off the road, m); spin (how far over it has turned); fl (its limbs flung out, in the
  // air); down (1 in a heap, 0 on all fours); up (1 standing); tw (a jerk, now); hang (the head on one side); look (the
  // head up at you). braced(p, e) is one of those, p, brought e (0..1) of the way to standing with its head up at you
  // and its mouth open: out of the heap, or the rest of the way up, whichever it was (The Road: the car comes at it a
  // second time).
  STRUCK: { land: 0.8, rest: 1.45, twitch: 1.95, rise: 2.4, stand: 3.3, look: 4.4, go: 5.1, jerks: [1.95, 2.2], cracks: [2.4, 3.3, 3.6, 3.95], high: 1.55, turns: 2 },
  knock(gentle) { return gentle ? Object.assign({}, this.STRUCK, { high: 0.6, turns: 1 }) : this.STRUCK; },
  braced(p, e) { return Object.assign({}, p, { down: p.down * (1 - e), up: lerp(p.up, 1, e), hang: p.hang * (1 - e), look: Math.max(p.look, e), tw: p.tw * (1 - e), fl: p.fl * (1 - e), y: p.y * (1 - e) }); },
  struck(T, K) {
    K = K || this.STRUCK;
    const fl = clamp(T / K.land, 0, 1), bo = clamp((T - K.land) / 0.36, 0, 1), lie = smoothstep((T - K.land + 0.12) / (K.rest - K.land + 0.12));
    const jolt = k => { const n = 3, i = Math.min(n - 1, Math.floor(k * n)); return (i + smoothstep((k * n - i) / 0.4)) / n; };   // up in three jolts, a wait after each
    const look = smoothstep((T - K.look) / 0.09);
    return {
      stage: T < K.rest ? 'thrown' : T < K.twitch ? 'down' : T < K.rise ? 'twitch' : T < K.look ? 'rise' : 'look',
      along: 1 - Math.pow(1 - clamp(T / K.rest, 0, 1), 2.2),
      y: T < K.land ? K.high * 4 * fl * (1 - fl) : 0.22 * 4 * bo * (1 - bo),
      spin: TAU * K.turns * Math.pow(1 - clamp(T / (K.land + 0.3), 0, 1), 1.3),
      fl: smoothstep(T / 0.12) * (1 - lie),
      down: T < K.rise ? lie : 1 - clamp((T - K.rise) / (K.stand - K.rise), 0, 1),
      up: T < K.stand ? 0 : jolt(clamp((T - K.stand) / ((K.look - K.stand) * 0.87), 0, 1)),
      tw: K.jerks.reduce((m, tj) => { const x = (T - tj) / 0.24; return x > 0 && x < 1 ? Math.max(m, Math.sin(Math.PI * Math.sqrt(x))) : m; }, 0),
      hang: clamp(T / K.rest, 0, 1) * (1 - look),
      look,
    };
  },
  // Its shapes then, each the same parts as numbers, so one goes over into the next part by part: the trunk (its base, how
  // high its dome is drawn to, its half width), the head (x, y, how far it is tipped over), and four limbs (root, joint
  // and end, x and y, and the way the fingers point): the hind legs, then the arms. crawl is its usual shape on all fours;
  // up, standing on its hind legs. Up, it dies in shapes of its own: rear (drawn up to its full height at the glass, on
  // its toes, its arms flung up over its head), throw (thrown forward onto the bonnet at you, arms first: seen head on,
  // its trunk foreshortened, its arms out wide to take you, its legs kicked up behind it), crouch (gathered low to spring,
  // the knees out, the arms swung down and back) and dive (in the air over the bonnet, stretched, its arms thrown up and
  // forward over its head, its long legs hanging under it)
  POSES: {
    crawl: [0.26, 1.02, 0.44, 0, 0.3, 0, -0.2, 0.55, -0.86, 0.78, -0.98, 0.02, 2.94, 0.2, 0.55, 0.86, 0.78, 0.98, 0.02, 0.2, -0.28, 0.6, -0.64, 0.98, -0.6, 0.02, 2.79, 0.28, 0.6, 0.64, 0.98, 0.6, 0.02, 0.35],
    heap: [0, 0.5, 0.5, -0.56, 0.13, 1.25, -0.1, 0.2, 0.15, 0.52, 0.5, 0.3, 0.3, 0.25, 0.18, 0.72, 0.62, 1.02, 0.04, 0.1, -0.3, 0.2, -0.8, 0.14, -1.08, 0.03, 3.3, 0.1, 0.3, 0.3, 0.78, 0.56, 0.6, 0.9],
    flail: [0.15, 0.8, 0.38, 0, 0.2, 0.4, -0.2, 0.5, -0.7, 0.95, -1.1, 0.7, 2.6, 0.2, 0.5, 0.8, 0.75, 1.15, 1, 0.6, -0.28, 0.5, -0.75, 0.3, -1.05, -0.1, 3.6, 0.28, 0.5, 0.7, 0.15, 0.95, -0.25, -0.5],
    up: [0.9, 1.98, 0.27, 0.1, 1.74, 0.95, -0.15, 0.96, -0.52, 0.52, -0.3, 0.02, 2.94, 0.15, 0.96, 0.44, 0.6, 0.26, 0.02, 0.2, -0.25, 1.55, -0.6, 1.1, -0.5, 0.45, 4.6, 0.25, 1.55, 0.66, 1.22, 0.62, 0.52, -1.45],
    rear: [0.98, 2.12, 0.26, 0, 1.9, 0, -0.15, 1.04, -0.38, 0.55, -0.26, 0.06, 3.6, 0.15, 1.04, 0.4, 0.57, 0.27, 0.06, -0.45, -0.24, 1.68, -0.72, 1.98, -1.0, 2.55, 2.0, 0.24, 1.68, 0.72, 1.98, 1.0, 2.55, 1.15],
    throw: [1.0, 1.5, 0.34, 0, 1.32, 0, -0.15, 1.05, -0.38, 1.12, -0.3, 1.55, 2.0, 0.15, 1.05, 0.4, 1.1, 0.3, 1.5, 1.1, -0.3, 1.3, -0.72, 1.64, -1.04, 1.42, 5.9, 0.3, 1.3, 0.72, 1.64, 1.04, 1.42, 3.5],
    crouch: [0.62, 1.62, 0.29, 0, 1.42, 0, -0.16, 0.66, -0.66, 0.62, -0.36, 0.02, 3.0, 0.16, 0.66, 0.66, 0.62, 0.36, 0.02, 0.14, -0.26, 1.3, -0.62, 0.95, -0.56, 0.42, 4.2, 0.26, 1.3, 0.62, 0.95, 0.56, 0.42, -1.1],
    dive: [0.95, 1.95, 0.3, 0, 1.62, 0, -0.15, 1.0, -0.3, 0.55, -0.12, -0.05, 4.4, 0.15, 1.0, 0.32, 0.52, 0.14, -0.08, -1.3, -0.27, 1.62, -0.6, 2.02, -0.98, 2.1, 0.3, 0.27, 1.62, 0.6, 2.02, 0.98, 2.1, 2.84],
  },
  drawStruck(ctx, c, P) {
    const p = c.struck, t = c.t, Z = this.POSES;
    // from one shape to another, each part in its own time (ks: the trunk, the head, the two hind legs, the two arms)
    const mix = this.mix, each = this.each;
    let q = p.down > 0 ? mix(Z.heap, Z.crawl, each(1 - p.down, [[0.3, 0.9], [0.6, 1], [0.55, 0.95], [0.15, 0.5], [0.45, 0.8], [0, 0.35]])) : Z.crawl;   // up out of the heap, the raised arm first
    if (p.up > 0) q = mix(q, Z.up, each(p.up, [[0.1, 0.8], [0.2, 0.9], [0, 0.6], [0, 0.55], [0.35, 1], [0.3, 0.95]]));           // the legs first, the arms trailing
    if (p.fl > 0) q = mix(q, Z.flail, [p.fl, p.fl, p.fl, p.fl, p.fl, p.fl]);
    else q = q.slice();
    const j = (k, f) => Math.sin(t * f + k * 2.1);
    if (p.fl > 0) for (const i of [10, 11, 17, 18, 24, 25, 31, 32]) q[i] += 0.07 * p.fl * j(i, 23);   // its limbs thrown about as it goes over
    if (p.tw > 0) {   // a jerk: the raised arm, the knee beside it, the head
      q[29] += 0.03 * p.tw * j(1, 61); q[31] += 0.13 * p.tw * j(2, 53); q[32] += 0.15 * p.tw * Math.abs(j(3, 47)); q[33] += 0.5 * p.tw * j(6, 39);
      q[16] += 0.09 * p.tw * j(4, 58); q[5] += 0.12 * p.tw * j(5, 44); q[1] += 0.025 * p.tw;
    }
    this.body(ctx, q, p, c, P, { sx: Math.sin(t * 1.3) * 0.035 * p.up });   // standing, it sways
  },
  mix: (a, b, ks) => a.map((v, i) => lerp(v, b[i], ks[i < 3 ? 0 : i < 6 ? 1 : 2 + Math.floor((i - 6) / 7)])),
  each: (u, w) => w.map(([a, b]) => smoothstep((u - a) / (b - a))),
  // a shape drawn: the hind legs, the trunk (standing, its hips and ribs down the front of it), the arms, the head. o: sx,
  // a sway of the trunk, the arms and the head from side to side; and (up and walking: drawUp) ox, oy, the hips shifted,
  // and tilt, the trunk leaned over about its hips, the roots of its limbs and its head going with it, the knees, feet,
  // elbows and hands staying where q has them. p: as struck has it (up, look, hang, tw, spin; open, how wide the mouth is)
  body(ctx, q, p, c, P, o) {
    const t = c.t, lit = c.lit || 0;
    const skinC = mixc([84, 78, 72], [118, 111, 103], lit), skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.56)), dark = P.col([34, 26, 29]), mouthC = P.col([12, 6, 8]);
    const sx = o.sx || 0, ox = o.ox || 0, oy = o.oy || 0, tl = o.tilt || 0, cs = Math.cos(tl), sn = Math.sin(tl), b0 = q[0], b1 = q[1], hw = q[2];
    const tf = (x, y) => [ox + x * cs - (y - b0) * sn, oy + b0 + x * sn + (y - b0) * cs];
    const j = (k, f) => Math.sin(t * f + k * 2.1);
    ctx.save();
    if (p.spin) { ctx.translate(0, 0.42); ctx.rotate(p.spin); ctx.translate(0, -0.42); }
    const limb = (i, w, col, fl, fw, s) => { const r = tf(q[i], q[i + 1]); P_limb(ctx, [[r[0] + s, r[1]], [q[i + 2] + s, q[i + 3]], [q[i + 4] + s, q[i + 5]]], w, col); fingers(ctx, q[i + 4] + s, q[i + 5], q[i + 6], 0.37, fl, fw, col); };
    limb(6, 0.07, skinD, 0.13, 0.02, 0); limb(13, 0.07, skinD, 0.13, 0.02, 0);
    // its shoulders: from each arm's root in toward the middle of the trunk and down, thick, under the trunk's edge (drawn
    // before it), so the arm comes out of the body wherever the trunk is narrow at the top, leans, hitches or sways; the
    // root a knob of bone. All in the trunk's own frame (tf, and the sway as the dome's top has it), so it goes with it
    for (const i of [20, 27]) {
      const r = tf(q[i], q[i + 1]), m = tf(q[i] * 0.3, q[i + 1] - 0.14), ax = r[0] + sx, ay = r[1], bx = m[0] + sx * 0.75, by = m[1];
      const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      ctx.fillStyle = skin; ctx.beginPath();
      ctx.moveTo(ax + nx * 0.044, ay + ny * 0.044); ctx.lineTo(bx + nx * 0.08, by + ny * 0.08); ctx.lineTo(bx - nx * 0.08, by - ny * 0.08); ctx.lineTo(ax - nx * 0.044, ay - ny * 0.044); ctx.fill();
      P_ell(ctx, ax, ay, 0.048, 0.048, skin); P_ell(ctx, bx, by, 0.08, 0.08, skin);
    }
    // the back (standing, its trunk, the hips under it), the spine showing along it
    ctx.save(); ctx.translate(ox, oy + b0); ctx.rotate(tl); ctx.translate(0, -b0);
    const X = [-hw, -hw * 0.91 + sx, hw * 0.91 + sx, hw], Y = [b0, b1, b1, b0];
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
    ctx.restore();
    limb(20, 0.075, skin, 0.16, 0.022, sx); limb(27, 0.075, skin, 0.16, 0.022, sx);
    // the head: tipped over on one side until it looks at you, its hair hanging (short where it lies on the road)
    const h = tf(lerp(q[3], 0, p.look) + sx * 1.2, q[4] + 0.06 * p.look * p.up), hy = h[1];
    const open = p.open !== undefined ? p.open : 0.2 + p.look * 0.62 + p.tw * 0.25;
    ctx.translate(h[0], hy);
    strands(ctx, 0, 0.06, 9, Math.min(0.28, hy + 0.04), dark, 3, t);
    ctx.rotate(lerp(lerp(q[5], 0.95, p.hang), 0, p.look) + tl * 0.6 + (o.roll || 0) + (p.look ? Math.sin(t * 31) * 0.03 * p.look : 0));
    P_ell(ctx, 0, 0, 0.16, 0.125, skin);
    P_ell(ctx, 0, 0.04, 0.12, 0.06, skinD);
    const mw = 0.05 + open * 0.07, mh = 0.025 + open * 0.09;
    P_ell(ctx, 0, -0.045, mw, mh, mouthC);
    if (open > 0.5) for (let i = -2; i <= 2; i++) P_line(ctx, i * mw * 0.35, -0.045 + mh * 0.9, i * mw * 0.35, -0.045 + mh * 0.45, 0.012, skin);
    ctx.restore();
  },

  // ---- up on its hind legs (The Road: hit by the car, it got up, and it stays up) ----
  // It comes back at the car standing, as nothing that goes on all fours should: too tall, bow-legged, and hurt. Its
  // stride (c.up.ph, two steps to 2π) is a hitch and a drag. The hitch (the first half, quick: UP.lurch): its left leg,
  // the bad one, takes its weight and buckles, the trunk dropping and lurching over that way, while the right leg is
  // snatched up and flung down again; now and then the buckle goes deeper, a stagger. The drag (slow: UP.drag): the left
  // leg is hauled after it stiff, swung out in an arc and back, the hip hiked and the trunk leaned off it, the foot never
  // leaving the road, turned in, its toes scraping. Its arms hang to its knees, from wherever its shoulders have got to a
  // beat before, and swing wrong: the right with the right leg, the left one dead, flopping out and across after the
  // trunk as it lurches. Its head lolls over on one side and rolls with each lurch, then (every other stride) snaps up straight
  // at you, the mouth open, holds there shaking, and lolls again; near the car it no longer looks away. The closer it is,
  // the quicker the stride (UP.rate, by how near: UP.near metres out to the catch), and the faster it comes (UP.v, the
  // hitch and the drag, times 1 + UP.quick by how near). c.up.w is how far it is walking (0 standing: the night freezes
  // it, and it eases to a stand); rush, it comes as fast as it can (the car coming at it); sink, how far below
  // where it is it is drawn (a night lifting its face to your eye lifts it this way, so the thing's box stays in the view).
  UP: { rate: [1.6, 2.8], lurch: 1.6, drag: 0.72, v: [1.75, 0.49], quick: 1.1, near: 11, rush: 2.2, ease: 3 },
  upright() { return { ph: 0.75 * 2 * TAU, w: 0, rush: false, stare: 0, crouch: 0, lunge: 0, dive: 0, sink: 0 }; },
  upSpeed(c, dt) {
    const u = c.up, U = this.UP, n = clamp(1 - (c.dist - c.catchDist) / U.near, 0, 1), hitch = ((u.ph % TAU) + TAU) % TAU < Math.PI;
    u.w += ((c.frozen && !u.rush ? 0 : 1) - u.w) * Math.min(1, dt * U.ease * (u.rush ? 3 : 1));
    u.ph += dt * Math.PI * lerp(U.rate[0], U.rate[1], n * n) * (hitch ? U.lurch : U.drag) * (u.rush ? U.rush : 1) * Math.max(0.35, u.w);
    return (hitch ? U.v[0] : U.v[1]) * (1 + U.quick * n * n) * u.w;
  },
  // how far its head is up at you (0 lolling), by where it is in its stride, and how near it is (0..1)
  upLook(ph, n) {
    const f = ((ph / (2 * TAU)) % 1 + 1) % 1;
    const k = f < 0.62 ? 0 : f < 0.645 ? smoothstep((f - 0.62) / 0.025) : f < 0.88 ? 1 : 1 - smoothstep((f - 0.88) / 0.12);
    return Math.max(k, smoothstep((n - 0.55) / 0.3));
  },
  // a joint between a root and an end, its two lengths kept (the bend to side s): the end is pulled in if out of reach
  ik(ax, ay, bx, by, l1, l2, s) {
    let dx = bx - ax, dy = by - ay; const d0 = Math.hypot(dx, dy) || 1e-6, d = clamp(d0, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
    dx /= d0; dy /= d0;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return [ax + dx * a - dy * h * s, ay + dy * a + dx * h * s, ax + dx * d, ay + dy * d];
  },
  drawUp(ctx, c, P) {
    const u = c.up, Z = this.POSES, U0 = Z.up, t = c.t, w = u.w, a = ((u.ph % TAU) + TAU) % TAU;
    const n = clamp(1 - (c.dist - c.catchDist) / this.UP.near, 0, 1);
    const sA = a < Math.PI ? Math.sin(a) : 0, sB = a >= Math.PI ? Math.sin(a - Math.PI) : 0;
    const k = Math.floor(u.ph / TAU), rnd = x => { const v = Math.sin(x * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    const deep = 1 + 0.55 * smoothstep((rnd(k) - 0.55) / 0.1);   // a stagger, now and then (only ever changing between strides)
    const sx = Math.sin(t * 1.3) * 0.035 * (1 - w);   // standing, it sways
    // the trunk at a point of the stride: over the buckling bad leg in the hitch, dropped and leaned hard over it; hiked
    // up off it and leaned back the other way in the drag
    const at = a => {
      a = ((a % TAU) + TAU) % TAU;
      const A = a < Math.PI ? Math.sin(a) : 0, B = a >= Math.PI ? Math.sin(a - Math.PI) : 0;
      return [w * (0.08 * A * deep - 0.1 * B), w * (-0.09 * Math.pow(A, 0.7) * deep + 0.07 * B), w * (-0.13 * A * deep + 0.17 * B + 0.03 * Math.sin(a * 3 + 1))];
    };
    const [ox, oy, tilt] = at(a), b0 = U0[0];
    const tfAt = ([ox, oy, tl], x, y) => { const cs = Math.cos(tl), sn = Math.sin(tl); return [ox + x * cs - (y - b0) * sn, oy + b0 + x * sn + (y - b0) * cs]; };
    const tf = (x, y) => tfAt([ox, oy, tilt], x, y);
    const q = U0.slice();
    const len = (i, j) => Math.hypot(U0[i] - U0[j], U0[i + 1] - U0[j + 1]);
    const bend = i => Math.sign((U0[i + 2] - U0[i]) * (U0[i + 5] - U0[i + 1]) - (U0[i + 3] - U0[i + 1]) * (U0[i + 4] - U0[i]));
    // a limb from its root (where the trunk has it now) to the end given: the joint found, its lengths as they stand
    const set = (i, ex, ey, ang, s) => {
      const r = tf(U0[i], U0[i + 1]), J = this.ik(r[0] + s, r[1], ex + s, ey, len(i, i + 2), len(i + 2, i + 4), -bend(i));
      q[i + 2] = J[0] - s; q[i + 3] = J[1]; q[i + 4] = J[2] - s; q[i + 5] = J[3]; q[i + 6] = ang;
    };
    // the legs (drawn facing you: its right on your left): the right snatched up high and flung down in the hitch; the
    // left, the bad one, dragged stiff in an arc out to the side and back, its toes scraping, turned in
    set(6, U0[10] + w * 0.03 * sA, U0[11] + w * 0.17 * Math.pow(sA, 0.6), U0[12] - w * 0.6 * sA, 0);
    set(13, U0[17] + w * 0.28 * Math.pow(sB, 0.8), U0[18] + w * 0.04 * sB, U0[19] - w * 1.2 * sB, 0);
    // the arms hang from where the shoulders are, a beat late, as dead weight does: the right swung up with the right leg
    // (the wrong way); the left dead, later, flopping out and across after each lurch and dragging low; both coming up
    // for you as it nears
    const hang = (i, lag, f) => { const r0 = tfAt(at(a - lag), U0[i], U0[i + 1]); return [(r0[0] - U0[i]) * f, (r0[1] - U0[i + 1]) * f]; };
    const reach = n * n * w, hR = hang(20, 0.35, 0.85), hL = hang(27, 1.1, 1.1), fl = Math.sin(a - 1.6);
    set(20, U0[24] + hR[0] + w * 0.06 * sA - reach * 0.12, U0[25] + hR[1] + w * 0.13 * sA + reach * 0.35, U0[26] - w * 0.3 * sA, sx);
    set(27, U0[31] + hL[0] + w * 0.1 * fl - reach * 0.05, U0[32] + hL[1] - w * 0.08 + reach * 0.3, U0[33] + w * 0.45 * fl, sx);
    // the head: lolling, rolling with each lurch, then snapping up at you
    let look = Math.max(this.upLook(u.ph, n), u.stare);
    q[3] = U0[3] + w * (1 - look) * 0.07 * Math.sin(a + 0.4);
    let p = { up: 1, look, hang: 1 - look, tw: 0, spin: 0 }, o = { sx, ox, oy, tilt, roll: w * (1 - look) * 0.35 * Math.sin(a - 0.5) };
    // and out of that into its shapes for the end: gathered to spring, in the air at you; or reared up, and thrown at you
    const into = (Q, ks) => {
      const e = Math.max(...ks);
      if (e <= 0) return;
      const m = this.mix(q, Q, ks), f = 1 - ks[0];
      for (let i = 0; i < q.length; i++) q[i] = m[i];
      o = { sx: o.sx * f, ox: o.ox * f, oy: o.oy * f, tilt: o.tilt * f, roll: o.roll * f };
      look = Math.max(look, smoothstep(e * 2)); p = { up: 1, look, hang: 1 - look, tw: 0, spin: 0, open: lerp(p.open !== undefined ? p.open : 0.2 + look * 0.62, 1.25, e) };
    };
    const E = (x, a, b) => smoothstep((x - a) / (b - a));
    if (u.crouch > 0) { const e = u.crouch; into(Z.crouch, [E(e, 0, 0.8), E(e, 0, 0.9), E(e, 0, 0.7), E(e, 0, 0.7), E(e, 0.1, 1), E(e, 0.1, 1)]); }
    if (u.dive > 0) { const e = u.dive; into(Z.dive, [E(e, 0.1, 0.7), E(e, 0.15, 0.8), E(e, 0.2, 1), E(e, 0.25, 1), E(e, 0, 0.55), E(e, 0, 0.5)]); }   // the arms first
    if (u.lunge > 0) {
      const e = u.lunge, e1 = E(e, 0, 0.35), e2 = E(e, 0.3, 0.8);
      into(Z.rear, [E(e1, 0, 0.9), E(e1, 0, 1), E(e1, 0.1, 1), E(e1, 0.1, 1), E(e1, 0, 0.7), E(e1, 0, 0.7)]);
      into(Z.throw, [E(e2, 0.2, 0.9), E(e2, 0.25, 1), E(e2, 0.35, 1), E(e2, 0.35, 1), E(e2, 0, 0.6), E(e2, 0, 0.6)]);   // the arms first
    }
    if (u.sink) ctx.translate(0, -u.sink);   // (drawn lower than it stands: see sink)
    this.body(ctx, q, p, c, P, o);
  }
};
