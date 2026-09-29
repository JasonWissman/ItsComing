// The Graveyard: salt the threshold it comes for (both on Nightmare), hang the lantern, light it.
const lantern = [['use', 'hook', 2], ['expect', "G.inv.some(i => i.id === 'matches')", 'matches kept (tool)']];
const salt = (id, n) => [['use', id, n, 200], ['expect', "G.L.targets.find(t => t.id === '" + id + "').done", id + ' salted']];
module.exports = {
  normal: [['pickup', 'salt'], ['pickup', 'lantern'], ['pickup', 'matches'], ['branch', 'G.L.lane.idx === 0', salt('threshold', 2), salt('sidethreshold', 2)]].concat(lantern),
  hard: [['pickup', 'salt'], ['pickup', 'lantern'], ['pickup', 'matches'], ['branch', 'G.L.lane.idx === 0', salt('threshold', 3), salt('sidethreshold', 3)]].concat(lantern),
  nightmare: [['pickup', 'salt'], ['pickup', 'lantern'], ['pickup', 'matches']].concat(salt('threshold', 2), salt('sidethreshold', 2), lantern),
};
