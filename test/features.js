// Tests for difficulty, hint hiding, restart key and mute.
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
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

  console.log('== difficulty picker ==');
  await page.goto(URL); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.difficulty === 1), 'defaults to Normal');
  check(await page.evaluate(() => document.querySelectorAll('.diff').length === 4 && document.querySelector('.diff.sel').textContent.includes('Normal')), 'four buttons, Normal highlighted');
  await shot(page, 'title-diff');
  await page.click('.diff[data-diff="0"]'); await page.waitForTimeout(150);
  check(await page.evaluate(() => G.state === 'title' && G.difficulty === 0 && JSON.parse(localStorage.getItem('itscoming.v2')).settings.difficulty === 0), 'clicking Easy selects it without starting the game, and saves it');
  await page.keyboard.press('3'); await page.waitForTimeout(100);
  check(await page.evaluate(() => G.difficulty === 2 && document.querySelector('.diff.sel').textContent.includes('Hard')), 'key 3 selects Hard');
  await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  let v = await page.evaluate(() => ({ T: G.L.creature.T, um: G.L.creature.unseenMult, kicker: document.querySelector('.kicker').textContent, hasHint: !!document.querySelector('#overlay .hint'), intro: document.querySelector('#overlay .intro').textContent }));
  check(v.T > 80 * 0.72 * 0.92 && v.T < 80 * 0.72 * 1.08 && Math.abs(v.um - 1.35 * 1.25) < 1e-6, 'Hard scales time and unseen speed (' + v.T.toFixed(1) + 's, x' + v.um.toFixed(2) + ')');
  check(v.kicker.includes('Hard') && !v.hasHint && !/planks|hammer/i.test(v.intro), 'Hard card shows no objective and no solution hint');
  await shot(page, 'card-hard');
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  check(await page.evaluate(() => document.getElementById('objective').textContent === ''), 'HUD objective hidden on Hard');
  await hoverHit(page, 'target', 'door');
  check(await page.evaluate(() => document.getElementById('tooltip').textContent === 'Back door'), 'target tooltip is just the name on Hard');
  await hoverHit(page, 'item', 'hammer');
  check(await page.evaluate(() => document.getElementById('tooltip').textContent === 'Hammer'), 'item names still show');
  await face(page, 0, false);
  const r = await findHit(page, 'target', 'door');
  await page.mouse.click(r.x, r.y); await page.waitForTimeout(100);
  check(await page.evaluate(() => document.getElementById('toast').textContent === 'Not with what you have.'), 'failure feedback is vague on Hard');

  console.log('== easy shows hints ==');
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); d.settings.difficulty = 0; localStorage.setItem('itscoming.v2', JSON.stringify(d)); });
  await page.goto(URL + '?level=1'); await page.waitForTimeout(300);
  v = await page.evaluate(() => ({ d: G.difficulty, T: G.L.creature.T, hasHint: !!document.querySelector('#overlay .hint'), intro: document.querySelector('#overlay .intro').textContent }));
  check(v.d === 0 && v.T > 80 * 1.35 * 0.92 && v.T < 80 * 1.35 * 1.08, 'difficulty restored from storage, Easy gives more time (' + v.T.toFixed(1) + 's)');
  check(v.hasHint && /planks/.test(v.intro), 'Easy card shows the objective and the hint');
  await shot(page, 'card-easy');
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  check(await page.evaluate(() => document.getElementById('objective').textContent.startsWith('Board up')), 'HUD objective visible on Easy');
  await hoverHit(page, 'target', 'door');
  check(await page.evaluate(() => /plank/.test(document.getElementById('tooltip').textContent)), 'target tooltip gives the hint on Easy');

  console.log('== restart key ==');
  const hh = await lookFor(page, 'item', 'hammer');
  await page.mouse.click(hh.x, hh.y); await page.waitForTimeout(100);
  await page.evaluate(() => { G.L.creature.u = 0.5; });
  check(await page.evaluate(() => G.inv.length === 1), 'holding the hammer before restart');
  await page.keyboard.press('r'); await page.waitForTimeout(300);
  v = await page.evaluate(() => ({ s: G.state, inv: G.inv.length, dist: G.L.creature.dist, dir: G.cam.dirIdx, lvl: G.levelIndex }));
  check(v.s === 'play' && v.inv === 0 && v.dist > 100 && v.dir === 0 && v.lvl === 0, 'R restarts the level fresh (' + JSON.stringify(v) + ')');
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
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('itscoming.v2')).unlocked.normal >= 0 && !!document.querySelector('#overlay button[data-act="nights"]')), 'title has a Nights button');

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
  await page.evaluate(() => { ensureAudio(); MENU.applySetting('captions', true); AUDIO.sfx('bang', 0.9); });
  await page.waitForTimeout(80);
  check(await page.evaluate(() => { const c = document.getElementById('caption'); return c.classList.contains('show') && /boards/.test(c.textContent) && /\u25B6/.test(c.textContent); }), 'a captioned sound shows its line with a side marker');
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
  const w = await hoverHit(page, 'item', 'hammer');
  if (w) {
    await page.evaluate(() => { G.mouse.x = -1; G.mouse.y = -1; window._pad.buttons[0].pressed = true; }); await page.waitForTimeout(80);
    await page.evaluate(() => { window._pad.buttons[0].pressed = false; }); await page.waitForTimeout(80);
    check(await page.evaluate(() => G.inv.some(i => i.id === 'hammer')), 'A picks up the thing nearest the middle of the view');
  }
  await page.evaluate(() => { window._pad.buttons[9].pressed = true; }); await page.waitForTimeout(80);
  await page.evaluate(() => { window._pad.buttons[9].pressed = false; }); await page.waitForTimeout(80);
  check(await page.evaluate(() => G.state === 'paused'), 'Start pauses');
  await page.evaluate(() => { navigator.getGamepads = () => []; localStorage.clear(); });

  console.log('== the last night, holding on ==');
  await T.open(page, 'level=13&go&seed=1&diff=normal&nofr');
  await page.evaluate(() => { G.L.creature.u = 0.985; G.step(0.05, 400); });
  check(await page.evaluate(() => G.state === 'dead' && !!G.deathScreen && /holding/.test(G.deathScreen.text)), 'reaching you with something in your hands is a death, and the line says so');
  check(await page.evaluate(() => document.documentElement.getAttribute('data-theme') !== 'day'), 'no morning for the one who held on');
  // tapping the held thing again while looking down puts it down
  await T.open(page, 'level=13&go&seed=1&diff=normal&nofr');
  await page.evaluate(() => { G.cam.pitch = G.cam.tPitch = PITCH_DOWN; G.step(0.05, 3); document.querySelector('#inventory .slot.active').click(); });
  check(await page.evaluate(() => G.inv.length === 2), 'tapping the held thing again while looking down puts it down');
  await page.evaluate(() => localStorage.clear());

  if (errors.length) { failures++; console.log('PAGE ERRORS:\n' + errors.join('\n')); }
  console.log(failures ? ('\n' + failures + ' FAILURES') : '\nALL CHECKS PASSED');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
