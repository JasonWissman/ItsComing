'use strict';
// ============================================================ 10. THE MIRROR MAZE ============================================================
// The look-away night turned inside out: it is always behind you and you only ever see it in the glass.
// It moves while the mirror you are facing does not show it. A mirror in the middle of every wall and a pedestal
// before each; one mirror is not like the others (a moon on its crest, and in it the thing has its back to you),
// and the music box belongs on that mirror's pedestal, fitted with its own key and wound.
LEVELS.push({
  id: 'mirrors', title: 'The Mirror Maze', facing: 0, eyeH: 1.65, laneMode: 'default', laneSwitch: false,
  pal: { skyTop: [14, 8, 8], fog: [58, 40, 36], ground: [30, 26, 26], fogDist: 40 },
  ambient: { wind: 0.5, drone: 0.9, droneFreq: 55, windFreq: 340 },
  weather: { kind: 'ash', density: 1.0, wind: 0.3 },
  lights: [{ x: -40, y: 2, z: 5, r: 60, i: 0.5, color: [255, 120, 40], flicker: 0.4 }, { x: 2.6, y: 1.3, z: 2.6, r: 5, i: 0.4, color: [255, 200, 140], flicker: 0.15 }],
  text: {
    intro: 'A hall of mirrors at the edge of the fair, after closing. Something is burning to the west and the ash is coming down through the roof.<br>There is someone behind you. There is always someone behind you. You can only see it in the glass, and it only comes while the glass in front of you does not show it. One of the mirrors is not like the others.',
    hint: 'Face a mirror square on to hold it. The odd mirror has a moon on its frame, and in it the thing has its back to you: put the music box on the pedestal in front of that one, fit the key with the heart and wind it.',
    objective: 'Find the odd mirror. Put the music box on its pedestal, fit its key, wind it.',
    death: { default: 'You turned round.', wrong: 'The tune played for nobody, and it was already behind you.' },
    win: 'It stood by the pedestal swaying to the tune, smiling its painted smile, while the ash came down, and did not look at you once.',
    fragment: 'You have been humming it for days. Nobody at work knows it.',
  },
  lanes: [
    { follow: 'behind', name: 'behind you', barrierDist: 0, default: true },
    // lured, it comes in through the boards beside a pedestal (22 degrees left of that mirror) and stops next to it
    { deg: 338, name: 'the north pedestal', barrierDist: 2.6, noSwitch: true, blockers: [[3.72, 99]] },
    { deg: 68, name: 'the east pedestal', barrierDist: 2.6, noSwitch: true, blockers: [[3.72, 99]] },
    { deg: 158, name: 'the south pedestal', barrierDist: 2.6, noSwitch: true, blockers: [[3.72, 99]] },
    { deg: 248, name: 'the west pedestal', barrierDist: 2.6, noSwitch: true, blockers: [[3.72, 99]] },
    // the way out through the south wall, right of the mirror as you face it, to the carousel (the bell rope's lure)
    { deg: 213.3, name: 'the carousel', barrierDist: 0, noSwitch: true },
  ],
  creatures: [{ type: 'other', startDist: 30, time: 70, gamma: 0.8, seenMult: 0, unseenMult: 1.0 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, CR = CREATURES.other, c0 = () => L.creatures[0];
    const board = [78, 40, 48], boardD = [54, 28, 34], gilt = [150, 120, 60], tileA = [118, 108, 98], tileB = [40, 36, 36];
    const DIRS = ['north', 'east', 'south', 'west'], CAROUSEL = 5;
    SC.stars(L, 101, 20, 0.2);
    for (let x = -3.5; x < 3.5; x += 0.7) for (let z = -3.5; z < 3.5; z += 0.7) SC.floorQ(L, x, z, x + 0.7, z + 0.7, 0.004, ((Math.round(x / 0.7) + Math.round(z / 0.7)) & 1) ? tileA : tileB);
    SC.quad(L, [-3.6, 3.2, -3.6], [3.6, 3.2, -3.6], [3.6, 3.2, 3.6], [-3.6, 3.2, 3.6], [40, 30, 30]);
    // four mirrors, one in the middle of each wall, each a hole in a painted wall with a dark room behind the glass
    s.odd = Math.floor(L.rand() * 4);
    s.mirrors = [0, 90, 180, 270].map((deg, k) => ({ deg, live: true, odd: k === s.odd }));
    const crest = (ctx, P, odd) => {
      const g = P.col(gilt), gd = P.col([104, 80, 38]);
      if (odd) { P_ell(ctx, 0, 0.5, 0.34, 0.34, g); P_ell(ctx, 0.15, 0.57, 0.28, 0.28, P.col(board)); return; }   // a moon: a gilt disc with a bite of wall out of it
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; P_line(ctx, Math.cos(a) * 0.24, 0.5 + Math.sin(a) * 0.24, Math.cos(a) * 0.42, 0.5 + Math.sin(a) * 0.42, 0.06, g); }
      P_ell(ctx, 0, 0.5, 0.26, 0.26, g); P_ell(ctx, 0, 0.5, 0.15, 0.15, gd);                                  // a sun
    };
    for (const m of s.mirrors) {
      const south = m.deg === 180;   // the south wall also has the way out, to the right of the mirror as you face it
      SC.window(L, { deg: m.deg, z: 3.5, x: 0, w: 1.6, y0: 0.25, y1: 2.45, wallH: 3.2, left: -3.5, right: south ? 1.7 : 3.5, color: board });
      if (south) SC.doorway(L, { deg: 180, z: 3.5, x: 2.3, w: 1.2, h: 2.3, wallH: 3.2, left: 1.7, right: 3.5, color: board });
      SC.withYaw(L, m.deg, () => {
        for (const [x0, x1, y0, y1] of [[-0.92, -0.8, 0.13, 2.57], [0.8, 0.92, 0.13, 2.57], [-0.92, 0.92, 0.13, 0.25], [-0.92, 0.92, 2.45, 2.57]]) SC.wallV(L, x0, 3.47, x1, 3.47, y0, y1, gilt);
        SC.sprite(L, 0, 2.55, 3.46, 0.3, 0.3, (ctx, P) => { ctx.scale(0.3, 0.3); crest(ctx, P, m.odd); });
        SC.quad(L, [-0.86, 0.2, 3.62], [0.86, 0.2, 3.62], [0.86, 2.5, 3.62], [-0.86, 2.5, 3.62], [20, 16, 22], { dist: 60, sortDist: 7.2 });   // drawn over anything behind the wall, under the reflection
        SC.quad(L, [-0.86, 0.2, 3.61], [0.86, 0.2, 3.61], [0.86, 0.62, 3.61], [-0.86, 0.62, 3.61], [44, 38, 36], { dist: 59.5, sortDist: 7.15 });
        SC.quad(L, [-0.8, 0.25, 3.48], [0.8, 0.25, 3.48], [0.8, 2.45, 3.48], [-0.8, 2.45, 3.48], [120, 140, 170], { alpha: 0.2, noLight: true });
        SC.quad(L, [-0.7, 1.9, 3.475], [-0.5, 1.9, 3.475], [0.1, 2.4, 3.475], [-0.1, 2.4, 3.475], [230, 230, 240], { alpha: 0.12, noLight: true });
        for (let y = 0.5; y < 3.2; y += 0.5) {
          SC.wallV(L, -3.5, 3.49, -0.92, 3.49, y, y + 0.04, boardD);
          if (!south || y > 2.3) SC.wallV(L, 0.92, 3.49, 3.5, 3.49, y, y + 0.04, boardD);
          else { SC.wallV(L, 0.92, 3.49, 1.7, 3.49, y, y + 0.04, boardD); SC.wallV(L, 2.9, 3.49, 3.5, 3.49, y, y + 0.04, boardD); }
        }
        for (let x = -3.1; x < 3.5; x += 0.6) if (Math.abs(x) > 1.1) SC.sprite(L, x, 2.85, 3.46, 0.1, 0.12, (ctx, P) => { ctx.scale(0.1, 0.12); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([70, 60, 50])); });
      });
    }
    // the way out onto the dark fair, curtains pulled aside: the bell six metres out, the carousel beyond
    const CAR = L.lanes[CAROUSEL].deg * DEG, carAt = d => [Math.sin(CAR) * d, Math.cos(CAR) * d];
    for (const [x0, x1] of [[-2.9, -2.62], [-1.98, -1.7]]) SC.wallV(L, x0, -3.52, x1, -3.52, 0, 2.3, [70, 20, 30], { alpha: 0.85 });
    // the aperture of the way out, seen along its lane: the doorway (x -2.9..-1.7 in the south wall) projected across the lane
    L.addAperture(CAROUSEL, { z: 4.19, x0: -0.54, x1: 0.47, y0: 0.12, y1: 2.25 });
    SC.floorQ(L, -80, -80, 80, -3.6, -0.01, [46, 42, 40]);
    const bp = carAt(6);
    SC.box(L, bp[0] - 0.1, bp[0] + 0.1, 0, 3.4, bp[1] - 0.1, bp[1] + 0.1, [40, 36, 34]); SC.sprite(L, bp[0], 3.4, bp[1], 0.35, 0.4, (ctx, P) => { ctx.scale(0.35, 0.4); P_ell(ctx, 0, 0.55, 0.45, 0.42, P.col([170, 140, 70])); P_rect(ctx, -0.06, 0.95, 0.12, 0.05, P.col([90, 80, 60])); });
    const [X, Z] = carAt(14);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; SC.box(L, X + Math.sin(a) * 5 - 0.1, X + Math.sin(a) * 5 + 0.1, 0, 2.6, Z + Math.cos(a) * 5 - 0.1, Z + Math.cos(a) * 5 + 0.1, [60, 50, 44]); }
    SC.quad(L, [X - 5.5, 2.6, Z + 5.5], [X + 5.5, 2.6, Z + 5.5], [X + 5.5, 2.6, Z - 5.5], [X - 5.5, 2.6, Z - 5.5], [90, 40, 44]);
    SC.quad(L, [X - 5.5, 2.6, Z + 5.5], [X + 5.5, 2.6, Z + 5.5], [X, 5.0, Z], [X, 5.0, Z], [110, 50, 54]); SC.quad(L, [X - 5.5, 2.6, Z - 5.5], [X + 5.5, 2.6, Z - 5.5], [X, 5.0, Z], [X, 5.0, Z], [80, 36, 40]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.3; SC.sprite(L, X + Math.sin(a) * 3.2, 0.6, Z + Math.cos(a) * 3.2, 0.9, 1.4, (ctx, P) => { ctx.scale(0.9, 1.4); P_ell(ctx, 0, 0.55, 0.45, 0.3, P.col([120, 110, 100])); P_rect(ctx, -0.05, 0, 0.1, 0.55, P.col([80, 70, 60])); P_ell(ctx, 0.3, 0.7, 0.14, 0.12, P.col([120, 110, 100])); }); }
    const rng = mulberry32(110);
    for (let i = 0; i < 14; i++) {
      const x = (rng() - 0.5) * 60, z = -8 - rng() * 50, along = x * Math.sin(CAR) + z * Math.cos(CAR), lat = x * Math.cos(CAR) - z * Math.sin(CAR), h = 2.2 + rng() * 2;
      if (Math.hypot(x - X, z - Z) < 9 || (along > 0 && Math.abs(lat) < 3)) continue;   // clear of the carousel and of the way out to it
      SC.box(L, x - 1.5, x + 1.5, 0, h, z - 1, z + 1, [40, 34, 34]);
    }
    SC.sprite(L, -60, 0, 8, 40, 6, (ctx, P) => { ctx.scale(40, 6); const g = ctx.createRadialGradient(0, 0.15, 0.02, 0, 0.15, 0.6); g.addColorStop(0, 'rgba(255,120,40,0.7)'); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); }, { noFog: true, noLight: true, dist: 100 });
    // furniture: a pedestal before each mirror, a shelf with a lamp, a chair
    const peds = s.mirrors.map(m => { const x = +(Math.sin(m.deg * DEG) * 2.2).toFixed(2), z = +(Math.cos(m.deg * DEG) * 2.2).toFixed(2); SC.box(L, x - 0.2, x + 0.2, 0, 0.7, z - 0.2, z + 0.2, [60, 52, 50]); SC.box(L, x - 0.26, x + 0.26, 0.7, 0.75, z - 0.26, z + 0.26, [80, 70, 64]); return { x, z }; });
    SC.box(L, 2.2, 3.4, 0.98, 1.03, 2.2, 3.4, [70, 56, 44]); STORY.lamp(L, 2.6, 1.03, 2.6, { lit: true, scale: 0.85 });
    SC.box(L, 2.8, 3.25, 0.4, 0.45, -1.7, -1.3, [88, 70, 50]); SC.box(L, 2.8, 3.25, 0.45, 0.95, -1.36, -1.3, [88, 70, 50]);
    for (const [x, z] of [[2.83, -1.67], [3.22, -1.67], [2.83, -1.33], [3.22, -1.33]]) SC.box(L, x - 0.03, x + 0.03, 0, 0.4, z - 0.03, z + 0.03, [70, 56, 40]);
    // items: the box (broken on the harder tiers) and a handful of small keys, only one of them its own
    const broken = L.diff.tier >= 2, sheets = L.diff.tier >= 2, runsDown = L.diff.tier >= 3, need = L.tier(4, 4, 6);
    const boxSpots = [{ x: 2.6, y: 1.03, z: 3.0 }, { x: -2.7, y: 0, z: -2.7 }, { x: 2.0, y: 0, z: -2.6 }, { x: -2.6, y: 0, z: 1.4 }, { x: -1.3, y: 0, z: 3.0 }];
    const keySpots = [{ x: 2.95, y: 1.03, z: 2.45 }, { x: 3.02, y: 0.45, z: -1.52 }, { x: -2.9, y: 0, z: 2.9 }, { x: 2.9, y: 0, z: -2.9 }, { x: 1.6, y: 0, z: 3.1 }, { x: -3.1, y: 0, z: -1.0 }, { x: 3.1, y: 0, z: 1.2 }, { x: 1.2, y: 0, z: -3.1 }];
    const decoyKeys = [['roundkey', 'keyRound'], ['squarekey', 'keySquare']].concat(L.diff.tier >= 2 ? [['cloverkey', 'keyClover']] : [], L.diff.tier >= 3 ? [['ironkey', 'keyIron']] : []);
    const keyIds = ['boxkey'].concat(decoyKeys.map(d => d[0]));
    mkItem(L, 'boxkey', 'Small key', keySpots, { w: 0.16, h: 0.16, flat: true, tool: true, icon: 'boxkey' });
    for (const [id, icon] of decoyKeys) mkItem(L, id, 'Small key', keySpots, { w: 0.16, h: 0.16, flat: true, tool: true, icon, decoy: true, decoyText: 'It does not fit the box.' });
    if (!broken) mkItem(L, 'musicbox', 'Music box', boxSpots, { w: 0.34, h: 0.34, flat: true });
    else {
      mkItem(L, 'brokenbox', 'Music box', boxSpots, { w: 0.34, h: 0.34, flat: true });
      mkItem(L, 'spring', 'Box spring', boxSpots, { w: 0.2, h: 0.24, flat: true });
      mkRecipe(L, { parts: ['brokenbox', 'spring'], result: { id: 'musicbox', name: 'Music box', opts: { w: 0.34, h: 0.34 } }, sfx: 'fit', text: 'The spring goes back in. It might hold.' });
    }
    // the harder tiers put dust sheets over two of the mirrors, chosen by the night
    if (sheets) {
      const order = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) { const j = Math.floor(L.rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      for (const k of order.slice(0, 2)) {
        const m = s.mirrors[k]; m.live = false;
        mkTarget(L, { id: 'sheet' + k, name: 'Dust sheet', deg: m.deg, dist: 3.4, y: 0.2, w: 1.75, h: 2.4, hint() { return m.live ? 'Pulled down.' : 'A dust sheet over the glass.'; }, onClick() { if (m.live) return false; m.live = true; AUDIO.sfx('hiss'); G.say('The sheet comes down. Glass.', 'Glass.'); return true; } });
      }
    }
    Object.assign(s, { placedAt: -1, keyIn: false, wound: 0, playing: false, playT: 0, luredOut: false, tune: 0, wrongAt: -99 });
    const pedTargets = [];
    const refresh = () => pedTargets.forEach((t, k) => { t.accepts = s.placedAt < 0 ? ['musicbox'] : (s.placedAt === k && !s.keyIn) ? keyIds.slice() : []; });
    // the tune: on the odd mirror's pedestal it lures the thing in beside the box; on any other it plays for nobody
    const startTune = k => {
      const c = c0();
      s.playing = true; s.playT = runsDown ? 9 : Infinity; s.tune = 0;
      if (!c.lane.follow) { c.hold = null; G.say('The tune starts again. It walks on to the box.', 'It plays.'); return; }   // rewound on Nightmare
      if (k !== s.odd) {
        s.playing = false; s.placedAt = -1; s.keyIn = false; s.wrongAt = L.t;
        const box = L.items.find(i => i.id === 'musicbox'); box.uses = 1; G.inv.push(box); G.active = G.inv.length - 1; G.invSig = '';
        const d = Math.max(c.catchDist + 1.5, c.dist * 0.65); c.u = clamp(1 - Math.pow(d / c.D0, 1 / c.gamma), c.u, 0.995); c.hitched = true;
        AUDIO.sfx('musicbox', 0); G.shake(0.25); refresh();
        G.say('The tune plays for nobody, and stops. Behind you something takes three quick steps. It was not this mirror.', 'The tune plays for nobody, and stops. Behind you something takes three quick steps.');
        return;
      }
      const ln = 1 + k;
      c.retarget(ln); c.lured = true; c.ignoresGaze = true; L.lane = c.lane; L.laneIdx = ln; L.barrierDist = c.lane.barrierDist;
      c.dist = Math.min(c.dist, 3.65); c.hold = null;
      c.distFn = (cr, dt) => Math.max(cr.lane.barrierDist, cr.dist - dt * 0.12);   // it steps in through the boards and walks slowly to the tune
      G.say('The tune starts. Something behind you turns its head, and smiles.', 'It plays.');
    };
    peds.forEach((p, k) => {
      const t = mkTarget(L, {
        id: 'pedestal' + k, name: 'Pedestal', x: p.x, y: 0, z: p.z, w: 0.6, h: 1.2, accepts: ['musicbox'],
        hint() {
          if (s.placedAt === k) return s.playing ? 'Playing.' : !s.keyIn ? 'The music box. It needs its own key.' : 'Wind it. ' + (need - s.wound) + ' more.';
          return s.placedAt >= 0 ? 'An empty pedestal.' : k === s.odd ? 'The pedestal before the odd mirror.' : 'A pedestal before the ' + DIRS[k] + ' mirror.';
        },
        use(item) {
          if (item.id === 'musicbox') { if (s.placedAt >= 0) return false; s.placedAt = k; s.wound = 0; AUDIO.sfx('drop'); G.say('The box sits on the pedestal. It needs its own key, and winding.', 'There.'); refresh(); return true; }
          if (item.id === 'boxkey') { if (s.placedAt !== k || s.keyIn) return false; s.keyIn = true; AUDIO.sfx('fit'); G.say('The key with the heart fits. Now wind it.', 'It fits.'); refresh(); return true; }
          return false;
        },
        onClick() {
          if (s.placedAt !== k) return false;
          if (s.playing) { G.say('Let it play.', 'Playing.'); return true; }
          if (!s.keyIn) return false;   // the key first: what you carry is tried
          s.wound++; AUDIO.sfx('ratchet');
          if (s.wound >= need) { s.wound = 0; startTune(k); }
          return true;
        },
      });
      pedTargets.push(t);
    });
    if (runsDown) SC.box(L, -1.32, -1.28, 0.5, 3.2, -3.36, -3.34, [150, 130, 90]); // the rope itself, hanging through the roof where the target is
    if (runsDown) mkTarget(L, {
      id: 'rope', name: 'Bell rope', x: -1.3, y: 0.5, z: -3.35, w: 0.2, h: 1.6, hold: 2.0, hidden: true, // the second lure: only there once the spring has run down
      hint() { return s.luredOut ? 'Rung.' : 'A rope through the roof. The carousel bell is on the other end.'; },
      use(item) { if (item !== null) return false; s.luredOut = true; L.text.win = 'It walked out to the carousel and stood under the bell while the ash came down, and did not look back once.'; AUDIO.sfx('bell'); const c = c0(); c.retarget(CAROUSEL); c.lured = true; c.ignoresGaze = true; c.hold = null; c.distFn = (cr, dt) => cr.dist + dt * 1.4; L.lane = c.lane; L.laneIdx = CAROUSEL; G.say('The bell. It goes out to the carousel.', 'It goes.'); return true; },
    });
    // seen means: a live mirror is square in front of you. Once lured it is out in the open and seen the usual way.
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
    L.isWon = () => { const c = c0(); return (s.playing && c.lured && c.lane.idx === 1 + s.odd && c.dist <= c.lane.barrierDist + 0.05) || (s.luredOut && c.dist >= 12); };
    L.deathCause = () => (L.t - s.wrongAt < 8 ? 'wrong' : null);
    L.objectiveText = () => s.luredOut ? 'It is going out to the carousel.' : s.playing ? 'It is coming to the box. Keep still.'
      : s.placedAt < 0 ? 'The odd mirror is the ' + DIRS[s.odd] + ' one. Put the music box on its pedestal.' : !s.keyIn ? 'Fit the key with the heart.' : 'Wind the music box (' + s.wound + '/' + need + ').';
    L.update = dt => {
      const c = c0();
      if (s.playing) {
        s.tune -= dt; if (s.tune <= 0) { s.tune = 3.2; const p = peds[s.placedAt] || peds[0]; AUDIO.sfx('musicbox', Math.sin(wrapPi(Math.atan2(p.x, p.z) + L.facing - G.cam.yaw)) * 0.7); }
        // on Nightmare the spring runs down part way through the walk (never during the aftermath); the bell rope shows itself then
        if (s.playT !== Infinity && !L.won) { s.playT -= dt; if (s.playT <= 0) { s.playing = false; c.hold = c.dist; G.say('The spring runs down. It stops where it is.', 'It stops.'); const rope = L.targets.find(t => t.id === 'rope'); if (rope) rope.hidden = false; } }
      }
    };
    L.dynamic = () => {
      const c = c0();
      // what the mirrors show: the thing, at the distance a reflection would be; in the odd one it has its back to you
      if (c.lane.follow && !L.won) for (const m of s.mirrors) {
        if (!m.live) continue;
        const dd = 7 + c.dist, p = L.at(m.deg, dd, 0), odd = m.odd;
        R.add({ kind: 'sprite', x: p[0], y: p[1], z: p[2], w: CR.w, h: CR.h, dist: dd, sortDist: 7.1, fogScale: 0.6, draw: (ctx, P) => { c.back = odd; CR.draw(ctx, c, P); c.back = false; } });
      }
      for (const m of s.mirrors) if (!m.live) SC.withYaw(L, m.deg, () => R.add(SC.mkQuad(L, [-0.95, 0.1, 3.44], [0.95, 0.1, 3.44], [0.95, 2.6, 3.44], [-0.95, 2.6, 3.44], [170, 160, 140])));
      if (s.placedAt >= 0) { const p = peds[s.placedAt]; R.add(SC.mkSprite(L, p.x, 0.75, p.z, 0.34, 0.34, (ctx, P) => { ctx.scale(0.34, 0.34); ICONS.musicbox(ctx, P); if (s.playing) { ctx.translate(0, 0.72); ctx.rotate(Math.sin(L.t * 4) * 0.4); P_ell(ctx, 0, 0.06, 0.045, 0.08, P.col([230, 220, 210])); } })); }
    };
    L.aftermath = (t, dt) => { if (!s.after) { s.after = true; Seq.play({ dur: 6, beats: [{ at: 2.5, toast: s.luredOut ? 'It goes.' : 'It sways.' }] }); } return t >= 6; };
    L.floor = { poly: [[-3.3, -3.3], [3.3, -3.3], [3.3, 3.3], [-3.3, 3.3]], y: 0 };
  }
});
