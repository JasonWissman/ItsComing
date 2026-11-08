'use strict';
// ============================================================ 6. THE BOATHOUSE ============================================================
Object.assign(ICONS, {
  // the winch key: a small brass key on a ring with a bright orange float, as boat keys are, so it does not sink
  // (shifted left as a whole, so key and float together sit in the middle of the inventory slot and of the card)
  winchKey(ctx, P) {
    const brass = P.col([196, 168, 92]), brassD = P.col([120, 98, 48]), ring = P.col([170, 170, 176]);
    const foam = P.col([236, 112, 36]), foamD = P.col([170, 70, 24]), band = P.col([236, 230, 214]);
    ctx.save(); ctx.translate(-0.17, 0);
    ctx.strokeStyle = ring; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.ellipse(-0.06, 0.6, 0.1, 0.1, 0, 0, TAU); ctx.stroke();
    // the float, hanging off the ring to the right
    ctx.save(); ctx.translate(0.2, 0.6); ctx.rotate(-0.5);
    P_rect(ctx, -0.07, -0.13, 0.42, 0.26, foam); P_ell(ctx, 0.35, 0, 0.07, 0.13, foam); P_ell(ctx, -0.07, 0, 0.07, 0.13, foam);
    P_rect(ctx, 0.1, -0.13, 0.08, 0.26, band); P_rect(ctx, -0.07, -0.13, 0.42, 0.05, foamD);
    ctx.restore();
    P_line(ctx, 0.02, 0.6, 0.12, 0.6, 0.05, ring);
    // the key, hanging down off the ring
    P_ell(ctx, -0.16, 0.56, 0.12, 0.12, brass); P_ell(ctx, -0.16, 0.56, 0.05, 0.05, brassD);
    P_line(ctx, -0.16, 0.46, -0.16, 0.06, 0.08, brass);
    P_rect(ctx, -0.16, 0.06, 0.12, 0.06, brass); P_rect(ctx, -0.16, 0.16, 0.08, 0.05, brass);
    ctx.restore();
  },
});
LEVELS.push({
  id: 'boathouse', title: 'The Boathouse', facing: 0, eyeH: 1.65,
  pal: { skyTop: [8, 10, 18], fog: [40, 48, 58], ground: [24, 32, 40], fogDist: 60 },
  ambient: { wind: 0.6, drone: 0.7, droneFreq: 44, windFreq: 260, rain: 0.5 },
  weather: { kind: 'rain', density: 0.45, wind: 0.25, fogRoll: { period: 37, depth: 0.35, phase: 1 } },
  text: {
    intro: 'The water door has been open all night, and the water has not been still.<br>Something is swimming in toward the boathouse. It goes under for a while, and when it comes up it is closer.',
    hint: 'Unlock the winch, put the handle on and crank the water door down; then shut the side door and bar it.',
    objective: 'Shut both ways in: crank the water door down, and shut and bar the side door.',
    death: { default: 'It came up over the sill with its hand first.', reached: 'The door was not down. It came up under it.', side: 'The bar was not across. It came in with the door.' },
    win: 'It pushed at the slats until the tide turned. When you looked again the water was flat all the way out.',
    fragment: 'Your knees were wet until noon. Nothing else in the house was.',
  },
  // the thing swims: its feet are at the water line, a little below the deck
  lanes: [
    { deg: 0, name: 'water door', barrierDist: 2.9, y: -0.15, cue: 'splash', default: true },
    { deg: 90, name: 'side door', barrierDist: 2.7, y: -0.15, cue: 'splash' },
  ],
  creatures: [{ type: 'swimmer', startDist: 70, time: 105, unseenMult: 1.3 }],
  aftermath: { type: 'held', dur: 4.2, beats: [{ every: 0.95, sfx: 'wetThud', shake: 0.45 }, { at: 0.5, sfx: 'splash' }, { at: 2.1, sfx: 'splash' }, { at: 3.7, sfx: 'dive' }] },
  build(L) {
    const s = L.s;
    const wood = [50, 43, 36], woodD = [38, 32, 27], frameC = [76, 64, 50], deck = [56, 48, 39], water = [22, 30, 38], iron = [48, 48, 54], WL = -0.15;
    const tex = { tex: 'planks', texScale: 1.4 };
    SC.stars(L, 61, 90, 0.35);
    SC.clouds(L, 62, 7, [30, 36, 48], 0.5);
    SC.moon(L, 300, 30, 5, [210, 214, 226]);
    // water all round: the boathouse stands on piles at the end of a pier
    SC.floorQ(L, -160, 2.7, 160, 240, WL, water);
    SC.floorQ(L, 2.5, -70, 160, 2.7, WL, water);
    SC.floorQ(L, -160, -70, -2.5, 2.7, WL, water);
    SC.floorQ(L, -2.5, -70, 2.5, -2.5, WL, water);
    for (let i = 0; i < 9; i++) SC.floorQ(L, -9 + i * 0.35, 8 + i * 5, -8.5 + i * 0.35, 11 + i * 5, WL + 0.005, [60, 72, 86], { alpha: 0.45 });
    const wr = mulberry32(63);
    for (let i = 0; i < 40; i++) { const x = (wr() - 0.5) * 30, z = 3.5 + Math.pow(wr(), 1.4) * 45, w = 0.6 + wr() * 2; SC.floorQ(L, x - w, z - 0.04, x + w, z + 0.04, WL + 0.004, wr() < 0.5 ? [14, 20, 28] : [44, 56, 68], { alpha: 0.5 }); }
    // the pier back to the shore, and its piles
    SC.floorQ(L, -1.0, -60, 1.0, -2.4, 0.0, deck, { tex: 'planks', texScale: 1.2 });
    for (let z = -6; z > -58; z -= 6) for (const x of [-0.9, 0.9]) SC.box(L, x - 0.1, x + 0.1, WL - 0.6, 0.05, z - 0.1, z + 0.1, [36, 30, 24]);
    // piles standing out in the channel, and the far shore
    for (const z of [6, 11, 17, 24]) for (const x of [-2.3, 2.3]) SC.box(L, x - 0.12, x + 0.12, WL - 0.4, 0.5 + (z % 5) * 0.06, z - 0.12, z + 0.12, [34, 28, 22]);
    const rng = mulberry32(66);
    for (let i = 0; i < 44; i++) { const x = (rng() - 0.5) * 170, z = 56 + rng() * 28; SC.tree(L, x, z, 8 + rng() * 7, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 26; i++) { const side = rng() < 0.5 ? -1 : 1, x = side * (46 + rng() * 30), z = -30 + rng() * 70; SC.tree(L, x, z, 7 + rng() * 7, rng() < 0.6 ? 'fir' : 'bare', (rng() * 1e6) | 0); }
    SC.sprite(L, -34, 1.2, 66, 0.9, 0.7, (ctx, P) => { ctx.scale(0.9, 0.7); P_rect(ctx, -0.5, 0, 1, 1, P.raw([214, 176, 108])); }, { noFog: true, noLight: true });
    // the deck and the walls
    SC.floorQ(L, -2.4, -2.4, 2.4, 2.6, 0.006, deck, { tex: 'planks', texScale: 1.3 });
    SC.wallV(L, -2.4, -2.4, 2.4, -2.4, 0, 3.0, wood, tex);
    SC.wallV(L, -0.5, -2.39, 0.5, -2.39, 0, 2.1, [22, 18, 16]);
    SC.wallV(L, -0.56, -2.385, -0.5, -2.385, 0, 2.16, frameC); SC.wallV(L, 0.5, -2.385, 0.56, -2.385, 0, 2.16, frameC); SC.wallV(L, -0.56, -2.385, 0.56, -2.385, 2.1, 2.16, frameC);
    SC.wallV(L, -2.4, -2.4, -2.4, 2.6, 0, 3.0, woodD, tex);
    for (let y = 0.6; y < 3; y += 0.6) { SC.wallV(L, -2.39, -2.4, -2.39, 2.6, y, y + 0.04, [30, 24, 20]); SC.wallV(L, -2.4, -2.39, 2.4, -2.39, y, y + 0.04, [30, 24, 20]); }
    const apN = SC.doorway(L, { z: 2.6, w: 3.0, h: 2.4, wallH: 3.0, left: -2.4, right: 2.4, color: wood, opts: tex, frame: { color: frameC, w: 0.12 } });
    const apE = SC.doorway(L, { deg: 90, z: 2.4, w: 1.1, h: 2.1, wallH: 3.0, left: -2.6, right: 2.4, color: woodD, opts: tex, frame: { color: frameC, w: 0.1 } });
    L.addAperture(0, apN); L.addAperture(1, apE);
    SC.quad(L, [-2.5, 3.0, -2.5], [2.5, 3.0, -2.5], [2.5, 3.0, 2.7], [-2.5, 3.0, 2.7], [26, 21, 17]);
    for (const z of [-1.8, -0.6, 0.6, 1.8]) SC.box(L, -2.4, 2.4, 2.84, 3.0, z - 0.06, z + 0.06, [44, 36, 28]);
    // furniture: an upturned rowboat, a workbench, a shelf, the winch, rope and nets
    // the rowboat lies upturned along the west wall, its bow toward the water: plank sides narrowing to a stem, its flat
    // bottom uppermost (things can lie on it), and the keel along the middle
    const hullC = [72, 62, 50], hx0 = -2.3, hx1 = -1.4, hmx = -1.85, hz0 = -1.9, hz1 = 0.9, stem = 1.5, HH = 0.45, strakes = { tex: 'planks', texScale: 0.6 };
    SC.quad(L, [hx0, 0, hz0], [hx1, 0, hz0], [hx1, HH, hz0], [hx0, HH, hz0], scalec(hullC, 0.78));                  // the transom
    SC.quad(L, [hx0, 0, hz0], [hx0, 0, hz1], [hx0, HH, hz1], [hx0, HH, hz0], scalec(hullC, 0.66), strakes);         // the sides
    SC.quad(L, [hx1, 0, hz0], [hx1, 0, hz1], [hx1, HH, hz1], [hx1, HH, hz0], scalec(hullC, 0.66), strakes);
    SC.quad(L, [hx0, 0, hz1], [hmx, 0, stem], [hmx, HH, stem], [hx0, HH, hz1], scalec(hullC, 0.6));                 // the bow
    SC.quad(L, [hx1, 0, hz1], [hmx, 0, stem], [hmx, HH, stem], [hx1, HH, hz1], scalec(hullC, 0.74), strakes);
    // the bottom, uppermost, and the keel along it: the bow's part of the bottom, the rest of it, then the keel, one straight
    // after another and before anything lying on the boat (all of which is nearer than 2.3)
    SC.quad(L, [hx0, HH, hz1], [hx1, HH, hz1], [hmx, HH, stem], [hmx, HH, stem], scalec(hullC, 1.08), { sortDist: 2.38 });
    SC.quad(L, [hx0, HH, hz0], [hx1, HH, hz0], [hx1, HH, hz1], [hx0, HH, hz1], scalec(hullC, 1.08), { sortDist: 2.37 });
    SC.box(L, hmx - 0.05, hmx + 0.05, HH, HH + 0.1, hz0, stem - 0.14, [50, 42, 34], { sortDist: 2.36 });
    // the workbench. Its top is drawn before whatever stands on it, all of which is nearer than this: drawn by its own middle
    // it covered the far end of the bench, where the tackle box and the key that comes out of it can lie
    const benchC = [78, 64, 48], bx0 = 0.6, bx1 = 2.3, by0 = 0.86, by1 = 0.92, bz0 = -2.35, bz1 = -1.7;
    for (const z of [bz0, bz1]) SC.quad(L, [bx0, by0, z], [bx1, by0, z], [bx1, by1, z], [bx0, by1, z], scalec(benchC, 0.78));
    for (const x of [bx0, bx1]) SC.quad(L, [x, by0, bz0], [x, by0, bz1], [x, by1, bz1], [x, by1, bz0], scalec(benchC, 0.66));
    SC.quad(L, [bx0, by1, bz0], [bx1, by1, bz0], [bx1, by1, bz1], [bx0, by1, bz1], scalec(benchC, 1.08), { sortDist: 2.8 });
    STORY.lamp(L, 0.8, 0.92, -2.15, { scale: 0.85 });
    for (const [x, z] of [[0.65, -2.3], [2.25, -2.3], [0.65, -1.75], [2.25, -1.75]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.86, z - 0.04, z + 0.04, [60, 48, 36]);
    SC.box(L, -2.38, -2.05, 1.5, 1.55, -0.2, 1.4, [66, 54, 42]);
    // the pulley over the water door, the cable from the winch drum up to it and across to the door
    SC.box(L, 1.8, 2.1, 2.42, 2.58, 2.5, 2.62, iron);
    SC.quad(L, [1.94, 1.5, 2.5], [1.96, 1.5, 2.5], [1.96, 2.42, 2.5], [1.94, 2.42, 2.5], [28, 28, 30]);
    SC.quad(L, [0, 2.44, 2.61], [1.95, 2.44, 2.61], [1.95, 2.47, 2.61], [0, 2.47, 2.61], [28, 28, 30]);
    SC.sprite(L, -1.6, 1.4, -2.36, 0.5, 0.5, (ctx, P) => { ctx.scale(0.5, 0.5); ICONS.rope(ctx, P); });
    SC.sprite(L, -2.36, 1.85, -1.5, 0.7, 0.7, (ctx, P) => { ctx.scale(0.7, 0.7); ctx.lineWidth = 0.16; ctx.strokeStyle = P.col([200, 196, 186]); ctx.beginPath(); ctx.arc(0, 0.5, 0.36, 0, TAU); ctx.stroke(); ctx.strokeStyle = P.col([150, 50, 40]); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(0, 0.5, 0.36, k * Math.PI / 2 + 0.2, k * Math.PI / 2 + 0.6); ctx.stroke(); } });
    SC.sprite(L, 1.2, 1.3, -2.36, 1.6, 1.6, (ctx, P) => { ctx.scale(1.6, 1.6); ctx.strokeStyle = P.col([60, 58, 50]); ctx.lineWidth = 0.006; ctx.beginPath(); for (let k = 0; k <= 8; k++) { ctx.moveTo(-0.5 + k / 8, 1); ctx.lineTo(-0.4 + k / 8 * 0.8, 0); ctx.moveTo(-0.5, 1 - k / 8); ctx.lineTo(0.5, 1 - k / 8 * 0.9); } ctx.stroke(); }, { sortDist: 3.3 }); // the net hangs on the wall: drawn with it, behind what stands on the bench
    // the iron brackets either side of the side door that take its bar: each a cradle open at the top, bolted to the wall, two
    // arms out from the wall plate and a strap across their ends, so that from the room it shows as a U the bar drops into.
    // They and the bar carry sort distances that draw them over the door leaf and frame (sorted by their own middles, a bar a
    // little into the room still came out further from the eye than the leaf's middle, and the leaf hid it), and draw the
    // cradle round the bar: the plate and the arms behind it, the strap in front
    const cradle = [96, 96, 104];
    for (const zc of [-0.74, 0.74]) {
      const z0 = zc - 0.08, z1 = zc + 0.08, zn = Math.abs(z0) < Math.abs(z1) ? z0 : z1, zf = zn === z0 ? z1 : z0;   // the arm nearer the door, the far one
      SC.wallV(L, 2.37, z0, 2.37, z1, 0.9, 1.26, [50, 50, 56], { sortDist: 2.3 });
      SC.wallV(L, 2.366, zc - 0.014, 2.366, zc + 0.014, 1.212, 1.24, [120, 120, 126], { sortDist: 2.29 }); // a bolt head
      SC.wallV(L, 2.2, zf, 2.37, zf, 0.9, 1.1, scalec(cradle, 0.72), { sortDist: 2.27 });
      SC.wallV(L, 2.2, zn, 2.37, zn, 0.9, 1.1, scalec(cradle, 0.8), { sortDist: 2.25 });
      SC.wallV(L, 2.2, z0, 2.2, z1, 0.9, 0.95, cradle, { sortDist: 2.1 });                                            // the strap across, and the arms' ends
      for (const z of [z0, z1]) SC.wallV(L, 2.2, z - Math.sign(z - zc) * 0.025, 2.2, z, 0.9, 1.1, cradle, { sortDist: 2.1 });
    }
    // items
    const decoy = !!L.diff.decoys;
    mkItem(L, 'handle', 'Winch handle', [
      { x: 1.2, y: 0.92, z: -2.0 },                     // on the workbench
      { x: 1.6, y: 0, z: -2.1 },                        // on the deck under the bench
      { x: -2.33, y: 1.25, z: -0.7, flat: false },      // hanging on a nail on the west wall, clear of the shelf
      { x: -1.6, y: 0.46, z: 0.3 },                     // on the rowboat's upturned bottom, beside the keel
      { x: -1.9, y: 0, z: 2.2 },                        // in the corner by the water door
    ], { w: 0.45, h: 0.45, flat: true });
    mkItem(L, 'beam', 'Door bar', [
      { x: -1.0, y: 0, z: -0.6 },                       // on the deck by the boat
      { x: -0.6, y: 0, z: -2.05 },                      // along the back wall
      { x: 1.5, y: 0.92, z: -2.0 },                     // across the workbench
      { x: 1.6, y: 0, z: 1.0 },                         // near the side door
    ], { w: 1.6, h: 0.5, flat: true });
    // the oar: on the deck inside the water door, clear of the rowboat (behind its end, the boat hid it) and of the corner
    // where the handle can lie, or leaning in the corner by the winch
    if (decoy) mkItem(L, 'oar', 'Oar', [{ x: -0.4, y: 0, z: 1.4 }, { x: 2.3, y: 0, z: 1.7, flat: false }], { w: 0.5, h: 1.2, flat: true, decoy: true, decoyText: 'It does not fit the winch.' });
    // the winch is chained and padlocked, and the key is in the tackle box
    Object.assign(s, { handleIn: false, locked: true, sealedN: false, sealedE: false, doorOpen: true, doorClosing: 0, doorClosed: false, doorA: 72 * DEG, crankA: 0 });
    // a green tackle box: shut, a solid box with its lid down; open, the lid thrown back and the trays folded out either side,
    // and the key on its orange float lying in front of it
    const boxC = [44, 116, 80], boxW = 0.52, boxH = 0.32;
    const box = mkContainer(L, {
      id: 'tacklebox', name: 'Tackle box', w: boxW, h: boxH, color: boxC, sfx: 'clunk',
      spot: [{ x: 1.9, y: 0.92, z: -2.0 }, { x: -2.2, y: 1.55, z: 0.6 }, { x: 2.0, y: 0, z: -1.6 }, { x: -1.5, y: 0.45, z: -1.2 }],
      closedText: 'A tackle box.', emptyText: 'Hooks and line. Nothing else.',
      yields: [{ id: 'winchkey', name: 'Small key', opts: { w: 0.26, h: 0.26, tool: true, icon: 'winchKey' } }],
      onOpen(t) {
        // the lid stands up and the trays fold out: what you can see and click is the whole open box, trays and lid
        t.w = boxW * OPEN_W; t.h = boxH * OPEN_H;
        if (boxArt) { boxArt.w = t.w; boxArt.h = t.h; }
        setTimeout(() => AUDIO.sfx('keys'), 280); G.say('The trays fold out. Under them, a small key on a float.', 'The tackle box is open. There was a small key in it.');
      },
    });
    // mkContainer draws the box. Open, this night draws its own open box in its place: the same renderable, so it sorts, culls
    // and rests as the shut box does, and nothing of the default open box is left under it. (js/levels.js could take this
    // as an option, o.drawOpen(ctx, P); until then the box's sprite is found by where it stands.) Its size covers the open
    // box from the start, so the angle culling of the night's props, worked out once, never drops a tray that is on screen.
    const OPEN_W = 2.2, OPEN_H = 1.6;
    const boxArt = L.props.find(p => p.kind === 'sprite' && p.card && p.x === box.x && p.y === box.y && p.z === box.z);
    if (boxArt) {
      const shut = boxArt.draw;
      boxArt.draw = (ctx, P) => { if (!box.open) { shut(ctx, P); return; } ctx.scale(boxW, boxH); drawOpenBox(ctx, P); };
      boxArt.w = boxW * OPEN_W; boxArt.h = boxH * OPEN_H;
    }
    function drawOpenBox(ctx, P) {
      const c = P.col(boxC), d = P.col(scalec(boxC, 0.62)), metal = P.col([150, 146, 138]), mouth = P.col([12, 14, 12]);
      const lid = P.col(mixc(boxC, [214, 226, 206], 0.18)), lidD = P.col(scalec(boxC, 0.6)), rib = P.col(scalec(boxC, 0.85));
      const tray = P.col(mixc(boxC, [226, 232, 214], 0.32)), trayD = P.col(scalec(boxC, 0.55)), arm = P.col([170, 166, 156]), well = P.col([16, 18, 16]);
      // the lid, thrown back on its hinge behind the box, its inside toward you
      P_poly(ctx, [[-0.5, 0.64], [0.5, 0.64], [0.47, 1.57], [-0.47, 1.57]], lidD);
      P_poly(ctx, [[-0.43, 0.7], [0.43, 0.7], [0.4, 1.5], [-0.4, 1.5]], lid);
      for (const x of [-0.14, 0.14]) P_line(ctx, x, 0.76, x * 0.94, 1.44, 0.035, rib);
      // the box: its body, bands and corner straps, the dark open mouth over its front edge, the hinges, the latch hanging open
      P_rect(ctx, -0.5, 0, 1, 0.66, c); P_rect(ctx, -0.5, 0, 1, 0.06, d); P_rect(ctx, -0.5, 0.6, 1, 0.06, d);
      for (const x of [-0.5, 0.42]) P_rect(ctx, x, 0, 0.08, 0.66, metal);
      P_rect(ctx, -0.46, 0.52, 0.92, 0.18, mouth);
      P_rect(ctx, -0.12, 0.66, 0.06, 0.06, metal); P_rect(ctx, 0.06, 0.66, 0.06, 0.06, metal);
      P_rect(ctx, -0.07, 0.36, 0.14, 0.14, metal); P_rect(ctx, -0.03, 0.38, 0.06, 0.06, mouth);
      for (const sx of [-1, 1]) {
        // the arms the tray rides on, from the sides of the box up and out
        P_line(ctx, sx * 0.44, 0.3, sx * 0.84, 0.68, 0.05, arm);
        P_line(ctx, sx * 0.44, 0.52, sx * 0.6, 0.68, 0.05, arm);
        // the tray: shallow, three wells, a lure in each
        const x0 = sx < 0 ? -1.08 : 0.42;
        P_rect(ctx, x0, 0.64, 0.66, 0.22, tray); P_rect(ctx, x0, 0.64, 0.66, 0.05, trayD);
        for (let k = 0; k < 3; k++) P_rect(ctx, x0 + 0.04 + k * 0.21, 0.79, 0.17, 0.05, well);
        for (let k = 1; k < 3; k++) P_rect(ctx, x0 + k * 0.21 + 0.01, 0.69, 0.02, 0.17, trayD);
        (sx < 0 ? ['bob', 'spoon', 'jig'] : ['jig', 'bob', 'spoon']).forEach((kind, k) => {
          const x = x0 + 0.125 + k * 0.21;
          if (kind === 'bob') { // a red and white float
            P_ell(ctx, x, 0.9, 0.07, 0.07, P.col([228, 224, 212]));
            ctx.save(); ctx.beginPath(); ctx.rect(x - 0.08, 0.9, 0.16, 0.09); ctx.clip(); P_ell(ctx, x, 0.9, 0.07, 0.07, P.col([206, 44, 36])); ctx.restore();
            P_line(ctx, x, 0.96, x, 1.03, 0.016, P.col([40, 40, 40]));
          } else if (kind === 'spoon') { P_ell(ctx, x, 0.9, 0.045, 0.085, P.col([200, 202, 208]), 0.5); P_ell(ctx, x + 0.012, 0.91, 0.016, 0.036, P.col([150, 60, 46]), 0.5); }
          else { P_poly(ctx, [[x - 0.065, 0.83], [x + 0.065, 0.83], [x, 0.99]], P.col([226, 190, 50])); P_ell(ctx, x, 0.95, 0.032, 0.032, P.col([200, 60, 40])); }
        });
      }
    }
    // the winch: unlock it, fit the handle, then crank the water door down. On the wall by the water door: a plate bolted to
    // the wall, a drum with the cable wound on it going up to the pulley, and under it the wheel that turns it, with the square
    // boss in its middle that the handle fits. Locked, a chain runs round the drum and down through the wheel to a padlock;
    // unlocked, the chain hangs loose off the side, the padlock open on it and the key's float hanging from the padlock; with
    // the handle on, the crank turns the wheel round a step at every turn. What you click is the drawing: the same size and place
    const need = 7, WS = 0.62, WX = 1.95, WY = 0.9, WZ = 2.5;
    SC.sprite(L, WX, WY, WZ, WS, WS, (ctx, P) => { ctx.scale(WS, WS); drawWinch(ctx, P); });
    function drawWinch(ctx, P) {
      const plate = P.col([40, 40, 46]), iron = P.col([70, 70, 78]), ironD = P.col([30, 30, 34]), ironL = P.col([118, 118, 126]);
      const drum = P.col([96, 92, 86]), drumD = P.col([58, 56, 52]), cable = P.col([156, 146, 120]), cableD = P.col([108, 100, 80]), chain = P.col([132, 128, 118]);
      // the plate, bolted to the wall
      P_rect(ctx, -0.42, 0.02, 0.84, 0.94, plate);
      for (const [x, y] of [[-0.36, 0.08], [0.36, 0.08], [-0.36, 0.9], [0.36, 0.9]]) P_ell(ctx, x, y, 0.024, 0.024, ironL);
      // the cheeks, and the drum between them with the cable wound on it, going up to the pulley
      for (const sx of [-1, 1]) P_poly(ctx, [[sx * 0.38, 0.12], [sx * 0.26, 0.12], [sx * 0.26, 0.9], [sx * 0.33, 0.9]], iron);
      P_rect(ctx, -0.26, 0.64, 0.52, 0.24, drum); P_rect(ctx, -0.26, 0.64, 0.52, 0.045, drumD); P_rect(ctx, -0.26, 0.835, 0.52, 0.045, drumD);
      P_rect(ctx, -0.24, 0.68, 0.48, 0.16, cable); for (let k = 0; k < 7; k++) P_line(ctx, -0.21 + k * 0.07, 0.685, -0.19 + k * 0.07, 0.835, 0.012, cableD);
      P_line(ctx, 0, 0.86, 0, 1, 0.03, cable);
      // the wheel, which the crank turns, and the square boss in its middle
      const turn = -(s.crankA + Math.PI * 0.8);
      ctx.save(); ctx.translate(0, 0.36); ctx.rotate(turn);
      for (let k = 0; k < 16; k++) { ctx.save(); ctx.rotate(k * TAU / 16); P_rect(ctx, -0.022, 0.19, 0.044, 0.045, iron); ctx.restore(); }
      P_ell(ctx, 0, 0, 0.2, 0.2, iron); P_ell(ctx, 0, 0, 0.165, 0.165, ironD);
      for (let k = 0; k < 4; k++) { ctx.save(); ctx.rotate(k * Math.PI / 2 + 0.4); P_rect(ctx, -0.018, 0, 0.036, 0.17, iron); ctx.restore(); }
      P_ell(ctx, 0, 0, 0.065, 0.065, iron); P_rect(ctx, -0.032, -0.032, 0.064, 0.064, ironL);
      ctx.restore();
      const links = (x0, y0, x1, y1, n) => {
        const ang = Math.atan2(y1 - y0, x1 - x0);
        ctx.strokeStyle = chain; ctx.lineWidth = 0.02;
        for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; ctx.beginPath(); ctx.ellipse(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 0.04, i % 2 ? 0.012 : 0.024, ang, 0, TAU); ctx.stroke(); }
      };
      if (s.locked) {
        // round the drum, down through the wheel either side, and the padlock where the two ends meet
        links(-0.25, 0.76, 0.25, 0.76, 8); links(-0.22, 0.72, -0.03, 0.21, 9); links(0.22, 0.72, 0.03, 0.21, 9);
        ctx.save(); ctx.scale(0.27, 0.27); ICONS.padlock(ctx, P); ctx.restore();
      } else {
        // off the drum, hanging from the cheek, and the padlock open at the end of it with the key still in it
        links(-0.34, 0.88, -0.34, 0.39, 8);
        const x = -0.34, y0 = 0.14, brass = P.col([150, 128, 60]), steel = P.col([120, 120, 118]);
        ctx.strokeStyle = steel; ctx.lineWidth = 0.022; ctx.beginPath(); ctx.arc(x, y0 + 0.19, 0.05, Math.PI, 0, true); ctx.stroke();
        P_line(ctx, x - 0.05, y0 + 0.19, x - 0.05, y0 + 0.11, 0.022, steel); P_line(ctx, x + 0.05, y0 + 0.19, x + 0.05, y0 + 0.16, 0.022, steel);
        P_rect(ctx, x - 0.075, y0, 0.15, 0.12, brass); P_ell(ctx, x, y0 + 0.06, 0.016, 0.016, P.col([40, 34, 20]));
        P_line(ctx, x, y0 + 0.05, x, y0 - 0.02, 0.012, P.col([196, 168, 92]));
        P_rect(ctx, x - 0.026, y0 - 0.12, 0.052, 0.1, P.col([236, 112, 36])); P_rect(ctx, x - 0.026, y0 - 0.08, 0.052, 0.022, P.col([236, 230, 214]));
      }
      if (s.handleIn) {
        // the crank: its socket on the boss, the iron arm and the wooden grip, seen end on
        ctx.save(); ctx.translate(0, 0.36); ctx.rotate(turn);
        const arm = P.col([84, 84, 92]);
        P_rect(ctx, -0.05, -0.05, 0.1, 0.1, arm); P_line(ctx, 0, 0, 0, 0.28, 0.07, arm);
        P_ell(ctx, 0, 0.29, 0.068, 0.068, P.col([118, 86, 54])); P_ell(ctx, 0, 0.29, 0.038, 0.038, P.col([152, 114, 74]));
        ctx.restore();
      }
    }
    const unlock = () => {
      s.locked = false; winch.accepts = ['handle'].concat(decoy ? ['oar'] : []);
      // the key stays in the padlock; the slot it leaves goes to the handle if you have it, not to whatever came after the key
      const k = G.inv.find(i => i.id === 'winchkey');
      if (k) { G.removeFromInv(k); const h = G.inv.findIndex(i => i.id === 'handle'); if (h >= 0) G.active = h; }
      AUDIO.sfx('lock'); setTimeout(() => AUDIO.sfx('chain'), 200); G.say('The padlock opens and the chain comes off the drum.', 'The padlock is open. The chain is off the drum.');
    };
    const winch = mkTarget(L, {
      id: 'winch', name: 'Winch', x: WX, y: WY, z: WZ, w: WS, h: WS, accepts: ['handle', 'winchkey'].concat(decoy ? ['oar'] : []),
      hint() { return winch.done ? 'The door is down.' : s.locked ? 'The winch. A chain through the drum, and a padlock on it.' : !s.handleIn ? 'The winch. Its handle is gone.' : 'Crank it. ' + Math.max(0, need - Math.floor(winch.count || 0)) + ' more.'; },
      onClick() {
        // with the key on you, the padlock comes first, whatever is in your hand
        if (s.locked && G.hasItem('winchkey')) { unlock(); return true; }
        // with nothing it takes, say what is wrong with it
        if (!s.handleIn && !winch.accepts.some(id => G.hasItem(id))) {
          if (s.locked) { AUDIO.sfx('chain'); G.say('The winch. A chain through the drum, and a padlock on it.', 'The winch is chained, and the chain is padlocked.'); }
          else { AUDIO.sfx('nope'); G.say('The winch. Its handle is gone.', 'The winch has no handle.'); }
          return true;
        }
        return false;
      },
      use(item) {
        if (item.id === 'winchkey') { unlock(); return true; }
        if (item.id !== 'handle') return false;
        if (s.locked) { G.say('The drum is chained and padlocked. It will not turn.', 'It will not turn. There is a padlock on the chain.'); return false; }
        s.handleIn = true; winch.accepts = [];
        winch.crank = { n: need, sfx: 'ratchet', onTurn() { G.shake(0.05); }, onComplete() { s.sealedN = true; AUDIO.sfx('bar'); G.say('The water door is down.', 'The water door is down.'); } };
        AUDIO.sfx('fit'); G.say('The handle fits. Crank it.', 'The handle is on the winch.'); return true;
      },
    });
    // the side door: close it, then bar it. A closed door on its own only slows it down.
    const sd = mkTarget(L, {
      id: 'sidedoor', name: 'Side door', x: 2.36, y: 0, z: 0, w: 1.25, h: 2.1, accepts: ['beam'],
      hint() { return s.sealedE ? 'Barred.' : s.doorOpen ? 'The side door stands open.' : s.doorClosing > 0 ? 'Swinging shut.' : 'Shut. The bar would hold it.'; },
      onClick() {
        if (s.doorOpen) { s.doorOpen = false; s.doorClosing = 0.9; AUDIO.sfx('creak'); return true; }
        if (s.doorClosing > 0) { G.say('Wait for it to shut.', 'The door is still swinging shut.'); return true; }
        return false;
      },
      use(item) {
        if (s.doorOpen || s.doorClosing > 0) { G.say('Shut it first.', 'The side door is standing open.'); return false; }
        s.sealedE = true; sd.done = true; sd.accepts = []; AUDIO.sfx('bar'); G.say('The bar is across.', 'The bar is across the side door.'); return true;
      },
    });
    // both ways must be shut
    L.sealed = lane => (lane.idx === 0 ? s.sealedN : s.sealedE);
    L.isWon = () => s.sealedN && s.sealedE;
    L.objectiveText = () => {
      const n = s.sealedN ? 'Water door down.' : (s.locked ? 'Unlock the winch. ' : '') + (!s.handleIn ? (G.hasItem('handle') ? 'Put the handle on the winch.' : 'Find the winch handle.') : 'Crank the water door down (' + Math.min(need, Math.floor(winch.count || 0)) + '/' + need + ').');
      const e = s.sealedE ? 'Side door barred.' : s.doorOpen ? 'Shut the side door and bar it.' : 'Bar the side door.';
      return n + ' ' + e;
    };
    L.update = dt => {
      if (s.holdT > 0) { s.holdT -= dt; if (s.holdT <= 0 && s.heldC) { s.heldC.hold = null; s.heldC = null; } }
      s.crankA += ((winch.count || 0) * 1.3 - s.crankA) * (1 - Math.exp(-dt * 12));   // the crank goes round smoothly to where it was turned
      if (s.doorClosing > 0) { s.doorClosing -= dt; s.doorA = 72 * DEG * Math.pow(clamp(s.doorClosing / 0.9, 0, 1), 1.3); if (s.doorClosing <= 0) { s.doorA = 0; s.doorClosed = true; AUDIO.sfx('thud'); G.shake(0.12); } }
    };
    L.deathCause = c => (c.lane.idx === 1 ? 'side' : null);
    // a shut, unbarred door really does slow it: it bangs the door open and stands in it for a moment, long enough to shut and bar it
    L.onReach = c => { if (c.lane.idx === 1 && s.doorClosed && !s.sealedE) { s.doorOpen = true; s.doorClosed = false; s.doorA = 72 * DEG; AUDIO.sfx('bang'); G.shake(0.5); G.toast('The side door bangs open.'); c.hold = c.dist; s.heldC = c; s.holdT = 2.5; } };
    const lampX = () => Math.sin(L.t * 1.9) * 0.55;
    // the bar across the inside of the shut side door, in its brackets: a little into the room from the leaf (x 2.4) and
    // the frame (2.35), and drawn after both and before the brackets' lips (see the brackets above)
    const barC = [108, 82, 50];
    const bar = [
      SC.mkQuad(L, [2.24, 1.19, -0.88], [2.34, 1.19, -0.88], [2.34, 1.19, 0.88], [2.24, 1.19, 0.88], scalec(barC, 1.18), { sortDist: 2.21 }), // its top
      SC.mkWallV(L, 2.24, -0.88, 2.24, 0.88, 0.97, 1.19, barC, { sortDist: 2.2 }),                                                   // its face
      SC.mkWallV(L, 2.238, -0.88, 2.238, 0.88, 0.97, 0.99, scalec(barC, 0.6), { sortDist: 2.19 }),                                    // its lower edge
      SC.mkWallV(L, 2.238, -0.7, 2.238, 0.5, 1.09, 1.098, scalec(barC, 0.74), { sortDist: 2.19 }),                                     // the grain
      SC.mkWallV(L, 2.238, -0.3, 2.238, 0.8, 1.13, 1.136, scalec(barC, 0.78), { sortDist: 2.19 }),
    ];
    L.dynamic = () => {
      // the water door: slats come down from the top as the winch turns
      const covered = 2.4 * clamp((winch.count || 0) / need, 0, 1);
      for (let y = 2.4; y > 2.4 - covered; y -= 0.3) {
        const y0 = Math.max(y - 0.3, 2.4 - covered);
        R.add(SC.mkQuad(L, [-1.5, y0, 2.58], [1.5, y0, 2.58], [1.5, y, 2.58], [-1.5, y, 2.58], (Math.round(y / 0.3) % 2) ? [80, 72, 60] : [70, 62, 52]));
      }
      if (covered > 0.05) R.add(SC.mkQuad(L, [-1.52, 2.4 - covered, 2.575], [1.52, 2.4 - covered, 2.575], [1.52, 2.4 - covered + 0.06, 2.575], [-1.52, 2.4 - covered + 0.06, 2.575], [40, 40, 44]));
      // the side door leaf, swung out over the water or shut in its frame, and the bar
      const hx = 2.4, hz = -0.55, a = s.doorA, ex = hx + Math.sin(a) * 1.1, ez = hz + Math.cos(a) * 1.1;
      R.add(SC.mkWallV(L, hx, hz, ex, ez, 0, 2.08, [64, 52, 40]));
      for (const yy of [0.5, 1.5]) R.add(SC.mkWallV(L, hx + Math.sin(a) * 0.02, hz + Math.cos(a) * 0.02, ex - Math.sin(a) * 0.02, ez - Math.cos(a) * 0.02, yy, yy + 0.05, [44, 36, 28]));
      if (s.sealedE) for (const q of bar) R.add(q);
      // the hurricane lamp, swinging on its chain
      const lx = lampX();
      R.add(SC.mkQuad(L, [lx * 0.05 - 0.01, 2.84, 0.3], [lx * 0.05 + 0.01, 2.84, 0.3], [lx + 0.01, 2.4, 0.3], [lx - 0.01, 2.4, 0.3], [40, 40, 44]));
      R.add(SC.mkSprite(L, lx, 1.96, 0.3, 0.3, 0.44, (ctx, P) => { P.lit = true; ctx.scale(0.3, 0.44); ICONS.lantern(ctx, P); }));
      // rings on the water where it went under: flat on the water, spreading and fading, and kept out on the water, short of
      // the doorway. A decal runs away from the eye from its base, so it starts half a ring nearer than the spot it rings
      const c = L.creature, room = c.diveDist - (c.lane.barrierDist || 0) - 0.3;
      if (c.mode === 'down' && !L.won && !c.lunge && room > 0.3) {
        const p = APPROACH.position(c.lane, c.diveDist, 0, L.eyeH), k = clamp((L.t - c.diveT) / 2.6, 0, 1), w = Math.min(0.8 + k * 2.6, room * 2);
        const bx = p.x - Math.sin(G.cam.yaw) * w / 2, bz = p.z - Math.cos(G.cam.yaw) * w / 2;
        R.add({ kind: 'sprite', x: bx, y: p.y + 0.02, z: bz, w, h: w, flat: true, draw: (ctx, P) => {
          ctx.scale(w, w); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.cola([96, 118, 134], 0.14 * (1 - k)));
          ctx.strokeStyle = P.cola([170, 186, 196], 0.6 * (1 - k)); ctx.lineWidth = 0.05; ctx.beginPath(); ctx.ellipse(0, 0.5, 0.5, 0.5, 0, 0, TAU); ctx.stroke();
          ctx.lineWidth = 0.035; ctx.beginPath(); ctx.ellipse(0, 0.5, 0.3, 0.3, 0, 0, TAU); ctx.stroke();
        } });
      }
    };
    L.dynamicLights = () => { const p = L.pt(lampX(), 2.05, 0.3); return [{ x: p[0], y: p[1], z: p[2], r: 5.5, i: 0.42, color: [255, 210, 160], flicker: 0.3, seed: 2 }]; };
    L.glows = () => { const p = L.pt(lampX(), 2.15, 0.3); return [{ x: p[0], y: p[1], z: p[2], r: 1.6 + Math.sin(L.t * 11) * 0.08, color: [255, 190, 110], a: 0.2 }]; };
    L.floor = { poly: [[-2.3, -2.3], [2.3, -2.3], [2.3, 2.5], [-2.3, 2.5]], y: 0 };
  }
});
