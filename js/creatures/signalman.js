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
// its back, eyeless, as it walks off.
// The night moves it (night 9: from street lamp to street lamp) and tells it what it is doing: c.side, how far to the side
// of its way it is; c.reach (0..1), one arm unspooling up to c.reachTo (across and up from its feet, in metres; c.reachSide
// the arm), the hand closing on what it reaches (c.grip); c.rush (0..1), skittering, low; c.lampLit (0..1, more in the
// flare), how lit it is by the lamp it stands behind (a faint rim along its shoulder, never its face); c.dark, out of the light.
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
    const reveal = back ? 0 : smoothstep(lunge * 1.6);   // (only coming at you: no lamp ever lights its face)
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
    // where a lamp it stands behind lights it: a thin warm rim along the shoulder toward it, and nothing on the head or the
    // face, which stay all dark but the two points of the eyes
    if (!back && !lunge && c.lampLit > 0.02) {
      const sd = c.reachTo && c.reachTo.x < 0 ? -1 : 1, rim = P.cola([255, 176, 104], Math.min(1, c.lampLit) * 0.3);
      ctx.strokeStyle = rim; ctx.lineWidth = W(0.005); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sd * 0.03 + sway, shY + 0.04); ctx.quadraticCurveTo(sd * (shW - 0.02) + sway, shY + 0.02, sd * shW + sway, shY - 0.02); ctx.stroke();
    }
    if (back) ctx.restore();
    if (c.held && !c.moving && !lunge) P_ell(ctx, 0, 0.02, 0.35, 0.04, P.cola([0, 0, 0], 0.25));
  },
  // the face, in the head's own frame (its middle at nought). Wherever it is, lit by a lamp or not, near or far, there is
  // nothing of it but the two small pale points of the eyes: the light never finds a face. Only coming at you (reveal, over
  // the first of the lunge) does one come out of the dark: a dim, even pallor with nothing on it but two pale eyes, blank,
  // and a mouth from one cheekbone to the other, a slit of small teeth that opens into a black hole full of them, the jaw
  // dropping far too far
  face(ctx, c, P, ink, turn, reveal, lunge, px) {
    const fx = turn * 0.045, rv = clamp(reveal, 0, 1), gape = smoothstep(lunge * 1.3);
    // the head: long and narrow, the jaw dropping out of it as the mouth opens
    P_ell(ctx, 0, 0, Math.max(0.075, 0.9 * px), Math.max(0.13, 0.9 * px), ink);
    if (gape > 0.01) P_ell(ctx, fx * 0.5, -0.1 - gape * 0.07, 0.06, 0.05 + gape * 0.08, ink);
    if (rv > 0.02 && px < 0.03) {
      const a = Math.min(1, rv * 0.9), fy = -0.005 - gape * 0.04;
      // the pallor: one dim, even light over it, lost only at its edges
      const sk = ctx.createRadialGradient(fx * 0.5, fy, 0.01, fx * 0.4, fy, 0.13 + gape * 0.04);
      sk.addColorStop(0, P.cola([104, 100, 88], a * 0.8)); sk.addColorStop(0.55, P.cola([94, 90, 78], a * 0.62)); sk.addColorStop(1, P.cola([40, 38, 34], 0));
      ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(fx * 0.5, fy, 0.07, 0.124 + gape * 0.06, 0, 0, TAU); ctx.fill();
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
        const k = s > 0 ? 1.12 : 1, rx = lerp(0.005, 0.0145 + gape * 0.004, big) * k, ry = lerp(0.005, 0.0105 + gape * 0.005, big) * k;
        P_ell(ctx, x, y, rx, ry, P.raw([222, 224, 206]));
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
