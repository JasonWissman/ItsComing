// The Clearing: a bow and three arrows, each lying in a place of its own; hold to draw until the bar is full, and let go
// with it in your sights; two hits. The arrows are picked up one at a time and go together in one slot. Then the harness
// proves what each kind of letting go does, with the thing held where it is (so the test is not a race against Nightmare
// speed): a click looses nothing (the bow is let back down), a draw let go before full falls short, one drawn full but off
// it misses (each of those spends an arrow; the three are given back between runs, as there are only three). Then the
// bats: one is shot out of the sky (the night's easter egg, kept in the save), and the night goes on. What comes down
// turns into a vampire, the arrow still in it, which staggers toward the porch and collapses a few steps short of it
// (vampWalk, below); and in the last run, one still on its way when the thing takes its second arrow collapses where it
// is, two seconds on (vampLate). Then a run where one
// hit, drawn full on it at 47 m from a pad, and two that fall short leave it nothing to stop it: it comes in and reaches you.
// Then the night again: a draw held full for a few seconds before letting go still goes in; the first arrow puts it all
// the way down in the snow, where it lies about a second and gets up; and a second, followed with the pointer while it
// comes on hurt and wary, puts it down for good.
// Before any of that, what will not go: the first time, two arrows are picked up before the bow, and one is clicked at it
// with no bow (it is raised to shoot, finds no bow, and drops head first to the boards at your feet, where it is picked up
// again); the second time the bow comes first, and pressed with no arrows it comes up, tips to show the bare shelf, the
// string is plucked on nothing, and it is let down.
// How it moves while the bow is drawn on it: unhurt it is bold (it seldom breaks sideways from a draw, about 12% of them,
// and never by itself while one is on it, and its weave narrows); with an arrow in it, it is wary (about every other
// draw, a wide quick weave, and a break to one side every second or two by itself). So it moves less on the first draw
// than on the second: both are measured here (sway, below), the game stepped by hand, as are the rates (dodge). The draws
// that loose something follow its body while they are held, as a player keeps it in the sights, so a break mid-draw is
// followed.
const arrows = "(G.inv.find(i => i.id === 'arrows') || { uses: 0 }).uses";
const last = 'G.L.s.outcomes[G.L.s.outcomes.length - 1]';
const hold = d => ['eval', 'const c = G.L.creature; c.switched = true; c.darts = Infinity; c.u = 1 - Math.pow(' + d + ' / c.D0, 1 / c.gamma); c.hold = ' + d + ';' +
  ' G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;'];
const refill = ['eval', "G.inv.find(i => i.id === 'arrows').uses = 3; G.L.s.spent = 0; G.invSig = '';"];
const nock = ['wait', 750];   // the next arrow is on the string
// three arrows lying apart, picked up one at a time: one slot, the count going up, "Arrows ×2" on it
const slot = n => ['expect', "G.inv.filter(i => i.id === 'arrows').length === 1 && " + arrows + ' === ' + n + " && G.inv.find(i => i.id === 'arrows').name === '" + (n > 1 ? 'Arrows' : 'Arrow') + "'" +
  (n > 1 ? " && [...document.querySelectorAll('#inventory .label')].some(l => l.textContent === 'Arrows ×" + n + "')" : ''), 'arrow ' + n + ' picked up: one slot, ' + (n > 1 ? '"Arrows ×' + n + '"' : '"Arrow"')];
const apart = ['expect', "(() => { const a = G.L.items.filter(i => i.id === 'arrows').map(i => [i.x, i.z]); return a.length === 3 && a.every((p, i) => a.every((q, j) => i === j || Math.hypot(p[0] - q[0], p[1] - q[1]) >= 0.8)); })()", 'three arrows, each lying apart from the others'];
const dropped = "G.L.items.filter(i => i.id === 'arrows')[3]";   // the one let go of from the bundle, an arrow of its own
const noBow = [apart, ['pickup', 'arrows'], slot(1), ['pickup', 'arrows'], slot(2), hold(70), ['wait', 300],
  ['shoot'], ['expect', "G.lastToast.msg === 'No bow.' && " + arrows + " === 1 && G.fumbling && G.fumbling.drop && G.fumbling.preset === 'slip' && !G.L.s.outcomes.length", 'an arrow clicked at it with no bow: one leaves the bundle, nothing is loosed'],
  ['waitUntil', '!G.fumbling && ' + dropped + ' && !' + dropped + '.taken', 4000],
  ['expect', "(a => a.y === G.L.floor.y && a.flat && a.uses === 1 && a.name === 'Arrow' && Math.hypot(a.x, a.z) < 2)(" + dropped + ')', 'it dropped to the boards at your feet, one arrow'],
  ['pickup', 'arrows'], ['pickup', 'arrows'], slot(3), ['expect', "G.L.items.filter(i => i.id === 'arrows').every(i => i.taken)", 'it is picked up again, with the last one'],
  ['pickup', 'bow']];
