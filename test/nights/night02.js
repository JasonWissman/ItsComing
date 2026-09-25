// The Road: keys into the ignition, crank until it catches. Hard pulls the choke first; Nightmare must wait between
// cranks (a second crank inside three seconds floods it) and carries a decoy set of house keys that the ignition refuses.
module.exports = {
  normal: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6]],
  hard: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['use', 'choke'], ['expect', 'G.L.s.choke', 'choke pulled'], ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6]],
  nightmare: [['pickup', 'housekeys'], ['use', 'ignition'], ['expect', '!G.L.s.keyIn', 'house keys refused'], ['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['use', 'choke'], ['expect', 'G.L.s.choke', 'choke pulled'],
    ['click', 'ignition'], ['wait', 1400], ['click', 'ignition'], ['expect', 'G.L.s.cranks === 0 && G.L.s.cranking > 0', 'a second crank inside three seconds floods it'], ['wait', 3200], ['clickUntil', 'ignition', 'G.L.s.started', 3300, 6]],
};
