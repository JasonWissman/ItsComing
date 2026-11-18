// The Bedroom: bulb from the drawer into the lamp, the switch (on Nightmare the cord first, and three clicks), and
// in the light it ducks down behind the bed until only its eyes are over the edge, then its hands come up onto the
// covers; then hold the covers up, before its hands have pulled their way up the bed to you. The covers come up over
// your eyes and it plays out under them: it comes to the bed and pulls at them three times, and they hold.
// Before that: the night's card shows it where it starts, peering round the edge of the opening, and it does not move
// when the night begins; at first it only peers (and having its head in view is seeing it), then steps out; the covers
// pulled up with the lamp off are a death of their own: it takes them and pulls them away; and its hands reaching you
// are another.
// First, the mattress's top is one piece drawn before the covers, so no part of it is drawn over them as they come up.
const relight = ['waitUntil', "G.L.won ? true : (!G.L.s.lampOn && G.L.s.fitted && G.L.s.plugged ? (useTarget(G.L.targets.find(t => t.id === 'lamp')), false) : false)", 20000];
const lamp = [['use', 'drawer'], ['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on']];
const mattress = ['expect', "(() => { const m = R.statics.filter(p => p.kind === 'poly' && p.pts.length >= 3 && p.pts.every(v => Math.abs(v[1] - 0.58) < 1e-6 && Math.abs(v[0]) <= 0.751) && p.pts.some(v => v[2] > 1)); return m.length === 1 && m[0].sd > 1.62; })()", 'the mattress top is one piece, drawn before the covers'];
const under = [['waitUntil', 'G.L.s.over >= 1 && G.L.s.tugs === 3', 9000], ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'under the covers: it came to the bed and pulled at them three times, and they held'],
  // the card after: each of its two sentences on a line of its own (the text breaks where it says \n)
  ['waitUntil', "G.state === 'survived'", 12000],
  ['expect', "(p => !!p && p.innerText.split('\\n').map(l => l.trim()).join('|') === 'You pulled the covers over your head.|It pulled at them, but you were stronger.')(UI.overlay.querySelector('.intro'))", 'the survived card puts each sentence on a line of its own']];
