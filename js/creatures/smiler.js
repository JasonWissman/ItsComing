'use strict';
// The smiler: a man in a long dark coat, his arms dead still at his sides, his head tilting further the nearer he comes,
// and the grin. A night can also show him
//  - running flat out, side on (drawRun: c.runPose, c.runDir +1 to the right of the view, c.runGait its stride): the legs
//    reach, the coat streams out behind, the arms stay pinned to his sides and the head stays turned to you, grinning.
//    game.js sends him round a sealed way on his feet this way, c.runLat metres to the right of his lane;
//  - rushing straight at you (c.rush 0..1): the knees come up high and the steps short and quick, the arms still;
//  - looking down (c.bow 0..1): the head bowed, the eyes cast down under half-shut lids, still grinning;
//  - turning away (c.turn 0..1, toward c.turnDir): side on with the face still turned to you, then the face goes too;
//  - walking off (c.away, or c.turn at 1): from behind, the slick back of his head.
CREATURES.smiler = {
  name: 'the smiler', h: 1.95, w: 1.0, faceY: 1.72, stepRate: 1.3, catchDist: 1.4, sound: 'smiler',
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
  draw(ctx, c, P) {
    if (c.runPose) { this.drawRun(ctx, c, P); return; }
    if (c.away || c.turn >= 1) { this.drawBack(ctx, c, P); return; }
    if (c.turn > 0) { this.drawSide(ctx, c, P, false, c.turn); return; }
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const coat = P.col([16, 14, 20]), coatL = P.col([30, 27, 36]);
    const skin = P.col([216, 208, 198]);
    const black = P.col([4, 4, 6]);
    const rush = c.rush || 0, bow = smoothstep(c.bow || 0);
    const bob = Math.abs(Math.sin(g)) * (0.028 + rush * 0.05);
    const jx = c.hitchFlash > 0 ? (c.rand() - 0.5) * 0.09 : 0;
    const lunge = c.lunge || 0;
    ctx.save(); ctx.translate(jx, 0);
    // legs (rushing at you, the knees come right up)
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * (0.16 + rush * 0.22);
      P_limb(ctx, [[s * 0.1, 0.95 + bob], [s * 0.12, 0.5 + lift * 0.6], [s * 0.13, lift + 0.03]], 0.11, coat);
      P_line(ctx, s * 0.1, lift + 0.03, s * 0.18, lift + 0.03, 0.06, black);
    }
    // long coat (bowing, he bends a little from the waist toward what he is looking at: his shoulders come down and in)
    const sh = bow * 0.15, sw = bow * 0.02;
    P_poly(ctx, [[-0.27, 0.62 + bob], [0.27, 0.62 + bob], [0.25 + sw, 1.62 + bob - sh], [-0.25 - sw, 1.62 + bob - sh]], coat);
    P_poly(ctx, [[-0.04, 1.0 + bob], [0.04, 1.0 + bob], [0.05, 1.6 + bob - sh], [-0.05, 1.6 + bob - sh]], coatL);
    // arms: perfectly still at the sides
    for (const s of [-1, 1]) {
      const ex = s * lerp(0.3, 0.36, lunge), hy = lerp(0.82, 1.35, lunge) - sh * 0.2, hx = s * lerp(0.31, 0.22, lunge);
      P_limb(ctx, [[s * (0.26 + sw), 1.58 + bob - sh], [ex, 1.15 + bob - sh * 0.4], [hx, hy + bob]], 0.075, coat);
      P_ell(ctx, hx, hy - 0.04 + bob, 0.04, 0.07, skin);
      if (near > 0.3 || lunge > 0) fingers(ctx, hx, hy - 0.08 + bob, lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, lunge), 0.2, 0.09 + near * 0.06, 0.016, skin);
    }
    // head, tilting further as it comes (bowed, the neck bends and the head drops forward)
    const tilt = (0.06 + near * 0.55 + lunge * 0.3) * (Math.floor(t / 7) % 2 ? -1 : 1) * (1 - bow * 0.4);
    ctx.save(); ctx.translate(0, 1.62 + bob - sh - bow * 0.07); ctx.rotate(tilt);
    this.face(ctx, c, P, near, lunge, bow);
    ctx.restore();
    ctx.restore();
  },
  // the head from the front, in the frame of the top of the neck. Bowed (bow 0..1) the crown comes into view, the face
  // drops and shortens, and the eyes look down under lids half shut; the grin stays.
  face(ctx, c, P, near, lunge, bow) {
    const coat = P.col([16, 14, 20]), skin = P.col([216, 208, 198]), white = P.col([246, 242, 236]), black = P.col([4, 4, 6]);
    const fy = bow * 0.075;   // how far the features drop
    P_line(ctx, 0, 0, 0, 0.08, 0.09, skin);
    if (bow) { ctx.translate(0, 0.07); ctx.scale(1, 1 - bow * 0.12); ctx.translate(0, -0.07); }   // foreshortened, tipped toward you
    P_ell(ctx, 0, 0.22, 0.125, 0.155, skin);
    // hair: slick, dark
    P_poly(ctx, [[-0.125, 0.25 - fy], [-0.1, 0.36], [0, 0.39], [0.1, 0.36], [0.125, 0.25 - fy], [0.06, 0.31 - fy * 1.3], [-0.06, 0.31 - fy * 1.3]], coat);
    // eyes: wide, whites showing
    const er = 0.026 + near * 0.014 + lunge * 0.01, ey = 0.245 - fy;
    P_ell(ctx, -0.047, ey, er, er * 1.05, white); P_ell(ctx, 0.047, ey, er, er * 1.05, white);
    P_ell(ctx, -0.047, ey - 0.002 - bow * er * 0.55, 0.008, 0.009, black); P_ell(ctx, 0.047, ey - 0.002 - bow * er * 0.55, 0.008, 0.009, black);
    if (bow > 0.01) for (const s of [-1, 1]) {   // the lids come down over the top of the eyes
      ctx.save(); ctx.beginPath(); ctx.ellipse(s * 0.047, ey, er * 1.02, er * 1.08, 0, 0, TAU); ctx.clip();
      P_ell(ctx, s * 0.047, ey + er * 1.05 * (2 - bow * 0.95), er * 1.25, er * 1.05, skin);
      ctx.restore();
    }
    // the grin
    const gw = 0.085 + near * 0.03 + lunge * 0.02, gd = (0.045 + near * 0.03 + lunge * 0.03) * (1 - bow * 0.35), my = 0.15 - fy * 0.8;
    ctx.fillStyle = white; ctx.beginPath();
    ctx.moveTo(-gw, my); ctx.quadraticCurveTo(0, my - gd * 0.25, gw, my);
    ctx.quadraticCurveTo(0, my - gd * 2.2, -gw, my); ctx.closePath(); ctx.fill();
    if (near > 0.15 || lunge > 0) {
      ctx.strokeStyle = P.cola([60, 40, 40], 0.8); ctx.lineWidth = 0.006; ctx.beginPath();
      for (let i = -3; i <= 3; i++) { const x = i * gw * 0.26; const d = gd * (1 - Math.abs(i) / 4.2); ctx.moveTo(x, my - d * 0.1); ctx.lineTo(x, my - d * 1.1); }
      ctx.stroke();
    }
  },
  drawRun(ctx, c, P) { this.drawSide(ctx, c, P, true, 0); },
  // side on, facing +x before the mirror (dir: +1 to the right of the view). Running, the legs reach and kick up behind
  // and the coat streams back; standing (turning away), the legs are together. The arms never move. The face stays turned
  // to you while running, and while turning away until turn passes 0.55; after that the head is in profile too.
  drawSide(ctx, c, P, run, turn) {
    const g = run ? (c.runGait || 0) : 0, dir = (run ? c.runDir : c.turnDir) || 1;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const coat = P.col([16, 14, 20]), coatL = P.col([30, 27, 36]), coatF = P.col([9, 8, 12]);
    const skin = P.col([216, 208, 198]), black = P.col([4, 4, 6]);
    const thigh = 0.47, shin = 0.47, lean = run ? 0.3 : 0;
    ctx.save(); ctx.scale(dir, 1);
    const legs = [0, Math.PI].map(o => {
      const ph = g + o, a = run ? Math.sin(ph) * 0.75 : (o ? -0.04 : 0.05), bend = run ? 0.22 + 1.45 * Math.max(0, Math.cos(ph)) : 0.03;   // the knee folds as the leg swings through
      const kx = Math.sin(a) * thigh, ky = -Math.cos(a) * thigh, sa = a - bend;
      return { kx, ky, sa, fx: kx + Math.sin(sa) * shin, fy: ky - Math.cos(sa) * shin };
    });
    const hipY = 0.03 - Math.min(legs[0].fy, legs[1].fy), hipX = 0;   // whichever foot is lowest is on the ground
    const ux = Math.sin(lean), uy = Math.cos(lean);   // up the body; forward across it is (uy, -ux)
    const at = (v, u) => [hipX + u * ux + v * uy, hipY + u * uy - v * ux];   // a point on the body: v forward of its line, u up it
    const [sx, sy] = at(0, 0.66);
    const leg = (l, col) => {
      P_limb(ctx, [[hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy]], 0.11, col);
      const fx = Math.cos(l.sa), fy = Math.sin(l.sa);   // the shoe, square to the shin, toes forward
      P_line(ctx, hipX + l.fx - fx * 0.04, hipY + l.fy - fy * 0.04, hipX + l.fx + fx * 0.13, hipY + l.fy + fy * 0.13, 0.065, black);
    };
    const arm = (off, col, hand) => {   // held rigid at his side, angled back past his hip: he does not swing them to run
      const a = lean + (run ? 0.32 : 0.04), x0 = sx + off, y0 = sy - 0.05;
      const ex = x0 - Math.sin(a) * 0.37, ey = y0 - Math.cos(a) * 0.37, hx = ex - Math.sin(a) * 0.33, hy = ey - Math.cos(a) * 0.33;
      P_limb(ctx, [[x0, y0], [ex, ey], [hx, hy]], 0.075, col);
      P_ell(ctx, hx - Math.sin(a) * 0.035, hy - Math.cos(a) * 0.035, 0.032, 0.065, hand, -a);
      if (near > 0.3) fingers(ctx, hx - Math.sin(a) * 0.08, hy - Math.cos(a) * 0.08, -Math.PI / 2 - a, 0.1, 0.08 + near * 0.05, 0.016, hand);
    };
    arm(-0.06, coatF, P.col([150, 144, 138]));   // the far arm, in his shadow
    leg(legs[1], coatF);   // the far side first
    leg(legs[0], coat);
    // the long coat, side on: as deep as his chest, the hem pushed forward by the leading knee and streaming out behind
    const hemY = hipY - 0.33, lead = Math.max(legs[0].kx, legs[1].kx), fx = hipX + Math.max(0.14, lead * 0.9);
    const flare = run ? 0.2 + Math.sin(g * 2) * 0.04 : 0.02;
    P_poly(ctx, [at(-0.12, 0.69), at(0.08, 0.69), at(0.14, 0.42), [fx, hemY + 0.02], [hipX - 0.17 - flare, hemY + flare * 0.9], at(-0.16, 0.3)], coat);
    const ch = at(0.13, 0.4);
    P_line(ctx, ch[0], ch[1], fx - 0.015, hemY + 0.05, 0.022, coatL);   // its front edge
    arm(0, coatL, skin);
    // the neck out of the collar, and the head on it held level, whatever the body does
    const [nx, ny] = at(0.03, 0.68);
    const tilt = (0.06 + near * 0.4) * (Math.floor(c.t / 7) % 2 ? -1 : 1);
    if (turn >= 0.55) {   // the head in profile: the slick hair down the back of it, one wide eye, and the grin right back to the ear
      ctx.save(); ctx.translate(nx, ny); ctx.rotate(-Math.abs(tilt) * 0.5);
      const white = P.col([246, 242, 236]);
      P_line(ctx, 0, 0, 0.01, 0.08, 0.09, skin);
      P_ell(ctx, 0.02, 0.22, 0.135, 0.155, skin);
      P_poly(ctx, [[0.142, 0.24], [0.178, 0.2], [0.145, 0.185]], skin);   // the nose
      P_poly(ctx, [[0.12, 0.33], [0.05, 0.38], [-0.06, 0.375], [-0.125, 0.31], [-0.13, 0.17], [-0.08, 0.12], [-0.06, 0.25], [0.02, 0.315], [0.11, 0.31]], coat);
      P_ell(ctx, -0.01, 0.215, 0.022, 0.038, P.col([190, 182, 172]));   // the ear
      const er = 0.026 + near * 0.014;
      P_ell(ctx, 0.095, 0.245, er * 0.75, er * 1.05, white); P_ell(ctx, 0.112, 0.244, 0.008, 0.009, black);
      ctx.fillStyle = white; ctx.beginPath();   // the grin, a crescent from the front of the face back under the ear
      ctx.moveTo(0.152, 0.165); ctx.quadraticCurveTo(0.07, 0.15, -0.012, 0.19); ctx.quadraticCurveTo(0.06, 0.065, 0.152, 0.165); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = P.cola([60, 40, 40], 0.8); ctx.lineWidth = 0.006; ctx.beginPath();
      for (let i = 0; i < 6; i++) { const x = 0.13 - i * 0.026; ctx.moveTo(x, 0.155 + i * 0.004); ctx.lineTo(x - 0.004, 0.115 + i * 0.008); }
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      return;
    }
    ctx.restore();
    // the face, turned to you: drawn outside the mirror, where the neck is
    ctx.save(); ctx.translate(dir * nx, ny); ctx.rotate(tilt);
    this.face(ctx, c, P, near, 0, 0);
    ctx.restore();
  },
  // from behind, walking off: the heels, the seam and the vent of the coat, the hands still at the sides, the slick back of
  // the head down to the nape, and the ears
  drawBack(ctx, c, P) {
    const g = c.gait, t = c.t;
    const near = clamp(1 - c.dist / 22, 0, 1);
    const coat = P.col([16, 14, 20]), coatL = P.col([30, 27, 36]), black = P.col([4, 4, 6]);
    const shade = P.col([170, 162, 154]);   // skin seen from behind, out of the light
    const bob = Math.abs(Math.sin(g)) * 0.028;
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.16;
      P_limb(ctx, [[s * 0.1, 0.95 + bob], [s * 0.12, 0.5 + lift * 0.6], [s * 0.13, lift + 0.03]], 0.11, coat);
      P_ell(ctx, s * 0.13, lift + 0.035, 0.052, 0.034, black);   // the heel
    }
    P_poly(ctx, [[-0.27, 0.62 + bob], [0.27, 0.62 + bob], [0.25, 1.62 + bob], [-0.25, 1.62 + bob]], coat);
    P_line(ctx, 0, 0.84 + bob, 0, 1.56 + bob, 0.012, coatL);   // the seam down the back
    P_poly(ctx, [[-0.035, 0.62 + bob], [0.035, 0.62 + bob], [0, 0.85 + bob]], black);   // and the vent
    P_line(ctx, -0.25, 1.6 + bob, 0.25, 1.6 + bob, 0.03, coatL);   // the collar
    for (const s of [-1, 1]) {
      P_limb(ctx, [[s * 0.26, 1.58 + bob], [s * 0.3, 1.15 + bob], [s * 0.31, 0.82 + bob]], 0.075, coat);
      P_ell(ctx, s * 0.31, 0.78 + bob, 0.04, 0.07, shade);
      if (near > 0.3) fingers(ctx, s * 0.31, 0.74 + bob, -Math.PI / 2, 0.2, 0.09 + near * 0.06, 0.016, shade);
    }
    const tilt = (0.06 + near * 0.55) * (Math.floor(t / 7) % 2 ? 1 : -1);   // the same tilt, seen from the other side
    ctx.save(); ctx.translate(0, 1.62 + bob); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.08, 0.09, shade);
    for (const s of [-1, 1]) P_ell(ctx, s * 0.123, 0.21, 0.022, 0.04, shade);   // the ears
    P_ell(ctx, 0, 0.22, 0.125, 0.155, shade);
    P_poly(ctx, [[-0.127, 0.2], [-0.12, 0.31], [-0.07, 0.37], [0, 0.39], [0.07, 0.37], [0.12, 0.31], [0.127, 0.2], [0.09, 0.12], [0.03, 0.1], [0, 0.085], [-0.03, 0.1], [-0.09, 0.12]], coat);   // slick hair, to a point at the nape
    P_limb(ctx, [[-0.07, 0.34], [-0.02, 0.22], [-0.03, 0.12]], 0.008, coatL); P_limb(ctx, [[0.05, 0.35], [0.06, 0.23], [0.04, 0.13]], 0.008, coatL);   // combed straight back
    ctx.restore();
  },
};
