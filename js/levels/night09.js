'use strict';
// ============================================================ 9. THE CROSSING ============================================================
// Two things. You are up in a signal box with glass all round. The signalman walks the line straight at the
// buffers under your window and obeys the signal; the crawler comes across the field to the stairs. A train is due.
LEVELS.push({
  id: 'crossing', title: 'The Crossing', facing: 0, eyeH: 2.65,
  pal: { skyTop: [10, 12, 20], fog: [150, 156, 166], ground: [178, 184, 192], fogDist: 85 },
  ambient: { wind: 0.9, drone: 0.5, droneFreq: 44, windFreq: 360 },
  weather: { kind: 'snow', density: 0.8, wind: 0.35 },
  lights: [{ x: 1.3, y: 2.1, z: -0.6, r: 5, i: 0.45, color: [255, 200, 130], flicker: 0.2 }, { x: -1.4, y: 1.7, z: -1.15, r: 3, i: 0.35, color: [255, 120, 50], flicker: 0.5 }],
  text: {
    intro: 'The box is warm and the line is empty both ways, except that it is not. Something is walking the sleepers toward you, in step, the way a man walks who has done it every night for forty years. He still stops for a red signal.<br>The last train is due inside the minute, and it will go down whichever line the points give it. Something else is coming across the snow to your door.',
    hint: 'Pull the signal lever to hold him at danger for a while. Set the points lever to the near line, his line, before the train gets there. Bar the door the other one is coming to.',
    objective: 'Let the train have him. Bar the door.',
    death: { default: 'The window glass did not slow him down.', crawler: 'It came up the stairs faster than you could bar them.', road: 'It came up the ladder from the road faster than you could bar the door.' },
    win: 'The train did not stop for him. Afterwards something scratched at the door until it got light, and you sat with your back to the levers and did not answer it.',
    fragment: 'Two tonight. You counted them, and got to three, and stopped counting.',
  },
  lanes: [
    { deg: 90, name: 'the line', barrierDist: 0, cue: 'horn', default: true, apertures: [{ z: 1.8, x0: -1.5, x1: 1.5, y0: 1.2, y1: 3.6 }] },
    { deg: 270, name: 'the stairs', elev: -42.5, ramp: true, barrierDist: 3.0, cue: 'creak' },
    { deg: 180, name: 'the road', elev: -47.7, ramp: true, barrierDist: 2.8, cue: 'bang' },
  ],
  creatures: [
    { type: 'signalman', lane: 0, startDist: 60, time: 42, gamma: 0.9, unseenMult: 1.15 },
    { type: 'crawler', lanes: [1, 2], startDist: 70, time: 58, gamma: 0.75, unseenMult: 1.2 },
  ],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, FL = 1.0;                     // the box floor is a metre up
    const snow = [200, 204, 210], rail = [70, 66, 62], sleeper = [58, 48, 40], ballast = [120, 116, 110], wood = [70, 56, 44], woodD = [48, 38, 30], iron = [40, 40, 44];
    SC.stars(L, 91, 60, 0.3);
    SC.clouds(L, 92, 6, [120, 126, 140], 0.3);
    // snow to the horizon, the line east, the far line curving off past the box, the road south, the field west
    SC.floorQ(L, -320, -320, 320, 320, 0, snow);
    const seg = (x0, x1, n, fn) => { for (let i = 0; i < n; i++) { const a = x0 + (x1 - x0) * Math.pow(i / n, 1.5), b = x0 + (x1 - x0) * Math.pow((i + 1) / n, 1.5); fn(a, b); } };
    seg(3.2, 300, 26, (a, b) => { SC.floorQ(L, a, -1.3, b, 1.3, 0.03, ballast); for (const z of [-0.72, 0.72]) SC.floorQ(L, a, z - 0.06, b, z + 0.06, 0.07, rail); });
    for (let x = 3.6; x < 60; x += 0.7) SC.floorQ(L, x - 0.12, -1.1, x + 0.12, 1.1, 0.05, sleeper);
    for (let x = 60; x < 140; x += 2.1) SC.floorQ(L, x - 0.15, -1.1, x + 0.15, 1.1, 0.05, sleeper);
    const curve = u => [14 - 26 * u, 9 * smoothstep(u)];
    for (let i = 0; i < 14; i++) { const p = curve(i / 14), q = curve((i + 1) / 14); for (const dz of [-0.72, 0.72]) SC.quad(L, [p[0], 0.07, p[1] + dz - 0.06], [q[0], 0.07, q[1] + dz - 0.06], [q[0], 0.07, q[1] + dz + 0.06], [p[0], 0.07, p[1] + dz + 0.06], rail, { layer: 0 }); SC.quad(L, [p[0], 0.03, p[1] - 1.3], [q[0], 0.03, q[1] - 1.3], [q[0], 0.03, q[1] + 1.3], [p[0], 0.03, p[1] + 1.3], ballast, { layer: 0 }); }
    seg(-12, -300, 16, (a, b) => { SC.floorQ(L, b, 7.7, a, 10.3, 0.03, ballast); for (const z of [8.28, 9.72]) SC.floorQ(L, b, z - 0.06, a, z + 0.06, 0.07, rail); });
    SC.box(L, 2.9, 3.4, 0, 1.1, -1.0, 1.0, iron); SC.sprite(L, 3.15, 1.1, 0, 0.25, 0.25, (ctx, P) => { ctx.scale(0.25, 0.25); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.raw([200, 40, 30])); }, { noFog: true, noLight: true });
    seg(-7, -220, 14, (a, b) => SC.floorQ(L, -2.2, b, 2.2, a, 0.02, [44, 44, 48]));
    for (let z = -12; z > -200; z -= 7) SC.floorQ(L, -0.08, z - 1.6, 0.08, z, 0.03, [150, 150, 120]);
    SC.fenceLine(L, -6.5, -3.5, -120, -3.5, 3, 1.1, [60, 56, 50]); SC.fenceLine(L, -6.5, 3.5, -120, 3.5, 3, 1.1, [60, 56, 50]);
    const rng = mulberry32(99);
    for (let i = 0; i < 26; i++) { const x = -20 - rng() * 130, z = (rng() < 0.5 ? -1 : 1) * (5 + rng() * 40); SC.tree(L, x, z, 6 + rng() * 7, 'bare', (rng() * 1e6) | 0); }
    for (let i = 0; i < 30; i++) { const x = 10 + rng() * 200, z = (rng() < 0.5 ? -1 : 1) * (12 + rng() * 50); SC.tree(L, x, z, 6 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    for (let i = 0; i < 16; i++) { const x = (rng() - 0.5) * 60, z = -30 - rng() * 120; if (Math.abs(x) < 4) continue; SC.tree(L, x, z, 6 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    SC.sprite(L, -95, 1.4, 22, 1.2, 0.9, (ctx, P) => { ctx.scale(1.2, 0.9); P_rect(ctx, -0.5, 0, 1, 1, P.raw([220, 180, 110])); }, { noFog: true, noLight: true });
    // the signal post beside the line, and the points
    SC.box(L, 6.9, 7.1, 0, 4.0, -1.75, -1.55, iron); SC.box(L, 6.7, 7.3, 4.0, 4.7, -1.9, -1.4, [50, 50, 54]);
    // the box on its legs: floor, panelled walls with two doors, glass all round, a roof
    for (const [x, z] of [[-1.65, -1.35], [1.65, -1.35], [-1.65, 1.35], [1.65, 1.35]]) SC.box(L, x - 0.15, x + 0.15, 0, FL, z - 0.15, z + 0.15, woodD);
    SC.box(L, -1.8, 1.8, FL - 0.15, FL + 0.02, -1.5, 1.5, wood);
    SC.floorQ(L, -1.8, -1.5, 1.8, 1.5, FL + 0.03, [92, 76, 58], { tex: 'planks', texScale: 1.1 });
    const ptex = { tex: 'planks', texScale: 1.2 };
    SC.wallV(L, -1.8, 1.5, 1.8, 1.5, FL, FL + 0.2, wood, ptex); SC.wallV(L, 1.8, -1.5, 1.8, 1.5, FL, FL + 0.2, wood, ptex);
    const apW = SC.doorway(L, { deg: 270, z: 1.8, w: 1.5, h: 2.0, y0: FL, wallH: FL + 0.2, left: -1.5, right: 1.5, color: wood, opts: ptex, frame: { color: woodD, w: 0.08 } });
    const apS = SC.doorway(L, { deg: 180, z: 1.5, w: 1.5, h: 2.0, y0: FL, wallH: FL + 0.2, left: -1.8, right: 1.8, color: wood, opts: ptex, frame: { color: woodD, w: 0.08 } });
    // the doorways' apertures in lane coordinates (each door is at the top of its ramp)
    L.addAperture(1, { z: 1.8 / Math.cos(42.5 * DEG), x0: -0.75, x1: 0.75, y0: FL, y1: FL + 2.0 });
    L.addAperture(2, { z: 1.5 / Math.cos(47.7 * DEG), x0: -0.75, x1: 0.75, y0: FL, y1: FL + 2.0 });
    void apW; void apS;
    for (const [x0, z0, x1, z1] of [[-1.8, 1.5, 1.8, 1.5], [1.8, 1.5, 1.8, -1.5], [1.8, -1.5, -1.8, -1.5], [-1.8, -1.5, -1.8, 1.5]]) {
      SC.wallV(L, x0, z0, x1, z1, FL + 0.2, FL + 2.6, [150, 175, 205], { alpha: 0.14 });
      const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.0);
      for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n; SC.box(L, x - 0.04, x + 0.04, FL + 0.2, FL + 2.6, z - 0.04, z + 0.04, woodD); }
      SC.wallV(L, x0, z0, x1, z1, FL + 2.6, FL + 2.75, woodD);
    }
    SC.quad(L, [-2.2, FL + 2.75, -1.9], [2.2, FL + 2.75, -1.9], [2.2, FL + 2.75, 1.9], [-2.2, FL + 2.75, 1.9], [36, 32, 30]);
    SC.quad(L, [-2.3, FL + 2.8, -2.0], [2.3, FL + 2.8, -2.0], [2.3, FL + 3.2, 0], [-2.3, FL + 3.2, 0], [70, 72, 78]);
    SC.quad(L, [-2.3, FL + 3.2, 0], [2.3, FL + 3.2, 0], [2.3, FL + 2.8, 2.0], [-2.3, FL + 2.8, 2.0], [70, 72, 78]);
    // three steps up the west side, a short ladder up the south
    for (let k = 0; k < 3; k++) { const x = -1.8 - 0.38 * k, y = FL - 0.33 * k; SC.box(L, x - 0.38, x, y - 0.33, y, -0.8, 0.8, woodD); }
    SC.quad(L, [-1.8, FL + 0.95, 0.55], [-2.95, 0.95, 0.55], [-2.95, 0.9, 0.55], [-1.8, FL + 0.9, 0.55], iron);
    for (const x of [-0.6, 0.6]) SC.quad(L, [x - 0.04, FL + 0.5, -1.55], [x + 0.04, FL + 0.5, -1.55], [x + 0.04, 0, -2.5], [x - 0.04, 0, -2.5], iron);
    for (let k = 0; k < 5; k++) { const u = k / 4, y = FL * (1 - u) + 0.15, z = -1.55 - 0.95 * u; SC.box(L, -0.62, 0.62, y - 0.03, y + 0.03, z - 0.03, z + 0.03, iron); }
    // inside: the lever frame to the north, the desk to the east with the lamp, the stove, a clock, the bell
    SC.box(L, -1.2, 1.2, FL + 0.05, FL + 0.5, 0.85, 1.15, iron);
    SC.box(L, 0.9, 1.7, FL + 0.05, FL + 0.75, -1.2, -0.1, [84, 68, 52]);
    STORY.lamp(L, 1.3, FL + 0.75, -0.65, { lit: true, scale: 0.9 });
    SC.box(L, -1.7, -1.1, FL + 0.05, FL + 0.7, -1.4, -0.9, [40, 38, 40]); SC.box(L, -1.45, -1.35, FL + 0.7, FL + 2.5, -1.2, -1.1, [30, 28, 30]);
    SC.wallV(L, -1.55, -1.39, -1.25, -1.39, FL + 0.2, FL + 0.45, [255, 110, 40], { noFog: true, noLight: true });
    SC.sprite(L, 1.55, FL + 1.7, 1.42, 0.36, 0.36, (ctx, P) => { ctx.scale(0.36, 0.36); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([40, 40, 44])); P_ell(ctx, 0, 0.5, 0.44, 0.44, P.col([230, 226, 216])); P_line(ctx, 0, 0.5, 0, 0.82, 0.03, P.col([30, 30, 30])); P_line(ctx, 0, 0.5, 0.22, 0.38, 0.03, P.col([30, 30, 30])); });
    SC.sprite(L, -1.35, FL + 0.5, 0.98, 0.2, 0.24, (ctx, P) => { ctx.scale(0.2, 0.24); P_ell(ctx, 0, 0.62, 0.42, 0.38, P.col([170, 140, 70])); P_rect(ctx, -0.05, 0.95, 0.1, 0.05, P.col([90, 80, 60])); });
    // items
    const decoy = !!L.diff.decoys, locked = L.diff.tier >= 2, needOil = L.diff.tier >= 3;
    mkItem(L, 'beam', 'Bar', [
      { x: 1.4, y: FL + 0.03, z: 0.9 },                 // by the frame, east end
      { x: -1.4, y: FL + 0.03, z: -0.5 },               // by the stove
      { x: 0.4, y: FL + 0.03, z: -1.25 },               // by the road door
      { x: -1.3, y: FL + 0.03, z: 1.1 },                // by the frame, west end
    ], { w: 1.4, h: 0.45, flat: true, uses: L.tier(1, 1, 2) });
    if (locked) mkContainer(L, {
      id: 'tin', name: 'Tobacco tin', w: 0.3, h: 0.16, color: [140, 60, 40],
      spot: [{ x: 1.3, y: FL + 0.75, z: -1.0 }, { x: -0.9, y: FL + 0.5, z: 1.0 }, { x: 1.5, y: FL + 0.03, z: 0.5 }, { x: -1.5, y: FL + 0.7, z: -1.15 }],
      closedText: 'A tobacco tin.', emptyText: 'Tobacco.', sfx: 'clunk',
      yields: [{ id: 'framekey', name: 'Small key', opts: { w: 0.15, h: 0.15, flat: false, icon: 'keys', tool: true } }],
    });
    if (needOil) mkItem(L, 'oilcan', 'Oil can', [{ x: 1.6, y: FL + 0.03, z: 0.4 }, { x: -1.6, y: FL + 0.03, z: -0.1 }, { x: 1.2, y: FL + 0.75, z: -0.3 }], { w: 0.28, h: 0.36 });
    if (decoy) mkItem(L, 'watercan', 'Oil can', [{ x: 0.5, y: FL + 0.03, z: 0.3 }, { x: -1.6, y: FL + 0.03, z: 0.9 }], { w: 0.28, h: 0.36, icon: 'oilcan', decoy: true, decoyText: 'Water. The wick just hisses.' });
    Object.assign(s, { points: 'far', red: 0, stiff: 0, holdFor: L.tier(8, 7, 8), lampLit: !needOil, frameLocked: locked, barred: {}, trainAt: L.tier(45, 40, 36) + (L.rand() - 0.5) * 8, train: null, taken: false, belled: false });
    const smc = () => L.creatures[0], crc = () => L.creatures[1];   // the creatures are made after build
    const frameOk = () => { if (s.frameLocked) { G.say('The frame is padlocked.', 'Locked.'); AUDIO.sfx('nope'); return false; } return true; };
    if (locked) mkTarget(L, {
      id: 'frame', name: 'Lever frame padlock', x: 0, y: FL + 0.42, z: 0.88, w: 0.22, h: 0.26, accepts: ['framekey'],
      hint() { return s.frameLocked ? 'A padlock through the frame. The levers will not move.' : 'Unlocked.'; },
      use(item) { s.frameLocked = false; AUDIO.sfx('lock'); G.say('The padlock comes off. The levers are free.', 'Free.'); return true; },
    });
    const points = mkTarget(L, {
      id: 'points', name: 'Points lever', x: -0.55, y: FL + 0.45, z: 0.95, w: 0.3, h: 0.75,
      hint() { return 'The points. Set to the ' + (s.points === 'near' ? 'near line, straight at the buffers.' : 'far line, round past the box.'); },
      onClick() { if (!frameOk()) return true; if (s.train && s.train.r > 270) { G.say('Too late. It is over the points.', 'Too late.'); AUDIO.sfx('nope'); return true; } s.points = s.points === 'near' ? 'far' : 'near'; AUDIO.sfx('lever'); G.shake(0.1); G.say(s.points === 'near' ? 'Points to the near line: his line, straight at the buffers.' : 'Points to the far line, round past the box.', s.points === 'near' ? 'Points to the near line.' : 'Points to the far line.'); return true; },
    });
    const signal = mkTarget(L, {
      id: 'signal', name: 'Signal lever', x: 0.55, y: FL + 0.45, z: 0.95, w: 0.3, h: 0.75,
      hint() { return !s.lampLit ? 'The signal. Its lamp is dark; it will show nothing.' : s.red > 0 ? 'At danger. He stands.' : s.stiff > 0 ? 'It will not go over again yet.' : 'The signal. Pull it and he stops, for a while.'; },
      onClick() {
        if (!frameOk()) return true;
        if (!s.lampLit) { G.say('The lamp is dark. The signal shows nothing.', 'Nothing happens.'); AUDIO.sfx('lever'); return true; }
        if (s.red > 0) { G.say('Already at danger.', 'Already.'); return true; }
        if (s.stiff > 0) { G.say('It will not go over again yet.', 'Stiff.'); AUDIO.sfx('nope'); return true; }
        s.red = s.holdFor; AUDIO.sfx('lever'); G.shake(0.1); G.say('The signal drops to danger. He stops.'); return true;
      },
    });
    if (needOil) mkTarget(L, {
      id: 'lamp', name: 'Signal lamp', x: 1.05, y: FL + 0.45, z: 0.95, w: 0.24, h: 0.34, accepts: ['oilcan'].concat(decoy ? ['watercan'] : []),
      hint() { return s.lampLit ? 'Burning.' : 'The signal lamp. Dry.'; },
      use(item) { if (item.id !== 'oilcan') return false; s.lampLit = true; AUDIO.sfx('strike'); G.say('The lamp takes. The signal will show now.', 'Lit.'); return true; },
    });
    const mkDoor = (id, name, laneIdx, deg) => mkTarget(L, {
      id, name, deg, dist: laneIdx === 1 ? 1.75 : 1.45, y: FL, w: 1.6, h: 2.0, accepts: ['beam'],
      hint() { return s.barred[laneIdx] ? 'Barred.' : 'Shut, but not barred.'; },
      use() { if (s.barred[laneIdx]) return false; s.barred[laneIdx] = true; AUDIO.sfx('bar'); G.say('The bar is across.', 'Barred.'); return true; },
    });
    mkDoor('stairdoor', 'Stair door', 1, 270); mkDoor('roaddoor', 'Road door', 2, 180);
    // the train: a route distance r along the line from 300 m out; it takes whichever line the points give it
    const route = r => {
      if (r <= 286) return [300 - r, 0, -1];                                              // on the near line, heading -x
      if (s.trainLine === 'near') { const x = Math.max(3.6, 14 - (r - 286)); return [x, 0, -1]; }
      const u = (r - 286) / 28;
      if (u <= 1) { const p = curve(u), q = curve(Math.min(1, u + 0.02)); const dx = q[0] - p[0], dz = q[1] - p[1], n = Math.hypot(dx, dz) || 1; return [p[0], p[1], dx / n, dz / n]; }
      return [-12 - (r - 314), 9, -1];
    };
    L.update = dt => {
      if (s.red > 0) { s.red -= dt; if (s.red <= 0) { s.red = 0; s.stiff = L.tier(5, 5, 3); AUDIO.sfx('clunk'); G.say('The signal lever springs back. He walks on.'); } }
      if (s.stiff > 0) s.stiff -= dt;
      const sm = smc();
      sm.held = s.red > 0;
      // the train appears far down the line and arrives on time, more or less
      const t0 = s.trainAt - 300 / 14;
      if (!s.train && L.t >= t0) { s.train = { r: 0, v: 14 }; s.trainLine = null; AUDIO.sfx('horn', 0.6); G.toast('A light, far down the line. The train.'); }
      const tr = s.train;
      if (tr) {
        if (tr.r >= 286 && !s.trainLine) { s.trainLine = s.points; G.toast(s.trainLine === 'far' ? 'It takes the far line, round past the box.' : 'It takes the near line.'); }
        if (s.trainLine === 'near') { const x = 14 - (tr.r - 286); if (x < 18) tr.v = Math.max(0, tr.v - dt * 4.5); }
        tr.r += tr.v * dt;
        const front = route(tr.r), dist = Math.hypot(front[0], front[1]);
        if (!s.taken && s.trainLine === 'near' && front[0] <= sm.dist + 0.5 && sm.dist > 3.0 && !sm.taken) { sm.taken = true; sm.dead = true; s.taken = true; AUDIO.sfx('thud'); AUDIO.sfx('brakes'); G.shake(0.6); G.toast('The train does not stop for him.'); }
        if (dist < 40 && !s.belled) { s.belled = true; AUDIO.sfx('bell'); }
        if (tr.v > 0.1) { AUDIO.setLoop('engine', clamp(0.05 + 4 / (dist + 3), 0, 0.5), Math.sin(wrapPi(Math.atan2(front[0], front[1]) - G.cam.yaw)) * 0.8); G.shake(clamp(0.06 - dist * 0.001, 0, 0.06) * (dist < 30 ? 1 : 0)); }
        else AUDIO.setLoop('engine', 0.05, 0);
      }
    };
    // a barred door holds the crawler at the threshold, scratching; an unbarred one lets it in
    L.onReach = c => {
      if (c.type !== 'crawler') return;
      if (s.barred[c.lane.idx]) { c.hold = c.lane.barrierDist; if (!s.scratching) { s.scratching = Seq.play({ dur: 600, beats: [{ every: 1.3, do: () => { if (G.state === 'play') AUDIO.sfx('scrape', Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); } }] }); G.toast('It is at the door.'); } }
    };
    L.isWon = () => s.taken && !!s.barred[crc().lane.idx];
    L.deathCause = c => c.type === 'crawler' ? (c.lane.idx === 2 ? 'road' : 'crawler') : null;
    L.objectiveText = () => (s.taken ? 'The train had him. ' : (s.lampLit ? '' : 'Oil the signal lamp. ') + 'Hold him with the signal. Set the points to the near line' + (s.points === 'near' ? ' (set). ' : '. ')) + (s.barred[crc().lane.idx] ? 'Door barred.' : 'Bar the ' + (crc().lane.idx === 1 ? 'stair' : 'road') + ' door.');
    L.dynamic = () => {
      // levers, the padlock, the signal lamp and the bell inside; the signal and the points outside
      for (const [t, on] of [[points, s.points === 'near'], [signal, s.red > 0]]) R.add(SC.mkSprite(L, t.local[0], FL + 0.45, 0.95, 0.3, 0.75, (ctx, P) => { ctx.scale(0.3, 0.75); ctx.save(); ctx.translate(0, 0.05); ctx.rotate(on ? 0.55 : -0.35); P_line(ctx, 0, 0, 0, 0.95, 0.18, P.col([120, 122, 130])); P_ell(ctx, 0, 0.95, 0.16, 0.06, P.col(t === points ? [40, 40, 160] : [160, 40, 40])); ctx.restore(); }));
      if (locked && s.frameLocked) R.add(iconSprite(L, 'padlock', 0, FL + 0.42, 0.88, 0.22, 0.26));
      if (needOil) R.add(SC.mkSprite(L, 1.05, FL + 0.45, 0.95, 0.24, 0.34, (ctx, P) => { P.lit = s.lampLit; ctx.scale(0.24, 0.34); ICONS.lantern(ctx, P); }));
      R.add(SC.mkSprite(L, 7, 4.05, -1.65, 0.5, 0.5, (ctx, P) => { ctx.scale(0.5, 0.5); P_ell(ctx, 0, 0.5, 0.42, 0.42, s.lampLit ? P.raw(s.red > 0 ? [230, 40, 30] : [40, 200, 80]) : P.col([30, 30, 34])); }, { noFog: true, noLight: true }));
      const pa = s.points === 'near' ? 0 : 0.12;
      for (const dz of [-0.72, 0.72]) R.add(SC.mkQuad(L, [14, 0.08, dz - 0.05], [18, 0.08, dz - 0.05 + (dz > 0 ? pa : 0) * 4], [18, 0.08, dz + 0.05 + (dz > 0 ? pa : 0) * 4], [14, 0.08, dz + 0.05], [90, 86, 80]));
      // the train: a locomotive and three wagons following the route
      const tr = s.train;
      if (tr && route(tr.r)[0] > -300) {
        const car = (rFront, len, h, col) => {
          const f = route(rFront), b = route(rFront + len);
          if (b[0] > 320) return;
          const dirx = f[2], dirz = f[3] === undefined ? 0 : f[3];
          const rx = -dirz * 1.5, rz = dirx * 1.5;
          R.add(SC.mkQuad(L, [f[0] + rx, 0.35, f[1] + rz], [b[0] + rx, 0.35, b[1] + rz], [b[0] + rx, h, b[1] + rz], [f[0] + rx, h, f[1] + rz], col, { dist: Math.hypot((f[0] + b[0]) / 2, (f[1] + b[1]) / 2) }));
          R.add(SC.mkQuad(L, [f[0] - rx, 0.35, f[1] - rz], [b[0] - rx, 0.35, b[1] - rz], [b[0] - rx, h, b[1] - rz], [f[0] - rx, h, f[1] - rz], scalec(col, 0.8), { dist: Math.hypot((f[0] + b[0]) / 2, (f[1] + b[1]) / 2) }));
          R.add(SC.mkQuad(L, [f[0] + rx, h, f[1] + rz], [b[0] + rx, h, b[1] + rz], [b[0] - rx, h, b[1] - rz], [f[0] - rx, h, f[1] - rz], scalec(col, 1.1), { dist: Math.hypot((f[0] + b[0]) / 2, (f[1] + b[1]) / 2) }));
          R.add(SC.mkQuad(L, [f[0] + rx, 0.35, f[1] + rz], [f[0] - rx, 0.35, f[1] - rz], [f[0] - rx, h, f[1] - rz], [f[0] + rx, h, f[1] + rz], scalec(col, 0.7), { dist: Math.hypot(f[0], f[1]) - 0.2 }));
        };
        car(tr.r, 12, 4.0, [40, 38, 44]); car(tr.r - 13, 10, 3.4, [60, 44, 36]); car(tr.r - 24, 10, 3.4, [60, 44, 36]); car(tr.r - 35, 10, 3.4, [56, 40, 34]);
        const f = route(tr.r);
        R.add(SC.mkSprite(L, f[0] - f[2] * 0.2, 2.6, f[1] - (f[3] || 0) * 0.2, 0.7, 0.7, (ctx, P) => { ctx.scale(0.7, 0.7); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.raw([255, 240, 200])); }, { noFog: true, noLight: true, dist: Math.hypot(f[0], f[1]) - 0.4 }));
      }
    };
    L.dynamicLights = () => {
      const out = [];
      const tr = s.train;
      if (tr) { const f = route(tr.r); const p = L.pt(f[0], 2.6, f[1]); const d = rotY(f[2], f[3] || 0, L.facing); out.push({ x: p[0], y: p[1], z: p[2], r: 50, i: 0.9, color: [255, 240, 200], cone: { x: d[0], y: -0.05, z: d[1], cos: Math.cos(12 * DEG) } }); }
      const sm = smc(); const sp = sm.pos(); out.push({ x: sp.x + Math.sin(sm.yaw + Math.PI / 2) * 0.5, y: 0.7, z: sp.z, r: 4, i: 0.6, color: [255, 190, 110], flicker: 0.3, seed: 5 });
      if (s.lampLit) { const p = L.pt(7, 4.25, -1.65); out.push({ x: p[0], y: p[1], z: p[2], r: 6, i: 0.5, color: s.red > 0 ? [255, 60, 40] : [60, 255, 120] }); }
      return out;
    };
    L.glows = () => { const sm = smc(), sp = sm.pos(); const out = [{ x: sp.x, y: 0.75, z: sp.z, r: 0.9, color: [255, 190, 110], a: 0.25 }]; if (s.train) { const f = route(s.train.r), p = L.pt(f[0], 2.6, f[1]); out.push({ x: p[0], y: p[1], z: p[2], r: 3.5, color: [255, 240, 200], a: 0.3 }); } return out; };
    L.aftermath = (t, dt) => {
      // the scratching only plays if the crawler actually got to a door; on Easy it can still be out in the snow
      if (!s.after) { s.after = true; const near = crc().reached; Seq.play({ dur: 6, beats: near ? [{ every: 1.15, from: 0.6, do: () => AUDIO.sfx('scrape', Math.sin(wrapPi(crc().yaw - G.cam.yaw)) * 0.85) }, { at: 3.5, toast: 'Something is at the door. It stays there.' }] : [] }); }
      return t >= 6;
    };
    L.onEnd = () => AUDIO.stopLoop();
    L.floor = { poly: [[-1.7, -1.4], [1.7, -1.4], [1.7, 1.4], [-1.7, 1.4]], y: FL + 0.03 };
  }
});
