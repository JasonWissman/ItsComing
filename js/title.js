'use strict';
// ---------- the title screen: eyes in the dark ----------
// Pitch black, and a way off two pale points of eyes. It does not move while the title is in front of you; it
// comes on only behind a dialog (Scores, How to play, Settings: each covers it), so each time you close one it is
// nearer, and more of what the eyes belong to shows. A click on the dark itself and it comes on in front of you: a
// scuttle, quick and jerky as an insect's, limbs going, low and wide, to where the next step would have put it (with
// reduced motion, a short smooth slide). At its nearest, a click on the dark makes it twitch instead. STEPS of them and
// it is close enough to touch, bent down to look at you; it stays there. A faint light straight behind it, far off, one
// soft round of it a little wider than it is however near it comes, so its edges are dark against light and its shape
// is there to see even on a screen whose blacks swallow it. Drawn on its own canvas (#titleScene) over the game's, which
// the title then leaves undrawn.
// It is the same after the last night (the morning is only the screens straight after it): there is a Scores button then.
const TITLE = (() => {
  const D = [22, 13, 7.5, 4.2, 2.4, 1.55, 1.05];   // how far off it is, metres, after each dialog closed (or scuttle)
  // the last two: so close it has to bend down to you. LEAN is how far it has (its head dropped and come on ahead of it,
  // its shoulders hunched up round it); DROP how far down its head has come then, from where it would be stood up straight
  // (0) to as low as it can come and still be all in the dark over the title's words (1), so its head stays whole in the
  // view and its eyes clear of the words, on a phone as on a wide screen
  const LEAN = [0, 0, 0, 0, 0, 0.6, 1], DROP = [0, 0, 0, 0, 0, 0.62, 1];
  const SCURRY = 0.42, SLIDE = 0.35;   // the scuttle to its next place, seconds (and the slide, with reduced motion)
  // the scuttle comes in bursts, a lunge and a catch, each of its slot of the time: how much of the way each covers
  const BURSTS = [0.24, 0.13, 0.3, 0.11, 0.22];
  const TWITCH = 0.9;   // the twitch at its nearest, seconds
  const LIGHT = [104, 112, 134];   // the far light behind it: cold and dim
  const HALO = [[0, 1], [0.2, 0.88], [0.4, 0.6], [0.6, 0.32], [0.8, 0.11], [1, 0]];   // how it falls away from the middle of it
  let cv = null, ctx = null, W = 0, H = 0, dpr = 1, step = 0, drawn = 0, scurry = null, twitchAt = null, on = false, shown = false;
  let cur = { d: D[0], lean: 0, drop: 0 };   // where it was last drawn (a scuttle starts from there)
  let grainTile = null;
  function canvas() {
    if (!cv) { cv = document.getElementById('titleScene'); if (cv) ctx = cv.getContext('2d'); }
    return cv;
  }
  function enter() { step = drawn = 0; scurry = null; twitchAt = null; cur = { d: D[0], lean: 0, drop: 0 }; on = true; }
  // a step nearer. With seen (a click on the dark), it scuttles there in front of you; without (a dialog has just been
  // over it), it is there at once. Once it is as near as it comes, a click on the dark twitches it where it is instead,
  // its head jerking over and its shoulders hitching (TWITCH seconds)
  function advance(seen) {
    if (!on) return;
    if (seen && step === D.length - 1) { if (!scurry && drawn === step) twitchAt = -1; return; }   // (still on its way there: nothing more)
    step = Math.min(D.length - 1, step + 1);
    if (seen) scurry = { at: -1, from: { d: cur.d, lean: cur.lean, drop: cur.drop } };   // (-1: it starts on the next frame drawn; clicked again on the way, it goes on from where it has got to)
    else { drawn = step; scurry = null; }
  }
  // is the scene up (the title is showing)? sets the page's class to match
  function active() {
    const a = on && G.state === 'title' && !!canvas();
    if (a !== shown) { shown = a; document.body.classList.toggle('titlescene', a); }
    return a;
  }
  // how far along the way the scuttle has it at k (0..1 of its time): each burst a quick lunge, then a catch, still
  function scuttle(k) {
    const n = BURSTS.length, i = Math.min(n - 1, Math.floor(k * n)), f = k * n - i;
    let p = 0; for (let j = 0; j < i; j++) p += BURSTS[j];
    return p + BURSTS[i] * smoothstep(f / 0.6);
  }
  // a tall, thin figure standing, in metres (feet at 0,0, +y up, about 2.3 m to the top of its head), its arms past its
  // knees; its neck and head are drawn on their own (head). hunch (0..1): bent down toward you, its shoulders drawn up high and the
  // top of it sunk between them. run (0..1), ph: scuttling, its legs going under it in turn, knees out, its hands
  // clawing at the air ahead of it, out and up and down, quick as a spider's
  function figure(g, col, hunch, shrug, run, ph) {
    const up = 0.07 * hunch, sink = 0.14 * hunch, wide = 0.025 * hunch, sh = shrug || 0;   // shrug: one shoulder up, the other down
    const upL = up - sh * 0.06, upR = up + sh * 0.06;
    for (const s of [-1, 1]) {
      const lift = run * Math.max(0, Math.sin(ph + (s > 0 ? 0 : Math.PI)));
      P_limb(g, [[s * 0.075, 1.0], [s * (0.1 + 0.1 * run + 0.06 * lift), 0.53 + 0.1 * lift], [s * (0.11 + 0.12 * run), 0.03 + 0.24 * lift]], 0.072, col);
    }
    g.fillStyle = col; g.beginPath();
    g.moveTo(-0.12, 0.96); g.lineTo(0.12, 0.96); g.quadraticCurveTo(0.09, 1.3, 0.19 + wide, 1.7 + upR); g.quadraticCurveTo(0.2 + wide, 1.8 + upR, 0.06, 1.83 - sink);
    g.lineTo(-0.06, 1.83 - sink); g.quadraticCurveTo(-0.2 - wide, 1.8 + upL, -0.19 - wide, 1.7 + upL); g.quadraticCurveTo(-0.09, 1.3, -0.12, 0.96); g.fill();
    for (const s of [-1, 1]) {
      const c = Math.sin(ph * 1.3 + (s > 0 ? 0 : 2.2)), o = 0.5 + 0.5 * Math.sin(ph * 1.3 + (s > 0 ? 1.1 : 3.4));
      const hd = [s * (0.27 + run * (0.12 + 0.16 * o)), 0.74 + run * (0.28 + 0.26 * c)];
      P_limb(g, [[s * (0.18 + wide), 1.74 + (s > 0 ? upR : upL)], [s * (0.25 + wide + 0.14 * run), 1.26 + 0.12 * run * c], hd], 0.05, col);
      fingers(g, hd[0], hd[1], -Math.PI / 2 + s * (0.08 + run * (0.5 + 0.4 * o)), 0.16 + 0.1 * run, 0.15, 0.018, col);
    }
  }
  // its head, in metres about its middle, its eyes ey up from that. near (0..1): close enough to make out a face of sorts,
  // the dome of it catching what little light there is and the eyes sunk in dark
  function head(g, col, tilt, near, ey, lit) {
    g.rotate(tilt); P_ell(g, 0, 0, 0.115, 0.165, col);
    if (near > 0) {
      const gr = g.createRadialGradient(0, 0.08, 0.01, 0, 0.04, 0.17);
      gr.addColorStop(0, rgba(lit, 0.5 * near)); gr.addColorStop(1, rgba(lit, 0));
      P_ell(g, 0, 0, 0.115, 0.165, gr);
      for (const s of [-1, 1]) {
        const so = g.createRadialGradient(s * 0.042, ey, 0, s * 0.042, ey, 0.05);
        so.addColorStop(0, 'rgba(0,0,0,' + (0.9 * near).toFixed(3) + ')'); so.addColorStop(0.55, 'rgba(0,0,0,' + (0.6 * near).toFixed(3) + ')'); so.addColorStop(1, 'rgba(0,0,0,0)');
        P_ell(g, s * 0.042, ey, 0.05, 0.036, so, s * 0.2);
      }
    }
  }
  function grain(a) {
    if (!grainTile) { grainTile = document.createElement('canvas'); grainTile.width = grainTile.height = 192; const g = grainTile.getContext('2d'), im = g.createImageData(192, 192); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.translate(-Math.random() * 192, -Math.random() * 192);
    ctx.fillStyle = ctx.createPattern(grainTile, 'repeat'); ctx.fillRect(0, 0, W + 192, H + 192); ctx.restore();
  }
  // where the title's words begin, down the view: the dark above them is where its head may come
  let wordsTop = 0;
  function words() {
    const k = document.querySelector('#overlay.titlelow .kicker');
    if (k) wordsTop = k.getBoundingClientRect().top;
    return wordsTop > 40 ? wordsTop : H * 0.6;
  }
  // hidden: a dialog is open over it, and whatever it is doing back there is not seen
  function draw(t, hidden) {
    if (!canvas()) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(cv.clientWidth) || window.innerWidth, h = Math.round(cv.clientHeight) || window.innerHeight;   // (as the page shows it: fixed, the whole of it)
    if (w !== W || h !== H || cv.width !== Math.round(w * dpr)) { W = w; H = h; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = ctx; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const still = SAVE.data.settings.reducedMotion;
    // where it is: where it last stood, or on its way from there to its next place (the scuttle; with reduced motion, a
    // plain slide); run is how hard its limbs are going (in at once, out as it stops), ph where they are in their going
    if (hidden) { drawn = step; scurry = null; }
    let d = D[drawn], lean = LEAN[drawn], drop = DROP[drawn], run = 0, ph = 0;
    if (scurry) {
      if (scurry.at < 0) scurry.at = t;
      const k = (t - scurry.at) / (still ? SLIDE : SCURRY);
      if (k >= 1 || k < 0) { scurry = null; drawn = step; d = D[drawn]; lean = LEAN[drawn]; drop = DROP[drawn]; }
      else {
        const p = still ? smoothstep(k) : scuttle(k), f = scurry.from;
        d = lerp(f.d, D[step], p); lean = lerp(f.lean, LEAN[step], p); drop = lerp(f.drop, DROP[step], p);
        if (!still) { run = Math.min(1, k / 0.08, (1 - k) / 0.14); ph = (t - scurry.at) * TAU * 9; }
      }
    }
    cur = { d, lean, drop };
    // the eyes sit high in the view, clear of the title and its buttons below
    const y0 = H * 0.36, f = Math.min(H * 1.25, W * 1.6);
    const fl = g.createLinearGradient(0, y0 - H * 0.06, 0, y0 + H * 0.3); fl.addColorStop(0, 'rgba(18,17,21,0)'); fl.addColorStop(0.2, 'rgba(18,17,21,1)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fl; g.fillRect(0, y0 - H * 0.06, W, H * 0.36);   // the faintest ground, lightest far off, no edge to it
    const ppm = f / d, feet = y0 + f * 1.62 / d, sway = Math.sin(t * 0.21) * 0.04 + run * 0.035 * Math.sin(ph * 0.5 + 1.3), sx = W / 2 + sway * ppm;
    const show = clamp((24 - d) / 20, 0, 1);   // more of it shows as it nears
    // the twitch (advance at its nearest): a hard jerk of the head over to one side and back in two snaps, the shoulders
    // hitching against it, settling; with reduced motion, a small slow lean instead
    const jerk = still ? 0 : headTiltJerk(t, 3.1, 0.18) * show, dir = jerk >= 0 ? 1 : -1;   // (it twitches further the way its head already leans)
    let tw = 0, shrug = 0;
    if (twitchAt !== null) {
      if (twitchAt < 0) twitchAt = t;
      const k = t - twitchAt;
      if (k >= TWITCH) twitchAt = null;
      else if (still) tw = 0.06 * Math.sin(Math.PI * k / TWITCH);
      else {
        const snap = k < 0.08 ? smoothstep(k / 0.08) : k < 0.3 ? 1 - 0.55 * smoothstep((k - 0.22) / 0.06) : 0.45 * (1 - smoothstep((k - 0.3) / (TWITCH - 0.3)));
        tw = dir * (0.4 * snap + 0.04 * Math.sin(k * 61) * (1 - k / TWITCH));
        shrug = -dir * (0.9 * snap + 0.15 * Math.sin(k * 47) * (1 - k / TWITCH));
      }
    }
    const tilt = jerk + tw + run * 0.16 * Math.sin(ph * 1.7);   // (scuttling, its head jitters on its neck)
    // scuttling it goes low and wide, its head pushed on down ahead of it
    const sqx = 1 + 0.12 * run, sqy = 1 - 0.16 * run;
    // the head: on its neck 2.1 m up; bent down to you, nearer than the rest of it (so larger) and lower (DROP), the
    // whole of it in the view and over the words
    // (its eyes 2 cm over its middle, upright; bent down, lower on its face, more of the dome of it over them)
    const hppm = f / (d - 0.22 * lean), hx = W / 2 + sway * hppm, eo = lerp(0.02, -0.025, lean);
    let hy = feet - (2.1 * sqy - 0.12 * run) * ppm;
    if (lean > 0) { const low = words() - 12 - 0.165 * hppm; hy = clamp(lerp(y0 + f * (1.62 - 2.1) / (d - 0.22 * lean), low, drop), H * 0.03 + 0.165 * hppm, low); }
    const col = rgba([6 + 9 * show, 6 + 8 * show, 8 + 9 * show]);
    if (!hidden) {
      // the light behind it: one soft round of cold light straight behind it, about its chest (bent down to you, about its
      // head and shoulders), a little wider than the shape of it however near it is, so its edges are always dark against
      // light: far off, the small shape of it reads against it; near, it frames its head and shoulders
      const cx = lerp(sx, hx, lean), cy = lerp(feet - 1.7 * ppm * sqy, hy + 0.05 * hppm, lean);
      const hr = lerp(1.85 * ppm, 0.78 * hppm, lean) * (1 + 0.1 * run);
      const hz = g.createRadialGradient(cx, cy, 0, cx, cy, hr);
      for (const [k, a] of HALO) hz.addColorStop(k, rgba(LIGHT, 0.3 * a));   // (falling away smoothly, with no edge to it)
      g.fillStyle = hz; g.fillRect(cx - hr, cy - hr, hr * 2, hr * 2);
      // then it, over the light
      g.save(); g.translate(sx, feet); g.scale(ppm * sqx, -ppm * sqy); figure(g, col, lean, shrug, run, ph); g.restore();
      P_limb(g, [[sx, feet - (1.8 - 0.14 * lean) * ppm * sqy], [hx, hy]], 0.05 * ppm, col);   // the neck, up (or out) to the head
      g.save(); g.translate(hx, hy); g.scale(hppm, -hppm); head(g, col, tilt, lean, eo, [34, 32, 36]); g.restore();
      const blink = !run && ((t % 4.7 > 4.55) || (t % 7.3 > 7.18));
      if (!blink) {   // the eyes, drawn over in screen space so even far off they are two points
        // (near, they stay small: two hard points of light in the dark of its face)
        const r = Math.max(1.1, Math.min(0.014 * hppm, 5.5 + 0.0016 * hppm)), sep = Math.max(2.6, 0.042 * hppm), up = eo * hppm;
        for (const s of [-1, 1]) {   // (the head turns about its middle, the eyes with it)
          const x = hx + s * sep * Math.cos(tilt) - up * Math.sin(tilt), y = hy - up * Math.cos(tilt) - s * sep * Math.sin(tilt);
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
  // the shape of it alone, as draw() puts it standing still and far enough off not to be bent down (figure, neck, head),
  // all in the one colour col: no light behind it, no eyes, no grain. x, feet: where its feet are, px; ppm: px a metre
  // (it is SHAPE_H m tall, SHAPE_W m wide). Settings' Brightness calibration (MENU) draws it so, in The Void's dark
  function shape(g, x, feet, ppm, col) {
    g.save(); g.translate(x, feet); g.scale(ppm, -ppm); figure(g, col, 0, 0, 0, 0); g.restore();
    P_limb(g, [[x, feet - 1.8 * ppm], [x, feet - 2.1 * ppm]], 0.05 * ppm, col);
    g.save(); g.translate(x, feet - 2.1 * ppm); g.scale(ppm, -ppm); head(g, col, 0, 0, 0, null); g.restore();
  }
  // how near it is, as it is seen (0 far off, 1 as near as it comes): the title's drone follows it (game.js). dist: how
  // far off it is drawn now, metres; moving: on its way to its next place
  return { enter, advance, active, draw, get step() { return step; }, get near() { return drawn / (D.length - 1); }, get dist() { return cur.d; }, get moving() { return !!scurry; }, get on() { return on; }, STEPS: D.length - 1, D, shape, SHAPE_H: 2.1 + 0.165, SHAPE_W: 0.8 };
})();
