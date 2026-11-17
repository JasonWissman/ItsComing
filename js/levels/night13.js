'use strict';
/* global CLEARING_BOW, PAD */   // (night 5's bow, js/levels/night05.js: drawn here as it was there; js/game.js's gamepad state)
// ============================================================ 13. THE VOID ============================================================
// Nothing at all: a faint floor that fades into black. Around you lies everything you ever held against it, and your hands
// are empty. It comes from anywhere, a tall thing in a black hood. Take up anything and it is enraged: it screeches, and
// comes on in fits; put it all down again and it calms, and is quiet. The ending plays out here, without a cut: caught
// empty-handed and facing it, it stops and lifts its arms, its face comes out of the dark of its hood, angry, and it takes
// hold of you; its face goes through angry, neutral, angry (leaning in at you), confused and sad, and it cries, holding you,
// and comes back to its grey neutral face. Then, still holding you, it wears the faces of all the others, one after
// another, each as it was when it came up into your face, and behind it each one's night shows faint and still: it was
// this one all along. Its own face again, in the dark, and the dark opens into a pale light; it is content, and happy,
// and the meadow comes out of the light, turning and settling into place in the sun. It lets you go and steps back, and
// there you may look about as long as you like; a press and it is the bedroom. The bow still comes up and draws as it did on night 5, but it is
// never loosed: drawn at, it comes for you, faster and faster, and is on you before the bow is full.
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
// the void; the pale void the light comes as (round you, close); the meadow, clear to the hills; and the same place as the
// void in the morning (night 12's room with the sun in it)
const VOID_PAL = { skyTop: [0, 0, 0], fog: [0, 0, 0], ground: [10, 10, 12], fogDist: 14 };
const PALE_PAL = { skyTop: [214, 206, 228], fog: [240, 232, 230], ground: [206, 198, 204], fogDist: 9 };
const MEADOW_PAL = { skyTop: [74, 138, 222], fog: [212, 230, 242], ground: [98, 158, 64], fogDist: 170 };
const MORNING_PAL = { skyTop: [150, 190, 240], fog: [236, 236, 238], ground: [200, 190, 170], fogDist: 60 };
const VOID_PALE = 0.12;   // how far the light has come (s.meadow) when it is all pale round you
// the ending, in seconds from when it reaches you
const END = {
  settle: 1.0,                          // it stops, and its head comes level
  stoop: [0.2, 2.2],                    // it bends down to your face
  near: [0.9, 3.0],                     // and comes in close
  lift: [0.8, 2.8],                     // its arms come up, the hands open, high either side of its head
  unveil: [2.2, 3.2],                   // its face comes up out of the dark of its hood, angry
  grab: [3.6, 3.95],                    // and it reaches out and takes hold of you, quick: its hands at the lower corners
  moods: 4.4,                           // then its faces in turn, each held and going into the next (CREATURES.demon.moodAt):
  lean: [7.2, 7.8, 8.8, 9.6],           // angry again, it leans in at you, close, and draws back as it is confused;
  sad: 11.55,                           // through the glitch to sad, crying
  neutral: [15.2, 16.6],                // it cries a while, holding you, and stops: its grey neutral face again
  forms: [17.0, 20.0],                  // and, still holding you, it wears the face of each thing that came for you before, one
                                        // after another, its head jumping with each, while behind it the night that thing came
                                        // in shows faint and still (VOID_RECAP); then its own face again, in the dark
  light: [20.6, 27.6],                  // the pale void, and the meadow coming out of it, turning and settling into place
  content: [22.6, 23.6], happy: [24.6, 25.6],   // content, and happy
  release: 27.6,                        // and, the meadow settled, it lets you go
  walk: [28.6, 32.2],                   // it steps back and round to the north, where the foot of the bed will be
  disrobe: [32.8, 35.4],                // and as the tune starts it takes off its robe: the hood back, the robe dropped, a hop clear
  dance: [35.0, 39.5],                  // and dances a little to the tune in its shirt and shorts
  wait: 33.4, arm: 34.0, idle: 5,       // from here the meadow is yours to look about in, and waits for a press (taken from
                                        // `arm`); if you do nothing for `idle` seconds a small line says how to go on
  leave: 4.2,                           // after the press: the meadow and it fade, the bedroom comes up, and then the last screen
};
LEVELS.push({
  id: 'void', title: 'The Void', facing: 0, eyeH: 1.65, laneMode: 'random', ending: true,
  pal: Object.assign({}, VOID_PAL),
  ambient: { tune: 'ambient:13', wind: 0.2, drone: 1.3, droneFreq: 34, windFreq: 160 },
  text: {
    intro: 'Where are you?',
    hint: 'You do not need them now.',
    objective: 'Hold nothing.',
    death: { default: 'You were still holding on to something.', away: 'It craves your fear.', fought: 'Fighting only made it stronger.' },
    win: '',
  },
  lanes: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((name, k) => ({ deg: k * 45, name, barrierDist: 0, default: k === 0 })),
  creatures: [{ type: 'demon', startDist: 40, time: 75, unseenMult: 1.3 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    Object.assign(s, { ending: false, endT: 0, reveal: 0, meadow: 0, room: 0, lv: 0, gone: 0, glitterAt: -1, wait: false, leaving: false, leaveT: 0, idle: 0, form: -1, backdrop: 0, spin: 0 });
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
    // the ring of everything: it all lies on the floor, all the way round you and within reach, each given room round the
    // ring for its width (so the bar and the bow do not lie over their neighbours), every other one a little further out;
    // you hold none of it
    const ringR = L.tier(2.0, 1.7);
    const rng = mulberry32((G.runSeed * 31 + 13) >>> 0);
    const tools = VOID_TOOLS;
    const order = tools.slice().sort(() => rng() - 0.5);
    const room = order.map(t => t[2] + 0.3), all = room.reduce((x, y) => x + y, 0);
    let along = 0;
    order.forEach(([id, name, w, h], k) => {
      const a = (along + room[k] / 2) / all * TAU + 0.2, r = ringR + (k % 2) * 0.5;
      along += room[k];
      const own = ICONS[VOID_ICONS[id] || id], held = Object.assign(G.heldSpec({ id, w, h, flat: true, icon: own }), VOID_HELD[id]);
      mkItem(L, id, name, { x: Math.sin(a) * r, y: 0, z: Math.cos(a) * r, flat: true }, { w, h, flat: true, icon: onVoidFloor(own), held, tool: id === 'bow' || id === 'matches' || id === 'hammer', uses: id === 'arrows' ? 3 : 1 });
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
      // (as far round as it takes: with all sixteen things down the ring is crowded)
      search: for (let n = 0; n <= 50; n++) for (const dd of [0, -0.15, 0.15, -0.3, 0.3]) {
        const da = n % 2 ? (n + 1) / 2 : -n / 2;
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
      if (!a || twoHanded(a) || G.state !== 'play' || bowUp()) return null;   // (the bow up, both hands are on it)
      for (let k = 1; k < G.inv.length; k++) { const o = G.inv[(G.active + k) % G.inv.length]; if (!twoHanded(o)) return o; }
      return null;
    };
    G.active = 0;
    const c0 = () => L.creatures[0];
    // ---- the bow ----
    // With the bow (or the arrows) in your hand and the bow held, looking ahead, it is night 5's bow: it comes up in both
    // hands, and holding draws it. But it is never loosed here: drawn at it, it comes for you, slowly at first and then
    // faster and faster as the string comes back, more and more enraged, and it is on you before the bow could be full (and
    // that is the end of you, never the ending). Let the string go early and the bow only comes back down, no arrow gone, and
    // it comes on at its own pace again, where it has got to: you may still put it all down. (L.uses is only the bow while
    // it is up, so nothing else here is ever drawn)
    const RUSH_AT = 0.8;   // how far drawn when it reaches you (full is 1)
    const BOW = {
      tool: 'bow', ammo: 'arrows', range: Infinity, sfx: 'twang', shake: 0.1, fireText: 'Draw.', emptyText: () => { CLEARING_BOW.grope(L); return 'No arrows.'; },
      // (let go before it is full, as you always are, the bow is let down: nothing is loosed)
      draw: { fill: CLEARING_BOW.FILL, min: CLEARING_BOW.FILL, loose: () => {} },
      inHands: (ctx, W, H, d, Lv, aim) => CLEARING_BOW.inHands(ctx, W, H, d, Lv, aim),
    };
    // (looking down at the floor it is only a thing in your hand, to be put down like any other, and seen to go)
    const bowUp = () => { const a = G.inv[G.active]; return !!a && (a.id === 'bow' || a.id === 'arrows') && G.hasItem('bow') && G.cam.tPitch < 0.3 && !s.ending; };
    Object.defineProperty(L, 'uses', { get: () => (bowUp() ? [BOW] : []), set() {}, configurable: true });
    L.bowCol = { glove: [172, 132, 108], gloveL: [204, 166, 140], sleeve: [44, 38, 37], sleeveL: [68, 60, 57] };   // (bare hands, as they are here)
    s.rush = 0; s.fought = false;   // how far drawn at it, while it is (0 if not); and whether it reached you so
    // drawing at it: from where it was when the draw began, it is brought in along its own way (its progress, c.u), on a
    // curve that starts slow and steepens, to reach you as the draw comes to RUSH_AT; it only ever comes faster than it would
    const rushStep = c => {
      const d = G.draw, drawing = !s.ending && G.state === 'play' && !!d && d.state === 'drawing' && d.u === BOW;
      if (!drawing) { s.rush = 0; s.rushFrom = null; return; }
      const uAt = dd => clamp(1 - Math.pow(dd / c.D0, 1 / c.gamma), 0, 1);
      if (c.hold !== null) { c.u = uAt(c.hold); c.hold = null; }   // (from where it stands, if anything held it)
      if (s.rushFrom === null || s.rushFrom === undefined) s.rushFrom = c.u;
      const k = s.rush = clamp(d.power / RUSH_AT, 0, 1), uc = uAt(c.catchDist * 0.9);
      c.u = Math.max(c.u, lerp(s.rushFrom, uc, k * k * (0.4 + 0.6 * k)));
    };
    const bowStep = dt => {
      CLEARING_BOW.hold(L, dt, G.state === 'play' && bowUp());
      s.bowLit = 0.8;
    };
    L.isWon = () => false;
    L.objectiveText = () => G.inv.length ? 'Put it down (' + G.inv.length + ' held).' : 'Empty-handed. Let it come.';
    // being caught empty-handed, and looking at it, is the ending, not a death: it stops close in front of you and holds you.
    // Turned away from it, or looking at the floor, as it reaches you is a death even with nothing in your hands.
    const facingIt = c => Math.abs(wrapPi(c.yaw - G.cam.yaw)) < 30 * DEG && G.cam.pitch < PITCH_DOWN * 0.5;
    L.deathCause = () => s.fought ? 'fought' : G.inv.length ? 'default' : 'away';
    const span = (t, a, b) => smoothstep(clamp((t - a) / (b - a), 0, 1));
    L.onCatch = c => {
      if (s.rush > 0) s.fought = true;   // (drawn at, it came for you: a death, whatever else)
      if (s.fought || G.inv.length > 0 || !facingIt(c)) return false;
      s.ending = true; s.endT = 0; c.frozen = true; c.hold = null;
      c.lane = Object.assign({}, c.lane, { follow: 'free', apertures: [], blockers: [] });   // placed by yaw and distance from here on
      // its head comes level from the tilt it had (as draw() has it, empty-handed); its first face is already there, in the
      // dark of the hood, not yet seen
      c.tilt0 = CREATURES.demon.tilt(c); c.settle = 0; c.mood = 0; c.unveil = 0;
      // it comes in a little closer as it takes hold of you (from as far as it was, bent down as far as it was); later it
      // steps back from you, and later still back and round to the north (the foot of the bed): CREATURES.demon.ending
      const yaw0 = c.yaw, yaw1 = L.facing;
      s.d0 = c.dist; s.y0 = c.yOff || 0;
      s.pose = CREATURES.demon.ending(END, 0, s.d0, s.y0);
      c.distFn = cr => {
        cr.yaw = yaw0 + wrapPi(yaw1 - yaw0) * span(s.endT, END.walk[0], END.walk[1]);
        return s.pose.dist;
      };
      VOID_RECAP.begin();   // (the nights gone by, drawn ready while it holds you)
      AUDIO.sfx('stingHum'); win(); return true;
    };
    const LAST = CREATURES.demon.moods - 1;
    // the light on it while it holds you follows its face: its own dull red while the face is still in the dark of the hood,
    // red hot when it is angry, grey when it is neither, cold when it is lost and sad, warm when it is content and happy (as
    // the light coming is). One for each face, in the order of DEMON_MOODS
    const DULL = [[200, 60, 60], 0.25, 0.5];
    const MOOD_LIGHT = [[[255, 46, 30], 0.6, 0.7], [[200, 176, 184], 0.34, 0.15], [[255, 46, 30], 0.6, 0.7], [[176, 170, 226], 0.4, 0.25], [[120, 140, 210], 0.36, 0.2], [[200, 176, 184], 0.34, 0.15], [[255, 206, 166], 0.45, 0.05], [[255, 226, 176], 0.6, 0.05]];
    const moodLight = c => {
      const m = c.mood || 0, i = Math.min(Math.floor(m), MOOD_LIGHT.length - 2), k = smoothstep(m - i), A = MOOD_LIGHT[i], B = MOOD_LIGHT[i + 1], u = c.unveil === undefined ? 1 : c.unveil;
      return { color: mixc(DULL[0], mixc(A[0], B[0], k), u), i: lerp(DULL[1], lerp(A[1], B[1], k), u), flicker: lerp(DULL[2], lerp(A[2], B[2], k), u) };
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
    // On Nightmare it may change its way once (js/game.js maybeSwitchLane), unseen, early on: far out in the dark. But that
    // judges it unseen by how much of it is in the view, and as it looms in over the last metre or so it fills the view and
    // more: it counted as unseen right there in front of you, changed its way at the last moment and came at you from the
    // side or behind, and, standing still facing it, you died for looking away. So once it is within SWITCH_NEAR of you it
    // keeps to its way.
    const SWITCH_NEAR = 12;
    L.update = dt => {
      const c = c0();
      fallStep(dt); bowStep(dt);
      c.anger = G.inv.length;
      rushStep(c);
      if (c.dist < SWITCH_NEAR) c.switched = true;
      const rage = c.anger > 0 ? Math.min(1, 0.6 + 0.4 * c.anger / 6) : 0;   // anything held and it is plainly enraged; drawn at, more and more
      c.rage += (lerp(rage, 1, s.rush) - c.rage) * Math.min(1, dt * (4 + 8 * s.rush));
      screech(c, dt);
      // empty-handed (and so calm), it bends down to you as it comes the last few metres, so its head is not lost over the top
      // of the view; and facing it, the view lifts to its face as it looms in: you look up at it. Looking down (a target
      // below the horizon), or turning away, takes the view back as it was.
      if (!s.ending && G.state === 'play') {
        c.yOff = -0.42 * smoothstep(clamp((3.6 - c.dist) / 2.4, 0, 1)) * (1 - clamp(c.rage, 0, 1));
        const near = smoothstep(clamp((6 - c.dist) / 4.5, 0, 1)), face = c.CR.eyesY(c) + c.yOff;
        if (near > 0 && !G.inv.length && G.cam.tPitch <= 0 && facingIt(c)) G.cam.tPitch = -Math.atan2(face - L.eyeH, Math.max(c.dist, 0.6)) * 0.8 * near;
        else if (G.cam.tPitch < 0) G.cam.tPitch = 0;
      }
      if (!s.ending) return;
      const still = !!SAVE.data.settings.reducedMotion;
      s.endT += dt;
      const t = s.endT;
      c.still = still;
      // it lifts its arms, its face comes out of the dark, angry, and it takes hold of you; its face goes through what it was
      // until it is sad, and it cries, holding you, and stops; content, happy, it lets you go and straightens up, settled
      const o = s.pose = CREATURES.demon.ending(END, t, s.d0, s.y0);
      for (const k of ['settle', 'hug', 'unveil', 'yOff', 'sob', 'calm', 'mood', 'disrobe']) c[k] = o[k];
      s.grab = o.hug ? o.hug.grab : 0;
      VOID_RECAP.step(t);   // (the next of the nights gone by, drawn ready, while it is still holding you)
      // a thing this close is drawn from its feet: looked up at too steeply, they would be behind the eye and it would vanish,
      // so the view never looks up further than keeps them in front (it bends down to you, so the view comes level anyway)
      const up = Math.atan(0.7 * c.dist / Math.max(0.5, L.eyeH - c.pos().y - c.yOff));
      if (G.cam.pitch < -up) G.cam.pitch = -up;
      if (t >= END.grab[0] && !s.grabbed) { s.grabbed = true; AUDIO.sfx('screech', 0); if (!still) G.shake(0.05); }   // it takes hold of you
      if (t >= END.grab[1] + 0.6 && !s.held) { s.held = true; AUDIO.voice('exhale', 0.5, 0); }
      if (c.mood >= 3.5 && !s.sob) { s.sob = true; s.sobT = 3.4; AUDIO.voice('slow', 0.45, 0); }   // the sorrow
      if (s.sob && c.sob > 0.5) { s.sobT -= dt; if (s.sobT <= 0) { s.sobT = 3.6; AUDIO.voice('slow', 0.38, 0); } }   // crying, holding you
      if (t >= END.neutral[1] - 0.6 && !s.breath) { s.breath = true; AUDIO.voice('exhale', 0.4, 0); }   // and it stops, with a long breath
      if (t >= END.forms[0] - 0.05 && !s.warp) { s.warp = true; AUDIO.sfx('warp', 0); }   // and it starts to change
      if (c.mood >= LAST && !s.hum) { s.hum = true; AUDIO.voice('hum', 0.5, 0); }   // happy
      if (t >= END.release && !s.let) { s.let = true; AUDIO.sfx('cloth', 0); }   // it lets you go
      // it wears the faces of the others, each in turn, and the night each came in is behind it, faint (VOID_RECAP: s.form,
      // where it is in them, a step each, and s.backdrop, whether they are there at all); then its own face again, and the
      // light: the pale void, and out of it the meadow in the sun, turning round you (s.spin) and settling into place;
      // later, after a press, the meadow goes and the room is there
      s.form = (t - END.forms[0]) / (END.forms[1] - END.forms[0]) * VOID_RECAP.count();
      c.guise = VOID_RECAP.guise(s.form, still);
      s.backdrop = c.guise ? 1 : 0;
      const mv = s.meadow = span(t, END.light[0], END.light[1]);
      s.spin = still ? 0 : 1.25 * Math.PI * Math.pow(1 - clamp((t - END.light[0]) / (END.release - END.light[0]), 0, 1), 3);
      if (s.leaving) s.leaveT += dt;
      const lt = s.leaveT, lv = s.lv = s.leaving ? span(lt, 0, 3.0) : 0, room = s.room = s.leaving ? span(lt, 0.5, 3.4) : 0, rvBeyond = smoothstep(clamp((room - 0.75) / 0.25, 0, 1));
      s.reveal = mv;
      L.eyeH = lerp(1.65, 1.15, room);   // (at the last in the bed, sitting up)
      const dark = 1 - span(mv, 0, VOID_PALE);
      for (const p of voidProps) p.alpha = p.alpha0 * dark;
      for (const p of roomProps) p.alpha = turned(p) ? 0 : p.alpha0 * (p.beyond ? rvBeyond : room);
      const pale = (mv - VOID_PALE) / (1 - VOID_PALE);
      const pal = k => mv < VOID_PALE ? mixc(VOID_PAL[k], PALE_PAL[k], mv / VOID_PALE) : mixc(PALE_PAL[k], MEADOW_PAL[k], smoothstep(pale));
      for (const k of ['skyTop', 'fog', 'ground']) L.pal[k] = mixc(pal(k), MORNING_PAL[k], lv);
      L.pal.fogDist = lerp(mv < VOID_PALE ? lerp(VOID_PAL.fogDist, PALE_PAL.fogDist, mv / VOID_PALE) : lerp(PALE_PAL.fogDist, MEADOW_PAL.fogDist, pale * pale), MORNING_PAL.fogDist, lv);
      c.soft = mv;
      // everything on the floor goes as it puts on the first of the faces; and if anything is still there as the light
      // comes, one thing at a time: first what lies where the bed, the nightstand, the chair or a wall will be
      const left = L.items.filter(i => !i.taken);
      if (s.backdrop > 0.98) for (const i of left) i.taken = true;
      if (mv > 0.08 && left.length && mv > s.gone) { (left.find(inTheWay) || left[0]).taken = true; s.gone = mv + 0.5 / tools.length; }
      if (mv > 0.05 && !s.dawn) { s.dawn = true; AUDIO.stopAmbient(); if (AUDIO.on()) AUDIO.startAmbient({ tune: 'ambient:13dawn', wind: 0.32, drone: 0, windFreq: 760 }); WEATHER.set({ kind: 'motes', density: 1.0, wind: 0.15 }, 7); }   // a breeze, and pollen in the sun
      if (mv > 0.3) { s.birdT = (s.birdT === undefined ? 0.5 : s.birdT) - dt; if (s.birdT <= 0) { s.birdT = 1.5 + Math.random() * 2.8; AUDIO.sfx('birds', Math.random() * 1.6 - 0.8, true); } }
      // in the meadow, as the tune starts, it takes off its robe and leaves it on the grass (c.disrobe); it dances a little to
      // the tune; then, while the meadow waits, now and then a little more
      let dance = t > END.dance[0] && t < END.dance[1] ? Math.min(1, (t - END.dance[0]) * 2, (END.dance[1] - t) * 2) : 0;
      const u = (t - END.dance[1] - 7) % 12;
      if (t > END.dance[1] + 7 && u < 2.6 && !s.leaving) dance = 0.5 * Math.min(1, u * 2, (2.6 - u) * 2);
      c.dance = still ? 0 : dance;
      if (t > END.disrobe[0] && !s.tune) { s.tune = true; AUDIO.sfx('musicbox', 0); }
      if (t > END.disrobe[0] + 3.2 && !s.tune2) { s.tune2 = true; AUDIO.sfx('musicbox', 0); }
      if (t > END.disrobe[0] + 6.4 && !s.tune3) { s.tune3 = true; AUDIO.sfx('musicbox', 0); }
      if (t >= END.wait) s.wait = true;
      if (s.wait && !s.leaving) idleStep(dt);
      // after the press it fades from the meadow, glittering as it goes
      c.fade = s.leaving ? clamp(1 - (lt - 0.3) / 2.0, 0, 1) : 1;
      meadow.update();
    };
    // Enraged, it screeches: a scraping shriek, again and again while anything is in your hands, the more often the angrier
    // it is (and a wilder one when it is beside itself: most of it held, or the bow drawn at it), from where it is. Calm,
    // it is quiet: the next time it is enraged, the first comes at once.
    const screech = (c, dt) => {
      const a = G.state === 'play' && !s.ending ? clamp(c.rage, 0, 1) : 0;
      if (a < 0.35) { s.screechT = 0.1; return; }
      s.screechT -= dt;
      if (s.screechT > 0) return;
      s.screechT = lerp(3.0, 0.7, (a - 0.35) / 0.65) * (0.85 + 0.3 * Math.random());
      s.screeches = (s.screeches || 0) + 1;
      AUDIO.sfx(a > 0.9 ? 'screechRage' : 'screech', Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85);
    };
    // the meadow waits for as long as you like, and while it waits the view is yours again: you turn, look down and zoom as in
    // any night (js/game.js takes those keys, buttons and the d-pad first, so they are never the press). A click, any other
    // key, a tap of Use or A goes on (not in the first moment of it, so a press made while it was still coming does not throw
    // it away). From the moment it reaches you the ending takes every other press, so nothing (R included) can cut it short
    // while it holds you, and nothing but going on is done in the meadow. A key that only goes somewhere else (alt-tab, a
    // screenshot's chord, a function key) is not a press: the meadow stays. After the press the view is taken back, to it.
    // If you do nothing at all for a few seconds (no key, click, look about or pointer moving), a small line says how to go on.
    L.lookFree = () => s.wait && !s.leaving;
    const aside = e => !!e && (e.ctrlKey || e.metaKey || e.altKey || /^(Shift|Control|Alt|AltGraph|Meta|OS|CapsLock|NumLock|ScrollLock|Fn|FnLock|ContextMenu|PrintScreen|Unidentified|F\d{1,2})$/.test(e.key || ''));
    L.onPress = e => {
      if (!s.ending) return false;
      if (s.wait) s.idle = 0;
      if (!aside(e) && s.wait && !s.leaving && s.endT >= END.arm) { s.leaving = true; s.leaveT = 0; s.glitterAt = s.endT + 0.3; AUDIO.sfx('win'); }
      return true;
    };
    const idleStep = dt => {
      const k = [G.cam.tYaw, G.cam.tPitch, G.cam.zoomHeld, G.mouse.x, G.mouse.y, typeof PAD === 'undefined' ? 0 : PAD.dir + ',' + PAD.zoom + ',' + PAD.a].join();
      s.idle = k === s.idleKey ? s.idle + dt : 0; s.idleKey = k;
    };
    L.aftermath = () => s.leaving && s.leaveT >= END.leave;
    // the view: on its face while it holds you (the top of its hood in the view as well); then level, on it, in the meadow,
    // and so on the room
    L.watchUp = 0.75;
    // where a height on it (from its feet) is drawn, as a height in the world: the renderer draws it as one upright card,
    // its height spread evenly between where its feet and the top of it are seen, so looked down at close to, its face is
    // drawn higher than it would really be; the view looks at where it is drawn
    const drawnAt = (c, hh) => {
      const p = c.pos(), y0 = p.y + c.yOff, b = R.screenPos(p.x, y0, p.z), tp = R.screenPos(p.x, y0 + c.CR.h, p.z), at = R.screenPos(p.x, y0 + hh, p.z);
      if (!b || !tp || !at || !(at.scale > 0)) return y0 + hh;
      return y0 + hh + (at.y - lerp(b.y, tp.y, hh / c.CR.h)) / at.scale;
    };
    L.watchPoint = () => {
      const c = c0(), p = c.pos(), k = span(s.endT, END.release + 0.4, END.release + 3.6);
      const y = drawnAt(c, CREATURES.demon.eyesY(c) - 0.02);   // (just under its eyes: the top of its hood in the view too)
      return { x: p.x, y: lerp(y, L.eyeH + 0.05, k), z: p.z };
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
      VOID_RECAP.add(s);   // (the nights gone by, behind it)
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
      if (s.backdrop > 0.01) out.push({ x: p.x, y: 2.4, z: p.z, r: 2.6, i: 0.2 * s.backdrop * (1 - s.reveal), color: [196, 186, 236], flicker: 0.3, seed: 31 });   // the nights behind it, catching its edges
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
// It comes out of the pale light turning round you (s.spin, how far it has still to turn, in radians), slower and slower,
// until it is in its place.
function buildMeadow(L, s, c0) {
  const rng = mulberry32(1313), rnd = (a, b) => a + (b - a) * rng(), fwd = L.facing;
  let rot = 0;   // (how far it is turned this frame: s.spin)
  const at = (b, r, y) => ({ x: Math.sin(fwd + rot + b) * r, y, z: Math.cos(fwd + rot + b) * r });
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
  for (const p of sprites) { p.x0 = p.x; p.z0 = p.z; }   // (where each is with the meadow in its place)
  // the sun: up to the left, a little above the view
  const sunAt = () => at(-0.62, 100, 1.65 + Math.tan(28 * DEG) * 100);
  let SUN = sunAt();
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
      if (rot !== (s.spin || 0)) { rot = s.spin || 0; SUN = sunAt(); }
      const view = wrapPi(R.yaw - fwd - rot), ga = smoothstep((s.meadow - 0.12) / 0.5) * (1 - s.lv);
      for (const p of groundPolys(view, ga)) R.add(p);
      const ca = smoothstep((s.meadow - 0.35) / 0.5) * (1 - s.lv);
      for (const p of clouds) { const b = p.b0 + (still ? 0 : G.t * p.drift * 0.1), r = p.D * Math.cos(p.el); p.x = Math.sin(fwd + rot + b) * r; p.z = Math.cos(fwd + rot + b) * r; p.alpha = ca; if (Math.abs(wrapPi(b - view)) < 1.3) R.add(p); }
      for (const p of sprites) {
        if (Math.abs(wrapPi(p.b - view)) > (p.r < 4 ? 1.25 : 0.9)) continue;
        const k = smoothstep((s.meadow - p.bloom) / 0.28);   // each comes up in its turn, growing as it comes
        p.alpha = k * (1 - s.lv); p.grow = 0.55 + 0.45 * k;
        if (p.alpha <= 0.004) continue;
        if (rot) { const q = rotY(p.x0, p.z0, rot); p.x = q[0]; p.z = q[1]; } else { p.x = p.x0; p.z = p.z0; }
        R.add(p);
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
      // a small line, only if you wait: in the meadow, how to go on (after a few seconds with nothing done at all)
      const ts = SAVE.data.settings.textSize || 1;
      const idle = s.wait && !s.leaving && s.endT >= END.arm ? smoothstep((s.idle - END.idle) / 1.5) : 0;
      s.idleLineA = idle > (s.idleLineA || 0) ? idle : Math.max(idle, (s.idleLineA || 0) - 1 / 30 / 0.4);
      const line = (text, a, dark) => {
        if (a <= 0.01) return;
        ctx.save(); ctx.font = Math.round(12 * ts) + "px 'IM Fell English', Georgia, serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0.22em';
        const ly = H - 58 * ts, bg = ctx.createRadialGradient(W / 2, ly, 0, W / 2, ly, 200 * ts);
        bg.addColorStop(0, rgba(dark, 0.42 * a)); bg.addColorStop(0.6, rgba(dark, 0.2 * a)); bg.addColorStop(1, rgba(dark, 0));
        ctx.fillStyle = bg; ctx.save(); ctx.translate(W / 2, ly); ctx.scale(1, 0.18); ctx.translate(-W / 2, -ly); ctx.fillRect(W / 2 - 200 * ts, ly - 200 * ts, 400 * ts, 400 * ts); ctx.restore();
        ctx.shadowColor = rgba(dark, 0.7 * a); ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255,252,240,' + (0.8 * a).toFixed(3) + ')'; ctx.fillText(text, W / 2, ly);
        ctx.restore();
      };
      const word = touchUI() ? 'TAP' : 'CLICK';
      line(word + ' WHEN YOU ARE READY', s.idleLineA, [24, 44, 16]);
    },
  };
}

// ---------- the nights gone by, and the faces it wore ----------
// While it holds you, it wears the face of each thing that came for you before, in the order they came, and behind it the
// night that one came in shows, faint and still. Each night is built again as the game builds it and drawn once, as you
// stood in it at its start: its ground and its sky, what lay about, its lights, and the thing that came for you there a
// little way off on its way in, from where you stood facing the way you faced, onto a canvas of its own at half the view's
// resolution (js/render.js R.aside sets the game's own canvas and scene aside for it); and then that thing's face as you
// last saw it there, come up into your face in its death lunge, alone, onto a small square canvas (faceShot). One night
// every little while as it holds its first faces, long before they are wanted. Then (s.form, END.forms) each face in turn
// is over its own in the opening of its hood (CREATURES.demon's c.guise: guise), held a step and snapped to the next, its
// head jumping to a new angle and place with each, as its own faces snap in its glitch but each held twice as long; and
// behind it, for as long as it wears that one's face, the night it came in, faint over the dark, still, the whole of the
// view, cut to with a flicker (drawn behind it and in front of everything else, while s.backdrop). With reduced motion
// each face comes slowly over the one before (and each night with it), and its head keeps still; with reduced flashing the
// nights are fainter and come with no flicker.
const VOID_RECAP = (() => {
  const count = () => LEVELS.length - 1;   // every night before this one
  const AT = 4.6, EVERY = 0.9;   // (one every EVERY seconds from AT: after it has taken hold of you, while it holds its faces)
  let shots = [], faces = [], key = '';
  // each one's face, as faceShot frames it: how far into its lunge (k), and the square round its face (s, its side, as much
  // of the view's height; x, y, where its middle is, right and up from the middle of the view, the same)
  const FACES = {
    walker: { s: 0.42, y: 0.14 }, crawler: { s: 0.9, y: 0.3 }, smiler: { s: 0.6, x: -0.15, y: 0.03 }, watcher: { s: 0.74, x: -0.12, y: -0.06 },
    runner: { s: 0.62 }, swimmer: { s: 0.7, x: -0.07 }, climber: { s: 1.6, y: 0.1 }, customer: { s: 0.74, y: 0.1 },
    signalman: { s: 0.9, y: 0.05 }, other: { s: 0.56, y: -0.02 }, carrier: { s: 0.8 }, tall: { k: 0.45, s: 1.2, x: 0.1, y: -0.08 },
  };
  const FACE_PX = 400;   // (the most pixels across a face is drawn with)
  // ready to draw them (again, if the view has changed size since they were drawn)
  function begin() {
    const k = R.W + 'x' + R.H + '@' + R.ctx.canvas.width;
    if (k !== key) { key = k; shots = []; faces = []; }
  }
  // the next of them, when it is time, while there are any left to draw
  function step(t) {
    if (shots.length >= count() || t < AT + shots.length * EVERY) return;
    shots.push(shoot(shots.length));
  }
  // night i as it was at its start, drawn whole onto a canvas half the view's size (null if it could not be)
  function shoot(i) {
    const dpr = R.ctx.canvas.width / R.W, out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(R.W * dpr * 0.5)); out.height = Math.max(1, Math.round(R.H * dpr * 0.5));
    const cam = G.cam, keep = { L: G.L, attempt: G.attempt, inv: G.inv, active: G.active, hover: G.hover, state: G.state, lanes: Object.assign({}, G.lastLane), lights: LIGHT.list, cam: { yaw: cam.yaw, tYaw: cam.tYaw, pitch: cam.pitch, tPitch: cam.tPitch, dirIdx: cam.dirIdx, zoom: cam.zoom } };
    let L = null, back = null, ok = false;
    const safe = fn => { try { return fn(); } catch (e) { return null; } };
    try {
      G.inv = [];
      L = buildLevel(i);
      const c = L.creature, CR = c.CR, yaw0 = L.def.startFacing !== undefined ? L.facing + L.def.startFacing * DEG : c.yaw;
      const view = { yaw: Math.round(yaw0 / (45 * DEG)) * 45 * DEG, pitch: 0, zoom: 1, shakeX: 0, shakeY: 0 };
      // (as it is drawn in play: a night's drawing may look at the night being played, the state and the view)
      G.L = L; G.state = 'play'; cam.yaw = cam.tYaw = view.yaw; cam.pitch = cam.tPitch = 0; cam.zoom = 1; cam.dirIdx = ((Math.round(view.yaw / (45 * DEG)) % 8) + 8) % 8;
      // it, a good way in from where it started, so it is there to be seen
      c.u = 0.6; c.dist = c.D0 * Math.pow(1 - c.u, c.gamma); c.t = 2.5; c.gait = 0.6;
      LIGHT.set(L.lights.concat((L.dynamicLights && safe(() => L.dynamicLights())) || []));
      back = R.aside(out, L.props, 0.5);
      R.hover = null;
      R.begin(view, L, G.t);
      for (const it of L.items) if (!it.taken) R.add({ kind: 'sprite', x: it.x, y: it.y, z: it.z, w: it.w, h: it.h, flat: it.flat, card: true, attach: !!it.attach, dist: Math.hypot(it.x, it.z), layer: 1, draw: (ctx, P) => { ctx.scale(it.w, it.h); safe(() => it.icon(ctx, P)); } });
      if (L.dynamic) safe(() => L.dynamic());
      const pos = c.pos();
      R.add({ kind: 'sprite', x: pos.x, y: pos.y + (c.yOff || 0), z: pos.z, w: CR.w, h: CR.h, fogScale: 0.85, dist: Math.hypot(c.dist, c.lat || 0), layer: 1, noContact: true, draw: (ctx, P) => { ctx.save(); safe(() => CR.draw(ctx, c, P)); ctx.restore(); } });
      R.flush();
      ok = true;
      back(); back = null;
      faces[i] = safe(() => faceShot(L, c, dpr));
    } catch (e) { ok = false; } finally {
      if (back) back();
      G.L = keep.L; G.attempt = keep.attempt; G.inv = keep.inv; G.active = keep.active; G.hover = keep.hover; G.state = keep.state; Object.assign(cam, keep.cam);
      for (const k of Object.keys(G.lastLane)) if (!(k in keep.lanes)) delete G.lastLane[k];
      Object.assign(G.lastLane, keep.lanes);
      LIGHT.set(keep.lights);
      if (L && L.onEnd) safe(() => L.onEnd());
    }
    return ok ? out : null;
  }
  // its face as you last saw it there: its death lunge, come up into your face, as game.js plays it (to lunge k of 1), from
  // your eye, drawn alone (nothing of the night round it) onto a square canvas of its own, the part of the view round its
  // face (s: the square's side, as much of the view's height; x, y: how far off the middle of the view its face is)
  function faceShot(L, c, dpr) {
    const CR = c.CR, spec = c.deathSpec || CR.death || {}, F = Object.assign({ k: 1, s: 0.62, x: 0, y: 0 }, FACES[c.type]);
    c.lunge = 0; c.frozen = true; c.lat = 0; c.lungeFrom = c.dist;
    for (const k of [0, F.k]) {   // (from the start of it, for a pose that keeps where it began)
      c.lunge = k; c.dist = lerp(c.lungeFrom, 0.55, easeIn(k));
      c.yOff = lerp(0, L.eyeH - CR.faceY - c.pos().y, smoothstep(k));
      if (spec.pose) spec.pose(c, k);
    }
    const p = c.pos(), S = F.s * R.H, out = document.createElement('canvas'), px = Math.min(1, FACE_PX / (S * dpr));
    out.width = out.height = Math.max(1, Math.round(S * dpr * px));
    const view = { yaw: Math.atan2(p.x, p.z), pitch: 0, zoom: 1, shakeX: -(R.W / 2 + F.x * R.H - S / 2), shakeY: -(R.H / 2 - F.y * R.H - S / 2) };
    G.cam.yaw = G.cam.tYaw = view.yaw; G.cam.pitch = G.cam.tPitch = 0;
    const back = R.aside(out, [], px);
    try {
      R.hover = null;
      R.begin(view, L, G.t);
      const x = R.ctx; x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, out.width, out.height); x.restore();   // (no sky, no ground)
      R.add({ kind: 'sprite', x: p.x, y: p.y + (c.yOff || 0), z: p.z, w: CR.w, h: CR.h, fogScale: 0.85, dist: Math.hypot(c.dist, c.lat || 0), layer: 1, noContact: true, draw: (ctx, P) => { ctx.save(); CR.draw(ctx, c, P); ctx.restore(); } });
      R.flush();
    } finally { back(); }
    return out;
  }
  // what it wears at q (s.form), and how much of the jth night is there (CREATURES.demon.guiseAt and guiseVis)
  const guise = (q, still) => CREATURES.demon.guiseAt(q, Array.from({ length: count() }, (_, j) => faces[j] || null), still);
  const vis = (q, j, still) => CREATURES.demon.guiseVis(q, j, count(), still);
  // behind it: a renderable as far off as anything, drawn just before it (sortDist a little over its own distance, under
  // the things on the floor), covering the whole view in its own pixels
  function add(s) {
    if (!(s.backdrop > 0.004)) return;
    const y = R.yaw, d = 400;
    R.add({ kind: 'sprite', x: Math.sin(y) * d, y: -d, z: Math.cos(y) * d, w: 4 * d, h: 4 * d, layer: 1, dist: d, sortDist: 1.2, noContact: true, noLight: true, noFog: true, draw: ctx => draw(ctx, s) });
  }
  // each night faint over the dark, still, the whole of the view, for as long as its face is the face it wears; cut to
  // from the one before with a flicker (with reduced flashing fainter yet, and with no flicker)
  const FAINT = 0.34;
  function draw(ctx, s) {
    const W = R.W, H = R.H, dpr = ctx.canvas.width / W, S = SAVE.data.settings, still = !!S.reducedMotion, calm = !!S.reducedFlash;
    const q = s.form, N = count();
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, R.viewY * dpr);
    for (let j = Math.max(0, Math.floor(q)); j <= Math.min(N - 1, Math.floor(q + CREATURES.demon.guiseCut(still))); j++) {
      const img = shots[j], u = q - j;
      if (!img) continue;
      const flick = calm || still || u < 0 || u >= 0.24 ? 1 : [0.45, 1, 0.6, 1][Math.floor(u / 0.06)];
      const a = s.backdrop * vis(q, j, still) * FAINT * (calm ? 0.65 : 1) * flick;
      if (a > 0.004) { ctx.globalAlpha = a; ctx.drawImage(img, 0, 0, W, H); }
    }
    ctx.restore();
  }
  return { begin, step, add, shoot, guise, count, get shots() { return shots; }, get faces() { return faces; } };
})();
