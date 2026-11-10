// The Road: it stalled in drive. With nothing in hand the ignition is felt for with the empty hand. The house keys (red
// caps) are tried at the keyhole, will not go in, and drop to the floor at your feet, where looking down finds them and a
// click takes them again; the car keys (green head) go in. The gas with the engine dead only goes down under your foot.
// The key does nothing until the gearstick is in park: the hand takes it and it strains a few degrees and goes back; the
// hand takes the stick's knob to move it. Turn the key until it catches, then the stick goes to reverse
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
  ['expect', "G.deathScreen.text === G.L.text.death.drove && !/second/.test(G.deathScreen.text)", 'the card says what happened, and nothing the gearstick said (and no count of the seconds)'],
  ['eval', 'G.attempt = __att0 - 1; restartLevel()'],   // the attempt number feeds the layout: the same night again
  ['expect', "G.state === 'play' && !G.L.s.started && !G.L.s.keyIn && G.L.s.gear === 'D' && !G.L.eye && __layout() === __lay0", 'the same night again, from the start'],
];
// where it comes from for the real run: the road on a multiple of 3, else the verge it chose (the right one if it chose the road)
const lane = ['eval', '(() => { const c = G.L.creature, k = G.runSeed % 3 === 0 ? 0 : (c.lane.idx || 1); c.retarget(k); G.L.lane = c.lane; G.L.laneIdx = k; })()'];
const reverse = [['clickUntil', 'gear', "G.L.s.gear === 'R'", 200, 3], ['expect', "G.L.s.gear === 'R'", 'into reverse']];
const forward = [['clickUntil', 'gear', "G.L.s.gear === 'D'", 200, 3], ['expect', "G.L.s.gear === 'D' && G.L.creature.lane.idx !== 0", 'it is on a verge: into drive, to go past it']];
module.exports = {
  nightmare: [...drove, lane,
    ['face', 0, false], ['click', 'ignition'],
    ['expect', "G.hand.reach && G.hand.reach.target.id === 'ignition' && !G.fumbling && G.lastToast.msg === 'There is no key in the ignition.'", 'nothing in hand: the hand goes to the lock and finds no key in it'],
    ['pickup', 'housekeys'], ['use', 'ignition'],
    ['expect', "!G.L.s.keyIn && !G.hasItem('housekeys') && G.fumbling && G.fumbling.preset === 'bump' && !!G.fumbling.tip", 'house keys refused: tried at the keyhole blade first, and out of the hand'],
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
    // the stick at the edge of the view, looking down from the wheel: the hand still goes to the knob where it is drawn
    ['face', 0, true], ['click', 'gear'],
    ['expect', "G.L.s.gear === 'P' && G.hand.reach && G.hand.reach.target.id === 'gear' && G.hand.reach.style === 'pull' && (() => { const a = G.hand.reach.at, q = R.screenPos(a.x, a.y, a.z), h = R.hits.find(h => h.kind === 'target' && h.ref.id === 'gear'); return !!q && !!h && q.x > h.x && q.x < h.x + h.w && q.y > h.y && q.y < h.y + h.h * 0.4; })()", 'into park: the hand takes the knob, where it is drawn, and pulls it over'],
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
