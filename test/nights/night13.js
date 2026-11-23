// The Void (first, a death: the bow drawn at it, it rushes you, bent over so its face stays in the view; then afresh).
// The Void: you begin with nothing in your hands, and everything you ever held lies around you. The harness gives in to the
// temptation first: it takes up two things (one in each hand), and the thing in the black hood is enraged (red eyes, a
// snarling mouth in the dark, coming on in fits, screeching); it takes up four more, and a seventh too: on this night the
// hands are never full, and it is no angrier for it. Then it puts each thing down while looking down, and the thing calms and is quiet; it turns to face
// it and waits for it to arrive. The ending (not a death) follows without a cut: it lifts its arms and takes hold of you,
// and once its hands are there its face comes out of the dark of its hood and goes through angry, neutral, angry,
// confused, confused the other way, and sad; it cries, holding you, bows its head and cries on, and stops; then it throws
// its head back, enraged, and the faces of all the others are round it at once; it takes them back into itself and is
// neutral again, a while, in the dark; confused, and the other way, and a pale light; content and then happy,
// the meadow turns into place round you, and it lets you go. There the view is yours: a turn, a look down and a
// zoom are only that, and a click goes on: the meadow and it fade into the bedroom in the morning, and the last screen says
// you have faced your demons.
// Before that, the easter egg (all sixteen things taken up one after another with real clicks, at a player's pace, before
// it can reach you; fifteen held at once and then caught holding them: a death as ever; then all sixteen: the others come for what was theirs, and it is won another way: see `egg` below), and the same
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
// the temptation: take one thing up and it is enraged at once (and stopped dead a moment, each time a thing is first
// taken up); a second, one in each hand; four more
const tempted = [
  ['pickup', 'hammer'], ['wait', 60],
  ['eval', 'window.__d0 = G.L.creature.dist; window.__chk = G.L.creature.frozen && G.L.s.check > 0.5 && G.L.s.check <= 1.0;'], ['wait', 350],
  ['expect', "window.__chk && G.L.creature.frozen && G.L.creature.dist === window.__d0 && G.state === 'play'", 'a thing taken up for the first time checks it: it stands where it is a moment (a second)'],
  ['waitUntil', 'G.L.creature.rage > 0.6', 1500],
  ['expect', 'G.inv.length === 1 && G.L.creature.rage > 0.6', 'holding anything, it is enraged: red eyes and a snarling mouth in the dark of its hood'],
  ['waitUntil', '!G.L.creature.frozen', 2500], ['wait', 500], ['expect', 'G.L.s.check === 0 && G.L.creature.dist < window.__d0', 'and then it comes on again'],
  ['expect', fits, 'in fits: stopping dead, lurching, jerking aside'],
  ['waitUntil', '(G.L.s.screeches || 0) > 0', 1500], ['expect', '(G.L.s.screeches || 0) > 0', 'and it screeches'],
  ['pickup', 'salt'], ['wait', 600], bothHands,
  ['eval', "G.L.items.filter(i => !i.taken).slice(0, 4).forEach(i => pickup(i))"], ['wait', 300],
  ['expect', 'G.inv.length === 6 && G.L.creature.anger === 6', 'six things held: it is angrier, and comes faster'],
];
// six held, reaching for another: on this night the hands are never full, so it is taken like any other (no refusal, no
// "hands full"); the thing in the hood is no angrier for a seventh than for six; and the inventory goes over to its
// smaller slots
const full = [['eval', "window.__fl = G.L.items.find(i => !i.taken); pickup(window.__fl); window.__full = G.lastToast.msg !== 'Your hands are full.' && G.inv.length === 7 && window.__fl.taken && G.inv.includes(window.__fl) && !G.hand.thrust;"],
  ['expect', 'window.__full === true', 'six held, reaching for another: it is taken too (the hands are never full here), with no refusal'],
  ['wait', 200], ['expect', "G.L.creature.anger === 6 && document.getElementById('inventory').classList.contains('many') && document.querySelectorAll('#inventory .slot').length === 7", 'seven held: it is no angrier than for six, and the inventory shows all seven, in smaller slots']];
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
// On this night the hands are never full: all sixteen things can be held at once (a thing put down again still counts,
// and one taken up twice counts once). The harness takes up fifteen, with no refusal and no "hands full", puts one down
// and takes it up again; the moment the last thing not yet taken is in its hand the night is won another way. The others
// come for what was theirs,
// one after another; stand in two rows with the thing in the hood in the middle; throw it all up and leap for joy as it
// takes off its robe; the meadow comes, all of them in it; and from there the ending is as it always is. Most of it is
// stepped on the game's own clock (update(1/60) in the page, the frame loop stopped), so it takes moments, with
// tolerances of a step or two on its times.
// (it is kept well off meanwhile: this is about the things, not the race)
const far = ['eval', '(() => { const c = G.L.creature; c.switched = true; c.hold = 30; })()'];
// take up the next n things never yet taken this attempt (not the one kept for last), as a click on each would, noting
// any that was refused or answered with "hands full"
const takeNew = n => ['eval', `window.__refused = window.__refused || 0; G.L.items.filter(i => !G.L.s.had[i.id] && i.id !== 'musicbox').slice(0, ${n}).forEach(i => { pickup(i); if (!G.inv.includes(i) || /full/i.test(G.lastToast.msg) || G.hand.thrust) window.__refused++; })`];
const hadN = 'Object.keys(G.L.s.had).length';
// every slot of the inventory within the page, none over another, and only the held thing named (with a sixteenth slot,
// and on a phone held sideways: test/features.js)
const slotsFit = `(() => { const rs = [...document.querySelectorAll('#inventory .slot')].map(e => e.getBoundingClientRect()), W = window.innerWidth, H = window.innerHeight;
  const inside = rs.every(r => r.width >= 30 && r.height >= 30 && r.left >= 0 && r.top >= 0 && r.right <= W && r.bottom <= H);
  const apart = rs.every((a, i) => rs.every((b, j) => j <= i || a.right <= b.left + 0.5 || b.right <= a.left + 0.5 || a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5));
  const lab = [...document.querySelectorAll('#inventory .slot .label')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect());
  const ok = rs.length === G.inv.length && inside && apart && lab.length === 1 && lab[0].left >= 0 && lab[0].right <= W;
  if (!ok) console.log('inventory: ' + JSON.stringify({ n: rs.length, W, H, inside, apart, lab: lab.length })); return ok; })()`;
