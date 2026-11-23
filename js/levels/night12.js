'use strict';
// ============================================================ 12. THE BEDROOM ============================================================
// Your own room. You are in bed, sitting up. It is already there, in the hall beyond the doorway or in the closet in
// front of the clothes, behind the wall at the side of the opening, and only its head leans out round the edge at first
// (so it is on the night's card, before you begin); then it steps out into the room, in extreme slow motion, stooping
// under the top of the frame until it is through. Everything you can use is within arm's reach. It cannot stand the
// light: when the lamp comes on it shrinks from it, down on its haunches out of sight below the bed, and comes up again at
// the foot of it (or at its side, out of the closet) with only its eyes over the edge, and then its hands, on the covers.
// They grab the cloth and pull, again and again, and every pull brings them further up the bed toward you: pull the
// covers up before they reach you, or it comes up the bed after them. The covers stop it, but only with the lamp on:
// pulled up in the dark, it takes them and pulls them away.
// The night's easter egg: there is a small old television in the room, and its remote control is in the drawer with the
// bulb. Put it on (the remote need only be carried) and, whatever it was doing, the thing goes over to it and watches the
// film; at the fright it lurches back and puts its fist through the screen; then its head comes round to you, and it
// comes on again from there (the television, below).
// The remote control: a small dark one, its red power button at the top and rows of little buttons under it
Object.assign(ICONS, {
  remote(ctx, P) {
    ctx.save(); ctx.translate(0, 0.5); ctx.rotate(-0.16); ctx.translate(0, -0.5);
    P_rect(ctx, -0.17, 0.03, 0.34, 0.94, P.col([30, 30, 36])); P_rect(ctx, -0.145, 0.055, 0.29, 0.89, P.col([52, 52, 60]));
    P_ell(ctx, -0.07, 0.86, 0.045, 0.04, P.col([206, 46, 40]));
    const key = P.col([150, 150, 156]);
    for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) P_rect(ctx, -0.11 + k * 0.085, 0.66 - r * 0.115, 0.05, 0.06, key);
    P_rect(ctx, -0.045, 0.1, 0.09, 0.04, P.col([96, 96, 104]));
    ctx.restore();
  },
});
LEVELS.push({
  id: 'bedroom', title: 'The Bedroom', facing: 0, eyeH: 1.15, laneMode: 'random',
  pal: { skyTop: [8, 8, 16], fog: [26, 24, 30], ground: [22, 18, 16], fogDist: 30 },
  ambient: { tune: 'ambient:12', wind: 0.15, drone: 0.9, droneFreq: 38, windFreq: 200 },
  lights: [{ x: 3.4, y: 2.3, z: 1.6, r: 6, i: 0.28, color: [150, 170, 230], cone: { x: -1, y: -0.35, z: -0.2, deg: 36 } }],
  text: {
    intro: 'You woke up suddenly.',
    hint: 'The lamp is dead; there is a bulb in the drawer. It cannot stand the light, and the covers only hold with the lamp on. Light first; then hold the covers until they are all the way up, before its hands reach you.',
    objective: 'Get the lamp on. Then pull the covers up.',
    // (tv: caught, by whichever of its ways, after the television was put on: the night's easter egg. Not one of text.eggs:
    // the screen says "It got you")
    death: { default: 'It leaned in closer until its face was the only thing you could see.', dark: 'It pulled the covers away. It is strong in the dark.', grabbed: 'Its hands pulled their way up the bed to you, and then it came up after them.', tv: 'Ironically it doesn\'t seem to like horror.' },
    egg: 'Put on a horror movie.',   // this night's easter egg, as the Scores' list names it once found (game.js: foundEgg)
    win: 'You pulled the covers over your head.\nIt pulled at them, but you were stronger.',
  },
  lanes: [
    // it starts where it peers round the edge from (WAYS below): the start is held to that, whatever the spread of the night.
    // (Their cues are never played: it changes its way itself, gliding round the bed after a few quick, heavy footsteps
    // (crossing, below). The closet's clinking hangers keep the story's hangers on the wind out of this night.)
    { deg: 0, name: 'the doorway', barrierDist: 1.9, startDist: 4.9, maxStart: 4.1, cue: 'creak', default: true, apertures: [{ z: 3.6, x0: -0.5, x1: 0.5, y0: 0, y1: 2.1 }] },
    { deg: 270, name: 'the closet', barrierDist: 1.6, startDist: 4.2, maxStart: 3.4, cue: 'hangers', apertures: [{ z: 3.2, x0: -0.9, x1: 0.9, y0: 0, y1: 2.2 }] },
  ],
  creatures: [{ type: 'tall', startDist: 4.0, time: 70, unseenMult: 2.5 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const parts = STORY.buildBedroom(L, false);
    const unplugged = L.nightmare, sticks = L.nightmare;
    Object.assign(s, { fitted: false, plugged: !unplugged, lampOn: false, lampT: 0, clicks: 0, coversUp: false, tick: 0, tugAt: -9, mode: null, latBias: 0, tv: null });
    // Drawing order in this room (it is built in local coordinates, and this night faces north, so they are world ones).
    // The mattress is one long quad whose middle is further off than the nightstand beside it and the bed's own legs, so
    // it was drawn first and they over it: the nightstand stood on the covers and the legs showed through. Whatever is
    // beside or under the bed goes behind the mattress (BED). The nightstand stands back against the wall at the head of
    // the bed, on your right, its drawer facing down the room (NS: where it is; LX, LZ: the lamp on it).
    // The mattress's top is drawn whole, just before the covers (MATTRESS, between them and BED): left to itself it was cut
    // into pieces each sorted where it is, and the pieces nearer than the covers were drawn over them as they came up.
    const NS = parts.nightstand, LX = parts.lamp[0], LZ = parts.lamp[2];
    const BED = 1.7, MATTRESS = 1.66, within = (p, x0, x1, z0, z1) => p.kind === 'poly' && p.pts.every(v => v[0] >= x0 && v[0] <= x1 && v[2] >= z0 && v[2] <= z1);
    for (const p of L.props) {
      if (p.sortDist !== undefined) continue;
      if (within(p, -0.75, 0.75, -1.0, 1.9) && p.pts.every(v => v[1] === 0.58) && Math.min(...p.pts.map(v => v[2])) === -1.0) p.sortDist = MATTRESS;
      else if (within(p, NS.x0 - 0.01, NS.x1 + 0.01, NS.z0 - 0.01, NS.z1 + 0.01) || [-0.72, 0.72].some(x => within(p, x - 0.05, x + 0.05, -0.95, -0.85) || within(p, x - 0.05, x + 0.05, 1.8, 1.9))) p.sortDist = BED;
    }
    const lampArt = STORY.lamp(L, parts.lamp[0], parts.lamp[1], parts.lamp[2], { lit: () => shown() });
    // its cord runs off the back of the nightstand (and, under the bed, to the wall on the other side)
    SC.quad(L, [LX + 0.05, NS.top + 0.004, LZ - 0.04], [LX + 0.07, NS.top + 0.004, LZ - 0.03], [NS.x1 - 0.04, NS.top + 0.004, NS.z0], [NS.x1 - 0.06, NS.top + 0.004, NS.z0], [30, 26, 24], { sortDist: 1.5 });
    // the wall socket, low on the wall behind the bed on the closet side: a pale plate with its two slots
    SC.wallV(L, -1.55, -1.094, -1.45, -1.094, 0.22, 0.36, [120, 114, 104], { sortDist: 1.86 });
    for (const x of [-1.515, -1.485]) SC.wallV(L, x - 0.007, -1.092, x + 0.007, -1.092, 0.26, 0.31, [22, 20, 20], { sortDist: 1.859 });
    const c0 = () => L.creatures[0];
    // the drawer, in the front of the nightstand, holds the bulb, and the television's remote control. It is built into
    // the nightstand (a container's card would turn with the view and stand out from it at an angle): opened, it slides
    // right out along the bedside (DR.out), an open box (its front, its two sides, its bottom, the dark of the nightstand
    // behind), and they lie in it on its bottom, under its rim, where you look down into it from the bed.
    // DR: its front's width and height, the cabinet's face it is in (zf), how far it comes out and how long that takes,
    // its bottom, the thickness of its sides; `in`: where each thing lies in it (across it, and how far behind its front)
    // (the remote is a tool: it stays with you; held in the fist by its lower end)
    const DR = { x0: NS.x0 + 0.03, x1: NS.x1 - 0.03, y0: 0.44, y1: 0.6, zf: NS.z1, out: 0.3, dur: 0.4, floor: 0.5, wall: 0.016 };
    const bulbs = [{ id: 'bulb', name: 'Bulb', in: [0.26, 0.085], opts: { w: 0.13, h: 0.16, icon: 'bulb', material: 'glass' } },
      { id: 'remote', name: 'Remote', in: [0.22, 0.22], opts: { w: 0.2, h: 0.19, icon: 'remote', tool: true, held: { grip: 'fist', at: [0.02, 0.26], angle: -0.3, size: 0.2 } } }];
    // how far out it is now; and the drawer's target and the things in it go with it
    const drawerOut = () => (drawer.open ? DR.out * smoothstep(clamp((L.t - drawer.openAt) / DR.dur, 0, 1)) : 0);
    const rideDrawer = () => {
      const out = drawerOut(), at = (x, y, z) => L.pt(x, y, z);
      const t = at((DR.x0 + DR.x1) / 2, DR.y0 - 0.01, DR.zf + out * 0.5); drawer.x = t[0]; drawer.y = t[1]; drawer.z = t[2]; drawer.w = 0.42 + out * 0.3;
      for (const it of drawer.yielded) if (!it.taken) { const q = at(DR.x0 + it.in[0], DR.floor + 0.004, DR.zf + out - it.in[1]); it.x = q[0]; it.y = q[1]; it.z = q[2]; }
      return out;
    };
    const drawer = mkTarget(L, {
      id: 'drawer', name: 'Drawer', x: (DR.x0 + DR.x1) / 2, y: DR.y0 - 0.01, z: DR.zf, w: 0.42, h: 0.18, open: false, yielded: [],
      hint() { return drawer.open ? 'Nothing else in it.' : 'The nightstand drawer.'; },
      onClick() {   // your hand opens it (js/hands.js); clicked again, it goes into it
        if (!drawer.open) {
          drawer.open = drawer.done = true; drawer.openAt = L.t; AUDIO.sfx('drawer'); // its own sound: not the creak that warns of the doorway, nor a creature's scratching
          for (const b of bulbs) drawer.yielded.push(Object.assign(mkItem(L, b.id, b.name, { x: DR.x0 + b.in[0], y: DR.floor + 0.004, z: DR.zf - b.in[1], flat: true, jitter: 0 }, b.opts), { in: b.in }));
          G.reach(drawer, 'pull');
          return true;
        }
        const left = drawer.yielded.some(i => !i.taken); G.say(left ? 'Take what is in it.' : 'Nothing else in it.', left ? 'Something is still in it.' : 'Nothing more.');
        G.reach(drawer, { style: 'touch', at: [0, 0.8] });
        return true;
      },
    });
    // (for the night's test: the four corners of its open top, inside its rim, as it is now; and its bottom's height)
    drawer.rim = () => { const z1 = DR.zf + drawerOut(); return [[DR.x0 + DR.wall, DR.zf], [DR.x1 - DR.wall, DR.zf], [DR.x1 - DR.wall, z1 - DR.wall], [DR.x0 + DR.wall, z1 - DR.wall]].map(([x, z]) => L.pt(x, DR.y1, z)); };
    drawer.floorY = DR.floor;
    const knob = SC.mkSprite(L, (DR.x0 + DR.x1) / 2, (DR.y0 + DR.y1) / 2 - 0.018, DR.zf + 0.014, 0.036, 0.036, (ctx, P) => { ctx.scale(0.036, 0.036); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([96, 92, 86])); P_ell(ctx, -0.1, 0.6, 0.3, 0.3, P.col([164, 158, 148])); }, { sortDist: 1.05 });
    // The lamp's switch is the pull chain under its shade, and your hand pulls it (js/hands.js): the chain jerks and the switch
    // clicks as the hand gets there. With no bulb in, or the cord out, nothing comes of it; on Nightmare it sticks twice (the
    // chain barely gives) before it goes. The light comes on as it is pulled.
    const CHAIN = [0.2, 0.31];
    const pull = (stiff, then) => {
      const was = G.hand.reach, go = () => { s.tugAt = L.t; s.stiff = stiff; AUDIO.sfx('switch'); if (then) then(); };
      const r = G.reach(lampT, { style: 'pull', at: CHAIN, onTouch: go });
      if (!r || r === was) go();   // no hand to show, or it is there already, still on the chain: at once
    };
    const lampT = mkTarget(L, {
      id: 'lamp', name: 'Lamp', x: LX, y: NS.top, z: LZ, w: 0.4, h: 0.55, accepts: ['bulb'],
      hint() { return !s.fitted ? 'The lamp. Dead. No bulb in it.' : !s.plugged ? 'A bulb in it now. Nothing happens; the cord is loose somewhere.' : s.lampOn ? 'On.' : 'Off. Switch it on.'; },
      use(item) { if (item.id !== 'bulb') return false; s.fitted = true; lampT.accepts = []; AUDIO.sfx('fit'); G.say('The bulb goes in. Now the switch.', 'In.'); return true; },
      onEmpty() { pull(false); },   // no bulb in it yet, and nothing in hand: the chain is pulled, and nothing
      onClick() {
        if (!s.fitted) return false;
        if (!s.plugged) { G.say('Nothing. The cord is loose somewhere. Look down beside the bed.', 'Nothing. It is not plugged in.'); pull(false); return true; }
        if (s.lampOn) { G.say('It is on. Leave it.', 'On.'); G.reach(lampT, { style: 'touch', at: CHAIN }); return true; }
        if (sticks && !s.wasLit && ++s.clicks < 3) { G.say('The switch sticks.', 'Sticks.'); pull(true); return true; }   // the first time (once it has gone, it comes back on at a pull)
        // it burns long enough for it to go down and come up at the bed and for the covers after that, with time over;
        // it flickers for its last two seconds
        s.clicks = 0; s.lampOn = true; s.wasLit = true; s.onAt = L.t + 0.3; s.lampT = 22 + L.rand() * 6; G.say('Light. It shrinks from it.', 'Light.');
        pull(false, () => { s.onAt = L.t; AUDIO.sfx('lampOn'); });
        return true;
      },
    });
    const shown = () => s.lampOn && L.t >= (s.onAt || 0);   // the light, once the chain has been pulled
    // the lamp's own details, over it: the socket (and the bulb, once it is in) dark through the shade, bright when it is
    // on; the pull chain under the shade, which jerks when it is pulled
    const lampDetail = SC.mkSprite(L, LX, NS.top, LZ, 0.34, 0.5, (ctx, P) => {
      ctx.scale(0.34, 0.5);
      if (shown()) {
        const g = ctx.createRadialGradient(0, 0.7, 0.01, 0, 0.7, 0.2); g.addColorStop(0, 'rgba(255,250,232,0.95)'); g.addColorStop(1, 'rgba(255,236,190,0)');
        ctx.fillStyle = g; ctx.fillRect(-0.3, 0.5, 0.6, 0.45);
      } else {
        const sh = P.cola([54, 44, 32], 0.6);
        P_rect(ctx, -0.055, 0.5, 0.11, 0.1, sh);
        if (s.fitted) { P_ell(ctx, 0, 0.71, 0.13, 0.12, sh); P_rect(ctx, -0.065, 0.58, 0.13, 0.06, sh); }
      }
      const tug = clamp(1 - (L.t - s.tugAt) / 0.35, 0, 1) * (s.stiff ? 0.018 : 0.06), chain = P.col([150, 140, 118]);
      P_line(ctx, 0.24, 0.5, 0.24, 0.35 - tug, 0.016, chain); P_ell(ctx, 0.24, 0.34 - tug, 0.03, 0.022, chain);
    }, { sortDist: Math.hypot(LX, LZ) - 0.002 });
    glowWith(lampT, [lampArt, lampDetail]);
    // on Nightmare the lamp's plug lies on the floor by the wall socket, on the closet side, pulled out
    const PLUG = [-1.74, -0.7];
    const socket = unplugged && mkTarget(L, {
      id: 'socket', name: 'Cord', x: -1.6, y: 0.02, z: -0.6, w: 0.42, h: 0.3, flat: true,
      hint() { return s.plugged ? 'Plugged in.' : 'The lamp cord, out of its socket.'; },
      onClick() { if (s.plugged) return false; s.plugged = true; socket.hidden = true; AUDIO.sfx('clunk'); G.say('Plugged in.', 'Click.'); G.reach(socket, 'push'); return true; },   // your hand pushes the plug in
    });
    const covers = mkTarget(L, {
      id: 'covers', name: 'Covers', x: 0, y: 0.6, z: 1.1, w: 1.4, h: 0.6, flat: true, hold: 3.0,
      hint() { return s.coversUp ? 'Up over you.' : 'The covers. Hold on to them until they are all the way up; they slip back if you let go too soon.'; },
      use(item) {
        if (item !== null) return false;
        // (while it is at the television they do not hold in the dark either, and slip back; it is not there to take them)
        if (!s.lampOn && s.mode === 'tv') { covers.done = false; covers.progress = 0; G.say('They will not hold in the dark. The lamp first.', 'The lamp first.'); return true; }
        if (!s.lampOn) { yank(); return true; }   // up in the dark: it is strong in the dark
        s.coversUp = true; AUDIO.sfx('hiss'); G.say('The covers are up.', 'Up.'); return true;
      },
    });
    L.isWon = () => s.lampOn && s.coversUp;
    L.objectiveText = () => (s.lampOn ? 'Lamp on. ' : !s.fitted ? 'Find a bulb (the drawer). Fit it. ' : !s.plugged ? 'Plug the cord in (down, beside the bed). ' : 'Switch the lamp on. ') + (s.coversUp ? 'Covers up.' : s.lampOn ? 'Pull the covers up (hold).' : 'Then the covers, not before.');
    // holding the covers, your hand is on them, pulling them up, its grip on the hem as it comes up; let go too soon and the
    // hand goes, and the covers slip back
    const hem = () => { const { zE, yE } = coversAt(); return { x: 0.3, y: yE + 0.02, z: zE }; };
    const holdCovers = () => {
      if (G.holding !== covers || covers.done || G.state !== 'play') return;
      const r = G.hand.reach;
      if (!r || r.target !== covers) G.reach(covers, { style: 'pull', at: hem(), sfx: 'cloth' });
      else { r.at = hem(); if (r.T > r.out + r.hold - 0.1) G.reach(covers, 'pull'); }   // (each call while it is there keeps it there a beat more)
    };
    // ---- what it does ----
    // Each way in: where the opening is (apZ, its half-width edge, along and across the way, and the height of its top),
    // where it peers round the edge from (peerD: in the closet, in front of the clothes), and its place at the bed, down out
    // of the light (spot: along the way and across it): at the foot of the bed from the doorway, at the corner of its foot
    // from the closet; where its hands take hold of the covers there (x, z in the room), where they have got to when they
    // reach you (to), and the edge of the bed their arms come over (over: 'z' at the foot, 'x' at the side, and where).
    const WAYS = [
      { apZ: 3.6, edge: 0.5, top: 2.1, peerD: 4.1, spot: { d: 2.08, lat: 0 }, hands: [[-0.3, 1.86], [0.3, 1.86]], to: [[-0.2, 0.45], [0.2, 0.45]], over: ['z', 1.93] },
      { apZ: 3.2, edge: 0.9, top: 2.2, peerD: 3.4, spot: { d: 1.04, lat: 1.35 }, hands: [[-0.64, 1.24], [-0.64, 1.72]], to: [[-0.38, 0.32], [-0.22, 0.72]], over: ['x', -0.79] },
    ];
    const side = L.rand() < 0.5 ? -1 : 1, BEHIND = 0.3;   // which side of the opening it stands, and how far behind the edge
    const way = c => WAYS[c.lane.idx] || WAYS[0], edgeAt = (w, d) => w.edge * d / w.apZ;
    const hold = (c, d) => { c.hold = d; s.held = true; }, letGo = c => { if (s.held) { c.hold = null; s.held = false; } };
    const panOf = c => clamp(Math.sin(wrapPi(Math.atan2(c.pos().x, c.pos().z) - G.cam.yaw)), -0.85, 0.85);
    // coming: behind the wall at the side of the opening with only its head round the edge; stepping out into the opening
    // as it comes on, the head coming in over its shoulders; then on into the room
    const outOf = (c, d) => { const w = way(c); return clamp((w.peerD - d) / (w.peerD - w.apZ + 0.05), 0, 1); };
    const latAt = (c, d) => side * (edgeAt(way(c), d) + BEHIND) * (1 - smoothstep(outOf(c, d))) + s.latBias;
    const place = (c, d = c.dist) => {   // (d: where it is this frame, once it has moved)
      c.peerSide = -side; c.peer = 1 - smoothstep(outOf(c, d) / 0.6);
      if (s.mode !== 'come') c.runLat = latAt(c, c.dist);
    };
    // Coming, it glides (the tall one's along and pace): where the night's clock would have it (c.u, as for every night) is
    // how far along its way it is going, and it keeps to that way (round the edge of the opening, out into the room), slowly
    // and evenly, never faster than its own slow pace however far ahead the clock runs, and with nothing sudden in it: out
    // from behind the wall, through the opening, on to the bed. Its feet step under it, and its footsteps fall as each comes
    // down (its steps are its gait; the game adds what it moved to its gait: that is taken off)
    const stepsOf = (c, w) => { if (s.mode === 'come') place(c, w.d); c.runLat = w.lat; c.gait = w.n * Math.PI - Math.abs(c.dist - w.d) * c.CR.stepRate * Math.PI; return w.d; };
    const walkOn = (c, dt) => {
      let m = c.CR.speedMult(c, dt, c.seen) * (c.seen ? c.seenMult : c.unseenMult);
      if (c.frozen || c.dead) m = 0;
      c.u = clamp(c.u + dt * m / c.T, 0, 1);
      return stepsOf(c, c.CR.along(c, dt, c.D0 * Math.pow(1 - c.u, c.gamma), d => latAt(c, d)));
    };
    // its walking, kept where it is now (its feet as they were under it, even if it has been somewhere else since)
    const shiftWalk = c => {
      const w = c.walk, dd = w ? c.dist - w.d : 0, dl = w ? (c.runLat || 0) - w.lat : 0;
      if (!w || Math.abs(dd) + Math.abs(dl) < 1e-9) return;
      w.d += dd; w.lat += dl; w.vd = w.vl = 0;
      for (const q of w.feet.concat(w.step ? [w.step.f0, w.step.f1] : [])) { q.d += dd; q.lat += dl; }
    };
    const come = c => { s.mode = 'come'; letGo(c); c.distFn = walkOn; c.along = null; c.glideFeet = false; shiftWalk(c); };
    const stopWalking = c => { if (c.distFn) c.distFn = null; c.along = null; c.glideFeet = false; };   // (its feet stay as they are)
    // at first it only peers: put there at once, before the night begins, so the night's card shows it where it starts,
    // standing on its own feet
    const ready = c => {
      if (s.mode) return;
      s.mode = 'peer'; s.peerTill = L.t + 4 + L.rand() * 2; if (c.hold === null) hold(c, c.dist);
      place(c); c.lat = c.runLat;
      c.walk = null; c.CR.pace(c, 0, c.dist, c.runLat);
      c.switched = true; s.switchAt = 0.12 + L.rand() * 0.28;   // (it changes its way itself: crossing, below)
    };
    // On Nightmare it may change its way once, early, while you are not looking (as the game would have it, but on its feet):
    // out in the room, it glides round the foot of the bed, in between it and the dresser, to the other way in, and comes on
    // from there. As it sets off, a few quick, heavy thumps of footsteps, from where it was to where it is going (thumping,
    // below: the only warning). Its feet drift with it; the night's clock waits while it goes. Half way round it is counted
    // along the other way.
    const CROSS = { v: 0.4, acc: 0.2, clear: 2.3, wide: 2.75 };   // (round, it keeps between the bed and the dresser)
    const toFrame = (ln, x, z) => [x * ln.dirX + z * ln.dirZ, x * Math.cos(ln.yaw) - z * Math.sin(ln.yaw)];
    const reframe = (c, to) => {   // the same place, and its walk, said along the other way
      const from = c.lane, conv = (d, lat) => { const p = APPROACH.position(from, d, lat, L.eyeH); return toFrame(to, p.x, p.z); };
      const w = c.walk;
      if (w) {
        const [d, lat] = conv(w.d, w.lat), dd = d - w.d, dl = lat - w.lat;
        [w.vd, w.vl] = toFrame(to, from.dirX * w.vd + Math.cos(from.yaw) * w.vl, from.dirZ * w.vd - Math.sin(from.yaw) * w.vl);
        for (const q of w.feet.concat(w.step ? [w.step.f0, w.step.f1] : [])) { q.d += dd; q.lat += dl; }
        w.d = d; w.lat = lat;
      }
      [c.dist, c.runLat] = conv(c.dist, c.runLat || 0); c.lat = c.runLat;
      c.retarget(to.idx); c.reached = false;
      if (c.idx === 0) { L.laneIdx = to.idx; L.lane = to; L.barrierDist = to.barrierDist || 0; }
    };
    const maySwitch = c => {
      if (s.switched || !L.diff.laneSwitch || L.def.laneSwitch === false || L.won || c.dead || s.mode !== 'come' || c.hold !== null) return;
      if (c.u < s.switchAt || c.seen || c.dist > way(c).apZ - 0.1) return;
      s.switched = true;
      const to = L.lanes.find(l => l !== c.lane), p = c.pos(), r0 = Math.hypot(p.x, p.z), b0 = Math.atan2(p.x, p.z);
      const r1 = clamp(r0, CROSS.clear, WAYS[to.idx].apZ - 0.3), rA = clamp(Math.min(r0, r1), CROSS.clear, CROSS.wide), db = wrapPi(to.yaw - b0);
      s.mode = 'cross'; s.cross = { to, b0, db, r0, r1, rA, k: 0, v: 0, len: Math.abs(db) * rA + Math.abs(r0 - rA) + Math.abs(r1 - rA) };
      c.distFn = crossing; c.along = null; c.glideFeet = true;
      s.thumps = { t0: L.t, n: 0, b0, b1: b0 + db, r0, r1 };
    };
    // its footsteps as it shifts round: THUMPS.n of them, THUMPS.gap seconds apart (on the night's clock), each a heavy
    // running step (the runner's, through the effects as every footstep is), panned along from where it was to where it
    // is going and as loud as a step that far off
    const THUMPS = { n: 3, gap: 0.16 };
    const thumping = () => {
      const T = s.thumps;
      if (!T) return;
      while (T.n < THUMPS.n && L.t >= T.t0 + T.n * THUMPS.gap) {
        const k = T.n / (THUMPS.n - 1), b = T.b0 + (T.b1 - T.b0) * k, r = lerp(T.r0, T.r1, k);
        AUDIO.footstep('runner', clamp(4 / (r + 4), 0.12, 0.7), clamp(Math.sin(wrapPi(b - G.cam.yaw)), -0.85, 0.85));
        T.n++;
      }
      if (T.n >= THUMPS.n) s.thumps = null;
    };
    const crossing = (c, dt) => {
      const X = s.cross, want = Math.min(CROSS.v, Math.sqrt(2 * CROSS.acc * Math.max(0, 1 - X.k) * X.len));
      X.v += clamp(want - X.v, -CROSS.acc * dt, CROSS.acc * dt);
      X.k = Math.min(1, X.k + Math.max(0.02, X.v) / X.len * dt);
      if (c.lane !== X.to && X.k >= 0.5) reframe(c, X.to);
      const b = X.b0 + X.db * X.k, r = X.k < 0.5 ? lerp(X.r0, X.rA, smoothstep(X.k / 0.25)) : lerp(X.rA, X.r1, smoothstep((X.k - 0.75) / 0.25));
      const [d, lat] = toFrame(c.lane, r * Math.sin(b), r * Math.cos(b)), w = c.CR.pace(c, dt, d, lat);
      if (X.k >= 1 && Math.hypot(w.d - d, w.lat - lat) < 0.02) {   // round: it comes on from here
        s.latBias = 0; s.latBias = w.lat - latAt(c, w.d);
        come(c);
      }
      return stepsOf(c, w);
    };
    // Coming through the opening it stoops under the top of it (the tall one's c.headroom): behind it, under the line from
    // your eye past the top of the frame, so nothing of it shows over that; a stride out, well under it, and through it so;
    // inside, it straightens up under the ceiling
    const CLEAR = 0.1, DEPTH = 0.12, CEILING = 2.5;
    const headroom = c => {
      const w = way(c), d = c.dist, e = d - w.apZ;
      if (e > 0) return Math.min(L.eyeH + (w.top - L.eyeH) * d / w.apZ - 0.02, w.top - CLEAR + 0.6 * Math.max(0, e - 0.15));
      if (e > -DEPTH) return w.top - CLEAR;
      return lerp(w.top - CLEAR, CEILING - 0.05, smoothstep((-e - DEPTH) / 1.2));
    };
    // The light comes on: it flinches from it, an arm across its face, and sinks down out of sight; down there it goes to
    // its place at the bed (out of sight all the way), comes up until its eyes are over the edge, and holds there, peering
    // at you; then its hands come up over the edge onto the covers (and you are told). Times in seconds from the light.
    const startDuck = c => {
      s.mode = 'duck'; s.grab = null;
      s.duck = { t0: L.t, d: c.dist, lat: c.lat, peer: c.peer || 0, duck0: c.duck || 0, eye0: c.duck ? c.eyeTo : null, cued: !!(s.duck && s.duck.cued) };
      s.duck.route = route(c, { d: c.dist, lat: c.lat }, way(c).spot); s.duck.creep = clamp(s.duck.route.len * 2, 0.8, 5);   // (low along the floor, not in a rush)
      stopWalking(c);
      c.flinchSide = c.lat > 0.05 ? -1 : 1;   // the arm toward the middle of the room
      hold(c, c.dist);
      AUDIO.voice('slow', 0.5, panOf(c));
    };
    const DUCK = { flinch: 1.1, down: 2.7, up: 1.2, look: 1.1, reach: 0.22 };   // (its hands come up onto the covers in a snatch)
    // The way it goes, low along the floor, to its place at the bed (or at you, pulling the covers away in the dark):
    // straight there from out in the room; but from in the opening, or from behind the wall beside it, first along behind
    // the wall to the middle of the frame, then straight out through the middle of it into the room (OUT metres past it:
    // clear of the frame, and in the closet of its doors swung back either side), and only then on to the bed, so it never
    // goes through the wall, the frame or a door. A list of points {d, lat}; along(rt, m) is the point m of the way along it.
    const OUT = 0.45;
    const route = (c, from, to) => {
      const w = way(c), pts = [from];
      if (from.d > w.apZ - 0.05 || (from.d > w.apZ - OUT && Math.abs(from.lat) < w.edge)) {
        if (Math.abs(from.lat) > 1e-3) pts.push({ d: from.d, lat: 0 });
        if (from.d > w.apZ - OUT && to.d < w.apZ - OUT) pts.push({ d: w.apZ - OUT, lat: 0 });
      }
      pts.push(to);
      const segs = pts.slice(1).map((q, i) => Math.hypot(q.d - pts[i].d, q.lat - pts[i].lat));
      return { pts, segs, len: segs.reduce((a, b) => a + b, 0) };
    };
    const along = (rt, m) => {
      let x = clamp(m, 0, 1) * rt.len;
      for (let i = 0; i < rt.segs.length; i++) {
        const l = rt.segs[i];
        if (x <= l || i === rt.segs.length - 1) { const k = l > 1e-9 ? clamp(x / l, 0, 1) : 1, a = rt.pts[i], b = rt.pts[i + 1]; return { d: lerp(a.d, b.d, k), lat: lerp(a.lat, b.lat, k) }; }
        x -= l;
      }
      return rt.pts[rt.pts.length - 1];
    };
    const ducking = c => {
      const D = s.duck, t = L.t - D.t0, hide = c.hideBelow === undefined ? 0.6 : c.hideBelow;
      const T2 = DUCK.down, T3 = T2 + D.creep, T4 = T3 + DUCK.up, T5 = T4 + DUCK.look;
      c.flinch = smoothstep(t / 1.0) * (1 - smoothstep((t - DUCK.flinch) / 0.7));
      c.duck = lerp(D.duck0, 1, smoothstep((t - DUCK.flinch + 0.1) / (T2 - DUCK.flinch + 0.1)));
      // going to the bed it keeps low, crawling along the floor on its hands and feet, its eyes on you all the way: out in
      // the open, a dark shape low along the floor with two pale eyes in it. Its limbs go as far as it goes (c.crawl: the
      // tall one's crawl, a stride a little under half a metre), so they stop when it stops and nothing of it jumps
      const m = smoothstep((t - T2 + 0.2) / D.creep), low = Math.max(hide - 0.4, 0.26);
      c.faceAway = 0;
      const at = along(D.route, m);
      if (!s.came) hold(c, at.d);   // (under the covers, at the end, the night walks it to the bed itself)
      c.runLat = at.lat; c.peer = D.peer * (1 - smoothstep(t / T2));
      { const nd = c.hold !== null ? c.hold : c.dist, was = D.at || { d: nd, lat: c.runLat, t: L.t }, mv = Math.hypot(nd - was.d, c.runLat - was.lat), dt = Math.max(0, L.t - was.t);
        c.crawl = (c.crawl || 0) + mv * c.CR.CRAWL;
        if (mv < 0.02 * dt) { const rest = Math.round(c.crawl / Math.PI) * Math.PI; c.crawl += (rest - c.crawl) * Math.min(1, dt * 3); }   // still: it settles, all fours down
        D.at = { d: nd, lat: c.runLat, t: L.t }; }
      const gk = s.grab ? s.grab.k : 0;   // as its hands come up the bed it draws itself up after them
      c.eyeTo = t < T3 ? (D.eye0 === null ? low : lerp(D.eye0, low, smoothstep(t / T2))) : lerp(low, hide + 0.07 + gk * 0.1, smoothstep((t - T3) / DUCK.up));
      c.reach = smoothstep((t - T5) / DUCK.reach); c.gripY = hide - 0.03;   // (its arms up to the edge; the hands over it are drawn on the covers)
      if (t >= T5 && !D.cued) { D.cued = true; AUDIO.sfx('cloth', panOf(c)); if (!L.won) G.say('Its hands come up over the end of the bed, onto the covers. Pull them up before they reach you.', 'Its hands are on the covers.'); }
      if (t >= T5) grabbing(c, t - T5);
    };
    // Its hands on the covers: they take hold of the cloth and pull, one and then the other, and every pull brings that hand
    // further up the bed toward you. A pull: the hand lifts, its fingers spread, and reaches on up the bed (REACH of it);
    // it comes down and the fingers close on the cloth (CLOSE), and it drags it back toward itself (DRAG), the cloth bunched
    // in its fist and the covers jerking; the other hand holds on where it is. When the last pull has brought them to you,
    // it comes up the bed after them (its own death). Pulled up in time, the covers stop it, and its hands stop where they are.
    const GRAB = { start: 0.6, every: 1.0, pulls: L.tier(10, 8), drag: 0.07 };
    const REACH = 0.4, CLOSE = 0.55, DRAG = 0.85;
    const grabbing = (c, t) => {
      const per = Math.ceil(GRAB.pulls / 2), gt = t - GRAB.start;
      if (!s.grab) s.grab = { k: 0, n: -1, hands: [0, 1].map(() => ({ k: 0, drag: 0, open: 0, lift: 0, bunch: 0.3 })) };
      const G2 = s.grab;
      if (L.won || gt < 0) { s.jerk = 0; return; }   // (held, at the end, where they are)
      const n = Math.min(GRAB.pulls - 1, Math.floor(gt / GRAB.every)), u = gt >= GRAB.pulls * GRAB.every ? 1 : gt / GRAB.every - n;
      G2.k = Math.min(1, gt / (GRAB.pulls * GRAB.every));
      G2.hands.forEach((h, i) => {
        const done = Math.floor((n + 1 - i) / 2), k0 = Math.min(1, done / per);   // its pulls before this one, and where they left it
        if (n % 2 !== i) { h.k = k0; h.drag = done ? 1 : 0; h.open = 0; h.lift = 0; h.bunch = done ? 1 : 0.3; return; }
        const k1 = Math.min(1, (done + 1) / per), r = smoothstep(u / REACH);
        h.k = lerp(k0, k1, r);
        h.lift = u < REACH ? Math.sin(Math.PI * u / REACH) : 0;
        h.open = u < REACH ? smoothstep(u / 0.15) : 1 - smoothstep((u - REACH) / (CLOSE - REACH));
        h.drag = u < REACH ? (done ? 1 - r : 0) : smoothstep((u - CLOSE) / (DRAG - CLOSE));
        h.bunch = u < REACH ? (done ? 1 - r : 0.3 * (1 - r)) : h.drag;
      });
      s.jerk = u > CLOSE && u < DRAG ? Math.sin(Math.PI * (u - CLOSE) / (DRAG - CLOSE)) : 0;
      if (n !== G2.n && u >= CLOSE) { G2.n = n; AUDIO.sfx('cloth', panOf(c)); G.shake(0.12); }
      if (gt >= GRAB.pulls * GRAB.every && G.state === 'play') {   // they are at you: it comes up the bed after them
        G.holding = null; c.deathSpec = Object.assign({}, c.CR.death, { delay: 0.05, sting: 'sting' }); die(c, cause('grabbed'));
      }
    };
    // The light goes out with it down there: it rises, slowly, from behind the bed, and comes on again from where it is
    const RISE = 3.2;
    const rising = (c, dt) => {
      const t = L.t - s.riseAt;
      c.flinch = 0; c.faceAway = 0; c.reach = Math.max(0, c.reach - dt * 4); c.duck = s.rise0 * (1 - smoothstep(t / RISE));   // (its hands let go at once)
      s.grab = null; s.jerk = 0;
      if (t >= RISE) {
        c.duck = 0; c.reach = 0;
        c.u = clamp(1 - c.dist / c.D0, 0, 1); s.latBias = 0;
        s.latBias = c.runLat - latAt(c, c.dist);   // from where it is across the room
        come(c);
      }
    };
    // The covers pulled up in the dark: a moment of nothing, then it is at the bed (all at once, after all that slowness),
    // its hands on the covers, and it rips them down off you and is in your face
    const yank = () => {
      const c = c0(), sp = way(c).spot, to = c.dist < sp.d ? { d: c.dist, lat: c.lat } : sp;
      s.mode = 'yank'; s.yank = { t0: L.t, d: c.dist, lat: c.lat, to, route: route(c, { d: c.dist, lat: c.lat }, to), duck0: c.duck || 0, peer0: c.peer || 0 }; s.yankK = 0;
      G.holding = null; stopWalking(c); hold(c, c.dist);
    };
    const yanking = c => {
      const Y = s.yank, t = L.t - Y.t0, hide = c.hideBelow === undefined ? 0.6 : c.hideBelow;
      const m = easeIn(clamp((t - 0.3) / 0.3, 0, 1));
      const at = along(Y.route, m);
      hold(c, at.d); c.runLat = at.lat;
      c.duck = Y.duck0 * (1 - m); c.peer = Y.peer0 * (1 - m); c.flinch = 0;
      c.reach = smoothstep((t - 0.45) / 0.15); c.gripY = hide - 0.03; c.faceAway = 0;
      s.yankK = smoothstep((t - 0.62) / 0.2);
      if (t >= 0.62 && !Y.tugged) { Y.tugged = true; AUDIO.sfx('tug', panOf(c)); G.shake(0.9); }
      if (t >= 0.86 && G.state === 'play') { c.deathSpec = Object.assign({}, c.CR.death, { delay: 0.05, sting: 'sting' }); die(c, cause('dark')); }   // at once: its hands at you, its face
    };
    // ---- the television (the night's easter egg) ----
    // A small old set on a low cabinet out past the foot of the bed, to the right of the doorway, turned to face you: a
    // rounded screen, two dials and a speaker, a rabbit-ear aerial. Off, its glass is dark, with a faint reflection. It is
    // only scenery until you carry the remote control (from the drawer); then it can be put on, once ("Turn on the TV").
    // It comes on with a click to a second of snow, and then plays its little film (film, below) to the fright at the end
    // of it. Its light is its own: it is not the lamp, and the night's rules know nothing of it.
    // The thing, whatever it was doing (tvStart, tving): stops and looks round at it; scurries over to it on all fours (out
    // through the middle of its opening first, if it was still behind it, and round the foot of the bed) and bends double
    // over it, its face up against the glass; at the fright it is thrown back, its arms up, and then puts its fist through
    // the screen: the set is dead, its glass burst out, smoking, its aerial bent. Then its head comes round to you, tilting
    // on over past where a head should turn, and it comes on again from where it stands (tvEnd): in the dark, on its feet,
    // with the night's clock where it was when the set came on (it has gained nothing by it); in the lamp's light, an arm
    // across its face and down on its haunches, as the light always has it. It cannot catch you while this lasts. Caught
    // after it, by whichever of its ways, the line is the television's (cause 'tv').
    const TVB = 29, TVD = 2.68, KT = CREATURES.tall.SCALE;   // its bearing from the bed (degrees), and how far off its front is
    const tvXZ = (x, z) => rotY(x, z, TVB * DEG);   // from across it and away from you, to the room
    const TVW = 0.62, TVH = 0.46, TVY = 0.45, SCRW = 0.4, SCRH = 0.3, SCR0 = [-0.27, 0.085];   // the set's front; its screen (its lower left corner on the front)
    const SCRC = (() => { const q = tvXZ(SCR0[0] + SCRW / 2, TVD + 0.03); return { x: q[0], y: TVY + SCR0[1] + SCRH / 2, z: q[1] }; })();   // the middle of the screen, in the room
    // times, in seconds from the click: the snow until the film; the film's fright (scare); what the thing does; and, with
    // nothing to break it, the set going off of itself (end)
    const TVT = { look: 0.55, film: 1.0, scare: 7.0, lurch: 7.08, punch: 7.6, hit: 7.78, out: 8.3, turn: 8.75, resume: 9.85, end: 8.3 };
    const TV_CUES = [['tvDrone', TVT.film + 0.05], ['tvCreak', TVT.film + 1.5], ['tvDrone', TVT.film + 2.4], ['tvCreak', TVT.film + 4.25], ['tvShriek', TVT.scare]];
    const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    SC.withYaw(L, TVB, () => {
      SC.box(L, -0.36, 0.36, 0, TVY, TVD, TVD + 0.42, [52, 40, 32]);              // the low cabinet it stands on
      SC.box(L, -TVW / 2, TVW / 2, TVY, TVY + TVH, TVD + 0.03, TVD + 0.38, [58, 46, 38]);   // the set
      SC.sprite(L, 0, 0, TVD - 0.002, 0.72, TVY, (ctx, P) => {                   // the cabinet's two doors, and their knobs
        for (const sd of [-1, 1]) { P_rect(ctx, sd > 0 ? 0.012 : -0.33, 0.04, 0.318, TVY - 0.09, P.col([40, 31, 25])); P_ell(ctx, sd * 0.05, 0.24, 0.014, 0.014, P.col([110, 100, 84])); }
      }, { face: TVB * DEG + Math.PI, sortDist: TVD - 0.04 });
    });
    const tvPan = () => clamp(Math.sin(wrapPi(TVB * DEG - G.cam.yaw)), -0.85, 0.85);
    const tvState = () => { const X = s.tv; return !X ? 'off' : X.smashAt !== undefined ? 'smashed' : X.offAt !== undefined ? 'done' : L.t - X.t0 < TVT.film ? 'snow' : 'film'; };
    // how bright its picture is now (0..1): its glow in the room, and on the thing bent over it
    const tvBright = () => {
      const X = s.tv, st = tvState(), rf = SAVE.data.settings.reducedFlash;
      if (st === 'snow') return rf ? 0.6 : 0.72 + 0.22 * hash(Math.floor(L.t * 20));
      if (st === 'film') {
        const t = L.t - X.t0, fl = rf ? 0.5 + 0.2 * Math.sin(L.t * 1.7) : hash(Math.floor(L.t * 14));
        return t >= TVT.scare ? (rf ? lerp(0.4, 0.85, smoothstep((t - TVT.scare) / 0.5)) : 0.85 + 0.15 * fl) : 0.3 + 0.14 * fl + 0.12 * smoothstep((t - TVT.film - 4) / 1.4);
      }
      if (st === 'smashed') { const q = L.t - X.smashAt; return q < 0.3 && !rf ? 0.8 * (1 - q / 0.3) * hash(Math.floor(L.t * 40)) : 0; }   // (its sparks)
      return 0;
    };
    // ---- its picture, drawn in the screen's own box: 0..1 across it and 0..1 up it ----
    const INK = [5, 8, 7], PALE = [186, 206, 178];   // the film is black and a sickly pale green
    const grey = (v, a) => rgba(mixc(INK, PALE, clamp(v, 0, 1)), a);
    let snow = null;
    const snowOf = () => {   // a few frames of snow, made once
      if (snow) return snow;
      const rnd = mulberry32(1212);
      snow = [0, 1, 2, 3, 4].map(() => {
        const cv = document.createElement('canvas'); cv.width = 44; cv.height = 33; const g = cv.getContext('2d'), im = g.createImageData(44, 33);
        for (let i = 0; i < 44 * 33; i++) { const col = mixc(INK, PALE, Math.pow(rnd(), 1.5)); im.data[i * 4] = col[0]; im.data[i * 4 + 1] = col[1]; im.data[i * 4 + 2] = col[2]; im.data[i * 4 + 3] = 255; }
        g.putImageData(im, 0, 0);
        return cv;
      });
      return snow;
    };
    // The film (f: seconds into it), in three shots. A long dark corridor, the view pushing slowly in, a door at the end
    // of it under a lamp: the door comes open a crack. Close on the door's edge: a pale hand curls round it out of the
    // dark, finger by finger. The corridor again, nearer, and creeping in: the hand is gone and the door swings wider on
    // the dark, and there are two eyes in it; then they are gone too, and nothing moves. Then the fright (scare).
    const corridor = (ctx, f, z, open, eyes, rm) => {
      const cx = 0.5 + (rm ? 0 : 0.012 * Math.sin(f * 0.9)), x0 = cx - z, x1 = cx + z, y0 = 0.5 - z * 1.2, y1 = 0.5 + z * 1.15;
      P_poly(ctx, [[0, 1], [1, 1], [x1, y1], [x0, y1]], grey(0.07)); P_poly(ctx, [[0, 0], [1, 0], [x1, y0], [x0, y0]], grey(0.2));
      P_poly(ctx, [[0, 0], [x0, y0], [x0, y1], [0, 1]], grey(0.12)); P_poly(ctx, [[1, 0], [x1, y0], [x1, y1], [1, 1]], grey(0.15));
      for (let i = 0; i < 3; i++) {   // the doorways along it, coming out past you as the view goes in
        const k = Math.pow(((i + 0.35) / 3 + f * 0.035) % 1, 1.8), ax = lerp(x0, 0, k), bx = lerp(x1, 1, k), ay = lerp(y0, 0, k), by = lerp(y1, 1, k);
        ctx.strokeStyle = grey(0.02); ctx.lineWidth = 0.008 + 0.03 * k; ctx.strokeRect(ax, ay, bx - ax, by - ay);
      }
      P_ell(ctx, cx, y0 - z * 0.12, z * 0.8, z * 0.1, grey(0.34));   // the lamp's pool of light on the floor before the door
      P_rect(ctx, x0, y0, 2 * z, y1 - y0, grey(0.3));                 // the end wall
      // the door's leaf, hinged on the left and swinging in: the dark shows down its right side
      const dw = z * 1.05, dh = (y1 - y0) * 0.88, dx = cx - dw / 2, ex = dx + dw * (1 - open);
      P_rect(ctx, dx - z * 0.06, y0, dw + z * 0.12, dh + z * 0.06, grey(0.13)); P_rect(ctx, dx, y0, dw, dh, grey(0)); P_rect(ctx, dx, y0, dw * (1 - open), dh, grey(0.66));
      P_ell(ctx, ex - z * 0.1, y0 + dh * 0.46, z * 0.04, z * 0.05, grey(0.18));
      if (eyes > 0) for (const sd of [-1, 1]) P_ell(ctx, ex + dw * open * 0.5 + sd * z * 0.11, y0 + dh * 0.78, z * 0.05, z * 0.065, grey(1, eyes));
    };
    const film = (ctx, f, rm) => {
      if (f < 2.6) corridor(ctx, f, 0.2 + 0.035 * f / 2.6, 0.2 * smoothstep((f - 1.5) / 0.9), 0, rm);
      else if (f < 4.2) {
        const q = f - 2.6, k = 1 + (rm ? 0 : 0.05 * q / 1.6), E = 0.56;   // (E: the edge of the door across the picture)
        ctx.save(); ctx.translate(E, 0.5); ctx.scale(k, k); ctx.translate(-E, -0.5);
        P_rect(ctx, -0.1, -0.1, 1.2, 1.2, grey(0)); P_rect(ctx, -0.1, -0.1, E + 0.1, 1.2, grey(0.6));
        P_rect(ctx, 0.08, 0.1, 0.3, 0.34, grey(0.52)); P_rect(ctx, 0.08, 0.54, 0.3, 0.4, grey(0.52)); P_rect(ctx, E - 0.025, -0.1, 0.025, 1.2, grey(0.8));   // its panels; its edge, catching the light
        for (let i = 0; i < 4; i++) {   // the hand: each finger comes round the edge and lies along the face of the door
          const g = smoothstep((q - 0.25 - i * 0.26) / 0.24), y = 0.68 - i * 0.115, l = (i === 0 || i === 3 ? 0.21 : 0.27) * g;
          if (g > 0) { P_limb(ctx, [[E + 0.07, y + 0.01], [E - 0.01, y + 0.012], [E - 0.01 - l, y - 0.02]], 0.075, grey(1)); P_ell(ctx, E - 0.012 - l, y - 0.02, 0.02, 0.026, grey(0.7)); }
        }
        ctx.restore();
      } else corridor(ctx, f, 0.3 + 0.14 * smoothstep((f - 4.2) / 1.3), 0.3 + 0.34 * smoothstep((f - 4.2) / 1.1), smoothstep((f - 4.7) / 0.3) * (1 - smoothstep((f - 5.35) / 0.1)), rm);
    };
    // The fright (q: seconds into it): a pale screaming face is suddenly all there is on the screen, shaking, the picture
    // flashing behind it. With flashes reduced it comes up out of the dark instead, and holds still.
    const scare = (ctx, q, rf, rm) => {
      const k = rf ? 1 : lerp(0.2, 1, easeOut(clamp(q / 0.09, 0, 1))), still = rf || rm;
      ctx.save(); if (rf) ctx.globalAlpha *= smoothstep(q / 0.5);
      P_rect(ctx, 0, 0, 1, 1, grey(rf || Math.floor(q * 14) % 2 ? 0 : 0.2));
      ctx.translate(0.5 + (still ? 0 : 0.03 * Math.sin(q * 91)), 0.5 + (still ? 0 : 0.03 * Math.sin(q * 67 + 1))); ctx.scale(k, k);
      P_ell(ctx, 0, 0.12, 0.47, 0.66, grey(0.1));    // its hair
      P_ell(ctx, 0, 0, 0.33, 0.52, grey(1));         // its face
      P_poly(ctx, [[-0.37, 0.56], [-0.31, 0.02], [-0.21, 0.4], [-0.08, 0.56]], grey(0.08)); P_poly(ctx, [[0.37, 0.56], [0.32, -0.04], [0.2, 0.38], [0.04, 0.56]], grey(0.08));
      for (const sd of [-1, 1]) { P_ell(ctx, sd * 0.135, 0.14, 0.09, 0.125, grey(0)); P_ell(ctx, sd * 0.128, 0.13, 0.017, 0.022, grey(1)); }   // the hollows of its eyes, a pin of light in each
      for (const sd of [-1, 1]) P_ell(ctx, sd * 0.025, -0.06, 0.012, 0.022, grey(0.25));
      const mo = still ? 1 : 0.82 + 0.18 * Math.abs(Math.sin(q * 30));   // its mouth, wide open
      P_ell(ctx, 0, -0.27, 0.125, 0.2 * mo, grey(0));
      for (let i = -2; i <= 2; i++) P_rect(ctx, i * 0.042 - 0.015, -0.27 + 0.2 * mo * Math.sqrt(1 - Math.pow(i * 0.042 / 0.125, 2)) - 0.05, 0.03, 0.05, grey(0.86));
      ctx.restore();
    };
    const HOLE = Array.from({ length: 13 }, (_, i) => { const a = i * TAU / 13, r = (i % 2 ? 0.15 : 0.27) + 0.09 * hash(i + 5); return [0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r * 1.2]; });   // the hole its fist left in the glass
    const picture = (ctx, P) => {
      const X = s.tv, st = tvState(), S = SAVE.data.settings, rf = S.reducedFlash, rm = S.reducedMotion;
      if (st === 'off' || st === 'done') {   // dark glass, the window faintly in it
        P_rect(ctx, 0, 0, 1, 1, P.col([20, 25, 28]));
        P_rect(ctx, 0.6, 0.48, 0.22, 0.34, rgba([96, 116, 156], 0.13)); P_rect(ctx, 0.705, 0.48, 0.012, 0.34, rgba([20, 25, 28], 0.6)); P_rect(ctx, 0.6, 0.64, 0.22, 0.016, rgba([20, 25, 28], 0.6));
        const q = st === 'done' ? L.t - X.offAt : 9;   // gone off: the picture drawn in to a line, a dot, and out
        if (q < 0.5) P_ell(ctx, 0.5, 0.5, lerp(0.5, 0.012, smoothstep(q / 0.2)), lerp(0.016, 0.012, smoothstep(q / 0.2)), grey(1, 1 - smoothstep((q - 0.2) / 0.3)));
      } else if (st === 'smashed') {
        P_rect(ctx, 0, 0, 1, 1, P.col([24, 28, 30]));
        HOLE.forEach(([x, y], i) => { if (i % 2 === 0) P_line(ctx, x, y, 0.5 + (x - 0.5) * 2.4, 0.5 + (y - 0.5) * 2.4, 0.007, 'rgba(196,210,204,0.34)'); });   // cracks, out to its edges
        P_poly(ctx, HOLE, 'rgb(2,2,3)');
        ctx.strokeStyle = 'rgba(196,210,204,0.5)'; ctx.lineWidth = 0.008; ctx.lineJoin = 'miter'; ctx.beginPath(); HOLE.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();   // the broken edge of the glass
      } else {
        const t = L.t - X.t0;
        if (st === 'snow') {
          P_rect(ctx, 0, 0, 1, 1, grey(0.45));
          ctx.save(); if (rf) ctx.globalAlpha *= 0.3; ctx.drawImage(snowOf()[Math.floor(L.t * (rf ? 3 : 22)) % 5], 0, 0, 1, 1); ctx.restore();
        } else if (t < TVT.scare) film(ctx, t - TVT.film, rm);
        else scare(ctx, t - TVT.scare, rf, rm);
        for (let i = 0; i < 12; i++) P_rect(ctx, 0, i / 12, 1, 0.03, 'rgba(0,0,0,0.24)');   // its lines
        P_rect(ctx, 0, 0.98 - (L.t * (rf ? 0.07 : 0.3)) % 1.3, 1, 0.12, 'rgba(255,255,255,0.05)');   // a band rolling down it
        P_rect(ctx, 0, 0, 1, 1, rgba([0, 0, 0], rf ? 0.06 : 0.03 + 0.15 * hash(Math.floor(L.t * 17))));   // and its flicker
      }
      if (st !== 'smashed') P_poly(ctx, [[0.06, 0.94], [0.36, 0.94], [0.17, 0.62], [0.04, 0.72]], 'rgba(226,234,238,0.055)');   // the shine on the glass
    };
    const rounded = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); };
    // the set's front: the screen in its dark surround, and beside it two dials over the slots of the speaker
    const drawSet = (ctx, P) => {
      P_rect(ctx, -TVW / 2, 0, TVW, TVH, P.col([64, 50, 40])); P_rect(ctx, -TVW / 2 + 0.014, 0.014, TVW - 0.028, TVH - 0.028, P.col([46, 38, 33]));
      P_rect(ctx, 0.165, 0.03, 0.125, TVH - 0.06, P.col([34, 30, 29]));
      for (const y of [0.34, 0.235]) { P_ell(ctx, 0.2275, y, 0.038, 0.038, P.col([128, 120, 106])); P_ell(ctx, 0.2275, y, 0.024, 0.024, P.col([64, 58, 54])); P_line(ctx, 0.2275, y, 0.2275 + (y > 0.3 ? 0.016 : -0.02), y + 0.02, 0.008, P.col([170, 160, 140])); }
      for (let i = 0; i < 5; i++) P_rect(ctx, 0.185, 0.05 + i * 0.026, 0.085, 0.011, P.col([14, 13, 13]));
      ctx.fillStyle = P.col([20, 19, 19]); rounded(ctx, SCR0[0] - 0.018, SCR0[1] - 0.018, SCRW + 0.036, SCRH + 0.036, 0.06); ctx.fill();
      ctx.save(); rounded(ctx, SCR0[0], SCR0[1], SCRW, SCRH, 0.05); ctx.clip();
      ctx.translate(SCR0[0], SCR0[1]); ctx.scale(SCRW, SCRH); picture(ctx, P);
      ctx.restore();
    };
    // its aerial, two rods in a V; the blow that kills the set bends one over
    const drawAerial = (ctx, P) => {
      const col = P.col([132, 130, 122]), bent = s.tv && s.tv.smashAt !== undefined ? smoothstep((L.t - s.tv.smashAt) / 0.12) : 0;
      P_ell(ctx, 0, 0.02, 0.045, 0.024, P.col([40, 36, 34]));
      P_limb(ctx, [[-0.012, 0.03], [-0.12, 0.23], [lerp(-0.225, -0.31, bent), lerp(0.43, 0.2, bent)]], 0.009, col); P_limb(ctx, [[0.012, 0.03], [0.2, 0.4]], 0.009, col);
    };
    // the glass bursting out of it, the sparks, and then a thread of smoke for a few seconds (about the middle of the screen)
    const drawBurst = ctx => {
      const q = L.t - s.tv.smashAt, rf = SAVE.data.settings.reducedFlash;
      ctx.translate(0, 0.7);
      if (q < 0.9) for (let i = 0; i < 16; i++) {
        const a = hash(i) * TAU, v = 0.5 + 1.3 * hash(i + 31), x = Math.cos(a) * v * q * 0.8 - 0.3 * q, y = Math.sin(a) * v * q * 0.55 + 0.6 * q - 2.6 * q * q, r = 0.016 + 0.024 * hash(i + 7), sp = q * (8 + 10 * hash(i + 3)) + i;
        P_poly(ctx, [[x + Math.cos(sp) * r, y + Math.sin(sp) * r], [x + Math.cos(sp + 2.3) * r * 0.7, y + Math.sin(sp + 2.3) * r * 0.7], [x + Math.cos(sp + 4) * r, y + Math.sin(sp + 4) * r]], rgba([200, 218, 212], 0.9 * (1 - q / 0.9)));
      }
      if (q < 0.45) for (let i = 0; i < 10; i++) { const a = hash(i + 60) * TAU, v = 1.0 + 1.6 * hash(i + 70); P_ell(ctx, Math.cos(a) * v * q, Math.sin(a) * v * q - 1.6 * q * q, 0.009, 0.009, rgba([255, 236, 170], 1 - q / 0.45)); }
      if (q < 0.1 && !rf) P_ell(ctx, 0, 0, 0.2 - q, 0.16 - q, rgba([255, 250, 230], 0.75 * (1 - q / 0.1)));
      const a = 0.4 * smoothstep((q - 0.25) / 0.6) * (1 - smoothstep((q - 3.5) / 2.8));
      if (a > 0) {
        ctx.strokeStyle = rgba([150, 150, 158], a); ctx.lineWidth = 0.016; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
        for (let y = 0, top = Math.min(0.6, (q - 0.25) * 0.24); y <= top; y += 0.03) { const x = Math.sin(y * 14 - L.t * 1.5) * 0.012 * (1 + y * 5) + y * 0.06; if (y) ctx.lineTo(x, 0.02 + y); else ctx.moveTo(x, 0.02 + y); }
        ctx.stroke();
      }
    };
    const tvFront = SC.withYaw(L, TVB, () => SC.mkSprite(L, 0, TVY, TVD + 0.028, TVW, TVH, drawSet, { face: TVB * DEG + Math.PI, sortDist: TVD - 0.06 }));
    const tvAerial = SC.withYaw(L, TVB, () => SC.mkSprite(L, 0.03, TVY + TVH, TVD + 0.2, 0.7, 0.5, drawAerial, { sortDist: TVD - 0.05 }));
    const tvBurst = { kind: 'sprite', x: SCRC.x * 0.96, y: SCRC.y - 0.7, z: SCRC.z * 0.96, w: 1.4, h: 1.4, draw: drawBurst, sortDist: 2.13, noLight: true };
    const tvP = tvXZ(0, TVD + 0.03);
    const tvT = mkTarget(L, {
      id: 'tv', name: 'Turn on the TV', x: tvP[0], y: TVY, z: tvP[1], w: TVW, h: TVH, accepts: ['remote'],
      hint() { return 'Turn on the TV'; },
      use(item) { if (item.id !== 'remote' || s.tv || s.mode === 'yank' || G.state !== 'play') return false; tvOn(); return true; },
    });
    // (scenery until the remote is carried; put on once; and not once it has begun to take you)
    Object.defineProperty(tvT, 'hidden', { get: () => !!s.tv || s.mode === 'yank' || !G.hasItem('remote') });
    const tvOn = () => {
      s.tv = { t0: L.t, cues: [] };
      foundEgg();   // the night's easter egg, found the moment the set comes on (kept in the save: game.js)
      AUDIO.sfx('tvOn', tvPan()); AUDIO.sfx('tvStatic', tvPan());
      tvStart(c0());
    };
    // the set itself: its film's sounds as they come (small and tinny, from where it stands); left to itself (the night won
    // while it played), it goes off when the film is over
    const tvRun = () => {
      const X = s.tv;
      if (!X || X.smashAt !== undefined || X.offAt !== undefined) return;
      const t = L.t - X.t0;
      TV_CUES.forEach(([name, at], i) => { if (t >= at && !X.cues[i]) { X.cues[i] = true; AUDIO.sfx(name, tvPan()); } });
      if (t >= TVT.end && s.mode !== 'tv') X.offAt = L.t;
    };
    // where the middle of the screen is seen in the plane the thing stands in, about its feet (the tall one's c.tv.at)
    const tvAt = c => {
      const p = c.pos(), r = Math.hypot(p.x, p.z) || 1, ux = p.x / r, uz = p.z / r, k = r / Math.max(0.5, SCRC.x * ux + SCRC.z * uz);
      return [((SCRC.x * k - p.x) * uz - (SCRC.z * k - p.z) * ux) / KT, (L.eyeH + (SCRC.y - L.eyeH) * k - p.y - (c.yOff || 0)) / KT];
    };
    // where it stands to watch, beside the set and a little nearer you; and the corner it goes round, from the closet's
    // side of the bed, to get there (the foot of the bed between)
    const WATCH = tvXZ(-0.56, TVD - 0.32), ROUND = [-1.2, 2.35];
    const tvStart = c => {
      const X = s.tv;
      X.u = c.u;
      X.c0 = { duck: c.duck || 0, eyeTo: c.duck ? c.eyeTo : 0.52, peer: c.peer || 0, flinch: c.flinch || 0, reach: c.reach || 0 };
      s.mode = 'tv'; s.grab = null; s.jerk = 0; s.duck = null; s.switched = true; s.thumps = null;
      stopWalking(c); hold(c, c.dist);
      c.tv = { at: tvAt(c), side: 1, look: 0, watch: 0, lurch: 0, punch: 0, turn: 0, nod: 0, lit: 0 };
    };
    // its way to the set, in the room: as it goes to the bed (route: out through the middle of its opening first), then
    // round the foot of the bed if it is on the closet's side of it
    const tvRoute = c => {
      const [wd, wl] = toFrame(c.lane, WATCH[0], WATCH[1]);
      const pts = route(c, { d: c.dist, lat: c.lat }, { d: wd, lat: wl }).pts.slice(0, -1).map(q => { const p = APPROACH.position(c.lane, q.d, q.lat, L.eyeH); return [p.x, p.z]; });
      const a = pts[pts.length - 1];
      if (a[0] < -0.85 && a[1] < 2.25) pts.push(ROUND);
      pts.push(WATCH);
      const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
      return { pts, segs, len: segs.reduce((x, y) => x + y, 0) };
    };
    const tvAlong = (rt, m) => {
      let x = clamp(m, 0, 1) * rt.len;
      for (let i = 0; i < rt.segs.length; i++) {
        const l = rt.segs[i];
        if (x <= l || i === rt.segs.length - 1) { const k = l > 1e-9 ? clamp(x / l, 0, 1) : 1, a = rt.pts[i], b = rt.pts[i + 1]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
        x -= l;
      }
      return rt.pts[rt.pts.length - 1];
    };
    const tving = c => {
      const X = s.tv, t = L.t - X.t0, C = X.c0, T = c.tv, rm = SAVE.data.settings.reducedMotion;
      // it lets go of whatever it was doing, and looks round
      c.flinch = C.flinch * (1 - smoothstep(t / 0.3)); c.reach = C.reach * (1 - smoothstep(t / 0.2)); c.faceAway = 0;
      c.peer = C.peer * (1 - smoothstep((t - TVT.look + 0.1) / 0.4));
      // then over to it, quickly, down on all fours (the further, the longer it takes, a little)
      if (t >= TVT.look && !X.route) { X.route = tvRoute(c); X.go = clamp(X.route.len / 3.2, 0.7, 1.5); X.arrive = TVT.look + X.go; }
      const m = X.route ? smoothstep((t - TVT.look) / X.go) : 0;
      // (thrown back at the fright it goes a step back from the set, and in again behind its fist)
      const lurchIn = smoothstep((t - TVT.lurch) / (rm ? 0.3 : 0.09)), lurchOut = smoothstep((t - TVT.punch) / 0.14), back = (rm ? 0.1 : 0.24) * lurchIn * (1 - lurchOut);
      if (X.route) {
        let p = tvAlong(X.route, m);
        if (back > 0) { const ax = WATCH[0] - SCRC.x, az = WATCH[1] - SCRC.z, al = Math.hypot(ax, az); p = [p[0] + ax / al * back, p[1] + az / al * back]; }
        // from the closet's way it is counted along the doorway's from here on (round the corner of the bed's foot)
        if (c.lane.idx !== 0 && ((p[1] > 1.2 && p[0] < -1.05) || m >= 1)) reframe(c, L.lanes[0]);
        const [d, lat] = toFrame(c.lane, p[0], p[1]), was = X.at || p;
        hold(c, d); c.runLat = lat;
        c.crawl = (c.crawl || 0) + Math.hypot(p[0] - was[0], p[1] - was[1]) * c.CR.CRAWL * 0.5; X.at = p;
      }
      const downK = smoothstep((t - TVT.look) / 0.22), upK = X.route ? smoothstep((t - X.arrive + 0.15) / 0.5) : 0;
      c.duck = lerp(lerp(C.duck, 1, downK), 0, upK); c.eyeTo = lerp(C.eyeTo, 0.52, downK);
      if (upK > 0 && !X.planted) { X.planted = true; c.walk = null; c.CR.pace(c, 0, c.hold, c.runLat); }   // (its feet together under it there)
      // bent over the set, watching; thrown back; its fist through the screen, and out; its head round to you
      const punchIn = easeIn(clamp((t - TVT.punch) / (TVT.hit - TVT.punch), 0, 1)), punchOut = smoothstep((t - TVT.out) / 0.42);
      T.at = tvAt(c); T.side = T.at[0] >= 0 ? 1 : -1;
      T.look = smoothstep(t / 0.3); T.watch = upK * (1 - lurchIn); T.lurch = lurchIn * (1 - lurchOut) * (rm ? 0.55 : 1); T.punch = punchIn * (1 - punchOut);
      T.turn = smoothstep((t - TVT.turn) / (TVT.resume - TVT.turn - 0.05));
      T.nod = (0.07 * Math.sin(L.t * 1.3) + 0.035 * Math.sin(L.t * 3.1)) * (rm ? 0.4 : 1);
      T.lit = tvBright() * clamp(1.6 - Math.hypot(c.pos().x - SCRC.x, c.pos().z - SCRC.z), 0, 1);
      if (t >= TVT.lurch && !X.yelped) { X.yelped = true; AUDIO.sfx('tvYelp', panOf(c)); }
      if (t >= TVT.hit && X.smashAt === undefined) { X.smashAt = L.t; AUDIO.sfx('tvSmash', tvPan()); if (!rm) G.shake(0.45); }
      if (t >= TVT.resume) tvEnd(c);
    };
    // and it comes on again from where it stands, the night's clock where it was when the set came on
    const tvEnd = c => {
      const X = s.tv;
      X.over = true; c.u = X.u;
      if (c.tv.turn > 0.99) c.tv.look = 0;   // (its head is round to you)
      if (shown() || L.won) startDuck(c);   // the lamp is on: an arm across its face and down, as the light always has it
      else { s.latBias = 0; s.latBias = c.runLat - latAt(c, c.dist); come(c); }
    };
    // (afterwards its head comes back upright as it goes; broken off, by the night being won, it lets all of it go)
    const tvAfter = (c, dt) => {
      const T = c.tv;
      if (!T) return;
      T.at = tvAt(c); T.lit = 0;
      for (const k of ['look', 'watch', 'lurch', 'punch']) T[k] = Math.max(0, T[k] - dt / 0.35);
      T.turn = Math.max(0, T.turn - dt / (s.mode === 'duck' ? 0.8 : 1.6));
      if (!(T.look + T.watch + T.lurch + T.punch + T.turn > 0)) c.tv = null;
    };
    // caught after the television was put on, by whichever of its ways: the television's own line, and no toast before it
    const cause = k => { if (!s.tv) return k; G.lastToast = { msg: '', t: -10 }; return 'tv'; };
    L.deathCause = () => (s.tv ? cause('default') : null);
    L.onCatch = () => s.mode === 'tv';   // (it cannot catch you while it is at the set)
    const behave = (c, dt) => {
      if (s.mode === 'yank') { yanking(c); return; }
      ready(c);   // it only peers, at first
      if (s.mode === 'tv') { if (L.won) tvEnd(c); else { tving(c); return; } }   // at the television (the night won meanwhile, it breaks off)
      tvAfter(c, dt);
      const lit = shown() || L.won;
      if (lit && s.mode !== 'duck') startDuck(c);
      else if (!lit && s.mode === 'duck') { s.mode = 'rise'; s.riseAt = L.t; s.rise0 = c.duck || 0; }
      if (s.mode === 'peer' && L.t >= s.peerTill) come(c);
      if (s.mode === 'come') maySwitch(c);
      if (s.mode === 'peer' || s.mode === 'come') { s.latBias *= Math.exp(-dt * 0.5); place(c); }
      else if (s.mode === 'duck') ducking(c);
      else if (s.mode === 'rise') rising(c, dt);
    };
    // peering, only its head shows round the edge: having that in view is seeing it
    L.visFrac = c => {
      if (s.mode === 'yank' || c.dist <= way(c).apZ || (c.peer || 0) < 0.5) return APPROACH.visFrac(L, c.lane, c, null);
      const q = APPROACH.position(c.lane, c.dist, c.lat + (c.peerSide || 1) * c.peer * 0.44 * 0.77, L.eyeH), r = R.projectRect(q.x, 1.6, q.z, 0.3, 0.45, null);
      if (!r) return 0;
      const ox = Math.max(0, Math.min(r.x + r.w, R.W) - Math.max(r.x, 0)), oy = Math.max(0, Math.min(r.y + r.h, R.H) - Math.max(r.y, 0));
      return ox * oy / Math.max(1e-6, r.w * r.h);
    };
    L.update = dt => {
      const c = c0();
      holdCovers();
      c.unseenMult = Math.min(c.unseenMult, 2.5); // this night already charges a lot for looking away; the tiers do not stack on top
      if (s.lampOn && !L.won) { s.lampT -= dt; if (s.lampT <= 0) { s.lampOn = false; AUDIO.sfx('flicker'); G.say('The lamp goes out. It is coming up again.', 'Dark.'); } }
      c.inLight = s.lampOn;
      behave(c, dt);
      thumping();
      tvRun();
      if (L.won) { s.tick -= dt; if (s.tick <= 0) { s.tick = 1.0; AUDIO.sfx('tick', Math.sin(wrapPi(-Math.PI / 4 - G.cam.yaw)) * 0.7, true); } } // the clock is on the dresser to the north-west, whichever way you face
    };
    // a cord on the floor: a pale cloth flex, so it shows on the dark boards; it goes under the bed, behind the mattress
    const CORD = [104, 98, 90];
    const flex = (pts, y) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], l = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / l * 0.009, nz = (bx - ax) / l * 0.009; R.add(SC.mkQuad(L, [ax - nx, y, az - nz], [bx - nx, y, bz - nz], [bx + nx, y, bz + nz], [ax + nx, y, az + nz], CORD, { sortDist: BED })); } };
    // the covers: kicked down to the foot of the bed, and drawn up over you as you pull, the sheet turned down along the top
    const COV = 1.62, X = 0.77, BLANKET = [80, 84, 108], SHEET = [132, 128, 134], CREASE = [70, 74, 97], MATTRESS_TOP = [66, 62, 70];
    // (pulled up in the dark, they are ripped back down off you to the foot of the bed)
    // (and its pulls at them jerk them back toward it)
    const coversAt = () => { const p = s.yank ? 1 - (s.yankK || 0) : s.coversUp ? 1 : (covers.progress || 0); return { p, zE: lerp(1.22, 0.1, p) + (L.won ? 0 : (s.jerk || 0) * 0.05), yE: lerp(0.64, 0.84, p), roll: lerp(0.06, 0.025, p) }; };
    L.dynamic = () => {
      ready(c0());   // (on the night's card too)
      if (unplugged) {
        if (!s.plugged) {
          R.glowAs(socket);   // the cord and the plug on the floor: pointed at, they glow
          flex([[-0.7, -0.38], [-1.0, -0.42], [-1.35, -0.54], [-1.72, -0.66]], 0.012);
          // the plug, on its side: a pale block, its two brass pins toward the socket
          const [px, pz] = PLUG, q = (a, b, c, d, col, sd) => R.add(SC.mkQuad(L, a, b, c, d, col, { sortDist: sd }));
          q([px - 0.035, 0.045, pz + 0.045], [px + 0.035, 0.045, pz + 0.045], [px + 0.035, 0.045, pz - 0.045], [px - 0.035, 0.045, pz - 0.045], [150, 144, 134], 1.692);
          q([px + 0.035, 0.012, pz + 0.045], [px + 0.035, 0.012, pz - 0.045], [px + 0.035, 0.045, pz - 0.045], [px + 0.035, 0.045, pz + 0.045], [112, 106, 98], 1.694);
          q([px - 0.035, 0.012, pz + 0.045], [px + 0.035, 0.012, pz + 0.045], [px + 0.035, 0.045, pz + 0.045], [px - 0.035, 0.045, pz + 0.045], [124, 118, 108], 1.694);
          for (const dx of [-0.016, 0.016]) q([px + dx - 0.006, 0.03, pz - 0.045], [px + dx + 0.006, 0.03, pz - 0.045], [px + dx + 0.006, 0.03, pz - 0.085], [px + dx - 0.006, 0.03, pz - 0.085], [176, 150, 84], 1.698);
          R.glowAs(null);
        } else {
          // plugged in: the plug in the socket, the flex down the wall and away under the bed
          R.add(SC.mkWallV(L, -1.535, -1.088, -1.465, -1.088, 0.245, 0.325, [150, 144, 134], { sortDist: 1.858 }));
          R.add(SC.mkWallV(L, -1.509, -1.086, -1.491, -1.086, 0.012, 0.25, CORD, { sortDist: 1.857 }));
          flex([[-1.5, -1.08], [-1.42, -0.95], [-1.25, -0.72], [-1.0, -0.5], [-0.7, -0.4]], 0.012);
        }
      }
      // the drawer. Shut, its front is flush in the nightstand's, a dark gap round it. Open, it is a box slid out on its
      // runners: the dark of the nightstand behind it, its bottom, its far side; then what lies in it (drawn where it is);
      // then its near side and its front, over them. (You look down into it from the bed, from its front's side.)
      const out = rideDrawer(), z1 = DR.zf + out, W = DR.wall, WOOD = [66, 50, 38], RIM = [84, 64, 50];
      const dw = (x0, z0, x1, z1, y0, y1, col, sd) => R.add(SC.mkWallV(L, x0, z0, x1, z1, y0, y1, col, { sortDist: sd }));
      const lid = (x0, x1, za, zb, y, col, sd) => R.add(SC.mkQuad(L, [x0, y, za], [x1, y, za], [x1, y, zb], [x0, y, zb], col, { sortDist: sd }));
      R.glowAs(drawer);
      dw(DR.x0 - 0.012, DR.zf + 0.002, DR.x1 + 0.012, DR.zf + 0.002, DR.y0 - 0.012, DR.y1 + 0.008, [9, 8, 8], 1.69);   // the gap round it; the hole it came out of
      if (out > 0.004) {
        lid(DR.x0 + W, DR.x1 - W, DR.zf, z1, DR.floor, [38, 29, 23], 1.686);                       // its bottom
        dw(DR.x1 - W, DR.zf, DR.x1 - W, z1, DR.floor, DR.y1, [50, 38, 30], 1.684);                    // its far side, from inside
        lid(DR.x1 - W, DR.x1, DR.zf, z1, DR.y1, RIM, 1.682);                                           // and its top edge
        dw(DR.x0, DR.zf, DR.x0, z1, DR.y0, DR.y1, scalec(WOOD, 0.8), 1.1);                            // its near side, from outside
        lid(DR.x0, DR.x0 + W, DR.zf, z1, DR.y1, RIM, 1.09);
        lid(DR.x0, DR.x1, z1 - W, z1, DR.y1, RIM, 1.07);                                               // the top edge of its front
      }
      dw(DR.x0, z1 + 0.004, DR.x1, z1 + 0.004, DR.y0, DR.y1, WOOD, 1.08);                              // its front
      const kp = L.pt((DR.x0 + DR.x1) / 2, 0, z1 + 0.014); knob.x = kp[0]; knob.z = kp[2];
      R.add(knob);
      R.glowAs(covers);
      // the covers: bunched at the foot they are as thick all the way across; drawn up, they rise over you and lie flat on the
      // mattress at the sides
      const { p, zE, yE, roll } = coversAt(), zF = zE + 0.14, B = 0.585, XS = [-X, -0.6, -0.25, 0.25, 0.6, X];
      const q = (a, b, c, d, col, sd) => R.add(SC.mkQuad(L, a, b, c, d, col, { sortDist: sd }));
      const tent = x => lerp(1, 1 - clamp((Math.abs(x) - 0.25) / 0.35, 0, 1), p), up = (x, y) => B + (y - B) * tent(x), th = x => roll * tent(x);
      const strip = (z0, f0, z1, f1, col, sd) => { for (let i = 0; i + 1 < XS.length; i++) { const a = XS[i], b = XS[i + 1]; q([a, f0(a), z0], [b, f0(b), z0], [b, f1(b), z1], [a, f1(a), z1], col, sd); } };
      const yAt = z => B + (yE - B) * clamp((1.9 - z) / (1.9 - zF), 0, 1), H = (x, z) => up(x, yAt(z)) + 0.004;
      strip(1.9, () => B, zF, x => up(x, yE), BLANKET, COV);                                                                  // the blanket
      const zb = zF + 0.12;
      if (zb < 1.6) for (const [xa, xb] of [[-0.34, -0.26], [0.24, 0.32]]) {                                               // two soft creases in it, narrowing toward you
        const zm = lerp(1.86, zb, 0.6), xm = lerp(xa, xb, 0.6);
        q([xa - 0.016, H(xa, 1.86), 1.86], [xa + 0.016, H(xa, 1.86), 1.86], [xm + 0.006, H(xm, zm), zm], [xm - 0.006, H(xm, zm), zm], CREASE, COV - 0.001);
        q([xm - 0.006, H(xm, zm), zm], [xm + 0.006, H(xm, zm), zm], [xb, H(xb, zb), zb], [xb, H(xb, zb), zb], CREASE, COV - 0.001);
      }
      strip(zF, x => up(x, yE) + th(x) * 0.75, zE, x => up(x, yE) + th(x), SHEET, COV - 0.002);                         // the sheet, turned down over its top
      const yB = lerp(B, yE - 0.03, p);   // its edge: the bunched blanket's own fold at the foot, the sheet's hem when it is up
      strip(zE, x => up(x, yE) + th(x), zE - 0.03, x => up(x, yB), mixc(scalec(BLANKET, 0.82), scalec(SHEET, 0.74), p), COV - 0.003);
      R.glowAs(null);
      R.add(lampDetail);
      // the television: its front (and its picture), its aerial; the glass bursting out of it, and its smoke
      R.glowAs(tvT); R.add(tvFront); R.add(tvAerial); R.glowAs(null);
      if (s.tv && s.tv.smashAt !== undefined && L.t - s.tv.smashAt < 6.5) R.add(tvBurst);
      // How low it must be to be out of sight behind the bed, where it is: the height of your line of sight there over the
      // bed's top where it leaves the bed (or over the covers' turned-down edge, if it is beyond that). That is only where
      // it goes down to: what is drawn of it is hidden by the bed itself, drawn over it (below).
      const c = c0(), cp = c.pos(), lp = rotY(cp.x, cp.z, -L.facing), lx = lp[0], lz = lp[1];
      const tb = Math.min(1, lx > 0 ? 0.75 / lx : lx < 0 ? -0.75 / lx : Infinity, lz > 0 ? 1.9 / lz : lz < 0 ? -1.0 / lz : Infinity);
      let hide = tb >= 1 ? Math.max(0.6, lz >= zF ? H(lx, lz) : lz >= zE ? up(lx, yE) + th(lx) : 0.6) : L.eyeH - (L.eyeH - 0.6) / tb;
      if (lz > zE && Math.abs(lx * zE / lz) < X) hide = Math.max(hide, L.eyeH - (L.eyeH - (up(lx * zE / lz, yE) + th(lx * zE / lz))) * lz / zE);
      c.hideBelow = hide;
      const topAt = (x, z) => (Math.abs(x) > X || z < -1.0 || z > 1.92 ? -9 : z >= zF ? H(x, z) : z >= zE - 0.03 ? up(x, yE) + th(x) : B);
      // the wall either side of the opening, and over it, while it is still behind it; and coming through, it stoops
      // under the top of it
      const w = way(c), e = edgeAt(w, c.dist), behind = c.dist > w.apZ + 0.01;
      c.showX = behind ? [-e - c.lat, e - c.lat] : null;
      c.showTop = behind ? L.eyeH + (w.top - L.eyeH) * c.dist / w.apZ - cp.y - (c.yOff || 0) : undefined;
      c.headroom = L.won || G.state === 'dying' ? undefined : headroom(c) - cp.y - (c.yOff || 0);   // (going down, it is still under it: no pop up)
      // Where it is drawn in the order of things. In the closet it stands in front of the clothes and the hangers (between
      // them and the opening), so it is drawn over them, however far to the side of them it stands. Anywhere else, the bed
      // is between you and it (it is never on the bed, only over it at the last), so it is drawn before every part of the
      // bed (the foot's far corners are 2.04 m off), and the bed and the covers hide whatever of it they are in front of. Right
      // in front of you at the last, it is the nearest thing there is.
      const cr = L.rend && L.rend.get(c), off = Math.hypot(c.dist, c.lat || 0);
      if (cr) cr.sortDist = c.close ? undefined : c.lane.idx === 1 && c.dist > w.apZ - 0.2 ? Math.min(off, w.peerD + 0.05) : Math.max(off, BEYOND);
      // (down on its haunches it is drawn from the floor to not much over its head, so that looking down at it, it is
      // where it is, its eyes just over the edge of the bed, and not stretched up from its feet as a standing figure would be)
      if (cr) cr.h = c.lunge ? c.CR.h : lerp(c.CR.h, 1.0, c.duck || 0);
      // its hands coming at you in its lunge: its arms on their own, over the bed (the rest of it behind the bed)
      c.armsApart = !!cr && G.state === 'dying' && !c.close;
      if (c.armsApart) R.add({ kind: 'sprite', x: cp.x, y: cp.y + (c.yOff || 0), z: cp.z, w: cr.w, h: cr.h, fogScale: 0.85, sortDist: 0.2, draw: (ctx, P) => { c.part = 'arms'; c.CR.draw(ctx, c, P); c.part = null; } });
      // peering, its fingers are round the edge of the frame by its face (drawn over the frame, which the thing is behind):
      // at the height of its hand, seen through the opening's plane. As it steps out they slide back off the edge
      if ((c.peer || 0) > 0.05 && c.dist > w.apZ) {
        const hy = L.eyeH + (1.7 - L.eyeH) * w.apZ / c.dist, q = APPROACH.position(c.lane, w.apZ - 0.03, side * (w.edge + 0.02), L.eyeH), k = smoothstep((c.peer - 0.1) / 0.6);
        R.add(SC.mkSprite(L, q.x, hy - 0.07, q.z, 0.12, 0.14, (ctx, P) => drawFrameFingers(ctx, P, side, k), { sortDist: w.apZ - 0.08 }));
      }
      // its hands up over the edge of the bed, on the covers (over them): the backs of the long hands, the fingers down
      // on the cloth. Reaching, each comes up from behind the edge (drawn behind the bed, which hides what is below its
      // edge) and in one snatch over it onto the cloth, and closes on it; letting go, back the same way. Pulling, each
      // comes on up the bed (s.grab), its long arm over the cloth behind it back to the edge of the bed. As it lunges,
      // they are gone: its hands are at you
      const r = c.lunge ? 0 : (c.reach || 0);
      if (r > 0.01) w.hands.forEach(([x0, z0], i) => {
        const h = s.grab ? s.grab.hands[i] : { k: 0, drag: 0, open: 0, lift: 0, bunch: 0.3 }, [x1, z1] = w.to[i];
        const dl = Math.hypot(x0 - x1, z0 - z1), gx = lerp(x0, x1, h.k) + (x0 - x1) / dl * GRAB.drag * h.drag, gz = lerp(z0, z1, h.k) + (z0 - z1) / dl * GRAB.drag * h.drag;
        const sx = w === WAYS[0] ? (x0 < 0 ? -1 : 1) : (i ? 1 : -1);
        const [ex, ez] = w.over[0] === 'z' ? [x0 * 1.1, w.over[1]] : [w.over[1], z0];
        const [ox, oz] = w.over[0] === 'z' ? [ex, ez + 0.06] : [ex - 0.06, ez], edgeY = Math.max(B, topAt(ex - (ox - ex) * 0.6, ez - (oz - ez) * 0.6));
        // up from behind the edge (r to 0.45), then over it and down onto the cloth
        const upK = smoothstep(r / 0.45), onK = smoothstep((r - 0.45) / 0.55);
        const x = lerp(ox, gx, onK), z = lerp(oz, gz, onK);
        const y = lerp(edgeY - 0.24 + upK * 0.3, Math.max(B, topAt(gx, gz)) + 0.004, onK) + Math.sin(Math.PI * onK) * 0.05;
        const hh = onK < 1 ? { k: h.k, drag: h.drag, lift: Math.max(h.lift, 1 - onK), open: Math.max(h.open, smoothstep((1 - onK) / 0.4)), bunch: h.bunch * onK } : h;
        const cloth = gz >= zE - 0.03 ? BLANKET : MATTRESS_TOP;
        const far = Math.hypot(gx - ex, gz - ez);
        if (onK >= 1 && far > 0.08) {   // the arm, from the edge of the bed to the wrist, lying over the cloth (raised as the hand reaches)
          const ux = (gx - ex) / far, uz = (gz - ez) / far, nx = -uz * 0.032, nz = ux * 0.032, wx = gx - ux * 0.07, wz = gz - uz * 0.07;
          const ey = Math.max(B, topAt(ex - ux * 0.02, ez - uz * 0.02)) + 0.02, wy = y + 0.03 + h.lift * 0.05;
          R.add(SC.mkQuad(L, [ex - nx * 1.2, ey, ez - nz * 1.2], [ex + nx * 1.2, ey, ez + nz * 1.2], [wx + nx, wy, wz + nz], [wx - nx, wy, wz - nz], HAND, { sortDist: COV - 0.09, noLight: true }));
        }
        R.add(SC.mkSprite(L, x, y - 0.09 + hh.lift * 0.05, z, 0.24, 0.24, (ctx, P) => { ctx.scale(1.3, 1.3); drawGrip(ctx, P, sx, hh, cloth); }, { sortDist: onK > 0.02 ? COV - 0.1 : BEYOND - 0.03 }));   // (coming up: after it, and before the bed)
      });
    };
    const HAND = [10, 9, 12], BEYOND = 2.12;
    // four long fingers curled round the edge of the frame, pointing back toward where it stands; k: 1 round it, sliding
    // back off it (toward the opening) as k goes, round the edge and out of sight
    const drawFrameFingers = (ctx, P, sd, k) => {
      const col = P.col(HAND, 0.05), off = -sd * (1 - k) * 0.09;
      ctx.save(); ctx.beginPath(); ctx.rect(sd > 0 ? -0.02 : -1, -1, 1.02, 2); ctx.clip();   // (only on the face of the frame)
      for (let i = 0; i < 4; i++) {
        const y = 0.035 + i * 0.026, l = i === 0 || i === 3 ? 0.045 : 0.058;
        P_limb(ctx, [[-sd * 0.03 + off, y + 0.004], [sd * 0.005 + off, y + 0.006], [sd * (0.005 + l) + off, y - 0.006]], 0.013, col);
      }
      ctx.restore();
    };
    // one hand on the covers, in metres from the cloth under it (0.07 up), the fingers toward you: h.open spreads them (as
    // it reaches) or closes them into a fist on the cloth, h.lift raises it off the cloth, h.bunch is the cloth gathered up
    // in its grip, creased in toward its fist. It is as dark as the rest of it, in any light
    const drawGrip = (ctx, P, sd, h, cloth) => {
      const col = P.col(HAND, 0.05), open = h.open, bunch = h.bunch * (1 - h.lift), hy = 0.1 + h.lift * 0.05;
      if (bunch > 0.02) {   // the cloth drawn tight in toward its fist, in soft creases, and heaped up under its knuckles
        const crease = P.cola(scalec(cloth, 0.6), 0.45 * bunch), ridge = P.cola(scalec(cloth, 1.12), 0.9 * bunch), fold = P.cola(scalec(cloth, 0.7), 0.7 * bunch);
        for (const dx of [-0.1, -0.045, 0.01, 0.06, 0.11]) P_line(ctx, dx * 1.15, 0.07 - 0.055 * bunch, dx * 0.35, 0.068, 0.012, crease);
        P_ell(ctx, 0, 0.074, 0.055 + 0.02 * bunch, 0.004 + 0.012 * bunch, fold);
        P_ell(ctx, 0, 0.078, 0.05 + 0.02 * bunch, 0.003 + 0.009 * bunch, ridge);
      }
      P_line(ctx, sd * 0.006, hy + 0.06, 0, hy + 0.01, 0.05, col);   // the wrist
      P_ell(ctx, 0, hy, 0.05, 0.032, col);                            // the back of the hand
      for (let i = 0; i < 4; i++) {
        const x0 = (i - 1.5) * 0.022, l = (i === 0 || i === 3 ? 0.07 : 0.088) * (1 + 0.15 * open);
        // spread: long and straight, splayed; closed: bent down at the knuckle and the tips curled back under, into the cloth
        const mid = [lerp(x0 * 1.1, x0 * 1.3, open), hy - 0.01 - l * lerp(0.42, 0.5, open)], tip = [lerp(x0 * 1.0 + sd * 0.004, x0 * 1.7, open), hy - 0.01 - l * lerp(0.3, 1.0, open)];
        P_limb(ctx, [[x0, hy - 0.01], mid, tip], 0.013, col);
        if (open < 0.5) P_ell(ctx, mid[0], mid[1], 0.009, 0.007, col);   // the bent knuckle
      }
      P_limb(ctx, [[-sd * 0.045, hy], [-sd * lerp(0.045, 0.08, open), hy - 0.03], [-sd * lerp(0.03, 0.085, open), hy - lerp(0.05, 0.07, open)]], 0.013, col);   // the thumb
    };
    // (the television's picture lights what is near it a little, and flickers: its own light, not the lamp's)
    const TVL = tvXZ(SCR0[0] + SCRW / 2, TVD - 0.4);
    L.dynamicLights = () => {
      const out = [], b = tvBright();
      if (shown()) { const p = L.pt(LX, 1.05, LZ); out.push({ x: p[0], y: p[1], z: p[2], r: 4.5, i: 1.0, color: [255, 210, 150], flicker: s.lampT < 2 ? 0.8 : 0.08, seed: 12 }); }
      if (b > 0.01) out.push({ x: TVL[0], y: SCRC.y + 0.05, z: TVL[1], r: 2.4, i: 0.6 * b, color: [156, 196, 172] });
      return out;
    };
    L.glows = () => {
      const out = [], b = tvBright();
      if (shown()) { const p = L.pt(LX, 1.0, LZ); out.push({ x: p[0], y: p[1], z: p[2], r: 1.3, color: [255, 210, 150], a: 0.28 }); }
      if (b > 0.01) out.push({ x: SCRC.x, y: SCRC.y, z: SCRC.z, r: 0.5, color: [170, 206, 184], a: 0.2 * b });
      return out.length ? out : null;
    };
    // ---- the win: the covers come up over your eyes, and it plays out under them ----
    // You look up from the covers at it once more, then they come up over your head: the hem rises across the view (the
    // middle first, where your hands are) and you are under the fabric, in the dark, the lamp a faint warm glow through
    // the weave on its side of you, the folds moving a little as you breathe. Under there: its slow steps come to the bed,
    // and the shadows of its two hands come up over the glow, from its side, and take hold of the covers as they did on the
    // bed: each reaches on up the cloth with its fingers spread, closes on it and pulls (the fabric jerks toward it, the
    // bed shakes); one, the other, then both together. They hold. Its hands open, let go and sink back out of sight, and its
    // steps go away. The clock ticks on. Then the fade.
    // When each hand comes up (IN), its pulls (each the moment it drags the cloth), and when they let go (LET)
    const U = { rise: 1.3, under: 2.1, IN: [3.0, 3.8], PULLS: [[3.5, 5.3], [4.3, 5.3]], LET: 6.3, away: 7.2, end: 8.8 };
    const TUGS = [...new Set(U.PULLS.flat())].sort((a, b) => a - b);
    // one hand at t: how far up into view (in), its fingers closed on the cloth (grip: 0 spread, 1 a fist), how far it has
    // reached on up the cloth (up), and how hard it is pulling now (pull)
    const coverHand = (i, t) => {
      let grip = 0, up = 0, pull = 0;
      U.PULLS[i].forEach((P, n) => {
        if (t < P - 0.45) return;
        const reach = smoothstep((t - P + 0.45) / 0.3), close = smoothstep((t - P + 0.15) / 0.15), drag = smoothstep((t - P) / 0.3);
        grip = n ? Math.max(close, 1 - smoothstep((t - P + 0.45) / 0.12)) : close;   // (each reach after the first opens the fist)
        up = reach * (1 - drag); pull = t >= P ? 1 - smoothstep((t - P) / 0.45) : 0;
      });
      const let_ = smoothstep((t - U.LET) / 0.2);
      return { in: smoothstep((t - U.IN[i]) / 0.3) * (1 - smoothstep((t - U.LET - 0.2) / 0.7)), grip: grip * (1 - let_), up: up + let_ * 0.3, pull };
    };
    L.aftermath = (t, dt) => {
      const c = c0();
      if (!s.after) {   // look up from the covers at it
        // at it where it really is (its eyes over the edge of the bed, if it is down there)
        s.after = true; const p = c.pos(), yaw = Math.atan2(p.x, p.z), hd = Math.max(0.3, Math.hypot(p.x, p.z));
        G.cam.tYaw = G.cam.yaw + wrapPi(yaw - G.cam.yaw); G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8;
        G.cam.tPitch = clamp(Math.atan2(L.eyeH - (c.duck ? c.eyeTo : 1.6), hd), 0, PITCH_DOWN);
      }
      s.over = smoothstep((t - U.rise) / (U.under - U.rise));
      if (t >= U.rise && !s.rustled) { s.rustled = true; AUDIO.sfx('hiss'); }
      // under the covers it comes to the bed, a few slow, heavy steps, however far off it was; at the last it goes away
      if (t >= U.under && !s.came) { s.came = true; const b = c.lane.barrierDist || 1.6; c.hold = null; c.distFn = (cr, dt2) => Math.max(b, cr.dist - dt2 * 1.6); }
      if (t >= U.away && !s.gone) { s.gone = true; c.hold = null; c.distFn = (cr, dt2) => cr.dist + dt2 * 0.7; }
      s.coverHands = [0, 1].map(i => coverHand(i, t));
      const n = TUGS.filter(P => t >= P).length;   // the pulls, one after another
      if (n > (s.tugs || 0)) { s.tugs = n; s.tugAt = t; AUDIO.sfx('tug', clamp(Math.sin(wrapPi(c.yaw - G.cam.yaw)), -0.85, 0.85)); G.shake(0.55); }
      return t >= U.end;
    };
    // what you see of all that: the covers over your eyes, drawn over the view (under the vignette, grain and fade)
    let weave = null;
    const weaveOf = ctx => {   // a tile of the cloth's plain weave, multiplied over the picture: it shows where light comes through
      if (weave) return weave;
      const cv = document.createElement('canvas'); cv.width = cv.height = 4; const w = cv.getContext('2d');
      w.fillStyle = 'rgb(255,250,242)'; w.fillRect(0, 0, 4, 4);                                     // the gaps, where the light is
      w.fillStyle = 'rgb(176,166,158)'; w.fillRect(0, 0, 4, 1); w.fillRect(0, 2, 4, 1);           // the threads across
      w.fillStyle = 'rgb(146,136,130)'; w.fillRect(0, 0, 1, 2); w.fillRect(2, 2, 1, 2);           // and the ones up and down, over and under them
      weave = ctx.createPattern(cv, 'repeat');
      return weave;
    };
    // the folds of the cloth hanging over your face: long, soft, up and down it, drawn in a little toward your hands at
    // your chin (x0, y0 at the top, through cx, cy, to x1, y1 at the bottom, and how wide)
    const FOLDS = [[0.07, -0.1, 0.11, 0.5, 0.19, 1.12, 0.17], [0.27, -0.1, 0.29, 0.52, 0.36, 1.12, 0.2], [0.47, -0.1, 0.45, 0.55, 0.48, 1.12, 0.14], [0.66, -0.1, 0.65, 0.5, 0.6, 1.12, 0.21], [0.88, -0.1, 0.85, 0.48, 0.79, 1.12, 0.18]];
    const soft = (ctx, draw, wd, rgb, a) => { for (const [k, f] of [[2.0, 0.16], [1.65, 0.18], [1.3, 0.22], [0.95, 0.28], [0.6, 0.36]]) { ctx.lineWidth = wd * k; ctx.strokeStyle = rgba(rgb, a * f); draw(); } };   // a stroke with a soft edge
    // the shadow of one of its hands on the glow through the cloth, soft at the edge: the long arm in from below, the
    // palm, the four long fingers spread or closed on the cloth, the thumb (mirrored for the other hand); and the cloth
    // drawn in toward its grip in soft creases, deeper as it pulls
    let shadowCv = null;
    const shadowCanvas = ctx => {   // a canvas the size of the view's, to draw one layer of a hand's shadow on
      if (!shadowCv) shadowCv = document.createElement('canvas');
      if (shadowCv.width !== ctx.canvas.width || shadowCv.height !== ctx.canvas.height) { shadowCv.width = ctx.canvas.width; shadowCv.height = ctx.canvas.height; }
      return shadowCv;
    };
    const shadowHand = (ctx, x, y, ang, S, sd, h) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(S * sd, -S);   // (upside down: the arm below, the fingers up)
      const spread = 0.5 - h.grip * 0.22, curl = h.grip * 0.24;
      const parts = [[0, -3.2, 0, -0.1, 0.24], [0, -0.06, 0, 0.06, 0.3]];   // the arm in from the edge, the palm
      [0.6, 0.76, 0.72, 0.56].forEach((l, f) => { const a2 = (f - 1.5) * spread / 1.5; parts.push([Math.sin(a2) * 0.15, 0.1, Math.sin(a2) * (0.15 + l * 0.9), 0.1 + Math.cos(a2) * l * (1 - curl), 0.07]); });
      parts.push([0.17, -0.14, 0.44 - h.grip * 0.12, 0.12, 0.075]);   // the thumb
      // each soft layer of the shadow drawn whole, solid, off to the side, and laid over the view at its strength, so the
      // arm, the palm and the fingers are one shadow (strokes laid one over another would darken where they overlap)
      const sh = shadowCanvas(ctx), sg = sh.getContext('2d'), M = ctx.getTransform();
      ctx.globalCompositeOperation = 'multiply';
      for (const [wd, a2] of [[0.26, 0.16], [0.14, 0.24], [0.05, 0.34], [0, 0.6]]) {
        sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, sh.width, sh.height); sg.setTransform(M);
        sg.strokeStyle = 'rgb(14,8,10)'; sg.lineCap = 'round';
        for (const [x0, y0, x1, y1, w0] of parts) { sg.lineWidth = w0 + wd; sg.beginPath(); sg.moveTo(x0, y0); sg.lineTo(x1, y1); sg.stroke(); }
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a2 * h.in; ctx.drawImage(sh, 0, 0); ctx.restore();
      }
      const pull = h.grip * (0.5 + 0.5 * h.pull);
      if (pull > 0.01) for (const a2 of [0.6, 1.5, 2.4, 3.3, 4.1]) {
        const r1 = 1.45, r0 = 0.7;
        soft(ctx, () => { ctx.beginPath(); ctx.moveTo(Math.sin(a2) * r1, 0.3 + Math.cos(a2) * r1); ctx.lineTo(Math.sin(a2) * r0, 0.3 + Math.cos(a2) * r0); ctx.stroke(); }, 0.2, [96, 80, 82], 0.7 * pull * h.in);
      }
      ctx.restore();
    };
    L.overlay = (ctx, W, H) => {
      const k = s.over || 0;
      if (k <= 0) return;
      const t = L.aftermathT, rm = SAVE.data.settings.reducedMotion, c = c0();
      // the hem: up from below the view to over the top of it, the middle first
      const edge = lerp(H * 1.06, -H * 0.36, k), sag = H * 0.16, wav = x => Math.sin(x * 0.011 + 1.3) * 5;
      const hemY = x => edge + sag * Math.pow((x - W / 2) / (W / 2), 2) + wav(x);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(-10, H + 10);
      for (let x = -10; x <= W + 10; x += 20) ctx.lineTo(x, hemY(x));
      ctx.lineTo(W + 10, H + 10); ctx.closePath(); ctx.clip();
      // the jerk of a pull, toward it (down the view, toward the foot of the bed, the way its arms come in), easing back
      const rel = wrapPi(c.yaw - G.cam.yaw), ax = Math.sin(rel), ay = Math.cos(rel) * 0.8 + 0.2, al = Math.hypot(ax, ay) || 1;
      const u = s.tugAt === undefined ? 1 : clamp((t - s.tugAt) / 0.42, 0, 1), jerk = (1 - u) * (1 - u) * (rm ? 12 : 38);
      const jx = ax / al * jerk, jy = ay / al * jerk, br = rm ? 0 : Math.sin(t * 1.5) * 6;   // and your breath under there
      // the dark under the covers
      ctx.fillStyle = rgba([15, 12, 18]); ctx.fillRect(0, 0, W, H);
      // the lamp, a warm glow through the cloth on its side of you (weaker and lower if it is behind you)
      const lr = wrapPi(Math.atan2(LX, LZ) - G.cam.yaw), front = 0.5 + 0.5 * Math.max(0, Math.cos(lr)), side = Math.sin(lr);
      const gx = W / 2 + side * W * 0.42 + jx * 0.5, gy = H * (0.52 + 0.14 * Math.max(0, -Math.cos(lr))) + jy * 0.5;
      const glow = (s.lampOn ? 1 : 0.3) * front;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(W, H) * 0.72);
      g.addColorStop(0, rgba([232, 162, 92], 0.66 * glow)); g.addColorStop(0.3, rgba([186, 114, 64], 0.38 * glow)); g.addColorStop(0.7, rgba([104, 66, 48], 0.13 * glow)); g.addColorStop(1, rgba([60, 40, 40], 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(jx, jy);
      // the folds: a soft trough in shadow, the crest beside it on the lamp's side catching the light, moving a little as
      // you breathe. Both are laid over what is under them, so they show where the light comes through and not in the dark
      ctx.lineCap = 'round';
      const sx = side >= 0 ? 1 : -1;
      for (const [x0, y0, cx, cy, x1, y1, wd] of FOLDS) {
        const b2 = br * (1 - cy * 0.5), path = (o) => () => { ctx.beginPath(); ctx.moveTo(x0 * W + o, y0 * H); ctx.quadraticCurveTo(cx * W + o + b2, cy * H + b2 * 0.5, x1 * W + o + b2 * 0.4, y1 * H); ctx.stroke(); };
        ctx.globalCompositeOperation = 'multiply'; soft(ctx, path(0), wd * H * 0.5, [70, 60, 66], 0.85);
        ctx.globalCompositeOperation = 'overlay'; soft(ctx, path(sx * wd * H * 0.45), wd * H * 0.3, [236, 218, 200], 0.45);
      }
      ctx.globalCompositeOperation = 'source-over';
      // its two hands on the covers, either side of the middle, in from the foot of the bed (from its side of it); each
      // reaching on up the cloth as it takes a new hold
      const hc = lerp(W / 2, gx, 0.3) + ax * W * 0.12, tilt = -clamp(ax, -1, 1) * 0.5;
      (s.coverHands || []).forEach((h, i) => {
        if (h.in <= 0.002) return;
        const sd = i ? 1 : -1, px = -sd;   // (each on the far side from its thumb: the thumbs in toward each other)
        const x = hc + px * W * 0.22 + px * h.up * W * 0.01, y = H * (0.56 - h.up * 0.09) + (1 - h.in) * H * 0.6;
        shadowHand(ctx, x, y, tilt + px * 0.22, H * 0.3, sd, h);
      });
      // the weave over all of it, close enough to see the threads where the light comes through
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = weaveOf(ctx); ctx.fillRect(-60, -60, W + 120, H + 120); ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      ctx.restore();
      // the hem itself as it goes up past your eyes: the sheet turned down over the blanket's edge, out of focus this close
      if (edge > -H * 0.3) {
        ctx.save(); ctx.lineCap = 'round';
        for (const [off, wd, a] of [[16, 46, 0.35], [12, 26, 0.6], [9, 12, 0.8]]) {
          ctx.strokeStyle = rgba([86, 82, 90], a); ctx.lineWidth = wd; ctx.beginPath();
          for (let x = -10; x <= W + 10; x += 20) { const y = hemY(x) + off; x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
          ctx.stroke();
        }
        ctx.restore();
      }
    };
    L.floor = { poly: [[-0.7, -0.9], [0.7, -0.9], [0.7, 1.8], [-0.7, 1.8]], y: 0.58 };
  }
});
