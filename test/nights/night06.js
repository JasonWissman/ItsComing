// The Boathouse: both ways must be shut. The winch is chained and padlocked, and the key is in the tackle box; the handle
// will not go on while the padlock is there. Unlock it, fit the handle and crank the water door down, then shut the side
// door and bar it with both oars (one alone is not enough: it knocks it out of the brackets, and the night says so). The player first
// tries the winch with nothing in hand (the hand rattles the padlock on its chain), then the handle (it goes on the boss,
// the chain snaps taut, the padlock jumps, and it comes back to the hand), then an oar (it does not fit; its end jams at
// the boss and it drops to the deck, where it lies to be picked up again), before
// opening the tackle box. The open box, clicked again, is gone through by hand. The key goes into the padlock and stays
// there once it is open. While the harness stands and watches one of those play out (the hand at the padlock, the handle
// coming back, the oar falling and being picked up again, the box gone through, the key going in, an oar knocked back by
// the side door's leaf), the thing is held where
// it is, so the race against it is the one the solution always ran: the tries cost no more than they did as a line of text.
const oar = "G.L.items.find(i => i.id === 'oar')";
// The lamp on the far shore, seen out through the water door: one light, a small soft glow (a radial gradient that fades
// to nothing, filled as a disc under 2 m across), not a flat square. Drawn here onto a canvas that only notes what is
// asked of it.
const farGlows = (n, near, far) => `(() => {
  const ps = G.L.props.filter(p => p.kind === 'sprite' && p.noFog && p.noLight && p.layer !== 0 && Math.hypot(p.x, p.z) > ${near} && Math.hypot(p.x, p.z) < ${far});   // (not the stars: they are in the sky's own layer)
  return ps.length === ${n} && ps.every(p => {
    const did = [], stops = [], ctx = { createRadialGradient() { did.push('grad'); return { addColorStop(o, c) { stops.push([o, c]); } }; }, beginPath() {}, arc() { did.push('arc'); }, fill() { did.push('fill'); }, fillRect() { did.push('rect'); }, rect() { did.push('rect'); }, scale() {}, save() {}, restore() {} };
    p.draw(ctx, { t: 0, raw: c => rgba(c), col: c => rgba(c) }, 4);
    const a = stops.map(q => +q[1].slice(q[1].lastIndexOf(',') + 1, -1));
    return did.join() === 'grad,arc,fill' && stops.length >= 3 && stops[0][0] === 0 && stops[stops.length - 1][0] === 1 && a[a.length - 1] === 0 && a[0] > 0.2 && a[0] < 0.9 && a.every((v, i) => !i || v < a[i - 1]) && p.w < 8;
  });
})()`;
// The upturned rowboat is painted, red and white: its bottom (uppermost: the two faces things lie on) white, and red on it
// in the sheer strake of the side and the bow and in the keel; some of the paint worn through to the wood
const boatPaint = `(() => {
  const ps = G.L.props.filter(p => p.kind === 'poly' && p.pts.every(v => v[0] > -2.36 && v[0] < -1.34 && v[2] > -1.96 && v[2] < 1.56 && v[1] < 0.6));
  const red = ps.filter(p => p.color[0] > 80 && p.color[0] > 2 * p.color[1]), white = ps.filter(p => Math.min(...p.color) > 95 && p.color[0] - p.color[2] < 40);
  const top = ps.filter(p => p.pts.every(v => Math.abs(v[1] - 0.45) < 1e-6) && p.sortDist > 2.366), worn = ps.filter(p => p.alpha < 1 && p.color[0] > p.color[2] + 20 && p.color[0] < 130);
  return red.length >= 5 && white.length >= 6 && top.length === 2 && top.every(p => Math.min(...p.color) > 150) && worn.length >= 6;
})()`;
const scenery = [
  ['expect', farGlows(1, 50, 400), 'the lamp on the far shore is one small soft glow, fading to nothing, not a square'],
  ['expect', boatPaint, 'the upturned rowboat is painted: a white bottom, a red sheer strake and keel, worn in places'],
];
const pause = ['eval', '(c => { window.__held6 = c.hold; if (c.hold === null) c.hold = c.dist; })(G.L.creature)'];
const resume = ['eval', '(c => { if (window.__held6 === null) c.hold = null; })(G.L.creature)'];
// The water the swimmer bursts up out of in its death lunge (CREATURES.swimmer.burst), drawn at three moments after the
// lunge began onto a canvas of its own: each is unlike the one before (it is not a still shape: the drops fly on their
// arcs, the heap of white rises and falls, the foam spreads)
const splashMoves = `(() => {
  const CR = CREATURES.swimmer, cv = document.createElement('canvas'), x = cv.getContext('2d'), P = { col: k => rgba(k), cola: (k, a) => rgba(k, a) };
  cv.width = cv.height = 200;
  const frame = s => { x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#000'; x.fillRect(0, 0, 200, 200); x.setTransform(60, 0, 0, -60, 100, 100);
    CR.burst(x, P, -1.5, s, 1.5, false); CR.burst(x, P, -1.5, s, 1.5, true); return x.getImageData(0, 0, 200, 200).data; };
  const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 24) n++; return n; };
  const a = frame(0.2), b = frame(0.25), c = frame(0.45);
  return diff(a, b) > 150 && diff(b, c) > 150;
})()`;
// one oar across the shut side door does not hold it: it throws itself at the door, and at the second blow the oar is
// knocked out of its brackets, whole, and the door bursts open. The oar jumps up out of the cradles and into the room,
// turning over as it goes, comes down on the deck (never through it) with a clatter, and lies there flat, inside the
// room and clear of the wall, while the thing is in the doorway; then it comes in, and the death screen says why. (Set
// up directly, then the night starts again. s.oarPose(tau) is where the oar is tau seconds after the blow: its middle
// and the way its length runs.)
const oarFalls = `(() => {
  const s = G.L.s, f = s.fell, P = s.oarPose, ends = t => { const p = P(t); return [-1, 1].map(k => p.c.map((v, i) => v + k * p.u[i] * 1.275)); };
  let low = 9, turned = 0;
  for (let t = 0; t <= 3; t += 1 / 60) { low = Math.min(low, ...ends(t).map(e => e[1])); turned = Math.max(turned, Math.abs(P(t).u[1])); }
  const up = P(0.15), rest = ends(3);
  return f.T1 > 0.3 && f.T1 < 0.8 && up.c[1] > 1.12 && up.c[0] < 2.2 && turned > 0.3 && low > 0.02 &&
    rest.every(e => Math.abs(e[1] - 0.03) < 0.005 && e[0] > 0.2 && e[0] < 2.3 && Math.abs(e[2]) < 2.2) && Math.hypot(...P(3).c.map((v, i) => v - P(2.5).c[i])) < 1e-3;
})()`;
const oneOar = [
  ['eval', `(() => { const s = G.L.s, c = G.L.creature, ln = G.L.lanes[1];
    Object.assign(s, { doorOpen: false, doorClosing: 0, doorClosed: true, doorA: 0, oars: 1 });
    c.retarget(1); c.switched = true; G.L.laneIdx = 1; G.L.lane = ln; G.L.barrierDist = ln.barrierDist;
    c.u = 1 - Math.pow(4 / c.D0, 1 / c.gamma); c.hold = null; c.mode = 'up'; c.modeT = 0; c.upFor = 99;
    window.__sfxN6 = []; if (!window.__sfxO6) { window.__sfxO6 = AUDIO.sfx; AUDIO.sfx = (n, ...r) => { window.__sfxN6.push(n); return window.__sfxO6(n, ...r); }; } })()`],
  ['waitUntil', '!!G.L.s.fell', 6000], ['expect', 'G.L.s.oars === 0 && G.L.s.doorOpen && !G.L.s.sealedE && G.L.creature.hold !== null', 'with one oar across, it knocks the oar out of its brackets and the door bursts open; it is in the doorway'],
  ['expect', oarFalls, 'the oar comes out whole: up out of the cradles and into the room, turning over, down onto the deck and never through it, to lie flat inside the door'],
  ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 8000],
  ['expect', "(f => f.down && G.L.t - f.t > f.T1 + 0.3 && window.__sfxN6.includes('clatter') && !window.__sfxN6.includes('crack'))(G.L.s.fell)", 'it clattered down on the deck and lay there before the thing came in (no crack: it did not break)'],
  ['eval', 'AUDIO.sfx = window.__sfxO6; window.__sfxO6 = null;'],
  ['waitUntil', "G.state === 'dead' || G.L.creature.lunge > 0.5", 3000],
  ['expect', 'G.L.creature.burstT !== undefined && G.L.creature.burstY > 1', 'its death lunge stamps when it began to come up out of the water, and how high it comes'],
  ['expect', splashMoves, 'the water it bursts up out of moves: the spray rises and falls and the foam spreads, frame to frame'],
  ['expect', "G.deathCause === 'oneoar' && deathLine(G.L).includes(\"One oar wasn't strong enough.\")", 'and the death screen says one oar was not strong enough'],
  ['eval', 'restartLevel();'], ['wait', 1500], ['expect', "G.state === 'play' && !G.L.s.fell && G.L.s.oars === 0", 'the night starts again'],
];
// The night's easter egg: throw it the life ring. The ring hangs on the west wall, flat on the boards, and can be taken.
// Carried, it changes nothing: there is nothing to throw it at while the thing is under the water, or while the water
// door's slats are down across the line to it. With it in hand and the thing up in plain sight out on the water, pointing
// at the thing says so and a click throws it: it leaves the inventory for good, the egg is kept in the save at once, and
// the thing goes under that moment. The ring flies (under a second), lands on the water where the thing will come up, and
// floats there, bobbing. The thing comes up through it and from then on never goes under: it comes on steadily, and
// arrives about when its usual round of going under and coming up would have brought it (that round played out here
// forty times over from the same place, with the sounds off). Caught, the screen says "It got you" and the one line, with
// nothing put in front of it (a line is toasted a moment before, as a click on the winch would). Then again: thrown, and
// both ways shut after it has come up in the ring: the night is won as it always is. (Stepped by hand, a sixtieth of a
// second at a time, so it takes no longer than it must.)
const C6 = 'G.L.creature', ringItem = 'G.L.items.find(i => i.id === "lifering")';
const RING_LINE = "It really didn't need saving, but that was nice of you.";
const onWater = `c.retarget(0); c.switched = true; c.reached = false; G.L.laneIdx = 0; G.L.lane = G.L.lanes[0]; G.L.barrierDist = G.L.lanes[0].barrierDist; c.hold = null;`;   // on the water door's way, its early change of way already made
const surfaced = d => ['eval', `(c => { ${onWater} c.u = 1 - Math.min(${d}, c.D0 * 0.9) / c.D0; c.mode = 'up'; c.modeT = 0; c.upFor = 99; })(${C6})`];
const pointAtIt = ['eval', `(() => { const h = R.hits.find(h => h.kind === 'creature'); if (h) UI.canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: h.x + h.w / 2, clientY: h.y + h.h / 2, bubbles: true })); })()`];
const ringSaved = '(SAVE.data.eggs.boathouse === true && JSON.parse(localStorage.getItem("itscoming.v2")).eggs.boathouse === true)';
// from the click to the end, by hand: what the ring and the thing did, kept in window.__ring
const ringRun = `(() => {
  const L = G.L, c = L.creature, s = L.s, r = s.ring, CR = CREATURES.swimmer, o = window.__ring = { ys: [], steps: [] }, dt = 1 / 60;
  let n = 0;
  while (r.phase === 'fly' && n++ < 120) { update(dt); o.peak = Math.max(o.peak || -9, r.y); }
  o.flew = L.t - r.t; o.landedDown = c.mode === 'down' && CR.hidden(c) && !c.ringOn;
  o.outside = r.d >= c.lane.barrierDist + 0.5 && r.d < c.diveDist;
  for (let i = 0; i < 30 && r.phase === 'float'; i++) { update(dt); o.ys.push(r.y); }
  n = 0; while (!c.ringOn && n++ < 400) update(dt);
  update(dt);
  o.upAfter = L.t - r.t; o.through = c.ringOn && c.mode === 'up' && r.phase === 'on' && Math.abs(c.dist - r.d) < 0.15; o.upAt = c.dist;
  // its usual round from here, forty times over: how long it would have taken to reach you
  const sfx = AUDIO.sfx, cap = CAPTIONS.sfx, D = u => c.D0 * Math.pow(1 - u, c.gamma), u0 = c.u; let sum = 0;
  AUDIO.sfx = () => {}; CAPTIONS.sfx = () => {};
  try {
    for (let k = 0; k < 40; k++) {
      const f = { rand: mulberry32(900 + k), yaw: c.yaw, dist: c.dist, t: 0 }; let u = u0, t = 0;
      CR.init(f); f.modeT = 0; f.upFor = 2.6 + f.rand() * 0.9;
      while (D(u) > c.catchDist && t < 300) { const m = CR.speedMult(f, dt, f.mode === 'up'); u += dt * m * (f.mode === 'up' ? c.seenMult : c.unseenMult) / c.T; f.dist = D(u); t += dt; }
      sum += t;
    }
  } finally { AUDIO.sfx = sfx; CAPTIONS.sfx = cap; }
  o.usual = sum / 40;
  // and in the ring: watched all the way in
  const t0 = L.t; let prev = c.dist, toasted = false;
  o.under = 0; o.back = 0; o.jump = 0; o.stalls = 0;
  while (G.state === 'play' && L.t - t0 < 300) {
    if (!toasted && c.dist < c.catchDist + 0.25) { toasted = true; G.toast('The winch. Its handle is gone.'); }
    update(dt);
    if (c.mode === 'down' || CR.hidden(c)) o.under++;
    const step = prev - c.dist; prev = c.dist;
    if (step < -1e-9) o.back++;
    o.jump = Math.max(o.jump, step);
    if (L.t - t0 > CR.RING_LOOK + 0.1 && G.state === 'play') { o.steps.push(step); if (step <= 0) o.stalls++; }
  }
  o.took = L.t - t0; o.seen = c.seen; o.toasted = toasted; o.state = G.state;
  // (its pace is one pace, a little quicker only while it is out of your sight, as ever)
  o.even = o.steps.every((v, i) => !i || Math.abs(v - o.steps[i - 1]) < o.steps[i - 1] * 0.15) && Math.max(...o.steps) < Math.min(...o.steps) * 1.3;
})()`;
const ringEgg = [
  ['eval', `delete SAVE.data.eggs.boathouse; SAVE.persist(); ${C6}.switched = true;`],
  ['expect', "G.L.text.egg === 'Throw it the life ring.' && G.L.text.death.ring === " + JSON.stringify(RING_LINE) + " && !(G.L.text.eggs || []).includes('ring')", 'the night names its easter egg, and being caught after it is not a "Nice try"'],
  ['face', 6], ['wait', 200],
  ['expect', `(it => it && !it.taken && it.onWall && it.name === 'Life ring' && it.y > 1.5 && G.L.rend.get(it).face !== undefined && R.hits.some(h => h.kind === 'item' && h.ref === it && h.poly))(${ringItem})`, 'the life ring hangs on the west wall, flat on the boards, and can be pointed at'],
  ['pickup', 'lifering'],
  ['expect', `G.inv[G.active].id === 'lifering' && !${ringItem}.onWall && !G.L.s.ring`, 'the life ring can be picked up'],
  ['eval', `(c => { ${onWater} c.u = 1 - 30 / c.D0; c.mode = 'down'; c.modeT = 0; c.downFor = 99; })(${C6})`], ['face', 0], ['wait', 200],
  ['expect', '!activeUse(G.L) && !R.hits.some(h => h.kind === "creature")', 'while it is under the water there is nothing to throw the ring at'],
  surfaced(60), ['wait', 250],
  ['expect', `(w => { const up = !!activeUse(G.L); w.count = 7; const down = !activeUse(G.L); w.count = 0; return up && down; })(G.L.targets.find(t => t.id === 'winch'))`, 'up in plain sight it can be thrown; with the water door\'s slats down across the line to it, it cannot'],
  pointAtIt, ['wait', 150],
  ['expect', 'G.hover && G.hover.kind === "creature" && UI.tooltip.textContent === "Throw it the life ring."', 'pointing at it with the ring in hand: "Throw it the life ring."'],
  ['shoot'],
  ['expect', `!G.hasItem('lifering') && ${ringItem}.taken && !activeUse(G.L)`, 'a click on it throws the ring: it has left the inventory, for good'],
  ['expect', ringSaved, 'the easter egg is found, and kept in the save, the moment it is thrown'],
  ['expect', `(c => c.mode === 'down' && c.ringPend && CREATURES.swimmer.hidden(c) && G.L.s.ring.phase === 'fly')(${C6})`, 'and it goes under at once, the ring in the air'],
  ['eval', ringRun],
  ['expect', '(o => o.flew > 0.75 && o.flew < 1.05 && o.peak > G.L.lanes[0].y + 0.5 && o.landedDown && o.outside)(window.__ring)', 'the ring flies for under a second, on an arc, and lands out on the water short of where it went under, while it is still under'],
  ['expect', '(o => o.ys.length === 30 && Math.max(...o.ys) - Math.min(...o.ys) > 0.005 && o.ys.every(y => Math.abs(y - G.L.lanes[0].y) < 0.15))(window.__ring)', 'the ring floats on the water where it landed, bobbing'],
  ['expect', '(o => o.through && o.upAfter > 1.9 && o.upAfter < 4.3)(window.__ring)', 'its next surfacing is through the ring, where the ring floats'],
  ['expect', '(o => o.under === 0 && o.back === 0 && o.stalls === 0 && o.jump < 0.08 && o.even)(window.__ring)', 'from then on it never goes under: it comes on steadily, its distance falling smoothly, every frame'],
  ['expect', '(o => o.seen !== undefined && o.usual > 8 && Math.abs(o.took - o.usual) < o.usual * 0.1)(window.__ring)', 'and it reaches you about when its usual going under and coming up would have brought it'],
  ['expect', "window.__ring.toasted && (G.state === 'dying' || G.state === 'dead') && G.deathCause === 'ring'", 'caught after the throw: the cause is the ring'],
  ['waitUntil', "G.state === 'dead'", 8000],
  ['expect', "G.deathScreen.title === 'It got you' && G.deathScreen.text === " + JSON.stringify(RING_LINE) + " && deathLine(G.L) === " + JSON.stringify(RING_LINE), 'the death screen: "It got you", and exactly the one line, with no line toasted a moment before put in front of it'],
  ['expect', "UI.overlay.querySelector('h1').textContent === 'It got you' && UI.overlay.querySelector('p.intro').textContent === " + JSON.stringify(RING_LINE), 'as shown: the heading "It got you", and the line'],
  ['eval', 'restartLevel();'], ['wait', 1500],
  ['expect', `G.state === 'play' && !G.L.s.ring && !${C6}.ringOn && ${ringItem}.onWall && !${ringItem}.taken`, 'the night starts again, the ring back on the wall'],
  // thrown again, and the night won after it: it is a win like any other
  ['face', 6], ['pickup', 'lifering'], ['face', 0], surfaced(40), ['wait', 250], ['shoot'],
  ['eval', `(c => { let n = 0; while (!c.ringOn && n++ < 600) update(1 / 60); for (let i = 0; i < 90; i++) update(1 / 60); })(${C6})`],
  ['expect', `${C6}.ringOn && G.state === 'play' && ${C6}.dist > 6`, 'thrown again: it is up in the ring and coming on'],
  // its hands go round far faster than it bobs: a paw goes in (the paddle sound) about eight times a second, where its
  // bob (c.padGait) comes round under three times; with reduced motion they keep to the bob
  ['eval', `(c => { const CR = CREATURES.swimmer, sfx = AUDIO.sfx, cap = CAPTIONS.sfx, o = window.__pad6 = { n: 0, calm: 0, k: CR.paddle() }; CAPTIONS.sfx = () => {};
    const run = () => { let n = 0; AUDIO.sfx = name => { if (name === 'paddle') n++; }; const g0 = c.padGait; for (let i = 0; i < 120; i++) update(1 / 60); return [n, (c.padGait - g0) / Math.PI]; };
    try { [o.n, o.bobs] = run(); SAVE.data.settings.reducedMotion = true; o.calmK = CR.paddle(); [o.calm, o.calmBobs] = run(); } finally { SAVE.data.settings.reducedMotion = false; AUDIO.sfx = sfx; CAPTIONS.sfx = cap; } })(${C6})`],
  ['expect', '(o => o.k >= 2.5 && o.k <= 3 && Math.abs(o.n - o.bobs * o.k) <= 1.5 && o.n > 2.2 * o.bobs && o.n >= 9)(window.__pad6)', 'paddling, its hands go round two and a half to three times as fast as it bobs: a blur of paws'],
  ['expect', '(o => o.calmK === 1 && Math.abs(o.calm - o.calmBobs) <= 1.5)(window.__pad6)', 'with reduced motion its hands keep to the pace of its bob'],
  ['eval', `(() => { const s = G.L.s, w = G.L.targets.find(t => t.id === 'winch'); w.count = 7; w.done = true; Object.assign(s, { locked: false, handleIn: true, sealedN: true, doorOpen: false, doorClosing: 0, doorClosed: true, doorA: 0, oars: 2, sealedE: true }); })()`],
  ['waitUntil', 'G.L.won', 3000], ['waitUntil', "G.state === 'survived'", 14000],
  ['expect', "G.state === 'survived' && G.L.won && G.L.text.win.startsWith('It threw itself at the door')", 'with both ways shut after the throw the night is won, as it always is'],
  ['eval', 'restartLevel();'], ['wait', 1500], ['expect', "G.state === 'play' && !G.L.s.ring && !G.L.won", 'and the night starts again, with no ring thrown'],
];
// It never swims in over the boards. The water ends at each doorway's sill (L.waterEdge: 2.6 m off at the water door,
// 2.4 m at the side door) and it comes no nearer than its stopping place outside it (L.stopDist), where all of it as it
// is drawn (its rings on the water, the life ring round it, its paws) is still over water from where you stand: its death
// lunge begins from there. On each way, in the ring and without it: brought in from 6 m and stepped by hand until it has
// you, it was never nearer than that while the night was still being played, and the lunge began from there.
const edgeRun = (lane, ring) => [
  ['eval', `(() => { const L = G.L, c = L.creature, s = L.s, ln = L.lanes[${lane}], o = window.__edge = { min: 99 };
    c.retarget(${lane}); c.switched = true; c.reached = false; L.laneIdx = ${lane}; L.lane = ln; L.barrierDist = ln.barrierDist; c.hold = null;
    c.u = 1 - 6 / c.D0; c.mode = 'up'; c.modeT = 0; c.upFor = 2;
    if (${ring}) { c.ringOn = true; c.ringT = c.t - 5; c.padGait = 0; s.ring = { phase: 'on', lane: ${lane}, d: 6 }; }
    let n = 0;
    while (G.state === 'play' && n++ < 6000) { update(1 / 60); if (G.state === 'play') { o.min = Math.min(o.min, c.dist); if (CREATURES.swimmer.hidden(c)) o.under = true; } }
    o.state = G.state; o.from = c.lungeFrom; o.edge = L.waterEdge[${lane}]; o.stop = L.stopDist[${lane}]; o.cause = G.deathCause; o.lane = c.lane.idx;
    o.rim = o.min - CREATURES.swimmer.RING_R - CREATURES.swimmer.RING_TUBE; })()`],
  ['expect', `(o => o.state === 'dying' && o.lane === ${lane} && o.edge === ${lane ? 2.4 : 2.6} && o.stop >= o.edge + 0.8 && o.min >= o.stop - 0.06 && o.from >= o.stop - 0.06 && o.from <= o.stop + 0.001 && o.rim > o.edge + 0.3 && ${ring ? "!o.under && o.cause === 'ring'" : "o.cause !== 'ring'"})(window.__edge)`,
    'at the ' + (lane ? 'side door' : 'water door') + (ring ? ', in the life ring' : ', with no ring') + ': it comes no nearer than its stopping place outside the water\'s edge, and lunges from there'],
  ['eval', 'restartLevel();'], ['wait', 1500], ['expect', "G.state === 'play' && !G.L.s.ring", 'the night starts again'],
];
const waterEdge = [].concat(edgeRun(0, false), edgeRun(0, true), edgeRun(1, false), edgeRun(1, true));
const winch = [
  pause, ['use', 'winch'], ['expect', 'G.L.s.locked && G.hand.reach && G.hand.reach.target.id === "winch" && G.hand.reach.style === "rattle"', 'with nothing in hand the hand goes to the padlock and rattles it'],
  ['waitUntil', 'G.L.s.rattleT > 0 && !G.hand.reach', 3000], resume,
  ['pickup', 'handle'], ['use', 'winch'], ['expect', 'G.L.s.locked && !G.L.s.handleIn', 'the handle will not go on a padlocked winch'],
  ['expect', 'G.fumbling && G.fumbling.target.id === "winch" && G.fumbling.preset === "return" && !G.fumbling.drop', 'the handle is tried on the boss'],
  pause, ['waitUntil', '!G.fumbling', 3000],
  ['expect', 'G.L.s.joltT > 0 && G.inv[G.active].id === "handle"', 'the chain snapped taut against it, and the handle came back to the hand'], resume,
  ['pickup', 'oar'], ['expect', 'G.inv[G.active].id === "oar"', 'the oar is in hand'], ['use', 'winch'],
  ['expect', 'G.L.s.locked && !G.L.s.handleIn && G.lastToast.msg === "It does not fit the winch."', 'the oar does not fit the winch'],
  ['expect', 'G.fumbling && G.fumbling.preset === "bump" && G.fumbling.drop && !G.hasItem("oar")', 'it jams at the boss and leaves the hands'],
  pause, ['waitUntil', '!G.fumbling && !' + oar + '.taken', 4000],
  ['expect', '(o => o.y === G.L.floor.y && o.flat)(' + oar + ')', 'it dropped to the deck and lies there'],
  ['pickup', 'oar'], ['expect', 'G.hasItem("oar")', 'it can be picked up again from where it fell'], resume,
  ['use', 'tacklebox'], ['expect', 'G.L.targets.find(t => t.id === "tacklebox").open', 'the tackle box is open'],
  ['expect', '(t => t.w > 1 && t.h > 0.5)(G.L.targets.find(t => t.id === "tacklebox"))', 'what you can click on the open box takes in its lid and trays'],
  ['pickup', 'winchkey'], pause, ['use', 'tacklebox'], ['expect', 'G.hand.reach && G.hand.reach.target.id === "tacklebox" && G.hand.reach.style === "rattle"', 'the open box, clicked again, is gone through by hand'], resume,
  ['use', 'winch'], ['expect', '!G.L.s.locked', 'padlock off'],
  ['expect', '!G.hasItem("winchkey") && G.inv[G.active].id === "handle"', 'the key stays in the padlock, and the handle is in hand'],
  pause, ['waitUntil', '!G.L.s.keyGoing', 3000], resume,
  ['use', 'winch'], ['expect', 'G.L.s.handleIn', 'handle fitted'], ['clickUntil', 'winch', 'G.L.s.sealedN', 250, 12]];
