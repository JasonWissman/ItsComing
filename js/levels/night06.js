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
  ambient: { tune: 'ambient:6', wind: 0.6, drone: 0.7, droneFreq: 44, windFreq: 260, rain: 0.5 },
  weather: { kind: 'rain', density: 0.45, wind: 0.25, fogRoll: { period: 37, depth: 0.35, phase: 1 } },
  text: {
    intro: 'Something is in the water.',
    hint: 'Unlock the winch, put the handle on and crank the water door down; then shut the side door and bar it with both oars.',
    objective: 'Shut both ways in: crank the water door down, and shut the side door and bar it with both oars.',
    death: { default: 'It splashed into the boathouse and pulled you under.', reached: 'It came through the main opening, and pulled you down.', side: 'It came in the side, and pulled you under.', oneoar: 'One oar wasn\'t strong enough.' },
    win: 'It threw itself at the doors, but they held.',
  },
  // the thing swims: its feet are at the water line, a little below the deck
  lanes: [
    { deg: 0, name: 'water door', barrierDist: 2.9, y: -0.15, cue: 'splash', default: true },
    { deg: 90, name: 'side door', barrierDist: 2.7, y: -0.15, cue: 'splash' },
  ],
  creatures: [{ type: 'swimmer', startDist: 70, time: 105, unseenMult: 1.3 }],
  // the aftermath is the night's own (L.aftermath in build): it comes on to the door it was coming for and pounds on it
  aftermath: { type: 'custom' },
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
    // a lamp on the far shore, among the trees: a small soft glow, warm and dim, fading to nothing with no edge to it. r
    // is how far out it fades, in metres, so it is the size its distance makes it; its faint skirt is never under a few
    // pixels across, so it does not shrink to a hard dot
    const farLight = (x, y, z, r, col, a) => SC.sprite(L, x, y - r, z, 2 * r, 2 * r, (ctx, P, px) => {
      const R0 = Math.max(r, 3 / (px || 1)), g = ctx.createRadialGradient(0, r, 0, 0, r, R0);
      g.addColorStop(0, rgba(col, a)); g.addColorStop(0.2, rgba(col, a * 0.55)); g.addColorStop(0.5, rgba(col, a * 0.14)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, r, R0, 0, TAU); ctx.fill();
    }, { noFog: true, noLight: true });
    farLight(-34, 1.55, 66, 0.85, [236, 188, 118], 0.7);
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
    // furniture: an upturned rowboat, a workbench, a shelf, the winch, a life ring on the wall
    // the rowboat lies upturned along the west wall, its bow toward the water: plank sides narrowing to a stem, its flat
    // bottom uppermost (things can lie on it), and the keel along the middle. It is painted: white, gone a little grey and
    // yellow, with a red sheer strake (the lowest plank of each side as it lies, next the deck) and a red keel, the paint
    // worn through to the wood where it has been dragged up a beach: along the chine, and in scrapes on the bottom.
    // White under what lies on it (the green tackle box, the key on its orange float, the iron handle): each shows on it
    const hullW = [170, 164, 150], hullR = [146, 44, 36], bare = [108, 92, 72];
    const hx0 = -2.3, hx1 = -1.4, hmx = -1.85, hz0 = -1.9, hz1 = 0.9, stem = 1.5, HH = 0.45, SHEER = HH / 4, strakes = { tex: 'planks', texScale: 0.6 };
    // Only the hull's near side and its near bow plank are drawn: its far side, its far bow plank and the transom are always
    // behind the bottom (or the near side) from where you stand, and are left out. Drawn, they were cut into pieces on
    // the renderer's grid like any long face, and the pieces of the far side nearest you came out nearer than the bottom
    // and were drawn over it: its planks showed through the middle of the bottom
    // (each in two: the red sheer strake, one plank, and the three white ones above it)
    for (const [y0, y1, col] of [[0, SHEER, hullR], [SHEER, HH, hullW]]) {
      SC.quad(L, [hx1, y0, hz0], [hx1, y0, hz1], [hx1, y1, hz1], [hx1, y1, hz0], scalec(col, 0.66), strakes);         // the near side
      SC.quad(L, [hx1, y0, hz1], [hmx, y0, stem], [hmx, y1, stem], [hx1, y1, hz1], scalec(col, 0.74), strakes);       // the bow
    }
    // the bottom, uppermost, and the keel along it: the bow's part of the bottom, the rest of it, what is on the paint (the
    // seams between its boards, and where it is worn), then the keel, one straight after another and before anything
    // lying on the boat (all of which is nearer than 2.3), each drawn whole, so what lies on it keeps its own order (the
    // key in front of the tackle box it came out of)
    SC.quad(L, [hx0, HH, hz1], [hx1, HH, hz1], [hmx, HH, stem], [hmx, HH, stem], scalec(hullW, 1.08), { sortDist: 2.38 });
    SC.quad(L, [hx0, HH, hz0], [hx1, HH, hz0], [hx1, HH, hz1 + 0.012], [hx0, HH, hz1 + 0.012], scalec(hullW, 1.08), { sortDist: 2.37 });   // (a little over the bow's part, so no line shows between them)
    { const on = { sortDist: 2.365 }, bowZ = x => hz1 + (stem - hz1) * (1 - Math.abs(x - hmx) / (hx1 - hmx)), y = HH + 0.001;
      const strip = (x0, x1, z0, z1, col, alpha) => SC.quad(L, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], col, Object.assign({ alpha }, on));
      // a scrape: a ragged sliver, its ends drawn out to nothing
      const scrape = (x, z0, z1, w, alpha) => { const l = z1 - z0; SC.quad(L, [x, y, z0], [x + w, y, z0 + l * 0.3], [x + w * 0.7, y, z1], [x - w * 0.15, y, z1 - l * 0.4], bare, Object.assign({ alpha }, on)); };
      // the seams between the bottom boards, running the length of it and on to where the bow cuts them off
      for (const o of [-0.3, -0.15, 0.15, 0.3]) strip(hmx + o - 0.006, hmx + o + 0.006, hz0, bowZ(hmx + o), scalec(hullW, 0.74), 1);
      // worn to the wood: along the chine nearest you, in lengths, and scrapes on the bottom running the way it was dragged
      for (const [z0, z1, w] of [[-1.72, -1.1, 0.022], [-0.85, -0.3, 0.03], [0.1, 0.84, 0.024]]) scrape(hx1 - w, z0, z1, w, 0.6);
      for (const [x, z0, z1, w, al] of [[-1.62, -0.55, 0.05, 0.03, 0.42], [-1.7, 0.45, 0.8, 0.02, 0.38], [-2.08, -1.3, -0.5, 0.032, 0.42], [-2.0, 0.2, 0.62, 0.018, 0.35], [-1.56, -1.75, -1.45, 0.022, 0.4]]) scrape(x, z0, z1, w, al);
    }
    SC.box(L, hmx - 0.05, hmx + 0.05, HH, HH + 0.1, hz0, stem - 0.14, hullR, { sortDist: 2.36 });
    // (the keel's paint worn off along its top, where it took the ground)
    for (const [z0, z1] of [[-1.55, -0.9], [-0.35, 0.3], [0.62, 1.05]]) SC.quad(L, [hmx - 0.028, HH + 0.101, z0], [hmx + 0.03, HH + 0.101, z0 + 0.12], [hmx + 0.022, HH + 0.101, z1], [hmx - 0.03, HH + 0.101, z1 - 0.15], bare, { sortDist: 2.355, alpha: 0.5 });
    // the workbench. Its top is not pinned to a drawing distance: the renderer cuts it on the same grid as the back
    // wall behind it, draws each piece of it after the piece of wall behind, and whatever stands on it (the tackle box, the
    // key that comes out of it, the winch handle) after the piece it stands on. (Pinned whole at 2.8 m, it came out further
    // than the pieces of the back wall nearest you, which were drawn over it: the wall's boards showed through the top.)
    const benchC = [78, 64, 48], bx0 = 0.6, bx1 = 2.3, by0 = 0.86, by1 = 0.92, bz0 = -2.35, bz1 = -1.7;
    // the edge of the top: its front and its near end. Its back, against the wall, and its far end, by the side wall, are
    // never seen from where you stand (the top is always in front of them) and are not drawn: put just in front of the
    // wall, the back was drawn after the nearest piece of wall it overlapped, over the tackle box standing on the bench
    SC.quad(L, [bx0, by0, bz1], [bx1, by0, bz1], [bx1, by1, bz1], [bx0, by1, bz1], scalec(benchC, 0.78));
    SC.quad(L, [bx0, by0, bz0], [bx0, by0, bz1], [bx0, by1, bz1], [bx0, by1, bz0], scalec(benchC, 0.66));
    SC.quad(L, [bx0, by1, bz0], [bx1, by1, bz0], [bx1, by1, bz1], [bx0, by1, bz1], scalec(benchC, 1.08));
    for (const [x, z] of [[0.65, -2.3], [2.25, -2.3], [0.65, -1.75], [2.25, -1.75]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.86, z - 0.04, z + 0.04, [60, 48, 36]);
    SC.box(L, -2.38, -2.05, 1.5, 1.55, -0.2, 1.4, [66, 54, 42]);
    // the pulley over the water door, the cable from the winch drum up to it and across to the door
    SC.box(L, 1.8, 2.1, 2.42, 2.58, 2.5, 2.62, iron);
    SC.quad(L, [1.94, 1.5, 2.5], [1.96, 1.5, 2.5], [1.96, 2.42, 2.5], [1.94, 2.42, 2.5], [28, 28, 30]);
    SC.quad(L, [0, 2.44, 2.61], [1.95, 2.44, 2.61], [1.95, 2.47, 2.61], [0, 2.47, 2.61], [28, 28, 30]);
    // a life ring hung flat on the west wall, between two battens, on a peg through the top of its hole: white, with four red
    // bands, in pieces of the ring laid on the boards
    { const rx = -2.37, ry = 2.12, rz = -1.5, r0 = 0.165, r1 = 0.26, N = 24;
      for (let k = 0; k < N; k++) {
        const a0 = k / N * TAU, a1 = (k + 1.15) / N * TAU, m = ((k + 0.5) / N * 4) % 1, P = (a, r) => [rx, ry + Math.sin(a) * r, rz + Math.cos(a) * r];
        SC.quad(L, P(a0, r0), P(a1, r0), P(a1, r1), P(a0, r1), m > 0.2 && m < 0.55 ? [150, 50, 40] : [200, 196, 186]);
      }
      SC.box(L, rx - 0.03, rx + 0.04, ry + r0 - 0.035, ry + r0 - 0.005, rz - 0.015, rz + 0.015, [40, 32, 26]);   // the peg, the ring's top resting on it
    }
    // the iron brackets either side of the side door that take the oars that bar it: each a cradle open at the top, bolted
    // to the wall, two arms out from the wall plate and a strap across their ends, so that from the room it shows as a U the
    // oars drop into, one on the other. They and the oars carry sort distances that draw them over the door leaf and frame
    // (sorted by their own middles, a thing a little into the room still came out further from the eye than the leaf's
    // middle, and the leaf hid it), and draw the cradle round the oars: the plate and the arms behind them, the strap in front
    const cradle = [96, 96, 104];
    const brackets = SC.grab(L, () => { for (const zc of [-0.74, 0.74]) {
      const z0 = zc - 0.08, z1 = zc + 0.08, zn = Math.abs(z0) < Math.abs(z1) ? z0 : z1, zf = zn === z0 ? z1 : z0;   // the arm nearer the door, the far one
      SC.wallV(L, 2.37, z0, 2.37, z1, 0.9, 1.26, [50, 50, 56], { sortDist: 2.3 });
      SC.wallV(L, 2.366, zc - 0.014, 2.366, zc + 0.014, 1.212, 1.24, [120, 120, 126], { sortDist: 2.29 }); // a bolt head
      SC.wallV(L, 2.2, zf, 2.37, zf, 0.9, 1.1, scalec(cradle, 0.72), { sortDist: 2.27 });
      SC.wallV(L, 2.2, zn, 2.37, zn, 0.9, 1.1, scalec(cradle, 0.8), { sortDist: 2.25 });
      SC.wallV(L, 2.2, z0, 2.2, z1, 0.9, 0.95, cradle, { sortDist: 2.1 });                                            // the strap across, and the arms' ends
      for (const z of [z0, z1]) SC.wallV(L, 2.2, z - Math.sign(z - zc) * 0.025, 2.2, z, 0.9, 1.1, cradle, { sortDist: 2.1 });
    } });
    // items. Every place the winch handle can be is on something that bears it (HANDLE_SPOTS, checked by the night's test):
    // the workbench, the deck, the shelf, the rowboat's bottom. (It hung on a nail on the west wall once, with no nail
    // drawn there, and showed floating against the boards.) On the shelf it stands on its socket at the near end, toward
    // you, where it is in front of the shelf's top as it is drawn
    const HANDLE_SPOTS = [
      { x: 1.2, y: 0.92, z: -2.0, on: 'bench' },                         // on the workbench
      { x: 1.6, y: 0, z: -2.1, on: 'deck' },                             // on the deck under the bench
      { x: -2.16, y: 1.525, z: 0.0, flat: false, jitter: 0, on: 'shelf' },  // standing on the shelf, at its near end (its socket, drawn a little up its card, on the top)
      { x: -1.6, y: 0.46, z: 0.3, on: 'boat' },                          // on the rowboat's upturned bottom, beside the keel
      { x: -1.9, y: 0, z: 2.2, on: 'deck' },                             // in the corner by the water door
    ];
    mkItem(L, 'handle', 'Winch handle', HANDLE_SPOTS, { w: 0.45, h: 0.45, flat: true });
    L.handleSpots = HANDLE_SPOTS;
    // the two oars of the upturned rowboat, which bar the side door between them: each laid across its brackets, one on the
    // other (one alone is not enough to hold it). Each lies in a place of its own: one on the deck by the boat's bow, on
    // the deck toward the water door, or leaning in the corner by the winch; the other on the deck toward the back wall,
    // on the deck under the side door's bracket, or leaning on the boat's stern. An oar is as long wherever it is as it is
    // across the door (OAR_H: its card, the icon drawn on it about 2.1 m from grip to blade; across the brackets it is a
    // little longer, its ends past them). Lying, it lies from near your feet straight out along the deck (a card on the
    // floor runs away from where you stand), clear of the walls, the boat and the bench; leaning, it stands near upright.
    // Held in both hands along the loom, the lower hand near the grip end and the other further up toward the blade (the
    // icon draws it slanting, so the hands go where its shaft is)
    const OAR_W = 0.5, OAR_H = 2.4;
    const onDeck = (deg, r) => ({ x: Math.sin(deg * DEG) * r, y: 0, z: Math.cos(deg * DEG) * r, jitter: 0.04 });
    const oarHeld = { hands: 2, grip: 'fist', at: [-0.08, 0.15], off: [-0.25, 0.47], axis: -0.22, angle: -0.5 };
    mkItem(L, 'oar', 'Oar', [onDeck(-30, 0.4), onDeck(20, 0.35), { x: 2.3, y: 0, z: 1.7, flat: false }], { w: OAR_W, h: OAR_H, flat: true, icon: 'oar', held: oarHeld });
    mkItem(L, 'oar2', 'Oar', [onDeck(185, 0.3), onDeck(105, 0.3), { x: -1.3, y: 0, z: -2.3, flat: false }], { w: OAR_W, h: OAR_H, flat: true, icon: 'oar', held: oarHeld });
    const OARS = ['oar', 'oar2'];
    // where an oar knocked off the winch comes down: on the deck from near your feet out toward the winch (an oar that
    // long lies nowhere nearer it), or a little to the left of that if the other oar already lies there
    const oarLand = it => {
      const other = L.items.find(o => OARS.includes(o.id) && o !== it && !o.taken), at = deg => { const q = onDeck(deg, 0.3), p = L.pt(q.x, 0, q.z); return { x: p[0], y: 0, z: p[2] }; };
      const a = at(25);
      return other && other.flat && Math.hypot(other.x - a.x, other.z - a.z) < 0.6 ? at(-12) : a;
    };
    // the winch is chained and padlocked, and the key is in the tackle box
    Object.assign(s, { handleIn: false, locked: true, sealedN: false, sealedE: false, oars: 0, doorOpen: true, doorClosing: 0, doorClosed: false, doorA: 72 * DEG, crankA: 0 });
    // a green tackle box: shut, a solid box with its lid down; open, the lid thrown back and the trays folded out either side,
    // and the key on its orange float lying in front of it
    const boxC = [44, 116, 80], boxW = 0.52, boxH = 0.32;
    const box = mkContainer(L, {
      id: 'tacklebox', name: 'Tackle box', w: boxW, h: boxH, color: boxC, sfx: 'clunk',
      spot: [{ x: 1.9, y: 0.92, z: -2.0 }, { x: -2.2, y: 1.55, z: 0.6 }, { x: 2.0, y: 0, z: -1.6 }, { x: -1.5, y: 0.45, z: -1.2 }],
      closedText: 'A tackle box.', emptyText: 'Hooks and line. Nothing else.',
      // held by its bow between finger and thumb, the blade up and forward, the ring and the float hanging under the hand
      yields: [{ id: 'winchkey', name: 'Small key', opts: { w: 0.26, h: 0.26, tool: true, icon: 'winchKey', held: { grip: 'pinch', at: [-0.33, 0.56], angle: 2.62, scale: 1.25, tip: [-0.33, 0.07] } } }],
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
    // Open, a click on it again goes through it: the hand rummages in the trays, the hooks and lures rattle, and there is
    // nothing more in it (what you hold is lowered meanwhile)
    const boxClick = box.onClick;
    box.onClick = () => { const was = box.open, r = boxClick(); if (was) G.reach(box, { style: 'rattle', at: [0, 0.5], sfx: 'rattle', onTouch: () => { s.rummageT = L.t; } }); return r; };
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
        const rum = L.t - (s.rummageT === undefined ? -9 : s.rummageT), rj = rum >= 0 && rum < 0.6 ? 1 - rum / 0.6 : 0;   // gone through by hand: the lures jump in their wells
        (sx < 0 ? ['bob', 'spoon', 'jig'] : ['jig', 'bob', 'spoon']).forEach((kind, k) => {
          const x = x0 + 0.125 + k * 0.21 + rj * 0.03 * Math.sin(L.t * 47 + k * 2.1 + sx);
          ctx.save(); ctx.translate(0, rj * 0.025 * Math.abs(Math.sin(L.t * 39 + k * 1.7 + sx)));
          if (kind === 'bob') { // a red and white float
            P_ell(ctx, x, 0.9, 0.07, 0.07, P.col([228, 224, 212]));
            ctx.save(); ctx.beginPath(); ctx.rect(x - 0.08, 0.9, 0.16, 0.09); ctx.clip(); P_ell(ctx, x, 0.9, 0.07, 0.07, P.col([206, 44, 36])); ctx.restore();
            P_line(ctx, x, 0.96, x, 1.03, 0.016, P.col([40, 40, 40]));
          } else if (kind === 'spoon') { P_ell(ctx, x, 0.9, 0.045, 0.085, P.col([200, 202, 208]), 0.5); P_ell(ctx, x + 0.012, 0.91, 0.016, 0.036, P.col([150, 60, 46]), 0.5); }
          else { P_poly(ctx, [[x - 0.065, 0.83], [x + 0.065, 0.83], [x, 0.99]], P.col([226, 190, 50])); P_ell(ctx, x, 0.95, 0.032, 0.032, P.col([200, 60, 40])); }
          ctx.restore();
        });
      }
    }
    // the winch: unlock it, fit the handle, then crank the water door down. On the wall by the water door: a plate bolted to
    // the wall, a drum with the cable wound on it going up to the pulley, and under it the wheel that turns it, with the square
    // boss in its middle that the handle fits. Locked, a chain runs round the drum and down through the wheel to a padlock;
    // unlocked, the chain hangs loose off the side, the padlock open on it and the key's float hanging from the padlock; with
    // the handle on, the crank turns the wheel round a step at every turn. What you click is the drawing: the same size and place.
    // It is fixed flat on the wall (face: its front looks back into the boathouse), so it never turns with the view, and
    // what you click is the shape it covers.
    const need = 7, WS = 0.62, WX = 1.95, WY = 0.9, WZ = 2.5, WFACE = Math.PI;
    const winchArt = SC.sprite(L, WX, WY, WZ, WS, WS, (ctx, P) => { ctx.scale(WS, WS); drawWinch(ctx, P); }, { face: WFACE });
    // Tried before it will go, the winch answers in its own iron. A turn forced against the chain (the handle put on the
    // padlocked winch, or an oar knocked against it) snaps the chain taut: the padlock jumps on it and the wheel rocks a
    // little and back. A hand on the padlock rattles it on its chain. A hand on the wheel with no handle moves it a hair
    // and no further. joltT, rattleT and nudgeT are when each began (the night's clock); snapTaut() snaps it.
    Object.assign(s, { joltT: -9, rattleT: -9, nudgeT: -9 });
    const decay = (t0, rate) => { const a = L.t - t0; return a >= 0 && a < 0.8 ? Math.exp(-a * rate) * Math.min(1, a / 0.03) : 0; };
    const snapTaut = () => { s.joltT = L.t; G.shake(0.04); };
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
      const jk = decay(s.joltT, 6), nk = decay(s.nudgeT, 5), rat = L.t >= s.rattleT && L.t < s.rattleT + 0.5 ? 1 - (L.t - s.rattleT) / 0.5 : 0;
      const turn = -(s.crankA + Math.PI * 0.8) - jk * 0.2 * Math.cos((L.t - s.joltT) * 22) - nk * 0.17 * Math.sin(Math.min(Math.PI, (L.t - s.nudgeT) * 9));
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
      if (s.locked || s.keyGoing) {
        // round the drum, down through the wheel either side, and the padlock where the two ends meet
        // (snapped taut, the padlock is pulled up and swings; rattled, it shakes on the chain)
        const lx = jk * 0.016 * Math.sin((L.t - s.joltT) * 48) + rat * 0.04 * Math.sin(L.t * 57), ly = jk * 0.05 + rat * 0.03 * Math.abs(Math.sin(L.t * 43));
        links(-0.25, 0.76 + jk * 0.006, 0.25, 0.76 + jk * 0.006, 8); links(-0.22, 0.72, -0.03 + lx, 0.21 + ly, 9); links(0.22, 0.72, 0.03 + lx, 0.21 + ly, 9);
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(lx * 6); ctx.scale(0.27, 0.27); ICONS.padlock(ctx, P); ctx.restore();
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
    // where things go on it, across and up the drawing: the padlock, and the square boss in the middle of the wheel; and the
    // point each thing leads with, in its icon: the handle's socket, the oar's grip end
    const AT = { lock: [0, 0.1], boss: [0, 0.36] }, TIP = { handle: [-0.35, 0.145], oar: [-0.02, 0.06] };
    const lockPt = (() => { const p = L.pt(WX, WY + WS * 0.1, WZ); return { x: p[0], y: p[1], z: p[2], w: 0, h: 0 }; })();
    const unlock = () => {
      s.locked = false; winch.accepts = ['handle'];
      // the key stays in the padlock (the hand puts it in and lets go of it there); the slot it leaves goes to the handle
      // if you have it, not to whatever came after the key
      const k = G.inv.find(i => i.id === 'winchkey');
      // (the padlock springs open, with its click and the chain sliding off, as the key gets there: see L.update)
      if (k) { G.thrust(lockPt, k, true); s.keyGoing = { k, t: L.t }; G.removeFromInv(k); const h = G.inv.findIndex(i => i.id === 'handle'); if (h >= 0) G.active = h; }
      else springOpen();
      G.say('The padlock opens and the chain comes off the drum.', 'The padlock is open. The chain is off the drum.');
    };
    function springOpen() { s.keyGoing = null; AUDIO.sfx('lock'); setTimeout(() => AUDIO.sfx('chain'), 200); }
    const keyThere = () => { const th = G.hand.thrust, g = s.keyGoing; return !(th && th.item === g.k && (th.wait !== undefined || th.t < th.dur * 0.45)) || L.t - g.t > 1.2; };
    // clicked again while the hand is still there, it goes again (the reach only stays on for another go)
    const again = (rc, key) => { if (rc && rc.more) s[key] = L.t; };
    // a thing it does not take, knocked against it: it comes back to the hand (end first, at the wheel)
    const knock = (item, onHit) => G.fumble(item, winch, { preset: 'return', at: AT.boss, tip: TIP[item.id], sfx: { hit: s.locked ? 'chain' : 'tink' }, onHit });
    const winch = mkTarget(L, {
      id: 'winch', name: 'Winch', x: WX, y: WY, z: WZ, w: WS, h: WS, face: WFACE, accepts: ['handle', 'winchkey'],
      hint() { return winch.done ? 'The door is down.' : s.locked ? 'The winch. A chain through the drum, and a padlock on it.' : !s.handleIn ? 'The winch. Its handle is gone.' : 'Crank it. ' + Math.max(0, need - Math.floor(winch.count || 0)) + ' more.'; },
      onClick() {
        // with the key on you, the padlock comes first, whatever is in your hand
        if (s.locked && G.hasItem('winchkey')) { unlock(); return true; }
        // an oar, its grip end jammed at the boss: it will not go in, slips and clatters to the deck, to be picked up again
        const held = G.inv[G.active];
        if (!s.handleIn && held && OARS.includes(held.id)) {
          if (G.fumbling && G.fumbling.from === held) return true;   // (on its way there already)
          G.toast('It does not fit the winch.');
          if (!G.fumble(held, winch, { preset: 'bump', at: AT.boss, tip: TIP.oar, land: oarLand(held), sfx: { hit: 'woodKnock', land: 'clatter' } })) AUDIO.sfx('nope');
          return true;
        }
        // with nothing it takes, say what is wrong with it, and show it: locked, the hand rattles the padlock on its chain
        // (or what you hold knocks the chain taut); unlocked, the hand takes the wheel and it will not turn without its handle
        if (!s.handleIn && !winch.accepts.some(id => G.hasItem(id))) {
          const act = G.inv[G.active];
          if (s.locked) {
            G.say('The winch. A chain through the drum, and a padlock on it.', 'The winch is chained, and the chain is padlocked.');
            if (act) knock(act, snapTaut); else again(G.reach(winch, { style: 'rattle', at: AT.lock, sfx: 'chain', onTouch: () => { s.rattleT = L.t; } }), 'rattleT');
          } else {
            G.say('The winch. Its handle is gone.', 'The winch has no handle.');
            if (act) knock(act, () => { s.nudgeT = L.t; }); else again(G.reach(winch, { style: 'pull', at: AT.boss, sfx: 'clunk', onTouch: () => { s.nudgeT = L.t; } }), 'nudgeT');
          }
          return true;
        }
        return false;
      },
      use(item) {
        if (item.id === 'winchkey') { unlock(); return true; }
        if (item.id !== 'handle') return false;
        // the handle goes on the boss and is leaned on: the chain snaps taut, the padlock jumps, and it comes off again
        if (s.locked) { G.say('The drum is chained and padlocked. It will not turn.', 'It will not turn. There is a padlock on the chain.'); return G.refuse({ preset: 'return', at: AT.boss, tip: TIP.handle, scale: 0.75, sfx: { hit: 'chain' }, onHit: snapTaut }); }
        s.handleIn = true; winch.accepts = [];
        winch.crank = { n: need, sfx: 'ratchet', onTurn() { G.shake(0.05); }, onComplete() { s.sealedN = true; AUDIO.sfx('bar'); G.say('The water door is down.', 'The water door is down.'); } };
        AUDIO.sfx('fit'); G.say('The handle fits. Crank it.', 'The handle is on the winch.'); return true;
      },
    });
    // the side door: close it, then bar it with both oars. A closed door on its own only slows it down, and one oar across
    // it is not enough: it breaks it (L.onReach).
    // Open, the hand reaches out for the leaf's edge and pulls it to. While it is still swinging shut, an oar put up to the
    // brackets gets there before the leaf does (the leaf slows as it comes): the leaf comes round into it with a thud and
    // swings back a little, and the oar is knocked back into your hands; then the leaf goes on and shuts (anything else in
    // hand, the hand only helps it shut). Shut, an oar goes across the brackets, then the other on top of it. Shut and not
    // barred, or barred, an empty hand pushes on it and it holds.
    const leafEdge = (() => { const p = L.pt(3.25, 1.05, -0.27); return { x: p[0], y: p[1], z: p[2] }; })();
    const LEVEL = -1.3;   // the turn that brings the oar's icon (drawn slanting, on its tall card) level, across the brackets
    const knockedBack = () => ({ preset: 'bounce', drop: false, at: [0, 0.51], angle: LEVEL, sfx: { hit: 'woodKnock' },   // held level, across the brackets
      onHit: () => { if (s.doorClosing > 0) { s.doorClosing = Math.min(0.9, s.doorClosing + 0.2); AUDIO.sfx('thud'); G.shake(0.1); } s.leafSlow = false; },
      onDone: () => { s.leafSlow = false; } });
    const sd = mkTarget(L, {
      id: 'sidedoor', name: 'Side door', x: 2.36, y: 0, z: 0, w: 1.25, h: 2.1, accepts: OARS.slice(), reach: 'push',
      hint() { return s.sealedE ? 'Barred with both oars.' : s.doorOpen ? 'The side door stands open.' : s.doorClosing > 0 ? 'Swinging shut.' : s.oars === 1 ? 'One oar across. It needs the other.' : 'Shut. Both oars across the brackets would hold it.'; },
      onClick() {
        if (s.doorOpen) { s.doorOpen = false; s.doorClosing = 0.9; AUDIO.sfx('creak'); G.reach(sd, { style: 'pull', at: leafEdge }); return true; }
        if (s.doorClosing > 0) {
          G.say('Wait for it to shut.', 'The door is still swinging shut.');
          const act = G.inv[G.active];
          if (act && OARS.includes(act.id)) { if (G.fumble(act, sd, knockedBack())) s.leafSlow = true; } else G.reach(sd, 'push');   // (a click more while it is on its way leaves the leaf slowed)
          return true;
        }
        return false;
      },
      use(item) {
        if (s.doorOpen || s.doorClosing > 0) { G.say('Shut it first.', 'The side door is standing open.'); return G.refuse(knockedBack()); }
        s.oars++; sd.accepts = sd.accepts.filter(id => id !== item.id); AUDIO.sfx('bar');
        if (s.oars < 2) { G.say('The oar drops into the brackets. One will not hold it: it needs the other on top.', 'One oar is across the side door.'); return true; }
        s.sealedE = true; sd.done = true; sd.accepts = []; G.say('The second oar goes across on top of the first. That will hold.', 'Both oars are across the side door.'); return true;
      },
    });
    glowWith(winch, [winchArt]);
    // the brackets are part of the door: clicking either does what clicking the door does (shuts it, or puts an oar
    // across), and pointing at one lights the door as the target, the brackets with it: an invisible face over each
    // cradle, a little proud of it (the leaf and the oars glow with them, L.dynamic)
    glowWith(sd, brackets);
    const grips = [-0.74, 0.74].map(zc => SC.mkWallV(L, 2.2, zc - 0.12, 2.2, zc + 0.12, 0.86, 1.31, [0, 0, 0], { invisible: true, hit: { kind: 'target', ref: sd }, sortDist: 2.05 }));
    // both ways must be shut
    L.sealed = lane => (lane.idx === 0 ? s.sealedN : s.sealedE);
    L.isWon = () => s.sealedN && s.sealedE;
    L.objectiveText = () => {
      const n = s.sealedN ? 'Water door down.' : (s.locked ? 'Unlock the winch. ' : '') + (!s.handleIn ? (G.hasItem('handle') ? 'Put the handle on the winch.' : 'Find the winch handle.') : 'Crank the water door down (' + Math.min(need, Math.floor(winch.count || 0)) + '/' + need + ').');
      const e = s.sealedE ? 'Side door barred.' : s.doorOpen ? 'Shut the side door and bar it with both oars.' : s.oars === 1 ? 'Put the other oar across the side door.' : 'Bar the side door with both oars.';
      return n + ' ' + e;
    };
    const panOf = yaw => Math.sin(wrapPi(yaw - G.cam.yaw)) * 0.85;
    // ---- the way round ----
    // Held at a way you have shut, after a moment it goes round to one still open (the game moves it there, 3 m out). It
    // goes under at the shut one, swims round out of sight, comes up off to one side of the open one and swims across into
    // it side on, from the side it came round by (the north-east corner: from your left at the side door, from your right
    // at the water door), closing on it a little as it comes (going round costs you less time than it costs it); then it
    // turns to the door and comes on. Its early change of mind, unseen, is only a dive: it comes up on the new way.
    L.onLaneSwitch = (c, ln) => {
      c.diveT = -10;   // no rings on the new way, where it did not go under
      if (!s.wasHeld) { if (c.mode === 'up') { c.mode = 'down'; c.modeT = 0; } return; }
      const ap = ln.apertures[0], out = Math.max(Math.abs(ap.x0), Math.abs(ap.x1)) * c.dist / ap.z + 0.9;   // wholly out of the doorway's view, wake and all
      s.swim = { t: 0, side: ln.idx === 1 ? -1 : 1, out, across: 0.55 + out * 0.22, d0: c.dist, strokes: 0, up: false };
      c.hold = c.dist; c.mode = 'down'; c.modeT = 0; c.runLat = s.swim.side * out;
    };
    const swimRound = (c, dt) => {
      const sw = s.swim, T1 = 0.7, T2 = T1 + sw.across;
      sw.t += dt;
      if (L.won || sw.t >= T2) {   // across: it turns to the door and comes on (or the night is won, and the aftermath has it)
        c.runPose = false; c.runLat = 0; s.swim = null;
        c.hold = null; c.u = clamp(1 - Math.pow(c.dist / c.D0, 1 / c.gamma), 0, 0.995);   // on from where it has got to
        if (!L.won) { c.mode = 'up'; c.modeT = 0; }
        return;
      }
      if (sw.t < T1) { c.mode = 'down'; c.modeT = 0; return; }   // under the water, going round
      if (!sw.up) { sw.up = true; c.surfaced = L.t; AUDIO.sfx('splash', panOf(c.yaw)); }
      c.mode = 'up'; c.modeT = 0; c.runPose = true; c.runDir = -sw.side;
      c.runGait = (c.runGait || 0) + dt * 7.5;
      const k = 1 - Math.pow(1 - (sw.t - T1) / sw.across, 2);   // slowing as it comes into the doorway
      c.runLat = sw.side * sw.out * (1 - k); c.hold = sw.d0 - 0.8 * k;
      const n = Math.floor(c.runGait / Math.PI);   // a hand going in
      if (n !== sw.strokes) { sw.strokes = n; AUDIO.sfx('slosh', panOf(c.yaw + Math.atan2(c.runLat, c.dist))); }
    };
    // ---- after the win: it throws itself at the door ----
    // It comes on to the door it was coming for, fast now and under the water, and throws itself at it: blow on blow,
    // quicker and quicker, the boards jumping and bowing in at the bottom where it hits, water bursting in under them and
    // through the gaps, the oars jumping in their brackets, the lamp swinging; then one last blow, and it lets go and goes
    // under. [time after it reaches the door, how hard]
    const BLOWS = [[0, 1], [0.48, 0.8], [0.9, 0.95], [1.24, 0.8], [1.52, 0.9], [1.78, 0.8], [2.02, 1], [2.24, 0.85], [2.44, 0.95], [2.64, 0.9], [3.22, 1.35]];
    const LETGO = 3.75, DONE = 4.4, fx = mulberry32(64);
    Object.assign(s, { jolts: [], drops: [], splats: [], surges: [], wet: 0, swing: 0, swingT: 0 });
    const blow = (a, k) => {
      const c = L.creature, side = a.door === 1, x = (fx() - 0.5) * (side ? 0.5 : 1.6);   // where it lands, across the door
      s.jolts.push({ t: L.t, k, x });
      s.surges.push({ t: L.t, k, x });
      AUDIO.sfx('wetPound', panOf(c.yaw)); if (a.n % 2 === 0 || k > 1) AUDIO.sfx('slosh', panOf(c.yaw));
      G.shake(0.38 + 0.32 * k);
      s.swingT = Math.min(0.16, s.swingT + 0.05 * k); s.wet = Math.min(1, s.wet + 0.18 * k);
      // the water it drives in: most of it in under the door, some through the gaps higher up
      for (let i = 0, n = Math.round(12 + 12 * k); i < n; i++) {
        const across = x + (fx() - 0.5) * (side ? 0.7 : 1.4), up = fx() < 0.75 ? 0.02 + fx() * 0.08 : 0.15 + fx() * 0.7;
        const sp = 0.8 + fx() * 1.6 * k, lift = 0.6 + fx() * 2.2, drift = (fx() - 0.5) * 1.4, r = 0.004 + fx() * 0.009;
        if (side) s.drops.push({ x: 2.33, y: up, z: clamp(across, -0.5, 0.5), vx: -sp, vy: lift, vz: drift, r });
        else s.drops.push({ x: clamp(across, -1.45, 1.45), y: up, z: 2.5, vx: drift, vy: lift, vz: -sp, r });
      }
    };
    L.aftermath = t => {
      const c = L.creature;
      let a = s.after;
      if (!a) {
        // the first blow waits for the view to come round to the door, if it has far to turn
        a = s.after = { door: c.lane.idx, n: 0, wait: 0.35 + 0.55 * clamp(Math.abs(wrapPi(c.yaw - G.cam.yaw)) / (Math.PI / 2), 0, 1) };
        if (a.door === 1) L.text.win = 'It threw itself at the side door until the tide turned, and the oars held. When you looked again the water was flat all the way out.';
        // still out on the water: it comes on fast now, under it, so the blows start in a second or two
        const barrier = c.lane.barrierDist, far = c.dist - barrier;
        // a close finish, with it already under the door's line as the last slat came down or the door shut on it (the game
        // holds it where it is): it is out on the water side of the door now, where it throws itself at it, not in the room
        if (far < 0) { c.dist = barrier; if (s.heldC === c) { s.heldC = null; s.holdT = 0; } c.hold = null; }
        if (far > 0.05) {
          const v = Math.max(5, far / 1.4);
          c.hold = null; c.distFn = (cr, dt) => Math.max(Math.min(cr.dist, barrier), cr.dist - dt * v);
          if (far > 3) AUDIO.sfx('splash', panOf(c.yaw));
        }
      }
      if (a.arrive === undefined && (c.dist <= c.lane.barrierDist + 0.05 || t > 2.5)) a.arrive = Math.max(t, a.wait);   // and never on the same beat as the bar going across
      if (a.arrive === undefined) return false;
      const since = t - a.arrive;
      while (a.n < BLOWS.length && since >= BLOWS[a.n][0]) { blow(a, BLOWS[a.n][1]); a.n++; }
      if (since >= LETGO && !a.gone) { a.gone = true; AUDIO.sfx('dive', panOf(c.yaw)); s.surges.push({ t: L.t, k: 0.3, x: 0 }); }   // it lets go: the water slops in once more as it goes down
      return since >= DONE;
    };
    // the win camera watches the door it is at, low, where it hits and where the water comes in (no lower: the view would
    // read as looking down)
    L.watchPoint = () => { const p = L.creature.lane.idx === 1 ? L.pt(2.4, 0.72, 0) : L.pt(0, 0.62, 2.58); return { x: p[0], y: p[1], z: p[2] }; };
    // how far a blow has driven the door in at a point across it, now: in hard, then springing back, shuddering
    const jolt = across => {
      let d = 0;
      for (const j of s.jolts) {
        const tau = L.t - j.t; if (tau < 0) continue;
        const e = tau < 0.035 ? tau / 0.035 : Math.exp(-(tau - 0.035) * 7) * (0.7 + 0.3 * Math.cos((tau - 0.035) * 30));
        d += j.k * e * (0.45 + 0.55 * Math.exp(-Math.pow((across - j.x) / 0.55, 2)));
      }
      return Math.min(d, 1.5);
    };
    const rattle = () => { let r = 0; for (const j of s.jolts) { const tau = L.t - j.t; if (tau >= 0) r += j.k * Math.exp(-tau * 12); } return Math.min(r, 1.5); };
    L.update = dt => {
      if (s.keyGoing && keyThere()) springOpen();
      if (s.snapAt !== undefined && L.t >= s.snapAt && !L.won) snapOar();
      if (s.holdT > 0) { s.holdT -= dt; if (s.holdT <= 0 && s.heldC) { s.heldC.hold = null; s.heldC = null; } }
      s.crankA += ((winch.count || 0) * 1.3 - s.crankA) * (1 - Math.exp(-dt * 12));   // the crank goes round smoothly to where it was turned
      if (s.doorClosing > 0) { s.doorClosing -= dt * (s.leafSlow ? 0.25 : 1); s.doorA = 72 * DEG * Math.pow(clamp(s.doorClosing / 0.9, 0, 1), 1.3); if (s.doorClosing <= 0) { s.doorA = 0; s.doorClosed = true; AUDIO.sfx('thud'); G.shake(0.12); } }
      const c = L.creature;
      if (s.swim) swimRound(c, dt);
      s.wasHeld = !!c.sealHold;   // read by L.onLaneSwitch, which the game calls after this, when it sends it round
      // the water it throws in: flying, then splashing down on the deck
      for (let i = s.drops.length - 1; i >= 0; i--) {
        const d = s.drops[i];
        d.vy -= 9.8 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
        if (d.y <= 0.012) { s.splats.push({ x: d.x, z: d.z, t: L.t, r: d.r * 2.5 }); s.drops.splice(i, 1); }
      }
      s.splats = s.splats.filter(p => L.t - p.t < 0.6);
      s.jolts = s.jolts.filter(j => L.t - j.t < 1.5);
      s.surges = s.surges.filter(j => L.t - j.t < 1.8);
      s.swing += (s.swingT - s.swing) * (1 - Math.exp(-dt * 3)); s.swingT *= Math.exp(-dt * 0.4);
    };
    L.deathCause = c => (c.lane.idx === 1 ? (s.snap ? 'oneoar' : 'side') : null);
    // a shut, unbarred door really does slow it: it bangs the door open and stands in it for a moment, long enough to shut and
    // bar it. With one oar across it, it throws itself at the door once, the door jumps on the oar, and at the second blow the
    // oar snaps and the door bursts open (L.update), and it comes on in
    L.onReach = c => {
      if (c.lane.idx !== 1 || !s.doorClosed || s.sealedE) return;
      if (s.oars === 1) { AUDIO.sfx('wetPound', panOf(c.yaw)); G.shake(0.5); c.hold = c.dist; s.heldC = c; s.holdT = 0.7; s.snapAt = L.t + 0.6; return; }
      s.doorOpen = true; s.doorClosed = false; s.doorA = 72 * DEG; AUDIO.sfx('bang'); G.shake(0.5); G.toast('The side door bangs open.'); c.hold = c.dist; s.heldC = c; s.holdT = 2.5;
    };
    const snapOar = () => {
      s.snapAt = undefined; s.snap = { t: L.t }; s.oars = 0;
      s.doorOpen = true; s.doorClosed = false; s.doorA = 72 * DEG;
      AUDIO.sfx('wetPound', panOf(L.creature.yaw)); AUDIO.sfx('crack'); AUDIO.sfx('bang'); G.shake(0.8);
    };
    const lampX = () => Math.sin(L.t * 1.9) * (0.55 + s.swing);   // the blows on the door set it swinging harder
    // the oars across the inside of the shut side door, in its brackets, the second on top of the first: a little into the
    // room from the leaf (x 2.4) and the frame (2.35), and drawn after both and before the brackets' lips (see the brackets
    // above), the upper one after the lower. Each is a round loom with its grip at one end and its flat blade at the other,
    // laid against the wall past a bracket, the second the other way round. A blow on the door drives them in against the
    // brackets' straps (dx) and makes them jump in them (dy)
    const oarC = [126, 98, 62], R0 = 0.03, GRIP = 1.1, NECK = 0.86, TIPZ = 1.45;
    const oarY = i => 0.955 + R0 + i * 2 * R0;
    const oarAt = (i, dx, dy) => {
      const dir = i ? -1 : 1, yc = oarY(i) + dy, x = 2.24 - dx, sd0 = 2.226 - i * 0.02, zg = -dir * GRIP, zn = dir * NECK, zt = dir * TIPZ;
      return [
        SC.mkQuad(L, [x, yc + R0, zg], [x + 0.07, yc + R0, zg], [x + 0.07, yc + R0, zn], [x, yc + R0, zn], scalec(oarC, 1.2), { sortDist: sd0 }),   // the top of the loom
        SC.mkWallV(L, x, zg, x, zn, yc - R0, yc + R0, oarC, { sortDist: sd0 - 0.002 }),                                                                 // its face
        SC.mkWallV(L, x - 0.002, zg, x - 0.002, zn, yc - R0, yc - R0 + 0.012, scalec(oarC, 0.6), { sortDist: sd0 - 0.004 }),                            // its shadowed underside
        SC.mkWallV(L, x - 0.003, zg, x - 0.003, zg + dir * 0.16, yc - R0 * 0.8, yc + R0 * 0.8, scalec(oarC, 0.7), { sortDist: sd0 - 0.006 }),          // the worn grip
        SC.mkQuad(L, [x + 0.02, yc - R0, zn], [x + 0.02, yc - 0.085, zn + dir * 0.3], [x + 0.02, yc + 0.085, zn + dir * 0.3], [x + 0.02, yc + R0, zn], scalec(oarC, 1.05), { sortDist: sd0 - 0.003 }),   // the blade, flaring
        SC.mkQuad(L, [x + 0.02, yc - 0.085, zn + dir * 0.3], [x + 0.02, yc - 0.07, zt], [x + 0.02, yc + 0.07, zt], [x + 0.02, yc + 0.085, zn + dir * 0.3], scalec(oarC, 1.05), { sortDist: sd0 - 0.003 }),
        SC.mkWallV(L, x + 0.018, zn, x + 0.018, zt - dir * 0.03, yc - 0.006, yc + 0.006, scalec(oarC, 0.72), { sortDist: sd0 - 0.005 }),                 // its ridge
      ];
    };
    const oarsAt = (dx, dy) => { const out = []; for (let i = 0; i < s.oars; i++) out.push(...oarAt(i, dx, dy)); return out; };
    // the one oar, snapped: the two halves drop off the brackets onto the deck inside, the broken ends first
    const snapped = () => {
      const tau = L.t - s.snap.t, fall = 4.9 * tau * tau, yc = oarY(0), x = 2.24 - Math.min(0.5, tau * 0.9), out = [];
      if (tau > 4) return out;
      // [its outer end, the broken end, how wide it is at the outer end (the blade's half is a blade there)]
      for (const [zo, zb, wo] of [[-GRIP, -0.02, R0], [TIPZ, 0.03, 0.07]]) {
        const yo = Math.max(0.03, yc - fall * 0.75), yb = Math.max(0.03, yc - fall * 1.1), out1 = Math.sign(zo);
        out.push(SC.mkQuad(L, [x, yo - wo, zo], [x, yb - R0, zb], [x, yb + R0, zb], [x, yo + wo, zo], oarC, { sortDist: 2.2 }));
        out.push(SC.mkQuad(L, [x - 0.002, yb - R0, zb], [x - 0.002, yb + R0, zb], [x - 0.002, yb + 0.05, zb - out1 * 0.07], [x - 0.002, yb - 0.01, zb - out1 * 0.12], scalec(oarC, 1.35), { sortDist: 2.19 }));   // the splintered end
      }
      return out;
    };
    // a door being pounded is drawn in pieces so it can bow; each piece is lit, fogged and ordered as the whole board it is
    // part of, so no seams of light show between them and it sorts where the whole board did
    const asWhole = (q, pts) => {
      let d = 0, cx = 0, cy = 0, cz = 0;
      for (const p of pts) { const w = L.pt(p[0], p[1], p[2]); d += Math.hypot(w[0], w[2]); cx += w[0]; cy += w[1]; cz += w[2]; }
      return Object.assign(q, { dist: d / pts.length, cx: cx / pts.length, cy: cy / pts.length, cz: cz / pts.length });
    };
    const slatX = [-1.5, -1.125, -0.75, -0.375, 0, 0.375, 0.75, 1.125, 1.5], leafZ = [-0.55, -0.33, -0.11, 0.11, 0.33, 0.55], leafY = [0, 0.25, 0.5, 0.75, 1.0, 1.3, 1.65, 2.08];
    const leafBow = y => (y < 1.08 ? 0.16 + 0.84 * Math.pow(1 - y / 1.08, 1.3) : 0.16 + 0.22 * Math.sin(Math.PI * Math.min(1, (y - 1.08) / 1.0)));   // the oars hold it at its middle
    // the water it has driven in, on the deck inside the door: a tongue spreading in from under it at each blow, its edge
    // white, and the boards darkening where it has been. foot(u) is where the door meets the deck u metres across it, as
    // it bows; at(u, d) the point on the deck d metres in from there, and along(a, b) the door's foot from a to b, which
    // closes each shape so nothing of it lies under the bowed door
    const wash = (door, foot) => {
      const side = door === 1, at = (u, d) => (side ? [foot(u) - d, 0.014, u] : [u, 0.014, foot(u) - d]);
      const along = (a, b) => { const out = []; for (let i = 1; i < 8; i++) out.push(at(lerp(a, b, i / 8), 0)); return out; };
      const poly = (pts, color, alpha, o) => Object.assign({ kind: 'poly', pts: pts.map(p => L.pt(p[0], p[1], p[2])), color, alpha }, o || {});
      if (s.wet > 0.01) {   // where it has been
        const half = side ? 0.85 : 1.45, deep = side ? 0.75 : 0.95, pts = [];
        for (let i = 0; i <= 10; i++) { const u = -1 + i / 5; pts.push(at(u * half, deep * (1 - u * u * 0.55) * (0.92 + 0.08 * Math.sin(i * 2.1)))); }
        pts.push(at(half, 0), ...along(half, -half), at(-half, 0));
        R.add(poly(pts, [12, 16, 20], 0.32 * s.wet));
      }
      const lim = side ? 0.55 : 1.5, wide = side ? 1.0 : 1.5;   // it comes in under the door, and spreads out once it is in
      for (const j of s.surges) {
        const tau = L.t - j.t, k = j.k, grow = easeOut(tau / 0.45), reach = (0.3 + 0.5 * k) * grow, fade = clamp(1 - tau / 1.4, 0, 1);
        if (reach < 0.02 || fade <= 0) continue;
        const half = ((side ? 0.32 : 0.6) + 0.25 * k) * (1 + 0.45 * grow), a0 = clamp(j.x - half, -lim, lim), a1 = clamp(j.x + half, -lim, lim), front = [];
        for (let i = 0; i <= 16; i++) {   // a ragged front, lobed where it runs on between the boards
          const u = -1 + i / 8, lobe = 0.9 + 0.07 * Math.sin(i * 0.9 + j.x * 9) + 0.03 * Math.sin(i * 2.1 + tau * 3);
          front.push(at(clamp(clamp(j.x + u * half, -lim, lim) + u * (wide - lim) * grow * 0.8, -wide, wide), reach * Math.sqrt(Math.max(0, 1 - u * u)) * lobe));
        }
        R.add(poly(front.concat(along(a1, a0)), [70, 92, 106], 0.26 * fade));
        if (tau < 0.8) R.add(poly(front, [176, 194, 204], 0.5 * (1 - tau / 0.8), { stroke: true, lw: 0.01 }));
      }
    };
    L.dynamic = () => {
      const pounding = s.after && s.jolts.length ? s.after.door : -1;
      // the water door: slats come down from the top as the winch turns. Pounded, the slats bow in at the bottom, where it
      // hits from the water, and jump in their runners
      const covered = 2.4 * clamp((winch.count || 0) / need, 0, 1);
      const bowN = pounding === 0 ? slatX.map(x => 0.17 * jolt(x) * Math.cos(Math.PI * x / 3.04)) : null, rat = pounding >= 0 ? rattle() : 0;
      const zN = (i, y) => 2.58 - (bowN ? bowN[i] * Math.exp(-y / 0.85) : 0);
      for (let y = 2.4; y > 2.4 - covered; y -= 0.3) {
        const y0 = Math.max(y - 0.3, 2.4 - covered), col = (Math.round(y / 0.3) % 2) ? [80, 72, 60] : [70, 62, 52];
        if (!bowN) { R.add(SC.mkQuad(L, [-1.5, y0, 2.58], [1.5, y0, 2.58], [1.5, y, 2.58], [-1.5, y, 2.58], col)); continue; }
        const dy = rat * 0.012 * Math.sin(L.t * 47), whole = [[-1.5, y0, 2.58], [1.5, y0, 2.58], [1.5, y, 2.58], [-1.5, y, 2.58]];
        for (let i = 0; i < 8; i++) {
          const x1 = slatX[i + 1] + (i < 7 ? 0.02 : 0);   // a little over the next piece, so no seam shows between them
          R.add(asWhole(SC.mkQuad(L, [slatX[i], y0 + dy, zN(i, y0)], [x1, y0 + dy, zN(i + 1, y0)], [x1, y + dy, zN(i + 1, y)], [slatX[i], y + dy, zN(i, y)], col), whole));
        }
      }
      if (covered > 0.05) {
        const yb = 2.4 - covered;
        if (!bowN) R.add(SC.mkQuad(L, [-1.52, yb, 2.575], [1.52, yb, 2.575], [1.52, yb + 0.06, 2.575], [-1.52, yb + 0.06, 2.575], [40, 40, 44]));
        else for (let i = 0; i < 8; i++) R.add(asWhole(SC.mkQuad(L, [slatX[i], yb, zN(i, yb) - 0.005], [slatX[i + 1], yb, zN(i + 1, yb) - 0.005], [slatX[i + 1], yb + 0.06, zN(i + 1, yb + 0.06) - 0.005], [slatX[i], yb + 0.06, zN(i, yb + 0.06) - 0.005], [40, 40, 44]), [[-1.52, yb, 2.575], [1.52, yb, 2.575], [1.52, yb + 0.06, 2.575], [-1.52, yb + 0.06, 2.575]]));
      }
      if (pounding === 0) wash(0, u => 2.57 - 0.17 * jolt(u) * Math.cos(Math.PI * u / 3.04));
      // the side door leaf, swung out over the water or shut in its frame, and the oars. Pounded, the leaf bows in at the
      // bottom where it hits and above the oars, the oars holding it at its middle, and they are driven in and jump
      const hx = 2.4, hz = -0.55, a = s.doorA, ex = hx + Math.sin(a) * 1.1, ez = hz + Math.cos(a) * 1.1;
      R.glowAs(sd);
      if (pounding === 1 && a === 0) {
        const bowE = leafZ.map(z => 0.1 * jolt(z) * Math.cos(Math.PI * z / 1.14)), xE = (i, y) => hx - bowE[i] * leafBow(y);
        const whole = [[hx, 0, hz], [ex, 0, ez], [ex, 2.08, ez], [hx, 2.08, hz]];
        for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) {
          const z1 = leafZ[i + 1] + (i < 4 ? 0.015 : 0), y0 = leafY[j], y1 = leafY[j + 1] + (j < 6 ? 0.015 : 0);
          R.add(asWhole(SC.mkQuad(L, [xE(i, y0), y0, leafZ[i]], [xE(i + 1, y0), y0, z1], [xE(i + 1, y1), y1, z1], [xE(i, y1), y1, leafZ[i]], [64, 52, 40]), whole));
        }
        for (const yy of [0.5, 1.5]) for (let i = 0; i < 5; i++) {
          const z0 = Math.max(leafZ[i], -0.53), z1 = Math.min(leafZ[i + 1] + (i < 4 ? 0.015 : 0), 0.53), ym = yy + 0.025;
          R.add(asWhole(SC.mkQuad(L, [xE(i, ym) - 0.003, yy, z0], [xE(i + 1, ym) - 0.003, yy, z1], [xE(i + 1, ym) - 0.003, yy + 0.05, z1], [xE(i, ym) - 0.003, yy + 0.05, z0], [44, 36, 28]), [[hx, yy, -0.53], [hx, yy, 0.53], [hx, yy + 0.05, 0.53], [hx, yy + 0.05, -0.53]]));
        }
        for (const q of oarsAt(Math.min(0.04, 0.1 * jolt(0) * leafBow(1.08) * 1.6), 0.018 * rat * Math.abs(Math.sin(L.t * 41)))) R.add(q);
        R.glowAs(null); wash(1, u => Math.min(hx - 0.02 - 0.1 * jolt(u) * Math.cos(Math.PI * u / 1.14), 2.38 - Math.max(0, Math.abs(u) - 0.5) * 0.6));   // in front of the frame either side
      } else {
        R.add(SC.mkWallV(L, hx, hz, ex, ez, 0, 2.08, [64, 52, 40]));
        for (const yy of [0.5, 1.5]) R.add(SC.mkWallV(L, hx + Math.sin(a) * 0.02, hz + Math.cos(a) * 0.02, ex - Math.sin(a) * 0.02, ez - Math.cos(a) * 0.02, yy, yy + 0.05, [44, 36, 28]));
        for (const q of oarsAt(0, 0)) R.add(q);
      }
      if (s.snap) for (const q of snapped()) R.add(q);
      R.glowAs(null);
      for (const q of grips) R.add(q);
      // the water flying in, and where it lands
      for (const d of s.drops) {
        const r = d.r, sp = Math.hypot(d.vx, d.vy, d.vz), long = 1 + Math.min(3, sp * 0.6);
        R.add(SC.mkSprite(L, d.x, d.y, d.z, r * 2, r * 2 * long, (ctx, P) => P_ell(ctx, 0, r * long, r, r * long, P.cola([178, 198, 208], 0.6))));
      }
      for (const p of s.splats) {   // a ring on the deck (a decal runs away from the eye from its base: it starts half a ring nearer)
        const k = clamp((L.t - p.t) / 0.6, 0, 1), w = p.r * (1 + k * 1.5), wp = L.pt(p.x, 0, p.z);
        R.add({ kind: 'sprite', x: wp[0] - Math.sin(G.cam.yaw) * w / 2, y: 0.016, z: wp[2] - Math.cos(G.cam.yaw) * w / 2, w, h: w, flat: true, draw: (ctx, P) => { ctx.scale(w, w); ctx.strokeStyle = P.cola([200, 214, 222], 0.55 * (1 - k)); ctx.lineWidth = 0.08; ctx.beginPath(); ctx.ellipse(0, 0.5, 0.45, 0.45, 0, 0, TAU); ctx.stroke(); } });
      }
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
      // out beyond the water door it is behind the slats, which by their middles come out nearer than it does: while it
      // is out there and any are down it is drawn before them, so they hide it
      const cp = L.rend && L.rend.get(c);
      if (cp) cp.sortDist = c.lane.idx === 0 && covered > 0.05 && c.dist > 2.62 && !c.lunge ? Math.max(Math.hypot(c.dist, c.lat || 0), 3.05) : undefined;
    };
    // the rain: under the roof it does not rain. It is seen only out through the water door, above the slats that are down,
    // and through the side door while it stands open (and not through its leaf, swung out over the water). Local
    // coordinates: the house is -2.4..2.4 across, -2.4..2.6 from back to front, its roof at 3
    const toLocal = (x, z) => rotY(x, z, -(L.facing || 0));
    L.weatherShelter = () => {
      const openings = [], covered = 2.4 * clamp((winch.count || 0) / need, 0, 1), P = q => L.pt(q[0], q[1], q[2]);
      if (covered < 2.39) openings.push([[-1.5, 0, 2.6], [1.5, 0, 2.6], [1.5, 2.4 - covered, 2.6], [-1.5, 2.4 - covered, 2.6]].map(P));
      const a = s.doorA, hx = 2.4, hz = -0.55, lx = hx + Math.sin(a) * 1.1, lz = hz + Math.cos(a) * 1.1;
      if (a > 0.01) openings.push([[2.4, 0, -0.55], [2.4, 0, 0.55], [2.4, 2.1, 0.55], [2.4, 2.1, -0.55]].map(P));
      const hides = (x, y, z) => {
        const [px, pz] = toLocal(x, z);
        if (y < 3.05 && px > -2.45 && px < 2.45 && pz > -2.45 && pz < 2.65) return true;   // indoors
        if (a <= 0.01) return false;
        // behind the open leaf, from the eye (at the middle of the floor): where the line to it crosses the leaf
        const dx = px, dz = pz, sx = lx - hx, sz = lz - hz, den = dx * sz - dz * sx;
        if (Math.abs(den) < 1e-6) return false;
        const t = (hx * sz - hz * sx) / den, u = (hx * dz - hz * dx) / den;
        if (t <= 0 || t >= 1 || u < 0 || u > 1) return false;
        const yAt = L.eyeH + (y - L.eyeH) * t;
        return yAt > 0 && yAt < 2.08;
      };
      return { openings, hides };
    };
    L.dynamicLights = () => { const p = L.pt(lampX(), 2.05, 0.3); return [{ x: p[0], y: p[1], z: p[2], r: 5.5, i: 0.42, color: [255, 210, 160], flicker: 0.3, seed: 2 }]; };
    L.glows = () => { const p = L.pt(lampX(), 2.15, 0.3); return [{ x: p[0], y: p[1], z: p[2], r: 1.6 + Math.sin(L.t * 11) * 0.08, color: [255, 190, 110], a: 0.2 }]; };
    L.floor = { poly: [[-2.3, -2.3], [2.3, -2.3], [2.3, 2.5], [-2.3, 2.5]], y: 0 };
  }
});
