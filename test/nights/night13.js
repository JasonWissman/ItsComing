// The Void: put everything down and let it come, looking at it. The harness drops each held item while looking down,
// then turns to face it and waits for it to arrive; the ending (not a death) follows without a cut: it holds you, its face
// goes through its moods until it is happy, the dark opens into a meadow in the sun, and the meadow waits for a press. A click
// and the meadow and it fade into the bedroom in the morning, and the last screen says you have faced your demons.
const dropAll = ['waitUntil', "G.inv.length === 0 ? true : (G.cam.pitch = G.cam.tPitch = PITCH_DOWN, G.active = 0, dropActive(), false)", 8000];
// nothing put down lies over another thing: as cards facing the eye, no two overlap by more than a sliver
const clear = '(() => { const f = G.L.items.filter(i => !i.taken).map(o => ({ a: Math.atan2(o.x, o.z), d: Math.hypot(o.x, o.z), w: o.w, h: o.h })); let worst = 0;' +
  ' for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) { const p = f[i], q = f[j];' +
  ' worst = Math.max(worst, Math.max(0, (p.w + q.w) / 2 - Math.abs(wrapPi(p.a - q.a)) * (p.d + q.d) / 2) * Math.max(0, Math.min(p.d + p.h, q.d + q.h) - Math.max(p.d, q.d))); }' +
  ' return worst < 0.15; })()';
// from the moment it reaches you, note each face it holds (a whole number) in the order it comes
const watchMoods = "window._moods = []; (function f() { const m = G.L.creature.mood; if (Number.isInteger(m) && window._moods[window._moods.length - 1] !== m) window._moods.push(m); if (G.state === 'won') requestAnimationFrame(f); })();";
const letGo = [dropAll, ['expect', 'G.inv.length === 0', 'empty-handed'], ['expect', clear, 'what was put down lies clear of everything else on the floor'], ['expect', 'G.L.creature.rage < 0.9', 'nothing held: it is not enraged'], ['eval', 'G.L.creature.switched = true; G.cam.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0; G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won || G.L.creature.dist < 3', 20000], ['expect', 'G.L.won || G.cam.tPitch < -0.1', 'facing it as it looms in, the view lifts to its face'], ['waitUntil', 'G.L.won', 20000], ['eval', watchMoods], ['expect', 'G.L.won && G.L.s.ending', 'it came and it was the ending']];
const ending = [
  ['waitUntil', 'G.L.s.hugWrap > 0.95', 9000], ['expect', "G.state === 'won' && G.L.creature.hug.reach > 0.95 && G.L.creature.dist < 0.8 && G.L.s.meadow === 0", 'it stops close in front of you and holds you, its arms out to you and closed round you'],
  ['waitUntil', 'G.L.s.meadow > 0.5', 20000],
  ['expect', 'JSON.stringify(window._moods) === "[0,1,2,3,4,5,6]"', 'while it held you its face went through rage, anguish, fear, sorrow and calm, and it was happy'],
  ['waitUntil', 'G.L.s.wait', 12000],
  ['expect', "G.L.s.meadow === 1 && G.L.creature.hug === null && Math.abs(G.L.creature.dist - 3.3) < 0.05 && G.L.pal.ground[1] > G.L.pal.ground[0] + 40 && G.L.pal.skyTop[2] > 200 && G.L.s.room === 0", 'it let you go: it stands in a green meadow under a blue sky, and no room yet'],
  ['wait', 3000], ['expect', "G.state === 'won' && G.L.s.wait && !G.L.s.leaving && G.L.s.meadow === 1", 'the meadow waits for as long as you like'],
  ['eval', "document.getElementById('game').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 640, clientY: 380 }))"],
  ['expect', 'G.L.s.leaving', 'a click and it goes on'],
  ['waitUntil', "G.state === 'end'", 12000],
  ['expect', "document.documentElement.getAttribute('data-theme') === 'day'", 'the light theme is on'],
  ['expect', 'G.L.s.room === 1 && G.L.s.lv === 1 && G.L.creature.fade === 0 && Math.abs(G.L.eyeH - 1.15) < 0.01', 'the meadow and it are gone and it is the bedroom, in the morning'],
  ['expect', "MENU.kind === 'ending' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act=\"again\"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true", 'the last screen, Play again, campaign marked complete'],
];
module.exports = {
  nightmare: [['expect', 'G.inv.length === 6', 'holding six things']].concat(letGo, ending),
};
