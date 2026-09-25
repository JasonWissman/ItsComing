'use strict';
// ============================================================ 12. THE BEDROOM ============================================================
// Your own room. You are in bed, sitting up. It is already in the doorway, or in the closet among the clothes,
// and it moves in extreme slow motion. Everything you can use is within arm's reach. Light slows it; the covers stop it.
LEVELS.push({
  id: 'bedroom', title: 'The Bedroom', facing: 0, eyeH: 1.15, laneMode: 'random',
  pal: { skyTop: [8, 8, 16], fog: [26, 24, 30], ground: [22, 18, 16], fogDist: 30 },
  ambient: { wind: 0.15, drone: 0.9, droneFreq: 38, windFreq: 200 },
  lights: [{ x: 3.4, y: 2.3, z: 1.6, r: 6, i: 0.28, color: [150, 170, 230], cone: { x: -1, y: -0.35, z: -0.2, deg: 36 } }],
  text: {
    intro: 'You are in bed. You have been awake for a while. So has it.',
    hint: 'The lamp is dead; there is a bulb in the drawer. Light slows it. Then pull the covers up and hold on.',
    objective: 'Get the lamp on. Pull the covers up.',
    death: { default: 'It leaned down over the bed and its face was the only thing in the room.' },
    win: 'It stood at the foot of the bed until the room went grey. You could hear the clock the whole time.',
    fragment: 'It stood there until the room went grey. You could hear the clock the whole time.',
  },
  lanes: [
    { deg: 0, name: 'the doorway', barrierDist: 1.9, cue: 'creak', default: true, apertures: [{ z: 3.6, x0: -0.5, x1: 0.5, y0: 0, y1: 2.1 }] },
    { deg: 270, name: 'the closet', barrierDist: 1.6, cue: 'hangers', apertures: [{ z: 3.2, x0: -0.9, x1: 0.9, y0: 0, y1: 2.2 }] },
  ],
  creatures: [{ type: 'tall', startDist: 3.4, time: 70, gamma: 0.9, unseenMult: 2.5 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const parts = STORY.buildBedroom(L, false);
    const decoy = !!L.diff.decoys, unplugged = L.diff.tier >= 2, sticks = L.diff.tier >= 3;
    Object.assign(s, { fitted: false, plugged: !unplugged, lampOn: false, lampT: 0, clicks: 0, coversUp: false, grey: 0, tick: 0 });
    STORY.lamp(L, parts.lamp[0], parts.lamp[1], parts.lamp[2], { lit: () => s.lampOn });
    const c0 = () => L.creatures[0];
    // the drawer in the nightstand holds the bulb (and, on the harder tiers, one that will not fit)
    mkContainer(L, {
      id: 'drawer', name: 'Drawer', w: 0.46, h: 0.2, color: [58, 44, 34], spot: { x: 1.2, y: 0.28, z: -0.13 }, closedText: 'The nightstand drawer.', emptyText: 'Nothing else in it.',
      yields: [{ id: 'bulb', name: 'Bulb', opts: { w: 0.14, h: 0.2, flat: false, icon: 'bulb' } }].concat(decoy ? [{ id: 'bulb2', name: 'Bulb', opts: { w: 0.14, h: 0.2, flat: false, icon: 'bulb', decoy: true, decoyText: 'The wrong fitting. It will not go in.' } }] : []),
      liftY: 0.36,
    });
    const lampT = mkTarget(L, {
      id: 'lamp', name: 'Lamp', x: 1.2, y: 0.62, z: 0.15, w: 0.4, h: 0.55, accepts: ['bulb'].concat(decoy ? ['bulb2'] : []),
      hint() { return !s.fitted ? 'The lamp. Dead. No bulb in it.' : !s.plugged ? 'A bulb in it now. Nothing happens; the cord is loose somewhere.' : s.lampOn ? 'On.' : 'Off. Switch it on.'; },
      use(item) { if (item.id !== 'bulb') return false; s.fitted = true; lampT.accepts = []; AUDIO.sfx('fit'); G.say('The bulb goes in. Now the switch.', 'In.'); return true; },
      onClick() {
        if (!s.fitted) return false;
        if (!s.plugged) { G.say('Nothing. The cord is loose somewhere. Look down beside the bed.', 'Nothing. The cord.'); AUDIO.sfx('switch'); return true; }
        if (s.lampOn) { G.say('It is on. Leave it.', 'On.'); return true; }
        if (sticks && ++s.clicks < 3) { AUDIO.sfx('switch'); G.say('The switch sticks.', 'Sticks.'); return true; }
        s.clicks = 0; s.lampOn = true; s.lampT = 12 + L.rand() * 6; AUDIO.sfx('switch'); AUDIO.sfx('lampOn'); G.say('Light. It slows.', 'Light.'); return true;
      },
    });
    if (unplugged) { // the cord lies on the floor beside the bed, pulled out of its socket
      SC.box(L, -1.34, -0.86, 0.02, 0.05, -0.32, -0.28, [30, 28, 30]); SC.box(L, -1.46, -1.3, 0.02, 0.08, -0.38, -0.22, [40, 36, 40]);
    }
    if (unplugged) mkTarget(L, {
      id: 'socket', name: 'Cord', x: -1.3, y: 0.02, z: -0.3, w: 0.5, h: 0.3, flat: true,
      hint() { return s.plugged ? 'Plugged in.' : 'The lamp cord, out of its socket.'; },
      onClick() { if (s.plugged) return false; s.plugged = true; AUDIO.sfx('clunk'); G.say('Plugged in.', 'Click.'); return true; },
    });
    const covers = mkTarget(L, {
      id: 'covers', name: 'Covers', x: 0, y: 0.6, z: 1.1, w: 1.4, h: 0.6, flat: true, hold: 3.0,
      hint() { return s.coversUp ? 'Up over you.' : 'The covers. Pull them up and hold on; they slip back if you let go.'; },
      use(item) { if (item !== null) return false; s.coversUp = true; AUDIO.sfx('hiss'); G.say('The covers are up. Do not let go.', 'Up.'); return true; },
    });
    L.isWon = () => s.lampOn && s.coversUp;
    L.objectiveText = () => (s.lampOn ? 'Lamp on. ' : !s.fitted ? 'Find a bulb (the drawer). Fit it. ' : !s.plugged ? 'Plug the cord in (down, beside the bed). ' : 'Switch the lamp on. ') + (s.coversUp ? 'Covers up.' : 'Pull the covers up (hold).');
    L.update = dt => {
      const c = c0();
      c.unseenMult = Math.min(c.unseenMult, 2.5); // this night already charges a lot for looking away; the tiers do not stack on top
      if (s.lampOn && !L.won) { s.lampT -= dt; if (s.lampT <= 0) { s.lampOn = false; AUDIO.sfx('flicker'); G.say('The lamp goes out.', 'Dark.'); } }
      c.inLight = s.lampOn;
      if (L.won) { s.tick -= dt; if (s.tick <= 0) { s.tick = 1.0; AUDIO.sfx('tick', -0.4); } }
    };
    L.dynamic = () => {
      // the covers: flat on the bed, rising toward you as you pull
      const p = s.coversUp ? 1 : (covers.progress || 0);
      const z1 = 1.9, z0 = 0.35 + (1 - p) * 0.0, y = 0.6 + p * 0.28;
      R.add(SC.mkQuad(L, [-0.76, 0.6, z1], [0.76, 0.6, z1], [0.76, y, z0 - p * 0.2], [-0.76, y, z0 - p * 0.2], L.pal.ambient !== undefined && L.pal.ambient > 1.2 ? [150, 150, 160] : [96, 92, 104]));
      R.add(SC.mkQuad(L, [-0.76, y, z0 - p * 0.2], [0.76, y, z0 - p * 0.2], [0.76, y + 0.03, z0 - p * 0.2 - 0.05], [-0.76, y + 0.03, z0 - p * 0.2 - 0.05], [70, 66, 76]));
    };
    L.dynamicLights = () => { if (!s.lampOn) return []; const p = L.pt(1.2, 1.05, 0.15); return [{ x: p[0], y: p[1], z: p[2], r: 4.5, i: 1.0, color: [255, 210, 150], flicker: s.lampT < 2 ? 0.8 : 0.08, seed: 12 }]; };
    L.glows = () => { if (!s.lampOn) return null; const p = L.pt(1.2, 1.0, 0.15); return [{ x: p[0], y: p[1], z: p[2], r: 1.3, color: [255, 210, 150], a: 0.28 }]; };
    // dawn: the room goes grey, the clock is loud, it stands at the foot of the bed
    L.aftermath = (t, dt) => {
      if (!s.after) { s.after = true; const c = c0(); G.cam.tPitch = 0; G.cam.tYaw = G.cam.yaw + wrapPi(c.yaw - G.cam.yaw); if (c.lane.idx === 1) L.text.win = 'It stood beside the bed, in front of the closet, until the room went grey. You could hear the clock the whole time.'; } // look up from the covers at it
      s.grey = clamp(t / 8, 0, 1);
      L.pal.ambient = 1 + s.grey * 0.9; L.pal.fog = mixc([26, 24, 30], [150, 152, 158], s.grey); L.pal.skyTop = mixc([8, 8, 16], [120, 128, 150], s.grey);
      return t >= 9;
    };
    L.floor = { poly: [[-0.7, -0.9], [0.7, -0.9], [0.7, 1.8], [-0.7, 1.8]], y: 0.58 };
  }
});
