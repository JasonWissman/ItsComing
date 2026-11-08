// The Mirror Maze: pull the dust sheets, pick up the music box and its crank (they lie in different places), try the crank
// first (nothing for it to turn) and the box on a wrong pedestal (it will not sit there, and something behind you takes
// three quick steps), then put the box on the odd mirror's pedestal, fit the crank and turn it until the tune plays; the
// doll comes out through that glass and takes the box. Like a player, it faces a mirror square on (which holds the thing
// while that glass is live) and clicks what is in front of it, rather than looking all round for each pedestal.
const ped = k => 'pedestal' + k;
const look = k => ['face', 2 * k, false];
const byOdd = f => [3, 2, 1, 0].reduce((otherwise, k) => [['branch', 'G.L.s.odd === ' + k, f(k), otherwise]], []);
const hold = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const sheets = [0, 1, 2, 3].map(k => ['branch', "G.L.targets.some(t => t.id === 'sheet" + k + "' && !t.hidden)", [look(k), ['click', 'sheet' + k], ['expect', 'G.L.s.mirrors[' + k + '].live', 'the sheet over mirror ' + k + ' pulled down']]]);
const crankFirst = k => [hold('crank'), look(k), ['click', ped(k)], ['expect', "!G.L.s.crankIn && G.L.s.placedAt < 0 && G.inv.some(i => i.id === 'crank')", 'the crank first: nothing for it to turn']];
const wrongPedestal = k => [hold('musicbox'), look((k + 1) % 4), ['click', ped((k + 1) % 4)], ['expect', "G.L.s.placedAt < 0 && G.L.s.wrongAt > 0 && G.inv.some(i => i.id === 'musicbox')", 'a wrong pedestal will not take the box, and it comes closer']];
const right = k => [
  hold('musicbox'), look(k), ['click', ped(k)], ['expect', 'G.L.s.placedAt === ' + k + " && !G.inv.some(i => i.id === 'musicbox')", 'the box on the odd mirror\'s pedestal'],
  ['click', ped(k)], ['expect', "G.L.s.crankIn && !G.inv.some(i => i.id === 'crank')", 'the crank fitted to it'],
  ['click', ped(k)], ['click', ped(k)], ['click', ped(k)], ['expect', '!G.L.won && G.L.s.turns === 3', 'three turns, a few notes each'],
  ['click', ped(k)], ['expect', 'G.L.won && G.L.s.turns === 4', 'the fourth turn plays the tune'],
];
const fetched = [['waitUntil', 'G.L.s.held && G.L.creature.lane.idx === 1 + G.L.s.odd', 8000], ['expect', 'G.L.s.held', 'it came out through the odd mirror and took the box']];
module.exports = {
  nightmare: sheets.concat([['pickup', 'musicbox'], ['pickup', 'crank']], byOdd(k => crankFirst(k).concat(wrongPedestal(k), right(k))), fetched),
};
