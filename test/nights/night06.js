// The Boathouse: both ways must be shut. The winch is chained and padlocked, and the key is in the tackle box; the handle
// will not go on while the padlock is there. Unlock it, fit the handle and crank the water door down, then shut the side
// door and bar it. The player tries the handle first, then the oar (a decoy: it does not fit), before opening the tackle box.
// The key stays in the padlock once it is open.
const winch = [['pickup', 'handle'], ['use', 'winch'], ['expect', 'G.L.s.locked && !G.L.s.handleIn', 'the handle will not go on a padlocked winch'],
  ['pickup', 'oar'], ['expect', 'G.inv[G.active].id === "oar"', 'the oar is in hand'], ['use', 'winch'],
  ['expect', 'G.L.s.locked && !G.L.s.handleIn && G.lastToast.msg === "It does not fit the winch."', 'the oar does not fit the winch'],
  ['use', 'tacklebox'], ['expect', 'G.L.targets.find(t => t.id === "tacklebox").open', 'the tackle box is open'],
  ['expect', '(t => t.w > 1 && t.h > 0.5)(G.L.targets.find(t => t.id === "tacklebox"))', 'what you can click on the open box takes in its lid and trays'],
  ['pickup', 'winchkey'], ['use', 'winch'], ['expect', '!G.L.s.locked', 'padlock off'],
  ['expect', '!G.hasItem("winchkey") && G.inv[G.active].id === "handle"', 'the key stays in the padlock, and the handle is in hand'],
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
// door does. The door is shut by its leaf and barred from a bracket: the north one on odd seeds, the south one on even.
const door = [['pickup', 'beam'], ['face', 2], ['expect', parts + '.length === 3', 'facing the side door, the door and both its brackets can be pointed at'],
  part('north'), ['wait', 150], ['expect', showsDoor, 'pointing at the north bracket shows the side door'],
  part('south'), ['wait', 150], ['expect', showsDoor, 'pointing at the south bracket shows the side door'],
  part('door', true), ['expect', '!G.L.s.doorOpen', 'clicking the door shuts it'], ['waitUntil', 'G.L.s.doorClosed', 3000],
  ['branch', 'G.runSeed % 2 === 1',
    [part('north', true), ['expect', 'G.L.s.sealedE && !G.hasItem("beam")', 'clicking the north bracket puts the bar across']],
    [part('south', true), ['expect', 'G.L.s.sealedE && !G.hasItem("beam")', 'clicking the south bracket puts the bar across']]]];
module.exports = {
  nightmare: winch.concat(door),
};
