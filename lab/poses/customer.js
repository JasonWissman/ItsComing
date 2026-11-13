'use strict';
// Night 8, The Diner: the customer (js/creatures/customer.js; its moves are set by js/levels/night08.js)
(() => {
  const CR = CREATURES.customer;
  const DARK = 42 / 175;                  // night 8's creature: startDist 42 m, time 175 s: its walk with the power off
  const GLASS = 5.02, LIT_T = 17;         // the middle window's glass; lit, it is at the glass LIT_T s after it sets off
  const LIT = (42 - GLASS) / LIT_T;       // (c.drawnMult: its pace while the diner is lit)
  // walking in at a pace: its small stiff steps (c.gait, as the game drives it from the ground covered)
  const walk = v => (c, k, dt) => { c.moving = true; c.dist -= v * dt; c.gait += v * dt * CR.stepRate * Math.PI; };
  // the window between you and it: a sheen of reflections on the glass
  const glass = (ctx, c, P) => {
    for (const [x, w, a] of [[-0.9, 0.5, 0.05], [0.25, 0.22, 0.04], [0.7, 0.08, 0.06]]) {
      ctx.fillStyle = P.cola([200, 210, 220], a); ctx.beginPath(); ctx.moveTo(x, -1); ctx.lineTo(x + w, -1); ctx.lineTo(x + w + 1.4, 3); ctx.lineTo(x + 1.4, 3); ctx.closePath(); ctx.fill();
    }
  };

  // ---- the run (night08 slideTo): it turns side on where it stands (RUN.pivot s), runs, slows, and turns back ----
  const RUN = { pivot: 0.16, step: 0.95, full: 3.2, ramp: 0.25 };
  const runAt = x => { const a = RUN.ramp, v = 1 / (1 - a); return x < a ? v * x * x / (2 * a) : x > 1 - a ? 1 - v * (1 - x) * (1 - x) / (2 * a) : v * (x - a / 2); };
  // a run of len metres, sideways, taking run s once it is round, toward dir (+1 the right of the view); lead s standing
  // first. Along the glass it is shown going across the card (c.labX); across the lot, on the spot
  const runner = (len, run, dir, lead, across) => (c, k, dt, T) => {
    const t = T - lead, a = c.lab || (c.lab = { e: 0, out: -1 });
    if (t < 0 || a.done) { walk(DARK)(c, k, dt); return; }
    if (!c.runPose && !a.done) Object.assign(c, { runPose: true, runTurn: 0, runDir: dir, runAmt: 0, runGait: 0 });
    c.moving = false; c.dist -= DARK * dt;   // (it keeps coming at its own pace as it goes)
    const spin = RUN.pivot, e0 = runAt(clamp((t - spin) / run, 0, 1)), moved = Math.abs(len * (e0 - a.e));
    a.e = e0;
    c.runAmt += (clamp(moved / Math.max(dt, 1e-3) / RUN.full, 0, 1) - c.runAmt) * Math.min(1, dt * 14);
    c.runGait += moved / RUN.step * Math.PI;
    if (across) c.labX = dir * len * (e0 - 0.5);
    if (a.out < 0 && e0 >= 1) a.out = t;
    if (a.out < 0) c.runTurn = Math.min(1, t / spin);
    else { c.runTurn = Math.max(0, 1 - (t - a.out) / spin); if (t - a.out >= spin) { a.done = true; Object.assign(c, { runPose: false, runTurn: 0, runAmt: 0 }); } }
  };
  const shifted = (ctx, c, P) => { ctx.translate(c.labX || 0, 0); CR.draw(ctx, c, P); };
  // along the glass from the middle window to the left one (2.9 m, in the dark: clamp(2.9 / 3.8, 0.5, 1.3) s); across the
  // lot, 30 degrees round at 20 m (10.5 m: clamp(10.5 / 5.5, 1.2, 5) s)
  const G_LEN = 2.9, G_RUN = clamp(G_LEN / 3.8, 0.5, 1.3), L_LEN = 20 * 30 * DEG, L_RUN = clamp(L_LEN / 5.5, 1.2, 5);

  // ---- the shove (night08 startShove, shoveStep): at a shutter part way down it takes the bottom edge and shoves it up ----
  const SHOVE = { grab: 0.32, heave: 0.66, fly: 0.13, after: 0.3, lunge: 2.6 }, REACH = 1.5, FLING = 1.75, TOP = 2.6, BOT = 0.1, ZS = 5.1;
  const D_SHOVE = GLASS * (ZS + 0.1) / GLASS;   // just outside the steel (middle window)
  const bottom = sh => TOP - (TOP - BOT) * sh;
  const edgeAt = (yb, d) => G.L.eyeH + (yb - G.L.eyeH) * d / ZS;   // the shutter's bottom edge as it shows at its distance d
  const LEAD = 0.5;
  const shover = sh0 => (c, k, dt, T) => {
    if (T < LEAD) { walk(DARK)(c, k, dt); c.dist = Math.max(c.dist, D_SHOVE); c.labSh = sh0; c.labEdge = edgeAt(bottom(sh0), c.dist); return; }
    c.moving = false;
    const S = c.lab || (c.lab = { t: 0, slamAt: -1 });
    if (!c.shove) { c.dist = D_SHOVE; c.shove = { k: 0, h: Math.min(REACH, edgeAt(bottom(sh0), D_SHOVE)), up: 0 }; }
    const a = (S.t += dt);
    let sh = sh0;
    if (a < SHOVE.grab) c.shove.k = smoothstep(a / SHOVE.grab);
    else {
      c.shove.k = 1;
      if (a < SHOVE.heave) {   // two hard tugs, the curtain jerking up in its rails and dropping back
        const e = a - SHOVE.grab, tug = u => Math.exp(-(((e - u) / 0.035) ** 2));
        sh -= Math.min(0.04, sh0 * 0.5) * (tug(0.06) + tug(0.2)) + 0.004 * Math.sin(e * 95) * Math.exp(-e * 6);
      } else if (S.slamAt < 0) {   // the shove: up, faster and faster, into the housing
        const e = clamp((a - SHOVE.heave) / SHOVE.fly, 0, 1);
        sh = sh0 * (1 - e * e); c.shove.up = e; S.e = e;
        if (e >= 1) S.slamAt = a;
      }
      if (S.slamAt >= 0) {   // up, bouncing a little, and it throws itself at the glass
        const b = a - S.slamAt;
        sh = 0.04 * Math.exp(-b * 7) * Math.abs(Math.cos(b * 17)); c.shove.up = 1;
        if (b >= SHOVE.after) { S.gone = true; c.dist = Math.max(GLASS, c.dist - dt * SHOVE.lunge); c.moving = true; }
      }
    }
    // an edge out of its reach: it jumps for it and hangs there by its hands until the shove, then drops as it shoves
    const edge = edgeAt(bottom(Math.max(sh, 0)), D_SHOVE), lift = Math.max(0, edgeAt(bottom(sh0), D_SHOVE) - REACH);
    c.yOff = lift * c.shove.k * (1 - c.shove.up) * (1 - c.shove.up);
    if (!S.gone) c.shove.h = Math.min(edge - c.yOff, FLING);
    c.labSh = Math.max(0, sh); c.labEdge = edge;
  };
  // the shutter, in front of it: steel slats down from the top to its heavy bottom rail; its fingers curled up over the
  // front of the rail while it has hold (night08 shoveArt), the rail's blur as it flies up
  const fingers = (ctx, P) => {
    const skin = P.col([176, 170, 162]), edge = P.col([70, 62, 58]), nail = P.col([206, 198, 188]);
    for (let f = 0; f < 4; f++) {
      const x = (f - 1.5) * 0.017, top = 0.05 + (f === 1 || f === 2 ? 0.008 : 0);
      P_line(ctx, x, 0.004, x * 1.06, top, 0.019, edge); P_line(ctx, x, 0.004, x * 1.06, top, 0.013, skin);
      P_ell(ctx, x * 1.06, top - 0.002, 0.004, 0.005, nail); P_line(ctx, x - 0.005, top - 0.022, x + 0.005, top - 0.022, 0.0025, edge);
    }
  };
  const shutter = (ctx, c, P) => {
    ctx.translate(0, -(c.yOff || 0));   // (the lab lifts what it draws with the creature: the shutter stays where it is)
    const yb = c.labEdge, d = c.dist, sc = d / ZS, x0 = -1.25 * sc, w = 2.5 * sc;
    const steel = P.col([128, 126, 118]), seam = P.col([70, 68, 62]), rail = P.col([50, 48, 46]);
    if (c.labSh > 0.004) {
      P_rect(ctx, x0, yb, w, 6, steel);
      for (let y = TOP - 0.15; y > bottom(c.labSh) + 0.08; y -= 0.15) P_rect(ctx, x0, edgeAt(y, d), w, 0.022 * sc, seam);
      P_rect(ctx, x0, yb, w, 0.08 * sc, rail);
    }
    const S = c.lab;
    if (S && S.slamAt < 0 && S.e > 0) [[0.12, 0.4], [0.25, 0.22], [0.4, 0.1]].forEach(([de, al]) => {
      const y = edgeAt(bottom(c.labShove0 * (1 - Math.max(0, S.e - de) ** 2)), d);
      if (y > yb + 0.02) P_rect(ctx, x0, y, w, 0.08 * sc, P.cola([50, 48, 46], al));
    });
    if (c.shove && c.shove.k > 0.85 && Math.abs(c.shove.h + c.yOff - yb) < 0.03) for (const x of [-0.12, 0.12]) { ctx.save(); ctx.translate(x, yb - 0.022); fingers(ctx, P); ctx.restore(); }
    glass(ctx, c, P);
  };

  LAB.creature('customer', {
    night: 8, stage: 'The Diner', dist: 14,
    anims: [
      { name: 'Walking in, in the dark', note: 'With the power off: small stiff steps, bolt upright, only the head moving, laid over slowly one way and the other; now and then the feet stop and it slides on.',
        dist: 20, dur: 8.6, tick: walk(DARK) },
      { name: 'Coming fast while the diner is lit', note: 'With the lights on it is drawn in: the same stiff walk, far faster, crossing the lot in seconds whether you watch it or not.',
        dist: 30, dur: 4.3, tick: walk(LIT) },
      { name: 'Hands up to the glass', note: 'Coming up to an open window in the dark: its hands come up and press flat on the glass either side of its face, and the head lays itself further over.',
        dist: 7.8, dur: 9, tick: walk(DARK), front: glass },
      { name: 'Running along the glass', note: 'Its window shut in its face, it pivots side on like a solid figure on a turntable, skips along the glass to the next window still open, and turns back to it.',
        dist: 5.3, dur: 0.6 + RUN.pivot * 2 + G_RUN + 0.6, fit: { h: 1.45, w: 3.4 }, draw: shifted, front: glass,
        set(c) { c.labX = G_LEN / 2; }, tick: runner(G_LEN, G_RUN, -1, 0.6, true) },
      { name: 'Running across the lot', note: 'Shut out while still out in the lot, it turns side on and skips across to an open window: knees high, body bolt upright, arms dead straight, head turned to you.',
        dist: 20, dur: 0.4 + RUN.pivot * 2 + L_RUN + 0.6, fit: { h: 1.45, w: 1.1 }, tick: runner(L_LEN, L_RUN, 1, 0.4, false) },
      { name: 'Shoving a shutter back up', note: 'At a shutter only half down: its hands come up to the bottom edge, take hold, tug twice, and shove it up into its housing; then it throws itself at the glass.',
        dist: D_SHOVE + 0.12, dur: LEAD + SHOVE.heave + SHOVE.fly + SHOVE.after + 0.5, fit: { h: 1.9, w: 1.3 }, front: shutter,
        set(c) { c.labShove0 = 0.5; }, tick: shover(0.5) },
      { name: 'Jumping for a shutter', note: 'At a shutter barely started down, the edge above its reach: it jumps, hangs from the edge by its hands, and drops as it shoves it up.',
        dist: D_SHOVE + 0.12, dur: LEAD + SHOVE.heave + SHOVE.fly + SHOVE.after + 0.5, fit: { h: 2.1, w: 1.3 }, front: shutter,
        set(c) { c.labShove0 = 0.2; }, tick: shover(0.2) },
      LAB.lunge({ note: 'Through the glass: it comes straight from the window at your face, the grin coming apart, the jaw dropping, the hands reaching.', dist: GLASS }),
    ],
  });
})();
