'use strict';
// The other: a porcelain doll the size of a small girl, always behind you, only ever seen in a mirror. It comes on
// steadily while no mirror you are facing shows it; held in a glass it creeps in too (at the night's seenMult), but only
// in the snap of each move of its dance, so between moves it is still dead still (speedMult). c.back draws it from behind: the night sets it for the glass behind it while
// it lunges, and as it turns round on the spot before it comes out for the box.
// When the music box plays on the odd mirror's pedestal it comes out through that glass for the box, and the night drives
// it: c.rush (0..1) runs it at you, rocking hard on its stiff legs (c.runGait its stride); c.smile paints the smile on;
// c.arms[-1 | 1] = { k: 0..1, to: [x, y] } puts that arm out to a point (its own left of the view is -1); c.carry draws
// the box in its arms (at carryAt); and c.runPose runs it off side on in drawRun (c.runDir, c.runGait, c.runLat, as the
// walker runs round the house). c.angry (0..1) is its temper when the box is cranked before the wrong mirror, and it
// is grief, not rage: the painted brows go up in the middle, the lids droop at their outer corners over glass eyes gone
// red, the rims raw, dark red tears run down its cheeks, and its painted mouth is pulled down into an open, trembling
// sob over its little teeth; it stands with its arms hanging and its head bowed over to one side, its shoulders heaving
// with each sob. When it has you it is in that state all the way in (night 10 sets it as it catches you): the red eyes
// and the tears stay as it lunges, the sob opening into a wail and its hands coming up to take hold.
// In the glass it dances on the spot (dancePose): c.dance (0..1) is how far it is in its dance, c.danceT the dance's
// clock (the night runs it, so every mirror shows the same moment), and c.danceMir -1 draws the mirror image of it.
// c.tint (a light, as LIGHT.at gives) lights it by hand where the night has the renderer leave it unlit.
// pressed() is not the doll but what a dust sheet shows of it, pushing out through the cloth from behind (night 10's
// easter egg, every mirror covered: the night draws it on the sheet), and shroud() is that sheet coming at you with it
// inside: with c.shroud set, that is all that is drawn of it (nothing at all while c.shroud.hidden).
CREATURES.other = {
  name: 'the doll', h: 1.35, w: 0.72, faceY: 1.14, stepRate: 1.6, catchDist: 1.3, sound: null, seenFrac: 0.6,
  death: { delay: 0.4, dur: 0.6, sting: 'stingHum' },
  voice: { kind: 'hum', every: [6, 11] },
  carryAt: { y: 0.55, w: 0.34 },   // where c.carry's box sits in its arms: base height and size, in metres
  init(c) { c.back = false; c.dance = 1; c.danceT = 0; c.danceMir = 1; },
  // unseen it comes on steadily. Seen, its pace (on average the same) all goes into the snaps of its dance: it closes in
  // only in the first creepWin seconds of each beat (of its dance clock, c.danceT, over the last frame), so the glass
  // shows it a step nearer with every move and dead still between. Not dancing (upset), it creeps on steadily
  creepWin: 0.15,
  speedMult(c, dt, seen) {
    if (!seen || (c.dance || 0) < 1 || dt <= 0) return 1;
    const B = this.danceBeat, W = this.creepWin, inWin = x => Math.floor(x / B) * W + Math.min(((x % B) + B) % B, W);
    const t = c.danceT || 0;
    return (inWin(t) - inWin(t - dt)) * (B / W) / dt;
  },
  lateral(c) { return c.runLat || 0; },
  // The dance: a wind-up doll's, stiff and sudden. Each move is a snap: it clicks into its pose all at once (a tiny jolt
  // past it and back), and then holds there dead still, not a twitch, a long while, until the next move snaps it into the
  // next. Its lead arm (the one on the left of the view) goes out with the forearm hanging off the elbow, up high, flops
  // over at the wrist, and comes down bent like a broken toy's; the knee on the other side comes up, twice; the head snaps
  // over, mostly away from the lead arm; it leans from one foot onto the other; and every move is lopsided, so the mirror
  // image of one is never the same picture: even waiting it stands with one foot set out to the side, and where both
  // forearms jerk up together one leg kicks out sideways and it leans off it. Each key is one move's pose: aL/aR each upper
  // arm's angle out from hanging (radians), bL/bR each forearm's bend out from its upper arm, rL/rR each wrist's roll,
  // kL/kR each knee's lift (0..1), xL/xR each leg's swing out to its side from the hip (0..1), tilt the head's (+: toward
  // the left of the view) and sway the body's lean (+: to the left).
  danceBeat: 1.8,                       // seconds from one move to the next: the snap, then the hold
  danceSnap: { t: 0.06, over: 0.07, settle: 0.1 },   // the snap: into the pose in t, past it by over, back in settle
  danceKeys: [
    { aL: 0.39, bL: -0.21, aR: 0.39, bR: -0.21, xL: 0.7, sway: -0.05, tilt: 0.1 },                  // waiting, one foot set out to the side
    { aL: 1.45, bL: -1.25, aR: 0.45, bR: -0.2, kR: 0.2, tilt: -0.3, sway: 0.06 },                  // the lead arm out, its forearm dangling
    { aL: 2.5, bL: 0.3, rL: 1.0, aR: 0.5, bR: -0.25, kR: 0.95, tilt: -0.38, sway: 0.06 },          // up high, and the other knee up
    { aL: 2.6, bL: -0.95, rL: -1.2, aR: 0.4, bR: -0.2, kL: 0.2, tilt: 0.26, sway: -0.01 },         // the hand flops over; the head snaps to it
    { aL: 1.6, bL: 1.25, rL: 0.5, aR: 1.1, bR: -0.95, rR: -0.3, kR: 0.2, tilt: -0.32, sway: -0.07 }, // bent up square; the other arm half out, hanging
    { aL: 0.7, bL: -0.3, aR: 1.0, bR: -1.05, kR: 0.85, tilt: -0.36, sway: 0.08 },                 // the knee again
    { aL: 0.42, bL: -0.2, aR: 0.55, bR: -0.4, xR: 0.7, tilt: 0.3, sway: 0.05 },                    // arms down, the head over the other way, a foot out
    { aL: 0.6, bL: 1.5, aR: 0.6, bR: 1.5, xL: 1.0, kL: 0.15, tilt: -0.24, sway: -0.08 },          // both forearms jerk up together, one leg kicked out
  ],
  danceParts: ['aL', 'bL', 'rL', 'kL', 'xL', 'aR', 'bR', 'rR', 'kR', 'xR', 'tilt', 'sway'],
  // how far into the next pose it is, s seconds after the move began: snapped there almost at once, a jolt past it and
  // back, then dead still
  snap(s) {
    const S = this.danceSnap;
    if (s < S.t) { const x = s / S.t; return (1 + S.over) * (1 - (1 - x) * (1 - x) * (1 - x)); }
    return 1 + S.over * (1 - smoothstep(clamp((s - S.t) / S.settle, 0, 1)));
  },
  // its pose at dance time t; mir -1 is exactly the same pose with left and right swapped
  dancePose(t, mir) {
    const K = this.danceKeys, N = K.length, b = t / this.danceBeat, n = Math.floor(b), e = this.snap((b - n) * this.danceBeat);
    const A = K[(((n - 1) % N) + N) % N], B = K[((n % N) + N) % N];
    const p = {};
    for (const k of this.danceParts) p[k] = lerp(A[k] || 0, B[k] || 0, e);
    return mir < 0 ? this.mirrorPose(p) : p;
  },
  mirrorPose(p) { return { aL: p.aR, bL: p.bR, rL: p.rR, kL: p.kR, xL: p.xR, aR: p.aL, bR: p.bL, rR: p.rL, kR: p.kL, xR: p.xL, tilt: -p.tilt, sway: -p.sway }; },
  // Pressing out through a dust sheet from inside: the cloth, pushed into the shape of it. Drawn on the sheet, in metres
  // (x across, y up from the floor below it), all in the cloth's own colours (o.cloth: base, fold, lite, deep), light where
  // it is pushed out at you and dark where it is not: o.k (0..1) is how far its face is into the cloth (the smooth swell of
  // its head, the ridge of its brow, the two hollows of its eye sockets, its nose, and its mouth, opening into a wail as
  // it comes), o.hands (0..1) its two hands, one either side of its face, palms flat to the cloth and fingers spread, the
  // cloth webbed taut between the fingertips; both grow as they press (the cloth stretching out toward you), and from each
  // the cloth is pulled into creases to the top of the frame it hangs from and out to its sides. o.t is its clock: the
  // cloth trembles with the strain (o.still: it does not). o.y: how high its face is (1.17: the doll's, seen in a sheet
  // just before it). For the lunge in the sheet (shroud): o.bare leaves out the creases to the frame, o.reach (0..1)
  // brings its hands in and on toward you, and o.wail (0..1) drops its jaw.
  pressed(ctx, P, o) {
    const k = clamp(o.k || 0, 0, 1), hk = clamp(o.hands || 0, 0, 1);
    if (k <= 0 && hk <= 0) return;
    const C = Object.assign({ base: [156, 148, 132], fold: [114, 106, 94], lite: [180, 172, 156] }, o.cloth);
    const hi = C.lite.map(v => Math.min(255, v + 22)), deep = C.deep || C.fold.map(v => v * 0.5);
    const t = o.t || 0, shiver = o.still ? 0 : 1;
    // a soft-edged patch of light or shade on the cloth
    const blob = (x, y, rx, ry, c, a, rot) => {
      ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(rx, ry);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, P.cola(c, a)); g.addColorStop(0.55, P.cola(c, a * 0.75)); g.addColorStop(1, P.cola(c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
    };
    // a crease pulled taut from (x, y) toward (tx, ty), from r0 out, as far as it is pressed (kk)
    const crease = (x, y, tx, ty, r0, w, kk) => {
      const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy), r1 = r0 + (d - r0) * (0.3 + 0.7 * kk), ux = dx / d, uy = dy / d;
      P_line(ctx, x + ux * r0, y + uy * r0, x + ux * r1, y + uy * r1, w, P.cola(C.fold, 0.8 * kk));
      P_line(ctx, x + ux * r0 + uy * w, y + uy * r0 - ux * w, x + ux * r1 + uy * w * 0.5, y + uy * r1 - ux * w * 0.5, w * 0.7, P.cola(hi, 0.6 * kk));
    };
    const fy = (o.y || 1.17) + 0.05 * k, S = lerp(1.3, 1.85, k) * (1 + 0.012 * Math.sin(t * 33) * shiver * k), reach = clamp(o.reach || 0, 0, 1), wail = clamp(o.wail || 0, 0, 1);
    if (k > 0) {
      if (!o.bare) for (const [x, y, w] of [[-0.8, 2.56, 0.03], [0.76, 2.56, 0.03], [-0.26, 2.6, 0.022], [0.3, 2.6, 0.022], [-0.98, 1.55, 0.022], [0.98, 1.65, 0.022], [-0.62, 0.15, 0.02], [0.56, 0.12, 0.02]]) crease(0, fy, x, y, 0.19 * S, w, k);
      ctx.save(); ctx.translate(0, fy); ctx.scale(S, S);
      blob(0, 0, 0.26, 0.3, C.base, k);                    // the cloth drawn smooth over it
      blob(0, -0.215, 0.2, 0.1, C.fold, 0.85 * k);         // the hollow under its chin
      blob(0, 0.035, 0.15, 0.19, C.lite, 0.95 * k);        // its head, pushing the cloth out
      blob(0, 0.07, 0.1, 0.1, hi, 0.7 * k);
      blob(0, 0.085, 0.105, 0.04, hi, 0.85 * k);           // the ridge of its brow
      for (const s of [-1, 1]) {
        blob(s * 0.048, 0.012, 0.043, 0.044, deep, 0.95 * k);                       // an eye socket: the cloth sucked into it
        P_ell(ctx, s * 0.048, 0.01, 0.021, 0.024, P.cola(deep, 0.85 * k));
        blob(s * 0.082, -0.05, 0.04, 0.04, hi, 0.55 * k);                           // a cheek
      }
      blob(0, -0.028, 0.02, 0.05, hi, k);                  // its nose
      blob(0, -0.068, 0.026, 0.013, C.fold, 0.8 * k);
      const open = smoothstep((k - 0.25) / 0.75), my = -0.108 - 0.014 * open - 0.016 * wail, mw = 0.03 + 0.007 * open + 0.008 * wail, mh = 0.013 + 0.032 * open + 0.03 * wail;
      blob(0, my, mw * 1.7, mh * 1.6, deep, 0.9 * k);      // its mouth: open, and opening
      P_ell(ctx, 0, my, mw, mh, P.cola(deep, 0.9 * k));
      blob(0, my + mh + 0.012, 0.04, 0.012, hi, 0.6 * k);  // the upper lip
      blob(0, my - mh - 0.024, 0.045, 0.026, hi, 0.7 * k); // its chin
      ctx.restore();
    }
    if (hk > 0) for (const s of [-1, 1]) {
      const Sh = lerp(1.35, 2.0, hk) * (1 + 0.014 * Math.sin(t * 29 + s) * shiver * hk) * (1 + 0.2 * reach), hx = s * (lerp(0.4, 0.5, hk) - 0.07 * reach), hy = fy - 0.04 - 0.1 * reach;
      if (!o.bare) for (const [x, y, w] of [[s * 1.0, hy + 0.55, 0.02], [s * 1.02, hy - 0.45, 0.02], [s * 0.9, 2.58, 0.024]]) crease(hx, hy, x, y, 0.13 * Sh, w, hk);
      ctx.save(); ctx.translate(hx, hy); ctx.scale(s * Sh, Sh);   // (the thumb on the side of its face)
      const F = [[-1.2, 0.05], [-0.42, 0.08], [-0.06, 0.088], [0.28, 0.08], [0.62, 0.064]], at = (a, r) => [Math.sin(a) * r, Math.cos(a) * r];
      const tips = F.map(([a, l]) => at(a, 0.035 + l));
      blob(0, 0.035, 0.17, 0.18, C.base, hk);              // the cloth drawn over the whole hand
      blob(0.01, -0.085, 0.12, 0.06, C.fold, 0.8 * hk);    // the hollow under the heel of it
      ctx.fillStyle = P.cola(C.lite, 0.55 * hk);           // the cloth, webbed taut from fingertip to fingertip
      ctx.beginPath(); ctx.moveTo(-0.035, -0.04); for (const q of tips) ctx.lineTo(q[0], q[1]); ctx.lineTo(0.04, -0.04); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 4; i++) { const am = (F[i][0] + F[i + 1][0]) / 2, q = at(am, 0.082); blob(q[0], q[1], 0.013, 0.03, deep, 0.6 * hk, -am); }   // the hollows between the fingers
      blob(0, 0, 0.052, 0.052, hi, 0.9 * hk);              // the palm
      for (let i = 0; i < 5; i++) {
        const b = at(F[i][0], 0.03), q = tips[i];
        P_line(ctx, b[0], b[1], q[0], q[1], 0.019, P.cola(C.lite, hk));
        P_line(ctx, b[0], b[1], q[0], q[1], 0.009, P.cola(hi, hk));
        P_ell(ctx, q[0], q[1], 0.0125, 0.0125, P.cola(hi.map(v => Math.min(255, v + 14)), hk));   // a fingertip, pressed hardest of all
      }
      ctx.restore();
    }
  },
  // The sheet coming at you with it inside (the end of night 10's easter egg): the face and the hands that pressed out
  // through the cloth (pressed, as far in as they were: o.press) are what lunges, and the rest of the sheet is dragged
  // after them. Drawn in the doll's own place (metres, from its feet, as it is o.d from you), from the sheet as it hung
  // (o.from off, its outline, its face o.press deep in it): as the face comes on, the sheet is first pulled out into a
  // cone, its edges still on the frame, then comes off the frame and trails behind it (never further back than TRAIL),
  // rounding from a sheet's shape into a ring about the face and flaring wider the further it comes, its hem rippling,
  // so that at the end it is past every edge of the view; folds run out from the face to the hem all the way round, and
  // the cloth darkens away from the face (it is further off). o.eye: the eye's height, o.up: how far the game has lifted
  // it (c.yOff), o.k: the lunge (0..1), o.t: its clock, o.still: reduced motion (less flare, no ripple, no tremble).
  // o.rim: how far the hem reaches from the face in this drawing, in these metres (kept for the tests).
  shroudHem: [[-0.9, 2.62], [-0.45, 2.62], [0, 2.62], [0.45, 2.62], [0.9, 2.62], [0.97, 2.56], [0.99, 2.0], [1.0, 1.4], [1.02, 0.75], [1.05, 0.1], [0.8, 0.05], [0.52, 0.11], [0.2, 0.03], [-0.1, 0.1], [-0.42, 0.04], [-0.74, 0.1], [-1.04, 0.07], [-1.02, 0.75], [-1.0, 1.4], [-0.99, 2.0], [-0.97, 2.56]],
  shroud(ctx, P, o) {
    const C = Object.assign({ base: [156, 148, 132], fold: [114, 106, 94], lite: [180, 172, 156] }, o.cloth);
    const TRAIL = 1.2, RING = 1.25, press = o.press === undefined ? 1 : o.press, k = clamp(o.k || 0, 0, 1), t = o.t || 0, calm = !!o.still;
    const d = o.d, z = Math.max(0, o.from - d), eye = o.eye, up = o.up || 0;
    const flow = smoothstep(z / 0.8), depth = TRAIL * (1 - Math.exp(-z / TRAIL)), m = d / (d + depth);
    const flare = lerp(1, calm ? 1.35 : 1.75, smoothstep((z - 0.6) / 2.2)), ripple = calm ? 0 : 0.07 * flow;
    // its face: where it was in the sheet, and on to where the game brings its face up to your eye
    const y0 = 1.17 + 0.05 * press, kk = lerp(press, 1, smoothstep(k)), fy = lerp(y0, 1.11, smoothstep(k)), fyP = fy - 0.05 * kk;
    const mid = lerp(y0, fy + up, smoothstep(z));   // the height the hem hangs about: where it hung, then its face's
    // a point of the sheet (as it hung: x across, y up) where it is now, in this drawing
    const at = (x, y, i) => {
      const vx = x, vy = y - y0, r = Math.hypot(vx, vy) || 1e-6, rr = lerp(r, RING, 0.5 * flow) * flare * (1 + ripple * Math.sin(i * 2.3 + t * 17)) / r;
      return [vx * rr * m, eye + (mid + vy * rr - eye) * m - up];
    };
    const hem = this.shroudHem.map(([x, y], i) => at(x, y, i));
    o.rim = Math.max(...hem.map(q => Math.hypot(q[0], q[1] - fy)));
    const path = () => { ctx.beginPath(); hem.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); };
    ctx.fillStyle = P.col(C.base); path(); ctx.fill();
    // further from its face the cloth is further from you: darker
    ctx.save(); path(); ctx.clip();
    const g = ctx.createRadialGradient(0, fy, 0.3, 0, fy, Math.max(0.35, o.rim));
    g.addColorStop(0, P.cola(C.fold, 0)); g.addColorStop(1, P.cola(C.fold.map(v => v * 0.7), 0.75 * flow));
    ctx.fillStyle = g; ctx.fillRect(-o.rim - 1, fy - o.rim - 1, 2 * o.rim + 2, 2 * o.rim + 2);
    ctx.restore();
    // the long folds it hung in, going as it is pulled
    const hung = 1 - smoothstep(k / 0.3);
    if (hung > 0) for (const [xa, xb, w] of [[-0.66, -0.72, 0.13], [0.04, 0.1, 0.15], [0.58, 0.68, 0.12]]) {
      P_poly(ctx, [at(xa, 2.5, 0), at(xb + w / 2, 0.15, 0), at(xb - w / 2, 0.15, 0)], P.cola(C.fold, hung));
      P_poly(ctx, [at(xa + 0.02, 2.5, 0), at(xb + w / 2 + 0.07, 0.15, 0), at(xb + w / 2, 0.15, 0)], P.cola(C.lite, hung));
    }
    // the folds from its face out to the hem, all the way round: a dark one to each point of the hem, light beside it
    const a = lerp(0.3, 0.9, flow), r0 = 0.3;
    hem.forEach((q, i) => {
      const dx = q[0], dy = q[1] - fy, len = Math.hypot(dx, dy); if (len < r0 * 1.2) return;
      const ux = dx / len, uy = dy / len, w = len * (i % 2 ? 0.03 : 0.045), b = [ux * r0, fy + uy * r0];
      P_poly(ctx, [b, [q[0] - uy * w, q[1] + ux * w], [q[0] + uy * w, q[1] - ux * w]], P.cola(C.fold, a));
      P_poly(ctx, [b, [q[0] + uy * w, q[1] - ux * w], [q[0] + uy * w * 2.3, q[1] - ux * w * 2.3]], P.cola(C.lite, a * 0.8));
    });
    this.pressed(ctx, P, { k: kk, hands: kk, y: fyP, bare: true, reach: smoothstep(k), wail: k, t, still: calm, cloth: o.cloth });
  },
  colours(P) {
    return {
      porcelain: P.col([234, 224, 210]), porcelainD: P.col([198, 186, 172]), hair: P.col([40, 27, 22]), hairL: P.col([68, 46, 34]),
      dress: P.col([178, 128, 142]), dressD: P.col([130, 88, 102]), lace: P.col([228, 220, 206]), ribbon: P.col([118, 22, 34]),
      stocking: P.col([216, 210, 200]), stockingD: P.col([176, 170, 162]), shoe: P.col([16, 12, 14]), glass: P.col([24, 20, 30]), lip: P.col([168, 34, 44]),
    };
  },
  draw(ctx, c, P) {
    if (c.shroud) { if (!c.shroud.hidden) this.shroud(ctx, P, Object.assign(c.shroud, { d: c.dist, up: c.yOff || 0, k: c.lunge || 0, t: c.t })); return; }   // in the sheet: the sheet is all there is to see
    if (c.tint) { const li = c.tint, Q = P; P = Object.assign({}, Q, { col: k => Q.col(LIGHT.apply(k, li)), cola: (k, a) => Q.cola(LIGHT.apply(k, li), a) }); }
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    const t = c.t, lunge = c.lunge || 0, back = !!c.back, rush = c.rush || 0, g = rush ? (c.runGait || 0) : (c.gait || 0);
    const K = this.colours(P), fury = clamp(c.angry || 0, 0, 1) * (1 - rush), limp = c.carry ? 0 : fury * (1 - lunge);   // its arms come up off its sides as it reaches for you
    // weeping, it sobs: a hitch every so often, sharp and then easing off (its shoulders heave, its head shudders)
    const sob = fury * Math.exp(-((t * 1.15) % 1) * 6) * (1 - lunge);
    // its dance, as far as it is in it (the night eases it out when it is angry or comes for the box; lunging, running or
    // reaching it has none), and the pose it is in: pose[s] for its arm and leg on that side of the view
    const w = clamp(c.dance || 0, 0, 1) * (1 - lunge) * (1 - rush) * (c.carry || c.arms ? 0 : 1);
    const dp = w > 0 ? this.dancePose(c.danceT || 0, c.danceMir || 1) : null;
    c.pose = dp;
    const pose = dp && { [-1]: { a: dp.aL, b: dp.bL, r: dp.rL, k: dp.kL, x: dp.xL }, 1: { a: dp.aR, b: dp.bR, r: dp.rR, k: dp.kR, x: dp.xR } };
    // far back in the glass its arms are kept two pixels across and its legs one and a half, so the dance still reads
    const m0 = ctx.getTransform(), pxM = 1 / Math.max(1e-6, Math.hypot(m0.a, m0.b)), armW = Math.max(0.045, pxM * 2);
    // a doll does not walk: it rocks from foot to foot, stiffly. Running at you it rocks harder and kicks its feet up
    const stepping = c.moving || rush > 0;
    const rock = stepping ? Math.sin(g) * (0.07 + 0.05 * rush) : 0;
    ctx.save(); ctx.rotate(rock + (dp ? dp.sway * w : 0));
    for (const s of [-1, 1]) {
      const lift = stepping ? Math.max(0, Math.sin(g + (s > 0 ? Math.PI : 0))) * (0.04 + 0.08 * rush) : 0;
      // a knee coming up: the foot rises off the floor and the knee turns out under the hem, stiffly, as a doll's would;
      // a leg out to the side: the whole of it swung out from the hip, stiff, the foot off the floor
      const kn = pose ? pose[s].k * w : 0, fy = 0.06 + lift + 0.2 * kn, th = s * (pose ? pose[s].x * w : 0) * 0.6;
      const ca = Math.cos(th), sa = Math.sin(th), out = ([x, y]) => [s * 0.07 + (x - s * 0.07) * ca - (y - 0.44) * sa, 0.44 + (y - 0.44) * ca + (x - s * 0.07) * sa];
      P_limb(ctx, [[s * 0.07, 0.44], [s * (0.072 + 0.075 * kn), 0.25 + 0.17 * kn], [s * (0.075 + 0.02 * kn), fy]].map(out), Math.max(0.07, pxM * 1.5), K.stocking);
      const foot = out([s * (0.085 + 0.02 * kn), fy - 0.025]);
      P_ell(ctx, foot[0], foot[1], 0.06, 0.035, K.shoe, th);
    }
    // the dress: a bell of faded pink over petticoats, a scalloped lace hem, a sash tied at the back
    P_poly(ctx, [[-0.13, 0.8], [0.13, 0.8], [0.3, 0.43], [-0.3, 0.43]], K.dress);
    for (let k = 0; k < 7; k++) P_ell(ctx, -0.27 + k * 0.09, 0.43, 0.05, 0.035, K.lace);
    P_poly(ctx, [[-0.12, 0.8], [0.12, 0.8], [0.12, 0.98], [-0.12, 0.98]], K.dress);
    P_rect(ctx, -0.125, 0.76, 0.25, 0.05, K.dressD);
    if (back) { P_ell(ctx, -0.06, 0.785, 0.06, 0.035, K.ribbon); P_ell(ctx, 0.06, 0.785, 0.06, 0.035, K.ribbon); P_line(ctx, 0.02, 0.77, 0.07, 0.6, 0.03, K.ribbon); P_line(ctx, -0.02, 0.77, -0.06, 0.6, 0.03, K.ribbon); }
    else { P_ell(ctx, -0.045, 0.975, 0.05, 0.03, K.lace); P_ell(ctx, 0.045, 0.975, 0.05, 0.03, K.lace); }
    // arms: jointed and stiff, a little out from the sides, swinging as it runs; reaching, one goes out to what it wants
    for (const s of [-1, 1]) {
      P_ell(ctx, s * 0.13, 0.94 + (fury * 0.018 + sob * 0.022) * (1 - w), 0.05, 0.045, K.dress);   // weeping, its shoulders hunch and heave (as the dance goes out of it)
      if (c.carry) continue;
      const swing = rush ? Math.sin(g + (s > 0 ? 0 : Math.PI)) * 0.09 * rush : 0;
      let ex = s * (0.19 + lunge * 0.05 - limp * 0.025), ey = 0.8 + lunge * 0.12 + swing * 0.4 + sob * 0.015, hx = s * (0.22 + lunge * 0.14 - limp * 0.05), hy = 0.64 + lunge * 0.36 + swing - limp * 0.03 + sob * 0.018;
      const limpHand = () => [hx, hy - 0.01 - limp * 0.006, 0.028 - limp * 0.004, 0.034 + limp * 0.006, 0];   // hanging limp when it weeps
      let hand = limpHand(), thumb = 0;
      if (pose) {
        // dancing: the upper arm out at its angle from the shoulder, the forearm bent off it, stiff as a jointed doll's;
        // the hand hangs off the end along the forearm, and rolls: narrowing as it turns edge on, its thumb coming round
        const q = pose[s], dx = s * (0.14 + 0.13 * Math.sin(q.a)), dy = 0.92 - 0.13 * Math.cos(q.a), fa = q.a + q.b;
        const gx = dx + s * 0.163 * Math.sin(fa), gy = dy - 0.163 * Math.cos(fa), rot = Math.atan2(gx - dx, dy - gy);
        ex = lerp(ex, dx, w); ey = lerp(ey, dy, w); hx = lerp(hx, gx, w); hy = lerp(hy, gy, w);
        const along = [Math.sin(rot) * 0.012, -Math.cos(rot) * 0.012];
        hand = [lerp(hand[0], hx + along[0], w), lerp(hand[1], hy + along[1], w), lerp(hand[2], 0.028 * (0.55 + 0.45 * Math.abs(Math.cos(q.r))), w), lerp(hand[3], 0.036, w), rot * w];
        thumb = s * Math.sin(q.r) * w;
      }
      const arm = c.arms && c.arms[s];
      if (arm && arm.k > 0) {
        const k = smoothstep(arm.k), [tx, ty] = arm.to;
        ex = lerp(ex, (s * 0.14 + tx) / 2, k); ey = lerp(ey, (0.92 + ty) / 2 + 0.03, k); hx = lerp(hx, tx, k); hy = lerp(hy, ty, k);
        hand = limpHand();
      }
      P_limb(ctx, [[s * 0.14, 0.92], [ex, ey], [hx, hy]], armW, K.porcelainD);
      P_ell(ctx, hand[0], hand[1], hand[2], hand[3], K.porcelain, hand[4]);
      if (thumb) P_ell(ctx, hand[0] + Math.cos(hand[4]) * thumb * 0.026, hand[1] + Math.sin(hand[4]) * thumb * 0.026 + 0.004, 0.01 * Math.abs(thumb), 0.014 * Math.abs(thumb), K.porcelain, hand[4]);
    }
    // holding the box: it is in front of it in both arms, its hands on the box's sides
    if (c.carry) {
      const A = this.carryAt;
      for (const s of [-1, 1]) P_limb(ctx, [[s * 0.14, 0.92], [s * 0.21, 0.78], [s * 0.17, A.y + A.w * 0.3]], 0.045, K.porcelainD);
      ctx.save(); ctx.translate(0, A.y); ctx.scale(A.w, A.w); c.carry(ctx, P); ctx.restore();
      for (const s of [-1, 1]) P_ell(ctx, s * 0.165, A.y + A.w * 0.27, 0.028, 0.034, K.porcelain);
    }
    // the head: too big for the body, tilted, snapping now and then to the other side; dancing, it goes where the dance puts it
    // weeping, its head hangs over to one side, bowed, and shudders with each sob
    const tilt = lerp(headTiltJerk(t, 2.7, 0.16) * (1 - lunge) * (1 - rush * 0.7) * (1 - fury) + fury * (0.17 * (1 - lunge * 0.6) + sob * 0.04 * Math.sin(t * 37)), dp ? dp.tilt : 0, w);
    ctx.save(); ctx.translate(0, 1.0 - (fury * 0.03 - sob * 0.012) * (1 - w)); ctx.rotate(tilt);
    P_rect(ctx, -0.025, -0.02, 0.05, 0.05, K.porcelainD);
    if (back) {
      // from behind: a mass of ringlets and the bow, no face at all
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) P_ell(ctx, s * (0.1 + (k & 1) * 0.02), 0.12 - k * 0.055, 0.036, 0.04, (k & 1) ? K.hairL : K.hair);
      P_ell(ctx, 0, 0.14, 0.13, 0.145, K.hair);
      for (let k = 0; k < 3; k++) P_ell(ctx, -0.055 + k * 0.055, 0.03 - (k & 1) * 0.02, 0.032, 0.05, (k & 1) ? K.hairL : K.hair);
    } else {
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) P_ell(ctx, s * (0.125 + (k & 1) * 0.015), 0.13 - k * 0.058, 0.034, 0.038, (k & 1) ? K.hairL : K.hair);
      P_ell(ctx, 0, 0.13, 0.115, 0.135, K.porcelain);
      // glass eyes, too big and too dark and blank, nothing in them, with painted lashes; the right one sits a little lower than the left.
      // Weeping (grief), the glass has gone red, the rims under them raw, and the lids droop over them at the outer corners,
      // lifting a little as it comes at you
      const eyeY = s => 0.135 - (s > 0 ? 0.006 : 0), er = 0.027 + lunge * 0.01, grief = fury > 0.5;
      // far back in the glass the red is what reads: the red glass is kept a pixel or two across, and the fog does not dull them
      const m = ctx.getTransform(), px = 1 / Math.max(1e-6, Math.hypot(m.a, m.b));
      for (const s of [-1, 1]) {
        const ey = eyeY(s);
        if (grief) P_ell(ctx, s * 0.045, ey - 0.003, er * 1.34, er * 1.45, P.cola([198, 46, 58], 0.6 * fury));   // the rims, raw from crying
        // the glass: dark, or gone red all over (a blank red, nothing in it), never less than a pixel or two across
        if (grief) P_ell(ctx, s * 0.045, ey, Math.max(er, px * 1.1), Math.max(er * 1.15, px), P.raw([214, 34, 30]));
        else P_ell(ctx, s * 0.045, ey, er, er * 1.15, K.glass);
        if (grief) {
          // (lunging, the grief turns to rage as it comes: the lid's slant tips over from drooping at the outer corner to
          // driven down at the inner one, with the brows)
          const rg = smoothstep((lunge - 0.15) / 0.6), lo = lunge * 0.006;
          const li = [s * 0.012, lerp(ey + 0.022 + lo, ey + 0.004, rg)], lu = [s * 0.096, lerp(ey - 0.014 + lo, ey + 0.022, rg)];   // the lid's edge, inner and outer
          P_poly(ctx, [[s * 0.008, ey + 0.05], [s * 0.1, ey + 0.05], [s * 0.1, lu[1]], lu, li, [s * 0.008, li[1]]], K.porcelain);
          P_line(ctx, li[0], li[1], lu[0], lu[1], 0.006, K.glass);
          P_ell(ctx, s * 0.045, ey - er * 1.02, er * 0.72, 0.0045, P.cola([255, 214, 214], 0.55));   // brimming along the lower lid
        }
      }
      P_ell(ctx, 0, 0.225, 0.118, 0.055, K.hair);
      for (const s of [-1, 1]) {
        const ey = eyeY(s);
        if (grief) {
          P_ell(ctx, s * 0.045, ey - 0.006, 0.036, 0.026, P.cola([255, 40, 24], 0.3 * fury));   // the red, glowing through the wet
          // the painted brow, up in the middle in grief; lunging, it swings over into a hard angry slant, down at the middle
          const rg = smoothstep((lunge - 0.15) / 0.6);
          P_limb(ctx, [[s * 0.014, lerp(ey + 0.041, ey + 0.016, rg)], [s * 0.045, lerp(ey + 0.033, ey + 0.034, rg)], [s * 0.094, lerp(ey + 0.006, ey + 0.054, rg)]], lerp(0.0075, 0.011, rg), K.glass);
          // the tears, dark red, from the outer corner down the cheek, a drop running down each now and then
          const tx = u => s * (0.066 + 0.008 * u + 0.003 * Math.sin(u * 7 + s)), ty = u => ey - er * 1.0 - u * (0.075 + lunge * 0.04);
          P_limb(ctx, [0, 0.35, 0.7, 1].map(u => [tx(u), ty(u)]), 0.0065, P.cola([116, 8, 20], 0.85));
          P_ell(ctx, tx(1), ty(1) - 0.002, 0.0062, 0.0085, P.cola([116, 8, 20], 0.9));
          const u = (t * 0.45 + (s > 0 ? 0.5 : 0)) % 1;
          P_ell(ctx, tx(u), ty(u), 0.0055, 0.007, P.cola([150, 14, 28], 0.95 * Math.sin(Math.PI * u)));
        } else {
          for (let k = -1; k <= 1; k++) P_line(ctx, s * 0.045 + k * 0.012, ey + 0.034, s * 0.045 + k * 0.018, ey + 0.048, 0.004, K.glass);
        }
      }
      P_ell(ctx, -0.07, 0.09, 0.022, 0.016, P.cola([224, 112, 124], 0.55)); P_ell(ctx, 0.07, 0.09, 0.022, 0.016, P.cola([224, 112, 124], 0.55));
      // a hairline crack down the temple onto the cheek, outside the eye on the left of the view: clear of the eye, its lid and
      // its glare at their widest (lunging, angry) and of the snarl, in every look it has
      P_limb(ctx, [[-0.108, 0.152], [-0.098, 0.124], [-0.104, 0.104], [-0.088, 0.084], [-0.092, 0.068]], 0.005, P.col([96, 80, 74]));
      if (grief) {
        // the painted mouth pulled down at the corners into an open sob, an arch over a row of little teeth, the lower lip
        // trembling. Lunging at you it opens into a wail, the jaw dropping as it comes
        ctx.save(); ctx.translate(Math.sin(t * 29) * 0.0015 * (1 - lunge), 0.052); ctx.scale(1 + lunge * 0.4, 1 + lunge * 0.8); ctx.translate(0, -0.052);
        const mw = 0.052, cy = 0.028, top = 0.1, bot = 0.04 - lunge * 0.05 + Math.sin(t * 43) * 0.004 * (1 - lunge);
        const arch = (w, y, a, b) => { ctx.beginPath(); ctx.moveTo(-w, y); ctx.quadraticCurveTo(0, a, w, y); ctx.quadraticCurveTo(0, b, -w, y); ctx.closePath(); };
        ctx.fillStyle = K.lip; arch(mw + 0.012, cy - 0.006, top + 0.016, bot - 0.014); ctx.fill();
        ctx.fillStyle = P.col([34, 8, 12]); arch(mw, cy, top, bot); ctx.fill();
        ctx.save(); arch(mw, cy, top, bot); ctx.clip();
        for (let k = -2; k <= 2; k++) { const x = k * 0.0145, u = (x / mw + 1) / 2, y = cy + 2 * u * (1 - u) * (top - cy); P_rect(ctx, x - 0.0055, y - 0.012, 0.011, 0.012, K.lace); }
        ctx.restore();
        ctx.restore();
      } else if (lunge > 0.25) P_ell(ctx, 0, 0.055, 0.02 + lunge * 0.035, 0.01 + lunge * 0.05, P.col([10, 4, 6]));
      else if (c.smile) {
        // the smile: painted on, and much too wide
        ctx.strokeStyle = K.lip; ctx.lineWidth = 0.011; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0.095, 0.058, Math.PI + 0.45, TAU - 0.45); ctx.stroke();
        P_ell(ctx, -0.05, 0.075, 0.006, 0.006, K.lip); P_ell(ctx, 0.05, 0.075, 0.006, 0.006, K.lip);
      } else P_ell(ctx, 0, 0.055, 0.016, 0.01, K.lip);
    }
    // a big bow on top
    P_poly(ctx, [[0, 0.27], [-0.13, 0.32], [-0.12, 0.2]], K.ribbon); P_poly(ctx, [[0, 0.27], [0.13, 0.32], [0.12, 0.2]], K.ribbon);
    P_ell(ctx, 0, 0.265, 0.03, 0.025, K.ribbon);
    ctx.restore();
    ctx.restore();
  },
  // flat out, side on, as it takes the box away: a doll's stiff legs swinging from the hip like a wind-up toy's (there are
  // no knees to bend), so it bobs down as they spread; the skirt blown back, the sash's tails and the ringlets flying, the
  // box hugged to its chest, the painted smile seen from the side. c.runDir is +1 running to the right of the view, -1 to
  // the left; c.runGait its stride.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, K = this.colours(P), fly = Math.sin(g * 2) * 0.02;
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const legs = [g + Math.PI, g].map(ph => { const a = Math.sin(ph) * 0.62; return { fx: Math.sin(a) * 0.4, fy: 0.44 - Math.cos(a) * 0.4 }; });
    ctx.translate(0, 0.035 - Math.min(legs[0].fy, legs[1].fy));   // whichever foot is lowest is on the ground
    const leg = (l, col) => { P_line(ctx, 0, 0.44, l.fx, l.fy, 0.07, col); P_ell(ctx, l.fx + 0.035, l.fy - 0.004, 0.065, 0.032, K.shoe); };
    leg(legs[0], K.stockingD);
    leg(legs[1], K.stocking);
    // the far arm, round the back of the box
    P_limb(ctx, [[-0.01, 0.92], [0.06, 0.77], [0.25, 0.72]], 0.04, K.porcelainD);
    // the skirt, blown out behind it, its lace hem, and the sash's tails flying
    P_poly(ctx, [[-0.1, 0.8], [0.08, 0.8], [0.19, 0.47], [0.04, 0.43], [-0.2, 0.44 + fly], [-0.36, 0.52 - fly]], K.dress);
    for (let k = 0; k < 6; k++) { const u = k / 5; P_ell(ctx, lerp(0.17, -0.34, u), lerp(0.46, 0.52, u) + (k & 1 ? fly : -fly) * 0.5, 0.045, 0.03, K.lace); }
    P_poly(ctx, [[-0.08, 0.79], [0.08, 0.79], [0.07, 0.98], [-0.07, 0.98]], K.dress);
    P_rect(ctx, -0.085, 0.76, 0.17, 0.05, K.dressD);
    P_ell(ctx, -0.11, 0.79, 0.045, 0.03, K.ribbon); P_line(ctx, -0.12, 0.78, -0.28, 0.66 + fly * 2, 0.026, K.ribbon); P_line(ctx, -0.11, 0.77, -0.24, 0.6 - fly * 2, 0.026, K.ribbon);
    P_ell(ctx, 0.0, 0.94, 0.055, 0.045, K.dress);
    // the box, hugged to its chest, and the near arm over it
    if (c.carry) { const A = this.carryAt; ctx.save(); ctx.translate(0.2, A.y + 0.04); ctx.scale(A.w * 0.85, A.w * 0.85); c.carry(ctx, P); ctx.restore(); }
    P_limb(ctx, [[0.0, 0.92], [0.07, 0.78], [0.27, 0.74]], 0.045, K.porcelainD);
    P_ell(ctx, 0.27, 0.735, 0.03, 0.028, K.porcelain);
    // the head, side on: ringlets flying out behind, the big glass eye, a blush, the smile running back along the cheek
    ctx.save(); ctx.translate(0.02, 1.0); ctx.rotate(-0.1);
    P_rect(ctx, -0.02, -0.02, 0.045, 0.05, K.porcelainD);
    P_ell(ctx, -0.03, 0.15, 0.11, 0.135, K.hair);
    for (let k = 0; k < 4; k++) P_ell(ctx, -0.11 - k * 0.025 - Math.abs(fly) * 2, 0.14 - k * 0.05 + (k & 1 ? fly : -fly), 0.036, 0.04, (k & 1) ? K.hairL : K.hair);
    P_ell(ctx, 0.035, 0.125, 0.09, 0.122, K.porcelain);
    P_ell(ctx, 0.0, 0.22, 0.1, 0.055, K.hair);
    P_ell(ctx, 0.07, 0.135, 0.022, 0.03, K.glass);
    for (let k = 0; k < 3; k++) P_line(ctx, 0.06 + k * 0.012, 0.165, 0.066 + k * 0.018, 0.18, 0.004, K.glass);
    P_ell(ctx, 0.11, 0.115, 0.012, 0.01, K.porcelainD);
    P_ell(ctx, 0.05, 0.085, 0.024, 0.016, P.cola([224, 112, 124], 0.55));
    P_limb(ctx, [[0.115, 0.07], [0.09, 0.055], [0.05, 0.075]], 0.011, K.lip);
    P_limb(ctx, [[-0.01, 0.2], [0.0, 0.17], [-0.005, 0.15]], 0.005, P.col([96, 80, 74]));
    P_poly(ctx, [[-0.02, 0.27], [-0.13, 0.33], [-0.12, 0.2]], K.ribbon); P_poly(ctx, [[-0.02, 0.27], [0.07, 0.33], [0.08, 0.22]], K.ribbon);
    P_ell(ctx, -0.02, 0.265, 0.03, 0.025, K.ribbon);
    ctx.restore();
    ctx.restore();
  },
};
