'use strict';
// Night 2, The Car: the crawler (js/creatures/crawler.js; its moves are set by js/levels/night02.js)
(() => {
  const NIGHT = { D0: 85, T: 52 };   // night 2's creatures entry: startDist 85, time 52 (a steady pace, gamma 1)
  const RAM_GAP = 2.6;               // driving at it: where the car stops dead, from it
  // the game's walk in (game.js updateCreature): u at m/T a second, the distance from u, the legs from how far it moved
  const drive = (c, dt, m) => {
    const prev = c.dist;
    c.u = clamp(c.u + dt * m / c.T, 0, 1); c.dist = Math.max(c.catchDist, c.D0 * (1 - c.u));
    const moved = Math.abs(prev - c.dist);
    c.gait += moved * c.CR.stepRate * Math.PI; c.moving = moved > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  };
  // its bursts: a scuttle, then a pause with the head coming up (CR.speedMult runs its modes)
  const bursts = (c, dt) => drive(c, dt, c.CR.speedMult(c, dt, true) * c.seenMult);
  LAB.creature('crawler', {
    night: 2, stage: 'The Car', dist: 12, lit: 0.5,
    setup(c) { c.D0 = NIGHT.D0; c.T = NIGHT.T; c.u = 1 - c.dist / c.D0; },
    anims: [
      { name: 'Scuttling down the road', note: 'Far off in the headlights: a fast jittering scuttle, then a dead stop with the head raised, again and again.', dist: 30, dur: 7, lit: 0.35,
        tick(c, k, dt) { bursts(c, dt); } },
      { name: 'Closing in', note: 'The bursts bring it up to the windshield: the mouth opens wider and the teeth show as it nears.', dist: 13, dur: 9, lit: 0.6,
        tick(c, k, dt) { bursts(c, dt); } },
      { name: 'Rushing the car', note: 'You put it in drive with it in the road: it scuttles flat out at the car and comes through the windshield.', dist: 30, dur: 2.4, lit: 0.65, zoom: 2.4,
        set(c) { c.mode = 'scuttle'; c.modeT = -2; c.ram = { t: 0, v: 0, s: 0, from: c.dist, T: clamp(0.4 + c.dist / 60, 0.6, 1.4) }; },
        tick(c, k, dt, T) {
          const r = c.ram;
          c.CR.speedMult(c, dt, true);
          if (!c.frozen) {   // night02 ramOn: the car leaps at it as it comes; the gap between them is what you see
            r.t += dt; r.v += 9 * dt; r.s += r.v * dt;
            const q = Math.min(1, r.t / r.T);
            c.dist = lerp(r.from, r.s + RAM_GAP, q * q) - r.s;
            if (q >= 1) { c.dist = RAM_GAP; c.frozen = true; c.lungeFrom = RAM_GAP; r.hitT = T; }
            return;
          }
          const sp = c.CR.death, e = clamp((T - r.hitT - sp.delay) / sp.dur, 0, 1);   // and the death lunge from there
          c.lunge = e; c.dist = lerp(c.lungeFrom, 0.55, easeIn(e));
        } },
      { name: 'Shying out of the lights', note: 'Driving away past it on the verge: side on, it scuttles flat out across the verge out of the headlights.', dist: 8, dur: 2, lit: 0.2, fit: { w: 2.2 },
        set(c) { c.runPose = true; c.runDir = 1; },
        tick(c, k, dt) { c.CR.speedMult(c, dt, true); c.runGait = (c.runGait || 0) + 9 * dt * 5.5; } },   // across at 9 m/s, its legs at 5.5 a metre
      { name: 'Left behind in the road', note: 'Backing away with the lights full on it: it scuttles after the car in bursts, tires within a few seconds and crouches in the road watching you go.', dist: 12, dur: 4.4, lit: 0.5,
        set(c) { c.car = { t: 0, v: 0, s: 0, cz: c.dist, gap: Math.min(c.dist, Math.max(3, c.dist * 0.75)) }; },
        tick(c, k, dt) {   // night02 driveOn, in reverse: the car's way is -z, the thing on the road ahead of it
          const d = c.car;
          c.CR.speedMult(c, dt, true);
          d.t += dt; d.v = Math.min(13, d.v + 4.4 * smoothstep(d.t / 0.45) * dt); d.s += d.v * dt;
          const carZ = -d.s, burst = c.mode === 'scuttle' ? 10 : 1.8, tire = clamp(1 - (d.t - 1.6) / 1.4, 0, 1);
          if (d.t > 0.3) d.cz = Math.max(d.cz - burst * tire * dt, carZ + 4);
          d.cz = Math.max(d.cz, carZ + d.gap);
          if (tire === 0) c.frozen = true;
          c.dist = d.cz - carZ;
        } },
      LAB.lunge({ dist: 1.3, dur: 1.2, lit: 0.65, note: 'It reaches the car: through the windshield, the mouth wide open.' }),
    ],
  });
})();
