// The Mirror Maze: pull the dust sheets, pick up the music box and its crank (they lie in different places), try the crank
// first (nothing for it to turn), then put the box on a wrong pedestal (any pedestal takes it, with no penalty), fit the
// crank there and turn it: the notes come out wrong, the crank sticks, the doll in the glass turns angry and hops at you.
// A click on the box lifts it back off with its crank still in it; on the odd mirror's pedestal it goes down crank and all,
// and turning it until the tune plays brings the doll out through that glass to take the box. Like a player, it faces a
// mirror square on (which holds the thing while that glass is live) and clicks what is in front of it, rather than looking
// all round for each pedestal.
const ped = k => 'pedestal' + k;
const look = k => ['face', 2 * k, false];
const byOdd = f => [3, 2, 1, 0].reduce((otherwise, k) => [['branch', 'G.L.s.odd === ' + k, f(k), otherwise]], []);
const hold = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const sheets = [0, 1, 2, 3].map(k => ['branch', "G.L.targets.some(t => t.id === 'sheet" + k + "' && !t.hidden)", [look(k), ['click', 'sheet' + k], ['expect', 'G.L.s.mirrors[' + k + '].live', 'the sheet over mirror ' + k + ' pulled down']]]);
const crankFirst = k => [hold('crank'), look(k), ['click', ped(k)], ['expect', "!G.L.s.crankIn && G.L.s.placedAt < 0 && G.inv.some(i => i.id === 'crank')", 'the crank first: nothing for it to turn']];
const wrongPedestal = k => {
  const w = (k + 1) % 4;
  return [
    hold('musicbox'), look(w), ['click', ped(w)],
    ['expect', 'G.L.s.placedAt === ' + w + " && !G.inv.some(i => i.id === 'musicbox') && G.L.s.wrongAt < 0 && !G.L.creature.angry", 'a wrong pedestal takes the box too, and nothing happens yet'],
    ['click', ped(w)], ['expect', "G.L.s.crankIn && !G.inv.some(i => i.id === 'crank') && !G.L.s.sour", 'the crank fits it there too'],
    ['eval', 'window._d0 = G.L.creature.dist'],
    ['click', ped(w)],
    ['expect', 'G.L.s.sour && G.L.s.wrongAt > 0 && G.L.creature.angry === 1 && G.L.s.turns === 0', 'turning it before a wrong mirror plays wrong notes and the doll in the glass is angry'],
    ['expect', '!G.L.won && (G.L.creature.dist < window._d0 - 0.05 || G.L.creature.dist <= G.L.creature.catchDist + 1.51)', 'and it hops closer'],
    ['click', ped(w)],
    ['expect', "G.L.s.placedAt < 0 && !G.L.s.crankIn && !G.L.s.sour && G.inv.some(i => i.id === 'musicbox' && i.withCrank) && !G.inv.some(i => i.id === 'crank')", 'a click on the box lifts it back off, its crank still in it'],
  ];
};
const right = k => [
  hold('musicbox'), look(k), ['click', ped(k)], ['expect', 'G.L.s.placedAt === ' + k + " && G.L.s.crankIn && !G.inv.some(i => i.id === 'musicbox')", 'the box, crank and all, on the odd mirror\'s pedestal'],
  ['click', ped(k)], ['click', ped(k)], ['click', ped(k)], ['expect', '!G.L.won && G.L.s.turns === 3 && !G.L.s.sour', 'three turns, a few notes each'],
  ['expect', 'G.L.creature.angry < 1', 'the right tune calms it'],
  ['click', ped(k)], ['expect', 'G.L.won && G.L.s.turns === 4', 'the fourth turn plays the tune'],
];
const fetched = [['waitUntil', 'G.L.s.held && G.L.creature.lane.idx === 1 + G.L.s.odd', 8000], ['expect', 'G.L.s.held && !G.L.creature.angry', 'it came out through the odd mirror and took the box, smiling']];
module.exports = {
  nightmare: sheets.concat([['pickup', 'musicbox'], ['pickup', 'crank']], byOdd(k => crankFirst(k).concat(wrongPedestal(k), right(k))), fetched),
};
