'use strict';
// ---------- item icons. Each draws inside a unit box: x in [-0.5,0.5], y in [0,1], +y up ----------
const ICONS = {
  hammer(ctx, P) {
    ctx.save(); ctx.rotate(-0.55);
    P_rect(ctx, -0.055, 0.0, 0.11, 0.78, P.col([112, 80, 46]));
    P_rect(ctx, -0.055, 0.0, 0.11, 0.2, P.col([60, 44, 30]));
    P_rect(ctx, -0.3, 0.72, 0.6, 0.24, P.col([78, 78, 84]));
    P_rect(ctx, -0.3, 0.72, 0.18, 0.24, P.col([52, 52, 58]));
    P_rect(ctx, 0.1, 0.72, 0.2, 0.24, P.col([96, 96, 102]));
    ctx.restore();
  },
  planks(ctx, P) {
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.translate(0, 0.14 + i * 0.3); ctx.rotate((i - 1) * 0.07);
      P_rect(ctx, -0.48, -0.1, 0.96, 0.2, P.col(i % 2 ? [124, 94, 58] : [104, 76, 46]));
      P_line(ctx, -0.4, 0.02, 0.4, 0.0, 0.012, P.col([78, 56, 32]));
      P_line(ctx, -0.3, -0.05, 0.35, -0.04, 0.008, P.col([78, 56, 32]));
      ctx.restore();
    }
  },
  keys(ctx, P) {
    const m = P.col([176, 166, 122]), d = P.col([120, 110, 76]);
    ctx.strokeStyle = m; ctx.lineWidth = 0.07; ctx.beginPath(); ctx.arc(0, 0.72, 0.19, 0, TAU); ctx.stroke();
    for (const [dx, rot] of [[-0.1, 0.25], [0.12, -0.2]]) {
      ctx.save(); ctx.translate(dx, 0.56); ctx.rotate(rot);
      P_line(ctx, 0, 0, 0, -0.5, 0.08, m);
      P_line(ctx, 0.0, -0.48, 0.14, -0.48, 0.07, m);
      P_line(ctx, 0.0, -0.36, 0.11, -0.36, 0.06, m);
      P_ell(ctx, 0, 0, 0.1, 0.1, d);
      ctx.restore();
    }
  },
  salt(ctx, P) {
    const paper = P.col([214, 208, 190]), blue = P.col([50, 70, 130]), dark = P.col([140, 130, 110]);
    ctx.fillStyle = paper; ctx.beginPath();
    ctx.moveTo(-0.32, 0.02); ctx.lineTo(0.32, 0.02); ctx.lineTo(0.3, 0.72); ctx.quadraticCurveTo(0.22, 0.9, 0.0, 0.92);
    ctx.quadraticCurveTo(-0.22, 0.9, -0.3, 0.72); ctx.closePath(); ctx.fill();
    P_rect(ctx, -0.3, 0.3, 0.6, 0.18, blue);
    P_line(ctx, -0.26, 0.6, 0.26, 0.6, 0.02, dark);
    P_ell(ctx, 0, 0.39, 0.1, 0.06, paper);
    P_ell(ctx, 0.26, 0.06, 0.16, 0.05, P.col([236, 234, 228]));
  },
  matches(ctx, P) {
    const box = P.col([120, 38, 30]), tan = P.col([200, 176, 130]), stick = P.col([196, 170, 120]), head = P.col([150, 30, 30]);
    ctx.save(); ctx.rotate(0.15);
    P_rect(ctx, -0.36, 0.12, 0.72, 0.42, box);
    P_rect(ctx, -0.36, 0.12, 0.72, 0.12, tan);
    P_line(ctx, -0.3, 0.42, 0.3, 0.42, 0.03, P.col([70, 20, 18]));
    for (let i = 0; i < 3; i++) {
      P_line(ctx, 0.05 + i * 0.09, 0.5, 0.18 + i * 0.09, 0.86, 0.03, stick);
      P_ell(ctx, 0.19 + i * 0.09, 0.88, 0.03, 0.035, head);
    }
    ctx.restore();
  },
  lantern(ctx, P) {
    const frame = P.col([30, 28, 30]), glass = P.col([90, 84, 70]), wax = P.col([230, 224, 200]);
    P_rect(ctx, -0.26, 0.05, 0.52, 0.06, frame);
    P_rect(ctx, -0.22, 0.1, 0.44, 0.62, glass);
    P_rect(ctx, -0.26, 0.7, 0.52, 0.07, frame);
    for (const x of [-0.24, 0.24]) P_rect(ctx, x - 0.025, 0.1, 0.05, 0.62, frame);
    ctx.strokeStyle = frame; ctx.lineWidth = 0.04; ctx.beginPath(); ctx.arc(0, 0.78, 0.14, Math.PI, 0, true); ctx.stroke();
    P_rect(ctx, -0.07, 0.14, 0.14, 0.28, wax);
    P_line(ctx, 0, 0.42, 0, 0.47, 0.02, frame);
    if (P.lit) {
      const g = ctx.createRadialGradient(0, 0.5, 0.02, 0, 0.5, 0.5);
      g.addColorStop(0, 'rgba(255,220,140,0.95)'); g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1);
      P_ell(ctx, 0, 0.53 + Math.sin(P.t * 23) * 0.01, 0.035, 0.07 + Math.sin(P.t * 17) * 0.012, P.raw([255, 235, 170]));
    }
  },
  chain(ctx, P) {
    const m = P.col([80, 78, 74]);
    ctx.strokeStyle = m; ctx.lineWidth = 0.035;
    for (let i = 0; i < 8; i++) {
      const u = i / 7; const x = -0.42 + u * 0.84; const y = 0.55 + Math.sin(u * Math.PI) * -0.3;
      ctx.beginPath(); ctx.ellipse(x, y, 0.09, 0.05, (i % 2) * 1.2 + 0.4, 0, TAU); ctx.stroke();
    }
  },
  padlock(ctx, P) {
    const brass = P.col([150, 128, 60]), dark = P.col([40, 34, 20]), steel = P.col([120, 120, 118]);
    ctx.strokeStyle = steel; ctx.lineWidth = 0.08; ctx.beginPath(); ctx.arc(0, 0.6, 0.2, Math.PI, 0, true); ctx.stroke();
    P_rect(ctx, -0.3, 0.1, 0.6, 0.5, brass);
    P_ell(ctx, 0, 0.4, 0.06, 0.06, dark); P_rect(ctx, -0.02, 0.22, 0.04, 0.18, dark);
  },
  shotgun(ctx, P) {
    const steel = P.col([48, 48, 54]), wood = P.col([90, 60, 36]);
    ctx.save(); ctx.translate(0, 0.45); ctx.rotate(0.06);
    P_rect(ctx, -0.5, 0.02, 0.62, 0.05, steel);
    P_rect(ctx, -0.5, -0.04, 0.62, 0.05, steel);
    P_rect(ctx, -0.42, -0.1, 0.24, 0.07, wood);
    ctx.fillStyle = wood; ctx.beginPath(); ctx.moveTo(0.12, 0.07); ctx.lineTo(0.28, 0.07); ctx.lineTo(0.5, -0.06); ctx.lineTo(0.5, -0.16); ctx.lineTo(0.36, -0.16); ctx.lineTo(0.12, -0.06); ctx.closePath(); ctx.fill();
    P_ell(ctx, 0.14, -0.1, 0.05, 0.035, steel);
    ctx.restore();
  },
  shells(ctx, P) {
    const card = P.col([120, 92, 60]), red = P.col([160, 30, 30]), brass = P.col([170, 140, 70]);
    P_rect(ctx, -0.32, 0.05, 0.64, 0.4, card);
    P_rect(ctx, -0.32, 0.38, 0.64, 0.08, P.col([90, 66, 40]));
    for (let i = 0; i < 3; i++) { const x = -0.2 + i * 0.2; P_rect(ctx, x - 0.06, 0.42, 0.12, 0.36, red); P_rect(ctx, x - 0.06, 0.42, 0.12, 0.1, brass); }
  },
  bottle(ctx, P) {
    const g = P.col([40, 70, 40]), hl = P.col([120, 160, 110]);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-0.22, 0.02); ctx.lineTo(0.22, 0.02); ctx.lineTo(0.22, 0.55); ctx.lineTo(0.08, 0.72); ctx.lineTo(0.08, 0.96); ctx.lineTo(-0.08, 0.96); ctx.lineTo(-0.08, 0.72); ctx.lineTo(-0.22, 0.55); ctx.closePath(); ctx.fill();
    P_line(ctx, -0.13, 0.1, -0.13, 0.5, 0.03, hl);
  },
  rope(ctx, P) {
    const r = P.col([150, 130, 90]);
    ctx.strokeStyle = r; ctx.lineWidth = 0.07;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0.45, 0.36 - i * 0.07, 0.2 - i * 0.03, 0, 0, TAU); ctx.stroke(); }
  }
};

