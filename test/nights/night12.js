// The Bedroom: bulb from the drawer into the lamp, the switch (three clicks on Nightmare, the cord first on Hard),
// then hold the covers up. The lamp is switched back on if it has gone out before the covers are up.
const relight = ['waitUntil', "G.L.won ? true : (!G.L.s.lampOn && G.L.s.fitted && G.L.s.plugged ? (useTarget(G.L.targets.find(t => t.id === 'lamp')), false) : false)", 20000];
const lamp = [['use', 'drawer'], ['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on']];
module.exports = {
  normal: lamp.concat([['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], relight, ['expect', 'G.L.won', 'won']]),
  hard: [['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in']].concat(lamp, [['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], relight, ['expect', 'G.L.won', 'won']]),
  // Nightmare charges 3.5x speed for every second spent looking away, so the harness faces each thing directly instead of sweeping
  nightmare: [['face', 5, true], ['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in'], ['face', 1, true], ['use', 'drawer'], ['face', 2, false], ['pickup', 'bulb'], ['face', 1, false], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on'], ['face', 4, false], ['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], relight, ['expect', 'G.L.won', 'won']],
};
