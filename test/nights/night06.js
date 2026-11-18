// The Boathouse: both ways must be shut. The winch is chained and padlocked, and the key is in the tackle box; the handle
// will not go on while the padlock is there. Unlock it, fit the handle and crank the water door down, then shut the side
// door and bar it with both oars (one alone is not enough: it breaks through, and the night says so). The player first
// tries the winch with nothing in hand (the hand rattles the padlock on its chain), then the handle (it goes on the boss,
// the chain snaps taut, the padlock jumps, and it comes back to the hand), then an oar (it does not fit; its end jams at
// the boss and it drops to the deck, where it lies to be picked up again), before
// opening the tackle box. The open box, clicked again, is gone through by hand. The key goes into the padlock and stays
// there once it is open. While the harness stands and watches one of those play out (the hand at the padlock, the handle
// coming back, the oar falling and being picked up again, the box gone through, the key going in, an oar knocked back by
// the side door's leaf), the thing is held where
// it is, so the race against it is the one the solution always ran: the tries cost no more than they did as a line of text.
const oar = "G.L.items.find(i => i.id === 'oar')";
const pause = ['eval', '(c => { window.__held6 = c.hold; if (c.hold === null) c.hold = c.dist; })(G.L.creature)'];
const resume = ['eval', '(c => { if (window.__held6 === null) c.hold = null; })(G.L.creature)'];
// one oar across the shut side door does not hold it: it throws itself at the door, the oar snaps, the door bursts open
// and it comes in; the death screen says why. (Set up directly, then the night starts again.)
const oneOar = [
  ['eval', `(() => { const s = G.L.s, c = G.L.creature, ln = G.L.lanes[1];
    Object.assign(s, { doorOpen: false, doorClosing: 0, doorClosed: true, doorA: 0, oars: 1 });
    c.retarget(1); c.switched = true; G.L.laneIdx = 1; G.L.lane = ln; G.L.barrierDist = ln.barrierDist;
    c.u = 1 - Math.pow(4 / c.D0, 1 / c.gamma); c.hold = null; c.mode = 'up'; c.modeT = 0; c.upFor = 99; })()`],
  ['waitUntil', '!!G.L.s.snap', 6000], ['expect', 'G.L.s.oars === 0 && G.L.s.doorOpen && !G.L.s.sealedE', 'with one oar across, it breaks the oar and the door bursts open'],
  ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 8000],
  ['expect', "G.deathCause === 'oneoar' && deathLine(G.L).includes(\"One oar wasn't strong enough.\")", 'and the death screen says one oar was not strong enough'],
  ['eval', 'restartLevel();'], ['wait', 1500], ['expect', "G.state === 'play' && !G.L.s.snap && G.L.s.oars === 0", 'the night starts again'],
];
const winch = [
  pause, ['use', 'winch'], ['expect', 'G.L.s.locked && G.hand.reach && G.hand.reach.target.id === "winch" && G.hand.reach.style === "rattle"', 'with nothing in hand the hand goes to the padlock and rattles it'],
  ['waitUntil', 'G.L.s.rattleT > 0 && !G.hand.reach', 3000], resume,
  ['pickup', 'handle'], ['use', 'winch'], ['expect', 'G.L.s.locked && !G.L.s.handleIn', 'the handle will not go on a padlocked winch'],
  ['expect', 'G.fumbling && G.fumbling.target.id === "winch" && G.fumbling.preset === "return" && !G.fumbling.drop', 'the handle is tried on the boss'],
  pause, ['waitUntil', '!G.fumbling', 3000],
  ['expect', 'G.L.s.joltT > 0 && G.inv[G.active].id === "handle"', 'the chain snapped taut against it, and the handle came back to the hand'], resume,
  ['pickup', 'oar'], ['expect', 'G.inv[G.active].id === "oar"', 'the oar is in hand'], ['use', 'winch'],
  ['expect', 'G.L.s.locked && !G.L.s.handleIn && G.lastToast.msg === "It does not fit the winch."', 'the oar does not fit the winch'],
  ['expect', 'G.fumbling && G.fumbling.preset === "bump" && G.fumbling.drop && !G.hasItem("oar")', 'it jams at the boss and leaves the hands'],
  pause, ['waitUntil', '!G.fumbling && !' + oar + '.taken', 4000],
  ['expect', '(o => o.y === G.L.floor.y && o.flat)(' + oar + ')', 'it dropped to the deck and lies there'],
  ['pickup', 'oar'], ['expect', 'G.hasItem("oar")', 'it can be picked up again from where it fell'], resume,
  ['use', 'tacklebox'], ['expect', 'G.L.targets.find(t => t.id === "tacklebox").open', 'the tackle box is open'],
  ['expect', '(t => t.w > 1 && t.h > 0.5)(G.L.targets.find(t => t.id === "tacklebox"))', 'what you can click on the open box takes in its lid and trays'],
  ['pickup', 'winchkey'], pause, ['use', 'tacklebox'], ['expect', 'G.hand.reach && G.hand.reach.target.id === "tacklebox" && G.hand.reach.style === "rattle"', 'the open box, clicked again, is gone through by hand'], resume,
  ['use', 'winch'], ['expect', '!G.L.s.locked', 'padlock off'],
  ['expect', '!G.hasItem("winchkey") && G.inv[G.active].id === "handle"', 'the key stays in the padlock, and the handle is in hand'],
  pause, ['waitUntil', '!G.L.s.keyGoing', 3000], resume,
  ['use', 'winch'], ['expect', 'G.L.s.handleIn', 'handle fitted'], ['clickUntil', 'winch', 'G.L.s.sealedN', 250, 12]];
