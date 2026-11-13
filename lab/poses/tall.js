'use strict';
// Night 12, The Bedroom: the tall one (js/creatures/tall.js; its moves are set by js/levels/night12.js)
// Everything here is laid out as night 12 has it, across its way in: the middle of the opening at x 0, the thing c.lat to the
// side of it, and the props (the wall and the frame, the closet, the foot of the bed, its hands on the covers) in the plane it
// stands in, as they line up with it from your eye in the bed.
(() => {
  const CR = CREATURES.tall, EYE = 1.15, SIDE = 1, BEHIND = 0.3;   // it stands to the right of the opening, 0.3 m behind the edge
  // night 12's two ways in (WAYS): the opening (apZ, its half-width edge, its top), where it peers from, its place at the bed
  const DOOR = { apZ: 3.6, edge: 0.5, top: 2.1, peerD: 4.1, spot: { d: 2.08, lat: 0 }, hands: [[-0.3, 1.86], [0.3, 1.86]], to: [[-0.2, 0.45], [0.2, 0.45]] };
  const CLOSET = { apZ: 3.2, edge: 0.9, top: 2.2, peerD: 3.4, spot: { d: 1.07, lat: 1.5 } };
  const PACE = DOOR.peerD / 70;   // its start (held to the doorway's maxStart, 4.1 m) over time 70: its pace while you watch it
  const CLEAR = 0.1, DEPTH = 0.12, CEILING = 2.5;
  const DUCK = { flinch: 0.5, down: 1.5, up: 1.2, look: 1.1, reach: 1.1 };
  const GRAB = { start: 0.6, every: 1.0, pulls: 10, drag: 0.07 }, REACH = 0.4, CLOSE = 0.55, DRAG = 0.85, RISE = 3.2;
  const BED_TOP = 0.6, BED_FOOT = 1.9, BED_X = 0.77, HAND = [10, 9, 12], BLANKET = [80, 84, 108];
  // how it stands at the opening (night 12's place): peering round the edge far back, stepping out into it as it comes on
  function place(c, w) {
    const o = clamp((w.peerD - c.dist) / (w.peerD - w.apZ + 0.05), 0, 1);
    c.peerSide = -SIDE; c.peer = 1 - smoothstep(o / 0.6);
    c.lat = SIDE * (w.edge * c.dist / w.apZ + BEHIND) * (1 - smoothstep(o));
  }
  // what the wall hides of it while it is behind the opening, and the lintel it stoops under (night 12's dynamic)
  function headroom(c, w) {
    const e = c.dist - w.apZ;
    if (e > 0) return Math.min(EYE + (w.top - EYE) * c.dist / w.apZ - 0.02, w.top - CLEAR + 0.6 * Math.max(0, e - 0.15));
    if (e > -DEPTH) return w.top - CLEAR;
    return lerp(w.top - CLEAR, CEILING - 0.05, smoothstep((-e - DEPTH) / 1.2));
  }
  function frame(c, w, duck) {
    const e = w.edge * c.dist / w.apZ, behind = c.dist > w.apZ + 0.01;
    c.showX = behind ? [-e - c.lat, e - c.lat] : null;
    c.showTop = behind ? EYE + (w.top - EYE) * c.dist / w.apZ : undefined;
    c.headroom = duck ? undefined : headroom(c, w);
  }
  // the foot of the bed, between you and it: below this line (from its feet) it is hidden
  const bedLine = d => (d >= BED_FOOT ? EYE - (EYE - BED_TOP) * d / BED_FOOT : BED_TOP);
  const hideBehindBed = c => { const y = bedLine(c.dist); c.hideBelow = y; c.hideTop = [[-1, y], [1, y]]; };
  // its legs as updateCreature moves them, from the distance it came this frame
  function step(c, dt, moved) {
    c.gait += Math.abs(moved) * CR.stepRate * Math.PI; c.moving = Math.abs(moved) > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  }
  const at = c => (ctx, cc, P) => { ctx.translate(cc.lat || 0, 0); CR.draw(ctx, cc, P); };
  // ---- props ----
  const wallC = [34, 30, 38], casing = [58, 50, 46], hall = [22, 21, 28];   // (the hall a shade lighter than its body, so it shows)
  // the wall with the opening in it, the opening's frame, and the dark beyond; in front of it while it is behind the opening
  function wall(ctx, P, w, d) {
    const k = d / w.apZ, e = w.edge * k, yT = EYE + (w.top - EYE) * k, cw = 0.07 * k;
    ctx.fillStyle = P.col(wallC); ctx.beginPath(); ctx.rect(-6, 0, 12, 6); ctx.rect(-e, 0, 2 * e, yT); ctx.fill('evenodd');   // (one shape: no seams)
    P_rect(ctx, -e - cw, 0, cw, yT + cw, P.col(casing)); P_rect(ctx, e, 0, cw, yT + cw, P.col(casing)); P_rect(ctx, -e - cw, yT, 2 * (e + cw), cw, P.col(casing));
  }
  const behindOpening = (w, inside) => (ctx, c, P) => {
    const k = c.dist / w.apZ, e = w.edge * k, yT = EYE + (w.top - EYE) * k;
    P_rect(ctx, -e, 0, 2 * e, yT, P.col(hall));
    if (inside) inside(ctx, c, P);
    if (c.dist <= w.apZ) wall(ctx, P, w, c.dist);   // through it, the wall is behind it
  };
  const clothes = (ctx, c, P) => {   // the closet's rail of hanging clothes, behind where it stands
    const k = c.dist / (CLOSET.peerD + 0.35), y = EYE + (1.95 - EYE) * k;
    P_rect(ctx, -1.6 * k, y, 3.4 * k, 0.025 * k, P.col([70, 66, 60]));
    const cols = [[52, 48, 62], [70, 40, 44], [44, 54, 50], [60, 58, 54], [38, 40, 56], [66, 54, 40], [48, 44, 48]];
    for (let i = 0; i < 9; i++) {
      const x = (-1.45 + i * 0.36) * k, l = (0.75 + 0.35 * ((i * 7) % 3) / 2) * k, wd = 0.15 * k;
      P_line(ctx, x, y + 0.02 * k, x, y - 0.06 * k, 0.012 * k, P.col([90, 86, 80]));
      P_poly(ctx, [[x - wd, y - 0.06 * k], [x + wd, y - 0.06 * k], [x + wd * 1.15, y - l], [x - wd * 1.15, y - l]], P.col(cols[i % cols.length]));
    }
  };
  const frontOfOpening = w => (ctx, c, P) => {
    if (c.dist <= w.apZ) return;
    wall(ctx, P, w, c.dist);
    // peering, its long fingers curled round the edge of the frame by its face (night 12 draws them over the frame)
    if ((c.peer || 0) > 0.3) {
      const k = c.dist / w.apZ, kk = smoothstep((c.peer - 0.3) / 0.4), col = P.cola(HAND, kk);
      ctx.translate(SIDE * (w.edge + 0.02) * k, 1.7 - 0.07 * k); ctx.scale(k, k);
      for (let i = 0; i < 4; i++) {
        const y = 0.035 + i * 0.026, l = (i === 0 || i === 3 ? 0.045 : 0.058) * kk;
        P_limb(ctx, [[-SIDE * 0.03, y + 0.004], [SIDE * 0.005, y + 0.006], [SIDE * (0.005 + l), y - 0.006]], 0.013, col);
      }
    }
  };
  // one hand on the covers (night 12's drawGrip), in metres from the cloth under it
  function drawGrip(ctx, P, sd, r, h, cloth) {
    const col = P.cola(HAND, Math.min(1, r * 1.4)), open = h.open, bunch = h.bunch * (1 - h.lift), hy = 0.1 + h.lift * 0.05;
    if (bunch > 0.02) {
      const crease = P.cola(scalec(cloth, 0.6), 0.45 * bunch), ridge = P.cola(scalec(cloth, 1.12), 0.9 * bunch), fold = P.cola(scalec(cloth, 0.7), 0.7 * bunch);
      for (const dx of [-0.1, -0.045, 0.01, 0.06, 0.11]) P_line(ctx, dx * 1.15, 0.07 - 0.055 * bunch, dx * 0.35, 0.068, 0.012, crease);
      P_ell(ctx, 0, 0.074, 0.055 + 0.02 * bunch, 0.004 + 0.012 * bunch, fold);
      P_ell(ctx, 0, 0.078, 0.05 + 0.02 * bunch, 0.003 + 0.009 * bunch, ridge);
    }
    P_line(ctx, sd * 0.006, hy + 0.06, 0, hy + 0.01, 0.05, col);
    P_ell(ctx, 0, hy, 0.05, 0.032, col);
    for (let i = 0; i < 4; i++) {
      const x0 = (i - 1.5) * 0.022, l = (i === 0 || i === 3 ? 0.07 : 0.088) * (1 + 0.15 * open);
      const mid = [lerp(x0 * 1.1, x0 * 1.3, open), hy - 0.01 - l * lerp(0.42, 0.5, open)], tip = [lerp(x0 * 1.0 + sd * 0.004, x0 * 1.7, open), hy - 0.01 - l * lerp(0.3, 1.0, open)];
      P_limb(ctx, [[x0, hy - 0.01], mid, tip], 0.013, col);
      if (open < 0.5) P_ell(ctx, mid[0], mid[1], 0.009, 0.007, col);
    }
    P_limb(ctx, [[-sd * 0.045, hy], [-sd * lerp(0.045, 0.08, open), hy - 0.03], [-sd * lerp(0.03, 0.085, open), hy - lerp(0.05, 0.07, open)]], 0.013, col);
  }
  const REST = { k: 0, drag: 0, open: 0, lift: 0, bunch: 0.3 };
  // the foot of the bed in front of it, and its hands up over the edge onto the covers (as night 12 draws them)
  const bed = (ctx, c, P) => {
    const y = bedLine(c.dist), xw = BED_X * c.dist / BED_FOOT;
    P_rect(ctx, -xw, 0, 2 * xw, y, P.col(scalec(BLANKET, 0.82)));
    P_rect(ctx, -xw, y - 0.05, 2 * xw, 0.05, P.col(BLANKET));
    const r = (c.reach || 0) * (1 - (c.lunge || 0));
    if (r <= 0.01) return;
    DOOR.hands.forEach(([x0, z0], i) => {
      const h = (c.grab && c.grab.hands[i]) || REST, [x1, z1] = DOOR.to[i], dl = Math.hypot(x0 - x1, z0 - z1);
      const x = lerp(x0, x1, h.k) + (x0 - x1) / dl * GRAB.drag * h.drag, z = lerp(z0, z1, h.k) + (z0 - z1) / dl * GRAB.drag * h.drag;
      const ys = BED_TOP + 0.004 - 0.09 - (1 - r) * 0.14 + h.lift * 0.05, k = c.dist / z;
      ctx.save(); ctx.translate(x * k, EYE - (EYE - ys) * k); ctx.scale(k * 1.3, k * 1.3); drawGrip(ctx, P, x0 < 0 ? -1 : 1, r, h, BLANKET); ctx.restore();
    });
  };
  // its hands on the covers, pulling, as night 12's grabbing has them (gt seconds after they came onto the covers)
  function grabbing(c, t) {
    const per = Math.ceil(GRAB.pulls / 2), gt = t - GRAB.start;
    if (!c.grab) c.grab = { k: 0, hands: [0, 1].map(() => Object.assign({}, REST)) };
    if (gt < 0) return;
    const n = Math.min(GRAB.pulls - 1, Math.floor(gt / GRAB.every)), u = gt / GRAB.every - n;
    c.grab.k = Math.min(1, gt / (GRAB.pulls * GRAB.every));
    c.grab.hands.forEach((h, i) => {
      const done = Math.floor((n + 1 - i) / 2), k0 = Math.min(1, done / per);
      if (n % 2 !== i) { h.k = k0; h.drag = done ? 1 : 0; h.open = 0; h.lift = 0; h.bunch = done ? 1 : 0.3; return; }
      const k1 = Math.min(1, (done + 1) / per), r = smoothstep(u / REACH);
      h.k = lerp(k0, k1, r);
      h.lift = u < REACH ? Math.sin(Math.PI * u / REACH) : 0;
      h.open = u < REACH ? smoothstep(u / 0.15) : 1 - smoothstep((u - REACH) / (CLOSE - REACH));
      h.drag = u < REACH ? (done ? 1 - r : 0) : smoothstep((u - CLOSE) / (DRAG - CLOSE));
      h.bunch = u < REACH ? (done ? 1 - r : 0.3 * (1 - r)) : h.drag;
    });
  }
  // the light comes on (night 12's ducking), t seconds after it, from where it stood (D)
  function ducking(c, t, D, open) {
    const T2 = DUCK.down, T3 = T2 + D.creep, T4 = T3 + DUCK.up, T5 = T4 + DUCK.look, hide = open ? 0.6 : c.hideBelow;
    c.flinch = smoothstep(t / 0.2) * (1 - smoothstep((t - DUCK.flinch) / 0.5));
    c.duck = smoothstep((t - DUCK.flinch + 0.1) / (T2 - DUCK.flinch + 0.1));
    const m = smoothstep((t - T2 + 0.2) / D.creep), low = Math.max(hide - 0.4, 0.26);
    c.faceAway = smoothstep((t - T2 + 0.5) / 0.3) * (1 - smoothstep((t - T3) / 0.3));
    c.dist = lerp(D.d, D.spot.d, m);
    const gk = c.grab ? c.grab.k : 0;
    c.eyeTo = t < T3 ? low : lerp(low, hide + 0.07 + gk * 0.1, smoothstep((t - T3) / DUCK.up));
    c.reach = smoothstep((t - T5) / DUCK.reach); c.gripY = hide - 0.03;
    if (t >= T5) grabbing(c, t - T5);
  }
  const base = LAB.lunge();
  LAB.creature('tall', {
    night: 12, stage: 'The Bedroom', dist: DOOR.peerD, fit: { h: 2.5, w: 1.6 },
    anims: [
      { name: 'Peering round the door frame', note: 'Where it starts: behind the wall beside the doorway, only its head leaned out round the edge, its fingers curled round the frame.',
        dur: 6, fit: { h: 2.5, w: 1.9 }, draw: at(), back: behindOpening(DOOR), front: frontOfOpening(DOOR),
        set(c) { place(c, DOOR); frame(c, DOOR); } },
      { name: 'Peering out of the closet', note: 'The other way in: in the closet in front of the hanging clothes, behind the wall at the side, its head round the edge.',
        dist: CLOSET.peerD, dur: 6, fit: { h: 2.5, w: 2.6 }, draw: at(), back: behindOpening(CLOSET, clothes), front: frontOfOpening(CLOSET),
        set(c) { place(c, CLOSET); frame(c, CLOSET); } },
      { name: 'Coming out under the lintel', note: 'In extreme slow motion, at the pace it keeps while you watch: it steps out from behind the wall into the doorway, stooping under the top of the frame until it is through.',
        dur: (DOOR.peerD - 0.05 - 3.25) / PACE, walk: PACE, fit: { h: 2.5, w: 2.8 }, draw: at(), back: behindOpening(DOOR), front: frontOfOpening(DOOR),
        tick(c, k) { c.dist = lerp(DOOR.peerD - 0.05, 3.25, k); place(c, DOOR); frame(c, DOOR); } },
      { name: 'Bowing over the end of the bed', note: 'Into the room toward the foot of the bed: as it nears, its shoulders hunch up, its head comes down between them and its arms rise toward you.',
        dist: 2.6, dur: 0.65 / PACE, walk: PACE, front: bed,
        tick(c, k) { c.dist = lerp(2.6, 1.95, k); c.lat = 0; c.peer = 0; frame(c, DOOR); hideBehindBed(c); } },
      { name: 'The lamp comes on', note: 'At the foot of the bed as the lamp comes on: an arm across its face, it sinks down out of sight, comes up with only its eyes over the edge, and its hands come up onto the covers and pull.',
        dist: 1.95, dur: 7.4, lit: 0.26, front: bed,
        set(c) { c.inLight = true; c.flinchSide = 1; c.D = { d: 1.95, spot: DOOR.spot, creep: clamp(Math.abs(1.95 - DOOR.spot.d) * 1.1, 0.4, 2.2) }; hideBehindBed(c); },
        tick(c, k, dt, T) { const t = T - 0.3, prev = c.dist; c.headroom = undefined; hideBehindBed(c); if (t >= 0) ducking(c, t, c.D); else frame(c, DOOR); step(c, dt, c.dist - prev); } },
      { name: 'Down and along the floor, face down', note: 'Out of the closet when the lamp comes on: it folds down like a spider and goes along the floor to the side of the bed, its face turned down, only the dark of its head showing.',
        dist: 2.9, dur: 4.6, lit: 0.26,
        set(c) { c.inLight = true; c.flinchSide = 1; c.D = { d: 2.9, spot: CLOSET.spot, creep: clamp(Math.hypot(2.9 - CLOSET.spot.d, 0.3 - CLOSET.spot.lat) * 1.1, 0.4, 2.2) }; },
        tick(c, k, dt, T) { const t = T - 0.3, prev = c.dist; if (t >= 0) ducking(c, Math.min(t, DUCK.down + c.D.creep + 0.4), c.D, true); step(c, dt, c.dist - prev); } },
      { name: 'Rising again in the dark', note: 'The lamp goes out while it is down there: its hands let go, and it rises slowly from behind the bed to its full height.',
        dist: DOOR.spot.d, dur: RISE + 1, front: bed,
        set(c) { hideBehindBed(c); c.duck = 1; c.eyeTo = c.hideBelow + 0.08; c.reach = 1; c.gripY = c.hideBelow - 0.03; },
        tick(c, k, dt, T) { hideBehindBed(c); c.flinch = 0; c.faceAway = 0; c.reach = Math.max(0, c.reach - dt * 1.5); c.duck = 1 - smoothstep(T / RISE); frame(c, DOOR); } },
      { name: 'Taking the covers in the dark', note: 'The covers pulled up with the lamp off: a moment of nothing, then all at once it is at the bed, its hands on the covers, and it rips them away and is in your face.',
        dist: 2.6, dur: 2.2, zoom: true, still: true, front: bed,
        tick(c, k, dt, T) {
          const prev = c.dist; hideBehindBed(c); c.headroom = undefined;
          if (T < 0.86) { c.dist = lerp(2.6, DOOR.spot.d, easeIn(clamp((T - 0.3) / 0.3, 0, 1))); c.reach = smoothstep((T - 0.45) / 0.15); c.gripY = c.hideBelow - 0.03; step(c, dt, c.dist - prev); return; }
          if (!c.lungeFrom) { c.lungeFrom = c.dist; c.frozen = true; }
          const q = clamp((T - 0.86 - 0.05) / 0.4, 0, 1); c.lunge = q; c.dist = lerp(c.lungeFrom, 0.55, easeIn(q));
        } },
      LAB.lunge({ note: 'It reaches you in the dark: it straightens over the foot of the bed and leans in, slowly, until its face is all you can see.', dist: 1.9, dur: 2.6, front: bed,
        set(c) { base.set(c); hideBehindBed(c); }, tick(c, k, dt, T) { base.tick(c, k, dt, T); hideBehindBed(c); } }),
    ],
  });
})();
