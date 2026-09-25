// The Clearing: gun and shells, let it get close, two hits.
module.exports = {
  normal: [['pickup', 'shotgun'], ['pickup', 'shells'], ['face', 4, false], ['setU', 0.94], ['wait', 400], ['shoot'], ['expect', "G.inv.some(i => i.id === 'shells' && i.uses === 2) && G.L.creature.wounded", 'first shot wounded it, 2 shells left'], ['wait', 500], ['shoot'], ['expect', 'G.L.creature.dead', 'second shot killed it']],
};
