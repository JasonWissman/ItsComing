// The Barn: lantern to the drum, a match, throw it into the hay on its lane (or pull the ladder up on the east lane).
// Hard frees the tap with the wrench first. Every tier drops nothing extra because the harness carries little.
const light = [['pickup', 'lantern'], ['pickup', 'matches'], ['use', 'drum'], ['expect', "G.inv.some(i => i.id === 'lantern_full')", 'lantern filled'], ['combine', 'lantern_full', 'matches'], ['expect', "G.inv.some(i => i.id === 'lantern_lit')", 'lantern lit']];
const fire = [['branch', 'G.L.creature.lane.idx === 0', [['use', 'hayN'], ['waitUntil', 'G.L.s.fireN', 4000], ['expect', 'G.L.s.fireN', 'yard hay burning']], [['use', 'hayE'], ['waitUntil', 'G.L.s.fireE', 4000], ['expect', 'G.L.s.fireE', 'barn hay burning']]]];
module.exports = {
  normal: light.concat(fire),
  hard: [['pickup', 'wrench'], ['use', 'drum'], ['expect', '!G.L.s.tapStuck', 'tap freed'], ['eval', 'G.active = G.inv.findIndex(i => i.id === "wrench"); G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive();'], ['expect', "!G.inv.some(i => i.id === 'wrench')", 'wrench dropped']].concat(light, fire),
  nightmare: [['pickup', 'wrench'], ['use', 'drum'], ['expect', '!G.L.s.tapStuck', 'tap freed'], ['eval', 'G.active = G.inv.findIndex(i => i.id === "wrench"); G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive();'], ['hold', 'ladder', 8000], ['expect', 'G.L.s.ladderUp', 'ladder pulled up']].concat(light, fire),
};
