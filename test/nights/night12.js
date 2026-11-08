// The Bedroom: bulb from the drawer into the lamp, the switch (on Nightmare the cord first, and three clicks),
// then hold the covers up. The lamp is switched back on if it has gone out before the covers are up. Then the covers
// come up over your eyes and it plays out under them: it comes to the bed and pulls at them three times, and they hold.
// First, the mattress's top is one piece drawn before the covers, so no part of it is drawn over them as they come up.
const relight = ['waitUntil', "G.L.won ? true : (!G.L.s.lampOn && G.L.s.fitted && G.L.s.plugged ? (useTarget(G.L.targets.find(t => t.id === 'lamp')), false) : false)", 20000];
const lamp = [['use', 'drawer'], ['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on']];
const mattress = ['expect', "(() => { const m = R.statics.filter(p => p.kind === 'poly' && p.pts.length >= 3 && p.pts.every(v => Math.abs(v[1] - 0.58) < 1e-6 && Math.abs(v[0]) <= 0.751) && p.pts.some(v => v[2] > 1)); return m.length === 1 && m[0].sd > 1.62; })()", 'the mattress top is one piece, drawn before the covers'];
const under = [['waitUntil', 'G.L.s.over >= 1 && G.L.s.tugs === 3', 9000], ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'under the covers: it came to the bed and pulled at them three times, and they held']];
module.exports = {
  // Nightmare charges 3.5x speed for every second spent looking away, so the harness faces each thing directly instead of sweeping
  nightmare: [mattress, ['face', 5, true], ['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in'], ['face', 2, true], ['use', 'drawer'], ['pickup', 'bulb'], ['face', 2, false], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on'], ['face', 4, false], ['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], relight, ['expect', 'G.L.won', 'won'], ...under],
};
