'use strict';
// ---------- level content. Everything is defined in a local frame where the creature comes from +z; ----------
// ---------- `facing` rotates the whole level so the compass shows a different world direction.   ----------

// pos is one spot, or a list of candidate spots; one is chosen at random each time the level loads.
// A spot is {x,y,z} or {deg,dist,y} in the local frame, plus optional flat, jitter and setup(L, spot) for props that belong with it.
function spotKey(s) { return s.key || (s.deg !== undefined ? 'p' + s.deg + ':' + s.dist : 'c' + s.x.toFixed(1) + ':' + s.z.toFixed(1)); }
function spotLocal(s) { return s.x !== undefined ? [s.x, s.z] : [Math.sin(s.deg * DEG) * s.dist, Math.cos(s.deg * DEG) * s.dist]; }
function pickSpot(L, spots) {
  const clear = s => { const p = spotLocal(s); return L.placed.every(q => Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.8); };
  let pool = spots.filter(s => !L.usedSpots.has(spotKey(s)) && clear(s));
  if (!pool.length) pool = spots.filter(s => !L.usedSpots.has(spotKey(s)));
  if (!pool.length) pool = spots;
  const s = pool[Math.floor(L.rand() * pool.length)];
  L.usedSpots.add(spotKey(s));
  L.placed.push(spotLocal(s));
  return s;
}
function mkItem(L, id, name, pos, o) {
  const spot = Array.isArray(pos) ? pickSpot(L, pos) : pos;
  const it = Object.assign({ id, name, w: 0.4, h: 0.4, flat: false, uses: 1, tool: false, taken: false, icon: id }, o || {});
  if (spot.flat !== undefined) it.flat = spot.flat;
  let lx, ly, lz;
  if (spot.x !== undefined) { lx = spot.x; ly = spot.y; lz = spot.z; }
  else { lx = Math.sin(spot.deg * DEG) * spot.dist; ly = spot.y; lz = Math.cos(spot.deg * DEG) * spot.dist; }
  const jit = spot.jitter !== undefined ? spot.jitter : (it.flat ? 0.12 : 0);
  if (jit) { lx += (L.rand() - 0.5) * 2 * jit; lz += (L.rand() - 0.5) * 2 * jit; }
  const p = L.pt(lx, ly, lz);
  it.x = p[0]; it.y = p[1]; it.z = p[2];
  if (typeof it.icon === 'string') it.icon = ICONS[it.icon];
  if (spot.setup) spot.setup(L, spot);
  L.items.push(it);
  return it;
}
function mkTarget(L, o) {
  const p = o.x !== undefined ? L.pt(o.x, o.y, o.z) : L.at(o.deg, o.dist, o.y);
  const t = Object.assign({ w: 1, h: 1, flat: false, accepts: [], requires: [], needed: 1, count: 0, done: false }, o, { x: p[0], y: p[1], z: p[2] });
  L.targets.push(t);
  return t;
}
function iconSprite(L, id, x, y, z, w, h, opts) {
  return SC.mkSprite(L, x, y, z, w, h, (ctx, P) => { ctx.scale(w, h); ICONS[id](ctx, P); }, opts);
}

const LEVELS = [];
