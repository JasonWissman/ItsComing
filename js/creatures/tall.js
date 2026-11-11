'use strict';
// The tall one: the walker's shape, a head taller than anyone, ducking under the door frame or standing among the
// hanging clothes, moving in extreme slow motion. Its own clock runs at timeScale so every jerk is slowed.
// Close to the bed it bows over it, so its face stays in sight, and whatever of it is below the bed is hidden: the night
// sets c.hideBelow, the height (world y) below which the bed is between you and it, and c.showX, [x0, x1] across it (in
// metres from its middle) outside which the wall either side of the opening it is behind hides it.
// The night drives the rest of what it does (js/levels/night12.js):
// c.peer (0..1): it stands behind the wall at the side of the opening and only its head leans out round the edge, toward
//   c.peerSide (+1: the right of the view), its fingers curled round the frame;
// c.flinch (0..1): an arm thrown up across its face, its head turned from the light;
// c.duck (0..1): it is down behind the bed, drawn low enough to put its eyes at c.eyeTo (world height above its feet),
//   peering up, its pupils turned up;
// c.reach (0..1): its arms up to the edge of the bed, its hands at c.gripY (world height; the night draws the hands on the
//   covers over the edge); c.faceAway (over 0.5): its face turned down, only the dark of its head showing.
// Light slows it (c.inLight), in case it is ever in the light and not already down out of it.
CREATURES.tall = {
  name: 'the tall one', h: 2.3, w: 1.1, faceY: 2.0, stepRate: 1.3, catchDist: 1.0, sound: 'tall', timeScale: 0.12,
  death: { delay: 0.6, dur: 1.4, sting: 'stingHum' },
  voice: { kind: 'slow', every: [6, 12] },
  init(c) { c.inLight = false; },
  speedMult(c, dt, seen) { return c.inLight ? 0.25 : 1; },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 3.2, 0, 1), lunge = c.lunge || 0, free = 1 - lunge;
    const peer = (c.peer || 0) * free, ps = c.peerSide || 1, flinch = (c.flinch || 0) * free, duck = (c.duck || 0) * free, reach = (c.reach || 0) * free;
    const body = P.col([8, 7, 10]), skin = P.col([120, 108, 110]), eye = P.col([232, 228, 214]), black = P.col([2, 2, 3]);
    // it bows over the foot of the bed as it comes: seen from in front, its shoulders hunch up and its head comes forward
    // and down between them (it straightens as it lunges, when the night brings its face to yours)
    const lean = smoothstep((2.5 - c.dist) / 0.7) * (1 - smoothstep(lunge)) * (1 - peer);
    const bow = 0.18 + lean * 0.2, hunch = lean * 0.08, sink = lean * 0.36;   // it is too tall for the room
    ctx.save();
    // what is hidden of it: below the bed, and beyond the sides of the opening it is behind
    const sx0 = c.showX ? c.showX[0] : -3, sx1 = c.showX ? c.showX[1] : 3;
    // (and, down low out in the open, nothing of it below the floor)
    if (c.hideBelow !== undefined || c.showX) { const y0 = c.hideBelow !== undefined ? Math.max(c.hideBelow - c.pos().y, duck > 0 ? 0 : -9) - (c.yOff || 0) : -1; ctx.beginPath(); ctx.rect(sx0, y0, Math.max(0, sx1 - sx0), 8); ctx.clip(); }
    ctx.scale(0.77, 0.77);   // drawn at three metres, stood at two and a bit
    const bob = Math.abs(Math.sin(g)) * 0.03, sway = Math.sin(g) * 0.03;
    const top = 2.4 + bob - bow, sw = 0.26 + lean * 0.04;
    // down behind the bed: the whole of it drawn lower, so its eyes are where the night puts them (what is under the bed's
    // edge is hidden)
    const eyeF = top - sink + 0.36 * (1 + lean * 0.08);
    const drop = duck * Math.max(0, eyeF - (c.eyeTo === undefined ? eyeF * 0.77 : c.eyeTo) / 0.77);
    ctx.translate(0, -drop);
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 0.22;
      P_limb(ctx, [[s * 0.1 + sway, 1.5 + bob], [s * 0.14 + sway * 0.6, 0.75 + lift * 0.7], [s * 0.18 + sway * 0.3, lift + 0.03]], 0.085, body);
      P_line(ctx, s * 0.18 + sway * 0.3 - 0.03, lift + 0.03, s * 0.18 + sway * 0.3 + s * 0.11, lift + 0.03, 0.08, body);
    }
    P_poly(ctx, [[-0.17 + sway, 1.45 + bob], [0.17 + sway, 1.45 + bob], [sw + sway * 0.6, top + hunch], [sway * 0.6, top], [-sw + sway * 0.6, top + hunch]], body);
    // where the head is: over its shoulders, or leaned out round the edge of the opening
    const hx = sway * 0.6 + peer * ps * 0.44, hy = top - sink - peer * 0.06;
    // arms: down to the knees, rising very slowly as it comes
    const raise = smoothstep(Math.max(near * 0.8, lunge));
    const grip = (c.gripY === undefined ? 0.7 : c.gripY) / 0.77 + drop;   // the edge of the bed, where its hands take hold
    for (const s of [-1, 1]) {
      const sx = s * (sw - 0.01) + sway * 0.6, sy = top - 0.08 + hunch;
      let ex = s * lerp(0.28, 0.62, raise), ey = lerp(1.6, 1.9, raise) - lean * 0.1;
      let px = s * lerp(0.3, 0.5, raise), py = lerp(0.85, 2.35, raise) - lean * 0.1 * raise;
      let ang = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), spread = lerp(0.16, 0.32, raise), len = 0.24 + raise * 0.06;
      const mix = (k, e2, f2, p2, q2, a2, sp2, l2) => { ex = lerp(ex, e2, k); ey = lerp(ey, f2, k); px = lerp(px, p2, k); py = lerp(py, q2, k); ang = lerp(ang, a2, k); spread = lerp(spread, sp2, k); len = lerp(len, l2, k); };
      // peering: the hand on the opening's side is up on the frame beside its face, its fingers curled round the edge
      if (peer > 0 && s === ps) mix(peer, s * 0.36, hy - 0.3, s * 0.5, hy - 0.06, s > 0 ? -0.15 : Math.PI + 0.15, 0.2, 0.2);
      // the light: the arm on that side up across its face, the back of the hand to it
      if (flinch > 0 && s === (c.flinchSide || 1)) mix(flinch, s * 0.46, top + 0.05, -s * 0.06, hy + 0.36, s > 0 ? Math.PI * 0.95 : Math.PI * 0.05, 0.22, 0.26);
      // up over the edge of the bed: the hands on it, wide apart, the fingers hooked over onto the covers
      if (reach > 0) mix(reach, s * 0.66, grip - 0.42, s * 0.4, grip, -Math.PI / 2 + s * 0.2, 0.13, 0.17);
      P_limb(ctx, [[sx, sy], [ex, ey], [px, py]], 0.065, body);
      fingers(ctx, px, py, ang, spread, len, 0.02, body);
      if (reach > 0.3) P_ell(ctx, px, py + 0.01, 0.06, 0.045, body);   // the back of the hand, knuckles up
    }
    // the head, bent under the frame, the face lit by the moon and turned to you; leaning out round an edge it tips over
    // that way; flinching it turns from the light; down behind the bed it holds still, peering up
    const still = (1 - lunge) * (1 - peer) * (1 - duck);
    const tilt = headTiltJerk(t, 2.7, 0.3) * still + (0.35 * 0.18 + 0.1 * lean) * (1 - peer) - peer * ps * 0.5 + flinch * (c.flinchSide || 1) * 0.35;
    if (peer > 0) P_line(ctx, sway * 0.6, top - 0.04, hx, hy + 0.06, 0.09, body);   // the neck, stretched out round the edge
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(tilt); ctx.scale(1 + lean * 0.08, 1 + lean * 0.08);
    P_line(ctx, 0, 0, 0, 0.14, 0.08, body);
    P_ell(ctx, 0, 0.34, 0.13, 0.2, body);
    if ((c.faceAway || 0) > 0.5) { ctx.restore(); ctx.restore(); return; }   // its face down: the dark of its head
    P_ell(ctx, 0, 0.32, 0.095, 0.15, skin);
    const ew = 0.02 + duck * 0.005, up = duck * 0.007;   // peering up, the eyes wide and the pupils turned up
    P_ell(ctx, -0.04, 0.36, ew, 0.016 + duck * 0.003, eye); P_ell(ctx, 0.04, 0.36, ew, 0.016 + duck * 0.003, eye);
    P_ell(ctx, -0.04, 0.36 + up, 0.007, 0.007, black); P_ell(ctx, 0.04, 0.36 + up, 0.007, 0.007, black);
    const mouth = 0.015 + near * 0.04 + lunge * 0.05;
    P_ell(ctx, 0, 0.23, 0.03 + near * 0.015, mouth, black);
    ctx.restore();
    ctx.restore();
  }
};
