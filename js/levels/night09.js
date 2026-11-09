'use strict';
// ============================================================ 9. THE PHONE BOOTH ============================================================
// A phone booth on a corner, at night, in the rain, with glass all round. A man in a long coat is walking toward it from a long
// way off, up the main street or along the pavement from the east, swinging a lantern. The pay phone is on the west wall, the
// side that looks along the pavement away from both, so using it means turning your back on him. Somewhere in your notebook,
// among the shopping and the dentist, is the number to ring, on a page of its own, scrawled large and fast in something red
// that has run. It is a pay phone: lift the receiver, put a coin in (there is one
// lying about in the booth) and dial on its own keys; it rings for seven seconds while he keeps coming, and then someone picks
// up and a car comes for you. Every other number in the notebook belongs to someone ordinary and is not in service, and hanging
// up gives the coin back, into the coin return.
// The notebook is a panel at the bottom of the screen, made here and taken away in onEnd, so the street stays in view while you
// read; the night goes on behind it. Facing the phone brings the view in close to it (L.viewZoom), so its keys are big enough
// to click or tap; the number keys dial too, and a gamepad's d-pad moves a highlight over the phone (L.padDir, L.padUse).
// It is done with your hands (js/hands.js): the lifted receiver is in your left hand (L.offHand), your right fingertip
// presses the keys (G.reach, going from key to key, in turn when they are pressed faster than it can go), and what will
// not work shows on the phone itself: a key pressed for nothing clicks and the display blinks at you, a coin put in on the
// hook goes into the slot and drops through into the coin return, the empty return is felt with the fingers, the phone
// book's cover lifts a crack and drops back.
Object.assign(ICONS, {
  // a small battered notebook, spiral at the top, held shut with an elastic band
  notebook(ctx, P) {
    const cover = P.col([96, 44, 36]), coverD = P.col([62, 28, 24]), paper = P.col([226, 216, 190]), ring = P.col([168, 168, 174]), band = P.col([26, 22, 20]), label = P.col([206, 194, 160]);
    ctx.save(); ctx.translate(0, 0.5); ctx.rotate(-0.1); ctx.translate(0, -0.5);
    P_rect(ctx, -0.3, 0.1, 0.62, 0.76, coverD);                  // the back board, a little bigger
    P_rect(ctx, -0.31, 0.12, 0.6, 0.73, paper);                  // the edges of the pages
    P_rect(ctx, -0.34, 0.1, 0.62, 0.74, cover);                  // the front cover
    P_rect(ctx, -0.34, 0.1, 0.62, 0.05, coverD); P_ell(ctx, 0.2, 0.2, 0.06, 0.04, P.col([120, 70, 58]));   // a worn corner
    P_rect(ctx, -0.22, 0.52, 0.34, 0.13, label); P_line(ctx, -0.18, 0.585, 0.06, 0.585, 0.015, P.col([60, 70, 110]));
    P_rect(ctx, 0.16, 0.08, 0.05, 0.8, band);                    // the elastic band
    for (let k = 0; k < 6; k++) { P_ell(ctx, -0.27 + k * 0.1, 0.86, 0.022, 0.05, ring); }
    ctx.restore();
  },
  // a ten pence piece: a milled silver rim round a face with the figure on it, catching the light along its top
  coin(ctx, P) {
    const rim = P.col([132, 134, 140]), face = P.col([196, 198, 204]), face2 = P.col([172, 174, 180]), ink = P.col([104, 106, 114]), shine = P.col([238, 240, 244]);
    P_ell(ctx, 0, 0.5, 0.46, 0.46, P.col([70, 72, 78]));          // its edge, in shadow
    P_ell(ctx, 0, 0.52, 0.44, 0.44, rim);
    for (let k = 0; k < 28; k++) { const a = k / 28 * TAU; P_line(ctx, Math.cos(a) * 0.4, 0.52 + Math.sin(a) * 0.4, Math.cos(a) * 0.44, 0.52 + Math.sin(a) * 0.44, 0.014, ink); }   // the milling
    P_ell(ctx, 0, 0.52, 0.36, 0.36, face2); P_ell(ctx, -0.03, 0.55, 0.33, 0.33, face);
    ctx.save(); ctx.translate(0.0, 0.42); ctx.scale(0.0125, -0.0125);
    ctx.font = 'bold 22px Georgia, "Liberation Serif", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = ink; ctx.fillText('10', 0, 0);
    ctx.restore();
    P_line(ctx, -0.24, 0.79, 0.12, 0.84, 0.035, shine);            // the light along its top
    // lying about, it catches the light now and then: a glint at its edge (still in the hand, where the time is nought)
    const g = Math.pow(Math.max(0, Math.sin((P.t || 0) * 2.3)), 12);
    if (g > 0.02) { ctx.globalAlpha = g; P_line(ctx, 0.24, 0.6, 0.24, 1.02, 0.04, P.raw([255, 252, 236])); P_line(ctx, 0.04, 0.81, 0.44, 0.81, 0.04, P.raw([255, 252, 236])); P_ell(ctx, 0.24, 0.81, 0.06, 0.06, P.raw([255, 255, 248])); ctx.globalAlpha = 1; }
  },
});
(() => {
  const XW = -0.8;             // the west wall, where the pay phone is, is this far from the eye
  const B = 0.55;              // and the glass on the other three sides (the door to the north, east, and the back) this far
  const PX = XW + 0.1;         // the front of the phone's housing
  const PHONE_DIR = 6;         // facing the phone is facing west
  const ROAD = -0.12;          // the road is a kerb's height below the pavement the booth stands on
  // ---------------- the notebook ----------------
  // lines of handwriting: '#' a heading, '~' crossed out, '!' underlined twice, '%' scrawled across a page of its own in
  // blood; {n} an ordinary number, {k} the one to ring
  const NAMES = ['Danny: {n}, after six', 'Mrs Pell upstairs: {n}', 'the garage: {n}', 'ask for Ray'];   // always in the notebook
  const NUMBERED = [   // pages with someone ordinary's number on them: at least one more of these is always in it
    ['#dentist', 'Dr Okafor, Tuesday the 14th', 'twenty to ten', 'if you can\'t make it ring {n}'],
    ['#night bus', 'from the corner, :15 and :45', 'last one 12.45, not Sundays', 'Star Cabs: {n}'],
    ['#rota', 'Mon, Tue lates', 'Wed off', 'ask K. about the spare keys', 'K. is on {n}'],
    ['#surgery', 'Dr Marsh: {n}', 'repeat prescription', 'Fridays, before eleven'],
  ];
  const PLAIN = [
    ['#shop', 'milk', '~bread', 'batteries, the square kind', 'bulbs, 60', '~stamps', 'something for the cough'],
    ['#Ruth\'s old address', '22 Corder Lane, top flat', 'the bell doesn\'t work,', 'go round the back', '(she moved. write anyway)'],
    ['pay the gas', '~library books (3)', 'bins Thursday', '~ring Mum back', 'fix the hall light'],
    ['#soup', '2 onions, carrots', 'a stock cube', 'an hour, low', 'salt at the end'],
    ['#birthdays', 'Mum, 3rd March', 'Danny, the 19th', 'Ruth ?'],
  ];
  const COAT = ['saw the man in the coat again', 'same corner, same time', 'he doesn\'t look at the cars', 'he doesn\'t look at anything'];
  const KEY = ['%{k}'];   // the number to ring, alone on its page, written large and fast in red
  // seven pages: the man in the coat, five ordinary ones and the one with the number, never first; every number distinct.
  // The five always include the names with their numbers and one more numbered page, so there are always a few
  // ordinary numbers to mistake for the one
  function writeNotebook(rand) {
    const used = new Set(), others = [];
    const num = () => { let n; do { n = Math.floor(rand() * 100); } while (used.has(n)); used.add(n); return '555-01' + String(n).padStart(2, '0'); };
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const key = num();
    const numbered = shuffle(NUMBERED.slice());
    const pages = shuffle([NAMES, numbered[0], COAT].concat(shuffle(numbered.slice(1).concat(PLAIN)).slice(0, 3)));
    const keyPage = 1 + Math.floor(rand() * pages.length);
    rand();   // one draw kept here, so every seed lays the night out as it always has
    pages.splice(keyPage, 0, KEY);
    const filled = pages.map(lines => lines.map(l => l.replace('{k}', key).replace(/\{n\}/g, () => { const n = num(); others.push(n); return n; })));
    return { pages: filled, keyPage, numberText: key, number: key.replace('-', ''), others: others.map(n => n.replace('-', '')) };
  }
  const esc = t => String(t).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  // the number to ring, as if written hastily in blood with a fingertip: each figure a stroke or two in a 50 x 80 box (y down),
  // and where on it the blood runs down from
  const FIGS = {
    0: [['M28 5C9 3 2 40 6 62C10 84 41 80 45 48C49 18 38 1 21 9'], [26, 79]],
    1: [['M11 19L28 4L25 79'], [25, 79]],
    2: [['M5 20C9 1 43 -1 42 21C41 39 15 55 4 77L47 73'], [30, 75]],
    3: [['M6 11C20 -1 45 4 38 22C33 33 23 36 17 37C39 35 49 52 41 66C33 81 10 80 3 69'], [22, 78]],
    4: [['M31 3L4 53L47 50', 'M35 25L32 80'], [32, 80]],
    5: [['M43 5L13 7L8 37C24 27 45 35 43 56C41 79 14 81 3 68'], [22, 79]],
    6: [['M39 5C17 9 3 40 8 62C12 82 43 80 42 58C41 40 15 37 8 57'], [26, 79]],
    7: [['M4 8L46 5L19 79'], [19, 79]],
    8: [['M38 15C34 0 8 2 10 18C12 32 43 39 43 58C43 81 5 81 6 60C7 41 37 34 38 16'], [24, 80]],
    9: [['M41 22C40 3 8 2 8 22C8 41 39 41 41 22L35 79'], [35, 79]],
    '-': [['M5 42L35 38'], [20, 41]],
  };
  // the figures go across the page on a rising slant, each leaning and sized a little differently, in a stroke that is
  // uneven (a dark rim where it dried, a second pass that skips, a wet sheen, ragged at the edges where the paper took it)
  // with the blood soaking into the paper round it; a smear wiped under the lot, drips running straight down off the
  // heaviest strokes, and a few spots flicked off the finger
  function bloodHTML(text, rand) {
    const r = (a, b) => a + (b - a) * rand(), f = v => v.toFixed(1);
    const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
    const T = (x, y) => [1, 0, 0, 1, x, y], Rot = a => [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];
    const at = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
    const mx = m => 'matrix(' + m.map(v => v.toFixed(3)).join(' ') + ')';
    const VW = 400, VH = 176, chars = text.split(''), adv = chars.map(ch => ch === '-' ? 33 : r(41, 46)), width = adv.reduce((a, b) => a + b, 0);
    const G0 = [T(VW / 2, VH * 0.44), Rot(r(-8, -4) * DEG), T(-width / 2, -40)].reduce(mul);
    const soak = [], rim = [], main = [], pass = [], sheen = [], drips = [], spots = [];
    const drip = (x, y, len, w) => { const wob = r(-1.2, 1.2); drips.push('<path d="M' + f(x) + ' ' + f(y) + 'Q' + f(x + wob * 0.3) + ' ' + f(y + len * 0.5) + ' ' + f(x + wob) + ' ' + f(y + len) + '" stroke-width="' + f(w) + '"/><ellipse cx="' + f(x + wob) + '" cy="' + f(y + len + w * 0.35) + '" rx="' + f(w * 0.72) + '" ry="' + f(w * 0.95) + '"/>'); };
    let x = 0;
    chars.forEach((ch, i) => {
      const [paths, low] = FIGS[ch] || FIGS['-'];
      const m = [G0, T(x + 25, 40 + r(-4, 4)), Rot(r(-6, 5) * DEG), [1, 0, Math.tan(r(-17, -9) * DEG), 1, 0, 0], [r(0.9, 1.05), 0, 0, r(1.14, 1.28), 0, 0], T(-25, -40)].reduce(mul);
      const w = r(6.2, 8.6), dash = () => [r(16, 40), r(3, 9), r(10, 30), r(2, 6)].map(f).join(' ');
      for (const d of paths) {
        const p0 = at(m, ...d.slice(1).split(/[ LC]/).slice(0, 2).map(Number));   // where the finger first pressed: a little pool
        drips.push('<ellipse cx="' + f(p0[0]) + '" cy="' + f(p0[1]) + '" rx="' + f(w * r(0.6, 0.78)) + '" ry="' + f(w * r(0.55, 0.7)) + '" stroke="none"/>');
        soak.push('<path d="' + d + '" transform="' + mx(m) + '" stroke-width="' + f(w + 6) + '"/>');
        rim.push('<path d="' + d + '" transform="' + mx(m) + '" stroke-width="' + f(w + 1.8) + '"/>');
        main.push('<path d="' + d + '" transform="' + mx(m) + '" stroke-width="' + f(w) + '"/>');
        pass.push('<path d="' + d + '" transform="' + mx(mul(T(r(0.6, 1.6), r(0.2, 1.2)), m)) + '" stroke-width="' + f(w * 0.6) + '" stroke-dasharray="' + dash() + '"/>');
        sheen.push('<path d="' + d + '" transform="' + mx(mul(T(-0.8, -1), m)) + '" stroke-width="' + f(w * 0.26) + '" stroke-dasharray="' + dash() + '"/>');
      }
      if (ch !== '-' && (i % 2 === 0 ? rand() < 0.7 : rand() < 0.35)) { const p = at(m, low[0] + r(-3, 3), low[1] - 3); drip(p[0], p[1], r(12, 42), r(2.2, 3.4)); }
      if (rand() < 0.6) { const p = at(G0, x + r(-6, 50), r(-24, 112)); spots.push('<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(r(0.8, 2.6)) + '"/>'); }
      x += adv[i];
    });
    // the smear: a finger wiped hard under it all, trailing off thinner, with a drip or two off it
    const a = at(G0, r(-8, 6), r(98, 104)), c = at(G0, width * 0.5, r(104, 112)), e = at(G0, width + r(-6, 10), r(92, 100)), sm = 'M' + f(a[0]) + ' ' + f(a[1]) + 'Q' + f(c[0]) + ' ' + f(c[1]) + ' ' + f(e[0]) + ' ' + f(e[1]);
    soak.push('<path d="' + sm + '" stroke-width="15"/>'); rim.push('<path d="' + sm + '" stroke-width="7.5" stroke-dasharray="' + f(width * 0.75) + ' 6 30 400"/>');
    main.push('<path d="' + sm + '" stroke-width="5.6" stroke-dasharray="' + f(width * 0.7) + ' 5 24 7 14 400"/>');
    for (let k = 0; k < 2; k++) { const t = r(0.15, 0.7), q = [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * e[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * e[1]]; drip(q[0], q[1], r(10, 30), r(2, 3)); }
    const seed = Math.floor(rand() * 999);
    return '<svg class="pb-blood" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(text) + '">' +
      '<defs><filter id="pb-bleed" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="' + seed + '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1" seed="' + (seed + 1) + '" result="m"/><feDisplacementMap in="d" in2="m" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<filter id="pb-soak" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.6"/></filter></defs>' +
      '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<g filter="url(#pb-soak)" stroke="#8a2a1c" opacity=".2">' + soak.join('') + '</g>' +
      '<g filter="url(#pb-bleed)">' +
      '<g stroke="#4a0606" opacity=".75">' + rim.join('') + '</g>' +
      '<g stroke="#850c0a">' + main.join('') + '</g>' +
      '<g stroke="#9e1611" opacity=".85">' + pass.join('') + '</g>' +
      '<g stroke="#850c0a" fill="#7a0a08">' + drips.join('') + '</g>' +
      '<g stroke="#c8402e" opacity=".4">' + sheen.join('') + '</g>' +
      '<g fill="#7a0a08" stroke="none">' + spots.join('') + '</g>' +
      '</g></g></svg>';
  }
  // a page as handwriting: each line a little off the level, a little off the margin, each word a little off the line
  function pageHTML(lines, rand) {
    if (lines.length === 1 && lines[0][0] === '%') return bloodHTML(lines[0].slice(1), rand);
    return lines.map(l => {
      const cls = l[0] === '#' ? 'h' : l[0] === '~' ? 's' : l[0] === '!' ? 'e' : '', text = cls ? l.slice(1) : l;
      const words = text.split(/\s+/).map(w => '<span style="position:relative;top:' + ((rand() - 0.5) * 2.4).toFixed(1) + 'px;letter-spacing:' + ((rand() - 0.5) * 0.6).toFixed(2) + 'px">' + esc(w) + '</span>').join(' ');
      return '<div class="pb-l ' + cls + '" style="transform:translateX(' + (rand() * 7).toFixed(1) + 'px) rotate(' + ((rand() - 0.5) * 1.6).toFixed(2) + 'deg)">' + words + '</div>';
    }).join('');
  }
  const LETTERS = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', 0: 'OPER' };
  const CSS = `
.pb-nb { --lh: 26px; --pt: 26px; --mx: 40px; position: fixed; left: 22px; bottom: 22px; width: 380px; max-width: max(260px, calc(50vw - 215px)); transform: rotate(-1.3deg); transform-origin: 30% 100%; filter: drop-shadow(0 10px 16px rgba(0,0,0,.75)); -webkit-user-select: none; user-select: none; cursor: default; }
.pb-cover { position: relative; padding: 18px 12px 42px; border-radius: 7px 9px 12px 10px; background: radial-gradient(ellipse at 30% 18%, #5c3a2d, #3a231b 72%); box-shadow: inset 0 0 0 2px #22140e, inset 0 0 24px rgba(0,0,0,.6); }
.pb-cover::after { content: ''; position: absolute; inset: 0; z-index: 0; border-radius: inherit; pointer-events: none; background: radial-gradient(circle at 90% 88%, rgba(255,230,200,.09) 0 14px, transparent 15px), radial-gradient(ellipse at 4% 55%, rgba(0,0,0,.3) 0 22px, transparent 23px), linear-gradient(100deg, transparent 60%, rgba(255,240,220,.05) 61% 63%, transparent 64%); }
.pb-rings { position: absolute; left: 24px; right: 24px; top: 7px; height: 17px; z-index: 2; background: repeating-linear-gradient(90deg, transparent 0 8px, #6f7178 8px 10px, #d0d2d6 10px 11px, #55575d 11px 13px, transparent 13px 22px); }
.pb-sheet { position: relative; z-index: 1; min-height: 212px; border-radius: 2px 2px 3px 4px; background-color: #e3d9be; box-shadow: 0 2px 0 #cdc2a5, 0 4px 0 #d9cfb3, 0 6px 0 #c2b694, inset 0 0 34px rgba(120,92,46,.3);
  background-image: radial-gradient(circle at 80% 74%, rgba(140,100,40,.15) 0 24px, rgba(140,100,40,.09) 25px 29px, transparent 30px), linear-gradient(90deg, transparent 0 var(--mx), rgba(178,72,72,.45) var(--mx) calc(var(--mx) + 1px), transparent calc(var(--mx) + 1px)), repeating-linear-gradient(180deg, transparent 0 calc(var(--lh) - 1px), rgba(78,98,140,.33) calc(var(--lh) - 1px) var(--lh));
  background-position: 0 0, 0 0, 0 calc(var(--pt) - 2px); }
.pb-sheet::before { content: ''; position: absolute; top: 5px; left: 24px; right: 24px; height: 7px; background: radial-gradient(circle at 10.5px 3.5px, #2a1d16 0 2.6px, transparent 3.2px) 0 0 / 22px 7px repeat-x; }
.pb-page { position: relative; padding: var(--pt) 18px 10px calc(var(--mx) + 12px); min-height: 176px; font-family: 'Segoe Print', 'Bradley Hand', Noteworthy, 'Chalkboard SE', 'Comic Sans MS', 'Liberation Serif', Georgia, serif; font-style: italic; font-size: calc(16px * var(--text-scale)); line-height: var(--lh); color: #22305c; }
.pb-l { transform-origin: 0 70%; text-decoration-color: rgba(34,48,92,.8); }
.pb-l.h { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; }
.pb-l.s { text-decoration: line-through; text-decoration-thickness: 2px; color: rgba(34,48,92,.7); }
.pb-l.e { text-decoration: underline double; text-decoration-thickness: 1px; text-underline-offset: 4px; }
.pb-blood { display: block; width: calc(100% + var(--mx) + 22px); height: calc(166px + var(--pt)); margin: calc(10px - var(--pt)) 0 0 calc(4px - var(--mx) - 12px); overflow: visible; }
.pb-pno { position: absolute; right: 14px; bottom: 4px; font: italic 13px Georgia, 'Liberation Serif', serif; color: rgba(34,48,92,.5); }
.pb-nav { position: absolute; z-index: 1; left: 12px; right: 12px; bottom: 7px; height: 28px; display: flex; align-items: center; justify-content: space-between; }
.pb-nav span { font: 11px Georgia, 'Liberation Serif', serif; letter-spacing: .3em; color: rgba(234,223,196,.42); }
.pb-nb button { background: rgba(0,0,0,.28); border: 1px solid rgba(234,223,196,.28); color: #eadfc4; font: 20px Georgia, 'Liberation Serif', serif; width: 46px; height: 28px; border-radius: 4px; cursor: pointer; line-height: 1; padding: 0; }
.pb-nb button:hover:not(:disabled) { border-color: rgba(234,223,196,.75); background: rgba(0,0,0,.45); }
.pb-nb button:disabled { opacity: .28; cursor: default; }
.pb-nb .pb-close { position: absolute; top: -11px; right: -11px; width: 28px; height: 28px; border-radius: 50%; font-size: 17px; z-index: 3; background: #2a1d16; }
.pb-flip { animation: pbflip .17s ease-out; }
@keyframes pbflip { from { transform: translateY(-10px); opacity: .15; } to { transform: none; opacity: 1; } }
@media (pointer: coarse) { .pb-nb { bottom: 150px; } }
@media (max-width: 700px) { .pb-nb { left: 8px; width: calc(58vw - 16px); max-width: none; } }
@media (pointer: coarse) and (max-height: 520px) {
  .pb-nb { --lh: 21px; --pt: 15px; --mx: 30px; bottom: 128px; left: 10px; width: 300px; max-width: calc(100vw - 190px); }
  .pb-cover { padding: 15px 10px 34px; }
  .pb-sheet, .pb-page { min-height: 0; }
  .pb-page { padding-bottom: 8px; font-size: calc(13.5px * var(--text-scale)); }
  .pb-blood { height: 122px; }
  .pb-nav { bottom: 4px; }
}
`;

  LEVELS.push({
    id: 'booth', title: 'The Phone Booth', facing: 0, eyeH: 1.65,
    pal: { skyTop: [12, 11, 16], fog: [50, 45, 47], ground: [22, 22, 26], fogDist: 82 },
    ambient: { wind: 0.35, rain: 1, drone: 0.45, droneFreq: 47, windFreq: 300 },
    weather: { kind: 'rain', density: 0.9, wind: 0.25 },
    lights: [{ x: -0.12, y: 2.25, z: 0, r: 3.3, i: 0.55, color: [214, 228, 255], flicker: 0.05 }],
    startInv: ['journal'],
    text: {
      intro: 'It has rained since the last bus, and the phone booth on the corner is the only dry place on the street.<br>Someone in a long coat is walking toward it from a long way off, in step, swinging a lantern. You have seen him before. The last time, you wrote something down.',
      death: { default: 'He came through the glass as if it were rain.', ringing: 'It was still ringing when he came through the glass.', dead: 'You were still listening to a dead line when he came through the glass.', nocoin: 'You were still pressing the keys of a phone that would not dial when he came through the glass.' },
      win: 'Someone picked up and said your name, once, quietly, the way you call something home. Then there were headlights in the rain, and a car drew up at the kerb and its back door swung open. He had stopped in the street, in the lights, and he stood there while you got in. When you looked back he had turned round and was walking away the way he had come.',
      fragment: 'The number is still in the notebook, in your own handwriting. You do not remember writing it down, and you have not crossed it out.',
    },
    // two streets, each seen whole through a pane of the booth: up the main street through the door, and along the pavement
    // to the east through the east pane. The pay phone is on the west wall, so nothing comes that way, and the back of the
    // booth looks at a shuttered shop
    lanes: [
      { deg: 0, name: 'up the street', y: ROAD, apertures: [{ z: B, x0: -0.46, x1: 0.3, y0: 1.06, y1: 2.04 }] },
      { deg: 90, name: 'along to the east', apertures: [{ z: B, x0: -0.46, x1: 0.46, y0: 1.06, y1: 2.04 }] },
    ],
    laneSwitch: false,   // he keeps to the street he started down: the race is with the phone, not with finding him
    // he reaches the glass in about 37 to 46 s. A careful player finds the number by page four on average and the coin in a
    // few seconds, has dialled by about 21 s and is answered by 28; with the number on the last page and his quickest walk
    // there are several seconds to spare, but hardly any after a wrong number as well, which costs about eight (the coin has
    // to be taken out of the return and put back in)
    creatures: [{ type: 'signalman', startDist: 55, time: 72 }],
    aftermath: { type: 'custom' },   // L.aftermath: the car that comes for you, and what he does
    build(L) {
      const s = L.s;
      const nb = writeNotebook(L.rand);
      const inkRand = mulberry32((L.rand() * 4294967295) >>> 0);
      const pageHtml = nb.pages.map(p => pageHTML(p, inkRand));
      Object.assign(s, { pages: nb.pages, keyPage: nb.keyPage, number: nb.number, numberText: nb.numberText, others: nb.others,
        hook: 'on', line: 'idle', dialed: '', doneAt: 0, ringFrom: null, answeredAt: null, nbOpen: false, page: 0,
        credit: 0, returnAt: 0, keyT: {}, padSel: null, deadKeys: 0, end: null, lands: [], lagN: 0, keyHit: {}, blinkAt: -9, handsetT: -9, coinDropT: -9, finger: null, fingerAt: 0, glides: [] });

      // ---------------- the street ----------------
      const roadC = [27, 28, 33], paveC = [54, 54, 58], kerbC = [88, 88, 92], paint = [150, 148, 138];
      // cut a stretch into pieces that grow with distance, so light pools and fog read on near ground and far ground is cheap
      const cuts = (a, b) => { const out = [a], dir = Math.sign(b - a); let p = a, step = 3; while (Math.abs(b - p) > 1e-6) { p += dir * Math.min(step, Math.abs(b - p)); out.push(p); step = Math.min(24, step * 1.2); } return out; };
      const alongX = (x0, x1, z0, z1, y, col, opts) => { const c = cuts(x0, x1); for (let i = 0; i < c.length - 1; i++) SC.floorQ(L, Math.min(c[i], c[i + 1]), z0, Math.max(c[i], c[i + 1]), z1, y, col, opts); };
      const alongZ = (x0, x1, z0, z1, y, col, opts) => { const c = cuts(z0, z1); for (let i = 0; i < c.length - 1; i++) SC.floorQ(L, x0, c[i], x1, c[i + 1], y, col, opts); };
      // the cross street in front of the booth (z 1..8), and the main street running north from it (x -3.5..3.5)
      for (const [z0, z1] of [[1, 4.5], [4.5, 8]]) { alongX(0, 175, z0, z1, ROAD, roadC); alongX(0, -175, z0, z1, ROAD, roadC); }
      for (const [x0, x1] of [[-3.5, 0], [0, 3.5]]) alongZ(x0, x1, 8, 175, ROAD, roadC);
      // pavements: the booth's own (slabs near it), the far side of the cross street, both sides of the main street
      const slabs = { tex: 'stone', texScale: 2 };
      alongX(0, 175, -2.5, 1, 0, paveC, slabs); alongX(0, -175, -2.5, 1, 0, paveC, slabs);
      alongX(3.5, 175, 8, 10.5, 0, paveC); alongX(-3.5, -175, 8, 10.5, 0, paveC);
      alongZ(3.5, 6, 10.5, 175, 0, paveC); alongZ(-6, -3.5, 10.5, 175, 0, paveC);
      // kerbs: the drop to the road, and a paler edge stone along the top
      const kerbX = (x0, x1, z, face) => { const c = cuts(x0, x1); for (let i = 0; i < c.length - 1; i++) { const a = Math.min(c[i], c[i + 1]), b = Math.max(c[i], c[i + 1]); SC.wallV(L, a, z, b, z, ROAD, 0, scalec(kerbC, 0.7)); SC.floorQ(L, a, Math.min(z, z + face * 0.16), b, Math.max(z, z + face * 0.16), 0.004, kerbC); } };
      const kerbZ = (x, z0, z1, face) => { const c = cuts(z0, z1); for (let i = 0; i < c.length - 1; i++) { SC.wallV(L, x, c[i], x, c[i + 1], ROAD, 0, scalec(kerbC, 0.7)); SC.floorQ(L, Math.min(x, x + face * 0.16), c[i], Math.max(x, x + face * 0.16), c[i + 1], 0.004, kerbC); } };
      // (the last argument is the side the pavement is on)
      kerbX(0, 175, 1, -1); kerbX(0, -175, 1, -1); kerbX(3.5, 175, 8, 1); kerbX(-3.5, -175, 8, 1);
      kerbZ(3.5, 8, 175, 1); kerbZ(-3.5, 8, 175, -1);
      // paint, drawn after the road it lies on: the centre lines, and a crossing from the booth to the main street
      const ink = { sortDist: 0.45 };
      for (let x = 6; x < 170; x += 6) for (const sx of [-1, 1]) SC.floorQ(L, Math.min(sx * x, sx * (x + 2.4)), 4.42, Math.max(sx * x, sx * (x + 2.4)), 4.58, ROAD + 0.004, paint, ink);
      for (let z = 12; z < 170; z += 6) SC.floorQ(L, -0.08, z, 0.08, z + 2.4, ROAD + 0.004, paint, ink);
      for (let z = 1.6; z < 7.6; z += 1.0) SC.floorQ(L, -1.6, z, 1.6, z + 0.5, ROAD + 0.004, scalec(paint, 0.9), ink);

      // ---------------- buildings: dark rows along every street, a few windows lit ----------------
      const rng = mulberry32(9091);
      const LIT = [[214, 168, 102], [196, 150, 92], [150, 168, 200], [170, 120, 70]];
      // a window: a quad just proud of its facade, ordered with the bay it is in
      const winQ = (P, Q, n, y0, y1, col, sd, lit) => SC.quad(L, [P[0] + n[0], y0, P[1] + n[1]], [Q[0] + n[0], y0, Q[1] + n[1]], [Q[0] + n[0], y1, Q[1] + n[1]], [P[0] + n[0], y1, P[1] + n[1]], col, Object.assign({ sortDist: sd }, lit ? { noLight: true } : {}));
      // a row of buildings from a to b; each building has its own height and colour, in bays with windows when near
      const row = (ax, az, bx, bz, special) => {
        const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
        let nx = -uz, nz = ux; if (nx * (ax + bx) + nz * (az + bz) > 0) { nx = -nx; nz = -nz; }   // the side that faces the street
        const at = d => [ax + ux * d, az + uz * d];
        let p = 0;
        while (p < len - 0.01) {
          const w = Math.min(len - p, 8 + rng() * 11), h = 8 + rng() * 9, v = rng() * 12, col = [28 + v, 26 + v * 0.9, 30 + v * 0.8];
          const mid = at(p + w / 2), far = Math.hypot(mid[0], mid[1]) > 75;
          const nb = far ? 1 : Math.max(1, Math.round(w / 4.6));
          for (let b = 0; b < nb; b++) {
            const s0 = p + w * b / nb, s1 = p + w * (b + 1) / nb, P0 = at(s0), P1 = at(s1);
            SC.wallV(L, P0[0], P0[1], P1[0], P1[1], 0, h, col);
            const sd = (Math.hypot(P0[0], P0[1]) + Math.hypot(P1[0], P1[1])) / 2 - 0.05, n = [nx * 0.03, nz * 0.03];
            const bw = s1 - s0, wn = far ? Math.max(1, Math.round(bw / 4)) : (bw > 3.4 ? 2 : 1);
            for (let fl = 0; 3.9 + fl * 3.1 + 1.5 < h - 0.5; fl++) for (let k = 0; k < wn; k++) {
              const c = s0 + bw * (k + 0.5) / wn, y0 = 3.9 + fl * 3.1;
              if (special && special(at(c), y0, P0, P1, n, sd)) continue;
              const lit = rng() < 0.08;
              if (!lit && far) continue;
              winQ(at(c - 0.55), at(c + 0.55), n, y0, y0 + 1.5, lit ? LIT[Math.floor(rng() * LIT.length)] : [16, 18, 23], sd, lit);
            }
            if (!far && bw > 2.5) { winQ(at(s0 + 0.45), at(s1 - 0.45), n, 0.35, 2.6, [14, 15, 19], sd); winQ(at(s0), at(s1), n, 2.75, 3.3, scalec(col, 0.65), sd); }   // the shop window and its fascia
          }
          p += w;
        }
      };
      // the lit window across the street, upstairs, with the lamp in it
      let lampDone = false;
      const lampWin = (c, y0, P0, P1, n, sd) => {
        if (lampDone || Math.abs(c[0] + 18) > 1.8 || y0 > 4.5) return false;
        lampDone = true;
        winQ([c[0] - 0.65, c[1]], [c[0] + 0.65, c[1]], n, y0 - 0.1, y0 + 1.5, [222, 176, 108], sd, true);
        winQ([c[0] - 0.65, c[1]], [c[0] - 0.42, c[1]], [n[0] * 1.5, n[1] * 1.5], y0 - 0.1, y0 + 1.5, [92, 40, 34], sd - 0.01, true);   // the curtains, half drawn
        winQ([c[0] + 0.42, c[1]], [c[0] + 0.65, c[1]], [n[0] * 1.5, n[1] * 1.5], y0 - 0.1, y0 + 1.5, [92, 40, 34], sd - 0.01, true);
        STORY.lamp(L, c[0] + 0.1, y0 + 0.02, c[1] - 0.06, { lit: true, scale: 1.8, opts: { sortDist: sd - 0.03, noLight: true } });
        return true;
      };
      row(6, 10.5, 175, 10.5); row(-6, 10.5, -175, 10.5, lampWin);              // across the cross street, both ways
      if (!lampDone) lampWin([-18, 10.5], 3.9, null, null, [0, -0.03], Math.hypot(18, 10.5) - 0.05);   // (the row always has a window there; this only keeps the lamp if the row changes)
      row(6, 10.5, 6, 175); row(-6, 10.5, -6, 175);                            // both sides of the main street
      row(4.2, -2.5, 175, -2.5); row(-4.2, -2.5, -175, -2.5);                  // the booth's side of the street, either way
      SC.wallV(L, -6, 175, 6, 175, 0, 14, [32, 30, 34]); SC.wallV(L, 175, -2.5, 175, 10.5, 0, 12, [32, 30, 34]); SC.wallV(L, -175, -2.5, -175, 10.5, 0, 12, [32, 30, 34]);   // the far ends
      // behind the booth: a shop with its shutter down, a dark sign, and the floors above
      SC.wallV(L, -4.2, -2.5, 4.2, -2.5, 0, 11, [36, 33, 36]);
      SC.wallV(L, -3.2, -2.47, 3.2, -2.47, 0.02, 2.7, [92, 94, 98], { tex: 'tin', texScale: 0.5, sortDist: 3.0 });
      SC.wallV(L, -3.6, -2.47, 3.6, -2.47, 2.85, 3.45, [52, 34, 34], { sortDist: 3.0 });
      for (const x of [-2.6, -0.6, 1.4]) SC.wallV(L, x, -2.47, x + 1.2, -2.47, 4.0, 5.5, [16, 18, 23], { sortDist: 3.0 });
      // parked cars, one in each long street, well clear of the way he walks
      const car = (x0, x1, z0, z1, col) => {
        const lx = x1 - x0 > z1 - z0, y = ROAD, dk = scalec(col, 0.7), glass = [20, 24, 30], tyre = [12, 12, 14];
        SC.box(L, x0, x1, y + 0.3, y + 0.86, z0, z1, col);
        // the cabin sits back from the bonnet, and its windows run down both sides
        const c0 = lx ? [x0 + (x1 - x0) * 0.24, x1 - (x1 - x0) * 0.17, z0 + 0.12, z1 - 0.12] : [x0 + 0.12, x1 - 0.12, z0 + (z1 - z0) * 0.17, z1 - (z1 - z0) * 0.24];
        SC.box(L, c0[0], c0[1], y + 0.86, y + 1.36, c0[2], c0[3], dk);
        if (lx) for (const z of [c0[2] - 0.01, c0[3] + 0.01]) SC.wallV(L, c0[0] + 0.1, z, c0[1] - 0.1, z, y + 0.92, y + 1.3, glass);
        else for (const x of [c0[0] - 0.01, c0[1] + 0.01]) SC.wallV(L, x, c0[2] + 0.1, x, c0[3] - 0.1, y + 0.92, y + 1.3, glass);
        for (const a of [0.16, 0.84]) for (const b of [0, 1]) {
          if (lx) { const wx = x0 + (x1 - x0) * a, wz = b ? z1 - 0.14 : z0 + 0.14; SC.box(L, wx - 0.3, wx + 0.3, y, y + 0.55, wz - 0.12, wz + 0.12, tyre); }
          else { const wz = z0 + (z1 - z0) * a, wx = b ? x1 - 0.14 : x0 + 0.14; SC.box(L, wx - 0.12, wx + 0.12, y, y + 0.55, wz - 0.3, wz + 0.3, tyre); }
        }
      };
      car(-14.6, -10.2, 1.2, 3.0, [64, 30, 30]);
      car(-3.25, -1.45, 33.5, 37.9, [40, 46, 58]);

      // ---------------- street lamps: posts at the kerb, arms over the road, sodium light ----------------
      const LAMPS = [[-4.0, 15, 1, 0], [4.0, 31, -1, 0], [-4.0, 47, 1, 0], [4.0, 63, -1, 0], [-4.0, 82, 1, 0], [4.0, 104, -1, 0],
        [13, 0.8, 0, 1], [28, 8.2, 0, -1], [44, 0.8, 0, 1], [62, 8.2, 0, -1], [84, 0.8, 0, 1],
        [-13, 0.8, 0, 1], [-28, 8.2, 0, -1], [-44, 0.8, 0, 1], [-62, 8.2, 0, -1], [-84, 0.8, 0, 1]];
      const postC = [30, 32, 34], lampLights = [], lampGlows = [];
      for (const [x, z, ax, az] of LAMPS) {
        const d = Math.hypot(x, z), px = -z / d * 0.07, pz = x / d * 0.07;      // a post faces the eye: it is only ever seen from here
        SC.wallV(L, x - px, z - pz, x + px, z + pz, 0, 5.0, postC);
        const hx = x + ax * 1.1, hz = z + az * 1.1;
        SC.quad(L, [x, 4.92, z], [hx, 4.92, hz], [hx, 5.02, hz], [x, 5.02, z], postC);
        SC.box(L, hx - 0.22, hx + 0.22, 4.86, 4.98, hz - 0.22, hz + 0.22, [40, 40, 42]);
        SC.sprite(L, hx, 4.78, hz, 0.36, 0.1, (ctx, P) => { ctx.scale(0.36, 0.1); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.raw([255, 196, 120])); }, { noFog: true, noLight: true });
        const lp = L.pt(hx, 4.8, hz);
        lampLights.push({ x: hx, y: 4.8, z: hz, r: 12, i: 0.6, color: [255, 172, 96] });
        lampGlows.push({ x: lp[0], y: lp[1], z: lp[2], r: 1.7, color: [255, 170, 90], a: 0.22 });
        // its reflection in the wet road: a streak from under the lamp toward the eye, fading as it comes, on the road only
        const fd = Math.hypot(hx, hz), qx = -hz / fd, qz = hx / fd, tEnd = Math.max(0.34, 1.15 / Math.abs(hz)), N = 5;
        for (let k = 0; k < N; k++) {
          const ta = lerp(0.97, tEnd, k / N), tb = lerp(0.97, tEnd, (k + 1) / N), wa = lerp(0.2, 0.06, k / N), wb = lerp(0.2, 0.06, (k + 1) / N);
          SC.quad(L, [hx * ta + qx * wa, ROAD + 0.006, hz * ta + qz * wa], [hx * ta - qx * wa, ROAD + 0.006, hz * ta - qz * wa], [hx * tb - qx * wb, ROAD + 0.006, hz * tb - qz * wb], [hx * tb + qx * wb, ROAD + 0.006, hz * tb + qz * wb], [255, 176, 104], { layer: 0, alpha: 0.12 * (1 - k / N), noLight: true, sortDist: 0.4 });
        }
      }
      L.lights = lampLights.map(l => worldLight(L, l));

      // ---------------- the booth ----------------
      // a metre and a third across and a little over a metre deep: the pay phone is on the west wall at arm's length, and
      // the door (the north pane), the east pane and the back look out on the street, the pavement and the shuttered shop
      const metal = [70, 74, 80], metalD = [52, 55, 61], glass = [150, 172, 198], band = [44, 46, 52];
      SC.floorQ(L, XW, -B, B, B, 0.03, [62, 64, 70], { tex: 'tin', texScale: 0.35 });
      for (const [x, z] of [[XW, -B], [B, -B], [XW, B], [B, B]]) SC.box(L, x - 0.035, x + 0.035, 0, 2.36, z - 0.035, z + 0.035, metal);
      const side = (x0, z0, x1, z1) => {
        const ux = Math.sign(x1 - x0) * 0.035, uz = Math.sign(z1 - z0) * 0.035, a = [x0 + ux, z0 + uz], b = [x1 - ux, z1 - uz];
        SC.wallV(L, a[0], a[1], b[0], b[1], 0.03, 0.26, metalD);
        SC.wallV(L, a[0], a[1], b[0], b[1], 0.26, 0.98, glass, { alpha: 0.08, noLight: true });
        SC.wallV(L, a[0], a[1], b[0], b[1], 0.98, 1.04, metal);
        SC.wallV(L, a[0], a[1], b[0], b[1], 1.04, 2.06, glass, { alpha: 0.08, noLight: true });
        SC.wallV(L, a[0], a[1], b[0], b[1], 2.06, 2.36, band);
      };
      side(XW, B, B, B); side(B, B, B, -B); side(B, -B, XW, -B); side(XW, -B, XW, B);
      SC.quad(L, [XW, 2.36, -B], [B, 2.36, -B], [B, 2.36, B], [XW, 2.36, B], [36, 38, 44]);
      SC.quad(L, [-0.17, 2.35, -0.3], [-0.07, 2.35, -0.3], [-0.07, 2.35, 0.3], [-0.17, 2.35, 0.3], [236, 242, 255], { noFog: true, noLight: true });
      // the door's pull (the door is the north pane): a dull bar on two stand-offs from the glass, so it reads as part of the
      // door and not as something lying loose to be picked up
      SC.box(L, 0.355, 0.375, 0.94, 1.32, B - 0.07, B - 0.05, [92, 96, 104]);
      for (const y of [0.97, 1.27]) SC.box(L, 0.358, 0.372, y, y + 0.022, B - 0.05, B - 0.004, [76, 80, 88]);

      // ---------------- the pay phone, on the west wall ----------------
      // Everything on it is placed by where it lies on the wall: u across it (to your right as you face it, which is north),
      // y up, and d out from the wall toward you. A plate on the wall; the housing, with the display and the coin slot along
      // its top, the keys under them and the coin return at the bottom; the receiver hanging on its right; the instruction
      // card on the plate to its left; the shelf under it all, with the phone book chained to it.
      const FD = -PX;                                                       // how far the face of the housing is from the eye
      const face = { sortDist: FD - 0.01 }, detail = { sortDist: FD - 0.015 };
      const faceQ = (u0, u1, y0, y1, d, col, opts) => SC.wallV(L, XW + d, u0, XW + d, u1, y0, y1, col, opts);
      const LCD = { u0: -0.108, u1: 0.035, y0: 1.655, y1: 1.725 }, SLOT = { u0: 0.052, u1: 0.105, y0: 1.655, y1: 1.725 };
      const RET = { u0: -0.05, u1: 0.05, y0: 1.3, y1: 1.375 }, RX = 0.19;   // the coin return; where the receiver hangs
      const KEYS = ['123', '456', '789', '*0#'], KEY_Y0 = 1.598, KEY_DY = 0.052, KEY_DU = 0.045;
      SC.box(L, XW + 0.005, XW + 0.02, 0.98, 2.02, -0.25, 0.26, [58, 62, 68]);                    // the plate
      SC.box(L, XW + 0.02, PX, 1.29, 1.765, -0.13, 0.13, [128, 132, 140]);                        // the housing
      SC.box(L, XW + 0.02, PX + 0.01, 1.755, 1.785, -0.135, 0.135, [96, 100, 108]);               // its cap
      faceQ(LCD.u0 - 0.009, LCD.u1 + 0.009, LCD.y0 - 0.009, LCD.y1 + 0.009, 0.1005, [62, 64, 70], face);   // the display's bezel (the display is drawn each frame)
      faceQ(SLOT.u0, SLOT.u1, SLOT.y0, SLOT.y1, 0.1005, [176, 180, 188], face);                    // the coin slot's chrome plate,
      faceQ(SLOT.u0 + 0.004, SLOT.u1 - 0.004, SLOT.y0 + 0.004, SLOT.y1 - 0.004, 0.101, [138, 142, 150], detail);
      faceQ(0.0735, 0.0835, 1.666, 1.714, 0.1015, [6, 6, 8], { sortDist: FD - 0.02 });            // and the slot in it
      faceQ(-0.075, 0.075, 1.41, 1.63, 0.1005, [92, 96, 102], face);                             // the keypad's plate
      faceQ(RET.u0, RET.u1, RET.y0, RET.y1, 0.1005, [160, 164, 172], face);                       // the coin return: a chrome surround
      faceQ(RET.u0 + 0.008, RET.u1 - 0.008, RET.y0 + 0.008, RET.y1 - 0.006, 0.101, [12, 12, 14], detail);   // and its dark mouth
      // the instruction card, on the plate to the left of the housing: a printed heading, and the three steps in the order
      // the phone wants them (as on any pay phone), big enough to read in the close view
      faceQ(-0.232, -0.142, 1.43, 1.67, 0.021, [214, 208, 190]);
      SC.wallV(L, XW + 0.0215, -0.226, XW + 0.0215, -0.148, 1.625, 1.655, [150, 40, 36], { sortDist: 0.79 });
      SC.sprite(L, XW + 0.022, 1.43, -0.187, 0.09, 0.24, (ctx, P) => {
        const print = (t, x, y, px, col, weight) => { ctx.save(); ctx.translate(x, y); ctx.scale(0.001, -0.001); ctx.font = (weight || 'bold') + ' ' + px + 'px Arial, Helvetica, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.fillText(t, 0, 0); ctx.restore(); };
        ctx.save(); ctx.translate(0, 0.2); ctx.scale(0.001, -0.001); ctx.font = 'bold 13px Arial, Helvetica, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = P.col([236, 226, 210]); ctx.fillText('TO CALL', 0, 0); ctx.restore();
        const ink = P.col([36, 42, 70]), red = P.col([150, 40, 36]);
        [['1', 'LIFT', 'the receiver'], ['2', 'INSERT', 'a coin'], ['3', 'DIAL', 'the number']].forEach(([n, a, b], i) => {
          const y = 0.158 - i * 0.064;
          print(n, -0.041, y - 0.021, 30, red);
          print(a, -0.019, y, 13, ink); print(b, -0.019, y - 0.017, 9.5, ink, 'normal');
        });
      }, { sortDist: 0.785 });
      // the shelf under it, and the phone book chained to it: a fat directory lying with its spine to the wall, so what faces
      // you is the block of pages between its yellow covers. Only the faces the eye can see are built (the eye is almost in
      // line with its near side, which would only ever show as a sliver drawn over the cover)
      SC.box(L, XW + 0.02, XW + 0.24, 1.0, 1.03, -0.32, 0.32, [96, 100, 106]);
      const PB = { u0: -0.25, u1: -0.01, d0: 0.04, d1: 0.2, y0: 1.03, y1: 1.1 }, cv = 0.008, xN = XW + PB.d1, xF = XW + PB.d0;   // its near edge, and its spine
      const yellow = [200, 166, 54], yellowD = scalec(yellow, 0.72);
      SC.wallV(L, xN - 0.003, PB.u0 + 0.004, xN - 0.003, PB.u1 - 0.004, PB.y0 + cv, PB.y1 - cv, [216, 208, 184]);   // the pages
      for (const y of [1.052, 1.07]) SC.wallV(L, xN - 0.0025, PB.u0 + 0.004, xN - 0.0025, PB.u1 - 0.004, y, y + 0.0025, [170, 160, 136], { sortDist: -xN - 0.004 });
      SC.wallV(L, xN, PB.u0, xN, PB.u1, PB.y0, PB.y0 + cv, yellowD);                                       // the back cover's edge
      // the front cover, hinged at the spine: built each frame (L.dynamic), as it lifts a crack when the hand pulls at it.
      // Its top, its edge, and on it, toward the spine, the black band the title is printed in and a line of small print
      // under it; lifted, the top of the pages shows under its edge, in shadow
      const coverParts = th => {
        const ca = Math.cos(th), sa = Math.sin(th), D = PB.d1 - PB.d0;
        const on = (d, dy) => [xF + d * ca - dy * sa, PB.y1 + d * sa + dy * ca];   // d along the cover from the spine, dy up off it
        const flat = (d0, d1, dy, u0, u1, col, opts) => { const a = on(d0, dy), b = on(d1, dy); return SC.mkQuad(L, [a[0], a[1], u0], [a[0], a[1], u1], [b[0], b[1], u1], [b[0], b[1], u0], col, opts); };
        const out = [];
        if (th > 0.004) {   // the gap under its edge, in shadow
          const f0 = on(D, -cv);
          out.push(SC.mkQuad(L, [xN - 0.003, PB.y1 - cv, PB.u0 + 0.004], [xN - 0.003, PB.y1 - cv, PB.u1 - 0.004], [f0[0], f0[1], PB.u1], [f0[0], f0[1], PB.u0], [40, 34, 26], { sortDist: -xN + 0.004 }));
        }
        out.push(flat(0, D, 0, PB.u0, PB.u1, yellow, { sortDist: -xN + 0.03 }));                                                                    // the cover
        const e0 = on(D, -cv), e1 = on(D, 0);
        out.push(SC.mkQuad(L, [e0[0], e0[1], PB.u0], [e0[0], e0[1], PB.u1], [e1[0], e1[1], PB.u1], [e1[0], e1[1], PB.u0], yellowD, { sortDist: -xN + 0.01 }));   // its edge
        for (const [d0, d1, col] of [[0.024, 0.056, [34, 30, 26]], [0.07, 0.078, [120, 96, 34]]]) out.push(flat(d0, d1, 0.001, PB.u0 + 0.022, PB.u1 - 0.022, col, { sortDist: -xN + 0.02 }));
        return out;
      };
      const cover0 = coverParts(0);
      // the chain, from the book's corner down to a ring at the back of the shelf
      SC.quad(L, [XW + 0.07, 1.07, PB.u0], [XW + 0.06, 1.046, -0.268], [XW + 0.045, 1.034, -0.284], [XW + 0.03, 1.04, -0.296], [140, 142, 148], { stroke: true, lw: 0.005 });
      SC.box(L, XW + 0.02, XW + 0.03, 1.03, 1.05, -0.304, -0.288, [120, 122, 128]);

      // ---------------- the notebook, the coin, the receiver, the keys, the coin slot and return, the phone book ----------------
      const journal = mkItem(L, 'journal', 'Notebook', { x: XW + 0.14, y: 1.03, z: 0.2 }, { w: 0.18, h: 0.22, tool: true, icon: 'notebook', held: { grip: 'pinch', at: [-0.22, 0.2], angle: -0.22, size: 0.2 } });   // (held by its corner, between finger and thumb)
      // the coin: left in the coin return by the last person to use the phone, on the shelf, or dropped on the floor of the
      // booth, in one of the corners by the phone (the far corners: the rest of the floor is under your feet, at the bottom
      // edge of the view looking down)
      const COIN_RET = { x: XW + 0.122, y: RET.y0 + 0.006, z: 0 };
      const coin = mkItem(L, 'coin', 'Coin', [
        Object.assign({ key: 'return', jitter: 0 }, COIN_RET),
        { key: 'shelf', x: XW + 0.13, y: 1.03, z: 0.17, flat: true, jitter: 0.02 },
        { key: 'floorSW', x: -0.66, y: 0.03, z: -0.42, flat: true, jitter: 0.03 },
        { key: 'floorNW', x: -0.66, y: 0.03, z: 0.42, flat: true, jitter: 0.03 },
      ], { w: 0.07, h: 0.07, icon: 'coin' });
      if (coin.y < 0.5) coin.w = coin.h = 0.09;   // on the floor, a little further off and lower in the view, drawn a little bigger
      const coinInCup = () => !coin.taken && Math.abs(coin.x - COIN_RET.x) < 0.01 && Math.abs(coin.y - COIN_RET.y) < 0.01;
      const coinBack = () => {   // a call that never went through gives the coin back: it rattles down into the return (L.update drops it in)
        const p = L.pt(COIN_RET.x, COIN_RET.y, COIN_RET.z);
        Object.assign(coin, { x: p[0], y: p[1], z: p[2], w: 0.07, h: 0.07, flat: false, taken: false, uses: 1 });
        s.coinDropT = L.t; s.coinClink = false;
      };
      let dom = null;
      const shown = { nb: false };
      const fmt = d => d.length > 3 ? d.slice(0, 3) + '-' + d.slice(3) : d;
      const drawPage = flip => {
        if (!dom) return;
        dom.page.innerHTML = pageHtml[s.page]; dom.pno.textContent = String(s.page + 1);
        dom.prev.disabled = s.page === 0; dom.next.disabled = s.page === pageHtml.length - 1;
        if (flip) { dom.sheet.classList.remove('pb-flip'); void dom.sheet.offsetWidth; dom.sheet.classList.add('pb-flip'); }
      };
      // the panel is made the first time it is wanted, under the HUD (the toast, the tooltip and what you hold are always
      // drawn over it) and so under the game's own overlay (a menu always covers it)
      const ensureDom = () => {
        if (dom) return;
        const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
        const nbEl = document.createElement('div'); nbEl.className = 'pb-nb'; nbEl.style.display = 'none'; nbEl.setAttribute('aria-label', 'Notebook');
        nbEl.innerHTML = '<div class="pb-cover"><div class="pb-rings"></div><button type="button" class="pb-close" aria-label="Close the notebook">×</button><div class="pb-sheet"><div class="pb-page"></div><div class="pb-pno"></div></div><div class="pb-nav"><button type="button" class="pb-prev" aria-label="Previous page">‹</button><span>← →</span><button type="button" class="pb-next" aria-label="Next page">›</button></div></div>';
        const before = document.getElementById('hud') || document.getElementById('overlay');
        if (before) document.body.insertBefore(nbEl, before); else document.body.appendChild(nbEl);
        nbEl.addEventListener('mousedown', e => e.preventDefault());               // no focus, no text selection
        nbEl.addEventListener('mousemove', e => { e.stopPropagation(); G.mouse.x = -1; G.mouse.y = -1; });   // nothing behind the panel is hovered
        nbEl.addEventListener('click', e => e.stopPropagation());
        dom = { style, nbEl, page: nbEl.querySelector('.pb-page'), pno: nbEl.querySelector('.pb-pno'), sheet: nbEl.querySelector('.pb-sheet'), prev: nbEl.querySelector('.pb-prev'), next: nbEl.querySelector('.pb-next') };
        dom.prev.addEventListener('click', () => turn(-1)); dom.next.addEventListener('click', () => turn(1));
        nbEl.querySelector('.pb-close').addEventListener('click', () => setNotebook(false));
        drawPage(false);
      };
      // show the notebook while it is wanted, and only while the night is being played: a pause, a death or the win puts it away
      const sync = () => {
        if (!G.inv.includes(journal)) s.nbOpen = false;          // put down, it cannot be read
        receiver.name = s.hook === 'off' ? 'Hook' : 'Receiver';   // with the receiver in your hand, what is left to click is the hook
        const nbShow = G.L === L && G.state === 'play' && s.nbOpen;
        if (nbShow && !dom) ensureDom();
        if (!dom) return;
        if (nbShow !== shown.nb) { dom.nbEl.style.display = nbShow ? '' : 'none'; shown.nb = nbShow; }
      };
      const setNotebook = open => { s.nbOpen = open; AUDIO.sfx(open ? 'pickup' : 'ui'); sync(); };
      const turn = d => { const p = clamp(s.page + d, 0, pageHtml.length - 1); if (p === s.page) return; s.page = p; AUDIO.sfx('ui'); drawPage(true); };
      // a pay phone, in the order it wants: lift the receiver (a dial tone), put the coin in, dial. A coin put in with the
      // receiver on its hook drops straight through to the return; hanging up on a call that was never answered gives it back
      // lifted, the receiver comes off its hook into your left hand (L.offHand), and is put back from it; the right hand
      // lifts it and puts it back (and pushes the hook down)
      const lift = () => { s.hook = 'off'; s.line = 'tone'; s.dialed = ''; s.lagN = 0; s.handsetT = L.t; AUDIO.sfx('receiver'); G.say('You lift the receiver. A dial tone.', 'A dial tone.'); };
      const hangUp = () => {
        const ringing = s.line === 'ringing' || s.line === 'connecting';
        s.hook = 'on'; s.line = 'idle'; s.dialed = ''; s.lagN = 0; s.ringFrom = null; s.handsetT = L.t; AUDIO.sfx('clunk');
        for (const l of s.lands) { l.digit = false; l.sfx = 'keyClick'; }   // (keys still to be pressed, pressed on a dead phone)
        if (s.credit) { s.credit = 0; s.returnAt = L.t + 0.45; AUDIO.sfx('coinReturn'); }
        if (ringing) G.say('You hung up. The ringing stops.', 'The ringing stops.');
      };
      // your fingertip on the keys: the hand comes up to the key (what you hold goes down meanwhile) and, dialling, goes on
      // from key to key without going back down first; the key goes down, and clicks or beeps, when the finger gets there.
      // Returns how long that is. (The reach is the empty hand's (G.reach), kept quiet: the key makes the sound.) Keys pressed
      // faster than it can go are pressed in turn, each once the one before is down (s.glides: the keys it goes on to;
      // s.fingerAt: when it is down on the last key it was sent to; s.finger: the reach that is the fingertip)
      const GLIDE = 0.09;
      const invSmooth = k => { let a = 0, b = 1; for (let i = 0; i < 14; i++) { const m = (a + b) / 2; if (smoothstep(m) < k) a = m; else b = m; } return (a + b) / 2; };
      const glideTo = (rc, to, target) => {
        const into = rc.T - rc.out;
        if (into > rc.hold) rc.T = rc.out * invSmooth(1 - smoothstep((into - rc.hold) / rc.back));   // on its way back down: on its way out again from there
        else if (into > 0) rc.T = rc.out;                                                               // at a key: a new press from here
        rc.glide = { from: Object.assign({}, rc.at), to, t0: L.t }; rc.target = target; rc.hold = 0.3; rc.touched = 99;
      };
      const fingerTo = t => {
        const at = HANDS.pointOn(t, undefined, 0.02), rc = G.hand.reach;
        if (rc && rc === s.finger && rc.T < rc.out + rc.hold + rc.back) {
          if (s.fingerAt > L.t) { s.glides.push({ to: at, t0: s.fingerAt, target: t }); s.fingerAt += GLIDE; return s.fingerAt - L.t; }   // not down on the last key yet
          glideTo(rc, at, t); s.fingerAt = L.t + Math.max(GLIDE, rc.out - rc.T);
          return s.fingerAt - L.t;
        }
        const r = G.reach(t, { style: 'touch' });
        if (!r) return 0;
        r.touched = 99; r.hold = 0.3; s.finger = r; s.glides = []; s.fingerAt = L.t + r.out;
        return r.out;
      };
      // one press of a key: it goes down whatever happens; it beeps only on a live line with credit, and only a line that is
      // still being dialled takes the digit. What the phone shows of it waits for the finger (s.lagN: digits not yet there).
      // Pressed with no coin in, the display blinks its credit at you; pressed on a dead line, NOT IN SERVICE
      const NO_CREDIT = ['It will not dial until a coin is in it.', 'Nothing. No credit.'];
      const press = ch => {
        if (G.state !== 'play') return;
        s.keyT[ch] = L.t;
        if (s.line === 'answered') return;
        const k = keys.find(q => q.ch === ch), wait = k ? fingerTo(k.t) : 0;
        const land = (sfx, digit, blink) => { s.lands.push({ at: L.t + wait, ch, sfx, digit, blink }); if (digit) s.lagN++; };
        if (s.hook !== 'off') { land('keyClick'); G.say('The receiver is still on its hook.', 'The receiver is on its hook.'); return; }
        if (!s.credit) { land('keyClick', false, true); s.deadKeys++; G.say(NO_CREDIT[0], NO_CREDIT[1]); return; }
        if (ch === '*' || ch === '#') { land('dial'); return; }
        if (s.line === 'dead') { land('dial', false, true); G.say('The line is dead. Hang up and try again.', 'The line is dead.'); return; }
        if (s.line !== 'tone' && s.line !== 'dialing') { land('dial'); return; }
        s.dialed += ch; s.line = 'dialing'; land('dial', true);
        if (s.dialed.length === 7) { s.line = s.dialed === s.number ? 'connecting' : 'checking'; s.doneAt = L.t; }
      };
      const receiver = mkTarget(L, {
        id: 'receiver', name: 'Receiver', x: XW + 0.135, y: 1.3, z: RX, w: 0.11, h: 0.44,
        onClick() { if (s.line === 'answered') return true; if (s.hook === 'on') lift(); else hangUp(); return true; },
      });
      // a target stands a little in front of the face, so it is drawn (and outlined when hovered) after what is on the face,
      // and is placed and sized so that on screen it covers just what it stands for there
      const front = (u, y0, w, h, d) => { const k = (-XW - (d || 0.125)) / (-XW - 0.104); return { x: XW + (d || 0.125), z: u * k, y: L.eyeH + (y0 - L.eyeH) * k, w: w * k, h: h * k }; };
      // the keys: each a target of its own, a little bigger than the key, and drawn each frame so it can go down when pressed
      const keys = [], KEY_NAME = { '*': 'star', '#': 'hash' };
      const drawKey = (ctx, P, ch) => {
        const dn = s.keyHit[ch] !== undefined && L.t - s.keyHit[ch] < 0.16;  // down for a moment once the finger is on it
        P_rect(ctx, -0.0205, 0.0015, 0.041, 0.041, P.col([30, 32, 36]));     // the hole in the plate it stands in
        const y0 = dn ? 0.0035 : 0.0085;
        if (!dn) P_rect(ctx, -0.017, 0.0045, 0.034, 0.0045, P.col([112, 114, 120]));   // its lower side, while it stands proud
        P_rect(ctx, -0.017, y0, 0.034, 0.032, P.col(dn ? [150, 152, 158] : [214, 216, 218]));
        if (!dn) P_rect(ctx, -0.017, y0 + 0.0285, 0.034, 0.0035, P.col([240, 241, 243]));   // the light along its top edge
        ctx.save(); ctx.translate(0, y0 + (LETTERS[ch] ? 0.0195 : 0.016)); ctx.scale(0.00105, -0.00105);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.col(dn ? [16, 18, 22] : [30, 32, 38]);
        ctx.font = 'bold 20px Arial, Helvetica, sans-serif'; ctx.fillText(ch, 0, ch === '*' ? 5 : 1);
        if (LETTERS[ch]) { ctx.font = 'bold 7px Arial, Helvetica, sans-serif'; ctx.fillText(LETTERS[ch], 0, 12.5); }
        ctx.restore();
      };
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
        const ch = KEYS[r][c], u = (c - 1) * KEY_DU, yc = KEY_Y0 - r * KEY_DY;
        const t = mkTarget(L, Object.assign(front(u, yc - 0.023, 0.042, 0.046), { id: 'key' + (KEY_NAME[ch] || ch), name: '', onClick() { press(ch); return true; } }));   // (no name: what it is is printed on it)
        keys.push({ ch, u, y: yc, w: 0.042, h: 0.046, t, spr: SC.mkSprite(L, XW + 0.104, yc - 0.022, u, 0.044, 0.044, (ctx, P) => drawKey(ctx, P, ch), { sortDist: FD - 0.016 }) });
      }
      const slot = mkTarget(L, {
        ...front((SLOT.u0 + SLOT.u1) / 2, SLOT.y0 - 0.004, SLOT.u1 - SLOT.u0 + 0.01, SLOT.y1 - SLOT.y0 + 0.008), id: 'slot', name: 'Coin slot', accepts: ['coin'],
        onClick() { if (s.credit) { G.reach(this, 'touch'); G.say('There is a coin in it already.', 'It has a coin in it.'); return true; } return false; },   // (fingers on it: it is full)
        // with the receiver on its hook the coin goes from your fingers to the slot and in, rattles down through the works and
        // drops into the coin return below, where it lies to be taken out again (coinBack). (Lifted while it was on its way,
        // it counts.)
        use() {
          if (s.hook !== 'off') {
            G.say('The coin drops straight through. Lift the receiver first.', 'It drops straight through.');
            const through = () => { s.returnAt = L.t + 0.5; AUDIO.sfx('coinReturn'); };
            const fx = G.fumble(coin, this, { preset: 'return', drop: false, scale: 0.042 / coin.w, sfx: { hit: 'tink' }, onHit: () => {   // (a coin's size at the slot)
              G.removeFromInv(coin);
              if (s.hook === 'off') { s.credit = 10; AUDIO.sfx('coin'); } else through();
            } });
            if (!fx) { through(); return true; }   // (something else on its way from the hand: it is let go of at once)
            return G.refuse(false);
          }
          s.credit = 10; AUDIO.sfx('coin');
          if (G.toastT > 0 && NO_CREDIT.includes(G.lastToast.msg)) G.toastT = 0.001;   // there is credit now: the line that said there was none goes
          return true;
        },
      });
      const ret = mkTarget(L, {
        ...front(0, RET.y0 - 0.004, RET.u1 - RET.u0 + 0.012, RET.y1 - RET.y0 + 0.008, 0.115), id: 'return', name: 'Coin return',
        onClick() {
          if (coinInCup()) { HANDS.picked(coin); coin.taken = true; G.inv.push(coin); G.active = G.inv.length - 1; G.hover = null; AUDIO.sfx('pickup'); return true; }   // (as picking it up: out of the cup into your hand)
          G.reach(this, { style: 'push', sfx: 'tink' }); G.say('There is nothing in the coin return.', 'Empty.'); return true;   // fingers in at the flap: nothing there
        },
      });
      // what you click is the whole book as the eye sees it: up the plane of its front edge to where the back of its cover shows.
      // It will not open: the hand takes the cover by its front edge (about 0.4 up what you click: the edge the cover lifts
      // at, away from its spine) and pulls, twice, and the swollen pages lift it a crack and let it drop back (touchedAt:
      // when the hand first had it), the chain jerking on its ring
      const bookTop = L.eyeH + (PB.y1 - L.eyeH) * (-xN) / (-xF);
      const book = mkTarget(L, {
        id: 'book', name: 'Phone book', x: xN, y: PB.y0 - 0.004, z: (PB.u0 + PB.u1) / 2, w: PB.u1 - PB.u0 + 0.016, h: bookTop - PB.y0 + 0.012,
        onClick() {
          G.reach(this, { style: 'pull', at: [0.3, 0.42], sfx: 'flop', onTouch: () => AUDIO.sfx('rattle') });
          G.say('The phone book has been out in the damp too long. The pages will not come apart.', 'The pages are swollen with damp. They will not come apart.'); return true;
        },
      });
      const sm = () => L.creatures[0];
      // the exchange: a wrong number is not in service; the right one connects, rings for seven seconds from the last digit, and is answered
      // facing the phone, the view tips down to the middle of its face; brought in closer than the whole face will fit (on a
      // small screen), to the display and the keys
      const phonePitch = () => Math.atan2(L.eyeH - (L.viewZoom() > 1.5 ? 1.56 : 1.515), FD);
      L.update = dt => {
        if (G.state === 'play') {   // the close view of the phone holds its tilt while you face it, and lets it go when you turn away
          const cam = G.cam;
          if (closeUp()) { s.pitch = phonePitch(); if (cam.tPitch !== s.pitch) cam.tPitch = s.pitch; } else { s.padSel = null; if (s.pitch !== undefined && cam.tPitch === s.pitch) cam.tPitch = 0; }
        }
        if (s.returnAt && L.t >= s.returnAt) { s.returnAt = 0; coinBack(); }
        // the coin comes down into the cup and settles there with a clink
        if (s.coinDropT > 0 && !coin.taken) {
          const k = (L.t - s.coinDropT) / 0.13;
          coin.y = COIN_RET.y + (k < 1 ? 0.04 * (1 - k * k) : k < 1.6 ? 0.006 * Math.sin(Math.PI * (k - 1) / 0.6) : 0);
          if (k >= 1 && !s.coinClink) { s.coinClink = true; AUDIO.sfx('tink'); }
          if (k >= 1.6) s.coinDropT = -9;
        }
        // the finger gets to a key: down it goes, with its click or its beep, and the digit shows; a dead press blinks the display
        for (const l of s.lands.slice()) {
          if (L.t < l.at) continue;
          s.lands.splice(s.lands.indexOf(l), 1);
          s.keyHit[l.ch] = L.t; AUDIO.sfx(l.sfx);
          if (l.digit && s.lagN > 0) s.lagN--;
          if (l.blink) s.blinkAt = L.t;
        }
        // the finger going on from key to key, each once the one before is down (none if the hand is wanted elsewhere)
        const rc = G.hand.reach;
        if (s.glides.length && rc !== s.finger) s.glides = [];
        while (s.glides.length && L.t >= s.glides[0].t0) { const q = s.glides.shift(); glideTo(rc, q.to, q.target); }
        if (rc && rc.glide) { const k = smoothstep((L.t - rc.glide.t0) / GLIDE), a = rc.glide.from, b = rc.glide.to; rc.at = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) }; if (k >= 1) rc.glide = null; }
        // the phone book's cover lifts a crack each time the hand pulls at it (with each pull of G.reach's 'pull', two to a
        // hold of 0.46 s), and drops back
        const pulling = rc && rc.target === book && rc.T >= rc.out && rc.T < rc.out + rc.hold;
        const want = pulling ? 0.15 * Math.max(0, Math.sin(Math.PI * (((rc.T - rc.out) / 0.23) % 1))) : 0;
        s.bookA = (s.bookA || 0) + (want - (s.bookA || 0)) * Math.min(1, (want > (s.bookA || 0) ? 28 : 16) * dt);
        if (s.line === 'checking' && L.t - s.doneAt > 0.7) { s.line = 'dead'; AUDIO.sfx('noService'); G.say('The number you have dialled is not in service.', 'The number you have dialled is not in service.', 3.2); }
        if (s.line === 'connecting' && L.t - s.doneAt > 0.9) { s.line = 'ringing'; s.ringFrom = s.doneAt; s.nextRing = L.t + 3; AUDIO.sfx('ringback'); G.say('It is ringing.', 'It is ringing.'); }
        if (s.line === 'ringing' && L.t >= s.nextRing) { s.nextRing = L.t + 3; AUDIO.sfx('ringback'); }   // one ring every 3 s, only while it rings: hanging up stops it
        if (s.line === 'ringing' && L.t - s.ringFrom >= 7) {
          s.line = 'answered'; s.answeredAt = L.t; AUDIO.sfx('answer'); G.say('Someone picks up.', 'Someone picks up.', 3.5);
          s.nbOpen = false; sync();
        }
      };
      L.isWon = () => s.line === 'answered';
      L.onCatch = () => { s.nbOpen = false; sync(); return false; };
      L.deathCause = () => (s.line === 'ringing' || s.line === 'connecting') ? 'ringing' : s.line === 'dead' ? 'dead' : (s.hook === 'off' && !s.credit && s.deadKeys) ? 'nocoin' : null;

      // ---------------- facing the phone: the view comes in close, and the keys take the number keys and the d-pad ----------------
      const closeUp = () => G.L === L && G.state === 'play' && G.cam.dirIdx === PHONE_DIR && G.cam.tPitch < PITCH_DOWN * 0.5;
      // close enough that the keys are a comfortable size to click or tap (about 46 px apart), and at least close enough that
      // the face of the phone fills the view between the line along the top of the screen and what you hold along the
      // bottom: 1.3 at 1280x760, about 2.2 on a phone held sideways
      L.viewZoom = () => (closeUp() ? clamp(46 / (KEY_DU / FD * (R.H / 2) / Math.tan(31 * DEG)), 1.3, 2.6) : 0);   // (the renderer's view is 62 degrees high)
      // a gamepad: the d-pad moves a highlight over the receiver, the coin slot, the keys and the coin return, as they lie on
      // the phone; past the last thing that way it turns (or looks down) as it always does. A presses what is highlighted.
      const controls = keys.concat([{ t: receiver, u: RX, y: 1.52, w: 0.11, h: 0.44 }, { t: slot, u: (SLOT.u0 + SLOT.u1) / 2, y: (SLOT.y0 + SLOT.y1) / 2, w: 0.063, h: 0.078 }, { t: ret, u: 0, y: (RET.y0 + RET.y1) / 2, w: 0.112, h: 0.073 }]);
      L.padDir = dir => {
        if (!closeUp()) return false;
        const D = [null, [-1, 0], [1, 0], [0, 1], [0, -1]][dir], from = s.padSel || { u: 0, y: 1.52 };
        let best = null, bestS = Infinity;
        for (const c of controls) {
          if (c === s.padSel) continue;
          const du = c.u - from.u, dy = c.y - from.y, d = Math.hypot(du, dy), cos = d > 1e-6 ? (du * D[0] + dy * D[1]) / d : 0;
          if (cos < 0.5) continue;                                         // within sixty degrees of the way it was pushed
          const sc = d * (1 + 3 * (1 - cos));
          if (sc < bestS) { bestS = sc; best = c; }
        }
        if (!best) { s.padSel = null; return false; }
        s.padSel = best; AUDIO.sfx('ui'); return true;
      };
      L.padUse = () => {
        if (!closeUp()) return false;
        ensureAudio();
        if (!s.padSel) {   // nothing highlighted yet: what is nearest the middle of the view, as the Use button does
          let bd = Infinity;
          for (const c of controls) { const p = R.screenPos(XW + 0.11, c.y, c.u); const d = p ? Math.hypot(p.x - R.W / 2, p.y - R.H / 2) : Infinity; if (d < bd) { bd = d; s.padSel = c; } }
        }
        if (s.padSel) useTarget(s.padSel.t);
        return true;
      };

      // ---------------- input: the notebook from the inventory, and the number keys while you face the phone ----------------
      const invEl = document.getElementById('inventory');
      const onInv = e => {
        if (G.L !== L || G.state !== 'play') return;
        const slotEl = e.target && e.target.closest ? e.target.closest('.slot') : null; if (!slotEl) return;
        const idx = Array.prototype.indexOf.call(invEl.children, slotEl);
        if (G.inv[idx] !== journal) return;
        e.stopPropagation();                                     // clicking the notebook opens it (or shuts it); it is never put down this way
        G.active = idx; G.invSig = '';
        setNotebook(!s.nbOpen);
      };
      const onKey = e => {
        if (G.L !== L || G.state !== 'play') return;
        const k = e.key;
        if (closeUp() && k && k.length === 1 && '0123456789*#'.includes(k)) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) press(k); return; }   // facing the phone the number keys press its keys instead of choosing what you hold
        if (shown.nb && (k === 'ArrowLeft' || k === 'ArrowRight')) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) turn(k === 'ArrowLeft' ? -1 : 1); }   // A and D still turn
      };
      if (invEl) invEl.addEventListener('click', onInv, true);
      window.addEventListener('keydown', onKey, true);
      L.onEnd = () => {
        window.removeEventListener('keydown', onKey, true);
        if (invEl) invEl.removeEventListener('click', onInv, true);
        if (dom) { dom.nbEl.remove(); dom.style.remove(); dom = null; }
        shown.nb = false;
      };

      // ---------------- every frame: the receiver, its cord, the keys, the display, rain running down the glass ----------------
      const drops = [];
      const drng = mulberry32(4242);
      for (const [x0, z0, x1, z1, nx, nz] of [[XW, B, B, B, 0, 1], [B, B, B, -B, 1, 0], [B, -B, XW, -B, 0, -1], [XW, -B, XW, B, -1, 0]])
        for (let k = 0; k < 11; k++) drops.push({ x0, z0, x1, z1, nx, nz, u: 0.06 + drng() * 0.88, v: 0.04 + drng() * drng() * 0.4, ph: drng() * 10, len: 0.015 + drng() * 0.04 });
      // the cord: steel-armoured, out of the bottom of the housing. On the hook it hangs in a loop to the bottom of the
      // handset; lifted, it runs over the front of the shelf and away toward you, out of the bottom of the view. It is a
      // smooth curve through a few points (u, y, d, as on the phone) with a twist drawn along it for the armour, in short
      // lengths so that each is as thick as it is near
      const cord = (ctrl, sd) => {
        const out = [];
        ctrl = ctrl.map(([u, y, d]) => [XW + d, y, u]);
        for (let i = 0; i < ctrl.length - 1; i++) {
          const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)], seg = [];
          const n = Math.max(6, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]) / 0.009));   // a twist every centimetre or so
          for (let k = 0; k <= n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; seg.push([0, 1, 2].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
          const twist = seg.map((p, k) => { const q = seg[Math.min(n, k + 1)], r = seg[Math.max(0, k - 1)], dz = q[2] - r[2], dy = q[1] - r[1], l = Math.hypot(dz, dy) || 1, w = (k & 1 ? 1 : -1) * 0.0028; return [p[0], p[1] - dz / l * w, p[2] + dy / l * w]; });
          const w = pts => pts.map(p => L.pt(p[0], p[1], p[2]));
          out.push({ kind: 'poly', pts: w(seg), color: [54, 56, 62], stroke: true, lw: 0.0075, sortDist: sd - i * 0.0001 });
          out.push({ kind: 'poly', pts: w(twist), color: [124, 126, 132], stroke: true, lw: 0.0016, sortDist: sd - i * 0.0001 - 0.00005 });
        }
        return out;
      };
      const cords = {
        on: cord([[0.1, 1.29, 0.08], [0.104, 1.2, 0.09], [0.13, 1.145, 0.1], [0.165, 1.2, 0.11], [RX - 0.002, 1.31, 0.12]], FD - 0.035),
        off: cord([[0.1, 1.29, 0.08], [0.1, 1.13, 0.18], [0.085, 1.042, 0.245], [0.02, 0.9, 0.38], [-0.1, 0.86, 0.5], [-0.22, 1.0, 0.64], [-0.3, 1.2, 0.74]], 0.3),   // (lifted: to your left hand)
      };
      // the handset, drawn as a billboard: the eye only ever sees it from where you stand
      const handsetIcon = (ctx, P) => {   // in a unit box, as an icon is drawn
        const k = P.col([20, 20, 22]), kl = P.col([58, 58, 64]), kd = P.col([6, 6, 8]);
        P_ell(ctx, 0, 0.885, 0.46, 0.1, k); P_rect(ctx, -0.46, 0.8, 0.92, 0.085, k);       // the earpiece
        P_rect(ctx, -0.2, 0.17, 0.4, 0.66, k);                                              // the grip
        P_ell(ctx, 0, 0.11, 0.46, 0.1, k); P_rect(ctx, -0.46, 0.11, 0.92, 0.09, k);         // the mouthpiece
        P_line(ctx, -0.09, 0.26, -0.09, 0.74, 0.05, kl);                                    // the light along it
        for (const y of [0.86, 0.14]) for (const x of [-0.18, 0, 0.18]) P_ell(ctx, x, y, 0.05, 0.012, kd);
      };
      const handset = SC.mkSprite(L, XW + 0.13, 1.3, RX, 0.1, 0.44, (ctx, P) => { ctx.scale(0.1, 0.44); handsetIcon(ctx, P); }, { sortDist: FD - 0.04 });
      // lifted, it is in your left hand, held up toward your ear, its cord running down out of the view to it; it goes off the
      // hook down to the hand, and back up to the hook from it (HANDSET_T), the hand going down out of the way first
      const HANDSET_T = 0.24;
      const handsetItem = { id: 'handset', name: 'Receiver', w: 0.1, h: 0.44, icon: handsetIcon, held: { grip: 'fist', at: [0, 0.48], axis: 0, angle: 0.55, size: 0.32, y: -0.03 } };
      L.offHand = () => (s.hook === 'off' && L.t - s.handsetT > HANDSET_T * 0.8 ? handsetItem : null);
      // off its hook it goes down out of the bottom of the view, toward you (to the hand that then comes up with it), and back
      // up from there: a point just under the view, below the hook, a little nearer than the hook
      const hookAt = L.pt(XW + 0.13, 1.3, RX);
      const underHook = () => {
        const c = G.cam, f = R.f, q = R.screenPos(hookAt[0], hookAt[1] + 0.22, hookAt[2]), xc = ((q ? q.x : R.W * 0.7) - R.W / 2) / f, yc = -(R.H * 1.3 - R.H / 2) / f;
        const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch), dy = yc * cp - sp, cz = yc * sp + cp, D = 0.5;
        return { x: (xc * cy + cz * sy) * D, y: L.eyeH + dy * D - 0.22, z: (-xc * sy + cz * cy) * D };
      };
      // the handset between the hook and your hand: null when it is on one or the other; true while it is still in the hand
      // going down (hung up, it goes back up to the hook once the hand is out of the way)
      const HANG_WAIT = 0.13;
      const handsetAway = () => {
        const up = s.hook === 'on', k = (L.t - s.handsetT - (up ? HANG_WAIT : 0)) / HANDSET_T;
        if (up && k < 0 && L.t >= s.handsetT) return true;
        if (k >= 1 || k < 0) return null;
        const e = up ? easeOut(k) : easeIn(k), hk = { x: hookAt[0], y: hookAt[1], z: hookAt[2] }, a = up ? underHook() : hk, b = up ? hk : underHook();
        const p = { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), z: lerp(a.z, b.z, e) }, tilt = (up ? 1 - e : e) * 0.35, sc = lerp(1, 0.8, up ? 1 - e : e);
        return SC.mkSprite(L, 0, 0, 0, 0.1, 0.44, (ctx, P) => { ctx.translate(0, 0.22); ctx.rotate(-tilt); ctx.scale(sc, sc); ctx.translate(0, -0.22); ctx.scale(0.1, 0.44); handsetIcon(ctx, P); }, { x: p.x, y: p.y, z: p.z, sortDist: Math.max(0.2, Math.hypot(p.x, p.z) * 0.8) });
      };
      // the empty cradle the handset hangs in, seen once it is lifted: a dark arm with a cup for each end, so what is left
      // to click (the hook) is a thing you can see, the shape of what was taken from it
      const cradle = SC.mkSprite(L, XW + 0.13, 1.3, RX, 0.1, 0.44, (ctx, P) => {
        ctx.scale(0.1, 0.44);
        const arm = P.col([22, 23, 27]), cup = P.col([34, 35, 40]), hole = P.col([6, 6, 8]), bolt = P.col([96, 98, 104]);
        P_rect(ctx, -0.16, 0.15, 0.32, 0.7, arm);
        for (const y of [0.86, 0.14]) { P_ell(ctx, 0, y, 0.42, 0.062, cup); P_ell(ctx, 0, y + (y > 0.5 ? 0.01 : -0.01), 0.3, 0.034, hole); }
        for (const y of [0.32, 0.68]) P_ell(ctx, 0, y, 0.055, 0.012, bolt);
      }, { sortDist: FD - 0.025 });
      // the display: dark while the receiver is on its hook; lifted, it lights and shows the credit (or what the line is
      // doing) over the number as it is dialled
      const lcdText = () => {
        if (s.hook !== 'off') return null;
        const top = s.line === 'dead' ? 'NOT IN SERVICE' : (s.line === 'checking' || s.line === 'connecting' || s.line === 'ringing') ? 'CALLING' : s.line === 'answered' ? 'CONNECTED' : 'CREDIT ' + (s.credit ? '10p' : '0p');
        const b = L.t - s.blinkAt, off = b >= 0 && b < 1.25 && Math.floor(b / 0.16) % 2 === 0;   // a press it will not take: the top line blinks at you
        return [off ? '' : top, fmt(s.dialed.slice(0, Math.max(0, s.dialed.length - s.lagN)))];
      };
      const lcd = SC.mkSprite(L, PX + 0.0015, LCD.y0, (LCD.u0 + LCD.u1) / 2, LCD.u1 - LCD.u0, LCD.y1 - LCD.y0, (ctx, P) => {
        const w = LCD.u1 - LCD.u0, h = LCD.y1 - LCD.y0, txt = lcdText();
        P_rect(ctx, -w / 2, 0, w, h, txt ? P.raw([140, 180, 124]) : P.col([38, 48, 40]));
        if (!txt) return;
        ctx.fillStyle = P.raw([20, 34, 22]); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.save(); ctx.translate(-w / 2 + 0.006, h - 0.016); ctx.scale(0.0006, -0.0006); ctx.font = 'bold 20px Arial, Helvetica, sans-serif'; ctx.fillText(txt[0], 0, 0); ctx.restore();
        ctx.save(); ctx.translate(-w / 2 + 0.006, 0.01); ctx.scale(0.00125, -0.00125); ctx.font = 'bold 20px "Courier New", "Liberation Mono", monospace'; ctx.fillText(txt[1], 0, 0); ctx.restore();
      }, { sortDist: FD - 0.016, noLight: true });
      // the front lip of the coin return, drawn over a coin lying in it
      const lip = SC.mkWallV(L, XW + 0.104, RET.u0 + 0.008, XW + 0.104, RET.u1 - 0.008, RET.y0 + 0.006, RET.y0 + 0.017, [150, 154, 162], { sortDist: FD - 0.035 });
      // the gamepad's highlight, round whatever it is on
      const hl = { kind: 'sprite', x: 0, y: 0, z: 0, w: 0.05, h: 0.05, noFog: true, noLight: true, sortDist: FD - 0.05, dist: FD, draw: (ctx) => {
        ctx.save(); ctx.strokeStyle = 'rgba(255,236,190,0.95)'; ctx.lineWidth = 0.0035; ctx.shadowColor = 'rgba(255,236,190,0.9)'; ctx.shadowBlur = 12;
        ctx.strokeRect(-hl.w / 2, 0, hl.w, hl.h); ctx.restore();
      } };
      L.dynamic = () => {
        sync();
        const away = handsetAway(), off = s.hook === 'off' || !!away;   // off its hook (or on its way back to it)
        const hy = off ? 1.695 : 1.645;   // the hook rises when the weight comes off it
        if (off) R.add(cradle);
        R.add(SC.mkQuad(L, [XW + 0.088, hy, 0.13], [XW + 0.088, hy, 0.16], [XW + 0.088, hy + 0.018, 0.16], [XW + 0.088, hy + 0.018, 0.13], [150, 154, 160], { sortDist: FD - 0.03 }));
        R.add(SC.mkQuad(L, [XW + 0.088, hy - 0.01, 0.16], [XW + 0.088, hy - 0.01, 0.168], [XW + 0.088, hy + 0.018, 0.168], [XW + 0.088, hy + 0.018, 0.16], [120, 124, 130], { sortDist: FD - 0.031 }));
        if (!off) R.add(handset);
        if (away && away !== true) R.add(away);
        for (const c of off ? cords.off : cords.on) R.add(c);
        for (const p of s.bookA > 0.002 ? coverParts(s.bookA) : cover0) R.add(p);   // the phone book's cover (lifted a crack, or shut)
        for (const k of keys) R.add(k.spr);
        R.add(lcd); R.add(lip);
        if (closeUp() && s.padSel) {
          const c = s.padSel, f = front(c.u, c.y - c.h / 2 - 0.003, c.w + 0.01, c.h + 0.006, 0.13), p = L.pt(f.x, f.y, f.z);
          Object.assign(hl, { x: p[0], y: p[1], z: p[2], w: f.w, h: f.h });
          R.add(hl);
        }
        // rain on the outside of the glass: thin runs, each sliding down at its own pace with a bead of water at its foot
        for (const d of drops) {
          const x = d.x0 + (d.x1 - d.x0) * d.u + d.nx * 0.012, z = d.z0 + (d.z1 - d.z0) * d.u + d.nz * 0.012;
          const y = 2.02 - ((L.t * d.v + d.ph) % 1.7);
          if (y < 0.3) continue;
          const at = (a, dy) => [x + d.nz * a, y + dy, z + d.nx * a];   // a along the pane, dy up it
          R.add({ kind: 'poly', pts: [at(-0.0008, d.len), at(0.0008, d.len), at(0.0009, 0.006), at(0.0026, 0.0032), at(0, 0), at(-0.0026, 0.0032), at(-0.0009, 0.006)].map(p => L.pt(p[0], p[1], p[2])), color: [196, 208, 228], alpha: 0.3, noFog: true, noLight: true });
        }
        if (s.end && s.end.pose) for (const p of carParts()) R.add(p);
      };

      // ---------------- the car that comes for you ----------------
      // Once someone has picked up, a car comes fast down his street, passing him, and pulls up hard at the kerb by the booth
      // with its back door to you: down the main street in its left-hand lane, left round the corner and across to the kerb
      // a few steps east of the booth (so the door that opens is its right-hand one), or along the cross street from the east.
      // Either way it stands where it is seen whole through the east pane, door and all, and not right outside the glass
      // (where the eye would only look down on its roof) or along the pavement to the west (behind the pay phone). It sounds
      // its horn and the back door swings open on a lit inside, with someone at the wheel. If he is standing in its way it
      // stops short of him, its lights on him. It is built each frame from boxes in its own frame: a along it (forward), b
      // across it (to its left, or for the car that came round the corner, mirrored, to its right: toward the kerb either
      // way), y up from the road.
      const CAR = { col: [150, 140, 112], V: 20, BRAKE: 20, T0: 0.3, FROM: 50 };
      const carPath = (laneN, stopX) => {
        const pts = [];
        const line = (x0, z0, x1, z1) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.2)); for (let i = pts.length ? 1 : 0; i <= n; i++) pts.push([lerp(x0, x1, i / n), lerp(z0, z1, i / n)]); };
        if (laneN) {
          const r = 3.2, cx = 1.75 + r, cz = 2.15 + r, n = Math.ceil(r * Math.PI / 2 / 0.2);
          line(1.75, CAR.FROM, 1.75, cz);
          for (let i = 1; i <= n; i++) { const a = Math.PI + Math.PI / 2 * i / n; pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
          line(cx, 2.15, Math.max(stopX, cx + 0.4), 2.15);
        } else line(CAR.FROM, 2.15, stopX, 2.15);
        const sAt = [0];
        for (let i = 1; i < pts.length; i++) sAt.push(sAt[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        return { pts, sAt, len: sAt[sAt.length - 1], m: laneN };
      };
      const poseAt = (path, sv) => {
        let i = 1;
        while (i < path.pts.length - 1 && path.sAt[i] < sv) i++;
        const a = path.pts[i - 1], b = path.pts[i], k = clamp((sv - path.sAt[i - 1]) / Math.max(1e-6, path.sAt[i] - path.sAt[i - 1]), 0, 1);
        const fx = b[0] - a[0], fz = b[1] - a[1], fl = Math.hypot(fx, fz) || 1;
        return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), fx: fx / fl, fz: fz / fl, m: path.m };
      };
      // a point in the car's frame, in the night's (b mirrored for the car that pulls up with its right side to the kerb)
      const carPt = (P, a, b, y) => { if (P.m) b = -b; return [P.x + a * P.fx - b * P.fz, ROAD + y, P.z + a * P.fz + b * P.fx]; };
      // where along its path it has to stop: the end, or short of him if its front would come within reach of him
      const stopShort = (path, him) => {
        for (let sv = 0; sv <= path.len; sv += 0.2) {
          const P = poseAt(path, sv), l = carPt(P, 2.25, 0.9, 0), r = carPt(P, 2.25, -0.9, 0);
          const ex = r[0] - l[0], ez = r[2] - l[2], k = clamp(((him.x - l[0]) * ex + (him.z - l[2]) * ez) / (ex * ex + ez * ez), 0, 1);
          if (Math.hypot(him.x - (l[0] + ex * k), him.z - (l[2] + ez * k)) < 0.7) return Math.max(0, sv - 0.4);
        }
        return path.len;
      };
      // the car, built for where it is this frame: a low body with chrome bumpers and a strip along each side, a cabin that
      // narrows to a dark vinyl roof with the glass sloping in all round, and the wheels. Each part is closed, so a face
      // turned from the eye is simply left out; what lies on a face (a lamp, a window, a seam) is drawn just after it.
      const carParts = () => {
        const e = s.end, P = e.pose, out = [], col = CAR.col, eye = [0, L.eyeH, 0];
        const W = (a, b, y) => { const p = carPt(P, a, b, y); return L.pt(p[0], p[1], p[2]); };
        const meanD = pts => pts.reduce((acc, v) => acc + Math.hypot(v[0], v[2]), 0) / pts.length;
        const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
        const avg = pts => [0, 1, 2].map(j => pts.reduce((acc, v) => acc + v[j], 0) / pts.length);
        // a closed part from its faces (in the car's frame, [a, b, y] corners): the faces that look at the eye, shaded as
        // SC.box shades (lighter on top, darker at the ends than along the sides); opts.early draws them that much earlier
        const part = (faces, c0, opts) => {
          const fw = faces.map(f => f.map(q => W(q[0], q[1], q[2]))), mid = avg(fw.flat()), res = [];
          for (const pts of fw) {
            const u = sub(pts[1], pts[0]), v = sub(pts[2], pts[0]);
            let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
            const fc = avg(pts);
            if (dot(n, sub(fc, mid)) < 0) n = n.map(x => -x);
            if (dot(n, sub(eye, fc)) <= 1e-7) { res.push(null); continue; }
            const nl = Math.hypot(n[0], n[1], n[2]) || 1, along = Math.abs(n[0] * P.fx + n[2] * P.fz) / nl;
            const k = n[1] / nl > 0.6 ? 1.08 : along > 0.7 ? 0.66 : 0.78;
            const r = Object.assign({ kind: 'poly', pts, color: scalec(c0, k) }, opts || {});
            if (r.early) r.sortDist = meanD(pts) + r.early;
            out.push(r); res.push(r);
          }
          return res;
        };
        const box = (a0, a1, b0, b1, y0, y1, c0, opts) => part([
          [[a0, b0, y0], [a0, b1, y0], [a0, b1, y1], [a0, b0, y1]], [[a1, b0, y0], [a1, b1, y0], [a1, b1, y1], [a1, b0, y1]],
          [[a0, b0, y0], [a1, b0, y0], [a1, b0, y1], [a0, b0, y1]], [[a0, b1, y0], [a1, b1, y0], [a1, b1, y1], [a0, b1, y1]],
          [[a0, b0, y1], [a1, b0, y1], [a1, b1, y1], [a0, b1, y1]],
        ], c0, opts);   // back, front, right, left, top
        const on = (f, pts, cl, opts, d) => { if (!f) return null; const r = Object.assign({ kind: 'poly', pts: pts.map(q => W(q[0], q[1], q[2])), color: cl, sortDist: meanD(f.pts) - (d || 0.004) }, opts || {}); out.push(r); return r; };   // (d: how soon after the face)
        const lit = e.doorT !== undefined, bright = { noLight: true, noFog: true };   // the light inside is on once the door is open
        const glassC = lit ? [128, 98, 64] : [22, 26, 32], glassO = lit ? bright : {};
        for (const a0 of [-1.73, 1.11]) for (const b of [-1, 1]) {   // the wheels: under the body, so with no top to them
          const a1 = a0 + 0.62, b0 = b > 0 ? 0.6 : -0.905, b1 = b > 0 ? 0.905 : -0.6;
          part([[[a0, b0, 0], [a0, b1, 0], [a0, b1, 0.56], [a0, b0, 0.56]], [[a1, b0, 0], [a1, b1, 0], [a1, b1, 0.56], [a1, b0, 0.56]], [[a0, b0, 0], [a1, b0, 0], [a1, b0, 0.56], [a0, b0, 0.56]], [[a0, b1, 0], [a1, b1, 0], [a1, b1, 0.56], [a0, b1, 0.56]]], [18, 18, 20], { early: 3 });   // drawn before the body, which hides all but their feet
        }
        const body = box(-2.2, 2.2, -0.9, 0.9, 0.3, 0.78, col);
        if (body[4]) body[4].sortDist = meanD(body[4].pts) + 0.2;   // its top is under the cabin: drawn before it from anywhere
        for (const s0 of [-1, 1]) box(s0 > 0 ? 2.2 : -2.27, s0 > 0 ? 2.27 : -2.2, -0.88, 0.88, 0.3, 0.42, [168, 170, 176]);   // the bumpers
        // the cabin: its foot along the body, its roof narrower and shorter, so the glass slopes in on every side
        const A0 = -1.35, A1 = 0.9, BB = 0.84, YB = 0.78, T0 = -1.05, T1 = 0.42, BT = 0.72, YT = 1.3;
        const cab = part([
          [[A0, -BB, YB], [A0, BB, YB], [T0, BT, YT], [T0, -BT, YT]], [[A1, -BB, YB], [A1, BB, YB], [T1, BT, YT], [T1, -BT, YT]],
          [[A0, -BB, YB], [A1, -BB, YB], [T1, -BT, YT], [T0, -BT, YT]], [[A0, BB, YB], [A1, BB, YB], [T1, BT, YT], [T0, BT, YT]],
          [[T0, -BT, YT], [T1, -BT, YT], [T1, BT, YT], [T0, BT, YT]],
        ], col);
        if (cab[4]) cab[4].color = [70, 64, 58];   // a dark vinyl roof
        // a point on a side of the cabin, k of the way along it (back to front) and h of the way up
        const cs = (sd, k, h) => [lerp(lerp(A0, A1, k), lerp(T0, T1, k), h), sd * lerp(BB, BT, h) + sd * 0.001, lerp(YB, YT, h)];
        for (const [f, sd] of [[cab[3], 1], [cab[2], -1]]) {
          on(f, [cs(sd, 0.06, 0.1), cs(sd, 0.47, 0.1), cs(sd, 0.47, 0.9), cs(sd, 0.08, 0.9)], glassC, glassO);   // the back side window
          on(f, [cs(sd, 0.52, 0.1), cs(sd, 0.95, 0.1), cs(sd, 0.9, 0.9), cs(sd, 0.52, 0.9)], glassC, glassO);    // the front one
        }
        const ce = (a0, a1, sd, h) => [lerp(a0, a1, h), sd * lerp(BB, BT, h) * 0.9, lerp(YB, YT, h)];   // a point on its sloping front or back
        on(cab[1], [ce(A1 + 0.002, T1 + 0.002, -1, 0.08), ce(A1 + 0.002, T1 + 0.002, 1, 0.08), ce(A1 + 0.002, T1 + 0.002, 1, 0.92), ce(A1 + 0.002, T1 + 0.002, -1, 0.92)], glassC, glassO);   // the windscreen
        on(cab[0], [ce(A0 - 0.002, T0 - 0.002, -1, 0.1), ce(A0 - 0.002, T0 - 0.002, 1, 0.1), ce(A0 - 0.002, T0 - 0.002, 1, 0.9), ce(A0 - 0.002, T0 - 0.002, -1, 0.9)], glassC, glassO);   // the back window
        // someone at the wheel, on the right: a shape against the light inside, seen through the near side's front window
        if (lit) on(cab[3], [cs(1, 0.66, 0.12), cs(1, 0.84, 0.12), cs(1, 0.83, 0.62), cs(1, 0.79, 0.78), cs(1, 0.72, 0.8), cs(1, 0.67, 0.64)], [14, 12, 12], bright, 0.006);
        // on the body: the lamps, the grille, the chrome strip along each side, the seams of the doors and their handles
        const lamp = [255, 246, 214], red = [210, 34, 26];
        for (const b of [-1, 1]) {
          on(body[1], [[2.201, b * 0.54, 0.5], [2.201, b * 0.82, 0.5], [2.201, b * 0.82, 0.66], [2.201, b * 0.54, 0.66]], lamp, bright);
          on(body[0], [[-2.201, b * 0.56, 0.5], [-2.201, b * 0.84, 0.5], [-2.201, b * 0.84, 0.64], [-2.201, b * 0.56, 0.64]], red, bright);
          const f = b > 0 ? body[3] : body[2], bb = b * 0.902;
          on(f, [[1.98, bb, 0.52], [2.18, bb, 0.52], [2.18, bb, 0.64], [1.98, bb, 0.64]], [255, 200, 120], bright);   // the lamps round the corners
          on(f, [[-2.18, bb, 0.52], [-1.98, bb, 0.52], [-1.98, bb, 0.64], [-2.18, bb, 0.64]], red, bright);
          on(f, [[-2.16, bb, 0.6], [2.16, bb, 0.6], [2.16, bb, 0.625], [-2.16, bb, 0.625]], [176, 178, 184]);
          for (const a of [0.92, -0.1, -1.12]) on(f, [[a - 0.008, bb, 0.33], [a + 0.008, bb, 0.33], [a + 0.008, bb, 0.77], [a - 0.008, bb, 0.77]], scalec(col, 0.45));
          for (const a of [0.12, -0.9]) on(f, [[a, bb, 0.66], [a + 0.13, bb, 0.66], [a + 0.13, bb, 0.69], [a, bb, 0.69]], [176, 178, 184]);
        }
        on(body[1], [[2.201, -0.44, 0.47], [2.201, 0.44, 0.47], [2.201, 0.44, 0.66], [2.201, -0.44, 0.66]], [30, 30, 32]);   // the grille
        // the back door on the kerb side (its left), hinged at its front edge: open, it stands out toward the booth over a lit
        // doorway with the back seat in it
        const th = e.doorT === undefined ? 0 : 65 * DEG * smoothstep((L.aftermathT - e.doorT) / 0.7);
        if (th > 0.01) {
          on(body[3], [[-1.11, 0.903, 0.31], [-0.11, 0.903, 0.31], [-0.11, 0.903, 0.78], [-1.11, 0.903, 0.78]], [150, 112, 72], bright, 0.006);
          on(body[3], [[-1.0, 0.904, 0.4], [-0.2, 0.904, 0.4], [-0.24, 0.904, 0.76], [-0.96, 0.904, 0.76]], [80, 58, 42], bright, 0.008);   // the seat
          on(cab[3], [cs(1, 0.04, 0.0), cs(1, 0.49, 0.0), cs(1, 0.49, 0.92), cs(1, 0.06, 0.92)], [140, 106, 70], bright, 0.007);
          const ca = Math.cos(th), sa = Math.sin(th);
          const D = (k, y) => W(-0.11 - ca * k, 0.9 + sa * k, y);    // a point k along the open door from its hinge
          const n0 = carPt(P, 0, 0, 0), n1 = carPt(P, sa, ca, 0), n = [n1[0] - n0[0], n1[2] - n0[2]];   // its outer face's normal: out from the car's side, turned forward as it opens
          const mid = D(0.5, 0.55), outer = (eye[0] - mid[0]) * n[0] + (eye[2] - mid[2]) * n[1] > 0;
          out.push({ kind: 'poly', pts: [D(0, 0.3), D(1.0, 0.3), D(1.0, 0.78), D(0, 0.78)], color: outer ? scalec(col, 0.8) : [104, 88, 70] });
          out.push({ kind: 'poly', pts: [D(0.02, 0.78), D(0.98, 0.78), D(0.74, 1.26), D(0.02, 1.26)], color: [150, 172, 198], alpha: 0.16, noLight: true });   // its window
          out.push({ kind: 'poly', pts: [D(0.74, 1.24), D(0.98, 0.78), D(1.0, 0.78), D(0.76, 1.27)], color: scalec(col, 0.7) });   // and the frame round it
          if (outer) out.push({ kind: 'poly', pts: [D(0.78, 0.66), D(0.91, 0.66), D(0.91, 0.69), D(0.78, 0.69)], color: [176, 178, 184] });
        }
        // the beams through the rain, and, while its lamps are toward you, their glare on the wet road, which stops at the kerb
        const facing = -carPt(P, 2.2, 0, 0)[0] * P.fx - carPt(P, 2.2, 0, 0)[2] * P.fz > 0;
        for (const b of [-0.69, 0.69]) {
          const beam = [W(2.25, b - 0.1, 0.6), W(2.25, b + 0.1, 0.6), W(15, b * 2.6 + 1.6, 0.04), W(15, b * 2.6 - 1.6, 0.04)];
          out.push({ kind: 'poly', pts: beam, color: [255, 242, 210], alpha: 0.05, noLight: true, noFog: true });
          if (!facing) continue;
          const foot = W(2.4, b, 0.006), fd = Math.hypot(foot[0], foot[2]) || 1, qx = -foot[2] / fd, qz = foot[0] / fd;
          const tEnd = Math.max(0.5, 1.15 / Math.max(0.01, Math.abs(foot[2])));
          for (let k = 0; k < 4; k++) {
            const t0 = lerp(1, tEnd, k / 4), t1 = lerp(1, tEnd, (k + 1) / 4), w0 = 0.16 - k * 0.03, w1 = 0.13 - k * 0.03;
            if (t1 >= t0) break;
            out.push({ kind: 'poly', pts: [[foot[0] * t0 + qx * w0, ROAD + 0.006, foot[2] * t0 + qz * w0], [foot[0] * t0 - qx * w0, ROAD + 0.006, foot[2] * t0 - qz * w0], [foot[0] * t1 - qx * w1, ROAD + 0.006, foot[2] * t1 - qz * w1], [foot[0] * t1 + qx * w1, ROAD + 0.006, foot[2] * t1 + qz * w1]], color: [255, 236, 200], alpha: 0.16 * (1 - k / 4), noLight: true, layer: 0, sortDist: 0.4 });
          }
        }
        // it comes out of the rain at the far end of the street rather than appearing there
        const fade = clamp((L.aftermathT - CAR.T0) / 0.6, 0, 1);
        if (fade < 1) for (const p of out) p.alpha = (p.alpha === undefined ? 1 : p.alpha) * fade;
        return out;
      };
      const carLamps = () => {   // the headlamps (and the light inside, once the door is open), for the lights and the glows
        const e = s.end; if (!e || !e.pose) return null;
        const P = e.pose, W = (a, b, y) => { const p = carPt(P, a, b, y); return L.pt(p[0], p[1], p[2]); };
        const front = W(2.2, 0, 0.6), facing = (0 - front[0]) * P.fx + (0 - front[2]) * P.fz > 0;   // is its front toward you?
        return { P, heads: [W(2.25, -0.69, 0.58), W(2.25, 0.69, 0.58)], front, facing, inside: e.doorT !== undefined ? W(-0.5, 0.2, 1.15) : null };
      };
      // the watch after the call: on him, then round to take in the car at the kerb as well
      L.watchPoint = () => {
        const e = s.end; if (!e) return null;
        const c = sm(), cp = c.pos(), hy = Math.atan2(cp.x, cp.z), hd = Math.hypot(cp.x, cp.z);
        const hp = Math.atan2(L.eyeH - (cp.y + c.CR.h * 0.6), hd);
        const t = L.aftermathT, w = lerp(e.w1 * smoothstep((t - (e.tStop - 1.0)) / 1.6), e.w2, smoothstep((t - (e.tStop + 1.3)) / 1.2));
        const yaw = hy + wrapPi(e.doorYaw - hy) * w, pitch = lerp(hp, e.doorPitch, w * 0.6);
        return { x: Math.sin(yaw) * 6, y: L.eyeH - 6 * Math.tan(pitch), z: Math.cos(yaw) * 6 };
      };
      // the aftermath: he comes on (quickly, if he is still far off) and stops dead in the street; the car comes, passes him,
      // pulls up, sounds its horn and opens its door; he turns round and walks back the way he came
      const STOP_D = 12;
      L.aftermath = t => {
        const c = sm();
        if (!s.end) {
          const D = c.dist, laneN = c.lane.deg === 0, e = s.end = {};
          if (D > STOP_D) {
            const v = clamp((D - STOP_D) / 2.2, 2, 5);
            e.hurryEnd = t + Math.min(2.6, (D - STOP_D) / v); e.dFin = Math.max(STOP_D, D - v * (e.hurryEnd - t));
            c.hold = null; c.distFn = (cr, dt2) => Math.max(e.dFin, cr.dist - dt2 * v);
          } else { e.hurryEnd = t; e.dFin = D; c.hold = D; }
          const him = APPROACH.position(c.lane, e.dFin, 0, L.eyeH);
          // it draws up at the kerb east of the booth: just past the corner, coming round from the main street; short of the
          // booth, coming along the cross street (and short of him, so its door does not open into him)
          e.path = carPath(laneN, laneN ? 6.4 : Math.min(4.0, him.x - 2.6));
          e.S = stopShort(e.path, him);
          e.B = Math.min(CAR.BRAKE, e.S); e.tc = (e.S - e.B) / CAR.V; e.Tb = 2 * e.B / CAR.V;
          e.tStop = CAR.T0 + e.tc + e.Tb;
          const fin = poseAt(e.path, e.S), door = carPt(fin, -0.6, 0.9, 0.75);
          e.doorYaw = Math.atan2(door[0], door[2]); e.doorPitch = Math.atan2(L.eyeH - door[1], Math.hypot(door[0], door[2]));
          // the view takes in both the car's open door and him if they are near enough together; if not it goes to the door
          // as it opens, and back to him as he turns away
          const sep = Math.abs(wrapPi(e.doorYaw - Math.atan2(him.x, him.z)));
          e.w1 = sep < 50 * DEG ? 0.5 : 0.95; e.w2 = sep < 50 * DEG ? 0.5 : 0.15;
          // he turns round once the view is back on him (it is there all along when it holds both), and the night ends a
          // couple of seconds into his walk away
          e.turnAt = e.tStop + (sep < 50 * DEG ? 1.4 : 2.6); e.done = e.turnAt + 2.2;
        }
        const e = s.end;
        const once = (k, at, fn) => { if (!e[k] && t >= at) { e[k] = true; fn(); } };
        const pan = p => Math.sin(wrapPi(Math.atan2(p.x, p.z) - G.cam.yaw)) * 0.85;
        if (c.distFn && !c.away && t >= e.hurryEnd) { c.distFn = null; c.hold = c.dist; }   // he stops dead where he is
        const tau = t - CAR.T0;
        if (tau >= 0) {
          const sv = tau < e.tc ? CAR.V * tau : e.S - e.B * Math.pow(Math.max(0, 1 - (tau - e.tc) / e.Tb), 2);
          e.pose = poseAt(e.path, Math.min(sv, e.S));
        }
        once('come', CAR.T0 - 0.2, () => AUDIO.sfx('carCome', pan({ x: e.path.pts[0][0], z: e.path.pts[0][1] })));
        once('brake', CAR.T0 + e.tc, () => AUDIO.sfx('brake', pan(e.pose)));
        once('idle', e.tStop, () => AUDIO.setLoop('engine', 0.1, pan(e.pose)));
        once('horn', e.tStop + 0.2, () => AUDIO.sfx('horn', pan(e.pose)));
        once('door', e.tStop + 0.6, () => { AUDIO.sfx('carDoor', pan(e.pose)); e.doorT = t; });
        once('turn', e.turnAt, () => { c.hold = null; c.away = true; c.frozen = true; c.distFn = (cr, dt2) => cr.dist + dt2 * 1.3; });
        return t >= e.done;
      };
      // his lantern: a warm light that walks with him, and its glow; the car's headlamps, and the light inside it
      const lanternAt = () => { const c = sm(), p = c.pos(), sd = c.away ? -0.46 : 0.46; return { x: p.x + Math.cos(c.yaw) * sd, y: p.y + 0.75, z: p.z - Math.sin(c.yaw) * sd }; };
      L.dynamicLights = () => {
        const p = lanternAt(), out = [{ x: p.x, y: p.y, z: p.z, r: 4.5, i: 0.6, color: [255, 190, 110], flicker: 0.3, seed: 5, cone: { x: 0, y: -1, z: 0, cos: Math.cos(75 * DEG) } }];
        const k = carLamps();
        if (k) {
          const n = Math.hypot(k.P.fx, 0.06, k.P.fz);
          out.push({ x: k.front[0], y: k.front[1], z: k.front[2], r: 24, i: 0.6, color: [235, 228, 200], cone: { x: k.P.fx / n, y: -0.06 / n, z: k.P.fz / n, cos: Math.cos(22 * DEG) } });
          if (k.inside) out.push({ x: k.inside[0], y: k.inside[1], z: k.inside[2], r: 2.6, i: 0.6, color: [255, 196, 120] });
        }
        return out;
      };
      // a street lamp's halo is drawn over everything, so one behind him (inside his outline as seen from the booth) is left out
      const behindHim = g => {
        const c = L.creatures[0]; if (!c || c.dead) return false;
        const cp = c.pos(), cd = Math.hypot(cp.x, cp.z), gd = Math.hypot(g.x, g.z);
        if (gd <= cd) return false;
        const da = Math.abs(wrapPi(Math.atan2(g.x, g.z) - Math.atan2(cp.x, cp.z)));
        if (da > (c.CR.w * 0.5) / Math.max(0.5, cd) + g.r / gd) return false;
        const ty = (g.y - L.eyeH) / gd, top = (cp.y + (c.yOff || 0) + c.CR.h - L.eyeH) / cd, bot = (cp.y + (c.yOff || 0) - L.eyeH) / cd;
        return ty < top + g.r / gd && ty > bot - g.r / gd;
      };
      // and so is one along the pavement to the west that the eye sees through the pay phone's plate on that wall
      const behindPhone = g => {
        if (g.x >= XW) return false;
        const k = XW / g.x, u = g.z * k, y = L.eyeH + (g.y - L.eyeH) * k;
        return u > -0.25 && u < 0.26 && y > 0.98 && y < 2.02;
      };
      L.glows = () => {
        const p = lanternAt(), out = lampGlows.filter(g => !behindHim(g) && !behindPhone(g)).concat([{ x: p.x, y: p.y, z: p.z, r: 1.5, color: [255, 190, 110], a: 0.42 }]);
        const k = carLamps();
        if (k) {
          const fade = clamp((L.aftermathT - CAR.T0) / 0.6, 0, 1);
          for (const h of k.heads) out.push({ x: h[0], y: h[1], z: h[2], r: k.facing ? 1.1 : 0.5, color: [255, 240, 206], a: (k.facing ? 0.75 : 0.3) * fade });
          if (k.inside) out.push({ x: k.inside[0], y: k.inside[1], z: k.inside[2], r: 0.7, color: [255, 200, 130], a: 0.22 });
        }
        return out;
      };
      L.floor = { poly: [[XW + 0.08, -B + 0.07], [B - 0.07, -B + 0.07], [B - 0.07, B - 0.07], [XW + 0.08, B - 0.07]], y: 0.03 };
    },
  });
})();
