// The Void (first, a death: the bow drawn at it, it rushes you, bent over so its face stays in the view; then afresh).
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
// Before that, the easter egg (fifteen things taken up at one time or another and then caught holding some: a death as
// ever; then all sixteen: the others come for what was theirs, and it is won another way: see `egg` below), and the same
// with reduced motion; then afresh for the ending above.
// (two at a time, so one is put down while another is still falling: it lies clear of where that one will lie)
// how many of the meadow's wild flowers are drawn in a frame (the normal ending's meadow has them; the easter egg's, with a crowd in it, only grass)
const flowersDrawn = "(() => { const add = R.add; let n = 0, all = 0; R.add = p => { all++; if (p.flower) n++; return add(p); }; try { render(); } finally { R.add = add; } return all > 50 ? n : -1; })()";
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
// Drawn at with the bow, it rushes you, enraged and taller: bent over toward you, its face stays in the view all the way
// in and through its death lunge. Watched every frame, looking straight ahead at it, from 6 m in until it is well into its
// lunge: where its eyes and the top of its hood are drawn, in this view and in a phone's held sideways (844 by 390), each
// as a share of the view's height from its top: the top of its hood never over the top of the view (nor the compass), its
// eyes never down in the bottom of it
const faceRow = "(() => { const c = G.L.creature, p = c.pos(), y0 = p.y + (c.yOff || 0), e = CREATURES.demon.eyesY(c), cam = { yaw: G.cam.yaw, pitch: G.cam.pitch, zoom: G.cam.zoom, eyeH: G.L.eyeH };" +
  ' const at = (W, H) => { const r = R.projectRect(p.x, y0 + e, p.z, 0.1, 0.27, Object.assign({ W, H }, cam)); return r && [r.y / H, (r.y + r.h) / H]; };' +
  ' return { d: c.dist, lunge: c.lunge || 0, view: at(R.W, R.H), phone: at(844, 390) }; })()';
const faceWatch = "window.__face = { n: 0, top: 9, eyes: 0, where: '' }; (function w() { const c = G.L.creature, F = window.__face; if ((G.state === 'play' && c.dist < 6) || (G.state === 'dying' && c.lunge < 0.85)) { const r = " + faceRow + ";" +
  " for (const v of [r.view, r.phone]) { if (!v) { F.top = -9; continue; } if (v[0] < F.top) { F.top = v[0]; F.where = r.d.toFixed(2) + ' m, lunge ' + r.lunge.toFixed(2); } F.eyes = Math.max(F.eyes, v[1]); } F.n++; } if (G.state === 'play' || G.state === 'dying') requestAnimationFrame(w); })();";
