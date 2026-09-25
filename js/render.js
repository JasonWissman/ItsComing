'use strict';
// ---------- a tiny painter's-algorithm 3D renderer on Canvas 2D ----------
// World: x = east, y = up, z = north. The eye is always at (0, eyeH, 0).
// Yaw 0 faces north (+z), increases clockwise. Pitch > 0 looks down.
const R = (() => {
  const NEAR = 0.05;
  const VFOV = 62 * DEG;
  let canvas = null, ctx = null, W = 1, H = 1, DPR = 1, pageW = 1, pageH = 1, viewY = 0;
  let f = 1, cosY = 1, sinY = 0, cosP = 1, sinP = 0, eyeH = 1.65, pitch = 0, yaw = 0, zoom = 1;
  let pal = null, fogDist = 100, fogColor = [0, 0, 0];
  let list = [];      // dynamic renderables this frame
  let statics = [];   // the level's static props, sorted once, culled by view angle per frame
  let hits = [];
  let hoverRef = null;
  let time = 0;
  let vignette = null, grains = [], grainIdx = 0;

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
    time = t;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (viewY) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, pageW, pageH); ctx.translate(0, viewY); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); }
    yaw = cam.yaw; pitch = cam.pitch; zoom = cam.zoom;
    cosY = Math.cos(yaw); sinY = Math.sin(yaw); cosP = Math.cos(pitch); sinP = Math.sin(pitch);
    f = (H / 2) / Math.tan(VFOV / 2) * zoom;
    eyeH = level.eyeH; pal = level.pal; fogDist = pal.fogDist; fogColor = pal.fog;
    list.length = 0; hits.length = 0;
    // shake: applied as a translation of the whole scene
    if (cam.shakeX || cam.shakeY) ctx.translate(cam.shakeX, cam.shakeY);
    drawSkyGround();
  }

  function drawSkyGround() {
    const step = H > 900 ? 4 : 3;
    const skyTop = pal.skyTop, ground = pal.ground, fog = pal.fog;
    for (let y = -4; y < H + 4; y += step) {
      const ang = Math.atan2(H / 2 - (y + step / 2), f) - pitch; // >0 above horizon
      let col;
      if (ang > 0) {
        const k = clamp(ang / (Math.PI / 2.6), 0, 1);
        col = mixc(fog, skyTop, Math.pow(k, 0.6));
      } else {
        const d = eyeH / Math.tan(-ang);
        col = mixc(ground, fog, fogAmt(d));
      }
      ctx.fillStyle = rgba(col);
      ctx.fillRect(-8, y, W + 16, step + 1);
    }
  }

  // ---- transforms ----
  function toCam(x, y, z) {
    const dy = y - eyeH;
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
  // one ({yaw, pitch, zoom, W, H, eyeH}); pure math, used by the approach-lane visibility test
  function projectRect(x, y, z, w, h, cam) {
    let cy = cosY, sy = sinY, cp = cosP, sp = sinP, ff = f, eh = eyeH, Wd = W, Hd = H;
    if (cam) {
      cy = Math.cos(cam.yaw); sy = Math.sin(cam.yaw); cp = Math.cos(cam.pitch); sp = Math.sin(cam.pitch);
      Wd = cam.W; Hd = cam.H; eh = cam.eyeH; ff = (Hd / 2) / Math.tan(VFOV / 2) * (cam.zoom || 1);
    }
    const tc = (px, py, pz) => { const dy = py - eh; const cx = px * cy - pz * sy; const cz = px * sy + pz * cy; return [cx, dy * cp + cz * sp, -dy * sp + cz * cp]; };
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
  // sprite: {kind:'sprite', x,y,z, w,h, draw(ctx,P), flat?, noFog?, layer?, hit?, dist?, fogScale?, onRect?}
  function measure(p) {
    if (p.dist === undefined) {
      if (p.kind === 'poly') {
        let s = 0;
        for (const v of p.pts) s += Math.hypot(v[0], v[2]);
        p.dist = s / p.pts.length;
      } else p.dist = Math.hypot(p.x, p.z);
    }
    if (p.layer === undefined) p.layer = 1;
  }
  function add(p) { measure(p); list.push(p); }
  // angular extent of a static prop around the eye, for view culling
  function extent(p) {
    let sx = 0, sz = 0;
    const angles = [];
    if (p.kind === 'poly') { for (const v of p.pts) { const a = Math.atan2(v[0], v[2]); angles.push(a); sx += Math.sin(a); sz += Math.cos(a); } }
    else { const a = Math.atan2(p.x, p.z), half = Math.atan2(Math.max(p.w, p.h) * 0.6, Math.max(0.1, p.dist)); angles.push(a - half, a + half); sx = Math.sin(a); sz = Math.cos(a); }
    const center = Math.atan2(sx, sz);
    let half = 0;
    for (const a of angles) half = Math.max(half, Math.abs(wrapPi(a - center)));
    p.aCenter = center; p.aHalf = half;
    p.noCull = half > 1.3 || p.dist < 4;   // near props can show at the bottom edge when looking down
  }
  const order = (a, b) => (a.layer - b.layer) || (b.dist - a.dist);
  // register a level's static props: measured, given an extent, sorted once
  function prepare(props) {
    for (const p of props) { measure(p); extent(p); }
    statics = props.slice().sort(order);
  }

  function drawPoly(p) {
    let cs = new Array(p.pts.length);
    let anyIn = false;
    for (let i = 0; i < p.pts.length; i++) { const v = p.pts[i]; cs[i] = toCam(v[0], v[1], v[2]); if (cs[i][2] >= NEAR) anyIn = true; }
    if (!anyIn) return;
    cs = clipNear(cs);
    if (cs.length < 2) return;
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    ctx.beginPath();
    for (let i = 0; i < cs.length; i++) {
      const s = proj(cs[i]);
      if (s[0] < minx) minx = s[0]; if (s[0] > maxx) maxx = s[0];
      if (s[1] < miny) miny = s[1]; if (s[1] > maxy) maxy = s[1];
      i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]);
    }
    if (maxx < -20 || minx > W + 20 || maxy < -20 || miny > H + 20) return;
    if (p.hit) hits.push({ x: minx, y: miny + viewY, w: maxx - minx, h: maxy - miny, kind: p.hit.kind, ref: p.hit.ref });
    if (p.invisible) {
      if (hoverRef && p.hit && p.hit.ref === hoverRef) {
        ctx.closePath(); ctx.strokeStyle = 'rgba(255,240,210,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      return;
    }
    const col = p.noFog ? p.color : fogged(p.color, p.dist);
    if (p.alpha !== undefined) ctx.globalAlpha = p.alpha;
    if (p.stroke) {
      ctx.strokeStyle = rgba(col); ctx.lineWidth = Math.max(0.6, (p.lw || 0.02) * f / Math.max(NEAR, cs[0][2]));
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    } else { ctx.closePath(); ctx.fillStyle = rgba(col); ctx.fill(); }
    if (p.alpha !== undefined) ctx.globalAlpha = 1;
    if (hoverRef && p.hit && p.hit.ref === hoverRef) { ctx.strokeStyle = 'rgba(255,240,210,0.35)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  }

  function spriteP(p) {
    const fa = p.noFog ? 0 : fogAmt(p.dist) * (p.fogScale === undefined ? 1 : p.fogScale);
    return {
      fog: fa, fogColor, t: time,
      col: c => rgba(mixc(c, fogColor, fa)),
      cola: (c, a) => rgba(mixc(c, fogColor, fa), a),
      raw: c => rgba(c),
    };
  }

  function drawSprite(p) {
    const base = toCam(p.x, p.y, p.z);
    if (base[2] < NEAR) { if (p.onRect) p.onRect(null); return; }
    const b = proj(base);
    const s = f / base[2];
    let rect;
    if (p.flat) {
      // decal lying on the ground, oriented so its "up" points away from the viewer
      const rx = cosY, rz = -sinY, fx = sinY, fz = cosY;
      const cu = toCam(p.x + rx * p.w, p.y, p.z + rz * p.w);
      const cv = toCam(p.x + fx * p.h, p.y, p.z + fz * p.h);
      if (cu[2] < NEAR || cv[2] < NEAR) { if (p.onRect) p.onRect(null); return; }
      const pu = proj(cu), pv = proj(cv);
      const ax = (pu[0] - b[0]) / p.w, ay = (pu[1] - b[1]) / p.w;   // screen delta per meter along u
      const bx = (pv[0] - b[0]) / p.h, by = (pv[1] - b[1]) / p.h;   // per meter along v
      // corners of the box centered at x (u from -w/2..w/2), v from 0..h
      const xs = [], ys = [];
      for (const [u, v] of [[-p.w / 2, 0], [p.w / 2, 0], [p.w / 2, p.h], [-p.w / 2, p.h]]) { xs.push(b[0] + ax * u + bx * v); ys.push(b[1] + ay * u + by * v); }
      rect = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
      if (rect.x > W + 20 || rect.x + rect.w < -20 || rect.y > H + 20 || rect.y + rect.h < -20) { if (p.onRect) p.onRect(rect); return; }
      ctx.save();
      ctx.transform(ax, ay, bx, by, b[0], b[1]);
      p.draw(ctx, spriteP(p), s);
      ctx.restore();
    } else {
      const top = toCam(p.x, p.y + p.h, p.z);
      let hpx = p.h * s;
      if (top[2] >= NEAR) { const tp = proj(top); hpx = Math.max(0.5, b[1] - tp[1]); }
      const wpx = p.w * s;
      rect = { x: b[0] - wpx / 2, y: b[1] - hpx, w: wpx, h: hpx };
      if (rect.x > W + 40 || rect.x + rect.w < -40 || rect.y > H + 40 || rect.y + rect.h < -40) { if (p.onRect) p.onRect(rect); return; }
      if (hpx < 0.7 && wpx < 0.7) { if (p.onRect) p.onRect(rect); return; }
      ctx.save();
      ctx.translate(b[0], b[1]);
      ctx.scale(s, -(hpx / p.h));
      p.draw(ctx, spriteP(p), s);
      ctx.restore();
    }
    if (p.hit) {
      const m = p.hitPad || 0;
      hits.push({ x: rect.x - m, y: rect.y - m + viewY, w: rect.w + 2 * m, h: rect.h + 2 * m, kind: p.hit.kind, ref: p.hit.ref });
      if (hoverRef && p.hit.ref === hoverRef && !p.noHover) {
        ctx.strokeStyle = 'rgba(255,240,210,0.45)'; ctx.lineWidth = 1.5;
        ctx.strokeRect(rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6);
      }
    }
    if (p.onRect) p.onRect(rect);
  }

  function flush() {
    list.sort(order);
    const hfov = Math.atan((W / 2) / f) + 0.12;
    let i = 0, j = 0;
    while (i < statics.length || j < list.length) {
      let p;
      if (j >= list.length || (i < statics.length && order(statics[i], list[j]) <= 0)) {
        p = statics[i++];
        if (!p.noCull && Math.abs(wrapPi(p.aCenter - yaw)) > p.aHalf + hfov) continue;
      } else p = list[j++];
      if (p.kind === 'poly') drawPoly(p); else drawSprite(p);
    }
    list.length = 0;
  }

  // ---- screen-space post effects ----
  function post(fx) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, viewY * DPR);
    if (viewY) { ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); }
    // radial glow (headlights, lantern) requested by the level
    if (fx.glows) for (const g of fx.glows) {
      const sp = screenPos(g.x, g.y, g.z);
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
    ctx.globalAlpha = 0.9;
    ctx.drawImage(vignette, 0, 0, W, H);
    ctx.globalAlpha = 1;
    // danger pulse (red edge)
    if (fx.danger > 0.001) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7);
      g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, 'rgba(120,0,0,' + ((fx.dangerCap || 0.75) * fx.danger) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
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
  }

  return {
    attach, resize, begin, add, prepare, flush, post, screenPos, projectRect, fogAmt,
    get W() { return W; }, get H() { return H; }, get f() { return f; }, get ctx() { return ctx; }, get viewY() { return viewY; }, get pageH() { return pageH; },
    get hits() { return hits; },
    set hover(v) { hoverRef = v; },
    get yaw() { return yaw; },
  };
})();
