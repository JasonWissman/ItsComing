'use strict';
// ============================================================ 7. THE LIGHTHOUSE ============================================================
// You stand at the rail of the gallery. The thing climbs the outside of the tower, so the lanes go DOWN: you only see
// it by looking over the rail. It climbs slowly while you watch it and fast while you do not. Put the spare bulb in the
// lamp; open the fuse box, pull out the blown fuse and put in the new one from the toolbox; turn the crank.

// a blown cartridge fuse: the glass black with soot and split down its length, the wire burned through
Object.assign(ICONS, {
  blownfuse(ctx, P) {
    const brass = P.col([138, 114, 62]), glass = P.col([44, 40, 38]), soot = P.col([14, 12, 12]), split = P.col([206, 200, 186]), wire = P.col([90, 90, 96]);
    P_rect(ctx, -0.32, 0.36, 0.64, 0.24, glass);
    P_ell(ctx, -0.02, 0.48, 0.24, 0.12, soot);
    P_line(ctx, -0.27, 0.48, -0.17, 0.5, 0.02, wire); P_line(ctx, 0.12, 0.46, 0.27, 0.48, 0.02, wire);
    P_limb(ctx, [[-0.1, 0.6], [-0.04, 0.53], [-0.09, 0.47], [0.0, 0.41], [-0.03, 0.36]], 0.025, split);
    P_rect(ctx, -0.42, 0.33, 0.14, 0.3, brass); P_rect(ctx, 0.28, 0.33, 0.14, 0.3, brass);
  },
});

