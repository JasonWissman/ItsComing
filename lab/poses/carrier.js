'use strict';
// Night 11, The Farm: the carrier (js/creatures/carrier.js; its moves are set by js/levels/night11.js)
(() => {
  const CR = CREATURES.carrier;
  // night 11's paces: creeping in (CREEP, metres a second; unseen it goes unseenMult 1.3 times as fast), the run round to the
  // next place (RUN), and how long a flinch lasts before it runs
  const CREEP = { lit: 0.2, dark: 0.62, back: 2.6 };
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
      { name: 'Coming for you, the lights all out', note: 'The main tripped (or the porch light off): it creeps in at its own pace from 5 m to you, straining at the stitches of its sewn mouth as it nears.', dist: 5, dur: 6,
        tick(c, k, dt) { const d = Math.max(1.5, c.dist - CREEP.dark * dt); step(c, dt, c.dist - d); c.dist = d; } },
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
      // the farm set alight (every switch on with the main off, then the main pushed on): it burns, runs about, and comes
      { name: 'Catching fire', note: 'The easter egg: every switch set on with the main off, then the main pushed on. A big spark from the bursting box lands on it: the fire takes it from its middle out over 0.7 s, it scorches, and it throws its arms up over its head, beating at the flames.',
        dur: 2.6, lit: 0.4,
        set(c) { c.shade = 0; c.burn = 0; c.char = 0; c.flail = 0; }, tick(c, k, dt, T) { c.burn = clamp((T - 0.3) / 0.7, 0, 1); c.char = c.burn ? Math.min(0.85, 0.3 + (T - 0.3) / 4) : 0; c.flail = clamp((T - 0.5) / 0.3, 0, 1); } },
      { name: 'Burning, running about', note: 'Running about the yard in the open, on fire, side on: the flames streaming back off it, scorched near black, the near arm let go of its bundle and beating at the fire over its head (the bundle is not drawn: nothing on the front of its belly). It runs where you are looking, shrieking, until you have watched it a few seconds.',
        dur: RUN_T, lit: 0.4, fit: { w: 1.6, h: 2.2 },
        set(c) { c.runPose = true; c.runDir = 1; c.runPace = 1; c.shade = 0; c.burn = 1; c.char = 0.8; }, tick(c, k, dt) { c.runGait = (c.runGait || 0) + dt * 17; } },
      { name: 'Burning, turning on you', note: 'It stops, faces you and beats at itself, both arms flailing over its head, shrieking against its stitches (0.6 s), then charges.',
        dur: 1.6, lit: 0.4, fit: { h: 2.4 },
        set(c) { c.shade = 0; c.burn = 1; c.char = 0.85; c.flail = 1; c.charge = 0; } },
      { name: 'Burning, charging', note: 'Straight at you at 8.5 m/s, its arms opening off its bundle and reaching, its stitches straining, from 9 m in to you.', dist: 9, dur: 1.2, lit: 0.4,
        fit: (c, T) => ({ h: 2.2 + c.dist * 0.1 }),
        set(c) { c.shade = 0; c.burn = 1; c.char = 0.85; c.flail = 0; c.charge = 1; c.dist = 9; },
        tick(c, k, dt) { const d = Math.max(1.5, c.dist - 8.5 * dt); step(c, dt, c.dist - d); c.dist = d; } },
      LAB.lunge({ name: 'Death lunge, burning', note: 'It has you, on fire: in your face, lit up, the flames low on its body and rising up from behind its head and shoulders (its face is left clear of them, and every flame has its foot on it), the stitches snapping. The card reads "Apparently the electrical box wasn\'t rated for that."', dist: CR.catchDist,
        set(c) { c.shade = 0; c.runPose = false; c.burn = 1; c.char = 0.85; c.charge = 1; c.deathSpec = { delay: 0.08, dur: 0.36 }; base.set(c); } }),
      LAB.lunge({ note: 'It reaches you in the dark: in your face it is lit up so you see it, the arms opening off the bundle, the stitches of its mouth pulling wide and two of them snapping, its teeth showing through.', dist: CR.catchDist,
        set(c) { c.shade = 0.45; c.runPose = false; base.set(c); } }),
    ],
  });
})();