const rushed = [
  ['eval', "(() => { const c = G.L.creature; c.switched = true; c.hold = 14; for (const id of ['arrows', 'bow']) pickup(G.L.items.find(i => i.id === id)); G.active = G.inv.findIndex(i => i.id === 'bow'); G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = c.yaw; G.cam.pitch = G.cam.tPitch = 0; })()"],
  ['wait', 900], ['eval', faceWatch],
  ['draw', 'full'],
  ['waitUntil', "G.state === 'dead'", 6000],
  ['expect', "(F => { console.log('its face, drawn at: ' + JSON.stringify(F)); return F.n > 10 && F.top > 0.08 && F.eyes < 0.6; })(window.__face) && G.L.s.fought", 'drawn at, it rushes you bent over toward you: its face in the view all the way in and through its lunge, here and on a phone held sideways'],
  ['eval', 'restartLevel();'], ['wait', 300],
];
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
  ['expect', flowersDrawn + ' > 20', 'the meadow has its wild flowers'],
  ['eval', "document.getElementById('game').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 640, clientY: 380 }))"],
  ['expect', 'G.L.s.leaving', 'a click and it goes on'],
  ['waitUntil', "G.state === 'end'", 12000],
  ['expect', "document.documentElement.getAttribute('data-theme') === 'day'", 'the light theme is on'],
  ['expect', 'G.L.s.room === 1 && G.L.s.lv === 1 && G.L.creature.fade === 0 && Math.abs(G.L.eyeH - 1.15) < 0.01', 'the meadow and it are gone and it is the bedroom, in the morning'],
  ['expect', "MENU.kind === 'ending' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act=\"done\"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true", 'the last screen, The End, campaign marked complete'],
];
// ---- the easter egg: everything taken up (each thing in your hand at least once this attempt) ----
// The hand holds six, so the harness takes six, puts them down, takes six more, puts them down, and takes the rest: the
// moment the last thing not yet taken is in its hand the night is won another way. The others come for what was theirs,
// one after another; stand in two rows with the thing in the hood in the middle; throw it all up and leap for joy as it
// takes off its robe; the meadow comes, all of them in it; and from there the ending is as it always is. Most of it is
// stepped on the game's own clock (update(1/60) in the page, the frame loop stopped), so it takes moments, with
// tolerances of a step or two on its times.
// (it is kept well off meanwhile: this is about the things, not the race)
const far = ['eval', '(() => { const c = G.L.creature; c.switched = true; c.hold = 30; })()'];
// take up the next n things never yet taken this attempt (not the one kept for last), as a click on each would
const takeNew = n => ['eval', `G.L.items.filter(i => !G.L.s.had[i.id] && i.id !== 'musicbox').slice(0, ${n}).forEach(i => pickup(i))`];
const hadN = 'Object.keys(G.L.s.had).length';
const allDown = [dropAll, ['waitUntil', 'G.L.items.every(i => !i.taken)', 3000]];
const fifteen = [far,
  takeNew(6), ['expect', `G.inv.length === 6 && ${hadN} === 6 && !G.L.s.egg`, 'six things taken up: the hands are full'],
  ['eval', "window.__fl = G.L.items.find(i => !i.taken); pickup(window.__fl);"], ['expect', `G.inv.length === 6 && !window.__fl.taken && ${hadN} === 6`, 'a seventh is not taken, and does not count'],
  ...allDown, takeNew(6), ['expect', `G.inv.length === 6 && ${hadN} === 12 && !G.L.s.egg`, 'put down, and six more taken up'],
  ...allDown, ['eval', "pickup(G.L.items.find(i => G.L.s.had[i.id]))"], ['expect', `G.inv.length === 1 && ${hadN} === 12`, 'a thing taken up again does not count twice'],
  takeNew(3), ['wait', 700], ['expect', `G.inv.length === 4 && ${hadN} === 15 && !G.L.s.egg && G.state === 'play' && !G.L.s.ending && G.L.creature.rage > 0.5`, 'fifteen of the sixteen taken up at one time or another: nothing yet, and it is as enraged as ever'],
];
// fifteen is not all: holding any of it when it reaches you is still a death
const fifteenDeath = [...fifteen,
  ['eval', '(() => { const c = G.L.creature; c.hold = null; c.u = 0.995; })()'], ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 6000],
  ['expect', "(G.state === 'dying' || G.state === 'dead') && G.deathCause === 'default' && !G.L.s.egg && !G.L.won", 'with one thing never taken up, it reaches you holding the rest: a death, as ever, and no easter egg'],
  ['eval', 'restartLevel();'], ['wait', 300],
];
// who takes what, and where each stands
const TAKERS = { walker: ['hammer', 'planks'], crawler: ['keys'], smiler: ['salt', 'lantern'], watcher: ['chain', 'padlock'], runner: ['bow', 'arrows'], swimmer: ['beam'], climber: ['fuse'], customer: ['handle'], signalman: ['journal'], other: ['musicbox'], carrier: ['matches'], tall: ['bulb'] };
// step the game's clock to `to` seconds of the gathering, noting as it goes: when each came up to you and how near, when it
// took its things, how high each leapt and whether it came down again, how many were in the air at once (most and least),
// how much the view shook, and what was heard
const stepTo = to => ['eval', `(() => { const E = G.L.s.egg, W = window.__egg || (window.__egg = { came: {}, took: {}, near: {}, up: {}, down: {}, air: [99, 0], shake: 0, n: 0 });
  while (E.t < ${to}) { update(1 / 60); W.n++; W.shake = Math.max(W.shake, G.shakeAmt); let air = 0;
    for (const o of E.others) { const k = o.type;
      if (o.on) W.near[k] = Math.min(W.near[k] === undefined ? 99 : W.near[k], o.c.dist);
      if (o.came && W.came[k] === undefined) W.came[k] = E.t; if (o.took && W.took[k] === undefined) W.took[k] = E.t;
      if (E.t > VOID_EGG.joy + 0.3) { W.up[k] = Math.max(W.up[k] || 0, o.hopY); if (o.hopY < 0.01) W.down[k] = true; if (o.hopY > 0.05) air++; } }
    if (E.t > VOID_EGG.joy + 0.6 && E.t < VOID_EGG.joy + 5) { W.air[0] = Math.min(W.air[0], air); W.air[1] = Math.max(W.air[1], air); } } })()`];
