'use strict';
// ---------- ink: drawing primitives beyond the game's P_* set, in the same metre space (+y up, feet at 0) ----------
// Hatching, torn cloth, drips, flames, halos, ribs, wild hair, stripes: the techniques the reference pieces lean on,
// each a few lines of Canvas 2D so a creature can use them the way it uses P_poly today. If they earn their keep
// they move into js/util.js next to P_limb.
function hashf(seed, i) { const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
// parallel lines across a polygon, clipped to it: the shading of an ink drawing. angle in radians, spacing in metres
function P_hatch(ctx, pts, spacing, angle, w, color, opts) {
  const o = opts || {};
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  for (const p of pts) { if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0]; if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1]; }
  ctx.save();
  ctx.beginPath(); for (let i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.clip();
  const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2, R = Math.hypot(maxx - minx, maxy - miny) / 2 + spacing;
  ctx.translate(cx, cy); ctx.rotate(angle);
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath();
  const from = o.from === undefined ? -R : o.from, to = o.to === undefined ? R : o.to;   // a band of the hatch (from..to across the lines), for a shadow side
  for (let y = Math.ceil(from / spacing) * spacing; y <= to; y += spacing) { ctx.moveTo(-R, y); ctx.lineTo(R, y); }
  ctx.stroke();
  if (o.cross) { ctx.rotate(Math.PI / 2); ctx.beginPath(); for (let y = Math.ceil(-R / spacing) * spacing; y <= R; y += spacing) { ctx.moveTo(-R, y); ctx.lineTo(R, y); } ctx.stroke(); }
  ctx.restore();
}
// an ellipse hatched on the side away from the light (dir: angle the light comes from)
function P_hatchEll(ctx, x, y, rx, ry, spacing, w, color, lightAngle, depth) {
  const n = 18, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
  const R = Math.max(rx, ry);
  P_hatch(ctx, pts, spacing, lightAngle + Math.PI / 2, w, color, { from: R * (1 - 2 * (depth === undefined ? 0.5 : depth)), to: R * 2 });
}
// a polygon whose edge from pts[i0] to pts[i1] is torn into teeth: cloth, hems, sleeves, skin
function tornEdge(a, b, n, depth, seed, side) {
  const out = [], dx = b[0] - a[0], dy = b[1] - a[1], nx = -dy, ny = dx, len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < n; i++) {
    const t = i / n, d = (0.25 + 0.75 * hashf(seed, i)) * depth * (i % 2 ? 1 : 0.15) * (side || 1);
    out.push([a[0] + dx * t + nx / len * d, a[1] + dy * t + ny / len * d]);
  }
  return out;
}
function P_tatter(ctx, pts, color, seed, depth, n) {
  // every edge marked by a 't' flag ([x, y, 't']) is torn; the last edge (closing) is torn when no edge is marked
  const marked = pts.some(p => p[2] === 't');
  const path = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    path.push([a[0], a[1]]);
    const tear = marked ? a[2] === 't' : i === pts.length - 1;
    if (tear) for (const q of tornEdge(a, b, n || 9, depth || 0.06, seed + i * 7, 1)) path.push(q);
  }
  P_poly(ctx, path, color);
}
// a ragged stroke: a line that wanders, for hair, roots, cloth edges, cracks
function P_ragged(ctx, x0, y0, x1, y1, amp, seed, w, color, n) {
  const N = n || 8, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const pts = [[x0, y0]];
  for (let i = 1; i < N; i++) { const t = i / N, d = (hashf(seed, i) - 0.5) * 2 * amp * Math.sin(t * Math.PI); pts.push([x0 + dx * t + nx * d, y0 + dy * t + ny * d]); }
  pts.push([x1, y1]);
  P_limb(ctx, pts, w, color);
}
// a drip: a tapering run with a drop that swells and falls, looping on t
function P_drip(ctx, x, y, len, w, color, t, seed) {
  const period = 2.2 + hashf(seed, 1) * 1.5, ph = ((t + hashf(seed, 2) * period) % period) / period;
  const run = len * Math.min(1, ph * 1.4);
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - run * 0.7); ctx.stroke();
  ctx.lineWidth = w * 0.55; ctx.beginPath(); ctx.moveTo(x, y - run * 0.7); ctx.lineTo(x, y - run); ctx.stroke();
  const drop = ph > 0.72 ? (ph - 0.72) / 0.28 : 0;
  P_ell(ctx, x, y - run - drop * len * 0.6, w * (0.6 + drop * 0.3), w * (0.8 + drop * 0.5), color);
}
// a candle flame: three teardrops, flickering on t; returns where its light is, for a glow or a point light
function P_flame(ctx, x, y, h, t, seed, P) {
  const f = 1 + 0.18 * Math.sin(t * 17 + seed) + 0.1 * Math.sin(t * 29.3 + seed * 2), lean = 0.08 * Math.sin(t * 7.1 + seed);
  const tear = (hh, ww, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - ww + lean * hh, y + hh * 0.45, x + lean * hh, y + hh); ctx.quadraticCurveTo(x + ww + lean * hh, y + hh * 0.45, x, y); ctx.fill(); };
  tear(h * f, h * 0.32, P.raw([235, 120, 30])); tear(h * f * 0.72, h * 0.22, P.raw([252, 205, 80])); tear(h * f * 0.4, h * 0.11, P.raw([255, 250, 225]));
  return { x: x + lean * h, y: y + h * 0.5, r: h * 4 };
}
// a halo: n rays of alternating length behind a point, slowly turning
function P_halo(ctx, x, y, r, n, color, t, w) {
  ctx.strokeStyle = color; ctx.lineWidth = w || 0.012; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = i / n * TAU + t * 0.1, l = r * (i % 2 ? 1 : 0.62); ctx.moveTo(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); }
  ctx.stroke();
  P_ell(ctx, x, y, r * 0.38, r * 0.38, color);
}
// a ribcage: n arcs either side of a spine, over a dark cavity
function P_ribs(ctx, x, y, w, h, n, bone, cavity, open) {
  P_ell(ctx, x, y + h / 2, w * 0.5, h * 0.55, cavity);
  ctx.strokeStyle = bone; ctx.lineWidth = w * 0.07; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const yy = y + h * (0.12 + 0.76 * i / (n - 1)), rw = w * (0.3 + 0.2 * Math.sin(i / (n - 1) * Math.PI)), gap = (open || 0) * w * 0.12;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * gap, yy); ctx.quadraticCurveTo(x + s * rw * 1.1, yy + h * 0.04, x + s * rw, yy - h * 0.09); ctx.stroke(); }
  }
  P_line(ctx, x, y + h * 0.05, x, y + h * 0.95, w * 0.06, bone);
}
// wild hair: n wiry strands standing up and out, kinked, moving a little
function P_wildHair(ctx, x, y, n, len, w, color, seed, t) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.1 + 0.8 * i / (n - 1)) + (hashf(seed, i) - 0.5) * 0.3, l = len * (0.5 + hashf(seed, i + 50)), k = (hashf(seed, i + 100) - 0.5) * 0.6;
    const sway = Math.sin(t * 1.7 + i) * 0.04;
    const x1 = x + Math.cos(a) * l * 0.5, y1 = y + Math.sin(a) * l * 0.5, x2 = x + Math.cos(a + k) * l + sway, y2 = y + Math.sin(a + k) * l;
    ctx.moveTo(x, y); ctx.quadraticCurveTo(x1, y1, x2, y2);
  }
  ctx.stroke();
}
// stripes across a polygon: bands of a second colour, horizontal in the polygon's frame
function P_stripes(ctx, pts, n, colorA, colorB, angle) {
  P_poly(ctx, pts, colorA);
  let miny = 1e9, maxy = -1e9, minx = 1e9, maxx = -1e9;
  for (const p of pts) { if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1]; if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0]; }
  ctx.save();
  ctx.beginPath(); for (let i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.clip();
  if (angle) { ctx.translate((minx + maxx) / 2, (miny + maxy) / 2); ctx.rotate(angle); ctx.translate(-(minx + maxx) / 2, -(miny + maxy) / 2); }
  const bh = (maxy - miny) / (2 * n), R = Math.hypot(maxx - minx, maxy - miny);
  ctx.fillStyle = colorB;
  for (let i = 0; i < 2 * n + 2; i++) if (i % 2) ctx.fillRect(minx - R, miny - R + i * bh, maxx - minx + 2 * R, bh);
  ctx.restore();
}
// an ink line with a varying weight: thick in the middle, tapering to the ends (a brush stroke)
function P_brush(ctx, pts, w, color) {
  for (let i = 0; i < pts.length - 1; i++) {
    const t = (i + 0.5) / (pts.length - 1), k = 0.35 + 0.65 * Math.sin(t * Math.PI);
    P_line(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w * k, color);
  }
}
