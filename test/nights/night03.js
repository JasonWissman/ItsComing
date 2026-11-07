// The Graveyard: the red bag looks like salt and is not; try it first, then one pour of the real salt across each way in
// (the bag holds exactly two), then hang a lantern on each hook and light it (the matches are kept).
const sel = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const tgt = id => "G.L.targets.find(t => t.id === '" + id + "')";
const salt = id => [['use', id, 1, 200], ['expect', tgt(id) + '.done', id + ' salted with one pour']];
const lantern = id => [['use', id, 2, 200], ['expect', tgt(id) + '.lit', id + ': a lantern hung and lit']];
module.exports = {
  nightmare: [
    ['pickup', 'sugar'], sel('sugar'), ['use', 'threshold', 1, 200],
    ['expect', '!' + tgt('threshold') + '.done && G.hasItem(\'sugar\') && /sugar/i.test(G.lastToast.msg)', 'the sugar does not salt the doorway'],
    ['pickup', 'salt'],
  ].concat(salt('threshold'), [
    ['expect', 'G.L.sealed(G.L.lanes[0]) && !G.L.sealed(G.L.lanes[1])', 'the salted doorway seals the path, and only the path'],
    // a second pour while the bag still holds one: the salted doorway takes nothing, and the pour is left for the side gate
    sel('salt'), ['use', 'threshold', 1, 200],
    ['expect', "(G.inv.find(i => i.id === 'salt') || {}).uses === 1 && !" + tgt('sidethreshold') + '.done && !G.L.won', 'a salted doorway takes nothing more'],
  ], salt('sidethreshold'), [
    ['expect', "!G.hasItem('salt')", 'the bag of salt is used up after the two lines'],
    ['pickup', 'lantern'], ['pickup', 'lantern2'], ['pickup', 'matches'],
  ], lantern('hook'), [['expect', '!G.L.won', 'one lantern is not enough']], lantern('hookE'), [
    ['expect', "G.hasItem('matches')", 'matches kept (tool)'],
  ]),
};
