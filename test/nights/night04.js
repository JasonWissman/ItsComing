// The Quarry: chain the gate it comes for, wait for it to close, padlock it (on Nightmare with its key,
// and both gates, where the watcher is held still because the harness spends its unseen budget scanning).
const lock = id => [['use', id], ['waitUntil', "G.L.targets.find(t => t.id === '" + id + "').closing <= 0", 3000], ['use', id], ['expect', "G.L.targets.find(t => t.id === '" + id + "').locked", id + ' locked']];
module.exports = {
  nightmare: [['eval', 'G.L.creature.hold = G.L.creature.dist;'], ['pickup', 'chain'], ['pickup', 'padlock'], ['pickup', 'gatekey']].concat(lock('gate'), lock('backgate'), [['eval', 'G.L.creature.hold = null;']]),
};
