'use strict';
// ---------- the thread through the nights: a lamp that is always somewhere, a clock you cannot place, coat hangers ----------
// ---------- in the wind, two knocks on a pipe, and the room they all belong to. Nothing here explains itself.   ----------
const STORY = (() => {
  // the bedside lamp: a small base and a shade, as an ordinary prop wherever a night puts it
  function lamp(L, x, y, z, opts) {
    const o = opts || {}, sc = o.scale || 1, lit = () => (typeof o.lit === 'function' ? o.lit() : !!o.lit);
    return SC.sprite(L, x, y, z, 0.34 * sc, 0.5 * sc, (ctx, P) => {
      ctx.scale(0.34 * sc, 0.5 * sc);
      const on = lit();
      const base = P.col([70, 60, 50]), shade = on ? P.raw([246, 216, 156]) : P.col([150, 132, 100]), shadeD = P.col([100, 88, 66]);
      P_rect(ctx, -0.18, 0, 0.36, 0.08, base); P_rect(ctx, -0.04, 0.08, 0.08, 0.42, base);
      ctx.fillStyle = shade; ctx.beginPath(); ctx.moveTo(-0.5, 0.5); ctx.lineTo(0.5, 0.5); ctx.lineTo(0.3, 1.0); ctx.lineTo(-0.3, 1.0); ctx.closePath(); ctx.fill();
      P_line(ctx, -0.5, 0.5, 0.5, 0.5, 0.03, shadeD);
      if (on) { const g = ctx.createRadialGradient(0, 0.72, 0.05, 0, 0.72, 0.75); g.addColorStop(0, 'rgba(255,225,170,0.6)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-0.8, 0.05, 1.6, 1.3); }
    }, o.opts);
  }
  // a small round clock, stopped at ten past three
  function clock(L, x, y, z, size, opts) {
    return SC.sprite(L, x, y, z, size, size, (ctx, P) => {
      ctx.scale(size, size);
      P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([40, 40, 44])); P_ell(ctx, 0, 0.5, 0.44, 0.44, P.col([230, 226, 216]));
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; P_ell(ctx, Math.sin(a) * 0.36, 0.5 + Math.cos(a) * 0.36, 0.02, 0.02, P.col([60, 60, 64])); }
      P_line(ctx, 0, 0.5, 0.17, 0.5 + 0.1, 0.03, P.col([30, 30, 30])); P_line(ctx, 0, 0.5, 0.29, 0.5 + 0.17, 0.02, P.col([30, 30, 30]));
    }, opts);
  }
  // per-night sounds: the clock for the first ten seconds (from the north-west, where the clock will be), hangers now
  // and then on the wind (from the west, where the closet will be), two knocks on a pipe when it is halfway here
  let st = null;
  const pan = worldYaw => Math.sin(wrapPi(worldYaw - G.cam.yaw)) * 0.7;
  function startNight(L) { st = { t: 0, tick: 0.4, knocked: false, hang: 18 + L.rand() * 20 }; }
  function update(L, dt) {
    if (!st || G.state !== 'play' || L.def.ending) return;
    st.t += dt;
    if (st.t < 10) { st.tick -= dt; if (st.tick <= 0) { st.tick = 1.0; AUDIO.sfx('tick', pan(-Math.PI / 4), true); } }
    const c = L.creature;
    if (c && !st.knocked && c.u > 0.5) { st.knocked = true; AUDIO.sfx('knock', pan(Math.PI / 2)); }
    st.hang -= dt; if (st.hang <= 0) { st.hang = 28 + L.rand() * 30; if (!L.lanes.some(l => l.cue === 'hangers')) AUDIO.sfx('hangers', pan(-Math.PI / 2), true); } // not where the clink is the closet's own warning
  }
  // the bedroom: you are in the bed with your back to the south wall. Night 12 and the ending both build it.
  // Returns the pieces the night needs to animate.
  function buildBedroom(L, day) {
    const wall = day ? [216, 204, 184] : [44, 38, 42], wallD = day ? [192, 178, 158] : [34, 30, 33], floor = day ? [166, 138, 100] : [42, 34, 28], wood = day ? [146, 110, 74] : [50, 38, 30], cloth = day ? [222, 216, 200] : [66, 62, 70];
    const ptex = { tex: 'planks', texScale: 1.2 };
    SC.floorQ(L, -3.2, -1.1, 2.2, 3.6, 0.004, floor, ptex);
    SC.quad(L, [-3.2, 2.5, -1.1], [2.2, 2.5, -1.1], [2.2, 2.5, 3.6], [-3.2, 2.5, 3.6], day ? [228, 222, 210] : [30, 26, 28]);
    SC.floorQ(L, -1.3, 0.4, 1.3, 2.7, 0.008, day ? [150, 90, 80] : [56, 34, 34]);
    SC.wallV(L, -3.2, -1.1, 2.2, -1.1, 0, 2.5, wallD);
    const apN = SC.doorway(L, { z: 3.6, x: 0, w: 1.0, h: 2.1, wallH: 2.5, left: -3.2, right: 2.2, color: wall, frame: { color: wood, w: 0.08 } });
    const apW = SC.doorway(L, { deg: 270, z: 3.2, x: 0, w: 1.8, h: 2.2, wallH: 2.5, left: -1.1, right: 3.6, color: wallD, frame: { color: wood, w: 0.06 } });
    SC.window(L, { deg: 90, z: 2.2, x: -1.6, w: 1.2, y0: 0.9, y1: 2.0, wallH: 2.5, left: -3.6, right: 1.1, color: wallD });
    // the closet: a dark box behind its opening, a rail, hangers, clothes (empty in the morning), doors standing open
    SC.floorQ(L, -3.95, -0.95, -3.2, 0.95, 0.006, day ? [120, 100, 80] : [22, 18, 18]);
    SC.wallV(L, -3.95, -0.95, -3.95, 0.95, 0, 2.5, day ? [170, 158, 140] : [18, 15, 16]); SC.wallV(L, -3.95, -0.95, -3.2, -0.95, 0, 2.5, day ? [160, 148, 130] : [16, 14, 15]); SC.wallV(L, -3.95, 0.95, -3.2, 0.95, 0, 2.5, day ? [160, 148, 130] : [16, 14, 15]);
    SC.quad(L, [-3.95, 2.5, -0.95], [-3.2, 2.5, -0.95], [-3.2, 2.5, 0.95], [-3.95, 2.5, 0.95], day ? [150, 140, 124] : [12, 10, 11]);
    SC.box(L, -3.6, -3.55, 1.95, 2.0, -0.85, 0.85, [110, 108, 112]);
    for (let k = 0; k < 9; k++) {
      const z = -0.75 + k * 0.19;
      SC.sprite(L, -3.58, 1.72, z, 0.22, 0.3, (ctx, P) => { ctx.scale(0.22, 0.3); ctx.strokeStyle = P.col([150, 150, 156]); ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(0, 0.86); ctx.moveTo(-0.5, 0.6); ctx.lineTo(0, 0.86); ctx.lineTo(0.5, 0.6); ctx.stroke(); });
      if (!day && k % 3 !== 1) SC.sprite(L, -3.6, 0.45, z + 0.02, 0.36, 1.3, (ctx, P) => { ctx.scale(0.36, 1.3); P_poly(ctx, [[-0.4, 0], [0.4, 0], [0.5, 0.95], [-0.5, 0.95]], P.col(k % 2 ? [40, 34, 40] : [56, 46, 40])); });
    }
    for (const s of [-1, 1]) { const hx = -3.2, hz = s * 0.9, a = 75 * DEG; SC.wallV(L, hx, hz, hx + Math.sin(a) * 0.85, hz - s * Math.cos(a) * 0.85, 0, 2.15, wood); }
    // the hall beyond the doorway
    SC.floorQ(L, -1.2, 3.6, 1.2, 8, 0.002, day ? [150, 128, 96] : [20, 16, 14]);
    SC.wallV(L, -1.2, 8, 1.2, 8, 0, 2.5, day ? [206, 196, 180] : [14, 12, 12]); SC.wallV(L, -1.2, 3.62, -1.2, 8, 0, 2.5, day ? [190, 178, 160] : [16, 13, 13]); SC.wallV(L, 1.2, 3.62, 1.2, 8, 0, 2.5, day ? [190, 178, 160] : [16, 13, 13]);
    if (day) SC.wallV(L, -0.4, 7.98, 0.4, 7.98, 0.3, 2.2, [255, 250, 230], { noFog: true, noLight: true });
    // the window: glass, a sill, curtains
    SC.wallV(L, 2.21, 1.0, 2.21, 2.2, 0.9, 2.0, day ? [200, 226, 250] : [70, 90, 130], { alpha: day ? 0.5 : 0.35, noLight: true });
    SC.wallV(L, 2.205, 1.58, 2.205, 1.62, 0.9, 2.0, wood); SC.wallV(L, 2.205, 1.0, 2.205, 2.2, 1.43, 1.47, wood);
    SC.box(L, 2.1, 2.25, 0.86, 0.92, 0.9, 2.3, wood);
    for (const z of [0.7, 2.5]) SC.wallV(L, 2.17, z - 0.3, 2.17, z + 0.3, 0.2, 2.3, cloth);
    // the bed: mattress, headboard, pillow; the covers are the night's business (a plain sheet in the morning)
    SC.box(L, -0.75, 0.75, 0.32, 0.58, -1.0, 1.9, cloth); SC.box(L, -0.8, 0.8, 0.58, 1.3, -1.05, -0.95, wood);
    for (const [x, z] of [[-0.72, -0.9], [0.72, -0.9], [-0.72, 1.85], [0.72, 1.85]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.32, z - 0.04, z + 0.04, wood);
    SC.box(L, -0.5, 0.5, 0.58, 0.74, -0.95, -0.45, day ? [236, 232, 220] : [110, 106, 112]);
    if (day) SC.box(L, -0.78, 0.78, 0.58, 0.66, 0.2, 1.9, [228, 222, 206]);
    // the nightstand with its drawer, the lamp on it; the dresser with a mirror and the clock; a chair
    SC.box(L, 0.95, 1.45, 0, 0.62, -0.1, 0.4, wood); SC.box(L, 0.96, 1.44, 0.28, 0.5, -0.12, -0.11, day ? [128, 96, 64] : [42, 32, 26]);
    SC.box(L, -2.9, -1.5, 0, 0.95, 3.05, 3.55, wood); SC.box(L, -2.85, -1.55, 0.95, 1.0, 3.0, 3.6, day ? [160, 124, 84] : [58, 44, 34]);
    SC.wallV(L, -2.7, 3.58, -1.7, 3.58, 1.05, 2.05, day ? [200, 212, 224] : [24, 22, 30], { noLight: !day });
    SC.wallV(L, -2.75, 3.57, -1.65, 3.57, 1.0, 1.05, wood); SC.wallV(L, -2.75, 3.57, -1.65, 3.57, 2.05, 2.1, wood);
    clock(L, -2.2, 1.0, 3.3, 0.3);
    SC.box(L, -2.6, -2.15, 0.42, 0.47, -0.9, -0.45, wood); SC.box(L, -2.6, -2.15, 0.47, 0.95, -0.9, -0.85, wood);
    for (const [x, z] of [[-2.57, -0.87], [-2.18, -0.87], [-2.57, -0.48], [-2.18, -0.48]]) SC.box(L, x - 0.025, x + 0.025, 0, 0.42, z - 0.025, z + 0.025, wood);
    SC.wallV(L, 0.2, -1.09, 1.0, -1.09, 1.5, 2.1, day ? [180, 190, 170] : [40, 44, 40]); SC.wallV(L, 0.16, -1.085, 1.04, -1.085, 1.46, 1.5, wood); SC.wallV(L, 0.16, -1.085, 1.04, -1.085, 2.1, 2.14, wood);
    return { apN, apW, lamp: [1.2, 0.62, 0.15] };
  }
  function theme(day) { if (day) document.documentElement.setAttribute('data-theme', 'day'); else document.documentElement.removeAttribute('data-theme'); }
  return { lamp, clock, startNight, update, buildBedroom, theme };
})();
