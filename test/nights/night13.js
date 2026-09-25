// The Void: put everything down and let it come. The harness drops each held item while looking down, then
// waits for it to arrive; the ending (not a death) follows, and then the morning.
const dropAll = ['waitUntil', "G.inv.length === 0 ? true : (G.cam.pitch = G.cam.tPitch = PITCH_DOWN, G.active = 0, dropActive(), false)", 8000];
module.exports = {
  normal: [['expect', 'G.inv.length === 3', 'holding three things'], dropAll, ['expect', 'G.inv.length === 0', 'empty-handed'], ['eval', 'G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won', 20000], ['expect', 'G.L.won && G.L.s.ending', 'it came and it was the ending'], ['waitUntil', "G.state === 'morning' || G.state === 'end'", 20000], ['expect', "document.documentElement.getAttribute('data-theme') === 'day'", 'the light theme is on'], ['waitUntil', "G.state === 'end'", 20000], ['expect', "MENU.kind === 'nights' && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true", 'the Nights screen, campaign marked complete']],
  hard: [['expect', 'G.inv.length === 5', 'holding five things'], dropAll, ['eval', 'G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won', 20000], ['waitUntil', "G.state === 'end'", 30000], ['expect', "MENU.kind === 'nights'", 'the Nights screen']],
  nightmare: [['expect', 'G.inv.length === 6', 'holding six things'], dropAll, ['eval', 'G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won', 20000], ['waitUntil', "G.state === 'end'", 30000], ['expect', "MENU.kind === 'nights'", 'the Nights screen']],
};
