'use strict';
// ---------- scene passes: on the whole frame, before the game's own vignette and grain ----------
// A torch circle (the hallway reference: a soft spot and darkness outside it), print misregistration (the colour
// plates a little off), a low-resolution ordered dither (the screen-printed look, and a cheap posterise), and
// paper. Drawn through R.post's drawOverlay, so the game's vignette, danger pulse and grain go on top as usual.
const POST2D = (() => {
  let paper = null, tmp = null, low = null, filtersReady = false;
  function paperTex() {
    if (paper) return paper;
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
    const rng = mulberry32(77);
    for (let i = 0; i < 9000; i++) { const v = 96 + rng() * 64; x.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + (0.3 + rng() * 0.5) + ')'; x.fillRect(rng() * 256, rng() * 256, 1 + rng() * 1.5, 1); }
    x.strokeStyle = 'rgba(70,70,70,0.35)'; x.lineWidth = 0.6;
    for (let i = 0; i < 70; i++) { const px = rng() * 256, py = rng() * 256, a = rng() * TAU, l = 6 + rng() * 22; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    return paper = c;
  }
  // SVG colour-matrix filters, so a copy of the frame can be drawn one plate at a time
  function ensureFilters() {
    if (filtersReady) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;width:0;height:0');
    svg.innerHTML = '<filter id="plateR" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>' +
      '<filter id="plateGB" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>';
    document.body.appendChild(svg); filtersReady = true;
  }
  const cost = { ms: 0 };
  // ctx is the game canvas in device pixels (its transform is reset here); W, H are the frame in device pixels
  function draw(ctx, o, t) {
    const t0 = performance.now();
    const canvas = ctx.canvas, W = canvas.width, H = canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (o.flash > 0) {
      const r0 = Math.min(W, H) * o.flashRadius, r1 = r0 * (1 + o.flashSoft), cx = W / 2, cy = H * 0.52;
      const g = ctx.createRadialGradient(cx, cy, r0 * 0.4, cx, cy, Math.max(r1, r0 + 1));
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,' + (o.flash * 0.35) + ')'); g.addColorStop(1, 'rgba(0,0,0,' + o.flash + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (o.flashWarm > 0) { const w = ctx.createRadialGradient(cx, cy, 0, cx, cy, r0); w.addColorStop(0, 'rgba(255,214,160,' + (o.flashWarm * 0.18) + ')'); w.addColorStop(1, 'rgba(255,214,160,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = w; ctx.fillRect(cx - r0, cy - r0, r0 * 2, r0 * 2); ctx.globalCompositeOperation = 'source-over'; }
    }
    if (o.misreg > 0) {
      ensureFilters();
      if (!tmp) tmp = document.createElement('canvas');
      if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
      const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, W, H); tc.drawImage(canvas, 0, 0);
      const d = o.misreg * (W / 1280);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.filter = 'url(#plateR)'; ctx.drawImage(tmp, d, 0);
      ctx.filter = 'url(#plateGB)'; ctx.drawImage(tmp, -d * 0.6, 0);
      ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
    }
    if (o.dither > 0) {
      const k = Math.max(2, Math.round(o.ditherScale)), w = Math.ceil(W / k), h = Math.ceil(H / k);
      if (!low) low = document.createElement('canvas');
      if (low.width !== w || low.height !== h) { low.width = w; low.height = h; }
      const lc = low.getContext('2d', { willReadFrequently: true });
      lc.imageSmoothingEnabled = true; lc.drawImage(canvas, 0, 0, W, H, 0, 0, w, h);
      const img = lc.getImageData(0, 0, w, h), d = img.data, levels = Math.max(2, o.ditherLevels), step = 255 / (levels - 1);
      const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      // the brightness is quantised and dithered, the hue kept: a screen print, not coloured speckle
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, th = (B[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * step * o.dither;
        const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2], ql = Math.max(0, Math.round((l + th) / step) * step), k = l > 0.5 ? ql / l : 0;
        d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
      }
      lc.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(low, 0, 0, w, h, 0, 0, w * k, h * k); ctx.imageSmoothingEnabled = true;
    }
    if (o.paper > 0) {
      const pat = ctx.createPattern(paperTex(), 'repeat');
      ctx.fillStyle = pat;
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = o.paper; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.paper * 0.35; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    ctx.restore();
    cost.ms += performance.now() - t0;
  }
  const DEFAULTS = { flash: 0, flashRadius: 0.42, flashSoft: 0.9, flashWarm: 0.5, misreg: 0, dither: 0, ditherScale: 3, ditherLevels: 6, paper: 0.35 };
  return { draw, DEFAULTS, cost };
})();
