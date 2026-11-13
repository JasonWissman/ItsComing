'use strict';
// ---------- the title screen: eyes in the dark ----------
// Pitch black, and a long way off two pale points of eyes. It does not move while the title is in front of you; it
// comes on only behind a dialog (Nights, How to play, Settings: each covers it), so each time you close one it is
// nearer, and more of what the eyes belong to shows. STEPS of them and it is close enough to touch; it stays there.
// Drawn on its own canvas (#titleScene) over the game's, which the title then leaves undrawn. The title after the last
// night (the morning theme) keeps the room behind it instead, and nothing is coming.
const TITLE = (() => {
  const D = [70, 38, 22, 13, 7.5, 4.2, 2.4];   // how far off it is, metres, after each dialog closed
  let cv = null, ctx = null, W = 0, H = 0, dpr = 1, step = 0, on = false, shown = false;
  let grainTile = null;
  function canvas() {
    if (!cv) { cv = document.getElementById('titleScene'); if (cv) ctx = cv.getContext('2d'); }
    return cv;
  }
  function enter() { step = 0; on = SAVE.data.settings.theme !== 'day'; }
  function advance() { if (on) step = Math.min(D.length - 1, step + 1); }
  // is the scene up (the title is showing, and it is not the morning)? sets the page's class to match
  function active() {
    const a = on && G.state === 'title' && !!canvas();
    if (a !== shown) { shown = a; document.body.classList.toggle('titlescene', a); }
    return a;
  }
  // a tall, thin figure standing, in metres (feet at 0,0, +y up, about 2.3 m to the top of its head), its arms past its knees
  function figure(g, col, tilt) {
    for (const s of [-1, 1]) P_limb(g, [[s * 0.075, 1.0], [s * 0.1, 0.53], [s * 0.11, 0.03]], 0.072, col);
    g.fillStyle = col; g.beginPath();
    g.moveTo(-0.12, 0.96); g.lineTo(0.12, 0.96); g.quadraticCurveTo(0.09, 1.3, 0.19, 1.7); g.quadraticCurveTo(0.2, 1.8, 0.06, 1.83);
    g.lineTo(-0.06, 1.83); g.quadraticCurveTo(-0.2, 1.8, -0.19, 1.7); g.quadraticCurveTo(-0.09, 1.3, -0.12, 0.96); g.fill();
    for (const s of [-1, 1]) { const hd = [s * 0.27, 0.74]; P_limb(g, [[s * 0.18, 1.74], [s * 0.25, 1.26], hd], 0.05, col); fingers(g, hd[0], hd[1], -Math.PI / 2 + s * 0.08, 0.16, 0.15, 0.018, col); }
    P_limb(g, [[0, 1.8], [tilt * 0.04, 1.98]], 0.05, col);
    g.save(); g.translate(0, 2.1); g.rotate(tilt); P_ell(g, 0, 0, 0.115, 0.165, col); g.restore();
  }
  function grain(a) {
    if (!grainTile) { grainTile = document.createElement('canvas'); grainTile.width = grainTile.height = 192; const g = grainTile.getContext('2d'), im = g.createImageData(192, 192); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.translate(-Math.random() * 192, -Math.random() * 192);
    ctx.fillStyle = ctx.createPattern(grainTile, 'repeat'); ctx.fillRect(0, 0, W + 192, H + 192); ctx.restore();
  }
  // hidden: a dialog is open over it, and whatever it is doing back there is not seen
  function draw(t, hidden) {
    if (!canvas()) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth, h = window.innerHeight;
    if (w !== W || h !== H || cv.width !== Math.round(w * dpr)) { W = w; H = h; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = ctx; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    // the eyes sit high in the view, clear of the title and its buttons below
    const y0 = H * 0.36, f = Math.min(H * 1.25, W * 1.6), d = D[step];
    const fl = g.createLinearGradient(0, y0 - H * 0.06, 0, y0 + H * 0.3); fl.addColorStop(0, 'rgba(18,17,21,0)'); fl.addColorStop(0.2, 'rgba(18,17,21,1)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fl; g.fillRect(0, y0 - H * 0.06, W, H * 0.36);   // the faintest ground, lightest far off, no edge to it
    const ppm = f / d, feet = y0 + f * 1.62 / d, sx = W / 2 + Math.sin(t * 0.21) * 0.04 * ppm;
    const show = clamp((24 - d) / 20, 0, 1);   // more of it shows as it nears
    const still = SAVE.data.settings.reducedMotion, tilt = still ? 0 : headTiltJerk(t, 3.1, 0.18) * show;
    if (!hidden) {
      g.save(); g.translate(sx, feet); g.scale(ppm, -ppm);
      figure(g, rgba([6 + 9 * show, 6 + 8 * show, 8 + 9 * show]), tilt);
      g.restore();
      const blink = (t % 4.7 > 4.55) || (t % 7.3 > 7.18);
      if (!blink) {   // the eyes, drawn over in screen space so even far off they are two points
        const ey = feet - 2.12 * ppm, r = Math.max(1.1, 0.014 * ppm), sep = Math.max(2.6, 0.042 * ppm);
        const hx = sx;   // the head turns about its middle, the eyes with it
        for (const s of [-1, 1]) {
          const x = hx + s * sep * Math.cos(tilt), y = ey + s * sep * Math.sin(tilt);
          const gr = Math.max(6, r * 3.5), gl = g.createRadialGradient(x, y, 0, x, y, gr);
          gl.addColorStop(0, 'rgba(235,228,210,.3)'); gl.addColorStop(1, 'rgba(235,228,210,0)');
          g.fillStyle = gl; g.fillRect(x - gr, y - gr, gr * 2, gr * 2);
          g.fillStyle = '#ebe4d2'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
        }
      }
    }
    const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.15, W / 2, H / 2, Math.hypot(W, H) * 0.62);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    if (!still) grain(0.07);
  }
  return { enter, advance, active, draw, get step() { return step; }, get on() { return on; }, STEPS: D.length - 1 };
})();
