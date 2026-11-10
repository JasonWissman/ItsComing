// The Graveyard. First, with the thing held where it is: the empty hand brushes the bare stone of the doorway; the red bag
// looks like salt and is not: it is poured across the doorway in a line, the bag is let fall by the slab (and picked up again
// from where it lies), and the wind takes the line off the stone; the matches struck at an empty hook flare and are shaken
// out, back in the hand. Then one pour of the real salt across each way in (the bag holds exactly two; held over the salted
// doorway again it is tipped and taken back, nothing poured), and a lantern hung on each hook and lit (the matches are kept);
// the other lantern knocked against a burning one sets it swinging and comes back to the hand.
const sel = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const tgt = id => "G.L.targets.find(t => t.id === '" + id + "')";
const item = id => "G.L.items.find(i => i.id === '" + id + "')";
const salt = id => [['use', id, 1, 200], ['expect', tgt(id) + '.done', id + ' salted with one pour']];
const lantern = id => [['use', id, 2, 200], ['expect', tgt(id) + '.lit', id + ': a lantern hung and lit']];
const inHand = id => "!G.fumbling && G.hasItem('" + id + "') && G.hand.cur && G.hand.cur.id === '" + id + "'";
// standing at the salt line of the way it is on: a little beyond the middle of that way's threshold, and nearer than its barrier
const atLine = "(c => { const t = G.L.targets.find(t => t.id === (c.lane.idx === 0 ? 'threshold' : 'sidethreshold')), k = c.dist - Math.hypot(t.local[0], t.local[2]); return k > 0.1 && k < 0.4 && c.dist < c.lane.barrierDist - 0.2; })(G.L.creature)";
module.exports = {
  nightmare: [
    // the first tries are played out with the thing held where it is, so the night is solved in the time it was before
    ['eval', 'G.L.creature.hold = G.L.creature.dist'],
    ['use', 'threshold'], ['expect', 'G.hand.reach && G.hand.reach.target === ' + tgt('threshold') + ' && !G.fumbling && !' + tgt('threshold') + '.done', 'nothing in hand: the empty hand goes to the bare stone'],
    ['pickup', 'sugar'], sel('sugar'), ['use', 'threshold', 1, 200],
    ['expect', '!' + tgt('threshold') + ".done && !G.hasItem('sugar') && /sugar/i.test(G.lastToast.msg) && G.fumbling && G.fumbling.it === " + item('sugar'), 'the sugar does not salt the doorway: it leaves the hand for the stone'],
    ['waitUntil', 'G.L.s.sugars.length === 1 && G.L.s.sugars[0].t === ' + tgt('threshold') + ' && G.fumbling && G.fumbling.phase === "contact"', 3000],
    ['click', 'threshold'], ['expect', '/sugar/i.test(G.lastToast.msg) && !G.hand.reach && G.fumbling && G.fumbling.it === ' + item('sugar'), 'clicked again while it pours: nothing more is tried, its line stays'],
    ['waitUntil', '!G.fumbling && !' + item('sugar') + '.taken && ' + item('sugar') + '.y === G.L.floor.y && G.L.s.sugars.length === 1', 4000],
    ['pickup', 'sugar'],   // poured, the bag was let fall by the slab, where it is seen and taken again
    // the matches at a hook with no lantern on it: struck, it burns there a moment, finds nothing to light, and is shaken out
    ['pickup', 'matches'], ['use', 'hook', 1, 100],
    ['expect', '/empty hook/i.test(G.lastToast.msg) && !' + tgt('hook') + '.hung && G.fumbling && G.fumbling.it === ' + item('matches'), 'the matches at an empty hook: nothing to light'],
    ['waitUntil', 'G.L.s.match && G.L.s.match.pos && G.L.s.match.outAt === undefined', 3000],
    ['waitUntil', inHand('matches') + ' && !' + tgt('hook') + '.lit', 4000],
    ['eval', 'G.L.creature.hold = null'],
    ['pickup', 'salt'],
  ].concat(salt('threshold'), [
    ['expect', 'G.L.sealed(G.L.lanes[0]) && !G.L.sealed(G.L.lanes[1])', 'the salted doorway seals the path, and only the path'],
    ['waitUntil', 'G.L.s.sugars.length === 0', 5000],   // the wind has taken the sugar off the stone
    // a second pour while the bag still holds one: the salted doorway takes nothing, and the pour is left for the side gate
    sel('salt'), ['use', 'threshold', 1, 200],
    ['expect', "(G.inv.find(i => i.id === 'salt') || {}).uses === 1 && !" + tgt('sidethreshold') + '.done && !G.L.won && G.fumbling && G.fumbling.preset === "return"', 'a salted doorway takes nothing more: the bag is tipped over the line'],
    ['waitUntil', inHand('salt') + " && G.inv.find(i => i.id === 'salt').uses === 1", 3000],
  ], salt('sidethreshold'), [
    ['expect', "!G.hasItem('salt')", 'the bag of salt is used up after the two lines'],
    ['pickup', 'lantern'], ['pickup', 'lantern2'],
  ], lantern('hook'), [
    ['expect', '!G.L.won', 'one lantern is not enough'],
    // the other lantern knocked against the burning one: it swings on its hook, and the lantern comes back to the hand
    ['eval', "G.active = G.inv.findIndex(i => i.id === 'lantern' || i.id === 'lantern2')"], ['use', 'hook', 1, 100],
    ['expect', '/burning/i.test(G.lastToast.msg) && G.fumbling && /lantern/.test(G.fumbling.it.id) && !G.fumbling.drop', 'the other lantern is taken to the burning one'],
    ['waitUntil', tgt('hook') + '.swingAt !== undefined', 3000],   // it knocks against it and sets it swinging
    ['waitUntil', "!G.fumbling && G.hand.cur && /lantern/.test(G.hand.cur.id)", 3000],
  ], lantern('hookE'), [
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
