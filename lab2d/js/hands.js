'use strict';
// ---------- your hands: two ink-drawn hands at the bottom of the view, holding what you hold ----------
// The hallway reference shows what the game never does: the player's own hands in frame. They breathe, sway as
// you turn, come up when you reach for something, flinch when it hits, and the active item sits in the right one.
const HANDS = (() => {
  let reach = 0, reachT = 0, flinch = 0, yawPrev = 0, swing = 0;
  function trigger() { reachT = 0.5; }
  function hit() { flinch = 0.45; }
  function update(dt, yaw) {
    const target = reachT > 0 ? 1 : 0;
    reach += (target - reach) * (1 - Math.exp(-dt * (target ? 14 : 7)));
    reachT -= dt; flinch = Math.max(0, flinch - dt);
    const dy = wrapPi(yaw - yawPrev); yawPrev = yaw;
    swing += (dy * 40 - swing) * (1 - Math.exp(-dt * 6));
  }
  // one hand, drawn in a frame where the wrist is at the origin, fingers point up, 1 unit = the hand's length
  function hand(ctx, side, col, inkW) {
    const skin = col.skin, ink = col.ink, shade = col.shade;
    const s = side;   // -1 left hand (thumb on the right), +1 right hand (thumb on the left)
    const stroke = (pts, w) => { P_limb(ctx, pts, w + inkW * 2, ink); P_limb(ctx, pts, w, skin); };
    // palm: a rounded block, inked
    const palm = [[-0.3, 0.05], [0.3, 0.05], [0.34, 0.5], [0.22, 0.62], [-0.22, 0.62], [-0.34, 0.5]];
    ctx.lineJoin = 'round';
    P_poly(ctx, palm, ink); ctx.save(); ctx.beginPath(); for (let i = 0; i < palm.length; i++) i ? ctx.lineTo(palm[i][0], palm[i][1]) : ctx.moveTo(palm[i][0], palm[i][1]); ctx.closePath(); ctx.clip();
    ctx.fillStyle = skin; ctx.fillRect(-1, -1, 2, 2);
    P_hatch(ctx, palm, 0.06, 0.6, 0.012, shade, { from: -0.05, to: 0.6 });
    ctx.restore();
    ctx.lineWidth = inkW; ctx.strokeStyle = ink; ctx.beginPath(); for (let i = 0; i < palm.length; i++) i ? ctx.lineTo(palm[i][0], palm[i][1]) : ctx.moveTo(palm[i][0], palm[i][1]); ctx.closePath(); ctx.stroke();
    // fingers: four, the middle longest, curled a little
    for (let i = 0; i < 4; i++) {
      const x = -0.24 + i * 0.16, len = [0.42, 0.5, 0.47, 0.36][i], curl = 0.06;
      stroke([[x, 0.56], [x + curl * 0.3, 0.56 + len * 0.55], [x + curl, 0.56 + len]], 0.11);
      P_line(ctx, x - 0.04, 0.56 + len * 0.55, x + 0.04, 0.56 + len * 0.55, inkW, ink);   // the knuckle crease
    }
    // thumb, out to the side and up
    stroke([[-s * 0.3, 0.2], [-s * 0.46, 0.38], [-s * 0.5, 0.58]], 0.12);
    // wrist and forearm, off the bottom of the frame
    stroke([[0, 0.05], [s * 0.04, -0.6]], 0.42);
  }
  function draw(ctx, W, H, t, o, P, item) {
    const unit = H / 760, L = 230 * unit * o.handScale;   // the hand's length in pixels
    const skinC = o.mono ? [182, 180, 178] : [196, 184, 172], shadeC = o.mono ? [110, 108, 106] : [120, 104, 96];
    const col = { skin: rgba(skinC), ink: rgba([8, 6, 10]), shade: rgba(shadeC) };
    for (const s of [-1, 1]) {
      const breath = Math.sin(t * 1.3 + s) * 5 * unit, lag = swing * s * 0.4 * unit;
      const r = reach, f = flinch;
      const x = W / 2 + s * (W * 0.36 - r * W * 0.17) + lag, y = H + 60 * unit - r * H * 0.28 + breath - f * 30 * unit;
      ctx.save(); ctx.translate(x, y);
      ctx.rotate(s * (0.35 - r * 0.25) + f * s * 0.2 + swing * 0.004);
      ctx.scale(L, -L);
      hand(ctx, s, col, o.ink > 0 ? 0.012 * o.ink : 0.004);
      if (s > 0 && item && ICONS[item]) {   // the thing you hold sits in the right hand
        ctx.save(); ctx.translate(-0.02, 0.5); ctx.rotate(-0.3); ctx.scale(0.55, 0.55);
        ICONS[item](ctx, { col: c => rgba(o.mono ? [0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2], 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2], 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]] : c), cola: (c, a) => rgba(c, a), raw: c => rgba(c), fog: 0, t, lit: 0 });
        ctx.restore();
      }
      ctx.restore();
    }
  }
  return { update, draw, trigger, hit, get reach() { return reach; } };
})();
