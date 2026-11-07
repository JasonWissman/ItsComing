'use strict';
// ============================================================ 9. THE PHONE BOOTH ============================================================
// A phone booth on a corner, at night, in the rain, with glass all round. A man in a long coat is walking toward it from a long
// way off, down one of three streets, swinging a lantern. Somewhere in your notebook, among the shopping and the dentist, is the
// number to ring. Find the page, lift the receiver and dial it: it rings for seven seconds while he keeps coming, and then
// someone picks up and he turns round. Every other number in the notebook belongs to someone ordinary, and is not in service.
// The notebook and the keypad are panels at the bottom of the screen, made here and taken away in onEnd, so the street stays
// in view while you read and dial; the night goes on behind them.
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
});
(() => {
  const B = 0.55;              // the booth's half-width: the glass is this far from the eye ahead and to either side
  const BK = 0.8;              // and this far behind, where the pay phone is
  const ROAD = -0.12;          // the road is a kerb's height below the pavement the booth stands on
  // ---------------- the notebook ----------------
  // lines of handwriting: '#' a heading, '~' crossed out, '!' underlined twice; {n} an ordinary number, {k} the one to ring
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
  const KEY = [
    ['If it ever comes back:', '{k}.', '!Do not wait.'],
    ['If you see him again,', 'ring {k}.', '!Don\'t wait for him to get close.'],
    ['when he comes back', '{k}', '!straight away. Don\'t wait.'],
  ];
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
    pages.splice(keyPage, 0, KEY[Math.floor(rand() * KEY.length)]);
    const filled = pages.map(lines => lines.map(l => l.replace('{k}', key).replace(/\{n\}/g, () => { const n = num(); others.push(n); return n; })));
    return { pages: filled, keyPage, numberText: key, number: key.replace('-', ''), others: others.map(n => n.replace('-', '')) };
  }
  const esc = t => String(t).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  // a page as handwriting: each line a little off the level, a little off the margin, each word a little off the line
  function pageHTML(lines, rand) {
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
.pb-pno { position: absolute; right: 14px; bottom: 4px; font: italic 13px Georgia, 'Liberation Serif', serif; color: rgba(34,48,92,.5); }
.pb-nav { position: absolute; z-index: 1; left: 12px; right: 12px; bottom: 7px; height: 28px; display: flex; align-items: center; justify-content: space-between; }
.pb-nav span { font: 11px Georgia, 'Liberation Serif', serif; letter-spacing: .3em; color: rgba(234,223,196,.42); }
.pb-nb button, .pb-kp .pb-kx { background: rgba(0,0,0,.28); border: 1px solid rgba(234,223,196,.28); color: #eadfc4; font: 20px Georgia, 'Liberation Serif', serif; width: 46px; height: 28px; border-radius: 4px; cursor: pointer; line-height: 1; padding: 0; }
.pb-nb button:hover:not(:disabled), .pb-kp .pb-kx:hover { border-color: rgba(234,223,196,.75); background: rgba(0,0,0,.45); }
.pb-nb button:disabled { opacity: .28; cursor: default; }
.pb-nb .pb-close, .pb-kp .pb-kx { position: absolute; top: -11px; right: -11px; width: 28px; height: 28px; border-radius: 50%; font-size: 17px; z-index: 3; background: #2a1d16; }
.pb-flip { animation: pbflip .17s ease-out; }
@keyframes pbflip { from { transform: translateY(-10px); opacity: .15; } to { transform: none; opacity: 1; } }
.pb-kp { position: fixed; right: 22px; bottom: 22px; width: 198px; padding: 12px 13px; border-radius: 9px; background: linear-gradient(165deg, #a0a4ab 0%, #6e7279 46%, #4c5056 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.4), inset 0 -3px 8px rgba(0,0,0,.45), 0 10px 26px rgba(0,0,0,.7); font-family: Arial, Helvetica, 'Liberation Sans', sans-serif; -webkit-user-select: none; user-select: none; }
.pb-kp .pb-kx { background: #2a2c30; font: 16px Arial, 'Liberation Sans', sans-serif; }
.pb-lcd { background: #142018; border-radius: 3px; box-shadow: inset 0 2px 6px #000; padding: 5px 9px 3px; margin-bottom: 10px; }
.pb-num { font: 20px 'Courier New', 'Liberation Mono', monospace; letter-spacing: 2px; color: #a8e2a4; height: 23px; white-space: nowrap; overflow: hidden; }
.pb-st { font: 10px Arial, 'Liberation Sans', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: rgba(168,226,164,.62); height: 13px; white-space: nowrap; }
.pb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
.pb-k { height: 42px; border-radius: 5px; border: 1px solid #2a2c30; background: linear-gradient(#f2f3f4, #b6b9be); color: #151515; font: bold 19px Arial, 'Liberation Sans', sans-serif; box-shadow: 0 3px 0 #2b2d31, inset 0 1px 0 #fff; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0; line-height: 1; }
.pb-k small { font-size: 7.5px; letter-spacing: .1em; color: #4a4a4a; margin-top: 2px; font-weight: normal; height: 8px; }
.pb-k:hover { background: linear-gradient(#ffffff, #c9ccd1); }
.pb-k:active, .pb-k.dn { transform: translateY(2px); box-shadow: 0 1px 0 #2b2d31, inset 0 1px 3px rgba(0,0,0,.35); }
.pb-hang { margin-top: 11px; width: 100%; height: 30px; border-radius: 4px; border: 1px solid #17181b; background: #26282c; color: #d9d3c5; font: 11px Arial, 'Liberation Sans', sans-serif; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; }
.pb-hang:hover { background: #34373c; }
@media (pointer: coarse) { .pb-kp, .pb-nb { bottom: 150px; } }
@media (max-width: 700px) { .pb-nb { left: 8px; width: calc(58vw - 16px); max-width: none; } .pb-kp { right: 8px; width: calc(40vw - 16px); padding: 8px; } .pb-k { height: 34px; } }
@media (pointer: coarse) and (max-height: 520px) {
  .pb-kp { bottom: 128px; right: 10px; width: 198px; padding: 12px 13px; transform: scale(.72); transform-origin: 100% 100%; }
  .pb-k { height: 42px; }
  .pb-nb { --lh: 21px; --pt: 15px; --mx: 30px; bottom: 128px; left: 10px; width: 300px; max-width: calc(100vw - 190px); }
  .pb-cover { padding: 15px 10px 34px; }
  .pb-sheet, .pb-page { min-height: 0; }
  .pb-page { padding-bottom: 8px; font-size: calc(13.5px * var(--text-scale)); }
  .pb-nav { bottom: 4px; }
}
`;

  LEVELS.push({
    id: 'booth', title: 'The Phone Booth', facing: 0, eyeH: 1.65,
    pal: { skyTop: [12, 11, 16], fog: [50, 45, 47], ground: [22, 22, 26], fogDist: 82 },
    ambient: { wind: 0.35, rain: 1, drone: 0.45, droneFreq: 47, windFreq: 300 },
    weather: { kind: 'rain', density: 0.9, wind: 0.25 },
    lights: [{ x: 0, y: 2.25, z: -0.12, r: 3.3, i: 0.55, color: [214, 228, 255], flicker: 0.05 }],
    startInv: ['journal'],
    text: {
      intro: 'It has rained since the last bus, and the phone booth on the corner is the only dry place on the street.<br>Someone in a long coat is walking toward it from a long way off, in step, swinging a lantern. You have seen him before. The last time, you wrote something down.',
      death: { default: 'He came through the glass as if it were rain.', ringing: 'It was still ringing when he came through the glass.', dead: 'You were still listening to a dead line when he came through the glass.' },
      win: 'Someone picked up and said your name, once, quietly, the way you call something home. Out in the rain he stopped where he was and stood there for a long time. Then he turned round and walked back the way he had come.',
      fragment: 'The number is still in the notebook, in your own handwriting. You do not remember writing it down, and you have not crossed it out.',
    },
    // three streets, each seen whole through a pane of the booth: up the main street through the door, and both ways along
    // the pavement the booth stands on. The pay phone is on the fourth side, so nothing comes from behind it.
    lanes: [
      { deg: 0, name: 'up the street', y: ROAD, apertures: [{ z: B, x0: -0.46, x1: 0.3, y0: 1.06, y1: 2.04 }] },
      { deg: 90, name: 'along to the east', apertures: [{ z: B, x0: -0.46, x1: 0.46, y0: 1.06, y1: 2.04 }] },
      { deg: 270, name: 'along to the west', apertures: [{ z: B, x0: -0.46, x1: 0.46, y0: 1.06, y1: 2.04 }] },
    ],
    laneSwitch: false,   // he keeps to the street he started down: the race is with the phone, not with finding him
    // he reaches the glass in 33 to 41 s. A careful reader finds the number by page four on average, has dialled it by about
    // 17 s and is answered by 24; with the number on the last page and his quickest walk there are a few seconds to spare,
    // and a wrong number first costs about six
    creatures: [{ type: 'signalman', startDist: 55, time: 64 }],
    aftermath: { type: 'away', dur: 7.5, wait: 2.6, speed: 1.3 },
    build(L) {
      const s = L.s;
      const nb = writeNotebook(L.rand);
      const inkRand = mulberry32((L.rand() * 4294967295) >>> 0);
      const pageHtml = nb.pages.map(p => pageHTML(p, inkRand));
      Object.assign(s, { pages: nb.pages, keyPage: nb.keyPage, number: nb.number, numberText: nb.numberText, others: nb.others,
        hook: 'on', line: 'idle', dialed: '', doneAt: 0, ringFrom: null, answeredAt: null, nbOpen: false, padOpen: false, page: 0 });

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
      // a metre and a bit across and a little deeper: you stand nearer the door, with the phone at arm's length behind you
      const metal = [70, 74, 80], metalD = [52, 55, 61], glass = [150, 172, 198], band = [44, 46, 52];
      SC.floorQ(L, -B, -BK, B, B, 0.03, [62, 64, 70], { tex: 'tin', texScale: 0.35 });
      for (const [x, z] of [[-B, -BK], [B, -BK], [-B, B], [B, B]]) SC.box(L, x - 0.035, x + 0.035, 0, 2.36, z - 0.035, z + 0.035, metal);
      const side = (x0, z0, x1, z1) => {
        const ux = Math.sign(x1 - x0) * 0.035, uz = Math.sign(z1 - z0) * 0.035, a = [x0 + ux, z0 + uz], b = [x1 - ux, z1 - uz];
        SC.wallV(L, a[0], a[1], b[0], b[1], 0.03, 0.26, metalD);
        SC.wallV(L, a[0], a[1], b[0], b[1], 0.26, 0.98, glass, { alpha: 0.08, noLight: true });
        SC.wallV(L, a[0], a[1], b[0], b[1], 0.98, 1.04, metal);
        SC.wallV(L, a[0], a[1], b[0], b[1], 1.04, 2.06, glass, { alpha: 0.08, noLight: true });
        SC.wallV(L, a[0], a[1], b[0], b[1], 2.06, 2.36, band);
      };
      side(-B, B, B, B); side(B, B, B, -BK); side(B, -BK, -B, -BK); side(-B, -BK, -B, B);
      SC.quad(L, [-B, 2.36, -BK], [B, 2.36, -BK], [B, 2.36, B], [-B, 2.36, B], [36, 38, 44]);
      SC.quad(L, [-0.3, 2.35, -0.17], [0.3, 2.35, -0.17], [0.3, 2.35, -0.07], [-0.3, 2.35, -0.07], [236, 242, 255], { noFog: true, noLight: true });
      // the door's pull (the door is the north pane): a dull bar on two stand-offs from the glass, so it reads as part of the
      // door and not as something lying loose to be picked up
      SC.box(L, 0.355, 0.375, 0.94, 1.32, B - 0.07, B - 0.05, [92, 96, 104]);
      for (const y of [0.97, 1.27]) SC.box(L, 0.358, 0.372, y, y + 0.022, B - 0.05, B - 0.004, [76, 80, 88]);
      // the pay phone on the back wall: its plate, the housing, an instruction card, the coin slot, the keypad, the coin return
      const PZ = -BK + 0.1, face = { sortDist: -PZ - 0.01 }, detail = { sortDist: -PZ - 0.015 };   // PZ: the housing's front
      SC.box(L, -0.22, 0.24, 0.98, 2.04, -BK + 0.005, -BK + 0.02, [58, 62, 68]);
      SC.box(L, -0.12, 0.12, 1.26, 1.84, -BK + 0.02, PZ, [128, 132, 140]);
      SC.box(L, -0.125, 0.125, 1.82, 1.85, -BK + 0.02, PZ + 0.01, [96, 100, 108]);
      SC.wallV(L, -0.095, PZ + 0.001, 0.025, PZ + 0.001, 1.64, 1.77, [214, 208, 190], face);
      for (let k = 0; k < 4; k++) SC.wallV(L, -0.085, PZ + 0.0015, 0.0, PZ + 0.0015, 1.665 + k * 0.024, 1.671 + k * 0.024, [90, 96, 120], detail);
      SC.wallV(L, 0.05, PZ + 0.001, 0.095, PZ + 0.001, 1.71, 1.76, [44, 46, 50], face); SC.wallV(L, 0.066, PZ + 0.0015, 0.079, PZ + 0.0015, 1.718, 1.752, [8, 8, 10], detail);
      SC.wallV(L, -0.07, PZ + 0.001, 0.07, PZ + 0.001, 1.36, 1.605, [96, 100, 106], face);
      // the keys, each with its figure on it, as on the keypad that comes up when you dial (facing the phone, +x is on your left)
      const KEYS = ['123', '456', '789', '*0#'];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
        const x = (1 - c) * 0.045, y = 1.555 - r * 0.052, ch = KEYS[r][c];
        SC.wallV(L, x - 0.017, PZ + 0.0015, x + 0.017, PZ + 0.0015, y - 0.017, y + 0.017, [212, 214, 216], detail);
        SC.sprite(L, x, y - 0.013, PZ + 0.002, 0.026, 0.026, (ctx, P) => {
          ctx.translate(0, 0.013); ctx.scale(0.00105, -0.00105);
          ctx.font = 'bold 20px Arial, Helvetica, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = P.col([30, 32, 38]); ctx.fillText(ch, 0, ch === '*' ? 5 : 1);
        }, { sortDist: -PZ - 0.02 });
      }
      SC.wallV(L, -0.045, PZ + 0.001, 0.045, PZ + 0.001, 1.28, 1.33, [30, 30, 34], face);
      // the shelf under it, and the phone book chained to it: a fat directory lying with its spine to the wall, so what faces
      // you is the block of pages between its yellow covers. Only the faces the eye can see are built (the eye is almost in
      // line with its near side, which would only ever show as a sliver drawn over the cover)
      SC.box(L, -0.32, 0.32, 1.0, 1.03, -BK + 0.02, -BK + 0.24, [96, 100, 106]);
      const PB = { x0: -0.25, x1: -0.01, z0: -BK + 0.04, z1: -BK + 0.2, y0: 1.03, y1: 1.1 }, cv = 0.008;
      const yellow = [200, 166, 54], yellowD = scalec(yellow, 0.72);
      SC.quad(L, [PB.x0, PB.y1, PB.z0], [PB.x1, PB.y1, PB.z0], [PB.x1, PB.y1, PB.z1], [PB.x0, PB.y1, PB.z1], yellow);   // the cover
      SC.wallV(L, PB.x0, PB.z1, PB.x1, PB.z1, PB.y1 - cv, PB.y1, yellowD);                                             // its edge
      SC.wallV(L, PB.x0 + 0.004, PB.z1 - 0.003, PB.x1 - 0.004, PB.z1 - 0.003, PB.y0 + cv, PB.y1 - cv, [216, 208, 184]);   // the pages
      for (const y of [1.052, 1.07]) SC.wallV(L, PB.x0 + 0.004, PB.z1 - 0.0025, PB.x1 - 0.004, PB.z1 - 0.0025, y, y + 0.0025, [170, 160, 136], { sortDist: -PB.z1 - 0.004 });
      SC.wallV(L, PB.x0, PB.z1, PB.x1, PB.z1, PB.y0, PB.y0 + cv, yellowD);                                             // the back cover's edge
      // on the cover, toward the spine: the black band the title is printed in, and a line of small print under it
      const onCover = (z0, z1, col) => SC.quad(L, [PB.x0 + 0.022, PB.y1 + 0.001, z0], [PB.x1 - 0.022, PB.y1 + 0.001, z0], [PB.x1 - 0.022, PB.y1 + 0.001, z1], [PB.x0 + 0.022, PB.y1 + 0.001, z1], col, { sortDist: -PB.z1 + 0.02 });
      onCover(PB.z0 + 0.024, PB.z0 + 0.056, [34, 30, 26]); onCover(PB.z0 + 0.07, PB.z0 + 0.078, [120, 96, 34]);
      // the chain, from the book's corner down to a ring at the back of the shelf
      SC.quad(L, [PB.x0, 1.07, PB.z0 + 0.03], [-0.268, 1.046, PB.z0 + 0.02], [-0.284, 1.034, PB.z0 + 0.005], [-0.296, 1.04, -BK + 0.03], [140, 142, 148], { stroke: true, lw: 0.005 });
      SC.box(L, -0.304, -0.288, 1.03, 1.05, -BK + 0.02, -BK + 0.03, [120, 122, 128]);

      // ---------------- the notebook, the receiver, the keypad, the phone book ----------------
      const journal = mkItem(L, 'journal', 'Notebook', { x: 0.2, y: 1.03, z: -BK + 0.14 }, { w: 0.18, h: 0.22, tool: true, icon: 'notebook' });
      let dom = null;
      const shown = { nb: false, kp: false };
      const fmt = d => d.length > 3 ? d.slice(0, 3) + '-' + d.slice(3) : d;
      const STATUS = { idle: '', tone: 'dial tone', dialing: '', checking: '', dead: 'not in service', connecting: '', ringing: 'ringing', answered: 'connected' };
      const drawPad = () => { if (!dom) return; dom.num.textContent = fmt(s.dialed); dom.st.textContent = STATUS[s.line] || ''; };
      const drawPage = flip => {
        if (!dom) return;
        dom.page.innerHTML = pageHtml[s.page]; dom.pno.textContent = String(s.page + 1);
        dom.prev.disabled = s.page === 0; dom.next.disabled = s.page === pageHtml.length - 1;
        if (flip) { dom.sheet.classList.remove('pb-flip'); void dom.sheet.offsetWidth; dom.sheet.classList.add('pb-flip'); }
      };
      // the panels are made the first time they are wanted, under the HUD (the toast, the tooltip and what you hold are always
      // drawn over them) and so under the game's own overlay (a menu always covers them)
      const ensureDom = () => {
        if (dom) return;
        const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
        const nbEl = document.createElement('div'); nbEl.className = 'pb-nb'; nbEl.style.display = 'none'; nbEl.setAttribute('aria-label', 'Notebook');
        nbEl.innerHTML = '<div class="pb-cover"><div class="pb-rings"></div><button type="button" class="pb-close" aria-label="Close the notebook">×</button><div class="pb-sheet"><div class="pb-page"></div><div class="pb-pno"></div></div><div class="pb-nav"><button type="button" class="pb-prev" aria-label="Previous page">‹</button><span>← →</span><button type="button" class="pb-next" aria-label="Next page">›</button></div></div>';
        const kpEl = document.createElement('div'); kpEl.className = 'pb-kp'; kpEl.style.display = 'none'; kpEl.setAttribute('aria-label', 'Keypad');
        kpEl.innerHTML = '<button type="button" class="pb-kx" aria-label="Put the keypad away">×</button><div class="pb-lcd"><div class="pb-num"></div><div class="pb-st"></div></div><div class="pb-grid">' +
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => '<button type="button" class="pb-k" data-k="' + k + '">' + k + '<small>' + (LETTERS[k] || '') + '</small></button>').join('') + '</div><button type="button" class="pb-hang">Hang up</button>';
        const before = document.getElementById('hud') || document.getElementById('overlay');
        for (const el of [nbEl, kpEl]) {
          if (before) document.body.insertBefore(el, before); else document.body.appendChild(el);
          el.addEventListener('mousedown', e => e.preventDefault());               // no focus, no text selection
          el.addEventListener('mousemove', e => { e.stopPropagation(); G.mouse.x = -1; G.mouse.y = -1; });   // nothing behind the panel is hovered
          el.addEventListener('click', e => e.stopPropagation());
        }
        dom = { style, nbEl, kpEl, page: nbEl.querySelector('.pb-page'), pno: nbEl.querySelector('.pb-pno'), sheet: nbEl.querySelector('.pb-sheet'), prev: nbEl.querySelector('.pb-prev'), next: nbEl.querySelector('.pb-next'), num: kpEl.querySelector('.pb-num'), st: kpEl.querySelector('.pb-st') };
        dom.prev.addEventListener('click', () => turn(-1)); dom.next.addEventListener('click', () => turn(1));
        nbEl.querySelector('.pb-close').addEventListener('click', () => setNotebook(false));
        kpEl.querySelector('.pb-kx').addEventListener('click', () => { s.padOpen = false; AUDIO.sfx('ui'); sync(); });
        kpEl.querySelector('.pb-hang').addEventListener('click', () => { if (s.hook === 'off' && s.line !== 'answered') hangUp(); });
        for (const b of kpEl.querySelectorAll('.pb-k')) b.addEventListener('click', () => press(b.dataset.k, false));
        drawPage(false); drawPad();
      };
      // show what is wanted, and only while the night is being played: a pause, a death or the win puts both away
      const sync = () => {
        if (!G.inv.includes(journal)) s.nbOpen = false;          // put down, it cannot be read
        if (s.hook !== 'off' || s.line === 'answered') s.padOpen = false;
        receiver.name = s.hook === 'off' ? 'Hook' : 'Receiver';   // with the receiver in your hand, what is left to click is the hook
        const live = G.L === L && G.state === 'play';
        const nbShow = live && s.nbOpen, kpShow = live && s.padOpen;
        if ((nbShow || kpShow) && !dom) ensureDom();
        if (!dom) return;
        if (nbShow !== shown.nb) { dom.nbEl.style.display = nbShow ? '' : 'none'; shown.nb = nbShow; }
        if (kpShow !== shown.kp) { dom.kpEl.style.display = kpShow ? '' : 'none'; shown.kp = kpShow; }
      };
      const setNotebook = open => { s.nbOpen = open; AUDIO.sfx(open ? 'pickup' : 'ui'); sync(); };
      const turn = d => { const p = clamp(s.page + d, 0, pageHtml.length - 1); if (p === s.page) return; s.page = p; AUDIO.sfx('ui'); drawPage(true); };
      const openPad = () => { s.padOpen = true; sync(); drawPad(); };
      const lift = () => { s.hook = 'off'; s.line = 'tone'; s.dialed = ''; AUDIO.sfx('receiver'); G.say('You lift the receiver. A dial tone.', 'A dial tone.'); openPad(); };
      const hangUp = () => {
        const ringing = s.line === 'ringing' || s.line === 'connecting';
        s.hook = 'on'; s.line = 'idle'; s.dialed = ''; s.ringFrom = null; AUDIO.sfx('clunk');
        if (ringing) G.say('You hung up. The ringing stops.', 'The ringing stops.');
        sync(); drawPad();
      };
      // one press of a key: a beep whatever happens; only a live line that is still being dialled takes the digit
      const press = (k, fromKey) => {
        if (s.hook !== 'off' || s.line === 'answered') return;
        AUDIO.sfx('dial');
        if (fromKey && dom) { const b = dom.kpEl.querySelector('[data-k="' + k + '"]'); if (b) { b.classList.add('dn'); setTimeout(() => b.classList.remove('dn'), 120); } }
        if (k === '*' || k === '#') return;
        if (s.line === 'dead') { G.say('The line is dead. Hang up and try again.', 'The line is dead.'); return; }
        if (s.line !== 'tone' && s.line !== 'dialing') return;
        s.dialed += k; s.line = 'dialing';
        if (s.dialed.length === 7) { s.line = s.dialed === s.number ? 'connecting' : 'checking'; s.doneAt = L.t; }
        drawPad();
      };
      const receiver = mkTarget(L, {
        id: 'receiver', name: 'Receiver', x: 0.166, y: 1.27, z: PZ + 0.03, w: 0.11, h: 0.44,
        onClick() { if (s.line === 'answered') return true; if (s.hook === 'on') lift(); else hangUp(); return true; },
      });
      mkTarget(L, {
        id: 'keypad', name: 'Keypad', x: 0, y: 1.35, z: PZ + 0.01, w: 0.16, h: 0.27,
        onClick() { if (s.hook !== 'off') { G.say('The receiver is still on its hook.', 'The receiver is on its hook.'); AUDIO.sfx('nope'); } else if (s.line !== 'answered') { openPad(); AUDIO.sfx('ui'); } return true; },
      });
      // what you click is the whole book as the eye sees it: up the plane of its front edge to where the back of its cover shows
      const bookTop = L.eyeH + (PB.y1 - L.eyeH) * PB.z1 / PB.z0;
      mkTarget(L, {
        id: 'book', name: 'Phone book', x: (PB.x0 + PB.x1) / 2, y: PB.y0 - 0.004, z: PB.z1, w: PB.x1 - PB.x0 + 0.016, h: bookTop - PB.y0 + 0.012,
        onClick() { AUDIO.sfx('nope'); G.say('The phone book has been out in the damp too long. The pages will not come apart.', 'The pages are swollen with damp. They will not come apart.'); return true; },
      });
      const sm = () => L.creatures[0];
      // the exchange: a wrong number is not in service; the right one connects, rings for seven seconds from the last digit, and is answered
      L.update = () => {
        if (s.line === 'checking' && L.t - s.doneAt > 0.7) { s.line = 'dead'; AUDIO.sfx('noService'); G.say('The number you have dialled is not in service.', 'The number you have dialled is not in service.', 3.2); drawPad(); }
        if (s.line === 'connecting' && L.t - s.doneAt > 0.9) { s.line = 'ringing'; s.ringFrom = s.doneAt; s.nextRing = L.t + 3; AUDIO.sfx('ringback'); G.say('It is ringing.', 'It is ringing.'); drawPad(); }
        if (s.line === 'ringing' && L.t >= s.nextRing) { s.nextRing = L.t + 3; AUDIO.sfx('ringback'); }   // one ring every 3 s, only while it rings: hanging up stops it
        if (s.line === 'ringing' && L.t - s.ringFrom >= 7) {
          s.line = 'answered'; s.answeredAt = L.t; AUDIO.sfx('answer'); G.say('Someone picks up.', 'Someone picks up.', 3.5);
          s.nbOpen = false; s.padOpen = false; drawPad(); sync();
        }
      };
      L.isWon = () => s.line === 'answered';
      L.onCatch = () => { s.nbOpen = false; s.padOpen = false; sync(); return false; };
      L.deathCause = () => (s.line === 'ringing' || s.line === 'connecting') ? 'ringing' : s.line === 'dead' ? 'dead' : null;

      // ---------------- input: the notebook from the inventory, the keys while a panel is open ----------------
      const invEl = document.getElementById('inventory');
      const onInv = e => {
        if (G.L !== L || G.state !== 'play') return;
        const slot = e.target && e.target.closest ? e.target.closest('.slot') : null; if (!slot) return;
        const idx = Array.prototype.indexOf.call(invEl.children, slot);
        if (G.inv[idx] !== journal) return;
        e.stopPropagation();                                     // clicking the notebook opens it (or shuts it); it is never put down this way
        G.active = idx; G.invSig = '';
        setNotebook(!s.nbOpen);
      };
      const onKey = e => {
        if (G.L !== L || G.state !== 'play') return;
        const k = e.key;
        if (shown.kp && k && k.length === 1 && '0123456789*#'.includes(k)) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) press(k, true); return; }   // the number keys dial instead of choosing what you hold
        if (shown.nb && (k === 'ArrowLeft' || k === 'ArrowRight')) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) turn(k === 'ArrowLeft' ? -1 : 1); }   // A and D still turn
      };
      if (invEl) invEl.addEventListener('click', onInv, true);
      window.addEventListener('keydown', onKey, true);
      L.onEnd = () => {
        window.removeEventListener('keydown', onKey, true);
        if (invEl) invEl.removeEventListener('click', onInv, true);
        if (dom) { dom.nbEl.remove(); dom.kpEl.remove(); dom.style.remove(); dom = null; }
        shown.nb = shown.kp = false;
      };

      // ---------------- every frame: the receiver, its cord, rain running down the glass ----------------
      const drops = [];
      const drng = mulberry32(4242);
      for (const [x0, z0, x1, z1, nx, nz] of [[-B, B, B, B, 0, 1], [B, B, B, -BK, 1, 0], [B, -BK, -B, -BK, 0, -1], [-B, -BK, -B, B, -1, 0]])
        for (let k = 0; k < 11; k++) drops.push({ x0, z0, x1, z1, nx, nz, u: 0.06 + drng() * 0.88, v: 0.04 + drng() * drng() * 0.4, ph: drng() * 10, len: 0.015 + drng() * 0.04 });
      // the cord: steel-armoured, out of the bottom of the housing. On the hook it hangs in a loop to the bottom of the
      // handset; lifted, it runs over the front of the shelf and away toward you, out of the bottom of the view. It is a
      // smooth curve through a few points with a twist drawn along it for the armour, in short lengths so that each is as
      // thick as it is near
      const Z = PZ - 0.02;
      const cord = (ctrl, sd) => {
        const out = [];
        for (let i = 0; i < ctrl.length - 1; i++) {
          const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)], seg = [];
          const n = Math.max(6, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]) / 0.009));   // a twist every centimetre or so
          for (let k = 0; k <= n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; seg.push([0, 1, 2].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
          const twist = seg.map((p, k) => { const q = seg[Math.min(n, k + 1)], r = seg[Math.max(0, k - 1)], dx = q[0] - r[0], dy = q[1] - r[1], l = Math.hypot(dx, dy) || 1, s = (k & 1 ? 1 : -1) * 0.0028; return [p[0] + dy / l * s, p[1] - dx / l * s, p[2]]; });
          const w = pts => pts.map(p => L.pt(p[0], p[1], p[2]));
          out.push({ kind: 'poly', pts: w(seg), color: [54, 56, 62], stroke: true, lw: 0.0075, sortDist: sd - i * 0.0001 });
          out.push({ kind: 'poly', pts: w(twist), color: [124, 126, 132], stroke: true, lw: 0.0016, sortDist: sd - i * 0.0001 - 0.00005 });
        }
        return out;
      };
      const cords = {
        on: cord([[0.1, 1.26, Z], [0.104, 1.17, Z + 0.01], [0.13, 1.115, Z + 0.02], [0.158, 1.17, Z + 0.03], [0.166, 1.28, Z + 0.03]], -PZ - 0.035),
        off: cord([[0.1, 1.26, Z], [0.104, 1.1, Z + 0.1], [0.11, 1.042, -BK + 0.245], [0.13, 0.9, -0.42], [0.15, 0.86, -0.3], [0.17, 1.0, -0.15], [0.18, 1.2, -0.05]], 0.3),
      };
      // the handset, drawn as a billboard: the eye only ever sees it from where you stand
      const handset = SC.mkSprite(L, 0.166, 1.27, PZ + 0.03, 0.1, 0.44, (ctx, P) => {
        ctx.scale(0.1, 0.44);
        const k = P.col([20, 20, 22]), kl = P.col([58, 58, 64]), kd = P.col([6, 6, 8]);
        P_ell(ctx, 0, 0.885, 0.46, 0.1, k); P_rect(ctx, -0.46, 0.8, 0.92, 0.085, k);       // the earpiece
        P_rect(ctx, -0.2, 0.17, 0.4, 0.66, k);                                              // the grip
        P_ell(ctx, 0, 0.11, 0.46, 0.1, k); P_rect(ctx, -0.46, 0.11, 0.92, 0.09, k);         // the mouthpiece
        P_line(ctx, -0.09, 0.26, -0.09, 0.74, 0.05, kl);                                    // the light along it
        for (const y of [0.86, 0.14]) for (const x of [-0.18, 0, 0.18]) P_ell(ctx, x, y, 0.05, 0.012, kd);
      }, { sortDist: -PZ - 0.04 });
      // the empty cradle the handset hangs in, seen once it is lifted: a dark arm with a cup for each end, so what is left
      // to click (the hook) is a thing you can see, the shape of what was taken from it
      const cradle = SC.mkSprite(L, 0.166, 1.27, PZ + 0.03, 0.1, 0.44, (ctx, P) => {
        ctx.scale(0.1, 0.44);
        const arm = P.col([22, 23, 27]), cup = P.col([34, 35, 40]), hole = P.col([6, 6, 8]), bolt = P.col([96, 98, 104]);
        P_rect(ctx, -0.16, 0.15, 0.32, 0.7, arm);
        for (const y of [0.86, 0.14]) { P_ell(ctx, 0, y, 0.42, 0.062, cup); P_ell(ctx, 0, y + (y > 0.5 ? 0.01 : -0.01), 0.3, 0.034, hole); }
        for (const y of [0.32, 0.68]) P_ell(ctx, 0, y, 0.055, 0.012, bolt);
      }, { sortDist: -PZ - 0.025 });
      L.dynamic = () => {
        sync();
        const off = s.hook === 'off';
        const hy = off ? 1.665 : 1.615;   // the hook rises when the weight comes off it
        if (off) R.add(cradle);
        R.add(SC.mkQuad(L, [0.12, hy, PZ - 0.012], [0.15, hy, PZ - 0.012], [0.15, hy + 0.018, PZ - 0.012], [0.12, hy + 0.018, PZ - 0.012], [150, 154, 160], { sortDist: -PZ - 0.03 }));
        R.add(SC.mkQuad(L, [0.15, hy - 0.01, PZ - 0.012], [0.158, hy - 0.01, PZ - 0.012], [0.158, hy + 0.018, PZ - 0.012], [0.15, hy + 0.018, PZ - 0.012], [120, 124, 130], { sortDist: -PZ - 0.031 }));
        if (!off) R.add(handset);
        for (const c of off ? cords.off : cords.on) R.add(c);
        // rain on the outside of the glass: thin runs, each sliding down at its own pace with a bead of water at its foot
        for (const d of drops) {
          const x = d.x0 + (d.x1 - d.x0) * d.u + d.nx * 0.012, z = d.z0 + (d.z1 - d.z0) * d.u + d.nz * 0.012;
          const y = 2.02 - ((L.t * d.v + d.ph) % 1.7);
          if (y < 0.3) continue;
          const at = (a, dy) => [x + d.nz * a, y + dy, z + d.nx * a];   // a along the pane, dy up it
          R.add({ kind: 'poly', pts: [at(-0.0008, d.len), at(0.0008, d.len), at(0.0009, 0.006), at(0.0026, 0.0032), at(0, 0), at(-0.0026, 0.0032), at(-0.0009, 0.006)].map(p => L.pt(p[0], p[1], p[2])), color: [196, 208, 228], alpha: 0.3, noFog: true, noLight: true });
        }
      };
      // his lantern: a warm light that walks with him, and its glow
      const lanternAt = () => { const c = sm(), p = c.pos(), side = c.away ? -0.46 : 0.46; return { x: p.x + Math.cos(c.yaw) * side, y: p.y + 0.75, z: p.z - Math.sin(c.yaw) * side }; };
      L.dynamicLights = () => { const p = lanternAt(); return [{ x: p.x, y: p.y, z: p.z, r: 4.5, i: 0.6, color: [255, 190, 110], flicker: 0.3, seed: 5, cone: { x: 0, y: -1, z: 0, cos: Math.cos(75 * DEG) } }]; };
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
      L.glows = () => { const p = lanternAt(); return lampGlows.filter(g => !behindHim(g)).concat([{ x: p.x, y: p.y, z: p.z, r: 1.5, color: [255, 190, 110], a: 0.42 }]); };
      L.floor = { poly: [[-0.48, -BK + 0.08], [0.48, -BK + 0.08], [0.48, 0.48], [-0.48, 0.48]], y: 0.03 };
    },
  });
})();
