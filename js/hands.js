'use strict';
// ---------- your hands: what you hold, drawn over the view; a thing tried where it will not go (a fumble); the reach ----------
// Whatever is active in the inventory is drawn held in your right hand at the bottom right of the view, lit by the night's
// own light, swaying as you breathe and lagging as you turn. A thing tried where it will not go leaves the hand, goes to
// the spot in the world (drawn by the renderer, in the scene's order, fog and light), fails there and comes back or falls
// to the floor, where it lies to be picked up again. With nothing useful in hand, a click on a target brings the empty hand
// up to it. The night-facing calls are on G (see README, Anatomy of a night):
//   G.fumble(item, target, opts)   the thing goes to the target and fails there (presets bump, slip, bounce, clatter, return)
//   G.reach(target, opts)          the empty hand goes up to it and touches, pushes, knocks, rattles or pulls it
//   G.thrust(target, item)         a short push of the hand toward what was used (useTarget does it on a success)
//   G.landSpot(target, item, opts) where a thing dropped at a target would land (null: nowhere it could be seen and taken)
//   G.heldSpec(item)               how a thing sits in the hand (item.held over the defaults derived from its shape)
// game.js calls HANDS.update(dt) every frame, HANDS.add() before the scene is drawn, HANDS.draw(ctx, W, H) over the view,
// HANDS.reset() when a night starts, and the hooks picked(), dropped() and threw() as things change hands.
const HANDS = (() => {
  // ---------------- how a thing is held ----------------
  // item.held = { grip: 'fist' | 'pinch' | 'flat' | 'hang', hands: 1 | 2, at: [x, y] (where the hand closes on it, in its
  // icon's units: x -0.5..0.5 across, y 0..1 up), axis (the line the fingers close round, as an angle off the icon's
  // upright, clockwise), angle (how it is tilted in the hand, clockwise on screen), size (its longer side, as a share of the
  // view's height), scale (a multiplier on that), x, y (a nudge, in shares of the view's height), off: [x, y] (where the
  // other hand takes a two-handed thing), swing (how freely a hanging thing swings) }. Anything left out comes from its shape.
  const SHAPES = () => [   // the shared icons whose drawing says more than their box does (read lazily: nights add icons)
    [ICONS.hammer, { grip: 'fist', at: [0.1, 0.2], axis: 0.55, angle: -0.42 }],
    [ICONS.lantern, { grip: 'hang', at: [0, 0.97], axis: Math.PI / 2 }],
    [ICONS.keys, { grip: 'pinch', at: [0, 0.62], angle: -0.25, tip: [0.02, 0.07] }],
    [ICONS.carkeys, { tip: [-0.02, 0.09] }],     // (held as any key is; the end of the blade, where these icons draw it)
    [ICONS.housekeys, { tip: [0, 0.22] }],
    [ICONS.padlock, { grip: 'pinch', at: [-0.2, 0.62], angle: 0.15 }],
    [ICONS.bottle, { grip: 'fist', at: [0, 0.3] }],
    [ICONS.bulb, { grip: 'pinch', at: [0, 0.1], angle: -0.12, tip: [0, 0.05] }],
    [ICONS.fuse, { grip: 'pinch', at: [-0.38, 0.45], angle: -0.5, tip: [0.42, 0.48] }],
    [ICONS.fusebody, { grip: 'pinch', at: [-0.38, 0.45], angle: -0.5, tip: [0.42, 0.48] }],
    [ICONS.handle, { grip: 'fist', at: [0.3, 0.85], axis: Math.PI / 2, angle: 0.2 }],
    [ICONS.salt, { grip: 'fist', at: [0, 0.82], axis: Math.PI / 2, angle: 0.08 }],
    [ICONS.matches, { grip: 'pinch', at: [-0.3, 0.3], angle: -0.2 }],
    [ICONS.nails, { grip: 'flat', at: [0.1, 0.06] }],
    [ICONS.chain, { grip: 'hang', at: [-0.42, 0.56], axis: Math.PI / 2 }],
    [ICONS.rope, { grip: 'hang', at: [0, 0.68], axis: Math.PI / 2 }],
    [ICONS.oar, { hands: 2, grip: 'fist', at: [-0.12, 0.25], off: [0.12, 0.62], axis: 0.5, angle: -0.95 }],
    [ICONS.beam, { hands: 2, grip: 'fist', at: [0.28, 0.41], off: [-0.2, 0.42], axis: Math.PI / 2, angle: -0.3 }],
    [ICONS.musicbox, { grip: 'flat', at: [0.14, 0.06] }],
  ];
  let shapes = null;
  const BY_ID = ['hammer', 'lantern', 'salt', 'padlock', 'bulb', 'handle', 'matches', 'nails', 'beam', 'musicbox'];
  function heldSpec(it) {
    if (!shapes) shapes = SHAPES().filter(s => typeof s[0] === 'function');
    const w = it.w || 0.4, h = it.h || 0.4, long = Math.max(w, h);
    let d;
    if (long >= 0.85) d = w >= h ? { hands: 2, grip: 'fist', at: [0.3, 0.5], off: [-0.16, 0.5], axis: Math.PI / 2, angle: -0.3 }   // a long thing: two hands, carried low at your side
      : { hands: 2, grip: 'fist', at: [0, 0.2], off: [0, 0.6], axis: 0, angle: -1.1 };
    else if (/key/i.test(it.id)) d = { grip: 'pinch', at: [0, 0.7], angle: -0.2, tip: [0, 0.06] };   // a key: by its bow, led by its blade
    else if (/chain|rope/i.test(it.id)) d = { grip: 'hang', at: [0, 0.94], axis: Math.PI / 2 };   // a chain or a rope: hanging from the fist
    else if (long <= 0.24) d = { grip: 'pinch', at: [0, 0.12], angle: -0.18 };                 // small: between finger and thumb
    else if (h >= w * 1.4) d = { grip: 'fist', at: [0, 0.3], angle: 0.08 };                    // tall and narrow: a fist round it
    else if (it.flat && w >= h * 1.3) d = { grip: 'flat', at: [0.12, 0.04] };                  // wide and low: on the palm
    else d = { grip: 'fist', at: [0, 0.3], angle: 0.08 };
    // the icon itself, or a night's own wrapping of it under the same name (the last night draws them all on its floor)
    const known = shapes.find(s => s[0] === it.icon) || (BY_ID.includes(it.id) && shapes.find(s => s[0] === ICONS[it.id]));
    return Object.assign({ hands: 1, grip: 'fist', at: [0, 0.3], axis: 0, angle: 0, size: 0, scale: 1, x: 0, y: 0, swing: 1 }, d, known ? known[1] : null, it.held || null);
  }
  // the size it is drawn at, in px of the view's height: modest, and a long thing less than its length would make it
  function sizeOf(spec, it, Hv) {
    const long = Math.max(it.w || 0.4, it.h || 0.4);
    const sz = spec.size || (spec.hands === 2 ? clamp(0.4 * long, 0.34, 0.5) : clamp(0.62 * long, 0.08, 0.4));
    return sz * spec.scale * Hv;
  }

  // ---------------- the view model ----------------
  const H = {}, falling = [];   // falling: things that have left the hand and are dropping to the floor, while the hand tries another
  function reset() {
    Object.assign(H, { cur: null, up: 0, low: 0, dodge: 0, sx: 0, sy: 0, vx: 0, vy: 0, lagX: 0, lagY: 0, swing: 0, swingV: 0, yaw: null, pitch: 0,
      thrust: null, reach: null, fly: null, gone: null, off: { cur: null, up: 0 }, box: null });
    G.fumbling = null; falling.length = 0;
  }
  const toward = (v, t, d) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));
  // what the hand should hold now: the active thing, unless the night says otherwise (L.heldItem(item) may return another
  // item, or null to show nothing), or a night's own drawing of it in your hands (uses[].inHands: the bow) takes its place
  function wanted(L) {
    const fx = G.fumbling, th = H.thrust;
    if (fx && fx.phase === 'wait') return fx.from;                  // a thing to be tried comes into the hand first
    if (fx && fx.drop && fx.it === fx.from && (fx.phase === 'out' || fx.phase === 'contact') && G.state === 'play') return fx.from;   // and the hand stays out, open, until it falls
    if (th && th.release && th.t < th.dur * 0.62 && G.state === 'play') return th.item;   // and a thing used up stays there until it is given up
    if (H.reach && G.state === 'play') return null;                 // the hand put out empty (G.reach): what it held goes down meanwhile
    let it = (G.state === 'play' || (G.state === 'won' && L.keepHeld)) ? G.inv[G.active] || null : null;
    if (it) { const u = activeUse(L); if (u && u.inHands) it = null; }
    if (L.heldItem) { const r = L.heldItem(it); if (r !== undefined) it = r; }
    return it;
  }
  function update(dt) {
    const L = G.L; if (!L) return;
    if (H.yaw === undefined) reset();
    const rm = SAVE.data.settings.reducedMotion, c = G.cam;
    const want = wanted(L), rate = rm ? 8 : 5.5;
    if (H.cur !== want) {
      if (!H.cur || H.up <= 0) { H.cur = want; H.up = 0; H.gone = null; }
      else if (!(H.thrust && H.thrust.item === H.cur && H.thrust.t < H.thrust.dur * (H.thrust.release ? 0.62 : 1))) H.up = Math.max(0, H.up - dt * rate * 1.3);   // the old one goes down out of view first
    } else H.up = want ? Math.min(1, H.up + dt * rate) : Math.max(0, H.up - dt * rate);
    // a thing on its way up into the hand: it waits just short of the hand until the hand is up to take it
    if (H.fly) { const f = H.fly, ready = H.cur === f.it && H.up > 0.95; f.t = ready ? f.t + dt : Math.min(f.t + dt, f.dur * 0.85); if ((ready && f.t >= f.dur) || want !== f.it) H.fly = null; }
    // the off hand: what a night offers there (L.offHand(): an item, or null)
    const offWant = L.offHand && (G.state === 'play' || (G.state === 'won' && L.keepHeld)) ? L.offHand() || null : null;
    if (H.off.cur !== offWant) { if (!H.off.cur || H.off.up <= 0) { H.off.cur = offWant; H.off.up = 0; } else H.off.up = Math.max(0, H.off.up - dt * rate * 1.3); }
    else H.off.up = offWant ? Math.min(1, H.off.up + dt * rate) : Math.max(0, H.off.up - dt * rate);
    // looking down at the floor it is lowered, so it does not hide the ground
    H.low = toward(H.low, c.tPitch > 0.5 ? 1 : 0, dt * 4);
    H.dodge = toward(H.dodge, H.covering ? 1 : 0, dt * 2);
    // the lag: turning, it is left behind a moment and springs back; looking up or down, it bobs the other way
    if (H.yaw === null) { H.yaw = c.yaw; H.pitch = c.pitch; }
    const sdt = Math.max(dt, 1e-3), dyaw = wrapPi(c.yaw - H.yaw) / sdt, dp = (c.pitch - H.pitch) / sdt;
    H.yaw = c.yaw; H.pitch = c.pitch;
    if (rm) { H.sx = H.sy = H.vx = H.vy = H.lagX = H.lagY = H.swing = H.swingV = 0; }
    else {
      H.lagX += (clamp(-dyaw * 0.012, -0.07, 0.07) - H.lagX) * Math.min(1, dt * 14);
      H.lagY += (clamp(-dp * 0.012, -0.06, 0.06) - H.lagY) * Math.min(1, dt * 14);
      const ax = (H.lagX - H.sx) * 110 - H.vx * 12, ay = (H.lagY - H.sy) * 110 - H.vy * 12;
      H.vx += ax * dt; H.vy += ay * dt; H.sx += H.vx * dt; H.sy += H.vy * dt;
      // a hanging thing swings: pushed by the hand's movement, pulled back by its weight, slowly coming to rest
      H.swingV += (-H.swing * 26 - H.swingV * 2.2 - ax * 0.55) * dt; H.swing = clamp(H.swing + H.swingV * dt, -0.7, 0.7);
    }
    if (H.thrust) { const th = H.thrust; if (th.wait !== undefined && th.wait < 0.5 && !(H.cur === th.item && H.up > 0.85)) th.wait += dt; else { th.wait = undefined; th.t += dt; if (th.t >= th.dur) { if (th.release) H.gone = th.item; H.thrust = null; } } }
    if (H.reach) updateReach(H.reach, dt);
    for (const fx of falling.slice()) updateFumble(fx, dt);   // (caught, or won, what is in the air goes on falling)
    if (G.fumbling) updateFumble(G.fumbling, dt);
  }
  // a thing just picked up comes from where it lay up into the hand
  // (from: the thing taken, when it joins a pile already in hand)
  function picked(it, from) {
    const L = G.L, f = from || it, p = f.attach && eyeOff(L) ? null : R.screenPos(f.x, f.y + (f.h || 0.3) * 0.4, f.z);
    if (H.gone === it) H.gone = null;
    if (!p || SAVE.data.settings.reducedMotion) { H.fly = null; return; }
    H.fly = { it, t: 0, dur: 0.32, x: p.x, y: p.y, px: Math.max(12, Math.max(f.w || 0.4, f.h || 0.4) * p.scale) };
  }
  function dropped(it) { if (H.cur === it) H.gone = it; }   // put down: the hand lets go of it there and goes down empty
  function threw(it) { if (H.cur === it) H.gone = it; thrust(null, it, true); }

  // ---------------- where it is drawn ----------------
  // The hand and what it holds keep to the bottom right, clear of the middle of the view (the aim), the hover line, the
  // inventory and the touch buttons: it moves in, up or shrinks to fit, measured from where those really are on the page.
  let keep = null, keepAt = -10, keepSig = '';
  function keepOuts(W, Hv) {
    const sig = G.invSig + '|' + W + 'x' + Hv + '|' + R.viewY + '|' + (document.documentElement.hasAttribute('data-touch-left') ? 'L' : 'R');
    if (keep && sig === keepSig && G.t - keepAt < 1) return keep;
    keepSig = sig; keepAt = G.t;
    const vy = R.viewY, rects = [], rect = (el, pad, below) => {
      if (!el) return;
      const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
      rects.push({ x0: r.left - pad, y0: r.top - vy - pad, x1: r.right + pad, y1: r.bottom - vy + pad + (below || 0) });
    };
    rect(document.getElementById('inventory'), 10, 20);
    const touch = document.getElementById('touch'), touchOn = touch && window.getComputedStyle(touch).display !== 'none';
    if (touchOn) rect(touch, 10);
    const obstacles = rects.slice();   // what may sit in the corner it would be in
    const tipB = touchOn ? 150 : 118, pageH = R.pageH;
    rects.push({ x0: W / 2 - 190, y0: pageH - tipB - 40 - vy, x1: W / 2 + 190, y1: pageH - tipB + 6 - vy });   // the hover line
    const m = Math.min(W, Hv) * 0.2;
    rects.push({ x0: W / 2 - m, y0: Hv / 2 - m, x1: W / 2 + m, y1: Hv / 2 + m });                       // the aim
    keep = { rects, obstacles, touchOn };
    return keep;
  }
  const hits = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  // the box round the hand and what it holds, relative to the grip, at scale 1
  function groupBox(spec, it, Hv) {
    const S = sizeOf(spec, it, Hv), w = it.w || 0.4, h = it.h || 0.4, k = S / Math.max(w, h), pw = w * k, ph = h * k, hu = Hv * 0.1;
    const ca = Math.cos(spec.angle), sa = Math.sin(spec.angle);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [u, v] of [[-0.5, 0], [0.5, 0], [0.5, 1], [-0.5, 1]]) {
      const dx = (u - spec.at[0]) * pw, dy = -(v - spec.at[1]) * ph, x = dx * ca - dy * sa, y = dx * sa + dy * ca;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return { x0: Math.min(x0, -hu * 0.5), y0: Math.min(y0, -hu * 0.55), x1: Math.max(x1, hu * 0.9), y1: Math.max(y1, hu * 0.7), S, pw, ph, hu };
  }
  // the grip's place on the view and the scale, for this thing, clear of everything above
  function layoutFor(spec, it, W, Hv, side) {
    const key = (it ? it.id + ':' + it.w + ':' + it.h : 'empty') + '|' + (side || 1) + '|' + JSON.stringify(spec.at) + spec.angle + spec.size + spec.scale;
    const ko = keepOuts(W, Hv);
    if (!H.layCache || H.layCache.sig !== keepSig) H.layCache = { sig: keepSig, map: new Map() };
    const hit = H.layCache.map.get(key); if (hit) return hit;
    const b = groupBox(spec, it || { w: 0.3, h: 0.3 }, Hv), mirror = side === -1;
    const flip = r => (mirror ? { x0: W - r.x1, y0: r.y0, x1: W - r.x0, y1: r.y1 } : r);
    const rects = ko.rects.map(flip);   // laid out as if on the right, then mirrored for the off hand
    const fits = (gx, gy, s) => {
      const box = { x0: gx + b.x0 * s, y0: gy + b.y0 * s, x1: gx + b.x1 * s, y1: gy + b.y1 * s };
      if (box.x1 > W + b.hu * 0.4 || box.y1 > Hv + b.hu * 0.6 || box.y0 < Hv * 0.3) return false;
      return !rects.some(r => hits(box, r));
    };
    // the bottom right corner first, a little smaller if need be; then in from an obstacle there, then up over it,
    // smaller each round. The right hand stays on the right half of the view (in from the inventory in the middle of the
    // bottom edge would put it on the left)
    let best = null;
    for (const [s, moved] of [[1, 0], [0.9, 0], [1, 1], [0.9, 1], [0.8, 1], [0.7, 1], [0.6, 1], [0.5, 1]]) {
      const gx0 = W - b.x1 * s - Hv * 0.04 + spec.x * Hv, gy0 = Hv - b.y1 * s - Hv * 0.015 + spec.y * Hv;
      const tries = [[gx0, gy0]];
      if (moved) for (const r of ko.obstacles.map(flip)) if (r.x1 > W * 0.6 && r.y1 > Hv * 0.6) { tries.push([r.x0 - b.x1 * s - 6, gy0]); tries.push([gx0, r.y0 - b.y1 * s - 6, true]); }   // in from what is in the corner, or up over it
      for (const [gx, gy, over] of tries) if (gx >= W * 0.5 && fits(gx, gy, s)) { best = { gx, gy, s, over }; break; }
      if (best) break;
    }
    if (!best) best = { gx: W - b.x1 * 0.5 - Hv * 0.04, gy: Hv - b.y1 * 0.5 - Hv * 0.015, s: 0.5 };   // nowhere it fits whole: small, in the corner
    const lay = { gx: mirror ? W - best.gx : best.gx, gy: best.gy, s: best.s, box: b, touch: ko.touchOn, arm: best.over ? 0.3 : ko.touchOn ? 1.25 : 0.85 };   // up over the touch buttons, the arm goes off the side, not down behind them
    H.layCache.map.set(key, lay);
    return lay;
  }

  // ---------------- drawing ----------------
  // colours: lit as the night lights a thing at your chest (its lamps, the moon's ambient, a flash of lightning), a little
  // darker than what lies about (it is close, under you), and drawn a shade toward the night's own fog
  const SKIN = [172, 132, 108], SKIN_D = [112, 80, 64], SKIN_L = [214, 176, 148], NAIL = [206, 172, 152], PALM = [196, 152, 128];
  const SLEEVE = [44, 38, 37], SLEEVE_L = [68, 60, 57], SLEEVE_D = [24, 21, 21], GLOVE = [34, 30, 30], GLOVE_L = [70, 63, 60];
  function lighting(L) {
    const e = L.eye || { x: 0, y: 0, z: 0 }, yaw = G.cam.yaw, fx = Math.sin(yaw), fz = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const px = (e.x || 0) + fx * 0.5 + rx * 0.25, py = L.eyeH + (e.y || 0) - 0.4, pz = (e.z || 0) + fz * 0.5 + rz * 0.25;
    const li = (LIGHT.list.length || LIGHT.global) ? LIGHT.at(px, py, pz) : null;
    const fog = L.pal.fog, dark = clamp(0.55 + (0.3 * fog[0] + 0.59 * fog[1] + 0.11 * fog[2]) / 255 * 0.8, 0.5, 0.85);   // a black night darker than a misty one
    const amb = (L.pal.ambient === undefined ? 1 : L.pal.ambient) * ((L.hands && L.hands.lit) || dark);
    return c => { const x = mixc(scalec(c, amb), fog, 0.08); return li ? LIGHT.apply(x, li) : x; };
  }
  // a capsule (a finger, a thumb) from a to b, w thick, with a light edge along one side
  function capsule(ctx, a, b, w, fill, edge, edgeSide) {
    ctx.lineCap = 'round'; ctx.strokeStyle = fill; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    if (edge) {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w * 0.28 * (edgeSide || 1), ny = dx / l * w * 0.28 * (edgeSide || 1);
      ctx.strokeStyle = edge; ctx.lineWidth = w * 0.26;
      ctx.beginPath(); ctx.moveTo(a[0] + nx + dx * 0.1, a[1] + ny + dy * 0.1); ctx.lineTo(b[0] + nx - dx * 0.12, b[1] + ny - dy * 0.12); ctx.stroke();
    }
  }
  // the forearm in its sleeve, from the wrist off the edge of the view (dir: its way out, as an angle)
  function arm(ctx, C, wx, wy, dir, u) {
    const ex = wx + Math.cos(dir) * u * 16, ey = wy + Math.sin(dir) * u * 16;   // (long enough to leave the view from a hand reaching up to the top of it)
    ctx.lineCap = 'round';
    ctx.strokeStyle = C.sleeveD; ctx.lineWidth = u * 0.86; ctx.beginPath(); ctx.moveTo(wx + Math.cos(dir) * u * 0.3, wy + Math.sin(dir) * u * 0.3); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = C.sleeve; ctx.lineWidth = u * 0.74; ctx.beginPath(); ctx.moveTo(wx + Math.cos(dir) * u * 0.25, wy + Math.sin(dir) * u * 0.25); ctx.lineTo(ex, ey); ctx.stroke();
    const nx = Math.sin(dir), ny = -Math.cos(dir), side = nx < 0 ? -1 : 1;   // the light along its upper edge
    ctx.strokeStyle = C.sleeveL; ctx.lineWidth = u * 0.1;
    ctx.beginPath(); ctx.moveTo(wx + Math.cos(dir) * u * 0.5 - nx * side * u * 0.27, wy + Math.sin(dir) * u * 0.5 - ny * side * u * 0.27); ctx.lineTo(ex - nx * side * u * 0.3, ey - ny * side * u * 0.3); ctx.stroke();
    // the cuff, turned back at the wrist
    ctx.save(); ctx.translate(wx + Math.cos(dir) * u * 0.36, wy + Math.sin(dir) * u * 0.36); ctx.rotate(dir);
    ctx.fillStyle = C.sleeveL; ctx.beginPath(); ctx.ellipse(0, 0, u * 0.13, u * 0.42, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.sleeve; ctx.beginPath(); ctx.ellipse(u * 0.04, 0, u * 0.1, u * 0.38, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // the colours of the hand, lit; a night may dress it (L.hands = { glove: true, skin, sleeve, lit })
  function handColours(L, lit) {
    const o = L.hands || {}, glove = !!o.glove, sk = o.skin || (glove ? GLOVE : SKIN), sl = o.sleeve || SLEEVE;
    const c = (x, k) => rgba(lit(k ? scalec(x, k) : x));
    return {
      skin: c(sk), skinM: c(scalec(sk, 0.9)), skinD: c(glove ? scalec(sk, 0.6) : SKIN_D), skinL: c(glove ? GLOVE_L : SKIN_L), nail: c(glove ? GLOVE_L : NAIL), palm: c(glove ? sk : PALM),
      crease: c(glove ? scalec(sk, 0.45) : scalec(SKIN_D, 0.8)), sleeve: c(sl), sleeveL: c(o.sleeve ? scalec(sl, 1.45) : SLEEVE_L), sleeveD: c(o.sleeve ? scalec(sl, 0.6) : SLEEVE_D),
    };
  }
  // A right hand, in a frame whose origin is where it closes, the thing it closes round running up and down through it,
  // u to the width of the palm. pose: 'fist' (closed round a handle: four curled fingers across the front of it, the back
  // of the hand and the knuckles to the right, the thumb over the top), 'pinch' (the thing held by its edge between the
  // thumb, in front, and the side of the forefinger, behind), 'flat' (palm up, under it), 'open' (reaching: the back of the
  // hand, the fingers out straight up and to the left). part: 'back' (what is behind the thing), 'front' (what is in front).
  function hand(ctx, C, pose, part, u, curl) {
    const k = curl === undefined ? 1 : curl;   // 0: open, 1: closed (a fist opening to let go)
    if (pose === 'fist') {
      if (part === 'back') {
        ctx.fillStyle = C.skinD; ctx.beginPath(); ctx.ellipse(u * 0.42, u * 0.06, u * 0.36, u * 0.44, -0.35, 0, TAU); ctx.fill();   // the back of the hand
        ctx.fillStyle = C.skin; ctx.beginPath(); ctx.ellipse(u * 0.38, u * 0.02, u * 0.31, u * 0.4, -0.35, 0, TAU); ctx.fill();
        for (let i = 0; i < 4; i++) { ctx.fillStyle = C.skinL; ctx.beginPath(); ctx.ellipse(u * (0.27 + i * 0.012), u * (-0.27 + i * 0.18), u * 0.07, u * 0.055, 0.3, 0, TAU); ctx.fill(); }   // the knuckles
        return;
      }
      const len = lerp(0.62, 0.5, k);   // the four fingers, curled across the front of the handle, the lower ones in more shadow
      for (let i = 0; i < 4; i++) {
        const y = u * (-0.27 + i * 0.18), w = u * (i === 3 ? 0.15 : 0.18), x0 = u * 0.28, x1 = u * (0.28 - len + (i === 3 ? 0.08 : 0) + (i === 0 ? 0.02 : 0));
        capsule(ctx, [x0, y], [x1, y + u * 0.02], w * 1.12, C.crease);
        capsule(ctx, [x0, y - u * 0.012], [x1, y + u * 0.008], w, i < 2 ? C.skin : C.skinM, C.skinL, -1);
        ctx.globalAlpha *= 0.55; ctx.fillStyle = C.skinD; ctx.beginPath(); ctx.ellipse(x1 + w * 0.05, y + w * 0.22, w * 0.3, w * 0.16, 0, 0, TAU); ctx.fill(); ctx.globalAlpha /= 0.55;   // where the fingertip curls under
      }
      // the thumb, from the heel of the hand over the top of the forefinger
      capsule(ctx, [u * 0.5, u * -0.18], [u * 0.06, u * -0.41], u * 0.19, C.crease);
      capsule(ctx, [u * 0.5, u * -0.2], [u * 0.05, u * -0.43], u * 0.17, C.skin, C.skinL, -1);
      ctx.fillStyle = C.nail; ctx.beginPath(); ctx.ellipse(u * 0.07, u * -0.45, u * 0.055, u * 0.038, 0.45, 0, TAU); ctx.fill();
      return;
    }
    if (pose === 'pinch') {
      if (part === 'back') {
        ctx.fillStyle = C.skinD; ctx.beginPath(); ctx.ellipse(u * 0.5, u * 0.3, u * 0.36, u * 0.4, -0.6, 0, TAU); ctx.fill();
        ctx.fillStyle = C.skin; ctx.beginPath(); ctx.ellipse(u * 0.47, u * 0.26, u * 0.31, u * 0.36, -0.6, 0, TAU); ctx.fill();
        for (let i = 0; i < 3; i++) {   // the other three fingers, curled loosely under it
          const y = u * (0.24 + i * 0.15), w = u * (0.16 - i * 0.012);
          capsule(ctx, [u * 0.36, y], [u * (0.08 + i * 0.05), y + u * 0.05], w * 1.12, C.crease);
          capsule(ctx, [u * 0.36, y - u * 0.01], [u * (0.08 + i * 0.05), y + u * 0.04], w, C.skin, C.skinL, -1);
        }
        capsule(ctx, [u * 0.38, u * 0.1], [u * 0.0, u * 0.03], u * 0.17, C.crease);   // the forefinger, crooked behind it, its tip at the grip
        capsule(ctx, [u * 0.38, u * 0.08], [u * 0.0, u * 0.01], u * 0.15, C.skin, C.skinL, -1);
        return;
      }
      capsule(ctx, [u * 0.6, u * 0.06], [u * 0.06, u * -0.03], u * 0.18, C.crease);      // the thumb, in front, its tip on the grip
      capsule(ctx, [u * 0.6, u * 0.04], [u * 0.05, u * -0.05], u * 0.16, C.skin, C.skinL, -1);
      ctx.fillStyle = C.nail; ctx.beginPath(); ctx.ellipse(u * 0.07, u * -0.07, u * 0.05, u * 0.034, 0.15, 0, TAU); ctx.fill();
      return;
    }
    if (pose === 'flat') {   // carried on the palm: the heel of the hand under it, the fingertips curled up over its front edge
      if (part === 'back') {
        ctx.fillStyle = C.skinD; ctx.beginPath(); ctx.ellipse(u * 0.05, u * 0.16, u * 0.56, u * 0.2, -0.06, 0, TAU); ctx.fill();   // the palm, flat under it
        ctx.fillStyle = C.skin; ctx.beginPath(); ctx.ellipse(u * 0.08, u * 0.13, u * 0.52, u * 0.16, -0.06, 0, TAU); ctx.fill();
        ctx.fillStyle = C.skinL; ctx.beginPath(); ctx.ellipse(u * 0.3, u * 0.08, u * 0.18, u * 0.05, -0.06, 0, TAU); ctx.fill();
        return;
      }
      for (let i = 0; i < 4; i++) {   // the four fingertips, over the edge it rests on
        const x = u * (-0.5 + i * 0.13), w = u * (0.12 - (i === 3 ? 0.015 : 0));
        capsule(ctx, [x + u * 0.02, u * 0.16], [x - u * 0.01, u * (-0.06 + (i === 0 || i === 3 ? 0.04 : 0)) * k], w * 1.12, C.crease);
        capsule(ctx, [x + u * 0.02, u * 0.15], [x - u * 0.01, u * (-0.07 + (i === 0 || i === 3 ? 0.04 : 0)) * k], w, C.skin, C.skinL, 1);
        ctx.fillStyle = C.nail; ctx.beginPath(); ctx.ellipse(x - u * 0.01, u * (-0.05 + (i === 0 || i === 3 ? 0.04 : 0)) * k, w * 0.3, w * 0.22, 0, 0, TAU); ctx.fill();
      }
      capsule(ctx, [u * 0.55, u * 0.2], [u * 0.42, u * -0.05], u * 0.16, C.skin, C.skinL, -1);   // the thumb up its side
      return;
    }
    // 'open': reaching out, the back of the hand toward you and the fingers straight out, up and to the left
    if (part !== 'front') return;
    ctx.fillStyle = C.skinD; ctx.beginPath(); ctx.ellipse(u * 0.12, u * 0.1, u * 0.34, u * 0.4, -0.75, 0, TAU); ctx.fill();
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.ellipse(u * 0.1, u * 0.07, u * 0.3, u * 0.36, -0.75, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i++) {
      const a = -2.25 + i * 0.16 + (1 - k) * 0, base = [u * (-0.12 + i * 0.1), u * (-0.12 + i * 0.07)], len = u * (0.5 - Math.abs(i - 1) * 0.06) * (1 - 0.45 * (1 - k));
      const tip = [base[0] + Math.cos(a) * len, base[1] + Math.sin(a) * len];
      capsule(ctx, base, tip, u * 0.15, C.crease);
      capsule(ctx, base, tip, u * 0.13, C.skin, C.skinL, 1);
      ctx.fillStyle = C.nail; ctx.beginPath(); ctx.ellipse(tip[0] - Math.cos(a) * u * 0.03, tip[1] - Math.sin(a) * u * 0.03, u * 0.04, u * 0.03, a, 0, TAU); ctx.fill();
    }
    capsule(ctx, [u * 0.0, u * 0.25], [u * -0.36, u * 0.12], u * 0.16, C.skin, C.skinL, 1);   // the thumb, out to the side
    for (let i = 0; i < 4; i++) { ctx.fillStyle = C.skinL; ctx.beginPath(); ctx.ellipse(u * (-0.1 + i * 0.1), u * (-0.1 + i * 0.07), u * 0.05, u * 0.035, -0.7, 0, TAU); ctx.fill(); }
  }
  // the thing itself, drawn with its own icon at w x h px, the grip point at the origin, tilted by angle
  function drawItem(ctx, it, spec, pw, ph, angle, lit, alpha) {
    if (alpha <= 0.01) return;
    const wc = it.decoy ? wornc : c => c;   // a thing that will not work looks it, in the hand too
    ctx.save(); ctx.rotate(angle); ctx.translate(-spec.at[0] * pw, spec.at[1] * ph); ctx.scale(pw, -ph);
    if (alpha < 1) ctx.globalAlpha *= alpha;
    it.icon(ctx, { col: c => rgba(lit(wc(c))), cola: (c, a) => rgba(lit(wc(c)), a), raw: c => rgba(c), fog: 0, t: G.t, lit: 0 });
    ctx.restore();
  }
  // the direction the fingers close round, on the screen, for a thing drawn pw x ph
  function axisOn(spec, pw, ph) { return Math.atan2(Math.sin(spec.axis) * pw, Math.cos(spec.axis) * ph); }
  // one hand and what it holds: g is the grip on the view, s the scale; side -1 is the left hand (drawn mirrored; the thing
  // itself is not)
  function group(ctx, L, it, spec, g, lit, C, o) {
    const side = o.side || 1, b = o.box, pw = b.pw * g.s, ph = b.ph * g.s, u = b.hu * g.s;
    const base = side * (spec.angle + (o.tilt || 0)), hang = spec.grip === 'hang', swing = hang ? o.swing || 0 : 0;
    const angle = base + swing;   // the thing; a hanging thing swings about the grip
    const pose = o.pose || (hang ? 'fist' : spec.grip);
    // the hand's own turn: a fist lies along the line its fingers close round; a hanging thing's handle runs across under
    // the knuckles; a pinch or a palm follows the thing's tilt a little
    const ax = axisOn(spec, pw, ph);
    const gripRot = pose === 'open' ? 0 : hang ? base + side * (ax - Math.PI) + swing * 0.3 : spec.grip === 'fist' ? angle + ax : base * 0.6;
    const rig = (part, at, rot, sd, uu, ps, curl) => {
      ctx.save(); ctx.translate(at[0], at[1]); ctx.rotate(rot); if (sd < 0) ctx.scale(-1, 1);
      hand(ctx, C, ps, part, uu, curl); ctx.restore();
    };
    // the forearm, off the bottom edge: out to the right (to the left for the left hand), from the wrist, which is behind
    // the knuckles of a fist (turned with it), to the right of a hanging thing's grip, under a pinch or a palm
    const armDir = side > 0 ? (g.arm || 0.85) : Math.PI - (g.arm || 0.85);
    let wr;
    if (pose === 'fist' && !hang) { const wx = 0.62 * u, wy = 0.36 * u, c = Math.cos(gripRot), s = Math.sin(gripRot); wr = [side * (wx * c - wy * s * side), wx * s * side + wy * c]; if (wr[1] < u * 0.2) wr = [side * u * 0.55, u * 0.42]; }
    else wr = hang ? [side * u * 0.32, u * 0.02] : pose === 'flat' ? [side * u * 0.55, u * 0.3] : pose === 'open' ? [side * u * 0.3, u * 0.38] : [side * u * 0.62, u * 0.52];
    arm(ctx, C, g.x + wr[0], g.y + wr[1], armDir, u);
    // two hands: the other one further along it, its own arm off the bottom
    let g2 = null;
    if (spec.hands === 2 && spec.off && it) {
      const dx = (spec.off[0] - spec.at[0]) * pw, dy = -(spec.off[1] - spec.at[1]) * ph, ca = Math.cos(angle), sa = Math.sin(angle);
      g2 = [g.x + dx * ca - dy * sa, g.y + dx * sa + dy * ca];
      arm(ctx, C, g2[0] - side * u * 0.1, g2[1] + u * 0.5, side > 0 ? Math.PI / 2 + 0.12 : Math.PI / 2 - 0.12, u * 0.95);
    }
    const at = [g.x, g.y], pose2 = pose === 'open' ? 'open' : 'fist', curl2 = pose === 'open' ? o.curl : 1;   // the other hand lets go too
    rig('back', at, gripRot, side, u, pose, o.curl);
    if (g2) rig('back', g2, gripRot, -side, u * 0.95, pose2, curl2);
    if (it && !o.empty) { ctx.save(); ctx.translate(g.x, g.y); drawItem(ctx, it, spec, pw, ph, angle, lit, o.alpha === undefined ? 1 : o.alpha); ctx.restore(); }
    rig('front', at, gripRot, side, u, pose, o.curl);
    if (g2) rig('front', g2, gripRot, -side, u * 0.95, pose2, curl2);
  }
  // where the grip is this frame: laid out, raised or lowered, swaying, thrust or reaching
  function pose(L, it, spec, W, Hv, side, up) {
    const lay = layoutFor(spec, it, W, Hv, side), b = lay.box, rm = SAVE.data.settings.reducedMotion;
    const below = (Hv - lay.gy) + Math.max(0, -b.y0) * lay.s + b.hu * 1.2;
    let x = lay.gx, y = lay.gy, s = lay.s, tilt = 0;
    y += (1 - smoothstep(up)) * below;
    y += smoothstep(H.low) * Math.min(below, (Math.max(0, -b.y0) * lay.s) * 0.6 + b.hu * 0.3);   // looking down: most of it below the edge
    const dodge = smoothstep(H.dodge) * clamp(Math.min((Math.max(0, -b.y0) * lay.s) * 0.3, Hv - b.hu * lay.s * 0.5 - lay.gy), 0, below);
    y += dodge;   // out of the way of a thing you could take behind it (the hand stays in view)
    if (!rm) {
      x += (H.sx * side) * Hv + Math.sin(G.t * 0.83) * Hv * 0.003;
      y += H.sy * Hv + Math.sin(G.t * 1.65) * Hv * 0.005;
      tilt = Math.sin(G.t * 1.1) * 0.012 + H.sx * 0.6;
    }
    return { lay, g: { x, y, s, arm: lay.arm }, tilt, dodge };
  }
  function screenOf(p) { const q = R.screenPos(p.x, p.y, p.z); return q ? { x: q.x, y: q.y, scale: q.scale } : null; }
  function draw(ctx, W, Hv) {
    const L = G.L; if (!L || H.yaw === undefined) return;
    if (!(H.cur && H.up > 0.001) && !H.reach && !H.fly && !(H.off.cur && H.off.up > 0.001)) { H.box = null; H.covering = false; return; }   // nothing in view
    const lit = lighting(L), C = handColours(L, lit);
    ctx.save();
    let box = null;
    // the main hand
    const it = H.cur, rch = H.reach;
    if (it && H.up > 0.001) {
      const spec = heldSpec(it), p = pose(L, it, spec, W, Hv, 1, H.up);
      const fx = G.fumbling, out = (fx && fx.it === it && fx.phase !== 'wait' && fx.phase !== 'done') || (G.throwing && G.throwing.it === it) || H.gone === it;
      let { x, y, s } = p.g, alpha = 1, curl = 1;
      // a short push toward what it was used on; given up there (release), it goes from the hand into it
      const th = H.thrust && H.thrust.item === it && H.thrust.wait === undefined ? H.thrust : null;
      if (th) {
        const k = Math.sin(Math.PI * clamp(th.t / th.dur, 0, 1)), to = th.at && screenOf(th.at);
        if (to) { const ty = to.y; x = lerp(x, to.x, 0.2 * k); y = lerp(y, ty, 0.2 * k); }
        s *= 1 - 0.14 * k;
        if (th.release) { alpha = 1 - smoothstep((th.t / th.dur - 0.3) / 0.3); curl = 1 - 0.6 * smoothstep((th.t / th.dur - 0.4) / 0.3); }
      }
      // the fumble going out: the hand goes with it a little way, open, and comes back
      if (fx && fx.from === it && fx.handK) { const to = fx.handTo; if (to) { x = lerp(x, to.x, 0.22 * fx.handK); y = lerp(y, to.y, 0.22 * fx.handK); } s *= 1 - 0.12 * fx.handK; if (fx.it === it) curl = 1 - 0.7 * fx.handK; }
      const o = { box: p.lay.box, tilt: p.tilt, swing: H.swing * spec.swing, alpha, curl, empty: out || alpha <= 0.01 || (!!H.fly && H.fly.it === it) };
      if (out) { o.pose = 'open'; o.curl = fx && fx.it === it && !fx.drop ? Math.min(o.curl, 0.55) : o.curl; }   // the hand it left, open (half open, waiting for it to come back)
      group(ctx, L, it, spec, { x, y, s, arm: p.g.arm }, lit, C, o);
      box = { x0: x + p.lay.box.x0 * s, y0: y + p.lay.box.y0 * s, x1: x + p.lay.box.x1 * s, y1: y + p.lay.box.y1 * s, dodge: p.dodge };
    }
    // just picked up: it comes from where it lay up into the hand, growing to its size there, as the hand comes up to take
    // it (whatever was in the hand going down first)
    if (H.fly) {
      const f = H.fly, fi = f.it, spec = heldSpec(fi), p = pose(L, fi, spec, W, Hv, 1, 1), b = p.lay.box, k = easeOut(f.t / f.dur), sc = lerp(f.px / Math.max(b.pw, b.ph), p.g.s, k);
      ctx.save(); ctx.translate(lerp(f.x, p.g.x, k), lerp(f.y, p.g.y, k)); drawItem(ctx, fi, spec, b.pw * sc, b.ph * sc, (spec.angle + p.tilt) * k, lit, 1); ctx.restore();   // (both on the view, as the overlay is drawn)
    }
    // the empty hand reaching for something
    if (rch && !(it && H.up > 0.001)) drawReach(ctx, L, rch, W, Hv, C, lit);
    // the off hand
    if (H.off.cur && H.off.up > 0.001) {
      const o2 = H.off.cur, spec = heldSpec(o2), p = pose(L, o2, spec, W, Hv, -1, H.off.up);
      group(ctx, L, o2, spec, p.g, lit, C, { side: -1, box: p.lay.box, tilt: p.tilt, swing: -H.swing * spec.swing });
    }
    ctx.restore();
    // is it in front of the middle of something you could take, or a small thing you could use (a lock, a switch)? then
    // it is lowered out of the way a little
    H.box = box;
    // (judged where it would be without that, or it would come back up as soon as it had gone down, and shake)
    const rest = box && { x0: box.x0, y0: box.y0 - box.dodge, x1: box.x1, y1: box.y1 - box.dodge };
    H.covering = !!box && H.low < 0.5 && R.hits.some(r => (r.kind === 'item' || (r.kind === 'target' && r.w < Hv * 0.3 && r.h < Hv * 0.3)) && hits(rest, { x0: r.x + r.w * 0.35, y0: r.y - R.viewY + r.h * 0.35, x1: r.x + r.w * 0.65, y1: r.y - R.viewY + r.h * 0.65 }));
  }

  // ---------------- a push toward what it was used on ----------------
  // G.thrust(target, item, release): the hand pushes toward the target and back; release: it lets go of the thing there
  // (it was used up). An item not in the hand yet (picked from the inventory for you) is swapped in first.
  function thrust(t, item, release) {
    if (SAVE.data.settings.reducedMotion && !release) return;
    const it = item || H.cur;
    H.thrust = { t: 0, dur: release ? 0.42 : 0.3, item: it, release: !!release, at: t ? pointOn(t) : null, wait: H.cur === it ? undefined : 0 };
  }

  // ---------------- points in the world ----------------
  function eyeOff(L) { const e = L.eye; return !!(e && (e.x || e.y || e.z)); }
  function eyePos(L) { const e = L.eye || {}; return { x: e.x || 0, y: L.eyeH + (e.y || 0), z: e.z || 0 }; }
  // a point on a target: at = {x, y, z} (the world), or [u, v] across it (u -0.5..0.5 of its width, square to the line from
  // you to it) and up it (v 0..1 of its height; along it, away from you, for a flat one); by default its middle, or the
  // nearest part of it to that in view when its middle is not (a doorway clicked at the edge of the view). It is
  // pulled toward you by standoff (0.05 m), so what goes there is in front of the face it touches.
  function pointOn(t, at, standoff) {
    const L = G.L, e = eyePos(L);
    if (at && at.x !== undefined) return { x: at.x, y: at.y, z: at.z };
    const yawT = Math.atan2(t.x - e.x, t.z - e.z), rx = Math.cos(yawT), rz = -Math.sin(yawT), fx = Math.sin(yawT), fz = Math.cos(yawT);
    const spot = (u, v) => {
      const p = { x: t.x + rx * u * (t.w || 0), y: t.y, z: t.z + rz * u * (t.w || 0) };
      if (t.flat) { p.x += fx * (v - 0.5) * (t.h || 0); p.z += fz * (v - 0.5) * (t.h || 0); p.y += 0.04; } else p.y += v * (t.h || 0);
      return p;
    };
    let uv = Array.isArray(at) ? at : [0, 0.5];
    if (!Array.isArray(at) && !(t.attach && eyeOff(L))) {   // by default its middle; if that is off the view (a doorway seen at the edge
      const seen = (u, v) => {                               // of it) or behind what you hold, the part of it in view nearest its middle
        const p = spot(u, v), q = R.screenPos(p.x, p.y, p.z), b = H.box;
        return !!q && q.x > R.W * 0.06 && q.x < R.W * 0.94 && q.y > R.H * 0.06 && q.y < R.H * 0.94 && !(b && q.x > b.x0 && q.x < b.x1 && q.y > b.y0 && q.y < b.y1);
      };
      if (!seen(0, 0.5)) {
        let best = null;
        for (let u = -0.45; u < 0.46; u += 0.15) for (let v = 0.1; v < 0.95; v += 0.2) if (seen(u, v) && (!best || Math.hypot(u, v - 0.5) < best[2])) best = [u, v, Math.hypot(u, v - 0.5)];
        if (best) uv = best;
      }
    }
    const { x, y, z } = spot(uv[0], uv[1]);
    const so = standoff === undefined ? 0.05 : standoff, dx = e.x - x, dy = e.y - y, dz = e.z - z, dl = Math.hypot(dx, dy, dz) || 1;
    return { x: x + dx / dl * so, y: y + dy / dl * so, z: z + dz / dl * so };   // along the line of sight: it stays over the spot as you see it
  }
  // the world point at a place on the view (view px), depth metres in front of the eye
  function unproject(sx, sy, depth) {
    const L = G.L, e = eyePos(L), c = G.cam, f = R.f;
    const xc = (sx - R.W / 2) / f, yc = -(sy - R.H / 2) / f;
    const cy = Math.cos(c.yaw), syw = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    const dy = yc * cp - sp, cz = yc * sp + cp, wx = xc * cy + cz * syw, wz = -xc * syw + cz * cy;
    return { x: e.x + wx * depth, y: e.y + dy * depth, z: e.z + wz * depth };
  }
  const panTo = p => { const e = eyePos(G.L); return Math.sin(wrapPi(Math.atan2(p.x - e.x, p.z - e.z) - G.cam.yaw)) * 0.85; };

  // ---------------- where a dropped thing lands ----------------
  // On the floor (L.floor) in front of the target, toward you, where it can be seen and taken: inside the floor's outline,
  // in sight from where you stand (nothing between your eye and any part of it), not over anything else lying there, and
  // near enough to see looking down. Failing that, near your feet the way you are facing; failing that, any way round.
  // opts.land: { x, y, z } puts it there instead; opts.side: -1 or 1 prefers that side (knocked aside).
  let occl = null;
  function occluders(L, e, reach) {
    const out = [];
    for (const p of R.statics) {
      if (p.kind !== 'poly' || p.layer < 1 || p.detail || p.invisible || p.stroke || (p.alpha !== undefined && p.alpha < 0.5) || p.pts.length < 3) continue;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (const v of p.pts) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); z0 = Math.min(z0, v[2]); z1 = Math.max(z1, v[2]); }
      if (x1 < e.x - reach || x0 > e.x + reach || z1 < e.z - reach || z0 > e.z + reach) continue;   // out of reach of any place it could land
      if (y0 > e.y) continue;   // wholly above the eye: it cannot come between the eye and the floor
      // its plane, from its first corners
      const a = p.pts[0], b = p.pts[1], c = p.pts[2];
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-9) continue;
      out.push({ p, bb: [x0, x1, y0, y1, z0, z1], n: [nx / nl, ny / nl, nz / nl], d: (nx * a[0] + ny * a[1] + nz * a[2]) / nl });
    }
    return out;
  }
  function blocked(list, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const bx0 = Math.min(a.x, b.x), bx1 = Math.max(a.x, b.x), by0 = Math.min(a.y, b.y), by1 = Math.max(a.y, b.y), bz0 = Math.min(a.z, b.z), bz1 = Math.max(a.z, b.z);
    for (const o of list) {
      const bb = o.bb;
      if (bb[1] < bx0 - 0.01 || bb[0] > bx1 + 0.01 || bb[3] < by0 - 0.01 || bb[2] > by1 + 0.01 || bb[5] < bz0 - 0.01 || bb[4] > bz1 + 0.01) continue;
      const den = o.n[0] * dx + o.n[1] * dy + o.n[2] * dz;
      if (Math.abs(den) < 1e-9) continue;
      const t = (o.d - (o.n[0] * a.x + o.n[1] * a.y + o.n[2] * a.z)) / den;
      if (t <= 0.02 || t >= 0.985) continue;
      const hx = a.x + dx * t, hy = a.y + dy * t, hz = a.z + dz * t;
      // inside the polygon: project on the plane the normal is most square to
      const ax = Math.abs(o.n[0]), ay = Math.abs(o.n[1]), az = Math.abs(o.n[2]);
      const [i, j] = ax >= ay && ax >= az ? [1, 2] : ay >= az ? [0, 2] : [0, 1];
      const P = [hx, hy, hz], pts = o.p.pts;
      let inside = false;
      for (let m = 0, n = pts.length - 1; m < pts.length; n = m++) {
        const A = pts[m], B = pts[n];
        if ((A[j] > P[j]) !== (B[j] > P[j]) && P[i] < (B[i] - A[i]) * (P[j] - A[j]) / (B[j] - A[j]) + A[i]) inside = !inside;
      }
      if (inside) return true;
    }
    return false;
  }
  const fyOf = L => (L.floor ? L.floor.y : 0) || 0;
  // cards facing you overlap where their widths overlap across the view and their lengths along it (as night 13 lays them)
  function overlapping(L, it, x, z, e) {
    const card = (o, ox, oz) => ({ a: Math.atan2(ox - e.x, oz - e.z), d: Math.hypot(ox - e.x, oz - e.z), w: o.w || 0.4, h: (o.flat ? o.h : 0.1) || 0.4 });
    const me = card(it, x, z);
    const over = q => {
      const across = (me.w + q.w) / 2 + 0.08 - Math.abs(wrapPi(me.a - q.a)) * (me.d + q.d) / 2, along = Math.min(me.d + me.h, q.d + q.h) - Math.max(me.d, q.d) + 0.08;
      return across > 0 && along > 0;
    };
    if (L.items.some(o => o !== it && !o.taken && over(card(o, o.x, o.z)))) return true;
    if (falling.concat(G.fumbling || []).some(f => f.drop && f.land && f.it !== it && over(card(f.it, f.land.x, f.land.z)))) return true;   // nor where one still falling will lie
    // nor on a target lying on the floor (a doorway's sill, drawn or not), or at the foot of a small one standing low: it
    // would be clicked instead of it. Its own middle is kept clear of the target's by both their sizes.
    const a = Math.atan2(x - e.x, z - e.z), mx = x + Math.sin(a) * me.h / 2, mz = z + Math.cos(a) * me.h / 2, rIt = Math.max(me.w, me.h) / 2;
    return L.targets.some(t => (t.flat || (t.y < fyOf(L) + 0.6 && (t.w || 1) < 1.5)) && Math.hypot(t.x - mx, t.z - mz) < rIt + Math.max(t.w || 0.5, t.flat ? t.h || 0.5 : 0.3) / 2 + 0.12);
  }
  function landSpot(t, it, opts) {
    opts = opts || {};
    const L = G.L, e = eyePos(L), fy = opts.floorY !== undefined ? opts.floorY : L.floor.y, hEye = e.y - fy;
    if (opts.land && opts.land.x !== undefined) return { x: opts.land.x, y: opts.land.y === undefined ? fy : opts.land.y, z: opts.land.z };
    if (hEye <= 0.1) return null;
    // near enough to see looking down, far enough to be in view then (the view looks 14 to 76 degrees below level)
    const dMin = Math.max(0.3, hEye * 0.4), dMax = Math.min(4.5, hEye * 2.8);
    const at = t ? pointOn(t, opts.at, 0) : null;
    const yawT = at ? Math.atan2(at.x - e.x, at.z - e.z) : G.cam.yaw, dT = at ? Math.hypot(at.x - e.x, at.z - e.z) : 1.3;
    const w = it.w || 0.4, depth = it.flat ? (it.h || 0.4) : 0.15;
    const ok = (yaw, d) => {
      const x = e.x + Math.sin(yaw) * d, z = e.z + Math.cos(yaw) * d;
      const rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = Math.sin(yaw), fz = Math.cos(yaw);
      if (L.floor.poly) {
        for (const [u, v] of [[0, 0], [-w / 2, 0], [w / 2, 0], [0, depth]]) {
          const q = rotY(x + rx * u + fx * v, z + rz * u + fz * v, -L.facing);
          if (!pointInPoly(q[0], q[1], L.floor.poly)) return null;
        }
      }
      if (overlapping(L, it, x, z, e)) return null;
      // in sight: the middle of it, both ends and its far edge, a little above the floor
      for (const [u, v, hh] of [[0, depth * 0.4, 0.06], [-w * 0.42, 0.02, 0.04], [w * 0.42, 0.02, 0.04], [0, depth * 0.9, 0.04]]) {
        if (blocked(occl, e, { x: x + rx * u + fx * v, y: fy + hh, z: z + rz * u + fz * v })) return null;
      }
      return { x, y: fy, z, yaw, d };
    };
    // the places it could go, nearest first to the floor just in front of the target (toward you), within 70 degrees of
    // the way you face (a thing does not land behind you); a thing knocked aside (opts.side) prefers that side of it
    const side = opts.side || 0, ideal = { d: clamp(dT - 0.3, dMin, dMax), yaw: yawT };
    const ix = Math.sin(ideal.yaw) * ideal.d + Math.cos(yawT) * side * 0.45, iz = Math.cos(ideal.yaw) * ideal.d - Math.sin(yawT) * side * 0.45;   // knocked aside: off to that side
    const cands = [];
    for (let k = -10; k <= 10; k++) {
      const yaw = yawT + k * 7 * DEG;
      if (Math.abs(wrapPi(yaw - G.cam.yaw)) > 70 * DEG) continue;
      for (let d = dMin; d <= dMax + 1e-6; d += 0.1) {
        const x = Math.sin(yaw) * d, z = Math.cos(yaw) * d, lat = (x - ix) * Math.cos(yawT) - (z - iz) * Math.sin(yawT);
        cands.push({ yaw, d, s: Math.hypot(x - ix, z - iz) - (side ? side * lat * 0.6 : 0) + (d > ideal.d + 0.05 ? (d - ideal.d) * 0.6 : 0) });   // beyond the target is worse than short of it
      }
    }
    cands.sort((a, b) => a.s - b.s);
    occl = occluders(L, e, dMax + 0.6);
    let r = null;
    for (const c of cands) { r = ok(c.yaw, c.d); if (r) break; }
    occl = null;
    return r;
  }

  // ---------------- the fumble ----------------
  // G.fumble(item, target, opts): the thing leaves your hand, goes to a spot on the target (opts.at, see pointOn) and fails
  // there. opts (or a preset's name):
  //   preset   'bump'    pokes the spot, jiggles and drops (keys at a keyhole)
  //            'slip'    is put in place, hangs a beat, then tips off one end and drops (a plank on a doorway without nails)
  //            'bounce'  hits and rebounds toward you, and drops
  //            'clatter' hits and is knocked aside, spinning, and drops
  //            'return'  bumps and comes back to the hand (the default: nothing is lost)
  //   drop     false keeps it (it comes back to the hand); true drops it (each preset but 'return' drops by default)
  //   at       where on the target ([u, v] across and up it, or a world point); standoff: how far in front of it, along
  //            the line of sight (0.05 m); sortDist: its place in the drawing order while it is there
  //   tip      [x, y] in its icon's units: the point it leads with (a key's blade), the rest of it trailing back toward
  //            the hand (item.held.tip by default)
  //   land     { x, y, z }: where it lands; side: -1 / 1, the side it prefers to land on; floorY: the floor's height
  //   angle    how it is turned at the target (radians, clockwise on screen; 0 is as its icon is drawn); flat, restAngle:
  //            how it lies once it has landed
  //   pivot    'left' / 'right': the end a slipping thing hangs from as the other end drops
  //   speed    a multiplier on its pace; hold: how long a slipping thing hangs (s); scale: its size at the target, as a
  //            share of its own (by default no bigger than the target: keys at a lock), growing back as it falls
  //   sfx      { hit, land }: the sounds as it touches the target and the floor (by default by what it is made of:
  //            item.material 'metal' | 'wood' | 'glass' | 'soft', or a guess from its name)
  //   onHit(fx), onLand(item, fx), onDone(fx): called as it touches the target, lands (an ordinary item again), and ends
  // The night stays playable: it never locks input, a second fumble while one is on its way from the hand is refused (it
  // returns null; one already falling to the floor goes on by itself), and the thing is out of the inventory from the start
  // if it is to drop (it lies on the floor again once it lands). A dropped thing that has nowhere it could be seen and
  // taken comes back to the hand instead. Returns the fumble (G.fumbling while it is in play), or null.
  const PRESETS = { bump: { drop: true }, slip: { drop: true }, bounce: { drop: true }, clatter: { drop: true }, return: { drop: false } };
  const MATERIAL = { metal: ['tink', 'clatter'], wood: ['woodKnock', 'clatter'], glass: ['tink', 'clatter'], soft: ['pat', 'flop'] };
  function materialOf(it) {
    if (it.material && MATERIAL[it.material]) return it.material;
    const n = (it.id + ' ' + (it.name || '')).toLowerCase();
    if (/rag|cloth|sack|bag|salt|sugar|rope|note|journal|book|paper|glove|blanket/.test(n)) return 'soft';
    if (/bottle|bulb|glass|jar|cocktail/.test(n)) return 'glass';
    if (/plank|beam|board|oar|bow|arrow|stick|log|crate|box|match|bar\b|door/.test(n)) return 'wood';
    return 'metal';
  }
  function fumble(it, t, opts) {
    const L = G.L;
    if (!it || !t || !L) return null;
    if (G.fumbling) {   // one at a time from the hand: a second click while one is on its way does nothing more; one
      if (G.fumbling.phase !== 'fall' && G.fumbling.phase !== 'bounce') return null;   // already falling goes on by itself
      falling.push(G.fumbling); G.fumbling = null;
    }
    opts = Object.assign({}, typeof t.fumble === 'object' ? t.fumble : typeof t.fumble === 'string' ? { preset: t.fumble } : null, typeof opts === 'string' ? { preset: opts } : opts || {});
    let preset = PRESETS[opts.preset] ? opts.preset : 'return';
    let drop = opts.drop !== undefined ? !!opts.drop : PRESETS[preset].drop;
    const inInv = G.inv.includes(it), side = opts.side || (Math.random() < 0.5 ? -1 : 1);
    let item = it;
    const at = pointOn(t, opts.at, opts.standoff);
    let land = null;
    if (drop) {
      if (it.stack && it.uses > 1) {   // one of a pile goes; the rest stay in the hand
        const orig = it.icon, one = Object.assign({}, it, { uses: 1 });
        one.icon = (ctx, P, ...a) => { const u = it.uses; it.uses = one.uses; try { return orig(ctx, P, ...a); } finally { it.uses = u; } };
        item = one;
      }
      land = landSpot(t, item, Object.assign({}, opts, { side: preset === 'clatter' ? side : opts.side }));
      if (!land) { drop = false; preset = 'return'; item = it; }   // nowhere it could be seen and taken: it comes back instead
      else if (item !== it) { it.uses--; G.invSig = ''; L.items.push(item); item.taken = true; }
      else if (inInv) G.removeFromInv(it);
    }
    if (!drop && !inInv) return null;   // not in the hand and nowhere to land: nothing to show
    const mat = materialOf(item), sfx = Object.assign({ hit: MATERIAL[mat][0], land: MATERIAL[mat][1] }, opts.sfx || {});
    // at the target it is drawn no bigger than the target itself (a set of keys at an ignition no bigger than the lock),
    // and back to its own size by the time it lies on the floor
    const big = Math.max(item.w || 0.4, item.h || 0.4), tBig = Math.max(t.w || 0, t.h || 0);
    const size = opts.scale !== undefined ? opts.scale : tBig ? clamp(tBig / big, 0.4, 1) : 1;
    const fx = { it: item, from: it, target: t, preset, drop, at, land, opts, sfx, phase: 'wait', T: 0, pt: 0, handK: 0,
      speed: opts.speed || 1, rot: 0, scale: 1, size, top: 1, pos: null, hitDone: 0, side, tip: opts.tip || heldSpec(it).tip || null, baseRot: opts.angle || 0 };
    G.fumbling = fx;
    return fx;
  }
  // the item's middle on the view in the hand now, and how big it is drawn there (px per metre)
  function handPoint(it) {
    const L = G.L, spec = heldSpec(it), p = pose(L, it, spec, R.W, R.H, 1, 1), b = p.lay.box, s = p.g.s;
    const pw = b.pw * s, ph = b.ph * s, ang = spec.angle + p.tilt;
    const dx = (0 - spec.at[0]) * pw, dy = -(0.5 - spec.at[1]) * ph;
    return { x: p.g.x + dx * Math.cos(ang) - dy * Math.sin(ang), y: p.g.y + dx * Math.sin(ang) + dy * Math.cos(ang), ppm: Math.max(pw, ph) / Math.max(it.w || 0.4, it.h || 0.4), ang };
  }
  // where in the world the thing in the hand is, as seen: its middle, at the depth at which its real size looks the size it
  // is drawn in the hand (no nearer than the target allows: it is drawn smaller there, growing as it goes)
  function handWorld(it, maxDepth) {
    const hp = handPoint(it), ideal = R.f / Math.max(1, hp.ppm), depth = Math.min(ideal, maxDepth);
    return { p: unproject(hp.x, hp.y, depth), scale: depth / ideal, ang: hp.ang };
  }
  function playAt(name, p) { if (name) AUDIO.sfx(name, panTo(p)); }
  // a thing on its way back to the hand that the night has taken, or that was used after all: it is in hand now
  function settle() { const fx = G.fumbling; if (fx && !fx.drop) finish(fx); }
  function updateFumble(fx, dt) {
    if (!fx.drop && !G.inv.includes(fx.from)) { finish(fx); return; }   // taken from you meanwhile (used up by the night)
    const L = G.L, e = eyePos(L), dt2 = dt * fx.speed;
    fx.T += dt2; fx.pt += dt2;
    const dAt = Math.hypot(fx.at.x - e.x, fx.at.y - e.y, fx.at.z - e.z);
    const yawA = Math.atan2(fx.at.x - e.x, fx.at.z - e.z), n = { x: -Math.sin(yawA), z: -Math.cos(yawA) }, r = { x: Math.cos(yawA), z: -Math.sin(yawA) };
    if (!fx.n3) { const dx = e.x - fx.at.x, dy = e.y - fx.at.y, dz = e.z - fx.at.z, dl = Math.hypot(dx, dy, dz) || 1; fx.n3 = { x: dx / dl, y: dy / dl, z: dz / dl }; }   // toward the eye along the line of sight
    const next = ph => { fx.phase = ph; fx.pt = 0; };
    if (fx.phase === 'wait') {   // it comes into the hand first if it was not there
      if ((H.cur === fx.it || H.cur === fx.from) && H.up > 0.92) next('out'); else if (fx.pt > 0.45 || SAVE.data.settings.reducedMotion) next('out');
      if (fx.phase === 'out') {
        const hw = handWorld(fx.from, dAt * 0.75); fx.start = hw.p; fx.scale0 = hw.scale; fx.rot0 = hw.ang; fx.handTo = screenOf(fx.at); if (fx.drop && fx.it === fx.from) H.gone = fx.it;
        fx.baseRot = fx.opts.angle !== undefined ? fx.opts.angle : 0;
        if (fx.tip && fx.opts.angle === undefined && fx.handTo) {   // led by its point: the rest of it toward the hand it came from
          const hp = handPoint(fx.from), it = fx.it, vx = (0 - fx.tip[0]) * (it.w || 0.4), vy = -(0.5 - fx.tip[1]) * (it.h || 0.4);
          fx.baseRot = wrapPi(Math.atan2(hp.y - fx.handTo.y, hp.x - fx.handTo.x) - Math.atan2(vy, vx));
          fx.rot0 = fx.baseRot + wrapPi(fx.rot0 - fx.baseRot);   // the short way round to it
        }
        fx.pos = fx.start; fx.rot = fx.rot0; fx.scale = fx.scale0; fx.top = 1;   // drawn where the hand let go of it from this frame on
      }
      return;
    }
    const OUT = clamp(0.24 + dAt * 0.06, 0.28, 0.5);
    if (fx.phase === 'out') {
      const k = clamp(fx.pt / OUT, 0, 1), ek = smoothstep(k);
      fx.handK = Math.sin(Math.PI * clamp(fx.pt / (OUT * 1.6), 0, 1)); fx.handTo = screenOf(fx.at) || fx.handTo;
      const target = contactPose(fx, 0, n, r);
      fx.pos = { x: lerp(fx.start.x, target.x, ek), y: lerp(fx.start.y, target.y, ek) + Math.sin(Math.PI * k) * 0.05, z: lerp(fx.start.z, target.z, ek) };
      fx.rot = lerp(fx.rot0, target.rot, ek); fx.scale = lerp(fx.scale0, fx.size, ek); fx.top = 1 - ek;
      if (k >= 1) { next('contact'); fx.scale = fx.size; }
      return;
    }
    fx.handK = Math.max(0, fx.handK - dt * 4);
    if (fx.phase === 'contact') {
      const c = contactPose(fx, fx.pt, n, r);
      fx.pos = { x: c.x, y: c.y, z: c.z }; fx.rot = c.rot; fx.top = 0;
      while (fx.hitDone < c.hits.length && fx.pt >= c.hits[fx.hitDone]) { if (fx.hitDone === 0 && fx.opts.onHit) fx.opts.onHit(fx); if (fx.hitDone === 0 || fx.preset === 'bump') playAt(fx.sfx.hit, fx.pos); fx.hitDone++; }
      if (fx.pt >= c.dur) {
        if (fx.drop) { fx.rel = { x: c.x, y: c.y, z: c.z, rot: c.rot, v: c.v || { x: n.x * 0.3, y: 0, z: n.z * 0.3 } }; next('fall'); }
        else { fx.rel = { x: c.x, y: c.y, z: c.z, rot: c.rot }; next('home'); }
      }
      return;
    }
    if (fx.phase === 'home') {   // back to the hand
      const BACK = 0.3, k = clamp(fx.pt / BACK, 0, 1), ek = smoothstep(k);
      const hw = handWorld(fx.from, Math.max(0.3, dAt * 0.75));
      fx.pos = { x: lerp(fx.rel.x, hw.p.x, ek), y: lerp(fx.rel.y, hw.p.y, ek) + Math.sin(Math.PI * k) * 0.04, z: lerp(fx.rel.z, hw.p.z, ek) };
      fx.rot = lerp(fx.rel.rot, hw.ang, ek); fx.scale = lerp(fx.size, hw.scale, ek); fx.top = ek;
      if (k >= 1) finish(fx);
      return;
    }
    if (fx.phase === 'fall') {
      const P = fx.land, R0 = fx.rel, h = Math.max(0.05, R0.y - P.y), vy0 = R0.v.y || 0;
      const T = clamp(Math.sqrt(2 * h / 9.8) * 1.05 + 0.05, 0.22, 0.7);   // near enough a real fall: a metre takes under half a second
      const k = clamp(fx.pt / T, 0, 1), tt = k * T, g = 2 * (R0.y + vy0 * T - P.y) / (T * T);
      const P1 = { x: P.x + n.x * -0.05, z: P.z + n.z * -0.05 };   // it first strikes a little beyond where it comes to rest
      fx.pos = { x: lerp(R0.x, P1.x, k), y: R0.y + vy0 * tt - 0.5 * g * tt * tt, z: lerp(R0.z, P1.z, k) };
      if (fx.preset === 'slip') {   // still turning as it goes, it comes down on its end, then slaps over flat
        const up = R0.rot + Math.sign(R0.rot || 1) * 0.35;
        fx.rot = k < 0.7 ? lerp(R0.rot, up, smoothstep(k / 0.7)) : lerp(up, restRot(fx), easeIn((k - 0.7) / 0.3));
      } else {
        const spin = fx.preset === 'clatter' ? fx.side * TAU : fx.side * 0.6;
        fx.rot = lerp(R0.rot, restRot(fx) + spin, easeIn(k) * 0.4 + k * 0.6);
      }
      fx.top = 0; fx.scale = lerp(fx.size, 1, k);   // its own size again by the time it lies on the floor
      if (k >= 1) { playAt(fx.sfx.land, P); next('bounce'); fx.hop = clamp(h * 0.1, 0.025, 0.1); }
      return;
    }
    if (fx.phase === 'bounce') {
      const P = fx.land, Tb = 2 * Math.sqrt(2 * fx.hop / 9.8) + 0.05, k = clamp(fx.pt / Tb, 0, 1);
      fx.pos = { x: lerp(P.x + n.x * -0.05, P.x, k), y: P.y + 4 * fx.hop * k * (1 - k), z: lerp(P.z + n.z * -0.05, P.z, k) };
      fx.rot = restRot(fx) + (1 - k) * 0.12 * fx.side;
      if (k >= 1) { if (fx.preset === 'clatter' || fx.preset === 'bounce') playAt(fx.sfx.land, P); land(fx); }
    }
  }
  // how a dropped thing lies once it is still: as its card lies (the angle it is drawn at, flat on the floor)
  function restRot(fx) { return fx.opts.restAngle || 0; }   // (opts.restAngle: turned on the floor; 0 lies as its icon is drawn)
  // where it is (its middle), its turn, and when it sounds, while it is at the target (time tau since it got there). A thing
  // with a leading point (opts.tip, or its held.tip: a key's blade, a fuse's cap) touches the spot with that point, turned
  // so the rest of it trails back toward your hand
  function contactPose(fx, tau, n, r) {
    const c = contactAt(fx, tau, n, r), tip = fx.tip;
    if (!tip || fx.preset === 'slip') return c;
    const it = fx.it, w = (it.w || 0.4) * fx.size, h = (it.h || 0.4) * fx.size, vx = (0 - tip[0]) * w, vy = -(0.5 - tip[1]) * h, cs = Math.cos(c.rot), sn = Math.sin(c.rot);
    const sx = vx * cs - vy * sn, sy = vx * sn + vy * cs;   // from the point to the middle, on the view (y down), turned with it
    return Object.assign(c, { x: c.x + r.x * sx, y: c.y - sy, z: c.z + r.z * sx });
  }
  function contactAt(fx, tau, n, r) {
    const a = fx.at, base = fx.baseRot || 0, sd = fx.side, o = 0.05;
    const m = fx.n3 || { x: n.x, y: 0, z: n.z };   // in and out along the line of sight, so a poke stays on the spot as you see it
    const P = (dn, dx, dy, rot) => ({ x: a.x + m.x * dn + r.x * dx, y: a.y + m.y * dn + dy, z: a.z + m.z * dn + r.z * dx, rot });
    switch (fx.preset) {
      case 'bump': {   // three pokes at the spot, each less sure, a jiggle, and it slips out of the fingers
        const pokes = [0, 0.17, 0.33], amp = [1, 0.7, 0.45];
        let poke = 0; pokes.forEach((p0, i) => { const q = (tau - p0) / 0.13; if (q > 0 && q < 1) poke = Math.max(poke, Math.sin(Math.PI * q) * amp[i]); });
        const jig = 0.14 * Math.sin(tau * 38) * Math.max(0, 1 - tau / 0.5);
        const p = P(o * (1 - poke), Math.sin(tau * 31) * 0.006, -0.008 * poke, base + jig);
        return Object.assign(p, { dur: 0.5, hits: pokes.map(x => x + 0.065), v: { x: n.x * 0.35, y: 0.25, z: n.z * 0.35 } });
      }
      case 'slip': {   // put in place, hangs, then one end goes and it tips off
        const settle = 0.14, hold = fx.opts.hold === undefined ? 0.35 : fx.opts.hold, tip = 0.34, w = (fx.it.w || 0.4) * fx.size;
        const piv = fx.opts.pivot === 'left' ? -1 : fx.opts.pivot === 'right' ? 1 : sd;   // the end it hangs from
        if (tau < settle + hold) {
          const s = clamp(tau / settle, 0, 1), wob = tau > settle ? Math.sin((tau - settle) * 26) * 0.012 * Math.exp(-(tau - settle) * 6) : 0;
          const sag = tau > settle + hold * 0.6 ? smoothstep((tau - settle - hold * 0.6) / (hold * 0.4)) * 0.025 : 0;
          return Object.assign(P(o * (1 - s) + 0.01, 0, -sag, base + wob + sag * piv * 1.4), { dur: settle + hold + tip, hits: [settle * 0.8] });
        }
        const k = easeIn(clamp((tau - settle - hold) / tip, 0, 1)), ang = 0.035 + k * 1.05, px = piv * w * 0.45;
        // turning about the end it hangs from: the middle swings down round it, and the whole slides down a little
        const cx = px - Math.cos(ang) * px, cy = -Math.sin(ang) * Math.abs(px) - k * 0.06;
        return Object.assign(P(o * 0.2 + 0.01 + k * 0.04, cx, cy, base + piv * ang), { dur: settle + hold + tip, hits: [settle * 0.8], v: { x: n.x * 0.2 - r.x * piv * 0.3, y: -0.4, z: n.z * 0.2 - r.z * piv * 0.3 } });
      }
      case 'bounce': {   // hits and rebounds toward you
        const k = easeOut(clamp(tau / 0.26, 0, 1));
        return Object.assign(P(o + k * 0.4, sd * k * 0.05, k * 0.1 - k * k * 0.04, base + sd * k * 1.4), { dur: 0.26, hits: [0], v: { x: n.x * 1.1, y: 0.2, z: n.z * 1.1 } });
      }
      case 'clatter': {   // hits, and is knocked aside
        const k = easeOut(clamp(tau / 0.12, 0, 1));
        return Object.assign(P(o + k * 0.06, sd * k * 0.12, k * 0.04, base + sd * k * 0.9), { dur: 0.12, hits: [0], v: { x: n.x * 0.5 + r.x * sd * 1.4, y: 0.6, z: n.z * 0.5 + r.z * sd * 1.4 } });
      }
      default: {   // 'return': a poke, a smaller one, and back
        let poke = 0; [[0, 1], [0.17, 0.55]].forEach(([p0, amp]) => { const q = (tau - p0) / 0.13; if (q > 0 && q < 1) poke = Math.max(poke, Math.sin(Math.PI * q) * amp); });
        return Object.assign(P(o * (1 - poke), 0, 0, base + 0.08 * Math.sin(tau * 30) * Math.max(0, 1 - tau / 0.35)), { dur: 0.34, hits: [0.065, 0.235] });
      }
    }
  }
  function land(fx) {
    const L = G.L, it = fx.it, P = fx.land;
    it.x = P.x; it.y = P.y; it.z = P.z; it.flat = fx.opts.flat === undefined ? true : !!fx.opts.flat; it.taken = false;
    G.hover = null;
    if (L.onDrop) L.onDrop(it, fx);
    if (fx.opts.onLand) fx.opts.onLand(it, fx);
    finish(fx);
  }
  function finish(fx) {
    if (G.fumbling === fx) G.fumbling = null;
    const i = falling.indexOf(fx); if (i >= 0) falling.splice(i, 1);
    if (!fx.drop && H.cur === fx.from) H.gone = null;
    fx.phase = 'done';
    if (fx.opts.onDone) fx.opts.onDone(fx);
  }
  // put the thing in the air into the scene, drawn by the renderer: in its order among everything else, fogged and lit
  // where it is. Its icon is drawn square to the view (an upright sprite is drawn squashed as it is looked down on) and
  // turned about its middle.
  function add() { for (const fx of falling) addOne(fx); if (G.fumbling) addOne(G.fumbling); }
  function addOne(fx) {
    if (!fx.pos || fx.phase === 'wait' || fx.phase === 'done') return;
    const it = fx.it, w = (it.w || 0.4) * fx.scale, h = (it.h || 0.4) * fx.scale, big = Math.max(w, h) * 1.2, rot = fx.rot;
    const p = fx.pos, e = eyePos(G.L), dist = Math.hypot(p.x - e.x, p.z - e.z);
    const spr = { kind: 'sprite', x: p.x, y: p.y - big / 2, z: p.z, w: big, h: big, worn: !!it.decoy, attach: !!it.attach, noContact: true, layer: 1,
      draw: (ctx, P) => {
        ctx.translate(0, big / 2);
        const m = ctx.getTransform(), sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
        if (sy > 1e-6) ctx.scale(1, sx / sy);
        ctx.rotate(-rot);
        ctx.translate(0, -h / 2); ctx.scale(w, h);
        it.icon(ctx, P);
      } };
    // near the hand it is drawn over everything, as the hand is; at the target, in front of it and whatever is drawn there
    // (opts.sortDist puts it elsewhere in the order while it is there)
    const own = fx.phase === 'contact' || fx.phase === 'out' || fx.phase === 'home' ? (fx.opts.sortDist !== undefined ? fx.opts.sortDist : Math.max(0.02, dist * 0.8 - 0.05)) : dist;
    if (fx.top > 0.001 || own !== dist) spr.sortDist = lerp(own, 0.02, fx.top);
    R.add(spr);
  }

  // ---------------- the empty hand ----------------
  // G.reach(target, opts): the hand comes up to it, does what opts.style says and goes back down. style: 'touch' (lays its
  // fingers on it), 'push' (pushes twice), 'knock' (two knocks with the knuckles), 'rattle' (takes hold and shakes it),
  // 'pull' (takes hold and pulls twice). opts: at (where on it), sfx (the sound of each touch; 'pat' by default, 'woodKnock'
  // for a knock), onTouch(target) at the first touch. The target's touchedAt is set to the night's clock then, for a night
  // that moves its own parts. Clicking the same target again while the hand is there keeps it there for another go. Called
  // with something in hand, that goes down out of view while the empty hand does it, and comes back up after.
  const STYLE = { touch: { hold: 0.26, n: 1 }, push: { hold: 0.4, n: 2 }, knock: { hold: 0.42, n: 2 }, rattle: { hold: 0.45, n: 1 }, pull: { hold: 0.46, n: 2 } };
  function reach(t, opts) {
    const L = G.L; if (!t || !L) return null;
    opts = Object.assign({}, typeof t.reach === 'object' ? t.reach : typeof t.reach === 'string' ? { style: t.reach } : null, typeof opts === 'string' ? { style: opts } : opts || {});
    const style = STYLE[opts.style] ? opts.style : 'touch';
    if (H.reach && H.reach.target === t && H.reach.T < H.reach.out + H.reach.hold) { H.reach.hold += STYLE[style].hold; H.reach.more = (H.reach.more || 0) + 1; return H.reach; }
    const at = pointOn(t, opts.at, 0.02);
    H.reach = { target: t, at, style, opts, T: 0, out: 0.24, hold: STYLE[style].hold, back: 0.28, touched: 0 };
    return H.reach;
  }
  function updateReach(rc, dt) {
    rc.T += dt;
    const st = STYLE[rc.style], into = rc.T - rc.out;
    // its touches: one at arriving, then one each beat for push, knock and pull
    const beats = st.n > 1 ? Array.from({ length: Math.round(st.n * (rc.hold / st.hold)) }, (v, i) => i * st.hold / st.n) : [0];
    while (rc.touched < beats.length && into >= beats[rc.touched]) {
      if (rc.touched === 0) { rc.target.touchedAt = G.L.t; if (rc.opts.onTouch) rc.opts.onTouch(rc.target); }
      AUDIO.sfx(rc.opts.sfx || (rc.style === 'knock' ? 'woodKnock' : rc.style === 'rattle' ? 'rattle' : 'pat'), panTo(rc.at));
      rc.touched++;
    }
    if (rc.T >= rc.out + rc.hold + rc.back) H.reach = null;
  }
  function drawReach(ctx, L, rc, W, Hv, C, lit) {
    const to = screenOf(rc.at); if (!to) return;
    const st = STYLE[rc.style], spec = { grip: 'fist', at: [0, 0.5], angle: 0, axis: 0, scale: 1, x: 0, y: 0, size: 0.2, hands: 1 };
    const lay = layoutFor(spec, null, W, Hv, 1), u = Hv * 0.1;
    const rest = { x: lay.gx, y: Hv + u * 1.4 }, T = rc.T, into = T - rc.out;
    // it goes all the way to a thing in reach of a step; further off, the hand only goes out toward it
    const e = eyePos(L), far = clamp(1.8 / Math.max(0.3, Math.hypot(rc.at.x - e.x, rc.at.y - e.y, rc.at.z - e.z)), 0.6, 1);
    const k = far * (T < rc.out ? smoothstep(T / rc.out) : into < rc.hold ? 1 : 1 - smoothstep((into - rc.hold) / rc.back));
    const open = rc.style === 'touch' || rc.style === 'push';
    // the hand stops with its fingertips (or its knuckles) on the spot
    const tip = open ? { x: -0.5 * u, y: -0.55 * u } : { x: -0.1 * u, y: -0.1 * u };
    let x = lerp(rest.x, to.x - tip.x * 0.7, k), y = lerp(rest.y, to.y - tip.y * 0.7, k), s = lerp(1, 0.7, k), jx = 0, jy = 0;
    if (into >= 0 && into < rc.hold) {
      const ph = into / (st.hold / st.n);
      if (rc.style === 'rattle') { jx = Math.sin(into * 52) * u * 0.08; jy = Math.cos(into * 41) * u * 0.05; }
      else if (rc.style === 'pull') { const q = Math.sin(Math.PI * (ph % 1)); jx = q * u * 0.18; jy = q * u * 0.22; s *= 1 + q * 0.06; }
      else { const q = Math.max(0, Math.sin(Math.PI * Math.min(1, (ph % 1) / 0.6))); jx = -q * u * 0.06; jy = -q * u * 0.06; s *= 1 - q * 0.05; }
    }
    if (SAVE.data.settings.reducedMotion) { jx *= 0.3; jy *= 0.3; }
    x += jx; y += jy;
    const g = { x, y, s, arm: lerp(lay.arm, 1.0, k) };
    group(ctx, L, null, spec, g, lit, C, { box: { S: 0, pw: 0, ph: 0, hu: u }, pose: open ? 'open' : 'fist', empty: true });
  }

  // the hand's state, for nights and tests
  return { update, draw, add, reset, picked, dropped, threw, thrust, fumble, settle, reach, landSpot, heldSpec, handPoint, handWorld, pointOn, state: H, PRESETS, materialOf };
})();
// the calls a night makes (README, Anatomy of a night)
Object.assign(G, {
  hand: HANDS.state,
  fumbling: null,
  fumble: (item, target, opts) => HANDS.fumble(item, target, opts),
  reach: (target, opts) => HANDS.reach(target, opts),
  thrust: (target, item, release) => HANDS.thrust(target, item, release),
  landSpot: (target, item, opts) => HANDS.landSpot(target, item, opts),
  heldSpec: item => HANDS.heldSpec(item),
});
