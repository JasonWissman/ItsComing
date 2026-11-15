'use strict';
// The customer: the size of a child, and made like one: short, with a head too big for it. It is dressed up like a little
// man for dinner: a black suit, jacket and trousers, trimmed in red (red edging the lapels, the front and the hem of the
// jacket, a red line for each pocket, a red band round each cuff and red piping down the outer seam of each trouser leg), a
// white shirt with its collar points showing at the neck and a little of its cuffs at the wrists, a red tie, and little
// black shoes. Its small bare hands hang at its sides. From the neck up it is black: a black neck, and a black face with long
// straggly black hair hanging down over it and over its shoulders. In the black are two huge round staring eyes, white and
// blank, red-rimmed, and under them a grin from one side of the face to the other, two rows of big square white teeth
// clenched together. Whenever it is on the move the grin will not stay shut: the jaw drops and snaps the teeth together
// again, and again, in hungry, greedy fits and starts, as if it can already taste what it is coming for; standing still, it
// settles back into the grin.
// It does not move the way anything else does. It stands bolt upright and dead still: nothing bobs, nothing sways, the
// arms never swing. It comes on in small stiff steps, its legs straight, its feet barely leaving the ground; and every so
// often the feet stop altogether and it keeps coming anyway, sliding over the ground standing quite still. Only its head
// moves, and slowly: it lays itself over to one side, holds there, and lays itself over to the other; nearer the glass it
// lays itself further over. Near the glass its hands come up and press flat on it either side of its face. Coming at you
// the grin comes apart: the jaw drops away far further than a jaw goes, the teeth top and bottom, the eyes wider still.
// It is drawn to light, and it does not care whether you look at it. While the place it is coming for is lit it comes
// fast; in the dark it walks at an ordinary pace. The night sets c.drawn (whether its light is on) and c.drawnMult (how
// much faster the light makes it) every frame.
// A night can send it sideways, running (The Diner, from a shut window to one still open): c.runPose on, c.runTurn 0..1
// as it turns side on and back (it pivots on the spot, stiffly, a solid figure keeping its width as it goes round), c.runDir +1 running to
// the right of the view and -1 to the left, c.runGait its stride and c.runAmt 0..1 how hard it is running. It runs as a
// child does when it is happy: it skips, step and hop, step and hop, the knee coming up high, its hair flying out behind;
// but its body stays bolt upright, its arms hang dead straight at its sides, and its head stays turned to you, grinning.
// A night can also put its hands on the bottom edge of a shutter (The Diner): c.shove { k 0..1 its hands coming up to it,
// h the edge's height in its own metres from its feet, up 0..1 shoving it up }; its body lifts with c.yOff if it hangs.
CREATURES.customer = {
  name: 'the customer', h: 1.3, w: 0.7, faceY: 1.08, stepRate: 1.6, catchDist: 1.5, sound: 'shoes', ignoresGaze: true,
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
    // the face and the hair take no light at all: black in the diner's light as in the dark (only the fog lies over them)
    const unlit = c => rgba(mixc(c, P.fogColor || [0, 0, 0], P.fog || 0));
    return {
      // the black suit (its folds a dull sheen on the black), the red of its trim and its tie, the white shirt
      suit: P.col([30, 28, 34]), suitS: P.col([20, 19, 23]), suitD: P.col([13, 12, 15]), fold: P.cola([92, 90, 106], 0.45), lapel: P.col([40, 38, 46]),
      trim: P.col([184, 24, 32]), trimD: P.col([112, 14, 20]), tie: P.col([196, 26, 34]), tieD: P.col([122, 12, 18]),
      shirt: P.col([228, 224, 214]), shirtD: P.col([164, 160, 152]),
      skin: P.col([176, 170, 162]), skinD: P.col([126, 120, 114]),
      black: unlit([3, 2, 4]), hair: unlit([13, 12, 15]), hairL: P.cola([40, 38, 46], 0.8), shoe: P.col([12, 11, 13]), lace: P.col([74, 72, 82]),
      white: P.col([244, 240, 230]), rim: P.col([150, 18, 22]), rimA: P.cola([130, 8, 12], 0.55),
      teeth: P.col([240, 234, 216]), teethD: P.col([96, 88, 76]), gum: P.col([110, 16, 20]), throat: unlit([30, 3, 5]),
    };
  },
  draw(ctx, c, P) {
    // its breath (every standing thing is drawn breathing) is held while it has hold of a shutter: its hands stay on the edge
    if (c.shove && !c.dead && !c.lunge) ctx.scale(1, 1 / (1 + 0.014 * Math.sin(c.t * 1.6)));
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
    const L1 = 0.235, L2 = 0.235, u = (((g + o) / TAU) % 1 + 1) % 1;
    let th, ph;
    if (u < 0.5) { const v = u / 0.5; th = lerp(0.35, -0.5, v); ph = 0.08 + 0.3 * Math.sin(Math.PI * v); }
    else { const v = (u - 0.5) / 0.5; th = v < 0.55 ? lerp(-0.5, 1.15, smoothstep(v / 0.55)) : lerp(1.15, 0.35, smoothstep((v - 0.55) / 0.45)); ph = 0.08 + 1.55 * Math.sin(Math.PI * v); }
    th *= k; ph *= k;
    const kx = Math.sin(th) * L1, ky = hipY - Math.cos(th) * L1, sa = th - ph;
    return { kx, ky, fx: kx + Math.sin(sa) * L2, fy: ky - Math.cos(sa) * L2, sa };
  },
  // a sleeve from the shoulder through the elbow to the wrist: black, a red band round the cuff and the white of the shirt's
  // cuff showing past it at the wrist (dark: the far arm, in its own shadow)
  sleeve(ctx, K, pts, w, dark) {
    P_limb(ctx, pts, w, dark ? K.suitD : K.suit);
    const a = pts[pts.length - 2], b = pts[pts.length - 1], n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / n, uy = (b[1] - a[1]) / n;
    P_line(ctx, b[0] - ux * 0.036, b[1] - uy * 0.036, b[0] - ux * 0.014, b[1] - uy * 0.014, w * 1.1, dark ? K.trimD : K.trim);
    P_line(ctx, b[0] - ux * 0.014, b[1] - uy * 0.014, b[0] + ux * 0.004, b[1] + uy * 0.004, w * 0.86, dark ? K.shirtD : K.shirt);
  },
  // the jacket's front, face on, in the body's frame (its top at top, by the hop): F(x) is where a point x across its front
  // shows (x itself face on; round the curve of its chest as it turns) and m the side its breast pocket is on. The shirt in
  // the V of the lapels, the collar points, the red tie, the lapels edged in red down to the one button, the fronts parting
  // below it onto the trousers, the hem, the pockets, a dull sheen on the folds of the black
  suitFront(ctx, K, F, top, by, m) {
    const Y = y => y + by, pt = (x, y) => [F(x), Y(y)];
    P_poly(ctx, [pt(0, 0.6), pt(0.046, 0.43), pt(-0.046, 0.43)], K.suitD);   // the fronts parting onto the trousers
    P_line(ctx, F(0), Y(0.58), F(0), Y(0.44), 0.005, K.fold);
    P_poly(ctx, [[F(-0.052), top + 0.012], [F(0.052), top + 0.012], pt(0, 0.6)], K.shirt);   // the shirt
    P_poly(ctx, [[F(-0.009), top - 0.02], [F(0.009), top - 0.02], pt(0.024, 0.655), pt(0, 0.632), pt(-0.024, 0.655)], K.tie);   // the tie
    P_line(ctx, F(0.002), top - 0.03, F(0.004), Y(0.645), 0.004, K.tieD);
    for (const s of [-1, 1]) P_poly(ctx, [[F(s * 0.006), top - 0.004], [F(s * 0.05), top + 0.016], [F(s * 0.036), top - 0.042]], K.shirt);   // its collar points
    P_poly(ctx, [[F(-0.018), top + 0.008], [F(0.018), top + 0.008], [F(0.011), top - 0.022], [F(-0.011), top - 0.022]], K.tie);   // the knot
    for (const s of [-1, 1]) {   // the lapels, edged in red; the jacket's front below the button, and its hem, edged in red
      const lap = [[F(s * 0.05), top + 0.014], pt(s * 0.004, 0.6), pt(s * 0.068, 0.74), pt(s * 0.1, 0.805), pt(s * 0.074, 0.82), [F(s * 0.08), top + 0.004]];
      P_poly(ctx, lap, K.lapel);
      P_limb(ctx, lap.slice(0, 5), 0.008, K.trim);
      P_limb(ctx, [pt(s * 0.004, 0.6), pt(s * 0.03, 0.5), pt(s * 0.046, 0.428), pt(s * 0.1, 0.44), pt(s * 0.156, 0.46)], 0.008, K.trim);
      P_line(ctx, F(s * 0.085), Y(0.52), F(s * 0.14), Y(0.53), 0.007, K.trim);   // a pocket each side
    }
    P_ell(ctx, F(0.006), Y(0.592), 0.011, 0.011, K.trim);   // the button
    P_line(ctx, F(m * 0.088), Y(0.725), F(m * 0.135), Y(0.73), 0.007, K.trim);   // the breast pocket
    P_poly(ctx, [[F(m * 0.096), Y(0.727)], [F(m * 0.104), Y(0.752)], [F(m * 0.114), Y(0.736)], [F(m * 0.124), Y(0.75)], [F(m * 0.128), Y(0.728)]], K.tie);   // a red handkerchief in it
    for (const f of [[[-0.14, 0.64], [-0.1, 0.6], [-0.07, 0.62]], [[0.09, 0.56], [0.13, 0.52]], [[-0.12, 0.54], [-0.07, 0.5]]]) P_limb(ctx, f.map(([x, y]) => pt(x, y)), 0.005, K.fold);
  },
  // the suit seen side on, facing +x, in the body's frame (sx its width as it turns, 1 side on): the white of the shirt and
  // the red tie down the front of its chest, the lapel's red edge down to the button and the jacket's front and hem edged
  // in red, a pocket
  suitSide(ctx, K, top, hipY, sx) {
    const pt = (x, y) => [x * sx, y];
    P_poly(ctx, [pt(0.02, top + 0.012), pt(0.064, top + 0.002), pt(0.1, top - 0.11), pt(0.084, top - 0.11), pt(0.05, top - 0.03)], K.shirt);
    P_limb(ctx, [pt(0.064, top - 0.006), pt(0.098, top - 0.1), pt(0.118, top - 0.215)], 0.022, K.tie);
    P_limb(ctx, [pt(0.0, top + 0.004), pt(0.058, top - 0.11), pt(0.112, top - 0.24), pt(0.122, top - 0.28), pt(0.1, hipY - 0.05), pt(0.0, hipY - 0.1), pt(-0.11, hipY - 0.05)], 0.008, K.trim);
    P_line(ctx, -0.04 * sx, top - 0.3, 0.04 * sx, top - 0.29, 0.007, K.trim);
    P_limb(ctx, [pt(-0.06, top - 0.2), pt(-0.02, top - 0.24), pt(0.03, top - 0.22)], 0.005, K.fold);
  },
  // the mouth's hunger, 0 the grin shut to 1 its jaw dropped as far as a bite takes it, at time t: it comes in fits, a beat
  // of about 0.42 s holding now nothing, now one greedy bite (dropping open and snapping shut, at a depth and a pace of its
  // own), now two quick snaps one on the other
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
  // how far its jaw is dropped by its hunger now (on: whether it is on the move): the bites come on as it moves and die away
  // as it stops (eased over its own time, c.t, from one drawing to the next; drawn first, or after a long while, it is
  // as it is now); with reduced motion only a small working of the jaw
  chomp(c, on) {
    const dt = c.mouthT === undefined || c.t < c.mouthT ? 1 : Math.min(1, c.t - c.mouthT);
    c.mouthT = c.t; c.mouthK = (c.mouthK || 0) + ((on ? 1 : 0) - (c.mouthK || 0)) * Math.min(1, dt * (on ? 6 : 4));
    const rm = typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.settings.reducedMotion ? 0.25 : 1;
    return 0.5 * rm * c.mouthK * this.bite(c.t);
  },
  // a small hand at (x, y) off the wrist, pointing along ang: open 0 hanging loose, the fingers curled in; 1 spread flat
  hand(ctx, K, x, y, ang, open, s, size) {
    const z = size || 1, ca = Math.cos(ang), sa = Math.sin(ang);
    const px = x + ca * 0.022 * z, py = y + sa * 0.022 * z;
    P_ell(ctx, px, py, 0.026 * z, 0.03 * z, K.skin, ang - Math.PI / 2);
    ctx.strokeStyle = K.skin; ctx.lineWidth = 0.011 * z; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5, a = ang + o * lerp(0.1, 0.32, open), l = (0.036 + 0.012 * open) * z * (o * o > 1 ? 0.82 : 1);
      const bx = px + ca * 0.024 * z - sa * o * 0.011 * z, by = py + sa * 0.024 * z + ca * o * 0.011 * z;
      const mx = bx + Math.cos(a) * l * 0.55, my = by + Math.sin(a) * l * 0.55, b = a - s * lerp(1.3, 0.1, open);
      ctx.moveTo(bx, by); ctx.lineTo(mx, my); ctx.lineTo(mx + Math.cos(b) * l * 0.45, my + Math.sin(b) * l * 0.45);
    }
    const ta = ang + s * lerp(0.5, 1.0, open);   // the thumb
    ctx.moveTo(px + sa * s * 0.012 * z, py - ca * s * 0.012 * z); ctx.lineTo(px + Math.cos(ta) * 0.034 * z, py + Math.sin(ta) * 0.034 * z);
    ctx.stroke();
    P_line(ctx, px - sa * 0.006 * z, py + ca * 0.006 * z, px + ca * 0.012 * z, py + sa * 0.012 * z, 0.006 * z, K.skinD);   // the crease of the palm
  },
  // one huge round eye at (x, y), r across: a red smudge round it, the red rim, and the white, blank, with nothing in it
  eye(ctx, K, x, y, r) {
    P_ell(ctx, x, y, r * 1.42, r * 1.38, K.rimA);
    P_ell(ctx, x, y, r * 1.14, r * 1.14, K.rim);
    P_ell(ctx, x, y, r, r, K.white);
  },
  // the grin: corners at (+-mw, cy), the top edge dU below them in the middle and the bottom dL, each a curve up into the
  // corners; a row of big square teeth hanging from the top and one standing on the bottom, th deep, meeting in the middle
  // when it is shut; open (dL much deeper, and round squaring the bottom off), dark between them
  grin(ctx, K, mw, cy, dU, dL, th, round) {
    const r = round || 0, yU = u => cy + dU * (1 - u * u), yL = u => cy + dL * ((1 - r) * (1 - u * u) + r * (1 - u * u * u * u)), N = 18;
    const path = () => {
      ctx.beginPath();
      for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, yU(u)); }
      for (let i = N; i >= 0; i--) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, yL(u)); }
      ctx.closePath();
    };
    ctx.save();
    path(); ctx.strokeStyle = K.gum; ctx.lineWidth = 0.009; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = K.throat; ctx.fill();
    path(); ctx.clip();
    const band = (y, dir) => {   // a row of teeth: from the edge y(u), dir -1 down from the top, +1 up from the bottom
      ctx.beginPath();
      for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, y(u)); }
      for (let i = N; i >= 0; i--) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, y(u) + dir * th * (1 - 0.45 * u * u)); }
      ctx.closePath(); ctx.fillStyle = K.teeth; ctx.fill();
      ctx.strokeStyle = K.teethD; ctx.lineWidth = 0.0045; ctx.beginPath();
      for (let i = -4; i <= 4; i++) {   // the gaps between them, narrower toward the corners
        const u = Math.sin(i / 4.6 * Math.PI / 2) + (dir > 0 ? 0.04 : 0);
        ctx.moveTo(u * mw, y(u) - dir * 0.01); ctx.lineTo(u * mw, y(u) + dir * th * (1 - 0.45 * u * u));
      }
      ctx.stroke();
      ctx.beginPath();   // the biting edge, a little shadow along it
      for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N; ctx.lineTo(u * mw, y(u) + dir * th * (1 - 0.45 * u * u)); }
      ctx.lineWidth = 0.004; ctx.stroke();
    };
    band(yL, 1); band(yU, -1);
    ctx.restore();
  },
  // the head, face on, in its own frame: its middle at (0, 0), 0.115 across and 0.135 up. near 0..1 how near it is, gape
  // 0..1 the grin coming apart, back from behind (only hair), chomp (0..0.5) the jaw dropped by its hunger as it moves
  drawHead(ctx, c, P, K, near, gape, back, chomp) {
    if (back) {
      P_ell(ctx, 0, 0, 0.12, 0.14, K.hair);
      for (const x of [-0.07, -0.025, 0.02, 0.065]) P_limb(ctx, [[x * 0.6, 0.12], [x, 0.02], [x * 1.1, -0.12]], 0.004, K.hairL);
      return;
    }
    // the face and the jaw under it, black; the jaw dropping away as it comes at you, and working as it comes on, hungry
    const jaw = Math.max(gape, chomp || 0);
    P_ell(ctx, 0, 0, 0.115, 0.135, K.black);
    P_ell(ctx, 0, -0.045 - jaw * 0.1, 0.1 + jaw * 0.012, 0.1 + jaw * 0.11, K.black);
    // the eyes, wider the nearer it is and wider still coming at you
    const er = 0.033 + near * 0.003 + gape * 0.012, ey = 0.026 + gape * 0.012;
    for (const s of [-1, 1]) this.eye(ctx, K, s * (0.047 + gape * 0.006), ey, er);
    // the grin, clenched; coming at you it comes apart, the corners pulled further up, the bottom row going down and down.
    // Hungry, the bottom row drops away from the top and snaps back up to it
    const mw = 0.088 + gape * 0.02, cy = -0.034 + gape * 0.012;
    this.grin(ctx, K, mw, cy, -0.024 - gape * 0.006, -0.088 - near * 0.004 - jaw * 0.2, 0.034 + gape * 0.008, Math.max(gape, jaw * 0.6));
    // the fringe over its forehead, ragged, and the hair hanging down either side of the face over its cheeks
    ctx.fillStyle = K.hair; ctx.beginPath();
    ctx.moveTo(-0.128, -0.02); ctx.quadraticCurveTo(-0.14, 0.15, 0, 0.152); ctx.quadraticCurveTo(0.14, 0.15, 0.128, -0.02);
    const tips = [[0.12, -0.06], [0.104, 0.05], [0.094, 0.07], [0.07, 0.078], [0.05, 0.068], [0.03, 0.09], [0.008, 0.07], [-0.014, 0.094], [-0.036, 0.074], [-0.058, 0.084], [-0.08, 0.07], [-0.1, 0.066], [-0.108, 0.04], [-0.124, -0.07]];
    for (let i = 0; i < tips.length; i++) { const [x, y] = tips[i], ny = i % 2 ? 0.012 : 0; ctx.lineTo(x, y + ny); }
    ctx.closePath(); ctx.fill();
    for (const s of [-1, 1]) {   // the locks down the sides of the face, a few loose strands across the cheek
      P_poly(ctx, [[s * 0.128, 0.04], [s * 0.096, 0.03], [s * 0.1, -0.06], [s * 0.112, -0.14], [s * 0.13, -0.08]], K.hair);
      P_limb(ctx, [[s * 0.1, 0.05], [s * 0.092, -0.02], [s * 0.098, -0.1]], 0.005, K.hair);
    }
    for (const [x0, x1] of [[-0.07, -0.09], [-0.02, -0.03], [0.03, 0.04], [0.08, 0.1]]) P_limb(ctx, [[x0 * 0.5, 0.145], [x0, 0.11], [x1, 0.075]], 0.0035, K.hairL);
  },
  // the long hair behind the head, hanging past its shoulders in straggly points, in the head's frame; flow (0..1) streams
  // it out behind (toward -x) as it runs, lag dropping its ends a little after a hop
  drawHair(ctx, K, flow, lag) {
    const f = flow || 0, dy = lag || 0;
    const tips = [[0.15, -0.3], [0.13, -0.42], [0.11, -0.34], [0.085, -0.46], [0.06, -0.36], [-0.06, -0.36], [-0.085, -0.47], [-0.11, -0.35], [-0.135, -0.44], [-0.155, -0.3]];
    ctx.fillStyle = K.hair; ctx.beginPath();
    ctx.moveTo(-0.13, 0.04); ctx.quadraticCurveTo(-0.135, 0.165, 0, 0.165); ctx.quadraticCurveTo(0.135, 0.165, 0.13, 0.04);
    for (const [x, y] of tips) {
      const k = clamp(-y / 0.46, 0, 1);   // the further down, the further it flies out behind
      ctx.lineTo(x * (1 - f * 0.4) - f * k * 0.34, y * (1 - f * 0.45) + f * k * 0.06 - dy * k);
    }
    ctx.closePath(); ctx.fill();
    for (const x of [-0.12, -0.06, 0.06, 0.12]) P_limb(ctx, [[x * 0.6, 0.1], [x, -0.05], [x * 1.05 - f * 0.25, -0.28 * (1 - f * 0.4) - dy]], 0.004, K.hairL);
  },
  drawFront(ctx, c, P) {
    const t = c.t, near = clamp(1 - c.dist / 8, 0, 1), lunge = c.lunge || 0, K = this.pal(P);
    // at a shutter part way down (c.shove, set by the night): k how far its hands have come up to the bottom edge of it, h
    // how high that is (in its own metres, from its feet: the edge as seen from your eye), up 0..1 the shove
    const sv = c.shove && !lunge ? c.shove : null, grip = sv ? sv.k : 0, heave = sv ? sv.up : 0;
    const back = !!c.away && !lunge, gape = Math.max(smoothstep(lunge * 1.5), 0.3 * heave);
    // the walk: small stiff steps on straight legs, a foot barely lifting; now and then the feet stop and it slides on
    const st = c.moving ? 1 - this.glide(t) : 0, g = c.gait;
    const press = lunge ? 0 : smoothstep((7.6 - c.dist) / 1.4);   // at the glass, the hands up and flat on it
    const reach = smoothstep(lunge * 1.6);
    // the head: laid slowly over and back, further at the glass; it comes upright and at you as it lunges
    const tilt = this.tilt(t, lerp(0.26, 0.5, press)) * (1 - reach * 0.7) * (1 - heave * 0.6);
    const hk = 1.12 + lunge * 0.3, nk = [0, 0.86];
    const headFrame = () => { ctx.translate(nk[0], nk[1]); ctx.rotate(tilt * 0.35); ctx.translate(0, 0.11); ctx.rotate(tilt * 0.65); ctx.translate(0, 0.12); ctx.scale(hk, hk); };
    // its long hair, behind it all
    ctx.save(); headFrame(); this.drawHair(ctx, K, 0, 0); ctx.restore();
    // the legs: the suit's trousers, a little too long, broken at the ankles over the shoes, red piping down the outer
    // seams; one foot coming up a little at a time
    for (const s of [-1, 1]) {
      const l = Math.max(0, Math.sin(g + (s > 0 ? Math.PI : 0))) * 0.03 * st;
      P_limb(ctx, [[s * 0.075, 0.5], [s * 0.078, 0.28], [s * 0.08, 0.09 + l]], 0.125, K.suit);
      P_line(ctx, s * 0.128, 0.47, s * 0.13, 0.12 + l, 0.008, K.trim);   // the piping down its outer seam
      P_ell(ctx, s * 0.083, 0.11 + l, 0.074, 0.03, K.suitS);           // broken at the ankle
      P_ell(ctx, s * 0.09, 0.035 + l, 0.058, 0.034, K.shoe, s * 0.12);
      P_line(ctx, s * 0.07, 0.05 + l, s * 0.1, 0.06 + l, 0.006, K.lace);
      for (const [a, b, d] of [[0.3, 0.26, 0.03], [0.2, 0.17, -0.02]]) P_line(ctx, s * (0.04 + d), a + l * 0.5, s * (0.09 + d), b + l * 0.5, 0.005, K.fold);
    }
    // the body: the jacket, buttoned, on the shirt and the tie, open at the collar onto the black neck (from behind, only
    // its seam and its hem)
    const top = 0.86;
    P_poly(ctx, [[-0.05, top + 0.012], [-0.15, top - 0.01], [-0.172, top - 0.08], [-0.166, 0.62], [-0.155, 0.46], [-0.05, 0.41], [0, 0.43], [0.05, 0.41], [0.155, 0.46], [0.166, 0.62], [0.172, top - 0.08], [0.15, top - 0.01], [0.05, top + 0.012]], K.suit);
    if (!back) this.suitFront(ctx, K, x => x, top, 0, 1);
    else { P_line(ctx, 0, top - 0.02, 0, 0.44, 0.006, K.fold); P_limb(ctx, [[-0.155, 0.46], [-0.05, 0.42], [0.05, 0.42], [0.155, 0.46]], 0.008, K.trim); }
    // the arms: hanging dead still at its sides, never swinging; at the glass they come up, the elbows out, and the palms
    // press flat either side of its face; coming at you they reach for your face. At a shutter not yet down they go to the
    // bottom edge of it, wherever it is (the arms stretching as far as they must), and the fingers curl up round it.
    for (const s of [-1, 1]) {
      const sh = [s * 0.152, top - 0.04];
      const hang = { e: [s * 0.18, 0.64], h: [s * 0.182, 0.45] };
      const up = { e: [s * 0.3, 0.8], h: [s * 0.225, 1.05] };
      const at = { e: [s * 0.26, 0.98], h: [s * 0.19, 1.15] };
      const r = Math.max(press, reach), U = reach > press ? at : up;
      let e = [lerp(hang.e[0], U.e[0], r), lerp(hang.e[1], U.e[1], r)], h = [lerp(hang.h[0], U.h[0], r), lerp(hang.h[1], U.h[1], r)];
      let ang = lerp(Math.atan2(h[1] - e[1], h[0] - e[0]), Math.PI / 2 + s * (0.1 + reach * 0.25), r), open = Math.max(press, reach), size = 1 + reach * 0.5;
      if (grip > 0) {   // the wrist under the edge, the hand pointing straight up to it, the elbow out
        const wy = sv.h - 0.095, G = { e: [s * lerp(0.27, 0.22, heave), (sh[1] + wy) / 2], h: [s * 0.12, wy] };
        e = [lerp(e[0], G.e[0], grip), lerp(e[1], G.e[1], grip)]; h = [lerp(h[0], G.h[0], grip), lerp(h[1], G.h[1], grip)];
        ang = lerp(ang, Math.PI / 2, grip); open = lerp(open, 0.15, grip); size = lerp(size, 1.4, grip);
      }
      this.sleeve(ctx, K, [sh, e, h], 0.062, false);
      this.hand(ctx, K, h[0], h[1], ang, open, -s, size);
    }
    // the neck, thin and black, and the head on it
    ctx.save(); ctx.translate(nk[0], nk[1]); ctx.rotate(tilt * 0.35); P_line(ctx, 0, 0, 0, 0.12, 0.045, K.black); ctx.restore();
    // hungry: its jaw working as it comes on (not while it has hold of a shutter); coming at you, the bite gapes wide
    const chomp = this.chomp(c, !!c.moving && !sv && !back);
    ctx.save(); headFrame(); this.drawHead(ctx, c, P, K, near, gape, back, chomp); ctx.restore();
    // the hair that hangs in front of its shoulders, down onto its chest
    if (!back) {
      ctx.save(); headFrame();
      for (const s of [-1, 1]) {
        P_poly(ctx, [[s * 0.112, 0.0], [s * 0.134, 0.0], [s * 0.15, -0.18], [s * 0.145, -0.36], [s * 0.136, -0.27], [s * 0.128, -0.4], [s * 0.118, -0.22]], K.hair);
        P_limb(ctx, [[s * 0.11, -0.04], [s * 0.106, -0.2], [s * 0.112, -0.31]], 0.006, K.hair);   // a loose strand
        P_limb(ctx, [[s * 0.128, -0.02], [s * 0.138, -0.18], [s * 0.136, -0.32]], 0.004, K.hairL);
      }
      ctx.restore();
    }
  },
  // turning, a angle (0 face on, PI/2 side on, facing +x, mirrored by c.runDir): it turns as a solid thing turns, on the
  // spot, its body keeping its width (the front of it going round to the side, the far leg and arm going round behind it),
  // its legs going over into its stride and its hair out behind as it comes side on. Its head stays turned to you, as it
  // does running. At either end it is the front (drawFront, as it stands there) and the side (drawRun).
  drawTurn(ctx, c, P, a) {
    const K = this.pal(P), near = clamp(1 - c.dist / 8, 0, 1), ca = Math.cos(a), sn = Math.sin(a), q = a / (Math.PI / 2);
    const dir = c.runDir || 1, g = c.runGait || 0, amt = c.runAmt === undefined ? 1 : c.runAmt, k = amt * q;
    const X = (x, z) => x * ca + z * sn;   // where a point of it shows across the view: x across its body, z forward from it
    const hop = this.hop(g), by = 0.08 * k * hop, hipY = 0.5 + by, top = 0.86 + by;
    const pressF = smoothstep((7.6 - c.dist) / 1.4), r = pressF * (1 - q);   // the hands up toward the glass as it comes face on
    const tilt = this.tilt(c.t, lerp(lerp(0.26, 0.5, pressF), 0.3, q)), hk = lerp(1.12, 1, q);
    ctx.save(); ctx.scale(dir, 1);
    // the head's frame, the mirror undone in it: the neck where it is on the body, laid over less the more it is side on
    const neck = () => { ctx.translate(0.01 * q, top); ctx.scale(dir, 1); ctx.rotate(tilt * 0.35 * (1 - q)); };
    const headFrame = () => { neck(); ctx.translate(0, 0.11); ctx.rotate(tilt * (0.65 + 0.35 * q)); ctx.translate(0, 0.12); ctx.scale(hk, hk); };
    // the long hair, behind it all, going out behind as it comes side on (in the mirrored frame, so behind is -x)
    ctx.save(); ctx.translate(0.01 * q, top); ctx.rotate(dir * tilt * 0.35 * (1 - q)); ctx.translate(0, 0.11); ctx.rotate(dir * tilt * 0.65 * (1 - q)); ctx.translate(0, 0.12); ctx.scale(hk, hk);
    this.drawHair(ctx, K, (0.3 + 0.7 * amt) * q, (0.5 - hop) * 0.06 * k); ctx.restore();
    // a leg: from its hip (s -1 the near side, +1 the far side going round behind), into the stride as it comes side on
    const drawLeg = s => {
      const l = this.runLeg(g, s > 0 ? Math.PI : 0, k, hipY), hx = s * 0.075;
      const kx = X(hx * 1.04, l.kx), fx = X(hx * 1.07, l.fx), sa = l.sa * q;
      P_limb(ctx, [[X(hx, 0), hipY], [kx, l.ky], [fx, l.fy]], lerp(0.125, 0.115, q), K.suit);
      if (s > 0 && q > 0.05) { ctx.save(); ctx.globalAlpha = q; P_limb(ctx, [[X(hx, 0), hipY], [kx, l.ky], [fx, l.fy]], 0.115, K.suitD); ctx.restore(); }
      // the piping down its outer seam, going round to the middle of the near leg side on, and out of sight on the far one
      const ps = X(s * 0.128, 0), pk = X(s * 0.13, l.kx), pf = X(s * 0.132, l.fx);
      ctx.save(); if (s > 0) ctx.globalAlpha = 1 - q;
      P_limb(ctx, [[lerp(ps, pk, 0.35), lerp(hipY, l.ky, 0.35)], [pk, l.ky], [lerp(pf, pk, 0.38), lerp(l.fy, l.ky, 0.38)]], 0.008, K.trim);
      ctx.restore();
      P_ell(ctx, fx + Math.cos(l.sa) * 0.035 * sn + s * 0.01 * ca, l.fy + Math.sin(l.sa) * 0.035 * q - 0.005, lerp(0.058, 0.068, sn), lerp(0.034, 0.032, q), K.shoe, sa + s * 0.12 * (1 - q));
      P_ell(ctx, fx - Math.sin(l.sa) * 0.03 * sn, l.fy + lerp(0.08, Math.cos(l.sa) * 0.03, q), lerp(0.074, 0.06, q), 0.03, K.suitS, sa);   // broken at the ankle
    };
    // an arm: hanging straight from the shoulder, or up toward the glass as it comes face on (r)
    const drawArm = s => {
      const P3 = (hx, hy, hz, ux, uy, uz) => [X(lerp(hx, ux, r) * s, lerp(hz, uz, r)), lerp(hy, uy, r) + by];
      const sh = [X(s * 0.152, -0.015), top - 0.04], e = P3(0.18, 0.64, -0.005, 0.3, 0.8, 0.08), h = P3(0.182, 0.45, 0, 0.225, 1.05, 0.1);
      this.sleeve(ctx, K, [sh, e, h], lerp(0.062, 0.06, q), s > 0 && q > 0.5);
      this.hand(ctx, K, h[0], h[1], lerp(Math.atan2(h[1] - e[1], h[0] - e[0]), Math.PI / 2 + s * 0.1, r), r, -s, 1);
    };
    const farFirst = a > 0.35;
    if (farFirst) drawArm(1);
    drawLeg(1);
    // the body: its width as it turns (wider face on than side on, never less), face on in shape until half way, then side on
    const A = 0.172, B = 0.1225, W = Math.hypot(A * ca, B * sn);
    const front = [[-0.05, top + 0.012], [-0.15, top - 0.01], [-0.172, top - 0.08], [-0.166, 0.62 + by], [-0.155, 0.46 + by], [-0.05, 0.41 + by], [0, 0.43 + by], [0.05, 0.41 + by], [0.155, 0.46 + by], [0.166, 0.62 + by], [0.172, top - 0.08], [0.15, top - 0.01], [0.05, top + 0.012]];
    const side = [[-0.08, top], [0.06, top], [0.1, top - 0.12], [0.125, top - 0.28], [0.1, hipY - 0.05], [0.0, hipY - 0.1], [-0.11, hipY - 0.05], [-0.12, top - 0.3], [-0.1, top - 0.12]];
    P_poly(ctx, q < 0.5 ? front.map(([x, y]) => [x * W / A, y]) : side.map(([x, y]) => [x * W / B, y]), K.suit);
    drawLeg(-1);
    // its front going round toward the way it turns (the shirt, the tie, the lapels and their red, the button, the pockets:
    // the breast pocket on the same side of it as face on, whichever way it turns), and then the suit as it shows side on
    if (a < 1.25) {
      const zf = 0.11, F = x => X(x, zf * Math.sqrt(Math.max(0, 1 - (x / 0.172) ** 2)));   // on the round of its front
      ctx.save(); ctx.globalAlpha = clamp((1.25 - a) / 0.3, 0, 1);
      this.suitFront(ctx, K, F, top, by, dir);
      ctx.restore();
    }
    if (q >= 0.5 && a > 0.95) { ctx.save(); ctx.globalAlpha = clamp((a - 0.95) / 0.3, 0, 1); this.suitSide(ctx, K, top, hipY, W / B); ctx.restore(); }
    drawArm(-1);
    if (!farFirst) drawArm(1);
    // the neck and the head, turned to you
    ctx.save(); neck(); P_line(ctx, 0, 0, 0, 0.12, 0.045, K.black); ctx.restore();
    ctx.save(); headFrame(); this.drawHead(ctx, c, P, K, near, 0, false, this.chomp(c, true));
    if (q < 0.5) {   // the hair in front of its shoulders, while they are still turned to you
      for (const s of [-1, 1]) {
        P_poly(ctx, [[s * 0.112, 0.0], [s * 0.134, 0.0], [s * 0.15, -0.18], [s * 0.145, -0.36], [s * 0.136, -0.27], [s * 0.128, -0.4], [s * 0.118, -0.22]], K.hair);
        P_limb(ctx, [[s * 0.11, -0.04], [s * 0.106, -0.2], [s * 0.112, -0.31]], 0.006, K.hair);
      }
    }
    ctx.restore();
    ctx.restore();
  },
  // running, seen from the side: it skips, as a child skips, step and hop on one foot and step and hop on the other, the
  // free knee coming up high in front and the body bouncing up off the ground with every hop; but the body is bolt upright
  // and dead still on its legs, and the arms hang straight down at its sides and do not swing at all. The hair flies out
  // behind it. Its head does not run with it: it is turned to you, laid over, the eyes and the grin on you the whole way.
  // Drawn facing +x and mirrored by c.runDir; c.runAmt 0 is standing side on, 1 flat out.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, k = c.runAmt === undefined ? 1 : c.runAmt, near = clamp(1 - c.dist / 8, 0, 1), K = this.pal(P);
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const hop = this.hop(g), by = 0.08 * k * hop, hipY = 0.5 + by, top = 0.86 + by;
    const leg = o => this.runLeg(g, o, k, hipY);
    const legs = [leg(0), leg(Math.PI)];
    const drawLeg = (l, col, near) => {
      P_limb(ctx, [[0, hipY], [l.kx, l.ky], [l.fx, l.fy]], 0.115, col);
      if (near) P_limb(ctx, [[lerp(0, l.kx, 0.35), lerp(hipY, l.ky, 0.35)], [l.kx, l.ky], [lerp(l.fx, l.kx, 0.38), lerp(l.fy, l.ky, 0.38)]], 0.008, K.trim);   // the piping down its seam
      P_ell(ctx, l.fx + Math.cos(l.sa) * 0.035, l.fy + Math.sin(l.sa) * 0.035 - 0.005, 0.068, 0.032, K.shoe, l.sa);
      P_ell(ctx, l.fx - Math.sin(l.sa) * 0.03, l.fy + Math.cos(l.sa) * 0.03, 0.06, 0.03, K.suitS, l.sa);   // broken at the ankle
    };
    // an arm: straight down from the shoulder, stiff, not swinging
    const drawArm = (dx, dark) => {
      const sh = [dx, top - 0.04], h = [dx + 0.015, top - 0.41];
      this.sleeve(ctx, K, [sh, [dx + 0.01, top - 0.22], h], 0.06, dark);
      this.hand(ctx, K, h[0], h[1], -Math.PI / 2 + 0.05, 0, 1, 1);
    };
    // the hair, flying out behind it from the head
    const hy = top + 0.11 + 0.12, lag = (0.5 - hop) * 0.06 * k;
    ctx.save(); ctx.translate(0.01, hy); this.drawHair(ctx, K, 0.3 + 0.7 * k, lag); ctx.restore();
    drawArm(-0.03, true); drawLeg(legs[1], K.suitD);   // the far side first
    // the jacket, side on: round in the belly, the skirt of it over the seat behind, the shirt and the tie down the front
    P_poly(ctx, [[-0.08, top], [0.06, top], [0.1, top - 0.12], [0.125, top - 0.28], [0.1, hipY - 0.05], [0.0, hipY - 0.1], [-0.11, hipY - 0.05], [-0.12, top - 0.3], [-0.1, top - 0.12]], K.suit);
    drawLeg(legs[0], K.suit, true);
    this.suitSide(ctx, K, top, hipY, 1);
    drawArm(0.0, false);
    // the neck, and the head on it turned to you and laid over; the face is undone by the mirror so it is the same face
    // whichever way it runs
    const tilt = this.tilt(c.t, 0.3);
    ctx.translate(0.01, top);
    P_line(ctx, 0, 0, 0, 0.12, 0.045, K.black);
    ctx.translate(0, 0.11); ctx.scale(c.runDir || 1, 1); ctx.rotate(tilt); ctx.translate(0, 0.12);
    this.drawHead(ctx, c, P, K, near, 0, false, this.chomp(c, true));
    ctx.restore();
  },
};
