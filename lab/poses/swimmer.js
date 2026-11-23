'use strict';
// Night 6, The Boathouse: the swimmer (js/creatures/swimmer.js; its moves are set by js/levels/night06.js)
(() => {
  const CR = CREATURES.swimmer;
  const PACE = 70 / 105;                 // night 6's creature: startDist 70 m, time 105 s (its pace at speedMult 1, in m/s)
  const UNSEEN = 1.3;                    // its unseenMult: under the water it is unseen by definition
  // the swimmer's rings and splashes run on the night's clock (G.L.t): here, each card's own creature clock stands in for it
  const draw = (ctx, c, P) => { const t0 = G.L.t; G.L.t = c.t; try { CR.draw(ctx, c, P); } finally { G.L.t = t0; } };
  // a mode change from its own speedMult, stamped on the card's clock (as the game stamps it on the night's)
  const stamp = c => {
    if (c.mode === c.labMode) return;
    if (c.mode === 'up') c.surfaced = c.t; else { c.diveT = c.t; c.diveDist = c.dist; }
    c.labMode = c.mode;
  };
  // the water: dark from its water line down, a few paler streaks on it
  const water = (ctx, c, P) => {
    P_rect(ctx, -12, -8, 24, 8, P.col([22, 30, 38]));
    for (let i = 0; i < 7; i++) { const y = -0.06 - i * i * 0.05, x = ((i * 0.37) % 1 - 0.5) * 3; P_rect(ctx, x - 0.4 - i * 0.1, y, 0.8 + i * 0.2, 0.012 + i * 0.004, P.cola([60, 72, 86], 0.4)); }
  };
  // the rings the night leaves on the water where it went under (night06 L.dynamic): flat, spreading and fading over 2.6 s,
  // at the spot it dived (c.diveDist) while it swims on under the water; drawn here in perspective from the lab's eye
  const diveRings = (ctx, c, P) => {
    water(ctx, c, P);
    if (c.mode !== 'down' || c.lunge) return;
    const z = Math.max(c.diveDist || c.dist, c.dist), d = c.dist, eye = G.L.eyeH, k = clamp((c.t - c.diveT) / 2.6, 0, 1);
    const y = eye * (1 - d / z), s = d / z, w = (0.8 + k * 2.6) * s, flat = eye / z;
    P_ell(ctx, 0, y, w / 2, w / 2 * flat, P.cola([96, 118, 134], 0.14 * (1 - k)));
    ctx.strokeStyle = P.cola([170, 186, 196], 0.6 * (1 - k)); ctx.lineWidth = 0.025 * s;
    for (const r of [0.5, 0.3]) { ctx.beginPath(); ctx.ellipse(0, y, w * r, w * r * flat, 0, 0, TAU); ctx.stroke(); }
  };
  // the side door it swims across into (night06's east doorway: 1.1 m wide at 2.4 m), its jambs as they show at 5.7 m
  const D_SIDE = 5.7, JAMB = 0.55 * D_SIDE / 2.4;
  const doorway = (ctx, c, P) => {
    const wood = P.col([58, 48, 40]), dark = P.col([38, 32, 27]);
    for (const s of [-1, 1]) { P_rect(ctx, s > 0 ? JAMB : -JAMB - 0.24, -2, 0.24, 6, wood); P_rect(ctx, s > 0 ? JAMB : -JAMB - 0.03, -2, 0.03, 6, dark); }
  };
  // night06 swimRound, for the side door (lane 1): under for T1 s, then up off to its left and swimming across into the
  // doorway side on, slowing as it comes, closing 0.8 m; then it turns to the door and comes on at its surfaced pace
  const SW = { T1: 0.7, side: -1, out: 0.55 * D_SIDE / 2.4 + 0.9 };
  SW.across = 0.55 + SW.out * 0.22;
  // The Boathouse's easter egg (night06: the life ring thrown to it). The ring floating where it landed, as the night
  // draws it on the water (L.dynamic), until the thing comes up through it; and its steady pace in it, as speedMult sets it
  const RING_AT = 0.7;
  const ringPace = PACE * (CR.RING_UP * 0.55 + CR.RING_DOWN * 2.5 * UNSEEN) / (CR.RING_UP + CR.RING_DOWN);
  const floating = (ctx, c, P) => {
    water(ctx, c, P);
    if (c.ringOn) return;
    const y = CR.RING_H + CR.RING_Y + Math.sin(c.t * 2.1) * 0.02;
    P_ell(ctx, 0, 0, CR.RING_R + 0.2, (CR.RING_R + 0.2) * CR.ringK(c.dist), P.cola([150, 165, 175], 0.25));
    CR.lifeRing(ctx, P, 0, y, CR.RING_R, CR.ringK(c.dist), 0.3, null, CR.RING_TUBE);
  };
  const base = LAB.lunge();
  LAB.creature('swimmer', {
    night: 6, stage: 'The Boathouse', dist: 8, fit: { h: 0.75, w: 1.3, y0: -0.12 },
    setup(c) { c.surfaced = -9; c.diveT = -9; c.labMode = c.mode; },
    anims: [
      { name: 'Watching you from the water', note: 'Surfaced out on the water, only the crown and the staring eyes above it, the weed hanging off it, rings spreading round it.', dist: 8, dur: 6,
        back: water, draw },
      { name: 'Going under and coming up closer', note: 'Its night-long cycle: up for a few seconds, slow, then under (where it is fast) and up again much closer with a splash; the rings show where it went down.',
        dist: 22, dur: 11.5, modes: true, still: true, back: diveRings, draw,
        tick(c, k, dt) { stamp(c); c.dist = Math.max(3, c.dist - dt * PACE * (c.mode === 'down' ? 2.5 * UNSEEN : 0.55)); } },
      { name: 'Swimming side on', note: 'Its stroke as it swims across the water from a shut door to an open one: the long arms coming over and clawing in, the weed streaming back, a wake behind.',
        dist: 6, dur: TAU / 7.5 * 2, fit: { h: 0.5, w: 1.3, y0: -0.5 }, still: true, back: water, draw,
        set(c) { c.runPose = true; c.runDir = -1; c.runGait = 0; c.moving = true; }, tick(c, k, dt) { c.runGait += dt * 7.5; } },
      { name: 'Coming round to the open door', note: 'Shut out at one door, it goes under, comes up off to the side of the other and swims across into the doorway, then turns to it and comes on.',
        dist: D_SIDE, dur: SW.T1 + SW.across + 1.4, fit: { h: 0.9, w: 3.1, y0: -0.12 }, still: true, back: water, front: doorway,
        set(c) { c.mode = 'down'; },
        tick(c, k, dt, T) {
          if (T < SW.T1) { c.mode = 'down'; return; }
          if (T < SW.T1 + SW.across) {
            if (!c.runPose) { c.surfaced = c.t; c.runGait = 0; }
            c.mode = 'up'; c.runPose = true; c.runDir = -SW.side; c.runGait += dt * 7.5;
            const q = 1 - Math.pow(1 - (T - SW.T1) / SW.across, 2);
            c.runLat = SW.side * SW.out * (1 - q); c.dist = D_SIDE - 0.8 * q;
            return;
          }
          c.runPose = false; c.runLat = 0; c.dist -= dt * PACE * 0.55;
        },
        draw(ctx, c, P) { ctx.translate(c.runLat || 0, 0); draw(ctx, c, P); } },
      { name: 'Up through the life ring', note: 'The night\'s easter egg: the life ring thrown to it floats where it landed; it comes up through it, head and both arms up through the hole, holds its hands up out of the way and looks down at the ring, one side and the other, then at you, and starts to paddle.',
        dist: 6, dur: RING_AT + 2.6, fit: { h: 1.0, w: 1.5, y0: -0.3 }, still: true, back: floating, draw,
        set(c) { c.mode = 'down'; },
        tick(c, k, dt, T) {
          if (T < RING_AT) { c.mode = 'down'; return; }
          if (!c.ringOn) { c.ringOn = true; c.ringT = c.t; c.padGait = 0; c.mode = 'up'; c.surfaced = c.t; }
          if (c.t - c.ringT > CR.RING_LOOK) { c.padGait += dt * 9; c.dist -= dt * ringPace; }
        } },
      { name: 'Doggy paddling in the ring', note: 'From then on it does not go under: it comes on steadily in the ring, the head held up out of the water, the hands going round one after the other in front of it, comically fast (CREATURES.swimmer.PADDLE turns of them to each bob), a little splash at each, bobbing.',
        dist: 9, dur: 5, fit: { h: 1.0, w: 1.5, y0: -0.3 }, still: true, back: water, draw,
        set(c) { c.ringOn = true; c.ringT = -9; c.padGait = 0; c.mode = 'up'; c.moving = true; },
        tick(c, k, dt) { c.padGait += dt * 9; c.dist = Math.max(2.9, c.dist - dt * ringPace); } },
      { name: 'Swimming side on, in the ring', note: 'Sent round from a shut door to an open one with the ring on: the same stroke, the hoop standing up out of the water round its chest.',
        dist: 6, dur: TAU / 7.5 * 2, fit: { h: 0.5, w: 1.3, y0: -0.5 }, still: true, back: water, draw,
        set(c) { c.ringOn = true; c.ringT = -9; c.runPose = true; c.runDir = -1; c.runGait = 0; c.moving = true; }, tick(c, k, dt) { c.runGait += dt * 7.5; } },
      LAB.lunge({ name: 'Rising out at you, in the ring', note: 'It catches you with the ring on: the same lunge, the ring round the weed under its arms.', dist: CR.catchDist,
        set(c) { c.frozen = true; c.lungeFrom = c.dist; c.ringOn = true; c.ringT = -9; },
        tick(c, k, dt, T) { base.tick(c, k, dt, T); CR.death.pose(c, c.lunge); c.yOff = lerp(0, G.L.eyeH - CR.faceY, smoothstep(c.lunge)); },
        draw(ctx, c, P) { ctx.translate(0, -(c.yOff || 0)); draw(ctx, c, P); },
        back: water, fit: { h: 0.6, w: 1.3, y0: -0.5 } }),
      LAB.lunge({ name: 'Rising out at you', note: 'It catches you: it bursts up out of the water to your face, a body of dark dripping weed under its head and two thin weed-draped arms reaching up at you; the water moves as it comes, white heaped up and falling back, foam rings spreading, spray flung up on its arcs and falling, water streaming off it; the mouth opens under the eyes.', dist: CR.catchDist,
        tick(c, k, dt, T) {
          base.tick(c, k, dt, T);
          CR.death.pose(c, c.lunge);   // (as the game's 'dying' does: it stamps when the lunge began, for the water it comes up out of)
          c.yOff = lerp(0, G.L.eyeH - CR.faceY, smoothstep(c.lunge));   // the game lifts it to eye level as it comes (game.js, 'dying')
        },
        // the lab holds its face where it was, so the lift shows as the water line dropping away beneath it
        draw(ctx, c, P) { ctx.translate(0, -(c.yOff || 0)); draw(ctx, c, P); },
        back: water, fit: { h: 0.6, w: 1.3, y0: -0.5 } }),
    ],
  });
})();
