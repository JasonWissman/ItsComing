'use strict';
// ============================================================ 2. THE ROAD ============================================================
LEVELS.push({
  id: 'road', title: 'The Road', facing: 0, eyeH: 1.15, laneSwitch: false,
  pal: { skyTop: [3, 3, 7], fog: [15, 15, 20], ground: [20, 19, 16], fogDist: 70 },
  ambient: { wind: 0.45, drone: 1, droneFreq: 41, windFreq: 220, rain: 0.8 },
  weather: { kind: 'rain', density: 0.8, wind: 0.4 },
  lights: [{ x: 0.4, y: 0.75, z: 1.6, r: 52, i: 1.25, color: [228, 218, 178], cone: { x: 0, y: -0.06, z: 1, deg: 24 } }, { x: 0, y: 0.9, z: 0.55, r: 0.9, i: 0.1, color: [90, 200, 120] }],
  text: {
    intro: 'The engine died on the county road, miles from anything.<br>Something is coming up the road, low, at the edge of the headlights.',
    hint: 'The keys fell somewhere when the car stalled. The engine has been flooding all night.',
    objective: 'Start the car.',
    death: { default: 'It came through the windshield.' },
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
  creatures: [{ type: 'crawler', startDist: 85, time: 48, gamma: 0.75, unseenMult: 1.35 }],
  aftermath: { type: 'retreat', dur: 3.2, speed: 4, accel: 1.5, shake: 0.06 },
  build(L) {
    const s = L.s;
    const body = [44, 22, 24], bodyD = [24, 13, 15], dash = [26, 24, 26], dashD = [16, 15, 17], seat = [46, 40, 38], floor = [15, 14, 14];
    SC.stars(L, 7, 120, 0.5);
    SC.road(L, -2.6, 3.4, 1.2, 220, [46, 46, 52], 40, null);
    for (let z = 6; z < 130; z += 9) SC.floorQ(L, 0.28, z, 0.55, z + 3, 0.02, [150, 142, 90]);
    SC.groundDots(L, 9, 90, 3, 60, 80, [40, 38, 34], 0.3);
    const rng = mulberry32(21);
    for (let i = 0; i < 44; i++) { const side = rng() < 0.5 ? -1 : 1; const z = 8 + rng() * 120; const kind = rng() < 0.7 ? 'bare' : 'round'; const h = 6 + rng() * 8; const x = side * ((kind === 'round' ? 6 + h * 0.5 : 6) + rng() * 12) + 0.4; SC.tree(L, x, z, h, kind, (rng() * 1e6) | 0); }
    for (let i = 0; i < 16; i++) { const side = rng() < 0.5 ? -1 : 1; const z = -8 - rng() * 60; const x = side * (5 + rng() * 14); SC.tree(L, x, z, 6 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    for (let i = 0; i < 8; i++) { const z = -20 + i * 30; SC.sprite(L, -5.5, 0, z, 0.3, 8, (ctx, P) => { ctx.scale(0.3, 8); P_rect(ctx, -0.5, 0, 1, 1, P.col([30, 28, 26])); P_rect(ctx, -2.2, 0.88, 4.4, 0.03, P.col([30, 28, 26])); }); }
    // the car: you are in the driver's seat, the passenger side is to your right
    SC.floorQ(L, -0.45, -1.0, 1.25, 0.75, 0.35, floor);
    SC.quad(L, [-0.5, 0.95, 0.55], [1.3, 0.95, 0.55], [1.3, 1.02, 0.95], [-0.5, 1.02, 0.95], dash);
    SC.quad(L, [-0.5, 0.5, 0.55], [1.3, 0.5, 0.55], [1.3, 0.95, 0.55], [-0.5, 0.95, 0.55], dashD);
    SC.quad(L, [-0.28, 0.84, 0.54], [0.28, 0.84, 0.54], [0.28, 0.93, 0.54], [-0.28, 0.93, 0.54], [14, 24, 18], { noFog: true, noLight: true });
    for (const x of [-0.16, 0.0, 0.16]) SC.quad(L, [x - 0.035, 0.865, 0.535], [x + 0.035, 0.865, 0.535], [x + 0.035, 0.905, 0.535], [x - 0.035, 0.905, 0.535], [22, 52, 34], { noFog: true, noLight: true });
    SC.sprite(L, 0.18, 0.74, 0.5, 0.1, 0.1, (ctx, P) => { ctx.scale(0.1, 0.1); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([110, 110, 116])); P_ell(ctx, 0, 0.5, 0.3, 0.3, P.col([18, 18, 20])); P_rect(ctx, -0.05, 0.28, 0.1, 0.44, P.col([80, 80, 86])); });
    SC.quad(L, [-0.55, 1.02, 0.95], [1.35, 1.02, 0.95], [1.3, 0.92, 2.5], [-0.5, 0.92, 2.5], body);
    { // steering wheel + column
      const pts = []; const cy = 0.92, cz = 0.52, r = 0.17;
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; pts.push(L.pt(Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, cz - Math.sin(a) * r * 0.55)); }
      L.props.push({ kind: 'poly', pts, color: [22, 20, 22], stroke: true, lw: 0.024 });
      SC.quad(L, [-0.04, 0.8, 0.5], [0.04, 0.8, 0.5], [0.04, 0.9, 0.56], [-0.04, 0.9, 0.56], [22, 20, 22]);
    }
    // doors, pillars, header, roof
    for (const x of [-0.45, 1.25]) {
      SC.wallV(L, x, -0.55, x, 0.6, 0.35, 1.02, bodyD);
      SC.quad(L, [x, 1.0, 0.6], [x, 1.0, 0.68], [x, 1.52, 0.22], [x, 1.52, 0.14], bodyD);
      SC.wallV(L, x, -0.58, x, -0.5, 0.35, 1.55, bodyD);
      SC.wallV(L, x, -0.55, x, 0.6, 1.02, 1.06, [60, 40, 40]);
    }
    SC.quad(L, [-0.55, 1.45, 0.6], [1.35, 1.45, 0.6], [1.35, 1.55, 0.2], [-0.55, 1.55, 0.2], bodyD);
    SC.quad(L, [-0.55, 1.55, 0.2], [1.35, 1.55, 0.2], [1.35, 1.55, -1.1], [-0.55, 1.55, -1.1], [16, 11, 12]);
    SC.box(L, 0.55, 1.15, 0.35, 0.95, -0.25, 0.35, seat);
    SC.box(L, 0.55, 1.15, 0.95, 1.4, -0.25, -0.1, seat);
    SC.box(L, -0.45, 1.25, 0.35, 1.15, -1.0, -0.6, seat);
    SC.wallV(L, -0.47, -1.05, 1.27, -1.05, 1.15, 1.25, bodyD);
    STORY.lamp(L, 0.95, 0.95, 0.3, { scale: 0.7 });          // a bedside lamp on the passenger seat, of all things
    // items and the ignition
    const decoy = !!L.diff.decoys;
    const keySpots = [
      { x: 0.66, y: 0.36, z: 0.48, jitter: 0.06 },      // passenger footwell
      { x: -0.15, y: 0.36, z: 0.42, jitter: 0.06 },     // your own footwell
      { x: 0.36, y: 0.36, z: -0.12, jitter: 0.05 },     // between the seats
      { x: 0.4, y: 0.36, z: -0.5, jitter: 0.05 },       // behind the seats
      { x: 0.85, y: 0.95, z: 0.05, jitter: 0.04, key: 'seat' }, // on the passenger seat
    ];
    mkItem(L, 'keys', 'Car keys', keySpots, { w: 0.2, h: 0.2, flat: true });
    if (decoy) mkItem(L, 'housekeys', 'Keys', keySpots, { w: 0.2, h: 0.2, flat: true, icon: 'keys', decoy: true, decoyText: 'House keys. Not these.' });
    L.floorY = 0.36;
    mkItem(L, 'bottle', 'Empty bottle', [
      { x: 0.9, y: 0.36, z: -0.45, flat: false },       // rear floor
      { x: 0.95, y: 1.02, z: 0.78, flat: false },       // on the dash
      { x: 1.0, y: 0.95, z: -0.1, flat: false, key: 'seat' }, // on the passenger seat
    ], { w: 0.09, h: 0.24, icon: 'bottle' });
    Object.assign(s, { keyIn: false, cranks: 0, cranking: 0, started: false, cranksNeeded: 2 + Math.floor(L.rand() * 3), needChoke: L.diff.tier >= 2, choke: false, floods: L.diff.tier >= 3, lastCrank: -10 });
    const ign = mkTarget(L, {
      id: 'ignition', name: 'Ignition', x: 0.18, y: 0.78, z: 0.5, w: 0.16, h: 0.18, accepts: ['keys'].concat(decoy ? ['housekeys'] : []),
      hint() { return s.started ? 'Running.' : s.keyIn ? (s.needChoke && !s.choke ? 'Turn the key. It will want the choke.' : 'Turn the key.') : 'The ignition. No key in it.'; },
      use(item) { if (item.id !== 'keys') return false; s.keyIn = true; ign.accepts = []; AUDIO.sfx('keys'); G.toast(G.hints() ? 'The key is in. Turn it.' : 'The key is in.'); return true; },
      onClick() {
        if (!s.keyIn) return false;
        if (s.cranking > 0 || s.started) return true;
        if (s.floods && L.t - s.lastCrank < 3 && s.cranks > 0) { s.cranks = 0; s.cranking = 1.15; s.lastCrank = L.t; AUDIO.sfx('crank'); G.say('Too soon. It floods. Give it a moment.', 'It floods.'); return true; }
        s.lastCrank = L.t; s.cranking = 1.15;
        if (s.needChoke && !s.choke) { AUDIO.sfx('crank'); G.shake(0.1); G.say('It turns over and dies. It wants the choke.', 'It turns over and dies.'); return true; }
        s.cranks++;
        if (s.cranks >= s.cranksNeeded) { s.started = true; AUDIO.sfx('start'); G.shake(0.3); }
        else { AUDIO.sfx('crank'); G.shake(0.12); G.toast(s.cranks === 1 ? 'It turns over. It does not catch.' : 'Come on. Come on.'); }
        return true;
      },
    });
    if (s.needChoke) mkTarget(L, {
      id: 'choke', name: 'Choke', x: 0.62, y: 0.86, z: 0.52, w: 0.12, h: 0.12,
      hint() { return s.choke ? 'Pulled out.' : 'The choke. Pull it.'; },
      onClick() { if (s.choke) { G.say('Already out.', 'Out.'); return true; } s.choke = true; AUDIO.sfx('lever'); G.say('The choke is out.', 'Click.'); return true; },
    });
    L.update = dt => { if (s.cranking > 0) s.cranking -= dt; };
    L.isWon = () => s.started;
    L.objectiveText = () => s.started ? 'Drive.' : s.keyIn ? (s.needChoke && !s.choke ? 'Pull the choke. Turn the key.' : 'Turn the key.' + (s.floods ? ' Wait between tries.' : '')) : 'Find the keys. Start the car.';
    L.dynamic = () => {
      if (s.keyIn) R.add(iconSprite(L, 'keys', 0.19, 0.7, 0.49, 0.1, 0.16));
      if (s.needChoke) R.add(SC.mkSprite(L, 0.62, 0.8, 0.52, 0.12, 0.12, (ctx, P) => { ctx.scale(0.12, 0.12); P_rect(ctx, -0.3, 0.3, 0.6, 0.4, P.col([40, 38, 40])); P_ell(ctx, 0, s.choke ? 0.9 : 0.62, 0.32, 0.22, P.col([90, 88, 92])); }));
    };
    L.floor = { poly: [[-0.4, -0.9], [1.2, -0.9], [1.2, 0.7], [-0.4, 0.7]], y: 0.36 };
    L.onEnd = () => AUDIO.stopLoop();
  }
});
