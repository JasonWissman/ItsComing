// The Road: it stalled in drive. With nothing in hand the ignition is felt for with the empty hand. The house keys (red
// caps) are tried at the keyhole, will not go in, and drop to the floor at your feet, where looking down finds them and a
// click takes them again; trying them does not bring the thing on any faster. The car keys (green head) go in. The gas
// with the engine dead only goes down under your foot. The key does nothing until the gearstick is in park: the hand takes
// it and it strains a few degrees and goes back; the hand takes the stick's knob to move it. Turn the key until it
// catches, then the stick goes to reverse or drive, whichever way it is not in the road; the gas pedal takes the car off
// down the road, and the whole world slides past until the night fades out. In park, or in neutral (the stick goes round
// park, reverse, neutral, drive), the gas only revs.
//
// First, with it put in the road 12 m off and the car already running in drive, the gas: the car leaps at it, it comes down
// the road at the car and up over the hood, and the card says only that (not the last thing the gearstick said). Then the
// same in reverse with it in the road behind: the car backs into it and it comes through the back window. Then the same
// layout from the start, and it is sent round the car: it runs flat out round to the road behind, side-on. Then the same
// layout again from the start for the real run, where it goes round on its own; for the way out it is set down by the
// seed, so seeds 1-4 between them take every case: one more than a multiple of 4 on a verge ahead (drive past it), two
// more in the road behind (drive away from it), three more beside the car (reverse), a multiple of 4 in the road ahead
// (reverse).
const again = ['eval', 'G.attempt = __att0 - 1; delete G.lastLane.road; restartLevel()'];   // the attempt number feeds the layout (and a retry avoids its last way in): the same night again
const fresh = ['expect', "G.state === 'play' && !G.L.s.started && !G.L.s.keyIn && G.L.s.gear === 'D' && !G.L.eye && __layout() === __lay0", 'the same night again, from the start'];
const drove = [
  ['eval', "window.__layout = () => G.L.items.map(i => i.id + i.x.toFixed(2) + i.z.toFixed(2)).join() + ':' + G.L.creature.lane.idx; window.__lay0 = __layout(); window.__att0 = G.attempt"],
  ['eval', "(() => { G.L.s.roam.put(0, 12); Object.assign(G.L.s, { keyIn: true, started: true, gear: 'D' }); })()"],
  ['face', 0, true], ['eval', "G.toast('Drive.')"], ['click', 'gas'],
  ['expect', "G.state === 'play' && G.L.s.ram && !G.L.s.gone && G.L.eye && G.L.eye.z > 0 && G.cam.tPitch === 0", 'in drive with it in the road, the car leaps at it, and you look up at the road'],
  ['waitUntil', "G.state === 'dying'", 3000],
  ['expect', "G.deathCause === 'drove' && G.L.creature.lungeFrom < 3 && Math.abs(G.L.creature.dist - Math.hypot(G.L.creature.pos().x - G.L.eye.x, G.L.creature.pos().z - G.L.eye.z)) < 0.05", 'it came up over the hood: the lunge starts at the car, where the car is now'],
  ['waitUntil', "G.state === 'dead'", 4000],
  ['expect', "G.deathScreen.text === G.L.text.death.drove && !/second/.test(G.deathScreen.text)", 'the card says what happened, and nothing the gearstick said (and no count of the seconds)'],
  again, fresh,
  ['eval', "(() => { G.L.s.roam.put(Math.PI, 12); Object.assign(G.L.s, { keyIn: true, started: true, gear: 'R' }); })()"],
  ['face', 0, true], ['click', 'gas'],
  ['expect', "G.state === 'play' && G.L.s.ram && G.L.eye && G.L.eye.z < 0 && Math.abs(wrapPi(G.cam.tYaw - Math.PI)) < 0.1", 'in reverse with it in the road behind, the car leaps back at it, and you look round at it'],
  ['waitUntil', "G.state === 'dead'", 6000],
  ['expect', "G.deathCause === 'reversed' && G.deathScreen.text === G.L.text.death.reversed && /back window/.test(G.deathScreen.text)", 'it came through the back window'],
  again, fresh,
  // sent round the car (held where it is, so only its going round is seen): flat out, side-on, to the road behind
  ['eval', "(() => { const c = G.L.creature; G.L.s.roam.put(0, 30); c.frozen = true; Object.assign(G.L.s.roam, { circleU: 0, circleTo: 'back' }); window.__ran = false; window.__seen = []; })()"],
  ['waitUntil', "(window.__ran = window.__ran || G.L.creature.runPose, __seen.push(Math.round(G.L.s.roam.b / DEG)), !G.L.s.roam.rem && Math.abs(wrapPi(G.L.s.roam.b)) > 175 * DEG)", 9000],
  ['expect', "__ran && !G.L.creature.runPose && Math.abs(G.L.creature.dist - 30) < 0.01 && __seen.some(b => Math.abs(Math.abs(b) - 90) < 30) && Math.abs(wrapPi(G.L.creature.yaw - Math.PI)) < 0.1", 'it ran round the car, side-on, past one side, to the road behind, and stopped there'],
  again, fresh,
];
// where it is for the way out, by the seed: on a verge ahead, in the road behind, beside the car, in the road ahead
const place = ['eval', '(() => { const c = G.L.creature, k = G.runSeed % 4; G.L.s.roam.put([0, 11 * DEG * (c.lane.deg < 0 ? -1 : 1), Math.PI, (G.runSeed % 8 === 3 ? -1 : 1) * Math.PI / 2][k], Math.max(8, Math.min(c.dist, 30))); })()'];
const reverse = [['clickUntil', 'gear', "G.L.s.gear === 'R'", 200, 3], ['expect', "G.L.s.gear === 'R' && Math.abs(wrapPi(G.L.s.roam.b - Math.PI)) > 6 * DEG", 'it is not in the road behind: into reverse']];
const forward = [['clickUntil', 'gear', "G.L.s.gear === 'D'", 200, 3], ['expect', "G.L.s.gear === 'D' && Math.abs(wrapPi(G.L.s.roam.b)) > 6 * DEG", 'it is not in the road ahead: into drive']];
module.exports = {
  nightmare: [...drove,
    ['face', 0, false], ['click', 'ignition'],
    ['expect', "G.hand.reach && G.hand.reach.target.id === 'ignition' && !G.fumbling && G.lastToast.msg === 'There is no key in the ignition.'", 'nothing in hand: the hand goes to the lock and finds no key in it'],
    ['pickup', 'housekeys'],
    ['eval', '(() => { const c = G.L.creature; c.hold = c.dist; window.__u = c.u; })()'],   // held where it is, so any hurry the keys gave it would show
    ['use', 'ignition'],
    ['expect', "!G.L.s.keyIn && !G.hasItem('housekeys') && G.fumbling && G.fumbling.preset === 'bump' && !!G.fumbling.tip", 'house keys refused: tried at the keyhole blade first, and out of the hand'],
    ['expect', 'G.L.creature.u === window.__u', 'and trying them did not bring it on any nearer'],
    ['eval', 'G.L.creature.hold = null'],
    ['eval', 'window.__hk = G.fumbling.it'],
    ['click', 'ignition'], ['expect', "!G.L.s.keyIn && G.lastToast.msg === 'House keys. Not these.' && G.fumbling && G.fumbling.it === window.__hk && !G.hand.reach", 'clicked again while they are at the lock: nothing more'],
    ['waitUntil', '!G.fumbling && !window.__hk.taken', 4000],
    ['expect', '(k => k.y === G.L.floor.y && k.z > 0.1 && k.z < 0.42 && Math.abs(k.x) < 0.35)(window.__hk)', 'they dropped to the floor at your feet'],
    ['face', 0, true],
    ['expect', "(() => { const it = window.__hk, h = [...R.hits].reverse().find(r => r.kind === 'item' && r.ref === it); if (!h || h.w < 6 || h.h < 4) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2; updateHover(); const ok = !!G.hover && G.hover.ref === it; G.mouse.x = -1; return ok; })()", 'looking down they lie in sight, and a click there takes them'],
    ['pickup', 'keys'],
    // the ignition is in the dash beside the dials: in view looking straight ahead at the wheel, and the key goes in from there
    ['face', 0, false], ['expect', "(() => { const h = R.hits.find(h => h.kind === 'target' && h.ref.id === 'ignition'); return !!h && h.x >= 0 && h.y >= 0 && h.x + h.w <= R.W && h.y + h.h <= R.H; })()", 'looking straight ahead at the wheel, the ignition is in view'],
    ['use', 'ignition'], ['expect', 'G.L.s.keyIn && G.cam.dirIdx === 0 && G.cam.pitch < 0.1', 'key inserted, looking ahead'],
    ['use', 'gas'], ['expect', "!G.L.s.started && !G.L.s.gone && G.L.s.dead && G.state === 'play'", 'the gas with the engine dead: the pedal goes down under your foot, and nothing'],
    ['face', 0, false], ['click', 'ignition'], ['expect', "G.L.s.cranks === 0 && G.L.s.gear === 'D' && G.hand.reach && G.hand.reach.style === 'rattle'", 'in drive the key does nothing: the hand takes it'],
    ['waitUntil', 'G.L.s.keyAng > 8 * DEG', 1500], ['waitUntil', 'G.L.s.keyAng < 1 * DEG && !G.hand.reach', 2000],
    ['expect', 'G.L.s.cranks === 0 && !G.L.s.started', 'it strained a few degrees and went back, and the engine never turned'],
    // the plate at the edge of the view, looking down from the wheel: a click on it moves the stick, the hand going to the
    // knob. Then, looking down at the console, the knob is where the hand went: at the top of the stick as it is drawn
    // (the stick's own hit area, rising out of the plate lying flat on the console), and the plate lies flat under it
    ['face', 0, true], ['click', 'gear'],
    ['expect', "G.L.s.gear === 'P' && G.hand.reach && G.hand.reach.target.id === 'gear' && G.hand.reach.style === 'pull'", 'into park from the plate at the edge of the view: the hand takes the knob and pulls it over'],
    ['expect', "(async () => { const a = G.hand.reach && G.hand.reach.at; if (!a) return false; G.cam.dirIdx = 1; G.cam.yaw = G.cam.tYaw = 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); " +
      "const q = R.screenPos(a.x, a.y, a.z), hs = R.hits.filter(h => h.kind === 'target' && h.ref.id === 'gear' && h.poly && h.poly.length === 4); if (!q || hs.length !== 2) return false; " +
      "const top = h => Math.min(...h.poly.map(p => p[1])), bot = h => Math.max(...h.poly.map(p => p[1])), [stick, plate] = hs.slice().sort((x, y) => top(x) - top(y)), y = q.y + R.viewY; " +
      "return inPoly(q.x, y, stick.poly) && y < top(stick) + (bot(stick) - top(stick)) * 0.4 && !inPoly(q.x, y, plate.poly) && bot(plate) > bot(stick); })()", 'the hand is on the knob, up at the top of the stick where it is drawn, over the plate lying flat on the console'],
    ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6], ['expect', 'G.L.s.started', 'engine started'],
    ['use', 'gas'], ['expect', "!G.L.s.gone && G.L.s.gear === 'P' && G.state === 'play'", 'in park the gas only revs'],
    // the stick goes round P R N D: neutral is a place of its own on the plate, and in it the engine runs and the car stays put
    ['clickUntil', 'gear', "G.L.s.gear === 'N'", 200, 3],
    ['use', 'gas'], ['expect', "!G.L.s.gone && G.L.s.started && G.L.s.gear === 'N' && G.state === 'play' && !G.L.eye", 'into neutral (by way of reverse): the gas only revs, the car does not move'],
    place, ['branch', 'G.runSeed % 4 === 1 || G.runSeed % 4 === 2', forward, reverse],
    ['use', 'gas'], ['expect', 'G.L.won', 'the gas, in gear: away at once'],
    ['eval', 'window.__gap = () => { const p = G.L.creature.pos(), e = G.L.eye || { x: 0, z: 0 }; return Math.hypot(p.x - e.x, p.z - e.z); }; window.__d0 = window.__gap()'],
    ['expect', "G.L.s.gone && G.L.s.dir === (G.L.s.gear === 'R' ? -1 : 1)", 'the car pulls away the way it was put in gear'],
    ['waitUntil', 'G.L.eye && Math.abs(G.L.eye.z) > 25', 6000],
    ['expect', 'Math.abs(G.L.creature.dist - window.__gap()) < 1', 'how far it is goes by the car as it is now'],
    ['branch', 'G.L.s.dir < 0',
      [['expect', 'window.__gap() > window.__d0', 'backing away: the road slides away and it falls behind']],
      [['expect', '(() => { const p = G.L.creature.pos(); return Math.abs(p.x - 0.4) > 3 || p.z < G.L.eye.z; })()', 'driving on: it is off the road or behind the car']]],
    ['expect', "G.state === 'won' && G.L.text.win === 'You drove off and did not look back.'", 'the night ends: You drove off and did not look back.']],
};
