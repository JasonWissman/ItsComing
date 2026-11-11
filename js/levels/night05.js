'use strict';
// ============================================================ 5. THE CLEARING ============================================================
// A bow somewhere on the porch, and three arrows lying about it, each in a place of its own. Hold the button to draw: a
// power bar beside the aim fills, and at the top it is full (it goes green, the string comes tight with a click and shines), and
// it stays full for as long as you hold it. Let go full with the aim on it and the arrow goes in, however far off it is (the
// further, the smaller it is to aim at); full but off it, it misses; let go before it is full and it drops into the snow
// short of it. A tap looses nothing: the bow comes up, the string starts back, and it is let down again. Two hits put it
// down (the first drops it for a moment); with all three arrows gone and it still up, it stops watching and comes flat
// out. Drawn on, it may break sideways to a new place (30% of draws, never twice within a few seconds), so the aim has to
// come after it. (The shared draw is drawPress/updateDraw/looseDraw in js/game.js.)
const CLEARING_BOW = (() => {
  const FILL = 1.5, MIN = 0.18;
  // the world direction through a point on the screen (page coordinates), from the eye
  function rayAt(aim) {
    const x = (aim.x - R.W / 2) / R.f, y = -(aim.y - R.viewY - R.H / 2) / R.f;
    const cy = Math.cos(G.cam.yaw), sy = Math.sin(G.cam.yaw), cp = Math.cos(G.cam.pitch), sp = Math.sin(G.cam.pitch);
    const dy = y * cp - sp, cz = y * sp + cp, wx = x * cy + cz * sy, wz = -x * sy + cz * cy, l = Math.hypot(wx, dy, wz);
    return [wx / l, dy / l, wz / l];
  }
  // ---- the bow in your hands, drawn over the view ----
  // In a frame at the aim point, in units of the view's height, y down. The arrow comes up from the bottom right toward the
  // aim and rests on the shelf a little below and right of it; the bow is canted, its top to the right, so its upper limb
  // leans away from where it is aimed and nothing of it crosses the aim. Drawing, the string and the arrow's nock come back
  // toward you (down and right, off the bottom of the view at full draw), the limbs bend and their tips come back and in.
  // Not drawing, it is held low at the bottom right, just in view while you look ahead. With the hands hidden
  // (HANDS.showHands false) it floats there as every held thing does: no sleeve, no glove on the grip or the string.
  const COL = { wood: [80, 54, 34], woodL: [126, 90, 56], woodD: [38, 25, 16], grip: [46, 32, 24], wrap: [22, 16, 11], string: [206, 198, 178], stringL: [250, 244, 222],
    shaft: [180, 146, 100], head: [146, 148, 156], headL: [206, 208, 214], fA: [176, 44, 36], fB: [220, 210, 188], glove: [30, 27, 27], gloveL: [64, 58, 56], sleeve: [40, 35, 34], sleeveL: [62, 55, 52] };
  const DIR = [-0.36, -0.933], W_ = [0.38, -0.925], BACK = [0.925, 0.38], OUT = [-0.925, -0.38];   // the arrow's way, up the bow, toward you, away
  const V = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const bez = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  function seg(ctx, a, b, w, col, alpha) { ctx.strokeStyle = col; ctx.lineWidth = w; if (alpha !== undefined) ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.globalAlpha = 1; }
  function inHands(ctx, W, H, d, L, aim) {
    const s = L.s, show = s.bowShow || 0, up = s.bowUp || 0, pull = s.pull || 0;
    if (show < 0.01) return;
    const S = H, lit = s.bowLit || 1, col = (c, k) => rgba(scalec(c, lit * (k || 1))), hands = HANDS.showHands;
    const am = aim ? { x: clamp(aim.x, W * 0.1, W * 0.9), y: clamp(aim.y - R.viewY, H * 0.28, H * 0.62) } : null;   // it follows the aim, but not up or down off the view
    const ax = am ? lerp(W / 2 + 0.3 * S, am.x, up) : W / 2 + 0.3 * S, ay = (am ? lerp(H / 2, am.y, up) : H / 2) + (1 - up) * 0.6 * S + (1 - show) * 0.7 * S;
    let tx = 0, ty = 0;
    if (d && d.state === 'drawing' && d.power > 0.8 && !SAVE.data.settings.reducedMotion) {   // the arms tremble a little as it nears full draw (the bow, never the aim)
      const a = (d.power - 0.8) * 0.01 + (d.power >= 1 ? 0.002 : 0);
      tx = Math.sin(G.t * 53) * a * S; ty = Math.cos(G.t * 41) * a * S;
    }
    // no arrow to nock (the button pressed with none left), with no hand to feel for one: the bow comes up and tips toward
    // you to show the bare shelf, the string is plucked twice where the nock would be, twitching and buzzing, and nothing
    // sits on it; then it is let down
    const gr = s.groping && !d && !hands ? s.groping : null;
    let tilt = 0, twitch = 0;
    if (gr) {
      const t = gr.t, k = smoothstep(clamp((t - 0.06) / 0.2, 0, 1)) * (1 - smoothstep(clamp((t - 0.7) / 0.26, 0, 1)));
      tilt = -0.2 * k;
      for (const at of [0.37, 0.59]) if (t >= at) { const u = t - at; twitch += Math.exp(-u * 14) * (0.05 + 0.02 * Math.sin(u * 90)); }
    }
    ctx.save(); ctx.translate(ax + tx, ay + ty); ctx.rotate((1 - up) * 0.32 + tilt); ctx.scale(S, S);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const rest = V([0, 0], DIR, -0.2);   // the shelf the arrow rests on
    // the limbs bend most over the last of the draw (as a bow's weight builds): fully drawn, their tips are hauled hard back
    // and in, and the string, taut, catches the light
    const bend = pull + 1.5 * Math.pow(pull, 8), taut = clamp((pull - 0.97) / 0.03, 0, 1);
    const tipOf = sgn => V(V(rest, W_, sgn * (0.6 - 0.04 * bend)), BACK, 0.055 * bend);
    const nock = V(rest, DIR, -(0.06 + pull * 0.86 + twitch));
    // the bow arm, in from the left at the bottom to the hand on the grip: a dark wool sleeve, the light along its top
    if (hands) {
      const wrist = V(V(rest, W_, -0.05), [-1, 0.25], 0.03), elbow = V(rest, [-0.62, 0.62], 1);
      for (let i = 0; i < 6; i++) { const a = V(elbow, [wrist[0] - elbow[0], wrist[1] - elbow[1]], i / 6), b = V(elbow, [wrist[0] - elbow[0], wrist[1] - elbow[1]], (i + 1) / 6); seg(ctx, a, b, lerp(0.07, 0.042, i / 6), col(COL.sleeve)); }
      seg(ctx, V(elbow, [0.3, -0.85], 0.024), V(wrist, [0.3, -0.85], 0.014), 0.01, col(COL.sleeveL));
      seg(ctx, V(wrist, [wrist[0] - elbow[0], wrist[1] - elbow[1]], -0.12), V(wrist, [wrist[0] - elbow[0], wrist[1] - elbow[1]], -0.08), 0.05, col(COL.sleeveL, 0.8));   // the cuff
    }
    // the limbs, tapering to the tips, which flick outward; light along their backs
    for (const sgn of [-1, 1]) {
      const a = V(rest, W_, sgn * 0.08), b = tipOf(sgn), c = V(V(rest, W_, sgn * 0.34), OUT, 0.05 - 0.025 * pull);
      let prev = a;
      for (let i = 1; i <= 12; i++) {
        const p = bez(a, c, b, i / 12), w = lerp(0.03, 0.012, i / 12);
        seg(ctx, prev, p, w, col(COL.wood));
        seg(ctx, V(prev, OUT, w * 0.3), V(p, OUT, w * 0.3), w * 0.3, col(COL.woodL));
        prev = p;
      }
      seg(ctx, b, V(V(b, OUT, 0.024), W_, sgn * 0.02), 0.011, col(COL.wood));
      seg(ctx, V(b, W_, -sgn * 0.01), V(b, W_, sgn * 0.004), 0.016, col(COL.woodD));   // the nock the string is tied at
    }
    // the riser, the leather grip below the shelf and its wraps
    seg(ctx, V(rest, W_, -0.11), V(rest, W_, 0.11), 0.036, col(COL.wood));
    seg(ctx, V(V(rest, W_, -0.1), OUT, 0.01), V(V(rest, W_, 0.1), OUT, 0.01), 0.01, col(COL.woodL));
    seg(ctx, V(rest, W_, -0.075), V(rest, W_, -0.01), 0.044, col(COL.grip));
    // the bow hand round the grip: the glove, the knuckles, the thumb over the front of it
    if (hands) {
      ctx.save(); ctx.translate(...V(V(rest, W_, -0.045), BACK, 0.012)); ctx.rotate(Math.atan2(W_[1], W_[0]));
      ctx.fillStyle = col(COL.glove); ctx.beginPath(); ctx.ellipse(0, 0, 0.052, 0.034, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < 3; i++) { ctx.fillStyle = col(COL.gloveL); ctx.beginPath(); ctx.ellipse(-0.03 + i * 0.022, 0.024, 0.011, 0.007, 0, 0, TAU); ctx.fill(); }
      ctx.fillStyle = col(COL.glove, 1.15); ctx.beginPath(); ctx.ellipse(0.03, -0.018, 0.026, 0.012, -0.4, 0, TAU); ctx.fill();
      ctx.restore();
    }
    // the string, from each tip back to the nock (plucked with nothing on it, it blurs a moment)
    for (const sgn of [1, -1]) seg(ctx, tipOf(sgn), nock, 0.0035 + 0.001 * taut + 0.05 * twitch, col(COL.string, 1 + 0.25 * taut), twitch ? 0.6 : 1);
    // drawn full, and for as long as it is held there, the string shines: a bright glint along it the moment it tops out
    // (with the click), settling to a steady pale sheen, so the bow itself says it is full
    if (d && d.state === 'drawing' && d.full) {
      const since = d.t - (d.u.draw.fill || FILL), glint = Math.exp(-since * 5);
      for (const sgn of [1, -1]) seg(ctx, tipOf(sgn), nock, 0.008 + 0.006 * glint, rgba(COL.stringL, 0.16 + 0.3 * glint));
      for (const sgn of [1, -1]) seg(ctx, tipOf(sgn), nock, 0.0045, rgba(COL.stringL));
    }
    // the arrow on the string: nocked while it is drawn or ready; just loosed, the string is bare, then the next is
    // brought up and nocked (if there is one)
    let arrowAt = null;
    if (d && d.state === 'loosed') { if (d.t > 0.3 && G.hasItem('arrows')) arrowAt = 1 - smoothstep((d.t - 0.3) / 0.25); }
    else if (d || G.hasItem('arrows')) arrowAt = 0;
    if (arrowAt !== null) {
      const off = V([0, 0], DIR, -0.35 * arrowAt), t0 = V(nock, off, 1), h0 = V(V(rest, DIR, 0.075 - 0.045 * pull), off, 1);
      for (let i = 0; i < 6; i++) { const a = V(t0, [h0[0] - t0[0], h0[1] - t0[1]], i / 6), b = V(t0, [h0[0] - t0[0], h0[1] - t0[1]], (i + 1) / 6); seg(ctx, a, b, lerp(0.014, 0.007, i / 6), col(COL.shaft)); }
      const len = Math.hypot(h0[0] - t0[0], h0[1] - t0[1]), along = k => V(t0, DIR, k * len);
      const vane = (side, c2) => { const p0 = along(0.03), p1 = along(Math.min(0.5, 0.17 / Math.max(len, 0.01))); P_poly(ctx, [p0, p1, V(p1, [-DIR[1] * side, DIR[0] * side], 0.012), V(p0, [-DIR[1] * side, DIR[0] * side], 0.028)], col(c2)); };
      vane(1, COL.fA); vane(-1, COL.fB);
      P_poly(ctx, [V(h0, DIR, 0.03), V(V(h0, DIR, -0.012), [-DIR[1], DIR[0]], 0.011), V(V(h0, DIR, -0.012), [DIR[1], -DIR[0]], 0.011)], col(COL.head));   // the broadhead
      seg(ctx, V(h0, DIR, 0.026), V(h0, DIR, -0.008), 0.003, col(COL.headL));
    }
    // no arrow to nock (the button pressed with none left), with the hands shown: the drawing hand comes up to the string,
    // its fingers open, feels up along the shelf where an arrow should lie, twice, finds nothing there and drops away, and
    // the bow is let down
    if (s.groping && !d && hands) {
      const t = s.groping.t, k = smoothstep(clamp((t - 0.06) / 0.2, 0, 1)) * (1 - smoothstep(clamp((t - 0.7) / 0.26, 0, 1)));
      const feel = t > 0.26 && t < 0.7 ? Math.sin((t - 0.26) / 0.44 * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5 : 0;   // two strokes up the shelf and back
      const to = V(nock, DIR, 0.01 + feel * 0.13), from = V(nock, [0.62, 0.78], 0.8), h = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)];
      seg(ctx, V(h, [0.95, 0.3], 0.02), V(h, [0.95, 0.3], 0.6), 0.075, col(COL.sleeve));
      ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(Math.atan2(DIR[1], DIR[0]));   // x up the shelf, toward where the arrow's head would be
      ctx.fillStyle = col(COL.glove); ctx.beginPath(); ctx.ellipse(-0.014, 0.004, 0.038, 0.031, 0, 0, TAU); ctx.fill();
      const spread = 0.002 + 0.004 * Math.sin(t * 17);   // the two fingers working, finding nothing between them
      for (const [y, len] of [[-0.009 - spread, 0.05], [0.01 + spread, 0.046]]) { seg(ctx, [0.008, y], [len, y * 1.15], 0.019, col(COL.glove)); seg(ctx, [0.014, y - 0.004], [len - 0.004, y * 1.15 - 0.004], 0.005, col(COL.gloveL, 0.9)); }
      seg(ctx, [-0.006, -0.026], [0.026, -0.036], 0.016, col(COL.glove, 1.15));   // the thumb
      for (const y of [-0.012, 0.0, 0.012]) { ctx.fillStyle = col(COL.gloveL); ctx.beginPath(); ctx.ellipse(-0.004, y, 0.008, 0.006, 0, 0, TAU); ctx.fill(); }   // the knuckles
      ctx.restore();
    }
    // the drawing hand at the nock while it is drawn, two fingers hooked on the string, its sleeve going off to the right
    // (at full draw the hand is back at your jaw, out of view); loosed, the hand has let go and dropped away
    if (hands && d && (d.state === 'drawing' || d.state === 'easing') && nock[1] < 0.9) {
      const h = V(nock, BACK, 0.022);
      seg(ctx, V(h, [0.95, 0.3], 0.02), V(h, [0.95, 0.3], 0.6), 0.075, col(COL.sleeve));
      ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(Math.atan2(BACK[1], BACK[0]));
      ctx.fillStyle = col(COL.glove); ctx.beginPath(); ctx.ellipse(0.005, 0, 0.034, 0.026, 0, 0, TAU); ctx.fill();
      for (const k of [-1, 1]) { ctx.fillStyle = col(COL.gloveL); ctx.beginPath(); ctx.ellipse(-0.022, k * 0.01, 0.012, 0.007, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }
  return { FILL, MIN, COL, rayAt, inHands };
})();
LEVELS.push({
  id: 'clearing', title: 'The Clearing', facing: 180, eyeH: 2.0,
  pal: { skyTop: [6, 8, 16], fog: [54, 60, 74], ground: [126, 132, 148], fogDist: 120 },
  ambient: { wind: 1.1, drone: 0.6, droneFreq: 46, windFreq: 420 },
  weather: { kind: 'snow', density: 1, wind: 0.5 },
  lights: [{ x: 1.7, y: 1.7, z: -1.45, r: 6, i: 0.55, color: [255, 190, 110], flicker: 0.15 }],
  text: {
    intro: 'You heard a rustling in the bushes.',
    hint: 'The bow is somewhere on the porch, and its three arrows are lying about, each in a different place. Hold to draw until the bar is full, and let go with it in your sights. It takes two hits to put it down.',
    objective: 'Get the bow and the arrows. Two hits.',
    death: { default: 'It dragged you out into the woods.', wounded: 'It was injured, but it still reached you.', spent: 'You missed. It dragged you out to the woods.' },
    win: 'It twitched, but eventually stopped moving.',
    fragment: 'The inside of your forearm was red in the morning, one long thin welt, as if something had snapped against it all night.',
  },
  // it comes at the steps, or round the open side of the porch
  lanes: [
    { deg: 0, name: 'porch steps', barrierDist: 0, cue: 'crack', default: true },
    { deg: 90, name: 'porch side', barrierDist: 0, cue: 'crack' },
  ],
  creatures: [{ type: 'runner', startDist: 115, time: 62, unseenMult: 1.3 }],   // three arrows to find now: more time (on Nightmare about 37 s in if watched, about 20 if not)
  aftermath: { type: 'down', dur: 3.8 },
  // The bow pressed with no arrows: the hand feels on the string for one (emptyText is what the game says when the draw finds
  // no ammo; it starts that too). The arrows on their own, clicked at it: a use for the arrows whose 'ammo' is the bow, so a
  // click on it with no bow finds the bow missing, and the arrow is raised to a bow that is not there and drops to the boards.
  uses: [{
    tool: 'bow', ammo: 'arrows', range: Infinity, sfx: 'twang', shake: 0.1, emptyText: L => { L.s.grope(); return 'No arrows.'; }, fireText: 'Draw.',
    draw: { fill: CLEARING_BOW.FILL, min: CLEARING_BOW.MIN, loose: (outcome, c, aim, power, L) => L.s.loose(outcome, c, aim, power) },
    inHands: (ctx, W, H, d, L, aim) => CLEARING_BOW.inHands(ctx, W, H, d, L, aim),
  }, { tool: 'arrows', ammo: 'bow', range: Infinity, fireText: 'Draw.', emptyText: L => { L.s.noBow(); return 'No bow.'; } }],
  build(L) {
    const s = L.s;
    const logs = [60, 44, 32], logsD = [42, 30, 22], porch = [76, 62, 50];
    SC.stars(L, 51, 220, 0.9);
    SC.clouds(L, 52, 4, [26, 30, 44], 0.4);
    SC.moon(L, 150, 21, 6, [220, 224, 235]);
    // the deck: boards running along the cabin. Everything under it (the skirt, the foot of the wall, the steps, which
    // tuck under its edge) is drawn first, in the ground layer, so the deck covers whatever of it is under the boards
    // from wherever you look; drawn after it, the skirt showed through the deck as a dark band along its edge
    SC.floorQ(L, -3.2, -1.6, 3.2, 1.6, 0.35, porch, { tex: 'planks', texScale: 1.3 });
    const under = { layer: 0, sortDist: 6 };
    SC.wallV(L, -3.2, 1.6, 3.2, 1.6, 0, 0.35, logsD, under);
    for (const x of [-3.2, 3.2]) SC.wallV(L, x, -1.6, x, 1.6, 0, 0.35, logsD, under);
    SC.wallV(L, -3.4, -1.6, 3.4, -1.6, 0, 0.35, logs, under);
    SC.box(L, -0.8, 0.8, 0, 0.18, 1.6, 2.2, porch, under);
    SC.box(L, 3.2, 3.8, 0, 0.18, -0.6, 0.6, porch, under);
    // the cabin wall, up to the porch roof (it stopped short of it, and the sky showed through between)
    SC.wallV(L, -3.4, -1.6, 3.4, -1.6, 0.35, 3.2, logs, { tex: 'logs', texScale: 1.0 });
    // the door, in its frame, with a latch; the lit window in its frame (lit from inside: the porch light does not tint it)
    const frame = [66, 50, 36];
    SC.wallV(L, -0.55, -1.58, 0.55, -1.58, 0.35, 2.3, [32, 24, 18]);
    for (const x of [-0.19, 0.175]) SC.wallV(L, x, -1.574, x + 0.015, -1.574, 0.38, 2.27, [22, 16, 12]);
    SC.wallV(L, -0.64, -1.57, -0.55, -1.57, 0.35, 2.39, frame); SC.wallV(L, 0.55, -1.57, 0.64, -1.57, 0.35, 2.39, frame); SC.wallV(L, -0.55, -1.57, 0.55, -1.57, 2.3, 2.39, frame);
    SC.wallV(L, 0.36, -1.57, 0.46, -1.57, 1.1, 1.15, [92, 88, 80]);
    SC.wallV(L, 1.2, -1.58, 2.2, -1.58, 1.3, 2.1, [222, 162, 82], { noFog: true, noLight: true });
    SC.wallV(L, 1.68, -1.57, 1.72, -1.57, 1.3, 2.1, logsD); SC.wallV(L, 1.2, -1.57, 2.2, -1.57, 1.68, 1.72, logsD);
    SC.wallV(L, 1.13, -1.565, 1.2, -1.565, 1.24, 2.17, frame); SC.wallV(L, 2.2, -1.565, 2.27, -1.565, 1.24, 2.17, frame);
    SC.wallV(L, 1.13, -1.565, 2.27, -1.565, 2.1, 2.17, frame); SC.wallV(L, 1.13, -1.565, 2.27, -1.565, 1.24, 1.3, frame);
    for (const x of [-3.0, 3.0]) SC.box(L, x - 0.08, x + 0.08, 0.35, 2.95, 1.42, 1.58, logsD);
    SC.box(L, 3.0, 3.16, 0.35, 2.95, -1.5, -1.34, logsD);
    SC.quad(L, [-3.4, 2.95, 1.75], [3.4, 2.95, 1.75], [3.4, 3.2, -1.6], [-3.4, 3.2, -1.6], [28, 20, 15]);
    // the railings: a post each side of the steps, rails between the posts, and the balusters spaced evenly between
    const rail = (a, b, at) => {   // from a to b along one axis at a fixed other coordinate; at(u) gives [x, z]
      for (const [y0, y1] of [[1.2, 1.3], [0.8, 0.85]]) { const p = at(a), q = at(b); SC.wallV(L, p[0], p[1], q[0], q[1], y0, y1, logsD); }
      const n = Math.max(2, Math.round(Math.abs(b - a) / 0.42));
      for (let i = 1; i < n; i++) { const u = a + (b - a) * i / n, p = at(u - 0.025), q = at(u + 0.025); SC.wallV(L, p[0], p[1], q[0], q[1], 0.36, 1.2, logsD); }
    };
    for (const side of [-1, 1]) {
      SC.box(L, side * 0.9 - 0.05, side * 0.9 + 0.05, 0.35, 1.36, 1.45, 1.55, logsD);
      rail(side * 2.92, side * 0.95, u => [u, 1.5]);
    }
    // the west side of the porch is railed, from the wall to the corner post; the east side is open where the steps down to the yard are
    rail(-1.6, 1.42, u => [-3.0, u]);
    // the woodpile, kept back against the wall and clear of the way it comes round the open side (its arms swung
    // through the old, deeper one), split logs stacked with their cut ends toward you; the lamp at its back corner
    const wood = [72, 54, 38];
    SC.box(L, 2.0, 3.0, 0.35, 1.1, -1.55, -1.0, wood);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
      const y = 0.445 + r * 0.165, z = -1.45 + k * 0.175 + (r % 2 ? 0.015 : -0.005), rad = 0.085 - ((r * 3 + k) % 3) * 0.006, sh = 0.9 + ((r * 7 + k * 5) % 4) * 0.06;
      L.props.push({ kind: 'poly', pts: Array.from({ length: 12 }, (_, i) => { const a = (i + 0.5) / 12 * TAU; return L.pt(1.99, y + Math.cos(a) * rad, z + Math.sin(a) * rad); }), color: scalec([132, 100, 66], sh) });
    }
    for (let r = 1; r < 4; r++) { const y = 0.445 + (r - 0.5) * 0.165; SC.wallV(L, 2.0, -0.99, 3.0, -0.99, y - 0.012, y + 0.012, scalec(wood, 0.5)); }   // the long sides, toward the yard
    // a crate: boards round the edge of each side you can see, and a brace across
    const crate = [70, 56, 44], slat = [98, 80, 60];
    SC.box(L, -2.98, -2.3, 0.35, 0.85, -1.4, -0.9, crate);
    const slats = (A, B) => {   // a face from corner A to corner B (bottom), seen from the eye's side; pieces 1 cm proud of it
      const P = (u, y) => [A[0] + (B[0] - A[0]) * u, y, A[1] + (B[1] - A[1]) * u], w = 0.07 / Math.hypot(B[0] - A[0], B[1] - A[1]);
      const q = (a, b, c, d) => SC.quad(L, a, b, c, d, slat);
      q(P(0, 0.35), P(1, 0.35), P(1, 0.41), P(0, 0.41)); q(P(0, 0.79), P(1, 0.79), P(1, 0.85), P(0, 0.85));
      q(P(0, 0.41), P(w, 0.41), P(w, 0.79), P(0, 0.79)); q(P(1 - w, 0.41), P(1, 0.41), P(1, 0.79), P(1 - w, 0.79));
      q(P(w, 0.41), P(w + 0.1, 0.41), P(1 - w, 0.79), P(1 - w - 0.1, 0.79));
    };
    slats([-2.29, -0.9], [-2.29, -1.4]); slats([-2.3, -0.89], [-2.98, -0.89]);
    const rng = mulberry32(55);
    for (let i = 0; i < 90; i++) { const a = (rng() - 0.5) * 170 * DEG, d = 105 + rng() * 90; SC.tree(L, Math.sin(a) * d, Math.cos(a) * d, 10 + rng() * 10, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 14; i++) { const x = (rng() < 0.5 ? -1 : 1) * (9 + rng() * 30), z = 6 + rng() * 60; SC.tree(L, x, z, 7 + rng() * 6, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 22; i++) { const x = (rng() - 0.5) * 90, z = -8 - rng() * 45; SC.tree(L, x, z, 9 + rng() * 8, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 40; i++) { const a = (70 + rng() * 40) * DEG, d = 100 + rng() * 90; SC.tree(L, Math.sin(a) * d, Math.cos(a) * d, 10 + rng() * 10, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 12; i++) { const x = 10 + rng() * 60, z = (rng() < 0.5 ? -1 : 1) * (4 + rng() * 22); SC.tree(L, x, z, 7 + rng() * 6, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 14; i++) { const x = (rng() - 0.5) * 50, z = 4 + rng() * 40; if (Math.abs(x) < 1.5) continue; SC.boulder(L, x, z, 0.3 + rng() * 0.5, (rng() * 1e6) | 0); }

    // ---- the bow and the arrows ----
    // The bow hangs by its string from a nail above the door or the window, leans on the wall beside the door, or lies
    // across the woodpile; its card is the shape of the way it is (ICONS.bow draws to the card). Hanging, the nail goes
    // where the top of its card meets the wall as seen from the eye, so the string is looped over it from wherever you look.
    const BOW_CARD = { hang: [1.25, 0.34], lean: [0.42, 1.3], lie: [1.25, 0.3] };
    const bowRest = k => (Lv, sp) => { Lv.s.bowRest = k; Lv.s.bowSpot = sp; };
    const bow = mkItem(L, 'bow', 'Bow', [
      { x: 0, y: 2.44, z: -1.52, setup: bowRest('hang') },        // on a nail above the door
      { x: 1.7, y: 2.22, z: -1.52, setup: bowRest('hang') },      // on a nail above the window
      { x: -1.35, y: 0.36, z: -1.45, setup: bowRest('lean') },    // leaning on the wall left of the door
      { x: 0.89, y: 0.36, z: -1.45, setup: bowRest('lean') },     // leaning on the wall between the door and the window
      { x: 2.45, y: 1.1, z: -1.27, key: 'woodpile', setup: bowRest('lie') },   // lying across the woodpile
    ], { tool: true });
    const bowCard = k => { bow.w = BOW_CARD[k][0]; bow.h = BOW_CARD[k][1]; bow.icon = k === 'hang' ? (ctx, P) => ICONS.bow(ctx, P, { hang: true }) : ICONS.bow; };
    bowCard(s.bowRest);
    if (s.bowRest === 'hang') {
      const sp = s.bowSpot, qy = sp.y + BOW_CARD.hang[1] * 0.97, k = -1.54 / sp.z, x = sp.x * k, y = L.eyeH + (qy - L.eyeH) * k;
      SC.box(L, x - 0.02, x + 0.02, y - 0.02, y + 0.02, -1.6, -1.54, [150, 146, 136]);
    }
    // the arrows: three, each in a place of its own, never in a quiver. One is somewhere about eye height (driven into a
    // log of the wall or a corner post where a shot went wide, along the top of the side rail, on the woodpile or the
    // crate), one is down on the boards or the steps (lying, or stood against the wall or a rail), and the third
    // is anywhere well apart from both. Picked up, they go together in one slot, as many as you have ("Arrows ×2"); put
    // down, they lie together, tied. Each is a card the shape of the way it lies (ICONS.arrows draws to the card).
    const ARROW_CARD = { lie: [0.8, 0.14], up: [0.16, 0.8], stuck: [0.6, 0.4], bundle: [0.8, 0.24], held: [0.62, 0.62] };
    let picked = null;
    const at = (rest, o) => Object.assign({ rest, flat: rest === 'lie', jitter: 0, setup: (Lv, sp) => { picked = sp; } }, o);
    const HIGH = [
      at('stuck', { x: -1.75, y: 1.5, z: -1.53 }),                // in the wall left of the door, at eye height
      at('stuck', { x: -2.55, y: 1.62, z: -1.53, flip: true }),   // in the wall over the crate
      at('stuck', { x: -2.9, y: 1.42, z: 1.4 }),                  // in the corner post, front left
      at('stuck', { x: 2.9, y: 1.42, z: 1.4, flip: true }),       // in the corner post, front right
      at('lie', { x: -2.98, y: 1.31, z: 0.25, flip: true }),      // along the top of the side rail
      at('stuck', { x: 2.55, y: 1.62, z: -1.53, flip: true }),    // in the wall beside the window, over the lamp
      at('lie', { x: 2.5, y: 1.1, z: -1.24, key: 'woodpileA', flip: true }),   // on the woodpile
      at('lie', { x: -2.64, y: 0.85, z: -1.12, key: 'crateA' }),  // on the crate
    ];
    const LOW = [
      at('lie', { x: 1.45, y: 0.36, z: 0.05, jitter: 0.1 }),      // on the boards, right
      at('lie', { x: -1.35, y: 0.36, z: 0.45, jitter: 0.1, flip: true }),   // on the boards, left
      at('lie', { x: -0.55, y: 0.36, z: -1.2, jitter: 0.05 }),    // on the boards by the door
      at('lie', { x: 0.35, y: 0.18, z: 1.9, flip: true }),        // on the step
      at('lie', { x: 2.55, y: 0.36, z: 0.85, jitter: 0.1 }),      // on the boards toward the open side
      at('up', { x: 0.72, y: 0.36, z: -1.45 }),                   // stood against the wall between the door and the window
      at('up', { x: -2.25, y: 0.36, z: 1.38 }),                   // stood against the front rail, far left
      at('up', { x: 2.88, y: 0.36, z: 1.36 }),                    // stood against the corner post, far right
    ];
    const arrowCard = (it, k, flip) => { it.rest = k; it.flip = !!flip; const c = ARROW_CARD[k === 'lie' && it.uses > 1 ? 'bundle' : k]; if (c) { it.w = c[0]; it.h = c[1]; } };   // held: in the hand, drawn corner to corner
    // its name and its drawing go by its own count and the way it lies (one let go of from a bundle is a new arrow of its own)
    const dress = it => {
      Object.defineProperty(it, 'name', { get() { return this.uses > 1 ? 'Arrows' : 'Arrow'; }, configurable: true, enumerable: true });   // "Arrows ×2" in the hand
      it.icon = (ctx, P) => ICONS.arrows(ctx, P, it.uses, { stuck: it.rest === 'stuck', flip: it.flip });   // one, or the bundle it has become
    };
    // held in the fist a little below their middle, their heads up and leaning in toward the middle of the view
    const ARROWS_HELD = { grip: 'fist', at: [-0.12, 0.38], axis: 0.8, angle: -1.15, size: 0.36 };
    const local = it => rotY(it.x, it.z, -L.facing);
    const arrows = [];
    for (const spots of [HIGH, LOW, null]) {
      // the third: anywhere at least 1.6 m from both of the others
      const far = spots || HIGH.concat(LOW).filter(sp => arrows.every(o => { const q = local(o), p = spotLocal(sp); return Math.hypot(p[0] - q[0], p[1] - q[1]) >= 1.6; }));
      const it = mkItem(L, 'arrows', 'Arrow', far.length ? far : HIGH.concat(LOW), { stack: true, tool: true, material: 'wood', held: ARROWS_HELD });
      dress(it);
      arrowCard(it, picked.rest, picked.flip);
      arrows.push(it);
    }
    L.floor = { poly: [[-3.1, -1.5], [3.1, -1.5], [3.1, 1.5], [-3.1, 1.5]], y: 0.36 };
    L.onPickup = it => { if (it.id === 'arrows') arrowCard(it, 'held'); };
    L.onDrop = it => { if (it.id === 'bow') bowCard('lie'); if (it.id === 'arrows') { dress(it); arrowCard(it, 'lie'); } };   // put down (or dropped), they lie on the boards
    // in your hands it is cold, and the hands are gloved, as they are on the bow (when hands are drawn at all)
    L.hands = { glove: true, sleeve: CLEARING_BOW.COL.sleeve };

    // ---- what will not go ----
    // The bow pressed with no arrows on you: it comes up, the drawing hand feels on the string and along the shelf for an
    // arrow, twice, and finds none (CLEARING_BOW.inHands draws it); the bow is let down again.
    s.groping = null;
    s.grope = () => { if (!s.groping || s.groping.t > 0.6) s.groping = { t: 0, pats: 0 }; };
    // An arrow with no bow, clicked at it: it is raised to shoot, out in front of you where the bow's shelf would be, finds
    // nothing to sit on and nothing to nock to, tips head first out of the fingers and drops to the boards at your feet,
    // where you have to pick it up again (one from the bundle; the rest stay in hand).
    s.noBow = () => {
      const pile = G.inv.find(i => i.id === 'arrows');
      if (!pile || G.fumbling) return;
      const ray = CLEARING_BOW.rayAt(G.mouse.x >= 0 ? G.mouse : { x: R.W / 2, y: R.viewY + R.H / 2 }), D = 1.3, hl = Math.hypot(ray[0], ray[2]) || 1;
      const at = { x: ray[0] / hl * D, y: L.eyeH - 0.15, z: ray[2] / hl * D }, spot = { id: 'nobow', name: 'Bow', x: at.x, y: at.y - 0.4, z: at.z, w: 0.8, h: 0.8 };
      arrowCard(pile, 'lie');   // the one that goes takes the card of one arrow (its landing is judged by it), the rest stay a bundle in hand
      G.fumble(pile, spot, { preset: 'slip', at, hold: 0.16, pivot: 'left', angle: -2.6, scale: 1, sfx: { hit: null } });
      if (G.inv.includes(pile)) arrowCard(pile, 'held');
    };

    // ---- arrows in flight, and where they end up ----
    // Each flight goes from just in front of the eye, below it (where the bow is), to a point it asks for every frame
    // (the thing, for a hit, so it follows it in), along an arc; a hit lands in it, a short or wide one sticks in the snow,
    // a wild one sails up over it into the dark and is gone.
    const flights = [], stuck = [];
    const add3 = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const panOf = c => Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
    const pathAt = (f, k) => { const to = f.to(); return [lerp(f.from[0], to[0], k), lerp(f.from[1], to[1], k) + f.arc * 4 * k * (1 - k), lerp(f.from[2], to[2], k)]; };
    const fly = f => { f.t = 0; flights.push(f); };
    s.spent = 0; s.lastLand = -10; s.outcomes = [];   // every arrow loosed, in order (the tests read it)
    const hitIt = c => {
      if (c.dead || G.state !== 'play') return;   // it reached you first
      c.hits++; c.hurtFlash = 0.35; c.arrows.push(c.hits);
      AUDIO.sfx('thunk', panOf(c)); G.shake(0.08);
      if (c.hits === 1) { CREATURES.runner.hurt(c); G.toast('It went down. It is getting back up.'); }
      else { CREATURES.runner.kill(c); G.toast('It stopped.'); }
    };
    s.loose = (outcome, c, aim, power) => {
      const ray = CLEARING_BOW.rayAt(aim), eye = [0, L.eyeH, 0], from = add3(add3(eye, ray, 0.9), [0, -1, 0], 0.14);
      const dReal = Math.hypot(c.dist, c.lat || 0), hl = Math.hypot(ray[0], ray[2]) || 1, hd = [ray[0] / hl, 0, ray[2] / hl];
      const ground = dist => add3([0, 0.02, 0], hd, dist);
      const CLEAR = 4.6;   // the nearest an arrow comes down: past the porch and its steps (any nearer stood in the boards, its head under them)
      s.spent++; s.outcomes.push(outcome);
      if (outcome === 'hit') {
        const at = () => { const p = c.pos(), b = c.CR.body(c); return [p.x, p.y + (c.yOff || 0) + (b[2] + b[3]) / 2, p.z]; };
        fly({ from, to: at, arc: 0.01 * dReal, dur: 0.05 + dReal / 80, done: () => hitIt(c) });
        return;
      }
      if (outcome === 'short') {   // not drawn full: it drops into the snow short of it, the less drawn, the shorter
        const r = clamp(lerp(CLEAR, 28, power), CLEAR, Math.max(CLEAR, dReal - 2.5));
        fly({ from, to: () => ground(r), arc: 0.05 * r + 0.3, dur: 0.15 + r / 45, stick: true });
        G.say('Not drawn all the way. It fell short.', 'It fell short.');
      } else if (ray[1] > 0.02) {   // full, but not at it, and aimed up off the snow: over everything and away, into the dark
        const r = dReal + 45;
        fly({ from, to: () => add3(ground(r), [0, 1, 0], 10), arc: 5, dur: 1.1, fade: true });
        G.say('Drawn full, but not at it. It went over.', 'Missed.');
      } else {   // full, but not at it: along the aim, about as far as it is, into the snow
        const r = Math.max(CLEAR, ray[1] < -0.005 ? Math.min(L.eyeH / -ray[1] * hl, dReal + 8) : dReal + 8);
        fly({ from, to: () => ground(r), arc: 0.02 * r + 0.2, dur: 0.1 + r / 70, stick: true });
        G.say('Drawn full, but not at it. Missed.', 'Missed.');
      }
    };
    // with every arrow gone and it still up, it stops watching (the line comes once the last one has landed)
    const spentAll = c => s.spent >= 3 && !flights.length && !c.dead && !c.reckless;
    // drawn on, it may break sideways to a new place (CREATURES.runner.dodge), side on and flat out, and the aim has to
    // come after it. A draw is rolled for once, as it passes the least that looses anything (a click that only lifts the bow
    // is not a draw), on the thing's own seeded stream; never within s.dodge.gap seconds of the last one, and only when it
    // can (out in the open, up, not already running). s.dodge.rolls and .count are what the tests read.
    s.dodge = { chance: 0.3, gap: 4, at: -Infinity, rolls: 0, count: 0 };
    const reactToDraw = c => {
      const d = G.draw, k = s.dodge;
      if (!d || d.state !== 'drawing' || d.rolled || d.t < CLEARING_BOW.MIN || G.state !== 'play') return;
      d.rolled = true;
      if (L.t - k.at < k.gap || !CREATURES.runner.canDodge(c)) return;
      k.rolls++;
      if (c.rand() >= k.chance) return;
      CREATURES.runner.dodge(c); k.at = L.t; k.count++;
    };
    const toward = (v, t, k) => v + (t - v) * Math.min(1, k);
    const standOn = (x, z) => (Math.abs(x) <= 3.2 && Math.abs(z) <= 1.6 ? 0.35 : (Math.abs(x) <= 0.8 && z > 1.6 && z <= 2.2) || (x > 3.2 && x <= 3.8 && Math.abs(z) <= 0.6) ? 0.18 : 0);
    // it stands on what is under its feet: the ground its way runs along, then the step, then the deck. The renderer
    // and the gaze take the height from yOff; c.stand is kept for the lunge, which starts from there (see the runner)
    L.update = dt => {
      const c = L.creature, p = c.pos(), q = rotY(p.x, p.z, -L.facing); c.stand = standOn(q[0], q[1]); c.yOff = c.stand;
      reactToDraw(c);
      for (let i = flights.length - 1; i >= 0; i--) {
        const f = flights[i]; f.t += dt;
        if (f.t < f.dur) continue;
        flights.splice(i, 1); s.lastLand = L.t;
        if (f.stick) {   // it stands in the snow where it came down, its tail up and back toward you
          const a = pathAt(f, 1), b = pathAt(f, 0.96), hl = Math.hypot(a[0] - b[0], a[2] - b[2]) || 1, hx = (a[0] - b[0]) / hl, hz = (a[2] - b[2]) / hl;
          stuck.push({ head: [a[0] + hx * 0.03, 0, a[2] + hz * 0.03], tail: [a[0] - hx * 0.4, 0.48, a[2] - hz * 0.4] });
        }
        if (f.done) f.done();
      }
      if (spentAll(c) && G.state === 'play' && L.t - s.lastLand > 1.2) { c.reckless = true; G.toast('That was the last arrow.'); }
      // the bow in your hands: held low while you look ahead, up while it is drawn; the string snaps forward the moment it is loosed
      const d = G.draw, ahead = G.cam.tPitch < 0.3 && G.state === 'play' && G.hasItem('bow');   // won, it is lowered out of the way of watching it
      s.bowShow = toward(s.bowShow || 0, ahead ? 1 : 0, dt * 7);
      // up while it is drawn (or the button is still held for the next); let back down, it comes up a moment and goes down again;
      // loosed, it comes down out of the arrow's way
      const gr = s.groping;
      if (gr) { gr.t += dt; while (gr.pats < 2 && gr.t >= [0.37, 0.59][gr.pats]) { gr.pats++; AUDIO.sfx('pat', 0.2); } if (gr.t > 1.05 || d || G.state !== 'play') s.groping = null; }   // the fingertips at the empty shelf
      const raised = (!!d && G.state === 'play' && (d.state === 'drawing' || !!G.drawBtn || (d.state === 'easing' && d.t < 0.15))) || (!!s.groping && s.groping.t < 0.78);
      s.bowUp = toward(s.bowUp || 0, raised ? 1 : 0, dt * (raised ? 10 : d ? 8 : 5));
      const pt = !d ? 0 : d.state === 'drawing' ? Math.pow(d.power, 0.75) : d.state === 'easing' ? Math.pow(d.from, 0.75) * (1 - smoothstep(d.t / d.dur)) : 0;
      s.pull = d && d.state === 'loosed' ? 0 : toward(s.pull || 0, pt, dt * 20);
      s.bowLit = 0.85 + 0.15 * Math.max(0, Math.cos(wrapPi(G.cam.yaw - L.facing - Math.PI)));   // facing the lit wall, the bow is lit a little more
    };
    L.dynamic = () => {
      const arrow = (tail, head, alpha, w) => {   // w: thicker for one standing in the snow out there, so it reads from the porch
        const u = [head[0] - tail[0], head[1] - tail[1], head[2] - tail[2]], l = Math.hypot(u[0], u[1], u[2]) || 1, at = k => add3(tail, u, k / l), k = w || 1;
        const o = { kind: 'poly', stroke: true, noContact: true, alpha };
        R.add(Object.assign({ pts: [tail, head], color: [176, 142, 98], lw: 0.018 * k }, o));
        R.add(Object.assign({ pts: [tail, at(0.14)], color: [176, 46, 38], lw: 0.04 * k }, o));          // the fletching, red
        R.add(Object.assign({ pts: [tail, at(0.04)], color: [222, 212, 190], lw: 0.04 * k }, o));        // and pale at the nock end
        if (l > 0.3) R.add(Object.assign({ pts: [at(l - 0.06), head], color: [150, 152, 160], lw: 0.03 * k }, o));   // the head
      };
      for (const f of flights) {
        const k = f.t / f.dur, h = pathAt(f, Math.min(1, k)), b = pathAt(f, Math.max(0, k - 0.02)), u = [h[0] - b[0], h[1] - b[1], h[2] - b[2]], l = Math.hypot(u[0], u[1], u[2]) || 1;
        const fade = f.fade ? clamp((1 - k) / 0.4, 0, 1) : 1;
        // going away from you an arrow is nearly end on, so a faint streak behind it shows its way
        const pts = []; for (let i = 0; i <= 4; i++) pts.push(pathAt(f, Math.max(0, Math.min(1, k) - 0.16 * i / 4)));   // from the arrow back (its width goes by the first point)
        R.add({ kind: 'poly', pts, stroke: true, color: [214, 208, 196], lw: 0.012, alpha: 0.3 * fade, noContact: true, noFog: true });
        arrow(add3(h, u, -0.75 / l), h, f.fade ? fade : undefined);
      }
      for (const a of stuck) arrow(a.tail, a.head, undefined, 1.8);
    };
    // the win: watch it go down, closer in the further off it is, and the view lowered to it as it falls
    L.watchPoint = () => { const c = L.creature, p = c.pos(), k = c.dead ? clamp((c.deadT || 0) / 0.85, 0, 1) : 0; return { x: p.x, y: p.y + (c.yOff || 0) + lerp(1.0, 0.3, k), z: p.z }; };
    L.watchZoom = () => clamp(Math.hypot(L.creature.dist, L.creature.lat) / 12, 1.35, 2.6);
    L.deathCause = c => (s.spent >= 3 ? 'spent' : c.wounded ? 'wounded' : 'default');
    L.isWon = () => L.creature.dead;
    L.objectiveText = () => {
      const a = G.inv.find(i => i.id === 'arrows'), n = a ? a.uses : 0;
      return L.creature.dead ? 'It is down.' : !G.hasItem('bow') ? 'Get the bow.' : !n ? (s.spent >= 3 ? 'No arrows left.' : 'Find the arrows.') : n + ' arrow' + (n > 1 ? 's' : '') + '. Hold until it is full; let go on it.';
    };
  }
});
