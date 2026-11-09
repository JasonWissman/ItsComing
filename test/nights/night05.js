// The Clearing: a bow and three arrows, each lying in a place of its own; hold to draw until the bar is full, and let go
// with it in your sights; two hits. The arrows are picked up one at a time and go together in one slot. Then the harness
// proves what each kind of letting go does, with the thing held where it is (so the test is not a race against Nightmare
// speed): a click looses nothing (the bow is let back down), a draw let go before full falls short, one drawn full but off
// it misses (each of those spends an arrow; the three are given back between runs, as there are only three). Then a run
// where one hit, drawn full on it at 47 m, and two that fall short leave it nothing to stop it: it comes in and reaches you.
// Then the night again: a draw held full for a few seconds before letting go still goes in, and one from a pad puts it down.
const arrows = "(G.inv.find(i => i.id === 'arrows') || { uses: 0 }).uses";
const last = 'G.L.s.outcomes[G.L.s.outcomes.length - 1]';
const hold = d => ['eval', 'const c = G.L.creature; c.switched = true; c.darts = 2; c.u = 1 - Math.pow(' + d + ' / c.D0, 1 / c.gamma); c.hold = ' + d + ';' +
  ' G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;'];
const refill = ['eval', "G.inv.find(i => i.id === 'arrows').uses = 3; G.L.s.spent = 0; G.invSig = '';"];
const nock = ['wait', 750];   // the next arrow is on the string
// three arrows lying apart, picked up one at a time: one slot, the count going up, "Arrows ×2" on it
const slot = n => ['expect', "G.inv.filter(i => i.id === 'arrows').length === 1 && " + arrows + ' === ' + n + " && G.inv.find(i => i.id === 'arrows').name === '" + (n > 1 ? 'Arrows' : 'Arrow') + "'" +
  (n > 1 ? " && [...document.querySelectorAll('#inventory .label')].some(l => l.textContent === 'Arrows ×" + n + "')" : ''), 'arrow ' + n + ' picked up: one slot, ' + (n > 1 ? '"Arrows ×' + n + '"' : '"Arrow"')];
const apart = ['expect', "(() => { const a = G.L.items.filter(i => i.id === 'arrows').map(i => [i.x, i.z]); return a.length === 3 && a.every((p, i) => a.every((q, j) => i === j || Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.8)); })()", 'three arrows, each lying apart from the others'];
const arm = [apart, ['pickup', 'bow'], ['pickup', 'arrows'], slot(1), ['pickup', 'arrows'], slot(2), ['pickup', 'arrows'], slot(3)];
const kinds = [
  hold(25), ['wait', 300],
  ['draw', 'click'], ['expect', "G.draw && G.draw.state === 'easing'", 'a click: the bow starts to come up and is let back down'],
  ['wait', 500], ['expect', arrows + ' === 3 && !G.L.s.outcomes.length', 'a click looses nothing and spends nothing'],
  ['draw', 'short'], ['expect', last + " === 'short' && " + arrows + ' === 2 && G.draw.from < 1', 'let go before full: it falls short, an arrow spent'],
  nock, ['draw', 'full', 'off'], ['expect', last + " === 'miss' && " + arrows + " === 1 && G.draw.from === 1 && UI.drawbar.classList.contains('full')", 'drawn full (the bar shows it) but off it: a miss, an arrow spent'],
  ['wait', 1200], ['expect', '!G.L.creature.wounded && G.L.creature.hits === 0', 'nothing that missed touched it'],
  ['draw', 'click', null, 'pad'], ['wait', 200], ['expect', arrows + ' === 1 && G.L.s.outcomes.length === 2', 'a tap of A looses nothing either'],
];
const spentAll = [
  refill, hold(47), nock, ['draw', 'full'], ['expect', last + " === 'hit' && G.L.creature.dist > 45", 'drawn full and let go on it at 47 m: it flies at it'],
  ['wait', 1500], ['expect', 'G.L.creature.wounded && G.L.creature.hits === 1', 'the first hit wounds it, from 47 m'],
  ['draw', 'short', null, 'pad'], nock, ['draw', 'short', null, 'touch'], ['expect', arrows + " === 0 && G.L.s.outcomes.slice(-2).join() === 'short,short'", 'all three arrows gone, one in it (A and the touch Use button draw too)'],
  ['eval', 'G.L.creature.hold = null;'], ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 15000],
  ['expect', "G.L.creature.reckless && G.deathCause === 'spent'", 'with every arrow gone and only one in it, it came in and reached you'],
  ['eval', 'restartLevel();'], ['wait', 300],
];
const kill = [
  hold(30), ['wait', 300],
  ['draw', 4000], ['expect', last + " === 'hit' && G.L.s.outcomes.length === 1 && G.draw.from === 1", 'held full for a few seconds (it does not slip), then let go on it: it flies at it'],
  ['wait', 900], ['expect', 'G.L.creature.wounded && !G.L.creature.dead && ' + arrows + ' === 2', 'the first hit wounds it'],
  nock, ['draw', 'full', null, 'pad'], ['expect', last + " === 'hit'", 'held on A until full and let go: it flies at it'],
  ['wait', 1000], ['expect', 'G.L.creature.dead && G.L.creature.arrows.length === 2', 'the second hit puts it down, two arrows in it'],
];
module.exports = {
  nightmare: arm.concat(kinds, spentAll, arm, kill),
};
