// The Diner: it is drawn to the light. Lit, it crosses the lot several times as fast as it walks in the dark: too fast for
// the crank to bring three shutters down. The solution plays it three times. First, lit from the start, with the crank in
// hand at once and a turn the moment the crank is free: it is through the glass before the third shutter is down, and it
// has you at once. Then a look at the run: its window shut as it reaches the glass, it runs along the glass to one still
// open, side on, its heels ringing, and turns back to the glass, keeping its width as it turns (it is drawn at every step
// of the turn and measured). Then a shutter only part way down when it gets there: it takes hold of the bottom edge,
// shoves it up into its housing (the crank's turns lost, a crash, the view shaking) and comes through the glass. Then the
// soda fountain's easter egg, three ways (below, at soda). Last, at a player's pace: it
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
// how wide it is drawn across its body (the belt to the chest, 0.95 to 1.3 m up, under its collar and hat), turned a given way round (0 face on, 1 side on):
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
    for (let r = 30; r < 100; r++) for (let q = 0; q < 300; q++) if (d[(r * 300 + q) * 4 + 3] > 128) { lo = Math.min(lo, q); hi = Math.max(hi, q); }
    return hi - lo;
  };
  const ws = []; for (let k = 0; k <= 20; k++) ws.push(width(k / 20));
  keep.forEach(([k, v]) => { c[k] = v; });
  return ws;
})()`;
// ---- the soda (an easter egg) ----
// The fountain behind you and the counter's top are nothing to point at (no pointer, no line, not even in what the view
// can hit) until the cup from the shelf is in hand, and the counter not until it is full. Then the whole of it: the cup
// filled at the fountain and set on the counter, and it comes through the glass with the lights still on, goes to the
// counter, drinks it (three gulps), sets the cup down empty and pounds the counter, one fist and then both, faster and
// faster; refilled and set down it drinks again; a third time the fountain sputters, EMPTY, and it has you. Then the same
// but never refilled: it pounds until it has had enough, and has you. Either way the death screen says one thing. And
// with the main thrown, the cup on the counter is nothing to it: it comes through the glass as it always did.
const target = id => `G.L.targets.find(t => t.id === '${id}')`;
const cupIt = 'G.L.items.find(i => i.id === "cup")';
// the view put on a point of a target (the fountain's middle; the counter's top straight ahead), and the pointer on it
const pointAt = id => `(() => { const L = G.L, p = '${id}' === 'counter' ? (q => ({ x: q[0], y: q[1], z: q[2] }))(L.pt(0, 1.0, 1.1)) : (t => ({ x: t.x, y: t.y + t.h / 2, z: t.z }))(${target(id)});
  lookAtPoint(p); G.cam.yaw = G.cam.tYaw; G.cam.pitch = G.cam.tPitch; window.__pt = p; })()`;
const hovered = id => `(() => { const t = ${target(id)}, q = R.screenPos(__pt.x, __pt.y, __pt.z); G.mouse.x = q.x; G.mouse.y = q.y + R.viewY; updateHover();
  const r = { hit: R.hits.some(h => h.ref === t), on: !!G.hover && G.hover.ref === t, cursor: UI.canvas.style.cursor, tip: UI.tooltip.textContent }; G.mouse.x = G.mouse.y = -1; updateHover(); return r; })()`;
const notThere = (id, why) => [['eval', pointAt(id)], ['wait', 200], ['eval', 'window.__h = ' + hovered(id)],
  ['expect', `${target(id)}.hidden && !__h.hit && !__h.on && __h.cursor !== 'pointer' && !__h.tip`, why]];
const there = (id, why) => [['eval', pointAt(id)], ['wait', 200], ['eval', 'window.__h = ' + hovered(id)],
  ['expect', `!${target(id)}.hidden && __h.hit && __h.on && __h.cursor === 'pointer' && !!__h.tip`, why]];
// counts the soda's sounds as they are played
const listen = 'window.__snd = {}; window.__sfx0 = AUDIO.sfx; AUDIO.sfx = (n, p, q) => { __snd[n] = (__snd[n] || 0) + 1; return __sfx0(n, p, q); }';
const unlisten = 'AUDIO.sfx = __sfx0';
// a full cup on the counter, straight ahead, at once (the cup taken and filled by the script, not looked for)
const quickCup = [
  ['eval', `(() => { G.mouse.x = -1; pickup(${cupIt}); useTarget(${target('fountain')}); })()`], ['wait', 650],
  ['eval', `(() => { G.cam.yaw = G.cam.tYaw = G.L.facing; G.cam.pitch = G.cam.tPitch = 0.3; useTarget(${target('counter')}); })()`], ['wait', 400],
  ['expect', `G.L.s.cupOn && ${cupIt}.full && !${cupIt}.taken && !G.hasItem('cup')`, 'a full cup on the counter'],
];
// it at the glass in a moment, the lights still on
const toGlass = ['eval', '(() => { const c = G.L.creature, s = G.L.s; c.u = 1 - (s.glassD[c.lane.idx] + 1.0) / c.D0; })()'];
const insatiable = [
  ['eval', 'G.deathCause = null; G.deathScreen = null'],
  ['waitUntil', 'G.state === "dying"', 9000],
  ['expect', 'G.deathCause === "soda" && G.L.creature.lunge >= 0', 'it has you'],
  ['waitUntil', 'G.state === "dead"', 8000],
  ['expect', 'G.deathScreen && G.deathScreen.text === "It is insatiable."', 'the death screen: "It is insatiable."'],
];
const soda = [
  ...notThere('fountain', 'without the cup the fountain is nothing to point at: no pointer, no line, nothing the view can hit'),
  ...notThere('counter', 'nor the counter'),
  ['pickup', 'cup'],
  ['expect', `G.inv.length === 1 && G.inv[0] === ${cupIt} && !${cupIt}.full && G.inv[0].icon === ICONS.paperCup`, 'the empty paper cup in hand'],
  ...there('fountain', 'with the cup in hand the fountain can be pointed at'),
  ...notThere('counter', 'the counter still cannot, with the cup empty'),
  ['eval', listen],
  ['use', 'fountain'],
  ['waitUntil', `${cupIt}.full`, 2000],
  ['expect', `__snd.sodaPour === 1 && G.L.s.fills === 1 && G.inv[G.active] === ${cupIt} && ${cupIt}.icon === ICONS.paperCupFull`, 'the fountain pours: the cup is full in hand, and shows it'],
  ['use', 'fountain'], ['expect', '/full/.test(G.lastToast.msg) && G.L.s.fills === 1', 'full already: it is not filled again'], ['waitUntil', '!G.fumbling', 3000],
  ...there('counter', 'with the cup full the counter can be pointed at'),
  ['use', 'counter'],
  ['waitUntil', 'G.L.s.cupOn', 2000],
  ['expect', `!G.hasItem('cup') && !${cupIt}.taken && ${cupIt}.full && __snd.cupDown === 1 && ${target('counter')}.hidden && ${target('fountain')}.hidden`, 'set down on the counter, full; the fountain and the counter are nothing again'],
  // it comes through the glass, the lights still on: to the counter, and the soda
  toGlass,
  ['waitUntil', 'G.L.s.through && G.L.s.soda', 4000],
  ['expect', 'G.state === "play" && G.L.s.power && G.L.creature.catchDist < 1', 'through the glass with the lights on and a soda on the counter: it does not come for you'],
  ['waitUntil', 'G.L.s.soda.ph === "lift"', 5000],
  ['expect', `G.L.creature.dist < 2 && G.L.creature.soda.hold && ${cupIt}.taken && !G.L.s.cupOn`, 'at the counter across from it, it takes the cup up'],
  ['waitUntil', 'G.L.s.soda.ph === "bang"', 5000],
  ['expect', `__snd.gulp === 3 && !${cupIt}.full && G.L.s.cupOn && !${cupIt}.taken && G.L.s.soda.drinks === 1 && /another/.test(G.lastToast.msg)`, 'it drinks it off, three gulps, sets the cup down empty, and wants another'],
  ['waitUntil', '__snd.counterPound >= 2', 3000],
  ['expect', 'G.L.s.soda.anger > 0 && G.L.s.soda.bang > 0.9', 'and pounds the counter'],
  // refilled and set down again: it drinks that too
  ['pickup', 'cup'], ['use', 'fountain'], ['waitUntil', `${cupIt}.full`, 2000], ['use', 'counter'],
  ['waitUntil', 'G.L.s.soda.drinks === 2 && G.L.s.soda.ph === "bang"', 9000],
  ['expect', `__snd.gulp === 6 && __snd.sodaPour === 2 && G.state === 'play' && !${cupIt}.full`, 'refilled in time: it drinks again, and pounds again'],
  // the third time: the fountain sputters, empty, and it has you
  ['pickup', 'cup'], ['use', 'fountain'],
  ['expect', `G.L.s.dryAt !== undefined && !${cupIt}.full && __snd.sodaSputter === 1 && G.lastToast.msg === 'It is empty.' && /empty/i.test(${target('fountain')}.name) && G.L.s.soda.ph === 'fury'`, 'a third time the fountain sputters: it is empty, and it is furious'],
  ...insatiable,
  ['eval', unlisten],
  ['eval', 'restartLevel()'], ['wait', 300],
  // not refilled: it pounds, one fist and slowly, then both and faster and faster, and then it has you
  ...quickCup, ['eval', listen], toGlass,
  ['waitUntil', 'G.L.s.soda && G.L.s.soda.ph === "bang"', 9000],
  ['eval', 'window.__b0 = { t: G.L.t, n: __snd.counterPound || 0 }'], ['wait', 3000],
  ['eval', 'window.__b1 = { t: G.L.t, n: __snd.counterPound || 0 }'], ['waitUntil', 'G.L.s.soda.anger > 0.75', 9000], ['wait', 1500],
  ['expect', '(() => { const early = (__b1.n - __b0.n) / (__b1.t - __b0.t), late = (__snd.counterPound - __b1.n) / (G.L.t - __b1.t); return early > 0.5 && late > 1.6 * early && G.state === "play"; })()', 'it pounds faster and faster as it waits'],
  ['expect', 'G.L.s.soda.anger > 0.9 && Math.abs(G.L.s.soda.jerk) >= 0 && G.L.s.soda.fist[0] >= 0', 'angrier and angrier'],
  ...insatiable,
  ['eval', unlisten],
  ['eval', 'restartLevel()'], ['wait', 300],
  // the main thrown: the soda on the counter is nothing to it
  ...quickCup,
  ['eval', `(() => { useTarget(${target('main')}); })()`], ['waitUntil', '!G.L.s.power && !G.hand.reach', 3000], toGlass,
  ['waitUntil', 'G.state === "dying"', 9000],
  ['expect', 'G.deathCause === "through" && !G.L.s.soda && G.L.s.cupOn', 'in the dark it comes through the glass for you as it always did, the soda left standing'],
  ['eval', 'restartLevel()'], ['wait', 300],
];
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
  ['waitUntil', 'G.L.s.shove && G.L.creature.shove && G.L.creature.shove.k === 1', 8000],
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
].concat(soda, refusals, [
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
