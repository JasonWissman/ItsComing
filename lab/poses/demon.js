'use strict';
// Night 13, The Void: the demon (js/creatures/demon.js; its moods and its ending are set by js/levels/night13.js)
(() => {
  const CR = CREATURES.demon;
  const PACE = 40 / 75;   // night 13's startDist / time: metres a second at speedMult 1 (seenMult 1)
  const span = (t, a, b) => smoothstep(clamp((t - a) / (b - a), 0, 1));
  // night 13's END, in seconds from when it reaches you (the wait, while it sits crying, takes no time on it)
  const END = {
    settle: 1.0, stoop: [0.2, 2.2], near: [0.9, 3.0], reach: [0.8, 3.6], close: [3.8, 5.6], unveil: [5.0, 6.4], moods: 6.4, lean: [9.2, 9.8, 10.8, 11.6], sad: 13.55,
    letGo: [14.8, 16.4], back: [15.4, 17.8], sitDist: 2.4, slump: [17.4, 19.8], sit: 19.8, go: [19.8, 23.0], goDist: 1.3, look: [20.6, 22.8], calm: [21.2, 24.4],
    offer: [22.8, 24.8], take: [24.4, 26.2], rise: [26.6, 29.8], content: [30.0, 31.0], happy: [32.0, 33.0], release: 34.0,
    light: [33.8, 39.8], walk: [35.0, 38.6], disrobe: [39.2, 41.8], dance: [41.4, 45.9],
  };
  const D0 = CR.catchDist;   // where it is when it reaches you
  const rageFor = anger => (anger > 0 ? Math.min(1, 0.6 + 0.4 * anger / 6) : 0);
  // the light it carries (night 13's dynamicLights): its own dull red, more as it rages; while it holds you, the light of
  // its face (moodLight); in the meadow the sun on it. As LIGHT.at has it at its middle, with the flicker LIGHT.update gives
  const DULL = [[200, 60, 60], 0.25, 0.5];
  const MOOD_LIGHT = [[[255, 46, 30], 0.6, 0.7], [[200, 176, 184], 0.34, 0.15], [[255, 46, 30], 0.6, 0.7], [[176, 170, 226], 0.4, 0.25], [[120, 140, 210], 0.36, 0.2], [[226, 200, 188], 0.38, 0.1], [[255, 206, 166], 0.45, 0.05], [[255, 226, 176], 0.6, 0.05]];
  const flick = (f, t) => 1 + f * 0.35 * (Math.sin(t * 17.3 + 13) + 0.6 * Math.sin(t * 29.1 + 26) + 0.4 * Math.sin(t * 7.7));
  function ownLight(c) {
    const reveal = c.meadow || 0, lv = c.leave || 0, out = [];
    if (c.endT !== undefined) {
      const m = c.mood || 0, i = Math.min(Math.floor(m), MOOD_LIGHT.length - 2), k = smoothstep(m - i), A = MOOD_LIGHT[i], B = MOOD_LIGHT[i + 1], u = c.unveil === undefined ? 1 : c.unveil;
      const more = 0.16 * span(c.endT, 0.3, 2.6) * (1 - Math.min(1, m));
      out.push({ r: 3, i: (lerp(DULL[1], lerp(A[1], B[1], k), u) + more) * (1 - reveal) * c.fade, color: mixc(DULL[0], mixc(A[0], B[0], k), u), flicker: lerp(DULL[2], lerp(A[2], B[2], k), u), d: 0.1 });
    } else {
      const a = (c.rage || 0) * (1 - (c.calm || 0));
      out.push({ r: 3 + a * 4, i: (0.25 + a * 0.5) * c.fade, color: [200, 60, 60], flicker: 0.5, d: 0.1 });
    }
    if (reveal * (1 - lv) > 0.01) out.push({ r: 10, i: 0.32 * reveal * (1 - lv), color: [255, 238, 200], d: 4 });   // the sun, up and off to the side
    let lit = 0, col = [0, 0, 0];
    for (const l of out) {
      if (l.d >= l.r) continue;
      const q = (1 - l.d / l.r) ** 2 * l.i * (l.flicker ? flick(l.flicker, c.t) : 1);
      lit += q; col = col.map((v, j) => v + l.color[j] * q);
    }
    return lit > 0.002 ? { lit, color: col.map(v => v / lit) } : null;
  }
  // P with its light (and, far off, the void's black fog) put in before the lab's own light and fog
  function voidP(P, c, fog) {
    const li = ownLight(c), f = fog || 0, k = col => mixc(LIGHT.apply(col, li), [0, 0, 0], f);
    return Object.assign({}, P, {
      fog: f, fogColor: [0, 0, 0],
      col: (col, s) => P.col(mixc(LIGHT.apply(col, li && s !== undefined ? { lit: li.lit * s, color: li.color } : li), [0, 0, 0], f), s),
      cola: (col, a) => P.cola(k(col), a),
    });
  }
  // drawn where it really is: its jerks aside (CR.lateral) move it across the view
  const drawAt = fog => (ctx, c, P) => { ctx.translate(c.lat || 0, 0); CR.draw(ctx, c, voidP(P, c, fog && fog(c))); };
  const voidFog = c => 1 - Math.exp(-c.dist / 14);   // night 13's fogDist
  // its walk as updateCreature drives it: speedMult (fits and all, when enraged) sets how far it comes this frame, the gait
  // follows the distance, and standing still the stride settles
  function come(c, dt, closeIn, minD) {
    const v = PACE * CR.speedMult(c, dt, true), moved = v * dt;
    if (closeIn) c.dist = Math.max(minD || 1.5, c.dist - moved);
    c.gait += moved * CR.stepRate * Math.PI;
    c.moving = moved > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
    c.lat = CR.lateral(c);
  }
  const holdAnger = (c, dt) => { c.rage += (rageFor(c.anger) - c.rage) * Math.min(1, dt * 4); };
  // the ending as night 13's update plays it, t seconds after it reached you (CR.ending). Bent down to you as it was when
  // it got to you (Y0, as the night bends it over the last few metres). The lab's eye stays where it is: you going to it is
  // it coming nearer, and your hand and its meet where they would in front of you
  const Y0 = -0.42;
  function ending(c, t, dt) {
    const still = !!c.stillMode, prev = c.dist, o = CR.ending(END, t, D0, Y0);
    c.endT = t; c.still = still; c.frozen = true;
    for (const k of ['settle', 'hug', 'unveil', 'yOff', 'kneel', 'bow', 'sob', 'calm', 'mood', 'hand', 'disrobe']) c[k] = o[k];
    c.dist = o.dist - o.eyeFwd;
    c.meadow = span(t, END.light[0], END.light[1]); c.soft = c.meadow;
    let dance = t > END.dance[0] && t < END.dance[1] ? Math.min(1, (t - END.dance[0]) * 2, (END.dance[1] - t) * 2) : 0;
    const u = (t - END.dance[1] - 7) % 12;
    if (t > END.dance[1] + 7 && u < 2.6 && !c.leaving) dance = 0.5 * Math.min(1, u * 2, (2.6 - u) * 2);
    c.dance = still ? 0 : dance;
    // (a night's distFn walks it, so its legs go with the distance even though it is frozen)
    const moved = Math.abs(c.dist - prev);
    c.gait += moved * CR.stepRate * Math.PI; c.moving = moved > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  }
  // a stretch of the ending, from t0 on
  const endPart = (t0, extra) => Object.assign({
    still: true,
    set(c) { c.tilt0 = CR.tilt(c); c.settle = 0; c.mood = 0; c.unveil = 0; c.dist = D0; c.stillMode = !!extra.reduced; ending(c, t0, 0); c.gait = 0; c.moving = false; },
    tick(c, k, dt, T) { ending(c, extra.hold ? t0 : t0 + T, dt); },
    draw: drawAt(),
  }, extra);
  // the face, close up: as it holds you, bent down to your face, about 0.7 m off
  const FACE = { h: 2.25, y0: 1.45, w: 0.6 };
  const base = LAB.lunge();
  LAB.creature('demon', {
    night: 13, stage: 'The Void', dist: 8, fit: { h: 2.75, w: 1.3 },
    anims: [
      { name: 'Far off in the dark', note: 'Empty-handed, far out in the void: the black fog has the robe, and all there is of it is two pale points (no haze round them).', dist: 24, dur: 6, draw: drawAt(voidFog),
        tick(c, k, dt) { come(c, dt, false); } },
      { name: 'Walking at you, empty-handed', note: 'Your hands empty, it only walks: from 8 m in to you, its arms rising toward you and bending down to you over the last few metres (so close in, its head stays in the view).', dur: 12, draw: drawAt(),
        tick(c, k, dt) { come(c, dt, true, 1.2); c.yOff = -0.42 * smoothstep(clamp((3.6 - c.dist) / 2.4, 0, 1)); } },
      { name: 'Enraged, coming on in fits', note: 'Holding three things: red slit eyes, the snarl, the shaking, and its fits (stop dead, step, lurch) and jerks aside as it comes from 12 m.', dist: 12, dur: 11, fit: { h: 3.4, w: 1.9 }, draw: drawAt(),
        set(c) { c.anger = 3; c.rage = rageFor(3); }, tick(c, k, dt) { holdAnger(c, dt); come(c, dt, true, 1.5); } },
      { name: 'Taking something up, and putting it down', note: 'You pick one thing up at 1 s and put it down at 5 s: its rage comes on and goes off again at the rate the night eases it.', dist: 7, dur: 8.5, fit: { h: 3.3, w: 1.9 }, draw: drawAt(),
        tick(c, k, dt, T) { c.anger = T >= 1 && T < 5 ? 1 : 0; holdAnger(c, dt); come(c, dt, false); } },
      endPart(0, { name: 'It takes hold of you', note: 'Caught empty-handed and facing it (the ending): it stops, its head comes level, it bends down to you, its arms come out and close round the view, and its angry face comes up out of the hood.', dur: 6.6, fit: { h: 2.8, y0: 1.35, w: 0.9 } }),
      endPart(END.moods - 0.2, { name: 'Its faces, holding you', note: 'Holding you, its face goes through angry, neutral, angry again (leaning in close at you, and drawing back), confused, then a glitching flicker of faces (pain, envy, sorrow, grimace, terror, empty, shock, each snapped to the next) to sad, crying, its light changing with each.', dur: 8.4, fit: FACE }),
      endPart(END.lean[0] - 0.3, { name: 'Angry again, leaning in', note: 'Into its second angry face it leans in at you, closer (0.48 m) and lower, holds it, and draws back to where it was as it goes confused.', dur: 3.4, fit: FACE }),
      endPart(END.sad - 0.2, { name: 'Crying, it lets you go and sinks down', note: 'Sad and crying, it lets you go (its arms come away from round you and down), straightens and steps back to 2.4 m, and sinks down onto the ground, its head bowed, its hands in its lap, its shoulders heaving.', dur: 6.6, fit: { h: 2.8, w: 1.4 } }),
      endPart(END.sit, { name: 'Sitting crying, waiting for you', note: 'On the ground, its head bowed, crying (the tears running, its shoulders heaving in sobs), for as long as you wait: the ending stops here until you click, or press the key that looks up or zooms.', dur: 6, hold: true, fit: { h: 2.8, w: 1.4 } }),
      endPart(END.sit, { name: 'Sitting crying, reduced motion', note: 'The same with reduced motion on (c.still): no heaving or trembling, the tears not running.', dur: 4, hold: true, reduced: true, fit: { h: 2.8, w: 1.4 } }),
      endPart(END.go[0], { name: 'You go to it', note: 'You go to it (here it comes nearer: in the game the view goes in to it, a step at a time, and down): it looks up at you, and slowly stops crying, sad to neutral.', dur: 4.6, fit: { h: 2.8, w: 1.4 } }),
      endPart(END.offer[0] - 0.2, { name: 'Its hand, and yours', note: 'It holds out its hand to you, open and palm up; your right hand comes up from below the view and lies in it, and its long fingers close over the back of yours. Then it stands, holding your hand, bending to you as it comes up.', dur: 7.6, fit: { h: 2.8, w: 1.6 } }),
      endPart(END.content[0] - 0.4, { name: 'Content, happy, letting go', note: 'Standing, holding your hand: content, then happy; a moment after, it lets go of your hand and straightens, settled and smaller.', dur: 5.4, fit: { h: 2.8, w: 1.6 } }),
      endPart(END.release - 0.2, { name: 'Letting go as the light comes', note: 'It lets go of your hand and straightens up, settled and smaller; the light comes and it steps back to 3.3 m.', dur: 5.6, fit: { h: 2.8, w: 1.3 } }),
      endPart(END.disrobe[0] - 0.3, { name: 'Taking off its robe', note: 'In the meadow, as the music box starts: its hands go up and push the hood back, take the robe at the shoulders and let it drop, the sleeves and black gloves sliding off with it; it hops clear of the heap.', dur: 3.4, fit: { h: 2.8, w: 1.6 } }),
      endPart(END.dance[0] - 0.2, { name: 'Dancing in the meadow', note: 'Out of the robe, in a yellow striped shirt, red shorts, white socks and blue sneakers, it dances a little to the music box beside the heap of it: hops, kicks, hands up and waving, its head rocking.', dur: 4.9, fit: { h: 2.8, w: 1.6 } }),
      { name: 'Fading away', note: 'After your press in the meadow: it fades out over two seconds as the bedroom comes up, the robe on the grass with it.', dur: 3, still: true, fit: { h: 2.8, w: 1.6 }, draw: drawAt(),
        set(c) { c.tilt0 = 0; ending(c, END.dance[1] + 1.6, 0); c.leaving = true; }, tick(c, k, dt, T) { ending(c, END.dance[1] + 1.6 + T, dt); c.leave = span(T, 0, 3.0); c.fade = clamp(1 - (T - 0.3) / 2.0, 0, 1); } },
      LAB.lunge({ note: 'Still holding something as it reaches you: enraged, it comes up into your face, lifted so its eyes end level with yours.', fit: { h: 3.4, w: 1.9 }, draw: drawAt(),
        set(c) { c.anger = 1; c.rage = rageFor(1); base.set(c); },
        tick(c, k, dt, T) { base.tick(c, k, dt, T); c.lat = lerp(c.lat, 0, 0.3); c.yOff = -(CR.eyesY(c) - CR.faceY) * smoothstep(c.lunge); } }),
      // drawn at with the bow: as night 13's rushStep has it, from where it was it is brought in on a steepening curve to reach
      // you as the draw comes to 0.8 (1.2 s); then the death lunge
      LAB.lunge({ name: 'Drawn at: it rushes you', note: 'The bow drawn at it (it is never loosed here): enraged, it comes for you from 14 m, slowly and then faster and faster as the string comes back, and is on you before the bow is full: the death lunge.', dist: 14, dur: 2.4, fit: { h: 3.4, w: 1.9 }, draw: drawAt(),
        set(c) { c.anger = 2; c.rage = rageFor(2); c.frozen = true; c.from = c.dist; },
        tick(c, k, dt, T) {
          const q = clamp(T / 1.2, 0, 1), prev = c.dist;
          c.rage += (lerp(rageFor(2), 1, q) - c.rage) * Math.min(1, dt * (4 + 8 * q));
          if (q < 1) { c.dist = lerp(c.from, CR.catchDist * 0.9, q * q * (0.4 + 0.6 * q)); c.gait += (prev - c.dist) * CR.stepRate * Math.PI; c.moving = true; c.lat = CR.lateral(Object.assign({}, c, { frozen: false })); return; }
          if (!c.lungeFrom) { c.lungeFrom = c.dist; c.lat = 0; }
          base.tick(c, k, dt, T - 1.2); c.yOff = -(CR.eyesY(c) - CR.faceY) * smoothstep(c.lunge);
        } }),
    ],
  });
})();
