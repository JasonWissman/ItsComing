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
    fragment: 'You kept your eyes open so long they hurt in the morning. Something in the corner of the room had not moved. You are almost sure.',
  },
  // the gap between the gate posts, no lintel; a second gap in the wall behind you
  lanes: [
    { deg: 0, name: 'gate', barrierDist: 2.95, cue: 'chain', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }], default: true },
    { deg: 180, name: 'back gate', barrierDist: 2.95, cue: 'gate', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }] },
  ],
  creatures: [{ type: 'watcher', startDist: 50, time: 30, gamma: 0.8, seenMult: 0, unseenMult: 1 }],
  aftermath: { type: 'stand', dur: 3.6 },
  build(L) {
    const s = L.s;
    const stone = [100, 102, 98], stoneD = [72, 74, 72];
    const wallH = 1.5;
    for (const [x0, z0, x1, z1] of [[-3.2, -2.6, -3.2, 2.6], [3.2, -2.6, 3.2, 2.6], [-3.2, -2.6, -1.2, -2.6], [1.2, -2.6, 3.2, -2.6], [-3.2, 2.6, -1.2, 2.6], [1.2, 2.6, 3.2, 2.6]])
      SC.box(L, Math.min(x0, x1) - 0.2, Math.max(x0, x1) + 0.2, 0, wallH, Math.min(z0, z1) - 0.2, Math.max(z0, z1) + 0.2, stone, { tex: 'stone', texScale: 1.1 });
    for (const z of [2.6, -2.6]) { SC.box(L, -1.35, -1.05, 0, 2.1, z - 0.15, z + 0.15, stoneD); SC.box(L, 1.05, 1.35, 0, 2.1, z - 0.15, z + 0.15, stoneD); }
    SC.box(L, -0.5, 0.6, 0.4, 0.48, -1.9, -1.5, [72, 62, 50]);
    STORY.lamp(L, 0.4, 0.48, -1.7, { scale: 0.8 });
    for (const [x, z] of [[-0.45, -1.85], [0.55, -1.85], [-0.45, -1.55], [0.55, -1.55]]) SC.box(L, x - 0.03, x + 0.03, 0, 0.4, z - 0.03, z + 0.03, [60, 50, 40]);
    SC.groundDots(L, 23, 90, 0.8, 3.0, 360, [50, 56, 40], 0.07);
    const rng = mulberry32(41);
    for (let i = 0; i < 28; i++) { const x = (rng() - 0.5) * 70, z = 5 + Math.pow(rng(), 1.2) * 45; if (Math.abs(x) < 1.8 && z < 25) continue; SC.boulder(L, x, z, 0.6 + rng() * 1.8, (rng() * 1e6) | 0); }
    for (let i = 0; i < 24; i++) { const x = (rng() - 0.5) * 70, z = -5 - Math.pow(rng(), 1.2) * 45; if (Math.abs(x) < 1.8 && z > -25) continue; SC.boulder(L, x, z, 0.6 + rng() * 1.8, (rng() * 1e6) | 0); }
    SC.wallV(L, -140, 64, 140, 64, 0, 30, [90, 94, 96]);
    SC.wallV(L, -140, -62, 140, -62, 0, 24, [88, 92, 94]);
    for (let i = 0; i < 12; i++) { const x = (rng() - 0.5) * 60, z = (rng() < 0.5 ? 1 : -1) * (8 + rng() * 40); if (Math.abs(x) < 3) continue; SC.tree(L, x, z, 5 + rng() * 5, 'bare', (rng() * 1e6) | 0); }
    SC.groundDots(L, 29, 100, 3, 50, 360, [52, 54, 46], 0.5);
    const bracket = (L, sp) => SC.box(L, Math.min(sp.x, sp.bx), Math.max(sp.x, sp.bx), 0.9, 0.96, Math.min(sp.z, sp.bz), Math.max(sp.z, sp.bz), stoneD);
    const decoy = !!L.diff.decoys, keyed = L.diff.tier >= 2, both = L.diff.tier >= 3;
    mkItem(L, 'chain', 'Chain', [
      { x: 2.92, y: 0.85, z: 0.3, bx: 2.6, bz: 0.5, setup: bracket },     // hanging on the east wall
      { x: -2.92, y: 0.85, z: -0.6, bx: -2.6, bz: -0.4, setup: bracket }, // hanging on the west wall
      { x: 2.0, y: 0.85, z: -2.42, bx: 2.2, bz: -2.1, setup: bracket },   // hanging on the back wall
      { x: 1.9, y: 0, z: -0.5, flat: true },                               // coiled on the ground
    ], { w: 0.6, h: 0.75, uses: both ? 2 : 1 });
    mkItem(L, 'padlock', 'Padlock', [
      { deg: 150, dist: 1.7, y: 0 },                    // south-south-east
      { x: 1.5, y: 0, z: 1.5 },                         // north-east
      { x: -1.7, y: 0, z: 1.2 },                        // north-west
      { x: -1.8, y: 0, z: -0.4 },                       // west
    ], { w: 0.22, h: 0.26, flat: true, uses: both ? 2 : 1 });
    if (keyed) mkItem(L, 'gatekey', 'Key', [
      { x: 0.05, y: 0.48, z: -1.7 },                    // on the table
      { x: -2.6, y: 0, z: 1.9 },                        // north-west corner
      { x: 2.5, y: 0, z: -1.3 },                        // south-east
      { x: -0.9, y: 0, z: 2.1 },                        // by the gate post
    ], { w: 0.16, h: 0.16, flat: true, tool: true, icon: 'keys' });
    if (decoy) mkItem(L, 'oldlock', 'Padlock', [{ x: 0.9, y: 0, z: 1.6 }, { x: -2.4, y: 0, z: -1.6 }], { w: 0.22, h: 0.26, flat: true, icon: 'padlock', decoy: true, decoyText: 'Rusted solid. The shackle will not move.' });
    mkItem(L, 'rope', 'Rotten rope', [
      { deg: 120, dist: 1.9, y: 0 },
      { x: -0.9, y: 0, z: 1.9 },
      { x: 1.7, y: 0, z: 0.9 },
    ], { w: 0.4, h: 0.3, flat: true });
    const mkGate = (id, name, deg, sign) => {
      const t = mkTarget(L, {
        id, name, deg, dist: 2.6, y: 0, w: 2.3, h: 2.0, accepts: ['chain'], chained: false, locked: false, closing: 0, angle: Math.PI / 2, sign,
        hint() { return t.locked ? 'Chained and locked.' : t.chained ? (t.closing > 0 ? 'Closing.' : 'Chained. It needs a lock.') : 'The gate stands open.'; },
        use(item) {
          if (item.id === 'chain') { t.chained = true; t.closing = 1.0; t.accepts = ['padlock'].concat(decoy ? ['oldlock'] : []); AUDIO.sfx('creak'); return true; }
          if (item.id === 'padlock') {
            if (!t.chained || t.closing > 0) { G.say('Wait for it to close.', 'Not yet.'); return false; }
            if (keyed && !G.hasItem('gatekey')) { G.say('The padlock is shut. It wants its key.', 'It is shut.'); return false; }
            t.locked = true; t.done = true; t.accepts = []; AUDIO.sfx('lock'); return true;
          }
          return false;
        },
      });
      return t;
    };
    const gate = mkGate('gate', 'Gate', 0, 1), gate2 = mkGate('backgate', 'Back gate', 180, -1);
    const gateOf = lane => lane.idx === 0 ? gate : gate2;
    L.update = dt => {
      for (const g of [gate, gate2]) if (g.closing > 0) {
        g.closing -= dt;
        g.angle = (Math.PI / 2) * Math.pow(clamp(g.closing, 0, 1), 1.4);
        if (g.closing <= 0) { g.angle = 0; AUDIO.sfx('gate'); AUDIO.sfx('chain'); G.shake(0.2); }
      }
    };
    L.dynamic = () => {
      for (const g of [gate, gate2]) {
        const a = g.angle, sg = g.sign, dx = sg * Math.cos(a), dz = sg * Math.sin(a), hx = -1.05 * sg, hz = 2.6 * sg, len = 2.1, ironC = [38, 38, 42];
        for (let i = 0; i <= 7; i++) { const u = i / 7 * len; R.add(SC.mkWallV(L, hx + dx * (u - 0.025), hz + dz * (u - 0.025), hx + dx * (u + 0.025), hz + dz * (u + 0.025), 0, 1.9, ironC)); }
        for (const yy of [0.3, 1.0, 1.65]) R.add(SC.mkWallV(L, hx, hz, hx + dx * len, hz + dz * len, yy - 0.03, yy + 0.03, ironC));
        if (g.chained && g.closing <= 0) R.add(iconSprite(L, 'chain', 0.95 * sg, 0.72, 2.58 * sg, 0.55, 0.6));
        if (g.locked) R.add(iconSprite(L, 'padlock', 1.0 * sg, 0.5, 2.57 * sg, 0.2, 0.24));
      }
    };
    L.isWon = () => L.tier(gateOf(L.lane).locked, gateOf(L.lane).locked, gate.locked && gate2.locked);
    L.objectiveText = () => {
      const st = g => g.locked ? 'locked' : g.chained ? 'chained, needs the padlock' : 'open';
      return (both ? 'Chain and padlock both gates (gate ' + st(gate) + ', back gate ' + st(gate2) + ').' : 'Chain and padlock the ' + gateOf(L.lane).name.toLowerCase() + ' (' + st(gateOf(L.lane)) + ').') + (keyed ? ' The padlock needs its key.' : '') + (gateOf(L.lane).locked ? ' Do not look away.' : '');
    };
    L.floor = { poly: [[-3, -2.4], [3, -2.4], [3, 2.4], [-3, 2.4]], y: 0 };
  }
});
