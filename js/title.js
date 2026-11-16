'use strict';
// ---------- the title screen: eyes in the dark ----------
// Pitch black, and a way off two pale points of eyes. It does not move while the title is in front of you; it
// comes on only behind a dialog (Nights, How to play, Settings: each covers it), so each time you close one it is
// nearer, and more of what the eyes belong to shows. (At its nearest, a click on the dark makes it twitch instead.) A click on the dark itself is a blink: the view goes black for a
// moment and it takes its step in there, unseen. STEPS of them and it is close enough to touch, bent down to look at
// you; it stays there. Drawn on its own canvas (#titleScene) over the game's, which the title then leaves undrawn. The
// title after the last night (the morning theme) keeps the room behind it instead, and nothing is coming.
const TITLE = (() => {
  const D = [22, 13, 7.5, 4.2, 2.4, 1.55, 1.05];   // how far off it is, metres, after each dialog closed (or blink)
  // the last two: so close it has to bend down to you. LEAN is how far it has (its head dropped and come on ahead of it,
  // its shoulders hunched up round it); DROP how far down its head has come then, from where it would be stood up straight
  // (0) to as low as it can come and still be all in the dark over the title's words (1), so its head stays whole in the
  // view and its eyes clear of the words, on a phone as on a wide screen
  const LEAN = [0, 0, 0, 0, 0, 0.6, 1], DROP = [0, 0, 0, 0, 0, 0.62, 1];
  const BLINK = [0.12, 0.18, 0.42];
  const TWITCH = 0.9;   // the blink, seconds: shutting, shut (where it steps), opening again
  let cv = null, ctx = null, W = 0, H = 0, dpr = 1, step = 0, drawn = 0, blinkAt = null, twitchAt = null, on = false, shown = false;
  let grainTile = null;
  function canvas() {
    if (!cv) { cv = document.getElementById('titleScene'); if (cv) ctx = cv.getContext('2d'); }
    return cv;
  }
  function enter() { step = drawn = 0; blinkAt = null; twitchAt = null; on = SAVE.data.settings.theme !== 'day'; }
  // a step nearer. With veil, the view blinks shut first and it is drawn at its new place only once that is black;
  // without (a dialog has just been over it), it is there at once
  // Once it is as near as it comes, a click on the dark does not blink: it twitches where it is instead, its head
  // jerking over and its shoulders hitching (TWITCH seconds)
  function advance(veil) {
    if (!on) return;
    if (veil && step === D.length - 1 && drawn === step && blinkAt === null) { twitchAt = -1; return; }
    step = Math.min(D.length - 1, step + 1);
    if (veil) { if (blinkAt === null) blinkAt = -1; } else drawn = step;   // (-1: the blink starts on the next frame drawn)
  }
  // is the scene up (the title is showing, and it is not the morning)? sets the page's class to match
  function active() {
    const a = on && G.state === 'title' && !!canvas();
    if (a !== shown) { shown = a; document.body.classList.toggle('titlescene', a); }
    return a;
  }
  // a tall, thin figure standing, in metres (feet at 0,0, +y up, about 2.3 m to the top of its head), its arms past its
  // knees; its neck and head are drawn on their own (head). hunch (0..1): bent down toward you, its shoulders drawn up high and the
  // top of it sunk between them
  function figure(g, col, tilt, hunch, shrug) {
    const up = 0.07 * hunch, sink = 0.14 * hunch, wide = 0.025 * hunch, sh = shrug || 0;   // shrug: one shoulder up, the other down
    const upL = up - sh * 0.06, upR = up + sh * 0.06;
    for (const s of [-1, 1]) P_limb(g, [[s * 0.075, 1.0], [s * 0.1, 0.53], [s * 0.11, 0.03]], 0.072, col);
    g.fillStyle = col; g.beginPath();
    g.moveTo(-0.12, 0.96); g.lineTo(0.12, 0.96); g.quadraticCurveTo(0.09, 1.3, 0.19 + wide, 1.7 + upR); g.quadraticCurveTo(0.2 + wide, 1.8 + upR, 0.06, 1.83 - sink);
    g.lineTo(-0.06, 1.83 - sink); g.quadraticCurveTo(-0.2 - wide, 1.8 + upL, -0.19 - wide, 1.7 + upL); g.quadraticCurveTo(-0.09, 1.3, -0.12, 0.96); g.fill();
    for (const s of [-1, 1]) { const hd = [s * 0.27, 0.74]; P_limb(g, [[s * (0.18 + wide), 1.74 + (s > 0 ? upR : upL)], [s * (0.25 + wide), 1.26], hd], 0.05, col); fingers(g, hd[0], hd[1], -Math.PI / 2 + s * 0.08, 0.16, 0.15, 0.018, col); }
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
    // the eyes sit high in the view, clear of the title and its buttons below
    // the blink: how shut the view is (0 open, 1 black); while it is shut, it is drawn where it has stepped to
    let shut = 0;
    if (blinkAt !== null) {
      if (blinkAt < 0) blinkAt = t;
      const k = t - blinkAt;
      if (k < BLINK[0]) shut = k / BLINK[0];
      else if (k < BLINK[0] + BLINK[1]) { shut = 1; drawn = step; }
      else if (k < BLINK[0] + BLINK[1] + BLINK[2]) shut = 1 - (k - BLINK[0] - BLINK[1]) / BLINK[2];
      else blinkAt = drawn !== step ? t : null;   // clicked again while it opened: another blink, so that step is not seen either
    }
    if (hidden) drawn = step;
    const y0 = H * 0.36, f = Math.min(H * 1.25, W * 1.6), d = D[drawn], lean = LEAN[drawn];
    const fl = g.createLinearGradient(0, y0 - H * 0.06, 0, y0 + H * 0.3); fl.addColorStop(0, 'rgba(18,17,21,0)'); fl.addColorStop(0.2, 'rgba(18,17,21,1)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fl; g.fillRect(0, y0 - H * 0.06, W, H * 0.36);   // the faintest ground, lightest far off, no edge to it
    const ppm = f / d, feet = y0 + f * 1.62 / d, sway = Math.sin(t * 0.21) * 0.04, sx = W / 2 + sway * ppm;
    const show = clamp((24 - d) / 20, 0, 1);   // more of it shows as it nears
    const still = SAVE.data.settings.reducedMotion;
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
    const tilt = jerk + tw;
    // the head: on its neck 2.1 m up; bent down to you, nearer than the rest of it (so larger) and lower (DROP), the
    // whole of it in the view and over the words
    // (its eyes 2 cm over its middle, upright; bent down, lower on its face, more of the dome of it over them)
    const hppm = f / (d - 0.22 * lean), hx = W / 2 + sway * hppm, eo = lerp(0.02, -0.025, lean);
    let hy = feet - 2.1 * ppm;
    if (lean > 0) { const low = words() - 12 - 0.165 * hppm; hy = clamp(lerp(y0 + f * (1.62 - 2.1) / (d - 0.22 * lean), low, DROP[drawn]), H * 0.03 + 0.165 * hppm, low); }
    const col = rgba([6 + 9 * show, 6 + 8 * show, 8 + 9 * show]);
    if (!hidden) {
      g.save(); g.translate(sx, feet); g.scale(ppm, -ppm); figure(g, col, tilt, lean, shrug); g.restore();
      P_limb(g, [[sx, feet - (1.8 - 0.14 * lean) * ppm], [hx, hy]], 0.05 * ppm, col);   // the neck, up (or out) to the head
      g.save(); g.translate(hx, hy); g.scale(hppm, -hppm); head(g, col, tilt, lean, eo, [34, 32, 36]); g.restore();
      const blink = (t % 4.7 > 4.55) || (t % 7.3 > 7.18);
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
    if (shut > 0) { g.fillStyle = 'rgba(0,0,0,' + smoothstep(shut).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
  }
  // how near it is, as it is seen (0 far off, 1 as near as it comes): the title's drone follows it (game.js)
  return { enter, advance, active, draw, get step() { return step; }, get near() { return drawn / (D.length - 1); }, get on() { return on; }, STEPS: D.length - 1 };
})();
