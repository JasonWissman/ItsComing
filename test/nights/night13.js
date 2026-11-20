// The Void: you begin with nothing in your hands, and everything you ever held lies around you. The harness gives in to the
// temptation first: it takes up two things (one in each hand), and the thing in the black hood is enraged (red eyes, a
// snarling mouth in the dark, coming on in fits, screeching); it takes up four more, and reaching for a seventh the full
// hand takes nothing. Then it puts each thing down while looking down, and the thing calms and is quiet; it turns to face
// it and waits for it to arrive. The ending (not a death) follows without a cut: it lifts its arms and takes hold of you,
// and once its hands are there its face comes out of the dark of its hood and goes through angry, neutral, angry,
// confused, confused the other way, and sad; it cries, holding you, bows its head and cries on, and stops; then it throws
// its head back, enraged, and the faces of all the others are round it at once; it takes them back into itself and is
// neutral again, a while, in the dark; confused, and the other way, and a pale light; content and then happy,
// the meadow turns into place round you, and it lets you go. There the view is yours: a turn, a look down and a
// zoom are only that, and a click goes on: the meadow and it fade into the bedroom in the morning, and the last screen says
// you have faced your demons.
// (two at a time, so one is put down while another is still falling: it lies clear of where that one will lie)
const dropAll = ['waitUntil', "G.inv.length === 0 ? true : (G.cam.pitch = G.cam.tPitch = PITCH_DOWN, G.active = 0, dropActive(), G.inv.length && (G.active = 0, dropActive()), false)", 8000];
// nothing put down lies over another thing: as cards facing the eye, no two overlap by more than a sliver
const clear = '(() => { const f = G.L.items.filter(i => !i.taken).map(o => ({ a: Math.atan2(o.x, o.z), d: Math.hypot(o.x, o.z), w: o.w, h: o.h })); let worst = 0;' +
  ' for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) { const p = f[i], q = f[j];' +
  ' worst = Math.max(worst, Math.max(0, (p.w + q.w) / 2 - Math.abs(wrapPi(p.a - q.a)) * (p.d + q.d) / 2) * Math.max(0, Math.min(p.d + p.h, q.d + q.h) - Math.max(p.d, q.d))); }' +
  ' return worst < 0.15; })()';
// from the moment it reaches you, note each face it holds (a whole number) in the order it comes
// what it is heard to do while it holds you: each effect (and each sound of its voice, as voice:kind), when (s.endT), with
// what face (c.mood, c.unveil) and how far its head is bowed (c.nod)
const watchSfx = "window._sfx = []; if (!AUDIO.__w) { AUDIO.__w = true; const note = n => { if (G.L && G.L.s && G.L.s.ending) window._sfx.push({ n, t: G.L.s.endT, m: G.L.creature.mood, u: G.L.creature.unveil, nod: G.L.creature.nod }); };" +
  " const o = AUDIO.sfx, v = AUDIO.voice; AUDIO.sfx = function (n) { note(n); return o.apply(this, arguments); }; AUDIO.voice = function (k) { note('voice:' + k); return v.apply(this, arguments); }; }";
// (and how it is the first frame after it has stopped crying, bowed: that is under a second before the scare)
const watchMoods = "window._moods = []; window._hush = null; (function f() { const c = G.L.creature, m = c.mood; if (Number.isInteger(m) && window._moods[window._moods.length - 1] !== m) window._moods.push(m);" +
  " if (!window._hush && G.L.s.endT > END.hush + 0.35) window._hush = { sob: c.sob, nod: c.nod, shown: G.L.s.shown, t: G.L.s.endT }; if (G.state === 'won') requestAnimationFrame(f); })();";
// enraged, it comes in fits: over a few seconds of its own time it stops dead, lurches on fast and jerks aside
const fits = '(() => { const c = G.L.creature, t0 = c.t, pace = [], side = []; for (let i = 0; i < 60; i++) { c.t = t0 + i * 0.07; pace.push(CREATURES.demon.speedMult(c, 0.05, true) / (1 + 0.45 * c.anger)); side.push(CREATURES.demon.lateral(Object.assign({}, c, { dist: 10 }))); } c.t = t0;' +
  ' return Math.min(...pace) < 0.5 && Math.max(...pace) > 1.6 && Math.max(...side) - Math.min(...side) > 0.15; })()';
