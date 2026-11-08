// The Quarry: each gate is pulled shut, chained and padlocked, and the padlock needs its key. The player finds one chain,
// the padlock and the rusted padlock first, shuts and chains the gate, tries the rusted padlock (it will never open), tries
// the padlock without its key, then finds the key and locks it. At the back gate they shut it, find they have no chain left,
// fetch the second one, chain it and lock it. On the way it checks a click while the gate swings shut (no chain used up)
// and the padlock tried on a shut gate before its chain. The watcher is held still because the harness spends its unseen budget scanning.
// With both gates shut it is put at its own gate and looked at: through the gate's open middle it is seen whole. Once both
// are locked, in the blinks of the ending it comes to its gate and shakes it three times, and does not get in.
const gate = id => "G.L.targets.find(t => t.id === '" + id + "')";
const said = text => "G.lastToast.msg.includes('" + text + "')";
const select = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
module.exports = {
  nightmare: [
    ['eval', 'G.L.creature.hold = G.L.creature.dist;'],
    ['pickup', 'chain'], ['pickup', 'padlock'], ['pickup', 'oldlock'],
    ['use', 'gate'], ['expect', said('swings shut'), 'clicking the open gate swings it shut'],
    ['click', 'gate'], ['expect', said('still swinging') + " && G.hasItem('chain') && !" + gate('gate') + '.chained', 'a click while it swings says so and does not use up the chain'],
    ['waitUntil', gate('gate') + '.shut', 3000],
    ['use', 'gate'], ['expect', gate('gate') + ".chained && !G.hasItem('chain')", 'the chain goes on the shut gate and is used up'],
    select('oldlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('Rusted solid'), 'the rusted padlock will not do'],
    select('padlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('locked shut'), 'the padlock will not open without its key'],
    ['pickup', 'gatekey'], ['use', 'gate'], ['expect', gate('gate') + '.locked', 'gate locked'],
    ['use', 'backgate'], ['waitUntil', gate('backgate') + '.shut', 3000],
    ['use', 'backgate'], ['expect', '!' + gate('backgate') + '.chained && ' + said('nothing holds it'), 'a shut gate with no chain to hand says so'],
    select('padlock'), ['use', 'backgate'], ['expect', '!' + gate('backgate') + '.locked && ' + said('nothing to close on'), 'the padlock on a shut gate with no chain has nothing to close on'],
    ['pickup', 'chain2'], ['use', 'backgate'], ['expect', gate('backgate') + ".chained && !G.hasItem('chain2')", 'the second chain goes on the back gate'],
    ['eval', '(() => { const c = G.L.creature; window.__hold = c.hold; c.hold = c.lane.barrierDist; G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = c.yaw; G.cam.pitch = G.cam.tPitch = 0; })()'], ['wait', 250],
    ['expect', 'G.L.creature.seen && G.L.creature.visFrac > 0.99 && ' + gate('gate') + '.shut && ' + gate('backgate') + '.shut', 'at its gate, through the shut gate, it is seen whole'],
    ['eval', 'G.L.creature.hold = window.__hold;'],
    ['use', 'backgate'], ['expect', gate('backgate') + ".locked && !G.hasItem('padlock')", 'back gate locked with the second padlock'],
    ['eval', 'G.L.creature.hold = null;'],
    ['waitUntil', 'G.L.s.after && G.L.s.after.rattles === 3', 9000],
    ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'in the blinks it came to its gate and shook it three times, and did not get in'],
  ],
};
