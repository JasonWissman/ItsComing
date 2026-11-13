'use strict';
// ---------- Creature Lab: every creature, drawn by its own code from js/creatures, cycling through its animations ----------
// Each lab/poses/<type>.js registers one creature with LAB.creature(type, spec):
//   spec: { night, stage, dist (default c.dist), lit (0..1), fit: { h, w, y0 } (the metres to frame, if not CR.h/CR.w),
//           setup(c) (once per animation, after CR.init), anims: [anim, ...] }
//   anim: { name, note (what the game uses it for), dur (seconds per loop, default 4), dist, lit, fit,
//           walk (metres a second: drives c.gait as the game does), modes (true: CR.speedMult runs, so its own modes cycle),
//           seen (what speedMult is told, default true), still (no breathing sway), set(c), tick(c, k, dt, T) (k: 0..1 through
//           the loop, T: seconds since the loop began), back(ctx, c, P) / front(ctx, c, P) (props, in the creature's metres,
//           feet at 0,0, +y up), draw(ctx, c, P, CR) (instead of CR.draw, for a pose that needs it) }
// The camera: the eye at (0, eyeH, 0) looking along +z, the creature's feet at (0, 0, c.dist). R.screenPos and R.f follow
// it, so a creature that draws in screen space (the climber, the demon) is framed the same way as the rest.

// stand-ins for the game's globals that the creature code reaches for
const AUDIO = new Proxy({}, { get: () => () => {} });
const SAVE = { data: { settings: { reducedMotion: false, reducedFlash: false, textures: true, theme: 'night' } } };
const G = { L: { won: false, t: 0, eyeH: 1.65, s: {} }, cam: { yaw: 0, pitch: 0 }, e: [0, 0], h: [0, 0] };
const R = {
  W: 300, H: 400, f: 600, viewY: 0, horizon: 100, eyeH: 1.65,
  // a world point (feet of the creature at 0,0,dist) to the canvas, in CSS px
  screenPos(x, y, z) { if (z <= 0.05) return null; return { x: this.W / 2 + this.f * x / z, y: this.horizon - this.f * (y - this.eyeH) / z, z }; },
  projectRect(x, y, z, w, h) { const a = this.screenPos(x - w / 2, y + h, z), b = this.screenPos(x + w / 2, y, z); return a && b ? { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y } : null; },
};

