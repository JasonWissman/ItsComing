// The Void: put everything down and let it come, looking at it. The harness drops each held item while looking down,
// then turns to face it and waits for it to arrive; the ending (not a death) follows without a cut: it holds you, its face
// goes through its moods until it is happy, the dark opens into a meadow in the sun, and the meadow waits for a press. A click
// and the meadow and it fade into the bedroom in the morning, and the last screen says you have faced your demons.
// (two at a time, so one is put down while another is still falling: it lies clear of where that one will lie)
const dropAll = ['waitUntil', "G.inv.length === 0 ? true : (G.cam.pitch = G.cam.tPitch = PITCH_DOWN, G.active = 0, dropActive(), G.inv.length && (G.active = 0, dropActive()), false)", 8000];
// nothing put down lies over another thing: as cards facing the eye, no two overlap by more than a sliver
const clear = '(() => { const f = G.L.items.filter(i => !i.taken).map(o => ({ a: Math.atan2(o.x, o.z), d: Math.hypot(o.x, o.z), w: o.w, h: o.h })); let worst = 0;' +
  ' for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) { const p = f[i], q = f[j];' +
  ' worst = Math.max(worst, Math.max(0, (p.w + q.w) / 2 - Math.abs(wrapPi(p.a - q.a)) * (p.d + q.d) / 2) * Math.max(0, Math.min(p.d + p.h, q.d + q.h) - Math.max(p.d, q.d))); }' +
  ' return worst < 0.15; })()';
// from the moment it reaches you, note each face it holds (a whole number) in the order it comes
const watchMoods = "window._moods = []; (function f() { const m = G.L.creature.mood; if (Number.isInteger(m) && window._moods[window._moods.length - 1] !== m) window._moods.push(m); if (G.state === 'won') requestAnimationFrame(f); })();";
// what you hold is in your hands (js/hands.js): one thing in each while there are two or more; put down, a thing leaves your
// hand and falls to where it lies, and only then can it be taken again (looked at as a player would, and clicked); in its arms
// and in the meadow your hands hold nothing and are not in the view
const bothHands = ['expect', 'G.hand.cur === G.inv[G.active] && G.hand.up > 0.9 && !!G.hand.off.cur && G.hand.off.cur !== G.hand.cur && G.inv.includes(G.hand.off.cur)', 'holding six things: one in each hand'];
const seen = "(() => { const it = window.__it, yaw = Math.atan2(it.x, it.z); G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; })()";
const takeable = "(() => { const it = window.__it, h = [...R.hits].reverse().find(h => h.kind === 'item' && h.ref === it); if (!h) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2 + R.viewY; updateHover(); const ok = !!G.hover && G.hover.ref === it; G.mouse.x = -1; return ok; })()";
const oneDown = [['eval', 'window.__it = G.inv[G.active]; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive();'],
  ['expect', '!G.inv.includes(window.__it) && window.__it.taken', 'put down, it leaves your hand and falls (it is not lying there yet)'],
  ['waitUntil', '!window.__it.taken', 1500], ['expect', '!window.__it.taken && window.__it.y === 0', 'and lands where it lies'],
  ['eval', seen], ['wait', 250], ['expect', takeable, 'where it can be seen and taken again']];
// six held, reaching for another: the full hand goes toward it and back, and nothing is taken
const full = [['eval', 'window.__fl = G.L.items.find(i => !i.taken); pickup(window.__fl);'],
  ['expect', "G.lastToast.msg === 'Your hands are full.' && G.inv.length === 6 && !window.__fl.taken && !!G.hand.thrust && G.hand.thrust.item === G.inv[G.active] && !!G.hand.thrust.at", 'six held, reaching for another: the full hand goes toward it, and takes nothing']];
const noHands = what => ['expect', '!G.hand.cur && !G.hand.off.cur && !G.hand.reach && !G.hand.box && !G.fumbling', what];
const letGo = [dropAll, ['expect', 'G.inv.length === 0', 'empty-handed'], ['waitUntil', 'G.L.items.every(i => !i.taken)', 2000], ['expect', clear, 'what was put down lies clear of everything else on the floor'], ['expect', 'G.L.creature.rage < 0.9', 'nothing held: it is not enraged'], ['eval', 'G.L.creature.switched = true; G.cam.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0; G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won || G.L.creature.dist < 3', 20000], ['expect', 'G.L.won || G.cam.tPitch < -0.1', 'facing it as it looms in, the view lifts to its face'], ['waitUntil', 'G.L.won', 20000], ['eval', watchMoods], ['expect', 'G.L.won && G.L.s.ending', 'it came and it was the ending']];
const ending = [
  ['waitUntil', 'G.L.s.hugWrap > 0.95', 9000], ['expect', "G.state === 'won' && G.L.creature.hug.reach > 0.95 && G.L.creature.dist < 0.8 && G.L.s.meadow === 0", 'it stops close in front of you and holds you, its arms out to you and closed round you'],
  noHands('your hands are empty and out of the view while it holds you'),
  ['waitUntil', 'G.L.s.meadow > 0.5', 30000],
  ['expect', 'JSON.stringify(window._moods) === "[0,1,2,3,4,5,6]"', 'while it held you its face went through rage, anguish, fear, sorrow and calm, and it was happy'],
  ['waitUntil', 'G.L.s.wait', 12000],
  ['expect', "G.L.s.meadow === 1 && G.L.creature.hug === null && Math.abs(G.L.creature.dist - 3.3) < 0.05 && G.L.pal.ground[1] > G.L.pal.ground[0] + 40 && G.L.pal.skyTop[2] > 200 && G.L.s.room === 0", 'it let you go: it stands in a green meadow under a blue sky, and no room yet'],
  ['wait', 3000], ['expect', "G.state === 'won' && G.L.s.wait && !G.L.s.leaving && G.L.s.meadow === 1", 'the meadow waits for as long as you like'],
  noHands('and in the meadow'),
  ['eval', "document.getElementById('game').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 640, clientY: 380 }))"],
  ['expect', 'G.L.s.leaving', 'a click and it goes on'],
  ['waitUntil', "G.state === 'end'", 12000],
  ['expect', "document.documentElement.getAttribute('data-theme') === 'day'", 'the light theme is on'],
  ['expect', 'G.L.s.room === 1 && G.L.s.lv === 1 && G.L.creature.fade === 0 && Math.abs(G.L.eyeH - 1.15) < 0.01', 'the meadow and it are gone and it is the bedroom, in the morning'],
  ['expect', "MENU.kind === 'ending' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act=\"again\"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true", 'the last screen, Play again, campaign marked complete'],
];
module.exports = {
  nightmare: [['expect', 'G.inv.length === 6', 'holding six things'], bothHands].concat(full, oneDown, letGo, ending),
};
