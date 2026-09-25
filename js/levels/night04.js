'use strict';
// ============================================================ 4. THE QUARRY ============================================================
LEVELS.push({
  id: 'quarry', title: 'The Quarry', facing: 270, eyeH: 1.65,
  pal: { skyTop: [96, 102, 112], fog: [152, 156, 160], ground: [64, 66, 58], fogDist: 48 },
  ambient: { wind: 0.9, drone: 0.5, droneFreq: 65, windFreq: 500 },
  weather: { kind: 'mist', density: 1.2, wind: 0.5, fogRoll: { period: 33, depth: 0.4, phase: 2 } },
  text: {
    intro: 'It only moves when nothing is looking at it.<br>It is standing at the far end of the quarry with its hands over its face.',
    hint: 'You will have to look away to find the chain and the lock. Be quick about it.',
    objective: 'Chain and padlock the gate.',
    death: { default: 'You looked away. It only needed a moment.' },
    win: 'You did not look away again until the sun came up. It was still there. It is still there.',
  },
  // the gap between the gate posts, no lintel
  lanes: [{ deg: 0, name: 'gate', barrierDist: 2.95, apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }] }],
  creatures: [{ type: 'watcher', startDist: 50, time: 24, gamma: 0.8, seenMult: 0, unseenMult: 1 }],
  aftermath: { type: 'stand', dur: 3.6 },
  build(L) {
    const stone = [100, 102, 98], stoneD = [72, 74, 72];
    const wallH = 1.5;
    for (const [x0, z0, x1, z1] of [[-3.2, -3, -3.2, 2.6], [3.2, -3, 3.2, 2.6], [-3.2, -3, 3.2, -3], [-3.2, 2.6, -1.2, 2.6], [1.2, 2.6, 3.2, 2.6]])
      SC.box(L, Math.min(x0, x1) - 0.2, Math.max(x0, x1) + 0.2, 0, wallH, Math.min(z0, z1) - 0.2, Math.max(z0, z1) + 0.2, stone, { tex: 'stone', texScale: 1.1 });
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
          if (!gate.chained || gate.closing > 0) { G.say('Wait for it to close.', 'Not yet.'); return false; }
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
    L.floor = { poly: [[-3, -2.8], [3, -2.8], [3, 2.4], [-3, 2.4]], y: 0 };
  }
});
