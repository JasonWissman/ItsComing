'use strict';
// The customer: a tall man, taller than a man should be, in a long belted trenchcoat and a hat. The coat is a dull dark
// drab, cut in bold simple shapes that read from across the lot: wide lapels, two rows of buttons, a belt with a buckle
// at the waist, the collar turned up round its jaw, the skirt of it down to the knee and parting below the belt onto
// dark trousers and black shoes. Its hands hang at its sides, grey. The hat is a dark fedora, its brim pulled low, and
// under the brim there is no face: the shadow of it lies over where the eyes would be, black, with nothing in it, whatever
// light is on it. Only the bottom of the face shows, grey, and in it the mouth, a thin grin of small white teeth, which
// never quite stops working: the jaw drops a little and the teeth close again, a slow, small chewing, quicker and
// greedier whenever it is on the move, as if it can already taste what it is coming for.
// It does not move the way anything else does. It stands bolt upright and dead still: nothing bobs, nothing sways, the
// arms never swing. It comes on in stiff steps, its legs straight, its feet barely leaving the ground; and every so
// often the feet stop altogether and it keeps coming anyway, sliding over the ground standing quite still. Only its head
// moves, and slowly: it lays itself over to one side, hat and all, holds there, and lays itself over to the other; nearer
// the glass it lays itself further over. Near the glass its hands come up and press flat on it either side of its face,
// as if peering in under the brim. Coming at you the mouth comes apart: the jaw drops away far further than a jaw goes,
// the teeth top and bottom.
// It is drawn to light, and it does not care whether you look at it. While the place it is coming for is lit it comes
// fast; in the dark it walks at an ordinary pace. The night sets c.drawn (whether its light is on) and c.drawnMult (how
// much faster the light makes it) every frame.
// A night can send it sideways, running (The Diner, from a shut window to one still open): c.runPose on, c.runTurn 0..1
// as it turns side on and back (it pivots on the spot, stiffly, a solid figure keeping its width as it goes round), c.runDir +1 running to
// the right of the view and -1 to the left, c.runGait its stride and c.runAmt 0..1 how hard it is running. It runs
// skipping, step and hop, step and hop, the knee coming up high, the skirt of its coat flying out behind; but its body
// stays bolt upright, its arms hang dead straight at its sides, and its head stays turned to you, under the hat.
// A night can also put its hands on the bottom edge of a shutter (The Diner): c.shove { k 0..1 its hands coming up to it,
// h the edge's height in its own metres from its feet, up 0..1 shoving it up }; its body lifts with c.yOff if it hangs.
// And a night can stand it at a counter with a soda (The Diner, the soda fountain): c.soda, all in its own metres from
// its feet, as the night sets them every frame: k 0..1 its right hand going to (hx, hy), the hand turned to hold a cup
// there; hold whether it has the cup in that hand (drawn by c.soda.drawCup(ctx, P, full), S across, tilted by tilt, its
// rim going over toward its face as tilt grows); bang 0..1 its two fists brought down onto the counter, fist [left,
// right] how high each is raised (0 on the counter, 1 high); anger 0..1; jerk its head snapped over (radians); shake its
// body shuddering across (metres); gape its jaw dropped (gulping, or its teeth bared in a rage). While it has the cup in
// its hand the arm is drawn in front of its face.
// Its frame, in metres from its feet: the hips at HIP, the top of the coat's shoulders at TOP, the head's middle 0.18 above
// that and the crown of the hat about 1.9 m up.
const CUST = { HIP: 0.9, TOP: 1.5, L1: 0.43, L2: 0.43 };
CREATURES.customer = {
  name: 'the customer', h: 1.95, w: 0.75, faceY: 1.64, stepRate: 1.2, catchDist: 1.5, sound: 'shoes', ignoresGaze: true,
  death: { delay: 0.35, dur: 0.55, sting: 'stingGlass' },
  init(c) { c.drawn = false; c.drawnMult = 1; c.away = false; },
  speedMult(c) {
    if (c.dead) return 0;
    return c.drawn ? c.drawnMult : 1;
  },
  // its head, laid over slowly one way, held, and slowly the other way (amp radians each side): about six seconds a round
  tilt(t, amp) {
    const w = ((t * 0.16) % 1 + 1) % 1;
    const f = w < 0.3 ? -1 : w < 0.5 ? -1 + 2 * smoothstep((w - 0.3) / 0.2) : w < 0.8 ? 1 : 1 - 2 * smoothstep((w - 0.8) / 0.2);
    return f * amp;
  },
  // how far its feet have stopped (0..1): now and then, for a few seconds at a time (by a hash of which few seconds), they
  // stop, and it slides on without them
  glide(t) {
    const P = 4.3, k = Math.floor(t / P), f = t - k * P, r = Math.abs(Math.sin((k + 7) * 91.7) * 43758.5) % 1;
    return r > 0.55 ? smoothstep(f / 0.5) * smoothstep((P - f) / 0.5) : 0;
  },
  pal(P) {
    // the shadow under the brim and the inside of its mouth take no light at all: black in the diner's light as in the
    // dark (only the fog lies over them)
    const unlit = (c, a) => rgba(mixc(c, P.fogColor || [0, 0, 0], P.fog || 0), a);
    return {
      // the coat, its shadows, its lapels and collar, belt, buckle and buttons; the trousers and shoes
      coat: P.col([54, 50, 44]), coatS: P.col([42, 39, 34]), coatD: P.col([24, 22, 20]), coatL: P.col([64, 59, 51]),
      belt: P.col([38, 34, 29]), buckle: P.col([120, 110, 86]), button: P.col([24, 22, 20]),
      trousers: P.col([24, 23, 27]), trousersS: P.col([15, 14, 17]), shoe: P.col([11, 10, 12]), lace: P.col([60, 58, 66]),
      // the hat: crown, the underside of the brim, its band, the edge of the brim catching the light
      hat: P.col([34, 32, 34]), hatD: P.col([17, 16, 18]), band: P.col([12, 11, 12]), hatL: P.col([66, 64, 68]),
      // its skin, the bottom of the face and the hands, grey
      skin: P.col([150, 143, 135]), skinD: P.col([98, 92, 86]),
      shade: unlit([5, 4, 6]), shadeA: a => unlit([5, 4, 6], a), throat: unlit([26, 4, 6]),
      teeth: P.col([232, 224, 204]), teethD: P.col([96, 88, 76]), gum: P.col([96, 24, 28]),
    };
  },
  draw(ctx, c, P) {
    // its breath (every standing thing is drawn breathing) is held while it has hold of a shutter: its hands stay on the edge
    if (c.shove && !c.dead && !c.lunge) ctx.scale(1, 1 / (1 + 0.014 * Math.sin(c.t * 1.6)));
    if (c.soda && c.soda.shake && !c.lunge) ctx.translate(c.soda.shake, 0);   // shuddering with rage at the counter
    // turning to run, or back: it turns as a solid thing turns, at its full width all the way round (drawTurn), the front
    // before it and the side after
    const turn = c.runPose ? (c.runTurn === undefined ? 1 : c.runTurn) : 0;
    if (turn <= 0) this.drawFront(ctx, c, P);
    else if (turn >= 1) this.drawRun(ctx, c, P);
    else this.drawTurn(ctx, c, P, turn * Math.PI / 2);
  },
  // the hop of its skip at stride g (0..1): every step comes down, and the same foot springs it up again
  hop(g) { const w = ((g / Math.PI) % 1 + 1) % 1; return w > 0.15 ? Math.sin(Math.PI * (w - 0.15) / 0.85) : 0; },
  // a running leg by its foot's place in the round (g + o; k how hard it runs), from the hip at (0, hipY): on the ground and
  // sweeping back under it for the first half, then the knee up high in front and down again. x is forward of the hip.
  runLeg(g, o, k, hipY) {
    const L1 = CUST.L1, L2 = CUST.L2, u = (((g + o) / TAU) % 1 + 1) % 1;
    let th, ph;
    if (u < 0.5) { const v = u / 0.5; th = lerp(0.35, -0.5, v); ph = 0.08 + 0.3 * Math.sin(Math.PI * v); }
    else { const v = (u - 0.5) / 0.5; th = v < 0.55 ? lerp(-0.5, 1.15, smoothstep(v / 0.55)) : lerp(1.15, 0.35, smoothstep((v - 0.55) / 0.45)); ph = 0.08 + 1.55 * Math.sin(Math.PI * v); }
    th *= k; ph *= k;
    const kx = Math.sin(th) * L1, ky = hipY - Math.cos(th) * L1, sa = th - ph;
    return { kx, ky, fx: kx + Math.sin(sa) * L2, fy: ky - Math.cos(sa) * L2, sa };
  },
  // a sleeve of the coat from the shoulder through the elbow to the wrist, a strap round the cuff (dark: the far arm, in
  // its own shadow)
  sleeve(ctx, K, pts, w, dark) {
    P_limb(ctx, pts, w, dark ? K.coatD : K.coat);
    const [e, h] = [pts[pts.length - 2], pts[pts.length - 1]], l = Math.hypot(h[0] - e[0], h[1] - e[1]) || 1, ux = (h[0] - e[0]) / l, uy = (h[1] - e[1]) / l;
    P_line(ctx, h[0] - ux * 0.062 - uy * w * 0.45, h[1] - uy * 0.062 + ux * w * 0.45, h[0] - ux * 0.062 + uy * w * 0.45, h[1] - uy * 0.062 - ux * w * 0.45, 0.014, dark ? K.trousersS : K.coatD);
  },
  // the coat's front, face on, in the body's frame (its top at top, by the hop): F(x) is where a point x across its front
  // shows (x itself face on; round the curve of its chest as it turns). Kept bold and plain: the dark of its throat in the
  // V of the lapels, the wide lapels, two rows of buttons, the belt and buckle, the pocket flaps, and the skirt parting
  // below the belt onto its trousers
  coatFront(ctx, K, F, top, by) {
    const Y = y => y + by, pt = (x, y) => [F(x), Y(y)];
    P_poly(ctx, [pt(-0.07, 0.5), pt(0.012, 0.98), pt(0.07, 0.5)], K.trousers);   // the skirt parting onto the trousers
    P_limb(ctx, [pt(0.012, 0.98), pt(0.07, 0.5)], 0.008, K.coatD);
    P_poly(ctx, [[F(-0.07), top + 0.031], [F(0.07), top + 0.031], [F(0.01), top - 0.2]], K.shade);   // its throat, in shadow, up over the coat's top edge
    for (const s of [-1, 1]) {   // the lapels, wide, notched, an edge of shadow down the inside of each
      const lap = [[F(s * 0.06), top + 0.025], [F(s * 0.175), top - 0.02], [F(s * 0.16), top - 0.11], [F(s * 0.118), top - 0.1], [F(s * 0.135), top - 0.15], [F(s * 0.04), top - 0.36]];
      P_poly(ctx, lap, K.coatL);
      P_limb(ctx, [[F(s * 0.06), top + 0.02], [F(s * 0.04), top - 0.36]], 0.008, K.coatD);
      P_limb(ctx, [[F(s * 0.16), top - 0.11], [F(s * 0.118), top - 0.1]], 0.006, K.coatD);
    }
    P_limb(ctx, [[F(0.04), top - 0.36], pt(0.012, 0.98)], 0.007, K.coatD);   // the edge of the front, down to the belt
    for (const y of [top - 0.42, top - 0.53, 1.11]) for (const s of [-1, 1]) P_ell(ctx, F(s * 0.085), Y(y), 0.013, 0.013, K.button);
    P_poly(ctx, [[F(-0.2), Y(1.02)], [F(0.2), Y(1.02)], [F(0.2), Y(1.075)], [F(-0.2), Y(1.075)]], K.belt);   // the belt
    P_poly(ctx, [pt(-0.02, 1.012), pt(0.05, 1.012), pt(0.05, 1.085), pt(-0.02, 1.085)], K.buckle);
    P_poly(ctx, [pt(-0.006, 1.026), pt(0.036, 1.026), pt(0.036, 1.071), pt(-0.006, 1.071)], K.belt);
    for (const s of [-1, 1]) P_line(ctx, F(s * 0.09), Y(0.9), F(s * 0.185), Y(0.86), 0.012, K.coatD);   // the pocket flaps
  },
  // the coat seen side on, facing +x, in the body's frame (sx its width as it turns, 1 side on; flow 0..1 its skirt flying
  // out behind): the back of it, the belt, a lapel and a row of buttons down the front
  sidePoly(top, by, flow) {
    const f = flow || 0;
    return [[-0.1, top + 0.01], [0.06, top + 0.02], [0.12, top - 0.08], [0.14, top - 0.32], [0.115, 1.06 + by], [0.15, 0.85 + by], [0.19 - f * 0.04, 0.5 + by + f * 0.08],
      [0.0, 0.52 + by + f * 0.1], [-0.19 - f * 0.26, 0.52 + by + f * 0.26], [-0.16 - f * 0.08, 0.85 + by + f * 0.04], [-0.13, 1.06 + by], [-0.14, top - 0.3], [-0.13, top - 0.1]];
  },
  coatSide(ctx, K, top, by, sx) {
    const pt = (x, y) => [x * sx, y];
    P_poly(ctx, [pt(0.02, top + 0.02), pt(0.07, top + 0.015), pt(0.125, top - 0.1), pt(0.1, top - 0.13), pt(0.13, top - 0.2), pt(0.11, top - 0.36), pt(0.05, top - 0.1)], K.coatL);
    P_limb(ctx, [pt(0.07, top + 0.01), pt(0.11, top - 0.36)], 0.007, K.coatD);
    for (const y of [top - 0.42, top - 0.53]) P_ell(ctx, 0.118 * sx, y, 0.011, 0.012, K.button);
    P_poly(ctx, [pt(-0.13, 1.02 + by), pt(0.118, 1.02 + by), pt(0.118, 1.075 + by), pt(-0.13, 1.075 + by)], K.belt);
    P_line(ctx, 0.02 * sx, 0.88 + by, 0.1 * sx, 0.86 + by, 0.012, K.coatD);   // a pocket flap
  },
  // the mouth's hunger, 0 shut to 1 its jaw dropped as far as a bite takes it, at time t: it comes in fits, a beat of about
  // 0.42 s holding now nothing, now one bite (dropping open and snapping shut, at a depth and a pace of its own), now two
  // quick snaps one on the other
  bite(t) {
    const B = 0.42, k = Math.floor(t / B), f = t - k * B, h = i => Math.abs(Math.sin((k * 7.13 + i * 3.71 + 1) * 127.1) * 43758.5) % 1;
    const snap = u => (u <= 0 || u >= 1 ? 0 : u < 0.62 ? Math.sin(Math.PI / 2 * u / 0.62) : 1 - ((u - 0.62) / 0.38) ** 2);   // open, and shut hard
    if (h(0) < 0.18) return 0;
    if (h(1) > 0.62) {
      const d1 = 0.15 + 0.03 * h(2), s2 = d1 + 0.02 + 0.06 * h(3), d2 = Math.min(0.14, B - s2);
      return Math.max(snap(f / d1) * (0.6 + 0.4 * h(4)), snap((f - s2) / d2) * (0.45 + 0.4 * h(5)));
    }
    const d = 0.2 + 0.16 * h(2), s0 = (B - d) * h(3);
    return snap((f - s0) / d) * (0.55 + 0.45 * h(4));
  },
  // how far its jaw is dropped now (0..1; on: whether it is on the move): it chews, slowly and a little, all the time, and
  // harder as it moves (eased over its own time, c.t, from one drawing to the next; drawn first, or after a long while, it
  // is as it is now); with reduced motion only a small working of the jaw
  chomp(c, on) {
    const dt = c.mouthT === undefined || c.t < c.mouthT ? 1 : Math.min(1, c.t - c.mouthT), want = on ? 1 : 0.4;
    c.mouthT = c.t; c.mouthK = (c.mouthK === undefined ? want : c.mouthK) + (want - (c.mouthK === undefined ? want : c.mouthK)) * Math.min(1, dt * (on ? 6 : 4));
    const rm = typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.settings.reducedMotion ? 0.3 : 1;
    return rm * c.mouthK * this.bite(c.t * (on ? 1 : 0.6));
  },
  // a grey hand at (x, y) off the wrist, pointing along ang: open 0 hanging loose, the fingers curled in; 1 spread flat
  hand(ctx, K, x, y, ang, open, s, size) {
    const z = (size || 1) * 1.45, ca = Math.cos(ang), sa = Math.sin(ang);
    const px = x + ca * 0.022 * z, py = y + sa * 0.022 * z;
    P_ell(ctx, px, py, 0.026 * z, 0.03 * z, K.skin, ang - Math.PI / 2);
    ctx.strokeStyle = K.skin; ctx.lineWidth = 0.011 * z; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5, a = ang + o * lerp(0.1, 0.32, open), l = (0.04 + 0.014 * open) * z * (o * o > 1 ? 0.82 : 1);
      const bx = px + ca * 0.024 * z - sa * o * 0.011 * z, by = py + sa * 0.024 * z + ca * o * 0.011 * z;
      const mx = bx + Math.cos(a) * l * 0.55, my = by + Math.sin(a) * l * 0.55, b = a - s * lerp(1.3, 0.1, open);
      ctx.moveTo(bx, by); ctx.lineTo(mx, my); ctx.lineTo(mx + Math.cos(b) * l * 0.45, my + Math.sin(b) * l * 0.45);
    }
    const ta = ang + s * lerp(0.5, 1.0, open);   // the thumb
    ctx.moveTo(px + sa * s * 0.012 * z, py - ca * s * 0.012 * z); ctx.lineTo(px + Math.cos(ta) * 0.034 * z, py + Math.sin(ta) * 0.034 * z);
    ctx.stroke();
    P_line(ctx, px - sa * 0.006 * z, py + ca * 0.006 * z, px + ca * 0.012 * z, py + sa * 0.012 * z, 0.006 * z, K.skinD);   // the crease of the palm
  },
  // the mouth: corners at (+-mw, cy), the top edge dU below them in the middle and the bottom dL, each a curve up into the
  // corners; a row of small square teeth hanging from the top and one standing on the bottom, th deep, meeting in the
  // middle when it is shut; open (dL much deeper, and round squaring the bottom off), dark between them
  grin(ctx, K, mw, cy, dU, dL, th, round) {
    const r = round || 0, yU = u => cy + dU * (1 - u * u), yL = u => cy + dL * ((1 - r) * (1 - u * u) + r * (1 - u * u * u * u)), N = 18;
    const path = () => {
      ctx.beginPath();
      for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, yU(u)); }
      for (let i = N; i >= 0; i--) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, yL(u)); }
      ctx.closePath();
    };
    ctx.save();
    path(); ctx.strokeStyle = K.gum; ctx.lineWidth = 0.005; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = K.throat; ctx.fill();
    path(); ctx.clip();
    const band = (y, dir) => {   // a row of teeth: from the edge y(u), dir -1 down from the top, +1 up from the bottom
      ctx.beginPath();
      for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, y(u)); }
      for (let i = N; i >= 0; i--) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, y(u) + dir * th * (1 - 0.45 * u * u)); }
      ctx.closePath(); ctx.fillStyle = K.teeth; ctx.fill();
      ctx.strokeStyle = K.teethD; ctx.lineWidth = 0.0028; ctx.beginPath();
      for (let i = -5; i <= 5; i++) {   // the gaps between them, narrower toward the corners
        const u = Math.sin(i / 5.6 * Math.PI / 2) + (dir > 0 ? 0.04 : 0);
        ctx.moveTo(u * mw, y(u) - dir * 0.01); ctx.lineTo(u * mw, y(u) + dir * th * (1 - 0.45 * u * u));
      }
      ctx.stroke();
    };
    band(yL, 1); band(yU, -1);
    ctx.restore();
  },
  // the hat, in the head's frame: the underside of the brim, then the crown with its pinched top and its band, and the
  // edge of the brim catching what light there is
  drawHat(ctx, K) {
    P_ell(ctx, 0, 0.05, 0.168, 0.032, K.hatD);
    P_poly(ctx, [[-0.102, 0.058], [-0.095, 0.17], [-0.066, 0.205], [-0.02, 0.19], [0, 0.178], [0.02, 0.19], [0.066, 0.205], [0.095, 0.17], [0.102, 0.058]], K.hat);
    P_poly(ctx, [[-0.102, 0.058], [-0.099, 0.09], [0.099, 0.09], [0.102, 0.058]], K.band);
    P_limb(ctx, [[-0.03, 0.188], [-0.012, 0.13], [0.0, 0.1]], 0.006, K.hatD);   // the crease down the front of the crown
    P_ell(ctx, 0, 0.058, 0.168, 0.016, K.hat);
    ctx.save(); ctx.strokeStyle = K.hatL; ctx.lineWidth = 0.005; ctx.beginPath(); ctx.ellipse(0, 0.05, 0.166, 0.03, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); ctx.restore();
  },
  // the head, face on, in its own frame: its middle at (0, 0), 0.08 across and 0.1 up. gape 0..1 the mouth coming apart,
  // back from behind (the back of its head and hat), chomp (0..1) the jaw working as it chews
  drawHead(ctx, c, P, K, near, gape, back, chomp) {
    if (back) { P_ell(ctx, 0, 0, 0.082, 0.102, K.shade); this.drawHat(ctx, K); return; }
    const ch = chomp || 0, drop = Math.max(gape * 0.065, ch * 0.012);
    // the face and the jaw under it, grey; the jaw dropping away as it comes at you
    P_ell(ctx, 0, 0, 0.08, 0.102, K.skin);
    // the jaw, its underside in shade: a crescent along the bottom of it, inside its edge, that goes down with it as it
    // drops (a line drawn under the chin hung below it, pale against the black of the neck, whenever the jaw was working)
    const jy = -0.05 - drop, jw = 0.066 + gape * 0.008, jh = 0.055 + gape * 0.075;
    P_ell(ctx, 0, jy, jw, jh, K.skinD);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, jy, jw, jh, 0, 0, TAU); ctx.clip();
    P_ell(ctx, 0, jy + 0.009, jw * 1.02, jh, K.skin);
    ctx.restore();
    // the mouth: thin, its small teeth showing, working a little; coming at you it comes apart, the bottom row going down
    const mw = 0.04 + gape * 0.03, cy = -0.062 + gape * 0.01;
    this.grin(ctx, K, mw, cy, -0.005 - gape * 0.006, -0.016 - ch * 0.022 - gape * 0.16, 0.0075 + gape * 0.014, Math.max(gape, ch * 0.4));
    // the shadow of the brim over all of the face above the mouth: black, nothing in it
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 0.082, 0.104, 0, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(0, -0.058, 0, 0.0);
    g.addColorStop(0, K.shadeA(0)); g.addColorStop(0.45, K.shadeA(0.75)); g.addColorStop(1, K.shadeA(1));
    ctx.fillStyle = g; ctx.fillRect(-0.1, -0.058, 0.2, 0.17);
    ctx.restore();
    this.drawHat(ctx, K);
  },
  // the collar, turned up round its jaw either side (in the body's frame, the neck at (0, top))
  drawCollar(ctx, K, top, X) {
    const x = X || (v => v);
    for (const s of [-1, 1]) {
      P_poly(ctx, [[x(s * 0.05), top + 0.01], [x(s * 0.15), top - 0.01], [x(s * 0.135), top + 0.13], [x(s * 0.072), top + 0.11]], K.coatL);
      P_limb(ctx, [[x(s * 0.072), top + 0.11], [x(s * 0.05), top + 0.01]], 0.008, K.coatD);
    }
  },
  drawFront(ctx, c, P) {
    const t = c.t, near = clamp(1 - c.dist / 8, 0, 1), lunge = c.lunge || 0, K = this.pal(P), HIP = CUST.HIP;
    // at a shutter part way down (c.shove, set by the night): k how far its hands have come up to the bottom edge of it, h
    // how high that is (in its own metres, from its feet: the edge as seen from your eye), up 0..1 the shove
    const sv = c.shove && !lunge ? c.shove : null, grip = sv ? sv.k : 0, heave = sv ? sv.up : 0;
    // at a counter with a soda (c.soda, set by the night): reaching, drinking, pounding the counter
    const sd = c.soda && !lunge ? c.soda : null;
    const back = !!c.away && !lunge, gape = Math.max(smoothstep(lunge * 1.5), 0.3 * heave, sd ? sd.gape || 0 : 0);
    // the walk: stiff steps on straight legs, a foot barely lifting; now and then the feet stop and it slides on
    const st = c.moving ? 1 - this.glide(t) : 0, g = c.gait;
    const press = lunge || c.soda ? 0 : smoothstep((7.6 - c.dist) / 1.4);   // at the glass, the hands up and flat on it (not once it is inside)
    const reach = smoothstep(lunge * 1.6);
    // the head: laid slowly over and back, further at the glass; it comes upright and at you as it lunges
    const tilt = this.tilt(t, lerp(0.22, 0.4, press)) * (1 - reach * 0.7) * (1 - heave * 0.6) + (sd ? sd.jerk || 0 : 0);
    const top = CUST.TOP, hk = 1 + lunge * 0.3;
    const headFrame = () => { ctx.translate(0, top); ctx.rotate(tilt * 0.35); ctx.translate(0, 0.07); ctx.rotate(tilt * 0.65); ctx.translate(0, 0.11); ctx.scale(hk, hk); };
    // the legs: dark trousers down over the shoes; one foot coming up a little at a time
    for (const s of [-1, 1]) {
      const l = Math.max(0, Math.sin(g + (s > 0 ? Math.PI : 0))) * 0.035 * st;
      P_limb(ctx, [[s * 0.085, HIP], [s * 0.088, 0.5], [s * 0.09, 0.1 + l]], 0.11, K.trousers);
      P_ell(ctx, s * 0.1, 0.04 + l, 0.074, 0.04, K.shoe, s * 0.1);
      P_line(ctx, s * 0.08, 0.06 + l, s * 0.115, 0.07 + l, 0.007, K.lace);
    }
    // the body: the coat, down past the knee, belted, the collar up (from behind, plain, a seam down its back)
    P_poly(ctx, [[-0.07, top + 0.03], [-0.2, top], [-0.235, top - 0.07], [-0.215, top - 0.3], [-0.19, 1.05], [-0.215, 0.85], [-0.25, 0.52], [-0.04, 0.5], [0, 0.52], [0.04, 0.5], [0.25, 0.52], [0.215, 0.85], [0.19, 1.05], [0.215, top - 0.3], [0.235, top - 0.07], [0.2, top], [0.07, top + 0.03]], K.coat);
    if (!back) this.coatFront(ctx, K, x => x, top, 0);
    else { P_poly(ctx, [[-0.2, 1.02], [0.2, 1.02], [0.2, 1.075], [-0.2, 1.075]], K.belt); P_line(ctx, 0, 1.02, 0, 0.52, 0.008, K.coatD); }
    // the arms: hanging dead still at its sides, never swinging; at the glass they come up, the elbows out, and the palms
    // press flat either side of its face; coming at you they reach for your face. At a shutter not yet down they go to the
    // bottom edge of it, wherever it is (the arms stretching as far as they must), and the fingers curl up round it.
    let held = null;
    for (const s of [-1, 1]) {
      const sh = [s * 0.2, top - 0.05];
      const hang = { e: [s * 0.245, 1.2], h: [s * 0.255, 0.9] };
      const up = { e: [s * 0.4, 1.42], h: [s * 0.22, 1.66] };
      const at = { e: [s * 0.36, 1.6], h: [s * 0.25, 1.82] };
      const r = Math.max(press, reach), U = reach > press ? at : up;
      let e = [lerp(hang.e[0], U.e[0], r), lerp(hang.e[1], U.e[1], r)], h = [lerp(hang.h[0], U.h[0], r), lerp(hang.h[1], U.h[1], r)];
      let ang = lerp(Math.atan2(h[1] - e[1], h[0] - e[0]), Math.PI / 2 + s * (0.1 + reach * 0.25), r), open = Math.max(press, reach), size = 1 + reach * 0.5;
      if (grip > 0) {   // the wrist under the edge, the hand pointing straight up to it, the elbow out
        const wy = sv.h - 0.13, G = { e: [s * lerp(0.4, 0.32, heave), (sh[1] + wy) / 2], h: [s * 0.17, wy] };
        e = [lerp(e[0], G.e[0], grip), lerp(e[1], G.e[1], grip)]; h = [lerp(h[0], G.h[0], grip), lerp(h[1], G.h[1], grip)];
        ang = lerp(ang, Math.PI / 2, grip); open = lerp(open, 0.15, grip); size = lerp(size, 1.1, grip);
      }
      if (sd) {
        const L2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
        // pounding the counter: the fists come down on its far edge in front of it, and go up again, high when it is angry
        const b = sd.bang || 0;
        if (b > 0) {
          const f = (sd.fist || [0, 0])[s > 0 ? 1 : 0], fh = [s * lerp(0.15, 0.2, f), 0.95 + f * 0.62], fe = [s * (0.34 + 0.08 * f), lerp(1.12, 1.4, f)];
          e = L2(e, fe, b); h = L2(h, fh, b); ang = lerp(ang, -Math.PI / 2 + s * 0.2, b); open = lerp(open, 0, b); size = lerp(size, 1.25, b);
        }
        // the right hand to the cup: round it, the fingers across its front (turned toward its middle)
        if (s > 0 && sd.k > 0) {
          e = L2(e, [0.36, (sh[1] + sd.hy) / 2 - 0.06], sd.k); h = L2(h, [sd.hx, sd.hy], sd.k);
          ang = lerp(ang, -Math.PI, sd.k); open = lerp(open, 0.35, sd.k); size = lerp(size, 1.1, sd.k);
        }
      }
      // the cup in its hand: the arm comes after its face, the cup up to its mouth
      if (sd && s > 0 && sd.hold) { held = { e, h, ang, open, size }; continue; }
      this.sleeve(ctx, K, [sh, e, h], 0.085, false);
      this.hand(ctx, K, h[0], h[1], ang, open, -s, size);
    }
    // the neck, lost in the shadow of the hat and the collar, and the head on it; then the collar up round its jaw
    ctx.save(); ctx.translate(0, top); ctx.rotate(tilt * 0.35); P_line(ctx, 0, 0, 0, 0.1, 0.05, K.shade); ctx.restore();
    // hungry: its jaw working (harder as it comes on, or as it rages at the counter; not while it has hold of a shutter);
    // coming at you, it gapes wide
    const chomp = this.chomp(c, (!!c.moving || (sd && sd.anger > 0.15)) && !sv && !back);
    ctx.save(); headFrame(); this.drawHead(ctx, c, P, K, near, gape, back, chomp); ctx.restore();
    if (!lunge) this.drawCollar(ctx, K, top);
    if (held) {
      const S = sd.S || 0.2, h = held.h;
      ctx.save(); ctx.translate(h[0] - 0.045, h[1]); ctx.rotate(sd.tilt || 0); ctx.translate(0, -0.42 * S); ctx.scale(S, S);
      if (sd.drawCup) sd.drawCup(ctx, P, !!sd.full);
      ctx.restore();
      this.sleeve(ctx, K, [[0.2, top - 0.05], held.e, h], 0.085, false);
      this.hand(ctx, K, h[0], h[1], held.ang, held.open, -1, held.size);
    }
  },
  // turning, a angle (0 face on, PI/2 side on, facing +x, mirrored by c.runDir): it turns as a solid thing turns, on the
  // spot, its body keeping its width (the front of it going round to the side, the far leg and arm going round behind it),
  // its legs going over into its stride and the skirt of its coat out behind as it comes side on. Its head stays turned to
  // you, as it does running. At either end it is the front (drawFront, as it stands there) and the side (drawRun).
  drawTurn(ctx, c, P, a) {
    const K = this.pal(P), near = clamp(1 - c.dist / 8, 0, 1), ca = Math.cos(a), sn = Math.sin(a), q = a / (Math.PI / 2);
    const dir = c.runDir || 1, g = c.runGait || 0, amt = c.runAmt === undefined ? 1 : c.runAmt, k = amt * q;
    const X = (x, z) => x * ca + z * sn;   // where a point of it shows across the view: x across its body, z forward from it
    const hop = this.hop(g), by = 0.1 * k * hop, hipY = CUST.HIP + by, top = CUST.TOP + by;
    const pressF = smoothstep((7.6 - c.dist) / 1.4), r = pressF * (1 - q);   // the hands up toward the glass as it comes face on
    const tilt = this.tilt(c.t, lerp(lerp(0.22, 0.4, pressF), 0.25, q));
    ctx.save(); ctx.scale(dir, 1);
    // the head's frame, the mirror undone in it: the neck where it is on the body, laid over less the more it is side on
    const neck = () => { ctx.translate(0.01 * q, top); ctx.scale(dir, 1); ctx.rotate(tilt * 0.35 * (1 - q)); };
    const headFrame = () => { neck(); ctx.translate(0, 0.07); ctx.rotate(tilt * (0.65 + 0.35 * q)); ctx.translate(0, 0.11); };
    // a leg: from its hip (s -1 the near side, +1 the far side going round behind), into the stride as it comes side on
    const drawLeg = s => {
      const l = this.runLeg(g, s > 0 ? Math.PI : 0, k, hipY), hx = s * 0.085;
      const kx = X(hx * 1.03, l.kx), fx = X(hx * 1.06, l.fx), sa = l.sa * q;
      P_limb(ctx, [[X(hx, 0), hipY], [kx, l.ky], [fx, l.fy]], 0.11, s > 0 && q > 0.5 ? K.trousersS : K.trousers);
      P_ell(ctx, fx + Math.cos(l.sa) * 0.04 * sn + s * 0.01 * ca, l.fy + Math.sin(l.sa) * 0.04 * q - 0.006, lerp(0.074, 0.084, sn), lerp(0.04, 0.036, q), K.shoe, sa + s * 0.1 * (1 - q));
    };
    // an arm: hanging straight from the shoulder, or up toward the glass as it comes face on (r)
    const drawArm = s => {
      const P3 = (hx, hy, hz, ux, uy, uz) => [X(lerp(hx, ux, r) * s, lerp(hz, uz, r)), lerp(hy, uy, r) + by];
      const sh = [X(s * 0.2, -0.015), top - 0.05], e = P3(0.245, 1.2, -0.005, 0.4, 1.42, 0.08), h = P3(0.255, 0.9, 0, 0.22, 1.66, 0.1);
      this.sleeve(ctx, K, [sh, e, h], lerp(0.085, 0.08, q), s > 0 && q > 0.5);
      this.hand(ctx, K, h[0], h[1], lerp(Math.atan2(h[1] - e[1], h[0] - e[0]), Math.PI / 2 + s * 0.1, r), r, -s, 1);
    };
    const farFirst = a > 0.35;
    if (farFirst) drawArm(1);
    drawLeg(1); drawLeg(-1);
    // the body: its width as it turns (wider face on than side on, never less), face on in shape until half way, then side
    // on, its skirt going out behind
    const A = 0.235, B = 0.15, W = Math.hypot(A * ca, B * sn);
    const front = [[-0.07, top + 0.03], [-0.2, top], [-0.235, top - 0.07], [-0.215, top - 0.3], [-0.19, 1.05 + by], [-0.215, 0.85 + by], [-0.25, 0.52 + by], [-0.04, 0.5 + by], [0, 0.52 + by], [0.04, 0.5 + by], [0.25, 0.52 + by], [0.215, 0.85 + by], [0.19, 1.05 + by], [0.215, top - 0.3], [0.235, top - 0.07], [0.2, top], [0.07, top + 0.03]];
    P_poly(ctx, q < 0.5 ? front.map(([x, y]) => [x * W / A, y]) : this.sidePoly(top, by, (0.3 + 0.7 * amt) * q).map(([x, y]) => [x * W / B, y]), K.coat);
    // its front going round toward the way it turns, and then the coat as it shows side on
    if (a < 1.25) {
      const zf = 0.13, F = x => X(x, zf * Math.sqrt(Math.max(0, 1 - (x / 0.235) ** 2)));   // on the round of its front
      ctx.save(); ctx.globalAlpha = clamp((1.25 - a) / 0.3, 0, 1);
      this.coatFront(ctx, K, F, top, by);
      ctx.restore();
    }
    if (q >= 0.5 && a > 0.95) { ctx.save(); ctx.globalAlpha = clamp((a - 0.95) / 0.3, 0, 1); this.coatSide(ctx, K, top, by, W / B); ctx.restore(); }
    drawArm(-1);
    if (!farFirst) drawArm(1);
    // the neck and the head, turned to you, and the collar up round it
    ctx.save(); neck(); P_line(ctx, 0, 0, 0, 0.1, 0.05, K.shade); ctx.restore();
    ctx.save(); headFrame(); this.drawHead(ctx, c, P, K, near, 0, false, this.chomp(c, true)); ctx.restore();
    this.drawCollar(ctx, K, top, x => X(x, 0.03));
    ctx.restore();
  },
  // running, seen from the side: it skips, step and hop on one foot and step and hop on the other, the free knee coming up
  // high in front and the body bouncing up off the ground with every hop; but the body is bolt upright and dead still on
  // its legs, and the arms hang straight down at its sides and do not swing at all. The skirt of its coat flies out
  // behind it. Its head does not run with it: it is turned to you, laid over, the hat's brim and the mouth under it on you
  // the whole way. Drawn facing +x and mirrored by c.runDir; c.runAmt 0 is standing side on, 1 flat out.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, k = c.runAmt === undefined ? 1 : c.runAmt, near = clamp(1 - c.dist / 8, 0, 1), K = this.pal(P);
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const hop = this.hop(g), by = 0.1 * k * hop, hipY = CUST.HIP + by, top = CUST.TOP + by;
    const leg = o => this.runLeg(g, o, k, hipY);
    const legs = [leg(0), leg(Math.PI)];
    const drawLeg = (l, col) => {
      P_limb(ctx, [[0, hipY], [l.kx, l.ky], [l.fx, l.fy]], 0.105, col);
      P_ell(ctx, l.fx + Math.cos(l.sa) * 0.04, l.fy + Math.sin(l.sa) * 0.04 - 0.006, 0.084, 0.036, K.shoe, l.sa);
    };
    // an arm: straight down from the shoulder, stiff, not swinging
    const drawArm = (dx, dark) => {
      const sh = [dx, top - 0.05], h = [dx + 0.02, top - 0.62];
      this.sleeve(ctx, K, [sh, [dx + 0.012, top - 0.33], h], 0.08, dark);
      this.hand(ctx, K, h[0], h[1], -Math.PI / 2 + 0.05, 0, 1, 1);
    };
    drawArm(-0.03, true); drawLeg(legs[1], K.trousersS);   // the far side first
    drawLeg(legs[0], K.trousers);
    // the coat, side on, belted, its skirt flying out behind
    P_poly(ctx, this.sidePoly(top, by, 0.3 + 0.7 * k), K.coat);
    this.coatSide(ctx, K, top, by, 1);
    drawArm(0.0, false);
    // the neck, and the head on it turned to you and laid over; the face is undone by the mirror so it is the same face
    // whichever way it runs
    const tilt = this.tilt(c.t, 0.25);
    ctx.save(); ctx.translate(0.01, top);
    P_line(ctx, 0, 0, 0, 0.1, 0.05, K.shade);
    ctx.translate(0, 0.07); ctx.scale(c.runDir || 1, 1); ctx.rotate(tilt); ctx.translate(0, 0.11);
    this.drawHead(ctx, c, P, K, near, 0, false, this.chomp(c, true));
    ctx.restore();
    this.drawCollar(ctx, K, top, x => x * 0.7 + 0.01);
    ctx.restore();
  },
};