const eggInView = `(() => { const E = G.L.s.egg, bad = [];
  for (const [W, H] of [[1280, 760], [844, 390], [1920, 1080]]) { const cam = { yaw: G.L.facing, pitch: 0, zoom: clamp(0.6 * (W / H) / 0.93, 1, 1.32), W, H, eyeH: G.L.eyeH };
    for (const c of E.others.map(o => o.c).concat([G.L.creature])) { const p = c.pos(), r = R.projectRect(p.x, 0, p.z, 1.0, Math.min(2.4, c.CR.h), cam); if (!r || r.x < 0 || r.x + r.w > W || r.y < 0 || r.y + r.h > H) bad.push(c.type + '@' + W); } }
  if (bad.length) console.log('out of the view: ' + bad.join(' ')); return !bad.length; })()`;
// (as the last night of a whole run, 431.2 s on its clock so far, 400 of them the twelve nights before: the best there is)
const egg = [...fifteen, ['eval', watchSfx], ['eval', 'window.__egg = null; delete SAVE.data.eggs.void; SAVE.persist();'],
  ['eval', "window.__best0 = JSON.stringify(SAVE.data.bestRun); SAVE.data.bestRun = {}; G.run = { t: 431.2, night: G.L.index, from: 400, nights: Array.from({ length: G.L.index }, () => ({ t: 400 / G.L.index })) };"],
  ['pickup', 'musicbox'],   // (the last of them, with a real click)
  ['eval', 'G.noRaf = true;'], ['wait', 80],
  ['expect', "G.state === 'won' && G.L.won && !!G.L.s.egg && G.L.s.ending && G.L.s.egg.t < 1.6", 'the last thing taken up: the night is won, and the others are coming'],
  ['expect', "SAVE.data.eggs.void === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.void === true && G.L.text.egg === 'Take up everything.'", 'the easter egg is saved, by the night\'s id'],
  ['expect', "G.inv.length === 5 && G.L.creature.frozen && G.L.creature.anger === 0 && G.L.items.filter(i => i.by).length === 0", 'nothing is taken yet: what you hold is still in your hands, and it has stopped where it was'],
  key('r', true), ['expect', "G.state === 'won' && !!G.L.s.egg", 'R does nothing there'],
  ['expect', "(r => { window.__run0 = JSON.stringify(r); return !G.run && !!r && r.t >= 431.2 && r.t < 450 && r.best === true && r.nights.length === 13 && Math.abs(r.nights[12] - (r.t - 400)) < 0.02 && SAVE.data.bestRun[G.diff().id].t === r.t; })(G.lastRun)", 'the run is finished, and timed, the moment the last thing was taken up: this night\'s share of it, and a best run saved'],
  stepTo('VOID_EGG.first + 0.2'),
  ['expect', "(E => E.others.filter(o => o.on).map(o => o.type).join() === 'walker' && E.others[0].c.dist > 3 && E.others[0].c.dist < 12 && G.L.creature.fade < 0.1 && Math.abs(wrapPi(G.cam.yaw - G.L.facing)) < 0.25 && G.cam.pitch < 0.25)(G.L.s.egg)", 'the view is taken, level, to the north; it has backed off into the dark; and the first of them is coming, the walker'],
  stepTo('VOID_EGG.hold + 0.1'),
  ['expect', `(E => E.others.every(o => o.took && o.came) && G.inv.length === 0 && G.L.items.every(i => i.taken && i.by) && E.others.every(o => JSON.stringify(o.held.map(i => i.id)) === JSON.stringify(${JSON.stringify(TAKERS)}[o.type]) && o.held.every(i => i.by === o.type)))(G.L.s.egg)`, 'each of the twelve came and took what was its own: all sixteen things, out of your hands and off the floor, each held by the creature of its night'],
  ['expect', "(W => { const k = G.L.s.egg.others.map(o => o.type), took = k.map(t => W.took[t]), came = k.map(t => W.came[t]); console.log('took at ' + took.map(v => v.toFixed(2)).join(' ')); return took.every((v, i) => Math.abs(v - (VOID_EGG.first + i * VOID_EGG.every + VOID_EGG.rush + 0.12)) < 0.06) && came.every((v, i) => Math.abs(v - (VOID_EGG.first + i * VOID_EGG.every + VOID_EGG.rush)) < 0.06); })(window.__egg)", 'one after another, in the order of their nights, each a moment after the one before, each up to you in half a second'],
  ['expect', "(W => G.L.s.egg.others.every(o => W.near[o.type] < o.near + 0.02 && W.near[o.type] < 2) && W.shake > 0.05)(window.__egg)", 'each came right up to you (under two metres), with a jolt'],
  ['expect', "(E => E.others.every(o => Math.abs(o.c.dist - o.r) < 0.01 && Math.abs(wrapPi(o.c.yaw - G.L.facing - o.b)) < 0.001 && o.hopY === 0) && E.others.filter(o => o.b < 0).length === 6 && E.others.filter(o => o.b > 0).length === 6 && new Set(E.others.map(o => o.b)).size === 12 && E.others.filter(o => o.r > 6).every(o => o.c.CR.h >= 1.9))(G.L.s.egg)", 'they backed away to their places: twelve of them in two rows facing you, six either side, the taller behind'],
  ['expect', "(c => c.fade === 1 && Math.abs(c.dist - VOID_EGG.place[1]) < 0.01 && Math.abs(wrapPi(c.yaw - G.L.facing)) < 0.001 && c.rage < 0.05 && c.mood === undefined && !c.disrobe && !c.dance && G.L.s.egg.others.every(o => Math.abs(o.b) > 0.12))(G.L.creature)", 'and the thing in the hood in the middle of them, calm, hooded: thirteen figures'],
  ['expect', eggInView, 'all thirteen within the view, on a desktop and on a phone held sideways'],
  ['eval', "window.__at = G.L.s.egg.others.map(o => [o.c.dist, o.c.yaw, o.hopY, o.held.length]).join(); window.__sfxN = window._sfx.length;"],
  stepTo('VOID_EGG.joy - 0.05'),
  ['expect', "G.L.s.egg.phase === 'hold' && window.__at === G.L.s.egg.others.map(o => [o.c.dist, o.c.yaw, o.hopY, o.held.length]).join() && window._sfx.length === window.__sfxN && G.L.s.meadow === 0 && VOID_EGG.joy - VOID_EGG.hold >= 3", 'they hold there, still and quiet, three seconds, each with what it took'],
  stepTo('VOID_EGG.joy + 0.5'),
  ['expect', "(E => E.thrown.length === 16 && E.others.every(o => o.held.length === 0 && o.threw !== null) && E.thrown.filter(th => { const u = E.t - th.t0; return th.vy * u - 4.9 * u * u > 0.6; }).length === 16 && new Set(E.thrown.map(th => th.it.id)).size === 16)(G.L.s.egg)", 'then all at once they throw it all up into the air: sixteen things, well over their heads'],
  ['expect', "(v => v.some(x => x.n === 'cheer' && Math.abs(x.t - VOID_EGG.joy) < 0.05) && v.some(x => x.n === 'win' && Math.abs(x.t - VOID_EGG.joy) < 0.05))(window._sfx)", 'with a bright flourish and the chord of a night won'],
  stepTo('VOID_EGG.light[0] + 1.6'),
  ['expect', "G.L.s.meadow > 0.1 && G.L.s.meadow < 0.4 && G.L.pal.skyTop[0] > 150 && G.L.pal.fog[0] > 150", 'as the dark turns to the pale light'],
  stepTo('VOID_EGG.joy + 5'),
  ['expect', "(W => { const k = Object.keys(W.up); console.log('leaps ' + k.map(t => t + ' ' + W.up[t].toFixed(2)).join(', ') + '; in the air at once ' + W.air); return k.length === 12 && k.every(t => W.up[t] > 0.2 && W.down[t]) && W.air[1] - W.air[0] >= 3; })(window.__egg)", 'and they leap up and down for joy, every one of them, again and again, each in its own time'],
  ['expect', "(c => c.disrobe === 1 && c.dance > 0.5 && c.mood === CREATURES.demon.moods - 1 && c.unveil === 1 && c.calm > 0.9)(G.L.creature)", 'as its happy face comes out of the hood and it takes off its robe, and dances'],
  stepTo('VOID_EGG.light[1] + 0.2'),
  ['expect', "(E => G.L.s.meadow === 1 && G.L.s.spin === 0 && G.L.pal.ground[1] > G.L.pal.ground[0] + 40 && G.L.pal.skyTop[2] > 200 && G.L.s.room === 0 && E.others.every(o => o.on && o.fade === 1 && Math.abs(o.c.dist - o.r) < 0.01) && G.L.creature.fade === 1 && E.thrown.every(th => E.t - th.t0 > th.tl && th.fade === 1))(G.L.s.egg)", 'the meadow: a green meadow under a blue sky, all thirteen of them in it, and what they threw lying in the grass'],
  ['eval', 'window.__egg.up = {}; window.__egg.down = {};'], stepTo('VOID_EGG.arm + 1.2'),
  ['expect', "(W => Object.keys(W.up).length === 12 && Object.keys(W.up).every(t => W.up[t] > 0.12 && W.down[t]) && G.L.creature.dance > 0.5)(window.__egg)", 'still leaping and dancing there'],
  ['expect', "G.state === 'won' && G.L.s.wait && !G.L.s.leaving && G.L.lookFree() && (window._sfx.filter(x => x.n === 'musicbox').length >= 2)", 'the music box plays, and the meadow waits for a press, the view yours again'],
  ['expect', flowersDrawn + ' === 0', 'the easter egg\'s meadow has no flowers, only grass (there is a crowd in it)'],
  noHands('your hands are empty'),
  ['eval', 'G.noRaf = false; G._last = performance.now(); requestAnimationFrame(frame);'], ['wait', 200],
  key('ArrowLeft', true), ['wait', 300], ['expect', "G.state === 'won' && !G.L.s.leaving", 'a turn only turns the view'],
  ['eval', "document.getElementById('game').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 640, clientY: 380 }))"],
  ['expect', 'G.L.s.leaving', 'a click and it goes on'],
  ['waitUntil', "G.state === 'end'", 12000],
  ['expect', "G.L.s.room === 1 && G.L.creature.fade === 0 && G.L.s.egg.others.every(o => o.fade === 0) && G.L.s.egg.thrown.every(th => th.fade === 0)", 'the meadow and all of them are gone, and it is the bedroom, in the morning'],
  ['expect', "MENU.kind === 'ending' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act=\"done\"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true && JSON.parse(localStorage.getItem('itscoming.v2')).unlocked[G.diff().id] === LEVELS.length", 'the night was won: the last screen, The End, and the campaign marked complete'],
  ['expect', "JSON.stringify(G.lastRun) === window.__run0", 'the run\'s time is as it was when the last thing was taken up: none of the gathering counted'],
  ['eval', "SAVE.data.bestRun = JSON.parse(window.__best0); SAVE.persist();"],
];
// with reduced motion and flashing: the same, come slower and from nearer, no jolt, no flash, and only a gentle bob for a leap
const eggStill = [
  ['eval', "SAVE.setSetting('reducedMotion', true); SAVE.setSetting('reducedFlash', true); startLevel(G.levelIndex, false);"], ['wait', 300], far,
  ['eval', "G.noRaf = true; window.__egg = null; for (const it of G.L.items.slice()) { if (G.inv.length >= 6) { const d = G.inv[0]; G.removeFromInv(d); d.taken = false; } pickup(it); } G.shakeAmt = 0; G.flashAmt = 0;"],
  ['expect', "G.state === 'won' && !!G.L.s.egg", 'with reduced motion: the last thing taken up, the same'],
  stepTo('VOID_EGG.joy + 4'),
  ['expect', "(W => { console.log('reduced motion: came at ' + W.came.walker.toFixed(2) + ', leaps ' + Math.max(...Object.values(W.up)).toFixed(3) + ', shake ' + W.shake); return W.came.walker > VOID_EGG.first + 1 && Object.values(W.up).every(v => v > 0.005 && v <= 0.06) && W.shake === 0 && G.flashAmt === 0 && G.L.s.egg.thrown.length === 16 && G.L.creature.dance === 0 && G.L.creature.disrobe === 1; })(window.__egg)", 'each comes slower, with no jolt; they throw it all up, and only bob for joy; it takes off its robe, and does not dance'],
  ['eval', "SAVE.setSetting('reducedMotion', false); SAVE.setSetting('reducedFlash', false); SAVE.data.complete = {}; SAVE.persist(); G.noRaf = false; G._last = performance.now(); requestAnimationFrame(frame); startLevel(G.levelIndex, false);"], ['wait', 400],
];
module.exports = {
  nightmare: [].concat(rushed, fifteenDeath, egg, eggStill, start, tempted, full, oneDown, letGo, ending),
};
