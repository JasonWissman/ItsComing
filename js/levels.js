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
  const local = o.x !== undefined ? [o.x, o.y, o.z] : [Math.sin(o.deg * DEG) * o.dist, o.y, Math.cos(o.deg * DEG) * o.dist];
  const p = L.pt(local[0], local[1], local[2]);
  const t = Object.assign({ w: 1, h: 1, flat: false, accepts: [], requires: [], needed: 1, count: 0, done: false }, o, { x: p[0], y: p[1], z: p[2], local });
  L.targets.push(t);
  return t;
}
// a container: a drawer, box or cabinet that yields items when opened (optionally with a key item)
function mkContainer(L, o) {
  const spot = Array.isArray(o.spot) ? pickSpot(L, o.spot) : o.spot;
  const local = spot.x !== undefined ? [spot.x, spot.y, spot.z] : [Math.sin(spot.deg * DEG) * spot.dist, spot.y, Math.cos(spot.deg * DEG) * spot.dist];
  const t = mkTarget(L, {
    id: o.id, name: o.name, x: local[0], y: local[1], z: local[2], w: o.w || 0.5, h: o.h || 0.4, flat: !!o.flat,
    accepts: o.opens ? [o.opens] : [], open: false, kind: 'container',
    hint() { return t.open ? (o.emptyText || 'Empty now.') : (o.opens ? (o.lockedText || 'Locked.') : (o.closedText || 'Closed.')); },
    onClick() { if (t.open) { G.say(o.emptyText || 'Empty now.', 'Nothing more.'); return true; } if (o.opens) return false; openIt(); return true; },
    use(item) { if (t.open) return false; openIt(); return true; },
  });
  function openIt() {
    t.open = true; t.done = true; AUDIO.sfx(o.sfx || 'creak');
    (o.yields || []).forEach((y, k) => {
      const it = mkItem(L, y.id, y.name, { x: local[0] + (k - (o.yields.length - 1) / 2) * 0.36, y: local[1] + (o.liftY || 0.02), z: local[2] + 0.05 }, Object.assign({ flat: true }, y.opts || {}));
      if (o.onYield) o.onYield(it);
    });
    if (o.onOpen) o.onOpen(t);
  }
  if (spot.setup) spot.setup(L, spot);
  // a visible box that opens
  const w = o.w || 0.5, hh = o.h || 0.4, col = o.color || [70, 54, 40];
  L.props.push(SC.mkSprite(L, local[0], local[1], local[2], w, hh, (ctx, P) => {
    ctx.scale(w, hh);
    const c = P.col(col), d = P.col(scalec(col, 0.65));
    P_rect(ctx, -0.5, 0, 1, 0.75, c); P_rect(ctx, -0.5, 0.7, 1, 0.08, d);
    if (t.open) { P_rect(ctx, -0.5, 0.78, 1, 0.22, P.col(scalec(col, 0.4))); P_rect(ctx, -0.5, 0.74, 1, 0.05, d); }
    else { P_rect(ctx, -0.5, 0.74, 1, 0.26, P.col(scalec(col, 0.85))); P_rect(ctx, -0.08, 0.6, 0.16, 0.12, d); }
  }, { flat: !!o.flat }));
  return t;
}
// two held items become one: select one, click the other in the inventory
function mkRecipe(L, o) { L.recipes.push(o); return o; }
function iconSprite(L, id, x, y, z, w, h, opts) {
  return SC.mkSprite(L, x, y, z, w, h, (ctx, P) => { ctx.scale(w, h); ICONS[id](ctx, P); }, opts);
}

const LEVELS = [];
