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
    win: 'You did not look away again until the sun came up. It was still there. It is still there.',
    fragment: 'You kept your eyes open so long they hurt in the morning. Something in the corner of the room had not moved. You are almost sure.',
  },
  // the gap between the gate posts, no lintel; a second gap in the wall behind you
  lanes: [
    { deg: 0, name: 'gate', barrierDist: 2.95, cue: 'scrape', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }], default: true },
    { deg: 180, name: 'back gate', barrierDist: 2.95, cue: 'clunk', apertures: [{ z: 2.6, x0: -1.05, x1: 1.05, y0: 0, y1: 99 }] },
  ],
  // every gate is three steps now (pull it shut, chain it, padlock it) and there are two chains to find: a little more time
  creatures: [{ type: 'watcher', startDist: 50, time: 36, seenMult: 0, unseenMult: 1 }],
  aftermath: { type: 'stand', dur: 3.6 },
  build(L) {
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
    L.dynamic = () => {
      for (const g of [gate, gate2]) {
        const a = g.angle, sg = g.sign, dx = sg * Math.cos(a), dz = sg * Math.sin(a), hx = -1.05 * sg, hz = 2.6 * sg, len = 2.1, ironC = [38, 38, 42];
        for (let i = 0; i <= 7; i++) { const u = i / 7 * len; R.add(SC.mkWallV(L, hx + dx * (u - 0.025), hz + dz * (u - 0.025), hx + dx * (u + 0.025), hz + dz * (u + 0.025), 0, 1.9, ironC)); }
        for (const yy of [0.3, 1.0, 1.65]) R.add(SC.mkWallV(L, hx, hz, hx + dx * len, hz + dz * len, yy - 0.03, yy + 0.03, ironC));
        // the chain round the gate's end and its post, and the lock on it, just in front of the post's face (z 2.35) so they
        // are drawn over it whichever way the faces are ordered
        if (g.chained) R.add(iconSprite(L, 'gatechain', 1.0 * sg, 0.5, 2.3 * sg, 0.5, 0.75));
        if (g.locked) R.add(iconSprite(L, 'padlock', 1.01 * sg, 0.36, 2.28 * sg, 0.2, 0.24));
      }
    };
    L.isWon = () => gate.locked && gate2.locked;
    L.objectiveText = () => {
      const st = g => g.locked ? 'locked' : g.chained ? 'chained' : g.shut ? 'shut' : 'open';
      return 'Shut, chain and padlock both gates (gate ' + st(gate) + ', back gate ' + st(gate2) + ').' + (gateOf(L.lane).locked ? ' Do not look away.' : '');
    };
    L.floor = { poly: [[-3, -2.4], [3, -2.4], [3, 2.4], [-3, 2.4]], y: 0 };
  }
});
