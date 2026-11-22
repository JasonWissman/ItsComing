// The Quarry: each gate is pulled shut, chained and padlocked with a padlock of its own, and the padlocks need their key. The
// two padlocks lie apart, each in a place of its own, and are picked up one at a time. Empty-handed, the player pulls
// the back gate shut and pushes it: nothing holds it, so it swings out a little and falls back shut. Then they find one chain,
// one padlock (the other is left lying) and the rusted padlock, pull the gate shut and throw the chain round it while it is still swinging: the gate
// swings into the post and knocks the chain off to the ground, where it is picked up again. They chain the shut gate, try the
// rusted padlock (it will not snap shut, and drops by the gate), try the padlock without its key (it will not open, and comes
// back); at the shut back gate it has nothing to close on. Then they find the key and lock the gate, and the padlock is gone
// with it. At the back gate the key pokes at the bars, and
// the rotten rope slips off the bars to the ground (it is picked up again from there); they fetch the second chain and click
// it on the back gate late in a swing, so it goes on as the gate shuts. It still needs a padlock of its own: they fetch the
// second padlock and lock it. The watcher is held still because the harness spends its unseen budget scanning.
// With both gates shut it is put at its own gate and looked at: through the gate's thin bars it is seen whole, and the bars
// are close enough to hold it, with a gap, not a bar, in the middle. Once both are locked, in the blinks of the ending it
// comes to its gate and shakes it three times with its fists on the bars, and does not get in.
// Before any of that, the staring contest (the night's easter egg), with the game's clock stepped by hand: with its hands
// over its face a full minute's stare does nothing; after a glance away it is in a pose whose eyes show, and 40 s of
// staring, a glance away and 40 s more is still nothing (the glance started the count again); at the full minute it
// blinks and rubs its eyes, the egg is saved, and it is then in the same pose at the same distance, the night going on.
// It can be lost again (with reduced motion on, the slower one), and a look away from the middle of that ends it at once.
const gate = id => "G.L.targets.find(t => t.id === '" + id + "')";
const item = id => "G.L.items.find(i => i.id === '" + id + "')";
const said = text => "G.lastToast.msg.includes('" + text + "')";
const select = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const lies = id => '!G.fumbling && !' + item(id) + '.taken && ' + item(id) + '.y === G.L.floor.y';   // dropped, and lying on the ground
const back = id => "!G.fumbling && G.hasItem('" + id + "') && G.hand.cur && G.hand.cur.id === '" + id + "'";   // back in the hand
const IT = 'G.L.creature', EYES = 'CREATURES.watcher.eyesShow(' + IT + ')', NOW = 'CREATURES.watcher.blinkAt(' + IT + '.blink)';
const clock = secs => ['eval', 'for (let i = 0; i < ' + Math.round(secs / 0.05) + '; i++) update(0.05);'];   // the game's own update, stepped
const turn = k => ['eval', '(c => { G.cam.dirIdx = (((Math.round(c.yaw / (45 * DEG)) + ' + k + ') % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = c.yaw + ' + k + ' * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0; })(' + IT + ')'];
const glance = [turn(4), ['waitUntil', '!' + IT + '.seen', 3000], ['wait', 100]];   // away from it
const lookBack = [turn(0), ['waitUntil', IT + '.seen && ' + EYES, 3000]];
const toRub = ['eval', 'for (let i = 0; i < 400 && ' + IT + '.blink && ' + NOW + '.ph === null; i++) update(0.02);'];   // on to where it rubs its eyes
const same = IT + '.pose === window.__was.pose && ' + IT + '.dist === window.__was.dist';
const contest = [
  ['eval', '(c => { delete SAVE.data.eggs.quarry; SAVE.persist(); window.__hold = c.hold; c.hold = 6; })(' + IT + ')'], turn(0), ['wait', 250],
  ['eval', IT + '.pose = 0;'],   // (as it stands until it is first looked away from and back at: the harness's first frames may be one)
  ['expect', IT + '.seen && ' + IT + '.pose === 0 && !' + EYES, 'with its hands over its face: seen, its eyes hidden'],
  clock(62),
  ['expect', '!' + IT + '.blink && G.L.s.stare === 0 && !SAVE.data.eggs.quarry', 'stared at for a full minute with its eyes covered: nothing, and no count kept'],
  ...glance, ...lookBack,
  ['expect', '[1, 2, 3].includes(' + IT + '.pose)', 'looked away from and back at: a pose whose eyes show'],
  clock(40),
  ['expect', 'G.L.s.stare >= 40 && G.L.s.stare < 45 && !' + IT + '.blink', '40 s of staring is counted, and it has not blinked'],
  ...glance,
  ['expect', 'G.L.s.stare === 0', 'a glance away before the minute is up starts the count again'],
  ...lookBack, ['eval', 'window.__was = { pose: ' + IT + '.pose, dist: ' + IT + '.dist };'],
  clock(40),
  ['expect', '!' + IT + '.blink && !SAVE.data.eggs.quarry && G.L.s.stare >= 40', '40 s more after the glance: still nothing (80 s in all, but not unbroken)'],
  clock(20.1),
  ['expect', '!!' + IT + '.blink && ' + IT + '.blink.slow === false && ' + IT + '.blink.t < 1', 'a full minute unbroken: it blinks first'],
  ['expect', "SAVE.data.eggs.quarry === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.quarry === true && LEVELS[G.levelIndex].text.egg === 'Win a staring contest.'", 'the easter egg is saved by the night\'s id, and the night names it'],
  toRub,
  ['expect', '(b => b.ph !== null && b.up > 0.99 && b.shut > 0.99)(' + NOW + ') && ' + same + ' && ' + IT + '.seen', 'it rubs its eyes with its fists, its eyes shut, where it stood and in the pose it held'],
  clock(3),
  ['expect', '!' + IT + '.blink && ' + same + " && G.state === 'play' && !" + IT + '.dead && G.L.s.stare > 0 && G.L.s.stare < 8', 'then it is as it was: the same pose, the same distance, the night going on (and the count begun again)'],
  ['eval', 'SAVE.data.settings.reducedMotion = true;'], clock(60),
  ['expect', '!!' + IT + '.blink && ' + IT + '.blink.slow === true', 'another full minute and it loses again (with reduced motion on, the slower, gentler one)'],
  ['eval', 'SAVE.data.settings.reducedMotion = false;'], toRub,
  ['expect', '(b => b.ph !== null && b.up > 0.99)(' + NOW + ')', 'rubbing its eyes again'],
  ...glance,
  ['expect', '!' + IT + '.blink && ' + IT + ".dist === window.__was.dist && G.state === 'play'", 'looked away from as it rubs its eyes: that is over at once, and it is where it was'],
  ...lookBack,
  ['expect', '[1, 2, 3].includes(' + IT + '.pose) && ' + IT + '.pose !== window.__was.pose && !' + IT + '.blink', 'looked back at, it is in a new pose, as ever'],
  ['eval', IT + '.hold = window.__hold;'],
];
module.exports = {
  nightmare: [
    ['eval', 'G.L.creature.hold = G.L.creature.dist;'],
    ...contest,
    ['use', 'backgate'], ['expect', said('swings shut') + " && G.hand.reach && G.hand.reach.style === 'pull'", 'empty-handed, the open back gate is pulled shut'],
    ['waitUntil', gate('backgate') + '.shut', 3000],
    ['click', 'backgate'], ['expect', said('nothing holds it') + " && G.hand.reach && G.hand.reach.style === 'push'", 'pushed, the shut back gate with nothing to hold it'],
    ['waitUntil', gate('backgate') + '.angle > 0.1', 2000],   // swings out a little
    ['waitUntil', gate('backgate') + '.angle === 0 && ' + gate('backgate') + '.shut && ' + gate('backgate') + '.nudgeAt === undefined', 3000],   // and falls back shut
    ['expect', '(([a, b]) => a !== b && !a.taken && !b.taken && Math.hypot(a.x - b.x, a.z - b.z) > 0.8)([' + item('padlock') + ', ' + item('padlock2') + '])', 'two good padlocks, each lying in a place of its own'],
    ['pickup', 'chain'], ['pickup', 'padlock'],
    ['expect', "G.hasItem('padlock') && !G.hasItem('padlock2') && !" + item('padlock2') + ".taken && G.inv.find(i => i.id === 'padlock').uses === 1", 'one padlock is picked up on its own; the other still lies where it was'],
    ['pickup', 'oldlock'],
    ['use', 'gate'], ['expect', said('swings shut'), 'clicking the open gate swings it shut'],
    // (the click comes as it starts to swing, whatever the harness's pace: a chain clicked late in the swing goes on as it shuts)
    select('chain'), ['eval', gate('gate') + '.closing = 1'], ['click', 'gate'],
    ['expect', said('still swinging') + " && !G.hasItem('chain') && !" + gate('gate') + '.chained && G.fumbling && G.fumbling.it === ' + item('chain') + ' && G.fumbling.drop', 'the chain thrown round the gate while it swings: not used up, it leaves the hand'],
    ['waitUntil', "G.fumbling && G.fumbling.phase === 'contact' && " + gate('gate') + '.closing > 0', 3000],   // on the gate's end before it meets the post
    ['waitUntil', gate('gate') + '.shut', 3000],
    ['expect', '!' + gate('gate') + '.chained', 'the chain on the swinging gate does not chain it'],
    ['waitUntil', lies('chain'), 4000],   // knocked off as the gate swings into the post, it falls to the ground
    ['pickup', 'chain'],                  // where it is seen and taken again
    ['use', 'gate'], ['expect', gate('gate') + ".chained && !G.hasItem('chain')", 'the chain goes on the shut gate and is used up'],
    // where the lock goes: a click anywhere across the chain as it is drawn (its whole width, out over the post's face, and
    // a little past it) is a click on the gate, from straight on and from either side (looking down at it, the chain is drawn
    // in perspective on its own card, and the same card a little bigger is the hit area: checked by eye, as the screenshots)
    ['expect', '(async () => { const g = ' + gate('gate') + ', sg = g.sign, c0 = { d: G.cam.dirIdx, y: G.cam.yaw, p: G.cam.pitch }, d0 = Math.round(Math.atan2(g.x, g.z) / (45 * DEG)); let n = 0, bad = 0; ' +
      'for (const k of [0, 1, -1]) { const d = (((d0 + k) % 8) + 8) % 8; G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); ' +
      'for (let x = 0.72; x <= 1.281; x += 0.04) for (const y of [0.55, 0.72, 0.9, 1.05]) { const w = G.L.pt(x * sg, y, 2.3 * sg), q = R.screenPos(w[0], w[1], w[2]); if (!q || q.x < 2 || q.x > R.W - 2 || q.y < 2 || q.y > R.H - 2) continue; G.mouse.x = q.x; G.mouse.y = q.y + R.viewY; updateHover(); n++; if (!G.hover || (G.hover.kind === "target" && G.hover.ref !== g)) bad++; } } ' +
      'G.mouse.x = -1; updateHover(); G.cam.dirIdx = c0.d; G.cam.yaw = G.cam.tYaw = c0.y; G.cam.pitch = G.cam.tPitch = c0.p; return n > 60 && bad === 0; })()', 'the whole chain, and a little round it, is the gate to click (to put the lock on it), seen from any side'],
    select('oldlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('Rusted solid') + " && !G.hasItem('oldlock')", 'the rusted padlock will not do: it leaves the hand'],
    ['click', 'gate'], ['expect', said('Rusted solid') + ' && G.fumbling && G.fumbling.it === ' + item('oldlock'), 'clicked again while it is still at the gate: nothing more is tried, its line stays'],
    ['waitUntil', lies('oldlock'), 4000],   // it will not snap shut, and drops by the gate
    select('padlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('locked shut') + ' && G.fumbling && G.fumbling.preset === "bump" && !G.fumbling.drop', 'the padlock will not open without its key: it is tugged at on the chain'],
    ['waitUntil', back('padlock'), 3000],   // and comes back
    select('padlock'), ['use', 'backgate'], ['expect', '!' + gate('backgate') + '.locked && ' + said('nothing to close on') + ' && G.fumbling && G.fumbling.target === ' + gate('backgate'), 'the padlock on a shut gate with no chain has nothing to close on'],
    ['waitUntil', back('padlock'), 3000],
    ['pickup', 'gatekey'], select('padlock'), ['use', 'gate'],
    ['expect', gate('gate') + ".locked && !G.hasItem('padlock') && !" + item('padlock2') + '.taken', 'gate locked: the padlock stays on it, and the other one still lies where it was'],
    select('gatekey'), ['use', 'backgate'], ['expect', '!' + gate('backgate') + '.chained && ' + said('nothing holds it'), 'a shut gate with no chain to hand says so'],
    ['waitUntil', back('gatekey'), 3000],   // the key pokes at the bars and comes back
    ['pickup', 'rope'], ['use', 'backgate'], ['expect', '!' + gate('backgate') + ".chained && !G.hasItem('rope') && " + said('nothing holds it'), 'the rotten rope wound round the bars will not hold it'],
    ['waitUntil', lies('rope'), 4000],   // it slips off and falls
    ['pickup', 'rope'],
    // the second chain clicked on the back gate late in a swing (set going again here, as if just pulled to): it does not go
    // on a gate still swinging, nor is it thrown at a gate about to shut and knocked off; it goes on as the gate shuts
    ['pickup', 'chain2'], ['eval', '(g => { g.closing = 0.25; useTarget(g); })(' + gate('backgate') + ')'],
    ['expect', "G.hasItem('chain2') && !" + gate('backgate') + '.chained && !G.fumbling && ' + gate('backgate') + '.queued', 'a chain clicked late in the swing waits for the gate to shut'],
    ['waitUntil', gate('backgate') + ".shut && " + gate('backgate') + ".chained && !G.hasItem('chain2')", 2000],   // the second chain goes on the back gate as it shuts
    // the first padlock is on the gate: the back gate needs a padlock of its own
    ['waitUntil', '!G.fumbling', 3000], select('gatekey'), ['use', 'backgate'],
    ['expect', '!' + gate('backgate') + ".locked && !G.inv.some(i => i.id.includes('lock')) && " + said('nothing fastens it'), 'the chained back gate, with no padlock left in hand, needs one of its own'],
    ['waitUntil', back('gatekey'), 3000],
    ['pickup', 'padlock2'],
    ['eval', '(() => { const c = G.L.creature; window.__hold = c.hold; c.hold = c.lane.barrierDist; G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = c.yaw; G.cam.pitch = G.cam.tPitch = 0; })()'], ['wait', 250],
    ['expect', 'G.L.creature.seen && G.L.creature.visFrac > 0.99 && ' + gate('gate') + '.shut && ' + gate('backgate') + '.shut', 'at its gate, through the shut gate, it is seen whole'],
    ['expect', 'G.L.s.bars.every((x, i, b) => i === 0 || x - b[i - 1] < 0.3) && !G.L.s.bars.some(x => Math.abs(x) < 0.08)', 'the bars are under 30 cm apart all the way across, with a gap in the middle'],
    ['eval', 'G.L.creature.hold = window.__hold;'],
    select('padlock2'), ['use', 'backgate'], ['expect', gate('backgate') + ".locked && !G.hasItem('padlock2')", 'back gate locked with the second padlock'],
    ['eval', 'G.L.creature.hold = null;'],
    ['waitUntil', 'G.L.s.after && G.L.s.after.rattles === 3', 9000],
    ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'in the blinks it came to its gate and shook it three times, and did not get in'],
    // once the gate has stopped jolting: as you see it now (the shut gate's bars and it, each as drawn, in its own measure
    // as it is drawn), one fist is on a bar either side of it and the hand it reaches with is in a gap
    ['wait', 1100],
    ['expect', '(() => { const L = G.L, c = L.creature, g = L.targets.find(t => t.id === (c.lane.idx === 0 ? "gate" : "backgate")), p = c.pos(), o = R.screenPos(p.x, p.y + (c.yOff || 0), p.z); const bars = y => L.s.bars.map(b => { const w = L.pt(g.sign * b, y, 2.6 * g.sign), r = R.screenPos(w[0], w[1], w[2]); return (r.x - o.x) / o.scale; }); return c.grip[0] < 0 && c.grip[1] > 0 && c.grip.every(x => bars(1.41).some(b => Math.abs(b - x) < 0.004)) && !bars(1.08).some(b => Math.abs(b - c.reach) < 0.08); })()', 'as you see it, its fists are on the bars either side of it, and its reaching hand is through a gap'],
  ],
};
