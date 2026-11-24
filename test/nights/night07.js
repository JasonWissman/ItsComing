// The Lighthouse, played five times. First the things that do not work before the blown fuse is out: a click on the lamp
// with nothing in hand (the hand goes to it and the old bulb rattles in its socket); the fuse box opened (the hand pulls its
// door open); the spare bulb (tried in the open toolbox, it comes back), and then the new fuse from the toolbox, tried
// at the clips with the blown fuse still in (each knocks against it and comes back to the hand); and, without the new one,
// the blown fuse taken out and pushed back (it is the one tried, and drops out). Only the one good fuse is to be found: no
// other fuse lies about. Then the toolbox
// dropped over the rail onto it, far down and near (toolboxDrop, below: the hit is the night's easter egg, and the night is
// then won the ordinary way, with the black eye on it). Then from the start: the
// spare bulb; open the fuse box and pull out
// the blown fuse; push it back into the empty clips (it sits there a beat and drops out to the floor, where it is picked up
// again); the bulb tried at the empty clips (back to the hand); the bulb into the lamp; the new fuse from the toolbox; one
// turn of the crank before
// the lamp is lit (the lamp goes round a little with it, dark); then turn the crank until the light goes round. On the way it
// checks that the open door is part of the fuse box, and that the empty holder says "the one that blew" only when that is
// what you are holding. Won, the beam knocks the thing off the tower: it lets go of the stone, clear of the wall, and goes
// into the sea beyond the foot of the tower (14.7 m from its axis) before the night fades.
// The town across the water: sixteen lights low on the horizon, each a small soft glow (a radial gradient that fades to
// nothing, filled as a disc), not a flat square. Drawn here onto a canvas that only notes what is asked of it.
const farGlows = (n, near, far) => `(() => {
  const ps = G.L.props.filter(p => p.kind === 'sprite' && p.noFog && p.noLight && p.layer !== 0 && Math.hypot(p.x, p.z) > ${near} && Math.hypot(p.x, p.z) < ${far});   // (not the stars: they are in the sky's own layer)
  return ps.length === ${n} && ps.every(p => {
    const did = [], stops = [], ctx = { createRadialGradient() { did.push('grad'); return { addColorStop(o, c) { stops.push([o, c]); } }; }, beginPath() {}, arc() { did.push('arc'); }, fill() { did.push('fill'); }, fillRect() { did.push('rect'); }, rect() { did.push('rect'); }, scale() {}, save() {}, restore() {} };
    p.draw(ctx, { t: 0, raw: c => rgba(c), col: c => rgba(c) }, 4);
    const a = stops.map(q => +q[1].slice(q[1].lastIndexOf(',') + 1, -1));
    return did.join() === 'grad,arc,fill' && stops.length >= 3 && stops[0][0] === 0 && stops[stops.length - 1][0] === 1 && a[a.length - 1] === 0 && a[0] > 0.2 && a[0] < 0.9 && a.every((v, i) => !i || v < a[i - 1]) && p.w < 8;
  });
})()`;
const town = [['expect', farGlows(16, 150, 400), 'the town across the water is sixteen small soft glows, each fading to nothing, not squares']];
const crank = [['clickUntil', 'winder', 'G.L.s.turning', 250, 12],
  ['waitUntil', '!!G.L.s.fall', 9000],
  ['waitUntil', 'G.L.creature.gone && !!G.L.s.splash && G.state === "won"', 6000],
  ['expect', 'Math.hypot(G.L.s.splash.at[0] - G.L.pt(0, 0, -2.9)[0], G.L.s.splash.at[2] - G.L.pt(0, 0, -2.9)[2]) > 15.5', 'it went into the sea clear of the foot of the tower']];
