'use strict';
// ============================================================ 3. THE GRAVEYARD ============================================================
// the bag of sugar: the same paper bag as the salt, but red, with a pale band (it is a decoy, so it is drawn worn on top of that)
Object.assign(ICONS, {
  sugarbag(ctx, P) {
    const paper = P.col([200, 44, 38]), band = P.col([226, 214, 196]), dark = P.col([118, 28, 24]);
    ctx.fillStyle = paper; ctx.beginPath();
    ctx.moveTo(-0.32, 0.02); ctx.lineTo(0.32, 0.02); ctx.lineTo(0.3, 0.72); ctx.quadraticCurveTo(0.22, 0.9, 0.0, 0.92);
    ctx.quadraticCurveTo(-0.22, 0.9, -0.3, 0.72); ctx.closePath(); ctx.fill();
    P_rect(ctx, -0.3, 0.3, 0.6, 0.18, band);
    P_rect(ctx, -0.07, 0.34, 0.14, 0.1, paper);
    P_line(ctx, -0.26, 0.6, 0.26, 0.6, 0.02, dark);
    P_ell(ctx, -0.24, 0.06, 0.15, 0.05, P.col([240, 236, 226]));
  },
});
LEVELS.push({
  id: 'graveyard', title: 'The Graveyard', facing: 45, eyeH: 1.65,
  pal: { skyTop: [22, 14, 32], fog: [74, 60, 72], ground: [42, 46, 36], fogDist: 64 },
  ambient: { wind: 0.7, drone: 0.7, droneFreq: 58, windFreq: 300, rain: 0.35 },
  weather: { kind: 'rain', density: 0.45, wind: 0.2, fogRoll: { period: 41, depth: 0.5 } },
  text: {
    intro: 'It has been walking between the graves since dusk, and it has never stopped smiling.',
    hint: 'The old rules: a line of salt across the doorway and another across the side gate, and a lantern hung by each and lit. The bag holds just enough salt for the two lines.',
    objective: 'Salt both ways in. Light a lantern by each.',
    death: { default: 'It was still smiling when it stepped over the threshold.', open: 'One way in had salt across it. It came in by the other.' },
    win: 'It stood at the salt line until morning, smiling at you. It never once looked at the lanterns.',
    fragment: 'There was a line of salt across the floor in the morning, and no one had been near the kitchen.',
  },
  // the porch opens to the path between the two columns; a side gate in the east wall opens on the graves
  lanes: [
    { deg: 0, name: 'path', barrierDist: 2.6, cue: 'gate', apertures: [{ z: 1.8, x0: -1.8, x1: 1.8, y0: 0, y1: 3.0 }, { z: 3.6, x0: -1.2, x1: 1.2, y0: 0, y1: 99 }], default: true },
    { deg: 90, name: 'side gate', barrierDist: 2.5, cue: 'creak', apertures: [{ z: 3.6, x0: -1.3, x1: 1.3, y0: 0, y1: 99 }] },
  ],
  creatures: [{ type: 'smiler', startDist: 95, time: 88, unseenMult: 1.55 }],
  aftermath: { type: 'stand', dur: 4.2 },
  build(L) {
    const stone = [80, 76, 72], stoneD = [58, 54, 52], floor = [66, 62, 58], iron = [30, 30, 32], post = [42, 38, 34];
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
    // the lantern post by the doorway, its arm reaching in over the porch
    SC.box(L, 0.86, 0.96, 0, 2.0, 1.72, 1.82, post);
    SC.quad(L, [0.7, 1.72, 1.77], [0.96, 1.72, 1.77], [0.96, 1.78, 1.77], [0.7, 1.78, 1.77], post);
    // an iron bracket on the east wall, north of the side gate, its arm reaching in toward you
    SC.box(L, 2.15, 2.2, 1.5, 1.92, 0.94, 1.06, post);
    SC.box(L, 1.86, 2.2, 1.74, 1.79, 0.975, 1.025, post);
    SC.quad(L, [2.16, 1.5, 1.0], [2.16, 1.57, 1.0], [1.96, 1.76, 1.0], [1.93, 1.74, 1.0], post);   // its brace
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
    for (let i = 0; i < 70; i++) { const x = (rng() - 0.5) * 80, z = -20 + Math.pow(rng(), 1.1) * 80; if (Math.abs(x) < 1.6 && z > 1) continue; if (Math.abs(z) < 1.6 && x > 1.2) continue; /* both walking lines stay clear all the way out */ if (Math.abs(x) < 3 && Math.abs(z) < 3) continue; SC.gravestone(L, x, z, (rng() * 1e6) | 0); }
    for (let i = 0; i < 11; i++) { const x = (rng() - 0.5) * 90, z = -10 + rng() * 65; if (Math.abs(x) < 3 || Math.abs(z) < 3) continue; SC.tree(L, x, z, 7 + rng() * 6, 'bare', (rng() * 1e6) | 0); }
    SC.groundDots(L, 17, 90, 3, 45, 120, [30, 34, 26], 0.4);
    // items: one bag of salt with just enough for the two lines, a red bag of sugar that looks the part from a distance,
    // two lanterns and the matches (kept: one box lights both)
    mkItem(L, 'salt', 'Bag of salt', [
      { deg: 225, dist: 1.6, y: 0 },                    // south-west
      { x: 1.25, y: 0, z: -1.2 },                       // south-east
      { x: -1.3, y: 0, z: -0.45 },                      // in front of the bench
      { x: -1.4, y: 0, z: 1.15 },                       // by the west column
      { x: -1.9, y: 0.5, z: -0.3, jitter: 0.05 },       // on the bench
    ], { w: 0.34, h: 0.42, flat: true, uses: 2 });
    mkItem(L, 'sugar', 'Bag of salt', [{ x: 0.9, y: 0, z: 0.9 }, { x: -0.5, y: 0, z: -1.3 }],
      { w: 0.34, h: 0.42, flat: true, uses: 2, icon: 'sugarbag', decoy: true, decoyText: 'Sugar. It would hold nothing back.' });
    mkItem(L, 'matches', 'Matches', [
      { x: 2.05, y: 1.16, z: -1.15, flat: false },      // on the ledge
      { x: -1.9, y: 0.5, z: -1.0, flat: false, jitter: 0 }, // on the bench
      { x: 1.35, y: 0, z: -1.35, flat: true },          // on the floor, south-east
      { x: 1.5, y: 0, z: 1.0, flat: true },             // on the floor, by the east column
    ], { w: 0.16, h: 0.16, tool: true });
    const lanternSpots = [
      { x: -1.4, y: 0, z: 0.55 },                       // west, past the end of the bench
      { x: 0.55, y: 0, z: -1.4 },                       // beside the chapel door
      { x: 1.5, y: 0, z: -1.25 },                       // by the side gate
      { x: -1.55, y: 0, z: 1.25 },                      // by the west column
      { x: 1.3, y: 0, z: 1.4 },                         // by the east column
      { x: 2.06, y: 1.16, z: -1.3, jitter: 0 },         // on the ledge
      { x: -0.6, y: 0, z: 1.0 },                        // on the porch, beside the path
    ];
    const lanterns = ['lantern', 'lantern2'];
    for (const id of lanterns) mkItem(L, id, 'Lantern', lanternSpots, { w: 0.3, h: 0.44, icon: 'lantern' });
    // the two ways in: each takes one pour of salt, and a line once poured is done
    const mkThreshold = (id, name, deg, dist, w) => {
      const t = mkTarget(L, {
        id, name, deg, dist, y: 0.0, w, h: 0.55, flat: true, accepts: ['salt', 'sugar'],
        hint() { return t.done ? 'A line of salt across it. It will hold.' : 'Bare stone. A line of salt would go across it.'; },
        onClick() {
          if (t.done) { G.say(t.hint(), 'A line of salt runs across it.'); return true; }
          if (!G.inv.some(i => t.accepts.includes(i.id))) { G.say(t.hint(), 'Bare stone. Nothing across it.'); AUDIO.sfx('nope'); return true; }
          return false;
        },
        use() { if (t.done) return false; t.count = 1; t.done = true; t.accepts = []; AUDIO.sfx('pour'); return true; },
      });
      return t;
    };
    const thr = mkThreshold('threshold', 'Doorway', 0, 1.75, 2.2), thrE = mkThreshold('sidethreshold', 'Side gate', 90, 1.95, 1.3);
    const thrOf = lane => lane.idx === 0 ? thr : thrE;
    L.sealed = lane => thrOf(lane).done;   // a salted way holds it; it goes round to the other if that one is bare
    // a hook by each way in: hang a lantern on it, then light it
    const mkHook = (id, x, z, seed) => {
      const h = mkTarget(L, {
        id, name: 'Lantern hook', x, y: 1.35, z, w: 0.36, h: 0.5, accepts: lanterns.slice(), hung: null, lit: false, seed,
        hint() { return h.lit ? 'The lantern is burning.' : h.hung ? 'The lantern hangs here, unlit. It needs a match.' : 'An empty hook. A lantern hangs here.'; },
        onClick() {
          if (h.lit) { G.say(h.hint(), 'The lantern is burning.'); return true; }
          if (!G.inv.some(i => h.accepts.includes(i.id))) { G.say(h.hint(), h.hung ? 'The lantern hangs dark.' : 'An empty hook.'); AUDIO.sfx('nope'); return true; }
          return false;
        },
        use(item) {
          if (!h.hung && lanterns.includes(item.id)) { h.hung = item.id; h.accepts = ['matches']; AUDIO.sfx('chain'); return true; }
          if (item.id === 'matches' && h.hung && !h.lit) { h.lit = true; h.done = true; h.accepts = []; AUDIO.sfx('strike'); setTimeout(() => AUDIO.sfx('candle'), 300); return true; }
          return false;
        },
      });
      return h;
    };
    const hook = mkHook('hook', 0.78, 1.77, 3), hookE = mkHook('hookE', 1.92, 1.0, 7);
    const hooks = [hook, hookE];
    L.isWon = () => thr.done && thrE.done && hook.lit && hookE.lit;
    L.objectiveText = () => {
      const s = t => t.done ? 'salted' : 'bare';
      const l = h => h.lit ? 'lit' : h.hung ? 'hung, not lit' : 'no lantern';
      return 'Doorway: ' + s(thr) + ', ' + l(hook) + '. Side gate: ' + s(thrE) + ', ' + l(hookE) + '.';
    };
    const hookCol = [92, 86, 78];
    L.dynamic = () => {
      if (thr.done) R.add(SC.mkQuad(L, [-1.05, 0.02, 1.6], [1.05, 0.02, 1.6], [1.05, 0.02, 1.92], [-1.05, 0.02, 1.92], [228, 224, 216], { alpha: 0.92 }));
      if (thrE.done) R.add(SC.mkQuad(L, [1.78, 0.02, -0.62], [2.12, 0.02, -0.62], [2.12, 0.02, 0.62], [1.78, 0.02, 0.62], [228, 224, 216], { alpha: 0.92 }));
      for (const h of hooks) {
        const [x, , z] = h.local, d = Math.hypot(x, z);
        if (h.hung) R.add(SC.mkSprite(L, x, 1.3, z, 0.3, 0.44, (ctx, P) => { P.lit = h.lit; ctx.scale(0.3, 0.44); ICONS.lantern(ctx, P); }, { sortDist: d - 0.2 }));
        else R.add(SC.mkSprite(L, x, 1.55, z, 0.1, 0.18, (ctx, P) => {   // the bare hook, hanging from the arm
          P_limb(ctx, [[0, 0.18], [0, 0.05], [0.012, 0.01], [0.036, 0.0], [0.05, 0.02], [0.052, 0.05]], 0.018, P.col(hookCol));
        }, { sortDist: d - 0.2 }));
      }
    };
    L.glows = () => hooks.filter(h => h.lit).map(h => {
      const p = L.pt(h.local[0], 1.52, h.local[2]);
      return { x: p[0], y: p[1], z: p[2], r: 2.2 + Math.sin(L.t * 9 + h.seed) * 0.12 + Math.sin(L.t * 23 + h.seed) * 0.05, color: [255, 190, 110], a: 0.22 };
    });
    const lampP = hooks.map(h => L.pt(h.local[0], 1.5, h.local[2]));
    L.dynamicLights = () => hooks.filter(h => h.lit).map(h => { const p = lampP[hooks.indexOf(h)]; return { x: p[0], y: p[1], z: p[2], r: 6, i: 0.5, color: [255, 180, 100], flicker: 0.7, seed: h.seed }; });
    L.deathCause = () => (thr.done || thrE.done) ? 'open' : 'default';
    L.floor = { poly: [[-2.1, -1.6], [2.1, -1.6], [2.1, 1.8], [-2.1, 1.8]], y: 0 };
  }
});