const noArrows = [apart, ['pickup', 'bow'], hold(70), ['wait', 300],
  ['draw', 'click'], ['expect', "G.lastToast.msg === 'No arrows.' && G.L.s.groping && !G.draw", 'the bow pressed with no arrows: it comes up, and nothing is nocked'],
  ['wait', 350], ['expect', 'G.L.s.bowUp > 0.6 && G.L.s.groping && G.L.s.groping.pats >= 1', 'the bow is up, tipped to show the bare shelf, the string plucked on nothing'],
  ['waitUntil', '!G.L.s.groping && G.L.s.bowUp < 0.3', 3000],
  ['pickup', 'arrows'], slot(1), ['pickup', 'arrows'], slot(2), ['pickup', 'arrows'], slot(3)];
// many draws past the least that looses anything, each let straight back down (nothing loosed or spent), the cooldown
// cleared between them, the game stepped by hand: a share of them (the chance it has as it is now: s.dodge[chance]) make
// it break sideways, side on, at least 4 degrees to a new place, its distance unchanged; then, with a break certain, a
// second draw within the cooldown (s.dodge[gap]) does not, and one after it does. window[as] holds what was seen.
const dodge = (as, chance, gap) => ['eval', `(() => {
  const L = G.L, c = L.creature, k = L.s.dodge, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const r = { n: 200, rolls: k.rolls, count: k.count, runs: 0, sideways: 0, moved: [], dist: 0 };
  const drawOnce = () => { G.drawBtn = 'mouse'; step(15); const d = G.draw; drawLetGo('mouse', true); return d; };
  const off = () => Math.tan(CREATURES.runner.ang(c)) * c.dist;   // where its run puts it, off its way
  for (let i = 0; i < r.n; i++) {
    k.at = -Infinity; step(30); let g = 0; while (c.mode === 'dart' && g++ < 200) step(1);
    const was = k.count, a0 = c.dartAng, x0 = off(), d0 = c.dist;
    drawOnce();
    if (k.count === was) continue;
    r.runs += c.mode === 'dart' && c.runDir === Math.sign(c.dartTo - a0) ? 1 : 0;
    step(100);
    const dx = off() - x0; r.moved.push(+dx.toFixed(2)); r.sideways += Math.abs(c.dartAng - a0) >= 0.069 && Math.abs(dx) > 1.5 ? 1 : 0;
    r.dist = Math.max(r.dist, Math.abs(c.dist - d0));
  }
  r.rolls = k.rolls - r.rolls; r.count = k.count - r.count;
  const ch = k.${chance}; k.${chance} = 1; k.at = -Infinity; step(200);
  const c0 = k.count; drawOnce(); r.forced = k.count - c0; step(100);
  drawOnce(); r.soon = k.count - c0 - r.forced; step(Math.ceil(k.${gap} * 60));
  drawOnce(); r.later = k.count - c0 - r.forced - r.soon; step(100);
  k.${chance} = ch; G.drawBtn = null; G.draw = null;
  window.${as} = r;
})()`];
// How much it moves from side to side while the bow is drawn on it, as it is now (unhurt, or hurt and up): 24 draws
// of two seconds, each let back down (nothing loosed), free to break away as it does in the night (c.darts counting
// again), the game stepped by hand. range: how far its bearing from the porch swings in a draw, in degrees, on average;
// path: how far it travels. window._sway[as] holds them.
const sway = as => ['eval', `(() => {
  const L = G.L, c = L.creature, k = L.s.dodge, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const n = 24, r = { range: 0, path: 0 }, darts = c.darts;
  c.darts = 0;
  for (let i = 0; i < n; i++) {
    k.at = -Infinity; step(45);
    let lo = Infinity, hi = -Infinity, was = Math.atan2(c.lat, c.dist);
    G.drawBtn = 'mouse';
    for (let j = 0; j < 120; j++) { step(1); const a = Math.atan2(c.lat, c.dist); r.path += Math.abs(a - was); was = a; lo = Math.min(lo, a); hi = Math.max(hi, a); }
    drawLetGo('mouse', true);
    r.range += hi - lo;
  }
  r.range = +(r.range / n / DEG).toFixed(2); r.path = +(r.path / n / DEG).toFixed(2);
  step(45); let g = 0; while (c.mode === 'dart' && g++ < 200) step(1);
  c.darts = darts; G.drawBtn = null; G.draw = null;
  (window._sway = window._sway || {})['${as}'] = r;
})()`];
// The first arrow, from the moment it is loosed (the game stepped by hand from here until it is up again): it goes down
// (c.mode 'stumble') through a fall, a lying and a rising, in that order; where each began (the seconds since the hit),
// how tall its body was while it lay, whether it moved or could dodge while it lay, and what it is once it is up.
const down = ['eval', `(() => {
  const L = G.L, c = L.creature, CR = c.CR, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  let g = 0; while (!c.wounded && g++ < 300) step(1);
  const r = { mode: c.mode, order: [], at: {}, tall: 0, drift: 0, dodge: false, end: 0 };
  let ph = null, lat0 = 0, d0 = 0;
  while (c.mode === 'stumble' && g++ < 2000) {
    const d = CR.downAt(c);
    if (d.ph !== ph) { ph = d.ph; r.order.push(ph); r.at[ph] = c.modeT; if (ph === 'lie') { lat0 = c.lat; d0 = c.dist; } }
    if (ph === 'lie') { r.tall = Math.max(r.tall, CR.body(c)[3]); r.drift = Math.max(r.drift, Math.abs(c.lat - lat0), Math.abs(c.dist - d0)); r.dodge = r.dodge || CR.canDodge(c); }
    r.end = c.modeT; step(1);
  }
  r.after = { mode: c.mode, wounded: c.wounded, dead: c.dead, hits: c.hits, arrows: c.arrows.length };
  window._down = r;
})()`];
// A bat shot out of the sky, by hand: the view turned to one that is in open sky, the pointer kept on it through a full
// draw (the game's own press and let-go, the game stepped by hand), and let go on it. window._bat holds what happened:
// the outcome, the egg in the save, the arrow spent, the bat down in the snow, the other two still flying, the night
// going on. (The save's egg is cleared first, so each run finds it anew.)
const batShot = ['eval', `(() => {
  const L = G.L, s = L.s, c = L.creature, id = L.def.id, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const uses = () => (G.inv.find(i => i.id === 'arrows') || { uses: 0 }).uses;
  delete SAVE.data.eggs[id];
  const r = { arrows0: uses(), spent0: s.spent, bats: s.bats.length, high: s.bats.every(b => b.y > L.eyeH + 1.5 && Math.hypot(b.x, b.z) > 14 && Math.hypot(b.x, b.z) < 37) };
  let b = null, g = 0;
  const far = p => { const cb = creatureBox(c); return !cb || Math.abs(p.x - (cb.x + cb.w / 2)) > cb.w / 2 + p.r + 160; };
  while (!b && g++ < 3000) {   // until one is in open sky, well inside the view, looking ahead
    for (const d of [4, 5, 3, 6]) {
      G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0; render();
      b = s.bats.find(q => { const p = CLEARING_BATS.screen(q); return p && CLEARING_BATS.clear(L, q) && p.x > 200 && p.x < R.W - 200 && p.y > R.viewY + 60 && p.y < R.viewY + R.H * 0.42 && far(p); });   // (and well to one side of the thing: under the same aim, the thing comes first)
      if (b) break;
    }
    if (!b) step(10);
  }
  if (!b) { window._bat = r; return; }
  const aim = () => { const p = CLEARING_BATS.screen(b); G.mouse.x = p.x; G.mouse.y = p.y; return p; };
  r.radius = aim().r;
  drawPress(L, null, 'mouse');
  g = 0; while (!(G.draw && G.draw.full) && g++ < 200) { aim(); step(1); }
  for (let i = 0; i < 8; i++) { aim(); step(1); }
  // (held full, as a player would, until it is in open sky and clear of the thing: a bat gone up behind the porch roof's edge, or across the thing, is not there to be hit)
  g = 0; while (g++ < 900) { const p = aim(); if (CLEARING_BATS.clear(L, b) && far(p) && CLEARING_BATS.at(L, { x: p.x, y: p.y }) === b) break; step(1); }
  aim(); r.y0 = b.y;
  drawLetGo('mouse'); G.drawSwallow = false;
  r.out = s.outcomes[s.outcomes.length - 1]; r.drawOut = G.draw && G.draw.outcome;
  g = 0; while (!b.hit && g++ < 120) step(1);
  r.flight = g / 60; r.hit = !!b.hit; r.egg = SAVE.data.eggs[id] === true; r.saved = JSON.parse(localStorage.getItem('itscoming.v2')).eggs[id] === true; r.toast = G.lastToast.msg;
  g = 0; while (b.hit && !b.hit.landed && g++ < 400) step(1);
  r.fall = g / 60; r.landed = !!(b.hit && b.hit.landed); r.y1 = b.y; r.batsHit = s.batsHit; r.flying = s.bats.filter(q => !q.hit).length;
  r.vamp = b.vamp && { ph: b.vamp.ph, at: Math.hypot(b.vamp.x - b.x, b.vamp.z - b.z) }; window._batDown = b;
  r.arrows = uses(); r.spent = s.spent; r.state = G.state; r.thing = { dead: c.dead, wounded: c.wounded, hits: c.hits };
  window._bat = r;
})()`];
// and with reduced motion they fly at half the pace, their wings slow (the same three seconds of a bat's way, both ways)
const batPace = ['eval', `(() => {
  const L = G.L, s = L.s, r = window._bat, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const q = s.bats.find(x => !x.hit), t0 = q.t;
  const pace = rm => { SAVE.data.settings.reducedMotion = rm; q.t = t0; step(1); const f0 = q.flap, t1 = q.t; let d = 0, x = q.x, y = q.y, z = q.z; for (let i = 0; i < 180; i++) { step(1); d += Math.hypot(q.x - x, q.y - y, q.z - z); x = q.x; y = q.y; z = q.z; } return { d, flap: q.flap - f0, t: q.t - t1 }; };
  const was = SAVE.data.settings.reducedMotion, fast = pace(false), slow = pace(true); SAVE.data.settings.reducedMotion = was;
  r.clock = +(slow.t / fast.t).toFixed(2); r.pace = +(slow.d / fast.d).toFixed(2); r.beat = +(slow.flap / fast.flap).toFixed(2);
  window._bat = r;
})()`];
// The bat that came down, from the moment it lands (the game stepped by hand): it lies there half a second, then turns:
// a caped figure stands up where it lay (b.vamp: ph 'lie', 'turn', 'walk', 'fall', 'down'; x and z where it is). It
// comes toward the porch, never back, and CLEARING_VAMPIRE.STOP metres short of the porch and its steps (off: how far
// outside them a place is) it goes down, and lies where it fell. The thing is held where it is meanwhile, untouched.
const vampWalk = ['eval', `(() => {
  const L = G.L, c = L.creature, V = CLEARING_VAMPIRE, v = window._batDown.vamp, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const d = () => Math.hypot(v.x, v.z), r = window._vamp = { back: 0, hits: c.hits };
  let g = 0; while (v.ph !== 'walk' && g++ < 400) step(1);
  r.up = g / 60; r.d0 = d(); r.off0 = V.off(L, v.x, v.z); r.drawn = L.rend && !!v.spr;
  let was = r.d0; g = 0;
  while (v.ph === 'walk' && g++ < 4000) { step(1); if (d() > was + 1e-9) r.back++; was = d(); }
  r.walked = g / 60; r.off = V.off(L, v.x, v.z); r.d = d();
  g = 0; while (v.ph !== 'down' && g++ < 400) step(1);
  r.fall = g / 60; step(120); r.ph = v.ph; r.moved = Math.abs(d() - r.d); r.stop = V.STOP;
  r.state = G.state; r.thing = { dead: c.dead, wounded: c.wounded, hits: c.hits - r.hits }; r.aimed = R.hits.some(h => h.ref === v || h.ref === window._batDown);
})()`];
// The second run of it, with the thing about to take its second arrow: once the figure is up and walking it is put well
// out (22 m off on its own bearing, if it was nearer: a harness's hold, as the thing's is), so it is still on its way
// when the arrow lands
const vampFar = ['eval', `(() => {
  const v = window._batDown.vamp, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  let g = 0; while (v.ph !== 'walk' && g++ < 400) step(1);
  const d = Math.hypot(v.x, v.z); if (d < 22) { v.x *= 22 / d; v.z *= 22 / d; }
  window._late = { walking: v.ph === 'walk' };
})()`];
// and after it: when it went down, counted from the second arrow (s.killedAt), and how far from the porch it then was
const vampLate = ['eval', `(() => {
  const L = G.L, V = CLEARING_VAMPIRE, v = window._batDown.vamp, r = window._late, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  let g = 0; while (v.ph !== 'down' && g++ < 400 && G.state === 'won') step(1);
  r.ph = v.ph; r.after = v.fellT - L.s.killedAt; r.off = V.off(L, v.x, v.z); r.stop = V.STOP; r.state = G.state; r.won = L.won;
})()`];
const kinds = [
  hold(25), ['wait', 300],
  dodge('_dodge', 'chance', 'gap'), ['expect', '(r => r.rolls === r.n && r.count >= 0.05 * r.n && r.count <= 0.2 * r.n)(window._dodge)', 'unhurt, drawn on 200 times: it is bold, and only about 12% of draws make it break away'],
  ['expect', '(r => r.runs === r.count && r.sideways === r.count && r.dist < 0.01)(window._dodge)', 'each time it runs side on, the way it runs, to a new place at least 4 degrees and 1.5 m to the side, no nearer'],
  ['expect', '(r => r.forced === 1 && r.soon === 0 && r.later === 1)(window._dodge)', 'drawn on again within a few seconds of breaking away, it does not; after that, it may again'],
  ['eval', 'window._rolls = G.L.s.dodge.rolls;'],
  ['draw', 'click'], ['expect', "G.draw && G.draw.state === 'easing' && G.L.s.dodge.rolls === window._rolls", 'a click: the bow starts to come up and is let back down (not a draw: nothing for it to react to)'],
  ['wait', 500], ['expect', arrows + ' === 3 && !G.L.s.outcomes.length', 'a click looses nothing and spends nothing'],
  ['draw', 'short'], ['expect', last + " === 'short' && " + arrows + ' === 2 && G.draw.from < 1', 'let go before full: it falls short, an arrow spent'],
  nock, ['draw', 'full', 'off'], ['expect', last + " === 'miss' && " + arrows + " === 1 && G.draw.from === 1 && UI.drawbar.classList.contains('full')", 'drawn full (the bar shows it) but off it: a miss, an arrow spent'],
  ['wait', 1200], ['expect', '!G.L.creature.wounded && G.L.creature.hits === 0 && G.L.s.batsHit === 0', 'nothing that missed touched it (or a bat)'],
  ['draw', 'click', null, 'pad'], ['wait', 200], ['expect', arrows + ' === 1 && G.L.s.outcomes.length === 2', 'a tap of A looses nothing either'],
];
const bat = [
  refill, ['wait', 600],
  batShot,
  ['expect', '(r => r.bats === 3 && r.high)(window._bat)', 'three bats over the clearing, each up in the sky and well out from the porch'],
  ['expect', "(r => r.out === 'bat' && r.drawOut === 'bat' && r.hit && r.flight < 0.7)(window._bat)", 'drawn full and let go with the aim kept on a bat: the arrow takes it'],
  ['expect', "(r => r.egg && r.saved && SAVE.data.eggs[G.L.def.id] === true && r.toast === 'You shot a bat out of the sky.')(window._bat)", "the night's easter egg is in the save the moment the bat is hit (SAVE.data.eggs.clearing)"],
  ['expect', '(r => r.landed && r.y1 < 0.2 && r.y0 > 3 && r.fall > 0.5 && r.fall < 3.5 && r.batsHit === 1 && r.flying === 2)(window._bat)', 'the bat tumbles out of the sky and lies in the snow; the other two fly on'],
  ['expect', "(r => r.arrows === r.arrows0 - 1 && r.spent === r.spent0 + 1 && r.state === 'play' && !r.thing.dead && !r.thing.wounded && r.thing.hits === 0)(window._bat)", 'it cost the arrow as any shot does, and the night goes on: the thing untouched and still coming'],
  ['expect', '(r => r.radius >= 18 && r.radius <= 54)(window._bat)', 'a small thing, but not a fiddly one to hit: the aim has to be within about its wingspan of it either way (1.8 times its half span and padding)'],
  ['expect', "(r => r.vamp && r.vamp.ph === 'lie' && r.vamp.at < 1e-6)(window._bat)", 'where the bat came down there is more than a bat: it lies there, about to turn'],
  vampWalk,
  ['expect', '(r => r.up > 1.5 && r.up < 2.4 && r.d0 > 12 && r.off0 > 8)(window._vamp)', 'it turns into a vampire where it lay, out in the snow, and stands up'],
  ['expect', '(r => r.back === 0 && r.walked > 3 && r.walked < 40 && r.d < r.d0 - 6)(window._vamp)', 'it staggers toward the porch, never back'],
  ['expect', "(r => r.ph === 'down' && r.off <= r.stop + 0.01 && r.off > r.stop - 0.2 && r.stop >= 1.5 && r.stop <= 4 && r.fall > 0.8 && r.fall < 2 && r.moved < 1e-9)(window._vamp)", 'a few steps short of the porch it collapses, and lies where it fell'],
  ['expect', "(r => r.state === 'play' && !r.thing.dead && !r.thing.wounded && r.thing.hits === 0 && !r.aimed && G.L.s.batsHit === 1)(window._vamp)", 'it harmed nothing and changed nothing: the night goes on, the thing untouched, and it is not a thing to aim at'],
  batPace, ['expect', '(r => r.clock === 0.5 && r.pace < 0.8 && r.beat < 0.4)(window._bat)', 'with reduced motion the bats fly at half the pace, without the jitter, their wings beating slowly'],
];
// The first arrow in it and it down in the snow: a draw begun at once (the game stepped by hand, nothing loosed) fills
// slower than usual (d.fill), and tops out only after it has got up and run about a little; a later one is as usual.
const again = ['eval', `(() => {
  const L = G.L, c = L.creature, step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const r = { was: c.mode, up: c.mode === 'stumble' ? null : L.t, spent: L.s.spent };
  G.drawBtn = 'mouse'; step(1); r.fill = G.draw.fill;
  let g = 0; while (G.draw && G.draw.power < 1 && g++ < 600) { step(1); if (r.up === null && c.mode !== 'stumble') r.up = L.t; }
  r.full = L.t; r.downAtFull = c.mode === 'stumble'; drawLetGo('mouse', true); step(180);
  G.drawBtn = 'mouse'; step(1); r.later = G.draw.fill; drawLetGo('mouse', true); step(40);
  G.drawBtn = null; G.draw = null; r.spent = L.s.spent - r.spent;
  window._again = r;
})()`];
const spentAll = [
  refill, hold(47), nock, ['draw', 'full', null, 'pad'], ['expect', last + " === 'hit' && G.L.creature.dist > 45", 'held on A until full and let go on it at 47 m: it flies at it'],
  ['wait', 1500], ['expect', 'G.L.creature.wounded && G.L.creature.hits === 1', 'the first hit wounds it, from 47 m'],
  again, ['expect', '(r => r.fill > 1.7 && r.downAtFull === false && r.up !== null && r.full - r.up >= 1.1 && r.full - r.up <= 1.4 && r.spent === 0)(window._again)', 'drawn again at once while it is down: the bow comes back slower, and is full only once it has got up and run about for a second or so'],
  ['expect', '(r => Math.abs(r.later - 1.5) < 1e-9)(window._again)', 'a draw begun after that takes its usual second and a half'],
  ['draw', 'short', null, 'pad'], nock, ['draw', 'short', null, 'touch'], ['expect', arrows + " === 0 && G.L.s.outcomes.slice(-2).join() === 'short,short'", 'all three arrows gone, one in it (A and a finger held on it draw too)'],
  ['eval', 'G.L.creature.hold = null;'], ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 15000],
  ['expect', "G.L.creature.reckless && G.deathCause === 'spent'", 'with every arrow gone and only one in it, it came in and reached you'],
  ['eval', 'restartLevel();'], ['wait', 300],
];
const kill = [
  hold(30), ['wait', 300],
  sway('first'),
  ['draw', 4000], ['expect', last + " === 'hit' && G.L.s.outcomes.length === 1 && G.draw.from === 1", 'held full for a few seconds (it does not slip), then let go on it: it flies at it'],
  down,
  ['expect', "(r => r.mode === 'stumble' && r.order.slice(-2).join() === 'lie,rise' && r.at.lie > 0.4 && r.at.lie < 0.65)(window._down)", 'the first hit: it goes down, falling for about half a second'],
  ['expect', '(r => r.at.rise - r.at.lie >= 0.8 && r.at.rise - r.at.lie <= 1.2 && r.tall < 0.5 && r.drift < 1e-6 && !r.dodge)(window._down)', 'it lies flat in the snow for about a second (0.8 to 1.2 s), where it fell, a low thing to aim at'],
  ['expect', "(r => r.end - r.at.rise > 0.5 && r.end - r.at.rise < 0.9 && r.after.mode === 'sprint' && r.after.wounded && !r.after.dead && r.after.hits === 1 && r.after.arrows === 1)(window._down)", 'then it gets back up (well under a second) and comes on, wounded, the arrow in it'],
  ['expect', arrows + ' === 2', 'one arrow spent'],
  sway('second'),
  ['expect', '(s => s.second.range > 1.5 * s.first.range && s.second.path > 2 * s.first.path && s.first.range < 5 && s.second.range > 5.5)(window._sway)', 'drawn on at 30 m, it moves from side to side less the first time (unhurt) than the second (hurt and wary): its swing more than half as wide again, and more than twice as far travelled'],
  dodge('_wary', 'wary', 'waryGap'), ['expect', '(r => r.rolls === r.n && r.count >= 0.38 * r.n && r.count <= 0.62 * r.n)(window._wary)', 'hurt, drawn on 200 times: it is wary, and about half the draws make it break away'],
  ['expect', '(r => r.runs === r.count && r.sideways === r.count && r.dist < 0.01 && r.forced === 1 && r.soon === 0 && r.later === 1)(window._wary)', 'each time side on to a new place, and not again at once'],
  // a bat is shot before it (the third arrow is to spare): what it turns into is still staggering in when the second
  // arrow lands
  batShot, ['expect', "(r => r.out === 'bat' && r.landed && r.vamp && r.vamp.ph === 'lie')(window._bat)", 'a bat shot down before the second arrow: it lies there, about to turn'],
  vampFar, ['expect', 'window._late.walking', 'it is up and on its way'],
  ['eval', 'const c = G.L.creature; G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300],   // (the view back on the thing)
  // the second arrow, with it free to break to one side as it comes (c.darts counting again) and the pointer kept on it;
  // and a bat under every aim, to show the thing comes first
  ['eval', 'G.L.creature.darts = 0; window._at = CLEARING_BATS.at; CLEARING_BATS.at = L => L.s.bats.find(b => !b.hit);'],
  nock, ['draw', 'full'], ['expect', last + " === 'hit'", 'drawn full with the pointer kept on it as it weaves and breaks away: it flies at it (and not at a bat, though one is under the aim)'],
  ['eval', 'CLEARING_BATS.at = window._at;'],
  ['wait', 1000], ['expect', 'G.L.creature.dead && G.L.creature.arrows.length === 2 && G.L.s.batsHit === 1', 'the second hit puts it down, two arrows in it (and none of them the bat\'s)'],
  vampLate,
  ['expect', "(r => r.ph === 'down' && r.after >= 1.95 && r.after <= 2.2 && r.off > r.stop + 3 && r.won)(window._late)", 'the vampire, still well short of the porch, collapses two seconds after the second arrow, and the night is won as ever'],
];
module.exports = {
  nightmare: noBow.concat(kinds, bat, spentAll, noArrows, kill),
};
