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
  // on Nightmare it goes round to the open way, starting outside that way's barrier
  await page.goto(URL + '?level=4&go&seed=1&nofr'); await page.waitForTimeout(250);
  let sw = await page.evaluate(() => {
    const L = G.L, c = L.creature; c.switched = true;
    // look away from it, as a player locking one gate and turning to the other would, and draw a frame so seeing is real
    G.cam.yaw = G.cam.tYaw = c.yaw + Math.PI; G.cam.dirIdx = ((Math.round(G.cam.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.pitch = G.cam.tPitch = 0; G.step(0.001);
    const g = L.targets.find(t => t.id === (L.lane.idx === 0 ? 'gate' : 'backgate')); g.chained = true; g.locked = true; g.done = true;
    const from = c.lane.idx; c.u = 1 - Math.pow((L.barrierDist + 0.05) / c.D0, 1 / c.gamma);
    for (let k = 0; k < 200 && c.lane.idx === from && G.state === 'play'; k++) G.step(0.05);
    return { moved: c.lane.idx !== from, dist: c.dist, need: (c.lane.barrierDist || 0) + 3 - 0.05, held: c.hold !== null, state: G.state };
  });
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
      const o = { from, ran: false, seenRunning: false, hidden: false, arrived: null, ranIn: false, after: null, t0: L.t };
      L.onLaneSwitch = (cr, ln) => { o.arrived = { t: L.t - o.t0, dist: cr.dist, need: (ln.barrierDist || 0) + 3 - 0.05, held: cr.hold !== null, run: !!cr.runPose, lat: Math.abs(cr.lat) }; };
      const face = yaw => { G.cam.yaw = G.cam.tYaw = yaw; G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8; };
      for (let k = 0; k < 160 && G.state === 'play' && !o.after; k++) {
        if (c.round && c.round.t >= c.round.T1) face(c.round.to.yaw);   // once it is out of sight, turn to the other way, as a player would
        G.step(1 / 30);
        if (c.runPose) { o.ran = true; if (c.lane.idx === from) { if (c.seen && Math.abs(c.lat) > 0.3) o.seenRunning = true; if (!c.seen && c.visFrac === 0) o.hidden = true; } else if (c.seen) o.ranIn = true; }
        if (o.arrived && !c.round) o.after = { lat: c.lat, run: !!c.runPose, hold: c.hold, distFn: !!c.distFn, dist: c.dist };
      }
      return Object.assign(o, { state: G.state, lane: c.lane.idx });
    });
    const a = run.arrived || {};
    check(run.ran && run.seenRunning && run.hidden, 'night 3 (seed ' + seed + '): it runs sideways, seen, out of the salted way\'s view (seen ' + run.seenRunning + ', hidden ' + run.hidden + ')');
    check(!!run.arrived && run.lane !== run.from && a.dist >= a.need && !a.held && a.run && a.lat > 1.8 && a.t < 2.6, 'night 3 (seed ' + seed + '): it comes round to the other way outside its barrier, running, off to one side (' + JSON.stringify(a) + ')');
    check(run.ranIn && !!run.after && Math.abs(run.after.lat) < 1e-6 && !run.after.run && run.after.hold === null && !run.after.distFn && run.state === 'play', 'night 3 (seed ' + seed + '): it runs in across that way, then turns to it and walks on (' + JSON.stringify(run.after) + ')');
  }

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
