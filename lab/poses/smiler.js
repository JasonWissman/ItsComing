'use strict';
// Night 3, The Graveyard: the smiler (js/creatures/smiler.js; its moves are set by js/levels/night03.js)
(() => {
  const NIGHT = { D0: 95, T: 88 };       // night 3's creatures entry: startDist 95, time 88
  const BARRIER = 2.6, SALT_D = 1.77;    // the path: where a salted way holds it, and how far out its salt line is poured
  const SALT = { hold: 6, look: 1.2 };   // night03: held this long where it has nowhere weaker to go, it steps over
  const END = { run: 2.5, stop: 0.4, bow: 0.45, look: 1.3, rise: 0.3, turn: 0.75, walk: 2.8, walkSpeed: 2.2, runCadence: 17 };
  const ROUND = { wait: 0.8, round: 0.5 };                                // game.js ROUND: standing a moment, then out of sight
  const RUN = { lat0: 3.6, T1: 0.8, d2: 5.5, lat1: 3.0, in: 0.65 };   // roundLat and its times, worked out for the path and the side gate
  // the game's walk in (game.js updateCreature): u at m/T a second, a hitch jumps it on (c.hitched), the legs from how far it moved
  const drive = (c, dt, held) => {
    const prev = c.dist, m = c.CR.speedMult(c, dt, true) * c.seenMult;
    if (c.hitched) c.hitched = false;
    if (held === undefined) { c.u = clamp(c.u + dt * m / c.T, 0, 1); c.dist = Math.max(c.catchDist, c.D0 * (1 - c.u)); } else c.dist = held;
    step(c, prev, dt);
  };
  const step = (c, prev, dt) => {
    const moved = Math.abs(prev - c.dist);
    c.gait += moved * c.CR.stepRate * Math.PI; c.moving = moved > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  };
  const bowTo = (c, want, rate, dt) => { c.bow = clamp((c.bow || 0) + clamp(want - (c.bow || 0), -rate * dt, rate * dt), 0, 1); };
  // the salt line across the stone, nearer than it is: where it falls in the view, in its own measure (below its feet)
  const saltLine = (ctx, c, P) => {
    const eye = G.L.eyeH, k = c.dist / SALT_D, y = eye - eye * k, w = 1.6 * k;
    P_rect(ctx, -w, y - 0.012 * k, 2 * w, 0.03 * k, P.col([226, 222, 210]));
    for (let i = 0; i < 26; i++) P_ell(ctx, -w + (i + 0.5) * 2 * w / 26, y + 0.01 * k * Math.sin(i * 7.1), 0.01 * k, 0.006 * k, P.col([246, 244, 236]));
  };
  LAB.creature('smiler', {
    night: 3, stage: 'The Graveyard', dist: 12,
    setup(c) { c.D0 = NIGHT.D0; c.T = NIGHT.T; c.u = 1 - c.dist / c.D0; },
    anims: [
      { name: 'Walking at you', note: 'Out among the graves: a slow bent walk on the staff, and every few seconds a hitch, a jolt nearer.', dist: 22, dur: 9,
        tick(c, k, dt) { drive(c, dt); } },
      { name: 'Closing in', note: 'Up the path to the porch: the head tilts further, the eyes widen and the grin opens the nearer he comes.', dist: 14, dur: 10,
        tick(c, k, dt) { drive(c, dt); } },
      { name: 'Held at the salt line', note: 'Stopped by the salt across the path: he looks down at it, then up at you; with no lantern lit there, he looks down once more and steps over it.', dist: BARRIER, dur: 7.6, fit: { y0: -0.85 },
        back: saltLine,
        tick(c, k, dt, T) {
          if (T < SALT.hold) { drive(c, dt, BARRIER); bowTo(c, T < 1.8 || T > SALT.hold - SALT.look ? 1 : 0, 3, dt); return; }
          if (!c.over) { c.over = true; c.u = 1 - c.dist / c.D0; }   // over the line: he walks on from where he stood
          drive(c, dt); bowTo(c, 0, 3, dt);
        } },
      { name: 'Running round to the other way', note: 'Held at a salted way while the other is weaker: a moment looking down, then side on, flat out, out of view, and in across the side gate, grinning at you all the way.', dist: BARRIER, dur: 4.2, fit: { w: 2.4, y0: -0.85 },
        back(ctx, c, P) { if (!c.round || c.round.t < 0) saltLine(ctx, c, P); },
        set(c) { c.round = { t: -ROUND.wait }; },
        tick(c, k, dt) {   // game.js goRound, from the path to the side gate, to the right
          const r = c.round, T1 = RUN.T1, T2 = T1 + ROUND.round, T3 = T2 + RUN.in, prev = c.dist;
          r.t += dt;
          if (r.t < 0) { drive(c, dt, BARRIER); bowTo(c, 1, 3, dt); return; }
          c.CR.speedMult(c, dt, true);
          if (r.t >= T3) {   // across the way: he turns to it and walks on
            if (c.runPose) { c.runPose = false; c.runLat = 0; c.u = 1 - c.dist / c.D0; }
            drive(c, dt); return;
          }
          c.runPose = true; c.runDir = 1; c.bow = 0;
          c.runGait = (c.runGait || 0) + dt * 15;
          if (r.t < T1) c.runLat = RUN.lat0 * Math.pow(r.t / T1, 1.5);
          else if (r.t < T2) c.runLat = 99;   // out of sight, going round
          else { c.dist = RUN.d2; c.runLat = -RUN.lat1 * (1 - easeOut((r.t - T2) / RUN.in)); }
          step(c, prev, dt);
        },
        draw(ctx, c, P, CR) { ctx.translate(c.runLat || 0, 0); CR.draw(ctx, c, P); } },
      { name: 'Rushing up to the salt', note: 'Once the night is won: from out among the graves he hurries to the salt line, knees high, short quick steps, and stops dead with his toes at it.', dist: 20, dur: 3.6, fit: { y0: -0.3 },
        back(ctx, c, P) { if (c.dist < 6) saltLine(ctx, c, P); },
        set(c) { const at = SALT_D + 0.25, far = c.dist - at; c.at = at; c.v = far / clamp(far / 8, 0.4, END.run); c.rush = clamp((c.v - 2) / 4, 0, 1); c.frozen = true; },
        tick(c, k, dt) {   // night03 aftermath 'come': quick short steps, not ten a second
          const prev = c.dist;
          c.CR.speedMult(c, dt, true);
          c.dist = Math.max(c.at, c.dist - c.v * dt);
          if (c.dist <= c.at) c.rush = 0; else if (c.v > 4) c.gait += END.runCadence * dt - (prev - c.dist) * c.CR.stepRate * Math.PI;
          step(c, prev, dt);
        } },
      { name: 'Looking down, then walking off', note: 'The end of the night: toes at the salt, he looks down at it, up at you, turns side on leaning on the staff, and walks back the way he came.', dist: SALT_D + 0.25, dur: 6.4, fit: { y0: -0.3 },
        back(ctx, c, P) { if (!c.away) saltLine(ctx, c, P); },
        set(c) { c.frozen = true; c.turnDir = 1; },
        tick(c, k, dt, u) {   // night03 aftermath 'stand', then 'walk'
          const T1 = END.stop, T2 = T1 + END.bow, T3 = T2 + END.look, T4 = T3 + END.rise, T5 = T4 + END.turn, prev = c.dist;
          c.CR.speedMult(c, dt, true);
          if (u < T5) {
            bowTo(c, u >= T1 && u < T3 ? 1 : 0, 1 / (u < T3 ? END.bow : END.rise), dt);
            if (u >= T4) c.turn = clamp((u - T4) / END.turn, 0, 1);
          } else { c.turn = 1; c.away = true; c.bow = 0; c.dist += dt * END.walkSpeed; }
          step(c, prev, dt);
        } },
      LAB.lunge({ dist: 1.4, dur: 2.4, zoom: 2.2, note: 'He reaches you: the staff falls away and both bony hands come up at you, grinning.' }),
    ],
  });
})();
