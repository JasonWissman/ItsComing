'use strict';
// ---------- level content. Everything is defined in a local frame where the creature comes from +z; ----------
// ---------- `facing` rotates the whole level so the compass shows a different world direction.   ----------

// pos is one spot, or a list of candidate spots; one is chosen at random each time the level loads.
// A spot is {x,y,z} or {deg,dist,y} in the local frame, plus optional flat, jitter and setup(L, spot) for props that belong with it.
function spotKey(s) { return s.key || (s.deg !== undefined ? 'p' + s.deg + ':' + s.dist : 'c' + s.x.toFixed(1) + ':' + s.z.toFixed(1)); }
function spotLocal(s) { return s.x !== undefined ? [s.x, s.z] : [Math.sin(s.deg * DEG) * s.dist, Math.cos(s.deg * DEG) * s.dist]; }
function pickSpot(L, spots) {
  const clear = s => { const p = spotLocal(s); return L.placed.every(q => Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.8); };
  let pool = spots.filter(s => !L.usedSpots.has(spotKey(s)) && clear(s));
  if (!pool.length) pool = spots.filter(s => !L.usedSpots.has(spotKey(s)));
  if (!pool.length) pool = spots;
  const s = pool[Math.floor(L.rand() * pool.length)];
  L.usedSpots.add(spotKey(s));
  L.placed.push(spotLocal(s));
  return s;
}
function mkItem(L, id, name, pos, o) {
  const spot = Array.isArray(pos) ? pickSpot(L, pos) : pos;
  const it = Object.assign({ id, name, w: 0.4, h: 0.4, flat: false, uses: 1, tool: false, taken: false, icon: id }, o || {});
  if (spot.flat !== undefined) it.flat = spot.flat;
  let lx, ly, lz;
  if (spot.x !== undefined) { lx = spot.x; ly = spot.y; lz = spot.z; }
  else { lx = Math.sin(spot.deg * DEG) * spot.dist; ly = spot.y; lz = Math.cos(spot.deg * DEG) * spot.dist; }
  const jit = spot.jitter !== undefined ? spot.jitter : (it.flat ? 0.12 : 0);
  if (jit) { lx += (L.rand() - 0.5) * 2 * jit; lz += (L.rand() - 0.5) * 2 * jit; }
  const p = L.pt(lx, ly, lz);
  it.x = p[0]; it.y = p[1]; it.z = p[2];
  if (typeof it.icon === 'string') it.icon = ICONS[it.icon];
  if (spot.setup) spot.setup(L, spot);
  L.items.push(it);
  return it;
}
function mkTarget(L, o) {
  const p = o.x !== undefined ? L.pt(o.x, o.y, o.z) : L.at(o.deg, o.dist, o.y);
  const t = Object.assign({ w: 1, h: 1, flat: false, accepts: [], requires: [], needed: 1, count: 0, done: false }, o, { x: p[0], y: p[1], z: p[2] });
  L.targets.push(t);
  return t;
}
function iconSprite(L, id, x, y, z, w, h, opts) {
  return SC.mkSprite(L, x, y, z, w, h, (ctx, P) => { ctx.scale(w, h); ICONS[id](ctx, P); }, opts);
}

