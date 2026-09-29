// The Quarry: chain the gate it comes for, wait for it to close, padlock it (with the key on the harder tiers;
// both gates on Nightmare, where the watcher is held still because the harness spends its unseen budget scanning).
const lock = id => [['use', id], ['waitUntil', "G.L.targets.find(t => t.id === '" + id + "').closing <= 0", 3000], ['use', id], ['expect', "G.L.targets.find(t => t.id === '" + id + "').locked", id + ' locked']];
module.exports = {
  normal: [['pickup', 'chain'], ['pickup', 'padlock'], ['branch', 'G.L.lane.idx === 0', lock('gate'), lock('backgate')]],
  hard: [['pickup', 'chain'], ['pickup', 'padlock'], ['pickup', 'gatekey'], ['branch', 'G.L.lane.idx === 0', lock('gate'), lock('backgate')]],
  nightmare: [['eval', 'G.L.creature.hold = G.L.creature.dist;'], ['pickup', 'chain'], ['pickup', 'padlock'], ['pickup', 'gatekey']].concat(lock('gate'), lock('backgate'), [['eval', 'G.L.creature.hold = null;']]),
};
