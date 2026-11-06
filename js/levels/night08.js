'use strict';
// ============================================================ 8. THE DINER ============================================================
// It is drawn to the light. While the diner is lit it crosses the lot far faster than three shutters can be cranked, and
// it does not matter whether you watch it; with the power main thrown it walks at an ordinary pace. Three windows across
// the front, a roll-down shutter on each and one crank: shut the window it is coming for and it slides along the glass to
// one that is still open. With all three down it stands at the glass until it gets light.
Object.assign(ICONS, {
  // the shutter crank: a long bright steel rod with a hook at the top, a crank bend and a red rubber grip, edged dark so it
  // reads on a pale tile and on a dark one, with the lights out
  shutterCrank(ctx, P) {
    const edge = P.col([34, 34, 38]), steel = P.col([200, 202, 208]), grip = P.col([186, 46, 36]);
    const rod = [[0.34, 0.88], [0.34, 0.97], [0.2, 0.97], [0.2, 0.36], [-0.22, 0.36]];
    P_limb(ctx, rod, 0.1, edge); P_line(ctx, -0.22, 0.36, -0.22, 0.04, 0.16, edge);
    P_limb(ctx, rod, 0.055, steel);
    P_line(ctx, -0.22, 0.3, -0.22, 0.07, 0.11, grip);
  },
});
LEVELS.push({
  id: 'diner', title: 'The Diner', facing: 180, eyeH: 1.65, laneSwitch: false,   // its only change of way is the slide along the glass
  pal: { skyTop: [5, 5, 10], fog: [20, 17, 24], ground: [18, 16, 20], fogDist: 90 },
  ambient: { wind: 0.25, drone: 1.0, droneFreq: 60, windFreq: 300 },
  lights: [
    { x: 3.1, y: 5.4, z: 11.6, r: 18, i: 0.9, color: [255, 172, 70] },                    // the lamp over the lot
    { x: -4.2, y: 4.9, z: 15, r: 14, i: 0.75, color: [255, 70, 190], flicker: 0.12 },     // the sign out by the road
  ],
  text: {
    intro: 'The last customer left at ten. Since then something that is not a customer has stood at the far end of the lot, looking at the lit windows.<br>Now it is coming for the light, and every light in the place is on.',
    death: { default: 'One window was still open. It found it.', lit: 'The lights were still on. It came straight to them.' },
    win: 'It stood at the shutters until it got light, and then it turned and walked off across the lot like it had somewhere to be.',
    fragment: 'There is a switch by your door that does not seem to do anything. You flip it every night anyway.',
  },
  // three windows across the front, left to right as you face them; it comes for one. It stands at the glass on a line
  // 5.45 m out, past the shutters, which is further along the slanted lanes either side.
  lanes: [
    { deg: 330, name: 'left window', barrierDist: 6.29 },
    { deg: 0, name: 'middle window', barrierDist: 5.45 },
    { deg: 30, name: 'right window', barrierDist: 6.29 },
  ],
  creatures: [{ type: 'customer', startDist: 42, time: 85 }],
  build(L) {
    const s = L.s, eye = L.eyeH;
    const cream = [96, 88, 72], creamD = [72, 65, 54], red = [104, 32, 32], chrome = [118, 120, 126], tileA = [82, 77, 70], tileB = [34, 31, 30], dark = [34, 34, 38], steel = [128, 126, 118];
    // the glass of each window (x from..to on the front wall), the glass and shutter planes, and how far a shutter travels
    const PANES = [[-3.85, -1.55], [-1.25, 1.25], [1.55, 3.85]], ZW = 5.0, ZG = 5.02, ZS = 5.1, TOP = 2.6, BOT = 0.1;
    // a shutter takes eight turns, and the crank goes round no faster than once in half a second: 11.5 s and more for all
    // three. Lit, it crosses the whole lot in 11.5 s and is through the glass in about 10, so the lights have to go first.
    const TURNS = 8, TURN = 0.5, LIT_T = 11.5, DARK_AMB = 0.42;
    SC.stars(L, 81, 40, 0.25);
    // ---- the room: tiles, walls, ceiling, the kitchen pass and the back counter ----
    for (let x = -4; x < 4; x++) for (let z = -2.5; z < 5; z++) SC.floorQ(L, x, z, x + 1, Math.min(z + 1, 5), 0.004, ((x + Math.floor(z)) & 1) ? tileA : tileB);
    SC.quad(L, [-4, 3, -2.5], [4, 3, -2.5], [4, 3, 5], [-4, 3, 5], [70, 66, 60]);
    SC.wallV(L, -4, -2.5, 4, -2.5, 0, 3, cream); SC.wallV(L, -4, -2.49, 4, -2.49, 1.05, 1.2, red);
    SC.wallV(L, 4, -2.5, 4, 5, 0, 3, creamD); SC.wallV(L, -4, -2.5, -4, 5, 0, 3, creamD);
    SC.wallV(L, 3.99, -2.5, 3.99, 5, 1.05, 1.2, red); SC.wallV(L, -3.99, -2.5, -3.99, 5, 1.05, 1.2, red);
    SC.wallV(L, -3.99, 1.2, -3.99, 2.1, 0, 2.1, [58, 44, 36]);                                           // the door to the back
    SC.wallV(L, -1, -2.49, 1, -2.49, 1.0, 2.0, [14, 10, 10]); SC.box(L, -1.1, 1.1, 0.95, 1.02, -2.5, -2.3, chrome); // the kitchen pass
    SC.box(L, 1.2, 3.8, 1.9, 1.95, -2.5, -2.3, [90, 74, 56]);
    for (let x = 1.4; x < 3.7; x += 0.3) SC.box(L, x, x + 0.16, 1.95, 2.1, -2.48, -2.34, [230, 226, 214]);
    SC.box(L, 2.4, 3.8, 0, 0.9, -2.45, -1.85, [150, 138, 118]); SC.box(L, 3.0, 3.6, 0.9, 1.5, -2.4, -2.0, chrome); SC.box(L, 3.05, 3.55, 0.9, 1.0, -2.0, -1.9, [60, 40, 30]);
    SC.sprite(L, -2.4, 2.1, -2.45, 0.42, 0.42, (ctx, P) => { ctx.scale(0.42, 0.42); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([40, 40, 44])); P_ell(ctx, 0, 0.5, 0.44, 0.44, P.col([230, 226, 216])); P_line(ctx, 0, 0.5, 0, 0.82, 0.03, P.col([30, 30, 30])); P_line(ctx, 0, 0.5, 0.22, 0.38, 0.03, P.col([30, 30, 30])); });
    // ---- the counter you stand behind, the stools, the booths ----
    SC.box(L, -3.6, 3.6, 0, 0.95, 0.8, 1.4, [108, 34, 34]); SC.box(L, -3.7, 3.7, 0.95, 1.0, 0.75, 1.45, [130, 122, 104]);
    for (const x of [-3, -1.5, 0, 1.5, 3]) { SC.box(L, x - 0.04, x + 0.04, 0, 0.72, 1.96, 2.04, chrome); SC.box(L, x - 0.2, x + 0.2, 0.72, 0.84, 1.8, 2.2, red); }
    SC.box(L, -0.9, -0.65, 1.0, 1.16, 0.95, 1.1, chrome); SC.box(L, 0.4, 0.5, 1.0, 1.2, 1.0, 1.1, [150, 30, 20]); SC.box(L, 0.6, 0.7, 1.0, 1.14, 1.0, 1.1, [190, 170, 60]);
    SC.box(L, -3.4, -2.8, 1.0, 1.3, 0.85, 1.35, [60, 60, 66]); SC.box(L, -3.35, -2.85, 1.3, 1.34, 0.85, 1.35, [40, 40, 44]);
    STORY.lamp(L, -2.3, 1.0, 1.1, { scale: 0.8 });
    SC.sprite(L, 2.3, 1.0, 1.1, 0.4, 0.34, (ctx, P) => { ctx.scale(0.4, 0.34); P_rect(ctx, -0.5, 0, 1, 0.1, P.col(chrome)); P_ell(ctx, 0, 0.1, 0.45, 0.85, P.cola([200, 210, 220], 0.35)); P_rect(ctx, -0.3, 0.15, 0.6, 0.3, P.col([170, 120, 90])); });
    for (const x of [-3.4, 3.4]) { SC.box(L, x - 0.35, x + 0.35, 0.72, 0.78, 3.0, 3.7, [200, 190, 165]); SC.box(L, x - 0.04, x + 0.04, 0, 0.72, 3.31, 3.39, chrome); }
    // ---- the front: three tall windows between narrow piers, a header above, a kick plate below ----
    for (const [x0, x1] of [[-4, -3.85], [-1.55, -1.25], [1.25, 1.55], [3.85, 4]]) SC.box(L, x0, x1, 0, 3, 4.95, 5.05, dark);
    SC.wallV(L, -4, ZW, 4, ZW, TOP, 3.0, creamD);
    SC.box(L, -4, 4, 0, BOT, 4.95, 5.05, dark);
    PANES.forEach(([x0, x1]) => {
      SC.wallV(L, x0, ZG, x1, ZG, BOT, TOP, [150, 170, 200], { alpha: 0.1 });
      SC.box(L, x0, x1, TOP - 0.05, TOP, 5.04, 5.16, [40, 40, 44]);                                       // the slot the shutter comes out of
      for (const gx of [x0, x1 - 0.05]) SC.box(L, gx, gx + 0.05, BOT, TOP, 5.06, 5.14, [62, 62, 66]);     // its guide rails
      // the gearbox on the pier beside the glass, with the eye the crank goes into
      SC.sprite(L, x0 - 0.15, 0.95, 4.92, 0.13, 0.2, (ctx, P) => { ctx.scale(0.13, 0.2); P_rect(ctx, -0.5, 0, 1, 1, P.col([70, 72, 76])); P_rect(ctx, -0.42, 0.06, 0.84, 0.88, P.col([96, 98, 102])); P_ell(ctx, 0, 0.62, 0.3, 0.2, P.col([24, 24, 26])); P_ell(ctx, 0, 0.62, 0.13, 0.08, P.col([150, 150, 156])); });
    });
    // the OPEN sign hanging high in the middle window: lit while the power is on
    SC.sprite(L, 0, 2.18, 4.9, 1.0, 0.36, (ctx, P) => {
      ctx.scale(1.0, 0.36);
      const on = lightsOn();
      ctx.strokeStyle = on ? P.raw([255, 90, 210]) : P.col([70, 46, 66]); ctx.lineWidth = 0.05; ctx.lineCap = 'round';
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
    // the lamp and the sign stand between the ways it can come, so neither ever hides it
    SC.box(L, 3.0, 3.2, 0, 5.4, 11.5, 11.7, dark);
    SC.sprite(L, 3.1, 5.3, 11.6, 0.7, 0.3, (ctx, P) => { ctx.scale(0.7, 0.3); P_rect(ctx, -0.5, 0, 1, 1, P.raw([255, 200, 120])); }, { noFog: true, noLight: true });
    SC.box(L, -4.3, -4.1, 0, 4.2, 14.9, 15.1, dark);
    SC.sprite(L, -4.2, 4.2, 15, 2.8, 1.5, (ctx, P) => { ctx.scale(2.8, 1.5); P_rect(ctx, -0.5, 0, 1, 1, P.col([26, 22, 30])); ctx.strokeStyle = P.raw([255, 90, 210]); ctx.lineWidth = 0.05; ctx.strokeRect(-0.45, 0.1, 0.9, 0.8); P_rect(ctx, -0.36, 0.42, 0.72, 0.16, P.raw([255, 120, 220])); P_rect(ctx, -0.3, 0.2, 0.6, 0.1, P.raw([255, 90, 210])); }, { noFog: true, noLight: true });
    SC.box(L, 7.6, 9.4, 0.25, 0.85, 7.2, 11.0, [38, 36, 46]); SC.box(L, 7.8, 9.2, 0.85, 1.35, 8.2, 10.0, [28, 28, 36]);
    for (const [x, z] of [[7.6, 8], [9.4, 8], [7.6, 10.2], [9.4, 10.2]]) SC.box(L, x - 0.12, x + 0.12, 0, 0.5, z - 0.3, z + 0.3, [14, 14, 16]);
    SC.box(L, -10.4, -8.8, 0, 1.3, 6.4, 7.4, [40, 60, 44]);
    // the far facades leave gaps where the ways cross them, so it is in view from its first step
    SC.wallV(L, -40, 50, -30.5, 50, 0, 7, [22, 20, 24]); SC.wallV(L, -27, 50, -10, 50, 0, 7, [22, 20, 24]); SC.wallV(L, -6, 50, -1.5, 50, 0, 5, [20, 18, 22]); SC.wallV(L, 1.5, 50, 20, 50, 0, 5, [20, 18, 22]); SC.wallV(L, 24, 50, 27, 50, 0, 9, [24, 22, 26]); SC.wallV(L, 30.5, 50, 50, 50, 0, 9, [24, 22, 26]);
    for (const [x, y, z] of [[-33, 4, 49.9], [-22, 2.5, 49.9], [10, 3, 49.9], [36, 6, 49.9]]) SC.sprite(L, x, y, z, 0.8, 1.1, (ctx, P) => { ctx.scale(0.8, 1.1); P_rect(ctx, -0.5, 0, 1, 1, P.raw([200, 170, 110])); }, { noFog: true, noLight: true });
    const rng = mulberry32(88), tan30 = Math.tan(30 * DEG);
    for (let i = 0; i < 14; i++) { const side = rng() < 0.5 ? -1 : 1, x = side * (14 + rng() * 26), z = 38 + rng() * 10; if ([-tan30, 0, tan30].some(t => Math.abs(x - t * z) < 2.5)) continue; SC.tree(L, x, z, 6 + rng() * 6, 'bare', (rng() * 1e6) | 0); }

    // ---- the power main: a big lever switch on the back wall, on one side of the kitchen pass or the other ----
    Object.assign(s, { power: true, offAt: -9, lever: 1, amb: 1, down: [false, false, false], shown: [0, 0, 0], turnAt: [-9, -9, -9], lastTurn: -9, queued: null, slide: null, slides: 0, through: false, byHand: false, rattle: [0, 0, 0], beats: {}, dawn: 0 });
    const mainX = [-3.1, 1.75][Math.floor(L.rand() * 2)], MW = 0.72, MH = 0.95, MY = 0.95;
    SC.wallV(L, mainX - 0.05, -2.485, mainX + 0.05, -2.485, 0, MY + 0.06, [74, 76, 80]);   // its conduit, down into the floor
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
        s.power = false; s.offAt = L.t; AUDIO.sfx('lever'); G.shake(0.12);
        setTimeout(() => { AUDIO.sfx('clunk'); AUDIO.sfx('tubeDie'); }, 140);
        if (AUDIO.on()) AUDIO.startAmbient(Object.assign({}, L.def.ambient, { drone: 0.12 }));   // the hum of the place stops with it
        G.say('Every light in the place goes out at once. Out in the lot, it slows down.', 'Every light in the place goes out. Out in the lot, it slows down.');
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
      { x: -0.5, y: 1.02, z: -2.4 },                    // on the ledge of the kitchen pass
      { x: -3.2, y: 0, z: 0.3 },                        // on the floor by the register
    ], { w: 0.42, h: 0.42, flat: true, tool: true, icon: 'shutterCrank' });

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
      // drawn behind everything inside and in front of anything outside: the nearest point of its own plane, a little less
      const sortD = Math.min(Math.hypot(x0, ZS), Math.hypot(x1, ZS), x0 < 0 && x1 > 0 ? ZS : Infinity) - 0.05;
      return { ap, top, sortD, glassD: ZG / cs };
    });
    Object.assign(s, { turns: TURNS, turn: TURN, glassD: panes.map(q => q.glassD) });   // for the tests
    const shutters = PANES.map(([x0, x1], i) => {
      const t = mkTarget(L, {
        id: 'shutter' + i, name: ['Left', 'Middle', 'Right'][i] + ' shutter', x: (x0 + x1) / 2, y: BOT, z: 4.95, w: x1 - x0, h: TOP - BOT,
        crank: { n: TURNS, sfx: 'ratchet', onTurn() { s.turnAt[i] = L.t; }, onComplete() { shutterDown(i); } },
        onClick() {
          if (t.done) { G.say('That shutter is down.', 'That shutter is down.'); return true; }
          if (!G.hasItem('crank')) { s.byHand = true; G.say('It will not come down by hand. It needs its crank.', 'The shutter is rolled up. It will not come down by hand.'); AUDIO.sfx('nope'); return true; }
          if (L.t - s.lastTurn < TURN) { s.queued = t; return true; }   // the ratchet is still going round: this turn comes next
          s.lastTurn = L.t; return false;                                 // one turn of the crank (useTarget turns it)
        },
      });
      return t;
    });
    const cr = () => L.creature;   // made after build; s.target is the window it is making for, even while it slides there
    // it slides along the glass to window k: a straight line from where it is to the same distance out on k's way (no
    // nearer than just outside k's glass), quickly, its feet still. It keeps coming while it slides.
    const slideTo = k => {
      const c = cr(), ln = L.lanes[k], p0 = c.pos(), keep = ln.barrierDist + 0.15;
      const r0 = Math.max(Math.hypot(p0.x, p0.z), keep), len = Math.hypot(Math.sin(ln.yaw) * r0 - p0.x, Math.cos(ln.yaw) * r0 - p0.z), dur = clamp(len / 4.5, 0.5, 1.3);
      c.u = clamp(1 - r0 / c.D0, 0, 1);
      // on the way it walks a way of its own that turns to point at it, so its distance is its real distance and it is
      // drawn behind the shutters and piers it passes
      const way = Object.assign({}, ln, { apertures: [], blockers: [], name: 'along the glass' });
      const place = (x, z) => { const yaw = Math.atan2(x, z); way.yaw = yaw; way.dirX = Math.sin(yaw); way.dirZ = Math.cos(yaw); c.lane = way; c.yaw = yaw; return Math.hypot(x, z); };
      s.slide = { to: k, from: s.target }; s.target = k; s.slides++;
      L.lane = ln; L.laneIdx = k; L.barrierDist = ln.barrierDist;
      c.hold = null; c.reached = false; c.dist = place(p0.x, p0.z); c.lat = 0;
      let e0 = 0;
      c.distFn = (cc, dt) => {
        const m = cc.frozen || cc.dead ? 0 : cc.CR.speedMult(cc, dt, cc.seen);
        cc.u = clamp(cc.u + dt * m / cc.T, 0, 1);
        const r = Math.max(cc.D0 * (1 - cc.u), keep);
        e0 = Math.min(1, e0 + dt / dur);
        const e = smoothstep(e0), d = place(lerp(p0.x, Math.sin(ln.yaw) * r, e), lerp(p0.z, Math.cos(ln.yaw) * r, e));
        if (e0 >= 1) { cc.distFn = null; cc.retarget(k); cc.u = clamp(1 - d / cc.D0, 0, 1); s.slide = null; }
        return d;
      };
      const pan = Math.sin(wrapPi(ln.yaw - G.cam.yaw)) * 0.85;
      if (r0 < keep + 2) AUDIO.sfx('glassTap', pan);   // near enough to touch the glass as it goes
    };
    const shutterDown = i => {
      s.down[i] = true; AUDIO.sfx('clunk'); G.shake(0.15);
      const open = [0, 1, 2].filter(k => !s.down[k]);
      if (s.target !== i || s.through || !open.length) { G.say('The shutter is down.', 'The shutter is down.'); return; }
      // it was coming for this one: along the glass to the nearest window still open
      const p = cr().pos(), yaw = Math.atan2(p.x, p.z), gap = k => Math.abs(wrapPi(L.lanes[k].yaw - yaw));
      const best = Math.min(...open.map(gap)), near = open.filter(k => gap(k) < best + 0.01);
      slideTo(near[Math.floor(cr().rand() * near.length)]);
      G.say('The shutter is down. It slides along the glass to a window that is still open.', 'The shutter is down. It moves along the glass to another window.');
    };
    L.isWon = () => s.down.every(Boolean) && !s.through;
    L.deathCause = () => (s.power ? 'lit' : null);

    L.update = dt => {
      const c = cr();
      if (s.target === undefined) s.target = c.lane.idx;
      c.drawn = s.power; c.drawnMult = c.T / LIT_T;
      s.lever = Math.max(s.power ? 1 : 0, s.lever - dt * 5);
      s.amb += ((lightsOn() ? 1 : DARK_AMB + 0.22 * s.dawn) - s.amb) * Math.min(1, dt * (s.power ? 6 : 14)); L.pal.ambient = s.amb;
      // a turn clicked while the crank was still going round
      if (s.queued && L.t - s.lastTurn >= TURN && G.state === 'play') { const t = s.queued; s.queued = null; if (!t.done && G.hasItem('crank')) useTarget(t); }
      // each shutter comes down a step at a time as the crank goes round, and the glass it covers stops showing the lot
      shutters.forEach((t, i) => {
        const want = t.done ? 1 : (t.count || 0) / TURNS;
        s.shown[i] += (want - s.shown[i]) * Math.min(1, dt * 9);
        panes[i].ap.y1 = panes[i].top(TOP - (TOP - BOT) * s.shown[i]);
        s.rattle[i] = Math.max(0, s.rattle[i] - dt * 1.6);
      });
      // at an open window it does not stop: it comes through the glass
      if (!s.slide && !s.through && !L.won && !c.dead && c.dist < panes[c.lane.idx].glassD) {
        s.through = true; AUDIO.sfx('glassGive', Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); G.shake(0.4);
      }
    };
    // won: wherever it is, it comes straight up to the last shutter (you hear it, quick, on the other side) and stands at the
    // glass. It tries the shutter, then it is quiet; it gets light at the cracks, and it walks away.
    L.aftermath = t => {
      const c = cr(), pan = Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85, b = L.barrierDist;
      if (!s.won0) { s.won0 = true; s.slide = null; const v = Math.max(1.5, (c.dist - b) / 2); c.hold = null; c.distFn = (cc, dt) => Math.max(b, cc.dist - dt * v); }
      if (s.arriveT === undefined && c.dist <= b + 0.01) s.arriveT = t;
      if (s.arriveT === undefined) return false;
      const a = t - s.arriveT;
      const beat = (k, when, fn) => { if (!s.beats[k] && a >= when) { s.beats[k] = true; fn(); } };
      const rattle = k => { AUDIO.sfx('gate', pan); G.shake(0.3 * k); s.rattle[s.target] = k; };
      beat('a', 0.4, () => rattle(1)); beat('b', 1.3, () => rattle(1)); beat('c', 2.4, () => rattle(0.6));
      beat('dawn', 3.3, () => { s.dawnAt = L.t; });
      beat('away', 4.4, () => { c.away = true; c.frozen = true; c.distFn = (cc, dt) => cc.dist + dt * 1.3; });
      if (s.dawnAt !== undefined) s.dawn = clamp((L.t - s.dawnAt) / 2.5, 0, 1);
      return a > 7.4;
    };

    // ---- what changes from frame to frame ----
    const TUBES = [[-2.6, 0.4], [0, 0.4], [2.6, 0.4], [-2.6, 3.2], [0, 3.2], [2.6, 3.2]];
    L.dynamic = () => {
      const on = lightsOn();
      for (const [cx, cz] of TUBES) R.add(SC.mkQuad(L, [cx - 0.65, 2.96, cz - 0.07], [cx + 0.65, 2.96, cz - 0.07], [cx + 0.65, 2.96, cz + 0.07], [cx - 0.65, 2.96, cz + 0.07], on ? [240, 246, 230] : [60, 62, 58], on ? { noFog: true, noLight: true } : {}));
      // the shutters, outside the glass, coming down from the slot at the top: steel slats, a heavy bottom rail
      PANES.forEach(([x0, x1], i) => {
        const cov = (TOP - BOT) * s.shown[i];
        if (cov < 0.01) return;
        const yb = TOP - cov, sd = panes[i].sortD, w = s.rattle[i] * 0.03 * Math.sin(L.t * 47), z = ZS + w;
        const seam = s.dawn > 0 ? mixc([70, 68, 62], [236, 226, 200], s.dawn * 0.85) : [70, 68, 62], so = s.dawn > 0 ? { noLight: true, noFog: true } : {};
        R.add(SC.mkQuad(L, [x0, yb, z], [x1, yb, z], [x1, TOP, z], [x0, TOP, z], steel, { sortDist: sd }));
        for (let y = TOP - 0.15; y > yb + 0.08; y -= 0.15) R.add(SC.mkQuad(L, [x0, y, z - 0.004], [x1, y, z - 0.004], [x1, y + 0.022, z - 0.004], [x0, y + 0.022, z - 0.004], seam, Object.assign({ sortDist: sd - 0.001 }, so)));
        R.add(SC.mkQuad(L, [x0, yb, z - 0.008], [x1, yb, z - 0.008], [x1, yb + 0.08, z - 0.008], [x0, yb + 0.08, z - 0.008], [50, 48, 46], { sortDist: sd - 0.002 }));
        if (s.dawn > 0 && s.down[i]) R.add(SC.mkQuad(L, [x0, BOT - 0.02, z - 0.01], [x1, BOT - 0.02, z - 0.01], [x1, BOT + 0.012, z - 0.01], [x0, BOT + 0.012, z - 0.01], mixc([50, 48, 46], [250, 240, 214], s.dawn), { sortDist: sd - 0.003, noLight: true, noFog: true }));
        // the crank in the gearbox, going round, for a moment after each turn
        if (L.t - s.turnAt[i] < 0.9 && !L.won) {
          const rot = (shutters[i].count || 0) * 1.3 + clamp((L.t - s.turnAt[i]) / 0.3, 0, 1) * 1.3;
          R.add(SC.mkSprite(L, x0 - 0.15, 0.9, 4.88, 0.34, 0.34, (ctx, P) => { ctx.translate(0, 0.17); ctx.rotate(rot); ctx.translate(0, -0.17); ctx.scale(0.34, 0.34); ICONS.shutterCrank(ctx, P); }));
        }
      });
    };
    const at = (x, y, z) => { const p = L.pt(x, y, z); return { x: p[0], y: p[1], z: p[2] }; };
    const roomLights = TUBES.map(([x, z], k) => Object.assign(at(x, 2.9, z), { r: 7, i: 0.3, color: [205, 235, 215], flicker: 0.04, seed: k * 3 }))
      .concat(PANES.map(([x0, x1], k) => Object.assign(at((x0 + x1) / 2 * 1.4, 1.4, 7.8), { r: 5, i: 0.35, color: [210, 236, 220], seed: k * 5 + 1 })))   // the windows' light spilling out over the lot
      .concat([Object.assign(at(0, 2.2, 4.7), { r: 2.5, i: 0.3, color: [255, 80, 200], flicker: 0.2, seed: 9 })]);
    L.dynamicLights = () => (lightsOn() ? roomLights : []);
    const glow = (x, y, z, r, color, a) => Object.assign(at(x, y, z), { r, color, a });
    const glowsOut = [glow(-4.2, 4.95, 15, 3.5, [255, 70, 190], 0.25), glow(3.1, 5.4, 11.6, 2.5, [255, 180, 80], 0.3)], glowsAll = glowsOut.concat([glow(0, 2.36, 4.9, 1.2, [255, 80, 200], 0.28)]);
    L.glows = () => (lightsOn() ? glowsAll : glowsOut);
    L.floor = { poly: [[-3.8, -2.3], [3.8, -2.3], [3.8, 0.65], [-3.8, 0.65]], y: 0 };
  }
});
