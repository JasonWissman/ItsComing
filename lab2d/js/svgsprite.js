'use strict';
// ---------- an SVG as a creature: traced or drawn art, as live paths or as a sprite rendered once ----------
// Drop an SVG on the page. Its paths become Path2D objects drawn in the creature's metre space with the game's fog
// and light applied per fill (live), or it is rendered once per size into a canvas and drawn as an image with the
// fog composited over it (raster). The panel shows the cost of each, which is the question a traced reference
// raises: a tracing is hundreds to thousands of fills, a sprite is one draw.
const SVGSPRITE = (() => {
  function parseColor(s) {
    if (!s || s === 'none' || s === 'transparent') return null;
    s = s.trim();
    let m = /^#([0-9a-f]{3})$/i.exec(s); if (m) return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
    m = /^#([0-9a-f]{6})/i.exec(s); if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = /^rgba?\(([^)]+)\)/i.exec(s); if (m) { const p = m[1].split(',').map(parseFloat); return [p[0], p[1], p[2]]; }
    const named = { black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], gray: [128, 128, 128], grey: [128, 128, 128] };
    return named[s.toLowerCase()] || null;
  }
  // the SVG transform attribute: translate, scale, rotate, matrix
  function parseTransform(s) {
    const m = new DOMMatrix();
    if (!s) return m;
    const re = /(\w+)\s*\(([^)]*)\)/g; let x;
    while ((x = re.exec(s))) {
      const a = x[2].split(/[\s,]+/).filter(v => v !== '').map(parseFloat);
      if (x[1] === 'translate') m.translateSelf(a[0] || 0, a[1] || 0);
      else if (x[1] === 'scale') m.scaleSelf(a[0], a.length > 1 ? a[1] : a[0]);
      else if (x[1] === 'rotate') { if (a.length > 2) m.translateSelf(a[1], a[2]); m.rotateSelf(a[0]); if (a.length > 2) m.translateSelf(-a[1], -a[2]); }
      else if (x[1] === 'matrix' && a.length === 6) m.multiplySelf(new DOMMatrix([a[0], a[1], a[2], a[3], a[4], a[5]]));
    }
    return m;
  }
  function styleOf(el, name) {
    const st = el.getAttribute('style');
    if (st) { const m = new RegExp('(?:^|;)\\s*' + name + '\\s*:\\s*([^;]+)').exec(st); if (m) return m[1].trim(); }
    return el.getAttribute(name);
  }
  function viewBoxOf(root) {
    let vb = (root.getAttribute('viewBox') || '').split(/[\s,]+/).map(parseFloat);
    if (vb.length !== 4 || vb.some(isNaN)) vb = [0, 0, parseFloat(root.getAttribute('width')) || 100, parseFloat(root.getAttribute('height')) || 100];
    return vb;
  }
  // the shapes under an element, as Path2D objects with their colours and baked transforms; skip(el) leaves one out
  // the document's <clipPath> definitions, each as the shapes it holds (in the user space of what it clips)
  function clipDefs(root) {
    const doc = root.ownerDocument || root, defs = {};
    for (const cp of Array.from(doc.getElementsByTagName('clipPath'))) {
      const id = cp.getAttribute('id'); if (!id) continue;
      defs[id] = parseNode(cp, null, null, true).map(p => p);
    }
    return defs;
  }
  function parseNode(root, vb, skip, inner) {
    const paths = [];
    const clips = inner ? {} : clipDefs(root);
    function walk(el, inherited) {
      if (skip && skip(el)) return;
      const tag = el.nodeName.toLowerCase();
      if ((tag === 'defs' || tag === 'clippath') && !inner) return;
      if (tag === 'mask' || tag === 'metadata' || tag === 'title' || tag === 'desc' || tag === 'style') return;
      const st = Object.assign({}, inherited);
      const cp = /url\(#([^)]+)\)/.exec(styleOf(el, 'clip-path') || '');
      if (cp && clips[cp[1]]) st.clips = (inherited.clips || []).concat([{ shapes: clips[cp[1]], m: st.m || inherited.m }]);
      const f = styleOf(el, 'fill'); if (f !== null && f !== undefined) st.fill = f;
      const sk = styleOf(el, 'stroke'); if (sk !== null && sk !== undefined) st.stroke = sk;
      const sw = styleOf(el, 'stroke-width'); if (sw) st.lw = parseFloat(sw);
      const fo = styleOf(el, 'fill-opacity'); const op = styleOf(el, 'opacity');
      st.alpha = (inherited.alpha === undefined ? 1 : inherited.alpha) * (fo ? parseFloat(fo) : 1) * (op ? parseFloat(op) : 1);
      st.m = inherited.m.multiply(parseTransform(el.getAttribute('transform')));
      let p = null;
      if (tag === 'path') { const d = el.getAttribute('d'); if (d) p = new Path2D(d); }
      else if (tag === 'polygon' || tag === 'polyline') { const pts = (el.getAttribute('points') || '').split(/[\s,]+/).map(parseFloat).filter(v => !isNaN(v)); if (pts.length >= 4) { p = new Path2D(); p.moveTo(pts[0], pts[1]); for (let i = 2; i + 1 < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]); if (tag === 'polygon') p.closePath(); } }
      else if (tag === 'rect') {
        const x = parseFloat(el.getAttribute('x') || 0), y = parseFloat(el.getAttribute('y') || 0), w = parseFloat(el.getAttribute('width') || 0), h = parseFloat(el.getAttribute('height') || 0);
        if (!(x <= vb[0] + 0.5 && y <= vb[1] + 0.5 && w >= vb[2] - 1 && h >= vb[3] - 1)) { p = new Path2D(); p.rect(x, y, w, h); }   // a rect the size of the page is a background, not the drawing
      }
      else if (tag === 'circle') { p = new Path2D(); p.arc(parseFloat(el.getAttribute('cx') || 0), parseFloat(el.getAttribute('cy') || 0), parseFloat(el.getAttribute('r') || 0), 0, TAU); }
      else if (tag === 'ellipse') { p = new Path2D(); p.ellipse(parseFloat(el.getAttribute('cx') || 0), parseFloat(el.getAttribute('cy') || 0), parseFloat(el.getAttribute('rx') || 0), parseFloat(el.getAttribute('ry') || 0), 0, 0, TAU); }
      if (p) {
        const fill = st.fill === undefined ? [0, 0, 0] : parseColor(st.fill), stroke = parseColor(st.stroke);
        if (fill || stroke) paths.push({ path: p, fill, stroke, lw: st.lw || 1, alpha: st.alpha, m: st.m, clips: st.clips || null });
      }
      for (const ch of el.children) walk(ch, st);
    }
    walk(root, { m: new DOMMatrix(), alpha: 1, clips: null });
    return paths;
  }
  function parse(text) {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.nodeName.toLowerCase() !== 'svg') throw new Error('not an SVG');
    const vb = viewBoxOf(root);
    const paths = parseNode(root, vb);
    // the drawing's bounds: rendered small and scanned (Path2D has no bounds of its own)
    const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d', { willReadFrequently: true });
    const k = N / Math.max(vb[2], vb[3]);
    x.setTransform(k, 0, 0, k, -vb[0] * k, -vb[1] * k);
    drawPaths(x, paths, () => '#000', 1);
    const d = x.getImageData(0, 0, N, N).data;
    let x0 = N, y0 = N, x1 = -1, y1 = -1;
    for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) if (d[(yy * N + xx) * 4 + 3] > 8) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    const bbox = x1 < 0 ? { x: vb[0], y: vb[1], w: vb[2], h: vb[3] } : { x: vb[0] + x0 / k, y: vb[1] + y0 / k, w: (x1 - x0 + 1) / k, h: (y1 - y0 + 1) / k };
    return { paths, viewBox: vb, bbox, count: paths.length };
  }
  function drawPaths(ctx, paths, colorOf, alphaScale) {
    let lastM = null, lastClips = null;
    ctx.save();
    for (const p of paths) {
      if (p.m !== lastM || p.clips !== lastClips) {
        ctx.restore(); ctx.save();
        // each clip region with its own transform baked in, applied here (a clip set inside save/restore would be undone)
        if (p.clips) for (const c of p.clips) { const region = new Path2D(), cm = new DOMMatrix([c.m.a, c.m.b, c.m.c, c.m.d, c.m.e, c.m.f]); for (const s of c.shapes) region.addPath(s.path, cm.multiply(new DOMMatrix([s.m.a, s.m.b, s.m.c, s.m.d, s.m.e, s.m.f]))); ctx.clip(region); }
        ctx.transform(p.m.a, p.m.b, p.m.c, p.m.d, p.m.e, p.m.f); lastM = p.m; lastClips = p.clips;
      }
      ctx.globalAlpha = p.alpha * alphaScale;
      if (p.fill) { ctx.fillStyle = colorOf(p.fill); ctx.fill(p.path); }
      if (p.stroke) { ctx.strokeStyle = colorOf(p.stroke); ctx.lineWidth = p.lw; ctx.stroke(p.path); }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  // a sprite h metres tall: the drawing's bounds fit the box, feet at the bottom, centred
  function makeSprite(parsed, h) {
    const bb = parsed.bbox, k = h / bb.h, w = bb.w * k;
    const rasters = {};
    function live(ctx, P) {
      ctx.save(); ctx.scale(k, -k); ctx.translate(-(bb.x + bb.w / 2), -(bb.y + bb.h));
      ctx.save();
      const cache = new Map();
      drawPaths(ctx, parsed.paths, c => { const key = c[0] + ',' + c[1] + ',' + c[2]; let v = cache.get(key); if (!v) { v = P.col(c); cache.set(key, v); } return v; }, 1);
      ctx.restore(); ctx.restore();
    }
    function raster(px) {
      let r = rasters[px];
      if (r) return r;
      const c = document.createElement('canvas'); c.width = Math.ceil(px * bb.w / bb.h) + 2; c.height = px + 2;
      const x = c.getContext('2d'); const kk = px / bb.h;
      x.setTransform(kk, 0, 0, kk, 1 - bb.x * kk, 1 - bb.y * kk); x.save();
      drawPaths(x, parsed.paths, cc => rgba(cc), 1);
      x.restore();
      return rasters[px] = c;
    }
    // drawn as an image: the fog and the light are composited over the sprite afterwards
    function rasterDraw(ctx, P, s) {
      const px = s * h <= 96 ? 96 : s * h <= 384 ? 384 : 1536;   // three sizes: far, middle, close
      const img = raster(px);
      ctx.save(); ctx.scale(w / img.width, -h / img.height); ctx.translate(-img.width / 2, -img.height);
      ctx.drawImage(img, 0, 0);
      if (P.fog > 0.004 || P.lit > 0.01) {
        ctx.globalCompositeOperation = 'source-atop';
        if (P.fog > 0.004) { ctx.fillStyle = rgba(P.fogColor, P.fog); ctx.fillRect(0, 0, img.width, img.height); }
        if (P.lit > 0.01) { ctx.fillStyle = rgba([255, 240, 220], Math.min(0.5, P.lit * 0.4)); ctx.fillRect(0, 0, img.width, img.height); }
      }
      ctx.restore();
    }
    return { w, h, k, live, rasterDraw, raster, count: parsed.count, bbox: bb };
  }
  async function fromFile(file) { return parse(await file.text()); }
  async function fromUrl(url) { const r = await fetch(url); if (!r.ok) throw new Error('could not load ' + url + ': ' + r.status); return parse(await r.text()); }
  return { parse, parseNode, viewBoxOf, drawPaths, makeSprite, fromFile, fromUrl };
})();
