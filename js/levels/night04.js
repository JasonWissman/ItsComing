'use strict';
// ============================================================ 4. THE QUARRY ============================================================
{
  // heavy links along a path, a ring seen face-on and then one seen edge-on in turn, dark iron with a dull light on it
  const links = (ctx, P, path, n, size, rgb) => {
    const iron = P.col(rgb || [54, 53, 51]), lit = P.col(mixc(rgb || [54, 53, 51], [255, 250, 240], 0.45)), seg = [];
    let total = 0;
    for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(l); total += l; }
    const half = total / n * 0.62 * (size || 1);
    for (let k = 0; k < n; k++) {
      let d = (k + 0.5) / n * total, i = 0;
      while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
      const a = path[i], b = path[i + 1], f = d / seg[i], x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const cx = Math.cos(ang) * half, cy = Math.sin(ang) * half;
      if (k % 2) { P_line(ctx, x - cx, y - cy, x + cx, y + cy, half * 0.7, iron); P_line(ctx, x - cx * 0.6, y - cy * 0.6 + half * 0.12, x + cx * 0.6, y + cy * 0.6 + half * 0.12, half * 0.18, lit); }
      else { ctx.lineWidth = half * 0.42; ctx.strokeStyle = iron; ctx.beginPath(); ctx.ellipse(x, y, half, half * 0.62, ang, 0, TAU); ctx.stroke(); ctx.lineWidth = half * 0.12; ctx.strokeStyle = lit; ctx.beginPath(); ctx.ellipse(x, y + half * 0.08, half * 0.8, half * 0.45, ang, 0.3, 1.9); ctx.stroke(); }
    }
  };
  Object.assign(ICONS, {
    // a chain hung over a peg by its middle: a long loop down from the top, a loose end beside it
    hungchain(ctx, P) {
      links(ctx, P, [[0.02, 0.97], [0.16, 0.7], [0.15, 0.3], [0.08, 0.06]], 9, 1.25);
      links(ctx, P, [[-0.02, 0.97], [-0.15, 0.72], [-0.2, 0.42], [-0.3, 0.2]], 8, 1.25);
    },
    // a chain dropped in a loose coil on the ground
    coiledchain(ctx, P) {
      links(ctx, P, [[-0.42, 0.14], [-0.1, 0.08], [0.22, 0.14], [0.36, 0.4], [0.22, 0.7], [-0.1, 0.74], [-0.3, 0.52], [-0.16, 0.32], [0.08, 0.36], [0.14, 0.52]], 20);
    },
    // a chain wound twice round the end of the gate and its post, the end hanging down for the lock
    gatechain(ctx, P) {
      const steel = [86, 84, 80];   // a shade lighter than in the hand, so it shows against the dark post and bars
      links(ctx, P, [[-0.46, 0.72], [-0.15, 0.76], [0.2, 0.74], [0.46, 0.7]], 8, 1.15, steel);
      links(ctx, P, [[-0.46, 0.52], [-0.12, 0.58], [0.2, 0.56], [0.46, 0.5]], 8, 1.15, steel);
      links(ctx, P, [[0.18, 0.56], [0.06, 0.3], [0.02, 0.04]], 5, 1.15, steel);
    },
    // the padlock that will never open: rusted through to orange-brown, pitted, its keyhole choked with rust, and a thick
    // dull shackle seized a little crooked in the body (the worn look of a decoy drains it further on top of this)
    rustlock(ctx, P) {
      const rust = P.col([178, 90, 40]), rustD = P.col([108, 50, 24]), rustL = P.col([212, 132, 70]), pit = P.col([46, 24, 14]), shackle = P.col([104, 84, 70]);
      ctx.save(); ctx.translate(0.03, 0.58); ctx.rotate(-0.13);    // the shackle, seized crooked in the body
      ctx.strokeStyle = shackle; ctx.lineWidth = 0.12; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(-0.19, -0.02); ctx.lineTo(-0.19, 0.05); ctx.arc(0, 0.05, 0.19, Math.PI, 0, true); ctx.lineTo(0.19, -0.02); ctx.stroke();
      P_poly(ctx, [[-0.25, 0.02], [-0.13, 0.03], [-0.14, 0.13], [-0.25, 0.1]], rustD); P_poly(ctx, [[0.06, 0.21], [0.16, 0.17], [0.13, 0.25]], rustD);
      ctx.restore();
      // the body, its corners eaten away
      P_poly(ctx, [[-0.3, 0.09], [0.22, 0.1], [0.31, 0.14], [0.3, 0.55], [0.25, 0.62], [-0.2, 0.6], [-0.3, 0.55], [-0.32, 0.2]], rust);
      P_poly(ctx, [[-0.3, 0.09], [0.22, 0.1], [0.31, 0.14], [0.31, 0.2], [0.1, 0.17], [-0.12, 0.2], [-0.32, 0.18]], rustD);     // the bottom, rotten darker
      P_poly(ctx, [[-0.32, 0.3], [-0.2, 0.36], [-0.14, 0.26], [-0.18, 0.18], [-0.32, 0.2]], rustD);                              // a dark scab
      P_poly(ctx, [[0.02, 0.36], [0.05, 0.36], [0.07, 0.14], [0.0, 0.16]], rustD);                                               // run down from the keyhole
      P_poly(ctx, [[0.2, 0.55], [0.24, 0.55], [0.25, 0.22], [0.2, 0.26]], rustD);
      for (const pts of [[[-0.2, 0.5], [-0.06, 0.55], [-0.02, 0.48], [-0.14, 0.44]], [[0.1, 0.3], [0.2, 0.33], [0.18, 0.24], [0.11, 0.24]], [[-0.27, 0.42], [-0.2, 0.44], [-0.22, 0.38]]]) P_poly(ctx, pts, rustL); // flaking
      for (const [x, y, r] of [[-0.12, 0.38, 0.022], [0.16, 0.48, 0.018], [0.25, 0.35, 0.02], [-0.06, 0.26, 0.02], [0.1, 0.42, 0.014], [-0.24, 0.5, 0.015], [0.04, 0.53, 0.016]]) P_ell(ctx, x, y, r, r * 0.8, pit); // pits
      P_ell(ctx, 0, 0.42, 0.055, 0.055, pit); P_rect(ctx, -0.018, 0.3, 0.036, 0.12, pit); P_ell(ctx, 0.01, 0.42, 0.03, 0.026, rustD); // the keyhole, choked with rust
    },
    // the padlocks' key (the one key opens both): a stout key in the same brass as the locks, lying across its card (a round bow with a hole, a
    // long shank, a two-toothed bit), a bright edge down it so it catches the eye on the dark ground
    padkey(ctx, P) {
      const brass = P.col([170, 144, 66]), dark = P.col([92, 76, 34]), lit = P.col([226, 206, 140]), hole = P.col([26, 22, 16]);
      ctx.save(); ctx.translate(0.02, 0.5); ctx.rotate(0.62);
      P_line(ctx, -0.14, 0, 0.4, 0, 0.1, brass);                                                   // the shank
      P_rect(ctx, 0.24, -0.17, 0.07, 0.17, brass); P_rect(ctx, 0.35, -0.13, 0.06, 0.13, brass);  // the bit's two teeth
      P_rect(ctx, 0.24, -0.17, 0.07, 0.03, dark); P_rect(ctx, 0.35, -0.13, 0.06, 0.03, dark);
      P_ell(ctx, -0.27, 0, 0.18, 0.18, brass); P_ell(ctx, -0.27, 0, 0.075, 0.075, hole);         // the bow and its hole
      ctx.lineWidth = 0.03; ctx.strokeStyle = dark; ctx.beginPath(); ctx.arc(-0.27, 0, 0.165, 3.6, 5.6); ctx.stroke();
      P_line(ctx, -0.08, 0.03, 0.38, 0.03, 0.022, lit); ctx.strokeStyle = lit; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.arc(-0.27, 0, 0.15, 0.5, 2.0); ctx.stroke();
      ctx.restore();
    },
    // a coil of old rope gone soft and green-black with rot, a frayed end trailing off it: plainly rope, plainly no use
    rottenrope(ctx, P) {
      const rope = P.col([116, 106, 76]), dark = P.col([60, 58, 42]), rot = P.col([66, 74, 50]), fray = P.col([140, 128, 94]);
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = i === 1 ? P.col([96, 88, 62]) : rope; ctx.lineWidth = 0.075; ctx.beginPath(); ctx.ellipse(0.02 * i, 0.44 + i * 0.03, 0.36 - i * 0.08, 0.2 - i * 0.04, 0, 0, TAU); ctx.stroke(); }
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = Math.cos(a) * 0.36, y = 0.44 + Math.sin(a) * 0.2; P_line(ctx, x - 0.018, y - 0.022, x + 0.018, y + 0.022, 0.012, dark); }  // the lay of its strands
      for (const a of [0.7, 2.5, 4.3]) P_ell(ctx, Math.cos(a) * 0.36, 0.44 + Math.sin(a) * 0.2, 0.065, 0.045, rot);                                                                // rotten patches
      P_line(ctx, 0.3, 0.33, 0.42, 0.12, 0.065, rope);                                             // the loose end, frayed
      for (const [dx, dy] of [[0.06, -0.03], [0.02, -0.08], [0.07, 0.02]]) P_line(ctx, 0.42, 0.12, 0.42 + dx, 0.12 + dy, 0.016, fray);
    },
    // the same rope in the hand: the coil taken up by one side, a hank of long loops hanging from the fist, bound round
    // under it, with the frayed end hanging down beside them
    hungrope(ctx, P) {
      const rope = P.col([116, 106, 76]), mid = P.col([96, 88, 62]), dark = P.col([60, 58, 42]), rot = P.col([66, 74, 50]), fray = P.col([140, 128, 94]);
      const loop = (w, bot, c) => {
        ctx.strokeStyle = c; ctx.lineWidth = 0.075; ctx.beginPath();
        ctx.moveTo(-0.05, 0.9); ctx.bezierCurveTo(-w, 0.72, -w * 0.85, bot, 0, bot); ctx.bezierCurveTo(w * 0.85, bot, w, 0.72, 0.05, 0.9); ctx.stroke();
      };
      loop(0.36, 0.12, rope); loop(0.24, 0.05, mid); loop(0.3, 0.2, rope);
      for (let k = 0; k < 9; k++) { const a = 0.4 + k * 0.28, x = Math.sin(a) * -0.3 * (k < 5 ? 1 : -1), y = 0.62 - Math.abs(Math.cos(a)) * 0.45; P_line(ctx, x - 0.018, y - 0.022, x + 0.018, y + 0.022, 0.012, dark); }   // the lay of its strands
      for (const [x, y] of [[-0.27, 0.42], [0.22, 0.3], [0.05, 0.1]]) P_ell(ctx, x, y, 0.06, 0.045, rot);   // rotten patches
      P_line(ctx, 0.06, 0.82, 0.3, -0.02, 0.065, rope);                                           // the loose end, frayed
      for (const [dx, dy] of [[0.05, -0.06], [0.0, -0.08], [0.08, -0.02]]) P_line(ctx, 0.3, -0.02, 0.3 + dx, -0.02 + dy, 0.016, fray);
      P_rect(ctx, -0.11, 0.8, 0.22, 0.08, mid); P_line(ctx, -0.11, 0.84, 0.11, 0.84, 0.015, dark);   // a turn of it bound round the hank
    },
  });
}
LEVELS.push({
  id: 'quarry', title: 'The Quarry', facing: 270, eyeH: 1.65,
  pal: { skyTop: [96, 102, 112], fog: [152, 156, 160], ground: [64, 66, 58], fogDist: 48 },
  ambient: { wind: 0.9, drone: 0.5, droneFreq: 65, windFreq: 500 },
  weather: { kind: 'mist', density: 1.2, wind: 0.5, fogRoll: { period: 33, depth: 0.4, phase: 2 } },
  text: {
    intro: 'It is standing at the far end of the quarry with its hands over its face. It doesn\'t like to be seen.',
    hint: 'You will have to look away to shut the gates and find the chains and the locks. Be quick about it.',
    objective: 'Shut, chain and padlock both gates.',
    death: { default: 'You looked away, and it only needed a moment.' },
    win: 'Every time you blinked it came nearer, but when it arrived, it could not break through.',
    fragment: 'You kept your eyes open so long they hurt in the morning. Something in the corner of the room had not moved. You are almost sure.',
  },
  // the gap between the gate posts, no lintel; a second gap in the wall behind you
  lanes: [
    { deg: 0, name: 'gate', barrierDist: 2.95, cue: 'scrape', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }], default: true },
    { deg: 180, name: 'back gate', barrierDist: 2.95, cue: 'clunk', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }] },
  ],
  // every gate is three steps now (pull it shut, chain it, padlock it) and there are two chains and two padlocks to find,
  // each lying on its own: a little more time
  creatures: [{ type: 'watcher', startDist: 50, time: 39, seenMult: 0, unseenMult: 1 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const stone = [100, 102, 98], stoneD = [72, 74, 72];
    const wallH = 1.5;
    // the side walls run the whole length; the gate walls stop inside the gate posts, which are thicker than the wall, so
    // no end of wall pokes out past a post into the gateway and each post stands proud of the wall on both sides
    for (const [x0, x1, z0, z1] of [[-3.4, -3.0, -2.8, 2.8], [3.0, 3.4, -2.8, 2.8], [-3.0, -1.2, -2.8, -2.4], [1.2, 3.0, -2.8, -2.4], [-3.0, -1.2, 2.4, 2.8], [1.2, 3.0, 2.4, 2.8]])
      SC.box(L, x0, x1, 0, wallH, z0, z1, stone, { tex: 'stone', texScale: 1.1 });
    for (const z of [2.6, -2.6]) { SC.box(L, -1.4, -1.05, 0, 2.1, z - 0.25, z + 0.25, stoneD); SC.box(L, 1.05, 1.4, 0, 2.1, z - 0.25, z + 0.25, stoneD); }
    SC.box(L, -0.5, 0.6, 0.4, 0.48, -1.9, -1.5, [72, 62, 50]);
    for (const [x, z] of [[-0.45, -1.85], [0.55, -1.85], [-0.45, -1.55], [0.55, -1.55]]) SC.box(L, x - 0.03, x + 0.03, 0, 0.4, z - 0.03, z + 0.03, [60, 50, 40]);
    SC.groundDots(L, 23, 90, 0.8, 3.0, 360, [50, 56, 40], 0.07);
    const rng = mulberry32(41);
    for (let i = 0; i < 28; i++) { const x = (rng() - 0.5) * 70, z = 5 + Math.pow(rng(), 1.2) * 45; if (Math.abs(x) < 1.8 && z < 25) continue; SC.boulder(L, x, z, 0.6 + rng() * 1.8, (rng() * 1e6) | 0); }
    for (let i = 0; i < 24; i++) { const x = (rng() - 0.5) * 70, z = -5 - Math.pow(rng(), 1.2) * 45; if (Math.abs(x) < 1.8 && z > -25) continue; SC.boulder(L, x, z, 0.6 + rng() * 1.8, (rng() * 1e6) | 0); }
    // the quarry's sides: a ring of rock faces all round the pit, far out in the mist, cut in two benches (a lower face and
    // the upper one set back behind it), their tops broken and uneven and their colour only a little darker than the mist,
    // so they loom rather than stand there as slabs. Never nearer than 60 m along either way in: it starts in front of them
    const qr = mulberry32(57);
    const bench = (rFwd, rBack, rSide, hLo, hHi, col, n) => {
      const v = [];
      for (let i = 0; i < n; i++) {
        const a = (i + 0.5) / n * TAU, r = 1 / Math.hypot(Math.sin(a) / rSide, Math.cos(a) / (Math.cos(a) > 0 ? rFwd : rBack)) + (qr() - 0.5) * 4;
        v.push([Math.sin(a) * r, Math.cos(a) * r, hLo + qr() * (hHi - hLo)]);
      }
      for (let i = 0; i < n; i++) {
        const p = v[i], q = v[(i + 1) % n], m = 0.3 + qr() * 0.4, mx = p[0] + (q[0] - p[0]) * m, mz = p[1] + (q[1] - p[1]) * m;
        const top = Math.min(p[2], q[2]) - (hHi - hLo) * (0.1 + qr() * 0.4);   // a dip in the rim between two crags
        L.props.push({ kind: 'poly', pts: [[p[0], 0, p[1]], [q[0], 0, q[1]], [q[0], q[2], q[1]], [mx, top, mz], [p[0], p[2], p[1]]].map(w => L.pt(w[0], w[1], w[2])), color: scalec(col, 0.93 + qr() * 0.14) });
      }
    };
    bench(77, 75, 70, 15, 19, [44, 46, 49], 30);   // the upper face, set back
    bench(64, 62, 57, 7, 10, [50, 52, 54], 34);    // the lower face
    for (let i = 0; i < 12; i++) { const x = (rng() - 0.5) * 60, z = (rng() < 0.5 ? 1 : -1) * (8 + rng() * 40); if (Math.abs(x) < 3) continue; SC.tree(L, x, z, 5 + rng() * 5, 'bare', (rng() * 1e6) | 0); }
    const nDots = L.props.length;
    SC.groundDots(L, 29, 100, 3, 50, 360, [52, 54, 46], 0.5);
    // the big dark patches belong to the quarry floor outside: inside the walls they read as rugs or shadows of nothing
    const inYard = p => p.pts.some(w => { const q = rotY(w[0], w[2], -L.facing); return Math.abs(q[0]) < 3.45 && Math.abs(q[1]) < 2.85; });
    L.props.splice(nDots, L.props.length - nDots, ...L.props.slice(nDots).filter(p => !inYard(p)));
    // an iron peg driven into the wall (wx, wz is the wall's face behind the chain), at the height the chain hangs from
    const peg = (L, sp) => SC.box(L, Math.min(sp.x, sp.wx) - 0.025, Math.max(sp.x, sp.wx) + 0.025, 1.16, 1.22, Math.min(sp.z, sp.wz) - 0.025, Math.max(sp.z, sp.wz) + 0.025, [40, 39, 38]);
    // two chains, one for each gate, each in its own place: hung on a peg in a wall, or dropped in a coil on the ground
    const chainSpots = [
      { x: 2.88, y: 0.42, z: 0.3, wx: 3.0, wz: 0.3, setup: peg },       // hung on the east wall
      { x: -2.88, y: 0.42, z: -0.6, wx: -3.0, wz: -0.6, setup: peg },   // hung on the west wall
      { x: 2.0, y: 0.42, z: -2.28, wx: 2.0, wz: -2.4, setup: peg },     // hung on the back wall
      { x: -2.0, y: 0.42, z: 2.28, wx: -2.0, wz: 2.4, setup: peg },     // hung on the wall beside the gate
      { x: 1.9, y: 0, z: -0.5, flat: true },                             // coiled on the ground
      { x: -0.9, y: 0, z: -1.0, flat: true },                            // coiled on the ground, by the table
    ];
    const CHAINS = ['chain', 'chain2'], PADLOCKS = ['padlock', 'padlock2'], LOCKS = PADLOCKS.concat('oldlock');
    for (const id of CHAINS) {
      const c = mkItem(L, id, 'Chain', chainSpots, { w: 0.6, h: 0.6, icon: 'coiledchain' });
      if (c.y > 0.2) Object.assign(c, { icon: ICONS.hungchain, w: 0.42, h: 0.8 });   // hung up: a long loop down from its peg
    }
    // on the ground a chain lies in a coil (put down again, or dropped where it would not go, as one found coiled), and the
    // rotten rope in its coil; in the hand each hangs from the fist (js/hands.js): the chain doubled over it, swinging, and
    // the rope taken up in a hank
    const HANG = {
      chain: { icon: ICONS.hungchain, w: 0.42, h: 0.8, held: { grip: 'hang', at: [0, 0.97], axis: Math.PI / 2, size: 0.34 } },
      rope: { icon: ICONS.hungrope, w: 0.3, h: 0.6, held: { grip: 'hang', at: [0, 0.86], axis: Math.PI / 2, size: 0.3 } },
    };
    const kindOf = it => (CHAINS.includes(it.id) ? 'chain' : it.id === 'rope' ? 'rope' : null);
    L.onPickup = it => { const k = kindOf(it); if (k) Object.assign(it, HANG[k]); };
    L.onDrop = it => {
      const k = kindOf(it);
      if (k === 'chain') Object.assign(it, { icon: ICONS.coiledchain, w: 0.6, h: 0.6 });
      if (k === 'rope') Object.assign(it, { icon: ICONS.rottenrope, w: 0.4, h: 0.3 });
    };
    // two padlocks, one for each gate, each lying on its own (never both in one place): one somewhere in the front half of
    // the yard, by the gate, the other in the back half, by the back gate. Either locks either gate, and each locks one
    const lockSpots = [
      [
        { x: 1.5, y: 0, z: 1.5 },                       // north-east
        { x: -1.7, y: 0, z: 1.2 },                      // north-west
        { x: 0.2, y: 0, z: 1.0 },                       // just in front, toward the gate
      ],
      [
        { deg: 150, dist: 1.7, y: 0 },                  // south-south-east
        { x: -2.0, y: 0, z: -0.9 },                     // west-south-west
        { x: -1.5, y: 0, z: -1.9 },                     // south-west, off the end of the table
      ],
    ];
    PADLOCKS.forEach((id, k) => mkItem(L, id, 'Padlock', lockSpots[k], { w: 0.24, h: 0.28, flat: true, icon: 'padlock', held: { grip: 'pinch', at: [-0.2, 0.62], angle: 0.15, size: 0.2 } }));
    mkItem(L, 'gatekey', 'Key', [
      { x: 0.05, y: 0.48, z: -1.7 },                    // on the table
      { x: -2.6, y: 0, z: 1.9 },                        // north-west corner
      { x: 2.5, y: 0, z: -1.3 },                        // south-east
      { x: -0.9, y: 0, z: 2.1 },                        // by the gate post
    ], { w: 0.2, h: 0.2, flat: true, tool: true, icon: 'padkey', held: { grip: 'pinch', at: [-0.2, 0.36], angle: -0.9, size: 0.19, tip: [0.36, 0.72] } });   // by its bow, the bit leading
    mkItem(L, 'oldlock', 'Padlock', [{ x: 0.9, y: 0, z: 1.6 }, { x: -2.4, y: 0, z: -1.6 }], { w: 0.24, h: 0.28, flat: true, icon: 'rustlock', decoy: true, decoyText: 'Rusted solid. Nothing will ever open it.',
      held: { grip: 'pinch', at: [-0.17, 0.66], angle: 0.12, size: 0.19 } });
    mkItem(L, 'rope', 'Rotten rope', [
      { deg: 120, dist: 1.9, y: 0 },
      { x: 2.4, y: 0, z: 1.0 },                         // east, by the wall (clear of every key and chain spot)
      { x: 1.7, y: 0, z: 0.9 },
    ], { w: 0.4, h: 0.3, flat: true, icon: 'rottenrope' });
    // a gate is open, then pulled shut (it swings closed on its own weight), then chained through the bars, then padlocked
    const holding = ids => G.inv.some(i => ids.includes(i.id));
    // what will not do is played out at the gate (tryAt, below "what will not do"); the line is still said, for the captions,
    // and the error sound plays only when nothing was shown
    const nope = (specific, vague, shown) => { G.say(specific, vague); if (!shown && !G.fumbling) AUDIO.sfx('nope'); return true; };
    const mkGate = (id, name, deg, sign) => {
      const the = 'The ' + name.toLowerCase();
      const t = mkTarget(L, {
        id, name, deg, dist: 2.6, y: 0, w: 2.3, h: 2.0, accepts: [], shut: false, chained: false, locked: false, closing: 0, angle: Math.PI / 2, sign,
        hint() { return t.locked ? 'Chained and locked.' : t.chained ? 'Chained. It needs the padlock.' : t.shut ? 'Shut. It needs a chain.' : t.closing > 0 ? 'Swinging shut.' : the + ' stands open.'; },
        onClick() {
          const act = G.inv[G.active];
          // (again(): the last thing tried at this gate is still there, so a click that would only be refused again is taken quietly)
          const again = () => !!G.fumbling && G.fumbling.target === t;
          if (t.locked) return again() || nope('Chained and locked.', the + ' is chained and locked.', tryAt(t, act, 'locked'));
          if (t.closing > 0) {
            // a chain too late to throw round it as it swings goes on as it shuts (L.update), not onto a gate already shut and off again
            if (act && CHAINS.includes(act.id) && !inTime(t, act)) { t.queued = act; return true; }
            return again() || nope('Let it swing shut.', 'It is still swinging shut.', tryAt(t, act, 'swinging'));
          }
          if (!t.shut) { t.closing = 1; AUDIO.sfx('creak'); G.reach(t, { style: 'pull', at: W(-0.25 * sign, 1.0, 3.1 * sign) }); G.say('You pull ' + the.toLowerCase() + ' shut.', the + ' swings shut.'); return true; }
          if (!t.chained) {
            if (holding(CHAINS)) return false;
            if (act && LOCKS.includes(act.id)) return again() || nope('Chain it first. There is nothing to lock yet.', 'The padlock has nothing to close on.', tryAt(t, act, 'nochain'));
            return again() || nope('It is shut, but it needs a chain to hold it.', the + ' is shut, but nothing holds it.', tryAt(t, act, 'shut'));
          }
          if (holding(LOCKS)) return false;
          return again() || nope('The chain is on. It needs the padlock.', 'The chain is through the bars, but nothing fastens it.', tryAt(t, act, 'chained'));
        },
        use(item) {
          if (CHAINS.includes(item.id)) { t.chained = true; t.nudgeAt = undefined; t.angle = 0; t.accepts = LOCKS.slice(); AUDIO.sfx('chain'); G.say('You wind the chain through the bars and around the post.', 'The chain goes through the bars.'); return true; }
          if (PADLOCKS.includes(item.id)) {   // without its key: held to the chain's end, its shackle tugged at, and it will not open
            if (!G.hasItem('gatekey')) {
              if (G.fumbling && G.fumbling.target === t) return G.refuse(false);   // (the last thing tried here is still there: quietly)
              G.say('The padlock is shut. It wants its key.', 'The padlock is locked shut, and the shackle will not pull open.'); return G.refuse({ preset: 'bump', drop: false, at: latch(t, LOCK_Y), scale: LOCK_K, sfx: { hit: 'tink' } }); }
            t.locked = true; t.done = true; t.accepts = []; AUDIO.sfx('lock'); G.say('The padlock snaps shut on the chain.', 'The padlock snaps shut.'); return true;
          }
          return false;
        },
        // the rusted padlock: held to the chain's end, its seized shackle pressed down on the links again and again, and it
        // will not snap shut; it slips out of the fingers and drops by the gate (the time a decoy costs is spent as well)
        onDecoy(item) { if (!G.fumble(item, t, { preset: 'bump', at: latch(t, LOCK_Y), scale: 0.8, sfx: { hit: 'clunk', land: 'clatter' } })) AUDIO.sfx('nope'); },
      });
      return t;
    };
    const gate = mkGate('gate', 'Gate', 0, 1), gate2 = mkGate('backgate', 'Back gate', 180, -1);
    const gateOf = lane => lane.idx === 0 ? gate : gate2;
    L.sealed = lane => gateOf(lane).locked;

    // ---- what will not do, played out at the gate (js/hands.js) ----
    // A thing tried at a gate goes to its free end at the post, where the chain goes round and the lock hangs. A chain thrown
    // round a gate still swinging shut hangs there until the gate swings into the post, and is knocked off it to the ground,
    // to be picked up again. A padlock held to a gate with no chain on it has nothing to close on: its shackle knocks on the
    // bare bars and it comes back; the padlock without its key is tugged at on the chain and will not open; the rusted one is
    // pressed down on the chain again and again, will not snap shut, and drops (onDecoy, above). The rotten rope wound round
    // the bars slips off and falls. The key pokes at the bars or the chain. With nothing in hand you push a shut gate that
    // nothing holds, and it swings out a little and falls back shut with a clang; a chained or a locked one you take hold of
    // and shake, and it jolts on its chain.
    const W = (x, y, z) => { const p = L.pt(x, y, z); return { x: p[0], y: p[1], z: p[2] }; };
    const endAt = (g, y, x) => W((x === undefined ? 1.0 : x) * g.sign, y, 2.26 * g.sign);   // the gate's free end, at its post, y up (x: in from it)
    // there, or as near it as is not behind what you hold: on a phone the hand sits up over the touch buttons, where the low
    // end of a gate can be, so it is tried higher up the chain, or further along the gate
    const latch = (g, y, x) => {   // (lx, ly: the spot chosen, in from the hinge's side of the gate and up)
      const b = G.hand.box, x0 = x === undefined ? 1.0 : x, at = (dy, dx) => Object.assign(endAt(g, y + dy, x0 - dx), { lx: x0 - dx, ly: y + dy });
      if (!b) return at(0, 0);
      const mx = (b.x1 - b.x0) * 0.25, my = (b.y1 - b.y0) * 0.25;
      const clear = p => { const q = R.screenPos(p.x, p.y, p.z); return !!q && !(q.x > b.x0 - mx && q.x < b.x1 + mx && q.y > b.y0 - my && q.y < b.y1 + my); };
      for (const dy of [0, 0.15, 0.3, 0.45, 0.6, 0.75]) for (const dx of [0, 0.2, 0.4]) { const p = at(dy, dx); if (clear(p)) return p; }
      return at(0, 0);
    };
    // that spot on a gate still swinging shut: on its end as it swings (lx from the middle of the gateway; the gate is hung at
    // -1.05 and swings outward), as far in front of it as endAt is in front of a shut one
    const onSwing = (g, lx, ly) => { const u = lx + 1.05; return W(g.sign * (-1.05 + Math.cos(g.angle) * u), ly, g.sign * (2.26 + Math.sin(g.angle) * u)); };
    const ON_BARS = 0.8;   // a chain is tried on the end of the gate itself, where it shows against the bars, not on the dark post
    const LOCK_Y = 0.5, CHAIN_Y = 0.9, LOCK_K = 0.7;   // where the lock hangs and the chain goes round; a padlock's size there (as the one on a gate)
    const NUDGE = { dur: 0.8, open: 0.3 };
    const panOf = g => Math.sin(wrapPi(Math.atan2(g.x, g.z) - G.cam.yaw)) * 0.85;
    const shake = g => { g.rattleAt = L.t; AUDIO.sfx('gate', panOf(g)); };
    // A chain thrown round a gate still swinging shut goes quicker than a thing tried (THROW). Does it get there before the gate
    // meets the post? As js/hands.js takes it: up into the hand first if it is not up (what was in it going down first), out
    // to the gate (0.24 s and more with distance), and put on it (0.11 s)
    const THROW = 1.3;
    const inTime = (g, it) => {
      const H = G.hand, at = latch(g, CHAIN_Y, ON_BARS), up = H.cur === it ? Math.max(0, 0.92 - H.up) / 5.5 : (H.cur ? H.up / 7.15 : 0) + 0.92 / 5.5;
      return g.closing > Math.min(0.45, up) + (clamp(0.24 + Math.hypot(at.x, at.y - L.eyeH, at.z) * 0.06, 0.28, 0.5) + 0.112) / THROW;
    };
    // what is tried, by what state the gate is in (G.fumble, or G.reach with nothing in hand); true when something was shown
    function tryAt(g, act, state) {
      let o;
      if (!act) {
        o = state === 'shut' ? { style: 'push', at: W(0.2 * g.sign, 1.0, 2.55 * g.sign), onTouch: () => { if (g.nudgeAt === undefined) { g.nudgeAt = L.t; AUDIO.sfx('creak', panOf(g)); } } }
          : state === 'swinging' ? { style: 'touch', at: latch(g, 1.0) }
          : { style: 'rattle', at: latch(g, CHAIN_Y), onTouch: () => shake(g) };
        return !!G.reach(g, o);
      }
      const id = act.id;
      if (state === 'swinging' && CHAINS.includes(id)) {   // hung on the swinging gate's end, going with it, until it swings into the post and knocks it off
        const at = latch(g, CHAIN_Y, ON_BARS);
        o = { preset: 'slip', speed: THROW, at: onSwing(g, at.lx, at.ly), hold: 0.7, pivot: 'left', sfx: { hit: 'chain', land: 'clatter' },
          onHit: fx => { fx.opts.hold = Math.max(0.03, fx.pt + g.closing * THROW - 0.14); } };   // (it tips as the gate meets the post)
        const fx = G.fumble(act, g, o);
        if (fx) fx.onSwing = { g, lx: at.lx, ly: at.ly };
        return !!fx;
      } else if (id === 'rope' && state !== 'locked') {    // wound round the bars, the rotten rope will not hold and slips off
        o = { preset: 'slip', at: latch(g, CHAIN_Y, ON_BARS), hold: 0.45, pivot: 'right', sfx: { hit: 'pat', land: 'flop' } };
      } else if (LOCKS.includes(id)) {                     // a padlock: its shackle knocks on the bars, or on the lock already there
        o = { preset: state === 'locked' ? 'return' : 'bump', drop: false, at: state === 'nochain' ? latch(g, 0.62, ON_BARS) : latch(g, LOCK_Y), scale: PADLOCKS.includes(id) ? LOCK_K : 0.8, sfx: { hit: 'tink' } };
      } else if (id === 'gatekey') {                       // the key pokes at the bars, the chain or the lock
        o = { preset: 'bump', drop: false, at: state === 'shut' ? latch(g, 0.8, ON_BARS) : latch(g, LOCK_Y + 0.06), sfx: { hit: 'tink' } };
      } else o = { preset: 'return', at: latch(g, CHAIN_Y, ON_BARS), onHit: () => { if (state !== 'swinging') g.rattleAt = L.t; } };   // a second chain, and the like, knocks on it
      return !!G.fumble(act, g, o);
    }
    L.update = dt => {
      runOn(dt);
      if (L.won && s.after) L.creature.hold = s.after.d;   // in the end it is where the blinks have put it
      for (const g of [gate, gate2]) {
        if (g.closing > 0) {
          g.closing -= dt;
          g.angle = (Math.PI / 2) * Math.pow(clamp(g.closing, 0, 1), 1.4);
          if (g.closing <= 0) {
            g.closing = 0; g.angle = 0; g.shut = true; g.accepts = CHAINS.slice(); AUDIO.sfx('gate'); G.shake(0.2);
            const q = g.queued; g.queued = null;   // a chain clicked on it late in its swing goes on now, if it is still in hand
            if (q && G.state === 'play' && G.inv[G.active] === q) useTarget(g);
          }
          const f = G.fumbling;   // a chain thrown round it as it swings goes with its end
          if (f && f.onSwing && f.onSwing.g === g && (f.phase === 'out' || f.phase === 'contact')) Object.assign(f.at, onSwing(g, f.onSwing.lx, f.onSwing.ly));
        } else if (!g.shut && (g.chained || g.locked)) {   // set chained or locked from outside (a test): it is shut, and takes what comes next
          g.shut = true; g.angle = 0; g.accepts = g.locked ? [] : g.chained ? LOCKS.slice() : CHAINS.slice();
        } else if (g.nudgeAt !== undefined) {   // pushed while nothing holds it: it swings out a little and falls back shut
          const e = (L.t - g.nudgeAt) / NUDGE.dur;
          if (g.chained || g.locked || e >= 1) { g.nudgeAt = undefined; g.angle = 0; if (e >= 1) { AUDIO.sfx('gate', panOf(g)); G.shake(0.12); } }
          else g.angle = NUDGE.open * Math.sin(Math.PI * Math.pow(e, 0.7));
        }
      }
    };
    // ---- going round ----
    // A gate it reaches locked holds it there (the generic sealed way), and it tries the gate: the gate clangs and jolts
    // on its chain. Then, whenever nothing is looking at it, it runs: sideways along the outside of that gate's wall to
    // the corner, down the outside of the side wall, round the far corner and in from the side to a few metres outside
    // the other gate, where that gate's sound says it has come. It is a statue that only moves unseen, so the run only
    // goes on while nothing is looking at it: caught going round, it is a stone figure stopped mid-stride, side-on, its
    // head and shoulders over the wall (the run's own visibility, below, counts what shows over the walls, and through
    // the bars of a gate)
    const RUN = { v: 7, side: 4.6, corner: 3.6, gap: 3.2, tryT: 0.35 };   // gap: how far outside the other gate's barrier it comes in
    s.run = null;
    const lanePt = (lane, lx, lz) => ({ x: lane.dirX * lz + Math.cos(lane.yaw) * lx, y: 0, z: lane.dirZ * lz - Math.sin(lane.yaw) * lx });
    const runVis = cr => {
      const p = cr.pos(), cam = { yaw: G.cam.yaw, pitch: G.cam.pitch, zoom: 1, W: R.W, H: R.H, eyeH: L.eyeH };
      const r = R.projectRect(p.x, p.y, p.z, cr.CR.w, cr.CR.h, cam);
      if (!r) return 0;
      const w = Math.min(r.x + r.w, R.W) - Math.max(r.x, 0), h = Math.min(r.y + r.h, R.H) - Math.max(r.y, 0);
      if (w <= 0 || h <= 0) return 0;
      const q = rotY(p.x, p.z, -L.facing), d = Math.hypot(q[0], q[1]), sn = Math.abs(q[0]) / d, cs = Math.abs(q[1]) / d;
      const wall = Math.min(sn > 1e-4 ? 3.2 / sn : Infinity, cs > 1e-4 ? 2.6 / cs : Infinity);   // where the line to it leaves the yard
      const gateway = cs > 1e-4 && 2.6 / cs <= wall + 1e-6 && Math.abs(q[0]) * 2.6 / Math.abs(q[1]) < 1.05;
      const hide = gateway ? 0 : Math.max(0, L.eyeH - (L.eyeH - 1.5) * d / wall);   // below the line over the wall's top
      return (w * h) / (r.w * r.h) * clamp((cr.CR.h - hide) / cr.CR.h, 0, 1);
    };
    function startRun(c) {
      const from = c.lane, to = L.lanes[from.idx === 0 ? 1 : 0], side = c.rand() < 0.5 ? 1 : -1, b = c.dist, d2 = (to.barrierDist || 0) + RUN.gap;
      const path = [[0, b], [side * RUN.side, RUN.corner], [side * RUN.side, -RUN.corner], [0, -d2]];   // the way round, in the from-gate's frame
      const lens = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i][0], q[1] - path[i][1]));
      s.run = { t: 0, s: 0, from, to, side, d2, path, lens, total: lens.reduce((a, l) => a + l, 0), pos0: c.pos };
      c.sealHold = false; c.sealHeldAt = undefined;   // it is the night's now: the generic going round never comes
      const g = gateOf(from), pan = Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
      g.rattleAt = L.t; AUDIO.sfx('gate', pan); AUDIO.sfx('chain', pan); G.shake(0.2);   // it tries the gate (it got here unseen)
    }
    function runAt(r, dist) {   // where along the way round, in the world, and which way it is going
      let k = 0, u = dist;
      while (k < r.lens.length - 1 && u > r.lens[k]) { u -= r.lens[k]; k++; }
      const a = r.path[k], b = r.path[k + 1], f = clamp(u / r.lens[k], 0, 1);
      return { p: lanePt(r.from, lerp(a[0], b[0], f), lerp(a[1], b[1], f)), t: lanePt(r.from, b[0] - a[0], b[1] - a[1]) };
    }
    function endRun(c) {
      const r = s.run, to = r.to;
      s.run = null; L.visFrac = null;
      c.pos = r.pos0; c.runPose = false; c.retarget(to.idx); c.reached = false;
      c.u = clamp(1 - Math.pow(r.d2 / c.D0, 1 / c.gamma), 0, 1); c.hold = null; c.dist = r.d2;
      L.laneIdx = to.idx; L.lane = to; L.barrierDist = to.barrierDist || 0;
      if (to.cue && !L.won) AUDIO.sfx(to.cue, Math.sin(wrapPi(to.yaw - G.cam.yaw)) * 0.85);
    }
    function runOn(dt) {
      const c = L.creature;
      if (!s.run && c.sealHold && !L.won) startRun(c);
      const r = s.run;
      if (!r || L.won) return;
      if (!c.seen) {   // seen, it stands as it is, mid-stride
        r.t += dt;
        if (r.t > RUN.tryT) { r.s = Math.min(r.total, r.s + RUN.v * dt); c.runGait = (c.runGait || 0) + dt * 13; }
      }
      if (r.t <= RUN.tryT) return;
      if (r.s >= r.total) { endRun(c); return; }
      const at = runAt(r, r.s), p = at.p;
      c.runPose = true; c.pos = () => p; L.visFrac = runVis;
      c.hold = Math.hypot(p.x, p.z); c.yaw = Math.atan2(p.x, p.z);
      const dir = at.t.x * Math.cos(c.yaw) - at.t.z * Math.sin(c.yaw);   // across the view of someone looking at it: right or left
      if (Math.abs(dir) > 1e-3) c.runDir = Math.sign(dir);
    }

    // Each gate is an arched iron frame (a stile at each end, a rail along the bottom and the arch over the top) barred
    // right across: thin upright bars, NGAP gaps of a hand's span or so, each bar run up through the arch to a point, and
    // low down a second rail with a ring in every gap between it and the bottom rail. Every gap is far narrower than it is,
    // so a shut gate plainly holds it; but the bars are thin and nothing crosses the gate at the height of its body or
    // head, so through a shut gate nearly all of it shows, however far off it is and even right at the gate, and the middle
    // of the gate is a gap, not a bar, so its face is in a gap when it stands at the gate. A gate that has just been shaken
    // (g.rattleAt) jolts on its hinges and its chain, and settles
    const LEN = 2.1, TOP = 1.9, RISE = 0.38, FOOT = 0.1, BAND = 0.42, NGAP = 9, BARW = 0.011, GRIP = 2, ironC = [38, 38, 42];
    const archY = u => TOP + RISE * (1 - Math.pow((u - LEN / 2) / (LEN / 2), 2));
    const barU = k => 0.025 + k * (LEN - 0.05) / NGAP;   // along the gate from its hinge: k 0 and NGAP are the stiles
    s.bars = Array.from({ length: NGAP + 1 }, (_, k) => barU(k) - LEN / 2);   // across a shut gate from its middle (the tests read it)
    // At the end, holding the gate: where the bars it holds are as you see them this frame, so its fists are on them
    // whichever way the view is tilted or turned, and go with them as the gate jolts in its hands. They are the bars GRIP
    // out from the first either side of the gap in the middle, where they cross the height of its fists (c.grip, left and
    // right), and the hand it reaches with goes to the middle of the gap beside the middle one (c.reach), each told to it
    // in its own measure as it is drawn (the sprite is scaled from its feet)
    const holdBars = (c, at) => {
      const p = c.pos(), o = R.screenPos(p.x, p.y + (c.yOff || 0), p.z);
      if (!o) return;
      const across = (u, y) => { const q = at(u), w = L.pt(q[0], y, q[1]), r = R.screenPos(w[0], w[1], w[2]); return r ? (r.x - o.x) / o.scale : NaN; };
      const m = Math.ceil(NGAP / 2), ga = across(barU(m + GRIP), 1.41), gb = across(barU(NGAP - m - GRIP), 1.41);
      const ra = across((barU(m) + barU(m + 1)) / 2, 1.08), rb = across((barU(NGAP - m - 1) + barU(NGAP - m)) / 2, 1.08);
      if ([ga, gb, ra, rb].some(isNaN)) return;
      c.grip = [Math.min(ga, gb), Math.max(ga, gb)]; c.reach = Math.max(ra, rb);
    };
    L.dynamic = () => {
      for (const g of [gate, gate2]) {
        const e = L.t - (g.rattleAt === undefined ? -9 : g.rattleAt), k = e >= 0 && e < 1 ? Math.exp(-e * 5) : 0;
        const jolt = Math.sin(e * 34) * k * 0.07, hop = Math.abs(Math.sin(e * 29)) * k * 0.045;   // in and out on its chain, and up off its hinges
        const a = g.angle + jolt, sg = g.sign, dx = sg * Math.cos(a), dz = sg * Math.sin(a), hx = -1.05 * sg, hz = 2.6 * sg;
        const at = u => [hx + dx * u, hz + dz * u];
        if (L.won && s.after && g === gateOf(L.creature.lane)) holdBars(L.creature, at);
        R.glowAs(g);   // all of it, the chain and the lock too: pointed at, the gate glows in its own bars
        const bar = (u, y0, y1, w) => { const p = at(u - w), q = at(u + w); R.add(SC.mkWallV(L, p[0], p[1], q[0], q[1], y0 + hop, y1 + hop, ironC)); };
        const rail = (u0, u1, y, w) => { const p = at(u0), q = at(u1); R.add(SC.mkWallV(L, p[0], p[1], q[0], q[1], y - w + hop, y + w + hop, ironC)); };
        bar(0.025, 0.04, archY(0.025), 0.025); bar(LEN - 0.025, 0.04, archY(LEN - 0.025), 0.025);   // the stiles
        rail(0, LEN, FOOT, 0.03); rail(0, LEN, BAND, 0.022);                                         // the bottom rail, and the one over the rings
        for (let i = 0; i < 14; i++) {                                                               // the arch
          const u0 = i / 14 * LEN, u1 = (i + 1) / 14 * LEN, p = at(u0), q = at(u1), y0 = archY(u0) + hop, y1 = archY(u1) + hop;
          R.add(SC.mkQuad(L, [p[0], y0 - 0.032, p[1]], [q[0], y1 - 0.032, q[1]], [q[0], y1 + 0.032, q[1]], [p[0], y0 + 0.032, p[1]], ironC));
        }
        for (let b = 1; b < NGAP; b++) {                                                             // the bars, each to a point over the arch
          const u = barU(b), top = archY(u) + 0.06;
          bar(u, FOOT, top, BARW);
          const tip = at(u), ty = top + hop;
          R.add(SC.mkQuad(L, [tip[0] - dx * 0.026, ty, tip[1] - dz * 0.026], [tip[0] + dx * 0.026, ty, tip[1] + dz * 0.026], [tip[0], ty + 0.09, tip[1]], [tip[0], ty + 0.09, tip[1]], ironC));
        }
        for (let b = 0; b < NGAP; b++) {                                                             // a ring in each gap, between the two low rails
          const um = (barU(b) + barU(b + 1)) / 2, r = (barU(b + 1) - barU(b)) / 2 - BARW, ym = (FOOT + BAND) / 2 + hop, ring = [];
          for (let j = 0; j <= 16; j++) { const t = j / 16 * TAU, p = at(um + Math.cos(t) * r); ring.push(L.pt(p[0], ym + Math.sin(t) * 0.135, p[1])); }
          R.add({ kind: 'poly', pts: ring, color: ironC, stroke: true, lw: 0.018 });
        }
        // the chain round the gate's end and its post, and the lock on it, just in front of the post's face (z 2.35) so they
        // are drawn over it whichever way the faces are ordered; they jump with the gate when it is shaken
        const lift = Math.abs(jolt) * 1.4 + hop * 1.5;
        if (g.chained) R.add(iconSprite(L, 'gatechain', 1.0 * sg, 0.5 + lift, 2.3 * sg, 0.5, 0.75));
        if (g.locked) R.add(iconSprite(L, 'padlock', 1.01 * sg, 0.36 + lift * 1.4, 2.28 * sg, 0.2, 0.24));
        R.glowAs(null);
      }
    };
    // ---- how it ends ----
    // Both gates locked, the view goes to it and you do not look away; it only moves in the moments your eyes close. Each
    // blink it is nearer, in a new pose (and, if it was going round, round), until it is at the gate; each blink after that
    // it has the bars in its hands and the gate has just been shaken: it clangs and jolts on its chain, and the chain and
    // the lock jump, and it is still there, holding two of the bars, its face in the gap in the middle. It does not get
    // in. Then the fade
    const BLINK = 0.26;
    function plan(c) {
      // a longer look round to it first: to where it is, or, if it was going round, to the gate it was going to (the view
      // goes there, below, and it is there by the first blink)
      const off = Math.abs(wrapPi((s.run ? s.run.to.yaw : c.yaw) - G.cam.yaw)), turn = off > Math.PI / 2 ? 1.0 : off > Math.PI / 4 ? 0.4 : 0;
      const b = s.run ? s.run.to.barrierDist : (c.lane.barrierDist || 0), d0 = s.run ? s.run.d2 : c.dist, steps = [];
      if (s.run || d0 - b > 1.2) { if (d0 - b > 8) steps.push({ d: lerp(d0, b, 0.55) }); steps.push({ d: b + 0.9 }); }   // never a blink that puts it further off
      for (const pose of [4, 5, 2]) steps.push({ d: b, pose, shake: true });   // its hands on the bars: holdBars, above
      const times = steps.map((st, i) => 1.1 + turn + i * 0.72);
      return { steps, times, next: 0, d: s.run ? c.dist : d0, end: times[times.length - 1] + 1.6, rattles: 0 };
    }
    L.aftermath = t => {
      const c = L.creature, a = s.after || (s.after = plan(c)), rf = SAVE.data.settings.reducedFlash;
      let dark = 0;
      for (const bt of a.times) { const u = (t - bt) / (rf ? BLINK * 1.5 : BLINK); if (u >= 0 && u <= 1) dark = Math.max(dark, Math.sin(u * Math.PI)); }
      if (t < a.end) G.fade = G.fadeTarget = dark * (rf ? 0.8 : 1);   // after that the night's own fade
      while (a.next < a.steps.length && t >= a.times[a.next] + BLINK / 2) {   // in the dark of a blink, it moves
        const st = a.steps[a.next++], pan = () => Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
        if (s.run) endRun(c);
        a.d = c.hold = c.dist = st.d;
        if (st.pose) c.pose = st.pose; else { let p; do { p = 1 + Math.floor(c.rand() * 3); } while (p === c.pose); c.pose = p; }
        if (st.shake) { gateOf(c.lane).rattleAt = L.t; a.rattles++; AUDIO.sfx('gate', pan()); AUDIO.sfx('chain', pan()); G.shake(0.45); }
        else AUDIO.sfx('thud', pan());
      }
      return t >= a.end;
    };
    L.watchPoint = () => (L.won && s.run ? lanePt(s.run.to, 0, s.run.d2) : null);
    L.isWon = () => gate.locked && gate2.locked;
    L.objectiveText = () => {
      const st = g => g.locked ? 'locked' : g.chained ? 'chained' : g.shut ? 'shut' : 'open';
      return 'Shut, chain and padlock both gates (gate ' + st(gate) + ', back gate ' + st(gate2) + ').' + (gateOf(L.lane).locked ? ' Do not look away.' : '');
    };
    L.floor = { poly: [[-3, -2.4], [3, -2.4], [3, 2.4], [-3, 2.4]], y: 0 };
  }
});
