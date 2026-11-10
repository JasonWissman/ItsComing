// The Lighthouse, played twice. First the things that do not work before the blown fuse is out: a click on the lamp with
// nothing in hand (the hand goes to it and the old bulb rattles in its socket); the fuse box opened (the hand pulls its door
// open); the worn fuse lying about, and then the new one from the toolbox (tried in the open toolbox, it comes back), tried
// at the clips with the blown fuse still in (each knocks against it and comes back to the hand); and, without the new one,
// the blown fuse taken out and pushed back with the worn one about you (it is the one tried, and drops out). Then from the start: the
// spare bulb; open the fuse box and pull out
// the blown fuse; push it back into the empty clips (it sits there a beat and drops out to the floor, where it is picked up
// again); the bulb tried at the empty clips (back to the hand); the bulb into the lamp; the worn fuse into the clips (blown
// as well: it drops out to the floor too, and is picked up again); the new one from the toolbox; one turn of the crank before
// the lamp is lit (the lamp goes round a little with it, dark); then turn the crank until the light goes round. On the way it
// checks that the open door is part of the fuse box, and that the empty holder says "the one that blew" only when that is
// what you are holding. Won, the beam knocks the thing off the tower: it lets go of the stone, clear of the wall, and goes
// into the sea beyond the foot of the tower (14.7 m from its axis) before the night fades.
const crank = [['clickUntil', 'winder', 'G.L.s.turning', 250, 12],
  ['waitUntil', '!!G.L.s.fall', 9000],
  ['waitUntil', 'G.L.creature.gone && !!G.L.s.splash && G.state === "won"', 6000],
  ['expect', 'Math.hypot(G.L.s.splash.at[0] - G.L.pt(0, 0, -2.9)[0], G.L.s.splash.at[2] - G.L.pt(0, 0, -2.9)[2]) > 15.5', 'it went into the sea clear of the foot of the tower']];
const said = line => 'G.lastToast.msg === ' + JSON.stringify(line);
const item = id => 'G.L.items.find(i => i.id === "' + id + '")';
const hold = id => ['eval', 'G.active = G.inv.findIndex(i => i.id === "' + id + '")'];
// a thing tried where it will not go comes back to the hand: it went there and back, and is in hand again
const comesBack = (id, what) => [
  ['expect', 'G.fumbling && G.fumbling.preset === "return" && !G.fumbling.drop && G.fumbling.it.id === "' + id + '"', what + ': it goes there'],
  ['waitUntil', '!G.fumbling', 3000],
  ['expect', 'G.inv[G.active] && G.inv[G.active].id === "' + id + '"', what + ': and comes back to the hand'],
];
// a fuse pushed into the empty clips that will not do: it is put in place there, drops out to the floor and lies there, out
// of the hand, where a click takes it again
const dropsOut = (id, what) => [
  ['expect', 'G.fumbling && G.fumbling.preset === "slip" && G.fumbling.drop && G.fumbling.it.id === "' + id + '" && !G.hasItem("' + id + '")', what + ': it goes into the clips, out of the hand'],
  ['waitUntil', '!G.fumbling && !' + item(id) + '.taken', 4000],
  ['expect', item(id) + '.y === G.L.floor.y && !G.hasItem("' + id + '") && !G.L.s.fuse', what + ': it dropped out of the clips to the floor and lies there'],
  ['pickup', id],
];
const blownStillIn = [
  ['use', 'lamp'], ['expect', 'G.hand.reach && G.hand.reach.target.id === "lamp"', 'nothing in hand: the hand goes to the lamp'],
  ['waitUntil', 'G.L.s.jig !== undefined && !G.hand.reach', 3000],
  ['use', 'fusebox'], ['expect', 'G.L.s.open && G.L.s.blownIn && G.hand.reach && G.hand.reach.style === "pull"', 'fuse box open, the blown fuse still in it: the hand pulls its door'],
  ['waitUntil', 'G.L.s.creaked && G.L.t - G.L.s.openAt > 0.4 && !G.hand.reach', 3000],
  ['pickup', 'oldfuse'], ['face', 2], ['click', 'fusedoor'], ['expect', said('The blown fuse is still in it.') + ' && G.L.s.blownIn', 'the worn fuse with the blown one still in'],
  ...comesBack('oldfuse', 'the worn fuse at the clips with the blown one still in'),
  ['use', 'toolbox'], ['pickup', 'fuse'], ['use', 'toolbox'], ...comesBack('fuse', 'the toolbox open already'), ['face', 2], ['click', 'fusedoor'], ['expect', said('The blown fuse is still in it.') + ' && G.L.s.blownIn && !G.L.s.fuse', 'the new fuse with the blown one still in'],
  ...comesBack('fuse', 'the new fuse at the clips with the blown one still in'),
  // without the new one: the blown fuse taken out and pushed back with the worn one about you is the one tried (not the worn one)
  ['eval', 'G.removeFromInv(G.inv.find(i => i.id === "fuse"))'],
  ['use', 'blownfuse'], ['face', 2], ['click', 'fusedoor'],
  ['expect', said('That is the one that blew.') + ' && G.fumbling && G.fumbling.it.id === "blownfuse" && G.hasItem("oldfuse")', 'the blown fuse in hand is the one tried, though the worn one is about you too'],
  ...dropsOut('blownfuse', 'the blown fuse pushed back in, the worn one about you'),
  ['eval', 'restartLevel()'], ['wait', 300],
];
module.exports = {
  nightmare: blownStillIn.concat([
    ['pickup', 'bulb'],
    ['use', 'fusebox'], ['expect', 'G.L.s.open && G.L.s.blownIn && (G.L.targets.find(t => t.id === "blownfuse").hidden || G.L.t >= G.L.s.openAt + 0.2)', 'fuse box open, the blown fuse still in it (to point at once the door has swung)'],
    ['waitUntil', '!G.L.targets.find(t => t.id === "blownfuse").hidden', 2000],
    ['use', 'blownfuse'], ['expect', '!G.L.s.blownIn && G.inv.some(i => i.id === "blownfuse" && i.decoy) && G.inv[G.active].id === "blownfuse"', 'the blown fuse is out, in hand and worn'],
    ['click', 'fusedoor'], ['expect', said('That is the one that blew.'), 'the open door is the fuse box, and the fuse in hand is the one that blew'],
    ...dropsOut('blownfuse', 'the blown fuse pushed back in'),
    hold('bulb'), ['click', 'fusebox'], ['expect', said('The fuse holder is empty.'), 'with the bulb in hand the holder is only empty'],
    ...comesBack('bulb', 'the bulb at the empty clips'),
    ['use', 'lamp'], ['expect', 'G.L.s.bulb && !G.L.s.power', 'bulb in, but no power yet'],
    ['pickup', 'oldfuse'], ['eval', 'window.__u = G.L.creature.u'], ['use', 'fusebox'], ['expect', said('This one is blown as well.') + ' && G.L.creature.u > __u', 'the fuse lying about is no good, and costs a little time'],
    ...dropsOut('oldfuse', 'the worn fuse lying about'),
    ['use', 'toolbox'], ['expect', 'G.L.targets.find(t => t.id === "toolbox").open', 'the toolbox is open'],
    ['pickup', 'fuse'],
    ['use', 'winder'], ['waitUntil', 'G.L.s.lensA > 0.12 && !G.L.s.turning', 2000],   // a turn before the lamp is lit: the lamp goes round a little with it, dark
    ['use', 'fusebox'], ['expect', 'G.L.s.fuse && G.L.s.power', 'new fuse in, the lamp is lit']]).concat(crank),
};