// The side door's parts on screen, facing east: its own (the largest), and the brackets either side of it that take the
// oars, the north one to the left and the south one to the right. part(which) points the mouse at one, as a player would,
// and part(which, true) clicks it there.
const parts = 'R.hits.filter(h => h.kind === "target" && h.ref.id === "sidedoor")';
const part = (which, click) => ['eval', `(() => {
  const hs = ${parts}, door = hs.reduce((a, b) => (b.w * b.h > a.w * a.h ? b : a)), br = hs.filter(h => h !== door).sort((a, b) => a.x - b.x);
  const h = ${JSON.stringify(which)} === 'door' ? door : br[${JSON.stringify(which)} === 'north' ? 0 : 1];
  const at = { clientX: h.x + h.w / 2, clientY: h.y + h.h / 2, bubbles: true };
  UI.canvas.dispatchEvent(new MouseEvent('mousemove', at));
  if (${!!click}) UI.canvas.dispatchEvent(new MouseEvent('click', at));
})()`];
const showsDoor = 'G.hover && G.hover.ref.id === "sidedoor" && UI.tooltip.textContent === "Side door"';
// The brackets are part of the door: pointing at either shows the side door, and clicking either does what clicking the
// door does. The door is shut by its leaf (the hand reaches out and pulls it to), and an oar put up while it is still
// swinging shut is knocked back into your hands by the leaf; once it is shut, an oar goes across from a bracket (the
// north one on odd seeds, the south one on even), which is not yet enough, and the other on top of it from the other one.
const door = [['pickup', 'oar2'], ['face', 2], ['expect', parts + '.length === 3', 'facing the side door, the door and both its brackets can be pointed at'],
  part('north'), ['wait', 150], ['expect', showsDoor, 'pointing at the north bracket shows the side door'],
  part('south'), ['wait', 150], ['expect', showsDoor, 'pointing at the south bracket shows the side door'],
  part('door', true), ['expect', '!G.L.s.doorOpen && G.hand.reach && G.hand.reach.style === "pull"', 'clicking the door shuts it: the hand pulls it to'],
  pause, part('door', true), ['expect', '!G.L.s.doorClosed && !G.L.s.sealedE && G.fumbling && G.fumbling.target.id === "sidedoor" && !G.fumbling.drop', 'the oar put up while it swings shut is not across'],
  part('door', true), ['expect', '(fx => fx && fx.target.id === "sidedoor" && (fx.hitDone > 0 || G.L.s.leafSlow))(G.fumbling)', 'clicked again while the oar is on its way: no second one, and the leaf is still slowed for it'],
  ['waitUntil', '!G.fumbling && G.L.s.doorClosed', 4000],
  ['expect', 'G.inv[G.active].id === "oar2" && !G.L.s.sealedE', 'the leaf knocked it back into your hands, and the door is shut'], resume,
  ['branch', 'G.runSeed % 2 === 1',
    [part('north', true), ['expect', 'G.L.s.oars === 1 && !G.L.s.sealedE && !G.hasItem("oar2")', 'clicking the north bracket puts one oar across, and that is not yet enough'],
      ['wait', 300], part('south', true)],
    [part('south', true), ['expect', 'G.L.s.oars === 1 && !G.L.s.sealedE && !G.hasItem("oar2")', 'clicking the south bracket puts one oar across, and that is not yet enough'],
      ['wait', 300], part('north', true)]],
  ['expect', 'G.L.s.oars === 2 && G.L.s.sealedE && !G.hasItem("oar")', 'the other oar goes across on top of it from the other bracket: barred']];
