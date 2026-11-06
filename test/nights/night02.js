// The Road: it stalled in drive. The house keys (red caps) are refused by the ignition; the car keys (green head) go in,
// but the key does nothing until the gearstick is in park. Turn the key until it catches, then the stick goes to reverse
// (always away from it) or, with it on a verge, drive past it; the gas pedal takes the car off down the road, and the
// whole world slides past until the night fades out. In park the gas only revs.
module.exports = {
  nightmare: [['pickup', 'housekeys'], ['use', 'ignition'], ['expect', '!G.L.s.keyIn', 'house keys refused'], ['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'],
    ['use', 'ignition'], ['expect', "G.L.s.cranks === 0 && G.L.s.gear === 'D'", 'in drive the key does nothing'], ['use', 'gear'], ['expect', "G.L.s.gear === 'P'", 'into park'],
    ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6], ['expect', 'G.L.s.started', 'engine started'],
    ['use', 'gas'], ['expect', "!G.L.s.gone && G.L.s.gear === 'P' && G.state === 'play'", 'in park the gas only revs'],
    ['branch', 'G.L.creature.lane.idx === 0',
      [['clickUntil', 'gear', "G.L.s.gear === 'R'", 200, 3], ['expect', "G.L.s.gear === 'R'", 'it is in the road: into reverse']],
      [['clickUntil', 'gear', "G.L.s.gear === 'D'", 200, 3], ['expect', "G.L.s.gear === 'D'", 'it is on a verge: into drive, to go past it']]],
    ['use', 'gas'], ['waitUntil', 'G.L.won', 2000], ['eval', 'window.__gap = () => { const p = G.L.creature.pos(), e = G.L.eye || { x: 0, z: 0 }; return Math.hypot(p.x - e.x, p.z - e.z); }; window.__d0 = window.__gap()'],
    ['expect', 'G.L.s.gone && G.L.s.dir === (G.L.creature.lane.idx === 0 ? -1 : 1)', 'the car pulls away the way it was put in gear'],
    ['waitUntil', 'G.L.eye && Math.abs(G.L.eye.z) > 25', 6000],
    ['branch', 'G.L.s.dir < 0',
      [['expect', 'window.__gap() > window.__d0', 'backing away: the road slides away and it falls behind']],
      [['expect', '(() => { const p = G.L.creature.pos(); return Math.abs(p.x - 0.4) > 3 || p.z < G.L.eye.z; })()', 'driving on: it is off the road or behind the car']]]],
};
