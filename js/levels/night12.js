'use strict';
// ============================================================ 12. THE BEDROOM ============================================================
// Your own room. You are in bed, sitting up. It is already there, in the hall beyond the doorway or in the closet among
// the clothes, behind the wall at the side of the opening, and only its head leans out round the edge at first; then it
// steps out into the room, in extreme slow motion. Everything you can use is within arm's reach. It cannot stand the
// light: when the lamp comes on it shrinks from it, down out of sight below the bed, and comes up again at the foot of it
// (or at its side, out of the closet) with only its eyes over the edge, and then its hands, on the covers: pull them up
// now. The covers stop it, but only with the lamp on: pulled up in the dark, it takes them and pulls them away.
// The wrong bulb: the same glass on a bayonet cap, two pins and no thread, so it will not screw into this lamp
Object.assign(ICONS, {
  bulbPin(ctx, P) {
    const glass = P.col([214, 212, 200]), brass = P.col([150, 130, 70]), fil = P.col([120, 110, 90]);
    P_ell(ctx, 0, 0.62, 0.26, 0.3, glass); P_poly(ctx, [[-0.16, 0.4], [0.16, 0.4], [0.12, 0.2], [-0.12, 0.2]], glass);
    P_rect(ctx, -0.12, 0.05, 0.24, 0.16, brass); P_rect(ctx, -0.21, 0.1, 0.1, 0.05, brass); P_rect(ctx, 0.11, 0.1, 0.1, 0.05, brass);
    P_line(ctx, -0.06, 0.45, 0, 0.7, 0.012, fil); P_line(ctx, 0, 0.7, 0.06, 0.45, 0.012, fil);
  },
});
LEVELS.push({
  id: 'bedroom', title: 'The Bedroom', facing: 0, eyeH: 1.15, laneMode: 'random',
  pal: { skyTop: [8, 8, 16], fog: [26, 24, 30], ground: [22, 18, 16], fogDist: 30 },
  ambient: { wind: 0.15, drone: 0.9, droneFreq: 38, windFreq: 200 },
  lights: [{ x: 3.4, y: 2.3, z: 1.6, r: 6, i: 0.28, color: [150, 170, 230], cone: { x: -1, y: -0.35, z: -0.2, deg: 36 } }],
  text: {
    intro: 'You woke up suddenly.',
    hint: 'The lamp is dead; there is a bulb in the drawer. It cannot stand the light, and the covers only hold with the lamp on. Light first; then hold the covers until they are all the way up.',
    objective: 'Get the lamp on. Then pull the covers up.',
    death: { default: 'It leaned in closer until its face was the only thing you could see.', dark: 'It pulled the covers away. It is not afraid of the dark.' },
    win: 'It pulled at the covers, but you were stronger.',
    fragment: 'The covers were pulled loose at the foot of the bed in the morning, as if something had tried them.',
  },
  lanes: [
    // it starts where it peers round the edge from (WAYS below): the start is held to that, whatever the spread of the night
    { deg: 0, name: 'the doorway', barrierDist: 1.9, startDist: 4.9, maxStart: 4.1, cue: 'creak', default: true, apertures: [{ z: 3.6, x0: -0.5, x1: 0.5, y0: 0, y1: 2.1 }] },
    { deg: 270, name: 'the closet', barrierDist: 1.6, startDist: 4.2, maxStart: 3.55, cue: 'hangers', apertures: [{ z: 3.2, x0: -0.9, x1: 0.9, y0: 0, y1: 2.2 }] },
  ],
  creatures: [{ type: 'tall', startDist: 4.0, time: 70, unseenMult: 2.5 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const parts = STORY.buildBedroom(L, false);
    const decoy = !!L.diff.decoys, unplugged = L.nightmare, sticks = L.nightmare;
    Object.assign(s, { fitted: false, plugged: !unplugged, lampOn: false, lampT: 0, clicks: 0, coversUp: false, grey: 0, tick: 0, tugAt: -9, mode: null, latBias: 0 });
    // Drawing order in this room (it is built in local coordinates, and this night faces north, so they are world ones).
    // The mattress is one long quad whose middle is further off than the nightstand beside it and the bed's own legs, so
    // it was drawn first and they over it: the nightstand stood on the covers and the legs showed through. Whatever is
    // beside or under the bed goes behind the mattress (BED). The nightstand's drawer face, on its far side where you
    // cannot see it, is not drawn: the drawer you use is on the side that faces the bed.
    // The mattress's top is drawn whole, just before the covers (MATTRESS, between them and BED): left to itself it was cut
    // into pieces each sorted where it is, and the pieces nearer than the covers were drawn over them as they came up.
    const BED = 1.7, MATTRESS = 1.66, within = (p, x0, x1, z0, z1) => p.kind === 'poly' && p.pts.every(v => v[0] >= x0 && v[0] <= x1 && v[2] >= z0 && v[2] <= z1);
    for (const p of L.props) {
      if (p.sortDist !== undefined) continue;
      if (within(p, -0.75, 0.75, -1.0, 1.9) && p.pts.every(v => v[1] === 0.58) && Math.min(...p.pts.map(v => v[2])) === -1.0) p.sortDist = MATTRESS;
      else if (within(p, 0.94, 1.46, -0.13, -0.105)) p.alpha = 0;
      else if (within(p, 0.94, 1.46, -0.13, 0.41) || [-0.72, 0.72].some(x => within(p, x - 0.05, x + 0.05, -0.95, -0.85) || within(p, x - 0.05, x + 0.05, 1.8, 1.9))) p.sortDist = BED;
    }
    STORY.lamp(L, parts.lamp[0], parts.lamp[1], parts.lamp[2], { lit: () => shown() });
    // its cord runs off the back of the nightstand (and, under the bed, to the wall on the other side)
    SC.quad(L, [1.25, 0.624, 0.11], [1.26, 0.624, 0.13], [1.46, 0.624, 0.03], [1.45, 0.624, 0.01], [30, 26, 24], { sortDist: 1.4 });
    // the wall socket, low on the wall behind the bed on the closet side: a pale plate with its two slots
    SC.wallV(L, -1.55, -1.094, -1.45, -1.094, 0.22, 0.36, [120, 114, 104], { sortDist: 1.86 });
    for (const x of [-1.515, -1.485]) SC.wallV(L, x - 0.007, -1.092, x + 0.007, -1.092, 0.26, 0.31, [22, 20, 20], { sortDist: 1.859 });
    const c0 = () => L.creatures[0];
    // the drawer, in the side of the nightstand that faces the bed, holds the bulb (and, on Nightmare, one that will not fit).
    // It is built into the nightstand (a container's card would turn with the view and stand out from it at an angle):
    // opened, it slides out toward you, dark inside, and they stand in it
    // Both are held the same way, by the cap between finger and thumb, the glass up (js/hands.js)
    const BULB_HELD = { grip: 'pinch', at: [0, 0.1], angle: -0.12, tip: [0, 0.05] };
    const bulbs = [{ id: 'bulb', name: 'Bulb', z: decoy ? 0.07 : 0.15, opts: { w: 0.14, h: 0.2, icon: 'bulb', material: 'glass' } }]
      .concat(decoy ? [{ id: 'bulb2', name: 'Bulb', z: 0.235, opts: { w: 0.14, h: 0.2, icon: 'bulbPin', decoy: true, decoyText: 'Wrong kind of bulb. It will not go in.', held: BULB_HELD, material: 'glass' } }] : []);
    const drawer = mkTarget(L, {
      id: 'drawer', name: 'Drawer', x: 0.93, y: 0.43, z: 0.15, w: 0.4, h: 0.18, open: false, yielded: [],
      hint() { return drawer.open ? 'Nothing else in it.' : 'The nightstand drawer.'; },
      onClick() {   // your hand opens it (js/hands.js); clicked again, it goes into it
        if (!drawer.open) {
          drawer.open = drawer.done = true; AUDIO.sfx('drawer'); // its own sound: not the creak that warns of the doorway, nor a creature's scratching
          for (const b of bulbs) drawer.yielded.push(mkItem(L, b.id, b.name, { x: 0.875, y: 0.47, z: b.z, jitter: 0 }, b.opts));
          G.reach(drawer, 'pull');
          return true;
        }
        const left = drawer.yielded.some(i => !i.taken); G.say(left ? 'Take what is in it.' : 'Nothing else in it.', left ? 'Something is still in it.' : 'Nothing more.');
        G.reach(drawer, { style: 'touch', at: [0, 0.8] });
        return true;
      },
    });
    const knob = out => SC.mkSprite(L, 0.938 - out, 0.495, 0.15, 0.036, 0.036, (ctx, P) => { ctx.scale(0.036, 0.036); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([96, 92, 86])); P_ell(ctx, -0.1, 0.6, 0.3, 0.3, P.col([164, 158, 148])); }, { sortDist: 1.672 });
    const knobs = [knob(0), knob(0.09)];
    // The lamp's switch is the pull chain under its shade, and your hand pulls it (js/hands.js): the chain jerks and the switch
    // clicks as the hand gets there. With no bulb in, or the cord out, nothing comes of it; on Nightmare it sticks twice (the
    // chain barely gives) before it goes. The light comes on as it is pulled. The wrong bulb is tried in the socket, will not
    // go in, and drops onto the bed (soft), where it can be taken again.
    const CHAIN = [0.2, 0.31];
    const pull = (stiff, then) => {
      const was = G.hand.reach, go = () => { s.tugAt = L.t; s.stiff = stiff; AUDIO.sfx('switch'); if (then) then(); };
      const r = G.reach(lampT, { style: 'pull', at: CHAIN, onTouch: go });
      if (!r || r === was) go();   // no hand to show, or it is there already, still on the chain: at once
    };
    const lampT = mkTarget(L, {
      id: 'lamp', name: 'Lamp', x: 1.2, y: 0.62, z: 0.15, w: 0.4, h: 0.55, accepts: ['bulb'].concat(decoy ? ['bulb2'] : []),
      fumble: { decoy: { preset: 'bump', at: [0, 0.5], sfx: { land: 'flop' } } },
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
    const lampDetail = SC.mkSprite(L, 1.2, 0.62, 0.15, 0.34, 0.5, (ctx, P) => {
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
    }, { sortDist: Math.hypot(1.2, 0.15) - 0.002 });
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
        if (!s.lampOn) { yank(); return true; }   // up in the dark: it is not afraid of the dark
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
    // Each way in: where the opening is (apZ, its half-width edge, along and across the way), where it peers round the
    // edge from (peerD), and its place at the bed, down out of the light (spot: along the way and across it): at the foot
    // of the bed from the doorway, at the corner of its foot from the closet; and where its hands take hold of the covers
    // there (x, z in the room).
    const WAYS = [
      { apZ: 3.6, edge: 0.5, peerD: 4.1, spot: { d: 2.08, lat: 0 }, hands: [[-0.3, 1.86], [0.3, 1.86]] },
      { apZ: 3.2, edge: 0.9, peerD: 3.55, spot: { d: 1.07, lat: 1.5 }, hands: [[-0.64, 1.24], [-0.64, 1.72]] },
    ];
    const side = L.rand() < 0.5 ? -1 : 1, BEHIND = 0.3;   // which side of the opening it stands, and how far behind the edge
    const way = c => WAYS[c.lane.idx] || WAYS[0], edgeAt = (w, d) => w.edge * d / w.apZ;
    const hold = (c, d) => { c.hold = d; s.held = true; }, letGo = c => { if (s.held) { c.hold = null; s.held = false; } };
    const panOf = c => clamp(Math.sin(wrapPi(Math.atan2(c.pos().x, c.pos().z) - G.cam.yaw)), -0.85, 0.85);
    // coming: behind the wall at the side of the opening with only its head round the edge; stepping out into the opening
    // as it comes on, the head coming in over its shoulders; then on into the room
    const place = c => {
      const w = way(c), o = clamp((w.peerD - c.dist) / (w.peerD - w.apZ + 0.05), 0, 1);
      c.peerSide = -side; c.peer = 1 - smoothstep(o / 0.6);
      c.runLat = side * (edgeAt(w, c.dist) + BEHIND) * (1 - smoothstep(o)) + s.latBias;
    };
    // The light comes on: it flinches from it, an arm across its face, and sinks down out of sight; down there it goes to
    // its place at the bed (out of sight all the way), comes up until its eyes are over the edge, and holds there, peering
    // at you; then its hands come up over the edge onto the covers (and you are told). Times in seconds from the light.
    const startDuck = c => {
      s.mode = 'duck';
      s.duck = { t0: L.t, d: c.dist, lat: c.lat, peer: c.peer || 0, duck0: c.duck || 0, eye0: c.duck ? c.eyeTo : null, cued: !!(s.duck && s.duck.cued) };
      const sp = way(c).spot; s.duck.creep = clamp(Math.hypot(c.dist - sp.d, c.lat - sp.lat) * 1.1, 0.4, 2.2);
      c.flinchSide = c.lat > 0.05 ? -1 : 1;   // the arm toward the middle of the room
      hold(c, c.dist);
      AUDIO.voice('slow', 0.5, panOf(c));
    };
    const DUCK = { flinch: 0.5, down: 1.5, up: 1.2, look: 1.1, reach: 1.1 };
    const ducking = c => {
      const D = s.duck, t = L.t - D.t0, sp = way(c).spot, hide = c.hideBelow === undefined ? 0.6 : c.hideBelow;
      const T2 = DUCK.down, T3 = T2 + D.creep, T4 = T3 + DUCK.up, T5 = T4 + DUCK.look;
      c.flinch = smoothstep(t / 0.2) * (1 - smoothstep((t - DUCK.flinch) / 0.5));
      c.duck = lerp(D.duck0, 1, smoothstep((t - DUCK.flinch + 0.1) / (T2 - DUCK.flinch + 0.1)));
      // going to the bed it keeps low, its face down: out in the open, only a dark shape low along the floor
      const m = smoothstep((t - T2 + 0.2) / D.creep), low = Math.max(hide - 0.4, 0.2);
      c.faceAway = smoothstep((t - T2 + 0.5) / 0.3) * (1 - smoothstep((t - T3) / 0.3));
      if (!s.came) hold(c, lerp(D.d, sp.d, m));   // (under the covers, at the end, the night walks it to the bed itself)
      c.runLat = lerp(D.lat, sp.lat, m); c.peer = D.peer * (1 - smoothstep(t / T2));
      c.eyeTo = t < T3 ? (D.eye0 === null ? low : lerp(D.eye0, low, smoothstep(t / T2))) : lerp(low, hide + 0.07, smoothstep((t - T3) / DUCK.up));
      c.reach = smoothstep((t - T5) / DUCK.reach); c.gripY = hide - 0.03;   // (its arms up to the edge; the hands over it are drawn on the covers)
      if (t >= T5 && !D.cued) { D.cued = true; AUDIO.sfx('cloth', panOf(c)); if (!L.won) G.say('Its hands come up over the end of the bed, onto the covers. Pull them up.', 'Its hands are on the covers.'); }
    };
    // The light goes out with it down there: it rises, slowly, from behind the bed, and comes on again from where it is
    const RISE = 3.2;
    const rising = (c, dt) => {
      const t = L.t - s.riseAt;
      c.flinch = 0; c.faceAway = 0; c.reach = Math.max(0, c.reach - dt * 1.5); c.duck = s.rise0 * (1 - smoothstep(t / RISE));
      if (t >= RISE) {
        s.mode = 'come'; c.duck = 0; c.reach = 0; letGo(c);
        c.u = clamp(1 - c.dist / c.D0, 0, 1); s.latBias = 0;
        const lat0 = c.runLat; place(c); s.latBias = lat0 - c.runLat; c.runLat = lat0;   // from where it is across the room
      }
    };
    // The covers pulled up in the dark: a moment of nothing, then it is at the bed (all at once, after all that slowness),
    // its hands on the covers, and it rips them down off you and is in your face
    const yank = () => {
      const c = c0(), sp = way(c).spot, to = c.dist < sp.d ? { d: c.dist, lat: c.lat } : sp;
      s.mode = 'yank'; s.yank = { t0: L.t, d: c.dist, lat: c.lat, to, duck0: c.duck || 0, peer0: c.peer || 0 }; s.yankK = 0;
      G.holding = null; hold(c, c.dist);
    };
    const yanking = c => {
      const Y = s.yank, t = L.t - Y.t0, hide = c.hideBelow === undefined ? 0.6 : c.hideBelow;
      const m = easeIn(clamp((t - 0.3) / 0.3, 0, 1));
      hold(c, lerp(Y.d, Y.to.d, m)); c.runLat = lerp(Y.lat, Y.to.lat, m);
      c.duck = Y.duck0 * (1 - m); c.peer = Y.peer0 * (1 - m); c.flinch = 0;
      c.reach = smoothstep((t - 0.45) / 0.15); c.gripY = hide - 0.03; c.faceAway = 0;
      s.yankK = smoothstep((t - 0.62) / 0.2);
      if (t >= 0.62 && !Y.tugged) { Y.tugged = true; AUDIO.sfx('tug', panOf(c)); G.shake(0.9); }
      if (t >= 0.86 && G.state === 'play') { c.deathSpec = { delay: 0.05, dur: 0.4, sting: 'sting' }; die(c, 'dark'); }   // quick: its face fills the view
    };
    const behave = (c, dt) => {
      if (s.mode === 'yank') { yanking(c); return; }
      if (!s.mode) { s.mode = 'peer'; s.peerTill = L.t + 4 + L.rand() * 2; if (c.hold === null) hold(c, c.dist); }   // it only peers, at first
      const lit = shown() || L.won;
      if (lit && s.mode !== 'duck') startDuck(c);
      else if (!lit && s.mode === 'duck') { s.mode = 'rise'; s.riseAt = L.t; s.rise0 = c.duck || 0; }
      if (s.mode === 'peer' && L.t >= s.peerTill) { s.mode = 'come'; letGo(c); }
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
      if (L.won) { s.tick -= dt; if (s.tick <= 0) { s.tick = 1.0; AUDIO.sfx('tick', Math.sin(wrapPi(-Math.PI / 4 - G.cam.yaw)) * 0.7, true); } } // the clock is on the dresser to the north-west, whichever way you face
    };
    // a cord on the floor: a pale cloth flex, so it shows on the dark boards; it goes under the bed, behind the mattress
    const CORD = [104, 98, 90];
    const flex = (pts, y) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], l = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / l * 0.009, nz = (bx - ax) / l * 0.009; R.add(SC.mkQuad(L, [ax - nx, y, az - nz], [bx - nx, y, bz - nz], [bx + nx, y, bz + nz], [ax + nx, y, az + nz], CORD, { sortDist: BED })); } };
    // the covers: kicked down to the foot of the bed, and drawn up over you as you pull, the sheet turned down along the top
    const COV = 1.62, X = 0.77, BLANKET = [80, 84, 108], SHEET = [132, 128, 134], CREASE = [70, 74, 97];
    // (pulled up in the dark, they are ripped back down off you to the foot of the bed)
    const coversAt = () => { const p = s.yank ? 1 - (s.yankK || 0) : s.coversUp ? 1 : (covers.progress || 0); return { p, zE: lerp(1.22, 0.1, p), yE: lerp(0.64, 0.84, p), roll: lerp(0.06, 0.025, p) }; };
    L.dynamic = () => {
      if (unplugged) {
        if (!s.plugged) {
          flex([[-0.7, -0.38], [-1.0, -0.42], [-1.35, -0.54], [-1.72, -0.66]], 0.012);
          // the plug, on its side: a pale block, its two brass pins toward the socket
          const [px, pz] = PLUG, q = (a, b, c, d, col, sd) => R.add(SC.mkQuad(L, a, b, c, d, col, { sortDist: sd }));
          q([px - 0.035, 0.045, pz + 0.045], [px + 0.035, 0.045, pz + 0.045], [px + 0.035, 0.045, pz - 0.045], [px - 0.035, 0.045, pz - 0.045], [150, 144, 134], 1.692);
          q([px + 0.035, 0.012, pz + 0.045], [px + 0.035, 0.012, pz - 0.045], [px + 0.035, 0.045, pz - 0.045], [px + 0.035, 0.045, pz + 0.045], [112, 106, 98], 1.694);
          q([px - 0.035, 0.012, pz + 0.045], [px + 0.035, 0.012, pz + 0.045], [px + 0.035, 0.045, pz + 0.045], [px - 0.035, 0.045, pz + 0.045], [124, 118, 108], 1.694);
          for (const dx of [-0.016, 0.016]) q([px + dx - 0.006, 0.03, pz - 0.045], [px + dx + 0.006, 0.03, pz - 0.045], [px + dx + 0.006, 0.03, pz - 0.085], [px + dx - 0.006, 0.03, pz - 0.085], [176, 150, 84], 1.698);
        } else {
          // plugged in: the plug in the socket, the flex down the wall and away under the bed
          R.add(SC.mkWallV(L, -1.535, -1.088, -1.465, -1.088, 0.245, 0.325, [150, 144, 134], { sortDist: 1.858 }));
          R.add(SC.mkWallV(L, -1.509, -1.086, -1.491, -1.086, 0.012, 0.25, CORD, { sortDist: 1.857 }));
          flex([[-1.5, -1.08], [-1.42, -0.95], [-1.25, -0.72], [-1.0, -0.5], [-0.7, -0.4]], 0.012);
        }
      }
      // the drawer: shut, its front with a dark gap round it; open, slid out toward you, the hole and its sides dark. It is
      // drawn before the mattress, whose edge hides the bottom of it once it is out, as it would
      const dw = (x0, z0, x1, z1, y0, y1, col, sd) => R.add(SC.mkWallV(L, x0, z0, x1, z1, y0, y1, col, { sortDist: sd }));
      const fx = drawer.open ? 0.854 : 0.944;
      if (drawer.open) {
        dw(0.947, -0.03, 0.947, 0.33, 0.44, 0.595, [8, 7, 7], 1.69);
        dw(fx, -0.02, 0.947, -0.02, 0.452, 0.585, [40, 30, 24], 1.684); dw(fx, 0.32, 0.947, 0.32, 0.452, 0.585, [40, 30, 24], 1.684);
        R.add(SC.mkQuad(L, [fx, 0.595, -0.03], [fx + 0.016, 0.595, -0.03], [fx + 0.016, 0.595, 0.33], [fx, 0.595, 0.33], [84, 64, 50], { sortDist: 1.676 }));
      } else dw(0.947, -0.045, 0.947, 0.345, 0.428, 0.606, [12, 10, 8], 1.69);
      dw(fx, -0.03, fx, 0.33, 0.44, 0.595, [66, 50, 38], 1.68);
      R.add(knobs[drawer.open ? 1 : 0]);
      // the covers: bunched at the foot they are as thick all the way across; drawn up, they rise over you and lie flat on the
      // mattress at the sides (so the drawer beside the bed stays in sight)
      const { p, zE, yE, roll } = coversAt(), zF = zE + 0.14, B = 0.585, XS = [-X, -0.6, -0.25, 0.25, 0.6, X];
      const tint = col => (s.grey ? mixc(col, [124, 124, 130], s.grey * 0.5) : col);
      const q = (a, b, c, d, col, sd) => R.add(SC.mkQuad(L, a, b, c, d, tint(col), { sortDist: sd }));
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
      R.add(lampDetail);
      // what of the thing the bed hides from you: everything below the bed's top where your line of sight leaves the bed (or
      // below the covers' turned-down edge, if it is beyond that); below the covers themselves if it is over the bed
      const c = c0(), cp = c.pos(), lp = rotY(cp.x, cp.z, -L.facing), lx = lp[0], lz = lp[1];
      const tb = Math.min(1, lx > 0 ? 0.75 / lx : lx < 0 ? -0.75 / lx : Infinity, lz > 0 ? 1.9 / lz : lz < 0 ? -1.0 / lz : Infinity);
      let hide = tb >= 1 ? Math.max(0.6, lz >= zF ? H(lx, lz) : lz >= zE ? up(lx, yE) + th(lx) : 0.6) : L.eyeH - (L.eyeH - 0.6) / tb;
      if (lz > zE && Math.abs(lx * zE / lz) < X) hide = Math.max(hide, L.eyeH - (L.eyeH - (up(lx * zE / lz, yE) + th(lx * zE / lz))) * lz / zE);
      c.hideBelow = hide;
      // and the wall either side of the opening, while it is still behind it
      const w = way(c), e = edgeAt(w, c.dist);
      c.showX = c.dist > w.apZ + 0.01 ? [-e - c.lat, e - c.lat] : null;
      // peering, its fingers are round the edge of the frame by its face (drawn over the frame, which the thing is behind):
      // at the height of its hand, seen through the opening's plane
      if ((c.peer || 0) > 0.3 && c.dist > w.apZ) {
        const hy = L.eyeH + (1.7 - L.eyeH) * w.apZ / c.dist, q = APPROACH.position(c.lane, w.apZ - 0.03, side * (w.edge + 0.02), L.eyeH), k = smoothstep((c.peer - 0.3) / 0.4);
        R.add(SC.mkSprite(L, q.x, hy - 0.07, q.z, 0.12, 0.14, (ctx, P) => drawFrameFingers(ctx, P, side, k), { sortDist: w.apZ - 0.08 }));
      }
      // its hands up over the edge of the bed, on the covers (over them): the backs of the long hands, the fingers down
      // on the cloth, gripping; they come up over the edge as it reaches, and let go as it lunges
      const r = (c.reach || 0) * (1 - (c.lunge || 0));
      if (r > 0.01) w.hands.forEach(([x, z], i) => {
        const y = z >= zF ? H(x, z) : B + 0.004, sx = w === WAYS[0] ? (x < 0 ? -1 : 1) : (i ? 1 : -1);
        R.add(SC.mkSprite(L, x, y - 0.09 - (1 - r) * 0.14, z, 0.24, 0.24, (ctx, P) => { ctx.scale(1.3, 1.3); drawGrip(ctx, P, sx, r, L.t + i * 0.7); }, { sortDist: COV - 0.1 }));
      });
    };
    const HAND = [10, 9, 12];
    const drawFrameFingers = (ctx, P, sd, k) => {   // four long fingers curled round the edge, pointing back toward where it stands
      const col = P.cola(HAND, k);
      for (let i = 0; i < 4; i++) {
        const y = 0.035 + i * 0.026, l = (i === 0 || i === 3 ? 0.045 : 0.058) * k;
        P_limb(ctx, [[-sd * 0.03, y + 0.004], [sd * 0.005, y + 0.006], [sd * (0.005 + l), y - 0.006]], 0.013, col);
      }
    };
    const drawGrip = (ctx, P, sd, r, t) => {   // one hand on the covers, in metres from the cloth under it (0.07 up)
      const col = P.cola(HAND, Math.min(1, r * 1.4)), flex = Math.max(0, Math.sin(t * 1.3)) * 0.012;   // now and then it tightens its grip
      P_line(ctx, sd * 0.006, 0.15, 0, 0.11, 0.05, col);                          // the wrist, up over the edge
      P_ell(ctx, 0, 0.1, 0.05, 0.032, col);                                        // the back of the hand
      for (let i = 0; i < 4; i++) {
        const x0 = (i - 1.5) * 0.022, l = i === 0 || i === 3 ? 0.07 : 0.088, xm = x0 * 1.25, x1 = x0 * 1.4 + sd * 0.004;
        P_limb(ctx, [[x0, 0.09], [xm, 0.09 - l * 0.55], [x1 - Math.sign(x0 || 1) * flex, 0.09 - l + flex]], 0.012, col);
      }
      P_limb(ctx, [[-sd * 0.045, 0.1], [-sd * 0.06, 0.07], [-sd * 0.05, 0.045]], 0.013, col);   // the thumb
      // the cloth drawn up into its fingers
      for (const dx of [-0.05, 0, 0.05]) P_line(ctx, dx * 1.2, 0.0, dx * 0.6, 0.035, 0.004, P.cola([60, 60, 80], 0.5 * r));
    };
    L.dynamicLights = () => { if (!shown()) return []; const p = L.pt(1.2, 1.05, 0.15); return [{ x: p[0], y: p[1], z: p[2], r: 4.5, i: 1.0, color: [255, 210, 150], flicker: s.lampT < 2 ? 0.8 : 0.08, seed: 12 }]; };
    L.glows = () => { if (!shown()) return null; const p = L.pt(1.2, 1.0, 0.15); return [{ x: p[0], y: p[1], z: p[2], r: 1.3, color: [255, 210, 150], a: 0.28 }]; };
    // ---- the win: the covers come up over your eyes, and it plays out under them ----
    // You look up from the covers at it once more, then they come up over your head: the hem rises across the view (the
    // middle first, where your hands are) and you are under the fabric, in the dark, the lamp a faint warm glow through
    // the weave on its side of you, the folds moving a little as you breathe. Under there: its slow steps come to the bed,
    // the shadow of its hand comes over the glow and spreads on the covers, and it pulls at them, hard, again and again
    // (the fabric jerks toward it, the bed shakes), and they hold. It lets go, the shadow goes, the light through the
    // covers goes grey, the clock ticks on. Then the fade.
    const U = { rise: 1.3, under: 2.1, reach: 3.0, grip: 3.8, tugs: 3, every: 0.62, lets: 6.1, dawn: 5.9, end: 9.4 };
    L.aftermath = (t, dt) => {
      const c = c0();
      if (!s.after) {   // look up from the covers at it
        // at it where it really is (its eyes over the edge of the bed, if it is down there)
        s.after = true; const p = c.pos(), yaw = Math.atan2(p.x, p.z), hd = Math.max(0.3, Math.hypot(p.x, p.z));
        G.cam.tYaw = G.cam.yaw + wrapPi(yaw - G.cam.yaw); G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8;
        G.cam.tPitch = clamp(Math.atan2(L.eyeH - (c.duck ? c.eyeTo : 1.6), hd), 0, PITCH_DOWN);
        L.text.win = c.lane.idx === 1 ? 'You pulled the covers over your head. It came out of the closet to the side of the bed and pulled at them, and they held. It stood there until the light through them went grey.'
          : 'You pulled the covers over your head. It came to the foot of the bed and pulled at them, and they held. It stood there until the light through them went grey.';
      }
      s.over = smoothstep((t - U.rise) / (U.under - U.rise));
      if (t >= U.rise && !s.rustled) { s.rustled = true; AUDIO.sfx('hiss'); }
      // under the covers it comes to the bed, a few slow, heavy steps, however far off it was
      if (t >= U.under && !s.came) { s.came = true; const b = c.lane.barrierDist || 1.6; c.hold = null; c.distFn = (cr, dt2) => Math.max(b, cr.dist - dt2 * 1.6); }
      s.shadow = smoothstep((t - U.reach) / 0.8) * (1 - smoothstep((t - U.lets) / 1.2));
      s.grip = smoothstep((t - U.grip + 0.3) / 0.4) * (1 - smoothstep((t - U.lets) / 0.8));
      const n = Math.floor((t - U.grip) / U.every) + 1;   // the pulls, one after another
      if (t >= U.grip && n > (s.tugs || 0) && n <= U.tugs) { s.tugs = n; s.tugAt = t; AUDIO.sfx('tug', clamp(Math.sin(wrapPi(c.yaw - G.cam.yaw)), -0.85, 0.85)); G.shake(0.55); }
      s.grey = clamp((t - U.dawn) / 3.2, 0, 1);
      L.pal.ambient = 1 + s.grey * 0.9; L.pal.fog = mixc([26, 24, 30], [150, 152, 158], s.grey); L.pal.skyTop = mixc([8, 8, 16], [120, 128, 150], s.grey);
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
    // the folds of the cloth tented over your face, running up and out from your hands at your chin
    const FOLDS = [[0.4, 1.1, 0.26, 0.62, -0.12, 0.12, 0.2], [0.52, 1.1, 0.5, 0.52, 0.36, -0.12, 0.15], [0.6, 1.1, 0.7, 0.5, 0.86, -0.12, 0.18], [0.66, 1.1, 0.9, 0.7, 1.14, 0.3, 0.22], [0.3, 1.12, 0.1, 0.92, -0.14, 0.7, 0.16]];
    const soft = (ctx, draw, wd, rgb, a) => { for (const [k, f] of [[2.0, 0.16], [1.65, 0.18], [1.3, 0.22], [0.95, 0.28], [0.6, 0.36]]) { ctx.lineWidth = wd * k; ctx.strokeStyle = rgba(rgb, a * f); draw(); } };   // a stroke with a soft edge
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
      // the jerk of a pull, toward it (up the view, the way its arm comes in), easing back
      const rel = wrapPi(c.yaw - G.cam.yaw), ax = Math.sin(rel), ay = -Math.cos(rel) * 0.8 - 0.2, al = Math.hypot(ax, ay) || 1;
      const u = s.tugAt === undefined ? 1 : clamp((t - s.tugAt) / 0.42, 0, 1), jerk = (1 - u) * (1 - u) * (rm ? 12 : 38);
      const jx = ax / al * jerk, jy = ay / al * jerk, br = rm ? 0 : Math.sin(t * 1.5) * 6;   // and your breath under there
      // the dark under the covers, lighter as the day comes
      const grey = s.grey || 0;
      ctx.fillStyle = rgba(mixc([15, 12, 18], [52, 54, 62], grey)); ctx.fillRect(0, 0, W, H);
      // the lamp, a warm glow through the cloth on its side of you (weaker and lower if it is behind you); the morning a cold one
      const lr = wrapPi(Math.atan2(1.2, 0.15) - G.cam.yaw), front = 0.5 + 0.5 * Math.max(0, Math.cos(lr)), side = Math.sin(lr);
      const gx = W / 2 + side * W * 0.42 + jx * 0.5, gy = H * (0.52 + 0.14 * Math.max(0, -Math.cos(lr))) + jy * 0.5;
      const glow = (s.lampOn ? 1 : 0.3) * front * (1 - grey * 0.5);
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
      // its hand on the covers: the shadow of a long hand and its fingers on the glow, soft at the edge, gripping
      const sh = s.shadow || 0, grip = s.grip || 0;
      if (sh > 0.002) {
        const S = H * 0.34, hx = lerp(W / 2, gx, 0.55) + ax * W * 0.1, hy = H * 0.46, ang = Math.atan2(-ax, Math.cos(rel) + 0.2) + (gx > W / 2 ? -0.35 : 0.35) * Math.max(0, Math.cos(rel));
        ctx.save(); ctx.translate(hx, hy + (1 - sh) * -H * 0.25); ctx.rotate(ang); ctx.scale(S, S);
        const spread = 0.46 - grip * 0.18, curl = grip * 0.22;
        const parts = [[0, -3.2, 0, -0.3, 0.27], [0, -0.28, 0, 0.04, 0.38]];   // the arm in from the edge, the palm
        [0.6, 0.76, 0.72, 0.56].forEach((l, f) => { const a2 = (f - 1.5) * spread / 1.5; parts.push([Math.sin(a2) * 0.15, 0.1, Math.sin(a2) * (0.15 + l * 0.9), 0.1 + Math.cos(a2) * l * (1 - curl), 0.07]); });
        parts.push([0.17, -0.14, 0.44 - grip * 0.12, 0.12, 0.075]);   // the thumb
        ctx.globalCompositeOperation = 'multiply';
        for (const [wd, a2] of [[0.26, 0.16], [0.14, 0.24], [0.05, 0.34], [0, 0.6]]) {
          ctx.strokeStyle = 'rgba(14,8,10,' + (a2 * sh) + ')';
          for (const [x0, y0, x1, y1, w0] of parts) { ctx.lineWidth = w0 + wd; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
        }
        // the cloth drawn in toward its grip: soft creases running in to where its fingers close, deeper on a pull
        const pull = grip * (0.55 + 0.45 * (1 - u));
        for (const a2 of [0.6, 1.5, 2.4, 3.3, 4.1]) {
          const r1 = 1.45, r0 = 0.7;
          soft(ctx, () => { ctx.beginPath(); ctx.moveTo(Math.sin(a2) * r1, 0.3 + Math.cos(a2) * r1); ctx.lineTo(Math.sin(a2) * r0, 0.3 + Math.cos(a2) * r0); ctx.stroke(); }, 0.2, [96, 80, 82], 0.7 * pull * sh);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }
      if (grey > 0) { ctx.fillStyle = rgba([150, 156, 170], 0.3 * grey); ctx.fillRect(-60, -60, W + 120, H + 120); }   // the day, through all of it
      // the weave over all of it, close enough to see the threads where the light comes through
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = weaveOf(ctx); ctx.fillRect(-60, -60, W + 120, H + 120); ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      ctx.restore();
      // the hem itself as it goes up past your eyes: the sheet turned down over the blanket's edge, out of focus this close
      if (edge > -H * 0.3) {
        const sheet = mixc([86, 82, 90], [150, 150, 156], grey);
        ctx.save(); ctx.lineCap = 'round';
        for (const [off, wd, a] of [[16, 46, 0.35], [12, 26, 0.6], [9, 12, 0.8]]) {
          ctx.strokeStyle = rgba(sheet, a); ctx.lineWidth = wd; ctx.beginPath();
          for (let x = -10; x <= W + 10; x += 20) { const y = hemY(x) + off; x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
          ctx.stroke();
        }
        ctx.restore();
      }
    };
    L.floor = { poly: [[-0.7, -0.9], [0.7, -0.9], [0.7, 1.8], [-0.7, 1.8]], y: 0.58 };
  }
});
