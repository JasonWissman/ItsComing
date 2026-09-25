// The Road: keys into the ignition, crank until it catches. Hard pulls the choke first; Nightmare must wait between cranks.
module.exports = {
  normal: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6]],
  hard: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['use', 'choke'], ['expect', 'G.L.s.choke', 'choke pulled'], ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6]],
  nightmare: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['use', 'choke'], ['expect', 'G.L.s.choke', 'choke pulled'], ['clickUntil', 'ignition', 'G.L.s.started', 3300, 6]],
};
