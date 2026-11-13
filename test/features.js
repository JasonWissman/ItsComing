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
  await page.goto(URL); await page.waitForTimeout(300);
  // the title: eyes in the dark, the name in IM Fell English, no intro or controls on it; How to play, Nights and
  // Settings open as dialogs over it, and it comes one step nearer each time one closes, never while you watch
  let tv = await page.evaluate(() => ({ st: G.state, ov: document.getElementById('overlay').className, gt: +G.t.toFixed(2), on: TITLE.on, step: TITLE.step, scene: document.body.classList.contains('titlescene'), intro: !!document.querySelector('#overlay .intro'), ctrls: !!document.querySelector('#overlay .controls'), font: getComputedStyle(document.querySelector('#overlay h1')).fontFamily }));
  check(tv.on && tv.scene && tv.step === 0 && !tv.intro && !tv.ctrls && /IM Fell English/.test(tv.font), 'the title is the eyes in the dark, in IM Fell English, with no intro or controls (' + JSON.stringify(tv) + ')');
  await page.waitForTimeout(1500);
  check(await page.evaluate(() => TITLE.step === 0), 'it does not come nearer while the title is watched');
  await page.click('#overlay button[data-act="howto"]'); await page.waitForTimeout(150);
  tv = await page.evaluate(() => ({ dlg: document.getElementById('overlay').classList.contains('dlg'), panel: !!document.querySelector('#overlay .panel .controls'), step: TITLE.step, state: G.state }));
  check(tv.dlg && tv.panel && tv.step === 0 && tv.state === 'title', 'How to play opens in a dialog with the controls in it, and the night does not start (' + JSON.stringify(tv) + ')');
  await page.click('#overlay .panel', { position: { x: 12, y: 12 } }); await page.waitForTimeout(150);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'howto'), 'a click in the dialog is not a click to begin');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  check(await page.evaluate(() => MENU.kind === 'title' && TITLE.step === 1), 'closing it, it is a step nearer');
  for (const act of ['nights', 'settings']) { await page.click('#overlay button[data-act="' + act + '"]'); await page.waitForTimeout(120); await page.click('#overlay button[data-act="back"]'); await page.waitForTimeout(120); }
  check(await page.evaluate(() => TITLE.step === 3 && G.state === 'title'), 'Nights and Settings each bring it a step nearer too');
  await page.click('#overlay button[data-act="begin"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.state !== 'title' && !document.body.classList.contains('titlescene')), 'Begin leaves the title, and its scene goes with it');
  await page.goto(URL); await page.waitForTimeout(300);

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
  // you begin it with nothing in your hands, and everything lies around you, to be taken up
  await T.open(page, 'level=13&go&seed=1&nofr');
  let v13 = await page.evaluate(() => ({ inv: G.inv.length, items: G.L.items.length, down: G.L.items.filter(i => !i.taken).length, rage: G.L.creature.rage, obj: G.L.objectiveText(), card: G.L.text.intro + ' ' + G.L.text.hint }));
  check(v13.inv === 0 && v13.items === 16 && v13.down === 16 && v13.rage === 0 && /Empty-handed/.test(v13.obj) && !/put (them|it|everything) down/i.test(v13.card), 'the last night begins empty-handed, everything you ever held lying around you, and nothing says you hold anything (' + JSON.stringify(v13) + ')');
  // the thing in the hood: calm, two pale points in the dark of it; holding anything, red eyes and a snarling mouth there, and
  // it comes on in fits (stopping dead, lurching, jerking aside, its head twitching); put down, calm again. What the view
  // shows round its face, close in: pale and no red, or red
  const look = () => page.evaluate(() => {
    const c = G.L.creature, u = G.L.update;
    G.L.update = dt => { u(dt); G.cam.pitch = G.cam.tPitch = -0.36; };   // (up at its face, held or not)
    G.cam.zoomHeld = true; G.mouse.x = -1; G.step(0.05, 24); G.cam.zoomHeld = false; G.L.update = u;
    const cp = c.pos(), fp = R.screenPos(cp.x, cp.y + c.yOff + CREATURES.demon.eyesY(c) - 0.06, cp.z), ctx = R.ctx || document.getElementById('game').getContext('2d');
    const dpr = ctx.canvas.width / R.W, x0 = Math.round((fp.x - 90) * dpr), y0 = Math.round((fp.y - 90 + R.viewY) * dpr), n = Math.round(180 * dpr), px = ctx.getImageData(x0, y0, n, n).data;
    let red = 0, pale = 0, dark = 0;
    for (let i = 0; i < px.length; i += 4) { const r = px[i], g = px[i + 1], b = px[i + 2]; if (r > 170 && g < 110 && b < 90) red++; else if (r > 150 && g > 150 && b > 140) pale++; if (r + g + b < 90) dark++; }
    return { red, pale, dark: +(dark / (px.length / 4)).toFixed(2) };
  });
  const jerks = () => page.evaluate(() => {
    const c = G.L.creature, t0 = c.t, pace = [], side = [], tilt = []; let jumps = 0;
    for (let i = 0; i < 120; i++) { c.t = t0 + i * 0.05; pace.push(CREATURES.demon.speedMult(c, 0.05, true) / (1 + 0.45 * c.anger)); side.push(CREATURES.demon.lateral(Object.assign({}, c, { dist: 10 }))); tilt.push(CREATURES.demon.tilt(c)); if (i && Math.abs(tilt[i] - tilt[i - 1]) > 0.08) jumps++; }
    c.t = t0;
    return { pace: [Math.min(...pace), Math.max(...pace)].map(v => +v.toFixed(2)), side: +(Math.max(...side) - Math.min(...side)).toFixed(2), jumps };
  });
  await page.evaluate(() => { const c = G.L.creature; c.switched = true; G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; c.u = 1 - Math.pow(3 / c.D0, 1 / c.gamma); G.step(0.05, 2); c.hold = c.dist; });
  const calmLook = await look(), calmFits = await jerks();
  check(calmLook.pale > 6 && calmLook.red === 0 && calmLook.dark > 0.5, 'empty-handed it is a dark hooded thing, nothing of its face to be seen but two pale eyes (' + JSON.stringify(calmLook) + ')');
  check(calmFits.pace[0] === 1 && calmFits.pace[1] === 1 && calmFits.side === 0 && calmFits.jumps <= 4, 'and it only walks, its head now and then to one side (' + JSON.stringify(calmFits) + ')');
  await page.evaluate(() => { pickup(G.L.items.find(i => i.id === 'hammer')); G.step(0.05, 20); });
  const rageLook = await look(), rageFits = await jerks();
  check(rageLook.red > 30 && rageLook.pale > 6, 'holding anything, its eyes burn red and a snarling mouth shows in the dark of its hood (' + JSON.stringify(rageLook) + ')');
  check(rageFits.pace[0] < 0.5 && rageFits.pace[1] > 1.6 && rageFits.side > 0.15 && rageFits.jumps >= 8, 'and it comes on in fits: stopping dead, lurching, jerking aside, its head twitching (' + JSON.stringify(rageFits) + ')');
  await page.evaluate(() => { G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive(); G.step(0.05, 40); });
  const againLook = await look(), againFits = await jerks();
  check(againLook.red === 0 && againLook.pale > 6 && againFits.side === 0 && againFits.pace[1] === 1, 'put down, it calms: two pale eyes again, and it walks (' + JSON.stringify([againLook, againFits]) + ')');
  await T.open(page, 'level=13&go&seed=1&nofr');
  await page.evaluate(() => { pickup(G.L.items[0]); G.L.creature.u = 0.985; G.step(0.05, 400); });
  check(await page.evaluate(() => G.state === 'dead' && !!G.deathScreen && /holding/.test(G.deathScreen.text)), 'reaching you with something in your hands is a death, and the line says so');
  check(await page.evaluate(() => document.documentElement.getAttribute('data-theme') !== 'day'), 'no morning for the one who held on');
  // empty-handed is not enough: turned away from it, or looking at the floor, as it reaches you is a death too
  for (const [how, cam] of [['turned away', 'G.cam.dirIdx = (dir + 2) % 8; G.cam.pitch = G.cam.tPitch = 0;'], ['looking at the floor', 'G.cam.dirIdx = dir; G.cam.pitch = G.cam.tPitch = PITCH_DOWN;']]) {
    await T.open(page, 'level=13&go&seed=1&nofr');
    await page.evaluate(cam => {
      G.L.creature.switched = true;   // it keeps to its way (it would change it once, unseen in the dark, far out)
      const dir = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8; new Function('dir', cam)(dir); G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG;
      G.L.creature.u = 0.985; G.step(0.05, 400);
    }, cam);
    check(await page.evaluate(() => G.inv.length === 0 && G.state === 'dead' && /craves your fear/.test(G.deathScreen.text) && !G.L.s.ending), 'empty-handed but ' + how + ' as it reaches you is a death, and the line says so');
  }
  await T.open(page, 'level=13&go&seed=1&nofr');
  const faced = await page.evaluate(() => {
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
    until(END.unveil[0] - 0.05); o.veiled = { unveil: c.unveil, mood: c.mood, wrap: +c.hug.wrap.toFixed(2) };   // its face still in the dark of the hood
    until(END.close[1] + 0.3); o.holding = c.hug && c.hug.wrists && c.hug.wrists.map(p => p.map(v => +v.toFixed(2)));
    until(END.moods + 0.3); o.unveiled = { unveil: c.unveil, mood: c.mood };   // and come out of it, angry
    const cp = c.pos(), face = cp.y + c.yOff + CREATURES.demon.eyesY(c), fp = R.screenPos(cp.x, face, cp.z);
    o.held = { reach: c.hug && c.hug.reach, wrap: c.hug && c.hug.wrap, dist: c.dist, h0, aim: Math.abs(wrapPi(c.yaw - G.cam.yaw)), faceY: fp && fp.y / R.H, faceX: fp && fp.x / R.W, mood: c.mood, overlay: s.hugWrap };
    // its moods: each whole one held a while, the changes between them slow, all of it while it still holds you
    const seen = []; let last = -1, prev = c.mood, down = false, release = null;
    while (s.endT < END.light[1]) {
      G.step(0.05, 1); o.flash = Math.max(o.flash, G.flashAmt); o.white = Math.max(o.white, G.white);
      const m = c.mood; if (m < prev - 1e-9) down = true; prev = m;
      if (Number.isInteger(m)) { if (seen.length && seen[seen.length - 1].m === m) seen[seen.length - 1].t1 = s.endT; else seen.push({ m, t0: s.endT, t1: s.endT, wrap: s.hugWrap, meadow: s.meadow }); }
      if (m === 7 && release === null) release = { meadow: s.meadow, wrap: s.hugWrap };
      if (seen.length && Number.isInteger(m)) last = m;
    }
    o.moods = seen.map(x => x.m); o.held2 = seen.filter(x => x.m >= 1 && x.m <= 6).every(x => x.t1 - x.t0 >= 0.8 && x.wrap > 0.99 && x.meadow === 0);
    o.blends = seen.slice(1).map((x, i) => +(x.t0 - seen[i].t1).toFixed(2)); o.down = down; o.happyFirst = release; o.last = last;
    return o;
  });
  check(hold.held.h0 && hold.held.h0.reach > 0 && hold.held.h0.reach < 0.5 && hold.held.h0.wrap === 0, 'it reaches out to you slowly (' + JSON.stringify(hold.held.h0) + ')');
  check(hold.reaching && hold.reaching.every(([x, y], i) => (i ? x > 0.6 && x < 0.9 : x > 0.1 && x < 0.4) && y > 0.45 && y < 0.85), 'its hands come up into the view, one each side of it, reaching for you (' + JSON.stringify(hold.reaching) + ')');
  check(hold.holding && hold.holding.every(([x, y], i) => (i ? x > 0.85 : x < 0.15) && y < 0.3), 'its arms come round the sides of the view, the hands in its top corners (' + JSON.stringify(hold.holding) + ')');
  check(hold.held.reach > 0.99 && hold.held.wrap > 0.99 && hold.held.overlay > 0.99 && hold.held.dist < 0.75, 'it stops close in front of you and its arms close round you (' + JSON.stringify(hold.held) + ')');
  check(hold.held.aim < 0.02 && hold.held.faceX > 0.4 && hold.held.faceX < 0.6 && hold.held.faceY > 0.1 && hold.held.faceY < 0.5, 'the view stays on its face (' + (hold.held.faceX || 0).toFixed(2) + ', ' + (hold.held.faceY || 0).toFixed(2) + ')');
  check(hold.veiled.unveil === 0 && hold.veiled.mood === 0 && hold.veiled.wrap > 0.3 && hold.unveiled.unveil === 1 && hold.unveiled.mood === 0, 'as its arms close round you its face is still in the dark of its hood; then it comes out of it, angry (' + JSON.stringify([hold.veiled, hold.unveiled]) + ')');
  const moodNames = await page.evaluate(() => CREATURES.demon.moodNames.join(', '));
  check(JSON.stringify(hold.moods) === '[0,1,2,3,4,5,6,7]' && moodNames === 'angry, neutral, angry, confused, sad, neutral, content, happy' && !hold.down && hold.held2, 'while it holds you its face goes through ' + moodNames + ', in that order, each held a while (' + JSON.stringify(hold.moods) + ')');
  check(hold.blends.every(b => b >= 0.7), 'each change of face is slow (' + hold.blends.join(', ') + ' s)');
  check(hold.happyFirst && hold.happyFirst.meadow === 0 && hold.happyFirst.wrap > 0.99, 'it is happy while it still holds you, before the light comes');
  check(hold.flash < 0.01 && hold.white < 0.01, 'nothing in it flashes');
  const meadow = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s;
    while (!s.wait) G.step(0.1, 1);
    const at = { meadow: s.meadow, hug: c.hug, dist: c.dist, yaw: Math.abs(wrapPi(c.yaw - G.L.facing)), ground: G.L.pal.ground.map(Math.round), sky: G.L.pal.skyTop.map(Math.round), room: s.room, mood: c.mood, view: Math.abs(wrapPi(G.cam.yaw - c.yaw)), pitch: G.cam.pitch };
    for (let i = 0; i < 600; i++) G.step(0.1, 1);   // a minute in the meadow
    return Object.assign(at, { after: { state: G.state, leaving: s.leaving, meadow: s.meadow, fade: c.fade } });
  });
  check(meadow.meadow === 1 && meadow.hug === null && meadow.mood === 7 && Math.abs(meadow.dist - 3.3) < 0.05 && meadow.yaw < 0.01 && meadow.view < 0.05 && Math.abs(meadow.pitch) < 0.05, 'it lets you go and stands, happy, a little way off in the meadow, and the view comes level on it');
  check(meadow.ground[1] > meadow.ground[0] + 40 && meadow.sky[2] > 200 && meadow.sky[2] > meadow.sky[0] + 80 && meadow.room === 0, 'green grass and a blue sky, and no room yet (' + JSON.stringify([meadow.ground, meadow.sky]) + ')');
  check(meadow.after.state === 'won' && !meadow.after.leaving && meadow.after.meadow === 1 && meadow.after.fade === 1, 'left alone, the meadow simply stays');
  for (const k of ['Alt', 'Meta', 'Shift', 'Control+Shift+KeyS', 'F2']) await page.keyboard.press(k);
  check(await page.evaluate(() => (G.step(0.1, 10), G.state === 'won' && !G.L.s.leaving && G.L.s.meadow === 1)), 'alt-tab, a screenshot\'s keys or a function key do not end the meadow');
  await shot(page, 'meadow');
  // in the meadow the view is yours, as in any night: the keys, the touch buttons and the pad turn it through the 8
  // directions, look down and up, and zoom while held, and none of that is the press that goes on
  const cam = () => page.evaluate(() => { G.step(0.05, 24); return { yaw: G.cam.yaw / DEG, dir: G.cam.dirIdx, pitch: G.cam.pitch, zoom: G.cam.zoom, leaving: G.L.s.leaving, state: G.state }; });
  const PITCH = await page.evaluate(() => PITCH_DOWN), deg = Math.PI / 180;
  const turned = (a, b, by) => { const d = (b.yaw - a.yaw - by) * deg; return Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < 2 * deg && !b.leaving && b.state === 'won'; };
  const looks = [];
  let c0 = await cam();
  for (const [k, by] of [['ArrowLeft', -45], ['ArrowLeft', -45], ['ArrowRight', 45], ['a', -45], ['d', 45], ['d', 45]]) { await page.keyboard.press(k); const c1 = await cam(); looks.push(k + ':' + turned(c0, c1, by)); c0 = c1; }
  for (const [k, p] of [['ArrowDown', PITCH], ['ArrowUp', 0], ['s', PITCH], ['w', 0]]) { await page.keyboard.press(k); const c1 = await cam(); looks.push(k + ':' + (Math.abs(c1.pitch - p) < 0.03 && !c1.leaving)); }
  for (const k of ['z', 'Shift', ' ']) { await page.keyboard.down(k); const c1 = await cam(); await page.keyboard.up(k); const c2 = await cam(); looks.push(k + ':' + (c1.zoom > 2.2 && c2.zoom < 1.2 && !c2.leaving)); }
  const touch = (id, type) => page.evaluate(([id, type]) => document.getElementById(id).dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true })), [id, type]);
  for (const [id, by] of [['tLeft', -45], ['tRight', 45]]) { await touch(id, 'pointerdown'); await touch(id, 'pointerup'); const c1 = await cam(); looks.push(id + ':' + turned(c0, c1, by)); c0 = c1; }
  await touch('tDown', 'pointerdown'); await touch('tDown', 'pointerup'); let c1 = await cam(); looks.push('tDown:' + (Math.abs(c1.pitch - PITCH) < 0.03 && !c1.leaving));
  await touch('tUp', 'pointerdown'); await touch('tUp', 'pointerup'); c1 = await cam(); looks.push('tUp:' + (Math.abs(c1.pitch) < 0.03 && !c1.leaving));
  await touch('tZoom', 'pointerdown'); c1 = await cam(); await touch('tZoom', 'pointerup'); let c2 = await cam(); looks.push('tZoom:' + (c1.zoom > 2.2 && c2.zoom < 1.2 && !c2.leaving));
  const pad = (b, on) => page.evaluate(([b, on]) => {
    if (!window._pad) window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) };
    navigator.getGamepads = () => [window._pad]; window._pad.buttons[b].pressed = on; pollGamepad(); navigator.getGamepads = () => [];
  }, [b, on]);
  c0 = await cam();
  await pad(14, true); await pad(14, false); c1 = await cam(); looks.push('pad left:' + turned(c0, c1, -45));
  await pad(13, true); await pad(13, false); c1 = await cam(); looks.push('pad down:' + (Math.abs(c1.pitch - PITCH) < 0.03 && !c1.leaving));
  await pad(12, true); await pad(12, false); c1 = await cam(); looks.push('pad up:' + (Math.abs(c1.pitch) < 0.03 && !c1.leaving));
  await pad(7, true); c1 = await cam(); await pad(7, false); c2 = await cam(); looks.push('pad zoom:' + (c1.zoom > 2.2 && c2.zoom < 1.2 && !c2.leaving));
  await page.evaluate(() => { delete window._pad; });
  check(looks.every(s => s.endsWith(':true')), 'in the meadow you turn, look down and up and zoom as in any night, by key, touch and pad, and the meadow still waits (' + looks.join(', ') + ')');
  // turned away and looking at the grass, a click still goes on, and the view is brought back to it as it goes
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown');
  c1 = await cam();
  const away = await page.evaluate(() => Math.abs(wrapPi(G.cam.yaw - G.L.creature.yaw)));
  check(away > 1.2 && c1.pitch > 0.7 && !c1.leaving, 'turned away from it and looking at the grass (' + away.toFixed(2) + ')');
  await page.mouse.click(640, 380);
  const left = await page.evaluate(() => { const s = G.L.s, o = { leaving: s.leaving }; G.step(0.05, 40); o.mid = { room: s.room, lv: s.lv, fade: G.L.creature.fade, state: G.state, view: +Math.abs(wrapPi(G.cam.yaw - G.L.creature.yaw)).toFixed(2), pitch: +G.cam.pitch.toFixed(2) }; for (let i = 0; i < 100 && G.state !== 'end'; i++) G.step(0.05, 1); return Object.assign(o, { state: G.state, room: s.room, eyeH: G.L.eyeH, kind: MENU.kind }); });
  check(left.leaving && left.mid.state === 'won' && left.mid.room > 0.2 && left.mid.room < 1 && left.mid.fade < 1 && left.mid.lv > 0.3, 'a click: the meadow and it fade away as the bedroom comes (' + JSON.stringify(left.mid) + ')');
  check(left.mid.view < 0.2 && Math.abs(left.mid.pitch) < 0.15, 'and the view comes back round to it, level, as the room comes');
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
  const held = await page.evaluate(() => { G.L.items.slice(0, 3).forEach(i => pickup(i)); G.step(0.05, 10); return G.inv.length; });
  await page.evaluate(() => { G.cam.pitch = G.cam.tPitch = PITCH_DOWN; G.step(0.05, 3); document.querySelector('#inventory .slot.active').click(); });
  check(await page.evaluate(n => G.inv.length === n - 1, held), 'tapping the held thing again while looking down puts it down');
  await page.evaluate(() => localStorage.clear());

  console.log('== what you hold, and a thing tried where it will not go ==');
  // the hand: the active thing is drawn held at the bottom right, clear of the aim, the hover line and the inventory
  const n1 = async () => { await T.open(page, 'level=1&go&seed=1&nofr'); await page.evaluate(() => { G.L.creature.hold = G.L.creature.dist; G.mouse.x = -1; G.cam.yaw = G.cam.tYaw = Math.PI; G.cam.dirIdx = 4; G.cam.pitch = G.cam.tPitch = 0; G.step(0.05, 2); }); };
  const take = id => `(() => { const it = G.L.items.find(i => i.id === '${id}' && !i.taken); pickup(it); return it; })()`;
  await n1();
  let hv = await page.evaluate(take => {
    const it = eval(take); G.step(0.05, 20);
    const b = G.hand.box, inv = document.getElementById('inventory').getBoundingClientRect(), o = { cur: G.hand.cur && G.hand.cur.id, up: G.hand.up, box: b && [b.x0, b.y0, b.x1, b.y1].map(Math.round) };
    o.clear = !!b && b.x0 > R.W / 2 + 0.1 * R.H && b.y0 > R.H * 0.3 && !(b.x0 < inv.right && b.x1 > inv.left && b.y1 > inv.top - R.viewY);
    o.same = it === G.hand.cur;
    return o;
  }, take('hammer'));
  check(hv.cur === 'hammer' && hv.same && hv.up === 1 && hv.clear, 'the thing picked up is held in the hand, at the bottom right, clear of the aim and the inventory (' + JSON.stringify(hv) + ')');
  await page.screenshot({ path: path.join(__dirname, 'shots', 'held.png') });
  // a new active thing: the old one goes down out of view, then the new one comes up
  hv = await page.evaluate(take => {
    eval(take); const seen = [];
    for (let i = 0; i < 30; i++) { G.step(0.02, 1); seen.push([G.hand.cur && G.hand.cur.id, +G.hand.up.toFixed(2)]); }
    const firstNails = seen.findIndex(s => s[0] === 'nails');
    return { seen: seen.filter((s, i) => i % 3 === 0), hammerDown: firstNails > 0 && seen.slice(0, firstNails).every((s, i, a) => s[0] === 'hammer' && (i === 0 || s[1] <= a[i - 1][1])), downTo: firstNails > 0 ? seen[firstNails - 1][1] : 1, up: seen[seen.length - 1] };
  }, take('nails'));
  check(hv.hammerDown && hv.downTo <= 0.1 && hv.up[0] === 'nails' && hv.up[1] === 1, 'a new active thing: the hammer goes down out of view, then the nails come up (' + JSON.stringify(hv.seen) + ')');
  // looking down it is lowered so it does not hide the floor; empty-handed the hand goes down out of view
  hv = await page.evaluate(() => {
    const y0 = G.hand.box.y0; G.cam.tPitch = PITCH_DOWN; G.step(0.05, 15); const y1 = G.hand.box ? G.hand.box.y0 : Infinity;
    G.cam.tPitch = 0; G.step(0.05, 15);
    while (G.inv.length) { G.cam.pitch = PITCH_DOWN; dropActive(); }
    G.cam.pitch = 0; G.step(0.05, 15);
    return { y0, y1, empty: G.hand.cur === null && G.hand.up === 0 && !G.hand.box };
  });
  check(hv.y1 > hv.y0 + 40 && hv.empty, 'looking down it is lowered (' + Math.round(hv.y0) + ' -> ' + Math.round(hv.y1) + '); with nothing in hand the hand is gone');
  // a wrong thing: it goes to the target, bumps it and comes back to the hand; nothing is lost
  await n1();
  hv = await page.evaluate(take => {
    const it = eval(take); G.step(0.05, 12);
    const door = G.L.targets.find(t => t.id === 'frontdoor'); useTarget(door);
    const fx = G.fumbling, o = { preset: fx && fx.preset, drop: fx && fx.drop, toast: G.lastToast.msg, phases: [], inInv: [], unseen: 0 };
    for (let i = 0; i < 80 && G.fumbling; i++) { G.step(0.025, 1); if (G.fumbling && o.phases[o.phases.length - 1] !== G.fumbling.phase) o.phases.push(G.fumbling.phase); if (G.fumbling && G.fumbling.phase !== 'wait' && !G.fumbling.pos) o.unseen++; o.inInv.push(G.inv.includes(it)); }
    G.step(0.05, 6);
    return Object.assign(o, { back: G.inv.includes(it) && it.taken && G.hand.cur === it && G.hand.up === 1 && !G.hand.gone, always: o.inInv.every(Boolean) });
  }, take('hammer'));
  check(hv.preset === 'return' && hv.drop === false && hv.phases.join() === 'out,contact,home' && hv.back && hv.always && hv.toast === 'Not with what you have.', 'a wrong thing goes to the doorway, bumps it and comes back to the hand, and the line is still said (' + JSON.stringify(hv) + ')');
  check(hv.unseen === 0, 'it is in the world from the first frame it leaves the hand: never a frame with it nowhere');
  // a thing missing what it needs (the planks without the hammer and nails): one plank goes up, will not stay, and falls to
  // the floor, where it can be seen and taken again; the rest of the pile stays in the hand
  await n1();
  hv = await page.evaluate(take => {
    const pile = eval(take); eval(take); eval(take); G.step(0.05, 12);
    const door = G.L.targets.find(t => t.id === 'frontdoor'); useTarget(door);
    const fx = G.fumbling, one = fx && fx.it, o = { preset: fx && fx.preset, drop: fx && fx.drop, uses: pile.uses, split: !!one && one !== pile && G.L.items.includes(one) };
    for (let i = 0; i < 120 && G.fumbling; i++) G.step(0.025, 1);
    o.landed = !!one && !one.taken && one.y === G.L.floor.y && !G.fumbling; o.pile = G.inv.includes(pile) && pile.uses === 2;
    // where it lies, looked at as a player would: facing its way and looking down, it is drawn and it is what a click there takes
    const yaw = Math.atan2(one.x, one.z); G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; G.step(0.05, 6);
    const h = [...R.hits].reverse().find(r => r.kind === 'item' && r.ref === one);
    o.seen = !!h && h.w > 6 && h.h > 4;
    if (h) { G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2; updateHover(); o.top = !!G.hover && G.hover.ref === one; o.at = { x: Math.round(G.mouse.x), y: Math.round(G.mouse.y) }; }
    window.__one = one;
    return o;
  }, take('planks'));
  check(hv.preset === 'slip' && hv.drop && hv.uses === 2 && hv.split && hv.pile, 'the planks with nothing to fix them: one plank goes up on the doorway, the rest stay in hand (' + JSON.stringify(hv) + ')');
  check(hv.landed && hv.seen && hv.top, 'it falls to the floor, where it is in sight and a click takes it');
  if (hv.at) { await page.mouse.click(hv.at.x, hv.at.y); await page.waitForTimeout(100); }
  check(await page.evaluate(() => window.__one.taken && G.inv.find(i => i.id === 'planks').uses === 3), 'clicked, it is picked up again and back on the pile');
  // fast clicks: one fumble, not one each
  await n1();
  hv = await page.evaluate(take => {
    const pile = eval(take); eval(take); eval(take); G.step(0.05, 12);
    const door = G.L.targets.find(t => t.id === 'frontdoor'), made = [];
    for (let i = 0; i < 5; i++) { useTarget(door); if (G.fumbling && !made.includes(G.fumbling)) made.push(G.fumbling); G.step(0.03, 1); }
    return { fumbles: made.length, uses: pile.uses, planks: G.L.items.filter(i => i.id === 'planks').length };
  }, take('planks'));
  check(hv.fumbles === 1 && hv.uses === 2, 'five fast clicks start one fumble, and only one plank leaves the pile (' + JSON.stringify(hv) + ')');
  // a slipping thing turns about the end it hangs from: that end stays where it is while the other end drops
  await n1();
  hv = await page.evaluate(take => {
    eval(take); G.step(0.05, 12);
    const door = G.L.targets.find(t => t.id === 'frontdoor'), o = {};
    for (const pivot of ['left', 'right']) {
      const fx = G.fumble(G.inv[G.active], door, { preset: 'slip', pivot, hold: 0.1, drop: false }), sg = pivot === 'left' ? -1 : 1, ends = [];
      for (let i = 0; i < 120 && fx.phase !== 'home'; i++) {
        G.step(0.01, 1);
        if (fx.phase !== 'contact' || fx.pt < 0.25) continue;
        const yaw = Math.atan2(fx.at.x, fx.at.z), hw = fx.it.w * fx.scale / 2, a = sg * hw * Math.cos(fx.rot), up = -sg * hw * Math.sin(fx.rot);   // (+ is clockwise on the view)
        ends.push({ hang: [fx.pos.x + Math.cos(yaw) * a, fx.pos.y + up], mid: fx.pos.y });
      }
      const f = ends[0], l = ends[ends.length - 1];
      o[pivot] = { hangMoved: +Math.hypot(l.hang[0] - f.hang[0], l.hang[1] - f.hang[1]).toFixed(3), midDrop: +(f.mid - l.mid).toFixed(3) };
      for (let i = 0; i < 80 && G.fumbling; i++) G.step(0.025, 1);
    }
    return o;
  }, take('planks'));
  check(['left', 'right'].every(p => hv[p].hangMoved < 0.08 && hv[p].midDrop > 0.25), 'a slipping plank hangs from the end it is meant to: that end stays put as the rest swings down (' + JSON.stringify(hv) + ')');
  // a decoy: it goes there, will not do, and drops (the rotten plank at a doorway, with the hammer and nails in hand: the night's
  // own onDecoy puts it up across the doorway, and it tears away from the nail and falls)
  await n1();
  hv = await page.evaluate(takes => {
    eval(takes[0]); eval(takes[1]); const rot = eval(takes[2]); G.step(0.05, 12);
    const u0 = G.L.creature.u; useTarget(G.L.targets.find(t => t.id === 'frontdoor'));
    const fx = G.fumbling, o = { preset: fx && fx.preset, drop: fx && fx.drop, held: G.hasItem('rotten'), cost: G.L.creature.u > u0, toast: G.lastToast.msg, handOut: true, after: null };
    for (let i = 0; i < 120 && G.fumbling; i++) {
      G.step(0.025, 1);
      if (G.fumbling && (G.fumbling.phase === 'out' || G.fumbling.phase === 'contact') && G.hand.cur !== rot) o.handOut = false;   // the hand stays out, open, while it is at the doorway
      if (G.fumbling && G.fumbling.phase === 'fall' && !o.after) o.after = 'fall';
    }
    G.step(0.05, 20);
    return Object.assign(o, { landed: !rot.taken && rot.y === G.L.floor.y, next: G.hand.cur && G.hand.cur.id });
  }, [take('hammer'), take('nails'), take('rotten')]);
  check(hv.preset === 'slip' && hv.drop && !hv.held && hv.cost && /rotten/i.test(hv.toast) && hv.landed, 'a thing that looks right and is not: it is tried at the doorway, will not do, and drops to the floor; it still costs time (' + JSON.stringify(hv) + ')');
  check(hv.handOut && hv.next === 'nails', 'the hand stays out, open, while it is at the doorway, and only once it has fallen does the next thing come up into it');
  // the house keys at the ignition (the second night): tried at a small target close by, they are drawn no bigger than the lock,
  // poke it with the blade, and drop into the car, where they lie to be taken again
  await T.open(page, 'level=2&go&seed=1&nofr');
  hv = await page.evaluate(() => {
    G.L.creature.hold = G.L.creature.dist; G.mouse.x = -1; G.cam.dirIdx = 0; G.cam.yaw = G.cam.tYaw = 0; G.cam.pitch = G.cam.tPitch = 0; G.step(0.05, 2);
    const keys = G.L.items.find(i => i.id === 'housekeys'); pickup(keys); G.step(0.05, 12);
    const ign = G.L.targets.find(t => t.id === 'ignition'); useTarget(ign);
    const fx = G.fumbling, o = { preset: fx && fx.preset, size: fx && +(fx.size * Math.max(keys.w, keys.h)).toFixed(3), lock: Math.max(ign.w, ign.h), tip: fx && fx.tip };
    for (let i = 0; i < 120 && G.fumbling; i++) { G.step(0.025, 1); if (G.fumbling && G.fumbling.phase === 'contact' && o.drawn === undefined) o.drawn = +(G.fumbling.scale * Math.max(keys.w, keys.h)).toFixed(3); }
    return Object.assign(o, { landed: !keys.taken && keys.y === G.L.floor.y && (q => pointInPoly(q[0], q[1], G.L.floor.poly))(rotY(keys.x, keys.z, -G.L.facing)) });
  });
  check(hv.preset === 'bump' && hv.drawn <= hv.lock + 1e-6 && !!hv.tip && hv.landed, 'the house keys at the ignition are drawn no bigger than the lock, led by the blade, and drop to the floor of the car (' + JSON.stringify(hv) + ')');
  // a doorway at the edge of the view: the plank goes to the part of it in view, not off the side to its middle
  await n1();
  hv = await page.evaluate(take => {
    eval(take); eval(take); G.cam.dirIdx = 3; G.cam.yaw = G.cam.tYaw = 3 * 45 * DEG; G.step(0.05, 12);
    const door = G.L.targets.find(t => t.id === 'frontdoor'), mid = R.screenPos(door.x, door.y + door.h / 2, door.z); useTarget(door);
    const at = G.fumbling && R.screenPos(G.fumbling.at.x, G.fumbling.at.y, G.fumbling.at.z), b = G.hand.box;
    return { mid: mid && Math.round(mid.x), at: at && [Math.round(at.x), Math.round(at.y)], inView: !!at && at.x > 0 && at.x < R.W && at.y > 0 && at.y < R.H, clearOfHand: !!at && !(b && at.x > b.x0 && at.x < b.x1 && at.y > b.y0 && at.y < b.y1) };
  }, take('planks'));
  check(hv.mid > 1280 * 0.94 && hv.inView && hv.clearOfHand, 'a doorway seen at the edge of the view: the plank goes up on the part of it in view, clear of what you hold (' + JSON.stringify(hv) + ')');
  // the empty hand: nothing to use, it goes up to the target and touches it, and comes back down
  await n1();
  hv = await page.evaluate(() => {
    const door = G.L.targets.find(t => t.id === 'frontdoor'); useTarget(door);
    const r = G.hand.reach, o = { reach: !!r && r.target === door, fumble: !!G.fumbling, toast: G.lastToast.msg };
    for (let i = 0; i < 50 && G.hand.reach; i++) { G.step(0.025, 1); if (door.touchedAt !== undefined) o.touched = true; }
    return Object.assign(o, { done: !G.hand.reach });
  });
  check(hv.reach && !hv.fumble && hv.touched && hv.done && hv.toast === 'Not with what you have.', 'with nothing in hand, the hand goes up to the doorway, touches it and goes back down (' + JSON.stringify(hv) + ')');
  // a night's own G.reach with something in hand: what it holds goes down, the empty hand does it, and it comes back up
  await n1();
  hv = await page.evaluate(take => {
    const ham = eval(take); G.step(0.05, 12);
    const door = G.L.targets.find(t => t.id === 'frontdoor'); G.reach(door, 'rattle');
    const o = { minUp: 1, touched: false };
    for (let i = 0; i < 60 && G.hand.reach; i++) { G.step(0.025, 1); o.minUp = Math.min(o.minUp, G.hand.up); if (door.touchedAt !== undefined) o.touched = true; }
    G.step(0.05, 12);
    return Object.assign(o, { back: G.hand.cur === ham && G.hand.up === 1 });
  }, take('hammer'));
  check(hv.minUp === 0 && hv.touched && hv.back, 'G.reach with the hammer in hand: the hammer goes down, the empty hand rattles the doorway, and the hammer comes back up (' + JSON.stringify(hv) + ')');
  // a target's own choice: t.onWrong instead of the fumble, t.fumble = false for none, G.refuse('bump') from inside use()
  await n1();
  hv = await page.evaluate(take => {
    const ham = eval(take); G.step(0.05, 12);
    const door = G.L.targets.find(t => t.id === 'frontdoor'), o = {};
    door.onWrong = it => { o.wrong = it.id; }; useTarget(door); o.noFumble = !G.fumbling;
    door.onWrong = undefined; door.fumble = false; useTarget(door); o.off = !G.fumbling;
    door.fumble = undefined; door.accepts = ['hammer']; door.requires = []; door.use = () => G.refuse('bump');
    useTarget(door); o.refused = G.fumbling && G.fumbling.preset; o.dropped = !G.inv.includes(ham);
    return o;
  }, take('hammer'));
  check(hv.wrong === 'hammer' && hv.noFumble && hv.off && hv.refused === 'bump' && hv.dropped, 'a target can take the case itself (onWrong), turn the fumble off, or refuse inside use() with a preset of its own (' + JSON.stringify(hv) + ')');
  // reduced motion: no sway, no bob, no lag as the view turns
  await n1();
  hv = await page.evaluate(take => {
    MENU.applySetting('reducedMotion', true); eval(take); G.step(0.05, 20);
    const b0 = JSON.stringify(G.hand.box); G.step(0.05, 13); const b1 = JSON.stringify(G.hand.box);
    onKeyDown({ key: 'ArrowRight', preventDefault() {} }); let lag = 0; for (let i = 0; i < 10; i++) { G.step(0.02, 1); lag = Math.max(lag, Math.abs(G.hand.sx), Math.abs(G.hand.sy)); }
    MENU.applySetting('reducedMotion', false);
    eval(take.replace('hammer', 'nails')); G.step(0.05, 20); const c0 = JSON.stringify(G.hand.box); G.step(0.05, 13); const c1 = JSON.stringify(G.hand.box);
    onKeyDown({ key: 'ArrowRight', preventDefault() {} }); let lag2 = 0; for (let i = 0; i < 10; i++) { G.step(0.02, 1); lag2 = Math.max(lag2, Math.abs(G.hand.sx)); }
    return { still: b0 === b1, lag, sways: c0 !== c1, lag2 };
  }, take('hammer'));
  check(hv.still && hv.lag === 0 && hv.sways && hv.lag2 > 0.005, 'with reduced motion the hand holds still, with no lag as the view turns; without it, it breathes and lags (' + JSON.stringify(hv) + ')');
  // six things in hand on the last night: the bar, held in both hands, stays in the bottom right, not over to the left of the
  // inventory in the middle of the bottom edge
  await T.open(page, 'level=13&go&seed=1&nofr');
  hv = await page.evaluate(() => {
    G.L.creature.hold = G.L.creature.dist; G.mouse.x = -1;
    pickup(G.L.items.find(i => i.id === 'beam')); G.L.items.filter(i => !i.taken).slice(0, 5).forEach(i => pickup(i));   // (taken up: you begin it with nothing)
    G.active = Math.max(0, G.inv.findIndex(i => i.id === 'beam')); G.step(0.05, 30);
    const b = G.hand.box, inv = document.getElementById('inventory').getBoundingClientRect();
    return { id: G.hand.cur && G.hand.cur.id, n: G.inv.length, box: b && [b.x0, b.y0, b.x1, b.y1].map(Math.round), right: !!b && b.x0 > R.W / 2 && b.x0 > inv.right - 4 };
  });
  check(hv.right, 'with the inventory full, what you hold stays in the bottom right (' + JSON.stringify(hv) + ')');
  // in front of something you could take it dips out of the way, and stays dipped: it does not shake up and down (the
  // boathouse, holding each thing in turn, looking each way)
  await T.open(page, 'level=6&go&seed=1&nofr');
  hv = await page.evaluate(() => {
    for (const c of G.L.creatures) c.hold = c.dist; G.mouse.x = -1; G.step(0.05, 2);
    for (const it of G.L.items.filter(i => !i.taken).slice(0, 3)) { pickup(it); G.step(0.05, 12); }
    let dipped = 0, worst = 0;
    for (let k = 0; k < G.inv.length; k++) {
      G.active = k; G.step(0.05, 12);
      for (let d = 0; d < 8; d++) {
        G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;
        const seq = []; for (let i = 0; i < 60; i++) { G.step(0.05, 1); seq.push(G.hand.dodge); }
        let flips = 0; for (let i = 2; i < seq.length; i++) { const a = Math.sign(seq[i] - seq[i - 1]), b = Math.sign(seq[i - 1] - seq[i - 2]); if (a && b && a !== b) flips++; }
        if (Math.max(...seq) > 0.5) dipped++; worst = Math.max(worst, flips);
      }
    }
    return { held: G.inv.map(i => i.id), dipped, worst };
  });
  check(hv.dipped > 0 && hv.worst <= 1, 'held in front of something you could take, it dips out of the way and stays there, without shaking (' + JSON.stringify(hv) + ')');
  // won, it is lowered out of the way of watching how it ends
  await n1();
  hv = await page.evaluate(take => { eval(take); G.step(0.05, 12); const up0 = G.hand.up; win(); G.step(0.05, 12); return { up0, up1: G.hand.up }; }, take('hammer'));
  check(hv.up0 === 1 && hv.up1 === 0, 'once the night is won the hand goes down out of view');
  // left for the title with a thing in the air: nothing of it is left behind the title
  await n1();
  hv = await page.evaluate(take => {
    eval(take); G.step(0.05, 12); useTarget(G.L.targets.find(t => t.id === 'frontdoor')); G.step(0.04, 12);
    const was = G.fumbling && G.fumbling.phase; showTitle(); G.step(0.05, 4);
    const o = { was, after: G.fumbling, cur: G.hand.cur, state: G.state }; MENU.clear(); return o;
  }, take('planks'));
  check(hv.was && !hv.after && !hv.cur && hv.state === 'title', 'quit to the title with a plank in the air: nothing is left in hand or in the air (' + JSON.stringify(hv) + ')');
  // on a phone, with the touch buttons in the bottom right (or on the left, the inventory there instead), it keeps clear of them
  for (const left of [false, true]) {
    const ctx2 = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const ph = await ctx2.newPage();
    await ph.goto(URL + '?level=1&go&seed=1&nofr'); await ph.waitForTimeout(300);
    const r = await ph.evaluate(([take, left]) => {
      MENU.applySetting('touchLeft', left);
      G.L.creature.hold = G.L.creature.dist; G.mouse.x = -1; G.cam.yaw = G.cam.tYaw = Math.PI; G.cam.pitch = G.cam.tPitch = 0;
      const out = [];
      for (const id of ['hammer', 'planks', 'nails', 'bottle']) {
        eval(take.replace('hammer', id)); G.step(0.05, 25);
        const b = G.hand.box, rect = id => { const r = document.getElementById(id).getBoundingClientRect(); return { x0: r.left, y0: r.top - R.viewY, x1: r.right, y1: r.bottom - R.viewY }; };
        const hit = (a, c) => a.x0 < c.x1 && a.x1 > c.x0 && a.y0 < c.y1 && a.y1 > c.y0;
        out.push({ id, shown: !!b && G.hand.up === 1, clear: !!b && !hit(b, rect('touch')) && !hit(b, rect('inventory')) && !hit(b, { x0: R.W / 2 - 40, y0: R.H / 2 - 40, x1: R.W / 2 + 40, y1: R.H / 2 + 40 }) });
      }
      return out;
    }, [take('hammer'), left]);
    check(r.every(x => x.shown && x.clear), 'on a phone' + (left ? ', touch controls on the left' : '') + ', what you hold keeps clear of the touch buttons, the inventory and the aim (' + JSON.stringify(r) + ')');
    await ph.screenshot({ path: path.join(__dirname, 'shots', 'held-phone' + (left ? '-left' : '') + '.png') });
    await ctx2.close();
  }

  if (errors.length) { failures++; console.log('PAGE ERRORS:\n' + errors.join('\n')); }
  console.log(failures ? ('\n' + failures + ' FAILURES') : '\nALL CHECKS PASSED');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
