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
    win: 'The beam went round and round. Every time it came past, the thing slid a little further down the wet stone. By morning it was in the water, still looking up.',
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
    SC.stars(L, 71, 50, 0.3);
    SC.clouds(L, 72, 8, [30, 34, 46], 0.55);
    // the sea, far below, in rings so the fog is right
    const seaR = [12, 17, 30, 60, 120, 320];
    for (let k = 0; k < seaR.length - 1; k++) for (let i = 0; i < 12; i++) {
      const a0 = i / 12 * TAU, a1 = (i + 1) / 12 * TAU, r0 = seaR[k], r1 = seaR[k + 1], rm = (r0 + r1) / 2;
      SC.quad(L, at(a0, r0, -24.6), at(a1, r0, -24.6), at(a1, r1, -24.6), at(a0, r1, -24.6), k === 0 ? [30, 38, 48] : [18, 26, 36], { dist: Math.hypot(rm, 26.2), layer: 0 });
    }
    const rng = mulberry32(77);
    for (let i = 0; i < 26; i++) {
      const th = rng() * TAU, r = 15.5 + rng() * 12, size = 1.2 + rng() * 2.2, p = at(th, r, -24.6);
      const pts = []; for (let k = 0; k < 7; k++) { const a = Math.PI * (k / 6); pts.push([Math.cos(a) * 0.5 * (0.8 + rng() * 0.3), Math.sin(a) * (0.4 + rng() * 0.6)]); }
      const v = rng() * 20, col = [38 + v, 42 + v, 46 + v];
      SC.sprite(L, p[0], -24.6, p[2], size * 1.3, size, (ctx, P) => { ctx.scale(size * 1.3, size); P_poly(ctx, pts, P.col(col)); }, { dist: Math.hypot(p[0], p[2], 26.3) });
      SC.quad(L, at(th - 0.06, r + 1, -24.55), at(th + 0.06, r + 1, -24.55), at(th + 0.05, r + 2.5, -24.55), at(th - 0.05, r + 2.5, -24.55), [120, 130, 140], { dist: Math.hypot(p[0], p[2], 26.25), alpha: 0.25 });
    }
    // a town across the water: a scatter of lights low on the horizon
    for (let i = 0; i < 16; i++) { const th = (150 + rng() * 60) * DEG, d = 180 + rng() * 60, p = at(th, d, -22 + rng() * 2), w = 0.8 + rng() * 1.2; SC.sprite(L, p[0], p[1], p[2], w, w * 0.7, (ctx, P) => { ctx.scale(w, w * 0.7); P_rect(ctx, -0.5, 0, 1, 1, P.raw([230, 200, 140])); }, { noFog: true, noLight: true, dist: d }); }
    // the tower wall below the gallery, in bands sorted by their true distance from the eye so the climber draws over them
    const edges = [0, -0.7, -1.8, -3.5, -6, -9, -13, -18, -24.6];
    for (let b = 0; b < edges.length - 1; b++) {
      const y0 = edges[b], y1 = edges[b + 1], r0 = rad(y0), r1 = rad(y1), ym = (y0 + y1) / 2, rm = rad(ym), shade = 148 - b * 9;
      for (let i = 0; i < N; i++) {
        const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, am = (a0 + a1) / 2;
        const cx = AX + Math.cos(am) * rm, cz = AZ + Math.sin(am) * rm;
        const opts = { dist: Math.hypot(cx, cz, 1.65 - ym) + 0.7 };
        if (b < 5) { opts.tex = 'stone'; opts.texScale = 2.2; }
        SC.quad(L, at(a0, r0, y0), at(a1, r0, y0), at(a1, r1, y1), at(a0, r1, y1), [shade, shade - 2, shade - 6], opts);
      }
    }
    // the gallery floor, the rail, the lamp room and its roof
    for (let i = 0; i < N; i++) {
      const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, am = (a0 + a1) / 2;
      // the floor sorts by its true distance from the eye, like the tower below it, so it covers the tower where it overhangs
      const fc = at(am, 2.62, 0);
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), at(a1, 3.25, 0), at(a0, 3.25, 0), [58, 60, 64], { tex: 'tin', texScale: 1.6, dist: Math.hypot(fc[0], fc[2], 1.65) });
      // the lamp room's own floor, seen through its glass: drawn over the far side of the tower, under all that stands on it
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), [AX, 0, AZ], [AX, 0, AZ], [46, 48, 52], { sortDist: 3.6 });
      SC.quad(L, at(a0, 3.25, 0), at(a1, 3.25, 0), at(a1, 3.25, -0.12), at(a0, 3.25, -0.12), ironL);
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), at(a1, 2.0, 0.85), at(a0, 2.0, 0.85), iron);
      SC.quad(L, at(a0, 2.0, 0.85), at(a1, 2.0, 0.85), at(a1, 2.0, 2.75), at(a0, 2.0, 2.75), [140, 165, 195], { alpha: 0.2 });
      SC.quad(L, at(a0 - 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 2.75), at(a0 - 0.012, 2.02, 2.75), [34, 36, 40]);
      SC.quad(L, at(a0, 2.15, 2.72), at(a1, 2.15, 2.72), at(a1, 2.15, 2.9), at(a0, 2.15, 2.9), iron);
      SC.quad(L, at(a0, 2.15, 2.9), at(a1, 2.15, 2.9), at(am, 0.05, 4.4), at(am, 0.05, 4.4), [30, 32, 36]);
      for (const yy of [0.5, 1.02]) SC.quad(L, at(a0, 3.25, yy), at(a1, 3.25, yy), at(a1, 3.25, yy + 0.05), at(a0, 3.25, yy + 0.05), ironL);
      // rail posts only at every third segment, and none near the three faces it climbs, so none stands between you and it
      const p = at(a0, 3.25, 0), az = Math.atan2(p[0], p[2]);
      if (i % 3 === 0 && [0, 45, -45].every(l => Math.abs(wrapPi(az - l * DEG)) > 22 * DEG)) SC.sprite(L, p[0], 0, p[2], 0.06, 1.07, (ctx, P) => { ctx.scale(0.06, 1.07); P_rect(ctx, -0.5, 0, 1, 1, P.col(ironL)); });
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
    // the lens on its pedestal, inside the glass
    SC.box(L, AX - 0.45, AX + 0.45, 0, 0.9, AZ - 0.45, AZ + 0.45, [50, 50, 56]);
    { const lp = at(100 * DEG, 2.5, 0); STORY.lamp(L, lp[0], 0, lp[2], { scale: 0.8 }); }
    // items: on the gallery floor where you can see them, none of them round behind a stanchion or under the crank
    const floorAt = (deg, r) => { const p = at(deg * DEG, r, 0); return { x: p[0], y: 0, z: p[2] }; };
    const spots = [floorAt(60, 2.7), floorAt(120, 2.7), floorAt(45, 2.9), floorAt(135, 2.9), floorAt(75, 3.0), floorAt(108, 3.0)];
    // the lamp's bulb has blown and so has the fuse: a spare bulb lies about, the new fuse is in the toolbox, and a
    // blown one that looks like it might do lies about as well
    Object.assign(s, { open: false, blownIn: true, bulb: false, fuse: false, power: false, turning: false, beamA: 0, beamSpeed: 1, crossing: false });
    mkItem(L, 'bulb', 'Bulb', spots, { w: 0.2, h: 0.3, flat: false });
    mkContainer(L, {
      id: 'toolbox', name: 'Toolbox', w: 0.56, h: 0.38, color: [172, 36, 30], spot: spots.slice(0, 4), sfx: 'clunk', liftY: 0.13,
      closedText: 'A toolbox.', emptyText: 'Rags and a tin of grease.',
      yields: [{ id: 'fuse', name: 'Fuse', opts: { w: 0.34, h: 0.34, flat: false } }],
      onOpen() { G.say('A new fuse, in among the rags.', 'Rags, a tin of grease. A fuse.'); },
    });
    mkItem(L, 'oldfuse', 'Fuse', spots, { w: 0.3, h: 0.3, flat: false, icon: 'fuse', decoy: true, decoyText: 'This one is blown as well.' });
    const lit = () => G.say(s.turning ? 'The lamp comes on.' : 'The lamp comes on. Now turn the crank.', s.turning ? 'Light.' : 'Light. It does not go round.');
    const powerUp = () => { if (!(s.bulb && s.fuse) || s.power) return false; s.power = true; lamp.done = true; setTimeout(() => AUDIO.sfx('lampOn'), 250); return true; };
    // the lamp: the bulb goes in here
    const lamp = mkTarget(L, {
      id: 'lamp', name: 'Lamp', x: AX, y: 0.9, z: AZ, w: 1.1, h: 1.5, accepts: ['bulb'],
      hint() { return s.power ? 'Lit.' : s.bulb ? 'A new bulb in it, and no light: no power. The fuse box.' : 'The big lamp. Its bulb has blown.'; },
      onClick() {
        if (s.power) { G.say('Lit.', 'Lit.'); return true; }
        if (s.bulb) { G.say('The bulb is in, but there is no power. Try the fuse box.', 'The new bulb is in. Still dark.'); return true; }
        if (!G.hasItem('bulb')) { G.say('The big lamp. Its bulb has blown.', 'The lamp is dark. Its bulb has blown.'); AUDIO.sfx('nope'); return true; }
        return false;
      },
      use(item) {
        if (item.id !== 'bulb' || s.bulb) return false;
        s.bulb = true; lamp.accepts = []; AUDIO.sfx('fit');
        if (powerUp()) lit();
        else G.say('The bulb is in. Nothing: there is no power. Try the fuse box.', 'The bulb is in. Still dark.');
        return true;
      },
    });
    // the fuse box: open its door, pull out the blown fuse, put the new one in
    const box = mkTarget(L, {
      id: 'fusebox', name: 'Fuse box', x: fb[0], y: fb[1], z: fb[2], w: FBW, h: FBH, accepts: [],
      hint() { return s.fuse ? 'A good fuse in it.' : !s.open ? 'The fuse box. Shut.' : s.blownIn ? 'Open. The fuse in it is blown. Take it out.' : 'Open. The fuse holder is empty.'; },
      onClick() {
        if (!s.open) { s.open = true; blown.hidden = false; AUDIO.sfx('creak'); G.say('Inside, the fuse is black and split. Blown.', 'The fuse inside is black and split.'); return true; }
        if (s.fuse) { G.say('A good fuse in it.', 'A new fuse in it.'); return true; }
        if (s.blownIn) { G.say('Take the blown fuse out first.', 'The blown fuse is still in it.'); AUDIO.sfx('nope'); return true; }
        if (!G.inv.some(i => box.accepts.includes(i.id))) { G.say(G.hasItem('blownfuse') ? 'That is the one that blew.' : 'The holder is empty. There is a new fuse in the toolbox.', G.hasItem('blownfuse') ? 'That is the one that blew.' : 'The fuse holder is empty.'); AUDIO.sfx('nope'); return true; }
        return false;
      },
      use(item) {
        if (item.id !== 'fuse') return false;
        s.fuse = true; box.accepts = []; box.done = true; AUDIO.sfx('fit');
        if (powerUp()) lit(); else G.say('The new fuse is in. Now the bulb.', 'The new fuse is in. Still dark.');
        return true;
      },
    });
    // the blown fuse in its clips: only there once the door is open; it comes out into your hand, and looks it
    const blown = mkTarget(L, {
      id: 'blownfuse', name: 'Blown fuse', x: fb[0], y: fb[1] + FBH * 0.39, z: fb[2], w: 0.26, h: FBH * 0.22, hidden: true,
      hint() { return 'Blown. Take it out.'; },
      onClick() {
        if (!s.blownIn) return true;
        s.blownIn = false; blown.hidden = true; blown.done = true; box.accepts = ['fuse', 'oldfuse'];
        const it = newItem(L, 'blownfuse', 'Blown fuse', { w: 0.3, h: 0.3, decoy: true, decoyText: 'That is the one that blew.' });
        G.inv.push(it); G.active = G.inv.length - 1; G.hover = null; AUDIO.sfx('pickup');
        G.say('It comes out in your hand, black and split. The holder is empty.', 'The blown fuse comes out. The holder is empty.');
        return true;
      },
    });
    const need = 8;
    const winder = mkTarget(L, {
      id: 'winder', name: 'Crank', x: wd[0], y: wd[1], z: wd[2], w: WDS, h: WDS,
      crank: { n: need, sfx: 'ratchet', onTurn() { G.shake(0.04); }, onComplete() { s.turning = true; s.beamA = L.creature.yaw + Math.PI; AUDIO.sfx('lever'); G.say(s.power ? 'The light begins to go round.' : 'The lamp goes round, dark.', s.power ? 'The light goes round.' : 'The lamp goes round, dark.'); } },
      hint() { return s.turning ? 'Turning.' : 'The crank that turns the lamp. Turn it. ' + Math.max(0, need - Math.floor(winder.count || 0)) + ' more.'; },
    });
    const onLane = () => Math.abs(wrapPi(s.beamA - L.creature.yaw)) < 22.5 * DEG;
    L.isWon = () => s.power && s.turning;
    L.objectiveText = () => (s.power ? 'Lit. ' : (s.bulb ? '' : 'Put the new bulb in the lamp. ') + (s.fuse ? '' : s.blownIn ? 'Take the blown fuse out of the fuse box. ' : 'Put a new fuse in the fuse box. ')) + (s.turning ? 'Turning.' : 'Turn the crank (' + Math.min(need, Math.floor(winder.count || 0)) + '/' + need + ').');
    L.update = dt => { if (s.turning) s.beamA += dt * TAU / 12 * s.beamSpeed; };
    const lensW = L.pt(AX, 1.9, AZ);
    // the fuse box, as it stands: a grey cabinet with a yellow lightning-bolt label and a handle; open, its door swings
    // out to the left and inside is the fuse in its clips: blown (black, split), gone, or new
    const fuseAt = (ctx, P, icon) => { ctx.save(); ctx.translate(0, 0.5 - 0.48 * 0.72); ctx.scale(0.62, 0.72); ICONS[icon](ctx, P); ctx.restore(); };
    const drawFuseBox = (ctx, P) => {
      ctx.scale(FBW, FBH);
      const rim = P.col([92, 96, 102]), metal = P.col([150, 154, 160]), dark = P.col([14, 14, 18]), ink = P.col([22, 20, 18]);
      P_rect(ctx, -0.5, 0, 1, 1, rim);
      if (!s.open) {
        P_rect(ctx, -0.45, 0.04, 0.9, 0.92, metal);                                      // the door
        P_rect(ctx, -0.45, 0.04, 0.9, 0.025, rim); P_rect(ctx, 0.425, 0.04, 0.025, 0.92, rim);
        for (const v of [0.16, 0.76]) P_rect(ctx, -0.52, v, 0.07, 0.1, P.col([70, 72, 78]));   // hinges, on the left
        P_rect(ctx, 0.26, 0.34, 0.1, 0.32, P.col([60, 62, 68])); P_rect(ctx, 0.285, 0.37, 0.05, 0.26, P.col([196, 198, 204]));   // the handle
        P_poly(ctx, [[-0.3, 0.42], [0.18, 0.42], [-0.06, 0.88]], ink);                   // the warning label: yellow, a black bolt
        P_poly(ctx, [[-0.25, 0.45], [0.13, 0.45], [-0.06, 0.82]], P.col([236, 196, 36]));
        P_poly(ctx, [[-0.02, 0.76], [-0.13, 0.6], [-0.05, 0.6], [-0.11, 0.48], [0.03, 0.65], [-0.05, 0.65]], ink);
        for (let k = 0; k < 3; k++) P_rect(ctx, -0.3, 0.12 + k * 0.06, 0.4, 0.025, P.col([96, 100, 106]));   // vents
        return;
      }
      P_poly(ctx, [[-0.5, 0.0], [-0.86, 0.08], [-0.86, 0.92], [-0.5, 1.0]], P.col([108, 110, 116]));   // the door, swung open: its inside
      P_line(ctx, -0.86, 0.08, -0.86, 0.92, 0.02, rim);
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
    };
    L.dynamic = () => {
      // the lens: dark glass, or a burning core
      R.add(SC.mkSprite(L, AX, 0.9, AZ, 1.1, 1.5, (ctx, P) => {
        ctx.scale(1.1, 1.5);
        P_ell(ctx, 0, 0.5, 0.42, 0.48, s.power ? P.cola([255, 236, 190], 0.55) : P.col([46, 52, 60]));
        for (let k = 0; k < 5; k++) P_line(ctx, -0.4 + k * 0.2, 0.05, -0.4 + k * 0.2, 0.95, 0.012, P.col([70, 72, 78]));
        if (s.bulb && !s.power) { ctx.save(); ctx.translate(0, 0.32); ctx.scale(0.22, 0.36); ICONS.bulb(ctx, P); ctx.restore(); } // the new bulb, dark
        if (s.power) { const g = ctx.createRadialGradient(0, 0.5, 0.02, 0, 0.5, 0.45); g.addColorStop(0, 'rgba(255,250,225,1)'); g.addColorStop(0.4, 'rgba(255,230,170,0.55)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); }
      }));
      // the beam itself, a long faint wedge, drawn over everything
      if (s.power && s.turning) {
        const A = s.beamA, far = 55, drop = 30;
        for (const [sp, al] of [[0.22, 0.08], [0.09, 0.11]]) {
          R.add({ kind: 'poly', pts: [lensW, [lensW[0] + Math.sin(A - sp) * far, lensW[1] - drop, lensW[2] + Math.cos(A - sp) * far], [lensW[0] + Math.sin(A + sp) * far, lensW[1] - drop, lensW[2] + Math.cos(A + sp) * far]], color: [255, 242, 205], alpha: al, noFog: true, noLight: true, dist: 0.3 });
        }
      }
      // the fuse box and the crank, showing their state
      R.add(SC.mkSprite(L, fb[0], fb[1], fb[2], FBW, FBH, drawFuseBox, { sortDist: mounted(fb[0], fb[2]) }));
      R.add(SC.mkSprite(L, wd[0], wd[1], wd[2], WDS, WDS, (ctx, P) => {
        ctx.scale(WDS, WDS); P_rect(ctx, -0.12, 0.38, 0.24, 0.24, P.col([60, 62, 68])); ctx.translate(0, 0.5); ctx.rotate((winder.count || 0) * 1.1 + (s.turning ? L.t * 0.8 : 0));
        ctx.strokeStyle = P.col([120, 122, 130]); ctx.lineWidth = 0.08; ctx.beginPath(); ctx.arc(0, 0, 0.4, 0, TAU); ctx.stroke();
        for (let k = 0; k < 4; k++) P_line(ctx, 0, 0, Math.cos(k * Math.PI / 2) * 0.4, Math.sin(k * Math.PI / 2) * 0.4, 0.06, P.col([120, 122, 130]));
        P_line(ctx, 0.4, 0, 0.62, 0, 0.12, P.col([110, 80, 50]));
      }, { sortDist: mounted(wd[0], wd[2]) }));
    };
    L.dynamicLights = () => {
      if (!s.power) return [];
      const out = [{ x: lensW[0], y: lensW[1], z: lensW[2], r: 5.5, i: 0.9, color: [255, 232, 176], flicker: 0.08, seed: 1 }];
      if (s.turning) { const A = s.beamA; out.push({ x: lensW[0], y: lensW[1], z: lensW[2], r: 60, i: 1.6, color: [255, 245, 210], cone: { x: Math.sin(A) * 0.714, y: -0.7, z: Math.cos(A) * 0.714, cos: Math.cos(36 * DEG) } }); }
      return out;
    };
    L.glows = () => s.power ? [{ x: lensW[0], y: lensW[1], z: lensW[2], r: 2.6 + Math.sin(L.t * 7) * 0.1, color: [255, 225, 160], a: 0.3 }] : null;
    // aftermath: the beam goes round faster and every pass slides it further down the wall
    L.aftermath = (t, dt) => {
      const c = L.creature;
      if (!c.distFn) { c.frozen = true; c.slideTo = c.dist; c.distFn = (cr, dt2) => cr.dist + (cr.slideTo - cr.dist) * Math.min(1, dt2 * 5); s.beamSpeed = 3; s.crossing = false; }
      const on = onLane();
      if (on && !s.crossing) { s.crossing = true; c.slideTo += 1.8; AUDIO.sfx('scrape', Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); G.shake(0.2); }
      if (!on) s.crossing = false;
      return t >= 8.5;
    };
    L.floor = { poly: [[-1.4, -0.9], [1.4, -0.9], [1.4, 0.0], [-1.4, 0.0]], y: 0 }; // inside the rail at every facing
  }
});
