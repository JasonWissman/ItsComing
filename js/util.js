'use strict';
// ---------- small math / color helpers shared by every module ----------
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeIn = t => { t = clamp(t, 0, 1); return t * t * t; };

function wrapPi(a) {
  a = a % TAU;
  if (a > Math.PI) a -= TAU; else if (a < -Math.PI) a += TAU;
  return a;
}

// colors are [r,g,b] arrays (0..255)
function mixc(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function scalec(c, k) { return [clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)]; }
function rgba(c, a) {
  return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : a) + ')';
}

// deterministic RNG so scenery is identical on every retry
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// rotate a local (x,z) so that local +z points along world yaw (0 = north, clockwise)
function rotY(x, z, yaw) {
  const s = Math.sin(yaw), c = Math.cos(yaw);
  return [x * c + z * s, -x * s + z * c];
}

// ---------- tiny drawing primitives used by creatures & icons ----------
// All of these draw in "meter" space: (0,0) at the feet, +y is up.
function P_poly(ctx, pts, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}
function P_limb(ctx, pts, w, color) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}
function P_ell(ctx, x, y, rx, ry, color, rot) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(rx, 0.0001), Math.max(ry, 0.0001), rot || 0, 0, TAU);
  ctx.fill();
}
function P_rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function P_line(ctx, x1, y1, x2, y2, w, color) { P_limb(ctx, [[x1, y1], [x2, y2]], w, color); }
