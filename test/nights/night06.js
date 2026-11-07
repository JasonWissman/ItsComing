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
const door = [['pickup', 'beam'], ['use', 'sidedoor'], ['waitUntil', 'G.L.s.doorClosed', 3000], ['use', 'sidedoor'], ['expect', 'G.L.s.sealedE', 'side door barred']];
module.exports = {
  nightmare: winch.concat(door),
};
