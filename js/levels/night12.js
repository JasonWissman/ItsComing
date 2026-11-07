'use strict';
// ============================================================ 12. THE BEDROOM ============================================================
// Your own room. You are in bed, sitting up. It is already in the doorway, or in the closet among the clothes,
// and it moves in extreme slow motion. Everything you can use is within arm's reach. Light slows it; the covers stop it.
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
    intro: 'You are in bed. You have been awake for a while. So has it.',
    hint: 'The lamp is dead; there is a bulb in the drawer. Light slows it. Then hold the covers until they are all the way up.',
    objective: 'Get the lamp on. Pull the covers up.',
    death: { default: 'It leaned down over the bed and its face was the only thing in the room.' },
    win: 'It stood at the foot of the bed until the room went grey, and never came a step closer.',
    fragment: 'It stood there until the room went grey. You could hear the clock the whole time.',
  },
  lanes: [
    { deg: 0, name: 'the doorway', barrierDist: 1.9, startDist: 4.0, cue: 'creak', default: true, apertures: [{ z: 3.6, x0: -0.5, x1: 0.5, y0: 0, y1: 2.1 }] },
    { deg: 270, name: 'the closet', barrierDist: 1.6, startDist: 3.6, maxStart: 3.85, cue: 'hangers', apertures: [{ z: 3.2, x0: -0.9, x1: 0.9, y0: 0, y1: 2.2 }] },
  ],
  creatures: [{ type: 'tall', startDist: 4.0, time: 70, unseenMult: 2.5 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const parts = STORY.buildBedroom(L, false);
    const decoy = !!L.diff.decoys, unplugged = L.nightmare, sticks = L.nightmare;
    Object.assign(s, { fitted: false, plugged: !unplugged, lampOn: false, lampT: 0, clicks: 0, coversUp: false, grey: 0, tick: 0, tugAt: -9 });
    // Drawing order in this room (it is built in local coordinates, and this night faces north, so they are world ones).
    // The mattress is one long quad whose middle is further off than the nightstand beside it and the bed's own legs, so
    // it was drawn first and they over it: the nightstand stood on the covers and the legs showed through. Whatever is
    // beside or under the bed goes behind the mattress (BED). The nightstand's drawer face, on its far side where you
    // cannot see it, is not drawn: the drawer you use is on the side that faces the bed.
    const BED = 1.7, within = (p, x0, x1, z0, z1) => p.kind === 'poly' && p.pts.every(v => v[0] >= x0 && v[0] <= x1 && v[2] >= z0 && v[2] <= z1);
    for (const p of L.props) {
      if (p.sortDist !== undefined) continue;
      if (within(p, 0.94, 1.46, -0.13, -0.105)) p.alpha = 0;
      else if (within(p, 0.94, 1.46, -0.13, 0.41) || [-0.72, 0.72].some(x => within(p, x - 0.05, x + 0.05, -0.95, -0.85) || within(p, x - 0.05, x + 0.05, 1.8, 1.9))) p.sortDist = BED;
    }
    STORY.lamp(L, parts.lamp[0], parts.lamp[1], parts.lamp[2], { lit: () => s.lampOn });
    // its cord runs off the back of the nightstand (and, under the bed, to the wall on the other side)
    SC.quad(L, [1.25, 0.624, 0.11], [1.26, 0.624, 0.13], [1.46, 0.624, 0.03], [1.45, 0.624, 0.01], [30, 26, 24], { sortDist: 1.4 });
    // the wall socket, low on the wall behind the bed on the closet side: a pale plate with its two slots
    SC.wallV(L, -1.55, -1.094, -1.45, -1.094, 0.22, 0.36, [120, 114, 104], { sortDist: 1.86 });
    for (const x of [-1.515, -1.485]) SC.wallV(L, x - 0.007, -1.092, x + 0.007, -1.092, 0.26, 0.31, [22, 20, 20], { sortDist: 1.859 });
    const c0 = () => L.creatures[0];
    // the drawer, in the side of the nightstand that faces the bed, holds the bulb (and, on Nightmare, one that will not fit).
    // It is built into the nightstand (a container's card would turn with the view and stand out from it at an angle):
    // opened, it slides out toward you, dark inside, and they stand in it
    const bulbs = [{ id: 'bulb', name: 'Bulb', z: decoy ? 0.07 : 0.15, opts: { w: 0.14, h: 0.2, icon: 'bulb' } }]
      .concat(decoy ? [{ id: 'bulb2', name: 'Bulb', z: 0.235, opts: { w: 0.14, h: 0.2, icon: 'bulbPin', decoy: true, decoyText: 'Wrong kind of bulb. It will not go in.' } }] : []);
    const drawer = mkTarget(L, {
      id: 'drawer', name: 'Drawer', x: 0.93, y: 0.43, z: 0.15, w: 0.4, h: 0.18, open: false, yielded: [],
      hint() { return drawer.open ? 'Nothing else in it.' : 'The nightstand drawer.'; },
      onClick() {
        if (!drawer.open) {
          drawer.open = drawer.done = true; AUDIO.sfx('drawer'); // its own sound: not the creak that warns of the doorway, nor a creature's scratching
          for (const b of bulbs) drawer.yielded.push(mkItem(L, b.id, b.name, { x: 0.875, y: 0.47, z: b.z, jitter: 0 }, b.opts));
          return true;
        }
        const left = drawer.yielded.some(i => !i.taken); G.say(left ? 'Take what is in it.' : 'Nothing else in it.', left ? 'Something is still in it.' : 'Nothing more.'); return true;
      },
    });
    const knob = out => SC.mkSprite(L, 0.938 - out, 0.495, 0.15, 0.036, 0.036, (ctx, P) => { ctx.scale(0.036, 0.036); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([96, 92, 86])); P_ell(ctx, -0.1, 0.6, 0.3, 0.3, P.col([164, 158, 148])); }, { sortDist: 1.672 });
    const knobs = [knob(0), knob(0.09)];
    const lampT = mkTarget(L, {
      id: 'lamp', name: 'Lamp', x: 1.2, y: 0.62, z: 0.15, w: 0.4, h: 0.55, accepts: ['bulb'].concat(decoy ? ['bulb2'] : []),
      hint() { return !s.fitted ? 'The lamp. Dead. No bulb in it.' : !s.plugged ? 'A bulb in it now. Nothing happens; the cord is loose somewhere.' : s.lampOn ? 'On.' : 'Off. Switch it on.'; },
      use(item) { if (item.id !== 'bulb') return false; s.fitted = true; lampT.accepts = []; AUDIO.sfx('fit'); G.say('The bulb goes in. Now the switch.', 'In.'); return true; },
      onClick() {
        if (!s.fitted) return false;
        s.tugAt = L.t;
        if (!s.plugged) { G.say('Nothing. The cord is loose somewhere. Look down beside the bed.', 'Nothing. It is not plugged in.'); AUDIO.sfx('switch'); return true; }
        if (s.lampOn) { G.say('It is on. Leave it.', 'On.'); return true; }
        if (sticks && ++s.clicks < 3) { AUDIO.sfx('switch'); G.say('The switch sticks.', 'Sticks.'); return true; }
        s.clicks = 0; s.lampOn = true; s.wasLit = true; s.lampT = 12 + L.rand() * 6; AUDIO.sfx('switch'); AUDIO.sfx('lampOn'); G.say('Light. It slows.', 'Light.'); return true;
      },
    });
    // the lamp's own details, over it: the socket (and the bulb, once it is in) dark through the shade, bright when it is
    // on; the pull chain under the shade, which jerks when it is pulled
    const lampDetail = SC.mkSprite(L, 1.2, 0.62, 0.15, 0.34, 0.5, (ctx, P) => {
      ctx.scale(0.34, 0.5);
      if (s.lampOn) {
        const g = ctx.createRadialGradient(0, 0.7, 0.01, 0, 0.7, 0.2); g.addColorStop(0, 'rgba(255,250,232,0.95)'); g.addColorStop(1, 'rgba(255,236,190,0)');
        ctx.fillStyle = g; ctx.fillRect(-0.3, 0.5, 0.6, 0.45);
      } else {
        const sh = P.cola([54, 44, 32], 0.6);
        P_rect(ctx, -0.055, 0.5, 0.11, 0.1, sh);
        if (s.fitted) { P_ell(ctx, 0, 0.71, 0.13, 0.12, sh); P_rect(ctx, -0.065, 0.58, 0.13, 0.06, sh); }
      }
      const tug = clamp(1 - (L.t - s.tugAt) / 0.35, 0, 1) * 0.06, chain = P.col([150, 140, 118]);
      P_line(ctx, 0.24, 0.5, 0.24, 0.35 - tug, 0.016, chain); P_ell(ctx, 0.24, 0.34 - tug, 0.03, 0.022, chain);
    }, { sortDist: Math.hypot(1.2, 0.15) - 0.002 });
    // on Nightmare the lamp's plug lies on the floor by the wall socket, on the closet side, pulled out
    const PLUG = [-1.74, -0.7];
    const socket = unplugged && mkTarget(L, {
      id: 'socket', name: 'Cord', x: -1.6, y: 0.02, z: -0.6, w: 0.42, h: 0.3, flat: true,
      hint() { return s.plugged ? 'Plugged in.' : 'The lamp cord, out of its socket.'; },
      onClick() { if (s.plugged) return false; s.plugged = true; socket.hidden = true; AUDIO.sfx('clunk'); G.say('Plugged in.', 'Click.'); return true; },
    });
    const covers = mkTarget(L, {
      id: 'covers', name: 'Covers', x: 0, y: 0.6, z: 1.1, w: 1.4, h: 0.6, flat: true, hold: 3.0,
      hint() { return s.coversUp ? 'Up over you.' : 'The covers. Hold on to them until they are all the way up; they slip back if you let go too soon.'; },
      use(item) { if (item !== null) return false; s.coversUp = true; AUDIO.sfx('hiss'); G.say(s.lampOn ? 'The covers are up.' : !s.fitted ? 'The covers are up. Now the lamp: there is a bulb in the drawer.' : s.wasLit ? 'The covers are up, but the lamp has gone out. Switch it back on.' : 'The covers are up. Now switch the lamp on.', s.lampOn ? 'Up.' : 'Up. It is dark.'); return true; },
    });
    L.isWon = () => s.lampOn && s.coversUp;
    L.objectiveText = () => (s.lampOn ? 'Lamp on. ' : !s.fitted ? 'Find a bulb (the drawer). Fit it. ' : !s.plugged ? 'Plug the cord in (down, beside the bed). ' : 'Switch the lamp on. ') + (s.coversUp ? 'Covers up.' : 'Pull the covers up (hold).');
    L.update = dt => {
      const c = c0();
      c.unseenMult = Math.min(c.unseenMult, 2.5); // this night already charges a lot for looking away; the tiers do not stack on top
      if (s.lampOn && !L.won) { s.lampT -= dt; if (s.lampT <= 0) { s.lampOn = false; AUDIO.sfx('flicker'); G.say('The lamp goes out.', 'Dark.'); } }
      c.inLight = s.lampOn;
      if (L.won) { s.tick -= dt; if (s.tick <= 0) { s.tick = 1.0; AUDIO.sfx('tick', Math.sin(wrapPi(-Math.PI / 4 - G.cam.yaw)) * 0.7, true); } } // the clock is on the dresser to the north-west, whichever way you face
    };
    // a cord on the floor: a pale cloth flex, so it shows on the dark boards; it goes under the bed, behind the mattress
    const CORD = [104, 98, 90];
    const flex = (pts, y) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], l = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / l * 0.009, nz = (bx - ax) / l * 0.009; R.add(SC.mkQuad(L, [ax - nx, y, az - nz], [bx - nx, y, bz - nz], [bx + nx, y, bz + nz], [ax + nx, y, az + nz], CORD, { sortDist: BED })); } };
    // the covers: kicked down to the foot of the bed, and drawn up over you as you pull, the sheet turned down along the top
    const COV = 1.62, X = 0.77, BLANKET = [80, 84, 108], SHEET = [132, 128, 134], CREASE = [70, 74, 97];
    const coversAt = () => { const p = s.coversUp ? 1 : (covers.progress || 0); return { p, zE: lerp(1.22, 0.1, p), yE: lerp(0.64, 0.84, p), roll: lerp(0.06, 0.025, p) }; };
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
    };
    L.dynamicLights = () => { if (!s.lampOn) return []; const p = L.pt(1.2, 1.05, 0.15); return [{ x: p[0], y: p[1], z: p[2], r: 4.5, i: 1.0, color: [255, 210, 150], flicker: s.lampT < 2 ? 0.8 : 0.08, seed: 12 }]; };
    L.glows = () => { if (!s.lampOn) return null; const p = L.pt(1.2, 1.0, 0.15); return [{ x: p[0], y: p[1], z: p[2], r: 1.3, color: [255, 210, 150], a: 0.28 }]; };
    // dawn: the room goes grey, the clock is loud, it stands at the foot of the bed
    L.aftermath = (t, dt) => {
      if (!s.after) { s.after = true; const c = c0(); G.cam.tPitch = 0; G.cam.tYaw = G.cam.yaw + wrapPi(c.yaw - G.cam.yaw); G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; if (c.lane.idx === 1) L.text.win = 'It stood beside the bed, in front of the closet, until the room went grey, and never came a step closer.'; } // look up from the covers at it
      s.grey = clamp(t / 8, 0, 1);
      L.pal.ambient = 1 + s.grey * 0.9; L.pal.fog = mixc([26, 24, 30], [150, 152, 158], s.grey); L.pal.skyTop = mixc([8, 8, 16], [120, 128, 150], s.grey);
      return t >= 9;
    };
    L.floor = { poly: [[-0.7, -0.9], [0.7, -0.9], [0.7, 1.8], [-0.7, 1.8]], y: 0.58 };
  }
});
