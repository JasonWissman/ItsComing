'use strict';
// ============================================================ 13. THE VOID ============================================================
// Nothing at all: a faint floor that fades into black. Around you lies everything you ever held against it, and you
// begin the night holding some of it. It comes from anywhere. Holding anything enrages it. Put it all down.
// The ending plays out here, without a cut: caught empty-handed and facing it, it stops and holds you, its face goes
// through all it was until it is happy, and the dark opens into a meadow in the sun; a press later it is the bedroom.
const VOID_TOOLS = [
  ['hammer', 'Hammer', 0.42, 0.42], ['planks', 'Planks', 1.0, 0.7], ['salt', 'Bag of salt', 0.34, 0.42], ['lantern', 'Lantern', 0.3, 0.44], ['matches', 'Matches', 0.2, 0.2],
  ['chain', 'Chain', 0.6, 0.6], ['padlock', 'Padlock', 0.22, 0.26], ['bow', 'Bow', 1.25, 0.3], ['arrows', 'Arrows', 0.8, 0.24], ['handle', 'Winch handle', 0.45, 0.45],
  ['fuse', 'Fuse', 0.34, 0.34], ['keys', 'Car keys', 0.2, 0.2], ['musicbox', 'Music box', 0.34, 0.34], ['beam', 'Bar', 1.4, 0.45], ['journal', 'Notebook', 0.2, 0.26], ['bulb', 'Bulb', 0.2, 0.3],
];
// each looks as it did on its own night, at about the size it was there (those nights define their own icons)
const VOID_ICONS = { keys: 'carkeys', chain: 'coiledchain', journal: 'notebook' };
// and is held as it was there (js/hands.js: what its own icon would be held as; the void draws them all through a wrapper of
// its own), and a few as they are carried here: the arrows in a fist round their shafts, the coil of chain a little smaller,
// the notebook by its edge
const VOID_HELD = {
  arrows: { grip: 'fist', at: [0.06, 0.5], axis: Math.PI / 2, angle: -0.55, size: 0.36 },
  chain: { size: 0.28 },
  journal: { grip: 'pinch', at: [0.36, 0.42], angle: 0.18 },
};
// lying on the void's black floor, a thing's darkest colours (a lantern's frame, a gun's barrels, a hammer's handle grip)
// would be lost against it: there, and only there, they are lifted a little toward grey, as the Quarry draws its chain a
// shade lighter on the dark gate. The inventory (whose P has no fogColor) draws them as they always are.
const voidLift = c => { const k = clamp((84 - (c[0] + c[1] + c[2]) / 3) / 84, 0, 1) * 0.45; return k > 0 ? mixc(c, [150, 150, 160], k) : c; };
const onVoidFloor = icon => icon && ((ctx, P) => icon(ctx, P.fogColor ? Object.assign({}, P, { col: c => P.col(voidLift(c)), cola: (c, a) => P.cola(voidLift(c), a) }) : P));   // a missing icon stays missing, for validateContent to report
// the void; the light coming, half way (a warm haze close round you); the meadow, clear to the hills; and the same place as
// the void in the morning (night 12's room with the sun in it)
const VOID_PAL = { skyTop: [0, 0, 0], fog: [0, 0, 0], ground: [10, 10, 12], fogDist: 14 };
const DAWN_PAL = { skyTop: [62, 58, 104], fog: [246, 208, 170], ground: [92, 98, 64], fogDist: 24 };
const MEADOW_PAL = { skyTop: [74, 138, 222], fog: [212, 230, 242], ground: [98, 158, 64], fogDist: 170 };
const MORNING_PAL = { skyTop: [150, 190, 240], fog: [236, 236, 238], ground: [200, 190, 170], fogDist: 60 };
// the ending, in seconds from when it reaches you
const END = {
  settle: 1.0,                          // it stops, and its head comes level
  stoop: [0.2, 2.2],                    // it bends down to your face
  near: [0.9, 3.0],                     // and comes in close
  reach: [0.8, 3.6],                    // its arms come slowly up out to you, the hands open
  close: [3.8, 5.6],                    // and close round you
  moods: 6.4, blend: 0.8, hold: 0.8,    // then its faces, each coming over `blend` and held `hold`: rage first, happy last
  release: 16.0,                        // it lets you go, a moment after it is happy
  light: [15.8, 21.8],                  // the light comes, and the meadow with it
  walk: [17.0, 20.6],                   // it steps back and round to the north, where the foot of the bed will be
  dance: [21.2, 25.7],                  // and dances a little to the tune
  wait: 21.8, arm: 22.4, line: 24.2,    // from here the meadow waits for a press (taken from `arm`); a soft line comes in at `line`
  leave: 4.2,                           // after the press: the meadow and it fade, the bedroom comes up, and then the last screen
};
LEVELS.push({
  id: 'void', title: 'The Void', facing: 0, eyeH: 1.65, laneMode: 'random', ending: true,
  pal: Object.assign({}, VOID_PAL),
  ambient: { wind: 0.2, drone: 1.3, droneFreq: 34, windFreq: 160 },
  text: {
    intro: 'Where are you?',
    hint: 'Put them down. All of them.',
    objective: 'Put everything down.',
    death: { default: 'You were still holding on to something.', away: 'It craves your fear.' },
    win: '',
    fragment: '',
  },
  lanes: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((name, k) => ({ deg: k * 45, name, barrierDist: 0, default: k === 0 })),
  creatures: [{ type: 'demon', startDist: 40, time: 75, unseenMult: 1.3 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    Object.assign(s, { ending: false, endT: 0, reveal: 0, meadow: 0, room: 0, lv: 0, gone: 0, glitterAt: -1, wait: false, leaving: false, leaveT: 0 });
    // a floor that is only a floor near you (and the lamp, off, a little way out): the void's own props, which fade as the light comes
    const v0 = L.props.length;
    // (in narrow rings of many sides, so it darkens smoothly instead of in visible steps; drawn before the room's floors,
    // so as the room comes its floor comes up evenly over the dark rather than under the nearer rings)
    const RINGS = 24, SIDES = 24, RW = 14.4 / RINGS;
    for (let r = 0; r < RINGS; r++) { const r0 = r * RW, r1 = r0 + RW, k = 1 - r / RINGS, col = [10 + 26 * k * k, 10 + 26 * k * k, 12 + 30 * k * k]; for (let i = 0; i < SIDES; i++) { const a0 = i / SIDES * TAU, a1 = (i + 1) / SIDES * TAU; SC.quad(L, [Math.sin(a0) * r0, 0, Math.cos(a0) * r0], [Math.sin(a1) * r0, 0, Math.cos(a1) * r0], [Math.sin(a1) * r1, 0, Math.cos(a1) * r1], [Math.sin(a0) * r1, 0, Math.cos(a0) * r1], col, { layer: 0, noLight: true, sortDist: 100 + r0 }); } }
    const voidProps = L.props.slice(v0);
    // the room that was always here: built now, invisible until the meadow has gone
    const r0 = L.props.length;
    STORY.buildBedroom(L, true);
    STORY.lamp(L, 1.2, 0.62, 0.15, { lit: false });
    const roomProps = L.props.slice(r0);
    for (const p of voidProps) p.alpha0 = p.alpha === undefined ? 1 : p.alpha;
    for (const p of roomProps) { p.alpha0 = p.alpha === undefined ? 1 : p.alpha; p.alpha = 0; }
    // what lies beyond the room's walls (the hall, the inside of the closet) comes up only once the walls are nearly solid,
    // so while the room is still faint nothing behind a wall shows through it
    const ROOM = { x0: -3.22, x1: 2.22, z0: -1.12, z1: 3.62 };
    for (const p of roomProps) {
      let x = p.x, z = p.z;
      if (p.kind === 'poly') { x = 0; z = 0; for (const v of p.pts) { x += v[0] / p.pts.length; z += v[2] / p.pts.length; } }
      const q = rotY(x, z, -L.facing);
      p.beyond = q[0] < ROOM.x0 || q[0] > ROOM.x1 || q[1] < ROOM.z0 || q[1] > ROOM.z1;
      if (p.bf) p.solid = Object.create(p, { alpha: { value: undefined } });   // the face as it is once the room is solid
    }
    // the renderer draws every face of a box that is not yet solid, so while the room fades in the far sides of the bed and
    // the dresser showed through their near sides and then vanished all at once as the light finished: a face turned away
    // from the eye stays out of it all along, as it will be once the room is there
    const turned = p => !!p.solid && R.isCulledFace(p.solid, 0, L.eyeH, 0);
    // the ring of everything, and what you start the night holding: what is left on the floor lies evenly all the way round you
    const hold = L.tier(3, 6), ringR = L.tier(2.0, 1.7);
    const rng = mulberry32((G.runSeed * 31 + 13) >>> 0);
    const tools = VOID_TOOLS;
    const order = tools.slice().sort(() => rng() - 0.5);
    const nRing = order.length - hold;
    order.forEach(([id, name, w, h], k) => {
      const j = k < hold ? k : k - hold, a = j / (k < hold ? hold : nRing) * TAU + 0.2, r = ringR + (j % 2) * 0.5;
      const own = ICONS[VOID_ICONS[id] || id], held = Object.assign(G.heldSpec({ id, w, h, flat: true, icon: own }), VOID_HELD[id]);
      const it = mkItem(L, id, name, { x: Math.sin(a) * r, y: 0, z: Math.cos(a) * r, flat: true }, { w, h, flat: true, icon: onVoidFloor(own), held, tool: id === 'bow' || id === 'matches' || id === 'hammer', uses: id === 'arrows' ? 3 : 1 });
      if (k < hold) { it.taken = true; G.inv.push(it); }
    });
    // put down, a thing lands where you put it unless it would lie over something else, when it goes the least way to the
    // side, nearer or further that clears it. Everything lies as a card facing you, so two overlap where their widths
    // overlap across the view and their lengths (from where each lies, away from you) overlap along it
    const card = (o, x, z) => ({ a: Math.atan2(x, z), d: Math.hypot(x, z), w: o.w, h: o.h });
    const overlap = (p, q) => {
      const across = (p.w + q.w) / 2 + 0.06 - Math.abs(wrapPi(p.a - q.a)) * (p.d + q.d) / 2, along = Math.min(p.d + p.h, q.d + q.h) - Math.max(p.d, q.d) + 0.06;
      return Math.max(0, across) * Math.max(0, along);
    };
    L.onDrop = (it, fx) => {
      if (fx) return;   // (landed by a fumble: it lies where it fell)
      const others = L.items.filter(o => (!o.taken || falls.some(f => f.it === o)) && o !== it).map(o => card(o, o.x, o.z));   // (and where one still falling will lie)
      const a0 = Math.atan2(it.x, it.z), d0 = Math.hypot(it.x, it.z);
      let best = null;
      search: for (const da of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) for (const dd of [0, -0.15, 0.15, -0.3, 0.3]) {
        const a = a0 + da * 7 * DEG, d = clamp(d0 + dd, 1.15, 1.6), x = Math.sin(a) * d, z = Math.cos(a) * d;
        const q = rotY(x, z, -L.facing);
        if (L.floor.poly && !pointInPoly(q[0], q[1], L.floor.poly)) continue;
        const me = card(it, x, z), score = others.reduce((t, o) => t + overlap(me, o), 0);
        if (!best || score < best.score - 1e-6) best = { x, z, score };
        if (score < 1e-6) break search;   // the nearest clear place to where it was put
      }
      if (best) { it.x = best.x; it.z = best.z; }
      letGo(it);
    };
    // Putting a thing down is the point of the night, and it is seen: it leaves your hand (open, going down empty, js/hands.js)
    // and falls to where it will lie, turning as it goes, lands with the sound of what it is, and lies there, to be taken again
    // only once it is down. As many fall at once as you let go of.
    const falls = [];
    const letGo = it => {
      const hw = G.hand.cur === it && !SAVE.data.settings.reducedMotion ? HANDS.handWorld(it, 10) : null;
      if (!hw) return;   // (not in view in your hand: it is simply there)
      it.taken = true;
      falls.push({ it, t: 0, dur: 0.42, from: hw.p, to: { x: it.x, y: 0, z: it.z }, rot: hw.ang, spin: (it.x * 7 + it.z * 3) % 1 > 0.5 ? 1 : -1 });
    };
    const fallStep = dt => {
      for (const f of falls.slice()) {
        f.t += dt;
        if (f.t < f.dur) continue;
        falls.splice(falls.indexOf(f), 1); f.it.taken = false; G.hover = null;
        AUDIO.sfx(HANDS.materialOf(f.it) === 'soft' ? 'flop' : 'clatter', Math.sin(wrapPi(Math.atan2(f.it.x, f.it.z) - G.cam.yaw)) * 0.85);
      }
    };
    const fallDraw = () => {
      for (const f of falls) {
        const it = f.it, k = clamp(f.t / f.dur, 0, 1), e = easeIn(k);
        const x = lerp(f.from.x, f.to.x, k), z = lerp(f.from.z, f.to.z, k), y = lerp(f.from.y, f.to.y + it.h * 0.3, e) + Math.sin(Math.PI * k) * 0.12;
        const w = it.w, h = it.h * (1 - 0.55 * k * k), big = Math.max(w, h) * 1.2, rot = f.rot * (1 - k) + f.spin * 0.5 * k;
        R.add({ kind: 'sprite', x, y: y - big / 2, z, w: big, h: big, noContact: true, draw: (ctx, P) => {
          ctx.translate(0, big / 2);
          const m = ctx.getTransform(), sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
          if (sy > 1e-6) ctx.scale(1, sx / sy);   // (square to the view, as the hand draws it)
          ctx.rotate(-rot); ctx.translate(0, -h / 2); ctx.scale(w, h);
          it.icon(ctx, P);
        } });
      }
    };
    // with more than one thing held, the next one is in your other hand: both hands are full (a thing carried in both hands
    // takes them both)
    const twoHanded = it => G.heldSpec(it).hands === 2;
    L.hands = { lit: 0.8 };   // (what you hold, seen against the dark: lit a little more than the void would have it)
    L.offHand = () => {
      const a = G.inv[G.active];
      if (!a || twoHanded(a) || G.state !== 'play') return null;
      for (let k = 1; k < G.inv.length; k++) { const o = G.inv[(G.active + k) % G.inv.length]; if (!twoHanded(o)) return o; }
      return null;
    };
    G.active = 0;
    const c0 = () => L.creatures[0];
    L.isWon = () => false;
    L.objectiveText = () => G.inv.length ? 'Put everything down (' + G.inv.length + ' still held).' : 'Empty-handed. Let it come.';
    // being caught empty-handed, and looking at it, is the ending, not a death: it stops close in front of you and holds you.
    // Turned away from it, or looking at the floor, as it reaches you is a death even with nothing in your hands.
    const facingIt = c => Math.abs(wrapPi(c.yaw - G.cam.yaw)) < 30 * DEG && G.cam.pitch < PITCH_DOWN * 0.5;
    L.deathCause = () => G.inv.length ? 'default' : 'away';
    const span = (t, a, b) => smoothstep(clamp((t - a) / (b - a), 0, 1));
    L.onCatch = c => {
      if (G.inv.length > 0 || !facingIt(c)) return false;
      s.ending = true; s.endT = 0; c.frozen = true; c.hold = null;
      c.lane = Object.assign({}, c.lane, { follow: 'free', apertures: [], blockers: [] });   // placed by yaw and distance from here on
      // its head comes level from the tilt it had (as draw() has it, empty-handed)
      const a = clamp(c.rage || 0, 0, 1) * (1 - (c.calm || 0));
      c.tilt0 = headTiltJerk(c.t, 2.7 - a * 1.5, 0.3 + a * 0.3); c.settle = 0; c.mood = 0;
      // it comes in a little closer as it takes hold of you; later it steps back and round to the north (the foot of the bed)
      const yaw0 = c.yaw, d0 = c.dist, yaw1 = L.facing;
      c.distFn = cr => {
        const t = s.endT, kw = span(t, END.walk[0], END.walk[1]);
        cr.yaw = yaw0 + wrapPi(yaw1 - yaw0) * kw;
        return lerp(lerp(d0, 0.68, span(t, END.near[0], END.near[1])), 3.3, kw);
      };
      AUDIO.sfx('stingHum'); win(); return true;
    };
    // which face it is making: none of them before END.moods, then each in turn, ending happy
    const moodAt = t => {
      if (t < END.moods) return 0;
      const per = END.blend + END.hold, u = t - END.moods, j = Math.floor(u / per);
      return Math.min(CREATURES.demon.moods - 1, j + clamp((u - j * per) / END.blend, 0, 1));
    };
    // the light on it while it holds you follows its face: its own dull red, red hot in its rage, cold in fear and sorrow, warm
    // when it is calm and happy (as the light coming will be)
    const MOOD_LIGHT = [[[200, 60, 60], 0.25, 0.5], [[255, 46, 30], 0.6, 0.7], [[214, 76, 92], 0.4, 0.4], [[130, 150, 230], 0.42, 0.5], [[120, 140, 210], 0.36, 0.2], [[255, 206, 166], 0.45, 0.1], [[255, 226, 176], 0.6, 0.05]];
    const moodLight = c => {
      const m = c.mood || 0, i = Math.min(Math.floor(m), MOOD_LIGHT.length - 2), k = smoothstep(m - i), A = MOOD_LIGHT[i], B = MOOD_LIGHT[i + 1];
      return { color: mixc(A[0], B[0], k), i: lerp(A[1], B[1], k), flicker: lerp(A[2], B[2], k) };
    };
    // where the room's furniture will stand (x0, x1, z0, z1, as buildBedroom puts them): the bed, the nightstand, the chair, the
    // dresser; a thing lying there, or against or beyond a wall, is in the way of the room
    const FURNITURE = [[-0.8, 0.8, -1.05, 1.9], [0.95, 1.45, -0.1, 0.4], [-2.6, -2.15, -0.9, -0.45], [-2.9, -1.5, 3.05, 3.55]];
    const inTheWay = it => {
      const q = rotY(it.x, it.z, -L.facing), m = 0.5 * Math.max(it.w, it.h);
      return q[0] < ROOM.x0 + m || q[0] > ROOM.x1 - m || q[1] < ROOM.z0 + m || q[1] > ROOM.z1 - m || FURNITURE.some(f => q[0] > f[0] - m && q[0] < f[1] + m && q[1] > f[2] - m && q[1] < f[3] + m);
    };
    const sun = (() => { const d = [-1, -0.45, -0.15], n = Math.hypot(d[0], d[1], d[2]); return { x: 3.4, y: 2.4, z: 1.6, r: 12, i: 0.55, color: [255, 244, 210], cone: { x: d[0] / n, y: d[1] / n, z: d[2] / n, cos: Math.cos(40 * DEG) } }; })();
    const meadow = buildMeadow(L, s, c0);
    L.update = dt => {
      const c = c0();
      fallStep(dt);
      c.anger = G.inv.length;
      c.rage += ((c.anger > 0 ? Math.min(1, 0.6 + 0.4 * c.anger / 6) : 0) - c.rage) * Math.min(1, dt * 4);   // anything held and it is plainly enraged
      // empty-handed and facing it, the view lifts to its face as it looms in over the last few metres: you look up at it.
      // Looking down (a target below the horizon), or turning away, takes the view back as it was.
      if (!s.ending && G.state === 'play') {
        const near = smoothstep(clamp((6 - c.dist) / 4.5, 0, 1));
        if (near > 0 && !G.inv.length && G.cam.tPitch <= 0 && facingIt(c)) G.cam.tPitch = -Math.atan2(c.CR.faceY - L.eyeH, Math.max(c.dist, 0.6)) * 0.8 * near;
        else if (G.cam.tPitch < 0) G.cam.tPitch = 0;
      }
      if (!s.ending) return;
      s.endT += dt; const t = s.endT, still = !!SAVE.data.settings.reducedMotion;
      c.still = still;
      // it holds you: its arms come out to you and close round you, it stoops to you, and its face goes through everything it
      // was; a moment after it is happy it lets go and straightens up, settled
      c.settle = span(t, 0, END.settle);
      const letGo = span(t, END.release, END.release + 1.4), drop = span(t, END.release + 0.6, END.release + 2.0);
      const reach = span(t, END.reach[0], END.reach[1]) * (1 - drop), wrap = span(t, END.close[0], END.close[1]) * (1 - letGo);
      c.yOff = -0.62 * span(t, END.stoop[0], END.stoop[1]) * (1 - span(t, END.release + 0.2, END.release + 1.8));
      s.hugWrap = wrap;
      c.calm = span(t, END.release, END.release + 1.6);
      c.hug = reach > 0.001 || wrap > 0.001 ? { reach, wrap } : null;
      c.mood = moodAt(t);
      // a thing this close is drawn from its feet: looked up at too steeply, they would be behind the eye and it would vanish,
      // so the view never looks up further than keeps them in front (it bends down to you, so the view comes level anyway)
      const up = Math.atan(0.7 * c.dist / Math.max(0.5, L.eyeH - c.pos().y - c.yOff));
      if (G.cam.pitch < -up) G.cam.pitch = -up;
      if (t >= END.close[1] && !s.held) { s.held = true; AUDIO.voice('exhale', 0.5, 0); }   // it has hold of you
      if (t >= END.moods + 3 * (END.blend + END.hold) && !s.sob) { s.sob = true; AUDIO.voice('slow', 0.45, 0); }   // the sorrow
      if (t >= END.moods + 5 * (END.blend + END.hold) && !s.hum) { s.hum = true; AUDIO.voice('hum', 0.5, 0); }   // happy
      // the light comes: the void opens into the meadow in the sun; later, after a press, the meadow goes and the room is there
      const mv = s.meadow = span(t, END.light[0], END.light[1]);
      if (s.leaving) s.leaveT += dt;
      const lt = s.leaveT, lv = s.lv = s.leaving ? span(lt, 0, 3.0) : 0, room = s.room = s.leaving ? span(lt, 0.5, 3.4) : 0, rvBeyond = smoothstep(clamp((room - 0.75) / 0.25, 0, 1));
      s.reveal = mv;
      L.eyeH = lerp(1.65, 1.15, room);   // in the bed, sitting up
      const dark = 1 - span(mv, 0, 0.55);
      for (const p of voidProps) p.alpha = p.alpha0 * dark;
      for (const p of roomProps) p.alpha = turned(p) ? 0 : p.alpha0 * (p.beyond ? rvBeyond : room);
      const pal = k => mv < 0.4 ? mixc(VOID_PAL[k], DAWN_PAL[k], mv / 0.4) : mixc(DAWN_PAL[k], MEADOW_PAL[k], (mv - 0.4) / 0.6);
      for (const k of ['skyTop', 'fog', 'ground']) L.pal[k] = mixc(pal(k), MORNING_PAL[k], lv);
      L.pal.fogDist = lerp(mv < 0.4 ? lerp(VOID_PAL.fogDist, DAWN_PAL.fogDist, mv / 0.4) : lerp(DAWN_PAL.fogDist, MEADOW_PAL.fogDist, (mv - 0.4) / 0.6), MORNING_PAL.fogDist, lv);
      c.soft = mv;
      // everything on the floor goes with the dark, one thing at a time: first what lies where the bed, the nightstand, the
      // chair or a wall will be
      const left = L.items.filter(i => !i.taken);
      if (mv > 0.08 && left.length && mv > s.gone) { (left.find(inTheWay) || left[0]).taken = true; s.gone = mv + 0.5 / tools.length; }
      if (mv > 0.05 && !s.dawn) { s.dawn = true; AUDIO.stopAmbient(); if (AUDIO.on()) AUDIO.startAmbient({ wind: 0.32, drone: 0, windFreq: 760 }); WEATHER.set({ kind: 'motes', density: 1.0, wind: 0.15 }, 7); }   // a breeze, and pollen in the sun
      if (mv > 0.3) { s.birdT = (s.birdT === undefined ? 0.5 : s.birdT) - dt; if (s.birdT <= 0) { s.birdT = 1.5 + Math.random() * 2.8; AUDIO.sfx('birds', Math.random() * 1.6 - 0.8, true); } }
      // in the meadow it dances a little to the tune; then, while the meadow waits, now and then a little more
      let dance = t > END.dance[0] && t < END.dance[1] ? Math.min(1, (t - END.dance[0]) * 2, (END.dance[1] - t) * 2) : 0;
      const u = (t - END.dance[1] - 7) % 12;
      if (t > END.dance[1] + 7 && u < 2.6 && !s.leaving) dance = 0.5 * Math.min(1, u * 2, (2.6 - u) * 2);
      c.dance = still ? 0 : dance;
      if (t > END.dance[0] && !s.tune) { s.tune = true; AUDIO.sfx('musicbox', 0); }
      if (t > END.dance[0] + 3.2 && !s.tune2) { s.tune2 = true; AUDIO.sfx('musicbox', 0); }
      if (t >= END.wait) s.wait = true;
      // after the press it fades from the meadow, glittering as it goes
      c.fade = s.leaving ? clamp(1 - (lt - 0.3) / 2.0, 0, 1) : 1;
      meadow.update();
    };
    // the meadow waits for as long as you like: a click, a key, a tap or A goes on (not in the first moment of it, so a press
    // made while it was still coming does not throw it away). From the moment it reaches you the ending takes every press, so
    // nothing (R included) can cut it short while it holds you, and nothing but going on is done in the meadow. A key that only
    // goes somewhere else (alt-tab, a screenshot's chord, a function key) is not a press: the meadow stays.
    const aside = e => !!e && (e.ctrlKey || e.metaKey || e.altKey || /^(Shift|Control|Alt|AltGraph|Meta|OS|CapsLock|NumLock|ScrollLock|Fn|FnLock|ContextMenu|PrintScreen|Unidentified|F\d{1,2})$/.test(e.key || ''));
    L.onPress = e => {
      if (!s.ending) return false;
      if (!aside(e) && s.wait && !s.leaving && s.endT >= END.arm) { s.leaving = true; s.leaveT = 0; s.glitterAt = s.endT + 0.3; AUDIO.sfx('win'); }
      return true;
    };
    L.aftermath = () => s.leaving && s.leaveT >= END.leave;
    // the view: up into its face while it holds you, then level, on it, in the meadow, and so on the room
    L.watchUp = 0.75;
    L.watchPoint = () => {
      const c = c0(), p = c.pos(), k = span(s.endT, END.release + 0.4, END.release + 3.6);
      return { x: p.x, y: lerp(p.y + c.yOff + CREATURES.demon.eyesY(c) - 0.17, L.eyeH + 0.05, k), z: p.z };
    };
    // each thing on the void's floor lies in a faint cold pool of its own, so its dark iron and black frames show against the
    // dark (and it reads as put down, not lost); the pools go with the void
    const POOL = [78, 76, 90];
    const pools = () => {
      const k = 1 - s.reveal; if (k <= 0.01) return;
      const fx = Math.sin(R.yaw), fz = Math.cos(R.yaw);   // a flat decal's "up" runs along the view, as an item card's does
      for (const it of L.items) {
        if (it.taken) continue;
        const pw = it.w + 0.32, ph = it.h + 0.36, x = it.x - fx * 0.18, z = it.z - fz * 0.18;
        R.add({ kind: 'sprite', x, y: 0.002, z, w: pw, h: ph, flat: true, layer: 0, sortDist: 0.01, noLight: true, draw: (ctx, P) => {   // unlit, as the floor is
          ctx.scale(pw, ph);
          const g = ctx.createRadialGradient(0, 0.5, 0, 0, 0.5, 0.5);
          g.addColorStop(0, P.cola(POOL, 0.42 * k)); g.addColorStop(0.6, P.cola(POOL, 0.24 * k)); g.addColorStop(1, P.cola(POOL, 0));
          ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1);
        } });
      }
    };
    L.dynamic = () => {
      pools();
      fallDraw();
      meadow.draw();
      if (s.glitterAt < 0) return;
      // the glitter: sparks spiralling up and out from where it stood, twinkling, gone in a few seconds (with reduced motion
      // they drift up and out without turning; with reduced flashing they glow steadily as they go)
      const c = c0(), p = c.pos(), k = s.endT - s.glitterAt, S = SAVE.data.settings;
      if (k < 0 || k > 3.2) return;
      for (let i = 0; i < 46; i++) {
        const a = i * 2.39996 + (S.reducedMotion ? 0 : k * (0.8 + (i % 5) * 0.2)), r = 0.12 + (i % 7) * 0.06 + k * (0.25 + (i % 3) * 0.12), y = 0.2 + (i % 11) * 0.19 + k * (0.35 + (i % 4) * 0.18);
        const tw = S.reducedFlash ? 0.7 : 0.5 + 0.5 * Math.sin(k * 14 + i * 1.7), al = clamp(1.2 - k / 2.6, 0, 1) * (0.35 + 0.65 * tw), sz = 0.05 + (i % 3) * 0.025;
        const col = (i % 4) === 0 ? [255, 214, 120] : (i % 4) === 1 ? [255, 190, 220] : [255, 250, 236];
        R.add(SC.mkSprite(L, p.x + Math.sin(a) * r, y, p.z + Math.cos(a) * r, sz, sz, (ctx, P) => {
          ctx.globalAlpha *= al; ctx.scale(sz, sz); ctx.fillStyle = P.raw(col);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0.12, 0.38); ctx.lineTo(0.5, 0.5); ctx.lineTo(0.12, 0.62); ctx.lineTo(0, 1); ctx.lineTo(-0.12, 0.62); ctx.lineTo(-0.5, 0.5); ctx.lineTo(-0.12, 0.38); ctx.closePath(); ctx.fill();
        }, { noFog: true, noLight: true }));
      }
    };
    L.dynamicLights = () => {
      const c = c0(), p = c.pos(), a = (c.rage || 0) * (1 - (c.calm || 0)), out = [], m = s.meadow * (1 - s.lv);
      if (c.fade > 0.05 && s.ending) {   // (a little brighter as it takes hold of you, so its arms show coming)
        const ml = moodLight(c), more = 0.16 * span(s.endT, 0.3, 2.6) * (1 - Math.min(1, c.mood || 0));
        out.push({ x: p.x, y: 1.4, z: p.z, r: 3, i: (ml.i + more) * (1 - s.reveal) * c.fade, color: ml.color, flicker: ml.flicker, seed: 13 });
      }
      else if (c.fade > 0.05) out.push({ x: p.x, y: 1.4, z: p.z, r: 3 + a * 4, i: (0.25 + a * 0.5) * (1 - s.reveal) * c.fade, color: [200, 60, 60], flicker: 0.5, seed: 13 });
      if (m > 0.01) out.push({ x: p.x * 0.6 - 2, y: 4.5, z: p.z * 0.6 - 1, r: 10, i: 0.32 * m, color: [255, 238, 200] });   // the sun on it
      if (s.room > 0.01) out.push(Object.assign({}, sun, { i: sun.i * s.room }));
      return out;
    };
    L.glows = () => {
      const out = meadow.glows();
      if (s.room > 0.01) out.push({ x: 2.2, y: 1.45, z: 1.6, r: 2.2, color: [255, 246, 220], a: 0.4 * s.room });
      return out.length ? out : null;
    };
    L.overlay = (ctx, W, H) => meadow.overlay(ctx, W, H);
    L.floor = { poly: [[-6, -6], [6, -6], [6, 6], [-6, 6]], y: 0 };
  }
});

