'use strict';
// ============================================================ 8. THE DINER ============================================================
// It is drawn to the light. While the diner is lit it crosses the lot far faster than three shutters can be cranked, and
// it does not matter whether you watch it; with the power main thrown it walks, slowly. Three windows across the front, a
// roll-down shutter on each and one crank: shut the window it is coming for and it runs to one that is still open (along
// the glass if it is already there, across the lot if not). With all three down it beats on the last one it came to.
Object.assign(ICONS, {
  // the shutter crank: a long bright steel rod with a hook at the top, a crank bend and a red rubber grip, edged dark so it
  // reads on a pale tile and on a dark one, with the lights out. Drawn bold: it lies on the floor or a counter some way off.
  shutterCrank(ctx, P) {
    const edge = P.col([34, 34, 38]), steel = P.col([200, 202, 208]), shine = P.col([236, 238, 242]), grip = P.col([186, 46, 36]), gripD = P.col([130, 30, 24]);
    const rod = [[0.36, 0.84], [0.36, 0.96], [0.2, 0.96], [0.2, 0.36], [-0.22, 0.36]];
    P_limb(ctx, rod, 0.13, edge); P_line(ctx, -0.22, 0.36, -0.22, 0.03, 0.2, edge);
    P_limb(ctx, rod, 0.075, steel);
    P_line(ctx, 0.18, 0.88, 0.18, 0.42, 0.022, shine);                           // a glint down the shaft
    P_line(ctx, -0.22, 0.3, -0.22, 0.07, 0.14, grip); P_line(ctx, -0.18, 0.28, -0.18, 0.09, 0.03, gripD);
  },
});
LEVELS.push({
  id: 'diner', title: 'The Diner', facing: 180, eyeH: 1.65, laneSwitch: false,   // its only change of way is the slide along the glass
  pal: { skyTop: [5, 5, 10], fog: [20, 17, 24], ground: [18, 16, 20], fogDist: 90 },
  ambient: { wind: 0.25, drone: 1.0, droneFreq: 60, windFreq: 300 },
  lights: [
    { x: 3.1, y: 5.4, z: 11.6, r: 18, i: 0.9, color: [255, 172, 70] },                    // the lamp over the lot
    { x: -10.5, y: 4.9, z: 26, r: 20, i: 0.75, color: [255, 70, 190], flicker: 0.12 },     // the sign out by the road: pink on the ground round it, and on it as it passes
  ],
  text: {
    intro: 'The last customer left at ten. Since then something that is not a customer has stood at the far end of the lot, looking at the lit windows.<br>Now it is coming for the light, and every light in the place is on.',
    death: { default: 'One window was still open. It found it.', through: 'It came through the glass before the shutter was down.', lit: 'The lights were still on. It came straight to them.' },
    win: 'It beat on the shutter until long after its hands should have broken. Then it stood at the steel until it got light, and walked off across the lot like it had somewhere to be.',
    fragment: 'There is a switch by your door that does not seem to do anything. You flip it every night anyway.',
  },
  // three windows across the front, left to right as you face them; it comes for one. It stands at the glass on a line
  // 5.45 m out, past the shutters, which is further along the slanted lanes either side.
  lanes: [
    { deg: 330, name: 'left window', barrierDist: 6.29 },
    { deg: 0, name: 'middle window', barrierDist: 5.45 },
    { deg: 30, name: 'right window', barrierDist: 6.29 },
  ],
  // its time is its walk in the dark: slow enough that the main thrown within the first ten seconds or so still leaves
  // room to find the crank and bring all three shutters down (the lit pace is set in build, from LIT_T)
  creatures: [{ type: 'customer', startDist: 42, time: 175 }],
  build(L) {
    const s = L.s, eye = L.eyeH;
    const cream = [96, 88, 72], creamD = [72, 65, 54], red = [104, 32, 32], chrome = [118, 120, 126], tileA = [82, 77, 70], tileB = [34, 31, 30], dark = [34, 34, 38], steel = [128, 126, 118];
    // the glass of each window (x from..to on the front wall), the glass and shutter planes, and how far a shutter travels
    const PANES = [[-3.85, -1.55], [-1.25, 1.25], [1.55, 3.85]], ZW = 5.0, ZG = 5.02, ZS = 5.1, TOP = 2.6, BOT = 0.1;
    // a shutter takes ten turns, and the crank goes round no faster than once in 0.65 s: nearly 19 s for all three. Lit, it
    // is at the glass LIT_T s after it sets off, whatever its start: too soon for all three even from a hand that has the
    // crank at once and never misses a turn. (Shut its window just as it gets there and it runs along to the next, but
    // lit it runs quickly: no more than two more turns fit in before it is at the last glass, and the 28th turn cannot
    // come before 17.5 s.) So the lights have to go first; thrown within the first ten seconds or so, there is room to find
    // the crank and bring all three down at an ordinary pace.
    const TURNS = 10, TURN = 0.65, LIT_T = 17, DARK_AMB = 0.42;
    SC.stars(L, 81, 40, 0.25);
    // ---- the room: tiles, walls, ceiling, the kitchen pass and the back counter ----
    for (let x = -4; x < 4; x++) for (let z = -2.5; z < 5; z++) SC.floorQ(L, x, z, x + 1, Math.min(z + 1, 5), 0.004, ((x + Math.floor(z)) & 1) ? tileA : tileB);
    SC.quad(L, [-4, 3, -2.5], [4, 3, -2.5], [4, 3, 5], [-4, 3, 5], [70, 66, 60]);
    SC.wallV(L, -4, -2.5, 4, -2.5, 0, 3, cream); SC.wallV(L, -4, -2.49, -1, -2.49, 1.05, 1.2, red); SC.wallV(L, 1, -2.49, 4, -2.49, 1.05, 1.2, red);   // the stripe stops at the kitchen pass
    SC.wallV(L, 4, -2.5, 4, 5, 0, 3, creamD); SC.wallV(L, -4, -2.5, -4, 5, 0, 3, creamD);
    SC.wallV(L, 3.99, -2.5, 3.99, 5, 1.05, 1.2, red); SC.wallV(L, -3.99, -2.5, -3.99, 5, 1.05, 1.2, red);
    // the door to the back, on the staff side of the counter: a dark frame, the door, a round window and a push plate
    SC.wallV(L, -3.985, -2.02, -3.985, -0.88, 0, 2.2, [40, 32, 28], { sortDist: 4.3 });
    SC.wallV(L, -3.98, -1.94, -3.98, -0.96, 0, 2.12, [74, 56, 44], { sortDist: 4.29 });
    const disc = (cz, cy, r, color, sd) => L.props.push({ kind: 'poly', pts: Array.from({ length: 10 }, (_, k) => L.pt(-3.975, cy + Math.sin(k * TAU / 10) * r, cz + Math.cos(k * TAU / 10) * r)), color, sortDist: sd });
    disc(-1.45, 1.55, 0.17, [118, 120, 126], 4.28); disc(-1.45, 1.55, 0.13, [18, 16, 18], 4.27);
    SC.wallV(L, -3.975, -1.12, -3.975, -1.04, 0.92, 1.22, [118, 120, 126], { sortDist: 4.27 });
    SC.wallV(L, -1, -2.49, 1, -2.49, 1.0, 2.0, [14, 10, 10]); SC.box(L, -1.1, 1.1, 0.95, 1.02, -2.5, -2.3, chrome); // the kitchen pass
    SC.box(L, 1.2, 3.8, 1.9, 1.95, -2.5, -2.3, [90, 74, 56]);
    for (let x = 1.4; x < 3.7; x += 0.3) SC.box(L, x, x + 0.16, 1.95, 2.1, -2.48, -2.34, [230, 226, 214]);
    SC.box(L, 2.4, 3.8, 0, 0.9, -2.45, -1.85, [150, 138, 118]); SC.box(L, 3.0, 3.6, 0.9, 1.5, -2.4, -2.0, chrome); SC.box(L, 3.05, 3.55, 0.9, 1.0, -2.0, -1.9, [60, 40, 30]);
    SC.sprite(L, -2.4, 2.1, -2.45, 0.42, 0.42, (ctx, P) => { ctx.scale(0.42, 0.42); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([40, 40, 44])); P_ell(ctx, 0, 0.5, 0.44, 0.44, P.col([230, 226, 216])); P_line(ctx, 0, 0.5, 0, 0.82, 0.03, P.col([30, 30, 30])); P_line(ctx, 0, 0.5, 0.22, 0.38, 0.03, P.col([30, 30, 30])); });
    // ---- the counter you stand behind, the stools, the booths ----
    // The counter runs the width of the room, so the middle of all of it says little about what is in front of it: its top
    // is drawn after the whole of the red body under it (or the body's top shows through it), and the stools on the far
    // side before the whole counter (or their posts show over its front). reorder moves the last n faces' drawing order
    // together, so they keep their own order among themselves.
    const reorder = (n, f) => {
      const ps = L.props.slice(-n), ds = ps.map(p => p.pts.reduce((a, v) => a + Math.hypot(v[0], v[2]), 0) / p.pts.length), k = f(Math.min(...ds), Math.max(...ds));
      ps.forEach((p, i) => { p.sortDist = ds[i] + k; });
    };
    SC.box(L, -3.6, 3.6, 0, 0.95, 0.8, 1.4, [108, 34, 34]);
    SC.box(L, -3.7, 3.7, 0.95, 1.0, 0.75, 1.45, [112, 104, 90]); reorder(5, (lo, hi) => 3.6 - hi);   // a little dim: under the tubes it is the brightest thing in the room
    for (const x of [-3, -1.5, 0, 1.5, 3]) { SC.box(L, x - 0.04, x + 0.04, 0, 0.72, 1.96, 2.04, chrome); SC.box(L, x - 0.2, x + 0.2, 0.72, 0.84, 1.8, 2.2, red); reorder(10, lo => 3.9 - lo); }
    SC.box(L, -0.9, -0.65, 1.0, 1.16, 0.95, 1.1, chrome); SC.box(L, 0.4, 0.5, 1.0, 1.2, 1.0, 1.1, [150, 30, 20]); SC.box(L, 0.6, 0.7, 1.0, 1.14, 1.0, 1.1, [190, 170, 60]);
    SC.box(L, -3.4, -2.8, 1.0, 1.3, 0.85, 1.35, [60, 60, 66]); SC.box(L, -3.35, -2.85, 1.3, 1.34, 0.85, 1.35, [40, 40, 44]);
    STORY.lamp(L, -2.3, 1.0, 1.1, { scale: 0.8 });
    // a pie under a glass dome: the dome sits on its stand, it does not reach down through the counter
    SC.sprite(L, 2.3, 1.0, 1.1, 0.4, 0.34, (ctx, P) => {
      ctx.scale(0.4, 0.34);
      P_rect(ctx, -0.5, 0, 1, 0.1, P.col(chrome));
      P_rect(ctx, -0.32, 0.1, 0.64, 0.24, P.col([170, 120, 90])); P_rect(ctx, -0.32, 0.3, 0.64, 0.05, P.col([206, 160, 112]));
      ctx.fillStyle = P.cola([200, 210, 220], 0.3); ctx.beginPath(); ctx.ellipse(0, 0.1, 0.45, 0.8, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
      P_line(ctx, -0.26, 0.5, -0.18, 0.7, 0.03, P.cola([236, 240, 246], 0.5));   // a glint on the glass
      P_ell(ctx, 0, 0.92, 0.05, 0.04, P.col(chrome));                            // its knob
    });
    for (const x of [-3.4, 3.4]) { SC.box(L, x - 0.35, x + 0.35, 0.72, 0.78, 3.0, 3.7, [200, 190, 165]); SC.box(L, x - 0.04, x + 0.04, 0, 0.72, 3.31, 3.39, chrome); }
    // ---- the front: three tall windows between narrow piers, a header above, a kick plate below ----
    for (const [x0, x1] of [[-4, -3.85], [-1.55, -1.25], [1.25, 1.55], [3.85, 4]]) SC.box(L, x0, x1, 0, 3, 4.95, 5.05, dark);
    SC.wallV(L, -4, ZW, 4, ZW, TOP, 3.0, creamD);
    SC.box(L, -4, 4, 0, BOT, 4.95, 5.05, dark);
    // a shutter is drawn behind everything inside and in front of anything outside: the nearest point of its own plane, a
    // little less. Its gearbox and drive rod are inside the glass, so they come after it.
    const shutterSort = (x0, x1) => Math.min(Math.hypot(x0, ZS), Math.hypot(x1, ZS), x0 < 0 && x1 > 0 ? ZS : Infinity) - 0.05;
    const GEAR = PANES.map(([x0]) => x0 + 0.15);   // each window's gearbox, just inside the left edge of its own glass
    const glass = PANES.map(([x0, x1], i) => {
      SC.wallV(L, x0, ZG, x1, ZG, BOT, TOP, [150, 170, 200], { alpha: 0.1 });
      const pane = L.props[L.props.length - 1];
      SC.box(L, x0, x1, TOP - 0.05, TOP, 5.04, 5.16, [40, 40, 44]);                                       // the slot the shutter comes out of
      for (const gx of [x0, x1 - 0.05]) SC.box(L, gx, gx + 0.05, BOT, TOP, 5.06, 5.14, [62, 62, 66]);     // its guide rails
      // the gearbox, with the eye the crank goes into, and the rod from it up to the shutter's roll, so it is plain which
      // window it works
      const gx = GEAR[i], sd = shutterSort(x0, x1) - 0.1;
      SC.wallV(L, gx - 0.016, ZG - 0.05, gx + 0.016, ZG - 0.05, 1.08, TOP - 0.02, [46, 46, 50], { sortDist: sd + 0.01 });
      SC.wallV(L, gx - 0.05, ZG - 0.05, gx + 0.05, ZG - 0.05, TOP - 0.14, TOP - 0.02, [46, 46, 50], { sortDist: sd + 0.01 });   // where it goes into the roll
      SC.sprite(L, gx, 0.86, ZG - 0.07, 0.17, 0.26, (ctx, P) => {
        ctx.scale(0.17, 0.26);
        P_rect(ctx, -0.5, 0, 1, 1, P.col([40, 40, 44])); P_rect(ctx, -0.42, 0.05, 0.84, 0.9, P.col([104, 106, 112]));
        P_rect(ctx, -0.42, 0.05, 0.84, 0.12, P.col([80, 82, 88]));
        for (const y of [0.12, 0.88]) for (const x of [-0.3, 0.3]) P_ell(ctx, x, y, 0.05, 0.03, P.col([50, 50, 54]));   // its bolts
        P_ell(ctx, 0, 0.55, 0.32, 0.21, P.col([20, 20, 22])); P_ell(ctx, 0, 0.55, 0.15, 0.1, P.col([176, 176, 182]));
        P_rect(ctx, -0.05, 0.52, 0.1, 0.06, P.col([20, 20, 22]));                                                         // the slot the hook catches in
      }, { sortDist: sd });
      return pane;
    });
    // the OPEN sign hanging high in the middle window: lit while the power is on
    SC.sprite(L, 0, 2.18, 4.9, 1.0, 0.36, (ctx, P) => {
      ctx.scale(1.0, 0.36);
      const on = lightsOn();
      ctx.strokeStyle = on ? P.raw([255, 90, 210]) : P.col([70, 46, 66]); ctx.lineWidth = 0.05; ctx.lineCap = 'round'; ctx.lineJoin = 'round';   // round joins: no spikes off the N
      ctx.beginPath(); ctx.ellipse(-0.36, 0.5, 0.1, 0.32, 0, 0, TAU); ctx.moveTo(-0.16, 0.18); ctx.lineTo(-0.16, 0.82); ctx.lineTo(-0.02, 0.82); ctx.lineTo(-0.02, 0.5); ctx.lineTo(-0.16, 0.5);
      ctx.moveTo(0.22, 0.18); ctx.lineTo(0.08, 0.18); ctx.lineTo(0.08, 0.82); ctx.lineTo(0.22, 0.82); ctx.moveTo(0.08, 0.5); ctx.lineTo(0.2, 0.5);
      ctx.moveTo(0.3, 0.18); ctx.lineTo(0.3, 0.82); ctx.lineTo(0.46, 0.18); ctx.lineTo(0.46, 0.82); ctx.stroke();
    }, { noFog: true, noLight: true, sortDist: 4.85 });
    // ---- outside: the lot, its lamp, the sign by the road, a parked car, the road, the dark beyond ----
    SC.floorQ(L, -30, 5.1, 30, 6.4, 0.0, [72, 70, 68]);
    SC.floorQ(L, -40, 6.4, 40, 30, -0.02, [30, 29, 31]);
    for (let x = -12; x <= 12; x += 2.8) SC.floorQ(L, x - 0.05, 7, x + 0.05, 11.5, -0.01, [150, 148, 130], { alpha: 0.45 });
    SC.floorQ(L, -80, 30, 80, 38, -0.02, [22, 22, 24]);
    for (let x = -60; x < 60; x += 6) SC.floorQ(L, x, 33.9, x + 3, 34.1, -0.01, [140, 140, 110], { alpha: 0.6 });
    SC.floorQ(L, -80, 38, 80, 95, -0.02, [26, 26, 26]);
    // the lamp and the sign stand between the ways it can come, so neither ever hides it. The lamp's head is above the
    // window line, out of sight from behind the counter (only its light shows, on the lot); the sign stands out by the road,
    // where the whole of it shows through the left window, clear of the left way
    SC.box(L, 3.0, 3.2, 0, 5.4, 11.5, 11.7, dark);
    SC.sprite(L, 3.1, 5.3, 11.6, 0.7, 0.3, (ctx, P) => { ctx.scale(0.7, 0.3); P_rect(ctx, -0.5, 0, 1, 1, P.raw([255, 200, 120])); }, { noFog: true, noLight: true });
    SC.box(L, -10.6, -10.4, 0, 4.2, 25.9, 26.1, dark, { noLight: true });   // its post, a dark line under the board (lit, it glowed like a tube)
    SC.sprite(L, -10.5, 4.2, 26, 2.8, 1.5, (ctx, P) => {   // EAT, in pink neon on a dark board
      ctx.scale(2.8, 1.5); P_rect(ctx, -0.5, 0, 1, 1, P.col([26, 22, 30]));
      ctx.strokeStyle = P.raw([255, 90, 210]); ctx.lineWidth = 0.035; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeRect(-0.45, 0.1, 0.9, 0.8);
      ctx.strokeStyle = P.raw([255, 130, 225]); ctx.lineWidth = 0.06; ctx.beginPath();
      ctx.moveTo(-0.16, 0.25); ctx.lineTo(-0.3, 0.25); ctx.lineTo(-0.3, 0.75); ctx.lineTo(-0.16, 0.75); ctx.moveTo(-0.3, 0.5); ctx.lineTo(-0.19, 0.5);
      ctx.moveTo(-0.08, 0.25); ctx.lineTo(0.01, 0.75); ctx.lineTo(0.1, 0.25); ctx.moveTo(-0.045, 0.45); ctx.lineTo(0.065, 0.45);
      ctx.moveTo(0.17, 0.75); ctx.lineTo(0.31, 0.75); ctx.moveTo(0.24, 0.75); ctx.lineTo(0.24, 0.25); ctx.stroke();
    }, { noFog: true, noLight: true });
    SC.box(L, 7.6, 9.4, 0.25, 0.85, 7.2, 11.0, [38, 36, 46]); SC.box(L, 7.8, 9.2, 0.85, 1.35, 8.2, 10.0, [28, 28, 36]);
    for (const [x, z] of [[7.6, 8], [9.4, 8], [7.6, 10.2], [9.4, 10.2]]) SC.box(L, x - 0.12, x + 0.12, 0, 0.5, z - 0.3, z + 0.3, [14, 14, 16]);
    SC.box(L, -10.4, -8.8, 0, 1.3, 6.4, 7.4, [40, 60, 44]);
    // the far facades leave gaps where the ways cross them, so it is in view from its first step
    SC.wallV(L, -40, 50, -30.5, 50, 0, 7, [22, 20, 24]); SC.wallV(L, -27, 50, -10, 50, 0, 7, [22, 20, 24]); SC.wallV(L, -6, 50, -1.5, 50, 0, 5, [20, 18, 22]); SC.wallV(L, 1.5, 50, 20, 50, 0, 5, [20, 18, 22]); SC.wallV(L, 24, 50, 27, 50, 0, 9, [24, 22, 26]); SC.wallV(L, 30.5, 50, 50, 50, 0, 9, [24, 22, 26]);
    for (const [x, y, z] of [[-33, 4, 49.9], [-22, 2.5, 49.9], [10, 3, 49.9], [36, 6, 49.9]]) SC.sprite(L, x, y, z, 0.8, 1.1, (ctx, P) => { ctx.scale(0.8, 1.1); P_rect(ctx, -0.5, 0, 1, 1, P.raw([200, 170, 110])); }, { noFog: true, noLight: true });
    const rng = mulberry32(88), tan30 = Math.tan(30 * DEG);
    for (let i = 0; i < 14; i++) { const side = rng() < 0.5 ? -1 : 1, x = side * (14 + rng() * 26), z = 38 + rng() * 10; if ([-tan30, 0, tan30].some(t => Math.abs(x - t * z) < 2.5)) continue; SC.tree(L, x, z, 6 + rng() * 6, 'bare', (rng() * 1e6) | 0); }

    // ---- the power main: a big lever switch on the back wall, on one side of the kitchen pass or the other (either way in
    // view from straight back, and square in the view a turn to that side) ----
    Object.assign(s, { power: true, offAt: -9, lever: 1, amb: 1, down: [false, false, false], shown: [0, 0, 0], turnAt: [-9, -9, -9], lastTurn: -9, queued: null, slide: null, slides: 0, through: false, byHand: false, dent: [0, 0, 0], hit: null, blows: 0 });
    const mainX = [-1.75, 1.75][Math.floor(L.rand() * 2)], MW = 0.72, MH = 0.95, MY = 0.95;
    SC.wallV(L, mainX - 0.11, -2.485, mainX - 0.06, -2.485, 0, MY + 0.06, [48, 50, 54]);   // its conduit, down into the floor, clamped to the wall
    for (const y of [0.3, 0.7]) SC.wallV(L, mainX - 0.13, -2.483, mainX - 0.04, -2.483, y, y + 0.04, [70, 72, 76]);
    SC.sprite(L, mainX, MY, -2.44, MW, MH, (ctx, P) => {
      ctx.scale(MW, MH);
      const body = P.col([92, 96, 100]), bodyD = P.col([58, 60, 64]), ink = P.col([24, 24, 26]), plate = P.col([214, 208, 196]);
      P_rect(ctx, -0.48, 0.03, 0.72, 0.92, bodyD); P_rect(ctx, -0.45, 0.06, 0.66, 0.86, body);                       // the box
      P_line(ctx, -0.45, 0.5, 0.21, 0.5, 0.008, bodyD);
      P_poly(ctx, [[-0.3, 0.6], [0.04, 0.6], [-0.13, 0.84]], P.col([224, 184, 40]));                                    // a yellow warning sign with a bolt
      P_poly(ctx, [[-0.1, 0.8], [-0.18, 0.69], [-0.12, 0.69], [-0.16, 0.62], [-0.07, 0.72], [-0.13, 0.72]], ink);
      P_rect(ctx, -0.36, 0.3, 0.44, 0.14, plate);                                                                         // MAIN, stencilled on a plate
      ctx.strokeStyle = ink; ctx.lineWidth = 0.016; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
      const y0 = 0.33, y1 = 0.41; let x = -0.33;
      ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.lineTo(x + 0.035, y0 + 0.03); ctx.lineTo(x + 0.07, y1); ctx.lineTo(x + 0.07, y0); x += 0.1;
      ctx.moveTo(x, y0); ctx.lineTo(x + 0.035, y1); ctx.lineTo(x + 0.07, y0); ctx.moveTo(x + 0.016, y0 + 0.03); ctx.lineTo(x + 0.054, y0 + 0.03); x += 0.1;
      ctx.moveTo(x + 0.02, y0); ctx.lineTo(x + 0.02, y1); x += 0.07;
      ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.lineTo(x + 0.07, y0); ctx.lineTo(x + 0.07, y1); ctx.stroke();
      P_ell(ctx, -0.36, 0.17, 0.04, 0.03, s.power ? P.raw([120, 255, 140]) : P.col([30, 50, 34]));                      // the pilot light
      // I and O beside the lever's two ends, as on any switch: on is up, off is down
      P_line(ctx, 0.14, 0.78, 0.14, 0.88, 0.022, ink);
      ctx.strokeStyle = ink; ctx.lineWidth = 0.018; ctx.beginPath(); ctx.ellipse(0.14, 0.15, 0.03, 0.045, 0, 0, TAU); ctx.stroke();
      // the lever: a pivot on the side of the box and a long arm with a red grip, up for on and down for off
      const a = lerp(Math.PI - 0.32, 0.32, s.lever), px = 0.3, py = 0.5, ex = px + Math.sin(a) * 0.4, ey = py + Math.cos(a) * 0.4;
      P_rect(ctx, 0.2, 0.36, 0.14, 0.28, bodyD);
      P_line(ctx, px, py, ex, ey, 0.05, P.col([150, 150, 156]));
      P_line(ctx, px + (ex - px) * 0.62, py + (ey - py) * 0.62, ex, ey, 0.1, P.col([176, 34, 28]));
      P_ell(ctx, px, py, 0.05, 0.04, ink);
    });
    mkTarget(L, {
      id: 'main', name: 'Main switch', x: mainX, y: MY, z: -2.42, w: MW, h: MH,
      onClick() {
        if (!s.power) { G.say('The main is off, and it stays off.', 'The power is off.'); return true; }
        s.power = false; s.offAt = L.t; s.clunked = false; AUDIO.sfx('lever'); G.shake(0.12);   // the clunk and the tubes follow from L.update
        if (AUDIO.on()) AUDIO.startAmbient(Object.assign({}, L.def.ambient, { drone: 0.12 }));   // the hum of the place stops with it
        if (s.through) G.say('Every light in the place goes out at once.', 'Every light in the place goes out.');
        else G.say('Every light in the place goes out at once. Out in the lot, it slows down.', 'Every light in the place goes out. Out in the lot, it slows down.');
        return true;
      },
    });
    // the power goes with a stutter: two blinks, then nothing
    const lightsOn = () => s.power || [0.07, 0.17].some(k => Math.abs(L.t - s.offAt - k) < 0.035);

    // ---- the shutter crank: one, lying somewhere behind the counter ----
    mkItem(L, 'crank', 'Shutter crank', [
      { x: 2.4, y: 0, z: -0.3 },                        // on the floor behind the counter
      { x: 1.3, y: 1.0, z: 1.05 },                      // on the counter, clear of the lamp
      { x: 2.7, y: 0.9, z: -2.15 },                     // on the back counter, beside the coffee machine
      { x: -0.5, y: 1.02, z: -2.36, jitter: 0 },        // on the ledge of the kitchen pass, at its front edge (no jitter: the ledge is 20 cm deep)
      { x: -3.2, y: 0, z: 0.3 },                        // on the floor by the register
    ], { w: 0.5, h: 0.5, flat: true, tool: true, icon: 'shutterCrank' });

    // ---- the shutters: each its own way in, each cranked down with the crank in hand ----
    // the aperture a slanted way sees through its pane: the pane projected from the eye onto a plane across the way where
    // the way crosses the glass. Its sides stay upright; the top and bottom slant, so the rectangle kept is the part inside
    // them, and the top comes down with the shutter.
    const panes = PANES.map(([x0, x1], i) => {
      const deg = L.lanes[i].deg, sn = Math.sin(deg * DEG), cs = Math.cos(deg * DEG), zp = ZW / cs;
      const along = x => x * sn + ZW * cs, across = x => x * cs - ZW * sn;
      const aMin = Math.min(along(x0), along(x1)), aMax = Math.max(along(x0), along(x1));
      const top = y => eye + (y - eye) * zp / (y >= eye ? aMax : aMin);
      const ap = L.addAperture(i, { z: zp, x0: across(x0) * zp / along(x0), x1: across(x1) * zp / along(x1), y0: eye - (eye - BOT) * zp / aMax, y1: top(TOP) });
      L.addAperture(i, { z: 0.75 / cs, x0: -9, x1: 9, y0: 1.0, y1: 99 });   // the counter top, between you and the glass
      return { ap, top, sortD: shutterSort(x0, x1), glassD: ZG / cs };
    });
    Object.assign(s, { turns: TURNS, turn: TURN, glassD: panes.map(q => q.glassD) });   // for the tests
    const shutters = PANES.map(([x0, x1], i) => {
      const t = mkTarget(L, {
        id: 'shutter' + i, name: ['Left', 'Middle', 'Right'][i] + ' shutter', x: (x0 + x1) / 2, y: BOT, z: 4.95, w: x1 - x0, h: TOP - BOT,
        crank: { n: TURNS, sfx: 'ratchet', onTurn() { s.turnAt[i] = L.t; }, onComplete() { shutterDown(i); } },
        onClick() {
          if (s.through) { s.queued = null; G.say('Too late. It is inside.', 'Too late. It is inside.'); AUDIO.sfx('nope'); return true; }
          if (t.done) { G.say('That shutter is down.', 'That shutter is down.'); return true; }
          if (!G.hasItem('crank')) { s.byHand = true; G.say('It will not come down by hand. It needs its crank.', 'The shutter is rolled up. It will not come down by hand.'); AUDIO.sfx('nope'); return true; }
          if (L.t - s.lastTurn < TURN) { s.queued = t; return true; }   // the ratchet is still going round: this turn comes next
          s.lastTurn = L.t; return false;                                 // one turn of the crank (useTarget turns it)
        },
      });
      return t;
    });
    const cr = () => L.creature;   // made after build; s.target is the window it is making for, even while it goes there
    const panTo = yaw => Math.sin(wrapPi(yaw - G.cam.yaw)) * 0.85;
    // ---- the run: from a shut window to one still open it runs, side on (as the walker runs round the farmhouse) ----
    // It turns side on where it stands (stiffly, on the spot, RUN.pivot s), runs to the new window's way, slows, and turns
    // back to face the glass. Its legs go with the ground it really covers sideways, and its heels ring at every stride;
    // its walking steps are not counted while it runs.
    const RUN = { pivot: 0.16, glass: 3.8, lot: 5.5, step: 0.95, full: 3.2, ramp: 0.25 };
    // how far along the run it is at x (0..1) of the run's time: up to speed over the first quarter, flat out, down again
    // over the last quarter
    const runAt = x => { const a = RUN.ramp, v = 1 / (1 - a); return x < a ? v * x * x / (2 * a) : x > 1 - a ? 1 - v * (1 - x) * (1 - x) / (2 * a) : v * (x - a / 2); };
    const stride = (c, moved, dt) => {
      c.runAmt += (clamp(moved / Math.max(dt, 1e-3) / RUN.full, 0, 1) - c.runAmt) * Math.min(1, dt * 14);
      c.runGait += moved / RUN.step * Math.PI;
      const n = Math.floor(c.runGait / Math.PI);
      if (n !== c.runStep) { c.runStep = n; AUDIO.footstep('shoesRun', clamp(4 / (c.dist + 4), 0.12, 0.7), panTo(c.yaw)); }
    };
    const endRun = c => Object.assign(c, { runPose: false, runTurn: 0, runAmt: 0 });
    // its window is shut: it goes to window k. At the glass it runs along it, quickly, to the same distance out on k's way
    // (no nearer than just outside k's glass). Out in the lot it runs across to k's way, round on the arc it is on, so it
    // is soon in k's window. Either way it keeps coming at its own pace while it goes, and it is on a way of its own that
    // turns to point at it, so its distance is its real distance and it is drawn behind the shutters and piers it passes.
    // Sent on again before it got there, it carries on without stopping (turning round first if it was going the other
    // way). Returns whether it was at the glass.
    const slideTo = k => {
      const c = cr(), ln = L.lanes[k], p0 = c.pos(), keep = ln.barrierDist + 0.15;
      const r0 = Math.max(Math.hypot(p0.x, p0.z), keep), atGlass = r0 < keep + 2;
      const yaw0 = Math.atan2(p0.x, p0.z), turn = wrapPi(ln.yaw - yaw0), dir = turn >= 0 ? 1 : -1;
      // lit, it runs quicker: a run along the glass buys a hand cranking with the lights on almost nothing
      const len = atGlass ? Math.hypot(Math.sin(ln.yaw) * r0 - p0.x, Math.cos(ln.yaw) * r0 - p0.z) : r0 * Math.abs(turn);
      const run = atGlass ? clamp(len / RUN.glass, 0.5, 1.3) * (s.power ? 0.4 : 1) : clamp(len / RUN.lot, 1.2, 5) * (s.power ? 0.5 : 1), piv = RUN.pivot;
      c.u = clamp(1 - r0 / c.D0, 0, 1);
      const way = Object.assign({}, ln, { apertures: [], blockers: [], name: atGlass ? 'along the glass' : 'across the lot' });
      const place = (x, z) => { const yaw = Math.atan2(x, z); way.yaw = yaw; way.dirX = Math.sin(yaw); way.dirZ = Math.cos(yaw); c.lane = way; c.yaw = yaw; return Math.hypot(x, z); };
      s.slide = { to: k, from: s.target, atGlass, dir }; s.target = k; s.slides++;
      L.lane = ln; L.laneIdx = k; L.barrierDist = ln.barrierDist;
      c.hold = null; c.reached = false; c.dist = place(p0.x, p0.z); c.lat = 0;
      // the turn side on starts from wherever it already is: from the front, or running already (the other way, it spins
      // round through edge on; the same way, it does not slow down to start again but picks up from the speed it has)
      const was = c.runPose ? c.runTurn : 0, back = c.runPose && was >= 0.5 && c.runDir !== dir;
      const x0 = c.runPose && !back && was >= 0.5 ? RUN.ramp * clamp(c.runAmt, 0, 1) : 0, e00 = runAt(x0);
      if (!c.runPose) Object.assign(c, { runPose: true, runAmt: 0, runGait: 0, runStep: 0 });
      let T = (back ? 1 - was : was) * piv, e0 = 0, out = -1, px = p0.x, pz = p0.z;
      c.distFn = (cc, dt) => {
        const m = cc.frozen || cc.dead ? 0 : cc.CR.speedMult(cc, dt, cc.seen);
        cc.u = clamp(cc.u + dt * m / cc.T, 0, 1);
        const r = Math.max(cc.D0 * (1 - cc.u), keep);
        T += dt;
        e0 = Math.max(e0, (runAt(x0 + (1 - x0) * clamp((T - piv) / run, 0, 1)) - e00) / (1 - e00));
        if (!atGlass) e0 = Math.max(e0, clamp((r0 - r) / (r0 - keep), 0, 1));   // out in the lot it is on k's way by the time it reaches the glass: the run never holds it back
        const yaw = yaw0 + turn * e0;
        const d = atGlass ? place(lerp(p0.x, Math.sin(ln.yaw) * r, e0), lerp(p0.z, Math.cos(ln.yaw) * r, e0)) : place(Math.sin(yaw) * r, Math.cos(yaw) * r);
        // the ground it covered sideways (across the line from you to it, not along it) drives its stride
        const x = Math.sin(cc.yaw) * d, z = Math.cos(cc.yaw) * d;
        stride(cc, Math.abs(x * (z - pz) - z * (x - px)) / Math.max(d, 0.1), dt); px = x; pz = z;
        cc.gait -= Math.abs(cc.dist - d) * cc.CR.stepRate * Math.PI;   // its walking steps wait for its walk
        if (out < 0 && e0 >= 1) out = T;
        if (out < 0) {   // turning side on, then running
          const h = Math.min(1, T / piv);
          if (back && h < 0.5) { cc.runDir = -dir; cc.runTurn = 1 - h; } else { cc.runDir = dir; cc.runTurn = back ? Math.max(h, 0.5) : h; }
        } else cc.runTurn = 1 - Math.min(1, (T - out) / piv);   // there: turning back to the glass
        if (out >= 0 && T - out >= piv) { cc.distFn = null; cc.retarget(k); cc.u = clamp(1 - d / cc.D0, 0, 1); s.slide = null; endRun(cc); }
        return d;
      };
      if (atGlass) AUDIO.sfx('glassTap', panTo(ln.yaw));   // near enough to touch the glass as it goes
      return atGlass;
    };
    const shutterDown = i => {
      s.down[i] = true; AUDIO.sfx('clunk'); G.shake(0.15);
      if (s.through) return;   // it is inside: nothing to say about a shutter now
      const open = [0, 1, 2].filter(k => !s.down[k]);
      if (s.target !== i || !open.length) { G.say('The shutter is down.', 'The shutter is down.'); return; }
      // it was coming for this one: to the nearest window still open
      const p = cr().pos(), yaw = Math.atan2(p.x, p.z), gap = k => Math.abs(wrapPi(L.lanes[k].yaw - yaw));
      const best = Math.min(...open.map(gap)), near = open.filter(k => gap(k) < best + 0.01);
      if (slideTo(near[Math.floor(cr().rand() * near.length)])) G.say('The shutter is down. It runs along the glass to a window that is still open.', 'The shutter is down. It runs along the glass to another window.');
      else G.say('The shutter is down. Out in the lot, it runs for a window that is still open.', 'The shutter is down. Out in the lot, it runs for another window.');
    };
    L.isWon = () => s.down.every(Boolean) && !s.through;
    L.deathCause = () => (s.power ? 'lit' : s.through ? 'through' : null);

    L.update = dt => {
      const c = cr();
      if (s.target === undefined) s.target = c.lane.idx;
      // lit, it is at the glass LIT_T s after it sets off, however far out it started
      c.drawn = s.power; c.drawnMult = c.T * (1 - panes[c.lane.idx].glassD / c.D0) / LIT_T;
      if (!s.power && !s.clunked && L.t - s.offAt >= 0.14) { s.clunked = true; AUDIO.sfx('clunk'); AUDIO.sfx('tubeDie'); }   // the main's clunk, and the tubes dying
      s.lever = Math.max(s.power ? 1 : 0, s.lever - dt * 5);
      s.amb += ((lightsOn() ? 1 : DARK_AMB) - s.amb) * Math.min(1, dt * (s.power ? 6 : 14)); L.pal.ambient = s.amb;
      // a turn clicked while the crank was still going round
      if (s.queued && L.t - s.lastTurn >= TURN && G.state === 'play') { const t = s.queued; s.queued = null; if (!t.done && G.hasItem('crank')) useTarget(t); }
      // each shutter comes down a step at a time as the crank goes round, and the glass it covers stops showing the lot
      shutters.forEach((t, i) => {
        const want = t.done ? 1 : (t.count || 0) / TURNS;
        s.shown[i] += (want - s.shown[i]) * Math.min(1, dt * 9);
        panes[i].ap.y1 = panes[i].top(TOP - (TOP - BOT) * s.shown[i]);
      });
      // at an open window it does not stop: it comes through the glass, and it has you. The pane it came through is gone,
      // broken (L.dynamic), and the crank is no use now; it does not walk the room between the stools and over the counter,
      // it comes straight from the glass at your face.
      if (!s.slide && !s.through && !L.won && !c.dead && c.dist < panes[c.lane.idx].glassD) {
        s.through = true; s.throughWin = c.lane.idx; s.queued = null; glass[c.lane.idx].alpha = 0;
        AUDIO.sfx('glassGive', Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); G.shake(0.4);
        c.hold = null; c.catchDist = Infinity;
      }
    };
    // won: wherever it is, it comes straight up to the last shutter (its heels, running, on the other side; from far out it
    // is there in under two seconds) and sets about it with both fists: blow after blow, fast and hard, in flurries, the
    // steel bowing in where they land and ringing back, the whole shutter jumping in its rails, and the blows go on as it
    // all fades. It cannot get in. If it was running along the glass it gets where it was going first; if it was running
    // across the lot it finishes the turn on its way in.
    const GAPS = [0.3, 0.24, 0.22, 0.46, 0.27, 0.23, 0.21, 0.5];   // between blows: a flurry, a breath, another
    const blow = c => {
      const i = s.target, hard = s.blows % 4 === 0 ? 1 : 0.65 + 0.3 * c.rand();
      s.blows++;
      AUDIO.sfx('shutterBang', panTo(c.yaw)); G.shake(0.25 + 0.3 * hard);
      s.hit = { i, at: L.t, k: hard, x: lerp(0.28, 0.72, c.rand()), y: lerp(1.0, 1.8, c.rand()) };   // where it lands: across the shutter (0..1), and how high
      s.dent[i] = Math.min(0.6, s.dent[i] + 0.07 * hard);   // and every one leaves the steel a little further in
    };
    L.aftermath = t => {
      const c = cr(), b = L.barrierDist;
      if (!s.won0) {
        if (s.slide && s.slide.atGlass) return false;
        s.won0 = true; s.slide = null; c.hold = null; c.lat = 0;
        const ln = L.lanes[s.target], d0 = Math.max(c.dist, b), yaw0 = c.yaw, turn = wrapPi(ln.yaw - yaw0), v = Math.max(2.5, (d0 - b) / 1.8);
        const way = Object.assign({}, ln, { apertures: [], blockers: [], name: 'to the glass' });
        c.distFn = (cc, dt) => {
          const d = Math.max(b, cc.dist - dt * v), yaw = yaw0 + turn * smoothstep(d0 > b ? (d0 - d) / (d0 - b) : 1);
          way.yaw = yaw; way.dirX = Math.sin(yaw); way.dirZ = Math.cos(yaw); cc.lane = way; cc.yaw = yaw;
          stride(cc, Math.abs(cc.dist - d), dt); cc.gait -= Math.abs(cc.dist - d) * cc.CR.stepRate * Math.PI;   // running, not walking
          if (cc.runPose) { cc.runTurn -= dt / RUN.pivot; if (cc.runTurn <= 0) endRun(cc); }   // running across the lot: it turns in to the glass as it comes
          return d;
        };
      }
      if (s.arriveT === undefined && c.dist <= b + 0.01) { s.arriveT = t; s.nextBlow = 0.15; }
      if (s.arriveT === undefined) return false;
      const a = t - s.arriveT;
      if (a >= s.nextBlow) { blow(c); s.nextBlow += GAPS[(s.blows - 1) % GAPS.length] * (0.9 + 0.2 * c.rand()); }
      return a > 3.4;
    };

    // ---- what changes from frame to frame ----
    const TUBES = [[-2.6, 0.4], [0, 0.4], [2.6, 0.4], [-2.6, 3.2], [0, 3.2], [2.6, 3.2]], SEAM = [70, 68, 62], RAIL = [50, 48, 46];
    // the shutter it is beating on. Where a blow lands the steel bows in at you and rings back: the slats round it spread
    // apart as it bows (and crowd together as it springs back), the top of the bulge catches the light and its underside
    // goes dark, so it shows head on as well as from the side. Every blow leaves it bowed a little further in, and the
    // whole curtain jumps in its rails. The rails and the roll hold it: it does not bow at its edges or its top.
    const battered = (i, x0, x1, yb, sd) => {
      const h = s.hit && s.hit.i === i ? s.hit : null, e = h ? L.t - h.at : 9, k = h ? h.k : 0;
      // in hard as the fist lands, held there a moment, then springing back and ringing; the curtain jumping up in its rails
      const ring = k * (e < 0.03 ? e / 0.03 : e < 0.12 ? 1 : Math.exp(-(e - 0.12) * 7) * Math.cos((e - 0.12) * 26));
      const jy = k * 0.06 * Math.exp(-e * 8) * Math.abs(Math.sin(e * 20 + 0.6));
      const hx = h ? lerp(x0, x1, h.x) : 0, hy = h ? h.y : 0, mx = (x0 + x1) / 2, my = 1.4, dent = s.dent[i];
      const pin = (x, y) => Math.sin(Math.PI * clamp((x - x0) / (x1 - x0), 0, 1)) * clamp((TOP - y) / 0.6, 0, 1);
      const bump = (x, y) => ring * Math.exp(-(((x - hx) / 0.55) ** 2) - (((y - hy) / 0.45) ** 2));
      const bowl = (x, y) => dent * Math.exp(-(((x - mx) / 0.8) ** 2) - (((y - my) / 0.65) ** 2));
      const at = (x, y, dz) => {   // where a point of the curtain shows: pushed in toward the glass (no further than the gap), the slats spread
        const p = pin(x, y), a = bump(x, y) * p, b = bowl(x, y) * p;
        return [x, y + jy + 0.4 * (a * (y - hy) + b * (y - my)), ZS - 0.07 * (a + b) - dz];
      };
      R.add(SC.mkQuad(L, [x0, yb + jy, ZS], [x1, yb + jy, ZS], [x1, TOP, ZS], [x0, TOP, ZS], steel, { sortDist: sd }));
      // each seam (and the bottom rail) in short pieces, so it can bow; a seam the bulge does not reach is one straight piece
      const N = 12, bent = y => Math.abs(bump(hx, y)) + Math.abs(bowl(mx, y)) > 0.01;
      const seam = (y, h, dz, col, sdk) => {
        const n = bent(y) || bent(y + h) ? N : 1, w = (x1 - x0) / n;
        for (let q = 0; q < n; q++) { const xa = x0 + q * w, xc = xa + w; R.add(SC.mkQuad(L, at(xa, y, dz), at(xc, y, dz), at(xc, y + h, dz), at(xa, y + h, dz), col, { sortDist: sd - sdk })); }
      };
      for (let y = TOP - 0.15; y > yb + 0.08; y -= 0.15) seam(y, 0.022, 0.004, SEAM, 0.001);
      seam(yb, 0.08, 0.008, RAIL, 0.002);
      // the light on the bulge: soft, bright over it and dark under it (the other way round as it springs back out)
      const shade = (x, y, w, ht, amt) => {
        if (Math.abs(amt) < 0.02) return;
        const lo = amt > 0 ? [16, 14, 12] : [226, 222, 208], hi = amt > 0 ? [226, 222, 208] : [16, 14, 12], a = Math.min(0.7, Math.abs(amt) * 0.7);
        R.add(SC.mkSprite(L, x, y - ht / 2, ZS - 0.012, w, ht, (ctx, P) => {
          ctx.scale(w, ht);
          for (const r of [0.5, 0.4, 0.3]) {
            const g = ctx.createLinearGradient(0, 0.5 - r, 0, 0.5 + r);
            g.addColorStop(0, P.cola(lo, a * 0.45)); g.addColorStop(0.5, P.cola(lo, 0)); g.addColorStop(0.62, P.cola(hi, 0)); g.addColorStop(1, P.cola(hi, a * 0.45));
            ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0.5, r, r, 0, 0, TAU); ctx.fill();
          }
        }, { sortDist: sd - 0.0015 }));
      };
      if (h) shade(hx, hy + jy, 1.15 * pin(hx, hy) + 0.2, 1.0, ring * pin(hx, hy));
      shade(mx, my + jy, 1.7, 1.4, dent * 1.2);
    };
    L.dynamic = () => {
      const on = lightsOn();
      for (const [cx, cz] of TUBES) R.add(SC.mkQuad(L, [cx - 0.65, 2.96, cz - 0.07], [cx + 0.65, 2.96, cz - 0.07], [cx + 0.65, 2.96, cz + 0.07], [cx - 0.65, 2.96, cz + 0.07], on ? [240, 246, 230] : [60, 62, 58], on ? { noFog: true, noLight: true } : {}));
      // the shutters, outside the glass, coming down from the slot at the top: steel slats, a heavy bottom rail
      PANES.forEach(([x0, x1], i) => {
        // the crank in its gearbox, going once round with each turn, its grip swinging about the eye, then still a moment
        if (L.t - s.turnAt[i] < 0.9 && !L.won) {
          const rot = -clamp((L.t - s.turnAt[i]) / (TURN * 0.85), 0, 1) * TAU;
          R.add(SC.mkSprite(L, GEAR[i], 0.833, ZG - 0.1, 0.34, 0.34, (ctx, P) => {
            ctx.scale(0.34, 0.34); ctx.translate(0, 0.5);
            const ex = Math.sin(rot) * 0.36, ey = Math.cos(rot) * 0.36, edge = P.col([34, 34, 38]);
            P_line(ctx, 0, 0, ex, ey, 0.13, edge); P_line(ctx, 0, 0, ex, ey, 0.075, P.col([200, 202, 208]));
            P_ell(ctx, 0, 0, 0.09, 0.09, edge); P_ell(ctx, 0, 0, 0.055, 0.055, P.col([200, 202, 208]));
            P_ell(ctx, ex, ey, 0.1, 0.1, edge); P_ell(ctx, ex, ey, 0.075, 0.075, P.col([186, 46, 36]));   // the grip, end on
          }, { sortDist: panes[i].sortD - 0.12 }));
        }
        const cov = (TOP - BOT) * s.shown[i];
        if (cov < 0.01) return;
        const yb = TOP - cov, sd = panes[i].sortD, z = ZS;
        if (s.dent[i] > 0) { battered(i, x0, x1, yb, sd); return; }
        R.add(SC.mkQuad(L, [x0, yb, z], [x1, yb, z], [x1, TOP, z], [x0, TOP, z], steel, { sortDist: sd }));
        for (let y = TOP - 0.15; y > yb + 0.08; y -= 0.15) R.add(SC.mkQuad(L, [x0, y, z - 0.004], [x1, y, z - 0.004], [x1, y + 0.022, z - 0.004], [x0, y + 0.022, z - 0.004], SEAM, { sortDist: sd - 0.001 }));
        R.add(SC.mkQuad(L, [x0, yb, z - 0.008], [x1, yb, z - 0.008], [x1, yb + 0.08, z - 0.008], [x0, yb + 0.08, z - 0.008], RAIL, { sortDist: sd - 0.002 }));
      });
      if (s.through) for (const p of broken()) R.add(p);
    };
    // the pane it came through: jagged pieces left in the frame, edged bright, and glass on the floor inside. The pieces are in
    // the glass, inside the shutter, so they come after it; the floor pieces come after the tile they lie on.
    let shards = null;
    const broken = () => {
      if (shards) return shards;
      const [x0, x1] = PANES[s.throughWin], sd = panes[s.throughWin].sortD - 0.01, z = ZG - 0.006;
      const at3 = ([u, v]) => L.pt(lerp(x0, x1, u), lerp(BOT, TOP, v), z);
      shards = [
        [[0, 0], [0.3, 0], [0.12, 0.1], [0, 0.38]], [[0.44, 0], [0.6, 0], [0.52, 0.13]], [[1, 0], [1, 0.52], [0.9, 0.2], [0.72, 0]],
        [[0, 1], [0.4, 1], [0.1, 0.84], [0, 0.6]], [[1, 1], [0.62, 1], [0.86, 0.9], [1, 0.74]], [[0, 0.5], [0.07, 0.56], [0, 0.66]],
      ].map(q => q.map(at3)).flatMap(pts => [
        { kind: 'poly', pts, color: [190, 208, 228], alpha: 0.26, sortDist: sd },
        { kind: 'poly', pts: pts.concat([pts[0]]), color: [232, 240, 248], alpha: 0.8, stroke: true, lw: 0.012, sortDist: sd - 0.001 },
      ]);
      const rng = mulberry32(17 + s.throughWin);
      for (let k = 0; k < 14; k++) {
        const x = lerp(x0 + 0.2, x1 - 0.2, rng()), zz = 4.25 + rng() * 0.62, a = rng() * TAU, r = 0.03 + rng() * 0.05;
        const pts = [0, 2.1, 4.2].map(b => L.pt(x + Math.cos(a + b) * r, 0.006, zz + Math.sin(a + b) * r * 0.8));
        shards.push({ kind: 'poly', pts, color: [200, 214, 230], alpha: 0.75, layer: 0, sortDist: Math.hypot(x, zz) - 0.9 });
      }
      return shards;
    };
    const at = (x, y, z) => { const p = L.pt(x, y, z); return { x: p[0], y: p[1], z: p[2] }; };
    const roomLights = TUBES.map(([x, z], k) => Object.assign(at(x, 2.9, z), { r: 7, i: 0.3, color: [205, 235, 215], flicker: 0.04, seed: k * 3 }))
      .concat(PANES.map(([x0, x1], k) => Object.assign(at((x0 + x1) / 2 * 1.4, 1.4, 7.8), { r: 5, i: 0.35, color: [210, 236, 220], seed: k * 5 + 1 })))   // the windows' light spilling out over the lot
      .concat([Object.assign(at(0, 2.2, 4.7), { r: 2.5, i: 0.3, color: [255, 80, 200], flicker: 0.2, seed: 9 })]);
    L.dynamicLights = () => (lightsOn() ? roomLights : []);
    const glow = (x, y, z, r, color, a) => Object.assign(at(x, y, z), { r, color, a });
    // the sign's halo shows through the left window until its shutter comes down over it (a glow is drawn over everything,
    // so one whose source cannot be seen, like the lamp's head above the window line, has none)
    const signGlow = glow(-10.5, 4.95, 26, 2.6, [255, 70, 190], 0.22), openGlow = glow(0, 2.36, 4.9, 1.2, [255, 80, 200], 0.28), glows = [];
    L.glows = () => {
      glows.length = 0;
      const k = clamp(1 - s.shown[0] / 0.13, 0, 1);
      if (k > 0) { signGlow.a = 0.22 * k; glows.push(signGlow); }
      if (lightsOn()) glows.push(openGlow);
      return glows;
    };
    L.floor = { poly: [[-3.8, -2.3], [3.8, -2.3], [3.8, 0.65], [-3.8, 0.65]], y: 0 };
  }
});
