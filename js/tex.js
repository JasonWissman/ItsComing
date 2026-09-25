'use strict';
// ---------- procedural surface textures: tileable 128px greyscale canvases built once ----------
const TEX = (() => {
  const cache = {}, patterns = new Map();
  const N = 128;
  function make(kind) {
    const cv = document.createElement('canvas'); cv.width = cv.height = N;
    const x = cv.getContext('2d');
    const img = x.createImageData(N, N), d = img.data;
    const rng = mulberry32(kind.length * 977 + 13);
    // value noise on a coarse grid, tileable
    const G = 8, grid = [];
    for (let i = 0; i < G * G; i++) grid.push(rng());
    const vn = (u, v) => { // u,v in [0,1)
      const gu = u * G, gv = v * G; const iu = Math.floor(gu), iv = Math.floor(gv); const fu = gu - iu, fv = gv - iv;
      const g = (a, b) => grid[((a % G) + G) % G + (((b % G) + G) % G) * G];
      const s = t => t * t * (3 - 2 * t);
      return lerp(lerp(g(iu, iv), g(iu + 1, iv), s(fu)), lerp(g(iu, iv + 1), g(iu + 1, iv + 1), s(fu)), s(fv));
    };
    for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
      const u = px / N, v = py / N;
      let val = 128;
      if (kind === 'planks') {
        const board = Math.floor(v * 4), seam = (v * 4) % 1;
        const grain = 0.5 + 0.5 * Math.sin((u * 6 + board * 0.7 + vn(u, v) * 2.5) * TAU);
        val = 118 + grain * 26 + (vn(u * 3 % 1, v) - 0.5) * 22;
        if (seam < 0.05 || seam > 0.95) val -= 45;
        if (Math.abs(((u * 2 + board * 0.5) % 1) - 0.5) < 0.006) val -= 30;
      } else if (kind === 'logs') {
        const row = (v * 3) % 1;
        const round = Math.sin(row * Math.PI);
        val = 96 + round * 48 + (vn(u, v) - 0.5) * 20 + 0.5 * Math.sin(u * 40 + vn(u, v) * 6) * 8;
        if (row < 0.06 || row > 0.94) val -= 40;
      } else if (kind === 'stone') {
        const cx = Math.floor(u * 4), cy = Math.floor(v * 3);
        const off = ((cy % 2) ? 0.5 : 0);
        const fu = ((u * 4 + off) % 1), fv = (v * 3) % 1;
        const edge = Math.min(fu, 1 - fu, fv * 1.3, (1 - fv) * 1.3);
        val = 112 + vn(u, v) * 40 + (edge < 0.07 ? -50 : 0) + (rng() - 0.5) * 8;
        void cx;
      } else if (kind === 'grass') {
        val = 112 + (vn(u, v) - 0.5) * 50 + (rng() - 0.5) * 30 + (Math.sin(v * 90 + vn(u, v) * 10) > 0.8 ? 18 : 0);
      } else if (kind === 'tin') {
        const rib = Math.abs(((u * 8) % 1) - 0.5) * 2;
        val = 120 + rib * 30 + (vn(u, v) - 0.5) * 20;
      } else {
        val = 120 + (vn(u, v) - 0.5) * 40 + (rng() - 0.5) * 12;
      }
      val = clamp(val, 30, 225);
      const i = (py * N + px) * 4; d[i] = d[i + 1] = d[i + 2] = val; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return cv;
  }
  function get(kind) { return cache[kind] || (cache[kind] = make(kind)); }
  function pattern(ctx, kind) {
    let m = patterns.get(ctx); if (!m) { m = {}; patterns.set(ctx, m); }
    return m[kind] || (m[kind] = ctx.createPattern(get(kind), 'repeat'));
  }
  return { get, pattern, N };
})();
