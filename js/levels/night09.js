'use strict';
// ============================================================ 9. THE PHONE BOOTH ============================================================
// A phone booth on a corner, at night, in the rain, with glass all round. Something is coming toward it from a long way
// off, up the main street or along the far pavement of the cross street from the east: a shade, far too tall and far too
// thin, all one dark (js/creatures/signalman.js), with no light of its own and nothing of it to be seen most of the time
// but the two pale points of its eyes. The street lamps stand along its way, on the sides of both streets nearer the
// booth's corner, and it goes from one to the next, every one of them, starting at the very last, the furthest down its
// street: it stands behind a lamp, peering round the post, a few seconds, lit by it (though in that light there is still no face, only the two points of its eyes),
// then reaches up, its arm unspooling far too far, and breaks it (a pop, glass, sparks, and it is out for good), and in the
// dark it skitters on, low and fast, to the next one nearer the booth, waits, breaks that, and so on until the last; then it
// comes across to the glass. The pay phone is a slim unit on a narrow backboard across the corner of the booth between the
// two streets, the glass clear either side of it, so while you use it both streets are at the edges of the view and you
// see it coming out of the corner of your eye. On the corner shelf under the phone lies your notebook, and somewhere in it, among the shopping and the dentist, is
// the number to ring, on a page of its own, scrawled large and fast in something red that has run. It is a pay phone: lift
// the receiver, put a coin in (there is one lying about in the booth) and dial on its own keys; it rings for seven seconds
// while it keeps coming, and then someone picks up and a car comes for you. Every other number in the notebook belongs to
// someone ordinary and is not in service, and hanging up gives the coin back, into the coin return.
// The notebook is read where it lies, in the world, with nothing done to the view: clicked, its cover flips back over the
// spiral and stands against the backboard behind it; each click after that lifts the page by its corner and turns it back over
// the spiral, and a click on the last page shuts it. You look down at it as at anything else, and zoom in (Shift, Z or Space)
// to read it. Its pages are drawn once into canvases and laid on it, strip by strip, in perspective. The phone is looked at
// as anything else too, a little smaller than life, its keys clicked where they are drawn (or with the zoom held); the
// number keys dial while you face it, and a gamepad's d-pad moves a highlight over the phone (L.padDir, L.padUse).
// It is done with your hands (js/hands.js): the lifted receiver is in your right hand (L.offHand; the hook is on the
// phone's right, and its cord runs down that side, clear of the notebook), the coin in your left (L.handSide), whose fingertip
// presses the keys (G.reach, going from key to key, in turn when they are pressed faster than it can go) and turns the
// notebook's pages, and what will not work shows on the phone itself: a key pressed for nothing clicks and the display
// blinks at you, a coin put in on the hook goes into the slot and drops through into the coin return, the empty return is
// felt with the fingers.
// And there is 911 (free, coin or none): a dispatcher answers (the night's easter egg, found: foundEgg), with four lines
// while the shade has still to get to its last lamp ("911, what is your emergency?", "Could you describe this creature,
// please?", "I see.", "Ok, stay there. I'm sending a unit now."), a beat of quiet after each for what you say back, and
// only the last of them once it has (cutting to it if it gets there while she is talking), and a police car is sent,
// though it is not seen until the shade has got to the last lamp on its way in. Then it comes tearing down that street, siren wailing and its light bar
// going, screeches to a halt by that lamp post, shuts off its siren and shines a flashlight out of its window at it. In
// that light the shade convulses for a second from the instant it is on it, with a shriek, and then
// jumps out in front of the post at it, its head split open into its petals of teeth and its tentacles out, with a snarl;
// the flashlight goes off and
// the police car spins its tyres, squealing, and fishtails off down the road and away; the shade shuts its head, skitters
// back behind its lamp post and stands there, hidden, for COP.hide seconds (time enough to hang up, dial the right number
// and have it answered), and then comes on for you as before
// (copBegin, copSetOff, copRun, copMan, below the car). The police come once a night; caught after calling them, it is
// "The police can't help you here."
// What is printed on the phone (its keys, its card, its display, the coin's figure) is put down as a picture of the words,
// not with fillText: the canvas sets each line of text on a whole pixel, so words drawn straight onto a key that moves by
// less than one (the view's slow sway with the zoom held, a slow turn) hop a pixel against it now and then and seem to
// shake on it. A picture goes down where it falls, to a fraction of a pixel, and moves with the key as one with it.
// inkText draws text just as fillText would (the context's font, textAlign, textBaseline and fill colour), from a picture
// of it made once for each text, font and size: at about as many pixels to its unit as the view gives it now (a power of
// two of them, so that zooming makes a new one only now and then, and it is never shown more than twice its size or
// less than half of it), lettered again only when its colour changes (the booth's light flickers).
const INKED = new Map();
function inkText(ctx, text, x, y) {
  text = String(text);
  const font = ctx.font, align = ctx.textAlign, base = ctx.textBaseline, col = ctx.fillStyle;
  const m = ctx.getTransform ? ctx.getTransform() : null, px = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1;   // (pixels to the unit, here)
  const lv = Math.pow(2, clamp(Math.ceil(Math.log2(px || 1)), -4, 5)), key = text + '|' + font + '|' + align + '|' + base + '|' + lv;
  let e = INKED.get(key);
  if (!e) {
    if (INKED.size > 400) INKED.clear();   // (what the display shows comes and goes)
    const cv = document.createElement('canvas'), g = cv.getContext('2d'), f = font.replace(/([\d.]+)px/, (_, n) => (n * lv) + 'px');
    g.font = f; g.textAlign = align; g.textBaseline = base;
    const mt = g.measureText(text), pad = 2;
    const l = Math.ceil(mt.actualBoundingBoxLeft) + pad, a = Math.ceil(mt.actualBoundingBoxAscent) + pad;
    cv.width = Math.max(1, l + Math.ceil(mt.actualBoundingBoxRight) + pad); cv.height = Math.max(1, a + Math.ceil(mt.actualBoundingBoxDescent) + pad);
    e = { cv, g, f, l, a, col: null }; INKED.set(key, e);
  }
  if (e.col !== col) {
    const g = e.g; g.clearRect(0, 0, e.cv.width, e.cv.height);
    g.font = e.f; g.textAlign = align; g.textBaseline = base; g.fillStyle = col; g.fillText(text, e.l, e.a); e.col = col;
  }
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(e.cv, x - e.l / lv, y - e.a / lv, e.cv.width / lv, e.cv.height / lv);
  ctx.restore();
}
Object.assign(ICONS, {
  // a small battered notebook, spiral at the top, held shut with an elastic band (as it is carried in the void, night 13)
  notebook(ctx, P) {
    const cover = P.col([96, 44, 36]), coverD = P.col([62, 28, 24]), paper = P.col([226, 216, 190]), ring = P.col([168, 168, 174]), band = P.col([26, 22, 20]), label = P.col([206, 194, 160]);
    ctx.save(); ctx.translate(0, 0.5); ctx.rotate(-0.1); ctx.translate(0, -0.5);
    P_rect(ctx, -0.3, 0.1, 0.62, 0.76, coverD);                  // the back board, a little bigger
    P_rect(ctx, -0.31, 0.12, 0.6, 0.73, paper);                  // the edges of the pages
    P_rect(ctx, -0.34, 0.1, 0.62, 0.74, cover);                  // the front cover
    P_rect(ctx, -0.34, 0.1, 0.62, 0.05, coverD);
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
    ctx.font = 'bold 22px Georgia, "Liberation Serif", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = ink; inkText(ctx, '10', 0, 0);
    ctx.restore();
    P_line(ctx, -0.24, 0.79, 0.12, 0.84, 0.035, shine);            // the light along its top
    // lying about, it catches the light now and then: a glint at its edge (still in the hand, where the time is nought)
    const g = Math.pow(Math.max(0, Math.sin((P.t || 0) * 2.3)), 12);
    if (g > 0.02) { ctx.globalAlpha = g; P_line(ctx, 0.24, 0.6, 0.24, 1.02, 0.04, P.raw([255, 252, 236])); P_line(ctx, 0.04, 0.81, 0.44, 0.81, 0.04, P.raw([255, 252, 236])); P_ell(ctx, 0.24, 0.81, 0.06, 0.06, P.raw([255, 255, 248])); ctx.globalAlpha = 1; }
  },
});
(() => {
  const XW = -0.7;             // the west wall is this far from the eye
  const B = 0.7;               // and the glass on the other three sides (the door to the north, east, and the back) this far
  const PHONE_DIR = 1;         // facing the phone is facing north-east, into the corner between the two streets
  const ROAD = -0.12;          // the road is a kerb's height below the pavement the booth stands on
  // The pay phone is a slim unit on a narrow backboard standing off the north-east corner post (on short arms, hidden
  // behind it), square to the line from the eye into the corner, so that the glass either side of it is clear: both streets
  // are seen past it. A point on it is given by u across the board (to your right as you face it), y up, and d out from it
  // toward you (at3). The phone itself is a size smaller than life: its parts are given at full size, and come in to PK of
  // that about the middle of its keys (ph), which is PY1 high. PW: how far either way the glass is from the middle of the
  // board, along its line; BW: the board's own half width
  const SQ = Math.SQRT1_2, PW = 0.2, WD = B / SQ - PW - 0.004, BW = 0.078;   // how far the board is from the eye
  const at3 = (u, y, d) => [SQ * (WD - d + u), y, SQ * (WD - d - u)];
  const PK = 0.8, PY = 1.52, PY1 = 1.6;
  const ph = (u, y, d) => at3(u * PK, PY1 + (y - PY) * PK, d * PK);
  const FD = WD - 0.1 * PK;    // how far the face of the phone's housing is from the eye
  // the notebook, lying on the little shelf under the phone: a reporter's pad, its spiral along the end toward the board (d
  // along the shelf out from the board, u across it to your right), a sheet len long and u0..u1 wide, th thick, and RINGS
  // turns of wire through it. SH: how far the shelf comes out from the board; SB, SF: its half width at the back and front
  const NB = { u0: -0.085, u1: 0.055, d: 0.045, len: 0.185, y: 1.03, th: 0.007 }, RINGS = 9, SH = 0.25, SB = 0.11, SF = 0.15;
  // ---------------- the notebook ----------------
  // lines of handwriting: '#' a heading, '~' crossed out, '!' underlined twice, '%' scrawled across a page of its own in
  // blood; {n} an ordinary number, {k} the one to ring
  const NAMES = ['Danny: {n}, on vacation this week', 'Mrs Pell nursing home: {n}', 'DMV: {n}', 'try again tomorrow'];   // always in the notebook
  const NUMBERED = [   // pages with someone ordinary's number on them: at least one more of these is always in it
    ['#dentist', 'Dr Okafor, Tuesday the 14th', 'twenty to ten', 'if you can\'t make it ring {n}', 'open 9am - 5pm'],
    ['#night bus', 'from the corner, :15 and :45', 'last one 12.45, not Sundays', 'Full schedule: {n}'],
    ['#yoga', 'Mon, Tue 7pm', 'Wed off', 'ask Kristy about the spare keys', 'Studio phone {n}'],
    ['#surgery', 'Dr Marsh: {n}', 'repeat prescription', 'Fridays, before six'],
  ];
  const PLAIN = [
    ['milk', '~bread', 'batteries, the square kind', 'bulbs, 60w', '~stamps', 'flashlight. I can\'t see'],
    ['#Ruth\'s old address', '22 Corder Lane, top flat', 'the bell doesn\'t work,', 'go around the back', 'she moved.', 'she\'s not there.'],
    ['pay the gas', '~library books (3)', 'bins Thursday', '~ring Mum back', 'fix the street lamp'],
    ['#soup', '2 onions, carrots', 'bone broth', 'mystery meat', 'an hour, low', 'salt at the end'],
    ['#birthdays', 'Carla, March 3rd', 'Danny, May 19th', 'Ruth ?', 'Shadow person ?'],
  ];
  const COAT = ['saw it again', 'by the lamps', 'only the eyes', 'it\'s looking at me', 'it\'s getting closer', 'it\'s coming'];
  const KEY = ['%{k}'];   // the number to ring, alone on its page, written large and fast in red
  // seven pages: the thing by the lamps, five ordinary ones and the one with the number, on page 3, 4 or 5; every number distinct.
  // The five always include the names with their numbers and one more numbered page, so there are always a few
  // ordinary numbers to mistake for the one
  function writeNotebook(rand) {
    const used = new Set(), others = [];
    const num = () => { let n; do { n = Math.floor(rand() * 100); } while (used.has(n)); used.add(n); return '555-01' + String(n).padStart(2, '0'); };
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const key = num();
    const numbered = shuffle(NUMBERED.slice());
    const pages = shuffle([NAMES, numbered[0], COAT].concat(shuffle(numbered.slice(1).concat(PLAIN)).slice(0, 3)));
    const keyPage = 2 + Math.floor(rand() * 3);   // page 3, 4 or 5, each as often (one draw, as it always was)
    rand();   // one draw kept here, so every seed lays the night out as it always has
    pages.splice(keyPage, 0, KEY);
    const filled = pages.map(lines => lines.map(l => l.replace('{k}', key).replace(/\{n\}/g, () => { const n = num(); others.push(n); return n; })));
    return { pages: filled, keyPage, numberText: key, number: key.replace('-', ''), others: others.map(n => n.replace('-', '')) };
  }
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
  function bloodSVG(text, rand) {
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
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + VW * 2 + '" height="' + (VH + 60) * 2 + '" viewBox="0 -12 ' + VW + ' ' + (VH + 60) + '">' +
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
  // ---------------- the notebook's pages, drawn once into canvases (TW x TH, laid on its sheets in the world) ----------------
  // Each page: the holes for the spiral along its top under the perforation, a red margin, blue rules, and the handwriting
  // in blue-black ink on the rules, each line a little off the level and off the margin and each word a little off the line;
  // a heading is underlined ('!' twice), what is done is crossed out, and a line too long for the page runs on to the next
  // rule. The page with the number has nothing on it but the number, scrawled across it in blood (bloodSVG, drawn in once it
  // has loaded as an image; until then the same figures in a plain red hand). Then the backs of the pages, and the cover
  const TW = 560, TH = 740, RULE0 = 112, RULE = 66, MARGIN = 72;
  const HAND = "italic 33px 'Segoe Print', 'Bradley Hand', Noteworthy, 'Chalkboard SE', 'Comic Sans MS', 'Liberation Serif', Georgia, serif";
  const canvasOf = draw => { const c = document.createElement('canvas'); c.width = TW; c.height = TH; draw(c.getContext('2d')); return c; };
  const holes = (g, col) => { g.fillStyle = col; for (let k = 0; k < RINGS; k++) { g.beginPath(); g.arc((k + 0.5) / RINGS * TW, 21, 7, 0, TAU); g.fill(); } };
  const shadeEdges = (g, a) => {
    const v = g.createRadialGradient(TW / 2, TH / 2, TH * 0.3, TW / 2, TH / 2, TH * 0.78);
    v.addColorStop(0, 'rgba(120,92,46,0)'); v.addColorStop(1, 'rgba(120,92,46,' + a + ')'); g.fillStyle = v; g.fillRect(0, 0, TW, TH);
  };
  function paper(g, back, rand) {
    g.fillStyle = back ? '#d8ceb2' : '#e3d9be'; g.fillRect(0, 0, TW, TH);
    if (!back && rand() < 0.3) { rand(); rand(); rand(); }   // (where a cup ring was once drawn: the draws kept, so the ink falls as it did)
    g.fillStyle = 'rgba(78,98,140,.33)'; for (let y = RULE0; y < TH - 20; y += RULE) g.fillRect(0, y, TW, 2);
    if (!back) { g.fillStyle = 'rgba(178,72,72,.45)'; g.fillRect(MARGIN, 42, 2, TH - 42); }
    g.fillStyle = 'rgba(110,86,50,.3)'; for (let x = 4; x < TW; x += 9) g.fillRect(x, 40, 4, 1.5);   // the perforation
    holes(g, '#2a1d16');
    shadeEdges(g, back ? 0.34 : 0.26);
  }
  function writePage(g, lines, n, rand) {
    g.font = HAND; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineCap = 'round';
    let row = 0;
    for (const l of lines) {
      const kind = l[0] === '#' ? 'h' : l[0] === '~' ? 's' : l[0] === '!' ? 'e' : '', text = kind ? l.slice(1) : l;
      const x0 = MARGIN + 14 + rand() * 9, runs = [];
      let cur = [];
      for (const w of text.split(/\s+/)) {
        if (cur.length && g.measureText(cur.concat(w).join(' ')).width > TW - x0 - 16 - (runs.length ? 22 : 0)) { runs.push(cur); cur = [w]; } else cur.push(w);
      }
      runs.push(cur);
      runs.forEach((ws, j) => {
        g.save(); g.translate(x0 + (j ? 22 : 0), RULE0 + row * RULE - 9); g.rotate((rand() - 0.5) * 1.6 * DEG);
        g.fillStyle = kind === 's' ? 'rgba(34,48,92,.72)' : '#22305c';
        let x = 0;
        for (const w of ws) { g.fillText(w, x + (rand() - 0.5) * 1.5, (rand() - 0.5) * 5); x += g.measureText(w + ' ').width; }
        const wid = x - g.measureText(' ').width;
        g.strokeStyle = 'rgba(34,48,92,.8)';
        if (kind === 'h' || kind === 'e') { g.lineWidth = 2; g.beginPath(); g.moveTo(-2, 7); g.lineTo(wid + 3, 6 + rand() * 2); if (kind === 'e') { g.moveTo(-1, 12); g.lineTo(wid + 2, 11 + rand() * 2); } g.stroke(); }
        if (kind === 's') { g.lineWidth = 3.5; g.beginPath(); g.moveTo(-4, -10 + rand() * 2); g.lineTo(wid + 4, -11 + rand() * 2); g.stroke(); }
        g.restore(); row++;
      });
    }
    g.font = "italic 24px Georgia, 'Liberation Serif', serif"; g.fillStyle = 'rgba(34,48,92,.5)'; g.textAlign = 'right';
    g.fillText(String(n), TW - 22, TH - 16);
  }
  // the figures in blood, from bloodSVG once the image of them has loaded; and before that, plain
  function bloodOn(g, text, img) {
    if (img) { const w = TW + 20, h = w * 236 / 400; g.drawImage(img, -10, TH * 0.43 - h / 2, w, h); return; }
    g.save(); g.translate(TW / 2, TH * 0.45); g.rotate(-6 * DEG); g.font = "italic bold 96px 'Segoe Print', 'Bradley Hand', 'Liberation Serif', Georgia, serif";
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#850c0a'; g.fillText(text, 0, 0, TW - 40); g.restore();
  }
  // the cover: board covered in worn red-brown cloth, with its label, as it is drawn as a thing you hold
  // (ICONS.notebook); and inside it, bare grey board
  function coverOut(g) {
    const v = g.createRadialGradient(TW * 0.3, TH * 0.2, 20, TW * 0.4, TH * 0.4, TH * 0.85);
    v.addColorStop(0, '#6a3a2c'); v.addColorStop(1, '#3e2119'); g.fillStyle = v; g.fillRect(0, 0, TW, TH);
    g.strokeStyle = 'rgba(20,10,8,.55)'; g.lineWidth = 14; g.strokeRect(7, 7, TW - 14, TH - 14);
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 7; k++) g.fillRect(40 + k * 61, 180 + (k % 3) * 140, 2, 60 + (k % 2) * 40);   // scuffs
    g.fillStyle = '#cfc2a0'; g.fillRect(118, 360, 250, 92); g.strokeStyle = 'rgba(60,40,30,.35)'; g.lineWidth = 3; g.strokeRect(118, 360, 250, 92);
    g.fillStyle = 'rgba(60,70,110,.85)'; g.fillRect(140, 408, 180, 5);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, TW, 40);
    holes(g, '#140b08');
  }
  function coverIn(g) {
    g.fillStyle = '#8f8574'; g.fillRect(0, 0, TW, TH);
    g.fillStyle = 'rgba(60,50,40,.08)'; for (let k = 0; k < 90; k++) g.fillRect((k * 197) % TW, (k * 331) % TH, 26, 2);   // the grain of the board
    holes(g, '#20160f');
    shadeEdges(g, 0.4);
  }
  const LETTERS = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', 0: 'OPER' };

  LEVELS.push({
    id: 'booth', title: 'The Phone Booth', facing: 0, eyeH: 1.65,
    pal: { skyTop: [12, 11, 16], fog: [50, 45, 47], ground: [22, 22, 26], fogDist: 82 },
    ambient: { tune: 'ambient:9', wind: 0.35, rain: 1, drone: 0.45, droneFreq: 47, windFreq: 300 },
    weather: { kind: 'rain', density: 0.9, wind: 0.25 },
    lights: [{ x: 0, y: 2.25, z: 0, r: 3.3, i: 0.55, color: [214, 228, 255], flicker: 0.05 }],
    text: {
      intro: 'You missed the bus,\nand you don\'t remember who to call for help.',
      egg: 'Call 911.',   // this night's easter egg, as the Scores' list names it once found (game.js: foundEgg)
      death: { default: 'It came into the booth.', ringing: 'It was still ringing when it came through the glass.', dead: 'You were still listening to a dead line when it came through the glass.', nocoin: 'The phone would not operate without a coin.', police: 'The police can\'t help you here.' },
      eggs: ['police'],   // (caught after calling 911 that night: the easter egg, "Nice try", game.js deathLine)
      win: 'A mysterious car came for you, just in time.',
    },
    // two streets, each seen whole through a pane of the booth: up the main street through the door, and along the cross
    // street to the east through the east pane (each pane as far as the pay phone in the corner between them). It starts at
    // the last lamp down its street (startDist: about how far that is; the night sets it exactly once it has laid out the
    // way in). Nothing comes from the west, and the back of the booth looks at a shuttered shop
    lanes: [
      { deg: 0, name: 'up the street', y: ROAD, startDist: 108.6, maxStart: 108.6, apertures: [{ z: B, x0: -0.5, x1: 0.38, y0: 1.06, y1: 2.04 }] },
      { deg: 90, name: 'along to the east', startDist: 93, maxStart: 93, apertures: [{ z: B, x0: -0.38, x1: 0.62, y0: 1.06, y1: 2.04 }] },
    ],
    laneSwitch: false,   // it keeps to the street it started down: the race is with the phone, not with finding it
    // it reaches the glass in about 39 to 48 s (time: the whole of its way, every lamp on its street and all, is fitted to
    // it). A careful player finds the number by page four on average (it is always on page 3, 4 or 5) and the coin in a few
    // seconds, has dialled by about 21 s and is answered by 28, while it is at one of its last lamps; with the number on page
    // five and its quickest way in there are several seconds to spare, but fewer after a wrong number as well, which costs about eight (the
    // coin has to be taken out of the return and put back in)
    creatures: [{ type: 'signalman', startDist: 100, time: 72 }],
    aftermath: { type: 'custom' },   // L.aftermath: the car that comes for you, and what it does
    build(L) {
      const s = L.s;
      const nb = writeNotebook(L.rand);
      const inkRand = mulberry32((L.rand() * 4294967295) >>> 0);
      // the notebook's pages as they are drawn on it (the one with the number drawn again once its blood has loaded), the backs
      // of the pages, and the cover out and in
      const tex = { back: canvasOf(g => paper(g, true, inkRand)), out: canvasOf(coverOut), in: canvasOf(coverIn) };
      tex.pages = nb.pages.map((lines, i) => canvasOf(g => { paper(g, false, inkRand); writePage(g, i === nb.keyPage ? [] : lines, i + 1, inkRand); }));
      const keyBare = canvasOf(g => g.drawImage(tex.pages[nb.keyPage], 0, 0)), keyText = nb.pages[nb.keyPage][0].slice(1);
      bloodOn(tex.pages[nb.keyPage].getContext('2d'), keyText, null);
      const blood = document.createElement('img');
      blood.onload = () => { const g = tex.pages[nb.keyPage].getContext('2d'); g.clearRect(0, 0, TW, TH); g.drawImage(keyBare, 0, 0); bloodOn(g, keyText, blood); s.bloodDrawn = true; };
      blood.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(bloodSVG(keyText, inkRand));
      Object.assign(s, { pages: nb.pages, keyPage: nb.keyPage, number: nb.number, numberText: nb.numberText, others: nb.others,
        hook: 'on', line: 'idle', dialed: '', doneAt: 0, ringFrom: null, answeredAt: null, nbOpen: false, page: 0, nbWant: 0, nbAnims: [], nbHand: null, nbRect: null, bloodDrawn: false,
        credit: 0, returnAt: 0, keyT: {}, padSel: null, deadKeys: 0, end: null, lands: [], lagN: 0, keyHit: {}, blinkAt: -9, handsetT: -9, coinDropT: -9, finger: null, fingerAt: 0, glides: [],
        man: null, lampsOut: 0, sparks: [], cop: null, called911: false, talk: null, parked: [], smoke: [] });

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
      // parked cars, one in each long street, well clear of the way it comes (s.parked: where each stands, its body and
      // wheels all inside it, for the police car to keep clear of)
      const car = (x0, x1, z0, z1, col) => {
        s.parked.push({ x0, x1, z0, z1 });
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
      // Along the main street they stand on its east side, and along the cross street to the east on its far side: the sides
      // nearer the booth's corner, where the pay phone is, so that from the phone a man at one is at the edge of the view.
      // It breaks them one by one (breakLamp): a lamp's level (lampLevel) is 1 while it burns, flares and stutters as it
      // goes, and is nought for good once it is out; its light (and the pool of it on the ground), its glow and its lens all follow it
      const LAMPS = [];
      for (const z of [12, 26, 40, 54, 68, 86, 108]) LAMPS.push([4.0, z, -1, 0, 0]);          // [x, z, arm x, arm z, street]
      for (const x of [16, 30, 44, 58, 72, 92]) LAMPS.push([x, 8.2, 0, -1, 1]);
      for (const [x, z, ax, az] of [[-13, 0.8, 0, 1], [-28, 8.2, 0, -1], [-44, 0.8, 0, 1], [-62, 8.2, 0, -1], [-84, 0.8, 0, 1]]) LAMPS.push([x, z, ax, az, -1]);
      const postC = [30, 32, 34], lamps = [];
      const lampLevel = lp => {
        if (lp.outAt === undefined) return 1;
        const k = L.t - lp.outAt;
        if (k < 0.07) return 1.8;                                                             // the pop: a white flare
        if (k > 0.5) return 0;
        return (Math.sin(k * 97) > 0.1 ? 0.75 : 0.06) * (1 - k / 0.5);                         // then it stutters, and goes
      };
      for (const [x, z, ax, az, street] of LAMPS) {
        const d = Math.hypot(x, z), px = -z / d * 0.07, pz = x / d * 0.07;      // a post faces the eye: it is only ever seen from here
        SC.wallV(L, x - px, z - pz, x + px, z + pz, 0, 5.0, postC);
        const hx = x + ax * 1.1, hz = z + az * 1.1;
        SC.quad(L, [x, 4.92, z], [hx, 4.92, hz], [hx, 5.02, hz], [x, 5.02, z], postC);
        SC.box(L, hx - 0.22, hx + 0.22, 4.86, 4.98, hz - 0.22, hz + 0.22, [40, 40, 42]);
        const lp = { x, z, hx, hz, street, outAt: undefined };
        // the lens: lit, a bar of orange; out, dark broken glass with a jagged rim of what is left
        SC.sprite(L, hx, 4.78, hz, 0.36, 0.1, (ctx, P) => {
          ctx.scale(0.36, 0.1);
          const k = lampLevel(lp);
          if (k > 0.03) { P_ell(ctx, 0, 0.5, 0.5, 0.5, P.raw(mixc([90, 60, 40], k > 1 ? [255, 250, 236] : [255, 196, 120], Math.min(1, k)))); return; }
          P_ell(ctx, 0, 0.5, 0.5, 0.5, P.raw([26, 24, 24]));
          P_poly(ctx, [[-0.5, 0.5], [-0.32, 0.12], [-0.2, 0.44], [-0.05, 0.05], [0.1, 0.38], [0.26, 0.1], [0.5, 0.5]], P.raw([58, 56, 58]));
        }, { noFog: true, noLight: true });
        const hp = L.pt(hx, 4.8, hz);
        lp.light = worldLight(L, { x: hx, y: 4.8, z: hz, r: 12, i: 0.6, color: [255, 172, 96] });
        lp.glow = { x: hp[0], y: hp[1], z: hp[2], r: 1.7, color: [255, 170, 90], a: 0.22 };
        // (its light is the pool it throws on the ground round it, from lp.light: no streak of it is drawn on the road)
        lamps.push(lp);
      }
      L.lights = lamps.map(lp => lp.light);
      // a lamp it breaks: it pops in a white flare, glass and sparks come down out of it, and it stutters and goes out for good
      const fxr = mulberry32(7717);   // (the sparks' own random stream: the night's is left as it was)
      const breakLamp = lp => {
        if (lp.outAt !== undefined) return;
        lp.outAt = L.t; s.lampsOut++;
        const pan = Math.sin(wrapPi(Math.atan2(lp.hx, lp.hz) - G.cam.yaw)) * 0.85;
        AUDIO.sfx('lampBreak', pan);
        for (let k = 0; k < 26; k++) {
          const glass = k < 9, a = fxr() * TAU, v = glass ? 0.4 + fxr() * 0.8 : 0.8 + fxr() * 2.2;
          s.sparks.push({ x: lp.hx, y: 4.76, z: lp.hz, vx: Math.cos(a) * v, vy: glass ? -0.2 - fxr() * 0.5 : fxr() * 1.6 - 0.3, vz: Math.sin(a) * v, t0: L.t, life: glass ? 1.2 : 0.35 + fxr() * 0.8, glass });
        }
      };
      // every frame: each lamp's light and glow as its level is now; the sparks and glass falling
      const lampsNow = dt => {
        for (const lp of lamps) {
          if (lp.outAt === undefined || lp.done) continue;
          const k = lampLevel(lp);
          lp.light.i = 0.6 * k; lp.glow.a = 0.22 * Math.min(1, k) + (k > 1 ? 0.5 : 0); lp.glow.r = k > 1 ? 3.2 : 1.7;
          if (L.t - lp.outAt > 0.6) lp.done = true;
        }
        for (const p of s.sparks) { p.vy -= 9.8 * dt * (p.glass ? 1 : 0.6); p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.y < ROAD + 0.02) { p.y = ROAD + 0.02; p.vy = 0; p.vx *= 0.5; p.vz *= 0.5; } }
        s.sparks = s.sparks.filter(p => L.t - p.t0 < p.life);
      };
      const sparkParts = () => s.sparks.map(p => {
        const age = (L.t - p.t0) / p.life, a = L.pt(p.x, p.y, p.z), b = L.pt(p.x - p.vx * 0.035, p.y - p.vy * 0.035, p.z - p.vz * 0.035);
        return { kind: 'poly', pts: [a, b], stroke: true, lw: p.glass ? 0.03 : 0.022, color: p.glass ? [200, 214, 226] : mixc([255, 250, 210], [255, 120, 40], age), alpha: p.glass ? 0.7 * (1 - age) : 1 - age * 0.7, noFog: true, noLight: true };
      });

      // ---------------- the booth ----------------
      // a metre and a half across, a little less deep: the door (the north pane), the east pane and the back look out on the
      // main street, the cross street and the shuttered shop, and the pay phone hangs across the corner between the first two
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
      SC.quad(L, [-0.05, 2.35, -0.3], [0.05, 2.35, -0.3], [0.05, 2.35, 0.3], [-0.05, 2.35, 0.3], [236, 242, 255], { noFog: true, noLight: true });
      // the door's pull (the door is the north pane), at its west end: a dull bar on two stand-offs from the glass, so it
      // reads as part of the door and not as something lying loose to be picked up
      SC.box(L, -0.585, -0.565, 0.94, 1.32, B - 0.07, B - 0.05, [92, 96, 104]);
      for (const y of [0.97, 1.27]) SC.box(L, -0.582, -0.568, y, y + 0.022, B - 0.05, B - 0.004, [76, 80, 88]);

      // ---------------- the pay phone, across the corner ----------------
      // Everything on it is placed by where it lies on the board (ph, at3): u across it (to your right as you face it), y up,
      // and d out from it toward you. The backboard, no wider than the phone, from the shelf up; the housing, slim, with the
      // display and the coin slot along its top, the keys under them, the instruction card under the keys and the coin
      // return at the bottom; the receiver hanging on its right; the little shelf under it all, where the notebook lies.
      // Past its edges the glass is clear, so whatever comes up either street is still in the view while you dial.
      const face = { sortDist: FD - 0.01 }, detail = { sortDist: FD - 0.015 };
      const q4 = (map, pts, col, opts) => { const w = pts.map(p => map(p[0], p[1], p[2])); SC.quad(L, w[0], w[1], w[2], w[3], col, opts); };
      const faceQ = (u0, u1, y0, y1, d, col, opts) => q4(ph, [[u0, y0, d], [u1, y0, d], [u1, y1, d], [u0, y1, d]], col, opts);
      // a box standing out from the board (u0..u1, y0..y1, d0..d1 in the frame map gives), with only the faces that look
      // at the eye (nothing ever sees it from anywhere else), shaded as SC.box shades
      const obox = (map, u0, u1, y0, y1, d0, d1, col, opts) => {
        const eye = [0, L.eyeH, 0], ctr = map((u0 + u1) / 2, (y0 + y1) / 2, (d0 + d1) / 2);
        for (const [f, k] of [[[[u0, y0, d1], [u1, y0, d1], [u1, y1, d1], [u0, y1, d1]], 1], [[[u0, y1, d0], [u1, y1, d0], [u1, y1, d1], [u0, y1, d1]], 1.08],
          [[[u0, y0, d0], [u1, y0, d0], [u1, y0, d1], [u0, y0, d1]], 0.6], [[[u0, y0, d0], [u0, y0, d1], [u0, y1, d1], [u0, y1, d0]], 0.72], [[[u1, y0, d0], [u1, y0, d1], [u1, y1, d1], [u1, y1, d0]], 0.72]]) {
          const w = f.map(p => map(p[0], p[1], p[2])), fc = [0, 1, 2].map(j => (w[0][j] + w[2][j]) / 2);
          const e1 = [0, 1, 2].map(j => w[1][j] - w[0][j]), e2 = [0, 1, 2].map(j => w[3][j] - w[0][j]);
          let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
          if (n[0] * (fc[0] - ctr[0]) + n[1] * (fc[1] - ctr[1]) + n[2] * (fc[2] - ctr[2]) < 0) n = n.map(v => -v);
          if (n[0] * (eye[0] - fc[0]) + n[1] * (eye[1] - fc[1]) + n[2] * (eye[2] - fc[2]) <= 1e-7) continue;
          SC.quad(L, w[0], w[1], w[2], w[3], scalec(col, k), opts);
        }
      };
      // a sprite on the phone, at its size there (drawn at full size, as it was made, and brought in to PK), fixed flat on
      // the face of the phone (PH_FACE: it looks back along the line into the corner, at you), so it stays on the housing,
      // in its perspective, whichever way you look
      const PH_FACE = -0.75 * Math.PI;
      const phSprite = (u, y, d, w, h, draw, opts) => { const p = ph(u, y, d); return SC.mkSprite(L, p[0], p[1], p[2], w * PK, h * PK, (ctx, P) => { ctx.scale(PK, PK); draw(ctx, P); }, Object.assign({ face: PH_FACE }, opts)); };
      const HW = 0.082, HY0 = 1.2;   // the housing's half width, and its foot
      const LCD = { u0: -0.07, u1: 0.026, y0: 1.66, y1: 1.725 }, SLOT = { u0: 0.038, u1: 0.072, y0: 1.66, y1: 1.725 };
      const RET = { u0: -0.045, u1: 0.045, y0: 1.212, y1: 1.284 }, RX = 0.138;   // the coin return; where the receiver hangs
      const CARD = { u0: -0.078, u1: 0.078, y0: 1.296, y1: 1.4 };
      const KEYS = ['123', '456', '789', '*0#'], KEY_Y0 = 1.598, KEY_DY = 0.052, KEY_DU = 0.045;
      obox(at3, -BW, BW, NB.y - 0.03, ph(0, 1.8, 0)[1], 0, 0.016, [58, 62, 68], { sortDist: WD + 0.03 });   // the backboard
      obox(ph, -HW, HW, HY0, 1.765, 0.02, 0.1, [128, 132, 140], { sortDist: FD + 0.005 });        // the housing
      obox(ph, -HW - 0.005, HW + 0.005, 1.755, 1.785, 0.02, 0.11, [96, 100, 108], { sortDist: FD - 0.004 });   // its cap
      faceQ(LCD.u0 - 0.007, LCD.u1 + 0.007, LCD.y0 - 0.008, LCD.y1 + 0.008, 0.1005, [62, 64, 70], face);   // the display's bezel (the display is drawn each frame)
      const slotArt = SC.grab(L, () => {
        faceQ(SLOT.u0, SLOT.u1, SLOT.y0, SLOT.y1, 0.1005, [176, 180, 188], face);                    // the coin slot's chrome plate,
        faceQ(SLOT.u0 + 0.004, SLOT.u1 - 0.004, SLOT.y0 + 0.004, SLOT.y1 - 0.004, 0.101, [138, 142, 150], detail);
        faceQ(0.05, 0.06, 1.669, 1.716, 0.1015, [6, 6, 8], { sortDist: FD - 0.02 });                // and the slot in it
      });
      faceQ(-0.072, 0.072, 1.41, 1.632, 0.1005, [92, 96, 102], face);                            // the keypad's plate
      const retArt = SC.grab(L, () => {
        faceQ(RET.u0, RET.u1, RET.y0, RET.y1, 0.1005, [160, 164, 172], face);                       // the coin return: a chrome surround
        faceQ(RET.u0 + 0.008, RET.u1 - 0.008, RET.y0 + 0.008, RET.y1 - 0.006, 0.101, [12, 12, 14], detail);   // and its dark mouth
      });
      // the instruction card, on the housing under the keys: a printed heading, and the three steps side by side in the order
      // the phone wants them (as on any pay phone)
      faceQ(CARD.u0, CARD.u1, CARD.y0, CARD.y1, 0.1005, [214, 208, 190], face);
      faceQ(CARD.u0, CARD.u1, CARD.y1 - 0.021, CARD.y1, 0.1007, [150, 40, 36], detail);
      // Each step is two big bold words, one over the other, as large as the card's column takes (squeezed a little where a
      // word is wide), so they read from where you stand. Everything is kept inside the card with a margin all round (the
      // three columns across the card less its margins, each word narrower than its column), and the heading sits in the
      // middle of the red band, so none of it runs off the card however near or far, or however it is turned. (L.cardArt:
      // the card's size and drawing, for the tests)
      const CW = CARD.u1 - CARD.u0, CH = CARD.y1 - CARD.y0, CM = 0.006, BAND = 0.021;
      const cardDraw = (ctx, P) => {
        // (px: its size in mm; fit: the widest it may be, in mm, squeezed across to fit)
        const print = (t, x, y, px, col, fit) => {
          ctx.save(); ctx.translate(x, y); ctx.scale(0.001, -0.001); ctx.font = 'bold ' + px + 'px Arial, Helvetica, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col;
          const w = ctx.measureText(t).width; if (fit && w > fit) ctx.scale(fit / w, 1);
          inkText(ctx, t, 0, 0); ctx.restore();
        };
        print('TO CALL', 0, CH - BAND / 2 - 0.004, 11, P.col([236, 226, 210]), (CW - 2 * CM) * 1000);   // (caps about 8mm high, in the middle of the band)
        const ink = P.col([30, 34, 58]), red = P.col([150, 40, 36]), col = (CW - 2 * CM) / 3;
        [['1', 'LIFT', 'PHONE'], ['2', 'INSERT', 'COIN'], ['3', 'DIAL', 'NUMBER']].forEach(([n, a, b], i) => {
          const x = (i - 1) * col, fit = col * 1000 - 4;
          print(n, x, 0.064, 13, red);
          print(a, x, 0.0435, 14, ink, fit); print(b, x, 0.0215, 14, ink, fit);
        });
      };
      L.cardArt = { w: CW, h: CH, margin: CM, draw: cardDraw };
      L.props.push(phSprite(0, CARD.y0, 0.101, CW, CH, cardDraw, { sortDist: FD - 0.016 }));
      // the shelf under it, where the notebook lies: a small board out from the foot of the backboard, at the height of the
      // rail along the glass, a little wider at the front, held up on a bracket under it
      q4(at3, [[-SB, 1.03, 0], [SB, 1.03, 0], [SF, 1.03, SH], [-SF, 1.03, SH]], [96, 100, 106], { sortDist: WD + 0.01 });
      q4(at3, [[-SF, 1.0, SH], [SF, 1.0, SH], [SF, 1.03, SH], [-SF, 1.03, SH]], [74, 78, 84], { sortDist: WD + 0.005 });
      q4(at3, [[-0.006, 0.86, 0.004], [0.006, 0.86, 0.004], [0.006, 1.0, SH * 0.8], [-0.006, 1.0, SH * 0.8]], [50, 53, 58], { sortDist: WD + 0.02 });   // the bracket

      // ---------------- the coin, the receiver, the keys, the coin slot and return, the notebook ----------------
      // the coin: left in the coin return by the last person to use the phone, on the shelf, or dropped on the floor of the
      // booth, by one of the panes near the phone (clear of the shelf, which would hide it looking down)
      const cr0 = ph(0, RET.y0 + 0.006, 0.122), COIN_RET = { x: cr0[0], y: cr0[1], z: cr0[2] }, COIN_W = 0.06;
      const shelfC = at3(0.1, 1.03, 0.16);   // (beside the notebook, on the shelf)
      const coin = mkItem(L, 'coin', 'Coin', [
        Object.assign({ key: 'return', jitter: 0 }, COIN_RET),
        { key: 'shelf', x: shelfC[0], y: 1.03, z: shelfC[2], flat: true, jitter: 0.015 },
        { key: 'floorE', x: 0.52, y: 0.03, z: 0.08, flat: true, jitter: 0.03 },
        { key: 'floorN', x: 0.08, y: 0.03, z: 0.52, flat: true, jitter: 0.03 },
      ], { w: COIN_W, h: COIN_W, icon: 'coin' });
      if (coin.y < 0.5) coin.w = coin.h = 0.09;   // on the floor, a little further off and lower in the view, drawn a little bigger
      else if (coin.y < 1.2) coin.w = coin.h = 0.07;
      const coinInCup = () => !coin.taken && Math.abs(coin.x - COIN_RET.x) < 0.01 && Math.abs(coin.y - COIN_RET.y) < 0.01;
      const coinBack = () => {   // a call that never went through gives the coin back: it rattles down into the return (L.update drops it in)
        const p = L.pt(COIN_RET.x, COIN_RET.y, COIN_RET.z);
        Object.assign(coin, { x: p[0], y: p[1], z: p[2], w: COIN_W, h: COIN_W, flat: false, taken: false, uses: 1 });
        s.coinDropT = L.t; s.coinClink = false;
      };
      const fmt = d => d.length > 3 ? d.slice(0, 3) + '-' + d.slice(3) : d;
      // with the receiver in your hand, what is left to click is the hook
      const sync = () => { receiver.name = s.hook === 'off' ? 'Hook' : 'Receiver'; };
      // a pay phone, in the order it wants: lift the receiver (a dial tone), put the coin in, dial. A coin put in with the
      // receiver on its hook drops straight through to the return; hanging up on a call that was never answered gives it back
      // lifted, the receiver comes off its hook into your right hand (L.offHand), and is put back from it
      const lift = () => { s.hook = 'off'; s.line = 'tone'; s.dialed = ''; s.lagN = 0; s.handsetT = L.t; AUDIO.sfx('receiver'); G.say('You lift the receiver. A dial tone.', 'A dial tone.'); };
      const hangUp = () => {
        const ringing = s.line === 'ringing' || s.line === 'connecting' || s.line === 'calling911', onCall = s.line === 'emergency';
        s.hook = 'on'; s.line = 'idle'; s.dialed = ''; s.lagN = 0; s.ringFrom = null; s.freeDial = false; s.ring911 = false; s.talk = null; s.handsetT = L.t; AUDIO.sfx('clunk');
        for (const l of s.lands) { l.digit = false; l.sfx = 'keyClick'; }   // (keys still to be pressed, pressed on a dead phone)
        if (s.credit) { s.credit = 0; s.returnAt = L.t + 0.45; AUDIO.sfx('coinReturn'); }
        if (ringing) G.say('You hang up. The ringing stops.', 'The ringing stops.');
        else if (onCall) G.say('You hang up on the dispatcher.', 'You hang up.');
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
      // 911 is free, as on any pay phone: with no coin in, the keys of 9, 1, 1 are taken (s.freeDial) and nothing else is;
      // a key that is not the next of them wipes what was taken and clicks as a key with no credit always has, and a coin
      // put in wipes it too, so a stray 9 never spoils a number dialled after. Three figures of it, coin or none, and it
      // calls (no number in the notebook starts with a 9: they are all 555-01xx)
      const EMERGENCY = '911';
      // what the dispatcher says ([its crackle; the words; how long they stay up; the beat of quiet after them, in which you
      // answer her, unheard, before she goes on]): all four while the shade has still to get to its last lamp (they begin 0,
      // 4.4, 9.4 and 13 s from her answering), only the last once it has (L.update)
      // (in curly quotation marks, opening and closing: the game's typeface draws the straight one as a closing mark, at either end)
      const DISPATCH = [['dispatchAsk', '\u201c911, what is your emergency?\u201d', 2.2, 2.2], ['dispatchDescribe', '\u201cCould you describe this creature, please?\u201d', 2.6, 2.4],
        ['dispatchSee', '\u201cI see.\u201d', 1.4, 2.2], ['dispatchSend', '\u201cOk, stay there. I\u2019m sending a unit now.\u201d', 3.5, 0]];
      const unFree = () => {
        if (!s.freeDial) return;
        s.freeDial = false;
        if (s.line === 'dialing') { s.dialed = ''; s.line = 'tone'; s.lagN = 0; for (const l of s.lands) l.digit = false; }
      };
      const press = ch => {
        if (G.state !== 'play') return;
        s.keyT[ch] = L.t;
        if (s.line === 'answered') return;
        const k = keys.find(q => q.ch === ch), wait = k ? fingerTo(k.t) : 0;
        const land = (sfx, digit, blink) => { s.lands.push({ at: L.t + wait, ch, sfx, digit, blink }); if (digit) s.lagN++; };
        // (on the line to the dispatcher: hang up to dial again)
        if (s.line === 'emergency') { land('keyClick'); G.say('The dispatcher is still on the line. Hang up to dial again.', 'Still on the line to the dispatcher.'); return; }
        if (s.hook !== 'off') { land('keyClick'); G.say('The receiver is still on its hook.', 'The receiver is on its hook.'); return; }
        const free = !s.credit && (s.line === 'tone' || s.line === 'dialing') && EMERGENCY.startsWith(s.dialed + ch);
        if (!s.credit && !free && s.line !== 'calling911') { unFree(); land('keyClick', false, true); s.deadKeys++; G.say(NO_CREDIT[0], NO_CREDIT[1]); return; }
        if (ch === '*' || ch === '#') { land('dial'); return; }
        if (s.line === 'dead') { land('dial', false, true); G.say('The line is dead. Hang up and try again.', 'The line is dead.'); return; }
        if (s.line !== 'tone' && s.line !== 'dialing') { land('dial'); return; }
        if (free) s.freeDial = true;
        s.dialed += ch; s.line = 'dialing'; land('dial', true);
        if (s.dialed === EMERGENCY) { s.line = 'calling911'; s.doneAt = L.t; s.freeDial = false; }
        else if (s.dialed.length === 7) { s.line = s.dialed === s.number ? 'connecting' : 'checking'; s.doneAt = L.t; }
      };
      const receiver = mkTarget(L, {
        id: 'receiver', name: 'Receiver', ...(([x, y, z]) => ({ x, y, z }))(ph(RX, 1.3, 0.135)), w: 0.11 * PK, h: 0.44 * PK, face: PH_FACE,
        onClick() { if (s.line === 'answered') return true; if (s.hook === 'on') lift(); else hangUp(); return true; },
      });
      // a target stands a little in front of the face, and is placed and sized so that on screen it covers just what it
      // stands for there (what glows when it is pointed at is what it stands for: glowWith)
      const front = (u, y0, w, h, d) => {
        const k = (WD - (d || 0.125) * PK) / (WD - 0.104 * PK), p = ph(u, y0, 0.104);   // (the face's point, brought toward the eye)
        return { x: p[0] * k, y: L.eyeH + (p[1] - L.eyeH) * k, z: p[2] * k, w: w * PK * k, h: h * PK * k, face: PH_FACE };   // (parallel to the face: on screen just where it is)
      };
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
        ctx.font = 'bold 20px Arial, Helvetica, sans-serif'; inkText(ctx, ch, 0, ch === '*' ? 5 : 1);
        if (LETTERS[ch]) { ctx.font = 'bold 7px Arial, Helvetica, sans-serif'; inkText(ctx, LETTERS[ch], 0, 12.5); }
        ctx.restore();
      };
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
        const ch = KEYS[r][c], u = (c - 1) * KEY_DU, yc = KEY_Y0 - r * KEY_DY;
        const t = mkTarget(L, Object.assign(front(u, yc - 0.023, 0.042, 0.046), { id: 'key' + (KEY_NAME[ch] || ch), name: '', onClick() { press(ch); return true; } }));   // (no name: what it is is printed on it)
        keys.push({ ch, u, y: yc, w: 0.042, h: 0.046, t, spr: phSprite(u, yc - 0.022, 0.104, 0.044, 0.044, (ctx, P) => drawKey(ctx, P, ch), { sortDist: FD - 0.016, glowOf: t }) });
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
            const fx = G.fumble(coin, this, { preset: 'return', drop: false, scale: 0.042 * PK / coin.w, sfx: { hit: 'tink' }, onHit: () => {   // (a coin's size at the slot)
              G.removeFromInv(coin);
              if (s.hook === 'off') { unFree(); s.credit = 10; AUDIO.sfx('coin'); } else through();
            } });
            if (!fx) { through(); return true; }   // (something else on its way from the hand: it is let go of at once)
            return G.refuse(false);
          }
          unFree(); s.credit = 10; AUDIO.sfx('coin');
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
      // ---------------- the notebook, read where it lies ----------------
      // It lies shut on the shelf, its spiral toward the backboard. Clicked, the hand goes to its near corner, and the cover (then,
      // click by click, each page) is lifted by that corner and turned back over the spiral, its free end going first and the
      // sheet curling, to stand against the backboard in front of those turned before it; a click on the last page brings the lot
      // back down over it, shut. Clicks made while the hand is on its way, or while a page is still going over, are kept and
      // done in turn (s.nbWant). Nothing is done to the view: it is looked down at as anything is, and read with the zoom.
      const REST = 97 * DEG, restOf = k => REST - k * 1.3 * DEG;   // standing against the backboard: k 0 the cover, i + 1 page i
      const NB_T = { cover: 0.55, page: 0.5, block: 0.62 };
      const AX = NB.d, AY = NB.y + NB.th, NB_N = 10, dN = NB.d + NB.len, uC = (NB.u0 + NB.u1) / 2;   // the spiral; the near edge
      // what you click is the whole of it as the eye sees it: up the plane of its near edge to where its far end is seen
      const nbTop = L.eyeH + (AY - L.eyeH) * (WD - dN) / (WD - NB.d), nbT = at3(uC, NB.y - 0.004, dN + 0.004);
      const notebook = mkTarget(L, {
        id: 'notebook', name: 'Notebook', x: nbT[0], y: nbT[1], z: nbT[2], w: NB.u1 - NB.u0 + 0.016, h: nbTop - NB.y + 0.012,
        onClick() {
          s.nbWant++;
          const at = at3(NB.u1 - 0.022, AY + 0.003, dN - 0.014);   // its near corner, on your right
          s.nbHand = G.reach(this, { style: 'touch', at: { x: at[0], y: at[1], z: at[2] } });
          return true;
        },
      });
      const nbKind = a => (typeof a.item === 'number' ? 'page' : a.item);
      // the next thing done to it, once the hand is there: open it, turn the page or, on the last, shut it
      const nbNext = () => {
        const rc = G.hand.reach, run = s.nbAnims;
        if (s.nbWant <= 0 || (rc && rc === s.nbHand && rc.touched === 0) || run.some(a => a.item === 'block')) return;
        if (!s.nbOpen) {
          if (run.length) return;
          s.nbOpen = true; s.page = 0; run.push({ item: 'cover', t0: L.t });
        } else if (s.page < s.pages.length - 1) {
          if (run.some(a => (L.t - a.t0) / NB_T[nbKind(a)] < 0.35)) return;   // one still going over: this one follows it
          run.push({ item: s.page, t0: L.t }); s.page++;
        } else {
          if (run.length) return;
          run.push({ item: 'block', t0: L.t }); s.nbWant = 0; AUDIO.sfx('page'); AUDIO.sfx('flop'); return;
        }
        s.nbWant--; AUDIO.sfx('page');
      };
      const nbUpdate = () => {
        nbNext();
        for (const a of s.nbAnims.slice()) {
          if (L.t - a.t0 < NB_T[nbKind(a)]) continue;
          s.nbAnims.splice(s.nbAnims.indexOf(a), 1);
          if (a.item === 'block') { s.nbOpen = false; s.page = 0; }
        }
        notebook.name = s.nbOpen ? '' : 'Notebook';   // (open, nothing is written over the page)
      };
      // ---- drawing it, in the view's own pixels: each sheet in strips across it, each strip in its own perspective ----
      // A sheet hangs from the spiral, at an angle up from lying flat toward you of A at its middle, its free end ahead of
      // that by B (curling, as it is lifted by that end), never past max. A strip seen from above shows the sheet's face; from
      // below, its back. The page is laid on it strip by strip, each strip of the page's canvas set square on its strip of the
      // sheet; then the light on that strip as on the shelf, a little less as it stands up out of it
      const sheet = (A, B, max) => {
        const pts = [[AX, AY]];
        let d = AX, y = AY;
        for (let i = 0; i < NB_N; i++) { const a = clamp(A + B * ((i + 0.5) / NB_N - 0.5), 0, max); d += Math.cos(a) * NB.len / NB_N; y += Math.sin(a) * NB.len / NB_N; pts.push([d, y]); }
        return pts;
      };
      const scr = (u, d, y) => { const w = at3(u, y, d); return R.screenPos(w[0], w[1], w[2]); };
      const path = (ctx, q, grow) => {
        const cx = (q[0].x + q[1].x + q[2].x + q[3].x) / 4, cy = (q[0].y + q[1].y + q[2].y + q[3].y) / 4;
        ctx.beginPath();
        q.forEach((v, i) => { const l = Math.hypot(v.x - cx, v.y - cy) || 1, x = v.x + (v.x - cx) / l * (grow || 0), y = v.y + (v.y - cy) / l * (grow || 0); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.closePath();
      };
      const FACE = { back: { tex: tex.back, base: '#d8ceb2' }, out: { tex: tex.out, base: '#4a281e' }, in: { tex: tex.in, base: '#8f8574' } };
      const pageFace = i => ({ tex: tex.pages[i], base: '#e3d9be' });
      const drawSheet = (ctx, P, pts, front, back, plain) => {
        const Lp = pts.map(p => scr(NB.u0, p[0], p[1])), Rp = pts.map(p => scr(NB.u1, p[0], p[1]));
        if (Lp.some(q => !q) || Rp.some(q => !q)) return null;
        // the light on a strip: as on the shelf lying flat, a little less as it stands up out of it, less still on its back;
        // a sheet lying flat (or standing, unbent) has it all over at once, so no seam shows between its strips
        const shadeOf = (i, up) => P.col(scalec([255, 255, 255], (up ? 1 : 0.88) - 0.22 * Math.sin(clamp(Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]), 0, Math.PI / 2))));
        const isUp = i => (Rp[i].x - Lp[i].x) * (Lp[i + 1].y - Lp[i].y) - (Rp[i].y - Lp[i].y) * (Lp[i + 1].x - Lp[i].x) > 0;
        const flat = pts.every((p, i) => !i || Math.abs(Math.atan2(p[1] - pts[i - 1][1], p[0] - pts[i - 1][0]) - Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0])) < 1e-6);
        for (let i = 0; i < NB_N; i++) { path(ctx, [Lp[i], Rp[i], Rp[i + 1], Lp[i + 1]], 0.6); ctx.fillStyle = (isUp(i) ? front : back).base; ctx.fill(); }   // (under the page, so no gap shows between strips)
        for (let i = 0; i < NB_N; i++) {
          const a = Lp[i], b = Rp[i], c = Lp[i + 1], d = Rp[i + 1], q = [a, b, d, c];
          const up = isUp(i), face = up ? front : back;
          ctx.save();
          if (!plain) {
            path(ctx, q, 0.6); ctx.clip();
            const y0 = i / NB_N * TH, h = TH / NB_N, ym = y0 + h / 2;
            const ux = (b.x - a.x + d.x - c.x) / 2 / TW, uy = (b.y - a.y + d.y - c.y) / 2 / TW, vx = (c.x - a.x + d.x - b.x) / 2 / h, vy = (c.y - a.y + d.y - b.y) / 2 / h;
            const cx = (a.x + b.x + c.x + d.x) / 4, cy = (a.y + b.y + c.y + d.y) / 4;
            ctx.transform(ux, uy, vx, vy, cx - ux * TW / 2 - vx * ym, cy - uy * TW / 2 - vy * ym);
            ctx.drawImage(face.tex, 0, y0, TW, h, 0, y0, TW, h);
          }
          ctx.restore();
          if (!flat) { ctx.save(); path(ctx, q); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = shadeOf(i, up); ctx.fill(); ctx.restore(); }
        }
        if (flat) {
          ctx.save(); ctx.beginPath(); Lp.concat(Rp.slice().reverse()).forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y))); ctx.closePath();
          ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = shadeOf(0, isUp(0)); ctx.fill(); ctx.restore();
        }
        return { Lp, Rp };
      };
      const drawNotebook = (ctx, P) => {
        const at = (u, d, y) => scr(u, d, y), E = AX + NB.len;
        // its shadow on the shelf; its near edge, the edges of the pages over the back board (and the cover's, shut)
        for (const [g, a] of [[0.006, 0.1], [0.003, 0.14], [0.001, 0.18]]) {
          const sh = [at(NB.u0 - g * 0.6, AX - g, NB.y + 0.0005), at(NB.u1 + g * 1.2, AX - g, NB.y + 0.0005), at(NB.u1 + g * 1.2, E + g, NB.y + 0.0005), at(NB.u0 - g * 0.6, E + g, NB.y + 0.0005)];
          if (sh.some(q => !q)) return;
          path(ctx, sh); ctx.fillStyle = 'rgba(0,0,0,' + a + ')'; ctx.fill();
        }
        const edge = (y0, y1, col) => { const q = [at(NB.u0, E, y0), at(NB.u1, E, y0), at(NB.u1, E, y1), at(NB.u0, E, y1)]; if (q.every(v => v)) { path(ctx, q); ctx.fillStyle = P.col(col); ctx.fill(); } };
        edge(NB.y, AY, [200, 190, 164]);
        for (let k = 1; k < 4; k++) edge(NB.y + NB.th * k / 4.4, NB.y + NB.th * k / 4.4 + 0.0004, [150, 140, 116]);
        edge(NB.y, NB.y + 0.0016, [62, 30, 24]);
        const block = s.nbAnims.find(a => a.item === 'block'), moving = new Set(s.nbAnims.map(a => a.item));
        if (!s.nbOpen) edge(AY - 0.0014, AY, [74, 36, 28]);
        // what lies open on top: the cover, shut, or the page you are on
        const top = drawSheet(ctx, P, sheet(0, 0, 0), s.nbOpen ? pageFace(s.page) : FACE.out, FACE.back);
        if (top) {
          const xs = top.Lp.concat(top.Rp).map(q => q.x), ys = top.Lp.concat(top.Rp).map(q => q.y);
          s.nbRect = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
        }
        // those turned over, standing against the wall, the last turned nearest
        if (s.nbOpen && !block) {
          const up = moving.has('cover') ? [] : ['cover'];
          for (let i = 0; i < s.page; i++) if (!moving.has(i)) up.push(i);
          up.forEach((it, j) => {
            const k = it === 'cover' ? 0 : it + 1, last = j === up.length - 1;
            const r = drawSheet(ctx, P, sheet(restOf(k), 0, restOf(k)), it === 'cover' ? FACE.out : pageFace(it), it === 'cover' ? FACE.in : FACE.back, !last);
            if (r && !last) { ctx.strokeStyle = P.col([120, 110, 90]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.Lp[NB_N].x, r.Lp[NB_N].y); ctx.lineTo(r.Rp[NB_N].x, r.Rp[NB_N].y); ctx.stroke(); }
          });
        }
        // what is going over now
        for (const a of s.nbAnims) {
          const k = clamp((L.t - a.t0) / NB_T[nbKind(a)], 0, 1), e = smoothstep(k), bend = Math.sin(Math.PI * k);
          if (a.item === 'block') drawSheet(ctx, P, sheet(restOf(s.page) * (1 - e), -0.5 * bend, REST), FACE.out, FACE.back);
          else if (a.item === 'cover') drawSheet(ctx, P, sheet(REST * e, 0.9 * bend, REST), FACE.out, FACE.in);
          else drawSheet(ctx, P, sheet(restOf(a.item + 1) * e, 0.9 * bend, restOf(a.item + 1)), pageFace(a.item), FACE.back);
        }
        // the spiral: a turn of wire through each hole, each a little on from the last
        const lw = q => Math.max(0.8, 0.0014 * q.scale);
        for (let r = 0; r < RINGS; r++) {
          const u = NB.u0 + (r + 0.5) / RINGS * (NB.u1 - NB.u0), pts = [];
          for (let i = 0; i <= 18; i++) { const a = i / 18 * TAU, q = at(u + (i / 18 - 0.5) * 0.005, AX + 0.0005 + Math.cos(a) * 0.0058, AY + 0.0008 + Math.sin(a) * 0.0058); if (!q) break; pts.push(q); }
          if (pts.length < 19) continue;
          for (const [col, w] of [[[58, 58, 64], 1.7], [[184, 184, 192], 1]]) {
            ctx.strokeStyle = P.col(col); ctx.lineWidth = lw(pts[0]) * w; ctx.lineCap = 'round'; ctx.beginPath();
            pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
          }
        }
      };
      // drawn as one thing, after the shelf it lies on and before what is nearer (the cord of the lifted receiver)
      const nbAt = at3(uC, NB.y, AX + NB.len / 2);
      const nbSprite = { kind: 'sprite', x: nbAt[0], y: nbAt[1], z: nbAt[2], w: NB.u1 - NB.u0, h: 0.2, sortDist: WD - dN - 0.01, draw: (ctx, P, sc) => {
        const m = ctx.getTransform(), b = R.screenPos(nbSprite.x, nbSprite.y, nbSprite.z);   // its own transform, back to the view's pixels
        if (!b) return;
        const dpr = m.a / sc;
        ctx.setTransform(dpr, 0, 0, dpr, m.e - b.x * dpr, m.f - b.y * dpr);
        drawNotebook(ctx, P);
      } };
      const sm = () => L.creatures[0];
      // ---------------- the shadow: from lamp to lamp ----------------
      // Its way in is laid out once (planMan), from the street it comes down and every lamp along it, and fitted to the time
      // it has (c.T, in which the thing used to walk the whole way at a steady pace, so the race with the phone is as it
      // was): it starts behind the very last lamp, the furthest down its street, and at each lamp stands a few seconds lit by
      // it, utterly still, then reaches up (UP), takes hold (GRIP), breaks it, lets its arm come back down (DOWN) and stands a
      // beat in the dark (BEAT); then it skitters on, low and far too fast, to the next one nearer. With every lamp on the
      // street to get through it is quick about all of it. After the last it comes across to the glass at a walk. Behind a
      // lamp is just past its post as the eye sees it, and a little to one side (PEER), peering round it. Where it is: a
      // distance down its lane (its distFn) and a step to one side of it (c.side, the creature's lateral), with its feet on
      // the road or up on the pavement (c.yOff)
      const UP = 0.6, GRIP = 0.2, DOWN = 0.4, BEAT = 0.3, RUSH_V = 11, WALK_V = 2.0, PEER = 0.2;
      const gap = (a, b) => Math.hypot(a.d - b.d, a.lat - b.lat);
      const groundAt = (x, z) => ((z > 1 && z < 8) || (z >= 8 && Math.abs(x) < 3.5)) ? ROAD : 0;
      // a place in the night as it is along a lane: how far down it, and how far to the side
      const laneOf = (ln, x, z) => ({ d: x * ln.dirX + z * ln.dirZ, lat: x * Math.cos(ln.yaw) - z * Math.sin(ln.yaw) });
      const planMan = c => {
        const ln = c.lane, street = ln.deg === 0 ? 0 : 1, toLane = (x, z) => laneOf(ln, x, z);
        // (behind the post, and a little to the street side of it as the eye sees it: peering round it, the post across one
        // arm and its face clear of it)
        const stops = lamps.filter(lp => lp.street === street).map(lp => {
          const D = Math.hypot(lp.x, lp.z), k = 1 + 0.6 / D, px = -lp.z / D * PEER, pz = lp.x / D * PEER;
          const a = toLane(lp.x * k + px, lp.z * k + pz), b = toLane(lp.x * k - px, lp.z * k - pz);
          return Object.assign({ lamp: lp }, Math.abs(a.lat) < Math.abs(b.lat) ? a : b);
        }).sort((a, b) => b.d - a.d);
        if (!stops.length) stops.push({ lamp: null, d: c.D0, lat: 0 });
        // after the last lamp: up the main street, straight across it to the door; along the cross street, over the road to
        // the booth's own pavement, and along it to the east pane
        const fin = street === 0 ? [{ d: 1.5, lat: 0.3 }] : [{ d: 7.5, lat: -0.45 }, { d: 1.5, lat: -0.2 }];
        const n = stops.length, rushT = [], walk = [stops[n - 1]].concat(fin);
        for (let i = 0; i + 1 < n; i++) rushT.push(Math.max(1.0, gap(stops[i], stops[i + 1]) / RUSH_V));
        let walkLen = 0;
        for (let i = 0; i + 1 < walk.length; i++) walkLen += gap(walk[i], walk[i + 1]);
        const rushSum = rushT.reduce((a, b) => a + b, 0), act = UP + GRIP + DOWN + BEAT;
        const wait = clamp((c.T - rushSum - walkLen / WALK_V) / n - act, 1.2, 5);
        const walkT = clamp(c.T - rushSum - n * (wait + act), walkLen / 3, walkLen / 0.8);
        const segs = [];
        let t = 0;
        stops.forEach((st, i) => {
          segs.push({ kind: 'stop', t0: t, t1: t + wait + act, st, wait }); t += wait + act;
          if (i + 1 < n) { segs.push({ kind: 'rush', t0: t, t1: t + rushT[i], a: st, b: stops[i + 1] }); t += rushT[i]; }
        });
        segs.push({ kind: 'walk', t0: t, t1: t + walkT, pts: walk, len: walkLen });
        return { t0: L.t, segs, stops, wait, arrive: t + walkT, d: stops[0].d, lat: stops[0].lat, seg: null };
      };
      // where on it the lamp it stands at is, in its own frame (across and up from its feet, in metres where it stands), for
      // its hand to go to
      const reachFor = (c, st) => {
        const lp = st.lamp; if (!lp) return null;
        const P = APPROACH.position(c.lane, st.d, st.lat, L.eyeH), D = Math.hypot(P.x, P.z), fx = P.x / D, fz = P.z / D;
        const k = D / (lp.hx * fx + lp.hz * fz);
        return { x: (lp.hx * fz - lp.hz * fx) * k, y: L.eyeH + (4.8 - L.eyeH) * k - groundAt(P.x, P.z) };
      };
      // where it is now on its way, and what it is doing there (c.lampLit: how lit it is by the lamp it stands behind)
      const manNow = c => manAt(c, L.t - s.man.t0);
      // (e: how far into its way it is, in its own time)
      const manAt = (c, e) => {
        const m = s.man, seg = m.segs.find(g => e < g.t1) || m.segs[m.segs.length - 1];
        if (seg !== m.seg) { m.seg = seg; if (seg.kind === 'stop') { c.reachTo = reachFor(c, seg.st); c.reachSide = c.reachTo && c.reachTo.x < 0 ? -1 : 1; } }
        let reach = 0, rush = 0, dark = true, grip = 0, lampLit = 0, wob = 0;
        if (seg.kind === 'stop') {
          const lp = seg.st.lamp, up = e - seg.t0 - seg.wait;
          m.d = seg.st.d; m.lat = seg.st.lat;
          if (lp && c.reachTo) {
            if (up >= UP + GRIP && lp.outAt === undefined) breakLamp(lp);
            reach = up < 0 ? 0 : up < UP ? smoothstep(up / UP) : up < UP + GRIP ? 1 : 1 - smoothstep((up - UP - GRIP) / DOWN);
            grip = up >= UP * 0.8 && up < UP + GRIP + 0.15 ? 1 : 0;
          }
          dark = !!lp && lp.outAt !== undefined && L.t - lp.outAt > 0.3;
          lampLit = lp ? Math.min(1.4, lampLevel(lp)) : 0;   // (the lamp it stands behind: a rim of it along its shoulder, never its face)
        } else if (seg.kind === 'rush') {
          // skittering: in bursts, all but stopping between them, and twitching from side to side
          const k = clamp((e - seg.t0) / (seg.t1 - seg.t0), 0, 1), sk = smoothstep(k), nb = Math.max(2, Math.round(gap(seg.a, seg.b) / 4));
          const q = sk - 0.85 * Math.sin(TAU * nb * sk) / (TAU * nb);
          wob = Math.sin(k * nb * 9.7) * Math.sin(Math.PI * k) * 0.22;
          m.d = lerp(seg.a.d, seg.b.d, q); m.lat = lerp(seg.a.lat, seg.b.lat, q); rush = Math.sin(Math.PI * k);
        } else {
          let left = clamp((e - seg.t0) / (seg.t1 - seg.t0), 0, 1) * seg.len, i = 0;
          while (i + 2 < seg.pts.length && left > gap(seg.pts[i], seg.pts[i + 1])) { left -= gap(seg.pts[i], seg.pts[i + 1]); i++; }
          const a = seg.pts[i], b = seg.pts[i + 1], q = clamp(left / (gap(a, b) || 1), 0, 1);
          m.d = lerp(a.d, b.d, q); m.lat = lerp(a.lat, b.lat, q);
        }
        Object.assign(c, { reach, rush, dark, grip, lampLit, side: m.lat + wob });
      };
      // the car coming: the moment it starts down the street it scurries (skittering, low, as between lamps) to the nearest
      // lamp post on its own street, wherever it is on its way, and gets behind it; there it stops, dead still, looking back
      // at you, and waits (a second at the least) until the car has pulled up and its door swings open: only then does it
      // turn its back and walk off down the pavement the way it came. Every lamp stands on a pavement, clear of the road the
      // car comes along, and its way off keeps to that pavement, so it is never where the car is. s.flee: toPost's { t0,
      // from, to (the place behind the post), rushT }, and leaveAt (set once it goes: the door open and its second stood)
      const FLEE = { pause: 1.0, walk: 1.4, min: 0.35 };
      // its way from where it is now to the post nearest it on its own street (broken or not: a post is a post)
      const toPost = () => {
        const m = s.man, from = { d: m.d, lat: m.lat };
        const to = m.stops.reduce((b, st) => (gap(st, from) < gap(b, from) ? st : b), m.stops[0]);
        return { t0: L.t, from, to, rushT: gap(to, from) < 0.05 ? 0 : Math.max(FLEE.min, gap(to, from) / RUSH_V) };
      };
      // on that way: skittering for the post, in bursts, twitching from side to side; then behind it, still, its head round
      // to you (true once it is there)
      const atPost = (c, f) => {
        const m = s.man, e = L.t - f.t0;
        c.wob = 0;
        if (e < f.rushT) {
          const k = clamp(e / f.rushT, 0, 1), sk = smoothstep(k), nb = Math.max(1, Math.round(gap(f.from, f.to) / 4));
          const q = sk - 0.85 * Math.sin(TAU * nb * sk) / (TAU * nb);
          c.wob = Math.sin(k * nb * 9.7) * Math.sin(Math.PI * k) * 0.12;
          m.d = lerp(f.from.d, f.to.d, q); m.lat = lerp(f.from.lat, f.to.lat, q); c.rush = Math.sin(Math.PI * k);
          return false;
        }
        m.d = f.to.d; m.lat = f.to.lat;
        if (!f.looked) { f.looked = true; c.lookT = c.t; }
        return true;
      };
      const startFlee = c => {
        s.flee = Object.assign(toPost(), { leaveAt: undefined });
        c.hold = null; c.distFn = () => s.man.d;
      };
      const fleeNow = c => {
        const f = s.flee, m = s.man, e = L.t - f.t0;
        if (f.leaveAt === undefined || e < f.leaveAt) {   // behind the post till the door opens
          if (atPost(c, f) && f.leaveAt === undefined && e >= f.rushT + FLEE.pause && s.end && s.end.doorT !== undefined) f.leaveAt = e;
        } else {   // and off down the pavement, its back to you
          c.wob = 0;
          if (!c.away) { c.away = true; c.frozen = true; }
          m.d = f.to.d + (e - f.leaveAt) * FLEE.walk; m.lat = f.to.lat;
        }
      };
      // The police (911, copBegin): sent, they come only once it has got to the last lamp on its way in, or past it
      // (pastLast; then copSetOff, and the police car's part, copRun, below the car). From then until it has seen them off
      // it is theirs to move (copHolds, copMan): at that lamp it goes on as it would until its time there is up, and then
      // stands there in the dark; were it past the lamp already it skitters back behind the post. Once the car is braking for
      // it, it stands dead still (an arm reaching for the lamp comes back down), and the flashlight finds it there. The instant
      // that light is on it, it convulses, a second of it (COP.conv, up to the jump; c.convulse: twisting, its limbs jerking at wrong
      // angles and its head snapping from side to side, a slow writhe with reduced motion), with a shriek tearing upward
      // (shadeShriek). Then it jumps out in front of the post at the car, upright, its head split open into its petals of
      // teeth at it, its arms up and its tentacles out (c.scare, toward c.scareSide on the view), with a snarl, high and
      // gravelly (growlHigh), and the lamp over it pops if it still burned. Once the car
      // has gone off it shuts, skitters back behind its post and stands there in the dark, hidden, for COP.hide seconds
      // (s.cop.hide: { t0, until }; long enough to hang up on the dispatcher, lift the receiver, put the coin in, dial the
      // right number and have it answered, with a few seconds over: the night can still be won there); then it comes on
      // for you: across to the glass, as it would have from the lamp (its walk). s.cop.back: toPost's { t0, from, to, rushT }, back to the post; s.cop.from: where it jumps from
      const lastStop = () => s.man.stops[s.man.stops.length - 1];
      const lastIdx = () => s.man.segs.findIndex(g => g.kind === 'stop' && g.st === lastStop());
      const pastLast = () => !!s.man && !!s.man.seg && s.man.segs.indexOf(s.man.seg) >= lastIdx();
      const copHolds = () => !!s.cop && s.cop.phase !== 'wait' && !s.cop.manDone;
      const copMan = (c, dt) => {
        const K = s.cop, m = s.man, Q = K.q, lp = lastStop().lamp, sc0 = K.scareT;
        c.wob = 0; c.rush = 0; c.torch = K.torch; c.scareSide = Q.scareSide;
        if (K.t < sc0) {
          if (K.back) {   // past the lamp when they came: back behind its post, skittering, and there it stands
            const there = atPost(c, K.back);
            c.reach = 0; c.grip = 0; c.dark = !there || !lp || lp.outAt !== undefined; c.lampLit = there && lp ? Math.min(1.4, lampLevel(lp)) : 0;
          } else if (K.t < K.tc) {   // at the lamp: as it would be, until its time there is up
            manAt(c, Math.min(L.t - m.t0, m.segs[lastIdx()].t1 - 0.001));
          } else {   // the car braking for it: dead still
            c.reach = Math.max(0, (c.reach || 0) - dt * 2.5); c.grip = 0;
            c.lampLit = lp ? Math.min(1.4, lampLevel(lp)) : 0; c.dark = !lp || (lp.outAt !== undefined && L.t - lp.outAt > 0.3);
          }
          K.from = { d: m.d, lat: m.lat }; c.side = m.lat; c.hop = 0; c.scare = 0;
          // in the flashlight, the last of its time there: it convulses, with a shriek
          const cv = K.t - (sc0 - COP.conv);
          if (cv >= 0 && !K.shrieked) { K.shrieked = true; AUDIO.sfx('shadeShriek', carPan(c.pos())); }
          c.convulse = smoothstep(clamp(cv / (SAVE.data.settings.reducedMotion ? 0.6 : 0.12), 0, 1));   // (reduced motion: it comes on slowly, a writhe)
          return;
        }
        // out in front of the post, at the car: a spring out of its convulsion, a snarl (and the lamp over it popping), and
        // its head opened at it
        const e = K.t - sc0, still = SAVE.data.settings.reducedMotion, k = clamp(e / COP.jump, 0, 1), q = smoothstep(k);
        m.d = lerp(K.from.d, Q.jumpTo.d, q); m.lat = lerp(K.from.lat, Q.jumpTo.lat, q); c.side = m.lat;
        c.hop = still ? 0 : Math.sin(Math.PI * k) * 0.3;
        c.reach = Math.max(0, (c.reach || 0) - dt * 4); c.grip = 0; c.lampLit = 0; c.dark = true;
        c.convulse = 1 - smoothstep(clamp(e / (COP.jump * 0.8), 0, 1));
        if (!K.snarled && e >= COP.jump * 0.6) { K.snarled = true; AUDIO.sfx('growlHigh', carPan(c.pos())); if (lp && lp.outAt === undefined) breakLamp(lp); }
        const end = COP.go + COP.hold;   // (from the jump: the car gone off, and it shuts)
        c.scare = smoothstep(clamp((e - COP.jump * 0.4) / 0.3, 0, 1)) * (1 - smoothstep(clamp((e - end) / 0.45, 0, 1)));
        if (e >= end + 0.45) {   // shut: back behind its post, skittering, to stand there hidden a while (COP.hide), and then on for you
          K.manDone = true; c.scare = 0; c.hop = 0; c.torch = 0; c.convulse = 0;
          const g = m.segs.find(w => w.kind === 'walk'), last = lastStop(), here = { d: m.d, lat: m.lat }, t0 = g.t0, len = g.t1 - g.t0;
          const rushT = Math.max(FLEE.min, gap(last, here) / RUSH_V);
          // (its way from here: a rush back to the post; a stop behind it with nothing to reach for, its lamp out; and its walk)
          K.hide = { t0: L.t, until: L.t + rushT + COP.hide };
          m.segs.splice(m.segs.indexOf(g), 0, { kind: 'rush', t0, t1: t0 + rushT, a: here, b: last }, { kind: 'stop', t0: t0 + rushT, t1: t0 + rushT + COP.hide, st: last, wait: COP.hide + 1, hide: true });
          g.t0 = t0 + rushT + COP.hide; g.t1 = g.t0 + len;
          m.t0 = L.t - t0; m.seg = null;
          manNow(c);
        }
      };
      // laid out the first time it is wanted (drawn on the night's card, or its first frame), and stood at its first lamp
      const manReady = () => {
        const c = sm();
        if (!c || s.man) return c;
        // (as it comes at you, whenever it does, it snarls: the high growl it has for the police, from the first frame of
        // it, with the glass breaking (the sting, played as it has you): not held back until its lunge begins, a third of
        // a second on)
        c.deathSpec = Object.assign({}, c.CR.death, { pose: cr => { if (!cr.snarled) { cr.snarled = true; AUDIO.sfx('growlHigh'); } } });
        s.man = planMan(c); c.distFn = () => s.man.d; c.dist = c.D0 = s.man.d; c.side = c.lat = s.man.lat;   // (from the last lamp: as far as it comes)
        const p = c.pos(); c.yOff = c.yFoot = groundAt(p.x, p.z) - c.lane.y; c.hop = 0;
        manNow(c);
        return c;
      };
      L.update = dt => {
        if (G.state === 'play' && !closeUp()) s.padSel = null;
        const c = manReady();
        if (c && !c.dead) {
          // (the police on their way to it, or at it: it waits for them at its last lamp, and sees them off, copMan)
          if (G.state === 'play' && !L.won) {
            if (s.cop && s.cop.phase === 'wait' && pastLast() && L.t - s.cop.sentAt >= COP.sent) copSetOff(c);
            if (copHolds()) copMan(c, dt); else manNow(c);
          } else if (!s.flee && copHolds()) copMan(c, dt);
          else { c.reach = Math.max(0, (c.reach || 0) - dt * 2); c.rush = 0; c.grip = 0; c.lampLit = Math.max(0, (c.lampLit || 0) - dt * 3); c.scare = Math.max(0, (c.scare || 0) - dt * 2); c.convulse = Math.max(0, (c.convulse || 0) - dt * 4); c.torch = 0; c.hop = 0; if (s.flee) fleeNow(c); c.side = s.man.lat + (c.wob || 0); }
          const p = c.pos();
          c.yFoot += (groundAt(p.x, p.z) - c.lane.y - c.yFoot) * Math.min(1, dt * 14);   // up the kerb and down it in a stride
          c.yOff = c.yFoot + (c.hop || 0);                                                 // (and off the ground, jumping)
        }
        lampsNow(dt);
        if (s.smoke.length) s.smoke = s.smoke.filter(p => L.t - p.t0 < p.life);
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
        nbUpdate();
        if (s.line === 'checking' && L.t - s.doneAt > 0.7) { s.line = 'dead'; AUDIO.sfx('noService'); G.say('The number you have dialled is not in service.', 'The number you have dialled is not in service.', 3.2); }
        if (s.line === 'connecting' && L.t - s.doneAt > 0.9) { s.line = 'ringing'; s.ringFrom = s.doneAt; s.nextRing = L.t + 3; AUDIO.sfx('ringback'); G.say('It is ringing.', 'It is ringing.'); }
        if (s.line === 'ringing' && L.t >= s.nextRing) { s.nextRing = L.t + 3; AUDIO.sfx('ringback'); }   // one ring every 3 s, only while it rings: hanging up stops it
        if (s.line === 'ringing' && L.t - s.ringFrom >= 7) {
          s.line = 'answered'; s.answeredAt = L.t; AUDIO.sfx('answer'); G.say('Someone picks up.', 'Someone picks up.', 3.5);
        }
        // 911: one ring, and a dispatcher answers at once (the night's easter egg, found: foundEgg). While the shade has
        // still to get to its last lamp she has four lines (DISPATCH), said one after another, each a crackle of a voice
        // and its words, which stay up a moment and go, and then a beat of quiet (a little over two seconds) for what you
        // say back, which is not heard (s.talk: { at: when the next is said, lines, i: the next of them }); once it is at
        // that lamp, or past it, there is only the last of them, at once, and if it gets there while she is still
        // talking the next thing she says is the last (so the police are always sent before it can come for you: it
        // stands at that lamp, and then walks, for longer than any of her beats). As she says the last the
        // police are sent (copBegin; they come, copSetOff, copRun), once a night: called again after that, the dispatcher
        // says a car has been sent already. Hanging up cuts her off: what she had not yet said is not said, and a car she
        // had not yet sent is not sent (called again, she starts over). The line stays open to the dispatcher
        // till you hang up; then the phone is as it was (a coin put in for it comes back: 911 is free)
        if (s.line === 'calling911' && !s.ring911 && L.t - s.doneAt > 0.9) { s.ring911 = true; AUDIO.sfx('ringback'); G.say('It is ringing.', 'It is ringing.'); }
        if (s.line === 'calling911' && L.t - s.doneAt > 2.7) {
          s.line = 'emergency'; s.answeredAt = L.t; s.called911 = true; foundEgg();
          if (s.cop) { AUDIO.sfx('dispatch'); G.say('A dispatcher answers, through the static. A car has already been sent.', 'A voice: a car has already been sent.', 3.5); }
          else s.talk = { at: L.t, i: 0, lines: DISPATCH };
        }
        if (s.talk && (s.line !== 'emergency' || G.state !== 'play' || L.won)) s.talk = null;
        while (s.talk && L.t >= s.talk.at) {
          const k = s.talk;
          if (pastLast()) k.i = k.lines.length - 1;   // (it is at its last lamp: no more questions)
          const [sfx, words, up, beat] = k.lines[k.i++], last = k.i === k.lines.length;
          AUDIO.sfx(sfx); G.toast(words, up); k.at += up + beat;
          if (last) { s.talk = null; if (c && !c.dead) copBegin(c); }   // (sent: it comes once it is at its last lamp)
        }
        if (s.cop) copRun(dt);
      };
      L.isWon = () => s.line === 'answered';
      // (caught once the police have been called, whatever else: they could not help)
      L.deathCause = () => s.called911 ? 'police' : (s.line === 'ringing' || s.line === 'connecting' || s.line === 'calling911') ? 'ringing' : s.line === 'dead' ? 'dead' : (s.hook === 'off' && !s.credit && s.deadKeys) ? 'nocoin' : null;

      // ---------------- facing the phone: the keys take the number keys and the d-pad ----------------
      // (nothing is done to the view: the phone is looked at as anything is, and its keys clicked where they are, or with the
      // zoom held)
      const closeUp = () => G.L === L && G.state === 'play' && G.cam.dirIdx === PHONE_DIR && G.cam.tPitch < PITCH_DOWN * 0.5;
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
        if (!s.padSel) {   // nothing highlighted yet: what is nearest the middle of the view, as A always does
          let bd = Infinity;
          for (const c of controls) { const w = ph(c.u, c.y, 0.11), p = R.screenPos(w[0], w[1], w[2]); const d = p ? Math.hypot(p.x - R.W / 2, p.y - R.H / 2) : Infinity; if (d < bd) { bd = d; s.padSel = c; } }
        }
        if (s.padSel) useTarget(s.padSel.t);
        return true;
      };

      // ---------------- input: the number keys while you face the phone ----------------
      const onKey = e => {
        if (G.L !== L || G.state !== 'play') return;
        const k = e.key;
        if (closeUp() && k && k.length === 1 && '0123456789*#'.includes(k)) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) press(k); }   // facing the phone the number keys press its keys instead of choosing what you hold
      };
      window.addEventListener('keydown', onKey, true);
      L.onEnd = () => window.removeEventListener('keydown', onKey, true);

      // ---------------- every frame: the receiver, its cord, the keys, the display, rain running down the glass ----------------
      const drops = [];
      const drng = mulberry32(4242);
      for (const [x0, z0, x1, z1, nx, nz] of [[XW, B, B, B, 0, 1], [B, B, B, -B, 1, 0], [B, -B, XW, -B, 0, -1], [XW, -B, XW, B, -1, 0]])
        for (let k = 0; k < 11; k++) drops.push({ x0, z0, x1, z1, nx, nz, u: 0.06 + drng() * 0.88, v: 0.04 + drng() * drng() * 0.4, ph: drng() * 10, len: 0.015 + drng() * 0.04 });
      // the cord: steel-armoured, out of the bottom of the housing. On the hook it hangs in a loop to the bottom of the
      // handset; lifted, it runs down over the front of the shelf in a loop and up into the bottom of the receiver in your
      // hand (liftedCord). It is a smooth curve through a few points (u, y, d, as on the phone) with a twist drawn along it
      // for the armour, in short lengths so that each is as thick as it is near
      const cord = (ctrl, sd) => {
        const out = [];
        ctrl = ctrl.map(([u, y, d]) => [d, y, u]);   // (worked along in d, y, u, and put on the phone at the end)
        for (let i = 0; i < ctrl.length - 1; i++) {
          const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)], seg = [];
          const n = Math.max(6, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]) / 0.009));   // a twist every centimetre or so
          for (let k = 0; k <= n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; seg.push([0, 1, 2].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
          const twist = seg.map((p, k) => { const q = seg[Math.min(n, k + 1)], r = seg[Math.max(0, k - 1)], dz = q[2] - r[2], dy = q[1] - r[1], l = Math.hypot(dz, dy) || 1, w = (k & 1 ? 1 : -1) * 0.0028; return [p[0], p[1] - dz / l * w, p[2] + dy / l * w]; });
          const w = pts => pts.map(p => ph(p[2], p[1], p[0]));
          out.push({ kind: 'poly', pts: w(seg), color: [54, 56, 62], stroke: true, lw: 0.0075 * PK, sortDist: sd - i * 0.0001 });
          out.push({ kind: 'poly', pts: w(twist), color: [124, 126, 132], stroke: true, lw: 0.0016 * PK, sortDist: sd - i * 0.0001 - 0.00005 });
        }
        return out;
      };
      const cordOn = cord([[0.06, HY0, 0.08], [0.064, 1.12, 0.09], [0.088, 1.075, 0.1], [0.118, 1.13, 0.11], [RX - 0.002, 1.31, 0.12]], FD - 0.035);
      // Lifted, the receiver is drawn in your right hand over the view (HANDS), not in the world, so the cord is made each
      // frame to end where it is drawn: the bottom of the receiver as it was last put on the view is taken back into the
      // world (at the distance at which the receiver, drawn that size, would be that size), and the cord runs from the
      // housing down in a loop below the shelf and up to that point, coming into the receiver along it. Whatever the view,
      // it meets the receiver; what of it is behind the eye is left out. (The same for the receiver going back up to its
      // hook, to the bottom of it as it goes.)
      const heldIcon = (ctx, P) => { handsetIcon(ctx, P); if (ctx.getTransform) s.heldXf = ctx.getTransform(); };
      L.overlay = ctx => {   // just after the hands: where the receiver was drawn, on the view
        if (!s.heldXf) return;
        const m = ctx.getTransform().invertSelf().multiply(s.heldXf);
        s.held = { m: [m.a, m.b, m.c, m.d, m.e, m.f], t: L.t }; s.heldXf = null;
      };
      const unproject = (sx, sy, D) => {   // the point at depth D (along the view) under (sx, sy) on the view
        const c = G.cam, xc = (sx - R.W / 2) / R.f, yc = -(sy - R.H / 2) / R.f;
        const cy = Math.cos(R.yaw), sy2 = Math.sin(R.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch), dy = yc * cp - sp, cz = yc * sp + cp;
        return [(xc * cy + cz * sy2) * D, L.eyeH + dy * D, (-xc * sy2 + cz * cy) * D];
      };
      const CORD_W = 0.0075 * PK, TWIST_W = 0.0016 * PK, HS_LEN = 0.44 * PK;
      const liftedCord = (end, away) => {
        // where it ends, and which way it comes into the receiver: in the hand, from how the receiver was drawn; going back
        // up to the hook, the bottom of the handset there; else just under the view below the hook
        let H, H2, wK = 1;
        if (away) {
          H = [away.x, away.y + 0.004, away.z]; H2 = [away.x, away.y - 0.06, away.z];
        } else if (end) {
          const [a, b, c, d, e, f] = end.m, at = (u, v) => [a * u + c * v + e, b * u + d * v + f];
          const px = Math.hypot(c, d) || 1, Dv = R.f * HS_LEN / px, Dh = clamp(Dv / (G.cam.zoom || 1), 0.45, 1.1);   // (at the size it is drawn; the zoom makes the world bigger, not your hand)
          const p = at(0, 0.035), q = at(0, -0.12);
          H = unproject(p[0], p[1], Dh); H2 = unproject(q[0], q[1], Dh); wK = Dh / Dv;
        } else {
          const u = underHook(); H = [u.x, u.y + 0.2, u.z]; H2 = [u.x, u.y, u.z];
        }
        const X0 = ph(0.06, HY0, 0.08), X1 = ph(0.115, 1.07, 0.16);   // (out of the housing and off to the right at once, past the notebook's edge: to your right hand)
        const B = [H2[0] + (H2[0] - H[0]) * 0.5, H2[1] - 0.16, H2[2] + (H2[2] - H[2]) * 0.5];
        const M = [(X1[0] + B[0]) / 2, Math.min(X1[1], B[1]) - 0.14, (X1[2] + B[2]) / 2];
        const ctrl = [X0, X1, M, B, H2, H], wks = [1, 1, 1, lerp(1, wK, 0.5), wK, wK];
        // the curve, a point every centimetre or so, with how thick it is drawn at each
        const pts = [], wk = [];
        for (let i = 0; i < ctrl.length - 1; i++) {
          const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
          const n = Math.max(4, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]) / (0.009 * PK)));
          for (let k = i ? 1 : 0; k <= n; k++) {
            const t = k / n, t2 = t * t, t3 = t2 * t;
            pts.push([0, 1, 2].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
            wk.push(lerp(wks[i], wks[i + 1], t));
          }
        }
        s.cordPts = pts;   // (where it runs, for the night's test: clear of the notebook)
        // the twist, across it as the eye sees it; and the runs of it in front of the eye, in short lengths
        const ey = L.eyeH, out = [];
        const tw = pts.map((p, k) => {
          const q = pts[Math.min(pts.length - 1, k + 1)], r = pts[Math.max(0, k - 1)], t = [q[0] - r[0], q[1] - r[1], q[2] - r[2]], v = [p[0], p[1] - ey, p[2]];
          const x = [t[1] * v[2] - t[2] * v[1], t[2] * v[0] - t[0] * v[2], t[0] * v[1] - t[1] * v[0]], l = Math.hypot(x[0], x[1], x[2]) || 1, w = (k & 1 ? 1 : -1) * 0.0028 * PK;
          return [p[0] + x[0] / l * w, p[1] + x[1] / l * w, p[2] + x[2] / l * w];
        });
        const seen = pts.map(p => { const q = R.screenPos(p[0], p[1], p[2]); return !!q && q.depth > 0.08; });
        let run = [];
        const flush = () => {
          if (run.length >= 2) {
            const i = run[0], j = run[run.length - 1], k = (wk[i] + wk[j]) / 2, sd = 0.3 - out.length * 0.00005;
            out.push({ kind: 'poly', pts: run.map(m => pts[m]), color: [54, 56, 62], stroke: true, lw: CORD_W * k, sortDist: sd });
            out.push({ kind: 'poly', pts: run.map(m => tw[m]), color: [124, 126, 132], stroke: true, lw: TWIST_W * k, sortDist: sd - 0.00002 });
          }
          run = run.length && run.length >= 8 ? [run[run.length - 1]] : [];
        };
        for (let m = 0; m < pts.length; m++) {
          if (!seen[m]) { flush(); run = []; continue; }
          run.push(m);
          if (run.length >= 8) flush();
        }
        flush();
        return out;
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
      const handset = phSprite(RX, 1.3, 0.13, 0.1, 0.44, (ctx, P) => { ctx.scale(0.1, 0.44); handsetIcon(ctx, P); }, { sortDist: FD - 0.04 });
      // lifted, it is in your right hand (the side its hook is on), held up toward your ear, its cord running down out of
      // the view to it; it goes off the hook down to the hand, and back up to the hook from it (HANDSET_T), the hand going
      // down out of the way first. What you hold (the coin) is in your left, on the other side of the view (L.handSide)
      const HANDSET_T = 0.24;
      const handsetItem = { id: 'handset', name: 'Receiver', w: 0.1, h: 0.44, icon: heldIcon, held: { grip: 'fist', at: [0, 0.48], axis: 0, angle: 0.55, size: 0.32, y: -0.03 } };
      L.handSide = -1;
      L.offHand = () => (s.hook === 'off' && L.t - s.handsetT > HANDSET_T * 0.8 ? handsetItem : null);
      // off its hook it goes down out of the bottom of the view, toward you (to the hand that then comes up with it), and back
      // up from there: a point just under the view, below the hook, a little nearer than the hook
      const hookAt = ph(RX, 1.3, 0.13);
      const underHook = () => {
        const c = G.cam, f = R.f, q = R.screenPos(hookAt[0], hookAt[1] + 0.22 * PK, hookAt[2]), xc = ((q ? q.x : R.W * 0.7) - R.W / 2) / f, yc = -(R.H * 1.3 - R.H / 2) / f;
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
        return SC.mkSprite(L, 0, 0, 0, 0.1 * PK, 0.44 * PK, (ctx, P) => { ctx.scale(PK, PK); ctx.translate(0, 0.22); ctx.rotate(-tilt); ctx.scale(sc, sc); ctx.translate(0, -0.22); ctx.scale(0.1, 0.44); handsetIcon(ctx, P); }, { x: p.x, y: p.y, z: p.z, sortDist: Math.max(0.2, Math.hypot(p.x, p.z) * 0.8) });
      };
      // the empty cradle the handset hangs in, seen once it is lifted: a dark arm with a cup for each end, so what is left
      // to click (the hook) is a thing you can see, the shape of what was taken from it
      const cradle = phSprite(RX, 1.3, 0.13, 0.1, 0.44, (ctx, P) => {
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
        const top = s.line === 'dead' ? 'NOT IN SERVICE' : (s.line === 'checking' || s.line === 'connecting' || s.line === 'ringing' || s.line === 'calling911') ? 'CALLING' : s.line === 'answered' ? 'CONNECTED' : s.line === 'emergency' ? 'EMERGENCY' : 'CREDIT ' + (s.credit ? '10p' : '0p');
        const b = L.t - s.blinkAt, off = b >= 0 && b < 1.25 && Math.floor(b / 0.16) % 2 === 0;   // a press it will not take: the top line blinks at you
        return [off ? '' : top, fmt(s.dialed.slice(0, Math.max(0, s.dialed.length - s.lagN)))];
      };
      const lcd = phSprite((LCD.u0 + LCD.u1) / 2, LCD.y0, 0.1015, LCD.u1 - LCD.u0, LCD.y1 - LCD.y0, (ctx, P) => {
        const w = LCD.u1 - LCD.u0, h = LCD.y1 - LCD.y0, txt = lcdText();
        P_rect(ctx, -w / 2, 0, w, h, txt ? P.raw([140, 180, 124]) : P.col([38, 48, 40]));
        if (!txt) return;
        ctx.fillStyle = P.raw([20, 34, 22]); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        // each line at its own size, or smaller if that is what it takes to stay inside the screen (a whole number dialled
        // comes down a little), never past its right edge
        const PAD = 0.006, room = w - 2 * PAD;
        const line = (text, y, font, k) => {
          if (!text) return;
          ctx.font = font;
          const tw = ctx.measureText(text).width;
          if (tw * k > room) k = room / tw;
          ctx.save(); ctx.translate(-w / 2 + PAD, y); ctx.scale(k, -k); inkText(ctx, text, 0, 0); ctx.restore();
        };
        line(txt[0], h - 0.016, 'bold 20px Arial, Helvetica, sans-serif', 0.0006);
        line(txt[1], 0.01, 'bold 20px "Courier New", "Liberation Mono", monospace', 0.00125);
      }, { sortDist: FD - 0.016, noLight: true });
      // the front lip of the coin return, drawn over a coin lying in it
      const lip = SC.mkQuad(L, ph(RET.u0 + 0.008, RET.y0 + 0.006, 0.104), ph(RET.u1 - 0.008, RET.y0 + 0.006, 0.104), ph(RET.u1 - 0.008, RET.y0 + 0.017, 0.104), ph(RET.u0 + 0.008, RET.y0 + 0.017, 0.104), [150, 154, 162], { sortDist: FD - 0.035 });
      glowWith(slot, slotArt); glowWith(ret, retArt.concat(lip)); glowWith(receiver, [handset, cradle]);
      // the gamepad's highlight: what it is on glows, as it does under the pointer
      L.highlight = () => (closeUp() && s.padSel ? s.padSel.t : null);
      L.dynamic = () => {
        sync(); manReady();
        for (const p of sparkParts()) R.add(p);
        const away = handsetAway(), off = s.hook === 'off' || !!away;   // off its hook (or on its way back to it)
        const hy = off ? 1.695 : 1.645;   // the hook rises when the weight comes off it
        if (off) R.add(cradle);
        R.add(SC.mkQuad(L, ph(HW, hy, 0.088), ph(HW + 0.03, hy, 0.088), ph(HW + 0.03, hy + 0.018, 0.088), ph(HW, hy + 0.018, 0.088), [150, 154, 160], { sortDist: FD - 0.03, glowOf: receiver }));   // the hook
        R.add(SC.mkQuad(L, ph(HW + 0.03, hy - 0.01, 0.088), ph(HW + 0.038, hy - 0.01, 0.088), ph(HW + 0.038, hy + 0.018, 0.088), ph(HW + 0.03, hy + 0.018, 0.088), [120, 124, 130], { sortDist: FD - 0.031, glowOf: receiver }));
        if (!off) R.add(handset);
        if (away && away !== true) R.add(away);
        for (const c of !off ? cordOn : liftedCord(s.held && L.t - s.held.t < 0.2 ? s.held : null, away && away !== true ? away : null)) R.add(c);
        nbSprite.glowOf = notebook; R.add(nbSprite);
        for (const k of keys) R.add(k.spr);
        R.add(lcd); R.add(lip);
        // rain on the outside of the glass: thin runs, each sliding down at its own pace with a bead of water at its foot
        for (const d of drops) {
          const x = d.x0 + (d.x1 - d.x0) * d.u + d.nx * 0.012, z = d.z0 + (d.z1 - d.z0) * d.u + d.nz * 0.012;
          const y = 2.02 - ((L.t * d.v + d.ph) % 1.7);
          if (y < 0.3) continue;
          const at = (a, dy) => [x + d.nz * a, y + dy, z + d.nx * a];   // a along the pane, dy up it
          R.add({ kind: 'poly', pts: [at(-0.0008, d.len), at(0.0008, d.len), at(0.0009, 0.006), at(0.0026, 0.0032), at(0, 0), at(-0.0026, 0.0032), at(-0.0009, 0.006)].map(p => L.pt(p[0], p[1], p[2])), color: [196, 208, 228], alpha: 0.3, noFog: true, noLight: true });
        }
        if (s.end && s.end.pose) { s.end.drawn = carParts(s.end); for (const p of s.end.drawn) R.add(p); }   // (kept for the tests: what of the car was drawn, the open door's pieces marked door)
        if (s.cop && s.cop.pose) for (const p of carParts(s.cop)) R.add(p);   // (the police)
        if (s.cop) for (const p of copParts()) R.add(p);
        for (const p of shatterParts()) R.add(p);
      };
      // ---------------- the glass it comes through ----------------
      // The moment it has you (the glass sting), the pane between you and it goes: cracks run out from where it hits, across
      // the pane to its frame, in a few hundredths of a second; then, as it comes at you (a little before its lunge), the
      // middle bursts in, a flash, and the pieces come flying in at you, turning over and catching the light, and drop, while it comes through the hole. What is left in the
      // frame is a jagged rim round the hole and the cracks to the edges. With reduced motion fewer pieces, and they only
      // fall; the flash is the game's (held down with reduced flash).
      const GLASS_Y = [1.04, 2.06], CRACK = 0.08;
      const shatterParts = () => {
        const dying = G.state === 'dying' && G.deathCreature === sm(), c = sm();
        if (!dying && !(s.shat && G.state === 'dead')) return [];
        if (!s.shat) {
          // the pane it hits: the first the line from your eye to its face crosses (the door's, or the east pane)
          const p = c.pos(), fy = p.y + (c.yOff || 0) + c.CR.faceY, tn = p.z > 0.01 ? B / p.z : Infinity, te = p.x > 0.01 ? B / p.x : Infinity, t = Math.min(tn, te);
          const north = tn <= te, lo = north ? XW + 0.035 : -B + 0.035, hi = B - 0.035;
          const hu = clamp((north ? p.x : p.z) * t, lo + 0.12, hi - 0.12), hy = clamp(L.eyeH + (fy - L.eyeH) * t, GLASS_Y[0] + 0.18, GLASS_Y[1] - 0.16);
          const P3 = (u, y, n) => (north ? [u, y, B - (n || 0.004)] : [B - (n || 0.004), y, u]);   // (n: in from the glass)
          const rnd = mulberry32(4091 + Math.round(hu * 977)), reduced = SAVE.data.settings.reducedMotion;
          // the cracks: rays from the hit to the frame, each kinked a little, and two rings crossing them
          const rays = [];
          for (let i = 0; i < 11; i++) {
            const a = (i + rnd() * 0.7) / 11 * TAU, ca = Math.cos(a), sa = Math.sin(a);
            const lim = Math.min(ca > 0 ? (hi - hu) / ca : ca < 0 ? (lo - hu) / ca : 9, sa > 0 ? (GLASS_Y[1] - hy) / sa : sa < 0 ? (GLASS_Y[0] - hy) / sa : 9);
            const pts = [];
            for (let k = 0; k <= 5; k++) { const r = lim * k / 5, j = k && k < 5 ? (rnd() - 0.5) * 0.05 : 0; pts.push([hu + ca * r - sa * j, hy + sa * r + ca * j]); }
            rays.push({ a, lim, pts });
          }
          const shards = [];
          for (let i = 0; i < (reduced ? 8 : 26); i++) {
            const r = 0.02 + rnd() * 0.2, a = rnd() * TAU, sz = 0.014 + rnd() * 0.032;
            const tri = [0, 1, 2].map(k => { const b = (k + rnd() * 0.5) / 3 * TAU; return [Math.cos(b) * sz * (0.6 + rnd() * 0.6), Math.sin(b) * sz * (0.6 + rnd() * 0.8)]; });
            shards.push({ u: clamp(hu + Math.cos(a) * r, lo, hi), y: clamp(hy + Math.sin(a) * r, GLASS_Y[0], GLASS_Y[1]), tri,
              vin: reduced ? 0.1 + rnd() * 0.15 : 0.35 + rnd() * 1.1, vu: (reduced ? 0.1 : 0.8) * Math.cos(a) * rnd(), vy: reduced ? 0 : -0.2 + rnd() * 0.9,
              spin: reduced ? 0 : (rnd() - 0.5) * 16, flip: reduced ? 0 : 3 + rnd() * 8, delay: rnd() * 0.08 });
          }
          const rim = [];
          for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = (k % 2 ? 0.08 : 0.15) + rnd() * 0.05; rim.push([clamp(hu + Math.cos(a) * r, lo, hi), clamp(hy + Math.sin(a) * r, GLASS_Y[0], GLASS_Y[1])]); }
          s.shat = { P3, rays, shards, rim, north, hu, hy, e: 0 };
        }
        const S = s.shat, P3 = S.P3, out = [], W = q => L.pt(q[0], q[1], q[2]);
        if (dying) S.e = G.stateT;
        const BURST = c.CR.death.delay * 0.8, e = S.e, grow = smoothstep(Math.min(1, e / CRACK)), burst = e >= BURST;
        if (burst && !S.flashed) { S.flashed = true; G.flash(SAVE.data.settings.reducedFlash ? 0.12 : 0.45); }
        const near = Math.hypot(...P3(S.hu, S.hy)) - 0.02, fx = { noFog: true, noLight: true };
        // the cracks, running out to the frame
        for (const r of S.rays) {
          const n = r.pts.length - 1, upto = grow * n, pts = [];
          for (let k = 0; k <= Math.ceil(upto); k++) { const q = Math.min(1, upto - k + 1), a = r.pts[Math.max(0, k - 1)], b = r.pts[k]; pts.push(k ? [lerp(a[0], b[0], q), lerp(a[1], b[1], q)] : b); }
          if (pts.length > 1) out.push(Object.assign({ kind: 'poly', pts: pts.map(q => W(P3(q[0], q[1]))), stroke: true, lw: 0.0028, color: [236, 242, 250], alpha: 0.75, sortDist: near }, fx));
        }
        for (const rr of [0.09, 0.2]) {   // the rings, from ray to ray where both reach
          const ring = S.rays.filter(r => r.lim > rr && grow * r.lim > rr).map(r => [S.hu + Math.cos(r.a) * rr, S.hy + Math.sin(r.a) * rr]);
          if (ring.length > 2) out.push(Object.assign({ kind: 'poly', pts: ring.concat([ring[0]]).map(q => W(P3(q[0], q[1]))), stroke: true, lw: 0.0022, color: [226, 234, 244], alpha: 0.55, sortDist: near }, fx));
        }
        if (!burst) return out;
        // the hole: its jagged rim, and the glass round it gone white with crazing
        out.push(Object.assign({ kind: 'poly', pts: S.rim.concat([S.rim[0]]).map(q => W(P3(q[0], q[1]))), stroke: true, lw: 0.0035, color: [244, 248, 255], alpha: 0.8, sortDist: near - 0.001 }, fx));
        // the pieces, flying in at you and dropping, turning over as they go
        const te = e - BURST;
        for (const sh of S.shards) {
          const t = Math.max(0, te - sh.delay), a = sh.spin * t, f = Math.cos(sh.flip * t), g = Math.sin(sh.flip * t);
          const cu = sh.u + sh.vu * t, cy = sh.y + sh.vy * t - 4.9 * t * t, cn = 0.004 + sh.vin * t;
          if (cy < 0.05) continue;
          const pts = sh.tri.map(([x, y]) => { const rx = (x * Math.cos(a) - y * Math.sin(a)), ry = x * Math.sin(a) + y * Math.cos(a); return W(P3(cu + rx * f, cy + ry, cn + rx * g)); });
          const d = Math.hypot(...P3(cu, cy, cn)), fade = clamp(1.6 - t, 0, 1);
          if (cn > 0.62) continue;   // (past your eye)
          out.push(Object.assign({ kind: 'poly', pts, color: [196, 212, 232], alpha: 0.35 * fade, sortDist: d }, fx));
          out.push(Object.assign({ kind: 'poly', pts: pts.concat([pts[0]]), stroke: true, lw: 0.0022, color: [240, 246, 255], alpha: 0.9 * fade * (0.5 + 0.5 * Math.abs(f)), sortDist: d - 0.001 }, fx));
        }
        return out;
      };

      // ---------------- the car that comes for you ----------------
      // Once someone has picked up, a car comes fast down its street, passing it, and pulls up hard at the kerb by the booth
      // with its back door to you: down the main street in its left-hand lane, left round the corner and across to the kerb
      // a few steps east of the booth (so the door that opens is its right-hand one), or along the cross street from the east.
      // Either way it stands where it is seen whole through the east pane, door and all, and not right outside the glass
      // (where the eye would only look down on its roof) or along the pavement to the west (behind the pay phone). It sounds
      // its horn and the back door swings open on a lit inside, with someone at the wheel. The shade is off the road by then,
      // behind a lamp post (startFlee); were it ever in the car's way the car would stop short of it. It is built each frame from boxes in its own frame: a along it (forward), b
      // across it (to its left, or for the car that came round the corner, mirrored, to its right: toward the kerb either
      // way), y up from the road.
      const CAR = { col: [150, 140, 112], V: 20, BRAKE: 20, T0: 0.3, FROM: 50 };
      // The police car, called on 911 (copBegin, copSetOff): a black-and-white with a light bar on its roof (red one side,
      // blue the other) and its siren wailing, a wail at a time back to back (cyc). Once the shade has got to its last lamp
      // (and no sooner than sent after the dispatcher's last line began: her words are read before the siren comes up)
      // it comes down that street from far off (from) at V and screeches to a halt (brake: its braking distance) on the road
      // beside the post, its nose slewed in a little toward the kerb (slew). Its siren winds down at the end of the wail it
      // is in; then, each from there: a flashlight comes on at its window on that side and finds the shade (torchOn); the
      // shade convulses in its light (for conv, up to the jump) and jumps out at it (scare, the jump taking jump); and from
      // that, the flashlight goes off (torchOff) and the car
      // goes (go): its tyres spin (spin) and it is away (accel, up to vMax, and vTurn round the corner from the main street),
      // fishtailing from side to side (swerve: how far it swings either way, sway: how far it goes from one side to the
      // other and back), down the road and away out of sight (far). The shade shuts its head hold after it goes
      const COP = { sent: 1.5, cyc: 1.6, black: [26, 26, 30], white: [208, 208, 212], V: 17, from: 72, brake: 9, slew: 5 * DEG, torchOn: 0.6, find: 0.55, beam: 16 * DEG, conv: 1.0, jump: 0.28, torchOff: 0.7, go: 0.95, hold: 1.3, hide: 14, spin: 0.5, accel: 9, vMax: 25, vTurn: 11, far: 110, swerve: 0.8, sway: 14 };
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
      const carPt = (P, a, b, y) => { if (P.m) b = -b; return [P.x + a * P.fx - b * P.fz, ROAD + y - a * (P.dip || 0), P.z + a * P.fz + b * P.fx]; };   // (dip: its nose down, braking)
      // where along its path it has to stop: the end, or short of the shade (him) if its front would come within reach of it
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
      // (e: the car, s.end, or the police car going by, s.cop; e.t its own time, e.fade how far it is out of the rain)
      const carParts = e => {
        const P = e.pose, out = [], col = e.cop ? COP.black : CAR.col, eye = [0, L.eyeH, 0];
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
        ], e.cop ? COP.white : col);
        if (cab[4]) cab[4].color = e.cop ? scalec(COP.white, 1.04) : [70, 64, 58];   // a dark vinyl roof (the police car's: white, as its cabin)
        // a point on a side of the cabin, k of the way along it (back to front) and h of the way up
        const cs = (sd, k, h) => [lerp(lerp(A0, A1, k), lerp(T0, T1, k), h), sd * lerp(BB, BT, h) + sd * 0.001, lerp(YB, YT, h)];
        for (const [f, sd] of [[cab[3], 1], [cab[2], -1]]) {
          on(f, [cs(sd, 0.06, 0.1), cs(sd, 0.47, 0.1), cs(sd, 0.47, 0.9), cs(sd, 0.08, 0.9)], glassC, glassO);   // the back side window
          on(f, [cs(sd, 0.52, 0.1), cs(sd, 0.95, 0.1), cs(sd, 0.9, 0.9), cs(sd, 0.52, 0.9)], glassC, glassO);    // the front one
        }
        const ce = (a0, a1, sd, h) => [lerp(a0, a1, h), sd * lerp(BB, BT, h) * 0.9, lerp(YB, YT, h)];   // a point on its sloping front or back
        on(cab[1], [ce(A1 + 0.002, T1 + 0.002, -1, 0.08), ce(A1 + 0.002, T1 + 0.002, 1, 0.08), ce(A1 + 0.002, T1 + 0.002, 1, 0.92), ce(A1 + 0.002, T1 + 0.002, -1, 0.92)], glassC, glassO);   // the windscreen
        on(cab[0], [ce(A0 - 0.002, T0 - 0.002, -1, 0.1), ce(A0 - 0.002, T0 - 0.002, 1, 0.1), ce(A0 - 0.002, T0 - 0.002, 1, 0.9), ce(A0 - 0.002, T0 - 0.002, -1, 0.9)], glassC, glassO);   // the back window
        // the police car's light bar across its roof: red one end, blue the other, each lit as barNow has it
        if (e.cop) {
          const lv = barNow(e), lamp = (k, on, off) => (k > 0.03 ? mixc(off, on, Math.min(1, k)) : off);
          box(-0.52, -0.22, -0.66, 0.66, YT, YT + 0.05, [14, 14, 16], { early: -0.2 });
          const seg = (b0, b1, on, off, k) => box(-0.5, -0.24, b0, b1, YT + 0.05, YT + 0.15, lamp(k, on, off), k > 0.03 ? { early: -0.25, noLight: true, noFog: true } : { early: -0.25 });
          seg(-0.62, -0.05, [255, 70, 60], [70, 18, 18], lv[0]); seg(0.05, 0.62, [90, 140, 255], [18, 26, 74], lv[1]);
          box(-0.5, -0.24, -0.05, 0.05, YT + 0.05, YT + 0.15, [30, 30, 34], { early: -0.25 });
        }
        // someone at the wheel, on the right: a shape against the light inside, seen through the near side's front window
        if (lit && !e.cop) on(cab[3], [cs(1, 0.66, 0.12), cs(1, 0.84, 0.12), cs(1, 0.83, 0.62), cs(1, 0.79, 0.78), cs(1, 0.72, 0.8), cs(1, 0.67, 0.64)], [14, 12, 12], bright, 0.006);
        // on the body: the lamps, the grille, the chrome strip along each side, the seams of the doors and their handles
        const lamp = [255, 246, 214], red = [210, 34, 26];
        for (const b of [-1, 1]) {
          on(body[1], [[2.201, b * 0.54, 0.5], [2.201, b * 0.82, 0.5], [2.201, b * 0.82, 0.66], [2.201, b * 0.54, 0.66]], lamp, bright);
          on(body[0], [[-2.201, b * 0.56, 0.5], [-2.201, b * 0.84, 0.5], [-2.201, b * 0.84, 0.64], [-2.201, b * 0.56, 0.64]], red, bright);
          const f = b > 0 ? body[3] : body[2], bb = b * 0.902;
          if (e.cop && f) {   // the police car's doors white on the black, a gold star on the front one
            on(f, [[-1.12, bb, 0.33], [0.93, bb, 0.33], [0.93, bb, 0.775], [-1.12, bb, 0.775]], COP.white, null, 0.002);
            const st = []; for (let k = 0; k < 10; k++) { const r = k % 2 ? 0.045 : 0.11, a = Math.PI / 2 + k * Math.PI / 5; st.push([0.42 + Math.cos(a) * r * 0.9, bb * 1.001, 0.55 + Math.sin(a) * r]); }
            on(f, st, [212, 172, 70], null, 0.003);
          }
          on(f, [[1.98, bb, 0.52], [2.18, bb, 0.52], [2.18, bb, 0.64], [1.98, bb, 0.64]], [255, 200, 120], bright);   // the lamps round the corners
          on(f, [[-2.18, bb, 0.52], [-1.98, bb, 0.52], [-1.98, bb, 0.64], [-2.18, bb, 0.64]], red, bright);
          on(f, [[-2.16, bb, 0.6], [2.16, bb, 0.6], [2.16, bb, 0.625], [-2.16, bb, 0.625]], [176, 178, 184]);
          for (const a of [0.92, -0.1, -1.12]) on(f, [[a - 0.008, bb, 0.33], [a + 0.008, bb, 0.33], [a + 0.008, bb, 0.77], [a - 0.008, bb, 0.77]], scalec(col, 0.45));
          for (const a of [0.12, -0.9]) on(f, [[a, bb, 0.66], [a + 0.13, bb, 0.66], [a + 0.13, bb, 0.69], [a, bb, 0.69]], [176, 178, 184]);
        }
        on(body[1], [[2.201, -0.44, 0.47], [2.201, 0.44, 0.47], [2.201, 0.44, 0.66], [2.201, -0.44, 0.66]], [30, 30, 32]);   // the grille
        // the back door on the kerb side (its left), hinged at its front edge: open, it stands out toward the booth over a lit
        // doorway with the back seat in it
        const th = e.doorT === undefined ? 0 : 65 * DEG * smoothstep((e.t - e.doorT) / 0.7);
        if (th > 0.01) {
          on(body[3], [[-1.11, 0.903, 0.31], [-0.11, 0.903, 0.31], [-0.11, 0.903, 0.78], [-1.11, 0.903, 0.78]], [150, 112, 72], bright, 0.006);
          on(body[3], [[-1.0, 0.904, 0.4], [-0.2, 0.904, 0.4], [-0.24, 0.904, 0.76], [-0.96, 0.904, 0.76]], [80, 58, 42], bright, 0.008);   // the seat
          on(cab[3], [cs(1, 0.04, 0.0), cs(1, 0.49, 0.0), cs(1, 0.49, 0.92), cs(1, 0.06, 0.92)], [140, 106, 70], bright, 0.007);
          const ca = Math.cos(th), sa = Math.sin(th);
          const D = (k, y) => W(-0.11 - ca * k, 0.9 + sa * k, y);    // a point k along the open door from its hinge
          const n0 = carPt(P, 0, 0, 0), n1 = carPt(P, sa, ca, 0), n = [n1[0] - n0[0], n1[2] - n0[2]];   // its outer face's normal: out from the car's side, turned forward as it opens
          const mid = D(0.5, 0.55), outer = (eye[0] - mid[0]) * n[0] + (eye[2] - mid[2]) * n[1] > 0;
          // The open door stands out from the kerb side, between the car and the booth: every part of the car lies on the
          // far side of the plane of that side and the eye on this one, so wherever the door and the car overlap on the
          // view, the door is the nearer. By its own middle it can still come out further than the side behind it (the
          // car that came along the cross street is seen obliquely, close by), and the lit doorway, the chrome strip
          // and the seams on that side were drawn over it. So it is drawn after every part of the car it overlaps across
          // the view (and never earlier than its own distance would put it)
          const panel = [D(0, 0.3), D(1.0, 0.3), D(1.0, 0.78), D(0, 0.78)], glass = [D(0.02, 0.78), D(0.98, 0.78), D(0.74, 1.26), D(0.02, 1.26)];
          const yawOf = v => Math.atan2(v[0], v[2]), dy = yawOf(mid), span = pts => pts.reduce((r, v) => { const a = wrapPi(yawOf(v) - dy); return [Math.min(r[0], a), Math.max(r[1], a)]; }, [Infinity, -Infinity]);
          const ds = span(panel.concat(glass));
          let sd = meanD(panel);
          for (const r of out) {
            if (r.alpha !== undefined && r.alpha < 0.5) continue;   // (the beams of its lamps: light in the rain, not the car)
            const rs = span(r.pts);
            if (rs[1] > ds[0] && rs[0] < ds[1]) sd = Math.min(sd, r.sortDist !== undefined ? r.sortDist : meanD(r.pts));
          }
          out.push({ kind: 'poly', pts: panel, color: outer ? scalec(col, 0.8) : [104, 88, 70], sortDist: sd - 0.01, door: true });
          out.push({ kind: 'poly', pts: glass, color: [150, 172, 198], alpha: 0.16, noLight: true, sortDist: sd - 0.011, door: true });   // its window
          out.push({ kind: 'poly', pts: [D(0.74, 1.24), D(0.98, 0.78), D(1.0, 0.78), D(0.76, 1.27)], color: scalec(col, 0.7), sortDist: sd - 0.012, door: true });   // and the frame round it
          if (outer) out.push({ kind: 'poly', pts: [D(0.78, 0.66), D(0.91, 0.66), D(0.91, 0.69), D(0.78, 0.69)], color: [176, 178, 184], sortDist: sd - 0.013, door: true });
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
        // it comes out of the rain at the far end of the street rather than appearing there (and the police car goes back into it)
        const fade = e.fade;
        if (fade < 1) for (const p of out) p.alpha = (p.alpha === undefined ? 1 : p.alpha) * fade;
        return out;
      };
      const carLamps = e => {   // the headlamps (and the light inside, once the door is open), for the lights and the glows
        if (!e || !e.pose) return null;
        const P = e.pose, W = (a, b, y) => { const p = carPt(P, a, b, y); return L.pt(p[0], p[1], p[2]); };
        const front = W(2.2, 0, 0.6), facing = (0 - front[0]) * P.fx + (0 - front[2]) * P.fz > 0;   // is its front toward you?
        return { P, heads: [W(2.25, -0.69, 0.58), W(2.25, 0.69, 0.58)], front, facing, inside: e.doorT !== undefined ? W(-0.5, 0.2, 1.15) : null };
      };
      // the watch after the call: on the shade, then round to take in the car at the kerb as well
      L.watchPoint = () => {
        const e = s.end; if (!e) return null;
        const c = sm(), cp = c.pos(), hy = Math.atan2(cp.x, cp.z), hd = Math.hypot(cp.x, cp.z);
        const hp = Math.atan2(L.eyeH - (cp.y + c.CR.h * 0.6), hd);
        const t = L.aftermathT, w = lerp(e.w1 * smoothstep((t - (e.tStop - 1.0)) / 1.6), e.w2, smoothstep((t - (e.tStop + 1.3)) / 1.2));
        const yaw = hy + wrapPi(e.doorYaw - hy) * w, pitch = lerp(hp, e.doorPitch, w * 0.6);
        return { x: Math.sin(yaw) * 6, y: L.eyeH - 6 * Math.tan(pitch), z: Math.cos(yaw) * 6 };
      };
      // the car set off
      const carBegin = (c, t0) => {   // (t0: when, after the night is won; it waits for the police to be gone)
        const laneN = c.lane.deg === 0, e = s.end = { T0: t0 + CAR.T0, t: t0, fade: 0 };
        startFlee(c);
        const him = APPROACH.position(c.lane, s.flee.to.d, s.flee.to.lat, L.eyeH);
        // it draws up at the kerb east of the booth: just past the corner, coming round from the main street; short of the
        // booth, coming along the cross street (and short of the shade, so its door does not open into it)
        e.path = carPath(laneN, laneN ? 6.4 : Math.min(4.0, him.x - 2.6));
        e.S = stopShort(e.path, him);
        e.B = Math.min(CAR.BRAKE, e.S); e.tc = (e.S - e.B) / CAR.V; e.Tb = 2 * e.B / CAR.V;
        e.tStop = e.T0 + e.tc + e.Tb;
        const fin = poseAt(e.path, e.S), door = carPt(fin, -0.6, 0.9, 0.75);
        e.doorYaw = Math.atan2(door[0], door[2]); e.doorPitch = Math.atan2(L.eyeH - door[1], Math.hypot(door[0], door[2]));
        // the view takes in both the car's open door and the shade if they are near enough together; if not it goes to the
        // door as it opens, and back to the shade as it turns away
        const sep = Math.abs(wrapPi(e.doorYaw - Math.atan2(him.x, him.z)));
        e.w1 = sep < 50 * DEG ? 0.5 : 0.95; e.w2 = sep < 50 * DEG ? 0.5 : 0.15;
        // the night ends a few seconds after the door opens, the view back on it walking away (it is there all along when the
        // view holds both)
        e.done = e.tStop + (sep < 50 * DEG ? 1.4 : 2.6) + 2.2;
      };
      const carPan = p => Math.sin(wrapPi(Math.atan2(p.x, p.z) - G.cam.yaw)) * 0.85;
      // where the car is at t (L.aftermathT), and its sounds as it comes
      const carRun = t => {
        const e = s.end;
        e.t = t; e.fade = clamp((t - e.T0) / 0.6, 0, 1);
        const once = (k, at, fn) => { if (!e[k] && t >= at) { e[k] = true; fn(); } };
        const tau = t - e.T0;
        if (tau >= 0) {
          const sv = tau < e.tc ? CAR.V * tau : e.S - e.B * Math.pow(Math.max(0, 1 - (tau - e.tc) / e.Tb), 2);
          e.pose = poseAt(e.path, Math.min(sv, e.S));
        }
        once('come', e.T0 - 0.2, () => AUDIO.sfx('carCome', carPan({ x: e.path.pts[0][0], z: e.path.pts[0][1] })));
        once('brake', e.T0 + e.tc, () => AUDIO.sfx('brake', carPan(e.pose)));
        once('idle', e.tStop, () => AUDIO.setLoop('engine', 0.1, carPan(e.pose)));
        once('horn', e.tStop + 0.2, () => AUDIO.sfx('horn', carPan(e.pose)));
        once('door', e.tStop + 0.6, () => { AUDIO.sfx('carDoor', carPan(e.pose)); e.doorT = t; });
      };
      // the aftermath: the car comes, and it scurries off the street behind a lamp post (startFlee); the car passes, pulls
      // up, sounds its horn and opens its door; it stands looking back at you till the door opens, then walks off the way it came.
      // Were the police on their way to it but not yet come, they never come now; were they there, the car comes once the
      // shade has seen them off and they are well away (copBusy)
      L.aftermath = t => {
        if (s.cop && s.cop.phase === 'wait') s.cop = null;
        if (!s.end) { if (copBusy()) return false; carBegin(sm(), t); }
        carRun(t);
        return t >= s.end.done;
      };
      // ---------------- 911: the police come, and are seen off ----------------
      // Dialled on 911, the dispatcher answers and the police are sent (copBegin): s.cop, waiting (phase 'wait') until the
      // shade has got to its last lamp (copSetOff; if it is there already, or past it, a beat after she said so: COP.sent). Then the police car (drawn by
      // carParts as the other is) comes down its street ('come'), halts by the post ('halt') and goes off fishtailing ('flee')
      // until it is out of sight (gone): copRun, every frame from then on, in play or after it, on its own time (s.cop.t, from
      // when it set off). s.cop.q, where it all happens (copScene)
      const COPW = { room: 0.15 };   // (how much room it leaves the parked cars, all the way)
      // the road (between its kerbs: the cross street, z 1 to 8, and the main street off it, x -3.5 to 3.5), and whether the
      // car, as it stands (P), has every corner and every side on it and is clear of every parked car by room (copClear)
      const onRoad = (x, z) => Math.abs(x) < 170 && ((z > 1 && z < 8) || (z >= 8 && Math.abs(x) < 3.5));
      const carBox = (P, a, b) => [[a, b], [a, -b], [-a, -b], [-a, b]].map(([u, v]) => { const p = carPt(P, u, v, 0); return [p[0], p[2]]; });
      const apart = (A, B) => [A, B].some(Pg => Pg.some((p, i) => {   // two convex outlines with a line between them along an edge of one
        const q = Pg[(i + 1) % Pg.length], nx = q[1] - p[1], nz = p[0] - q[0];
        const pa = A.map(v => v[0] * nx + v[1] * nz), pb = B.map(v => v[0] * nx + v[1] * nz);
        return Math.max(...pa) <= Math.min(...pb) || Math.max(...pb) <= Math.min(...pa);
      }));
      const copClear = (P, room) => {
        const e = carBox(P, 2.27, 0.905), box = carBox(P, 2.27 + room, 0.905 + room);
        const pts = e.concat(e.map((p, i) => [(p[0] + e[(i + 1) % 4][0]) / 2, (p[1] + e[(i + 1) % 4][1]) / 2]));
        return pts.every(p => onRoad(p[0], p[1])) && s.parked.every(r => apart(box, [[r.x0, r.z0], [r.x1, r.z0], [r.x1, r.z1], [r.x0, r.z1]]));
      };
      // a way along the road, as points every quarter metre or so: straight on (line), round a corner (arc) or drifting
      // across (ease); and how far along it each is (as carPath's)
      const pathOf = build => {
        const pts = [];
        const line = (x1, z1, ease) => { const [x0, z0] = pts[pts.length - 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.25)); for (let i = 1; i <= n; i++) { const k = ease ? smoothstep(i / n) : i / n; pts.push([lerp(x0, x1, i / n), lerp(z0, z1, k)]); } };
        const arc = (cx, cz, r, a0, a1) => { const n = Math.ceil(Math.abs(a1 - a0) * r / 0.2); for (let i = 1; i <= n; i++) { const a = lerp(a0, a1, i / n); pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); } };
        build(pts, line, arc);
        const sAt = [0];
        for (let i = 1; i < pts.length; i++) sAt.push(sAt[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        return { pts, sAt, len: sAt[sAt.length - 1], m: 0 };
      };
      // Where it all happens, on the shade's street. On the main street the car comes down it southbound by the east kerb,
      // its left side to the shade, and goes off on round the corner to the left and away east along the cross street; on the
      // cross street it comes along it westbound by the far kerb, its right side to the shade, and goes off on west past
      // the booth along the middle of the road, wide of the parked car there. Q: the lamp; jumpTo (in its lane), where the
      // shade jumps out to: in front of the post as the eye sees it, at the kerb, toward the car; H, the car's pose halted
      // beside the post (slewed in toward the kerb); in and out, its ways there and off (turn: where along out the corner
      // is); side, which side of the car the shade is on (1 its left); wall, the wall behind the shade the flashlight lights
      // past it; scareSide, which way on the view the shade faces the car (1 to the right); A, how far it swerves going off:
      // as far as swerve, or less as it must for the whole of its way off to keep to the road clear of the parked cars
      const copScene = c => {
        const lp = lastStop().lamp, Q = { lamp: lp, main: c.lane.deg === 0 };
        let J, hx, hz;
        if (Q.main) {
          hx = 1.75; hz = lp.z + 1.3; J = [lp.x - 0.3, lp.z - 0.45];
          const r = 3.4, zc = 8.0;
          Q.in = pathOf((p, line) => { p.push([hx, hz + COP.from]); line(hx, hz); });
          Q.out = pathOf((p, line, arc) => { p.push([hx, hz]); line(hx, zc); arc(hx + r, zc, r, Math.PI, Math.PI * 1.5); line(COP.far, zc - r); });
          Q.turn = [hz - zc, hz - zc + r * Math.PI / 2];
          Q.side = 1; Q.H = { x: hx, z: hz, fx: Math.sin(COP.slew), fz: -Math.cos(COP.slew), m: 0 }; Q.wall = { x: 6 };
        } else {
          hx = lp.x + 3.0; hz = 6.4; J = [lp.x - 0.6, lp.z - 0.05];   // (well past the post: its lamps, toward you, not over the shade)
          Q.in = pathOf((p, line) => { p.push([hx + COP.from, hz]); line(hx, hz); });
          Q.out = pathOf((p, line) => { p.push([hx, hz]); line(hx - 12, 5.5, true); line(-COP.far, 5.5); });
          Q.turn = null; Q.side = -1; Q.H = { x: hx, z: hz, fx: -Math.cos(COP.slew), fz: Math.sin(COP.slew), m: 0 }; Q.wall = { z: 10.5 };
        }
        Q.jumpTo = laneOf(c.lane, J[0], J[1]);
        Q.scareSide = wrapPi(Math.atan2(hx, hz) - Math.atan2(J[0], J[1])) > 0 ? 1 : -1;
        for (Q.A = COP.swerve; Q.A > 0.05; Q.A *= 0.8) {
          let ok = true;
          for (let sv = 0; sv <= Q.out.len && ok; sv += 0.25) ok = copClear(fleePose(Q, sv), COPW.room);
          if (ok) break;
        }
        if (Q.A <= 0.05) Q.A = 0;
        if (SAVE.data.settings.reducedMotion) Q.A *= 0.4;   // (reduced motion: it hardly swerves)
        return Q;
      };
      // how it stands sv along its way off: swinging from side to side of its way (first away from the shade) as it gathers
      // speed and steadying as it gets away, pointing where it swings and its tail swung out after it by half as much again,
      // and coming out of the way it stood slewed in at the kerb
      const fleePose = (Q, sv) => {
        const P = poseAt(Q.out, sv), nx = -P.fz, nz = P.fx, w = TAU / COP.sway;
        const amp = -Q.side * Q.A * smoothstep(sv / 3) * (1 - smoothstep((sv - 35) / 30));
        const off = amp * Math.sin(sv * w), turn = Math.atan(amp * Math.cos(sv * w) * w) * 1.5;
        let hx = P.fx * Math.cos(turn) + nx * Math.sin(turn), hz = P.fz * Math.cos(turn) + nz * Math.sin(turn);
        const k = smoothstep(sv / 3);
        hx = lerp(Q.H.fx, hx, k); hz = lerp(Q.H.fz, hz, k);
        const hl = Math.hypot(hx, hz);
        return { x: P.x + nx * off, z: P.z + nz * off, fx: hx / hl, fz: hz / hl, m: 0 };
      };
      // how it stands tau after it set off, coming: on at V, then braking hard to a halt (the last brake of the way), its
      // nose dipping and slewing in toward the kerb
      const comePose = (K, tau) => {
        const Q = K.q, S = Q.in.len, B = COP.brake, Tb = 2 * B / COP.V;
        const sv = tau < K.tc ? COP.V * Math.max(0, tau) : S - B * Math.pow(Math.max(0, 1 - (tau - K.tc) / Tb), 2);
        const P = poseAt(Q.in, Math.min(sv, S)), w = smoothstep(clamp((tau - K.tc) / Tb, 0, 1));
        const hx = lerp(P.fx, Q.H.fx, w), hz = lerp(P.fz, Q.H.fz, w), hl = Math.hypot(hx, hz);
        return Object.assign(P, { fx: hx / hl, fz: hz / hl, dip: tau > K.tc ? 0.045 * smoothstep(clamp((tau - K.tc) / 0.15, 0, 1)) : 0 });
      };
      const copBegin = c => {
        s.cop = { cop: true, phase: 'wait', t: 0, pose: null, fade: 0, torch: 0, sv: 0, gone: false, sentAt: L.t };
      };
      // the flashlight on the shade at t (s.cop.t): it convulses from that instant, COP.conv of it, and the rest follows
      // from there (scareT, the shade at the car; torchOffT, the flashlight off; goT, the car away)
      const copLit = (K, t) => { K.lit = true; K.scareT = t + COP.conv; K.torchOffT = K.scareT + COP.torchOff; K.goT = K.scareT + COP.go; };
      // set off (the times from then, s.cop.t): tc, when it brakes; haltT, halted; offT, its siren off, at the end of the
      // wail it is in; torchOnT, the flashlight on; (copLit, once its beam is on the shade:) scareT, the shade at it; torchOffT, the flashlight off; goT, away. Were
      // the shade past its last lamp it goes back behind the post (s.cop.back)
      const copSetOff = c => {
        const K = s.cop, Q = K.q = copScene(c), m = s.man, last = lastStop();
        Object.assign(K, { phase: 'come', t: 0, sirenAt: 0, tc: (Q.in.len - COP.brake) / COP.V });
        K.haltT = K.tc + 2 * COP.brake / COP.V;
        K.offT = Math.ceil((K.haltT + 0.15) / COP.cyc) * COP.cyc;
        K.torchOnT = K.offT + COP.torchOn; copLit(K, K.torchOnT + COP.find); K.lit = false;   // (at the latest: the end of its sweep)
        if (m.segs.indexOf(m.seg) > lastIdx()) K.back = { t0: L.t, from: { d: m.d, lat: m.lat }, to: last, rushT: Math.max(FLEE.min, gap(last, { d: m.d, lat: m.lat }) / RUSH_V) };
        K.pose = comePose(K, 0); c.hold = null;
      };
      // a puff of smoke off one of its back tyres, spinning (its own random stream, as the sparks')
      const puff = K => {
        for (const b of [-0.78, 0.78]) {
          const p = carPt(K.pose, -1.42, b, 0.18), a = fxr() * TAU;
          s.smoke.push({ x: p[0], y: p[1], z: p[2], vx: Math.cos(a) * 0.5 - K.pose.fx * 1.2, vz: Math.sin(a) * 0.5 - K.pose.fz * 1.2, t0: L.t, life: 1.4 + fxr() * 0.8, r0: 0.18 + fxr() * 0.12 });
        }
      };
      // black rubber laid on the road by its tyres, along a way it went: q(u) its pose u of the way along it (0..1)
      const skid = (q, wheels, col) => {
        const out = [];
        for (const [a, b] of wheels) {
          const at = u => { const P = q(u); return [carPt(P, a, b - 0.1, 0), carPt(P, a, b + 0.1, 0)].map(p => [p[0], ROAD + 0.005, p[2]]); };
          for (let i = 0; i < 6; i++) {
            const p0 = at(i / 6), p1 = at((i + 1) / 6);
            out.push(SC.mkQuad(L, p0[0], p0[1], p1[1], p1[0], col, { layer: 0, alpha: 0.5 * smoothstep((i + 1) / 6), noLight: true, sortDist: 0.4 }));
          }
        }
        return out;
      };
      const copRun = dt => {
        const K = s.cop;
        if (!K || K.phase === 'wait' || K.gone) return;
        K.t += dt;
        const t = K.t, Q = K.q, H = K.haltT, still = SAVE.data.settings.reducedMotion;
        if (t < H) { K.phase = 'come'; K.pose = comePose(K, t); }
        else if (t < K.goT) {   // halted: rocking back on its springs
          if (K.phase === 'come') K.skids = skid(u => comePose(K, lerp(K.tc + 0.3, H, u)), [[1.42, -0.78], [1.42, 0.78], [-1.42, -0.78], [-1.42, 0.78]], [10, 10, 12]);
          K.phase = 'halt'; K.pose = Object.assign({}, Q.H, { dip: 0.045 * Math.exp(-(t - H) * 4) * Math.cos((t - H) * 11) });
        } else {   // away: the tyres spinning, then it goes, faster and faster (slower round the corner)
          K.phase = 'flee';
          const tg = t - K.goT, near = Q.turn ? Math.max(0, Q.turn[0] - K.sv, K.sv - Q.turn[1]) : 99;
          const v = tg < COP.spin ? 0.6 * tg / COP.spin : Math.min(COP.accel * (tg - COP.spin) + 0.6, lerp(COP.vTurn, COP.vMax, smoothstep(near / 14)));
          K.sv += v * dt;
          if (K.sv >= 6 && !K.peeled) { K.peeled = true; K.skids = K.skids.concat(skid(u => fleePose(Q, u * 6), [[-1.42, -0.78], [-1.42, 0.78]], [8, 8, 10])); }
          if (K.sv >= Q.out.len) { K.gone = true; K.goneAt = L.t; K.pose = null; return; }
          K.pose = fleePose(Q, K.sv); K.pose.dip = -0.03 * (tg < COP.spin ? 1 : Math.exp(-(tg - COP.spin) * 2));
          if (tg < COP.spin + 0.9) { K.puff = (K.puff || 0) + dt * (still ? 6 : 16); while (K.puff >= 1) { K.puff--; puff(K); } }
        }
        K.fade = clamp(t / 0.6, 0, 1) * (K.phase === 'flee' ? clamp((Q.out.len - K.sv) / 15, 0, 1) : 1);
        // its sounds: the engine as it comes; the siren a wail at a time, back to back, until it winds down at the end of the
        // one it is in when it stops; the tyres screeching as it brakes; and spinning, the engine roaring, as it goes
        const at = K.pose, once = (k, when, fn) => { if (!K[k] && t >= when) { K[k] = true; fn(); } };
        once('come', 0, () => AUDIO.sfx('carCome', carPan(at)));
        while (K.sirenAt < K.offT - 0.01 && t >= K.sirenAt) { AUDIO.sfx(K.sirenAt === 0 ? 'sirenIn' : 'siren', carPan(at)); K.sirenAt += COP.cyc; }   // (its first wail far off, coming up out of nothing: sirenIn)
        once('screech', K.tc, () => AUDIO.sfx('tireScreech', carPan(at)));
        once('off', K.offT, () => AUDIO.sfx('sirenOff', carPan(at)));
        once('peel', K.goT, () => AUDIO.sfx('peelOut', carPan(at)));
        // the flashlight: on (flickering as it catches; with reduced flashing it comes up smoothly instead), and off
        const on = K.torchOnT, off = K.torchOffT, ramp = SAVE.data.settings.reducedFlash ? 0.3 : 0.05;
        const flick = ramp < 0.1 && t - on < 0.22 && Math.sin((t - on) * 70) < -0.3 ? 0.2 : 1;
        K.torch = t < on ? 0 : t < off ? clamp((t - on) / ramp, 0, 1) * flick : clamp(1 - (t - off) / ramp, 0, 1);
        // the instant its beam comes onto the shade as it sweeps in (the shade's chest inside the cone of it), the shade
        // starts to convulse: no wait for the sweep to finish, or after it
        if (!K.lit && t >= on) {
          const tr = copTorch(), h = tr && [0, 1, 2].map(j => tr.him[j] - tr.O[j]);
          if (tr && (h[0] * tr.d[0] + h[1] * tr.d[1] + h[2] * tr.d[2]) / Math.hypot(h[0], h[1], h[2]) >= Math.cos(COP.beam)) copLit(K, t);
        }
      };
      // still about the scene (out of play, while it is won): the police car, or the shade seeing it off
      const copBusy = () => !!s.cop && s.cop.phase !== 'wait' && !s.cop.gone && (!s.cop.manDone || s.cop.sv < 30);
      // the flashlight, as it is now: from its window on the shade's side, sweeping in from the road ahead to the shade as
      // it comes on, and on past it to the wall behind (or the ground). { O: the lens, d: which way, len: how far it reaches,
      // him: the shade (its chest), sweep: how far it has found him, k: how bright }, or null while it is off
      const copTorch = () => {
        const K = s.cop; if (!K || !K.pose || K.torch < 0.01) return null;
        const Q = K.q, c = sm(), cp = c.pos(), P = K.pose, O = carPt(P, 0.2, Q.side * 0.96, 1.08);
        const him = [cp.x, cp.y + (c.yOff || 0) + 1.6, cp.z];
        const sweep = smoothstep(clamp((K.t - K.torchOnT) / COP.find, 0, 1)), ahead = carPt(P, 7, Q.side * 2.2, 0.3);
        const T = [0, 1, 2].map(j => lerp(ahead[j], him[j], sweep));
        const dl = Math.hypot(T[0] - O[0], T[1] - O[1], T[2] - O[2]), d = [0, 1, 2].map(j => (T[j] - O[j]) / dl);
        let len = 9, hit = null;
        if (Q.wall.x !== undefined && d[0] > 0.01 && (Q.wall.x - O[0]) / d[0] < len) { len = (Q.wall.x - O[0]) / d[0]; hit = 'x'; }
        if (Q.wall.z !== undefined && d[2] > 0.01 && (Q.wall.z - O[2]) / d[2] < len) { len = (Q.wall.z - O[2]) / d[2]; hit = 'z'; }
        if (d[1] < -0.01 && O[1] / -d[1] < len) { len = O[1] / -d[1]; hit = 'g'; }
        return { O, d, len, hit, him, sweep, k: K.torch };
      };
      // the flashlight's beam in the rain, the pool of it where it ends and round the shade's feet; the smoke off the tyres;
      // the rubber on the road
      const copParts = () => {
        const K = s.cop, out = [];
        if (K && K.skids) for (const q of K.skids) out.push(q);
        for (const p of s.smoke) {
          const age = (L.t - p.t0) / p.life, e = L.t - p.t0, x = p.x + p.vx * e, y = p.y + 0.4 * e, z = p.z + p.vz * e, r = p.r0 + 0.8 * e;
          const dd = Math.hypot(x, z) || 1, rx = -z / dd, rz = x / dd, pts = [];
          for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; pts.push(L.pt(x + rx * Math.cos(a) * r, y + Math.sin(a) * r * 0.8, z + rz * Math.cos(a) * r)); }
          out.push({ kind: 'poly', pts, color: [96, 96, 102], alpha: 0.28 * Math.pow(1 - age, 1.5) * Math.min(1, e * 8), noLight: true });
        }
        const tr = copTorch(); if (!tr) return out;
        const { O, d, len, k } = tr, E = [0, 1, 2].map(j => O[j] + d[j] * len);
        // the beam: a strip across the view from the lens, widening to where it ends (a soft wide one, and a core in it)
        const v = [(O[0] + E[0]) / 2, (O[1] + E[1]) / 2 - L.eyeH, (O[2] + E[2]) / 2];
        let w = [d[1] * v[2] - d[2] * v[1], d[2] * v[0] - d[0] * v[2], d[0] * v[1] - d[1] * v[0]];
        const wl = Math.hypot(w[0], w[1], w[2]) || 1; w = w.map(q => q / wl);
        const at = (u, r) => L.pt(O[0] + d[0] * u + w[0] * r, O[1] + d[1] * u + w[1] * r, O[2] + d[2] * u + w[2] * r);
        for (const [spread, a0] of [[0.22, 0.08], [0.1, 0.14]]) for (let i = 0; i < 4; i++) {
          const u0 = len * i / 4, u1 = len * (i + 1) / 4, r0 = 0.035 + u0 * spread, r1 = 0.035 + u1 * spread;
          out.push({ kind: 'poly', pts: [at(u0, r0), at(u0, -r0), at(u1, -r1), at(u1, r1)], color: [222, 230, 255], alpha: a0 * k * (1 - i * 0.2), noLight: true, noFog: true });
        }
        // the pool of light where it ends, on the wall or the ground
        const ring = (C, r, ax, col, a) => {
          const pts = [];
          for (let i = 0; i < 14; i++) { const t = i / 14 * TAU, cu = Math.cos(t) * r, sv = Math.sin(t) * r; pts.push(ax === 'x' ? L.pt(C[0], C[1] + sv, C[2] + cu) : ax === 'z' ? L.pt(C[0] + cu, C[1] + sv, C[2]) : L.pt(C[0] + cu, C[1], C[2] + sv)); }
          out.push({ kind: 'poly', pts, color: col, alpha: a, noLight: true });
        };
        if (tr.hit) {
          const R0 = Math.min(0.75, 0.05 + len * 0.1), C = [E[0] - (tr.hit === 'x' ? 0.03 : 0), tr.hit === 'g' ? 0.012 : E[1], E[2] - (tr.hit === 'z' ? 0.03 : 0)];
          ring(C, R0 * 1.6, tr.hit, [200, 210, 236], 0.05 * k); ring(C, R0, tr.hit, [226, 232, 250], 0.1 * k);
        }
        // and round its feet
        const c = sm(), cp = c.pos();
        ring([cp.x, groundAt(cp.x, cp.z) + 0.012, cp.z], 0.62, 'g', [220, 228, 250], 0.12 * k * tr.sweep);
        return out;
      };
      // the light bar: how lit its red end and its blue end are. Flashing in turn, two quick flashes each; with reduced
      // flashing a slow, steady swell from one to the other instead
      const barNow = e => {
        if (!e || !e.cop) return [0, 0];
        const t = e.t;
        if (SAVE.data.settings.reducedFlash) { const w = Math.sin(t * TAU / 2.4); return [0.55 + 0.3 * w, 0.55 - 0.3 * w]; }
        const ph = ((t % 0.6) + 0.6) % 0.6 / 0.6, on = a => (ph >= a && ph < a + 0.13) || (ph >= a + 0.21 && ph < a + 0.34);
        return [on(0) ? 1 : 0.06, on(0.5) ? 1 : 0.06];
      };
      // the light bar's two ends, in the night (for their light and their glow)
      const barPts = e => [-0.34, 0.34].map(b => carPt(e.pose, -0.37, b, 1.4));
      // the car's headlamps, and the light inside it (the shade brings no light of its own: it is seen by the street lamps', and the
      // booth's)
      L.dynamicLights = () => {
        const out = [];
        for (const e of [s.end, s.cop]) {
          const k = carLamps(e); if (!k) continue;
          const n = Math.hypot(k.P.fx, 0.06, k.P.fz), f = e.fade;
          out.push({ x: k.front[0], y: k.front[1], z: k.front[2], r: 24, i: 0.6 * f, color: [235, 228, 200], cone: { x: k.P.fx / n, y: -0.06 / n, z: k.P.fz / n, cos: Math.cos(22 * DEG) } });
          if (k.inside) out.push({ x: k.inside[0], y: k.inside[1], z: k.inside[2], r: 2.6, i: 0.6, color: [255, 196, 120] });
          if (e.cop) {   // the light bar, red and blue on the wet street and the fronts round it
            const lv = barNow(e), ends = barPts(e);
            [[255, 50, 40], [70, 110, 255]].forEach((col, j) => { const v = lv[j] * f; if (v > 0.03) out.push({ x: ends[j][0], y: ends[j][1] + 0.1, z: ends[j][2], r: 11, i: 0.75 * Math.min(1, v), color: col }); });
          }
        }
        const tr = copTorch();   // the flashlight, on the shade and the post and the wall behind
        if (tr) out.push({ x: tr.O[0], y: tr.O[1], z: tr.O[2], r: 10, i: 1.1 * tr.k, color: [225, 232, 255], cone: { x: tr.d[0], y: tr.d[1], z: tr.d[2], cos: Math.cos(COP.beam) } });
        return out;
      };
      // a street lamp's halo is drawn over everything, so one behind the shade (inside its outline as seen from the booth) is left out
      const behindHim = g => {
        const c = L.creatures[0]; if (!c || c.dead) return false;
        const cp = c.pos(), cd = Math.hypot(cp.x, cp.z), gd = Math.hypot(g.x, g.z);
        if (gd <= cd) return false;
        const da = Math.abs(wrapPi(Math.atan2(g.x, g.z) - Math.atan2(cp.x, cp.z)));
        if (da > (c.CR.w * 0.5) / Math.max(0.5, cd) + g.r / gd) return false;
        const ty = (g.y - L.eyeH) / gd, top = (cp.y + (c.yOff || 0) + c.CR.h - L.eyeH) / cd, bot = (cp.y + (c.yOff || 0) - L.eyeH) / cd;
        return ty < top + g.r / gd && ty > bot - g.r / gd;
      };
      // and so is one the eye sees through the pay phone (its backboard, or the receiver hanging beside it)
      const recU = (RX + 0.06) * PK, recY = ph(0, 1.3, 0)[1];
      const behindPhone = g => {
        const a = SQ * (g.x + g.z);                                    // how far it is along the line into the corner
        if (a <= WD) return false;
        const k = WD / a, u = SQ * (g.x - g.z) * k, y = L.eyeH + (g.y - L.eyeH) * k;
        return u > -BW && u < (y > recY ? Math.max(BW, recU) : BW) && y > NB.y - 0.03 && y < ph(0, 1.8, 0)[1];
      };
      // the rain: under the booth's roof it does not rain. It is seen only out through the glass (each pane between its
      // posts, over the kick plate and under the band at the top, the rail across the middle left out), never inside, and
      // never over the pay phone across the corner: its backboard, the housing, the receiver on its hook (or the empty
      // cradle) and the cord under it, the shelf and its bracket, the notebook while its pages stand up off the shelf, and
      // the door's pull, each as a box whose faces are cut out of the glass
      const W3 = q => L.pt(q[0], q[1], q[2]);
      const panes = [];
      for (const [x0, z0, x1, z1] of [[XW, B, B, B], [B, B, B, -B], [B, -B, XW, -B], [XW, -B, XW, B]]) {
        const ux = Math.sign(x1 - x0) * 0.035, uz = Math.sign(z1 - z0) * 0.035, a = [x0 + ux, z0 + uz], b = [x1 - ux, z1 - uz];
        for (const [y0, y1] of [[0.26, 0.98], [1.04, 2.06]]) panes.push([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]].map(W3));
      }
      const boxFaces = (map, u0, u1, y0, y1, d0, d1) => {
        const v = [[u0, y0, d0], [u1, y0, d0], [u1, y1, d0], [u0, y1, d0], [u0, y0, d1], [u1, y0, d1], [u1, y1, d1], [u0, y1, d1]].map(p => W3(map(p[0], p[1], p[2])));
        return [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]].map(f => f.map(i => v[i]));
      };
      const flat = (x, y, z) => [x, y, z];
      const phoneCovers = [].concat(
        boxFaces(at3, -BW, BW, NB.y - 0.03, ph(0, 1.8, 0)[1], 0, 0.016),                   // the backboard
        boxFaces(ph, -HW - 0.005, HW + 0.005, HY0, 1.785, 0.02, 0.11),                      // the housing and its cap
        boxFaces(ph, HW, RX + 0.055, 1.29, 1.75, 0.08, 0.14),                               // the hook, and the receiver on it (or its cradle)
        boxFaces(ph, 0.05, 0.15, 1.06, 1.32, 0.07, 0.13),                                   // the cord hanging under it
        boxFaces(at3, -SF, SF, 1.0, 1.035, 0, SH),                                          // the shelf
        boxFaces(at3, -0.008, 0.008, 0.86, 1.0, 0, SH * 0.8),                               // its bracket
        boxFaces(flat, -0.587, -0.563, 0.93, 1.33, B - 0.072, B - 0.004));                  // the door's pull
      const pagesUp = boxFaces(at3, NB.u0 - 0.004, NB.u1 + 0.004, NB.y, AY + NB.len + 0.01, 0, AX + NB.len + 0.01);
      L.weatherShelter = () => ({
        openings: panes,
        covers: s.nbOpen || s.nbAnims.length ? phoneCovers.concat(pagesUp) : phoneCovers,
        hides: (x, y, z) => y < 2.4 && x > XW - 0.04 && x < B + 0.04 && z > -B - 0.04 && z < B + 0.04,   // indoors
      });
      L.glows = () => {
        const out = lamps.filter(lp => lp.glow.a > 0.004).map(lp => lp.glow).filter(g => !behindHim(g) && !behindPhone(g));
        for (const e of [s.end, s.cop]) {
          const k = carLamps(e); if (!k) continue;
          const fade = e.fade;
          for (const h of k.heads) out.push({ x: h[0], y: h[1], z: h[2], r: k.facing ? 1.1 : 0.5, color: [255, 240, 206], a: (k.facing ? 0.75 : 0.3) * fade });
          if (k.inside) out.push({ x: k.inside[0], y: k.inside[1], z: k.inside[2], r: 0.7, color: [255, 200, 130], a: 0.22 });
          if (e.cop) {
            const lv = barNow(e), ends = barPts(e);
            [[255, 60, 50], [90, 130, 255]].forEach((col, j) => { if (lv[j] > 0.03) out.push({ x: ends[j][0], y: ends[j][1] + 0.1, z: ends[j][2], r: 0.5 + 0.9 * Math.min(1, lv[j]), color: col, a: 0.6 * Math.min(1, lv[j]) * fade }); });
          }
        }
        // the flashlight: its lens, bright (less so with reduced flashing), and its light on the shade
        const tr = copTorch();
        if (tr) {
          out.push({ x: tr.O[0], y: tr.O[1], z: tr.O[2], r: 0.24, color: [236, 240, 255], a: (SAVE.data.settings.reducedFlash ? 0.5 : 0.95) * tr.k });
          out.push({ x: tr.him[0], y: tr.him[1], z: tr.him[2], r: 1.1, color: [200, 212, 240], a: 0.22 * tr.k * tr.sweep });
        }
        return out;
      };
      // (not under the corner shelf, where a thing dropped would be hidden looking down)
      const shelfFoot = (WD - SH) / SQ - (B - 0.07);
      L.floor = { poly: [[XW + 0.08, -B + 0.07], [B - 0.07, -B + 0.07], [B - 0.07, shelfFoot], [shelfFoot, B - 0.07], [XW + 0.08, B - 0.07]], y: 0.03 };
    },
  });
})();
