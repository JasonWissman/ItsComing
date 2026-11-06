// The Diner: it is drawn to the light. Lit, it crosses the lot several times as fast as it walks in the dark: too fast for
// the crank to bring three shutters down. A player watches it come for a moment, tries the shutter of its window by hand
// (it will not come down), turns round and throws the power main, finds the crank in the dark, faces the windows and cranks
// the one it is coming for first. Each time its window shuts it slides along the glass to one still open; the third wins.
const onTarget = mk => ['branch', 'G.L.s.target === 0', mk(0), [['branch', 'G.L.s.target === 1', mk(1), mk(2)]]];
const crank = k => [['clickUntil', 'shutter' + k, 'G.L.s.down[' + k + ']', 300, 14]];
const slid = n => [
  ['waitUntil', '!G.L.s.slide', 3000],
  ['expect', 'G.L.s.slides === ' + n + ' && !G.L.s.down[G.L.s.target] && G.L.creature.lane.idx === G.L.s.target', 'its window shut: it went to a window still open (' + n + ')'],
  ['expect', 'Math.abs(wrapPi(G.L.creature.yaw - __y)) > 25 * DEG && G.L.creature.dist > G.L.creature.lane.barrierDist', 'it slid sideways along the glass, and is still outside it'],
];
const nightmare = [
  // lit: how fast it comes
  ['eval', 'window.__a = { d: G.L.creature.dist, t: G.L.t }'], ['wait', 600],
  ['eval', 'window.__vLit = (__a.d - G.L.creature.dist) / (G.L.t - __a.t)'],
  ['expect', 'G.L.s.power && __vLit > 0', 'the lights are on and it is coming'],
  ['expect', '(() => { const c = G.L.creature, s = G.L.s; return (1 - s.glassD[c.lane.idx] / c.D0) * c.T / c.drawnMult < (3 * s.turns - 1) * s.turn; })()', 'lit, it would be through the glass before the crank could bring three shutters down'],
  // the shutter will not come down by hand
  onTarget(k => [['use', 'shutter' + k]]),
  ['expect', 'G.L.s.byHand && !G.L.targets.some(t => t.crank && t.count)', 'the shutter will not come down by hand'],
  // the power main, on the back wall
  ['use', 'main'],
  ['expect', '!G.L.s.power && !G.L.creature.drawn', 'the main is off: every light in the diner is out'],
  ['pickup', 'crank'],
  // dark: how fast it comes now
  ['eval', 'window.__b = { d: G.L.creature.dist, t: G.L.t }'], ['wait', 800],
  ['expect', '(() => { const v = (__b.d - G.L.creature.dist) / (G.L.t - __b.t); return v > 0 && v * 3 < __vLit; })()', 'with the lights on it came more than three times as fast as it does in the dark'],
  // the windows: the one it is coming for first, then wherever it goes
  ['face', 4],
  ['eval', 'window.__y = G.L.creature.yaw'], onTarget(crank), ...slid(1),
  ['eval', 'window.__y = G.L.creature.yaw'], onTarget(crank), ...slid(2),
  onTarget(crank),
  ['expect', 'G.L.s.down.every(Boolean) && G.L.won', 'all three shutters down: it is held at the glass'],
];
module.exports = { nightmare };
