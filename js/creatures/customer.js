'use strict';
// The customer: the size of a child, and made like one: short, with a head too big for it. It is in a pale button-up
// onesie, rumpled and grubby, the sleeves striped dark and pale round and round to the cuffs, and little dark shoes. Its
// small bare hands hang at its sides. From the neck up it is black: a black neck, and a black face with long straggly black
// hair hanging down over it and over its shoulders. In the black are two huge round staring eyes, white, red-rimmed, each
// with a thin red ring round a pinprick pupil, and under them a grin from one side of the face to the other, two rows of
// big square white teeth clenched together.
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
      suit: P.col([166, 162, 152]), suitS: P.col([124, 120, 112]), suitD: P.col([104, 100, 94]), fold: P.cola([56, 52, 50], 0.65),
      stripe: P.col([26, 24, 28]), cuff: P.col([18, 16, 20]),
      skin: P.col([176, 170, 162]), skinD: P.col([126, 120, 114]),
      black: unlit([3, 2, 4]), hair: unlit([13, 12, 15]), hairL: P.cola([40, 38, 46], 0.8), shoe: P.col([20, 18, 20]), lace: P.col([66, 62, 60]),
      white: P.col([244, 240, 230]), rim: P.col([150, 18, 22]), rimA: P.cola([130, 8, 12], 0.55), ring: P.col([176, 30, 34]), pupil: P.col([10, 4, 4]),
      teeth: P.col([240, 234, 216]), teethD: P.col([96, 88, 76]), gum: P.col([110, 16, 20]), throat: unlit([30, 3, 5]),
      glint: P.raw([255, 252, 244]),
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
  // a sleeve from the shoulder through the elbow to the wrist: pale, banded dark round and round, a dark cuff at the end
  sleeve(ctx, K, pts, w, dark) {
    P_limb(ctx, pts, w, dark ? K.suitS : K.suit);
    ctx.save();
    ctx.strokeStyle = dark ? K.cuff : K.stripe; ctx.lineWidth = w * 1.02; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    ctx.setLineDash([0.026, 0.024]); ctx.lineDashOffset = -0.05;
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.restore();
    const a = pts[pts.length - 2], b = pts[pts.length - 1], n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / n, uy = (b[1] - a[1]) / n;
    P_line(ctx, b[0] - ux * 0.02, b[1] - uy * 0.02, b[0], b[1], w * 1.12, K.cuff);
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
  // one huge round eye at (x, y), r across: a red smudge round it, the red rim, the white, a thin red ring round a pinprick
  eye(ctx, K, x, y, r, pr) {
    P_ell(ctx, x, y, r * 1.42, r * 1.38, K.rimA);
    P_ell(ctx, x, y, r * 1.14, r * 1.14, K.rim);
    P_ell(ctx, x, y, r, r, K.white);
    ctx.strokeStyle = K.ring; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(x, y, r * 0.48, 0, TAU); ctx.stroke();
    P_ell(ctx, x, y, pr, pr, K.pupil);
    P_ell(ctx, x - r * 0.38, y + r * 0.36, r * 0.11, r * 0.11, K.glint);
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
  // 0..1 the grin coming apart, back from behind (only hair)
  drawHead(ctx, c, P, K, near, gape, back) {
    if (back) {
      P_ell(ctx, 0, 0, 0.12, 0.14, K.hair);
      for (const x of [-0.07, -0.025, 0.02, 0.065]) P_limb(ctx, [[x * 0.6, 0.12], [x, 0.02], [x * 1.1, -0.12]], 0.004, K.hairL);
      return;
    }
    // the face and the jaw under it, black; the jaw dropping away as it comes at you
    P_ell(ctx, 0, 0, 0.115, 0.135, K.black);
    P_ell(ctx, 0, -0.045 - gape * 0.1, 0.1 + gape * 0.012, 0.1 + gape * 0.11, K.black);
    // the eyes, wider the nearer it is and wider still coming at you, the pupils shrinking to points
    const er = 0.033 + near * 0.003 + gape * 0.012, pr = lerp(0.0075, 0.0045, Math.max(near, gape)), ey = 0.026 + gape * 0.012;
    for (const s of [-1, 1]) this.eye(ctx, K, s * (0.047 + gape * 0.006), ey, er, pr);
    // the grin, clenched; coming at you it comes apart, the corners pulled further up, the bottom row going down and down
    const mw = 0.088 + gape * 0.02, cy = -0.034 + gape * 0.012;
    this.grin(ctx, K, mw, cy, -0.024 - gape * 0.006, -0.088 - near * 0.004 - gape * 0.2, 0.034 + gape * 0.008, gape);
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
    // the legs: the onesie's, baggy, bunched at the ankles over the shoes; one foot coming up a little at a time
    for (const s of [-1, 1]) {
      const l = Math.max(0, Math.sin(g + (s > 0 ? Math.PI : 0))) * 0.03 * st;
      P_limb(ctx, [[s * 0.075, 0.5], [s * 0.078, 0.28], [s * 0.08, 0.09 + l]], 0.125, K.suit);
      P_line(ctx, s * 0.11, 0.46, s * 0.118, 0.12 + l, 0.03, K.suitS);   // the shade down its outer side
      P_ell(ctx, s * 0.083, 0.11 + l, 0.074, 0.03, K.suitS);           // bunched at the ankle
      P_ell(ctx, s * 0.09, 0.035 + l, 0.058, 0.034, K.shoe, s * 0.12);
      P_line(ctx, s * 0.07, 0.05 + l, s * 0.1, 0.06 + l, 0.006, K.lace);
      for (const [a, b, d] of [[0.3, 0.26, 0.03], [0.2, 0.17, -0.02], [0.4, 0.37, 0.01]]) P_line(ctx, s * (0.05 + d), a + l * 0.5, s * (0.1 + d), b + l * 0.5, 0.005, K.fold);
    }
    // the body: a rumpled onesie, a placket of buttons down the front, a pocket, open at the collar onto the black neck
    const top = 0.86;
    P_poly(ctx, [[-0.05, top + 0.012], [-0.15, top - 0.01], [-0.172, top - 0.08], [-0.166, 0.62], [-0.155, 0.46], [-0.05, 0.41], [0, 0.43], [0.05, 0.41], [0.155, 0.46], [0.166, 0.62], [0.172, top - 0.08], [0.15, top - 0.01], [0.05, top + 0.012]], K.suit);
    if (!back) {
      P_line(ctx, 0, top - 0.1, 0, 0.44, 0.006, K.fold);
      for (const y of [0.71, 0.63, 0.55, 0.47]) P_ell(ctx, 0.012, y, 0.007, 0.007, K.suitS);
      ctx.strokeStyle = K.fold; ctx.lineWidth = 0.005; ctx.strokeRect(0.05, 0.66, 0.065, 0.07);
      for (const f of [[[-0.13, 0.62], [-0.09, 0.58], [-0.06, 0.6]], [[0.09, 0.53], [0.13, 0.49]], [[-0.1, 0.5], [-0.05, 0.47]], [[0.04, 0.6], [0.08, 0.62]]]) P_limb(ctx, f, 0.005, K.fold);
      P_poly(ctx, [[-0.052, top + 0.015], [0.052, top + 0.015], [0, top - 0.1]], K.black);   // the neck, open down to the chest
      for (const s of [-1, 1]) P_poly(ctx, [[s * 0.058, top + 0.014], [s * 0.004, top - 0.1], [s * 0.085, top - 0.04]], K.suitS);   // the collar
    } else P_line(ctx, 0, top - 0.02, 0, 0.44, 0.006, K.fold);
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
    ctx.save(); headFrame(); this.drawHead(ctx, c, P, K, near, gape, back); ctx.restore();
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
      P_ell(ctx, fx + Math.cos(l.sa) * 0.035 * sn + s * 0.01 * ca, l.fy + Math.sin(l.sa) * 0.035 * q - 0.005, lerp(0.058, 0.068, sn), lerp(0.034, 0.032, q), K.shoe, sa + s * 0.12 * (1 - q));
      P_ell(ctx, fx - Math.sin(l.sa) * 0.03 * sn, l.fy + lerp(0.08, Math.cos(l.sa) * 0.03, q), lerp(0.074, 0.06, q), 0.03, K.suitS, sa);   // bunched at the ankle
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
    // its front going round toward the way it turns: the placket and its buttons, the pocket, the open collar onto the neck
    if (a < 1.25) {
      const zf = 0.11, fade = clamp((1.25 - a) / 0.3, 0, 1), F = x => X(x, zf * Math.sqrt(Math.max(0, 1 - (x / 0.172) ** 2)));   // on the round of its front
      ctx.save(); ctx.globalAlpha = fade;
      P_line(ctx, X(0, zf), top - 0.1, X(0, zf), 0.44 + by, 0.006, K.fold);
      for (const y of [0.71, 0.63, 0.55, 0.47]) P_ell(ctx, F(0.012 * dir), y + by, 0.007 * Math.max(ca, 0.4), 0.007, K.suitS);
      ctx.globalAlpha = fade * clamp((0.9 - a) / 0.3, 0, 1);   // the pocket, going round out of sight first
      P_limb(ctx, [[F(0.05 * dir), 0.66 + by], [F(0.115 * dir), 0.66 + by], [F(0.115 * dir), 0.73 + by], [F(0.05 * dir), 0.73 + by], [F(0.05 * dir), 0.66 + by]], 0.005, K.fold);
      ctx.globalAlpha = fade;
      const zn = 0.06;
      P_poly(ctx, [[X(-0.052, zn), top + 0.015], [X(0.052, zn), top + 0.015], [X(0, zf), top - 0.1]], K.black);
      for (const s of [-1, 1]) P_poly(ctx, [[X(s * 0.058, zn), top + 0.014], [X(s * 0.004, zf), top - 0.1], [X(s * 0.085, zn * 0.6), top - 0.04]], K.suitS);
      ctx.restore();
    }
    drawArm(-1);
    if (!farFirst) drawArm(1);
    // the neck and the head, turned to you
    ctx.save(); neck(); P_line(ctx, 0, 0, 0, 0.12, 0.045, K.black); ctx.restore();
    ctx.save(); headFrame(); this.drawHead(ctx, c, P, K, near, 0, false);
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
    const drawLeg = (l, col) => {
      P_limb(ctx, [[0, hipY], [l.kx, l.ky], [l.fx, l.fy]], 0.115, col);
      P_ell(ctx, l.fx + Math.cos(l.sa) * 0.035, l.fy + Math.sin(l.sa) * 0.035 - 0.005, 0.068, 0.032, K.shoe, l.sa);
      P_ell(ctx, l.fx - Math.sin(l.sa) * 0.03, l.fy + Math.cos(l.sa) * 0.03, 0.06, 0.03, K.suitS, l.sa);   // bunched at the ankle
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
    // the onesie, side on: round in the belly, the seat of it behind, the placket down the front
    P_poly(ctx, [[-0.08, top], [0.06, top], [0.1, top - 0.12], [0.125, top - 0.28], [0.1, hipY - 0.05], [0.0, hipY - 0.1], [-0.11, hipY - 0.05], [-0.12, top - 0.3], [-0.1, top - 0.12]], K.suit);
    P_line(ctx, 0.106, top - 0.12, 0.118, hipY - 0.02, 0.005, K.fold);
    P_limb(ctx, [[-0.06, top - 0.2], [-0.02, top - 0.24], [0.03, top - 0.22]], 0.005, K.fold);
    drawLeg(legs[0], K.suit);
    drawArm(0.0, false);
    // the neck, and the head on it turned to you and laid over; the face is undone by the mirror so it is the same face
    // whichever way it runs
    const tilt = this.tilt(c.t, 0.3);
    ctx.translate(0.01, top);
    P_line(ctx, 0, 0, 0, 0.12, 0.045, K.black);
    ctx.translate(0, 0.11); ctx.scale(c.runDir || 1, 1); ctx.rotate(tilt); ctx.translate(0, 0.12);
    this.drawHead(ctx, c, P, K, near, 0, false);
    ctx.restore();
  },
};
