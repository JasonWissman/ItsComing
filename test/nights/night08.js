// The Diner: it is drawn to the light. Lit, it crosses the lot several times as fast as it walks in the dark: too fast for
// the crank to bring three shutters down. The solution plays it three times. First, lit from the start, with the crank in
// hand at once and a turn the moment the crank is free: it is through the glass before the third shutter is down, and it
// has you at once. Then a look at the run: its window shut as it reaches the glass, it runs along the glass to one still
// open, side on, its heels ringing, and turns back to the glass, keeping its width as it turns (it is drawn at every step
// of the turn and measured). Then a shutter only part way down when it gets there: it takes hold of the bottom edge,
// shoves it up into its housing (the crank's turns lost, a crash, the view shaking) and comes through the glass. Last, at a
// player's pace: it
// watches for a few seconds, tries the shutter by hand (it will not come down), turns round and throws the power main
// about nine seconds in, takes a few seconds to find the crank in the dark, faces the windows and cranks at a click every
// quarter of a second, the one it is coming for first, then wherever it goes (it runs across the lot for it); the third
// wins, with metres to spare, and it beats on that shutter, hard and fast, until it all fades.
const onTarget = mk => ['branch', 'G.L.s.target === 0', mk(0), [['branch', 'G.L.s.target === 1', mk(1), mk(2)]]];
const crank = k => [['clickUntil', 'shutter' + k, 'G.L.s.down[' + k + ']', 70, 60]];   // with the click's own pauses, about four clicks a second
const went = n => [
  ['expect', 'G.L.s.slides === ' + n + ' && !G.L.s.down[G.L.s.target] && G.L.creature.lane.idx === G.L.s.target', 'its window shut: it goes for a window still open (' + n + ')'],
  ['expect', 'G.L.s.slide && G.L.creature.runPose && G.L.creature.runDir === G.L.s.slide.dir && G.L.s.slide.dir === Math.sign(wrapPi(G.L.lanes[G.L.s.slide.to].yaw - G.L.creature.yaw))', 'it runs for it, side on, facing the way it is going'],
  ['expect', 'G.L.creature.dist > G.L.s.glassD[G.L.s.target] && !G.L.s.through', 'it is still outside the glass'],
];
// lit from the start: the crank in hand, its window first, then wherever it goes, every turn as soon as the crank is free.
// Stepped by hand (update only), 10 ms at a time, so no turn is late.
const litRun = `(() => {
  const L = G.L, s = L.s, it = L.items.find(i => i.id === 'crank');
  it.taken = true; G.inv.push(it); G.active = G.inv.length - 1;
  for (let k = 0; k < 4000 && G.state === 'play'; k++) {
    if (L.t - s.lastTurn >= s.turn) { const t = L.targets.find(t => t.id === 'shutter' + s.target && !t.done) || L.targets.find(t => t.crank && !t.done); if (t) useTarget(t); }
    update(0.01);
  }
  return { state: G.state, cause: G.deathCause, down: s.down.filter(Boolean).length, t: +L.t.toFixed(2) };
})()`;
// what does not work, shown where it was tried: lit, with no crank, the shutter of its window (the hand goes to the gearbox,
// tries to turn it and it will not move); the main thrown (it is off at once, but the lever, the clunk and the lights wait for
// the hand, which takes the grip and comes down with it); the main again (the hand tries the lever and it stays down); a
// shutter that is down, with the crank (it goes to the gearbox's eye, knocks and comes back to the hand) and with nothing in
// hand (the hand knocks on the glass)
const onK = mk => ['branch', '__k === 0', mk(0), [['branch', '__k === 1', mk(1), mk(2)]]];
const refusals = [
  onTarget(k => [['use', 'shutter' + k]]),
  ['expect', 'G.L.s.byHand && G.hand.reach && G.hand.reach.style === "rattle" && !G.L.targets.some(t => t.crank && t.count)', 'no crank: the hand goes to the gearbox and tries it, and the shutter does not come down'],
  ['eval', 'window.__tc = G.L.t'], ['use', 'main'],
  ['expect', '!G.L.s.power && !G.L.creature.drawn && G.hand.reach && G.hand.reach.target.id === "main" && G.hand.reach.style === "pull"', 'the main thrown: off at once, and the hand goes up to the lever'],
  ['waitUntil', 'G.L.s.levered && G.L.s.lever === 0 && !G.hand.reach', 3000],
  ['expect', 'G.L.s.offAt > __tc + 0.1 && G.L.pal.ambient < 0.5', 'the lever and the lights waited for the hand, and went with it'],
  ['use', 'main'], ['expect', 'G.hand.reach && G.hand.reach.style === "rattle" && !G.L.s.power', 'thrown already: the hand tries the lever'],
  ['waitUntil', 'G.L.s.jigAt > __tc && !G.hand.reach && G.L.s.lever === 0', 3000],
  ['pickup', 'crank'],
  ['eval', `(() => { const L = G.L, s = L.s, k = [0, 1, 2].find(i => i !== s.target), t = L.targets.find(t => t.id === 'shutter' + k);
    t.count = s.turns - 1; s.lastTurn = -9; useTarget(t); window.__k = k; })()`],
  ['expect', 'G.L.s.down[__k]', 'a shutter down'],
  onK(k => [['use', 'shutter' + k]]),
  ['expect', 'G.lastToast.msg === "That shutter is down." && G.fumbling && G.fumbling.preset === "return" && G.fumbling.it.id === "crank"', 'the crank at a shutter that is down: it goes to the gearbox'],
  ['waitUntil', '!G.fumbling', 3000],
  ['expect', 'G.inv[G.active] && G.inv[G.active].id === "crank"', 'and comes back to the hand'],
  ['eval', 'dropActive()'], ['expect', '!G.hasItem("crank")', 'the crank put down'],
  onK(k => [['use', 'shutter' + k]]),
  ['expect', 'G.hand.reach && G.hand.reach.style === "knock" && !G.fumbling', 'nothing in hand at a shutter that is down: the hand knocks on the glass'],
  ['eval', 'restartLevel()'], ['wait', 300],
];
// how wide it is drawn across its body (belly to chest, under its hair), turned a given way round (0 face on, 1 side on):
// drawn on a canvas of its own, plain, and the opaque pixels measured. A turn that squeezes it edge on, as a flat card turns, comes to almost
// nothing half way round; a solid figure keeps most of its width all the way round.
const turnWidths = `(() => {
  const c = G.L.creature, CR = c.CR, cv = document.createElement('canvas'); cv.width = 300; cv.height = 300;
  const x = cv.getContext('2d'), P = { fog: 0, fogColor: [0, 0, 0], t: 0, lit: 0, col: k => rgba(k), cola: (k, a) => rgba(k, a), raw: k => rgba(k) };
  const keep = ['runPose', 'runTurn', 'runDir', 'runAmt', 'runGait', 'dist', 't'].map(k => [k, c[k]]);
  const width = turn => {
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 300, 300); x.setTransform(200, 0, 0, -200, 150, 290);
    Object.assign(c, { runPose: turn > 0, runTurn: turn, runDir: 1, runAmt: 0.6, runGait: 1, dist: 9, t: 2.5 }); CR.draw(x, c, P);   // its head upright
    const d = x.getImageData(0, 0, 300, 300).data; let lo = 300, hi = -1;
    for (let r = 140; r < 190; r++) for (let q = 0; q < 300; q++) if (d[(r * 300 + q) * 4 + 3] > 128) { lo = Math.min(lo, q); hi = Math.max(hi, q); }
    return hi - lo;
  };
  const ws = []; for (let k = 0; k <= 20; k++) ws.push(width(k / 20));
  keep.forEach(([k, v]) => { c[k] = v; });
  return ws;
})()`;
const nightmare = [
  // lit: how fast it comes
  ['eval', 'window.__a = { d: G.L.creature.dist, t: G.L.t }'], ['wait', 600],
  ['eval', 'window.__vLit = (__a.d - G.L.creature.dist) / (G.L.t - __a.t)'],
  ['expect', 'G.L.s.power && __vLit > 0', 'the lights are on and it is coming'],
  ['expect', '(() => { const c = G.L.creature, s = G.L.s; return (1 - s.glassD[c.lane.idx] / c.D0) * c.T / c.drawnMult < (3 * s.turns - 1) * s.turn; })()', 'lit, it would be through the glass before the crank could bring three shutters down'],
  // cranking with the lights on cannot win, however quick the hand
  ['eval', 'window.__lit = ' + litRun],
  ['expect', '__lit.state === "dying" && __lit.cause === "lit" && __lit.down < 3 && G.L.s.through', 'cranked with the lights on from the start: it came through the glass first'],
  ['eval', 'restartLevel()'], ['wait', 300],
  // the run along the glass: power off, crank in hand, its window one turn from down as it reaches the glass
  ['eval', `(() => { const L = G.L, s = L.s, c = L.creature, it = L.items.find(i => i.id === 'crank');
    useTarget(L.targets.find(t => t.id === 'main')); it.taken = true; G.inv.push(it);
    const k = s.target, ln = L.lanes[k]; L.targets.find(t => t.id === 'shutter' + k).count = s.turns - 1;
    c.u = 1 - (ln.barrierDist + 0.6) / c.D0; window.__k = k; window.__y = c.yaw; })()`],
  ['wait', 200],
  ['eval', 'window.__run = 0; window.__step = AUDIO.footstep; AUDIO.footstep = (k, v, p) => { if (k === "shoesRun") __run++; return __step(k, v, p); }'],
  ['eval', 'G.L.s.lastTurn = -9; useTarget(G.L.targets.find(t => t.id === "shutter" + __k))'],
  ['expect', 'G.L.s.down[__k] && G.L.s.slide && G.L.s.slide.atGlass && G.L.s.target !== __k', 'its window shut at the glass: it goes along it'],
  ['expect', 'G.L.creature.runPose && G.L.s.slide.dir === Math.sign(wrapPi(G.L.lanes[G.L.s.slide.to].yaw - G.L.lanes[G.L.s.slide.from].yaw))', 'it turns side on to run, the way the window it is going for is'],
  ['waitUntil', 'G.L.s.slide && G.L.creature.runTurn === 1 && G.L.creature.runAmt > 0.8 && G.L.creature.runDir === G.L.s.slide.dir', 2000],   // flat out, side on
  ['waitUntil', '!G.L.s.slide', 3000],
  ['eval', 'AUDIO.footstep = __step'],
  ['expect', 'Math.abs(wrapPi(G.L.creature.yaw - __y)) > 25 * DEG && G.L.creature.dist > G.L.creature.lane.barrierDist && !G.L.s.through && G.L.creature.lane.idx === G.L.s.target', 'it ran sideways along the glass to the window it is making for, and is still outside it'],
  ['expect', '__run >= 2 && !G.L.creature.runPose', 'its heels rang as it ran, and it has turned back to face the glass'],
  ['eval', 'window.__w = ' + turnWidths],
  ['expect', '__w[0] > 40 && __w[20] > 30 && Math.min(...__w) >= 0.9 * Math.min(__w[0], __w[20])', 'it turns as a solid thing turns: never squeezed thin on the way round, no narrower than it is side on'],
  ['eval', 'restartLevel()'], ['wait', 300],
  // a shutter part way down (four turns of ten) at its window as it comes up: it takes hold of the bottom edge of it (the
  // crank will not turn against it), shoves it up into its housing with a crash that shakes the view, every turn lost, and
  // comes through the glass
  ['eval', `(() => { const L = G.L, s = L.s, c = L.creature, it = L.items.find(i => i.id === 'crank');
    useTarget(L.targets.find(t => t.id === 'main')); it.taken = true; G.inv.push(it);
    const k = s.target, ln = L.lanes[k]; L.targets.find(t => t.id === 'shutter' + k).count = 4;
    c.u = 1 - (ln.barrierDist + 0.8) / c.D0; window.__k = k;
    window.__slam = 0; window.__sfx = AUDIO.sfx; AUDIO.sfx = (n, p, q) => { if (n === 'shutterSlam') __slam++; return __sfx(n, p, q); };
    window.__shakes = 0; window.__shake = G.shake; G.shake = a => { if (a >= 0.5) __shakes++; __shake(a); }; })()`],
  ['waitUntil', 'G.L.s.shove && G.L.creature.shove && G.L.creature.shove.k === 1', 5000],
  ['expect', '(() => { const s = G.L.s, c = G.L.creature; return !s.down[__k] && s.shown[__k] > 0.25 && !s.through && c.dist > s.glassD[__k] && Math.abs(c.shove.h + c.yOff - s.shove.edge) < 0.02; })()', 'at the shutter, part way down: its hands on the bottom edge of it, outside the glass'],
  ['eval', 'window.__n = G.L.targets.find(t => t.id === "shutter" + __k).count; G.L.s.lastTurn = -9; useTarget(G.L.targets.find(t => t.id === "shutter" + __k))'],
  ['expect', 'G.L.targets.find(t => t.id === "shutter" + __k).count === __n && /hold/.test(G.lastToast.msg)', 'the crank will not turn against it'],
  ['waitUntil', '__slam > 0', 3000],
  ['expect', '(() => { const s = G.L.s; return G.L.targets.find(t => t.id === "shutter" + __k).count === 0 && s.shown[__k] < 0.05 && !s.down[__k] && !s.through && __shakes >= 1; })()', 'it shoved the shutter up: it slammed into its housing, the view shook, and every turn of the crank on it is lost'],
  ['waitUntil', 'G.state === "dying"', 3000],
  ['expect', 'G.L.s.through && G.L.s.throughWin === __k && G.deathCause === "through"', 'then it broke the glass and came in'],
  ['eval', 'AUDIO.sfx = __sfx; G.shake = __shake'],
  ['eval', 'restartLevel()'], ['wait', 300],
  // its own window shut last: it never ran tonight, and shut out it comes up to the glass at a run, a heel to a stride (not
  // a clatter at every frame), and beats on it. The save is left alone: the win that counts comes at a player's pace.
  ['eval', `(() => { const L = G.L, s = L.s, c = L.creature, it = L.items.find(i => i.id === 'crank');
    window.__save = [SAVE.recordWin, SAVE.unlock]; SAVE.recordWin = SAVE.unlock = () => {};
    useTarget(L.targets.find(t => t.id === 'main')); it.taken = true; G.inv.push(it);
    const k = s.target; c.u = 1 - (L.lanes[k].barrierDist + 3) / c.D0;
    window.__run = 0; AUDIO.footstep = (kk, v, p) => { if (kk === 'shoesRun') __run++; return __step(kk, v, p); };
    [0, 1, 2].filter(i => i !== k).concat([k]).forEach(i => { const t = L.targets.find(t => t.id === 'shutter' + i); t.count = s.turns - 1; s.lastTurn = -9; useTarget(t); }); })()`],
  ['expect', 'G.L.won && G.L.s.slides === 0', 'its own window shut last: it never ran, and the night is won'],
  ['waitUntil', 'G.L.s.blows >= 3', 4000],
  ['expect', '__run >= 1 && __run <= 12', 'it ran up to the glass, a heel to a stride'],
  ['eval', 'AUDIO.footstep = __step; SAVE.recordWin = __save[0]; SAVE.unlock = __save[1]'],
  ['eval', 'restartLevel()'], ['wait', 300],
].concat(refusals, [
  // at a player's pace: watch it come, try the shutter of its window by hand
  ['waitUntil', 'G.L.t >= 5', 8000],
  onTarget(k => [['use', 'shutter' + k]]),
  ['expect', 'G.L.s.byHand && !G.L.targets.some(t => t.crank && t.count)', 'the shutter will not come down by hand'],
  // turn round and look for the power main on the back wall: it is thrown about nine seconds in
  ['waitUntil', 'G.L.t >= 8', 8000],
  ['use', 'main'],
  ['expect', '!G.L.s.power && !G.L.creature.drawn', 'the main is off: every light in the diner is out'],
  // a few seconds to find the crank in the dark
  ['eval', 'window.__b = { d: G.L.creature.dist, t: G.L.t }'], ['wait', 2500],
  ['expect', '(() => { const v = (__b.d - G.L.creature.dist) / (G.L.t - __b.t); return v > 0 && v * 3 < __vLit; })()', 'with the lights on it came more than three times as fast as it does in the dark'],
  ['pickup', 'crank'],
  // the windows: the one it is coming for first, then wherever it goes
  ['face', 4],
  onTarget(crank), ...went(1),
  onTarget(crank), ...went(2),
  onTarget(crank),
  ['expect', 'G.L.s.down.every(Boolean) && G.L.won', 'all three shutters down: it is held at the glass'],
  ['expect', '(() => { const c = G.L.creature, s = G.L.s; return c.D0 * (1 - c.u) - s.glassD[s.target] > 1; })()', 'with more than a metre to spare'],
  // it cannot get in, and it shows it: it comes to the last shutter and beats on it, hard and fast, before the fade
  ['eval', 'window.__bangs = 0; window.__sfx = AUDIO.sfx; AUDIO.sfx = (n, p, q) => { if (n === "shutterBang") __bangs++; return __sfx(n, p, q); }; window.__shakes = 0; window.__shake = G.shake; G.shake = a => { if (a >= 0.25) __shakes++; __shake(a); }'],
  ['waitUntil', 'G.L.s.blows >= 5', 7000],
  ['expect', 'G.state === "won" && G.fadeTarget < 1 && G.L.creature.dist <= G.L.barrierDist + 0.01 && G.L.s.hit && G.L.s.hit.i === G.L.s.target && G.L.s.dent[G.L.s.target] > 0', 'it beats on the shutter it came to, the steel bowing in, before the fade'],
  ['expect', '__bangs >= 4 && __shakes >= 4', 'loud blows, each one shaking the view'],
  ['expect', 'G.L.pal.ambient < 0.45', 'and nothing gets light while it does'],
  ['eval', 'AUDIO.sfx = __sfx; G.shake = __shake'],
]);
module.exports = { nightmare };
