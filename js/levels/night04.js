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
    // two padlocks, side by side: the one item while both are there
    padlocks(ctx, P) {
      for (const [x, y] of [[-0.19, 0.24], [0.19, 0.02]]) { ctx.save(); ctx.translate(x, y); ctx.scale(0.74, 0.74); ICONS.padlock(ctx, P); ctx.restore(); }
    },
    // the padlocks' key: one stout key in the same brass as the locks, lying across its card (a round bow with a hole, a
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
  });
}
LEVELS.push({
  id: 'quarry', title: 'The Quarry', facing: 270, eyeH: 1.65,
  pal: { skyTop: [96, 102, 112], fog: [152, 156, 160], ground: [64, 66, 58], fogDist: 48 },
  ambient: { wind: 0.9, drone: 0.5, droneFreq: 65, windFreq: 500 },
  weather: { kind: 'mist', density: 1.2, wind: 0.5, fogRoll: { period: 33, depth: 0.4, phase: 2 } },
  text: {
    intro: 'It only moves when nothing is looking at it.<br>It is standing at the far end of the quarry with its hands over its face.',
    hint: 'You will have to look away to shut the gates and find the chains and the lock. Be quick about it.',
    objective: 'Shut, chain and padlock both gates.',
    death: { default: 'You looked away. It only needed a moment.' },
    win: 'Every time you blinked it was nearer, and then it was at the gate, shaking it on its chain. You did not look away again until the sun came up. It is still there.',
    fragment: 'You kept your eyes open so long they hurt in the morning. Something in the corner of the room had not moved. You are almost sure.',
  },
  // the gap between the gate posts, no lintel; a second gap in the wall behind you
  lanes: [
    { deg: 0, name: 'gate', barrierDist: 2.95, cue: 'scrape', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }], default: true },
    { deg: 180, name: 'back gate', barrierDist: 2.95, cue: 'clunk', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }] },
  ],
  // every gate is three steps now (pull it shut, chain it, padlock it) and there are two chains to find: a little more time
  creatures: [{ type: 'watcher', startDist: 50, time: 36, seenMult: 0, unseenMult: 1 }],
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
    STORY.lamp(L, 0.4, 0.48, -1.7, { scale: 0.8 });
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
    const CHAINS = ['chain', 'chain2'], LOCKS = ['padlock', 'oldlock'];
    for (const id of CHAINS) {
      const c = mkItem(L, id, 'Chain', chainSpots, { w: 0.6, h: 0.6, icon: 'coiledchain' });
      if (c.y > 0.2) Object.assign(c, { icon: ICONS.hungchain, w: 0.42, h: 0.8 });   // hung up: a long loop down from its peg
    }
    // taken down off its peg or put down again, a chain is the same coil in the hand and on the ground as one found coiled
    const coil = it => { if (CHAINS.includes(it.id)) Object.assign(it, { icon: ICONS.coiledchain, w: 0.6, h: 0.6 }); };
    L.onPickup = coil; L.onDrop = coil;
    // one padlock item for both gates, drawn as the pair it is until one of them is on a gate
    const lock = mkItem(L, 'padlock', 'Padlock', [
      { deg: 150, dist: 1.7, y: 0 },                    // south-south-east
      { x: 1.5, y: 0, z: 1.5 },                         // north-east
      { x: -1.7, y: 0, z: 1.2 },                        // north-west
      { x: -1.8, y: 0, z: -0.4 },                       // west
    ], { w: 0.3, h: 0.3, flat: true, uses: 2, icon: (ctx, P) => (lock.uses > 1 ? ICONS.padlocks : ICONS.padlock)(ctx, P) });
    mkItem(L, 'gatekey', 'Key', [
      { x: 0.05, y: 0.48, z: -1.7 },                    // on the table
      { x: -2.6, y: 0, z: 1.9 },                        // north-west corner
      { x: 2.5, y: 0, z: -1.3 },                        // south-east
      { x: -0.9, y: 0, z: 2.1 },                        // by the gate post
    ], { w: 0.2, h: 0.2, flat: true, tool: true, icon: 'padkey' });
    mkItem(L, 'oldlock', 'Padlock', [{ x: 0.9, y: 0, z: 1.6 }, { x: -2.4, y: 0, z: -1.6 }], { w: 0.24, h: 0.28, flat: true, icon: 'rustlock', decoy: true, decoyText: 'Rusted solid. Nothing will ever open it.' });
    mkItem(L, 'rope', 'Rotten rope', [
      { deg: 120, dist: 1.9, y: 0 },
      { x: 2.4, y: 0, z: 1.0 },                         // east, by the wall (clear of every key and chain spot)
      { x: 1.7, y: 0, z: 0.9 },
    ], { w: 0.4, h: 0.3, flat: true, icon: 'rottenrope' });
    // a gate is open, then pulled shut (it swings closed on its own weight), then chained through the bars, then padlocked
    const holding = ids => G.inv.some(i => ids.includes(i.id));
    const nope = (specific, vague) => { G.say(specific, vague); AUDIO.sfx('nope'); return true; };
    const mkGate = (id, name, deg, sign) => {
      const the = 'The ' + name.toLowerCase();
      const t = mkTarget(L, {
        id, name, deg, dist: 2.6, y: 0, w: 2.3, h: 2.0, accepts: [], shut: false, chained: false, locked: false, closing: 0, angle: Math.PI / 2, sign,
        hint() { return t.locked ? 'Chained and locked.' : t.chained ? 'Chained. It needs the padlock.' : t.shut ? 'Shut. It needs a chain.' : t.closing > 0 ? 'Swinging shut.' : the + ' stands open.'; },
        onClick() {
          if (t.locked) return nope('Chained and locked.', the + ' is chained and locked.');
          if (t.closing > 0) return nope('Let it swing shut.', 'It is still swinging shut.');
          if (!t.shut) { t.closing = 1; AUDIO.sfx('creak'); G.say('You pull ' + the.toLowerCase() + ' shut.', the + ' swings shut.'); return true; }
          if (!t.chained) {
            if (holding(CHAINS)) return false;
            if (G.inv[G.active] && LOCKS.includes(G.inv[G.active].id)) return nope('Chain it first. There is nothing to lock yet.', 'The padlock has nothing to close on.');
            return nope('It is shut, but it needs a chain to hold it.', the + ' is shut, but nothing holds it.');
          }
          if (holding(LOCKS)) return false;
          return nope('The chain is on. It needs the padlock.', 'The chain is through the bars, but nothing fastens it.');
        },
        use(item) {
          if (CHAINS.includes(item.id)) { t.chained = true; t.accepts = LOCKS.slice(); AUDIO.sfx('chain'); G.say('You wind the chain through the bars and round the post.', 'The chain goes through the bars.'); return true; }
          if (item.id === 'padlock') {
            if (!G.hasItem('gatekey')) { G.say('The padlock is shut. It wants its key.', 'The padlock is locked shut, and the shackle will not pull open.'); return false; }
            t.locked = true; t.done = true; t.accepts = []; AUDIO.sfx('lock'); G.say('The padlock snaps shut on the chain.', 'The padlock snaps shut.'); return true;
          }
          return false;
        },
      });
      return t;
    };
    const gate = mkGate('gate', 'Gate', 0, 1), gate2 = mkGate('backgate', 'Back gate', 180, -1);
    const gateOf = lane => lane.idx === 0 ? gate : gate2;
    L.sealed = lane => gateOf(lane).locked;
    L.update = dt => {
      runOn(dt);
      if (L.won && s.after) L.creature.hold = s.after.d;   // in the end it is where the blinks have put it
      for (const g of [gate, gate2]) {
        if (g.closing > 0) {
          g.closing -= dt;
          g.angle = (Math.PI / 2) * Math.pow(clamp(g.closing, 0, 1), 1.4);
          if (g.closing <= 0) { g.closing = 0; g.angle = 0; g.shut = true; g.accepts = CHAINS.slice(); AUDIO.sfx('gate'); G.shake(0.2); }
        } else if (!g.shut && (g.chained || g.locked)) {   // set chained or locked from outside (a test): it is shut, and takes what comes next
          g.shut = true; g.angle = 0; g.accepts = g.locked ? [] : g.chained ? LOCKS.slice() : CHAINS.slice();
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
    // the open middle of a gate)
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

    // Each gate is an arched iron frame: a stile at each end, a rail along the bottom and the arch over the top, and in a
    // narrow panel at each end two bars, two short rails and a ring between them. The middle is open, so through a shut
    // gate the whole of it shows, from its feet to the top of its head, however far off it is and even right at the gate:
    // the bottom rail is under its feet, the arch over its head, the end panels outside its shoulders. A gate that has
    // just been shaken (g.rattleAt) jolts on its hinges and its chain, and settles
    const LEN = 2.1, TOP = 1.9, RISE = 0.38, FOOT = 0.1, PANEL = 0.3, ironC = [38, 38, 42];
    const archY = u => TOP + RISE * (1 - Math.pow((u - LEN / 2) / (LEN / 2), 2));
    L.dynamic = () => {
      for (const g of [gate, gate2]) {
        const e = L.t - (g.rattleAt === undefined ? -9 : g.rattleAt), k = e >= 0 && e < 1 ? Math.exp(-e * 5) : 0;
        const jolt = Math.sin(e * 34) * k * 0.07, hop = Math.abs(Math.sin(e * 29)) * k * 0.045;   // in and out on its chain, and up off its hinges
        const a = g.angle + jolt, sg = g.sign, dx = sg * Math.cos(a), dz = sg * Math.sin(a), hx = -1.05 * sg, hz = 2.6 * sg;
        const at = u => [hx + dx * u, hz + dz * u];
        const bar = (u, y0, y1, w) => { const p = at(u - w), q = at(u + w); R.add(SC.mkWallV(L, p[0], p[1], q[0], q[1], y0 + hop, y1 + hop, ironC)); };
        const rail = (u0, u1, y, w) => { const p = at(u0), q = at(u1); R.add(SC.mkWallV(L, p[0], p[1], q[0], q[1], y - w + hop, y + w + hop, ironC)); };
        bar(0.025, 0.04, archY(0.025), 0.025); bar(LEN - 0.025, 0.04, archY(LEN - 0.025), 0.025);   // the stiles
        rail(0, LEN, FOOT, 0.03);                                                                    // the bottom rail
        for (let i = 0; i < 14; i++) {                                                               // the arch
          const u0 = i / 14 * LEN, u1 = (i + 1) / 14 * LEN, p = at(u0), q = at(u1), y0 = archY(u0) + hop, y1 = archY(u1) + hop;
          R.add(SC.mkQuad(L, [p[0], y0 - 0.032, p[1]], [q[0], y1 - 0.032, q[1]], [q[0], y1 + 0.032, q[1]], [p[0], y0 + 0.032, p[1]], ironC));
        }
        for (const [u0, u1] of [[0, PANEL], [LEN - PANEL, LEN]]) {                                    // the end panels
          const um = (u0 + u1) / 2, ui = u0 === 0 ? u1 : u0;
          bar(ui, FOOT, archY(ui), 0.02); bar(um, FOOT, archY(um), 0.013);
          rail(u0, u1, 0.55, 0.022); rail(u0, u1, 1.45, 0.022);
          const ring = [];
          for (let j = 0; j <= 16; j++) { const t = j / 16 * TAU, p = at(um + Math.cos(t) * 0.1); ring.push(L.pt(p[0], 1.0 + hop + Math.sin(t) * 0.12, p[1])); }
          R.add({ kind: 'poly', pts: ring, color: ironC, stroke: true, lw: 0.022 });
          const tip = at(ui), ty = archY(ui) + 0.03 + hop;                                                   // a point on the arch over the inner bar
          R.add(SC.mkQuad(L, [tip[0] - dx * 0.035, ty, tip[1] - dz * 0.035], [tip[0] + dx * 0.035, ty, tip[1] + dz * 0.035], [tip[0], ty + 0.11, tip[1]], [tip[0], ty + 0.11, tip[1]], ironC));
        }
        // the chain round the gate's end and its post, and the lock on it, just in front of the post's face (z 2.35) so they
        // are drawn over it whichever way the faces are ordered; they jump with the gate when it is shaken
        const lift = Math.abs(jolt) * 1.4 + hop * 1.5;
        if (g.chained) R.add(iconSprite(L, 'gatechain', 1.0 * sg, 0.5 + lift, 2.3 * sg, 0.5, 0.75));
        if (g.locked) R.add(iconSprite(L, 'padlock', 1.01 * sg, 0.36 + lift * 1.4, 2.28 * sg, 0.2, 0.24));
      }
    };
    // ---- how it ends ----
    // Both gates locked, the view goes to it and you do not look away; it only moves in the moments your eyes close. Each
    // blink it is nearer, in a new pose (and, if it was going round, round), until it is at the gate; each blink after that
    // it has the bars in its hands and the gate has just been shaken: it clangs and jolts on its chain, and the chain and
    // the lock jump, and it is still there, holding the bars either side of the open middle, its face in the gap. It does
    // not get in. Then the fade
    const BLINK = 0.26;
    function plan(c) {
      // a longer look round to it first: to where it is, or, if it was going round, to the gate it was going to (the view
      // goes there, below, and it is there by the first blink)
      const off = Math.abs(wrapPi((s.run ? s.run.to.yaw : c.yaw) - G.cam.yaw)), turn = off > Math.PI / 2 ? 1.0 : off > Math.PI / 4 ? 0.4 : 0;
      const b = s.run ? s.run.to.barrierDist : (c.lane.barrierDist || 0), d0 = s.run ? s.run.d2 : c.dist, steps = [];
      if (s.run || d0 - b > 0.3) { if (d0 - b > 8) steps.push({ d: lerp(d0, b, 0.55) }); steps.push({ d: b + 0.9 }); }
      for (const pose of [4, 5, 2]) steps.push({ d: b, pose, shake: true });
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
