'use strict';
// The smiler: the graveyard's old warden, a crypt keeper bent nearly double. A hump rises behind his left shoulder and his
// bald head juts forward low out of the collar, white wisps of hair lifting off the skull; a gaunt face, sunken cheeks, deep
// sockets, a long hooked nose, and the grin: thin lips stretched far too wide over long yellowed teeth, a few of them gone.
// A long ragged coat, a tattered cape over the shoulders and the hump, a rope belt with a ring of iron keys on it, a hooked
// staff with nothing hanging from its hook, and long bony hands held dead still. His head tilts further the nearer he comes.
// A night can also show him
//  - running flat out, side on (drawRun: c.runPose, c.runDir +1 to the right of the view, c.runGait its stride): bent further
//    over, the legs reach, the coat and its tatters stream out behind, the arms stay pinned to his sides with the staff
//    slanting in his fist, and the head stays turned to you, grinning. game.js sends him round a sealed way on his feet this
//    way, c.runLat metres to the right of his lane;
//  - rushing straight at you (c.rush 0..1): the knees come up high and the steps short and quick, the arms still;
//  - looking down (c.bow 0..1): the head drops, the bald crown comes into view, the eyes cast down under half-shut lids, still
//    grinning;
//  - turning away (c.turn 0..1, toward c.turnDir): side on, leaning on the staff, the face still turned to you, then the face
//    goes too;
//  - walking off (c.away, or c.turn at 1): from behind, the hump, the back of the bald head low beside it, the staff;
//  - reaching for you (c.lunge 0..1, his death lunge): he lets the staff fall and both hands come at you, the long fingers
//    hooked, to either side of his face; the head jerks one way and the other, the grin stretches and gapes, the eyes stare wider.
CREATURES.smiler = {
  name: 'the smiler', h: 1.75, w: 1.0, faceY: 1.32, stepRate: 1.3, catchDist: 1.4, sound: 'smiler',
  runW: 1.7,   // how wide the side-on run is drawn, the trailing heel to the leading toe and the staff's hook
  death: { delay: 0.5, dur: 1.3, sting: 'stingHum' },
  voice: { kind: 'hum', every: [6, 12] },
  init(c) { c.nextHitch = 4.5; c.hitchT = 0; c.hitchFlash = 0; },
  speedMult(c, dt, seen) {
    c.hitchT += dt;
    if (c.hitchFlash > 0) c.hitchFlash -= dt;
    if (c.hitchT >= c.nextHitch && !c.frozen) {
      c.hitchT = 0; c.nextHitch = 3.2 + c.rand() * 3;
      c.u = Math.min(0.995, c.u + 0.02); c.hitchFlash = 0.18; c.hitched = true;
    }
    return 1;
  },
  pal(P) {
    return {
      coat: P.col([30, 27, 24]), coatL: P.col([58, 52, 45]), coatF: P.col([15, 14, 13]), coatD: P.col([9, 8, 8]), cape: P.col([38, 34, 30]),
      skin: P.col([210, 202, 182]), skinS: P.col([172, 162, 143]), skinD: P.col([104, 92, 80]), shade: P.col([160, 150, 134]),
      hair: P.col([228, 226, 218]), hairA: P.cola([228, 226, 218], 0.72), sock: P.cola([92, 80, 68], 0.9), sock0: P.cola([150, 140, 124], 0), hollow: P.cola([150, 138, 120], 0.85), hollow0: P.cola([170, 160, 142], 0), white: P.col([244, 238, 220]),
      wood: P.col([80, 62, 44]), woodD: P.col([44, 34, 25]), iron: P.col([110, 104, 92]), rope: P.col([88, 76, 56]),
      leg: P.col([24, 22, 20]), boot: P.col([12, 10, 9]),
    };
  },
  draw(ctx, c, P) {
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    if (c.away || c.turn >= 1) { this.drawBack(ctx, c, P); return; }
    if (c.turn > 0) { this.drawSide(ctx, c, P, false, c.turn); return; }
    const g = c.gait, t = c.t, K = this.pal(P);
    const near = clamp(1 - c.dist / 22, 0, 1);
    const rush = c.rush || 0, bow = smoothstep(c.bow || 0), lunge = c.lunge || 0;
    const bob = Math.abs(Math.sin(g)) * (0.026 + rush * 0.05);
    const jx = c.hitchFlash > 0 ? (c.rand() - 0.5) * 0.09 : 0;
    const hb = bob - bow * 0.09 + lunge * 0.05;   // the shoulders: down as he bows over the salt, up as he reaches
    ctx.save(); ctx.translate(jx, 0);
    // the staff, in his right hand (the left of the view), its foot lifted and set down with his right foot. Reaching for
    // you, he lets it go: it tips away from him and is gone
    const sg = Math.max(0, Math.sin(g + Math.PI)) * 0.05 * (1 - lunge);
    if (lunge < 0.62) {
      ctx.save(); ctx.globalAlpha *= 1 - smoothstep(lunge / 0.62);
      ctx.translate(-0.39, sg); ctx.rotate(lunge * 0.9);
      this.staff(ctx, K, 0, 0, 0.02, 1.62, 1, near);
      ctx.restore();
    }
    // legs, bowed, the knees bent under the coat (rushing at you, they come right up)
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * (0.12 + rush * 0.22);
      P_limb(ctx, [[s * 0.08, 0.7 + bob], [s * 0.15, 0.38 + lift * 0.7], [s * 0.115, lift + 0.05]], 0.07, K.leg);
      P_ell(ctx, s * 0.135, lift + 0.035, 0.066, 0.034, K.boot, s * 0.12);
    }
    // the long coat, wider at the hem, the hem in tatters
    const hy = 0.46 + bob * 0.5;
    P_poly(ctx, [[-0.25, 1.22 + hb], [0.27, 1.3 + hb], [0.3, 1.0 + bob], [0.335, hy]].concat(this.hem(0.335, hy, -0.335, hy, 6, 0.12, 3, 0.012 + rush * 0.012, t), [[-0.335, hy], [-0.29, 1.0 + bob]]), K.coat);
    P_poly(ctx, [[-0.035, 1.16 + hb], [0.035, 1.16 + hb], [0.075, hy - 0.02], [-0.075, hy - 0.02]], K.coatD);   // open down the front
    P_line(ctx, 0.035, 1.16 + hb, 0.075, hy - 0.03, 0.014, K.coatL); P_line(ctx, -0.035, 1.16 + hb, -0.075, hy - 0.03, 0.014, K.coatL);
    if (near > 0.25) this.patch(ctx, K, -0.21, 0.66 + bob, 0.09, 0.1, 0.12);
    // the rope belt, and the ring of keys at his left hip
    P_line(ctx, -0.3, 0.85 + bob, 0.31, 0.87 + bob, 0.026, K.rope);
    P_limb(ctx, [[-0.06, 0.855 + bob], [-0.075, 0.76 + bob], [-0.065, 0.7 + bob]], 0.014, K.rope);
    this.keys(ctx, K, 0.17, 0.82 + bob, Math.sin(g * 2) * (c.moving ? 0.28 : 0.04), near);
    // the arms, out from under the cape: the right one bent to the staff, the left hanging long. Reaching, they come at you,
    // the elbows going out and the hands coming in, either side of his face and below it, to take you by the throat
    const reach = smoothstep(clamp(lunge / 0.7, 0, 1));
    const rh = [lerp(-0.37, -0.3, reach), lerp(0.94 + sg * 0.6 + bob * 0.5, 1.06, reach)], lh = [lerp(0.3, 0.31, reach), lerp(0.64 + bob, 0.99, reach)];
    P_limb(ctx, [[-0.25, 1.18 + hb], [lerp(-0.34, -0.47, reach), lerp(1.02, 0.92, reach) + hb], rh], lerp(0.068, 0.085, reach), K.coat);
    P_limb(ctx, [[0.27, 1.2 + hb], [lerp(0.33, 0.49, reach), lerp(0.92, 0.86, reach) + bob], lh], lerp(0.068, 0.085, reach), K.coat);
    // the cape, over the shoulders and up over the hump, its edge in tatters; the top of the hump catches what light there is
    const cb = 1.0 + hb;
    const capeTop = [[0.335, 1.24 + hb]].concat(this.hump(0.1, 1.36 + hb, 1), [[-0.13, 1.34 + hb], [-0.28, 1.24 + hb]]);
    P_poly(ctx, capeTop.concat([[-0.305, cb + 0.02]], this.hem(-0.305, cb + 0.02, 0.335, cb + 0.04, 5, 0.08, 7, 0.01, t)), K.cape);
    P_limb(ctx, capeTop.slice(1, -2), 0.02, K.coatL);
    // the hands: bony, the knuckles standing out. Reaching for you they are nearer than his face, and drawn over it
    const fist = (x, y) => { P_ell(ctx, x, y, 0.04, 0.05, K.skin); if (near > 0.2) for (let k = 0; k < 3; k++) P_ell(ctx, x + 0.026, y + 0.03 - k * 0.026, 0.012, 0.01, K.skinS); };
    const hands = () => {   // (reaching, nearer than he is, so larger, the long fingers splayed and hooked)
      const big = (x, y, f) => { ctx.save(); ctx.translate(x, y); ctx.scale(1 + 0.4 * reach, 1 + 0.4 * reach); ctx.translate(-x, -y); f(); ctx.restore(); };
      if (lunge < 0.05) fist(rh[0], rh[1]);
      else big(rh[0], rh[1], () => this.hand(ctx, K, rh[0], rh[1], lerp(-Math.PI / 2, 0.8, reach), lerp(0.16, 0.18, reach), lerp(-0.25, -1.0, reach), 1));
      big(lh[0], lh[1], () => this.hand(ctx, K, lh[0], lh[1], lerp(-Math.PI / 2 - 0.06, -Math.PI - 0.85, reach), lerp(0.12 + near * 0.06, 0.18, reach), lerp(0.35, 1.0, reach), near + lunge));
    };
    if (lunge < 0.3) hands();
    // the head, jutting forward out of the collar, low between the shoulders, craned up at you (bowed, it drops further)
    // Reaching, it jerks: it snaps one way and the other at odd moments, over and over further, trembling
    const side = Math.floor(t / 7) % 2 ? -1 : 1;
    let jerk = 0;
    if (lunge > 0) for (const [k, d] of [[0.1, -0.55], [0.27, 0.8], [0.46, -0.4], [0.66, 0.5], [0.82, -0.15]]) jerk += d * smoothstep((lunge - k) / 0.035);
    const tilt = ((0.06 + near * 0.5) * (1 - bow * 0.4) + jerk) * side + Math.sin(t * 53) * 0.02 * lunge;
    ctx.save(); ctx.translate(-0.01 + jerk * side * 0.02, 1.13 + hb - bow * 0.05 + lunge * 0.02); ctx.rotate(tilt);
    this.face(ctx, c, P, near, lunge, bow);
    ctx.restore();
    if (lunge >= 0.3) hands();
    ctx.restore();
  },
  // the top of the cape over the hump, from the high shoulder (side +1: on the right of the view) round to the other: an
  // arc of an ellipse about (cx, cy)
  hump(cx, cy, side) {
    const pts = [];
    for (let k = 0; k <= 8; k++) { const a = Math.PI * (0.1 + 0.7 * k / 8); pts.push([cx + side * Math.cos(a) * 0.23, cy + Math.sin(a) * 0.21]); }
    return pts;
  },
  // a ragged hem from (x0, y0) to (x1, y1): tatters, each its own length, hanging below the line and stirring a little
  hem(x0, y0, x1, y1, n, depth, seed, sway, t) {
    const pts = [];
    for (let k = 1; k < n * 2; k++) {
      const f = k / (n * 2), r = Math.abs(Math.sin((k + seed) * 78.233) * 437.585) % 1, deep = k % 2 === 1;
      pts.push([lerp(x0, x1, f) + (deep ? Math.sin(t * 2.3 + k * 1.7) * sway : 0), lerp(y0, y1, f) - (deep ? depth * (0.5 + 0.5 * r) : depth * 0.15 * r)]);
    }
    return pts;
  },
  // a patch sewn on the coat, a shade lighter, with a few stitches round it
  patch(ctx, K, x, y, w, h, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    P_rect(ctx, -w / 2, -h / 2, w, h, K.cape);
    ctx.strokeStyle = K.coatL; ctx.lineWidth = 0.006; ctx.beginPath();
    for (let k = 0; k < 4; k++) { const sx = -w / 2 + (k + 0.5) * w / 4; ctx.moveTo(sx, h / 2 - 0.012); ctx.lineTo(sx + 0.008, h / 2 + 0.012); ctx.moveTo(sx, -h / 2 - 0.012); ctx.lineTo(sx + 0.008, -h / 2 + 0.012); }
    ctx.stroke();
    ctx.restore();
  },
  // the staff: a crooked shaft from its foot (x0, y0) to its top (x1, y1), the hook curling over toward side (+1: +x), with
  // only an empty iron loop at the end of it where a lantern would hang
  staff(ctx, K, x0, y0, x1, y1, side, near) {
    const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = uy * side, ny = -ux * side;
    const at = (a, b) => [x1 + ux * a + nx * b, y1 + uy * a + ny * b];
    P_limb(ctx, [[x0, y0], [lerp(x0, x1, 0.45) - nx * 0.012, lerp(y0, y1, 0.45) - ny * 0.012], [x1, y1]], 0.032, K.woodD);
    P_limb(ctx, [[x0 + nx * 0.006, y0 + ny * 0.006], [lerp(x0, x1, 0.45) - nx * 0.006, lerp(y0, y1, 0.45) - ny * 0.006], [x1 + nx * 0.006, y1 + ny * 0.006]], 0.014, K.wood);
    P_limb(ctx, [[x1, y1], at(0.06, 0.015), at(0.1, 0.07), at(0.075, 0.135), at(0.01, 0.15), at(-0.045, 0.125)], 0.03, K.woodD);
    if (near > 0.15) { const e = at(-0.065, 0.12); ctx.strokeStyle = K.iron; ctx.lineWidth = 0.008; ctx.beginPath(); ctx.ellipse(e[0], e[1], 0.018, 0.024, 0, 0, TAU); ctx.stroke(); }
  },
  // a ring of iron keys hanging at (x, y), swinging by swing (radians)
  keys(ctx, K, x, y, swing, near) {
    ctx.strokeStyle = K.iron; ctx.lineWidth = 0.011; ctx.beginPath(); ctx.ellipse(x, y, 0.034, 0.03, 0, 0, TAU); ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const a = -Math.PI / 2 + (k - 1.5) * 0.3 + swing * (0.8 + k * 0.1), ca = Math.cos(a), sa = Math.sin(a);
      const bx = x + ca * 0.03, by = y + sa * 0.03, l = 0.085 + (k % 2) * 0.025;
      P_ell(ctx, bx + ca * 0.014, by + sa * 0.014, 0.013, 0.013, K.iron);   // its bow
      P_line(ctx, bx + ca * 0.02, by + sa * 0.02, bx + ca * l, by + sa * l, 0.011, K.iron);   // its shank
      if (near > 0.2) P_line(ctx, bx + ca * (l - 0.012), by + sa * (l - 0.012), bx + ca * (l - 0.012) - sa * 0.022, by + sa * (l - 0.012) + ca * 0.022, 0.01, K.iron);   // its bit
    }
  },
  // a long bony hand at (x, y), the fingers pointing along ang and bent at the knuckles by curl, a thumb to one side
  hand(ctx, K, x, y, ang, len, curl, near) {
    P_ell(ctx, x, y, 0.034, 0.046, K.skin, ang - Math.PI / 2);
    const ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i < 4; i++) {
      const a = ang + (i - 1.5) * 0.2, l = len * (i === 0 || i === 3 ? 0.8 : 1), x0 = x + ca * 0.03 + Math.cos(a) * 0.01, y0 = y + sa * 0.03 + Math.sin(a) * 0.01;
      const kx = x0 + Math.cos(a) * l * 0.5, ky = y0 + Math.sin(a) * l * 0.5, b = a + curl;
      P_limb(ctx, [[x0, y0], [kx, ky], [kx + Math.cos(b) * l * 0.5, ky + Math.sin(b) * l * 0.5]], 0.014, K.skin);
      if (near > 0.3) P_ell(ctx, kx, ky, 0.009, 0.009, K.skinS);   // the knuckle
    }
    const th = ang + 0.8, tx = x + Math.cos(th) * len * 0.34, ty = y + Math.sin(th) * len * 0.34;
    P_limb(ctx, [[x, y], [tx, ty], [tx + Math.cos(th - 0.35) * len * 0.22, ty + Math.sin(th - 0.35) * len * 0.22]], 0.016, K.skin);
  },
  // wisps of white hair off the sides and back of the bald skull, lifting and stirring (in the frame of the chin)
  wisps(ctx, K, t, front) {
    ctx.strokeStyle = K.hairA; ctx.lineWidth = 0.005; ctx.lineCap = 'round'; ctx.beginPath();
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {   // over each ear: the top one lifts, the others hang
      const y0 = 0.2 + i * 0.03, sw = Math.sin(t * 1.6 + i * 2.3 + s) * 0.014, end = i === 2 ? 0.075 : -0.025 - i * 0.03;
      ctx.moveTo(s * 0.098, y0); ctx.quadraticCurveTo(s * (0.16 + i * 0.012), y0 + 0.045, s * (0.185 + i * 0.014) + sw, y0 + end);
    }
    if (front) for (const s of [-1, 1]) {   // and two long ones lifting off the crown and curling over
      const sw = Math.sin(t * 1.3 + s) * 0.015, x0 = s * 0.035;
      ctx.moveTo(x0, 0.325); ctx.quadraticCurveTo(x0 + s * 0.05, 0.41, x0 + s * 0.1 + sw, 0.375);
    }
    ctx.stroke();
  },
  // the head from the front, in the frame of the chin (the head's base, where it comes out of the collar). Bowed (bow 0..1)
  // the bald crown comes into view, the face drops and shortens, and the eyes look down under lids half shut; the grin stays.
  face(ctx, c, P, near, lunge, bow) {
    const K = this.pal(P), t = c.t;
    const fy = bow * 0.07;   // how far the features drop
    if (bow) { ctx.translate(0, 0.07); ctx.scale(1, 1 - bow * 0.14); ctx.translate(0, -0.07); }   // foreshortened, tipped toward you
    for (const s of [-1, 1]) P_ell(ctx, s * 0.11, 0.17 - fy * 0.6, 0.026, 0.047, K.skinS, -s * 0.2);   // the ears, big, set out from the skull
    this.wisps(ctx, K, t, true);
    // the skull, high and narrow, the jaw coming down to a point
    P_ell(ctx, 0, 0.2, 0.106, 0.13, K.skin);
    const drop = lunge * 0.045;   // (gaping, the jaw drops)
    P_poly(ctx, [[-0.104, 0.19], [-0.1, 0.1], [-0.066, 0.035 - drop], [-0.022, 0.004 - drop], [0, -drop], [0.022, 0.004 - drop], [0.066, 0.035 - drop], [0.1, 0.1], [0.104, 0.19]], K.skin);
    for (const s of [-1, 1]) {   // the cheeks, sunk in under the cheekbones (a soft hollow, darkest in the middle)
      const x = s * 0.07, y = 0.14 - fy * 0.5, hg = ctx.createRadialGradient(x, y, 0, x, y, 0.034);
      hg.addColorStop(0, K.hollow); hg.addColorStop(1, K.hollow0); ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(x, y, 0.024, 0.036, -s * 0.25, 0, TAU); ctx.fill();
    }
    if (bow > 0.02) {   // the bald crown, tipped toward you, two long hairs combed across it
      P_ell(ctx, 0, 0.3 - fy * 0.3, 0.098, 0.055 * bow, K.skin);
      ctx.save(); ctx.globalAlpha *= bow;
      P_limb(ctx, [[-0.08, 0.29], [-0.02, 0.32], [0.07, 0.3]], 0.005, K.hair); P_limb(ctx, [[-0.07, 0.31], [0.01, 0.33], [0.08, 0.31]], 0.005, K.hair);
      ctx.restore();
    }
    // the eyes, deep in their sockets under a heavy brow: wide and blank, all white, staring at you from under it
    const er = 0.022 + near * 0.012 + lunge * 0.01, ey = 0.2 - fy;
    for (const s of [-1, 1]) {
      const sg = ctx.createRadialGradient(s * 0.044, ey + er * 0.35, er * 0.6, s * 0.044, ey + er * 0.2, er * 2);   // the socket, sunk in, darkest under the brow
      sg.addColorStop(0, K.sock); sg.addColorStop(1, K.sock0); ctx.fillStyle = sg;
      ctx.beginPath(); ctx.ellipse(s * 0.044, ey + er * 0.2, er * 2, er * 1.8, 0, 0, TAU); ctx.fill();
      P_ell(ctx, s * 0.044, ey, er, er * 1.05, K.white);
      if (bow > 0.01) {   // the lids come down over the top of the eyes
        ctx.save(); ctx.beginPath(); ctx.ellipse(s * 0.044, ey, er * 1.02, er * 1.08, 0, 0, TAU); ctx.clip();
        P_ell(ctx, s * 0.044, ey + er * 1.05 * (2 - bow * 0.95), er * 1.25, er * 1.05, K.skinS);
        ctx.restore();
      }
      P_line(ctx, s * 0.078, ey + er * 1.35, s * 0.016, ey + er * 1.05, 0.014, K.skinD);   // the brow
    }
    // the nose, long and thin, hooked, its tip hanging over the grin
    const ny = 0.118 - fy * 0.7;
    P_poly(ctx, [[-0.01, ey + 0.004], [0.01, ey + 0.004], [0.018, ny], [0.0, ny - 0.016], [-0.018, ny]], K.shade);
    P_line(ctx, 0.0, ey, 0.004, ny, 0.008, K.skin);
    for (const s of [-1, 1]) P_ell(ctx, s * 0.011, ny - 0.006, 0.006, 0.004, K.skinD);
    // the grin: a thin-lipped mouth stretched far too wide, its corners drawn right up into the hollow cheeks and the lips
    // pulled back off two rows of long yellowed teeth, a few of them gone. It parts as he nears, and reaching for you it
    // stretches wider still and gapes. (Each lip is a curve from corner to corner, so a point along it is a quadratic.)
    const my = 0.078 - fy * 0.5;
    const gw = (0.06 + near * 0.008 + lunge * 0.02) * (1 - bow * 0.08), up = 0.03 + near * 0.008 + lunge * 0.022;
    const th = 0.021 + near * 0.006, open = (0.006 + near * 0.012 + lunge * 0.034) * (1 - bow * 0.5);
    const E = my + up, cu = my + 0.006 - up, cl = 2 * (my - 2 * th - open) - E;   // the corners; the lips' control points
    const lip = (x, cy) => { const k = (x + gw) / (2 * gw); return E + 2 * k * (1 - k) * (cy - E); };
    const mouth = () => { ctx.beginPath(); ctx.moveTo(-gw, E); ctx.quadraticCurveTo(0, cu, gw, E); ctx.quadraticCurveTo(0, cl, -gw, E); ctx.closePath(); };
    mouth(); ctx.fillStyle = P.col([38, 12, 14]); ctx.fill();
    ctx.save(); mouth(); ctx.clip();
    const tooth = P.col([222, 210, 172]), n = 9, w = 2 * gw / n;
    for (let i = 0; i < n; i++) {
      const x = -gw + (i + 0.5) * w, r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      if (i !== 2 && i !== 6) { const y = lip(x, cu); P_rect(ctx, x - w * 0.43, y - th * (0.85 + 0.35 * r), w * 0.86, th * (0.85 + 0.35 * r) + 0.02, tooth); }   // the top row, hanging
      if (i !== 4) { const y = lip(x, cl); P_rect(ctx, x - w * 0.42, y - 0.02, w * 0.84, th * (0.75 + 0.3 * (1 - r)) + 0.02, tooth); }   // the bottom row
    }
    ctx.restore();
    ctx.strokeStyle = K.skinD; ctx.lineWidth = 0.007 + (1 - near) * 0.005; ctx.lineCap = 'round'; ctx.beginPath(); mouth(); ctx.stroke();   // the thin lips (a little heavier far off, so the shape of the grin carries)
    if (near > 0.2 || lunge) {   // the creases at the corners, curling up into the cheeks
      ctx.lineWidth = 0.005; ctx.beginPath();
      for (const s of [-1, 1]) { ctx.moveTo(s * (gw - 0.004), E - 0.012); ctx.quadraticCurveTo(s * (gw + 0.016), E - 0.002, s * (gw + 0.01), E + 0.024); }
      ctx.stroke();
    }
    if (near > 0.35 && bow < 0.5) {   // the forehead creased
      ctx.strokeStyle = K.shade; ctx.lineWidth = 0.005; ctx.beginPath();
      for (const y of [0.268, 0.29]) { ctx.moveTo(-0.05, y - fy); ctx.quadraticCurveTo(0, y + 0.008 - fy, 0.05, y - fy); }
      ctx.stroke();
    }
  },
  // the head in profile, facing +x, in the frame of the chin: the bald dome, the wisps off the back of it, the brow over a
  // deep socket and one wide eye, the hooked nose, the cheek sunk in, and the grin right back under the ear
  profile(ctx, c, P, near) {
    const K = this.pal(P), t = c.t;
    ctx.strokeStyle = K.hairA; ctx.lineWidth = 0.005; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const sw = Math.sin(t * 1.7 + i * 1.9) * 0.014, y0 = 0.17 + i * 0.035; ctx.moveTo(-0.09, y0); ctx.quadraticCurveTo(-0.16, y0 + 0.04, -0.2 - i * 0.012 + sw, y0 + (i === 3 ? 0.07 : -0.03 - i * 0.015)); }
    ctx.stroke();
    P_ell(ctx, -0.015, 0.205, 0.122, 0.122, K.skin);
    P_poly(ctx, [[0.098, 0.21], [0.108, 0.13], [0.1, 0.06], [0.07, 0.004], [0.025, -0.004], [-0.04, 0.05], [-0.07, 0.12]], K.skin);
    P_ell(ctx, 0.035, 0.115, 0.03, 0.036, K.shade);   // the cheek, sunk in
    P_poly(ctx, [[0.07, 0.27], [0.122, 0.245], [0.118, 0.222], [0.078, 0.228]], K.skin);   // the brow
    const er = 0.022 + near * 0.012;
    P_ell(ctx, 0.078, 0.205, 0.03, 0.028, K.skinD);
    P_ell(ctx, 0.088, 0.205, er * 0.72, er * 1.05, K.white);
    P_poly(ctx, [[0.108, 0.212], [0.15, 0.155], [0.162, 0.125], [0.15, 0.108], [0.128, 0.118], [0.108, 0.13]], K.skin);   // the nose
    P_ell(ctx, 0.132, 0.122, 0.008, 0.005, K.skinD);
    P_ell(ctx, -0.035, 0.18, 0.027, 0.048, K.skinS); P_ell(ctx, -0.032, 0.18, 0.012, 0.03, K.skinD);   // the ear
    ctx.fillStyle = K.white; ctx.beginPath();   // the grin, a crescent from the front of the jaw back under the ear
    ctx.moveTo(0.106, 0.085); ctx.quadraticCurveTo(0.035, 0.07, -0.035, 0.115); ctx.quadraticCurveTo(0.03, -0.005, 0.106, 0.085); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = P.cola([60, 40, 40], 0.8); ctx.lineWidth = 0.006; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const x = 0.09 - i * 0.024; ctx.moveTo(x, 0.078 + i * 0.005); ctx.lineTo(x - 0.004, 0.04 + i * 0.009); }
    ctx.stroke();
  },
  drawRun(ctx, c, P) { this.drawSide(ctx, c, P, true, 0); },
  // side on, facing +x before the mirror (dir: +1 to the right of the view). Running, he bends further over, the legs reach
  // and kick up behind, the coat and its tatters stream back, and the staff slants in the fist pinned at his side; standing
  // (turning away), he leans on the staff planted in front of him, the knees bent. The face stays turned to you while
  // running, and while turning away until turn passes 0.55; after that the head is in profile too.
  drawSide(ctx, c, P, run, turn) {
    const g = run ? (c.runGait || 0) : 0, dir = (run ? c.runDir : c.turnDir) || 1, t = c.t, K = this.pal(P);
    const near = clamp(1 - c.dist / 22, 0, 1);
    const thigh = 0.4, shin = 0.41, lean = run ? 0.6 : 0.34;
    ctx.save(); ctx.scale(dir, 1);
    const legs = [0, Math.PI].map(o => {
      const ph = g + o, a = run ? Math.sin(ph) * 0.72 : (o ? -0.04 : 0.16), bend = run ? 0.3 + 1.4 * Math.max(0, Math.cos(ph)) : 0.34;   // the knee folds as the leg swings through
      const kx = Math.sin(a) * thigh, ky = -Math.cos(a) * thigh, sa = a - bend;
      return { kx, ky, sa, fx: kx + Math.sin(sa) * shin, fy: ky - Math.cos(sa) * shin };
    });
    const hipY = 0.035 - Math.min(legs[0].fy, legs[1].fy), hipX = 0;   // whichever foot is lowest is on the ground
    const ux = Math.sin(lean), uy = Math.cos(lean);   // up the body; forward across it is (uy, -ux)
    const at = (v, u) => [hipX + u * ux + v * uy, hipY + u * uy - v * ux];   // a point on the body: v forward of its line, u up it
    const leg = (l, col) => {
      P_limb(ctx, [[hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy]], 0.075, col);
      const fx = Math.cos(l.sa), fy = Math.sin(l.sa);   // the boot, square to the shin, toes forward
      P_line(ctx, hipX + l.fx - fx * 0.04, hipY + l.fy - fy * 0.04, hipX + l.fx + fx * 0.12, hipY + l.fy + fy * 0.12, 0.065, K.boot);
    };
    const [sx, sy] = at(0.02, 0.54);   // the shoulder
    // the arms: running, held rigid at his sides and angled back past the hip, he does not swing them; standing, the far one
    // hangs and the near one holds the staff out in front of him
    const armTo = run ? (a => { const ex = sx - Math.sin(a) * 0.3, ey = sy - 0.04 - Math.cos(a) * 0.3; return [[ex, ey], [ex - Math.sin(a) * 0.3, ey - Math.cos(a) * 0.3]]; }) : null;
    const runA = lean + 0.3;
    const far = run ? armTo(runA) : [[sx + 0.03, sy - 0.3], [sx + 0.06, sy - 0.58]];
    P_limb(ctx, [[sx - 0.04, sy - 0.04]].concat(far), 0.066, K.coatF);
    this.hand(ctx, { skin: K.shade, skinS: K.skinD }, far[1][0], far[1][1], run ? -Math.PI / 2 - runA : -Math.PI / 2 + 0.1, 0.1 + near * 0.05, 0.3, near);
    leg(legs[1], K.coatF);   // the far side first
    leg(legs[0], K.leg);
    // the long coat, side on: up over the hump, the front of it pushed out by the leading knee, the hem streaming out behind
    const hemY = hipY - 0.34, lead = Math.max(legs[0].kx, legs[1].kx), fx = hipX + Math.max(0.15, lead * 0.9);
    const flare = run ? 0.2 + Math.sin(g * 2) * 0.04 : 0.02, bx = hipX - 0.2 - flare, by = hemY + flare * 0.9;
    P_poly(ctx, [at(0.1, 0.56), at(0.15, 0.4), at(0.15, 0.18), [fx, hemY + 0.02]].concat(this.hem(fx, hemY + 0.02, bx, by, 4, 0.1, 5, run ? 0.03 : 0.008, t), [[bx, by], at(-0.17, 0.14), at(-0.26, 0.34), at(-0.32, 0.52), at(-0.26, 0.7), at(-0.1, 0.78), at(0.04, 0.66)]), K.coat);
    const ch = at(0.14, 0.38);
    P_line(ctx, ch[0], ch[1], fx - 0.015, hemY + 0.05, 0.02, K.coatL);   // its front edge
    P_line(ctx, ...at(-0.17, 0.13), ...at(0.15, 0.15), 0.024, K.rope);   // the rope belt
    // the neck, scrawny, out of the collar (the cape hides where it starts) and forward to the head, which juts out low
    const nk = at(0.04, 0.54), hx = nk[0] + 0.14, hy0 = nk[1] - 0.1;
    P_limb(ctx, [nk, [hx - 0.03, hy0 + 0.07]], 0.07, K.shade);
    // the cape over the shoulders and the hump, its tatters lifting behind him as he runs
    const cf = at(0.13, 0.42), cbk = at(-0.34, 0.3 + (run ? 0.05 : 0));
    const capeTop = [at(0.12, 0.58)];
    for (let k = 0; k <= 8; k++) { const a = Math.PI * (0.15 + 0.95 * k / 8); capeTop.push(at(-0.12 + Math.cos(a) * 0.23, 0.58 + Math.sin(a) * 0.22)); }
    P_poly(ctx, capeTop.concat([cbk], this.hem(cbk[0], cbk[1], cf[0], cf[1], 4, 0.07, 9, run ? 0.025 : 0.006, t), [cf]), K.cape);
    P_limb(ctx, capeTop.slice(1, 8), 0.02, K.coatL);
    // the near arm and the staff in its fist
    let nh;
    if (run) {
      const arm = armTo(runA); nh = arm[1];
      P_limb(ctx, [[sx, sy - 0.04]].concat(arm), 0.068, K.coat);
      const b = lean + 0.6, su = Math.sin(b), cu = Math.cos(b);   // slanting up across his chest, the hook out under his chin (steeper, the face covered it)
      this.staff(ctx, K, nh[0] - su * 0.6, nh[1] - cu * 0.6, nh[0] + su * 0.62, nh[1] + cu * 0.62, 1, near);
    } else {
      nh = [sx + 0.2, sy - 0.32];
      this.staff(ctx, K, nh[0] + 0.035, 0, nh[0] + 0.01, 1.6, 1, near);
      P_limb(ctx, [[sx, sy - 0.04], [sx + 0.12, sy - 0.2], nh], 0.068, K.coat);
    }
    P_ell(ctx, nh[0], nh[1], 0.038, 0.048, K.skin);   // his fist round it
    this.keys(ctx, K, ...at(0.04, 0.1), run ? Math.sin(g * 2) * 0.5 - 0.4 : 0.05, near);
    // the head, held level whatever the body does
    const tilt = (0.06 + near * 0.4) * (Math.floor(c.t / 7) % 2 ? -1 : 1);
    if (turn >= 0.55) {
      ctx.save(); ctx.translate(hx, hy0); ctx.rotate(-Math.abs(tilt) * 0.5);
      this.profile(ctx, c, P, near);
      ctx.restore();
      ctx.restore();
      return;
    }
    ctx.restore();
    // the face, turned to you: drawn outside the mirror, where the head is
    ctx.save(); ctx.translate(dir * hx, hy0); ctx.rotate(tilt);
    this.face(ctx, c, P, near, 0, 0);
    ctx.restore();
  },
  // from behind, walking off: the heels, the ragged coat, the hump under the cape on his left (the left of the view), the
  // back of the bald head low beside it with the wisps off it and the ears, the staff in his right hand, the keys at his hip
  drawBack(ctx, c, P) {
    const g = c.gait, t = c.t, K = this.pal(P);
    const near = clamp(1 - c.dist / 22, 0, 1);
    const bob = Math.abs(Math.sin(g)) * 0.026;
    // the head, in front of him and so behind everything else from here: only the top of it shows, past his right shoulder
    const tilt = (0.06 + near * 0.5) * (Math.floor(t / 7) % 2 ? 1 : -1);   // the same tilt, seen from the other side
    ctx.save(); ctx.translate(0.05, 1.15 + bob); ctx.rotate(tilt);
    this.wisps(ctx, K, t, true);
    for (const s of [-1, 1]) P_ell(ctx, s * 0.11, 0.17, 0.026, 0.046, K.shade);
    P_ell(ctx, 0, 0.2, 0.108, 0.13, K.shade);
    ctx.restore();
    const sg = Math.max(0, Math.sin(g + Math.PI)) * 0.05;
    this.staff(ctx, K, 0.39, sg, 0.37, 1.62 + sg, -1, near);
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 0.12;
      P_limb(ctx, [[s * 0.08, 0.7 + bob], [s * 0.15, 0.38 + lift * 0.7], [s * 0.115, lift + 0.05]], 0.07, K.leg);
      P_ell(ctx, s * 0.12, lift + 0.035, 0.05, 0.034, K.boot);   // the heel
    }
    const hy = 0.46 + bob * 0.5;
    P_poly(ctx, [[0.25, 1.22 + bob], [-0.27, 1.3 + bob], [-0.3, 1.0 + bob], [-0.335, hy]].concat(this.hem(-0.335, hy, 0.335, hy, 6, 0.12, 4, 0.012, t), [[0.335, hy], [0.29, 1.0 + bob]]), K.coat);
    P_line(ctx, 0, 0.84 + bob, 0, 1.2 + bob, 0.012, K.coatL);   // the seam down the back
    P_poly(ctx, [[-0.04, hy - 0.02], [0.04, hy - 0.02], [0, 0.72 + bob]], K.coatD);   // and the vent
    P_line(ctx, -0.3, 0.86 + bob, 0.31, 0.85 + bob, 0.026, K.rope);
    this.keys(ctx, K, -0.18, 0.82 + bob, Math.sin(g * 2) * (c.moving ? 0.28 : 0.04), near);
    P_limb(ctx, [[-0.27, 1.2 + bob], [-0.33, 0.92 + bob], [-0.3, 0.64 + bob]], 0.068, K.coat);
    P_limb(ctx, [[0.25, 1.18 + bob], [0.34, 1.02 + bob], [0.37, 0.94 + sg * 0.6 + bob * 0.5]], 0.068, K.coat);
    const capeTop = [[-0.335, 1.24 + bob]].concat(this.hump(-0.1, 1.36 + bob, -1), [[0.13, 1.34 + bob], [0.28, 1.24 + bob]]);
    P_poly(ctx, capeTop.concat([[0.305, 1.02 + bob]], this.hem(0.305, 1.02 + bob, -0.335, 1.04 + bob, 5, 0.08, 8, 0.01, t)), K.cape);
    P_limb(ctx, capeTop.slice(1, -2), 0.02, K.coatL);
    P_limb(ctx, [[-0.24, 1.4 + bob], [-0.13, 1.47 + bob], [-0.02, 1.44 + bob]], 0.01, K.coat);   // a fold over the hump
    P_ell(ctx, -0.3, 0.6 + bob, 0.034, 0.05, K.shade);
    if (near > 0.3) fingers(ctx, -0.3, 0.56 + bob, -Math.PI / 2, 0.18, 0.08 + near * 0.05, 0.014, K.shade);
    P_ell(ctx, 0.37, 0.94 + sg * 0.6 + bob * 0.5, 0.038, 0.048, K.shade);
  },
};
