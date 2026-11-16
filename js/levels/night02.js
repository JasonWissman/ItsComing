'use strict';
// ============================================================ 2. THE ROAD ============================================================
// the two key rings: the car keys have a green rubber head, the house keys red caps (and, being the wrong ones, look worn)
{
  const metal = [178, 174, 162], metalD = [112, 108, 100];
  const blade = (ctx, P, len) => {   // a key's blade, hanging down from 0 to -len, teeth on the right
    P_rect(ctx, -0.035, -len, 0.07, len, P.col(metal));
    for (let k = 0; k < 3; k++) P_rect(ctx, 0.03, -len + 0.05 + k * 0.08, 0.05, 0.04, P.col(metal));
    P_line(ctx, -0.005, -0.04, -0.005, -len + 0.03, 0.012, P.col(metalD));
  };
  const ring = (ctx, P) => { ctx.strokeStyle = P.col(metal); ctx.lineWidth = 0.05; ctx.beginPath(); ctx.arc(0, 0.82, 0.13, 0, TAU); ctx.stroke(); };
  Object.assign(ICONS, {
    // one big car key with a square green head, and a small plain key beside it
    carkeys(ctx, P) {
      const g = [46, 160, 78], gD = scalec(g, 0.6);
      ring(ctx, P);
      ctx.save(); ctx.translate(0.15, 0.7); ctx.rotate(-0.28); blade(ctx, P, 0.34); P_ell(ctx, 0, 0.02, 0.07, 0.07, P.col(metal)); ctx.restore();
      ctx.save(); ctx.translate(-0.1, 0.7); ctx.rotate(0.18);
      blade(ctx, P, 0.62);
      P_rect(ctx, -0.17, -0.3, 0.34, 0.32, P.col(g));                // the green rubber head
      P_rect(ctx, -0.17, -0.3, 0.34, 0.05, P.col(gD)); P_rect(ctx, -0.17, -0.03, 0.34, 0.05, P.col(mixc(g, [220, 255, 220], 0.35)));
      P_ell(ctx, 0, -0.14, 0.06, 0.06, P.col(gD));
      ctx.restore();
    },
    // two house keys with round red caps over their bows
    housekeys(ctx, P) {
      const r = [196, 40, 36], rD = scalec(r, 0.6);
      ring(ctx, P);
      for (const [dx, rot, len] of [[-0.12, 0.3, 0.5], [0.12, -0.24, 0.44]]) {
        ctx.save(); ctx.translate(dx, 0.7); ctx.rotate(rot);
        blade(ctx, P, len);
        P_ell(ctx, 0, -0.06, 0.13, 0.12, P.col(r)); P_ell(ctx, 0, -0.06, 0.05, 0.05, P.col(rD));   // the red cap and its hole
        ctx.restore();
      }
    },
  });
}

