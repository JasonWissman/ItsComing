'use strict';
// The shade (night 9): a figure far too tall and far too thin, all of it one dark: no clothes, no edges of anything, the
// body, the long arms and the long legs one shadow drawn out of the night, its outline smoking a little at the edges. Most
// of the time nothing of it shows but two small pale points where its eyes are. Standing behind a lit street lamp, the
// light finds what the dark hides: a long, gaunt face, the cheeks sunk to hollows, the eyes bigger than they should be and
// wet, and a mouth far too wide, a lipless slit of small teeth from one cheekbone to the other; it is gone again the moment
// the lamp is. It stands utterly still at a lamp; then one arm unspools up out of it, the same shadow, impossibly long,
// writhing a little as it goes, to the lamp's head, and the long fingers close on it. Between lamps it skitters on low and
// fast, folded down almost to the ground on all four of its limbs, the knees and elbows high and splayed like a spider's.
// It keeps the same pace whether you watch it or not. While nobody looks at it its head is turned aside; a moment after you
// look, it snaps round to you. Coming at you, the face comes out of the dark into yours and the mouth opens, far too wide.
// While c.held is set it stands still; once c.away is set (the night has let you go) it has turned round, and you see only
// its back, eyeless, as it walks off.
// The night moves it (night 9: from street lamp to street lamp) and tells it what it is doing: c.side, how far to the side
// of its way it is; c.reach (0..1), one arm unspooling up to c.reachTo (across and up from its feet, in metres; c.reachSide
// the arm), the hand closing on what it reaches (c.grip); c.rush (0..1), skittering, low; c.lampLit (0..1, more in the
// flare), how lit it is by the lamp it stands behind (its face shows in that light); c.dark, out of the light.
CREATURES.signalman = {
  name: 'the shade', h: 2.5, w: 0.8, faceY: 2.3, stepRate: 0.6, catchDist: 1.6, sound: 'walker', ignoresGaze: true,
  death: { delay: 0.3, dur: 0.5, sting: 'stingGlass' },
  voice: { kind: 'hum', every: [7, 13] },
  init(c) { c.held = false; c.away = false; c.lookT = -9; c.unseenFor = 9; c.wasSeen = false; c.side = 0; c.reach = 0; c.rush = 0; c.grip = 0; c.dark = false; c.lampLit = 0; },
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
    const mv = c.moving ? 1 : 0, ru = back || lunge ? 0 : clamp(c.rush || 0, 0, 1), ruE = smoothstep(Math.min(1, ru * 1.6));
    const reveal = back ? 0 : Math.max(clamp(c.lampLit || 0, 0, 1.4), smoothstep(lunge * 1.6));
    const lk = smoothstep(lunge * 1.5);
    // the skeleton of the pose: upright (walking, or standing dead still), folded down low (skittering), or coming at you
    const bob = mv * Math.abs(Math.sin(g)) * (0.03 + 0.05 * ru);
    const hipY = lerp(1.12, 0.6, ruE) + bob, shY = lerp(1.9, 0.98, ruE) + bob, shW = lerp(0.105, 0.2, ruE);
    const sway = (c.moving && !ru ? Math.sin(g * 0.5) * 0.025 : 0);
    const headC = [sway * 1.4, lerp(2.3, 1.13, ruE) + bob + lk * 0.04], neckB = [sway, shY + 0.02];
    // the limbs, as joints from the body out: legs, then arms (the one reaching is drawn on its own)
    const legs = [], arms = [];
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = mv * Math.max(0, Math.sin(ph)) * (0.16 + 0.1 * ru), swing = mv * Math.sin(ph) * (0.1 - 0.05 * ru);
      legs.push([[s * 0.035, hipY], [lerp(s * 0.05 + swing * 0.4, s * 0.32, ruE), lerp(0.58, 0.78, ruE) + lift * 0.7], [lerp(s * 0.06 + swing, s * 0.24, ruE), lift * (1 - ruE * 0.4) + 0.01]]);
      // arms: hanging to the knees, loose, a little swing against the stride; skittering, down to the ground ahead as front
      // legs; coming at you, up and out either side of your face, the fingers spread
      const aph = g + (s > 0 ? 0 : Math.PI), alift = mv * Math.max(0, Math.sin(aph)) * 0.18 * ru, asw = mv * Math.sin(aph) * 0.05 * (1 - ru);
      const shp = [s * shW + sway, shY - 0.02];
      const el = [lerp(lerp(s * 0.15 + asw, s * 0.56, ruE), s * 0.42, lk), lerp(lerp(1.32, 1.36, ruE) + alift, 2.0, lk)];
      const wr = [lerp(lerp(s * 0.13 + asw * 1.8, s * 0.5, ruE), s * 0.36, lk), lerp(lerp(0.6 + bob, 0.06 + alift, ruE), 2.42, lk)];
      arms.push({ s, pts: [shp, el, wr], ang: lerp(lerp(-Math.PI / 2 + s * 0.06, -Math.PI / 2 + s * 0.5, ruE), Math.PI / 2 - s * 0.45, lk), spread: lerp(lerp(0.07, 0.34, ruE), 0.32, lk) });
    }
    const reaching = c.reach > 0.001 && c.reachTo && !back && !lunge ? (c.reachSide || 1) : 0;
    // the torso: narrow shoulders falling away to a waist hardly thicker than an arm, all of a piece with the neck
    const torso = () => {
      ctx.beginPath();
      ctx.moveTo(-shW + sway, shY); ctx.quadraticCurveTo(-0.07 + sway * 0.6, lerp(shY, hipY, 0.35), -0.042, lerp(shY, hipY, 0.78));
      ctx.lineTo(-0.055, hipY); ctx.lineTo(0.055, hipY); ctx.lineTo(0.042, lerp(shY, hipY, 0.78));
      ctx.quadraticCurveTo(0.07 + sway * 0.6, lerp(shY, hipY, 0.35), shW + sway, shY);
      ctx.quadraticCurveTo(0.05 + sway, shY + 0.06, neckB[0] + 0.02, neckB[1] + 0.02); ctx.lineTo(neckB[0] - 0.02, neckB[1] + 0.02);
      ctx.quadraticCurveTo(-0.05 + sway, shY + 0.06, -shW + sway, shY); ctx.closePath();
    };
    const limbPath = pts => { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
    const strokeLimbs = (list, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = W(w); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); for (const p of list) limbPath(p); ctx.stroke(); };
    if (back) { ctx.save(); ctx.scale(-1, 1); }
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
      this.hand(ctx, ink, a.pts[2][0], a.pts[2][1], a.ang, a.spread + Math.abs(this.twitch(t + a.s, 2.3, 7)) * 0.3, 0.2, lerp(0.15, 0.5, lk) * -a.s, W);
    }
    for (const lg of legs) P_ell(ctx, lg[2][0], lg[2][1], W(0.05), W(0.018), ink);   // the feet, long and thin
    if (reaching) this.reachArm(ctx, c, P, ink, haze, [reaching * shW + sway, shY - 0.02], reaching, W, px);
    P_line(ctx, neckB[0], neckB[1], headC[0], headC[1] - 0.08, W(0.04), ink);    // the neck, long
    // the head. Looked at, it is turned aside, and snaps round to you a moment later; now and then it jerks over
    const since = t - (c.lookT === undefined ? -9 : c.lookT);
    const turn = back || lunge ? 0 : since < 0.5 ? 1 - smoothstep((since - 0.38) / 0.07) : 0;
    const tilt = (headTiltJerk(t, 4.1, 0.05) * (c.moving ? 1 : 0.15)) * (1 - lunge) + turn * 0.14 + ru * 0.25 * Math.sin(g * 0.5) + (reaching ? -reaching * 0.12 * smoothstep(c.reach) : 0);
    ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(tilt);
    if (!back) this.face(ctx, c, P, ink, turn, reveal, lunge, px);
    else P_ell(ctx, 0, 0, W(0.075), W(0.13), ink);
    ctx.restore();
    // where a lamp it stands behind lights it: a thin warm rim along the top of the head, the shoulders and the arm toward it
    // (not coming at you: then the face is bare)
    if (!back && !lunge && c.lampLit > 0.02) {
      const sd = c.reachTo && c.reachTo.x < 0 ? -1 : 1, rim = P.cola([255, 176, 104], Math.min(1, c.lampLit) * 0.3);
      ctx.strokeStyle = rim; ctx.lineWidth = W(0.005); ctx.lineCap = 'round'; ctx.beginPath();
      ctx.ellipse(headC[0], headC[1], 0.075, 0.13, tilt, Math.PI * (sd > 0 ? 0.12 : 0.5), Math.PI * (sd > 0 ? 0.5 : 0.88)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sd * 0.03 + sway, shY + 0.04); ctx.quadraticCurveTo(sd * (shW - 0.02) + sway, shY + 0.02, sd * shW + sway, shY - 0.02); ctx.stroke();
    }
    if (back) ctx.restore();
    if (c.held && !c.moving && !lunge) P_ell(ctx, 0, 0.02, 0.35, 0.04, P.cola([0, 0, 0], 0.25));
  },
  // the face, in the head's own frame (its middle at nought). In the dark, nothing but the two pale points of the eyes. Lit
  // (reveal), a long gaunt face comes out of the dark: the cheeks sunk, a brow over deep sockets, slits for a nose, the eyes
  // big and wet, and a mouth from one cheekbone to the other, a thin slit of small teeth. Coming at you the mouth opens,
  // the jaw dropping far too far. Coming at you (lunge) the face is plain: the hollows, the nose, the wet and the light all
  // go out of it at once (bare: 0 to 1 over the first of the lunge), leaving a dim, even pallor with nothing on it but two
  // pale eyes with no pupils in them and the mouth
  face(ctx, c, P, ink, turn, reveal, lunge, px) {
    const fx = turn * 0.045, rv = clamp(reveal, 0, 1), flare = clamp(reveal - 1, 0, 0.4), gape = smoothstep(lunge * 1.3);
    const bare = smoothstep(clamp(lunge * 5, 0, 1)), keep = 1 - bare;
    // the head: long and narrow, the jaw dropping out of it as the mouth opens
    P_ell(ctx, 0, 0, Math.max(0.075, 0.9 * px), Math.max(0.13, 0.9 * px), ink);
    if (gape > 0.01) P_ell(ctx, fx * 0.5, -0.1 - gape * 0.07, 0.06, 0.05 + gape * 0.08, ink);
    if (rv > 0.02 && px < 0.03) {
      const a = Math.min(1, rv * 0.9 + flare), fy = -0.005 - gape * 0.04;
      // the skin, faint, as the light finds it from above: palest on the brow and the cheekbones, lost into the dark at the
      // edges and below, so that the face seems to come up out of the shadow rather than sit on it
      // edges and below, so that the face seems to come up out of the shadow rather than sit on it. Bare, the light is even
      // over it: one dim pallor, lost only at its edges
      const sk = ctx.createRadialGradient(lerp(fx * 0.6, fx * 0.5, bare), lerp(0.035, fy, bare), 0.01, fx * 0.4, fy, 0.13 + gape * 0.04);
      sk.addColorStop(0, P.cola(mixc([156, 150, 128], [104, 100, 88], bare), a * lerp(0.85, 0.8, bare))); sk.addColorStop(0.55, P.cola(mixc([118, 112, 96], [94, 90, 78], bare), a * lerp(0.55, 0.62, bare))); sk.addColorStop(1, P.cola([40, 38, 34], 0));
      ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(fx * 0.5, fy, 0.07, 0.124 + gape * 0.06, 0, 0, TAU); ctx.fill();
      // hollows: the cheeks sunk in under the cheekbones, the temples; the sockets deep under the brow
      const hol = (x, y, rx, ry, k, rot) => {
        if ((k *= keep) < 0.01) return;
        const gr = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
        gr.addColorStop(0, P.cola([4, 3, 5], a * k)); gr.addColorStop(1, P.cola([4, 3, 5], 0));
        ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill();
      };
      for (const s of [-1, 1]) {
        hol(fx + s * 0.043, -0.05 - gape * 0.03, 0.024, 0.05 + gape * 0.02, 0.95, s * 0.15);
        hol(fx + s * 0.062, 0.07, 0.016, 0.034, 0.7);
        hol(fx * 1.3 + s * 0.031, 0.026, 0.028, 0.024, 1);
      }
      if (keep > 0.01) for (const s of [-1, 1]) P_ell(ctx, fx * 1.5 + s * 0.006, -0.028, 0.003, 0.009, P.cola([4, 2, 4], a * 0.9 * keep), s * 0.4);   // slits for a nose
      // the mouth: right across the face and past it, the corners drawn up toward the eyes; the lips pulled back off small
      // close teeth, which opens into a black hole full of them, the jaw dropping far too far
      const mw = 0.078, my = -0.072 - gape * 0.05, lo = my - 0.032 - gape * 0.17, cy = my + 0.05;
      const lip = (q, ctl) => { const u = (q + 1) / 2; return cy - 2 * u * (1 - u) * (cy - ctl); };   // (on the upper lip, or the lower)
      const shape = () => { ctx.beginPath(); ctx.moveTo(fx - mw, cy); ctx.quadraticCurveTo(fx, my - 0.01, fx + mw, cy); ctx.quadraticCurveTo(fx, lo - 0.012, fx - mw, cy); ctx.closePath(); };
      ctx.fillStyle = P.cola([3, 1, 2], a); shape(); ctx.fill();
      ctx.save(); shape(); ctx.clip();
      ctx.fillStyle = P.cola([186, 176, 140], a * 0.95); ctx.beginPath();
      for (let i = -11; i <= 11; i++) {
        const q = i / 11.5, x = fx + q * mw, top = lip(q, my - 0.01) + 0.003, lt = (0.008 + 0.005 * Math.abs(Math.sin(i * 2.7))) * (1 + gape * 2.2);
        ctx.moveTo(x - 0.0032, top + 0.004); ctx.lineTo(x + 0.0032, top + 0.004); ctx.lineTo(x + 0.0005, top - lt);
        const bot = lip(q, lo - 0.012) - 0.003, lb = (0.006 + 0.004 * Math.abs(Math.cos(i * 1.9))) * (1 + gape * 2);
        if (i % 3 || gape < 0.1) { ctx.moveTo(x - 0.003, bot - 0.004); ctx.lineTo(x + 0.003, bot - 0.004); ctx.lineTo(x - 0.0005, bot + lb); }
      }
      ctx.fill();
      ctx.restore();
      if (keep > 0.01) { ctx.strokeStyle = P.cola([150, 140, 116], a * 0.35 * keep); ctx.lineWidth = 0.0025; ctx.beginPath(); ctx.moveTo(fx - mw, cy); ctx.quadraticCurveTo(fx, my - 0.01, fx + mw, cy); ctx.stroke(); }   // the light on the upper lip
    }
    // the eyes: two small pale points in the dark, always (never less than a pixel); lit, or close, they are big and wet,
    // yellowed, sunk in their sockets, a pinprick of black fixed on you and a bead of light on each, the rims raw; the far
    // one lost as the head turns. Bare (coming at you), they are blank: pale all over, no pupil, no wet, no rims
    const close = Math.max(clamp((4 - c.dist) / 2.5, 0, 1), smoothstep(lunge * 1.4));
    const big = Math.max(rv, close);
    for (const s of [-1, 1]) {
      const vis = s > 0 ? 1 : 1 - turn;
      if (vis < 0.05) continue;
      const x = fx * 1.6 + s * 0.031, y = 0.028 + (s > 0 ? 0.002 : 0);
      ctx.save(); ctx.globalAlpha *= vis;
      if (big > 0.05 && px < 0.012) {
        const k = s > 0 ? 1.12 : 1, rx = lerp(0.005, 0.0145 + gape * 0.004, big) * k, ry = lerp(0.005, 0.0105 + gape * 0.005, big) * k;
        P_ell(ctx, x, y, rx, ry, P.raw(mixc(mixc([226, 230, 202], [198, 190, 150], big), [222, 224, 206], bare)));
        if (keep > 0.01) {
          const lid = ctx.createLinearGradient(0, y + ry, 0, y - ry), kb = big * keep;   // wet, and shaded under the brow
          lid.addColorStop(0, rgba([40, 30, 24], 0.55 * kb)); lid.addColorStop(0.5, rgba([40, 30, 24], 0)); lid.addColorStop(1, rgba([90, 30, 26], 0.35 * kb));
          ctx.fillStyle = lid; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
          ctx.save(); ctx.globalAlpha *= keep;
          P_ell(ctx, x - s * rx * 0.08, y, rx * 0.26, rx * 0.26, P.raw([12, 8, 8]));                    // the pinprick, on you
          P_ell(ctx, x - rx * 0.4, y + ry * 0.38, rx * 0.16, ry * 0.14, P.raw([255, 255, 248]));        // wet: a bead of light
          ctx.restore();
          ctx.strokeStyle = rgba([130, 36, 30], 0.7 * kb); ctx.lineWidth = 0.002; ctx.beginPath(); ctx.ellipse(x, y, rx * 1.04, ry * 1.08, 0, 0, TAU); ctx.stroke();   // the rims, raw
        }
      } else {
        const pr = Math.max(clamp(0.0006 * c.dist, 0.003, 0.008), 1.25 * px);
        P_ell(ctx, x, y, pr * 2.2, pr * 2.2, rgba([226, 232, 200], c.dist > 3 ? 0.2 : 0.1));
        P_ell(ctx, x, y, pr, pr, P.raw([230, 236, 206]));
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
  // a jerk: now and then (not every period, by a hash of which one it is) a sharp shudder at the start of a period
  twitch(t, period, seed) {
    const k = Math.floor(t / period), f = t - k * period, r = Math.abs(Math.sin((k + seed) * 127.1) * 43758.5) % 1;
    return r > 0.5 ? Math.exp(-f * 11) * Math.sin(f * 46) : 0;
  },
};
