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
    onClick() {
      if (t.open) { const left = (t.yielded || []).some(i => !i.taken); G.say(left ? 'Take what is in it.' : (o.emptyText || 'Empty now.'), left ? 'Something is still in it.' : 'Nothing more.'); return true; }
      if (o.opens) return false; openIt(); return true;
    },
    use(item) { if (t.open) return false; openIt(); return true; },
  });
  function openIt() {
    t.open = true; t.done = true; AUDIO.sfx(o.sfx || 'creak'); t.yielded = [];
    if (style === 'box') { box.h = hh * (0.7 + lidH); t.h = box.h; }   // the lid stands up: what you can see and click grows with it
    // what comes out lands a little nearer the eye than the box, so it is drawn in front of it
    // (and, when there are several, side by side across the line of sight)
    const r = Math.max(0.3, Math.hypot(local[0], local[2])), pull = 1 - 0.12 / r, ux = local[2] / r, uz = -local[0] / r;
    (o.yields || []).forEach((y, k) => {
      const off = (k - (o.yields.length - 1) / 2) * 0.24;
      const it = mkItem(L, y.id, y.name, { x: local[0] * pull + ux * off, y: local[1] + (o.liftY || 0.02), z: local[2] * pull + uz * off, jitter: 0 }, Object.assign({ flat: true }, y.opts || {}));
      t.yielded.push(it);
      if (o.onYield) o.onYield(it);
    });
    if (o.onOpen) o.onOpen(t);
  }
  if (spot.setup) spot.setup(L, spot);
  // a visible box that opens, drawn so its state reads at a glance: shut, it is a solid box with its lid down, a latch
  // and a handle; open, the lid stands up behind it, its lighter inside showing, over a dark open mouth. A drawer
  // (style 'drawer') pulls out of its cabinet instead, showing its dark inside above the front.
  const w = o.w || 0.5, hh = o.h || 0.4, col = o.color || [70, 54, 40], style = o.style || 'box', lidH = o.lidH || 0.7;   // lidH: the open lid's height, as a share of the box's
  const box = SC.mkSprite(L, local[0], local[1], local[2], w, hh, (ctx, P) => {
    ctx.scale(w, hh);
    const c = P.col(col), d = P.col(scalec(col, 0.62)), lite = P.col(mixc(col, [230, 220, 200], 0.35)), dark = P.col([10, 9, 9]), metal = P.col([150, 146, 138]);
    if (style === 'drawer') {
      P_rect(ctx, -0.5, 0, 1, 1, d);                                      // the cabinet face
      if (!t.open) { P_rect(ctx, -0.44, 0.12, 0.88, 0.76, c); P_ell(ctx, 0, 0.5, 0.07, 0.07, metal); }
      else {
        P_rect(ctx, -0.44, 0.5, 0.88, 0.42, dark);                         // the hole it came out of
        P_rect(ctx, -0.5, 0.3, 1, 0.3, P.col(scalec(col, 0.45)));          // the drawer's inside, seen from above
        P_rect(ctx, -0.56, -0.08, 1.12, 0.44, c); P_ell(ctx, 0, 0.14, 0.07, 0.07, metal);   // its front, pulled toward you
      }
      return;
    }
    P_rect(ctx, -0.5, 0, 1, 0.66, c);                                     // the body
    P_rect(ctx, -0.5, 0, 1, 0.06, d); P_rect(ctx, -0.5, 0.6, 1, 0.06, d);
    for (const x of [-0.5, 0.42]) P_rect(ctx, x, 0, 0.08, 0.66, metal);   // corner straps
    if (!t.open) {
      P_rect(ctx, -0.52, 0.64, 1.04, 0.22, lite); P_rect(ctx, -0.52, 0.64, 1.04, 0.04, d);   // the lid, down
      P_rect(ctx, -0.18, 0.86, 0.36, 0.05, metal); P_rect(ctx, -0.18, 0.86, 0.05, 0.12, metal); P_rect(ctx, 0.13, 0.86, 0.05, 0.12, metal); P_rect(ctx, -0.18, 0.96, 0.36, 0.05, metal); // the handle
      P_rect(ctx, -0.07, 0.5, 0.14, 0.2, metal); P_rect(ctx, -0.03, 0.52, 0.06, 0.08, dark);  // the latch, shut
    } else {
      const top = 0.7 + lidH;   // the lid, standing up behind on its hinge, its inside toward you: the box's own colour, lighter, in a dark rim
      P_poly(ctx, [[-0.47, 0.68], [0.47, 0.68], [0.43, top], [-0.43, top]], d);
      P_poly(ctx, [[-0.41, 0.72], [0.41, 0.72], [0.38, top - 0.05], [-0.38, top - 0.05]], P.col(mixc(col, [255, 248, 236], 0.28)));
      P_rect(ctx, -0.12, 0.66, 0.06, 0.06, metal); P_rect(ctx, 0.06, 0.66, 0.06, 0.06, metal);   // the hinges
      P_rect(ctx, -0.48, 0.5, 0.96, 0.2, dark);                            // the open mouth, dark inside
      P_rect(ctx, -0.07, 0.4, 0.14, 0.14, metal);                          // the latch, hanging open
    }
  }, { flat: !!o.flat, card: true });   // a card, as items are: it faces you and never goes edge-on
  L.props.push(box);
  return t;
}
// two held items become one: select one, click the other in the inventory
function mkRecipe(L, o) { L.recipes.push(o); return o; }
function iconSprite(L, id, x, y, z, w, h, opts) {
  return SC.mkSprite(L, x, y, z, w, h, (ctx, P) => { ctx.scale(w, h); ICONS[id](ctx, P); }, opts);
}

const LEVELS = [];
