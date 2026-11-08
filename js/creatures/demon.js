'use strict';
// The demon: every shape that came before, and the one under them. c.anger (set by the night) is how much you are
// still holding and drives the pace; c.rage (the night eases it toward anger) is how it looks: anything at all in your
// hands and it is plainly enraged, red-eyed, snarling and shaking, its limbs long. Empty-handed it is only tall.
// For the ending the night also sets c.calm (the face turns happy), c.soft (the dark lightens), c.dance and c.fade.
// how high its eyes are, from its feet, as draw() puts them (legs, the bob of its step, torso, neck and face all grow with rage)
function demonEyesY(c) {
  const calm = c.calm || 0, a = clamp(c.rage || 0, 0, 1) * (1 - calm);
  const top = 1.3 + a * 0.35 + 0.85 + Math.abs(Math.sin(c.gait)) * (0.04 + a * 0.06);
  return (top + 0.285 + a * 0.1 + 0.03) * (1 - 0.2 * calm);
}
CREATURES.demon = {
  name: 'the demon', h: 2.6, w: 1.6, faceY: 2.35, stepRate: 0.55, catchDist: 1.2, sound: 'walker',
  // the lunge brings faceY to eye level; enraged, its legs and neck are longer and its face sits higher than that, so the
  // pose lifts it the rest of the way and the last thing you see is its face, not its chest
  death: {
    delay: 0.25, dur: 0.5, sting: 'sting',
    pose(c, k) { c.yOff -= (demonEyesY(c) - CREATURES.demon.faceY) * smoothstep(k); },
  },
  voice: { kind: 'exhale', every: [4, 8] },
  init(c) { c.anger = 0; c.rage = 0; c.calm = 0; c.soft = 0; c.dance = 0; c.fade = 1; },
  speedMult(c, dt, seen) { return 1 + 0.45 * (c.anger || 0); },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 14, 0, 1), lunge = c.lunge || 0;
    const calm = c.calm || 0, soft = c.soft || 0, dance = c.dance || 0;
    const a = clamp(c.rage || 0, 0, 1) * (1 - calm);
    ctx.save();
    if (c.fade < 1) ctx.globalAlpha *= Math.max(0, c.fade);
    // enraged it shakes; happy it shrinks to fit a bedroom; dancing it hops and swings
    const hop = dance * Math.abs(Math.sin(t * 5.2)) * 0.14, swing = dance * Math.sin(t * 5.2) * 0.1, shake = a * Math.sin(t * 47) * 0.014;
    ctx.translate(shake, hop); ctx.rotate(swing); ctx.scale(1 - 0.2 * calm, 1 - 0.2 * calm);
    const body = P.col(mixc([4, 3, 6], [104, 90, 126], soft)), black = P.col([0, 0, 0]);
    const skin = P.col(mixc(mixc([110, 100, 104], [160, 34, 30], a), [240, 214, 186], calm)), eye = P.col([236, 232, 220]);
    const bob = Math.abs(Math.sin(g)) * (0.04 + a * 0.06), sway = Math.sin(g) * (0.03 + a * 0.05);
    const legL = 1.3 + a * 0.35, armL = 0.9 + a * 0.6;
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0) + dance * t * 5.2, lift = Math.max(0, Math.sin(ph)) * (0.2 + a * 0.2) * (dance ? 0.6 : 1);
      P_limb(ctx, [[s * 0.1 + sway, legL + bob], [s * (0.14 + a * 0.12) + sway * 0.6, legL * 0.5 + lift * 0.7], [s * (0.17 + a * 0.2) + sway * 0.3, lift + 0.03]], 0.08 - a * 0.02, body);
    }
    const top = legL + 0.85 + bob;
    P_poly(ctx, [[-0.16 + sway, legL - 0.05 + bob], [0.16 + sway, legL - 0.05 + bob], [0.24 + sway * 0.6, top], [-0.24 + sway * 0.6, top]], body);
    const raise = smoothstep(Math.max(near * (0.5 + a * 0.5), lunge));
    for (const s of [-1, 1]) {
      const sx = s * 0.22 + sway * 0.6, sy = top - 0.05;
      let ex = s * lerp(0.26, 0.55 + a * 0.3, raise), ey = lerp(top - 0.5, top - 0.3, raise);
      let hx = s * lerp(0.28, 0.42 + a * 0.35, raise), hy = lerp(top - armL, top + 0.05, raise);
      if (dance) { const wave = Math.sin(t * 5.2 + s) * 0.12; ex = lerp(ex, s * 0.42, dance); ey = lerp(ey, top + 0.2 + wave, dance); hx = lerp(hx, s * (0.36 + wave), dance); hy = lerp(hy, top + 0.62, dance); } // hands up, waving
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.06 - a * 0.015, body);
      fingers(ctx, hx, hy, dance ? Math.PI / 2 : lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), lerp(0.16, 0.34 + a * 0.1, raise), 0.18 + a * 0.16, 0.018, body);
    }
    // the head: the walker's face; enraged, red eyes under a scowl and the mouth hanging open down the face; calmed, a happy one
    const tilt = headTiltJerk(t, 2.7 - a * 1.5, 0.3 + a * 0.3) * (1 - lunge) * (1 - calm) + dance * Math.sin(t * 2.6) * 0.18;
    ctx.save(); ctx.translate(sway * 0.6, top); ctx.rotate(tilt);
    P_line(ctx, 0, 0, 0, 0.12 + a * 0.1, 0.07, body);
    P_ell(ctx, 0, 0.3 + a * 0.1, 0.115 + a * 0.03, 0.175 + a * 0.06, body);
    const fy = 0.285 + a * 0.1, fc = fy - a * 0.03, fh = 0.13 + a * 0.05;   // enraged, the face is longer: the jaw has dropped
    P_ell(ctx, 0, fc, 0.085 + calm * 0.02, fh, skin);
    if (calm > 0.5) {
      // happy: eyes closed in two arches, round pink cheeks, a wide open smile
      ctx.strokeStyle = black; ctx.lineWidth = 0.012; ctx.lineCap = 'round';
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 0.036, fy + 0.02, 0.02, 0.25, Math.PI - 0.25); ctx.stroke(); }
      P_ell(ctx, -0.06, fy - 0.025, 0.02, 0.014, P.cola([236, 120, 130], 0.7)); P_ell(ctx, 0.06, fy - 0.025, 0.02, 0.014, P.cola([236, 120, 130], 0.7));
      ctx.fillStyle = P.col([120, 34, 44]); ctx.beginPath(); ctx.ellipse(0, fy - 0.045, 0.05, 0.04, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
      P_ell(ctx, 0, fy - 0.07, 0.022, 0.01, P.col([230, 120, 130]));
    } else {
      // the mouth first, so the eyes are never under it. Enraged, it hangs open from just under the eyes to just above the
      // chin, a dark hole inside the red face, and the teeth stand along its edges, top and bottom
      const lip = fy + 0.004, chin = fc - fh + 0.014;
      const mw = Math.min(0.028 + near * 0.012 + a * 0.06, 0.068), mh = Math.min(0.012 + near * 0.03 + lunge * 0.045 + a * 0.1, (lip - chin) / 2);
      const my = lerp(fy - 0.08, lip - mh, a);
      P_ell(ctx, 0, my, mw, mh, black);
      if (a > 0.2) for (let i = -2; i <= 2; i++) {
        const x = i * mw * 0.4, e = mh * Math.sqrt(1 - (x / mw) * (x / mw)) * 0.94, tooth = P.col([224, 212, 200]);
        P_line(ctx, x, my + e, x, my + e - mh * 0.42 * a, 0.01, tooth);
        P_line(ctx, x, my - e, x, my - e + mh * 0.32 * a, 0.01, tooth);
      }
      if (a > 0.02) {
        // enraged: red glowing eyes, narrowed, under brows driven down to the middle
        const er = [255, 50 + (1 - a) * 60, 30];
        // far off in the dark they are all there is of it: two red points that stay a pixel or two across, in a faint haze
        const far = clamp((c.dist - 5) / 12, 0, 1) * a;
        if (far > 0) P_ell(ctx, 0, fy + 0.03, c.dist * 0.009, c.dist * 0.006, rgba(er, 0.16 * far));
        for (const s of [-1, 1]) {
          P_ell(ctx, s * 0.036, fy + 0.03, 0.032, 0.02 + (1 - a) * 0.004, black);   // a dark socket, so the eye glows out of it, not out of its red face
          P_ell(ctx, s * 0.036, fy + 0.03, 0.036 + a * 0.01, 0.022, P.cola(er, 0.25 * a));
          P_line(ctx, s * 0.065, fy + 0.068, s * 0.012, fy + 0.042, 0.014, black);
          P_ell(ctx, s * 0.036, fy + 0.03, Math.max(0.022 + a * 0.006, c.dist * 0.0015 * far), Math.max(0.01 + (1 - a) * 0.005, c.dist * 0.0012 * far), P.raw(er));
        }
      } else { P_ell(ctx, -0.036, fy + 0.03, 0.016, 0.012, eye); P_ell(ctx, 0.036, fy + 0.03, 0.016, 0.012, eye); }
    }
    ctx.restore();
    ctx.restore();
  }
};