LEVELS.push({
  id: 'road', title: 'The Road', facing: 0, eyeH: 1.15, laneSwitch: false,
  pal: { skyTop: [3, 3, 7], fog: [15, 15, 20], ground: [20, 19, 16], fogDist: 70 },
  ambient: { tune: 'ambient:2', wind: 0.45, drone: 1, droneFreq: 41, windFreq: 220, rain: 0.8 },
  // no shared weather: the rain is drawn in the world (rainOn, below), so it falls outside the car and not across it
  // the headlights, the dash glow and the tail lights belong to the car: they go where it goes. The tail lights throw a
  // dim red over the road behind, so it can be found back there
  lights: [{ x: 0.4, y: 0.75, z: 1.6, r: 52, i: 1.25, color: [228, 218, 178], cone: { x: 0, y: -0.06, z: 1, deg: 24 }, attach: true }, { x: 0, y: 0.9, z: 0.55, r: 0.9, i: 0.1, color: [90, 200, 120], attach: true },
    { x: 0.4, y: 0.7, z: -1.3, r: 20, i: 0.55, color: [200, 30, 24], cone: { x: 0, y: -0.12, z: -1, deg: 70 }, attach: true }],
  text: {
    intro: 'You\'re miles from anything.',
    hint: 'The keys fell somewhere when the car stalled.',
    objective: 'Start the car and get away.',
    // caught where it came up to the car: the window it came through
    death: { default: 'It came through the windshield.', passenger: 'It came through the passenger window.', driver: 'It came through the window beside you.', back: 'It came through the back window.',
      drove: 'You drove straight to the creature. It came through the windshield.', reversed: 'You backed straight into the creature. It came through the back window.' },
    win: 'You slammed on the gas and it faded into the distance.',
  },
  // the windshield is the opening; the hood hides the last metres of road. It can come up the crown of
  // the road or along either verge, just off the beam
  lanes: [
    { deg: 0, name: 'road', barrierDist: 0, apertures: [{ z: 0.95, x0: -0.5, x1: 1.3, y0: 1.02, y1: 1.45 }], blockers: [[0, 7.5]], default: true },
    { deg: 11, name: 'right verge', barrierDist: 0, apertures: [{ z: 0.97, x0: -0.68, x1: 1.12, y0: 1.02, y1: 1.45 }], blockers: [[0, 7.5]] },
    { deg: -11, name: 'left verge', barrierDist: 0, apertures: [{ z: 0.97, x0: -0.32, x1: 1.48, y0: 1.02, y1: 1.45 }], blockers: [[0, 7.5]] },
  ],
  // 90 (it was 52): the keys, park, the key two to four times, a gear and the gas, half of it looking down, and now finding
  // where it has gone round to before picking the gear. On Nightmare that is about 54 s of it in sight, 29 s out of it
  creatures: [{ type: 'crawler', startDist: 85, time: 90, unseenMult: 1.35 }],
  build(L) {
    const s = L.s;
    const body = [44, 22, 24], bodyD = [24, 13, 15], dash = [26, 24, 26], dashD = [16, 15, 17], seat = [46, 40, 38], floor = [15, 14, 14];
    const GAUGES = [-0.16, 0.0, 0.16];                                     // the three dials behind the wheel
    const IX = 0.33, IY = 0.905, IZ = 0.545;                               // the centre of the ignition lock, in the dash face right of the dials
    const CX0 = 0.27, CX1 = 0.45, CZ0 = -0.04, CZ1 = 0.36, CY = 0.56;     // the console between the seats
    // the gearstick's plate, lying flat on top of the console: its near edge (toward your seat) at GX, its middle at GZ,
    // GW long (front to back) and GH across, raised GT off the console. The letters on it read from your seat looking
    // down (the tops of them toward the passenger side, GTOP), P at the front; the slot runs along its far side (GS in
    // from the near edge) and the stick stands up out of it, leaning a little toward you, its knob GK up
    const GX = 0.3, GZ = 0.14, GW = 0.24, GH = 0.13, GT = 0.014, GY = CY + GT, GTOP = Math.PI / 2, GS = 0.094, GK = 0.2, GLEAN = 0.035;
    const PX = 0.16, PY = 0.36, PZ = 0.47, PW = 0.11, PH = 0.22;           // the gas pedal, in your own footwell
    const onVerge = (x, z) => z > 0 && Math.abs(Math.abs(Math.atan2(x, z)) - 11 * DEG) < 2 * DEG;   // nothing stands on the verge lanes
    // the stars are as good as infinitely far: they stay put in the sky when the car moves
    let n0 = L.props.length;
    SC.stars(L, 7, 120, 0.5);
    for (const p of L.props.slice(n0)) p.attach = true;
    // the road runs both ways past the car, in short pieces, so the headlights fall off smoothly along it and the car can
    // drive either way. The tarmac is drawn first, the dashes and the verge litter over it, the car over all of them
    for (let z = -170; z < 240; z += 2.5) SC.floorQ(L, -2.6, z, 3.4, z + 2.5, 0.01, [46, 46, 52], { layer: -2 });
    for (let z = -168; z < 240; z += 9) SC.floorQ(L, 0.28, z, 0.55, z + 3, 0.02, [150, 142, 90], { layer: -1 });
    const rng = mulberry32(21);
    for (let i = 0; i < 160; i++) { const side = rng() < 0.5 ? -1 : 1; const z = -170 + rng() * 410; const x = 0.4 + side * (3.3 + Math.pow(rng(), 1.5) * 16); const sz = 0.3 * (0.5 + rng()); SC.floorQ(L, x - sz, z - sz * 0.4, x + sz, z + sz * 0.4, 0.008, [40, 38, 34], { layer: -1 }); }
    for (let i = 0; i < 70; i++) { const side = rng() < 0.5 ? -1 : 1; const z = 8 + rng() * 230; const kind = rng() < 0.7 ? 'bare' : 'round'; const h = 6 + rng() * 8; const x = side * ((kind === 'round' ? 6 + h * 0.5 : 6) + rng() * 12) + 0.4; if (onVerge(x, z)) continue; SC.tree(L, x, z, h, kind, (rng() * 1e6) | 0); }
    for (let i = 0; i < 44; i++) { const side = rng() < 0.5 ? -1 : 1; const z = -8 - rng() * 165; const x = side * (5.5 + rng() * 14); SC.tree(L, x, z, 6 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    for (let i = -5; i < 9; i++) { const z = -20 + i * 30; SC.sprite(L, -5.5, 0, z, 0.3, 8, (ctx, P) => { ctx.scale(0.3, 8); P_rect(ctx, -0.5, 0, 1, 1, P.col([30, 28, 26])); P_rect(ctx, -2.2, 0.88, 4.4, 0.03, P.col([30, 28, 26])); }); }
    // marker posts along both edges, a white band near the top that catches the lights
    for (let z = -165; z < 240; z += 22) for (const x of [-3.0, 3.8]) {
      if (onVerge(x, z) || (z > -3 && z < 4)) continue;
      SC.sprite(L, x, 0, z, 0.09, 0.95, (ctx, P) => { ctx.scale(0.09, 0.95); P_rect(ctx, -0.5, 0, 1, 1, P.col([70, 68, 64])); P_rect(ctx, -0.5, 0.78, 1, 0.12, P.col([205, 200, 186])); });
    }
    // the car: you are in the driver's seat, the passenger side is to your right. Everything from here to the end of the
    // car rides with you when it moves
    n0 = L.props.length;
    SC.floorQ(L, -0.45, -1.0, 1.25, 0.75, 0.35, floor);
    SC.quad(L, [-0.5, 0.95, 0.55], [1.3, 0.95, 0.55], [1.3, 1.02, 0.95], [-0.5, 1.02, 0.95], dash);
    SC.quad(L, [-0.5, 0.5, 0.55], [1.3, 0.5, 0.55], [1.3, 0.95, 0.55], [-0.5, 0.95, 0.55], dashD);
    SC.quad(L, [-0.28, 0.84, 0.54], [0.28, 0.84, 0.54], [0.28, 0.93, 0.54], [-0.28, 0.93, 0.54], [14, 24, 18], { noFog: true, noLight: true });
    for (const x of GAUGES) SC.quad(L, [x - 0.035, 0.865, 0.535], [x + 0.035, 0.865, 0.535], [x + 0.035, 0.905, 0.535], [x - 0.035, 0.905, 0.535], [22, 52, 34], { noFog: true, noLight: true });
    SC.quad(L, [-0.55, 1.02, 0.95], [1.35, 1.02, 0.95], [1.3, 0.8, 2.5], [-0.5, 0.8, 2.5], body); // the hood falls away below the dash line so the dash is the real occluder, as the lane apertures say
    { // steering wheel + column
      // the rim, the whole way round (its first point again at the end, so the stroke closes), a little darker than the dash
      const pts = []; const cy = 0.92, cz = 0.52, r = 0.17, rim = [12, 11, 12];
      for (let i = 0; i <= 32; i++) { const a = i / 32 * TAU; pts.push(L.pt(Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, cz - Math.sin(a) * r * 0.55)); }
      L.props.push({ kind: 'poly', pts, color: rim, stroke: true, lw: 0.026 });
      SC.quad(L, [-0.04, 0.8, 0.5], [0.04, 0.8, 0.5], [0.04, 0.9, 0.56], [-0.04, 0.9, 0.56], rim);
    }
    // doors, pillars, header, roof, the back of the car with its window
    for (const x of [-0.45, 1.25]) {
      SC.wallV(L, x, -0.55, x, 0.6, 0.35, 1.02, bodyD);
      SC.quad(L, [x, 1.0, 0.6], [x, 1.0, 0.68], [x, 1.52, 0.22], [x, 1.52, 0.14], bodyD);
      SC.wallV(L, x, -0.58, x, -0.5, 0.35, 1.55, bodyD);
      SC.wallV(L, x, -0.55, x, 0.6, 1.02, 1.06, [60, 40, 40]);
      SC.wallV(L, x, -1.08, x, -0.58, 0.35, 0.95, bodyD);              // the rear quarter, below its little window
      SC.wallV(L, x, -1.12, x, -1.0, 0.95, 1.55, bodyD);               // the back pillar
      SC.wallV(L, x, 0.5, x, 0.78, 0.35, 1.0, dashD);                  // the kick panel, so the road never shows under the dash
    }
    SC.wallV(L, -0.45, 0.76, 1.25, 0.76, 0.35, 0.55, dashD);            // and the bulkhead behind the pedals
    SC.quad(L, [-0.55, 1.45, 0.6], [1.35, 1.45, 0.6], [1.35, 1.55, 0.2], [-0.55, 1.55, 0.2], bodyD);
    SC.quad(L, [-0.55, 1.55, 0.2], [1.35, 1.55, 0.2], [1.35, 1.55, -1.12], [-0.55, 1.55, -1.12], [16, 11, 12]);
    SC.box(L, 0.62, 1.1, 0.35, 0.66, -0.22, 0.3, seat);               // the passenger seat: its cushion, low,
    SC.box(L, 0.62, 1.1, 0.66, 1.0, -0.22, -0.12, seat);              // and its back, below the window line
    SC.box(L, -0.45, 1.25, 0.35, 0.62, -0.98, -0.6, seat);              // the back seat, low enough to see the road behind over it
    SC.box(L, -0.45, 1.25, 0.35, 0.9, -1.04, -0.92, seat);
    SC.quad(L, [-0.47, 0.92, -1.12], [1.27, 0.92, -1.12], [1.27, 0.92, -0.98], [-0.47, 0.92, -0.98], bodyD);   // the shelf under the back window
    // the console between the seats that the gearstick stands on: its top and the side toward you (from the driver's
    // seat its other faces are never seen). Low and short enough that nothing lying in the footwells goes behind it
    SC.quad(L, [CX0, CY, CZ0], [CX1, CY, CZ0], [CX1, CY, CZ1], [CX0, CY, CZ1], [31, 29, 32]);
    SC.wallV(L, CX0, CZ0, CX0, CZ1, 0.35, CY, [19, 18, 20]);
    for (const p of L.props.slice(n0)) p.attach = true;
    // items and the ignition; everything lying in the car goes with it
    const keySpots = [
      { x: 0.66, y: 0.36, z: 0.48, jitter: 0.06 },      // passenger footwell
      { x: -0.15, y: 0.36, z: 0.42, jitter: 0.06 },     // your own footwell
      { x: 0.36, y: 0.36, z: -0.12, jitter: 0.05 },     // between the seats
      { x: 0.4, y: 0.36, z: -0.5, jitter: 0.05 },       // behind the seats
      { x: 0.86, y: 0.66, z: 0.1, jitter: 0.04, key: 'seat' }, // on the passenger seat
    ];
    // in the hand, a key is held up by its head between finger and thumb, the blade pointing up, ready for the lock
    mkItem(L, 'keys', 'Car keys', keySpots, { w: 0.2, h: 0.2, flat: true, icon: 'carkeys', attach: true, held: { size: 0.16, at: [-0.12, 0.55], angle: 2.85 } });
    mkItem(L, 'housekeys', 'Keys', keySpots, { w: 0.2, h: 0.2, flat: true, icon: 'housekeys', attach: true, decoy: true, decoyText: 'House keys. Not these.', held: { size: 0.16, at: [-0.1, 0.66], angle: 2.75 } });
    L.floorY = 0.36;
    // standing up on the dash or the seat, it is set on the near part of the surface, on it: an item is drawn in order of
    // its distance like the surface under it, so on the far part the surface behind it would be drawn over its foot
    mkItem(L, 'bottle', 'Empty bottle', [
      { x: 0.9, y: 0.36, z: -0.45, flat: false },       // rear floor
      { x: 0.95, y: 0.973, z: 0.68, flat: false },      // on the dash
      { x: 0.8, y: 0.66, z: 0.0, flat: false, key: 'seat' }, // on the passenger seat, in front of the seat back
    ], { w: 0.09, h: 0.24, icon: 'bottle', attach: true, held: { size: 0.27 } });   // (held larger than its size would have it: the fist hid all but its neck)
    // it stalled in drive, and it will not start until the stick is in park. Once it runs, the stick goes to reverse or
    // drive and the gas takes you away; straight ahead is only a way out if the thing is not in the road
    Object.assign(s, { keyIn: false, cranks: 0, cranking: 0, started: false, cranksNeeded: 2 + Math.floor(L.rand() * 3), gear: 'D', lastCrank: -10, gone: false, dir: 0, pressT: -10, keyAng: 0, ram: null, floored: false,
      turnAt: -10, jigAt: -10, gearFrom: 'D', gearAt: -10, dead: false });
    const GEAR_NAME = { P: 'park', R: 'reverse', D: 'drive' };
    // Your hand on the car (js/hands.js): it goes to the key to turn it, to the gearstick to move it, and to the lock with no
    // key in it, and what it does there happens as it gets there (handTo: then() then, or at once if it is there already).
    // The house keys are tried at the keyhole, blade first, will not go in and drop to the floor at your feet; anything
    // else in hand is tried there and comes back. With the key in and the stick out of park the key will not turn: the
    // hand takes it and it strains a few degrees and no more (s.jigAt). Each turn of the key is the hand on it while the
    // starter turns. Your foot is on the gas (L.overlay): with the engine dead the pedal goes all the way to the floor under
    // it, limp, with a dull clunk, and comes back up.
    const KEYHOLE = [0, 0.62], KEYHEAD = [0, 0.8];   // on the ignition's box: the slot in the lock, and the key's head standing out of it
    // where keys dropped from the ignition land: on the floor at your feet, in front of the seat and short of the pedal, where
    // looking down finds them, clear of anything else lying there (the first of these that is; failing all, the first)
    const FEET = [[-0.05, 0.26], [-0.18, 0.3], [0.07, 0.22], [-0.29, 0.26], [-0.13, 0.18], [-0.3, 0.4]];
    const atFeet = it => {
      const clear = ([x, z]) => L.items.every(o => o === it || o.taken || Math.hypot(o.x - x, o.z - z) > 0.24);
      const [x, z] = FEET.find(clear) || FEET[0], p = L.pt(x, 0.36, z);
      return { x: p[0], y: 0.36, z: p[2] };
    };
    // (what it does is done in any case a moment later, if the hand was called away before it got there)
    const pending = [];
    const handTo = (t, opts, then) => {
      let done = !then;
      const once = () => { if (!done) { done = true; then(); } };
      if (then) pending.push({ fn: once, by: L.t + 0.4 });
      const rc = G.reach(t, opts);
      if (!rc) { once(); return null; }
      if (then) {
        if (rc.touched > 0) once();   // there already, for another go
        else { const prev = rc.opts.onTouch; rc.opts.onTouch = tt => { if (prev) prev(tt); once(); }; }
      }
      return rc;
    };
    const ign = mkTarget(L, {   // the box is the lock and the key in it, as they are drawn
      id: 'ignition', name: 'Ignition', x: IX, y: IY - 0.075, z: IZ, w: 0.11, h: 0.12, accepts: ['keys', 'housekeys'], attach: true, face: Math.PI,
      fumble: { at: KEYHOLE, sfx: { land: 'keys' } },   // tried at the keyhole; keys that drop jingle on the floor
      onDecoy(item) { if (!G.fumble(item, ign, { preset: 'bump', land: atFeet(item) }) && !G.fumbling) AUDIO.sfx('nope'); },
      hint() { return s.started ? 'Running.' : s.keyIn ? (s.gear !== 'P' ? 'Turn the key. It is still in ' + GEAR_NAME[s.gear] + ', though.' : 'Turn the key.') : 'The ignition. No key in it.'; },
      use(item) { if (item.id !== 'keys') return false; s.keyIn = true; ign.accepts = []; AUDIO.sfx('keys'); G.say('The key is in. Turn it.', 'The key is in.'); return true; },
      onClick() {
        // the house keys still at the keyhole, out of the hand: another click does nothing more until they drop (it would
        // say there is no key over their line, or put the car key in under them)
        const fx = G.fumbling;
        if (fx && fx.target === ign && fx.drop && (fx.phase === 'wait' || fx.phase === 'out' || fx.phase === 'contact')) return true;
        if (!s.keyIn) {
          // the house keys, tried at the lock, are refused here rather than by the game's decoy rule, which hurries the
          // thing on a step (3% of its way in, about a second of it) for every wrong try: here a wrong key costs only the
          // moment it takes to try it. Whichever ring the game would pick: the one in hand, else the car keys before them
          const act = G.inv[G.active], k = act && ign.accepts.includes(act.id) ? act : G.inv.find(i => i.id === 'keys') || G.inv.find(i => i.id === 'housekeys');
          if (k && k.decoy) {
            if (G.fumbling && G.fumbling.from === k && G.fumbling.target === ign && G.fumbling.phase !== 'home') return true;   // on its way there already
            if (k !== act) { G.active = G.inv.indexOf(k); G.invSig = ''; }
            G.toast(k.decoyText);
            ign.onDecoy(k);
            return true;
          }
          if (k) return false;   // the car keys go in
          G.say('No key. They fell somewhere when it stalled.', 'There is no key in the ignition.');
          // what is in hand is tried at the lock and comes back; empty, the fingers find the slot
          if (!(act ? G.fumble(act, ign, 'return') : handTo(ign, { style: 'touch', at: KEYHOLE, sfx: 'tink' })) && !G.fumbling) AUDIO.sfx('nope');
          return true;
        }
        if (s.started) { G.say('It is running. Now the gearstick, and the gas.', 'The engine is running.'); handTo(ign, { style: 'touch', at: KEYHEAD, sfx: 'keys' }); return true; }
        if (s.cranking > 0 || s.ram) return true;
        if (s.gear !== 'P') {   // the key will not turn: it strains a few degrees in the hand and goes back
          G.say('Nothing, not even a click. It will only start in park.', 'Nothing. Not even a click. The gearstick is in ' + GEAR_NAME[s.gear] + '.');
          handTo(ign, { style: 'rattle', at: KEYHEAD }, () => { s.jigAt = L.t; });
          return true;
        }
        s.lastCrank = L.t; s.cranking = 1.45; s.turnAt = Infinity;   // (the starter turns once the hand has the key)
        s.cranks++;
        const caught = s.cranks >= s.cranksNeeded;
        if (caught) { s.started = true; G.say('It caught. Into reverse or drive, then the gas.', 'It caught. The engine is running.'); }
        else G.toast(s.cranks === 1 ? 'It turns over. It does not catch.' : 'Come on. Come on.');
        const rc = handTo(ign, { style: 'rattle', at: KEYHEAD, sfx: 'keys' }, () => {
          s.turnAt = L.t; s.cranking = Math.min(s.cranking, 1.15);
          if (caught) { AUDIO.sfx('start'); G.shake(0.3); } else { AUDIO.sfx('crank'); G.shake(0.12); }
        });
        if (rc) rc.hold = Math.max(rc.hold, 1.1);   // it holds the key over while the starter turns
        return true;
      },
    });
    // the gearstick on the console by your right hip (back from the footwells, so it never hides what lies in them),
    // P R N D along its plate, front to back: each click moves it on, park, reverse, drive and round to park
    const lxOf = g => -0.075 + 'PRND'.indexOf(g) * 0.05;   // where the stick stands along the plate, by each letter (back from its middle)
    const gearK = () => smoothstep(clamp((L.t - s.gearAt) / 0.18, 0, 1));   // how far over it is to the gear it is going to
    const shownGear = () => (gearK() >= 0.5 ? s.gear : s.gearFrom);
    // the stick in the car's frame, standing over lx: its foot in the slot and its knob, up and leaning a little toward you
    const stickFoot = lx => [GX + GS, GY, GZ - lx], knobOf = lx => [GX + GS - GLEAN, GY + GK, GZ - lx];
    // the knob, in the world, a little toward the eye, where the hand takes it. The plate is fixed to the car like the
    // console itself, so the knob is a fixed point on it; with the car away it is where the car is now
    const knobAt = lx => {
      const [x, y, z] = knobOf(lx), e = L.eye || {};
      const dx = -x, dy = L.eyeH - y, dz = -z, dl = Math.hypot(dx, dy, dz), p = L.pt(x + dx / dl * 0.02, y + dy / dl * 0.02, z + dz / dl * 0.02);
      return { x: p[0] + (e.x || 0), y: p[1] + (e.y || 0), z: p[2] + (e.z || 0) };
    };
    const gear = mkTarget(L, {
      id: 'gear', name: 'Gearstick', x: GX, y: GY, z: GZ, w: GW, h: GH, attach: true, flat: true, face: GTOP,   // (the plate; the stick and its knob are clicked too: L.dynamic)
      hint() { return 'In ' + GEAR_NAME[s.gear] + '.'; },
      onClick() {
        if (s.gone || s.ram) return true;
        const from = shownGear();
        s.gear = { P: 'R', R: 'D', D: 'P' }[s.gear]; s.gearFrom = from; s.gearAt = Infinity;
        // the hand takes the knob and pulls it over to the next letter; the stick goes over as it does
        const rc = handTo(gear, { style: 'pull', at: knobAt(lxOf(from)), sfx: 'pat' }, () => { s.gearAt = L.t; AUDIO.sfx('lever'); G.shake(0.06); });
        if (rc && rc.hold > 0.24 && rc.T === 0) rc.hold = 0.26;   // one pull
        s.gearHand = rc;
        const name = GEAR_NAME[s.gear][0].toUpperCase() + GEAR_NAME[s.gear].slice(1) + '.';
        G.say(name + (s.started ? (s.gear === 'P' ? '' : ' Now the gas.') : (s.gear === 'P' ? ' Now the key.' : ' It will not start in ' + GEAR_NAME[s.gear] + '.')), name);
        return true;
      },
    });
    // the gas pedal, in your own footwell
    const gas = mkTarget(L, {
      id: 'gas', name: 'Gas pedal', x: PX, y: PY, z: PZ, w: PW, h: PH, attach: true, face: Math.PI,
      hint() { return s.started ? (s.gear === 'P' ? 'It is in park.' : 'Go.') : 'The engine is not running.'; },
      onClick() {
        if (s.gone || s.ram) return true;
        s.pressT = L.t; s.dead = !s.started;
        if (!s.started) { AUDIO.sfx('clunk', -0.2); G.shake(0.05); G.say('Nothing. Start the engine first.', 'The pedal goes down. The engine is not running.'); return true; }   // to the floor, limp (pedalDown)
        AUDIO.sfx('rev');
        if (s.gear === 'P') { G.shake(0.12); G.say('It roars and goes nowhere. It is in park.', 'The engine roars. The car is still in park.'); return true; }
        const c = L.creature, dir = s.gear === 'R' ? -1 : 1;
        if (inPath(bear(), dir) && !c.dead) { ram(c, dir); return true; }   // straight at it, ahead in drive or behind in reverse
        s.gone = true; s.dir = dir; G.shake(0.35);
        if (!L.won) win();   // away now: nothing it does before the next frame can undo the gas
        return true;
      },
    });
    // drive with it in the road ahead (or reverse with it in the road behind): the car leaps at it and it comes down the
    // road at the car, fast, then up over the hood (or the boot). The eye goes with the car (as it does getting away), and
    // the lunge starts from where it is by then, from the car (its pos is measured from the eye wherever the eye is)
    const RAM_GAP = 2.6;
    function ram(c, dir) {
      G.shake(0.5); s.floored = true;
      G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.tYaw = G.cam.yaw + wrapPi(c.yaw - G.cam.yaw); G.cam.tPitch = 0;   // you look up at the road
      s.ramDir = dir;
      if (c.dist < RAM_GAP + 1.5) { hit(c); return; }
      s.ram = { t: 0, v: 0, s: 0, dir, from: c.dist, T: clamp(0.4 + c.dist / 60, 0.6, 1.4) };
      L.eye = { x: 0, y: 0, z: 0 };
      c.hold = c.dist; c.mode = 'scuttle'; c.modeT = -2; c.runPose = false;
    }
    function hit(c) {
      G.lastToast = { msg: '', t: -10 };   // the card says what happened, not what the gearstick last said
      die(c, s.ramDir < 0 ? 'reversed' : 'drove');
    }
    function ramOn(dt) {
      const r = s.ram, c = L.creature;
      r.t += dt; r.v += 9 * dt; r.s += r.v * dt;
      const e = toWorld(0, r.s * r.dir); L.eye.x = e.x; L.eye.z = e.z;
      G.shake(0.14);
      const k = Math.min(1, r.t / r.T);
      c.hold = lerp(r.from, r.s + RAM_GAP, k * k);   // along the road from where the car started
      if (k >= 1) { c.hold = c.dist = RAM_GAP; hit(c); }   // the car stops dead there (s.ram stays, so the speedometer does too)
    }
    L.isWon = () => s.gone;
    L.objectiveText = () => s.started ? (s.gear === 'P' ? 'Into reverse or drive. Then the gas.' : 'The gas.') : (s.gear !== 'P' ? 'Put it in park. ' : '') + (s.keyIn ? 'Turn the key until it starts.' : 'Find the keys. Start the car.');

    // ---- where it is: it goes round the car ----
    // Its way in is the game's (its distance from how far it has come, faster unseen), but where round the car it is, is
    // the night's: a bearing from the seat (roam.b, from straight ahead, + toward the passenger side). It comes up the road
    // or a verge as before, and every few seconds, in one of its bursts, it shifts across to another of them: side-on, the
    // road and the verges sliding under it. Most nights, partway in, it breaks off and runs flat out round the car
    // through the dark to one side or into the road behind (heard going, its steps panned to where it is, a click as it
    // goes and as it gets there), and there it shifts about the same way; some nights it goes round again later. Once the
    // car is running it stops going round; once it is in gear, it moves only while you are watching it, so it never steps
    // into the way you have chosen behind your back. Which way out is safe goes by where it is: in drive with it in the
    // road ahead, or in reverse with it in the road behind, the car runs into it; anywhere else either way gets away.
    // It is caught through the window it came up to (L.deathCause), which shatters as it comes (L.overlay)
    const REGION = { front: [0, 11 * DEG, -11 * DEG], back: [Math.PI, Math.PI - 11 * DEG, -Math.PI + 11 * DEG], right: [90 * DEG, 66 * DEG, 114 * DEG], left: [-90 * DEG, -66 * DEG, -114 * DEG] };
    const PATH = 5.5 * DEG;   // the road itself, ahead or behind: inside this the car runs into it
    const regionOf = b => { const a = Math.abs(wrapPi(b)); return a <= 40 * DEG ? 'front' : a >= 140 * DEG ? 'back' : b > 0 ? 'right' : 'left'; };
    const inPath = (b, dir) => Math.abs(wrapPi(dir > 0 ? b : b - Math.PI)) < PATH;
    const rr = mulberry32(((L.rand() * 4294967295) ^ Math.imul(G.runSeed + 1, 0x9e3779b1) ^ Math.imul(L.night, 0x85ebca6b)) >>> 0);
    for (let i = 0; i < 5; i++) rr();   // (its first few draws from nearby seeds are alike)
    const pickOf = list => list[Math.floor(rr() * list.length) % list.length];
    const roam = s.roam = {
      b: null, rem: 0, circling: false, nextAt: 0, odo: 0, steps: 0, yOff: 0,
      // when (how far in) it goes round, and where to; and whether and when it goes round again
      circleU: rr() < 0.75 ? 0.3 + rr() * 0.2 : 2, circleTo: pickOf(['back', 'back', 'back', 'back', 'right', 'right', 'right', 'left', 'left', 'left']), againU: rr() < 0.45 ? 0.62 + rr() * 0.12 : 2,
    };
    function bear() {   // (first asked for once the thing exists: it starts where its lane put it)
      if (roam.b === null) {
        const c = L.creature;
        roam.b = c.lane.deg * DEG; roam.nextAt = 3 + rr() * 3;
        c.pos = function () { const e = L.eye || {}, a = L.facing + roam.b; return { x: Math.sin(a) * this.dist + (e.x || 0), y: 0, z: Math.cos(a) * this.dist + (e.z || 0) }; };
      }
      return roam.b;
    }
    // where it is set down at once (the tests: a bearing, and the distance if given)
    roam.put = (b, d) => { const c = L.creature; bear(); roam.b = b; roam.rem = 0; roam.circling = false; c.runPose = false; c.yaw = L.facing + b; if (d !== undefined) { c.u = 1 - d / c.D0; c.dist = d; } roam.nextAt = L.t + 30; roam.circleU = roam.againU = 2; };
    const panOf = b => Math.sin(wrapPi(L.facing + b - G.cam.yaw)) * 0.85;
    function goTo(to, how) {   // set off for a bearing: the short way, or round the car by a side chosen at random
      let rem = wrapPi(to - roam.b);
      if (how === 'round' && Math.abs(rem) > 150 * DEG && rr() < 0.5) rem -= Math.sign(rem) * TAU;
      roam.rem = rem; roam.circling = how === 'round';
      if (roam.circling || inPath(to, 1) || inPath(to, -1)) AUDIO.voice('clicks', clamp(5 / (L.creature.dist + 4), 0.12, 0.6), panOf(roam.b));   // heard going (into the road, or round)
    }
    function roamOn(dt) {
      const c = L.creature, b = bear();
      if (s.gone || s.ram || L.won || c.dead || G.state !== 'play') return;
      c.yaw = L.facing + b;
      if (!roam.rem) {
        const inGear = s.started && s.gear !== 'P';
        if (!s.started && c.u >= roam.circleU) { roam.circleU = 2; goTo(REGION[roam.circleTo][0], 'round'); }
        else if (!s.started && c.u >= roam.againU && c.dist > 14) {
          roam.againU = 2;
          goTo(REGION[pickOf(Object.keys(REGION).filter(k => k !== regionOf(b)))][0], 'round');
        } else if (L.t >= roam.nextAt && c.dist > 6 && (!inGear || c.seen)) {   // shifting across, in a burst (not once it is at the car)
          roam.nextAt = L.t + 3.5 + rr() * 3.5;
          const to = pickOf(REGION[regionOf(b)].filter(t => Math.abs(wrapPi(t - b)) > 2 * DEG));
          if (rr() < 0.75) goTo(to, 'shift');
        }
      }
      if (roam.rem) {   // flat out round the car, or across in its bursts, side-on
        const d = Math.max(c.dist, 2), v = roam.circling ? 20 : c.mode === 'scuttle' ? 9 : 0;
        const w = Math.min(roam.circling ? 0.9 : 1.6, v / d), step = Math.sign(roam.rem) * Math.min(Math.abs(roam.rem), w * dt);
        roam.b = wrapPi(roam.b + step); roam.rem -= step;
        if (Math.abs(roam.rem) < 1e-6) {
          roam.rem = 0; c.runPose = false;
          if (roam.circling) { roam.circling = false; roam.nextAt = L.t + 3 + rr() * 3; AUDIO.voice('clicks', clamp(5 / (c.dist + 4), 0.12, 0.6), panOf(roam.b)); }   // there
        } else if (step) {
          c.runPose = true; c.runDir = Math.sign(step); c.runGait = (c.runGait || 0) + Math.abs(step) * d * 5.5;
          roam.odo += Math.abs(step) * d;   // its steps as it goes, panned to where it is
          const n = Math.floor(roam.odo * CREATURES.crawler.stepRate * 0.5);
          if (n !== roam.steps) { roam.steps = n; AUDIO.footstep('crawler', clamp(5 / (d + 5), 0.1, 0.7), panOf(roam.b)); }
        } else c.runPose = false;
        c.yaw = L.facing + roam.b;
      }
      // close beside the car or behind it, it rears up at the glass, so it shows over the sill (the death lunge goes on from there)
      const rg = regionOf(roam.b);
      roam.yOff = rg === 'front' ? 0 : 0.42 * smoothstep(clamp((4.5 - c.dist) / 2.5, 0, 1));
      c.yOff = roam.yOff;
      if (!c.deathSpec) c.deathSpec = Object.assign({}, c.CR.death, { pose: (cr, k) => { cr.yOff = lerp(roam.yOff, cr.yOff, smoothstep(k)); } });
    }
    L.creatureLit = () => 0.45;   // its pale skin shows a little even out of the lights, so it can be found round the car
    L.deathCause = () => { const w = windowOf(bear()); return w === 'front' ? 'default' : w; };
    // which window it comes through, from where it is
    const windowOf = b => { const rg = regionOf(b); return rg === 'front' ? 'front' : rg === 'back' ? 'back' : rg === 'right' ? 'passenger' : 'driver'; };
    // how much of it can be seen from the seat: points over its body, each seen if the line from the eye to it leaves the
    // car through glass (the windshield, clear of the hood; a side window; a rear quarter window; the back window), times
    // how much of it is in the view
    const CAB = { x0: -0.45, x1: 1.25, z0: -1.12, z1: 0.95 };
    function throughGlass(px, py, pz) {
      const dy = py - L.eyeH, tx = px > 0 ? CAB.x1 / px : px < 0 ? CAB.x0 / px : Infinity, tz = pz > 0 ? CAB.z1 / pz : pz < 0 ? CAB.z0 / pz : Infinity, t = Math.min(tx, tz);
      if (t >= 1) return true;
      const y = L.eyeH + dy * t, z = pz * t;
      if (tx < tz) return (y > 1.06 && y < 1.45 && z > -0.5 && z < 0.55) || (y > 0.97 && y < 1.5 && z > -1.0 && z < -0.58);
      if (pz < 0) return y > 0.93 && y < 1.55;
      if (y < 1.02 || y > 1.45) return false;
      const zh = Math.min(pz, 2.5), k = zh / pz, hx = px * k, hy = L.eyeH + dy * k;
      return !(hx > -0.55 && hx < 1.35 && hy < 1.02 - 0.22 * (zh - 0.95) / 1.55);   // over the hood
    }
    L.visFrac = c => {
      const b = bear(), CR = c.CR, sb = Math.sin(L.facing + b), cb = Math.cos(L.facing + b), d = c.dist, yo = c.yOff || 0;
      let n = 0, k = 0;
      for (const u of [-0.45, -0.22, 0, 0.22, 0.45]) for (const v of [0.2, 0.45, 0.7, 0.92]) {
        const l = rotY(sb * d + cb * u, cb * d - sb * u, -L.facing);
        n++; if (throughGlass(l[0], v * CR.h + yo, l[1])) k++;
      }
      if (!k) return 0;
      const cam = G.cam.zoom > 1.001 ? { yaw: G.cam.yaw, pitch: G.cam.pitch, zoom: 1, W: R.W, H: R.H, eyeH: L.eyeH, eye: L.eye } : null;
      const p = c.pos(), r = R.projectRect(p.x, p.y + yo, p.z, CR.w, CR.h, cam);
      if (!r) return 0;
      const W = cam ? cam.W : R.W, H = cam ? cam.H : R.H, w = Math.min(r.x + r.w, W) - Math.max(r.x, 0), h = Math.min(r.y + r.h, H) - Math.max(r.y, 0);
      return w > 0 && h > 0 ? (k / n) * w * h / Math.max(1e-6, r.w * r.h) : 0;
    };

    // ---- getting away: the car pulls off along the road (back down it in reverse) and the world slides past. The eye
    // moves with it (L.eye) and so does everything flagged attach; the thing is left on the road and falls behind
    const drive = { t: 0, v: 0, s: 0, cx: 0, cz: 0, gap: 0, side: 1, ahead: false, passedAt: -1, shifted: false, eyesFront: false, odo: 0, steps: 0 };
    const toWorld = (x, z) => { const p = L.pt(x, 0, z); return { x: p[0], y: 0, z: p[2] }; };
    function setOff() {
      const c = L.creature, cp = c.pos(), loc = rotY(cp.x, cp.z, -L.facing), d0 = Math.hypot(loc[0], loc[1]), b = bear();
      // ahead: it is somewhere the car is going (a verge it will pass, in drive ahead, in reverse behind); else beside the
      // car or the way it is leaving, and it can only come after it
      const ahead = Math.abs(wrapPi(s.dir > 0 ? b : b - Math.PI)) < 40 * DEG;
      Object.assign(drive, { cx: loc[0], cz: loc[1], gap: Math.min(d0, Math.max(3, d0 * 0.75)), side: loc[0] > 0.4 ? 1 : -1, ahead });
      L.eye = { x: 0, y: 0, z: 0 };
      c.frozen = false; c.hold = null; c.runPose = false; c.yOff = 0;
      c.pos = () => toWorld(drive.cx, drive.cz);
      // how far it is goes by the car as it is now (its open mouth, how loud it is); its steps are its own, played from how
      // far it has moved itself (driveOn), so a thing standing in the road makes no sound as you pull away from it
      c.distFn = () => Math.hypot(drive.cx, drive.cz - drive.s * s.dir);
      c.CR = Object.assign({}, c.CR, { sound: null });
      L.visFrac = cr => { const p = cr.pos(), r = R.projectRect(p.x, p.y, p.z, cr.CR.w, cr.CR.h, null); if (!r) return 0; const w = Math.min(r.x + r.w, R.W) - Math.max(r.x, 0), h = Math.min(r.y + r.h, R.H) - Math.max(r.y, 0); return w > 0 && h > 0 ? w * h / Math.max(1e-6, r.w * r.h) : 0; };
      AUDIO.setLoop('engine', 0.6);
      const where = regionOf(b), behind = where === (s.dir > 0 ? 'back' : 'front');
      L.text.win = where === 'left' || where === 'right' ? (s.dir < 0 ? 'It was crouched at the side of the car. You backed away down the road, and the dark at the roadside closed over it.' : 'It was crouched at the side of the car. You floored it, and the dark at the roadside closed over it.')
        : behind ? (s.dir > 0 ? 'It was in the road behind you. You drove off, and it shrank away into the red of the tail lights.' : 'You backed away down the road with the lights full on it, and it stood in the road and watched you go.')
        : s.dir < 0 ? 'You backed past it where it crouched at the side of the road behind you, and kept going.' : 'You drove past it where it crouched at the side of the road, and you did not look in the mirror.';
    }
    function stepsOn(c, x0, z0) {   // its own footsteps while the car gets away, as loud as it is near the car now
      drive.odo += Math.hypot(drive.cx - x0, drive.cz - z0);
      const n = Math.floor(drive.odo * CREATURES.crawler.stepRate);
      if (n === drive.steps) return;
      drive.steps = n;
      const p = c.pos(), dx = p.x - L.eye.x, dz = p.z - L.eye.z;
      AUDIO.footstep('crawler', clamp(2.4 / (Math.hypot(dx, dz) + 1.6), 0, 0.85) * 0.6, Math.sin(wrapPi(Math.atan2(dx, dz) - G.cam.yaw)) * 0.85);
    }
    function driveOn(dt) {
      if (drive.t === 0) setOff();
      const c = L.creature, x0 = drive.cx, z0 = drive.cz, dir = s.dir;
      drive.t += dt;
      const fwd = dir > 0, acc = fwd ? 6.2 : 4.4, vmax = fwd ? 26 : 13;
      drive.v = Math.min(vmax, drive.v + acc * smoothstep(drive.t / 0.45) * dt);   // the tyres bite, then it pulls
      drive.s += drive.v * dt;
      const e = toWorld(0, drive.s * dir);
      L.eye.x = e.x; L.eye.z = e.z;
      if (fwd && drive.t > 1.9 && !drive.shifted) { drive.shifted = true; AUDIO.sfx('rev'); }   // up a gear
      G.shake(0.04 + 0.05 * drive.v / vmax);
      // the thing: on a verge the car is coming to, it shies out of the lights, lets the car past, then gives chase down
      // the road behind it; anywhere else (in the road the car backs away from, beside the car, in the road behind as it
      // drives off) it scuttles after the car in bursts, gaining a little at first and never more. Either way it tires
      // within a few seconds and stands there
      const carZ = drive.s * dir, burst = c.mode === 'scuttle' ? 10 : 1.8;
      const toward = (x, z, v) => { const dx = x - drive.cx, dz = z - drive.cz, d = Math.hypot(dx, dz); if (d < 1e-3) return; const k = Math.min(1, v * dt / d); drive.cx += dx * k; drive.cz += dz * k; };
      if (drive.ahead && drive.passedAt < 0 && (carZ - drive.cz) * dir > -0.5) drive.passedAt = drive.t;
      if (drive.ahead && drive.passedAt < 0) {   // out of the way of the car: side-on, scuttling flat out across the verge while it goes
        const bx = drive.cx;
        toward(0.4 + drive.side * Math.max(4.6, drive.side * (bx - 0.4)), drive.cz - 0.6 * dt * dir, 9);   // only ever outward: far up the verge it is off the road already
        const moved = Math.abs(drive.cx - bx);
        c.runPose = moved > 1e-3; c.runDir = drive.side * dir; c.runGait = (c.runGait || 0) + moved * 5.5;
      } else {   // after it, never as fast as the car
        c.runPose = false;
        const t0 = drive.ahead ? drive.passedAt + 1.4 : 1.6, tire = clamp(1 - (drive.t - t0) / 1.5, 0, 1);
        if (drive.t > 0.3) toward(0.4, carZ - 4 * dir, Math.min(burst * 1.2, Math.max(burst * 0.6, drive.v * 0.8)) * tire);
        if (!drive.ahead) {   // it gains a little at first, and never more
          const dx = drive.cx, dz = drive.cz - carZ, d = Math.hypot(dx, dz);
          if (d < drive.gap && d > 1e-3) { drive.cx = dx * drive.gap / d; drive.cz = carZ + dz * drive.gap / d; }
        }
        if (tire === 0) c.frozen = true;
      }
      stepsOn(c, x0, z0);
    }
    L.update = dt => {
      for (let i = pending.length - 1; i >= 0; i--) if (L.t >= pending[i].by) pending.splice(i, 1)[0].fn();
      if (s.gearHand && s.gearHand === G.hand.reach) s.gearHand.at = knobAt(lerp(lxOf(s.gearFrom), lxOf(s.gear), gearK()));   // the hand goes over with the knob
      if (s.cranking > 0) s.cranking -= dt;
      // the key turns to start while it cranks (once the hand has it), and rests at on once the engine runs; out of park it
      // strains a few degrees in the hand and goes back
      let ka = !s.keyIn || s.turnAt === Infinity ? 0 : s.cranking > 0 && L.t >= s.turnAt ? 92 * DEG : s.started ? 58 * DEG : 0;
      const jt = L.t - s.jigAt;
      if (s.keyIn && !s.started && jt >= 0 && jt < 0.45) ka = (12 + 3 * Math.sin(jt * 47)) * DEG * Math.min(1, jt / 0.06, (0.45 - jt) / 0.12);
      s.keyAng += (ka - s.keyAng) * Math.min(1, dt * 18);
      if (s.ram && G.state === 'play') ramOn(dt);
      roamOn(dt);
    };
    L.aftermath = (t, dt) => { driveOn(dt); return t >= 4.4; };   // the car keeps going while the night fades out
    // the view: in reverse it stays on the thing; going forward it follows it as the car comes up on it, then, once it is
    // off to the side (or at once, if it was beside or behind the car), goes back to the road ahead. You do not look round for it
    L.watchPoint = () => {
      if (!L.eye || s.dir < 0) return null;
      if (!drive.eyesFront && Math.atan2(Math.abs(drive.cx), drive.cz - drive.s) > 62 * DEG) drive.eyesFront = true;
      return drive.eyesFront ? Object.assign(toWorld(0.4, drive.s + 40), { y: 0.5 }) : null;
    };

    // the ignition: a chrome ring round a dark face, four marks for its positions (lock, accessory, on, start) and the
    // keyhole, set in the dash face beside the dials, so it is there in front of you as you look over the wheel at the
    // road. With the key in, its green head stands out of the lock and shows how far it is turned (s.keyAng); the ring
    // and the little plain key hang below it. Drawn over the dash face it is set in (and over the wheel, though from the
    // seat the wheel never comes in front of it)
    const metal = [178, 174, 162], metalD = [112, 108, 100], green = [46, 160, 78];
    const lock = SC.mkSprite(L, IX, IY - 0.08, IZ, 0.12, 0.125, (ctx, P) => {
      ctx.translate(0, 0.08); ctx.scale(0.82, 0.82);
      P_ell(ctx, 0, 0, 0.05, 0.05, P.col([38, 38, 44]));
      P_ell(ctx, 0, 0, 0.045, 0.045, P.col([150, 150, 156]));
      P_ell(ctx, 0, 0, 0.029, 0.029, P.col([26, 26, 30]));
      for (const a of [0, 30, 60, 90]) { ctx.save(); ctx.rotate(-a * DEG); P_rect(ctx, -0.003, 0.032, 0.006, 0.01, P.col([58, 58, 64])); ctx.restore(); }
      if (!s.keyIn) { P_rect(ctx, -0.0045, -0.017, 0.009, 0.034, P.col([4, 4, 5])); return; }
      P_line(ctx, 0, 0, 0.003, -0.03, 0.003, P.col(metalD));   // short, so it all stays in view over the wheel
      ctx.strokeStyle = P.col(metal); ctx.lineWidth = 0.004; ctx.beginPath(); ctx.arc(0.004, -0.044, 0.014, 0, TAU); ctx.stroke();
      P_ell(ctx, 0.009, -0.062, 0.0075, 0.0075, P.col(metal)); P_ell(ctx, 0.009, -0.062, 0.003, 0.003, P.col([26, 26, 30]));
      P_rect(ctx, 0.006, -0.09, 0.006, 0.024, P.col(metal));
      for (let k = 0; k < 3; k++) P_rect(ctx, 0.011, -0.086 + k * 0.007, 0.005, 0.0035, P.col(metal));
      ctx.save(); ctx.rotate(-s.keyAng);
      P_rect(ctx, -0.019, -0.009, 0.038, 0.062, P.col(green));
      P_rect(ctx, -0.019, 0.045, 0.038, 0.008, P.col(mixc(green, [220, 255, 220], 0.35)));
      P_rect(ctx, -0.019, -0.009, 0.038, 0.007, P.col(scalec(green, 0.6)));
      P_ell(ctx, 0, 0.028, 0.006, 0.006, P.col(scalec(green, 0.5)));
      ctx.restore();
    }, { attach: true, sortDist: 0.45, face: Math.PI });   // (set in the dash face, it looks back at you and never turns)
    glowWith(ign, [lock]);
    // the dials behind the wheel light up once the engine runs, their needles up off the stops: the speed, the revs (which
    // jump when you press the gas) and the fuel
    const gaugeDist = x => (Math.hypot(x - 0.035, 0.535) + Math.hypot(x + 0.035, 0.535)) / 2;   // as the dial under it is sorted
    function dials() {
      const vmax = s.dir > 0 || s.ram ? 26 : 13, v = s.ram ? s.ram.v : drive.v, rev = clamp(1 - (L.t - s.pressT) / 0.6, 0, 1);
      GAUGES.forEach((x, i) => {
        const sd = gaugeDist(x), k = i === 0 ? clamp(v / vmax, 0, 1) : i === 1 ? clamp(0.2 + 0.55 * rev + 0.4 * v / vmax, 0, 1) : 0.6;
        const a = (160 - 140 * k) * DEG, nx = x + Math.cos(a) * 0.025, ny = 0.871 + Math.sin(a) * 0.025;
        R.add(SC.mkQuad(L, [x - 0.03, 0.869, 0.534], [x + 0.03, 0.869, 0.534], [x + 0.03, 0.901, 0.534], [x - 0.03, 0.901, 0.534], [44, 128, 78], { noFog: true, noLight: true, attach: true, sortDist: sd - 0.0005 }));
        R.add({ kind: 'poly', pts: [L.pt(x, 0.871, 0.533), L.pt(nx, ny, 0.533)], color: [236, 226, 190], stroke: true, lw: 0.003, noFog: true, noLight: true, attach: true, sortDist: sd - 0.001 });
      });
    }
    // rain, in the world rather than over the picture: it falls round the car and goes with it, but never inside it. Every
    // drop is drawn before any part of the car (whose farthest piece, the hood, sorts at about 2 m), so the body hides it
    // and it shows only through the windshield and the windows, never across the dash, the seats or the footwells. It ends
    // at the road; within a few metres of the eye nothing below the car's floor can be seen from the seat, so there it ends
    // at the floor's height (drawn first, the floor could not hide it). Each drop comes down somewhere new each time round
    const RAIN_N = 340, RAIN_TOP = 4.5, RAIN_SD = 2.4, FLOOR_Y = 0.35;
    const rainHash = n => { n |= 0; n = Math.imul(n ^ (n >>> 15), 0x85ebca6b); n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
    const drops = [];
    for (let i = 0; i < RAIN_N; i++) {
      const len = 0.25 + rainHash(i * 3 + 2) * 0.25;
      drops.push({ v: 8 + rainHash(i * 3 + 1) * 4, len, ph: rainHash(i * 3 + 3) * (RAIN_TOP + len), p: { kind: 'poly', pts: [[0, 0, 0], [0, 0, 0]], color: [200, 210, 230], stroke: true, lw: 0.006, alpha: 0.28, noFog: true, noLight: true, attach: true, layer: 1 } });
    }
    const rain = { t: 0, lastG: null };
    const inCar = (x, y, z) => (y < 1.6 && x > -0.5 && x < 1.3 && z > -1.17 && z < 1.0) ||   // the cabin, roof to road
      (z >= 1.0 && z < 2.55 && x > -0.6 && x < 1.4 && y < 1.05 - 0.22 * (z - 0.95) / 1.55);   // under the hood
    function rainOn() {
      if (rain.lastG !== null && G.state !== 'paused') rain.t += Math.min(0.1, Math.max(0, G.t - rain.lastG));
      rain.lastG = G.t;
      for (let i = 0; i < RAIN_N; i++) {
        const d = drops[i], cyc = RAIN_TOP + d.len, fall = rain.t * d.v + d.ph, k = Math.floor(fall / cyc), top = RAIN_TOP + d.len - (fall - k * cyc);
        const h = i * 7919 + k * 104729, a = rainHash(h) * TAU, r = 0.6 + rainHash(h + 1) * 6.5;
        const x = 0.4 + Math.sin(a) * r, z = Math.cos(a) * r;   // round the middle of the car
        const bot = Math.max(top - d.len, r < 3.5 ? FLOOR_Y : 0);
        if (top <= bot || inCar(x, bot, z)) continue;   // a drop that reaches into the car is not drawn at all
        const p = d.p, q0 = L.pt(x, bot, z), q1 = L.pt(x + (top - bot) * 0.06, top, z);
        p.pts[0] = q0; p.pts[1] = q1;
        p.dist = Math.hypot(x, z); p.sortDist = Math.max(RAIN_SD, p.dist);
        R.add(p);
      }
    }

    L.dynamic = () => {
      rainOn();
      R.add(lock);
      if (s.started && L.t >= s.turnAt) dials();   // (once the key has turned)
      // the gearstick: its plate lying flat on the console, a pale bezel round a black face with the four letters along
      // it, the one it is in lit, and the slot along its far side; the plate's edges toward you; the stick standing up out
      // of the slot over the letter, and its knob. The plate is clicked where it lies (the target's own hit area), the
      // stick and the knob where they stand (stickHit)
      const k = 'PRND'.indexOf(shownGear()), lx = lerp(lxOf(s.gearFrom), lxOf(s.gear), gearK());   // (going over as the hand pulls it)
      const sd = Math.hypot(GX + GH / 2, GZ), bez = [50, 48, 52], u0 = GZ + GW / 2, u1 = GZ - GW / 2;
      R.add(SC.mkQuad(L, [GX, CY, u0], [GX, CY, u1], [GX, GY, u1], [GX, GY, u0], bez, { attach: true, sortDist: sd + 0.001, glowOf: gear }));
      R.add(SC.mkQuad(L, [GX, CY, u1], [GX + GH, CY, u1], [GX + GH, GY, u1], [GX, GY, u1], scalec(bez, 0.8), { attach: true, sortDist: sd + 0.001, glowOf: gear }));
      R.add(SC.mkSprite(L, GX, GY, GZ, GW, GH, (ctx, P) => {
        P_rect(ctx, -GW / 2, 0, GW, GH, P.col([66, 64, 68]));
        P_rect(ctx, -GW / 2 + 0.008, 0.008, GW - 0.016, GH - 0.016, P.col([14, 13, 15]));
        P_rect(ctx, -0.096, GS - 0.006, 0.192, 0.012, P.col([2, 2, 3]));            // the slot the stick runs in
        P_rect(ctx, lx - 0.022, 0.02, 0.044, 0.046, P.raw([120, 70, 26]));          // the lit window behind the letter
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 72px sans-serif';
        'PRND'.split('').forEach((ch, i) => {
          ctx.save(); ctx.translate(-0.075 + i * 0.05, 0.043); ctx.scale(0.00052, -0.00052);
          ctx.fillStyle = i === k ? P.raw([255, 214, 140]) : P.col([92, 90, 92]); ctx.fillText(ch, 0, 0);
          ctx.restore();
        });
      }, { attach: true, sortDist: sd, glowOf: gear, flat: true, face: GTOP }));
      const foot = stickFoot(lx), knob = knobOf(lx), stick = (a, b, color, lw, d) => R.add({ kind: 'poly', pts: [L.pt(a[0], a[1], a[2]), L.pt(b[0], b[1], b[2])], color, stroke: true, lw, attach: true, sortDist: sd - d, glowOf: gear });
      stick(foot, knob, [46, 44, 48], 0.018, 0.003);
      stick(knob, [knob[0], knob[1] + 0.001, knob[2]], [74, 70, 74], 0.042, 0.004);                                   // the knob
      stick([knob[0] - 0.006, knob[1] + 0.009, knob[2] + 0.004], [knob[0] - 0.006, knob[1] + 0.01, knob[2] + 0.004], [104, 100, 106], 0.02, 0.005);   // lit on top
      // stickHit: an upright panel across the car through the stick, square to your seat, as tall as the stick and its knob
      R.add(SC.mkSprite(L, GX + GS - GLEAN / 2, GY, GZ - lx, 0.08, GK + 0.03, () => {}, { attach: true, sortDist: sd - 0.006, hit: { kind: 'target', ref: gear }, noHover: true, hitOnly: true, face: -Math.PI / 2 }));
      // the gas pedal: a long rubber pad in a metal rim, ribbed across, hung on its arm from under the dash; it goes down
      // while you press it, and stays down once the car is away
      const dn = pedalDown() + (s.gone || s.floored ? 0.025 : 0), y0 = 0.012 - dn * 0.5;
      R.add(SC.mkSprite(L, PX, PY, PZ, PW, PH, (ctx, P) => {
        P_line(ctx, 0.004, y0 + 0.13, 0.026, PH - 0.004, 0.014, P.col([70, 70, 74]));          // the arm, up under the dash
        const rim = P.col([108, 106, 110]), pad = P.col([34, 33, 36]), rib = P.col([88, 86, 90]);
        P_rect(ctx, -0.036, y0, 0.072, 0.15, rim); P_ell(ctx, 0, y0, 0.036, 0.012, rim); P_ell(ctx, 0, y0 + 0.15, 0.036, 0.012, rim);
        P_rect(ctx, -0.029, y0 + 0.004, 0.058, 0.142, pad); P_ell(ctx, 0, y0 + 0.004, 0.029, 0.009, pad); P_ell(ctx, 0, y0 + 0.146, 0.029, 0.009, pad);
        for (let i = 0; i < 6; i++) P_rect(ctx, -0.022, y0 + 0.018 + i * 0.023, 0.044, 0.008, rib);   // its ribs
      }, { attach: true, sortDist: Math.hypot(PX, PZ) + 0.002, glowOf: gas, face: Math.PI }));   // (its face looks back at you, fixed to the car)
    };
    // ---- your foot on the gas ----
    // How far down the pedal is: pressed it goes down under your foot and comes back up; with the engine dead it goes all
    // the way to the floor, limp, stays there a moment and comes back slowly
    function pedalDown() {
      const t = L.t - s.pressT, deep = s.dead ? 0.05 : 0.025, back = s.dead ? 0.5 : 0.22;
      if (t < 0 || t > 0.2 + back) return 0;
      return t < 0.07 ? deep * smoothstep(t / 0.07) : t < 0.2 ? deep : deep * (1 - smoothstep((t - 0.2) / back));
    }
    // and your foot, drawn over the view as the hands are: it comes up from the bottom of the view onto the pedal, presses
    // and goes back (it stays on it once the car is away). A dark trouser leg and a worn shoe, the toe on the lower half of
    // the pad, so the top of the pad is seen going down under it
    const LEG = [36, 36, 44], SHOE = [46, 37, 32];
    L.overlay = (ctx, W, H) => {
      shatter(ctx, W, H);
      const t = L.t - s.pressT, on = s.gone || s.floored, dur = 0.2 + (s.dead ? 0.5 : 0.22) + 0.12;
      if (!on && (t < 0 || t > dur)) return;
      if (L.eye && (L.eye.x || L.eye.z)) return;   // (the car is away: the view is on the road)
      const dn = pedalDown() + (on ? 0.025 : 0), p = L.pt(PX, PY + 0.07 - dn * 0.5, PZ - 0.02), q = R.screenPos(p[0], p[1], p[2]);
      if (!q || q.x < -W * 0.2 || q.x > W * 1.2 || q.y < -H * 0.2 || q.y > H * 1.2) return;
      const k = q.scale, gone = on ? 0 : 1 - smoothstep(t / 0.07) + smoothstep((t - dur + 0.2) / 0.2);   // in from below, and back out
      const tx = q.x, ty = q.y + gone * H * 0.5 + k * 0.01, ax = q.x + k * 0.02, ay = ty + k * 0.17;   // the toe, the ankle
      const lit = c => rgba(scalec(c, 1 + (G.flashAmt || 0)));
      ctx.save();
      ctx.lineCap = 'round';
      // the leg, from the bottom of the view to the ankle, wider as it comes nearer
      const lw0 = k * 0.11, lw1 = Math.max(k * 0.2, W * 0.08), bx = ax + k * 0.08;
      ctx.fillStyle = lit(LEG);
      ctx.beginPath(); ctx.moveTo(ax - lw0 / 2, ay); ctx.lineTo(ax + lw0 / 2, ay); ctx.lineTo(bx + lw1 / 2, H + 4); ctx.lineTo(bx - lw1 / 2, H + 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = lit(scalec(LEG, 1.5)); ctx.lineWidth = k * 0.008;
      ctx.beginPath(); ctx.moveTo(ax - lw0 * 0.32, ay + k * 0.02); ctx.lineTo(bx - lw1 * 0.36, H + 4); ctx.stroke();   // a crease down the front
      // the shoe: from the heel by the ankle to the rounded toe on the pad, the instep catching what light there is
      ctx.fillStyle = lit(SHOE);
      ctx.beginPath(); ctx.ellipse((tx + ax) / 2, (ty + ay) / 2, k * 0.05, Math.hypot(ax - tx, ay - ty) / 2 + k * 0.04, Math.atan2(tx - ax, ay - ty), 0, TAU); ctx.fill();
      ctx.fillStyle = lit(scalec(SHOE, 1.9));
      ctx.beginPath(); ctx.ellipse(tx + k * 0.004, ty + k * 0.01, k * 0.032, k * 0.022, 0, Math.PI, TAU); ctx.fill();   // the toe cap
      ctx.strokeStyle = lit([92, 86, 78]); ctx.lineWidth = k * 0.005;
      for (let i = 0; i < 3; i++) { const yy = ty + k * (0.06 + i * 0.03), xx = tx + (ax - tx) * (0.35 + i * 0.18); ctx.beginPath(); ctx.moveTo(xx - k * 0.018, yy); ctx.lineTo(xx + k * 0.018, yy); ctx.stroke(); }   // laces
      ctx.fillStyle = lit(scalec(LEG, 0.8));
      ctx.beginPath(); ctx.ellipse(ax, ay, lw0 / 2, k * 0.025, 0, 0, TAU); ctx.fill();   // the trouser cuff over the heel
      ctx.restore();
    };
    // ---- the glass it comes through ----
    // Caught, the window it comes up to breaks in its face: a star of cracks runs out from where it hits and rings join
    // them, then the glass bursts in a flash, with the shriek of the glass, and shards fly at you (with reduced motion,
    // they drop away; with reduced flashing the flash is the game's dimmer one) and the cracked pane stays round the hole.
    // Drawn over the view, in the window's own outline as it is seen now. The windows' outlines in the car's frame:
    const PANES = {
      front: [[-0.5, 1.02, 0.95], [1.3, 1.02, 0.95], [1.3, 1.45, 0.6], [-0.5, 1.45, 0.6]],
      passenger: [[1.25, 1.06, -0.5], [1.25, 1.06, 0.58], [1.25, 1.5, 0.2], [1.25, 1.5, -0.5]],
      driver: [[-0.45, 1.06, -0.5], [-0.45, 1.06, 0.58], [-0.45, 1.5, 0.2], [-0.45, 1.5, -0.5]],
      back: [[-0.47, 0.93, -1.12], [1.27, 0.93, -1.12], [1.27, 1.55, -1.12], [-0.47, 1.55, -1.12]],
    };
    const glass = { at: null };
    function paneHit(win, b) {   // where the line from the seat toward it meets that window, in the car's frame (kept inside the pane)
      const sb = Math.sin(b), cb = Math.cos(b), y = 1.2;
      if (win === 'front') return [clamp(0.95 * sb / Math.max(0.2, cb), -0.35, 1.15), y, 0.95 - (y - 1.02) * 0.35 / 0.43];
      if (win === 'back') return [clamp(-1.12 * sb / Math.min(-0.2, cb), -0.35, 1.15), y + 0.05, -1.12];
      const x = win === 'passenger' ? 1.25 : -0.45;
      return [x, y, clamp(x * cb / (Math.abs(sb) < 0.2 ? 0.2 * Math.sign(sb || 1) : sb), -0.4, 0.3)];
    }
    function shatter(ctx, W, H) {
      if (G.state !== 'dying' && G.state !== 'dead') { glass.at = null; return; }
      const c = G.deathCreature;
      if (!c || c !== L.creature) return;
      if (glass.at !== G.deathAt) {   // a new death: which window, where, and its pattern of cracks
        const win = G.deathCause === 'drove' ? 'front' : G.deathCause === 'reversed' ? 'back' : windowOf(bear()), h = mulberry32(((G.deathAt * 1000) | 0) + 7);
        const rays = [];
        for (let i = 0, n = 13 + Math.floor(h() * 4); i < n; i++) {
          const a0 = (i + h() * 0.6) / n * TAU, pts = [[0, 0]];
          let a = a0, r = 0;
          for (let j = 0; j < 7; j++) { r += 0.06 + h() * 0.12; a += (h() - 0.5) * 0.35; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
          rays.push(pts);
        }
        const shards = [];
        for (let i = 0; i < 26; i++) { const a = h() * TAU, sp = 0.4 + h() * 1.1; shards.push({ a, sp, r0: h() * 0.12, size: 0.02 + h() * 0.05, spin: (h() - 0.5) * 9, rot: h() * TAU, k: [h(), h(), h()] }); }
        glass.at = G.deathAt; glass.win = win; glass.hit = paneHit(win, bear()); glass.rays = rays; glass.shards = shards; glass.broke = false;
      }
      const spec = c.deathSpec || c.CR.death || {}, t = G.stateT, tb = (spec.delay || 0) + (spec.dur || 0.3) * 0.5;   // it breaks halfway into the lunge
      const e = L.eye || {}, pt = q => { const w = L.pt(q[0], q[1], q[2]); return R.screenPos(w[0] + (e.x || 0), w[1], w[2] + (e.z || 0)); };
      const o = pt(glass.hit);
      if (!o) return;
      if (t >= tb && !glass.broke) {
        glass.broke = true;
        AUDIO.sfx('stingGlass', panOf(bear())); G.flash(0.7); G.shake(0.9);
      }
      const still = SAVE.data.settings.reducedMotion, R0 = Math.max(W, H) * 0.75, grow = glass.broke ? 1 : Math.sqrt(clamp(t / tb, 0, 1)) * 0.75;
      const hole = glass.broke ? R0 * 0.1 : 0;
      ctx.save();
      // (along each edge in short steps, leaving out what is behind the eye: a side window is right beside you)
      const pane = PANES[glass.win], poly = [];
      pane.forEach((q0, i) => { const q1 = pane[(i + 1) % pane.length]; for (let j = 0; j < 12; j++) { const p = pt(q0.map((v, k) => lerp(v, q1[k], j / 12))); if (p) poly.push(p); } });
      if (poly.length > 2) { ctx.beginPath(); poly.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.clip(); }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // the pane, gone milky where it is crazed, and the cracks: the long ones out from the hit, then rings across them
      const lim = R0 * grow;
      if (glass.broke) { ctx.fillStyle = 'rgba(190,200,215,0.05)'; ctx.fillRect(0, 0, W, H); }
      for (const pass of [0, 1]) {
        ctx.strokeStyle = pass ? 'rgba(225,232,242,0.6)' : 'rgba(10,12,16,0.55)'; ctx.lineWidth = pass ? Math.max(1, W / 900) : Math.max(2, W / 450);
        ctx.beginPath();
        for (const ray of glass.rays) {
          let started = false;
          for (const [x, y] of ray) {
            const r = Math.hypot(x, y) * R0;
            if (r > lim) break;
            if (r < hole) continue;
            const sx = o.x + x * R0, sy = o.y + y * R0;
            if (!started) { ctx.moveTo(sx, sy); started = true; } else ctx.lineTo(sx, sy);
          }
        }
        for (const ring of [0.05, 0.11, 0.19, 0.3]) {   // the rings: from each crack to the next at about that far out
          if (ring * R0 > lim || ring * R0 < hole) continue;
          glass.rays.forEach((ray, i) => {
            const nx = glass.rays[(i + 1) % glass.rays.length], at = q => q[Math.min(q.length - 1, Math.max(1, Math.round(ring / 0.12)))];
            const p0 = at(ray), p1 = at(nx);
            ctx.moveTo(o.x + p0[0] * R0, o.y + p0[1] * R0); ctx.lineTo(o.x + (p0[0] + p1[0]) * 0.47 * R0, o.y + (p0[1] + p1[1]) * 0.47 * R0); ctx.lineTo(o.x + p1[0] * R0, o.y + p1[1] * R0);
          });
        }
        ctx.stroke();
      }
      ctx.restore();
      // the shards, bursting in from the hole toward you (or, with reduced motion, falling away), catching what light there is
      if (!glass.broke || G.state !== 'dying') return;
      const te = t - tb, fade = clamp(1 - te / 0.9, 0, 1);
      if (fade <= 0) return;
      ctx.save();
      for (const sh of glass.shards) {
        const out = still ? sh.r0 + te * 0.05 : sh.r0 + sh.sp * te * (0.6 + te), z = still ? 1 : 1 + te * 6 * sh.sp;
        const x = o.x + Math.cos(sh.a) * out * R0 * 0.5, y = o.y + Math.sin(sh.a) * out * R0 * 0.5 + (still ? te * H * 0.25 : te * te * H * 0.4);
        const sz = sh.size * R0 * 0.35 * z, rot = sh.rot + (still ? 0 : sh.spin * te);
        ctx.fillStyle = 'rgba(' + Math.round(185 + sh.k[0] * 50) + ',' + Math.round(195 + sh.k[0] * 45) + ',' + Math.round(210 + sh.k[0] * 40) + ',' + (fade * (0.35 + sh.k[2] * 0.4)).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(rot) * sz, y + Math.sin(rot) * sz);
        ctx.lineTo(x + Math.cos(rot + 2.3) * sz * 0.6, y + Math.sin(rot + 2.3) * sz * 0.6);
        ctx.lineTo(x + Math.cos(rot + 4.1) * sz * 0.8, y + Math.sin(rot + 4.1) * sz * 0.8);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    L.floor = { poly: [[-0.4, -0.9], [1.2, -0.9], [1.2, 0.7], [-0.4, 0.7]], y: 0.36 };
    L.onEnd = () => AUDIO.stopLoop();
  }
});