const fifteen = [far, ['eval', 'window.__refused = 0;'],
  takeNew(6), ['expect', `G.inv.length === 6 && ${hadN} === 6 && !G.L.s.egg`, 'six things taken up'],
  ['expect', 'G.L.s.check <= 1.0 && G.L.s.check > 0.8', 'each thing first taken up checks it for a second, no more'],
  takeNew(9), ['wait', 700], ['expect', `G.inv.length === 15 && ${hadN} === 15 && window.__refused === 0 && G.lastToast.msg !== 'Your hands are full.'`, 'and nine more: fifteen held at once, none refused, no "hands full"'],
  ['expect', `!G.L.s.egg && G.state === 'play' && !G.L.s.ending && G.L.creature.rage > 0.5 && G.L.creature.anger === 6`, 'fifteen of the sixteen: nothing yet, and it is as enraged as ever (no angrier than for six)'],
  ['expect', slotsFit, 'the inventory shows all fifteen, every slot within the view and none over another, only the held thing named'],
  ['eval', 'window.__it = G.inv[G.active]; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive();'], ['waitUntil', '!window.__it.taken', 2000],
  ['eval', 'pickup(window.__it); G.cam.pitch = G.cam.tPitch = 0;'], ['expect', `G.inv.length === 15 && ${hadN} === 15 && !G.L.s.egg`, 'one put down and taken up again does not count twice'],
];
// fifteen is not all: holding any of it when it reaches you is still a death
const fifteenDeath = [...fifteen,
  ['eval', '(() => { const c = G.L.creature; c.hold = null; c.u = 0.995; })()'], ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 6000],
  ['expect', "(G.state === 'dying' || G.state === 'dead') && G.deathCause === 'default' && !G.L.s.egg && !G.L.won", 'with one thing never taken up, it reaches you holding the other fifteen: a death, as ever, and no easter egg'],
  ['eval', 'restartLevel();'], ['wait', 300],
];
// The race, as a player runs it: from the start of the night (it is not kept off), each of the sixteen is turned to,
// looked at for most of a second and taken up with a real click, one after another (about a second and a quarter each). A
// thing taken up for the first time stops it dead a moment, so at that pace it is still well off when the last is in hand
const turnTo = id => `(async () => { const it = G.L.items.find(i => i.id === '${id}'), d = ((Math.round(Math.atan2(it.x, it.z) / (45 * DEG)) % 8) + 8) % 8, fr = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (const down of [true, false]) { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; await fr();
    const h = [...R.hits].reverse().find(h => h.kind === 'item' && h.ref === it); if (h && h.x >= 0 && h.y >= 0 && h.x + h.w <= R.W && h.y + h.h <= R.H) break; } })()`;
