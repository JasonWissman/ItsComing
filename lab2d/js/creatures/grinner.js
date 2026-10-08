'use strict';
// The grinner: a child-sized thing in striped pyjamas that stands in the hall and smiles. It only moves while you are
// not looking; seen, it is perfectly still, and the smile is a little wider each time. Its face is a hole with two
// eyes in it, ringed red: the one colour in a drawing that is otherwise ink.
CREATURES.grinner = {
  name: 'the grinner', h: 1.35, w: 0.8, faceY: 1.2, stepRate: 1.9, catchDist: 1.2, sound: null, lab: true,
  init(c) { c.widen = 0; c.lastSeen = true; },
  speedMult(c, dt, seen) { if (seen && !c.lastSeen) c.widen = Math.min(1, c.widen + 0.2); c.lastSeen = seen; return seen ? 0 : 1.8; },
  draw(ctx, c, P) {
    const spot = P.spot || P.col, g = c.gait, t = c.t, lunge = c.lunge || 0;
    const near = clamp(1 - c.dist / 14, 0, 1);
    const cloth = P.col([212, 206, 196]), clothD = P.col([150, 144, 136]), stripe = P.col([40, 36, 40]), ink = P.col([6, 5, 8]);
    const hair = P.col([10, 8, 10]), skin = P.col([160, 150, 140]), white = P.col([248, 246, 240]), red = spot([170, 20, 24]);
    const bob = c.moving ? Math.abs(Math.sin(g)) * 0.02 : 0;
    // legs: pyjama trousers, straight, small dark shoes
    for (const s of [-1, 1]) {
      P.part(s < 0 ? 'legL' : 'legR', s * 0.09, 0.62);
      const ph = g + (s > 0 ? Math.PI : 0), lift = c.moving ? Math.max(0, Math.sin(ph)) * 0.08 : 0;
      P_poly(ctx, [[s * 0.03, 0.62 + bob], [s * 0.15, 0.62 + bob], [s * 0.14, 0.08 + lift], [s * 0.05, 0.08 + lift]], cloth);
      P_hatch(ctx, [[s * 0.03, 0.62 + bob], [s * 0.15, 0.62 + bob], [s * 0.14, 0.08 + lift], [s * 0.05, 0.08 + lift]], 0.025, 1.1, 0.006, clothD, { from: s > 0 ? -0.02 : 0.3, to: s > 0 ? 0.3 : -0.02 });
      P_ell(ctx, s * 0.1, 0.035 + lift, 0.075, 0.035, ink);
    }
    // the one-piece: a loose top, a collar in a V, buttons down the front, a pocket
    P.part('body', 0, 0.62);
    const top = [[-0.19, 0.6 + bob], [0.19, 0.6 + bob], [0.21, 1.03 + bob], [-0.21, 1.03 + bob]];
    P_poly(ctx, top, cloth);
    P_hatch(ctx, top, 0.028, 1.2, 0.006, clothD, { from: 0.0, to: 0.3 });
    P_poly(ctx, [[-0.07, 1.03 + bob], [0.07, 1.03 + bob], [0, 0.9 + bob]], ink);
    for (let i = 0; i < 4; i++) P_ell(ctx, 0, 0.68 + i * 0.07 + bob, 0.011, 0.011, ink);
    P_rect(ctx, 0.06, 0.82 + bob, 0.09, 0.08, clothD); P_line(ctx, 0.06, 0.9 + bob, 0.15, 0.9 + bob, 0.006, ink);
    // arms straight at the sides in striped sleeves, fists
    for (const s of [-1, 1]) {
      P.part(s < 0 ? 'armL' : 'armR', s * 0.24, 1.01);
      const sleeve = [[s * 0.19, 1.02 + bob], [s * 0.29, 1.0 + bob], [s * 0.3, 0.62 + bob], [s * 0.2, 0.62 + bob]];
      P_stripes(ctx, sleeve, 6, cloth, stripe);
      P_ell(ctx, s * 0.25, 0.57 + bob, 0.045, 0.05, skin);
      P_line(ctx, s * 0.22, 0.57 + bob, s * 0.28, 0.57 + bob, 0.006, ink);
    }
    // the head: a hole, long hair hanging either side of it, and in the hole two eyes and the grin
    const tilt = (0.08 + near * 0.12) * (Math.floor(t / 9) % 2 ? -1 : 1) * (1 - lunge);
    P.part('head', 0, 1.04);
    ctx.save(); ctx.translate(0, 1.04 + bob); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.06, 0.07, ink);
    for (const s of [-1, 1]) P_tatter(ctx, [[s * 0.06, 0.3], [s * 0.19, 0.22], [s * 0.21, -0.3, 't'], [s * 0.1, -0.26]], hair, 3 + s, 0.05, 6);
    P_ell(ctx, 0, 0.17, 0.125, 0.145, hair);
    P_ell(ctx, 0, 0.15, 0.1, 0.12, ink);
    const er = 0.027 + near * 0.008 + lunge * 0.01, w = 0.06 + c.widen * 0.03 + near * 0.025 + lunge * 0.03;
    for (const s of [-1, 1]) {
      P_ell(ctx, s * 0.045, 0.18, er * 1.25, er * 1.25, red);
      P_ell(ctx, s * 0.045, 0.18, er, er, white);
      P_ell(ctx, s * 0.045, 0.18, er * 0.3, er * 0.3, ink);
      if (P.glow) P.glow(s * 0.045, 0.18, 0.08, [200, 30, 30], 0.25 + near * 0.3);
    }
    ctx.fillStyle = white; ctx.beginPath(); ctx.moveTo(-w, 0.09); ctx.quadraticCurveTo(0, 0.1 + lunge * 0.02, w, 0.09); ctx.quadraticCurveTo(0, 0.02 - near * 0.03 - lunge * 0.04, -w, 0.09); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = P.cola([40, 30, 34], 0.9); ctx.lineWidth = 0.004; ctx.beginPath();
    for (let i = -4; i <= 4; i++) { const x = i * w * 0.21, d = (0.04 + near * 0.02) * (1 - Math.abs(i) / 5.5); ctx.moveTo(x, 0.092); ctx.lineTo(x, 0.09 - d); }
    ctx.stroke();
    ctx.restore();
  }
};