// what you hold is in your hands (js/hands.js): one thing in each while there are two or more; put down, a thing leaves your
// hand and falls to where it lies, and only then can it be taken again (looked at as a player would, and clicked); in its arms
// and in the meadow your hands hold nothing and are not in the view
const bothHands = ['expect', 'G.hand.cur === G.inv[G.active] && G.hand.up > 0.9 && !!G.hand.off.cur && G.hand.off.cur !== G.hand.cur && G.inv.includes(G.hand.off.cur)', 'holding two things: one in each hand'];
const seen = "(() => { const it = window.__it, yaw = Math.atan2(it.x, it.z); G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; })()";
const takeable = "(() => { const it = window.__it, h = [...R.hits].reverse().find(h => h.kind === 'item' && h.ref === it); if (!h) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2 + R.viewY; updateHover(); const ok = !!G.hover && G.hover.ref === it; G.mouse.x = -1; return ok; })()";
const oneDown = [['eval', 'window.__it = G.inv[G.active]; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive();'],
  ['expect', '!G.inv.includes(window.__it) && window.__it.taken', 'put down, it leaves your hand and falls (it is not lying there yet)'],
  ['waitUntil', '!window.__it.taken', 1500], ['expect', '!window.__it.taken && window.__it.y === 0', 'and lands where it lies'],
  ['eval', seen], ['wait', 250], ['expect', takeable, 'where it can be seen and taken again']];
const start = [
  ['expect', 'G.inv.length === 0 && G.L.items.length === 16 && G.L.items.every(i => !i.taken)', 'empty-handed: everything you ever held lies around you'],
  ['wait', 400], ['expect', 'G.L.creature.rage < 0.05 && G.L.creature.lat === 0', 'holding nothing, it is calm: it only walks'],
];
// the temptation: take one thing up and it is enraged at once; a second, one in each hand; four more and the hands are full
const tempted = [
  ['pickup', 'hammer'], ['waitUntil', 'G.L.creature.rage > 0.6', 1500],
  ['expect', 'G.inv.length === 1 && G.L.creature.rage > 0.6', 'holding anything, it is enraged: red eyes and a snarling mouth in the dark of its hood'],
  ['expect', fits, 'and it comes on in fits: stopping dead, lurching, jerking aside'],
  ['waitUntil', '(G.L.s.screeches || 0) > 0', 1500], ['expect', '(G.L.s.screeches || 0) > 0', 'and it screeches'],
  ['pickup', 'salt'], ['wait', 600], bothHands,
  ['eval', "G.L.items.filter(i => !i.taken).slice(0, 4).forEach(i => pickup(i))"], ['wait', 300],
  ['expect', 'G.inv.length === 6 && G.L.creature.anger === 6', 'six things held: it is angrier, and comes faster'],
];
// six held, reaching for another: the full hand goes toward it and back, and nothing is taken
// (what happened noted at once, in the same step: the push of the hand is over in a third of a second, and under load the
// next look at the page can come later than that)
const full = [['eval', "window.__fl = G.L.items.find(i => !i.taken); pickup(window.__fl); window.__full = G.lastToast.msg === 'Your hands are full.' && G.inv.length === 6 && !window.__fl.taken && !!G.hand.thrust && G.hand.thrust.item === G.inv[G.active] && !!G.hand.thrust.at;"],
  ['expect', 'window.__full === true', 'six held, reaching for another: the full hand goes toward it, and takes nothing']];
