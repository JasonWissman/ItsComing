// The Road: keys into the ignition, turn the key until it catches. Nightmare stalled in drive: the key does nothing
// until the gearstick is in park, and there is a set of house keys lying about that the ignition refuses.
module.exports = {
  nightmare: [['pickup', 'housekeys'], ['use', 'ignition'], ['expect', '!G.L.s.keyIn', 'house keys refused'], ['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'],
    ['use', 'ignition'], ['expect', 'G.L.s.cranks === 0 && G.L.s.inDrive', 'in drive the key does nothing'], ['use', 'gear'], ['expect', '!G.L.s.inDrive', 'into park'],
    ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6], ['expect', 'G.L.s.started', 'engine started']],
};
