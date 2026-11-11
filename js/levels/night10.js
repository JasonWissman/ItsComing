'use strict';
// ============================================================ 10. THE MIRROR MAZE ============================================================
// The look-away night turned inside out: it is always behind you and you only ever see it in the glass.
// It moves while the mirror you are facing does not show it. A mirror in the middle of every wall and a pedestal
// before each, all alike. In every glass it dances on the spot, a stiff, jerky wind-up doll's dance, in step in all of
// them; one mirror is not like the others: in it the dance is the mirror image of the rest (left and right swapped).
// The music box lies in one place and its crank in another. The box goes on any pedestal and the crank on the box's side,
// and a few turns of the crank before the odd mirror play its tune: the doll stops dancing, turns round once on the spot
// like the dancer on the box, and comes out through that glass for the box, quickly, lifts it off the pedestal, and takes
// it back in with it and away. Before any other mirror the first turn plays wrong notes and the crank sticks: in the glass
// the doll stops dancing, its face turns angry and it hops at you (three quick steps). A click on the box then lifts it
// back off, crank and all, to put before another mirror. Your hand is on the crank as it turns, wrenches at it when it jams
// (the box jumps), and takes the box back up off the pedestal; the crank tried on a bare pedestal feels about its top and
// comes back to your hand (G.refuse); a dust sheet is pulled down by hand and slides off the glass.
LEVELS.push({
  id: 'mirrors', title: 'The Mirror Maze', facing: 0, eyeH: 1.65, laneMode: 'default', laneSwitch: false,
  pal: { skyTop: [14, 8, 8], fog: [58, 40, 36], ground: [30, 26, 26], fogDist: 40 },
  ambient: { wind: 0.5, drone: 0.9, droneFreq: 55, windFreq: 340 },
  weather: { kind: 'ash', density: 1.0, wind: 0.3 },
  lights: [{ x: -40, y: 2, z: 5, r: 60, i: 0.5, color: [255, 120, 40], flicker: 0.4 }, { x: 2.6, y: 1.3, z: 2.6, r: 5, i: 0.4, color: [255, 200, 140], flicker: 0.15 }],
  text: {
    intro: 'You see a strange doll in the mirrors. They all look the same... mostly.',
    hint: 'Face a mirror square on to hold it. In every mirror it dances, and in the odd one it dances the other way round (the arm the others raise, it raises on the other side): put the music box on the pedestal in front of that one, then fit the crank to the box and turn it. Turned before any other mirror it plays wrong, and the thing in the glass is angry: click the box to take it back.',
    objective: 'Find the odd mirror. Put the music box on its pedestal, fit the crank, turn it.',
    death: { default: 'The strange doll leapt out from its mirror and grabbed you.', wrong: 'You played for an illusion. The creature surprised you from behind.' },
    win: 'It only wanted its music box.',
    fragment: 'You have been humming it for days. Nobody at work knows it.',
  },
  lanes: [
    { follow: 'behind', name: 'behind you', barrierDist: 0, default: true },
    // the tune fetches it out through the odd mirror, along that mirror's own line, seen through the glass (build adds the
    // glass as each one's aperture)
    { deg: 0, name: 'the north mirror', barrierDist: 0, noSwitch: true },
    { deg: 90, name: 'the east mirror', barrierDist: 0, noSwitch: true },
    { deg: 180, name: 'the south mirror', barrierDist: 0, noSwitch: true },
    { deg: 270, name: 'the west mirror', barrierDist: 0, noSwitch: true },
  ],
  creatures: [{ type: 'other', startDist: 30, time: 50, seenMult: 0, unseenMult: 1.0 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, CR = CREATURES.other, c0 = () => L.creatures[0];
    const board = [78, 40, 48], boardD = [54, 28, 34], gilt = [150, 120, 60], tileA = [118, 108, 98], tileB = [40, 36, 36];
    const DIRS = ['north', 'east', 'south', 'west'], TURNS = 4;
    SC.stars(L, 101, 20, 0.2);
    for (let x = -3.5; x < 3.5; x += 0.7) for (let z = -3.5; z < 3.5; z += 0.7) SC.floorQ(L, x, z, x + 0.7, z + 0.7, 0.004, ((Math.round(x / 0.7) + Math.round(z / 0.7)) & 1) ? tileA : tileB);
    SC.quad(L, [-3.6, 3.2, -3.6], [3.6, 3.2, -3.6], [3.6, 3.2, 3.6], [-3.6, 3.2, 3.6], [40, 30, 30]);
    // four mirrors, one in the middle of each wall, each a hole in a painted wall with a dark room behind the glass
    s.odd = Math.floor(L.rand() * 4);
    s.mirrors = [0, 90, 180, 270].map((deg, k) => ({ deg, live: true, odd: k === s.odd }));
    // which way round the doll dances in mirror k: s.lead in the three alike and the other way round in the odd one. Which
    // arm leads is rolled with each load (below), so the odd mirror is told only by comparing it with the others, never by
    // which arm one glass shows going up. s.shown[k] is what that glass last drew (when, its dance time, which way round,
    // and the pose)
    const sideOf = k => (s.mirrors[k].odd ? -1 : 1) * s.lead;
    s.shown = {};
    // every frame has the same crest, a gilt sun: the odd mirror shows itself only by what dances in it
    const crest = (ctx, P) => {
      const g = P.col(gilt), gd = P.col([104, 80, 38]);
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; P_line(ctx, Math.cos(a) * 0.24, 0.5 + Math.sin(a) * 0.24, Math.cos(a) * 0.42, 0.5 + Math.sin(a) * 0.42, 0.06, g); }
      P_ell(ctx, 0, 0.5, 0.26, 0.26, g); P_ell(ctx, 0, 0.5, 0.15, 0.15, gd);                                  // a sun
    };
    s.mirrors.forEach((m, k) => {
      const south = m.deg === 180;   // the south wall also has the way out, to the right of the mirror as you face it
      L.addAperture(1 + k, SC.window(L, { deg: m.deg, z: 3.5, x: 0, w: 1.6, y0: 0.25, y1: 2.45, wallH: 3.2, left: -3.5, right: south ? 1.7 : 3.5, color: board }));
      if (south) SC.doorway(L, { deg: 180, z: 3.5, x: 2.3, w: 1.2, h: 2.3, wallH: 3.2, left: 1.7, right: 3.5, color: board });
      SC.withYaw(L, m.deg, () => {
        for (const [x0, x1, y0, y1] of [[-0.92, -0.8, 0.13, 2.57], [0.8, 0.92, 0.13, 2.57], [-0.92, 0.92, 0.13, 0.25], [-0.92, 0.92, 2.45, 2.57]]) SC.wallV(L, x0, 3.47, x1, 3.47, y0, y1, gilt);
        SC.sprite(L, 0, 2.55, 3.46, 0.3, 0.3, (ctx, P) => { ctx.scale(0.3, 0.3); crest(ctx, P); });
        SC.quad(L, [-0.86, 0.2, 3.62], [0.86, 0.2, 3.62], [0.86, 2.5, 3.62], [-0.86, 2.5, 3.62], [20, 16, 22], { dist: 60, sortDist: 7.2 });   // drawn over anything behind the wall, under the reflection
        SC.quad(L, [-0.86, 0.2, 3.61], [0.86, 0.2, 3.61], [0.86, 0.62, 3.61], [-0.86, 0.62, 3.61], [44, 38, 36], { dist: 59.5, sortDist: 7.15 });
        SC.quad(L, [-0.8, 0.25, 3.48], [0.8, 0.25, 3.48], [0.8, 2.45, 3.48], [-0.8, 2.45, 3.48], [120, 140, 170], { alpha: 0.2, noLight: true });
        SC.quad(L, [-0.7, 1.9, 3.475], [-0.5, 1.9, 3.475], [0.1, 2.4, 3.475], [-0.1, 2.4, 3.475], [230, 230, 240], { alpha: 0.12, noLight: true });
        // the seams between the boards: each is cut to the wall piece it lies on and drawn straight after it (sorted by
        // that piece's distance), so every wall shows them, not only the pieces whose own distance happens to be larger
        const pieceDist = (a, b) => (Math.hypot(a, 3.5) + Math.hypot(b, 3.5)) / 2 - 0.005;
        for (let y = 0.5; y < 3.2; y += 0.5) {
          const seam = (x0, x1, a, b) => SC.wallV(L, x0, 3.49, x1, 3.49, y, y + 0.04, boardD, { sortDist: pieceDist(a, b) });
          seam(-3.5, -0.92, -3.5, -0.8);
          if (y > 2.9) seam(-0.92, 0.92, -0.8, 0.8);   // above the crest the seam runs on across the mirror's wall
          if (!south) seam(0.92, 3.5, 0.8, 3.5);
          else { seam(0.92, 1.7, 0.8, 1.7); if (y > 2.3) seam(1.7, 2.9, 1.7, 2.9); seam(2.9, 3.5, 2.9, 3.5); }
        }
        // a row of fairground bulbs, unlit after closing: a dim glass bulb on a brass socket
        for (let x = -3.1; x < 3.5; x += 0.6) if (Math.abs(x) > 1.1) SC.sprite(L, x, 2.85, 3.46, 0.1, 0.12, (ctx, P) => { ctx.scale(0.1, 0.12); P_rect(ctx, -0.26, 0, 0.52, 0.3, P.col([96, 76, 40])); P_ell(ctx, 0, 0.6, 0.4, 0.38, P.col([106, 92, 74])); P_ell(ctx, -0.13, 0.7, 0.1, 0.1, P.col([150, 138, 116])); });
      });
    });
    // the way out onto the dark fair, through the south wall to the right of its mirror: curtains pulled aside, and the
    // carousel beyond
    const OUT = 213.3 * DEG, outAt = d => [Math.sin(OUT) * d, Math.cos(OUT) * d];
    for (const [x0, x1] of [[-2.9, -2.62], [-1.98, -1.7]]) SC.wallV(L, x0, -3.52, x1, -3.52, 0, 2.3, [70, 20, 30]);
    SC.floorQ(L, -80, -80, 80, -3.6, -0.01, [46, 42, 40]);
    const [X, Z] = outAt(14);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; SC.box(L, X + Math.sin(a) * 5 - 0.1, X + Math.sin(a) * 5 + 0.1, 0, 2.6, Z + Math.cos(a) * 5 - 0.1, Z + Math.cos(a) * 5 + 0.1, [60, 50, 44]); }
    SC.quad(L, [X - 5.5, 2.6, Z + 5.5], [X + 5.5, 2.6, Z + 5.5], [X + 5.5, 2.6, Z - 5.5], [X - 5.5, 2.6, Z - 5.5], [90, 40, 44]);
    SC.quad(L, [X - 5.5, 2.6, Z + 5.5], [X + 5.5, 2.6, Z + 5.5], [X, 5.0, Z], [X, 5.0, Z], [110, 50, 54]); SC.quad(L, [X - 5.5, 2.6, Z - 5.5], [X + 5.5, 2.6, Z - 5.5], [X, 5.0, Z], [X, 5.0, Z], [80, 36, 40]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.3; SC.sprite(L, X + Math.sin(a) * 3.2, 0.6, Z + Math.cos(a) * 3.2, 0.9, 1.4, (ctx, P) => { ctx.scale(0.9, 1.4); P_ell(ctx, 0, 0.55, 0.45, 0.3, P.col([120, 110, 100])); P_rect(ctx, -0.05, 0, 0.1, 0.55, P.col([80, 70, 60])); P_ell(ctx, 0.3, 0.7, 0.14, 0.12, P.col([120, 110, 100])); }); }
    const rng = mulberry32(110);
    for (let i = 0; i < 14; i++) {
      const x = (rng() - 0.5) * 60, z = -8 - rng() * 50, along = x * Math.sin(OUT) + z * Math.cos(OUT), lat = x * Math.cos(OUT) - z * Math.sin(OUT), h = 2.2 + rng() * 2;
      if (Math.hypot(x - X, z - Z) < 9 || (along > 0 && Math.abs(lat) < 3)) continue;   // clear of the carousel and of the way out to it
      SC.box(L, x - 1.5, x + 1.5, 0, h, z - 1, z + 1, [40, 34, 34]);
    }
    SC.sprite(L, -60, 0, 8, 40, 6, (ctx, P) => { ctx.scale(40, 6); const g = ctx.createRadialGradient(0, 0.15, 0.02, 0, 0.15, 0.6); g.addColorStop(0, 'rgba(255,120,40,0.7)'); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); }, { noFog: true, noLight: true, dist: 100 });
    // furniture: a pedestal before each mirror, a table with a lamp, a chair.
    // A pedestal is a plinth, a column and a cap with a gilt edge, like the frames. It stands square on the line of sight,
    // so only the faces turned to the eye are built (the sides and backs never show, and drawn they would poke through the cap)
    const PED = 2.2;
    const pedArt = [];   // the pieces of each pedestal: pointed at, it glows in them
    const peds = s.mirrors.map(m => {
      pedArt.push(SC.grab(L, () => SC.withYaw(L, m.deg, () => {
        const top = (w, z0, z1, y, col) => SC.quad(L, [-w, y, z0], [w, y, z0], [w, y, z1], [-w, y, z1], col);
        top(0.25, 1.95, 2.45, 0.09, [86, 64, 46]); SC.wallV(L, -0.25, 1.95, 0.25, 1.95, 0, 0.09, [62, 45, 33]);
        SC.wallV(L, -0.16, 2.04, 0.16, 2.04, 0.09, 0.64, [84, 60, 42]);
        top(0.27, 1.93, 2.47, 0.75, [104, 78, 54]); SC.wallV(L, -0.27, 1.93, 0.27, 1.93, 0.64, 0.72, [80, 58, 40]); SC.wallV(L, -0.27, 1.93, 0.27, 1.93, 0.72, 0.75, gilt);
      })));
      return { x: +(Math.sin(m.deg * DEG) * PED).toFixed(2), z: +(Math.cos(m.deg * DEG) * PED).toFixed(2) };
    });
    // the lamp's table on four legs, each drawn before the parts of the top that hide its upper end (the near leg before
    // the top's front edges, the others before the top itself) and after the walls behind it
    SC.box(L, 2.2, 3.4, 0.98, 1.03, 2.2, 3.4, [70, 56, 44]);
    for (const [x, z] of [[2.27, 2.27], [3.33, 2.27], [2.27, 3.33], [3.33, 3.33]]) SC.sprite(L, x, 0, z, 0.05, 0.98, (ctx, P) => { ctx.scale(0.05, 0.98); P_rect(ctx, -0.5, 0, 1, 1, P.col([54, 43, 34])); }, { sortDist: x + z < 5 ? 3.9 : 4.15 });
    // the chair stands with its back to the east wall, facing into the room, so what lies on its seat is in plain view
    SC.box(L, 2.8, 3.19, 0.4, 0.45, -1.7, -1.3, [88, 70, 50]); SC.box(L, 3.19, 3.25, 0.4, 0.95, -1.7, -1.3, [88, 70, 50]);
    for (const [x, z] of [[2.83, -1.67], [3.22, -1.67], [2.83, -1.33], [3.22, -1.33]]) SC.box(L, x - 0.03, x + 0.03, 0, 0.4, z - 0.03, z + 0.03, [70, 56, 40]);
    // items: the music box in one place and its crank in another, well apart and in another direction from you (never in
    // the same corner, nor the two along one wall where the first view finds both)
    const boxSpots = [{ x: 2.6, y: 1.03, z: 3.0 }, { x: -2.7, y: 0, z: -2.7 }, { x: 2.0, y: 0, z: -2.6 }, { x: -2.6, y: 0, z: 1.4 }, { x: -1.3, y: 0, z: 3.0 }];
    const crankSpots = [{ x: 2.95, y: 1.03, z: 2.45 }, { x: 3.02, y: 0.45, z: -1.52 }, { x: -2.9, y: 0, z: 2.9 }, { x: 2.9, y: 0, z: -2.9 }, { x: 1.6, y: 0, z: 3.1 }, { x: -3.1, y: 0, z: -1.0 }, { x: 3.1, y: 0, z: 1.2 }, { x: 1.2, y: 0, z: -3.1 }];
    const box = mkItem(L, 'musicbox', 'Music box', boxSpots, { w: 0.36, h: 0.36, flat: true });
    const apart = p => Math.hypot(p.x - box.x, p.z - box.z) > 2.2 && Math.abs(wrapPi(Math.atan2(p.x, p.z) - Math.atan2(box.x, box.z))) > 60 * DEG;
    mkItem(L, 'crank', 'Crank handle', crankSpots.filter(apart), { w: 0.28, h: 0.28, flat: true, icon: 'boxcrank', held: { grip: 'fist', at: [-0.05, 0.3], axis: Math.PI / 2, angle: -0.6, size: 0.22, tip: [0.3, 0.3] } });   // (by its arm, its knob up and its socket out in front)
    // Nightmare puts dust sheets over two of the mirrors, chosen by the night
    if (L.nightmare) {
      const order = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) { const j = Math.floor(L.rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      for (const k of order.slice(0, 2)) {
        const m = s.mirrors[k]; m.live = false;
        // pulled down: the hand goes out to its hem and pulls, and it slides off the glass into a heap (s.sheetFall, from when
        // the hand has it)
        mkTarget(L, { id: 'sheet' + k, name: 'Dust sheet', deg: m.deg, dist: 3.4, y: 0.2, w: 1.75, h: 2.4, hint() { return m.live ? 'Pulled down.' : 'A dust sheet over the glass.'; }, onClick() {
          if (m.live) return false;
          m.live = true; this.hidden = true; G.say('The sheet comes down. Glass.', 'Glass.');
          const r = G.reach(this, { style: 'pull', at: [0.4, 0.4], sfx: 'flop' });
          s.sheetFall = { k, t0: L.t + (r ? r.out : 0) };   // (L.update hisses as it goes)
          return true;
        } });
      }
    }
    // which side of the pedestal it will stand to take the box, and run off to behind the glass; the box's crank is on the
    // side away from it (s.flip). Behind the south mirror it always goes left: the way out is on its right, and running off
    // that way it would be seen through the doorway, outside the hall
    const sideRoll = L.rand();
    s.side = s.mirrors[s.odd].deg === 180 || sideRoll < 0.5 ? -1 : 1; s.flip = s.side > 0;
    s.lead = (sideRoll * 2) % 1 < 0.5 ? 1 : -1;   // the next bit of the same roll, so the layout and the doll's start are as they were
    // placedAt: the pedestal the box is on (-1: none); crankIn: its crank is in its side; turns: turns before the odd mirror;
    // sour: it has played wrong where it is, and its crank sticks; angryTill: the doll is angry until then
    Object.assign(s, { placedAt: -1, crankIn: false, turns: 0, crankA: 0, crankTo: 0, spin: 0, wrongAt: -99, sour: false, angryTill: -99 });
    const panTo = (x, z) => Math.sin(wrapPi(Math.atan2(x, z) + L.facing - G.cam.yaw)) * 0.7;
    const pedTargets = [];
    const refresh = () => pedTargets.forEach(t => { t.accepts = s.placedAt < 0 ? ['musicbox', 'crank'] : s.crankIn ? [] : ['crank']; });
    // lifted off a pedestal with its crank in, the box keeps it: you carry it so, and it goes down on the next one so
    const boxWithCrank = (ctx, P) => ICONS.musicbox(ctx, P, { crank: 0 });
    // the first turn before a wrong mirror: the comb drags out wrong notes and the crank sticks; in the glass its painted face
    // turns angry, and behind you something takes three quick steps (it hops in to two thirds of how far off it was, never
    // right up to you). The crank stays stuck, so a box turned before the wrong mirror costs one hop, not one a click
    // where the crank is on the box on pedestal k (its knob, out from the box's side), in the world: the hand goes there to
    // turn it. Box and crank are drawn as the music box's icon, BOXW across, its crank's knob about 0.38 of that out to the
    // side it is on, at about 0.3 of it up
    const crankAt = k => { const q = onLine(PED - 0.04, (s.flip ? -1 : 1) * 0.38 * BOXW, BOXY + 0.3 * BOXW, k); return { x: q[0], y: q[1], z: q[2] }; };
    // a turn of the crank is the hand's own (the box makes the sound): G.reach, kept quiet
    const turnHand = (t, k, style) => { const r = G.reach(t, { style, at: crankAt(k) }); if (r && style === 'pull') r.touched = 99; };
    const wrongTurn = p => {
      const c = c0(); s.wrongAt = L.t; s.sour = true; s.angryTill = L.t + 5; c.angry = 1;
      s.crankTo -= TAU * 0.6; G.shake(0.04);
      AUDIO.sfx('musicSour', panTo(p.x, p.z));
      const d = Math.max(c.catchDist + 1.5, c.dist * 0.65); c.u = clamp(1 - Math.pow(d / c.D0, 1 / c.gamma), c.u, 0.995); c.hitched = true;
      G.shake(0.25);
      for (let i = 0; i < 3; i++) setTimeout(() => { if (G.state === 'play') AUDIO.footstep('smiler', 0.45, 0); }, 120 + i * 150);
      G.say('Not the odd mirror: the notes come out wrong and the crank sticks, and in the glass its face has changed. Behind you something takes three quick steps.', 'The notes come out wrong. Behind you something takes three quick steps.');
    };
    // a click on the box on a pedestal lifts it back off, its crank in it if it was fitted
    const lift = k => {
      const t = pedTargets[k], withCrank = s.crankIn;
      s.placedAt = -1; s.crankIn = false; s.sour = false; t.name = 'Pedestal';
      s.crankA = s.crankTo = Math.round(s.crankTo / TAU) * TAU;   // the stuck crank comes back round to rest as you lift it
      box.withCrank = withCrank; box.icon = withCrank ? boxWithCrank : ICONS.musicbox;
      const at = L.pt(peds[k].x, BOXY, peds[k].z); box.x = at[0]; box.y = at[1]; box.z = at[2];
      G.hand.reach = null; HANDS.picked(box);   // up off the pedestal into your hand (the hand at its crank takes it)
      box.uses = 1; box.taken = true; G.inv.push(box); G.active = G.inv.length - 1;
      AUDIO.sfx('pickup'); G.hover = null;
      G.say(withCrank ? 'You lift the box off the pedestal, its crank still in it.' : 'You lift the box off the pedestal.', 'You take the box back.');
      refresh();
    };
    peds.forEach((p, k) => {
      const t = mkTarget(L, {
        id: 'pedestal' + k, name: 'Pedestal', x: p.x, y: 0, z: p.z, w: 0.6, h: 1.2, accepts: ['musicbox', 'crank'],
        reach: { style: 'touch', at: [0, 0.64] },   // with nothing in hand the hand goes out to the top of it (its cap, 0.75 m up)
        hint() {
          if (s.placedAt === k) return s.sour ? 'The music box. Its crank sticks here: take it back.' : !s.crankIn ? (G.hasItem('crank') ? 'The music box. Its crank fits its side.' : 'The music box. Take it back.') : 'Turn the crank. ' + (TURNS - s.turns) + ' more.';
          return s.placedAt >= 0 ? 'An empty pedestal.' : k === s.odd ? 'The pedestal before the odd mirror.' : 'A pedestal before the ' + DIRS[k] + ' mirror.';
        },
        use(item) {
          if (item.id === 'musicbox') {
            if (s.placedAt >= 0) return false;
            // any pedestal takes it, and it sits the same on every one
            s.placedAt = k; s.crankIn = !!box.withCrank; s.sour = false; this.name = 'Music box';   // hovering the box on it, it is the box you are turning
            AUDIO.sfx('drop');
            G.say(s.crankIn ? 'The box sits on the pedestal, its crank in its side. Turn it.' : 'The box sits on the pedestal. Now its crank.', 'There.'); refresh(); return true;
          }
          if (item.id === 'crank') {
            // nothing on this pedestal for it to fit: its socket feels about the bare top of the pedestal for something to
            // go on, finds nothing, and the crank comes back to your hand
            if (s.placedAt !== k) {
              G.say(s.placedAt < 0 ? 'The crank has nothing to turn. The music box goes on a pedestal first.' : 'The music box is not on this pedestal.', 'Nothing here for it to turn.');
              const q = onLine(PED - 0.08, 0.04, 0.78, k);
              return G.refuse({ preset: 'bump', drop: false, at: { x: q[0], y: q[1], z: q[2] }, tip: [0.3, 0.3], sfx: { hit: 'tink' } });
            }
            s.crankIn = true; AUDIO.sfx('fit'); G.say('The crank fits the side of the box. Turn it.', 'It fits.'); refresh(); return true;
          }
          return false;
        },
        // with the box on it and its crank in, a click turns the crank once round: before the odd mirror a few notes of the
        // tune each time, and on the last turn the whole tune; before any other, wrong notes, and the crank sticks. A click on
        // the box with its crank stuck, or with no crank in it and none in your hands, lifts it back off
        onClick() {
          if (s.placedAt !== k) return false;   // what you carry is tried
          if (!s.crankIn) { if (G.hasItem('crank')) return false; lift(k); return true; }
          if (k !== s.odd) { if (s.sour) lift(k); else { wrongTurn(p); turnHand(this, k, 'rattle'); } return true; }   // the hand turns it, it jams, and the hand wrenches at it
          if (s.turns >= TURNS) return true;
          turnHand(this, k, 'pull');
          s.turns++; s.crankTo -= TAU; G.shake(0.04); s.angryTill = Math.min(s.angryTill, L.t);   // the right tune calms it
          AUDIO.sfx(s.turns < TURNS ? 'musicTurn' : 'musicbox', panTo(p.x, p.z));
          if (s.turns >= TURNS) s.tuneAt = L.t;
          return true;
        },
      });
      glowWith(t, pedArt[k]);
      pedTargets.push(t);
    });
    // seen means: a live mirror is square in front of you. Once it comes out for the box it is seen the usual way.
    L.visFrac = c => {
      if (!c.lane.follow) return APPROACH.visFrac(L, c.lane, c, null);
      let best = 0;
      for (const m of s.mirrors) {
        if (!m.live) continue;
        const q = L.at(m.deg, 3.5, 0.25), r = R.projectRect(q[0], q[1], q[2], 1.6, 2.2, null);
        if (!r) continue;
        const ox = Math.max(0, Math.min(r.x + r.w, R.W) - Math.max(r.x, 0)), oy = Math.max(0, Math.min(r.y + r.h, R.H) - Math.max(r.y, 0));
        best = Math.max(best, ox * oy / Math.max(1e-6, r.w * r.h));
      }
      return best;
    };
    L.isWon = () => s.turns >= TURNS;
    L.deathCause = () => (L.t - s.wrongAt < 8 ? 'wrong' : null);
    // when it has you it is angry, whatever it was before: the brows down, the red glare, its teeth bared, all the way in to
    // your face (the night's update does not run while you die, so it is set here, once, and stays)
    L.onCatch = c => { c.angry = 1; c.dance = 0; c.smile = false; return false; };
    L.objectiveText = () => L.won ? 'It is coming for the box.'
      : s.placedAt < 0 ? 'The odd mirror is the ' + DIRS[s.odd] + ' one. Put the music box on its pedestal.'
        : s.placedAt !== s.odd ? 'That is the ' + DIRS[s.placedAt] + ' mirror. Take the box back and put it before the ' + DIRS[s.odd] + ' one.'
          : !s.crankIn ? 'Fit the crank to the music box.' : 'Turn the crank (' + s.turns + '/' + TURNS + ').';

    // ---- the fetch ----
    // The last turn plays the whole tune and it comes for the box. In the odd mirror its dance stops dead and it lets its
    // arms down, then turns round once on the spot, like the dancer on the box (its side, its back, its other side, its
    // face, smiling), runs at you down the glass and out through it (stepping up over the frame, the glass rippling), to one
    // side of the pedestal; however far off it was, it is there within about two and a half seconds. It reaches over, lifts
    // the box off the pedestal and takes it in both arms, backs into the glass with it, still smiling, and runs off side on
    // behind the glass, out of the frame. The mirror is empty, the pedestal bare, and the tune plays on.
    const F = { settle: 0.22, turn: 0.95, reach: 0.35, lift: 0.8, back: 1.1, run: 1.3, after: 1.0 };
    const AT = 2.3, LAT = 0.58, IN = 4.4, RUNLAT = 2.4, BOXW = 0.4, BOXY = 0.75, CA = CR.carryAt;
    const drawBox = (ctx, P) => { if (s.flip) ctx.scale(-1, 1); ICONS.musicbox(ctx, P, { crank: s.crankIn ? s.crankA : undefined, spin: s.spin }); };
    // where the box is while it is lifted (lift 0..1): off the pedestal, up over its cap, and down into the doll's arms in
    // front of it; as lane distance, lateral offset, height of its base and size
    const liftedBox = l => {
      const e = smoothstep(l);
      return { d: lerp(PED, AT - 0.01, e), lat: s.side * LAT * e, y: lerp(BOXY, CA.y, e) + Math.sin(l * Math.PI) * 0.14, w: lerp(BOXW, CA.w, e) };
    };
    // a point on that box (u, v in its own unit box) as the doll sees it: in the plane it stands in, from its own middle
    const onBox = (b, u, v, c) => { const k = c.dist / b.d; return [(b.lat + u * b.w) * k - c.lat, L.eyeH - (L.eyeH - (b.y + v * b.w)) * k]; };
    const sill = d => Math.sin(Math.PI * clamp((d - 3.15) / 0.7, 0, 1)) * 0.27;   // up over the bottom of the frame as it goes through
    // a point d along the odd mirror's line (or mirror k's) and lat to its right (as its lane places the thing), y up
    const onLine = (d, lat, y, k) => { const r = s.mirrors[k === undefined ? s.odd : k].deg * DEG; return L.pt(Math.sin(r) * d + Math.cos(r) * lat, y, Math.cos(r) * d - Math.sin(r) * lat); };
    const carryHand = side => [side * 0.165, CA.y + CA.w * 0.27 + 0.01];
    const fetch = dt => {
      const c = c0(), m = s.mirrors[s.odd];
      if (!s.fetch) {
        // its reflection in the odd mirror becomes the thing itself, on that mirror's line, as far behind the glass, in the
        // pose that glass showed (its dance the other way round), which it now eases out of
        s.fetch = { t: 0, D: 7 + c.dist, steps: 0, prev: 7 + c.dist };
        s.fetch.ap = clamp(0.9 + (s.fetch.D - AT) * 0.045, 1.3, 2.4);
        c.retarget(1 + s.odd); c.dist = c.hold = s.fetch.D; c.lat = 0; c.back = false; c.smile = false; c.danceMir = sideOf(s.odd);
        L.lane = c.lane; L.laneIdx = c.lane.idx;
        if (!m.live) { m.live = true; s.sheetFall = { k: s.odd, t0: L.t, hissed: true }; const sh = L.targets.find(q => q.id === 'sheet' + s.odd); if (sh) sh.hidden = true; AUDIO.sfx('hiss'); }   // a sheet over it slides off
        s.ripples = [];
      }
      const f = s.fetch; f.t += dt;
      const T1 = F.turn, T2 = T1 + f.ap, T3 = T2 + F.reach, T4 = T3 + F.lift, T5 = T4 + F.back, T6 = T5 + F.run;
      const t = f.t;
      let d = c.hold, lat = 0, run = false;
      c.rush = 0; c.arms = null; c.yOff = 0;
      if (t < T1) {                       // it stops dancing, then turns round once: its side, its back, its other side, its face
        const r = t - F.settle;
        c.back = r >= 0.14 && r < 0.4; c.runPose = (r >= 0 && r < 0.14) || (r >= 0.4 && r < 0.54); c.runDir = r < 0.2 ? -s.side : s.side; c.runGait = 0; c.smile = r >= 0.54;
      } else if (t < T2) {                // it runs at you, out through the glass, and to the side of the pedestal
        c.back = false; c.runPose = false; c.smile = true;
        const k = (t - T1) / f.ap;
        d = lerp(f.D, AT, 1 - Math.pow(1 - k, 1.6));
        lat = s.side * LAT * smoothstep((3.4 - d) / 0.9);
        c.rush = clamp((1 - k) / 0.2, 0, 1); c.runGait = (c.runGait || 0) + dt * 17; run = true;
        c.yOff = sill(d);
      } else if (t < T4) {                // it reaches over, lifts the box off and takes it in both arms
        d = AT; lat = s.side * LAT;
        const reach = clamp((t - T2) / F.reach, 0, 1), l = clamp((t - T3) / F.lift, 0, 1);
        s.lift = l;
        const b = liftedBox(l), near = -s.side, hold = smoothstep((l - 0.35) / 0.65);
        const grip = onBox(b, s.side * 0.44, 0.22, { dist: AT, lat });
        c.arms = { [near]: { k: reach, to: [lerp(grip[0], carryHand(near)[0], hold), lerp(grip[1], carryHand(near)[1], hold)] }, [-near]: { k: hold, to: carryHand(-near) } };
        if (l >= 1) { s.held = true; c.carry = drawBox; c.arms = null; }
      } else if (t < T5) {                // it backs into the glass with it, smiling
        s.held = true; c.carry = drawBox;
        const k = smoothstep((t - T4) / F.back);
        d = lerp(AT, IN, k); lat = s.side * lerp(LAT, 0.2, smoothstep(k / 0.6));
        c.yOff = sill(d);
      } else {                            // and runs off side on behind the glass, out of the frame, and is gone
        d = IN; c.runPose = true; c.runDir = s.side; c.smile = true;
        const k = clamp((t - T5) / F.run, 0, 1);
        lat = s.side * lerp(0.2, RUNLAT, Math.pow(k, 1.15));
        if (k < 1) { c.runGait = (c.runGait || 0) + dt * 16; run = true; }
      }
      c.hold = d; c.runLat = lat;
      // the glass ripples where it goes through
      if ((f.prev - 3.48) * (d - 3.48) < 0) s.ripples.push({ t0: L.t, lat });
      f.prev = d;
      // little hard running feet, and the tune again every time it ends
      const pan = Math.sin(wrapPi(c.yaw + Math.atan2(lat, d) - G.cam.yaw)) * 0.85;
      if (run) { const n = Math.floor(c.runGait / Math.PI); if (n !== f.steps) { f.steps = n; AUDIO.footstep('smiler', clamp(3 / (d + 2), 0.1, 0.7), pan); } }
      if (L.t - (s.tuneAt || 0) >= 3.2) { s.tuneAt = L.t; AUDIO.sfx('musicbox', pan); }
      f.done = t >= T6 + F.after;
    };
    L.update = dt => {
      // the crank goes a whole turn round with each click and the dancer turns with it; once the box plays she spins
      s.crankA += (s.crankTo - s.crankA) * (1 - Math.exp(-dt * 7));
      if (s.sheetFall && !s.sheetFall.hissed && L.t >= s.sheetFall.t0) { s.sheetFall.hissed = true; AUDIO.sfx('hiss'); }   // a sheet pulled down slides off the glass
      s.spin = L.won ? s.spin + dt * 3.4 : -s.crankA * 0.5;
      // the doll's temper: angry at once when the box plays wrong, for a few seconds and as long as the box sits there
      // stuck; then its face eases back to the painted one. Coming out for the box, it smiles
      const c = c0();
      if (L.won) c.angry = 0;
      else if (s.sour || L.t < s.angryTill) c.angry = 1;
      else if (c.angry) c.angry = Math.max(0, c.angry - dt / 0.8);
      // its dance in the glass: one clock for every mirror, so they all show the same moment of it. The clock runs while it
      // is calm and stops dead when the box plays wrong (it eases out of the dance into its angry stance, and back into it
      // once its temper has gone) or when the tune fetches it (it lets its arms down, quickly, to turn round)
      const calm = !L.won && !s.sour && L.t >= s.angryTill;
      if (calm) c.danceT += dt;
      c.dance = calm ? Math.min(1, c.dance + dt / 0.7) : Math.max(0, c.dance - dt / (L.won ? F.settle : 0.35));
      if (L.won) fetch(dt);
    };
    L.watchPoint = () => { const q = L.at(s.mirrors[s.odd].deg, 2.6, 1.0); return { x: q[0], y: q[1], z: q[2] }; };
    L.aftermath = () => !!(s.fetch && s.fetch.done);
    // a dust sheet thrown over a mirror: it hangs from the top of the frame in long folds to an uneven hem, drawn over the
    // glass, its glint and the frame, under the crest, which still shows above it; pulled down, it lies in a heap at the foot
    const sheetAt = {}, heapAt = {};
    const poly = (pts, color, sortDist) => ({ kind: 'poly', pts: pts.map(q => L.pt(q[0], q[1], q[2])), color, sortDist });
    s.mirrors.forEach((m, k) => SC.withYaw(L, m.deg, () => {
      const Z = 3.43, cloth = [156, 148, 132], fold = [114, 106, 94], lite = [180, 172, 156];
      const outline = [[-0.9, 2.62], [0.9, 2.62], [0.97, 2.56], [1.0, 1.4], [1.05, 0.1], [0.8, 0.05], [0.52, 0.11], [0.2, 0.03], [-0.1, 0.1], [-0.42, 0.04], [-0.74, 0.1], [-1.04, 0.07], [-1.0, 1.4], [-0.97, 2.56]];
      const list = [poly(outline.map(([x, y]) => [x, y, Z]), cloth, 3.48)];
      for (const [xa, xb, w] of [[-0.66, -0.72, 0.13], [0.04, 0.1, 0.15], [0.58, 0.68, 0.12]]) {
        list.push(poly([[xa, 2.5, Z - 0.004], [xb + w / 2, 0.15, Z - 0.004], [xb - w / 2, 0.15, Z - 0.004]], fold, 3.475));
        list.push(poly([[xa + 0.02, 2.5, Z - 0.004], [xb + w / 2 + 0.07, 0.15, Z - 0.004], [xb + w / 2, 0.15, Z - 0.004]], lite, 3.475));
      }
      sheetAt[k] = list;
      const sheet = L.targets.find(t => t.id === 'sheet' + k);
      if (sheet) glowWith(sheet, list);
      heapAt[k] = SC.mkSprite(L, 0, 0, 3.22, 1.3, 0.3, (ctx, P) => {
        ctx.scale(1.3, 0.3);
        P_poly(ctx, [[-0.5, 0], [-0.47, 0.32], [-0.32, 0.56], [-0.14, 0.5], [0.02, 0.82], [0.2, 0.64], [0.36, 0.72], [0.48, 0.36], [0.5, 0]], P.col([150, 142, 126]));
        for (const [x0, y0, x1, y1] of [[-0.32, 0.08, -0.16, 0.46], [0.06, 0.06, 0.16, 0.6], [0.3, 0.1, 0.38, 0.56]]) P_line(ctx, x0, y0, x1, y1, 0.035, P.col([112, 104, 92]));
      });
    }));
    // a ring of light spreading on the glass where the thing goes through it
    const ripple = (q, a) => SC.mkSprite(L, 0, 0, 0, 1, 1, (ctx, P) => {
      ctx.lineWidth = 0.02;
      for (let i = 0; i < 3; i++) { const r = 0.08 + a * 0.5 - i * 0.1; if (r <= 0.02) continue; ctx.strokeStyle = P.cola([214, 226, 248], (1 - a) * 0.4); ctx.beginPath(); ctx.ellipse(0, 0.5, r, r * 1.3, 0, 0, TAU); ctx.stroke(); }
    }, { x: q[0], y: q[1], z: q[2], noLight: true, sortDist: 3.46 });
    L.dynamic = () => {
      const c = c0();
      // what the mirrors show: the thing, at the distance a reflection would be, dancing; in the odd one its dance is the
      // mirror image of the others'. Once it has you, it has turned to face you, so the glass behind it shows its back.
      // What each glass last drew is kept in s.shown (its dance time, which way round, and the pose). Every glass shows it
      // alike otherwise: unlit by the fire out to the west, which would warm the one in the west glass and no other
      if (c.lane.follow) s.mirrors.forEach((m, k) => {
        if (!m.live) return;
        const dd = 7 + c.dist, q = L.at(m.deg, dd, 0), back = G.state === 'dying';
        R.add({ kind: 'sprite', x: q[0], y: q[1], z: q[2], w: CR.w, h: CR.h, dist: dd, sortDist: 7.1, fogScale: 0.6, noLight: true, draw: (ctx, P) => {
          c.back = back; c.danceMir = sideOf(k); CR.draw(ctx, c, P);
          s.shown[k] = { at: L.t, t: c.danceT, mir: c.danceMir, pose: c.pose };
          c.back = false; c.danceMir = 1;
        } });
      });
      // come out for the box it is the thing itself, drawn by the game: behind the glass it goes over the dark of the mirror
      // room and under the walls and the glass, as its reflection did; through it, by how far it really is
      const cp = L.rend && L.rend.get(c);
      if (cp) { const behind = !c.lane.follow && c.dist > 3.48; cp.sortDist = behind ? 7.1 : undefined; cp.fogScale = behind ? 0.6 : 0.85; cp.noLight = behind; }
      // behind the glass it is lit by hand: as its reflection was (not at all) as it comes out of the dance, and more and more
      // as it really is the nearer it runs to the glass, so it comes out into the room's light without a jump (and once it has
      // been through, as it really is)
      c.tint = null;
      if (cp && cp.noLight && s.fetch) {
        const k = s.ripples.length ? 1 : smoothstep((s.fetch.D - c.dist) / Math.max(0.01, s.fetch.D - 3.48)), p = c.pos();
        const li = k > 0 && LIGHT.at(p.x, p.y + c.yOff + CR.h / 2, p.z);
        if (li) c.tint = { lit: li.lit * k, color: li.color };
      }
      s.mirrors.forEach((m, k) => {
        const sf = s.sheetFall && s.sheetFall.k === k ? clamp((L.t - s.sheetFall.t0) / 0.25, 0, 1) : 1;
        if (!m.live) for (const q of sheetAt[k]) R.add(q);
        else if (sf < 1) { const e = easeIn(sf); for (const q of sheetAt[k]) R.add(Object.assign({}, q, { pts: q.pts.map(w => [w[0], 0.05 + (w[1] - 0.05) * (1 - e), w[2]]) })); }   // it slides off the glass
        else if (L.targets.some(t => t.id === 'sheet' + k)) R.add(heapAt[k]);
      });
      if (s.ripples) for (const rp of s.ripples) { const a = (L.t - rp.t0) / 0.9; if (a < 1) R.add(ripple(onLine(3.47, rp.lat, 0.35), a)); }
      // the music box on its pedestal (whichever it is on), or on its way off it into the doll's arms: over the pedestal's
      // cap and the doll
      // When its crank jams (before the wrong mirror) the box jumps on the pedestal and rocks back down
      if (s.placedAt >= 0 && !s.held) {
        const j = L.t - s.wrongAt, jolt = j >= 0 && j < 0.5 ? 1 - j / 0.5 : 0, hop = 0.035 * Math.abs(Math.sin(j * 19)) * jolt * jolt, rock = 0.09 * Math.sin(j * 27) * jolt;
        const b = liftedBox(s.lift || 0), q = onLine(b.d, b.lat, b.y + hop, s.placedAt);
        R.add(SC.mkSprite(L, 0, 0, 0, b.w, b.w, (ctx, P) => { ctx.scale(b.w, b.w); if (rock) { ctx.translate(0, 0.05); ctx.rotate(rock); ctx.translate(0, -0.05); } drawBox(ctx, P); }, { x: q[0], y: q[1], z: q[2], sortDist: 2.15, glowOf: pedTargets[s.placedAt] }));   // (clicked, it is the pedestal it is on)
      }
    };
    L.floor = { poly: [[-3.3, -3.3], [3.3, -3.3], [3.3, 3.3], [-3.3, 3.3]], y: 0 };
  }
});
