'use strict';
// Night 9, The Phone Booth: the shade (js/creatures/signalman.js; its moves are set by js/levels/night09.js)
(() => {
  const CR = CREATURES.signalman;
  // night09 planMan: at each street lamp it stands lit a few seconds, utterly still, then reaches up (UP), takes hold (GRIP),
  // breaks it, lets its arm come back down (DOWN) and stands a beat in the dark (BEAT); then skitters on to the next (about
  // 11 m a second, in bursts), and after the last walks across to the booth (2 m a second)
  const UP = 0.6, GRIP = 0.2, DOWN = 0.4, BEAT = 0.3, RUSH_V = 11, WALK_V = 2.0;
  // a lamp as it stands from where it stands behind one on the cross street (measured in the night: 30.6 m out, the lamp
  // 0.6 m nearer): its post just to its left, peering round it, the arm out over the road to its right, the head at 4.8 m
  const LAMP = { post: -0.2, reach: { x: 0.9, y: 4.82 }, k: 1.02 };
  const lampY = y => G.L.eyeH + (y - G.L.eyeH) * LAMP.k;   // a height on the post, as it shows at its distance
  // a lamp's level (night09 lampLevel): 1 burning; broken, a white flare, a stutter, and out
  const level = (c, T) => {
    if (c.labOut === undefined) return 1;
    const k = T - c.labOut;
    if (k < 0.07) return 1.8;
    if (k > 0.5) return 0;
    return (Math.sin(k * 97) > 0.1 ? 0.75 : 0.06) * (1 - k / 0.5);
  };
  // the lamp post, in front of it: the post, the arm over the road, the head and its lens (lit, flaring, or broken), the
  // glow round it, and the sparks and glass that come down out of it when it breaks
  const lamp = (ctx, c, P) => {
    const T = c.labT || 0, lv = level(c, T), post = P.col([30, 32, 34], 0.3), hx = LAMP.reach.x, top = lampY(5.0), arm = lampY(4.92);
    P_rect(ctx, LAMP.post - 0.07, lampY(0), 0.14, top - lampY(0), post);
    P_rect(ctx, LAMP.post, arm, hx - LAMP.post, lampY(5.02) - arm, post);
    P_rect(ctx, hx - 0.22, lampY(4.86), 0.44, lampY(4.98) - lampY(4.86), P.col([40, 40, 42]));
    const ly = lampY(4.78);
    if (lv > 0.03) {
      P_ell(ctx, hx, ly, 0.18, 0.05, P.raw(mixc([90, 60, 40], lv > 1 ? [255, 250, 236] : [255, 196, 120], Math.min(1, lv))));
      const r = lv > 1 ? 3.2 : 1.7, a = 0.22 * Math.min(1, lv) + (lv > 1 ? 0.5 : 0), g = ctx.createRadialGradient(hx, ly, 0, hx, ly, r);
      g.addColorStop(0, rgba([255, 170, 90], a)); g.addColorStop(1, rgba([255, 170, 90], 0));
      ctx.fillStyle = g; ctx.fillRect(hx - r, ly - r, 2 * r, 2 * r);
    } else {
      P_ell(ctx, hx, ly, 0.18, 0.05, P.raw([26, 24, 24]));
      P_poly(ctx, [[-0.5, 0.5], [-0.32, 0.12], [-0.2, 0.44], [-0.05, 0.05], [0.1, 0.38], [0.26, 0.1], [0.5, 0.5]].map(([x, y]) => [hx + x * 0.36, ly - 0.05 + y * 0.1]), P.raw([58, 56, 58]));
    }
    if (c.labOut !== undefined) {   // sparks and glass, falling (night09 breakLamp: 26 of them, 9 of them glass)
      const rnd = mulberry32(7717), e = T - c.labOut;
      for (let k = 0; k < 26; k++) {
        const isGlass = k < 9, a = rnd() * TAU, v = isGlass ? 0.4 + rnd() * 0.8 : 0.8 + rnd() * 2.2, vy0 = isGlass ? -0.2 - rnd() * 0.5 : rnd() * 1.6 - 0.3, life = isGlass ? 1.2 : 0.35 + rnd() * 0.8;
        if (e < 0 || e > life) continue;
        const g = 9.8 * (isGlass ? 1 : 0.6), vx = Math.cos(a) * v, x = hx + vx * e, y = Math.max(0, ly + vy0 * e - g * e * e / 2), vy = vy0 - g * e, age = e / life;
        ctx.strokeStyle = isGlass ? rgba([200, 214, 226], 0.7 * (1 - age)) : rgba(mixc([255, 250, 210], [255, 120, 40], age), 1 - age * 0.7);
        ctx.lineWidth = isGlass ? 0.03 : 0.022; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - vx * 0.035, y - vy * 0.035); ctx.stroke();
      }
    }
  };
  const atLamp = c => { c.reachTo = { x: LAMP.reach.x, y: LAMP.reach.y }; c.reachSide = 1; c.lampLit = 1; c.labT = 0; };
  const FIT = { h: 5.3, w: 2.6 }, NEAR = { h: 2.85, w: 1.1 };   // all of the lamp; or it, close, under the glow
  // the skitter from one lamp to the next, 14 m nearer (night09 manNow, a 'rush' segment: in bursts, twitching side to side)
  const GAP = 14, RUSH_T = Math.max(1.0, GAP / RUSH_V), NB = Math.max(2, Math.round(GAP / 4)), LEAD = BEAT;
  LAB.creature('signalman', {
    night: 9, stage: 'The Phone Booth', dist: 30.6, lit: 0, fit: { h: 2.85, w: 1.2 },
    anims: [
      { name: 'Standing behind a lamp', note: 'At each street lamp it stands utterly still behind the post, peering round it. The lamp finds no face: only the two small pale points of its eyes, and a faint rim along its shoulder.',
        dist: 30.6, dur: 4, lit: 0.45, fit: NEAR, set: atLamp, tick(c, k, dt, T) { c.labT = T; }, front: lamp },
      { name: 'Its head snaps round to you', note: 'Looked at after a while unwatched: its head is turned aside, and a moment later it snaps round to you.',
        dist: 30.6, dur: 1.6, lit: 0.45, fit: NEAR, modes: true, seen: true, set: atLamp, tick(c, k, dt, T) { c.labT = T; }, front: lamp },
      { name: 'Reaching up and breaking the lamp', note: 'Then one arm unspools up out of it to the lamp, writhing, and the long fingers close on it; the lamp flares and dies, and it stands a beat in the dark.',
        dist: 30.6, dur: 1 + UP + GRIP + DOWN + BEAT + 0.4, lit: 0.45, fit: FIT, set: atLamp, front: lamp,
        tick(c, k, dt, T) {
          c.labT = T;
          const up = T - 1;
          if (up >= UP + GRIP && c.labOut === undefined) c.labOut = T;
          c.reach = up < 0 ? 0 : up < UP ? smoothstep(up / UP) : up < UP + GRIP ? 1 : 1 - smoothstep((up - UP - GRIP) / DOWN);
          c.grip = up >= UP * 0.8 && up < UP + GRIP + 0.15 ? 1 : 0;
          c.lampLit = Math.min(1.4, level(c, T));
        } },
      { name: 'Skittering to the next lamp', note: 'Between lamps, in the dark: folded down low on all four long limbs, knees and elbows high like a spider, it skitters on in bursts, far too fast.',
        dist: 30.6 + GAP, dur: LEAD + RUSH_T + 0.6,
        set(c) { c.labSide = 0; },
        tick(c, k, dt, T) {
          const d0 = 30.6 + GAP, prev = c.dist;
          if (T < LEAD) { c.moving = false; return; }
          const q0 = clamp((T - LEAD) / RUSH_T, 0, 1), sk = smoothstep(q0), q = sk - 0.85 * Math.sin(TAU * NB * sk) / (TAU * NB);
          c.labSide = Math.sin(q0 * NB * 9.7) * Math.sin(Math.PI * q0) * 0.22;
          c.dist = lerp(d0, 30.6, q); c.rush = q0 < 1 ? Math.sin(Math.PI * q0) : 0;
          const moved = Math.abs(prev - c.dist);
          c.gait += moved * CR.stepRate * Math.PI; c.moving = moved > 0.024 * dt;
          if (q0 >= 1) { c.lampLit = 1; c.reachTo = { x: LAMP.reach.x, y: LAMP.reach.y }; }   // at the next lamp, lit by it
        },
        draw(ctx, c, P) { ctx.translate(c.labSide || 0, 0); CR.draw(ctx, c, P); } },
      { name: 'Walking across to the booth', note: 'After the last lamp: it comes across the street to the glass at a walk, upright, nothing of its face but the two small pale points of its eyes, however near it comes.',
        dist: 10, walk: WALK_V, dur: (10 - CR.catchDist) / WALK_V, tick(c, k, dt) { c.dist = Math.max(CR.catchDist, c.dist - dt * WALK_V); } },
      { name: 'Turning away and walking off', note: 'The car has come for you: it stops dead in the street, then turns round, showing only its eyeless back, and walks back the way it came.',
        dist: 12, dur: 0.8 + 2.2,
        tick(c, k, dt, T) {
          if (T < 0.8) { c.moving = false; return; }
          c.away = true; c.frozen = true; c.moving = true; c.dist += dt * 1.3; c.gait += dt * 1.3 * CR.stepRate * Math.PI;
        } },
      // the police (911): night09 copMan sets c.torch while the flashlight is on it, c.convulse for the second it convulses
      // in that light (COP.conv), and c.scare (and c.hop, off the ground) as it jumps out at them, its tentacles out;
      // c.scareSide is the side of the view the car is on
      { name: 'Caught in a flashlight', note: 'The police car has screeched to a halt by its lamp and a flashlight from its window finds it: a pale light down that side of it, and its eyes shining back. It stands dead still.',
        dist: 13, dur: 2.4, lit: 0.3, fit: NEAR, set(c) { c.scareSide = 1; c.torch = 0; },
        tick(c, k, dt, T) { c.torch = T < 0.4 ? 0 : T < 0.6 ? (Math.sin(T * 70) < -0.3 ? 0.2 : 1) : 1; } },
      { name: 'Convulsing in the flashlight', note: 'In that light it convulses for a second, with a shriek tearing upward: thrown over at the waist one way and the other, its spine kinked, one shoulder up and the other down, its knees buckling, its elbows out and its forearms flung about from them at wrong angles, its head snapping from side to side and its jaw dropping out of it, every joint jerked somewhere new several times a second, and the first of its tentacles squirming out of its back. (With reduced motion, a slow writhe.)',
        dist: 13, dur: 1.5, lit: 0.3, fit: { h: 3.0, w: 2.4 }, set(c) { c.scareSide = 1; c.torch = 1; c.convulse = 0; },
        tick(c, k, dt, T) { c.convulse = smoothstep(clamp((T - 0.3) / 0.12, 0, 1)); } },
      { name: 'Jumped out at the police', note: 'Then it springs out of its convulsion, out in front of the post at the car, upright and leaning at it, one arm out at it and the other up over its head, its head split open into its petals of teeth, turned to the car (here, to the right), and long black tentacles unfurling out of its back and shoulders, waving: a fan of them behind it, one up over its head and one out low at the car; with a snarl, high and gravelly. It holds it as the car goes, then shuts, and they draw back into it.',
        dist: 13, dur: 4.2, lit: 0.3, fit: { h: 4.2, w: 4.6, y0: -0.3 }, set(c) { c.scareSide = 1; c.torch = 1; c.scare = 0; c.hop = 0; c.convulse = 0; },
        tick(c, k, dt, T) {
          const e = T - 1.0, j = clamp(e / 0.28, 0, 1);
          c.convulse = e < 0 ? smoothstep(clamp(T / 0.12, 0, 1)) : 1 - smoothstep(clamp(e / (0.28 * 0.8), 0, 1));
          c.hop = e > 0 && e < 0.28 ? Math.sin(Math.PI * j) * 0.3 : 0; c.yOff = c.hop;
          c.scare = smoothstep(clamp((e - 0.11) / 0.3, 0, 1)) * (1 - smoothstep(clamp((e - 2.25) / 0.45, 0, 1)));
          c.torch = e < 0.7 ? 1 : Math.max(0, 1 - (e - 0.7) / 0.05);
        } },
      LAB.lunge({ note: 'It catches you: its head splits open into five petals lined with teeth, rings of teeth coming up out of its throat and moving out, only ever outward, the long hands up either side of your face; and long black tentacles unfurl all round behind it, waving, more of them out from behind the maw between its petals, and two that come round from its shoulders and curl in at your face from either side.', dist: CR.catchDist }),
    ],
  });
})();
