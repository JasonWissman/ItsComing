'use strict';
// ---------- a tiny painter's-algorithm 3D renderer on Canvas 2D ----------
// World: x = east, y = up, z = north. The eye stands at (0, eyeH, 0) plus the level's eye offset, level.eye = {x, y, z}
// (absent or zero almost always: the night 2 car drives off with it). Renderables and lights flagged attach ride with
// the eye: their coordinates are relative to where it started, so a car's body, dash and headlights stay with the player
// while the road, the trees and the thing slide past. While the offset is zero none of this costs anything.
// Yaw 0 faces north (+z), increases clockwise. Pitch > 0 looks down.
const R = (() => {
  const NEAR = 0.05;
  const VFOV = 62 * DEG;
  let canvas = null, ctx = null, W = 1, H = 1, DPR = 1, pageW = 1, pageH = 1, viewY = 0;
  let f = 1, cosY = 1, sinY = 0, cosP = 1, sinP = 0, eyeH = 1.65, pitch = 0, yaw = 0, zoom = 1;
  let pal = null, fogDist = 100, fogColor = [0, 0, 0], ambient = 1;   // pal.ambient dims every surface colour (a room whose lights have gone)
  let ex = 0, ey = 0, ez = 0, moving = false, wasMoving = false;   // the eye's offset this frame, and whether there is one
  let ox = 0, oy = 0, oz = 0;   // the offset toCam takes off: the eye's, or zero while drawing something attached to it
  let moved = [];     // the statics, sorted by distance from the eye while it is away from where it started
  let list = [];      // dynamic renderables this frame
  let statics = [];   // the level's static props, sorted once, culled by view angle per frame
  let hits = [];
  let detailOn = true; // surface detail on or off (Settings)
  let hoverRef = null; // what the pointer is on (an item, a target, the thing): it, and every piece it is drawn with, glows
  let glowAs = null;   // while set, every renderable added is a piece of this target's drawing (glowAs)
  let time = 0, frame = 0;
  let vignette = null, grains = [], grainIdx = 0;
  let skyCache = null, dangerCv = null, dangerCvSize = 0;

  function attach(cv) { canvas = cv; ctx = cv.getContext('2d'); }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    pageW = Math.max(1, window.innerWidth); pageH = Math.max(1, window.innerHeight);
    // portrait screens get a letterboxed 3:2 view so a 45° turn still overlaps the last view
    W = pageW; H = pageH; viewY = 0;
    if (pageW / pageH < 1.25) { H = Math.round(pageW / 1.5); viewY = Math.round((pageH - H) / 2); }
    document.documentElement.style.setProperty('--view-top', viewY + 'px');
    document.documentElement.style.setProperty('--view-bottom', (pageH - viewY - H) + 'px');
    canvas.width = Math.round(pageW * DPR); canvas.height = Math.round(pageH * DPR);
    canvas.style.width = pageW + 'px'; canvas.style.height = pageH + 'px';
    buildVignette();
    if (!grains.length) buildGrain();
  }
  function buildVignette() {
    vignette = document.createElement('canvas');
    vignette.width = 256; vignette.height = 256;
    const c = vignette.getContext('2d');
    const g = c.createRadialGradient(128, 128, 60, 128, 128, 170);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.6, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  }
  function buildGrain() {
    for (let k = 0; k < 4; k++) {
      const cv = document.createElement('canvas'); cv.width = 160; cv.height = 160;
      const c = cv.getContext('2d');
      const img = c.createImageData(160, 160);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 100 + Math.random() * 155;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
      }
      c.putImageData(img, 0, 0);
      grains.push(cv);
    }
  }

  const fogAmt = d => 1 - Math.exp(-d / fogDist);
  function fogged(color, d, k) { return mixc(color, fogColor, fogAmt(d) * (k === undefined ? 1 : k)); }

  // ---- per-frame setup ----
  function begin(cam, level, t) {
    time = t; frame++;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (viewY) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, pageW, pageH); ctx.translate(0, viewY); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); }
    yaw = cam.yaw; pitch = cam.pitch; zoom = cam.zoom;
    cosY = Math.cos(yaw); sinY = Math.sin(yaw); cosP = Math.cos(pitch); sinP = Math.sin(pitch);
    f = (H / 2) / Math.tan(VFOV / 2) * zoom;
    eyeH = level.eyeH; pal = level.pal; fogDist = pal.fogDist; fogColor = pal.fog; ambient = pal.ambient === undefined ? 1 : pal.ambient;
    const e = level.eye;
    ex = e ? e.x || 0 : 0; ey = e ? e.y || 0 : 0; ez = e ? e.z || 0 : 0;
    moving = !!(ex || ey || ez); ox = ex; oy = ey; oz = ez;
    if (pending) settleStatics(eyeH + ey);
    if (wasMoving && !moving) for (const p of statics) p.sd = p.sd0;   // back where it started: the prepared order holds again
    wasMoving = moving;
    list.length = 0; hits.length = 0; glowAs = null;
    // shake: applied as a translation of the whole scene
    if (cam.shakeX || cam.shakeY) ctx.translate(cam.shakeX, cam.shakeY);
    drawSkyGround();
  }

  function drawSkyGround() {
    // the bands depend only on pitch, zoom, palette and lightning: keep them in an offscreen strip while nothing changes
    // coarse enough that fog rolls and the zoom wobble do not rebuild it every frame, and keyed on the colours so an animated palette (night 12's dawn) is not stale
    const cols = a => (a ? a.map(v => v | 0).join(',') : '');
    const key = (Math.round(pitch * 200) / 200).toFixed(3) + '|' + zoom.toFixed(2) + '|' + W + 'x' + H + '|' + pal.id + '|' + Math.round(fogDist) + '|' + LIGHT.global.toFixed(2) + '|' + cols(pal.skyTop) + '|' + cols(pal.fog) + '|' + cols(pal.ground) + (ey ? '|' + ey.toFixed(2) : '');
    if (skyCache && skyCache.key === key) { ctx.drawImage(skyCache.cv, -8, -4, W + 16, H + 8); return; }
    if (!skyCache || skyCache.cv.width !== W + 16 || skyCache.cv.height !== H + 8) { const cv = document.createElement('canvas'); cv.width = W + 16; cv.height = H + 8; skyCache = { cv, key: '' }; }
    skyCache.key = key;
    const sc = skyCache.cv.getContext('2d');
    sc.setTransform(1, 0, 0, 1, 8, 4);
    const step = H > 900 ? 4 : 3;
    const skyTop = pal.skyTop, ground = pal.ground, fog = pal.fog;
    for (let y = -4; y < H + 4; y += step) {
      const ang = Math.atan2(H / 2 - (y + step / 2), f) - pitch; // >0 above horizon
      let col;
      if (ang > 0) {
        const k = clamp(ang / (Math.PI / 2.6), 0, 1);
        col = mixc(fog, skyTop, Math.pow(k, 0.6));
        if (LIGHT.global > 0.01) col = mixc(col, [225, 228, 245], Math.min(0.85, LIGHT.global * 0.9));
      } else {
        const d = (eyeH + ey) / Math.tan(-ang);
        col = mixc(ground, fog, fogAmt(d));
      }
      sc.fillStyle = rgba(col);
      sc.fillRect(-8, y, W + 16, step + 1);
    }
    ctx.drawImage(skyCache.cv, -8, -4, W + 16, H + 8);
  }

  // ---- transforms ----
  function toCam(x, y, z) {
    const dy = y - eyeH - oy;
    x -= ox; z -= oz;
    const cx = x * cosY - z * sinY;
    const cz = x * sinY + z * cosY;
    return [cx, dy * cosP + cz * sinP, -dy * sinP + cz * cosP];
  }
  function proj(c) { return [W / 2 + f * c[0] / c[2], H / 2 - f * c[1] / c[2]]; }
  function screenPos(x, y, z) {
    const c = toCam(x, y, z);
    if (c[2] < NEAR) return null;
    const p = proj(c);
    return { x: p[0], y: p[1], depth: c[2], scale: f / c[2] };
  }
  // screen rect of an upright billboard (w x h metres, base at x,y,z), for the current camera or a given
  // one ({yaw, pitch, zoom, W, H, eyeH, eye?}); pure math, used by the approach-lane visibility test
  function projectRect(x, y, z, w, h, cam) {
    let cy = cosY, sy = sinY, cp = cosP, sp = sinP, ff = f, eh = eyeH + ey, Wd = W, Hd = H, qx = ex, qz = ez;
    if (cam) {
      cy = Math.cos(cam.yaw); sy = Math.sin(cam.yaw); cp = Math.cos(cam.pitch); sp = Math.sin(cam.pitch);
      Wd = cam.W; Hd = cam.H; eh = cam.eyeH + (cam.eye ? cam.eye.y || 0 : 0); ff = (Hd / 2) / Math.tan(VFOV / 2) * (cam.zoom || 1);
      qx = cam.eye ? cam.eye.x || 0 : 0; qz = cam.eye ? cam.eye.z || 0 : 0;
    }
    const tc = (px, py, pz) => { const dy = py - eh; px -= qx; pz -= qz; const cx = px * cy - pz * sy; const cz = px * sy + pz * cy; return [cx, dy * cp + cz * sp, -dy * sp + cz * cp]; };
    const base = tc(x, y, z);
    if (base[2] < NEAR) return null;
    const bx = Wd / 2 + ff * base[0] / base[2], by = Hd / 2 - ff * base[1] / base[2];
    const s = ff / base[2];
    const top = tc(x, y + h, z);
    let hpx = h * s;
    if (top[2] >= NEAR) hpx = Math.max(0.5, by - (Hd / 2 - ff * top[1] / top[2]));
    const wpx = w * s;
    return { x: bx - wpx / 2, y: by - hpx, w: wpx, h: hpx };
  }
  function clipNear(pts) {
    const out = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const ain = a[2] >= NEAR, bin = b[2] >= NEAR;
      if (ain) out.push(a);
      if (ain !== bin) {
        const t = (NEAR - a[2]) / (b[2] - a[2]);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
      }
    }
    return out;
  }

  // ---- renderables ----
  // poly: {kind:'poly', pts:[[x,y,z]...], color:[r,g,b], alpha?, stroke?, lw?, noFog?, layer?, hit?, dist?}
  // sprite: {kind:'sprite', x,y,z, w,h, draw(ctx,P), flat?, card?, worn? (a decoy's drained, rusty colours), noFog?, layer?, hit?, dist?, fogScale?, onRect?, alpha?}
  // sortDist? overrides dist for drawing order only (fog still uses dist): a mirror's backing hides what is behind its wall
  // attach? rides with the eye (see the top): its coordinates and dist are taken from where the eye started
  // glowOf? the target (or targets) this is a piece of: it glows while that is hovered; hoverOnly? drawn only then
  function measure(p) {
    if (p.dist === undefined) {
      if (p.kind === 'poly') {
        let s = 0, cx = 0, cy = 0, cz = 0;
        for (const v of p.pts) { s += Math.hypot(v[0], v[2]); cx += v[0]; cy += v[1]; cz += v[2]; }
        p.dist = s / p.pts.length; p.cx = cx / p.pts.length; p.cy = cy / p.pts.length; p.cz = cz / p.pts.length;
      } else p.dist = Math.hypot(p.x, p.z);
    } else if (p.kind === 'poly' && p.cx === undefined) {
      let cx = 0, cy = 0, cz = 0; for (const v of p.pts) { cx += v[0]; cy += v[1]; cz += v[2]; }
      p.cx = cx / p.pts.length; p.cy = cy / p.pts.length; p.cz = cz / p.pts.length;
    }
    if (p.layer === undefined) p.layer = 1;
    p.sd = p.sortDist === undefined ? p.dist : p.sortDist;
  }
  function add(p) { measure(p); if (moving) fromEye(p); if (glowAs) p.glowOf = glowAs; list.push(p); }
  // while the eye is away from where it started, fog and drawing order go by each renderable's own distance from it
  // (sortDist keeps its offset from dist); an attached one keeps the distance it was measured with. Surface detail
  // pieces are not kept with their quad here: a night that moves the eye builds its ground without them.
  function eyeDist(p) {
    if (p.kind !== 'poly') return Math.hypot(p.x - ex, p.z - ez);
    let d = 0; for (const v of p.pts) d += Math.hypot(v[0] - ex, v[2] - ez); return d / p.pts.length;
  }
  function fromEye(p) {
    if (p.attach) { p.fd = p.dist; return; }
    const d = eyeDist(p), w = p.whole;
    // a part of a cut face (see below) is fogged as the whole face, once a frame, so no seam shows between its parts
    if (w && w.fdFrame !== frame) { w.fdFrame = frame; w.fdWhole = eyeDist(w); }
    p.fd = w ? w.fdWhole : d; p.sd = p.sortDist === undefined ? d : d + p.sortDist - p.dist;
  }
  // the offset toCam takes off for the renderable about to be drawn
  function offsetFor(attached) { ox = attached ? 0 : ex; oy = attached ? 0 : ey; oz = attached ? 0 : ez; }
  // angular extent of a static prop around the eye, for view culling
  function extent(p) {
    let sx = 0, sz = 0, yLow = Infinity, yHigh = -Infinity;
    const angles = [];
    if (p.kind === 'poly') { for (const v of p.pts) { const a = Math.atan2(v[0], v[2]); angles.push(a); sx += Math.sin(a); sz += Math.cos(a); if (v[1] < yLow) yLow = v[1]; if (v[1] > yHigh) yHigh = v[1]; } }
    else { const a = Math.atan2(p.x, p.z), half = Math.atan2(Math.max(p.w, p.h) * 0.6, Math.max(0.1, Math.hypot(p.x, p.z))); angles.push(a - half, a + half); sx = Math.sin(a); sz = Math.cos(a); yLow = p.y; yHigh = p.y + p.h; }
    const center = Math.atan2(sx, sz);
    let half = 0;
    for (const a of angles) half = Math.max(half, Math.abs(wrapPi(a - center)));
    // the nearest the prop comes to the eye in the ground plane: the culling test must use this, not the sort distance, or a long wall whose near end is on screen gets dropped when looking down
    let dNear = Infinity;
    if (p.kind === 'poly') { const n = p.pts.length; for (let i = 0; i < n; i++) { const a = p.pts[i], b = p.pts[(i + 1) % n]; const dx = b[0] - a[0], dz = b[2] - a[2], l2 = dx * dx + dz * dz; const t = l2 > 1e-9 ? clamp(-(a[0] * dx + a[2] * dz) / l2, 0, 1) : 0; dNear = Math.min(dNear, Math.hypot(a[0] + dx * t, a[2] + dz * t)); } }
    else dNear = Math.hypot(p.x, p.z);
    p.dNear = Math.max(0.1, dNear);
    p.aCenter = center; p.aHalf = half; p.yLow = yLow; p.yHigh = yHigh;
    p.noCull = half > 1.3;
  }
  // is a static prop outside the horizontal extent of the view? Looking down, the frustum's lower edge sweeps
  // round behind the eye, so the test allows for how far below the eye the prop reaches; looking up (the zoom's
  // sway dips a little above level), how far above it (conservative: never culls anything that could be on screen)
  function culled(p, k, sp, cp) {
    const phi = Math.abs(wrapPi(p.aCenter - yaw)) - p.aHalf - 0.12;
    if (phi <= 0) return false;
    const reach = sp >= 0 ? Math.max(0, eyeH - p.yLow) * sp : Math.max(0, p.yHigh - eyeH) * -sp;
    return Math.sin(phi) * p.dNear > k * (reach + p.dNear * Math.cos(phi) * cp) + 0.35;
  }
  const order = (a, b) => (a.layer - b.layer) || (b.sd - a.sd);

  // ---- drawing order for long faces, and for things that rest on or lean against others ----
  // A poly is drawn in one go, at one place in the order, by the mean distance of its corners. For a long face (a
  // counter, a wall, a bench top, a bed) that mean can be far from the part of it a thing stands against: a stool behind
  // a seven-metre counter came out nearer than the counter's middle and was drawn over it, and an item at the far end of
  // a table was drawn before the table top and lost under it. So, for sorting only, every long static face is cut on
  // one grid laid round the eye: 24 sectors, each cut again into rings that grow with distance, so a cell is about a
  // quarter as wide and as deep as it is far away. A wall and the trim along it, a counter and its top, are cut at the
  // same lines, so whatever shares a cell sorts against the part of the face in that cell. A part draws exactly as its
  // parent (it inherits its colour, fog distance, light, alpha and detail flag, so a night that changes the parent
  // changes every part); only its corners and its place in the order are its own. Parts overlap by about a pixel so no
  // seam shows, and the surface detail laid on a face (boards, stone) is cut with it, each bit following its part.
  // Two contacts are then made exact, since a part's middle can still be a little nearer or further than the spot a
  // thing touches it: whatever rests on a surface below the eye (an item, a lamp, a box on a table, a counter's top on
  // its body, the covers on a bed), or stands or hangs just in front of a wall (a chain on its peg, a frame round a
  // door, a box against it), is drawn just after every part of that surface or wall it touches. What a night has
  // pinned with a sortDist keeps it (or only moves later past what it touches), and a face that something pinned to
  // draw early touches is left whole, so a night's own arrangement holds.
  // Faces of SC.box that look away from the eye are not drawn: the box is closed from anywhere above its open bottom,
  // and drawn in the wrong order such a face showed through the box.
  const SECT = 24, RINGS = [0];
  for (let r = 0.6; r < 45; r *= 1.35) RINGS.push(r);
  const hyp = v => Math.hypot(v[0], v[2]);
  const meanDist = pts => { let s = 0; for (const v of pts) s += hyp(v); return s / pts.length; };
  // keep the part of a polygon where a*x + c*z >= d (a vertical plane), interpolating y as well
  function clipPlane(pts, a, c, d) {
    const out = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const P = pts[i], Q = pts[(i + 1) % n], fp = a * P[0] + c * P[2] - d, fq = a * Q[0] + c * Q[2] - d;
      if (fp >= 0) out.push(P);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t, P[2] + (Q[2] - P[2]) * t]); }
    }
    return out.length >= 3 ? out : null;
  }
  // the planes of one cell, widened by ov on every side so neighbouring parts overlap
  function cellPlanes(k, j, ov) {
    const a0 = k / SECT * TAU, a1 = (k + 1) / SECT * TAU, am = (k + 0.5) / SECT * TAU, bx = Math.sin(am), bz = Math.cos(am);
    const planes = [[Math.cos(a0), -Math.sin(a0), -ov], [-Math.cos(a1), Math.sin(a1), -ov], [bx, bz, RINGS[j] - ov]];
    if (j + 1 < RINGS.length) planes.push([-bx, -bz, -RINGS[j + 1] - ov]);
    return planes;
  }
  function clipCell(pts, planes) { for (const [a, c, d] of planes) { pts = clipPlane(pts, a, c, d); if (!pts) return null; } return pts; }
  const pinned = p => p.sortDist !== undefined || !!p.ownDist;
  // a static face that may be cut: plain, sorted by its own corners (no sortDist or dist given), not a floor
  function cuttable(p) {
    return p.kind === 'poly' && p.pts.length >= 3 && p.pts.length <= 6 && p.layer >= 1 && !pinned(p) && !p.detail && !p.hit && !p.invisible && !p.stroke && p.alpha === undefined;
  }
  // the cells a face reaches, as [sector, ring, the face clipped to it (unwidened)]
  function cellsOf(pts) {
    const out = [];
    for (let k = 0; k < SECT; k++) {
      const wedge = clipCell(pts, cellPlanes(k, 0, 0).slice(0, 2));
      if (!wedge) continue;
      const am = (k + 0.5) / SECT * TAU, bx = Math.sin(am), bz = Math.cos(am);
      let lo = Infinity, hi = -Infinity;
      for (const v of wedge) { const t = bx * v[0] + bz * v[2]; lo = Math.min(lo, t); hi = Math.max(hi, t); }
      for (let j = 0; j < RINGS.length; j++) {
        if (j + 1 < RINGS.length && RINGS[j + 1] <= lo) continue;
        if (RINGS[j] >= hi) break;
        const c = clipCell(wedge, cellPlanes(k, j, 0).slice(2));
        if (c) out.push([k, j, c]);
      }
    }
    return out;
  }
  function cutFace(p) {
    if (p.dNear > 30) return null;   // a backdrop far off: nothing stands close enough to it to matter
    let span = 0;
    for (let i = 0; i < p.pts.length; i++) { const a = p.pts[i], b = p.pts[(i + 1) % p.pts.length]; span = Math.max(span, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])); }
    if (span < 0.6) return null;   // small enough that its middle is good enough (a book, a handle, a phone's parts)
    const cells = cellsOf(p.pts);
    if (cells.length < 2) return null;
    const parts = [];
    for (const [k, j] of cells) {
      const ov = 0.002 + 0.0025 * Math.max(0.5, RINGS[j]), planes = cellPlanes(k, j, ov);   // about a pixel of overlap
      const pts = clipCell(p.pts, planes);
      if (!pts) continue;
      const q = Object.create(p);
      q.pts = pts; q.planes = planes; q.whole = p; q.sd = meanDist(pts);
      parts.push(q);
    }
    return parts;
  }
  // a detail piece lying on a face that was cut: cut it with the same cells, each bit following its part
  function cutPiece(pc, parts) {
    const out = [];
    for (const q of parts) {
      const pts = clipCell(pc.pts, q.planes);
      if (!pts) continue;
      const r = Object.create(pc);
      r.pts = pts; r.on = q; r.whole = pc;
      out.push(r);
    }
    return out.length ? out : null;
  }
  // a face of SC.box that looks away from the eye, which is outside the box and above its open bottom
  function culledFace(p, x, y, z) {
    const f = p.bf;
    if (!f || (p.alpha !== undefined && p.alpha < 1)) return false;
    const b = f.box;
    if (y <= b.y0 + 0.001) return false;
    const dx = x - b.c[0], dz = z - b.c[2];
    if (Math.abs(dx * b.u[0] + dz * b.u[1]) < b.h[0] && Math.abs(y - b.c[1]) < b.h[1] && Math.abs(dx * b.w[0] + dz * b.w[1]) < b.h[2]) return false;   // inside it: a room built as a box
    const q = p.pts[0];
    return (x - q[0]) * f.n[0] + (y - q[1]) * f.n[1] + (z - q[2]) * f.n[2] < -1e-4;
  }

  // the surfaces and walls things can touch, filed in a grid of one-metre cells so a thing looks only at its neighbours.
  // A surface is a level poly (below the eye, once the eye is known: one above it is seen from underneath); a wall is an
  // upright one, with the side of it the eye is on.
  function contactIndex(list, eyeY) {
    const grid = new Map(), add = (e, x0, x1, z0, z1) => {
      for (let i = Math.floor(x0 - 0.45); i <= Math.floor(x1 + 0.45); i++) for (let j = Math.floor(z0 - 0.45); j <= Math.floor(z1 + 0.45); j++) { const k = i * 8192 + j; let c = grid.get(k); if (!c) grid.set(k, c = []); c.push(e); }
    };
    for (const p of list) {
      if (p.kind !== 'poly' || p.layer < 1 || p.detail || p.invisible || p.stroke || p.pts.length < 3 || p.dNear > 40) continue;
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, y0 = Infinity, y1 = -Infinity, nx = 0, ny = 0, nz = 0;
      const pts = p.pts;
      for (let a = 0; a < pts.length; a++) {
        const u = pts[a], v = pts[(a + 1) % pts.length];
        x0 = Math.min(x0, u[0]); x1 = Math.max(x1, u[0]); z0 = Math.min(z0, u[2]); z1 = Math.max(z1, u[2]); y0 = Math.min(y0, u[1]); y1 = Math.max(y1, u[1]);
        nx += (u[1] - v[1]) * (u[2] + v[2]); ny += (u[2] - v[2]) * (u[0] + v[0]); nz += (u[0] - v[0]) * (u[1] + v[1]);
      }
      if ((x1 - x0) * (z1 - z0) > 1600) continue;
      if (y1 - y0 < 1e-4) {
        if ((x1 - x0) * (z1 - z0) < 0.004 || (eyeY !== undefined && y0 > eyeY - 0.05)) continue;
        add({ p, s: true, y: y0, x0, x1, z0, z1, mark: 0 }, x0, x1, z0, z1);
      } else {
        const nl = Math.hypot(nx, nz);
        if (nl < 1e-9 || Math.abs(ny) > 0.15 * Math.hypot(nx, ny, nz)) continue;
        nx /= nl; nz /= nl;
        const d0 = nx * pts[0][0] + nz * pts[0][2], sg = d0 > 0 ? -1 : 1;
        let a0 = Infinity, a1 = -Infinity;
        for (const v of pts) { const t = -nz * v[0] + nx * v[2]; a0 = Math.min(a0, t); a1 = Math.max(a1, t); }
        add({ p, s: false, nx, nz, d0, sg, a0, a1, y0, y1, mark: 0 }, x0, x1, z0, z1);
      }
    }
    return grid;
  }
  const inside = (x, z, pts, tol) => {
    let c = false;
    for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) { const A = pts[a], B = pts[b]; if ((A[2] > z) !== (B[2] > z) && x < (B[0] - A[0]) * (z - A[2]) / (B[2] - A[2]) + A[0]) c = !c; }
    if (c || !tol) return c;
    return inside(x + tol, z, pts, 0) || inside(x - tol, z, pts, 0) || inside(x, z + tol, pts, 0) || inside(x, z - tol, pts, 0);
  };
  let stamp = 0, gap = 0;
  // the smallest sort distance among what q rests on or leans against (or Infinity), with how far q stands off that one
  // in gap; with hits, every one is listed
  function touching(grid, q, hits) {
    let tx0, tx1, tz0, tz1, lo, hi, cx = 0, cz = 0;
    const spr = q.kind === 'sprite';
    if (spr) { tx0 = tx1 = cx = q.x; tz0 = tz1 = cz = q.z; lo = q.y; hi = q.y + q.h; }
    else {
      tx0 = tz0 = lo = Infinity; tx1 = tz1 = hi = -Infinity;
      for (const v of q.pts) { tx0 = Math.min(tx0, v[0]); tx1 = Math.max(tx1, v[0]); tz0 = Math.min(tz0, v[2]); tz1 = Math.max(tz1, v[2]); lo = Math.min(lo, v[1]); hi = Math.max(hi, v[1]); cx += v[0]; cz += v[2]; }
      cx /= q.pts.length; cz /= q.pts.length;
    }
    const flat = !spr && hi - lo < 1e-4, mark = ++stamp, whole = q.whole || q;
    let best = Infinity;
    for (let i = Math.floor(tx0); i <= Math.floor(tx1); i++) for (let j = Math.floor(tz0); j <= Math.floor(tz1); j++) {
      const cell = grid.get(i * 8192 + j); if (!cell) continue;
      for (const e of cell) {
        if (e.mark === mark) continue;
        e.mark = mark;
        const f = e.p;
        if (f === q || (f.whole || f) === whole || (!hits && f.sd >= best)) continue;
        let g;
        if (e.s) {   // resting on it: its lowest point on the surface, over its footprint
          if (lo < e.y - (spr ? 0.03 : 0.005) || lo > e.y + (spr ? 0.1 : flat ? 0.3 : 0.06) || (flat && lo - e.y < 1e-4)) continue;
          if (flat) {   // a level face over it: overlapping it by more than the hairline neighbouring parts share
            const ox = Math.min(tx1, e.x1) - Math.max(tx0, e.x0), oz = Math.min(tz1, e.z1) - Math.max(tz0, e.z0);
            if (ox < Math.min(0.04, (tx1 - tx0) / 2) || oz < Math.min(0.04, (tz1 - tz0) / 2)) continue;
          } else if (tx1 < e.x0 - 0.01 || tx0 > e.x1 + 0.01 || tz1 < e.z0 - 0.01 || tz0 > e.z1 + 0.01 || !inside(cx, cz, f.pts, 0.01)) continue;
          g = 0;   // things on a surface keep their own order among themselves
        } else {     // just in front of it: within reach of its plane on the eye's side, over its face
          if (hi < e.y0 + 0.01 || lo > e.y1 + 0.1) continue;   // (a lip just above its top, a counter's edge over its front, still overlaps it on screen)
          let d1 = -Infinity, d2 = Infinity, a0 = Infinity, a1 = -Infinity;
          if (spr) { const d = e.sg * (e.nx * q.x + e.nz * q.z - e.d0), t = -e.nz * q.x + e.nx * q.z; d1 = d2 = d; a0 = t - q.w / 2; a1 = t + q.w / 2; }
          else for (const v of q.pts) { const d = e.sg * (e.nx * v[0] + e.nz * v[2] - e.d0), t = -e.nz * v[0] + e.nx * v[2]; d1 = Math.max(d1, d); d2 = Math.min(d2, d); a0 = Math.min(a0, t); a1 = Math.max(a1, t); }
          if (d2 < -0.02 || d1 > (spr ? 0.35 : 0.4) || d1 < 0.005 || Math.min(a1, e.a1) - Math.max(a0, e.a0) < Math.min(0.04, (a1 - a0) / 2)) continue;   // (not the hairline neighbouring parts share)
          g = (d1 + d2) / 2;
        }
        if (hits) hits.push(f); else { best = f.sd; gap = g; }
      }
    }
    return best;
  }
  // drawn just after what it touches; among the things touching the same, the one standing further off it (nearer the
  // eye) later, and otherwise the further from the eye first
  function after(p, sd) { if (sd < Infinity && p.sd > sd - 0.0008) p.sd = sd - 0.001 - 0.002 * clamp(gap / 0.5, 0, 1) + 0.0002 * clamp((p.sd - sd) / 4, 0, 0.99); }
  let contacts = new Map(), pending = null;
  const lowest = p => (p.kind === 'sprite' ? p.y : Math.min(...p.pts.map(v => v[1])));
  // a sortDist (or dist) a night gave to draw a thing earlier than where it is: a net drawn with the wall it hangs on,
  // behind what stands in front of it; a mirror's backing. Such a thing, and whatever it touches, is left as the night
  // set it. A thing pinned to draw at or after where it is (a window proud of its facade) may only move later still.
  const early = p => { const k = p.sortDist !== undefined ? p.sortDist : p.ownDist ? p.dist : undefined; return k !== undefined && k > (p.kind === 'poly' ? meanDist(p.pts) : Math.hypot(p.x, p.z)) + 0.05; };
  // register a level's static props: measured and given an extent; cut, settled and sorted at the next frame, when the
  // eye's height is known (nothing wholly above the eye is cut: a ceiling or a roof only overhangs what is under it, and
  // only a surface below the eye can be rested on)
  function prepare(props) {
    for (const p of props) { if (p.ownDist === undefined) p.ownDist = p.dist !== undefined; measure(p); extent(p); }
    statics = props.slice(); pending = props;
    wasMoving = false; moved.length = 0;
  }
  function settleStatics(eyeY) {
    const props = pending; pending = null;
    const wholes = props.filter(p => cuttable(p) && lowest(p) < eyeY - 0.05), keep = new Set();
    if (wholes.length) {
      const g0 = contactIndex(wholes);
      for (const p of props) if (!p.detail && p.layer >= 1 && early(p)) { const hits = []; touching(g0, p, hits); for (const f of hits) keep.add(f); }
    }
    const all = [], cutOf = new Map(), cut = new Set(wholes);
    for (const p of props) {
      const parts = cut.has(p) && !keep.has(p) ? cutFace(p) : null;
      if (parts) { for (const q of parts) { extent(q); all.push(q); } cutOf.set(p, parts); }
      else if (p.detail && p.of && cutOf.has(p.of)) { const bits = cutPiece(p, cutOf.get(p.of)); if (bits) { for (const r of bits) extent(r); all.push(...bits); } else all.push(p); }
      else all.push(p);
    }
    statics = all;
    contacts = contactIndex(statics, eyeY);
    const free = statics.filter(p => !p.detail && p.layer >= 1 && !early(p)).sort((a, b) => lowest(a) - lowest(b));
    for (const p of free) after(p, touching(contacts, p));
    // a detail piece follows what it lies on (the part it was cut with, or its quad, whose order a sortDist or a
    // contact may have moved) and is drawn straight after it
    for (const p of statics) if (p.detail) { const on = p.on || p.of; if (on) p.sd = on.sd; }
    for (const p of statics) p.sd0 = p.sd;
    statics.sort(order);
  }
  // a dynamic renderable touching the statics: an item on a table, a chain on its peg, covers on a bed
  function settleDynamic(p) {
    if (p.layer < 1 || p.detail || p.invisible || p.noContact || (p.sortDist !== undefined && early(p))) return;   // noContact: the creature, which stands on its lane, not on what it passes
    after(p, touching(contacts, p));
  }

  // the hover glow: what is hovered is drawn once more under itself, added to what is there and softly blurred, so a warm
  // halo shows round its own shape (whatever is drawn after it, in front, covers the halo as it covers the thing). Its
  // pieces are first drawn plain on a canvas of their own (glowCv), and that is blurred onto the view once: one blur
  // however many pieces and strokes it is drawn with (a blur for each made a busy target, a winch or a gate, slow to draw)
  const GLOW = 'rgba(255,236,190,0.9)', GLOW_PAD = 30, GLOW_K = 3;
  let glowCv = null, glowCtx = null, glowBox = null, halfCv = null, halfCtx = null;
  function glowGrow(x0, y0, x1, y1) {   // the part of the view the glow's pieces cover, in the view's own units
    const g = glowBox; if (x0 < g[0]) g[0] = x0; if (y0 < g[1]) g[1] = y0; if (x1 > g[2]) g[2] = x1; if (y1 > g[3]) g[3] = y1;
  }
  // is p part of what is hovered: a thing's own drawing (an item), or one of the pieces a target is drawn with (p.glowOf:
  // the target, or a list of them, when one piece belongs to more than one). A target's own hit area draws nothing.
  function lit(p) {
    const g = p.glowOf;
    if (g && (g === hoverRef || (Array.isArray(g) && g.includes(hoverRef)))) return true;
    return !!(p.hit && p.hit.ref === hoverRef && !p.noHover && !p.invisible);
  }
  // the outline of a poly on the view, added to the current path; null when it is not drawn this frame
  function tracePoly(p) {
    if (p.detail && !detailOn) return null; // surface detail (boards, stone) can be switched off in Settings
    if (p.alpha !== undefined && p.alpha <= 0.004) return null; // faded out entirely (the last night's room, before the light)
    if (p.bf && culledFace(p, ox, eyeH + oy, oz)) return null;   // a box's face that looks away from the eye
    let cs = new Array(p.pts.length);
    let anyIn = false;
    for (let i = 0; i < p.pts.length; i++) { const v = p.pts[i]; cs[i] = toCam(v[0], v[1], v[2]); if (cs[i][2] >= NEAR) anyIn = true; }
    if (!anyIn) return null;
    cs = clipNear(cs);
    if (cs.length < 2) return null;
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (let i = 0; i < cs.length; i++) {
      const s = proj(cs[i]);
      if (s[0] < minx) minx = s[0]; if (s[0] > maxx) maxx = s[0];
      if (s[1] < miny) miny = s[1]; if (s[1] > maxy) maxy = s[1];
      i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]);
    }
    if (maxx < -20 || minx > W + 20 || maxy < -20 || miny > H + 20) return null;
    return { cs, minx, maxx, miny, maxy };
  }
  const strokeW = (p, cs) => Math.max(0.6, (p.lw || 0.02) * f / Math.max(NEAR, cs[0][2]));
  function drawPoly(p) {
    ctx.beginPath();
    const r = tracePoly(p);
    if (!r) return;
    if (p.hit) hits.push({ x: r.minx, y: r.miny + viewY, w: r.maxx - r.minx, h: r.maxy - r.miny, kind: p.hit.kind, ref: p.hit.ref });
    if (p.invisible) return;   // a hit area only: what it stands for is drawn by other pieces, and they glow
    const li = (LIGHT.list.length || LIGHT.global) && !p.noLight ? LIGHT.at(p.cx + ex - ox, p.cy + ey - oy, p.cz + ez - oz) : null;   // lit where it really is: an attached poly has come along with the eye
    const pc = detailOn && p.seam ? p.seam : p.color; // with detail on, a textured quad shows as the seams between its pieces
    const base0 = ambient !== 1 && !p.noLight ? scalec(pc, ambient) : pc;
    const base = li ? LIGHT.apply(base0, li) : base0;
    const col = p.noFog ? base : fogged(base, moving ? p.fd : p.dist);
    if (p.alpha !== undefined) ctx.globalAlpha = p.alpha;
    if (p.stroke) {
      ctx.strokeStyle = rgba(col); ctx.lineWidth = strokeW(p, r.cs);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    } else {
      ctx.closePath(); ctx.fillStyle = rgba(col); ctx.fill();
    }
    if (p.alpha !== undefined) ctx.globalAlpha = 1;
  }
  // the glow under every piece of what is hovered, drawn where the first of them comes in the drawing order: the filled
  // polys as one shape (one soft edge round the lot, none along the seams between them), then the lines and the sprites
  function drawGlows(groups, cur) {
    const main = ctx, cw = canvas.width, ch = canvas.height;
    if (!glowCv || glowCv.width !== cw || glowCv.height !== ch) { glowCv = document.createElement('canvas'); glowCv.width = cw; glowCv.height = ch; glowCtx = glowCv.getContext('2d'); }
    const g = glowCtx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cw, ch);   // (all of it: a sprite may draw outside its box)
    const m = main.getTransform();
    g.setTransform(m);
    ctx = g; glowBox = [1e9, 1e9, -1e9, -1e9];
    ctx.fillStyle = 'rgb(64,58,48)'; ctx.strokeStyle = 'rgb(64,58,48)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    let any = false;
    for (const src of groups) for (const q of src) if (q.kind === 'poly' && !q.stroke && !q.invisible && !(q.alpha < 1) && lit(q)) {   // (glass would show the glow through it)
      if (moving) offsetFor(q.attach);
      const r = tracePoly(q);
      if (r) { ctx.closePath(); any = true; glowGrow(r.minx, r.miny, r.maxx, r.maxy); }
    }
    if (any) ctx.fill();
    for (const src of groups) for (const q of src) {
      if (q.invisible || !lit(q)) continue;
      if (q.kind === 'poly' && !q.stroke) continue;
      if (moving) offsetFor(q.attach);
      if (q.kind === 'poly') { ctx.beginPath(); const r = tracePoly(q); if (r) { ctx.lineWidth = strokeW(q, r.cs); ctx.stroke(); glowGrow(r.minx, r.miny, r.maxx, r.maxy); } }
      else drawSprite(q, true);
    }
    ctx = main;
    if (moving) offsetFor(cur.attach);
    // the part of the canvas it covers, in device pixels, with room for the blur
    const b = glowBox;
    if (b[0] > b[2]) return;
    const x0 = Math.max(0, Math.floor(m.a * b[0] + m.e - GLOW_PAD)), y0 = Math.max(0, Math.floor(m.d * b[1] + m.f - GLOW_PAD));
    const x1 = Math.min(cw, Math.ceil(m.a * b[2] + m.e + GLOW_PAD)), y1 = Math.min(ch, Math.ceil(m.d * b[3] + m.f + GLOW_PAD));
    if (x1 <= x0 || y1 <= y0) return;
    // blurred at a third of the size (a ninth of the work), then laid over the view at full size, added to what is there
    const K = GLOW_K, w = x1 - x0, h = y1 - y0, hw = Math.ceil(w / K), hh = Math.ceil(h / K);
    if (!halfCv || halfCv.width < hw || halfCv.height < hh) { halfCv = document.createElement('canvas'); halfCv.width = Math.max(hw, halfCv ? halfCv.width : 0); halfCv.height = Math.max(hh, halfCv ? halfCv.height : 0); halfCtx = halfCv.getContext('2d'); }
    const hc = halfCtx;
    hc.clearRect(0, 0, halfCv.width, halfCv.height);
    hc.shadowColor = GLOW; hc.shadowBlur = 16 / K; hc.shadowOffsetX = 0; hc.shadowOffsetY = 0;
    hc.drawImage(glowCv, x0, y0, w, h, 0, 0, w / K, h / K);
    hc.drawImage(glowCv, x0, y0, w, h, 0, 0, w / K, h / K);   // twice: as strong close round it as a blur of each of its parts, added up, was
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(halfCv, 0, 0, w / K, h / K, x0, y0, w, h);
    ctx.restore();
  }

  function spriteP(p) {
    const fa = p.noFog ? 0 : fogAmt(moving ? p.fd : p.dist) * (p.fogScale === undefined ? 1 : p.fogScale);
    const li = (LIGHT.list.length || LIGHT.global) && !p.noFog && !p.noLight ? LIGHT.at(p.x + ex - ox, p.y + (p.h || 0) * 0.5 + ey - oy, p.z + ez - oz) : null;
    return {
      fog: fa, fogColor, t: time, lit: li ? Math.min(1, li.lit) : 0,
      // (k: how much of the light it takes, 1 by default; a black thing that should stay black under a coloured light takes less)
      col: (c, k) => { if (p.worn) c = wornc(c); if (ambient !== 1 && !p.noLight) c = scalec(c, ambient); return rgba(mixc(li ? LIGHT.apply(c, k === undefined ? li : { lit: li.lit * k, color: li.color }) : c, fogColor, fa)); },
      cola: (c, a) => { if (p.worn) c = wornc(c); if (ambient !== 1 && !p.noLight) c = scalec(c, ambient); return rgba(mixc(li ? LIGHT.apply(c, li) : c, fogColor, fa), a); },
      raw: c => rgba(c),
    };
  }

  // a card's axes: across (square to the line from the eye to it, so it faces where you stand and stays put in the world
  // as the view turns) and up the card, which leans from lying flat (or standing) just far enough that the line of sight
  // meets it at CARD_MIN or more
  const CARD_MIN = 50 * DEG;
  // (always square to the line from the eye, wherever it is in the view: it never turns as the view turns)
  function towardEye(x, z) {
    const a = Math.atan2(x - ox, z - oz);
    return [Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a)];
  }
  function cardAxes(x, y, z, flat) {
    const e = Math.atan2(eyeH + oy - y, Math.hypot(x - ox, z - oz));   // how far below the eye it sits, as an angle
    const phi = clamp(flat ? 0 : Math.PI / 2, CARD_MIN - e, Math.PI - CARD_MIN - e);
    const c = Math.cos(phi), t = towardEye(x, z);
    return [t[0], t[1], c * t[2], Math.sin(phi), c * t[3]];
  }
  // A card or decal seen at a slant close by (its near and far parts at very different depths) cannot be drawn on one
  // flat (affine) map: what is nearer the eye comes out too small and what is further off runs on across the view, and
  // with the view turned so that it lies off to one side at your feet it was smeared right across it. It is cut into
  // small triangles instead, each drawn on the flat map that takes its own three corners exactly where the perspective
  // puts them and clipped to its own outline, so neighbouring pieces meet edge to edge; and the whole is cut off just in
  // front of the eye. It is then drawn where it really is however near it lies, and stays put as the view turns.
  const ONE_MAP = 0.1;     // depth that may change across a card drawn on one map, as a share of its nearest depth
  const SPLIT = 0.08;      // and across one of its pieces
  const CUT_Z = 0.08;      // nothing nearer the eye than this is drawn
  const MAX_CELLS = 40;
  const SPLIT_PAD = 0.2;   // how far the pieces run on past the card's edges (as a share of its size), for what its drawing puts there
  function clipUV(poly, z0, zu, zv) {   // the part of a polygon in the card's (u, v) where the depth is CUT_Z or more
    const out = [], n = poly.length, z = q => z0 + q[0] * zu + q[1] * zv;
    for (let i = 0; i < n; i++) {
      const a = poly[i], c = poly[(i + 1) % n], za = z(a), zc = z(c), ain = za >= CUT_Z, cin = zc >= CUT_Z;
      if (ain) out.push(a);
      if (ain !== cin) { const t = (CUT_Z - za) / (zc - za); out.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t]); }
    }
    return out;
  }
  // base: the card's spot in the eye's frame; cu, cv: the eye-frame change per meter across it and up it. Returns its
  // pieces ({ clip: screen outline, m: [a, b, c, d, e, f], the map from the card's meters to the screen }) and the rect it
  // covers (kept to the view), or null when none of it is in front of the eye
  function splitCard(p, base, cu, cv, zmin) {
    const hw = p.w / 2, h = p.h, z0 = base[2], zu = cu[2], zv = cv[2];
    const scr = (u, v) => { const z = z0 + u * zu + v * zv; return [W / 2 + f * (base[0] + u * cu[0] + v * cv[0]) / z, H / 2 - f * (base[1] + u * cu[1] + v * cv[1]) / z]; };
    const whole = clipUV([[-hw, 0], [hw, 0], [hw, h], [-hw, h]], z0, zu, zv);
    if (whole.length < 3) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const q of whole) { const s = scr(q[0], q[1]); x0 = Math.min(x0, s[0]); y0 = Math.min(y0, s[1]); x1 = Math.max(x1, s[0]); y1 = Math.max(y1, s[1]); }
    const mu = SPLIT_PAD * p.w, mv = SPLIT_PAD * h, U0 = -hw - mu, V0 = -mv, UW = p.w + 2 * mu, VH = h + 2 * mv;
    const zr = Math.max(zmin - Math.abs(zu) * mu - Math.abs(zv) * mv, CUT_Z);
    let nu = clamp(Math.ceil(Math.abs(zu) * UW / (SPLIT * zr)), 1, 16), nv = clamp(Math.ceil(Math.abs(zv) * VH / (SPLIT * zr)), 1, 16);
    while (nu * nv > MAX_CELLS) { if (nu >= nv) nu--; else nv--; }
    const cells = [];
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const ua = U0 + UW * i / nu, ub = U0 + UW * (i + 1) / nu, va = V0 + VH * j / nv, vb = V0 + VH * (j + 1) / nv;
      const poly = clipUV([[ua, va], [ub, va], [ub, vb], [ua, vb]], z0, zu, zv);
      for (let k = 1; k + 1 < poly.length; k++) {
        const A = poly[0], B = poly[k], C = poly[k + 1];
        const sa = scr(A[0], A[1]), sb = scr(B[0], B[1]), sc = scr(C[0], C[1]);
        // the flat map taking A, B, C (in meters across and up the card) to where they are seen
        const du1 = B[0] - A[0], dv1 = B[1] - A[1], du2 = C[0] - A[0], dv2 = C[1] - A[1], det = du1 * dv2 - du2 * dv1;
        if (Math.abs(det) < 1e-9) continue;
        const ex1 = sb[0] - sa[0], ey1 = sb[1] - sa[1], ex2 = sc[0] - sa[0], ey2 = sc[1] - sa[1];
        const a = (ex1 * dv2 - ex2 * dv1) / det, b = (ey1 * dv2 - ey2 * dv1) / det;
        const c = (ex2 * du1 - ex1 * du2) / det, d = (ey2 * du1 - ey1 * du2) / det;
        // its outline, pushed out a little all round so that neighbouring pieces meet without a seam
        const mx = (sa[0] + sb[0] + sc[0]) / 3, my = (sa[1] + sb[1] + sc[1]) / 3, clip = [sa, sb, sc];
        for (const s of clip) { const dx = s[0] - mx, dy = s[1] - my, l = Math.hypot(dx, dy) || 1; s[0] += dx / l * 0.6; s[1] += dy / l * 0.6; }
        cells.push({ clip, m: [a, b, c, d, sa[0] - a * A[0] - c * A[1], sa[1] - b * A[0] - d * A[1]] });
      }
    }
    x0 = Math.max(x0, -20); y0 = Math.max(y0, -20); x1 = Math.min(x1, W + 20); y1 = Math.min(y1, H + 20);
    return { cells, rect: { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) } };
  }
  function paintCells(p, cells, s) {
    const P = spriteP(p);
    for (const cell of cells) {
      const q = cell.clip, m = cell.m;
      if (Math.max(q[0][0], q[1][0], q[2][0]) < -2 || Math.min(q[0][0], q[1][0], q[2][0]) > W + 2 || Math.max(q[0][1], q[1][1], q[2][1]) < -2 || Math.min(q[0][1], q[1][1], q[2][1]) > H + 2) continue;   // off the view
      ctx.save();
      ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.closePath();
      ctx.clip();
      ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      if (p.alpha !== undefined) ctx.globalAlpha = p.alpha;
      p.draw(ctx, P, s);
      ctx.restore();
    }
  }
  // glow: draw only its glow (drawGlows), with no hit area
  function drawSprite(p, glow) {
    const onRect = glow ? null : p.onRect;
    if (p.alpha !== undefined && p.alpha <= 0.004) { if (onRect) onRect(null); return; }
    const base = toCam(p.x, p.y, p.z);
    const lying = p.flat || p.card;
    if (base[2] < (lying ? -Math.max(p.w, p.h) : NEAR)) { if (onRect) onRect(null); return; }   // (a card may begin behind the lens and run on in front of it)
    let rect;
    if (lying) {
      // a decal lying on the ground, its "up" pointing away from the viewer; or a card (an item), which stands on its
      // spot facing the eye and tips back toward it so it is never seen edge-on, however near or high it sits
      const t = towardEye(p.x, p.z);   // a decal's "up" runs away from where you stand, not along the view
      let rx = t[0], rz = t[1], fx = t[2], fz = t[3], fy = 0;
      if (p.card) {
        // behind you (only in front of the lens at all because the view is tipped down): not drawn
        if (Math.abs(wrapPi(Math.atan2(p.x - ox, p.z - oz) - yaw)) > 100 * DEG) { if (onRect) onRect(null); return; }
        const c = cardAxes(p.x, p.y, p.z, p.flat);
        rx = c[0]; rz = c[1]; fx = c[2]; fy = c[3]; fz = c[4];
      }
      // it is fixed in the world, facing where you stand, and drawn in plain perspective wherever it is in the view: the
      // eye-frame change per meter across it (cu) and up it (cv), and its depth at its four corners
      const cu = toCam(p.x + rx, p.y, p.z + rz), cv = toCam(p.x + fx, p.y + fy, p.z + fz);
      for (let k = 0; k < 3; k++) { cu[k] -= base[k]; cv[k] -= base[k]; }
      const du = Math.abs(cu[2]) * p.w / 2, dv = cv[2] * p.h;
      const zmin = base[2] - du + Math.min(0, dv), zmax = base[2] + du + Math.max(0, dv);
      const s = f / Math.max(base[2], CUT_Z);
      if (zmin >= NEAR && zmax - zmin <= ONE_MAP * zmin) {
        // seen nearly square on: one map does it, its width measured end to end
        const b = proj(base);
        const p0 = proj([base[0] - cu[0] * p.w / 2, base[1] - cu[1] * p.w / 2, base[2] - cu[2] * p.w / 2]);
        const p1 = proj([base[0] + cu[0] * p.w / 2, base[1] + cu[1] * p.w / 2, base[2] + cu[2] * p.w / 2]);
        const pv = proj([base[0] + cv[0] * p.h, base[1] + cv[1] * p.h, base[2] + cv[2] * p.h]);
        const ax = (p1[0] - p0[0]) / p.w, ay = (p1[1] - p0[1]) / p.w;   // screen delta per meter along u
        const bx = (pv[0] - b[0]) / p.h, by = (pv[1] - b[1]) / p.h;   // per meter along v
        // a card whose top would project below its base is behind or under the eye: not drawn
        if (p.card && by >= 0) { if (onRect) onRect(null); return; }
        // corners of the box centered at x (u from -w/2..w/2), v from 0..h
        const xs = [], ys = [];
        for (const [u, v] of [[-p.w / 2, 0], [p.w / 2, 0], [p.w / 2, p.h], [-p.w / 2, p.h]]) { xs.push(b[0] + ax * u + bx * v); ys.push(b[1] + ay * u + by * v); }
        rect = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
        if (rect.x > W + 20 || rect.x + rect.w < -20 || rect.y > H + 20 || rect.y + rect.h < -20) { if (onRect) onRect(rect); return; }
        if (glow) glowGrow(rect.x - rect.w / 2, rect.y - rect.h / 2, rect.x + rect.w * 1.5, rect.y + rect.h * 1.5);
        ctx.save();
        ctx.transform(ax, ay, bx, by, b[0], b[1]);
        if (p.alpha !== undefined) ctx.globalAlpha = p.alpha;
        p.draw(ctx, spriteP(p), s);
        ctx.restore();
      } else {
        // seen at a slant close by: cut into cells, in true perspective
        const sc = splitCard(p, base, cu, cv, zmin);
        if (!sc) { if (onRect) onRect(null); return; }
        rect = sc.rect;
        if (rect.w <= 0 || rect.h <= 0) { if (onRect) onRect(rect); return; }
        if (glow) glowGrow(rect.x - rect.w / 2, rect.y - rect.h / 2, rect.x + rect.w * 1.5, rect.y + rect.h * 1.5);
        paintCells(p, sc.cells, s);
      }
      if (glow) return;
    } else {
      const b = proj(base);
      const s = f / base[2];
      const top = toCam(p.x, p.y + p.h, p.z);
      let hpx = p.h * s;
      if (top[2] >= NEAR) { const tp = proj(top); hpx = Math.max(0.5, b[1] - tp[1]); }
      const wpx = p.w * s;
      rect = { x: b[0] - wpx / 2, y: b[1] - hpx, w: wpx, h: hpx };
      if (rect.x > W + 40 || rect.x + rect.w < -40 || rect.y > H + 40 || rect.y + rect.h < -40) { if (onRect) onRect(rect); return; }
      if (hpx < 0.7 && wpx < 0.7) { if (onRect) onRect(rect); return; }
      if (glow) { glowGrow(rect.x - rect.w / 2, rect.y - rect.h / 2, rect.x + rect.w * 1.5, rect.y + rect.h * 1.5); ctx.save(); if (p.alpha !== undefined) ctx.globalAlpha = p.alpha; ctx.translate(b[0], b[1]); ctx.scale(s, -(hpx / p.h)); p.draw(ctx, spriteP(p), s); ctx.restore(); return; }
      ctx.save();
      ctx.translate(b[0], b[1]);
      ctx.scale(s, -(hpx / p.h));
      if (p.alpha !== undefined) ctx.globalAlpha = p.alpha;
      p.draw(ctx, spriteP(p), s);
      ctx.restore();
    }
    if (p.hit) {
      const m = p.hitPad || 0;
      hits.push({ x: rect.x - m, y: rect.y - m + viewY, w: rect.w + 2 * m, h: rect.h + 2 * m, kind: p.hit.kind, ref: p.hit.ref });
    }
    if (onRect) onRect(rect);
  }

  function flush() {
    if (!moving && contacts.size) for (const p of list) settleDynamic(p);   // an item on a table, a chain on a wall: drawn after what it touches
    list.sort(order);
    const k = (W / 2) / f, sp = Math.sin(pitch), cp = Math.cos(pitch);
    // with the eye away from where it started the statics are sorted again by distance from it, and only the attached
    // ones can be culled by angle (the culling extents are measured from where it started)
    let src = statics;
    if (moving) { moved.length = 0; for (const p of statics) { fromEye(p); moved.push(p); } moved.sort(order); src = moved; }
    let i = 0, j = 0, glowed = !hoverRef;
    while (i < src.length || j < list.length) {
      let p;
      if (j >= list.length || (i < src.length && order(src[i], list[j]) <= 0)) {
        p = src[i++];
        if (!p.noCull && (!moving || p.attach) && culled(p, k, sp, cp)) continue;
      } else p = list[j++];
      if (moving) offsetFor(p.attach);
      const on = !!hoverRef && lit(p);
      if (p.hoverOnly && !on) continue;   // a piece drawn only while what it belongs to is hovered (the fuse in its box)
      if (on && !glowed) { glowed = true; drawGlows([src, list], p); }
      if (p.kind === 'poly') drawPoly(p); else drawSprite(p);
    }
    if (moving) offsetFor(false);
    list.length = 0;
  }

  // ---- screen-space post effects ----
  function post(fx) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, viewY * DPR);
    if (viewY) { ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); }
    if (moving) offsetFor(true);   // the rain falls round the eye, wherever it has gone
    WEATHER.draw(ctx);
    if (moving) offsetFor(false);
    // radial glow (headlights, lantern) requested by the level; one flagged attach rides with the eye
    if (fx.glows) for (const g of fx.glows) {
      if (moving) offsetFor(g.attach);
      const sp = screenPos(g.x, g.y, g.z);
      if (moving) offsetFor(false);
      if (!sp) continue;
      const r = g.r * sp.scale;
      const grd = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, Math.max(1, r));
      grd.addColorStop(0, rgba(g.color, g.a)); grd.addColorStop(1, rgba(g.color, 0));
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grd; ctx.fillRect(sp.x - r, sp.y - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (fx.drawOverlay) fx.drawOverlay(ctx, W, H);
    // vignette
    ctx.globalAlpha = fx.vignette === undefined ? 0.9 : fx.vignette; // lighter for the morning
    ctx.drawImage(vignette, 0, 0, W, H);
    ctx.globalAlpha = 1;
    // danger pulse (red edge)
    if (fx.danger > 0.001) {
      if (!dangerCv || dangerCvSize !== W * 10000 + H) {
        dangerCv = document.createElement('canvas'); dangerCv.width = W; dangerCv.height = H; dangerCvSize = W * 10000 + H;
        const dc = dangerCv.getContext('2d');
        const g = dc.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7);
        g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, 'rgba(120,0,0,1)');
        dc.fillStyle = g; dc.fillRect(0, 0, W, H);
      }
      ctx.globalAlpha = (fx.dangerCap || 0.75) * fx.danger; ctx.drawImage(dangerCv, 0, 0); ctx.globalAlpha = 1;
    }
    // film grain
    grainIdx = (grainIdx + 1) & 3;
    ctx.globalAlpha = fx.grain === undefined ? 0.07 : fx.grain;
    const pat = ctx.createPattern(grains[grainIdx], 'repeat');
    ctx.fillStyle = pat;
    ctx.save(); ctx.translate((Math.random() * 160) | 0, (Math.random() * 160) | 0); ctx.fillRect(-160, -160, W + 320, H + 320); ctx.restore();
    ctx.globalAlpha = 1;
    // flashes / fades
    if (fx.flash > 0.001) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(fx.flash, fx.flashCap || 1) + ')'; ctx.fillRect(0, 0, W, H); }
    if (fx.fade > 0.001) { ctx.fillStyle = 'rgba(0,0,0,' + fx.fade + ')'; ctx.fillRect(0, 0, W, H); }
    if (fx.white > 0.001) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, fx.white) + ')'; ctx.fillRect(0, 0, W, H); }
  }

  return {
    attach, resize, begin, add, prepare, flush, post, screenPos, projectRect, fogAmt,
    get W() { return W; }, get H() { return H; }, get f() { return f; }, get ctx() { return ctx; }, get viewY() { return viewY; }, get pageH() { return pageH; },
    get hits() { return hits; },
    get detail() { return detailOn; }, set detail(v) { detailOn = !!v; },
    get statics() { return statics; }, isCulledFace: culledFace,   // for scripts that check the drawing order: the prepared statics, and whether a box face is turned away
    set hover(v) { hoverRef = v; },
    // the renderables added until glowAs(null) are pieces of t's drawing: they glow with it when it is hovered
    glowAs(t) { glowAs = t || null; },
    get yaw() { return yaw; },
  };
})();
