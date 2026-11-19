// The Farm: the electrical box's switches light the farm's places (HOUSE is sw0, then the ring of places clockwise from
// the tractor shed, sw1..sw7). The thing hides in the dark at one place (G.L.s.k, 0..6); its neighbours are G.L.nb(k).
// Checks first, each from a fresh start, with clicks on the switches as a click does them (useTarget):
//  - lighting its place makes it flinch and run, side on, to a neighbouring place that is dark;
//  - four switches on at once trip the main: it goes over to off, every light goes dark and every switch drops to off;
//    with the main off a switch can still be set, up or down, and nothing comes on; the main pushed back on, with
//    everything else still off, and then the switches work again;
//  - with the porch light on, lighting both its neighbours and then its place is a fourth switch: the main trips, it is
//    not caught;
//  - with the main off it comes at its own pace, no faster;
//  - flipping switches at random gets you killed (several random runs, played out with G.step);
//  - switches set with the main off come on when it goes on: more than three trip it straight back off (four, and
//    seven: all but one); all eight, the porch light too, and the box bursts and the farm goes up: every place, the
//    house, the box and the thing catch fire, it runs about burning in the open where you are looking, then turns on
//    you and charges, and the card reads the fire's own line;
//  - the clever win: the main off, its place and both its neighbours set, the main pushed on: it is caught at once;
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
const main = "G.L.targets.find(t => t.id === 'main')";
const trip = fresh.concat([
  ['expect', 'G.L.s.power && ' + main + ' && ' + main + '.face !== undefined && G.L.targets.filter(t => /^sw/.test(t.id)).every(t => t.face === ' + main + '.face)', 'the main breaker and the switches, fixed flat on the front of the box'],
  // the box is at your left, short of the stables and square in the middle of the view as you face them, its front to
  // you: turned to face the stables and looking down, the main and every switch are in view; zoom held on it closes in
  // only as far as keeps the whole box in view (clear of the compass at the top)
  ['face', 7, true],
  ['expect', '(() => { const m = ' + main + ', a = Math.atan2(m.x, m.z) / DEG, d = Math.hypot(m.x, m.z), front = -(Math.sin(m.face) * m.x + Math.cos(m.face) * m.z); ' +
    "const hs = R.hits.filter(h => h.kind === 'target' && (h.ref.id === 'main' || /^sw/.test(h.ref.id)) && h.poly); " +
    'return Math.abs(a + 45) < 2 && d < 1.3 && front > 0.9 * d && hs.length === 9 && hs.every(h => h.x >= 0 && h.x + h.w <= R.W && h.y >= R.viewY && h.y + h.h <= R.viewY + R.H); })()', 'the box at your left, square before you as you face the stables, its front to you; facing the stables and looking down, the main and every switch are in view'],
  ['eval', 'G.cam.zoomHeld = true'], ['wait', 1200],
  ['expect', '(() => { const z = G.L.boxZoom(); const hs = R.hits.filter(h => h.kind === "target" && (h.ref.id === "main" || /^sw/.test(h.ref.id))); ' +
    'return z > 1.3 && z < 2.6 && Math.abs(G.cam.zoom - z) < 0.03 && hs.length === 9 && hs.every(h => h.x >= 0 && h.x + h.w <= R.W && h.y >= R.viewY + 80 && h.y + h.h <= R.viewY + R.H); })()', 'zoomed on the box, it closes in only as far as keeps all of it in view'],
  ['face', 7, false],
  ['wait', 1200],
  ['expect', 'G.L.boxZoom() === null && G.cam.zoom > 2.5', 'looking ahead at the stables over it, the zoom is the usual one'],
  ['eval', 'G.cam.zoomHeld = false'], ['wait', 600],
  ['face', 0, false],   // (back to the barn and looking ahead, as the night starts, for what follows)
  ['eval', 'const k = G.L.s.k, far = [0, 1, 2, 3, 4, 5, 6].filter(q => q !== k && !G.L.nb(k).includes(q)).slice(0, 3); window.__far = far; ' + "far.forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1))));"],
  ['expect', '!G.L.s.power && G.L.s.on.every(o => !o) && G.L.s.trips === 1', 'a fourth switch on: the main trips, and every switch drops to off'],
  ['wait', 400],
  ['expect', 'G.L.dynamicLights().length === 0 && G.L.pal.ambient < 0.4', 'every light on the farm is out, the porch light too'],
  ['eval', 'window.__r1 = G.L.s.r; window.__t1 = G.L.t;'],
  ['eval', click(2) + click(0)],
  ['expect', '!G.L.s.power && G.L.s.on[2] && G.L.s.on[0] && G.L.s.on.filter(Boolean).length === 2 && G.lastToast.msg.includes("main is off")', 'with the main off a switch can still be set, and you are told the main is off'],
  ['wait', 300],
  ['expect', '!G.L.s.power && G.L.dynamicLights().length === 0 && G.L.s.pool < 0.05 && !G.L.s.litAt.some(t => t > window.__t1)', 'and nothing comes on: no light anywhere on the farm, the porch light too'],
  ['eval', click(2) + click(0)],
  ['expect', '!G.L.s.power && G.L.s.on.every(o => !o)', 'set off again, with the main still off'],
  ['wait', 1500],
  ['expect', '!G.L.s.power && G.state === "play" && (window.__r1 - G.L.s.r) / (G.L.t - window.__t1) < 0.62 * 1.15 + 0.05', 'with the main off it stays off, and it comes at its own pace, no faster'],
  ['use', 'main'],
  ['expect', 'G.L.s.power && G.L.s.on.every(o => !o) && G.L.dynamicLights().length === 0', 'the main pushed back on: on, with everything else still off'],
  ['eval', click(0)],
  ['expect', 'G.L.s.power && G.L.s.on[0] && G.L.dynamicLights().length > 0', 'and now a switch works again (the porch light back on)'],
  ['use', 'main'],
  ['expect', 'G.L.s.power && G.L.s.on[0] && G.L.s.trips === 1', 'the main pushed while it is on: it stays on, and nothing changes'],
]);
const houseOn = fresh.concat([
  ['eval', "const k = G.L.s.k; G.L.nb(k).forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1)))); useTarget(G.L.targets.find(t => t.id === 'sw' + (k + 1)));"],
  ['expect', '!G.L.s.power && G.L.s.trips === 1 && !G.L.s.trapped', 'with the porch light on, the trap is a fourth switch: the main trips and it is not caught'],
  ['wait', 300], ['expect', '!G.L.won', 'not won'],
]);
// switches (and the main) flipped at random every half second or so, played out with G.step until it ends: it gets you
const random = seed => fresh.concat([
  ['eval', '(() => { let a = ' + seed + '; const rnd = () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; }; let next = 0.5; ' +
    'for (let i = 0; i < 2400 && G.state === "play"; i++) { G.step(0.05); if (G.L.t >= next) { next = G.L.t + 0.3 + rnd() * 0.6; const q = Math.floor(rnd() * 9), id = q < 8 ? "sw" + q : "main"; useTarget(G.L.targets.find(t => t.id === id)); } } ' +
    'window.__rand = (window.__rand || 0) + (G.state === "dying" || G.state === "dead" ? 1 : 0); })()'],
]);
const randoms = [].concat(...[11, 22, 33, 44, 55].map(random), [['expect', 'window.__rand >= 5', 'flipping switches at random: it got you every time (' + 5 + ' runs)']]);
// the night: the main tripped first (the box overloaded) and pushed back on, then the places either side of where it
// is, then its own (the porch light off, as the trip left it)
const trap = k => { const n = [(k + 6) % 7, (k + 1) % 7]; return [['use', 'sw' + (n[0] + 1)], ['use', 'sw' + (n[1] + 1)], ['expect', 'G.L.s.k === ' + k + ' && !G.L.won', 'both neighbours lit; it stays where it is, in the dark'], ['use', 'sw' + (k + 1)]]; };
const solve = [
  ['eval', 'const k = G.L.s.k, far = [0, 1, 2, 3, 4, 5, 6].filter(q => q !== k && !G.L.nb(k).includes(q)).slice(0, 3); ' + "far.forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1))));"],
  ['expect', '!G.L.s.power && G.L.s.on.every(o => !o)', 'the box overloaded: the main trips, every light out'],
  ['use', 'sw' + 1], ['expect', '!G.L.s.power && G.L.s.on[1] && G.L.dynamicLights().length === 0', 'a switch set while the main is off: nothing comes on'],
  ['use', 'sw' + 1], ['expect', '!G.L.s.power && !G.L.s.on[1]', 'and set off again'],
  ['use', 'main'],
  ['expect', 'G.L.s.power && !G.L.s.on[0]', 'the main back on; the porch light is off'],
  ['branch', 'G.L.s.k === 0', trap(0)], ['branch', 'G.L.s.k === 1', trap(1)], ['branch', 'G.L.s.k === 2', trap(2)], ['branch', 'G.L.s.k === 3', trap(3)],
  ['branch', 'G.L.s.k === 4', trap(4)], ['branch', 'G.L.s.k === 5', trap(5)], ['branch', 'G.L.s.k === 6', trap(6)],
  ['expect', 'G.L.s.trapped && G.L.won && G.L.s.power', 'its place lit with both neighbours lit: nowhere dark to go'],
  ['waitUntil', 'G.L.creature.fallT > 2.5', 6000],
  ['expect', 'G.L.creature.fallT > 2.5 && G.state === "won"', 'it shrieks and comes apart in the light, before the fade'],
];
// the main tripped (three places far from it and the porch light on: a fourth), so it is off with every switch down
const tripFirst = fresh.concat([
  ['eval', 'const k = G.L.s.k, far = [0, 1, 2, 3, 4, 5, 6].filter(q => q !== k && !G.L.nb(k).includes(q)).slice(0, 3); ' + "far.forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1))));"],
  ['expect', '!G.L.s.power && G.L.s.on.every(o => !o) && G.L.s.trips === 1', 'the main tripped: off, every switch down'],
  ['wait', 400],   // (its flash gone)
]);
// n switches set with the main off (the porch light and then the places round from the tractor shed), then the main on:
// more than three, and it trips straight back off as before
const overload = n => tripFirst.concat([
  ['eval', Array.from({ length: n }, (_, i) => click(i)).join('')],
  ['expect', '!G.L.s.power && G.L.s.on.filter(Boolean).length === ' + n + ' && G.L.dynamicLights().length === 0', n + ' switches set with the main off, nothing on'],
  ['use', 'main'],
  ['expect', '!G.L.s.power && G.L.s.on.every(o => !o) && G.L.s.trips === 2 && !G.L.s.fire && G.state === "play"', 'the main pushed on with ' + n + ' set: it trips straight back off, every switch drops (no fire)'],
  ['wait', 400],
  ['expect', 'G.L.dynamicLights().length === 0', 'and every light is out again'],
]);
// every switch set, the porch light too, then the main: the farm goes up, and it gets you, burning
const fire = tripFirst.concat([
  ['eval', [0, 1, 2, 3, 4, 5, 6, 7].map(click).join('')],
  ['expect', '!G.L.s.power && G.L.s.on.every(Boolean) && G.L.dynamicLights().length === 0', 'every switch set with the main off: nothing on yet'],
  ['face', 7, true],
  ['use', 'main'],
  ['expect', '!!G.L.s.fire && G.state === "play"', 'the main pushed on with every switch set: the box bursts'],
  ['waitUntil', 'G.L.s.fire.lit.every(t => t !== null && G.L.t > t)', 4000],
  ['expect', 'G.L.s.fire.lit.length === 9 && G.L.s.fire.lit.every(t => t !== null)', 'every place, the house and the box are alight'],
  ['expect', 'G.L.dynamicLights().length >= 9 && G.L.s.on.every(Boolean) && G.L.t - G.L.s.fire.at > 0.5', 'the fires light the farm (a light for each), every lamp blown'],
  ['waitUntil', '!!G.L.s.fire.cr && G.L.creature.burn >= 1', 4000],
  ['expect', 'G.L.creature.burn >= 1 && G.L.creature.shade < 0.1 && G.L.s.fire.cr.phase === "run" && G.L.creature.runPose', 'its spark found it: it is burning, and running'],
  ['waitUntil', 'G.L.s.fire.cr.seenT > 1', 6000],
  ['expect', 'G.L.s.fire.cr.seenT > 1 && G.L.s.r > 3 && G.state === "play"', 'it runs about in the open, where you can see it, and keeps off you while it does'],
  ['waitUntil', 'G.L.s.fire.cr.phase !== "run"', 8000],
  ['expect', 'G.L.s.fire.cr.ran > 10 && G.L.s.fire.cr.t > 2.5', 'it ran about for a while, more than 10 m, then turned on you'],
  ['waitUntil', 'G.state === "dying" || G.state === "dead"', 4000],
  ['expect', 'G.deathCause === "fire" && G.deathCreature.deathSpec && G.deathCreature.deathSpec.sting === "stingBurn" && G.L.creature.burn >= 1', 'then it charged and got you, burning'],
  ['waitUntil', 'G.state === "dead"', 4000],
  ['expect', 'G.deathScreen && G.deathScreen.text === "Apparently the electrical box wasn\'t rated for that."', 'the card: "Apparently the electrical box wasn\'t rated for that."'],
]);
// the clever win: the main off, its place and both its neighbours set, then the main on: caught the moment the lights come on
const clever = tripFirst.concat([
  ['eval', 'window.__kc = G.L.s.k; ' + "[G.L.s.k].concat(G.L.nb(G.L.s.k)).forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1))));"],
  ['expect', '!G.L.s.power && G.L.s.on.filter(Boolean).length === 3 && !G.L.s.on[0] && G.L.s.on[window.__kc + 1] && G.L.dynamicLights().length === 0 && G.L.s.k === window.__kc', 'its place and both its neighbours set with the main off: nothing on, and it has not moved'],
  ['use', 'main'],
  ['expect', 'G.L.s.power && G.L.s.on.filter(Boolean).length === 3 && G.L.dynamicLights().length === 6', 'the main on: the three lights come on with it'],
  ['waitUntil', 'G.L.won', 1500],
  ['expect', 'G.L.won && G.L.s.trapped && G.L.s.k === window.__kc && !G.L.s.run && G.L.s.flushes === 0', 'caught at once, with nowhere dark to go: won'],
  ['waitUntil', 'G.L.creature.fallT > 1', 4000],
  ['expect', 'G.L.creature.fallT > 1', 'and it comes apart in the light'],
]);
module.exports = {
  nightmare: [].concat(flush, trip, houseOn, randoms, overload(4), overload(7), fire, clever, fresh, solve),
};
