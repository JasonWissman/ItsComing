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
  ambient: { wind: 0.45, drone: 1, droneFreq: 41, windFreq: 220, rain: 0.8 },
  weather: { kind: 'rain', density: 0.8, wind: 0.4 },
  // the headlights and the dash glow belong to the car: they go where it goes
  lights: [{ x: 0.4, y: 0.75, z: 1.6, r: 52, i: 1.25, color: [228, 218, 178], cone: { x: 0, y: -0.06, z: 1, deg: 24 }, attach: true }, { x: 0, y: 0.9, z: 0.55, r: 0.9, i: 0.1, color: [90, 200, 120], attach: true }],
  text: {
    intro: 'The engine died on the county road, miles from anything. It stalled in drive.<br>Something is coming, low, at the edge of the headlights.',
    hint: 'The keys fell somewhere when the car stalled.',
    objective: 'Start the car and get away.',
    death: { default: 'It came through the windshield.', drove: 'You drove straight at it. It came up over the hood.' },
    win: 'It caught. You did not look in the mirror.',
    fragment: 'The car has not started on the first turn since. You have stopped mentioning it.',
  },
  // the windshield is the opening; the hood hides the last metres of road. It can come up the crown of
  // the road or along either verge, just off the beam
  lanes: [
    { deg: 0, name: 'road', barrierDist: 0, apertures: [{ z: 0.95, x0: -0.5, x1: 1.3, y0: 1.02, y1: 1.45 }], blockers: [[0, 7.5]], default: true },
    { deg: 11, name: 'right verge', barrierDist: 0, apertures: [{ z: 0.97, x0: -0.68, x1: 1.12, y0: 1.02, y1: 1.45 }], blockers: [[0, 7.5]] },
    { deg: -11, name: 'left verge', barrierDist: 0, apertures: [{ z: 0.97, x0: -0.32, x1: 1.48, y0: 1.02, y1: 1.45 }], blockers: [[0, 7.5]] },
  ],
  creatures: [{ type: 'crawler', startDist: 85, time: 52, unseenMult: 1.35 }],   // a little longer than it was: the gear and the gas are two more things to do
  build(L) {
    const s = L.s;
    const body = [44, 22, 24], bodyD = [24, 13, 15], dash = [26, 24, 26], dashD = [16, 15, 17], seat = [46, 40, 38], floor = [15, 14, 14];
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
    for (const x of [-0.16, 0.0, 0.16]) SC.quad(L, [x - 0.035, 0.865, 0.535], [x + 0.035, 0.865, 0.535], [x + 0.035, 0.905, 0.535], [x - 0.035, 0.905, 0.535], [22, 52, 34], { noFog: true, noLight: true });
    SC.sprite(L, 0.18, 0.74, 0.5, 0.1, 0.1, (ctx, P) => { ctx.scale(0.1, 0.1); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([110, 110, 116])); P_ell(ctx, 0, 0.5, 0.3, 0.3, P.col([18, 18, 20])); P_rect(ctx, -0.05, 0.28, 0.1, 0.44, P.col([80, 80, 86])); });
    SC.quad(L, [-0.55, 1.02, 0.95], [1.35, 1.02, 0.95], [1.3, 0.8, 2.5], [-0.5, 0.8, 2.5], body); // the hood falls away below the dash line so the dash is the real occluder, as the lane apertures say
    { // steering wheel + column
      const pts = []; const cy = 0.92, cz = 0.52, r = 0.17;
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; pts.push(L.pt(Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, cz - Math.sin(a) * r * 0.55)); }
      L.props.push({ kind: 'poly', pts, color: [22, 20, 22], stroke: true, lw: 0.024 });
      SC.quad(L, [-0.04, 0.8, 0.5], [0.04, 0.8, 0.5], [0.04, 0.9, 0.56], [-0.04, 0.9, 0.56], [22, 20, 22]);
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
    SC.box(L, 0.55, 1.15, 0.35, 0.95, -0.25, 0.35, seat);
    SC.box(L, 0.55, 1.15, 0.95, 1.4, -0.25, -0.1, seat);
    SC.box(L, -0.45, 1.25, 0.35, 0.62, -0.98, -0.6, seat);              // the back seat, low enough to see the road behind over it
    SC.box(L, -0.45, 1.25, 0.35, 0.9, -1.04, -0.92, seat);
    SC.quad(L, [-0.47, 0.92, -1.12], [1.27, 0.92, -1.12], [1.27, 0.92, -0.98], [-0.47, 0.92, -0.98], bodyD);   // the shelf under the back window
    STORY.lamp(L, 0.95, 0.95, 0.3, { scale: 0.7 });          // a bedside lamp on the passenger seat, of all things
    for (const p of L.props.slice(n0)) p.attach = true;
    // items and the ignition; everything lying in the car goes with it
    const keySpots = [
      { x: 0.66, y: 0.36, z: 0.48, jitter: 0.06 },      // passenger footwell
      { x: -0.15, y: 0.36, z: 0.42, jitter: 0.06 },     // your own footwell
      { x: 0.36, y: 0.36, z: -0.12, jitter: 0.05 },     // between the seats
      { x: 0.4, y: 0.36, z: -0.5, jitter: 0.05 },       // behind the seats
      { x: 0.85, y: 0.95, z: 0.05, jitter: 0.04, key: 'seat' }, // on the passenger seat
    ];
    mkItem(L, 'keys', 'Car keys', keySpots, { w: 0.2, h: 0.2, flat: true, icon: 'carkeys', attach: true });
    mkItem(L, 'housekeys', 'Keys', keySpots, { w: 0.2, h: 0.2, flat: true, icon: 'housekeys', attach: true, decoy: true, decoyText: 'House keys. Not these.' });
    L.floorY = 0.36;
    mkItem(L, 'bottle', 'Empty bottle', [
      { x: 0.9, y: 0.36, z: -0.45, flat: false },       // rear floor
      { x: 0.95, y: 1.02, z: 0.78, flat: false },       // on the dash
      { x: 1.05, y: 0.95, z: 0.0, flat: false, key: 'seat' }, // on the passenger seat, in front of the seat back
    ], { w: 0.09, h: 0.24, icon: 'bottle', attach: true });
    // it stalled in drive, and it will not start until the stick is in park. Once it runs, the stick goes to reverse or
    // drive and the gas takes you away; straight ahead is only a way out if the thing is not in the road
    Object.assign(s, { keyIn: false, cranks: 0, cranking: 0, started: false, cranksNeeded: 2 + Math.floor(L.rand() * 3), gear: 'D', lastCrank: -10, gone: false, dir: 0, pressT: -10 });
    const GEAR_NAME = { P: 'park', R: 'reverse', D: 'drive' };
    const ign = mkTarget(L, {
      id: 'ignition', name: 'Ignition', x: 0.18, y: 0.78, z: 0.5, w: 0.16, h: 0.18, accepts: ['keys', 'housekeys'], attach: true,
      hint() { return s.started ? 'Running.' : s.keyIn ? (s.gear !== 'P' ? 'Turn the key. It is still in ' + GEAR_NAME[s.gear] + ', though.' : 'Turn the key.') : 'The ignition. No key in it.'; },
      use(item) { if (item.id !== 'keys') return false; s.keyIn = true; ign.accepts = []; AUDIO.sfx('keys'); G.say('The key is in. Turn it.', 'The key is in.'); return true; },
      onClick() {
        if (!s.keyIn) {
          if (G.inv.some(i => ign.accepts.includes(i.id))) return false;   // the keys in hand go in (or are refused)
          AUDIO.sfx('nope'); G.say('No key. They fell somewhere when it stalled.', 'There is no key in the ignition.'); return true;
        }
        if (s.started) { G.say('It is running. Now the gearstick, and the gas.', 'The engine is running.'); return true; }
        if (s.cranking > 0) return true;
        if (s.gear !== 'P') { AUDIO.sfx('nope'); G.say('Nothing, not even a click. It will only start in park.', 'Nothing. Not even a click. The gearstick is in ' + GEAR_NAME[s.gear] + '.'); return true; }
        s.lastCrank = L.t; s.cranking = 1.15;
        s.cranks++;
        if (s.cranks >= s.cranksNeeded) { s.started = true; AUDIO.sfx('start'); G.shake(0.3); G.say('It caught. Into reverse or drive, then the gas.', 'It caught. The engine is running.'); }
        else { AUDIO.sfx('crank'); G.shake(0.12); G.toast(s.cranks === 1 ? 'It turns over. It does not catch.' : 'Come on. Come on.'); }
        return true;
      },
    });
    // the gearstick between the seats by your right hip (back from the footwells, so it never hides what lies in them),
    // P R N D on its plate: each click moves it on, park, reverse, drive and round to park
    const GX = 0.36, GY = 0.6, GZ = 0.12, GW = 0.2, GH = 0.28;
    mkTarget(L, {
      id: 'gear', name: 'Gearstick', x: GX, y: GY, z: GZ, w: GW, h: GH, attach: true,
      hint() { return 'In ' + GEAR_NAME[s.gear] + '.'; },
      onClick() {
        if (s.gone) return true;
        s.gear = { P: 'R', R: 'D', D: 'P' }[s.gear];
        AUDIO.sfx('lever'); G.shake(0.06);
        const name = GEAR_NAME[s.gear][0].toUpperCase() + GEAR_NAME[s.gear].slice(1) + '.';
        G.say(name + (s.started ? (s.gear === 'P' ? '' : ' Now the gas.') : (s.gear === 'P' ? ' Now the key.' : ' It will not start in ' + GEAR_NAME[s.gear] + '.')), name);
        return true;
      },
    });
    // the gas pedal, in your own footwell
    const PX = 0.16, PY = 0.36, PZ = 0.47, PW = 0.11, PH = 0.22;
    mkTarget(L, {
      id: 'gas', name: 'Gas pedal', x: PX, y: PY, z: PZ, w: PW, h: PH, attach: true,
      hint() { return s.started ? (s.gear === 'P' ? 'It is in park.' : 'Go.') : 'The engine is not running.'; },
      onClick() {
        if (s.gone) return true;
        s.pressT = L.t;
        if (!s.started) { AUDIO.sfx('clunk'); G.say('Nothing. Start the engine first.', 'The pedal goes down. The engine is not running.'); return true; }
        AUDIO.sfx('rev');
        if (s.gear === 'P') { G.shake(0.12); G.say('It roars and goes nowhere. It is in park.', 'The engine roars. The car is still in park.'); return true; }
        const c = L.creature;
        if (s.gear === 'D' && c.lane.idx === 0 && !c.dead) { G.shake(0.5); die(c, 'drove'); return true; }   // straight at it
        s.gone = true; s.dir = s.gear === 'R' ? -1 : 1; G.shake(0.35);
        return true;
      },
    });
    L.isWon = () => s.gone;
    L.objectiveText = () => s.started ? (s.gear === 'P' ? 'Into reverse or drive. Then the gas.' : 'The gas.') : (s.gear !== 'P' ? 'Put it in park. ' : '') + (s.keyIn ? 'Turn the key until it starts.' : 'Find the keys. Start the car.');

    // ---- getting away: the car pulls off along the road (back down it in reverse) and the world slides past. The eye
    // moves with it (L.eye) and so does everything flagged attach; the thing is left on the road and falls behind
    const drive = { t: 0, v: 0, s: 0, cx: 0, cz: 0, gap: 0, side: 1, passedAt: -1, shifted: false, eyesFront: false };
    const toWorld = (x, z) => { const p = L.pt(x, 0, z); return { x: p[0], y: 0, z: p[2] }; };
    function setOff() {
      const c = L.creature, cp = c.pos(), loc = rotY(cp.x, cp.z, -L.facing);
      Object.assign(drive, { cx: loc[0], cz: loc[1], gap: Math.min(loc[1], Math.max(3, loc[1] * 0.75)), side: c.lane.deg > 0 ? 1 : -1 });
      L.eye = { x: 0, y: 0, z: 0 };
      c.frozen = false; c.hold = null;
      c.pos = () => toWorld(drive.cx, drive.cz);
      c.distFn = () => Math.hypot(drive.cx, drive.cz);   // from where the car stood, as on its way in: it changes only as it moves itself, so its steps are its own
      L.visFrac = cr => { const p = cr.pos(), r = R.projectRect(p.x, p.y, p.z, cr.CR.w, cr.CR.h, null); if (!r) return 0; const w = Math.min(r.x + r.w, R.W) - Math.max(r.x, 0), h = Math.min(r.y + r.h, R.H) - Math.max(r.y, 0); return w > 0 && h > 0 ? w * h / Math.max(1e-6, r.w * r.h) : 0; };
      AUDIO.setLoop('engine', 0.6);
      L.text.win = s.dir < 0 ? 'It caught. You backed away down the road with the lights full on it, and it stood in the road and watched you go.' : 'It caught. You drove past it where it crouched at the side of the road, and you did not look in the mirror.';
    }
    function driveOn(dt) {
      if (!L.eye) setOff();
      const c = L.creature;
      drive.t += dt;
      const fwd = s.dir > 0, acc = fwd ? 6.2 : 4.4, vmax = fwd ? 26 : 13;
      drive.v = Math.min(vmax, drive.v + acc * smoothstep(drive.t / 0.45) * dt);   // the tyres bite, then it pulls
      drive.s += drive.v * dt;
      const e = toWorld(0, drive.s * s.dir);
      L.eye.x = e.x; L.eye.z = e.z;
      if (fwd && drive.t > 1.9 && !drive.shifted) { drive.shifted = true; AUDIO.sfx('rev'); }   // up a gear
      G.shake(0.04 + 0.05 * drive.v / vmax);
      // the thing: in the road it scuttles after the car in bursts; on the verge it shies out of the lights, lets the car
      // past, then gives chase down the road behind it. Either way it tires within a few seconds and stands there
      const carZ = drive.s * s.dir, burst = c.mode === 'scuttle' ? 10 : 1.8;
      const toward = (x, z, v) => { const dx = x - drive.cx, dz = z - drive.cz, d = Math.hypot(dx, dz); if (d < 1e-3) return; const k = Math.min(1, v * dt / d); drive.cx += dx * k; drive.cz += dz * k; };
      if (!fwd) {
        const tire = clamp(1 - (drive.t - 1.6) / 1.4, 0, 1);
        if (drive.t > 0.3) toward(0.4, carZ + 4, burst * tire);
        drive.cz = Math.max(drive.cz, carZ + drive.gap);   // it gains a little at first, and never more
        if (tire === 0) c.frozen = true;
      } else {
        if (drive.passedAt < 0 && carZ > drive.cz - 0.5) drive.passedAt = drive.t;
        if (drive.passedAt < 0) toward(0.4 + drive.side * 4.6, drive.cz - 0.6 * dt, 9);   // out of the way of the car
        else {   // after it, never as fast as the car
          const tire = clamp(1 - (drive.t - drive.passedAt - 1.4) / 1.6, 0, 1);
          toward(0.4, carZ - 4, Math.min(burst * 1.2, drive.v * 0.8) * tire);
          if (tire === 0) c.frozen = true;
        }
      }
    }
    L.update = dt => { if (s.cranking > 0) s.cranking -= dt; };
    L.aftermath = (t, dt) => { driveOn(dt); return t >= 4.4; };   // the car keeps going while the night fades out
    // the view: in reverse it stays on the thing in the lights; going forward it follows it as the car comes up on it,
    // then, once it is off to the side, goes back to the road ahead. You do not look round for it
    L.watchPoint = () => {
      if (!L.eye || s.dir < 0) return null;
      if (!drive.eyesFront && Math.atan2(Math.abs(drive.cx), drive.cz - drive.s) > 62 * DEG) drive.eyesFront = true;
      return drive.eyesFront ? Object.assign(toWorld(0.4, drive.s + 40), { y: 0.5 }) : null;
    };

    L.dynamic = () => {
      if (s.keyIn) R.add(iconSprite(L, 'carkeys', 0.19, 0.7, 0.49, 0.1, 0.16, { attach: true }));
      R.add(SC.mkSprite(L, GX, GY, GZ, GW, GH, (ctx, P) => {
        // the plate with its four letters, the one it is in lit, and the stick leaning over to it
        const k = 'PRND'.indexOf(s.gear), lx = -0.075 + k * 0.05;
        P_rect(ctx, -0.1, 0, 0.2, 0.08, P.col([28, 26, 28]));
        P_rect(ctx, -0.09, 0.062, 0.18, 0.01, P.col([10, 10, 11]));                 // the slot the stick runs in
        P_rect(ctx, lx - 0.022, 0.012, 0.044, 0.046, P.raw([120, 70, 26]));           // the lit window behind the letter
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 72px sans-serif';
        'PRND'.split('').forEach((ch, i) => {
          ctx.save(); ctx.translate(-0.075 + i * 0.05, 0.034); ctx.scale(0.00052, -0.00052);
          ctx.fillStyle = i === k ? P.raw([255, 214, 140]) : P.col([92, 90, 92]); ctx.fillText(ch, 0, 0);
          ctx.restore();
        });
        P_line(ctx, lx, 0.066, lx * 0.6, 0.24, 0.022, P.col([46, 44, 48])); P_ell(ctx, lx * 0.6, 0.25, 0.034, 0.03, P.col([74, 70, 74]));
      }, { attach: true }));
      // the gas pedal: a ribbed rubber pad on its arm, down a little while you press it
      const dn = clamp(1 - (L.t - s.pressT) / 0.35, 0, 1) * 0.025 + (s.gone ? 0.025 : 0);
      R.add(SC.mkSprite(L, PX, PY, PZ, PW, PH, (ctx, P) => {
        P_line(ctx, 0.02, 0.11 - dn, 0.035, PH, 0.022, P.col([72, 72, 76]));         // the arm, up under the dash
        P_rect(ctx, -0.05, 0.005 - dn * 0.4, 0.1, 0.12, P.col([40, 39, 42]));         // the pad
        for (let i = 0; i < 5; i++) P_rect(ctx, -0.042, 0.02 + i * 0.021 - dn * 0.4, 0.084, 0.008, P.col([104, 100, 104]));   // its ribs
      }, { attach: true }));
    };
    L.floor = { poly: [[-0.4, -0.9], [1.2, -0.9], [1.2, 0.7], [-0.4, 0.7]], y: 0.36 };
    L.onEnd = () => AUDIO.stopLoop();
  }
});
