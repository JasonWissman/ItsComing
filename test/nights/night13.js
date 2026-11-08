// The Void: put everything down and let it come, looking at it. The harness drops each held item while looking down,
// then turns to face it and waits for it to arrive; the ending (not a death) follows without a cut: the dark lightens into the bedroom in the morning, it
// dances and glitters away, and the last screen says you have faced your demons and offers Play again.
const dropAll = ['waitUntil', "G.inv.length === 0 ? true : (G.cam.pitch = G.cam.tPitch = PITCH_DOWN, G.active = 0, dropActive(), false)", 8000];
// nothing put down lies over another thing: as cards facing the eye, no two overlap by more than a sliver
const clear = '(() => { const f = G.L.items.filter(i => !i.taken).map(o => ({ a: Math.atan2(o.x, o.z), d: Math.hypot(o.x, o.z), w: o.w, h: o.h })); let worst = 0;' +
  ' for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) { const p = f[i], q = f[j];' +
  ' worst = Math.max(worst, Math.max(0, (p.w + q.w) / 2 - Math.abs(wrapPi(p.a - q.a)) * (p.d + q.d) / 2) * Math.max(0, Math.min(p.d + p.h, q.d + q.h) - Math.max(p.d, q.d))); }' +
  ' return worst < 0.15; })()';
const letGo = [dropAll, ['expect', 'G.inv.length === 0', 'empty-handed'], ['expect', clear, 'what was put down lies clear of everything else on the floor'], ['expect', 'G.L.creature.rage < 0.9', 'nothing held: it is not enraged'], ['eval', 'G.L.creature.switched = true; G.cam.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0; G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won || G.L.creature.dist < 3', 20000], ['expect', 'G.L.won || G.cam.tPitch < -0.1', 'facing it as it looms in, the view lifts to its face'], ['waitUntil', 'G.L.won', 20000], ['expect', 'G.L.won && G.L.s.ending', 'it came and it was the ending']];
const ending = [
  ['waitUntil', 'G.L.s.reveal > 0.5', 12000], ['expect', 'G.L.creature.calm === 1 && G.L.eyeH < 1.5', 'its face turned happy, and the room is coming'],
  ['waitUntil', "G.state === 'end'", 30000],
  ['expect', "document.documentElement.getAttribute('data-theme') === 'day'", 'the light theme is on'],
  ['expect', 'G.L.s.reveal === 1 && G.L.creature.fade === 0 && Math.abs(G.L.eyeH - 1.15) < 0.01', 'the void was the bedroom all along, and it glittered away'],
  ['expect', "MENU.kind === 'ending' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act=\"again\"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true", 'the last screen, Play again, campaign marked complete'],
];
module.exports = {
  nightmare: [['expect', 'G.inv.length === 6', 'holding six things']].concat(letGo, ending),
};