// The side door's parts on screen, facing east: its own (the largest), and the brackets either side of it that take the
// oars, the north one to the left and the south one to the right. part(which) points the mouse at one, as a player would,
// and part(which, true) clicks it there.
const parts = 'R.hits.filter(h => h.kind === "target" && h.ref.id === "sidedoor")';
const part = (which, click) => ['eval', `(() => {
  const hs = ${parts}, door = hs.reduce((a, b) => (b.w * b.h > a.w * a.h ? b : a)), br = hs.filter(h => h !== door).sort((a, b) => a.x - b.x);
  const h = ${JSON.stringify(which)} === 'door' ? door : br[${JSON.stringify(which)} === 'north' ? 0 : 1];
  const at = { clientX: h.x + h.w / 2, clientY: h.y + h.h / 2, bubbles: true };
  UI.canvas.dispatchEvent(new MouseEvent('mousemove', at));
  if (${!!click}) UI.canvas.dispatchEvent(new MouseEvent('click', at));
})()`];
const showsDoor = 'G.hover && G.hover.ref.id === "sidedoor" && UI.tooltip.textContent === "Side door"';
// The brackets are part of the door: pointing at either shows the side door, and clicking either does what clicking the
// door does. The door is shut by its leaf (the hand reaches out and pulls it to), and an oar put up while it is still
// swinging shut is knocked back into your hands by the leaf; once it is shut, an oar goes across from a bracket (the
// north one on odd seeds, the south one on even), which is not yet enough, and the other on top of it from the other one.
const door = [['pickup', 'oar2'], ['face', 2], ['expect', parts + '.length === 3', 'facing the side door, the door and both its brackets can be pointed at'],
  part('north'), ['wait', 150], ['expect', showsDoor, 'pointing at the north bracket shows the side door'],
  part('south'), ['wait', 150], ['expect', showsDoor, 'pointing at the south bracket shows the side door'],
  part('door', true), ['expect', '!G.L.s.doorOpen && G.hand.reach && G.hand.reach.style === "pull"', 'clicking the door shuts it: the hand pulls it to'],
  pause, part('door', true), ['expect', '!G.L.s.doorClosed && !G.L.s.sealedE && G.fumbling && G.fumbling.target.id === "sidedoor" && !G.fumbling.drop', 'the oar put up while it swings shut is not across'],
  part('door', true), ['expect', '(fx => fx && fx.target.id === "sidedoor" && (fx.hitDone > 0 || G.L.s.leafSlow))(G.fumbling)', 'clicked again while the oar is on its way: no second one, and the leaf is still slowed for it'],
  ['waitUntil', '!G.fumbling && G.L.s.doorClosed', 4000],
  ['expect', 'G.inv[G.active].id === "oar2" && !G.L.s.sealedE', 'the leaf knocked it back into your hands, and the door is shut'], resume,
  ['branch', 'G.runSeed % 2 === 1',
    [part('north', true), ['expect', 'G.L.s.oars === 1 && !G.L.s.sealedE && !G.hasItem("oar2")', 'clicking the north bracket puts one oar across, and that is not yet enough'],
      ['wait', 300], part('south', true)],
    [part('south', true), ['expect', 'G.L.s.oars === 1 && !G.L.s.sealedE && !G.hasItem("oar2")', 'clicking the south bracket puts one oar across, and that is not yet enough'],
      ['wait', 300], part('north', true)]],
  ['expect', 'G.L.s.oars === 2 && G.L.s.sealedE && !G.hasItem("oar")', 'the other oar goes across on top of it from the other bracket: barred']];
