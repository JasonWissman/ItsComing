'use strict';
// ============================================================ 5. THE CLEARING ============================================================
// A bow somewhere on the porch, and three arrows lying about it, each in a place of its own. Hold the button to draw: a
// power bar beside the aim fills, and at the top it is full (it goes green, the string comes tight with a click and shines), and
// it stays full for as long as you hold it. Let go full with the aim on it and the arrow goes in, however far off it is (the
// further, the smaller it is to aim at); full but off it, it misses; let go before it is full and it drops into the snow
// short of it. A tap looses nothing: the bow comes up, the string starts back, and it is let down again. Two hits put it
// down (the first drops it all the way into the snow, where it lies about a second before it gets up); with all three
// arrows gone and it still up, it stops watching and comes flat out. It comes fast, and out in the open it keeps breaking
// sideways to a new place by itself (CREATURES.runner.dart). The first shot is the easier one: unhurt it is bold, and with
// the bow drawn on it, it holds its line (no breaking away by itself, a narrower weave) and seldom breaks from the draw
// (12% of draws). The second is the harder: hurt, it is wary, and comes on weaving wide and quick, breaking to one side
// every second or two, and from about every other draw, so the aim has to come after it.
// Over the clearing a few bats fly (CLEARING_BATS, below), and one can be shot: this night's easter egg. What comes
// down is more than a bat (CLEARING_VAMPIRE): it comes for you after the thing, and only the bow, thrown, stops it.
// (The shared draw is drawPress/updateDraw/looseDraw in js/game.js.)
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
    const C = L.bowCol ? Object.assign({}, COL, L.bowCol) : COL;   // (a night may dress the hands on it: L.bowCol, bare hands and its own sleeve)
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
      for (let i = 0; i < 6; i++) { const a = V(elbow, [wrist[0] - elbow[0], wrist[1] - elbow[1]], i / 6), b = V(elbow, [wrist[0] - elbow[0], wrist[1] - elbow[1]], (i + 1) / 6); seg(ctx, a, b, lerp(0.07, 0.042, i / 6), col(C.sleeve)); }
      seg(ctx, V(elbow, [0.3, -0.85], 0.024), V(wrist, [0.3, -0.85], 0.014), 0.01, col(C.sleeveL));
      seg(ctx, V(wrist, [wrist[0] - elbow[0], wrist[1] - elbow[1]], -0.12), V(wrist, [wrist[0] - elbow[0], wrist[1] - elbow[1]], -0.08), 0.05, col(C.sleeveL, 0.8));   // the cuff
    }
    // the limbs, tapering to the tips, which flick outward; light along their backs
    for (const sgn of [-1, 1]) {
      const a = V(rest, W_, sgn * 0.08), b = tipOf(sgn), c = V(V(rest, W_, sgn * 0.34), OUT, 0.05 - 0.025 * pull);
      let prev = a;
      for (let i = 1; i <= 12; i++) {
        const p = bez(a, c, b, i / 12), w = lerp(0.03, 0.012, i / 12);
        seg(ctx, prev, p, w, col(C.wood));
        seg(ctx, V(prev, OUT, w * 0.3), V(p, OUT, w * 0.3), w * 0.3, col(C.woodL));
        prev = p;
      }
      seg(ctx, b, V(V(b, OUT, 0.024), W_, sgn * 0.02), 0.011, col(C.wood));
      seg(ctx, V(b, W_, -sgn * 0.01), V(b, W_, sgn * 0.004), 0.016, col(C.woodD));   // the nock the string is tied at
    }
    // the riser, the leather grip below the shelf and its wraps
    seg(ctx, V(rest, W_, -0.11), V(rest, W_, 0.11), 0.036, col(C.wood));
    seg(ctx, V(V(rest, W_, -0.1), OUT, 0.01), V(V(rest, W_, 0.1), OUT, 0.01), 0.01, col(C.woodL));
    seg(ctx, V(rest, W_, -0.075), V(rest, W_, -0.01), 0.044, col(C.grip));
    // the bow hand round the grip: the glove, the knuckles, the thumb over the front of it
    if (hands) {
      ctx.save(); ctx.translate(...V(V(rest, W_, -0.045), BACK, 0.012)); ctx.rotate(Math.atan2(W_[1], W_[0]));
      ctx.fillStyle = col(C.glove); ctx.beginPath(); ctx.ellipse(0, 0, 0.052, 0.034, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < 3; i++) { ctx.fillStyle = col(C.gloveL); ctx.beginPath(); ctx.ellipse(-0.03 + i * 0.022, 0.024, 0.011, 0.007, 0, 0, TAU); ctx.fill(); }
      ctx.fillStyle = col(C.glove, 1.15); ctx.beginPath(); ctx.ellipse(0.03, -0.018, 0.026, 0.012, -0.4, 0, TAU); ctx.fill();
      ctx.restore();
    }
    // the string, from each tip back to the nock (plucked with nothing on it, it blurs a moment)
    for (const sgn of [1, -1]) seg(ctx, tipOf(sgn), nock, 0.0035 + 0.001 * taut + 0.05 * twitch, col(C.string, 1 + 0.25 * taut), twitch ? 0.6 : 1);
    // drawn full, and for as long as it is held there, the string shines: a bright glint along it the moment it tops out
    // (with the click), settling to a steady pale sheen, so the bow itself says it is full
    if (d && d.state === 'drawing' && d.full) {
      const since = d.t - (d.fill || d.u.draw.fill || FILL), glint = Math.exp(-since * 5);
      for (const sgn of [1, -1]) seg(ctx, tipOf(sgn), nock, 0.008 + 0.006 * glint, rgba(C.stringL, 0.16 + 0.3 * glint));
      for (const sgn of [1, -1]) seg(ctx, tipOf(sgn), nock, 0.0045, rgba(C.stringL));
    }
    // the arrow on the string: nocked while it is drawn or ready; just loosed, the string is bare, then the next is
    // brought up and nocked (if there is one)
    let arrowAt = null;
    if (d && d.state === 'loosed') { if (d.t > 0.3 && G.hasItem('arrows')) arrowAt = 1 - smoothstep((d.t - 0.3) / 0.25); }
    else if (d || G.hasItem('arrows')) arrowAt = 0;
    if (arrowAt !== null) {
      const off = V([0, 0], DIR, -0.35 * arrowAt), t0 = V(nock, off, 1), h0 = V(V(rest, DIR, 0.075 - 0.045 * pull), off, 1);
      for (let i = 0; i < 6; i++) { const a = V(t0, [h0[0] - t0[0], h0[1] - t0[1]], i / 6), b = V(t0, [h0[0] - t0[0], h0[1] - t0[1]], (i + 1) / 6); seg(ctx, a, b, lerp(0.014, 0.007, i / 6), col(C.shaft)); }
      const len = Math.hypot(h0[0] - t0[0], h0[1] - t0[1]), along = k => V(t0, DIR, k * len);
      const vane = (side, c2) => { const p0 = along(0.03), p1 = along(Math.min(0.5, 0.17 / Math.max(len, 0.01))); P_poly(ctx, [p0, p1, V(p1, [-DIR[1] * side, DIR[0] * side], 0.012), V(p0, [-DIR[1] * side, DIR[0] * side], 0.028)], col(c2)); };
      vane(1, C.fA); vane(-1, C.fB);
      P_poly(ctx, [V(h0, DIR, 0.03), V(V(h0, DIR, -0.012), [-DIR[1], DIR[0]], 0.011), V(V(h0, DIR, -0.012), [DIR[1], -DIR[0]], 0.011)], col(C.head));   // the broadhead
      seg(ctx, V(h0, DIR, 0.026), V(h0, DIR, -0.008), 0.003, col(C.headL));
    }
    // no arrow to nock (the button pressed with none left), with the hands shown: the drawing hand comes up to the string,
    // its fingers open, feels up along the shelf where an arrow should lie, twice, finds nothing there and drops away, and
    // the bow is let down
    if (s.groping && !d && hands) {
      const t = s.groping.t, k = smoothstep(clamp((t - 0.06) / 0.2, 0, 1)) * (1 - smoothstep(clamp((t - 0.7) / 0.26, 0, 1)));
      const feel = t > 0.26 && t < 0.7 ? Math.sin((t - 0.26) / 0.44 * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5 : 0;   // two strokes up the shelf and back
      const to = V(nock, DIR, 0.01 + feel * 0.13), from = V(nock, [0.62, 0.78], 0.8), h = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)];
      seg(ctx, V(h, [0.95, 0.3], 0.02), V(h, [0.95, 0.3], 0.6), 0.075, col(C.sleeve));
      ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(Math.atan2(DIR[1], DIR[0]));   // x up the shelf, toward where the arrow's head would be
      ctx.fillStyle = col(C.glove); ctx.beginPath(); ctx.ellipse(-0.014, 0.004, 0.038, 0.031, 0, 0, TAU); ctx.fill();
      const spread = 0.002 + 0.004 * Math.sin(t * 17);   // the two fingers working, finding nothing between them
      for (const [y, len] of [[-0.009 - spread, 0.05], [0.01 + spread, 0.046]]) { seg(ctx, [0.008, y], [len, y * 1.15], 0.019, col(C.glove)); seg(ctx, [0.014, y - 0.004], [len - 0.004, y * 1.15 - 0.004], 0.005, col(C.gloveL, 0.9)); }
      seg(ctx, [-0.006, -0.026], [0.026, -0.036], 0.016, col(C.glove, 1.15));   // the thumb
      for (const y of [-0.012, 0.0, 0.012]) { ctx.fillStyle = col(C.gloveL); ctx.beginPath(); ctx.ellipse(-0.004, y, 0.008, 0.006, 0, 0, TAU); ctx.fill(); }   // the knuckles
      ctx.restore();
    }
    // the drawing hand at the nock while it is drawn, two fingers hooked on the string, its sleeve going off to the right
    // (at full draw the hand is back at your jaw, out of view); loosed, the hand has let go and dropped away
    if (hands && d && (d.state === 'drawing' || d.state === 'easing') && nock[1] < 0.9) {
      const h = V(nock, BACK, 0.022);
      seg(ctx, V(h, [0.95, 0.3], 0.02), V(h, [0.95, 0.3], 0.6), 0.075, col(C.sleeve));
      ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(Math.atan2(BACK[1], BACK[0]));
      ctx.fillStyle = col(C.glove); ctx.beginPath(); ctx.ellipse(0.005, 0, 0.034, 0.026, 0, 0, TAU); ctx.fill();
      for (const k of [-1, 1]) { ctx.fillStyle = col(C.gloveL); ctx.beginPath(); ctx.ellipse(-0.022, k * 0.01, 0.012, 0.007, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }
  // ---- the bow in your hands, frame by frame (what inHands draws from: L.s.bowShow, bowUp, pull, groping) ----
  // held low while you look ahead (ahead: false lowers it out of view), up while it is drawn (or the button is still held
  // for the next); let back down, it comes up a moment and goes down again; loosed, it comes down out of the arrow's way
  const toward = (v, t, k) => v + (t - v) * Math.min(1, k);
  function hold(L, dt, ahead) {
    const s = L.s, d = G.draw;
    s.bowShow = toward(s.bowShow || 0, ahead ? 1 : 0, dt * 7);
    const gr = s.groping;
    if (gr) { gr.t += dt; while (gr.pats < 2 && gr.t >= [0.37, 0.59][gr.pats]) { gr.pats++; AUDIO.sfx('pat', 0.2); } if (gr.t > 1.05 || d || G.state !== 'play') s.groping = null; }   // the fingertips at the empty shelf
    const raised = (!!d && G.state === 'play' && (d.state === 'drawing' || !!G.drawBtn || (d.state === 'easing' && d.t < 0.15))) || (!!s.groping && s.groping.t < 0.78);
    s.bowUp = toward(s.bowUp || 0, raised ? 1 : 0, dt * (raised ? 10 : d ? 8 : 5));
    const pt = !d ? 0 : d.state === 'drawing' ? Math.pow(d.power, 0.75) : d.state === 'easing' ? Math.pow(d.from, 0.75) * (1 - smoothstep(d.t / d.dur)) : 0;
    s.pull = d && d.state === 'loosed' ? 0 : toward(s.pull || 0, pt, dt * 20);
  }
  // the bow pressed with no arrows on you: the hand feels on the string and along the shelf for one (inHands draws it)
  function grope(L) { const s = L.s; if (!s.groping || s.groping.t > 0.6) s.groping = { t: 0, pats: 0 }; }
  // an arrow out in the world, from its nock end to its head (w: drawn thicker, so one standing far off still reads)
  function arrow(tail, head, alpha, w) {
    const u = [head[0] - tail[0], head[1] - tail[1], head[2] - tail[2]], l = Math.hypot(u[0], u[1], u[2]) || 1, k = w || 1;
    const at = j => [tail[0] + u[0] * j / l, tail[1] + u[1] * j / l, tail[2] + u[2] * j / l];
    const o = { kind: 'poly', stroke: true, noContact: true, alpha };
    R.add(Object.assign({ pts: [tail, head], color: [176, 142, 98], lw: 0.018 * k }, o));
    R.add(Object.assign({ pts: [tail, at(0.14)], color: [176, 46, 38], lw: 0.04 * k }, o));          // the fletching, red
    R.add(Object.assign({ pts: [tail, at(0.04)], color: [222, 212, 190], lw: 0.04 * k }, o));        // and pale at the nock end
    if (l > 0.3) R.add(Object.assign({ pts: [at(l - 0.06), head], color: [150, 152, 160], lw: 0.03 * k }, o));   // the head
  }
  return { FILL, MIN, COL, rayAt, inHands, hold, grope, arrow };
})();
// ---- the bats ----
// Three small bats flit about the night sky over the clearing: dark, faint against it, never still, mostly high in the
// view, so they are easy to miss unless you look up from the snow. Each keeps to a part of the sky of its own (one out
// over the steps, one between, one out past the open side, lower, where the porch roof leaves less sky) and wanders it:
// a way round from the eye, a height and a distance, each a sum of slow sines with a quick jitter over it, its wings
// never stopping. They are on a random stream of their own (never L.rand or the thing's: the night's layout and its
// rolls are what they would be without them).
// One can be shot: drawn full and let go with the aim on it (within a ring about twice its wingspan across, wider than it is drawn), in open sky (not behind the porch roof or the cabin), and only when the aim is not on the thing, which always
// comes first. The arrow takes it: it squeaks and tumbles out of the sky with the arrow through it, to lie in the snow.
// With reduced motion they fly at half the pace without the jitter, their wings beat slowly and gently, and one that is
// hit drops without spinning. (One that has come down does not lie there long, and is not drawn once it has turned:
// CLEARING_VAMPIRE, below.)
const CLEARING_BATS = (() => {
  const SPAN = 0.7, PAD = 6, REACH = 1.8, COL = [10, 9, 14], EL = [5 * DEG, 25 * DEG];
  const calm = () => SAVE.data.settings.reducedMotion;
  function make(L) {
    const rnd = mulberry32((G.runSeed * 9973 + 50505) >>> 0), r = (a, b) => a + rnd() * (b - a);
    return [[-25, 12, 17, 4.5], [40, 11, 16, 4], [100, 8, 11, 2.5]].map(([deg, e0, e1, sway]) => {
      const b = {
        a0: (deg + r(-8, 8)) * DEG, e0: r(e0, e1) * DEG, d0: r(21, 30),
        A: [r(18, 26) * DEG, r(0.26, 0.4), r(0, TAU), r(4, 7) * DEG, r(1.1, 1.7), r(0, TAU), r(1.0, 1.6) * DEG, r(4.5, 6.5), r(0, TAU), r(2.3, 3.1)],
        E: [r(0.7, 1.1) * sway * DEG, r(0.33, 0.5), r(0, TAU), r(1.5, 2.5) * DEG, r(1.6, 2.3), r(0, TAU), r(0.6, 1.0) * DEG, r(5, 7), r(0, TAU)],
        D: [r(3, 6), r(0.2, 0.33), r(0, TAU)],
        t: r(0, 60), flap: r(0, TAU), rate: r(46, 58), x: 0, y: 0, z: 0, at: 0, bank: 0, doomed: false, hit: null,
      };
      b.spr = { kind: 'sprite', w: SPAN, h: SPAN, noContact: true, draw: (ctx, P) => draw(ctx, P, b) };
      place(L, b);
      return b;
    });
  }
  // where it is at its own time b.t (b.x, b.y, b.z; b.at its way round from the eye)
  function place(L, b) {
    const t = b.t, A = b.A, E = b.E, D = b.D, j = calm() ? 0 : 1;
    b.at = b.a0 + A[0] * Math.sin(A[1] * t + A[2]) + A[3] * Math.sin(A[4] * t + A[5]) + j * A[6] * Math.sin(A[7] * t + A[8]) * Math.sin(A[9] * t);
    const e = clamp(b.e0 + E[0] * Math.sin(E[1] * t + E[2]) + E[3] * Math.sin(E[4] * t + E[5]) + j * E[6] * Math.sin(E[7] * t + E[8]), EL[0], EL[1]);
    const d = b.d0 + D[0] * Math.sin(D[1] * t + D[2]), yaw = L.facing + b.at;
    b.x = Math.sin(yaw) * d; b.z = Math.cos(yaw) * d; b.y = L.eyeH + d * Math.tan(e);
  }
  function update(L, dt) {
    const slow = calm();
    for (const b of L.s.bats) {
      const h = b.hit;
      if (h) {   // hit: it falls, turning over and over, and lies where it comes down
        if (h.landed) continue;
        h.vy -= 9.8 * dt; const drag = Math.exp(-dt * 1.4);
        h.vx *= drag; h.vz *= drag; h.vy = Math.max(h.vy * Math.exp(-dt * 0.5), -11);
        b.x += h.vx * dt; b.y += h.vy * dt; b.z += h.vz * dt; h.rot += h.spin * dt * (slow ? 0 : 1); h.t += dt;
        if (b.y <= 0.06) { b.y = 0.06; h.landed = true; if (h.land) h.land(b); }
        continue;
      }
      const was = b.at, x = b.x, y = b.y, z = b.z;
      b.t += dt * (slow ? 0.5 : 1);
      place(L, b);
      if (dt > 0) { b.vx = (b.x - x) / dt; b.vy = (b.y - y) / dt; b.vz = (b.z - z) / dt; b.bank += (clamp((b.at - was) / dt * 1.3, -0.55, 0.55) - b.bank) * Math.min(1, dt * 7); }
      b.flap += dt * (slow ? b.rate * 0.22 : b.rate * (0.8 + 0.2 * Math.sin(b.t * 1.9 + b.rate)));   // (its beat quickens and slackens)
    }
  }
  function add(L) {
    for (const b of L.s.bats) { if (b.vamp && b.vamp.ph !== 'lie') continue; const p = b.spr; p.x = b.x; p.y = b.y - SPAN / 2; p.z = b.z; p.dist = Math.hypot(b.x, b.z); R.add(p); }
  }
  // a bat, seen from below and behind as it goes: two wings from the shoulders out to the tips, scalloped along their
  // trailing edge, beating; a small body and head between them. Hit: its wings folded in, the arrow through it.
  function draw(ctx, P, b) {
    const h = b.hit, col = P.col(COL);
    ctx.translate(0, SPAN / 2);
    if (h && h.landed) {   // lying in the snow, a wing out
      P_ell(ctx, 0, -SPAN / 2 + 0.03, 0.09, 0.035, col);
      P_poly(ctx, [[0.03, -SPAN / 2 + 0.04], [0.26, -SPAN / 2 + 0.09], [0.2, -SPAN / 2 + 0.01]], col);
      return;
    }
    ctx.globalAlpha *= h ? 0.95 : 0.8;
    ctx.rotate(h ? h.rot : -b.bank);
    const up = h ? -0.55 + 0.25 * Math.sin(h.t * 23) : Math.sin(b.flap) * (calm() ? 0.5 : 1), reach = h ? 0.6 : 1;
    for (const s of [-1, 1]) {
      P_poly(ctx, [[s * 0.03, 0.035], [s * 0.17 * reach, 0.05 + up * 0.11], [s * (0.35 - 0.08 * up * up) * reach, up * 0.2], [s * 0.22 * reach, -0.03 + up * 0.09], [s * 0.12 * reach, -0.06 + up * 0.03], [s * 0.03, -0.05]], col);
    }
    P_ell(ctx, 0, 0, 0.04, 0.06, col); P_ell(ctx, 0, 0.06, 0.03, 0.03, col);
    if (h) {   // the arrow through it: the shaft, and its fletching
      P_line(ctx, -0.34, -0.12, 0.3, 0.1, 0.022, P.col([176, 142, 98]));
      P_line(ctx, -0.34, -0.12, -0.22, -0.08, 0.05, P.col([176, 46, 38]));
    }
  }
  // is the line from the eye to it open sky? Not under the porch roof (which comes down to 2.95 m at its front edge,
  // 3.4 m out to either side and 1.75 m in front of the eye), nor through the cabin wall behind you
  function clear(L, b) {
    const q = rotY(b.x, b.z, -L.facing), dy = b.y - L.eyeH;   // the porch's own frame: the steps toward +z
    const tx = q[0] ? 3.4 / Math.abs(q[0]) : Infinity, tz = q[1] > 0 ? 1.75 / q[1] : q[1] < 0 ? 1.6 / -q[1] : Infinity, t = Math.min(tx, tz);
    if (t >= 1) return false;                  // (it is never in under the roof)
    if (tz < tx && q[1] < 0) return false;     // out through the wall
    return L.eyeH + dy * t < lerp(2.95, 3.2, clamp((1.75 - q[1] * t) / 3.35, 0, 1)) - 0.05;
  }
  // where it is on the view (page coordinates) and how near the aim must be (REACH times its half span and the
  // padding: a generous ring round it, well wider than it is drawn), or null when it is behind you
  function screen(b) { const p = R.screenPos(b.x, b.y, b.z); return p ? { x: p.x, y: p.y + R.viewY, r: (SPAN * 0.5 * p.scale + PAD) * REACH } : null; }
  // the bat under an aim, if any (the nearest to it)
  function at(L, aim) {
    let best = null, bd = Infinity;
    for (const b of L.s.bats) {
      if (b.hit || b.doomed) continue;
      const p = screen(b); if (!p || !clear(L, b)) continue;
      const d = Math.hypot(aim.x - p.x, aim.y - p.y);
      if (d <= p.r && d < bd) { best = b; bd = d; }
    }
    return best;
  }
  // the arrow reaches it: it is knocked on a little the arrow's way and falls (land(b) is called where it comes down)
  function strike(b, from, land) {
    const dx = b.x - from[0], dz = b.z - from[2], l = Math.hypot(dx, dz) || 1;
    b.hit = { t: 0, vx: (b.vx || 0) * 0.3 + dx / l * 3, vy: Math.min(1, (b.vy || 0) * 0.3 + 0.5), vz: (b.vz || 0) * 0.3 + dz / l * 3, rot: -b.bank, spin: (b.bank >= 0 ? -1 : 1) * 9, landed: false, land };
  }
  return { SPAN, make, update, add, at, clear, screen, strike };
})();
// ---- the vampire ----
// A bat shot out of the sky was not only a bat. It lies in the snow where it came down for half a second (LIE); then a
// puff of dark smoke goes up from it, its wings open wide and stand up into a cape, and a figure rises under them out
// of the snow (TURN): caped, high collared, its face a pale skull of a face, the arrow still in its chest. It comes for the
// porch on a limp: a quick hitch of a step on its good leg, the hurt one buckling under it while it does, then its weight
// thrown down onto the good one and the hurt one dragged up after it, slowly; hunched and twisted over the arrow, a hand
// clutched to it, its head low and pushed out before it, swaying, the other hand reaching for you; every few steps the
// hurt leg all but gives and it pitches, and catches itself; its cape dragging after it, a beat behind; slower as it
// comes. It comes all the way: to the foot of the steps (or round to the side steps, from out past the open side; round
// the railed end, from beyond it), up them and across the boards, and REACH metres from you it rears up, its cape thrown
// wide, and is in your face (LUNGE: a death of its own, text.death.vampire). While the thing is up it hangs back behind
// it (never nearer than BEHIND metres further out than the thing is; there it all but stands, swaying), so the thing is
// always dealt with first and it is the last to come: from where the thing went down, fifteen to twenty seconds of it.
// An arrow in it staggers it (REEL: it is knocked back a step, its cape flaring, and comes on), and that is all it does;
// what ends it is the bow, thrown (the night's, below: bonk). Struck on the head it is knocked down for good (KO, felled).
// Each bat shot gets one (b.vamp: ph 'lie', 'turn', 'walk', 'reel', 'lunge' or 'ko', t the seconds it has been that, x, y
// and z where it is (y the boards or the step under it), way the points of its way still ahead (the porch's own frame),
// g its limp (radians, TAU a step), tw the seconds it has walked, arrows how many are in it, doomed once the bow is on its
// way to it); it is one sprite. With reduced motion it does not lurch, sway or stumble and there is no smoke: it rises,
// comes on hunched at an even hobble, and, struck, simply topples over backward.
const CLEARING_VAMPIRE = (() => {
  const LIE = 0.55, TURN = 1.5, PACE = 2.0, STEP = 5.5, SF = 0.3, REACH = 1.3, BEHIND = 6, REEL = 1.0;
  const LUNGE = { rear: 0.3, dur: 0.45 };   // the death: it rears up over rear seconds, then comes into your face over dur
  // the fall, in seconds from the blow: it reels back on its heels until reel, topples and hits the snow at land (its legs
  // kick up for kick seconds), the cape settles over it by land + settle, and a foot twitches once at twitch
  const KO = { reel: 0.72, land: 1.28, kick: 0.5, settle: 1.0, twitch: 2.9, slowLand: 0.95 };
  const C = { cape: [15, 12, 19], lining: [96, 14, 22], suit: [27, 24, 31], shirt: [150, 146, 152], skin: [214, 210, 204], hollow: [150, 142, 146], socket: [14, 6, 10], hair: [9, 7, 11], blood: [118, 10, 14], gullet: [22, 2, 6], fang: [240, 236, 226], shaft: [176, 142, 98], fletch: [176, 46, 38], nock: [222, 212, 190], smoke: [58, 52, 68] };
  const calm = () => SAVE.data.settings.reducedMotion;
  // how far outside the porch and its steps a place is (the deck, the steps at its front and at its open side)
  function off(L, x, z) { const q = rotY(x, z, -L.facing); return Math.hypot(Math.max(0, Math.abs(q[0] - 0.3) - 3.5), Math.max(0, q[1] > 0.3 ? q[1] - 2.2 : -1.6 - q[1])); }
  // its way to you, in the porch's own frame (the steps toward +z, the open side toward +x, the railed end at -x): to the
  // foot of the front steps and up them, or from out past the open side to the side steps, or round the railed end first
  function route(L, v) {
    const q = rotY(v.x, v.z, -L.facing), way = [];
    if (q[1] < -1.4) way.push([q[0] > 0 ? 4.8 : -4.2, q[1]]);   // (behind the cabin's line: out round its end first)
    if (q[0] > 3.0 && q[1] < 1.9) way.push([4.8, 0]);
    else { if (q[0] < -3.0 && q[1] < 2.8) way.push([-4.2, 3.2]); way.push([0, 3.1]); }
    way.push([0, 0]);
    return way;
  }
  // the bat has come down (CLEARING_BATS.strike's land): it will turn. onTurn is called as it does (the night takes
  // the arrow that stood in the bat out of the snow: it goes up with the figure)
  function rise(b, onTurn) {
    const v = b.vamp = { ph: 'lie', t: 0, x: b.x, y: 0, z: b.z, g: 0, tw: 0, arrows: 1, way: null, doomed: false, onTurn };
    v.spr = { kind: 'sprite', w: 3.4, h: 2.2, y: 0, draw: (ctx, P) => draw(ctx, P, v) };
  }
  // the vampires that are still a danger (up, or about to be: not knocked down)
  const live = L => L.s.bats.filter(b => b.vamp && b.vamp.ph !== 'ko').map(b => b.vamp);
  // its body on the view (page coordinates), as creatureBox has the thing's: what an arrow or a click must be on
  function box(v) {
    const r = R.projectRect(v.x, v.y, v.z, 3.4, 2.2); if (!r) return null;
    const x0 = r.x + r.w * (0.5 - 0.4 / 3.4), x1 = r.x + r.w * (0.5 + 0.4 / 3.4), y0 = r.y + r.h * (1 - 1.75 / 2.2);
    return { x: x0, y: y0 + R.viewY, w: x1 - x0, h: r.y + r.h - y0 };
  }
  // an arrow in it: it is knocked back a step, staggers, and comes on (another arrow shows in it)
  function struck(v) { if (v.ph !== 'walk' && v.ph !== 'reel') return; v.ph = 'reel'; v.t = 0; v.arrows++; AUDIO.sfx('hiss', clamp(Math.sin(wrapPi(Math.atan2(v.x, v.z) - G.cam.yaw)), -0.85, 0.85)); }
  // the bow lands on its head: down it goes, for good
  function bonk(v) { v.ph = 'ko'; v.t = 0; v.thud = false; v.twitched = false; }
  const landAt = () => (calm() ? KO.slowLand : KO.land);
  const down = v => v.ph === 'ko' && v.t >= landAt();
  // every few steps the hurt leg all but goes (0 to 1)
  const stumble = v => (calm() ? 0 : Math.pow(Math.max(0, Math.sin(v.tw * 1.7 + 0.6)), 10));
  // The limp, through one step of it (p, 0 to 1): over the first SF of it the good leg (its right: your left) hitches a
  // quick step on while the hurt one takes its weight and buckles; then the good foot is down, the weight thrown onto it,
  // and the rest of the step is the hurt leg dragged up after it. go: how fast it comes at p (1 over a whole step);
  // weight: where its weight is (1 over the good leg, below 0 over the hurt one)
  const go = p => (p < SF ? 0.55 + 2.35 * Math.sin(Math.PI * p / SF) : 0.55);
  const weight = p => { p -= Math.floor(p); const s = p / SF; return p < SF ? lerp(0.3, 1, smoothstep(s)) - 0.95 * Math.sin(Math.PI * s) : lerp(1, 0.3, smoothstep((p - SF) / (1 - SF))); };
  // near: the nearest it may come for now (the thing's distance and BEHIND while the thing is up, else 0); onReach(v) as
  // it gets to you (the night's death: from then on the death's own pose runs it, lunge)
  function update(L, dt, near, onReach) {
    for (const b of L.s.bats) {
      const v = b.vamp; if (!v || v.ph === 'lunge') continue;
      v.t += dt;
      const pan = clamp(Math.sin(wrapPi(Math.atan2(v.x, v.z) - G.cam.yaw)), -0.85, 0.85), next = ph => { v.ph = ph; v.t = 0; };
      const q = rotY(v.x, v.z, -L.facing);
      v.y += ((L.s.standOn ? L.s.standOn(q[0], q[1]) : 0) - v.y) * Math.min(1, dt * 12);   // up onto the step and the boards
      if (v.ph === 'lie') { if (v.t >= LIE) { next('turn'); if (v.onTurn) v.onTurn(); AUDIO.sfx('hiss', pan); } }
      else if (v.ph === 'turn') { if (v.t >= TURN) { next('walk'); v.way = route(L, v); } }
      else if (v.ph === 'reel') { if (v.t < 0.25) { const d = Math.hypot(v.x, v.z) || 1; v.x += v.x / d * dt * 1.6; v.z += v.z / d * dt * 1.6; } if (v.t >= REEL) next('walk'); }   // knocked back a step
      else if (v.ph === 'ko') {
        if (!v.thud && v.t >= landAt()) { v.thud = true; AUDIO.sfx('bodyDrop', pan); if (!calm()) G.shake(0.06); }   // full length in the snow
        if (!v.twitched && v.t >= KO.twitch && !calm()) { v.twitched = true; AUDIO.sfx('flop', pan); }
      }
      if (v.ph !== 'walk') continue;
      const d = Math.hypot(v.x, v.z) || 1, slow = calm();
      if (d <= REACH + 1e-3 && !v.doomed) { next('lunge'); onReach(v); continue; }
      // a lurch on at each step, then the drag; weaker as it comes (and all but stopped as it stumbles); held back behind
      // the thing, it all but stands where it is, its limp gone slow
      const hold = clamp((d - near) / 3, 0, 1), beat = Math.max(0.2, hold);
      v.tw += dt * beat; v.g += dt * STEP * (slow ? 0.6 : 1) * beat;
      const weak = clamp(1 - v.tw * 0.012, 0.7, 1), pace = PACE * weak * (slow ? 0.75 : go((v.g / TAU) % 1)) * (1 - 0.7 * stumble(v)) * hold;
      // on along its way: the next point of it, passed once it is there
      let w = v.way[0];
      if (v.way.length > 1 && Math.hypot(q[0] - w[0], q[1] - w[1]) < 0.3) { v.way.shift(); w = v.way[0]; }
      const g = rotY(w[0], w[1], L.facing), gx = g[0] - v.x, gz = g[1] - v.z, gl = Math.hypot(gx, gz) || 1;
      const step = Math.min(pace * dt, v.way.length > 1 ? gl : Math.max(0, gl - REACH));
      v.x += gx / gl * step; v.z += gz / gl * step;
    }
  }
  function add(L) {
    for (const b of L.s.bats) {
      const v = b.vamp; if (!v || v.ph === 'lie') continue;
      // in the lunge it comes from where it reached you to right in front of your eyes, its face up level with them
      const k = v.ph === 'lunge' ? easeIn(clamp((v.t - LUNGE.rear) / LUNGE.dur, 0, 1)) : 0, f = lerp(1, 0.42 / REACH, k);
      const p = v.spr; p.x = v.x * f; p.y = v.y + 0.12 * k; p.z = v.z * f; p.dist = Math.hypot(p.x, p.z); R.add(p);
    }
  }
  // The figure, seen from in front (it comes toward you), its feet at (0, 0). o.wings: its cape thrown wide, as wings
  // (0 hanging to 1); o.kneel: down on its knees (0 to 1); o.hunch: bent over its wound (0 to 1); o.reach: the free arm
  // out before it (0 to 1); o.limp, walking: { p: through a step, sm: stumbling, t: seconds walked, k: how much of it
  // shows }; o.open: how wide its mouth is, if not the limp's; o.arrows: how many are in it (a second low on its other
  // side). The arrow is in its chest on its left (your right), and that side's hand is clutched to it; that side's leg
  // is the hurt one. Its body above the hips leans as a piece (lean: toward your left), its legs and the hem of its cape
  // do not; the cape's hem follows the body a beat late. Strong shapes: it is seen from thirty metres to ten.
  function figure(ctx, P, o) {
    const cape = P.col(C.cape), lining = P.col(C.lining), suit = P.col(C.suit), skin = P.col(C.skin), hair = P.col(C.hair);
    const kn = o.kneel, wg = o.wings, hu = o.hunch || 0, lm = o.limp, k = lm ? lm.k : 0, t = lm ? lm.t : 0, sm = lm ? lm.sm : 0;
    const p = lm ? lm.p : 0, s = p < SF ? p / SF : 1, d = p < SF ? 0 : (p - SF) / (1 - SF);
    const w = lm ? weight(p) * k : 0, wl = lm ? weight(p - 0.17) * k : 0;          // its weight, and where it was a beat ago (the cape)
    const lift = p < SF ? Math.sin(Math.PI * s) * k : 0;                           // the good foot up off the snow
    const buckle = (p < SF ? Math.sin(Math.PI * s) * k : 0) + sm;                   // the hurt knee giving
    const back = (p < SF ? smoothstep(s) : 1 - smoothstep(d)) * k;                  // the hurt foot left behind it, then dragged up
    const hipY = lerp(0.92, 0.42, kn) - (0.07 * hu + 0.08 * buckle + (p >= SF ? 0.05 * Math.sin(Math.PI * clamp(d / 0.22, 0, 1)) * k : 0)) * (1 - kn);
    const hx = -0.1 * w * (1 - kn), lean = (0.15 * w - 0.15 * hu - 0.2 * sm) * (1 - kn) - 0.05 * kn, cl = Math.cos(lean), sl = Math.sin(lean);
    const tf = (x, h) => [hx + x * cl - h * sl, hipY + x * sl + h * cl];            // a point of its upper body (x across, h up from its hips)
    const shH = 0.52 - 0.1 * hu, headH = shH + 0.24 - 0.11 * hu - 0.05 * sm, shY = hipY + shH;
    const hw = lerp(0.5 + 0.05 * hu, 1.25, wg) + 0.22 * kn, sw = lerp(0.3, 0.85, wg), hemY = lerp(0.16, hipY + 0.05, wg) * (1 - 0.6 * kn);
    const trail = (-0.2 * wl + 0.03 * Math.sin(t * 3.3) * k) * (1 - kn);         // the hem, a beat behind the body
    // the cape behind it, from the points of its collar down to a scalloped hem that flutters as it drags
    const back0 = [tf(-0.2, headH + 0.14), tf(-sw, shH + 0.02), [-hw + trail, hemY + 0.14]];
    for (let i = 1; i < 6; i++) back0.push([lerp(-hw, hw, i / 6) + trail * (1 + 0.3 * Math.sin(i)), hemY + (i % 2 ? 0 : 0.1) + 0.03 * Math.sin(t * 4.1 + i * 1.7) * k]);
    back0.push([hw + trail, hemY + 0.14], tf(sw, shH + 0.02), tf(0.2, headH + 0.14));
    P_poly(ctx, back0, cape);
    for (const sd of [-1, 1]) P_poly(ctx, [tf(sd * 0.18, shH - 0.02), tf(sd * sw * 0.72, shH - 0.06), [sd * hw * 0.64 + trail * 1.2, hemY + 0.17], [sd * 0.17 + trail, hemY + 0.2]], lining);   // its lining, either side of the body
    // the legs. Kneeling, the thighs down to the knees in the snow. Walking: the good one (your left) stepping, its knee
    // coming up; the hurt one (your right) stiff, its foot turned in, its knee caving in when the weight is on it; left
    // behind, and then dragged up after it, swung out round the side, the hip hitched up to swing it
    const swing = p >= SF ? Math.sin(Math.PI * d) * k : 0;
    for (const sd of [-1, 1]) {
      const hip = [hx + sd * 0.1, hipY - (sd > 0 ? 0.03 * buckle - 0.04 * swing : 0.02 * w)];
      if (kn > 0.5) { P_limb(ctx, [hip, [sd * 0.17, 0.07]], 0.14, suit); continue; }
      if (sd < 0) {
        const ft = [-0.15 - 0.03 * lift, 0.04 + 0.16 * lift], kx = [-0.18 - 0.05 * lift, (hip[1] + ft[1]) / 2 + 0.1 * lift];
        P_limb(ctx, [hip, kx, ft], 0.13, suit); P_ell(ctx, ft[0], ft[1], 0.08, 0.04, hair);
      } else {
        const ft = [0.15 + 0.03 * back + 0.11 * swing, 0.04 + 0.05 * back + 0.03 * swing], kx = [0.14 - 0.07 * buckle + 0.05 * swing, (hip[1] + ft[1]) / 2 - 0.03 * buckle];
        P_limb(ctx, [hip, kx, ft], 0.13, suit); P_ell(ctx, ft[0] - 0.01, ft[1], 0.08 * (1 - 0.15 * back), 0.035, hair, -0.35);
      }
    }
    // the body: a dark coat, a little of the shirt at the throat, twisted down over the wound (that shoulder lower, drawn in)
    const shL = tf(-0.21, shH + 0.02 * hu), shR = tf(0.21 - 0.04 * hu, shH - 0.08 * hu);
    P_poly(ctx, [shL, shR, tf(0.15, -0.04), tf(-0.15, -0.04)], suit);
    P_poly(ctx, [tf(-0.06, shH), tf(0.05, shH - 0.02 * hu), tf(0, shH - 0.2)], P.col(C.shirt));
    // the collar, standing up behind the head
    for (const sd of [-1, 1]) { const dy = sd > 0 ? -0.06 * hu : 0; P_poly(ctx, [tf(sd * 0.06, shH - 0.02 + dy), tf(sd * 0.27, headH + 0.17 + dy), tf(sd * 0.25, shH - 0.03 + dy)], cape); P_poly(ctx, [tf(sd * 0.09, shH + dy), tf(sd * 0.23, headH + 0.1 + dy), tf(sd * 0.21, shH + dy)], lining); }
    // the free arm (your left): out toward you as it comes, the clawed hand groping, low and wide as it stumbles; or thrown
    // wide with the cape
    const r = o.reach * (1 - 0.6 * sm), gx = 0.03 * Math.sin(t * 1.3) * k;
    const ew = tf(-0.38 - 0.05 * sm, shH - 0.3 - 0.06 * sm), hwk = tf(-0.25 - 0.12 * (1 - r) - 0.12 * sm + gx, shH - 0.32 + 0.1 * r - 0.18 * sm);
    const eb = [lerp(ew[0], -0.52, wg), lerp(ew[1], hipY + 0.56, wg)], hb = [lerp(hwk[0], -0.86, wg), lerp(hwk[1], hipY + 0.68, wg)];
    P_limb(ctx, [shL, eb, hb], 0.09, suit);
    const hs = 1 + 0.25 * r * (1 - wg);   // (reaching at you, it is nearer, and bigger)
    for (let i = 0; i < 4; i++) { const a = -0.5 - i * 0.55 + 0.15 * Math.sin(t * 2.3 + i) * k, l = 0.1 * hs, e = [hb[0] + Math.cos(a) * l, hb[1] + Math.sin(a) * l]; P_limb(ctx, [hb, e, [e[0] + Math.cos(a + 0.9) * 0.035 * hs, e[1] + Math.sin(a + 0.9) * 0.035 * hs]], 0.022, skin); }   // its fingers, hooked
    P_ell(ctx, hb[0], hb[1], 0.05 * hs, 0.055 * hs, skin);
    // the arrow in its chest: the shaft out toward you and down, its fletching at the end of it; the blood round it, and
    // run down its coat
    const wd = tf(0.09, shH - 0.22), ar = tf(0.35, shH - 0.42), blood = P.col(C.blood);
    P_poly(ctx, [tf(0.04, shH - 0.2), tf(0.14, shH - 0.2), tf(0.12, 0.05), tf(0.07, 0.1)], blood);
    P_ell(ctx, wd[0], wd[1] - 0.03, 0.06, 0.08, blood);
    P_line(ctx, wd[0], wd[1], ar[0], ar[1], 0.024, P.col(C.shaft));
    P_line(ctx, lerp(wd[0], ar[0], 0.62), lerp(wd[1], ar[1], 0.62), ar[0], ar[1], 0.055, P.col(C.fletch)); P_line(ctx, lerp(wd[0], ar[0], 0.93), lerp(wd[1], ar[1], 0.93), ar[0], ar[1], 0.055, P.col(C.nock));
    if (o.arrows > 1) {   // shot again: another in it, low on its other side, standing out toward your left
      const w2 = tf(-0.08, shH - 0.3), a2 = tf(-0.4, shH - 0.44);
      P_ell(ctx, w2[0], w2[1] - 0.02, 0.05, 0.06, blood); P_line(ctx, w2[0], w2[1], a2[0], a2[1], 0.024, P.col(C.shaft));
      P_line(ctx, lerp(w2[0], a2[0], 0.62), lerp(w2[1], a2[1], 0.62), a2[0], a2[1], 0.055, P.col(C.fletch));
    }
    // the arm on that side: tucked in, the hand clutched to the wound round the shaft (thrown wide as it turns)
    const ec = tf(0.3, shH - 0.3 - 0.04 * hu), hc = tf(0.13, shH - 0.2);
    const ea = [lerp(ec[0], 0.52, wg), lerp(ec[1], hipY + 0.56, wg)], ha = [lerp(hc[0], 0.86, wg), lerp(hc[1], hipY + 0.68, wg)];
    P_limb(ctx, [shR, ea, ha], 0.09, suit); P_ell(ctx, ha[0], ha[1], 0.055, 0.06, skin);
    for (let i = 0; i < 3; i++) P_line(ctx, ha[0] - 0.01, ha[1] + 0.03 - i * 0.03, ha[0] - 0.07 * (1 - wg), ha[1] + 0.02 - i * 0.035, 0.022, skin);   // its fingers, dug in
    // the head: low, pushed out before it between the hunched shoulders (bigger: nearer you), swaying slowly, hung over
    // toward the wound
    const hp = tf(0.04 * hu + 0.06 * Math.sin(t * 1.1) * k - 0.03 * kn, headH), roll = -0.14 * hu + 0.18 * Math.sin(t * 1.1 - 0.9) * k + 0.12 * sm;
    ctx.save(); ctx.translate(hp[0], hp[1]); ctx.rotate(roll + lean); const sc = 1 + 0.1 * hu; ctx.scale(sc, sc);
    head(ctx, P, skin, hair, o.open !== undefined ? o.open : lm ? 0.75 + 0.25 * Math.sin(t * 2.4) * k : 0.8);
    ctx.restore();
  }
  // its face (at its middle, 0, 0): gaunt and pale, the skull showing; the eyes sunk in black sockets under a heavy
  // scowling brow, with a small red light in each; hollow cheeks; the mouth wide open on a black gullet, long fangs
  // hanging in it and blood run from it down its chin. open: how wide its mouth is (0 to 1; past 1 for the lunge)
  function head(ctx, P, skin, hair, open) {
    const dark = P.col(C.socket);
    P_ell(ctx, 0, 0.025, 0.105, 0.115, skin);
    P_poly(ctx, [[-0.1, 0.01], [-0.08, -0.08], [-0.035, -0.155], [0.035, -0.155], [0.08, -0.08], [0.1, 0.01]], skin);   // the long jaw
    for (const sd of [-1, 1]) P_poly(ctx, [[sd * 0.04, -0.03], [sd * 0.082, -0.02], [sd * 0.07, -0.1], [sd * 0.05, -0.125]], P.col(C.hollow));   // hollow cheeks, under the cheekbones
    P_poly(ctx, [[-0.11, 0.035], [-0.095, 0.13], [0, 0.155], [0.095, 0.13], [0.11, 0.035], [0.06, 0.105], [0, 0.06], [-0.06, 0.105]], hair);   // the hair, to a point on the brow
    for (const sd of [-1, 1]) P_ell(ctx, sd * 0.043, -0.004, 0.036, 0.03, dark, sd * 0.25);                               // the sockets
    P_poly(ctx, [[-0.105, 0.06], [-0.105, 0.03], [-0.014, 0.004], [0, 0.012], [0.014, 0.004], [0.105, 0.03], [0.105, 0.06]], skin);   // the brow, low over them
    P_poly(ctx, [[-0.09, 0.03], [-0.014, 0.004], [-0.014, -0.006], [-0.09, 0.016]], dark); P_poly(ctx, [[0.09, 0.03], [0.014, 0.004], [0.014, -0.006], [0.09, 0.016]], dark);
    for (const sd of [-1, 1]) { P_ell(ctx, sd * 0.04, -0.008, 0.02, 0.016, rgba([255, 40, 24], 0.4)); P_ell(ctx, sd * 0.04, -0.008, 0.009, 0.009, rgba([255, 72, 44], 1)); }   // the eyes, lit red
    P_poly(ctx, [[0, -0.02], [-0.014, -0.05], [0.014, -0.05]], dark);   // the nose, a slit
    // the mouth, wide open: red lips round a black gullet, the long fangs hanging in it
    const my = -0.1, mh = 0.026 + 0.022 * open;
    P_ell(ctx, 0, my, 0.05, mh + 0.008, P.col(C.blood)); P_ell(ctx, 0, my - 0.003, 0.04, mh, P.col(C.gullet));
    for (const sd of [-1, 1]) P_poly(ctx, [[sd * 0.014, my + mh - 0.002], [sd * 0.036, my + mh - 0.006], [sd * 0.024, my + mh - 0.07]], P.col(C.fang));
    P_line(ctx, 0.03, my - mh, 0.034, -0.17, 0.014, P.col(C.blood)); P_ell(ctx, 0.034, -0.175, 0.01, 0.012, P.col(C.blood));   // and blood down the chin
  }
  function draw(ctx, P, v) {
    const slow = calm();
    if (v.ph === 'turn') {
      const k = v.t / TURN, up = easeOut((k - 0.1) / 0.72);
      // the smoke: a few dark puffs going up and out from where the bat lay, thinning
      if (!slow) for (let i = 0; i < 7; i++) {
        const u = clamp(k * 1.5 - i * 0.05, 0, 1), a = 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - 0.5 * u), ang = i * 2.4;
        if (a > 0.01) P_ell(ctx, Math.cos(ang) * (0.12 + 0.55 * u), 0.15 + (0.3 + 0.2 * (i % 3)) * u * 2.2 + Math.sin(ang) * 0.1, 0.16 + 0.34 * u, 0.14 + 0.28 * u, P.cola(C.smoke, a));
      }
      // the wings open and stand up into the cape, the figure rising under them; and it bends over the wound
      ctx.save(); ctx.scale(lerp(0.3, 1, smoothstep(k / 0.5)), lerp(0.06, 1, up));
      figure(ctx, P, { wings: smoothstep(k / 0.3) * (1 - smoothstep((k - 0.52) / 0.44)), kneel: 0, hunch: smoothstep((k - 0.6) / 0.4), reach: 0.6 * smoothstep((k - 0.7) / 0.3) });
      ctx.restore();
      return;
    }
    if (v.ph === 'walk') {
      const sm = stumble(v), k = slow ? 0 : 1;
      ctx.translate(0, -0.06 * sm);   // (pitching down onto the hurt leg)
      figure(ctx, P, { wings: 0, kneel: 0, hunch: 1, reach: 0.6 + 0.4 * Math.sin(v.tw * 0.9) * k, limp: { p: (v.g / TAU) % 1, sm, t: v.tw, k: slow ? 0.25 : 1 }, arrows: v.arrows });
      return;
    }
    if (v.ph === 'reel') {   // an arrow in it: it is jolted upright, its cape flaring and its mouth gaping, and doubles over again
      const j = (v.t < 0.08 ? v.t / 0.08 : 1 - smoothstep((v.t - 0.08) / (REEL - 0.08))) * (slow ? 0.5 : 1);
      figure(ctx, P, { wings: 0.45 * j, kneel: 0, hunch: 1 - 0.7 * j, reach: 0.6 - 0.4 * j, open: 0.8 + 0.6 * j, arrows: v.arrows });
      return;
    }
    if (v.ph === 'lunge') {   // it rears up, straightening, its cape thrown wide and its mouth gaping, and comes at your face (add)
      const r = smoothstep(clamp(v.t / LUNGE.rear, 0, 1));
      figure(ctx, P, { wings: r, kneel: 0, hunch: 1 - r, reach: 1, open: 1 + 0.7 * r, arrows: v.arrows });
      return;
    }
    felled(ctx, P, v);
  }
  // ---- knocked down: the bow on its forehead, and the fall ----
  // Its pose is worked out in the round and seen from in front and a little from above (E: how far up the view a point a
  // metre further off comes), so it is a body going over, joints and all, not the standing figure turned on its side: x
  // across (your right), h up, d away from you. Its points are given upright, its heels at the origin, and tipped over by
  // phi about the line across its heels (tilt), back and a little to your left (FX, FD). Through the fall (u, the seconds
  // since the bow hit): its head snaps back and both arms fly up; it reels back two steps on its heels, rocking; it goes
  // over backward stiff as a felled tree, slowly and then all at once, its arms flung wide and its cape billowing up off
  // it; it hits the snow full length (KO.land) with a bounce, its legs kicking up once and dropping; its cape settles over
  // it; it lies still with the arrow standing up out of it, and once (KO.twitch) a foot twitches. The bow comes off its
  // head, spinning, and drops in the snow in front of it. With reduced motion it simply goes over backward, arms out.
  const E = 0.16, FX = Math.sin(-0.5), FD = Math.cos(-0.5);
  function tilt(p, phi) {
    const a = p[0] * FX + p[2] * FD, b = p[0] * FD - p[2] * FX, c = Math.cos(phi), s = Math.sin(phi), a2 = a * c + p[1] * s;
    return [a2 * FX + b * FD, p[1] * c - a * s, a2 * FD - b * FX];
  }
  // the arms: hanging at it as it came (the left reaching, the right clutched to the arrow), flung up, flung wide
  const ARMS = { rest: [[[-0.4, 1.12, -0.12], [-0.32, 1.12, -0.32]], [[0.32, 1.12, 0], [0.14, 1.24, -0.12]]],
    up: [[[-0.36, 1.74, -0.04], [-0.5, 2.02, 0.02]], [[0.36, 1.74, -0.04], [0.5, 2.02, 0.02]]],
    out: [[[-0.5, 1.44, 0.04], [-0.95, 1.4, 0.06]], [[0.5, 1.44, 0.04], [0.92, 1.5, 0.06]]] };
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  function felled(ctx, P, v) {
    const u = v.t, slow = calm(), land = landAt(), H = Math.PI / 2;
    const cape = P.col(C.cape), lining = P.col(C.lining), suit = P.col(C.suit), skin = P.col(C.skin), hair = P.col(C.hair), blood = P.col(C.blood);
    // phi: how far over it is; px, pd: where its heels are; hp: its head thrown back; a1, a2: its arms flung up, then
    // wide; kick: its legs kicked up (radians at the hip); bil: its cape billowing up; st: settled over it; feet: its
    // two steps back, world points (null once it is going over: its feet are where its heels are)
    let phi, px = 0, pd = 0, hp, a1, a2, kick = 0, bil = 0, feet = null, twitch = 0;
    const st = smoothstep((u - land - (slow ? 0 : 0.15)) / KO.settle);
    if (slow) {
      const k = clamp(u / land, 0, 1);
      phi = 0.1 + (H - 0.1) * k * k; hp = 0.3 * k; a1 = 0; a2 = smoothstep(k);
    } else {
      const sL = smoothstep((u - 0.08) / 0.28), sR = smoothstep((u - 0.36) / 0.3), r = (sL + sR) / 2;
      px = -0.12 * r; pd = 0.5 * r;
      if (u < KO.reel) feet = [[-0.1 - 0.12 * sL, 0.09 * Math.sin(Math.PI * sL), 0.5 * sL], [0.1 - 0.12 * sR, 0.09 * Math.sin(Math.PI * sR), 0.5 * sR]];
      hp = lerp(-0.35, 0.95, smoothstep(u / 0.07)) - 0.5 * smoothstep((u - 0.07) / 0.6);
      if (u < KO.reel) phi = lerp(-0.3, 0.1, smoothstep(u / 0.09)) + 0.18 * r + 0.05 * Math.sin(u * 18) * (1 - r);   // rocking back on its heels
      else if (u < land) { const k = (u - KO.reel) / (land - KO.reel); phi = 0.28 + (H - 0.28) * k * k; }   // over, slowly and then all at once
      else { const e = u - land; phi = H - 0.09 * Math.abs(Math.sin(e * 16)) * Math.exp(-e * 7); }       // a bounce, and it lies
      a1 = smoothstep(u / 0.1); a2 = smoothstep((u - 0.5) / (land - 0.5));
      kick = u > land ? 1.15 * Math.sin(Math.PI * clamp((u - land) / KO.kick, 0, 1)) : 0;
      bil = Math.sin(Math.PI * clamp((u - 0.45) / land, 0, 1));
      if (u > KO.twitch) twitch = Math.exp(-(u - KO.twitch) * 5) * Math.sin((u - KO.twitch) * 30);
    }
    const lift = 0.09 * Math.pow(Math.sin(clamp(phi, 0, H)), 4);   // (lying, it is its own thickness off the snow)
    const W = p => { const w = tilt(p, phi); return [w[0] + px, w[1] + lift, w[2] + pd]; };
    const S = w => [w[0], w[1] + w[2] * E], at = p => S(W(p));
    // the cape behind it, from its collar down to the scalloped hem: billowing up and out as it goes over, then down on the snow round it
    const back = [at([-0.2, 1.82, 0.06]), at([-0.32, 1.42, 0.1])];
    for (let i = 0; i <= 6; i++) {
      const x = lerp(-0.55, 0.55, i / 6), w = W([x, 0.16 + (i % 2 ? 0 : 0.08), 0.18]);
      w[0] += x * 0.45 * bil; w[1] += 0.7 * bil * (0.6 + 0.4 * Math.abs(x) / 0.55); w[1] = Math.max(0.02, lerp(w[1], 0.03, st));
      back.push(S(w));
    }
    back.push(at([0.32, 1.42, 0.1]), at([0.2, 1.82, 0.06]));
    P_poly(ctx, back, cape);
    P_poly(ctx, [at([-0.18, 1.38, 0.02]), at([0.18, 1.38, 0.02]), at([0.3, 0.5, 0.12]), at([-0.3, 0.5, 0.12])], lining);
    // the body, the shirt at the throat, the collar standing up behind its head
    P_poly(ctx, [at([-0.22, 1.42, 0]), at([0.22, 1.42, 0]), at([0.16, 0.86, 0]), at([-0.16, 0.86, 0])], suit);
    P_poly(ctx, [at([-0.06, 1.44, -0.02]), at([0.05, 1.42, -0.02]), at([0, 1.22, -0.03])], P.col(C.shirt));
    for (const sd of [-1, 1]) { P_poly(ctx, [at([sd * 0.06, 1.42, 0.02]), at([sd * 0.27, 1.86, 0.06]), at([sd * 0.25, 1.41, 0.04])], cape); P_poly(ctx, [at([sd * 0.09, 1.44, 0.02]), at([sd * 0.23, 1.79, 0.05]), at([sd * 0.21, 1.44, 0.03])], lining); }
    // the legs: stepping back on its heels, then stiff as it goes over, then kicked up off the snow once (at the hips,
    // toward you: lying on its back, up), and down
    for (const sd of [-1, 1]) {
      const hip = [sd * 0.1, 0.92, 0], hw = W(hip);
      let kw, fw, ang = 0;
      if (feet) { fw = feet[sd < 0 ? 0 : 1]; kw = [(hw[0] + fw[0]) / 2 + sd * 0.02, (hw[1] + fw[1]) / 2 + 0.02, (hw[2] + fw[2]) / 2 - 0.08]; }
      else {
        const kk = kick * (sd < 0 ? 1 : 0.8), kn = [hip[0], 0.92 - 0.46 * Math.cos(0.8 * kk), -0.46 * Math.sin(0.8 * kk)];
        kw = W(kn); fw = W([hip[0], kn[1] - 0.46 * Math.cos(1.25 * kk), kn[2] - 0.46 * Math.sin(1.25 * kk)]);
        ang = sd > 0 ? 0.7 * twitch : 0;
      }
      const h2 = S(hw), k2 = S(kw), f2 = S(fw), sole = feet ? 0 : clamp(kick, 0, 1);
      P_limb(ctx, [h2, k2, f2], 0.13, suit);
      P_ell(ctx, f2[0] + sd * 0.02, f2[1], 0.08 - 0.02 * sole, 0.04 + 0.04 * sole, hair, ang - sd * 0.2);   // its shoes (the soles toward you, kicked up)
    }
    // the arms, flung up at the blow and wide as it goes over (lying spread on the snow), the hands open, fingers splayed
    for (const sd of [0, 1]) {
      const sh = at([sd ? 0.21 : -0.21, 1.4, 0]), A = ARMS.rest[sd], B = ARMS.up[sd], O = ARMS.out[sd];
      const el = at(mix(mix(A[0], B[0], a1), O[0], a2)), hd = at(mix(mix(A[1], B[1], a1), O[1], a2));
      P_limb(ctx, [sh, el, hd], 0.09, suit);
      const dir = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
      for (let i = 0; i < 4; i++) { const a = dir + (i - 1.5) * 0.45 * Math.max(a1, a2), e = [hd[0] + Math.cos(a) * 0.11, hd[1] + Math.sin(a) * 0.11]; P_line(ctx, hd[0], hd[1], e[0], e[1], 0.022, skin); }
      P_ell(ctx, hd[0], hd[1], 0.05, 0.055, skin);
    }
    // the head on its neck, thrown back (seen more and more from under the jaw, and lying, from above its brow)
    const nk = at([0, 1.47, 0]), hc = at([0, 1.47 + 0.19 * Math.cos(hp), 0.19 * Math.sin(hp)]);
    ctx.save(); ctx.translate(hc[0], hc[1]); ctx.rotate(Math.atan2(-(hc[0] - nk[0]), hc[1] - nk[1]));
    ctx.scale(1.05, 1.05 * clamp(Math.cos(clamp(phi, 0, H) + Math.max(0, hp)), 0.3, 1));
    head(ctx, P, skin, hair, slow ? 0.8 : lerp(0.8, 1.5, smoothstep(u / 0.08)) - 0.5 * smoothstep((u - 0.3) / 0.8));
    ctx.restore();
    // the arrow (or arrows) in its chest, standing up out of it once it is down
    const arrowIn = (w0, w1) => {
      const a = at(w0), b = at(w1);
      P_ell(ctx, a[0], a[1], 0.055, 0.06, blood); P_line(ctx, a[0], a[1], b[0], b[1], 0.024, P.col(C.shaft));
      P_line(ctx, lerp(a[0], b[0], 0.62), lerp(a[1], b[1], 0.62), b[0], b[1], 0.055, P.col(C.fletch)); P_line(ctx, lerp(a[0], b[0], 0.93), lerp(a[1], b[1], 0.93), b[0], b[1], 0.055, P.col(C.nock));
    };
    arrowIn([0.09, 1.22, -0.1], [0.36, 1.02, -0.62]);
    if (v.arrows > 1) arrowIn([-0.08, 1.1, -0.1], [-0.4, 0.98, -0.56]);
    // the cape settling over it: in from its side, over its legs and up to its waist
    if (st > 0.01) {
      const hs = [1.3, 0.95, 0.55, 0.15], cov = [0.3, 0.85, 1, 0.9], A = hs.map(h => W([0.45, h, 0.12])), B = hs.map(h => W([-0.18, h, -0.14]));
      const edge = A.map((a, i) => mix(a, B[i], st * cov[i])).reverse(), pts = A.concat(edge).map(w => S([w[0], Math.max(0.02, w[1]), w[2]]));
      P_poly(ctx, pts, cape);
    }
    // the bow, off its head: spinning up and away, and down in the snow in front of it
    const bt = Math.min(u, 0.93), by = Math.max(0.04, 1.62 + 3.0 * bt - 4.9 * bt * bt), bp = S([0.05 + 0.9 * bt, by, -0.15 - 1.2 * bt]);
    const flat = smoothstep((u - 0.85) / 0.12);   // (down, it lies flat on the snow, seen from a little above)
    ctx.save(); ctx.translate(bp[0], bp[1]); ctx.scale(1, 1 - 0.5 * flat); ctx.rotate(lerp(slow ? 0.3 + 1.2 * clamp(u / 0.93, 0, 1) : -13 * bt, -Math.PI / 2 - 0.2, flat));
    ctx.translate(0, -0.55); ctx.scale(0.38, 1.1); ICONS.bow(ctx, P); ctx.restore();
    // the crack of it: a few short pale lines off its brow, for a moment
    if (!slow && u < 0.16) {
      const c0 = at([0, 1.47 + 0.27 * Math.cos(hp), 0.27 * Math.sin(hp)]), k = u / 0.16;
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3, r0 = 0.1 + 0.12 * k, r1 = r0 + 0.12 * (1 - k); P_line(ctx, c0[0] + Math.cos(a) * r0, c0[1] + Math.sin(a) * r0, c0[0] + Math.cos(a) * r1, c0[1] + Math.sin(a) * r1, 0.02, P.cola([244, 238, 222], 1 - k)); }
    }
  }
  return { LIE, TURN, PACE, REACH, BEHIND, REEL, LUNGE, KO, off, rise, live, box, struck, bonk, down, landAt, update, add };
})();
LEVELS.push({
  id: 'clearing', title: 'The Clearing', facing: 180, eyeH: 2.0,
  pal: { skyTop: [6, 8, 16], fog: [54, 60, 74], ground: [126, 132, 148], fogDist: 120 },
  ambient: { tune: 'ambient:5', wind: 1.1, drone: 0.6, droneFreq: 46, windFreq: 420 },
  weather: { kind: 'snow', density: 1, wind: 0.5 },
  lights: [{ x: 1.7, y: 1.7, z: -1.45, r: 6, i: 0.55, color: [255, 190, 110], flicker: 0.15 }],
  text: {
    intro: 'You heard a rustling in the bushes.',
    hint: 'The bow is somewhere on the porch, and its three arrows are lying about, each in a different place. Hold to draw until the bar is full, and let go with it in your sights. It takes two hits to put it down.',
    objective: 'Get the bow and the arrows. Two hits.',
    egg: 'Shoot a bat out of the sky.',   // this night's easter egg, as the Scores' list names it once found (game.js: foundEgg)
    death: { default: 'It dragged you out into the woods.', wounded: 'It was injured, but it still reached you.', spent: 'You missed. It dragged you out into the woods.',
      short: 'Wrong target. It dragged you out into the woods.',   // (arrows gone on bats, or on what came down, and too few left for it)
      vampire: 'That was not just a bat.' },                      // (what came down reached you: its own death, not an easter egg's, so "It got you")
    win: 'It twitched, but eventually stopped moving.',
  },
  // it comes at the steps, or round the open side of the porch
  lanes: [
    { deg: 0, name: 'porch steps', barrierDist: 0, cue: 'crack', default: true },
    { deg: 90, name: 'porch side', barrierDist: 0, cue: 'crack' },
  ],
  creatures: [{ type: 'runner', startDist: 115, time: 62, unseenMult: 1.3 }],   // three arrows to find: on Nightmare about 32 s in if watched, about 18 if not (its pace is the runner's own)
  aftermath: { type: 'down', dur: 3.8 },
  // The bow pressed with no arrows: the hand feels on the string for one (emptyText is what the game says when the draw finds
  // no ammo; it starts that too). The arrows on their own, clicked at it: a use for the arrows whose 'ammo' is the bow, so a
  // click on it with no bow finds the bow missing, and the arrow is raised to a bow that is not there and drops to the boards.
  uses: [{
    tool: 'bow', ammo: 'arrows', range: Infinity, sfx: 'twang', shake: 0.1, emptyText: L => { L.s.grope(); return 'No arrows.'; }, fireText: 'Draw.',
    draw: { fill: CLEARING_BOW.FILL, min: CLEARING_BOW.MIN, fillFor: L => L.s.fillFor(), loose: (outcome, c, aim, power, L) => L.s.loose(outcome, c, aim, power) },
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
    // each frame stands a little out from the door and the glass inside it, so it lines them back to them (the inside of
    // each post, the underside of the head and the top of the sill): without that, seen at an angle, the wall behind
    // showed in a sliver between the frame and the door or the glass, its log seams with it
    SC.wallV(L, -0.55, -1.57, -0.55, -1.58, 0.35, 2.3, frame); SC.wallV(L, 0.55, -1.57, 0.55, -1.58, 0.35, 2.3, frame); SC.quad(L, [-0.55, 2.3, -1.57], [0.55, 2.3, -1.57], [0.55, 2.3, -1.58], [-0.55, 2.3, -1.58], frame);
    SC.wallV(L, 1.2, -1.565, 1.2, -1.58, 1.3, 2.1, frame); SC.wallV(L, 2.2, -1.565, 2.2, -1.58, 1.3, 2.1, frame);
    for (const y of [1.3, 2.1]) SC.quad(L, [1.2, y, -1.565], [2.2, y, -1.565], [2.2, y, -1.58], [1.2, y, -1.58], frame);
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
    s.grope = () => CLEARING_BOW.grope(L);
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
    s.SCURRY = 1.2; s.again = -Infinity; s.fillFor = () => Math.max(CLEARING_BOW.FILL, s.again - L.t);
    s.spent = 0; s.lastLand = -10; s.outcomes = [];   // every arrow loosed, in order (the tests read it)
    const hitIt = c => {
      if (c.dead || G.state !== 'play') return;   // it reached you first
      c.hits++; c.hurtFlash = 0.35; c.arrows.push(c.hits);
      AUDIO.sfx('thunk', panOf(c)); G.shake(0.08);
      if (c.hits === 1) {
        CREATURES.runner.hurt(c); G.toast('It went down.');
        // no second arrow while it lies there: a draw begun too soon after the first hit comes back slower, so that it is
        // full only once the thing has got up and run about a little (s.again; one already coming back is slowed the same)
        const D = CREATURES.runner.DOWN, d = G.draw;
        s.again = L.t + D.fall + D.lie + D.rise + s.SCURRY;
        if (d && d.state === 'drawing') { const k = d.power; d.fill = Math.max(d.fill, d.t + s.again - L.t); d.t = k * d.fill; d.full = false; }
      }
      else {   // (with a vampire still coming, the night is not won yet: L.isWon)
        CREATURES.runner.kill(c); s.killedAt = L.t;
        if (vampLeft()) G.say('It stopped. The other one has not. No arrows left: throw the bow at it.', 'It stopped. The other one has not.'); else G.toast('It stopped.');
      }
    };
    // a bat with an arrow in it (this night's easter egg, kept in the save the moment it happens: foundEgg): it squeaks
    // and tumbles out of the sky, and lies in the snow with the arrow standing in it; s.batsHit counts them. Then it
    // turns (CLEARING_VAMPIRE), and the arrow that stood in the bat is the one in the figure's chest
    s.bats = CLEARING_BATS.make(L); s.batsHit = 0;
    const batHit = (b, from) => {
      if (b.hit) return;
      CLEARING_BATS.strike(b, from, bat => {
        const a = { head: [bat.x, 0.02, bat.z], tail: [bat.x + 0.12, 0.5, bat.z + 0.1] };
        stuck.push(a); CLEARING_VAMPIRE.rise(bat, () => { const i = stuck.indexOf(a); if (i >= 0) stuck.splice(i, 1); });
      });
      s.batsHit++;
      AUDIO.sfx('batSqueak', clamp(Math.sin(wrapPi(Math.atan2(b.x, b.z) - G.cam.yaw)), -0.85, 0.85)); G.shake(0.04);
      foundEgg();
      G.toast('You shot a bat out of the sky.');
    };
    s.loose = (outcome, c, aim, power) => {
      const ray = CLEARING_BOW.rayAt(aim), eye = [0, L.eyeH, 0], from = add3(add3(eye, ray, 0.9), [0, -1, 0], 0.14);
      const dReal = Math.hypot(c.dist, c.lat || 0), hl = Math.hypot(ray[0], ray[2]) || 1, hd = [ray[0] / hl, 0, ray[2] / hl];
      const ground = dist => add3([0, 0.02, 0], hd, dist);
      const CLEAR = 4.6;   // the nearest an arrow comes down: past the porch and its steps (any nearer stood in the boards, its head under them)
      // drawn full and not on the thing (which always comes first), with a bat under the aim: the arrow is the bat's
      // (or, before a bat, with a vampire under it: it takes the arrow, and it only staggers it)
      const vamp = outcome === 'miss' ? vampAt(aim) : null, bat = outcome === 'miss' && !vamp ? CLEARING_BATS.at(L, aim) : null;
      if (bat || vamp) { outcome = bat ? 'bat' : 'vampire'; if (G.draw) G.draw.outcome = outcome; }
      s.spent++; s.outcomes.push(outcome);
      if (vamp) {
        const d = Math.hypot(vamp.x, vamp.z);
        fly({ from, to: () => [vamp.x, vamp.y + 1.1, vamp.z], arc: 0.01 * d, dur: 0.05 + d / 80, done: () => {
          s.vampHits++; CLEARING_VAMPIRE.struck(vamp); AUDIO.sfx('thunk', clamp(Math.sin(wrapPi(Math.atan2(vamp.x, vamp.z) - G.cam.yaw)), -0.85, 0.85)); G.shake(0.05);
          G.say('An arrow will not stop it.', '');
        } });
        return;
      }
      if (bat) {   // it follows the bat in, as an arrow that hits the thing follows it
        const d = Math.hypot(bat.x, bat.z);
        bat.doomed = true;
        fly({ from, to: () => [bat.x, bat.y, bat.z], arc: 0.01 * d, dur: 0.05 + d / 80, done: () => batHit(bat, from) });
        return;
      }
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
    // with an arrow gone on a bat (or on what came down) there may be too few left for the two it takes: it knows it at
    // once, and comes flat out (the player is not left waiting on a night that cannot be won)
    const tooFew = c => (s.batsHit > 0 || s.vampHits > 0) && 3 - s.spent < 2 - c.hits && !flights.length && !c.dead && !c.reckless;
    // drawn on, it may break sideways to a new place (CREATURES.runner.dodge), side on and flat out, and the aim has to
    // come after it. A draw is rolled for once, as it passes the least that looses anything (a click that only lifts the bow
    // is not a draw), on the thing's own seeded stream; never within the gap of the last one, and only when it can (out in
    // the open, up, not already running). Unhurt it is bold and seldom does (s.dodge.chance, never within .gap seconds);
    // with an arrow in it, it is wary and does about every other time (.wary, .waryGap). While a draw is on it at all the
    // runner knows (c.drawnOn): unhurt, it holds its line and does not break away by itself. s.dodge.rolls and .count are
    // what the tests read.
    s.dodge = { chance: 0.12, gap: 4, wary: 0.5, waryGap: 2.5, at: -Infinity, rolls: 0, count: 0 };
    const reactToDraw = c => {
      const d = G.draw, k = s.dodge, drawn = !!d && d.state === 'drawing' && d.t >= CLEARING_BOW.MIN && G.state === 'play';
      c.drawnOn = drawn;
      if (!drawn || d.rolled || c.mode === 'stumble') return;   // (drawn on while it is down: it takes note as it gets up)
      d.rolled = true;
      if (L.t - k.at < (c.wounded ? k.waryGap : k.gap) || !CREATURES.runner.canDodge(c)) return;
      k.rolls++;
      if (c.rand() >= (c.wounded ? k.wary : k.chance)) return;
      CREATURES.runner.dodge(c); k.at = L.t; k.count++;
    };
    // ---- the vampire (CLEARING_VAMPIRE): what it does to you, and what the bow does to it ----
    // still coming, or about to (a bat on its way down, or with an arrow on its way to it)
    const vampLeft = () => s.bats.some(b => b.doomed && !(b.vamp && CLEARING_VAMPIRE.down(b.vamp)));
    s.vampHits = 0; s.thrown = null; s.felled = null;
    // the walking one under an aim, if any (its body as it stands: CLEARING_VAMPIRE.box)
    const vampAt = aim => CLEARING_VAMPIRE.live(L).find(v => (v.ph === 'walk' || v.ph === 'reel') && (b => !!b && aim.x >= b.x - 6 && aim.x <= b.x + b.w + 6 && aim.y >= b.y - 6 && aim.y <= b.y + b.h + 6)(CLEARING_VAMPIRE.box(v))) || null;
    // It reaches you: a death of its own. It rears up where it is, its cape thrown wide, and is in your face; the thing
    // (alive or dead) stays where it was, and the view turns to it. The death's pose runs its clock (v.t) from here.
    const caught = v => {
      if (G.state !== 'play') return;
      const c = L.creature, keep = { dist: c.dist, lat: c.lat, yOff: c.yOff, lunge: c.lunge || 0 }, VL = CLEARING_VAMPIRE.LUNGE;
      G.lastToast = { msg: '', t: -10 };   // (its own line, with nothing in front of it)
      c.deathSpec = { delay: VL.rear, dur: VL.dur, sting: 'sting', pose: cr => { v.t = G.stateT; Object.assign(cr, keep); } };
      AUDIO.sfx('hiss', 0);
      die(c, 'vampire');
      G.cam.tYaw = G.cam.yaw + wrapPi(Math.atan2(v.x, v.z) - G.cam.yaw); G.cam.tPitch = 0;
    };
    // The bow, thrown. Once the thing is down for good and there are no arrows left (on you or lying about), a vampire still
    // coming can be clicked (a target the size of its body, kept on it: throwAt, only there then), and the empty bow is
    // thrown at it: it leaves your hands and goes end over end at its head (the game's throw, kept on its brow as it
    // comes), and bonks it (CLEARING_VAMPIRE.bonk): down it goes, for good, and once it is down the night is won. Before
    // then it is no target: with the thing still up a click on it is a draw, as anywhere, and the bow is wanted for that.
    s.bowFor = () => {
      if (G.state !== 'play' || !L.creature.dead || s.thrown || G.throwing || !G.hasItem('bow') || G.hasItem('arrows') || L.items.some(i => i.id === 'arrows' && !i.taken)) return null;
      let best = null; for (const v of CLEARING_VAMPIRE.live(L)) if ((v.ph === 'walk' || v.ph === 'reel') && !v.doomed && (!best || Math.hypot(v.x, v.z) < Math.hypot(best.x, best.z))) best = v;
      return best;
    };
    const throwAt = mkTarget(L, { id: 'vampire', name: 'Throw the bow', x: 0, y: 0, z: 30, w: 0.9, h: 1.75, hint: () => 'Throw the bow at it.', onClick() { throwBow(); return true; } });
    Object.defineProperty(throwAt, 'hidden', { get: () => !s.bowFor() });
    const throwBow = () => {
      const v = s.bowFor(), bow = G.inv.find(i => i.id === 'bow'); if (!v || !bow) return;
      bowCard('lean'); bow.spin = { turns: 2.5, roll: 0.15 };   // (stood on end, it turns over and over in the air)
      v.doomed = true; s.thrown = { v, to: { x: v.x, y: v.y + 0.8, z: v.z } };   // (its middle at its brow: a thrown thing is drawn up from where it is)
      throwItem(bow, s.thrown.to, () => {
        s.thrown = null; s.felled = v; CLEARING_VAMPIRE.bonk(v);
        AUDIO.sfx('bonk', clamp(Math.sin(wrapPi(Math.atan2(v.x, v.z) - G.cam.yaw)), -0.85, 0.85)); G.shake(0.08);
        G.toast('Right on the head.');
      });
    };
    const standOn = s.standOn = (x, z) => (Math.abs(x) <= 3.2 && Math.abs(z) <= 1.6 ? 0.35 : (Math.abs(x) <= 0.8 && z > 1.6 && z <= 2.2) || (x > 3.2 && x <= 3.8 && Math.abs(z) <= 0.6) ? 0.18 : 0);   // (the vampire's feet too)
    // it stands on what is under its feet: the ground its way runs along, then the step, then the deck. The renderer
    // and the gaze take the height from yOff; c.stand is kept for the lunge, which starts from there (see the runner)
    L.update = dt => {
      const c = L.creature, p = c.pos(), q = rotY(p.x, p.z, -L.facing); c.stand = standOn(q[0], q[1]); c.yOff = c.stand;
      reactToDraw(c);
      CLEARING_BATS.update(L, dt);
      CLEARING_VAMPIRE.update(L, dt, !c.dead && G.state === 'play' ? Math.hypot(c.dist, c.lat || 0) + CLEARING_VAMPIRE.BEHIND : 0, caught);   // (it hangs back behind the thing while it is up)
      const tv = s.bowFor();   // the bow, to be thrown at it: its target kept on it (and the bow in the air kept on its brow)
      if (tv) { throwAt.x = tv.x; throwAt.y = tv.y; throwAt.z = tv.z; }
      if (s.thrown) { const v = s.thrown.v; Object.assign(s.thrown.to, { x: v.x, y: v.y + 0.8, z: v.z }); }
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
      if ((spentAll(c) || tooFew(c)) && G.state === 'play' && L.t - s.lastLand > 1.2) { s.short = s.spent < 3 && tooFew(c); c.reckless = true; G.toast(s.spent >= 3 ? 'That was the last arrow.' : 'Not enough arrows left.'); }
      // the bow in your hands: held low while you look ahead, up while it is drawn; the string snaps forward the moment it is loosed
      CLEARING_BOW.hold(L, dt, G.cam.tPitch < 0.3 && G.state === 'play' && G.hasItem('bow'));   // won, it is lowered out of the way of watching it
      s.bowLit = 0.85 + 0.15 * Math.max(0, Math.cos(wrapPi(G.cam.yaw - L.facing - Math.PI)));   // facing the lit wall, the bow is lit a little more
    };
    L.dynamic = () => {
      const arrow = CLEARING_BOW.arrow;
      for (const f of flights) {
        const k = f.t / f.dur, h = pathAt(f, Math.min(1, k)), b = pathAt(f, Math.max(0, k - 0.02)), u = [h[0] - b[0], h[1] - b[1], h[2] - b[2]], l = Math.hypot(u[0], u[1], u[2]) || 1;
        const fade = f.fade ? clamp((1 - k) / 0.4, 0, 1) : 1;
        // going away from you an arrow is nearly end on, so a faint streak behind it shows its way
        const pts = []; for (let i = 0; i <= 4; i++) pts.push(pathAt(f, Math.max(0, Math.min(1, k) - 0.16 * i / 4)));   // from the arrow back (its width goes by the first point)
        R.add({ kind: 'poly', pts, stroke: true, color: [214, 208, 196], lw: 0.012, alpha: 0.3 * fade, noContact: true, noFog: true });
        arrow(add3(h, u, -0.75 / l), h, f.fade ? fade : undefined);
      }
      for (const a of stuck) arrow(a.tail, a.head, undefined, 1.8);
      CLEARING_BATS.add(L); CLEARING_VAMPIRE.add(L);
    };
    // the win: watch it go down, closer in the further off it is, and the view lowered to it as it falls
    // (or, if the last of it was a vampire bonked on the head, it: lying in the snow)
    L.watchPoint = () => {
      if (s.felled) { const v = s.felled; return { x: v.x, y: v.y + 0.35, z: v.z }; }
      const c = L.creature, p = c.pos(), k = c.dead ? clamp((c.deadT || 0) / 0.85, 0, 1) : 0; return { x: p.x, y: p.y + (c.yOff || 0) + lerp(1.0, 0.3, k), z: p.z };
    };
    L.watchZoom = () => clamp((s.felled ? Math.hypot(s.felled.x, s.felled.z) : Math.hypot(L.creature.dist, L.creature.lat)) / 12, 1.35, 2.6);
    L.deathCause = c => (s.short ? 'short' : s.spent >= 3 ? 'spent' : c.wounded ? 'wounded' : 'default');
    // won with it down, and nothing that came down out of the sky still up (or about to be)
    L.isWon = () => L.creature.dead && !vampLeft();
    L.objectiveText = () => {
      const a = G.inv.find(i => i.id === 'arrows'), n = a ? a.uses : 0;
      return L.creature.dead ? (vampLeft() ? (s.thrown ? 'It is down.' : 'Throw the bow at it.') : 'It is down.') : !G.hasItem('bow') ? 'Get the bow.' : !n ? (s.spent >= 3 ? 'No arrows left.' : 'Find the arrows.') : n + ' arrow' + (n > 1 ? 's' : '') + '. Hold until it is full; let go on it.';
    };
  }
});
