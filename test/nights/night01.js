// The Field: the hammer and the nails, a try of the rotten plank (it will not go up), the six loose planks (they stack
// in one slot), then the doorway it is coming for, three planks. It runs round the house to the other doorway, at about
// the distance it was; turn round and board that one too, and it is held there.
const DOOR = ['door', 'frontdoor'], DIR = [0, 4];
const target = id => "G.L.targets.find(t => t.id === '" + id + "')";
const board = k => [['face', DIR[k]], ['click', DOOR[k]], ['wait', 150], ['click', DOOR[k]], ['wait', 150], ['click', DOOR[k]], ['wait', 150],
  ['expect', target(DOOR[k]) + '.done && ' + target(DOOR[k]) + '.count === 3', DOOR[k] + ' boarded up with three planks']];
const tryRotten = k => [['face', DIR[k]], ['click', DOOR[k]], ['wait', 150],
  ['expect', target(DOOR[k]) + ".count === 0 && G.hasItem('rotten') && /rotten/i.test(G.lastToast.msg)", 'the rotten plank will not go up on the ' + DOOR[k]]];
const planks = n => Array.from({ length: n }, () => ['pickup', 'planks']).concat([['expect', "G.inv.filter(i => i.id === 'planks').length === 1 && G.inv.find(i => i.id === 'planks').uses === " + n, n + ' planks in one pile']]);
const both = k => board(k).concat([
  ['expect', '!G.L.won && G.L.s.ran && G.L.s.ranFrom.lane === ' + k, 'not won yet: it is running round the house'],
  ['waitUntil', 'G.L.creature.lane.idx === ' + (1 - k), 4000],
  ['expect', 'G.state === "play" && Math.abs(G.L.creature.dist - Math.max(G.L.s.ranFrom.dist, G.L.lane.barrierDist + 10)) < 4', 'it came round to the other doorway at about the same distance'],
], board(1 - k), [['expect', 'G.L.won', 'both doorways boarded: it is held']]);
module.exports = {
  nightmare: [['pickup', 'hammer'], ['pickup', 'nails'], ['pickup', 'rotten'],
    ['branch', 'G.L.lane.idx === 0', tryRotten(0), tryRotten(1)]].concat(planks(6), [
    ['branch', 'G.L.lane.idx === 0', both(0), both(1)]]),
};