const said = line => 'G.lastToast.msg === ' + JSON.stringify(line);
const item = id => 'G.L.items.find(i => i.id === "' + id + '")';
const hold = id => ['eval', 'G.active = G.inv.findIndex(i => i.id === "' + id + '")'];
// a thing tried where it will not go comes back to the hand: it went there and back, and is in hand again
const comesBack = (id, what) => [
  ['expect', 'G.fumbling && G.fumbling.preset === "return" && !G.fumbling.drop && G.fumbling.it.id === "' + id + '"', what + ': it goes there'],
  ['waitUntil', '!G.fumbling', 3000],
  ['expect', 'G.inv[G.active] && G.inv[G.active].id === "' + id + '"', what + ': and comes back to the hand'],
];
// a fuse pushed into the empty clips that will not do: it is put in place there, drops out to the floor and lies there, out
// of the hand, where a click takes it again
const dropsOut = (id, what) => [
  ['expect', 'G.fumbling && G.fumbling.preset === "slip" && G.fumbling.drop && G.fumbling.it.id === "' + id + '" && !G.hasItem("' + id + '")', what + ': it goes into the clips, out of the hand'],
  ['waitUntil', '!G.fumbling && !' + item(id) + '.taken', 4000],
  ['expect', item(id) + '.y === G.L.floor.y && !G.hasItem("' + id + '") && !G.L.s.fuse', what + ': it dropped out of the clips to the floor and lies there'],
  ['pickup', id],
];
// a click on the open toolbox clear of the fuse lying in it (a click on the fuse takes the fuse), through the canvas
const clickOffFuse = '(() => { const tb = R.hits.find(h => h.kind === "target" && h.ref.id === "toolbox"), fu = R.hits.find(h => h.kind === "item" && h.ref.id === "fuse"); if (!tb) return false;' +
  ' for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const x = tb.x + tb.w * (0.1 + 0.1 * i), y = tb.y + tb.h * (0.1 + 0.1 * j); if (fu && x > fu.x - 12 && x < fu.x + fu.w + 12 && y > fu.y - 12 && y < fu.y + fu.h + 12) continue;' +
  ' UI.canvas.dispatchEvent(new MouseEvent("click", { clientX: x, clientY: y, bubbles: true })); return true; } return false; })()';