// the rain falls outside only: seen through the water door and the open side door, never indoors, nor through the side
// door's leaf swung out over the water; with both ways shut there is none in view at all
const sh = 'G.L.weatherShelter()';
const hides = (x, y, z) => '(p => ' + sh + '.hides(p[0], p[1], p[2]))(G.L.pt(' + x + ', ' + y + ', ' + z + '))';
const rain = [
  ['expect', "WEATHER.kind === 'rain' && " + sh + '.openings.length === 2', 'the rain is seen through the two openings, the water door and the side door'],
  ['expect', [hides(0, 1.5, 0), hides(-2, 0.5, -2), hides(1.5, 2.8, 2.4), '!' + hides(0, 1.5, 6), '!' + hides(4.5, 1.5, 0), '!' + hides(-4, 1, 5)].join(' && '), 'none of it falls indoors; out over the water it does'],
  ['expect', hides(5, 1, -0.7) + ' && !' + hides(5, 1, 0.5), 'out past the side door, the rain behind its open leaf is hidden by it, the rain beside it is not'],
];
const shutIn = [['wait', 300], ['expect', 'G.L.s.sealedN && G.L.s.sealedE && ' + sh + '.openings.length === 0', 'with both ways shut, no rain is in view']];
// Every place the winch handle can start rests on something drawn there to bear it: at each spot, jittered as far as it
// may be either way, there is a level face of the room (the deck, the workbench, the shelf, the rowboat's bottom) at its
// height under it. Nothing hangs on the walls, where no nail or hook is drawn. And the handle this time lies at one of them.
const onSurface = `(() => {
  const L = G.L, flats = L.props.filter(p => p.kind === 'poly' && p.pts.length >= 3 && !p.detail && p.pts.every(v => Math.abs(v[1] - p.pts[0][1]) < 1e-4));
  const inside = (x, z, pts) => { let c = false; for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) { const A = pts[a], B = pts[b]; if ((A[2] > z) !== (B[2] > z) && x < (B[0] - A[0]) * (z - A[2]) / (B[2] - A[2]) + A[0]) c = !c; } return c; };
  const under = (x, y, z) => flats.some(p => Math.abs(p.pts[0][1] - y) < 0.03 && inside(x, z, p.pts));
  const bad = L.handleSpots.filter(sp => { const j = sp.jitter !== undefined ? sp.jitter : sp.flat === false ? 0 : 0.12;
    return [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, 0]].some(([a, b]) => { const w = L.pt(sp.x + a * j, sp.y, sp.z + b * j); return !under(w[0], w[1], w[2]); }); });
  const h = L.items.find(i => i.id === 'handle');
  return L.handleSpots.length >= 4 && !bad.length && L.handleSpots.some(sp => Math.abs(sp.y - h.y) < 1e-6) && under(h.x, h.y, h.z);
})()`;
const handleSpots = [['expect', onSurface, 'every place the winch handle can start rests on a surface drawn there (deck, bench, shelf, boat), and it lies on one']];
module.exports = {
  nightmare: handleSpots.concat(rain, oneOar, winch, door, shutIn),
};