const noHands = what => ['expect', '!G.hand.cur && !G.hand.off.cur && !G.hand.reach && !G.hand.box && !G.fumbling', what];
const letGo = [dropAll, ['expect', 'G.inv.length === 0', 'empty-handed again'], ['waitUntil', 'G.L.items.every(i => !i.taken)', 2000], ['expect', clear, 'what was put down lies clear of everything else on the floor'],
  ['waitUntil', 'G.L.creature.rage < 0.05 && Math.abs(G.L.creature.lat) < 0.02', 2000], ['expect', 'G.L.creature.rage < 0.05', 'nothing held: it calms, two pale eyes in its hood again'],
  ['eval', 'window._sc = G.L.s.screeches || 0;'], ['wait', 3500], ['expect', '(G.L.s.screeches || 0) === window._sc', 'and it is quiet: no screeching while you hold nothing'],
  ['eval', 'G.L.creature.switched = true; G.cam.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0; G.L.creature.u = 0.9;'], ['waitUntil', 'G.L.won || G.L.creature.dist < 3', 20000], ['expect', 'G.L.won || G.cam.tPitch < -0.1', 'facing it as it looms in, the view lifts to its face'], ['waitUntil', 'G.L.won', 20000], ['eval', watchMoods], ['eval', watchSfx], ['expect', 'G.L.won && G.L.s.ending', 'it came and it was the ending']];
