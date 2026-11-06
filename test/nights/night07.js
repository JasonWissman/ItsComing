// The Lighthouse: the spare bulb into the lamp, then turn the crank until the light goes round.
// Nightmare: no power until a new fuse (from the tool locker) is in the fuse box; a blown one lies about as well.
const crank = [['clickUntil', 'winder', 'G.L.s.turning', 250, 12]];
module.exports = {
  normal: [['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.bulb && G.L.s.power', 'bulb in, the lamp is lit']].concat(crank),
  nightmare: [['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.bulb && !G.L.s.power', 'bulb in, but no power yet'], ['use', 'fusebox'], ['expect', 'G.L.s.open', 'fuse box open'],
    ['pickup', 'oldfuse'], ['use', 'fusebox'], ['expect', '!G.L.s.fuse', 'the blown fuse is no good'],
    ['use', 'locker'], ['pickup', 'fuse'], ['use', 'fusebox'], ['expect', 'G.L.s.fuse && G.L.s.power', 'new fuse in, the lamp is lit']].concat(crank),
};
