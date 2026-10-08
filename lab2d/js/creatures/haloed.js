'use strict';
// The haloed: a saint of something, all bone in a torn cassock, a crown of rays behind a hood with no face in it,
// red cloth hanging from its shoulders like wings. It walks the way a procession walks and raises both hands as it
// comes, as if in blessing. Gold and red are the spot colours; everything else is bone and ink.
CREATURES.haloed = {
  name: 'the haloed', h: 2.25, w: 1.7, faceY: 1.95, stepRate: 0.7, catchDist: 1.4, sound: null, lab: true,
  init(c) { },
  speedMult(c, dt, seen) { return 1; },
  draw(ctx, c, P) {
    const spot = P.spot || P.col, g = c.gait, t = c.t, lunge = c.lunge || 0, near = clamp(1 - c.dist / 18, 0, 1);
    const bone = P.col([214, 204, 186]), boneD = P.col([150, 140, 124]), cassock = P.col([196, 182, 158]), cassockD = P.col([132, 120, 102]);
    const ink = P.col([5, 4, 6]), gold = spot([228, 176, 60]), goldD = spot([150, 110, 30]), red = spot([150, 18, 24]), redD = spot([90, 8, 14]), cavity = P.col([28, 10, 12]);
    const bob = Math.abs(Math.sin(g)) * 0.025, flap = Math.sin(t * 1.6) * 0.06;
    // the halo, behind the head
    P_halo(ctx, 0, 1.96 + bob, 0.46, 18, goldD, t, 0.022);
    P_halo(ctx, 0, 1.96 + bob, 0.42, 18, gold, t, 0.012);
    // the red cloth: two tattered wings from the shoulders, lifting and falling
    for (const s of [-1, 1]) {
      const wing = [[s * 0.28, 1.7 + bob], [s * 0.78, 1.95 + bob + flap * s * 0.5], [s * 0.86, 1.3 + flap, 't'], [s * 0.4, 1.1 + bob]];
      P_tatter(ctx, wing, red, 31 + s, 0.09, 9);
      P_hatch(ctx, wing, 0.04, 1.0, 0.008, redD, { from: -0.1, to: 0.6 });
    }
    // legs: bone, thin, under the torn skirt of the cassock
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 0.14;
      P_limb(ctx, [[s * 0.1, 0.95 + bob], [s * 0.12, 0.5 + lift * 0.6], [s * 0.14, lift + 0.03]], 0.05, bone);
      P_ell(ctx, s * 0.12, 0.5 + lift * 0.6, 0.035, 0.035, boneD);
      fingers(ctx, s * 0.14, lift + 0.03, s > 0 ? 0.25 : Math.PI - 0.25, 0.3, 0.1, 0.012, bone);
    }
    P_tatter(ctx, [[-0.22, 1.15 + bob], [0.22, 1.15 + bob], [0.3, 0.3 + bob, 't'], [-0.3, 0.3 + bob]], cassock, 7, 0.1, 10);
    P_hatch(ctx, [[-0.22, 1.15 + bob], [0.22, 1.15 + bob], [0.3, 0.3 + bob], [-0.3, 0.3 + bob]], 0.035, 1.2, 0.007, cassockD, { from: 0.02, to: 0.5 });
    // the ribcage, open where the cassock is torn away, over the dark inside
    P_ribs(ctx, 0, 1.15 + bob, 0.44, 0.5, 6, bone, cavity, 0.2);
    P_poly(ctx, [[-0.26, 1.62 + bob], [0.26, 1.62 + bob], [0.3, 1.78 + bob], [-0.3, 1.78 + bob]], cassock);   // the yoke
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) P_poly(ctx, [[s * (0.22 + i * 0.07), 1.76 + bob], [s * (0.28 + i * 0.07), 1.76 + bob], [s * (0.3 + i * 0.09), 1.96 + bob + i * 0.03]], boneD);   // the spines on the shoulders
    // arms: bone, raised in blessing as it comes
    const raise = smoothstep(Math.max(near, lunge));
    for (const s of [-1, 1]) {
      const sx = s * 0.3, sy = 1.72 + bob, ex = s * lerp(0.42, 0.5, raise), ey = lerp(1.35, 1.6, raise), hx = s * lerp(0.46, 0.46, raise), hy = lerp(1.0, 2.05, raise);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.045, bone);
      P_ell(ctx, ex, ey, 0.032, 0.032, boneD);
      P_ell(ctx, hx, hy, 0.04, 0.05, bone);
      fingers(ctx, hx, hy, lerp(-Math.PI / 2, Math.PI / 2, raise), lerp(0.2, 0.26, raise), 0.19, 0.014, bone);
    }
    // the hood, the void in it, two points of light, the teeth
    ctx.save(); ctx.translate(0, 1.78 + bob); ctx.rotate(Math.sin(t * 0.7) * 0.03 * (1 - lunge));
    P_poly(ctx, [[-0.3, 0.0], [0.3, 0.0], [0.2, 0.3], [0.04, 0.44], [-0.04, 0.44], [-0.2, 0.3]], cassock);
    P_hatch(ctx, [[-0.3, 0.0], [0.3, 0.0], [0.2, 0.3], [0.04, 0.44], [-0.04, 0.44], [-0.2, 0.3]], 0.03, 1.2, 0.006, cassockD, { from: 0.03, to: 0.5 });
    P_ell(ctx, 0, 0.16, 0.13, 0.18, ink);
    P_rect(ctx, -0.07, 0.02, 0.14, 0.05, bone);
    ctx.strokeStyle = ink; ctx.lineWidth = 0.005; ctx.beginPath(); for (let i = -3; i <= 3; i++) { ctx.moveTo(i * 0.02, 0.02); ctx.lineTo(i * 0.02, 0.07); } ctx.stroke();
    for (const s of [-1, 1]) { P_ell(ctx, s * 0.04, 0.2, 0.012, 0.012, gold); if (P.glow) P.glow(s * 0.04, 0.2, 0.06, [240, 190, 90], 0.5); }
    ctx.restore();
  }
};
