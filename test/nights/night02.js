// The Road: keys into the ignition, crank until it catches. Hard pulls the choke first; Nightmare must wait between
// cranks (a second crank inside three seconds floods it) and carries a decoy set of house keys that the ignition refuses.
// The Nightmare crank loop goes by the game clock, not the wall clock, so a slow machine cannot flood it by accident.
// between cranks the harness looks up the road at it, as a player would, since watching it is what buys the waiting time
const crankWhenReady = ['waitUntil', "G.L.s.started ? true : ((G.L.s.cranking <= 0 && G.L.t - G.L.s.lastCrank >= 3.05) ? (useTarget(G.L.targets.find(t => t.id === 'ignition')), false) : (G.cam.dirIdx = 0, G.cam.yaw = G.cam.tYaw = 0, G.cam.pitch = G.cam.tPitch = 0, false))", 30000];
module.exports = {
  normal: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6]],
  hard: [['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['use', 'choke'], ['expect', 'G.L.s.choke', 'choke pulled'], ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6]],
  nightmare: [['pickup', 'housekeys'], ['use', 'ignition'], ['expect', '!G.L.s.keyIn', 'house keys refused'], ['pickup', 'keys'], ['use', 'ignition'], ['expect', 'G.L.s.keyIn', 'key inserted'], ['use', 'choke'], ['expect', 'G.L.s.choke', 'choke pulled'],
    ['click', 'ignition'], ['waitUntil', 'G.L.s.cranking <= 0 && G.L.s.cranks === 1', 4000], ['click', 'ignition'], ['expect', 'G.L.s.cranks === 0 && G.L.s.cranking > 0', 'a second crank inside three seconds floods it'], crankWhenReady, ['expect', 'G.L.s.started', 'engine started']],
};
