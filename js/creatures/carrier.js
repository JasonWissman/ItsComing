'use strict';
// The carrier: hunched, sack-bodied, arms wrapped round the bundle it never puts down, a face you would rather not see up
// close. It cannot stand the light.
// A night can send it sideways, running: c.runLat metres to its right, c.runPose on, c.runDir +1 running to the right of
// the view and -1 to the left, c.runGait its stride, c.runPace 1 for a run and less for a walk. c.recoil (0..1) rears it
// back from the light with an arm across its face. c.shade (0..1) is how deep in shadow it stands: its colours sink toward
// black, and its eyes catch what little light there is (two pale points). c.fallT (seconds) is its end, caught in the
// light with nowhere dark to go: it shrieks, its knees go, and it comes apart on the ground, sacking and straw.
CREATURES.carrier = {
  name: 'the carrier', h: 1.7, w: 1.6, faceY: 1.35, stepRate: 0.9, catchDist: 1.5, sound: 'walker',
  death: { delay: 0.2, dur: 0.4, sting: 'sting' },
  voice: { kind: 'slow', every: [5, 10] },
  init(c) { c.shade = 0; },
  speedMult(c, dt, seen) { return c.fallT !== undefined ? 0 : 0.55; },
  lateral(c) { return c.runLat || 0; },
  // its colours as the dark has them: pulled toward black by c.shade (fog and light still come after, as P has them)
  shaded(c, P) {
    const k = clamp(c.shade || 0, 0, 1);
    if (k < 0.01) return P;
    return Object.assign({}, P, { col: col => P.col(mixc(col, [8, 9, 12], k)), cola: (col, a) => P.cola(mixc(col, [8, 9, 12], k), a) });
  },
  // its eyes in the dark: two pale points, never less than a pixel or so across however far off it is, blinking now and then.
  // Only where it is dark enough that they are all there is of its eyes: with a little of it showing (in your face, say) its
  // eyes are blank black, with no pale point in them
  eyes(ctx, c, pts) {
    const k = clamp(((c.shade || 0) - 0.6) / 0.3, 0, 1), ph = (c.t + c.idx * 1.7) % 4.3;
    if (k <= 0 || ph < 0.16) return;
    const pxm = (typeof R !== 'undefined' && R.f ? R.f : 600) / Math.max(0.6, c.dist), r = Math.max(0.018, 1.05 / pxm);
    for (const [x, y] of pts) {
      P_ell(ctx, x, y, r * 2.4, r * 1.9, 'rgba(190,210,150,' + (0.16 * k).toFixed(3) + ')');
      P_ell(ctx, x, y, r, r * 0.8, 'rgba(226,236,190,' + (0.85 * k).toFixed(3) + ')');
    }
  },
  draw(ctx, c, P0) {
    if (c.fallT !== undefined) { this.drawFall(ctx, c, P0); return; }
    const P = this.shaded(c, P0);
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 12, 0, 1), lunge = c.lunge || 0;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), skin = P.col([160, 140, 122]), black = P.col([8, 6, 6]), teeth = P.col([220, 210, 190]);
    // rearing back from the light: it straightens, its head goes back and aside, one arm comes up across its face and its
    // mouth opens; the other arm never lets go of what it carries
    const rec = smoothstep(clamp(c.recoil || 0, 0, 1));
    const bob = c.moving ? Math.abs(Math.sin(g)) * 0.06 : Math.sin(t * 1.4) * 0.02, hunch = 0.25 * (1 - rec * 0.8);
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = c.moving ? Math.max(0, Math.sin(ph)) * 0.18 : 0;
      P_limb(ctx, [[s * 0.16, 0.75 + bob], [s * 0.22 + Math.sin(ph) * 0.08 + s * rec * 0.06, 0.4 + lift * 0.6], [s * 0.2 + Math.sin(ph) * 0.14 + s * rec * 0.1, lift + 0.03]], 0.1, sackD);
    }
    // the body: a sack, sagging, patched, the seams showing
    ctx.save(); ctx.translate(0, bob + rec * 0.06);
    P_ell(ctx, 0, 0.95, 0.5, 0.5, sack);
    P_poly(ctx, [[-0.42, 0.7], [0.42, 0.7], [0.36, 1.25 - hunch * 0.3], [-0.36, 1.25 - hunch * 0.3]], sack);
    for (let k = 0; k < 4; k++) P_line(ctx, -0.3 + k * 0.2, 0.75, -0.25 + k * 0.2, 1.2, 0.012, sackD);
    P_rect(ctx, -0.12, 0.85, 0.22, 0.16, sackD);
    // arms wrapped round itself; when it lunges they open
    for (const s of [-1, 1]) {
      const open = lunge, up = s > 0 ? rec : 0;
      if (up > 0.02) {   // the arm thrown up in front of its face, the fingers spread against the light
        const ex = s * lerp(0.1 + open * 0.55, 0.52, up), ey = lerp(0.95 + open * 0.3, 1.36, up), hx = -s * lerp(0.25 - open * 0.7, -0.08, up), hy = lerp(1.05 + open * 0.4, 1.66, up);
        P_limb(ctx, [[s * 0.38, 1.15], [ex, ey], [hx, hy]], 0.11, sack);
        fingers(ctx, hx, hy, Math.PI / 2 + s * 0.3, 0.32, 0.13 * up, 0.025, skin);
        continue;
      }
      P_limb(ctx, [[s * 0.38, 1.15], [s * (0.1 + open * 0.55), 0.95 + open * 0.3], [-s * (0.25 - open * 0.7), 1.05 + open * 0.4]], 0.11, sack);
      if (open > 0.2) fingers(ctx, -s * (0.25 - open * 0.7), 1.05 + open * 0.4, -s * 0.4 + Math.PI / 2, 0.4, 0.14, 0.025, skin);
    }
    // the head: low, pushed forward, hair like straw, a mouth full of small teeth
    ctx.save(); ctx.translate(-rec * 0.08, 1.2 - hunch * 0.2 + rec * 0.05); ctx.rotate(headTiltJerk(t, 3.3, 0.14) * (1 - lunge) * (1 - rec) - rec * 0.38);
    strands(ctx, 0, 0.42, 12, 0.3, P.col([120, 100, 60]), 9, t);
    P_ell(ctx, 0, 0.22, 0.2, 0.22, skin);
    P_ell(ctx, -0.08, 0.27, 0.035, 0.025 * (1 - rec * 0.7), black); P_ell(ctx, 0.08, 0.27, 0.035, 0.025 * (1 - rec * 0.7), black);   // screwed shut against the glare
    if (rec < 0.3) this.eyes(ctx, c, [[-0.08, 0.27], [0.08, 0.27]]);
    const mw = 0.08 + near * 0.05 + lunge * 0.08 + rec * 0.04, mh = 0.02 + near * 0.04 + lunge * 0.09 + rec * 0.07;
    P_ell(ctx, 0, 0.1, mw, mh, black);
    if (near > 0.15 || lunge > 0 || rec > 0.3) for (let i = -3; i <= 3; i++) P_rect(ctx, i * mw * 0.27 - 0.008, 0.1 + mh * 0.5 - 0.03, 0.016, 0.03, teeth);
    ctx.restore();
    ctx.restore();
  },
  // flat out, seen from the side, and still bent double round what it carries: the sack of its body tipped forward over
  // short legs going like pistons, the bundle clutched to its front in both arms, the head thrust out low ahead with its
  // straw hair streaming back. At a walk (c.runPace below 1) the stride shortens and it rides more upright.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, t = c.t, pace = c.runPace === undefined ? 1 : c.runPace;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), sackL = P.col([126, 108, 82]), skin = P.col([160, 140, 122]), skinD = P.col([118, 100, 86]);
    const black = P.col([8, 6, 6]), teeth = P.col([220, 210, 190]), hair = P.col([120, 100, 60]), bundle = P.col([134, 114, 82]), bundleD = P.col([98, 82, 58]), twine = P.col([48, 36, 24]);
    const lean = 0.32 + 0.33 * pace, thigh = 0.36, shin = 0.37, rot = Math.PI / 2 - lean;   // lean from upright; rot, the spine's angle
    const sp = [Math.sin(lean), Math.cos(lean)], fw = [Math.cos(lean), -Math.sin(lean)];       // up its spine; out of its front (forward and down)
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const legs = [0, Math.PI].map(o => {
      const ph = g + o, a = Math.sin(ph) * (0.3 + 0.55 * pace), bend = 0.2 + 1.3 * pace * Math.max(0, Math.cos(ph));   // the knee folds as the leg swings through
      const kx = Math.sin(a) * thigh, ky = -Math.cos(a) * thigh;
      return { kx, ky, fx: kx + Math.sin(a - bend) * shin, fy: ky - Math.cos(a - bend) * shin };
    });
    const hipX = -0.06, hipY = 0.06 - Math.min(legs[0].fy, legs[1].fy);   // whichever foot is lowest is on the ground
    const leg = (l, col, foot) => {
      P_limb(ctx, [[hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy]], 0.13, col);
      P_ell(ctx, hipX + l.fx + 0.05, hipY + l.fy - 0.01, 0.1, 0.04, foot);   // a broad bare foot, pale, toes forward
    };
    leg(legs[1], sackD, skinD);   // the far leg, in its own shadow
    // the body: a sack slung forward from the hips, sagging at the belly, the light along its back, a seam or two
    const cx = hipX + sp[0] * 0.4 + 0.03, cy = hipY + sp[1] * 0.4;
    P_ell(ctx, cx, cy, 0.5, 0.37, sack, rot);
    P_ell(ctx, cx + fw[0] * 0.13, cy + fw[1] * 0.13, 0.38, 0.22, sackD, rot);
    P_ell(ctx, cx - fw[0] * 0.19, cy - fw[1] * 0.19, 0.36, 0.11, sackL, rot);
    for (const u of [-0.12, 0.14]) P_line(ctx, cx + sp[0] * u - fw[0] * 0.3, cy + sp[1] * u - fw[1] * 0.3, cx + sp[0] * u + fw[0] * 0.1, cy + sp[1] * u + fw[1] * 0.1, 0.014, sackD);
    const shX = hipX + sp[0] * 0.76, shY = hipY + sp[1] * 0.76;   // the shoulders, out over its front
    // the bundle, held to its chest: tied, lumpy, never put down
    const bx = cx + fw[0] * 0.34 + sp[0] * 0.08, by = cy + fw[1] * 0.34 + sp[1] * 0.08 + Math.sin(g * 2) * 0.012;
    P_ell(ctx, bx, by, 0.21, 0.17, bundleD, 0.3); P_ell(ctx, bx - 0.02, by + 0.03, 0.17, 0.12, bundle, 0.3);
    P_line(ctx, bx - 0.17, by - 0.05, bx + 0.12, by + 0.13, 0.018, twine); P_line(ctx, bx - 0.06, by + 0.15, bx + 0.08, by - 0.14, 0.018, twine);
    // the near arm wrapped round it, the hand clawed over the top
    const hx = bx - 0.02, hy = by + 0.15;
    P_limb(ctx, [[shX - 0.04, shY - 0.04], [bx + 0.22, by - 0.06], [bx + 0.14, by + 0.12], [hx, hy]], 0.11, sack);
    fingers(ctx, hx, hy, Math.PI + 0.6, 0.24, 0.1, 0.024, skin);
    // the head, low and thrust out ahead of the shoulders, the face in profile on its front
    const nod = Math.sin(g * 2) * 0.02 * pace, hdx = shX + 0.17, hdy = shY + 0.05 + nod;
    for (let i = 0; i < 9; i++) {   // the straw hair, streaming back as it goes
      const a = Math.PI * (0.66 + i * 0.04) + Math.sin(t * 9 + i * 1.7) * 0.06 * pace, l = 0.22 + 0.1 * Math.sin(i * 2.1) + 0.14 * pace;
      const x0 = hdx - 0.06 + i * 0.014, y0 = hdy + 0.15 - i * 0.016;
      P_line(ctx, x0, y0, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l * 0.55, 0.016, hair);
    }
    P_ell(ctx, hdx, hdy, 0.17, 0.19, skin, -0.25);
    P_ell(ctx, hdx - 0.07, hdy + 0.01, 0.09, 0.14, skinD, -0.25);                                         // the side of the skull, shadowed
    P_ell(ctx, hdx + 0.07, hdy + 0.06, 0.032, 0.024, black);                                               // the eye
    this.eyes(ctx, c, [[hdx + 0.07, hdy + 0.06]]);
    const mo = 0.035 + 0.03 * pace;
    P_ell(ctx, hdx + 0.11, hdy - 0.08, 0.065, mo, black, -0.25);                                           // the mouth, open as it runs
    for (let i = 0; i < 3; i++) P_rect(ctx, hdx + 0.07 + i * 0.03, hdy - 0.08 + mo * 0.5 - 0.028, 0.014, 0.028, teeth);
    leg(legs[0], sack, skin);   // the near leg, in front of the body
    ctx.restore();
  },
  // Its end, in the light (c.fallT seconds in). FALL.shriek: it rears up screaming, shaking, an arm over its face. Then its
  // knees go and it sinks, swaying, the arm coming down (FALL.sink). Then it comes apart (FALL.apart): the sack of its body
  // drops and slumps open down the middle with the straw it was stuffed with spilling out across the ground, the head
  // drops off and rolls away onto its side, the arms fall loose, the bundle tumbles out of them. Then it lies there, a
  // heap of sacking and straw, a little dust going up off it in the light.
  FALL: { shriek: 0.9, sink: 1.0, apart: 1.3 },
  drawFall(ctx, c, P) {
    const F = this.FALL, t = c.fallT, t1 = F.shriek, t2 = t1 + F.sink;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), sackL = P.col([128, 110, 84]), inner = P.col([34, 26, 18]), skin = P.col([160, 140, 122]), skinD = P.col([118, 100, 86]);
    const black = P.col([8, 6, 6]), teeth = P.col([220, 210, 190]), straw = P.col([176, 150, 84]), strawD = P.col([128, 106, 56]), bundle = P.col([134, 114, 82]), twine = P.col([48, 36, 24]);
    const side = c.fallSide || 1;
    const rm = typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.settings.reducedMotion ? 0.3 : 1;
    // the straw that spills out of it as it comes apart: each strand thrown out from the split and coming to rest on the
    // ground, the same every time (seeded by its number)
    const strawBits = (k) => {
      for (let i = 0; i < 42; i++) {
        const r1 = Math.sin(i * 12.9898) * 43758.5453, u = r1 - Math.floor(r1), r2 = Math.sin(i * 78.233) * 12345.678, v = r2 - Math.floor(r2);
        const dir = (u - 0.5) * 2, vx = dir * (0.7 + v * 1.2), vy = 0.6 + v * 1.4, tt = Math.max(0, k) * (0.6 + v * 0.5);
        const land = (vy + Math.sqrt(vy * vy + 2 * 9.8 * 0.3)) / 9.8, tl = Math.min(tt, land);
        const x = vx * tl + (tt > land ? vx * 0.08 * (1 - Math.exp(-(tt - land) * 6)) : 0), y = Math.max(0.01, 0.3 + vy * tl - 4.9 * tl * tl);
        const a = u * 6.28 + tl * 9 * dir, l = 0.09 + v * 0.09;
        P_line(ctx, x - Math.cos(a) * l, y - Math.sin(a) * l * (tt >= land ? 0.2 : 1), x + Math.cos(a) * l, y + Math.sin(a) * l * (tt >= land ? 0.2 : 1), 0.02, i % 3 ? straw : strawD);
      }
    };
    if (t < t2) {   // screaming, then sinking: the standing figure, rearing back, shaking, then its knees going
      const sink = smoothstep((t - t1) / F.sink), shake = (1 - sink * 0.6) * Math.min(1, t / 0.15) * rm;
      const jx = Math.sin(t * 61) * 0.035 * shake, rec = 1 - smoothstep((t - t1 - 0.3) / 0.5);
      ctx.save(); ctx.translate(jx, 0);
      ctx.translate(0, -0.05 * sink); ctx.rotate(-side * 0.18 * sink); ctx.scale(1 + 0.12 * sink, 1 - 0.42 * sink);
      // the legs folding under it
      for (const s of [-1, 1]) P_limb(ctx, [[s * 0.16, 0.75], [s * (0.24 + 0.22 * sink), 0.4 - 0.1 * sink], [s * (0.2 + 0.12 * sink), 0.03]], 0.1, sackD);
      P_ell(ctx, 0, 0.95, 0.5, 0.5, sack);
      P_poly(ctx, [[-0.42, 0.7], [0.42, 0.7], [0.36, 1.2], [-0.36, 1.2]], sack);
      for (let k = 0; k < 4; k++) P_line(ctx, -0.3 + k * 0.2, 0.75, -0.25 + k * 0.2, 1.2, 0.012, sackD);
      if (sink > 0.3) P_line(ctx, 0.02, 0.62, -0.04, 1.18, 0.02 + 0.03 * sink, inner);   // a seam splitting down its front
      // one arm up over its face against the light; the other clutching the bundle, then both going slack
      const up = rec;
      P_limb(ctx, [[0.38, 1.15], [lerp(0.6, 0.52, up), lerp(0.75, 1.36, up)], [lerp(0.66, 0.08, up), lerp(0.5, 1.66, up)]], 0.11, sack);
      fingers(ctx, lerp(0.66, 0.08, up), lerp(0.5, 1.66, up), lerp(-Math.PI / 2, Math.PI / 2 + 0.3, up), 0.32, 0.13, 0.025, skin);
      P_ell(ctx, -0.18, 0.98 - 0.2 * sink, 0.2, 0.15, bundle); P_line(ctx, -0.32, 0.93 - 0.2 * sink, -0.06, 1.05 - 0.2 * sink, 0.016, twine);
      P_limb(ctx, [[-0.38, 1.15], [-0.48 - 0.1 * sink, 0.95 - 0.2 * sink], [-0.05, 1.0 - 0.25 * sink]], 0.11, sack);
      // the head thrown back, the mouth wide open in the scream, then lolling
      ctx.save(); ctx.translate(-0.06, 1.25); ctx.rotate(-0.4 * (1 - sink) + side * 0.7 * sink + Math.sin(t * 47) * 0.05 * shake);
      strands(ctx, 0, 0.42, 12, 0.3, P.col([120, 100, 60]), 9, c.t);
      P_ell(ctx, 0, 0.22, 0.2, 0.22, skin);
      P_ell(ctx, -0.08, 0.29, 0.04, 0.012, black); P_ell(ctx, 0.08, 0.29, 0.04, 0.012, black);
      const mh = 0.13 * (1 - sink * 0.5), mw = 0.1;
      P_ell(ctx, 0, 0.1, mw, mh, black);
      for (let i = -3; i <= 3; i++) { P_rect(ctx, i * mw * 0.27 - 0.008, 0.1 + mh - 0.035, 0.016, 0.03, teeth); P_rect(ctx, i * mw * 0.27 - 0.008, 0.1 - mh + 0.005, 0.016, 0.03, teeth); }
      ctx.restore();
      ctx.restore();
      return;
    }
    // apart: k runs 0..1 over the coming apart, and on past it the heap lies still
    const k = clamp((t - t2) / F.apart, 0, 1), ks = smoothstep(k);
    // the bundle, out of its arms and rolled away to the other side
    const bxk = easeOut(clamp(k * 1.4, 0, 1));
    ctx.save(); ctx.translate(-side * (0.25 + 0.55 * bxk), 0.14 + 0.5 * (1 - bxk) * (1 - bxk)); ctx.rotate(side * bxk * 2.2);
    P_ell(ctx, 0, 0, 0.19, 0.14, bundle); P_line(ctx, -0.15, -0.05, 0.12, 0.08, 0.016, twine); P_line(ctx, -0.05, 0.13, 0.07, -0.12, 0.016, twine);
    ctx.restore();
    // the arms, fallen loose either side
    for (const s of [-1, 1]) {
      const a = easeOut(clamp(k * 1.6 - (s > 0 ? 0.2 : 0), 0, 1));
      P_limb(ctx, [[s * lerp(0.36, 0.42, a), lerp(0.75, 0.12, a)], [s * lerp(0.5, 0.75, a), lerp(0.5, 0.06, a)], [s * lerp(0.4, 0.98, a), lerp(0.3, 0.05, a)]], 0.1, sackD);
      if (a > 0.5) fingers(ctx, s * 0.98, 0.05, s > 0 ? 0 : Math.PI, 0.3, 0.09, 0.02, skin);
    }
    // the legs, folded under and then lying out
    for (const s of [-1, 1]) P_limb(ctx, [[s * 0.14, 0.2], [s * (0.3 + 0.15 * ks), 0.1], [s * (0.36 + 0.25 * ks), 0.04]], 0.1, sackD);
    // the straw, spilling out of the split
    strawBits(t - t2 - 0.15);
    // the body: the sack dropping and slumping into a heap, split open down the middle, its two halves lying open
    const hy = lerp(0.62, 0.2, ks), hw = lerp(0.5, 0.62, ks), hh = lerp(0.42, 0.19, ks), open = ks;
    for (const s of [-1, 1]) {   // each half of it, falling open away from the split
      ctx.save(); ctx.translate(s * 0.04 * open, hy); ctx.rotate(-s * 0.3 * open);
      ctx.beginPath(); ctx.ellipse(0, 0, hw, hh, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : Math.PI * 1.5, false); ctx.closePath(); ctx.fillStyle = s > 0 ? sack : sackL; ctx.fill();
      P_line(ctx, s * hw * 0.4, -hh * 0.7, s * hw * 0.5, hh * 0.6, 0.012, sackD);
      ctx.restore();
    }
    P_ell(ctx, 0, hy, 0.08 + 0.22 * open, hh * 0.8, inner);   // the split, dark inside
    for (let i = 0; i < 9; i++) {   // and the straw welling up out of it
      const x = (i - 4) * 0.045 * open, l = (0.1 + 0.1 * Math.abs(Math.sin(i * 2.7))) * open;
      P_line(ctx, x, hy - hh * 0.3, x + Math.sin(i * 1.9) * 0.08, hy + l, 0.016, i % 2 ? straw : strawD);
    }
    // the head: off, falling to the ground beside it, bouncing once and rolling over onto its side
    const hk = clamp(k * 1.25, 0, 1), fallY = hk < 0.55 ? lerp(1.3, 0.17, (hk / 0.55) ** 2) : 0.17 + Math.sin((hk - 0.55) / 0.45 * Math.PI) * 0.12 * (1 - (hk - 0.55) / 0.45);
    const hxk = side * (0.15 + 0.55 * easeOut(hk));
    ctx.save(); ctx.translate(hxk, fallY); ctx.rotate(side * (0.4 + 1.25 * easeOut(hk)));
    strands(ctx, 0, 0.2, 10, 0.24, P.col([120, 100, 60]), 9, c.t);
    P_ell(ctx, 0, 0, 0.19, 0.2, skin); P_ell(ctx, -0.06, 0.0, 0.1, 0.15, skinD);
    P_ell(ctx, -0.07, 0.05, 0.035, 0.01, black); P_ell(ctx, 0.07, 0.05, 0.035, 0.01, black);
    P_ell(ctx, 0, -0.1, 0.08, 0.06, black);   // its mouth, left open
    ctx.restore();
    // dust going up off the heap in the light
    if (t > t2 + 0.3) {
      for (let i = 0; i < 6; i++) {
        const q = ((t - t2 - 0.3) * 0.35 + i / 6) % 1, x = Math.sin(i * 2.3 + t * 0.4) * 0.4 + (q - 0.5) * 0.1, y = 0.3 + q * 1.4;
        P_ell(ctx, x, y, 0.08 + q * 0.18, 0.06 + q * 0.12, 'rgba(236,228,206,' + (0.1 * (1 - q) * clamp((t - t2 - 0.3) / 0.6, 0, 1)).toFixed(3) + ')');
      }
    }
  },
};
