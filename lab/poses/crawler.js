'use strict';
// Night 2, The Car: the crawler (js/creatures/crawler.js; its moves are set by js/levels/night02.js; its leap into the road and what it does hit by the car are its own)
(() => {
  const NIGHT = { D0: 85, T: 90 };   // night 2's creatures entry: startDist 85, time 90 (a steady pace, gamma 1)
  const RAM_GAP = 2.6, LIE = 15;    // driving at it: where the bumper meets it, from your seat, and where it comes to rest down the road ahead
  // hit by the car (night02 ramOn, after the hit): as the crawler's own struck(T) has it, T seconds after the blow
  const struck = (c, T) => { const p = c.struck = c.CR.struck(T); c.yOff = p.y; c.dist = lerp(RAM_GAP, LIE, p.along); };
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
  // up on its hind legs, after the car hit it: its hitch and drag (CR.speedMult runs its stride, c.up), no nearer than the catch
  const comes = (c, dt) => { drive(c, dt, c.CR.speedMult(c, dt, true) * c.seenMult); c.dist = Math.max(c.dist, 1.4); };
  LAB.creature('crawler', {
    night: 2, stage: 'The Car', dist: 12, lit: 0.5,
    setup(c) { c.D0 = NIGHT.D0; c.T = NIGHT.T; c.u = 1 - c.dist / c.D0; },
    anims: [
      { name: 'Scuttling down the road', note: 'Far off in the headlights: a fast jittering scuttle, then a dead stop with the head raised, again and again.', dist: 30, dur: 7, lit: 0.35,
        tick(c, k, dt) { bursts(c, dt); } },
      { name: 'Closing in', note: 'The bursts bring it up to the windshield: the mouth opens wider and the teeth show as it nears.', dist: 13, dur: 9, lit: 0.6,
        tick(c, k, dt) { bursts(c, dt); } },
      { name: 'Hit by the car', note: 'You put it in drive with it in the road: it scuttles flat out at the car, the car hits it, and it is knocked back off the bumper and away down the road, turning over, to lie in a heap in the lights 15 m off.', dist: 30, dur: 2.9, lit: 0.65, fit: { h: 3.1, w: 2.7 },
        set(c) { c.mode = 'scuttle'; c.modeT = -2; c.ram = { t: 0, v: 0, s: 0, from: c.dist, T: clamp(0.4 + c.dist / 60, 0.6, 1.4) }; },
        tick(c, k, dt, T) {
          const r = c.ram;
          c.CR.speedMult(c, dt, true);
          if (!c.frozen) {   // night02 ramOn: the car leaps at it as it comes; the gap between them is what you see
            r.t += dt; r.v += 9 * dt; r.s += r.v * dt;
            const q = Math.min(1, r.t / r.T);
            c.dist = (r.from - r.s) * (1 - q * q) + RAM_GAP * q * q;
            if (q >= 1) { c.dist = RAM_GAP; c.frozen = true; r.hitT = T; }
            return;
          }
          struck(c, T - r.hitT);   // and thrown from there
        } },
      { name: 'Leaping into the road', note: 'You drive its way with it off the road, on a verge or off a corner of the car: it springs into the road in front of the moving car in one long low bound (0.35 to 0.5 s), lands, and the car hits it.', dist: 9, dur: 1.5, lit: 0.6, fit: { h: 2.4, w: 2.7 },
        set(c) { c.mode = 'scuttle'; c.modeT = -2; c.leap = 0; c.runDir = -1; },
        tick(c, k, dt, T) {   // night02 ramOn: a beat crouched, the bound (c.leap, its height the night's), a beat where it landed
          const q = clamp((T - 0.35) / 0.5, 0, 1);
          c.CR.speedMult(c, dt, true);
          if (q < 1) { c.leap = q; c.yOff = 0.9 * 4 * q * (1 - q); } else { c.leap = undefined; c.yOff = 0; }
        } },
      { name: 'Knocked back down the road, and getting up', note: 'The easter egg: the car hits it and it is knocked back down the road, turning over, to lie in a heap 15 m off, on its side, one arm bent up into the air. A beat; the arm jerks. It gets its limbs under it one at a time and stands up on its hind legs, in jolts, its head hanging on one side. The head snaps up at you. And it comes on at the car again as it is, up on its hind legs (5.1 s after the blow): the car is yours meanwhile, and the other way is the way out.', dist: RAM_GAP, dur: 8, lit: 0.7, fit: { h: 2.4, w: 2.7 },
        set(c) { c.frozen = true; },
        tick(c, k, dt, T) {
          const K = c.CR.STRUCK;
          if (T < K.go) { struck(c, T); return; }
          if (c.struck) { c.struck = null; c.yOff = 0; c.frozen = false; c.dist = LIE; c.u = 1 - LIE / c.D0; c.up = c.CR.upright(); }
          comes(c, dt);   // and it comes, up
        } },
      { name: 'Standing up in the road', note: 'Hit by the car, it got up, and it stays up: taller than a man, bow-legged, swaying, its arms hanging to its knees. Held where it is (the car coming at it again, or the car gone), its head lolls over and rolls, and every so often snaps up straight at you, mouth open, and shakes there.', dist: 9, dur: 6, lit: 0.6, fit: { h: 2.4, w: 2.2 },
        set(c) { c.up = c.CR.upright(); c.frozen = true; },
        tick(c, k, dt) { c.CR.speedMult(c, dt, true); } },
      { name: 'Coming back at the car, upright', note: 'Up on its hind legs it comes back at the car, as nothing that goes on all fours should: a hitch and a drag. Its bad left leg takes its weight and buckles, the trunk lurching over, while the right is snatched up and flung down (now and then a deeper stagger); then the left is hauled after it stiff, swung out in an arc, hip hiked, toes scraping. The right arm swings with the right leg, the left hangs dead and flops out and across after the lurch. The head lolls and rolls, and snaps up at you every other stride; near the car it stops looking away, its hands come up, and the stride quickens.', dist: 12, dur: 7.5, lit: 0.6, fit: { h: 2.4, w: 2.4 },
        set(c) { c.up = c.CR.upright(); },
        tick(c, k, dt) { comes(c, dt); } },
      { name: 'Through the glass, from standing', note: 'Up, and caught at the car (It got right back up.): it rears up at the glass on its toes, its arms flung up over its head and its mouth wide, then throws itself forward onto the bonnet and in through the glass, arms first, its legs kicked up behind it (0.42 s; the glass at 0.32 s).', dist: 1.3, dur: 1.4, lit: 0.65, zoom: 3, still: true, fit: { h: 2.7, w: 2.6 },
        set(c) { c.up = c.CR.upright(); c.up.w = 1; c.up.ph = 0.9 * TAU; c.frozen = true; c.lungeFrom = c.dist; c.CR = Object.assign({}, c.CR, { faceY: 1.5 }); },
        tick(c, k, dt, T) {   // night02 lungeUp
          const q = clamp((T - 0.3) / 0.42, 0, 1);
          c.up.lunge = c.lunge = q; c.dist = q < 0.75 ? lerp(c.lungeFrom, 1.0, Math.pow(clamp((q - 0.35) / 0.4, 0, 1), 2)) : lerp(1.0, 0.55, (q - 0.75) / 0.25);
        } },
      { name: 'Over the bonnet, from standing', note: 'Up, and driven at a second time (It is too strong, even for a car.): it stops and stares, lurches at the car as fast as it can as the car comes at it, gathers itself low, and 6.5 m off hurls itself up off the road and over the bonnet in one bound, arms thrown up and out ahead of it, legs hanging under it, and comes down through the glass.', dist: 9, dur: 2, lit: 0.65, zoom: 4, still: true, fit: { h: 2.7, w: 2.6 },
        set(c) { c.up = c.CR.upright(); c.up.w = 1; c.lungeFrom = 6.5; c.CR = Object.assign({}, c.CR, { faceY: 1.5 }); },
        tick(c, k, dt, T) {   // night02 readyOn and spring: staring, the rush, the crouch, the bound
          const u = c.up, fly = 0.36, sp = 1.05;
          c.frozen = T < 0.45; u.stare = 1; u.rush = T >= 0.45; c.CR.speedMult(c, dt, true);
          u.crouch = smoothstep((T - (sp - 0.14)) / 0.14);
          if (T < sp) { c.dist = lerp(9, 6.5, smoothstep(T / sp)); c.yOff = 0; return; }
          const v = clamp((T - sp) / fly, 0, 1);
          c.lunge = v; c.dist = v < 1 ? lerp(6.5, 1.0, Math.pow(v, 1.6)) : lerp(1.0, 0.55, clamp((T - sp - fly) / 0.08, 0, 1));
          c.yOff = (1.15 - 1.62) * smoothstep(v) + 0.55 * 4 * v * (1 - v);
          u.dive = Math.min(1, v * 2.2); u.crouch = Math.max(0, 1 - v * 4);
        } },
      { name: 'Shying out of the lights', note: 'Driving away past it on the verge: side on, it scuttles flat out across the verge out of the headlights.', dist: 8, dur: 2, lit: 0.2, fit: { w: 2.2 },
        set(c) { c.runPose = true; c.runDir = 1; },
        tick(c, k, dt) { c.CR.speedMult(c, dt, true); c.runGait = (c.runGait || 0) + 9 * dt * 5.5; } },   // across at 9 m/s, its legs at 5.5 a metre
      { name: 'Running round the car', note: 'Partway in it breaks off and runs flat out round the car through the dark, side-on, to the side of the car or the road behind it.', dist: 30, dur: 3, lit: 0.15, fit: { w: 2.2 },
        set(c) { c.runPose = true; c.runDir = -1; },
        tick(c, k, dt) { c.CR.speedMult(c, dt, true); c.runGait = (c.runGait || 0) + 20 * dt * 5.5; } },   // round at 20 m/s, its legs at 5.5 a metre
      { name: 'Rearing at the glass', note: 'Close beside the car or behind it, it rears up at the window so it shows over the sill.', dist: 2.4, dur: 3, lit: 0.3,
        tick(c, k) { c.yOff = 0.42 * smoothstep(Math.min(1, k * 2)); } },
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