const LAB = (() => {
  const list = [];
  const BGS = {
    night: { sky: ['#0d1016', '#171b24'], ground: '#0b0d11', line: 'rgba(160,170,190,0.18)', fog: [22, 26, 34] },
    grey: { sky: ['#5d6066', '#6a6d73'], ground: '#4f5257', line: 'rgba(255,255,255,0.18)', fog: [104, 107, 114] },
    pale: { sky: ['#c9c6bf', '#d6d3cc'], ground: '#b8b4ac', line: 'rgba(0,0,0,0.18)', fog: [205, 202, 195] },
  };
  const opts = { bg: 'night', scale: 'fit', speed: 1, playing: true, fog: 0, lit: null, dist: null, scrub: null };
  function creature(type, spec) { list.push(Object.assign({ type }, spec)); }

  // a fresh creature as makeCreature would build it, then the night's own setup and the animation's
  function makeC(entry, anim) {
    const CR = CREATURES[entry.type];
    const c = {
      type: entry.type, CR, lane: { y: 0, follow: true }, yaw: 0, idx: 0, D0: 20, T: 60, gamma: 1, seenMult: 1, unseenMult: 1.3,
      u: 0, dist: 20, gait: 0, t: 0, seen: true, seenLast: true, visFrac: 1, visible: true, lit: 0, lat: 0, yOff: 0, lunge: 0,
      frozen: false, reached: false, hits: 0, dead: false, moving: false, timeScale: CR.timeScale || 1, rand: mulberry32(1234 + entry.type.length * 77),
      distFn: null, hold: null, catchDist: CR.catchDist, laneOptions: null, fixedLane: true,
      retarget() {}, pos() { return { x: 0, y: 0, z: this.dist }; },
    };
    c.dist = c.D0 = pick(anim.dist, entry.dist, 12);
    CR.init(c);
    if (entry.setup) entry.setup(c);
    if (anim.set) anim.set(c);
    if (anim.walk) c.moving = true;
    return c;
  }
  function pick(...v) { for (const x of v) if (x !== undefined && x !== null) return x; }

  // one card: a canvas and the animation it is on
  function Card(entry, canvas, onChange) {
    this.entry = entry; this.canvas = canvas; this.onChange = onChange; this.i = 0; this.T = 0; this.err = null;
    this.reset();
  }
  Card.prototype.anim = function () { return this.entry.anims[this.i]; };
  Card.prototype.reset = function () {
    this.T = 0; this.err = null;
    try { this.c = makeC(this.entry, this.anim()); } catch (e) { this.err = e; console.error(e); }
    if (this.onChange) this.onChange(this);
  };
  Card.prototype.go = function (d) { const n = this.entry.anims.length; this.i = (this.i + d + n) % n; this.reset(); };
  Card.prototype.dur = function () { return this.anim().dur || 4; };
  // advance the clock by dt (seconds), as the game's update would
  Card.prototype.step = function (dt) {
    if (this.err) return;
    const a = this.anim(), c = this.c, CR = c.CR, dur = this.dur();
    let T = this.T + dt;
    if (T >= dur) { if (a.once) T = dur; else { this.T = 0; try { this.c = makeC(this.entry, a); } catch (e) { this.err = e; return; } return this.step(T - dur); } }
    this.T = T;
    try {
      const d = dt;
      c.t += d * c.timeScale;
      if (a.walk) c.gait += a.walk * d * CR.stepRate * Math.PI;
      if (a.modes) CR.speedMult(c, d, a.seen === undefined ? true : a.seen);
      if (a.tick) a.tick(c, clamp(T / dur, 0, 1), d, T);
    } catch (e) { this.err = e; console.error(e); }
  };
  // jump to a time in the loop by replaying it from the start (so modes and ramps are where they would be)
  Card.prototype.seek = function (T) {
    this.T = 0; try { this.c = makeC(this.entry, this.anim()); } catch (e) { this.err = e; return; }
    const n = Math.ceil(T / (1 / 60));
    for (let i = 0; i < n; i++) this.step(Math.min(1 / 60, T - i / 60));
  };
  Card.prototype.draw = function (o) {
    const cv = this.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const ctx = cv.getContext('2d'), bg = BGS[o.bg] || BGS.night;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const a = this.anim(), c = this.c, entry = this.entry;
    // the frame: fit this creature (and its props) to the card, or one scale for all of them
    const fit = Object.assign({ h: c ? c.CR.h : 2, w: c ? c.CR.w : 1, y0: 0 }, entry.fit, a.fit);
    const d = c ? Math.max(0.3, c.dist) : 10;
    let ppm = o.scale === 'true' ? (H * 0.8) / o.trueH : Math.min((H * 0.8) / (fit.h - fit.y0), (W * 0.86) / fit.w);
    let feetY = H * 0.9 + fit.y0 * ppm;
    // a lunge (anim.zoom) grows as it closes, as it does in the game, about its face (which stays where it was)
    if (a.zoom && c && c.lungeFrom) { const z = Math.min(a.zoom === true ? 4 : a.zoom, c.lungeFrom / Math.max(0.3, c.dist)), fy = c.CR.faceY; feetY = feetY - fy * ppm + fy * ppm * z; ppm *= z; feetY += Math.max(0, H * 0.42 - (feetY - fy * ppm)); }   // and never so high its head leaves the card
    R.W = W; R.H = H; R.f = ppm * d; R.eyeH = G.L.eyeH; R.horizon = feetY - R.f * R.eyeH / d; R.viewY = 0;
    // background: sky, the ground from the feet down, a faint line where they stand
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, bg.sky[0]); sky.addColorStop(1, bg.sky[1]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = bg.ground; ctx.fillRect(0, feetY, W, H - feetY);
    ctx.fillStyle = bg.line; ctx.fillRect(0, feetY, W, 1);
    if (o.grid) { ctx.fillStyle = bg.line; for (let m = 1; m * ppm < H; m++) { ctx.fillRect(0, feetY - m * ppm, 8, 1); ctx.fillText(m + ' m', 10, feetY - m * ppm + 3); } }
    if (this.err || !c) { ctx.fillStyle = '#e07a6a'; ctx.font = '12px system-ui'; wrapText(ctx, String(this.err && this.err.message || this.err), 10, 20, W - 20, 15); return; }
    const lit = pick(o.lit, a.lit, entry.lit, 0);
    c.lit = lit;
    const fogC = bg.fog, fogA = o.fog || 0;
    const li = lit > 0 ? { lit: lit * 1.2, color: [255, 214, 160] } : null;
    const P = {
      fog: fogA, fogColor: fogC, t: c.t, lit,
      col: (k, s) => rgba(mixc(li ? LIGHT.apply(k, s === undefined ? li : { lit: li.lit * s, color: li.color }) : k, fogC, fogA)),
      cola: (k, al) => rgba(mixc(li ? LIGHT.apply(k, li) : k, fogC, fogA), al),
      raw: k => rgba(k),
    };
    ctx.save();
    ctx.translate(W / 2, feetY - (c.yOff || 0) * ppm);
    ctx.scale(ppm, -ppm);
    try {
      if (a.back) { ctx.save(); a.back(ctx, c, P); ctx.restore(); }
      ctx.save();
      // the game's own idle sway: a slow breath, and a slight lean when standing still
      if (!a.still && !c.dead && !c.lunge) { ctx.scale(1, 1 + 0.014 * Math.sin(c.t * 1.6)); if (!c.moving) ctx.rotate(0.008 * Math.sin(c.t * 0.7)); }
      if (a.draw) a.draw(ctx, c, P, c.CR); else c.CR.draw(ctx, c, P);
      ctx.restore();
      if (a.front) { ctx.save(); a.front(ctx, c, P); ctx.restore(); }
    } catch (e) { this.err = e; console.error(e); }
    ctx.restore();
  };
  function wrapText(ctx, s, x, y, w, lh) {
    let line = '';
    for (const word of s.split(' ')) { const t = line ? line + ' ' + word : word; if (ctx.measureText(t).width > w && line) { ctx.fillText(line, x, y); y += lh; line = word; } else line = t; }
    ctx.fillText(line, x, y);
  }
  // the death lunge as the game plays it (game.js, 'dying'): after the creature's death.delay, c.lunge goes 0..1 over
  // death.dur while it closes from where it was to 0.55 m (the feet stay put here, so the frame holds it)
  function lunge(extra) {
    return Object.assign({
      name: 'Death lunge', dur: 1.6, dist: 3, zoom: true, note: 'What you see the moment it catches you.', still: true,
      set(c) { c.frozen = true; c.lungeFrom = c.dist; },
      tick(c, k, dt, T) {
        const sp = c.deathSpec || c.CR.death || {}, delay = sp.delay === undefined ? 0.22 : sp.delay, dur = sp.dur === undefined ? 0.5 : sp.dur;
        const q = clamp((T - delay) / dur, 0, 1);
        c.lunge = q; c.dist = lerp(c.lungeFrom, 0.55, easeIn(q));
      },
    }, extra);
  }
  return { creature, list, opts, Card, BGS, lunge };
})();
