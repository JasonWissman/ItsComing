// The Field: hammer (and nails on the harder tiers), then every loose plank in the house (they stack in one slot),
// then board up the door it comes for. On Nightmare the front door stands open and must be shut first.
const board = (id, n) => [['use', id, n, 200], ['expect', "G.L.targets.find(t => t.id === '" + id + "').done", id + ' boarded up']];
const planks = n => Array.from({ length: n }, () => ['pickup', 'planks']).concat([['expect', "G.inv.filter(i => i.id === 'planks').length === 1 && G.inv.find(i => i.id === 'planks').uses === " + n, n + ' planks in one pile']]);
module.exports = {
  normal: [['pickup', 'hammer']].concat(planks(3), [['branch', 'G.L.lane.idx === 0', board('door', 3), board('frontdoor', 3)]]),
  hard: [['pickup', 'hammer'], ['pickup', 'nails']].concat(planks(4), [['branch', 'G.L.lane.idx === 0', board('door', 4), board('frontdoor', 4)]]),
  nightmare: [['pickup', 'hammer'], ['pickup', 'nails']].concat(planks(5), [['branch', 'G.L.lane.idx === 0', board('door', 5), [['use', 'frontdoor'], ['waitUntil', 'G.L.s.frontClosing <= 0 && !G.L.s.frontOpen', 3000]].concat(board('frontdoor', 5))]]),
};