const LEVELS = [
  // ============================================================ 1. THE FIELD ============================================================
  {
    id: 'field', title: 'The Field', facing: 0, eyeH: 1.65,
    pal: { skyTop: [6, 8, 18], fog: [46, 52, 68], ground: [36, 46, 32], fogDist: 105 },
    ambient: { wind: 1, drone: 0.8, droneFreq: 50, windFreq: 380 },
    intro: 'You woke up at the back door, and it was open.<br>Something is walking across the field toward the house. It has been walking for a while.',
    hint: 'There are planks somewhere in the house, and a hammer.',
    objective: 'Board up the back door.',
    creature: { type: 'walker', startDist: 130, time: 80, gamma: 0.72, unseenMult: 1.35 },
    build(L) {
      const wood = [50, 40, 33], woodD = [38, 30, 25], frame = [96, 76, 52], floor = [46, 37, 30];
      SC.stars(L, 3, 170, 0.8);
      SC.moon(L, 24, 13, 8, [228, 222, 200]);
      const rng = mulberry32(11);
      for (let i = 0; i < 32; i++) { const x = (rng() * 2 - 1) * 120, z = 60 + rng() * 70; SC.tree(L, x, z, 7 + rng() * 7, 'bare', (rng() * 1e6) | 0); }
      for (let i = 0; i < 7; i++) { const x = (rng() * 2 - 1) * 60, z = 24 + rng() * 26; if (Math.abs(x) > 6) SC.tree(L, x, z, 5 + rng() * 5, rng() < 0.5 ? 'bare' : 'round', (rng() * 1e6) | 0); }
      SC.fenceLine(L, -45, 17, 45, 17, 2.7, 1.15, [44, 40, 34]);
      SC.groundDots(L, 5, 220, 6, 60, 110, [28, 36, 24], 0.22);
      // the house you are standing in: the back door looks out over the field
      SC.floorQ(L, -2.8, -2.4, 2.8, 2.6, 0.006, floor);
      SC.quad(L, [-2.8, 2.7, -2.4], [2.8, 2.7, -2.4], [2.8, 2.7, 2.6], [-2.8, 2.7, 2.6], [30, 24, 20]);
      SC.wallV(L, -7, 2.6, -0.8, 2.6, 0, 2.7, wood);
      SC.wallV(L, 0.8, 2.6, 7, 2.6, 0, 2.7, wood);
      SC.wallV(L, -0.8, 2.6, 0.8, 2.6, 2.12, 2.7, wood);
      SC.wallV(L, -2.8, -2.4, -2.8, 2.6, 0, 2.7, woodD);
      SC.wallV(L, 2.8, -2.4, 2.8, 2.6, 0, 2.7, woodD);
      SC.wallV(L, -2.8, -2.4, 2.8, -2.4, 0, 2.7, woodD);
      for (let y = 0.28; y < 2.7; y += 0.3) { SC.wallV(L, -7, 2.59, -0.8, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, 0.8, 2.59, 7, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, -2.79, -2.4, -2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, 2.79, -2.4, 2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, -2.8, -2.39, 2.8, -2.39, y, y + 0.03, [26, 21, 17]); }
      // a window in the back wall with a little moonlight in it
      SC.wallV(L, -0.7, -2.39, 0.7, -2.39, 1.1, 2.0, [36, 42, 60]);
      SC.wallV(L, -0.04, -2.38, 0.04, -2.38, 1.1, 2.0, woodD); SC.wallV(L, -0.7, -2.38, 0.7, -2.38, 1.52, 1.58, woodD);
      // door frame and the step outside
      SC.wallV(L, -0.92, 2.55, -0.8, 2.55, 0, 2.2, frame); SC.wallV(L, 0.8, 2.55, 0.92, 2.55, 0, 2.2, frame); SC.wallV(L, -0.92, 2.55, 0.92, 2.55, 2.1, 2.22, frame);
      SC.box(L, -1.1, 1.1, 0, 0.16, 2.6, 3.3, [74, 70, 64]);
      // furniture: table east, shelf west, chair south
      SC.box(L, 1.5, 2.6, 0.72, 0.78, -0.55, 0.45, [74, 56, 42]);
      for (const [x, z] of [[1.55, -0.5], [2.55, -0.5], [1.55, 0.4], [2.55, 0.4]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.72, z - 0.04, z + 0.04, [62, 46, 34]);
      SC.box(L, -2.78, -2.45, 1.22, 1.28, -0.2, 1.3, [66, 52, 40]);
      SC.box(L, -0.8, -0.3, 0.42, 0.48, -2.1, -1.6, [68, 52, 40]); SC.box(L, -0.8, -0.3, 0.48, 1.0, -2.1, -2.04, [68, 52, 40]);
      SC.box(L, 1.7, 2.0, 0.78, 1.0, -0.2, 0.1, [40, 34, 30]);   // a lamp base on the table, unlit
      // items
      mkItem(L, 'hammer', 'Hammer', [
        { x: 1.25, y: 0, z: 0.35 },                       // on the floor by the table
        { x: -2.2, y: 0, z: 0.7 },                        // under the shelf
        { x: -0.1, y: 0, z: -1.75 },                      // beside the chair
        { x: 1.9, y: 0, z: 1.85 },                        // in the corner by the door
        { x: -2.55, y: 1.28, z: -0.05, flat: false },     // on the shelf
      ], { w: 0.42, h: 0.42, flat: true, tool: true });
      mkItem(L, 'planks', 'Planks', [
        { deg: 225, dist: 1.75, y: 0 },                   // south-west corner
        { x: -1.5, y: 0, z: 1.6 },                        // north-west, by the front wall
        { x: 1.4, y: 0, z: -1.7 },                        // south-east
        { x: 0.7, y: 0, z: -1.9 },                        // along the back wall
      ], { w: 1.0, h: 0.7, flat: true, uses: 3 });
      mkItem(L, 'bottle', 'Empty bottle', [
        { x: -2.55, y: 1.28, z: 1.0 },                     // on the shelf
        { x: 2.05, y: 0.78, z: 0.05 },                    // on the table
        { x: 0.45, y: 1.1, z: -2.3 },                     // on the windowsill
      ], { w: 0.13, h: 0.36 });
      // the doorway
      const door = mkTarget(L, {
        id: 'door', name: 'Back door', deg: 0, dist: 2.45, y: 0, w: 1.75, h: 2.1, accepts: ['planks'], requires: ['hammer'], needed: 3,
        hint() { return door.done ? 'Boarded up.' : 'The back door. ' + (3 - door.count) + ' more plank' + (3 - door.count > 1 ? 's' : '') + ' would do it.'; },
        use() { door.count++; AUDIO.sfx('hammer'); G.shake(0.15); if (door.count >= 3) door.done = true; return true; }
      });
      L.objectiveText = () => door.done ? 'Boarded up. Hold on.' : 'Board up the back door (' + door.count + '/3)';
      L.isWon = () => door.done;
      L.barrierDist = 2.75;
      L.dynamic = () => {
        for (let k = 0; k < door.count; k++) {
          const yc = 0.5 + k * 0.62, tl = (k % 2 ? 1 : -1) * 0.06;
          R.add(SC.mkQuad(L, [-0.98, yc - 0.08 + tl, 2.42], [0.98, yc - 0.08 - tl, 2.42], [0.98, yc + 0.08 - tl, 2.42], [-0.98, yc + 0.08 + tl, 2.42], [112, 86, 54]));
          for (const x of [-0.86, 0.86]) R.add(SC.mkQuad(L, [x - 0.015, yc - 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [x + 0.015, yc - 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [x + 0.015, yc + 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [x - 0.015, yc + 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [30, 28, 26]));
        }
      };
      L.onReach = () => { if (door.count > 0) { door.count = 0; AUDIO.sfx('smash'); G.shake(0.8); G.toast('It tore the boards off.'); } };
      L.aftermath = (t, dt) => { if (Math.floor(t / 0.75) !== Math.floor((t - dt) / 0.75)) { AUDIO.sfx('bang'); G.shake(0.5); } return t > 3.8; };
      L.aftermathText = 'It hit the boards until sunrise. They held.';
    }
  },

  // ============================================================ 2. THE ROAD ============================================================
  {
    id: 'road', title: 'The Road', facing: 0, eyeH: 1.15,
    pal: { skyTop: [3, 3, 7], fog: [15, 15, 20], ground: [20, 19, 16], fogDist: 70 },
    ambient: { wind: 0.45, drone: 1, droneFreq: 41, windFreq: 220 },
    intro: 'The engine died on the county road, miles from anything.<br>Something is coming up the middle of the road, low, in the headlights.',
    hint: 'The keys fell somewhere when the car stalled. The engine has been flooding all night.',
    objective: 'Start the car.',
    creature: { type: 'crawler', startDist: 85, time: 48, gamma: 0.75, unseenMult: 1.35 },
    build(L) {
      const body = [44, 22, 24], bodyD = [24, 13, 15], dash = [26, 24, 26], dashD = [16, 15, 17], seat = [46, 40, 38], floor = [15, 14, 14];
      SC.stars(L, 7, 120, 0.5);
      const head = z => clamp(1 - (z - 4) / 44, 0, 1) * 0.8;
      SC.road(L, -2.6, 3.4, 1.2, 220, [46, 46, 52], 28, head);
      for (let z = 6; z < 130; z += 9) SC.floorQ(L, 0.28, z, 0.55, z + 3, 0.02, mixc([80, 74, 44], [210, 200, 130], head(z)));
      SC.groundDots(L, 9, 90, 3, 60, 80, [40, 38, 34], 0.3);
      const rng = mulberry32(21);
      for (let i = 0; i < 44; i++) { const side = rng() < 0.5 ? -1 : 1; const z = 8 + rng() * 120; const kind = rng() < 0.7 ? 'bare' : 'round'; const h = 6 + rng() * 8; const x = side * ((kind === 'round' ? 6 + h * 0.5 : 6) + rng() * 12) + 0.4; SC.tree(L, x, z, h, kind, (rng() * 1e6) | 0); }
      for (let i = 0; i < 16; i++) { const side = rng() < 0.5 ? -1 : 1; const z = -8 - rng() * 60; const x = side * (5 + rng() * 14); SC.tree(L, x, z, 6 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
      for (let i = 0; i < 8; i++) { const z = -20 + i * 30; SC.sprite(L, -5.5, 0, z, 0.3, 8, (ctx, P) => { ctx.scale(0.3, 8); P_rect(ctx, -0.5, 0, 1, 1, P.col([30, 28, 26])); P_rect(ctx, -2.2, 0.88, 4.4, 0.03, P.col([30, 28, 26])); }); }
      // the car: you are in the driver's seat, the passenger side is to your right
      SC.floorQ(L, -0.45, -1.0, 1.25, 0.75, 0.35, floor);
      SC.quad(L, [-0.5, 0.95, 0.55], [1.3, 0.95, 0.55], [1.3, 1.02, 0.95], [-0.5, 1.02, 0.95], dash);
      SC.quad(L, [-0.5, 0.5, 0.55], [1.3, 0.5, 0.55], [1.3, 0.95, 0.55], [-0.5, 0.95, 0.55], dashD);
      SC.quad(L, [-0.28, 0.84, 0.54], [0.28, 0.84, 0.54], [0.28, 0.93, 0.54], [-0.28, 0.93, 0.54], [14, 24, 18], { noFog: true });
      for (const x of [-0.16, 0.0, 0.16]) SC.quad(L, [x - 0.035, 0.865, 0.535], [x + 0.035, 0.865, 0.535], [x + 0.035, 0.905, 0.535], [x - 0.035, 0.905, 0.535], [22, 52, 34], { noFog: true });
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
      // items and the ignition
      mkItem(L, 'keys', 'Car keys', [
        { x: 0.66, y: 0.36, z: 0.48, jitter: 0.06 },      // passenger footwell
        { x: -0.15, y: 0.36, z: 0.42, jitter: 0.06 },     // your own footwell
        { x: 0.36, y: 0.36, z: -0.12, jitter: 0.05 },     // between the seats
        { x: 0.4, y: 0.36, z: -0.5, jitter: 0.05 },       // behind the seats
        { x: 0.85, y: 0.95, z: 0.05, jitter: 0.04, key: 'seat' }, // on the passenger seat
      ], { w: 0.2, h: 0.2, flat: true });
      L.floorY = 0.36;
      mkItem(L, 'bottle', 'Empty bottle', [
        { x: 0.9, y: 0.36, z: -0.45, flat: false },       // rear floor
        { x: 0.95, y: 1.02, z: 0.78, flat: false },       // on the dash
        { x: 1.0, y: 0.95, z: -0.1, flat: false, key: 'seat' }, // on the passenger seat
      ], { w: 0.09, h: 0.24, icon: 'bottle' });
      const ign = mkTarget(L, {
        id: 'ignition', name: 'Ignition', x: 0.18, y: 0.78, z: 0.5, w: 0.16, h: 0.18, accepts: ['keys'],
        hint() { return L.flags.started ? 'Running.' : L.flags.keyIn ? 'Turn the key.' : 'The ignition. No key in it.'; },
        use() { L.flags.keyIn = true; ign.accepts = []; AUDIO.sfx('keys'); G.toast(G.hints() ? 'The key is in. Turn it.' : 'The key is in.'); return true; },
        onClick() {
          if (!L.flags.keyIn) return false;
          if (L.flags.cranking > 0 || L.flags.started) return true;
          L.flags.cranks++; L.flags.cranking = 1.15;
          if (L.flags.cranks >= L.flags.cranksNeeded) { L.flags.started = true; AUDIO.sfx('start'); G.shake(0.3); }
          else { AUDIO.sfx('crank'); G.shake(0.12); G.toast(L.flags.cranks === 1 ? 'It turns over. It does not catch.' : 'Come on. Come on.'); }
          return true;
        }
      });
      L.flags = { keyIn: false, cranks: 0, cranking: 0, started: false, cranksNeeded: 2 + Math.floor(L.rand() * 3) };
      L.update = dt => { if (L.flags.cranking > 0) L.flags.cranking -= dt; };
      L.isWon = () => L.flags.started;
      L.objectiveText = () => L.flags.started ? 'Drive.' : L.flags.keyIn ? 'Turn the key.' : 'Find the keys. Start the car.';
      L.dynamic = () => { if (L.flags.keyIn) R.add(iconSprite(L, 'keys', 0.19, 0.7, 0.49, 0.1, 0.16)); };
      L.creatureLit = c => clamp(1 - (c.dist - 3) / 42, 0, 1) * 0.95;
      L.barrierDist = 0;
      L.aftermath = (t, dt) => { L.creature.frozen = true; L.creature.dist += dt * (4 + t * 6); G.shake(0.06); return t > 3.2; };
      L.aftermathText = 'It caught. You did not look in the mirror.';
      L.onEnd = () => AUDIO.stopLoop();
    }
  },

  // ============================================================ 3. THE GRAVEYARD ============================================================
  {
    id: 'graveyard', title: 'The Graveyard', facing: 45, eyeH: 1.65,
    pal: { skyTop: [22, 14, 32], fog: [74, 60, 72], ground: [42, 46, 36], fogDist: 64 },
    ambient: { wind: 0.7, drone: 0.7, droneFreq: 58, windFreq: 300 },
    intro: 'It has been walking between the graves since dusk, and it has never stopped smiling.',
    hint: 'The old rules for the chapel door: salt across the threshold, and a light beside it.',
    objective: 'Salt the threshold. Light the lantern.',
    creature: { type: 'smiler', startDist: 95, time: 88, gamma: 0.72, unseenMult: 1.55 },
    build(L) {
      const stone = [80, 76, 72], stoneD = [58, 54, 52], floor = [66, 62, 58], iron = [30, 30, 32];
      SC.stars(L, 13, 60, 0.35);
      SC.floorQ(L, -2.2, -1.7, 2.2, 1.9, 0.01, floor);
      SC.wallV(L, -2.2, -1.7, 2.2, -1.7, 0, 3.4, stone);
      SC.wallV(L, -0.7, -1.69, 0.7, -1.69, 0, 2.4, [36, 28, 24]);
      SC.wallV(L, -0.03, -1.68, 0.03, -1.68, 0, 2.4, [24, 18, 16]);
      for (let y = 0.4; y < 2.4; y += 0.5) SC.wallV(L, -0.7, -1.68, 0.7, -1.68, y, y + 0.04, [24, 18, 16]);
      SC.wallV(L, -2.2, -1.7, -2.2, 1.9, 0, 3.4, stoneD);
      SC.wallV(L, 2.2, -1.7, 2.2, 1.9, 0, 3.4, stoneD);
      SC.box(L, -2.2, -1.8, 0, 3.4, 1.6, 2.0, stone); SC.box(L, 1.8, 2.2, 0, 3.4, 1.6, 2.0, stone);
      SC.wallV(L, -2.2, 1.95, 2.2, 1.95, 3.0, 3.4, stone);
      SC.box(L, 1.95, 2.2, 1.1, 1.16, -0.6, 0.4, stoneD);           // ledge on the east wall
      SC.box(L, -2.15, -1.6, 0.42, 0.5, -1.2, 0.2, [62, 50, 40]);   // bench on the west
      SC.box(L, 0.86, 0.96, 0, 2.0, 1.72, 1.82, [42, 38, 34]);      // lantern post
      SC.quad(L, [0.7, 1.72, 1.77], [0.96, 1.72, 1.77], [0.96, 1.78, 1.77], [0.7, 1.78, 1.77], [42, 38, 34]);
      SC.floorQ(L, -0.9, 1.9, 0.9, 30, 0.012, [60, 58, 52]);
      SC.floorQ(L, -1.15, 1.58, 1.15, 1.94, 0.015, [84, 80, 74]);
      const fz = 3.6;
      for (const [x0, x1] of [[-16, -1.2], [1.2, 16]]) {
        for (let x = x0; x <= x1; x += 0.36) SC.wallV(L, x, fz, x + 0.04, fz, 0, 1.5, iron);
        SC.wallV(L, x0, fz, x1, fz, 1.3, 1.36, iron); SC.wallV(L, x0, fz, x1, fz, 0.25, 0.3, iron);
      }
      const rng = mulberry32(31);
      for (let i = 0; i < 55; i++) { const x = (rng() - 0.5) * 70, z = 5 + Math.pow(rng(), 1.3) * 60; if (Math.abs(x) < 1.6 && z < 30) continue; SC.gravestone(L, x, z, (rng() * 1e6) | 0); }
      for (let i = 0; i < 9; i++) { const x = (rng() - 0.5) * 90, z = 12 + rng() * 55; if (Math.abs(x) < 3) continue; SC.tree(L, x, z, 7 + rng() * 6, 'bare', (rng() * 1e6) | 0); }
      SC.groundDots(L, 17, 90, 3, 45, 120, [30, 34, 26], 0.4);
      mkItem(L, 'salt', 'Bag of salt', [
        { deg: 225, dist: 1.6, y: 0 },                    // south-west
        { x: 1.25, y: 0, z: -1.2 },                       // south-east
        { x: -1.3, y: 0, z: -0.45 },                      // in front of the bench
        { x: -1.4, y: 0, z: 1.15 },                       // by the west column
        { x: -1.9, y: 0.5, z: -0.3, jitter: 0.05 },       // on the bench
      ], { w: 0.34, h: 0.42, flat: true, uses: 2 });
      mkItem(L, 'matches', 'Matches', [
        { x: 2.05, y: 1.16, z: -0.25, flat: false },      // on the ledge
        { x: -1.9, y: 0.5, z: -1.0, flat: false, jitter: 0 }, // on the bench
        { x: 1.35, y: 0, z: -1.35, flat: true },          // on the floor, south-east
        { x: 1.5, y: 0, z: 1.0, flat: true },             // on the floor, by the east column
      ], { w: 0.16, h: 0.16, tool: true });
      mkItem(L, 'lantern', 'Lantern', [
        { x: -1.4, y: 0, z: 0.55 },                       // west, past the end of the bench
        { x: 0.55, y: 0, z: -1.4 },                       // beside the chapel door
        { x: 2.05, y: 1.16, z: 0.38, jitter: 0 },         // on the ledge
        { x: -1.55, y: 0, z: 1.25 },                      // by the west column
      ], { w: 0.3, h: 0.44 });
      const thr = mkTarget(L, {
        id: 'threshold', name: 'Threshold', deg: 0, dist: 1.75, y: 0.0, w: 2.2, h: 0.55, flat: true, accepts: ['salt'], needed: 2,
        hint() { return thr.done ? 'A line of salt.' : thr.count ? 'The line is thin. Pour more.' : 'The threshold. Bare stone.'; },
        use() { thr.count++; AUDIO.sfx('pour'); if (thr.count >= 2) thr.done = true; return true; }
      });
      const hook = mkTarget(L, {
        id: 'hook', name: 'Lantern hook', x: 0.78, y: 1.35, z: 1.77, w: 0.36, h: 0.5, accepts: ['lantern'],
        hint() { return hook.lit ? 'Burning.' : hook.hung ? 'Hung, unlit. Needs a match.' : 'An empty hook beside the door.'; },
        use(item) {
          if (item.id === 'lantern') { hook.hung = true; hook.accepts = ['matches']; AUDIO.sfx('chain'); return true; }
          if (item.id === 'matches') { if (!hook.hung) return false; hook.lit = true; hook.done = true; AUDIO.sfx('strike'); setTimeout(() => AUDIO.sfx('candle'), 300); return true; }
          return false;
        }
      });
      L.isWon = () => thr.done && hook.lit;
      L.objectiveText = () => 'Salt the threshold (' + (thr.done ? 'done' : thr.count + '/2') + '). Light the lantern (' + (hook.lit ? 'done' : hook.hung ? 'unlit' : 'no lantern') + ').';
      L.barrierDist = 2.6;
      L.dynamic = () => {
        if (thr.count) R.add(SC.mkQuad(L, [-1.05, 0.02, 1.6], [1.05, 0.02, 1.6], [1.05, 0.02, 1.92], [-1.05, 0.02, 1.92], [228, 224, 216], { alpha: thr.count >= 2 ? 0.92 : 0.35 }));
        if (hook.hung) R.add(SC.mkSprite(L, 0.78, 1.3, 1.77, 0.3, 0.44, (ctx, P) => { P.lit = hook.lit; ctx.scale(0.3, 0.44); ICONS.lantern(ctx, P); }));
      };
      L.glows = () => { if (!hook.lit) return null; const p = L.pt(0.78, 1.52, 1.77); return [{ x: p[0], y: p[1], z: p[2], r: 3.2 + Math.sin(L.t * 9) * 0.12 + Math.sin(L.t * 23) * 0.05, color: [255, 190, 110], a: 0.3 }]; };
      L.aftermath = t => t > 4.2;
      L.aftermathText = 'It stood at the salt line until morning, smiling at you. It never once looked at the lantern.';
    }
  },

  // ============================================================ 4. THE QUARRY ============================================================
  {
    id: 'quarry', title: 'The Quarry', facing: 270, eyeH: 1.65,
    pal: { skyTop: [96, 102, 112], fog: [152, 156, 160], ground: [64, 66, 58], fogDist: 48 },
    ambient: { wind: 0.9, drone: 0.5, droneFreq: 65, windFreq: 500 },
    intro: 'It only moves when nothing is looking at it.<br>It is standing at the far end of the quarry with its hands over its face.',
    hint: 'You will have to look away to chain and lock the gate. Be quick about it.',
    objective: 'Chain and padlock the gate.',
    creature: { type: 'watcher', startDist: 50, time: 24, gamma: 0.8, seenMult: 0, unseenMult: 1 },
    build(L) {
      const stone = [100, 102, 98], stoneD = [72, 74, 72];
      const wallH = 1.5;
      for (const [x0, z0, x1, z1] of [[-3.2, -3, -3.2, 2.6], [3.2, -3, 3.2, 2.6], [-3.2, -3, 3.2, -3], [-3.2, 2.6, -1.2, 2.6], [1.2, 2.6, 3.2, 2.6]])
        SC.box(L, Math.min(x0, x1) - 0.2, Math.max(x0, x1) + 0.2, 0, wallH, Math.min(z0, z1) - 0.2, Math.max(z0, z1) + 0.2, stone);
      SC.box(L, -1.35, -1.05, 0, 2.1, 2.45, 2.75, stoneD); SC.box(L, 1.05, 1.35, 0, 2.1, 2.45, 2.75, stoneD);
      SC.box(L, -0.5, 0.6, 0.4, 0.48, -2.4, -2.0, [72, 62, 50]);
      for (const [x, z] of [[-0.45, -2.35], [0.55, -2.35], [-0.45, -2.05], [0.55, -2.05]]) SC.box(L, x - 0.03, x + 0.03, 0, 0.4, z - 0.03, z + 0.03, [60, 50, 40]);
      SC.groundDots(L, 23, 90, 0.8, 3.0, 360, [50, 56, 40], 0.07);
      const rng = mulberry32(41);
      for (let i = 0; i < 28; i++) { const x = (rng() - 0.5) * 70, z = 5 + Math.pow(rng(), 1.2) * 45; if (Math.abs(x) < 1.8 && z < 25) continue; SC.boulder(L, x, z, 0.6 + rng() * 1.8, (rng() * 1e6) | 0); }
      SC.wallV(L, -140, 64, 140, 64, 0, 30, [90, 94, 96]);
      for (let i = 0; i < 7; i++) { const x = (rng() - 0.5) * 60, z = 8 + rng() * 40; if (Math.abs(x) < 3) continue; SC.tree(L, x, z, 5 + rng() * 5, 'bare', (rng() * 1e6) | 0); }
      SC.groundDots(L, 29, 100, 3, 50, 120, [52, 54, 46], 0.5);
      const bracket = (L, s) => SC.box(L, Math.min(s.x, s.bx), Math.max(s.x, s.bx), 0.9, 0.96, Math.min(s.z, s.bz), Math.max(s.z, s.bz), stoneD);
      mkItem(L, 'chain', 'Chain', [
        { x: 2.92, y: 0.85, z: 0.3, bx: 2.6, bz: 0.5, setup: bracket },     // hanging on the east wall
        { x: -2.92, y: 0.85, z: -0.6, bx: -2.6, bz: -0.4, setup: bracket }, // hanging on the west wall
        { x: 0.9, y: 0.85, z: -2.72, bx: 1.1, bz: -2.4, setup: bracket },   // hanging on the back wall
        { x: 1.9, y: 0, z: -0.5, flat: true },                               // coiled on the ground
      ], { w: 0.6, h: 0.75 });
      mkItem(L, 'padlock', 'Padlock', [
        { deg: 180, dist: 1.7, y: 0 },                    // south
        { x: 1.5, y: 0, z: 1.5 },                         // north-east
        { x: -1.7, y: 0, z: 1.2 },                        // north-west
        { x: -1.8, y: 0, z: -0.4 },                       // west
      ], { w: 0.22, h: 0.26, flat: true });
      mkItem(L, 'rope', 'Rotten rope', [
        { deg: 135, dist: 1.9, y: 0 },
        { x: -0.9, y: 0, z: 1.9 },
        { x: 1.7, y: 0, z: 0.9 },
      ], { w: 0.4, h: 0.3, flat: true });
      const gate = mkTarget(L, {
        id: 'gate', name: 'Gate', deg: 0, dist: 2.6, y: 0, w: 2.3, h: 2.0, accepts: ['chain'],
        hint() { return gate.locked ? 'Chained and locked.' : gate.chained ? (gate.closing > 0 ? 'Closing.' : 'Chained. It needs a lock.') : 'The gate stands open.'; },
        use(item) {
          if (item.id === 'chain') { gate.chained = true; gate.closing = 1.0; gate.accepts = ['padlock']; AUDIO.sfx('creak'); return true; }
          if (item.id === 'padlock') {
            if (!gate.chained || gate.closing > 0) { G.toast('Wait for it to close.'); return false; }
            gate.locked = true; gate.done = true; AUDIO.sfx('lock'); return true;
          }
          return false;
        }
      });
      gate.closing = 0; L.flags.gateAngle = Math.PI / 2;
      L.update = dt => {
        if (gate.closing > 0) {
          gate.closing -= dt;
          L.flags.gateAngle = (Math.PI / 2) * Math.pow(clamp(gate.closing, 0, 1), 1.4);
          if (gate.closing <= 0) { L.flags.gateAngle = 0; AUDIO.sfx('gate'); AUDIO.sfx('chain'); G.shake(0.2); }
        }
      };
      L.dynamic = () => {
        const a = L.flags.gateAngle, dx = Math.cos(a), dz = Math.sin(a), hx = -1.05, hz = 2.6, len = 2.1, iron = [38, 38, 42];
        for (let i = 0; i <= 7; i++) { const u = i / 7 * len; R.add(SC.mkWallV(L, hx + dx * (u - 0.025), hz + dz * (u - 0.025), hx + dx * (u + 0.025), hz + dz * (u + 0.025), 0, 1.9, iron)); }
        for (const yy of [0.3, 1.0, 1.65]) R.add(SC.mkWallV(L, hx, hz, hx + dx * len, hz + dz * len, yy - 0.03, yy + 0.03, iron));
        if (gate.chained && gate.closing <= 0) R.add(iconSprite(L, 'chain', 0.95, 0.72, 2.58, 0.55, 0.6));
        if (gate.locked) R.add(iconSprite(L, 'padlock', 1.0, 0.5, 2.57, 0.2, 0.24));
      };
      L.isWon = () => gate.locked;
      L.objectiveText = () => gate.locked ? 'Locked. Do not look away.' : gate.chained ? 'Now the padlock.' : 'Chain the gate shut, then padlock it.';
      L.barrierDist = 2.95;
      L.aftermath = t => t > 3.6;
      L.aftermathText = 'You did not look away again until the sun came up. It was still there. It is still there.';
    }
  },

  // ============================================================ 5. THE CLEARING ============================================================
  {
    id: 'clearing', title: 'The Clearing', facing: 180, eyeH: 2.0,
    pal: { skyTop: [6, 8, 16], fog: [54, 60, 74], ground: [126, 132, 148], fogDist: 120 },
    ambient: { wind: 1.1, drone: 0.6, droneFreq: 46, windFreq: 420 },
    intro: 'Something has been running the tree line all evening, watching the cabin.<br>Now it is coming straight for the porch.',
    hint: 'The shotgun is somewhere on the porch, and so is the box of shells. There are three, and you will need two.',
    objective: 'Get the gun. Load it. Wait.',
    creature: { type: 'runner', startDist: 115, time: 56, gamma: 0.72, unseenMult: 1.3 },
    build(L) {
      const logs = [60, 44, 32], logsD = [42, 30, 22], porch = [76, 62, 50];
      SC.stars(L, 51, 220, 0.9);
      SC.moon(L, 150, 21, 6, [220, 224, 235]);
      SC.floorQ(L, -3.2, -1.6, 3.2, 1.6, 0.35, porch);
      for (let x = -3.0; x < 3.2; x += 0.42) SC.floorQ(L, x, -1.6, x + 0.03, 1.6, 0.355, logsD);
      SC.wallV(L, -3.2, 1.6, 3.2, 1.6, 0, 0.35, logsD);
      SC.box(L, -0.8, 0.8, 0, 0.18, 1.6, 2.2, porch);
      SC.wallV(L, -3.4, -1.6, 3.4, -1.6, 0, 3.0, logs);
      for (let y = 0.3; y < 3; y += 0.32) SC.wallV(L, -3.4, -1.59, 3.4, -1.59, y, y + 0.05, logsD);
      SC.wallV(L, -0.55, -1.58, 0.55, -1.58, 0.35, 2.3, [32, 24, 18]);
      SC.wallV(L, 1.2, -1.58, 2.2, -1.58, 1.3, 2.1, [222, 162, 82], { noFog: true });
      SC.wallV(L, 1.68, -1.57, 1.72, -1.57, 1.3, 2.1, logsD); SC.wallV(L, 1.2, -1.57, 2.2, -1.57, 1.68, 1.72, logsD);
      for (const x of [-3.0, 3.0]) SC.box(L, x - 0.08, x + 0.08, 0.35, 2.95, 1.42, 1.58, logsD);
      SC.quad(L, [-3.4, 2.95, 1.75], [3.4, 2.95, 1.75], [3.4, 3.2, -1.6], [-3.4, 3.2, -1.6], [28, 20, 15]);
      for (const [x0, x1] of [[-3.0, -0.9], [0.9, 3.0]]) {
        SC.wallV(L, x0, 1.5, x1, 1.5, 1.2, 1.3, logsD); SC.wallV(L, x0, 1.5, x1, 1.5, 0.8, 0.85, logsD);
        for (let x = x0 + 0.3; x < x1; x += 0.45) SC.wallV(L, x, 1.5, x + 0.05, 1.5, 0.36, 1.2, logsD);
      }
      SC.box(L, 2.0, 3.0, 0.35, 1.1, -1.35, -0.3, [72, 54, 38]);
      SC.box(L, -3.0, -2.3, 0.35, 0.85, -1.4, -0.9, [70, 56, 44]);
      const rng = mulberry32(55);
      for (let i = 0; i < 90; i++) { const a = (rng() - 0.5) * 170 * DEG, d = 105 + rng() * 90; SC.tree(L, Math.sin(a) * d, Math.cos(a) * d, 10 + rng() * 10, 'fir', (rng() * 1e6) | 0); }
      for (let i = 0; i < 14; i++) { const x = (rng() < 0.5 ? -1 : 1) * (9 + rng() * 30), z = 6 + rng() * 60; SC.tree(L, x, z, 7 + rng() * 6, 'fir', (rng() * 1e6) | 0); }
      for (let i = 0; i < 22; i++) { const x = (rng() - 0.5) * 90, z = -8 - rng() * 45; SC.tree(L, x, z, 9 + rng() * 8, 'fir', (rng() * 1e6) | 0); }
      for (let i = 0; i < 14; i++) { const x = (rng() - 0.5) * 50, z = 4 + rng() * 40; if (Math.abs(x) < 1.5) continue; SC.boulder(L, x, z, 0.3 + rng() * 0.5, (rng() * 1e6) | 0); }
      const pegs = (L, s) => { for (const dx of [-0.4, 0.4]) SC.box(L, s.x + dx - 0.05, s.x + dx + 0.05, s.y + 0.08, s.y + 0.14, -1.62, -1.5, logsD); };
      mkItem(L, 'shotgun', 'Shotgun', [
        { x: 0, y: 2.28, z: -1.52, setup: pegs },         // on pegs above the door
        { x: 1.6, y: 2.05, z: -1.52, setup: pegs },       // on pegs by the window
        { x: -1.3, y: 1.9, z: -1.52, setup: pegs },       // on pegs left of the door
        { x: 2.5, y: 1.1, z: -0.8, flat: true, key: 'woodpile' },   // lying on the woodpile
        { x: -2.65, y: 0.85, z: -1.15, flat: true, key: 'crate' }, // lying on the crate
      ], { w: 1.1, h: 0.36, tool: true });
      mkItem(L, 'shells', 'Shells', [
        { deg: 90, dist: 1.5, y: 0.36 },                  // porch floor, right
        { x: -1.4, y: 0.36, z: 0.4 },                     // porch floor, left
        { x: 0.7, y: 0.36, z: -1.2 },                     // by the door
        { x: -2.65, y: 0.85, z: -1.15, jitter: 0.04, key: 'crate' },  // on the crate
        { x: 2.5, y: 1.1, z: -0.5, jitter: 0.06, key: 'woodpile' },   // on the woodpile
      ], { w: 0.3, h: 0.3, flat: true, uses: 3, tool: true });
      L.gun = { have: false, recoil: 0 };
      L.floorY = 0.36;
      L.onPickup = it => {
        if (it.id === 'shotgun') { L.gun.have = true; if (G.hasItem('shells')) AUDIO.sfx('load'); }
        if (it.id === 'shells' && L.gun.have) AUDIO.sfx('load');
      };
      L.gunLoaded = () => L.gun.have && G.hasItem('shells');
      L.creatureHittable = () => L.gun.have;
      L.shoot = (hit) => {
        const c = L.creature;
        const shells = G.inv.find(i => i.id === 'shells');
        if (!shells) { AUDIO.sfx('empty'); G.toast('Click. Nothing in it.'); return; }
        shells.uses--; if (shells.uses <= 0) G.removeFromInv(shells);
        AUDIO.sfx('shot'); G.flash(0.55); G.shake(0.7); L.gun.recoil = 1;
        if (hit && c.dist < 32 && !c.dead) {
          c.hits++; c.hurtFlash = 0.35;
          if (c.hits === 1) { c.wounded = true; c.mode = 'stumble'; c.modeT = 0; G.toast('It went down. It is getting back up.'); }
          else { c.dead = true; c.latHold = c.lat; G.toast('It stopped.'); }
        } else if (hit) G.toast('Too far. Wait.');
        else G.toast(shells.uses > 0 ? 'Missed.' : 'Missed. That was the last one.');
      };
      L.update = dt => { if (L.gun.recoil > 0) L.gun.recoil = Math.max(0, L.gun.recoil - dt * 4); };
      L.isWon = () => L.creature.dead;
      L.objectiveText = () => { const s = G.inv.find(i => i.id === 'shells'); return L.creature.dead ? 'It is down.' : !L.gun.have ? 'Get the gun.' : !s ? 'Load it.' : (s.uses + ' shell' + (s.uses > 1 ? 's' : '') + '. Let it get close.'); };
      L.barrierDist = 0;
      L.aftermath = t => t > 3.6;
      L.aftermathText = 'You sat on the porch with the gun across your knees until it got light, and nothing else came out of the trees. This time.';
    }
  }
];