// What will not go, shown (js/hands.js), with it held where it is: the wrong bulb is tried in the lamp's socket, will not go
// in, and drops onto the bed, where it can be seen and taken again (looked at as a player would, and clicked); with no bulb
// in, your hand pulls the lamp's chain and nothing comes of it; holding the covers, your hand is on their hem.
const fresh = [['eval', 'restartLevel(); G.L.creature.hold = G.L.creature.dist;'], ['wait', 250]];
const T = id => "G.L.targets.find(t => t.id === '" + id + "')";
const seeAndTake = "(() => { const it = G.L.items.find(i => i.id === 'bulb2'); const yaw = Math.atan2(it.x, it.z); G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; return it; })()";
const clickable = "(() => { const it = G.L.items.find(i => i.id === 'bulb2'), h = [...R.hits].reverse().find(h => h.kind === 'item' && h.ref === it); if (!h) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2 + R.viewY; updateHover(); return !!G.hover && G.hover.ref === it; })()";
const fumbles = [].concat(
  fresh, [['eval', T('drawer') + '.onClick(); const b = G.L.items.find(i => i.id === "bulb2"); b.taken = true; G.inv.push(b); G.active = 0; G.hand.reach = null; G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300],
    ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.fumbling && G.fumbling.preset === 'bump' && G.fumbling.drop && !G.inv.length && /Wrong kind of bulb/.test(G.lastToast.msg)", 'the wrong bulb is tried in the lamp, and will not go in'],
    ['waitUntil', '!G.fumbling', 3000], ['expect', "(() => { const it = G.L.items.find(i => i.id === 'bulb2'); return !it.taken && it.y === G.L.floor.y && !G.L.s.fitted; })()", 'it drops onto the bed'],
    ['eval', seeAndTake], ['wait', 300], ['expect', clickable, 'where it can be seen and taken again'],
    ['eval', 'pickup(' + seeAndTake + ');'], ['expect', "G.inv.some(i => i.id === 'bulb2')", 'and taken']],
  fresh, [['eval', 'G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300], ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.hand.reach && G.hand.reach.style === 'pull' && G.hand.reach.target === " + T('lamp'), 'no bulb in it, nothing in hand: your hand goes to the lamp\'s chain'],
    ['waitUntil', 'G.L.s.tugAt > 0', 2000], ['expect', 'G.L.s.tugAt > 0 && !G.L.s.lampOn', 'and pulls it, and nothing comes of it']],
  [['eval', 'restartLevel();'], ['wait', 250]]);
// at first only its head round the edge of the opening, its body behind the wall, and that counts as seeing it; brought on
// past the opening, it has stepped out into the room, its head over its shoulders and none of it hidden by the wall
const peering = [
  ['eval', 'restartLevel();'], ['wait', 250],
  ['expect', "(c => G.L.s.mode === 'peer' && c.peer === 1 && !!c.showX && Math.abs(c.lat) > (c.showX[1] - c.showX[0]) / 2 + 0.2 && c.hold === c.dist)(G.L.creature)", 'at first it only peers round the edge of the opening, its body behind the wall'],
  ['expect', "(c => c.dist > c.lane.apertures[0].z && (c.lane.idx !== 1 || c.dist < 3.55))(G.L.creature)", 'behind the opening (in the closet, in front of the clothes on the rail)'],
  ['expect', 'G.L.creature.seen && G.L.creature.visFrac > 0.5', 'and with its head in view it counts as seen'],
  ['eval', 'G.L.s.peerTill = 0; G.L.creature.u = 1 - (G.L.creature.lane.idx ? 2.9 : 3.3) / G.L.creature.D0;'],
  ['waitUntil', "(c => G.L.s.mode === 'come' && c.peer === 0 && Math.abs(c.lat) < 0.05 && !c.showX && c.hold === null)(G.L.creature)", 15000],   // (it glides out, slowly)
  ['expect', "(c => G.L.s.mode === 'come' && c.peer === 0 && Math.abs(c.lat) < 0.05 && !c.showX && c.hold === null)(G.L.creature)", 'then it steps out of the opening into the room'],
];
// Coming out and on to the bed it glides: nothing of it ever jumps. Watched every frame from your eye (the view on it), as
// a player sees it (each part as it was last drawn, and when), with the night's clock run far ahead of it (the worst case: it goes at its own top pace all the way):
// where it is, and where its head, neck, hips, hands and feet are drawn, in metres in the room, and its head's tilt; each
// frame's move is scaled to a 60 fps frame. Then, unseen, it changes its way: round the bed, and that glides too.
const SMOOTH = { body: 0.006, part: 0.012, foot: 0.03, tilt: 0.01, round: 0.009 };
const sampler = "window.__glide = { worst: {}, where: {}, n: 0, last: null, drawn: null }; (function w() { const L = G.L, c = L.creature, W = window.__glide; if (G.state !== 'play' || W.stop) return; " +
  "const live = ['peer', 'come', 'cross'].includes(L.s.mode), put = (n, v, i) => { if (v > (W.worst[n] || 0)) { W.worst[n] = v; W.where[n] = (i === undefined ? '' : '#' + i + ' ') + L.s.mode + ' at ' + L.t.toFixed(2) + ' s, ' + c.dist.toFixed(2) + ' m'; } }, j = (a, b, k) => Math.hypot(...a.map((x, i) => x - b[i])) * k; " +
  // where it is, each frame of the night's clock
  "const q = c.pos(), now = { t: L.t, body: [q.x, q.z] }, p = W.last; W.last = now; " +
  "if (live && p && now.t > p.t) { put(L.s.mode === 'cross' ? 'round' : 'body', j(now.body, p.body, (1 / 60) / (now.t - p.t))); W.n++; } " +
  // its parts, each time it is drawn (as it was drawn, where it was then)
  "const d = W.look && c.drawn; if (d && (!W.drawn || d.at > W.drawn.at)) { const K = c.CR.SCALE, dq = APPROACH.position(c.lane, d.dist, d.lat, L.eyeH), rl = Math.hypot(dq.x, dq.z), at = v => [dq.x + dq.z / rl * v[0] * K, dq.y + (c.yOff || 0) + v[1] * K, dq.z - dq.x / rl * v[0] * K]; " +
  "const nd = { at: d.at, tilt: d.tilt, parts: [d.head, d.neck, d.hip].concat(d.hands).map(at), feet: d.feet.map(at) }, pd = W.drawn; W.drawn = nd; " +
  "if (live && pd) { const k = (1 / 60) / (nd.at - pd.at); put('tilt', Math.abs(nd.tilt - pd.tilt) * k); if (nd.parts.length === pd.parts.length) nd.parts.forEach((v, i) => put('part', j(v, pd.parts[i], k), i)); if (nd.feet.length === pd.feet.length) nd.feet.forEach((v, i) => put('foot', j(v, pd.feet[i], k), i)); } } " +
  "if (W.look) { const g = c.pos(); G.cam.yaw = G.cam.tYaw = Math.atan2(g.x, g.z); G.cam.pitch = G.cam.tPitch = 0; } requestAnimationFrame(w); })();";
const glideOk = (what, keys) => "(W => { const ok = W.n > 120 && " + keys.map(k => "(W.worst." + k + " || 0) <= " + SMOOTH[k]).join(' && ') + "; console.log('" + what + ": ' + JSON.stringify(W.worst) + ' ' + JSON.stringify(W.where) + ' over ' + W.n + ' frames'); return ok; })(window.__glide)";
const glide = [
  ['eval', 'restartLevel();'], ['wait', 250],
  ['eval', 'G.L.s.switched = true; ' + sampler + ' window.__glide.look = true; G.L.s.peerTill = 0; G.L.creature.u = 0.55;'],
  ['waitUntil', "G.L.creature.dist < 2.6 && G.L.s.mode === 'come'", 25000],
  ['eval', 'window.__glide.stop = true;'],
  ['expect', glideOk('stepping out and coming on', ['body', 'part', 'foot', 'tilt']), 'it glides out round the edge of the opening and on toward the bed: nothing of it jumps from one frame to the next'],
  ['eval', 'restartLevel();'], ['wait', 250],
  ['eval', "G.L.s.switchAt = 0; G.L.s.peerTill = 0; G.L.creature.u = 0.3; G.L.visFrac = () => 0; window.__lane0 = G.L.creature.lane.idx; " + sampler],
  ['waitUntil', "G.L.s.mode === 'cross'", 20000],
  ['waitUntil', "G.L.s.mode === 'come' && G.L.creature.lane.idx !== window.__lane0", 40000],
  ['eval', 'window.__glide.stop = true;'],
  ['expect', glideOk('round the bed', ['round']) + " && G.L.s.switched", 'unseen, it changed its way: round the bed to the other way in, gliding (no jump)'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// the night's card: it is already where it starts, peering round the edge, and the night begins with it just there
const pose = "(c => [c.dist, c.lat, c.peer, c.pos().x, c.pos().z].map(v => +v.toFixed(4)).join())(G.L.creature)";
const card = [
  ['eval', 'startLevel(G.levelIndex, true);'], ['wait', 400],
  ['expect', "(c => G.state === 'card' && G.L.s.mode === 'peer' && c.peer === 1 && !!c.showX && Math.abs(c.lat) > (c.showX[1] - c.showX[0]) / 2 + 0.2)(G.L.creature)", 'on the night\'s card it is already peering round the edge of the opening, where it starts'],
  ['eval', 'window.__cardPose = ' + pose + '; G.overlayArmed = 0; proceed();'], ['wait', 120],
  ['expect', "G.state === 'play' && " + pose + ' === window.__cardPose', 'and the night begins with it just there: it does not jump'],
];
// coming through the opening it stoops under the top of it: behind it, nothing of it over the line from your eye past the
// top of the frame; in it, under the top of the frame (watched every frame as it is brought through, breathing and all)
const stoop = [
  ['eval', 'restartLevel();'], ['wait', 150],
  ['eval', 'G.L.s.peerTill = 0; window.__stoop = { worst: -9, n: 0 }; (function w() { const c = G.L.creature, ap = c.lane.apertures[0], d = c.dist; if (c.headTop !== undefined && d < ap.z + 0.4 && d > ap.z - 0.12) { const room = d > ap.z ? G.L.eyeH + (ap.y1 - G.L.eyeH) * d / ap.z : ap.y1; window.__stoop.worst = Math.max(window.__stoop.worst, c.headTop * 1.015 - room); window.__stoop.n++; } if (G.state === "play" && d > ap.z - 0.6) requestAnimationFrame(w); })();'],
  ['eval', '(function go() { const c = G.L.creature; if (G.state === "play" && c.dist > c.lane.apertures[0].z - 0.6) { c.u = Math.min(1, c.u + 0.0025); requestAnimationFrame(go); } })();'],
  ['waitUntil', 'G.L.creature.dist <= G.L.creature.lane.apertures[0].z - 0.6', 20000],
  ['expect', 'window.__stoop.n > 10 && window.__stoop.worst <= 0', 'coming through the opening it stoops: nothing of it shows over the top of the frame'],
];
// its hands on the covers pull, again and again, each pull further up the bed, and when they reach you it comes up the
// bed after them (its own death and its own line); the fingers open as each hand reaches, and close on the cloth to pull it
const grabbed = [].concat(fresh, [
  ['eval', "const s = G.L.s; s.fitted = s.plugged = true; s.lampOn = true; s.wasLit = true; s.onAt = G.L.t; s.lampT = 60; window.__grab = { open: false, fist: false, jerk: false, back: false, k: [0, 0], ks: [] }; (function w() { const g = G.L.s.grab; if (g) { const W = window.__grab; g.hands.forEach((h, i) => { if (h.open > 0.95) W.open = true; if (h.open < 0.05 && h.drag > 0.95 && h.bunch > 0.9) W.fist = true; if (h.k < W.k[i] - 1e-9) W.back = true; W.k[i] = h.k; }); if (G.L.s.jerk > 0.9) W.jerk = true; W.ks.push(g.k); } if (G.state === 'play') requestAnimationFrame(w); })();"],
  ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 25000],
  ['expect', "G.deathCause === 'grabbed' && G.L.s.lampOn && !G.L.s.coversUp && G.L.s.grab.k === 1", 'the covers left down: its hands pulled their way up the bed to you, and it had you'],
  ['expect', 'window.__grab.open && window.__grab.fist && window.__grab.jerk && !window.__grab.back && window.__grab.k[0] === 1 && window.__grab.k[1] === 1', 'each hand reached on up the bed with its fingers spread, closed them on the cloth and pulled it, the covers jerking, and never went back'],
  ['waitUntil', "G.state === 'dead'", 4000],
  ['expect', 'G.deathScreen.text === G.L.text.death.grabbed', 'and the card has its own line'],
  ['eval', 'restartLevel();'], ['wait', 250],
]);
// the covers pulled up with the lamp off: it is at the bed all at once, takes the covers and pulls them away, and it is in
// your face (its own death, and its own line)
const dark = [].concat(fresh, [
  ['hold', 'covers', 9000],
  ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 3000],
  ['expect', "G.deathCause === 'dark' && !G.L.s.lampOn && !G.L.s.coversUp && G.L.s.yankK === 1 && G.L.creature.lungeFrom < 2.2", 'covers up in the dark: it came to the bed, pulled them down off you, and had you'],
  ['waitUntil', "G.state === 'dead'", 4000],
  ['expect', "G.deathScreen.text === G.L.text.death.dark && /not afraid of the dark/.test(G.deathScreen.text)", 'and the card says it took the covers: the dark does not stop it'],
  ['eval', 'restartLevel();'], ['wait', 250],
]);
// the light: it flinches from it and goes down (out of sight below the bed, or low along the floor out in the open), comes up at the bed with only its eyes over
// the edge, then its hands up over it onto the covers (watched every frame from before the lamp)
// down there, going along the floor to the bed, it crawls (its hands and feet going as far as it goes: D.crawl, against
// D.moved, the metres it went) and its eyes stay on you: its face never turns away
const ducked = ['eval', "window.__duck = { flinch: 0, low: false, face: 0, crawl: 0, moved: 0, at: null }; (function w() { const c = G.L.creature, D = window.__duck; D.flinch = Math.max(D.flinch, c.flinch || 0); if (c.duck > 0.99 && (c.eyeTo + 0.15 < c.hideBelow || c.eyeTo < 0.3)) D.low = true; if (G.L.s.mode === 'duck') { D.face = Math.max(D.face, c.faceAway || 0); const p = c.pos(); if (D.at) { D.moved += Math.hypot(p.x - D.at.x, p.z - D.at.z); D.crawl += Math.abs((c.crawl || 0) - D.at.k); } D.at = { x: p.x, z: p.z, k: c.crawl || 0 }; } if (G.state === 'play') requestAnimationFrame(w); })();"];
const duck = [
  ['waitUntil', "G.L.s.mode === 'duck' && G.L.creature.reach > 0.99", 20000],
  ['expect', "(c => !c.hideTop && !c.showX && c.CR.h > 2 && G.L.rend.get(c).h < 1.1 && G.L.rend.get(c).sd > Math.max(...R.statics.filter(p => p.kind === 'poly' && p.pts.every(v => Math.abs(v[0]) <= 0.81 && v[2] >= -1.06 && v[2] <= 1.95 && v[1] <= 0.75)).map(p => p.sd)))(G.L.creature)", 'down there it is drawn whole, before every part of the bed, so the bed hides what of it is behind the bed from where you sit'],
  ['expect', "(c => c.duck === 1 && c.eyeTo > c.hideBelow + 0.03 && c.eyeTo < c.hideBelow + 0.12 && c.hold !== null && !G.L.won)(G.L.creature)", 'in the light it ducked down behind the bed: only its eyes over the edge, and its hands up onto the covers'],
  ['expect', 'window.__duck.flinch > 0.9 && window.__duck.low', 'it flinched from the light and went down first: out of sight behind the bed, or low along the floor out in the open'],
  ['expect', '(D => D.face === 0 && D.crawl >= D.moved * CREATURES.tall.CRAWL * 0.8)(window.__duck)', 'low along the floor its eyes stayed on you, and it crawled there, its hands and feet going as far as it went'],
  ['expect', "/hands are on the covers/.test(G.lastToast.msg)", 'and you are told its hands are on the covers'],
];
// holding the covers, your hand is on them (watched while the solution holds them)
const coverHand = ['eval', "window.__coverHand = false; (function w() { if (G.holding && G.holding.id === 'covers' && G.hand.reach && G.hand.reach.target === G.holding) window.__coverHand = true; if (G.state === 'play') requestAnimationFrame(w); })();"];
module.exports = {
  // Nightmare charges 3.5x speed for every second spent looking away, so the harness faces each thing directly instead of sweeping
  nightmare: fumbles.concat(card, peering, glide, stoop, dark, grabbed, [mattress, ['face', 5, true], ['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in'], ['face', 2, true], ['use', 'drawer'], ['pickup', 'bulb'], ['face', 2, false], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ducked, ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on'], ...duck, ['face', 4, false], coverHand, ['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], ['expect', 'window.__coverHand', 'holding them, your hand was on the covers'], relight, ['expect', 'G.L.won', 'won'], ['expect', 'G.L.s.grab && G.L.s.grab.k < 1', 'and the covers came up before its hands reached you'], ...under]),
};
