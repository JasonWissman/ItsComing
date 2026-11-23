'use strict';
/* global CLEARING_BOW, PAD */   // (night 5's bow, js/levels/night05.js: drawn here as it was there; js/game.js's gamepad state)
// ============================================================ 13. THE VOID ============================================================
// Nothing at all: a faint floor that fades into black. Around you lies everything you ever held against it, and your hands
// are empty. It comes from anywhere, a tall thing in a black hood. Take up anything and it is enraged: it screeches, and
// comes on in fits; put it all down again and it calms, and is quiet. The ending plays out here, without a cut: caught
// empty-handed and facing it, it stops and lifts its arms and takes hold of you, its hands gripping the bottom of the view;
// then its face comes out of the dark of its hood, angry; its face goes through angry, neutral, angry (leaning in at you),
// confused, confused the other way, and sad, and it cries, holding you. Its head goes down, bowed to the ground, its face
// lost in the hood, and it cries on a while; it stops, and is still; and all at once it throws its head back,
// enraged, screeching, and all round it in the dark are the faces of all the others, each as it was when it came up into
// your face: it was this one all along. It takes them back into itself, one after another, and its face is its grey
// neutral face again, a while, in the dark. Confused, and confused the other way as the dark opens into a pale light; it is
// content, and happy, and
// the meadow comes out of the light, turning and settling into place in the sun. It lets you go and steps back, and
// there you may look about as long as you like; a press and it is the bedroom. The bow still comes up and draws as it did on night 5, but it is
// never loosed: drawn at, it comes for you, faster and faster, and is on you before the bow is full.
const VOID_TOOLS = [
  ['hammer', 'Hammer', 0.42, 0.42], ['planks', 'Planks', 1.0, 0.7], ['salt', 'Salt', 0.34, 0.42], ['lantern', 'Lantern', 0.3, 0.44], ['matches', 'Matches', 0.2, 0.2],
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
  grab: [3.6, 3.95],                    // and it reaches out and takes hold of you, quick: its hands gripping the bottom edge
  unveil: [4.3, 5.1],                   // its hands there, its face comes up out of the dark of its hood, angry
  moods: 6.0,                           // then its faces in turn, each held and going into the next (CREATURES.demon.moodAt):
  lean: [8.8, 9.4, 10.4, 11.2],         // angry again, it leans in at you, close, and draws back as it is confused (and
                                        // confused the other way);
  sad: 14.85,                           // through the glitch to sad, crying
  down: [19.5, 20.1],                   // it cries a while, holding you, its head going down, bowed to the ground,
  hush: 23.1,                           // and cries on, bowed, and stops,
  scare: [23.8, 25.7, 26.3],            // and is still; then it throws its head back, enraged, and the faces of all the others
                                        // are round it at once (VOID_RECAP); and it takes them back into itself, one after another
  neutral: [26.3, 26.9],                // its grey neutral face again, a while, in the dark
  confused: [29.7, 30.5],               // confused,
  mirror: [32.3, 33.1],                 // and confused the other way (held as long),
  light: [32.9, 39.9],                  // as the pale void comes, and the meadow coming out of it, turning and settling into place
  content: [34.9, 35.9], happy: [36.9, 37.9],   // content, and happy
  release: 39.9,                        // and, the meadow settled, it lets you go
  walk: [40.9, 44.5],                   // it steps back and round to the north, where the foot of the bed will be
  disrobe: [45.1, 47.7],                // and as the tune starts it takes off its robe: the hood back, the robe dropped, a hop clear
  dance: [47.3, 51.8],                  // and dances a little to the tune in its shirt and shorts
  wait: 45.7, arm: 46.3, idle: 5,       // from here the meadow is yours to look about in, and waits for a press (taken from
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
    egg: 'Take up everything.',   // this night's easter egg, as the Scores' list names it once found (game.js: foundEgg)
  },
  lanes: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((name, k) => ({ deg: k * 45, name, barrierDist: 0, default: k === 0 })),
  creatures: [{ type: 'demon', startDist: 40, time: 75, unseenMult: 1.3 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    Object.assign(s, { ending: false, endT: 0, reveal: 0, meadow: 0, room: 0, lv: 0, gone: 0, glitterAt: -1, wait: false, leaving: false, leaveT: 0, idle: 0, scare: null, shown: 0, spin: 0 });
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
    STORY.lamp(L, 1.2, 0.62, -0.79, { lit: false });
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
      if (!a || twoHanded(a) || G.state !== 'play' || bowUp()) return null;   // (the bow up, both hands are on it; and as the others come for it all, the easter egg, only the one hand, holding each thing up: buildGathering)
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
      if (G.state === 'play') bend(c);   // (as it is where it reached you)
      c.bend0 = c.yOff || 0;   // (its death lunge comes up from as far down as it was: CREATURES.demon.death.pose)
      if (s.rush > 0) s.fought = true;   // (drawn at, it came for you: a death, whatever else)
      if (s.fought || G.inv.length > 0 || !facingIt(c)) return false;
      s.ending = true; s.endT = 0; s.armAt = END.arm; c.frozen = true; c.hold = null;
      c.lane = Object.assign({}, c.lane, { follow: 'free', apertures: [], blockers: [] });   // placed by yaw and distance from here on
      // its head comes level from the tilt it had (as draw() has it, empty-handed); its first face is already there, in the
      // dark of the hood, not yet seen
      c.tilt0 = CREATURES.demon.tilt(c); c.settle = 0; c.mood = 0; c.unveil = 0;
      // it comes in a little closer as it takes hold of you (from as far as it was, bent down as far as it was); later it
      // steps back from you, and later still back and round to the north (the foot of the bed): CREATURES.demon.ending
      const yaw0 = c.yaw, yaw1 = L.facing;
      // (as far down as it was bent, its face where it was: bent over, c.stoop, as low as if it were that much further down)
      s.d0 = c.dist; s.y0 = (c.yOff || 0) - (c.stoop || 0) * (1 - 0.2 * (c.calm || 0)); c.stoop = 0;
      s.pose = CREATURES.demon.ending(END, 0, s.d0, s.y0);
      c.distFn = cr => {
        cr.yaw = yaw0 + wrapPi(yaw1 - yaw0) * span(s.endT, END.walk[0], END.walk[1]);
        return s.pose.dist;
      };
      VOID_RECAP.begin();   // (the faces of the others, drawn ready while it holds you)
      AUDIO.sfx('stingHum'); win(); return true;
    };
    const LAST = CREATURES.demon.moods - 1;
    // the light on it while it holds you follows its face: its own dull red while the face is still in the dark of the hood,
    // red hot when it is angry (hotter yet at the scare), grey when it is neither, cold when it is lost and sad, warm when it
    // is content and happy (as the light coming is); and lower while its head is bowed. One for each face, in the order of
    // DEMON_MOODS
    const DULL = [[200, 60, 60], 0.25, 0.5];
    const MOOD_LIGHT = [[[255, 46, 30], 0.6, 0.7], [[200, 176, 184], 0.34, 0.15], [[255, 46, 30], 0.6, 0.7], [[176, 170, 226], 0.4, 0.25], [[176, 170, 226], 0.4, 0.25], [[120, 140, 210], 0.36, 0.2],
      [[255, 40, 24], 0.85, 0.8], [[200, 176, 184], 0.34, 0.15], [[176, 170, 226], 0.4, 0.25], [[176, 170, 226], 0.4, 0.25], [[255, 206, 166], 0.45, 0.05], [[255, 226, 176], 0.6, 0.05]];
    const moodLight = c => {
      const m = c.mood || 0, i = Math.min(Math.floor(m), MOOD_LIGHT.length - 2), k = smoothstep(m - i), A = MOOD_LIGHT[i], B = MOOD_LIGHT[i + 1], u = c.unveil === undefined ? 1 : c.unveil;
      return { color: mixc(DULL[0], mixc(A[0], B[0], k), u), i: lerp(DULL[1], lerp(A[1], B[1], k), u) * (1 - 0.45 * Math.max(0, c.nod || 0)), flicker: lerp(DULL[2], lerp(A[2], B[2], k), u) };
    };
    // where the room's furniture will stand (x0, x1, z0, z1, as buildBedroom puts them): the bed, the nightstand, the chair, the
    // dresser; a thing lying there, or against or beyond a wall, is in the way of the room
    const FURNITURE = [[-0.8, 0.8, -1.05, 1.9], [0.95, 1.45, -1.04, -0.54], [-2.6, -2.15, -0.9, -0.45], [-2.9, -1.5, 3.05, 3.55]];
    const inTheWay = it => {
      const q = rotY(it.x, it.z, -L.facing), m = 0.5 * Math.max(it.w, it.h);
      return q[0] < ROOM.x0 + m || q[0] > ROOM.x1 - m || q[1] < ROOM.z0 + m || q[1] > ROOM.z1 - m || FURNITURE.some(f => q[0] > f[0] - m && q[0] < f[1] + m && q[1] > f[2] - m && q[1] < f[3] + m);
    };
    const sun = (() => { const d = [-1, -0.45, -0.15], n = Math.hypot(d[0], d[1], d[2]); return { x: 3.4, y: 2.4, z: 1.6, r: 12, i: 0.55, color: [255, 244, 210], cone: { x: d[0] / n, y: d[1] / n, z: d[2] / n, cos: Math.cos(40 * DEG) } }; })();
    const meadow = buildMeadow(L, s, c0);
    // ---- the easter egg: everything taken up ----
    // On this night your hands are never full (L.handMax: js/game.js pickup; any other night's hold six): all sixteen things
    // can be carried at once, while it comes on enraged. The moment the last thing not yet taken up this attempt is in your
    // hand (s.had: each thing you have had, so one put down again still counts), the night is won another way: the others
    // come for what was theirs (buildGathering).
    // So that there is time for it: it is no angrier for a seventh thing than for six (ANGER_MAX: its pace goes by c.anger),
    // and each thing taken up for the first time this attempt checks it: it stops dead where it is for CHECK seconds, and
    // then comes on as enraged as ever. Taken up one after another briskly (a second and a half each, or less), all sixteen
    // are in your hands with it still well off (18 m or more on seeds 1 to 5); at a slower pace (a second and three quarters
    // each) it is a near thing, and on some seeds it is on you first; stop to hold what you have and it is on you as it always was. A thing put down
    // and taken up again does not check it twice, so it cannot be held off for good
    s.had = {}; s.egg = null; s.armAt = END.arm;
    L.handMax = Infinity;
    const ANGER_MAX = 6, CHECK = 1.0;
    s.check = 0;   // how much longer it stands checked
    const gather = buildGathering(L, s, c0, { falls, lightStep: (dt, mv) => lightStep(dt, mv), tuneStep: (t, at) => tuneStep(t, at), idleStep: dt => idleStep(dt), meadow });
    L.onPickup = it => { if (!s.had[it.id]) s.check = CHECK; s.had[it.id] = true; if (!s.ending && G.state === 'play' && tools.every(t => s.had[t[0]])) gather.begin(); };
    // On Nightmare it may change its way once (js/game.js maybeSwitchLane), unseen, early on: far out in the dark. But that
    // judges it unseen by how much of it is in the view, and as it looms in over the last metre or so it fills the view and
    // more: it counted as unseen right there in front of you, changed its way at the last moment and came at you from the
    // side or behind, and, standing still facing it, you died for looking away. So once it is within SWITCH_NEAR of you it
    // keeps to its way.
    const SWITCH_NEAR = 12;
    // How far down it is bent, coming close (c.yOff, sunk: empty-handed, over the last few metres, as it always has), and,
    // whatever it is (enraged, drawn at with the bow and rushing you, or calm), bent over toward you as far again as keeps
    // its face in the view as you look ahead at it, all the way in to the death lunge (c.stoop: CREATURES.demon.stoopFor;
    // enraged it is taller, and the view does not lift to it). Its lunge comes up from there (death.pose, c.bend0)
    const bend = c => {
      c.yOff = -0.42 * smoothstep(clamp((3.6 - c.dist) / 2.4, 0, 1)) * (1 - clamp(c.rage, 0, 1));
      c.stoop = c.CR.stoopFor(c, L.eyeH, c.yOff);
    };
    L.update = dt => {
      const c = c0();
      fallStep(dt); bowStep(dt);
      c.anger = s.egg ? 0 : Math.min(G.inv.length, ANGER_MAX);   // (the others come for it all, the easter egg: it is calm)
      // (checked: stopped dead where it is, a moment, by a thing taken up for the first time)
      if (G.state === 'play' && !s.ending) {
        s.check = Math.max(0, s.check - dt);
        if (s.check > 0) { c.frozen = true; s.checked = true; } else if (s.checked) { c.frozen = false; s.checked = false; }
      }
      rushStep(c);
      if (c.dist < SWITCH_NEAR) c.switched = true;
      const rage = c.anger > 0 ? Math.min(1, 0.6 + 0.4 * c.anger / 6) : 0;   // anything held and it is plainly enraged; drawn at, more and more
      c.rage += (lerp(rage, 1, s.rush) - c.rage) * Math.min(1, dt * (4 + 8 * s.rush));
      screech(c, dt);
      // empty-handed (and so calm), it bends down to you as it comes the last few metres, so its head is not lost over the top
      // of the view; and facing it, the view lifts to its face as it looms in: you look up at it. Looking down (a target
      // below the horizon), or turning away, takes the view back as it was. (bend: and however it comes, it bends over
      // toward you as far as keeps its face in the view)
      if (!s.ending && G.state === 'play') {
        bend(c);
        const near = smoothstep(clamp((6 - c.dist) / 4.5, 0, 1)), face = c.CR.eyesY(c) + c.yOff;
        if (near > 0 && !G.inv.length && G.cam.tPitch <= 0 && facingIt(c)) G.cam.tPitch = -Math.atan2(face - L.eyeH, Math.max(c.dist, 0.6)) * 0.8 * near;
        else if (G.cam.tPitch < 0) G.cam.tPitch = 0;
      }
      if (!s.ending) return;
      const still = !!SAVE.data.settings.reducedMotion;
      if (s.egg) { gather.update(dt, still); return; }   // (the easter egg: the others come for what was theirs)
      s.endT += dt;
      const t = s.endT;
      c.still = still;
      // it lifts its arms, its face comes out of the dark, angry, and it takes hold of you; its face goes through what it was
      // until it is sad, and it cries, holding you, and stops; content, happy, it lets you go and straightens up, settled
      const o = s.pose = CREATURES.demon.ending(END, t, s.d0, s.y0, still);
      for (const k of ['settle', 'hug', 'unveil', 'yOff', 'sob', 'calm', 'mood', 'nod', 'jolt', 'disrobe']) c[k] = o[k];
      s.grab = o.hug ? o.hug.grab : 0;
      VOID_RECAP.step(t);   // (the next of the faces of the others, drawn ready, while it is still holding you)
      // a thing this close is drawn from its feet: looked up at too steeply, they would be behind the eye and it would vanish,
      // so the view never looks up further than keeps them in front (it bends down to you, so the view comes level anyway)
      const up = Math.atan(0.7 * c.dist / Math.max(0.5, L.eyeH - c.pos().y - c.yOff));
      if (G.cam.pitch < -up) G.cam.pitch = -up;
      // its first two angry faces while it holds you growl, deep and gravelly, as each face shows (kept apart from the
      // screech of the scare): as the angry face comes up out of the hood (once its hands are on you), and as it snaps to
      // angry again and leans in
      if (c.unveil >= 0.08 && !s.growl1) { s.growl1 = true; AUDIO.sfx('growl', 0); }
      if (c.mood >= 1.5 && c.mood < 2.6 && !s.growl2) { s.growl2 = true; AUDIO.sfx('growl2', 0); }
      if (t >= END.grab[0] && !s.grabbed) { s.grabbed = true; AUDIO.sfx('cloth', 0); if (!still) G.shake(0.05); }   // it takes hold of you
      if (t >= END.grab[1] + 0.6 && !s.held) { s.held = true; AUDIO.voice('exhale', 0.5, 0); }
      if (c.mood >= 4.5 && !s.sob) { s.sob = true; s.sobT = 3.4; AUDIO.voice('slow', 0.45, 0); }   // the sorrow
      // crying, holding you; and as its head goes down a sob at once, and closer together while it is bowed (none that would
      // run on past where it stops)
      if (s.sob && c.nod > 0.6 && !s.bowSob) { s.bowSob = true; s.sobT = 0; }
      if (s.sob && c.sob > 0.5) { s.sobT -= dt; if (s.sobT <= 0 && t < END.hush - 1.2) { s.sobT = s.bowSob ? 1.9 : 3.6; AUDIO.voice('slow', s.bowSob ? 0.34 : 0.38, 0); } }
      if (t >= END.hush && !s.breath) { s.breath = true; AUDIO.voice('exhale', 0.3, 0); }   // and it stops, with a breath, and is still
      // the scare: its head thrown back, its screech (as it screeches enraged, and as it took hold of you) with a blow under
      // it, the view shaken and a flash (no shake with reduced motion, no flash with reduced flashing), and the faces of all
      // the others round it at once (VOID_RECAP: s.scare, where each is); then a rush of air drawn in as it takes them back
      // (c.gulp, its hood's opening wider as each goes in), and its breath going out after
      if (t >= END.scare[0] && !s.scared) {
        s.scared = true; AUDIO.sfx('screech', 0); AUDIO.sfx('thud', 0);
        if (!still) G.shake(0.6);
        if (!SAVE.data.settings.reducedFlash) G.flash(0.25);   // (a soft flash: the faces are the scare)
      }
      if (t >= END.scare[1] && !s.took) { s.took = true; AUDIO.sfx('absorb', 0); }
      if (t >= END.neutral[0] + 0.3 && !s.breath2) { s.breath2 = true; AUDIO.voice('exhale', 0.4, 0); }
      s.scare = CREATURES.demon.scareAt(o.scare, VOID_RECAP.count(), still);
      c.gulp = s.scare.gulp;
      s.shown = s.scare.faces.filter(f => f.back + f.front > 0.5 && VOID_RECAP.faces[f.i]).length;
      if (t >= END.light[0] - 1.5 && !s.warp) { s.warp = true; AUDIO.sfx('warp', 0); }   // the dark starting to turn
      if (c.mood >= LAST && !s.hum) { s.hum = true; AUDIO.voice('hum', 0.5, 0); }   // happy
      if (t >= END.release && !s.let) { s.let = true; AUDIO.sfx('cloth', 0); }   // it lets you go
      // the light: the pale void, and out of it the meadow in the sun, turning round you (s.spin) and settling into place;
      // later, after a press, the meadow goes and the room is there
      const mv = s.meadow = span(t, END.light[0], END.light[1]);
      s.spin = still ? 0 : 1.25 * Math.PI * Math.pow(1 - clamp((t - END.light[0]) / (END.release - END.light[0]), 0, 1), 3);
      lightStep(dt, mv);
      // everything on the floor goes as the faces come; and if anything is still there as the light comes, one thing at a
      // time: first what lies where the bed, the nightstand, the chair or a wall will be
      const left = L.items.filter(i => !i.taken);
      if (t >= END.scare[0]) for (const i of left) i.taken = true;
      if (mv > 0.08 && left.length && mv > s.gone) { (left.find(inTheWay) || left[0]).taken = true; s.gone = mv + 0.5 / tools.length; }
      // in the meadow, as the tune starts, it takes off its robe and leaves it on the grass (c.disrobe); it dances a little to
      // the tune; then, while the meadow waits, now and then a little more
      let dance = t > END.dance[0] && t < END.dance[1] ? Math.min(1, (t - END.dance[0]) * 2, (END.dance[1] - t) * 2) : 0;
      const u = (t - END.dance[1] - 7) % 12;
      if (t > END.dance[1] + 7 && u < 2.6 && !s.leaving) dance = 0.5 * Math.min(1, u * 2, (2.6 - u) * 2);
      c.dance = still ? 0 : dance;
      tuneStep(t, END.disrobe[0]);
      if (t >= END.wait) s.wait = true;
      if (s.wait && !s.leaving) idleStep(dt);
      // after the press it fades from the meadow, glittering as it goes
      c.fade = s.leaving ? clamp(1 - (s.leaveT - 0.3) / 2.0, 0, 1) : 1;
      meadow.update();
    };
    // the light (mv: how far it has come): the pale void, and out of it the meadow in the sun; later, after a press, the
    // meadow goes and the room is there. Both endings come to it (the easter egg's too: buildGathering)
    const lightStep = (dt, mv) => {
      const c = c0();
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
      if (mv > 0.05 && !s.dawn) { s.dawn = true; AUDIO.stopAmbient(); if (AUDIO.on()) AUDIO.startAmbient({ tune: 'ambient:13dawn', wind: 0.32, drone: 0, windFreq: 760 }); WEATHER.set({ kind: 'motes', density: 1.0, wind: 0.15 }, 7); }   // a breeze, and pollen in the sun
      if (mv > 0.3) { s.birdT = (s.birdT === undefined ? 0.5 : s.birdT) - dt; if (s.birdT <= 0) { s.birdT = 1.5 + Math.random() * 2.8; AUDIO.sfx('birds', Math.random() * 1.6 - 0.8, true); } }
    };
    // the music box's tune, three times over, from `at`
    const tuneStep = (t, at) => {
      if (t > at && !s.tune) { s.tune = true; AUDIO.sfx('musicbox', 0); }
      if (t > at + 3.2 && !s.tune2) { s.tune2 = true; AUDIO.sfx('musicbox', 0); }
      if (t > at + 6.4 && !s.tune3) { s.tune3 = true; AUDIO.sfx('musicbox', 0); }
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
      if (!aside(e) && s.wait && !s.leaving && s.endT >= s.armAt) { s.leaving = true; s.leaveT = 0; s.glitterAt = s.endT + 0.3; AUDIO.sfx('win'); }
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
      if (s.egg) return gather.watch();
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
    // a faint cold light straight behind it, as on the title: one soft, wide round of it about its hood and shoulders, far
    // wider than it is however near it comes (it is as big in the world, so it grows in the view as it nears), so its
    // dark shape stands against it from far off to holding you. Faint, and falling off gently all the way out (a bell, not
    // a disc: no edge anywhere). Drawn just before it (and before the faces round it at the scare, so it never lies over
    // them); steady, never flickering; and gone as the pale light comes
    const BACK = [104, 112, 134], BACK_FALL = Array.from({ length: 13 }, (_, i) => { const x = i / 12, e = Math.exp(-4); return [x, (Math.exp(-4 * x * x) - e) / (1 - e)]; });
    const backLight = () => {
      const c = c0(), a = Math.max(0, c.fade) * (1 - s.reveal) * (1 - clamp(s.meadow / VOID_PALE, 0, 1));
      if (a <= 0.01) return;
      // (coming on, about its chest and wide enough for all of it and more; holding you, about its hood, and wider still
      // than the view)
      const p = c.pos(), d = Math.hypot(c.dist, c.lat || 0), k = clamp((d - 0.8) / 2.5, 0, 1);
      const r = lerp(1.7, 4.2, k), yc = CREATURES.demon.eyesY(c) - lerp(0.05, 0.5, k), la = a * lerp(0.12, 0.14, k);
      R.add({ kind: 'sprite', x: p.x, y: p.y + (c.yOff || 0), z: p.z, w: 2 * r, h: c.CR.h, dist: d, sortDist: Math.max(d + 0.4, 1.3), layer: 1, noContact: true, noLight: true, noFog: true, draw: ctx => {
        // (as the renderer has it, a height up it is where the same height up the thing itself is drawn; and round in the view)
        const m = ctx.getTransform(), o = m.transformPoint({ x: 0, y: yc }), rr = r * Math.hypot(m.a, m.b);
        if (!(rr > 1)) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rr);
        for (const [at, f] of BACK_FALL) g.addColorStop(at, rgba(BACK, f * la));
        ctx.fillStyle = g; ctx.fillRect(o.x - rr, o.y - rr, rr * 2, rr * 2);
      } });
    };
    L.dynamic = () => {
      if (!s.ending && G.state === 'play') bend(c0());   // (where it is now, after this frame's move: drawn at you, it closes fast)
      backLight();
      pools();
      fallDraw();
      meadow.draw();
      gather.draw();
      if (s.scare && s.scare.faces.length) {   // (the faces of the others, round the middle of its face as it is drawn)
        const c = c0(), p = c.pos(), at = R.screenPos(p.x, drawnAt(c, CREATURES.demon.eyesY(c) - 0.03), p.z);
        if (at) VOID_RECAP.add(s.scare, at);
      }
      if (s.glitterAt < 0) return;
      // the glitter: sparks spiralling up and out from where it stood, twinkling, gone in a few seconds (with reduced motion
      // they drift up and out without turning; with reduced flashing they glow steadily as they go); and, fewer, from where
      // each of the others stood (the easter egg)
      const k = s.endT - s.glitterAt;
      if (k < 0 || k > 3.2) return;
      glitter(c0().pos(), k, 46, 1);
      for (const q of gather.places()) glitter(q, k, 9, q.h / 2.6);
    };
    const glitter = (p, k, n, tall) => {
      const S = SAVE.data.settings;
      for (let i = 0; i < n; i++) {
        const a = i * 2.39996 + (S.reducedMotion ? 0 : k * (0.8 + (i % 5) * 0.2)), r = 0.12 + (i % 7) * 0.06 + k * (0.25 + (i % 3) * 0.12), y = (0.2 + (i % 11) * 0.19) * tall + k * (0.35 + (i % 4) * 0.18);
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
      if (s.egg) out.push(...gather.lights());
      else if (c.fade > 0.05 && s.ending) {   // (a little brighter as it takes hold of you, so its arms show coming)
        const ml = moodLight(c), more = 0.16 * span(s.endT, 0.3, 2.6) * (1 - Math.min(1, c.mood || 0));
        out.push({ x: p.x, y: 1.4, z: p.z, r: 3, i: (ml.i + more) * (1 - s.reveal) * c.fade, color: ml.color, flicker: ml.flicker, seed: 13 });
      }
      else if (c.fade > 0.05) out.push({ x: p.x, y: 1.4, z: p.z, r: 3 + a * 4, i: (0.25 + a * 0.5) * (1 - s.reveal) * c.fade, color: [200, 60, 60], flicker: 0.5, seed: 13 });
      const up = s.scare ? Math.min(1, s.shown / 6) : 0;
      if (up > 0.01) out.push({ x: p.x, y: 2.4, z: p.z, r: 2.6, i: 0.3 * up, color: [196, 186, 236], flicker: 0.5, seed: 31 });   // the faces round it, catching its edges
      if (m > 0.01) out.push({ x: p.x * 0.6 - 2, y: 4.5, z: p.z * 0.6 - 1, r: 10, i: 0.32 * m, color: [255, 238, 200] });   // the sun on it
      if (s.room > 0.01) out.push(Object.assign({}, sun, { i: sun.i * s.room }));
      return out;
    };
    L.glows = () => {
      const out = meadow.glows();
      if (s.room > 0.01) out.push({ x: 2.2, y: 1.45, z: 1.6, r: 2.2, color: [255, 246, 220], a: 0.4 * s.room });
      return out.length ? out : null;
    };
    L.overlay = (ctx, W, H) => { meadow.overlay(ctx, W, H); gather.overlay(ctx, W, H); };
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
    const p = { kind: 'sprite', flower: true, x: q.x, y, z: q.z, w: 0.2, h: h + 0.08, layer: 1, noLight: true, noContact: true, b, r, bloom: rnd(0.38, 0.72), alpha: 0, grow: 1, draw: (ctx, P) => {
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
  let tufts = 0;
  const tuft = (b, r) => {
    const n = 4 + Math.floor(rng() * 3), h = rnd(0.14, 0.32), ph = rnd(0, TAU), y = groundY(b, r), q = at(b, r, y), blades = [];
    for (let i = 0; i < n; i++) blades.push([(i - (n - 1) / 2) * 0.014, rnd(-0.07, 0.07), h * rnd(0.6, 1.1), rng() < 0.5]);
    const p = { kind: 'sprite', x: q.x, y, z: q.z, w: 0.22, h: h + 0.04, layer: 1, noLight: true, noContact: true, b, r, bloom: rnd(0.3, 0.6), alpha: 0, grow: 1, thin: tufts++ % 2 === 1, draw: (ctx, P) => {
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
        if (s.egg && (p.flower || p.thin)) continue;   // the easter egg's meadow has no flowers, only grass, and every other tuft of that: there is a crowd in it to draw
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
      const idle = s.wait && !s.leaving && s.endT >= s.armAt ? smoothstep((s.idle - END.idle) / 1.5) : 0;
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
      line(word + ' WHEN READY', s.idleLineA, [24, 44, 16]);
    },
  };
}

// ---------- the others, come for what was theirs (the easter egg) ----------
// Everything taken up (each thing in your hand at least once this attempt), the night ends another way, and is won: the
// thing in the hood stops and backs off into the dark, the view is taken (level, to the north), and out of the dark each
// of the others, in the order of their nights, one at a time (`every` apart), rushes up to you along its own way. A beat
// before it sets out your hand holds up what was its own (the game's own hand, js/hands.js, shown what to hold by
// L.heldItem, and held higher and further in than a thing is carried: VOID_EGG.up; a thing you had put down again comes up
// off the floor into your hand first, so every one of them is handed over the same way). It stops in front of you, takes the
// thing out of your raised hand (it passes from your hand to its own, `pass`; your hand is left open, and goes down), holds
// it up a beat to look at it (`look`), and backs away slowly, facing you, holding it, to its place; one with two things takes
// the first, your hand brings up the second, and it takes that too. Their places: two rows of them in an arc in front of
// you, the taller behind. The thing in the hood comes back, calm, into the
// middle of them. They stand there, still, a few seconds. Then all at once they throw it all up into the air and leap
// for joy, again and again, as its face comes up out of the hood, happy, and it takes off its robe and dances, and the
// dark turns to the pale light and the meadow comes, all of them in it. From there it is the ending as it always is: the
// meadow waits for a press, and then the bedroom, in the morning.
// The throw is this ending's jump scare, a happy one: the same soft flash as the other's (none with reduced flashing), a
// party popper going off (`twinkle`) and a brassy ta-da (`cheer`), and a burst of paper confetti in the view. And in the meadow, once they have leapt there a little, they frolic (`frolic`, and
// see `roam`): each runs about the meadow in its own gait, in loops and darts, after one another, hopping as it goes,
// leaning the way it goes, stopping now and then to leap on the spot and off again. Each is a flat drawing, and is never
// turned about its upright (that squeezed it thin, and to nothing, as it came round): going to the other side of you its
// drawing is mirrored, all at once (`face`, 1 or -1 and nothing between; only once it has gone that way a moment, so it
// does not flicker); and those that have a drawing of themselves running side on (VOID_SIDE) are drawn so while they run
// mostly across your view, and front on, as ever, coming toward you or going away; the thing in the hood, out
// of its robe (the heap of it left where it fell), skips about among them, dancing; the stone one is never seen to move
// (it is somewhere else, all at once, in another pose); the swimmer keeps to its pool, ducking under and bursting up
// again. They keep to the meadow in front of you, clear of you, the big tree, the pool and the robe, for as long as you
// stay. With reduced motion they only amble, slowly.
// Each is drawn by its own code (js/creatures), made as the game makes a creature and posed with its own fields; what it
// holds is drawn at its hand. Times are seconds from the moment the last thing was taken up.
const VOID_EGG = {
  far: 17,                              // each comes out of the dark from this far off
  first: 1.7, every: 2.5,               // the first of them sets out, and each one after it: one at a time
  raise: 0.5,                           // your hand holds its thing up this long before it sets out
  up: { x: -0.17, y: -0.15 },           // (held up: so far in from the corner of the view and up, as much of the view's height; js/hands.js spec.x, y)
  rush: 0.7,                            // each: up to you, fast
  take: 0.15, pass: 0.35, second: 0.9,  // there, it takes its thing (so long after it arrives; so long from your hand to its own); a second thing, so long after the first
  look: 0.5,                            // it holds it up and looks at it (so `snatch` in all: take + pass + look, and `second` more with two things)
  back: 2.9,                            // then it backs away, slowly, to its place
  gone: [0.15, 1.3],                    // meanwhile the thing in the hood has backed off into the dark
  demon: [29.6, 33.3],                  // and it comes back, calm, into the middle of them
  hold: 34.0,                           // all of them there, still (the last is in its place at first + 11 * every + rush + take + pass + look + back = 33.8)
  joy: 37.2,                            // then all at once they throw it all up into the air and leap for joy
  unveil: [37.2, 37.7],                 // its face comes up out of the hood, happy,
  disrobe: [37.7, 40.3],                // and it takes off its robe: the hood back, the robe dropped, a hop clear; and dances
  light: [37.5, 43.0],                  // as the dark turns to the pale light, and the meadow comes
  wait: 43.8, arm: 44.4,                // from here the meadow is yours to look about in, and waits for a press (taken from `arm`)
  frolic: 45.8,                         // and from here, one after another, they run about the meadow
  place: [0, 6.0],                      // where the thing in the hood stands among them: its bearing from the north, and how far off
};
// who takes what: each thing to the creature of the night it came from, in the order of their nights. The diner's and the
// farm's things are not among the sixteen, so the customer takes the winch handle (the nearest thing to its shutter
// crank) and the carrier the matches; the tall one the bulb (the bedroom's as well as the lighthouse's).
// b, r: its place among them (its bearing from the north, radians, and how far off); near: how near it comes for its
// things (the low ones, the crawler and the doll, not so near: nearer, they are under the view and the take is not seen); at: where it holds each of them ([x, y] from its feet, in its own drawing; the turn of the thing; its size, 1 by
// default); hop: how high it leaps (metres)
const VOID_OTHERS = [
  { type: 'walker', takes: ['hammer', 'planks'], b: -0.165, r: 7, near: 1.9, at: [[-0.45, 1.5, 0.3], [0.5, 1.2, 1.35]], hop: 0.34 },
  { type: 'crawler', takes: ['keys'], b: -0.258, r: 5.5, near: 2.5, at: [[0, 0.5, 0]], hop: 0.3 },
  { type: 'smiler', takes: ['salt', 'lantern'], b: 0.258, r: 5.5, near: 1.5, at: [[-0.3, 0.8, 0], [0.31, 0.36, 0]], hop: 0.26 },
  { type: 'watcher', takes: ['chain', 'padlock'], b: 0.537, r: 7, near: 1.8, at: [[-0.6, 1.5, 0], [0.6, 1.62, 0]], hop: 0.3 },
  { type: 'runner', takes: ['bow', 'arrows'], b: -0.63, r: 5.5, near: 1.7, at: [[-0.5, 0.62, 1.45], [0.5, 0.42, 1.3]], hop: 0.44 },
  { type: 'swimmer', takes: ['beam'], b: 0.444, r: 5.5, near: 1.4, at: [[0, 0.3, 0]], hop: 0.26 },
  { type: 'climber', takes: ['fuse'], b: -0.537, r: 7, near: 1.6, at: [[0.47, 1.86, 0]], hop: 0.36 },
  { type: 'customer', takes: ['handle'], b: -0.351, r: 7, near: 1.7, at: [[0.34, 1.12, 0]], hop: 0.3 },
  { type: 'signalman', takes: ['journal'], b: 0.351, r: 7, near: 1.9, at: [[0.42, 2.0, 0]], hop: 0.32 },
  { type: 'other', takes: ['musicbox'], b: -0.444, r: 5.5, near: 2.2, at: [[0, 0.72, 0]], hop: 0.3, own: true },
  { type: 'carrier', takes: ['matches'], b: 0.63, r: 5.5, near: 1.5, at: [[0.3, 0.8, 0]], hop: 0.28 },
  { type: 'tall', takes: ['bulb'], b: 0.165, r: 7, near: 1.9, at: [[0.5, 1.24, 0]], hop: 0.3 },
];
// the frolic: where they may run (metres from you: v ahead, to the north; u to the right of that): from v0 to v1 ahead,
// within `wedge` of that either side (so in the view, looking north); no nearer you than `you`; clear of the big tree
// ([u, v, how far]), the swimmer's pool (`water`: how far its water reaches), the heap of the robe and one another; how fast each goes (metres a second; with
// reduced motion all of them `amble`); and how long each leaps on the spot (`leap`) once in every `every` seconds or so
const VOID_FROLIC = {
  v0: 3.6, v1: 12, wedge: 0.74, you: 3.1, tree: [Math.sin(-0.72) * 11.5, Math.cos(-0.72) * 11.5, 1.8], water: 1.0, pool: 1.25, heap: 0.9, apart: 1.6, amble: 0.5, leap: 2.8, every: 8.5,
  speed: { walker: 2.4, crawler: 3.4, smiler: 3.1, runner: 5.2, climber: 3.2, customer: 2.6, signalman: 3.0, other: 2.2, carrier: 2.5, tall: 2.8, demon: 2.7 },
};
// those drawn side on as they run across your view, each by its own creature's side-on run (js/creatures: the pose fields
// its own night uses to send it running sideways), set in POSE below; the rest keep their front-on drawing, mirrored
const VOID_SIDE = { crawler: true, runner: true, other: true, carrier: true, customer: true };
function buildGathering(L, s, c0, K) {
  const span = (t, a, b) => smoothstep(clamp((t - a) / (b - a), 0, 1)), GR = 9.8, FR = VOID_FROLIC;
  let E = null;   // the gathering, once it has begun (s.egg)
  // one that goes about the meadow (each of the others, and the thing in the hood): where it is (fu, fv), the way it is
  // going (hu, hv), where it is making for (tu, tv; or after another of them, chase) and for how long yet (tT), how much
  // of its running it is at (run: 0 leaping on the spot, 1 running), which side it is going to (face: 1 your right, -1 your
  // left; flipT: how long it has been going the other way), whether it is drawn side on (side; sideT) and how it leans
  const mover = (c, type, n, u, v) => ({ c, kind: type, fu: u, fv: v, hu: u > 0 ? -1 : 1, hv: 0, tu: u, tv: v, tT: 0, chase: null, dart: 1, run: 0, fro: false, went: 0, face: 1, flipT: 0, side: 0, sideT: 0, canSide: !!VOID_SIDE[type], lean: 0,
    speed: FR.speed[type] || 0, jumps: type === 'watcher', pool: type === 'swimmer', per: FR.every + ((n * 0.37) % 1) * 4, at0: VOID_EGG.frolic + ((n * 0.618) % 1) * 1.8, rnd: mulberry32(4100 + n * 53) });
  // a creature as the game makes one (js/game.js makeCreature), standing free of any way in: placed by its bearing and distance
  const make = (type, n) => {
    const CR = CREATURES[type];
    const c = {
      type, CR, lane: { y: 0, follow: 'free', apertures: [], blockers: [] }, yaw: L.facing, idx: n + 1, D0: VOID_EGG.far, T: 60, gamma: 1, seenMult: 1, unseenMult: 1,
      u: 0, dist: VOID_EGG.far, gait: 0, t: n * 1.3, seen: true, seenLast: true, visFrac: 1, visible: true, lit: 0, lat: 0, yOff: 0, lunge: 0,
      frozen: false, reached: false, hits: 0, dead: false, moving: false, timeScale: CR.timeScale || 1, rand: mulberry32(1300 + n * 77),
      distFn: null, hold: null, catchDist: CR.catchDist, laneOptions: null, fixedLane: true,
      retarget() {}, pos() { return { x: Math.sin(this.yaw) * this.dist, y: 0, z: Math.cos(this.yaw) * this.dist }; },
    };
    CR.init(c);
    return c;
  };
  // a point of the view (sx, sy: in its pixels), `depth` metres out from the eye
  const viewPoint = (sx, sy, depth) => {
    const c = G.cam, f = R.f, xc = (sx - R.W / 2) / f, yc = -(sy - R.H / 2) / f;
    const cy = Math.cos(c.yaw), sw = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    const dy = yc * cp - sp, cz = yc * sp + cp;
    return { x: (xc * cy + cz * sw) * depth, y: L.eyeH + dy * depth, z: (-xc * sw + cz * cy) * depth };
  };
  // where a thing is as it is taken: in your raised hand (or, should it not be up yet, out of sight below)
  const whereIs = it => {
    const H = G.hand;
    if (H.cur === it && H.up > 0.5) return HANDS.handWorld(it, 0.8).p;
    return viewPoint(R.W * 0.62, R.H * 1.08, 0.7);
  };
  // your hand holds a thing up for the one that is coming for it: out of what you carry, or up off the floor where you had
  // put it down (or out of the air, falling), as a thing taken up comes into the hand
  const present = it => {
    const f = K.falls.find(q => q.it === it);
    if (f) K.falls.splice(K.falls.indexOf(f), 1);
    if (!G.inv.includes(it)) { if (!f) HANDS.picked(it); it.taken = true; G.hover = null; }
    E.show = it;
  };
  // where the k-th thing a creature holds is, in the world (its hand, as it stands now)
  const handAt = (o, k) => {
    const c = o.c, p = c.pos(), a = o.at[k] || o.at[0];
    return { x: p.x + Math.cos(c.yaw) * a[0], y: (c.yOff || 0) + o.hopY + a[1], z: p.z - Math.sin(c.yaw) * a[0] };
  };
  function begin() {
    const c = c0();
    E = s.egg = {
      t: 0, phase: 'rush', show: null, d0: c.dist, yaw0: c.yaw, joy: 0, glow: 0, thrown: [], stepT: 0, dm: mover(c, 'demon', 12, Math.sin(VOID_EGG.place[0]) * VOID_EGG.place[1], Math.cos(VOID_EGG.place[0]) * VOID_EGG.place[1]),
      others: VOID_OTHERS.map((d, n) => Object.assign(mover(null, d.type, n, Math.sin(d.b) * d.r, Math.cos(d.b) * d.r), d, { n, c: make(d.type, n), skip: 0.1 + 0.14 * ((n * 0.29) % 1), items: d.takes.map(id => L.items.find(i => i.id === id)), fly: [], held: [], threw: null, age: n % 3, joyK: 0, on: false, came: false, took: false, shown: 0, tookN: 0, lift: 0, sn: VOID_EGG.take + VOID_EGG.pass + VOID_EGG.look + (d.takes.length - 1) * VOID_EGG.second, hopY: 0, squash: 1, ph: (n * 0.618) % 1, fade: 1 })),
    };
    E.movers = E.others.concat([E.dm]);
    const sw = E.others.find(o => o.pool);
    E.poolU = sw.fu; E.poolV = sw.fv; E.heapU = E.dm.fu; E.heapV = E.dm.fv;
    s.ending = true; s.endT = 0; s.armAt = VOID_EGG.arm;
    // the thing in the hood: stopped where it is, and placed by its bearing and distance from here on
    c.frozen = true; c.hold = null;
    c.lane = Object.assign({}, c.lane, { follow: 'free', apertures: [], blockers: [] });
    c.distFn = cr => {
      if (E.dm.fro) { cr.yaw = L.facing + Math.atan2(E.dm.fu, E.dm.fv); return Math.hypot(E.dm.fu, E.dm.fv); }
      const t = E.t, back = t >= VOID_EGG.demon[0] - 0.4;
      cr.yaw = back ? L.facing + VOID_EGG.place[0] : E.yaw0;
      return back ? lerp(15, VOID_EGG.place[1], span(t, VOID_EGG.demon[0], VOID_EGG.demon[1])) : E.d0 + 9 * easeIn(clamp((t - VOID_EGG.gone[0]) / (VOID_EGG.gone[1] - VOID_EGG.gone[0]), 0, 1));
    };
    // (js/hands.js: your hand is still drawn, the night won; it holds what is being handed over, E.show, and nothing else;
    // each thing held up higher and further in than it is carried)
    L.keepHeld = true; L.heldItem = () => E.show || null;
    for (const it of L.items) it.held = Object.assign({}, it.held, VOID_EGG.up);
    foundEgg();
    AUDIO.sfx('stingHum'); win();
  }
  const pan = c => Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
  // one of them takes the k-th of what was its own out of your raised hand: your hand lets go of it (open, and it goes
  // down), and it goes across to its own hand
  function take(o, k) {
    const it = o.items[k], from = whereIs(it);
    o.took = true; o.tookN = k + 1;
    if (G.inv.includes(it)) { HANDS.dropped(it); G.removeFromInv(it); } else if (G.hand.cur === it) G.hand.gone = it;
    it.taken = true; it.by = o.type;
    o.fly.push({ it, k, t: 0, from });
    if (E.show === it) E.show = null;
    G.hover = null; G.invSig = '';
    AUDIO.sfx('pickup', pan(o.c));
  }
  // how each stands, comes and leaps: its own fields (js/creatures), set every frame. q: u (seconds since it set out),
  // rush, near, back (0..1 through each), joy (0..1), hop (0..1 through each leap; -1 on the ground)
  const POSE = {
    walker(c, q, o) { o.poseDist = q.joy > 0.01 ? lerp(o.r, 2.2, q.joy * (1 - 0.6 * q.run)) : 0; },   // (its arms come up as they do when it is close)
    crawler(c, q, o) { c.mode = q.joy > 0.5 ? 'scuttle' : 'pause'; c.modeT = 1; c.runPose = !!o.side; c.runDir = o.face; c.runGait = c.gait; },
    smiler(c, q) { c.rush = q.joy; },
    watcher(c, q, o) {   // stone: it stands in one pose, and is in another each time it comes down
      if (!c.pose) c.pose = 2;
      if (q.back >= 1 && q.joy < 0.05) c.pose = 2;   // (in its place: its hands up either side of its head, the chain in one and the lock in the other)
      const n = q.hop < 0 ? -1 : q.n;
      if (n !== o.hops) { if (o.hops !== undefined && n >= 0) c.pose = 1 + (c.pose % 3); o.hops = n; }
    },
    runner(c, q, o) { c.mode = o.side ? 'dart' : q.back > 0.15 && q.joy < 0.5 ? 'crouch' : 'sprint'; c.modeT = 1; c.runDir = o.face; c.runGait = c.gait; },
    swimmer(c, q, o) {
      // it comes skimming in, only its head above the black floor as it was above the water, and bursts up out of it at you
      c.mode = 'up';
      const k = clamp((q.u - q.R1 * 0.8) / 0.4, 0, 1), lift = 0.95;
      if (k > 0 && c.burstT === undefined) { c.burstT = c.t; c.burstY = lift; if (!q.still) AUDIO.sfx('splash', pan(c)); }
      // (frolicking, it keeps to its pool: now and then it ducks under and bursts up out of it again)
      let dip = 0;
      if (q.run > 0 && !q.still) {
        const w = q.t * 0.19 + o.ph, x = w % 1, n = Math.floor(w);
        if (x < 0.14) dip = Math.sin(Math.PI * x / 0.14) * q.run;
        if (x >= 0.07 && x < 0.14 && o.dove !== n) { o.dove = n; c.burstT = c.t; AUDIO.sfx('splash', pan(c)); }
      }
      c.lunge = k; c.yOff = lift * smoothstep(k) * (1 - 0.62 * dip);
    },
    climber(c, q) { c.lunge = 0.75 + 0.25 * Math.max(q.near, q.joy); },
    customer(c, q, o) { c.runPose = !!o.side; c.runTurn = 1; c.runAmt = 1; c.runDir = o.face; c.runGait = c.gait; c.shove = q.joy > 0.01 ? { k: q.joy * (1 - 0.5 * q.run), h: 2.3, up: q.hop < 0 ? 0 : Math.sin(Math.PI * q.hop) } : null; },
    // (its long arm up, holding the notebook out to be seen; then high, waving)
    signalman(c, q, o) { const up = Math.max(q.back, q.joy); c.reach = up; c.grip = o.held[0] ? 1 : 0; c.reachSide = 1; c.reachTo = { x: lerp(0.42, 0.5 + (q.still ? 0 : 0.3 * Math.sin(q.t * 7)), q.joy), y: lerp(2.05, 3.1, q.joy) }; },
    other(c, q, o, dt) { c.runPose = !!o.side; c.runDir = o.face; c.runGait = c.gait; c.danceT = (c.danceT || 0) + dt * (1 + 2 * q.joy); c.dance = 1; c.smile = 1; const it = o.held[0]; c.carry = it ? (ctx, P) => it.icon(ctx, P) : null; },   // (the box in its arms, as it carried it off: its own drawing)
    carrier(c, q, o) { c.flail = q.joy; c.runPose = !!o.side; c.runDir = o.face; c.runGait = c.gait; },
    tall(c, q) { c.reach = Math.max(q.back, q.joy); c.gripY = lerp(1.62, 2.5, q.joy); },   // (its hands up in front of it, with the bulb; then high)
  };
  // how hard they leap, jt seconds into the joy: all out for a while, then gentler, and now and then (each in its own
  // time) a little more, for as long as the meadow waits
  const joyAmp = (jt, o) => {
    const first = 1 - 0.62 * span(jt, 7, 10), u = (jt - 10 + (o ? o.ph * 12 : 0)) % 9;
    return jt > 10 && u < 3 ? Math.max(first, 0.38 + 0.5 * Math.min(1, u * 2, (3 - u) * 2)) : first;
  };
  // thrown: each thing goes up from its hand, turning, a little toward you and to one side, and comes down on the ground
  function throwAll(o, t) {
    o.threw = t;
    const c = o.c, rs = mulberry32(900 + o.n * 31);
    o.held.forEach((it, k) => {
      if (!it) return;
      const p0 = handAt(o, k), vy = 6.4 + rs() * 1.2, side = (rs() - 0.5) * 1.5 + (k ? 0.5 : -0.5) * (o.held.length > 1 ? 1 : 0), toYou = 0.35 + rs() * 0.5;
      const tl = (vy + Math.sqrt(vy * vy + 2 * GR * Math.max(0, p0.y - 0.02))) / GR;
      E.thrown.push({ it, by: o.type, t0: t + k * 0.06, p0, vy, tl, vx: Math.cos(c.yaw) * side - Math.sin(c.yaw) * toYou, vz: -Math.sin(c.yaw) * side - Math.cos(c.yaw) * toYou, rot0: (o.at[k] || o.at[0])[2] || 0, spin: (rs() < 0.5 ? -1 : 1) * (4 + rs() * 5), fade: 1 });
    });
    o.held = [];
  }
  // ---- the frolic ----
  // is a spot (u, v) one of the meadow's, where one of them may be?
  const spot = (u, v) => v >= FR.v0 && v <= FR.v1 && Math.abs(u) <= FR.wedge * v && Math.hypot(u - FR.tree[0], v - FR.tree[1]) > FR.tree[2] + 0.4
    && Math.hypot(u - E.poolU, v - E.poolV) > FR.pool + 0.6 && Math.hypot(u - E.heapU, v - E.heapV) > FR.heap + 0.4;
  let AX = 0, AY = 0;   // (the way it would go, summed: no objects made in a frame)
  const shy = (m, x, y, r, w) => { const ex = m.fu - x, ey = m.fv - y, e2 = ex * ex + ey * ey; if (e2 < r * r && e2 > 1e-6) { const e = Math.sqrt(e2), k = (1 - e / r) * w / e; AX += ex * k; AY += ey * k; } };
  // (one that stood nearer than that as it set off is moved out of it, not put out of it at once)
  const keepOff = (m, x, y, r, by) => { const ex = m.fu - x, ey = m.fv - y, e2 = ex * ex + ey * ey; if (e2 < r * r) { const e = Math.sqrt(e2) || 1e-3, k = Math.min(r - e, by) / e; m.fu += (e2 ? ex : 1e-3) * k; m.fv += ey * k; } };
  // somewhere new to make for: another of them, to run after it a while; or a spot of the meadow, at a run or a dart
  const aim = m => {
    m.chase = null;
    if (m.rnd() < 0.22) { const q = E.movers[Math.floor(m.rnd() * E.movers.length)]; if (q !== m && !q.jumps && !q.pool) { m.chase = q; m.tT = 2.5 + m.rnd() * 2.5; m.dart = 1.15; return; } }
    const v = FR.v0 + 0.3 + m.rnd() * (FR.v1 - FR.v0 - 0.6), u = (m.rnd() < 0.5 ? -1 : 1) * Math.pow(m.rnd(), 0.7) * FR.wedge * v * 0.94;
    if (!spot(u, v)) { m.tT = 0; return; }   // (not there: another, next time)
    m.tu = u; m.tv = v; m.tT = 3 + m.rnd() * 4; m.dart = 0.7 + m.rnd() * 0.65;
  };
  // one of them, a moment on (want: running, 1, or leaping on the spot, 0); m.went: how far it went, metres
  function roam(m, dt, want, still) {
    m.run += (want - m.run) * Math.min(1, dt * 3);
    m.went = 0;
    if (m.pool) return;
    if (m.jumps) {   // the stone one: it is not seen to go; it is somewhere else, all at once, in another pose
      m.tT -= dt * want;
      if (m.tT > 0) return;
      const v = FR.v0 + 0.6 + m.rnd() * (FR.v1 - FR.v0 - 1.2), u = (m.rnd() * 2 - 1) * FR.wedge * v * 0.9;
      if (!spot(u, v) || Math.hypot(u - m.fu, v - m.fv) < 2.5) return;
      for (const q of E.movers) if (q !== m && Math.hypot(u - q.fu, v - q.fv) < 1.8) return;
      m.fu = u; m.fv = v; m.tT = still ? 5 + m.rnd() * 3 : 1.4 + m.rnd() * 1.8; m.c.pose = 1 + (m.c.pose % 3); m.face = m.rnd() < 0.5 ? -1 : 1;
      return;
    }
    m.tT -= dt;
    if (m.chase) { m.tu = m.chase.fu; m.tv = m.chase.fv; }
    let du = m.tu - m.fu, dv = m.tv - m.fv, d = Math.hypot(du, dv);
    if (m.tT <= 0 || d < (m.chase ? 1.6 : 0.7)) { aim(m); if (m.chase) { m.tu = m.chase.fu; m.tv = m.chase.fv; } du = m.tu - m.fu; dv = m.tv - m.fv; d = Math.hypot(du, dv); }
    AX = d > 1e-3 ? du / d : m.hu; AY = d > 1e-3 ? dv / d : m.hv;
    for (const q of E.movers) if (q !== m) shy(m, q.fu, q.fv, q.pool ? FR.pool + 0.6 : FR.apart, 4);
    shy(m, 0, 0, FR.you + 0.9, 4); shy(m, FR.tree[0], FR.tree[1], FR.tree[2] + 0.7, 4); shy(m, E.heapU, E.heapV, FR.heap + 0.5, 3);
    const lim = FR.wedge * m.fv;
    if (m.fv < FR.v0) AY += (FR.v0 - m.fv) * 8; else if (m.fv > FR.v1) AY -= (m.fv - FR.v1) * 8;
    if (Math.abs(m.fu) > lim) AX -= Math.sign(m.fu) * (Math.abs(m.fu) - lim) * 8;
    // it turns toward that, so fast and no faster (so it goes in loops), slower through a tight turn
    const al = Math.hypot(AX, AY) || 1, dot = (m.hu * AX + m.hv * AY) / al, turn = clamp(Math.atan2(m.hu * AY - m.hv * AX, m.hu * AX + m.hv * AY), -1, 1) * Math.min(1, dt * (still ? 2 : 5.5));
    const ct = Math.cos(turn), st = Math.sin(turn), hu = m.hu * ct - m.hv * st, hv = m.hu * st + m.hv * ct, hl = Math.hypot(hu, hv) || 1;
    m.hu = hu / hl; m.hv = hv / hl;
    const sp = (still ? FR.amble : m.speed * m.dart) * m.run * (0.55 + 0.45 * Math.max(0, dot)), u0 = m.fu, v0 = m.fv;
    m.fu += m.hu * sp * dt; m.fv += m.hv * sp * dt;
    const by = dt * (still ? 0.5 : 2.5);
    keepOff(m, 0, 0, FR.you, by); keepOff(m, FR.tree[0], FR.tree[1], FR.tree[2], by); keepOff(m, E.poolU, E.poolV, FR.pool, by); keepOff(m, E.heapU, E.heapV, FR.heap, by);
    for (const q of E.movers) if (q !== m && !q.pool) keepOff(m, q.fu, q.fv, 0.75, still ? by : by * 3);   // (nor through one another)
    m.fv = clamp(m.fv, FR.v0, FR.v1); m.fu = clamp(m.fu, -FR.wedge * m.fv - 0.3, FR.wedge * m.fv + 0.3);
    m.went = Math.hypot(m.fu - u0, m.fv - v0);
    // which side of you it is going to: its drawing is mirrored at once when that changes (never turned through), once it
    // has gone the new way a moment; side on, while it runs mostly across your view (those that have that drawing; a
    // little more across to begin than to go on, and held a moment either way); and leaning into it
    const r = Math.hypot(m.fu, m.fv) || 1, across = (m.hu * m.fv - m.hv * m.fu) / r, k = sp / (m.speed || 1), to = across > 0 ? 1 : -1;
    if (to !== m.face && Math.abs(across) > 0.3 && sp > 0.1) { m.flipT += dt; if (m.flipT > 0.14) { m.face = to; m.flipT = 0; } } else m.flipT = 0;
    const sideways = m.canSide && !still && m.run > 0.6 && Math.abs(across) > (m.side ? 0.5 : 0.78) ? 1 : 0;
    if (sideways !== m.side) { m.sideT += dt; if (m.sideT > 0.2) { m.side = sideways; m.sideT = 0; } } else m.sideT = 0;
    m.lean += ((still ? 0 : -0.18 * across * Math.min(1, k)) - m.lean) * Math.min(1, dt * 6);
  }
  // when each runs and when it leaps on the spot, from the moment it sets off (with reduced motion it only ambles)
  const wants = (m, t, still) => s.leaving ? 0 : still || (t - m.at0) % m.per < m.per - FR.leap ? 1 : 0;
  function update(dt, still) {
    const c = c0(), t = E.t = s.endT += dt, R1 = still ? 1.3 : VOID_EGG.rush, B1 = VOID_EGG.back - (R1 - VOID_EGG.rush), far = still ? 9 : VOID_EGG.far;
    E.phase = t < VOID_EGG.hold ? 'rush' : t < VOID_EGG.joy ? 'hold' : 'joy';
    // ---- the others ----
    const joyT = t - VOID_EGG.joy;
    for (const o of E.others) {
      const oc = o.c, u = t - (VOID_EGG.first + o.n * VOID_EGG.every);
      oc.t += dt * oc.timeScale; oc.still = still;
      o.on = u >= 0;
      // your hand holds its thing up, a beat before it sets out (its second thing, once it has the first)
      if (o.shown < o.items.length && u >= (o.shown ? R1 + VOID_EGG.take + (o.shown - 1) * VOID_EGG.second + 0.1 : -VOID_EGG.raise)) present(o.items[o.shown++]);
      if (!o.on) continue;
      const prev = oc.dist, rush = clamp(u / R1, 0, 1), near = u >= R1 && u < R1 + o.sn ? 1 : 0, back = span(u, R1 + o.sn, R1 + o.sn + B1);
      // up to you along its own way, a little in toward the middle so it is in your face; then back out to its place
      // (the stone one is never seen to move: it is nearer, all at once, three times; and goes back so, a pose at a time)
      const stone = o.type === 'watcher', rk = stone ? Math.ceil(rush * 3 - 1e-9) / 3 : rush, bk = stone ? Math.floor(back * 7 + 1e-9) / 7 : back;
      oc.dist = u < R1 ? lerp(far, o.near, still && !stone ? smoothstep(rk) : easeOut(rk)) : lerp(o.near, o.r, bk);
      oc.yaw = L.facing + o.b * lerp(1, 0.6, rk * (1 - bk));
      if (stone && o.step !== rk + bk) { if (o.step !== undefined) { oc.pose = 1 + (oc.pose % 3); if (bk > 0) AUDIO.sfx('stoneRub', pan(oc)); } o.step = rk + bk; }
      // the frolic: about the meadow, each from its own moment
      if (!o.fro && t >= o.at0 && !s.leaving) o.fro = true;
      if (o.fro) { roam(o, dt, wants(o, t, still), still); oc.dist = Math.hypot(o.fu, o.fv); oc.yaw = L.facing + Math.atan2(o.fu, o.fv); }
      const moved = o.fro ? o.went : Math.abs(prev - oc.dist), g0 = oc.gait;
      oc.gait += moved * oc.CR.stepRate * Math.PI; oc.moving = moved > 0.024 * dt;
      if (!oc.moving || stone) { const rest = Math.round(oc.gait / Math.PI) * Math.PI; oc.gait += (rest - oc.gait) * Math.min(1, dt * 4); }
      oc.idleK = (oc.idleK === undefined ? 1 : oc.idleK) + ((oc.moving ? 0 : 1) - (oc.idleK === undefined ? 1 : oc.idleK)) * Math.min(1, dt * 2.5);
      if (o.fro) { if (oc.CR.sound && E.stepT <= 0 && !still && Math.floor(oc.gait / Math.PI) !== Math.floor(g0 / Math.PI)) { E.stepT = 0.17; AUDIO.footstep(oc.CR.sound, clamp(2.4 / (oc.dist + 1.6), 0, 0.85) * 0.22, pan(oc)); } }   // (a patter of them, not every step of every one)
      else if (oc.CR.sound && Math.floor(oc.gait / Math.PI) !== Math.floor(g0 / Math.PI)) AUDIO.footstep(oc.CR.sound, clamp(2.4 / (oc.dist + 1.6), 0, 0.85) * (u < R1 ? 0.7 : 0.3), pan(oc));
      // there: its own voice, a rush of air, a jolt; and it takes what was its own
      if (u >= R1 && !o.came) {
        o.came = true;
        if (oc.CR.voice) AUDIO.voice(oc.CR.voice.kind, 0.6, pan(oc));
        AUDIO.sfx(o.type === 'watcher' ? 'stoneRub' : 'cloth', pan(oc));
        if (!still) G.shake(0.14);
      }
      if (o.tookN < o.items.length && u >= R1 + VOID_EGG.take + o.tookN * VOID_EGG.second) take(o, o.tookN);
      for (const f of o.fly.slice()) { f.t += dt; if (f.t >= VOID_EGG.pass) { o.fly.splice(o.fly.indexOf(f), 1); o.held[f.k] = f.it; AUDIO.sfx('pat', pan(oc)); } }
      // (and it holds it up a little, to look at it, before it goes)
      o.lift = Math.sin(Math.PI * clamp((u - (R1 + o.sn - VOID_EGG.look)) / (VOID_EGG.look + 0.25), 0, 1));
      // the joy: it throws what it holds up into the air (each a moment after the other), and leaps, again and again
      const jt = joyT - o.ph * 0.18;
      let hop = -1, hopT = 1;
      o.hopY = 0; o.squash = 1;
      if (jt >= 0) {
        if (o.threw === null) throwAll(o, t);
        // (as you go on, they come down and stand; running, only little hops, and the stone one none)
        const amp = (o.fro ? (stone ? 0.8 * (1 - o.run) : lerp(0.8, o.skip, o.run)) : joyAmp(jt, o)) * (s.leaving ? o.joyK : 1);
        if (still) o.hopY = 0.05 * amp * (0.5 + 0.5 * Math.sin(jt * 2.2 + o.ph * 6));
        else if (amp > 0.02) {
          const A = o.hop * amp, T = Math.sqrt(8 * A / GR) + 0.08;
          o.hx = o.hx === undefined ? jt / T : o.hx + dt / T;   // (how many leaps so far: each as long as its height takes)
          const x = o.hx % 1, air = clamp(x * (T / (T - 0.08)), 0, 1);
          hop = x; hopT = T; o.hopY = 4 * A * air * (1 - air);
          o.squash = 1 + 0.06 * Math.sin(TAU * air) * Math.min(1, amp * 2) - (air >= 1 ? 0.06 : 0);
        }
      }
      o.age++;
      o.joyK += ((jt >= 0 && !s.leaving ? 1 : 0) - o.joyK) * Math.min(1, dt * 7);
      const q = o.q || (o.q = {});
      q.u = u; q.rush = rush; q.near = near; q.back = back; q.joy = smoothstep(o.joyK); q.hop = hop; q.n = Math.floor(o.hx || 0); q.jt = jt; q.T = hopT; q.t = t; q.still = still; q.R1 = R1; q.run = o.fro ? o.run : 0;
      if (POSE[o.type]) POSE[o.type](oc, q, o, dt);
      o.fade = s.leaving ? clamp(1 - (s.leaveT - 0.3 - o.ph * 0.5) / 1.6, 0, 1) : 1;
    }
    // ---- the thing in the hood ----
    // it stops, straightens and backs off into the dark; comes back, calm, two pale eyes in its hood; and at the joy its face
    // comes up out of the hood, happy, it takes off its robe and dances
    const ease = Math.min(1, dt * 5);
    c.still = still;
    c.yOff += (0 - c.yOff) * ease; c.stoop += (0 - c.stoop) * ease;
    const away = span(t, VOID_EGG.gone[0] + 0.3, VOID_EGG.gone[1]), here = span(t, VOID_EGG.demon[0], VOID_EGG.demon[0] + 1.4);
    E.joy = t >= VOID_EGG.joy ? 1 : 0;
    c.calm = span(t, VOID_EGG.joy, VOID_EGG.joy + 1.6);
    if (E.joy) { c.mood = CREATURES.demon.moods - 1; c.unveil = span(t, VOID_EGG.unveil[0], VOID_EGG.unveil[1]); c.settle = 1; c.tilt0 = 0; }
    c.disrobe = clamp((t - VOID_EGG.disrobe[0]) / (VOID_EGG.disrobe[1] - VOID_EGG.disrobe[0]), 0, 1);
    const dj = t - VOID_EGG.disrobe[1] + 0.4;
    // and it frolics with them: it skips about among them (dancing as it goes: its hops and kicks), and stops to dance
    const dm = E.dm;
    E.stepT -= dt;
    if (!dm.fro && t >= dm.at0 && !s.leaving) { dm.fro = true; c.noHeap = true; }
    if (dm.fro) { roam(dm, dt, wants(dm, t, still), still); c.tip = dm.lean; c.flip = dm.face; c.gait += dm.went * c.CR.stepRate * Math.PI; }
    c.dance += ((still || s.leaving || dj <= 0 ? 0 : dm.fro ? lerp(1, 0.75, dm.run) : Math.min(1, dj * 2) * joyAmp(dj, null)) - c.dance) * Math.min(1, dt * 7);
    if (t >= VOID_EGG.joy && !E.cheered) {
      // (the scare of this ending, a happy one: the same soft flash as the other's, a party popper going off, `twinkle`, and a
      // brassy ta-da, `cheer`; and paper in the air: the confetti, below)
      E.cheered = true; AUDIO.sfx('cheer', 0); AUDIO.sfx('twinkle', 0); AUDIO.sfx('win');
      if (!still) G.shake(0.2);
      if (!SAVE.data.settings.reducedFlash) G.flash(0.25);
    }
    if (t >= VOID_EGG.unveil[0] + 0.2 && !E.hum) { E.hum = true; AUDIO.voice('hum', 0.5, 0); }
    if (t >= VOID_EGG.disrobe[0] + 0.5 && !E.cloth) { E.cloth = true; AUDIO.sfx('cloth', 0); }
    // the light behind them all, as they gather
    E.glow = span(t, VOID_EGG.first + 1.5, VOID_EGG.first + 5);
    // ---- the light, the meadow, the tune, and the wait ----
    const mv = s.meadow = span(t, VOID_EGG.light[0], VOID_EGG.light[1]);
    s.spin = 0;
    K.lightStep(dt, mv);
    K.tuneStep(t, VOID_EGG.disrobe[0]);
    if (t >= VOID_EGG.wait) s.wait = true;
    if (s.wait && !s.leaving) K.idleStep(dt);
    c.fade = s.leaving ? clamp(1 - (s.leaveT - 0.3) / 2.0, 0, 1) : t < VOID_EGG.demon[0] ? 1 - away : here;
    for (const th of E.thrown) th.fade = s.leaving ? clamp(1 - (s.leaveT - 0.2) / 1.2, 0, 1) : 1;
    K.meadow.update();
  }
  const calmed = () => !!SAVE.data.settings.reducedMotion;
  // ---- the confetti ----
  // The throw is a party popper going off, so there is paper in the air: bits of coloured paper burst up into the view from
  // its two bottom corners, up and in, slow in the air and flutter down, turning over, and are gone CONF.T seconds on.
  // Drawn flat on the view (the overlay): each a small rectangle, where the time alone puts it (nothing is kept from
  // frame to frame and nothing made in one; what each is like was drawn by lot once, here). With reduced motion there is
  // no burst: only a few of them, let fall slowly from above.
  const CONF = { n: 44, still: 10, T: 2.6, drag: 3.1, cols: ['#f25c54', '#f7b32b', '#4fc1e8', '#7bd389', '#c77dff', '#fff4d6', '#ff8fab'] };
  const conf = (() => {
    const r = mulberry32(7741), a = k => { const v = new Float32Array(CONF.n); for (let i = 0; i < CONF.n; i++) v[i] = k(i); return v; };
    // (ang: how steeply it goes up, 0 flat to 1 straight up; sp: how fast, view heights a second; fall: how fast it comes
    // down; sway, w, ph: its flutter; size: its length, of the view's height; late: when it goes; col: which colour)
    return { ang: a(() => 0.3 + r() * 0.68), sp: a(() => 1.5 + r() * 2.1), fall: a(() => 0.15 + r() * 0.17), sway: a(() => 0.008 + r() * 0.022), w: a(() => 4 + r() * 6), ph: a(() => r() * TAU), size: a(() => 0.016 + r() * 0.016), late: a(() => r() * 0.1), col: a(() => Math.floor(r() * CONF.cols.length)) };
  })();
  function overlay(ctx, W, H) {
    if (!E) return;
    E.confN = 0;
    const t = E.t - VOID_EGG.joy;
    if (t < 0 || t > CONF.T + 0.1 || s.leaving) return;
    const still = calmed(), n = still ? CONF.still : CONF.n, C = conf;
    for (let i = 0; i < n; i++) {
      const u = t - C.late[i];
      if (u < 0 || u > CONF.T) continue;
      let x, y;
      if (still) { x = (i + 0.5) / n * W + C.sway[i] * H * Math.sin(u * 1.3 + C.ph[i]); y = (-0.04 + (0.1 + C.fall[i] * 0.9) * u) * H; }
      else {
        const side = i % 2 ? 1 : -1, e = (1 - Math.exp(-CONF.drag * u)) / CONF.drag, a = C.ang[i] * Math.PI / 2;
        x = W / 2 + side * (W * 0.47 - Math.cos(a) * C.sp[i] * e * H) + C.sway[i] * H * Math.sin(u * C.w[i] * 0.6 + C.ph[i]) * Math.min(1, u);
        y = (1.02 - Math.sin(a) * C.sp[i] * e + C.fall[i] * (u - e)) * H;
      }
      if (y > H + 20 || y < -20) continue;
      const turn = Math.cos(u * C.w[i] * (still ? 0.35 : 1) + C.ph[i]), len = C.size[i] * H;
      ctx.save();
      ctx.globalAlpha = clamp((CONF.T - u) / 0.5, 0, 1) * (still ? 0.8 : 1);
      ctx.translate(x, y); ctx.rotate(C.ph[i] + u * (still ? 0.6 : 2.2) * (i % 3 - 1)); ctx.scale(1, Math.abs(turn) < 0.18 ? 0.18 : turn);   // (a bit of paper turning over as it falls)
      ctx.fillStyle = CONF.cols[C.col[i]]; ctx.fillRect(-len / 2, -len * 0.3, len, len * 0.6);
      ctx.restore();
      E.confN++;
    }
  }
  // drawn square to the view about its middle (turned rot), as a thing in the air is (fallDraw)
  const inAir = (it, x, y, z, rot, size, alpha) => {
    const w = it.w * size, h = it.h * size, big = Math.max(w, h) * 1.2;
    R.add({ kind: 'sprite', x, y: y - big / 2, z, w: big, h: big, layer: 1, noContact: true, alpha, draw: (ctx, P) => {
      ctx.translate(0, big / 2);
      const m = ctx.getTransform(), sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
      if (sy > 1e-6) ctx.scale(1, sx / sy);
      ctx.rotate(rot); ctx.translate(0, -h / 2); ctx.scale(w, h);
      it.icon(ctx, P);
    } });
  };
  // the water the swimmer stands in: a pool of its own round it, black in the void, the sky's blue in the meadow
  const pond = (p, d, a) => {
    const w = 2.3, h = 2.3, col = mixc([20, 28, 40], [86, 142, 196], s.meadow), rim = mixc([52, 62, 80], [176, 212, 236], s.meadow);
    R.add({ kind: 'sprite', x: p.x * (1 - h / 2 / d), y: 0.004, z: p.z * (1 - h / 2 / d), w, h, flat: true, layer: 0, sortDist: 0.012, noLight: true, noContact: true, alpha: a, draw: ctx => {
      ctx.scale(w, h);
      P_ell(ctx, 0, 0.5, 0.43, 0.43, rgba(rim, 0.3)); P_ell(ctx, 0, 0.5, 0.39, 0.39, rgba(rim, 0.55)); P_ell(ctx, 0, 0.5, 0.36, 0.36, rgba(col, 0.92));
      P_ell(ctx, -0.12, 0.62, 0.12, 0.035, rgba(rim, 0.35)); P_ell(ctx, 0.14, 0.34, 0.09, 0.028, rgba(rim, 0.3));
    } });
  };
  // one of them, as its own code draws it (with the game's own slow breath and lean), and what it holds at its hand
  const paint = (o, ctx, P) => {
    const c = o.c;
    ctx.save();
    if (o.fro && !o.pool && !o.side) { if (o.lean) ctx.rotate(o.lean); if (o.face < 0) ctx.scale(-1, 1); }   // (leaning the way it goes, and mirrored, whole, going to your left; side on, its own drawing faces the way it runs)
    if (o.squash !== 1) ctx.scale(1, o.squash);
    if (!c.lunge) { ctx.scale(1, 1 + 0.014 * Math.sin(c.t * 1.6)); ctx.rotate(0.008 * Math.sin(c.t * 0.7) * (c.idleK === undefined ? 1 : c.idleK)); }
    const d = c.dist; if (o.poseDist) c.dist = o.poseDist;
    try { c.CR.draw(ctx, c, P); } finally { c.dist = d; }
    ctx.restore();
    o.held.forEach((it, k) => {
      if (!it || o.own) return;   // (own: its own drawing has it)
      const a = o.at[k] || o.at[0], size = a[3] || 1;
      ctx.save(); ctx.translate(a[0], a[1] * o.squash + 0.14 * o.lift); ctx.rotate((a[2] || 0) * (1 - 0.35 * o.lift)); ctx.scale(it.w * size, it.h * size); ctx.translate(0, -0.5);
      it.icon(ctx, P); ctx.restore();
    });
  };
  // Going, each fades as one picture, not part by part (its parts lie over one another): it is drawn onto a small canvas
  // of its own (again every third step of the clock: it stands still then) and that is put into the view, faded. (Drawing
  // them all that way all the time, at a lower rate, was tried for speed: copying the pictures cost more than drawing them.)
  // BOX: how far its drawing reaches, in metres from its feet (left, right, down, up)
  const BOX = { signalman: [-1.3, 1.6, -0.25, 3.8], swimmer: [-1.4, 1.4, -1.3, 2.0], climber: [-1.6, 1.6, -0.3, 3.0], carrier: [-1.4, 1.4, -0.25, 3.1], crawler: [-1.5, 1.5, -0.25, 2.1] };
  const shown = (o, ctx, P) => {
    const m = ctx.getTransform(), sx = Math.abs(m.a), sy = Math.abs(m.d), B = BOX[o.type] || [-1.3, 1.3, -0.25, o.c.CR.h + 0.9];
    const w = Math.ceil((B[1] - B[0]) * sx) + 2, h = Math.ceil((B[3] - B[2]) * sy) + 2;
    if (o.fade >= 1 || typeof document === 'undefined' || m.b || m.c || w > 1600 || h > 1600 || w < 8 || h < 8) { paint(o, ctx, P); return; }
    const cv = o.cv || (o.cv = document.createElement('canvas')), K = o.cvK;
    if (!K || Math.abs(K.sx / sx - 1) > 0.03 || Math.abs(K.sy / sy - 1) > 0.03 || o.age >= 3) {
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      const x = cv.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h);
      x.setTransform(sx, 0, 0, -sy, 1 - B[0] * sx, 1 + B[3] * sy);
      paint(o, x, P);
      o.cvK = { sx, sy, ox: 1 - B[0] * sx, oy: 1 + B[3] * sy }; o.age = 0;
    }
    const k = o.cvK, kx = sx / k.sx, ky = sy / k.sy;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(cv, m.e - k.ox * kx, m.f - k.oy * ky, cv.width * kx, cv.height * ky);
  };
  function draw() {
    if (!E) return;
    const t = E.t;
    // the light behind them all: faint, cold and wide, as the one behind it always is, so each dark shape stands against it
    const ga = E.glow * (1 - clamp(s.meadow / VOID_PALE, 0, 1));
    if (ga > 0.01) {
      const d = 9, x = Math.sin(L.facing) * d, z = Math.cos(L.facing) * d, e = Math.exp(-3.4);
      R.add({ kind: 'sprite', x, y: 0, z, w: 26, h: 6, dist: d, sortDist: 30, layer: 1, noContact: true, noLight: true, noFog: true, draw: ctx => {
        ctx.translate(0, 1.9); ctx.scale(12.5, 3.9);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        for (let i = 0; i <= 10; i++) { const u = i / 10; g.addColorStop(u, rgba([104, 112, 134], 0.4 * ga * (Math.exp(-3.4 * u * u) - e) / (1 - e))); }
        ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2);
      } });
    }
    for (const o of E.others) {
      if (!o.on || o.fade <= 0.004) continue;
      const c = o.c, CR = c.CR, p = c.pos();
      const sp = o.sprite || (o.sprite = { kind: 'sprite', w: CR.w, h: CR.h, fogScale: 0.85, layer: 1, noContact: true, draw: (ctx, P) => shown(o, ctx, P) });
      sp.x = p.x; sp.y = p.y + (c.yOff || 0) + o.hopY; sp.z = p.z; sp.dist = c.dist; sp.alpha = o.fade < 1 ? o.fade : undefined;
      R.add(sp);
      if (o.type === 'swimmer' && c.lunge > 0) pond(p, c.dist, c.lunge * o.fade);
      // a thing on its way from your raised hand to its hand
      for (const f of o.fly) {
        const k = smoothstep(clamp(f.t / VOID_EGG.pass, 0, 1)), to = handAt(o, f.k), a = o.at[f.k] || o.at[0];
        inAir(f.it, lerp(f.from.x, to.x, k), lerp(f.from.y, to.y, k) + Math.sin(Math.PI * k) * 0.08, lerp(f.from.z, to.z, k), (a[2] || 0) * k, lerp(0.8, a[3] || 1, k));
      }
    }
    // the heap of its robe, where it fell, once it has gone off about the meadow
    const dc = c0();
    if (dc.noHeap && dc.fade > 0.004) {
      const hp = E.heap || (E.heap = { kind: 'sprite', x: Math.sin(L.facing) * E.heapV + Math.cos(L.facing) * E.heapU, y: 0, z: Math.cos(L.facing) * E.heapV - Math.sin(L.facing) * E.heapU, w: 1.6, h: 1, dist: Math.hypot(E.heapU, E.heapV), layer: 1, noContact: true, draw: (ctx, P) => CREATURES.demon.heap(ctx, c0(), P) });
      hp.alpha = dc.fade < 1 ? dc.fade : undefined;
      R.add(hp);
    }
    // what they threw: up, turning, and down onto the ground, where it lies
    for (const th of E.thrown) {
      const u = t - th.t0, it = th.it;
      if (u < 0 || th.fade <= 0.004) continue;
      const fl = Math.min(u, th.tl), x = th.p0.x + th.vx * fl, z = th.p0.z + th.vz * fl, al = th.fade < 1 ? th.fade : undefined;
      if (u < th.tl) inAir(it, x, Math.max(0.02, th.p0.y + th.vy * u - GR * u * u / 2), z, th.rot0 + th.spin * u * (calmed() ? 0.35 : 1), 1, al);
      else R.add({ kind: 'sprite', x, y: 0, z, w: it.w, h: it.h, flat: true, card: true, layer: 1, dist: Math.hypot(x, z), alpha: al, draw: (ctx, P) => { ctx.scale(it.w, it.h); it.icon(ctx, P); } });
    }
  }
  // the light on them: what little there is about you in the dark as each comes up to you, and a faint cold light on them
  // all where they stand, both gone as the pale light comes
  function lights() {
    const k = (1 - s.reveal) * span(E.t, 0.3, 1.6), f = L.facing;
    if (k <= 0.01) return [];
    return [
      { x: Math.sin(f) * 0.6, y: 1.5, z: Math.cos(f) * 0.6, r: 3.4, i: 0.34 * k, color: [196, 200, 226] },
      { x: Math.sin(f) * 5.2, y: 2.6, z: Math.cos(f) * 5.2, r: 7.5, i: 0.3 * k * E.glow, color: [190, 196, 226] },
    ];
  }
  // the view: level, to the north, on the middle of them, and as close as still takes in all of them (closer on a wide
  // view); easing back out as the meadow comes, to be as it will be when the view is yours again
  const watch = () => ({ x: Math.sin(L.facing) * 6, y: L.eyeH + 0.12, z: Math.cos(L.facing) * 6, zoom: lerp(clamp(0.6 * (R.W / R.H) / 0.93, 1, 1.32), 1, E ? span(E.t, VOID_EGG.joy + 2.5, VOID_EGG.wait - 1.2) : 0) });
  // where each of the others stands (for the glitter as they go)
  const places = () => (E ? E.others.map(o => { const p = o.c.pos(); return { x: p.x, z: p.z, h: Math.max(1, o.c.CR.h) }; }) : []);
  return { begin, update, draw, overlay, lights, watch, places };
}

// ---------- the faces of the others ----------
// At the scare (END.scare), with its head thrown back, the face of each thing that came for you before is round it in the
// dark, all at once, big; and then it takes them back into itself (CREATURES.demon.scareAt: where each is, and how much of
// it is there behind it and in front of it). Each is that thing's face as you last saw it on its own night, come up into
// your face in its death lunge: the night is built again as the game builds it (whether or not you played it), the thing
// put a good way in from where it started and brought up into the eye as game.js plays the lunge, and drawn alone (nothing
// of the night round it) from the eye onto a small square canvas of its own (faceShot), its edges let go into the dark.
// One night every little while as it holds its first faces, long before they are wanted. A face that could not be drawn is
// simply not there. With reduced flashing they are dimmer.
const VOID_RECAP = (() => {
  const count = () => LEVELS.length - 1;   // every night before this one
  const AT = 5.4, EVERY = 0.9;   // (one every EVERY seconds from AT: after it has taken hold of you and its face is up, while it holds its faces)
  let faces = [], key = '';
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
    if (k !== key) { key = k; faces = []; }
  }
  // the next of them, when it is time, while there are any left to draw
  function step(t) {
    if (faces.length >= count() || t < AT + faces.length * EVERY) return;
    faces.push(take(faces.length));
  }
  // the face of the thing that came for you on night i (null if it could not be drawn)
  function take(i) {
    const dpr = R.ctx.canvas.width / R.W;
    const cam = G.cam, keep = { L: G.L, attempt: G.attempt, inv: G.inv, active: G.active, hover: G.hover, state: G.state, lanes: Object.assign({}, G.lastLane), lights: LIGHT.list, cam: { yaw: cam.yaw, tYaw: cam.tYaw, pitch: cam.pitch, tPitch: cam.tPitch, dirIdx: cam.dirIdx, zoom: cam.zoom } };
    let L = null;
    const safe = fn => { try { return fn(); } catch (e) { return null; } };
    try {
      G.inv = [];
      L = buildLevel(i);
      const c = L.creature;
      // (as it is drawn in play: its drawing may look at the night being played, the state and its lights)
      G.L = L; G.state = 'play'; cam.zoom = 1;
      c.u = 0.6; c.dist = c.D0 * Math.pow(1 - c.u, c.gamma); c.t = 2.5; c.gait = 0.6;   // (a good way in from where it started)
      LIGHT.set(L.lights.concat((L.dynamicLights && safe(() => L.dynamicLights())) || []));
      return CREATURES.demon.vignette(faceShot(L, c, dpr));
    } catch (e) { return null; } finally {
      G.L = keep.L; G.attempt = keep.attempt; G.inv = keep.inv; G.active = keep.active; G.hover = keep.hover; G.state = keep.state; Object.assign(cam, keep.cam);
      for (const k of Object.keys(G.lastLane)) if (!(k in keep.lanes)) delete G.lastLane[k];
      Object.assign(G.lastLane, keep.lanes);
      LIGHT.set(keep.lights);
      if (L && L.onEnd) safe(() => L.onEnd());
    }
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
  // the faces in the scare (sc: CREATURES.demon.scareAt), round the middle of its face (at, where it is in the view): those
  // behind it as a renderable as far off as anything, drawn just before it (sortDist a little over its own distance), and
  // those going into it as one drawn just after it, each covering the whole view in its own pixels
  function add(sc, at) {
    const y = R.yaw, d = 400;
    for (const [layer, sortDist] of [['back', 1.2], ['front', 0.2]]) {
      if (!sc.faces.some(f => f[layer] > 0.004)) continue;
      R.add({ kind: 'sprite', x: Math.sin(y) * d, y: -d, z: Math.cos(y) * d, w: 4 * d, h: 4 * d, layer: 1, dist: d, sortDist, noContact: true, noLight: true, noFog: true, draw: ctx => draw(ctx, sc, at, layer) });
    }
  }
  function draw(ctx, sc, at, layer) {
    const H = R.H, dpr = ctx.canvas.width / R.W, calm = !!SAVE.data.settings.reducedFlash;
    ctx.save(); ctx.setTransform(dpr * H, 0, 0, dpr * H, dpr * at.x, dpr * (at.y + R.viewY));
    CREATURES.demon.scareDraw(ctx, faces, sc, layer, calm ? 0.55 : 1, R.W / 2 / H);
    ctx.restore();
  }
  return { begin, step, add, take, count, get faces() { return faces; } };
})();
