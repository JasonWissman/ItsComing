'use strict';
// The tall one: the walker's shape, a head taller than anyone, stooping under the door frame or standing in front of the
// hanging clothes, moving in extreme slow motion. Its own clock runs at timeScale so every jerk is slowed.
// Close to the bed it bows over it, so its face stays in sight. What the night hides of it:
// c.hideTop: the bed between you and it, as [x, y] points (metres from its feet as drawn, x to the right of the view) along
//   the top of what the bed hides; whatever of it is below that line is behind the bed, and the rest of it is whole;
// c.showX: [x0, x1] across it, outside which the wall either side of the opening it is behind hides it; c.showTop: the
//   height above which the wall over the opening hides it.
// c.headroom (metres above its feet, or undefined): the height it must keep under, the lintel of the opening it is coming
//   through: it stoops as far as it must (stoopFor), its shoulders and head bent down and forward, its knees giving.
// The night drives the rest of what it does (js/levels/night12.js):
// c.peer (0..1): it stands behind the wall at the side of the opening and only its head leans out round the edge, toward
//   c.peerSide (+1: the right of the view), its fingers curled round the frame;
// c.flinch (0..1): an arm thrown up across its face, its head turned from the light;
// c.duck (0..1): it is down on its haunches, folded up like a spider, its knees up beside its shoulders, low enough to put
//   its eyes at c.eyeTo (world height above its feet), peering up, its pupils turned up; lower still it is on all fours;
// c.reach (0..1): its arms up to the edge of the bed, its hands at c.gripY (world height; the night draws the hands on the
//   covers over the edge); c.faceAway (over 0.5): its face turned down, only the dark of its head showing.
// Light slows it (c.inLight), in case it is ever in the light and not already down out of it.
CREATURES.tall = {
  name: 'the tall one', h: 2.3, w: 1.1, faceY: 2.0, stepRate: 1.3, catchDist: 1.0, sound: 'tall', timeScale: 0.12,
  death: { delay: 0.6, dur: 1.4, sting: 'stingHum' },
  voice: { kind: 'slow', every: [6, 12] },
  SCALE: 0.77,   // drawn at three metres, stood at two and a bit
  STOOP: { top: 0.3, sink: 0.24, hip: 0.14 },   // all the way stooped: how far its shoulders come down, its head on down past them, its hips
  init(c) { c.inLight = false; },
  speedMult(c, dt, seen) { return c.inLight ? 0.25 : 1; },
  // how far it stoops (0..1) to keep the top of its head under c.headroom: the head (0.54 up from its neck, at its size) on
  // its neck at top - sink, allowing for its breathing, which stretches it up to 1.4% taller
  stoopFor(c, top0, sink0, scale) {
    if (c.headroom === undefined) return 0;
    const S = this.STOOP, k = this.SCALE * 1.015, peak = (top0 - sink0 + 0.54 * scale) * k;
    return clamp((peak - c.headroom) / ((S.top + S.sink) * k), 0, 1);
  },
  draw(ctx, c, P) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 3.2, 0, 1), lunge = c.lunge || 0, free = 1 - lunge, K = this.SCALE, S = this.STOOP;
    const peer = (c.peer || 0) * free, ps = c.peerSide || 1, flinch = (c.flinch || 0) * free, duck = (c.duck || 0) * free, reach = (c.reach || 0) * free;
    const body = P.col([8, 7, 10]), skin = P.col([120, 108, 110]), eye = P.col([232, 228, 214]), black = P.col([2, 2, 3]);
    // it bows over the foot of the bed as it comes: seen from in front, its shoulders hunch up and its head comes forward
    // and down between them (it straightens as it lunges, when the night brings its face to yours)
    const lean = smoothstep((2.5 - c.dist) / 0.7) * (1 - smoothstep(lunge)) * (1 - peer) * (1 - duck);
    const bob = Math.abs(Math.sin(g)) * 0.03, sway = Math.sin(g) * 0.03, hs = 1 + lean * 0.08;
    // under a lintel it stoops
    const top0 = 2.4 + bob - (0.18 + lean * 0.2), sink0 = lean * 0.36 + peer * 0.06;
    const st = this.stoopFor(c, top0, sink0, hs) * free * (1 - duck);
    ctx.save();
    // what is hidden of it: behind the bed, beyond the sides of the opening it is behind and above it (and, down low,
    // nothing of it below the floor)
    const y0 = (duck > 0 ? 0 : -1) - (c.yOff || 0);
    {
      const sx0 = c.showX ? c.showX[0] : -4, sx1 = c.showX ? c.showX[1] : 4, yT = c.showTop === undefined ? 9 : c.showTop;
      ctx.beginPath(); ctx.rect(sx0, y0, Math.max(0, sx1 - sx0), Math.max(0, yT - y0)); ctx.clip();
      const ht = c.hideTop;
      if (ht && ht.length > 1) { ctx.beginPath(); ctx.moveTo(-9, 9); ctx.lineTo(-9, ht[0][1]); for (const [x, y] of ht) ctx.lineTo(x, y); ctx.lineTo(9, ht[ht.length - 1][1]); ctx.lineTo(9, 9); ctx.closePath(); ctx.clip(); }
    }
    ctx.scale(K, K);
    // standing (stooped as far as it must be), and down on its haunches with its eyes at c.eyeTo: the one blended into
    // the other as it goes down
    const top = top0 - st * S.top, sink = sink0 + st * S.sink, hipS = 1.45 + bob - st * S.hip;
    const E = (c.eyeTo === undefined ? 0.6 : c.eyeTo) / K;   // its eyes, down there (drawn units)
    const hyC = E - 0.36 * hs, topC = hyC + 0.1, hipC = Math.max(0.04, topC - 0.5);
    const kneeC = clamp(topC + 0.12, 0.3, 1.15);
    const tp = lerp(top, topC, duck), hip = lerp(hipS, hipC, duck), hunch = lean * 0.08 + st * 0.05 + duck * 0.06, sw = 0.26 + lean * 0.04 + duck * 0.04;
    // legs: hip, knee, foot (down there the knees are up and out beside its shoulders)
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 0.22 * (1 - duck * 0.6);
      const hx = lerp(s * 0.1 + sway, s * 0.12, duck), kx = lerp(s * (0.14 + st * 0.08) + sway * 0.6, s * 0.52, duck), fx = lerp(s * 0.18 + sway * 0.3, s * 0.32, duck);
      const ky = lerp(lerp(0.75, 0.68, st) + lift * 0.7, kneeC + lift * 0.3, duck), fy = lift + 0.03;
      P_limb(ctx, [[hx, hip + 0.05], [kx, ky], [fx, fy]], 0.085, body);
      P_line(ctx, fx - 0.03 * s, fy, fx + s * 0.11, fy, 0.08, body);
    }
    P_poly(ctx, [[-0.17 + sway, hip], [0.17 + sway, hip], [sw + sway * 0.6, tp + hunch], [sway * 0.6, tp], [-sw + sway * 0.6, tp + hunch]], body);
    if (st > 0.02 || duck > 0.02) P_ell(ctx, sway * 0.6, tp + hunch * 0.5, sw, 0.03 + 0.1 * Math.max(st, duck), body);   // its back rounded up behind its head
    // where the head is: over its shoulders, bent down under a lintel or between its knees, or leaned out round the edge
    const hx = sway * 0.6 + peer * ps * 0.44, hy = lerp(top - sink, hyC, duck);
    c.headTop = (hy + 0.54 * hs) * K;   // (the top of its head, as drawn: metres above its feet)
    // arms: down to the knees, rising very slowly as it comes; down there, its hands flat on the floor in front of it
    const raise = smoothstep(Math.max(near * 0.8, lunge)) * (1 - duck);
    const grip = (c.gripY === undefined ? 0.7 : c.gripY) / K;   // the edge of the bed, where its hands take hold
    for (const s of [-1, 1]) {
      const sx = s * (sw - 0.01) + sway * 0.6, sy = tp - 0.08 + hunch;
      let ex = s * lerp(0.28, 0.62, raise), ey = lerp(1.6, 1.9, raise) - lean * 0.1 - st * 0.25;
      let px = s * lerp(0.3, 0.5, raise), py = lerp(0.85, 2.35, raise) - lean * 0.1 * raise - st * 0.2;
      let ang = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), spread = lerp(0.16, 0.32, raise), len = 0.24 + raise * 0.06;
      const mix = (k, e2, f2, p2, q2, a2, sp2, l2) => { ex = lerp(ex, e2, k); ey = lerp(ey, f2, k); px = lerp(px, p2, k); py = lerp(py, q2, k); ang = lerp(ang, a2, k); spread = lerp(spread, sp2, k); len = lerp(len, l2, k); };
      if (duck > 0) mix(duck, s * 0.62, Math.max(0.3, topC * 0.75), s * 0.42, 0.05, -Math.PI / 2 + s * 0.5, 0.2, 0.2);
      // peering: the hand on the opening's side is up on the frame beside its face, its fingers curled round the edge
      if (peer > 0 && s === ps) mix(peer, s * 0.36, hy - 0.3, s * 0.5, hy - 0.06, s > 0 ? -0.15 : Math.PI + 0.15, 0.2, 0.2);
      // the light: the arm on that side up across its face, the back of the hand to it
      if (flinch > 0 && s === (c.flinchSide || 1)) mix(flinch, s * 0.46, tp + 0.05, -s * 0.06, hy + 0.36, s > 0 ? Math.PI * 0.95 : Math.PI * 0.05, 0.22, 0.26);
      // up over the edge of the bed: the hands on it, wide apart, the fingers hooked over onto the covers
      if (reach > 0) mix(reach, s * 0.66, grip - 0.42, s * 0.4, grip, -Math.PI / 2 + s * 0.2, 0.13, 0.17);
      P_limb(ctx, [[sx, sy], [ex, ey], [px, py]], 0.065, body);
      fingers(ctx, px, py, ang, spread, len, 0.02, body);
      if (reach > 0.3) P_ell(ctx, px, py + 0.01, 0.06, 0.045, body);   // the back of the hand, knuckles up
    }
    // the head, bent under the frame, the face lit by the moon and turned to you; leaning out round an edge it tips over
    // that way; flinching it turns from the light; down there it holds still, peering up
    const still = (1 - lunge) * (1 - peer) * (1 - duck);
    const tilt = headTiltJerk(t, 2.7, 0.3) * still + (0.35 * 0.18 + 0.1 * lean) * (1 - peer) * (1 - duck) - peer * ps * 0.5 + flinch * (c.flinchSide || 1) * 0.35;
    if (peer > 0) P_line(ctx, sway * 0.6, tp - 0.04, hx, hy + 0.06, 0.09, body);   // the neck, stretched out round the edge
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(tilt); ctx.scale(hs, hs);
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
