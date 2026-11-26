'use strict';
// ============================================================ 12. THE BEDROOM ============================================================
// Your own room. You are in bed, sitting up at the head of it, your back to the headboard and the wall close behind
// your head: everything the night needs is in front of you or beside you, along that wall, and nothing of it behind you.
// It is already there, in the hall beyond the doorway or in the closet in front of the clothes, behind the wall at the
// side of the opening, and only its head leans out round the edge at first (so it is on the night's card, before you
// begin); then it steps out into the room, in extreme slow motion, stooping under the top of the frame until it is
// through. Everything you can use is within arm's reach. It cannot stand the light: when the lamp comes on it shrinks
// from it, down on its haunches out of sight below the bed, and comes up again at the foot of it (or at its side, out of
// the closet) with only its eyes over the edge, and then its hands, on the covers. They grab the cloth and pull, again
// and again, and every pull brings them further up the bed toward you: pull the covers up before they reach you, or it
// comes up the bed after them. The covers stop it, but only with the lamp on: pulled up in the dark, it takes them and
// pulls them away.
// The night's easter egg: the pillow against the headboard at your back is the one thing in the room that is behind
// you. Look round and down at it and lift it: there is a tooth under it. Take the tooth and the night stops where it
// is: when you turn back the thing is bowed in over the bed from the foot of it, close, one long hand held out open,
// and a deep, low rumbling has come up under everything. Put the tooth in its hand: the rumbling cuts dead, its head
// snaps down to the tooth on its palm; it straightens and steps back, closes its hands round the tooth and its eyes, and
// in the dark and the quiet, all at once, it throws its arms wide and a butterfly's wings burst open behind it, its eyes
// open shimmering; one great beat of them and it is gone in a cloud of fairy dust; a dollar bill floats down onto the
// bed, and the night is won (the tooth fairy, below).
// The tooth: a small pale molar, its two roots down
Object.assign(ICONS, {
  tooth(ctx, P) {
    const en = P.raw([214, 208, 190]), dip = P.raw([150, 142, 124]);   // (pale in any dark: it is what you are looking for)
    P_ell(ctx, -0.15, 0.3, 0.12, 0.3, en, 0.14); P_ell(ctx, 0.15, 0.3, 0.12, 0.3, en, -0.14);                              // its roots
    P_ell(ctx, 0, 0.66, 0.36, 0.3, en); P_ell(ctx, -0.16, 0.9, 0.15, 0.1, en); P_ell(ctx, 0.16, 0.9, 0.15, 0.1, en);   // the crown and its two cusps
    P_ell(ctx, 0, 0.36, 0.06, 0.14, dip); P_ell(ctx, 0, 0.93, 0.05, 0.04, dip);
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
    death: { default: 'It leaned in closer until its face was the only thing you could see.', dark: 'It pulled the covers away. It is strong in the dark.', grabbed: 'Its hands pulled their way up the bed to you, and then it came up after them.' },
    egg: 'Give the tooth fairy a tooth.',   // this night's easter egg, as the Scores' list names it once found (game.js: foundEgg)
    win: 'You pulled the covers over your head.\nIt pulled at them, but you were stronger.',
    fairy: 'And you got a dollar!',   // the night won by the tooth fairy: the line on its card under "You survived" (js/menu.js), in place of win
  },
  lanes: [
    // it starts where it peers round the edge from (WAYS below): the start is held to that, whatever the spread of the night.
    // (Their cues are never played: it changes its way itself, gliding round the bed after a few quick, heavy footsteps
    // (crossing, below). The closet's clinking hangers keep the story's hangers on the wind out of this night.)
    { deg: 0, name: 'the doorway', barrierDist: 1.9, startDist: 4.9, maxStart: 4.1, cue: 'creak', default: true, apertures: [{ z: 3.6, x0: -0.5, x1: 0.5, y0: 0, y1: 2.1 }] },
    { deg: 270, name: 'the closet', barrierDist: 1.6, startDist: 4.2, maxStart: 3.4, cue: 'hangers', apertures: [{ z: 3.2, x0: -0.5, x1: 0.5, y0: 0, y1: 2.2 }] },
  ],
  creatures: [{ type: 'tall', startDist: 4.0, time: 70, unseenMult: 2.5 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const parts = STORY.buildBedroom(L, false);
    const unplugged = L.nightmare, sticks = L.nightmare;
    Object.assign(s, { fitted: false, plugged: !unplugged, lampOn: false, lampT: 0, clicks: 0, coversUp: false, tick: 0, tugAt: -9, mode: null, latBias: 0, pillowAt: null, fairy: null });
    // Drawing order in this room (it is built in local coordinates, and this night faces north, so they are world ones).
    // The mattress is one long quad whose middle is further off than the nightstand beside it and the bed's own legs, so
    // it was drawn first and they over it: the nightstand stood on the covers and the legs showed through. Whatever is
    // beside or under the bed goes behind the mattress (BED). The nightstand stands beside the bed at your right hand,
    // clear of it, back against the wall at the head of it; its drawer is in its front, toward the foot of the bed (NS:
    // where it is; LX, LZ: the lamp on it; BEDR: the bed, HEAD the head end of its mattress, WALL the wall behind your head).
    // The mattress's top is drawn whole, just before the covers (MATTRESS, between them and BED): left to itself it was cut
    // into pieces each sorted where it is, and the pieces nearer than the covers were drawn over them as they came up.
    const NS = parts.nightstand, LX = parts.lamp[0], LZ = parts.lamp[2], BEDR = parts.bed, HEAD = BEDR.z0, WALL = parts.headWall;
    const BED = 1.7, MATTRESS = 1.66, within = (p, x0, x1, z0, z1) => p.kind === 'poly' && p.pts.every(v => v[0] >= x0 && v[0] <= x1 && v[2] >= z0 && v[2] <= z1);
    for (const p of L.props) {
      if (p.sortDist !== undefined) continue;
      if (within(p, BEDR.x0, BEDR.x1, HEAD, BEDR.z1) && p.pts.every(v => v[1] === BEDR.top) && Math.min(...p.pts.map(v => v[2])) === HEAD) p.sortDist = MATTRESS;
      else if (within(p, NS.x0 - 0.01, NS.x1 + 0.01, NS.z0 - 0.01, NS.z1 + 0.01) || [-0.72, 0.72].some(x => within(p, x - 0.05, x + 0.05, HEAD + 0.05, HEAD + 0.15) || within(p, x - 0.05, x + 0.05, 1.8, 1.9))) p.sortDist = BED;
    }
    // (the lamp is drawn after the nightstand's top, which is drawn again over the drawer's bulb as it comes out: below)
    const lampArt = STORY.lamp(L, parts.lamp[0], parts.lamp[1], parts.lamp[2], { lit: () => shown(), opts: { sortDist: 0.95 } });
    // its cord (drawn every frame, below: CORD_LAMP) runs out of the lamp's base across the top, over its edge on the bed's
    // side and down into the gap between the nightstand and the bed, away under the bed to the wall on the other side
    // the wall socket, low on the wall behind the bed on the closet side (SOCK: how far along it): a pale plate with its
    // two slots
    const SOCK = -1.78;
    SC.wallV(L, SOCK - 0.05, WALL + 0.006, SOCK + 0.05, WALL + 0.006, 0.22, 0.36, [120, 114, 104], { sortDist: 1.9 });
    for (const x of [SOCK - 0.015, SOCK + 0.015]) SC.wallV(L, x - 0.007, WALL + 0.008, x + 0.007, WALL + 0.008, 0.26, 0.31, [22, 20, 20], { sortDist: 1.899 });
    const c0 = () => L.creatures[0];
    // The drawer, in the front of the nightstand, toward the foot of the bed, holds the bulb. It is built into the
    // nightstand (a container's card would turn with the view and stand out from it at an angle): opened, it slides out
    // toward the foot of the bed, beside the bed and never over it (DR.out), an open box (its front, its two sides, its
    // bottom, the dark of the nightstand behind), and the bulb lies in it on its bottom, under its rim, where you look
    // down into it over its side from the pillow.
    // DR: where it is in the nightstand's front (x0 to x1 across it, y0 to y1; zf: that front), how far it comes out and
    // how long that takes, its bottom, the thickness of its sides; `in`: where the bulb lies in it (across it from its
    // side nearer you, and how far behind its front: in the part that has come out, toward its far side, where its near
    // side does not hide it). It is held by the cap between finger and thumb, the glass up (js/hands.js)
    const DR = { x0: NS.drawer.x0, x1: NS.drawer.x1, y0: NS.drawer.y0, y1: NS.drawer.y1, zf: NS.z1, out: 0.3, dur: 0.4, floor: NS.drawer.y0 + 0.04, wall: 0.016, proud: 0.02 };
    const bulbs = [{ id: 'bulb', name: 'Bulb', in: [0.24, 0.14], opts: { w: 0.13, h: 0.16, icon: 'bulb', material: 'glass' } }];
    const DMID = (DR.x0 + DR.x1) / 2;
    // how far out it is now; and the drawer's target and the things still lying in it go with it
    const drawerOut = () => (drawer.open ? DR.out * smoothstep(clamp((L.t - drawer.openAt) / DR.dur, 0, 1)) : 0);
    const rideDrawer = () => {
      const out = drawerOut(), at = (x, y, z) => L.pt(x, y, z);
      const t = at(DMID, DR.y0 - 0.01, DR.zf + out * 0.5); drawer.x = t[0]; drawer.y = t[1]; drawer.z = t[2]; drawer.w = 0.42 + out * 0.3;
      for (const it of drawer.yielded) if (!it.taken && !it.left) { const q = at(DR.x0 + it.in[0], DR.floor + 0.004, DR.zf + out - it.in[1]); it.x = q[0]; it.y = q[1]; it.z = q[2]; }
      return out;
    };
    const drawer = mkTarget(L, {
      id: 'drawer', name: 'Drawer', x: DMID, y: DR.y0 - 0.01, z: DR.zf, w: 0.42, h: 0.18, open: false, yielded: [],
      hint() { return drawer.open ? 'Nothing else in it.' : 'The nightstand drawer.'; },
      onClick() {   // your hand opens it (js/hands.js); clicked again, it goes into it
        if (!drawer.open) {
          drawer.open = drawer.done = true; drawer.openAt = L.t; AUDIO.sfx('drawer'); // its own sound: not the creak that warns of the doorway, nor a creature's scratching
          for (const b of bulbs) drawer.yielded.push(Object.assign(mkItem(L, b.id, b.name, { x: DR.x0 + b.in[0], y: DR.floor + 0.004, z: DR.zf - b.in[1], flat: true, jitter: 0 }, b.opts), { in: b.in }));
          G.reach(drawer, 'pull');
          return true;
        }
        const left = drawer.yielded.some(i => !i.taken && !i.left); G.say(left ? 'Take what is in it.' : 'Nothing else in it.', left ? 'Something is still in it.' : 'Nothing more.');
        G.reach(drawer, { style: 'touch', at: [0, 0.8] });
        return true;
      },
    });
    // (for the night's test: the four corners of its open top, inside its rim, as it is now; its bottom's height; and the
    // whole of it, shut or open, x0, x1, z0, z1 in the room's own terms)
    drawer.rim = () => { const zo = DR.zf + drawerOut(); return [[DR.x0 + DR.wall, DR.zf], [DR.x0 + DR.wall, zo - DR.wall], [DR.x1 - DR.wall, zo - DR.wall], [DR.x1 - DR.wall, DR.zf]].map(([x, z]) => L.pt(x, DR.y1, z)); };
    drawer.floorY = DR.floor; drawer.out = drawerOut; drawer.box = () => [DR.x0 - 0.012, DR.x1 + 0.012, NS.z0, DR.zf + drawerOut() + DR.proud];
    const knob = SC.mkSprite(L, DMID, (DR.y0 + DR.y1) / 2 - 0.022, DR.zf + 0.032, 0.044, 0.044, (ctx, P) => { ctx.scale(0.044, 0.044); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([120, 112, 96])); P_ell(ctx, -0.1, 0.6, 0.3, 0.3, P.col([188, 180, 160])); }, { sortDist: 0.975 });
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
        s.clicks = 0; s.lampOn = true; s.wasLit = true; s.onAt = L.t + 0.3; s.lampT = 22 + L.rand() * 6; G.say('Light.', 'Light.');
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
    }, { sortDist: 0.949 });
    glowWith(lampT, [lampArt, lampDetail]);
    // on Nightmare the lamp's plug lies on the floor out from the wall socket, on the closet side, pulled out: beside
    // the bed, where you look down at it from the pillow
    const PLUG = [SOCK, 0.2];
    const socket = unplugged && mkTarget(L, {
      id: 'socket', name: 'Cord', x: SOCK + 0.2, y: 0.02, z: PLUG[1] + 0.02, w: 0.42, h: 0.32, flat: true,
      hint() { return s.plugged ? 'Plugged in.' : 'The lamp cord, out of its socket.'; },
      // your hand takes the plug up off the floor, carries it to the socket (the cord coming up off the boards after it)
      // and pushes it in: it clunks home as it gets there (s.plugAt: when the hand took hold of it)
      onClick() {
        if (s.plugged) return false;
        s.plugged = true; socket.hidden = true; G.say('Plugged in.', 'Click.');
        const r = G.reach(socket, { style: 'touch', onTouch: () => { s.plugAt = L.t; } });
        if (r) r.hold = PLUG_GO + 0.3; else s.plugAt = L.t - PLUG_GO;   // (no hand to show: it is in at once)
        return true;
      },
    });
    const PLUG_GO = 0.45;   // how long the hand takes to carry the plug to the socket
    const covers = mkTarget(L, {
      id: 'covers', name: 'Covers', x: 0, y: 0.6, z: 1.1, w: 1.4, h: 0.6, flat: true, hold: 3.0,
      hint() { return s.coversUp ? 'Up over you.' : 'The covers. Hold on to them until they are all the way up; they slip back if you let go too soon.'; },
      use(item) {
        if (item !== null) return false;
        if (s.fairy) { covers.done = false; covers.progress = 0; return true; }   // (it is waiting for its tooth: they are let be)
        if (!s.lampOn) { yank(); return true; }   // up in the dark: it is strong in the dark
        s.coversUp = true; AUDIO.sfx('hiss'); G.say('The covers are up.', 'Up.'); return true;
      },
    });
    L.isWon = () => (s.lampOn && s.coversUp) || (!!s.fairy && s.fairy.done);   // (or the tooth fairy has been, and gone)
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
      { apZ: 3.2, edge: 0.5, top: 2.2, peerD: 3.4, spot: { d: 1.04, lat: 1.35 }, hands: [[-0.64, 1.24], [-0.64, 1.72]], to: [[-0.38, 0.32], [-0.22, 0.72]], over: ['x', -0.79] },
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
      if (t >= T5 && !D.cued) { D.cued = true; AUDIO.sfx('cloth', panOf(c)); if (!L.won) G.say('Its hands are on the covers. Pull them up before they reach you.', 'Its hands are on the covers.'); }
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
        G.holding = null; c.deathSpec = Object.assign({}, c.CR.death, { delay: 0.05, sting: 'sting' }); die(c, 'grabbed');
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
      if (t >= 0.86 && G.state === 'play') { c.deathSpec = Object.assign({}, c.CR.death, { delay: 0.05, sting: 'sting' }); die(c, 'dark'); }   // at once: its hands at you, its face
    };
    // ---- the pillow, the tooth and the tooth fairy (the night's easter egg) ----
    // The pillow is a small one, on the bed between you and the headboard: the one thing in the room behind you, seen
    // only by looking right round and down. Clicked, your hand tips it up on its far edge, and there is a tooth on the
    // sheet under it. Taking the tooth stops the night where it is (fairyStart): whatever the thing was doing, it lets go
    // of it, and it is at the foot of the bed (unseen, as it nearly always is while you are turned to the pillow, it is
    // simply there; watched, it comes there on its feet, out through the middle of its opening first), bowed far in over
    // the bed toward you, one long arm held out, its hand open and palm up in front of you (FAIRY.hand: where, in the
    // room). And the night's bed of sound fades out and a deep, low rumbling swells up under everything in its place, in a
    // second (fairyRumble: it holds as long as it waits), but there is no heartbeat (the game's is by how near it is, against how
    // far it had to come: both are put out of reach, and kept in s.fairy.keep), not a breath from it, the lamp burns on
    // if it is on and stays out if it is out, the covers will not come up, and nothing can catch you. It waits as long as
    // you like. The tooth put down goes back under the pillow.
    // The tooth put in its hand (the hand is a target then: fairyGive) is the easter egg found, and the night's own end,
    // in seconds from then (FAIRY). The rumbling is cut dead that instant, and its head snaps down (a click of a joint)
    // to look at the tooth lying on its open palm, still held out to you over the bed; it looks at it a while (look), still,
    // in the silence. It straightens up and steps back from the bed (pull, to FAIRY.back), the hand coming with it to be
    // held in front of it (HOLD: across, how high, how far in front of its feet), the tooth on it still, its head still
    // bowed to it. Then it brings its two hands together round the tooth, cupped in front of its chest (cup: the tooth is
    // gone into them), and its eyes close (shut): their light goes out, and it stands there in the dark and the quiet.
    // Then all at once (burst) it throws its arms out wide, and a butterfly's wings burst open behind it in an instant,
    // overshooting and settling (the tall one's own, js/creatures/tall.js), with a bright rush of air and a shimmering
    // chord (wingBurst), a flash of their light, the view jolted; its head comes up and its eyes open, shimmering blue and
    // rose as its wings do. It holds there, wings spread and trembling; then one great beat of them (flap: swept shut,
    // and thrown open, with a whoosh), and as they sweep a cloud of fairy dust (dust) bursts up round it, dense enough at
    // its height (dense) that nothing of it shows through, and it is gone behind it (gone); the cloud thins and drifts
    // away (clear), sparks of gold and rose and blue that drift down and die away (DUST), and out of it a dollar bill
    // comes down like a leaf (bill, over fall seconds: swinging from side to side, tilting as it swings, turning over)
    // onto the bed in front of you (BILL), and lies there. A moment after it has landed (rest) the night is won, as any
    // night is. With motion reduced its head and arms move without the snap, the wings come up quickly but do not burst
    // or fan, the view is not jolted, the dust hardly spreads and the bill comes straight down; with flashes reduced
    // nothing flashes or twinkles.
    const KT = CREATURES.tall.SCALE, PIL = parts.pillow, B0 = BEDR.top, PILLOW = [110, 106, 112];
    const TOOTH = [0.02, PIL.z1 - 0.055];   // where the tooth lies (its near end): under the pillow, a little in from its near edge
    const FAIRY = { d: 2.1, back: 2.85, hand: [0.12, 1.0, 0.7], lift: 0.45, tilt: 1.15, look: 1.2, pull: [1.2, 2.8], cup: [2.9, 3.35], shut: [3.05, 3.25], burst: 4.85,
      flap: 5.7, sweep: 0.3, dust: 5.85, dense: 0.2, gone: [6.1, 6.22], clear: [6.45, 8.9], bill: 6.4, fall: 4.4, rest: 1.1, after: 1.4 };
    // (a snap: there in a frame or two, a little past, and back: a damped spring over u, at 1 by u 0.17 and 12% over at 0.35)
    const spring = u => (u <= 0 ? 0 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));
    const BILL = { w: 0.26, h: 0.11, to: [0.1, 1.5], yaw: 0.35 };   // the bill; where on the bed it comes to lie, and how it is turned
    const pillowUp = () => (s.pillowAt === null ? 0 : smoothstep((L.t - s.pillowAt) / FAIRY.lift));
    const pillowT = mkTarget(L, {
      id: 'pillow', name: 'Pillow', x: 0, y: PIL.y1, z: PIL.z1, w: PIL.x1 - PIL.x0, h: PIL.z1 - PIL.z0, flat: true,
      hint() { return 'The pillow.'; },
      onClick() {   // your hand tips it up (js/hands.js), and the tooth is there
        if (s.pillowAt !== null || G.state !== 'play') return false;
        s.pillowAt = L.t; AUDIO.sfx('pat'); G.reach(pillowT, 'pull');
        mkItem(L, 'tooth', 'Tooth', { x: TOOTH[0], y: B0 + 0.004, z: TOOTH[1], flat: true, jitter: 0 }, { w: 0.05, h: 0.055, icon: 'tooth' });
        G.say('There is a tooth under it.', 'A tooth.');
        return true;
      },
    });
    Object.defineProperty(pillowT, 'hidden', { get: () => s.pillowAt !== null });   // (once it is up there is no more to do with it)
    pillowT.pil = PIL; pillowT.head = HEAD;   // (for the night's test: how big it is, and where the head of the bed is)
    // a thing taken is no longer the drawer's to carry; the tooth taken is the tooth fairy's cue, and put down again it
    // goes back where it was
    L.onPickup = it => { it.left = true; if (it.id === 'tooth') fairyStart(); };
    L.onDrop = it => { if (it.id !== 'tooth') return; const q = L.pt(TOOTH[0], B0 + 0.004, TOOTH[1]); it.x = q[0]; it.y = q[1]; it.z = q[2]; it.flat = true; G.say('The tooth goes back under the pillow.', 'Back under the pillow.'); };
    L.onCatch = () => !!s.fairy;   // (it cannot catch you once the tooth is taken)
    L.watchPoint = () => (s.fairy && s.fairy.done ? { x: BILL.to[0], y: B0 + 0.05, z: BILL.to[1], zoom: 1.5 } : null);   // the night won by it: the view goes to the bill on the bed
    // its open hand, held out: a target while it waits, and it takes only the tooth
    const HP = FAIRY.hand;
    const fairyWaits = () => !!s.fairy && s.fairy.stage === 'wait' && c0().fairy.offer > 0.9 && G.state === 'play';
    const handT = mkTarget(L, {
      id: 'hand', name: 'Its hand', x: HP[0], y: HP[1] - 0.17, z: HP[2], w: 0.3, h: 0.3, accepts: ['tooth'],
      hint() { return 'It is holding out its hand.'; },
      use(item) { if (item.id !== 'tooth' || !fairyWaits()) return false; fairyGive(); return true; },
    });
    Object.defineProperty(handT, 'hidden', { get: () => !fairyWaits() });
    // where that hand is seen in the plane the thing stands in, about its feet, and how many times nearer you it is than
    // its feet are (the tall one's c.fairy.hand and handK): held out over the bed, or (held, 0..1) brought back to be held
    // in front of it as it straightens (HOLD, from where it stands)
    const HOLD = [0.3, 1.1, 0.45];
    const handAt = (c, held) => {
      const p = c.pos(), r = Math.hypot(p.x, p.z) || 1, ux = p.x / r, uz = p.z / r;
      const H = [lerp(HP[0], p.x + HOLD[0] * uz - HOLD[2] * ux, held), lerp(HP[1], HOLD[1], held), lerp(HP[2], p.z - HOLD[0] * ux - HOLD[2] * uz, held)], k = r / Math.max(0.3, H[0] * ux + H[2] * uz);
      return { at: [((H[0] * k - p.x) * uz - (H[2] * k - p.z) * ux) / KT, (L.eyeH + (H[1] - L.eyeH) * k - p.y - (c.yOff || 0)) / KT], k };
    };
    const fairyStart = () => {
      if (s.fairy) return;
      const c = c0();
      s.fairy = { t0: L.t, stage: 'come', given: null, done: false, way: null, i: 0, dust: null, at: null, keep: { D0: c.D0, catchDist: c.catchDist } };
      s.mode = 'fairy'; s.grab = null; s.jerk = 0; s.duck = null; s.switched = true; s.thumps = null; s.yank = null; s.yankK = 0; s.cross = null;
      G.holding = null; stopWalking(c); hold(c, c.dist);
      AUDIO.stopAmbient(1.5); AUDIO.sfx('fairyRumble');   // the night's sound gone, and the rumbling coming up in its place
      c.D0 = -2000; c.catchDist = -1000;   // (and no heartbeat, wherever it is: the game's goes by how far along its way it is, between where it started and where it would have you, and both are put out of all reach)
      c.fairy = { lean: 0, offer: 0, held: 0, hand: null, handK: 1, tooth: false, wings: 0, beat: 1, gone: 0, t: L.t, look: 0, cup: 0, fling: 0, pop: 1, eyes: 1, shimmer: 0, flash: 0 };
    };
    // its way to the foot of the bed from wherever it is, watched (points in the room): out through the middle of its
    // opening first (route, as ever), and round the corner of the bed's foot from the closet's side
    const fairyWay = c => {
      const foot = toFrame(c.lane, 0, FAIRY.d);
      const pts = route(c, { d: c.dist, lat: c.lat }, { d: foot[0], lat: foot[1] }).pts.slice(1, -1).map(q => { const p = APPROACH.position(c.lane, q.d, q.lat, L.eyeH); return [p.x, p.z]; });
      const a = pts.length ? pts[pts.length - 1] : [c.pos().x, c.pos().z];
      if (a[0] < -0.85 && a[1] < 2.25) pts.push([-1.2, 2.4]);
      pts.push([0, FAIRY.d]);
      return pts;
    };
    // it is at the foot of the bed, bowed in, its hand out: all at once (nobody is looking)
    const fairySnap = c => {
      if (c.lane.idx !== 0) reframe(c, L.lanes[0]);
      c.walk = null; c.feet = undefined; hold(c, FAIRY.d); c.dist = FAIRY.d; c.runLat = c.lat = 0;
      c.duck = c.flinch = c.reach = c.peer = 0; c.faceAway = 0;
      c.fairy.lean = c.fairy.offer = 1; s.fairy.stage = 'wait';
    };
    const fairyGive = () => {
      const X = s.fairy;
      X.stage = 'take'; X.given = L.t; c0().fairy.tooth = true; c0().walk = null;
      AUDIO.stopLoop(0); AUDIO.sfx('neckClick', panOf(c0()));   // the rumbling cut dead; its head snaps down to the tooth
      X.first = foundEgg(undefined, true);   // the night's easter egg, found as the tooth is handed over (kept in the save: game.js); said once it has gone (fairying), not into this hush
      L.text.win = L.text.fairy;   // and the night's card, when it has gone, is the tooth fairy's
    };
    const fairying = (c, dt) => {
      const X = s.fairy, T = c.fairy, S = SAVE.data.settings, rm = S.reducedMotion;
      c.voiceT = 9;   // (not a breath out of it)
      T.t = L.t; T.still = rm; T.steady = S.reducedFlash; c.gripY = (c.hideBelow === undefined ? 0.6 : c.hideBelow) - 0.03;
      if (X.stage === 'come') {
        // with your eyes off it and off the foot of the bed (looking round at the pillow) it is simply there; watched, it
        // comes there on its feet, at its own slow pace, upright
        if (L.visFrac(c) < 0.02 && Math.abs(wrapPi(G.cam.yaw - L.facing)) > 72 * DEG) fairySnap(c);
        else {
          c.flinch = Math.max(0, (c.flinch || 0) - dt * 2); c.reach = Math.max(0, (c.reach || 0) - dt * 4); c.duck = Math.max(0, (c.duck || 0) - dt * 0.8); c.peer = Math.max(0, (c.peer || 0) - dt * 0.8); c.faceAway = 0;
          if (!X.way) { X.way = fairyWay(c); X.i = 0; c.walk = null; }
          if (c.lane.idx !== 0 && c.dist < way(c).apZ - OUT + 0.02) reframe(c, L.lanes[0]);   // out in the room: counted along the doorway's way from here
          const last = X.i >= X.way.length - 1, [d, lat] = toFrame(c.lane, X.way[X.i][0], X.way[X.i][1]), w = c.CR.pace(c, dt, d, lat);
          hold(c, stepsOf(c, w));
          if (Math.hypot(w.d - d, w.lat - lat) < (last ? 0.04 : 0.2)) { if (last) X.stage = 'wait'; else X.i++; }
        }
      } else if (X.stage === 'wait') {
        c.duck = c.flinch = c.reach = c.peer = 0;
        T.lean = Math.min(1, T.lean + dt / 1.3); if (T.lean > 0.5) T.offer = Math.min(1, T.offer + dt / 0.9);
      } else {
        // the tooth in its hand (FAIRY, above): it looks down at it; straightens and steps back; cups it in its hands and
        // shuts its eyes; then its arms flung wide and its wings burst open, its eyes open shimmering; it holds, trembling;
        // one great beat of its wings, and it is gone in its dust
        const q = L.t - X.given, F = FAIRY, qb = q - F.burst, qs = qb + 0.02;   // (qs: so the frame it bursts in already shows them)
        const pull = smoothstep((q - F.pull[0]) / (F.pull[1] - F.pull[0]));
        T.lean = 1 - pull; T.held = pull;
        if (q >= F.pull[0] && T.gone < 1) hold(c, stepsOf(c, c.CR.pace(c, dt, F.back, 0)));
        // its head: snapped down to the tooth at once; snapped up to you at the burst
        T.look = qb < 0 ? (rm ? smoothstep(q / 0.15) : spring(q / 0.2)) : 1 - (rm ? smoothstep(qb / 0.15) : spring(qb / 0.2));
        // its hands together round it (the held-out arm coming in, the tooth gone into them as they close), its eyes shut
        const cup = smoothstep((q - F.cup[0]) / (F.cup[1] - F.cup[0]));
        T.fling = qb < 0 ? 0 : rm ? smoothstep(qb / 0.3) : spring(qs / 0.4);
        T.cup = cup * clamp(1 - T.fling * 1.5, 0, 1); T.offer = 1 - smoothstep(cup / 0.7); T.tooth = cup < 0.7;   // (the cup gone as its hands are flung out)
        T.eyes = qb < 0 ? 1 - smoothstep((q - F.shut[0]) / (F.shut[1] - F.shut[0])) : rm ? smoothstep(qb / 0.3) : clamp(spring(qs / 0.25), 0, 1.15);
        T.shimmer = qb < 0 ? 0 : 1;
        // its wings: burst open (well inside a quarter of a second, a little past and back), trembling, one great beat
        T.wings = qb < 0 ? 0 : rm ? smoothstep(qb / 0.3) : clamp(spring(qs / 0.4) * 1.6, 0, 1);
        T.pop = qb < 0 || rm ? 1 : lerp(0.55, 1, clamp(spring(qs / 0.4), 0, 1.15));
        T.flash = qb < 0 || S.reducedFlash ? 0 : Math.exp(-qb / 0.16);
        const shiver = rm || qb < 0.3 ? 0 : 0.045 * Math.sin(qb * 47) * Math.sin(qb * 13 + 0.7);
        const shut = smoothstep((q - F.flap) / F.sweep), open = smoothstep((q - F.flap - F.sweep) / 0.12);
        T.beat = rm ? 1 : lerp(lerp(1 + shiver, 0.12, shut), 1.35, open);
        T.gone = smoothstep((q - F.gone[0]) / (F.gone[1] - F.gone[0]));
        if (qb >= 0 && !X.burst) { X.burst = true; AUDIO.sfx('wingBurst', panOf(c)); if (!rm) G.shake(0.3); }
        if (q >= F.flap && !X.whoosh) { X.whoosh = true; AUDIO.sfx('wingWhoosh', panOf(c)); }
        if (q >= F.dust && !X.dust) { const p = c.pos(); X.dust = L.t; X.at = { x: p.x, z: p.z }; AUDIO.sfx('fairyDust', panOf(c)); if (!rm) G.shake(0.08); }
        if (q >= F.clear[0] && X.first && !X.said) { X.said = true; secretSay(L.def.id); }   // gone, its dust thinning and the dollar coming down: now the note that this was a secret, and its two notes
        if (q >= F.bill + F.fall + F.rest) X.done = true;
      }
      const h = handAt(c, T.held || 0); T.hand = h.at; T.handK = h.k;
    };
    // the light of its wings, and of its dust after it: where, and how much (0..1), or nothing; and the flash of them as
    // they burst open (flash: 0..1)
    const fairyGlow = () => {
      const X = s.fairy, c = c0();
      if (!X || X.given === null || !c.fairy) return null;
      const k = Math.max((c.fairy.wings || 0) * (1 - (c.fairy.gone || 0)), X.dust ? 1 - smoothstep((L.t - X.dust - 0.8) / 3.2) : 0), flash = c.fairy.flash || 0;
      if (k <= 0.01 && flash <= 0.01) return null;
      const p = X.at || c.pos();
      return { x: p.x, z: p.z, k, flash };
    };
    // The cloud of its dust as its wings beat, qd seconds after it burst up (the tall one's own: dustCloud), in the
    // night's time: thick by FAIRY.dense, and clearing over FAIRY.clear
    const CLOUD_T = { dense: FAIRY.dense, clear: [FAIRY.clear[0] - FAIRY.dust, FAIRY.clear[1] - FAIRY.dust] };
    const drawCloud = (ctx, qd, rm, steady) => CREATURES.tall.dustCloud(ctx, qd, rm, steady, CLOUD_T);
    // the fairy dust: each spark where it starts in the cloud (about where it stood, metres), the way it is thrown, how
    // it twinkles, its size, how long it lasts and its colour; made once
    const DUST_LIFE = 5.4;
    const DUST = (() => {
      const rnd = mulberry32(1207), cols = [[255, 236, 170], [255, 176, 214], [156, 222, 255], [255, 255, 255], [190, 255, 220]], out = [];
      for (let i = 0; i < 96; i++) {
        const a = rnd() * TAU, r = Math.pow(rnd(), 0.7), wide = rnd() < 0.6;
        out.push({ x: Math.cos(a) * r * (wide ? 1.35 : 0.35), y: 1.45 + Math.sin(a) * r * (wide ? 0.95 : 0.75), vx: Math.cos(a) * (0.25 + 0.6 * rnd()), vy: Math.sin(a) * (0.2 + 0.4 * rnd()) + 0.15, ph: rnd() * TAU, rate: 3 + rnd() * 5, r: 0.012 + 0.02 * rnd() * rnd(), life: 2.6 + (DUST_LIFE - 2.6) * rnd(), col: cols[Math.floor(rnd() * cols.length)] });
      }
      return out;
    })();
    const drawDust = (ctx, q, rm, steady) => {
      const e = (1 - Math.exp(-q * 2.4)) * (rm ? 0.4 : 1);
      for (const d of DUST) {
        if (q > d.life) continue;
        const x = d.x + d.vx * e + (rm ? 0 : 0.07 * Math.sin(q * 1.3 + d.ph)), y = d.y + d.vy * e - 0.1 * q - 0.022 * q * q;
        if (y < 0.02) continue;
        const a = smoothstep(q / 0.18) * (1 - smoothstep((q - d.life * 0.45) / (d.life * 0.55))) * (steady ? 0.7 : 0.5 + 0.5 * Math.sin(q * d.rate + d.ph));
        if (a < 0.02) continue;
        P_ell(ctx, x, y, d.r * 2.4, d.r * 2.4, rgba(d.col, a * 0.22)); P_ell(ctx, x, y, d.r, d.r, rgba(d.col, a));
        if (d.r > 0.02) { ctx.strokeStyle = rgba([255, 255, 255], a * 0.8); ctx.lineWidth = 0.006; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - d.r * 3, y); ctx.lineTo(x + d.r * 3, y); ctx.moveTo(x, y - d.r * 3); ctx.lineTo(x, y + d.r * 3); ctx.stroke(); }
      }
    };
    // the dollar bill, in a box one across and one up: green, a paler border, the oval and the head in it, a seal either
    // side, a 1 in each corner. Its own colours, in any light (it is the fairy's)
    const drawBill = ctx => {
      P_rect(ctx, -0.5, 0, 1, 1, rgba([104, 138, 100])); P_rect(ctx, -0.46, 0.09, 0.92, 0.82, rgba([150, 180, 138])); P_rect(ctx, -0.43, 0.15, 0.86, 0.7, rgba([116, 150, 110]));
      P_ell(ctx, 0, 0.5, 0.15, 0.34, rgba([84, 116, 84])); P_ell(ctx, 0, 0.52, 0.09, 0.22, rgba([146, 174, 134]));
      P_ell(ctx, -0.3, 0.5, 0.07, 0.19, rgba([70, 96, 72])); P_ell(ctx, 0.3, 0.5, 0.07, 0.19, rgba([92, 130, 96]));
      for (const [x, y] of [[-0.4, 0.22], [0.4, 0.22], [-0.4, 0.78], [0.4, 0.78]]) P_rect(ctx, x - 0.012, y - 0.07, 0.024, 0.14, rgba([206, 224, 190]));
    };
    // what is drawn of all that each frame, after the bed (topAt: how high the bed's top is at a place on it): the dust,
    // where it stood; and the bill, coming down through it and out over the bed, then lying on the covers
    const fairyDraw = topAt => {
      const X = s.fairy;
      if (!X || !X.dust) return;
      const S = SAVE.data.settings, rm = S.reducedMotion, q = L.t - X.dust, at = X.at;
      if (q < DUST_LIFE) R.add({ kind: 'sprite', x: at.x, y: 0, z: at.z, w: 7, h: 4.2, noLight: true, sortDist: Math.hypot(at.x, at.z) - 0.06, draw: ctx => { drawCloud(ctx, q, rm, S.reducedFlash); drawDust(ctx, q, rm, S.reducedFlash); } });
      const qb = L.t - X.given - FAIRY.bill;
      if (qb < 0) return;
      const u = clamp(qb / FAIRY.fall, 0, 1), [bx, bz] = BILL.to, by = Math.max(B0, topAt(bx, bz)) + 0.012;
      if (u >= 1) {   // on the bed: lying on the covers, a little askew
        R.add({ kind: 'sprite', flat: true, face: L.facing + BILL.yaw, x: bx - Math.sin(BILL.yaw) * BILL.h / 2, y: by, z: bz - Math.cos(BILL.yaw) * BILL.h / 2, w: BILL.w, h: BILL.h, noLight: true, sortDist: 1.0, draw: ctx => { ctx.scale(BILL.w, BILL.h); drawBill(ctx); } });
        return;
      }
      // falling: a swing from side to side, slower and narrower as it comes down, the bill tipped the way it is sliding
      // and turning over as it goes; at the last it flattens onto the covers
      const ph = qb * 2.3, sw = rm ? 0 : 0.34 * (1 - 0.55 * u), land = smoothstep((u - 0.86) / 0.14);
      const x = lerp(at.x, bx, smoothstep(u)) + Math.sin(ph) * sw * (1 - land), z = lerp(at.z - 0.5, bz, smoothstep(u));
      const y = lerp(2.0, by, Math.pow(u, 0.9)) + (rm ? 0 : 0.07 * (1 - u) * Math.cos(2 * ph));
      const tilt = lerp(rm ? 0.2 : -0.75 * Math.cos(ph), -BILL.yaw * 0.6, land), flip = lerp(rm ? 0.8 : 0.35 + 0.65 * Math.abs(Math.cos(ph * 0.5 + 0.6)), 0.42, land);
      R.add({ kind: 'sprite', x, y: y - 0.2, z, w: 0.4, h: 0.4, noLight: true, sortDist: 1.0, draw: ctx => { ctx.translate(0, 0.2); ctx.rotate(tilt); ctx.scale(BILL.w, BILL.h * flip); ctx.translate(0, -0.5); drawBill(ctx); } });
    };
    const behave = (c, dt) => {
      if (s.mode === 'fairy') { fairying(c, dt); return; }   // the tooth taken: the night has stopped for it
      if (s.mode === 'yank') { yanking(c); return; }
      ready(c);   // it only peers, at first
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
      if (s.plugAt !== undefined && !s.plugHome && L.t - s.plugAt >= PLUG_GO) { s.plugHome = true; AUDIO.sfx('clunk', Math.sin(wrapPi(Math.atan2(SOCK, WALL) - G.cam.yaw)) * 0.7); }   // (home in the socket)
      c.unseenMult = Math.min(c.unseenMult, 2.5); // this night already charges a lot for looking away; the tiers do not stack on top
      if (s.fairy && G.holding === covers) { G.holding = null; G.say('Not now. It is waiting.', 'Not now.'); }
      if (s.lampOn && !L.won && !s.fairy) { s.lampT -= dt; if (s.lampT <= 0) { s.lampOn = false; AUDIO.sfx('flicker'); G.say('The lamp goes out.', 'Dark.'); } }
      c.inLight = s.lampOn;
      behave(c, dt);
      thumping();
      if (L.won) { s.tick -= dt; if (s.tick <= 0) { s.tick = 1.0; AUDIO.sfx('tick', Math.sin(wrapPi(-Math.PI / 4 - G.cam.yaw)) * 0.7, true); } } // the clock is on the dresser to the north-west, whichever way you face
    };
    // The lamp's cord: a pale round cloth flex, so it shows on the dark boards, soft and slack, a smooth curve through a
    // few points as the payphone's handset cord is (night 9), never laid flat along the wall or the floor. Out of the
    // lamp's base it runs across the nightstand's top, over its edge on the bed's side and droops down into the gap beside
    // the bed to the floor (CORD_LAMP), and goes away under the bed; on the other side it comes out from under the bed in
    // a loose loop over the boards to the plug (CORD_OUT: lying out from the wall, its pins toward the socket), or, plugged
    // in, it hangs out of the back of the plug in the socket in a soft arc down to the floor (CORD_IN), and in between it
    // comes up off the boards after the plug in your hand. Each is drawn in short lengths, so each is as thick as it is
    // near, with a pale sheen along its top. The part on the nightstand's top is drawn after that top (and before the lamp,
    // whose base it goes into); the rest with the things beside and under the bed, before the bed, which hides what of it
    // is behind it.
    const CORD = [92, 86, 78], SHEEN = [150, 142, 128], CORD_W = 0.0065;
    const spline = ctrl => {   // a point every centimetre or so along a smooth curve through ctrl
      const pts = [];
      for (let i = 0; i < ctrl.length - 1; i++) {
        const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
        const n = Math.max(3, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]) / 0.012));
        for (let k = i ? 1 : 0; k <= n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; pts.push([0, 1, 2].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
      }
      return pts;
    };
    // (sd: where a point of it is drawn in the order of things)
    const flex = (pts, sd) => {
      let run = [], at = null;
      const flush = () => {
        if (run.length >= 2) {
          const w = run.map(p => L.pt(p[0], p[1], p[2])), hi = run.map(p => L.pt(p[0], p[1] + CORD_W * 0.3, p[2]));
          R.add({ kind: 'poly', pts: w, color: CORD, stroke: true, lw: CORD_W, sortDist: at });
          R.add({ kind: 'poly', pts: hi, color: SHEEN, stroke: true, lw: CORD_W * 0.3, sortDist: at - 0.00002 });
        }
        run = run.length ? [run[run.length - 1]] : [];
      };
      for (const p of pts) {
        const d = sd(p);
        if (at !== null && d !== at) { run.push(p); flush(); }
        at = d; run.push(p);
        if (run.length >= 6) flush();
      }
      flush();
    };
    const UNDER = 1.69;   // (after the nightstand and the bed's legs, before the mattress and the covers)
    const lampSd = p => (p[0] >= NS.x0 - 0.004 && p[1] > NS.top - 0.01 ? 0.96 : UNDER);
    const CORD_LAMP = spline([[LX - 0.035, NS.top + 0.004, LZ - 0.03], [LX - 0.1, NS.top + 0.004, LZ - 0.07], [NS.x0 + 0.06, NS.top + 0.004, NS.z0 + 0.1], [NS.x0 + 0.005, NS.top + 0.001, NS.z0 + 0.09],
      [NS.x0 - 0.04, NS.top - 0.07, NS.z0 + 0.1], [NS.x0 - 0.1, 0.3, NS.z0 + 0.15], [NS.x0 - 0.12, 0.006, NS.z0 + 0.24], [0.6, 0.004, NS.z0 + 0.3], [0.3, 0.004, -0.2]]);
    // the plug: a small pale block, its two brass pins out of its front (at: the middle of its front face; it lies with
    // its pins toward the wall, and in the socket only its body shows, out of the wall), and the cord out of its back
    const PLUG_L = 0.07, PLUG_W = 0.05, PLUG_T = 0.028;
    const plugAt = [SOCK + 0.04, PLUG_T / 2, 0.16], socketAt = [SOCK, 0.29, WALL + 0.003];
    const drawPlug = (f, pins) => {
      const [x, y, z] = f, b = z + PLUG_L, hw = PLUG_W / 2, ht = PLUG_T / 2, sd = UNDER - 0.004;
      const q = (a, b2, c, d, col, k) => R.add(SC.mkQuad(L, a, b2, c, d, col, { sortDist: sd - k * 0.0005 }));
      q([x - hw, y + ht, z], [x + hw, y + ht, z], [x + hw, y + ht, b], [x - hw, y + ht, b], [150, 144, 134], 2);       // its top
      q([x + hw, y - ht, b], [x + hw, y - ht, z], [x + hw, y + ht, z], [x + hw, y + ht, b], [112, 106, 98], 1);       // its side, toward the bed
      const ez = L.eye ? L.eye.z || 0 : 0;   // (its back, or its front, whichever faces you)
      if (ez > b) q([x - hw, y - ht, b], [x + hw, y - ht, b], [x + hw, y + ht, b], [x - hw, y + ht, b], [124, 118, 108], 1);
      else if (ez < z) q([x - hw, y - ht, z], [x + hw, y - ht, z], [x + hw, y + ht, z], [x - hw, y + ht, z], [124, 118, 108], 1);
      if (pins) for (const dx of [-0.013, 0.013]) q([x + dx - 0.004, y, z], [x + dx + 0.004, y, z], [x + dx + 0.004, y, z - 0.03], [x + dx - 0.004, y, z - 0.03], [176, 150, 84], 3);
    };
    // the cord from the back of the plug (wherever it is: b) to under the bed: lying out over the boards (k 0), hanging out
    // of the socket (k 1), the points of one eased into the other's as it is carried
    const cordFrom = (b, k) => {
      const OUT = [[b[0], b[1], b[2]], [b[0] - 0.01, 0.006, b[2] + 0.1], [SOCK + 0.06, 0.004, 0.5], [-1.5, 0.004, 0.56], [-1.3, 0.004, 0.36], [-1.02, 0.004, 0.12], [-0.5, 0.004, 0.02]];
      const IN = [[b[0], b[1], b[2]], [b[0] + 0.01, b[1] - 0.14, b[2] + 0.08], [SOCK + 0.1, 0.012, WALL + 0.3], [SOCK + 0.32, 0.004, WALL + 0.42], [-1.25, 0.004, -0.06], [-1.0, 0.004, -0.06], [-0.5, 0.004, -0.06]];
      return spline(OUT.map((p, i) => i ? p.map((v, j) => lerp(v, IN[i][j], k)) : p));
    };
    // the covers: kicked down to the foot of the bed, and drawn up over you as you pull, the sheet turned down along the top
    const COV = 1.62, X = 0.77, BLANKET = [80, 84, 108], SHEET = [132, 128, 134], CREASE = [70, 74, 97], MATTRESS_TOP = [66, 62, 70];
    // (pulled up in the dark, they are ripped back down off you to the foot of the bed)
    // (and its pulls at them jerk them back toward it)
    const coversAt = () => { const p = s.yank ? 1 - (s.yankK || 0) : s.coversUp ? 1 : (covers.progress || 0); return { p, zE: lerp(1.22, 0.1, p) + (L.won ? 0 : (s.jerk || 0) * 0.05), yE: lerp(0.64, 0.84, p), roll: lerp(0.06, 0.025, p) }; };
    L.dynamic = () => {
      ready(c0());   // (on the night's card too)
      flex(CORD_LAMP, lampSd);
      {
        // where the plug is: on the floor; carried up to the socket in your hand (in an arc, lifted clear of the boards,
        // the hand on it); home in the socket. k: how far it has gone
        const k = !s.plugged ? 0 : s.plugAt === undefined ? (G.hand.reach && G.hand.reach.target === socket ? 0 : 1) : smoothstep(clamp((L.t - s.plugAt) / PLUG_GO, 0, 1));
        const f = plugAt.map((v, j) => lerp(v, socketAt[j], k)); f[1] += Math.sin(Math.PI * k) * 0.12;
        const r = G.hand.reach;
        if (r && r.target === socket) { const p = L.pt(f[0] + 0.01, f[1] + PLUG_T, f[2] + PLUG_L * 0.6); r.at = { x: p[0], y: p[1], z: p[2] }; }   // (the hand goes with it)
        if (!s.plugged) R.glowAs(socket);   // the cord and the plug on the floor: pointed at, they glow
        flex(cordFrom([f[0], f[1], f[2] + PLUG_L], k), () => UNDER);
        drawPlug(f, k < 0.98);
        R.glowAs(null);
      }
      // the drawer. Shut, only its front shows: a board a little proud of the nightstand's front and a little wider than
      // the opening, its knob in the middle. Open, it is a box slid out on its runners toward the foot of the bed, beside
      // it: the dark of the nightstand behind it, its bottom, its far side and the inside of its front; then what lies in
      // it (drawn where it is); then its near side, over them. (You look down into it over its near side, from the pillow;
      // it is beyond the edge of the bed, so none of it is ever over the bed.) Its front's outside and its knob are seen
      // while you are on that side of it: once it has come out past you, they are behind it
      const out = rideDrawer(), zo = DR.zf + out, W = DR.wall, T = DR.proud, WOOD = [66, 50, 38], FRONT = [84, 64, 48], RIM = [84, 64, 50];
      const dw = (x0, z0, x1, z1, y0, y1, col, sd) => R.add(SC.mkWallV(L, x0, z0, x1, z1, y0, y1, col, { sortDist: sd }));
      const lid = (x0, x1, za, zb, y, col, sd) => R.add(SC.mkQuad(L, [x0, y, za], [x1, y, za], [x1, y, zb], [x0, y, zb], col, { sortDist: sd }));
      const fx0 = DR.x0 - 0.012, fx1 = DR.x1 + 0.012, fy0 = DR.y0 - 0.01, fy1 = DR.y1 + 0.01, outside = zo + T < (L.eye ? L.eye.z || 0 : 0) - 0.01;
      R.glowAs(drawer);
      if (out > 0.004) {
        dw(DR.x0, DR.zf + 0.002, DR.x1, DR.zf + 0.002, DR.y0, DR.y1, [9, 8, 8], 1.5);                   // the hole it came out of
        lid(DR.x0 + W, DR.x1 - W, DR.zf, zo, DR.floor, [38, 29, 23], 1.49);                           // its bottom
        dw(DR.x1 - W, DR.zf, DR.x1 - W, zo, DR.floor, DR.y1, [50, 38, 30], 1.48);                     // its far side, from inside
        lid(DR.x1 - W, DR.x1, DR.zf, zo, DR.y1, RIM, 1.475);                                           // and its top edge
        dw(DR.x0, zo, DR.x1, zo, DR.floor, DR.y1, [50, 38, 30], 1.46);                                 // its front, from inside
        dw(DR.x0, DR.zf, DR.x0, zo, DR.y0, DR.y1, scalec(WOOD, 0.8), 0.9);                             // its near side, from outside
        lid(DR.x0, DR.x0 + W, DR.zf, zo, DR.y1, RIM, 0.89);
        // The nightstand's top, again, over what is in the drawer: the bulb lies in it as a card, which is drawn where it
        // is in the order of things, after the nightstand, so as the drawer began to come out the bulb was drawn whole on
        // top of the nightstand, still under it. The top is drawn again after it (and the drawer's front after that), so
        // whatever of the bulb is still in under the top is hidden by it until the drawer carries it out. (Your eye is
        // above the top, so nothing under it, in the drawer or out of it, is ever in front of it; and the lamp and its cord
        // are drawn after it, on it.)
        lid(NS.x0, NS.x1, NS.z0, NS.z1, NS.top, scalec([50, 38, 30], 1.08), 1.0);
      }
      dw(fx0, zo + T, fx1, zo + T, fy0, fy1, FRONT, outside ? 0.985 : 1.465);                          // its front: the outside of it (after the bulb, which is behind it),
      lid(fx0, fx1, zo, zo + T, fy1, scalec(FRONT, 1.15), 0.98);                                       // its top edge,
      dw(fx0, zo, fx0, zo + T, fy0, fy1, scalec(FRONT, 0.85), 0.98);                                   // and its end
      if (outside) { const kp = L.pt(DMID, 0, zo + T + 0.012); knob.x = kp[0]; knob.z = kp[2]; R.add(knob); }
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
      // the pillow, behind you: a plump one lying on the sheet against the headboard; lifted, it is tipped up on its far
      // edge (and its shadow under it), and the tooth is on the sheet under where it lay. (at: a point of it, u along it
      // from its far edge and v up through it.) It is soft (STORY.pillowFaces: the morning's is the same). It is drawn
      // after the tooth, which it may hide a part of
      {
        const k = pillowUp(), a = FAIRY.tilt * k, t = PIL.y1 - PIL.y0, len = PIL.z1 - PIL.z0, cs = Math.cos(a), sn = Math.sin(a), zH = PIL.z0 + t * sn;
        const at = (x, u, v) => [x, B0 + u * sn + v * cs, zH + u * cs - v * sn];
        const pq = (a2, b2, c2, d2, col, sd, alpha) => R.add(SC.mkQuad(L, a2, b2, c2, d2, col, alpha === undefined ? { sortDist: sd } : { sortDist: sd, alpha }));
        if (k > 0.02) pq([PIL.x0, B0 + 0.003, zH], [PIL.x1, B0 + 0.003, zH], [PIL.x1, B0 + 0.003, PIL.z1 + 0.02], [PIL.x0, B0 + 0.003, PIL.z1 + 0.02], [16, 14, 20], 0.34, 0.45 * k);
        R.glowAs(pillowT);
        // (tipped up past your line of sight, it is its underside that faces you, over the rest of it)
        const ue = L.eye || { x: 0, y: 0, z: 0 }, mid = at(0, len / 2, 0), under = k > 0.02 && (L.eyeH + (ue.y || 0) - mid[1]) * -cs + ((ue.z || 0) - mid[2]) * sn > 0;
        for (const f of STORY.pillowFaces(PIL, at, PILLOW, k, under)) pq(f.pts[0], f.pts[1], f.pts[2], f.pts[3], f.color, f.sd);
        R.glowAs(null);
      }
      // How low it must be to be out of sight behind the bed, where it is: the height of your line of sight there over the
      // bed's top where it leaves the bed (or over the covers' turned-down edge, if it is beyond that). That is only where
      // it goes down to: what is drawn of it is hidden by the bed itself, drawn over it (below).
      const c = c0(), cp = c.pos(), lp = rotY(cp.x, cp.z, -L.facing), lx = lp[0], lz = lp[1];
      const tb = Math.min(1, lx > 0 ? 0.75 / lx : lx < 0 ? -0.75 / lx : Infinity, lz > 0 ? 1.9 / lz : lz < 0 ? HEAD / lz : Infinity);
      let hide = tb >= 1 ? Math.max(0.6, lz >= zF ? H(lx, lz) : lz >= zE ? up(lx, yE) + th(lx) : 0.6) : L.eyeH - (L.eyeH - 0.6) / tb;
      if (lz > zE && Math.abs(lx * zE / lz) < X) hide = Math.max(hide, L.eyeH - (L.eyeH - (up(lx * zE / lz, yE) + th(lx * zE / lz))) * lz / zE);
      c.hideBelow = hide;
      const topAt = (x, z) => (Math.abs(x) > X || z < HEAD || z > 1.92 ? -9 : z >= zF ? H(x, z) : z >= zE - 0.03 ? up(x, yE) + th(x) : B);
      // the wall either side of the opening, and over it, while it is still behind it; and coming through, it stoops
      // under the top of it
      const w = way(c), e = edgeAt(w, c.dist), behind = c.dist > w.apZ + 0.01;
      c.showX = behind ? [-e - c.lat, e - c.lat] : null;
      c.showTop = behind ? L.eyeH + (w.top - L.eyeH) * c.dist / w.apZ - cp.y - (c.yOff || 0) : undefined;
      c.headroom = L.won || G.state === 'dying' || (s.fairy && s.fairy.stage !== 'come') ? undefined : headroom(c) - cp.y - (c.yOff || 0);   // (going down, it is still under it: no pop up)
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
      // (its wings are far wider than it is, and a little taller)
      if (cr) { const wk = c.fairy && c.fairy.wings > 0; cr.w = wk ? 3.8 : c.CR.w; if (wk) cr.h = 2.6; }
      // its hands coming at you in its lunge: its arms on their own, over the bed (the rest of it behind the bed); and
      // the same bowed in over the bed with a hand held out for the tooth. They are drawn by its own picture's draw, so
      // with the same slow breath and sway the rest of it is drawn with, and they stay on its shoulders as it breathes
      c.armsApart = !!cr && (G.state === 'dying' ? !c.close : !!c.fairy && c.fairy.lean > 0);
      if (c.armsApart) R.add({ kind: 'sprite', x: cp.x, y: cp.y + (c.yOff || 0), z: cp.z, w: cr.w, h: cr.h, fogScale: cr.fogScale, sortDist: 0.2, draw: (ctx, P) => { c.part = 'arms'; try { cr.draw(ctx, P); } finally { c.part = null; } } });
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
      // What its hands lie on. The bed's own top is all steps (the mattress, the hem's edge, the roll of the sheet turned
      // down, the blanket beyond), and the hem jerks toward it with every pull: a hand by the edge of the covers was on
      // the cloth one frame and down on the mattress the next. So a hand lies on one smooth surface (restAt): the mattress,
      // rising to the top of the roll over the last of the way to the hem (onCloth: how far onto the cloth it is) and
      // easing down onto the blanket beyond it, measured from where the hem lies at rest (hemZ: the jerk of a pull is the
      // cloth moving in its grip, not the hand); and it comes to that height over a moment (s.handY), so when the covers
      // are drawn up or slip back under it, it rides up onto them or down off them and does not jump.
      const jz = L.won ? 0 : (s.jerk || 0) * 0.05, hemZ = zE - jz;
      const onCloth = z => smoothstep((z - (hemZ - 0.12)) / 0.12);
      const restAt = (x, z) => { if (Math.abs(x) > X || z > 1.92) return B; const roll = up(x, yE) + th(x), zf = hemZ + 0.14; return z >= zf ? lerp(roll, H(x, z + jz), smoothstep((z - zf) / 0.1)) : lerp(B, roll, onCloth(z)); };
      const hdt = Math.max(0, L.t - (s.handT === undefined ? L.t : s.handT)); s.handT = L.t;
      if (!s.handY || hdt > 0.25) s.handY = [];
      const r = c.lunge ? 0 : (c.reach || 0);
      if (r <= 0.01) s.handY = [];
      if (r > 0.01) w.hands.forEach(([x0, z0], i) => {
        const h = s.grab ? s.grab.hands[i] : { k: 0, drag: 0, open: 0, lift: 0, bunch: 0.3 }, [x1, z1] = w.to[i];
        const dl = Math.hypot(x0 - x1, z0 - z1), gx = lerp(x0, x1, h.k) + (x0 - x1) / dl * GRAB.drag * h.drag, gz = lerp(z0, z1, h.k) + (z0 - z1) / dl * GRAB.drag * h.drag;
        const sx = w === WAYS[0] ? (x0 < 0 ? -1 : 1) : (i ? 1 : -1);
        const [ex, ez] = w.over[0] === 'z' ? [x0 * 1.1, w.over[1]] : [w.over[1], z0];
        const [ox, oz] = w.over[0] === 'z' ? [ex, ez + 0.06] : [ex - 0.06, ez], edgeY = Math.max(B, topAt(ex - (ox - ex) * 0.6, ez - (oz - ez) * 0.6));
        // up from behind the edge (r to 0.45), then over it and down onto the cloth
        const upK = smoothstep(r / 0.45), onK = smoothstep((r - 0.45) / 0.55);
        const x = lerp(ox, gx, onK), z = lerp(oz, gz, onK);
        const want = restAt(gx, gz) + 0.004, on = s.handY[i] = s.handY[i] === undefined ? want : s.handY[i] + (want - s.handY[i]) * (1 - Math.exp(-hdt / 0.09));
        const y = lerp(edgeY - 0.24 + upK * 0.3, on, onK) + Math.sin(Math.PI * onK) * 0.05;
        const hh = onK < 1 ? { k: h.k, drag: h.drag, lift: Math.max(h.lift, 1 - onK), open: Math.max(h.open, smoothstep((1 - onK) / 0.4)), bunch: h.bunch * onK } : h;
        const cloth = mixc(MATTRESS_TOP, BLANKET, onCloth(gz));
        const far = Math.hypot(gx - ex, gz - ez);
        if (onK >= 1 && far > 0.08) {   // the arm, from the edge of the bed to the wrist, lying over the cloth (raised as the hand reaches)
          const ux = (gx - ex) / far, uz = (gz - ez) / far, nx = -uz * 0.032, nz = ux * 0.032, wx = gx - ux * 0.07, wz = gz - uz * 0.07;
          const ey = Math.max(B, topAt(ex - ux * 0.02, ez - uz * 0.02)) + 0.02, wy = y + 0.03 + h.lift * 0.05;
          R.add(SC.mkQuad(L, [ex - nx * 1.2, ey, ez - nz * 1.2], [ex + nx * 1.2, ey, ez + nz * 1.2], [wx + nx, wy, wz + nz], [wx - nx, wy, wz - nz], HAND, { sortDist: COV - 0.09, noLight: true }));
        }
        R.add(SC.mkSprite(L, x, y - 0.09 + hh.lift * 0.05, z, 0.24, 0.24, (ctx, P) => { ctx.scale(1.3, 1.3); drawGrip(ctx, P, sx, hh, cloth); }, { sortDist: onK > 0.02 ? COV - 0.1 : BEYOND - 0.03 }));   // (coming up: after it, and before the bed)
      });
      fairyDraw(topAt);   // the tooth fairy's dust, and its dollar
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
      // the hand itself, its back up, the thumb in toward the other: its own long hand (the tooth fairy's are the same)
      ctx.save(); ctx.translate(0, hy); CREATURES.tall.hand(ctx, -sd, open, col, 0); ctx.restore();
    };
    // (the tooth fairy's wings, and its dust after it, are a soft light of their own in the room)
    L.dynamicLights = () => {
      const out = [], f = fairyGlow();
      if (shown()) { const p = L.pt(LX, 1.05, LZ); out.push({ x: p[0], y: p[1], z: p[2], r: 4.5, i: 1.0, color: [255, 210, 150], flicker: s.lampT < 2 ? 0.8 : 0.08, seed: 12 }); }
      if (f) out.push({ x: f.x, y: 1.5, z: f.z - 0.5, r: 4.2 + 1 * f.flash, i: 0.6 * f.k + 0.75 * f.flash, color: [176, 196, 255] });   // (and the flash of them bursting open)
      return out;
    };
    L.glows = () => {
      const out = [], f = fairyGlow();
      if (shown()) { const p = L.pt(LX, 1.0, LZ); out.push({ x: p[0], y: p[1], z: p[2], r: 1.3, color: [255, 210, 150], a: 0.28 }); }
      if (f) out.push({ x: f.x, y: 1.5, z: f.z, r: 1.9 + 0.6 * f.flash, color: [170, 196, 255], a: 0.2 * f.k + 0.25 * f.flash });
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
      if (s.fairy) return t >= FAIRY.after;   // the tooth fairy's night: the dollar on the bed a moment more, and that is all
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
      // the flash of its wings bursting open, over the whole view, gone in a moment (never with flashes reduced: fairying)
      const fl = s.fairy && c0().fairy ? c0().fairy.flash || 0 : 0;
      if (fl > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rgba([196, 206, 255], 0.26 * fl); ctx.fillRect(0, 0, W, H); ctx.restore(); }
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
    L.floor = { poly: [[-0.7, HEAD + 0.1], [0.7, HEAD + 0.1], [0.7, 1.8], [-0.7, 1.8]], y: BEDR.top };
  }
});
