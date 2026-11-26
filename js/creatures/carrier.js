'use strict';
// The carrier: hunched, sack-bodied, its long empty arms hanging heavy, the hands low by its knees, a face you would
// rather not see up close. It cannot stand the light.
// A night can send it sideways, running: c.runLat metres to its right, c.runPose on, c.runDir +1 running to the right of
// the view and -1 to the left, c.runGait its stride, c.runPace 1 for a run and less for a walk. c.recoil (0..1) rears it
// back from the light with an arm across its face. c.shade (0..1) is how deep in shadow it stands: its colours sink toward
// black, and its eyes catch what little light there is (two pale points). c.fallT (seconds) is its end, caught in the
// light with nowhere dark to go: it shrieks, its knees go, and it comes apart on the ground, sacking and straw.
// Its mouth is sewn shut, like a scarecrow's: a patch of burlap stitched over it with thick crosses of twine. It strains
// at the stitches as it nears you, and in your face (c.lunge) the slit is pulled open tall and two of them snap, the dark
// and its teeth showing through. In that last moment it is lit up, however dark it is, so you see it.
// It carries nothing of its own. c.clutch ([x, y], in its own drawing) is a thing it has been given to hold: its right
// hand is at that point, round it, whatever the other is doing (night 13 draws the thing there over it).
CREATURES.carrier = {
  name: 'the carrier', h: 1.7, w: 1.6, faceY: 1.35, stepRate: 0.9, catchDist: 1.5, sound: 'walker',
  death: { delay: 0.2, dur: 0.4, sting: 'sting' },
  voice: { kind: 'slow', every: [5, 10] },
  init(c) { c.shade = 0; },
  speedMult(c, dt, seen) { return c.fallT !== undefined ? 0 : 0.55; },
  lateral(c) { return c.runLat || 0; },
  // its colours as the dark has them: pulled toward black by c.shade (fog and light still come after, as P has them).
  // In its lunge it is lit up (glare): its own colours, whatever the dark and the light round it would make of them
  glare(c) { return c.lunge > 0 && c.fallT === undefined ? smoothstep(clamp(c.lunge * 2.5, 0, 1)) : 0; },
  shaded(c, P) {
    const gl = this.glare(c), k = clamp(c.shade || 0, 0, 1) * (1 - gl), ch = clamp(c.char || 0, 0, 1);
    if (k < 0.01 && gl < 0.01 && ch < 0.01) return P;
    const dark = col => mixc(ch > 0.01 ? mixc(col, [34, 22, 14], ch) : col, [8, 9, 12], k);   // (c.char: scorched toward a sooty brown)
    const take = kk => (kk === undefined ? 1 : kk) * (1 - 0.7 * ch);   // (scorched, it takes less of the light on it: it stays sooty under its own fire)
    if (gl < 0.01) return Object.assign({}, P, { col: (col, kk) => P.col(dark(col), take(kk)), cola: (col, a) => P.cola(dark(col), a) });
    const rgb = str => str.slice(str.indexOf('(') + 1, -1).split(',').map(Number);
    const lit = col => mixc(rgb(P.col(dark(col))), mixc(col, [255, 238, 214], 0.06), gl);
    return Object.assign({}, P, { col: col => rgba(lit(col)), cola: (col, a) => rgba(lit(col), a) });
  },
  // its mouth, sewn shut: a patch of burlap over it (w across, at x, y), the slit across the patch stitched shut with n
  // thick crude cross-stitches of twine. gap (metres) is how far
  // the slit is pulled open against the stitches, the dark and its teeth, top and bottom, showing between them; torn,
  // how many of the stitches have snapped (from the middle out).
  sewnMouth(ctx, P, x, y, w, gap, torn, n, t) {
    const h = w * 0.44 + gap * 1.15, sw = w * 0.36;   // (the patch stretching taller as the slit is pulled open)
    const burlap = P.col([136, 110, 72]), twine = P.col([30, 22, 14]);
    const black = P.col([8, 6, 6]), teeth = P.col([220, 210, 190]);
    // the patch: a rough-cut square of sacking
    const pts = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 1 + 0.07 * Math.sin(i * 2.7) + 0.05 * Math.sin(i * 5.3); pts.push([x + Math.cos(a) * w / 2 * r * (Math.abs(Math.cos(a)) > 0.6 ? 1.04 : 1), y + Math.sin(a) * h / 2 * r]); }
    P_poly(ctx, pts, burlap);
    // the slit: shut, a dark seam; pulled open, the dark behind it and its teeth
    if (gap > w * 0.012) {
      P_ell(ctx, x, y, sw, gap / 2 + w * 0.01, black);
      if (gap > w * 0.06) {
        const tw = w * 0.045, th = Math.min(gap * 0.38, w * 0.16);
        for (let i = -3; i <= 3; i++) {
          const tx = x + i * sw * 0.26, edge = Math.sqrt(Math.max(0, 1 - (i * 0.26) ** 2)) * (gap / 2 + w * 0.01);
          P_rect(ctx, tx - tw / 2, y + edge - th, tw, th, teeth);                       // the top row, hanging down
          P_rect(ctx, tx - tw / 2, y - edge, tw, th * 0.85, teeth);                       // the bottom row, coming up
        }
      }
    } else P_line(ctx, x - sw, y, x + sw, y, w * 0.035, black);
    // the stitches: crude crosses of thick twine over the slit, pulled long as it opens; the torn ones are gone
    const order = [2, 1, 3, 0, 4, 5, 6].filter(i => i < n), d = w * 0.055 + gap * 0.2, s2 = w * 0.085;
    for (let i = 0; i < n; i++) {
      const sx = x + (n > 1 ? lerp(-sw * 0.82, sw * 0.82, i / (n - 1)) : 0), top = y + gap / 2 + s2, bot = y - gap / 2 - s2;
      if (order.indexOf(i) < torn) continue;   // snapped
      P_line(ctx, sx - d, top, sx + d, bot, w * 0.04, twine); P_line(ctx, sx + d, top, sx - d, bot, w * 0.04, twine);
    }
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
  SHOULDER: [0.34, 1.14],   // where its arms hang from, facing you (x either side)
  draw(ctx, c, P0) {
    if (c.fallT !== undefined) { this.drawFall(ctx, c, P0); return; }
    const P = this.shaded(c, P0);
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 12, 0, 1), lunge = c.lunge || 0;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), skin = P.col([160, 140, 122]), black = P.col([8, 6, 6]);
    // rearing back from the light: it straightens, its head goes back and aside, one arm comes up across its face and its
    // mouth opens; the other is flung out to the side, the fingers spread against it
    const rec = smoothstep(clamp(c.recoil || 0, 0, 1));
    const bob = c.moving ? Math.abs(Math.sin(g)) * 0.06 : Math.sin(t * 1.4) * 0.02, hunch = 0.25 * (1 - rec * 0.8);
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = c.moving ? Math.max(0, Math.sin(ph)) * 0.18 : 0;
      P_limb(ctx, [[s * 0.16, 0.75 + bob], [s * 0.22 + Math.sin(ph) * 0.08 + s * rec * 0.06, 0.4 + lift * 0.6], [s * 0.2 + Math.sin(ph) * 0.14 + s * rec * 0.1, lift + 0.03]], 0.1, sackD);
    }
    // the body: a sack, sagging, patched, the seams showing
    ctx.save(); ctx.translate(0, bob + rec * 0.06);
    if (c.burn > 0) this.burnFlames(ctx, c, this.BURN_SPOTS, 0, true);   // (the flames behind it, rising up past its head and shoulders)
    P_ell(ctx, 0, 0.95, 0.5, 0.5, sack);
    P_poly(ctx, [[-0.42, 0.7], [0.42, 0.7], [0.36, 1.25 - hunch * 0.3], [-0.36, 1.25 - hunch * 0.3]], sack);
    for (let k = 0; k < 4; k++) P_line(ctx, -0.3 + k * 0.2, 0.75, -0.25 + k * 0.2, 1.2, 0.012, sackD);
    P_rect(ctx, -0.12, 0.85, 0.22, 0.16, sackD);
    // its arms: hanging heavy from its shoulders, the hands low by its knees, swinging a little against its legs as it
    // trudges and drifting as it stands; from about 6 m in they come up and out toward you, the fingers spread, grasping;
    // in its lunge they open wide (and as it charges, burning: c.charge). Burning, it beats at itself, both arms thrown up
    // and flailing over its head (c.flail). Each pose is [elbow x, y, hand x, y, the fingers' angle, spread, length]. They
    // hang from SHOULDER, inside the top of the sack, and hug its sides: the elbows no wider than its belly and a little
    // (they stood well out from it, and the arms came off its shoulders like a coat-hanger's)
    const fl = smoothstep(clamp(c.flail || 0, 0, 1)) * (1 - lunge), open = Math.max(lunge, clamp(c.charge || 0, 0, 1) * 0.8);
    const reach = smoothstep(clamp((near - 0.5) / 0.4, 0, 1)) * (1 - open), cl = c.clutch;
    const mix = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
    for (const s of [-1, 1]) {
      const sw = c.moving ? Math.sin(g + (s > 0 ? 0 : Math.PI)) : 0.2 * Math.sin(t * 0.9 + s * 1.3), sa = Math.abs(sw);   // (against the leg on its side)
      let a = [s * (0.46 - 0.02 * sw), 0.8 + 0.03 * sa, s * (0.43 - 0.06 * sw), 0.36 + 0.07 * sa, -Math.PI / 2 + s * (0.2 - 0.15 * sw), 0.28, 0.12];
      if (reach > 0.01) a = mix(a, [s * 0.54, 0.95, s * (0.4 + 0.03 * Math.sin(t * 4.3 + s)), 1.1 + 0.03 * Math.sin(t * 3.7 + s * 2), Math.PI / 2 - s * 1.1, 0.5, 0.15], reach);
      if (open > 0.01) a = mix(a, [s * 0.58, 1.28, s * 0.46, 1.5, Math.PI / 2 - s * 0.4, 0.4, 0.14], open);
      if (rec > 0.01) a = mix(a, s > 0 ? [0.48, 1.38, 0.08, 1.66, Math.PI / 2 + 0.3, 0.32, 0.13] : [-0.58, 1.0, -0.78, 1.2, Math.PI + 0.5, 0.42, 0.13], rec);   // (the one over its face, the fingers spread against the light)
      if (fl > 0.02) {
        const w = Math.sin(t * 13 + s * 1.7), v = Math.sin(t * 11 + s * 2.3);
        a = mix(a, [s * (0.54 + 0.08 * w), 1.5 + 0.12 * v, s * (0.38 + 0.24 * w), 2.0 + 0.14 * v, Math.PI / 2 + s * 0.4 + w * 0.3, 0.45, 0.13], fl);
      }
      if (cl && s > 0) a = [Math.max(0.46, cl[0] + 0.14), Math.min(cl[1], 1.0) - 0.15, cl[0], cl[1], Math.PI * 0.8, 0.34, 0.09];   // (round what it holds, the fingers curled over it)
      P_limb(ctx, [[s * this.SHOULDER[0], this.SHOULDER[1]], [a[0], a[1]], [a[2], a[3]]], 0.11, sack);
      fingers(ctx, a[2], a[3], a[4], a[5], a[6], 0.025, skin);
    }
    // the head: low, pushed forward, hair like straw, its mouth sewn shut
    ctx.save(); ctx.translate(-rec * 0.08, 1.2 - hunch * 0.2 + rec * 0.05); ctx.rotate(headTiltJerk(t, 3.3, 0.14) * (1 - lunge) * (1 - rec) - rec * 0.38);
    strands(ctx, 0, 0.42, 12, 0.3, P.col([120, 100, 60]), 9, t);
    P_ell(ctx, 0, 0.22, 0.2, 0.22, skin);
    const lk = smoothstep(lunge * 2), eh = lerp(0.025 * (1 - rec * 0.7), 0.035, lk);   // screwed shut against the glare; at you, wide and perfectly round
    P_ell(ctx, -0.08, 0.27, 0.035, eh, black); P_ell(ctx, 0.08, 0.27, 0.035, eh, black);
    if (rec < 0.3) this.eyes(ctx, c, [[-0.08, 0.27], [0.08, 0.27]]);
    // straining at its stitches as it nears you, and as it rears back from the light; in your face they pull wide, two of
    // them snap, and its teeth show through, top and bottom
    const scream = Math.max(fl, clamp(c.charge || 0, 0, 1)) * (1 - lunge);   // burning: shrieking against its stitches
    const strain = near * (0.006 + 0.004 * Math.sin(t * 7.3)) + rec * 0.03 + smoothstep(lunge) * 0.17 + scream * (0.07 + 0.012 * Math.sin(t * 37));   // in your face, pulled open tall
    this.sewnMouth(ctx, P, 0, 0.1 - lunge * 0.012, 0.25 + lunge * 0.02, strain, (lunge > 0.35 || scream > 0.5 ? 1 : 0) + (lunge > 0.7 ? 1 : 0), 5, t);
    ctx.restore();
    if (c.burn > 0) this.burnFlames(ctx, c, this.BURN_SPOTS, 0, false);   // (and the ones on its front)
    ctx.restore();
  },
  // ---- on fire (night 11: every switch on at once and the main pushed on sets the farm alight, and it with it) ----
  // c.burn (0..1): how far the fire has taken it, catching at its middle and spreading over it; c.char (0..1): how
  // scorched it is. The flames are drawn over whatever pose it is in, leaning back off it as it runs.
  // A flame: one frame of a flickering tongue of fire from a strip of FLAME.n frames painted once (flameStrip), so a farm
  // full of them costs a drawImage each. flame(ctx, x, y, w, h, t, seed, a): its foot at (x, y), w across and h tall (in
  // a sprite's metres, +y up), t (seconds) its flicker, seed its own, a how much of it there is. Reduced motion: it
  // flickers slower and sways less.
  FLAME: { n: 16, w: 96, h: 128, u: 56, foot: 0.2, sheet: null },   // (u: the flame's own width in a frame w wide, room for its tongues to sway out; foot: how much of its height fades in from its foot)
  flameStrip() {
    const F = this.FLAME;
    if (F.sheet || typeof document === 'undefined') return F.sheet;
    const cv = document.createElement('canvas'); cv.width = F.w * F.n; cv.height = F.h;
    const g = cv.getContext('2d');
    if (!g) return null;
    const tongue = (w, h, sway, bulge, stops) => {   // a tongue of flame, its foot on 0 and its tip h up, swayed aside
      const gr = g.createLinearGradient(0, 0, 0, -h);
      for (const [o, col] of stops) gr.addColorStop(o, col);
      g.fillStyle = gr; g.beginPath(); g.moveTo(-w / 2, 0);
      g.bezierCurveTo(-w * 0.64 * bulge, -h * 0.34, -w * 0.18 + sway * 0.45, -h * 0.72, sway, -h);
      g.bezierCurveTo(w * 0.18 + sway * 0.45, -h * 0.72, w * 0.64 * bulge, -h * 0.34, w / 2, 0);
      g.quadraticCurveTo(0, h * 0.05, -w / 2, 0); g.fill();
    };
    // each frame a ragged crown of tongues (one tall in the middle, two lower either side, each swaying and stretching on
    // its own beat, all looping in the strip), soft at the edges, a hotter orange body in it and a pale core at its foot
    const soft = 'filter' in g, U = F.u;
    for (let i = 0; i < F.n; i++) {
      const ph = i / F.n * TAU, H = F.h - 8;
      g.save(); g.translate(i * F.w + F.w / 2, F.h - 4); g.beginPath(); g.rect(-F.w / 2, -F.h, F.w, F.h); g.clip();
      const halo = g.createRadialGradient(0, -H * 0.25, 0, 0, -H * 0.25, U * 0.55);   // the glow round its foot
      halo.addColorStop(0, 'rgba(255,120,40,0.3)'); halo.addColorStop(1, 'rgba(255,80,20,0)');
      g.fillStyle = halo; g.fillRect(-F.w / 2, -H * 0.8, F.w, H * 0.8);
      const crown = [[0, 1, 0], [-0.24, 0.62, 2.1], [0.26, 0.7, 4.2], [-0.1, 0.8, 1.1]].map(([x, hh, o]) => ({ x: x * U, h: H * hh * (0.8 + 0.13 * Math.sin(3 * ph + o) + 0.07 * Math.sin(5 * ph + o * 2)), sw: (Math.sin(ph + o) * 0.16 + Math.sin(2 * ph + o * 1.7) * 0.07) * U }));
      if (soft) g.filter = 'blur(1.4px)';
      const lk = (i / F.n * 2) % 1, la = Math.sin(Math.PI * lk);   // a lick broken off the top, rising and going out (twice a cycle)
      if (la > 0.05) { g.globalAlpha = la * 0.8; g.save(); g.translate(crown[0].sw * 1.3, -crown[0].h * (0.66 + 0.34 * lk)); tongue(U * 0.18, H * 0.16, crown[0].sw * 0.1, 1, [[0, 'rgba(255,140,40,0.9)'], [1, 'rgba(230,60,20,0)']]); g.restore(); g.globalAlpha = 1; }
      for (const t of crown) { g.save(); g.translate(t.x, 0); tongue(U * 0.5, t.h, t.sw, 1.1, [[0, 'rgba(250,86,22,0.9)'], [0.5, 'rgba(226,58,14,0.7)'], [1, 'rgba(140,24,8,0)']]); g.restore(); }
      if (soft) g.filter = 'blur(0.8px)';
      for (const t of crown.slice(0, 3)) { g.save(); g.translate(t.x * 0.7, 0); tongue(U * 0.36, t.h * 0.7, t.sw * 0.7, 1, [[0, 'rgba(255,178,48,0.95)'], [0.55, 'rgba(255,128,30,0.75)'], [1, 'rgba(255,96,20,0)']]); g.restore(); }
      tongue(U * 0.3, crown[0].h * 0.4, crown[0].sw * 0.3, 0.95, [[0, 'rgba(255,250,214,1)'], [0.6, 'rgba(255,222,120,0.85)'], [1, 'rgba(255,196,90,0)']]);
      if (soft) g.filter = 'none';
      // its foot faded out (F.foot of its height), so there is no hard flat line along the bottom of it: it comes up out of
      // whatever it is burning on
      g.globalCompositeOperation = 'destination-out';
      const ft = g.createLinearGradient(0, 0, 0, -H * F.foot);
      ft.addColorStop(0, 'rgba(0,0,0,1)'); ft.addColorStop(0.3, 'rgba(0,0,0,0.72)'); ft.addColorStop(0.65, 'rgba(0,0,0,0.25)'); ft.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = ft; g.fillRect(-F.w / 2, -H * F.foot, F.w, H * F.foot + 4);
      g.globalCompositeOperation = 'source-over';
      g.restore();
    }
    F.sheet = cv;
    return cv;
  },
  flame(ctx, x, y, w, h, t, seed, a, add) {   // (add: laid on as light, brightening what it overlaps)
    const sh = this.flameStrip(), F = this.FLAME;
    if (!sh || a <= 0.01 || w <= 0 || h <= 0) return;
    const rm = typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.settings.reducedMotion ? 0.4 : 1;
    const f = ((Math.floor(t * 15 * rm + seed * 5.3) % F.n) + F.n) % F.n, k = 1 + Math.sin(t * 9 * rm + seed * 2.1) * 0.08 * rm;
    ctx.save(); ctx.translate(x, y + h * k); ctx.scale(1, -1);
    if (a < 1) ctx.globalAlpha *= a;
    if (add) ctx.globalCompositeOperation = 'lighter';
    const ww = w * F.w / F.u;
    ctx.drawImage(sh, f * F.w, 0, F.w, F.h, -ww / 2, 0, ww, h * k);
    ctx.restore();
  },
  // where it burns, standing (and turning, charging and in your face): [x, y, size, behind] in its metres, (x, y) the
  // foot of the flame, the first catching first. Every flame's foot is on it, never out in the air beside it: the ones
  // behind it (behind: drawn before it) stand with their feet hidden behind its body and head, and only the fire rising
  // up past its shoulders and over its head shows; the ones on its front have their feet well inside its body, kept in
  // from its edges by their own width (about 0.4 size either side). Its face is left clear: the flames on its front are
  // low and to either side of it, and what is over its head is behind it. (test/nights/night11.js checks every foot
  // against its outline, in every burning pose)
  BURN_SPOTS: [[0.02, 0.5, 0.36], [-0.24, 0.7, 0.36], [0.26, 0.66, 0.34], [-0.2, 1.0, 0.6, true], [0.21, 0.97, 0.58, true], [0, 1.12, 0.66, true], [-0.32, 0.93, 0.3], [0.33, 0.9, 0.3]],
  // running: the same, from where its body, shoulders and head are in this stride (drawRun), in the spine's frame:
  // [along the spine from the body's middle, out of its front, size, behind] (or [x, y] from its head with head: true)
  RUN_SPOTS: [[0, 0.06, 0.4], [-0.24, 0.04, 0.34], [0.1, -0.02, 0.56, true], [-0.18, -0.02, 0.48, true], [0.32, 0, 0.5, true], [-0.07, -0.01, 0.38, true, true], [0.26, 0.02, 0.32]],
  // the flames of the spots behind it (behind true) or on it (false), each growing as the fire takes it (c.burn), foot at
  // (x, y); running, each leans back off it (lean: how far)
  burnFlames(ctx, c, spots, lean, behind) {
    const b = clamp(c.burn || 0, 0, 1), t = c.t, n = spots.length;
    for (let i = 0; i < n; i++) {
      const [x, y, s, back] = spots[i], on = clamp(b * (n + 2) - i, 0, 1);
      if (on <= 0 || !!back !== behind) continue;
      const sz = s * (0.45 + 0.55 * on), seed = i * 1.7 + (c.idx || 0) * 3.1;
      if (!lean) { this.flame(ctx, x, y, sz * 0.82, sz * 1.75, t, seed, Math.min(1, on * 1.5)); continue; }
      ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, -lean, 1, 0, 0);   // leaning back off it as it runs
      this.flame(ctx, 0, 0, sz * 0.8, sz * 1.8, t, seed, Math.min(1, on * 1.5));
      ctx.restore();
    }
  },
  // flat out, seen from the side, bent double: the sack of its body tipped forward over short legs going like pistons, its
  // long arms hanging from the shoulders and swinging against them, the hands down by its knees, the head thrust out low
  // ahead with its straw hair streaming back. At a walk (c.runPace below 1) the stride shortens and it rides more upright,
  // the arms swinging less.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, t = c.t, pace = c.runPace === undefined ? 1 : c.runPace;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), sackL = P.col([126, 108, 82]), skin = P.col([160, 140, 122]), skinD = P.col([118, 100, 86]);
    const black = P.col([8, 6, 6]), hair = P.col([120, 100, 60]);
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
    // an arm, hanging from the shoulder and swinging fore and aft against the leg on its side (o: its phase), the elbow
    // bending as it comes forward, the hand low, fingers trailing; to (x, y): the hand there instead (holding a thing)
    const shX0 = hipX + sp[0] * 0.72, shY0 = hipY + sp[1] * 0.72;
    const arm = (o, col, hcol, to) => {
      const q = Math.sin(g + o), a = 0.05 + (0.12 + 0.28 * pace) * q, b = a + 0.1 + 0.2 * Math.max(0, q);
      let ex = shX0 + Math.sin(a) * 0.38, ey = shY0 - Math.cos(a) * 0.38, hx = ex + Math.sin(b) * 0.38, hy = ey - Math.cos(b) * 0.38, fa = b - Math.PI / 2;
      if (to) { hx = to[0]; hy = to[1]; ex = (shX0 + hx) / 2 + 0.16; ey = (shY0 + hy) / 2 - 0.1; fa = Math.PI * 0.8; }
      P_limb(ctx, [[shX0, shY0], [ex, ey], [hx, hy]], 0.1, col);
      fingers(ctx, hx, hy, fa, 0.26, 0.11, 0.024, hcol);
    };
    arm(0, sackD, skinD);   // the far arm, behind the body (against the far leg)
    // the body: a sack slung forward from the hips, sagging at the belly, the light along its back, a seam or two
    const cx = hipX + sp[0] * 0.4 + 0.03, cy = hipY + sp[1] * 0.4;
    const shX = hipX + sp[0] * 0.76, shY = hipY + sp[1] * 0.76;   // the shoulders, out over its front
    const nod = Math.sin(g * 2) * 0.02 * pace, hdx = shX + 0.17, hdy = shY + 0.05 + nod;   // the head, low and thrust out ahead of them
    const fire = c.burn > 0 ? this.RUN_SPOTS.map(([a, f, s, back, head]) => (head ? [hdx + a, hdy + f, s, back] : [cx + sp[0] * a + fw[0] * f, cy + sp[1] * a + fw[1] * f, s, back])) : null;
    if (fire) this.burnFlames(ctx, c, fire, 0.6 * pace, true);   // (the flames behind it, streaming back off its back, shoulders and head)
    P_ell(ctx, cx, cy, 0.5, 0.37, sack, rot);
    P_ell(ctx, cx + fw[0] * 0.13, cy + fw[1] * 0.13, 0.38, 0.22, sackD, rot);
    P_ell(ctx, cx - fw[0] * 0.19, cy - fw[1] * 0.19, 0.36, 0.11, sackL, rot);
    for (const u of [-0.12, 0.14]) P_line(ctx, cx + sp[0] * u - fw[0] * 0.3, cy + sp[1] * u - fw[1] * 0.3, cx + sp[0] * u + fw[0] * 0.1, cy + sp[1] * u + fw[1] * 0.1, 0.014, sackD);
    // the head, low and thrust out ahead of the shoulders, the face in profile on its front
    for (let i = 0; i < 9; i++) {   // the straw hair, streaming back as it goes
      const a = Math.PI * (0.66 + i * 0.04) + Math.sin(t * 9 + i * 1.7) * 0.06 * pace, l = 0.22 + 0.1 * Math.sin(i * 2.1) + 0.14 * pace;
      const x0 = hdx - 0.06 + i * 0.014, y0 = hdy + 0.15 - i * 0.016;
      P_line(ctx, x0, y0, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l * 0.55, 0.016, hair);
    }
    P_ell(ctx, hdx, hdy, 0.17, 0.19, skin, -0.25);
    P_ell(ctx, hdx - 0.07, hdy + 0.01, 0.09, 0.14, skinD, -0.25);                                         // the side of the skull, shadowed
    P_ell(ctx, hdx + 0.07, hdy + 0.06, 0.032, 0.024, black);                                               // the eye
    this.eyes(ctx, c, [[hdx + 0.07, hdy + 0.06]]);
    ctx.save(); ctx.translate(hdx + 0.1, hdy - 0.075); ctx.rotate(-0.25); ctx.scale(0.7, 1);              // the mouth, sewn shut, seen from the side
    this.sewnMouth(ctx, P, 0, 0, 0.15, 0.004 + 0.01 * pace, 0, 3, t);
    ctx.restore();
    leg(legs[0], sack, skin);   // the near leg, in front of the body
    // the near arm: hanging and swinging against the near leg (holding a thing, c.clutch, its hand there); burning, it
    // beats at the flames over its head instead
    if ((c.burn || 0) <= 0.2) arm(Math.PI, sack, skin, c.clutch ? [c.clutch[0] * (c.runDir || 1), c.clutch[1]] : null);
    else {
      const w = Math.sin(t * 12), v = Math.cos(t * 12), hx = shX + 0.08 + 0.24 * w, hy = shY + 0.72 + 0.1 * v;
      P_limb(ctx, [[shX - 0.04, shY - 0.02], [shX + 0.16 + 0.06 * v, shY + 0.38], [hx, hy]], 0.11, sack);
      fingers(ctx, hx, hy, Math.PI / 2 + w * 0.5, 0.45, 0.12, 0.024, skin);
    }
    if (fire) this.burnFlames(ctx, c, fire, 0.6 * pace, false);   // (and the ones on its side)
    ctx.restore();
  },
  // Its end, in the light (c.fallT seconds in). FALL.shriek: it rears up screaming, shaking, an arm over its face and the
  // other thrown up and out, clawing at the air. Then its knees go and it sinks, swaying, both arms coming down
  // (FALL.sink). Then it comes apart (FALL.apart): the sack of its body drops and slumps open down the middle with the
  // straw it was stuffed with spilling out across the ground, the head drops off and rolls away onto its side, the arms
  // fall loose either side. Then it lies there, a heap of sacking and straw, a little dust going up off it in the light.
  FALL: { shriek: 0.9, sink: 1.0, apart: 1.3 },
  drawFall(ctx, c, P) {
    const F = this.FALL, t = c.fallT, t1 = F.shriek, t2 = t1 + F.sink;
    const sack = P.col([96, 80, 60]), sackD = P.col([62, 50, 36]), sackL = P.col([128, 110, 84]), inner = P.col([34, 26, 18]), skin = P.col([160, 140, 122]), skinD = P.col([118, 100, 86]);
    const black = P.col([8, 6, 6]), straw = P.col([176, 150, 84]), strawD = P.col([128, 106, 56]);
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
      // one arm up over its face against the light; the other thrown up and out, the fingers clawing, then both going slack
      const up = rec, cw = Math.sin(t * 23) * 0.04 * shake;
      const [shx, shy] = this.SHOULDER;
      P_limb(ctx, [[shx, shy], [lerp(0.5, 0.48, up), lerp(0.76, 1.38, up)], [lerp(0.54, 0.08, up), lerp(0.5, 1.66, up)]], 0.11, sack);
      fingers(ctx, lerp(0.54, 0.08, up), lerp(0.5, 1.66, up), lerp(-Math.PI / 2, Math.PI / 2 + 0.3, up), 0.32, 0.13, 0.025, skin);
      const lx = lerp(-0.52, -0.8 + cw, up), ly = lerp(0.48, 1.86, up);
      P_limb(ctx, [[-shx, shy], [lerp(-0.5, -0.62, up), lerp(0.8, 1.42, up)], [lx, ly]], 0.11, sack);
      fingers(ctx, lx, ly, lerp(-Math.PI / 2 - 0.2, Math.PI / 2 + 0.5 + cw * 4, up), lerp(0.28, 0.42, up), 0.13, 0.025, skin);
      // the head thrown back, the mouth wide open in the scream, then lolling
      ctx.save(); ctx.translate(-0.06, 1.25); ctx.rotate(-0.4 * (1 - sink) + side * 0.7 * sink + Math.sin(t * 47) * 0.05 * shake);
      strands(ctx, 0, 0.42, 12, 0.3, P.col([120, 100, 60]), 9, c.t);
      P_ell(ctx, 0, 0.22, 0.2, 0.22, skin);
      P_ell(ctx, -0.08, 0.29, 0.04, 0.012, black); P_ell(ctx, 0.08, 0.29, 0.04, 0.012, black);
      // the stitches tearing as it screams: three of them go, and the slit gapes, then sags
      this.sewnMouth(ctx, P, 0, 0.09, 0.26, (0.1 + Math.sin(t * 41) * 0.006 * shake) * (1 - sink * 0.45), t < 0.25 ? 2 : 3, 5, c.t);
      ctx.restore();
      ctx.restore();
      return;
    }
    // apart: k runs 0..1 over the coming apart, and on past it the heap lies still
    const k = clamp((t - t2) / F.apart, 0, 1), ks = smoothstep(k);
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
    this.sewnMouth(ctx, P, 0, -0.09, 0.22, 0.035, 3, 5, 0);   // its mouth, torn half open
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
