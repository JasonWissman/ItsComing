'use strict';
// ---------- Title Screen Lab: five title screens for the game, each its own scene behind the game's title menu ----------
// In all of them the title screen itself plays the game's rule: every time you look away (onto the menu, or away from
// the window) and look back, it is closer. A concept has: id, name, blurb, layout (overlay classes), font, steps (how many
// looks before it is on you), draw(ctx, W, H, t, S) and, if it wants one, a moment of its own for each look (S.stepT is the
// time since the last one, S.prev the step before).
(() => {
  const cv = document.getElementById('scene'), ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  addEventListener('resize', resize); resize();

  // ---- shared pieces ----
  const grainTile = (() => { const c = document.createElement('canvas'); c.width = c.height = 192; const g = c.getContext('2d'), im = g.createImageData(192, 192); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); return c; })();
  function grain(a) { ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; const ox = Math.random() * 192, oy = Math.random() * 192; ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(grainTile, 'repeat'); ctx.fillRect(0, 0, W + 192, H + 192); ctx.restore(); }
  function vignette(a, inner) { const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * (inner || 0.25), W / 2, H / 2, Math.hypot(W, H) * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + a + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  const rnd = mulberry32(13);
  // a tall, thin figure standing, in metres (feet at 0,0, +y up, 2.3 m tall), its long arms to the knees; eyes: [r,g,b] or null
  function figure(g, col, eyes, opts) {
    const o = opts || {}, sw = o.sway || 0;
    for (const s of [-1, 1]) P_limb(g, [[s * 0.075, 1.0], [s * 0.1 + sw * 0.3, 0.53], [s * 0.11, 0.03]], 0.072, col);   // the legs, too long
    g.fillStyle = col; g.beginPath();   // the torso: narrow hips, a pinched waist, high bony shoulders
    g.moveTo(-0.12, 0.96); g.lineTo(0.12, 0.96); g.quadraticCurveTo(0.09 + sw, 1.3, 0.19 + sw, 1.7); g.quadraticCurveTo(0.2 + sw, 1.8, 0.06 + sw, 1.83);
    g.lineTo(-0.06 + sw, 1.83); g.quadraticCurveTo(-0.2 + sw, 1.8, -0.19 + sw, 1.7); g.quadraticCurveTo(-0.09 + sw, 1.3, -0.12, 0.96); g.fill();
    for (const s of [-1, 1]) {   // the arms, hanging past the knees, or up and reaching
      const sh = [s * 0.18 + sw, 1.74], el = o.reach ? [s * 0.36, 1.32] : [s * 0.25 + sw * 0.5, 1.26], hd = o.reach ? [s * 0.3, 1.58] : [s * 0.27, 0.74];
      P_limb(g, [sh, el, hd], 0.05, col);
      fingers(g, hd[0], hd[1], o.reach ? Math.PI / 2 : -Math.PI / 2 + s * 0.08, 0.16, 0.15, 0.018, col);
    }
    P_limb(g, [[sw, 1.8], [sw * 1.2 + (o.tilt || 0) * 0.04, 1.98]], 0.05, col);
    g.save(); g.translate(sw * 1.2, 2.1); g.rotate(o.tilt || 0); P_ell(g, 0, 0, 0.115, 0.165, col);
    if (eyes) { const r = o.eyeR || 0.014; P_ell(g, -0.042, 0.02, r, r, rgba(eyes)); P_ell(g, 0.042, 0.02, r, r, rgba(eyes)); }
    g.restore();
  }

  // ---- 1. Eyes in the dark ----
  const EYES = {
    id: 'eyes', name: 'Eyes in the dark', layout: 'low', font: "'IM Fell English SC', Georgia, serif", steps: 6,
    blurb: 'Pitch black, and two pale points of eyes a long way off. Each time you look back they are nearer, and more of what they belong to shows.',
    D: [70, 38, 22, 13, 7.5, 4.2, 2.4],
    draw(g, t, S) {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const y0 = H * 0.42, f = H * 1.25, d = this.D[S.step];
      const fl = g.createLinearGradient(0, y0 - H * 0.06, 0, y0 + H * 0.3); fl.addColorStop(0, 'rgba(18,17,21,0)'); fl.addColorStop(0.2, 'rgba(18,17,21,1)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = fl; g.fillRect(0, y0 - H * 0.06, W, H * 0.36);   // the faintest ground, lightest far off, no edge to it
      const ppm = f / d, feet = y0 + f * 1.62 / d, sx = W / 2 + Math.sin(t * 0.21) * 0.04 * ppm;
      const show = clamp((24 - d) / 20, 0, 1);    // more of it shows as it nears
      g.save(); g.translate(sx, feet); g.scale(ppm, -ppm);
      const blink = (t % 4.7 > 4.55) || (t % 7.3 > 7.18);
      figure(g, rgba([6 + 9 * show, 6 + 8 * show, 8 + 9 * show]), null, { sway: Math.sin(t * 0.6) * 0.01, tilt: headTiltJerk(t, 3.1, 0.18) * show });
      g.restore();
      if (!blink) {   // the eyes, drawn over in screen space so even far off they are two points
        const ey = feet - 2.12 * ppm, tilt = headTiltJerk(t, 3.1, 0.18) * show, ex = sx + Math.sin(t * 0.6) * 0.012 * ppm + Math.sin(tilt) * 0.0;
        const r = Math.max(1.1, 0.014 * ppm), sep = Math.max(2.6, 0.084 * ppm / 2);
        for (const s of [-1, 1]) {
          const x = ex + s * sep * Math.cos(tilt), y = ey + s * sep * Math.sin(tilt);
          const gr = Math.max(6, r * 3.5), gl = g.createRadialGradient(x, y, 0, x, y, gr); gl.addColorStop(0, 'rgba(235,228,210,.3)'); gl.addColorStop(1, 'rgba(235,228,210,0)');
          g.fillStyle = gl; g.fillRect(x - gr, y - gr, gr * 2, gr * 2);
          g.fillStyle = '#ebe4d2'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
        }
      }
      vignette(0.85, 0.15); grain(0.07);
    },
  };

  // ---- 2. The procession: the creatures of the nights, side by side on the skyline, drawn by their own code ----
  const PROC = {
    id: 'procession', name: 'The procession', layout: 'high', font: "'Cormorant SC', Georgia, serif", steps: 6,
    blurb: 'Dusk over open ground. Every creature from the nights stands in a line on the skyline, drawn by its own code. They hold still while watched, and come on together when you look away.',
    BASE: [150, 98, 64, 42, 28, 18, 11.5],
    TYPES: ['tall', 'smiler', 'crawler', 'walker', 'other', 'signalman', 'watcher', 'customer', 'runner', 'carrier'],
    list: null,
    make() {
      this.list = [];
      const n = this.TYPES.length;
      this.TYPES.forEach((type, i) => {
        const CR = CREATURES[type]; if (!CR) return;
        const c = { type, CR, dist: 100, gait: 0, t: rnd() * 10, seen: true, seenLast: true, lit: 0, lunge: 0, yOff: 0, lat: 0, frozen: false, dead: false, moving: false, mode: null, rand: mulberry32(50 + i), pos() { return { x: 0, y: 0, z: this.dist }; }, retarget() {} };
        try { CR.init(c); } catch (e) { return; }
        this.list.push({ c, x: (i - (n - 1) / 2) * 1.75 + (rnd() - 0.5) * 0.4, dz: rnd() * 5, ok: true });
      });
    },
    draw(g, t, S, dt) {
      if (!this.list) this.make();
      const y0 = H * 0.62, f = Math.max(H * 1.05, W * 0.55);
      const sky = g.createLinearGradient(0, 0, 0, y0); sky.addColorStop(0, '#06080d'); sky.addColorStop(0.55, '#141720'); sky.addColorStop(0.86, '#2b2830'); sky.addColorStop(1, '#4a3b2f');
      g.fillStyle = sky; g.fillRect(0, 0, W, y0 + 1);
      const gr = g.createLinearGradient(0, y0, 0, H); gr.addColorStop(0, '#2a2427'); gr.addColorStop(0.12, '#141215'); gr.addColorStop(1, '#050506'); g.fillStyle = gr; g.fillRect(0, y0, W, H - y0);
      const fogC = [56, 48, 46];
      const moving = S.stepT < 0.6 && S.step > S.prev;   // the moment it came on, the stride it took
      const items = this.list.filter(o => o.ok).map(o => ({ o, d: this.BASE[S.step] + o.dz * (1 - S.step / 7) })).sort((a, b) => b.d - a.d);
      for (const { o, d } of items) {
        const c = o.c; c.dist = d; c.t += dt * (c.CR.timeScale || 1); if (moving) c.gait += dt * 6;
        const ppm = f / d, sx = W / 2 + f * o.x / d, feet = y0 + f * 1.65 / d;
        if (sx < -ppm * 2 || sx > W + ppm * 2) continue;
        const fa = clamp((d - 8) / 170, 0, 0.78);
        const P = { fog: fa, fogColor: fogC, t: c.t, lit: 0,
          col: k => { const hi = Math.min(k[0], k[1], k[2]) > 200; return rgba(mixc(scalec(k, hi ? 0.5 : 0.07), fogC, hi ? fa * 0.4 : fa)); },
          cola: (k, a) => rgba(mixc(scalec(k, 0.06), fogC, fa), a), raw: k => rgba(k) };
        g.save(); g.translate(sx, feet); g.scale(ppm, -ppm); g.scale(1, 1 + 0.014 * Math.sin(c.t * 1.6));
        try { c.CR.draw(g, c, P); } catch (e) { o.ok = false; console.warn('procession: ' + c.type + ' could not be drawn', e); }
        g.restore();
      }
      const mist = g.createLinearGradient(0, y0 - H * 0.05, 0, y0 + H * 0.05); mist.addColorStop(0, 'rgba(70,60,58,0)'); mist.addColorStop(0.5, 'rgba(70,60,58,.22)'); mist.addColorStop(1, 'rgba(70,60,58,0)');
      g.fillStyle = mist; g.fillRect(0, y0 - H * 0.05, W, H * 0.1);
      vignette(0.75, 0.3); grain(0.06);
    },
  };

  // ---- 3. The door ----
  const DOOR = {
    id: 'door', name: 'The door', layout: 'left', font: "'IM Fell English', Georgia, serif", steps: 6,
    blurb: 'A dark room and a door left open a crack onto a lit hall. Each look back the gap is wider: fingers round the edge, then an eye, then the face.',
    GAP: [0.012, 0.05, 0.1, 0.17, 0.25, 0.36, 0.48],
    draw(g, t, S) {
      const dh = Math.min(H * 0.66, W * 0.95), dw = dh * 0.43, x0 = Math.max(W * 0.58, W - dw * 1.9), top = H * 0.83 - dh, floorY = H * 0.83;
      // the wall: dark paper with a faint stripe, and the floorboards running to you
      g.fillStyle = '#100e0c'; g.fillRect(0, 0, W, floorY);
      g.fillStyle = 'rgba(255,240,220,.018)'; for (let x = 0; x < W; x += 26) g.fillRect(x, 0, 9, floorY);
      g.fillStyle = '#0b0908'; g.fillRect(0, floorY, W, H - floorY);
      g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1; for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(x0 + dw / 2 + i * dw * 0.18, floorY); g.lineTo(x0 + dw / 2 + i * dw * 1.4, H); g.stroke(); }
      const gap = this.GAP[S.step] * dw, flick = 0.92 + 0.08 * Math.sin(t * 23) * Math.sin(t * 7.1);
      // the hall beyond, lit; its light falls through the gap onto the floor toward you
      const hx = x0 + dw - gap;
      const hall = g.createLinearGradient(hx, 0, hx + gap, 0); hall.addColorStop(0, rgba([92 * flick, 72 * flick, 44 * flick])); hall.addColorStop(1, rgba([150 * flick, 118 * flick, 72 * flick]));
      g.fillStyle = hall; g.fillRect(hx, top, gap, dh);
      g.fillStyle = 'rgba(160,125,75,' + (0.1 * flick) + ')'; g.beginPath(); g.moveTo(hx, floorY); g.lineTo(hx + gap, floorY); g.lineTo(hx + gap * 6 + dw * 0.8, H); g.lineTo(hx - gap * 3 - dw * 0.2, H); g.closePath(); g.fill();
      // what stands in the hall, backlit: the edge of a head and a shoulder, then its eye, then its face leaning in
      g.save(); g.beginPath(); g.rect(hx, top, gap, dh); g.clip();
      // it stands back in the hall, a little to the right, and leans in toward the gap as the looks go by
      const hr = dw * 0.16, lean = [0, 0, 0, 0.25, 0.45, 0.8, 1][S.step], fx = hx + gap * lerp(0.95, 0.42, lean) + hr * 0.25, fy = top + dh * 0.24 + lean * hr * 0.3;
      const tilt = -0.32 * lean + headTiltJerk(t, 3.3, 0.05);
      if (S.step >= 2) {
        const sh = '#0c0a09';
        g.fillStyle = sh; g.beginPath();   // the neck and one sloping shoulder, falling away into the hall's shadow
        g.moveTo(fx - hr * 0.25, fy + hr * 0.9); g.quadraticCurveTo(fx - hr * 0.45, fy + hr * 1.7, fx - hr * 1.6, fy + hr * 2.2);
        g.lineTo(fx - hr * 1.7, top + dh); g.lineTo(fx + hr * 2.5, top + dh); g.lineTo(fx + hr * 2.5, fy + hr * 1.6); g.quadraticCurveTo(fx + hr * 0.5, fy + hr * 1.5, fx + hr * 0.3, fy + hr * 0.9); g.fill();
        g.save(); g.translate(fx, fy); g.rotate(tilt);
        g.beginPath(); g.ellipse(0, 0, hr * 0.78, hr * 1.18, 0, 0, TAU); g.fill();   // the head: long, narrow
        if (S.step >= 3) {   // its eyes, pale and wet, the pupils pinpricks that follow you
          const look = Math.sin(t * 0.7) * hr * 0.03;
          for (const ex of (S.step >= 5 ? [-0.3, 0.3] : [-0.3])) {
            g.fillStyle = '#cfc6b1'; g.beginPath(); g.ellipse(ex * hr, -hr * 0.15, hr * 0.2, hr * 0.12, 0, 0, TAU); g.fill();
            g.fillStyle = '#000'; g.beginPath(); g.arc(ex * hr + look, -hr * 0.15, hr * 0.045, 0, TAU); g.fill();
          }
        }
        if (S.step >= 4) {   // the grin, too wide for the face, splitting it from cheek to cheek
          const mw = hr * (S.step >= 5 ? 0.66 : 0.42), my = hr * 0.42, mh = hr * (S.step >= 6 ? 0.34 : 0.16);
          g.fillStyle = '#1c0707'; g.beginPath(); g.moveTo(-mw, my - mh * 0.2); g.quadraticCurveTo(0, my + mh * 2, mw, my - mh * 0.2); g.quadraticCurveTo(0, my + mh * 0.5, -mw, my - mh * 0.2); g.fill();
          g.fillStyle = '#d6cdb8';
          for (let i = -6; i <= 6; i++) { const u = i / 6.5, x = u * mw * 0.92, y = my - mh * 0.2 + (1 - u * u) * mh * 0.62; g.beginPath(); g.moveTo(x - mw * 0.05, y - mh * 0.1); g.lineTo(x + mw * 0.05, y - mh * 0.1); g.lineTo(x, y + mh * 0.38 * (1 - Math.abs(u) * 0.6)); g.fill(); }
        }
        g.restore();
      }
      g.restore();
      // the frame and the door, open into the hall: its edge toward you is the gap's left side
      g.fillStyle = '#1b1612'; g.fillRect(x0 - dw * 0.08, top - dw * 0.08, dw * 1.16, dw * 0.08); g.fillRect(x0 - dw * 0.08, top, dw * 0.08, dh); g.fillRect(x0 + dw, top, dw * 0.08, dh);
      const leaf = dw - gap;
      const lg = g.createLinearGradient(x0, 0, x0 + leaf, 0); lg.addColorStop(0, '#16120f'); lg.addColorStop(1, '#221b15'); g.fillStyle = lg; g.fillRect(x0, top, leaf, dh);
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = Math.max(1, dw * 0.012); g.strokeRect(x0 + leaf * 0.14, top + dh * 0.07, leaf * 0.72, dh * 0.36); g.strokeRect(x0 + leaf * 0.14, top + dh * 0.5, leaf * 0.72, dh * 0.42);
      g.fillStyle = 'rgba(170,135,85,' + (0.18 * flick) + ')'; g.fillRect(x0 + leaf - Math.max(1.5, dw * 0.015), top, Math.max(1.5, dw * 0.015), dh);   // the light along the door's edge
      g.fillStyle = '#6d5a3c'; g.beginPath(); g.arc(x0 + leaf * 0.86, top + dh * 0.52, dw * 0.025, 0, TAU); g.fill();
      // fingers round the door's edge, on your side of it: long, grey, black at the tips
      const hands = S.step >= 1 ? (S.step >= 3 ? [0.44, 0.6] : [0.5]) : [];
      for (const hy of hands) {
        const ex = x0 + leaf + dw * 0.008, k = dw * 0.01;
        for (let i = 0; i < 4; i++) {   // each finger: over the edge, a long first joint across the door's face, the tip hooked in
          const y = top + dh * hy + i * dw * 0.062, len = dw * [0.15, 0.2, 0.19, 0.13][i] * (1 + 0.05 * Math.sin(t * 1.3 + i * 1.7)), w = dw * 0.024;
          const j1 = [ex - len * 0.48, y - k * 0.6], tip = [ex - len, y + k * 1.4];
          g.strokeStyle = '#7b756c'; g.lineCap = 'round'; g.lineJoin = 'round';
          g.lineWidth = w; g.beginPath(); g.moveTo(ex, y); g.lineTo(j1[0], j1[1]); g.stroke();
          g.lineWidth = w * 0.82; g.beginPath(); g.moveTo(j1[0], j1[1]); g.lineTo(tip[0], tip[1]); g.stroke();
          g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(j1[0], j1[1], w * 0.32, 0, TAU); g.fill();   // the knuckle
          g.fillStyle = '#060505'; g.beginPath(); g.ellipse(tip[0] - w * 0.15, tip[1] + w * 0.1, w * 0.42, w * 0.32, 0.4, 0, TAU); g.fill();   // the nail, black
        }
      }
      vignette(0.8, 0.2); grain(0.07);
    },
  };

  // ---- 4. Static: a television in a dark room, and on it, between the bursts of snow, something in a hall ----
  const TV = {
    id: 'static', name: 'Channel 13', layout: 'high', font: "'Special Elite', 'Courier New', monospace", steps: 6,
    blurb: 'A television left on in a dark room, all snow. Between the bursts of static there is a hallway on it, and something in the hallway, nearer every time.',
    D: [40, 22, 13, 8, 4.5, 2.6, 1.6],
    scr: null, sg: null,
    draw(g, t, S) {
      if (!this.scr) { this.scr = document.createElement('canvas'); this.scr.width = 200; this.scr.height = 150; this.sg = this.scr.getContext('2d'); }
      const s = this.sg, sw = 200, sh = 150, d = this.D[S.step];
      // on the screen: a hall in grey, the figure in it, then snow over all of it (all snow for a moment after each look)
      s.fillStyle = '#4a4d52'; s.fillRect(0, 0, sw, sh);
      s.fillStyle = '#2b2d31'; s.beginPath(); s.moveTo(0, 0); s.lineTo(sw, 0); s.lineTo(sw * 0.6, sh * 0.42); s.lineTo(sw * 0.4, sh * 0.42); s.fill();
      s.fillStyle = '#5e6166'; s.beginPath(); s.moveTo(0, sh); s.lineTo(sw, sh); s.lineTo(sw * 0.6, sh * 0.62); s.lineTo(sw * 0.4, sh * 0.62); s.fill();
      s.fillStyle = '#1c1d20'; s.fillRect(sw * 0.4, sh * 0.42, sw * 0.2, sh * 0.2);
      const f = sh * 1.1, ppm = f / d, feet = sh * 0.5 + f * 1.6 / d;
      s.save(); s.translate(sw / 2, feet); s.scale(ppm, -ppm); figure(s, '#0c0c0e', [210, 210, 210], { tilt: headTiltJerk(t, 2.3, 0.25), eyeR: 0.018, reach: S.step >= 5 }); s.restore();
      const burst = S.stepT < 0.45 ? 1 : 0, noise = burst ? 1 : 0.13 + 0.05 * Math.sin(t * 3.1) + (Math.sin(t * 0.9) > 0.97 ? 0.4 : 0);
      const im = s.getImageData(0, 0, sw, sh), px = im.data;
      for (let i = 0; i < px.length; i += 4) { const n = Math.random() * 255; px[i] = lerp(px[i], n, noise); px[i + 1] = lerp(px[i + 1], n, noise); px[i + 2] = lerp(px[i + 2], n * 1.05, noise); }
      s.putImageData(im, 0, 0);
      const roll = ((t * 0.25) % 1) * sh * 1.4 - sh * 0.2; s.fillStyle = 'rgba(255,255,255,.07)'; s.fillRect(0, roll, sw, sh * 0.12);
      s.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < sh; y += 2) s.fillRect(0, y, sw, 1);
      s.fillStyle = '#7bd88f'; s.font = '11px monospace'; s.fillText('CH 13', sw - 44, 16);
      // the room: black, lit only by the set
      g.fillStyle = '#030304'; g.fillRect(0, 0, W, H);
      const tw = Math.min(W * 0.6, H * 0.4), th = tw * 0.78, tx = W / 2 - tw / 2 - tw * 0.06, ty = H * 0.9 - th - tw * 0.08;
      const glowA = burst ? 0.34 : 0.22;
      const gl = g.createRadialGradient(W / 2, ty + th / 2, tw * 0.2, W / 2, ty + th / 2, tw * 1.6); gl.addColorStop(0, 'rgba(150,165,190,' + glowA + ')'); gl.addColorStop(1, 'rgba(150,165,190,0)');
      g.fillStyle = gl; g.fillRect(0, 0, W, H);
      g.fillStyle = '#0c0b0a'; g.fillRect(0, H * 0.9, W, H * 0.1);
      g.fillStyle = 'rgba(150,165,190,' + glowA * 0.5 + ')'; g.beginPath(); g.ellipse(W / 2, H * 0.915, tw * 0.75, H * 0.015, 0, 0, TAU); g.fill();
      // the set: a wooden cabinet, the screen bulging in it
      g.fillStyle = '#1e1712'; roundRect(g, tx - tw * 0.06, ty - tw * 0.06, tw * 1.12 + tw * 0.2, th + tw * 0.12, tw * 0.04); g.fill();
      g.fillStyle = '#0d0a08'; roundRect(g, tx + tw * 1.08, ty + th * 0.1, tw * 0.1, th * 0.8, tw * 0.02); g.fill();
      for (let i = 0; i < 2; i++) { g.fillStyle = '#3a3029'; g.beginPath(); g.arc(tx + tw * 1.13, ty + th * (0.25 + i * 0.22), tw * 0.025, 0, TAU); g.fill(); }
      g.save(); roundRect(g, tx, ty, tw, th, tw * 0.08); g.clip();
      g.imageSmoothingEnabled = true; g.drawImage(this.scr, tx, ty, tw, th);
      const bez = g.createRadialGradient(tx + tw / 2, ty + th / 2, tw * 0.3, tx + tw / 2, ty + th / 2, tw * 0.72); bez.addColorStop(0, 'rgba(0,0,0,0)'); bez.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = bez; g.fillRect(tx, ty, tw, th);
      g.restore();
      document.querySelector('#overlay h1').style.textShadow = burst ? (2 + Math.random() * 3) + 'px 0 rgba(255,60,60,.6), -' + (2 + Math.random() * 3) + 'px 0 rgba(60,200,255,.6), 0 0 30px rgba(0,0,0,.9)' : '';
      vignette(0.7, 0.25); grain(0.08);
    },
  };
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  // ---- 5. The storm: a window onto a field, lit only by lightning ----
  const STORM = {
    id: 'storm', name: 'The storm', layout: 'low', font: "'IM Fell English SC', Georgia, serif", steps: 6,
    blurb: 'Inside, at night, rain on a big window over a field. You only see out when the lightning goes, and every flash it is standing nearer, until its hands are on the glass.',
    D: [90, 55, 34, 20, 11, 5, 1.55],
    drops: null, trees: null, flashAt: -9,
    draw(g, t, S) {
      if (!this.drops) { this.drops = Array.from({ length: 140 }, () => ({ x: rnd(), y: rnd(), v: 0.05 + rnd() * 0.25, l: 0.01 + rnd() * 0.04 })); this.trees = Array.from({ length: 90 }, (_, i) => 0.035 + 0.05 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.37)) + rnd() * 0.02); }
      if (S.stepT < 0.02 && S.step !== S.prev) this.flashAt = t;
      const k = t - this.flashAt, flash = k < 0 ? 0 : Math.max(0, Math.exp(-k * 7) * (k < 0.09 ? 1 : 0.55) + (k > 0.16 && k < 0.24 ? 0.6 : 0) * Math.exp(-(k - 0.16) * 6));
      const ww = Math.min(W * 0.66, H * 0.8), wh = ww * 0.56, wx = W / 2 - ww / 2, wy = H * 0.07;
      // the room
      g.fillStyle = rgba([10 + flash * 30, 10 + flash * 32, 13 + flash * 40]); g.fillRect(0, 0, W, H);
      // outside: the sky, the treeline, the field, the figure (dark against the flash)
      g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
      const sky = g.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, rgba(mixc([18, 20, 26], [200, 210, 235], flash))); sky.addColorStop(1, rgba(mixc([26, 28, 34], [150, 160, 185], flash))); g.fillStyle = sky; g.fillRect(wx, wy, ww, wh);
      const hz = wy + wh * 0.62;
      g.fillStyle = rgba(mixc([8, 9, 11], [30, 34, 40], flash)); g.beginPath(); g.moveTo(wx, hz);
      this.trees.forEach((h, i) => g.lineTo(wx + ww * i / (this.trees.length - 1), hz - h * wh)); g.lineTo(wx + ww, hz + 2); g.lineTo(wx, hz + 2); g.fill();
      g.fillStyle = rgba(mixc([12, 13, 14], [70, 76, 80], flash)); g.fillRect(wx, hz, ww, wh);
      const d = this.D[S.step], f = wh * 1.1, ppm = f / d, feet = hz + f * 1.6 / d;
      g.save(); g.translate(W / 2 + ww * 0.08, feet); g.scale(ppm, -ppm);
      figure(g, rgba(mixc([10, 11, 13], [4, 4, 6], flash)), flash > 0.3 ? [200, 200, 200] : null, { tilt: 0.15, reach: S.step >= 6 });
      g.restore();
      if (S.step >= 6) {   // its hands flat on the glass, pale, the fingers spread
        const hc = rgba(mixc([46, 46, 48], [176, 172, 162], flash));
        for (const sd of [-1, 1]) {
          const hx = W / 2 + ww * 0.08 + sd * 0.3 * ppm, hy = feet - 1.62 * ppm;
          g.save(); g.translate(hx, hy); g.scale(ppm, -ppm);
          P_ell(g, 0, 0, 0.05, 0.062, hc);
          for (let i = 0; i < 4; i++) { const a = Math.PI / 2 + (i - 1.5) * 0.2 * -sd; P_limb(g, [[(i - 1.5) * 0.022, 0.04], [Math.cos(a) * 0.14 + (i - 1.5) * 0.02, Math.sin(a) * 0.14]], 0.02, hc); }
          P_limb(g, [[sd * -0.035, -0.01], [sd * -0.09, 0.05]], 0.022, hc);   // the thumb
          g.restore();
        }
      }
      // rain running down the glass
      g.strokeStyle = 'rgba(190,200,220,' + (0.12 + flash * 0.4) + ')'; g.lineWidth = 1;
      for (const p of this.drops) { p.y = (p.y + p.v * 0.016) % 1.05; const x = wx + p.x * ww, y = wy + p.y * wh; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.5, y + p.l * wh); g.stroke(); }
      g.restore();
      // the frame and the cross bars, and the panes' light thrown into the room with the flash
      const bar = Math.max(4, ww * 0.022);
      g.fillStyle = '#0a0908'; g.fillRect(wx - bar, wy - bar, ww + bar * 2, bar); g.fillRect(wx - bar, wy + wh, ww + bar * 2, bar * 1.6); g.fillRect(wx - bar, wy, bar, wh); g.fillRect(wx + ww, wy, bar, wh);
      g.fillRect(wx + ww / 2 - bar / 2, wy, bar, wh); g.fillRect(wx, wy + wh / 2 - bar / 2, ww, bar);
      if (flash > 0.02) {
        g.fillStyle = 'rgba(200,210,235,' + flash * 0.16 + ')';
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const px = wx + i * ww / 2, py = wy + wh + bar * 2; g.beginPath(); g.moveTo(px + bar, py); g.lineTo(px + ww / 2 - bar, py); g.lineTo(px + ww / 2 + ww * 0.12 - bar, H); g.lineTo(px + ww * 0.12 + bar, H); g.fill(); }
      }
      vignette(0.8, 0.25); grain(0.07);
    },
  };

  const CONCEPTS = [EYES, PROC, DOOR, TV, STORM];

  // ---- state: which concept, how many looks away so far ----
  const S = { i: 0, step: 0, prev: 0, stepT: 0, auto: true, autoT: 0, holdT: 0, awayAt: null };
  function stepOn() { const C = CONCEPTS[S.i]; S.prev = S.step; S.step = Math.min(C.steps, S.step + 1); S.stepT = 0; S.autoT = 0; meter(); }
  function startOver() { S.prev = S.step; S.step = 0; S.stepT = 0; S.autoT = 0; S.holdT = 0; meter(); }
  const meter = () => { document.getElementById('meter').textContent = 'look ' + S.step + ' / ' + CONCEPTS[S.i].steps; };
  // looking away: onto the menu (or out of the window) and back again
  const ov = document.getElementById('overlay');
  for (const el of ov.children) {
    el.addEventListener('pointerenter', () => { S.awayAt = performance.now(); });
    el.addEventListener('pointerleave', () => { if (S.awayAt !== null && performance.now() - S.awayAt > 250) stepOn(); S.awayAt = null; });
  }
  addEventListener('blur', () => { S.awayAt = performance.now(); });
  addEventListener('focus', () => { if (S.awayAt !== null) stepOn(); S.awayAt = null; });

  // ---- the lab panel ----
  const FONTS = [['Concept’s own', ''], ['Georgia (the game now)', "Georgia, 'Times New Roman', serif"], ['IM Fell English SC', "'IM Fell English SC', Georgia, serif"], ['IM Fell English', "'IM Fell English', Georgia, serif"], ['Cormorant SC', "'Cormorant SC', Georgia, serif"], ['Special Elite', "'Special Elite', 'Courier New', monospace"]];
  const fontSel = document.getElementById('font');
  FONTS.forEach(([n, v]) => { const o = document.createElement('option'); o.value = v; o.textContent = n; fontSel.appendChild(o); });
  let notes = {}; try { notes = JSON.parse(localStorage.getItem('titleLabNotes') || '{}') || {}; } catch (e) { notes = {}; }
  const note = document.getElementById('note');
  let introOn = true;
  function choose(i) {
    S.i = i; startOver();
    const C = CONCEPTS[i];
    ov.className = C.layout + (introOn ? '' : ' bare');
    document.documentElement.style.setProperty('--title-font', fontSel.value || C.font);
    document.getElementById('desc').textContent = C.blurb;
    note.value = notes[C.id] || '';
    document.querySelector('#overlay h1').style.textShadow = '';
    [...document.querySelectorAll('.concepts button')].forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    try { history.replaceState(null, '', '#' + C.id); } catch (e) {}
  }
  const list = document.getElementById('concepts');
  CONCEPTS.forEach((C, i) => { const b = document.createElement('button'); b.innerHTML = '<span></span><em></em>'; b.firstChild.textContent = (i + 1) + '. ' + C.name; b.onclick = () => choose(i); list.appendChild(b); });
  const markNotes = () => [...list.children].forEach((b, k) => { b.lastChild.textContent = (notes[CONCEPTS[k].id] || '').trim() ? 'note' : ''; });
  fontSel.onchange = () => document.documentElement.style.setProperty('--title-font', fontSel.value || CONCEPTS[S.i].font);
  document.getElementById('stepB').onclick = stepOn;
  document.getElementById('resetB').onclick = startOver;
  const autoB = document.getElementById('autoB');
  autoB.onclick = () => { S.auto = !S.auto; autoB.classList.toggle('on', S.auto); autoB.setAttribute('aria-pressed', String(S.auto)); };
  const introB = document.getElementById('introB'), ctrlB = document.getElementById('ctrlB'), ctrls = document.getElementById('controls');
  introB.onclick = () => { introOn = !introOn; introB.classList.toggle('on', introOn); introB.setAttribute('aria-pressed', String(introOn)); ov.classList.toggle('bare', !introOn); };
  const showCtrls = on => { ctrls.hidden = !on; ctrlB.classList.toggle('on', on); ctrlB.setAttribute('aria-pressed', String(on)); };
  ctrlB.onclick = () => showCtrls(ctrls.hidden);
  document.getElementById('howBtn').onclick = () => showCtrls(ctrls.hidden);
  const minB = document.getElementById('minB'), lab = document.getElementById('lab');
  minB.onclick = () => { const m = lab.dataset.min !== 'true'; lab.dataset.min = String(m); minB.textContent = m ? 'Show' : 'Hide'; minB.setAttribute('aria-expanded', String(!m)); };
  addEventListener('keydown', e => { if (e.target.tagName === 'TEXTAREA') return; if (e.key === 'h' || e.key === 'H') minB.click(); else if (e.key === 'ArrowRight') choose((S.i + 1) % CONCEPTS.length); else if (e.key === 'ArrowLeft') choose((S.i + CONCEPTS.length - 1) % CONCEPTS.length); else if (e.key === ' ') { e.preventDefault(); stepOn(); } });
  note.addEventListener('input', () => { notes[CONCEPTS[S.i].id] = note.value; try { localStorage.setItem('titleLabNotes', JSON.stringify(notes)); } catch (e) {} markNotes(); });
  const toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 1900); };
  for (const b of document.querySelectorAll('#menu .mbtn')) if (b.id !== 'howBtn') b.onclick = () => toast('In the game, this button opens ' + b.textContent.toLowerCase() + '.');
  document.getElementById('copyB').onclick = () => {
    const lines = CONCEPTS.filter(C => (notes[C.id] || '').trim()).map(C => '- ' + C.name + ': ' + notes[C.id].trim().replace(/\n+/g, ' / '));
    const pick = 'Title type: ' + fontSel.options[fontSel.selectedIndex].text + '; intro text ' + (introOn ? 'on' : 'off') + '; controls ' + (ctrls.hidden ? 'behind How to play' : 'shown') + '; last looked at: ' + CONCEPTS[S.i].name;
    if (!lines.length) { toast('No notes yet. Write some in the box first.'); return; }
    const text = 'Title lab notes:\n' + lines.join('\n') + '\n' + pick;
    const out = document.getElementById('copyOut');
    const fallback = () => { out.value = text; out.classList.add('show'); out.focus(); out.select(); toast('Select all and copy the notes below'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast('Notes copied. Paste them into the chat.'), fallback); else fallback();
  };
  markNotes();
  const start = CONCEPTS.findIndex(C => '#' + C.id === location.hash);
  choose(start < 0 ? 0 : start);

  // ---- the clock ----
  let last = performance.now(), t = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    S.stepT += dt;
    const C = CONCEPTS[S.i];
    if (S.auto && S.awayAt === null) { S.autoT += dt; if (S.step < C.steps && S.autoT > 3.2) stepOn(); }
    if (S.step >= C.steps) { S.holdT += dt; if (S.holdT > 3.5 && S.auto) startOver(); } else S.holdT = 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    C.draw(ctx, t, S, dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
