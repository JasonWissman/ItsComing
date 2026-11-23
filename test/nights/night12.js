// The Bedroom: bulb from the drawer into the lamp, the switch (on Nightmare the cord first, and three clicks), and
// in the light it ducks down behind the bed until only its eyes are over the edge, then its hands come up onto the
// covers; then hold the covers up, before its hands have pulled their way up the bed to you. The covers come up over
// your eyes and it plays out under them: it comes to the bed and pulls at them three times, and they hold.
// Before that: the night's card shows it where it starts, peering round the edge of the opening, and it does not move
// when the night begins; at first it only peers (and having its head in view is seeing it), then steps out; the covers
// pulled up with the lamp off are a death of their own: it takes them and pulls them away; and its hands reaching you
// are another.
// First, the mattress's top is one piece drawn before the covers, so no part of it is drawn over them as they come up.
// And the night's easter egg, the television (tv, below): the remote in the drawer where the wrong bulb was, the set put
// on with it, the film, and what the thing does about it from each of its states.
const relight = ['waitUntil', "G.L.won ? true : (!G.L.s.lampOn && G.L.s.fitted && G.L.s.plugged ? (useTarget(G.L.targets.find(t => t.id === 'lamp')), false) : false)", 20000];
const lamp = [['use', 'drawer'], ['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on']];
const mattress = ['expect', "(() => { const m = R.statics.filter(p => p.kind === 'poly' && p.pts.length >= 3 && p.pts.every(v => Math.abs(v[1] - 0.58) < 1e-6 && Math.abs(v[0]) <= 0.751) && p.pts.some(v => v[2] > 1)); return m.length === 1 && m[0].sd > 1.62; })()", 'the mattress top is one piece, drawn before the covers'];
const under = [['waitUntil', 'G.L.s.over >= 1 && G.L.s.tugs === 3', 9000], ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'under the covers: it came to the bed and pulled at them three times, and they held'],
  // the card after: each of its two sentences on a line of its own (the text breaks where it says \n)
  ['waitUntil', "G.state === 'survived'", 12000],
  ['expect', "(p => !!p && p.innerText.split('\\n').map(l => l.trim()).join('|') === 'You pulled the covers over your head.|It pulled at them, but you were stronger.')(UI.overlay.querySelector('.intro'))", 'the survived card puts each sentence on a line of its own']];
