// The Road: it stalled in drive. The house keys (red caps) are refused by the ignition; the car keys (green head) go in,
// but the key does nothing until the gearstick is in park. Turn the key until it catches, then the stick goes to reverse
// (always away from it) or, with it on a verge, drive past it; the gas pedal takes the car off down the road, and the
// whole world slides past until the night fades out. In park the gas only revs.
//
// First, with it put in the road 12 m off and the car already running in drive, the gas: the car leaps at it, it comes down
// the road at the car and up over the hood, and the card says only that (not the last thing the gearstick said). Then the
// same layout again from the start. For the real run the seed picks the way out, so seeds 1-3 between them take every
// one: a multiple of 3 puts it in the road (reverse), one more puts it on a verge and backs away from it in reverse, and
// two more puts it on a verge and drives past it.
const drove = [
  ['eval', "window.__layout = () => G.L.items.map(i => i.id + i.x.toFixed(2) + i.z.toFixed(2)).join() + ':' + G.L.creature.lane.idx; window.__lay0 = __layout(); window.__att0 = G.attempt"],
  ['eval', "(() => { const c = G.L.creature; c.retarget(0); G.L.lane = c.lane; G.L.laneIdx = 0; c.u = 1 - 12 / c.D0; Object.assign(G.L.s, { keyIn: true, started: true, gear: 'D' }); })()"],
  ['face', 0, true], ['eval', "G.toast('Drive.')"], ['click', 'gas'],
  ['expect', "G.state === 'play' && G.L.s.ram && !G.L.s.gone && G.L.eye && G.L.eye.z > 0 && G.cam.tPitch === 0", 'in drive with it in the road, the car leaps at it, and you look up at the road'],
  ['waitUntil', "G.state === 'dying'", 3000],
  ['expect', "G.deathCause === 'drove' && G.L.creature.lungeFrom < 3 && Math.abs(G.L.creature.dist - Math.hypot(G.L.creature.pos().x - G.L.eye.x, G.L.creature.pos().z - G.L.eye.z)) < 0.05", 'it came up over the hood: the lunge starts at the car, where the car is now'],
  ['waitUntil', "G.state === 'dead'", 4000],
  ['expect', "/^It reached you after \\d+ seconds?\\.<br>/.test(G.deathScreen.text) && G.deathScreen.text.endsWith('<br>' + G.L.text.death.drove)", 'the card says what happened, and nothing the gearstick said'],
  ['eval', 'G.attempt = __att0 - 1; restartLevel()'],   // the attempt number feeds the layout: the same night again
  ['expect', "G.state === 'play' && !G.L.s.started && !G.L.s.keyIn && G.L.s.gear === 'D' && !G.L.eye && __layout() === __lay0", 'the same night again, from the start'],
];
// where it comes from for the real run: the road on a multiple of 3, else the verge it chose (the right one if it chose the road)
const lane = ['eval', '(() => { const c = G.L.creature, k = G.runSeed % 3 === 0 ? 0 : (c.lane.idx || 1); c.retarget(k); G.L.lane = c.lane; G.L.laneIdx = k; })()'];
const reverse = [['clickUntil', 'gear', "G.L.s.gear === 'R'", 200, 3], ['expect', "G.L.s.gear === 'R'", 'into reverse']];
const forward = [['clickUntil', 'gear', "G.L.s.gear === 'D'", 200, 3], ['expect', "G.L.s.gear === 'D' && G.L.creature.lane.idx !== 0", 'it is on a verge: into drive, to go past it']];
module.exports = {
  nightmare: [...drove, lane,
    ['pickup', 'housekeys'], ['use', 'ignition'], ['expect', '!G.L.s.keyIn', 'house keys refused'], ['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'],
    ['use', 'ignition'], ['expect', "G.L.s.cranks === 0 && G.L.s.gear === 'D'", 'in drive the key does nothing'], ['use', 'gear'], ['expect', "G.L.s.gear === 'P'", 'into park'],
    ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6], ['expect', 'G.L.s.started', 'engine started'],
    ['use', 'gas'], ['expect', "!G.L.s.gone && G.L.s.gear === 'P' && G.state === 'play'", 'in park the gas only revs'],
    ['branch', 'G.runSeed % 3 === 2', forward, reverse],
    ['use', 'gas'], ['expect', 'G.L.won', 'the gas, in gear: away at once'],
    ['eval', 'window.__gap = () => { const p = G.L.creature.pos(), e = G.L.eye || { x: 0, z: 0 }; return Math.hypot(p.x - e.x, p.z - e.z); }; window.__d0 = window.__gap()'],
    ['expect', "G.L.s.gone && G.L.s.dir === (G.L.s.gear === 'R' ? -1 : 1)", 'the car pulls away the way it was put in gear'],
    ['waitUntil', 'G.L.eye && Math.abs(G.L.eye.z) > 25', 6000],
    ['expect', 'Math.abs(G.L.creature.dist - window.__gap()) < 1', 'how far it is goes by the car as it is now'],
    ['branch', 'G.L.s.dir < 0',
      [['expect', 'window.__gap() > window.__d0', 'backing away: the road slides away and it falls behind']],
      [['expect', '(() => { const p = G.L.creature.pos(); return Math.abs(p.x - 0.4) > 3 || p.z < G.L.eye.z; })()', 'driving on: it is off the road or behind the car']]]],
};
