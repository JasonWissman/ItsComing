// The Field: the hammer and the nails, a try of the rotten plank (it will not go up), the six loose planks (they stack
// in one slot), then the doorway it is coming for, three planks. It runs round the house to the other doorway, at about
// the distance it was; turn round and board that one too, and it is held there. On even seeds it is let come to 15 m
// first, and the second doorway goes up at once, while it is still going round: it comes round to that doorway anyway,
// and on to its boards. Either way, once the last board is up it runs at that doorway and hits the boards before the
// night fades, stoops to look in through the gap and pounds on them, and the boards stay up.
const DOOR = ['door', 'frontdoor'], DIR = [0, 4];
const target = id => "G.L.targets.find(t => t.id === '" + id + "')";
const board = k => [['face', DIR[k]], ['click', DOOR[k]], ['wait', 150], ['click', DOOR[k]], ['wait', 150], ['click', DOOR[k]], ['wait', 150],
  ['expect', target(DOOR[k]) + '.done && ' + target(DOOR[k]) + '.count === 3', DOOR[k] + ' boarded up with three planks']];
const tryRotten = k => [['face', DIR[k]], ['click', DOOR[k]], ['wait', 150],
  ['expect', target(DOOR[k]) + ".count === 0 && G.hasItem('rotten') && /rotten/i.test(G.lastToast.msg)", 'the rotten plank will not go up on the ' + DOOR[k]]];
const planks = n => Array.from({ length: n }, () => ['pickup', 'planks']).concat([['expect', "G.inv.filter(i => i.id === 'planks').length === 1 && G.inv.find(i => i.id === 'planks').uses === " + n, n + ' planks in one pile']]);
const running = k => ['expect', '!G.L.won && G.L.s.ran && G.L.s.ranFrom.lane === ' + k, 'not won yet: it is running round the house'];
// after the last board: it charges the doorway it was coming for and is at its boards, and pounding on them, while the
// night is still in view
const resolves = k => [
  ['waitUntil', 'G.L.s.hitAt !== undefined', 5000],
  ['expect', 'G.fadeTarget < 1 && G.L.creature.lane.idx === ' + k + ' && Math.abs(G.L.creature.dist - G.L.lanes[' + k + '].barrierDist) < 0.05', 'it ran at the boards and was stopped there, before the fade'],
  ['waitUntil', '(G.L.s.bangs || 0) >= 2 && G.L.creature.peer >= 1', 3000],
  ['expect', 'G.fadeTarget < 1 && ' + DOOR.map(id => target(id) + '.done && ' + target(id) + '.count === 3').join(' && '), 'it stooped to the gap and pounded on them, and every board held, before the fade'],
];
const both = k => board(k).concat([
  running(k),
  ['waitUntil', 'G.L.creature.lane.idx === ' + (1 - k), 4000],
  ['expect', 'G.state === "play" && Math.abs(G.L.creature.dist - Math.max(G.L.s.ranFrom.dist, G.L.lane.barrierDist + 10)) < 4', 'it came round to the other doorway at about the same distance'],
], board(1 - k), [['expect', 'G.L.won', 'both doorways boarded: it is held']], resolves(1 - k));
const quick = k => [['eval', 'G.L.creature.u = 1 - 15 / G.L.creature.D0']].concat(board(k), [running(k)], board(1 - k), [
  ['expect', 'G.L.won && G.L.s.cutShort', 'both doorways boarded while it was still going round: won'],
  ['waitUntil', '!G.L.s.run && !G.L.creature.runPose && G.L.creature.lane.idx === ' + (1 - k) + ' && Math.abs(G.L.creature.dist - G.L.lanes[' + (1 - k) + '].barrierDist) < 0.05', 5000],
], resolves(1 - k));
module.exports = {
  nightmare: [['pickup', 'hammer'], ['pickup', 'nails'], ['pickup', 'rotten'],
    ['branch', 'G.L.lane.idx === 0', tryRotten(0), tryRotten(1)]].concat(planks(6), [
    ['branch', 'G.seed % 2 === 0',
      [['branch', 'G.L.lane.idx === 0', quick(0), quick(1)]],
      [['branch', 'G.L.lane.idx === 0', both(0), both(1)]]]]),
};
