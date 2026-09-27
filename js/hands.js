'use strict';
// ---------- first-person hands: the active item held at the bottom of the view; a two-handed gun pose ----------
const HANDS = (() => {
  let sway = 0, lastYaw = 0, raise = 0, lastActive = null;
  function update(dt) {
    const c = G.cam;
    const vel = wrapPi(c.yaw - lastYaw) / Math.max(dt, 1e-3); lastYaw = c.yaw;
    const target = SAVE.data.settings.reducedMotion ? 0 : clamp(vel * 0.06, -0.35, 0.35);
    sway += (target - sway) * Math.min(1, dt * 6);
    const it = G.inv[G.active] || null;
    if (it !== lastActive) { raise = 1; lastActive = it; }
    raise = Math.max(0, raise - dt * 3.2);
  }
  function arm(ctx, x, y, w, len, angle, skin, sleeve) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = sleeve; ctx.beginPath(); ctx.moveTo(-w * 0.55, 0); ctx.lineTo(w * 0.55, 0); ctx.lineTo(w * 0.5, -len * 0.55); ctx.lineTo(-w * 0.5, -len * 0.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(-w * 0.5, -len * 0.55); ctx.lineTo(w * 0.5, -len * 0.55); ctx.lineTo(w * 0.42, -len); ctx.lineTo(-w * 0.42, -len); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function draw(ctx, W, H) {
    const L = G.L; if (!L || G.state === 'dead' || G.state === 'dying' || G.state === 'title') return;
    const it = G.inv[G.active] || null;
    const use = activeUse(L);
    const s = Math.min(W, H);
    const skin = '#2a2320', sleeve = '#15120f';
    const pitchDrop = clamp(G.cam.pitch / PITCH_DOWN, 0, 1) * s * 0.12;
    const k = L.s.recoil || 0;
    const gunInHand = use && use.tool === 'shotgun' && (!it || it.id === use.tool || it.id === use.ammo || G.inv.length <= 2);
    if (gunInHand) {
      // two hands on the gun, barrels pointing into the scene
      const bx = W * 0.62 + sway * 40 + k * 18, by = H + pitchDrop + raise * 60 - k * 40;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.62 + sway * 0.05 + k * 0.1);
      const len = s * 0.78;
      ctx.fillStyle = '#0d0d10'; ctx.fillRect(-26, -len, 24, len * 0.62); ctx.fillRect(4, -len, 24, len * 0.62);
      ctx.fillStyle = '#23232a'; ctx.fillRect(-24, -len, 8, len * 0.6); ctx.fillRect(6, -len, 8, len * 0.6);
      ctx.fillStyle = '#3a2a1c'; ctx.fillRect(-30, -len * 0.4, 62, len * 0.45);
      ctx.fillStyle = '#26190f'; ctx.fillRect(-34, -len * 0.42, 70, 10);
      ctx.restore();
      arm(ctx, bx - 40 + sway * 30, by + 20, s * 0.11, s * 0.36, -0.9 + sway * 0.05, skin, sleeve);
      arm(ctx, bx + 70 + sway * 20, by + 10, s * 0.12, s * 0.42, 0.25 + sway * 0.05, skin, sleeve);
      return;
    }
    if (!it) return;
    // one hand holding the item at the lower right
    const hx = W * 0.8 + sway * 60, hy = H - s * 0.05 + pitchDrop + raise * s * 0.25;
    arm(ctx, hx, hy + s * 0.12, s * 0.13, s * 0.4, 0.35 + sway * 0.06, skin, sleeve);
    const size = s * 0.18 * (it.w > it.h ? 1 : Math.min(1.4, it.h / it.w));
    ctx.save();
    ctx.translate(hx - s * 0.06, hy - s * 0.02);
    ctx.rotate(-0.25 + sway * 0.08);
    ctx.scale(size, -size);
    it.icon(ctx, { col: cc => rgba(scalec(cc, 0.75)), cola: (cc, a) => rgba(scalec(cc, 0.75), a), raw: cc => rgba(cc), fog: 0, t: G.t, lit: 0 });
    ctx.restore();
    // fingers over the item
    ctx.fillStyle = skin;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(hx - s * 0.04 + i * s * 0.03, hy + s * 0.01 - i * s * 0.006, s * 0.02, s * 0.011, 0.3, 0, TAU); ctx.fill(); }
  }
  return { update, draw };
})();