const toolboxFree = 'G.L.targets.find(t => t.id === "toolbox").hidden && ' + item('toolbox') + ' && !' + item('toolbox') + '.taken';
// The toolbox dropped over the rail onto it, twice. The fuse out of the toolbox, the toolbox itself is taken up; with it in
// hand the thing (made to be a given way down, looked at over the rail) is clicked. It lands on it however far down it
// is: at the foot of its climb, mid-way up (15 m off) and just under the rail (3 m), the box comes all the way down the
// stone onto it, the fall taking as long as that height needs (b.fell: no quicker than a clear fall from the rail, and
// longer the further down it is), and with it running round the tower meanwhile the box comes across the face after it.
// Then from the start, near (6 m off), looked at closely: it comes down the stone onto its face.
// How the box is seen to go, each time, stepped by hand from the click until it lands (boxPath, below): it is swung up out
// of the hand over the rail's top bar (1.01 m), and let go outside the rail and the edge of the floor (3.25 m from the
// tower's axis); let go, it is drawn where it truly is (nothing jumps there), and from then on comes smoothly to where it
// lands; and wherever it is drawn below the floor, the line from your eye to it passes outside the floor's edge: it is
// never drawn in under the gallery, where the floor would hide it.
// That is the night's easter egg, kept in the save the moment it lands (SAVE.data.eggs.lighthouse), and it is not a win:
// the thing loses its hold with one hand and hangs by the other (c.dangle), held where it is, for CREATURES.climber.dangleFor
// (1.85 s: a second of it hanging, with the drop onto the arm before and the swing back in after); then it is back on
// the stone, and climbs on from where it was, with a black eye (c.blackEye, the bruise come up: c.bruise 1). The toolbox
// goes on down into the sea. Then, with the thing sent back down the wall, the night is won the ordinary way (bulb, fuse,
// crank): the beam knocks it off as ever, the black eye still on it, and the night's own line is the one shown.
const overRail = d => ['eval', '(() => { const c = G.L.creature; c.u = 1 - Math.pow(' + d + ' / c.D0, 1 / c.gamma); const di = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.dirIdx = di; G.cam.yaw = G.cam.tYaw = di * 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; })()'];
const hovered = tip => '(() => { const h = [...R.hits].reverse().find(h => h.kind === "creature"); if (!h) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2; updateHover(); return UI.tooltip.textContent === ' + JSON.stringify(tip) + ' && UI.canvas.style.cursor === "pointer"; })()';
const takeToolbox = [
  ['use', 'toolbox'], ['pickup', 'fuse'], ['pickup', 'toolbox'],
  ['expect', 'G.inv[G.active].id === "toolbox" && G.L.targets.find(t => t.id === "toolbox").hidden && activeUse(G.L) && activeUse(G.L).tool === "toolbox"', 'the toolbox, the fuse out of it, is taken up'],
];
const C7 = 'G.L.creature', DANGLE = 'CREATURES.climber.dangleFor';
const eggSaved = '(SAVE.data.eggs.lighthouse === true && JSON.parse(localStorage.getItem("itscoming.v2")).eggs.lighthouse === true)';
const boxPath = k => ['eval', `(() => {
  const L = G.L, b = L.s.box, o = { top: -9, clear: 9, jump: 0, let: null, r0: b.r, n: 0 };
  const floorR = p => { const q = L.eyeH / (L.eyeH - p[1]), a = rotY(p[0] * q, p[2] * q, -L.facing); return Math.hypot(a[0], a[1] + 2.9); };   // where the line from the eye to it crosses the floor's level, from the tower's axis
  let sh = 0;
  while (!b.struck && !b.gone && o.n++ < 600) {
    G.step(1 / 60); const p = b.drawn;
    if (b.t < b.out) { o.top = Math.max(o.top, p[1]); continue; }
    if (o.let === null) o.let = Math.abs(b.shift || 0);
    o.jump = Math.max(o.jump, Math.abs((b.shift || 0) - sh)); sh = b.shift || 0;
    if (p[1] < 0) o.clear = Math.min(o.clear, floorR(p) - 3.25);
  }
  (window.__path7 = window.__path7 || [])[${k}] = o;
})()`];
const toolboxDrop = [
  ['eval', 'restartLevel()'], ['wait', 300],
  ['eval', 'delete SAVE.data.eggs.lighthouse; SAVE.persist();'],
  // at the foot of its climb, mid-way and just under the rail: each time it lands on it
  ...[['c.D0', 'at the foot of its climb'], [15, 'mid-way up'], [3, 'just under the rail']].flatMap(([d, where], k) => [
    ...takeToolbox, overRail(d), ['wait', 200],
    ['expect', hovered('Drop the toolbox on it.'), where + ', over the rail at it with the toolbox: the hover offers to drop it'],
    ['shoot'], ['expect', 'G.L.s.box && G.L.s.box.hit && !G.hasItem("toolbox")', where + ': the toolbox goes over the rail'],
    boxPath(k),
    ['expect', '(o => o.top > 1.02 && o.r0 >= 3.3 && o.let < 0.02 && o.jump < 0.12)(window.__path7[' + k + '])', where + ': it is swung up over the rail\'s top bar and let go outside the rail; nothing jumps as it is let go, nor on its way down'],
    ['expect', '(o => o.clear > 0.05)(window.__path7[' + k + '])', where + ': below the floor it is never drawn in under the gallery (the line from the eye to it clears the floor\'s edge)'],
    ['waitUntil', 'G.L.s.boxHit && G.L.s.box.struck && !!' + C7 + '.dangle', 8000],
    ['expect', '(c => G.L.s.box.hits >= ' + (k < 2 ? 2 : 0) + ' && Math.abs(c.blackEye) === 1 && c.hold === c.dist && G.state === "play" && !G.L.won)(' + C7 + ') && ' + eggSaved,
      where + ': it came all the way down the stone onto it: it hangs by one hand with a black eye, and the easter egg is saved'],
    ['eval', '(b => { const h = b.from0 - b.struckY, ff = (-1.2 + Math.sqrt(1.44 + 2 * 9.8 * Math.max(0, h))) / 9.8; (window.__fell7 = window.__fell7 || [])[' + k + '] = { h, ff, t: b.fell, y0: b.y0 }; })(G.L.s.box)'],
    ['expect', '(b => b.seen ' + (k < 2 ? '> 0.05' : '>= 0') + ' && b.seen < 0.5)(G.L.s.box)', where + ': as it lands the box is drawn on its face as that is drawn (its middle under half a metre from the middle of the face, at the thing\'s distance: ' + (k < 2 ? 'the box\'s edge on its brow)' : 'lower on the face, clear of the lip of the gallery)')],
    ['expect', '(f => f.t >= f.ff * 0.95 - 0.02 && f.t <= f.ff * 2.5 + 0.4)(window.__fell7[' + k + '])', where + ': the fall took as long as that height needs (no quicker than a clear fall, and not much slower)'],
    ['eval', 'delete SAVE.data.eggs.lighthouse; SAVE.persist(); restartLevel()'], ['wait', 300],
  ]),
  ['expect', '(f => f[0].h > 15 && f[1].h > 6 && f[1].h < f[0].h - 4 && f[2].h < 3 && f[0].t > f[1].t + 0.3 && f[1].t > f[2].t + 0.3 && f[0].t > 1.8 && f[2].t < 0.9)(window.__fell7)',
    'the further down it is, the longer the box takes to get to it: over 15 m down, mid-way, and under 3 m'],
  // it runs round the tower while the box is on its way down: the box comes across the face to it and lands on it all the same
  ...takeToolbox, overRail(18), ['wait', 200], ['shoot'],
  ['eval', '(c => { G.L.s.scut = { from: c.wallTh, to: c.wallTh + 14 }; })(' + C7 + ')'],
  ['waitUntil', 'G.L.s.boxHit || G.L.s.box.gone', 8000],
  ['expect', 'G.L.s.boxHit && G.L.s.box.struck && Math.abs(G.L.s.box.across) > 0.5 && !!' + C7 + '.dangle && Math.abs(' + C7 + '.blackEye) === 1', 'running round the tower as the box comes down, it is hit all the same: the box came across the face after it'],
  ['eval', 'G.L.s.scut = null; delete SAVE.data.eggs.lighthouse; SAVE.persist(); restartLevel()'], ['wait', 300],
  ...takeToolbox, overRail(6), ['wait', 200],
  ['expect', hovered('Drop the toolbox on it.'), 'over the rail at it, near, with the toolbox: the hover offers to drop it'],
  ['eval', 'window.__sfxN7 = []; if (!window.__sfxO7) { window.__sfxO7 = AUDIO.sfx; AUDIO.sfx = (n, ...r) => { window.__sfxN7.push(n); return window.__sfxO7(n, ...r); }; }'],
  ['shoot'], ['expect', 'G.L.s.box && G.L.s.box.hit && !G.hasItem("toolbox")', 'near enough: the toolbox goes over the rail'],
  ['waitUntil', 'G.L.s.boxHit && G.L.s.box.struck && !!' + C7 + '.dangle', 4000],
  ['eval', 'window.__hit7 = (c => ({ t: G.L.t - c.dangle.t, d: c.dist, side: c.dangle.side }))(' + C7 + ')'],
  ['expect', 'G.L.s.box.hits >= 1 && G.state === "play" && !G.L.won && !G.L.isWon() && !G.L.s.turning', 'it came down the stone onto it, and that is not a win: the night goes on'],
  ['expect', eggSaved + ' && G.L.text.egg === "Hit the creature with the toolbox."', 'the easter egg is in the save the moment it lands, under the night\'s id'],
  ['expect', 'window.__sfxN7.includes("gate") && window.__sfxN7.includes("clatter") && !window.__sfxN7.includes("clonk") && G.lastToast.msg === "Full in the face. It hangs there by one hand."', 'it lands with the clang of the quarry gate (gate) and the tools jumping in the box, and the night says what it did'],
  ['expect', '(c => c.hold === c.dist && c.dist === window.__hit7.d && Math.abs(c.blackEye) === 1 && c.blackEye === c.dangle.side && ' + DANGLE + ' > 1.5 && ' + DANGLE + ' < 2.2 && CLIMB.dangle.hang === 1)(' + C7 + ')',
    'it has lost its hold with one hand: held where it is, for about two seconds in all (one of them hanging), and that side\'s eye is the black one'],
  ['waitUntil', C7 + '.dangle && ' + C7 + '.dangle.t > 0.6 && ' + C7 + '.dangle.t < 1.3', 3000],
  ['expect', '(c => { const d = CREATURES.climber.dangling(c); return d.hold === -c.dangle.side && d.off === 1 && d.back === 0 && d.sw > 0.5 && d.sw < 1.7 && c.dist === window.__hit7.d && c.bruise > 0.3; })(' + C7 + ')',
    'half way through it hangs by the other hand, the rest of it off the stone and swinging, where it was on the wall; the bruise is coming up'],
  ['waitUntil', '!' + C7 + '.dangle', 4000],
  ['expect', '(c => { const e = G.L.t - window.__hit7.t; return e >= ' + DANGLE + ' - 0.05 && e < ' + DANGLE + ' + 0.6 && c.hold === null && c.dist <= window.__hit7.d && c.dist > window.__hit7.d - 0.3 && G.state === "play"; })(' + C7 + ')',
    'after that long and no longer it is back on the stone, free to climb, no further down the wall than it was'],
  ['waitUntil', C7 + '.dist < window.__hit7.d - 0.04 && ' + C7 + '.bruise === 1', 8000],
  ['expect', C7 + '.blackEye === window.__hit7.side && !' + C7 + '.dangle && window.__sfxN7.includes("scrape") && G.state === "play"', 'it hooks on again and climbs on from where it was, with a black eye'],
  ['waitUntil', 'G.L.s.box.gone && !!G.L.s.boxSplash', 6000],
  ['eval', 'AUDIO.sfx = window.__sfxO7; window.__sfxO7 = null;'],
  // the night is still to be won, the ordinary way (the thing sent back down the wall, to give the time for it)
  ['eval', '(c => { c.u = Math.max(0, 1 - Math.pow(22 / c.D0, 1 / c.gamma)); })(' + C7 + ')'],
  ['pickup', 'bulb'], ['use', 'fusebox'], ['waitUntil', '!G.L.targets.find(t => t.id === "blownfuse").hidden', 2000],
  ['use', 'blownfuse'], ['use', 'fusebox'], ['expect', 'G.L.s.fuse && !G.L.s.power', 'the new fuse, out of the toolbox before it went over the rail, goes in'],
  ['use', 'lamp'], ['expect', 'G.L.s.bulb && G.L.s.power', 'the bulb in: the lamp is lit'],
  ...crank,
  ['expect', C7 + '.blackEye === window.__hit7.side && G.L.text.win === "It fell, and you haven\'t seen it again."', 'won by the light, as ever, the black eye on it all the way down'],
  ['waitUntil', 'G.state === "survived" && UI.overlay.textContent.includes("It fell")', 12000],
  ['eval', 'restartLevel()'], ['wait', 300],
];
const blownStillIn = [
  ['use', 'lamp'], ['expect', 'G.hand.reach && G.hand.reach.target.id === "lamp"', 'nothing in hand: the hand goes to the lamp'],
  ['waitUntil', 'G.L.s.jig !== undefined && !G.hand.reach', 3000],
  ['use', 'fusebox'], ['expect', 'G.L.s.open && G.L.s.blownIn && G.hand.reach && G.hand.reach.style === "pull"', 'fuse box open, the blown fuse still in it: the hand pulls its door'],
  ['waitUntil', 'G.L.s.creaked && G.L.t - G.L.s.openAt > 0.4 && !G.hand.reach', 3000],
  ['expect', '!G.L.items.some(i => i.id !== "fuse" && /fuse/i.test(i.id + i.name))', 'no other fuse lies about: only the new one in the toolbox'],
  ['pickup', 'bulb'], ['face', 2], ['click', 'fusedoor'], ['expect', said('The blown fuse is still in it.') + ' && G.L.s.blownIn', 'the bulb with the blown fuse still in'],
  ...comesBack('bulb', 'the bulb at the clips with the blown fuse still in'),
  ['use', 'toolbox'], ['expect', clickOffFuse, 'the open toolbox clicked where the fuse in it is not'], ...comesBack('bulb', 'the toolbox open already'),
  ['pickup', 'fuse'], ['expect', toolboxFree, 'the fuse out of it, the toolbox itself lies there to be taken'],
  ['face', 2], ['click', 'fusedoor'], ['expect', said('The blown fuse is still in it.') + ' && G.L.s.blownIn && !G.L.s.fuse', 'the new fuse with the blown one still in'],
  ...comesBack('fuse', 'the new fuse at the clips with the blown one still in'),
  // without the new one: the blown fuse taken out and pushed back is the one tried
  ['eval', 'G.removeFromInv(G.inv.find(i => i.id === "fuse"))'],
  ['use', 'blownfuse'], ['face', 2], ['click', 'fusedoor'],
  ['expect', said('That is the one that blew.') + ' && G.fumbling && G.fumbling.it.id === "blownfuse"', 'the blown fuse in hand is the one tried'],
  ...dropsOut('blownfuse', 'the blown fuse pushed back in'),
  ['eval', 'restartLevel()'], ['wait', 300],
];
// Lightning (WEATHER.strike brings it on now), and a second or few later its thunder: as the thunder sounds the view lifts
// plainly toward a cold blue-white, flickering with it (L.overlay, laid over the view). Its lift (L.thunderLift) is
// there from the start of the sound, dips, peaks with the crack in it (0.34: over black, the view comes up that far toward
// white), dips again and comes a third time, dying away by 2.4 s. With reduced flashing it is one soft swell with no
// flicker, at most 0.1. The thing waits meanwhile.
const lifted = (tau, calm) => '(() => { const s = G.L.s, was = s.thunderT, rf = SAVE.data.settings.reducedFlash, cv = document.createElement("canvas"), x = cv.getContext("2d"); cv.width = cv.height = 8;' +
  ' x.fillStyle = "#000"; x.fillRect(0, 0, 8, 8); s.thunderT = G.t - ' + tau + '; SAVE.data.settings.reducedFlash = ' + calm + '; G.L.overlay(x, 8, 8); s.thunderT = was; SAVE.data.settings.reducedFlash = rf;' +
  ' return x.getImageData(4, 4, 1, 1).data[2] / 255; })()';
