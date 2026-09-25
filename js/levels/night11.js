'use strict';
// ============================================================ 11. THE BARN ============================================================
// The hayloft. It comes across the yard for the loft door, up the hoist chute, or in through the barn and up
// the ladder at the open edge. It goes faster the more you carry. Fire between you and it, and carry less.
LEVELS.push({
  id: 'barn', title: 'The Barn', facing: 90, eyeH: 4.65, laneSwitch: false,
  pal: { skyTop: [8, 8, 16], fog: [36, 34, 40], ground: [40, 38, 30], fogDist: 90 },
  ambient: { wind: 0.8, drone: 0.7, droneFreq: 47, windFreq: 330 },
  lights: [{ x: -2.2, y: 4.1, z: -2.2, r: 5, i: 0.4, color: [255, 200, 130], flicker: 0.2 }, { x: 0, y: 1.5, z: 42, r: 10, i: 0.4, color: [255, 200, 120] }],
  text: {
    intro: 'The loft is full of last summer, dry as paper, and something is coming across the yard for it. It is bent double under something it carries, and it goes faster the more you are carrying yourself.<br>Put things down.',
    hint: 'The lantern wants filling at the drum and lighting with the matches. Then it wants throwing into the hay. Carry as little as you can.',
    objective: 'Fire between you and it. Carry less.',
    death: { default: 'It did not put down what it was carrying. It put you with it.' },
    win: 'It paced the line of the fire for an hour and then sat down in the yard with its arms round itself, facing the loft, and stayed there until the light came.',
    fragment: 'Your hand hurt in the morning from holding on to something all night. It knew what you were holding. It always knows.',
  },
  // north: the yard, the hoist chute up to the loft door (a ramp lane). East: the barn floor and the ladder at the open edge.
  lanes: [
    { deg: 0, name: 'the loft door', elev: -22.4, ramp: true, barrierDist: 12.4, cue: 'creak', default: true, apertures: [{ z: 4 / Math.cos(22.4 * DEG), x0: -1.2, x1: 1.2, y0: 3.0, y1: 5.2 }] }, // up the chute to the door at the loft's north edge
    { deg: 90, name: 'the ladder', elev: -73, ramp: true, barrierDist: 25.7, cue: 'clunk' }, // along the barn floor past the hay, then up the ladder
  ],
  creatures: [{ type: 'carrier', startDist: 34, time: 70, gamma: 0.8, unseenMult: 1.25 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, FL = 3.0;
    const wood = [66, 52, 38], woodD = [44, 34, 26], hay = [150, 128, 70], hayD = [104, 86, 44], iron = [48, 46, 50];
    const ptex = { tex: 'planks', texScale: 1.3 };
    SC.stars(L, 111, 200, 0.9);
    SC.moon(L, 200, 25, 6, [226, 222, 200]);
    // the yard north, the farmhouse with one lit window, fences and the fields
    SC.floorQ(L, -200, -200, 200, 200, -0.01, [40, 38, 30]);
    SC.floorQ(L, -12, 2.5, 12, 24, 0.0, [58, 52, 38]);
    SC.box(L, -6, 6, 0, 5.5, 41, 47, [30, 26, 24]); SC.quad(L, [-6.5, 5.5, 40.5], [6.5, 5.5, 40.5], [0, 8.5, 44], [0, 8.5, 44], [24, 20, 18]); SC.quad(L, [-6.5, 5.5, 47.5], [6.5, 5.5, 47.5], [0, 8.5, 44], [0, 8.5, 44], [22, 18, 16]);
    SC.sprite(L, 0.6, 1.4, 40.9, 1.1, 1.3, (ctx, P) => { ctx.scale(1.1, 1.3); P_rect(ctx, -0.5, 0, 1, 1, P.raw([232, 196, 120])); P_rect(ctx, -0.04, 0, 0.08, 1, P.raw([60, 40, 30])); P_rect(ctx, -0.5, 0.48, 1, 0.06, P.raw([60, 40, 30])); }, { noFog: true, noLight: true });
    SC.fenceLine(L, -30, 24, -3, 24, 2.6, 1.1, [50, 44, 36]); SC.fenceLine(L, 3, 24, 30, 24, 2.6, 1.1, [50, 44, 36]);
    const rng = mulberry32(121);
    for (let i = 0; i < 30; i++) { const x = (rng() - 0.5) * 160, z = 30 + rng() * 90; if (Math.abs(x) < 9 && z < 50) continue; SC.tree(L, x, z, 7 + rng() * 8, rng() < 0.5 ? 'bare' : 'round', (rng() * 1e6) | 0); }
    for (let i = 0; i < 24; i++) { const x = 30 + rng() * 120, z = (rng() - 0.5) * 120; if (Math.abs(z) < 6) continue; SC.tree(L, x, z, 7 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    for (let i = 0; i < 16; i++) { const x = -30 - rng() * 100, z = (rng() - 0.5) * 120; SC.tree(L, x, z, 7 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    // the barn: a long shed running east; the loft over its west end, open along its east edge
    SC.floorQ(L, -4.5, -4, 16.5, 4, 0.01, [52, 44, 34]);
    SC.wallV(L, -4.5, -4, 16.5, -4, 0, 6.5, woodD, ptex); SC.wallV(L, -4.5, -4, -4.5, 4, 0, 6.5, woodD, ptex);
    SC.wallV(L, -4.5, 4, -1.2, 4, 0, 6.5, woodD, ptex); SC.wallV(L, 1.2, 4, 16.5, 4, 0, 6.5, woodD, ptex);
    SC.wallV(L, -1.2, 4, 1.2, 4, 0, 3.0, woodD, ptex); SC.wallV(L, -1.2, 4, 1.2, 4, 5.2, 6.5, woodD, ptex);
    SC.wallV(L, 16.5, -4, 16.5, -2, 0, 6.5, woodD, ptex); SC.wallV(L, 16.5, 2, 16.5, 4, 0, 6.5, woodD, ptex); SC.wallV(L, 16.5, -2, 16.5, 2, 4.2, 6.5, woodD, ptex);
    SC.quad(L, [-5, 6.5, -4.5], [17, 6.5, -4.5], [17, 8.6, 0], [-5, 8.6, 0], [30, 24, 18]); SC.quad(L, [-5, 6.5, 4.5], [17, 6.5, 4.5], [17, 8.6, 0], [-5, 8.6, 0], [26, 20, 16]);
    for (let x = -4; x < 16; x += 3) SC.box(L, x - 0.1, x + 0.1, 0, 6.5, -3.95, -3.75, wood);
    SC.box(L, -4.5, 0.5, FL - 0.2, FL, -4, 4.0, woodD);
    SC.floorQ(L, -4.5, -4, 0.5, 4.0, FL + 0.01, [92, 76, 56], ptex);
    SC.box(L, 0.3, 0.5, FL - 0.2, FL + 0.15, -4, 4.0, wood);
    for (const x of [-3.5, -1.5]) SC.box(L, x - 0.12, x + 0.12, 0, FL - 0.2, -3.9, -3.66, wood);
    // the loft door north, the hoist beam above it, and the chute down to the yard
    for (const [x0, x1] of [[-1.35, -1.2], [1.2, 1.35]]) SC.box(L, x0, x1, FL, 5.35, 3.95, 4.1, wood);
    SC.box(L, -1.35, 1.35, 5.2, 5.35, 3.95, 4.1, wood);
    SC.box(L, -0.1, 0.1, 5.35, 5.5, 3.5, 5.2, wood);
    SC.quad(L, [-0.9, FL, 4.0], [0.9, FL, 4.0], [0.9, 0.05, 11.3], [-0.9, 0.05, 11.3], [58, 46, 34]);
    for (let k = 0; k < 8; k++) { const u = k / 8, y = FL - u * FL + 0.03, z = 4.0 + u * 7.3; SC.box(L, -0.9, 0.9, y, y + 0.06, z - 0.04, z + 0.04, woodD); }
    // the ladder up the east edge, drawn to be pulled up when it is
    // the hay: a stack in the yard under the loft door, and a stack on the barn floor to the east
    SC.box(L, -2.2, 2.2, 0, 1.6, 12.0, 14.8, hay); SC.box(L, -1.6, 1.6, 1.6, 2.3, 12.4, 14.4, hayD); SC.box(L, 2.3, 3.6, 0, 1.0, 12.4, 13.8, hay);
    SC.box(L, 7.8, 11.2, 0, 1.6, -3.9, -1.3, hay); SC.box(L, 8.3, 10.7, 1.6, 2.4, -3.5, -1.7, hayD); SC.box(L, 8.0, 10.0, 0, 1.2, 1.2, 2.6, hayD);
    // loft clutter: the oil drum with its tap, crates, a lantern on one of them, sacks
    SC.box(L, -3.0, -2.2, FL, FL + 0.9, -2.6, -1.8, iron); SC.box(L, -2.9, -2.3, FL + 0.9, FL + 0.96, -2.5, -1.9, [70, 68, 72]); SC.box(L, -2.25, -2.05, FL + 0.28, FL + 0.36, -2.3, -2.1, [100, 90, 60]);
    SC.box(L, -2.6, -1.8, FL, FL + 0.6, -3.7, -3.1, [84, 68, 50]); SC.box(L, -1.7, -1.0, FL, FL + 0.45, -3.7, -3.2, [84, 68, 50]);
    STORY.lamp(L, -2.2, FL + 0.6, -3.4, { lit: true, scale: 0.9 });
    SC.box(L, -4.2, -3.4, FL, FL + 0.9, -1.0, 0.6, [124, 106, 70]); SC.box(L, -4.2, -3.6, FL + 0.9, FL + 1.5, -0.8, 0.4, [110, 92, 62]);
    // items
    const decoy = !!L.diff.decoys, stuck = L.diff.tier >= 2;
    mkItem(L, 'lantern', 'Lantern', [
      { x: -1.2, y: FL + 0.45, z: -3.4 },              // on the low crate
      { x: -3.8, y: FL + 1.5, z: -0.2 },               // on the sacks
      { x: 0.1, y: FL + 0.02, z: 1.2, flat: true },    // on the floor towards the loft door
      { x: -0.5, y: FL + 0.02, z: -2.5, flat: true },  // on the floor by the drum
    ], { w: 0.3, h: 0.44 });
    mkItem(L, 'matches', 'Matches', [
      { x: -2.5, y: FL + 0.96, z: -2.2, flat: false },  // on the drum
      { x: -2.0, y: FL + 0.6, z: -3.5, flat: false },   // on the crate
      { x: 0.2, y: FL + 0.02, z: 3.4, flat: true },     // by the loft door sill
      { x: -3.9, y: FL + 0.02, z: 1.5, flat: true },    // north-west corner
    ], { w: 0.16, h: 0.16, tool: true });
    if (stuck) mkItem(L, 'wrench', 'Wrench', [{ x: -3.6, y: FL + 0.02, z: -3.4, flat: true }, { x: 0.0, y: FL + 0.02, z: -0.8, flat: true }, { x: -1.4, y: FL + 0.6, z: -3.35 }], { w: 0.34, h: 0.34, tool: true, weight: 2 });
    if (decoy) {
      mkItem(L, 'pail', 'Water pail', [{ x: -1.0, y: FL + 0.02, z: 0.6 }, { x: 0.0, y: FL + 0.02, z: -3.2 }], { w: 0.34, h: 0.38, weight: 2, decoy: true, decoyText: 'Water. The hay is soaked now; it will not take a flame for a while.' });
      mkItem(L, 'sack', 'Feed sack', [{ x: -2.8, y: FL + 0.02, z: 0.9 }, { x: 0.1, y: FL + 0.02, z: -1.8 }], { w: 0.4, h: 0.5, weight: 2 });
      mkItem(L, 'chain', 'Chain', [{ x: -3.9, y: FL + 0.02, z: -2.4, flat: true }, { x: -0.8, y: FL + 0.02, z: 2.4, flat: true }], { w: 0.5, h: 0.5, weight: 2 });
    }
    Object.assign(s, { tapStuck: stuck, fireN: false, fireE: false, fireT: 0, wetN: 0, wetE: 0, ladderUp: false, ladderK: 0 });
    const c0 = () => L.creatures[0];
    const drum = mkTarget(L, {
      id: 'drum', name: 'Oil drum', x: -2.6, y: FL, z: -2.2, w: 0.9, h: 1.0, accepts: ['lantern'].concat(stuck ? ['wrench'] : []),
      hint() { return s.tapStuck ? 'The drum. Its tap is rusted shut.' : 'The oil drum. The tap turns.'; },
      use(item) {
        if (item.id === 'wrench') { if (!s.tapStuck) { G.say('The tap already turns.', 'Done.'); return false; } s.tapStuck = false; AUDIO.sfx('lever'); G.say('The tap frees. Put the wrench down; it is heavy.', 'It turns.'); return true; }
        if (s.tapStuck) { G.say('The tap will not turn. It wants a wrench.', 'Stuck.'); return false; }
        G.removeFromInv(item);
        const full = newItem(L, 'lantern_full', 'Lantern, filled', { w: 0.3, h: 0.44, icon: 'lantern' });
        G.inv.push(full); G.active = G.inv.length - 1; AUDIO.sfx('pour'); G.say('Filled. Now a match.', 'Filled.');
        return true;
      },
    });
    void drum;
    mkRecipe(L, { parts: ['lantern_full', 'matches'], result: { id: 'lantern_lit', name: 'Lantern, lit', opts: { w: 0.3, h: 0.44, throwable: true, icon: (ctx, P) => { P.lit = true; ICONS.lantern(ctx, P); } } }, sfx: 'strike', text: 'It catches. Throw it before it goes out.', onCombine: (it, L2) => { const m = L2.items.find(i => i.id === 'matches'); if (m) { m.taken = true; G.inv.push(m); } } });
    const mkHay = (id, name, deg, dist, w, flag, wet) => {
      const t = mkTarget(L, {
        id, name, deg, dist, y: 0, w, h: 2.4, accepts: ['lantern_lit'].concat(decoy ? ['pail'] : []),
        hint() { return s[flag] ? 'Burning.' : s[wet] > 0 ? 'Soaked. It will not catch yet.' : 'Dry hay. It would go up in a moment.'; },
        use(item) {
          if (item.id !== 'lantern_lit') return false;
          if (s[wet] > 0) { G.say('The lantern hisses out in the wet hay. It comes back to you unlit.', 'It goes out.'); G.inv.push(newItem(L, 'lantern_full', 'Lantern, filled', { w: 0.3, h: 0.44, icon: 'lantern' })); G.active = G.inv.length - 1; return false; } // the soaking is temporary, so the lantern is not lost
          s[flag] = true; s.fireT = 0; AUDIO.sfx('hiss'); setTimeout(() => AUDIO.sfx('thunder'), 200); G.shake(0.3); WEATHER.set({ kind: 'ash', density: 0.9, wind: 0.4 }, G.runSeed + 11);
          G.say('It goes up all at once.', 'Fire.'); return true;
        },
      });
      return t;
    };
    const hayN = mkHay('hayN', 'The hay in the yard', 0, 13.4, 4.4, 'fireN', 'wetN'), hayE = mkHay('hayE', 'The hay in the barn', 105.3, 9.85, 3.6, 'fireE', 'wetE'); // the barn stack sits south of its walking line
    // a decoy pail soaks whichever hay it is thrown at
    const wetHay = (t) => { const k = t === hayN ? 'wetN' : 'wetE'; s[k] = 25; };
    void hayE;
    L.onDecoy = (t, item) => { if (item.id === 'pail') wetHay(t); };
    const ladder = mkTarget(L, {
      id: 'ladder', name: 'Ladder', x: 0.9, y: FL - 0.6, z: 0, w: 0.9, h: 1.4, hold: 3.0,
      hint() { return s.ladderUp ? 'Pulled up onto the loft.' : 'The ladder up from the barn floor. It could be pulled up.'; },
      use(item) { if (item !== null) return false; s.ladderUp = true; AUDIO.sfx('clunk'); G.say('The ladder is up. Nothing climbs that way now.', 'Up.'); return true; },
    });
    void ladder;
    const sealed = lane => lane.idx === 0 ? s.fireN : (s.fireE || (L.diff.tier >= 3 && s.ladderUp)); // the ladder only counts where it is the extra step
    L.sealed = sealed;
    // Nightmare wants the ladder up as well as a fire, whichever way it comes
    L.isWon = () => L.diff.tier >= 3 ? (s.ladderUp && (s.fireN || s.fireE) && sealed(c0().lane)) : sealed(c0().lane);
    L.objectiveText = () => { const c = c0(); const load = G.inv.reduce((a, i) => a + (i.weight || 1), 0); return (sealed(c.lane) ? 'Sealed. ' : c.lane.idx === 0 ? 'Fire in the yard hay. ' : (L.diff.tier >= 3 ? 'Fire in the barn hay, or pull the ladder up. ' : 'Fire in the barn hay. ')) + (L.diff.tier >= 3 && !s.ladderUp ? 'Pull the ladder up too. ' : '') + 'Carrying ' + load + '.'; };
    L.update = dt => {
      const c = c0();
      c.load = G.inv.reduce((a, i) => a + (i.weight || 1), 0);
      if (s.fireN || s.fireE) s.fireT += dt;
      if (s.wetN > 0) s.wetN -= dt; if (s.wetE > 0) s.wetE -= dt;
      if (!s.ladderUp) s.ladderK = Math.max(0, s.ladderK - dt); else s.ladderK = Math.min(1, s.ladderK + dt * 1.5);
    };
    L.dynamic = () => {
      // the ladder, standing at the edge or hauled up onto the boards
      const k = smoothstep(s.ladderK), fx = 1.4 * (1 - k) - 0.2 * k, fy = 0.02 * (1 - k) + (FL + 0.1) * k, tx = 0.5 * (1 - k) - 3.6 * k, ty = FL * (1 - k) + (FL + 0.14) * k;
      for (const dz of [-0.35, 0.35]) R.add(SC.mkQuad(L, [fx, fy, dz - 0.04], [fx, fy, dz + 0.04], [tx, ty, dz + 0.04], [tx, ty, dz - 0.04], wood));
      for (let r = 0; r < 9; r++) { const u = r / 9 + 0.05, x = fx + (tx - fx) * u, y = fy + (ty - fy) * u; R.add(SC.mkQuad(L, [x, y - 0.03, -0.35], [x, y - 0.03, 0.35], [x, y + 0.03, 0.35], [x, y + 0.03, -0.35], woodD)); }
      // fire: flames over whichever hay is burning
      for (const [on, cx, cz, w] of [[s.fireN, 0, 13.4, 4.4], [s.fireE, 9.5, -2.6, 3.6]]) if (on) {
        for (let i = 0; i < 7; i++) { const ph = i * 1.7, fh = 2.2 + Math.sin(L.t * 9 + ph) * 0.6 + Math.sin(L.t * 23 + ph * 2) * 0.3, fw = 0.9 + Math.sin(L.t * 5 + ph) * 0.2; const x = cx + (i - 3) * w / 7, z = cz + Math.sin(ph) * 0.8;
          R.add(SC.mkSprite(L, x, 1.5, z, fw, fh, (ctx, P) => { ctx.scale(fw, fh); const g = ctx.createLinearGradient(0, 0, 0, 1); g.addColorStop(0, 'rgba(255,220,120,0.95)'); g.addColorStop(0.5, 'rgba(255,120,30,0.7)'); g.addColorStop(1, 'rgba(120,20,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.quadraticCurveTo(-0.55, 0.5, 0, 1); ctx.quadraticCurveTo(0.55, 0.5, 0.5, 0); ctx.closePath(); ctx.fill(); }, { noFog: true, noLight: true })); }
      }
    };
    L.dynamicLights = () => {
      const out = [];
      if (s.fireN) { const p = L.pt(0, 2.5, 13.4); out.push({ x: p[0], y: p[1], z: p[2], r: 16, i: 1.3, color: [255, 150, 60], flicker: 0.6, seed: 4 }); }
      if (s.fireE) { const p = L.pt(9.5, 2.5, -2.6); out.push({ x: p[0], y: p[1], z: p[2], r: 16, i: 1.3, color: [255, 150, 60], flicker: 0.6, seed: 6 }); }
      if (G.hasItem('lantern_lit')) { const p = L.pt(Math.sin(G.cam.yaw - L.facing) * 0.5, L.eyeH - 0.4, Math.cos(G.cam.yaw - L.facing) * 0.5); out.push({ x: p[0], y: p[1], z: p[2], r: 6, i: 0.7, color: [255, 190, 110], flicker: 0.3, seed: 8 }); }
      return out;
    };
    L.glows = () => { const out = []; if (s.fireN) { const p = L.pt(0, 2.2, 13.4); out.push({ x: p[0], y: p[1], z: p[2], r: 5 + Math.sin(L.t * 7) * 0.4, color: [255, 140, 50], a: 0.28 }); } if (s.fireE) { const p = L.pt(9.5, 2.2, -2.6); out.push({ x: p[0], y: p[1], z: p[2], r: 5 + Math.sin(L.t * 7) * 0.4, color: [255, 140, 50], a: 0.28 }); } return out; };
    L.aftermath = (t, dt) => { const c = c0(); if (!s.after) { s.after = true; if (c.lane.idx === 1) L.text.win = 'It stood on the barn floor with its arms round itself, looking up at where the ladder had been, and stayed there until the light came.'; } if (t > 3.2 && !c.sitting) { c.sitting = true; c.hold = c.dist; } return t >= 6.5; };
    L.floor = { poly: [[-4.3, -3.8], [0.3, -3.8], [0.3, 3.8], [-4.3, 3.8]], y: FL + 0.02 };
  }
});
