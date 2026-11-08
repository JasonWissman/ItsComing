// The Barn: a bottle and a rag, fill the bottle at the oil drum, stuff the rag in, light it with the matches and throw it
// into the hay it is coming past; it runs round to the other way in, so the second bottle goes into the other stack.
// The matches are picked up once and kept. The harness carries little: one bottle and one rag at a time.
const bottle = [['pickup', 'bottle'], ['pickup', 'rag'], ['use', 'drum'], ['expect', "G.inv.some(i => i.id === 'bottle_oil')", 'bottle filled at the drum'],
  ['combine', 'bottle_oil', 'rag'], ['combine', 'cocktail', 'matches'], ['expect', "G.inv.some(i => i.id === 'cocktail_lit') && G.inv.some(i => i.id === 'matches')", 'bottle lit, matches kept']];
const into = (k, id) => [['use', id], ['waitUntil', 'G.L.s.fire[' + k + ']', 4000], ['expect', 'G.L.s.fire[' + k + ']', id + ' burning']];
module.exports = {
  nightmare: [['pickup', 'matches']].concat(bottle, [
    ['branch', 'G.L.creature.lane.idx === 0', into(0, 'hayN'), into(1, 'hayE')],
    ['expect', '!!G.L.s.run && !G.L.won', 'the fire in its way sends it round, and one fire does not hold it'],
  ], bottle, [
    ['branch', 'G.L.s.fire[0]', into(1, 'hayE'), into(0, 'hayN')],
  ]),
};
