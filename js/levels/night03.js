'use strict';
// ============================================================ 3. THE GRAVEYARD ============================================================
// the bag of sugar: the same paper bag as the salt, but red, with a pale band (it is a decoy, so it is drawn worn on top of
// that: the red is strong enough to stay red, not rust, after the worn look drains it, in the world and in the hand)
Object.assign(ICONS, {
  sugarbag(ctx, P) {
    const paper = P.col([228, 26, 22]), band = P.col([226, 214, 196]), dark = P.col([136, 14, 12]);
    ctx.fillStyle = paper; ctx.beginPath();
    ctx.moveTo(-0.32, 0.02); ctx.lineTo(0.32, 0.02); ctx.lineTo(0.3, 0.72); ctx.quadraticCurveTo(0.22, 0.9, 0.0, 0.92);
    ctx.quadraticCurveTo(-0.22, 0.9, -0.3, 0.72); ctx.closePath(); ctx.fill();
    P_rect(ctx, -0.3, 0.3, 0.6, 0.18, band);
    P_rect(ctx, -0.07, 0.34, 0.14, 0.1, paper);
    P_line(ctx, -0.26, 0.6, 0.26, 0.6, 0.02, dark);
    P_ell(ctx, -0.24, 0.06, 0.15, 0.05, P.col([240, 236, 226]));
  },
  // a lantern hung on its hook: the lantern you carried, its iron frame kept dark (the porch lights do not tint it) and, once
  // lit, its glass glowing amber round the flame, so a hung lantern and a burning one read apart at a glance
  hunglantern(ctx, P) {
    const lit = P.lit === true, frame = P.col([30, 28, 30]);
    P_rect(ctx, -0.22, 0.1, 0.44, 0.62, lit ? P.raw([214, 146, 68]) : P.col([90, 84, 70]));   // the glass
    if (lit) {
      const g = ctx.createRadialGradient(0, 0.5, 0.02, 0, 0.5, 0.36);
      g.addColorStop(0, 'rgba(255,238,178,0.95)'); g.addColorStop(1, 'rgba(255,196,104,0)');
      ctx.fillStyle = g; ctx.fillRect(-0.22, 0.1, 0.44, 0.62);
    }
    P_rect(ctx, -0.07, 0.14, 0.14, 0.28, lit ? P.raw([255, 240, 206]) : P.col([230, 224, 200]));   // the candle
    P_line(ctx, 0, 0.42, 0, 0.47, 0.02, frame);
    if (lit) P_ell(ctx, 0, 0.53 + Math.sin(P.t * 23) * 0.01, 0.035, 0.07 + Math.sin(P.t * 17) * 0.012, P.raw([255, 248, 214]));
    P_rect(ctx, -0.26, 0.05, 0.52, 0.06, frame); P_rect(ctx, -0.26, 0.7, 0.52, 0.07, frame);   // the base and the cap, over the glass
    for (const x of [-0.24, 0.24]) P_rect(ctx, x - 0.025, 0.1, 0.05, 0.62, frame);
    ctx.strokeStyle = frame; ctx.lineWidth = 0.04; ctx.beginPath(); ctx.arc(0, 0.78, 0.14, Math.PI, 0, true); ctx.stroke();   // the handle, on the hook
  },
});
LEVELS.push({
  id: 'graveyard', title: 'The Graveyard', facing: 45, eyeH: 1.65,
  pal: { skyTop: [22, 14, 32], fog: [74, 60, 72], ground: [42, 46, 36], fogDist: 64 },
  ambient: { tune: 'ambient:3', wind: 0.7, drone: 0.7, droneFreq: 58, windFreq: 300, rain: 0.35 },
  weather: { kind: 'rain', density: 0.45, wind: 0.2, fogRoll: { period: 41, depth: 0.5 } },
  text: {
    intro: 'Someone has been walking in the graveyard since dusk.',
    hint: 'The old rules: a line of salt across the doorway and another across the side gate, and a lantern hung by each and lit. The bag holds just enough salt for the two lines.',
    objective: 'Salt both ways in. Light a lantern by each.',
    death: { default: 'It was still smiling when it stepped over the threshold.', open: 'It came through the open entrance.', unlit: 'The salt alone did not stop it. It loves the darkness.' },
    win: 'It dared not cross.',
    egg: 'Give it a sugar rush.',   // this night's easter egg, as the Scores' list names it once found (game.js: foundEgg)
  },
  // the porch opens to the path between the two columns; a side gate in the east wall opens on the graves
  lanes: [
    { deg: 0, name: 'path', barrierDist: 2.6, cue: 'gate', apertures: [{ z: 1.8, x0: -1.8, x1: 1.8, y0: 0, y1: 3.0 }, { z: 3.6, x0: -1.2, x1: 1.2, y0: 0, y1: 99 }], default: true },
    { deg: 90, name: 'side gate', barrierDist: 2.5, cue: 'creak', apertures: [{ z: 3.6, x0: -1.3, x1: 1.3, y0: 0, y1: 99 }] },
  ],
  // a salt line stops it; it goes round to the other way on its feet while that one is weaker (L.roundOpen; game.js: the smiler can run)
  creatures: [{ type: 'smiler', startDist: 95, time: 88, unseenMult: 1.55 }],
  // the aftermath is the night's own (L.aftermath in build): it comes to the salt line, looks down at it, and walks away
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
    // the ledge and the bench are sorted as one piece each, after the wall behind them and before anything standing on them:
    // by their own middles, a lantern at the back of the ledge or the matches at the far end of the bench sorted behind
    // the top they stand on and were drawn under it, and a leg sorted in front of the bench top
    SC.box(L, 1.95, 2.2, 1.1, 1.16, -1.55, -0.75, stoneD, { sortDist: 2.48 });   // ledge on the east wall, beside the side gate (the wall behind sorts at 2.53)
    for (const z of [-1.45, -0.91]) SC.box(L, 2.06, 2.2, 0.98, 1.1, z, z + 0.06, stoneD, { sortDist: 2.5 });   // the two corbels it rests on
    SC.box(L, -2.15, -1.6, 0.42, 0.5, -1.2, 0.2, [62, 50, 40], { sortDist: 2.45 });   // bench on the west (the wall behind sorts at 2.84)
    for (const z of [-1.1, 0.0]) SC.box(L, -2.08, -1.67, 0, 0.42, z, z + 0.1, [46, 37, 30], { sortDist: 2.6 });   // and its two legs, set in from the ends
    // the lantern post by the doorway, its arm reaching in over the porch
    SC.box(L, 0.86, 0.96, 0, 2.0, 1.72, 1.82, post);
    SC.quad(L, [0.7, 1.72, 1.77], [0.96, 1.72, 1.77], [0.96, 1.78, 1.77], [0.7, 1.78, 1.77], post);
    // an iron bracket on the east wall, north of the side gate, its arm reaching in toward you
    SC.box(L, 2.15, 2.2, 1.5, 1.92, 0.94, 1.06, post);
    SC.box(L, 1.86, 2.2, 1.74, 1.79, 0.975, 1.025, post);
    SC.quad(L, [2.16, 1.5, 1.0], [2.16, 1.57, 1.0], [1.96, 1.76, 1.0], [1.93, 1.74, 1.0], post);   // its brace
    SC.floorQ(L, -0.9, 1.9, 0.9, 30, 0.012, [60, 58, 52]);
    SC.floorQ(L, 2.2, -0.7, 30, 0.7, 0.012, [60, 58, 52]);
    // the iron fence round the churchyard, with gaps where the path and the side path go through. Its two rails are built
    // in short lengths (longer further out), each sorted by its own distance: one rail many metres long sorts by its middle,
    // so the gravestones just behind it were drawn over it
    const fz = 3.6;
    const rails = (ax, az, bx, bz) => {
      const len = Math.hypot(bx - ax, bz - az);
      for (let s = 0; s < len - 1e-6;) {
        const t0 = s / len, x = ax + (bx - ax) * t0, z = az + (bz - az) * t0;
        s = Math.min(len, s + Math.max(0.36, Math.hypot(x, z) * 0.05));
        const t1 = s / len, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
        SC.wallV(L, x, z, x1, z1, 1.3, 1.36, iron); SC.wallV(L, x, z, x1, z1, 0.25, 0.3, iron);
      }
    };
    for (const [x0, x1] of [[-16, -1.2], [1.2, 16]]) {
      for (let x = x0; x <= x1; x += 0.36) SC.wallV(L, x, fz, x + 0.04, fz, 0, 1.5, iron);
      if (x0 < 0) rails(x1, fz, x0, fz); else rails(x0, fz, x1, fz);   // from the gap outward
    }
    for (const [z0, z1] of [[-16, -1.3], [1.3, 3.6]]) {
      for (let z = z0; z <= z1; z += 0.36) SC.wallV(L, fz, z, fz, z + 0.04, 0, 1.5, iron);
      if (z0 < 0) rails(fz, z1, fz, z0); else rails(fz, z0, fz, z1);
    }
    for (const [x, z] of [[-1.3, fz], [1.3, fz], [fz, -1.4], [fz, 1.4]]) SC.box(L, x - 0.12, x + 0.12, 0, 1.7, z - 0.12, z + 0.12, [40, 40, 42]);
    const rng = mulberry32(31);
    const yard = [];   // what stands out there, [x, z, the berth it is given]: the thing's wild run goes round them (the easter egg, below)
    for (let i = 0; i < 70; i++) { const x = (rng() - 0.5) * 80, z = -20 + Math.pow(rng(), 1.1) * 80; if (Math.abs(x) < 1.6 && z > 1) continue; if (Math.abs(z) < 1.6 && x > 1.2) continue; /* both walking lines stay clear all the way out */ if (Math.abs(x) < 3 && Math.abs(z) < 3) continue; SC.gravestone(L, x, z, (rng() * 1e6) | 0); yard.push([x, z, 0.85]); }
    for (let i = 0; i < 11; i++) { const x = (rng() - 0.5) * 90, z = -10 + rng() * 65; if (Math.abs(x) < 3 || Math.abs(z) < 3) continue; SC.tree(L, x, z, 7 + rng() * 6, 'bare', (rng() * 1e6) | 0); yard.push([x, z, 1.3]); }
    // dark patches in the grass ahead: the same scatter SC.groundDots(L, 17, 90, 3, 45, 120, ...) makes, less the ones that
    // would lie on the pale path and read as dashes across it
    const drng = mulberry32(17);
    for (let i = 0; i < 90; i++) {
      const a = (drng() - 0.5) * 120 * DEG, d = 3 + Math.pow(drng(), 1.5) * 42;
      const x = Math.sin(a) * d, z = Math.cos(a) * d, s = 0.4 * (0.5 + drng());
      if (Math.abs(x) < 0.9 + s + 0.1) continue;
      SC.floorQ(L, x - s, z - s * 0.4, x + s, z + s * 0.4, 0.008, [30, 34, 26]);
    }
    // items: one bag of salt with just enough for the two lines, a red bag of sugar that looks the part from a distance,
    // two lanterns and the matches (kept: one box lights both)
    // in the hand (js/hands.js): a bag carried by its gathered neck, hanging from the fist, the sugar as the salt; the box of
    // matches between finger and thumb, big enough to read; a lantern hanging by its bail
    const bagHeld = { grip: 'fist', at: [0, 0.84], axis: Math.PI / 2, angle: 0.1, size: 0.25 };
    mkItem(L, 'salt', 'Bag of salt', [
      { deg: 225, dist: 1.6, y: 0 },                    // south-west
      { x: 1.25, y: 0, z: -1.2 },                       // south-east
      { x: -1.3, y: 0, z: -0.45 },                      // in front of the bench
      { x: -1.4, y: 0, z: 1.15 },                       // by the west column
      { x: -1.9, y: 0.5, z: -0.3, jitter: 0.05 },       // on the bench
    ], { w: 0.34, h: 0.42, flat: true, uses: 2, held: bagHeld });
    mkItem(L, 'sugar', 'Bag of salt', [{ x: 0.9, y: 0, z: 0.9 }, { x: -0.5, y: 0, z: -1.3 }],
      { w: 0.34, h: 0.42, flat: true, uses: 2, icon: 'sugarbag', decoy: true, decoyText: 'Sugar. It dissolves instantly.', held: bagHeld });
    mkItem(L, 'matches', 'Matches', [
      { x: 2.05, y: 1.16, z: -1.15, flat: false },      // on the ledge
      { x: -1.9, y: 0.5, z: -1.0, flat: false, jitter: 0 }, // on the bench
      { x: 1.35, y: 0, z: -1.35, flat: true },          // on the floor, south-east
      { x: 1.5, y: 0, z: 1.0, flat: true },             // on the floor, by the east column
    ], { w: 0.2, h: 0.2, tool: true, held: { grip: 'pinch', at: [-0.3, 0.3], angle: -0.25, size: 0.15 } });   // the size of the night 2 keys: at 0.16 the box was a red speck on the floor
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
    for (const id of lanterns) mkItem(L, id, 'Lantern', lanternSpots, { w: 0.3, h: 0.44, icon: 'lantern', held: { size: 0.3 } });
    // the two ways in: each takes one pour of salt, and a line once poured is done. Each is the pale slab across its way
    // (slab: x0, z0, x1, z1), built here, and the night gives it its own hit area, an invisible quad the size of the slab,
    // so what you point at is the slab seen from any side (a flat target's default box turns with the view and sat half
    // off the slab); hidden keeps that default box out. Pointed at, the slab glows, and the salt on it. A poured line runs
    // along the middle of the slab, the long way (line: its middle, its direction and its length).
    const corners = (x0, z0, x1, z1) => (Math.hypot(x0, z0) + Math.hypot(x1, z0) + Math.hypot(x1, z1) + Math.hypot(x0, z1)) / 4;   // a floor quad's sort distance
    const saltLine = (cx, cz, ux, uz, len, sd, seed) => {   // one flat band along (ux, uz), its edges a little uneven, as poured
      const r = mulberry32(seed), nx = -uz, nz = ux, N = 10, top = [], bot = [];
      const at = (s, n) => L.pt(cx + ux * s + nx * n, 0.02, cz + uz * s + nz * n);
      for (let k = 0; k <= N; k++) {
        const s = -len / 2 + len * k / N, end = k === 0 || k === N ? 0.55 : 1;   // the ends taper where the pour began and stopped
        top.push(at(s, (0.05 + r() * 0.022) * end)); bot.push(at(s, -(0.05 + r() * 0.022) * end));
      }
      return { kind: 'poly', pts: top.concat(bot.reverse()), color: [232, 228, 220], layer: 0, sortDist: sd };
    };
    const mkThreshold = (id, name, slab, line) => {
      const [x0, z0, x1, z1] = slab, sd = corners(x0, z0, x1, z1);
      const slabArt = SC.grab(L, () => SC.floorQ(L, x0, z0, x1, z1, 0.015, [84, 80, 74]));
      const t = mkTarget(L, {
        id, name, x: (x0 + x1) / 2, y: 0, z: (z0 + z1) / 2, w: x1 - x0, h: z1 - z0, flat: true, hidden: true, accepts: ['salt', 'sugar'],
        hint() { return t.done ? 'A line of salt across it. It will hold.' : 'Bare stone. A line of salt would go across it.'; },
        // what will not do is tried there (below, "what will not do"): a bag over a line already poured is tipped and
        // taken back; anything else is set on the stone and lifted again; the empty hand brushes the stone
        onClick() {
          if (t.done) { if (!again(t)) { G.say(t.hint(), 'A line of salt runs across it.'); refuseStone(t); } return true; }
          if (!G.inv.some(i => t.accepts.includes(i.id))) { if (!again(t)) { G.say(t.hint(), 'Bare stone. Nothing across it.'); refuseStone(t); } return true; }
          return false;
        },
        onDecoy(item) { pourSugar(t, item); },   // the sugar: poured across it, and the wind takes it off the stone
        use() { if (t.done) return false; t.count = 1; t.done = true; t.accepts = []; AUDIO.sfx('pour'); return true; },
      });
      t.line = line; t.sd = sd;
      t.hitQuad = SC.mkQuad(L, [x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1], [255, 240, 210], { layer: 0, sortDist: sd - 0.02, invisible: true, hit: { kind: 'target', ref: t } });
      t.lift = SC.mkQuad(L, [x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1], [255, 240, 210], { layer: 0, sortDist: sd - 0.005, alpha: 0.1, noFog: true, noLight: true });   // the slab lifts a little under the cursor
      t.salt = saltLine(line[0], line[1], line[2], line[3], line[4], sd - 0.01, id.length * 7 + 3);
      glowWith(t, slabArt.concat(t.salt));
      return t;
    };
    const thr = mkThreshold('threshold', 'Doorway', [-1.15, 1.58, 1.15, 1.94], [0, 1.77, 1, 0, 2.16]);
    const thrE = mkThreshold('sidethreshold', 'Side gate', [1.75, -0.7, 2.25, 0.7], [2.0, 0, 0, 1, 1.32]);
    const thrOf = lane => lane.idx === 0 ? thr : thrE;
    // A salt line stops it, and it looks down at the salt. A way is only finished with its lantern lit as well: it goes round
    // to the other way whenever that one is weaker than this (bare, or a lantern alone, which it never looks at: 0; salt
    // with its lantern dark: 1; salt and a lit lantern: 2), and is stopped for good only once both are finished (won).
    // Where it has nowhere weaker to go, a line with no light by it holds it only a while (L.update): it steps over.
    const strength = lane => !thrOf(lane).done ? 0 : hookOf(lane).lit ? 2 : 1;
    L.sealed = lane => thrOf(lane).done && L.s.crossed !== lane.idx;
    L.roundOpen = (lane, c) => strength(lane) < strength(c.lane);
    // a hook by each way in: hang a lantern on it, then light it. Its box runs from the bottom of a hung lantern up to the arm
    const mkHook = (id, x, z, seed) => {
      const h = mkTarget(L, {
        id, name: 'Lantern hook', x, y: 1.26, z, w: 0.36, h: 0.52, accepts: lanterns.slice(), hung: null, lit: false, seed,
        hint() { return h.lit ? 'The lantern is burning.' : h.hung ? 'The lantern hangs here, unlit. It needs a match.' : 'An empty hook. A lantern hangs here.'; },
        // what will not do is tried there (below, "what will not do"): a match struck at an empty hook flares and is shaken
        // out; anything else knocks against the hook or the lantern and sets it swinging, as the empty hand does
        onClick() {
          if (h.lit) { if (!again(h)) { G.say(h.hint(), 'The lantern is burning.'); refuseHook(h); } return true; }
          if (!G.inv.some(i => h.accepts.includes(i.id))) { if (!again(h)) { G.say(h.hint(), h.hung ? 'The lantern hangs dark.' : 'An empty hook.'); refuseHook(h); } return true; }
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
    const hooks = [hook, hookE], hookOf = lane => lane.idx === 0 ? hook : hookE;
    L.isWon = () => thr.done && thrE.done && hook.lit && hookE.lit;
    L.objectiveText = () => {
      const s = t => t.done ? 'salted' : 'bare';
      const l = h => h.lit ? 'lit' : h.hung ? 'hung, not lit' : 'no lantern';
      return 'Doorway: ' + s(thr) + ', ' + l(hook) + '. Side gate: ' + s(thrE) + ', ' + l(hookE) + '.';
    };
    const hookCol = [100, 94, 86];
    for (const h of hooks) {
      const [x, , z] = h.local, d = Math.hypot(x, z);
      // the hung lantern keeps its own colours (noLight): under its own light and the other's, frame and glass washed out to one orange
      // (each swings about where it hangs when something knocks it: swingOf, below)
      h.lanternSprite = SC.mkSprite(L, x, 1.3, z, 0.3, 0.44, (ctx, P) => { P.lit = h.lit; swingAbout(ctx, swingOf(h), 0.405); ctx.scale(0.3, 0.44); ICONS.hunglantern(ctx, P); }, { sortDist: d - 0.2, noLight: true });
      h.hookSprite = SC.mkSprite(L, x, 1.55, z, 0.14, 0.19, (ctx, P) => {   // the bare hook: a ring round the arm, a shank and an open curl
        const c = P.col(hookCol);
        swingAbout(ctx, swingOf(h) * 0.6, 0.172);
        ctx.strokeStyle = c; ctx.lineWidth = 0.011; ctx.beginPath(); ctx.arc(0, 0.172, 0.017, 0, TAU); ctx.stroke();
        P_limb(ctx, [[0, 0.155], [0, 0.05], [0.01, 0.012], [0.034, 0.0], [0.056, 0.014], [0.062, 0.05]], 0.021, c);
      }, { sortDist: d - 0.2 });
      glowWith(h, [h.lanternSprite, h.hookSprite]);
    }
    L.dynamic = () => {
      for (const t of [thr, thrE]) {
        R.add(t.hitQuad);
        if (G.hover && G.hover.ref === t && !t.done) R.add(t.lift);
        if (t.done) R.add(t.salt);
      }
      for (const h of hooks) R.add(h.hung ? h.lanternSprite : h.hookSprite);
      drawSugar(); drawMatch(); drawEgg();
      // walking off at the end, it goes into the murk: more and more of the fog's colour over it, until it is gone in it
      const c = L.creature, cp = L.rend && L.rend.get(c), a = L.s.end;
      if (cp && a && a.phase === 'walk') { const p = c.pos(), f = R.fogAmt(Math.hypot(p.x, p.z)); cp.fogScale = Math.max(0.85, lerp(f * 0.85, 0.93, smoothstep((L.aftermathT - a.walkAt) / a.walkDur * 1.25 - 0.15)) / Math.max(0.01, f)); }
    };
    // a lit lantern warms the porch round it without washing the stone, or the thing at the salt line, out to orange
    L.glows = () => hooks.filter(h => h.lit).map(h => {
      const p = L.pt(h.local[0], 1.52, h.local[2]);
      return { x: p[0], y: p[1], z: p[2], r: 1.7 + Math.sin(L.t * 9 + h.seed) * 0.1 + Math.sin(L.t * 23 + h.seed) * 0.04, color: [255, 190, 110], a: 0.2 };
    }).concat(matchFlame() ? [Object.assign({ r: 0.55 + Math.sin(L.t * 31) * 0.05, color: [255, 200, 120], a: 0.22 }, matchFlame())] : []);
    const lampP = hooks.map(h => L.pt(h.local[0], 1.5, h.local[2]));
    L.dynamicLights = () => hooks.filter(h => h.lit).map(h => { const p = lampP[hooks.indexOf(h)]; return { x: p[0], y: p[1], z: p[2], r: 4.5, i: 0.34, color: [255, 180, 100], flicker: 0.7, seed: h.seed }; })
      .concat(matchFlame() ? [Object.assign({ r: 2.4, i: 0.22, color: [255, 186, 104], flicker: 1, seed: 11 }, matchFlame())] : []);   // a match struck at an empty hook lights the wall round it a moment
    L.deathCause = () => L.s.crossed !== undefined ? 'unlit' : (thr.done || thrE.done) ? 'open' : 'default';

    // ---- what will not do, played out where you tried it (js/hands.js) ----
    // The sugar is poured across the stone in a line from the tipped bag, lies there a moment, and then the wind takes it
    // off the stone, end to end, in a drift of grains; the emptied bag is let fall by the slab, to be picked up again
    // (and it costs the time a decoy does). The salt held over a line already poured is tipped over it and taken back with
    // nothing poured. Anything else tried on the stone is set down on it and lifted again, and the empty hand brushes it. A
    // match struck at a hook with no lantern on it flares there, lighting the wall a moment, finds nothing to light and is
    // shaken out; anything else knocked against a hook, or the lantern on it, sets it swinging, as the empty hand does.
    const W = (x, y, z) => { const p = L.pt(x, y, z); return { x: p[0], y: p[1], z: p[2] }; };
    const toLocal = p => rotY(p.x, p.z, -L.facing);
    const refuse = (t, how) => {   // the empty hand goes to it, or what is in it is tried there
      const act = G.inv[G.active], o = how(act);
      const shown = act ? G.fumble(act, t, o) : G.reach(t, o);
      if (!shown && !G.fumbling) AUDIO.sfx('nope');
    };
    const bag = it => it.id === 'salt' || it.id === 'sugar';
    // the last thing tried there is still there (the sugar still pouring, a match still burning): a click that would only be
    // refused again is taken, and nothing more said, so its line stays up and the hand stays with it
    const again = t => !!G.fumbling && G.fumbling.target === t;
    // over the line across a way, nearest the part of the stone in view: s along the line (from its middle), and the place
    // in the world `up` metres over it
    const overLine = (t, up) => {
      const [cx, cz, ux, uz, len] = t.line, q = toLocal(HANDS.pointOn(t, undefined, 0));
      const sl = clamp((q[0] - cx) * ux + (q[1] - cz) * uz, -len * 0.3, len * 0.3);
      return { s: sl, at: W(cx + ux * sl, up, cz + uz * sl) };
    };
    const POUR = 2.05;   // the bag tipped over, its neck down, as it is poured
    const refuseStone = t => refuse(t, it => {
      if (!it) return { style: 'touch' };
      if (bag(it) && t.done) return { preset: 'return', at: overLine(t, 0.3).at, angle: POUR, sfx: { hit: 'pat' } };   // tipped over the line, and taken back
      const p = HANDS.pointOn(t, undefined, 0);
      return { preset: 'return', at: { x: p.x, y: p.y + (it.h || 0.4) * 0.5, z: p.z } };   // set on the stone, and lifted again
    });
    // the sugar: { t, s (where along the line it was poured), t0, seed }
    const SUGAR = { pour: 0.8, lie: 0.6, blow: 1.7, N: 16, grains: 5, hold: 0.95 };
    const sugars = L.s.sugars = [];   // (L.s: the tests read them)
    const pourSugar = (t, item) => {
      const o = overLine(t, 0.3);
      const fx = G.fumble(item, t, { preset: 'slip', at: o.at, angle: POUR, hold: SUGAR.hold, pivot: 'left', sfx: { hit: 'pour', land: 'flop' },
        onHit: () => { for (let i = sugars.length - 1; i >= 0; i--) if (sugars[i].t === t) sugars.splice(i, 1); sugars.push({ t, s: o.s, t0: L.t, seed: (L.t * 1000) | 0, fx: G.fumbling }); } });
      if (!fx) AUDIO.sfx('nope');
    };
    const sugarC = [240, 236, 226];
    const grainQuad = (x, y, z, r, color, alpha) => {   // a speck facing the eye
      const e = G.cam.yaw, rx = Math.cos(e) * r, rz = -Math.sin(e) * r;
      return { kind: 'poly', pts: [[x - rx, y - r, z - rz], [x + rx, y - r, z + rz], [x + rx, y + r, z + rz], [x - rx, y + r, z - rz]], color, alpha };
    };
    function drawSugar() {
      for (let i = sugars.length - 1; i >= 0; i--) {
        const sg = sugars[i], t = sg.t, [cx, cz, ux, uz, len] = t.line, u = L.t - sg.t0, rnd = mulberry32(sg.seed);
        const fl = -uz * cx + ux * cz < 0 ? -1 : 1, nx = -uz * fl, nz = ux * fl;   // across the line, out of the porch
        const wx = ux * -0.72 + nx * 0.7, wz = uz * -0.72 + nz * 0.7;   // the wind: along the line and out into the dark
        const T0 = SUGAR.pour + SUGAR.lie, end = T0 + SUGAR.blow + 1.0;
        if (u > end) { sugars.splice(i, 1); continue; }
        const grow = smoothstep(clamp(u / SUGAR.pour, 0, 1)), half = len / 2, sd = t.sd - 0.012;
        const a = Math.max(-half, sg.s - len * grow), b = Math.min(half, sg.s + len * grow);
        // the stream from the bag's neck to the stone while it is poured
        const fx = sg.fx;
        if (fx && fx.phase === 'contact' && fx.pt < 0.14 + SUGAR.hold && fx.pos) {
          const w = (fx.it.w || 0.34) * fx.scale, hh = (fx.it.h || 0.42) * fx.scale;
          const mx = Math.sin(fx.rot) * hh * 0.42, my = Math.cos(fx.rot) * hh * 0.42;   // its neck, from its middle, as it is drawn turned
          const e = G.cam.yaw, rx = Math.cos(e), rz = -Math.sin(e), top = [fx.pos.x + rx * mx, fx.pos.y + my, fx.pos.z + rz * mx];
          const k = 0.008 + w * 0.01;
          R.add({ kind: 'poly', pts: [[top[0] - rx * k, top[1], top[2] - rz * k], [top[0] + rx * k, top[1], top[2] + rz * k], [top[0] + rx * k * 0.6, 0.02, top[2] + rz * k * 0.6], [top[0] - rx * k * 0.6, 0.02, top[2] - rz * k * 0.6]], color: sugarC, alpha: 0.85 });
        }
        // the line: N pieces along it, each taken by the wind in turn, from the end it blows from; what is left of it is one
        // band along the stone (its edges uneven as poured, thinning to nothing where the wind has taken it)
        const top = [], bot = [], at = (s, n) => L.pt(cx + ux * s + nx * n, 0.021, cz + uz * s + nz * n);
        for (let k = 0; k < SUGAR.N; k++) {
          const s0 = -half + len * k / SUGAR.N, s1 = s0 + len / SUGAR.N, sm = (s0 + s1) / 2;
          const order = 1 - (k + 0.5) / SUGAR.N;   // upwind first (the wind blows back along the line)
          const lift = T0 + order * SUGAR.blow * 0.6 + rnd() * 0.25, gone = clamp((u - lift) / 0.35, 0, 1);
          const wdt = 0.055 * (1 - gone) * (0.85 + rnd() * 0.3);
          if (sm >= a && sm <= b) { top.push(at(clamp(sm, a, b), wdt)); bot.push(at(clamp(sm, a, b), -wdt * (0.9 + 0.2 * Math.sin(k * 2.3)))); }
          // its grains, lifted off and carried away, rising and falling, thinning out
          for (let g = 0; g < SUGAR.grains; g++) {
            const d = rnd(), lat = (rnd() - 0.5) * 0.09, v = 1.1 + rnd() * 1.4, rise = 0.15 + rnd() * 0.5, ph = rnd() * TAU, size = 0.006 + rnd() * 0.008;
            const e = u - lift - d * 0.3;
            if (sm < a || sm > b || e <= 0 || e > 1.3) continue;
            const dd = v * e * (0.6 + e * 0.5), y = 0.02 + rise * Math.sin(Math.min(Math.PI, e * 2.4)) * (1 - e * 0.25) + Math.sin(e * 9 + ph) * 0.02;
            const lx = cx + ux * (sm + (d - 0.5) * len / SUGAR.N) + nx * lat + wx * dd + Math.sin(e * 7 + ph) * 0.04, lz = cz + uz * (sm + (d - 0.5) * len / SUGAR.N) + nz * lat + wz * dd;
            const w = L.pt(lx, y, lz);
            R.add(grainQuad(w[0], w[1], w[2], size, sugarC, clamp(1.3 - e, 0, 1) * 0.95));
          }
        }
        if (b - a > 0.01 && top.length) {   // its two ends, tapered, where the pour has got to
          const ends = [at(a, 0), at(b, 0)];
          if (top.some((p, k) => Math.hypot(p[0] - bot[k][0], p[2] - bot[k][2]) > 0.008)) R.add({ kind: 'poly', pts: [ends[0]].concat(top, [ends[1]], bot.reverse()), color: sugarC, layer: 0, sortDist: sd });
        }
        if (!sg.blew && u >= T0) { sg.blew = true; AUDIO.sfx('hiss', Math.sin(wrapPi(Math.atan2(t.x, t.z) - G.cam.yaw)) * 0.85); }   // the wind takes it
      }
    }
    // the hooks swing when knocked: { swingAt, swingAmp } on the hook, an easing pendulum
    const swingOf = h => { const e = L.t - (h.swingAt === undefined ? -99 : h.swingAt); return e >= 0 && e < 6 ? h.swingAmp * Math.exp(-e * 0.9) * Math.sin(e * 5.8) : 0; };
    const swingAbout = (ctx, a, y) => { if (a) { ctx.translate(0, y); ctx.rotate(a); ctx.translate(0, -y); } };
    const knock = (h, amp) => { const cur = Math.abs(swingOf(h)); h.swingAt = L.t; h.swingAmp = Math.max(amp, cur) * (Math.random() < 0.5 ? -1 : 1); };
    const MATCH = { hold: 0.9 };
    L.s.match = null;   // a match struck at an empty hook: { fx, h, pos, outAt }
    const refuseHook = h => refuse(h, it => {
      const at = W(h.local[0], h.hung ? 1.5 : 1.6, h.local[2]);
      if (!it) return { style: 'touch', at, onTouch: () => knock(h, h.hung ? 0.3 : 0.45) };
      if (it.id === 'matches' && !h.hung) {   // struck there, it flares, finds nothing to light, and is shaken out
        return { preset: 'slip', drop: false, hold: MATCH.hold, pivot: 'right', at: W(h.local[0], 1.5, h.local[2]), angle: -0.2, scale: 0.7, sfx: { hit: 'strike' },
          onHit: fx => { L.s.match = { fx, h, pos: null, outAt: undefined, at: L.t }; } };
      }
      // beside the lantern, not through it; at a bare hook, hung on it by its top (a bag by its neck), under it
      const d = Math.hypot(at.x, at.z) || 1, side = 0.13, k = 0.75;
      const by = h.hung ? { x: at.x - at.z / d * side, y: at.y - 0.02, z: at.z + at.x / d * side } : W(h.local[0], 1.6 - (it.h || 0.4) * k * 0.45, h.local[2]);
      return { preset: 'return', at: by, scale: h.hung ? undefined : k, onHit: () => knock(h, h.hung ? 0.22 : 0.4) };
    });
    // where the struck match burns, while it does: over the box, at its top
    function matchFlame() {
      const m = L.s.match; if (!m) return null;
      const fx = m.fx, burning = fx.phase === 'contact' && fx.pt < 0.14 + MATCH.hold * 0.92;
      if (!burning) return null;
      const e = G.cam.yaw, rx = Math.cos(e), rz = -Math.sin(e), sc = fx.scale, w = 0.2 * sc;
      return { x: fx.pos.x + rx * w * 0.2, y: fx.pos.y + 0.2 * sc * 0.55, z: fx.pos.z + rz * w * 0.2 };
    }
    function drawMatch() {
      const m = L.s.match; if (!m) return;
      const f = matchFlame();
      if (f) { m.pos = f; m.outAt = undefined; }
      else if (m.pos && m.outAt === undefined) m.outAt = L.t;
      if (!m.pos) return;
      const d = Math.hypot(m.pos.x, m.pos.z), sd = Math.max(0.02, d * 0.8 - 0.07);
      if (f) {   // the flame, flickering, on a sliver of match
        R.add({ kind: 'sprite', x: f.x, y: f.y - 0.01, z: f.z, w: 0.06, h: 0.11, noLight: true, sortDist: sd, draw: ctx => {
          const fl = Math.sin(L.t * 31) * 0.006 + Math.sin(L.t * 17) * 0.004;
          const g = ctx.createRadialGradient(0, 0.035, 0.002, 0, 0.035, 0.05);
          g.addColorStop(0, 'rgba(255,236,170,0.9)'); g.addColorStop(1, 'rgba(255,170,70,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0.035, 0.05, 0, TAU); ctx.fill();
          P_ell(ctx, 0, 0.03 + fl, 0.011, 0.025 + fl, 'rgba(255,214,120,0.95)');
          P_ell(ctx, 0, 0.024, 0.006, 0.013, 'rgba(255,250,230,1)');
        } });
        return;
      }
      const e = L.t - m.outAt;   // shaken out: a thread of smoke, rising and thinning
      if (e > 1.2) { L.s.match = null; return; }
      R.add({ kind: 'sprite', x: m.pos.x, y: m.pos.y, z: m.pos.z, w: 0.1, h: 0.3, sortDist: sd, draw: (ctx, P) => {
        for (let i = 0; i < 4; i++) {
          const k = clamp(e * 1.3 - i * 0.12, 0, 1); if (k <= 0) continue;
          P_ell(ctx, Math.sin(e * 3 + i) * 0.015, 0.02 + k * 0.22, 0.012 + k * 0.025, 0.012 + k * 0.02, P.cola([160, 156, 150], (1 - k) * 0.45));
        }
      } });
    }

    // ---- held at the salt ----
    // Held at a salted way it looks down at the salt for a while, then up at you again. If the other way is weaker it runs
    // round to it after a moment (game.js, ROUND, asking L.roundOpen), and does not look down while it runs. Where it has
    // nowhere weaker to go and no lantern burns by this line, it stands there SALT.hold seconds, looks down at the salt once
    // more, and steps over it.
    const s = L.s;
    const SALT = { hold: 6, look: 1.2 };
    const bowTo = (c, want, rate, dt) => { c.bow = clamp((c.bow || 0) + clamp(want - (c.bow || 0), -rate * dt, rate * dt), 0, 1); };
    L.update = dt => {
      const c = L.creature;
      L.uses = giving(c) ? GIVES : NONE;   // the sugar in your hand, and it near enough: it can be given the bag (the easter egg, below)
      if (s.egg) { eggUpdate(c, dt); if (s.egg) return; }   // its sugar rush, to the end of the night: it is moved from there, by these same rules
      if (L.won) return;   // the aftermath has it now
      if (c.sealHold) { if (s.heldAt === undefined) s.heldAt = L.t; } else s.heldAt = undefined;
      const held = s.heldAt !== undefined ? L.t - s.heldAt : -1, dark = held >= 0 && strength(c.lane) < 2;
      if (dark && held >= SALT.hold && !c.round) {   // over the line: it walks on from where it stood
        s.crossed = c.lane.idx; c.hold = null; c.sealHold = false; c.sealHeldAt = undefined; s.heldAt = undefined;
        c.u = clamp(1 - Math.pow(c.dist / c.D0, 1 / c.gamma), 0, 1);
      }
      if (c.runPose) c.bow = 0;
      else bowTo(c, held >= 0 && (held < 1.8 || (dark && held > SALT.hold - SALT.look)) ? 1 : 0, 3, dt);
    };

    // ---- the easter egg: the bag of sugar, given to it ----
    // With the sugar in your hand and the thing within GIVE.range metres and in plain view, a click on it gives it the bag,
    // for good: the night's easter egg (foundEgg, kept in the save from that moment). Within GIVE.near it is handed over;
    // farther off it is tossed, a short underarm arc from your hand (GIVE.toss), and caught. It stops where it is, takes the
    // bag in its free hand and holds it up, and looks at it, its head cocked one way and then the other; tips its head back
    // and pours the whole bag into its open mouth, swallows, and lets the empty bag fall (it lies there for the rest of the
    // night); stands dead still a moment; begins to tremble, more and more, its eyes wide; and tears off round the
    // graveyard: in among the headstones and round them, across the view and back, away and near, its arms in the air, at
    // three or four times the pace it runs at, for GIVE.run seconds. All that while it cannot reach you: its approach is
    // suspended (its own c.distFn, c.frozen, its way kept).
    // Then it does not go back to where it was. Still wired (the tremble, the eyes, the hair, the patter and the dust, to
    // the end of the night), it comes straight up its way to the salt at the pace of its run, and the night is decided
    // there by its own rules, quickly: a bare way it comes straight in by; at a salted one it skids to a stop and looks
    // down at the salt, trembling, and then, if the other way is weaker and it may go round (as game.js judges it), it
    // runs round to that one after GIVE.wait and comes up it the same way; with nowhere weaker to go and no lantern
    // burning by the line it steps over after GIVE.cross (the night's SALT.hold, hurried). What kills is the night's own
    // catch, with its own cause. You are free to act all the while: the night is won, as ever, the moment both ways are
    // salted and both lanterns lit, and then it cuts short whatever it was at and comes to the salt line, still wired, for
    // the night's own ending (L.aftermath); won before it has begun to run, it does not go. With reduced motion the
    // tremble is slight and the run slower, on a plainer round, in the same time, and it comes up to the line at that
    // slower pace. The smiler draws all of it from the fields set here (js/creatures/smiler.js: c.bag, c.bagHas, c.cock,
    // c.tip, c.pour, c.gulp, c.wired, c.buzz, c.flail, c.skid, c.dust).
    // (pace: what it runs at, going round, m/s; from: how far out on its way its run ends and it comes straight in)
    const GIVE = { range: 12, near: 4.5, take: 0.35, toss: 0.45, look: 1.0, pour: 1.2, still: 0.4, buzz: 0.8, run: 6, launch: 0.3, skid: 0.5, pace: 5, from: 7.8, wait: 0.5, cross: 1.1 };
    const NONE = [], GIVES = [{ tool: 'sugar', range: GIVE.range, sights: false, hoverText: () => 'Give it the sugar', onClick: c => { giveSugar(c); return true; } }];
    L.uses = NONE;
    s.egg = null;        // its sugar rush, until the night ends: { phase: take, look, pour, still, buzz, run, in, at or round; t (in the phase); T (in all); ... }
    s.spent = [];        // the emptied bags, where they fell: { from, to, t0 }
    s.puffs = [];        // the dust it leaves behind it as it runs: { x, y, z, t0 }
    s.give = GIVE; s.yard = yard;   // (the tests read its times, and what stands in its way)
    // the bag it could be given now, if any: the sugar is the thing in your hand, and it is up, coming, near enough and in view
    const giving = c => {
      const it = G.inv[G.active];
      return !s.egg && !L.won && G.state === 'play' && !c.dead && !c.lunge && it && it.id === 'sugar' && !(G.fumbling && G.fumbling.it === it)
        && Math.hypot(c.dist, c.lat || 0) <= GIVE.range && c.visFrac >= 0.3 ? it : null;
    };
    const panOf = c => Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
    // a point of it as it is drawn (sx to the right of the view, sy up), in the world
    const partOf = (c, sx, sy) => { const p = c.pos(), e = G.cam.yaw; return { x: p.x + Math.cos(e) * sx, y: p.y + sy, z: p.z - Math.sin(e) * sx }; };
    const giveSugar = c => {
      const it = giving(c); if (!it) return;
      const toss = Math.hypot(c.dist, c.lat || 0) > GIVE.near;   // too far to hand it over: it is tossed
      const from = HANDS.handWorld(it, toss ? 0.7 : Math.max(0.3, 0.6 * c.dist)).p, p = c.pos();
      G.removeFromInv(it); HANDS.threw(it);
      foundEgg();   // found the moment the bag leaves your hand
      const e = s.egg = {
        phase: 'take', t: 0, T: 0, it, from, toss, takeT: toss ? GIVE.toss : GIVE.take, slow: !!SAVE.data.settings.reducedMotion, cadence: 0,
        dist: c.dist, d: c.dist, to: c.lane.idx, home: { x: p.x, y: p.y, z: p.z }, at: { x: p.x, y: p.y, z: p.z },
        was: { pos: c.pos, hold: c.hold, distFn: c.distFn, round: c.round, sealHold: c.sealHold, frozen: c.frozen, fixedLane: c.fixedLane, runPose: c.runPose, runLat: c.runLat, runDir: c.runDir, timeScale: c.timeScale },
      };
      // its approach is suspended: it keeps the distance set here, takes no hitch, changes no way, and nothing holds it
      const sr = c.CR.stepRate * Math.PI;
      c.round = null; c.hold = null; c.sealHold = false; c.sealHeldAt = undefined; s.heldAt = undefined; c.frozen = true; c.fixedLane = true; c.runPose = false; c.rush = 0;
      c.distFn = (cr, dt2) => { cr.gait += e.cadence * dt2 - Math.abs(cr.dist - e.d) * sr; return e.d; };   // (its steps at its own quick patter, not one for every stride of ground)
      L.uses = NONE;
      G.toast(toss ? 'It catches the bag.' : 'It takes the bag.');
    };
    // the way it runs: a smooth line through the points given ([x, z], in the yard's own measure), eased round whatever
    // stands in the yard and kept outside the fence round the porch, but for the clear way it goes out and comes in by
    const FENCE = 4.5;   // (the fence is at 3.6: out in the yard, a point has x or z beyond this)
    const runPath = pts => {
      const S = [], Q = [pts[0]].concat(pts, [pts[pts.length - 1]]);
      for (let i = 1; i < Q.length - 2; i++) {
        const p0 = Q[i - 1], p1 = Q[i], p2 = Q[i + 1], p3 = Q[i + 2], n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 0.25));
        for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; S.push([0, 1].map(j => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t3))); }
      }
      S.push(pts[pts.length - 1].slice());
      const free = S.map(q => q[0] >= FENCE || q[1] >= FENCE);
      const clear = () => {
        for (let i = 1; i < S.length - 1; i++) {
          const q = S[i]; if (!free[i]) continue;
          for (const [x, z, r] of yard) { const dx = q[0] - x, dz = q[1] - z, d = Math.hypot(dx, dz); if (d >= r) continue; if (d > 1e-3) { q[0] = x + dx * r / d; q[1] = z + dz * r / d; } else q[0] = x + r; }
          if (q[0] < FENCE && q[1] < FENCE) { if (q[0] > q[1]) q[0] = FENCE; else q[1] = FENCE; }
        }
      };
      for (let n = 0; n < 6; n++) {
        clear();
        for (let pass = 0; pass < 2; pass++) for (let i = 1; i < S.length - 1; i++) if (free[i]) for (const j of [0, 1]) S[i][j] = S[i][j] * 0.5 + (S[i - 1][j] + S[i + 1][j]) * 0.25;
      }
      clear();
      const cum = [0]; for (let i = 1; i < S.length; i++) cum.push(cum[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
      let j = 0;   // (it only ever goes forward along it)
      return { S, cum, len: cum[cum.length - 1], at(a) { while (j < S.length - 2 && cum[j + 1] < a) j++; const k = clamp((a - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]), 0, 1); return [lerp(S[j][0], S[j + 1][0], k), lerp(S[j][1], S[j + 1][1], k)]; } };
    };
    // its round of the yard, from where it stands to GIVE.from metres out on its way, facing in. Whichever way it came by,
    // the wild of it is north of the porch, where the open front shows the most of the yard: from the side gate it goes out
    // east, round the corner of the fence, and comes back the same way. (slow: the plainer round, one loop)
    const ROUNDS = {
      path: { out: [[0, 4.9]], in: [[0, 9.8], [0, GIVE.from]],
        wild: [[4.5, 6.8], [-6, 8.5], [8, 11], [1.5, 14], [-8.5, 12.5], [-6.5, 7.2], [4.5, 6.2], [9, 9.5], [3.5, 12.5], [-4.5, 11], [-7, 8.6], [-3.2, 9.4]],
        slow: [[4.5, 6.8], [9, 10], [7.5, 13.5], [0, 14.8], [-7.5, 13.5], [-9, 10], [-4.2, 9.2]] },
      side: { out: [[4.9, 0]], in: [[9.8, 0], [GIVE.from, 0]],
        wild: [[6.6, 3], [6, 6.8], [-2.5, 8.5], [7, 11.5], [-0.5, 14], [-8.5, 12.5], [-6, 7], [3.5, 6.4], [8.5, 9.8], [1.5, 12.5], [-3.5, 9.5], [2.5, 6.6], [7.4, 6.4], [10.6, 2.6]],
        slow: [[6.6, 3], [5.5, 7.5], [-1, 9], [-7.5, 11.5], [-1, 14.5], [6.5, 12.5], [8.2, 8], [10.6, 3]] },
    };
    const roundsOf = idx => ROUNDS[idx === 0 ? 'path' : 'side'], wayPt = (idx, d) => (idx === 0 ? [0, d] : [d, 0]);
    const FRONT = 1.6;   // the last of a run, down its way: it is coming straight at you
    // on its way's own clear line through the fence (so it goes out and comes in by the gap)
    const onWay = (c, q) => { const along = c.lane.idx === 0 ? q[1] : q[0], off = c.lane.idx === 0 ? q[0] : q[1]; return Math.abs(off) < 0.8 && along < 4.4; };
    const roundOf = (c, e) => {
      const R0 = roundsOf(e.to), home = toLocal(e.home);
      const P = runPath([home].concat(onWay(c, home) ? R0.out : [], e.slow ? R0.slow : R0.wild, R0.in));
      P.front = P.len - FRONT;
      return P;
    };
    // wired, from the salt of one way round to the other (the corner of the fence between them), and facing in along it
    const ROUND_BY = [[5.6, 6.4], [9.8, 4.6], [10.4, 1.6]];   // (from the path to the side gate; the other way about, mirrored)
    const wiredRound = (c, e, to) => {
      const a = c.lane.idx, P = runPath([wayPt(a, e.d), wayPt(a, 4.9)].concat(ROUND_BY.map(q => (a === 0 ? q : [q[1], q[0]])), roundsOf(to).in));
      P.front = P.len - FRONT;
      return P;
    };
    // the night won while it is out there: from where it has got to, straight to the salt line of the way it was making
    // for (stop: how far out it stands there), round the corner of the fence if that is on the other side of the porch
    const cutRun = (c, e, from, stop) => {
      const inside = from[0] < FENCE && from[1] < FENCE, R0 = roundsOf(e.to);
      let pts = [from];
      if (!(inside && c.lane.idx === e.to)) {
        if (inside) pts.push(wayPt(c.lane.idx, 4.9));
        const far = inside || (e.to === 0 ? from[1] < FENCE : from[0] < 6);
        if (far && Math.hypot(from[0] - R0.in[1][0], from[1] - R0.in[1][1]) > 6) pts.push([6.5, 6.5]);
        pts = pts.concat([R0.in[1]]);
      }
      const P = runPath(pts.concat([wayPt(e.to, stop)]));
      P.front = P.len - Math.min(P.len * 0.5, (GIVE.from - stop) * 0.8);
      return P;
    };
    // how far along its run it is, t seconds into one of T (0..1): off the mark in GIVE.launch, flat out, and (d) the last
    // of it a skid to a stop
    const runProf = (t, T, d) => { const a = GIVE.launch, V = 1 / (T - (a + d) / 2); return t < a ? V * t * t / (2 * a) : !d || t < T - d ? Math.min(1, V * (t - a / 2)) : 1 - V * (T - t) * (T - t) / (2 * d); };
    const dropBag = (c, e, sy) => {   // it lets the bag fall: from its hand to the ground beside it
      const from = partOf(c, 0.06, sy), to = partOf(c, 0.52, 0);
      s.spent.push({ from, to: { x: to.x, y: e.home.y, z: to.z }, t0: L.t, landed: false });
      c.bagHas = false;
    };
    // won before it had begun to run: the night's ending has it as it was when it took the bag (trembling already, it stays so)
    const eggBack = (c, e) => {
      const w = e.was, wired = e.phase === 'buzz';
      c.pos = w.pos; c.frozen = true; c.fixedLane = w.fixedLane; c.timeScale = w.timeScale; c.yaw = c.lane.yaw; c.dist = e.dist;
      c.bag = c.cock = c.tip = c.pour = c.gulp = c.flail = c.skid = c.dust = 0; c.bagHas = false; c.rush = 0;
      if (wired) c.wired = 1; else c.wired = c.buzz = 0;
      c.distFn = w.distFn; c.hold = w.sealHold ? null : w.hold;
      c.round = w.round; c.runPose = !!(w.round && w.runPose); c.runLat = w.round ? w.runLat : 0; if (w.round) c.runDir = w.runDir;
      s.egg = null;
    };
    // won once it is wired: the night's ending has it where it stands on its way, wired still (c.wired and c.buzz are left on it)
    const wiredEnd = (c, e) => {
      const d = e.d;
      c.dist = d; c.distFn = () => d; c.runPose = false; c.runLat = 0; c.yaw = c.lane.yaw; c.flail = c.skid = c.dust = 0; c.rush = 0; c.timeScale = e.was.timeScale;
      s.egg = null;
    };
    // a frame of a run along e.path (stop: it ends in a skid): where it is, which way it faces, its dust. True once it is there
    const runStep = (c, e, dt, stop) => {
      const P = e.path, T = e.runT, u = Math.min(e.t, T), a = P.len * runProf(u, T, stop ? GIVE.skid : 0), q = P.at(a), w = L.pt(q[0], 0, q[1]);
      const vx = (w[0] - e.at.x) / Math.max(dt, 1e-4), vz = (w[2] - e.at.z) / Math.max(dt, 1e-4);
      e.at = { x: w[0], y: e.home.y, z: w[2] }; e.d = Math.hypot(w[0], w[2]); c.yaw = Math.atan2(w[0], w[2]);
      e.gone = (e.gone || 0) + Math.hypot(vx, vz) * dt;
      if (e.gone >= 0.8) { e.gone = 0; s.puffs.push({ x: w[0], y: e.home.y, z: w[2], t0: L.t }); }   // a puff of dust every stride or so, left hanging along the way it went
      const front = a >= P.front, vt = vx * Math.cos(c.yaw) - vz * Math.sin(c.yaw);   // (vt: across the view, to the right)
      if (Math.abs(vt) > 2) c.runDir = vt > 0 ? 1 : -1;
      c.runPose = !front; c.rush = front ? 1 : 0; c.flail = 1; c.bow = 0;
      c.runGait = (c.runGait || 0) + dt * (e.slow ? 22 : 34);
      c.skid = stop && front ? clamp(1 - (T - u) / GIVE.skid, 0, 1) : 0; c.dust = c.skid * 0.5;
      e.cadence = c.skid > 0 ? 0 : e.slow ? 21 : 30;
      if (c.skid > 0 && !e.skidded) { e.skidded = true; AUDIO.sfx('skid', panOf(c)); }
      return e.t >= T;
    };
    // off the yard and on its way again (the way it was making for), facing in, as far out as its run left it
    const land = (c, e) => {
      if (c.lane.idx !== e.to) { c.retarget(e.to); c.reached = false; L.laneIdx = e.to; L.lane = c.lane; L.barrierDist = c.lane.barrierDist || 0; }
      c.pos = e.was.pos; c.runLat = 0; c.runPose = false; c.yaw = c.lane.yaw; e.d = Math.hypot(e.at.x, e.at.z); e.vel = e.v;
    };
    const takeOff = (c, e, path, T) => {   // out into the yard, along path
      const p = c.pos();
      e.at = { x: p.x, y: p.y, z: p.z }; e.path = path; e.runT = T; e.skidded = false; c.pos = () => e.at; c.runLat = 0;
    };
    const eggUpdate = (c, dt) => {
      const e = s.egg, amp = e.slow ? 0.3 : 1;
      const go = ph => { e.phase = ph; e.t = 0; };
      if (G.state !== 'play' && !L.won) return;   // it has you: the lunge is the smiler's own, wired as it is
      if (L.won && !e.cut) {   // won meanwhile: out in the yard, it comes straight to the salt; on its way, it is there; not yet off, it does not go
        e.cut = true;
        if (e.phase === 'run' || e.phase === 'round') {
          e.path = cutRun(c, e, toLocal(e.at), saltDist(L.lanes[e.to]) + 0.25);
          e.runT = clamp(e.path.len / (e.v || GIVE.pace * 3.5), GIVE.launch + GIVE.skid + 0.2, 2); e.t = 0; e.skidded = false;
        } else if (e.phase === 'in' || e.phase === 'at') { wiredEnd(c, e); return; }
        else { if (c.bagHas) dropBag(c, e, 0.9); eggBack(c, e); return; }
      }
      e.t += dt; e.T += dt;
      switch (e.phase) {
        case 'take':   // it stops, and its free hand comes out for the bag (tossed, the bag is in the air first)
          c.bag = 0.5 * smoothstep((e.t - (e.takeT - GIVE.take)) / GIVE.take); bowTo(c, 0, 3, dt);
          if (e.t >= e.takeT) { c.bagHas = true; AUDIO.sfx('pat', panOf(c)); AUDIO.voice('hum', 0.4, panOf(c)); go('look'); }
          break;
        case 'look':   // it holds the bag up and looks at it, its head cocked to it, and then the other way
          c.bag = lerp(0.5, 1, smoothstep(e.t / 0.25)); bowTo(c, 0.7, 5, dt);
          c.cock = smoothstep(e.t / 0.2) - 1.7 * smoothstep((e.t - 0.5) / 0.16);
          if (e.t >= GIVE.look) go('pour');
          break;
        case 'pour': {   // its head goes back, the bag is upended over its open mouth, and all of it goes in
          const u = e.t, at = GIVE.pour - 0.17;
          c.tip = clamp(u / 0.28, 0, 1); c.cock *= Math.max(0, 1 - dt * 12); bowTo(c, 0, 6, dt);
          c.pour = clamp((u - 0.24) / (at - 0.24), 0, 1);
          if (!e.poured && u >= 0.2) { e.poured = true; AUDIO.sfx('sugarPour', panOf(c)); }
          if (!e.gulped && u >= at) { e.gulped = true; AUDIO.sfx('gulp', panOf(c)); }
          c.gulp = e.gulped ? Math.exp(-(u - at) * 7) : 0;
          if (u >= GIVE.pour) { dropBag(c, e, 1.5); go('still'); }
          break;
        }
        case 'still':   // the bag falls; its head comes level; and it stands dead still (not a hair of it stirs)
          c.tip = Math.max(0, c.tip - dt * 9); c.bag = Math.max(0, c.bag - dt * 7); c.gulp = 0; c.pour = 0; c.cock = 0;
          c.timeScale = e.t > 0.14 ? 0 : e.was.timeScale;
          if (e.t >= GIVE.still) { c.timeScale = e.was.timeScale; c.tip = c.bag = 0; AUDIO.sfx('sugarBuzz', panOf(c)); go('buzz'); }
          break;
        case 'buzz': {   // it begins to tremble, more and more, its eyes wide
          const k = clamp(e.t / GIVE.buzz, 0, 1);
          c.buzz = amp * k * k; c.wired = smoothstep(k * 2.5);
          if (e.t >= GIVE.buzz) {
            const P = roundOf(c, e);
            e.v = P.len / (GIVE.run - GIVE.launch / 2);   // the pace of its run, which it keeps to the end
            takeOff(c, e, P, GIVE.run); c.buzz = amp; c.wired = 1; go('run');
          }
          break;
        }
        case 'run':     // round the yard, flat out, and down onto its way
        case 'round':   // or from the salt of one way round to the other
          if (runStep(c, e, dt, e.cut)) {
            land(c, e);
            if (e.cut) { wiredEnd(c, e); return; }
            go('in');
          }
          break;
        case 'in': {   // straight up its way: to the salt, if there is salt across it, and in if there is none (or it has stepped over it)
          const lane = c.lane, sealed = L.sealed(lane), stop = sealed ? Math.min(lane.barrierDist, e.d) : c.catchDist - 0.05, left = e.d - stop;
          const vmax = sealed ? Math.min(e.v, Math.sqrt(2 * e.v / GIVE.skid * Math.max(0, left)) + 0.2) : e.v;
          e.vel = Math.min(vmax, (e.vel || 0) + e.v / GIVE.launch * dt);
          const d0 = e.d; e.d = Math.max(stop, e.d - e.vel * dt);
          c.rush = 1; c.runPose = false; c.yaw = lane.yaw; bowTo(c, 0, 6, dt);
          c.skid = sealed ? clamp(1 - e.vel / e.v, 0, 1) : 0; c.dust = c.skid * 0.5;
          c.flail = sealed ? 1 : clamp((e.d - 2.4) / 2, 0, 1);
          e.cadence = c.skid > 0.05 ? 0 : e.slow ? 21 : 30;
          e.gone = (e.gone || 0) + d0 - e.d;
          if (e.gone >= 0.8) { e.gone = 0; const p = c.pos(); s.puffs.push({ x: p.x, y: p.y, z: p.z, t0: L.t }); }
          if (sealed && c.skid > 0.05 && !e.skidded) { e.skidded = true; AUDIO.sfx('skid', panOf(c)); }
          if (sealed && e.d - stop <= 1e-3) { e.skidded = false; AUDIO.sfx('shudder', panOf(c)); go('at'); }
          break;
        }
        case 'at': {   // stopped at the salt: it looks down at it, trembling, and the night's own rules send it on
          const lane = c.lane, other = L.lanes[1 - lane.idx];
          c.rush = 0; c.flail = 0; e.cadence = 0; e.vel = 0; c.skid = Math.max(0, 1 - e.t / 0.18); c.dust = Math.min(1, 0.5 + e.t / 0.6 * 0.5);
          if (!L.sealed(lane)) { go('in'); break; }
          const round = L.diff.laneSwitch && L.def.laneSwitch !== false && L.roundOpen(other, c), dark = strength(lane) < 2;
          bowTo(c, round || dark || e.t < 1.8 ? 1 : 0, 5, dt);
          if (round) {   // the other way is weaker: round to it
            if (e.t >= GIVE.wait) { const P = wiredRound(c, e, other.idx); e.to = other.idx; takeOff(c, e, P, P.len / e.v + GIVE.launch / 2); go('round'); }
          } else if (dark && e.t >= GIVE.cross) { s.crossed = lane.idx; go('in'); }   // nowhere weaker, and no lantern here: over the line
          break;   // (salted and lit, with nowhere it may go: it stands there, as it would)
        }
      }
    };
    const PUFF = 0.9;   // how long a puff of its dust hangs
    const emptyBag = (ctx, P) => {   // the bag, emptied and crumpled, lying where it fell
      const paper = P.col([228, 26, 22]), band = P.col([226, 214, 196]), dark = P.col([136, 14, 12]);
      P_poly(ctx, [[-0.18, 0.04], [-0.02, 0.01], [0.15, 0.03], [0.19, 0.1], [0.14, 0.2], [0.03, 0.17], [-0.06, 0.22], [-0.17, 0.17], [-0.2, 0.1]], paper);
      P_poly(ctx, [[-0.07, 0.02], [0.02, 0.01], [0.05, 0.17], [-0.03, 0.2]], band);
      P_line(ctx, -0.15, 0.08, -0.08, 0.16, 0.012, dark); P_line(ctx, 0.07, 0.05, 0.13, 0.15, 0.012, dark); P_line(ctx, 0.09, 0.12, 0.16, 0.1, 0.01, dark);
    };
    function drawEgg() {
      const e = s.egg, c = L.creature;
      if (e && e.phase === 'take') {   // the bag, out of your hand and into its: handed over, or tossed underarm, turning over once as it goes
        const u = clamp(e.t / e.takeT, 0, 1), k = e.toss ? u : smoothstep(u), to = partOf(c, 0.26, 0.62), it = e.it;
        const up = e.toss ? 4 * k * (1 - k) * (0.25 + 0.05 * e.dist) : Math.sin(k * Math.PI) * 0.1, spin = e.toss ? -smoothstep(u) * TAU : 0;
        R.add({ kind: 'sprite', x: lerp(e.from.x, to.x, k), y: lerp(e.from.y, to.y, k) + up, z: lerp(e.from.z, to.z, k), w: it.w, h: it.h, worn: true, draw: (ctx, P) => { if (spin) { ctx.translate(0, it.h / 2); ctx.rotate(spin); ctx.translate(0, -it.h / 2); } ctx.scale(it.w, it.h); it.icon(ctx, P); } });
      }
      const cp = L.rend && L.rend.get(c);   // out in the yard it is kept clear of the murk, so it can be followed (0.85: as game.js draws it)
      if (cp && (e || cp.eggFog)) { cp.eggFog = !!(e && (e.phase === 'run' || e.phase === 'round')); cp.fogScale = cp.eggFog ? 0.45 : 0.85; }
      while (s.puffs.length && L.t - s.puffs[0].t0 > PUFF) s.puffs.shift();
      for (const p of s.puffs) {   // its dust, rising, spreading and thinning
        if (!p.spr) p.spr = { kind: 'sprite', x: p.x, y: p.y, z: p.z, w: 0.9, h: 0.7, draw: (ctx, P) => { const k = p.k; P_ell(ctx, 0, 0.1 + k * 0.26, 0.11 + k * 0.24, 0.08 + k * 0.17, P.cola([160, 152, 140], (1 - k) * 0.5)); } };
        p.k = clamp((L.t - p.t0) / PUFF, 0, 1);
        R.add(p.spr);
      }
      for (const b of s.spent) {
        const u = (L.t - b.t0) / 0.42;
        if (u < 1) {   // falling, turning over as it goes
          R.add({ kind: 'sprite', x: lerp(b.from.x, b.to.x, u), y: lerp(b.from.y, b.to.y, u * u), z: lerp(b.from.z, b.to.z, u), w: 0.4, h: 0.24, worn: true, draw: (ctx, P) => { ctx.translate(0, 0.12); ctx.rotate(u * 5); ctx.translate(0, -0.12); emptyBag(ctx, P); } });
          continue;
        }
        if (!b.landed) { b.landed = true; AUDIO.sfx('flop', Math.sin(wrapPi(Math.atan2(b.to.x, b.to.z) - G.cam.yaw)) * 0.85); }
        if (!b.spr) b.spr = { kind: 'sprite', x: b.to.x, y: b.to.y, z: b.to.z, w: 0.4, h: 0.24, flat: true, card: true, worn: true, layer: 1, dist: Math.hypot(b.to.x, b.to.z), draw: emptyBag };
        R.add(b.spr);
      }
    }

    // ---- how it ends ----
    // Won, it comes for the salt line across the way it is on, right up to it, its toes at the salt (nearer than the way
    // held it while the night was on): from out among the graves it runs, hurried, so the run takes no more than END.run
    // seconds however far out it was, and stops dead; from the barrier it steps up. It looks down at the salt, looks up at you
    // again, turns round and walks back the way it came, into the murk, and the night fades while it walks. If it was going
    // round when you won, it comes round first (game.js hurries that).
    const END = { run: 2.5, stop: 0.4, bow: 0.45, look: 1.3, rise: 0.3, turn: 0.75, walk: 2.8, walkSpeed: 2.2, runCadence: 17 };
    const saltDist = lane => (lane.idx === 0 ? 1.77 : 2.0);   // how far out the line is poured across each way
    L.aftermath = (t, dt) => {
      const c = L.creature, a = s.end || (s.end = { phase: 'round' });
      c.frozen = true;   // no more hitches
      if (a.phase === 'round') {
        if (c.round || s.egg) return false;   // (or out in the yard on its sugar rush, which a win cuts short: it comes to the line wired)
        a.phase = 'come'; a.at = Math.min(c.dist, saltDist(c.lane) + 0.25);   // where it stops: at the line, or where it already stood
        const far = c.dist - a.at;
        if (far > 0.01) {
          const v = far / clamp(far / 8, 0.4, END.run), sr = c.CR.stepRate * Math.PI, at = a.at;
          c.distFn = (cr, dt2) => { const nd = Math.max(at, cr.dist - v * dt2); if (v > 4) cr.gait += END.runCadence * dt2 - (cr.dist - nd) * sr; return nd; };   // running, quick short steps, not ten a second
          c.rush = clamp((v - 2) / 4, 0, 1);
        }
      }
      if (a.phase === 'come') {
        if (c.distFn && c.dist > a.at + 0.001) return false;
        const at = a.at;
        c.distFn = () => at; c.rush = 0;
        a.phase = 'stand'; a.t0 = t;
      }
      const u = t - a.t0, T1 = END.stop, T2 = T1 + END.bow, T3 = T2 + END.look, T4 = T3 + END.rise, T5 = T4 + END.turn;
      if (a.phase === 'stand') {
        bowTo(c, u >= T1 && u < T3 ? 1 : 0, 1 / (u < T3 ? END.bow : END.rise), dt);   // it looks down at the salt, then up at you
        if (u >= T4) {
          if (c.turnDir === undefined) c.turnDir = c.rand() < 0.5 ? 1 : -1;
          c.turn = clamp((u - T4) / END.turn, 0, 1);
        }
        if (u >= T5) {   // and walks back the way it came, humming
          a.phase = 'walk'; a.walkAt = t; a.walkDur = END.walk; c.turn = 1; c.away = true; c.bow = 0;
          c.distFn = (cr, dt2) => cr.dist + dt2 * END.walkSpeed;
          AUDIO.voice('hum', 0.35, Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85);
        }
        return false;
      }
      return t >= a.walkAt + END.walk;
    };
    // the win camera follows it, except while it stands at the line: then it widens and tilts to take in the whole of it,
    // from the salt across the stone at the bottom of the view to the top of its head, clear of the compass
    const HALF = 31 * DEG;   // half the view's height at no zoom (render.js VFOV)
    L.watchPoint = () => {
      const c = L.creature, a = s.end;
      if (!a || a.phase !== 'stand') return null;
      const p = c.pos(), d = Math.max(0.5, c.dist), top = Math.atan2(L.eyeH - c.CR.h - 0.05, d), salt = Math.atan2(L.eyeH, saltDist(c.lane) - 0.1);
      const half = Math.min(HALF, (salt - top) / 2 / 0.78), zoom = clamp(Math.tan(HALF) / Math.tan(half), 1, 1.35);
      const pitch = salt - Math.atan(Math.tan(HALF) / zoom) * 0.86;
      return { x: p.x, y: L.eyeH - Math.tan(pitch) * d, z: p.z, zoom };
    };
    L.floor = { poly: [[-2.1, -1.6], [2.1, -1.6], [2.1, 1.8], [-2.1, 1.8]], y: 0 };
  }
});