// in the meadow: a key that turns, looks or zooms does only that
const key = (k, up) => ['eval', `window.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}' }));` + (up ? `window.dispatchEvent(new KeyboardEvent('keyup', { key: '${k}' }));` : '')];
// (each waited for, not a fixed time: the meadow is a lot to draw, and the frames can come slowly)
const settled = (cond, what) => [['waitUntil', cond, 5000], ['expect', cond, what]];
const lookAbout = [
  ['eval', 'window._yaw0 = G.cam.yaw;'], key('ArrowLeft', true),
  ...settled("G.state === 'won' && !G.L.s.leaving && Math.abs(wrapPi(G.cam.yaw - window._yaw0 + 45 * DEG)) < 0.05", 'in the meadow the view is yours: a turn turns it, and does not go on'),
  key('d', true), key('d', true),
  ...settled("!G.L.s.leaving && Math.abs(wrapPi(G.cam.yaw - window._yaw0 - 45 * DEG)) < 0.05", 'and back the other way'),
  key('ArrowDown', true), ...settled('!G.L.s.leaving && G.cam.pitch > PITCH_DOWN - 0.05', 'it looks down at the grass'),
  key('ArrowUp', true), key('z'), ...settled('!G.L.s.leaving && Math.abs(G.cam.pitch) < 0.05 && G.cam.zoom > 2.2', 'it looks up again, and zooms'),
  ['eval', "window.dispatchEvent(new KeyboardEvent('keyup', { key: 'z' }));"], ...settled("G.state === 'won' && !G.L.s.leaving && G.cam.zoom < 1.2", 'and lets go of the zoom: the meadow still waits'),
];
const ending = [
  ['waitUntil', 'G.L.s.grab > 0.95', 9000], ['expect', "G.state === 'won' && G.L.creature.hug.lift > 0.95 && G.L.creature.dist < 0.8 && G.L.s.meadow === 0", 'it stops close in front of you, lifts its arms and takes hold of you'],
  ['expect', 'G.L.creature.hug.wrists.every(([x, y], i) => (i ? x > 0.8 : x < 0.2) && y > 0.95)', 'its hands low in the corners of the view, gripping its bottom edge'],
  noHands('your hands are empty and out of the view while it holds you'),
  ['waitUntil', 'G.L.creature.nod > 0.95', 30000],
  ['expect', 'JSON.stringify(window._moods) === "[0,1,2,3,4,5]" && G.L.creature.sob > 0.95 && G.L.creature.hug.grab === 1 && G.L.s.shown === 0', 'angry, neutral, angry, confused, confused the other way, and sad; crying, it bows its head, still holding you'],
  ['waitUntil', '!!window._hush', 6000],
  ['expect', '(h => h.sob < 0.05 && h.nod > 0.95 && h.shown === 0 && h.t < END.scare[0])(window._hush)', 'it cries on a while, bowed, and stops, and is still'],
  ['expect', "(v => v.filter(x => x.nod > 0.5).length >= 2 && v.every(x => x.t < END.hush))(window._sfx.filter(x => x.n === 'voice:slow'))", 'sobbing, and sobbing on with its head bowed, and none after it stops'],
  ['expect', 'VOID_RECAP.faces.length === 12 && VOID_RECAP.faces.every(Boolean)', 'with all twelve of the others\' faces taken'],
  ['waitUntil', 'G.L.s.endT > END.scare[0] + 0.15', 5000],
  ['expect', 'G.L.s.endT < END.scare[1] && G.L.s.shown === 12 && G.L.creature.mood === 6 && G.L.creature.nod < -0.5 && G.L.creature.hug.grab === 1', 'then it throws its head back, enraged, still holding you, and all their faces are round it at once'],
  key('r', true), key('ArrowLeft', true), ['expect', "G.state === 'won' && !G.L.s.leaving", 'R or a turn does nothing there'],
  ['waitUntil', 'G.L.s.endT > END.neutral[1] + 0.2', 8000],
  ['expect', 'JSON.stringify(window._moods) === "[0,1,2,3,4,5,6,7]" && G.L.s.shown === 0 && !G.L.s.scare.faces.length && G.L.creature.hug.grab === 1 && G.L.s.meadow === 0', 'it takes them back into itself, and is its grey neutral face again, in the dark, holding you'],
  ['expect', "(g => g.length === 2 && g[0].n === 'growl' && g[0].t > END.grab[1] && g[0].u > 0 && g[0].u < 0.5 && g[0].m < 0.5 && g[1].n === 'growl2' && g[1].m >= 1.5 && g[1].m <= 2.6)(window._sfx.filter(x => /^growl/.test(x.n)))", 'it growls, deep and gravelly, as its angry face comes up out of the hood (once its hands are on you) and again as it snaps to angry and leans in'],
  ['expect', "(sc => sc.length === 1 && Math.abs(sc[0].t - END.scare[0]) < 0.2)(window._sfx.filter(x => /screech/.test(x.n)))", 'and screeches only at the scare'],
  ['expect', "(a => a.length === 1 && Math.abs(a[0].t - END.scare[1]) < 0.1)(window._sfx.filter(x => x.n === 'absorb'))", 'and draws them back in with a rush of air as it takes them'],
  ['waitUntil', 'G.L.s.meadow > 0.5', 20000],
  ['expect', 'G.L.creature.hug && G.L.creature.hug.grab === 1 && G.L.s.spin > 0', 'out of the pale light the meadow comes, turning into place, and it is still holding you'],
  ['waitUntil', 'G.L.s.wait', 20000],
  ['expect', "(w => w.length === 1 && w[0].t < END.light[0] && w[0].t > END.confused[0])(window._sfx.filter(x => x.n === 'warp'))", 'the dark starts to turn, with a rush, before the light comes'],
  ['expect', 'JSON.stringify(window._moods) === "[0,1,2,3,4,5,6,7,8,9,10,11]" && CREATURES.demon.moodNames.join() === "angry,neutral,angry,confused,confused mirrored,sad,angry,neutral,confused,confused mirrored,content,happy"', 'its face went through angry, neutral, angry, confused (both ways), sad, angry and neutral holding you in the dark, and confused (both ways), content and happy as the light and the meadow came'],
  ['expect', "G.L.s.meadow === 1 && G.L.s.spin === 0 && G.L.creature.hug === null && Math.abs(G.L.creature.dist - 3.3) < 0.05 && G.L.pal.ground[1] > G.L.pal.ground[0] + 40 && G.L.pal.skyTop[2] > 200 && G.L.s.room === 0", 'it let you go: it stands in a green meadow under a blue sky, and no room yet'],
  ...lookAbout,
  ['wait', 1500], ['expect', "G.state === 'won' && G.L.s.wait && !G.L.s.leaving && G.L.s.meadow === 1", 'the meadow waits for as long as you like'],
  noHands('and in the meadow'),
  ['eval', "document.getElementById('game').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 640, clientY: 380 }))"],
  ['expect', 'G.L.s.leaving', 'a click and it goes on'],
  ['waitUntil', "G.state === 'end'", 12000],
  ['expect', "document.documentElement.getAttribute('data-theme') === 'day'", 'the light theme is on'],
  ['expect', 'G.L.s.room === 1 && G.L.s.lv === 1 && G.L.creature.fade === 0 && Math.abs(G.L.eyeH - 1.15) < 0.01', 'the meadow and it are gone and it is the bedroom, in the morning'],
  ['expect', "MENU.kind === 'ending' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act=\"done\"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true", 'the last screen, The End, campaign marked complete'],
];
module.exports = {
  nightmare: [].concat(start, tempted, full, oneDown, letGo, ending),
};