// ---------- scenery builders: everything is pushed into L.props in the level's local frame ----------
const SC = {
  quad(L, a, b, c, d, color, opts) {
    L.props.push(Object.assign({ kind: 'poly', pts: [L.pt(a[0], a[1], a[2]), L.pt(b[0], b[1], b[2]), L.pt(c[0], c[1], c[2]), L.pt(d[0], d[1], d[2])], color }, opts || {}));
  },
  // vertical quad from (x0,z0) to (x1,z1), y0..y1
  wallV(L, x0, z0, x1, z1, y0, y1, color, opts) { SC.quad(L, [x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0], color, opts); },
  // horizontal quad on the ground plane
  floorQ(L, x0, z0, x1, z1, y, color, opts) { SC.quad(L, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], color, Object.assign({ layer: 0 }, opts || {})); },
  box(L, x0, x1, y0, y1, z0, z1, color, opts) {
    const side = scalec(color, 0.78), side2 = scalec(color, 0.66), top = scalec(color, 1.08);
    SC.quad(L, [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], side, opts);
    SC.quad(L, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], side, opts);
    SC.quad(L, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], side2, opts);
    SC.quad(L, [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], side2, opts);
    SC.quad(L, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], top, opts);
  },
  sprite(L, x, y, z, w, h, draw, opts) {
    const p = L.pt(x, y, z);
    const s = Object.assign({ kind: 'sprite', x: p[0], y: p[1], z: p[2], w, h, draw }, opts || {});
    L.props.push(s); return s;
  },
  // trees: 'bare' (winter deciduous), 'fir', 'round'
  tree(L, x, z, h, kind, seed) {
    const rng = mulberry32(seed | 0);
    const w = kind === 'fir' ? h * 0.45 : h * 0.8;
    const branches = [];
    if (kind === 'bare') {
      for (let i = 0; i < 9; i++) {
        const y0 = 0.35 + rng() * 0.45, a = (rng() - 0.5) * 2.2, len = 0.18 + rng() * 0.3;
        branches.push([y0, a, len, (rng() - 0.5) * 1.5]);
      }
    }
    const blobs = [];
    if (kind === 'round') for (let i = 0; i < 6; i++) blobs.push([(rng() - 0.5) * 0.5, 0.55 + rng() * 0.35, 0.18 + rng() * 0.16]);
    const trunkC = [26, 22, 20], leafC = kind === 'fir' ? [14, 22, 18] : [20, 18, 18];
    return SC.sprite(L, x, 0, z, w, h, (ctx, P) => {
      ctx.scale(w, h);
      const tc = P.col(trunkC), lc = P.col(leafC);
      if (kind === 'fir') {
        P_rect(ctx, -0.04, 0, 0.08, 0.3, tc);
        for (let i = 0; i < 4; i++) { const y = 0.12 + i * 0.22, ww = 0.5 - i * 0.1; P_poly(ctx, [[-ww, y], [ww, y], [0, y + 0.42]], lc); }
      } else if (kind === 'bare') {
        P_line(ctx, 0, 0, 0.02, 0.75, 0.07, tc);
        for (const [y0, a, len, a2] of branches) {
          const x1 = Math.sin(a) * len, y1 = y0 + Math.cos(a) * len;
          P_line(ctx, 0.01, y0, x1, y1, 0.03, tc);
          P_line(ctx, x1, y1, x1 + Math.sin(a + a2) * len * 0.6, y1 + Math.cos(a + a2) * len * 0.6, 0.018, tc);
        }
        P_line(ctx, 0.02, 0.75, 0.05, 0.98, 0.03, tc);
      } else {
        P_line(ctx, 0, 0, 0, 0.5, 0.08, tc);
        for (const [bx, by, br] of blobs) P_ell(ctx, bx, by, br, br * 0.9, lc);
      }
    });
  },
  fenceLine(L, x0, z0, x1, z1, spacing, postH, color) {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / spacing));
    const dx = (x1 - x0) / n, dz = (z1 - z0) / n;
    for (let i = 0; i <= n; i++) {
      const x = x0 + dx * i, z = z0 + dz * i;
      SC.sprite(L, x, 0, z, 0.14, postH, (ctx, P) => { ctx.scale(0.14, postH); P_rect(ctx, -0.5, 0, 1, 1, P.col(color)); });
    }
    // rails, split into segments so fog is right
    const seg = Math.max(1, Math.round(len / 12));
    for (let i = 0; i < seg; i++) {
      const a = i / seg, b = (i + 1) / seg;
      for (const yy of [postH * 0.45, postH * 0.85])
        SC.wallV(L, x0 + (x1 - x0) * a, z0 + (z1 - z0) * a, x0 + (x1 - x0) * b, z0 + (z1 - z0) * b, yy - 0.05, yy + 0.05, color);
    }
  },
  gravestone(L, x, z, seed) {
    const rng = mulberry32(seed | 0);
    const h = 0.7 + rng() * 0.7, w = 0.45 + rng() * 0.35, tilt = (rng() - 0.5) * 0.25, kind = rng() < 0.25 ? 'cross' : 'stone';
    const v = rng() * 24; const c = [82 + v, 82 + v, 78 + v];
    return SC.sprite(L, x, 0, z, w * 1.3, h, (ctx, P) => {
      ctx.rotate(tilt); ctx.scale(w, h);
      const col = P.col(c), dark = P.col(scalec(c, 0.6));
      if (kind === 'cross') { P_rect(ctx, -0.1, 0, 0.2, 1, col); P_rect(ctx, -0.5, 0.62, 1, 0.16, col); }
      else {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.lineTo(0.5, 0); ctx.lineTo(0.5, 0.7); ctx.arc(0, 0.7, 0.5, 0, Math.PI, false); ctx.closePath(); ctx.fill();
        P_line(ctx, -0.25, 0.5, 0.25, 0.5, 0.02, dark); P_line(ctx, -0.2, 0.38, 0.2, 0.38, 0.02, dark);
      }
    });
  },
  boulder(L, x, z, size, seed) {
    const rng = mulberry32(seed | 0);
    const pts = []; const n = 7;
    for (let i = 0; i < n; i++) { const a = Math.PI * (i / (n - 1)); pts.push([Math.cos(a) * 0.5 * (0.8 + rng() * 0.3), Math.sin(a) * (0.5 + rng() * 0.5)]); }
    const v = rng() * 30; const c = [78 + v, 80 + v, 80 + v];
    return SC.sprite(L, x, 0, z, size * 1.2, size, (ctx, P) => { ctx.scale(size * 1.2, size); P_poly(ctx, pts, P.col(c)); });
  },
  road(L, x0, x1, z0, z1, color, segs, lit) {
    for (let i = 0; i < segs; i++) {
      const a = z0 + (z1 - z0) * Math.pow(i / segs, 1.6), b = z0 + (z1 - z0) * Math.pow((i + 1) / segs, 1.6);
      const k = lit ? lit((a + b) / 2) : 0;
      SC.floorQ(L, x0, a, x1, b, 0.01, mixc(color, [150, 140, 115], k * 0.8));
    }
  },
  groundDots(L, seed, n, minD, maxD, arcDeg, color, size) {
    const rng = mulberry32(seed | 0);
    for (let i = 0; i < n; i++) {
      const a = (rng() - 0.5) * arcDeg * DEG, d = minD + Math.pow(rng(), 1.5) * (maxD - minD);
      const x = Math.sin(a) * d, z = Math.cos(a) * d, s = size * (0.5 + rng());
      SC.floorQ(L, x - s, z - s * 0.4, x + s, z + s * 0.4, 0.008, color);
    }
  },
  moon(L, yawDeg, elevDeg, r, color) {
    const D = 700;
    const x = Math.sin(yawDeg * DEG) * D * Math.cos(elevDeg * DEG), z = Math.cos(yawDeg * DEG) * D * Math.cos(elevDeg * DEG), y = Math.sin(elevDeg * DEG) * D;
    const gw = r * 9;
    L.props.push({ kind: 'sprite', x, y, z, w: gw, h: gw, noFog: true, layer: 0, dist: D, draw: (ctx, P) => {
      const g = ctx.createRadialGradient(0, gw / 2, r * 0.9, 0, gw / 2, gw / 2);
      g.addColorStop(0, rgba(color, 0.32)); g.addColorStop(0.35, rgba(color, 0.08)); g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g; ctx.fillRect(-gw / 2, 0, gw, gw);
      P_ell(ctx, 0, gw / 2, r, r, rgba(color));
      P_ell(ctx, -r * 0.3, gw / 2 + r * 0.2, r * 0.22, r * 0.18, rgba(scalec(color, 0.85)));
      P_ell(ctx, r * 0.25, gw / 2 - r * 0.3, r * 0.16, r * 0.14, rgba(scalec(color, 0.88)));
    } });
  },
  clouds(L, seed, n, color, alpha) {
    const rng = mulberry32(seed | 0);
    for (let i = 0; i < n; i++) {
      const yaw0 = rng() * TAU, el = (8 + rng() * 30) * DEG, D = 800, w = 120 + rng() * 260, h = w * (0.18 + rng() * 0.15), drift = (0.002 + rng() * 0.004) * (rng() < 0.5 ? -1 : 1);
      const a = alpha === undefined ? 0.35 : alpha;
      const blobs = []; for (let k = 0; k < 4; k++) blobs.push([(rng() - 0.5) * 0.7, rng() * 0.4, 0.25 + rng() * 0.3]);
      const c = { kind: 'sprite', x: 0, y: Math.sin(el) * D, z: 0, w, h, noFog: true, noLight: true, layer: 0, dist: D, yaw0, drift, draw: (ctx, P) => {
        ctx.scale(w, h);
        for (const [bx, by, br] of blobs) P_ell(ctx, bx, by, br, br * 0.9, rgba(color, a * (LIGHT.global > 0.01 ? 1.6 : 1)));
      } };
      L.clouds = L.clouds || []; L.clouds.push(c);
    }
  },
  stars(L, seed, n, alpha) {
    const rng = mulberry32(seed | 0);
    for (let i = 0; i < n; i++) {
      const yaw = rng() * TAU, el = (4 + rng() * 70) * DEG, D = 900;
      const x = Math.sin(yaw) * D * Math.cos(el), z = Math.cos(yaw) * D * Math.cos(el), y = Math.sin(el) * D;
      const b = 0.35 + rng() * 0.65, s = 0.9 + rng() * 1.4;
      const ph = rng() * TAU, tw = 0.5 + rng() * 2;
      L.props.push({ kind: 'sprite', x, y, z, w: s, h: s, noFog: true, noLight: true, layer: 0, dist: D, draw: (ctx, P) => {
        ctx.fillStyle = 'rgba(220,225,255,' + (b * (alpha === undefined ? 1 : alpha) * (0.72 + 0.28 * Math.sin(P.t * tw + ph))) + ')';
        ctx.beginPath(); ctx.arc(0, s / 2, s / 2, 0, TAU); ctx.fill();
      } });
    }
  }
};

