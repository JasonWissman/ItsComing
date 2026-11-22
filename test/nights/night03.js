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
// ---- the easter egg: the bag of sugar, handed to it ----
// With the page's own loop stopped (G.noRaf) and every frame stepped by hand: with the sugar in the hand and the thing too
// far off, or near with something else in the hand, it is not a thing to click and nothing is handed over; near, with the
// sugar in the hand, it is ("Give it the sugar"), and a click on it hands it the bag for good, the egg saved under the
// night's id from that moment. Then all of it in order, each part about as long as night03's GIVE says: it takes the bag,
// looks at it, pours it in (the empty bag falls), stands stock still, trembles, runs round the yard (a long way, fast,
// out past the fence, clear of the headstones, never nearer you than it was) and skids back, shudders, and is on its way
// again where it was, walking in as before. A second bag (put back in the hand for the test) with reduced motion: the same
// parts in the same times, the tremble slight and the run at about half the pace, on a shorter round. Nowhere is the view
// shaken. The thing is put back where the night's solution left it, and the loop started again.
const eggSetup = `(() => {
  const L = G.L, c = L.creature;
  delete SAVE.data.eggs.graveyard; SAVE.persist(); G.noRaf = true;
  window._egg = { u: c.u, hold: c.hold, switched: c.switched, nextHitch: c.nextHitch, sugar: L.items.find(i => i.id === 'sugar') };
  c.switched = true; c.nextHitch = 1e9;
  window._step = n => { for (let i = 0; i < n; i++) update(1 / 60); render(); };
  window._at = (d, held) => {   // it is put d metres off on its way (held there, or walking in from there), the view turned to it
    c.u = clamp(1 - d / c.D0, 0, 1); c.hold = held ? d : null;
    const k = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.dirIdx = k; G.cam.yaw = G.cam.tYaw = k * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;
    for (let i = 0; i < 3; i++) _step(1);
  };
  window._sel = id => { G.active = G.inv.findIndex(i => i.id === id); };
  _sel('sugar'); _at(4.8, true);
})()`;
const eggRun = `(() => {
  const L = G.L, c = L.creature, e0 = L.s.egg, yard = L.s.yard, lane = c.lane.idx;
  const r = window._rush = { phases: [], dur: {}, d0: e0.dist, lane, minD: 99, minDist: 99, len: 0, vmax: 0, far: 0, clear: 99, inYard: true, states: [], seen: {}, shake: 0, buzz: 0, shudder: 0, T: 0 };
  const see = (k, v) => { if (v) r.seen[k] = true; };
  let prev = null;
  for (let i = 0; i < 60 * 14 && L.s.egg; i++) {
    update(1 / 60);
    const e = L.s.egg; if (!e) break;
    if (r.phases[r.phases.length - 1] !== e.phase) r.phases.push(e.phase);
    r.dur[e.phase] = e.t; r.T = e.T;
    if (!r.states.includes(G.state)) r.states.push(G.state);
    const p = c.pos(), q = rotY(p.x, p.z, -L.facing), d = Math.hypot(p.x, p.z);
    r.minD = Math.min(r.minD, d); r.minDist = Math.min(r.minDist, c.dist); r.shake = Math.max(r.shake, G.shakeAmt || 0);
    if (e.phase === 'look') { see('held', c.bagHas && c.bag > 0.95 && c.bow > 0.5); see('cockTo', c.cock > 0.8); see('cockAway', c.cock < -0.5); }
    if (e.phase === 'pour') { see('tipped', c.tip >= 1 && c.bagHas); see('poured', c.pour >= 1); see('gulp', c.gulp > 0.5); }
    if (e.phase === 'still') { see('stock', c.timeScale === 0 && !c.bagHas && !c.buzz && !c.tip); see('dropped', L.s.spent.length >= 1); }
    if (e.phase === 'buzz') { r.buzz = Math.max(r.buzz, c.buzz || 0); see('wired', c.wired >= 1); }
    if (e.phase === 'run') {
      if (prev) { const v = Math.hypot(q[0] - prev[0], q[1] - prev[1]); r.len += v; r.vmax = Math.max(r.vmax, v * 60); }
      r.far = Math.max(r.far, d);
      for (const [x, z, b] of yard) r.clear = Math.min(r.clear, Math.hypot(q[0] - x, q[1] - z) - b);
      const along = lane === 0 ? q[1] : q[0], off = lane === 0 ? q[0] : q[1];
      if (!(q[0] >= 4.4 || q[1] >= 4.4 || (Math.abs(off) < 0.8 && along > 1.4))) r.inYard = false;   // out past the fence, or on its own way through the gap in it
      if (Math.abs(q[0]) > 12 || q[1] > 18 || q[1] < -4) r.inYard = false;   // and not off into the far dark
      see('side', c.runPose && c.flail === 1); see('right', c.runPose && c.runDir === 1); see('left', c.runPose && c.runDir === -1);
      see('front', !c.runPose && c.rush === 1 && c.flail === 1); see('skid', c.skid > 0.95 && !c.runPose); see('dust', L.s.puffs.length > 5);
    }
    if (e.phase === 'shudder') r.shudder = Math.max(r.shudder, c.buzz || 0);
    prev = q;
  }
  render();
  const p = c.pos(), lp = APPROACH.position(c.lane, c.dist, 0, L.eyeH);
  r.after = { dist: c.dist, lane: c.lane.idx, hold: c.hold, distFn: !!c.distFn, frozen: c.frozen, fixed: c.fixedLane, off: Math.hypot(p.x - lp.x, p.z - lp.z), yaw: Math.abs(wrapPi(c.yaw - c.lane.yaw)),
    pose: [c.bag, c.tip, c.pour, c.buzz, c.wired, c.flail, c.skid, c.rush].every(v => !v) && !c.runPose && !c.bagHas, spent: L.s.spent.length, state: G.state, egg: !!L.s.egg, catchDist: c.catchDist };
})()`;
const GIVE = { take: 0.35, look: 1.0, pour: 1.2, still: 0.4, buzz: 0.8, run: 6, shudder: 0.6 };   // night03's own
const timed = "(r => JSON.stringify(G.L.s.give) && r.phases.join() === '" + Object.keys(GIVE).join() + "' && " + Object.entries(GIVE).map(([k, v]) => 'Math.abs(r.dur.' + k + ' - ' + v + ') < 0.06 && G.L.s.give.' + k + ' === ' + v).join(' && ') + ' && Math.abs(r.T - ' + Object.values(GIVE).reduce((a, b) => a + b, 0) + ') < 0.12)(window._rush)';
const safe = "(r => r.states.join() === 'play' && r.minD >= r.d0 - 0.01 && r.minDist > r.after.catchDist && r.shake < 1e-3 && r.after.state === 'play')(window._rush)";
const acted = "(r => ['held', 'cockTo', 'cockAway', 'tipped', 'poured', 'gulp', 'stock', 'dropped', 'wired', 'side', 'right', 'left', 'front', 'skid', 'dust'].every(k => r.seen[k]))(window._rush)";
const back = n => '(r => Math.abs(r.after.dist - r.d0) < 0.06 && r.after.lane === r.lane && r.after.hold === null && !r.after.distFn && !r.after.frozen && r.after.off < 0.01 && r.after.yaw < 1e-6 && r.after.pose && !r.after.egg && r.after.spent === ' + n + ')(window._rush)';
const comesOn = "(c => { const d = c.dist; _step(45); const on = d - c.dist; window._rush.on = on; return on > 0.5 && on < 1.6 && G.state === 'play' && !G.L.s.egg; })(G.L.creature)";
const egg = [
  ['eval', eggSetup],
  ['expect', "(c => c.dist > 4.5 && G.L.uses.length === 0 && !R.hits.some(h => h.kind === 'creature') && useOnCreature(G.L, c) === false && G.hasItem('sugar') && !G.L.s.egg && !SAVE.data.eggs.graveyard)(G.L.creature)", 'the sugar in hand, the thing 4.8 m off: too far, it is not a thing to click, and nothing is handed over'],
  ['eval', "_sel('matches'); _at(3.6, true)"],
  ['expect', "(c => c.dist < 4 && G.L.uses.length === 0 && !R.hits.some(h => h.kind === 'creature') && useOnCreature(G.L, c) === false && G.hasItem('sugar') && !G.L.s.egg)(G.L.creature)", 'near, but the matches in hand: nothing'],
  ['eval', "_sel('sugar'); _at(3.6, false)"],
  ['expect', "(c => { const b = creatureBox(c); G.mouse.x = b.x + b.w / 2; G.mouse.y = b.y + b.h / 2; updateHover(); return c.dist < 3.6 && c.dist > 3.3 && G.L.uses.length === 1 && G.hover && G.hover.kind === 'creature' && UI.tooltip.textContent === 'Give it the sugar'; })(G.L.creature)", 'near, walking in, the sugar in hand: pointed at, "Give it the sugar"'],
  ['shoot'],
  ['expect', "(c => !G.inv.some(i => i.id === 'sugar') && _egg.sugar.taken && SAVE.data.eggs.graveyard === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.graveyard === true && LEVELS[G.levelIndex].text.egg === 'Give it a sugar rush.' && !(G.L.text.eggs || []).length && G.L.s.egg && G.L.s.egg.phase === 'take' && G.L.s.egg.t === 0 && G.state === 'play')(G.L.creature)", 'a click on it hands it the bag, for good: the easter egg is in the save from that moment, under the night\'s id (and it is no death)'],
  ['eval', eggRun],
  ['expect', timed, 'it takes the bag, looks at it, pours it in, stands still, trembles, runs and shudders, in that order, each about as long as it should be (10.35 s in all)'],
  ['expect', acted, 'each part is played: the bag held up and looked at both ways, upended and emptied, a gulp, the empty bag dropped, stock still, wired, side on both ways with its arms in the air, straight back and a skid, dust behind it'],
  ['expect', safe, 'all the while the night is in play, it is never nearer than it stood, and the view is not shaken'],
  ['expect', "(r => r.len > 85 && r.vmax >= 15 && r.vmax <= 20)(window._rush)", 'the rush: some 100 m in 6 s, three or four times its running pace (5 m/s)'],
  ['expect', "(r => r.far > 10 && r.far < 18 && r.inYard && r.clear > -0.2)(window._rush)", 'the rush: out past the fence among the headstones and clear of them, within 18 m of you'],
  ['expect', "(r => r.buzz > 0.9 && r.shudder > 0.9)(window._rush)", 'the tremble builds to the full, and the last shudder is one more of it'],
  ['expect', back(1), 'afterwards it is on its way again where it stood when it took the bag: the same way, the same distance, nothing left of the pose, one empty bag on the ground'],
  ['expect', comesOn, 'and it walks in from there as before'],
  // a second bag, with reduced motion
  ['eval', "(() => { const it = _egg.sugar; G.inv.push(it); SAVE.data.settings.reducedMotion = true; _sel('sugar'); _at(3.6, false); window._gave = useOnCreature(G.L, G.L.creature); })()"],
  ['expect', "window._gave === true && !G.hasItem('sugar') && G.L.s.egg && G.L.s.egg.slow === true && SAVE.data.eggs.graveyard === true", 'a second bag is taken as the first was (the egg is saved once)'],
  ['eval', eggRun],
  ['expect', timed, 'reduced motion: the same parts, in the same times'],
  ['expect', safe, 'reduced motion: in play all the while, never nearer, no shake'],
  ['expect', "(r => r.buzz > 0.2 && r.buzz < 0.31 && r.shudder < 0.31 && r.vmax >= 8 && r.vmax <= 11.5 && r.len > 45 && r.len < 66 && r.inYard && r.clear > -0.2 && r.seen.side && r.seen.front && r.seen.skid)(window._rush)", 'reduced motion: the tremble is slight, and the run about twice its running pace on a shorter round'],
  ['expect', back(2), 'reduced motion: and back where it stood'],
  ['eval', "(() => { const c = G.L.creature, k = window._egg; SAVE.data.settings.reducedMotion = false; SAVE.persist(); c.u = k.u; c.hold = k.hold; c.switched = k.switched; c.nextHitch = k.nextHitch; c.hitchT = 0; _step(2); G.noRaf = false; G._last = performance.now(); requestAnimationFrame(frame); })()"],
  ['wait', 150],
  ['expect', "G.state === 'play' && G.L.creature.dist > 20 && G.L.creature.hold !== null", 'the thing is back where the night left it, held, and the night goes on'],
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
    ...egg,
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
