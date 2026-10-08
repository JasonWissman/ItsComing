'use strict';
// ---------- the recorder: a creature's draw(ctx, c, P) replayed into an SVG you can edit by hand ----------
// A fake Canvas 2D context that bakes every transform into path data (so the file has no nested transforms, which
// design tools handle badly) and writes one <g> per part. A creature marks its parts with P.part(name, px, py):
// the name is the group's id (which Figma, Illustrator and Inkscape keep as the layer name) and the pivot is a
// small magenta dot inside the group, which is the joint the lab turns the part about when the file comes back.
// Units: 1 SVG unit = 1 cm of the creature; feet on the bottom edge of the #bounds rectangle, which fixes the scale.
const RECORD = (() => {
  const R2 = v => Math.round(v * 100) / 100;
  function colorOf(style, alpha) {
    if (style && typeof style === 'object' && style.stops && style.stops.length) style = style.stops[Math.floor(style.stops.length / 2)];   // a gradient: its middle colour, flat
    if (typeof style !== 'string') return { color: '#808080', opacity: alpha };     // a pattern: flat grey, by hand later
    let m = /^rgba?\(([^)]+)\)/i.exec(style);
    if (m) { const p = m[1].split(',').map(parseFloat); const hex = '#' + [p[0], p[1], p[2]].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); return { color: hex, opacity: alpha * (p.length > 3 ? p[3] : 1) }; }
    m = /^#([0-9a-f]{3})$/i.exec(style); if (m) return { color: '#' + m[1][0] + m[1][0] + m[1][1] + m[1][1] + m[1][2] + m[1][2], opacity: alpha };
    if (/^#[0-9a-f]{6}$/i.test(style)) return { color: style.toLowerCase(), opacity: alpha };
    return { color: '#808080', opacity: alpha };
  }
  class Recorder {
    constructor(baseMatrix) {
      this.m = DOMMatrix.fromMatrix(baseMatrix); this.base = DOMMatrix.fromMatrix(baseMatrix);
      this.stack = []; this.path = []; this.clips = []; this.clipDefs = []; this.nClip = 0;
      this.fillStyle = '#000'; this.strokeStyle = '#000'; this.lineWidth = 1; this.lineCap = 'butt'; this.lineJoin = 'miter'; this.globalAlpha = 1; this.globalCompositeOperation = 'source-over';
      this.parts = []; this.part('body', 0, 0);
      this.canvas = { width: 1000, height: 1000 };
    }
    // ---- the part API, reached through P.part ----
    part(name, px, py) {
      const p = this.m.transformPoint({ x: px || 0, y: py || 0 });
      const existing = this.parts.find(q => q.name === name);
      if (existing) { this.cur = existing; return; }     // drawing returns to a part: its elements join it
      this.cur = { name, pivot: [R2(p.x), R2(p.y)], els: [] }; this.parts.push(this.cur);
    }
    // ---- state ----
    save() { this.stack.push({ m: DOMMatrix.fromMatrix(this.m), clips: this.clips.length, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, lineWidth: this.lineWidth, lineCap: this.lineCap, lineJoin: this.lineJoin, globalAlpha: this.globalAlpha }); }
    restore() { const s = this.stack.pop(); if (!s) return; this.m = s.m; this.clips.length = s.clips; this.fillStyle = s.fillStyle; this.strokeStyle = s.strokeStyle; this.lineWidth = s.lineWidth; this.lineCap = s.lineCap; this.lineJoin = s.lineJoin; this.globalAlpha = s.globalAlpha; }
    translate(x, y) { this.m.translateSelf(x, y); }
    rotate(a) { this.m.rotateSelf(a * 180 / Math.PI); }
    scale(x, y) { this.m.scaleSelf(x, y === undefined ? x : y); }
    transform(a, b, c, d, e, f) { this.m.multiplySelf(new DOMMatrix([a, b, c, d, e, f])); }
    setTransform(a, b, c, d, e, f) { this.m = DOMMatrix.fromMatrix(this.base).multiplySelf(new DOMMatrix([a, b, c, d, e, f])); }
    getTransform() { return DOMMatrix.fromMatrix(this.m); }
    pt(x, y) { const p = this.m.transformPoint({ x, y }); return [R2(p.x), R2(p.y)]; }
    // ---- paths, baked ----
    beginPath() { this.path = []; }
    moveTo(x, y) { this.path.push(['M', ...this.pt(x, y)]); }
    lineTo(x, y) { this.path.push([this.path.length ? 'L' : 'M', ...this.pt(x, y)]); }
    quadraticCurveTo(cx, cy, x, y) { this.path.push(['Q', ...this.pt(cx, cy), ...this.pt(x, y)]); }
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { this.path.push(['C', ...this.pt(c1x, c1y), ...this.pt(c2x, c2y), ...this.pt(x, y)]); }
    closePath() { if (this.path.length) this.path.push(['Z']); }
    rect(x, y, w, h) { this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.closePath(); }
    arc(x, y, r, a0, a1, ccw) { this.ellipse(x, y, r, r, 0, a0, a1, ccw); }
    // an elliptical arc as cubic curves in the ellipse's own frame, so it survives any transform
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) {
      let d = a1 - a0;
      if (ccw) { if (d > 0) d -= TAU * Math.ceil(d / TAU); if (d === 0 && a1 !== a0) d = -TAU; } else { if (d < 0) d += TAU * Math.ceil(-d / TAU); }
      if (Math.abs(d) > TAU) d = Math.sign(d) * TAU;
      const n = Math.max(1, Math.ceil(Math.abs(d) / (Math.PI / 2))), step = d / n, cr = Math.cos(rot), sr = Math.sin(rot);
      const at = a => { const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry; return [x + ex * cr - ey * sr, y + ex * sr + ey * cr]; };
      const der = a => { const ex = -Math.sin(a) * rx, ey = Math.cos(a) * ry; return [ex * cr - ey * sr, ex * sr + ey * cr]; };
      const k = 4 / 3 * Math.tan(step / 4);
      let a = a0; const p0 = at(a);
      this.path.length ? this.lineTo(p0[0], p0[1]) : this.moveTo(p0[0], p0[1]);
      for (let i = 0; i < n; i++) {
        const b = a + step, pa = at(a), pb = at(b), da = der(a), db = der(b);
        this.bezierCurveTo(pa[0] + da[0] * k, pa[1] + da[1] * k, pb[0] - db[0] * k, pb[1] - db[1] * k, pb[0], pb[1]);
        a = b;
      }
    }
    d() { return this.path.map(s => s[0] + s.slice(1).join(' ')).join(' '); }
    fill() { this.emit('fill'); }
    stroke() { this.emit('stroke'); }
    fillRect(x, y, w, h) { this.beginPath(); this.rect(x, y, w, h); this.fill(); }
    strokeRect(x, y, w, h) { this.beginPath(); this.rect(x, y, w, h); this.stroke(); }
    clearRect() {}
    clip() { const id = 'clip' + (++this.nClip); this.clipDefs.push('<clipPath id="' + id + '"><path d="' + this.d() + '"/></clipPath>'); this.clips.push(id); }
    fillText() {} strokeText() {} drawImage() {} setLineDash() {}
    createLinearGradient() { return { stops: [], addColorStop(o, c) { this.stops.push(c); } }; }
    createRadialGradient() { return { stops: [], addColorStop(o, c) { this.stops.push(c); } }; }
    createPattern() { return {}; }
    emit(kind) {
      const d = this.d(); if (!d) return;
      const c = colorOf(kind === 'fill' ? this.fillStyle : this.strokeStyle, this.globalAlpha);
      let attrs;
      if (kind === 'fill') attrs = 'fill="' + c.color + '"' + (c.opacity < 1 ? ' fill-opacity="' + R2(c.opacity) + '"' : '');
      else {
        const sc = Math.sqrt(Math.abs(this.m.a * this.m.d - this.m.b * this.m.c));
        attrs = 'fill="none" stroke="' + c.color + '" stroke-width="' + R2(this.lineWidth * sc) + '"' + (c.opacity < 1 ? ' stroke-opacity="' + R2(c.opacity) + '"' : '') + (this.lineCap !== 'butt' ? ' stroke-linecap="' + this.lineCap + '"' : '') + (this.lineJoin !== 'miter' ? ' stroke-linejoin="' + this.lineJoin + '"' : '');
      }
      let el = '<path ' + attrs + ' d="' + d + '"/>';
      for (let i = this.clips.length - 1; i >= 0; i--) el = '<g clip-path="url(#' + this.clips[i] + ')">' + el + '</g>';
      this.cur.els.push(el);
    }
  }
  // the palette the recorder hands to the creature: raw colours (no fog, no light), and the part marker
  function recordP(rec) {
    return { fog: 0, fogColor: [0, 0, 0], t: 0.035, lit: 0, col: c => rgba(c), cola: (c, a) => rgba(c, a), raw: c => rgba(c), spot: c => rgba(c), spota: (c, a) => rgba(c, a), glow() {}, part: (n, x, y) => rec.part(n, x, y) };
  }
  // the creature at rest: no step, no bob, head level, far enough that nothing reaches for you
  function restState(CR, type) {
    const c = { type, CR, x: 0, z: 30, dist: 30, D0: 130, u: 0, gait: 0, t: 0.035, seen: true, visFrac: 1, moving: false, lunge: 0, yOff: 0, lat: 0, frozen: false, dead: false, hits: 0, hurtFlash: 0, rand: mulberry32(5), near: 0, flames: [] };
    CR.init(c);
    return c;
  }
  function exportSvg(id, CR) {
    const h = CR.h, w = CR.w, H = h * 100, W = w * 100;
    const base = new DOMMatrix([100, 0, 0, -100, 0, H]);   // metres, y up -> cm, y down, feet on the bottom edge
    const rec = new Recorder(base);
    const c = restState(CR, id);
    CR.draw(rec, c, recordP(rec));
    const parts = rec.parts.filter(p => p.els.length);
    const groups = parts.map(p => '  <g id="' + p.name + '">\n    <circle id="' + p.name + '-pivot" cx="' + p.pivot[0] + '" cy="' + p.pivot[1] + '" r="1.2" fill="#ff00ff"/>\n    ' + p.els.join('\n    ') + '\n  </g>').join('\n');
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + R2(-W / 2) + ' 0 ' + R2(W) + ' ' + R2(H) + '" width="' + R2(W) + 'cm" height="' + R2(H) + 'cm" data-creature="' + id + '" data-height="' + h + '" data-width="' + w + '">\n' +
      '  <title>' + CR.name + ' (It\'s Coming)</title>\n' +
      '  <desc>Exported from the code at rest. One unit is one centimetre of the creature; the feet stand on the bottom edge of #bounds, which sets the scale, so keep it. Each top-level group is a part the lab animates (head, armL, armR, legL, legR, body, and any other name is a still part); the magenta dot in a group is its joint: move the dot to change where the part turns. Edit the shapes freely, add or remove shapes, keep the group names.</desc>\n' +
      (rec.clipDefs.length ? '  <defs>\n    ' + rec.clipDefs.join('\n    ') + '\n  </defs>\n' : '') +
      '  <rect id="bounds" x="' + R2(-W / 2) + '" y="0" width="' + R2(W) + '" height="' + R2(H) + '" fill="none" stroke="none"/>\n' +
      groups + '\n</svg>\n';
  }
  return { exportSvg, Recorder };
})();
