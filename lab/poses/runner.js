'use strict';
// Night 5, The Clearing: the runner (js/creatures/runner.js; its moves are set by js/levels/night05.js and the bow there)
(() => {
  const NIGHT = { D0: 115, T: 62 };   // night 5's creatures entry: startDist 115, time 62
  // the game's update (game.js updateCreature): its own modes set the pace, u at m/T a second (or the fall's own distFn once
  // it is dead), the legs from how far it moved, and where it is off its way (lateral), which the fall goes by
  const drive = (c, dt) => {
    const CR = c.CR, prev = c.dist;
    let m = CR.speedMult(c, dt, true) * c.seenMult;
    if (c.dead) m = 0;
    if (c.distFn) c.dist = c.distFn(c, dt);
    else { c.u = clamp(c.u + dt * m / c.T, 0, 1); c.dist = Math.max(c.catchDist, c.D0 * (1 - c.u)); }
    const moved = Math.abs(prev - c.dist);
    c.gait += moved * CR.stepRate * Math.PI; c.moving = moved > 0.024 * dt;
    if (!c.moving && !c.dead) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
    c.lat = CR.lateral(c);
  };
  // an arrow in it (night05 hitIt): the first puts it down in the snow for a moment, the second kills it
  const hit = c => {
    c.hits++; c.hurtFlash = 0.35; c.arrows.push(c.hits);
    if (c.hits === 1) c.CR.hurt(c); else c.CR.kill(c);
  };
  const wounded = c => { c.hits = 1; c.arrows = [1]; c.wounded = true; };
  LAB.creature('runner', {
    night: 5, stage: 'The Clearing', dist: 16,
    setup(c) { c.D0 = NIGHT.D0; c.T = NIGHT.T; c.u = 1 - c.dist / c.D0; },
    anims: [
      { name: 'Sprinting at you', note: 'Flat out across the snow at you: low and bent hard over, heavy uneven strides, arms pumping and clawing, the head thrust out and jerking, the jaw hanging open.', dist: 26, dur: 4,
        set(c) { c.CR.sprint(c); c.sprintFor = 99; }, tick(c, k, dt) { drive(c, dt); } },
      { name: 'Sprint, drop, watch', note: 'Its pattern out in the open: a sprint of a second or two, then down on all fours, head raised, watching you as it creeps from side to side on its hands and feet, then up and on again.', dist: 40, dur: 7,
        set(c) { c.darts = Infinity; }, tick(c, k, dt) { drive(c, dt); } },
      { name: 'Breaking sideways', note: 'Out past 16 m, and when you draw the bow on it: side on, flat out along the tree line to a new place, then down to watch from there.', dist: 30, dur: 2.6, fit: { w: 2.0 },
        set(c) { c.CR.sprint(c); c.CR.breakAway(c); c.darts = Infinity; }, tick(c, k, dt) { drive(c, dt); } },
      { name: 'First arrow: down, and up again', note: 'Hit once while sprinting: its knees give and it topples sideways all the way down into the snow, lies there about a second, bleeding and twitching, then its head comes up, it plants a hand, pushes itself up onto its hands and feet and comes on again, faster and wary.', dist: 20, dur: 5, fit: { w: 2.3 },
        set(c) { c.CR.sprint(c); c.sprintFor = 99; c.darts = Infinity; },
        tick(c, k, dt, T) { if (T >= 0.6 && !c.hits) hit(c); drive(c, dt); } },
      { name: 'First arrow, on all fours', note: 'Hit once while it is down watching you: its arms go from under it, its head drops and it rolls over onto its side in the snow, lies there, and gets up as it does from a sprint.', dist: 20, dur: 4.6, fit: { w: 2.3 },
        set(c) { c.mode = 'crouch'; c.modeT = 0; c.darts = Infinity; },
        tick(c, k, dt, T) { if (T >= 0.6 && !c.hits) hit(c); else if (!c.hits) c.modeT = 0.5; drive(c, dt); } },
      { name: 'First arrow, side on', note: 'Hit once as it breaks sideways: it pitches forward out of its run, skids on its side the way it was going, lies there, and gets up.', dist: 30, dur: 4.4, fit: { w: 2.6 },
        set(c) { c.CR.sprint(c); c.CR.breakAway(c); c.dartDur = 1.1; c.darts = Infinity; },
        tick(c, k, dt, T) { if (T >= 0.45 && !c.hits) hit(c); drive(c, dt); } },
      { name: 'Hurt and wary', note: 'After the first arrow it never comes straight: a wide, quick, uneven weave, and every second or two it breaks to one side and runs on from there, until it is near (the card shows where it is from side to side). Unhurt, with the bow drawn on it, it holds its line instead.', dist: 42, dur: 4.8, fit: { w: 11, h: 3 },
        set(c) { wounded(c); c.CR.sprint(c); },
        tick(c, k, dt) { drive(c, dt); },
        draw(ctx, c, P, CR) { ctx.translate(c.lat, 0); CR.draw(ctx, c, P); } },
      { name: 'Second arrow: it falls', note: 'Hit again as it comes on wounded: its knees give, it topples sideways into the snow and lies there with the arrows in it, twitching less and less.', dist: 14, dur: 6.5, fit: { w: 2.3 },
        set(c) { wounded(c); c.CR.sprint(c); c.darts = Infinity; },
        tick(c, k, dt, T) { if (T >= 0.7 && c.hits < 2) hit(c); drive(c, dt); } },
      { name: 'Second arrow while it is down', note: 'Hit again before it is back up from the first, here as it pushes itself up: it drops back into the snow and lies there twitching.', dist: 16, dur: 6.5, fit: { w: 2.3 },
        set(c) { c.CR.sprint(c); c.sprintFor = 99; c.darts = Infinity; },
        tick(c, k, dt, T) { if ((T >= 0.4 && !c.hits) || (T >= 2.1 && c.hits < 2)) hit(c); drive(c, dt); } },
      LAB.lunge({ dist: 1.4, dur: 1.2, note: 'It reaches the porch: up out of its sprint, its long hands reaching for your face, its black hair hanging round it.',
        set(c) { c.CR.sprint(c); c.frozen = true; c.lungeFrom = c.dist; } }),   // it catches you running, not crouched
    ],
  });
})();
