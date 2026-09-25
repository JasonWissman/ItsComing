'use strict';
// ---------- dynamic light: a few point or cone lights that tint and brighten whatever is near them ----------
// light: { x, y, z, r, i, color:[r,g,b], flicker?: 0..1, cone?: { x, y, z (direction), cos (of the half angle) } }
const LIGHT = (() => {
  let lights = [];
  let global = 0;       // lightning: brightens everything for a moment
  let tNow = 0;
  function set(list) { lights = list || []; }
  function update(dt, t) {
    tNow = t;
    for (const l of lights) l.fl = l.flicker ? 1 + l.flicker * 0.35 * (Math.sin(t * 17.3 + (l.seed || 0)) + 0.6 * Math.sin(t * 29.1 + (l.seed || 0) * 2) + 0.4 * Math.sin(t * 7.7)) : 1;
    global = Math.max(0, global - dt * 3.5);
  }
  function flash(k) { global = Math.max(global, k); }
  // light arriving at a world point; null when nothing reaches it
  function at(x, y, z) {
    let lit = global, cr = 230 * global, cg = 235 * global, cb = 255 * global;
    for (let i = 0; i < lights.length; i++) {
      const l = lights[i];
      const dx = x - l.x, dy = y - l.y, dz = z - l.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d >= l.r) continue;
      let k = 1 - d / l.r; k = k * k * l.i * (l.fl || 1);
      if (l.cone) {
        const dot = (dx * l.cone.x + dy * l.cone.y + dz * l.cone.z) / Math.max(1e-6, d);
        const c = (dot - l.cone.cos) / (1 - l.cone.cos);
        if (c <= 0) continue;
        k *= Math.min(1, c * 1.6);
      }
      lit += k; cr += l.color[0] * k; cg += l.color[1] * k; cb += l.color[2] * k;
    }
    if (lit <= 0.002) return null;
    return { lit, color: [cr / lit, cg / lit, cb / lit] };
  }
  // a colour under that light: tinted toward the light, then brightened
  function apply(color, li) {
    if (!li) return color;
    const k = Math.min(1.8, li.lit), m = Math.min(0.55, 0.45 * k), b = 1 + 0.9 * k;
    return [Math.min(255, (color[0] + (li.color[0] - color[0]) * m) * b), Math.min(255, (color[1] + (li.color[1] - color[1]) * m) * b), Math.min(255, (color[2] + (li.color[2] - color[2]) * m) * b)];
  }
  return { set, update, at, apply, flash, get list() { return lights; }, get global() { return global; } };
})();
