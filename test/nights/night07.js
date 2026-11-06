// The Lighthouse: the spare bulb into the lamp; open the fuse box and pull out the blown fuse; try the worn fuse lying
// about (it is blown as well), take the new one from the toolbox and put it in; then turn the crank until the light goes round.
const crank = [['clickUntil', 'winder', 'G.L.s.turning', 250, 12]];
module.exports = {
  nightmare: [['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.bulb && !G.L.s.power', 'bulb in, but no power yet'],
    ['use', 'fusebox'], ['expect', 'G.L.s.open && G.L.s.blownIn', 'fuse box open, the blown fuse still in it'],
    ['use', 'blownfuse'], ['expect', '!G.L.s.blownIn && G.inv.some(i => i.id === "blownfuse" && i.decoy)', 'the blown fuse is out, in hand and worn'],
    ['pickup', 'oldfuse'], ['use', 'fusebox'], ['expect', '!G.L.s.fuse', 'the fuse lying about is no good'],
    ['use', 'toolbox'], ['expect', 'G.L.targets.find(t => t.id === "toolbox").open', 'the toolbox is open'],
    ['pickup', 'fuse'], ['use', 'fusebox'], ['expect', 'G.L.s.fuse && G.L.s.power', 'new fuse in, the lamp is lit']].concat(crank),
};
