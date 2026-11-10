// The Boathouse: both ways must be shut. The winch is chained and padlocked, and the key is in the tackle box; the handle
// will not go on while the padlock is there. Unlock it, fit the handle and crank the water door down, then shut the side
// door and bar it. The player first tries the winch with nothing in hand (the hand rattles the padlock on its chain), then
// the handle (it goes on the boss, the chain snaps taut, the padlock jumps, and it comes back to the hand), then the oar (a
// decoy: it does not fit; its end jams at the boss and it drops to the deck, where it lies to be picked up again), before
// opening the tackle box. The open box, clicked again, is gone through by hand. The key goes into the padlock and stays
// there once it is open. While the harness stands and watches one of those play out (the hand at the padlock, the handle
// coming back, the oar falling and being picked up again, the box gone through, the key going in), the thing is held where
// it is, so the race against it is the one the solution always ran: the tries cost no more than they did as a line of text.
const oar = "G.L.items.find(i => i.id === 'oar')";
const pause = ['eval', '(c => { window.__held6 = c.hold; if (c.hold === null) c.hold = c.dist; })(G.L.creature)'];
const resume = ['eval', '(c => { if (window.__held6 === null) c.hold = null; })(G.L.creature)'];
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
// bar, the north one to the left and the south one to the right. part(which) points the mouse at one, as a player would,
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
// door does. The door is shut by its leaf (the hand reaches out and pulls it to), and the bar put up while it is still
// swinging shut is knocked back into your hands by the leaf; once it is shut, the bar goes across from a bracket: the
// north one on odd seeds, the south one on even.
const door = [['pickup', 'beam'], ['face', 2], ['expect', parts + '.length === 3', 'facing the side door, the door and both its brackets can be pointed at'],
  part('north'), ['wait', 150], ['expect', showsDoor, 'pointing at the north bracket shows the side door'],
  part('south'), ['wait', 150], ['expect', showsDoor, 'pointing at the south bracket shows the side door'],
  part('door', true), ['expect', '!G.L.s.doorOpen && G.hand.reach && G.hand.reach.style === "pull"', 'clicking the door shuts it: the hand pulls it to'],
  part('door', true), ['expect', '!G.L.s.doorClosed && !G.L.s.sealedE && G.fumbling && G.fumbling.target.id === "sidedoor" && !G.fumbling.drop', 'the bar put up while it swings shut is not across'],
  part('door', true), ['expect', '(fx => fx && fx.target.id === "sidedoor" && (fx.hitDone > 0 || G.L.s.leafSlow))(G.fumbling)', 'clicked again while the bar is on its way: no second one, and the leaf is still slowed for it'],
  ['waitUntil', '!G.fumbling && G.L.s.doorClosed', 4000],
  ['expect', 'G.inv[G.active].id === "beam" && !G.L.s.sealedE', 'the leaf knocked it back into your hands, and the door is shut'],
  ['branch', 'G.runSeed % 2 === 1',
    [part('north', true), ['expect', 'G.L.s.sealedE && !G.hasItem("beam")', 'clicking the north bracket puts the bar across']],
    [part('south', true), ['expect', 'G.L.s.sealedE && !G.hasItem("beam")', 'clicking the south bracket puts the bar across']]]];
module.exports = {
  nightmare: winch.concat(door),
};
