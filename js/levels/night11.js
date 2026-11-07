'use strict';
// ============================================================ 11. THE BARN ============================================================
// The hayloft. It comes across the yard for the loft door, up the hoist chute, or in through the barn and up
// the ladder at the open edge. It goes faster the more you carry. Fire between you and it, and carry less.

// the barn's own things: an oil lantern (a hurricane lantern with a glass font, so you can see whether there is oil in it:
// empty, filled amber, lit), and a feed sack that reads as a sack, tied at the neck
function barnLantern(ctx, P, mode) {
  const tin = P.col([96, 94, 88]), tinD = P.col([58, 56, 54]), glass = P.col([78, 80, 74]), wick = P.col([30, 26, 22]);
  ctx.strokeStyle = tinD; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.arc(0, 0.82, 0.19, 0.1, Math.PI - 0.1); ctx.stroke();   // the bail
  P_line(ctx, -0.31, 0.2, -0.31, 0.72, 0.045, tin); P_line(ctx, 0.31, 0.2, 0.31, 0.72, 0.045, tin);                     // the side tubes
  P_line(ctx, -0.31, 0.72, -0.14, 0.76, 0.04, tin); P_line(ctx, 0.31, 0.72, 0.14, 0.76, 0.04, tin);
  if (mode === 'lit') {
    const g = ctx.createRadialGradient(0, 0.48, 0.02, 0, 0.48, 0.42);
    g.addColorStop(0, 'rgba(255,224,150,0.95)'); g.addColorStop(0.5, 'rgba(255,190,96,0.5)'); g.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = g; ctx.fillRect(-0.5, 0.06, 1, 0.9);
    P_ell(ctx, 0, 0.49, 0.19, 0.2, P.raw([250, 206, 128]));                                                                // the globe, full of light
    P_ell(ctx, 0, 0.45 + Math.sin(P.t * 23) * 0.008, 0.04, 0.085 + Math.sin(P.t * 17) * 0.012, P.raw([255, 246, 210]));   // the flame
  } else {
    P_ell(ctx, 0, 0.49, 0.19, 0.2, glass);                                                                                 // the globe, dark
    P_line(ctx, -0.1, 0.4, -0.1, 0.58, 0.025, P.col([128, 130, 120]));                                                    // a glint on the glass
  }
  P_rect(ctx, -0.05, 0.3, 0.1, 0.07, wick);                                                                                // the burner
  for (const x of [-0.2, 0.2]) P_line(ctx, x, 0.32, x * 1.1, 0.66, 0.018, tinD);                                          // the wire guard
  P_line(ctx, -0.2, 0.49, 0.2, 0.49, 0.018, tinD);
  P_poly(ctx, [[-0.17, 0.68], [0.17, 0.68], [0.1, 0.8], [-0.1, 0.8]], tin); P_rect(ctx, -0.06, 0.8, 0.12, 0.04, tinD);   // the cap
  P_rect(ctx, -0.17, 0.26, 0.34, 0.05, tinD);                                                                              // the collar
  // the font: glass, so the oil shows; empty it is dark and hollow
  P_ell(ctx, 0, 0.16, 0.33, 0.13, tinD);
  P_ell(ctx, 0, 0.16, 0.29, 0.1, mode === 'empty' ? P.col([34, 34, 32]) : P.col([182, 120, 40]));
  if (mode !== 'empty') P_ell(ctx, -0.1, 0.19, 0.1, 0.03, P.col([226, 176, 92]));
  else P_line(ctx, -0.2, 0.2, 0.08, 0.22, 0.02, P.col([96, 98, 92]));
}
Object.assign(ICONS, {
  barnLantern(ctx, P) { barnLantern(ctx, P, 'empty'); },
  barnLanternFull(ctx, P) { barnLantern(ctx, P, 'full'); },
  barnLanternLit(ctx, P) { barnLantern(ctx, P, 'lit'); },
  feedSack(ctx, P) {
    const cloth = P.col([150, 128, 92]), clothD = P.col([106, 88, 60]), twine = P.col([70, 54, 34]), mark = P.col([96, 60, 44]);
    ctx.fillStyle = cloth; ctx.beginPath();   // slumped, wide at the foot, gathered to a neck
    ctx.moveTo(-0.38, 0.04); ctx.quadraticCurveTo(-0.48, 0.42, -0.22, 0.66); ctx.lineTo(-0.07, 0.74); ctx.lineTo(0.07, 0.74); ctx.lineTo(0.22, 0.66);
    ctx.quadraticCurveTo(0.48, 0.42, 0.38, 0.04); ctx.quadraticCurveTo(0, -0.03, -0.38, 0.04); ctx.closePath(); ctx.fill();
    P_poly(ctx, [[-0.07, 0.74], [-0.2, 0.92], [-0.05, 0.84], [0, 0.95], [0.05, 0.84], [0.19, 0.9], [0.07, 0.74]], cloth);   // the ears above the tie
    P_line(ctx, -0.1, 0.75, 0.1, 0.75, 0.05, twine);
    P_line(ctx, -0.18, 0.6, -0.05, 0.72, 0.014, clothD); P_line(ctx, 0.18, 0.6, 0.05, 0.72, 0.014, clothD);                   // folds into the neck
    P_rect(ctx, -0.22, 0.26, 0.44, 0.15, mark); P_rect(ctx, -0.16, 0.31, 0.32, 0.05, cloth);                                 // a stencilled band
    P_line(ctx, -0.34, 0.08, 0.34, 0.08, 0.016, clothD);
  },
});
LEVELS.push({
  id: 'barn', title: 'The Barn', facing: 90, eyeH: 4.65, laneSwitch: false,
  pal: { skyTop: [8, 8, 16], fog: [36, 34, 40], ground: [40, 38, 30], fogDist: 90 },
  ambient: { wind: 0.8, drone: 0.7, droneFreq: 47, windFreq: 330 },
  lights: [{ x: -2.2, y: 4.1, z: -2.2, r: 5, i: 0.4, color: [255, 200, 130], flicker: 0.2 }, { x: 0, y: 1.5, z: 42, r: 10, i: 0.4, color: [255, 200, 120] }],
  text: {
    intro: 'The loft is full of last summer, dry as paper, and something is coming across the yard for it. It is bent double under something it carries, and it goes faster the more you are carrying yourself.<br>Put things down.',
    hint: 'Fill the lantern with oil at the drum, light it with the matches, and throw it into the hay between you and it. It comes faster the more you carry, so carry as little as you can.',
    objective: 'Set the hay alight between you and it. Carry little.',
    death: { default: 'It did not put down what it was carrying. It put you with it.' },
    win: 'It paced the line of the fire for an hour and then sat down in the yard with its arms round itself, facing the loft, and stayed there until the light came.',
    fragment: 'Your hand hurt in the morning from holding on to something all night. It knew what you were holding. It always knows.',
  },
  // north: the yard, the hoist chute up to the loft door (a ramp lane). East: the barn floor and the ladder at the open edge.
  lanes: [
    { deg: 0, name: 'the loft door', elev: -22.4, ramp: true, barrierDist: 16.2, cue: 'creak', default: true, apertures: [{ z: 4 / Math.cos(22.4 * DEG), x0: -1.2, x1: 1.2, y0: 3.0, y1: 5.2 }] }, // up the chute to the door at the loft's north edge
    { deg: 90, name: 'the ladder', elev: -73, ramp: true, barrierDist: 25.7, cue: 'clunk' }, // along the barn floor past the hay, then up the ladder
  ],
  creatures: [{ type: 'carrier', startDist: 34, time: 70, unseenMult: 1.25 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, FL = 3.0;
    const wood = [66, 52, 38], woodD = [44, 34, 26], hay = [150, 128, 70], hayD = [104, 86, 44];
    const ptex = { tex: 'planks', texScale: 1.3 };
    SC.stars(L, 111, 200, 0.9);
    SC.moon(L, 200, 25, 6, [226, 222, 200]);
    // the yard north, the farmhouse with one lit window, fences and the fields
    SC.floorQ(L, -200, -200, 200, 200, -0.01, [40, 38, 30]);
    SC.floorQ(L, -12, 2.5, 12, 24, 0.0, [58, 52, 38]);
    SC.box(L, -6, 6, 0, 5.5, 41, 47, [30, 26, 24]); SC.quad(L, [-6.5, 5.5, 40.5], [6.5, 5.5, 40.5], [0, 8.5, 44], [0, 8.5, 44], [24, 20, 18]); SC.quad(L, [-6.5, 5.5, 47.5], [6.5, 5.5, 47.5], [0, 8.5, 44], [0, 8.5, 44], [22, 18, 16]);
    SC.sprite(L, 0.6, 1.4, 40.9, 1.1, 1.3, (ctx, P) => { ctx.scale(1.1, 1.3); P_rect(ctx, -0.5, 0, 1, 1, P.raw([232, 196, 120])); P_rect(ctx, -0.04, 0, 0.08, 1, P.raw([60, 40, 30])); P_rect(ctx, -0.5, 0.48, 1, 0.06, P.raw([60, 40, 30])); }, { noFog: true, noLight: true });
    SC.fenceLine(L, -30, 24, -3, 24, 2.6, 1.1, [50, 44, 36]); SC.fenceLine(L, 3, 24, 30, 24, 2.6, 1.1, [50, 44, 36]);
    const rng = mulberry32(121);
    for (let i = 0; i < 30; i++) { const x = (rng() - 0.5) * 160, z = 30 + rng() * 90; if (Math.abs(x) < 9 && z < 50) continue; SC.tree(L, x, z, 7 + rng() * 8, rng() < 0.5 ? 'bare' : 'round', (rng() * 1e6) | 0); }
    for (let i = 0; i < 24; i++) { const x = 30 + rng() * 120, z = (rng() - 0.5) * 120; if (Math.abs(z) < 6) continue; SC.tree(L, x, z, 7 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    for (let i = 0; i < 16; i++) { const x = -30 - rng() * 100, z = (rng() - 0.5) * 120; SC.tree(L, x, z, 7 + rng() * 8, 'bare', (rng() * 1e6) | 0); }
    // the barn: a long shed running east; the loft over its west end, open along its east edge
    // The loft floor is one board quad that hides whatever is under it: it is ordered behind everything that stands on the
    // loft (sortDist via dist, which its boards share) and in front of what is below it. Nothing under the loft can be seen
    // from up here, so the walls and posts there start at the loft floor instead of being drawn over its boards; the one
    // piece below it that shows past the open edge (the wall under the loft door) is ordered behind it.
    SC.floorQ(L, -4.5, -4, 16.5, 4, 0.01, [52, 44, 34]);
    SC.wallV(L, -4.5, -4, 16.5, -4, 0, 6.5, woodD, ptex); SC.wallV(L, -4.5, -4, -4.5, 4, FL, 6.5, woodD, ptex);
    SC.wallV(L, -4.5, 4, -1.2, 4, FL, 6.5, woodD, ptex); SC.wallV(L, 1.2, 4, 16.5, 4, 0, 6.5, woodD, ptex);
    SC.wallV(L, 0.5, 4, 1.2, 4, 0, FL, woodD, Object.assign({ dist: 7 }, ptex)); SC.wallV(L, -1.2, 4, 1.2, 4, 5.2, 6.5, woodD, ptex);
    SC.wallV(L, 16.5, -4, 16.5, -2, 0, 6.5, woodD, ptex); SC.wallV(L, 16.5, 2, 16.5, 4, 0, 6.5, woodD, ptex); SC.wallV(L, 16.5, -2, 16.5, 2, 4.2, 6.5, woodD, ptex);
    SC.quad(L, [-5, 6.5, -4.5], [17, 6.5, -4.5], [17, 8.6, 0], [-5, 8.6, 0], [30, 24, 18]); SC.quad(L, [-5, 6.5, 4.5], [17, 6.5, 4.5], [17, 8.6, 0], [-5, 8.6, 0], [26, 20, 16]);
    for (const x of [-4.5, 16.5]) SC.quad(L, [x, 6.5, -4], [x, 6.5, 4], [x, 8.6, 0], [x, 8.6, 0], woodD, ptex);   // the gable ends, closed
    for (let x = -4; x < 16; x += 3) SC.box(L, x - 0.1, x + 0.1, x < 0.5 ? FL : 0, 6.5, -3.95, -3.75, wood);
    SC.quad(L, [-4.5, FL, -4], [0.5, FL, -4], [0.5, FL, 4.0], [-4.5, FL, 4.0], [62, 51, 38], { tex: 'planks', texScale: 1.3, dist: 6.1 });
    SC.box(L, 0.3, 0.5, FL, FL + 0.15, -4, 4.0, wood);   // the lip along the open edge
    // the loft door north, the hoist beam above it, and the chute down to the yard
    for (const [x0, x1] of [[-1.35, -1.2], [1.2, 1.35]]) SC.box(L, x0, x1, FL, 5.35, 3.95, 4.1, wood);
    SC.box(L, -1.35, 1.35, 5.2, 5.35, 3.95, 4.1, wood);
    SC.box(L, -0.1, 0.1, 5.35, 5.5, 3.5, 5.2, wood);
    SC.quad(L, [-0.9, FL, 4.0], [0.9, FL, 4.0], [0.9, 0.05, 11.3], [-0.9, 0.05, 11.3], [58, 46, 34]);
    for (let k = 0; k < 8; k++) { const u = k / 8, y = FL - u * FL + 0.03, z = 4.0 + u * 7.3; SC.box(L, -0.9, 0.9, y, y + 0.06, z - 0.04, z + 0.04, woodD); }
    // (the ladder up the east edge is drawn in L.dynamic, so that it can be pulled up)
    // the hay: a stack in the yard under the loft door, and a stack on the barn floor to the east
    // the yard hay stands either side of the chute's foot, leaving the way up it clear (it is never hidden on its way in);
    // lit, the fire spreads across the gap and it stands beyond it (barrier 15 m out along the ground)
    SC.box(L, -3.4, -1.1, 0, 1.4, 11.6, 14.0, hay); SC.box(L, 1.1, 3.4, 0, 1.4, 11.6, 14.0, hay); SC.box(L, -3.0, -1.5, 1.4, 2.0, 11.9, 13.7, hayD); SC.box(L, 1.5, 3.0, 1.4, 2.0, 11.9, 13.7, hayD);
    SC.box(L, 7.8, 11.2, 0, 1.6, -3.9, -1.3, hay); SC.box(L, 8.3, 10.7, 1.6, 2.4, -3.5, -1.7, hayD); SC.box(L, 8.0, 10.0, 0, 1.2, 1.2, 2.6, hayD);
    // loft clutter: the oil drum with its tap, crates, a lantern on one of them, sacks
    // the oil drum: a sprite (a drum looks the same from every side) on the target's own spot, so the outline you see when you
    // point at it is round the drum. Hoops, a lid with its bungs, and at the front the tap: rusted solid, rust-red with its
    // handle across, until the wrench frees it; then bright, its handle turned up and a drip of oil under the spout.
    const DR = 0.4, drumC = [50, 62, 55], drumLift = 0.12;
    SC.sprite(L, -2.6, FL - drumLift, -2.2, 0.86, 1.04 + drumLift, (ctx, P) => {
      ctx.translate(0, drumLift);
      const body = P.col(drumC), dark = P.col(scalec(drumC, 0.62)), lite = P.col(mixc(drumC, [190, 200, 190], 0.2)), rim = P.col(scalec(drumC, 0.8));
      const top = 0.92, free = !s.tapStuck;
      ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(-DR, top); ctx.lineTo(-DR, 0); ctx.ellipse(0, 0, DR, 0.11, 0, Math.PI, TAU, false); ctx.lineTo(DR, top); ctx.closePath(); ctx.fill();
      P_rect(ctx, -DR, 0, 0.09, top, dark); P_rect(ctx, DR - 0.09, 0, 0.09, top, dark); P_rect(ctx, -0.2, 0.04, 0.06, top - 0.06, lite);   // round: dark at the sides, a sheen
      for (const [y, ry] of [[0.3, 0.1], [0.62, 0.095]]) {   // the rolling hoops, curving round toward you
        ctx.lineWidth = 0.035; ctx.strokeStyle = rim; ctx.beginPath(); ctx.ellipse(0, y, DR, ry, 0, Math.PI, TAU, false); ctx.stroke();
        ctx.lineWidth = 0.012; ctx.strokeStyle = lite; ctx.beginPath(); ctx.ellipse(0, y + 0.02, DR - 0.01, ry, 0, Math.PI + 0.3, TAU - 0.3, false); ctx.stroke();
      }
      P_ell(ctx, 0, top, DR, 0.085, rim); P_ell(ctx, 0, top + 0.004, DR - 0.03, 0.065, P.col(mixc(drumC, [150, 160, 150], 0.22)));   // the lid
      P_ell(ctx, 0.2, top + 0.01, 0.045, 0.018, dark); P_ell(ctx, -0.22, top - 0.01, 0.03, 0.012, dark);                               // its bungs
      // the tap, low on the front
      const tap = free ? P.col([176, 146, 80]) : P.col([128, 66, 36]), tapD = free ? P.col([110, 88, 44]) : P.col([82, 42, 26]);
      if (!free) for (const [x, y, r] of [[-0.07, 0.24, 0.05], [0.09, 0.15, 0.04], [0.02, 0.31, 0.03]]) P_ell(ctx, x, y, r, r * 0.8, P.col([100, 56, 34]));   // rust round it
      P_rect(ctx, -0.045, 0.16, 0.09, 0.1, tap); P_rect(ctx, -0.025, 0.08, 0.05, 0.09, tapD);   // the body of the tap, the spout
      if (free) { P_line(ctx, 0, 0.27, 0, 0.36, 0.03, tap); P_ell(ctx, 0, 0.37, 0.035, 0.02, tap); P_ell(ctx, 0, 0.05, 0.016, 0.022, P.col([46, 34, 14])); }   // handle turned up; a drip
      else P_line(ctx, -0.1, 0.28, 0.1, 0.28, 0.03, tap);   // handle across, rusted shut
    });
    SC.box(L, -2.6, -1.8, FL, FL + 0.6, -3.7, -3.1, [84, 68, 50]); SC.box(L, -1.7, -1.0, FL, FL + 0.45, -3.7, -3.2, [84, 68, 50]);
    STORY.lamp(L, -2.2, FL + 0.6, -3.4, { lit: true, scale: 0.9 });
    SC.box(L, -4.2, -3.4, FL, FL + 0.9, -1.0, 0.6, [124, 106, 70]); SC.box(L, -4.2, -3.6, FL + 0.9, FL + 1.5, -0.8, 0.4, [110, 92, 62]);
    // items
    const decoy = !!L.diff.decoys, stuck = L.nightmare;
    mkItem(L, 'lantern', 'Lantern', [
      { x: -1.2, y: FL + 0.45, z: -3.4 },              // on the low crate
      { x: -3.8, y: FL + 1.5, z: -0.2 },               // on the sacks
      { x: -0.05, y: FL + 0.02, z: 1.2, flat: true },  // on the floor towards the loft door (clear of the lip at the edge)
      { x: -0.5, y: FL + 0.02, z: -2.5, flat: true },  // on the floor by the drum
    ], { w: 0.3, h: 0.44, icon: 'barnLantern' });
    mkItem(L, 'matches', 'Matches', [
      { x: -2.5, y: FL + 0.92, z: -2.2, flat: false },  // on the drum's lid
      { x: -2.0, y: FL + 0.6, z: -3.5, flat: false },   // on the crate
      { x: 0.0, y: FL + 0.02, z: 3.4, flat: true },     // by the loft door sill (clear of the lip)
      { x: -3.8, y: FL + 0.02, z: 2.0, flat: true },    // north-west corner (clear of the feed sack's spot in front of it)
    ], { w: 0.16, h: 0.16, tool: true });
    // no spot sits behind the drum, the crates or the sacks as you see them from where you stand
    if (stuck) mkItem(L, 'wrench', 'Wrench', [{ x: -1.7, y: FL + 0.02, z: -2.3, flat: true }, { x: 0.0, y: FL + 0.02, z: -0.8, flat: true }, { x: -1.4, y: FL + 0.45, z: -3.35 }], { w: 0.34, h: 0.34, tool: true, weight: 2 });   // the last on the low crate, not above it
    if (decoy) {
      mkItem(L, 'pail', 'Water pail', [{ x: -1.0, y: FL + 0.02, z: 0.6 }, { x: 0.0, y: FL + 0.02, z: -3.2 }], { w: 0.34, h: 0.38, weight: 2, decoy: true, decoyText: 'Water. The hay is soaked now; it will not take a flame for a while.' });
      mkItem(L, 'sack', 'Feed sack', [{ x: -2.8, y: FL + 0.02, z: 0.9 }, { x: 0.1, y: FL + 0.02, z: -1.8 }], { w: 0.4, h: 0.5, weight: 2, icon: 'feedSack' });
      mkItem(L, 'chain', 'Chain', [{ x: -4.0, y: FL + 0.02, z: -1.8, flat: true }, { x: -0.8, y: FL + 0.02, z: 2.4, flat: true }], { w: 0.5, h: 0.5, weight: 2 });
    }
    Object.assign(s, { tapStuck: stuck, fireN: false, fireE: false, wetN: 0, wetE: 0, ladderUp: false, ladderK: 0 });
    const c0 = () => L.creatures[0];
    const drum = mkTarget(L, {
      id: 'drum', name: 'Oil drum', x: -2.6, y: FL - drumLift, z: -2.2, w: 0.86, h: 1.04 + drumLift,   // the drum sprite's own box
      accepts: ['lantern'].concat(stuck ? ['wrench'] : []),
      hint() { return s.tapStuck ? 'The drum. Its tap is rusted shut.' : 'The oil drum. The tap turns.'; },
      use(item) {
        if (item.id === 'wrench') { if (!s.tapStuck) { G.say('The tap already turns.', 'Done.'); return false; } s.tapStuck = false; AUDIO.sfx('lever'); G.say('The tap frees. Put the wrench down; it is heavy.', 'It turns.'); return true; }
        if (s.tapStuck) { G.say('The tap will not turn. It wants a wrench.', 'Stuck.'); return false; }
        G.removeFromInv(item);
        const full = newItem(L, 'lantern_full', 'Lantern, filled', { w: 0.3, h: 0.44, icon: 'barnLanternFull' });
        G.inv.push(full); G.active = G.inv.length - 1; AUDIO.sfx('pour'); G.say('Filled. Now a match.', 'Filled.');
        return true;
      },
    });
    void drum;
    mkRecipe(L, { parts: ['lantern_full', 'matches'], result: { id: 'lantern_lit', name: 'Lantern, lit', opts: { w: 0.3, h: 0.44, throwable: true, icon: 'barnLanternLit' } }, sfx: 'strike', text: 'It catches. Now throw it.', onCombine: (it, L2) => { const m = L2.items.find(i => i.id === 'matches'); if (m) { m.taken = true; G.inv.push(m); } } });
    const mkHay = (id, name, deg, dist, w, flag, wet) => {
      const away = () => !L.nightmare && (flag === 'fireN') !== (c0().lane.idx === 0);
      const t = mkTarget(L, {
        id, name, deg, dist, y: 0, w, h: 2.4, accepts: ['lantern_lit', 'lantern', 'lantern_full'].concat(decoy ? ['pail'] : []),
        // on Normal the hay it is not coming past is refused before the lantern leaves your hand
        onClick() { if (away() && G.hasItem('lantern_lit')) { G.say('Nothing is coming this way.', 'Not this one.'); AUDIO.sfx('nope'); return true; } return false; },
        hint() { return s[flag] ? (away() ? 'Burning, but it is not coming this way.' : 'Burning.') : s[wet] > 0 ? 'Soaked. It will not catch yet.' : away() ? 'Dry hay, but it is not coming this way.' : 'Dry hay. It would go up in a moment.'; },
        use(item) {
          if (item.id === 'lantern' || item.id === 'lantern_full') { G.say(item.id === 'lantern' ? 'The lantern is empty. Fill it at the oil drum.' : 'It is not lit. Use the matches on it first.', 'It is not lit.'); return false; }
          if (item.id !== 'lantern_lit') return false;
          if (s[wet] > 0) { G.say('The lantern hisses out in the wet hay. It comes back to you unlit.', 'It goes out.'); G.inv.push(newItem(L, 'lantern_full', 'Lantern, filled', { w: 0.3, h: 0.44, icon: 'barnLanternFull' })); G.active = G.inv.length - 1; return false; } // the soaking is temporary, so the lantern is not lost
          s[flag] = true; AUDIO.sfx('hiss'); setTimeout(() => AUDIO.sfx('thunder'), 200); G.shake(0.3); WEATHER.set({ kind: 'ash', density: 0.9, wind: 0.4 }, G.runSeed + 11);
          G.say('It goes up all at once.', 'Fire.'); return true;
        },
      });
      return t;
    };
    const hayN = mkHay('hayN', 'The hay in the yard', 0, 12.8, 6.8, 'fireN', 'wetN'), hayE = mkHay('hayE', 'The hay in the barn', 105.3, 9.85, 3.6, 'fireE', 'wetE'); // the barn stack sits south of its walking line
    // a decoy pail soaks whichever hay it is thrown at
    const wetHay = (t) => { const k = t === hayN ? 'wetN' : 'wetE'; s[k] = 25; };
    void hayE;
    L.onDecoy = (t, item) => { if (item.id === 'pail') wetHay(t); };
    // The ladder leans on the lip of the open edge, its foot out on the barn floor. It climbs a little steeper than the way
    // the thing comes up it (that way runs straight at your eyes, so a ladder along it would show as a line), and its stiles
    // run on a metre past the edge, as a ladder's do: from up here you see the top of it at your feet, two stiles and rungs.
    // Hauled up, it tips back over the lip as it slides up, and comes down on the boards with its foot end resting on the lip.
    const LAD = { E: [0.52, FL + 0.15], len: 4.16, hw: 0.3, foot: [1.15, 0.02], d1: 0.24, th1: -Math.atan(0.12 / 3.92) };
    LAD.D0 = Math.hypot(LAD.foot[0] - LAD.E[0], LAD.foot[1] - LAD.E[1]); LAD.th0 = Math.atan2(LAD.E[1] - LAD.foot[1], LAD.foot[0] - LAD.E[0]);
    const ladder = L.nightmare ? mkTarget(L, { // only Nightmare asks for the ladder, so only Nightmare offers it
      id: 'ladder', name: 'Ladder', x: 0.36, y: FL + 0.05, z: 0, w: 1.4, h: 1.0, hold: 3.0,   // round the part of it you can see: its top
      hint() { return s.ladderUp ? 'Pulled up onto the loft.' : 'The ladder up from the barn floor. It could be pulled up.'; },
      use(item) { if (item !== null) return false; s.ladderUp = true; ladder.hidden = true; AUDIO.sfx('clunk'); G.say('The ladder is up. Nothing climbs that way now.', 'Up.'); return true; },   // up, it is plainly done: nothing to point at
    }) : null;
    const sealed = lane => lane.idx === 0 ? s.fireN : (s.fireE || (L.nightmare && s.ladderUp)); // the ladder only counts where it is the extra step
    L.sealed = sealed;
    // Nightmare wants the ladder up as well as a fire, whichever way it comes
    L.isWon = () => L.nightmare ? (s.ladderUp && (s.fireN || s.fireE) && sealed(c0().lane)) : sealed(c0().lane);
    L.objectiveText = () => { const c = c0(); const load = G.inv.reduce((a, i) => a + (i.weight || 1), 0); return (sealed(c.lane) ? 'Sealed. ' : c.lane.idx === 0 ? 'Fire in the yard hay. ' : (L.nightmare ? 'Fire in the barn hay, or pull the ladder up. ' : 'Fire in the barn hay. ')) + (L.nightmare && !s.ladderUp ? 'Pull the ladder up too. ' : '') + 'Carrying ' + load + '.'; };
    L.update = dt => {
      const c = c0();
      c.load = G.inv.reduce((a, i) => a + (i.weight || 1), 0);
      if (s.wetN > 0) s.wetN -= dt; if (s.wetE > 0) s.wetE -= dt;
      if (!s.ladderUp) s.ladderK = Math.max(0, s.ladderK - dt); else s.ladderK = Math.min(1, s.ladderK + dt * 1.5);
      // on Nightmare a fire or the ladder holds it, but the night wants both: say what it is waiting at, once
      if (L.nightmare && c.sealHold && !L.won && !s.toldHeld) { s.toldHeld = true; G.say(s.ladderUp ? 'It stops below the loft and waits. There is no fire between you yet.' : 'It stops at the fire and waits. The ladder is still down.', s.ladderUp ? 'It stops below the loft, and waits. There is no fire between you yet.' : 'It stops at the fire, and waits. The ladder is still down.'); }
    };
    L.dynamic = () => {
      // the ladder: pivoting on the lip as it is hauled up, lying on the boards once up. A piece wholly below the loft floor
      // is ordered behind the floor, which hides it wherever it is under the loft.
      const k = smoothstep(s.ladderK), th = lerp(LAD.th0, LAD.th1, k), d = lerp(LAD.D0, LAD.d1, k);
      const ax = -Math.cos(th), ay = Math.sin(th), E = LAD.E, foot = [E[0] - ax * d, E[1] - ay * d];
      const at = u => [foot[0] + ax * LAD.len * u, foot[1] + ay * LAD.len * u];
      const under = (p, q) => (Math.max(p[1], q[1]) < FL + 0.02 ? { sortDist: 7 } : null);
      const stileC = [104, 82, 56], rungC = [88, 69, 48];
      for (const [u0, u1] of [[0, 0.37], [0.37, 0.73], [0.73, 1]]) {
        const p = at(u0), q = at(u1);
        for (const z of [-LAD.hw, LAD.hw]) R.add(SC.mkQuad(L, [p[0], p[1], z - 0.03], [p[0], p[1], z + 0.03], [q[0], q[1], z + 0.03], [q[0], q[1], z - 0.03], stileC, under(p, q)));
      }
      for (let r = 0; r < 12; r++) {   // each rung both ways across, so it shows whether the ladder stands or lies
        const c = at(0.045 + r * 0.0835), o = under(c, c), t = 0.018, z0 = -LAD.hw + 0.02, z1 = LAD.hw - 0.02;
        R.add(SC.mkQuad(L, [c[0] - ax * t, c[1] - ay * t, z0], [c[0] - ax * t, c[1] - ay * t, z1], [c[0] + ax * t, c[1] + ay * t, z1], [c[0] + ax * t, c[1] + ay * t, z0], rungC, o));
        R.add(SC.mkQuad(L, [c[0] - ay * t, c[1] + ax * t, z0], [c[0] - ay * t, c[1] + ax * t, z1], [c[0] + ay * t, c[1] - ax * t, z1], [c[0] + ay * t, c[1] - ax * t, z0], scalec(rungC, 0.82), o));
      }
      // fire: flames over whichever hay is burning. In the yard the fire runs across the gap at the chute's foot too: there
      // the flames burn low on the ground (spilt straw), not in the air at the height of the stacks, and what stands beyond
      // them can be seen over them
      for (const [on, cx, cz, w, gap] of [[s.fireN, 0, 12.8, 6.8, 1.1], [s.fireE, 9.5, -2.6, 3.6, 0]]) if (on) {
        for (let i = 0; i < 7; i++) { const ph = i * 1.7, x = cx + (i - 3) * w / 7, z = cz + Math.sin(ph) * 0.8, low = Math.abs(x - cx) < gap, fw = 0.9 + Math.sin(L.t * 5 + ph) * 0.2;
          const fh = (2.2 + Math.sin(L.t * 9 + ph) * 0.6 + Math.sin(L.t * 23 + ph * 2) * 0.3) * (low ? 0.45 : 1);
          R.add(SC.mkSprite(L, x, low ? 0.05 : 1.5, z, fw, fh, (ctx, P) => { ctx.scale(fw, fh); const g = ctx.createLinearGradient(0, 0, 0, 1); g.addColorStop(0, 'rgba(255,220,120,0.95)'); g.addColorStop(0.5, 'rgba(255,120,30,0.7)'); g.addColorStop(1, 'rgba(120,20,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.quadraticCurveTo(-0.55, 0.5, 0, 1); ctx.quadraticCurveTo(0.55, 0.5, 0.5, 0); ctx.closePath(); ctx.fill(); }, { noFog: true, noLight: true })); }
      }
    };
    L.dynamicLights = () => {
      const out = [];
      if (s.fireN) { const p = L.pt(0, 2.5, 12.8); out.push({ x: p[0], y: p[1], z: p[2], r: 16, i: 1.3, color: [255, 150, 60], flicker: 0.6, seed: 4 }); }
      if (s.fireE) { const p = L.pt(9.5, 2.5, -2.6); out.push({ x: p[0], y: p[1], z: p[2], r: 16, i: 1.3, color: [255, 150, 60], flicker: 0.6, seed: 6 }); }
      if (G.hasItem('lantern_lit')) { const p = L.pt(Math.sin(G.cam.yaw - L.facing) * 0.5, L.eyeH - 0.4, Math.cos(G.cam.yaw - L.facing) * 0.5); out.push({ x: p[0], y: p[1], z: p[2], r: 6, i: 0.7, color: [255, 190, 110], flicker: 0.3, seed: 8 }); }
      return out;
    };
    L.glows = () => { const out = []; if (s.fireN) { const p = L.pt(0, 2.2, 12.8); out.push({ x: p[0], y: p[1], z: p[2], r: 5 + Math.sin(L.t * 7) * 0.4, color: [255, 140, 50], a: 0.28 }); } if (s.fireE) { const p = L.pt(9.5, 2.2, -2.6); out.push({ x: p[0], y: p[1], z: p[2], r: 5 + Math.sin(L.t * 7) * 0.4, color: [255, 140, 50], a: 0.28 }); } return out; };
    L.aftermath = (t, dt) => { const c = c0(); if (!s.after) { s.after = true; if (c.lane.idx === 1) L.text.win = s.ladderUp ? 'It stood on the barn floor with its arms round itself, looking up at where the ladder had been, and stayed there until the light came.' : 'It paced the line of the fire on the barn floor for an hour, then sat down under the loft with its arms round itself and stayed there until the light came.'; } if (t > 3.2 && !c.sitting) { c.sitting = true; c.hold = c.dist; } return t >= 6.5; };
    L.floor = { poly: [[-4.3, -3.8], [0.3, -3.8], [0.3, 3.8], [-4.3, 3.8]], y: FL + 0.02 };
  }
});
