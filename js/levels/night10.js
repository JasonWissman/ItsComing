'use strict';
// ============================================================ 10. THE MIRROR MAZE ============================================================
// The look-away night turned inside out: it is always behind you and you only ever see it in the glass.
// It comes on while the mirror you are facing does not show it, and even held in the glass it is not still: with every
// move of its dance it is a little nearer (a real clock: the reflections creep in all night, and looking away hurries it). A mirror in the middle of every wall and a pedestal
// before each, all alike. In every glass it dances on the spot, a stiff wind-up doll's dance (each move snapped
// into at once and held dead still a long beat), in step in all of them; one mirror is not like the others: in it the
// dance is the mirror image of the rest (left and right swapped).
// The music box lies in one place and its crank in another. The box goes on any pedestal and the crank in its front, and a
// few turns of the crank before the odd mirror play its tune: the doll stops dancing, turns round once on the spot
// like the dancer on the box, and comes out through that glass for the box, quickly, lifts it off the pedestal, and takes
// it back in with it and away. Before any other mirror the first turn plays wrong notes and the crank sticks: in the glass
// the doll stops dancing, its face crumples into red-eyed weeping and it hops at you (three quick steps). A click on the
// box then lifts it back off, crank and all, to put before another mirror. Each of those hops takes a good share of the
// night's clock (WRONG), so a couple of wrong tries can lose it. Your hand is on the crank as it turns, wrenches at it when it jams
// (the box jumps), and takes the box back up off the pedestal; the crank tried on a bare pedestal feels about its top and
// comes back to your hand (G.refuse); a dust sheet is pulled down by hand and slides off the glass.
// The sheets go back up, too. Two mirrors start under one; pulled down, it lies in a heap at the foot of its glass and can
// be taken up (a click on the heap, either side of the pedestal: a bundle of cloth in your hand), and two more lie folded
// on top of the lamp's table. A click on a bare mirror with a sheet in your hand throws it up over the glass. A
// covered mirror shows nothing, so before it the thing comes on as it does unseen. Cover all four (the night's easter
// egg) and it does not like it: a beat of quiet, its feet running up behind the cloth, and then, in the sheet before you, its face presses out through the
// cloth from inside, a hand either side of it, fingers spread, the other sheets bulging too; and that face and those
// hands come at you as they are, in the cloth, dragging the sheet off the mirror behind them.
LEVELS.push({
  id: 'mirrors', title: 'The Mirror Maze', facing: 0, eyeH: 1.65, laneMode: 'default', laneSwitch: false,
  pal: { skyTop: [14, 8, 8], fog: [58, 40, 36], ground: [30, 26, 26], fogDist: 40 },
  ambient: { tune: 'ambient:10', wind: 0, drone: 0.3, droneFreq: 55, windFreq: 340 },   // a quiet stage: no wind indoors, the drone low
  weather: { kind: 'ash', density: 1.0, wind: 0.3 },
  lights: [{ x: -40, y: 2, z: 5, r: 60, i: 0.5, color: [255, 120, 40], flicker: 0.4 }, { x: 2.6, y: 1.3, z: 2.6, r: 5, i: 0.4, color: [255, 200, 140], flicker: 0.15 }],
  text: {
    intro: 'You see a strange doll in the mirrors.\nThey all look the same... mostly.',
    hint: 'Face a mirror square on to hold it. In every mirror it dances, and in the odd one it dances the other way round (the arm the others raise, it raises on the other side): put the music box on the pedestal in front of that one, then fit the crank to the box and turn it. Turned before any other mirror it plays wrong, and the thing in the glass is upset with you: click the box to take it back.',
    objective: 'Find the odd mirror. Put the music box on its pedestal, fit the crank, turn it.',
    // wrong: it had you after the box played wrong before any mirror; unplayed: the box never played at all
    egg: 'Cover every mirror.',   // this night's easter egg, as the Scores' list names it once found (game.js: foundEgg)
    // ignored: every mirror under a dust sheet, and it came out through the cloth
    death: { default: 'The strange doll leapt out from its mirror and grabbed you.', wrong: 'You played for an illusion. The creature surprised you from behind.', unplayed: 'It just wants to hear its song.', ignored: 'It does not like to be ignored.' },
    eggs: ['ignored'],   // (the easter egg: "Nice try", game.js deathLine)
    win: 'It only wanted its music box.',
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
  // the clock: held in a glass it creeps in at seenMult (a step with each move of its dance), unseen at unseenMult (x1.4 on
  // Nightmare), steadily all the way in (linear), so doing nothing is always the end of you. On Nightmare (its clock x0.6)
  // time 160 is about a minute and a half for a player who spends half the night facing a mirror, about two and a half
  // minutes standing still before a live mirror and doing nothing, and about a minute never facing one (or standing still
  // before a sheeted one). It starts near enough (startDist: its reflection about 21 m back in the glass) to be seen in
  // every glass from the first, a little larger with every snap of its dance
  creatures: [{ type: 'other', startDist: 14, time: 160, seenMult: 0.6, unseenMult: 1.0 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, CR = CREATURES.other, c0 = () => L.creatures[0];
    const board = [78, 40, 48], boardD = [54, 28, 34], gilt = [150, 120, 60], tileA = [118, 108, 98], tileB = [40, 36, 36];
    const DIRS = ['north', 'east', 'south', 'west'], TURNS = 4, WRONG = 0.3;   // WRONG: the share of the night's clock a wrong mirror costs
    SC.stars(L, 101, 20, 0.2);
    for (let x = -3.5; x < 3.5; x += 0.7) for (let z = -3.5; z < 3.5; z += 0.7) SC.floorQ(L, x, z, x + 0.7, z + 0.7, 0.004, ((Math.round(x / 0.7) + Math.round(z / 0.7)) & 1) ? tileA : tileB);
    SC.quad(L, [-3.6, 3.2, -3.6], [3.6, 3.2, -3.6], [3.6, 3.2, 3.6], [-3.6, 3.2, 3.6], [40, 30, 30]);
    // four mirrors, one in the middle of each wall, each a hole in a painted wall with a dark room behind the glass
    s.odd = Math.floor(L.rand() * 4);
    // (live: its glass is bare; heap: the dust sheets lying at its foot; anim: its sheet on its way down, or up: thrown over it)
    s.mirrors = [0, 90, 180, 270].map((deg, k) => ({ deg, live: true, odd: k === s.odd, heap: 0, anim: null }));
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
        // (the crest and the bulbs are fixed flat on the wall, looking back into the room: they never turn with the view)
        const onWall = { face: m.deg * DEG + Math.PI };
        SC.sprite(L, 0, 2.55, 3.46, 0.3, 0.3, (ctx, P) => { ctx.scale(0.3, 0.3); crest(ctx, P); }, onWall);
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
        for (let x = -3.1; x < 3.5; x += 0.6) if (Math.abs(x) > 1.1) SC.sprite(L, x, 2.85, 3.46, 0.1, 0.12, (ctx, P) => { ctx.scale(0.1, 0.12); P_rect(ctx, -0.26, 0, 0.52, 0.3, P.col([96, 76, 40])); P_ell(ctx, 0, 0.6, 0.4, 0.38, P.col([106, 92, 74])); P_ell(ctx, -0.13, 0.7, 0.1, 0.1, P.col([150, 138, 116])); }, onWall);
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
    // the lamp's table on four legs, each drawn after the walls behind it. A leg is only as tall as it shows under the
    // table from the middle of the room (the eye never leaves it): the rest of it is behind the top and its edges anyway,
    // and drawn whole, the far corner's leg (by its middle further off than the parts of the cut-up top round it) was
    // drawn over the top as a little brown upright bar standing on it. Seen past the near edge of the underside (where
    // the line to it first comes under the table) it is cut off at the height that edge hides
    const TB = { x0: 2.2, x1: 3.4, z0: 2.2, z1: 3.4, y: 0.98 };
    SC.box(L, TB.x0, TB.x1, TB.y, TB.y + 0.05, TB.z0, TB.z1, [70, 56, 44]);
    for (const [x, z] of [[2.27, 2.27], [3.33, 2.27], [2.27, 3.33], [3.33, 3.33]]) {
      const under = Math.max(TB.x0 / x, TB.z0 / z), h = Math.min(TB.y, L.eyeH - (L.eyeH - TB.y) / under + 0.004);
      SC.sprite(L, x, 0, z, 0.05, h, (ctx, P) => { ctx.scale(0.05, h); P_rect(ctx, -0.5, 0, 1, 1, P.col([54, 43, 34])); }, { sortDist: x + z < 5 ? 3.9 : 4.15 });
    }
    // the chair stands with its back to the east wall, facing into the room, so what lies on its seat is in plain view
    SC.box(L, 2.8, 3.19, 0.4, 0.45, -1.7, -1.3, [88, 70, 50]); SC.box(L, 3.19, 3.25, 0.4, 0.95, -1.7, -1.3, [88, 70, 50]);
    for (const [x, z] of [[2.83, -1.67], [3.22, -1.67], [2.83, -1.33], [3.22, -1.33]]) SC.box(L, x - 0.03, x + 0.03, 0, 0.4, z - 0.03, z + 0.03, [70, 56, 40]);
    // items: the music box in one place and its crank in another, well apart and in another direction from you (never in
    // the same corner, nor the two along one wall where the first view finds both)
    const boxSpots = [{ x: 2.6, y: 1.03, z: 3.0 }, { x: -2.7, y: 0, z: -2.7 }, { x: 2.0, y: 0, z: -2.6 }, { x: -2.6, y: 0, z: 1.4 }, { x: -1.3, y: 0, z: 3.0 }];
    const crankSpots = [{ x: 2.5, y: 1.03, z: 2.95 }, { x: 3.02, y: 0.45, z: -1.52 }, { x: -2.9, y: 0, z: 2.9 }, { x: 2.9, y: 0, z: -2.9 }, { x: 1.6, y: 0, z: 3.1 }, { x: -3.1, y: 0, z: -1.0 }, { x: 3.1, y: 0, z: 1.2 }, { x: 1.2, y: 0, z: -3.1 }];
    const box = mkItem(L, 'musicbox', 'Music box', boxSpots, { w: 0.36, h: 0.36, flat: true });
    const apart = p => Math.hypot(p.x - box.x, p.z - box.z) > 2.2 && Math.abs(wrapPi(Math.atan2(p.x, p.z) - Math.atan2(box.x, box.z))) > 60 * DEG;
    mkItem(L, 'crank', 'Crank handle', crankSpots.filter(apart), { w: 0.28, h: 0.28, flat: true, icon: 'boxcrank', held: { grip: 'fist', at: [-0.05, 0.3], axis: Math.PI / 2, angle: -0.6, size: 0.22, tip: [0.3, 0.3] } });   // (by its arm, its knob up and its socket out in front)
    // The dust sheets: one over each of two mirrors, and two spare ones folded on top of the lamp's table (always
    // there, side by side on the right of its top as the eye sees it, the left of it kept for the box or the crank (only
    // one of the two is ever on the table: they are kept apart), so neither hides the other: placed outright, with no roll of the night's dice, so the
    // box and the crank lie where they always did). In your hand a sheet is a bundle of pale cloth
    const CLOTH = { base: [156, 148, 132], fold: [114, 106, 94], lite: [180, 172, 156] };
    const sheetFolded = (ctx, P) => {
      const c = k => P.col(CLOTH[k]);
      P_poly(ctx, [[-0.47, 0.06], [0.47, 0.06], [0.47, 0.36], [-0.47, 0.36]], c('fold'));          // its folded edge, toward you
      for (const y of [0.13, 0.21, 0.29]) P_line(ctx, -0.44, y, 0.44, y + 0.008, 0.024, c('base'));
      P_poly(ctx, [[-0.47, 0.36], [0.47, 0.36], [0.39, 0.9], [-0.39, 0.9]], c('base'));            // its top
      P_poly(ctx, [[-0.47, 0.36], [0.47, 0.36], [0.455, 0.44], [-0.455, 0.44]], c('lite'));
      P_line(ctx, 0.03, 0.46, 0.02, 0.88, 0.018, c('fold'));
    };
    const sheetBundle = (ctx, P) => {   // gathered up in one hand: a soft mass of it, in long folds, two ends of it hanging down
      const c = k => P.col(CLOTH[k]);
      P_poly(ctx, [[-0.32, 0.42], [-0.44, 0.02], [-0.22, 0.09], [-0.1, 0.38]], c('fold'));
      P_poly(ctx, [[0.02, 0.4], [0.1, 0], [0.31, 0.07], [0.28, 0.42]], c('base'));
      P_line(ctx, 0.17, 0.36, 0.2, 0.06, 0.02, c('fold'));
      P_poly(ctx, [[-0.42, 0.44], [-0.4, 0.62], [-0.28, 0.78], [-0.06, 0.87], [0.18, 0.85], [0.36, 0.72], [0.44, 0.54], [0.4, 0.38], [0.22, 0.3], [-0.06, 0.28], [-0.3, 0.32]], c('base'));
      P_poly(ctx, [[-0.36, 0.64], [-0.28, 0.78], [-0.06, 0.87], [0.18, 0.85], [0.32, 0.75], [0.1, 0.74], [-0.14, 0.72]], c('lite'));
      for (const [x0, x1, x2] of [[-0.22, -0.3, -0.24], [-0.02, -0.08, 0], [0.19, 0.17, 0.25]]) P_limb(ctx, [[x0, 0.8], [x1, 0.58], [x2, 0.36]], 0.02, c('fold'));
    };
    const sheetItem = icon => ({ w: 0.46, h: 0.36, flat: true, icon, held: { grip: 'fist', at: [0.02, 0.45], angle: 0.12, size: 0.27 } });
    for (const [x, z] of [[2.97, 2.69], [3.22, 2.43]]) mkItem(L, 'dustsheet', 'Dust sheet', { x, y: TB.y + 0.05, z, jitter: 0 }, sheetItem(sheetFolded));
    L.onPickup = it => { if (it.id === 'dustsheet') it.icon = sheetBundle; };   // shaken out of its folds: from now on a bundle
    const sheetInHand = () => { const it = G.inv[G.active]; return !!it && it.id === 'dustsheet'; };
    // Each mirror is a thing to click while there is something to do with it: under a sheet, the sheet (a click pulls it
    // down: the hand goes out to its hem and pulls, and it slides off the glass into a heap, m.anim, from when the hand has
    // it); bare, with a dust sheet in your hand, the mirror (the sheet is thrown up over it: flung up to the top of the
    // frame, its hem swinging up after it and settling). SHEET: how long each takes
    const SHEET = { down: 0.25, up: 0.5 };
    const pullDown = (k, t) => {
      const m = s.mirrors[k]; m.live = true; m.heap++;
      G.say('The sheet comes down. Glass.', 'Glass.');
      const r = G.reach(t, { style: 'pull', at: [0.4, 0.4], sfx: 'flop' });
      s.sheetFall = { k, t0: L.t + (r ? r.out : 0) }; m.anim = { t0: s.sheetFall.t0, T: SHEET.down };   // (L.update hisses as it goes)
    };
    const cover = k => {
      const m = s.mirrors[k]; m.live = false; m.anim = { up: true, t0: s.now, T: SHEET.up };
      if (s.mirrors.every(q => !q.live)) { ignored(k); return; }
      AUDIO.sfx('flop', panTo(Math.sin(m.deg * DEG), Math.cos(m.deg * DEG)));
      G.say('The sheet goes up over the glass, and hangs.', 'Covered.');
    };
    // a point d along mirror k's line and lat to its right, in the night's own frame (as mkTarget takes it)
    const byMirror = (k, d, lat) => { const r = s.mirrors[k].deg * DEG; return { x: Math.sin(r) * d + Math.cos(r) * lat, z: Math.cos(r) * d - Math.sin(r) * lat }; };
    const sheetTargets = s.mirrors.map((m, k) => {
      const t = mkTarget(L, { id: 'sheet' + k, deg: m.deg, dist: 3.4, y: 0.2, w: 1.75, h: 2.4,
        hint() { return m.live ? 'Bare glass. The dust sheet would go back up over it.' : 'A dust sheet over the glass.'; },
        onClick() { if (m.live) return false; pullDown(k, this); return true; },
        use(item) { if (item.id !== 'dustsheet' || !m.live) return false; cover(k); return true; },
      });
      Object.defineProperties(t, {
        name: { get: () => (m.live ? 'Mirror' : 'Dust sheet') },
        accepts: { get: () => (m.live ? ['dustsheet'] : []) },
        hidden: { get: () => !!s.egg || L.won || (m.live && !sheetInHand()) },
      });
      return t;
    });
    // the heap a sheet lies in at the foot of its glass, there to be taken up again. From the middle of the room the
    // pedestal stands before the middle of it, so it is clicked either side of the pedestal (and never takes a click meant
    // for the pedestal or the box on it)
    const heapShown = k => { const m = s.mirrors[k], a = m.anim; return m.heap - (a && !a.up && s.now < a.t0 + a.T ? 1 : 0) > 0; };
    const takeHeap = (k, side) => {
      const m = s.mirrors[k]; m.heap--;
      const it = newItem(L, 'dustsheet', 'Dust sheet', sheetItem(sheetBundle)), at = onLine(3.2, side * 0.5, 0.05, k);
      it.x = at[0]; it.y = at[1]; it.z = at[2];
      HANDS.picked(it); G.inv.push(it); G.active = G.inv.length - 1;   // up off the floor into your hand
      AUDIO.sfx('pickup'); G.hover = null;
    };
    const heapTargets = s.mirrors.map((m, k) => [-1, 1].map(side => {
      const t = mkTarget(L, Object.assign({ id: 'heap' + k + (side < 0 ? 'l' : 'r'), name: 'Dust sheet', y: 0, w: 0.3, h: 0.36, reach: false,
        hint() { return 'A dust sheet, in a heap. Take it up.'; },
        onClick() { takeHeap(k, side); return true; } }, byMirror(k, 3.2, side * 0.59)));
      Object.defineProperty(t, 'hidden', { get: () => !!s.egg || L.won || !heapShown(k) });
      return t;
    }));
    // Nightmare puts dust sheets over two of the mirrors, chosen by the night
    if (L.nightmare) {
      const order = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) { const j = Math.floor(L.rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      for (const k of order.slice(0, 2)) s.mirrors[k].live = false;
    }
    // which side of the pedestal it will stand to take the box, and run off to behind the glass; the box's crank is in the
    // half of its front away from it (s.flip). Behind the south mirror it always goes left: the way out is on its right, and
    // running off that way it would be seen through the doorway, outside the hall
    const sideRoll = L.rand();
    s.side = s.mirrors[s.odd].deg === 180 || sideRoll < 0.5 ? -1 : 1; s.flip = s.side > 0;
    s.lead = (sideRoll * 2) % 1 < 0.5 ? 1 : -1;   // the next bit of the same roll, so the layout and the doll's start are as they were
    // placedAt: the pedestal the box is on (-1: none); crankIn: its crank is in its front; turns: turns before the odd mirror;
    // sour: it has played wrong where it is, and its crank sticks; angryTill: the doll is angry until then
    Object.assign(s, { placedAt: -1, crankIn: false, turns: 0, crankA: 0, crankTo: 0, spin: 0, wrongAt: -99, wrongs: 0, sour: false, angryTill: -99, now: 0, egg: null });
    const panTo = (x, z) => Math.sin(wrapPi(Math.atan2(x, z) + L.facing - G.cam.yaw)) * 0.7;
    const pedTargets = [];
    const refresh = () => pedTargets.forEach(t => { t.accepts = s.placedAt < 0 ? ['musicbox', 'crank'] : s.crankIn ? [] : ['crank']; });
    // lifted off a pedestal with its crank in, the box keeps it: you carry it so, and it goes down on the next one so
    const boxWithCrank = (ctx, P) => ICONS.musicbox(ctx, P, { crank: 0 });
    // the first turn before a wrong mirror: the comb drags out wrong notes and the crank sticks; in the glass its painted face
    // crumples, weeping red, and behind you something takes three quick steps: it hops in by WRONG of the whole night's
    // clock, never right up to you (it stops catchDist + 1.5 off, a few seconds from you), so a couple of wrong tries can
    // lose the night. The crank stays stuck, so a box turned before the wrong mirror costs one hop, not one a click
    // where the crank is on the box on pedestal k (in the middle of its turn, out from the front of the box), in the world:
    // the hand goes there to turn it
    const crankAt = k => { const q = onLine(PED - MB.d / 2 - 0.03, (s.flip ? -1 : 1) * MB.cx, BOXY + MB.foot + MB.h / 2, k); return { x: q[0], y: q[1], z: q[2] }; };
    // a turn of the crank is the hand's own (the box makes the sound): G.reach, kept quiet
    const turnHand = (t, k, style) => { const r = G.reach(t, { style, at: crankAt(k) }); if (r && style === 'pull') r.touched = 99; };
    const wrongTurn = p => {
      const c = c0(); s.wrongAt = L.t; s.wrongs++; s.sour = true; s.angryTill = L.t + 5; c.angry = 1;
      s.crankTo -= TAU * 0.6; G.shake(0.04);
      AUDIO.sfx('musicSour', panTo(p.x, p.z));
      const uMax = 1 - Math.pow((c.catchDist + 1.5) / c.D0, 1 / c.gamma); c.u = clamp(c.u + WRONG, c.u, Math.max(c.u, uMax)); c.hitched = true;
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
          if (s.placedAt === k) return s.sour ? 'The music box. Its crank sticks here: take it back.' : !s.crankIn ? (G.hasItem('crank') ? 'The music box. Its crank fits its front.' : 'The music box. Take it back.') : 'Turn the crank. ' + (TURNS - s.turns) + ' more.';
          return s.placedAt >= 0 ? 'An empty pedestal.' : k === s.odd ? 'The pedestal before the odd mirror.' : 'A pedestal before the ' + DIRS[k] + ' mirror.';
        },
        use(item) {
          if (item.id === 'musicbox') {
            if (s.placedAt >= 0) return false;
            // any pedestal takes it, and it sits the same on every one
            s.placedAt = k; s.crankIn = !!box.withCrank; s.sour = false; this.name = 'Music box';   // hovering the box on it, it is the box you are turning
            AUDIO.sfx('drop');
            G.say(s.crankIn ? 'The box sits on the pedestal, its crank in its front. Turn it.' : 'The box sits on the pedestal. Now its crank.', 'There.'); refresh(); return true;
          }
          if (item.id === 'crank') {
            // nothing on this pedestal for it to fit: its socket feels about the bare top of the pedestal for something to
            // go on, finds nothing, and the crank comes back to your hand
            if (s.placedAt !== k) {
              G.say(s.placedAt < 0 ? 'The crank has nothing to turn. The music box goes on a pedestal first.' : 'The music box is not on this pedestal.', 'Nothing here for it to turn.');
              const q = onLine(PED - 0.08, 0.04, 0.78, k);
              return G.refuse({ preset: 'bump', drop: false, at: { x: q[0], y: q[1], z: q[2] }, tip: [0.3, 0.3], sfx: { hit: 'tink' } });
            }
            s.crankIn = true; AUDIO.sfx('fit'); G.say('The crank fits the front of the box. Turn it.', 'It fits.'); refresh(); return true;
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
    // caught after the box played wrong (the illusions cost it the clock), or without the box ever having played
    L.deathCause = () => (s.wrongs ? 'wrong' : s.turns ? null : 'unplayed');
    // when it has you it is angry (weeping), whatever it was before: the red eyes, the tears, the open sob, all the way in to
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
    // The music box set down is built where it stands, square on the pedestal and in true perspective as the pedestal is:
    // a walnut case (its front toward you, its top seen from above) on brass feet, its lid standing open at the back with
    // the red velvet and the little round mirror inside it toward you, the works and the dancer in its open top, and the
    // crank in the front, right of the brass heart (left, if the doll takes it from the right: s.flip), going round in the
    // plane of the front. MB: its size at BOXW (in metres; at another size it is that much bigger or smaller): w across,
    // h high on feet foot high, d deep, a lid lid high, and the crank's boss cx across from the middle of the front.
    const MB = { w: 0.32, h: 0.12, d: 0.18, foot: 0.012, lid: 0.15, cx: 0.07, crankR: 0.034 };
    const MBC = {
      wood: [124, 74, 40], woodD: [84, 48, 26], woodL: [166, 112, 66], grain: [100, 58, 30], inside: [40, 22, 18], brass: [212, 174, 90], brassD: [118, 88, 36],
      velvet: [146, 32, 48], velvetD: [96, 20, 32], glass: [150, 172, 198], glassL: [222, 232, 246], steel: [198, 202, 212], steelD: [96, 100, 110], pale: [242, 232, 226],
    };
    // the front of the case, its feet and its crank, in metres on the front (x across, y up from the foot of the feet)
    const boxFront = (ctx, P, o) => {
      const w = MB.w, h = MB.h, f = MB.foot, c = k => P.col(MBC[k]), fl = o.flip ? -1 : 1;
      for (const x of [-w / 2 + 0.018, w / 2 - 0.018]) P_ell(ctx, x, f * 0.75, 0.012, 0.009, c('brass'));
      P_rect(ctx, -w / 2, f, w, h, c('wood'));
      P_rect(ctx, -w / 2, f + h - 0.012, w, 0.012, c('woodL')); P_rect(ctx, -w / 2 - 0.004, f, w + 0.008, 0.014, c('woodD'));
      for (const y of [0.045, 0.085]) P_line(ctx, -w / 2 + 0.014, f + y, w / 2 - 0.016, f + y + 0.004, 0.0025, c('grain'));
      heartShape(ctx, -fl * 0.06, f + h * 0.48, 0.02, c('brass'), c('brassD'));
      const hx = fl * MB.cx, hy = f + h / 2;
      P_ell(ctx, hx, hy, 0.012, 0.012, c('brassD')); P_ell(ctx, hx, hy, 0.009, 0.009, c('brass'));
      if (o.crank === undefined) { P_rect(ctx, hx - 0.004, hy - 0.004, 0.008, 0.008, P.col([30, 16, 10])); return; }
      const R = MB.crankR, ex = hx + Math.cos(o.crank) * R, ey = hy + Math.sin(o.crank) * R;
      P_line(ctx, hx, hy, ex, ey, 0.013, c('brassD')); P_line(ctx, hx, hy, ex, ey, 0.008, c('brass'));
      P_ell(ctx, hx, hy, 0.0055, 0.0055, c('brassD'));
      P_ell(ctx, ex + 0.003, ey - 0.003, 0.011, 0.011, c('brassD')); P_ell(ctx, ex, ey, 0.009, 0.009, c('pale'));
      P_ell(ctx, ex - 0.003, ey + 0.003, 0.003, 0.003, P.cola([255, 255, 255], 0.7));
    };
    // the inside of the lid, standing open (x across, y up from its hinge)
    const boxLid = (ctx, P) => {
      const w = MB.w, h = MB.lid, c = k => P.col(MBC[k]);
      P_rect(ctx, -w / 2, 0, w, h, c('woodD'));
      P_rect(ctx, -w / 2 + 0.012, 0.006, w - 0.024, h - 0.018, c('velvet'));
      P_rect(ctx, -w / 2 + 0.012, h - 0.02, w - 0.024, 0.008, c('velvetD'));
      P_rect(ctx, -w / 2, h - 0.006, w, 0.006, c('woodL'));
      P_ell(ctx, 0, h * 0.55, 0.036, 0.04, c('brassD')); P_ell(ctx, 0, h * 0.55, 0.03, 0.034, c('glass'));
      P_poly(ctx, [[-0.016, h * 0.58], [-0.002, h * 0.66], [0.004, h * 0.64], [-0.01, h * 0.56]], c('glassL'));
    };
    // the dancer on her mirror disc, on her toes, a pink tutu, her arms up in a ring (y up from her toes, 0.09 high);
    // spin turns her (seen narrower edge on, and from behind past a quarter turn)
    const dancer = (ctx, P, spin) => {
      const pale = P.col([242, 232, 226]), pink = P.col([234, 160, 182]), pinkL = P.col([252, 210, 222]), bun = P.col([70, 44, 30]);
      const sx = Math.cos(spin || 0);
      ctx.save(); ctx.scale(0.36 * Math.sign(sx || 1) * Math.max(0.3, Math.abs(sx)), 0.36); ctx.translate(0, -0.452);
      P_line(ctx, 0, 0.452, 0.004, 0.56, 0.016, pale);
      P_line(ctx, 0.004, 0.56, 0.06, 0.585, 0.014, pale);
      P_ell(ctx, 0, 0.565, 0.07, 0.02, pink); P_ell(ctx, 0, 0.572, 0.055, 0.011, pinkL);
      P_poly(ctx, [[-0.013, 0.57], [0.013, 0.57], [0.008, 0.628], [-0.008, 0.628]], pink);
      P_limb(ctx, [[-0.008, 0.622], [-0.03, 0.66], [-0.01, 0.705]], 0.011, pale); P_limb(ctx, [[0.008, 0.622], [0.03, 0.66], [0.01, 0.705]], 0.011, pale);
      P_ell(ctx, 0, 0.648, 0.016, 0.019, pale); P_ell(ctx, 0, 0.66, 0.016, 0.009, bun); P_ell(ctx, 0, 0.673, 0.008, 0.007, bun);
      ctx.restore();
    };
    // the box as one picture, as the eye sees it held at about that height in front of it (front, top, lid): what the
    // doll carries, drawn in its arms in a box BOXW across (x -0.5..0.5, y up from 0)
    const drawBox = (ctx, P) => {
      const k = 1 / BOXW, fl = s.flip ? -1 : 1, w = MB.w * k, top = (MB.foot + MB.h) * k, dTop = 0.19, wBack = w * 0.94, c = q => P.col(MBC[q]);
      ctx.save(); ctx.translate(0, top + dTop); ctx.scale(k * 0.94, k * 0.9); boxLid(ctx, P); ctx.restore();
      P_poly(ctx, [[-w / 2, top], [w / 2, top], [wBack / 2, top + dTop], [-wBack / 2, top + dTop]], c('woodL'));
      P_poly(ctx, [[-w / 2 + 0.035, top + 0.012], [w / 2 - 0.035, top + 0.012], [wBack / 2 - 0.03, top + dTop - 0.02], [-wBack / 2 + 0.03, top + dTop - 0.02]], c('inside'));
      const wy = top + 0.07, cx0 = fl > 0 ? -0.3 : 0.06;
      P_rect(ctx, cx0, wy - 0.012, 0.24, 0.04, c('brassD')); P_rect(ctx, cx0, wy, 0.24, 0.018, c('brass'));
      for (let i = 0; i < 9; i++) P_line(ctx, -fl * (0.29 - i * 0.026), top + 0.03, -fl * (0.29 - i * 0.026), wy - 0.012, 0.012, c('steel'));
      P_ell(ctx, fl * 0.175, top + 0.09, 0.07, 0.022, c('brassD')); P_ell(ctx, fl * 0.175, top + 0.092, 0.058, 0.016, c('glass'));
      ctx.save(); ctx.translate(fl * 0.175, top + 0.09); ctx.scale(k, k); dancer(ctx, P, s.spin); ctx.restore();
      ctx.save(); ctx.scale(k, k); boxFront(ctx, P, { flip: s.flip, crank: s.crankIn ? s.crankA : undefined }); ctx.restore();
    };
    // the box built on pedestal k (or on its way off it), as liftedBox places it (b), its base y0 high, tipped over by rock
    // in the plane of its front (about the middle of its base). glow: the target it is a piece of
    const boxParts = (k, b, y0, rock, glow) => {
      const sc = b.w / BOXW, fl = s.flip ? -1 : 1, cr = Math.cos(rock), sr = Math.sin(rock);
      const yaw = s.mirrors[k].deg * DEG + Math.PI, out = [];
      const at = (u, y, v) => { const uu = u * sc, yy = y * sc; return onLine(b.d + v * sc, b.lat + uu * cr - yy * sr, y0 + uu * sr + yy * cr, k); };
      const quad = (pts, col, sd) => out.push({ kind: 'poly', pts: pts.map(p => at(p[0], p[1], p[2])), color: col, sortDist: sd, glowOf: glow });
      // a part on an upright face of it (in true perspective, as the face is), its foot at (u, y, v); tipped with the rest
      const onFace = (u, y, v, w, h, draw, sd) => {
        const p = at(u, y, v);
        out.push(SC.mkSprite(L, 0, 0, 0, w * sc, h * sc, (ctx, P) => { ctx.scale(sc, sc); if (rock) ctx.rotate(rock); draw(ctx, P); }, { x: p[0], y: p[1], z: p[2], face: yaw, sortDist: sd, glowOf: glow }));
      };
      const W = MB.w / 2, D = MB.d / 2, T = MB.foot + MB.h, I = 0.012;
      // the lid, then the top and the open inside of it, the works and the dancer, a side if it is in view, the front
      onFace(0, T, D, MB.w, MB.lid, boxLid, 2.17);
      quad([[-W, T, -D], [W, T, -D], [W, T, D], [-W, T, D]], MBC.woodL, 2.16);
      quad([[-W + I, T, -D + I], [W - I, T, -D + I], [W - I, T, D - I], [-W + I, T, D - I]], MBC.inside, 2.159);
      const cu0 = -fl * 0.13, cu1 = -fl * 0.02, cy = T - 0.008;   // the brass cylinder, across the left of the inside, and the steel comb before it
      quad([[cu0, cy - 0.02, -0.005], [cu1, cy - 0.02, -0.005], [cu1, cy, -0.005], [cu0, cy, -0.005]], MBC.brassD, 2.1585);
      quad([[cu0, cy, -0.005], [cu1, cy, -0.005], [cu1, cy, 0.025], [cu0, cy, 0.025]], MBC.brass, 2.1584);
      quad([[cu0, cy - 0.004, -0.04], [cu1, cy - 0.004, -0.04], [cu1, cy - 0.004, -0.03], [cu0, cy - 0.004, -0.03]], MBC.steelD, 2.1583);
      for (let i = 0; i < 9; i++) { const u = cu0 + (cu1 - cu0) * (i + 0.5) / 9; out.push({ kind: 'poly', pts: [at(u, cy - 0.003, -0.032), at(u, cy - 0.003, -0.007)], color: MBC.steel, stroke: true, lw: 0.0035 * sc, sortDist: 2.1582, glowOf: glow }); }
      const du = fl * 0.075, dv = 0.01, disc = (r, y, col, sd) => quad(Array.from({ length: 12 }, (_, i) => [du + Math.cos(i / 12 * TAU) * r, y, dv + Math.sin(i / 12 * TAU) * r]), col, sd);
      disc(0.028, cy, MBC.brassD, 2.1581); disc(0.022, cy + 0.0005, MBC.glass, 2.158);
      { const p = at(du, cy, dv); out.push(SC.mkSprite(L, 0, 0, 0, 0.06 * sc, 0.1 * sc, (ctx, P) => { ctx.scale(sc, sc); dancer(ctx, P, s.spin); }, { x: p[0], y: p[1], z: p[2], sortDist: 2.1575, glowOf: glow })); }
      const side = b.lat > W * sc ? -1 : b.lat < -W * sc ? 1 : 0;   // (from the middle of the room a side shows only once it is lifted off to one side)
      if (side) quad([[side * W, MB.foot, -D], [side * W, MB.foot, D], [side * W, T, D], [side * W, T, -D]], MBC.woodD, 2.155);
      onFace(0, 0, -D, MB.w + 0.02, T + 0.012, (ctx, P) => boxFront(ctx, P, { flip: s.flip, crank: s.crankIn ? s.crankA : undefined }), 2.15);
      return out;
    };
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
        if (!m.live) { m.live = true; m.heap++; s.sheetFall = { k: s.odd, t0: L.t, hissed: true }; m.anim = { t0: L.t, T: SHEET.down }; AUDIO.sfx('hiss'); }   // a sheet over it slides off
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
        const grip = onBox(b, s.side * (MB.w / BOXW / 2 + 0.04), 0.22, { dist: AT, lat });
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
      s.now = L.t;   // the sheets' clock (the easter egg runs it on while you die: eggStep)
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
      // is calm and stops dead when the box plays wrong (it eases out of the dance into its weeping stance, and back into it
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
      glowWith(sheetTargets[k], list);
      // the heap is built where it lies, on the floor at the foot of the glass, so it stays put however you turn: a corner
      // of the sheet spread flat on the tiles toward you, and the crumpled mound, a front slope up from a ragged foot to an
      // uneven ridge (its back, against the glass, never shows from the middle of the room), in folds of light and shade
      const heapCol = [150, 142, 126], heapFold = [118, 110, 96];
      const RX = [-0.65, -0.61, -0.42, -0.18, 0.03, 0.26, 0.47, 0.62, 0.65], RY = [0, 0.1, 0.17, 0.15, 0.25, 0.19, 0.22, 0.11, 0];
      const FZ = [3.16, 3.1, 3.06, 3.09, 3.04, 3.08, 3.05, 3.11, 3.17], RZ = [3.36, 3.33, 3.31, 3.32, 3.29, 3.31, 3.3, 3.33, 3.37];
      const heap = [poly([[-0.55, 0.006, 3.12], [-0.2, 0.006, 2.9], [0.24, 0.006, 2.96], [0.4, 0.006, 3.1], [-0.3, 0.006, 3.14]], heapCol)];
      for (let i = 0; i < RX.length - 1; i++) {
        const c = i % 2 ? heapFold : heapCol;
        heap.push(poly([[RX[i], 0.004, FZ[i]], [RX[i + 1], 0.004, FZ[i + 1]], [RX[i + 1], RY[i + 1], RZ[i + 1]], [RX[i], RY[i], RZ[i]]], c));
      }
      heapAt[k] = heap;
      for (const t of heapTargets[k]) glowWith(t, heap);
    }));
    // ---- the easter egg: every mirror under a dust sheet ----
    // The moment the last bare mirror is covered (foundEgg) the night is over, and what follows is its death, all of it
    // (so nothing can be pressed): the last sheet settles and the room is quiet but for its feet (the death's own sound is that sheet's
    // flop; the game stops the rest), EGG.hush seconds; then, in that sheet, its face comes pressing out through the cloth
    // from inside (CREATURES.other.pressed: brow, eye sockets, nose, the open mouth), a hand either side of it from
    // EGG.hands, fingers spread, the cloth stretching toward you and creaking, its sob rising to a wail (sheetPress); from
    // EGG.others the other three sheets bulge with its face too (and stay so); and at EGG.burst that same face and those
    // hands, still in the cloth, come at you, with a rush of air (sheetWhoosh): the lunge any death here ends in, but what lunges is the sheet with it inside
    // (CREATURES.other.shroud: c.shroud), the moulded face growing toward your eye, a cloth-covered hand reaching either
    // side, and the rest of the sheet dragged off the mirror's frame behind them, streaming back from the face in a ring of
    // folds, its hem flaring, until it fills the view. The doll itself is never seen. For the game it is on that mirror's
    // own line from the first, EGG.from off (the sheet's own place), drawing nothing until then. With reduced motion the
    // cloth bulges less and does not tremble, the sheet flares less and does not ripple, and nothing shakes
    // In the hush it is heard coming: its little hard feet (the doll's own), EGG.steps of them, running up to the back of
    // that sheet, quicker and louder each one from faint to loud, from where that mirror is, the last as its face comes
    const EGG = { hush: 1.0, face: 1.1, hands: 1.5, handsT: 0.8, others: 1.35, burst: 2.9, dur: 0.55, from: 3.42,
      steps: [0.1, 0.28, 0.44, 0.58, 0.7, 0.8, 0.89, 0.97], vol: [0.1, 0.8] };
    const gentle = () => !!SAVE.data.settings.reducedMotion;
    const eggStep = (c, k) => {
      const e = s.egg, T = G.stateT;
      s.now = e.at + T;
      while (e.steps < EGG.steps.length && T >= EGG.steps[e.steps]) {
        AUDIO.footstep('smiler', lerp(EGG.vol[0], EGG.vol[1], e.steps / (EGG.steps.length - 1)), Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85);
        e.steps++;
      }
      if (!e.pressed && T >= EGG.hush) { e.pressed = true; AUDIO.sfx('sheetPress', 0); }
      if (!e.burst && k > 0) { e.burst = true; AUDIO.sfx('sheetWhoosh', 0); const m = s.mirrors[e.k]; m.live = true; m.anim = null; c.shroud.hidden = false; if (!gentle()) G.shake(1.2); }   // the sheet leaves the glass with it
    };
    const ignored = k => {
      const c = c0();
      foundEgg();
      s.egg = { k, at: s.now, pressed: false, burst: false, steps: 0, shown: [] };
      c.retarget(1 + k); c.dist = c.hold = EGG.from; c.lat = c.runLat = 0; c.yOff = 0;
      Object.assign(c, { back: false, smile: false, angry: 1, dance: 0, danceMir: 1, runPose: false, arms: null, carry: null, rush: 0, tint: null });
      // what the game draws of it from here on: nothing, and then the sheet with it inside (press: how far it was pressed into it)
      c.shroud = { hidden: true, from: EGG.from, eye: L.eyeH, press: gentle() ? 0.6 : 1, still: gentle(), cloth: CLOTH };
      L.lane = c.lane; L.laneIdx = c.lane.idx;
      c.deathSpec = { delay: EGG.burst, dur: EGG.dur, sting: 'flop', pose: eggStep };
      die(c, 'ignored');
      G.shakeAmt = 0;   // (no jolt as the sheet goes up: the room is still)
    };
    // how far its face (and its hands) are pressed into mirror k's sheet now
    const pressOf = k => {
      const e = s.egg, T = s.now - e.at, own = k === e.k, g = gentle() ? 0.6 : 1;
      if (own && e.burst) return null;
      const face = smoothstep((T - (own ? EGG.hush : EGG.others)) / EGG.face) * (own ? 1 : 0.7) * g;
      return face > 0 ? { k: face, hands: own ? smoothstep((T - EGG.hands) / EGG.handsT) * g : 0, t: T, still: gentle(), cloth: CLOTH } : null;
    };
    const bulges = s.mirrors.map((m, k) => {
      const q = onLine(3.42, 0, 0, k), o = {};
      const b = SC.mkSprite(L, 0, 0, 0, 2.2, 2.7, (ctx, P) => CR.pressed(ctx, P, o), { x: q[0], y: q[1], z: q[2], face: m.deg * DEG + Math.PI, sortDist: 3.47 });
      b.press = o;
      return b;
    });
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
      // (a sheet on its way up: the glass still shows it until the cloth is over it)
      if (c.lane.follow) s.mirrors.forEach((m, k) => {
        if (!m.live && !(m.anim && m.anim.up && s.now < m.anim.t0 + m.anim.T)) return;
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
      // the sheets: hanging over the glass; sliding off it (squeezed down to the floor); thrown up over it (the top of it up
      // to the frame first, the hem swinging up after it and dropping back); and the heap of those that have come down
      s.mirrors.forEach((m, k) => {
        const a = m.anim, u = a ? clamp((s.now - a.t0) / a.T, 0, 1) : 1;
        let fy = null;
        if (a && u < 1) {
          if (a.up) { const r = easeOut(u / 0.75), lift = Math.sin(Math.PI * u) * 0.34 * r; fy = y => 0.05 + (y - 0.05) * r + lift * Math.max(0, 1 - y / 1.4); }
          else { const e = easeIn(u); fy = y => 0.05 + (y - 0.05) * (1 - e); }
        }
        if (fy) for (const q of sheetAt[k]) R.add(Object.assign({}, q, { pts: q.pts.map(w => [w[0], fy(w[1]), w[2]]) }));
        else if (!m.live) for (const q of sheetAt[k]) R.add(q);
        if (heapShown(k)) for (const q of heapAt[k]) R.add(q);
        const pr = s.egg && !fy && !m.live ? pressOf(k) : null;
        if (pr) { Object.assign(bulges[k].press, pr); R.add(bulges[k]); }
        if (s.egg) s.egg.shown[k] = pr;   // (what each sheet shows of it now)
      });
      // (the red of the death comes up with the cloth, not before it: the hush is only quiet)
      if (s.egg && G.state === 'dying') G.danger = Math.min(G.danger, 0.06 + 0.94 * smoothstep((G.stateT - EGG.hush) / (EGG.burst - EGG.hush)));
      if (s.ripples) for (const rp of s.ripples) { const a = (L.t - rp.t0) / 0.9; if (a < 1) R.add(ripple(onLine(3.47, rp.lat, 0.35), a)); }
      // the music box on its pedestal (whichever it is on), or on its way off it into the doll's arms: over the pedestal's
      // cap and the doll
      // When its crank jams (before the wrong mirror) the box jumps on the pedestal and rocks back down
      if (s.placedAt >= 0 && !s.held) {
        const j = L.t - s.wrongAt, jolt = j >= 0 && j < 0.5 ? 1 - j / 0.5 : 0, hop = 0.035 * Math.abs(Math.sin(j * 19)) * jolt * jolt, rock = 0.09 * Math.sin(j * 27) * jolt;
        const b = liftedBox(s.lift || 0);
        for (const q of boxParts(s.placedAt, b, b.y + hop, rock, pedTargets[s.placedAt])) R.add(q);   // (clicked, it is the pedestal it is on)
      }
    };
    L.floor = { poly: [[-3.3, -3.3], [3.3, -3.3], [3.3, 3.3], [-3.3, 3.3]], y: 0 };
  }
});
