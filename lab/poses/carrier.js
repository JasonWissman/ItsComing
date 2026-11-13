'use strict';
// Night 11, The Farm: the carrier (js/creatures/carrier.js; its moves are set by js/levels/night11.js)
(() => {
  const CR = CREATURES.carrier;
  // night 11's paces: creeping in (CREEP, metres a second; unseen it goes unseenMult 1.3 times as fast), the run round to the
  // next place (RUN), and how long a flinch lasts before it runs
  const CREEP = { lit: 0.2, dark: 0.62, blackout: 2.4, back: 2.6 };
  const RUN = { speed: 6.5, min: 0.8, max: 3.4, flinch: 0.32 };
  const RUN_T = clamp(2 * Math.PI * 18 / 8 / RUN.speed, RUN.min, RUN.max);   // to a neighbouring place, an eighth of the way round at about 18 m
  const FALL = CR.FALL, FALL_END = FALL.shriek + FALL.sink + FALL.apart + 1.8;
  // its legs as updateCreature moves them: the distance it came this frame, or settling to a rest
  function step(c, dt, moved) {
    c.gait += Math.abs(moved) * CR.stepRate * Math.PI; c.moving = Math.abs(moved) > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  }
  // its shade eases toward the dark or the light of where it is (night 11: c.shade += (to - c.shade) * dt * 7)
  const shadeTo = (c, to, dt) => { c.shade += (to - c.shade) * Math.min(1, dt * 7); };
  // the run's stride: quick in the middle of the run, slower at either end
  const runStride = (c, dt, u) => { c.runGait = (c.runGait || 0) + dt * 15 * (0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.2 + 0.1))); };
  const base = LAB.lunge();
  LAB.creature('carrier', {
    night: 11, stage: 'The Farm', dist: 16, fit: { h: 1.75, w: 1.3 },
    setup(c) { c.shade = 1; },
    anims: [
      { name: 'Waiting in the dark', note: 'At the foot of its place in the shadow, all but black: two pale points of eyes, blinking now and then.', dur: 4.4 },
      { name: 'Creeping in, in the dark', note: 'With the porch light off it creeps in from its place toward you, still in shadow.', dur: 5, walk: CREEP.dark },
      { name: 'Coming for you in the blackout', note: 'The fuse blown, every light out: it comes for you fast, from 14 m to you, the mouth opening as it nears.', dist: 14, dur: 5.4,
        tick(c, k, dt) { const d = Math.max(1.5, c.dist - CREEP.blackout * dt); step(c, dt, c.dist - d); c.dist = d; } },
      { name: 'Lit up: it flinches and runs', note: 'Its place\'s floodlight comes on at 0.6 s: it shows in the light, rears back with an arm over its face, then runs side on to a dark neighbour and sinks back into shadow.',
        dur: 0.6 + RUN.flinch + RUN_T + 0.4, lit: 0.55, fit: { w: 1.6 },
        tick(c, k, dt, T) {
          const t = T - 0.6;
          if (t < 0) { step(c, dt, CREEP.dark * dt); return; }
          step(c, dt, 0);
          if (t < RUN.flinch) { c.recoil = Math.min(1, t / 0.12); shadeTo(c, 0, dt); return; }
          c.recoil = 0; c.runPose = true; c.runDir = 1; c.runPace = 1;
          const u = clamp((t - RUN.flinch) / RUN_T, 0, 1);
          if (u < 1) runStride(c, dt, u); else c.runPose = false;
          shadeTo(c, u < 0.5 ? 0 : 1, dt);   // (lit by the nearer of the places it is between)
        } },
      { name: 'Running round to a dark place', note: 'Side on, bent double round its bundle, legs going like pistons: the run from a lit place to the next one round.', dur: RUN_T, fit: { w: 1.6 },
        set(c) { c.runPose = true; c.runDir = 1; c.runPace = 1; c.shade = 0; }, tick(c, k, dt) { runStride(c, dt, k); } },
      { name: 'Backing out of the porch light', note: 'Caught inside the porch light as it comes on: it rears back with an arm over its face and backs off to the light\'s edge.', dur: 2, lit: 0.35,
        tick(c, k, dt, T) { c.recoil = T < 0.5 ? Math.min(1, T / 0.12) : Math.max(0, 1 - (T - 0.5) / 0.2); step(c, dt, T > 0.3 && T < 0.95 ? CREEP.back * dt : 0); } },
      { name: 'Coming apart in the light', note: 'The win, caught in the light with nowhere dark to go: it shrieks, its knees go, it comes apart into sacking and straw, and the dust goes up.',
        dur: FALL_END, lit: 0.55, fit: { w: 2.4 },
        set(c) { c.fallT = 0; c.fallSide = 1; c.shade = 0; }, tick(c, k, dt, T) { c.fallT = T; } },
      LAB.lunge({ note: 'It reaches you in the dark: a little of it shows in your face, the arms opening off the bundle.', dist: CR.catchDist,
        set(c) { c.shade = 0.45; c.runPose = false; base.set(c); } }),
    ],
  });
})();
