// The Bedroom: bulb from the drawer into the lamp, the switch (on Nightmare the cord first, and three clicks), and
// in the light it ducks down behind the bed until only its eyes are over the edge, then its hands come up onto the
// covers; then hold the covers up, before its hands have pulled their way up the bed to you. The covers come up over
// your eyes and it plays out under them: it comes to the bed and pulls at them three times, and they hold.
// Before that: the night's card shows it where it starts, peering round the edge of the opening, and it does not move
// when the night begins; at first it only peers (and having its head in view is seeing it), then steps out; the covers
// pulled up with the lamp off are a death of their own: it takes them and pulls them away; and its hands reaching you
// are another.
// First, the mattress's top is one piece drawn before the covers, so no part of it is drawn over them as they come up.
// And the night's easter egg, the tooth fairy (fairy, below): the pillow, behind you; the tooth under it; the thing
// waiting, its hand out, a deep rumbling under everything, for as long as you like; the tooth handed over and kept on its
// open palm, its eyes shut over its cupped hands, its wings bursting open, its dust, the dollar, and the night won by it.
const relight = ['waitUntil', "G.L.won ? true : (!G.L.s.lampOn && G.L.s.fitted && G.L.s.plugged ? (useTarget(G.L.targets.find(t => t.id === 'lamp')), false) : false)", 20000];
const lamp = [['use', 'drawer'], ['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on']];
const mattress = ['expect', "(() => { const m = R.statics.filter(p => p.kind === 'poly' && p.pts.length >= 3 && p.pts.every(v => Math.abs(v[1] - 0.58) < 1e-6 && Math.abs(v[0]) <= 0.751) && p.pts.some(v => v[2] > 1)); return m.length === 1 && m[0].sd > 1.62; })()", 'the mattress top is one piece, drawn before the covers'];
const under = [['waitUntil', 'G.L.s.over >= 1 && G.L.s.tugs === 3', 9000], ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'under the covers: it came to the bed and pulled at them three times, and they held'],
  // the card after: each of its two sentences on a line of its own (the text breaks where it says \n)
  ['waitUntil', "G.state === 'survived'", 12000],
  ['expect', "(p => !!p && p.innerText.split('\\n').map(l => l.trim()).join('|') === 'You pulled the covers over your head.|It pulled at them, but you were stronger.')(UI.overlay.querySelector('.intro'))", 'the survived card puts each sentence on a line of its own']];
// What will not go, shown (js/hands.js): with no bulb in, your hand pulls the lamp's chain and nothing comes of it;
// holding the covers, your hand is on their hem. And the drawer holds the bulb and nothing else: there is no wrong bulb
// any more
const fresh = [['eval', 'restartLevel(); G.L.creature.hold = G.L.creature.dist;'], ['wait', 250]];
const T = id => "G.L.targets.find(t => t.id === '" + id + "')";
const fumbles = [].concat(
  fresh, [['eval', T('drawer') + '.onClick();'],
    ['expect', "(its => its.map(i => i.id).join() === 'bulb' && !its[0].decoy && !ICONS.bulbPin && !ICONS.remote && " + T('lamp') + ".accepts.join() === 'bulb')(G.L.items.filter(i => !i.taken))", 'the drawer holds the bulb and nothing else: no wrong bulb (nor a remote control)']],
  fresh, [['eval', 'G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300], ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.hand.reach && G.hand.reach.style === 'pull' && G.hand.reach.target === " + T('lamp'), 'no bulb in it, nothing in hand: your hand goes to the lamp\'s chain'],
    ['expect', "G.lastToast.msg === 'It\\'s missing something.'", 'and the line is "It\'s missing something."'],
    ['waitUntil', 'G.L.s.tugAt > 0', 2000], ['expect', 'G.L.s.tugAt > 0 && !G.L.s.lampOn', 'and pulls it, and nothing comes of it']],
  [['eval', 'restartLevel();'], ['wait', 250]]);
