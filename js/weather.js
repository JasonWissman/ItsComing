'use strict';
// ---------- weather: a pool of particles living in a cylinder around the eye ----------
// spec: { kind: 'rain'|'snow'|'ash'|'mist'|'motes', density, wind, lightning: [minGap, maxGap] }
const WEATHER = (() => {
  let parts = [], kind = null, wind = 0, spec = null, rng = null;
  let nextBolt = 0, thunderAt = 0, bolt = 0;
  const COUNT = { rain: 380, snow: 240, ash: 140, mist: 26, motes: 140 };
  function spawn(p, fresh) {
    p.a = rng() * TAU; p.r = 0.6 + rng() * 6.5; p.ph = rng() * TAU; p.s = 0.6 + rng() * 0.8;
    if (kind === 'rain') { p.y = fresh ? rng() * 4.5 : 4.5; p.v = 8 + rng() * 4; p.len = 0.25 + rng() * 0.25; }
    else if (kind === 'snow') { p.y = fresh ? rng() * 4.5 : 4.5; p.v = 0.5 + rng() * 0.6; }
    else if (kind === 'ash') { p.y = fresh ? rng() * 4.5 : 4.5; p.v = 0.25 + rng() * 0.35; p.glow = rng() < 0.35; }
    else if (kind === 'mist') { p.y = 0.2 + rng() * 1.6; p.v = 0; p.r = 2 + rng() * 7; p.w = 2 + rng() * 4; }
    else { p.y = rng() * 3; p.v = (rng() - 0.5) * 0.15; }
    return p;
  }
  function set(s, seed) {
    spec = s || null; kind = s ? s.kind : null; wind = s ? (s.wind || 0) : 0;
    parts = []; nextBolt = s && s.lightning ? 4 + Math.random() * 6 : Infinity; thunderAt = 0; bolt = 0;
    if (!kind) return;
    rng = mulberry32((seed || 1) + 99);
    const n = Math.round((COUNT[kind] || 150) * (s.density || 1));
    for (let i = 0; i < n; i++) parts.push(spawn({}, true));
  }
  function update(dt, t) {
    if (!kind) return;
    for (const p of parts) {
      p.y -= p.v * dt;
      if (kind === 'snow' || kind === 'ash') p.a += (wind * 0.25 + Math.sin(t * 1.3 + p.ph) * 0.15) * dt / Math.max(0.6, p.r);
      else if (kind === 'rain') p.a += wind * 0.15 * dt / Math.max(0.6, p.r);
      else if (kind === 'mist') p.a += (0.03 + wind * 0.05) * dt;
      else if (kind === 'motes') { p.a += Math.sin(t * 0.7 + p.ph) * 0.02 * dt; if (p.y < 0.1 || p.y > 3.2) p.v = -p.v; }
      if (p.y < -0.3) spawn(p, false);
    }
    if (spec && spec.lightning) {
      nextBolt -= dt;
      if (nextBolt <= 0) {
        bolt = 1; nextBolt = spec.lightning[0] + Math.random() * (spec.lightning[1] - spec.lightning[0]);
        const reduced = SAVE.data.settings.reducedFlash;
        LIGHT.flash(reduced ? 0.35 : 0.9); G.flash(reduced ? 0.15 : 0.32);
        thunderAt = t + 1 + Math.random() * 3;
      }
      if (thunderAt && t >= thunderAt) { thunderAt = 0; AUDIO.sfx('thunder'); G.shake(0.25); }
    }
  }
  function draw(ctx) {
    if (!kind || !parts.length) return;
    const slant = wind * 0.5;
    if (kind === 'rain') {
      ctx.strokeStyle = 'rgba(200,210,230,0.28)'; ctx.lineWidth = 1; ctx.beginPath();
      for (const p of parts) {
        const x = Math.sin(p.a) * p.r, z = Math.cos(p.a) * p.r;
        const sp = R.screenPos(x, p.y, z); if (!sp) continue;
        const len = p.len * sp.scale;
        ctx.moveTo(sp.x, sp.y); ctx.lineTo(sp.x + slant * len * 0.3, sp.y - len);
      }
      ctx.stroke();
    } else if (kind === 'snow') {
      ctx.fillStyle = 'rgba(235,240,250,0.85)';
      for (const p of parts) {
        const x = Math.sin(p.a) * p.r, z = Math.cos(p.a) * p.r;
        const sp = R.screenPos(x, p.y, z); if (!sp) continue;
        const s = Math.max(1, Math.min(4, sp.scale * 0.012 * p.s));
        ctx.fillRect(sp.x, sp.y, s, s);
      }
    } else if (kind === 'ash') {
      for (const p of parts) {
        const x = Math.sin(p.a) * p.r, z = Math.cos(p.a) * p.r;
        const sp = R.screenPos(x, p.y, z); if (!sp) continue;
        const s = Math.max(1, Math.min(4, sp.scale * 0.01 * p.s));
        ctx.fillStyle = p.glow ? 'rgba(255,' + (120 + 80 * Math.abs(Math.sin(G.t * 6 + p.ph))) + ',60,0.9)' : 'rgba(90,86,84,0.8)';
        ctx.fillRect(sp.x, sp.y, s, s);
      }
    } else if (kind === 'mist') {
      for (const p of parts) {
        const x = Math.sin(p.a) * p.r, z = Math.cos(p.a) * p.r;
        const sp = R.screenPos(x, p.y, z); if (!sp) continue;
        const w = p.w * sp.scale, h = w * 0.22;
        const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, w / 2);
        g.addColorStop(0, 'rgba(180,180,190,' + (0.11 * p.s) + ')'); g.addColorStop(1, 'rgba(180,180,190,0)');
        ctx.fillStyle = g; ctx.save(); ctx.translate(sp.x, sp.y); ctx.scale(1, 0.22); ctx.translate(-sp.x, -sp.y); ctx.fillRect(sp.x - w / 2, sp.y - w / 2, w, w); ctx.restore();
        void h;
      }
    } else if (kind === 'motes') {
      ctx.fillStyle = 'rgba(255,245,220,0.55)';
      for (const p of parts) {
        const x = Math.sin(p.a) * p.r, z = Math.cos(p.a) * p.r;
        const sp = R.screenPos(x, p.y, z); if (!sp) continue;
        const s = Math.max(1, Math.min(3, sp.scale * 0.006 * p.s));
        ctx.globalAlpha = 0.3 + 0.4 * Math.abs(Math.sin(G.t * 1.5 + p.ph));
        ctx.fillRect(sp.x, sp.y, s, s);
      }
      ctx.globalAlpha = 1;
    }
  }
  return { set, update, draw, get kind() { return kind; }, get bolt() { return bolt; } };
})();
