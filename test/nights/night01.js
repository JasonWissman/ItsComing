// The Field: hammer (and nails on the harder tiers), planks, board up the door it comes for.
// On Nightmare the front door stands open and must be shut first, and five planks means both piles.
const board = (id, n) => [['use', id, n, 200], ['expect', "G.L.targets.find(t => t.id === '" + id + "').done", id + ' boarded up']];
module.exports = {
  normal: [['pickup', 'hammer'], ['pickup', 'planks'], ['branch', 'G.L.lane.idx === 0', board('door', 3), board('frontdoor', 3)]],
  hard: [['pickup', 'hammer'], ['pickup', 'nails'], ['pickup', 'planks'], ['branch', 'G.L.lane.idx === 0', board('door', 4), board('frontdoor', 4)]],
  nightmare: [['pickup', 'hammer'], ['pickup', 'nails'], ['pickup', 'planks'], ['pickup', 'planks'], ['expect', 'G.inv.filter(i => i.id === "planks").reduce((n, i) => n + i.uses, 0) >= 5', 'both piles in hand'], ['branch', 'G.L.lane.idx === 0', board('door', 5), [['use', 'frontdoor'], ['waitUntil', 'G.L.s.frontClosing <= 0 && !G.L.s.frontOpen', 3000]].concat(board('frontdoor', 5))]],
};
