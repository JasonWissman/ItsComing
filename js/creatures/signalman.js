'use strict';
// The shade (night 9): a figure far too tall and far too thin, all of it one dark: no clothes, no edges of anything, the
// body, the long arms and the long legs one shadow drawn out of the night, its outline smoking a little at the edges. Most
// of the time nothing of it shows but two small pale points where its eyes are, and that is all its face ever is, even
// standing behind a lit street lamp: the light finds no face on it, only the edge of its shoulder. It stands utterly
// still at a lamp; then one arm unspools up out of it, the same shadow, impossibly long,
// writhing a little as it goes, to the lamp's head, and the long fingers close on it. Between lamps it skitters on low and
// fast, folded down almost to the ground on all four of its limbs, the knees and elbows high and splayed like a spider's.
// It keeps the same pace whether you watch it or not. While nobody looks at it its head is turned aside; a moment after you
// look, it snaps round to you. Only coming at you does a face come out of the dark into yours: two pale eyes, blank, and a
// lipless slit of small teeth from one cheekbone to the other that opens far too wide.
// While c.held is set it stands still; once c.away is set (the night has let you go) it has turned round, and you see only
// its back, eyeless, as it walks off. A night that sets c.lookT (to c.t) has its head snap round to you, as when you look at it
// (night 9: from behind a lamp post, looking back once at the booth before it goes).
// The night moves it (night 9: from street lamp to street lamp) and tells it what it is doing: c.side, how far to the side
// of its way it is; c.reach (0..1), one arm unspooling up to c.reachTo (across and up from its feet, in metres; c.reachSide
// the arm), the hand closing on what it reaches (c.grip); c.rush (0..1), skittering, low; c.lampLit (0..1, more in the
// flare), how lit it is by the lamp it stands behind (a faint rim along its shoulder, never its face); c.dark, out of the light.
// The police (night 9, 911): c.torch (0..1), a flashlight on it from the side c.scareSide of the view (1 the right): a pale
// light down that side of it, and its eyes shining back; c.convulse (0..1), convulsing in that light: its spine kinked
// and thrown from side to side, one shoulder up and the other down, its knees buckling, its elbows out and its forearms
// flung about from them at wrong angles, its head snapping from one side to the other, every joint of it jerked to a
// new place several times a second with a shudder through it (jerk), and the first of its tentacles squirming out of its
// back (with reduced motion a slow writhe instead); c.scare (0..1), jumped out at them, upright and leaning at them,
// one arm out at them and the other up over its head, its head turned to them and split open into its petals of teeth
// (the maw of its lunge, seen from the side).
// Its tentacles (tentacles, tentacle): jumped out at the police, and coming at you, long black limbs unfurl out of its
// back and shoulders, tapering, waving and writhing, its own black with a faint cold rim along the edge the light is on:
// at the police a fan of them behind it, away from the car, one over its head and one out low at them (seven); coming at
// you a fan of them all round behind it, five more out from behind its maw between the petals, and two that come round
// from its shoulders and curl in at your face from either side, as thick at their far ends as at their roots (drawn over
// it, short of the maw's teeth): seventeen. Reduced motion: they wave slowly, and less. c.tentacles: how many it drew,
// the last time it was drawn.
CREATURES.signalman = {
  name: 'the shade', h: 2.5, w: 0.8, faceY: 2.3, stepRate: 0.6, catchDist: 1.6, sound: 'walker', ignoresGaze: true,
  death: { delay: 0.3, dur: 0.5, sting: 'stingGlass' },
  voice: { kind: 'hum', every: [7, 13] },
  init(c) { c.held = false; c.away = false; c.lookT = -9; c.unseenFor = 9; c.wasSeen = false; c.side = 0; c.reach = 0; c.rush = 0; c.grip = 0; c.dark = false; c.lampLit = 0; c.torch = 0; c.scare = 0; c.scareSide = 1; c.convulse = 0; c.tentacles = 0; },
  lateral(c) { return c.side || 0; },
  speedMult(c, dt, seen) {
    // the head: looked at after a while unwatched, it is still turned aside, and a moment later it snaps round to you
    if (seen && !c.wasSeen && c.unseenFor > 0.8) c.lookT = c.t;
    c.unseenFor = seen ? 0 : (c.unseenFor || 0) + dt; c.wasSeen = seen;
    return c.held ? 0 : 1;
  },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, lunge = c.lunge || 0, back = !!c.away && !lunge;
    const m = ctx.getTransform(), px = 1 / (Math.hypot(m.a, m.b) || 1);   // a device pixel, here
    const W = w => Math.max(w, 0.9 * px);                                  // never thinner than a pixel: far off it is still a shape
    const ink = P.col([9, 8, 11], 0.2), haze = P.cola([4, 3, 6], 0.32);  // (it takes little of any light)
    const sc = back || lunge ? 0 : smoothstep(clamp(c.scare || 0, 0, 1)), sd = c.scareSide || 1;   // (jumped out at the police)
    const mv = c.moving ? 1 : 0, ru = back || lunge ? 0 : clamp(c.rush || 0, 0, 1) * (1 - sc), ruE = smoothstep(Math.min(1, ru * 1.6));
    const reveal = back ? 0 : smoothstep(lunge * 1.6);   // (only coming at you: no lamp ever lights its face)
    const lk = smoothstep(lunge * 1.5);
    // convulsing (in the police flashlight, before it jumps out at them): every joint of it jerked somewhere new several
    // times a second (jk: each its own, by a seed), less and less as it springs out of it (with reduced motion, a slow writhe)
    const still = SAVE.data.settings.reducedMotion, cv = back || lunge ? 0 : clamp(c.convulse || 0, 0, 1) * (1 - sc);
    const jk = cv > 0 ? (seed, rate) => this.jerk(t, seed, rate, still) : () => 0;
    // the skeleton of the pose: upright (walking, or standing dead still), folded down low (skittering), or coming at you
    // (convulsing: sunk on its knees and hunched, its shoulders narrowed as it twists, the whole of it above the hips
    // thrown over one way and the other (bend), the spine kinked aside at the waist (kink) and thrown from side to side
    // (sway), one shoulder up and the other down (shT), the head flung about on the neck)
    const bob = mv * Math.abs(Math.sin(g)) * (0.03 + 0.05 * ru);
    const hipY = lerp(1.12, 0.6, ruE) + bob - cv * (0.1 + 0.08 * jk(3, 6)), shY = lerp(1.9, 0.98, ruE) + bob - cv * (0.07 - 0.06 * jk(4, 9)), shW = lerp(0.105, 0.2, ruE) * (1 - cv * 0.3 * (1 + jk(10, 7)));
    const sway = (c.moving && !ru ? Math.sin(g * 0.5) * 0.025 : 0) + cv * jk(1, 7) * 0.11;
    const kink = cv * jk(2, 8) * 0.1, shT = cv * jk(5, 8) * 0.09, bend = cv * jk(11, 6) * 0.44;
    // (the legs are drawn with the rest of it, thrown over about the hips by bend: unbent here, the feet stay where they
    // stand and the knees go half the way)
    const unbend = (p, f) => { const a = -bend * f, dx = p[0] - kink * 0.6, dy = p[1] - hipY, ca = Math.cos(a), sa = Math.sin(a); return [kink * 0.6 + dx * ca - dy * sa, hipY + dx * sa + dy * ca]; };
    const headC = [sway * 1.4 + sd * 0.07 * sc + cv * jk(6, 10) * 0.08, lerp(2.3, 1.13, ruE) + bob + lk * 0.04 + sc * 0.06 - cv * (0.07 - 0.05 * jk(7, 10))], neckB = [sway, shY + 0.02];
    // the limbs, as joints from the body out: legs, then arms (the one reaching is drawn on its own)
    const legs = [], arms = [];
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = mv * Math.max(0, Math.sin(ph)) * (0.16 + 0.1 * ru), swing = mv * Math.sin(ph) * (0.1 - 0.05 * ru);
      // (convulsing: the knees thrown out and in)
      const knee = [lerp(s * 0.05 + swing * 0.4, s * 0.32, ruE) + cv * (s * (0.09 + 0.1 * Math.abs(jk(20 + s, 9))) + 0.1 * jk(24, 7)), lerp(0.58, 0.78, ruE) + lift * 0.7 + cv * 0.06 * jk(22 + s, 9)], foot = [lerp(s * 0.06 + swing, s * 0.24, ruE), lift * (1 - ruE * 0.4) + 0.01];
      legs.push([[s * 0.035 + kink * 0.6, hipY], bend ? unbend(knee, 0.5) : knee, bend ? unbend(foot, 1) : foot]);
      // arms: hanging to the knees, loose, a little swing against the stride; skittering, down to the ground ahead as front
      // legs; coming at you, up and out either side of your face, the fingers spread
      const aph = g + (s > 0 ? 0 : Math.PI), alift = mv * Math.max(0, Math.sin(aph)) * 0.18 * ru, asw = mv * Math.sin(aph) * 0.05 * (1 - ru);
      const shp = [s * shW + sway, shY - 0.02 + s * shT];
      let el = [lerp(lerp(s * 0.15 + asw, s * 0.56, ruE), s * 0.42, lk), lerp(lerp(1.32, 1.36, ruE) + alift, 2.0, lk)];
      let wr = [lerp(lerp(s * 0.13 + asw * 1.8, s * 0.5, ruE), s * 0.36, lk), lerp(lerp(0.6 + bob, 0.06 + alift, ruE), 2.42, lk)];
      let ang = lerp(lerp(-Math.PI / 2 + s * 0.06, -Math.PI / 2 + s * 0.5, ruE), Math.PI / 2 - s * 0.45, lk), spread = lerp(lerp(0.07, 0.34, ruE), 0.32, lk);
      if (cv > 0) {   // convulsing: the elbow thrown out and up, the forearm flung about from it (anywhere from hanging to straight up over it), the fingers clawed
        const ex = s * (0.16 + 0.26 * Math.abs(jk(30 + s, 9))) + sway, ey = shY - 0.3 + 0.5 * jk(32 + s, 8), fa = -Math.PI / 2 + s * 0.3 + jk(34 + s, 11) * 2.6;
        el = [lerp(el[0], ex, cv), lerp(el[1], ey, cv)];
        wr = [lerp(wr[0], ex + Math.cos(fa) * 0.7, cv), lerp(wr[1], Math.max(0.1, ey + Math.sin(fa) * 0.7), cv)];
        ang = lerp(ang, fa + jk(36 + s, 12) * 0.7, cv); spread = lerp(spread, 0.42, cv);
      }
      if (sc > 0) {   // at the police: the arm on their side out at them, high, the other up over its head, the fingers spread
        const out = s === sd;
        el = [lerp(el[0], out ? sd * 0.5 : s * 0.3 + sd * 0.04, sc), lerp(el[1], out ? 2.02 : 2.2, sc)];
        wr = [lerp(wr[0], out ? sd * 0.98 : s * 0.16 + sd * 0.3, sc), lerp(wr[1], out ? 2.32 : 2.74, sc)];
        ang = lerp(ang, out ? (sd > 0 ? 0.3 : Math.PI - 0.3) : Math.PI / 2 - sd * 0.55, sc); spread = lerp(spread, 0.38, sc);
      }
      arms.push({ s, pts: [shp, el, wr], ang, spread });
    }
    const reaching = c.reach > 0.001 && c.reachTo && !back && !lunge ? (c.reachSide || 1) : 0;
    // the torso: narrow shoulders falling away to a waist hardly thicker than an arm, all of a piece with the neck
    const torso = () => {
      ctx.beginPath();
      ctx.moveTo(-shW + sway, shY - shT); ctx.quadraticCurveTo(-0.07 + sway * 0.6 + kink, lerp(shY, hipY, 0.35), -0.042 + kink, lerp(shY, hipY, 0.78));
      ctx.lineTo(-0.055 + kink * 0.6, hipY); ctx.lineTo(0.055 + kink * 0.6, hipY); ctx.lineTo(0.042 + kink, lerp(shY, hipY, 0.78));
      ctx.quadraticCurveTo(0.07 + sway * 0.6 + kink, lerp(shY, hipY, 0.35), shW + sway, shY + shT);
      ctx.quadraticCurveTo(0.05 + sway, shY + 0.06, neckB[0] + 0.02, neckB[1] + 0.02); ctx.lineTo(neckB[0] - 0.02, neckB[1] + 0.02);
      ctx.quadraticCurveTo(-0.05 + sway, shY + 0.06, -shW + sway, shY - shT); ctx.closePath();
    };
    const limbPath = pts => { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
    const strokeLimbs = (list, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = W(w); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); for (const p of list) limbPath(p); ctx.stroke(); };
    if (back) { ctx.save(); ctx.scale(-1, 1); }
    // (leaning at the police from the feet up; convulsing, thrown over about its hips)
    const leaning = sc > 0 || cv > 0;
    if (leaning) { ctx.save(); ctx.transform(1, 0, sd * 0.16 * sc, 1, 0, 0); if (bend) { ctx.translate(kink * 0.6, hipY); ctx.rotate(bend); ctx.translate(-kink * 0.6, -hipY); } }
    // its tentacles, behind it: out of its back and shoulders at the police (the first of them squirming out as it
    // convulses), and all round behind it coming at you
    const tk = back ? 0 : Math.max(sc, lk, cv * 0.14), tent = (which, at) => (tk > 0.01 ? this.tentacles(ctx, c, P, haze, tk, which, sd, at, sway, W) : 0);
    c.tentacles = tent(lunge ? 'fan' : 'side', shY);
    // the smoke at its edges, first: the same shapes a little bigger and faint, and a few wisps lifting off it
    const armPts = arms.filter(a => a.s !== reaching).map(a => a.pts);
    strokeLimbs(legs.concat(armPts), 0.075, haze);
    ctx.fillStyle = haze; ctx.lineWidth = W(0.05); ctx.strokeStyle = haze; torso(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(headC[0], headC[1], 0.1, 0.15, 0, 0, TAU); ctx.fill();
    if (px < 0.02) {   // (close enough for wisps to be more than a pixel)
      ctx.strokeStyle = P.cola([6, 5, 8], 0.2); ctx.lineWidth = 0.02; ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const u = (t * 0.35 + i * 0.21) % 1, x0 = (i - 2) * 0.07 + sway, y0 = (i % 2 ? shY : headC[1] + 0.08) + u * 0.35;
        ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.sin(t * 1.3 + i) * 0.05, y0 + 0.08, x0 + Math.sin(t + i * 2) * 0.08, y0 + 0.16);
      }
      ctx.stroke();
    }
    // the body itself: one dark, limbs and all
    strokeLimbs(legs, 0.038, ink);
    ctx.fillStyle = ink; torso(); ctx.fill();
    for (const a of arms) if (a.s !== reaching) {
      strokeLimbs([a.pts.slice(0, 2)], 0.034, ink); strokeLimbs([a.pts.slice(1)], 0.026, ink);
      this.hand(ctx, ink, a.pts[2][0], a.pts[2][1], a.ang, a.spread + Math.abs(this.twitch(t + a.s, 2.3, 7)) * 0.3, lerp(0.2, 0.26, sc), lerp(lerp(lerp(0.15, 0.5, lk), 0.45, sc), 1.0, cv) * -a.s, W);
    }
    for (const lg of legs) P_ell(ctx, lg[2][0], lg[2][1], W(0.05), W(0.018), ink);   // the feet, long and thin
    if (reaching) this.reachArm(ctx, c, P, ink, haze, [reaching * shW + sway, shY - 0.02], reaching, W, px);
    P_line(ctx, neckB[0], neckB[1], headC[0], headC[1] - 0.08, W(0.04), ink);    // the neck, long
    // the head. Looked at, it is turned aside, and snaps round to you a moment later; now and then it jerks over
    const since = t - (c.lookT === undefined ? -9 : c.lookT);
    const turn = back || lunge ? 0 : since < 0.5 ? 1 - smoothstep((since - 0.38) / 0.07) : 0;
    // (convulsing: snapped over onto one shoulder and the other, and turned from one side to the other, cturn)
    const cturn = cv * clamp(jk(9, 9) * 1.7, -1, 1);
    const tilt = (headTiltJerk(t, 4.1, 0.05) * (c.moving ? 1 : 0.15)) * (1 - lunge) * (1 - sc) + turn * 0.14 + ru * 0.25 * Math.sin(g * 0.5) + (reaching ? -reaching * 0.12 * smoothstep(c.reach) : 0) - sd * 0.3 * sc + cv * jk(8, 10) * 0.95;
    if (lunge) c.tentacles += tent('crown', headC[1] - 0.01);   // (coming at you: more of them out from behind its maw, between the petals)
    ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(tilt);
    if (cturn < 0) ctx.scale(-1, 1);
    if (!back) this.face(ctx, c, P, ink, Math.max(turn, Math.abs(cturn)), reveal, lunge, px, cv * (0.3 + 0.6 * Math.abs(jk(12, 7))));   // (its jaw dropping out of its head and snapping back)
    else P_ell(ctx, 0, 0, W(0.075), W(0.13), ink);
    ctx.restore();
    // where a lamp it stands behind lights it: a thin warm rim along the shoulder toward it, and nothing on the head or the
    // face, which stay all dark but the two points of the eyes
    if (!back && !lunge && c.lampLit > 0.02) {
      const sd = c.reachTo && c.reachTo.x < 0 ? -1 : 1, rim = P.cola([255, 176, 104], Math.min(1, c.lampLit) * 0.3);
      ctx.strokeStyle = rim; ctx.lineWidth = W(0.005); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sd * 0.03 + sway, shY + 0.04); ctx.quadraticCurveTo(sd * (shW - 0.02) + sway, shY + 0.02, sd * shW + sway, shY - 0.02); ctx.stroke();
    }
    // a flashlight on it: a pale light down the side it comes from, over the dark of it (its body and its head)
    if (!back && !lunge && (c.torch || 0) > 0.02) {
      const gr = ctx.createLinearGradient(sd * (shW + 0.02) + sway, 0, -sd * 0.06 + sway, 0);
      gr.addColorStop(0, P.cola([206, 214, 236], 0.42 * c.torch)); gr.addColorStop(1, P.cola([206, 214, 236], 0));
      ctx.fillStyle = gr; torso(); ctx.fill();
      ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(tilt); ctx.translate(-sway, 0); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(sd * 0.012 + sway, 0, 0.07, 0.125, 0, 0, TAU); ctx.fill(); ctx.restore();
      strokeLimbs(legs, 0.012, P.cola([206, 214, 236], 0.18 * c.torch));
    }
    if (leaning) ctx.restore();
    if (lunge) c.tentacles += tent('near', shY);   // (and those that come round at your face, over it)
    if (back) ctx.restore();
    if (c.held && !c.moving && !lunge) P_ell(ctx, 0, 0.02, 0.35, 0.04, P.cola([0, 0, 0], 0.25));
  },
  // the face, in the head's own frame (its middle at nought). Wherever it is, lit by a lamp or not, near or far, there is
  // nothing of it but the two small pale points of the eyes: the light never finds a face. Only coming at you (reveal, over
  // the first of the lunge) does more of it show, and only two things on the black: two pale eyes, blank, and a mouth
  // from one cheekbone to the other, a slit of small teeth that opens into a black hole full of them, the jaw dropping
  // far too far
  // the face, in the lunge: the head splits open into five petals, peeled back from a round maw, every one of them lined
  // with teeth along its edges and the maw ringed with more of them, row inside row, down into the black: no eyes, no
  // face, only the mouth. k is how far open (the shut face below fades as it opens)
  face(ctx, c, P, ink, turn, reveal, lunge, px, jaw) {
    const sc = lunge ? 0 : smoothstep(clamp(c.scare || 0, 0, 1));
    if (sc > 0.001) { this.scareFace(ctx, c, P, ink, sc, px); return; }
    const k = px < 0.03 ? smoothstep(clamp((lunge - 0.06) / 0.5, 0, 1)) : 0;
    if (k < 0.999) { ctx.save(); ctx.globalAlpha *= 1 - smoothstep(k / 0.4); this.faceShut(ctx, c, P, ink, turn, reveal, lunge, px, jaw); ctx.restore(); }
    if (k > 0.001) this.maw(ctx, c, P, ink, k);
  },
  // at the police (c.scare): its head turned to them (c.scareSide), the shut face going as it splits open, the back of
  // its head dark behind the maw, and the maw larger than in its lunge (and less lit: it is still dark), seen from the side
  scareFace(ctx, c, P, ink, sc, px) {
    const sd = c.scareSide || 1;
    if (sc < 0.999) { ctx.save(); ctx.globalAlpha *= 1 - smoothstep(sc / 0.4); this.faceShut(ctx, c, P, ink, 0, 0, 0, px); ctx.restore(); }
    P_ell(ctx, -sd * 0.035 * sc, 0.01, Math.max(0.075, 0.9 * px), Math.max(0.13, 0.9 * px), ink);   // the back of its head
    if (px < 0.05) { ctx.save(); ctx.translate(sd * 0.14 * sc, 0.03); ctx.scale(sd * 0.55 * 2, 2); this.maw(ctx, c, P, ink, sc, 0.3); ctx.restore(); }
  },
  maw(ctx, c, P, ink, k, lk) {   // (lk: how much of the light on it its flesh takes; all of it, unless given)
    const t = c.t, cx = 0, cy = -0.01, N = 5, w = TAU / N * 0.5 * 0.94;
    // the petals only open out, larger and wider as it comes, steady; inside them its teeth keep coming up out of its
    // throat and moving out to the rim, ring after ring, only ever outward
    const still = SAVE.data.settings.reducedMotion;
    const rbP = lerp(0.03, 0.075, k), rb = rbP, rt = lerp(0.12, 0.34, k), wide = lerp(0.85, 1.15, k);
    const flesh = P.col([58, 14, 18], lk), fleshD = P.col([30, 6, 9], lk), tooth = P.cola([200, 190, 156], 0.97);
    const at = (r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const toothAt = (x, y, dx, dy, l, wd) => {   // a fang from (x,y) pointing (dx,dy)
      ctx.moveTo(x - dy * wd, y + dx * wd); ctx.lineTo(x + dy * wd, y - dx * wd); ctx.lineTo(x + dx * l, y + dy * l);
    };
    for (let i = 0; i < N; i++) {
      const th = -Math.PI / 2 + i * TAU / N;
      const b1 = at(rbP, th - w), b2 = at(rbP, th + w), tip = at(rt, th), c1 = at(rt * 0.72, th - w * 0.85 * wide), c2 = at(rt * 0.72, th + w * 0.85 * wide);
      const petal = sc => {
        const m = at(rbP, th), S = q => [m[0] + (q[0] - m[0]) * sc, m[1] + (q[1] - m[1]) * sc];
        const B1 = S(b1), B2 = S(b2), T = S(tip), C1 = S(c1), C2 = S(c2);
        ctx.beginPath(); ctx.moveTo(B1[0], B1[1]); ctx.quadraticCurveTo(C1[0], C1[1], T[0], T[1]); ctx.quadraticCurveTo(C2[0], C2[1], B2[0], B2[1]); ctx.closePath();
      };
      ctx.fillStyle = ink; petal(1); ctx.fill();                  // the back of the petal, black as the rest of it
      ctx.fillStyle = flesh; petal(0.84); ctx.fill();             // and its inside, raw
      ctx.fillStyle = fleshD; petal(0.5); ctx.fill();
      ctx.fillStyle = tooth; ctx.beginPath();                     // its edges lined with teeth, pointing in
      for (const [cc, sgn] of [[c1, -1], [c2, 1]]) {
        const b = sgn < 0 ? b1 : b2;
        for (let j = 1; j <= 6; j++) {
          const u = j / 7, x = (1 - u) * (1 - u) * b[0] + 2 * u * (1 - u) * cc[0] + u * u * tip[0], y = (1 - u) * (1 - u) * b[1] + 2 * u * (1 - u) * cc[1] + u * u * tip[1];
          const ix = -Math.sin(th) * -sgn, iy = Math.cos(th) * -sgn;   // across the petal, toward its middle
          toothAt(x, y, ix, iy, (0.027 * (1 - u * 0.55) + 0.006) * k, 0.0055 + 0.003 * (1 - u));
        }
      }
      ctx.fill();
    }
    // the maw itself: the raw rim, the black of the throat, and the rings of teeth coming up out of the throat and moving out
    // to the rim, growing as they go and sinking into the rim there (reduced motion: two rings, still)
    P_ell(ctx, cx, cy, rb * 1.08, rb * 1.08, fleshD);
    P_ell(ctx, cx, cy, rb * 0.42, rb * 0.42, P.col([4, 2, 3]));
    const RINGS = 4, flow = still ? 0 : t * 0.9, a1 = ctx.globalAlpha;
    for (let i = 0; i < RINGS; i++) {
      const u = still ? [0.8, 0.45][i] : (i / RINGS + flow) % 1;   // 0: at the throat, 1: at the rim
      if (u === undefined) continue;
      const r = rb * lerp(0.2, 1.0, u), n = Math.round(lerp(8, 14, u)), l = lerp(0.012, 0.034, u), a0 = i * 0.9;
      ctx.globalAlpha = a1 * smoothstep(u / 0.2) * (1 - smoothstep((u - 0.85) / 0.15));   // out of the dark, and down into the rim
      ctx.fillStyle = tooth; ctx.beginPath();
      for (let j = 0; j < n; j++) { const a = j / n * TAU + a0, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; toothAt(x, y, -Math.cos(a), -Math.sin(a), l * k * (0.75 + 0.25 * Math.abs(Math.sin(j * 2.3 + i))), lerp(0.004, 0.007, u)); }
      ctx.fill();
    }
    ctx.globalAlpha = a1;
  },
  faceShut(ctx, c, P, ink, turn, reveal, lunge, px, jaw) {   // (jaw: how far its jaw has dropped, convulsing: the dark of it only)
    const fx = turn * 0.045, rv = clamp(reveal, 0, 1), gape = Math.max(smoothstep(lunge * 1.3), jaw || 0);
    // the head: long and narrow, the jaw dropping out of it as the mouth opens
    P_ell(ctx, 0, 0, Math.max(0.075, 0.9 * px), Math.max(0.13, 0.9 * px), ink);
    if (gape > 0.01) P_ell(ctx, fx * 0.5, -0.1 - gape * 0.12, 0.058, 0.05 + gape * 0.14, ink);   // the jaw, dropping far too far
    if (rv > 0.02 && px < 0.03) {
      const a = Math.min(1, rv * 0.9);   // no light on the face at all: only the eyes and the teeth show
      // the mouth: right across the face and past it, the corners drawn up toward the eyes; the lips pulled back off small
      // close teeth, which opens into a black hole full of them, the jaw dropping far too far
      const mw = 0.072, my = -0.072 - gape * 0.05, lo = my - 0.04 - gape * 0.28, cy = my + 0.05;
      const lip = (q, ctl) => { const u = (q + 1) / 2; return cy - 2 * u * (1 - u) * (cy - ctl); };   // (on the upper lip, or the lower)
      const shape = () => { ctx.beginPath(); ctx.moveTo(fx - mw, cy); ctx.quadraticCurveTo(fx, my - 0.01, fx + mw, cy); ctx.quadraticCurveTo(fx, lo - 0.012, fx - mw, cy); ctx.closePath(); };
      ctx.fillStyle = P.cola([3, 1, 2], a); shape(); ctx.fill();
      ctx.save(); shape(); ctx.clip();
      ctx.fillStyle = P.cola([186, 176, 140], a * 0.95); ctx.beginPath();
      for (let i = -11; i <= 11; i++) {
        const q = i / 11.5, x = fx + q * mw, top = lip(q, my - 0.01) + 0.003, lt = (0.008 + 0.005 * Math.abs(Math.sin(i * 2.7))) * (1 + gape * 3.4);
        ctx.moveTo(x - 0.0032, top + 0.004); ctx.lineTo(x + 0.0032, top + 0.004); ctx.lineTo(x + 0.0005, top - lt);
        const bot = lip(q, lo - 0.012) - 0.003, lb = (0.006 + 0.004 * Math.abs(Math.cos(i * 1.9))) * (1 + gape * 3.2);
        if (i % 3 || gape < 0.1) { ctx.moveTo(x - 0.003, bot - 0.004); ctx.lineTo(x + 0.003, bot - 0.004); ctx.lineTo(x - 0.0005, bot + lb); }
      }
      ctx.fill();
      ctx.restore();
    }
    // the eyes: two small pale points in the dark, always (never less than a pixel), the far one lost as the head turns;
    // coming at you they grow into two pale eyes, blank: nothing in them
    const big = smoothstep(lunge * 1.4);
    for (const s of [-1, 1]) {
      const vis = s > 0 ? 1 : 1 - turn;
      if (vis < 0.05) continue;
      const x = fx * 1.6 + s * 0.031, y = 0.028 + (s > 0 ? 0.002 : 0);
      ctx.save(); ctx.globalAlpha *= vis;
      if (big > 0.05 && px < 0.012) {
        const k = s > 0 ? 1.12 : 1, rx = lerp(0.005, 0.0125 + gape * 0.002, big) * k, ry = lerp(0.005, 0.02 + gape * 0.014, big) * k;   // stretched tall
        P_ell(ctx, x, y, rx, ry, P.raw([222, 224, 206]));
      } else {
        const pr = Math.max(clamp(0.0006 * c.dist, 0.003, 0.008), 1.25 * px), tb = c.torch || 0;
        if (tb > 0.02) P_ell(ctx, x, y, pr * 5, pr * 5, rgba([214, 255, 200], 0.3 * tb));   // a flashlight on it: its eyes shine back
        P_ell(ctx, x, y, pr * 2.2, pr * 2.2, rgba([226, 232, 200], (c.dist > 3 ? 0.2 : 0.1) + 0.3 * tb));
        P_ell(ctx, x, y, pr * (1 + 0.4 * tb), pr * (1 + 0.4 * tb), P.raw([230, 236, 206]));
      }
      ctx.restore();
    }
  },
  // the arm reaching up to a lamp: out of the shoulder the same shadow unspools, far too long, lifting first and then paying
  // out toward what it reaches, writhing as it goes and stilled once it is there; the long fingers spread, then close on it
  reachArm(ctx, c, P, ink, haze, sh, side, W, px) {
    const e = clamp(c.reach, 0, 1), T = c.reachTo, t = c.t;
    const lift = smoothstep(Math.min(1, e * 2.4)), pay = smoothstep(clamp((e - 0.12) / 0.88, 0, 1));
    const aHang = -Math.PI / 2 + side * 0.08, aT = Math.atan2(T.y - sh[1], T.x - sh[0]);
    let da = aT - aHang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    const ang = aHang + da * lift, full = Math.hypot(T.x - sh[0], T.y - sh[1]), len = lerp(1.28, full, pay);
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, N = 16, pts = [];
    const writhe = (1 - e) * 0.9 + 0.1 * (1 - (c.grip || 0));
    for (let i = 0; i <= N; i++) {
      const s = i / N, w = Math.sin(Math.PI * s) * (0.07 * Math.sin(s * 9 - t * 11) + side * 0.12 * (1 - pay)) * writhe;
      pts.push([sh[0] + dx * len * s + nx * w, sh[1] + dy * len * s + ny * w]);
    }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = haze; ctx.lineWidth = W(0.07); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    // tapering from the shoulder to the wrist, in lengths, each a little thinner, with a knot of a joint here and there
    ctx.strokeStyle = ink;
    for (let i = 0; i < N; i++) { ctx.lineWidth = W(lerp(0.036, 0.018, i / N)); ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke(); }
    for (const k of [4, 8, 12]) P_ell(ctx, pts[k][0], pts[k][1], W(0.022), W(0.022), ink);
    const tip = pts[N], pa = Math.atan2(tip[1] - pts[N - 2][1], tip[0] - pts[N - 2][0]), gr = c.grip || 0;
    this.hand(ctx, ink, tip[0], tip[1], pa, lerp(0.36, 0.14, gr), 0.26, lerp(0.15, 1.2, gr) * -side, W);
    if (c.lampLit > 0.02 && px < 0.03) {   // the lamp catching the hand on it
      ctx.strokeStyle = P.cola([255, 176, 104], Math.min(1, c.lampLit) * 0.4 * e); ctx.lineWidth = W(0.008); ctx.beginPath();
      ctx.moveTo(pts[N - 5][0] + nx * 0.012, pts[N - 5][1] + ny * 0.012); ctx.lineTo(tip[0] + nx * 0.012, tip[1] + ny * 0.012); ctx.stroke();
    }
  },
  // a hand: a narrow palm at (x, y) and four long jointed fingers from it pointing along ang, spread apart by spread, each
  // len long, bent at the middle joint by curl; and a thumb
  hand(ctx, col, x, y, ang, spread, len, curl, W) {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    P_ell(ctx, x, y, W(0.022), W(0.036), col, ang - Math.PI / 2);
    ctx.strokeStyle = col; ctx.lineWidth = W(0.009); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5, a = ang + o * spread, l = len * (o * o > 1 ? 0.82 : 1), b = a - curl - o * 0.05;
      const bx = x + ca * 0.026 - sa * o * 0.009, by = y + sa * 0.026 + ca * o * 0.009;
      const mx = bx + Math.cos(a) * l * 0.55, my = by + Math.sin(a) * l * 0.55;
      ctx.moveTo(bx, by); ctx.lineTo(mx, my); ctx.lineTo(mx + Math.cos(b) * l * 0.45, my + Math.sin(b) * l * 0.45);
    }
    ctx.moveTo(x + sa * 0.012, y - ca * 0.012); ctx.lineTo(x + Math.cos(ang - 0.7) * len * 0.36, y + Math.sin(ang - 0.7) * len * 0.36);   // the thumb
    ctx.stroke();
  },
  // Its tentacles (k: how far out they have come; coiled up short until then). At the police ('side'; sd: the side of the
  // view they are on): out of its back and shoulders, fanned out behind it away from them, one up over its head toward
  // them and one out low at them. Coming at you: all round behind it ('fan'), five a side; out from behind its maw
  // between the petals ('crown', drawn under the maw: at is how high its middle is); and two that come round from its
  // shoulders, out below and up in at your face from either side ('near', drawn over it all, short of the maw's teeth),
  // as thick at their far ends as at their roots, as what comes at the eye is. Each is a line of points from its root:
  // off along an angle and bending by curl along its length, a wave running out along it ('near': along a curve through
  // three points, growing along it). Returns how many it drew
  TENT: {
    // [x toward its back, y, angle (0 straight back, up from there), length, width, curl, phase]
    side: [[0.03, 1.9, 1.15, 1.9, 0.11, 0.8, 0], [0.05, 1.8, 0.62, 2.2, 0.125, -0.5, 1.7], [0.05, 1.66, 0.2, 2.0, 0.115, 0.9, 3.1], [0.04, 1.5, -0.3, 1.7, 0.1, -0.7, 4.4],
      [0.03, 1.32, -0.9, 1.5, 0.095, 1.3, 5.6], [0, 1.93, 1.75, 1.7, 0.1, -1.1, 2.3], [-0.03, 1.55, 3.5, 1.4, 0.09, 0.9, 0.9]],
    // (either side) [x out to that side, y, angle (0 straight up, out to that side from there), length, width, curl, phase]
    fan: [[0.04, 1.97, 0.42, 1.7, 0.075, 0.35, 0], [0.08, 1.92, 0.95, 2.0, 0.085, -0.4, 1.3], [0.1, 1.85, 1.45, 1.9, 0.085, 0.45, 2.9], [0.09, 1.74, 1.95, 1.7, 0.075, -0.5, 4.2], [0.07, 1.58, 2.45, 1.5, 0.07, 0.6, 5.3]],
    // [angle out from the middle of the maw (0 to the right, up from there), length, width, curl, phase]: one to each gap between its petals
    crown: [[1.57, 0.62, 0.05, 0.5, 0.4], [0.2, 0.7, 0.05, -0.7, 2.2], [2.94, 0.7, 0.05, 0.7, 4.1], [-0.94, 0.78, 0.055, 0.6, 5.5], [4.08, 0.78, 0.055, -0.6, 1.2]],
    // (either side) [the three points its curve goes through (x out to that side), width, phase]
    near: [[[0.1, 1.84], [0.86, 1.66], [0.37, 2.2], 0.075, 0.6]],
  },
  tentacles(ctx, c, P, haze, k, which, sd, at, sway, W) {
    const t = c.t, still = SAVE.data.settings.reducedMotion, wv = still ? 2.2 : 10, amp = still ? 0.2 : 0.42, N = 14, T = this.TENT;
    const ink = P.col([9, 8, 11], 0.06);   // (black whatever is shone on them: a flashlight leaves them dark against what it lights)
    const rim = rgba(mixc([150, 158, 186], P.fogColor || [0, 0, 0], P.fog || 0), 0.4), light = which === 'side' ? [sd, 0.3] : [0.25, 1];
    // (mx: mirrored across; a0 a mathematical angle before the mirror)
    const one = (x0, y0, mx, a0, len, w, curl, ph, wave) => {
      const L = len * (0.12 + 0.88 * k), coil = (1 - k) * 2.0 * (curl < 0 ? -1 : 1), pts = [];
      let x = x0, y = y0;
      for (let i = 0; i <= N; i++) {
        const s = i / N, a = a0 + curl * s + coil * s + (amp * (0.2 + s) * Math.sin(5.5 * s - t * wv + ph) + amp * 0.4 * s * Math.sin(12 * s - t * wv * 1.6 + ph * 2.3)) * wave;
        pts.push([x, y, 1]);
        x += mx * Math.cos(a) * L / N; y += Math.sin(a) * L / N;
      }
      this.tentacle(ctx, pts, w * (0.55 + 0.45 * k), ink, haze, rim, light, W);
    };
    if (which === 'side') { for (const q of T.side) one(-sd * q[0] + sway, q[1] + at - 1.9, -sd, q[2], q[3], q[4], q[5], q[6], 1); return T.side.length; }
    if (which === 'fan') { for (const s of [-1, 1]) for (const q of T.fan) one(s * q[0] + sway, q[1] + at - 1.9, s, Math.PI / 2 - q[2], q[3], q[4], -q[5], q[6] + s * 1.1, 0.8); return 2 * T.fan.length; }
    if (which === 'crown') { for (const q of T.crown) one(sway + Math.cos(q[0]) * 0.03, at + Math.sin(q[0]) * 0.03, 1, q[0], q[1], q[2], q[3], q[4], 1.1); return T.crown.length; }
    for (const s of [-1, 1]) for (const [p0, p1, p2, w, ph0] of T.near) {
      const pts = [], ph = ph0 + s * 1.3;
      for (let i = 0; i <= N; i++) {
        const u = i / N, v = u * k, wob = still ? 0.012 : 0.03, ox = wob * u * Math.sin(6 * u - t * wv + ph), oy = wob * u * Math.cos(5 * u - t * wv * 1.3 + ph);
        pts.push([sway + s * ((1 - v) * (1 - v) * p0[0] + 2 * v * (1 - v) * p1[0] + v * v * p2[0] + ox), (1 - v) * (1 - v) * p0[1] + 2 * v * (1 - v) * p1[1] + v * v * p2[1] + at - 1.9 + oy, 1 + 1.6 * u]);
      }
      this.tentacle(ctx, pts, w * (0.55 + 0.45 * k), ink, haze, rim, light, W);
    }
    return 2 * T.near.length;
  },
  // one tentacle, down a line of points (pts: [x, y, how much larger there]), w wide at its root and tapering to a point:
  // the smoke at its edge, the black of it, and a faint cold rim along the edge the light (light: where it comes from) is on
  tentacle(ctx, pts, w, ink, haze, rim, light, W) {
    const n = pts.length - 1, A = [], B = [], E = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const hw = W(w * (0.1 + 0.9 * Math.pow(1 - i / n, 0.8)) * p[2]) / 2;
      A.push([p[0] + nx * hw, p[1] + ny * hw]); B.push([p[0] - nx * hw, p[1] - ny * hw]);
      const e = nx * light[0] + ny * light[1] > 0 ? 0.8 * hw : -0.8 * hw; E.push([p[0] + nx * e, p[1] + ny * e, e > 0]);
    }
    ctx.beginPath(); ctx.moveTo(A[0][0], A[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(A[i][0], A[i][1]);
    ctx.lineTo(pts[n][0], pts[n][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(B[i][0], B[i][1]);
    ctx.closePath();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = haze; ctx.lineWidth = W(0.035); ctx.stroke();
    ctx.fillStyle = ink; ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = W(0.008); ctx.beginPath();
    for (let i = 2; i < n; i++) { if (i === 2 || E[i][2] !== E[i - 1][2]) ctx.moveTo(E[i][0], E[i][1]); else ctx.lineTo(E[i][0], E[i][1]); }
    ctx.stroke();
  },
  // a convulsion's jerk, -1..1: a value held, then snapped to the next, rate times a second, with a shudder through it;
  // each joint its own (seed). With reduced motion (still) a slow writhe instead
  jerk(t, seed, rate, still) {
    if (still) return Math.sin(t * 1.7 + seed * 2.4) * 0.35;
    const u = t * rate + seed * 3.7, i = Math.floor(u), h = q => { const x = Math.sin((q + seed * 17.3) * 127.1) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
    return lerp(h(i - 1), h(i), smoothstep(Math.min(1, (u - i) / 0.28))) * 0.86 + Math.sin(t * 53 + seed * 5.1) * 0.14;
  },
  // a jerk: now and then (not every period, by a hash of which one it is) a sharp shudder at the start of a period
  twitch(t, period, seed) {
    const k = Math.floor(t / period), f = t - k * period, r = Math.abs(Math.sin((k + seed) * 127.1) * 43758.5) % 1;
    return r > 0.5 ? Math.exp(-f * 11) * Math.sin(f * 46) : 0;
  },
};
