// The Quarry: each gate is pulled shut, chained and padlocked, and the padlock needs its key. Empty-handed, the player pulls
// the back gate shut and pushes it: nothing holds it, so it swings out a little and falls back shut. Then they find one chain,
// the padlock and the rusted padlock, pull the gate shut and throw the chain round it while it is still swinging: the gate
// swings into the post and knocks the chain off to the ground, where it is picked up again. They chain the shut gate, try the
// rusted padlock (it will not snap shut, and drops by the gate), try the padlock without its key (it will not open, and comes
// back), then find the key and lock it. At the back gate the key pokes at the bars, the padlock has nothing to close on, and
// the rotten rope slips off the bars to the ground (it is picked up again from there); they fetch the second chain and click
// it on the back gate late in a swing, so it goes on as the gate shuts, and lock it. The watcher is held still because the harness spends its unseen budget scanning.
// With both gates shut it is put at its own gate and looked at: through the gate's thin bars it is seen whole, and the bars
// are close enough to hold it, with a gap, not a bar, in the middle. Once both are locked, in the blinks of the ending it
// comes to its gate and shakes it three times with its fists on the bars, and does not get in.
const gate = id => "G.L.targets.find(t => t.id === '" + id + "')";
const item = id => "G.L.items.find(i => i.id === '" + id + "')";
const said = text => "G.lastToast.msg.includes('" + text + "')";
const select = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const lies = id => '!G.fumbling && !' + item(id) + '.taken && ' + item(id) + '.y === G.L.floor.y';   // dropped, and lying on the ground
const back = id => "!G.fumbling && G.hasItem('" + id + "') && G.hand.cur && G.hand.cur.id === '" + id + "'";   // back in the hand
module.exports = {
  nightmare: [
    ['eval', 'G.L.creature.hold = G.L.creature.dist;'],
    ['use', 'backgate'], ['expect', said('swings shut') + " && G.hand.reach && G.hand.reach.style === 'pull'", 'empty-handed, the open back gate is pulled shut'],
    ['waitUntil', gate('backgate') + '.shut', 3000],
    ['click', 'backgate'], ['expect', said('nothing holds it') + " && G.hand.reach && G.hand.reach.style === 'push'", 'pushed, the shut back gate with nothing to hold it'],
    ['waitUntil', gate('backgate') + '.angle > 0.1', 2000],   // swings out a little
    ['waitUntil', gate('backgate') + '.angle === 0 && ' + gate('backgate') + '.shut && ' + gate('backgate') + '.nudgeAt === undefined', 3000],   // and falls back shut
    ['pickup', 'chain'], ['pickup', 'padlock'], ['pickup', 'oldlock'],
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
    select('oldlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('Rusted solid') + " && !G.hasItem('oldlock')", 'the rusted padlock will not do: it leaves the hand'],
    ['click', 'gate'], ['expect', said('Rusted solid') + ' && G.fumbling && G.fumbling.it === ' + item('oldlock'), 'clicked again while it is still at the gate: nothing more is tried, its line stays'],
    ['waitUntil', lies('oldlock'), 4000],   // it will not snap shut, and drops by the gate
    select('padlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('locked shut') + ' && G.fumbling && G.fumbling.preset === "bump" && !G.fumbling.drop', 'the padlock will not open without its key: it is tugged at on the chain'],
    ['waitUntil', back('padlock') + " && G.inv.find(i => i.id === 'padlock').uses === 2", 3000],   // and comes back
    ['pickup', 'gatekey'], ['use', 'gate'], ['expect', gate('gate') + '.locked', 'gate locked'],
    select('gatekey'), ['use', 'backgate'], ['expect', '!' + gate('backgate') + '.chained && ' + said('nothing holds it'), 'a shut gate with no chain to hand says so'],
    ['waitUntil', back('gatekey'), 3000],   // the key pokes at the bars and comes back
    select('padlock'), ['use', 'backgate'], ['expect', '!' + gate('backgate') + '.locked && ' + said('nothing to close on') + ' && G.fumbling && G.fumbling.target === ' + gate('backgate'), 'the padlock on a shut gate with no chain has nothing to close on'],
    ['waitUntil', back('padlock'), 3000],
    ['pickup', 'rope'], ['use', 'backgate'], ['expect', '!' + gate('backgate') + ".chained && !G.hasItem('rope') && " + said('nothing holds it'), 'the rotten rope wound round the bars will not hold it'],
    ['waitUntil', lies('rope'), 4000],   // it slips off and falls
    ['pickup', 'rope'],
    // the second chain clicked on the back gate late in a swing (set going again here, as if just pulled to): it does not go
    // on a gate still swinging, nor is it thrown at a gate about to shut and knocked off; it goes on as the gate shuts
    ['pickup', 'chain2'], ['eval', '(g => { g.closing = 0.25; useTarget(g); })(' + gate('backgate') + ')'],
    ['expect', "G.hasItem('chain2') && !" + gate('backgate') + '.chained && !G.fumbling && ' + gate('backgate') + '.queued', 'a chain clicked late in the swing waits for the gate to shut'],
    ['waitUntil', gate('backgate') + ".shut && " + gate('backgate') + ".chained && !G.hasItem('chain2')", 2000],   // the second chain goes on the back gate as it shuts
    ['eval', '(() => { const c = G.L.creature; window.__hold = c.hold; c.hold = c.lane.barrierDist; G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = c.yaw; G.cam.pitch = G.cam.tPitch = 0; })()'], ['wait', 250],
    ['expect', 'G.L.creature.seen && G.L.creature.visFrac > 0.99 && ' + gate('gate') + '.shut && ' + gate('backgate') + '.shut', 'at its gate, through the shut gate, it is seen whole'],
    ['expect', 'G.L.s.bars.every((x, i, b) => i === 0 || x - b[i - 1] < 0.3) && !G.L.s.bars.some(x => Math.abs(x) < 0.08)', 'the bars are under 30 cm apart all the way across, with a gap in the middle'],
    ['eval', 'G.L.creature.hold = window.__hold;'],
    select('padlock'), ['use', 'backgate'], ['expect', gate('backgate') + ".locked && !G.hasItem('padlock')", 'back gate locked with the second padlock'],
    ['eval', 'G.L.creature.hold = null;'],
    ['waitUntil', 'G.L.s.after && G.L.s.after.rattles === 3', 9000],
    ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'in the blinks it came to its gate and shook it three times, and did not get in'],
    // once the gate has stopped jolting: as you see it now (the shut gate's bars and it, each as drawn, in its own measure
    // as it is drawn), one fist is on a bar either side of it and the hand it reaches with is in a gap
    ['wait', 1100],
    ['expect', '(() => { const L = G.L, c = L.creature, g = L.targets.find(t => t.id === (c.lane.idx === 0 ? "gate" : "backgate")), p = c.pos(), o = R.screenPos(p.x, p.y + (c.yOff || 0), p.z); const bars = y => L.s.bars.map(b => { const w = L.pt(g.sign * b, y, 2.6 * g.sign), r = R.screenPos(w[0], w[1], w[2]); return (r.x - o.x) / o.scale; }); return c.grip[0] < 0 && c.grip[1] > 0 && c.grip.every(x => bars(1.41).some(b => Math.abs(b - x) < 0.004)) && !bars(1.08).some(b => Math.abs(b - c.reach) < 0.08); })()', 'as you see it, its fists are on the bars either side of it, and its reaching hand is through a gap'],
  ],
};
