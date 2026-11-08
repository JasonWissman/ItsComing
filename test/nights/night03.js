// The Graveyard: the red bag looks like salt and is not; try it first, then one pour of the real salt across each way in
// (the bag holds exactly two), then hang a lantern on each hook and light it (the matches are kept).
const sel = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const tgt = id => "G.L.targets.find(t => t.id === '" + id + "')";
const salt = id => [['use', id, 1, 200], ['expect', tgt(id) + '.done', id + ' salted with one pour']];
const lantern = id => [['use', id, 2, 200], ['expect', tgt(id) + '.lit', id + ': a lantern hung and lit']];
// standing at the salt line of the way it is on: a little beyond the middle of that way's threshold, and nearer than its barrier
const atLine = "(c => { const t = G.L.targets.find(t => t.id === (c.lane.idx === 0 ? 'threshold' : 'sidethreshold')), k = c.dist - Math.hypot(t.local[0], t.local[2]); return k > 0.1 && k < 0.4 && c.dist < c.lane.barrierDist - 0.2; })(G.L.creature)";
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
    // how it ends, all before the fade: it runs in (hurried from wherever it was) and stops with its toes at the salt line
    // of its way, nearer than the way held it, looks down at the salt, turns round and walks back the way it came
    ['expect', 'G.L.won && G.L.creature.rush === 1', 'won: it runs in to the salt line'],
    ['waitUntil', "G.L.s.end && G.L.s.end.phase === 'stand' && G.fade < 0.05 && (" + atLine + ')', 5000],
    ['waitUntil', 'G.L.creature.bow > 0.95 && G.fade < 0.05', 4000],
    ['waitUntil', 'G.L.creature.turn > 0.3 && G.L.creature.turn < 1 && G.fade < 0.05', 4000],
    ['waitUntil', 'G.L.creature.away && G.L.creature.dist > G.L.s.end.at + 1 && G.fade < 0.05', 4000],
  ]),
};
