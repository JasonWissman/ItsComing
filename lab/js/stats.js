// ---------- frame-time and renderer counters ----------
// CPU time per frame (the update and the render call, not the GPU), kept in a ring so the panel can show the
// median and the tail; the report's advice is to watch p95, not the FPS counter.
export function createStats(size) {
  const N = size || 240;
  const ring = new Float64Array(N);
  let n = 0, head = 0, t0 = 0, last = 0, interval = 0;
  const sorted = [];
  function begin() { t0 = performance.now(); }
  function end() { const ms = performance.now() - t0; ring[head] = ms; head = (head + 1) % N; if (n < N) n++; last = ms; return ms; }
  function frame(dt) { interval = interval ? interval * 0.95 + dt * 0.05 : dt; }
  function pct() {
    sorted.length = 0;
    for (let i = 0; i < n; i++) sorted.push(ring[i]);
    sorted.sort((a, b) => a - b);
    const at = q => (n ? sorted[Math.min(n - 1, Math.floor(n * q))] : 0);
    let sum = 0; for (let i = 0; i < n; i++) sum += sorted[i];
    return { n, mean: n ? sum / n : 0, p50: at(0.5), p95: at(0.95), max: n ? sorted[n - 1] : 0, last, fps: interval ? 1 / interval : 0 };
  }
  function reset() { n = 0; head = 0; }
  // renderer.info, copied out as plain numbers
  function sample(renderer) {
    const i = renderer.info;
    return { calls: i.render.calls, triangles: i.render.triangles, points: i.render.points, lines: i.render.lines, geometries: i.memory.geometries, textures: i.memory.textures, programs: i.programs ? i.programs.length : 0 };
  }
  return { begin, end, frame, pct, reset, sample };
}
