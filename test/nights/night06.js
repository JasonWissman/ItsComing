// The Boathouse: fit the winch handle and crank the water door down, or shut and bar the side door.
// Normal and Hard seal the lane it comes for (sealing it wins at once); Nightmare must seal both.
const winch = [['pickup', 'handle'], ['use', 'winch'], ['expect', 'G.L.s.handleIn', 'handle fitted'], ['clickUntil', 'winch', 'G.L.s.sealedN', 250, 12]];
const pinWinch = [['use', 'tacklebox'], ['pickup', 'pin'], ['pickup', 'handle'], ['use', 'winch'], ['expect', 'G.L.s.handleIn', 'handle fitted'], ['use', 'winch'], ['expect', '!G.L.s.needPin', 'pawl pin fitted'], ['clickUntil', 'winch', 'G.L.s.sealedN', 250, 12]];
const door = [['pickup', 'beam'], ['use', 'sidedoor'], ['waitUntil', 'G.L.s.doorClosed', 3000], ['use', 'sidedoor'], ['expect', 'G.L.s.sealedE', 'side door barred']];
module.exports = {
  normal: [['branch', 'G.L.lane.idx === 0', winch, door]],
  hard: [['branch', 'G.L.lane.idx === 0', pinWinch, door]],
  nightmare: pinWinch.concat(door),
};