// With no bulb in, your hand pulls the lamp's chain and nothing comes of it (shown: js/hands.js); holding the covers, your
// hand is on their hem. The drawer holds the bulb and the television's remote control, and no bulb that will not fit.
const fresh = [['eval', 'restartLevel(); G.L.creature.hold = G.L.creature.dist;'], ['wait', 250]];
const T = id => "G.L.targets.find(t => t.id === '" + id + "')";
const fumbles = [].concat(
  fresh, [['eval', T('drawer') + '.onClick();'],
    ['expect', "(its => its.map(i => i.id).sort().join() === 'bulb,remote' && !its.some(i => i.decoy) && its.find(i => i.id === 'remote').name === 'Remote' && !ICONS.bulbPin)(G.L.items.filter(i => !i.taken))", 'the drawer holds the bulb and the remote control ("Remote"), and no wrong bulb'],
    ['eval', 'const r = G.L.items.find(i => i.id === "remote"); pickup(r); G.hand.reach = null; G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300],
    ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.inv.length === 1 && G.inv[0].id === 'remote' && !G.L.s.fitted && G.lastToast.msg === 'It\\'s missing something.'", 'the remote tried at the lamp is no bulb: "It\'s missing something.", and it stays in your hand'],
    ['waitUntil', '!G.fumbling', 3000]],
  fresh, [['eval', 'G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300], ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.hand.reach && G.hand.reach.style === 'pull' && G.hand.reach.target === " + T('lamp'), 'no bulb in it, nothing in hand: your hand goes to the lamp\'s chain'],
    ['expect', "G.lastToast.msg === 'It\\'s missing something.'", 'and the line is "It\'s missing something."'],
    ['waitUntil', 'G.L.s.tugAt > 0', 2000], ['expect', 'G.L.s.tugAt > 0 && !G.L.s.lampOn', 'and pulls it, and nothing comes of it']],
  [['eval', 'restartLevel();'], ['wait', 250]]);
// ---- the television (the night's easter egg) ----
// The night is stepped by hand (update(1/60)) from the moment the set comes on, every frame noted: where the thing is in
// the room, its way in, how far down it is, and what the tall one's c.tv says of it (looking, watching, thrown back, its
// fist out, its head coming round); and every effect that is played, and when. Times are seconds from the click.
const tvLib = '(' + function () {
  const W = [0.654, 2.336];   // where it stands to watch (night12.js WATCH)
  const tv = window.__tv = {
    T: id => G.L.targets.find(t => t.id === id), W, fx: [], log: [], shakes: 0,
    // a fresh night, the thing coming by the way asked for (0: the doorway, 1: the closet)
    fresh(lane) { restartLevel(); for (let i = 0; i < 80 && G.L.creature.lane.idx !== lane; i++) restartLevel(); return G.L.creature.lane.idx === lane; },
    hear() {
      if (AUDIO.__tv) return;
      AUDIO.__tv = true;
      const x = AUDIO.sfx, sh = G.shake;
      // (whichever copy of this is the page's now; as the set clicks on: the night's clock, and where the thing is)
      AUDIO.sfx = function (n) { const now = window.__tv; now.fx.push({ n, t: G.L ? G.L.t : 0 }); if (n === 'tvOn') { now.u0 = G.L.creature.u; now.p0 = now.at(); } return x.apply(this, arguments); };
      G.shake = function (a) { if (G.L && G.L.s.mode === 'tv') window.__tv.shakes++; return sh.apply(this, arguments); };
    },
    lamp(secs) { const s = G.L.s; s.fitted = s.plugged = true; s.lampOn = true; s.wasLit = true; s.onAt = G.L.t; s.lampT = secs || 90; },
    remote() { const d = tv.T('drawer'); if (!d.open) d.onClick(); const r = G.L.items.find(i => i.id === 'remote'); if (!r.taken) pickup(r); G.hand.reach = null; return G.inv.some(i => i.id === 'remote'); },
    at() { const p = G.L.creature.pos(); return [p.x, p.z]; },
    far(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]); },
    arm() { tv.hear(); tv.fx.length = 0; tv.log = []; tv.shakes = 0; tv.u0 = G.L.creature.u; tv.p0 = tv.at(); tv.grab0 = G.L.s.grab ? G.L.s.grab.k : 0; },
    on() { tv.remote(); tv.arm(); useTarget(tv.T('tv')); return !!G.L.s.tv; },
    t() { return G.L.t - G.L.s.tv.t0; },
    // the night stepped on by hand with nothing noted (secs), or until a thing is so
    free(secs, until) { for (let i = 0, n = Math.round(secs * 60); i < n && G.state === 'play' && !(until && until()); i++) update(1 / 60); return G.state; },
    // and, the set on, to `to` seconds from the click, each frame noted
    run(to, until) {
      const L = G.L, c = L.creature;
      while (tv.t() < to && G.state === 'play' && !(until && until())) {
        update(1 / 60);
        const P = c.tv || {}, p = tv.at();
        tv.log.push({ t: tv.t(), mode: L.s.mode, st: G.state, p, off: tv.far(p, W), d: c.dist, lane: c.lane.idx, duck: c.duck || 0, flinch: c.flinch || 0, reach: c.reach || 0, peer: c.peer || 0, look: P.look || 0, watch: P.watch || 0, lurch: P.lurch || 0, punch: P.punch || 0, turn: P.turn || 0, lit: P.lit || 0, u: c.u });
      }
      return G.state;
    },
    in(a, b) { return tv.log.filter(f => f.t >= a && f.t <= b); },
    max(k, a, b) { return Math.max(-1, ...tv.in(a, b).map(f => f[k])); },
    min(k, a, b) { return Math.min(99, ...tv.in(a, b).map(f => f[k])); },
    when(n, i) { const e = tv.fx.filter(f => f.n === n)[i || 0]; return e ? e.t - G.L.s.tv.t0 : -1; },
    alive() { return G.state === 'play' && tv.log.every(f => f.st === 'play'); },
    // it never went over the bed, nor through a wall but by the middle of its opening
    clear() {
      let bad = null;
      tv.log.forEach((f, i) => {
        const [x, z] = f.p, q = i ? tv.log[i - 1].p : f.p;
        if (Math.abs(x) < 0.7 && z < 1.85 && f.t > 0.6 && tv.far(f.p, tv.p0) > 0.3) bad = bad || 'over the bed at ' + x.toFixed(2) + ', ' + z.toFixed(2);
        if ((q[1] - 3.6) * (z - 3.6) < 0 && Math.abs(x) > 0.3) bad = bad || 'through the wall by the doorway at x ' + x.toFixed(2);
        if ((q[0] + 3.2) * (x + 3.2) < 0 && Math.abs(z) > 0.65) bad = bad || 'through the wall by the closet at z ' + z.toFixed(2);
      });
      if (bad) console.log('the way to the television: ' + bad);
      return !bad;
    },
    // every target as it is hit from every way you can look: pointed at in the middle of what shows of it, which target
    // is under the pointer (the view left looking north again)
    hits() {
      const out = {};
      for (const down of [0, 1]) for (let d = 0; d < 8; d++) {
        G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; render();
        for (const h of [...R.hits]) {
          if (h.kind !== 'target') continue;
          const x0 = Math.max(0, h.x), y0 = Math.max(0, h.y), x1 = Math.min(R.W, h.x + h.w), y1 = Math.min(R.H, h.y + h.h);
          if (x1 - x0 < 8 || y1 - y0 < 8) continue;
          G.mouse.x = (x0 + x1) / 2; G.mouse.y = (y0 + y1) / 2 + R.viewY; updateHover();
          out[d + (down ? 'd' : '') + ':' + h.ref.id] = G.hover ? G.hover.ref.id : '';
        }
      }
      G.mouse.x = G.mouse.y = -1; G.cam.dirIdx = 0; G.cam.yaw = G.cam.tYaw = 0; G.cam.pitch = G.cam.tPitch = 0; render(); updateHover();
      return out;
    },
    hover() { const h = [...R.hits].reverse().find(q => q.kind === 'target' && q.ref.id === 'tv'); if (!h) return null; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2 + R.viewY; updateHover(); return G.hover && G.hover.ref.id === 'tv' ? UI.tooltip.textContent : ''; },
  };
}.toString() + ')();';
const X = e => '(tv => ' + e + ')(window.__tv)';
// the whole of it, from far off on its approach, in the dark: it has just begun to come out of its opening
const tvFar = [
  ['eval', tvLib + ' window.__tv.fresh(0); G.L.s.switched = true; G.L.s.peerTill = 0;'], ['wait', 250], ['face', 0, false], ['wait', 200],
  ['expect', X("tv.free(8, () => G.L.creature.dist < 3.95) === 'play' && G.L.s.mode === 'come' && G.L.creature.dist > 3.6"), 'it has begun to come out, far off still (behind its opening)'],
  ['wait', 200],
  ['expect', X("tv.T('tv').hidden && tv.hover() === null && !G.L.s.tv"), 'without the remote the television is only scenery: not a target, nothing on it to point at'],
  ['eval', X("(tv.was = tv.hits())")],
  ['expect', X("(k => k.length >= 4 && !k.some(q => /:tv$/.test(q)) && ['drawer', 'lamp', 'covers', 'socket'].every(id => k.some(q => q.endsWith(':' + id) && tv.was[q] === id)))(Object.keys(tv.was))"), 'the night\'s own targets, each pointed at from wherever it shows'],
  ['eval', X("(tv.remote(), pickup(G.L.items.find(i => i.id === 'bulb')), G.hand.reach = null, delete SAVE.data.eggs.bedroom, tv.arm())")], ['wait', 250],
  ['expect', X("G.inv[G.active].id === 'bulb' && !tv.T('tv').hidden && tv.hover() === 'Turn on the TV'"), 'with the remote carried (the bulb in hand, not it) the television is a target: "Turn on the TV"'],
  ['expect', X("(now => Object.keys(tv.was).every(q => now[q] === tv.was[q]) && now['0:tv'] === 'tv' && now['1:tv'] === 'tv' && (console.log('targets: ' + JSON.stringify(now)), true))(tv.hits())"), 'and it is in the way of none of the others (the drawer emptied): each is hit just as before, and the set itself looking north and north-east'],
  ['use', 'tv'],
  ['expect', X("!!G.L.s.tv && G.L.s.mode === 'tv' && SAVE.data.eggs.bedroom === true && G.L.text.egg === 'Put on a horror movie.' && G.inv[G.active].id === 'remote' && tv.T('tv').hidden"), 'clicked, it comes on: the easter egg is saved for the night, the remote is in your hand, and the set is no longer a target'],
  ['expect', X("tv.run(0.5) === 'play' && tv.when('tvOn') >= 0 && tv.when('tvOn') < 0.05 && tv.when('tvStatic') < 0.05 && tv.when('tvStatic') >= 0 && tv.when('tvDrone') < 0 && G.L.creature.tv.look > 0.9 && tv.far(tv.at(), tv.p0) < 0.12"), 'a click, and static; it stops where it is and looks round at it'],
  ['expect', X("tv.run(1.3) === 'play' && tv.when('tvDrone') > 0.9 && tv.when('tvDrone') < 1.2"), 'about a second of static, and then the film begins'],
  ['expect', X("tv.run(2.4) === 'play' && (f => !!f && f.t > 1.1 && f.t < 2.15)(tv.log.find(f => f.off < 0.06)) && tv.max('duck', 0.6, 2.2) > 0.9 && tv.clear() && G.L.creature.lane.idx === 0"), 'it scurries over to the set, low on all fours, in a second or so (out through the middle of the doorway)'],
  ['expect', X("tv.run(6.9) === 'play' && tv.min('watch', 2.6, 6.9) > 0.95 && tv.max('off', 2.6, 6.9) < 0.06 && tv.max('lit', 2.6, 6.9) > 0.15 && tv.max('duck', 2.6, 6.9) < 0.05 && tv.when('tvCreak') > 2.3 && tv.when('tvCreak', 1) > 4.9 && tv.when('tvShriek') < 0"), 'and bends over it, its face at the screen, lit by it, watching, while the film plays (its door creaks, twice)'],
  ['expect', X("tv.run(7.59) === 'play' && tv.when('tvShriek') > 6.95 && tv.when('tvShriek') < 7.1 && tv.max('lurch', 7.08, 7.59) > 0.9 && tv.max('off', 7.1, 7.59) > 0.15 && tv.when('tvYelp') > 7.05 && tv.when('tvYelp') < 7.2 && G.L.s.tv.smashAt === undefined"), 'the film\'s fright, with its tinny shriek: it is thrown back from the set, with a yelp'],
  ['expect', X("tv.run(8.2) === 'play' && (q => q > 7.7 && q < 7.9)(G.L.s.tv.smashAt - G.L.s.tv.t0) && tv.max('punch', 7.7, 8.2) > 0.95 && tv.when('tvSmash') > 7.7 && tv.when('tvSmash') < 7.9 && tv.shakes === 1"), 'and at once its fist goes through the screen: the set is smashed'],
  ['expect', X("tv.run(9.8) === 'play' && tv.max('turn', 9.5, 9.8) > 0.9 && tv.max('turn', 0, 8.7) === 0 && tv.in(0, 9.8).every(f => f.mode === 'tv')"), 'then its head comes round to you, slowly'],
  ['expect', X("tv.run(10.0) === 'play' && G.L.s.mode === 'come' && Math.abs(G.L.creature.u - tv.u0) < 0.01 && tv.far(tv.at(), tv.W) < 0.1 && G.L.creature.hold === null && !G.L.creature.duck && tv.alive()"), 'and it comes on again, in the dark on its feet, from where it stands, the night\'s clock where it was; it caught nobody meanwhile'],
  ['eval', X("(tv.before = G.L.s.tv.t0, useTarget(tv.T('tv')))")], ['wait', 300],
  ['expect', X("G.L.s.tv.t0 === tv.before && G.L.s.tv.smashAt !== undefined && tv.T('tv').hidden && tv.hover() === null && tv.when('tvOn', 1) < 0"), 'the set cannot be put on twice: it stays smashed'],
  ['expect', X("tv.free(6) === 'play' && !G.L.creature.tv && G.L.s.mode === 'come'"), 'its head comes upright again as it goes'],
  // and the night can still be won
  ['eval', X('tv.lamp()')], ['hold', 'covers', 9000],
  ['expect', "G.L.won && G.L.s.coversUp && G.state === 'won'", 'after it the night is won as ever: the lamp, then the covers'],
  ['waitUntil', "G.state === 'survived'", 14000],
  ['expect', "G.survivedScreen.text === G.L.text.win && G.L.s.tugs === 3", 'and it is the night\'s own win'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// from the closet, crawling along the floor in the lamp's light: round the foot of the bed to it; and the lamp still on
// as its head comes round, it covers its eyes and goes down, and comes to the bed as the light has it
const tvCrawl = [
  ['eval', tvLib + ' window.__tv.fresh(1); G.L.s.peerTill = 0; window.__tv.lamp();'], ['wait', 250],
  ['expect', X("tv.free(9, () => G.L.creature.dist < 2.9) === 'play' && G.L.s.mode === 'duck' && G.L.creature.duck > 0.99 && G.L.creature.lane.idx === 1"), 'from the closet, in the lamp\'s light: it is down, crawling along the floor'],
  ['expect', X("tv.on() && tv.run(2.45) === 'play' && tv.far(tv.at(), tv.W) < 0.06 && tv.clear() && G.L.creature.lane.idx === 0 && G.L.lane.idx === 0 && tv.max('duck', 0, 2) > 0.99"), 'the set on: it scurries round the foot of the bed to it (never over the bed), and is counted along the doorway\'s way from there'],
  ['expect', X("tv.run(9.8) === 'play' && tv.min('watch', 2.9, 6.9) > 0.95 && G.L.s.tv.smashAt !== undefined && G.L.s.lampOn && tv.in(0, 9.8).every(f => f.mode === 'tv' && f.flinch < 0.01)"), 'it watches, in the lamp\'s light too, and smashes the set'],
  ['expect', X("tv.run(13.4) === 'play' && tv.in(9.9, 13.4).every(f => f.mode === 'duck') && tv.max('flinch', 9.9, 11.4) > 0.9 && G.L.creature.duck > 0.95 && tv.alive()"), 'the lamp on as its head comes round to you: it throws an arm across its face and goes down on its haunches'],
  ['expect', X("tv.run(22) === 'play' && G.L.creature.reach > 0.99 && Math.hypot(tv.at()[0], tv.at()[1] - 2.08) < 0.05 && /hands/.test(G.lastToast.msg)"), 'and comes low to the foot of the bed, and its hands come up onto the covers (and you are told)'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// at the bed, its hands on the covers and pulling: they let go; the lamp goes out while it watches, and the covers will
// not hold in the dark meanwhile (nor does it take them); it comes on in the dark; then the covers in the dark are its
// kill, and the line is the television's, under "It got you", with no toast before it
const tvBed = [
  ['eval', tvLib + ' window.__tv.fresh(0); G.L.s.peerTill = 0; window.__tv.lamp();'], ['wait', 250],
  ['expect', X("tv.free(20, () => G.L.s.grab && G.L.s.grab.k > 0.25) === 'play' && G.L.s.mode === 'duck' && G.L.creature.reach === 1 && G.L.s.grab.k > 0.25"), 'at the foot of the bed, its hands on the covers, pulling'],
  ['expect', X("tv.on() && tv.run(0.5) === 'play' && G.L.creature.reach < 0.02 && G.L.s.grab === null && G.L.creature.tv.look > 0.9"), 'the set on: its hands let go of the covers, and it looks round'],
  ['expect', X("tv.run(3) === 'play' && tv.far(tv.at(), tv.W) < 0.06 && G.L.creature.tv.watch > 0.95"), 'and it goes over and watches'],
  ['eval', X("(G.L.s.lampT = 0.01, tv.run(3.2), (c => { c.done = true; G.holding = null; c.use(null); })(tv.T('covers')))")],
  ['expect', X("!G.L.s.lampOn && G.L.s.mode === 'tv' && G.state === 'play' && !tv.T('covers').done && !G.L.s.coversUp && /lamp first/i.test(G.lastToast.msg)"), 'the lamp out while it watches: the covers pulled up in the dark do not hold, and it does not come for them'],
  ['expect', X("tv.run(10.0) === 'play' && G.L.s.mode === 'come' && Math.abs(G.L.creature.u - tv.u0) < 0.01 && tv.alive()"), 'its head round to you in the dark, it comes on from the set on its feet'],
  ['eval', X("(G.toast('The covers.'), (c => { c.done = true; G.holding = null; c.use(null); })(tv.T('covers')))")],
  ['waitUntil', "G.state === 'dead'", 6000],
  ['expect', "G.deathCause === 'tv' && G.deathScreen.title === 'It got you' && G.deathScreen.text === 'Ironically it doesn\\'t seem to like horror.' && !(G.L.text.eggs || []).includes('tv')", 'caught after the television (the covers, in the dark): "It got you", and exactly "Ironically it doesn\'t seem to like horror."'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// about to have you, from the closet's side (a step from the bed, in the dark): it cannot catch you while it is at the
// set; afterwards it comes back and does, and that is the television's line too
const tvClose = [
  ['eval', tvLib + ' window.__tv.fresh(1); G.L.s.switched = true; G.L.s.peerTill = 0; G.L.creature.u = 0.999;'], ['wait', 250],
  ['expect', X("tv.free(40, () => G.L.creature.dist < 1.1) === 'play' && G.L.s.mode === 'come' && G.L.creature.dist < 1.1 && G.L.creature.lane.idx === 1"), 'from the closet, in the dark, a step from having you'],
  ['expect', X("tv.on() && tv.run(9.8) === 'play' && tv.alive() && tv.clear() && tv.min('watch', 2.9, 6.9) > 0.95 && G.L.s.tv.smashAt !== undefined"), 'the set on: it goes round the bed to it, watches and smashes it, and catches nobody meanwhile'],
  ['expect', X("tv.run(10.0) === 'play' && G.L.s.mode === 'come' && Math.abs(G.L.creature.u - tv.u0) < 0.01"), 'then it comes on again, the night\'s clock where it was'],
  ['eval', X("tv.run(40, () => G.L.creature.dist < 1.06) && G.toast('Light.')")],
  ['waitUntil', "G.state === 'dead'", 8000],
  ['expect', "G.deathCause === 'tv' && G.deathScreen.title === 'It got you' && G.deathScreen.text === 'Ironically it doesn\\'t seem to like horror.'", 'and when it reaches you after all, the line is the television\'s, with no toast before it'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// still peering round the edge of the doorway, not yet in the room: it comes in through the middle of it and goes
// straight to the set. With motion and flashes reduced: the same times, no shake, and it is thrown back less far
const tvPeer = [
  ['eval', tvLib + ' window.__tv.fresh(0); window.__tv.was = [SAVE.data.settings.reducedMotion, SAVE.data.settings.reducedFlash]; SAVE.data.settings.reducedMotion = SAVE.data.settings.reducedFlash = true;'], ['wait', 250],
  ['expect', X("G.L.s.mode === 'peer' && G.L.creature.peer === 1 && tv.on() && tv.run(2.45) === 'play' && tv.far(tv.at(), tv.W) < 0.06 && tv.clear() && tv.max('peer', 1.2, 2.45) < 0.01"), 'peering round the edge of the doorway when the set comes on: it comes in through the middle of it and goes straight to the set'],
  ['expect', X("tv.run(10.0) === 'play' && (q => q > 7.7 && q < 7.9)(G.L.s.tv.smashAt - G.L.s.tv.t0) && tv.when('tvShriek') > 6.95 && tv.when('tvShriek') < 7.1 && G.L.s.mode === 'come' && tv.shakes === 0 && (l => l > 0.3 && l < 0.6)(tv.max('lurch', 7, 7.7)) && tv.max('off', 7.1, 7.59) < 0.12 && tv.alive()"), 'with motion and flashes reduced: the same times, no shake of the view, and its lurch gentler'],
  // the night won while it watches: it breaks off for the bed, and the set, its film over, goes off of itself
  ['eval', X("(SAVE.data.settings.reducedMotion = tv.was[0], SAVE.data.settings.reducedFlash = tv.was[1], tv.fresh(0), tv.lamp(), G.L.s.peerTill = 0)")], ['wait', 250],
  // (the covers take three seconds to hold and the view has to turn to them first, all before it smashes the set at 7.8 s:
  // so they are taken hold of early, as it goes over, not once it has watched a while)
  ['expect', X("tv.on() && tv.run(1.2) === 'play' && G.L.s.mode === 'tv' && !!G.L.creature.tv"), 'the set on, the lamp on: it is going over to it'],
  ['hold', 'covers', 9000],
  ['expect', "G.L.won && G.state === 'won' && G.L.s.mode === 'duck' && G.L.s.tv.smashAt === undefined", 'the covers up meanwhile: the night is won, and it breaks off'],
  ['waitUntil', "G.L.s.tv.offAt !== undefined && !G.L.creature.tv", 9000],
  ['expect', X("G.L.s.tv.smashAt === undefined && tv.T('tv').hidden"), 'and the set, left to itself, goes off when its film is over'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
const tv = [].concat(tvFar, tvCrawl, tvBed, tvClose, tvPeer);
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
// what it is heard to do: each footstep (its kind, how loud, where, when on the night's clock) and each effect
const hearSteps = " window.__steps = []; window.__fx = []; if (!AUDIO.__h12) { AUDIO.__h12 = true; const f = AUDIO.footstep, x = AUDIO.sfx; AUDIO.footstep = function (k, v, p) { window.__steps.push({ k, v, p, t: G.L.t }); return f.apply(this, arguments); }; AUDIO.sfx = function (n) { window.__fx.push(n); return x.apply(this, arguments); }; }";
// as it sets off round the bed: three running steps, a sixth of a second apart, loud enough to be heard and captioned,
// the first from where it was and the last from where it goes (the view held still), and no sweep of air
const thumps = "(X => { const st = window.__steps.filter(s => s.k === 'runner'), pan = b => Math.max(-0.85, Math.min(0.85, Math.sin(wrapPi(b - X.yaw)))); console.log('thumps: ' + JSON.stringify(st) + ' from ' + pan(X.b0).toFixed(2) + ' to ' + pan(X.b1).toFixed(2));" +
  ' return st.length === 3 && st[0].t - X.t0 < 0.1 && st.every((s, i) => !i || (s.t - st[i - 1].t > 0.1 && s.t - st[i - 1].t < 0.25)) && st.every(s => s.v >= 0.12)' +
  ' && Math.abs(st[0].p - pan(X.b0)) < 0.05 && Math.abs(st[2].p - pan(X.b1)) < 0.05 && (st[1].p - st[0].p) * (st[2].p - st[1].p) >= 0 && Math.abs(st[2].p - st[0].p) > 0.2' +
  " && !window.__fx.includes('whoosh'); })(window.__x)";
const glide = [
  ['eval', 'restartLevel();'], ['wait', 250],
  ['eval', 'G.L.s.switched = true; ' + sampler + ' window.__glide.look = true; G.L.s.peerTill = 0; G.L.creature.u = 0.55;'],
  ['waitUntil', "G.L.creature.dist < 2.6 && G.L.s.mode === 'come'", 25000],
  ['eval', 'window.__glide.stop = true;'],
  ['expect', glideOk('stepping out and coming on', ['body', 'part', 'foot', 'tilt']), 'it glides out round the edge of the opening and on toward the bed: nothing of it jumps from one frame to the next'],
  ['eval', 'restartLevel();'], ['wait', 250],
  ['eval', "G.L.s.switchAt = 0; G.L.s.peerTill = 0; G.L.creature.u = 0.3; G.L.visFrac = () => 0; window.__lane0 = G.L.creature.lane.idx; " + sampler + hearSteps],
  ['waitUntil', "G.L.s.mode === 'cross'", 20000],
  ['eval', 'window.__x = { b0: G.L.s.cross.b0, b1: G.L.s.cross.b0 + G.L.s.cross.db, yaw: G.cam.yaw, t0: G.L.t };'],
  ['waitUntil', 'G.L.t > window.__x.t0 + 1', 5000],
  ['expect', thumps, 'shifting round to the other way in, three quick, heavy thumping footsteps (and no whoosh), panned from where it was to where it goes'],
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
// Lit while it still peers round the edge of the opening, behind the wall, it goes low along the floor to the bed: first
// along behind the wall to the middle of the frame, then straight out through the middle of it, and only then on to the
// bed. Watched every frame, each way in: where it goes through the wall it is in the middle of the opening, clear of the
// frame either side by more than its own half-width; for the first 0.45 m in front of the wall it is still there (clear
// of the frame, and in the closet of its doors swung back either side), and never in among those doors; and it gets to
// its place at the bed
const crawled = lane => "(P => { const ap = G.L.creature.lane.apertures[0], z = ap.z, mid = (ap.x1 + ap.x0) / 2, room = (ap.x1 - ap.x0) / 2 - 0.25; let bad = null;" +
  ' for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i];' +
  "  if ((a.d - z) * (b.d - z) <= 0 && a.d !== b.d) { const lat = a.lat + (b.lat - a.lat) * (z - a.d) / (b.d - a.d); if (Math.abs(lat - mid) > room) bad = bad || 'through the wall at ' + lat.toFixed(2); }" +
  "  if (b.d < z && b.d > z - 0.45 && Math.abs(b.lat - mid) > room) bad = bad || 'beside the frame at ' + b.d.toFixed(2) + ', ' + b.lat.toFixed(2);" +
  '  if (' + lane + " === 1 && b.d > 2.85 && b.d < 3.25 && Math.abs(b.lat) > 0.8 && Math.abs(b.lat) < 1.8) bad = bad || 'in among the closet doors at ' + b.d.toFixed(2) + ', ' + b.lat.toFixed(2); }" +
  ' const e = P[P.length - 1], sp = ' + (lane ? '{ d: 1.04, lat: 1.35 }' : '{ d: 2.08, lat: 0 }') + "; if (Math.hypot(e.d - sp.d, e.lat - sp.lat) > 0.02) bad = bad || 'it ended at ' + e.d.toFixed(2) + ', ' + e.lat.toFixed(2);" +
  " console.log('the crawl from way " + lane + ": ' + P.length + ' frames, ' + (bad || 'clear')); return P.length > 60 && !bad; })(window.__crawl)";
const crawlFrom = lane => [
  ['eval', 'restartLevel(); for (let i = 0; i < 60 && G.L.creature.lane.idx !== ' + lane + '; i++) restartLevel();'], ['wait', 250],
  ['expect', '(c => c.lane.idx === ' + lane + " && G.L.s.mode === 'peer' && c.dist > c.lane.apertures[0].z && Math.abs(c.lat) > (c.lane.apertures[0].x1 - c.lane.apertures[0].x0) / 2)(G.L.creature)", (lane ? 'in the closet' : 'beyond the doorway') + ', it peers round the edge of the opening, behind the wall'],
  ['eval', "const s = G.L.s; s.fitted = s.plugged = true; s.lampOn = true; s.wasLit = true; s.onAt = G.L.t; s.lampT = 60; window.__crawl = []; (function w() { const c = G.L.creature; window.__crawl.push({ d: c.dist, lat: c.lat }); if (G.state === 'play' && !(c.reach > 0)) requestAnimationFrame(w); })();"],
  ['waitUntil', "G.L.s.mode === 'duck' && G.L.creature.reach > 0", 20000],
  ['expect', crawled(lane), 'lit early, it went along behind the wall to the middle of the ' + (lane ? 'closet\'s opening' : 'doorway') + ' and came straight out through it before it turned for the bed: never through the wall, the frame' + (lane ? ' or the doors' : '')],
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
  ['expect', "G.deathScreen.text === G.L.text.death.dark && G.deathScreen.text === 'It pulled the covers away. It is strong in the dark.'", 'and the card says it took the covers: the dark does not stop it'],
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
// The drawer, open, is a box slid right out of the nightstand, and what is in it lies in it: from every view that shows
// the whole of its open top, each thing is on its bottom, under its rim, drawn within the opening (its middle, and well
// above and below it), and pointed at there it is the thing under the pointer; and it is taken with a click.
const inDrawer = fresh.concat([
  ['eval', T('drawer') + '.onClick(); G.hand.reach = null;'],
  ['waitUntil', "(d => d.rim()[2][2] - d.rim()[1][2] > 0.27)(" + T('drawer') + ")", 3000],
  ['expect', "(d => d.rim()[2][2] - d.rim()[1][2] > 0.27 && G.L.items.filter(i => !i.taken).length === 2)(" + T('drawer') + ")", 'the drawer slides right out: more than a quarter of a metre of it open, the bulb and the remote in it'],
  ['eval', `window.__inDrawer = (() => {
    const d = ${T('drawer')}, out = { views: 0, bad: [] }, pt = p => { const r = R.projectRect(p[0], p[1], p[2], 0, 0, null); return r && [r.x, r.y + r.h]; };
    const inside = (q, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    for (const it of G.L.items.filter(i => !i.taken)) if (!it.flat || Math.abs(it.y - d.floorY) > 0.01 || it.y + it.h * 0.5 > d.rim()[0][1]) out.bad.push(it.id + ' is not lying on the bottom of the drawer, under its rim');
    for (const down of [0, 1]) for (const dir of [2, 3]) {
      G.cam.dirIdx = dir; G.cam.yaw = G.cam.tYaw = dir * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; G.mouse.x = -1; render();
      const poly = d.rim().map(pt);
      if (poly.some(q => !q || q[0] < 0 || q[0] > R.W || q[1] < 0 || q[1] > R.H)) continue;   // its open top is not all in this view
      out.views++;
      for (const h of [...R.hits].filter(h => h.kind === 'item')) {
        const mid = [h.x + h.w / 2, h.y + h.h / 2], where = dir + (down ? 'd' : '') + ': the ' + h.ref.id;
        for (const q of [mid, [mid[0], mid[1] - h.h * 0.3], [mid[0], mid[1] + h.h * 0.3]]) if (!inside(q, poly)) { out.bad.push(where + ' is not drawn within the open drawer'); break; }
        G.mouse.x = mid[0]; G.mouse.y = mid[1] + R.viewY; updateHover();
        if (!G.hover || G.hover.ref !== h.ref) out.bad.push(where + ' is not what is pointed at there');
      }
    }
    G.mouse.x = G.mouse.y = -1; if (out.bad.length) console.log('in the drawer: ' + out.bad.join('; '));
    return out;
  })();`],
  ['expect', 'window.__inDrawer.views >= 3 && !window.__inDrawer.bad.length', 'each lies in the open drawer: on its bottom, under its rim, drawn within its opening from every view that shows it all, and pointed at there'],
  ['face', 3, true], ['pickup', 'remote'], ['pickup', 'bulb'],
  ['expect', "G.inv.length === 2 && " + T('drawer') + ".yielded.every(i => i.taken)", 'and each is taken out of it with a click'],
]);
// holding the covers, your hand is on them (watched while the solution holds them)
const coverHand = ['eval', "window.__coverHand = false; (function w() { if (G.holding && G.holding.id === 'covers' && G.hand.reach && G.hand.reach.target === G.holding) window.__coverHand = true; if (G.state === 'play') requestAnimationFrame(w); })();"];
module.exports = {
  // Nightmare charges 3.5x speed for every second spent looking away, so the harness faces each thing directly instead of sweeping
  nightmare: fumbles.concat(inDrawer, tv, card, peering, glide, stoop, crawlFrom(0), crawlFrom(1), dark, grabbed, [mattress, ['face', 5, true], ['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in'], ['face', 2, true], ['use', 'drawer'], ['pickup', 'bulb'], ['face', 2, false], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ducked, ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on'], ...duck, ['face', 4, false], coverHand, ['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], ['expect', 'window.__coverHand', 'holding them, your hand was on the covers'], relight, ['expect', 'G.L.won', 'won'], ['expect', 'G.L.s.grab && G.L.s.grab.k < 1', 'and the covers came up before its hands reached you'], ...under]),
};
