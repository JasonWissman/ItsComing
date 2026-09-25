'use strict';
// ============================================================ 6. THE BOATHOUSE ============================================================
LEVELS.push({
  id: 'boathouse', title: 'The Boathouse', facing: 0, eyeH: 1.65,
  pal: { skyTop: [8, 10, 18], fog: [40, 48, 58], ground: [24, 32, 40], fogDist: 60 },
  ambient: { wind: 0.6, drone: 0.7, droneFreq: 44, windFreq: 260, rain: 0.5 },
  weather: { kind: 'rain', density: 0.45, wind: 0.25, fogRoll: { period: 37, depth: 0.35, phase: 1 } },
  text: {
    intro: 'The water door has been open all night, and the water has not been still.<br>Something is swimming in toward the boathouse. It goes under for a while, and when it comes up it is closer.',
    hint: 'The winch lowers the water door, once it has its handle. The side door takes the bar.',
    objective: 'Seal the door it is coming for.',
    death: { default: 'It came up over the sill with its hand first.', reached: 'The door was not down. It came up under it.' },
    win: 'It pushed at the slats until the tide turned. When you looked again the water was flat all the way out.',
    fragment: 'Your knees were wet until noon. Nothing else in the house was.',
  },
  // the thing swims: its feet are at the water line, a little below the deck
  lanes: [
    { deg: 0, name: 'water door', barrierDist: 2.9, y: -0.15, cue: 'splash', default: true },
    { deg: 90, name: 'side door', barrierDist: 2.7, y: -0.15, cue: 'splash' },
  ],
  creatures: [{ type: 'swimmer', startDist: 70, time: 105, gamma: 0.75, unseenMult: 1.3 }],
  aftermath: { type: 'held', dur: 4.2, beats: [{ every: 0.95, sfx: 'wetThud', shake: 0.45 }, { at: 0.5, sfx: 'splash' }, { at: 2.1, sfx: 'splash' }, { at: 3.7, sfx: 'dive' }] },
  build(L) {
    const s = L.s;
    const wood = [50, 43, 36], woodD = [38, 32, 27], frameC = [76, 64, 50], deck = [56, 48, 39], water = [22, 30, 38], iron = [48, 48, 54], WL = -0.15;
    const tex = { tex: 'planks', texScale: 1.4 };
    SC.stars(L, 61, 90, 0.35);
    SC.clouds(L, 62, 7, [30, 36, 48], 0.5);
    SC.moon(L, 300, 30, 5, [210, 214, 226]);
    // water all round: the boathouse stands on piles at the end of a pier
    SC.floorQ(L, -160, 2.7, 160, 240, WL, water);
    SC.floorQ(L, 2.5, -70, 160, 2.7, WL, water);
    SC.floorQ(L, -160, -70, -2.5, 2.7, WL, water);
    SC.floorQ(L, -2.5, -70, 2.5, -2.5, WL, water);
    for (let i = 0; i < 9; i++) SC.floorQ(L, -9 + i * 0.35, 8 + i * 5, -8.5 + i * 0.35, 11 + i * 5, WL + 0.005, [60, 72, 86], { alpha: 0.45 });
    const wr = mulberry32(63);
    for (let i = 0; i < 40; i++) { const x = (wr() - 0.5) * 30, z = 3.5 + Math.pow(wr(), 1.4) * 45, w = 0.6 + wr() * 2; SC.floorQ(L, x - w, z - 0.04, x + w, z + 0.04, WL + 0.004, wr() < 0.5 ? [14, 20, 28] : [44, 56, 68], { alpha: 0.5 }); }
    // the pier back to the shore, and its piles
    SC.floorQ(L, -1.0, -60, 1.0, -2.4, 0.0, deck, { tex: 'planks', texScale: 1.2 });
    for (let z = -6; z > -58; z -= 6) for (const x of [-0.9, 0.9]) SC.box(L, x - 0.1, x + 0.1, WL - 0.6, 0.05, z - 0.1, z + 0.1, [36, 30, 24]);
    // piles standing out in the channel, and the far shore
    for (const z of [6, 11, 17, 24]) for (const x of [-2.3, 2.3]) SC.box(L, x - 0.12, x + 0.12, WL - 0.4, 0.5 + (z % 5) * 0.06, z - 0.12, z + 0.12, [34, 28, 22]);
    const rng = mulberry32(66);
    for (let i = 0; i < 44; i++) { const x = (rng() - 0.5) * 170, z = 56 + rng() * 28; SC.tree(L, x, z, 8 + rng() * 7, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 26; i++) { const side = rng() < 0.5 ? -1 : 1, x = side * (46 + rng() * 30), z = -30 + rng() * 70; SC.tree(L, x, z, 7 + rng() * 7, rng() < 0.6 ? 'fir' : 'bare', (rng() * 1e6) | 0); }
    SC.sprite(L, -34, 1.2, 66, 0.9, 0.7, (ctx, P) => { ctx.scale(0.9, 0.7); P_rect(ctx, -0.5, 0, 1, 1, P.raw([214, 176, 108])); }, { noFog: true, noLight: true });
    // the deck and the walls
    SC.floorQ(L, -2.4, -2.4, 2.4, 2.6, 0.006, deck, { tex: 'planks', texScale: 1.3 });
    SC.wallV(L, -2.4, -2.4, 2.4, -2.4, 0, 3.0, wood, tex);
    SC.wallV(L, -0.5, -2.39, 0.5, -2.39, 0, 2.1, [22, 18, 16]);
    SC.wallV(L, -0.56, -2.385, -0.5, -2.385, 0, 2.16, frameC); SC.wallV(L, 0.5, -2.385, 0.56, -2.385, 0, 2.16, frameC); SC.wallV(L, -0.56, -2.385, 0.56, -2.385, 2.1, 2.16, frameC);
    SC.wallV(L, -2.4, -2.4, -2.4, 2.6, 0, 3.0, woodD, tex);
    for (let y = 0.6; y < 3; y += 0.6) { SC.wallV(L, -2.39, -2.4, -2.39, 2.6, y, y + 0.04, [30, 24, 20]); SC.wallV(L, -2.4, -2.39, 2.4, -2.39, y, y + 0.04, [30, 24, 20]); }
    const apN = SC.doorway(L, { z: 2.6, w: 3.0, h: 2.4, wallH: 3.0, left: -2.4, right: 2.4, color: wood, opts: tex, frame: { color: frameC, w: 0.12 } });
    const apE = SC.doorway(L, { deg: 90, z: 2.4, w: 1.1, h: 2.1, wallH: 3.0, left: -2.6, right: 2.4, color: woodD, opts: tex, frame: { color: frameC, w: 0.1 } });
    L.addAperture(0, apN); L.addAperture(1, apE);
    SC.quad(L, [-2.5, 3.0, -2.5], [2.5, 3.0, -2.5], [2.5, 3.0, 2.7], [-2.5, 3.0, 2.7], [26, 21, 17]);
    for (const z of [-1.8, -0.6, 0.6, 1.8]) SC.box(L, -2.4, 2.4, 2.84, 3.0, z - 0.06, z + 0.06, [44, 36, 28]);
    // furniture: an upturned rowboat, a workbench, a shelf, the winch, rope and nets
    SC.box(L, -2.3, -1.4, 0, 0.45, -1.9, 1.4, [72, 62, 50]); SC.box(L, -1.9, -1.8, 0.45, 0.55, -1.9, 1.4, [50, 42, 34]);
    SC.box(L, 0.6, 2.3, 0.86, 0.92, -2.35, -1.7, [78, 64, 48]);
    for (const [x, z] of [[0.65, -2.3], [2.25, -2.3], [0.65, -1.75], [2.25, -1.75]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.86, z - 0.04, z + 0.04, [60, 48, 36]);
    SC.box(L, -2.38, -2.05, 1.5, 1.55, -0.2, 1.4, [66, 54, 42]);
    SC.box(L, 1.7, 2.2, 0.95, 1.4, 2.42, 2.58, iron); SC.box(L, 1.8, 2.1, 2.42, 2.58, 2.5, 2.62, iron);
    SC.quad(L, [1.94, 1.4, 2.6], [1.96, 1.4, 2.6], [1.96, 2.45, 2.6], [1.94, 2.45, 2.6], [28, 28, 30]);
    SC.quad(L, [0, 2.44, 2.61], [1.95, 2.44, 2.61], [1.95, 2.47, 2.61], [0, 2.47, 2.61], [28, 28, 30]);
    SC.sprite(L, -1.6, 1.4, -2.36, 0.5, 0.5, (ctx, P) => { ctx.scale(0.5, 0.5); ICONS.rope(ctx, P); });
    SC.sprite(L, -2.36, 1.85, -1.5, 0.7, 0.7, (ctx, P) => { ctx.scale(0.7, 0.7); ctx.lineWidth = 0.16; ctx.strokeStyle = P.col([200, 196, 186]); ctx.beginPath(); ctx.arc(0, 0.5, 0.36, 0, TAU); ctx.stroke(); ctx.strokeStyle = P.col([150, 50, 40]); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(0, 0.5, 0.36, k * Math.PI / 2 + 0.2, k * Math.PI / 2 + 0.6); ctx.stroke(); } });
    SC.sprite(L, 1.2, 1.3, -2.36, 1.6, 1.6, (ctx, P) => { ctx.scale(1.6, 1.6); ctx.strokeStyle = P.col([60, 58, 50]); ctx.lineWidth = 0.006; ctx.beginPath(); for (let k = 0; k <= 8; k++) { ctx.moveTo(-0.5 + k / 8, 1); ctx.lineTo(-0.4 + k / 8 * 0.8, 0); ctx.moveTo(-0.5, 1 - k / 8); ctx.lineTo(0.5, 1 - k / 8 * 0.9); } ctx.stroke(); });
    for (const [x, z] of [[2.28, -0.85], [2.28, 0.7]]) SC.box(L, x, x + 0.1, 1.0, 1.2, z, z + 0.15, iron);
    // items
    const decoy = !!L.diff.decoys;
    mkItem(L, 'handle', 'Winch handle', [
      { x: 1.2, y: 0.92, z: -2.0 },                     // on the workbench
      { x: 1.6, y: 0, z: -2.1 },                        // on the deck under the bench
      { x: -2.33, y: 1.3, z: 0.2, flat: false },        // hanging on a nail on the west wall
      { x: -1.7, y: 0.55, z: 0.3 },                     // on the rowboat's hull
      { x: -1.9, y: 0, z: 2.2 },                        // in the corner by the water door
    ], { w: 0.45, h: 0.45, flat: true });
    mkItem(L, 'beam', 'Bar beam', [
      { x: -1.0, y: 0, z: -0.6 },                       // on the deck by the boat
      { x: -0.6, y: 0, z: -2.05 },                      // along the back wall
      { x: 1.5, y: 0.92, z: -2.0 },                     // across the workbench
      { x: 1.6, y: 0, z: 1.0 },                         // near the side door
    ], { w: 1.6, h: 0.5, flat: true });
    if (decoy) mkItem(L, 'oar', 'Oar', [{ x: -2.1, y: 0, z: 1.6 }, { x: 0.3, y: 0, z: -1.6 }], { w: 0.5, h: 1.2, flat: true, decoy: true, decoyText: 'It does not fit the winch.' });
    Object.assign(s, { handleIn: false, needPin: L.diff.tier >= 2, sealedN: false, sealedE: false, doorOpen: true, doorClosing: 0, doorClosed: false, doorA: 72 * DEG, lastK: 0 });
    if (s.needPin) mkContainer(L, {
      id: 'tacklebox', name: 'Tackle box', w: 0.45, h: 0.3, color: [62, 88, 72],
      spot: [{ x: 1.9, y: 0.92, z: -2.0 }, { x: -2.2, y: 1.55, z: 0.6 }, { x: 2.0, y: 0, z: -1.6 }, { x: -1.5, y: 0.55, z: -1.2 }],
      closedText: 'A tackle box.', emptyText: 'Hooks and line. Nothing else.',
      yields: [{ id: 'pin', name: 'Pawl pin', opts: { w: 0.2, h: 0.26, flat: false } }],
    });
    // the winch: fit the handle, then crank the water door down. Without the pawl it slips back.
    const need = L.tier(6, 6, 7);
    const winch = mkTarget(L, {
      id: 'winch', name: 'Winch', x: 1.95, y: 0.85, z: 2.45, w: 0.7, h: 0.75, accepts: ['handle'].concat(decoy ? ['oar'] : []),
      hint() { return winch.done ? 'The door is down.' : !s.handleIn ? 'The winch. Its handle is gone.' : s.needPin ? 'It turns, but it slips back. The pawl pin is missing.' : 'Crank it. ' + Math.max(0, need - Math.floor(winch.count || 0)) + ' more.'; },
      use(item) {
        if (item.id === 'handle') {
          s.handleIn = true; winch.accepts = s.needPin ? ['pin'] : [];
          winch.crank = { n: need, sfx: 'ratchet', decay: s.needPin ? { after: 1.2, rate: 1.4 } : null, onTurn() { G.shake(0.05); }, onComplete() { s.sealedN = true; AUDIO.sfx('bar'); G.say('The water door is down.', 'Down.'); } };
          AUDIO.sfx('fit'); G.say('The handle fits. Crank it.', 'It fits.'); return true;
        }
        if (item.id === 'pin') { s.needPin = false; winch.accepts = []; winch.crank.decay = null; AUDIO.sfx('fit'); G.say('The pawl drops in. It will hold now.', 'That holds.'); return true; }
        return false;
      },
    });
    // the side door: close it, then bar it. A closed door on its own only slows it down.
    const sd = mkTarget(L, {
      id: 'sidedoor', name: 'Side door', x: 2.36, y: 0, z: 0, w: 1.25, h: 2.1, accepts: ['beam'],
      hint() { return s.sealedE ? 'Barred.' : s.doorOpen ? 'The side door stands open.' : s.doorClosing > 0 ? 'Swinging shut.' : 'Shut. The bar would hold it.'; },
      onClick() {
        if (s.doorOpen) { s.doorOpen = false; s.doorClosing = 0.9; AUDIO.sfx('creak'); return true; }
        if (s.doorClosing > 0) { G.say('Wait for it to shut.', 'Not yet.'); return true; }
        return false;
      },
      use(item) {
        if (s.doorOpen || s.doorClosing > 0) { G.say('Shut it first.', 'Not like this.'); return false; }
        s.sealedE = true; sd.done = true; sd.accepts = []; AUDIO.sfx('bar'); G.say('The bar is across.', 'Barred.'); return true;
      },
    });
    const sealed = lane => lane.idx === 0 ? s.sealedN : s.sealedE;
    L.isWon = () => L.tier(sealed(L.lane), sealed(L.lane), s.sealedN && s.sealedE);
    L.objectiveText = () => {
      const n = s.sealedN ? 'Water door down.' : !s.handleIn ? 'Find the winch handle.' : 'Crank the water door down (' + Math.min(need, Math.floor(winch.count || 0)) + '/' + need + ').';
      const e = s.sealedE ? 'Side door barred.' : s.doorOpen ? 'Shut the side door and bar it.' : 'Bar the side door.';
      return L.diff.tier >= 3 ? n + ' ' + e : L.lane.idx === 0 ? n : e;
    };
    L.update = dt => {
      if (s.doorClosing > 0) { s.doorClosing -= dt; s.doorA = 72 * DEG * Math.pow(clamp(s.doorClosing / 0.9, 0, 1), 1.3); if (s.doorClosing <= 0) { s.doorA = 0; s.doorClosed = true; AUDIO.sfx('thud'); G.shake(0.12); } }
      const k = Math.floor(winch.count || 0);
      if (k < s.lastK && !winch.done) AUDIO.sfx('clunk');
      s.lastK = k;
    };
    L.onReach = c => { if (c.lane.idx === 1 && s.doorClosed && !s.sealedE) { s.doorOpen = true; s.doorClosed = false; s.doorA = 72 * DEG; AUDIO.sfx('bang'); G.shake(0.5); G.toast('The side door bangs open.'); } };
    const lampX = () => Math.sin(L.t * 1.9) * 0.55;
    L.dynamic = () => {
      // the water door: slats come down from the top as the winch turns
      const covered = 2.4 * clamp((winch.count || 0) / need, 0, 1);
      for (let y = 2.4; y > 2.4 - covered; y -= 0.3) {
        const y0 = Math.max(y - 0.3, 2.4 - covered);
        R.add(SC.mkQuad(L, [-1.5, y0, 2.58], [1.5, y0, 2.58], [1.5, y, 2.58], [-1.5, y, 2.58], (Math.round(y / 0.3) % 2) ? [80, 72, 60] : [70, 62, 52]));
      }
      if (covered > 0.05) R.add(SC.mkQuad(L, [-1.52, 2.4 - covered, 2.575], [1.52, 2.4 - covered, 2.575], [1.52, 2.4 - covered + 0.06, 2.575], [-1.52, 2.4 - covered + 0.06, 2.575], [40, 40, 44]));
      if (s.handleIn) R.add(SC.mkSprite(L, 1.95, 0.95, 2.4, 0.45, 0.45, (ctx, P) => { ctx.translate(0, 0.22); ctx.rotate((winch.count || 0) * 1.3); ctx.translate(0, -0.22); ctx.scale(0.45, 0.45); ICONS.handle(ctx, P); }));
      // the side door leaf, swung out over the water or shut in its frame, and the bar
      const hx = 2.4, hz = -0.55, a = s.doorA, ex = hx + Math.sin(a) * 1.1, ez = hz + Math.cos(a) * 1.1;
      R.add(SC.mkWallV(L, hx, hz, ex, ez, 0, 2.08, [64, 52, 40]));
      for (const yy of [0.5, 1.5]) R.add(SC.mkWallV(L, hx + Math.sin(a) * 0.02, hz + Math.cos(a) * 0.02, ex - Math.sin(a) * 0.02, ez - Math.cos(a) * 0.02, yy, yy + 0.05, [44, 36, 28]));
      if (s.sealedE) R.add(SC.mkWallV(L, 2.32, -0.9, 2.32, 0.9, 0.98, 1.18, [104, 78, 48]));
      // the hurricane lamp, swinging on its chain
      const lx = lampX();
      R.add(SC.mkQuad(L, [lx * 0.05 - 0.01, 2.84, 0.3], [lx * 0.05 + 0.01, 2.84, 0.3], [lx + 0.01, 2.4, 0.3], [lx - 0.01, 2.4, 0.3], [40, 40, 44]));
      R.add(SC.mkSprite(L, lx, 1.96, 0.3, 0.3, 0.44, (ctx, P) => { P.lit = true; ctx.scale(0.3, 0.44); ICONS.lantern(ctx, P); }));
      // rings on the water where it went under
      const c = L.creature;
      if (c.mode === 'down' && !L.won && !c.lunge) {
        const p = APPROACH.position(c.lane, c.diveDist, 0, L.eyeH), k = clamp((L.t - c.diveT) / 2.6, 0, 1), w = 1 + k * 2.2, h = 0.35 + k * 0.7;
        R.add({ kind: 'sprite', x: p.x, y: p.y + 0.02, z: p.z, w, h, flat: true, draw: (ctx, P) => { ctx.scale(w, h); ctx.strokeStyle = P.cola([160, 175, 185], 0.45 * (1 - k)); ctx.lineWidth = 0.05; ctx.beginPath(); ctx.ellipse(0, 0.5, 0.5, 0.5, 0, 0, TAU); ctx.stroke(); } });
      }
    };
    L.dynamicLights = () => { const p = L.pt(lampX(), 2.05, 0.3); return [{ x: p[0], y: p[1], z: p[2], r: 5.5, i: 0.42, color: [255, 210, 160], flicker: 0.3, seed: 2 }]; };
    L.glows = () => { const p = L.pt(lampX(), 2.15, 0.3); return [{ x: p[0], y: p[1], z: p[2], r: 1.6 + Math.sin(L.t * 11) * 0.08, color: [255, 190, 110], a: 0.2 }]; };
    L.floor = { poly: [[-2.3, -2.3], [2.3, -2.3], [2.3, 2.5], [-2.3, 2.5]], y: 0 };
  }
});
