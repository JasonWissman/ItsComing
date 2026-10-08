'use strict';
// ---------- the creature passes: what can be done to any creature's drawing without redrawing it ----------
// A creature's draw(ctx, c, P) is rendered to an offscreen canvas the size of its sprite on screen, and the
// passes work on that: an ink outline (the silhouette, pushed out), hatching and screentone on the side away
// from the light, a rim on the lit edge, line boil (a small jitter so the drawing looks redrawn each frame),
// and the palette wrapper that makes everything monochrome except what a creature marks as spot colour. Nothing
// here reaches into a creature: it is the same P and the same draw, which is why it would drop into game.js
// where the creature renderable's draw is defined.
const PASSES = (() => {
  const pool = {};
  function cv(name, w, h) {
    let c = pool[name];
    if (!c) c = pool[name] = document.createElement('canvas');
    if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); }
    return c;
  }
  const tiles = {};
  // a seamless tile of 45-degree lines (or horizontal), spacing in device pixels
  function hatchTile(spacing, w, diagonal, color) {
    const key = 'h' + spacing + ':' + w + ':' + diagonal + ':' + color;
    if (tiles[key]) return tiles[key];
    const T = diagonal ? Math.max(2, Math.round(spacing * Math.SQRT2)) : Math.max(2, Math.round(spacing));
    const c = document.createElement('canvas'); c.width = c.height = T;
    const x = c.getContext('2d'); x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'butt';
    x.beginPath();
    if (diagonal) { for (let k = -1; k <= 2; k++) { x.moveTo(-T + k * T, 0 + T); x.lineTo(0 + k * T, -T + T); x.moveTo(k * T, T); x.lineTo(k * T + T, 0); } }
    else { x.moveTo(0, 0.5); x.lineTo(T, 0.5); }
    x.stroke();
    return tiles[key] = c;
  }
  // a seamless dot screen: two dots per tile, staggered
  function toneTile(size, r, color) {
    const key = 't' + size + ':' + r + ':' + color;
    if (tiles[key]) return tiles[key];
    const T = Math.max(2, Math.round(size)), c = document.createElement('canvas'); c.width = c.height = T;
    const x = c.getContext('2d'); x.fillStyle = color;
    for (const [px, py] of [[0, 0], [T, 0], [0, T], [T, T], [T / 2, T / 2]]) { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }
    return tiles[key] = c;
  }
  const desat = (c, k) => { if (!k) return c; const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]; return [c[0] + (l - c[0]) * k, c[1] + (l - c[1]) * k, c[2] + (l - c[2]) * k]; };
  // the palette a creature draws with: the game's P, plus spot colour that survives monochrome, and glow points
  function wrapP(P, ctx, o, glows) {
    const k = o.mono ? o.monoAmount : 0;
    return Object.assign({}, P, {
      col: c => P.col(desat(c, k)),
      cola: (c, a) => P.cola(desat(c, k), a),
      spot: c => P.col(c), spota: (c, a) => P.cola(c, a),
      glow(x, y, r, color, a) {   // in the creature's metres; recorded in device pixels through the transform of the moment
        const m = ctx.getTransform();
        glows.push({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, r: r * Math.hypot(m.a, m.b), color, a: a === undefined ? 0.5 : a, fog: P.fog });
      },
    });
  }
  const RING = []; for (let i = 0; i < 12; i++) RING.push([Math.cos(i / 12 * TAU), Math.sin(i / 12 * TAU)]);
  const cost = { ms: 0, sprites: 0 };
  // draw a creature (w x h metres, feet at the origin of the current metre-space transform) through the passes
  function drawEnhanced(ctx, P, s, draw, w, h, o, t, glowsOut) {
    const t0 = performance.now();
    const glows = glowsOut || [];
    const m = ctx.getTransform();
    const px = (x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (const [x, y] of [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]]) { const q = px(x, y); if (q[0] < bx0) bx0 = q[0]; if (q[0] > bx1) bx1 = q[0]; if (q[1] < by0) by0 = q[1]; if (q[1] > by1) by1 = q[1]; }
    const bw = bx1 - bx0, bh = by1 - by0;
    const any = o.ink > 0 || o.hatch > 0 || o.tone > 0 || o.rim > 0 || o.boil > 0;
    // nothing to do far away (a few pixels), and nothing worth doing once it fills the screen (the lunge): plain draw
    const screenH = ctx.canvas.height;
    if (!any || bw < 4 || bh < 6 || bh > screenH * 1.1 || bw * bh > 2.5e6) { draw(ctx, wrapP(P, ctx, o, glows)); drawGlows(ctx, glows, o); cost.ms += performance.now() - t0; return; }
    cost.sprites++;
    const pad = Math.ceil((o.ink || 0) + (o.rim ? o.rimPx : 0) + (o.boil || 0) + 4);
    const W = Math.ceil(bw) + 2 * pad, H = Math.ceil(bh) + 2 * pad;
    const ox = Math.floor(bx0) - pad, oy = Math.floor(by0) - pad;
    // line boil: the drawing shifts by a pixel or two, a few times a second, as if inked again
    let jx = 0, jy = 0;
    if (o.boil > 0) { const k = Math.floor(t * o.boilRate); jx = (hashf(k, 1) - 0.5) * 2 * o.boil; jy = (hashf(k, 2) - 0.5) * 2 * o.boil; }
    const off = cv('off', W, H), oc = off.getContext('2d');
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H);
    oc.setTransform(m.a, m.b, m.c, m.d, m.e - ox + jx, m.f - oy + jy);
    draw(oc, wrapP(P, oc, o, glows));
    for (const g of glows) if (g.canvas === undefined) { g.x += ox; g.y += oy; g.canvas = true; }   // recorded in the offscreen's pixels: back to the screen's
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const lightA = o.lightAngle, lx = Math.cos(lightA), ly = -Math.sin(lightA);   // toward the light, in screen pixels (y down)
    // the silhouette in one colour: the ink and the rim both start from it
    const mask = cv('mask', W, H), mc = mask.getContext('2d');
    if (o.ink > 0 || o.rim > 0) {
      mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, W, H); mc.globalCompositeOperation = 'source-over'; mc.drawImage(off, 0, 0, W, H, 0, 0, W, H);
      mc.globalCompositeOperation = 'source-in'; mc.fillStyle = P.col(o.inkColor || DEFAULTS.inkColor); mc.fillRect(0, 0, W, H);
    }
    if (o.ink > 0) {
      const r = o.ink, rings = r > 2.5 ? [r * 0.5, r] : [r];
      for (const rr of rings) for (const [cx, cy] of RING) ctx.drawImage(mask, 0, 0, W, H, ox + cx * rr, oy + cy * rr, W, H);
    }
    if (o.hatch > 0 || o.tone > 0) {
      const layer = cv('layer', W, H), lc = layer.getContext('2d');
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, W, H); lc.globalCompositeOperation = 'source-over'; lc.drawImage(off, 0, 0, W, H, 0, 0, W, H);
      lc.globalCompositeOperation = 'source-atop';
      if (o.hatch > 0) { lc.fillStyle = lc.createPattern(hatchTile(o.hatchSpacing, o.hatchWidth, true, 'rgba(0,0,0,1)'), 'repeat'); lc.fillRect(0, 0, W, H); }
      if (o.tone > 0) { lc.globalAlpha = o.tone / Math.max(o.hatch, o.tone); lc.fillStyle = lc.createPattern(toneTile(o.toneSize, o.toneSize * 0.26, 'rgba(0,0,0,1)'), 'repeat'); lc.fillRect(0, 0, W, H); lc.globalAlpha = 1; }
      // keep only the side away from the light: erase toward the light with a gradient across the sprite
      const cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2;
      const g = lc.createLinearGradient(cx + lx * R, cy + ly * R, cx - lx * R * o.shadowSide, cy - ly * R * o.shadowSide);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      lc.globalCompositeOperation = 'destination-out'; lc.fillStyle = g; lc.fillRect(0, 0, W, H);
      ctx.globalAlpha = Math.max(o.hatch, o.tone) * (1 - P.fog * 0.8);   // shading fades into the fog with the rest of the drawing
      ctx.drawImage(off, 0, 0, W, H, ox, oy, W, H);   // the drawing under the shading
      ctx.drawImage(layer, 0, 0, W, H, ox, oy, W, H);
      ctx.globalAlpha = 1;
    } else ctx.drawImage(off, 0, 0, W, H, ox, oy, W, H);
    if (o.rim > 0) {
      // the lit edge: the silhouette in the rim colour, minus itself shifted away from the light
      const rim = cv('rim', W, H), rc = rim.getContext('2d');
      rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, W, H); rc.globalCompositeOperation = 'source-over'; rc.drawImage(off, 0, 0, W, H, 0, 0, W, H);
      rc.globalCompositeOperation = 'source-in'; rc.fillStyle = P.col(o.rimColor || DEFAULTS.rimColor); rc.fillRect(0, 0, W, H);
      rc.globalCompositeOperation = 'destination-out'; rc.drawImage(mask, 0, 0, W, H, -lx * o.rimPx, -ly * o.rimPx, W, H);
      ctx.globalAlpha = o.rim * (1 - P.fog); ctx.drawImage(rim, 0, 0, W, H, ox, oy, W, H); ctx.globalAlpha = 1;
    }
    ctx.restore();
    drawGlows(ctx, glows, o);
    cost.ms += performance.now() - t0;
  }
  // soft lights a creature asked for (candles, eyes): additive, in screen space, over the drawing
  function drawGlows(ctx, glows, o) {
    if (!glows.length || !o.glow) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    for (const g of glows) {
      const r = Math.max(1, g.r * o.glow), a = g.a * (1 - g.fog);
      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
      grd.addColorStop(0, rgba(g.color, a)); grd.addColorStop(0.4, rgba(g.color, a * 0.35)); grd.addColorStop(1, rgba(g.color, 0));
      ctx.fillStyle = grd; ctx.fillRect(g.x - r, g.y - r, r * 2, r * 2);
    }
    ctx.restore();
    glows.length = 0;
  }
  const DEFAULTS = {
    ink: 1.5, inkColor: [6, 5, 8], hatch: 0.4, hatchSpacing: 4, hatchWidth: 1.1, tone: 0, toneSize: 6, shadowSide: 0.3,
    rim: 0.6, rimPx: 2, rimColor: [190, 205, 240], lightAngle: 2.2, boil: 0, boilRate: 8, mono: false, monoAmount: 1, glow: 1,
  };
  return { drawEnhanced, drawGlows, wrapP, DEFAULTS, cost, cv };
})();
