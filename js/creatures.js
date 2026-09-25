'use strict';
// ---------- The things that come. Drawn procedurally, in meters, feet at (0,0), +y up ----------
// Every creature exposes: h, w (sprite box), faceY (where its face is, for the lunge),
// stepRate (steps per meter, drives footstep sounds), catchDist, init(c), speedMult(c,dt,seen), draw(ctx,c,P)

function headTiltJerk(t, period, amp) {
  const k = Math.floor(t / period);
  const side = (k & 1) ? 1 : -1;
  const frac = t - k * period;
  const snap = smoothstep(frac / 0.07);
  return side * amp * (2 * snap - 1);
}
function fingers(ctx, x, y, angle, spread, len, w, color) {
  for (let i = 0; i < 4; i++) {
    const a = angle + (i - 1.5) * spread;
    const l = len * ((i === 0 || i === 3) ? 0.82 : 1);
    P_line(ctx, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, w, color);
  }
}
function strands(ctx, x, y, n, len, color, seed, t) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.16 + Math.sin(t * 1.3 + i + seed) * 0.05;
    const l = len * (0.7 + 0.3 * Math.sin(i * 2.3 + seed));
    P_line(ctx, x + (i - (n - 1) / 2) * 0.03, y, x + Math.cos(a) * l + (i - (n - 1) / 2) * 0.04, y + Math.sin(a) * l, 0.012, color);
  }
}

const CREATURES = {};
