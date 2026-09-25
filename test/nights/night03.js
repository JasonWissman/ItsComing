// The Graveyard: salt the threshold twice, hang the lantern, light it.
module.exports = {
  normal: [['pickup', 'salt'], ['pickup', 'lantern'], ['pickup', 'matches'], ['use', 'threshold', 2], ['expect', 'G.L.targets[0].done', 'threshold salted'], ['use', 'hook', 2], ['expect', "G.inv.some(i => i.id === 'matches')", 'matches kept (tool)']],
};
