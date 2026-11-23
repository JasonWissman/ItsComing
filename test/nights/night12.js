// The Bedroom: bulb from the drawer into the lamp, the switch (on Nightmare the cord first, and three clicks), and
// in the light it ducks down behind the bed until only its eyes are over the edge, then its hands come up onto the
// covers; then hold the covers up, before its hands have pulled their way up the bed to you. The covers come up over
// your eyes and it plays out under them: it comes to the bed and pulls at them three times, and they hold.
// Before that: the night's card shows it where it starts, peering round the edge of the opening, and it does not move
// when the night begins; at first it only peers (and having its head in view is seeing it), then steps out; the covers
// pulled up with the lamp off are a death of their own: it takes them and pulls them away; and its hands reaching you
// are another.
// First, the mattress's top is one piece drawn before the covers, so no part of it is drawn over them as they come up.
// And the night's easter egg, the tooth fairy (fairy, below): the pillow, behind you and nowhere else; the tooth under it;
// the thing waiting, quiet, its hand out, for as long as you like; the tooth handed over, its wings, its dust, the dollar,
// and the night won by it.
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
  fresh, [['eval', T('drawer') + '.onClick();'],
    ['expect', "(its => its.map(i => i.id).sort().join() === 'bulb,bulb2' && its.find(i => i.id === 'bulb2').decoy && !its.find(i => i.id === 'bulb').decoy && !!ICONS.bulbPin && !ICONS.remote)(G.L.items.filter(i => !i.taken))", 'the drawer holds the bulb and one that will not fit, and no remote control'],
    ['eval', 'const b = G.L.items.find(i => i.id === "bulb2"); pickup(b); G.active = G.inv.indexOf(b); G.hand.reach = null; G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300],
    ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.fumbling && G.fumbling.preset === 'bump' && G.fumbling.drop && !G.inv.length && /Wrong kind of bulb/.test(G.lastToast.msg)", 'the wrong bulb is tried in the lamp, and will not go in'],
    ['waitUntil', '!G.fumbling', 3000], ['expect', "(() => { const it = G.L.items.find(i => i.id === 'bulb2'); return !it.taken && it.y === G.L.floor.y && !G.L.s.fitted; })()", 'it drops onto the bed'],
    ['eval', seeAndTake], ['wait', 300], ['expect', clickable, 'where it can be seen and taken again'],
    ['eval', 'pickup(' + seeAndTake + ');'], ['expect', "G.inv.some(i => i.id === 'bulb2')", 'and taken']],
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
    return ['drawer', 'lamp', 'covers', 'socket'].every(id => !!out[id]) && !out.pillow && !out.hand;
  })()`, 'the drawer, the lamp, the covers and the cord are each whole in view and pointed at without looking back (and the pillow is not)'],
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
      const hb = AUDIO.heartbeat, vo = AUDIO.voice, fs = AUDIO.footstep, x = AUDIO.sfx, sh = G.shake;
      // (whichever copy of this is the page's now)
      AUDIO.heartbeat = function () { window.__fy.beats++; return hb.apply(this, arguments); };
      AUDIO.voice = function () { window.__fy.voices++; return vo.apply(this, arguments); };
      AUDIO.footstep = function () { window.__fy.steps++; return fs.apply(this, arguments); };
      AUDIO.sfx = function (n) { window.__fy.fx.push(n); return x.apply(this, arguments); };
      G.shake = function () { window.__fy.shakes++; return sh.apply(this, arguments); };
    },
    look(d, down) { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; G.mouse.x = G.mouse.y = -1; render(); },
    lamp(secs) { const s = G.L.s; s.fitted = s.plugged = true; s.lampOn = true; s.wasLit = true; s.onAt = G.L.t; s.lampT = secs || 90; },
    // how much of a thing's hit area is in the view as it is now (square pixels)
    seen(id) { const h = [...R.hits].reverse().find(q => q.ref && q.ref.id === id); if (!h) return 0; return Math.max(0, Math.min(R.W, h.x + h.w) - Math.max(0, h.x)) * Math.max(0, Math.min(R.H + R.viewY, h.y + h.h) - Math.max(R.viewY, h.y)); },
    // the most of it that shows from any of the ways you can look without looking back
    front(id) { let most = 0; for (const down of [0, 1]) for (const d of [6, 7, 0, 1, 2]) { F.look(d, down); most = Math.max(most, F.seen(id)); } return most; },
    // the pillow lifted and the tooth taken, straight (the view as it is)
    tooth() { const p = F.T('pillow'); if (!p.hidden) p.onClick(); const t = G.L.items.find(i => i.id === 'tooth'); if (!t.taken) pickup(t); G.hand.reach = null; return G.inv.some(i => i.id === 'tooth'); },
    note() { const c = G.L.creature, p = c.pos(), T = c.fairy || {}; F.log.push({ st: G.state, p: [p.x, p.z], lean: T.lean || 0, offer: T.offer || 0, beat: T.beat === undefined ? 1 : T.beat, wings: T.wings || 0, gone: T.gone || 0 }); },
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
// the pillow is behind you and nowhere else; lifted, a tooth; the tooth taken, the thing is at the foot of the bed, bowed
// in, its hand out, and it waits, quiet; the tooth put down goes back; handed over, it is the night's end, and a win
const fairyPlay = [
  ['eval', fairyLib + ' window.__fy.fresh(0); G.L.creature.hold = G.L.creature.dist;'], ['wait', 250],
  ['expect', FY("fy.front('pillow') < 16 && !G.L.items.some(i => i.id === 'tooth') && !G.L.s.fairy"), 'the pillow is not to be seen or pointed at from the front: not from west round by north to east, ahead or down'],
  ['eval', FY('fy.look(4, true)')], ['wait', 250],
  ['expect', FY("fy.seen('pillow') > 6000 && fy.T('hand').hidden"), 'looking right round and down, it is there'],
  ['click', 'pillow'], ['wait', 600],
  ['expect', "(t => G.L.s.pillowAt !== null && " + T('pillow') + ".hidden && !!t && !t.taken && G.lastToast.msg === 'A tooth.' && !G.L.s.fairy && G.L.s.mode === 'peer')(G.L.items.find(i => i.id === 'tooth'))", 'clicked, it is tipped up, and there is a tooth under it; the night goes on as it was'],
  ['eval', 'G.L.creature.hold = null;'],
  ['pickup', 'tooth'], ['wait', 200],
  ['expect', "G.L.s.mode === 'fairy' && G.L.s.fairy.stage === 'wait' && " + atFoot + " && G.L.creature.fairy.lean === 1 && G.L.creature.fairy.offer === 1 && !G.L.creature.peer", 'the tooth taken (your back to it): it is at the foot of the bed, bowed in over it, its hand held out'],
  ['expect', FY("!fy.T('hand').hidden && (fy.look(0, false), fy.seen('hand') > 6000) && (fy.look(4, true), fy.seen('hand') === 0)"), 'and its open hand is there to point at, in front of you'],
  ['eval', FY('(fy.reset(), fy.look(0, false))')],
  ['expect', FY("fy.step(30) === 'play' && fy.alive() && fy.log.length === 1800 && fy.beats === 0 && fy.voices === 0 && fy.steps === 0 && G.danger === 0 && G.L.s.fairy.stage === 'wait' && " + atFoot + " && G.inv.some(i => i.id === 'tooth') && !G.L.won"), 'it waits: thirty seconds on there has been no heartbeat, not a breath or a step from it, and nothing has happened to you'],
  ['eval', FY("(G.holding = fy.T('covers'), fy.step(0.5))")],
  ['expect', FY("G.holding === null && !(fy.T('covers').progress > 0.1) && !G.L.s.coversUp && /Not now/.test(G.lastToast.msg) && fy.alive()"), 'the covers will not come up while it waits (in the dark too: it does not take them)'],
  ['eval', FY("(fy.look(0, true), G.active = G.inv.findIndex(i => i.id === 'tooth'), dropActive(), fy.step(0.3))")],
  ['expect', "(t => !t.taken && !G.inv.includes(t) && Math.abs(t.x - 0.02) < 0.01 && t.z < -0.2 && t.z > -0.3 && G.L.s.fairy.stage === 'wait' && " + T('hand') + ".hidden === false)(G.L.items.find(i => i.id === 'tooth'))", 'the tooth put down goes back under the pillow, and it waits on'],
  ['eval', FY('fy.look(4, true)')], ['wait', 250], ['pickup', 'tooth'],
  ['eval', FY('(delete SAVE.data.eggs.bedroom, fy.reset(), fy.look(0, false))')], ['wait', 250],
  ['use', 'hand'],
  ['expect', "SAVE.data.eggs.bedroom === true && G.L.text.egg === 'Give the tooth fairy a tooth.' && document.querySelector('#secret .st').textContent === 'Tooth fairy' && !G.inv.length && G.L.s.fairy.stage === 'take' && G.L.creature.fairy.tooth && G.state === 'play' && !G.L.won", 'the tooth put in its hand: the easter egg is found and saved ("Tooth fairy"), and the night is not over yet'],
  ['expect', FY("fy.step(4.6) === 'play' && Math.max(...fy.log.map(f => f.wings)) === 1 && G.L.creature.fairy.shut === 1 && G.L.creature.dist > 2.75 && fy.log[fy.log.length - 1].lean === 0 && fy.log[fy.log.length - 1].offer === 0 && !fy.fx.includes('wingWhoosh') && fy.clear()"), 'its hand closes on it; it straightens, steps back from the bed and unfurls its wings'],
  ['expect', FY("fy.step(2) === 'play' && G.L.creature.fairy.gone === 1 && fy.fx.filter(n => n === 'wingWhoosh').length === 1 && fy.fx.filter(n => n === 'fairyDust').length === 1 && Math.min(...fy.log.map(f => f.beat)) < 0.3 && Math.max(...fy.log.map(f => f.beat)) > 1.1 && fy.shakes === 1 && !!G.L.s.fairy.dust && fy.beats === 0"), 'one fan of them (a soft beat of wings), and it is gone in fairy dust (a shimmer of bells)'],
  ['waitUntil', "G.L.won && G.state === 'won'", 9000],
  ['expect', "G.L.s.fairy.done && !G.L.s.coversUp && G.L.t - G.L.s.fairy.given > 11.5 && G.L.t - G.L.s.fairy.given < 13", 'the dollar comes down onto the bed, and a moment after it has settled the night is won'],
  ['waitUntil', "G.state === 'survived'", 12000],
  ['expect', "(p => G.survivedScreen.text === G.L.text.fairy && !!p && p.innerText.split('\\n').map(l => l.trim()).join('|') === 'It took the tooth and left a dollar.|You do not remember losing one.')(UI.overlay.querySelector('.intro'))", 'and the card after it is the tooth fairy\'s, each of its sentences on a line of its own'],
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
  ['expect', FY("(fy.look(4, true), fy.tooth()) && fy.step(0.2) === 'play' && (fy.look(0, false), fy.reset(), useTarget(fy.T('hand')), G.L.s.fairy.stage === 'take') && fy.step(7.4) === 'play' && Math.min(...fy.log.map(f => f.beat)) === 1 && Math.max(...fy.log.map(f => f.beat)) === 1 && fy.shakes === 0 && G.L.creature.fairy.gone === 1 && G.L.creature.fairy.still === true && G.L.creature.fairy.steady === true && fy.fx.includes('fairyDust')"), 'with motion and flashes reduced its wings do not fan (it only fades into its dust), nothing twinkles, and the view does not shake'],
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
// The drawer, open, is a box slid right out of the nightstand toward the bed, and what is in it lies in it: from every view that shows
// the whole of its open top, each thing is on its bottom, under its rim, drawn within the opening (its middle, and well
// above and below it), and pointed at there it is the thing under the pointer; and it is taken with a click.
const inDrawer = fresh.concat([
  ['eval', T('drawer') + '.onClick(); G.hand.reach = null;'],
  ['waitUntil', "(d => d.rim()[2][0] - d.rim()[1][0] > 0.27)(" + T('drawer') + ")", 3000],
  ['expect', "(d => d.rim()[2][0] - d.rim()[1][0] > 0.27 && d.rim()[0][0] < 0.6 && G.L.items.filter(i => !i.taken).length === 2)(" + T('drawer') + ")", 'the drawer slides right out toward the bed: more than a quarter of a metre of it open, the two bulbs in it'],
  ['eval', `window.__inDrawer = (() => {
    const d = ${T('drawer')}, out = { views: 0, bad: [] }, pt = p => { const r = R.projectRect(p[0], p[1], p[2], 0, 0, null); return r && [r.x, r.y + r.h]; };
    const inside = (q, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    for (const it of G.L.items.filter(i => !i.taken)) if (!it.flat || Math.abs(it.y - d.floorY) > 0.01 || it.y + it.h * 0.5 > d.rim()[0][1]) out.bad.push(it.id + ' is not lying on the bottom of the drawer, under its rim');
    for (const down of [0, 1]) for (const dir of [1, 2]) {
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
  ['expect', 'window.__inDrawer.views >= 2 && !window.__inDrawer.bad.length', 'each lies in the open drawer: on its bottom, under its rim, drawn within its opening from every view that shows it all, and pointed at there'],
  ['face', 2, true], ['pickup', 'bulb2'], ['pickup', 'bulb'],
  ['expect', "G.inv.length === 2 && " + T('drawer') + ".yielded.every(i => i.taken)", 'and each is taken out of it with a click'],
]);
// holding the covers, your hand is on them (watched while the solution holds them)
const coverHand = ['eval', "window.__coverHand = false; (function w() { if (G.holding && G.holding.id === 'covers' && G.hand.reach && G.hand.reach.target === G.holding) window.__coverHand = true; if (G.state === 'play') requestAnimationFrame(w); })();"];
module.exports = {
  // Nightmare charges 3.5x speed for every second spent looking away, so the harness faces each thing directly instead of sweeping
  nightmare: fumbles.concat(inFront, inDrawer, fairy, card, peering, glide, stoop, crawlFrom(0), crawlFrom(1), dark, grabbed, [mattress, ['face', 6, true], ['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in'], ['face', 2, true], ['use', 'drawer'], ['pickup', 'bulb'], ['face', 2, false], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ducked, ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on'], ...duck, ['face', 0, true], coverHand, ['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], ['expect', 'window.__coverHand', 'holding them, your hand was on the covers'], relight, ['expect', 'G.L.won', 'won'], ['expect', 'G.L.s.grab && G.L.s.grab.k < 1', 'and the covers came up before its hands reached you'], ...under]),
};
