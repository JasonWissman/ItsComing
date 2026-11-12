// The Farm: the electrical box's switches light the farm's places (HOUSE is sw0, then the ring of places clockwise from
// the tractor shed, sw1..sw7). The thing hides in the dark at one place (G.L.s.k, 0..6); its neighbours are G.L.nb(k).
// Checks first, each from a fresh start, with clicks on the switches as a click does them (useTarget):
//  - lighting its place makes it flinch and run, side on, to a neighbouring place that is dark;
//  - four switches on at once blow the fuse: every light goes dark and every switch drops to off; the box is dead a few
//    seconds, then comes back with everything off;
//  - with the porch light on, lighting both its neighbours and then its place is a fourth switch: the fuse blows, it is
//    not caught;
//  - flipping switches at random gets you killed (several random runs, played out with G.step);
// then the night itself: the house switched off, both its neighbours lit, then its own place, and it comes apart.
const sw = i => "G.L.targets.find(t => t.id === 'sw" + i + "')";
const click = i => 'useTarget(' + sw(i) + ');';
const fresh = [['eval', 'restartLevel();'], ['wait', 300]];
const flush = fresh.concat([
  ['eval', "window.__k0 = G.L.s.k; window.__nb = G.L.nb(G.L.s.k); window.__r0 = G.L.s.r; useTarget(G.L.targets.find(t => t.id === 'sw' + (G.L.s.k + 1)));"],
  ['waitUntil', '!!G.L.s.flinch || !!G.L.s.run', 1500],   // (the next frame)
  ['expect', '!!G.L.s.flinch || !!G.L.s.run', 'its place lit: it flinches from the light'],
  ['waitUntil', '!!G.L.s.run', 2000],
  ['expect', 'G.L.creature.runPose && G.L.s.run.from === window.__k0 && window.__nb.includes(G.L.s.run.to)', 'and runs, side on, toward a neighbouring place'],
  ['waitUntil', '!G.L.s.run && !G.L.s.flinch', 6000],
  ['expect', 'window.__nb.includes(G.L.s.k) && !G.L.s.on[G.L.s.k + 1] && G.L.creature.shade > 0.5 && Math.abs(G.L.s.r - window.__r0) < 2', 'it is at that neighbour now, in the dark, no further from you than it was'],
]);
const fuse = fresh.concat([
  ['eval', 'const k = G.L.s.k, far = [0, 1, 2, 3, 4, 5, 6].filter(q => q !== k && !G.L.nb(k).includes(q)).slice(0, 3); window.__far = far; ' + "far.forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1))));"],
  ['expect', '!G.L.s.power && G.L.s.on.every(o => !o) && G.L.s.blows === 1', 'a fourth switch on: the fuse blows, and every switch drops to off'],
  ['wait', 400],
  ['expect', 'G.L.dynamicLights().length === 0 && G.L.pal.ambient < 0.4', 'every light on the farm is out, the porch light too'],
  ['eval', click(2)],
  ['expect', '!G.L.s.power && !G.L.s.on[2]', 'the dead box: a switch pushed up drops straight back'],
  ['waitUntil', 'G.L.s.power', 7000],
  ['expect', 'G.L.s.power && G.L.s.on.every(o => !o) && G.state === "play"', 'the breaker comes back in, with everything off'],
]);
const houseOn = fresh.concat([
  ['eval', "const k = G.L.s.k; G.L.nb(k).forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1)))); useTarget(G.L.targets.find(t => t.id === 'sw' + (k + 1)));"],
  ['expect', '!G.L.s.power && G.L.s.blows === 1 && !G.L.s.trapped', 'with the porch light on, the trap is a fourth switch: the fuse blows and it is not caught'],
  ['wait', 300], ['expect', '!G.L.won', 'not won'],
]);
// switches flipped at random every half second or so, played out with G.step until it ends: it gets you
const random = seed => fresh.concat([
  ['eval', '(() => { let a = ' + seed + '; const rnd = () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; }; let next = 0.5; ' +
    'for (let i = 0; i < 2400 && G.state === "play"; i++) { G.step(0.05); if (G.L.t >= next) { next = G.L.t + 0.3 + rnd() * 0.6; const id = "sw" + Math.floor(rnd() * 8); useTarget(G.L.targets.find(t => t.id === id)); } } ' +
    'window.__rand = (window.__rand || 0) + (G.state === "dying" || G.state === "dead" ? 1 : 0); })()'],
]);
const randoms = [].concat(...[11, 22, 33, 44, 55].map(random), [['expect', 'window.__rand >= 5', 'flipping switches at random: it got you every time (' + 5 + ' runs)']]);
// the night: the porch light off first, then the places either side of where it is, then its own
const trap = k => { const n = [(k + 6) % 7, (k + 1) % 7]; return [['use', 'sw' + (n[0] + 1)], ['use', 'sw' + (n[1] + 1)], ['expect', 'G.L.s.k === ' + k + ' && !G.L.won', 'both neighbours lit; it stays where it is, in the dark'], ['use', 'sw' + (k + 1)]]; };
const solve = [
  ['use', 'sw0'],
  ['expect', '!G.L.s.on[0]', 'the porch light is off'],
  ['branch', 'G.L.s.k === 0', trap(0)], ['branch', 'G.L.s.k === 1', trap(1)], ['branch', 'G.L.s.k === 2', trap(2)], ['branch', 'G.L.s.k === 3', trap(3)],
  ['branch', 'G.L.s.k === 4', trap(4)], ['branch', 'G.L.s.k === 5', trap(5)], ['branch', 'G.L.s.k === 6', trap(6)],
  ['expect', 'G.L.s.trapped && G.L.won && G.L.s.power', 'its place lit with both neighbours lit: nowhere dark to go'],
  ['waitUntil', 'G.L.creature.fallT > 2.5', 6000],
  ['expect', 'G.L.creature.fallT > 2.5 && G.state === "won"', 'it shrieks and comes apart in the light, before the fade'],
];
module.exports = {
  nightmare: [].concat(flush, fuse, houseOn, randoms, fresh, solve),
};
