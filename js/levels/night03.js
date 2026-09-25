'use strict';
// ============================================================ 3. THE GRAVEYARD ============================================================
LEVELS.push({
  id: 'graveyard', title: 'The Graveyard', facing: 45, eyeH: 1.65,
  pal: { skyTop: [22, 14, 32], fog: [74, 60, 72], ground: [42, 46, 36], fogDist: 64 },
  ambient: { wind: 0.7, drone: 0.7, droneFreq: 58, windFreq: 300, rain: 0.35 },
  weather: { kind: 'rain', density: 0.45, wind: 0.2, fogRoll: { period: 41, depth: 0.5 } },
  text: {
    intro: 'It has been walking between the graves since dusk, and it has never stopped smiling.',
    hint: 'The old rules for the chapel door: salt across the threshold, and a light beside it.',
    objective: 'Salt the threshold. Light the lantern.',
    death: { default: 'It was still smiling when it stepped over the threshold.' },
    win: 'It stood at the salt line until morning, smiling at you. It never once looked at the lantern.',
  },
  // the porch opening between the two columns, under the lintel
  lanes: [{ deg: 0, name: 'path', barrierDist: 2.6, apertures: [{ z: 1.8, x0: -1.8, x1: 1.8, y0: 0, y1: 3.0 }] }],
  creatures: [{ type: 'smiler', startDist: 95, time: 88, gamma: 0.72, unseenMult: 1.55 }],
  aftermath: { type: 'stand', dur: 4.2 },
  build(L) {
    const stone = [80, 76, 72], stoneD = [58, 54, 52], floor = [66, 62, 58], iron = [30, 30, 32];
    SC.stars(L, 13, 60, 0.35);
    SC.clouds(L, 14, 6, [58, 44, 62], 0.28);
    SC.floorQ(L, -2.2, -1.7, 2.2, 1.9, 0.01, floor, { tex: 'stone', texScale: 1.2 });
    SC.wallV(L, -2.2, -1.7, 2.2, -1.7, 0, 3.4, stone, { tex: 'stone', texScale: 1.6 });
    SC.wallV(L, -0.7, -1.69, 0.7, -1.69, 0, 2.4, [36, 28, 24]);
    SC.wallV(L, -0.03, -1.68, 0.03, -1.68, 0, 2.4, [24, 18, 16]);
    for (let y = 0.4; y < 2.4; y += 0.5) SC.wallV(L, -0.7, -1.68, 0.7, -1.68, y, y + 0.04, [24, 18, 16]);
    SC.wallV(L, -2.2, -1.7, -2.2, 1.9, 0, 3.4, stoneD, { tex: 'stone', texScale: 1.6 });
    SC.wallV(L, 2.2, -1.7, 2.2, 1.9, 0, 3.4, stoneD, { tex: 'stone', texScale: 1.6 });
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
    L.glows = () => { if (!hook.lit) return null; const p = L.pt(0.78, 1.52, 1.77); return [{ x: p[0], y: p[1], z: p[2], r: 2.2 + Math.sin(L.t * 9) * 0.12 + Math.sin(L.t * 23) * 0.05, color: [255, 190, 110], a: 0.22 }]; };
    const lampP = L.pt(0.78, 1.5, 1.77);
    L.dynamicLights = () => hook.lit ? [{ x: lampP[0], y: lampP[1], z: lampP[2], r: 7, i: 0.9, color: [255, 180, 100], flicker: 0.7, seed: 3 }] : [];
    L.floor = { poly: [[-2.1, -1.6], [2.1, -1.6], [2.1, 1.8], [-2.1, 1.8]], y: 0 };
  }
});
