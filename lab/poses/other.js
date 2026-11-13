'use strict';
// Night 10, The Mirror Maze: the doll (js/creatures/other.js; its moves are set by js/levels/night10.js)
(() => {
  const CR = CREATURES.other, EYE = 1.65;
  // the music box it comes out for is ICONS.musicbox (js/icons.js), which this page does not load: fetch it once, and draw
  // a plain box until it is there
  if (typeof ICONS === 'undefined' && !document.querySelector('script[src$="js/icons.js"]')) { const sc = document.createElement('script'); sc.src = '../js/icons.js'; document.head.appendChild(sc); }
  const musicbox = (ctx, P, o) => {
    if (typeof ICONS !== 'undefined' && ICONS.musicbox) { ICONS.musicbox(ctx, P, o); return; }
    P_rect(ctx, -0.42, 0.07, 0.62, 0.3, P.col([124, 74, 40])); P_poly(ctx, [[-0.42, 0.37], [0.2, 0.37], [0.35, 0.52], [-0.27, 0.52]], P.col([166, 112, 66]));
  };
  // night 10's numbers: where it is behind you (B), and so how far back its reflection is in the glass (7 m more); its fetch
  // (F, AT, LAT, IN, the box BOXW across on the pedestal PED off at BOXY up); the side of the odd mirror it comes out to
  const B = 10, GLASS = 7 + B, PACE = 30 / 50;   // startDist / time, at unseenMult 1.0: it moves only while unseen
  const F = { settle: 0.22, turn: 0.95, reach: 0.35, lift: 0.8, back: 1.1, run: 1.3, after: 1.0 };
  const AT = 2.3, LAT = 0.58, IN = 4.4, BOXW = 0.4, BOXY = 0.75, PED = 2.2, CA = CR.carryAt, SIDE = 1, AP = clamp(0.9 + (GLASS - AT) * 0.045, 1.3, 2.4);
  // the light of the room (the lamp on its table and the fire far off to the west), as LIGHT.at gives it by a pedestal; behind
  // the glass the night lights it by hand (c.tint), more as it nears the glass
  const ROOM = { lit: 0.12, color: [255, 168, 104] };
  const sill = d => Math.sin(Math.PI * clamp((d - 3.15) / 0.7, 0, 1)) * 0.27;
  const box = c => (ctx, P) => { if (SIDE > 0) ctx.scale(-1, 1); musicbox(ctx, P, { crank: 0.6, spin: c.spin || 0 }); };
  const liftedBox = l => { const e = smoothstep(l); return { d: lerp(PED, AT - 0.01, e), lat: SIDE * LAT * e, y: lerp(BOXY, CA.y, e) + Math.sin(l * Math.PI) * 0.14, w: lerp(BOXW, CA.w, e) }; };
  // a point in the world (lat across, y up, d along the mirror's line) in the plane the doll stands in, from its feet
  const inPlane = (c, lat, y, d) => { const k = c.dist / d; return [lat * k - (c.lat || 0), EYE - (EYE - y) * k, k]; };
  const onBox = (c, b, u, v) => inPlane(c, b.lat + u * b.w, b.y + v * b.w, b.d).slice(0, 2);
  const carryHand = s => [s * 0.165, CA.y + CA.w * 0.27 + 0.01];
  // the pedestal before the odd mirror (and the box on it until the doll has it), nearer you than the doll
  function pedestal(ctx, c, P) {
    const q = (lat, y, d) => inPlane(c, lat, y, d), face = (w, y0, y1, d, col) => { const a = q(-w, y0, d), b = q(w, y1, d); P_rect(ctx, a[0], a[1], b[0] - a[0], b[1] - a[1], P.col(col)); };
    const t0 = q(-0.27, 0.75, 1.93), t1 = q(0.27, 0.75, 1.93), t2 = q(0.27, 0.75, 2.47), t3 = q(-0.27, 0.75, 2.47);
    P_poly(ctx, [t0.slice(0, 2), t1.slice(0, 2), t2.slice(0, 2), t3.slice(0, 2)], P.col([104, 78, 54]));
    face(0.25, 0, 0.09, 1.95, [62, 45, 33]); face(0.16, 0.09, 0.64, 2.04, [84, 60, 42]); face(0.27, 0.64, 0.72, 1.93, [80, 58, 40]); face(0.27, 0.72, 0.75, 1.93, [150, 120, 60]);
    if (c.carry) return;
    const b = liftedBox(c.lift || 0), [x, y, k] = inPlane(c, b.lat, b.y, b.d);
    ctx.translate(x, y); ctx.scale(b.w * k, b.w * k); box(c)(ctx, P);
  }
  // its temper and its dance in the glass, as night 10's update runs them
  function temper(c, dt, T, s) {
    if (s.sour || T < s.angryTill) c.angry = 1; else if (c.angry) c.angry = Math.max(0, c.angry - dt / 0.8);
    const calm = !s.sour && T >= s.angryTill;
    if (calm) c.danceT += dt;
    c.dance = calm ? Math.min(1, c.dance + dt / 0.7) : Math.max(0, c.dance - dt / 0.35);
  }
  // the gait as updateCreature leaves it: moved this frame, or settling to a rest
  function settle(c, dt, moved) {
    c.gait += moved * CR.stepRate * Math.PI; c.moving = moved > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  }
  const base = LAB.lunge();
  LAB.creature('other', {
    night: 10, stage: 'The Mirror Maze', dist: GLASS, fit: { h: 1.45, w: 1.0 },
    setup(c) { c.danceT = 0; },
    anims: [
      { name: 'Dancing in the glass', note: 'What every mirror shows while you hold it: a wind-up doll\'s dance, stiff ticks with stops between, eight beats round.', dur: CR.danceBeat * CR.danceKeys.length,
        tick(c, k, dt) { c.danceT += dt; } },
      { name: 'Dancing the other way round', note: 'The odd mirror: the same dance at the same moment, left and right swapped. The one to put the music box before.', dur: CR.danceBeat * CR.danceKeys.length,
        set(c) { c.danceMir = -1; }, tick(c, k, dt) { c.danceT += dt; } },
      { name: 'Rocking up behind you', note: 'In the glass while the mirror you face does not show it: still dancing, it rocks from foot to foot as it comes up behind you.', dur: 4.2, walk: PACE,
        tick(c, k, dt) { c.danceT += dt; } },
      { name: 'The wrong mirror: angry, and its hop', note: 'The box cranked before the wrong mirror (at 1 s): its dance stops, its face turns angry and it hops in to two thirds of the way. Taken back at 3 s, its temper goes at 6 s and it dances again.',
        dur: 9, zoom: true, fit: { h: 1.5, y0: -0.4, w: 1.0 },
        set(c) { c.lungeFrom = c.dist; c.s = { sour: false, angryTill: -1 }; },
        tick(c, k, dt, T) {
          const s = c.s; let moved = 0;
          if (T >= 1 && !s.hopped) { s.hopped = true; s.sour = true; s.angryTill = T + 5; c.angry = 1; const d = 7 + Math.max(CR.catchDist + 1.5, B * 0.65); moved = c.dist - d; c.dist = d; }
          if (T >= 3) s.sour = false;
          temper(c, dt, T, s); settle(c, dt, moved);
        } },
      { name: 'Angry, rocking up behind you', note: 'While the box sits stuck before the wrong mirror: no dance, its fists out and its head down, rocking stiffly up behind you.', dur: 4.2, walk: PACE,
        set(c) { c.angry = 1; c.dance = 0; } },
      { name: 'Turning round for the box', note: 'The tune plays before the odd mirror: its dance stops dead, and it turns round once on the spot (side, back, other side), and faces you, smiling.', dur: 2.2, still: true,
        set(c) { c.danceT = 2.2; },
        tick(c, k, dt, T) {
          if (T < 0.6) { c.danceT += dt; return; }
          const r = T - 0.6 - F.settle;
          c.dance = Math.max(0, c.dance - dt / F.settle);
          c.back = r >= 0.14 && r < 0.4; c.runPose = (r >= 0 && r < 0.14) || (r >= 0.4 && r < 0.54); c.runDir = r < 0.2 ? -SIDE : SIDE; c.runGait = 0; c.smile = r >= 0.54;
        } },
      { name: 'Running out through the glass', note: 'It runs at you down the glass, rocking hard on its stiff legs, steps up over the frame and out to the side of the pedestal, the room\'s light coming onto it as it nears.',
        dist: GLASS, dur: AP + 0.5, fit: { h: 1.7, w: 1.0 },
        set(c) { c.dance = 0; c.smile = true; },
        tick(c, k, dt, T) {
          const q = Math.min(1, T / AP);
          c.dist = lerp(GLASS, AT, 1 - Math.pow(1 - q, 1.6));
          c.rush = T < AP ? clamp((1 - q) / 0.2, 0, 1) : 0; if (T < AP) c.runGait = (c.runGait || 0) + dt * 17;
          c.yOff = sill(c.dist);
          if (c.dist < 3.48) c.through = true;
          const kk = c.through ? 1 : smoothstep((GLASS - c.dist) / (GLASS - 3.48));
          c.tint = kk > 0 ? { lit: ROOM.lit * kk, color: ROOM.color } : null;
        } },
      { name: 'Lifting the box off the pedestal', note: 'Beside the pedestal: its near arm reaches over to the box, both hands lift it off and down into its arms, still smiling.',
        dist: AT, dur: 2.2, fit: { h: 1.45, w: 1.6 }, front: pedestal,
        set(c) { c.dance = 0; c.smile = true; c.lat = SIDE * LAT; c.lift = 0; c.tint = ROOM; },
        tick(c, k, dt, T) {
          const t = T - 0.3, reach = clamp(t / F.reach, 0, 1), l = clamp((t - F.reach) / F.lift, 0, 1);
          c.lift = l; c.spin = (c.spin || 0) + dt * 3.4; c.arms = null; c.carry = null;
          if (t < 0) return;
          const b = liftedBox(l), near = -SIDE, hold = smoothstep((l - 0.35) / 0.65), grip = onBox(c, b, SIDE * 0.44, 0.22);
          c.arms = { [near]: { k: reach, to: [lerp(grip[0], carryHand(near)[0], hold), lerp(grip[1], carryHand(near)[1], hold)] }, [-near]: { k: hold, to: carryHand(-near) } };
          if (l >= 1) { c.carry = box(c); c.arms = null; }
        } },
      { name: 'Taking the box away', note: 'The box in its arms, it backs into the glass with it, smiling, and runs off side on behind the glass, out of the frame.',
        dist: AT, dur: F.back + F.run + 0.3, fit: { h: 1.7, w: 1.0 },
        set(c) { c.dance = 0; c.smile = true; c.carry = box(c); c.tint = ROOM; },
        tick(c, k, dt, T) {
          c.spin = (c.spin || 0) + dt * 3.4;
          if (T < F.back) { c.runPose = false; c.dist = lerp(AT, IN, smoothstep(T / F.back)); c.yOff = sill(c.dist); return; }
          c.dist = IN; c.yOff = 0; c.runPose = true; c.runDir = SIDE;
          if (T < F.back + F.run) c.runGait = (c.runGait || 0) + dt * 16;
        } },
      LAB.lunge({ note: 'It has you, from behind: angry all the way in, the red glare and the snarl, its jaw dropping and its fists opening to take hold.', dist: CR.catchDist,
        set(c) { c.angry = 1; c.dance = 0; c.smile = false; base.set(c); } }),
    ],
  });
})();
