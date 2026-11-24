// The Farm: the electrical box's switches light the farm's places (HOUSE is sw0, then the ring of places clockwise from
// the tractor shed, sw1..sw7). The thing hides in the dark at one place (G.L.s.k, 0..6); its neighbours are G.L.nb(k).
// Checks first, each from a fresh start, with clicks on the switches as a click does them (useTarget):
//  - lighting its place makes it flinch and run, side on, to a neighbouring place that is dark;
//  - four switches on at once trip the main: it goes over to off, every light goes dark and every switch drops to off;
//    with the main off a switch can still be set, up or down, and nothing comes on; the main pushed back on, with
//    everything else still off, and then the switches work again; pushed while it is on, it goes off (by hand);
//    and on the box every switch's label (its tape, and its writing) is inside the panel's pale plate with room to
//    spare, as the view shows it looking down at the box and zoomed in on it, tipped up to face you (not squashed);
//  - the main tripped and left off: it comes all the way, and the card reads "The power tripped, and it came for you
//    in the dark.";
//  - with the porch light on, lighting both its neighbours and then its place is a fourth switch: the main trips, it is
//    not caught;
//  - with the main off it comes at its own pace, no faster;
//  - flipping switches at random gets you killed (several random runs, played out with G.step);
//  - switches set with the main off come on when it goes on: more than three trip it straight back off (four, and
//    seven: all but one); all eight, the porch light too, and the box bursts and the farm goes up: every place, the
//    house, the box and the thing catch fire, it runs about burning in the open where you are looking, then turns on
//    you and charges, and the card reads the fire's own line; the easter egg is in the save from the moment the box
//    bursts (SAVE.data.eggs, by the night's id);
//  - the clever win: the main off, its place and both its neighbours set, the main pushed on: it is caught at once;
//  - the main put off by hand, whenever you like: every light out, the switches left as they are set, and it comes in
//    the dark at its own pace; back on, the same rules (four set trip it straight back off); the clever win and the fire
//    from there; and left off, it gets you, the card saying you put the main off;
//  - every flame's foot on the farm alight is on a surface, and on the thing alight, in every pose, on its body;
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
// The labels on the box, as the view shows them (G.L.panelLayout: the pale plate, each label's tape and its writing, as
// points in the world, each put on the view): how far inside the plate's outline the nearest corner of any tape or any
// writing is (px); whether every label's writing is narrower than its tape; and how tall each tape shows for its width
// (it is 0.03 by 0.104 m: tipped up to face you it shows near enough that, where flat on the panel and seen from above
// it showed a good deal squatter)
const labels = `(() => {
  const P = G.L.panelLayout(), scr = p => { const q = R.screenPos(p.x, p.y, p.z); return q ? [q.x, q.y] : [NaN, NaN]; };
  const plate = P.plate.map(scr), mid = [0, 1].map(k => plate.reduce((a, q) => a + q[k] / 4, 0));
  const inside = q => { let m = Infinity; for (let i = 0; i < 4; i++) { const a = plate[i], b = plate[(i + 1) % 4], l = Math.hypot(b[0] - a[0], b[1] - a[1]), sd = v => ((b[0] - a[0]) * (v[1] - a[1]) - (b[1] - a[1]) * (v[0] - a[0])) / l; m = Math.min(m, sd(q) * Math.sign(sd(mid))); } return m; };
  const tapes = P.labels.map(l => l.tape.map(scr)), len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { n: P.labels.length, names: P.labels.map(l => l.label).join(), tape: Math.min(...tapes.flat().map(inside)), text: Math.min(...P.labels.flatMap(l => l.text.map(scr)).map(inside)),
    fits: P.labels.every(l => l.textW <= l.tapeW - 0.006 && l.squeeze >= 0.7), squat: Math.min(...tapes.map(t => len(t[0], t[3]) / len(t[0], t[1]))), plateW: len(plate[0], plate[1]),
    onPlate: R.hits.filter(h => h.kind === 'target' && /^sw/.test(h.ref.id)).every(h => h.poly.every(v => inside([v[0], v[1] - R.viewY]) > -1)) };
})()`;
const labelsIn = (px, where) => [['eval', 'window.__lab = ' + labels],
  ['expect', '__lab.n === 8 && __lab.names === "HOUSE,TRACTOR,SHED,STABLES,BARN,SILO,COOP,DRIVEWAY" && __lab.tape >= ' + px + ' && __lab.text >= ' + px + ' + 1 && __lab.fits && __lab.onPlate',
    where + ': every label (its tape and its writing, DRIVEWAY the longest) is inside the pale plate, at least ' + px + ' px in from its edge, and so is every switch\'s own spot to click'],
  ['expect', '__lab.squat > 0.26 && __lab.squat < 0.32', where + ': the labels face you (each tape shows as tall for its width as it is, not squashed from above)']];
