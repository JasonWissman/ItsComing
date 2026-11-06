// The Quarry: each gate is pulled shut, chained and padlocked, and the padlock needs its key. The player finds one chain,
// the padlock and the rusted padlock first, shuts and chains the gate, tries the rusted padlock (it will never open), tries
// the padlock without its key, then finds the key and locks it. At the back gate they shut it, find they have no chain left,
// fetch the second one, chain it and lock it. The watcher is held still because the harness spends its unseen budget scanning.
const gate = id => "G.L.targets.find(t => t.id === '" + id + "')";
const said = text => "G.lastToast.msg.includes('" + text + "')";
const select = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
module.exports = {
  nightmare: [
    ['eval', 'G.L.creature.hold = G.L.creature.dist;'],
    ['pickup', 'chain'], ['pickup', 'padlock'], ['pickup', 'oldlock'],
    ['use', 'gate'], ['expect', said('swings shut'), 'clicking the open gate swings it shut'],
    ['waitUntil', gate('gate') + '.shut', 3000],
    ['use', 'gate'], ['expect', gate('gate') + ".chained && !G.hasItem('chain')", 'the chain goes on the shut gate and is used up'],
    select('oldlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('Rusted solid'), 'the rusted padlock will not do'],
    select('padlock'), ['use', 'gate'], ['expect', '!' + gate('gate') + '.locked && ' + said('locked shut'), 'the padlock will not open without its key'],
    ['pickup', 'gatekey'], ['use', 'gate'], ['expect', gate('gate') + '.locked', 'gate locked'],
    ['use', 'backgate'], ['waitUntil', gate('backgate') + '.shut', 3000],
    ['use', 'backgate'], ['expect', '!' + gate('backgate') + '.chained && ' + said('nothing holds it'), 'a shut gate with no chain to hand says so'],
    ['pickup', 'chain2'], ['use', 'backgate'], ['expect', gate('backgate') + ".chained && !G.hasItem('chain2')", 'the second chain goes on the back gate'],
    ['use', 'backgate'], ['expect', gate('backgate') + ".locked && !G.hasItem('padlock')", 'back gate locked with the second padlock'],
    ['eval', 'G.L.creature.hold = null;'],
  ],
};