// ---- build in a rotated local frame (deg = 0 is the level's own forward) ----
SC.withYaw = function (L, deg, fn) {
  if (!deg) return fn();
  const orig = L.pt, r = deg * DEG;
  L.pt = (x, y, z) => { const q = rotY(x, z, r); return orig(q[0], y, q[1]); };
  try { return fn(); } finally { L.pt = orig; }
};
// ---- openings: build the wall pieces around a hole and return the aperture the lane logic needs ----
// a doorway in a wall at depth z facing the lane, opening w wide and h high, walls wallH high from x=left..right
SC.doorway = function (L, o) {
  const x = o.x || 0, w = o.w, h = o.h, wallH = o.wallH || h + 0.5, left = o.left === undefined ? -7 : o.left, right = o.right === undefined ? 7 : o.right;
  SC.withYaw(L, o.deg || 0, () => {
    SC.wallV(L, left, o.z, x - w / 2, o.z, 0, wallH, o.color, o.opts);
    SC.wallV(L, x + w / 2, o.z, right, o.z, 0, wallH, o.color, o.opts);
    if (wallH > h) SC.wallV(L, x - w / 2, o.z, x + w / 2, o.z, h, wallH, o.color, o.opts);
    if (o.frame) { const f = o.frame, fw = f.w || 0.1; SC.wallV(L, x - w / 2 - fw, o.z - 0.05, x - w / 2, o.z - 0.05, 0, h + fw, f.color); SC.wallV(L, x + w / 2, o.z - 0.05, x + w / 2 + fw, o.z - 0.05, 0, h + fw, f.color); SC.wallV(L, x - w / 2 - fw, o.z - 0.05, x + w / 2 + fw, o.z - 0.05, h, h + fw, f.color); }
  });
  return { z: o.z, x0: x - w / 2, x1: x + w / 2, y0: 0, y1: h };
};
// a window: wall with a hole from y0 to y1
SC.window = function (L, o) {
  const x = o.x || 0, w = o.w, wallH = o.wallH, left = o.left === undefined ? -7 : o.left, right = o.right === undefined ? 7 : o.right;
  SC.withYaw(L, o.deg || 0, () => {
    SC.wallV(L, left, o.z, x - w / 2, o.z, 0, wallH, o.color, o.opts);
    SC.wallV(L, x + w / 2, o.z, right, o.z, 0, wallH, o.color, o.opts);
    SC.wallV(L, x - w / 2, o.z, x + w / 2, o.z, 0, o.y0, o.color, o.opts);
    SC.wallV(L, x - w / 2, o.z, x + w / 2, o.z, o.y1, wallH, o.color, o.opts);
  });
  return { z: o.z, x0: x - w / 2, x1: x + w / 2, y0: o.y0, y1: o.y1 };
};
// a gap between two posts (no lintel): builds nothing, describes the opening
SC.gap = function (L, o) { return { z: o.z, x0: (o.x || 0) - o.w / 2, x1: (o.x || 0) + o.w / 2, y0: o.y0 || 0, y1: o.h || 99 }; };

// ---- per-frame (dynamic) variants: return the renderable instead of registering it ----
SC.mkQuad = function (L, a, b, c, d, color, opts) {
  return Object.assign({ kind: 'poly', pts: [L.pt(a[0], a[1], a[2]), L.pt(b[0], b[1], b[2]), L.pt(c[0], c[1], c[2]), L.pt(d[0], d[1], d[2])], color }, opts || {});
};
SC.mkWallV = function (L, x0, z0, x1, z1, y0, y1, color, opts) { return SC.mkQuad(L, [x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0], color, opts); };
SC.mkSprite = function (L, x, y, z, w, h, draw, opts) {
  const p = L.pt(x, y, z);
  return Object.assign({ kind: 'sprite', x: p[0], y: p[1], z: p[2], w, h, draw }, opts || {});
};
