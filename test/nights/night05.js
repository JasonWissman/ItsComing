// The Clearing: a bow and a quiver of three arrows; hold to draw, let go in the green with it in your sights; two hits.
// First the harness proves what each kind of letting go does, with the thing held where it is (so the test is not a race
// against Nightmare speed): a click looses nothing (the bow is let back down), a draw let go below the green falls short,
// one let go past it or held until the string slips goes wild, one let go in the green but off it misses (each of those
// spends an arrow; the quiver is filled again between them, as there are only three). Then a run where one hit (from the
// touch Use button) and two misses leave it nothing to stop it: it comes in and reaches you. Then the night again: a hit
// with the mouse wounds it, and one drawn with A on a pad puts it down.
const arrows = "(G.inv.find(i => i.id === 'arrows') || { uses: 0 }).uses";
const last = 'G.L.s.outcomes[G.L.s.outcomes.length - 1]';
const hold = d => ['eval', 'const c = G.L.creature; c.switched = true; c.darts = 2; c.u = 1 - Math.pow(' + d + ' / c.D0, 1 / c.gamma); c.hold = ' + d + ';' +
  ' G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;'];
const refill = ['eval', "G.inv.find(i => i.id === 'arrows').uses = 3; G.L.s.spent = 0; G.invSig = '';"];
const nock = ['wait', 750];   // the next arrow is on the string
const arm = [['pickup', 'bow'], ['pickup', 'arrows'], ['expect', arrows + ' === 3', 'a quiver of three arrows']];
const kinds = [
  hold(25), ['wait', 300],
  ['draw', 'click'], ['expect', "G.draw && G.draw.state === 'easing'", 'a click: the bow starts to come up and is let back down'],
  ['wait', 500], ['expect', arrows + ' === 3 && !G.L.s.outcomes.length', 'a click looses nothing and spends nothing'],
  ['draw', 'short'], ['expect', last + " === 'short' && " + arrows + ' === 2', 'let go below the green: it falls short, an arrow spent'],
  nock, ['draw', 'over'], ['expect', last + " === 'over' && " + arrows + ' === 1', 'let go past the green: overdrawn, it goes wild, an arrow spent'],
  refill, nock, ['draw', 'top'], ['expect', last + " === 'over' && " + arrows + ' === 2 && G.draw.from === 1', 'held to the top: the string slips, an arrow spent'],
  nock, ['draw', 'good', 'off'], ['expect', last + " === 'miss' && " + arrows + ' === 1', 'let go in the green but off it: a miss, an arrow spent'],
  ['wait', 1200], ['expect', '!G.L.creature.wounded && G.L.creature.hits === 0', 'nothing that missed touched it'],
  ['draw', 'click', null, 'pad'], ['wait', 200], ['expect', arrows + ' === 1 && G.L.s.outcomes.length === 4', 'a tap of A looses nothing either'],
];
const spentAll = [
  refill, nock, ['draw', 'good', null, 'touch'], ['expect', last + " === 'hit'", 'held on the touch Use button and let go in the green: it flies at it'],
  ['wait', 1000], ['expect', 'G.L.creature.wounded && G.L.creature.hits === 1', 'the first hit wounds it'],
  ['draw', 'short'], nock, ['draw', 'short'], ['expect', arrows + ' === 0', 'all three arrows gone, one in it'],
  ['eval', 'G.L.creature.hold = null;'], ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 15000],
  ['expect', "G.L.creature.reckless && G.deathCause === 'spent'", 'with every arrow gone and only one in it, it came in and reached you'],
  ['eval', 'restartLevel();'], ['wait', 300],
];
const kill = [
  hold(30), ['wait', 300],
  ['draw', 'good'], ['expect', last + " === 'hit'", 'let go in the green, on it: it flies at it'],
  ['wait', 900], ['expect', 'G.L.creature.wounded && !G.L.creature.dead && ' + arrows + ' === 2', 'the first hit wounds it'],
  nock, ['draw', 'good', null, 'pad'], ['expect', last + " === 'hit'", 'held on A and let go in the green: it flies at it'],
  ['wait', 1000], ['expect', 'G.L.creature.dead && G.L.creature.arrows.length === 2', 'the second hit puts it down, two arrows in it'],
];
module.exports = {
  nightmare: arm.concat(kinds, spentAll, arm, kill),
};