const ALL = ['hammer', 'planks', 'keys', 'salt', 'lantern', 'chain', 'padlock', 'bow', 'arrows', 'beam', 'fuse', 'handle', 'journal', 'matches', 'bulb', 'musicbox'];
const paced = [
  ['eval', 'window.__t0 = performance.now(); window.__nearest = 99; window.__fullMsg = false; (function w() { if (G.state === "play") { window.__nearest = Math.min(window.__nearest, G.L.creature.dist); if (G.lastToast.msg === "Your hands are full.") window.__fullMsg = true; requestAnimationFrame(w); } })();'],
  ...ALL.flatMap(id => [['eval', turnTo(id)], ['wait', 850], ['pickup', id]]),
  ['expect', "(() => { console.log('sixteen taken up in ' + ((performance.now() - window.__t0) / 1000).toFixed(1) + ' s; it came no nearer than ' + window.__nearest.toFixed(1) + ' m'); return G.state === 'won' && !!G.L.s.egg && G.inv.length === 16 && !window.__fullMsg && window.__nearest > 4; })()",
    'all sixteen taken up one after another at a player\'s pace, with real clicks: none refused, the easter egg begun, and it never came within four metres'],
  ['eval', "delete SAVE.data.eggs.void; SAVE.data.complete = {}; SAVE.persist(); startLevel(G.levelIndex, false);"], ['wait', 400],
];
// who takes what, and where each stands
const TAKERS = { walker: ['hammer', 'planks'], crawler: ['keys'], smiler: ['salt', 'lantern'], watcher: ['chain', 'padlock'], runner: ['bow', 'arrows'], swimmer: ['beam'], climber: ['fuse'], customer: ['handle'], signalman: ['journal'], other: ['musicbox'], carrier: ['matches'], tall: ['bulb'] };
// step the game's clock to `to` seconds of the gathering, noting as it goes: when each came up to you and how near, when it
// took its things (and, of each thing: when it was first up in your raised hand, not yet taken, shown; when it left your
// hand, given; and when its creature had it, got), how high each leapt and whether it came down again, how many were in the air at once (most and least),
// how much the view shook and how far it was lightened by a flash (and when, first), and what was heard
const stepTo = to => ['eval', `(() => { const E = G.L.s.egg, W = window.__egg || (window.__egg = { came: {}, took: {}, near: {}, up: {}, down: {}, shown: {}, given: {}, got: {}, air: [99, 0], shake: 0, flash: 0, n: 0 });
  while (E.t < ${to}) { update(1 / 60); W.n++; W.shake = Math.max(W.shake, G.shakeAmt); W.flash = Math.max(W.flash, G.flashAmt); if (G.flashAmt > 0 && W.flashAt === undefined) W.flashAt = E.t; let air = 0;
    for (const o of E.others) { const k = o.type;
      for (const it of o.items) { const id = it.id;
        if (W.shown[id] === undefined && !it.by && E.show === it && G.hand.cur === it && G.hand.up > 0.9 && G.hand.gone !== it) W.shown[id] = E.t;
        if (W.given[id] === undefined && it.by) W.given[id] = E.t; if (W.got[id] === undefined && o.held.includes(it)) W.got[id] = E.t; }
      if (o.on) W.near[k] = Math.min(W.near[k] === undefined ? 99 : W.near[k], o.c.dist);
      if (o.came && W.came[k] === undefined) W.came[k] = E.t; if (o.took && W.took[k] === undefined) W.took[k] = E.t;
      if (E.t > VOID_EGG.joy + 0.3) { W.up[k] = Math.max(W.up[k] || 0, o.hopY); if (o.hopY < 0.01) W.down[k] = true; if (o.hopY > 0.05) air++; } }
    if (E.t > VOID_EGG.joy + 0.6 && E.t < VOID_EGG.joy + 5) { W.air[0] = Math.min(W.air[0], air); W.air[1] = Math.max(W.air[1], air); } } })()`];
