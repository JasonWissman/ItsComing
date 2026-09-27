// The Clearing: gun and shells, let it get close, two hits. The harder tiers spread the shells over two boxes,
// and on Nightmare one box is duds: the harness proves the duds do not fire before it finds the real box.
// The thing is held in place while the shots are lined up so the test is not a race against Nightmare speed.
const hold = ['eval', 'const c = G.L.creature; c.switched = true; c.u = 0.9; c.hold = c.D0 * Math.pow(0.1, c.gamma); G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;'];
const shoot = [hold, ['wait', 400], ['shoot'], ['expect', 'G.L.creature.wounded', 'first shot wounded it'], ['wait', 500], ['shoot'], ['expect', 'G.L.creature.dead', 'second shot killed it']];
module.exports = {
  normal: [['pickup', 'shotgun'], ['pickup', 'shells']].concat(shoot),
  hard: [['pickup', 'shotgun'], ['pickup', 'shells'], ['pickup', 'shells'], ['expect', "G.inv.filter(i => i.id === 'shells').length === 2", 'both boxes picked up']].concat(shoot),
  nightmare: [['pickup', 'shotgun'], ['pickup', 'duds'], hold, ['wait', 400], ['shoot'], ['expect', "!G.L.creature.wounded && G.inv.some(i => i.id === 'duds' && i.uses === 3)", 'the duds do not fire'], ['pickup', 'shells'], ['expect', "G.inv.some(i => i.id === 'shells' && i.uses === 3)", 'the real box, with a spare']].concat(shoot),
};
