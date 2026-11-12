// The Clearing: a bow and three arrows, each lying in a place of its own; hold to draw until the bar is full, and let go
// with it in your sights; two hits. The arrows are picked up one at a time and go together in one slot. Then the harness
// proves what each kind of letting go does, with the thing held where it is (so the test is not a race against Nightmare
// speed): a click looses nothing (the bow is let back down), a draw let go before full falls short, one drawn full but off
// it misses (each of those spends an arrow; the three are given back between runs, as there are only three). Then a run
// where one hit, drawn full on it at 47 m, and two that fall short leave it nothing to stop it: it comes in and reaches you.
// Then the night again: a draw held full for a few seconds before letting go still goes in, and one from a pad puts it down.
// Before any of that, what will not go: the first time, two arrows are picked up before the bow, and one is clicked at it
// with no bow (it is raised to shoot, finds no bow, and drops head first to the boards at your feet, where it is picked up
// again); the second time the bow comes first, and pressed with no arrows it comes up, tips to show the bare shelf, the
// string is plucked on nothing, and it is let down.
// Drawn on, it may break sideways (30% of draws, never twice within a few seconds): the draws here follow its body while
// they are held, as a player keeps it in the sights, so a break mid-draw is followed. The rate itself, and that it really
// runs to the side when it does, are checked with the game stepped by hand (dodge, below): many draws let back down at
// once, nothing loosed.
const arrows = "(G.inv.find(i => i.id === 'arrows') || { uses: 0 }).uses";
const last = 'G.L.s.outcomes[G.L.s.outcomes.length - 1]';
const hold = d => ['eval', 'const c = G.L.creature; c.switched = true; c.darts = Infinity; c.u = 1 - Math.pow(' + d + ' / c.D0, 1 / c.gamma); c.hold = ' + d + ';' +
  ' G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;'];
const refill = ['eval', "G.inv.find(i => i.id === 'arrows').uses = 3; G.L.s.spent = 0; G.invSig = '';"];
const nock = ['wait', 750];   // the next arrow is on the string
// three arrows lying apart, picked up one at a time: one slot, the count going up, "Arrows ×2" on it
const slot = n => ['expect', "G.inv.filter(i => i.id === 'arrows').length === 1 && " + arrows + ' === ' + n + " && G.inv.find(i => i.id === 'arrows').name === '" + (n > 1 ? 'Arrows' : 'Arrow') + "'" +
  (n > 1 ? " && [...document.querySelectorAll('#inventory .label')].some(l => l.textContent === 'Arrows ×" + n + "')" : ''), 'arrow ' + n + ' picked up: one slot, ' + (n > 1 ? '"Arrows ×' + n + '"' : '"Arrow"')];
const apart = ['expect', "(() => { const a = G.L.items.filter(i => i.id === 'arrows').map(i => [i.x, i.z]); return a.length === 3 && a.every((p, i) => a.every((q, j) => i === j || Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.8)); })()", 'three arrows, each lying apart from the others'];
const dropped = "G.L.items.filter(i => i.id === 'arrows')[3]";   // the one let go of from the bundle, an arrow of its own
const noBow = [apart, ['pickup', 'arrows'], slot(1), ['pickup', 'arrows'], slot(2), hold(70), ['wait', 300],
  ['shoot'], ['expect', "G.lastToast.msg === 'No bow.' && " + arrows + " === 1 && G.fumbling && G.fumbling.drop && G.fumbling.preset === 'slip' && !G.L.s.outcomes.length", 'an arrow clicked at it with no bow: one leaves the bundle, nothing is loosed'],
  ['waitUntil', '!G.fumbling && ' + dropped + ' && !' + dropped + '.taken', 4000],
  ['expect', "(a => a.y === G.L.floor.y && a.flat && a.uses === 1 && a.name === 'Arrow' && Math.hypot(a.x, a.z) < 2)(" + dropped + ')', 'it dropped to the boards at your feet, one arrow'],
  ['pickup', 'arrows'], ['pickup', 'arrows'], slot(3), ['expect', "G.L.items.filter(i => i.id === 'arrows').every(i => i.taken)", 'it is picked up again, with the last one'],
  ['pickup', 'bow']];
