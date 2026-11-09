// Tests for the one game (no difficulty to pick), hint hiding, restart key and mute.
const { chromium } = require('playwright');
const path = require('path');
const T = require('./lib'); const URL = T.INDEX;
let failures = 0;
function check(cond, msg) { if (!cond) { failures++; console.log('  FAIL: ' + msg); } else console.log('  ok: ' + msg); }
const shot = (page, n) => page.screenshot({ path: path.join(__dirname, 'shots', n + '.png') });
async function face(page, d, down) {
  await page.evaluate(([d, down]) => { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; }, [d, !!down]);
  await page.waitForTimeout(120);
}
async function findHit(page, kind, id) {
  return page.evaluate(([kind, id]) => {
    const h = [...R.hits].reverse().find(h => h.kind === kind && h.ref.id === id);
    if (!h) return null;
    const x0 = Math.max(0, h.x), y0 = Math.max(0, h.y), x1 = Math.min(R.W, h.x + h.w), y1 = Math.min(R.H, h.y + h.h);
    if (x1 - x0 < 4 || y1 - y0 < 4) return null;
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, frac: ((x1 - x0) * (y1 - y0)) / (h.w * h.h) };
  }, [kind, id]);
}
// turn until the thing is best in frame, then hover it
async function lookFor(page, kind, id) {
  let best = null;
  for (const down of [true, false]) for (let d = 0; d < 8; d++) {
    await face(page, d, down);
    const r = await findHit(page, kind, id);
    if (r && (!best || r.frac > best.frac + 0.05)) best = { d, down, frac: r.frac };
    if (best && best.frac > 0.98) break;
  }
  if (!best) { failures++; console.log('  FAIL: could not find ' + id); return null; }
  await face(page, best.d, best.down);
  const r = await findHit(page, kind, id);
  await page.mouse.move(r.x, r.y); await page.waitForTimeout(150);
  return r;
}
const hoverHit = lookFor;
(async () => {
  const browser = await chromium.launch({ executablePath: require('./lib').CHROMIUM, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

  console.log('== one game, no difficulty to pick ==');
  await page.goto(URL); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.difficulty === 0 && DIFFICULTIES.length === 1 && G.diff().id === 'nightmare' && !document.querySelector('.diff, [data-diff]')), 'the title offers no difficulty: there is one game');
  await shot(page, 'title');
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  let v = await page.evaluate(() => ({ T: G.L.creature.T, um: G.L.creature.unseenMult, kicker: document.querySelector('.kicker').textContent, hasHint: !!document.querySelector('#overlay .hint'), intro: document.querySelector('#overlay .intro').textContent }));
  check(v.T > 80 * 0.6 * 0.88 && v.T < 80 * 0.6 * 1.12 && Math.abs(v.um - 1.35 * 1.4) < 1e-6, 'the time and unseen speed are Nightmare\'s (' + v.T.toFixed(1) + 's, x' + v.um.toFixed(2) + ')');
  check(/^Night 1 of \d+$/.test(v.kicker.trim()) && !v.hasHint && !/planks|hammer/i.test(v.intro), 'the card names the night only, with no objective and no solution hint (' + v.kicker + ')');
  await shot(page, 'card');
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  check(await page.evaluate(() => document.getElementById('objective').textContent === ''), 'no HUD objective');
  await page.evaluate(() => { G.L.lane = G.L.lanes[0]; G.L.creature.retarget(0); });   // the back door, wherever it was coming from
  await hoverHit(page, 'target', 'door');
  check(await page.evaluate(() => document.getElementById('tooltip').textContent === 'Back door'), 'a target\'s tooltip is just its name');
  await hoverHit(page, 'item', 'hammer');
  check(await page.evaluate(() => document.getElementById('tooltip').textContent === 'Hammer'), 'item names show');
  await face(page, 0, false);
  const r = await findHit(page, 'target', 'door');
  await page.mouse.click(r.x, r.y); await page.waitForTimeout(100);
  check(await page.evaluate(() => document.getElementById('toast').textContent === 'Not with what you have.'), 'failure feedback is vague');

  console.log('== restart key ==');
  const hh = await lookFor(page, 'item', 'hammer');
  await page.mouse.click(hh.x, hh.y); await page.waitForTimeout(100);
  await page.evaluate(() => { G.L.creature.u = 0.5; });
  check(await page.evaluate(() => G.inv.length === 1), 'holding the hammer before restart');
  await page.keyboard.press('r'); await page.waitForTimeout(300);
  // a restart rolls its way in again, and the view starts facing whichever way that is
  v = await page.evaluate(() => ({ s: G.state, inv: G.inv.length, dist: G.L.creature.dist, dir: G.cam.dirIdx, want: ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8, lvl: G.levelIndex }));
  check(v.s === 'play' && v.inv === 0 && v.dist > 100 && v.dir === v.want && v.lvl === 0, 'R restarts the level fresh (' + JSON.stringify(v) + ')');
  await page.evaluate(() => { G.L.creature.u = 0.995; }); await page.waitForTimeout(2600);
  check(await page.evaluate(() => G.state === 'dead'), 'died');
  await page.keyboard.press('R'); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.state === 'play' && G.L.creature.dist > 100), 'R on the death screen restarts too');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  await page.keyboard.press('r'); await page.waitForTimeout(200);
  check(await page.evaluate(() => G.state === 'play'), 'R from the pause screen restarts and resumes play');

  console.log('== menus ==');
  await T.open(page, 'level=2&go');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  check(await page.evaluate(() => G.state === 'paused' && MENU.kind === 'pause' && document.querySelectorAll('#overlay button[data-act]').length === 5 && document.activeElement && document.activeElement.dataset.act === 'resume'), 'pause menu with five focusable buttons, Resume focused');
  check(await page.evaluate(() => typeof AUDIO.suspend === 'function' && typeof AUDIO.setVolume === 'function'), 'audio exposes suspend and volume buses');
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(50);
  check(await page.evaluate(() => document.activeElement.dataset.act === 'nights'), 'arrow keys move between buttons');
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check(await page.evaluate(() => MENU.kind === 'nights' && document.querySelectorAll('.nrow').length === LEVELS.length), 'Enter opens the Nights screen listing every night');
  const unlockedRows = await page.evaluate(() => document.querySelectorAll('.nrow .nbtn').length);
  check(unlockedRows === await page.evaluate(() => G.unlocked + 1), 'only unlocked nights are playable (' + unlockedRows + ')');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  check(await page.evaluate(() => MENU.kind === 'pause' && G.state === 'paused'), 'Esc from Nights returns to the pause menu');
  await page.click('#overlay button[data-act="settings"]'); await page.waitForTimeout(150);
  check(await page.evaluate(() => MENU.kind === 'settings'), 'Settings opens from pause');
  await page.evaluate(() => { const r = document.querySelector('input[data-set="effects"]'); r.value = '0.3'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('label.opt input[data-set="reducedFlash"]'); await page.waitForTimeout(100);
  check(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('itscoming.v2')).settings; return Math.abs(s.effects - 0.3) < 1e-6 && s.reducedFlash === true && G.state === 'paused'; }), 'settings persist and changing them does not close the menu');
  await page.click('#overlay button[data-act="back"]'); await page.waitForTimeout(150);
  await page.click('#overlay button[data-act="title"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'title'), 'Back to title from pause');
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); d.settings.reducedFlash = false; localStorage.setItem('itscoming.v2', JSON.stringify(d)); });
  await page.reload(); await page.waitForTimeout(300);
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('itscoming.v2')).unlocked.nightmare >= 0 && !!document.querySelector('#overlay button[data-act="nights"]')), 'title has a Nights button');

  console.log('== mute ==');
  await page.evaluate(() => ensureAudio());
  check(await page.evaluate(() => AUDIO.on() && !AUDIO.muted), 'audio running, not muted');
  await page.click('#mute'); await page.waitForTimeout(100);
  check(await page.evaluate(() => G.muted && AUDIO.muted && document.getElementById('mute').textContent === 'muted (M)' && JSON.parse(localStorage.getItem('itscoming.v2')).settings.muted === true), 'clicking the button mutes the audio engine and saves the state');
  await page.keyboard.press('m'); await page.waitForTimeout(100);
  check(await page.evaluate(() => !G.muted && !AUDIO.muted), 'M unmutes');
  await page.goto(URL); await page.waitForTimeout(300);
  await page.click('#mute'); await page.waitForTimeout(100);
  check(await page.evaluate(() => G.state === 'title' && G.muted), 'mute button works on the title screen without starting the game');
  await page.reload(); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.muted && AUDIO.muted !== false || G.muted), 'mute state restored after reload');
  await page.evaluate(() => localStorage.clear());

  console.log('== captions, gamepad, touch ==');
  await page.goto(URL + '?level=1&go&seed=1'); await page.waitForTimeout(300);
  // read the caption in the same call as the sound, before the clock tick or anything else can replace it
  const cap = await page.evaluate(() => { ensureAudio(); MENU.applySetting('captions', true); AUDIO.sfx('bang', 0.9); const c = document.getElementById('caption'); return c.classList.contains('show') ? c.textContent : ''; });
  check(/boards/.test(cap) && /\u25B6/.test(cap), 'a captioned sound shows its line with a side marker (' + cap + ')');
  await page.evaluate(() => { MENU.applySetting('captions', false); document.getElementById('caption').classList.remove('caption'); });
  check(await page.evaluate(() => !!document.getElementById('tUse') && !!document.getElementById('tPause')), 'the touch pad has Use and Pause buttons');
  // a fake gamepad: the d-pad turns, A uses whatever is nearest the middle of the view, Start pauses
  await page.evaluate(() => {
    window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) };
    navigator.getGamepads = () => [window._pad];
  });
  const dir0 = await page.evaluate(() => G.cam.dirIdx);
  await page.evaluate(() => { window._pad.buttons[15].pressed = true; }); await page.waitForTimeout(80);
  await page.evaluate(() => { window._pad.buttons[15].pressed = false; }); await page.waitForTimeout(80);
  check(await page.evaluate(d => G.cam.dirIdx === (d + 1) % 8, dir0), 'the d-pad turns one step to the right');
  // the hammer is laid exactly where the middle of the downward view meets the floor, so it is the nearest thing there
  await page.evaluate(() => { const h = G.L.items.find(i => i.id === 'hammer'), y = G.cam.dirIdx * 45 * DEG, d = (G.L.eyeH - 0) / Math.tan(PITCH_DOWN); h.x = Math.sin(y) * d; h.z = Math.cos(y) * d; h.y = 0; G.cam.yaw = G.cam.tYaw = y; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; });
  await page.waitForTimeout(150);
  const w = await findHit(page, 'item', 'hammer');
  if (w) {
    await page.evaluate(() => { G.mouse.x = -1; G.mouse.y = -1; window._pad.buttons[0].pressed = true; }); await page.waitForTimeout(80);
    await page.evaluate(() => { window._pad.buttons[0].pressed = false; }); await page.waitForTimeout(80);
    check(await page.evaluate(() => G.inv.some(i => i.id === 'hammer')), 'A picks up the thing nearest the middle of the view');
  }
  await page.evaluate(() => { window._pad.buttons[9].pressed = true; }); await page.waitForTimeout(80);
  await page.evaluate(() => { window._pad.buttons[9].pressed = false; }); await page.waitForTimeout(80);
  check(await page.evaluate(() => G.state === 'paused'), 'Start pauses');
  await page.evaluate(() => { navigator.getGamepads = () => []; localStorage.clear(); });

  console.log('== sealed ways ==');
  // on Nightmare it goes round to the open way, starting outside that way's barrier. The Quarry's statue runs round the
  // yard to it, and only while nothing is looking at it: facing the open gate you see it come round and it stops dead,
  // mid-stride; look down and it goes on round
  await page.goto(URL + '?level=4&go&seed=1&nofr'); await page.waitForTimeout(250);
  let sw = await page.evaluate(() => {
    const L = G.L, c = L.creature; c.switched = true;
    // look away from it, as a player locking one gate and turning to the other would, and draw a frame so seeing is real
    G.cam.yaw = G.cam.tYaw = c.yaw + Math.PI; G.cam.dirIdx = ((Math.round(G.cam.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.pitch = G.cam.tPitch = 0; G.step(0.001);
    const g = L.targets.find(t => t.id === (L.lane.idx === 0 ? 'gate' : 'backgate')); g.chained = true; g.locked = true; g.done = true;
    const from = c.lane.idx; c.u = 1 - Math.pow((L.barrierDist + 0.05) / c.D0, 1 / c.gamma);
    for (let k = 0; k < 200 && !(c.runPose && c.seen) && c.lane.idx === from && G.state === 'play'; k++) G.step(0.05);
    const p0 = c.pos(), caught = !!c.runPose && c.seen && c.lane.idx === from;
    G.step(0.05, 20);
    const p1 = c.pos(), stood = caught && c.seen && Math.hypot(p1.x - p0.x, p1.z - p0.z) < 1e-6 && c.lane.idx === from;
    G.cam.pitch = G.cam.tPitch = PITCH_DOWN; G.step(0.001);   // looking down, at the ground in front of the open gate
    for (let k = 0; k < 200 && c.lane.idx === from && G.state === 'play'; k++) G.step(0.05);
    return { caught, stood, moved: c.lane.idx !== from, dist: c.dist, need: (c.lane.barrierDist || 0) + 3 - 0.05, held: c.hold !== null, state: G.state };
  });
  check(sw.caught && sw.stood, 'seen coming round to the open gate, the statue stops dead, mid-stride, and stays');
  check(sw.moved && !sw.held && sw.state === 'play', 'a locked gate sends it round to the open one');
  check(sw.dist >= sw.need, 'going round starts it outside the other gate (' + sw.dist.toFixed(2) + ' m)');
  // a creature that can run (drawRun: the smiler on night 3) goes round on its feet: it is seen sprinting sideways out of
  // the salted way's view, comes in at the other way 3 m outside its barrier running across it, then turns and walks on
  for (const seed of [1, 2]) {
    await page.goto(URL + '?level=3&go&seed=' + seed + '&nofr'); await page.waitForTimeout(250);
    const run = await page.evaluate(() => {
      const L = G.L, c = L.creature; c.switched = true;
      G.cam.yaw = G.cam.tYaw = c.yaw; G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.pitch = G.cam.tPitch = 0; G.step(0.001);
      const t = L.targets.find(t => t.id === (L.lane.idx === 0 ? 'threshold' : 'sidethreshold')); t.done = true; t.accepts = [];
      const from = c.lane.idx; c.u = 1 - Math.pow((L.barrierDist + 0.05) / c.D0, 1 / c.gamma);
      const o = { from, ran: false, seenRunning: false, hidden: false, arrived: null, ranIn: false, after: null, t0: L.t, outFrac: 0, outFrames: 0 };
      L.onLaneSwitch = (cr, ln) => { o.arrived = { t: L.t - o.t0, dist: cr.dist, need: (ln.barrierDist || 0) + 3 - 0.05, held: cr.hold !== null, run: !!cr.runPose, lat: Math.abs(cr.lat) }; };
      const face = yaw => { G.cam.yaw = G.cam.tYaw = yaw; G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8; };
      for (let k = 0; k < 160 && G.state === 'play' && !o.after; k++) {
        if (c.round && c.round.t >= c.round.T1) face(c.round.to.yaw);   // once it is out of sight, turn to the other way, as a player would
        G.step(1 / 30);
        if (c.runPose) { o.ran = true; if (c.lane.idx === from) { if (c.seen && Math.abs(c.lat) > 0.3) o.seenRunning = true; if (!c.seen && c.visFrac === 0) o.hidden = true; } else if (c.seen) o.ranIn = true; }
        if (o.arrived && !c.round) o.after = { lat: c.lat, run: !!c.runPose, hold: c.hold, distFn: !!c.distFn, dist: c.dist };
        // going round, out of sight: all of it as it is drawn running (runW, stride and all) is behind the frame of the way
        if (c.round && c.round.t >= c.round.T1 && c.round.t < c.round.T2) { o.outFrames++; o.outFrac = Math.max(o.outFrac, APPROACH.apertureFrac(c.lane, c.dist, c.lat, Math.max(c.CR.w, c.CR.runW || 0), c.CR.h, L.eyeH)); }
      }
      return Object.assign(o, { state: G.state, lane: c.lane.idx });
    });
    const a = run.arrived || {};
    check(run.ran && run.seenRunning && run.hidden, 'night 3 (seed ' + seed + '): it runs sideways, seen, out of the salted way\'s view (seen ' + run.seenRunning + ', hidden ' + run.hidden + ')');
    check(!!run.arrived && run.lane !== run.from && a.dist >= a.need && !a.held && a.run && a.lat > 1.8 && a.t < 2.6, 'night 3 (seed ' + seed + '): it comes round to the other way outside its barrier, running, off to one side (' + JSON.stringify(a) + ')');
    check(run.ranIn && !!run.after && Math.abs(run.after.lat) < 1e-6 && !run.after.run && run.after.hold === null && !run.after.distFn && run.state === 'play', 'night 3 (seed ' + seed + '): it runs in across that way, then turns to it and walks on (' + JSON.stringify(run.after) + ')');
    check(run.outFrames > 5 && run.outFrac === 0, 'night 3 (seed ' + seed + '): going round, no part of its run shows past the frame of the way it left (' + run.outFrames + ' frames, ' + run.outFrac.toFixed(3) + ' showing)');
  }
  // and the width it gives for its run (runW) holds all of the run as drawn, through a whole stride, both ways
  const runSpan = await page.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = 600; cv.height = 300; const ctx = cv.getContext('2d');
    const P = { col: c => 'rgb(' + c.join(',') + ')', cola: (c, a) => 'rgba(' + c.join(',') + ',' + a + ')', raw: c => 'rgb(' + c.join(',') + ')', t: 0 };
    const c = Object.assign({}, G.L.creature, { runPose: true, dist: 2.5, t: 1 });
    let far = 0;
    for (const dir of [1, -1]) for (let k = 0; k < 24; k++) {
      c.runDir = dir; c.runGait = k / 24 * TAU;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 600, 300); ctx.setTransform(100, 0, 0, -100, 300, 250);
      CREATURES.smiler.draw(ctx, c, P);
      const d = ctx.getImageData(0, 0, 600, 300).data;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 20) far = Math.max(far, Math.abs(((i >> 2) % 600 - 300) / 100));
    }
    return { far, half: CREATURES.smiler.runW / 2 };
  });
  check(runSpan.far > 0.5 && runSpan.far <= runSpan.half, 'the smiler\'s run is drawn within its runW (' + runSpan.far.toFixed(2) + ' m from the middle, half of runW ' + runSpan.half + ')');
  // night 3: a way is only finished with its salt and its lantern lit. With the way it comes by finished and the other one
  // bare, it comes up to the salt, looks down at it, and goes round to the bare one (it used to be able to stand there for
  // good); with the other one salted but its lantern dark it goes round to that one, and that line holds it only a while
  // before it steps over. Either way it never stands anywhere for long while the night is not won.
  const n3 = (seed, lane, other) => page.goto(URL + '?level=3&go&seed=' + seed + '&nofr').then(() => page.waitForTimeout(150)).then(() => page.evaluate(([lane, other]) => {
    const L = G.L, c = L.creature; c.switched = true;
    c.retarget(lane); L.laneIdx = lane; L.lane = c.lane; L.barrierDist = c.lane.barrierDist;
    const thr = idx => L.targets.find(t => t.id === (idx === 0 ? 'threshold' : 'sidethreshold')), hk = idx => L.targets.find(t => t.id === (idx === 0 ? 'hook' : 'hookE'));
    const salt = idx => { const t = thr(idx); t.done = true; t.count = 1; t.accepts = []; };
    const lamp = idx => { const h = hk(idx); h.hung = 'lantern'; h.lit = true; h.done = true; h.accepts = []; };
    salt(lane); lamp(lane); if (other === 'dark') salt(1 - lane);
    c.u = 1 - Math.pow((L.barrierDist + 1) / c.D0, 1 / c.gamma);
    const o = { held: [], bow: 0, round: null, stood: 0, still: 0, at: null };
    for (let k = 0; k < 30 * 14 && G.state === 'play'; k++) {
      G.cam.yaw = G.cam.tYaw = c.yaw; G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.pitch = G.cam.tPitch = 0;
      const p0 = c.pos(); G.step(1 / 30); const p1 = c.pos();
      if (c.sealHold && !o.held.includes(c.lane.idx)) o.held.push(c.lane.idx);
      if (c.sealHold && c.lane.idx === lane) o.bow = Math.max(o.bow, c.bow || 0);
      if (c.round && !o.round) o.round = { to: c.round.to.idx, d: c.dist, t: L.t };
      o.still = Math.hypot(p1.x - p0.x, p1.z - p0.z) < 1e-6 ? o.still + 1 / 30 : 0; o.stood = Math.max(o.stood, o.still);
    }
    return Object.assign(o, { state: G.state, lane: c.lane.idx, cause: G.deathCause, salted: L.sealed(L.lanes[lane]) });
  }, [lane, other]));
  for (const seed of [1, 2, 3]) for (const lane of [0, 1]) {
    const r = await n3(seed, lane, 'bare');
    check(r.held[0] === lane && r.bow > 0.95 && !!r.round && r.round.to === 1 - lane && r.round.d <= 2.61 && r.lane === 1 - lane && r.state === 'dying' && r.cause === 'open' && r.stood < 1,
      'night 3 (seed ' + seed + ', way ' + lane + ' finished, the other bare): it stops at the salt, looks down at it, goes round to the bare way and comes in there (' + JSON.stringify(r) + ')');
  }
  for (const seed of [1, 2]) {
    const r = await n3(seed, seed - 1, 'dark');
    check(r.held.join() === [seed - 1, 2 - seed].join() && !!r.round && r.round.to === 2 - seed && r.state === 'dying' && r.cause === 'unlit' && r.stood > 5 && r.stood < 6.5,
      'night 3 (seed ' + seed + ', one way finished, the other salted with its lantern dark): it goes round to the dark one, stands at its salt a while, then steps over (' + JSON.stringify(r) + ')');
  }
  // a lurch (the smiler hitches forward now and then) from just outside a salted way's line still stops at the line
  await page.goto(URL + '?level=3&go&seed=1&nofr'); await page.waitForTimeout(150);
  const lurch = await page.evaluate(() => {
    const L = G.L, c = L.creature; c.switched = true;
    const t = L.targets.find(t => t.id === (c.lane.idx === 0 ? 'threshold' : 'sidethreshold')); t.done = true; t.accepts = [];
    c.u = 1 - Math.pow((L.barrierDist + 0.3) / c.D0, 1 / c.gamma); c.hitchT = 0; G.step(1 / 60);
    const before = c.dist; c.hitchT = c.nextHitch; G.step(1 / 30);
    return { before, hold: c.hold, dist: c.dist, barrier: L.barrierDist, state: G.state, lurched: c.hitchFlash > 0 };
  });
  check(lurch.lurched && lurch.before > lurch.barrier && lurch.state === 'play' && lurch.hold === lurch.barrier && lurch.dist === lurch.barrier,'night 3: a lurch across a salted line in one frame is held at the line, not past it (' + JSON.stringify(lurch) + ')');

  console.log('== the death camera ==');
  await page.goto(URL + '?level=7&go&seed=1&nofr'); await page.waitForTimeout(250);
  const dc = await page.evaluate(() => { G.cam.pitch = G.cam.tPitch = PITCH_DOWN; const c = G.L.creature; c.u = 0.9995; G.step(0.05, 4); return { state: G.state, tPitch: G.cam.tPitch }; });
  check(dc.state === 'dying' && dc.tPitch === 0, 'on a lane below the rail the view comes up to meet it (' + dc.state + ')');

  console.log('== gamepad in menus, captions let clicks through ==');
  await page.goto(URL); await page.waitForTimeout(400);
  check(await page.evaluate(() => getComputedStyle(document.getElementById('caption')).pointerEvents === 'none'), 'the caption line never takes a click');
  await page.evaluate(() => {
    window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) };
    navigator.getGamepads = () => [window._pad];
    MENU.act('settings', 'title');
  });
  await page.waitForTimeout(450); // past the overlay's 350 ms arming, so a stray proceed() would really start the night
  const tap = async i => { await page.evaluate(i => { window._pad.buttons[i].pressed = true; }, i); await page.waitForTimeout(80); await page.evaluate(i => { window._pad.buttons[i].pressed = false; }, i); await page.waitForTimeout(80); };
  const cap0 = await page.evaluate(() => { document.querySelector('input[data-set="captions"]').focus(); return !!SAVE.data.settings.captions; });
  await tap(0);
  check(await page.evaluate(c0 => G.state === 'title' && MENU.kind === 'settings' && !!SAVE.data.settings.captions === !c0, cap0), 'A on a focused box ticks it and does not start the night');
  await page.evaluate(() => document.querySelector('input[data-set="master"]').focus());
  const vol0 = await page.evaluate(() => SAVE.data.settings.master);
  await tap(14);
  check(await page.evaluate(v => Math.abs(SAVE.data.settings.master - (v - 0.05)) < 1e-6 && MENU.kind === 'settings', vol0), 'left on a focused slider turns it down');
  await tap(0);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'settings'), 'A on a focused slider does nothing else');
  await tap(1);
  check(await page.evaluate(() => MENU.kind === 'title'), 'B goes back to the title');
  await page.evaluate(() => { navigator.getGamepads = () => []; localStorage.clear(); });

  console.log('== a v1 save keeps its progress ==');
  await page.goto(T.INDEX); await page.waitForTimeout(200);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('itscoming.unlocked', '3'); localStorage.setItem('itscoming.difficulty', '2'); });
  await page.goto(T.INDEX); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.difficulty === 0 && G.unlocked === 3 && !!document.querySelector('#overlay button[data-act="continue"]')), 'its progress is credited and Continue is offered');

  console.log('== saves with several difficulties fold into the one game ==');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('itscoming.v2', JSON.stringify({ v: 2, unlocked: { easy: 5, normal: 2, hard: 1, nightmare: 4 }, complete: { easy: true }, fragments: ['field'],
      best: { field: { easy: { time: 40, wins: 1, tries: 2 }, normal: { time: 31.5, wins: 2, tries: 3 }, hard: { time: 50, wins: 1, tries: 4 } } }, settings: { difficulty: 3, muted: true } }));
  });
  await page.goto(T.INDEX); await page.waitForTimeout(300);
  v = await page.evaluate(() => ({ d: G.difficulty, u: SAVE.data.unlocked, c: SAVE.data.complete, b: SAVE.data.best.field, m: SAVE.data.settings.muted, f: SAVE.data.fragments, s: SAVE.data.settings }));
  check(v.d === 0 && v.u.nightmare === 5 && Object.keys(v.u).length === 1 && v.c.nightmare === true && v.m && v.f[0] === 'field' && v.s.difficulty === undefined, 'a four-difficulty save: the furthest night reached on any of them, and the campaign complete (' + JSON.stringify(v.u) + ')');
  check(v.b.nightmare.time === 31.5 && v.b.nightmare.wins === 4 && v.b.nightmare.tries === 9 && Object.keys(v.b).length === 1, 'best time kept, wins and tries added up');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('itscoming.v2', JSON.stringify({ v: 3, unlocked: { normal: 6, nightmare: 2 }, complete: {}, fragments: [], best: { road: { normal: { time: 20, wins: 1, tries: 1 }, nightmare: { time: 25, wins: 1, tries: 3 } } }, settings: { difficulty: 1 } }));
  });
  await page.goto(T.INDEX); await page.waitForTimeout(300);
  v = await page.evaluate(() => ({ u: SAVE.data.unlocked, b: SAVE.data.best.road }));
  check(v.u.nightmare === 6 && v.b.nightmare.time === 20 && v.b.nightmare.wins === 2 && v.b.nightmare.tries === 4, 'a two-difficulty save folds the same way');
  await page.evaluate(() => localStorage.clear());

  console.log('== the last night, holding on ==');
  await T.open(page, 'level=13&go&seed=1&nofr');
  await page.evaluate(() => { G.L.creature.u = 0.985; G.step(0.05, 400); });
  check(await page.evaluate(() => G.state === 'dead' && !!G.deathScreen && /holding/.test(G.deathScreen.text)), 'reaching you with something in your hands is a death, and the line says so');
  check(await page.evaluate(() => document.documentElement.getAttribute('data-theme') !== 'day'), 'no morning for the one who held on');
  // empty-handed is not enough: turned away from it, or looking at the floor, as it reaches you is a death too
  for (const [how, cam] of [['turned away', 'G.cam.dirIdx = (dir + 2) % 8; G.cam.pitch = G.cam.tPitch = 0;'], ['looking at the floor', 'G.cam.dirIdx = dir; G.cam.pitch = G.cam.tPitch = PITCH_DOWN;']]) {
    await T.open(page, 'level=13&go&seed=1&nofr');
    await page.evaluate(cam => {
      for (const it of G.inv.slice()) { G.inv.splice(G.inv.indexOf(it), 1); it.taken = false; it.x = 0; it.z = 0.6; it.y = 0; }
      G.L.creature.switched = true;   // it keeps to its way (it would change it once, unseen in the dark, far out)   // nothing held, without the drop's own rules
      const dir = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; new Function('dir', cam)(dir); G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG;
      G.L.creature.u = 0.985; G.step(0.05, 400);
    }, cam);
    check(await page.evaluate(() => G.inv.length === 0 && G.state === 'dead' && /looked away/.test(G.deathScreen.text) && !G.L.s.ending), 'empty-handed but ' + how + ' as it reaches you is a death, and the line says so');
  }
  await T.open(page, 'level=13&go&seed=1&nofr');
  const faced = await page.evaluate(() => {
    for (const it of G.inv.slice()) { G.inv.splice(G.inv.indexOf(it), 1); it.taken = false; it.x = 0; it.z = 0.6; it.y = 0; }
      G.L.creature.switched = true;   // it keeps to its way (it would change it once, unseen in the dark, far out)
    G.cam.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;
    G.L.creature.u = 0.9; let up = 0;
    for (let i = 0; i < 600 && !G.L.won; i++) { G.step(0.05, 1); up = Math.min(up, G.cam.pitch); }
    return { won: G.L.won && G.L.s.ending, up };
  });
  check(faced.won && faced.up < -0.15, 'empty-handed and looking up at it as it reaches you is the ending (' + JSON.stringify(faced) + ')');
  // the ending, frame by frame: it holds you, its face goes through its moods to happy, the meadow comes and waits as long as
  // you like; a press, and the meadow and it fade into the bedroom and the last screen
  const caught = () => page.evaluate(() => {
    for (const it of G.inv.slice()) { G.inv.splice(G.inv.indexOf(it), 1); it.taken = false; it.x = 0; it.z = 0.6; it.y = 0; }
    G.L.creature.switched = true;
    G.cam.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;
    G.L.creature.u = 0.9; for (let i = 0; i < 600 && !G.L.won; i++) G.step(0.05, 1);
    return G.L.won && G.L.s.ending;
  });
  await T.open(page, 'level=13&go&seed=1&nofr');
  check(await caught(), 'it reached you, and it is the ending');
  const hold = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s, o = { flash: 0, white: 0 };
    const until = t => { while (s.endT < t - 1e-6) { G.step(1 / 30, 1); o.flash = Math.max(o.flash, G.flashAmt); o.white = Math.max(o.white, G.white); } };
    until(END.reach[0] + 0.5); const h0 = c.hug && { reach: c.hug.reach, wrap: c.hug.wrap };
    until(END.reach[1]); o.reaching = c.hug && c.hug.wrists && c.hug.wrists.map(p => p.map(v => +v.toFixed(2)));
    until(END.close[1] + 0.3); o.holding = c.hug && c.hug.wrists && c.hug.wrists.map(p => p.map(v => +v.toFixed(2)));
    const cp = c.pos(), face = cp.y + c.yOff + CREATURES.demon.eyesY(c), fp = R.screenPos(cp.x, face, cp.z);
    o.held = { reach: c.hug && c.hug.reach, wrap: c.hug && c.hug.wrap, dist: c.dist, h0, aim: Math.abs(wrapPi(c.yaw - G.cam.yaw)), faceY: fp && fp.y / R.H, faceX: fp && fp.x / R.W, mood: c.mood, overlay: s.hugWrap };
    // its moods: each whole one held a while, the changes between them slow, all of it while it still holds you
    const seen = []; let last = -1, prev = c.mood, down = false, release = null;
    while (s.endT < END.light[1]) {
      G.step(0.05, 1); o.flash = Math.max(o.flash, G.flashAmt); o.white = Math.max(o.white, G.white);
      const m = c.mood; if (m < prev - 1e-9) down = true; prev = m;
      if (Number.isInteger(m)) { if (seen.length && seen[seen.length - 1].m === m) seen[seen.length - 1].t1 = s.endT; else seen.push({ m, t0: s.endT, t1: s.endT, wrap: s.hugWrap, meadow: s.meadow }); }
      if (m === 6 && release === null) release = { meadow: s.meadow, wrap: s.hugWrap };
      if (seen.length && Number.isInteger(m)) last = m;
    }
    o.moods = seen.map(x => x.m); o.held2 = seen.filter(x => x.m >= 1 && x.m <= 5).every(x => x.t1 - x.t0 >= 0.6 && x.wrap > 0.99 && x.meadow === 0);
    o.blends = seen.slice(1).map((x, i) => +(x.t0 - seen[i].t1).toFixed(2)); o.down = down; o.happyFirst = release; o.last = last;
    return o;
  });
  check(hold.held.h0 && hold.held.h0.reach > 0 && hold.held.h0.reach < 0.5 && hold.held.h0.wrap === 0, 'it reaches out to you slowly (' + JSON.stringify(hold.held.h0) + ')');
  check(hold.reaching && hold.reaching.every(([x, y], i) => (i ? x > 0.6 && x < 0.9 : x > 0.1 && x < 0.4) && y > 0.45 && y < 0.85), 'its hands come up into the view, one each side of it, reaching for you (' + JSON.stringify(hold.reaching) + ')');
  check(hold.holding && hold.holding.every(([x, y], i) => (i ? x > 0.85 : x < 0.15) && y < 0.3), 'its arms come round the sides of the view, the hands in its top corners (' + JSON.stringify(hold.holding) + ')');
  check(hold.held.reach > 0.99 && hold.held.wrap > 0.99 && hold.held.overlay > 0.99 && hold.held.dist < 0.75, 'it stops close in front of you and its arms close round you (' + JSON.stringify(hold.held) + ')');
  check(hold.held.aim < 0.02 && hold.held.faceX > 0.4 && hold.held.faceX < 0.6 && hold.held.faceY > 0.1 && hold.held.faceY < 0.5, 'the view stays on its face (' + (hold.held.faceX || 0).toFixed(2) + ', ' + (hold.held.faceY || 0).toFixed(2) + ')');
  check(JSON.stringify(hold.moods) === '[0,1,2,3,4,5,6]' && !hold.down && hold.held2, 'while it holds you its face goes through rage, anguish, fear, sorrow and calm, each held a while, and ends happy (' + JSON.stringify(hold.moods) + ')');
  check(hold.blends.every(b => b >= 0.5), 'each change of face is slow (' + hold.blends.join(', ') + ' s)');
  check(hold.happyFirst && hold.happyFirst.meadow === 0 && hold.happyFirst.wrap > 0.99, 'it is happy while it still holds you, before the light comes');
  check(hold.flash < 0.01 && hold.white < 0.01, 'nothing in it flashes');
  const meadow = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s;
    while (!s.wait) G.step(0.1, 1);
    const at = { meadow: s.meadow, hug: c.hug, dist: c.dist, yaw: Math.abs(wrapPi(c.yaw - G.L.facing)), ground: G.L.pal.ground.map(Math.round), sky: G.L.pal.skyTop.map(Math.round), room: s.room, mood: c.mood, view: Math.abs(wrapPi(G.cam.yaw - c.yaw)), pitch: G.cam.pitch };
    for (let i = 0; i < 600; i++) G.step(0.1, 1);   // a minute in the meadow
    return Object.assign(at, { after: { state: G.state, leaving: s.leaving, meadow: s.meadow, fade: c.fade } });
  });
  check(meadow.meadow === 1 && meadow.hug === null && meadow.mood === 6 && Math.abs(meadow.dist - 3.3) < 0.05 && meadow.yaw < 0.01 && meadow.view < 0.05 && Math.abs(meadow.pitch) < 0.05, 'it lets you go and stands, happy, a little way off in the meadow, and the view comes level on it');
  check(meadow.ground[1] > meadow.ground[0] + 40 && meadow.sky[2] > 200 && meadow.sky[2] > meadow.sky[0] + 80 && meadow.room === 0, 'green grass and a blue sky, and no room yet (' + JSON.stringify([meadow.ground, meadow.sky]) + ')');
  check(meadow.after.state === 'won' && !meadow.after.leaving && meadow.after.meadow === 1 && meadow.after.fade === 1, 'left alone, the meadow simply stays');
  for (const k of ['Alt', 'Meta', 'Shift', 'Control+Shift+KeyS', 'F2']) await page.keyboard.press(k);
  check(await page.evaluate(() => (G.step(0.1, 10), G.state === 'won' && !G.L.s.leaving && G.L.s.meadow === 1)), 'alt-tab, a screenshot\'s keys or a function key do not end the meadow');
  await shot(page, 'meadow');
  await page.mouse.click(640, 380);
  const left = await page.evaluate(() => { const s = G.L.s, o = { leaving: s.leaving }; G.step(0.05, 40); o.mid = { room: s.room, lv: s.lv, fade: G.L.creature.fade, state: G.state }; for (let i = 0; i < 100 && G.state !== 'end'; i++) G.step(0.05, 1); return Object.assign(o, { state: G.state, room: s.room, eyeH: G.L.eyeH, kind: MENU.kind }); });
  check(left.leaving && left.mid.state === 'won' && left.mid.room > 0.2 && left.mid.room < 1 && left.mid.fade < 1 && left.mid.lv > 0.3, 'a click: the meadow and it fade away as the bedroom comes (' + JSON.stringify(left.mid) + ')');
  check(left.state === 'end' && left.room === 1 && Math.abs(left.eyeH - 1.15) < 0.01 && left.kind === 'ending', 'the bedroom in the morning, and the last screen');
  check(await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'day' && /faced your demons/i.test(UI.overlay.textContent) && !!document.querySelector('#overlay button[data-act="again"]') && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true), 'the light theme, faced your demons, Play again, the campaign complete');
  await shot(page, 'ending');
  // a press while it still holds you does nothing; in the meadow a key (R too: it goes on, it does not start the night
  // again), A on a pad, or the touch Use button goes on, just as a click does
  for (const [how, press] of [['a key (R)', async () => page.keyboard.press('r')], ['A on a pad', async () => page.evaluate(() => {
    window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad];
    window._pad.buttons[0].pressed = true; pollGamepad(); window._pad.buttons[0].pressed = false; pollGamepad(); navigator.getGamepads = () => [];
  })], ['the touch Use button', async () => page.evaluate(() => document.getElementById('tUse').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })))]]) {
    await T.open(page, 'level=13&go&seed=2&nofr');
    await caught();
    const L0 = await page.evaluate(() => { while (G.L.s.endT < END.moods + 1) G.step(0.1, 1); return G.L.s.endT; });
    await press();
    const early = await page.evaluate(() => ({ leaving: G.L.s.leaving, state: G.state, ending: G.L.s.ending }));
    await page.evaluate(() => { while (G.L.s.endT < END.arm + 0.5) G.step(0.1, 1); });
    const L1 = await page.evaluate(() => (window._L = G.L, G.L.s.endT));
    await press();
    const later = await page.evaluate(() => ({ leaving: G.L.s.leaving, same: window._L === G.L, state: G.state }));
    check(L0 > 5 && !early.leaving && early.state === 'won' && early.ending && L1 > 20 && later.leaving && later.same && later.state === 'won', how + ': nothing while it holds you; in the meadow it goes on (' + JSON.stringify([early, later]) + ')');
  }
  // with reduced motion it does not dance, tremble or sway, and the ending still comes to the last screen
  await T.open(page, 'level=13&go&seed=1&nofr');
  await page.evaluate(() => MENU.applySetting('reducedMotion', true));
  await caught();
  const still = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s; let dance = 0;
    while (!s.wait || s.endT < END.dance[1] + 9) { G.step(0.1, 1); dance = Math.max(dance, c.dance); }
    const o = { still: c.still, dance };
    G.L.onPress(); for (let i = 0; i < 100 && G.state !== 'end'; i++) G.step(0.05, 1);
    return Object.assign(o, { state: G.state });
  });
  check(still.still === true && still.dance === 0 && still.state === 'end', 'with reduced motion it stands still in the meadow, and the ending still ends (' + JSON.stringify(still) + ')');
  await page.evaluate(() => MENU.applySetting('reducedMotion', false));
  // tapping the held thing again while looking down puts it down
  await T.open(page, 'level=13&go&seed=1&nofr');
  const held = await page.evaluate(() => G.inv.length);
  await page.evaluate(() => { G.cam.pitch = G.cam.tPitch = PITCH_DOWN; G.step(0.05, 3); document.querySelector('#inventory .slot.active').click(); });
  check(await page.evaluate(n => G.inv.length === n - 1, held), 'tapping the held thing again while looking down puts it down');
  await page.evaluate(() => localStorage.clear());

  if (errors.length) { failures++; console.log('PAGE ERRORS:\n' + errors.join('\n')); }
  console.log(failures ? ('\n' + failures + ' FAILURES') : '\nALL CHECKS PASSED');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