// ---------- the meadow ----------
// Built once, drawn only while the light is there: grass rising gently away to a rim of low hills, further hills going blue
// into the haze, a big tree to the left and others further off, wild flowers in drifts, soft clouds, the sun up to the left
// with its light coming down across the view. It faces north, where the thing stands at the end (the foot of the bed will
// be there). The same meadow every time. Everything is added per frame within the view, so it costs nothing in the dark.
function buildMeadow(L, s, c0) {
  const rng = mulberry32(1313), rnd = (a, b) => a + (b - a) * rng(), fwd = L.facing;
  const at = (b, r, y) => ({ x: Math.sin(fwd + b) * r, y, z: Math.cos(fwd + b) * r });
  // the ground: flat round you, rising gently away (more to one side than the other) to a rim of low hills
  const hill = b => 2.6 + 1.5 * Math.sin(b * 2 + 0.6) + 0.8 * Math.sin(b * 5 + 2.1);
  const groundY = (b, r) => { const k = smoothstep((r - 9) / 55); return k * (hill(b) + 0.25 * Math.sin(r * 0.23 + b * 3)); };
  const BANDS = [9, 12.5, 16.5, 21, 26.5, 33, 40.5, 49, 58.5, 69];
  const RIDGES = [   // further hills: distance, height, shape, colour, how hazy at the least
    { D: 120, A: 12, ph: 0.4, col: [86, 142, 70], hz: 0.22 }, { D: 190, A: 24, ph: 2.2, col: [92, 140, 92], hz: 0.36 },
    { D: 300, A: 46, ph: 4.1, col: [104, 140, 124], hz: 0.5 }, { D: 460, A: 72, ph: 1.3, col: [118, 146, 160], hz: 0.62 },
  ];
  const ridgeY = (R0, b) => R0.A * (0.5 + 0.32 * Math.sin(b * 3 + R0.ph) + 0.18 * Math.sin(b * 7 + R0.ph * 2));
  let still = false;
  const sway = (ph, x) => still ? 0 : Math.sin(G.t * 1.6 + ph + x * 0.35) + 0.4 * Math.sin(G.t * 2.9 + ph * 1.7);
  // ---- wild flowers in drifts, and tufts of grass ----
  const FL = {   // stem height, head size, colours
    daisy: { h: [0.13, 0.26], col: [250, 250, 242], mid: [246, 196, 44] }, buttercup: { h: [0.14, 0.28], col: [252, 214, 36], mid: [255, 236, 120] },
    poppy: { h: [0.18, 0.32], col: [226, 42, 34], mid: [40, 22, 26] }, cornflower: { h: [0.16, 0.3], col: [84, 116, 236], mid: [52, 70, 170] },
    clover: { h: [0.07, 0.14], col: [222, 128, 190], mid: [246, 176, 214] }, forgetme: { h: [0.08, 0.16], col: [128, 176, 250], mid: [250, 236, 120] },
  };
  const KINDS = Object.keys(FL);
  const sprites = [];
  const flower = (b, r, kind) => {
    const f = FL[kind], h = rnd(f.h[0], f.h[1]), ph = rnd(0, TAU), size = rnd(1.3, 1.75), y = groundY(b, r), q = at(b, r, y), leaf = rng() < 0.5 ? 1 : -1;
    const p = { kind: 'sprite', x: q.x, y, z: q.z, w: 0.2, h: h + 0.08, layer: 1, noLight: true, noContact: true, b, r, bloom: rnd(0.38, 0.72), alpha: 0, grow: 1, draw: (ctx, P) => {
      const k = p.grow, sx = sway(ph, q.x) * 0.035 * h, hh = h * k, hx = sx, hs = size * k;
      if (r > 20) { P_ell(ctx, hx, hh, 0.035 * hs, 0.03 * hs, P.col(f.col)); return; }   // far off, a dot of colour
      ctx.strokeStyle = P.col([70, 128, 50]); ctx.lineWidth = 0.012; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(hx * 0.2, hh * 0.55, hx, hh); ctx.stroke();
      if (r < 7) P_ell(ctx, hx * 0.2 + leaf * 0.016, hh * 0.32, 0.018, 0.007, P.col([84, 142, 58]), leaf * 0.5);   // a leaf
      if (r > 11) { P_ell(ctx, hx, hh, 0.03 * hs, 0.026 * hs, P.col(f.col)); return; }
      if (kind === 'daisy') {
        ctx.fillStyle = P.col(f.col); ctx.beginPath();
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + ph; ctx.moveTo(hx, hh); ctx.ellipse(hx + Math.cos(a) * 0.022 * hs, hh + Math.sin(a) * 0.018 * hs, 0.016 * hs, 0.007 * hs, a, 0, TAU); }
        ctx.fill(); P_ell(ctx, hx, hh, 0.011 * hs, 0.01 * hs, P.col(f.mid));
      } else if (kind === 'poppy') {
        P_ell(ctx, hx - 0.012 * hs, hh + 0.004, 0.024 * hs, 0.022 * hs, P.col(scalec(f.col, 0.86))); P_ell(ctx, hx + 0.01 * hs, hh + 0.006, 0.026 * hs, 0.024 * hs, P.col(f.col));
        P_ell(ctx, hx, hh + 0.012 * hs, 0.008 * hs, 0.006 * hs, P.col(f.mid));
      } else if (kind === 'cornflower') {
        ctx.fillStyle = P.col(f.col); ctx.beginPath();
        for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + ph; ctx.moveTo(hx, hh); ctx.lineTo(hx + Math.cos(a - 0.22) * 0.026 * hs, hh + Math.sin(a - 0.22) * 0.022 * hs); ctx.lineTo(hx + Math.cos(a + 0.22) * 0.026 * hs, hh + Math.sin(a + 0.22) * 0.022 * hs); ctx.closePath(); }
        ctx.fill(); P_ell(ctx, hx, hh, 0.008 * hs, 0.008 * hs, P.col(f.mid));
      } else if (kind === 'forgetme') {
        for (let i = 0; i < 4; i++) P_ell(ctx, hx + Math.cos(i * 1.9 + ph) * 0.016 * hs, hh + Math.sin(i * 1.9 + ph) * 0.012 * hs, 0.01 * hs, 0.009 * hs, P.col(f.col));
        P_ell(ctx, hx, hh, 0.005 * hs, 0.005 * hs, P.col(f.mid));
      } else {   // buttercup, clover: a round head with a lighter middle
        P_ell(ctx, hx, hh, 0.02 * hs, 0.018 * hs, P.col(f.col)); P_ell(ctx, hx - 0.005 * hs, hh + 0.005 * hs, 0.008 * hs, 0.007 * hs, P.col(f.mid));
      }
    } };
    sprites.push(p);
  };
  const tuft = (b, r) => {
    const n = 4 + Math.floor(rng() * 3), h = rnd(0.14, 0.32), ph = rnd(0, TAU), y = groundY(b, r), q = at(b, r, y), blades = [];
    for (let i = 0; i < n; i++) blades.push([(i - (n - 1) / 2) * 0.014, rnd(-0.07, 0.07), h * rnd(0.6, 1.1), rng() < 0.5]);
    const p = { kind: 'sprite', x: q.x, y, z: q.z, w: 0.22, h: h + 0.04, layer: 1, noLight: true, noContact: true, b, r, bloom: rnd(0.3, 0.6), alpha: 0, grow: 1, draw: (ctx, P) => {
      const sw = sway(ph, q.x) * 0.03;
      for (const light of [false, true]) {
        ctx.fillStyle = P.col(light ? [126, 178, 78] : [72, 128, 50]); ctx.beginPath();
        for (const [x0, lean, bh, lt] of blades) { if (lt !== light) continue; const hh = bh * p.grow; ctx.moveTo(x0 - 0.007, 0); ctx.quadraticCurveTo(x0 + lean * 0.3, hh * 0.6, x0 + lean + sw * hh, hh); ctx.quadraticCurveTo(x0 + lean * 0.3 + 0.004, hh * 0.6, x0 + 0.007, 0); ctx.closePath(); }
        ctx.fill();
      }
    } };
    sprites.push(p);
  };
  // drifts of one or two kinds, thicker toward the north, and flowers and grass scattered everywhere between
  for (let i = 0; i < 80; i++) {
    const b = i < 54 ? rnd(-1.3, 1.3) : rnd(-Math.PI, Math.PI), r = (i < 20 ? rnd(2.6, 7) : rnd(2.6, 24)) * (i < 54 ? 1 : 0.8), k1 = KINDS[Math.floor(rng() * KINDS.length)], k2 = KINDS[Math.floor(rng() * KINDS.length)], n = 6 + Math.floor(rng() * 14), spread = 0.6 + r * 0.07;
    for (let j = 0; j < n; j++) { const rr = Math.max(1.9, r + rnd(-spread, spread)), bb = b + rnd(-spread, spread) / rr; if (Math.abs(wrapPi(bb - b)) < 1) flower(bb, rr, rng() < 0.7 ? k1 : k2); }
  }
  for (let i = 0; i < 380; i++) flower(rnd(-Math.PI, Math.PI), 1.9 + Math.pow(rng(), 1.4) * 26, KINDS[Math.floor(rng() * KINDS.length)]);
  for (let i = 0; i < 520; i++) tuft(rnd(-Math.PI, Math.PI), 1.7 + Math.pow(rng(), 1.6) * 13);
  // ---- trees: a big one to the left, a smaller one to the right further off, and clumps along the rim and the hills ----
  const tree = (b, r, H, layer, sd, seed) => {
    const tr = mulberry32(seed), y = groundY(b, r), q = at(b, r, y), blobs = [];
    for (let i = 0; i < 11; i++) { const a = tr() * TAU, d = Math.sqrt(tr()); blobs.push([Math.cos(a) * d * 0.36, 0.66 + Math.sin(a) * d * 0.2 + (i < 3 ? 0.12 : 0), 0.13 + tr() * 0.09]); }
    const p = { kind: 'sprite', x: q.x, y, z: q.z, w: H * 1.0, h: H, layer, noLight: true, noContact: true, b, r, bloom: 0.3, alpha: 0, grow: 1, draw: (ctx, P) => {
      ctx.scale(H, H);
      const bark = P.col([104, 78, 54]);
      P_poly(ctx, [[-0.045, 0], [0.045, 0], [0.026, 0.56], [-0.026, 0.56]], bark);
      P_limb(ctx, [[0, 0.42], [-0.12, 0.6]], 0.022, bark); P_limb(ctx, [[0.01, 0.46], [0.14, 0.62]], 0.018, bark);
      // the crown: its shadowed underside, the body of it, and the sunlit upper left
      const sw = still ? 0 : Math.sin(G.t * 0.9 + seed) * 0.006;
      for (const [dx, dy, col, k] of [[0.025, -0.03, [48, 98, 44], 1], [0, 0, [74, 136, 56], 0.92], [-0.03, 0.03, [126, 182, 80], 0.62]]) {
        ctx.fillStyle = P.col(col); ctx.beginPath();
        for (const [bx, by, br] of blobs) { const x = bx + dx + sw * by, yy = by + dy; ctx.moveTo(x + br * k, yy); ctx.arc(x, yy, br * k, 0, TAU); }
        ctx.fill();
      }
    } };
    if (sd !== undefined) p.sortDist = sd;
    sprites.push(p);
    // its shadow on the grass, cast away from the sun
    if (layer === 1) sprites.push({ kind: 'sprite', x: q.x + Math.cos(fwd) * H * 0.18, y: y + 0.004, z: q.z - Math.sin(fwd) * H * 0.18, w: H * 0.9, h: H * 0.36, flat: true, layer: 0, sortDist: 0.02, noLight: true, noContact: true, b, r, bloom: 0.3, alpha: 0, grow: 1, draw: (ctx, P) => { ctx.scale(H * 0.9, H * 0.36); const g = ctx.createRadialGradient(0, 0.5, 0, 0, 0.5, 0.5); g.addColorStop(0, P.cola([50, 96, 38], 0.42)); g.addColorStop(0.7, P.cola([50, 96, 38], 0.25)); g.addColorStop(1, P.cola([50, 96, 38], 0)); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); } });
  };
  tree(-0.72, 11.5, 7.6, 1, undefined, 21);
  tree(0.62, 31, 6.4, 0, 500 + 31 - 0.01, 22);
  tree(0.86, 36, 5.2, 0, 500 + 36 - 0.01, 23);
  tree(-1.9, 18, 6.8, 1, undefined, 24);
  tree(2.4, 22, 6.2, 1, undefined, 25);
  for (let i = 0; i < 26; i++) { const b = rnd(-Math.PI, Math.PI), r = rnd(58, 68); tree(b, r, rnd(4.5, 7), 0, 500 + r - 0.01, 40 + i); }
  for (let i = 0; i < 18; i++) { const R0 = RIDGES[i % 2], b = rnd(-Math.PI, Math.PI), q = at(b, R0.D, ridgeY(R0, b) * 0.85); const p = { kind: 'sprite', x: q.x, y: q.y, z: q.z, w: 9, h: 9, layer: 0, sortDist: 1000 + R0.D - 0.01, noLight: true, noContact: true, b, r: R0.D, bloom: 0.25, alpha: 0, grow: 1, hz: R0.hz, draw: (ctx, P) => { ctx.scale(9, 9); ctx.fillStyle = rgba(mixc([56, 104, 52], L.pal.fog, Math.max(p.hz, 1 - Math.exp(-p.r / L.pal.fogDist)))); ctx.beginPath(); ctx.arc(-0.18, 0.4, 0.3, 0, TAU); ctx.arc(0.16, 0.45, 0.34, 0, TAU); ctx.arc(0, 0.62, 0.3, 0, TAU); ctx.fill(); } }; sprites.push(p); }
  // ---- clouds, soft and white, drifting ----
  const clouds = [];
  for (let i = 0; i < 14; i++) {
    const b0 = i < 10 ? -1.1 + i * 0.24 + rnd(-0.1, 0.1) : rnd(-Math.PI, Math.PI), el = rnd(8, 27) * DEG, D = 700, w = rnd(170, 340), h = w * rnd(0.28, 0.4), puffs = [];
    for (let k = 0; k < 7; k++) puffs.push([rnd(-0.36, 0.36), rnd(0.12, 0.42), rnd(0.13, 0.24)]);
    const p = { kind: 'sprite', x: 0, y: Math.sin(el) * D, z: 0, w, h, b0, el, D, drift: rnd(0.003, 0.006), noFog: true, noLight: true, layer: 0, dist: D, sortDist: 2000, alpha: 0, draw: ctx => {
      ctx.scale(w, h);
      ctx.save(); ctx.beginPath(); ctx.rect(-1, 0.1, 2, 1); ctx.clip();
      for (const [dx, dy, col] of [[0, 0, [222, 230, 244]], [-0.015, 0.03, [255, 255, 255]]]) { ctx.fillStyle = rgba(col); ctx.beginPath(); for (const [x, y, r] of puffs) { ctx.moveTo(x + dx + r, y + dy); ctx.ellipse(x + dx, y + dy, r, r * 0.8, 0, 0, TAU); } ctx.fill(); }
      ctx.restore();
    } };
    clouds.push(p);
  }
  // ---- two butterflies about it ----
  const flies = [[255, 224, 96], [236, 242, 255]].map((col, i) => ({ kind: 'sprite', x: 0, y: 0, z: 0, w: 0.12, h: 0.1, layer: 1, noLight: true, noContact: true, alpha: 0, draw: ctx => {
    const flap = still ? 0.7 : 0.25 + 0.75 * Math.abs(Math.sin(G.t * 13 + i * 2));
    ctx.scale(0.12, 0.1); ctx.fillStyle = rgba(col);
    for (const sd of [-1, 1]) { P_ell(ctx, sd * 0.24 * flap, 0.62, 0.24 * flap, 0.3, rgba(col)); P_ell(ctx, sd * 0.18 * flap, 0.3, 0.17 * flap, 0.2, rgba(scalec(col, 0.92))); }
    P_line(ctx, 0, 0.2, 0, 0.8, 0.06, 'rgb(60,50,40)');
  } }));
  // the sun: up to the left, a little above the view
  const SUN = at(-0.62, 100, 1.65 + Math.tan(28 * DEG) * 100);
  // the ground as polygons across the view: the bands of the slope, and the hills beyond, each a single shape
  const W = 1.12, STEP = 0.07;
  const polys = [];
  function groundPolys(center, a) {
    polys.length = 0;
    const bs = []; for (let b = center - W; b <= center + W + 1e-6; b += STEP) bs.push(b);
    RIDGES.forEach((R0, n) => {
      const pts = [], col = mixc(R0.col, L.pal.fog, Math.max(R0.hz, 1 - Math.exp(-R0.D / L.pal.fogDist)));
      for (const b of bs) { const q = at(b, R0.D, ridgeY(R0, b)); pts.push([q.x, q.y, q.z]); }
      const e1 = at(bs[bs.length - 1], R0.D, -3), e0 = at(bs[0], R0.D, -3); pts.push([e1.x, e1.y, e1.z], [e0.x, e0.y, e0.z]);
      polys.push({ kind: 'poly', pts, color: col, noFog: true, noLight: true, layer: 0, dist: R0.D, sortDist: 1000 + R0.D, cx: 0, cy: 0, cz: 0, alpha: a });
    });
    for (let j = BANDS.length - 2; j >= 0; j--) {
      const r0 = BANDS[j], r1 = BANDS[j + 1], pts = [];
      for (const b of bs) { const q = at(b, r1, groundY(b, r1)); pts.push([q.x, q.y, q.z]); }
      for (let i = bs.length - 1; i >= 0; i--) { const b = bs[i], q = at(b, r0, groundY(b, r0)); pts.push([q.x, q.y, q.z]); }
      const col = mixc(MEADOW_PAL.ground, [128, 180, 76], j / (BANDS.length - 2));   // further up the slope, more in the sun
      polys.push({ kind: 'poly', pts, color: col, noLight: true, layer: 0, dist: (r0 + r1) / 2, sortDist: 500 + (r0 + r1) / 2, cx: 0, cy: 0, cz: 0, alpha: a });
    }
    return polys;
  }
  const meadowIn = () => s.meadow * (1 - s.lv);
  return {
    update() { still = !!SAVE.data.settings.reducedMotion; },
    draw() {
      const m = meadowIn(); if (m <= 0.004) return;
      const view = wrapPi(R.yaw - fwd), ga = smoothstep((s.meadow - 0.12) / 0.5) * (1 - s.lv);
      for (const p of groundPolys(view, ga)) R.add(p);
      const ca = smoothstep((s.meadow - 0.35) / 0.5) * (1 - s.lv);
      for (const p of clouds) { const b = p.b0 + (still ? 0 : G.t * p.drift * 0.1), r = p.D * Math.cos(p.el); p.x = Math.sin(fwd + b) * r; p.z = Math.cos(fwd + b) * r; p.alpha = ca; if (Math.abs(wrapPi(b - view)) < 1.3) R.add(p); }
      for (const p of sprites) {
        if (Math.abs(wrapPi(p.b - view)) > (p.r < 4 ? 1.25 : 0.9)) continue;
        const k = smoothstep((s.meadow - p.bloom) / 0.28);   // each comes up in its turn, growing as it comes
        p.alpha = k * (1 - s.lv); p.grow = 0.55 + 0.45 * k;
        if (p.alpha > 0.004) R.add(p);
      }
      // the butterflies keep near it, at about its waist, flitting
      const c = c0(), cp = c.pos(), fa = smoothstep((s.meadow - 0.8) / 0.2) * (1 - s.lv) * Math.max(0, c.fade);
      if (fa > 0.004) flies.forEach((p, i) => {
        const tt = still ? 3 + i * 4 : G.t, side = i ? 1 : -1, ax = Math.cos(c.yaw), az = -Math.sin(c.yaw);
        const lat = side * (0.75 + 0.3 * Math.sin(tt * 0.7 + i * 2)), fwdOff = 0.35 * Math.sin(tt * 0.5 + i);
        p.x = cp.x + ax * lat - Math.sin(c.yaw) * fwdOff; p.z = cp.z + az * lat - Math.cos(c.yaw) * fwdOff; p.y = 0.9 + 0.35 * Math.sin(tt * 1.3 + i * 2.5) + 0.06 * Math.sin(tt * 7 + i);
        p.alpha = fa; p.dist = undefined; R.add(p);
      });
    },
    glows() {
      const m = meadowIn(); if (m <= 0.01) return [];
      return [{ x: SUN.x, y: SUN.y, z: SUN.z, r: 62, color: [255, 232, 180], a: 0.42 * m }, { x: SUN.x, y: SUN.y, z: SUN.z, r: 18, color: [255, 250, 230], a: 0.5 * m }];
    },
    overlay(ctx, W, H) {
      const m = meadowIn();
      // the sunlight coming down across the view from the upper left, in a few soft broad rays
      if (m > 0.01) {
        const sp = R.screenPos(SUN.x, SUN.y, SUN.z);
        if (sp) {
          const base = Math.atan2(H * 0.75 - sp.y, W * 0.55 - sp.x), len = Math.hypot(W, H) * 1.3, flick = still ? 0 : G.t;
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 6; i++) {
            const a = base + (i - 2.5) * 0.11 + Math.sin(flick * 0.13 + i * 1.7) * 0.012, hw = 0.022 + (i % 3) * 0.012, al = m * (0.04 + 0.02 * Math.sin(flick * 0.31 + i * 2.3));
            const g = ctx.createLinearGradient(sp.x, sp.y, sp.x + Math.cos(a) * len, sp.y + Math.sin(a) * len);
            g.addColorStop(0, 'rgba(255,244,214,' + al.toFixed(3) + ')'); g.addColorStop(0.55, 'rgba(255,244,214,' + (al * 0.4).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,244,214,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sp.x, sp.y); ctx.lineTo(sp.x + Math.cos(a - hw) * len, sp.y + Math.sin(a - hw) * len); ctx.lineTo(sp.x + Math.cos(a + hw) * len, sp.y + Math.sin(a + hw) * len); ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        }
      }
      // a soft line while it waits: nothing to do here but be here
      const la = s.wait ? smoothstep((s.endT - END.line) / 2.5) * (1 - (s.leaving ? smoothstep(s.leaveT / 0.6) : 0)) : 0;
      if (la > 0.01) {
        const ts = SAVE.data.settings.textSize || 1;
        ctx.save(); ctx.font = Math.round(17 * ts) + 'px Georgia, "Times New Roman", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0.16em';
        const ly = H - 58 * ts, bg = ctx.createRadialGradient(W / 2, ly, 0, W / 2, ly, 260 * ts);
        bg.addColorStop(0, 'rgba(24,44,16,' + (0.42 * la).toFixed(3) + ')'); bg.addColorStop(0.6, 'rgba(24,44,16,' + (0.2 * la).toFixed(3) + ')'); bg.addColorStop(1, 'rgba(24,44,16,0)'); ctx.fillStyle = bg; ctx.save(); ctx.translate(W / 2, ly + 10 * ts); ctx.scale(1, 0.2); ctx.translate(-W / 2, -ly); ctx.fillRect(W / 2 - 260 * ts, ly - 260 * ts, 520 * ts, 520 * ts); ctx.restore();
        ctx.shadowColor = 'rgba(20,40,12,' + (0.7 * la).toFixed(3) + ')'; ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255,252,240,' + (0.9 * la).toFixed(3) + ')'; ctx.fillText('Stay as long as you like.', W / 2, ly);
        // and, a little later and smaller, how to go on (as the night's card says it)
        const lb = la * smoothstep((s.endT - END.line - 3) / 2.5);
        if (lb > 0.01) {
          ctx.font = Math.round(11 * ts) + 'px Georgia, "Times New Roman", serif'; if ('letterSpacing' in ctx) ctx.letterSpacing = '0.22em';
          ctx.fillStyle = 'rgba(255,252,240,' + (0.8 * lb).toFixed(3) + ')'; ctx.fillText('CLICK WHEN YOU ARE READY', W / 2, ly + 26 * ts);
        }
        ctx.restore();
      }
    },
  };
}