const noArrows = [apart, ['pickup', 'bow'], hold(70), ['wait', 300],
  ['draw', 'click'], ['expect', "G.lastToast.msg === 'No arrows.' && G.L.s.groping && !G.draw", 'the bow pressed with no arrows: it comes up, and nothing is nocked'],
  ['wait', 350], ['expect', 'G.L.s.bowUp > 0.6 && G.L.s.groping && G.L.s.groping.pats >= 1', 'the bow is up, tipped to show the bare shelf, the string plucked on nothing'],
  ['waitUntil', '!G.L.s.groping && G.L.s.bowUp < 0.3', 3000],
  ['pickup', 'arrows'], slot(1), ['pickup', 'arrows'], slot(2), ['pickup', 'arrows'], slot(3)];
// many draws past the least that looses anything, each let straight back down (nothing loosed or spent), the cooldown
// cleared between them, the game stepped by hand: about 30% of them make it break sideways, side on, at least 4 degrees
// to a new place, its distance unchanged; then, with a break certain, a second draw within the cooldown does not, and one
// after it does. window._dodge holds what was seen.
const dodge = ['eval', `(() => {
  const L = G.L, c = L.creature, k = L.s.dodge, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const r = { n: 200, rolls: k.rolls, count: k.count, runs: 0, sideways: 0, moved: [], dist: 0 };
  const drawOnce = () => { G.drawBtn = 'mouse'; step(15); const d = G.draw; drawLetGo('mouse', true); return d; };
  const off = () => Math.tan(CREATURES.runner.ang(c)) * c.dist;   // where its run puts it, off its way
  for (let i = 0; i < r.n; i++) {
    k.at = -Infinity; step(30); let g = 0; while (c.mode === 'dart' && g++ < 200) step(1);
    const was = k.count, a0 = c.dartAng, x0 = off(), d0 = c.dist;
    drawOnce();
    if (k.count === was) continue;
    r.runs += c.mode === 'dart' && c.runDir === Math.sign(c.dartTo - a0) ? 1 : 0;
    step(100);
    const dx = off() - x0; r.moved.push(+dx.toFixed(2)); r.sideways += Math.abs(c.dartAng - a0) >= 0.069 && Math.abs(dx) > 1.5 ? 1 : 0;
    r.dist = Math.max(r.dist, Math.abs(c.dist - d0));
  }
  r.rolls = k.rolls - r.rolls; r.count = k.count - r.count;
  const ch = k.chance; k.chance = 1; k.at = -Infinity; step(200);
  const c0 = k.count; drawOnce(); r.forced = k.count - c0; step(100);
  drawOnce(); r.soon = k.count - c0 - r.forced; step(Math.ceil(k.gap * 60));
  drawOnce(); r.later = k.count - c0 - r.forced - r.soon; step(100);
  k.chance = ch; G.drawBtn = null; G.draw = null;
  window._dodge = r;
})()`];
const kinds = [
  hold(25), ['wait', 300],
  dodge, ['expect', '(r => r.rolls === r.n && r.count >= 0.2 * r.n && r.count <= 0.4 * r.n)(window._dodge)', 'drawn on 200 times: about 30% of draws make it break away'],
  ['expect', '(r => r.runs === r.count && r.sideways === r.count && r.dist < 0.01)(window._dodge)', 'each time it runs side on, the way it runs, to a new place at least 4 degrees and 1.5 m to the side, no nearer'],
  ['expect', '(r => r.forced === 1 && r.soon === 0 && r.later === 1)(window._dodge)', 'drawn on again within a few seconds of breaking away, it does not; after that, it may again'],
  ['eval', 'window._rolls = G.L.s.dodge.rolls;'],
  ['draw', 'click'], ['expect', "G.draw && G.draw.state === 'easing' && G.L.s.dodge.rolls === window._rolls", 'a click: the bow starts to come up and is let back down (not a draw: nothing for it to react to)'],
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
  nightmare: noBow.concat(kinds, spentAll, noArrows, kill),
};
