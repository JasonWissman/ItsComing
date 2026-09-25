// The Road: keys into the ignition, crank until it catches.
module.exports = {
  normal: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6]],
};
