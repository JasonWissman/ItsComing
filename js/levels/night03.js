'use strict';
// ============================================================ 3. THE GRAVEYARD ============================================================
LEVELS.push({
  id: 'graveyard', title: 'The Graveyard', facing: 45, eyeH: 1.65,
  pal: { skyTop: [22, 14, 32], fog: [74, 60, 72], ground: [42, 46, 36], fogDist: 64 },
  ambient: { wind: 0.7, drone: 0.7, droneFreq: 58, windFreq: 300, rain: 0.35 },
  weather: { kind: 'rain', density: 0.45, wind: 0.2, fogRoll: { period: 41, depth: 0.5 } },
  text: {
    intro: 'It has been walking between the graves since dusk, and it has never stopped smiling.',
    hint: 'The old rules for a threshold: salt across it, and a light beside it.',
    objective: 'Salt the threshold. Light the lantern.',
    death: { default: 'It was still smiling when it stepped over the threshold.' },
    win: 'It stood at the salt line until morning, smiling at you. It never once looked at the lantern.',
    fragment: 'There was a line of salt across the floor in the morning, and no one had been near the kitchen.',
  },
  // the porch opens to the path between the two columns; a side gate in the east wall opens on the graves
  lanes: [
    { deg: 0, name: 'path', barrierDist: 2.6, cue: 'gate', apertures: [{ z: 1.8, x0: -1.8, x1: 1.8, y0: 0, y1: 3.0 }, { z: 3.6, x0: -1.2, x1: 1.2, y0: 0, y1: 99 }], default: true },
    { deg: 90, name: 'side gate', barrierDist: 2.5, cue: 'creak', apertures: [{ z: 3.6, x0: -1.3, x1: 1.3, y0: 0, y1: 99 }] },
  ],
  creatures: [{ type: 'smiler', startDist: 95, time: 88, gamma: 0.72, unseenMult: 1.55 }],
  aftermath: { type: 'stand', dur: 4.2 },
  build(L) {
    const s = L.s;
    const stone = [80, 76, 72], stoneD = [58, 54, 52], floor = [66, 62, 58], iron = [30, 30, 32];
    const stex = { tex: 'stone', texScale: 1.6 };
    SC.stars(L, 13, 60, 0.35);
    SC.clouds(L, 14, 6, [58, 44, 62], 0.28);
    SC.floorQ(L, -2.2, -1.7, 2.2, 1.9, 0.01, floor, { tex: 'stone', texScale: 1.2 });
    SC.wallV(L, -2.2, -1.7, 2.2, -1.7, 0, 3.4, stone, stex);
    SC.wallV(L, -0.7, -1.69, 0.7, -1.69, 0, 2.4, [36, 28, 24]);
    SC.wallV(L, -0.03, -1.68, 0.03, -1.68, 0, 2.4, [24, 18, 16]);
    for (let y = 0.4; y < 2.4; y += 0.5) SC.wallV(L, -0.7, -1.68, 0.7, -1.68, y, y + 0.04, [24, 18, 16]);
    SC.wallV(L, -2.2, -1.7, -2.2, 1.9, 0, 3.4, stoneD, stex);
    const apE = SC.doorway(L, { deg: 90, z: 2.2, w: 1.2, h: 2.2, wallH: 3.4, left: -1.9, right: 1.7, color: stoneD, opts: stex, frame: { color: [44, 42, 40], w: 0.08 } });
    L.addAperture(1, apE);
    SC.box(L, -2.2, -1.8, 0, 3.4, 1.6, 2.0, stone); SC.box(L, 1.8, 2.2, 0, 3.4, 1.6, 2.0, stone);
    SC.wallV(L, -2.2, 1.95, 2.2, 1.95, 3.0, 3.4, stone);
    SC.box(L, 1.95, 2.2, 1.1, 1.16, -1.55, -0.75, stoneD);         // ledge on the east wall, beside the side gate
    SC.box(L, -2.15, -1.6, 0.42, 0.5, -1.2, 0.2, [62, 50, 40]);   // bench on the west
    STORY.lamp(L, -1.9, 0.5, 0.1, { scale: 0.8 });
    SC.box(L, 0.86, 0.96, 0, 2.0, 1.72, 1.82, [42, 38, 34]);      // lantern post
    SC.quad(L, [0.7, 1.72, 1.77], [0.96, 1.72, 1.77], [0.96, 1.78, 1.77], [0.7, 1.78, 1.77], [42, 38, 34]);
    SC.floorQ(L, -0.9, 1.9, 0.9, 30, 0.012, [60, 58, 52]);
    SC.floorQ(L, 2.2, -0.7, 30, 0.7, 0.012, [60, 58, 52]);
    SC.floorQ(L, -1.15, 1.58, 1.15, 1.94, 0.015, [84, 80, 74]);
    SC.floorQ(L, 1.75, -0.7, 2.25, 0.7, 0.015, [84, 80, 74]);
    // the iron fence round the churchyard, with gaps where the path and the side path go through
    const fz = 3.6;
    for (const [x0, x1] of [[-16, -1.2], [1.2, 16]]) {
      for (let x = x0; x <= x1; x += 0.36) SC.wallV(L, x, fz, x + 0.04, fz, 0, 1.5, iron);
      SC.wallV(L, x0, fz, x1, fz, 1.3, 1.36, iron); SC.wallV(L, x0, fz, x1, fz, 0.25, 0.3, iron);
    }
    for (const [z0, z1] of [[-16, -1.3], [1.3, 3.6]]) {
      for (let z = z0; z <= z1; z += 0.36) SC.wallV(L, fz, z, fz, z + 0.04, 0, 1.5, iron);
      SC.wallV(L, fz, z0, fz, z1, 1.3, 1.36, iron); SC.wallV(L, fz, z0, fz, z1, 0.25, 0.3, iron);
    }
    for (const [x, z] of [[-1.3, fz], [1.3, fz], [fz, -1.4], [fz, 1.4]]) SC.box(L, x - 0.12, x + 0.12, 0, 1.7, z - 0.12, z + 0.12, [40, 40, 42]);
    const rng = mulberry32(31);
    for (let i = 0; i < 70; i++) { const x = (rng() - 0.5) * 80, z = -20 + Math.pow(rng(), 1.1) * 80; if (Math.abs(x) < 1.6 && z > 1 && z < 30) continue; if (Math.abs(z) < 1.6 && x > 1.2 && x < 30) continue; if (Math.abs(x) < 3 && Math.abs(z) < 3) continue; SC.gravestone(L, x, z, (rng() * 1e6) | 0); }
    for (let i = 0; i < 11; i++) { const x = (rng() - 0.5) * 90, z = -10 + rng() * 65; if (Math.abs(x) < 3 || Math.abs(z) < 3) continue; SC.tree(L, x, z, 7 + rng() * 6, 'bare', (rng() * 1e6) | 0); }
    SC.groundDots(L, 17, 90, 3, 45, 120, [30, 34, 26], 0.4);
    // items
    const decoy = !!L.diff.decoys, pours = L.tier(2, 3, 2);
    mkItem(L, 'salt', 'Bag of salt', [
      { deg: 225, dist: 1.6, y: 0 },                    // south-west
      { x: 1.25, y: 0, z: -1.2 },                       // south-east
      { x: -1.3, y: 0, z: -0.45 },                      // in front of the bench
      { x: -1.4, y: 0, z: 1.15 },                       // by the west column
      { x: -1.9, y: 0.5, z: -0.3, jitter: 0.05 },       // on the bench
    ], { w: 0.34, h: 0.42, flat: true, uses: L.tier(2, 3, 4) });
    if (decoy) mkItem(L, 'sugar', 'Bag of salt', [{ x: 0.9, y: 0, z: 0.9 }, { x: -0.5, y: 0, z: -1.3 }], { w: 0.34, h: 0.42, flat: true, icon: 'salt', decoy: true, decoyText: 'Sugar. It is sugar.' });
    mkItem(L, 'matches', 'Matches', [
      { x: 2.05, y: 1.16, z: -1.15, flat: false },      // on the ledge
      { x: -1.9, y: 0.5, z: -1.0, flat: false, jitter: 0 }, // on the bench
      { x: 1.35, y: 0, z: -1.35, flat: true },          // on the floor, south-east
      { x: 1.5, y: 0, z: 1.0, flat: true },             // on the floor, by the east column
    ], { w: 0.16, h: 0.16, tool: true });
    mkItem(L, 'lantern', 'Lantern', [
      { x: -1.4, y: 0, z: 0.55 },                       // west, past the end of the bench
      { x: 0.55, y: 0, z: -1.4 },                       // beside the chapel door
      { x: 1.5, y: 0, z: -1.25 },                       // by the side gate
      { x: -1.55, y: 0, z: 1.25 },                      // by the west column
    ], { w: 0.3, h: 0.44 });
    const mkThreshold = (id, name, deg, dist, w) => {
      const t = mkTarget(L, {
        id, name, deg, dist, y: 0.0, w, h: 0.55, flat: true, accepts: ['salt'].concat(decoy ? ['sugar'] : []), needed: pours,
        hint() { return t.done ? 'A line of salt.' : t.count ? 'The line is thin. Pour more.' : 'The threshold. Bare stone.'; },
        use() { t.count++; AUDIO.sfx('pour'); if (t.count >= pours) t.done = true; return true; },
      });
      return t;
    };
    const thr = mkThreshold('threshold', 'Threshold', 0, 1.75, 2.2), thrE = mkThreshold('sidethreshold', 'Side gate threshold', 90, 1.95, 1.3);
    const thrOf = lane => lane.idx === 0 ? thr : thrE;
    const hook = mkTarget(L, {
      id: 'hook', name: 'Lantern hook', x: 0.78, y: 1.35, z: 1.77, w: 0.36, h: 0.5, accepts: ['lantern'],
      hint() { return hook.lit ? 'Burning.' : hook.hung ? 'Hung, unlit. Needs a match.' : 'An empty hook beside the door.'; },
      use(item) {
        if (item.id === 'lantern') { hook.hung = true; hook.accepts = ['matches']; AUDIO.sfx('chain'); return true; }
        if (item.id === 'matches') { if (!hook.hung) return false; hook.lit = true; hook.done = true; AUDIO.sfx('strike'); setTimeout(() => AUDIO.sfx('candle'), 300); return true; }
        return false;
      },
    });
    L.isWon = () => hook.lit && L.tier(thrOf(L.lane).done, thrOf(L.lane).done, thr.done && thrE.done);
    L.objectiveText = () => {
      const st = t => t.done ? 'done' : t.count + '/' + pours;
      const salt = L.diff.tier >= 3 ? 'Salt both thresholds (path ' + st(thr) + ', side gate ' + st(thrE) + ').' : 'Salt the ' + (L.lane.idx === 0 ? 'threshold' : 'side gate threshold') + ' (' + st(thrOf(L.lane)) + ').';
      return salt + ' Light the lantern (' + (hook.lit ? 'done' : hook.hung ? 'unlit' : 'no lantern') + ').';
    };
    L.dynamic = () => {
      if (thr.count) R.add(SC.mkQuad(L, [-1.05, 0.02, 1.6], [1.05, 0.02, 1.6], [1.05, 0.02, 1.92], [-1.05, 0.02, 1.92], [228, 224, 216], { alpha: thr.done ? 0.92 : 0.35 }));
      if (thrE.count) R.add(SC.mkQuad(L, [1.78, 0.02, -0.62], [2.12, 0.02, -0.62], [2.12, 0.02, 0.62], [1.78, 0.02, 0.62], [228, 224, 216], { alpha: thrE.done ? 0.92 : 0.35 }));
      if (hook.hung) R.add(SC.mkSprite(L, 0.78, 1.3, 1.77, 0.3, 0.44, (ctx, P) => { P.lit = hook.lit; ctx.scale(0.3, 0.44); ICONS.lantern(ctx, P); }));
    };
    L.glows = () => { if (!hook.lit) return null; const p = L.pt(0.78, 1.52, 1.77); return [{ x: p[0], y: p[1], z: p[2], r: 2.2 + Math.sin(L.t * 9) * 0.12 + Math.sin(L.t * 23) * 0.05, color: [255, 190, 110], a: 0.22 }]; };
    const lampP = L.pt(0.78, 1.5, 1.77);
    L.dynamicLights = () => hook.lit ? [{ x: lampP[0], y: lampP[1], z: lampP[2], r: 7, i: 0.9, color: [255, 180, 100], flicker: 0.7, seed: 3 }] : [];
    L.floor = { poly: [[-2.1, -1.6], [2.1, -1.6], [2.1, 1.8], [-2.1, 1.8]], y: 0 };
  }
});