const curve = calm => 'Array.from({ length: 130 }, (_, i) => G.L.thunderLift(i / 50, ' + calm + '))';
const thunder = [
  ['eval', '(c => { window.__held7 = c.hold; if (c.hold === null) c.hold = c.dist; })(G.L.creature)'],
  ['eval', 'window.__thunder = []; if (!window.__sfx7) { window.__sfx7 = AUDIO.sfx; AUDIO.sfx = (n, ...r) => { if (n === "thunder") window.__thunder.push(G.t); return window.__sfx7(n, ...r); }; } WEATHER.strike();'],
  ['waitUntil', 'window.__thunder.length > 0', 7000],
  ['expect', 'G.L.s.thunderT === window.__thunder[0] && G.L.thunderLift(G.t - G.L.s.thunderT, SAVE.data.settings.reducedFlash) > 0', 'the thunder sounds, and the view is lifted with it'],
  ['expect', '(k => k.slice(1, 4).some(v => v > 0.15) && Math.max(...k) > 0.3 && Math.max(...k) <= 0.36 && k.indexOf(Math.max(...k)) >= 12 && k.indexOf(Math.max(...k)) <= 18 && k[7] < k[2] * 0.5 && k[22] < k[14] * 0.4 && k[25] > k[14] * 0.6 && k[60] > 0.02 && k[125] < 0.001)(' + curve(false) + ')',
    'the lift flickers in at once with the rumble, dips, comes again strongest with the crack (0.24-0.36 s, over 0.3 and never past 0.36), dips, comes a third time and hangs, and is gone by 2.4 s'],
  ['expect', lifted(0.3, false) + ' > 0.22 && ' + lifted(0.3, false) + ' <= 0.36 && ' + lifted(2.5, false) + ' === 0', 'laid over the view it lifts black plainly toward blue-white, and then not at all'],
  ['expect', '(k => { const m = k.indexOf(Math.max(...k)); return Math.max(...k) <= 0.1 && Math.max(...k) > 0.06 && k.every((v, i) => i === 0 || (i <= m ? v >= k[i - 1] : v <= k[i - 1])); })(' + curve(true) + ')',
    'with reduced flashing it is one soft swell, no flicker in it, at most 0.1'],
  ['expect', lifted(0.3, true) + ' <= 0.11', 'and laid over the view, with reduced flashing, black comes up no further than that'],
  ['eval', '(c => { if (window.__held7 === null) c.hold = null; })(G.L.creature)'],
];
module.exports = {
  nightmare: town.concat(thunder, blownStillIn, toolboxDrop, [
    ['pickup', 'bulb'],
    ['use', 'fusebox'], ['expect', 'G.L.s.open && G.L.s.blownIn && (G.L.targets.find(t => t.id === "blownfuse").hidden || G.L.t >= G.L.s.openAt + 0.2)', 'fuse box open, the blown fuse still in it (to point at once the door has swung)'],
    ['waitUntil', '!G.L.targets.find(t => t.id === "blownfuse").hidden', 2000],
    ['use', 'blownfuse'], ['expect', '!G.L.s.blownIn && G.inv.some(i => i.id === "blownfuse" && i.decoy) && G.inv[G.active].id === "blownfuse"', 'the blown fuse is out, in hand and worn'],
    ['click', 'fusedoor'], ['expect', said('That is the one that blew.'), 'the open door is the fuse box, and the fuse in hand is the one that blew'],
    ...dropsOut('blownfuse', 'the blown fuse pushed back in'),
    hold('bulb'), ['use', 'fusebox'], ['expect', said('The fuse holder is empty.'), 'with the bulb in hand the holder is only empty'],
    ...comesBack('bulb', 'the bulb at the empty clips'),
    ['use', 'lamp'], ['expect', 'G.L.s.bulb && !G.L.s.power', 'bulb in, but no power yet'],
    ['use', 'toolbox'], ['expect', 'G.L.targets.find(t => t.id === "toolbox").open', 'the toolbox is open'],
    ['pickup', 'fuse'],
    ['use', 'winder'], ['waitUntil', 'G.L.s.lensA > 0.12 && !G.L.s.turning', 2000],   // a turn before the lamp is lit: the lamp goes round a little with it, dark
    ['use', 'fusebox'], ['expect', 'G.L.s.fuse && G.L.s.power', 'new fuse in, the lamp is lit']]).concat(crank, [
    ['expect', '!G.L.creature.blackEye && !G.L.creature.dangle && !G.L.s.boxHit', 'won without the toolbox: no black eye on it']]),
};
