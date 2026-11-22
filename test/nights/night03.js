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
// ---- the easter egg: the bag of sugar, given to it ----
// Played last, with both ways salted, one lantern burning and the other hung dark, the page's own loop stopped (G.noRaf)
// and every frame stepped by hand: with the sugar in the hand and the thing 14 m off, or 11 m off with something else in
// the hand, it is not a thing to click and nothing is given; 11 m off, walking in, with the sugar in the hand, it is ("Give
// it the sugar"), and a click on it gives it the bag for good, tossed (it is too far to hand over), the egg saved under the
// night's id from that moment. Then each part about as long as night03's GIVE says: the bag in the air and caught, looked
// at, poured in (the empty bag falls), stock still, the tremble, and off round the yard, never inside the fence. The
// loop is started again while it is out there, and the night is finished under it: the last lantern lit, it cuts its run
// short and comes to the salt line still wired, and the night's own ending plays (below). What it does when the night is
// not finished, the hand-over close up, and reduced motion are in test/features.js.
const eggSetup = `(() => {
  const L = G.L, c = L.creature;
  delete SAVE.data.eggs.graveyard; SAVE.persist(); G.noRaf = true;
  window._egg = { sugar: L.items.find(i => i.id === 'sugar') };
  c.switched = true; c.nextHitch = 1e9;
  window._step = n => { for (let i = 0; i < n; i++) update(1 / 60); render(); };
  window._at = (d, held) => {   // it is put d metres off on its way (held there, or walking in from there), the view turned to it
    c.u = clamp(1 - d / c.D0, 0, 1); c.hold = held ? d : null;
    const k = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.dirIdx = k; G.cam.yaw = G.cam.tYaw = k * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;
    for (let i = 0; i < 3; i++) _step(1);
  };
  window._sel = id => { G.active = G.inv.findIndex(i => i.id === id); };
  _sel('sugar'); _at(14, true);
})()`;
// stepped by hand until it is a second into its run
const eggRun = `(() => {
  const L = G.L, c = L.creature, e0 = L.s.egg;
  const r = window._rush = { phases: [], dur: {}, d0: e0.dist, toss: e0.toss, minD: 99, minDist: 99, states: [], seen: {}, shake: 0, buzz: 0, T: 0, catchDist: c.catchDist };
  const see = (k, v) => { if (v) r.seen[k] = true; };
  for (let i = 0; i < 60 * 14 && L.s.egg && !(L.s.egg.phase === 'run' && L.s.egg.t >= 1); i++) {
    update(1 / 60);
    const e = L.s.egg; if (!e) break;
    if (r.phases[r.phases.length - 1] !== e.phase) r.phases.push(e.phase);
    r.dur[e.phase] = e.t; r.T = e.T;
    if (!r.states.includes(G.state)) r.states.push(G.state);
    const p = c.pos(), d = Math.hypot(p.x, p.z);
    r.minD = Math.min(r.minD, d); r.minDist = Math.min(r.minDist, c.dist); r.shake = Math.max(r.shake, G.shakeAmt || 0);
    if (e.phase === 'take') { see('inAir', !c.bagHas); see('reach', c.bag > 0.3); }
    if (e.phase === 'look') { see('held', c.bagHas && c.bag > 0.95 && c.bow > 0.5); see('cockTo', c.cock > 0.8); see('cockAway', c.cock < -0.5); }
    if (e.phase === 'pour') { see('tipped', c.tip >= 1 && c.bagHas); see('poured', c.pour >= 1); see('gulp', c.gulp > 0.5); }
    if (e.phase === 'still') { see('stock', c.timeScale === 0 && !c.bagHas && !c.buzz && !c.tip); see('dropped', L.s.spent.length >= 1); }
    if (e.phase === 'buzz') { r.buzz = Math.max(r.buzz, c.buzz || 0); see('wired', c.wired >= 1); }
    if (e.phase === 'run') { see('off', c.runPose && c.flail === 1 && c.wired === 1 && c.buzz === 1); }
  }
  render();
})()`;
const GIVE = { take: 0.45, look: 1.0, pour: 1.2, still: 0.4, buzz: 0.8 };   // night03's own (take: the toss)
const timed = "(r => r.toss === true && G.L.s.give.toss === 0.45 && G.L.s.give.range === 12 && G.L.s.give.near === 4.5 && G.L.s.give.run === 6 && r.phases.join() === '" + Object.keys(GIVE).join() + ",run' && " + Object.entries(GIVE).map(([k, v]) => 'Math.abs(r.dur.' + k + ' - ' + v + ') < 0.06').join(' && ') + ' && Math.abs(r.T - ' + (Object.values(GIVE).reduce((a, b) => a + b, 0) + 1) + ') < 0.12)(window._rush)';
const safe = "(r => r.states.join() === 'play' && r.minD >= Math.min(r.d0, 4.4) - 0.01 && r.minDist > r.catchDist && r.shake < 1e-3)(window._rush)";
const acted = "(r => ['inAir', 'reach', 'held', 'cockTo', 'cockAway', 'tipped', 'poured', 'gulp', 'stock', 'dropped', 'wired', 'off'].every(k => r.seen[k]) && r.buzz > 0.9)(window._rush)";
const egg = [
  ['eval', eggSetup],
  ['expect', "(c => c.dist > 13.5 && G.L.uses.length === 0 && !R.hits.some(h => h.kind === 'creature') && useOnCreature(G.L, c) === false && G.hasItem('sugar') && !G.L.s.egg && !SAVE.data.eggs.graveyard)(G.L.creature)", 'the sugar in hand, the thing 14 m off: too far, it is not a thing to click, and nothing is given'],
  ['eval', "_sel('matches'); _at(11, true)"],
  ['expect', "(c => c.dist < 11.5 && G.L.uses.length === 0 && !R.hits.some(h => h.kind === 'creature') && useOnCreature(G.L, c) === false && G.hasItem('sugar') && !G.L.s.egg)(G.L.creature)", '11 m off, but the matches in hand: nothing'],
  ['eval', "_sel('sugar'); _at(11, false)"],
  ['expect', "(c => { const b = creatureBox(c); G.mouse.x = b.x + b.w / 2; G.mouse.y = b.y + b.h / 2; updateHover(); return c.dist < 11 && c.dist > 10.6 && G.L.uses.length === 1 && G.hover && G.hover.kind === 'creature' && UI.tooltip.textContent === 'Give it the sugar'; })(G.L.creature)", '11 m off, walking in, the sugar in hand: pointed at, "Give it the sugar"'],
  ['shoot'],
  ['expect', "(c => !G.inv.some(i => i.id === 'sugar') && _egg.sugar.taken && SAVE.data.eggs.graveyard === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.graveyard === true && LEVELS[G.levelIndex].text.egg === 'Give it a sugar rush.' && !(G.L.text.eggs || []).length && G.L.s.egg && G.L.s.egg.phase === 'take' && G.L.s.egg.t === 0 && G.L.s.egg.toss === true && /catches/.test(G.lastToast.msg) && G.state === 'play')(G.L.creature)", 'a click on it gives it the bag, for good, tossed from that far off: the easter egg is in the save from that moment, under the night\'s id (and it is no death)'],
  ['eval', eggRun],
  ['expect', timed, 'the bag is in the air 0.45 s and caught; it looks at it, pours it in, stands still, trembles, and is off, in that order, each about as long as it should be (3.85 s before it runs)'],
  ['expect', acted, 'each part is played: the bag in the air and its hand out for it, held up and looked at both ways, upended and emptied, a gulp, the empty bag dropped, stock still, wired, and off side on with its arms in the air'],
  ['expect', safe, 'all the while the night is in play, it is never nearer than it stood or than the fence, and the view is not shaken'],
  ['eval', "(() => { G.noRaf = false; G._last = performance.now(); requestAnimationFrame(frame); })()"],
  ['wait', 100],
  ['expect', "G.state === 'play' && G.L.s.egg && G.L.s.egg.phase === 'run' && !G.L.won", 'it is out in the yard on its run, and the night goes on under it'],
];
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
  ], [
    // the other lantern is hung, dark: all that is left is to light it. The sugar first (the easter egg, above): it is
    // out in the yard, wired, when the match is struck
    ['use', 'hookE', 1, 200], ['expect', tgt('hookE') + '.hung && !' + tgt('hookE') + '.lit && !G.L.won', 'the other lantern hung, not yet lit'],
    ...egg,
    ['use', 'hookE', 1, 200], ['expect', tgt('hookE') + '.lit', 'hookE: the lantern lit'],
    ['expect', "G.hasItem('matches')", 'matches kept (tool)'],
    // how it ends, all before the fade: won while it is out in the yard, it cuts its run short and comes straight to the
    // salt line of its way, nearer than the way held it, and stops there, still wired (its hair on end, a pinprick in each
    // eye, trembling); looks down at the salt, turns round and walks back the way it came, wired to the last
    ['expect', "G.L.won && G.state === 'won' && (c => c.wired === 1 && c.buzz === 1)(G.L.creature)", 'won while it is out on its run: the night is won at once, and it is wired still'],
    ['waitUntil', "!G.L.s.egg && G.L.s.end && G.L.s.end.phase === 'stand' && G.fade < 0.05 && (" + atLine + ')', 5000],
    ['expect', "(c => c.wired === 1 && c.buzz === 1 && !c.runPose && !c.flail && !c.skid && G.L.s.spent.length === 1)(G.L.creature)", 'it has come to the salt line and stands there wired, trembling, the empty bag where it fell'],
    ['waitUntil', 'G.L.creature.bow > 0.95 && G.fade < 0.05', 4000],
    ['waitUntil', 'G.L.creature.turn > 0.3 && G.L.creature.turn < 1 && G.fade < 0.05', 4000],
    ['waitUntil', 'G.L.creature.away && G.L.creature.dist > G.L.s.end.at + 1 && G.fade < 0.05 && G.L.creature.wired === 1 && G.L.creature.buzz === 1', 4000],
  ]),
};