// the frolic, stepped to `to` and watched: for each of the thirteen (by its kind), how far it went in all (path), the most
// in one step of the clock (step) and each step over 20 cm (jumps), the corners of where it has been (lo, hi), whether it
// leapt on the spot and hopped as it ran, which ways it was turned (1 right, 2 left), how high it hopped and how far it
// leant; each time one of them was out of the meadow's bounds, or on you, the tree or the pool's water (bad); and the
// nearest any two of them came to one another (pair)
const frolic = to => ['eval', `(() => { const E = G.L.s.egg, FR = VOID_FROLIC, F = window.__fro = { path: {}, step: {}, jumps: {}, creep: {}, lo: {}, hi: {}, leapt: {}, hopped: {}, faces: {}, up: 0, lean: 0, bad: [], off: 0, pair: 9 };
  const prev = E.movers.map(m => [m.fu, m.fv]);
  for (const m of E.movers) { const k = m.kind; F.path[k] = 0; F.step[k] = 0; F.jumps[k] = []; F.creep[k] = 0; F.lo[k] = [m.fu, m.fv]; F.hi[k] = [m.fu, m.fv]; F.faces[k] = 0; }
  while (E.t < ${to}) { update(1 / 60);
    E.movers.forEach((m, i) => { const k = m.kind, q = prev[i], d = Math.hypot(m.fu - q[0], m.fv - q[1]), c = m.c, w = c.pos();
      F.path[k] += d; F.step[k] = Math.max(F.step[k], d); if (d > 0.2) F.jumps[k].push(d); else if (d > 1e-9) F.creep[k]++;
      F.lo[k][0] = Math.min(F.lo[k][0], m.fu); F.lo[k][1] = Math.min(F.lo[k][1], m.fv); F.hi[k][0] = Math.max(F.hi[k][0], m.fu); F.hi[k][1] = Math.max(F.hi[k][1], m.fv);
      if (m.fv < FR.v0 - 0.4 || m.fv > FR.v1 + 0.6 || Math.abs(m.fu) > FR.wedge * m.fv + 0.7 || Math.hypot(m.fu, m.fv) < FR.you - 0.01 || (!m.pool && Math.hypot(m.fu - E.poolU, m.fv - E.poolV) < FR.water)
        || Math.hypot(m.fu - FR.tree[0], m.fv - FR.tree[1]) < FR.tree[2] - 0.01) F.bad.push(k + '@' + E.t.toFixed(1));
      F.off = Math.max(F.off, Math.abs(Math.hypot(w.x, w.z) - Math.hypot(m.fu, m.fv)), Math.abs(wrapPi(Math.atan2(w.x, w.z) - G.L.facing - Math.atan2(m.fu, m.fv))));
      if (m !== E.dm) { if (m.run < 0.1 && m.hopY > 0.1) F.leapt[k] = true; if (m.run > 0.9 && m.hopY > 0.01) F.hopped[k] = true; F.up = Math.max(F.up, m.hopY); }
      for (const n of E.movers) if (n !== m && !n.pool && !m.pool) F.pair = Math.min(F.pair, Math.hypot(n.fu - m.fu, n.fv - m.fv));
      F.faces[k] |= m.face > 0.9 ? 1 : m.face < -0.9 ? 2 : 0; F.lean = Math.max(F.lean, Math.abs(m.lean));
      q[0] = m.fu; q[1] = m.fv; }); } })()`];
const RUNNERS = "['walker', 'crawler', 'smiler', 'runner', 'climber', 'customer', 'signalman', 'other', 'carrier', 'tall', 'demon']";
const eggInView = `(() => { const E = G.L.s.egg, bad = [];
  for (const [W, H] of [[1280, 760], [844, 390], [1920, 1080]]) { const cam = { yaw: G.L.facing, pitch: 0, zoom: clamp(0.6 * (W / H) / 0.93, 1, 1.32), W, H, eyeH: G.L.eyeH };
    for (const c of E.others.map(o => o.c).concat([G.L.creature])) { const p = c.pos(), r = R.projectRect(p.x, 0, p.z, 1.0, Math.min(2.4, c.CR.h), cam); if (!r || r.x < 0 || r.x + r.w > W || r.y < 0 || r.y + r.h > H) bad.push(c.type + '@' + W); } }
  if (bad.length) console.log('out of the view: ' + bad.join(' ')); return !bad.length; })()`;
