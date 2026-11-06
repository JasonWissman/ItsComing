// The Crossing: bar the door the crawler is coming for, throw the track switch to his track, and stop the
// signalman with the red light whenever the lever is free until the train has him. Nightmare fills the signal
// lamp with oil, unlocks the levers with the key from the tin, and bars both doors (the bar has two uses).
const pulse = ['waitUntil', "(G.L.s.taken ? true : ((G.L.s.red <= 0 && G.L.s.stiff <= 0 && !G.L.s.frameLocked && G.L.s.lampLit) ? (useTarget(G.L.targets.find(t => t.id === 'signal')), false) : false))", 90000];
const bar = [['pickup', 'beam'], ['branch', 'G.L.creatures[1].lane.idx === 1', [['use', 'stairdoor'], ['expect', 'G.L.s.barred[1]', 'stair door barred']], [['use', 'roaddoor'], ['expect', 'G.L.s.barred[2]', 'road door barred']]]];
const points = [['use', 'points'], ['expect', "G.L.s.points === 'near'", 'points set to the near line']];
module.exports = {
  nightmare: [['pickup', 'oilcan'], ['use', 'lamp'], ['expect', 'G.L.s.lampLit', 'signal lamp lit'], ['use', 'tin'], ['pickup', 'framekey'], ['use', 'frame'], ['expect', '!G.L.s.frameLocked', 'frame unlocked'], ['pickup', 'beam'], ['use', 'stairdoor'], ['use', 'roaddoor'], ['expect', 'G.L.s.barred[1] && G.L.s.barred[2]', 'both doors barred']].concat(points, [pulse, ['expect', 'G.L.s.taken', 'the train took him']]),
};
