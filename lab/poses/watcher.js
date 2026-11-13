'use strict';
// Night 4, The Quarry: the watcher (js/creatures/watcher.js; its moves are set by js/levels/night04.js)
(() => {
  const BARRIER = 2.95;   // where a locked gate holds it (night04's lanes)
  // night04's gate: an arched iron frame barred right across, 2.6 m out (nearer than it stands), so it is drawn as it falls
  // in the view, in the watcher's own measure (k: its distance over the gate's)
  const G4 = { z: 2.6, LEN: 2.1, TOP: 1.9, RISE: 0.38, FOOT: 0.1, BAND: 0.42, NGAP: 9, BARW: 0.011, GRIP: 2 };
  const barU = b => 0.025 + b * (G4.LEN - 0.05) / G4.NGAP - G4.LEN / 2;   // across the gate from its middle
  const archY = u => G4.TOP + G4.RISE * (1 - Math.pow(u / (G4.LEN / 2), 2));
  const BLINK = 0.26;
  const blinkDark = (times, T) => { let d = 0; for (const bt of times) { const u = (T - bt) / BLINK; if (u >= 0 && u <= 1) d = Math.max(d, Math.sin(u * Math.PI)); } return d; };
  const dark = (ctx, a) => { if (a > 0.01) { ctx.globalAlpha = a; P_rect(ctx, -60, -60, 120, 120, '#000'); } };
  const newPose = c => { let p; do { p = 1 + Math.floor(c.rand() * 3); } while (p === c.pose); c.pose = p; };   // as onSeen, never the same twice
  const gate = (ctx, c, P) => {
    const k = c.dist / G4.z, eye = G.L.eyeH, e = c.rattle === undefined ? 9 : c.t - c.rattle, f = e >= 0 && e < 1 ? Math.exp(-e * 5) : 0;
    const hop = Math.abs(Math.sin(e * 29)) * f * 0.045, jolt = Math.sin(e * 34) * f * 0.07;   // shaken: up off its hinges, and in and out on its chain
    const X = u => (u + jolt * 0.3) * k, Y = y => eye + (y + hop - eye) * k, iron = P.col([38, 38, 42]);
    const bar = (u, y0, y1, w) => P_poly(ctx, [[X(u - w), Y(y0)], [X(u + w), Y(y0)], [X(u + w), Y(y1)], [X(u - w), Y(y1)]], iron);
    const rail = (y, w) => P_poly(ctx, [[X(-G4.LEN / 2), Y(y - w)], [X(G4.LEN / 2), Y(y - w)], [X(G4.LEN / 2), Y(y + w)], [X(-G4.LEN / 2), Y(y + w)]], iron);
    bar(barU(0), 0.04, archY(barU(0)), 0.025); bar(barU(G4.NGAP), 0.04, archY(barU(G4.NGAP)), 0.025);   // the stiles
    rail(G4.FOOT, 0.03); rail(G4.BAND, 0.022);
    const arch = []; for (let i = 0; i <= 14; i++) { const u = -G4.LEN / 2 + i / 14 * G4.LEN; arch.push([X(u), Y(archY(u))]); }
    P_limb(ctx, arch, 0.064 * k, iron);
    for (let b = 1; b < G4.NGAP; b++) {   // the bars, each to a point over the arch
      const u = barU(b), top = archY(u) + 0.06;
      bar(u, G4.FOOT, top, G4.BARW);
      P_poly(ctx, [[X(u - 0.026), Y(top)], [X(u + 0.026), Y(top)], [X(u), Y(top + 0.09)]], iron);
    }
    ctx.strokeStyle = iron; ctx.lineWidth = 0.018 * k;
    for (let b = 0; b < G4.NGAP; b++) {   // a ring in each gap, between the two low rails
      const um = (barU(b) + barU(b + 1)) / 2, r = (barU(b + 1) - barU(b)) / 2 - G4.BARW;
      ctx.beginPath(); ctx.ellipse(X(um), Y((G4.FOOT + G4.BAND) / 2), r * k, 0.135 * k, 0, 0, TAU); ctx.stroke();
    }
  };
  // night04 holdBars: the bars it holds, GRIP out from the first either side of the middle gap, and the gap it reaches through
  const holdBars = c => {
    const k = c.dist / G4.z, m = Math.ceil(G4.NGAP / 2);
    const ga = barU(m + G4.GRIP) * k, gb = barU(G4.NGAP - m - G4.GRIP) * k;
    c.grip = [Math.min(ga, gb), Math.max(ga, gb)];
    c.reach = Math.max((barU(m) + barU(m + 1)) / 2, (barU(G4.NGAP - m - 1) + barU(G4.NGAP - m)) / 2) * k;
  };
  // each time you look back: nearer, in a new pose (under 4 m only reaching or screaming), the first one its hands over its face
  const LOOKS = [[24, 0], [18, 3], [13, 1], [9, 2], [6, 3], [3.6, 1], [2.4, 2]], LOOK = 1.25;
  LAB.creature('watcher', {
    night: 4, stage: 'The Quarry', dist: 8,
    anims: [
      { name: 'Each time you look back', note: 'It only moves while nothing looks at it: each time you look back it is nearer, in a new pose (first its hands over its face).', dur: LOOKS.length * LOOK,
        set(c) { [c.dist, c.pose] = LOOKS[0]; },
        tick(c, k, dt, T) { const i = clamp(Math.floor(T / LOOK), 0, LOOKS.length - 1); [c.dist, c.pose] = LOOKS[i]; },
        front(ctx, c, P) { const T = c.t, f = T / LOOK - Math.floor(T / LOOK); dark(ctx, T > LOOK * 0.5 ? Math.max(0, 1 - f / 0.12, (f - 0.88) / 0.12) : 0); } },
      { name: 'Going round, caught mid-stride', note: 'Locked out, it runs round the walls to the other gate, but only unseen: caught by a look it is a statue stopped mid-stride (in the game, mostly behind the quarry wall).', dist: 6, dur: 3.4, fit: { w: 2.0 },
        set(c) { c.runPose = true; c.runDir = 1; },
        tick(c, k, dt, T) { if (T % 1.7 < 0.7) c.runGait = (c.runGait || 0) + dt * 13; } },   // 0.7 s unseen, then a look
      { name: 'At the gate, a blink nearer', note: 'Both gates locked: you do not look away, and each time you blink it is nearer, then holding the bars, reaching through, screaming, as the gate clangs on its chain.', dist: 12, dur: 6, fit: { h: 2.6, w: 2.6 },
        set(c) {
          c.pose = 3; c.frozen = true;
          c.plan = [{ d: lerp(12, BARRIER, 0.55) }, { d: BARRIER + 0.9 }, { d: BARRIER, pose: 4 }, { d: BARRIER, pose: 5 }, { d: BARRIER, pose: 2 }];
          c.times = c.plan.map((st, i) => 1.1 + i * 0.72); c.next = 0;
        },
        tick(c, k, dt, T) {   // night04 aftermath: in the dark of a blink, it moves
          while (c.next < c.plan.length && T >= c.times[c.next] + BLINK / 2) {
            const st = c.plan[c.next++];
            c.dist = st.d;
            if (st.pose) { c.pose = st.pose; c.rattle = c.t; } else newPose(c);
          }
          holdBars(c);   // the game tells it where the bars are every frame once the night is won
        },
        front(ctx, c, P) { gate(ctx, c, P); dark(ctx, blinkDark(c.times, c.t)); } },
      LAB.lunge({ dist: 1.6, dur: 1.0, zoom: 2, note: 'You looked away: it is on you at once, screaming, its head cocked.' }),
    ],
  });
})();