// (as the last night of a whole run, 431.2 s on its clock so far, 400 of them the twelve nights before: the best there is)
const egg = [...fifteen, ['eval', watchSfx], ['eval', 'window.__egg = null; delete SAVE.data.eggs.void; SAVE.persist();'],
  ['eval', "window.__best0 = JSON.stringify(SAVE.data.bestRun); SAVE.data.bestRun = {}; G.run = { t: 431.2, night: G.L.index, from: 400, nights: Array.from({ length: G.L.index }, () => ({ t: 400 / G.L.index })) };"],
  // (one of them put down again, to lie on the floor as the others come: it has been taken up, so it counts)
  ['eval', "window.__it = G.L.items.find(i => i.id === 'keys'); G.active = G.inv.indexOf(window.__it); G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive();"], ['waitUntil', '!window.__it.taken', 2000], ['wait', 900],
  ['eval', 'G.cam.pitch = G.cam.tPitch = 0;'],
  ['pickup', 'musicbox'],   // (the last of them, with a real click)
  ['eval', 'G.noRaf = true;'], ['wait', 80],
  ['expect', "G.state === 'won' && G.L.won && !!G.L.s.egg && G.L.s.ending && G.L.s.egg.t < 1.6", 'the last thing taken up: the night is won, and the others are coming'],
  ['expect', "SAVE.data.eggs.void === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.void === true && G.L.text.egg === 'Take up everything.'", 'the easter egg is saved, by the night\'s id'],
  ['expect', "G.inv.length === 15 && !window.__it.taken && window.__refused === 0 && G.lastToast.msg !== 'Your hands are full.' && G.L.creature.frozen && G.L.creature.anger === 0 && G.L.items.filter(i => i.by).length === 0", 'nothing is taken yet: what you hold is still yours (and the keys on the floor), and it has stopped where it was'],
  key('r', true), ['expect', "G.state === 'won' && !!G.L.s.egg", 'R does nothing there'],
  ['expect', "(r => { window.__run0 = JSON.stringify(r); return !G.run && !!r && r.t >= 431.2 && r.t < 450 && r.best === true && r.nights.length === 13 && Math.abs(r.nights[12] - (r.t - 400)) < 0.02 && SAVE.data.bestRun[G.diff().id].t === r.t; })(G.lastRun)", 'the run is finished, and timed, the moment the last thing was taken up: this night\'s share of it, and a best run saved'],
  stepTo('VOID_EGG.first + 0.2'),
  ['expect', "(E => E.others.filter(o => o.on).map(o => o.type).join() === 'walker' && E.others[0].c.dist > 3 && E.others[0].c.dist < 12 && G.L.creature.fade < 0.1 && Math.abs(wrapPi(G.cam.yaw - G.L.facing)) < 0.25 && G.cam.pitch < 0.25)(G.L.s.egg)", 'the view is taken, level, to the north; it has backed off into the dark; and the first of them is coming, the walker'],
  ['expect', "(E => E.show && E.show.id === 'hammer' && G.hand.cur === E.show && G.hand.up > 0.9 && G.L.heldItem() === E.show && !G.L.offHand() && !G.hand.off.cur && E.show.held.y < 0 && E.show.held.x < 0 && G.inv.length === 15)(G.L.s.egg)", 'and your hand holds up what was its own, the hammer: one hand, raised, nothing in the other'],
  stepTo('VOID_EGG.first + VOID_EGG.rush + VOID_EGG.take + 0.1'),
  ['expect', "(E => { const o = E.others[0], it = o.items[0]; return o.came && it.by === 'walker' && !G.inv.includes(it) && o.fly.length === 1 && o.fly[0].it === it && !o.held[0] && E.show !== it && (G.hand.gone === it || G.hand.cur !== it); })(G.L.s.egg)", 'it is there, and takes it: the hammer is out of your hand (left open) and on its way to the walker\'s'],
  stepTo('VOID_EGG.first + VOID_EGG.rush + VOID_EGG.take + VOID_EGG.pass + 0.1'),
  ['expect', "(E => { const o = E.others[0]; return o.held[0] === o.items[0] && !o.fly.length && o.c.dist < 2 && Math.abs(o.c.dist - o.near) < 0.01; })(G.L.s.egg)", 'the walker has it in its hand, still there in front of you'],
  stepTo('VOID_EGG.first + VOID_EGG.rush + VOID_EGG.take + VOID_EGG.second + VOID_EGG.pass + VOID_EGG.look * 0.5'),
  ['expect', "(E => { const o = E.others[0]; return o.held[1] === o.items[1] && o.lift > 0.5 && o.c.dist < 2 && E.others.filter(q => q.on).length === 1; })(G.L.s.egg)", 'and its second thing, the planks, after it; it holds them up a beat, looking, and no other has set out yet'],
  stepTo('VOID_EGG.hold + 0.1'),
  ['expect', `(E => E.others.every(o => o.took && o.came) && G.inv.length === 0 && G.L.items.every(i => i.taken && i.by) && E.others.every(o => JSON.stringify(o.held.map(i => i.id)) === JSON.stringify(${JSON.stringify(TAKERS)}[o.type]) && o.held.every(i => i.by === o.type)))(G.L.s.egg)`, 'each of the twelve came and took what was its own: all sixteen things, out of your hands and off the floor, each held by the creature of its night'],
  ['expect', "(W => { const k = G.L.s.egg.others.map(o => o.type), took = k.map(t => W.took[t]), came = k.map(t => W.came[t]); console.log('took at ' + took.map(v => v.toFixed(2)).join(' ')); return VOID_EGG.every >= 2.2 && VOID_EGG.every <= 2.6 && VOID_EGG.rush >= 0.6 && took.every((v, i) => Math.abs(v - (VOID_EGG.first + i * VOID_EGG.every + VOID_EGG.rush + VOID_EGG.take)) < 0.06) && came.every((v, i) => Math.abs(v - (VOID_EGG.first + i * VOID_EGG.every + VOID_EGG.rush)) < 0.06); })(window.__egg)", 'one at a time, in the order of their nights, each two and a half seconds after the one before, each up to you in 0.7 s'],
  ['expect', `(W => { const E = G.L.s.egg, V = VOID_EGG, bad = []; for (const o of E.others) o.items.forEach((it, k) => { const id = it.id, tk = V.first + o.n * V.every + V.rush + V.take + k * V.second;
      if (!(W.shown[id] < W.given[id] - (k ? 0.3 : 0.6) && (k > 0 || W.shown[id] < W.came[o.type] - 0.6) && Math.abs(W.given[id] - tk) < 0.06 && Math.abs(W.got[id] - W.given[id] - V.pass) < 0.06)) bad.push(id + ' ' + [W.shown[id], W.came[o.type], W.given[id], W.got[id]].map(v => v === undefined ? '-' : v.toFixed(2)).join('/')); });
    const n = E.others.length - 1; console.log('handed over: ' + Object.keys(W.shown).length + ' shown; ' + (bad.join(', ') || 'all in order'));
    return !bad.length && Object.keys(W.shown).length === 16 && E.others.every((o, i) => i === n || W.came[E.others[i + 1].type] > Math.max(...o.items.map(it => W.got[it.id])) + 0.4); })(window.__egg)`,
    'each take is seen: every one of the sixteen things was up in your raised hand before its creature was there (the keys up off the floor into it too), left your hand as it took it, and was in its hand 0.35 s later, before the next one came'],
  ['expect', "(W => G.L.s.egg.others.every(o => W.near[o.type] < o.near + 0.02 && W.near[o.type] < 2) && W.shake > 0.05)(window.__egg)", 'each came right up to you (under two metres), with a jolt'],
  ['expect', "(E => E.others.every(o => Math.abs(o.c.dist - o.r) < 0.01 && Math.abs(wrapPi(o.c.yaw - G.L.facing - o.b)) < 0.001 && o.hopY === 0) && E.others.filter(o => o.b < 0).length === 6 && E.others.filter(o => o.b > 0).length === 6 && new Set(E.others.map(o => o.b)).size === 12 && E.others.filter(o => o.r > 6).every(o => o.c.CR.h >= 1.9))(G.L.s.egg)", 'they backed away to their places: twelve of them in two rows facing you, six either side, the taller behind'],
  ['expect', "(c => c.fade === 1 && Math.abs(c.dist - VOID_EGG.place[1]) < 0.01 && Math.abs(wrapPi(c.yaw - G.L.facing)) < 0.001 && c.rage < 0.05 && c.mood === undefined && !c.disrobe && !c.dance && G.L.s.egg.others.every(o => Math.abs(o.b) > 0.12))(G.L.creature)", 'and the thing in the hood in the middle of them, calm, hooded: thirteen figures'],
  ['expect', eggInView, 'all thirteen within the view, on a desktop and on a phone held sideways'],
  ['eval', "window.__at = G.L.s.egg.others.map(o => [o.c.dist, o.c.yaw, o.hopY, o.held.length]).join(); window.__sfxN = window._sfx.length;"],
  stepTo('VOID_EGG.joy - 0.05'),
  ['expect', "G.L.s.egg.phase === 'hold' && window.__at === G.L.s.egg.others.map(o => [o.c.dist, o.c.yaw, o.hopY, o.held.length]).join() && window._sfx.length === window.__sfxN && G.L.s.meadow === 0 && VOID_EGG.joy - VOID_EGG.hold >= 3", 'they hold there, still and quiet, three seconds, each with what it took'],
  stepTo('VOID_EGG.joy + 0.5'),
  ['expect', "(E => E.thrown.length === 16 && E.others.every(o => o.held.length === 0 && o.threw !== null) && E.thrown.filter(th => { const u = E.t - th.t0; return th.vy * u - 4.9 * u * u > 0.6; }).length === 16 && new Set(E.thrown.map(th => th.it.id)).size === 16)(G.L.s.egg)", 'then all at once they throw it all up into the air: sixteen things, well over their heads'],
  ['expect', "(v => v.some(x => x.n === 'cheer' && Math.abs(x.t - VOID_EGG.joy) < 0.05) && v.some(x => x.n === 'win' && Math.abs(x.t - VOID_EGG.joy) < 0.05))(window._sfx)", 'with a ta-da (the sound `cheer`) and the chord of a night won'],
  ['expect', "!TUNES.twinkle && !TUNES.cheer", 'neither tuned apart from how it is made (js/soundtune.js)'],
  ['expect', "(() => { render(); const E = G.L.s.egg, n = E.confN; console.log('confetti in the view 0.5 s after the throw: ' + n); return n >= 24 && n <= 60; })()", 'and confetti: a few dozen bits of paper in the air over the view'],
  ['expect', "(W => { console.log('the flash at ' + W.flashAt.toFixed(2) + ', ' + W.flash.toFixed(2)); return Math.abs(W.flashAt - VOID_EGG.joy) < 0.05 && W.flash > 0.15 && W.flash <= 0.25 && window._sfx.some(x => x.n === 'twinkle' && Math.abs(x.t - VOID_EGG.joy) < 0.05) && !SAVE.data.settings.reducedFlash; })(window.__egg)",
    'and, that instant, the view lightened by the flash of the other ending\'s scare, with a party popper going off (the sound `twinkle`): a happy jump scare'],
  stepTo('VOID_EGG.light[0] + 1.6'),
  ['expect', "G.L.s.meadow > 0.1 && G.L.s.meadow < 0.4 && G.L.pal.skyTop[0] > 150 && G.L.pal.fog[0] > 150", 'as the dark turns to the pale light'],
  stepTo('VOID_EGG.joy + 3'),
  ['expect', "(() => { render(); return G.L.s.egg.confN === 0; })()", 'the confetti has come down and gone, under three seconds on'],
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
  // and then they frolic: about the meadow, each in its own way, for as long as you stay
  ['expect', "G.L.s.egg.movers.length === 13 && G.L.s.egg.movers.every(m => !m.fro) && VOID_EGG.frolic > VOID_EGG.arm + 1 && VOID_EGG.frolic - VOID_EGG.light[1] > 2", 'they have leapt there in the meadow a few seconds, each still at its place'],
  frolic('VOID_EGG.frolic + 24'),
  ['expect', `(F => { console.log('the frolic: went ' + Object.keys(F.path).map(k => k + ' ' + F.path[k].toFixed(0)).join(', ') + ' m; out of bounds ' + (F.bad.slice(0, 6).join(' ') || 'never')); return ${RUNNERS}.every(k => F.path[k] > 12 && Math.max(F.hi[k][0] - F.lo[k][0], F.hi[k][1] - F.lo[k][1]) > 4 && F.step[k] < 8 / 60); })(window.__fro)`,
    'after the leaping they run about the meadow: each of the eleven that run (and the thing in the hood among them) goes a good many metres, all over it, and never in a jump'],
  ['expect', "(F => !F.bad.length && F.off < 1e-6 && G.L.s.egg.movers.every(m => Math.hypot(m.fu, m.fv) >= VOID_FROLIC.you - 0.01))(window.__fro)", 'within the meadow in front of you all the while: never on you, the big tree or the pool; and each is drawn where it is'],
  ['expect', `(F => F.step.runner > F.step.walker * 1.5 && F.step.crawler > F.step.other * 1.2 && ${RUNNERS}.filter(k => F.faces[k] === 3).length >= 9 && F.lean > 0.08)(window.__fro)`, 'at their own speeds (the runner the fastest), turned and leaning the way they go'],
  ['expect', `(F => ${RUNNERS}.filter(k => k !== 'demon').every(k => F.leapt[k] && F.hopped[k]))(window.__fro)`, 'with little hops as they run, and now and then stopping to leap on the spot'],
  ['expect', "(F => { console.log('the stone one: ' + F.jumps.watcher.length + ' jumps, of ' + F.jumps.watcher.map(d => d.toFixed(1)).join(' ')); return F.jumps.watcher.length >= 4 && F.jumps.watcher.every(d => d >= 2.5) && F.creep.watcher === 0; })(window.__fro)", 'the stone one is never seen to move: it is somewhere else, all at once, metres away, again and again'],
  ['expect', "(F => F.path.swimmer === 0 && G.L.s.egg.others.find(o => o.pool).dove !== undefined)(window.__fro)", 'the swimmer keeps to its pool, ducking under and bursting up again'],
  ['expect', "(c => c.dance > 0.5 && c.disrobe === 1 && c.noHeap === true && c.fade === 1 && Math.hypot(G.L.s.egg.dm.fu - G.L.s.egg.heapU, G.L.s.egg.dm.fv - G.L.s.egg.heapV) >= VOID_FROLIC.heap - 0.01 && window.__fro.pair > 0.4)(G.L.creature)", 'the thing in the hood, in its shirt and shorts, skips about among them, dancing, its robe left where it fell'],
  ['expect', "(E => E.thrown.length === 16 && E.thrown.every(th => E.t - th.t0 > th.tl && th.fade === 1) && G.state === 'won' && G.L.s.wait && !G.L.s.leaving && G.L.lookFree())(G.L.s.egg)", 'what they threw still lies in the grass, and the meadow still waits for a press'],
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
// with reduced motion and flashing: the same, come slower and from nearer, no jolt, no flash, and only a gentle bob for a leap;
// and in the meadow they amble, slowly
const eggStill = [
  ['eval', "SAVE.setSetting('reducedMotion', true); SAVE.setSetting('reducedFlash', true); startLevel(G.levelIndex, false);"], ['wait', 300], far,
  ['eval', "G.noRaf = true; window.__egg = null; for (const it of G.L.items.slice()) pickup(it); G.shakeAmt = 0; G.flashAmt = 0;"],
  ['expect', "G.state === 'won' && !!G.L.s.egg", 'with reduced motion: the last thing taken up, the same'],
  stepTo('VOID_EGG.joy + 1.2'),
  ['expect', "(() => { render(); const n = G.L.s.egg.confN; return n > 0 && n <= 12; })()", 'with reduced motion: only a few bits of paper, let fall gently'],
  stepTo('VOID_EGG.joy + 4'),
  ['expect', "(W => { console.log('reduced motion: came at ' + W.came.walker.toFixed(2) + ', leaps ' + Math.max(...Object.values(W.up)).toFixed(3) + ', shake ' + W.shake); return W.came.walker > VOID_EGG.first + 1 && Object.values(W.up).every(v => v > 0.005 && v <= 0.06) && W.shake === 0 && G.flashAmt === 0 && W.flash === 0 && W.flashAt === undefined && G.L.s.egg.thrown.length === 16 && G.L.creature.dance === 0 && G.L.creature.disrobe === 1; })(window.__egg)", 'each comes slower, with no jolt; they throw it all up, and only bob for joy; it takes off its robe, and does not dance'],
  ['expect', "window._sfx.some(x => x.n === 'twinkle' && Math.abs(x.t - VOID_EGG.joy) < 0.05)", 'with reduced flashing: the popper, and no flash'],
  frolic('VOID_EGG.frolic + 24'),
  ['expect', `(F => { console.log('reduced motion, the frolic: went ' + Object.keys(F.path).map(k => k + ' ' + F.path[k].toFixed(1)).join(', ') + ' m; hops ' + F.up.toFixed(3)); return ${RUNNERS}.every(k => F.path[k] > 3 && F.step[k] < 1.6 / 60) && !F.bad.length && F.up <= 0.06 && F.lean === 0 && F.path.swimmer === 0 && F.jumps.watcher.length >= 2 && F.creep.watcher === 0 && G.L.creature.dance === 0 && G.L.s.wait; })(window.__fro)`,
    'and in the meadow they amble, slowly, with only a gentle bob: no running, no leaning, no dance; the meadow waits'],
  ['eval', "SAVE.setSetting('reducedMotion', false); SAVE.setSetting('reducedFlash', false); SAVE.data.complete = {}; SAVE.persist(); G.noRaf = false; G._last = performance.now(); requestAnimationFrame(frame); startLevel(G.levelIndex, false);"], ['wait', 400],
];
module.exports = {
  nightmare: [].concat(rushed, paced, fifteenDeath, egg, eggStill, start, tempted, full, oneDown, letGo, ending),
};
