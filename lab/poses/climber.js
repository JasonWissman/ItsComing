'use strict';
/* global CLIMB */
// Night 7, The Lighthouse: the climber (js/creatures/climber.js; its moves are set by js/levels/night07.js)
// It is drawn on the tower's wall, as you see it looking down over the rail: the night gives it c.wallFrame (where it is on
// the stone, and the way up, out of and across the wall there) and it lays itself along the wall as that runs on screen.
// Here the wall is a stand-in with the same directions the lighthouse wall has in the view that looks down at it: the lab's
// eye looks level, so the wall's frame is given as the game's camera sees it (pitched 70 degrees down, night07 watchPitch).
(() => {
  const CR = CREATURES.climber, H = CR.h;
  // the climber reads R.screenPos(..).scale (pixels per metre there), which the lab's camera leaves out: add it
  const sp0 = R.screenPos;
  R.screenPos = function (x, y, z) { const p = sp0.call(this, x, y, z); if (p && p.scale === undefined) { p.scale = this.f / z; p.depth = z; } return p; };

  // ---- the wall ----
  // night07 stoneFrame: the tower flares out below the gallery at SLOPE (25 degrees from the vertical); on the face straight
  // below you, up the wall is up and in toward you, out is out and up, across is to your left (its right, facing you)
  const SLOPE = 0.466, UN = Math.hypot(1, SLOPE), PITCH = 70 * DEG, cp = Math.cos(PITCH), sn = Math.sin(PITCH);
  const local = { up: [0, 1 / UN, -SLOPE / UN], out: [0, SLOPE / UN, 1 / UN], across: [-1, 0, 0] };
  const toCam = v => [v[0], v[1] * cp + v[2] * sn, -v[1] * sn + v[2] * cp];   // the game's view, looking down at it
  const stoneFrame = c => ({ at: [0, H / 2, c.dist], up: toCam(local.up), out: toCam(local.out), across: local.across });
  // knocked off the stone (night07 fallFrame): it peels away, tipping over and rolling about the line you see it along,
  // and falls under gravity from where it let go; the view follows it down, so here it stays where it is on the card (c.dist
  // stays put: the lab's camera is fixed to it) and is drawn smaller by how much further off it really is (fallDraw)
  const FALL = { tip: 1.5, peel: 0.5, rock: 0.35 }, GRAV = 9.8, WATER = -24.6;
  const turn = (v, n, a) => {
    const cs = Math.cos(a), s2 = Math.sin(a), d = (v[0] * n[0] + v[1] * n[1] + v[2] * n[2]) * (1 - cs);
    return [v[0] * cs + (n[1] * v[2] - n[2] * v[1]) * s2 + n[0] * d, v[1] * cs + (n[2] * v[0] - n[0] * v[2]) * s2 + n[1] * d, v[2] * cs + (n[0] * v[1] - n[1] * v[0]) * s2 + n[2] * d];
  };
  const fallPos = f => f.p.map((p, i) => p + f.v[i] * f.t - (i === 1 ? GRAV * f.t * f.t / 2 : 0));   // from the eye, the game's level axes
  const fallFrame = c => {
    const f = c.labFall, q = smoothstep(f.t / FALL.peel), tip = (FALL.tip + FALL.rock * Math.sin(f.t * 3.1)) * q, roll = f.spin * f.t, ct = Math.cos(tip), st = Math.sin(tip);
    const up = local.up.map((u, i) => u * ct + local.out[i] * st), out = local.out.map((o, i) => o * ct - local.up[i] * st);
    return { at: [0, H / 2, c.dist], up: toCam(turn(up, f.view, roll)), out: toCam(turn(out, f.view, roll)), across: toCam(turn(local.across, f.view, roll)), from: stoneFrame(c), k: q };
  };
  const fallDraw = (ctx, c, P) => {
    const f = c.labFall;
    if (f) { const s = f.d0 / Math.hypot(...fallPos(f)); ctx.translate(0, H / 2); ctx.scale(s, s); ctx.translate(0, -H / 2); }
    CR.draw(ctx, c, P);
  };
  const wallFrame = c => (c.labFall ? fallFrame(c) : stoneFrame(c));
  const wallAt = c => { const p = wallFrame(c).at; return { x: p[0], y: p[1] - H / 2, z: p[2] }; };

  // the stone, drawn as the climber lays itself on it (its draw: the rig's across, up and out on screen), so a hold it has
  // hooked into stays put on it. Courses and joints are fixed on the wall the way its holds are (CR.held: a point closes on
  // where the wall runs away to, CLIMB.vp, as it nears), and slide past it as it climbs, slides or runs across
  const axesOf = c => {
    const fr = stoneFrame(c), at = fr.at, o = R.screenPos(at[0], at[1], at[2]); if (!o) return null;
    const k = o.scale, nearK = smoothstep((c.dist - 2.5) / 6), along = lerp(0.2, CLIMB.along, nearK), out = lerp(0.7, CLIMB.out, nearK);
    const S = (v, s) => R.screenPos(at[0] + v[0] * s, at[1] + v[1] * s, at[2] + v[2] * s), d2 = (a, b, s) => (a && b ? [(a.x - b.x) / (s * k), (a.y - b.y) / (s * k)] : null);
    const u = Math.min(1, c.dist * 0.3), X = d2(S(fr.across, 0.3), S(fr.across, -0.3), 0.6), N = d2(S(fr.out, 0.2), S(fr.out, -0.2), 0.4), U = d2(S(fr.up, u), S(fr.up, -u), 2 * u);
    if (!(X && N && U)) return null;
    const ul = along / (Math.hypot(U[0], U[1]) || 1);
    const bx = X, bn = [N[0] * out, N[1] * out], bu = [U[0] * ul, U[1] * ul], m = CLIMB.mid;
    return v => [(v[0] - m[0]) * bx[0] + (v[1] - m[1]) * bu[0] + (v[2] - m[2]) * bn[0], (v[0] - m[0]) * bx[1] + (v[1] - m[1]) * bu[1] + (v[2] - m[2]) * bn[1]];
  };
  const wall = (ctx, c, P) => {
    P_rect(ctx, -20, -20, 40, 40, P.col([16, 22, 30]));   // the sea, far below, beyond the foot of the tower
    const pr = axesOf(c), gone = c.labFall ? smoothstep(c.labFall.t / 0.6) : 0;
    if (!pr || gone >= 1) return;
    ctx.save(); ctx.globalAlpha = 1 - gone;
    ctx.translate(0, H / 2); ctx.scale(1, -1);   // to the climber's own screen metres (y down), its middle at nought
    const vp = CLIMB.vp, d = Math.max(3, c.dist), sx = c.labAcross || 0, top = vp + 9;
    P_poly(ctx, [[-9, vp, 0], [9, vp, 0], [9, top, 0], [-9, top, 0]].map(pr), P.col([120, 118, 112]));
    ctx.strokeStyle = P.col([78, 76, 72]); ctx.lineCap = 'butt';
    const row = 0.05 * d, col = 0.1 * d;
    for (let j = 1; vp + j * row < top; j++) {
      const a = vp + j * row, a2 = a + row, w = 0.016 * clamp((a - vp) / 2.5, 0.15, 1);
      ctx.lineWidth = w; ctx.beginPath();
      let p = pr([-9, a, 0]); ctx.moveTo(p[0], p[1]); p = pr([9, a, 0]); ctx.lineTo(p[0], p[1]);
      const off = ((j % 2) * 0.5 * col - sx) % col;
      for (let x = -9 + off; x < 9; x += col) { p = pr([x, a, 0]); ctx.moveTo(p[0], p[1]); p = pr([x, a2, 0]); ctx.lineTo(p[0], p[1]); }
      ctx.stroke();
    }
    ctx.restore();
  };
  // the beam going over it: a broad pale band sweeping across the stone (c.labBeam: when it is on it, on the card's clock)
  const beam = (ctx, c, P) => {
    for (const t0 of c.labBeams || []) {
      const e = (c.labT - t0) / 0.5; if (e < -1 || e > 1) continue;
      const x = e * 3, g = ctx.createLinearGradient(x - 1, 0, x + 1, 0);
      g.addColorStop(0, 'rgba(255,242,205,0)'); g.addColorStop(0.5, 'rgba(255,242,205,0.28)'); g.addColorStop(1, 'rgba(255,242,205,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 1, -5, 2, 12);
    }
  };
  // where it went in, far below, once it is gone: a burst of white and a ring of foam spreading (night07 L.dynamic)
  const splash = (ctx, c, P) => {
    beam(ctx, c, P);
    const sp = c.labSplash; if (!sp) return;
    const k = c.labT - sp.t, s = sp.s, ring = 0.8 + 2 * easeOut(Math.min(1, k / 1.6)), ringA = 0.55 * (1 - smoothstep((k - 0.4) / 1.6));
    const burst = 0.4 + 1.1 * easeOut(Math.min(1, k / 0.35)), burstA = 0.9 * (1 - smoothstep(k / 1.1));
    ctx.translate(0, H / 2);
    if (ringA > 0.01) { ctx.strokeStyle = P.cola([196, 206, 212], ringA); ctx.lineWidth = 0.4 * s; ctx.beginPath(); ctx.ellipse(0, 0, (ring - 0.2) * s, (ring - 0.2) * s * 0.94, 0, 0, TAU); ctx.stroke(); }
    if (burstA > 0.01) P_ell(ctx, 0, 0, burst * s, burst * s * 0.94, P.cola([238, 242, 244], burstA));
  };

  // ---- its pace, as the night drives it ----
  const PACE = 26 / 72, SEEN = 0.3;   // night 7: startDist 26 m, time 72 s, seenMult 0.3 (unseenMult 1)
  // what its speedMult has just returned (the lab does not keep it): a third of its pace through a reach, a surge through the heave
  const stepPace = c => { const p = (c.climbPh / Math.PI) % 1; return p < 0.5 ? 0.35 : 0.35 + 2.04 * Math.sin((p - 0.5) * 2 * Math.PI); };
  const climb = seen => (c, k, dt) => { c.labT = (c.labT || 0) + dt; c.dist -= dt * stepPace(c) * PACE * (seen ? SEEN : 1); };
  // the aftermath (night07 L.aftermath and the distFn it sets): rush up into view, climb; a pass of the beam knocks it back
  // down the wall (slide) until its hooks catch (cling), or, the last pass, it scrabbles (slip), lets go and falls; the
  // dropped toolbox does the same as the last pass, without the light
  const AFTER = { near: 5.5, rush: 1.25, climb: 0.3, closest: 2.5, cling: 0.7, knock: 3, slip: 0.55, slipV: 4, push: 5.2, spin: 1.3 };
  const after = plan => (c, k, dt, T) => {
    const a = c.lab, eye = G.L.eyeH;
    c.labT = T;
    for (const h of plan.hits || []) if (!a.done[h.t] && T >= h.t) {
      a.done[h.t] = true; const last = h.last;
      c.distFn = c.distFn || (() => c.dist); c.frozen = true;
      a.mode = last ? 'slip' : 'slide'; c.slideV = h.v || 0.6; c.slideTo = last ? Infinity : c.dist + AFTER.knock; a.slip = AFTER.slip;
      if (!h.box) c.struck = 1;
    }
    if (a.mode === 'rush') { c.dist = Math.max(AFTER.near, c.dist - dt * a.rate); if (c.dist <= AFTER.near) a.mode = 'climb'; }
    else if (a.mode === 'climb') c.dist = Math.max(Math.min(c.dist, AFTER.closest), c.dist - dt * AFTER.climb);
    else if (a.mode === 'play') c.dist -= dt * stepPace(c) * PACE * SEEN;
    else if (a.mode === 'slide' || a.mode === 'slip') {
      c.slideV = Math.min(a.mode === 'slip' ? AFTER.slipV : 7, c.slideV + dt * 16);
      const d = Math.min(c.slideTo, c.dist + c.slideV * dt);
      if (d >= c.slideTo - 1e-4) { a.mode = 'cling'; a.cling = AFTER.cling; c.slideTo = null; }
      c.dist = d;
    }
    c.climbRate = a.mode === 'rush' ? 9 : a.mode === 'climb' ? 2.6 : 0;
    if (a.mode === 'cling' && (a.cling -= dt) <= 0) a.mode = 'climb';
    if (a.mode === 'slip' && !c.labFall) {
      c.scrabble = Math.min(1, (c.scrabble || 0) + dt * 5);
      if ((a.slip -= dt) <= 0) {   // it lets go: off the stone at the pace it was sliding, thrown out from the wall
        const d0 = c.dist, p = [0, -d0 * sn, d0 * cp];
        c.labFall = { t: 0, d0, p, v: local.out.map((o, i) => o * AFTER.push - local.up[i] * c.slideV), view: p.map(x => x / d0), spin: -AFTER.spin };
        a.mode = 'fall';
      }
    }
    if (a.mode === 'fall') {
      c.labFall.t += dt; c.falling = Math.min(1, (c.falling || 0) + dt * 3);
      const p = fallPos(c.labFall);
      if (eye + p[1] <= WATER + 0.2) { c.gone = true; a.mode = 'down'; c.labSplash = { t: T, s: c.labFall.d0 / Math.hypot(...p) }; }
    }
  };
  const start = (mode, extra) => c => { c.lab = Object.assign({ mode, done: {} }, extra); c.labBeams = []; c.labT = 0; c.look = 1; };
  // the toolbox it is hit by: dropped over the rail it comes down the stone from you, tumbling, onto its back between its
  // shoulders, and bounces off out from the wall (the box: red steel, its lid standing open)
  const BOX = 0.75;
  const toolbox = (ctx, c, P) => {
    const T = c.labT || 0; if (T > BOX + 0.6) return;
    const q = Math.min(1, T / BOX), b = Math.max(0, T - BOX), s = lerp(3.2, 1, easeIn(q)) * (1 - b * 0.6);
    const x = b * 0.4, y = lerp(-2.4, H / 2 + 0.15, easeIn(q)) + b * 2.2 - b * b * 1.5;
    ctx.save(); ctx.translate(x, y); ctx.rotate(T * 5 + b * 6); ctx.scale(s, s);
    P_rect(ctx, -0.28, -0.19, 0.56, 0.33, P.col([172, 36, 30])); P_rect(ctx, -0.28, 0.1, 0.56, 0.04, P.col([108, 22, 18]));
    P_rect(ctx, -0.26, 0.14, 0.52, 0.2, P.col([196, 60, 50])); P_rect(ctx, -0.05, -0.08, 0.1, 0.07, P.col([150, 146, 138]));
    ctx.restore();
  };

  LAB.creature('climber', {
    night: 7, stage: 'The Lighthouse', dist: 6, fit: { h: 2.0, w: 1.9, y0: 0 },
    setup(c) { c.wallTh = 90; c.wallAt = wallAt; c.wallFrame = wallFrame; c.labAcross = 0; },
    anims: [
      { name: 'Climbing while you watch', note: 'Looking over the rail at it: one limb at a time, a hand reaching up and hooking into the stone and a heave up on all four, at a third of its pace; its face stays on you.',
        dist: 6, dur: 4 * Math.PI / 2.6, modes: true, seen: true, still: true, back: wall, set(c) { c.look = 1; }, tick: climb(true) },
      { name: 'Climbing while you look away', note: 'The same climb at twice the rate and its full pace, as it goes while you are not watching it (what you would catch if you glanced back).',
        dist: 9, dur: 4 * Math.PI / 5.2 * 2, modes: true, seen: false, still: true, back: wall, tick: climb(false) },
      { name: 'Running across to another face', note: 'Nightmare, unseen: it turns side on and runs across the stone round the tower to another face (1.6 m a second), then climbs on.',
        dist: 9, dur: 0.5 + 0.73 + 1.2, modes: true, seen: false, still: true, back: wall,
        tick(c, k, dt, T) { climb(false)(c, k, dt); const on = T >= 0.5 && T < 1.23; c.scuttle = on ? -1 : 0; if (on) c.labAcross += -1 * 1.6 * dt; } },
      { name: 'Scrambling up into the light', note: 'Won: from far down it rushes up the wall at you, the climb going round fast, to where the beam will find it.',
        dist: 14, dur: 2.6, modes: true, still: true, back: wall,
        set: start('rush'), tick(c, k, dt, T) { if (!c.lab.rate) { c.lab.rate = Math.max(2.5, (14 - AFTER.near) / AFTER.rush); c.distFn = () => c.dist; c.frozen = true; } after({})(c, k, dt, T); } },
      { name: 'Knocked down the wall by the beam', note: 'The first pass of the light: it goes white in it, its hooks come out of the stone and it slides, clawing, down the wet wall until they catch; then it starts up again.',
        dist: 5.5, dur: 3.4, modes: true, still: true, back: wall, front: beam,
        set(c) { start('climb')(c); c.distFn = () => c.dist; c.frozen = true; c.labBeams = [0.6]; }, tick: after({ hits: [{ t: 0.6 }] }) },
      { name: 'The last pass: it lets go and falls', note: 'The second pass of the light: it slides on, scrabbling at the stone and catching at nothing, peels away and falls, turning over, into the sea.',
        dist: 6, dur: 4.4, modes: true, still: true, back: wall, front: splash, draw: fallDraw,
        set(c) { start('climb')(c); c.distFn = () => c.dist; c.frozen = true; c.labBeams = [0.5]; }, tick: after({ hits: [{ t: 0.5, last: true }] }) },
      { name: 'Hit by the dropped toolbox', note: 'Dropped over the rail within reach, the toolbox comes down the stone onto its back: it loses its hold, scrabbles and falls into the sea.',
        dist: 6, dur: 4.5, modes: true, seen: true, still: true, back: wall, draw: fallDraw,
        front(ctx, c, P) { ctx.save(); splash(ctx, c, P); ctx.restore(); toolbox(ctx, c, P); },
        set: start('play'), tick: after({ hits: [{ t: BOX, last: true, box: true, v: 2 }] }) },
      LAB.lunge({ name: 'Over the rail at you', note: 'It catches you: up off the stone and over the rail, righting itself, its face coming up to yours and its hooked hands reaching.', dist: 1.6, back: wall, fit: { h: 2.4, w: 1.9, y0: 0.5 },
        set(c) { c.frozen = true; c.lungeFrom = c.dist; c.look = 1; } }),
    ],
  });
})();