// the rain falls outside only: seen through the water door and the open side door, never indoors, nor through the side
// door's leaf swung out over the water; with both ways shut there is none in view at all
const sh = 'G.L.weatherShelter()';
const hides = (x, y, z) => '(p => ' + sh + '.hides(p[0], p[1], p[2]))(G.L.pt(' + x + ', ' + y + ', ' + z + '))';
const rain = [
  ['expect', "WEATHER.kind === 'rain' && " + sh + '.openings.length === 2', 'the rain is seen through the two openings, the water door and the side door'],
  ['expect', [hides(0, 1.5, 0), hides(-2, 0.5, -2), hides(1.5, 2.8, 2.4), '!' + hides(0, 1.5, 6), '!' + hides(4.5, 1.5, 0), '!' + hides(-4, 1, 5)].join(' && '), 'none of it falls indoors; out over the water it does'],
  ['expect', hides(5, 1, -0.7) + ' && !' + hides(5, 1, 0.5), 'out past the side door, the rain behind its open leaf is hidden by it, the rain beside it is not'],
];
const shutIn = [['wait', 300], ['expect', 'G.L.s.sealedN && G.L.s.sealedE && ' + sh + '.openings.length === 0', 'with both ways shut, no rain is in view']];
// Every place the winch handle can start rests on something drawn there to bear it: at each spot, jittered as far as it
// may be either way, there is a level face of the room (the deck, the workbench, the shelf, the rowboat's bottom) at its
// height under it. Nothing hangs on the walls, where no nail or hook is drawn. And the handle this time lies at one of them.
const onSurface = `(() => {
  const L = G.L, flats = L.props.filter(p => p.kind === 'poly' && p.pts.length >= 3 && !p.detail && p.pts.every(v => Math.abs(v[1] - p.pts[0][1]) < 1e-4));
  const inside = (x, z, pts) => { let c = false; for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) { const A = pts[a], B = pts[b]; if ((A[2] > z) !== (B[2] > z) && x < (B[0] - A[0]) * (z - A[2]) / (B[2] - A[2]) + A[0]) c = !c; } return c; };
  const under = (x, y, z) => flats.some(p => Math.abs(p.pts[0][1] - y) < 0.03 && inside(x, z, p.pts));
  const bad = L.handleSpots.filter(sp => { const j = sp.jitter !== undefined ? sp.jitter : sp.flat === false ? 0 : 0.12;
    return [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, 0]].some(([a, b]) => { const w = L.pt(sp.x + a * j, sp.y, sp.z + b * j); return !under(w[0], w[1], w[2]); }); });
  const h = L.items.find(i => i.id === 'handle');
  return L.handleSpots.length >= 4 && !bad.length && L.handleSpots.some(sp => Math.abs(sp.y - h.y) < 1e-6) && under(h.x, h.y, h.z);
})()`;
const handleSpots = [['expect', onSurface, 'every place the winch handle can start rests on a surface drawn there (deck, bench, shelf, boat), and it lies on one']];
module.exports = {
  nightmare: scenery.concat(handleSpots, rain, ringEgg, oneOar, waterEdge, winch, door, shutIn),
};
