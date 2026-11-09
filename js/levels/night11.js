'use strict';
// ============================================================ 11. THE BARN ============================================================
// The hayloft. It comes across the yard for the loft door and up the hoist chute, or in at the barn's far end and along
// the barn floor to the ladder at the open edge. A stack of hay stands in each way in. Fire in the one it is coming past
// sends it running round to the other way; only both burning hold it, and they hold it wherever it is, unless it is
// already up in the loft. The fire is a bottle: fill it with lamp oil at the drum, stuff a rag in its neck, light the
// rag, throw it. It goes faster the more you carry.

// the barn's own things. A bottle of clear glass, so what is in it shows: empty it is dark and hollow with the light on its
// edges; filled, amber oil to the shoulder; with a rag twisted into its neck and trailing down its side; lit, a flame on the
// rag's end. spin turns the glass (in flight); the flame always burns upward from wherever the rag's end is.
// The rags are one cloth wherever they are (lying about, in your hands, in a bottle's neck): old faded grey-blue shirting,
// a lighter face where it catches the light, darker in its folds and underneath, and no spots or pattern on it.
const BARN_RAG = { cloth: [118, 133, 156], lite: [152, 165, 186], fold: [88, 101, 124], under: [58, 68, 86] };
// a closed outline through pts, rounded: each point pulls the edge toward it, the soft uneven edge of cloth; a point marked
// true is a corner, and the edge runs out to it
function barnSoft(ctx, pts, dx, dy) {
  const n = pts.length, ox = dx || 0, oy = dy || 0, mid = i => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2 + ox, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2 + oy];
  const m0 = mid(n - 1);
  ctx.beginPath(); ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i], m = mid(i);
    if (p[2]) { ctx.lineTo(p[0] + ox, p[1] + oy); ctx.lineTo(m[0], m[1]); } else ctx.quadraticCurveTo(p[0] + ox, p[1] + oy, m[0], m[1]);
  }
  ctx.closePath();
}
// a strip of cloth along a line, ws its width at each point (a rag's tail)
function barnRibbon(ctx, pts, ws) {
  const side = sgn => pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [p[0] - dy / l * ws[i] / 2 * sgn, p[1] + dx / l * ws[i] / 2 * sgn];
  });
  const l = side(1), r = side(-1).reverse();
  ctx.beginPath(); l.concat(r).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
}
function barnBottle(ctx, P, mode, spin) {
  const glass = P.col([150, 184, 158]), glassD = P.col([50, 66, 56]), glassL = P.col([224, 238, 226]);
  const oil = P.col([196, 124, 34]), oilL = P.col([242, 186, 92]), oilD = P.col([136, 78, 20]);
  const rag = P.col(BARN_RAG.cloth), ragL = P.col(BARN_RAG.lite), ragF = P.col(BARN_RAG.fold), ragD = P.col(BARN_RAG.under);
  const body = () => {
    ctx.beginPath(); ctx.moveTo(-0.23, 0.03); ctx.quadraticCurveTo(-0.27, 0.03, -0.27, 0.09); ctx.lineTo(-0.27, 0.48); ctx.quadraticCurveTo(-0.26, 0.62, -0.09, 0.68);
    ctx.lineTo(-0.08, 0.86); ctx.lineTo(0.08, 0.86); ctx.lineTo(0.09, 0.68); ctx.quadraticCurveTo(0.26, 0.62, 0.27, 0.48); ctx.lineTo(0.27, 0.09); ctx.quadraticCurveTo(0.27, 0.03, 0.23, 0.03); ctx.closePath();
  };
  ctx.save();
  if (spin) { ctx.translate(0, 0.45); ctx.rotate(spin); ctx.translate(0, -0.45); }
  ctx.fillStyle = glass; body(); ctx.fill();                                                                     // the glass, its edges catching the light
  ctx.save(); ctx.translate(0, 0.46); ctx.scale(0.82, 0.93); ctx.translate(0, -0.46); ctx.fillStyle = glassD; body(); ctx.fill(); ctx.restore();   // the inside, dark
  if (mode !== 'empty') {   // the oil, to the shoulder, a bright line where it meets the glass
    ctx.save(); ctx.translate(0, 0.46); ctx.scale(0.82, 0.93); ctx.translate(0, -0.46); body(); ctx.clip();
    P_rect(ctx, -0.3, 0, 0.6, 0.52, oil); P_rect(ctx, 0.09, 0, 0.2, 0.52, oilD); P_ell(ctx, 0, 0.52, 0.24, 0.04, oilL);
    ctx.restore();
  }
  P_line(ctx, -0.17, 0.12, -0.17, 0.46, 0.045, glassL); P_line(ctx, -0.045, 0.7, -0.045, 0.82, 0.024, glassL); P_ell(ctx, 0, 0.06, 0.2, 0.025, glassL);   // the shine down one side, on the neck, round the base
  P_rect(ctx, -0.095, 0.84, 0.19, 0.05, glass);                                                                   // the lip
  if (mode === 'rag' || mode === 'lit') {   // the rag: a twist of the cloth stuffed in the neck, its tail hanging down the side, frayed at the end
    const tail = [[0.05, 0.88], [0.16, 0.83], [0.25, 0.68], [0.265, 0.47]], tw = [0.055, 0.06, 0.07, 0.08];
    ctx.fillStyle = ragD; barnRibbon(ctx, tail.map(([x, y]) => [x + 0.012, y - 0.01]), tw); ctx.fill();   // the tail: its shadow side
    ctx.fillStyle = rag; barnRibbon(ctx, tail, tw); ctx.fill();
    P_limb(ctx, [[0.05, 0.9], [0.14, 0.86], [0.21, 0.76]], 0.016, ragL);                     // the light along its top
    P_limb(ctx, [[0.17, 0.8], [0.235, 0.66], [0.25, 0.52]], 0.011, ragF);                    // a crease down it
    for (const [x, dx, l] of [[0.232, -0.01, 0.04], [0.25, -0.002, 0.058], [0.268, 0.006, 0.038], [0.286, 0.012, 0.05], [0.302, 0.018, 0.034]]) P_line(ctx, x, 0.47, x + dx, 0.47 - l, 0.01, rag);   // its frayed end
    // the twist in the neck: a rumpled tuft of the cloth with its ends standing up out of the bottle
    const tuft = [[-0.09, 0.86], [-0.115, 0.925], [-0.075, 0.995, true], [-0.03, 0.955], [0.015, 1.015, true], [0.055, 0.96], [0.1, 0.93], [0.09, 0.86]];
    ctx.fillStyle = ragD; barnSoft(ctx, tuft, 0.01, -0.018); ctx.fill();
    ctx.fillStyle = rag; barnSoft(ctx, tuft); ctx.fill();
    P_limb(ctx, [[-0.085, 0.9], [-0.07, 0.95]], 0.022, ragL);                                // where the light catches it
    P_limb(ctx, [[-0.04, 0.87], [-0.02, 0.92], [0.0, 0.975]], 0.011, ragF);                 // a fold up it
    P_limb(ctx, [[0.04, 0.875], [0.06, 0.93]], 0.01, ragF);
  }
  ctx.restore();
  if (mode === 'lit') {   // the flame on the rag's end, upright whatever way the bottle turns
    const a = spin || 0, tx = -Math.sin(a) * 0.53, ty = 0.45 + Math.cos(a) * 0.53, f = Math.sin(P.t * 21) * 0.02, f2 = Math.sin(P.t * 13 + 1) * 0.025;
    const g = ctx.createRadialGradient(tx, ty + 0.08, 0.01, tx, ty + 0.08, 0.4);
    g.addColorStop(0, 'rgba(255,214,130,0.75)'); g.addColorStop(0.5, 'rgba(255,150,60,0.28)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.fillRect(tx - 0.42, ty - 0.32, 0.84, 0.84);
    const tongue = (w, h, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tx - w, ty); ctx.quadraticCurveTo(tx - w * 1.1, ty + h * 0.5, tx + f, ty + h); ctx.quadraticCurveTo(tx + w * 1.1, ty + h * 0.5, tx + w, ty); ctx.quadraticCurveTo(tx, ty - w * 0.6, tx - w, ty); ctx.fill(); };
    tongue(0.11, 0.36 + f2, P.raw([255, 132, 40])); tongue(0.07, 0.24 + f, P.raw([255, 204, 96])); tongue(0.035, 0.12, P.raw([255, 244, 208]));
  }
}
// a flame on burning hay, in a unit box (base at 0, tip at 1): a red-orange tongue round a yellow one round a white core,
// its tip swaying and licking
function barnFlame(ctx, t, ph) {
  const sway = Math.sin(t * 5.3 + ph) * 0.1, lick = Math.sin(t * 9.7 + ph * 1.7) * 0.07;
  const tongue = (hw, top, c0, c1) => {
    const g = ctx.createLinearGradient(0, 0, 0, top); g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-hw, 0.02);
    ctx.bezierCurveTo(-hw * 1.2, top * 0.35, -hw * 0.45 + sway * 0.5, top * 0.7, sway + lick, top);
    ctx.bezierCurveTo(hw * 0.45 + sway * 0.5, top * 0.7, hw * 1.2, top * 0.35, hw, 0.02);
    ctx.quadraticCurveTo(0, -0.04, -hw, 0.02); ctx.fill();
  };
  tongue(0.5, 1, 'rgba(255,118,28,0.9)', 'rgba(160,26,0,0)');
  tongue(0.33, 0.74, 'rgba(255,186,64,0.95)', 'rgba(255,120,30,0)');
  tongue(0.17, 0.42, 'rgba(255,244,196,0.95)', 'rgba(255,210,120,0)');
}
Object.assign(ICONS, {
  barnBottle(ctx, P) { barnBottle(ctx, P, 'empty'); },
  barnBottleOil(ctx, P) { barnBottle(ctx, P, 'oil'); },
  barnCocktail(ctx, P) { barnBottle(ctx, P, 'rag'); },
  barnCocktailLit(ctx, P) { ctx.save(); ctx.scale(0.8, 0.8); barnBottle(ctx, P, 'lit'); ctx.restore(); },   // a little smaller, so its flame stays inside the slot
  // a rag: a square of the old grey-blue cloth bunched up where it was dropped, two corners lying out on the boards, soft
  // folds running up from them into the bunch, and one corner frayed. One colour, nothing on it.
  barnRag(ctx, P) {
    const cloth = P.col(BARN_RAG.cloth), lite = P.col(BARN_RAG.lite), fold = P.col(BARN_RAG.fold), under = P.col(BARN_RAG.under);
    const edge = [[-0.49, 0.13, true], [-0.3, 0.07], [0.0, 0.085], [0.3, 0.06], [0.5, 0.1, true], [0.38, 0.2], [0.45, 0.33], [0.34, 0.46],
      [0.22, 0.59], [0.1, 0.5], [-0.02, 0.64], [-0.16, 0.55], [-0.3, 0.58], [-0.42, 0.43], [-0.33, 0.27]];
    ctx.fillStyle = under; barnSoft(ctx, edge, 0.012, -0.03); ctx.fill();   // its shadow side, underneath
    ctx.fillStyle = cloth; barnSoft(ctx, edge); ctx.fill();
    ctx.save(); barnSoft(ctx, edge); ctx.clip();
    ctx.fillStyle = lite; barnSoft(ctx, [[-0.34, 0.6], [-0.16, 0.6], [-0.02, 0.7], [0.12, 0.56], [0.0, 0.42], [-0.2, 0.38], [-0.36, 0.44]]); ctx.fill();   // the top of the bunch, in the light
    ctx.restore();
    const crease = (x0, y0, cx, cy, x1, y1, w) => {   // a fold: its hollow, and the ridge beside it catching the light
      ctx.lineCap = 'round';
      ctx.strokeStyle = lite; ctx.lineWidth = w * 0.7; ctx.beginPath(); ctx.moveTo(x0 - 0.018, y0 + 0.01); ctx.quadraticCurveTo(cx - 0.018, cy + 0.01, x1 - 0.018, y1 + 0.01); ctx.stroke();
      ctx.strokeStyle = fold; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
    };
    ctx.strokeStyle = lite; ctx.lineWidth = 0.014; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-0.29, 0.555);   // its edge along the top, catching the light
    ctx.quadraticCurveTo(-0.16, 0.53, -0.07, 0.585); ctx.quadraticCurveTo(-0.02, 0.62, 0.04, 0.555); ctx.quadraticCurveTo(0.1, 0.48, 0.16, 0.535); ctx.quadraticCurveTo(0.22, 0.575, 0.28, 0.52); ctx.stroke();
    crease(-0.4, 0.14, -0.2, 0.2, -0.07, 0.47, 0.026);   // up from the left corner
    crease(0.42, 0.12, 0.2, 0.17, 0.11, 0.45, 0.026);    // up from the right corner
    crease(0.02, 0.11, 0.06, 0.25, 0.02, 0.38, 0.018);   // a short one between
    // the frayed corner: loose threads
    for (const [x, y, dx, dy] of [[-0.49, 0.13, -0.04, -0.035], [-0.47, 0.15, -0.05, 0.0], [-0.46, 0.115, -0.03, -0.05], [-0.44, 0.17, -0.045, 0.03], [-0.42, 0.105, -0.01, -0.05]]) P_line(ctx, x, y, x + dx, y + dy, 0.012, fold);
  },
});
LEVELS.push({
  id: 'barn', title: 'The Barn', facing: 90, eyeH: 4.65, laneSwitch: false,   // it changes its way in only by running round when the hay in its way goes up (build)
  pal: { skyTop: [8, 8, 16], fog: [36, 34, 40], ground: [40, 38, 30], fogDist: 90 },
  ambient: { wind: 0.8, drone: 0.7, droneFreq: 47, windFreq: 330 },
  lights: [{ x: -2.2, y: 4.1, z: -2.2, r: 5, i: 0.4, color: [255, 200, 130], flicker: 0.2 }, { x: 0, y: 1.5, z: 42, r: 10, i: 0.4, color: [255, 200, 120] }, { x: 23, y: 2.2, z: 0, r: 9, i: 0.3, color: [150, 160, 200] }],
  text: {
    intro: 'The loft is full of last summer, dry as paper, and something is coming for it: across the yard to the loft door, or in at the far end of the barn and up the ladder. A stack of hay stands in each way in. It is bent double under something it carries, and it goes faster the more you are carrying yourself.<br>Carry little.',
    hint: 'Fill a bottle with oil at the drum, stuff a rag in its neck, light the rag with the matches and throw it into the hay it is coming past. It will run round to the other way in: do the same there. Only both fires hold it, and only before it is up in the loft. It comes faster the more you carry.',
    objective: 'Set both stacks of hay alight. Carry little.',
    death: { default: 'It did not put down what it was carrying. It put you with it.', behind: 'The hay went up behind it. It did not look back.', late: 'Both stacks were burning by then. It was already up in the loft with you.' },
    win: 'It paced the line of the fire for an hour and then sat down in the yard with its arms round itself, facing the loft, and stayed there until the light came.',
    fragment: 'Your hand hurt in the morning from holding on to something all night. It knew what you were holding. It always knows.',
  },
  // north: the yard, and the hoist chute up to the loft door (a ramp lane). East: in at the barn's far doorway, along the
  // barn floor between the hay, and up the ladder at the open edge. A lane's distance runs along the sight line from your
  // eye, so the two are given start distances (and fire lines) that are the same walk on the ground: see build.
  lanes: [
    { deg: 0, name: 'the loft door', elev: -22.4, ramp: true, startDist: 29.3, barrierDist: 16.2, cue: 'creak', default: true, apertures: [{ z: 4 / Math.cos(22.4 * DEG), x0: -1.2, x1: 1.2, y0: 3.0, y1: 5.2 }] }, // up the chute to the door at the loft's north edge
    { deg: 90, name: 'the ladder', elev: -73, ramp: true, startDist: 84.0, barrierDist: 12.2 / Math.cos(73 * DEG), cue: 'clunk', apertures: [{ z: 16.5 / Math.cos(73 * DEG), x0: -2, x1: 2, y0: 0, y1: 4.2 }] }, // in at the far doorway, along the barn floor past the hay, then up the ladder
  ],
  creatures: [{ type: 'carrier', time: 130, unseenMult: 1.25 }],
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
    // The north wall has a side door near the far end, out to the yard: the way it leaves the barn floor when the hay there
    // goes up while it is already inside.
    SC.floorQ(L, -4.5, -4, 16.5, 4, 0.01, [52, 44, 34]);
    SC.wallV(L, -4.5, -4, 16.5, -4, 0, 6.5, woodD, ptex); SC.wallV(L, -4.5, -4, -4.5, 4, FL, 6.5, woodD, ptex);
    SC.wallV(L, -4.5, 4, -1.2, 4, FL, 6.5, woodD, ptex); SC.wallV(L, 1.2, 4, 13.4, 4, 0, 6.5, woodD, ptex);
    SC.wallV(L, 13.4, 4, 15.6, 4, 2.8, 6.5, woodD, ptex); SC.wallV(L, 15.6, 4, 16.5, 4, 0, 6.5, woodD, ptex);
    for (const x of [13.3, 15.6]) SC.box(L, x, x + 0.1, 0, 2.9, 3.86, 3.98, wood);   // the side door's frame
    SC.box(L, 13.3, 15.7, 2.8, 2.9, 3.86, 3.98, wood);
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
    // The ladder leans on the lip of the open edge, its foot out on the barn floor: scenery, the way it climbs up. It is a
    // little steeper than the way the thing comes up it (that way runs straight at your eyes, so a ladder along it would show
    // as a line), and its stiles run on a metre past the edge, as a ladder's do: from up here you see the top of it at your
    // feet, two stiles and rungs. A piece wholly below the loft floor is ordered behind the floor, which hides it.
    {
      const E = [0.52, FL + 0.15], len = 4.16, hw = 0.3, foot = [1.15, 0.02];
      const d = Math.hypot(foot[0] - E[0], foot[1] - E[1]), th = Math.atan2(E[1] - foot[1], foot[0] - E[0]);
      const ax = -Math.cos(th), ay = Math.sin(th), at = u => [foot[0] + ax * len * u, foot[1] + ay * len * u];
      void d;
      const under = (p, q) => (Math.max(p[1], q[1]) < FL + 0.02 ? { sortDist: 7 } : {});
      const stileC = [104, 82, 56], rungC = [88, 69, 48];
      for (const [u0, u1] of [[0, 0.37], [0.37, 0.73], [0.73, 1]]) {
        const p = at(u0), q = at(u1);
        for (const z of [-hw, hw]) SC.quad(L, [p[0], p[1], z - 0.03], [p[0], p[1], z + 0.03], [q[0], q[1], z + 0.03], [q[0], q[1], z - 0.03], stileC, under(p, q));
      }
      for (let r = 0; r < 12; r++) {   // each rung both ways across, so it reads as round
        const c = at(0.045 + r * 0.0835), o = under(c, c), t = 0.018, z0 = -hw + 0.02, z1 = hw - 0.02;
        SC.quad(L, [c[0] - ax * t, c[1] - ay * t, z0], [c[0] - ax * t, c[1] - ay * t, z1], [c[0] + ax * t, c[1] + ay * t, z1], [c[0] + ax * t, c[1] + ay * t, z0], rungC, o);
        SC.quad(L, [c[0] - ay * t, c[1] + ax * t, z0], [c[0] - ay * t, c[1] + ax * t, z1], [c[0] + ay * t, c[1] - ax * t, z1], [c[0] + ay * t, c[1] - ax * t, z0], scalec(rungC, 0.82), o);
      }
    }
    // the hay: two stacks in the yard either side of the chute's foot, and two on the barn floor either side of the way
    // down it, so each way in passes between a pair and is never hidden on its way. Lit, the fire runs across the gap
    // between them too, low on the ground (spilt straw), and what stands beyond can be seen over it.
    const hayAt0 = L.props.length;
    SC.box(L, -3.4, -1.1, 0, 1.4, 11.6, 14.0, hay); SC.box(L, 1.1, 3.4, 0, 1.4, 11.6, 14.0, hay); SC.box(L, -3.0, -1.5, 1.4, 2.0, 11.9, 13.7, hayD); SC.box(L, 1.5, 3.0, 1.4, 2.0, 11.9, 13.7, hayD);
    const hayAt1 = L.props.length;
    SC.box(L, 7.8, 11.2, 0, 1.6, -3.9, -1.3, hay); SC.box(L, 8.3, 10.7, 1.6, 2.4, -3.5, -1.7, hayD);
    SC.box(L, 7.9, 10.9, 0, 1.4, 1.3, 3.9, hay); SC.box(L, 8.4, 10.4, 1.4, 2.0, 1.7, 3.5, hayD);
    const hayProps = [L.props.slice(hayAt0, hayAt1), L.props.slice(hayAt1)];
    // loft clutter: the oil drum with its tap, crates with the lamp on one, sacks
    // the oil drum: a sprite (a drum looks the same from every side) on the target's own spot, so the outline you see when you
    // point at it is round the drum. Hoops, a lid with its bungs, and at the front the brass tap, a drip under its spout; as a
    // bottle fills, a thin run of oil from the spout.
    const DR = 0.4, drumC = [50, 62, 55], drumLift = 0.12;
    SC.sprite(L, -2.6, FL - drumLift, -2.2, 0.86, 1.04 + drumLift, (ctx, P) => {
      ctx.translate(0, drumLift);
      const body = P.col(drumC), dark = P.col(scalec(drumC, 0.62)), lite = P.col(mixc(drumC, [190, 200, 190], 0.2)), rim = P.col(scalec(drumC, 0.8));
      const top = 0.92;
      ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(-DR, top); ctx.lineTo(-DR, 0); ctx.ellipse(0, 0, DR, 0.11, 0, Math.PI, TAU, false); ctx.lineTo(DR, top); ctx.closePath(); ctx.fill();
      P_rect(ctx, -DR, 0, 0.09, top, dark); P_rect(ctx, DR - 0.09, 0, 0.09, top, dark); P_rect(ctx, -0.2, 0.04, 0.06, top - 0.06, lite);   // round: dark at the sides, a sheen
      for (const [y, ry] of [[0.3, 0.1], [0.62, 0.095]]) {   // the rolling hoops, curving round toward you
        ctx.lineWidth = 0.035; ctx.strokeStyle = rim; ctx.beginPath(); ctx.ellipse(0, y, DR, ry, 0, Math.PI, TAU, false); ctx.stroke();
        ctx.lineWidth = 0.012; ctx.strokeStyle = lite; ctx.beginPath(); ctx.ellipse(0, y + 0.02, DR - 0.01, ry, 0, Math.PI + 0.3, TAU - 0.3, false); ctx.stroke();
      }
      P_ell(ctx, 0, top, DR, 0.085, rim); P_ell(ctx, 0, top + 0.004, DR - 0.03, 0.065, P.col(mixc(drumC, [150, 160, 150], 0.22)));   // the lid
      P_ell(ctx, 0.2, top + 0.01, 0.045, 0.018, dark); P_ell(ctx, -0.22, top - 0.01, 0.03, 0.012, dark);                               // its bungs
      // the tap, low on the front: brass, its handle up
      const tap = P.col([176, 146, 80]), tapD = P.col([110, 88, 44]);
      P_rect(ctx, -0.045, 0.16, 0.09, 0.1, tap); P_rect(ctx, -0.025, 0.08, 0.05, 0.09, tapD);
      P_line(ctx, 0, 0.27, 0, 0.36, 0.03, tap); P_ell(ctx, 0, 0.37, 0.035, 0.02, tap);
      const pour = P.t - (s.pourT === undefined ? -9 : s.pourT);
      if (pour >= 0 && pour < 0.9) P_line(ctx, 0, 0.08, 0, -0.1, 0.022 * Math.sin(Math.PI * pour / 0.9), P.col([200, 132, 40]));   // running
      else P_ell(ctx, 0, 0.05, 0.016, 0.022, P.col([46, 34, 14]));   // a drip
      if (s.spill) {   // oil run out onto the boards in front of it: a dark pool round its foot, with a dull shine on it
        const k = s.spill;
        P_ell(ctx, 0.04, -0.14, 0.3 + 0.3 * k, 0.05 + 0.04 * k, P.col([20, 15, 7])); P_ell(ctx, -0.16 - 0.12 * k, -0.15, 0.08 + 0.08 * k, 0.012 + 0.006 * k, P.col([140, 108, 54])); P_ell(ctx, 0.3 + 0.14 * k, -0.13, 0.05 + 0.05 * k, 0.009, P.col([112, 86, 42]));
      }
    });
    SC.box(L, -2.6, -1.8, FL, FL + 0.6, -3.7, -3.1, [84, 68, 50]); SC.box(L, -1.7, -1.0, FL, FL + 0.45, -3.7, -3.2, [84, 68, 50]);
    STORY.lamp(L, -2.2, FL + 0.6, -3.4, { lit: true, scale: 0.9 });
    SC.box(L, -4.2, -3.4, FL, FL + 0.9, -1.0, 0.6, [124, 106, 70]); SC.box(L, -4.2, -3.6, FL + 0.9, FL + 1.5, -0.8, 0.4, [110, 92, 62]);
    // items: two empty bottles, two rags, one box of matches (it lights both). No spot sits behind the drum, the crates or
    // the sacks as you see them from where you stand.
    const BW = 0.2, BH = 0.36, RW = 0.36, RH = 0.26;
    const bottleSpots = [
      { x: -1.35, y: FL + 0.45, z: -3.42 },             // on the low crate
      { x: -3.8, y: FL + 1.5, z: -0.2 },                // on the sacks
      { x: -1.1, y: FL + 0.02, z: 2.3 },                // on the boards toward the loft door
      { x: -3.5, y: FL + 0.02, z: 2.9 },                // in the corner by the loft door
      { x: -0.7, y: FL + 0.02, z: -2.4 },               // on the boards by the drum
    ];
    const ragSpots = [
      { x: -2.5, y: FL + 0.94, z: -2.15 },              // over the drum's lid
      { x: -0.45, y: FL + 0.02, z: -1.2, flat: true },  // on the boards
      { x: 0.0, y: FL + 0.02, z: 3.35, flat: true },    // by the loft door's sill (clear of the lip)
      { x: -2.8, y: FL + 0.02, z: 1.0, flat: true },    // before the sacks
    ];
    const matchSpots = [
      { x: -2.4, y: FL + 0.92, z: -2.0 },               // on the drum's lid
      { x: -2.0, y: FL + 0.6, z: -3.5 },                // on the crate, by the lamp
      { x: -3.8, y: FL + 0.02, z: 1.9, flat: true },    // on the boards in the corner
      { x: -1.6, y: FL + 0.02, z: 0.5, flat: true },    // on the boards
    ];
    // how each is held (js/hands.js): a bottle in the fist low round its body (the oil shows above your fingers), its neck up
    // and a little over; the lit one the same, its flame over your knuckles (its icon is drawn smaller in its box, so it is
    // held lower and drawn bigger); a rag bunched in the fist. The hands are lit a little more than the night's dark would
    // have them, so the oil shows amber.
    const HELD = { bottle: { grip: 'fist', at: [0.02, 0.2], angle: 0.12, size: 0.27 }, lit: { grip: 'fist', at: [0.02, 0.17], angle: 0.12, size: 0.33 }, rag: { grip: 'fist', at: [0.02, 0.36], axis: 0.3, angle: -0.25, size: 0.2 } };
    const BOTTLE = { w: BW, h: BH, held: HELD.bottle, material: 'glass' };
    L.hands = { lit: 0.82 };
    for (let k = 0; k < 2; k++) mkItem(L, 'bottle', 'Empty bottle', bottleSpots, Object.assign({ icon: 'barnBottle' }, BOTTLE));
    for (let k = 0; k < 2; k++) mkItem(L, 'rag', 'Rag', ragSpots, { w: RW, h: RH, icon: 'barnRag', held: HELD.rag, material: 'soft' });
    mkItem(L, 'matches', 'Matches', matchSpots, { w: 0.16, h: 0.16, tool: true });
    Object.assign(s, { fire: [false, false], fireT: [0, 0], litAt: [null, null], burst: null, run: null });
    const c0 = () => L.creatures[0];
    // At the drum, what will not go (js/hands.js): the tap's place on it; a thing that must not come near it (a lit bottle,
    // the matches) goes toward it and is snatched back short of it; oil run out of the tap with nothing under it (or over a
    // bottle that is full) lies in a pool round its foot.
    const TAP = [0, 0.25];
    const flinch = (t, item) => {   // (from the hand not half way to it, and back)
      const hw = HANDS.handWorld(item, 10).p, k = 0.45;
      return { preset: 'return', at: { x: lerp(hw.x, t.x, k), y: lerp(hw.y, t.y + t.h * 0.5, k), z: lerp(hw.z, t.z, k) }, speed: 1.7, sfx: { hit: '' } };
    };
    const spill = k => { s.pourT = G.t; s.spill = Math.min(1, (s.spill || 0) + k); AUDIO.sfx('pour'); };
    mkTarget(L, {
      id: 'drum', name: 'Oil drum', x: -2.6, y: FL - drumLift, z: -2.2, w: 0.86, h: 1.04 + drumLift,   // the drum sprite's own box
      accepts: ['bottle', 'bottle_oil', 'cocktail', 'cocktail_lit'], noThrow: true,   // a lit bottle is never thrown at it (and lost)
      onClick() {   // an empty bottle before a full one, whichever is in hand
        const e = G.inv.findIndex(i => i.id === 'bottle');
        if (e >= 0 && !(G.inv[G.active] && G.inv[G.active].id === 'bottle')) G.active = e;
        return false;
      },
      hint() { return 'Lamp oil. The tap turns.'; },
      use(item) {   // one bottle at a time, filled where it is in your hands (the same bottle, full now: it goes to the tap and back)
        // a lit one goes toward the drum and is snatched back before it gets there
        if (item.id === 'cocktail_lit') { G.say('Not with that alight. The drum would go up.', 'Not with that alight.'); return G.refuse(flinch(this, item)); }
        // a full one goes under the tap, the tap is turned, and the oil runs over and down onto the boards
        if (item.id !== 'bottle') { G.say('That one is full already.', 'Full already.'); return G.refuse({ preset: 'return', at: TAP, speed: 0.75, onHit: () => spill(0.3) }); }
        Object.assign(item, { id: 'bottle_oil', name: 'Bottle of oil', icon: ICONS.barnBottleOil, uses: item.uses + 1 });   // (not used up: a use is taken off what is used)
        if (!G.inv.includes(item)) G.inv.push(item);
        G.active = G.inv.indexOf(item);
        s.pourT = G.t; AUDIO.sfx('pour'); G.say('Full to the shoulder.', 'Full.');
        return true;
      },
      onWrong(item) {   // the rag dabs at the tap and comes back; the matches go toward the drum and are snatched back
        G.fumble(item, this, item.id === 'matches' ? flinch(this, item) : { preset: 'return', at: TAP });
      },
      onEmpty() {   // with nothing to catch it in, the hand turns the tap: oil runs out onto the boards, and it is turned off
        G.reach(this, { style: 'pull', at: TAP, onTouch: () => spill(0.25) });
      },
    });
    mkRecipe(L, { parts: ['bottle_oil', 'rag'], result: { id: 'cocktail', name: 'Bottle and rag', opts: Object.assign({ icon: 'barnCocktail' }, BOTTLE) }, sfx: 'cloth', text: 'The rag goes into its neck.' });
    // The likely wrong ways round say what is wrong and leave both things in your hands just as they were (the same things,
    // in the same order, the same one in your hand), and show it: a match struck by it flares in your other hand and goes
    // out, or the other thing comes up in that hand beside it, and goes down again. (What was in hand is noted every frame,
    // in L.update: a recipe is told only what it made.)
    const MATCH = { id: 'match', name: 'Match', w: 0.07, h: 0.24, held: { grip: 'pinch', at: [0, 0.16], angle: 0.35, size: 0.2 } };
    MATCH.icon = (ctx, P) => {   // a match just struck: it flares, burns down a moment and goes out, a wisp of smoke going up
      const age = s.together ? L.t - s.together.t : 9, flame = age < 0.1 ? age / 0.1 * 1.4 : age < 0.2 ? lerp(1.4, 1, (age - 0.1) / 0.1) : age < 0.75 ? 1 : Math.max(0, 1 - (age - 0.75) / 0.2);
      P_line(ctx, 0, 0, 0, 0.6, 0.11, P.col([196, 168, 120])); P_ell(ctx, 0, 0.62, 0.17, 0.09, P.col(flame > 0 ? [60, 30, 24] : [36, 30, 28]));   // the stick, its head charring
      if (flame > 0) {
        const f = Math.sin(P.t * 23) * 0.04, k = flame;
        ctx.fillStyle = P.raw([255, 150, 50]); ctx.beginPath(); ctx.moveTo(-0.2 * k, 0.6); ctx.quadraticCurveTo(-0.24 * k, 0.75 + 0.1 * k, f, 0.62 + 0.38 * k); ctx.quadraticCurveTo(0.24 * k, 0.75 + 0.1 * k, 0.2 * k, 0.6); ctx.fill();
        ctx.fillStyle = P.raw([255, 236, 170]); ctx.beginPath(); ctx.moveTo(-0.09 * k, 0.61); ctx.quadraticCurveTo(-0.1 * k, 0.7, f * 0.5, 0.62 + 0.2 * k); ctx.quadraticCurveTo(0.1 * k, 0.7, 0.09 * k, 0.61); ctx.fill();
      } else if (age < 1.5) {
        const a = 1 - (age - 0.95) / 0.55; ctx.strokeStyle = P.cola([150, 146, 140], 0.5 * a); ctx.lineWidth = 0.06; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0.66); ctx.quadraticCurveTo(0.12, 0.76 + (age - 0.95) * 0.3, -0.04, 0.9 + (age - 0.95) * 0.4); ctx.stroke();
      }
    };
    const notYet = (a, b, text) => mkRecipe(L, {
      parts: [a, b], result: { id: a, name: a, opts: {} }, sfx: 'nope', text,
      onCombine: (it, L2) => {
        L2.items.splice(L2.items.indexOf(it), 1);
        G.removeFromInv(it);
        const was = s.invWas || [], parts = was.filter(i => !G.inv.includes(i) && (i.id === a || i.id === b));
        if (parts.length === 2) { const rest = G.inv.slice(); G.inv.length = 0; for (const i of was) if (parts.includes(i) || rest.includes(i)) G.inv.push(i); for (const i of rest) if (!G.inv.includes(i)) G.inv.push(i); }
        else for (const i of L2.items.filter(i => (i.id === a || i.id === b) && i.taken && !G.inv.includes(i)).slice(0, 2)) G.inv.push(i);   // (as before, if what was in hand was not noted)
        const held = parts.includes(was[s.activeWas]) ? was[s.activeWas] : G.inv.find(i => i.id === a), other = G.inv.find(i => (i.id === a || i.id === b) && i !== held);
        G.active = Math.max(0, G.inv.indexOf(held)); G.invSig = '';
        const lit = a === 'matches' || b === 'matches';
        s.together = { t: L.t, dur: lit ? 1.5 : 1.2, show: lit ? MATCH : other };
        if (lit) AUDIO.sfx('strike');
      },
    });
    notYet('bottle', 'rag', 'The bottle is empty.');
    notYet('bottle', 'matches', 'There is nothing to light.');
    notYet('bottle_oil', 'matches', 'It will not catch like that.');
    notYet('rag', 'matches', 'Not on its own.');
    L.offHand = () => (s.together && G.state === 'play' && L.t - s.together.t < s.together.dur ? s.together.show || null : null);
    // lighting it keeps the matches: they light the second one too
    mkRecipe(L, {
      parts: ['cocktail', 'matches'], result: { id: 'cocktail_lit', name: 'Lit bottle', opts: { w: BW, h: BH, throwable: true, held: HELD.lit, material: 'glass' } }, sfx: 'strike', text: 'The rag catches.',
      onCombine: (it, L2) => {
        it.icon = (ctx, P) => (G.throwing && G.throwing.it === it ? barnBottle(ctx, P, 'lit', G.throwing.t * 11) : ICONS.barnCocktailLit(ctx, P));   // it turns over in the air
        const m = L2.items.find(i => i.id === 'matches'); if (m) { m.taken = true; G.inv.push(m); }
      },
    });

    // ---- the two ways in, as walks ----
    // A lane's distance is measured along the sight line from your eye. That line drops 22 degrees to the yard and 73 to
    // the barn floor, so a metre of it is 0.92 m of yard but only 0.29 m of barn floor, until the line meets the chute or
    // the ladder and the thing climbs along it. Walked on distance, it crossed the yard three times as fast as the barn
    // floor and then shot up the ladder. So it walks its path instead: path metres left (pathLeft) fall at one pace on both
    // ways, along the ground and then up, and the lane distance is worked out from them each step.
    const geo = lane => { const e = -lane.elev; return { dF: L.eyeH / Math.sin(e), k: Math.cos(e) }; };
    const sOf = (lane, d) => { const g = geo(lane); return d <= g.dF ? d : g.dF + (d - g.dF) * g.k; };
    const dOf = (lane, p) => { const g = geo(lane); return p <= g.dF ? p : g.dF + (p - g.dF) / g.k; };
    const pathLeft = c => sOf(c.lane, c.dist);
    const sBar = lane => sOf(lane, lane.barrierDist);   // the fire line: just beyond the hay, on either way
    const ground = (lane, d) => d * Math.cos(lane.elev);   // how far out along the ground (on the ground)
    // past the fire line of its way there is nothing left to stop it, and it comes on three times as fast
    const walk = (cr, dt) => {
      const m = cr.frozen || cr.dead ? 0 : cr.CR.speedMult(cr, dt, cr.seen) * (cr.seen ? cr.seenMult : cr.unseenMult) * (inside(cr) ? 3 : 1);
      cr.u = clamp(cr.u + dt * m / cr.T, 0, 1);
      return dOf(cr.lane, cr.S0 * (1 - cr.u));
    };
    const ready = c => { if (c.S0 === undefined) { c.S0 = sOf(c.lane, c.D0); c.distFn = walk; } };
    // inside: past the fire line of the way it is on (it comes on three times as fast from there)
    const inside = c => !s.run && pathLeft(c) < sBar(c.lane) - 0.02;
    // Where it stands against the hay of its way, as you see it. The fire line is a metre outside the stacks; from there it
    // walks in between them (amid), and only once it is out of them on your side is that hay behind it (pastHay). Up in the
    // loft with you (onYou: in the loft doorway, or its head over the edge at the top of the ladder) nothing holds it.
    const HAY_IN = [11.6, 7.8], IN_LOFT = [4.6, 2.6];   // ground metres to the loft side of each way's hay; lane metres into the loft
    const SMOKE = [11.3, 4.8];   // ground metres out to where it gives up, caught between: the chute's foot; out on the barn floor, in view
    const sPast = lane => sOf(lane, HAY_IN[lane.idx] / Math.cos(lane.elev)) - 0.3;
    const pastHay = c => !s.run && pathLeft(c) < sPast(c.lane);
    const onYou = c => !s.run && c.dist < IN_LOFT[c.lane.idx];

    // ---- the run round to the other way ----
    // The hay in its way goes up while it is still outside it or in among it: it rears back from the fire (back out of the
    // stacks, if it was between them), then runs flat out sideways, side on, out of sight (across the yard past the loft
    // door, or out of the far doorway, or, if it was already in the barn, through the side door), goes round the barn out
    // of sight (its feet, a blow on the wall as it passes), and comes
    // in from the side to the other way: never nearer than GAP path metres outside that way's fire line (nor further than it
    // started). GAP leaves as long for the second bottle as the first had: about the same pace of work wins either half.
    const RUN = { recoil: 0.45, out: 1.0, round: 1.5, in: 1.1 }, GAP = 8;
    const T1 = RUN.recoil, T2 = T1 + RUN.out, T3 = T2 + RUN.round, T4 = T3 + RUN.in;
    const panTo = yaw => Math.sin(wrapPi(yaw - G.cam.yaw)) * 0.85;
    const yardLat = h => 0.3 * h + 1.4;            // far enough to the side of the loft door to be wholly behind the wall
    const doorLat = x => -(2 * x / 16.5 + 1.4);   // the same past the side of the far doorway (to the north)
    const startRun = c => {
      const from = c.lane, to = L.lanes[1 - from.idx], r = { t: 0, from, to, p0: pathLeft(c), d0: c.dist, steps: 0, banged: false, arrived: false };
      if (from.idx === 0) { r.dOut = Math.max(c.dist, dOf(from, sBar(from))); r.latOut = yardLat(ground(from, r.dOut)); r.outDir = 1; }
      else {
        const x = ground(from, c.dist), outside = x > 16.0, tx = outside ? Math.max(x, 17.5) : 14.5;
        r.dOut = tx / Math.cos(from.elev); r.latOut = outside ? doorLat(tx) : -4.9; r.outDir = -1;
      }
      s.run = r; s.ran = true;
      c.hold = c.dist;
    };
    const updateRun = (c, dt) => {
      const r = s.run;
      // both burning while it was still rearing back from the first fire: it stays on this side, at that fire (the aftermath)
      if (L.won && r.t < T1) { s.run = null; c.hold = c.dist; c.recoil = 0; return; }
      if (L.won && r.t >= T2 && r.t < T3) r.t = T3;   // while it was going round, out of sight: it comes round now, to the way it was running to
      r.t += dt;
      r.hidden = false;
      if (r.t < T1) { c.recoil = Math.min(1, r.t / 0.15) * (1 - smoothstep((r.t - 0.3) / 0.15)); return; }   // it rears back from the flames
      c.recoil = 0;
      if (r.t >= T4) { c.runPose = false; c.runLat = 0; c.hold = null; s.run = null; return; }   // and walks on from where it came round
      c.runPose = true; c.runPace = 1;
      c.runGait = (c.runGait || 0) + dt * 15;
      let yaw;
      if (r.t < T2) {          // flat out to one side, out of sight
        const k = (r.t - T1) / RUN.out;
        c.runDir = r.outDir; c.runLat = r.latOut * Math.pow(k, 1.4);
        c.hold = lerp(r.d0, r.dOut, easeOut(Math.min(1, k * 1.6)));
        yaw = r.from.yaw + Math.atan2(c.runLat, ground(r.from, c.hold));
      } else if (r.t < T3) {   // round the barn, out of sight
        const k = (r.t - T2) / RUN.round;
        r.hidden = true; c.runLat = r.latOut;
        yaw = r.from.yaw + wrapPi(r.to.yaw - r.from.yaw) * k;
        if (!r.banged && k > 0.45) { r.banged = true; AUDIO.sfx('thud', panTo(yaw)); G.shake(0.1); }   // a blow on the barn wall as it goes by
      } else {                 // round the corner and across the other way in, then it turns to it
        if (!r.arrived) {
          r.arrived = true;
          const p = Math.min(c.S0, Math.max(r.p0, sBar(r.to) + GAP)), d = dOf(r.to, p);
          c.retarget(r.to.idx); c.reached = false;
          c.D0 = dOf(r.to, c.S0); c.u = clamp(1 - p / c.S0, 0, 0.995); c.hold = c.dist = d;
          L.lane = r.to; L.laneIdx = r.to.idx; L.barrierDist = r.to.barrierDist;
          r.latIn = r.to.idx === 0 ? yardLat(ground(r.to, d)) : doorLat(ground(r.to, d)); r.inDir = r.to.idx === 0 ? -1 : 1;
          AUDIO.sfx(r.to.cue, panTo(r.to.yaw));
        }
        c.runDir = r.inDir; c.runLat = r.latIn * (1 - easeOut((r.t - T3) / RUN.in));
        yaw = r.to.yaw + Math.atan2(c.runLat, ground(r.to, c.dist));
      }
      // running feet, loud enough to hear across the yard
      const n = Math.floor(c.runGait / Math.PI);
      if (n !== r.steps) { r.steps = n; AUDIO.footstep('runner', r.hidden ? 0.16 : 0.3, panTo(yaw)); }
    };

    // ---- the hay ----
    // a lit bottle thrown into a stack bursts and the fire runs out from where it broke across the pair and the gap; it is
    // the fire in its way, while that hay is not yet behind it, that turns it
    // each fire: its middle, the axis its pair of stacks runs along as you see it, its width, the stacks' height, and where
    // its flames stand: [along, across, low] (low: in the gap, on the ground)
    const fireSpots = (alongs, depths) => [].concat(...alongs.map(a => [-a, a]).flat().map(a => depths.map(d => [a, d, false])), [[-0.6, 0, true], [0, 0.1, true], [0.6, 0, true]]);
    const FIRES = [
      { cx: 0, cz: 12.8, axis: 'x', w: 6.8, top: 2.0, spots: fireSpots([1.4, 1.95, 2.5, 3.05], [-0.55, 0.55]) },
      { cx: 9.5, cz: 0, axis: 'z', w: 7.8, top: 2.2, spots: fireSpots([1.6, 2.2, 2.8, 3.4], [-0.8, 0.7]) },
    ];
    const ignite = (k, t) => {
      s.fire[k] = true; s.fireT[k] = L.t; s.burst = { t: L.t, x: t.x, y: t.y + t.h * 0.4, z: t.z };
      AUDIO.sfx('burst', panTo(L.lanes[k].yaw)); G.shake(0.35);
      if (!s.ash) { s.ash = true; WEATHER.set({ kind: 'ash', density: 0.9, wind: 0.4 }, G.runSeed + 11); }
      const c = c0();
      s.litAt[k] = { lane: c.lane.idx, path: pathLeft(c), bar: sBar(c.lane), hay: sPast(c.lane) + 0.3, run: !!s.run };   // where it was as this stack went up
      if (!s.run && !L.won && c.lane.idx === k && !pastHay(c) && !s.fire[1 - k]) startRun(c);
      if (pastHay(c) && c.lane.idx === k) s.behind = true;
    };
    // What will not go at the hay (js/hands.js). Only a lit bottle is let go of: anything else would only be lost down there,
    // so the throw is held back. It is swung out at arm's length toward the stack, and where it would have been let go the
    // hand keeps hold of it with a jerk, and it comes back. Oil in an open bottle slops out of its neck at the jerk, and
    // spatters down onto the boards (or over the edge). The matches: one is struck and flicked out at the hay, and goes out
    // as it falls, long before it gets there; the box stays in your hand.
    const fxr = mulberry32((G.runSeed * 7 + 1111) >>> 0), bits = s.bits = [], stains = s.stains = [];
    // (arm's length: where it is in the hand, at the depth at which it looks the size it does there, moved most of the way
    // in toward the line to the stack and a little further out, so it goes out from the hand and not off to one side)
    const armsLength = (t, item) => {
      const hw = HANDS.handWorld(item, 10), d = Math.hypot(hw.p.x, hw.p.y - L.eyeH, hw.p.z) * 1.2, tx = t.x, ty = t.y + t.h * 0.45 - L.eyeH, tz = t.z, l = Math.hypot(tx, ty, tz) || 1;
      const k = 0.6;
      return { x: lerp(hw.p.x, tx / l * d, k), y: lerp(hw.p.y, L.eyeH + ty / l * d, k) + 0.06, z: lerp(hw.p.z, tz / l * d, k) };
    };
    const heldBack = (t, item) => {
      const fx = G.fumble(item, t, { preset: 'return', at: armsLength(t, item), speed: 1.15, sfx: { hit: '' }, onHit: f => { if (item.id === 'bottle_oil') slop(f, t); } });
      if (fx) AUDIO.sfx('hiss', Math.sin(wrapPi(Math.atan2(t.x, t.z) - G.cam.yaw)) * 0.5);
      return fx;
    };
    const slop = (f, t) => {
      const l = Math.hypot(t.x, t.z) || 1, ux = t.x / l, uz = t.z / l;
      for (let i = 0; i < 14; i++) {
        const sp = 1.0 + fxr() * 1.6, side = (fxr() - 0.5) * 0.7;
        bits.push({ kind: 'drop', x: f.pos.x, y: f.pos.y + 0.12, z: f.pos.z, vx: ux * sp - uz * side, vy: 0.2 + fxr() * 0.9, vz: uz * sp + ux * side, r: 0.006 + fxr() * 0.009, age: 0 });
      }
    };
    const flick = (t, item) => {
      const hw = HANDS.handWorld(item, 1.2).p, dx = t.x - hw.x, dz = t.z - hw.z, l = Math.hypot(dx, dz) || 1;   // from your hand, at the stack
      bits.push({ kind: 'match', x: hw.x, y: hw.y + 0.06, z: hw.z, vx: dx / l * 3.2, vy: 1.6, vz: dz / l * 3.2, age: 0, spin: 0 });
      AUDIO.sfx('strike'); G.thrust(t, item);
    };
    // the bits in the air: oil falling (a drop that lands on the loft's boards leaves a dark spot there), the match
    const FLOORY = FL + 0.02, onLoft = (x, z) => { const q = rotY(x, z, -L.facing); return pointInPoly(q[0], q[1], [[-4.3, -3.8], [0.3, -3.8], [0.3, 3.8], [-4.3, 3.8]]); };
    const flyBits = dt => {
      for (const b of bits.slice()) {
        const y0 = b.y;
        b.age += dt; b.vy -= 9.8 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.spin = (b.spin || 0) + dt * 14;
        if (y0 > FLOORY && b.y <= FLOORY && onLoft(b.x, b.z)) {
          if (b.kind === 'drop') { stains.push({ x: b.x, z: b.z, r: b.r * (2.2 + fxr()), sx: 0.7 + fxr() * 0.6 }); if (stains.length > 24) stains.shift(); }
          bits.splice(bits.indexOf(b), 1);
        } else if (b.y < 0 || b.age > 2.5) bits.splice(bits.indexOf(b), 1);
      }
    };
    const drawBits = () => {
      for (const st of stains) {
        const w = st.r * 2 * st.sx, h = st.r * 2;
        R.add({ kind: 'sprite', flat: true, x: st.x, y: FLOORY + 0.002, z: st.z, w, h, sortDist: Math.hypot(st.x, st.z) + 0.5, draw: (ctx, P) => { ctx.scale(w, h); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.cola([30, 22, 10], 0.85)); P_ell(ctx, -0.12, 0.6, 0.18, 0.12, P.cola([96, 72, 36], 0.6)); } });
      }
      for (const b of bits) {
        if (b.kind === 'drop') { const r = b.r; R.add({ kind: 'sprite', x: b.x, y: b.y, z: b.z, w: r * 2, h: r * 2.6, draw: (ctx, P) => { ctx.scale(r * 2, r * 2.6); P_ell(ctx, 0, 0.45, 0.5, 0.45, P.col([196, 124, 34])); P_ell(ctx, -0.15, 0.6, 0.18, 0.15, P.col([250, 200, 110])); } }); continue; }
        // the match: a stick turning over, its flame dying as it goes, then a thread of smoke
        const fl = clamp(1 - (b.age - 0.45) / 0.3, 0, 1), sp = b.spin, S = 0.14;
        R.add({ kind: 'sprite', x: b.x, y: b.y - S / 2, z: b.z, w: S, h: S, noFog: fl > 0, noLight: fl > 0, draw: (ctx, P) => {
          ctx.translate(0, S / 2); ctx.rotate(sp); ctx.scale(S, S);
          P_line(ctx, 0, -0.25, 0, 0.2, 0.05, P.col([196, 168, 120])); P_ell(ctx, 0, 0.22, 0.07, 0.05, P.col([50, 28, 22]));
          if (fl > 0) { ctx.rotate(-sp); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.4 * fl); g.addColorStop(0, 'rgba(255,240,180,0.95)'); g.addColorStop(0.4, 'rgba(255,160,60,0.7)'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(-0.4, -0.4, 0.8, 0.8); }
        } });
      }
    };
    const mkHay = (k, id, name, x, z, w) => mkTarget(L, {
      id, name, x, y: 0, z, w, h: 2.4, accepts: ['cocktail_lit', 'cocktail', 'bottle_oil'],
      onClick() {
        if (s.fire[k]) { G.say('It is already burning.', 'Burning.'); if (!G.reach(this)) AUDIO.sfx('nope'); return true; }   // the hand goes out toward it, and no further
        const lit = G.inv.findIndex(i => i.id === 'cocktail_lit');   // a lit bottle before an unlit one
        if (lit >= 0 && !(G.inv[G.active] && G.inv[G.active].id === 'cocktail_lit')) G.active = lit;
        return false;
      },
      hint() { return s.fire[k] ? 'Burning.' : 'Dry hay. It would go up in a moment.'; },
      use(item) {
        if (item.id !== 'cocktail_lit') { G.say(item.id === 'cocktail' ? 'The rag is not lit.' : 'Oil will not light the hay on its own. It wants a wick, and a flame.', 'It is not lit.'); heldBack(this, item); return false; }
        ignite(k, this); return true;
      },
      onWrong(item) { if (item.id === 'matches') flick(this, item); else heldBack(this, item); },   // an empty bottle, a rag: held back too
    });
    const hayN = mkHay(0, 'hayN', 'The hay in the yard', 0, 12.8, 6.8), hayE = mkHay(1, 'hayE', 'The hay in the barn', 9.5, 0, 7.8);
    void hayN; void hayE;
    // both burning holds it wherever it is, unless it is already up in the loft with you
    L.isWon = () => s.fire[0] && s.fire[1] && !onYou(c0());
    L.objectiveText = () => { const load = G.inv.reduce((a, i) => a + (i.weight || 1), 0); return (s.fire[0] && s.fire[1] ? 'Both burning. ' : 'Hay alight: ' + (+s.fire[0] + +s.fire[1]) + ' of 2. ') + 'Carrying ' + load + '.'; };
    L.deathCause = () => (s.fire[0] && s.fire[1] ? 'late' : s.behind ? 'behind' : 'default');
    // a lit bottle is not put down on these boards: it is lowered toward them, and snatched back up before it touches them
    L.onDrop = it => {
      if (it.id !== 'cocktail_lit') return;
      it.taken = true; G.inv.push(it); G.active = G.inv.length - 1; G.hand.gone = null;   // (still in your hand: putting it down had let go of it)
      G.fumble(it, { x: it.x, y: it.y, z: it.z, w: 0.3, h: 0.3, flat: true }, { preset: 'return', at: { x: it.x, y: it.y + 0.2, z: it.z }, speed: 0.9, sfx: { hit: '' } });
      G.say('Not on these boards. The whole loft would go.', 'Not in here.');
    };
    L.update = dt => {
      const c = c0();
      ready(c);
      c.load = G.inv.reduce((a, i) => a + (i.weight || 1), 0);
      if (s.run) updateRun(c, dt);
      // both burning: once it has come round, if it was going round, where it is on its way decides what it does
      //  'line'  still outside the fire line: it hurries to the fire (fast enough that the whole of what follows fits in a
      //          few seconds) and is stopped there
      //  'out'   in among the hay when it went up: it rears back out of the flames to the fire line
      //  'smoke' past the hay, the fire at its back, not yet up in the loft: it stops, rears back, and backs away from you
      //          (down off the chute or the ladder) into the smoke, and gives up there
      // L.aftermath plays each out
      if (L.won && !s.run && !s.rush) {
        const p = pathLeft(c), lane = c.lane, foot = geo(lane).dF;
        const mode = p >= sBar(lane) - 0.02 ? 'line' : pastHay(c) ? 'smoke' : 'out';
        s.rush = { mode, p0: p, onLadder: p < foot, v: Math.max(3, (p - sBar(lane)) / 1.8) };
        if (mode === 'line') {
          c.hold = null;
          c.distFn = (cr, dt2) => dOf(cr.lane, Math.max(sBar(cr.lane), pathLeft(cr) - dt2 * s.rush.v));
        } else {
          c.hold = c.dist;
          s.rush.to = mode === 'out' ? sBar(lane) : Math.max(p, Math.min(sPast(lane) - 0.3, Math.max(p + 1.2, sOf(lane, SMOKE[lane.idx] / Math.cos(lane.elev)))));
          s.rush.back = clamp((s.rush.to - p) / 2.4, 0.6, 2.6);
        }
      }
    };
    // the aftermath: at the fire line it rears back from the flames, paces along them side on, one way and back, and sits
    // down with its arms round itself, facing the loft. Caught between the fire and the loft, it rears back where it is,
    // backs away from you into the smoke, paces a little there, and sits down the same way.
    const WIN = {
      line: ['It paced the line of the fire in the yard for an hour and then sat down with its arms round itself, facing the loft, and stayed there until the light came.',
        'It paced behind the fire on the barn floor for an hour, then sat down on the boards with its arms round itself, facing the ladder, and stayed there until the light came.'],
      smoke: ['The hay in the yard went up behind it. It backed away from the loft door into the smoke, sat down at the foot of the chute with its arms round itself, facing you, and stayed there until the light came.',
        'The hay on the barn floor went up behind it. It came no nearer the ladder: it sat down on the boards in the smoke with its arms round itself, facing up at you, and stayed there until the light came.'],
      ladder: 'The hay on the barn floor went up behind it. It let go of the ladder, backed away into the smoke, sat down on the boards with its arms round itself, facing up at you, and stayed there until the light came.',
    };
    L.aftermath = (t, dt) => {
      const c = c0();
      if (t > 14) return true;
      if (!s.rush) return false;   // still coming round to the other way in
      const r = s.rush;
      if (!s.after) {
        s.after = { at: null, smoke: r.mode === 'smoke' };
        L.text.win = r.mode !== 'smoke' ? WIN.line[c.lane.idx] : c.lane.idx === 1 && r.onLadder ? WIN.ladder : WIN.smoke[c.lane.idx];
      }
      const a = s.after;
      if (a.at === null) {
        if (r.mode !== 'line') { a.at = t; G.shake(0.2); }   // in among the fire, or with it at its back: it rears back at once
        else if (pathLeft(c) <= sBar(c.lane) + 0.02) { a.at = t; c.hold = c.dist; G.shake(0.2); }
        else return false;
      }
      const k = t - a.at, back = a.smoke ? Math.max(0, r.back + 0.55 - 0.9) : 0;   // the smoke: backing away as it comes out of rearing back
      if (r.mode === 'out') c.hold = dOf(c.lane, lerp(r.p0, r.to, easeOut(clamp(k / 0.7, 0, 1))));   // out of the flames as it rears back
      if (a.smoke) c.hold = dOf(c.lane, lerp(r.p0, r.to, smoothstep(clamp((k - 0.55) / r.back, 0, 1))));
      if (k < 0.9) { c.recoil = Math.min(1, k / 0.2) * (1 - smoothstep((k - 0.6) / 0.3)); return false; }
      c.recoil = 0;
      if (k < 0.9 + back) return false;
      const k2 = k - back, paceT = a.smoke ? 1.4 : 1.7, wide = a.smoke ? 0.6 : 0.9;
      if (k2 < 0.9 + paceT) {   // pacing the fire, side on
        const u = (k2 - 0.9) / paceT, side = a.side || (a.side = c.rand() < 0.5 ? 1 : -1);
        c.runPose = true; c.runPace = 0.45; c.runGait = (c.runGait || 0) + dt * 7;
        c.runLat = side * wide * Math.sin(Math.PI * u); c.runDir = Math.cos(Math.PI * u) >= 0 ? side : -side;
        const n = Math.floor(c.runGait / Math.PI);
        if (n !== a.steps) { a.steps = n; AUDIO.footstep('walker', 0.18, panTo(c.yaw)); }
        return false;
      }
      c.runPose = false; c.runLat = 0; c.sitting = true;
      return k2 >= 2.1 + paceT;
    };
    // the thing is drawn in order by how far away it really is, and fogged by it: on the barn floor its lane distance is
    // more than three times that, which put it behind the far wall and deep in the fog. While it goes round out of sight
    // it is not drawn at all.
    L.dynamic = () => {
      drawBits();
      const c = c0(), cp = L.rend && L.rend.get(c);
      if (cp) {
        const p = c.pos(), real = Math.max(0.3, Math.hypot(p.x, p.z)), laneD = Math.max(0.3, Math.hypot(c.dist, c.lat || 0));
        cp.sortDist = real; cp.fogScale = 0.85 * R.fogAmt(real) / Math.max(1e-4, R.fogAmt(laneD));
        cp.alpha = s.run && s.run.hidden ? 0 : undefined;
      }
      // the fires: flames run out from where the bottle broke, over both stacks of the pair and low across the gap
      // between them, growing as they go; sparks go up off them
      FIRES.forEach((F, k) => {
        if (!s.fire[k]) return;
        const age = L.t - s.fireT[k], reach = Math.min(F.w / 2 + 0.8, age < 0.35 ? age / 0.35 * 1.2 : 1.2 + (age - 0.35) * 1.3);   // the gap at once, then out along the stacks, slower than it runs
        F.spots.forEach(([along, depth, low], i) => {
          const ph = i * 1.93 + k, grow = smoothstep(clamp((reach - Math.abs(along)) / 0.8, 0, 1));
          if (grow <= 0) return;
          const x = F.axis === 'x' ? F.cx + along : F.cx + depth, z = F.axis === 'x' ? F.cz + depth : F.cz + along;
          const fw = (low ? 0.75 : 1.15) * (0.95 + Math.sin(L.t * 5 + ph) * 0.12) * (0.5 + 0.5 * grow);
          const fh = (low ? 0.85 : 2.6 + Math.sin(ph * 3.1) * 0.6) * (1 + Math.sin(L.t * 8.3 + ph) * 0.14 + Math.sin(L.t * 19 + ph * 2) * 0.07) * grow;
          R.add(SC.mkSprite(L, x, low ? 0.02 : F.top - 0.9, z, fw, fh, (ctx) => { ctx.scale(fw, fh); barnFlame(ctx, L.t, ph); }, { noFog: true, noLight: true }));
        });
        for (let i = 0; i < 10; i++) {   // sparks
          const life = 1.6, q = ((L.t * 0.9 + i * 0.37) % life) / life, along = Math.sin(i * 7.3) * F.w * 0.45 * Math.min(1, reach / (F.w / 2));
          const x = F.axis === 'x' ? F.cx + along + Math.sin(L.t * 2 + i) * 0.3 : F.cx + Math.sin(i * 3.1) * 0.6, z = F.axis === 'x' ? F.cz + Math.sin(i * 3.1) * 0.6 : F.cz + along + Math.sin(L.t * 2 + i) * 0.3;
          const sz = 0.06 * (1 - q), p = L.pt(x, F.top + q * 4.5, z);
          R.add({ kind: 'sprite', x: p[0], y: p[1], z: p[2], w: sz, h: sz, noFog: true, noLight: true, draw: (ctx) => { ctx.fillStyle = 'rgba(255,' + (200 - q * 120 | 0) + ',90,' + (1 - q).toFixed(2) + ')'; ctx.fillRect(-sz / 2, 0, sz, sz); } });
        }
      });
      // the bottle bursting: a ball of fire blooming out of the broken glass, and the glass flying
      const b = s.burst, bt = b ? L.t - b.t : 9;
      if (b && bt < 0.8) {
        const k = bt / 0.8, r = 0.5 + 2.4 * easeOut(k), a = 1 - k;
        R.add({ kind: 'sprite', x: b.x, y: b.y - r * 0.45, z: b.z, w: r * 2, h: r * 2, noFog: true, noLight: true, draw: (ctx) => {
          ctx.scale(r * 2, r * 2); const g = ctx.createRadialGradient(0, 0.5, 0.02, 0, 0.5, 0.5);
          g.addColorStop(0, 'rgba(255,246,200,' + (0.95 * a).toFixed(3) + ')'); g.addColorStop(0.35, 'rgba(255,170,60,' + (0.8 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(200,60,10,0)');
          ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1);
        } });
        if (bt < 0.5) for (let i = 0; i < 10; i++) {
          const ang = i * 2.39 + 0.4, sp = 2.2 + (i % 3) * 0.9, q = bt;
          const gx = b.x + Math.cos(ang) * sp * q, gz = b.z + Math.sin(ang) * sp * q, gy = b.y + (1.6 + (i % 4) * 0.5) * q - 4.9 * q * q;
          R.add({ kind: 'sprite', x: gx, y: gy, z: gz, w: 0.07, h: 0.07, noFog: true, noLight: true, draw: (ctx) => { ctx.fillStyle = 'rgba(255,236,190,' + (1 - q * 2).toFixed(3) + ')'; ctx.fillRect(-0.5 * 0.07, 0, 0.07, 0.07); } });
        }
      }
      // a lit bottle in flight leaves its flame behind it in the air
      const th = G.throwing;
      if (th && th.it.id === 'cocktail_lit') {
        for (let j = 1; j <= 5; j++) {
          const k = th.t / th.dur - j * 0.035; if (k <= 0) break;
          const x = lerp(th.from.x, th.to.x, k), y = lerp(th.from.y, th.to.y, k) + Math.sin(k * Math.PI) * 0.8 + th.it.h * 0.45, z = lerp(th.from.z, th.to.z, k), sz = 0.3 * (1 - j / 6), al = 0.85 * (1 - j / 6);
          R.add({ kind: 'sprite', x, y, z, w: sz, h: sz, noFog: true, noLight: true, draw: (ctx) => { ctx.scale(sz, sz); const g = ctx.createRadialGradient(0, 0.5, 0, 0, 0.5, 0.5); g.addColorStop(0, 'rgba(255,214,120,' + al.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,110,30,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); } });
        }
      }
    };
    // soaked in firelight: the stacks darken to embers' colour once they are well alight
    const hayLit = () => { hayProps.forEach((props, k) => { const f = s.fire[k] ? smoothstep(clamp((L.t - s.fireT[k]) / 3, 0, 1)) : 0; for (const p of props) { if (!p.dry) p.dry = p.color; p.color = f > 0 ? mixc(p.dry, [52, 30, 18], 0.7 * f) : p.dry; } }); };
    const upd = L.update; L.update = dt => { upd(dt); hayLit(); flyBits(dt); s.invWas = G.inv.slice(); s.activeWas = G.active; };
    L.dynamicLights = () => {
      const out = [];
      FIRES.forEach((F, k) => { if (!s.fire[k]) return; const f = smoothstep(clamp((L.t - s.fireT[k]) / 1.2, 0, 1)), p = L.pt(F.cx, 2.5, F.cz); out.push({ x: p[0], y: p[1], z: p[2], r: 14, i: 0.25 + 0.55 * f, color: [255, 140, 60], flicker: 0.6, seed: 4 + k * 2 }); });
      if (G.hasItem('cocktail_lit')) { const p = L.pt(Math.sin(G.cam.yaw - L.facing) * 0.5, L.eyeH - 0.4, Math.cos(G.cam.yaw - L.facing) * 0.5); out.push({ x: p[0], y: p[1], z: p[2], r: 5, i: 0.6, color: [255, 180, 100], flicker: 0.4, seed: 8 }); }
      return out;
    };
    L.glows = () => {
      const out = [];
      FIRES.forEach((F, k) => { if (!s.fire[k]) return; const f = smoothstep(clamp((L.t - s.fireT[k]) / 1.2, 0, 1)), p = L.pt(F.cx, 2.2, F.cz); out.push({ x: p[0], y: p[1], z: p[2], r: (5 + Math.sin(L.t * 7) * 0.4) * (0.4 + 0.6 * f), color: [255, 140, 50], a: 0.28 }); });
      return out;
    };
    L.floor = { poly: [[-4.3, -3.8], [0.3, -3.8], [0.3, 3.8], [-4.3, 3.8]], y: FL + 0.02 };
  }
});
