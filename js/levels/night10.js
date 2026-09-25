'use strict';
// ============================================================ 10. THE MIRROR MAZE ============================================================
// The look-away night turned inside out: it is always behind you and you only ever see it in the glass.
// It moves while no mirror shows it. Everything you need is on the floor or behind you.
LEVELS.push({
  id: 'mirrors', title: 'The Mirror Maze', facing: 0, eyeH: 1.65, laneMode: 'default', laneSwitch: false,
  pal: { skyTop: [14, 8, 8], fog: [58, 40, 36], ground: [30, 26, 26], fogDist: 40 },
  ambient: { wind: 0.5, drone: 0.9, droneFreq: 55, windFreq: 340 },
  weather: { kind: 'ash', density: 1.0, wind: 0.3 },
  lights: [{ x: -40, y: 2, z: 5, r: 60, i: 0.5, color: [255, 120, 40], flicker: 0.4 }, { x: 2.6, y: 1.3, z: 2.6, r: 5, i: 0.4, color: [255, 200, 140], flicker: 0.15 }],
  text: {
    intro: 'A hall of mirrors at the edge of the fair, after closing. Something is burning to the west and the ash is coming down through the roof.<br>There is someone behind you. There is always someone behind you. You can only see it in the glass.',
    hint: 'It does not move while a mirror shows it. The music box on its pedestal is the one thing it wants more than you.',
    objective: 'Keep a mirror on it. Wind the music box.',
    death: { default: 'You turned round.' },
    win: 'It stood at the pedestal swaying to the tune while the ash came down, and did not look at you once.',
    fragment: 'You have been humming it for days. Nobody at work knows it.',
  },
  lanes: [
    { follow: 'behind', name: 'behind you', barrierDist: 0, default: true },
    { deg: 0, name: 'the pedestal', barrierDist: 2.1, noSwitch: true },
    { deg: 180, name: 'the carousel', barrierDist: 0, noSwitch: true },
  ],
  creatures: [{ type: 'other', startDist: 30, time: 70, gamma: 0.8, seenMult: 0, unseenMult: 1.0 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, CR = CREATURES.other, c0 = () => L.creatures[0];
    const board = [78, 40, 48], boardD = [54, 28, 34], gilt = [150, 120, 60], tileA = [118, 108, 98], tileB = [40, 36, 36];
    SC.stars(L, 101, 20, 0.2);
    for (let x = -3.5; x < 3.5; x += 0.7) for (let z = -3.5; z < 3.5; z += 0.7) SC.floorQ(L, x, z, x + 0.7, z + 0.7, 0.004, ((Math.round(x / 0.7) + Math.round(z / 0.7)) & 1) ? tileA : tileB);
    SC.quad(L, [-3.6, 3.2, -3.6], [3.6, 3.2, -3.6], [3.6, 3.2, 3.6], [-3.6, 3.2, 3.6], [40, 30, 30]);
    // three mirrors, north, east and west, each a hole in a painted wall with a dark room behind the glass
    s.mirrors = [{ deg: 0, live: true }, { deg: 90, live: true }, { deg: 270, live: true }];
    for (const m of s.mirrors) {
      SC.window(L, { deg: m.deg, z: 3.5, x: 0, w: 1.6, y0: 0.25, y1: 2.45, wallH: 3.2, left: -3.5, right: 3.5, color: board });
      SC.withYaw(L, m.deg, () => {
        for (const [x0, x1, y0, y1] of [[-0.92, -0.8, 0.13, 2.57], [0.8, 0.92, 0.13, 2.57], [-0.92, 0.92, 0.13, 0.25], [-0.92, 0.92, 2.45, 2.57]]) SC.wallV(L, x0, 3.47, x1, 3.47, y0, y1, gilt);
        SC.quad(L, [-0.8, 0.25, 3.62], [0.8, 0.25, 3.62], [0.8, 2.45, 3.62], [-0.8, 2.45, 3.62], [20, 16, 22], { dist: 60 });
        SC.quad(L, [-0.8, 0.25, 3.61], [0.8, 0.25, 3.61], [0.8, 0.62, 3.61], [-0.8, 0.62, 3.61], [44, 38, 36], { dist: 59.5 });
        SC.quad(L, [-0.8, 0.25, 3.48], [0.8, 0.25, 3.48], [0.8, 2.45, 3.48], [-0.8, 2.45, 3.48], [120, 140, 170], { alpha: 0.2, noLight: true });
        SC.quad(L, [-0.7, 1.9, 3.475], [-0.5, 1.9, 3.475], [0.1, 2.4, 3.475], [-0.1, 2.4, 3.475], [230, 230, 240], { alpha: 0.12, noLight: true });
        for (let y = 0.5; y < 3.2; y += 0.5) SC.wallV(L, -3.5, 3.49, -0.92, 3.49, y, y + 0.04, boardD);
        for (let y = 0.5; y < 3.2; y += 0.5) SC.wallV(L, 0.92, 3.49, 3.5, 3.49, y, y + 0.04, boardD);
        for (let x = -3.1; x < 3.5; x += 0.6) if (Math.abs(x) > 1.1) SC.sprite(L, x, 2.85, 3.46, 0.1, 0.12, (ctx, P) => { ctx.scale(0.1, 0.12); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([70, 60, 50])); });
      });
    }
    // the way out, south, through a curtain onto the dark fair: the carousel and its bell
    const apS = SC.doorway(L, { deg: 180, z: 3.5, w: 1.4, h: 2.3, wallH: 3.2, left: -3.5, right: 3.5, color: board });
    L.addAperture(2, apS);
    SC.wallV(L, -0.7, -3.52, -0.15, -3.52, 0, 2.3, [70, 20, 30], { alpha: 0.85 }); SC.wallV(L, 0.15, -3.52, 0.7, -3.52, 0, 2.3, [70, 20, 30], { alpha: 0.85 });
    SC.floorQ(L, -80, -80, 80, -3.6, -0.01, [46, 42, 40]);
    SC.box(L, -0.1, 0.1, 0, 3.4, -6.1, -5.9, [40, 36, 34]); SC.sprite(L, 0, 3.4, -6, 0.35, 0.4, (ctx, P) => { ctx.scale(0.35, 0.4); P_ell(ctx, 0, 0.55, 0.45, 0.42, P.col([170, 140, 70])); P_rect(ctx, -0.06, 0.95, 0.12, 0.05, P.col([90, 80, 60])); });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; SC.box(L, Math.sin(a) * 5 - 0.1, Math.sin(a) * 5 + 0.1, 0, 2.6, -14 + Math.cos(a) * 5 - 0.1, -14 + Math.cos(a) * 5 + 0.1, [60, 50, 44]); }
    SC.quad(L, [-5.5, 2.6, -8.5], [5.5, 2.6, -8.5], [5.5, 2.6, -19.5], [-5.5, 2.6, -19.5], [90, 40, 44]);
    SC.quad(L, [-5.5, 2.6, -8.5], [5.5, 2.6, -8.5], [0, 5.0, -14], [0, 5.0, -14], [110, 50, 54]); SC.quad(L, [-5.5, 2.6, -19.5], [5.5, 2.6, -19.5], [0, 5.0, -14], [0, 5.0, -14], [80, 36, 40]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.3; SC.sprite(L, Math.sin(a) * 3.2, 0.6, -14 + Math.cos(a) * 3.2, 0.9, 1.4, (ctx, P) => { ctx.scale(0.9, 1.4); P_ell(ctx, 0, 0.55, 0.45, 0.3, P.col([120, 110, 100])); P_rect(ctx, -0.05, 0, 0.1, 0.55, P.col([80, 70, 60])); P_ell(ctx, 0.3, 0.7, 0.14, 0.12, P.col([120, 110, 100])); }); }
    const rng = mulberry32(110);
    for (let i = 0; i < 14; i++) { const x = (rng() - 0.5) * 60, z = -8 - rng() * 50; if (Math.abs(x) < 6 && z > -22) continue; SC.box(L, x - 1.5, x + 1.5, 0, 2.2 + rng() * 2, z - 1, z + 1, [40, 34, 34]); }
    SC.sprite(L, -60, 0, 8, 40, 6, (ctx, P) => { ctx.scale(40, 6); const g = ctx.createRadialGradient(0, 0.15, 0.02, 0, 0.15, 0.6); g.addColorStop(0, 'rgba(255,120,40,0.7)'); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); }, { noFog: true, noLight: true, dist: 100 });
    // furniture: the pedestal in the middle of the north side, a shelf with a lamp, a chair
    SC.box(L, -0.25, 0.25, 0, 1.05, 2.15, 2.65, [60, 52, 50]); SC.box(L, -0.3, 0.3, 1.05, 1.1, 2.1, 2.7, [80, 70, 64]);
    SC.box(L, 2.2, 3.4, 0.98, 1.03, 2.2, 3.4, [70, 56, 44]); SC.sprite(L, 2.6, 1.03, 2.6, 0.28, 0.4, (ctx, P) => { P.lit = true; ctx.scale(0.28, 0.4); ICONS.lantern(ctx, P); });
    SC.box(L, 2.8, 3.25, 0.4, 0.45, -1.7, -1.3, [88, 70, 50]); SC.box(L, 2.8, 3.25, 0.45, 0.95, -1.36, -1.3, [88, 70, 50]);
    for (const [x, z] of [[2.83, -1.67], [3.22, -1.67], [2.83, -1.33], [3.22, -1.33]]) SC.box(L, x - 0.03, x + 0.03, 0, 0.4, z - 0.03, z + 0.03, [70, 56, 40]);
    // items
    const decoy = !!L.diff.decoys, broken = L.diff.tier >= 2, sheets = L.diff.tier >= 2, runsDown = L.diff.tier >= 3, need = L.tier(4, 4, 6);
    const boxSpots = [{ x: 2.6, y: 1.03, z: 3.0 }, { x: -2.2, y: 0, z: -2.0 }, { x: 3.0, y: 0.45, z: -1.5 }, { x: 0.9, y: 0, z: -3.1 }, { x: -3.0, y: 0, z: 1.6 }];
    const keySpots = [{ x: 0, y: 1.1, z: 2.4 }, { x: 1.8, y: 0, z: 2.2 }, { x: 3.1, y: 0, z: 0.9 }, { x: 2.9, y: 1.03, z: 2.4 }, { x: -1.6, y: 0, z: -2.6 }];
    mkItem(L, 'boxkey', 'Small key', keySpots, { w: 0.16, h: 0.16, flat: true, tool: true, icon: 'keys' });
    if (!broken) mkItem(L, 'musicbox', 'Music box', boxSpots, { w: 0.34, h: 0.34, flat: true });
    else {
      mkItem(L, 'brokenbox', 'Music box', boxSpots, { w: 0.34, h: 0.34, flat: true });
      mkItem(L, 'spring', 'Box spring', boxSpots, { w: 0.2, h: 0.24, flat: true });
      mkRecipe(L, { parts: ['brokenbox', 'spring'], result: { id: 'musicbox', name: 'Music box', opts: { w: 0.34, h: 0.34 } }, sfx: 'fit', text: 'The spring goes back in. It might hold.' });
    }
    if (decoy) mkItem(L, 'oldkey', 'Small key', keySpots, { w: 0.16, h: 0.16, flat: true, tool: true, icon: 'keys', decoy: true, decoyText: 'It does not fit the box.' });
    if (sheets) { s.mirrors[0].live = false; s.mirrors[1].live = false; }
    for (const [k, id, name] of [[0, 'sheetN', 'Dust sheet'], [1, 'sheetE', 'Dust sheet']]) if (sheets) {
      const m = s.mirrors[k];
      mkTarget(L, { id, name, deg: m.deg, dist: 3.4, y: 0.2, w: 1.75, h: 2.4, hint() { return m.live ? 'Pulled down.' : 'A dust sheet over the glass.'; }, onClick() { if (m.live) return false; m.live = true; AUDIO.sfx('hiss'); G.say('The sheet comes down. Glass.', 'Glass.'); return true; } });
    }
    Object.assign(s, { placed: false, wound: 0, playing: false, playT: 0, luredOut: false, tune: 0 });
    const ped = mkTarget(L, {
      id: 'pedestal', name: 'Pedestal', x: 0, y: 1.1, z: 2.4, w: 0.7, h: 0.7, accepts: ['musicbox'],
      hint() { return !s.placed ? 'An empty pedestal, waiting for something.' : s.playing ? 'Playing.' : 'The music box. Wind it. ' + Math.max(0, need - s.wound) + ' more.'; },
      use(item) { s.placed = true; ped.accepts = []; AUDIO.sfx('drop'); G.say('The box sits on the pedestal. It needs winding.', 'There.'); return true; },
      onClick() {
        if (!s.placed) return false;
        if (s.playing) { G.say('Let it play.', 'Playing.'); return true; }
        if (!G.hasItem('boxkey')) { G.say('It needs its key.', 'Not like this.'); AUDIO.sfx('nope'); return true; }
        s.wound++; AUDIO.sfx('ratchet');
        if (s.wound >= need) { s.wound = 0; s.playing = true; s.playT = runsDown ? 20 : Infinity; s.tune = 0; const c = c0(); if (c.lane.follow) { c.retarget(1); c.lured = true; L.lane = c.lane; L.laneIdx = 1; L.barrierDist = 2.1; } c.hold = null; G.say('The tune starts. Something behind you turns its head.', 'It plays.'); }
        return true;
      },
    });
    if (L.diff.tier >= 3) mkTarget(L, {
      id: 'rope', name: 'Bell rope', x: 1.3, y: 0.5, z: -3.35, w: 0.2, h: 1.6, hold: 2.0,
      hint() { return s.luredOut ? 'Rung.' : 'A rope through the roof. The carousel bell is on the other end.'; },
      use(item) { if (item !== null) return false; s.luredOut = true; AUDIO.sfx('bell'); const c = c0(); c.retarget(2); c.lured = true; c.hold = null; c.distFn = (cr, dt) => cr.dist + dt * 1.4; L.lane = c.lane; L.laneIdx = 2; G.say('The bell. It goes out to the carousel.', 'It goes.'); return true; },
    });
    // seen means: a live mirror is on screen. Once lured it is out in the open and seen the usual way.
    L.visFrac = c => {
      if (!c.lane.follow) return APPROACH.visFrac(L, c.lane, c, null);
      let best = 0;
      for (const m of s.mirrors) {
        if (!m.live) continue;
        const p = L.at(m.deg, 3.5, 0.25), r = R.projectRect(p[0], p[1], p[2], 1.6, 2.2, null);
        if (!r) continue;
        const ox = Math.max(0, Math.min(r.x + r.w, R.W) - Math.max(r.x, 0)), oy = Math.max(0, Math.min(r.y + r.h, R.H) - Math.max(r.y, 0));
        best = Math.max(best, ox * oy / Math.max(1e-6, r.w * r.h));
      }
      return best;
    };
    L.isWon = () => { const c = c0(); return (s.playing && c.lane.idx === 1 && c.dist <= 2.15) || (s.luredOut && c.dist >= 12); };
    L.objectiveText = () => s.luredOut ? 'It is going out to the carousel.' : !s.placed ? 'Find the music box and its key. Put the box on the pedestal.' : s.playing ? 'It is coming to the box. Keep still.' : 'Wind the music box (' + s.wound + '/' + need + ').';
    L.update = dt => {
      const c = c0();
      if (s.playing) {
        s.tune -= dt; if (s.tune <= 0) { s.tune = 3.2; AUDIO.sfx('musicbox', Math.sin(wrapPi((L.facing) - G.cam.yaw)) * 0.7); }
        if (s.playT !== Infinity) { s.playT -= dt; if (s.playT <= 0) { s.playing = false; c.hold = c.dist; G.say('The spring runs down. It stops where it is.', 'It stops.'); } }
      }
    };
    L.dynamic = () => {
      const c = c0();
      // what the mirrors show: the thing, at the distance a reflection would be, seen through each live mirror
      if (c.lane.follow && !L.won) for (const m of s.mirrors) {
        if (!m.live) continue;
        const dd = 7 + c.dist, p = L.at(m.deg, dd, 0);
        R.add({ kind: 'sprite', x: p[0], y: p[1], z: p[2], w: CR.w, h: CR.h, dist: dd, fogScale: 0.6, draw: (ctx, P) => CR.draw(ctx, c, P) });
      }
      for (const [k] of [[0], [1]]) if (sheets && !s.mirrors[k].live) SC.withYaw(L, s.mirrors[k].deg, () => R.add(SC.mkQuad(L, [-0.95, 0.1, 3.44], [0.95, 0.1, 3.44], [0.95, 2.6, 3.44], [-0.95, 2.6, 3.44], [170, 160, 140])));
      if (s.placed) R.add(SC.mkSprite(L, 0, 1.1, 2.4, 0.34, 0.34, (ctx, P) => { ctx.scale(0.34, 0.34); ICONS.musicbox(ctx, P); if (s.playing) { ctx.translate(0, 0.72); ctx.rotate(Math.sin(L.t * 4) * 0.4); P_ell(ctx, 0, 0.06, 0.045, 0.08, P.col([230, 220, 210])); } }));
    };
    L.aftermath = (t, dt) => { if (!s.after) { s.after = true; Seq.play({ dur: 6, beats: [{ at: 2.5, toast: 'It sways.' }] }); } return t >= 6; };
    L.floor = { poly: [[-3.3, -3.3], [3.3, -3.3], [3.3, 3.3], [-3.3, 3.3]], y: 0 };
  }
});