const trip = fresh.concat([
  ['expect', 'G.L.s.power && ' + main + ' && ' + main + '.face !== undefined && G.L.targets.filter(t => /^sw/.test(t.id)).every(t => t.face === ' + main + '.face)', 'the main breaker and the switches, fixed flat on the front of the box'],
  // the box is at your left, short of the stables and square in the middle of the view as you face them, its front to
  // you: turned to face the stables and looking down, the main and every switch are in view; zoom held on it closes in
  // only as far as keeps the whole box in view (clear of the compass at the top)
  ['face', 7, true],
  ['expect', '(() => { const m = ' + main + ', a = Math.atan2(m.x, m.z) / DEG, d = Math.hypot(m.x, m.z), front = -(Math.sin(m.face) * m.x + Math.cos(m.face) * m.z); ' +
    "const hs = R.hits.filter(h => h.kind === 'target' && (h.ref.id === 'main' || /^sw/.test(h.ref.id)) && h.poly); " +
    'return Math.abs(a + 45) < 2 && d < 1.3 && front > 0.9 * d && hs.length === 9 && hs.every(h => h.x >= 0 && h.x + h.w <= R.W && h.y >= R.viewY && h.y + h.h <= R.viewY + R.H); })()', 'the box at your left, square before you as you face the stables, its front to you; facing the stables and looking down, the main and every switch are in view'],
  ...labelsIn(4, 'looking down at the box'),
  ['eval', 'G.cam.zoomHeld = true'], ['wait', 1200],
  ['expect', '(() => { const z = G.L.boxZoom(); const hs = R.hits.filter(h => h.kind === "target" && (h.ref.id === "main" || /^sw/.test(h.ref.id))); ' +
    'return z > 1.3 && z < 2.6 && Math.abs(G.cam.zoom - z) < 0.03 && hs.length === 9 && hs.every(h => h.x >= 0 && h.x + h.w <= R.W && h.y >= R.viewY + 80 && h.y + h.h <= R.viewY + R.H); })()', 'zoomed on the box, it closes in only as far as keeps all of it in view'],
  ...labelsIn(6, 'zoomed in on the box'),
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
  ['expect', '!G.L.s.power && G.L.s.offBy === "hand" && G.L.s.on[0] && G.L.s.trips === 1 && G.L.dynamicLights().length === 0', 'the main pushed while it is on: over to OFF, every light out, the switch left set (not a trip)'],
  ['use', 'main'],
  ['expect', 'G.L.s.power && G.L.s.on[0] && G.L.dynamicLights().length > 0', 'and back on, the porch light with it'],
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
  ['eval', 'delete SAVE.data.eggs.barn; SAVE.persist()'],   // (not found yet, whatever an earlier run left in the save)
  ['expect', 'G.L.def.id === "barn" && LEVELS[G.levelIndex].text.egg === "Overload the electrical box." && !SAVE.data.eggs.barn', 'every switch set, the main still off: the easter egg is not in the save'],
  ['use', 'main'],
  ['expect', '!!G.L.s.fire && G.state === "play"', 'the main pushed on with every switch set: the box bursts'],
  ['expect', 'SAVE.data.eggs.barn === true && JSON.parse(localStorage.getItem("itscoming.v2")).eggs.barn === true && G.state === "play"', 'and the easter egg is found: kept in the save the moment the fire starts (long before it has you)'],
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
// the main put off by hand, whenever you like: it goes over to OFF and every light goes out, the porch light too, but
// the switches stay where they are set; to the thing it is the dark, and it comes for you at its own pace, all the way.
// Pushed back on, what is set comes on with it, by the same rules as ever: three or fewer light, four to seven trip it
// straight back off, all eight and the box goes up
const mainOff = fresh.concat([
  ['eval', 'window.__r0 = G.L.s.r; window.__t0 = G.L.t;'],
  ['use', 'main'],
  ['expect', '!G.L.s.power && G.L.s.offBy === "hand" && G.L.s.trips === 0 && G.L.s.on[0] && G.L.s.on.filter(Boolean).length === 1 && /main (is off|over to OFF)/.test(G.lastToast.msg)', 'the main pushed while it is on: it goes over to OFF, and the porch light\'s switch stays set (no trip)'],
  ['wait', 400],
  ['expect', 'G.L.dynamicLights().length === 0 && G.L.pal.ambient < 0.4 && G.L.s.pool < 0.05', 'every light on the farm is out, the porch light too'],
  ['wait', 1500],
  ['expect', '!G.L.s.power && G.state === "play" && G.L.creature.shade > 0.5 && (window.__r0 - G.L.s.r) / (G.L.t - window.__t0) > 0.25 && (window.__r0 - G.L.s.r) / (G.L.t - window.__t0) < 0.62 * 1.15 + 0.05', 'in the dark it comes for you at its own pace, as with the main tripped'],
  ['use', 'main'],
  ['expect', 'G.L.s.power && G.L.s.on[0] && G.L.dynamicLights().length > 0 && G.L.s.trips === 0', 'pushed back on: the porch light, still set, comes on with it'],
  ['use', 'main'],
  ['expect', '!G.L.s.power && G.L.s.offBy === "hand" && G.L.s.on[0]', 'and off again'],
  ['eval', 'const k = G.L.s.k, far = [0, 1, 2, 3, 4, 5, 6].filter(q => q !== k && !G.L.nb(k).includes(q)).slice(0, 3); ' + "far.forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1))));"],
  ['expect', '!G.L.s.power && G.L.s.on.filter(Boolean).length === 4 && G.L.dynamicLights().length === 0', 'three more set with it off (four, the porch light too): nothing comes on'],
  ['use', 'main'],
  ['expect', '!G.L.s.power && G.L.s.offBy === "trip" && G.L.s.trips === 1 && G.L.s.on.every(o => !o) && !G.L.s.fire', 'pushed on with four set: it trips straight back off, every switch drops, as ever'],
]);
// with the main put off by hand: the porch light's switch set off, its place and both its neighbours set, and the main on
const offClever = fresh.concat([
  ['use', 'main'],
  ['eval', 'window.__kc = G.L.s.k; ' + click(0) + "[G.L.s.k].concat(G.L.nb(G.L.s.k)).forEach(q => useTarget(G.L.targets.find(t => t.id === 'sw' + (q + 1))));"],
  ['expect', '!G.L.s.power && G.L.s.offBy === "hand" && !G.L.s.on[0] && G.L.s.on.filter(Boolean).length === 3 && G.L.dynamicLights().length === 0', 'the main put off by hand, the porch light set off, its place and both neighbours set: nothing on'],
  ['use', 'main'],
  ['waitUntil', 'G.L.won', 1500],
  ['expect', 'G.L.won && G.L.s.trapped && G.L.s.k === window.__kc && G.L.s.flushes === 0', 'the main on: caught at once, with nowhere dark to go'],
]);
// with the main put off by hand, every switch set, and the main on: the box goes up
const offFire = fresh.concat([
  ['use', 'main'],
  ['eval', [1, 2, 3, 4, 5, 6, 7].map(click).join('')],
  ['expect', '!G.L.s.power && G.L.s.on.every(Boolean) && G.L.dynamicLights().length === 0 && !G.L.s.fire', 'the main put off by hand and every switch set (the porch light was already): nothing on'],
  ['use', 'main'],
  ['expect', '!!G.L.s.fire && G.state === "play"', 'the main on: the box bursts'],
]);
// the main put off by hand and left off: it comes all the way, and the card says why (played out with G.step)
const offDeath = fresh.concat([
  ['use', 'main'],
  ['eval', '(() => { for (let i = 0; i < 2400 && G.state !== "dead"; i++) G.step(0.05); })()'],
  ['expect', 'G.state === "dead" && G.deathCause === "off" && G.deathScreen.text === "You put the main off. In the dark, it came for you." && G.deathScreen.title === "It got you"', 'left in the dark with the main off by hand, it got you: "You put the main off. In the dark, it came for you."'],
]);
// the main tripped (a fourth light) and left off: it comes all the way, and the card says the power tripped (played out
// with G.step)
const tripDeath = tripFirst.concat([
  ['eval', '(() => { for (let i = 0; i < 2400 && G.state !== "dead"; i++) G.step(0.05); })()'],
  ['expect', 'G.state === "dead" && G.deathCause === "trip" && G.L.text.death.trip === "The power tripped, and it came for you in the dark." && G.deathScreen.text === "The power tripped, and it came for you in the dark." && G.deathScreen.title === "It got you"',
    'left in the dark with the main tripped, it got you: "The power tripped, and it came for you in the dark."'],
]);
// every flame on the farm alight has its foot on something, seen from where you stand (you never move, so a foot over a
// surface from here is over it whichever way you look and however you zoom): over the walls, roofs, doors and pickup of
// its own place (within a metre in front of the flame to 3.5 m behind it, along the line from you), or on the ground.
// Its foot: where the flame comes up out of its soft foot (CR.flameStrip), across the main flame's width (0.45 of it
// either side) and the lower one's beside it (night11.js: FLAME_LO, FLAME_LW)
const footsOnSurfaces = () => {
  const L = G.L, eyeH = L.eyeH, bad = [];
  const polys = L.props.filter(p => p.kind === 'poly' && p.alpha === undefined && p.layer !== 0 && p.pts.some(v => v[1] > 0.03));
  const inPoly = (u, v, pts) => { let k = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a[1] > v) !== (b[1] > v) && u < a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1])) k = !k; } return k; };
  const depthAt = (q, u, v) => {   // where the line from the eye through (u, v) meets the poly's plane
    const a = q[0], e1 = [q[1][0] - a[0], q[1][1] - a[1], q[1][2] - a[2]], e2 = [q[2][0] - a[0], q[2][1] - a[1], q[2][2] - a[2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], den = n[0] * u + n[1] * v + n[2];
    return Math.abs(den) < 1e-9 ? a[2] : (n[0] * a[0] + n[1] * a[1] + n[2] * a[2]) / den;
  };
  for (const st of L.fireSites) {
    const c = Math.cos(st.yaw), s = Math.sin(st.yaw);
    const near = polys.map(p => p.pts.map(v => [v[0] * c - v[2] * s, v[1] - eyeH, v[0] * s + v[2] * c])).filter(q => q.every(v => v[2] > 0.2)).map(q => ({ q, uv: q.map(v => [v[0] / v[2], v[1] / v[2]]) }));
    st.spots.forEach((sp, j) => {
      const [x, y, z] = sp.at, w = sp.sz, h = sp.sz * 2;
      if (y <= 0.1) return;   // (on the ground)
      const pts = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45].map(k => [x + k * w, y + 0.07 * h]).concat([-0.45, 0, 0.45].map(k => [x + sp.side * 0.22 * w + k * 0.75 * w, y + 0.07 * h * 0.75]));
      for (const [px, py] of pts) {
        const u = px / z, v = (py - eyeH) / z;
        if (!near.some(S => { if (!inPoly(u, v, S.uv)) return false; const d = depthAt(S.q, u, v); return d > z - 1 && d < z + 3.5; })) { bad.push(st.si + '/' + j); break; }
      }
    });
  }
  window.__feet = bad;
  return bad.length === 0;
};
// the thing alight, in every pose it burns in (standing, running either way through its stride, beating at itself,
// charging, in your face): every flame's foot is on it, inside its outline (drawn solid, with no flames), never out in
// the air beside it or over its head
const footsOnIt = () => {
  const c = G.L.creature, CR = c.CR, keep = {}, keys = ['burn', 'char', 'flail', 'charge', 'lunge', 'runPose', 'runDir', 'runPace', 'runGait', 'recoil', 'moving', 'gait', 't', 'shade'];
  keys.forEach(k => { keep[k] = c[k]; });
  const cv = document.createElement('canvas'); cv.width = 600; cv.height = 800;
  const ctx = cv.getContext('2d', { willReadFrequently: true }), base = new DOMMatrix().translate(300, 740).scale(250, -250);
  const solid = { col: () => 'rgb(0,0,0)', cola: () => 'rgb(0,0,0)', raw: () => 'rgb(0,0,0)', fog: 0 }, flame = CR.flame, bad = [];
  const poses = [];
  for (let i = 0; i < 6; i++) {
    const t = 10 + i * 0.37, g = i * 1.1;
    poses.push({ t, gait: g, moving: i % 2 === 0 }, { t, gait: g, flail: 1 }, { t, gait: g, charge: 1, moving: true }, { t, gait: g, charge: 1, lunge: 0.2 + i * 0.12 });
    for (const dir of [1, -1]) poses.push({ t, runPose: true, runDir: dir, runPace: 1, runGait: i * 0.55 });
  }
  try {
    poses.forEach((o, n) => {
      Object.assign(c, { burn: 1, char: 0.85, flail: 0, charge: 0, lunge: 0, runPose: false, recoil: 0, moving: false, shade: 0 }, o);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 600, 800); ctx.setTransform(base);
      CR.flame = () => {}; CR.draw(ctx, c, solid);
      const img = ctx.getImageData(0, 0, 600, 800).data, on = (X, Y) => X >= 0 && Y >= 0 && X < 600 && Y < 800 && img[(Y * 600 + X) * 4 + 3] > 200;
      const fl = []; CR.flame = (cx, x, y, w, h) => { fl.push({ m: cx.getTransform(), x, y, w, h }); };
      ctx.setTransform(base); CR.draw(ctx, c, solid); CR.flame = flame;
      fl.forEach((f, j) => {
        for (const k of [-0.45, -0.22, 0, 0.22, 0.45]) {
          const p = f.m.transformPoint(new DOMPoint(f.x + k * f.w, f.y + 0.11 * f.h)), X = Math.round(p.x), Y = Math.round(p.y);
          if (!(on(X, Y) && on(X - 2, Y) && on(X + 2, Y) && on(X, Y - 2) && on(X, Y + 2))) { bad.push(n + '/' + j); break; }
        }
      });
    });
  } finally { CR.flame = flame; Object.assign(c, keep); }
  window.__feet = bad;
  return bad.length === 0;
};
// it carries nothing: in no pose (standing, creeping, reaching for you, rearing from the light, running either way all
// through its stride, burning or not, flailing, charging, in your face, coming apart) is anything drawn in the colours of
// the bundle it once clutched; and given a thing to hold (c.clutch, as night 13 gives it the fuse), its right hand is
// there, standing, flailing and running either way
const bareArms = () => {
  const c = G.L.creature, CR = c.CR, keep = {}, keys = ['burn', 'char', 'flail', 'charge', 'lunge', 'runPose', 'runDir', 'runPace', 'runGait', 'recoil', 'shade', 'fallT', 'fallSide', 'clutch', 'dist', 'moving', 'gait'];
  keys.forEach(k => { keep[k] = c[k]; });
  // drawn with the bundle's two colours (or, looking for its hand, its skin) bright red and everything else black (and no
  // flames), and looked at for red (anywhere, or round one point)
  const cv = document.createElement('canvas'); cv.width = 400; cv.height = 400;
  const ctx = cv.getContext('2d', { willReadFrequently: true }), flame = CR.flame;
  const pal = cols => ({ fog: 0, col: k => (cols.includes(k.slice(0, 3).join()) ? 'rgb(255,0,0)' : 'rgb(0,0,0)'), cola: () => 'rgb(0,0,0)', raw: () => 'rgb(0,0,0)' });
  const BUNDLE = pal(['134,114,82', '98,82,58']), SKIN = pal(['160,140,122', '118,100,86']);
  const red = (P, o, at) => {
    Object.assign(c, { burn: 0, char: 0, shade: 0, flail: 0, charge: 0, lunge: 0, recoil: 0, fallT: undefined, runPose: false, clutch: null, dist: 8, moving: false }, o);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 400, 400); ctx.setTransform(150, 0, 0, -150, 200, 360);
    CR.draw(ctx, c, P);
    const [x0, y0, w] = at ? [Math.round(200 + at[0] * 150) - 9, Math.round(360 - at[1] * 150) - 9, 18] : [0, 0, 400];
    const px = ctx.getImageData(x0, y0, w, w).data;
    for (let i = 0; i < px.length; i += 4) if (px[i] > 200 && px[i + 1] < 40 && px[i + 3] > 200) return true;
    return false;
  };
  const poses = [{}, { moving: true, gait: 1 }, { dist: 1.8 }, { recoil: 1 }, { flail: 1, burn: 1 }, { charge: 1, burn: 1 }, { lunge: 1, dist: 1.5 }];
  for (const f of [0.3, 1.2, 2.4, 6]) poses.push({ fallT: f, fallSide: 1 });
  for (const dir of [1, -1]) for (let i = 0; i < 16; i++) for (const burn of [0, 1]) poses.push({ runPose: true, runDir: dir, runPace: 1, runGait: i / 16 * 2 * Math.PI, burn });
  let ok = true;
  try {
    CR.flame = () => {};
    for (const o of poses) if (red(BUNDLE, o)) ok = false;
    for (const at of [[0.1, 0.8], [0.36, 1.28]]) for (const o of [{}, { flail: 1 }, { runPose: true, runDir: 1, runPace: 1, runGait: 1 }, { runPose: true, runDir: -1, runPace: 1, runGait: 2 }]) {
      if (!red(SKIN, Object.assign({ clutch: at }, o), at)) ok = false;   // (where night 13 draws the thing, whichever way it runs)
    }
  } finally { CR.flame = flame; Object.assign(c, keep); }
  return ok;
};
const feet = fresh.concat([
  ['expect', '(' + bareArms + ')()', 'it carries nothing: in no pose, standing, running either way, burning, in your face or coming apart, is a bundle drawn; given a thing to hold (c.clutch, night 13\'s fuse), its right hand is there'],
  ['expect', '(' + footsOnSurfaces + ')()', 'the farm alight: every flame\'s foot is on a wall, a roof, a door or the ground, none hanging off an edge into the air'],
  ['expect', '(' + footsOnIt + ')()', 'the thing alight, in every pose: every flame\'s foot is on it, none out in the air beside it or over its head'],
]);
module.exports = {
  nightmare: [].concat(flush, trip, houseOn, randoms, overload(4), overload(7), fire, clever, mainOff, offClever, offFire, offDeath, tripDeath, feet, fresh, solve),
};
