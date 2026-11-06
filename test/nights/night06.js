// The Boathouse: fit the winch handle and crank the water door down, or shut and bar the side door.
// Normal seals the way it comes for (sealing it wins at once); Nightmare must seal both, and the winch is chained
// and padlocked: the key is in the tackle box. The handle will not go on while the padlock is there.
const winch = [['pickup', 'handle'], ['use', 'winch'], ['expect', 'G.L.s.handleIn', 'handle fitted'], ['clickUntil', 'winch', 'G.L.s.sealedN', 250, 12]];
const lockedWinch = [['pickup', 'handle'], ['use', 'winch'], ['expect', 'G.L.s.locked && !G.L.s.handleIn', 'the handle will not go on a padlocked winch'], ['use', 'tacklebox'], ['pickup', 'winchkey'], ['use', 'winch'], ['expect', '!G.L.s.locked', 'padlock off'],
  ['use', 'winch'], ['expect', 'G.L.s.handleIn', 'handle fitted'], ['clickUntil', 'winch', 'G.L.s.sealedN', 250, 12]];
const door = [['pickup', 'beam'], ['use', 'sidedoor'], ['waitUntil', 'G.L.s.doorClosed', 3000], ['use', 'sidedoor'], ['expect', 'G.L.s.sealedE', 'side door barred']];
module.exports = {
  nightmare: lockedWinch.concat(door),
};
