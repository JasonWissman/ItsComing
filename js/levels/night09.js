'use strict';
// ============================================================ 9. THE PHONE BOOTH ============================================================
// A phone booth on a corner, at night, in the rain, with glass all round. A man in a long coat is coming toward it from a long
// way off, up the main street or along the far pavement of the cross street from the east, with no light of his own. The
// street lamps stand along his way, on the sides of both streets nearer the booth's corner, and he goes from one to the
// next: he stands behind a lamp a few seconds, lit by it, then reaches up, far too far, and breaks it (a pop, glass,
// sparks, and it is out for good), and in the dark he rushes on to the next one nearer the booth, waits, breaks that, and so
// on until the last; then he comes across to the glass. The pay phone hangs across the corner of the booth between the two
// streets, so while you use it both streets are at the edges of the view and you see him coming out of the corner of your
// eye. On the corner shelf under the phone lies your notebook, and somewhere in it, among the shopping and the dentist, is
// the number to ring, on a page of its own, scrawled large and fast in something red that has run. It is a pay phone: lift
// the receiver, put a coin in (there is one lying about in the booth) and dial on its own keys; it rings for seven seconds
// while he keeps coming, and then someone picks up and a car comes for you. Every other number in the notebook belongs to
// someone ordinary and is not in service, and hanging up gives the coin back, into the coin return.
// The notebook is read where it lies, in the world, with nothing done to the view: clicked, its cover flips back over the
// spiral and stands against the plate behind it; each click after that lifts the page by its corner and turns it back over
// the spiral, and a click on the last page shuts it. You look down at it as at anything else, and zoom in (Shift, Z or Space)
// to read it. Its pages are drawn once into canvases and laid on it, strip by strip, in perspective. The phone is looked at
// as anything else too, a little smaller than life, its keys clicked where they are drawn (or with the zoom held); the
// number keys dial while you face it, and a gamepad's d-pad moves a highlight over the phone (L.padDir, L.padUse).
// It is done with your hands (js/hands.js): the lifted receiver is in your left hand (L.offHand), your right fingertip
// presses the keys (G.reach, going from key to key, in turn when they are pressed faster than it can go) and turns the
// notebook's pages, and what will not work shows on the phone itself: a key pressed for nothing clicks and the display
// blinks at you, a coin put in on the hook goes into the slot and drops through into the coin return, the empty return is
// felt with the fingers.
Object.assign(ICONS, {
  // a small battered notebook, spiral at the top, held shut with an elastic band (as it is carried in the void, night 13)
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
  const XW = -0.7;             // the west wall is this far from the eye
  const B = 0.7;               // and the glass on the other three sides (the door to the north, east, and the back) this far
  const PHONE_DIR = 1;         // facing the phone is facing north-east, into the corner between the two streets
  const ROAD = -0.12;          // the road is a kerb's height below the pavement the booth stands on
  // The pay phone hangs on a plate set across the north-east corner, square to the line from the eye into the corner, its
  // ends against the two panes. A point on it is given by u across the plate (to your right as you face it), y up, and d
  // out from the plate toward you (at3). The phone itself is a size smaller than life: its parts are given at full size,
  // and come in to PK of that about the middle of its keys (ph), which is PY1 high
  const SQ = Math.SQRT1_2, PW = 0.2, WD = B / SQ - PW - 0.004;      // the plate's half width; how far it is from the eye
  const at3 = (u, y, d) => [SQ * (WD - d + u), y, SQ * (WD - d - u)];
  const PK = 0.8, PY = 1.52, PY1 = 1.6;
  const ph = (u, y, d) => at3(u * PK, PY1 + (y - PY) * PK, d * PK);
  const FD = WD - 0.1 * PK;    // how far the face of the phone's housing is from the eye
  // the notebook, lying on the corner shelf under the phone: a reporter's pad, its spiral along the end toward the plate (d
  // along the shelf out from the plate, u across it to your right), a sheet len long and u0..u1 wide, th thick, and RINGS
  // turns of wire through it. SH: how far the shelf comes out from the plate
  const NB = { u0: -0.085, u1: 0.055, d: 0.045, len: 0.185, y: 1.03, th: 0.007 }, RINGS = 9, SH = 0.25;
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
    ['#Ruth\'s old address', '22 Corder Lane, top flat', 'the bell doesn\'t work,', 'go around the back', '(she moved. write anyway)'],
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
    if (!back && rand() < 0.3) {   // a ring where a cup stood on it
      const x = TW * (0.55 + rand() * 0.3), y = TH * (0.55 + rand() * 0.3), r = 58 + rand() * 14;
      g.strokeStyle = 'rgba(140,100,40,.16)'; g.lineWidth = 7; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
      g.fillStyle = 'rgba(140,100,40,.06)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
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
  // the cover: board covered in worn red-brown cloth, with its label and a worn corner, as it is drawn as a thing you hold
  // (ICONS.notebook); and inside it, bare grey board
  function coverOut(g) {
    const v = g.createRadialGradient(TW * 0.3, TH * 0.2, 20, TW * 0.4, TH * 0.4, TH * 0.85);
    v.addColorStop(0, '#6a3a2c'); v.addColorStop(1, '#3e2119'); g.fillStyle = v; g.fillRect(0, 0, TW, TH);
    g.strokeStyle = 'rgba(20,10,8,.55)'; g.lineWidth = 14; g.strokeRect(7, 7, TW - 14, TH - 14);
    g.fillStyle = 'rgba(255,225,200,.07)'; g.beginPath(); g.arc(TW * 0.86, TH * 0.9, 46, 0, TAU); g.fill();
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
    ambient: { wind: 0.35, rain: 1, drone: 0.45, droneFreq: 47, windFreq: 300 },
    weather: { kind: 'rain', density: 0.9, wind: 0.25 },
    lights: [{ x: 0, y: 2.25, z: 0, r: 3.3, i: 0.55, color: [214, 228, 255], flicker: 0.05 }],
    text: {
      intro: 'You missed the bus, and you don\'t remember who to call for help.',
      death: { default: 'He came into the booth.', ringing: 'It was still ringing when he came through the glass.', dead: 'You were still listening to a dead line when he came through the glass.', nocoin: 'The phone would not operate without a coin.' },
      win: 'A mysterious car came for you, just in time.',
      fragment: 'The number is still in the notebook, in your own handwriting. You do not remember writing it down, and you have not crossed it out.',
    },
    // two streets, each seen whole through a pane of the booth: up the main street through the door, and along the cross
    // street to the east through the east pane (each pane as far as the pay phone's plate across the corner between them).
    // Nothing comes from the west, and the back of the booth looks at a shuttered shop
    lanes: [
      { deg: 0, name: 'up the street', y: ROAD, apertures: [{ z: B, x0: -0.5, x1: 0.38, y0: 1.06, y1: 2.04 }] },
      { deg: 90, name: 'along to the east', apertures: [{ z: B, x0: -0.38, x1: 0.62, y0: 1.06, y1: 2.04 }] },
    ],
    laneSwitch: false,   // he keeps to the street he started down: the race is with the phone, not with finding him
    // he reaches the glass in about 37 to 46 s (time: the whole of his way, lamps and all, is fitted to it). A careful player
    // finds the number by page four on average and the coin in a few seconds, has dialled by about 21 s and is answered by
    // 28, while he is still at his last lamp or just leaving it; with the number on the last page and his quickest way in
    // there are several seconds to spare, but hardly any after a wrong number as well, which costs about eight (the coin has
    // to be taken out of the return and put back in)
    creatures: [{ type: 'signalman', startDist: 55, time: 72 }],
    aftermath: { type: 'custom' },   // L.aftermath: the car that comes for you, and what he does
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
        man: null, lampsOut: 0, sparks: [] });

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
      // Along the main street they stand on its east side, and along the cross street to the east on its far side: the sides
      // nearer the booth's corner, where the pay phone is, so that from the phone a man at one is at the edge of the view.
      // He breaks them one by one (breakLamp): a lamp's level (lampLevel) is 1 while it burns, flares and stutters as it
      // goes, and is nought for good once it is out; its light, its glow, its lens and its streak on the road all follow it
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
        const lp = { x, z, hx, hz, street, outAt: undefined, refl: [] };
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
        // its reflection in the wet road: a streak from under the lamp toward the eye, fading as it comes, on the road only
        const fd = Math.hypot(hx, hz), qx = -hz / fd, qz = hx / fd, tEnd = Math.max(0.34, 1.15 / Math.abs(hz)), N = 5;
        lp.refl = SC.grab(L, () => {
          for (let k = 0; k < N; k++) {
            const ta = lerp(0.97, tEnd, k / N), tb = lerp(0.97, tEnd, (k + 1) / N), wa = lerp(0.2, 0.06, k / N), wb = lerp(0.2, 0.06, (k + 1) / N);
            SC.quad(L, [hx * ta + qx * wa, ROAD + 0.006, hz * ta + qz * wa], [hx * ta - qx * wa, ROAD + 0.006, hz * ta - qz * wa], [hx * tb - qx * wb, ROAD + 0.006, hz * tb - qz * wb], [hx * tb + qx * wb, ROAD + 0.006, hz * tb + qz * wb], [255, 176, 104], { layer: 0, alpha: 0.12 * (1 - k / N), noLight: true, sortDist: 0.4 });
          }
        });
        for (const q of lp.refl) q.alpha0 = q.alpha;
        lamps.push(lp);
      }
      L.lights = lamps.map(lp => lp.light);
      // a lamp he breaks: it pops in a white flare, glass and sparks come down out of it, and it stutters and goes out for good
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
      // every frame: each lamp's light, glow and streak as its level is now; the sparks and glass falling
      const lampsNow = dt => {
        for (const lp of lamps) {
          if (lp.outAt === undefined || lp.done) continue;
          const k = lampLevel(lp);
          lp.light.i = 0.6 * k; lp.glow.a = 0.22 * Math.min(1, k) + (k > 1 ? 0.5 : 0); lp.glow.r = k > 1 ? 3.2 : 1.7;
          for (const q of lp.refl) q.alpha = q.alpha0 * Math.min(1, k);
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
      // Everything on it is placed by where it lies on the plate (ph, at3): u across it (to your right as you face it), y up,
      // and d out from it toward you. The plate; the housing, with the display and the coin slot along its top, the keys
      // under them and the coin return at the bottom; the receiver hanging on its right; the instruction card on the plate to
      // its left; the corner shelf under it all, where the notebook lies.
      const face = { sortDist: FD - 0.01 }, detail = { sortDist: FD - 0.015 };
      const q4 = (map, pts, col, opts) => { const w = pts.map(p => map(p[0], p[1], p[2])); SC.quad(L, w[0], w[1], w[2], w[3], col, opts); };
      const faceQ = (u0, u1, y0, y1, d, col, opts) => q4(ph, [[u0, y0, d], [u1, y0, d], [u1, y1, d], [u0, y1, d]], col, opts);
      // a box standing out from the plate (u0..u1, y0..y1, d0..d1 in the frame map gives), with only the faces that look
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
      // a sprite on the phone, at its size there (drawn at full size, as it was made, and brought in to PK)
      const phSprite = (u, y, d, w, h, draw, opts) => { const p = ph(u, y, d); return SC.mkSprite(L, p[0], p[1], p[2], w * PK, h * PK, (ctx, P) => { ctx.scale(PK, PK); draw(ctx, P); }, opts); };
      const LCD = { u0: -0.108, u1: 0.035, y0: 1.655, y1: 1.725 }, SLOT = { u0: 0.052, u1: 0.105, y0: 1.655, y1: 1.725 };
      const RET = { u0: -0.05, u1: 0.05, y0: 1.3, y1: 1.375 }, RX = 0.19;   // the coin return; where the receiver hangs
      const KEYS = ['123', '456', '789', '*0#'], KEY_Y0 = 1.598, KEY_DY = 0.052, KEY_DU = 0.045;
      obox(at3, -PW, PW, 0.98, 1.95, 0, 0.016, [58, 62, 68], { sortDist: WD + 0.03 });                 // the plate, across the corner
      obox(ph, -0.13, 0.13, 1.29, 1.765, 0.02, 0.1, [128, 132, 140], { sortDist: FD + 0.005 });        // the housing
      obox(ph, -0.135, 0.135, 1.755, 1.785, 0.02, 0.11, [96, 100, 108], { sortDist: FD - 0.004 });     // its cap
      faceQ(LCD.u0 - 0.009, LCD.u1 + 0.009, LCD.y0 - 0.009, LCD.y1 + 0.009, 0.1005, [62, 64, 70], face);   // the display's bezel (the display is drawn each frame)
      const slotArt = SC.grab(L, () => {
        faceQ(SLOT.u0, SLOT.u1, SLOT.y0, SLOT.y1, 0.1005, [176, 180, 188], face);                    // the coin slot's chrome plate,
        faceQ(SLOT.u0 + 0.004, SLOT.u1 - 0.004, SLOT.y0 + 0.004, SLOT.y1 - 0.004, 0.101, [138, 142, 150], detail);
        faceQ(0.0735, 0.0835, 1.666, 1.714, 0.1015, [6, 6, 8], { sortDist: FD - 0.02 });            // and the slot in it
      });
      faceQ(-0.075, 0.075, 1.41, 1.63, 0.1005, [92, 96, 102], face);                             // the keypad's plate
      const retArt = SC.grab(L, () => {
        faceQ(RET.u0, RET.u1, RET.y0, RET.y1, 0.1005, [160, 164, 172], face);                       // the coin return: a chrome surround
        faceQ(RET.u0 + 0.008, RET.u1 - 0.008, RET.y0 + 0.008, RET.y1 - 0.006, 0.101, [12, 12, 14], detail);   // and its dark mouth
      });
      // the instruction card, on the plate to the left of the housing: a printed heading, and the three steps in the order
      // the phone wants them (as on any pay phone)
      faceQ(-0.232, -0.142, 1.43, 1.67, 0.021, [214, 208, 190], { sortDist: WD + 0.02 });
      faceQ(-0.226, -0.148, 1.625, 1.655, 0.0215, [150, 40, 36], { sortDist: WD + 0.015 });
      L.props.push(phSprite(-0.187, 1.43, 0.022, 0.09, 0.24, (ctx, P) => {
        const print = (t, x, y, px, col, weight) => { ctx.save(); ctx.translate(x, y); ctx.scale(0.001, -0.001); ctx.font = (weight || 'bold') + ' ' + px + 'px Arial, Helvetica, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.fillText(t, 0, 0); ctx.restore(); };
        ctx.save(); ctx.translate(0, 0.2); ctx.scale(0.001, -0.001); ctx.font = 'bold 13px Arial, Helvetica, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = P.col([236, 226, 210]); ctx.fillText('TO CALL', 0, 0); ctx.restore();
        const ink = P.col([36, 42, 70]), red = P.col([150, 40, 36]);
        [['1', 'LIFT', 'the receiver'], ['2', 'INSERT', 'a coin'], ['3', 'DIAL', 'the number']].forEach(([n, a, b], i) => {
          const y = 0.158 - i * 0.064;
          print(n, -0.041, y - 0.021, 30, red);
          print(a, -0.019, y, 13, ink); print(b, -0.019, y - 0.017, 9.5, ink, 'normal');
        });
      }, { sortDist: WD + 0.01 }));
      // the shelf under it, where the notebook lies: a board across the corner from pane to pane, at the height of the rail
      // along the glass, narrow against the plate and widening as it comes out toward you
      q4(at3, [[-PW, 1.03, 0], [PW, 1.03, 0], [PW + SH, 1.03, SH], [-PW - SH, 1.03, SH]], [96, 100, 106], { sortDist: WD + 0.01 });
      q4(at3, [[-PW - SH, 1.0, SH], [PW + SH, 1.0, SH], [PW + SH, 1.03, SH], [-PW - SH, 1.03, SH]], [74, 78, 84], { sortDist: WD + 0.005 });

      // ---------------- the coin, the receiver, the keys, the coin slot and return, the notebook ----------------
      // the coin: left in the coin return by the last person to use the phone, on the shelf, or dropped on the floor of the
      // booth, by one of the panes near the phone (clear of the shelf, which would hide it looking down)
      const cr0 = ph(0, RET.y0 + 0.006, 0.122), COIN_RET = { x: cr0[0], y: cr0[1], z: cr0[2] }, COIN_W = 0.06;
      const shelfC = at3(0.17, 1.03, 0.13);
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
        id: 'receiver', name: 'Receiver', ...(([x, y, z]) => ({ x, y, z }))(ph(RX, 1.3, 0.135)), w: 0.11 * PK, h: 0.44 * PK,
        onClick() { if (s.line === 'answered') return true; if (s.hook === 'on') lift(); else hangUp(); return true; },
      });
      // a target stands a little in front of the face, and is placed and sized so that on screen it covers just what it
      // stands for there (what glows when it is pointed at is what it stands for: glowWith)
      const front = (u, y0, w, h, d) => {
        const k = (WD - (d || 0.125) * PK) / (WD - 0.104 * PK), p = ph(u, y0, 0.104);   // (the face's point, brought toward the eye)
        return { x: p[0] * k, y: L.eyeH + (p[1] - L.eyeH) * k, z: p[2] * k, w: w * PK * k, h: h * PK * k };
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
        ctx.font = 'bold 20px Arial, Helvetica, sans-serif'; ctx.fillText(ch, 0, ch === '*' ? 5 : 1);
        if (LETTERS[ch]) { ctx.font = 'bold 7px Arial, Helvetica, sans-serif'; ctx.fillText(LETTERS[ch], 0, 12.5); }
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
      // ---------------- the notebook, read where it lies ----------------
      // It lies shut on the shelf, its spiral toward the plate. Clicked, the hand goes to its near corner, and the cover (then,
      // click by click, each page) is lifted by that corner and turned back over the spiral, its free end going first and the
      // sheet curling, to stand against the plate in front of those turned before it; a click on the last page brings the lot
      // back down over it, shut. Clicks made while the hand is on its way, or while a page is still going over, are kept and
      // done in turn (s.nbWant). Nothing is done to the view: it is looked down at as anything is, and read with the zoom.
      const REST = 97 * DEG, restOf = k => REST - k * 1.3 * DEG;   // standing against the plate: k 0 the cover, i + 1 page i
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
      // ---------------- the man: from lamp to lamp ----------------
      // His way in is laid out once (planMan), from the street he comes down and its lamps, and fitted to the time he has
      // (c.T, in which he used to walk all of it at a steady pace, so the race with the phone is as it was): he starts behind
      // the furthest lamp in reach, and at each lamp stands a few seconds lit by it, reaches up (UP), takes hold (GRIP), breaks
      // it, lets his arm come back down (DOWN) and stands a beat in the dark (BEAT); then he rushes on to the next one nearer,
      // far too fast. After the last he comes across to the glass at a walk. Behind a lamp is just past its post as the eye
      // sees it, so the post stands in front of him. Where he is: a distance down his lane (his distFn) and a step to one
      // side of it (c.side, the signalman's lateral), with his feet on the road or up on the pavement (c.yOff)
      const UP = 0.9, GRIP = 0.25, DOWN = 0.55, BEAT = 0.45, RUSH_V = 6.5, WALK_V = 1.4;
      const gap = (a, b) => Math.hypot(a.d - b.d, a.lat - b.lat);
      const groundAt = (x, z) => ((z > 1 && z < 8) || (z >= 8 && Math.abs(x) < 3.5)) ? ROAD : 0;
      const planMan = c => {
        const ln = c.lane, rx = Math.cos(ln.yaw), rz = -Math.sin(ln.yaw), street = ln.deg === 0 ? 0 : 1;
        const toLane = (x, z) => ({ d: x * ln.dirX + z * ln.dirZ, lat: x * rx + z * rz });
        const stops = lamps.filter(lp => lp.street === street).map(lp => {
          const k = 1 + 0.6 / Math.hypot(lp.x, lp.z);
          return Object.assign({ lamp: lp }, toLane(lp.x * k, lp.z * k));
        }).filter(st => st.d <= c.D0 + 12).sort((a, b) => b.d - a.d);
        if (!stops.length) stops.push({ lamp: null, d: c.D0, lat: 0 });
        // after the last lamp: up the main street, straight across it to the door; along the cross street, over the road to
        // the booth's own pavement, and along it to the east pane
        const fin = street === 0 ? [{ d: 1.5, lat: 0.3 }] : [{ d: 7.5, lat: -0.45 }, { d: 1.5, lat: -0.2 }];
        const n = stops.length, rushT = [], walk = [stops[n - 1]].concat(fin);
        for (let i = 0; i + 1 < n; i++) rushT.push(Math.max(1.3, gap(stops[i], stops[i + 1]) / RUSH_V));
        let walkLen = 0;
        for (let i = 0; i + 1 < walk.length; i++) walkLen += gap(walk[i], walk[i + 1]);
        const rushSum = rushT.reduce((a, b) => a + b, 0), act = UP + GRIP + DOWN + BEAT;
        const wait = clamp((c.T - rushSum - walkLen / WALK_V) / n - act, 1.6, 6.5);
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
      // where on him the lamp he stands at is, in his own frame (across and up from his feet, in metres where he stands), for
      // his hand to go to
      const reachFor = (c, st) => {
        const lp = st.lamp; if (!lp) return null;
        const P = APPROACH.position(c.lane, st.d, st.lat, L.eyeH), D = Math.hypot(P.x, P.z), fx = P.x / D, fz = P.z / D;
        const k = D / (lp.hx * fx + lp.hz * fz);
        return { x: (lp.hx * fz - lp.hz * fx) * k, y: L.eyeH + (4.8 - L.eyeH) * k - groundAt(P.x, P.z) };
      };
      // where he is now on his way, and what he is doing there
      const manNow = c => {
        const m = s.man, e = L.t - m.t0, seg = m.segs.find(g => e < g.t1) || m.segs[m.segs.length - 1];
        if (seg !== m.seg) { m.seg = seg; if (seg.kind === 'stop') { c.reachTo = reachFor(c, seg.st); c.reachSide = c.reachTo && c.reachTo.x < 0 ? -1 : 1; } }
        let reach = 0, rush = 0, dark = true, grip = 0;
        if (seg.kind === 'stop') {
          const lp = seg.st.lamp, up = e - seg.t0 - seg.wait;
          m.d = seg.st.d; m.lat = seg.st.lat;
          if (lp && c.reachTo) {
            if (up >= UP + GRIP && lp.outAt === undefined) breakLamp(lp);
            reach = up < 0 ? 0 : up < UP ? smoothstep(up / UP) : up < UP + GRIP ? 1 : 1 - smoothstep((up - UP - GRIP) / DOWN);
            grip = up >= UP * 0.8 && up < UP + GRIP + 0.15 ? 1 : 0;
          }
          dark = !!lp && lp.outAt !== undefined && L.t - lp.outAt > 0.3;
        } else if (seg.kind === 'rush') {
          const k = clamp((e - seg.t0) / (seg.t1 - seg.t0), 0, 1), q = smoothstep(k);
          m.d = lerp(seg.a.d, seg.b.d, q); m.lat = lerp(seg.a.lat, seg.b.lat, q); rush = Math.sin(Math.PI * k);
        } else {
          let left = clamp((e - seg.t0) / (seg.t1 - seg.t0), 0, 1) * seg.len, i = 0;
          while (i + 2 < seg.pts.length && left > gap(seg.pts[i], seg.pts[i + 1])) { left -= gap(seg.pts[i], seg.pts[i + 1]); i++; }
          const a = seg.pts[i], b = seg.pts[i + 1], q = clamp(left / (gap(a, b) || 1), 0, 1);
          m.d = lerp(a.d, b.d, q); m.lat = lerp(a.lat, b.lat, q);
        }
        Object.assign(c, { reach, rush, dark, grip, side: m.lat });
      };
      // laid out the first time he is wanted (drawn on the night's card, or its first frame), and stood at his first lamp
      const manReady = () => {
        const c = sm();
        if (!c || s.man) return c;
        s.man = planMan(c); c.distFn = () => s.man.d; c.dist = s.man.d; c.side = c.lat = s.man.lat;
        const p = c.pos(); c.yOff = groundAt(p.x, p.z) - c.lane.y;
        manNow(c);
        return c;
      };
      L.update = dt => {
        if (G.state === 'play' && !closeUp()) s.padSel = null;
        const c = manReady();
        if (c && !c.dead) {
          if (G.state === 'play' && !L.won) manNow(c);
          else { c.reach = Math.max(0, (c.reach || 0) - dt * 2); c.rush = 0; c.grip = 0; }
          const p = c.pos();
          c.yOff += (groundAt(p.x, p.z) - c.lane.y - c.yOff) * Math.min(1, dt * 14);   // up the kerb and down it in a stride
        }
        lampsNow(dt);
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
      };
      L.isWon = () => s.line === 'answered';
      L.deathCause = () => (s.line === 'ringing' || s.line === 'connecting') ? 'ringing' : s.line === 'dead' ? 'dead' : (s.hook === 'off' && !s.credit && s.deadKeys) ? 'nocoin' : null;

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
        if (!s.padSel) {   // nothing highlighted yet: what is nearest the middle of the view, as the Use button does
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
      // handset; lifted, it runs over the front of the shelf and away toward you, out of the bottom of the view. It is a
      // smooth curve through a few points (u, y, d, as on the phone) with a twist drawn along it for the armour, in short
      // lengths so that each is as thick as it is near
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
      const handset = phSprite(RX, 1.3, 0.13, 0.1, 0.44, (ctx, P) => { ctx.scale(0.1, 0.44); handsetIcon(ctx, P); }, { sortDist: FD - 0.04 });
      // lifted, it is in your left hand, held up toward your ear, its cord running down out of the view to it; it goes off the
      // hook down to the hand, and back up to the hook from it (HANDSET_T), the hand going down out of the way first
      const HANDSET_T = 0.24;
      const handsetItem = { id: 'handset', name: 'Receiver', w: 0.1, h: 0.44, icon: handsetIcon, held: { grip: 'fist', at: [0, 0.48], axis: 0, angle: 0.55, size: 0.32, y: -0.03 } };
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
        const top = s.line === 'dead' ? 'NOT IN SERVICE' : (s.line === 'checking' || s.line === 'connecting' || s.line === 'ringing') ? 'CALLING' : s.line === 'answered' ? 'CONNECTED' : 'CREDIT ' + (s.credit ? '10p' : '0p');
        const b = L.t - s.blinkAt, off = b >= 0 && b < 1.25 && Math.floor(b / 0.16) % 2 === 0;   // a press it will not take: the top line blinks at you
        return [off ? '' : top, fmt(s.dialed.slice(0, Math.max(0, s.dialed.length - s.lagN)))];
      };
      const lcd = phSprite((LCD.u0 + LCD.u1) / 2, LCD.y0, 0.1015, LCD.u1 - LCD.u0, LCD.y1 - LCD.y0, (ctx, P) => {
        const w = LCD.u1 - LCD.u0, h = LCD.y1 - LCD.y0, txt = lcdText();
        P_rect(ctx, -w / 2, 0, w, h, txt ? P.raw([140, 180, 124]) : P.col([38, 48, 40]));
        if (!txt) return;
        ctx.fillStyle = P.raw([20, 34, 22]); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.save(); ctx.translate(-w / 2 + 0.006, h - 0.016); ctx.scale(0.0006, -0.0006); ctx.font = 'bold 20px Arial, Helvetica, sans-serif'; ctx.fillText(txt[0], 0, 0); ctx.restore();
        ctx.save(); ctx.translate(-w / 2 + 0.006, 0.01); ctx.scale(0.00125, -0.00125); ctx.font = 'bold 20px "Courier New", "Liberation Mono", monospace'; ctx.fillText(txt[1], 0, 0); ctx.restore();
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
        R.add(SC.mkQuad(L, ph(0.13, hy, 0.088), ph(0.16, hy, 0.088), ph(0.16, hy + 0.018, 0.088), ph(0.13, hy + 0.018, 0.088), [150, 154, 160], { sortDist: FD - 0.03, glowOf: receiver }));   // the hook
        R.add(SC.mkQuad(L, ph(0.16, hy - 0.01, 0.088), ph(0.168, hy - 0.01, 0.088), ph(0.168, hy + 0.018, 0.088), ph(0.16, hy + 0.018, 0.088), [120, 124, 130], { sortDist: FD - 0.031, glowOf: receiver }));
        if (!off) R.add(handset);
        if (away && away !== true) R.add(away);
        for (const c of off ? cords.off : cords.on) R.add(c);
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
          const him = APPROACH.position(c.lane, e.dFin, c.lat, L.eyeH);
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
      // the car's headlamps, and the light inside it (he brings no light of his own: he is seen by the street lamps', and the
      // booth's)
      L.dynamicLights = () => {
        const out = [], k = carLamps();
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
      // and so is one the eye sees through the pay phone's plate across the corner
      const behindPhone = g => {
        const a = SQ * (g.x + g.z);                                    // how far it is along the line into the corner
        if (a <= WD) return false;
        const k = WD / a, u = SQ * (g.x - g.z) * k, y = L.eyeH + (g.y - L.eyeH) * k;
        return u > -PW && u < PW && y > 0.98 && y < 1.95;
      };
      L.glows = () => {
        const out = lamps.filter(lp => lp.glow.a > 0.004).map(lp => lp.glow).filter(g => !behindHim(g) && !behindPhone(g));
        const k = carLamps();
        if (k) {
          const fade = clamp((L.aftermathT - CAR.T0) / 0.6, 0, 1);
          for (const h of k.heads) out.push({ x: h[0], y: h[1], z: h[2], r: k.facing ? 1.1 : 0.5, color: [255, 240, 206], a: (k.facing ? 0.75 : 0.3) * fade });
          if (k.inside) out.push({ x: k.inside[0], y: k.inside[1], z: k.inside[2], r: 0.7, color: [255, 200, 130], a: 0.22 });
        }
        return out;
      };
      // (not under the corner shelf, where a thing dropped would be hidden looking down)
      const shelfFoot = (WD - SH) / SQ - (B - 0.07);
      L.floor = { poly: [[XW + 0.08, -B + 0.07], [B - 0.07, -B + 0.07], [B - 0.07, shelfFoot], [shelfFoot, B - 0.07], [XW + 0.08, B - 0.07]], y: 0.03 };
    },
  });
})();
