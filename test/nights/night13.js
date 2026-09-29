// The Void: put everything down and let it come. The harness drops each held item while looking down, then waits for
// it to arrive; the ending (not a death) follows without a cut: the dark lightens into the bedroom in the morning, it
// dances and glitters away, and the last screen says you have faced your demons and offers Play again.
const dropAll = ['waitUntil', "G.inv.length === 0 ? true : (G.cam.pitch = G.cam.tPitch = PITCH_DOWN, G.active = 0, dropActive(), false)", 8000];
const letGo = [dropAll, ['expect', 'G.inv.length === 0', 'empty-handed'], ['expect', 'G.L.creature.rage < 0.9', 'nothing held: it is not enraged'], ['eval', 'G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won', 20000], ['expect', 'G.L.won && G.L.s.ending', 'it came and it was the ending']];
const ending = [
  ['waitUntil', 'G.L.s.reveal > 0.5', 12000], ['expect', 'G.L.creature.calm === 1 && G.L.eyeH < 1.5', 'its face turned happy, and the room is coming'],
  ['waitUntil', "G.state === 'end'", 30000],
  ['expect', "document.documentElement.getAttribute('data-theme') === 'day'", 'the light theme is on'],
  ['expect', 'G.L.s.reveal === 1 && G.L.creature.fade === 0 && Math.abs(G.L.eyeH - 1.15) < 0.01', 'the void was the bedroom all along, and it glittered away'],
  ['expect', "MENU.kind === 'ending' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act=\"again\"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true", 'the last screen, Play again, campaign marked complete'],
];
module.exports = {
  normal: [['expect', 'G.inv.length === 3', 'holding three things'], ['waitUntil', 'G.L.creature.rage > 0.6', 4000]].concat(letGo, ending),
  hard: [['expect', 'G.inv.length === 5', 'holding five things']].concat(letGo, ending),
  nightmare: [['expect', 'G.inv.length === 6', 'holding six things']].concat(letGo, ending),
};