// Everything the night needs is in front of you or beside you: each of its targets (the drawer, the lamp, the covers, the
// cord on the floor) is pointed at, in the middle of what shows of it, from one of the five ways you can look without
// looking back (west round by north to east, ahead or down), and it is the thing under the pointer there
const inFront = fresh.concat([
  ['expect', `(() => {
    const out = {};
    for (const down of [0, 1]) for (const d of [6, 7, 0, 1, 2]) {
      G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; render();
      for (const h of [...R.hits]) {
        if (h.kind !== 'target') continue;
        const x0 = Math.max(0, h.x), y0 = Math.max(0, h.y), x1 = Math.min(R.W, h.x + h.w), y1 = Math.min(R.H, h.y + h.h);
        if ((x1 - x0) * (y1 - y0) < 0.9 * h.w * h.h) continue;   // (all of it in view, near enough)
        G.mouse.x = (x0 + x1) / 2; G.mouse.y = (y0 + y1) / 2; updateHover();
        if (G.hover && G.hover.ref === h.ref) out[h.ref.id] = (out[h.ref.id] || '') + ' ' + d + (down ? 'd' : '');
      }
    }
    G.mouse.x = G.mouse.y = -1; G.cam.dirIdx = 0; G.cam.yaw = G.cam.tYaw = 0; G.cam.pitch = G.cam.tPitch = 0; render(); updateHover();
    console.log('targets in front: ' + JSON.stringify(out));
    return ['drawer', 'lamp', 'covers', 'socket'].every(id => !!out[id]) && !/ [701]d?( |$)/.test(out.pillow || '') && !out.hand;
  })()`, 'the drawer, the lamp, the covers and the cord are each whole in view and pointed at without looking back (and the pillow is not, from ahead or either diagonal)'],
]);
// ---- the tooth fairy (the night's easter egg) ----
// The night is stepped by hand (update(1 / 60)) where it must be watched: every frame noted (whether you are still alive,
// where the thing is, how it is posed), and every heartbeat, breath, footstep, effect and shake of the view counted.
const fairyLib = '(' + function () {
  const F = window.__fy = {
    T: id => G.L.targets.find(t => t.id === id), log: [],
    // a fresh night, the thing coming by the way asked for (0: the doorway, 1: the closet)
    fresh(lane) { restartLevel(); for (let i = 0; i < 80 && G.L.creature.lane.idx !== lane; i++) restartLevel(); F.hear(); F.reset(); return G.L.creature.lane.idx === lane; },
    reset() { F.beats = F.voices = F.steps = F.shakes = 0; F.fx = []; },
    hear() {
      if (AUDIO.__fy) return;
      AUDIO.__fy = true;
      const hb = AUDIO.heartbeat, vo = AUDIO.voice, fs = AUDIO.footstep, x = AUDIO.sfx, sl = AUDIO.stopLoop, sa = AUDIO.startAmbient, sh = G.shake;
      // (whichever copy of this is the page's now)
      AUDIO.heartbeat = function () { window.__fy.beats++; return hb.apply(this, arguments); };
      AUDIO.voice = function () { window.__fy.voices++; return vo.apply(this, arguments); };
      AUDIO.footstep = function () { window.__fy.steps++; return fs.apply(this, arguments); };
      AUDIO.sfx = function (n) { window.__fy.fx.push(n); return x.apply(this, arguments); };
      AUDIO.stopLoop = function (sec) { if (window.__fy.fx) window.__fy.fx.push('stopLoop:' + sec); return sl.apply(this, arguments); };   // (the rumbling let go, and how slowly)
      AUDIO.startAmbient = function () { if (window.__fy.fx) window.__fy.fx.push('startAmbient'); return sa.apply(this, arguments); };
      G.shake = function () { window.__fy.shakes++; return sh.apply(this, arguments); };
    },
    look(d, down) { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; G.mouse.x = G.mouse.y = -1; render(); },
    lamp(secs) { const s = G.L.s; s.fitted = s.plugged = true; s.lampOn = true; s.wasLit = true; s.onAt = G.L.t; s.lampT = secs || 90; },
    // how much of a thing's hit area is in the view as it is now (square pixels)
    seen(id) { const h = [...R.hits].reverse().find(q => q.ref && q.ref.id === id); if (!h) return 0; return Math.max(0, Math.min(R.W, h.x + h.w) - Math.max(0, h.x)) * Math.max(0, Math.min(R.H + R.viewY, h.y + h.h) - Math.max(R.viewY, h.y)); },
    // the most of it that shows from any of the ways you can look without looking back (dirs: which of them)
    front(id, dirs) { let most = 0; for (const down of [0, 1]) for (const d of dirs || [6, 7, 0, 1, 2]) { F.look(d, down); most = Math.max(most, F.seen(id)); } return most; },
    // the pillow lifted and the tooth taken, straight (the view as it is)
    tooth() { const p = F.T('pillow'); if (!p.hidden) p.onClick(); const t = G.L.items.find(i => i.id === 'tooth'); if (!t.taken) pickup(t); G.hand.reach = null; return G.inv.some(i => i.id === 'tooth'); },
    note() {
      const c = G.L.creature, p = c.pos(), T = c.fairy || {}, X = G.L.s.fairy;
      F.log.push({ st: G.state, p: [p.x, p.z], d: c.dist, q: X && X.given !== null ? G.L.t - X.given : null, lean: T.lean || 0, offer: T.offer || 0, held: T.held || 0, tooth: !!T.tooth, beat: T.beat === undefined ? 1 : T.beat, wings: T.wings || 0, gone: T.gone || 0,
        look: T.look || 0, cup: T.cup || 0, fling: T.fling || 0, pop: T.pop === undefined ? 1 : T.pop, eyes: T.eyes === undefined ? 1 : T.eyes, shimmer: T.shimmer || 0, flash: T.flash || 0 });
    },
    // seconds since the tooth was given, and the night stepped on to so many seconds after it (to the last frame before)
    q() { return G.L.t - G.L.s.fairy.given; },
    to(q) { return F.step(60, () => F.q() + 1 / 60 > q - 1e-6); },
    // At the height of its dust: what of it shows through the cloud. The view drawn as it is and again with it gone (no
    // more than that differs: the grain is the same, four frames on and laid at the same place): how many pixels differ, and
    // by how much at most; and
    // the same with the cloud taken away, to be sure there is something there for it to hide (shown: how many differ then)
    covered() {
      const T = G.L.creature.fairy, X = G.L.s.fairy, g = T.gone, d0 = X.dust, cv = UI.canvas, ctx = cv.getContext('2d'), shot = () => ctx.getImageData(0, 0, cv.width, cv.height).data;
      const pair = () => { const rnd = Math.random; Math.random = () => 0.5; try { T.gone = 0; render(); const a = shot(); render(); render(); render(); T.gone = 1; render(); const b = shot(); return [a, b]; } finally { T.gone = g; Math.random = rnd; } };
      const diff = ([a, b]) => { let n = 0, most = 0, at = null; for (let i = 0; i < a.length; i += 4) { const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])); if (d > 3) n++; if (d > most) { most = d; at = [(i / 4) % cv.width, Math.floor(i / 4 / cv.width)]; } } return { n, most, at }; };
      const w = diff(pair());
      X.dust = null; const wo = diff(pair()); X.dust = d0;
      F.cover = { n: w.n, most: w.most, at: w.at, shown: wo.n };
      console.log('through its dust: ' + JSON.stringify(F.cover));
      return F.cover;
    },
    // the night stepped on by hand, every frame noted, for so many seconds or until a thing is so
    step(secs, until) { F.log = []; for (let i = 0, n = Math.round(secs * 60); i < n && G.state === 'play' && !(until && until()); i++) { update(1 / 60); F.note(); } return G.state; },
    // the same, with the view kept on it (so it is watched all the way)
    watch(secs, until) {
      F.log = [];
      for (let i = 0, n = Math.round(secs * 60); i < n && G.state === 'play' && !(until && until()); i++) {
        if (i % 3 === 0) { const p = G.L.creature.pos(); G.cam.yaw = G.cam.tYaw = Math.atan2(p.x, p.z); G.cam.pitch = G.cam.tPitch = 0; render(); }
        update(1 / 60); F.note();
      }
      return G.state;
    },
    alive() { return G.state === 'play' && F.log.every(f => f.st === 'play'); },
    // it never went over the bed, nor through a wall but by the middle of its opening
    clear() {
      let bad = null;
      F.log.forEach((f, i) => {
        const [x, z] = f.p, q = i ? F.log[i - 1].p : f.p;
        if (Math.abs(x) < 0.7 && z < 1.85) bad = bad || 'over the bed at ' + x.toFixed(2) + ', ' + z.toFixed(2);
        if ((q[1] - 3.6) * (z - 3.6) < 0 && Math.abs(x) > 0.25) bad = bad || 'through the wall by the doorway at x ' + x.toFixed(2);
        if ((q[0] + 3.2) * (x + 3.2) < 0 && Math.abs(z) > 0.25) bad = bad || 'through the wall by the closet at z ' + z.toFixed(2);
        if (Math.hypot(x - q[0], z - q[1]) > 0.02) bad = bad || 'a jump of ' + Math.hypot(x - q[0], z - q[1]).toFixed(2) + ' m at ' + x.toFixed(2) + ', ' + z.toFixed(2);
      });
      if (bad) console.log('its way to the foot of the bed: ' + bad);
      return !bad;
    },
  };
}.toString() + ')();';
const FY = e => '(fy => ' + e + ')(window.__fy)';
const atFoot = "(c => c.lane.idx === 0 && Math.abs(c.dist - 2.1) < 0.05 && Math.abs(c.lat) < 0.05 && c.hold !== null)(G.L.creature)";
// the pillow is behind you (a full-sized one now, against the headboard: from straight ahead and from either diagonal
// none of it shows; looking hard round to either side and down, its near corner may); lifted, a tooth; the tooth taken,
// the thing is at the foot of the bed, bowed in, its hand out, and it waits, a deep rumbling come up in place of the
// night's sound within a second, and no heartbeat; the tooth put down goes back; handed over, the rumbling is cut dead and
// its head snaps down to the tooth on its palm; it steps back, cups it in its hands and shuts its eyes; its wings burst
// open, its eyes open shimmering; one beat of them and its dust hides it whole; it is the night's end, and a win, with
// its own card
const fairyPlay = [
  ['eval', fairyLib + ' window.__fy.fresh(0); G.L.creature.hold = G.L.creature.dist;'], ['wait', 250],
  ['expect', FY("fy.front('pillow', [7, 0, 1]) < 16 && !G.L.items.some(i => i.id === 'tooth') && !G.L.s.fairy && (t => t.pil.x1 - t.pil.x0 > 0.5 && t.pil.z1 - t.pil.z0 >= 0.3 && t.pil.y1 - t.pil.y0 >= 0.12 && t.pil.z0 >= t.head && t.pil.z1 < -0.15)(fy.T('pillow'))"), 'the pillow, a full-sized one behind you against the headboard, is not to be seen or pointed at from straight ahead or either diagonal, level or down'],
  ['eval', FY('fy.look(4, true)')], ['wait', 250],
  ['expect', FY("fy.seen('pillow') > 6000 && fy.T('hand').hidden"), 'looking right round and down, it is there'],
  ['click', 'pillow'], ['wait', 600],
  ['expect', "(t => G.L.s.pillowAt !== null && " + T('pillow') + ".hidden && !!t && !t.taken && G.lastToast.msg === 'A tooth.' && !G.L.s.fairy && G.L.s.mode === 'peer')(G.L.items.find(i => i.id === 'tooth'))", 'clicked, it is tipped up, and there is a tooth under it; the night goes on as it was'],
  ['eval', 'G.L.creature.hold = null;'],
  ['pickup', 'tooth'], ['eval', 'window.__swell = [AUDIO.loopNow()];'], ['wait', 200],
  ['expect', "G.L.s.mode === 'fairy' && G.L.s.fairy.stage === 'wait' && " + atFoot + " && G.L.creature.fairy.lean === 1 && G.L.creature.fairy.offer === 1 && !G.L.creature.peer", 'the tooth taken (your back to it): it is at the foot of the bed, bowed in over it, its hand held out'],
  ['expect', FY("!fy.T('hand').hidden && (fy.look(0, false), fy.seen('hand') > 6000) && (fy.look(4, true), fy.seen('hand') === 0)"), 'and its open hand is there to point at, in front of you'],
  ['expect', FY("fy.fx.filter(n => n === 'fairyRumble').length === 1 && !fy.fx.some(n => /^stopLoop/.test(n)) && G.L.s.fairy.stage === 'wait'"), 'and a deep, low rumbling has come up in place of the night\'s sound'],
  // (it is up in a second: a second and a bit on the loop has swelled all the way up; it was near nothing as it began)
  ['wait', 1100], ['eval', 'window.__swell.push(AUDIO.loopNow()); console.log("the rumble swelling: " + JSON.stringify(window.__swell));'],
  ['expect', "(w => !!w[0] && !!w[1] && w[0].kind === 'rumble' && w[1].kind === 'rumble' && w[1].state === 'running' && w[0].swell < 0.1 && w[1].swell > 0.99)(window.__swell)", 'the rumbling swells up in about a second (near nothing as it starts, all the way up a second and a bit on)'],
  ['eval', FY('(fy.reset(), fy.look(0, false))')],
  ['expect', FY("fy.step(30) === 'play' && fy.alive() && fy.log.length === 1800 && fy.beats === 0 && fy.voices === 0 && fy.steps === 0 && G.danger === 0 && G.L.s.fairy.stage === 'wait' && " + atFoot + " && G.inv.some(i => i.id === 'tooth') && !G.L.won && !fy.fx.some(n => /^stopLoop|startAmbient|fairyRumble/.test(n))"), 'it waits: thirty seconds on there has been no heartbeat, not a breath or a step from it, the rumbling holds (nothing has stopped it or started it again), and nothing has happened to you'],
  ['eval', FY("(G.holding = fy.T('covers'), fy.step(0.5))")],
  ['expect', FY("G.holding === null && !(fy.T('covers').progress > 0.1) && !G.L.s.coversUp && /Not now/.test(G.lastToast.msg) && fy.alive()"), 'the covers will not come up while it waits (in the dark too: it does not take them)'],
  ['eval', FY("(fy.look(0, true), G.active = G.inv.findIndex(i => i.id === 'tooth'), dropActive(), fy.step(0.3))")],
  ['expect', "(t => !t.taken && !G.inv.includes(t) && Math.abs(t.x - 0.02) < 0.01 && t.z < -0.2 && t.z > -0.3 && G.L.s.fairy.stage === 'wait' && " + T('hand') + ".hidden === false)(G.L.items.find(i => i.id === 'tooth'))", 'the tooth put down goes back under the pillow, and it waits on'],
  ['eval', FY('fy.look(4, true)')], ['wait', 250], ['pickup', 'tooth'],
  // (each frame as the night runs on its own, from the moment the tooth is in its hand: how far its head is down)
  ['eval', FY('(delete SAVE.data.eggs.bedroom, fy.reset(), fy.look(0, false), window.__snap = [], (function w() { const X = G.L.s.fairy; if (X && X.given !== null) window.__snap.push({ q: G.L.t - X.given, look: G.L.creature.fairy.look }); if (window.__snap.length < 40) requestAnimationFrame(w); })())')], ['wait', 250],
  ['use', 'hand'],
  ['expect', "SAVE.data.eggs.bedroom === true && G.L.text.egg === 'Give the tooth fairy a tooth.' && secretUp() && document.querySelector('#secret .st').textContent === 'Tooth fairy' && (window.__said = performance.now()) && !G.inv.length && G.L.s.fairy.stage === 'take' && G.L.creature.fairy.tooth && G.state === 'play' && !G.L.won", 'the tooth put in its hand: the easter egg is found and saved, and named there and then, "Tooth fairy"; the night is not over yet'],
  // the rumbling cut dead the moment the tooth is in its hand (no fade: the loop is gone at once), and a click as its head
  // snaps down to it. Then each stage in its time (FAIRY: night12.js), stepped through frame by frame
  ['eval', 'window.FAIRY = { look: 1.2, pull: [1.2, 2.8], cup: [2.9, 3.35], shut: [3.05, 3.25], burst: 4.85, flap: 5.7, sweep: 0.3, dust: 5.85, dense: 0.2, gone: [6.1, 6.22] };'],
  ['expect', FY("fy.fx.join() === 'stopLoop:0,neckClick' && AUDIO.loopNow() === null"), 'the rumbling stops dead the instant the tooth is in its hand (cut, not faded), and a joint clicks'],
  ['waitUntil', 'window.__snap.length >= 40', 3000],
  ['expect', "(w => w.length >= 40 && w[0].q < 0.06 && w.every(f => f.q < 0.034 || f.look > 0.95) && w.some(f => f.look > 1.03) && G.L.creature.fairy.tooth)(window.__snap)", 'at that same instant its head snaps down to the tooth on its palm (there within two frames, a little past and back)'],
  ['expect', FY("fy.to(FAIRY.look) === 'play' && fy.log.every(f => f.look > 0.97 && f.look < 1.03 && f.tooth && f.offer === 1 && f.lean === 1 && f.eyes === 1 && f.wings === 0 && Math.abs(f.d - 2.1) < 0.02) && fy.fx.length === 2"), 'it looks at it a while, still, in silence, the tooth on its open palm held out over the bed'],
  ['expect', FY("fy.to(FAIRY.pull[1] + 0.03) === 'play' && fy.log.every(f => f.tooth && f.offer === 1 && f.look > 0.97 && f.wings === 0 && f.eyes === 1) && fy.log[fy.log.length - 1].lean === 0 && fy.log[fy.log.length - 1].held === 1 && G.L.creature.dist > 2.5"), 'it pulls back from over the bed and stands up behind the foot of it, the tooth still on its palm, its head bowed to it'],
  ['expect', FY('fy.clear()'), 'and it goes back on its feet, never over the bed, nothing sudden'],
  ['expect', FY("fy.to(FAIRY.cup[1] + 0.03) === 'play' && (l => l.cup === 1 && !l.tooth && l.offer === 0 && l.eyes === 0)(fy.log[fy.log.length - 1]) && fy.log.some(f => f.tooth && f.cup > 0.3) && fy.log.every(f => f.wings === 0)"), 'it closes its two hands round the tooth (the tooth gone into them) and shuts its eyes, their light gone'],
  ['expect', FY("fy.to(FAIRY.burst - 0.01) === 'play' && fy.log.every(f => f.eyes === 0 && f.cup === 1 && f.wings === 0 && f.flash === 0) && fy.log.length >= 60 && fy.fx.length === 2"), 'and it stands there with its eyes shut, a long moment in the dark and the quiet (well over a second, not a sound)'],
  ['expect', FY("fy.to(FAIRY.burst + 0.3) === 'play' && fy.fx.filter(n => n === 'wingBurst').length === 1 && fy.fx.length === 3 && fy.shakes === 1 && (i => i >= 0 && fy.log[i].wings > 0.3 && fy.log[i].flash > 0.8 && fy.log[i].fling > 0.2 && fy.log.findIndex(f => f.wings >= 1) - i <= 6)(fy.log.findIndex(f => f.q >= FAIRY.burst)) && Math.max(...fy.log.map(f => f.pop)) > 1.05 && Math.max(...fy.log.map(f => f.fling)) > 1.05 && (l => l.eyes > 0.99 && l.shimmer === 1 && l.look < 0.05 && l.cup < 0.01)(fy.log[fy.log.length - 1])"), 'then all at once its arms are thrown wide and its wings burst open (in the frame it starts, full open within a tenth of a second, a little past and back), a bright rush of air, a flash, the view jolted; its head comes up and its eyes open, shimmering'],
  ['expect', FY("fy.to(FAIRY.flap) === 'play' && fy.log.every(f => f.wings === 1 && f.eyes > 0.99 && f.shimmer === 1 && f.beat > 0.9 && f.beat < 1.1) && Math.max(...fy.log.map(f => f.beat)) - Math.min(...fy.log.map(f => f.beat)) > 0.03 && fy.log.length >= 30 && fy.fx.length === 3"), 'it holds, its wings spread and trembling, for most of a second'],
  ['expect', FY("fy.to(FAIRY.dust + FAIRY.dense + 0.03) === 'play' && fy.fx.slice(3).join() === 'wingWhoosh,fairyDust' && Math.min(...fy.log.map(f => f.beat)) < 0.3 && !!G.L.s.fairy.dust && fy.log.every(f => f.gone === 0)"), 'one great beat of its wings (a whoosh), and as they sweep its dust bursts up round it'],
  ['eval', FY('(fy.look(0, false), fy.covered())')],
  ['expect', FY("fy.cover.shown > 20000 && fy.cover.n === 0 && fy.cover.most <= 3"), 'at the height of its dust nothing of it shows through the cloud (drawn with it and without it, the view is the same to the pixel; without the cloud it would show plainly)'],
  ['expect', FY("fy.to(FAIRY.gone[1] + 0.3) === 'play' && G.L.creature.fairy.gone === 1 && fy.beats === 0"), 'and it is gone behind it'],
  ['waitUntil', "G.L.won && G.state === 'won'", 9000],
  ['expect', "G.L.s.fairy.done && !G.L.s.coversUp && G.L.t - G.L.s.fairy.given > 11.8 && G.L.t - G.L.s.fairy.given < 12.6", 'the cloud thins away, the dollar comes down onto the bed, and a moment after it has settled the night is won'],
  ['waitUntil', "G.state === 'survived'", 12000],
  ['expect', "(p => G.survivedScreen.text === G.L.text.fairy && !!p && p.innerText.trim() === 'And you got a dollar!' && UI.overlay.querySelector('h1').textContent === 'You survived')(UI.overlay.querySelector('.intro'))", 'and the card after it is the tooth fairy\'s: "You survived", and under it "And you got a dollar!"'],
  ['expect', "(d => d < 4200 ? secretUp() : d > 4500 ? !secretUp() : true)(performance.now() - window.__said)", 'and the note is not said again there: still up only while its time (4 s from when it was found) is not done'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// taken while it is at the bed with its hands on the covers, pulling (the lamp on): its hands are off them at once, and it
// is bowed in with its hand out; thirty seconds on, nothing has come of it
const fairyGrab = [
  ['eval', fairyLib + ' window.__fy.fresh(0); G.L.s.peerTill = 0; window.__fy.lamp();'], ['wait', 250],
  ['expect', FY("fy.step(30, () => G.L.s.grab && G.L.s.grab.k > 0.25) === 'play' && G.L.s.mode === 'duck' && G.L.creature.reach === 1 && G.L.s.grab.k > 0.25"), 'at the foot of the bed in the lamp\'s light, its hands on the covers, pulling'],
  ['expect', FY("(fy.look(4, true), fy.tooth()) && fy.step(0.1) === 'play' && (c => G.L.s.mode === 'fairy' && G.L.s.fairy.stage === 'wait' && G.L.s.grab === null && c.reach === 0 && c.duck === 0 && c.fairy.lean === 1)(G.L.creature) && " + atFoot), 'the tooth taken while it pulls: its hands are off the covers, and it is bowed in, its hand out'],
  ['expect', FY("(fy.reset(), fy.step(30)) === 'play' && fy.alive() && fy.beats === 0 && G.L.s.lampOn && G.L.s.grab === null && !G.L.won"), 'thirty seconds on nothing has come of it: its hands stay off the covers, and the lamp burns on'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// taken while you can see it (peering out of the closet, the view kept on it): it does not jump to the bed but comes
// there on its feet, out through the middle of the closet's opening and round the foot of the bed, and then bows in
const fairySeen = [
  ['eval', fairyLib + ' window.__fy.fresh(1); window.__fy.look(6, false);'], ['wait', 250],
  ['expect', FY("G.L.s.mode === 'peer' && G.L.creature.visFrac > 0.3 && fy.tooth() && fy.watch(0.3) === 'play' && G.L.s.fairy.stage === 'come'"), 'watched as the tooth is taken (it is peering out of the closet), it is not suddenly at the bed'],
  ['expect', FY("(fy.reset(), fy.watch(70, () => G.L.s.fairy.stage === 'wait')) === 'play' && G.L.s.fairy.stage === 'wait' && fy.clear() && fy.alive() && fy.beats === 0 && " + atFoot), 'it comes there on its feet: out through the middle of the closet\'s opening and round the foot of the bed, never over the bed, nothing sudden'],
  ['expect', FY("fy.watch(3) === 'play' && G.L.creature.fairy.lean === 1 && G.L.creature.fairy.offer === 1 && !fy.T('hand').hidden"), 'and there it bows in over the bed and holds out its hand'],
  ['eval', 'restartLevel();'], ['wait', 250],
];
// with motion and flashes reduced: its wings do not fan (it only fades away), nothing on them or in the dust twinkles, and
// the view does not shake
const fairyStill = [
  ['eval', fairyLib + ' window.__fy.fresh(0); window.__fy.set = [SAVE.data.settings.reducedMotion, SAVE.data.settings.reducedFlash]; SAVE.data.settings.reducedMotion = SAVE.data.settings.reducedFlash = true;'], ['wait', 250],
  ['expect', FY("(fy.look(4, true), fy.tooth()) && fy.step(0.2) === 'play' && (fy.look(0, false), fy.reset(), useTarget(fy.T('hand')), G.L.s.fairy.stage === 'take') && fy.step(7.4) === 'play' && Math.min(...fy.log.map(f => f.beat)) === 1 && Math.max(...fy.log.map(f => f.beat)) === 1 && fy.shakes === 0 && fy.log.every(f => f.flash === 0 && f.look <= 1 && f.fling <= 1 && f.pop === 1 && f.wings <= 1 && f.eyes <= 1) && fy.fx.includes('wingBurst') && G.L.creature.fairy.gone === 1 && G.L.creature.fairy.still === true && G.L.creature.fairy.steady === true && fy.fx.includes('fairyDust')"), 'with motion and flashes reduced nothing snaps (its head, its arms, its eyes and its wings come quickly, never past), its wings do not beat (it only fades into its dust), nothing flashes or twinkles, and the view does not shake'],
  ['eval', FY('(SAVE.data.settings.reducedMotion = fy.set[0], SAVE.data.settings.reducedFlash = fy.set[1], restartLevel())')], ['wait', 250],
];
const fairy = [].concat(fairyPlay, fairyGrab, fairySeen, fairyStill);
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
// of the frame, and in the closet of its door swung back beside it), and never into that door; and it gets to
// its place at the bed
const crawled = lane => "(P => { const ap = G.L.creature.lane.apertures[0], z = ap.z, mid = (ap.x1 + ap.x0) / 2, room = (ap.x1 - ap.x0) / 2 - 0.25; let bad = null;" +
  ' for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i];' +
  "  if ((a.d - z) * (b.d - z) <= 0 && a.d !== b.d) { const lat = a.lat + (b.lat - a.lat) * (z - a.d) / (b.d - a.d); if (Math.abs(lat - mid) > room) bad = bad || 'through the wall at ' + lat.toFixed(2); }" +
  "  if (b.d < z && b.d > z - 0.45 && Math.abs(b.lat - mid) > room) bad = bad || 'beside the frame at ' + b.d.toFixed(2) + ', ' + b.lat.toFixed(2);" +
  '  if (' + lane + " === 1 && b.d > 2.8 && b.d < 3.25 && b.lat > 0.5 && b.lat < 1.5) bad = bad || 'into the closet door at ' + b.d.toFixed(2) + ', ' + b.lat.toFixed(2); }" +
  ' const e = P[P.length - 1], sp = ' + (lane ? '{ d: 1.04, lat: 1.35 }' : '{ d: 2.08, lat: 0 }') + "; if (Math.hypot(e.d - sp.d, e.lat - sp.lat) > 0.02) bad = bad || 'it ended at ' + e.d.toFixed(2) + ', ' + e.lat.toFixed(2);" +
  " console.log('the crawl from way " + lane + ": ' + P.length + ' frames, ' + (bad || 'clear')); return P.length > 60 && !bad; })(window.__crawl)";
const crawlFrom = lane => [
  ['eval', 'restartLevel(); for (let i = 0; i < 60 && G.L.creature.lane.idx !== ' + lane + '; i++) restartLevel();'], ['wait', 250],
  ['expect', '(c => c.lane.idx === ' + lane + " && G.L.s.mode === 'peer' && c.dist > c.lane.apertures[0].z && Math.abs(c.lat) > (c.lane.apertures[0].x1 - c.lane.apertures[0].x0) / 2)(G.L.creature)", (lane ? 'in the closet' : 'beyond the doorway') + ', it peers round the edge of the opening, behind the wall'],
  ['eval', "const s = G.L.s; s.fitted = s.plugged = true; s.lampOn = true; s.wasLit = true; s.onAt = G.L.t; s.lampT = 60; window.__crawl = []; (function w() { const c = G.L.creature; window.__crawl.push({ d: c.dist, lat: c.lat }); if (G.state === 'play' && !(c.reach > 0)) requestAnimationFrame(w); })();"],
  ['waitUntil', "G.L.s.mode === 'duck' && G.L.creature.reach > 0", 20000],
  ['expect', crawled(lane), 'lit early, it went along behind the wall to the middle of the ' + (lane ? 'closet\'s opening' : 'doorway') + ' and came straight out through it before it turned for the bed: never through the wall, the frame' + (lane ? ' or the door' : '')],
];
// its hands on the covers pull, again and again, each pull further up the bed, and when they reach you it comes up the
// bed after them (its own death and its own line); the fingers open as each hand reaches, and close on the cloth to pull it.
// Each hand, once it is on the covers, is watched every time it is drawn (where the night puts its picture: handY, the
// most its height changed in a frame, at 60 a second): crossing the edge of the covers, and as a pull jerks them, it
// rides over them and does not jump
const handY = "window.__hy = { worst: 0, n: 0, last: [], t: -1, i: 0 }; if (!SC.__h12) { SC.__h12 = true; const mk = SC.mkSprite; SC.mkSprite = function (L, x, y, z, w, h) { if (w === 0.24 && h === 0.24 && G.L.creature.reach >= 1) { const W = window.__hy; if (W.t !== G.L.t) { W.t = G.L.t; W.i = 0; } const i = W.i++, a = W.last[i]; if (a && G.L.t > a.t && G.L.t - a.t < 0.05) { W.worst = Math.max(W.worst, Math.abs(y - a.y) * (1 / 60) / (G.L.t - a.t)); W.n++; } W.last[i] = { t: G.L.t, y }; } return mk.apply(this, arguments); }; } ";
const grabbed = [].concat(fresh, [
  ['eval', handY + "const s = G.L.s; s.fitted = s.plugged = true; s.lampOn = true; s.wasLit = true; s.onAt = G.L.t; s.lampT = 60; window.__grab = { open: false, fist: false, jerk: false, back: false, k: [0, 0], ks: [] }; (function w() { const g = G.L.s.grab; if (g) { const W = window.__grab; g.hands.forEach((h, i) => { if (h.open > 0.95) W.open = true; if (h.open < 0.05 && h.drag > 0.95 && h.bunch > 0.9) W.fist = true; if (h.k < W.k[i] - 1e-9) W.back = true; W.k[i] = h.k; }); if (G.L.s.jerk > 0.9) W.jerk = true; W.ks.push(g.k); } if (G.state === 'play') requestAnimationFrame(w); })();"],
  ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 25000],
  ['expect', "G.deathCause === 'grabbed' && G.L.s.lampOn && !G.L.s.coversUp && G.L.s.grab.k === 1", 'the covers left down: its hands pulled their way up the bed to you, and it had you'],
  ['expect', 'window.__grab.open && window.__grab.fist && window.__grab.jerk && !window.__grab.back && window.__grab.k[0] === 1 && window.__grab.k[1] === 1', 'each hand reached on up the bed with its fingers spread, closed them on the cloth and pulled it, the covers jerking, and never went back'],
  ['expect', "(W => (console.log('its hands on the covers: ' + JSON.stringify({ worst: +W.worst.toFixed(4), frames: W.n })), W.n > 300 && W.worst < 0.03))(window.__hy)", 'all the way up the bed its hands rode over the covers and their edge: neither ever jumped up or down from one frame to the next'],
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
// The nightstand stands clear of the bed, and its drawer, open, is a box slid right out of its front toward the foot of
// the bed, beside the bed and never over it, and what is in it lies in it: from every view that shows the whole of its
// open top, each thing is on its bottom, under its rim, drawn within the opening (its middle, and well above and below
// it), and pointed at there it is the thing under the pointer; and it is taken with a click. Shut and open, from every
// way you can look without looking back, level or down, no corner of the drawer (nor of the nightstand's top) is drawn
// over the top of the bed: it is all beyond the bed's edge, in the room and in the picture. And the open drawer and the
// bulb in it are whole in view, and the bulb is pointed at, from a way within a right angle of straight ahead.
const clearOfBed = `(() => {
  // (from your eye, the line of sight through each corner of the drawer and of the top of the nightstand crosses the
  // line of the bed's side over the top of the mattress and the covers lying on it: so from whichever way you look, the
  // one is never drawn over the other, nor the bed over it)
  const d = ${T('drawer')}, b = d.box(), bad = [], E = G.L.eyeH;
  if (b[0] < 0.85) bad.push('the drawer reaches x ' + b[0].toFixed(2) + ', over the bed (its side at 0.75, the headboard to 0.8)');
  for (const x of [b[0], b[1]]) for (const z of [b[2], b[3]]) for (const y of [0.46, 0.64]) {
    const k = 0.75 / x, ys = E + (y - E) * k, zs = z * k;
    if (zs >= -0.5 && zs <= 1.9 && ys < 0.6) bad.push('a corner of it at ' + [x, y, z].map(v => v.toFixed(2)).join(', ') + ' is seen against the bed (crossing its side at ' + ys.toFixed(3) + ' m)');
  }
  if (bad.length) console.log('the drawer and the bed: ' + bad.join('; '));
  return !bad.length;
})()`;
const inDrawer = fresh.concat([
  ['expect', clearOfBed, 'shut, the nightstand and its drawer are beside the bed: never over it, in the room or in the picture'],
  ['eval', T('drawer') + '.onClick(); G.hand.reach = null;'],
  ['waitUntil', "(d => d.out() > 0.29)(" + T('drawer') + ")", 3000],
  ['expect', "(d => d.rim()[1][2] - d.rim()[0][2] > 0.27 && d.rim().every(q => q[0] > 0.9) && G.L.items.filter(i => !i.taken).length === 1)(" + T('drawer') + ")", 'the drawer slides right out toward the foot of the bed: more than a quarter of a metre of it open, the bulb in it'],
  ['expect', clearOfBed, 'open, it is still beside the bed: never over it, in the room or in the picture'],
  ['eval', `window.__inDrawer = (() => {
    const d = ${T('drawer')}, out = { views: 0, hits: 0, bad: [] }, pt = p => { const r = R.projectRect(p[0], p[1], p[2], 0, 0, null); return r && [r.x, r.y + r.h]; };
    const inside = (q, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    for (const it of G.L.items.filter(i => !i.taken)) if (!it.flat || Math.abs(it.y - d.floorY) > 0.01 || it.y + it.h * 0.5 > d.rim()[0][1]) out.bad.push(it.id + ' is not lying on the bottom of the drawer, under its rim');
    for (const down of [0, 1]) for (const dir of [1, 2]) {   // (the bulb from within a right angle of straight ahead)
      G.cam.dirIdx = dir; G.cam.yaw = G.cam.tYaw = dir * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; G.mouse.x = -1; render();
      const poly = d.rim().map(pt);
      if (poly.some(q => !q || q[0] < 0 || q[0] > R.W || q[1] < 0 || q[1] > R.H)) continue;   // its open top is not all in this view
      out.views++;
      for (const h of [...R.hits].filter(h => h.kind === 'item')) {
        const mid = [h.x + h.w / 2, h.y + h.h / 2], where = dir + (down ? 'd' : '') + ': the ' + h.ref.id;
        for (const q of [mid, [mid[0], mid[1] - h.h * 0.3], [mid[0], mid[1] + h.h * 0.3]]) if (!inside(q, poly)) { out.bad.push(where + ' is not drawn within the open drawer'); break; }
        G.mouse.x = mid[0]; G.mouse.y = mid[1] + R.viewY; updateHover();
        if (!G.hover || G.hover.ref !== h.ref) out.bad.push(where + ' is not what is pointed at there'); else out.hits++;
      }
    }
    G.mouse.x = G.mouse.y = -1; if (out.bad.length) console.log('in the drawer: ' + out.bad.join('; '));
    return out;
  })();`],
  ['expect', 'window.__inDrawer.views >= 2 && window.__inDrawer.hits >= 2 && !window.__inDrawer.bad.length', 'the bulb lies in the open drawer: on its bottom, under its rim, drawn within its opening from every view that shows it all (some within a right angle of straight ahead), and pointed at there'],
  ['face', 2, true], ['pickup', 'bulb'],
  ['expect', "G.inv.length === 1 && " + T('drawer') + ".yielded.every(i => i.taken)", 'and it is taken out of it with a click'],
]);
// holding the covers, your hand is on them (watched while the solution holds them)
const coverHand = ['eval', "window.__coverHand = false; (function w() { if (G.holding && G.holding.id === 'covers' && G.hand.reach && G.hand.reach.target === G.holding) window.__coverHand = true; if (G.state === 'play') requestAnimationFrame(w); })();"];
module.exports = {
  // Nightmare charges 3.5x speed for every second spent looking away, so the harness faces each thing directly instead of sweeping
  nightmare: fumbles.concat(inFront, inDrawer, fairy, card, peering, glide, stoop, crawlFrom(0), crawlFrom(1), dark, grabbed, [mattress, ['face', 6, true], ['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in'], ['face', 2, true], ['use', 'drawer'], ['pickup', 'bulb'], ['face', 2, false], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ducked, ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on'], ...duck, ['face', 0, true], coverHand, ['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], ['expect', 'window.__coverHand', 'holding them, your hand was on the covers'], relight, ['expect', 'G.L.won', 'won'], ['expect', 'G.L.s.grab && G.L.s.grab.k < 1', 'and the covers came up before its hands reached you'], ...under]),
};