LEVELS.push({
  id: 'lighthouse', title: 'The Lighthouse', facing: 315, eyeH: 1.65,
  pal: { skyTop: [10, 12, 22], fog: [50, 56, 70], ground: [44, 50, 62], fogDist: 70 },
  ambient: { wind: 1.6, drone: 0.5, droneFreq: 48, windFreq: 520, rain: 1.0 },
  weather: { kind: 'rain', density: 1.0, wind: 0.8, lightning: [7, 15] },
  text: {
    intro: 'The lamp went out an hour ago. Since then something has been climbing the outside of the tower.<br>You can hear it when you are not looking. Look over the rail.',
    hint: 'The bulb in the big lamp behind you has blown, and so has the fuse. Put the spare bulb in, change the fuse (there is a new one in the toolbox), then turn the crank until the light goes round.',
    objective: 'New bulb in the lamp. New fuse in the fuse box. Turn the crank.',
    death: { default: 'It came over the rail with its face already turned up to you.' },
    win: 'The beam went round and round. The first time it came past, the thing slid down the wet stone; the second time, it let go and fell. In the morning it was still in the water, looking up.',
    fragment: 'There were scratches on the wardrobe door in the morning, high up, where nobody could reach.',
  },
  lanes: [
    { deg: 0, name: 'below the rail', elev: -65, barrierDist: 0, cue: 'scrape', default: true },
    { deg: 45, name: 'right face', elev: -65, barrierDist: 0, cue: 'scrape' },
    { deg: -45, name: 'left face', elev: -65, barrierDist: 0, cue: 'scrape' },
  ],
  // it keeps climbing while you watch it, at under a third of its pace
  creatures: [{ type: 'climber', startDist: 26, time: 72, seenMult: 0.3, unseenMult: 1 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const AX = 0, AZ = -2.9;                        // the tower's axis: the player stands 2.9 m from it, toes at the rail
    const at = (th, r, y) => [AX + Math.cos(th) * r, y, AZ + Math.sin(th) * r];
    const N = 24, iron = [40, 42, 46], ironL = [62, 64, 70];
    const rad = y => 3.25 + 0.466 * Math.max(0, -y);   // the tower flares out below the gallery, 25 degrees from the vertical
    // the farthest and nearest a piece comes to you across the floor: a long piece whose near end is close must not sort in
    // front of what is fixed in front of its far end (the fuse box and the crank on their stanchions, an item by the rail)
    const far = (...ps) => Math.max(...ps.map(p => Math.hypot(p[0], p[2]))), near = (...ps) => Math.min(...ps.map(p => Math.hypot(p[0], p[2])));
    SC.stars(L, 71, 50, 0.3);
    SC.clouds(L, 72, 8, [30, 34, 46], 0.55);
    // the sea, far below, in rings fine enough that the fog fades across them instead of stepping from one to the next; paler
    // where the surf breaks round the foot of the tower
    const seaR = [12, 14.7, 17, 20, 24, 29, 36, 45, 58, 76, 100, 140, 200, 320], SEA = 24;
    for (let k = 0; k < seaR.length - 1; k++) for (let i = 0; i < SEA; i++) {
      const a0 = i / SEA * TAU, a1 = (i + 1) / SEA * TAU, r0 = seaR[k], r1 = seaR[k + 1], rm = (r0 + r1) / 2;
      SC.quad(L, at(a0, r0, -24.6), at(a1, r0, -24.6), at(a1, r1, -24.6), at(a0, r1, -24.6), r0 < 17 ? [30, 38, 48] : [18, 26, 36], { dist: Math.hypot(rm, 26.2), layer: 0 });
    }
    // rocks breaking the surface, as they look from far above: grey, ragged, the surf pale on their seaward side. Those near the
    // three faces it climbs (the sea foreshortens a lot from up here) lie further out, well above it in the view, so it is
    // always seen against open water.
    const rng = mulberry32(77);
    for (let i = 0; i < 26; i++) {
      const th = rng() * TAU, r0 = 15.5 + rng() * 12, size0 = 1.2 + rng() * 2.2, v = rng() * 14, a0 = at(th, r0, -24.6);
      const out = [0, 45, -45].some(l => Math.abs(wrapPi(Math.atan2(a0[0], a0[2]) - l * DEG)) < 25 * DEG);
      const r = out ? r0 + 24 : r0, size = out ? size0 * 1.4 : size0, c = at(th, r, -24.6);
      const rr = []; for (let k = 0; k < 9; k++) rr.push(size * 0.5 * (0.55 + rng() * 0.7));
      const d = Math.hypot(c[0], c[2], 26.3), sx = Math.cos(th) * size * 0.25, sz = Math.sin(th) * size * 0.25;
      const blob = (k, y, dx, dz) => rr.map((q, j) => { const a = j / rr.length * TAU; return L.pt(c[0] + dx + Math.cos(a) * q * k, y, c[2] + dz + Math.sin(a) * q * k); });
      // (drawn before the whole tower: its foot hides the ones that lie behind it)
      L.props.push({ kind: 'poly', pts: blob(1.3, -24.59, sx, sz), color: [160, 170, 178], alpha: 0.14, dist: d + 0.2, sortDist: 100 + d + 0.2 });   // the surf, breaking on it from the sea
      L.props.push({ kind: 'poly', pts: blob(1, -24.56, 0, 0), color: [42 + v, 46 + v, 50 + v], dist: d, sortDist: 100 + d });                // the rock
    }
    // a town across the water: a scatter of lights low on the horizon
    for (let i = 0; i < 16; i++) { const th = (150 + rng() * 60) * DEG, d = 180 + rng() * 60, p = at(th, d, -22 + rng() * 2), w = 0.8 + rng() * 1.2; SC.sprite(L, p[0], p[1], p[2], w, w * 0.7, (ctx, P) => { ctx.scale(w, w * 0.7); P_rect(ctx, -0.5, 0, 1, 1, P.raw([230, 200, 140])); }, { noFog: true, noLight: true, dist: d }); }
    // the tower wall below the gallery, in bands. Nothing is ever behind the wall but the sea and the rocks, and the thing
    // is always on it: the whole wall is drawn before it, wherever on it it is (its hands reach up the wall over bands
    // nearer you than it is), in the bands' own order by their true distance from the eye
    const edges = [0, -0.7, -1.8, -3.5, -6, -9, -13, -18, -24.6];
    for (let b = 0; b < edges.length - 1; b++) {
      const y0 = edges[b], y1 = edges[b + 1], r0 = rad(y0), r1 = rad(y1), ym = (y0 + y1) / 2, rm = rad(ym), shade = 148 - b * 9;
      for (let i = 0; i < N; i++) {
        const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, am = (a0 + a1) / 2;
        const cx = AX + Math.cos(am) * rm, cz = AZ + Math.sin(am) * rm, dd = Math.hypot(cx, cz, 1.65 - ym);
        const opts = { dist: dd + 0.7, sortDist: 40 + dd * 0.1 };
        if (b < 5) { opts.tex = 'stone'; opts.texScale = 2.2; }
        SC.quad(L, at(a0, r0, y0), at(a1, r0, y0), at(a1, r1, y1), at(a0, r1, y1), [shade, shade - 2, shade - 6], opts);
      }
    }
    // the gallery floor, the rail, the lamp room and its roof. The rail stands a little in from the edge of the floor and
    // not quite waist high, so looking down over it its top bar is low in the view, below the wall it climbs until the
    // thing is nearly at the top.
    const RR = 3.07;
    for (let i = 0; i < N; i++) {
      const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, am = (a0 + a1) / 2;
      // the floor sorts by its true distance from the eye, like the tower below it, so it covers the tower where it overhangs
      const fc = at(am, 2.62, 0);
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), at(a1, 3.25, 0), at(a0, 3.25, 0), [58, 60, 64], { tex: 'tin', texScale: 1.6, dist: Math.hypot(fc[0], fc[2], 1.65) });
      // the lamp room's own floor, seen through its glass: drawn over the far side of the tower, under all that stands on it
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), [AX, 0, AZ], [AX, 0, AZ], [46, 48, 52], { sortDist: 3.6 });
      SC.quad(L, at(a0, 3.25, 0), at(a1, 3.25, 0), at(a1, 3.25, -0.12), at(a0, 3.25, -0.12), ironL);
      // the lamp room's wall, glass, eave and roof sort by their far ends, behind the fuse box and the crank on its stanchions
      const ring = (r, y0, y1, col, o) => { const q = [at(a0, r, y0), at(a1, r, y0), at(a1, r, y1), at(a0, r, y1)]; SC.quad(L, q[0], q[1], q[2], q[3], col, Object.assign({ sortDist: far(...q) }, o)); };
      ring(2.0, 0, 0.85, iron);
      ring(2.0, 0.85, 2.75, [140, 165, 195], { alpha: 0.2 });
      // the glazing bars, each in front of the glass either side of it; none on the line from you to the lamp
      if (i !== N / 4) { const q = [at(a0 - 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 2.75), at(a0 - 0.012, 2.02, 2.75)]; SC.quad(L, q[0], q[1], q[2], q[3], [34, 36, 40], { sortDist: near(...q) }); }
      ring(2.15, 2.72, 2.9, iron);
      { const q = [at(a0, 2.15, 2.9), at(a1, 2.15, 2.9), at(am, 0.05, 4.4)]; SC.quad(L, q[0], q[1], q[2], q[2], [30, 32, 36], { sortDist: far(...q) }); }
      // the rail's bars sort by their far ends too, so nothing standing inside the rail is ever drawn under them
      for (const yy of [0.47, 0.96]) ring(RR, yy, yy + 0.05, ironL);
      // rail posts only at every third segment, and none near the three faces it climbs, so none stands between you and it
      const p = at(a0, RR, 0), az = Math.atan2(p[0], p[2]);
      if (i % 3 === 0 && [0, 45, -45].every(l => Math.abs(wrapPi(az - l * DEG)) > 22 * DEG)) SC.sprite(L, p[0], 0, p[2], 0.06, 1.01, (ctx, P) => { ctx.scale(0.06, 1.01); P_rect(ctx, -0.5, 0, 1, 1, P.col(ironL)); });
    }
    // two stanchions on the lamp room: the fuse box on one at chest height, the crank on the other at the waist. Each is
    // fixed to the face of its stanchion that looks your way, and drawn after the stanchion and before its own outline,
    // so neither the iron hides it nor it hides the outline when you point at it.
    const FB = 60 * DEG, WD = 120 * DEG;
    const post = th => { const p = at(th, 2.0, 0); SC.box(L, p[0] - 0.19, p[0] + 0.19, 0, 2.75, p[2] - 0.19, p[2] + 0.19, iron); return p; };
    const fbP = post(FB), wdP = post(WD);
    const FBW = 0.44, FBH = 0.52, fb = [fbP[0], 1.1, fbP[2] + 0.22];   // the fuse box: its foot at 1.1 m, on the face toward you
    const WDS = 0.5, wd = [wdP[0], 0.7, wdP[2] + 0.22];                // the crank: its foot at 0.7 m, so nothing on the floor is behind it
    const mounted = (x, z) => Math.hypot(x, z) + 0.012;   // just behind its outline (at its own distance), well in front of the iron
    const LW = 1.1, LH = 1.5;                             // the lamp's lens, standing on its pedestal
    // the lens on its pedestal, inside the glass
    SC.box(L, AX - 0.45, AX + 0.45, 0, 0.9, AZ - 0.45, AZ + 0.45, [50, 50, 56]);
    // the keeper's crate, against the lamp room in the corner by the fuse box's stanchion, and on it a bedside lamp, of all
    // things: below the fuse box as you look at it, behind you to the right, clear of every spot an item may lie in
    { const cp = at(75 * DEG, 2.17, 0); SC.box(L, cp[0] - 0.18, cp[0] + 0.18, 0, 0.4, cp[2] - 0.15, cp[2] + 0.15, [84, 64, 44], { tex: 'planks', texScale: 0.7 }); STORY.lamp(L, cp[0], 0.4, cp[2], { scale: 0.8 }); }
    // items: on the gallery floor where you can see them, none of them round behind a stanchion or under the crank
    const floorAt = (deg, r) => { const p = at(deg * DEG, r, 0); return { x: p[0], y: 0, z: p[2] }; };
    const spots = [floorAt(60, 2.7), floorAt(120, 2.7), floorAt(45, 2.9), floorAt(135, 2.9), floorAt(75, 3.0), floorAt(108, 3.0)];
    // the lamp's bulb has blown and so has the fuse: a spare bulb lies about, the new fuse is in the toolbox, and a
    // blown one that looks like it might do lies about as well
    Object.assign(s, { open: false, blownIn: true, bulb: false, fuse: false, power: false, turning: false, beamA: 0, beamSpeed: 1, crossing: false, lensA: 0 });
    // in the hand: the bulb by its brass cap, a fuse between finger and thumb by one end, small, as they really are
    const fuseHeld = { grip: 'pinch', at: [-0.38, 0.47], angle: -0.36, size: 0.17, tip: [0.42, 0.48] };
    mkItem(L, 'bulb', 'Bulb', spots, { w: 0.2, h: 0.3, flat: false, held: { size: 0.15, angle: -0.2 } });
    mkContainer(L, {
      id: 'toolbox', name: 'Toolbox', w: 0.56, h: 0.38, color: [172, 36, 30], spot: spots.slice(0, 4), sfx: 'clunk', liftY: 0.13,
      closedText: 'A toolbox.', emptyText: 'Rags and a tin of grease.',
      yields: [{ id: 'fuse', name: 'Fuse', opts: { w: 0.34, h: 0.34, flat: false, held: fuseHeld } }],
      onOpen() { G.say('A new fuse, in among the rags.', 'Rags, a tin of grease. A fuse.'); },
    });
    mkItem(L, 'oldfuse', 'Fuse', spots, { w: 0.3, h: 0.3, flat: false, icon: 'fuse', decoy: true, decoyText: 'This one is blown as well.', held: fuseHeld });
    const lit = () => G.say(s.turning ? 'The lamp comes on.' : 'The lamp comes on. Now turn the crank.', s.turning ? 'Light.' : 'Light. It does not go round.');
    const powerUp = () => { if (!(s.bulb && s.fuse) || s.power) return false; s.power = true; lamp.done = true; setTimeout(() => AUDIO.sfx('lampOn'), 250); return true; };
    // A click that does nothing, shown where it was tried: the thing in hand goes to the spot (at: [across, up] the target),
    // knocks there and comes back to the hand; with nothing in hand the hand goes to it and touches it. o.touch is called as
    // either gets there (the old bulb rattles in its socket; the blown fuse shifts in its clips). The lamp is some way off,
    // through the lamp room's glass, but it is what the hand works here: the hand is put on it as you see it (the spot
    // brought in along your line of sight to arm's length, where the hand goes all the way).
    const inReach = (t, at) => { const p = HANDS.pointOn(t, at, 0.02), dy = p.y - L.eyeH, k = Math.min(1, 1.5 / Math.hypot(p.x, dy, p.z)); return { x: p.x * k, y: L.eyeH + dy * k, z: p.z * k }; };
    const tryAt = (t, at, o) => {
      const act = G.inv[G.active], touch = o && o.touch;
      const shown = act ? G.fumble(act, t, Object.assign({ preset: 'return', at, onHit: touch }, o && o.fumble)) : G.reach(t, Object.assign({ style: 'touch', at: inReach(t, at), onTouch: touch }, o && o.reach));
      if (!shown && !G.fumbling) AUDIO.sfx('nope');
    };
    // the bulb in the middle of the lens, where a thing tried at the lamp goes and the hand touches it; touched, it rattles in
    // its socket (the old one's broken filament with it)
    const BULB = [0, 0.48], jiggle = () => { s.jig = L.t; };
    // the lamp: the bulb goes in here
    const lamp = mkTarget(L, {
      id: 'lamp', name: 'Lamp', x: AX, y: 0.9, z: AZ, w: LW, h: LH, accepts: ['bulb'],
      hint() { return s.power ? 'Lit.' : s.bulb ? 'A new bulb in it, and no light: no power. The fuse box.' : 'The big lamp. Its bulb has blown.'; },
      onClick() {
        if (s.power) { G.say('Lit.', 'Lit.'); tryAt(lamp, BULB); return true; }
        if (s.bulb) { G.say('The bulb is in, but there is no power. Try the fuse box.', 'The new bulb is in. Still dark.'); tryAt(lamp, BULB, { touch: jiggle }); return true; }
        if (!G.hasItem('bulb')) { G.say('The big lamp. Its bulb has blown.', 'The lamp is dark. Its bulb has blown.'); tryAt(lamp, BULB, { touch: jiggle, reach: { sfx: 'tink' } }); return true; }
        return false;
      },
      use(item) {
        if (item.id !== 'bulb' || s.bulb) return false;
        s.bulb = true; s.bulbAt = L.t; lamp.accepts = []; AUDIO.sfx('fit');
        if (powerUp()) lit();
        else G.say('The bulb is in. Nothing: there is no power. Try the fuse box.', 'The bulb is in. Still dark.');
        return true;
      },
    });
    // the fuse box: open its door, pull out the blown fuse, put the new one in
    // Where the fuse lies in its clips (the middle of the box). A blown fuse pushed into the empty clips (the one that came
    // out, or the worn one lying about) is put in place there, sits a beat with nothing coming on, and drops out of the clips
    // to the floor; anything else tried there, or a fuse while the blown one is still in, knocks at it and comes back.
    const CLIPS = [0, 0.5], fuseJig = () => { s.fuseJig = L.t; };
    const intoClips = { preset: 'slip', at: CLIPS, angle: 0, scale: 0.8, hold: 0.4, sfx: { hit: 'fit' } };
    const box = mkTarget(L, {
      id: 'fusebox', name: 'Fuse box', x: fb[0], y: fb[1], z: fb[2], w: FBW, h: FBH, accepts: [],
      hint() { return s.fuse ? 'A good fuse in it.' : !s.open ? 'The fuse box. Shut.' : s.blownIn ? 'Open. The fuse in it is blown. Take it out.' : 'Open. The fuse holder is empty.'; },
      onClick() {
        if (!s.open) {   // the hand takes the handle and pulls, and the door swings open on its hinges
          s.open = true; s.openAt = L.t + 0.3; blown.hidden = false; door.hidden = false; G.say('Inside, the fuse is black and split. Blown.', 'The fuse inside is black and split.');
          s.opening = G.reach(box, { style: 'pull', at: [0.31, 0.5], onTouch() { s.openAt = Math.min(s.openAt, L.t); } });
          if (!s.opening) s.openAt = L.t;
          return true;
        }
        if (s.fuse) { G.say('A good fuse in it.', 'A new fuse in it.'); tryAt(box, CLIPS, { touch: fuseJig, fumble: { scale: 0.8 } }); return true; }
        if (s.blownIn) { G.say('Take the blown fuse out first.', 'The blown fuse is still in it.'); tryAt(box, CLIPS, { touch: fuseJig, fumble: { scale: 0.8, sfx: { hit: 'tink' } } }); return true; }
        if (!G.inv.some(i => box.accepts.includes(i.id))) {
          // only the blown fuse in hand is "the one that blew"; anything else, or nothing, finds the holder empty
          const act = G.inv[G.active], old = !!act && act.id === 'blownfuse';
          G.say(old ? 'That is the one that blew.' : 'The holder is empty. There is a new fuse in the toolbox.', old ? 'That is the one that blew.' : 'The fuse holder is empty.');
          if (old) { if (!G.fumble(act, box, intoClips) && !G.fumbling) AUDIO.sfx('nope'); } else tryAt(box, CLIPS, { fumble: { scale: 0.8 } });
          return true;
        }
        return false;
      },
      onDecoy: it => G.fumble(it, box, intoClips),   // the worn one lying about: blown as well, and it drops out of the clips
      use(item) {
        if (item.id !== 'fuse') return false;
        s.fuse = true; box.accepts = []; box.done = true; AUDIO.sfx('fit');
        if (powerUp()) lit(); else G.say('The new fuse is in. Now the bulb.', 'The new fuse is in. Still dark.');
        return true;
      },
    });
    // its door, swung open to the left of it: part of the fuse box, so pointing at it or clicking it is the fuse box. Its hit
    // box stands a touch nearer you along your line of sight (the same size on screen), so its outline draws over the door.
    const door = (() => {
      const fd = Math.hypot(fb[0], fb[2]), off = -0.68 * FBW, k = 0.97;
      const x = fb[0] + fb[2] / fd * off, z = fb[2] - fb[0] / fd * off;
      return mkTarget(L, {
        id: 'fusedoor', name: 'Fuse box', x: x * k, y: L.eyeH + (fb[1] - L.eyeH) * k, z: z * k, w: 0.36 * FBW * k, h: FBH * k, hidden: true,
        hint: () => box.hint(), onClick: () => box.onClick(), use: item => box.use(item), onDecoy: item => box.onDecoy(item),
      });
    })();
    Object.defineProperty(door, 'accepts', { get: () => box.accepts, set() {} });
    Object.defineProperty(door, 'done', { get: () => box.done, set() {} });
    // the blown fuse in its clips: only there once the door is open; it comes out into your hand, and looks it
    const blown = mkTarget(L, {
      id: 'blownfuse', name: 'Blown fuse', x: fb[0], y: fb[1] + FBH * 0.39, z: fb[2], w: 0.26, h: FBH * 0.22, hidden: true,
      hint() { return 'Blown. Take it out.'; },
      onClick() {
        if (!s.blownIn) return true;
        s.blownIn = false; blown.hidden = true; blown.done = true; box.accepts = ['fuse', 'oldfuse'];
        // it comes out of the clips up into your hand, as anything picked up does
        const it = newItem(L, 'blownfuse', 'Blown fuse', { w: 0.3, h: 0.3, decoy: true, decoyText: 'That is the one that blew.', held: fuseHeld, x: blown.x, y: blown.y, z: blown.z });
        HANDS.picked(it); G.inv.push(it); G.active = G.inv.length - 1; G.hover = null; AUDIO.sfx('pickup');
        G.say('It comes out in your hand, black and split. The holder is empty.', 'The blown fuse comes out. The holder is empty.');
        return true;
      },
    });
    const need = 8;
    const winder = mkTarget(L, {
      id: 'winder', name: 'Crank', x: wd[0], y: wd[1], z: wd[2], w: WDS, h: WDS,
      crank: { n: need, sfx: 'ratchet', onTurn() { G.shake(0.04); }, onComplete() { s.turning = true; s.beamA = azOf(L.creature) + Math.PI; AUDIO.sfx('lever'); G.say(s.power ? 'The light begins to go round.' : 'The lamp goes round, dark.', s.power ? 'The light goes round.' : 'The lamp goes round, dark.'); } },
      hint() { return s.turning ? 'Turning.' : 'The crank that turns the lamp. Turn it. ' + Math.max(0, need - Math.floor(winder.count || 0)) + ' more.'; },
    });
    // ---- where it is on the wall ----
    // Its lane is a ray from your eye, and the tower flares at the lane's own slope, so on its lane it would hang in the air
    // beside the stone, over the sea. It is put on the stone: on the line straight down the face its way climbs (FACE, in
    // degrees round the tower's axis: you are at 90), at the height its lane gives it, SINK lower, so that all of it, hands
    // and feet, lies on wall you can see from the rail. Its box (being seen, the light on it, the view that follows it) is
    // centred there, and the climber lays its body along the wall as the wall runs on screen.
    const FACE = [90, 80, 100], SINK = 0.4, SLOPE = 0.466, H2 = CREATURES.climber.h / 2;
    const stoneFrame = c => {
      const y = L.eyeH + c.dist * Math.sin(c.lane.elev), th = c.wallTh * DEG, r = rad(y), k = y < 0 ? SLOPE : 0, un = Math.hypot(1, k);
      const p = at(th, r, y - SINK * clamp((c.dist - 4) / 6, 0, 1)), cs = Math.cos(th), sn = Math.sin(th);
      const up = rotY(-cs * k / un, -sn * k / un, L.facing), out = rotY(cs / un, sn / un, L.facing), across = rotY(-sn, cs, L.facing);
      return { at: L.pt(p[0], p[1], p[2]), up: [up[0], 1 / un, up[1]], out: [out[0], k / un, out[1]], across: [across[0], 0, across[1]] };
    };
    // knocked off the stone at the end (s.fall: where it let go, how fast it was going, its frame then), it is where the fall
    // has taken it, and it turns over in the air: its top swings out from the wall first, peeling it off the stone, then it
    // rolls slowly round the line you see it along, tipping to and fro, so it shows you more of its length and then less.
    // The frame carries the stone's frame it let go in (from) and how far the picture has come from that (k): on the stone it
    // is drawn end on, as you see it there, and it is drawn more and more as it really lies in the air as it peels off.
    const WATER = -24.6, GRAV = 9.8, FALL = { tip: 1.5, peel: 0.5, rock: 0.35 };
    const fallAt = f => [f.p[0] + f.v[0] * f.t, f.p[1] + f.v[1] * f.t - GRAV * f.t * f.t / 2, f.p[2] + f.v[2] * f.t];
    const turn = (v, n, a) => {   // v turned by a about the unit axis n
      const cs = Math.cos(a), sn = Math.sin(a), d = (v[0] * n[0] + v[1] * n[1] + v[2] * n[2]) * (1 - cs);
      return [v[0] * cs + (n[1] * v[2] - n[2] * v[1]) * sn + n[0] * d, v[1] * cs + (n[2] * v[0] - n[0] * v[2]) * sn + n[1] * d, v[2] * cs + (n[0] * v[1] - n[1] * v[0]) * sn + n[2] * d];
    };
    const fallFrame = f => {
      const q = smoothstep(f.t / FALL.peel), tip = (FALL.tip + FALL.rock * Math.sin(f.t * 3.1)) * q, roll = f.spin * f.t, ct = Math.cos(tip), st = Math.sin(tip);
      const up = f.up.map((u, i) => u * ct + f.out[i] * st), out = f.out.map((o, i) => o * ct - f.up[i] * st);
      return { at: fallAt(f), up: turn(up, f.view, roll), out: turn(out, f.view, roll), across: turn(f.across, f.view, roll), from: f, k: q };
    };
    const wallFrame = c => (s.fall ? fallFrame(s.fall) : stoneFrame(c));
    const wallAt = c => { const p = wallFrame(c).at; return { x: p[0], y: p[1] - H2, z: p[2] }; };
    // its bearing from the tower's axis (the beam's own reckoning), in the world
    const azOf = c => { const th = (c.wallTh === undefined ? FACE[c.lane.idx] : c.wallTh) * DEG, v = rotY(Math.cos(th), Math.sin(th), L.facing); return Math.atan2(v[0], v[1]); };
    // seen or not is judged where it is drawn, with the view unzoomed
    L.visFrac = c => {
      const p = c.pos(), r = R.projectRect(p.x, p.y + (c.yOff || 0), p.z, c.CR.w, c.CR.h, { yaw: G.cam.yaw, pitch: G.cam.pitch, zoom: 1, W: R.W, H: R.H, eyeH: L.eyeH });
      if (!r) return 0;
      const w = Math.min(r.x + r.w, R.W) - Math.max(r.x, 0), h = Math.min(r.y + r.h, R.H) - Math.max(r.y, 0);
      return w > 0 && h > 0 ? w * h / Math.max(1e-6, r.w * r.h) : 0;
    };
    // going round to another face (the Nightmare change of way, which only happens while you are not looking at it): it
    // runs across the stone sideways, round the tower, to the face it has chosen, climbing all the while
    L.onLaneSwitch = c => { s.scut = { from: c.wallTh, to: FACE[c.lane.idx] }; };
    const onLane = () => Math.abs(wrapPi(s.beamA - azOf(L.creature))) < 22.5 * DEG;
    L.isWon = () => s.power && s.turning;
    L.objectiveText = () => (s.power ? 'Lit. ' : (s.bulb ? '' : 'Put the new bulb in the lamp. ') + (s.fuse ? '' : s.blownIn ? 'Take the blown fuse out of the fuse box. ' : 'Put a new fuse in the fuse box. ')) + (s.turning ? 'Turning.' : 'Turn the crank (' + Math.min(need, Math.floor(winder.count || 0)) + '/' + need + ').');
    L.update = dt => {
      const c = L.creature;
      if (!c.wallAt) { c.wallTh = FACE[c.lane.idx]; c.wallAt = wallAt; c.wallFrame = wallFrame; }
      c.wallYOff = c.yOff || 0;
      if (s.scut) {   // across the stone at a run, 1.6 m a second round the tower at the height it is at
        const r = rad(L.eyeH + c.dist * Math.sin(c.lane.elev)), dir = Math.sign(s.scut.to - s.scut.from), step = dt * 1.6 / r / DEG;
        c.wallTh += dir * Math.min(step, Math.abs(s.scut.to - c.wallTh));
        c.scuttle = dir;
        if (Math.abs(s.scut.to - c.wallTh) < 1e-6) { c.wallTh = s.scut.to; c.scuttle = 0; s.scut = null; }
      }
      if (s.turning) s.beamA += dt * TAU / 12 * s.beamSpeed;
      // the lamp goes round with the crank: a little at each turn of it, and all the time once it is going, lit or dark
      s.lensKick = (s.lensKick || 0) + ((winder.count || 0) * 0.16 - (s.lensKick || 0)) * Math.min(1, dt * 9);
      if (s.turning) s.lensSpin = (s.lensSpin || 0) + dt * TAU / 12 * s.beamSpeed;
      s.lensA = s.lensKick + (s.lensSpin || 0);
      if (s.open && !s.creaked && L.t >= s.openAt) { s.creaked = true; AUDIO.sfx('creak'); }   // the door swings as the hand pulls it
      // and the hand on its handle goes round with it
      if (s.opening && G.hand.reach === s.opening && L.t >= s.openAt) s.opening.at = HANDS.pointOn(box, [-0.5 + 0.81 * Math.cos(smoothstep((L.t - s.openAt) / 0.38) * 1.96), 0.5], 0.02);
    };
    const lensW = L.pt(AX, 1.9, AZ);
    // the fuse box, as it stands: a grey cabinet with a yellow lightning-bolt label and a handle; open, its door swings
    // out to the left and inside is the fuse in its clips: blown (black, split), gone, or new
    // (the fuse in the clips shifts and settles when it is touched or knocked)
    const fuseAt = (ctx, P, icon) => {
      const e = L.t - (s.fuseJig === undefined ? -9 : s.fuseJig), j = e < 0.7 ? Math.sin(e * 38) * Math.exp(-e * 6) : 0;
      ctx.save(); ctx.translate(j * 0.03, 0.5 - 0.48 * 0.72 + Math.abs(j) * 0.01); ctx.rotate(j * 0.06); ctx.scale(0.62, 0.72); ICONS[icon](ctx, P); ctx.restore();
    };
    const drawFuseBox = (ctx, P) => {
      ctx.scale(FBW, FBH);
      const rim = P.col([92, 96, 102]), metal = P.col([150, 154, 160]), dark = P.col([14, 14, 18]), ink = P.col([22, 20, 18]);
      P_rect(ctx, -0.5, 0, 1, 1, rim);
      const doorFace = () => {
        P_rect(ctx, -0.45, 0.04, 0.9, 0.92, metal);                                      // the door
        P_rect(ctx, -0.45, 0.04, 0.9, 0.025, rim); P_rect(ctx, 0.425, 0.04, 0.025, 0.92, rim);
        for (const v of [0.16, 0.76]) P_rect(ctx, -0.52, v, 0.07, 0.1, P.col([70, 72, 78]));   // hinges, on the left
        P_rect(ctx, 0.26, 0.34, 0.1, 0.32, P.col([60, 62, 68])); P_rect(ctx, 0.285, 0.37, 0.05, 0.26, P.col([196, 198, 204]));   // the handle
        P_poly(ctx, [[-0.3, 0.42], [0.18, 0.42], [-0.06, 0.88]], ink);                   // the warning label: yellow, a black bolt
        P_poly(ctx, [[-0.25, 0.45], [0.13, 0.45], [-0.06, 0.82]], P.col([236, 196, 36]));
        P_poly(ctx, [[-0.02, 0.76], [-0.13, 0.6], [-0.05, 0.6], [-0.11, 0.48], [0.03, 0.65], [-0.05, 0.65]], ink);
        for (let k = 0; k < 3; k++) P_rect(ctx, -0.3, 0.12 + k * 0.06, 0.4, 0.025, P.col([96, 100, 106]));   // vents
      };
      // the door swings open on its hinges, on the left, as the hand pulls it: its face narrowing toward the hinges, then its
      // inside coming round to lie open beside the box
      const k = s.open ? smoothstep((L.t - s.openAt) / 0.38) : 0, cs = Math.cos(k * 1.96);
      if (k <= 0) { doorFace(); return; }
      P_rect(ctx, -0.45, 0.04, 0.9, 0.92, dark);                                         // the inside of the cabinet
      P_rect(ctx, -0.36, 0.2, 0.72, 0.6, P.col([196, 190, 176]));                         // the porcelain block
      P_line(ctx, -0.28, 0.5, -0.28, 0.96, 0.04, P.col([40, 36, 34])); P_line(ctx, 0.28, 0.5, 0.28, 0.04, 0.04, P.col([40, 36, 34]));   // the wires in and out
      P_ell(ctx, -0.02, 0.5, 0.2, 0.13, P.cola([60, 46, 36], 0.75));                     // scorched where the old one burned
      P_rect(ctx, -0.25, 0.385, 0.5, 0.23, P.col([62, 58, 54]));                          // the dark channel the fuse lies in
      for (const x of [-0.3, 0.22]) { P_rect(ctx, x, 0.38, 0.08, 0.24, P.col([170, 140, 70])); P_rect(ctx, x + 0.02, 0.36, 0.04, 0.28, P.col([120, 98, 50])); }   // the clips
      if (s.fuse) fuseAt(ctx, P, 'fuse');
      else if (s.blownIn) fuseAt(ctx, P, 'blownfuse');
      else for (const x of [-0.17, 0.17]) P_line(ctx, x, 0.5, x * 0.6, 0.5, 0.02, P.col([90, 90, 96]));   // empty: two stubs of burned wire left in the clips
      if (s.power) P_ell(ctx, 0.3, 0.88, 0.04, 0.03, P.raw([255, 210, 120]));
      if (cs > 0) { ctx.save(); ctx.translate(-0.5, 0); ctx.scale(cs, 1); ctx.translate(0.5, 0); doorFace(); ctx.restore(); return; }   // still swinging: its face, end on
      const xe = -0.5 + 0.95 * cs, ins = 0.08 * Math.min(1, -cs / 0.38);
      P_poly(ctx, [[-0.5, 0.0], [xe, ins], [xe, 1 - ins], [-0.5, 1.0]], P.col([108, 110, 116]));   // the door, swung open: its inside
      P_line(ctx, xe, ins, xe, 1 - ins, 0.02, rim);
    };
    // the lamp: a lighthouse lens on its pedestal, a barrel of glass rings in a bronze frame, and in the middle of it the bulb:
    // the old one, smoked and burned black; the new one, pale and dark; or a burning core with the whole lens alight
    const barrel = [[-0.3, 0.07], [-0.38, 0.2], [-0.42, 0.48], [-0.38, 0.76], [-0.3, 0.89], [0.3, 0.89], [0.38, 0.76], [0.42, 0.48], [0.38, 0.2], [0.3, 0.07]];
    const halfAt = y => 0.3 + 0.12 * Math.sin(clamp((y - 0.07) / 0.82, 0, 1) * Math.PI);   // the barrel's half-width at a height
    const oldBulb = (ctx, P) => {
      const smoke = P.col([112, 104, 90]), soot = P.col([22, 18, 16]), brass = P.col([110, 94, 52]);
      P_ell(ctx, 0, 0.62, 0.26, 0.3, smoke); P_poly(ctx, [[-0.16, 0.4], [0.16, 0.4], [0.12, 0.2], [-0.12, 0.2]], smoke);
      P_ell(ctx, 0.02, 0.74, 0.17, 0.14, soot);                                                      // burned black inside the top
      P_rect(ctx, -0.12, 0.05, 0.24, 0.16, brass);
      P_line(ctx, -0.06, 0.45, -0.03, 0.56, 0.015, P.col([150, 140, 120])); P_line(ctx, 0.06, 0.45, 0.04, 0.54, 0.015, P.col([150, 140, 120]));   // the filament, snapped
    };
    const drawLens = (ctx, P) => {
      ctx.scale(LW, LH);
      const on = s.power, bronze = P.col([116, 94, 52]), bronzeD = P.col([72, 58, 34]);
      P_poly(ctx, barrel, on ? P.raw([255, 236, 190]) : P.col([62, 74, 82]));
      for (const y of [0.13, 0.19, 0.25, 0.31, 0.65, 0.71, 0.77, 0.83]) { const hw = halfAt(y) - 0.03; P_line(ctx, -hw, y, hw, y, 0.014, on ? P.raw([255, 250, 236]) : P.col([110, 124, 132])); }   // the prism rings
      P_rect(ctx, -0.41, 0.37, 0.82, 0.24, on ? P.raw([255, 244, 214]) : P.col([74, 88, 96]));     // the drum round the bulb
      P_rect(ctx, -0.36, 0, 0.72, 0.07, bronze); P_rect(ctx, -0.36, 0.055, 0.72, 0.015, bronzeD);    // the frame: its foot,
      P_poly(ctx, [[-0.32, 0.89], [0.32, 0.89], [0.2, 0.97], [-0.2, 0.97]], bronze); P_rect(ctx, -0.05, 0.97, 0.1, 0.03, bronzeD);   // its cap,
      // and its ribs, four round the barrel: at rest the two on this side stand clear of the bulb either side of it; as the
      // crank turns the lamp they go round with it, across in front of the bulb and away round the back (lit or dark)
      const ribs = [0, 1, 2, 3].map(k => s.lensA + Math.PI / 4 + k * Math.PI / 2).filter(a => Math.cos(a) > 0.02).map(a => Math.sin(a) * 0.354);
      P_line(ctx, -0.42, 0.37, 0.42, 0.37, 0.012, bronzeD); P_line(ctx, -0.42, 0.61, 0.42, 0.61, 0.012, bronzeD);
      // the bulb, kept round inside the tall box: its own box is as wide as it is high in metres. Touched, it rattles in its
      // socket; the new one is twisted down into it as it goes in
      const je = L.t - (s.jig === undefined ? -9 : s.jig), jig = je < 0.8 ? Math.sin(je * 34) * Math.exp(-je * 5.5) * 0.16 : 0;
      const se = s.bulb && s.bulbAt !== undefined ? clamp((L.t - s.bulbAt) / 0.5, 0, 1) : 1, seat = 1 - easeOut(se);
      ctx.save(); ctx.translate(0, 0.33 + seat * 0.05); ctx.scale(0.3 * LH / LW, 0.3);
      ctx.translate(0, 0.13); ctx.rotate(jig + seat * 0.5 * Math.sin(se * 18)); ctx.translate(0, -0.13);
      if (!s.bulb) oldBulb(ctx, P); else ICONS.bulb(ctx, P);
      ctx.restore();
      ctx.save(); ctx.beginPath(); barrel.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();   // (kept inside the barrel)
      for (const x of ribs) P_line(ctx, x, 0.075, x, 0.885, 0.018, bronzeD);
      ctx.restore();
      if (on) { const g = ctx.createRadialGradient(0, 0.5, 0.02, 0, 0.5, 0.5); g.addColorStop(0, 'rgba(255,252,232,1)'); g.addColorStop(0.35, 'rgba(255,234,180,0.7)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); }
    };
    // the crank: a spoked wheel on a gearbox bolted to its stanchion, the wooden grip on its rim; all of it inside its own box,
    // however it turns, so the outline you point at holds it
    const drawCrank = (ctx, P) => {
      ctx.scale(WDS, WDS);
      const box = P.col([62, 64, 70]), boxD = P.col([36, 38, 42]), steel = P.col([132, 134, 142]), brass = P.col([168, 138, 72]), wood = P.col([128, 88, 50]), woodD = P.col([86, 58, 34]);
      P_rect(ctx, -0.22, 0.22, 0.44, 0.56, box); P_rect(ctx, -0.22, 0.22, 0.44, 0.04, boxD); P_rect(ctx, -0.22, 0.74, 0.44, 0.04, boxD);   // the gearbox
      for (const [x, y] of [[-0.16, 0.3], [0.16, 0.3], [-0.16, 0.7], [0.16, 0.7]]) P_ell(ctx, x, y, 0.022, 0.022, boxD);           // its bolts
      ctx.translate(0, 0.5); ctx.rotate((winder.count || 0) * 1.1 + (s.turning ? L.t * 0.8 : 0));
      ctx.strokeStyle = steel; ctx.lineWidth = 0.07; ctx.beginPath(); ctx.arc(0, 0, 0.31, 0, TAU); ctx.stroke();
      for (let k = 0; k < 4; k++) P_line(ctx, 0, 0, Math.cos(k * Math.PI / 2 + Math.PI / 4) * 0.31, Math.sin(k * Math.PI / 2 + Math.PI / 4) * 0.31, 0.05, steel);
      P_ell(ctx, 0, 0, 0.075, 0.075, brass); P_ell(ctx, 0, 0, 0.03, 0.03, boxD);                    // the hub
      P_line(ctx, 0.31, 0, 0.44, 0, 0.11, wood); P_ell(ctx, 0.44, 0, 0.055, 0.055, woodD);           // the grip, out on the rim
    };
    L.dynamic = () => {
      R.add(SC.mkSprite(L, AX, 0.9, AZ, LW, LH, drawLens));
      // the beam itself, a long faint wedge, drawn over everything
      if (s.power && s.turning) {
        const A = s.beamA, reach = 55, drop = 30;
        for (const [sp, al] of [[0.22, 0.08], [0.09, 0.11]]) {
          R.add({ kind: 'poly', pts: [lensW, [lensW[0] + Math.sin(A - sp) * reach, lensW[1] - drop, lensW[2] + Math.cos(A - sp) * reach], [lensW[0] + Math.sin(A + sp) * reach, lensW[1] - drop, lensW[2] + Math.cos(A + sp) * reach]], color: [255, 242, 205], alpha: al, noFog: true, noLight: true, dist: 0.3 });
        }
      }
      // where it went in, far below: a burst of white on the dark water, spray thrown up and out and falling back, and a
      // ring of foam spreading from it. All of it is drawn after the sea and the rocks and before the tower, so the foot of
      // the tower hides whatever of it lies behind the stone.
      if (s.splash) {
        const k = s.splash.t, x = s.splash.at[0], z = s.splash.at[2], o = { dist: Math.hypot(x, z, WATER - L.eyeH), sortDist: 60, noLight: true };
        const rim = (th, r) => { const w = r * (1 + 0.07 * Math.sin(th * 3 + 1.3) + 0.05 * Math.sin(th * 7 + 0.4) + 0.03 * Math.sin(th * 11)); return [x + Math.cos(th) * w, WATER + 0.04, z + Math.sin(th) * w]; };
        const ring = 0.8 + 2 * easeOut(Math.min(1, k / 1.6)), ringA = 0.55 * (1 - smoothstep((k - 0.4) / 1.6)), burst = 0.4 + 1.1 * easeOut(Math.min(1, k / 0.35)), burstA = 0.9 * (1 - smoothstep(k / 1.1));
        if (ringA > 0.01) for (let i = 0; i < 28; i++) { const a0 = i / 28 * TAU, a1 = (i + 1) / 28 * TAU; R.add(Object.assign({ kind: 'poly', pts: [rim(a0, ring - 0.45), rim(a1, ring - 0.45), rim(a1, ring), rim(a0, ring)], color: [196, 206, 212], alpha: ringA }, o)); }   // the foam, spreading
        if (burstA > 0.01) { const pts = []; for (let i = 0; i < 20; i++) pts.push(rim(i / 20 * TAU, burst)); R.add(Object.assign({ kind: 'poly', pts, color: [238, 242, 244], alpha: burstA }, o)); }   // the white where it went in
        for (let i = 0; i < 24; i++) {   // the spray: most of it thrown up and out, a few jets straight up, all of it falling back
          const jet = i >= 18, th = i / 18 * TAU + Math.sin(i * 7.3) * 0.3, h = jet ? 0.3 : 1.6 + 1.2 * (0.5 + 0.5 * Math.sin(i * 3.7)), v = jet ? 9 + 2 * Math.sin(i * 2.9) : 5 + 4 * (0.5 + 0.5 * Math.sin(i * 5.1));
          const pt = tt => { const q = Math.max(0, tt); return [x + Math.cos(th) * h * q, WATER + v * q - GRAV * q * q / 2, z + Math.sin(th) * h * q]; }, p1 = pt(k);
          if (p1[1] < WATER) continue;
          R.add(Object.assign({ kind: 'poly', pts: [pt(k - 0.07), p1], color: [228, 234, 238], alpha: 0.8, stroke: true, lw: jet ? 0.2 : 0.14 }, o));
        }
      }
      // the fuse box and the crank, showing their state
      R.add(SC.mkSprite(L, fb[0], fb[1], fb[2], FBW, FBH, drawFuseBox, { sortDist: mounted(fb[0], fb[2]) }));
      R.add(SC.mkSprite(L, wd[0], wd[1], wd[2], WDS, WDS, drawCrank, { sortDist: mounted(wd[0], wd[2]) }));
    };
    L.dynamicLights = () => {
      if (!s.power) return [];
      const out = [{ x: lensW[0], y: lensW[1], z: lensW[2], r: 5.5, i: 0.9, color: [255, 232, 176], flicker: 0.08, seed: 1 }];
      if (s.turning) { const A = s.beamA; out.push({ x: lensW[0], y: lensW[1], z: lensW[2], r: 60, i: 1.6, color: [255, 245, 210], cone: { x: Math.sin(A) * 0.99, y: -0.12, z: Math.cos(A) * 0.99, cos: Math.cos(24 * DEG) } }); }   // out over the sea: the gallery floor keeps it off the wall below
      return out;
    };
    L.glows = () => s.power ? [{ x: lensW[0], y: lensW[1], z: lensW[2], r: 2.6 + Math.sin(L.t * 7) * 0.1, color: [255, 225, 160], a: 0.3 }] : null;
    // aftermath: the light goes round fast, a turn every three seconds, starting from the far side of the tower. If the
    // thing is a long way down it scrambles up the wall at you, to where you see it plainly, as the beam comes round onto
    // it; the light knocks its hands off the stone and it slides, clawing, down the wet wall until its hooks catch. It
    // clings there, its face still turned up at you, and starts up again. The next pass breaks its hold for good: it slides
    // on, scrabbling at the stone and catching at nothing (slip), peels away from the wall and falls, turning over and over,
    // all the way down into the sea at the foot of the tower, a burst of white where it goes in; then the night fades. Once
    // the light is going it comes no nearer than `closest` (if it was nearer than that, it holds where it is).
    const AFTER = { near: 5.5, rush: 1.25, climb: 0.3, closest: 2.5, cling: 0.7, knock: 3, slip: 0.55, slipV: 4, push: 5.2, spin: 1.3, settle: 1.0 };
    // the view follows it down over the rail, further down than you can look yourself, so the wall it is on fills the view,
    // and on down as it falls; once it is in the water the view stays on the white where it went in
    L.watchPitch = 70 * DEG;
    L.watchPoint = () => { const p = s.splash ? s.splash.at : wallFrame(L.creature).at; return { x: p[0], y: p[1], z: p[2] }; };
    L.aftermath = (t, dt) => {
      const c = L.creature;
      if (!s.after) {
        const a = s.after = { mode: c.dist > AFTER.near + 0.3 ? 'rush' : 'climb', cling: 0, hits: 0 };
        const rate = Math.max(2.5, (c.dist - AFTER.near) / AFTER.rush);
        s.beamSpeed = 4; s.crossing = onLane();
        c.frozen = true; c.slideTo = null; c.slideV = 0;   // (slideTo is only set while it slides: the climber claws as it goes)
        c.distFn = (cr, dt2) => {
          if (a.mode === 'rush') { const d = Math.max(AFTER.near, cr.dist - dt2 * rate); if (d <= AFTER.near) a.mode = 'climb'; return d; }
          if (a.mode === 'climb') return Math.max(Math.min(cr.dist, AFTER.closest), cr.dist - dt2 * AFTER.climb);
          if (a.mode === 'slide' || a.mode === 'slip') {   // faster and faster down the wet stone, until the hooks catch with a jolt (the last time, they do not)
            cr.slideV = Math.min(a.mode === 'slip' ? AFTER.slipV : 7, cr.slideV + dt2 * 16);
            const d = Math.min(cr.slideTo, cr.dist + cr.slideV * dt2);
            if (d >= cr.slideTo - 1e-4) { a.mode = 'cling'; a.cling = AFTER.cling; cr.slideTo = null; G.shake(0.1); }
            return d;
          }
          if (s.fall) {   // in the air, and then in the water: as far off as it really is, with no hooks on stone as it goes
            if (a.mode === 'fall') s.fall.t += dt2;
            const p = fallAt(s.fall), d = Math.hypot(p[0], p[1] - L.eyeH, p[2]);
            cr.gait -= Math.abs(d - cr.dist) * cr.CR.stepRate * Math.PI;
            return d;
          }
          return cr.dist;   // clinging
        };
      }
      const a = s.after;
      c.climbRate = a.mode === 'rush' ? 9 : a.mode === 'climb' ? 2.6 : 0;   // the climbing cycle, fast as it rushes up
      if (a.mode === 'cling' && (a.cling -= dt) <= 0) a.mode = 'climb';
      if (a.mode === 'slip') {
        c.scrabble = Math.min(1, (c.scrabble || 0) + dt * 5);
        if ((a.slip -= dt) <= 0) {   // it lets go: off the stone at the pace it was sliding, thrown out from the wall
          const fr = stoneFrame(c), p = fr.at, n = Math.hypot(p[0], p[1] - L.eyeH, p[2]);
          s.fall = { t: 0, p, v: fr.up.map((u, i) => fr.out[i] * AFTER.push - u * c.slideV), up: fr.up, out: fr.out, across: fr.across, view: [p[0] / n, (p[1] - L.eyeH) / n, p[2] / n], spin: AFTER.spin * (c.wallTh > 90 ? 1 : -1) };
          a.mode = 'fall';
        }
      }
      if (a.mode === 'fall') {
        c.falling = Math.min(1, (c.falling || 0) + dt * 3);
        const p = fallAt(s.fall);
        if (p[1] <= WATER + 0.2) {   // into the sea at the foot of the tower: a burst of white, far below, and it is gone
          s.splash = { t: 0, at: [p[0], WATER, p[2]] }; a.mode = 'down'; c.gone = true;
          AUDIO.sfx('plunge', Math.sin(wrapPi(Math.atan2(p[0], p[2]) - G.cam.yaw)) * 0.85); G.shake(0.12);
        }
      }
      if (s.splash) s.splash.t += dt;
      const on = onLane();
      if (on && !s.crossing && a.hits < 2) {
        const last = a.hits === 1;   // the second pass is the last it takes
        a.mode = last ? 'slip' : 'slide'; c.slideV = 0.6; c.slideTo = last ? Infinity : c.dist + AFTER.knock; a.slip = AFTER.slip; a.hits++; c.struck = 1;   // white in the beam
        AUDIO.sfx('scrape', Math.sin(wrapPi(azOf(c) - G.cam.yaw)) * 0.85); G.shake(0.2);
      }
      s.crossing = on;
      return !!s.splash && s.splash.t >= AFTER.settle;
    };
    // where a dropped thing lands: on the gallery floor inside the rail (no more than 3 m from the axis), clear of the lamp
    // room's wall and of the crate, at every facing
    L.floor = { poly: [[-1.6, -0.75], [0.33, -0.75], [0.33, -0.58], [0.8, -0.58], [0.8, -0.75], [1.6, -0.75], [1.5, -0.3], [0.75, -0.02], [-0.75, -0.02], [-1.5, -0.3]], y: 0 };   // (not on the crate)
  }
});
