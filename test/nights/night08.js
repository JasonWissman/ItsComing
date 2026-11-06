// The Diner: it is drawn to the light. Lit, it crosses the lot several times as fast as it walks in the dark: too fast for
// the crank to bring three shutters down. The solution plays it three times. First, lit from the start, with the crank in
// hand at once and a turn the moment the crank is free: it is through the glass before the third shutter is down, and it
// has you at once. Then a look at the slide: its window shut as it reaches the glass, it slides along the glass to one
// still open. Last, at a player's pace: it watches for a few seconds, tries the shutter by hand (it will not come down),
// turns round and throws the power main about nine seconds in, takes a few seconds to find the crank in the dark, faces
// the windows and cranks at a click every quarter of a second, the one it is coming for first, then wherever it goes; the
// third wins, with metres to spare.
const onTarget = mk => ['branch', 'G.L.s.target === 0', mk(0), [['branch', 'G.L.s.target === 1', mk(1), mk(2)]]];
const crank = k => [['clickUntil', 'shutter' + k, 'G.L.s.down[' + k + ']', 70, 60]];   // with the click's own pauses, about four clicks a second
const went = n => [
  ['expect', 'G.L.s.slides === ' + n + ' && !G.L.s.down[G.L.s.target] && G.L.creature.lane.idx === G.L.s.target', 'its window shut: it goes for a window still open (' + n + ')'],
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
  // the slide along the glass: power off, crank in hand, its window one turn from down as it reaches the glass
  ['eval', `(() => { const L = G.L, s = L.s, c = L.creature, it = L.items.find(i => i.id === 'crank');
    useTarget(L.targets.find(t => t.id === 'main')); it.taken = true; G.inv.push(it);
    const k = s.target, ln = L.lanes[k]; L.targets.find(t => t.id === 'shutter' + k).count = s.turns - 1;
    c.u = 1 - (ln.barrierDist + 0.6) / c.D0; window.__k = k; window.__y = c.yaw; })()`],
  ['wait', 200],
  ['eval', 'G.L.s.lastTurn = -9; useTarget(G.L.targets.find(t => t.id === "shutter" + __k))'],
  ['expect', 'G.L.s.down[__k] && G.L.s.slide && G.L.s.slide.atGlass && G.L.s.target !== __k', 'its window shut at the glass: it slides along it'],
  ['waitUntil', '!G.L.s.slide', 3000],
  ['expect', 'Math.abs(wrapPi(G.L.creature.yaw - __y)) > 25 * DEG && G.L.creature.dist > G.L.creature.lane.barrierDist && !G.L.s.through && G.L.creature.lane.idx === G.L.s.target', 'it slid sideways along the glass to the window it is making for, and is still outside it'],
  ['eval', 'restartLevel()'], ['wait', 300],
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
];
module.exports = { nightmare };
