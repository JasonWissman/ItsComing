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

  console.log('== a new game opens with the prologue ==');
  await page.goto(URL); await page.waitForTimeout(300);
  await page.evaluate(() => { window.PROLOGUE_TEST = true; });
  check(await page.evaluate(() => AUDIO.running() && !!AUDIO.bed && AUDIO.bed.title && AUDIO.bed.k === 0), 'on load, with nothing pressed, the sound is going and the title\'s drone is fading in (where the browser lets it: here it does)');
  await page.click('#overlay button[data-act="begin"]'); await page.waitForTimeout(2600);
  check(await page.evaluate(() => !AUDIO.bed && PROLOGUE_FADE >= 4), 'Begin: the prologue is silent, the title\'s drone let go to fade slowly away under it');
  const pro1 = await page.evaluate(() => { const el = document.getElementById('prologue'); return el && { lines: [...el.querySelectorAll('p')].map(p => p.textContent), on: [...el.querySelectorAll('p')].map(p => p.classList.contains('on')), st: G.state }; });
  await page.waitForTimeout(5000);
  const pro2 = await page.evaluate(() => [...document.querySelectorAll('#prologue p')].map(p => p.classList.contains('on')));
  await page.waitForTimeout(6800);
  const pro3 = await page.evaluate(() => ({ gone: !document.getElementById('prologue'), st: G.state, kicker: (document.querySelector('.kicker') || {}).textContent }));
  check(pro1 && /good night.s sleep in ages/.test(pro1.lines[0]) && /visits you in your dreams/.test(pro1.lines[1]) && pro1.on[0] && !pro1.on[1] && !pro2[0] && pro2[1] && pro3.gone && pro3.st === 'card' && /Night 1/.test(pro3.kicker), 'Begin: black, the first line alone, then it goes and the second comes alone, then night 1\'s card (' + JSON.stringify([pro1, pro2, pro3]) + ')');
  await page.goto(URL); await page.waitForTimeout(300);
  await page.evaluate(() => { window.PROLOGUE_TEST = true; });
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  for (const k of ['Enter', ' ', 'Escape', 'm', 'r']) await page.keyboard.press(k);
  await page.mouse.click(640, 380); await page.mouse.click(200, 120); await page.waitForTimeout(1700);
  check(await page.evaluate(() => !!document.getElementById('prologue') && G.state === 'title' && !G.muted && MENU.kind === 'title'), 'no click or key skips the prologue, or gets through it to the game (no mute, no restart, the title still under it)');
  console.log('== Begin: the warning about flashing lights first ==');
  await page.goto(URL); await page.waitForTimeout(300);
  await page.evaluate(() => { window.DISCLAIMER_TEST = true; window.PROLOGUE_TEST = true; });
  await page.click('#overlay button[data-act="begin"]'); await page.waitForTimeout(700);
  let dw = await page.evaluate(() => { const d = document.getElementById('disclaimer'), b = d && d.querySelector('button'), p = d && d.querySelector('p'), cs = e => getComputedStyle(e), r = b && b.getBoundingClientRect();
    return d && { text: p.textContent, color: cs(p).color, font: cs(p).fontFamily, bg: cs(d).backgroundColor, z: +cs(d).zIndex, icon: !!d.querySelector('svg.deye'), iconAbove: d.querySelector('svg.deye').getBoundingClientRect().bottom <= p.getBoundingClientRect().top, label: b.textContent, bbg: cs(b).backgroundColor, bfg: cs(b).color, focus: document.activeElement === b, inView: r.top >= 0 && r.bottom <= innerHeight, role: d.getAttribute('role'), st: G.state, pro: !!document.getElementById('prologue'), drone: !!AUDIO.bed }; });
  check(dw && dw.text === 'This game contains bright, flashing lights and imagery that may cause discomfort and/or seizures for those with photosensitive epilepsy. Player discretion is advised.' && dw.color === 'rgb(208, 32, 42)' && /IM Fell English/.test(dw.font) && dw.bg === 'rgb(0, 0, 0)' && dw.z >= 1000 && dw.icon && dw.iconAbove && dw.label === 'Accept' && dw.bbg === 'rgb(208, 32, 42)' && dw.bfg === 'rgb(0, 0, 0)' && dw.focus && dw.inView && dw.role === 'alertdialog' && dw.st === 'title' && !dw.pro && dw.drone, 'Begin: first the warning, red on black under an eye struck through, a solid red Accept with black letters, focused; no prologue yet, the title\'s drone still going (' + JSON.stringify(dw) + ')');
  for (const k of ['Escape', 'm', 'Tab', 'ArrowDown']) await page.keyboard.press(k);
  await page.mouse.click(100, 100); await page.waitForTimeout(300);
  dw = await page.evaluate(() => ({ up: !!document.getElementById('disclaimer'), focus: document.activeElement === document.querySelector('#disclaimer button'), muted: G.muted, st: G.state, menu: MENU.kind, pro: !!document.getElementById('prologue') }));
  check(dw.up && dw.focus && !dw.muted && dw.st === 'title' && dw.menu === 'title' && !dw.pro, 'nothing but Accept gets past it: other keys and a click off it do nothing, and Tab keeps to Accept (' + JSON.stringify(dw) + ')');
  await page.keyboard.press('Enter'); await page.waitForTimeout(1600);
  dw = await page.evaluate(() => ({ up: !!document.getElementById('disclaimer'), pro: !!document.getElementById('prologue'), st: G.state }));
  check(!dw.up && dw.pro && dw.st === 'title', 'Enter accepts it, and the prologue comes on (' + JSON.stringify(dw) + ')');
  await page.goto(URL); await page.waitForTimeout(300);
  await page.evaluate(() => { window.DISCLAIMER_TEST = true; });
  await page.click('#overlay button[data-act="begin"]'); await page.waitForTimeout(600);
  await page.click('#disclaimer button'); await page.waitForTimeout(1300);
  check(await page.evaluate(() => !document.getElementById('disclaimer') && G.state === 'card' && /Night 1/.test(document.querySelector('.kicker').textContent)), 'a click on Accept goes on (here past the prologue, as the tests do) to night 1\'s card');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.state === 'title'), 'back to the title');
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  check(await page.evaluate(() => !!document.getElementById('disclaimer')), 'and a new game begun again shows the warning again');
  {
    const ctx = await browser.newContext({ viewport: { width: 740, height: 360 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }), mp = await ctx.newPage();
    await mp.goto(URL); await mp.waitForTimeout(300);
    await mp.evaluate(() => { window.DISCLAIMER_TEST = true; });
    await mp.tap('#overlay button[data-act="begin"]'); await mp.waitForTimeout(700);
    const r = await mp.evaluate(() => { const d = document.getElementById('disclaimer'), b = d.querySelector('button').getBoundingClientRect(), p = d.querySelector('p').getBoundingClientRect(); return { fits: d.scrollHeight <= d.clientHeight + 1, b: [b.top, b.bottom, b.height], p: [p.left, p.right], w: innerWidth, h: innerHeight }; });
    check(r.fits && r.b[0] >= 0 && r.b[1] <= r.h && r.b[2] >= 44 && r.p[0] >= 16 && r.p[1] <= r.w - 16, 'on a phone it all fits, Accept a full-size target (' + JSON.stringify(r) + ')');
    await mp.screenshot({ path: path.join(__dirname, 'shots', 'phone-warning.png') });
    await mp.tap('#disclaimer button'); await mp.waitForTimeout(1300);
    check(await mp.evaluate(() => !document.getElementById('disclaimer') && G.state === 'card'), 'a tap on Accept goes on');
    await ctx.close();
  }
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
  // the pause menu: no line under the heading, short labels, one narrow column of buttons all of a width, and Mute in it
  v = await page.evaluate(() => {
    const bs = [...document.querySelectorAll('#overlay button[data-act]')];
    return { labels: bs.map(b => b.textContent).join(','), widths: [...new Set(bs.map(b => Math.round(b.getBoundingClientRect().width)))], intro: !!document.querySelector('#overlay .intro'), text: document.getElementById('overlay').textContent };
  });
  check(v.labels === 'Resume,Restart,Settings,Mute,Quit' && v.widths.length === 1 && v.widths[0] <= 260 && !v.intro && !/It is not/.test(v.text), 'pause: Resume, Restart, Settings, Mute, Quit (no Nights: no night is picked mid-game), all one narrow width, nothing under the heading (' + JSON.stringify(v) + ')');
  await page.click('#overlay button[data-act="mute"]'); await page.waitForTimeout(80);
  check(await page.evaluate(() => G.muted && G.state === 'paused' && document.querySelector('#overlay button[data-act="mute"]').textContent === 'Unmute'), 'Mute in the pause menu mutes, stays paused, and its label turns to Unmute');
  await page.keyboard.press('m'); await page.waitForTimeout(80);
  check(await page.evaluate(() => !G.muted && document.querySelector('#overlay button[data-act="mute"]').textContent === 'Mute'), 'M while paused unmutes, and the button follows');
  await page.evaluate(() => document.querySelector('#overlay button[data-act="resume"]').focus());
  check(await page.evaluate(() => typeof AUDIO.suspend === 'function' && typeof AUDIO.setVolume === 'function'), 'audio exposes suspend and volume buses');
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(50);
  check(await page.evaluate(() => document.activeElement.dataset.act === 'settings'), 'arrow keys move between buttons');
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  check(await page.evaluate(() => MENU.kind === 'settings'), 'Settings opens from pause');
  await page.evaluate(() => { const r = document.querySelector('input[data-set="effects"]'); r.value = '0.3'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('label.opt input[data-set="reducedFlash"]'); await page.waitForTimeout(100);
  check(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('itscoming.v2')).settings; return Math.abs(s.effects - 0.3) < 1e-6 && s.reducedFlash === true && G.state === 'paused'; }), 'settings persist and changing them does not close the menu');
  await page.click('#overlay button[data-act="back"]'); await page.waitForTimeout(150);
  await page.click('#overlay button[data-act="title"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'title'), 'Back to title from pause');
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); d.settings.reducedFlash = false; localStorage.setItem('itscoming.v2', JSON.stringify(d)); });
  await page.reload(); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.unlocked === 0 && !document.querySelector('#overlay button[data-act="nights"]')), 'with no night survived yet, the title has no Scores button: there is nothing to show');
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); d.unlocked.nightmare = 3; localStorage.setItem('itscoming.v2', JSON.stringify(d)); });
  await page.reload(); await page.waitForTimeout(300);
  check(await page.evaluate(() => !!document.querySelector('#overlay button[data-act="nights"]') && [...document.querySelectorAll('#overlay button[data-act]')].map(b => b.dataset.act).join() === 'begin,nights,howto,settings' && document.querySelector('#overlay button[data-act="nights"]').textContent === 'Scores'), 'with a night survived, the title has a Scores button; Begin is the only way in (no Continue)');
  check(await page.evaluate(() => { const f = document.querySelector('#overlay .fine'), a = f && f.querySelector('a'); return /^created by jason wissman$/.test(f.textContent) && a && a.textContent === 'jason wissman' && a.href === 'https://jasonwissman.com/'; }), 'the line under the title credits jason wissman, linked to jasonwissman.com');
  await page.goto(URL); await page.waitForTimeout(300);
  await page.keyboard.press('c'); await page.waitForTimeout(400);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'title' && G.unlocked === 3 && ![...document.querySelectorAll('#overlay button[data-act]')].some(b => b.dataset.act === 'continue')), 'no Continue, and C does not continue from a later night (' + await page.evaluate(() => G.state + ' ' + G.levelIndex + ' ' + MENU.kind) + ')');
  await page.goto(URL); await page.waitForTimeout(300);
  // the title: eyes in the dark, the name in IM Fell English, no intro or controls on it; How to play, Nights and
  // Settings open as dialogs over it, and it comes one step nearer each time one closes, never while you watch
  let tv = await page.evaluate(() => ({ st: G.state, ov: document.getElementById('overlay').className, gt: +G.t.toFixed(2), on: TITLE.on, step: TITLE.step, scene: document.body.classList.contains('titlescene'), intro: !!document.querySelector('#overlay .intro'), ctrls: !!document.querySelector('#overlay .controls'), font: getComputedStyle(document.querySelector('#overlay h1')).fontFamily }));
  check(tv.on && tv.scene && tv.step === 0 && !tv.intro && !tv.ctrls && /IM Fell English/.test(tv.font), 'the title is the eyes in the dark, in IM Fell English, with no intro or controls (' + JSON.stringify(tv) + ')');
  await page.waitForTimeout(1500);
  check(await page.evaluate(() => TITLE.step === 0), 'it does not come nearer while the title is watched');
  await page.click('#overlay button[data-act="howto"]'); await page.waitForTimeout(150);
  tv = await page.evaluate(() => ({ dlg: document.getElementById('overlay').classList.contains('dlg'), panel: !!document.querySelector('#overlay .panel .howcards'), step: TITLE.step, state: G.state,
    cards: [...document.querySelectorAll('#overlay .hcard .hwhat')].map(e => e.textContent).join(','), keys: [...document.querySelectorAll('#overlay .hcard')].map(c => c.querySelectorAll('kbd').length).join(','),
    borders: [...document.querySelectorAll('#overlay .hcard, #overlay .hkeys, #overlay .hwhat')].some(e => { const c = getComputedStyle(e); return parseFloat(c.borderTopWidth) || parseFloat(c.borderBottomWidth); }),
    cols: getComputedStyle(document.querySelector('#overlay .howcards')).gridTemplateColumns.split(' ').length }));
  check(tv.dlg && tv.panel && tv.step === 0 && tv.state === 'title', 'How to play opens in a dialog with the controls in it, and the night does not start (' + JSON.stringify(tv) + ')');
  check(tv.cards === 'Look around,Zoom in,Interact,Pause' && tv.keys === '8,2,1,1' && !tv.borders && tv.cols === 2, 'How to play is four cards, two by two, with no borders: Look around, Zoom in, Interact, Pause, each drawn as its keys (' + JSON.stringify(tv) + ')');
  await page.click('#overlay .panel', { position: { x: 12, y: 12 } }); await page.waitForTimeout(150);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'howto'), 'a click in the dialog is not a click to begin');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  check(await page.evaluate(() => MENU.kind === 'title' && TITLE.step === 1), 'closing it, it is a step nearer');
  for (const act of ['nights', 'settings']) { await page.click('#overlay button[data-act="' + act + '"]'); await page.waitForTimeout(120); await page.click('#overlay button[data-act="back"]'); await page.waitForTimeout(120); }
  check(await page.evaluate(() => TITLE.step === 3 && G.state === 'title'), 'Nights and Settings each bring it a step nearer too');
  // a click on the dark of the title does not begin: it scuttles at you to its next place, in plain sight
  await page.waitForTimeout(400);
  await page.mouse.click(640, 120); await page.waitForTimeout(120);
  tv = await page.evaluate(() => ({ D: TITLE.D, st: G.state, step: TITLE.step, moving: TITLE.moving, d: TITLE.dist, lit: (() => { const c = document.getElementById('titleScene'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let m = 0; for (let i = 0; i < d.length; i += 4 * 97) m = Math.max(m, d[i] + d[i + 1] + d[i + 2]); return m; })() }));
  check(tv.st === 'title' && tv.step === 4 && tv.moving && tv.d < tv.D[3] && tv.d > tv.D[4] && tv.lit > 30, 'a click on the title\'s dark does not begin the night; it comes a step nearer, scuttling there in view (no blink) (' + JSON.stringify(tv) + ')');
  await page.waitForTimeout(600);
  check(await page.evaluate(() => G.state === 'title' && TITLE.step === 4 && !TITLE.moving && TITLE.dist === TITLE.D[4]), 'and in under half a second it is there, where the step puts it');
  // two steps more and it is bent down over you, its head low and nearer than the rest of it; then no nearer
  tv = await page.evaluate(() => { const o = []; for (let i = 0; i < 4; i++) { MENU.act('howto'); MENU.act('back', 'title'); o.push(TITLE.step); } return { steps: o, n: TITLE.STEPS, near: TITLE.near }; });
  check(tv.n === 6 && tv.steps.join() === '5,6,6,6' && tv.near === 1, 'two more steps, to the closest, and it stays there (' + JSON.stringify(tv) + ')');
  await page.mouse.click(640, 120); await page.waitForTimeout(60);
  check(await page.evaluate(() => TITLE.step === 6 && !TITLE.moving && TITLE.dist === TITLE.D[6]), 'at its nearest a click on the dark does not move it (it twitches where it is)');
  check(await page.evaluate(() => /^IM Fell English/.test(getComputedStyle(document.body).fontFamily.replace(/["']/g, '')) && /IM Fell English/.test(getComputedStyle(document.querySelector('#overlay .mbtn')).fontFamily)), 'the body and the buttons are in IM Fell English too');
  tv = await page.evaluate(() => { const b = document.querySelector('#overlay button[data-act="begin"]'), o = document.querySelector('#overlay button[data-act="howto"]'), c = e => getComputedStyle(e); return { prim: b.classList.contains('primary'), bg: c(b).backgroundColor, fg: c(b).color, other: c(o).backgroundColor }; });
  check(tv.prim && tv.bg === 'rgb(239, 230, 210)' && /^rgb\((\d|1\d),/.test(tv.fg) && tv.other !== tv.bg, 'Begin is drawn inverted, light with dark letters, unlike the rest (' + JSON.stringify(tv) + ')');
  await page.click('#overlay button[data-act="begin"]'); await page.waitForTimeout(300);
  check(await page.evaluate(() => G.state !== 'title' && !document.body.classList.contains('titlescene')), 'Begin leaves the title, and its scene goes with it');
  await page.goto(URL); await page.waitForTimeout(300);

  console.log('== erasing progress asks first ==');
  await page.click('#overlay button[data-act="settings"]'); await page.waitForTimeout(120);
  await page.click('#overlay button[data-act="reset"]'); await page.waitForTimeout(120);
  tv = await page.evaluate(() => ({ kind: MENU.kind, box: !!document.querySelector('#overlay .confirm .cpanel'), h: (document.querySelector('#overlay .confirm h2') || {}).textContent, focus: document.activeElement && document.activeElement.dataset.act, u: G.unlocked, under: !!document.querySelector('#overlay .panel .settings') }));
  check(tv.kind === 'settings' && tv.box && tv.h === 'Erase all progress?' && tv.focus === 'keep' && tv.u === 3 && tv.under, 'Erase opens a small dialog of its own over Settings, Cancel focused, nothing erased yet (' + JSON.stringify(tv) + ')');
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(50);
  check(await page.evaluate(() => document.activeElement && document.activeElement.dataset.act === 'keep'), 'the keys stay inside the little dialog');
  await page.click('#overlay .confirm button[data-act="keep"]'); await page.waitForTimeout(120);
  check(await page.evaluate(() => MENU.kind === 'settings' && !document.querySelector('#overlay .confirm') && G.unlocked === 3), 'Cancel closes it and erases nothing');
  await page.click('#overlay button[data-act="reset"]'); await page.waitForTimeout(120);
  await page.keyboard.press('Escape'); await page.waitForTimeout(120);
  check(await page.evaluate(() => MENU.kind === 'settings' && !document.querySelector('#overlay .confirm') && G.unlocked === 3), 'Esc closes it, back to Settings, erasing nothing');
  await page.click('#overlay button[data-act="reset"]'); await page.waitForTimeout(120);
  await page.click('#overlay .confirm button[data-act="erase"]'); await page.waitForTimeout(200);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'title' && G.unlocked === 0 && !document.querySelector('#overlay button[data-act="nights"]')), 'Erase erases, and the title is back with no Nights');

  console.log('== the Nights screen ==');
  await page.evaluate(() => localStorage.setItem('itscoming.v2', JSON.stringify({ v: 4, unlocked: { nightmare: 9 }, complete: {}, bestRun: { nightmare: 1234.5 }, best: { field: { nightmare: { time: 41.2, wins: 3, tries: 5 } } }, settings: {} })));
  await page.goto(URL); await page.waitForTimeout(300);
  await page.click('#overlay button[data-act="nights"]'); await page.waitForTimeout(200);
  tv = await page.evaluate(() => {
    const p = document.querySelector('#overlay .panel'), cards = [...document.querySelectorAll('#overlay .ncard')], r = c => c.getBoundingClientRect();
    return { fits: p.scrollHeight <= p.clientHeight + 1, open: document.querySelectorAll('#overlay .ncard.shown').length, btns: [...document.querySelectorAll('#overlay button')].map(b => b.dataset.act).join(), tab: cards.filter(c => c.tabIndex >= 0 || c.matches('button, [data-act]')).length, cursor: getComputedStyle(cards[0]).cursor, cols: new Set(cards.map(c => Math.round(r(c).left))).size, seventh: Math.round(r(cards[6]).top) === Math.round(r(cards[0]).top) && Math.round(r(cards[5]).left) === Math.round(r(cards[0]).left) && Math.round(r(cards[6]).left) > Math.round(r(cards[0]).left),
      best: (cards[0].querySelector('.nbest') || {}).textContent, run: document.querySelector('#overlay .runcard .rtime').textContent, label: document.querySelector('#overlay .runcard .rlabel').textContent,
      frag: !!document.querySelector('#overlay button[data-act="fragments"]'), bottom: Math.round(r(p).bottom) <= innerHeight };
  });
  check(tv.open === 10 && tv.btns === 'back' && tv.tab === 0 && tv.cursor === 'default', 'the Nights screen only shows: its cards are not buttons, nothing to press but Back (' + JSON.stringify(tv) + ')');
  const bg0 = await page.evaluate(() => getComputedStyle(document.querySelector('#overlay .ncard')).backgroundColor);
  await page.hover('#overlay .ncard'); await page.waitForTimeout(250);
  check(await page.evaluate(b => getComputedStyle(document.querySelector('#overlay .ncard')).backgroundColor === b, bg0), 'and a card does not light up under the pointer');
  await page.click('#overlay .ncard'); await page.waitForTimeout(150);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'nights'), 'a click on a card starts nothing');
  check(tv.fits && tv.bottom && tv.open === 10 && tv.cols === 2 && tv.seventh, 'the nights in two columns, 1 to 6 down the first and 7 to 13 down the second, all in view without scrolling (' + JSON.stringify(tv) + ')');
  check(tv.best === 'best41 s' && tv.label === 'Best full run' && tv.run === '20:35' && !tv.frag, 'each night\'s best inside its card, the best full run in a card of its own, and no Fragments (' + JSON.stringify(tv) + ')');
  await page.evaluate(() => { SAVE.data.bestRun = {}; MENU.act('back', 'title'); MENU.act('nights'); });
  check(await page.evaluate(() => document.querySelector('#overlay .runcard .rtime').textContent === '—' && /in one go/.test(document.querySelector('#overlay .runcard .rhint').textContent)), 'no full run yet: a dash, and a line on what one is');
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(150);
  check(await page.evaluate(() => new Set([...document.querySelectorAll('#overlay .ncard')].map(c => Math.round(c.getBoundingClientRect().left))).size === 1), 'on a phone, one column');
  await page.setViewportSize({ width: 1280, height: 760 });

  console.log('== the full run ==');
  await page.evaluate(() => localStorage.clear());
  await page.goto(URL + '?nofr&seed=1'); await page.waitForTimeout(300);
  const playFor = (sec) => page.evaluate(sec => { G.overlayArmed = 0; if (G.state === 'card') proceed(); for (let k = 0; k < sec * 20; k++) G.step(0.05); }, sec);
  await page.evaluate(() => MENU.act('begin'));
  check(await page.evaluate(() => G.state === 'card' && G.run && G.run.t === 0 && G.run.night === 0), 'Begin begins a run');
  await page.evaluate(() => { for (let k = 0; k < 40; k++) G.step(0.05); });
  check(await page.evaluate(() => G.run.t === 0), 'the card is not on the clock');
  await playFor(2);
  check(await page.evaluate(() => Math.abs(G.run.t - 2) < 0.06), 'playing is (' + await page.evaluate(() => G.run.t.toFixed(2)) + ')');
  await page.evaluate(() => { pauseGame(); for (let k = 0; k < 40; k++) G.step(0.05); resumeGame(); restartLevel(); });
  check(await page.evaluate(() => Math.abs(G.run.t - 2) < 0.06 && G.run.night === 0 && G.state === 'play'), 'paused is not on the clock, and a restart keeps the run');
  await playFor(1);
  await page.evaluate(() => { win(); for (let k = 0; k < 60; k++) G.step(0.05); });
  check(await page.evaluate(() => Math.abs(G.run.t - 3) < 0.06 && G.run.night === 1), 'a night won: the run goes on to the next, and the watching after is not on the clock');
  check(await page.evaluate(() => G.run.nights.length === 1 && Math.abs(G.run.nights[0].t - 1) < 0.06), 'and it keeps the time of the attempt that won it (' + await page.evaluate(() => JSON.stringify(G.run.nights)) + ')');
  await page.evaluate(() => proceedFromSurvived());
  check(await page.evaluate(() => G.levelIndex === 1 && G.run && G.run.night === 1), 'Next night keeps the run');
  await page.evaluate(() => { G.overlayArmed = 0; proceed(); for (let k = 0; k < 20; k++) G.step(0.05); G.L.creature.u = 0.999; for (let k = 0; k < 200 && G.state !== 'dead'; k++) G.step(0.05); });
  const tDead = await page.evaluate(() => G.state + ' ' + (G.run && G.run.t.toFixed(2)));
  await page.evaluate(() => MENU.act('retry'));
  check(await page.evaluate(() => G.state === 'play' && G.levelIndex === 1 && G.run && G.run.night === 1 && G.run.t > 3), 'Try again after a death keeps the run, and its clock (' + tDead + ')');
  await page.evaluate(() => { SAVE.unlock('nightmare', 5); showTitle(); });
  check(await page.evaluate(() => G.run === null && ![...document.querySelectorAll('#overlay button[data-act]')].some(b => b.dataset.act === 'continue')), 'quitting to the title ends it, and there is no Continue');
  await page.evaluate(() => MENU.act('begin'));
  check(await page.evaluate(() => G.levelIndex === 0 && G.run && G.run.t === 0 && G.run.night === 0), 'Begin again: a new run, from night 1');
  await page.evaluate(() => { startLevel(3, true); });
  check(await page.evaluate(() => G.run === null), 'a night started directly (a test\'s ?level=) is no run');
  // the last night won with a run on it: counted, and kept if it is the best
  const last = await page.evaluate(() => { G.run = { t: 900, night: LEVELS.length - 1 }; startLevel(LEVELS.length - 1, false); for (let k = 0; k < 20; k++) G.step(0.05); win(); return { best: SAVE.data.bestRun.nightmare, run: G.run, saved: JSON.parse(localStorage.getItem('itscoming.v2')).bestRun.nightmare }; });
  check(last.best > 900 && last.best < 902 && last.saved === last.best && last.run === null, 'winning the last night on a run records the full run, in the save (' + JSON.stringify(last) + ')');
  check(await page.evaluate(b => G.lastRun && Math.abs(G.lastRun.t - b) < 0.06 && !!G.lastRun.nights[LEVELS.length - 1], last.best), 'and keeps it for the results after the ending');
  await page.evaluate(() => { G.run = { t: 1500, night: LEVELS.length - 1 }; startLevel(LEVELS.length - 1, false); win(); });
  check(await page.evaluate(b => SAVE.data.bestRun.nightmare === b && Math.abs(G.lastRun.t - 1500) < 1, last.best), 'a slower run does not replace the best, though the results show its own time');
  await page.evaluate(() => { startLevel(LEVELS.length - 1, false); win(); });
  check(await page.evaluate(() => G.lastRun === null), 'the last night won with no run on it leaves no run for the results');

  console.log('== the win screen between nights ==');
  await page.goto(URL + '?level=1&go&nofr&seed=1'); await page.waitForTimeout(300);
  tv = await page.evaluate(() => {
    win(); for (let k = 0; k < 600 && G.state !== 'survived'; k++) G.step(0.05);
    const next = document.querySelector('#overlay button[data-act="next"]'), quit = document.querySelector('#overlay button[data-act="title"]');
    return { st: G.state, next: next && next.textContent, quit: quit && quit.textContent, plain: quit && quit.classList.contains('tbtn') && !quit.classList.contains('mbtn'), below: quit && next && quit.getBoundingClientRect().top - next.getBoundingClientRect().bottom,
      grey: quit && getComputedStyle(quit).color !== getComputedStyle(next).color, nights: !!document.querySelector('#overlay button[data-act="nights"]'), frag: !!document.querySelector('#overlay .fragment, #overlay em') };
  });
  check(tv.st === 'survived' && tv.next === 'Next night' && tv.quit === 'Quit' && tv.plain && tv.below > 30 && tv.grey && !tv.nights && !tv.frag, 'You survived: Next night, and under it a plain, quieter Quit; no Nights, no fragment (' + JSON.stringify(tv) + ')');
  await page.click('#overlay button[data-act="title"]'); await page.waitForTimeout(150);
  check(await page.evaluate(() => G.state === 'title'), 'Quit goes to the title');
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
  check(await page.evaluate(() => !document.getElementById('touch') && !!UI.zoomBtn && !!UI.menuBtn), 'no touch pad: a zoom button and a menu button for touch (swipes and taps do the rest)');
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
  check(await page.evaluate(() => G.difficulty === 0 && G.unlocked === 3 && !!document.querySelector('#overlay button[data-act="nights"]')), 'its progress is credited (the Nights button shows it)');

  console.log('== saves with several difficulties fold into the one game ==');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('itscoming.v2', JSON.stringify({ v: 2, unlocked: { easy: 5, normal: 2, hard: 1, nightmare: 4 }, complete: { easy: true }, fragments: ['field'],
      best: { field: { easy: { time: 40, wins: 1, tries: 2 }, normal: { time: 31.5, wins: 2, tries: 3 }, hard: { time: 50, wins: 1, tries: 4 } } }, settings: { difficulty: 3, muted: true } }));
  });
  await page.goto(T.INDEX); await page.waitForTimeout(300);
  v = await page.evaluate(() => ({ d: G.difficulty, u: SAVE.data.unlocked, c: SAVE.data.complete, b: SAVE.data.best.field, m: SAVE.data.settings.muted, f: 'fragments' in SAVE.data, r: SAVE.data.bestRun, s: SAVE.data.settings }));
  check(v.d === 0 && v.u.nightmare === 5 && Object.keys(v.u).length === 1 && v.c.nightmare === true && v.m && !v.f && v.r && !Object.keys(v.r).length && v.s.difficulty === undefined, 'a four-difficulty save: the furthest night reached on any of them, and the campaign complete (' + JSON.stringify(v.u) + ')');
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
  // the bow: night 5's, and it comes up and draws as it did there (with the mouse: pressed and held), but it is never
  // loosed here. Held drawing at it, it comes for you faster and faster and is on you before the bow is full: a death,
  // never the ending, and the line says so. Let go early, the bow only comes down (no arrow gone) and it comes on at its own
  // pace again; put the bow and the arrows down then, and the ending is still yours
  const bowUp13 = () => page.evaluate(() => {
    const c = G.L.creature; c.switched = true;
    for (const id of ['arrows', 'bow']) pickup(G.L.items.find(i => i.id === id));
    G.active = G.inv.findIndex(i => i.id === 'bow');
    G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = c.yaw; G.cam.pitch = G.cam.tPitch = 0;
    G.step(1 / 30, 30);
    const u = activeUse(G.L);
    return { use: u && u.tool, draw: !!(u && u.draw), hand: !!G.hand.cur, off: !!G.hand.off.cur, show: +G.L.s.bowShow.toFixed(2) };
  });
  const press13 = async () => {
    const p = await page.evaluate(() => { G.step(1 / 30, 1); const b = creatureBox(G.L.creature); return { x: b.x + b.w / 2, y: b.y + b.h * 0.3 }; });
    await page.mouse.move(p.x, p.y); await page.evaluate(() => G.step(1 / 30, 1));
    await page.mouse.down();
  };
  // its pace over a stretch of its own walking (metres a second), from where it is
  const pace13 = secs => page.evaluate(secs => { const c = G.L.creature, d0 = c.dist; G.step(1 / 30, Math.round(secs * 30)); return (d0 - c.dist) / secs; }, secs);
  await T.open(page, 'level=13&go&seed=1&nofr');
  await page.evaluate(() => { G.L.creature.hold = 14; });
  const bow13 = await bowUp13();
  check(bow13.use === 'bow' && bow13.draw && !bow13.hand && !bow13.off && bow13.show > 0.9, 'the bow in hand on the last night, it comes up in both hands to be drawn as on night 5 (' + JSON.stringify(bow13) + ')');
  await press13();
  const rush13 = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s, o = { from: c.dist, d: [], power: 0, rage: 0, caught: null };
    for (let i = 0; i < 120 && G.state === 'play'; i++) {
      G.step(1 / 30, 1);
      if (G.draw && G.draw.state === 'drawing') o.power = Math.max(o.power, G.draw.power);
      o.rage = Math.max(o.rage, c.rage);
      if (i % 6 === 0) o.d.push(+c.dist.toFixed(2));
      if (G.state !== 'play' && o.caught === null) o.caught = { power: +o.power.toFixed(2), t: +((i + 1) / 30).toFixed(2) };
    }
    for (let i = 0; i < 100 && G.state !== 'dead'; i++) G.step(1 / 30, 1);
    return Object.assign(o, { state: G.state, ending: s.ending, won: G.L.won, fought: s.fought, arrows: G.inv.find(i => i.id === 'arrows').uses, text: G.deathScreen && G.deathScreen.text });
  });
  await page.mouse.up();
  const steps13 = rush13.d.slice(1).map((d, i) => rush13.d[i] - d);
  check(rush13.caught && rush13.caught.power < 1 && rush13.state === 'dead' && !rush13.ending && !rush13.won && rush13.fought && rush13.arrows === 3 && /Fighting only made it stronger/.test(rush13.text),
    'held drawing at it, it is on you before the bow is full and nothing is loosed: a death, not the ending, and the line says so (' + JSON.stringify([rush13.caught, rush13.state, rush13.arrows, rush13.text]) + ')');
  check(rush13.from > 12 && steps13.length > 3 && steps13[steps13.length - 1] > steps13[0] * 3 && rush13.rage > 0.97, 'it comes slowly at first and then faster and faster as the string comes back, ever more enraged (' + rush13.d.join(', ') + ')');
  // let go early: the bow comes down with nothing loosed, and it comes on at its own pace; put it all down, and it is the ending
  await T.open(page, 'level=13&go&seed=1&nofr');
  await bowUp13();
  const before13 = await pace13(2);
  await press13();
  const early13 = await page.evaluate(() => { const c = G.L.creature, d0 = c.dist; G.step(1 / 30, 15); return { power: +G.draw.power.toFixed(2), rush: +G.L.s.rush.toFixed(2), closed: +(d0 - c.dist).toFixed(2) }; });
  await page.mouse.up();
  const after13 = await page.evaluate(() => { G.step(1 / 30, 20); return { draw: G.draw && G.draw.state, rush: G.L.s.rush, arrows: G.inv.find(i => i.id === 'arrows').uses, state: G.state }; });
  const pace2 = await pace13(2);
  check(early13.power > 0.2 && early13.power < 0.5 && early13.rush > 0 && after13.rush === 0 && !after13.draw && after13.arrows === 3 && after13.state === 'play' && pace2 > 0 && pace2 < before13 * 1.6 + 0.1,
    'let go early, the bow only comes back down (no arrow gone) and it comes on at its own pace again (' + JSON.stringify([early13, after13, +before13.toFixed(2), +pace2.toFixed(2)]) + ')');
  const after13b = await page.evaluate(() => {
    const c = G.L.creature;
    while (G.inv.length) { G.cam.pitch = G.cam.tPitch = PITCH_DOWN; G.active = 0; dropActive(); }
    G.step(1 / 30, 30);
    G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;
    c.u = Math.max(c.u, 0.9); for (let i = 0; i < 900 && !G.L.won && G.state === 'play'; i++) G.step(0.05, 1);
    return { won: G.L.won, ending: G.L.s.ending, state: G.state };
  });
  check(after13b.won && after13b.ending && after13b.state === 'won', 'and with the bow and the arrows put down, it comes and it is the ending (' + JSON.stringify(after13b) + ')');
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
  // doing nothing at all, from the start of a fresh night (no key, no click, the view as it starts, on it): it comes, and
  // it is the ending, every time. (On Nightmare it may change its way once, unseen, far out; as it loomed in over the last
  // metre it filled the view and more, counted as unseen there, and changed its way at the last moment: it came at you from
  // the side or behind, and that was a death for looking away)
  const idle13 = [];
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    await T.open(page, 'level=13&go&nofr&seed=' + seed);
    idle13.push(await page.evaluate(() => {
      const c = G.L.creature, lane = c.lane.name, faced = Math.abs(wrapPi(c.yaw - G.cam.yaw)) < 1e-6;
      for (let i = 0; i < 4000 && G.state === 'play'; i++) G.step(1 / 30, 1);
      return { state: G.state, ending: G.L.s.ending, faced, same: c.lane.name === lane };
    }));
  }
  check(idle13.every(r => r.faced && r.state === 'won' && r.ending && r.same), 'doing nothing at all, facing it as the night starts, it comes straight on and it is the ending, every time (' + JSON.stringify(idle13.map(r => r.state + (r.same ? '' : ' (changed its way)'))) + ')');
  // enraged, it screeches, again and again, the more often the more you hold; put down, it is quiet
  await T.open(page, 'level=13&go&seed=1&nofr');
  const scr = await page.evaluate(() => {
    const s = G.L.s, n = () => s.screeches || 0, heard = [];
    const sfx = AUDIO.sfx; AUDIO.sfx = (name, ...a) => { heard.push(name); return sfx(name, ...a); };
    try {
      G.step(1 / 30, 60); const calm = n();
      pickup(G.L.items[0]); G.step(1 / 30, 300); const one = n() - calm;
      G.L.items.filter(i => !i.taken).slice(0, 5).forEach(i => pickup(i)); const k0 = n(); G.step(1 / 30, 300); const six = n() - k0;
      while (G.inv.length) { G.cam.pitch = G.cam.tPitch = PITCH_DOWN; G.active = 0; dropActive(); }
      G.step(1 / 30, 60); const k1 = n(); G.step(1 / 30, 300); const after = n() - k1;
      return { calm, one, six, after, kinds: [...new Set(heard.filter(h => /screech/.test(h)))].sort().join() };
    } finally { AUDIO.sfx = sfx; }
  });
  check(scr.calm === 0 && scr.one >= 3 && scr.six > scr.one && scr.after === 0 && scr.kinds === 'screech,screechRage', 'holding anything it screeches, again and again, more often (and wilder) the more you hold; put it all down and it is quiet (' + JSON.stringify(scr) + ')');
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
  // its head in the view, as it is drawn: the renderer draws it as one card, its height spread evenly between where its feet
  // and its top are seen; the top of its hood is that far over its eyes (0 is the top of the view)
  await page.evaluate(() => {
    window._hoodTop = () => {
      const c = G.L.creature, p = c.pos(), y0 = p.y + c.yOff, b = R.screenPos(p.x, y0, p.z), tp = R.screenPos(p.x, y0 + c.CR.h, p.z);
      return b && tp ? +((b.y + (tp.y - b.y) * (CREATURES.demon.eyesY(c) + 0.28) / c.CR.h) / R.H).toFixed(3) : null;
    };
  });
  const hold = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s, o = { flash: 0, white: 0, tops: [] };
    const step = () => { G.step(1 / 30, 1); o.flash = Math.max(o.flash, G.flashAmt); o.white = Math.max(o.white, G.white); };
    const until = t => { while (s.endT < t - 1e-6) step(); };
    o.tops.push(['catch', window._hoodTop()]);
    until(END.lift[0] + 0.5); const h0 = c.hug && { lift: c.hug.lift, grab: c.hug.grab };
    o.tops.push(['bending', window._hoodTop()]);
    until(END.unveil[0] - 0.05); o.veiled = { unveil: c.unveil, mood: c.mood, grab: c.hug.grab };   // its face still in the dark of the hood
    until(END.lift[1]); o.lifted = c.hug && c.hug.wrists && c.hug.wrists.map(p => p.map(v => +v.toFixed(2)));
    until(END.grab[0] - 0.05); o.angry = { unveil: c.unveil, mood: c.mood, grab: c.hug.grab };      // out of it, angry, and not yet holding you
    until(END.grab[1] + 0.3); o.holding = c.hug && c.hug.wrists && c.hug.wrists.map(p => p.map(v => +v.toFixed(2)));
    o.grabTook = +(END.grab[1] - END.grab[0]).toFixed(2);
    until(END.moods + 0.3);
    const cp = c.pos(), face = cp.y + c.yOff + CREATURES.demon.eyesY(c), fp = R.screenPos(cp.x, face, cp.z);
    o.held = { lift: c.hug && c.hug.lift, grab: c.hug && c.hug.grab, dist: c.dist, h0, aim: Math.abs(wrapPi(c.yaw - G.cam.yaw)), faceY: fp && fp.y / R.H, faceX: fp && fp.x / R.W, mood: c.mood, overlay: s.grab };
    // its moods: each whole one held a while, the changes between them slow; the second angry face leaning in; to sad and
    // crying, and back to neutral, all of it holding you; then the nights go by behind it, and the light, content and happy
    const seen = []; let prev = c.mood, down = false, back = 0;
    o.lean = { angry2: 9, other: 0 };
    const watch = () => {
      const m = c.mood; if (m < prev - 1e-9) down = true; prev = m;
      if (Number.isInteger(m)) {
        if (seen.length && seen[seen.length - 1].m === m) seen[seen.length - 1].t1 = s.endT;
        else { seen.push({ m, t0: s.endT, t1: s.endT, grab: s.grab, meadow: s.meadow }); o.tops.push([CREATURES.demon.moodNames[m] + m, window._hoodTop()]); }
        if (m === 2) o.lean.angry2 = Math.min(o.lean.angry2, c.dist); else if (m <= 4 && c.hug && c.hug.grab > 0.99) o.lean.other = Math.max(o.lean.other, c.dist);
      }
      back = Math.max(back, s.backdrop || 0);
    };
    while (s.endT < END.sad + 1) { step(); watch(); }
    while (s.endT < END.neutral[0] - 0.1) { step(); watch(); }
    o.crying = { sob: c.sob, mood: c.mood, grab: c.hug && c.hug.grab, dist: +c.dist.toFixed(2), backdrop: s.backdrop, kneel: c.kneel };
    while (s.endT < END.forms[0] - 0.1) { step(); watch(); }
    o.neutral = { mood: c.mood, sob: c.sob, grab: c.hug && c.hug.grab, guise: c.guise, backdrop: s.backdrop };
    // the faces it wears: by now every night and every face drawn; each face in turn, all of it there for a while, with its
    // own night behind it (s.form), its head jumping to a new tilt with each; then its own face again, in the dark
    const shots = VOID_RECAP.shots, faces = VOID_RECAP.faces, worn = [], held = [], tilts = new Set();
    let sync = true, back2 = 1, own = null;
    while (s.endT < END.forms[1] + 0.4) {
      step(); watch(); const g = c.guise;
      if (g) {
        const top = g.faces.find(f => f[1] > 0.99), j = top ? faces.indexOf(top[0]) : -1;
        tilts.add(g.tilt.toFixed(3));
        if (j >= 0) { if (worn[worn.length - 1] !== j) { worn.push(j); held.push([s.endT, s.endT]); } else held[held.length - 1][1] = s.endT; if (j !== Math.floor(s.form)) sync = false; }
        back2 = Math.min(back2, s.backdrop);
      } else if (s.endT > END.forms[0]) own = own || { mood: c.mood, backdrop: s.backdrop, grab: c.hug && c.hug.grab, meadow: s.meadow };
    }
    const glitch = DEMON_MOOD_TIME[DEMON_GLITCH_FROM][1] / (DEMON_GLITCH.length + 1), step1 = (END.forms[1] - END.forms[0]) / faces.length;   // (its own glitch: how long it holds each face there)
    o.forms = { shots: shots.length, drawn: shots.filter(Boolean).length, faces: faces.filter(Boolean).length, worn, sync, back: back2, own, tilts: tilts.size, step: +step1.toFixed(3), glitch: +glitch.toFixed(3),
      held: held.map(([a, b]) => +(b - a + 1 / 30).toFixed(2)), grab: c.hug && c.hug.grab };
    until(END.light[0] + 1.6); o.pale = G.L.pal.fog.map(Math.round);
    let spun = 0, settled = null;
    while (s.endT < END.light[1]) { step(); watch(); spun = Math.max(spun, s.spin); }
    settled = { spin: s.spin, meadow: s.meadow, grab: c.hug && c.hug.grab, backdrop: s.backdrop, mood: c.mood };
    o.spun = +spun.toFixed(2); o.settled = settled;
    until(END.release + 1.5); o.let = { hug: c.hug, calm: c.calm };
    o.moods = seen.map(x => x.m); o.seen = seen.map(x => [x.m, +x.t0.toFixed(2), +x.t1.toFixed(2), +x.grab.toFixed(2)]);
    o.held2 = seen.filter(x => x.m >= 1 && x.m <= 7).every(x => x.t1 - x.t0 >= 0.8 && x.grab > 0.99) && seen.filter(x => x.m <= 5).every(x => x.meadow === 0);
    o.blends = seen.slice(1).map((x, i) => +(x.t0 - seen[i].t1).toFixed(2)); o.down = down;
    return o;
  });
  check(hold.held.h0 && hold.held.h0.lift > 0 && hold.held.h0.lift < 0.5 && hold.held.h0.grab === 0, 'it lifts its arms slowly (' + JSON.stringify(hold.held.h0) + ')');
  check(hold.lifted && hold.lifted.every(([x, y], i) => (i ? x > 0.6 && x < 0.95 : x > 0.05 && x < 0.4) && y > 0.2 && y < 0.5), 'its hands come up high in the view, one each side of its head (' + JSON.stringify(hold.lifted) + ')');
  check(hold.veiled.unveil === 0 && hold.veiled.mood === 0 && hold.veiled.grab === 0 && hold.angry.unveil === 1 && hold.angry.mood === 0 && hold.angry.grab === 0, 'its arms lifted, its face comes up out of the dark of its hood, angry, before it takes hold of you (' + JSON.stringify([hold.veiled, hold.angry]) + ')');
  check(hold.grabTook < 0.5 && hold.holding && hold.holding.every(([x, y], i) => (i ? x > 0.8 : x < 0.2) && y > 0.75), 'then, quick, it reaches out and takes hold of you: its hands at the lower corners of the view, as the tall thing in the bedroom grabbed (' + JSON.stringify(hold.holding) + ')');
  check(hold.held.lift > 0.99 && hold.held.grab > 0.99 && hold.held.overlay > 0.99 && hold.held.dist < 0.75, 'it holds you, close in front of you (' + JSON.stringify(hold.held) + ')');
  check(hold.held.aim < 0.02 && hold.held.faceX > 0.4 && hold.held.faceX < 0.6 && hold.held.faceY > 0.1 && hold.held.faceY < 0.5, 'the view stays on its face (' + (hold.held.faceX || 0).toFixed(2) + ', ' + (hold.held.faceY || 0).toFixed(2) + ')');
  check(hold.tops.length >= 9 && hold.tops.every(([w, y]) => y !== null && (y > 0.01 || w === 'angry2')), 'close in, it bends down to you so its head stays in the view: as it reaches you, holds you, and through every face (but as it leans right in, angry, its face filling the view: ' + hold.tops.map(([w, y]) => w + ':' + y).join(', ') + ')');
  check(hold.lean.angry2 < 0.55 && Math.abs(hold.lean.other - 0.68) < 0.02, 'angry again, it leans in close at you, and back again for confused (' + JSON.stringify(hold.lean) + ')');
  check(hold.crying.sob === 1 && hold.crying.mood === 4 && hold.crying.grab === 1 && hold.crying.dist === 0.68 && hold.crying.backdrop === 0 && hold.crying.kneel === undefined, 'sad, it cries a while in place, still holding you: it does not let go or sink down (' + JSON.stringify(hold.crying) + ')');
  check(hold.neutral.mood === 5 && hold.neutral.sob === 0 && hold.neutral.grab === 1 && hold.neutral.guise === null && hold.neutral.backdrop === 0, 'then it stops crying, and its face is the grey neutral face again (' + JSON.stringify(hold.neutral) + ')');
  const greyAgain = await page.evaluate(() => JSON.stringify(DEMON_MOODS[5]) === JSON.stringify(DEMON_MOODS[1]));
  check(greyAgain, 'the same grey neutral face it made the first time');
  const F = hold.forms;
  check(F.shots === 12 && F.drawn === 12 && F.faces === 12 && JSON.stringify(F.worn) === '[0,1,2,3,4,5,6,7,8,9,10,11]' && F.sync && F.back === 1 && F.grab === 1,
    'holding you, it wears the face of each thing that came before, in the order they came, with the night it came in behind it (' + JSON.stringify([F.worn, F.sync, F.back]) + ')');
  check(F.step > F.glitch * 1.8 && F.step < F.glitch * 2.6 && F.held.every(h => h > F.step * 0.6 && h < F.step * 1.1) && F.tilts >= 12,
    'each held about twice as long as a face of its own glitch, snapped to the next, its head jumping with each (' + JSON.stringify([F.step, F.glitch, F.held, F.tilts]) + ')');
  check(!!F.own && F.own.mood === 5 && F.own.backdrop === 0 && F.own.grab === 1 && F.own.meadow === 0, 'then its own grey face again, in the dark, still holding you (' + JSON.stringify(F.own) + ')');
  check(hold.pale.every(v => v > 200), 'the dark lightens into a pale void (' + hold.pale + ')');
  check(hold.spun > 1 && hold.settled.spin === 0 && hold.settled.meadow === 1 && hold.settled.grab === 1 && hold.settled.backdrop === 0 && hold.settled.mood === 7, 'the meadow comes out of the light turning round you both and settles into place, and it is happy, still holding you (' + JSON.stringify([hold.spun, hold.settled]) + ')');
  check(hold.let.hug === null && hold.let.calm > 0.5, 'then it lets you go (' + JSON.stringify(hold.let) + ')');
  const moodNames = await page.evaluate(() => CREATURES.demon.moodNames.join(', '));
  check(JSON.stringify(hold.moods) === '[0,1,2,3,4,5,6,7]' && moodNames === 'angry, neutral, angry, confused, sad, neutral, content, happy' && !hold.down && hold.held2, 'its face goes through ' + moodNames + ', in that order, each held a while, all of it holding you (' + JSON.stringify(hold.seen) + ')');
  check(hold.blends.every((b, i) => (i === 1 || i === 2 ? b > 0.1 && b < 0.45 : b >= 0.7)), 'each change of face is slow, but for the quick ones into its second angry face and out of it (' + hold.blends.join(', ') + ' s)');
  check(hold.flash < 0.01 && hold.white < 0.01, 'nothing in it flashes');
  const meadow = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s;
    while (!s.wait) G.step(0.1, 1);
    const at = { meadow: s.meadow, hug: c.hug, dist: c.dist, yaw: Math.abs(wrapPi(c.yaw - G.L.facing)), ground: G.L.pal.ground.map(Math.round), sky: G.L.pal.skyTop.map(Math.round), room: s.room, mood: c.mood, view: Math.abs(wrapPi(G.cam.yaw - c.yaw)), pitch: G.cam.pitch };
    // a minute in the meadow, what is written over it noted as it goes (a turn of the view a little way in, then nothing)
    const said = [], fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { said.push([String(t), +s.idle.toFixed(1), +this.globalAlpha.toFixed(2), this.fillStyle]); return fill.call(this, t, ...a); };
    let quiet = 0, lineAt = null, turned = null;
    try {
      for (let i = 0; i < 600; i++) {
        if (i === 40) { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); turned = s.idle; }
        if (i === 52) { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); }
        said.length = 0; G.step(0.1, 1);
        const line = said.find(x => /CLICK WHEN YOU ARE READY/.test(x[0]));
        if (line && !/,0\.0+\)$|,0\)$/.test(line[3]) && lineAt === null) lineAt = { idle: line[1], i };
        if (i < 100 && line && !/,0\.0+\)$|,0\)$/.test(line[3]) && s.idle < 4.9) quiet++;
        if (said.some(x => /Stay as long/i.test(x[0]))) quiet += 1000;
      }
    } finally { CanvasRenderingContext2D.prototype.fillText = fill; }
    return Object.assign(at, { after: { state: G.state, leaving: s.leaving, meadow: s.meadow, fade: c.fade }, quiet, lineAt, turned });
  });
  check(meadow.quiet === 0 && meadow.turned > 3 && meadow.lineAt && meadow.lineAt.idle >= 5 && meadow.lineAt.i > 52 + 50, 'in the meadow no line says to stay; CLICK WHEN YOU ARE READY comes only after five seconds with nothing done, and a look about starts the count again (' + JSON.stringify([meadow.quiet, meadow.turned, meadow.lineAt]) + ')');
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
  // a finger: swipes on the view (dragging the scene: the finger right turns left, the finger up looks down), the zoom button
  const swipeBy = (dx, dy) => page.evaluate(([dx, dy]) => { const ft = (type, x, y) => { const t = new Touch({ identifier: 3, target: UI.canvas, clientX: x, clientY: y }); UI.canvas.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t], changedTouches: [t] })); }; ft('touchstart', 640, 380); ft('touchmove', 640 + dx / 2, 380 + dy / 2); ft('touchmove', 640 + dx, 380 + dy); ft('touchend', 640 + dx, 380 + dy); }, [dx, dy]);
  const zoomBtn = type => page.evaluate(type => UI.zoomBtn.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerType: 'touch' })), type);
  for (const [name, dx, by] of [['swipe right', 160, -45], ['swipe left', -160, 45]]) { await swipeBy(dx, 0); const c1 = await cam(); looks.push(name + ':' + turned(c0, c1, by)); c0 = c1; }
  await swipeBy(0, -120); let c1 = await cam(); looks.push('swipe up:' + (Math.abs(c1.pitch - PITCH) < 0.03 && !c1.leaving));
  await swipeBy(0, 120); c1 = await cam(); looks.push('swipe down:' + (Math.abs(c1.pitch) < 0.03 && !c1.leaving));
  await zoomBtn('pointerdown'); await zoomBtn('pointerup'); c1 = await cam(); await zoomBtn('pointerdown'); await zoomBtn('pointerup'); let c2 = await cam(); looks.push('zoom button:' + (c1.zoom > 2.2 && c2.zoom < 1.2 && !c2.leaving));   // (a tap on, a tap off)
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
  check(looks.every(s => s.endsWith(':true')), 'in the meadow you turn, look down and up and zoom as in any night, by key, swipe, the zoom button and pad, and the meadow still waits (' + looks.join(', ') + ')');
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
  check(await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'day' && /faced your demons/i.test(UI.overlay.textContent) && document.querySelector('#overlay button[data-act="done"]').textContent === 'The End' && JSON.parse(localStorage.getItem('itscoming.v2')).complete[G.diff().id] === true), 'the light theme, faced your demons, The End, the campaign complete');
  await shot(page, 'ending');
  // The End: the nights as on the Nights screen, their times coming in one by one, then the full run, then Finish game
  await page.mouse.click(640, 120); await page.waitForTimeout(100);
  check(await page.evaluate(() => G.state === 'end' && MENU.kind === 'ending'), 'a click off the button does not leave the last screen');
  await page.click('#overlay button[data-act="done"]'); await page.waitForTimeout(1200);
  tv = await page.evaluate(() => ({ kind: MENU.kind, cards: document.querySelectorAll('#overlay .results .rcard').length, in: document.querySelectorAll('#overlay .rcard.in').length, run: document.querySelector('#overlay .rrun').classList.contains('in'), fin: document.querySelector('#overlay .rlast').classList.contains('in') }));
  check(tv.kind === 'results' && tv.cards === 13 && tv.in > 0 && tv.in < 13 && !tv.run && !tv.fin, 'The End: the results, the cards filling in one after another (' + JSON.stringify(tv) + ')');
  await page.waitForTimeout(4600);
  tv = await page.evaluate(() => ({ in: document.querySelectorAll('#overlay .rcard.in').length, run: document.querySelector('#overlay .rrun').classList.contains('in'), label: document.querySelector('#overlay .rrun .rlabel').textContent, fin: document.querySelector('#overlay .rlast').classList.contains('in'), focus: document.activeElement && document.activeElement.dataset.act, left: [...document.querySelectorAll('#overlay .rcard')].filter(c => Math.round(c.getBoundingClientRect().left) === Math.round(document.querySelector('#overlay .rcard').getBoundingClientRect().left)).length }));
  check(tv.in === 13 && tv.run && tv.label === 'This run' && tv.fin && tv.focus === 'finish' && tv.left === 6, 'then this run (not a full run here: a dash), then Finish game, focused; six nights down the left (' + JSON.stringify(tv) + ')');
  await page.click('#overlay button[data-act="finish"]'); await page.waitForTimeout(200);
  check(await page.evaluate(() => G.state === 'title' && MENU.kind === 'title' && TITLE.on && TITLE.active() && !document.documentElement.getAttribute('data-theme') && SAVE.data.settings.theme !== 'day' && document.querySelector('#overlay button[data-act="nights"]').textContent === 'Scores'), 'Finish game: home to the usual dark title, with it out there, and Scores on it (the morning is not kept)');
  await page.reload(); await page.waitForTimeout(300);
  check(await page.evaluate(() => TITLE.on && !document.documentElement.getAttribute('data-theme')), 'and so it is after a reload');
  await page.evaluate(() => { SAVE.setSetting('theme', 'day'); showTitle(); });
  check(await page.evaluate(() => TITLE.on && !document.documentElement.getAttribute('data-theme') && SAVE.data.settings.theme === ''), 'a save from when the morning stayed on the title gets the dark title, and the morning dropped from it');
  // a full run to the end: this run's times and nothing else (no bests); reduced motion shows it all at once
  tv = await page.evaluate(() => {
    MENU.applySetting('reducedMotion', true);
    G.lastRun = { t: 1500.4, nights: LEVELS.map((l, i) => ({ t: 30 + i })) };
    setState('end'); MENU.show('results');
    const cards = [...document.querySelectorAll('#overlay .rcard')];
    const o = { in: cards.filter(c => c.classList.contains('in')).length, fin: document.querySelector('#overlay .rlast').classList.contains('in'), first: cards[0].querySelector('.nbest').textContent, second: cards[1].querySelector('.nbest').textContent, label: document.querySelector('#overlay .rrun .rlabel').textContent, time: document.querySelector('#overlay .rrun .rtime').textContent, best: /best/i.test(document.querySelector('#overlay .results').textContent) };
    MENU.applySetting('reducedMotion', false); G.lastRun = null;
    return o;
  });
  check(tv.in === 13 && tv.fin && tv.first === '30 s' && tv.second === '31 s' && tv.label === 'This run' && tv.time === '25:00' && !tv.best, 'after a full run: its own times and its whole time, no word of any best; with reduced motion all at once (' + JSON.stringify(tv) + ')');
  // a press while it still holds you does nothing; in the meadow a key (R too: it goes on, it does not start the night
  // again), A on a pad, or a tap goes on, just as a click does
  for (const [how, press] of [['a key (R)', async () => page.keyboard.press('r')], ['A on a pad', async () => page.evaluate(() => {
    window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad];
    window._pad.buttons[0].pressed = true; pollGamepad(); window._pad.buttons[0].pressed = false; pollGamepad(); navigator.getGamepads = () => [];
  })], ['a tap', async () => page.evaluate(() => { const ft = (type, x, y) => { const t = new Touch({ identifier: 3, target: UI.canvas, clientX: x, clientY: y }); UI.canvas.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t], changedTouches: [t] })); }; ft('touchstart', 640, 380); ft('touchend', 640, 380); })]]) {
    await T.open(page, 'level=13&go&seed=2&nofr');
    await caught();
    const L0 = await page.evaluate(() => { while (G.L.s.endT < END.moods + 1) G.step(0.1, 1); return G.L.s.endT; });   // (holding you)
    await press();
    const early = await page.evaluate(() => ({ leaving: G.L.s.leaving, state: G.state, ending: G.L.s.ending }));
    await page.evaluate(() => { while (G.L.s.endT < END.arm + 0.5) G.step(0.1, 1); });   // (on, to the meadow)
    const L1 = await page.evaluate(() => (window._L = G.L, G.L.s.endT));
    await press();
    const later = await page.evaluate(() => ({ leaving: G.L.s.leaving, same: window._L === G.L, state: G.state }));
    check(L0 > 5 && !early.leaving && early.state === 'won' && early.ending && L1 > 20 && later.leaving && later.same && later.state === 'won', how + ': nothing while it holds you; in the meadow it goes on (' + JSON.stringify([early, later]) + ')');
  }
  // with reduced motion it does not dance, tremble or heave; nothing turns behind it (each night is there in turn and gives
  // way to the next) and the meadow does not turn into place; and the ending still comes to the last screen
  await T.open(page, 'level=13&go&seed=1&nofr');
  await page.evaluate(() => MENU.applySetting('reducedMotion', true));
  await caught();
  const still = await page.evaluate(() => {
    const c = G.L.creature, s = G.L.s; let dance = 0, heave = 0, spin = 0, back = 0;
    while (s.endT < END.neutral[0]) { G.step(0.1, 1); heave = Math.max(heave, CREATURES.demon.heave(c)); }   // crying: no heaving
    let jump = 0, worn = 0;
    while (s.endT < END.forms[1] + 0.5) { G.step(1 / 30, 1); back = Math.max(back, s.backdrop); if (c.guise) { jump = Math.max(jump, Math.abs(c.guise.tilt) + Math.abs(c.guise.x) + Math.abs(c.guise.y)); worn = Math.max(worn, c.guise.faces.filter(f => f[0]).length); } }
    while (!s.wait || s.endT < END.dance[1] + 9) { G.step(0.1, 1); dance = Math.max(dance, c.dance); spin = Math.max(spin, s.spin); back = Math.max(back, s.backdrop); }
    const o = { still: c.still, dance, heave, spin, back, jump, worn, shots: VOID_RECAP.shots.filter(Boolean).length, faces: VOID_RECAP.faces.filter(Boolean).length };
    G.L.onPress(); for (let i = 0; i < 100 && G.state !== 'end'; i++) G.step(0.05, 1);
    return Object.assign(o, { state: G.state });
  });
  check(still.still === true && still.dance === 0 && still.heave === 0 && still.spin === 0 && still.back === 1 && still.shots === 12 && still.faces === 12 && still.jump === 0 && still.worn === 2 && still.state === 'end', 'with reduced motion its shoulders do not heave as it cries, it still wears the faces of the others (each coming slowly over the last) with their nights behind it but its head does not jump, the meadow does not spin, it stands still in the meadow, and the ending still ends (' + JSON.stringify(still) + ')');
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
  // on a phone, with the zoom button in the bottom right, it keeps clear of it and of the inventory
  for (const left of [false]) {
    const ctx2 = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const ph = await ctx2.newPage();
    await ph.goto(URL + '?level=1&go&seed=1&nofr'); await ph.waitForTimeout(300);
    const r = await ph.evaluate(([take, left]) => {
      G.L.creature.hold = G.L.creature.dist; G.mouse.x = -1; G.cam.yaw = G.cam.tYaw = Math.PI; G.cam.pitch = G.cam.tPitch = 0;
      const out = [];
      for (const id of ['hammer', 'planks', 'nails', 'bottle']) {
        eval(take.replace('hammer', id)); G.step(0.05, 25);
        const b = G.hand.box, rect = id => { const r = document.getElementById(id).getBoundingClientRect(); return { x0: r.left, y0: r.top - R.viewY, x1: r.right, y1: r.bottom - R.viewY }; };
        const hit = (a, c) => a.x0 < c.x1 && a.x1 > c.x0 && a.y0 < c.y1 && a.y1 > c.y0;
        out.push({ id, shown: !!b && G.hand.up === 1, clear: !!b && !hit(b, rect('zoomBtn')) && !hit(b, rect('inventory')) && !hit(b, { x0: R.W / 2 - 40, y0: R.H / 2 - 40, x1: R.W / 2 + 40, y1: R.H / 2 + 40 }) });
      }
      return out;
    }, [take('hammer'), left]);
    check(r.every(x => x.shown && x.clear), 'on a phone, what you hold keeps clear of the zoom button, the inventory and the aim (' + JSON.stringify(r) + ')');
    await ph.screenshot({ path: path.join(__dirname, 'shots', 'held-phone' + (left ? '-left' : '') + '.png') });
    await ctx2.close();
  }

  // ---------------- a phone: turn it sideways, swipe to look, tap to use, a zoom button, the menu button ----------------
  {
    const { devices } = require('playwright');
    const mobile = async (dev, q) => {
      const ctx = await browser.newContext(dev);
      const pg = await ctx.newPage();
      pg.on('pageerror', e => errors.push('PAGEERROR (phone) ' + e.message));
      await pg.goto(URL + (q || '')); await pg.waitForTimeout(400);
      const cdp = await ctx.newCDPSession(pg);
      // a finger as the phone sends it: down, moved in a few steps, up (Input.dispatchTouchEvent: real touch events)
      const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
      const swipe = async (x0, y0, x1, y1) => {
        await touch('touchStart', x0, y0);
        for (let i = 1; i <= 6; i++) { await touch('touchMove', x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6); await pg.waitForTimeout(16); }
        await touch('touchEnd'); await pg.waitForTimeout(250);
      };
      const hold = async (x, y, ms, along) => { await touch('touchStart', x, y); const t0 = Date.now(); while (Date.now() - t0 < ms) { const p = along ? await along() : null; await touch('touchMove', p ? p.x : x, p ? p.y : y); await pg.waitForTimeout(40); } await touch('touchEnd'); await pg.waitForTimeout(150); };
      return { ctx, pg, touch, swipe, hold };
    };
    // held upright: the turn-it-sideways screen over everything, and a night under way pauses behind it
    let m = await mobile(devices['iPhone 13'], '?level=1&go&seed=1');
    await m.pg.waitForTimeout(300);
    let r = await m.pg.evaluate(() => ({ rot: getComputedStyle(document.getElementById('rotate')).display, top: document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('#rotate') !== null, state: G.state, menu: MENU.kind }));
    check(r.rot === 'flex' && r.top && r.state === 'paused' && r.menu === 'pause', 'a phone held upright: the turn-it-sideways screen covers everything and the night is paused behind it (' + JSON.stringify(r) + ')');
    await m.ctx.close();
    // a narrow desktop window never gets it
    const dpg = await browser.newPage({ viewport: { width: 420, height: 900 } });
    await dpg.goto(URL + '?level=1&go&seed=1'); await dpg.waitForTimeout(400);
    r = await dpg.evaluate(() => ({ rot: getComputedStyle(document.getElementById('rotate')).display, state: G.state, mute: getComputedStyle(UI.mute).display, menuBtn: getComputedStyle(UI.menuBtn).display, zoomBtn: getComputedStyle(UI.zoomBtn).display }));
    check(r.rot === 'none' && r.state === 'play' && r.mute !== 'none' && r.menuBtn === 'none' && r.zoomBtn === 'none', 'a tall, narrow desktop window: no turn-it-sideways screen, the night plays, the sound line and no touch buttons (' + JSON.stringify(r) + ')');
    await dpg.close();

    // on its side: no old button pad; the menu button where the sound line was; zoom in the corner
    m = await mobile(devices['iPhone 13 landscape'], '?level=1&go&seed=1');
    const { pg } = m;
    await pg.evaluate(() => { G.L.creature.hold = G.L.creature.dist; });
    await pg.waitForTimeout(200);
    r = await pg.evaluate(() => {
      const b = id => { const e = document.getElementById(id); if (!e) return null; const q = e.getBoundingClientRect(); return { d: getComputedStyle(e).display, x: Math.round(q.left), y: Math.round(q.top), r: Math.round(innerWidth - q.right), b: Math.round(innerHeight - q.bottom) }; };
      return { pad: !!document.getElementById('touch'), rot: getComputedStyle(document.getElementById('rotate')).display, mute: b('mute').d, menu: b('menuBtn'), zoom: b('zoomBtn'), state: G.state, touchUI: touchUI() };
    });
    check(!r.pad && r.rot === 'none' && r.touchUI && r.state === 'play', 'a phone on its side: the night plays, no turn-it-sideways screen and no old button pad (' + JSON.stringify(r) + ')');
    check(r.mute === 'none' && r.menu.d === 'flex' && r.menu.x < 40 && r.menu.y < 30 && r.zoom.d === 'flex' && r.zoom.r < 40 && r.zoom.b < 40, 'the menu button top left in place of the sound line, and the zoom button in the bottom right corner');
    await pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-night.png') });
    // swipes: one step each, the scene dragged (finger left turns right, finger up looks down); not a tap
    const W = await pg.evaluate(() => [innerWidth, innerHeight]), cx = W[0] / 2, cy = W[1] / 2;
    const cam = () => pg.evaluate(() => ({ d: G.cam.dirIdx, down: G.cam.tPitch > 0.5, inv: G.inv.length, tip: G.hover }));
    const d0 = (await cam()).d;
    await m.swipe(cx + 120, cy, cx - 120, cy);
    let c = await cam(); check(c.d === (d0 + 1) % 8 && !c.down, 'a swipe to the left drags the scene: the view turns one step right (' + d0 + ' to ' + c.d + ')');
    await m.swipe(cx - 120, cy, cx + 120, cy); await m.swipe(cx - 120, cy, cx + 120, cy);
    c = await cam(); check(c.d === (d0 + 7) % 8, 'two swipes to the right: two steps left (' + c.d + ')');
    await m.swipe(cx, cy + 100, cx, cy - 100);
    c = await cam(); check(c.down, 'a swipe up drags the floor into view: looking down');
    await pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-down.png') });
    await m.swipe(cx, cy - 100, cx, cy + 100);
    c = await cam(); check(!c.down && c.inv === 0 && (await pg.evaluate(() => G.state)) === 'play', 'a swipe down looks ahead again; no swipe was taken as a tap (nothing put down or used)');
    await pg.evaluate(() => MENU.applySetting('swipeReverse', true));
    const d1 = (await cam()).d; await m.swipe(cx + 120, cy, cx - 120, cy);
    c = await cam(); check(c.d === (d1 + 7) % 8, 'with swipes reversed, a swipe left turns left');
    await pg.evaluate(() => MENU.applySetting('swipeReverse', false));
    // a tap takes what it is on, there, as a click
    const it = await lookFor(pg, 'item', 'hammer');
    if (it) { await pg.touchscreen.tap(it.x, it.y); await pg.waitForTimeout(250); }
    check(await pg.evaluate(() => G.hasItem('hammer')), 'a tap on the hammer picks it up');
    await pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-picked.png') });
    // a tap on nothing does nothing; the slots still switch by tap
    // zoom: a tap on the button zooms in, and it stays in (the button lit, its plus a minus) with the finger off it; a swipe
    // on the view still turns, zoomed, and a tap on the view still takes; a tap on the button again zooms back out
    const zb = await pg.evaluate(() => { const q = UI.zoomBtn.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
    const zstate = () => pg.evaluate(() => ({ held: G.cam.zoomHeld, zoom: +G.cam.zoom.toFixed(2), on: UI.zoomBtn.classList.contains('on'), pressed: UI.zoomBtn.getAttribute('aria-pressed'), plus: getComputedStyle(UI.zoomBtn.querySelector('.zplus')).display !== 'none', d: G.cam.dirIdx }));
    const z0 = await zstate();
    await pg.touchscreen.tap(zb.x, zb.y); await pg.waitForTimeout(700);
    const zin = await zstate();
    await pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-zoom.png') });
    await m.swipe(cx + 120, cy, cx - 120, cy); await pg.waitForTimeout(300);
    const zsw = await zstate();
    await pg.touchscreen.tap(cx, cy); await pg.waitForTimeout(300);
    const ztap = await zstate();
    await pg.touchscreen.tap(zb.x, zb.y); await pg.waitForTimeout(700);
    const zout = await zstate();
    check(!z0.on && z0.plus && z0.pressed === 'false' && zin.held && zin.on && zin.pressed === 'true' && !zin.plus && zin.zoom > 2.4, 'the zoom button: a tap zooms in and it stays in, the button lit, its plus a minus (' + JSON.stringify([z0, zin]) + ')');
    check(zsw.held && zsw.on && zsw.zoom > 2.4 && zsw.d === (zin.d + 1) % 8 && ztap.held && ztap.on, 'zoomed in, a swipe on the view still turns and a tap on the view leaves the zoom on (' + JSON.stringify([zsw, ztap]) + ')');
    check(!zout.held && !zout.on && zout.plus && zout.pressed === 'false' && zout.zoom < 1.2, 'a tap on the button again zooms back out, the button dark, its plus back (' + JSON.stringify(zout) + ')');
    // the menu button: the pause menu, with everything in it
    await pg.tap('#menuBtn'); await pg.waitForTimeout(500);
    r = await pg.evaluate(() => ({ state: G.state, acts: [...UI.overlay.querySelectorAll('button[data-act]')].map(b => b.dataset.act), menuBtn: getComputedStyle(UI.menuBtn).display, zoomBtn: getComputedStyle(UI.zoomBtn).display }));
    check(r.state === 'paused' && ['resume', 'restart', 'settings', 'mute', 'title'].every(a => r.acts.includes(a)) && !r.acts.includes('nights') && r.menuBtn === 'none' && r.zoomBtn === 'none', 'the menu button pauses: Resume, Restart, Settings, Mute, Quit (the buttons themselves hidden over it) (' + JSON.stringify(r) + ')');
    await pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-pause.png') });
    await pg.tap('button[data-act="mute"]'); await pg.waitForTimeout(150);
    check(await pg.evaluate(() => G.muted), 'Mute in the pause menu mutes (there is no sound line on a phone)');
    await pg.tap('button[data-act="mute"]'); await pg.tap('button[data-act="settings"]'); await pg.waitForTimeout(300);
    r = await pg.evaluate(() => ({ rev: !!UI.overlay.querySelector('[data-set="swipeReverse"]'), left: !!UI.overlay.querySelector('[data-set="touchLeft"]') }));
    check(r.rev && !r.left, 'settings on a phone: reverse swipes (and no touch-buttons side any more)');
    await pg.tap('button[data-act="back"]'); await pg.waitForTimeout(200);
    await pg.tap('button[data-act="resume"]'); await pg.waitForTimeout(300);
    check(await pg.evaluate(() => G.state === 'play'), 'Resume, by tap, goes back to the night');
    // a won night that waits on a press (the last night's meadow): a swipe up, the zoom button or a tap is the press
    await pg.evaluate(() => { window.__got = []; G.L.onPress = e => { window.__got.push(e ? e.key : 'tap'); return true; }; G.L.after = { custom: true }; G.L.aftermath = () => false; setState('won'); });
    await pg.waitForTimeout(150);
    await m.swipe(cx, cy - 100, cx, cy + 100);   // (the finger down: looking up, as the up key)
    await m.touch('touchStart', zb.x, zb.y); await m.touch('touchEnd'); await pg.waitForTimeout(100);
    await pg.touchscreen.tap(cx, cy); await pg.waitForTimeout(150);
    r = await pg.evaluate(() => window.__got);
    check(r.join() === 'ArrowUp,tap,tap', 'a won night waiting on a press (the last night\'s meadow): a swipe down is the up key, and the zoom button and a tap are presses (' + r.join() + ')');
    await m.ctx.close();

    // How to play and the night's card on a phone: the touch cards, "tap"
    m = await mobile(devices['Pixel 7 landscape']);
    await m.pg.tap('button[data-act="howto"]'); await m.pg.waitForTimeout(500);
    r = await m.pg.evaluate(() => ({ cards: [...document.querySelectorAll('.hcard .hwhat')].map(e => e.textContent), gest: document.querySelectorAll('.hcard kbd.gest').length, zoom: !!document.querySelector('.hcard .kzoom'), zsay: (k => k && k.closest('.hcard').querySelector('.kplus').textContent)(document.querySelector('.hcard .kzoom')), menu: !!document.querySelector('.hcard .kmenu'), keys: [...document.querySelectorAll('.hcard kbd.key:not(.gest)')].length, fits: (p => p.scrollHeight <= p.clientHeight + 1)(document.querySelector('#overlay .panel')) }));
    check(r.cards.join() === 'Look around,Zoom in,Interact,Pause' && r.gest === 3 && r.zoom && r.zsay === 'tap' && r.menu && r.keys === 0 && r.fits, 'How to play on a phone: swipe, the zoom button (tap), tap and the menu button, no keys, all of it in view (' + JSON.stringify(r) + ')');
    await m.pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-howto.png') });
    await m.pg.tap('button[data-act="back"]'); await m.pg.waitForTimeout(300);
    await m.pg.tap('button[data-act="begin"]'); await m.pg.waitForTimeout(500);
    r = await m.pg.evaluate(() => ({ state: G.state, prompt: (UI.overlay.querySelector('.prompt') || {}).textContent }));
    check(r.state === 'card' && /^Tap when you are ready/.test(r.prompt || ''), 'the night\'s card on a phone says tap (' + JSON.stringify(r) + ')');
    await m.pg.touchscreen.tap(200, 200); await m.pg.waitForTimeout(400);
    check(await m.pg.evaluate(() => G.state === 'play'), 'a tap on the card begins the night');
    await m.ctx.close();

    // night 5's bow on a phone: press and hold on it, let go when the bar is full: it flies at it; a quick tap looses nothing
    m = await mobile(devices['iPhone 13 landscape'], '?level=5&go&seed=1');
    r = await m.pg.evaluate(() => {
      for (const id of ['bow', 'arrows']) { const it = G.L.items.find(i => i.id === id); it.taken = true; G.inv.push(it); }
      G.inv.find(i => i.id === 'arrows').uses = 3; G.invSig = '';
      const c = G.L.creature; c.switched = true; c.darts = Infinity; c.u = 1 - Math.pow(30 / c.D0, 1 / c.gamma); c.hold = 30;
      G.cam.dirIdx = ((Math.round(c.yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = 0;
      return true;
    });
    await m.pg.waitForTimeout(800);
    const body = () => m.pg.evaluate(() => { const b = creatureBox(G.L.creature); return b && { x: b.x + b.w / 2, y: b.y + b.h / 2 }; });
    let b0 = await body();
    if (b0) { await m.pg.touchscreen.tap(b0.x, b0.y); await m.pg.waitForTimeout(400); }
    r = await m.pg.evaluate(() => ({ out: G.L.s.outcomes.length, arrows: G.inv.find(i => i.id === 'arrows').uses }));
    check(!!b0 && r.out === 0 && r.arrows === 3, 'a quick tap on it with the bow looses nothing (' + JSON.stringify(r) + ')');
    await m.pg.waitForTimeout(500);
    b0 = await body();
    let shotDone = false;
    if (b0) await m.hold(b0.x, b0.y, 2100, async () => { const p = await body(); if (!shotDone) { const full = await m.pg.evaluate(() => G.draw && G.draw.power >= 1); if (full) { shotDone = true; await m.pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-bow.png') }); } } return p; });
    r = await m.pg.evaluate(() => ({ out: G.L.s.outcomes.slice(), arrows: G.inv.find(i => i.id === 'arrows').uses }));
    check(r.out[r.out.length - 1] === 'hit' && r.arrows === 2, 'pressed and held on it until the bar is full, then let go: it flies at it (' + JSON.stringify(r) + ')');
    await m.ctx.close();

    // night 12's covers: held by the finger until they are up
    m = await mobile(devices['iPhone 13 landscape'], '?level=12&go&seed=1');
    await m.pg.evaluate(() => { const s = G.L.s; s.lampOn = true; s.fitted = true; s.plugged = true; s.onAt = 0; G.L.creatures.forEach(c => { c.hold = c.dist; }); });
    const cv = await lookFor(m.pg, 'target', 'covers');
    if (cv) await m.hold(cv.x, cv.y, 3600);
    check(await m.pg.evaluate(() => G.L.targets.find(t => t.id === 'covers').done === true), 'night 12: the covers held by a finger (three seconds) until the hold is done');
    await m.ctx.close();

    // night 11: the zoom button on the fuse box, facing the stables and looking down: a tap zooms in, smoothly (every frame
    // nearer, never past where it settles: no bounce), as near as keeps the whole box in view, and it stays in; a tap and
    // it comes back out
    m = await mobile(devices['iPhone 13 landscape'], '?level=11&go&seed=1');
    await m.pg.evaluate(() => { G.L.creatures.forEach(c => { c.hold = c.dist; }); });
    await T.face(m.pg, 7, true); await m.pg.waitForTimeout(300);
    const zb11 = await m.pg.evaluate(() => { const q = UI.zoomBtn.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
    await m.pg.touchscreen.tap(zb11.x, zb11.y);
    r = await m.pg.evaluate(() => new Promise(res => { const zs = []; const f = () => { zs.push(G.cam.zoom); if (zs.length < 70) requestAnimationFrame(f); else res({ zs, box: G.L.boxZoom(), held: G.cam.zoomHeld, hs: R.hits.filter(h => h.kind === 'target' && (h.ref.id === 'main' || /^sw/.test(h.ref.id))).map(h => [h.x, h.y, h.x + h.w, h.y + h.h]), W: R.W, H: R.H }); }; requestAnimationFrame(f); }));
    {
      const zs = r.zs, last = zs[zs.length - 1], mono = zs.every((z, i) => !i || z >= zs[i - 1] - 1e-6), over = Math.max(...zs) <= r.box + 0.005;
      check(r.held && r.box > 1.2 && Math.abs(last - r.box) < 0.03 && mono && over && r.hs.length === 9 && r.hs.every(h => h[0] >= 0 && h[2] <= r.W && h[1] >= 0 && h[3] <= r.H),
        'night 11 on a phone: the zoom button on the fuse box zooms in smoothly, no bounce, as near as keeps all of it in view (' + JSON.stringify({ box: r.box, last, mono, over, n: r.hs.length }) + ')');
    }
    await m.pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-n11-zoom.png') });
    await m.pg.touchscreen.tap(zb11.x, zb11.y); await m.pg.waitForTimeout(700);
    check(await m.pg.evaluate(() => !G.cam.zoomHeld && G.cam.zoom < 1.05), 'and a tap on it again zooms back out');
    await m.ctx.close();

    // night 9: the pay phone's receiver and keys are tapped where they are
    m = await mobile(devices['iPhone 13 landscape'], '?level=9&go&seed=1');
    await m.pg.evaluate(() => { G.L.creatures.forEach(c => { c.hold = c.dist; }); });
    const rx = await lookFor(m.pg, 'target', 'receiver');
    if (rx) { await m.pg.touchscreen.tap(rx.x, rx.y); await m.pg.waitForTimeout(400); }
    check(await m.pg.evaluate(() => G.L.s.hook === 'off'), 'night 9: a tap on the receiver lifts it');
    await m.ctx.close();

    // the things held float over the view on a phone: no strip under them, the view the whole height of the screen; a tap
    // on a slot switches to it and is not a tap on the scene, and a swipe that starts on a slot does not turn the view
    m = await mobile(devices['iPhone 13 landscape'], '?level=5&go&seed=1');
    await m.pg.evaluate(() => { G.L.creature.hold = G.L.creature.dist; for (const it of G.L.items.filter(i => !i.taken).slice(0, 4)) { it.taken = true; G.inv.push(it); } G.active = 0; G.invSig = ''; });
    await m.pg.waitForTimeout(300);
    r = await m.pg.evaluate(() => {
      const cv = UI.canvas.getBoundingClientRect(), inv = UI.inv.getBoundingClientRect(), zb = UI.zoomBtn.getBoundingClientRect();
      const slots = [...UI.inv.querySelectorAll('.slot')], st = getComputedStyle(slots[0]);
      const hit = (a, c) => a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top;
      const s0 = slots[0].getBoundingClientRect(), hb = G.hand.box;
      return {
        n: slots.length, full: cv.top === 0 && cv.height === innerHeight && cv.width === innerWidth && R.H === innerHeight && R.viewY === 0,
        floats: inv.width < innerWidth * 0.6 && getComputedStyle(UI.inv).backgroundColor === 'rgba(0, 0, 0, 0)' && /radial-gradient/.test(st.backgroundImage) && st.boxShadow !== 'none',
        low: innerHeight - inv.bottom < 30, clearZoom: !hit(inv, zb), onTop: document.elementFromPoint(s0.left + s0.width / 2, s0.top + s0.height / 2).closest('.slot') === slots[0],
        hand: !hb || !(hb.x0 < inv.right && hb.x1 > inv.left && hb.y0 < inv.bottom && hb.y1 > inv.top),
      };
    });
    check(r.n >= 3 && r.full && r.floats && r.low && r.clearZoom && r.onTop && r.hand, 'on a phone the held things float over the view: the view runs the whole height, no strip under the slots (each its own see-through backing), clear of the zoom button and the hand (' + JSON.stringify(r) + ')');
    await m.pg.screenshot({ path: path.join(__dirname, 'shots', 'phone-slots.png') });
    // the view fills the page edge to edge whatever the browser's bars do: the toolbar sliding in (a shorter page), and a
    // resize whose innerWidth/innerHeight have not caught up with the page yet (Safari): the canvas is measured from the
    // page it covers, so there are no black bars and the menu, zoom and slots all sit on the view
    const edge = () => m.pg.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => {
      const cv = UI.canvas.getBoundingClientRect(), hud = UI.hud.getBoundingClientRect(), vv = window.visualViewport;
      const inside = el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.left >= cv.left && b.right <= cv.right && b.top >= cv.top && b.bottom <= cv.bottom; };
      res({ cv: [cv.left, cv.top, cv.width, cv.height], hud: [hud.width, hud.height], vv: vv ? [vv.width, vv.height] : null, R: [R.W, R.H, R.viewY], px: [UI.canvas.width, UI.canvas.height],
        ok: cv.left === 0 && cv.top === 0 && cv.width === hud.width && cv.height === hud.height && (!vv || (Math.abs(cv.width - vv.width) < 1 && Math.abs(cv.height - vv.height) < 1)) && R.W === Math.round(cv.width) && R.H === Math.round(cv.height) && R.viewY === 0,
        on: inside(UI.menuBtn) && inside(UI.zoomBtn) && inside(UI.inv) });
    }))));
    const vp0 = m.pg.viewportSize();
    const e0 = await edge();
    await m.pg.setViewportSize({ width: vp0.width, height: vp0.height - 40 }); await m.pg.waitForTimeout(200);
    const e1 = await edge();
    await m.pg.evaluate(() => { Object.defineProperty(window, 'innerHeight', { get: () => 200, configurable: true }); Object.defineProperty(window, 'innerWidth', { get: () => 300, configurable: true }); });
    await m.pg.setViewportSize(vp0); await m.pg.waitForTimeout(200);
    const e2 = await edge();
    await m.pg.evaluate(() => { delete window.innerHeight; delete window.innerWidth; });
    check(e0.ok && e0.on && e1.ok && e1.on && e2.ok && e2.on && e2.R[1] === vp0.height, 'iPhone landscape: the view fills the whole page edge to edge, no black bars, as the toolbar slides in and on a resize whose window size is stale, with the menu, zoom and slots on it (' + JSON.stringify([e0, e1, e2]) + ')');
    const slotAt = i => m.pg.evaluate(i => { const q = UI.inv.querySelectorAll('.slot')[i].getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, i);
    const before = await m.pg.evaluate(() => ({ d: G.cam.dirIdx, n: G.inv.length, down: G.cam.tPitch > 0.5 }));
    let sp2 = await slotAt(2);
    await m.touch('touchStart', sp2.x, sp2.y); await m.touch('touchEnd'); await m.pg.waitForTimeout(250);
    r = await m.pg.evaluate(sp => { const el = document.elementFromPoint(sp.x, sp.y); return { a: G.active, d: G.cam.dirIdx, n: G.inv.length, state: G.state, out: G.L.s.outcomes.length, at: el && (el.id || el.className || el.tagName), sp }; }, sp2);
    check(r.a === 2 && r.d === before.d && r.n === before.n && r.state === 'play' && r.out === 0, 'a tap on a slot switches to it, and is not a tap on the scene behind it (' + JSON.stringify(r) + ')');
    sp2 = await slotAt(1);
    await m.swipe(sp2.x, sp2.y, sp2.x - 160, sp2.y - 120);
    await m.swipe(sp2.x, sp2.y, sp2.x + 160, sp2.y);
    r = await m.pg.evaluate(() => ({ d: G.cam.dirIdx, down: G.cam.tPitch > 0.5, n: G.inv.length }));
    check(r.d === before.d && r.down === before.down && r.n === before.n, 'a swipe that starts on a slot does not turn the view or look down (' + JSON.stringify(r) + ')');
    await m.ctx.close();
    // full screen: a button top right, on the title and in a night; it goes in (the whole page, then the screen held on its
    // side), shows the way out, and comes out; never a tap on the scene, a swipe or a step of the title (the browser's own
    // full screen is stubbed: a headless one has none to give)
    const fsStub = enabled => {
      window.__fs = null; window.__fsCalls = []; window.__lock = [];
      Object.defineProperty(document, 'fullscreenElement', { get: () => window.__fs, configurable: true });
      Object.defineProperty(document, 'fullscreenEnabled', { get: () => enabled, configurable: true });
      Object.defineProperty(document, 'webkitFullscreenEnabled', { get: () => enabled, configurable: true });   // (Chromium has both)
      Element.prototype.requestFullscreen = function () { window.__fsCalls.push(this === document.documentElement ? 'page' : 'other'); window.__fs = this; document.dispatchEvent(new Event('fullscreenchange')); return Promise.resolve(); };
      document.exitFullscreen = function () { window.__fsCalls.push('exit'); window.__fs = null; document.dispatchEvent(new Event('fullscreenchange')); return Promise.resolve(); };
      if (screen.orientation) screen.orientation.lock = o => { window.__lock.push(o); return Promise.reject(new Error('not here')); };
    };
    for (const [dn, q] of [['Pixel 7 landscape', ''], ['iPhone 13 landscape', '?level=1&go&seed=1']]) {
      const ctx = await browser.newContext(devices[dn]);
      await ctx.addInitScript(fsStub, true);
      const pg2 = await ctx.newPage();
      pg2.on('pageerror', e => errors.push('PAGEERROR (fullscreen) ' + e.message));
      await pg2.goto(URL + q); await pg2.waitForTimeout(500);
      if (q) await pg2.evaluate(() => { G.L.creature.hold = G.L.creature.dist; });
      const box = () => pg2.evaluate(() => {
        const e = UI.fsBtn, b = e.getBoundingClientRect(), c = UI.compass.getBoundingClientRect(), at = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return { d: getComputedStyle(e).display, r: Math.round(innerWidth - b.right), t: Math.round(b.top), clear: !(b.left < c.right && b.right > c.left && b.top < c.bottom && b.bottom > c.top), on: e.classList.contains('on'), label: e.getAttribute('aria-label'), top: !!at && e.contains(at) };
      });
      const s0 = await pg2.evaluate(() => ({ state: G.state, menu: MENU.kind, d: G.cam.dirIdx, inv: G.inv.length }));
      const b0 = await box();
      check(b0.d === 'flex' && b0.r < 40 && b0.t < 30 && b0.clear && b0.top && !b0.on, dn + (q ? ', in a night' : ', on the title') + ': the full screen button top right, clear of the compass (' + JSON.stringify(b0) + ')');
      await pg2.tap('#fsBtn'); await pg2.waitForTimeout(250);
      const b1 = await box(), r1 = await pg2.evaluate(() => ({ calls: window.__fsCalls.slice(), lock: window.__lock.slice(), state: G.state, menu: MENU.kind, d: G.cam.dirIdx, inv: G.inv.length, h: UI.canvas.getBoundingClientRect().height === innerHeight }));
      await pg2.screenshot({ path: path.join(__dirname, 'shots', 'phone-fullscreen-' + (q ? 'night' : 'title') + '.png') });
      check(r1.calls.join() === 'page' && r1.lock.join() === 'landscape' && b1.on && b1.d === 'flex' && /leave/.test(b1.label) && r1.h, dn + ': a tap goes full screen (the whole page), asks for the screen held on its side (a refusal ignored), and the button stays to come out (' + JSON.stringify([r1, b1]) + ')');
      check(r1.state === s0.state && r1.menu === s0.menu && r1.d === s0.d && r1.inv === s0.inv, dn + ': the tap is the button\'s alone: nothing behind it moves on, turns or is picked up (' + JSON.stringify([s0, r1]) + ')');
      await pg2.tap('#fsBtn'); await pg2.waitForTimeout(250);
      const b2 = await box(), r2 = await pg2.evaluate(() => ({ calls: window.__fsCalls.slice(), state: G.state }));
      check(r2.calls.join() === 'page,exit' && !b2.on && b2.d === 'flex' && r2.state === s0.state, dn + ': tapped again, it comes out of full screen (' + JSON.stringify([r2, b2]) + ')');
      await ctx.close();
    }
    // where the page cannot go full screen (Safari on an iPhone), there is no button; nor on a desktop, whose slots are as they were
    {
      const ctx = await browser.newContext(devices['iPhone 13 landscape']);
      await ctx.addInitScript(fsStub, false);
      const pg2 = await ctx.newPage(); await pg2.goto(URL); await pg2.waitForTimeout(400);
      const d1 = await pg2.evaluate(() => getComputedStyle(UI.fsBtn).display);
      await ctx.close();
      const dp = await browser.newPage(); await dp.goto(URL + '?level=5&go&seed=1'); await dp.waitForTimeout(400);
      const d2 = await dp.evaluate(() => { for (const it of G.L.items.slice(0, 2)) { it.taken = true; G.inv.push(it); } G.invSig = ''; return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => { const sl = UI.inv.querySelector('.slot'); res({ fs: getComputedStyle(UI.fsBtn).display, bg: getComputedStyle(sl).backgroundImage, w: sl.getBoundingClientRect().width }); }))); });
      await dp.close();
      check(d1 === 'none' && d2.fs === 'flex' && /linear-gradient/.test(d2.bg) && d2.w === 66, 'no full screen button where the page cannot have it (an iPhone); on a desktop there is one, and its slots are as they were (' + JSON.stringify([d1, d2]) + ')');
    }
    // on a desktop: the button top right on the title and in a night, clear of the compass and the objective; a click is
    // the button's alone (no step of the title, nothing in the night); F goes in and out too
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 760 } });
      await ctx.addInitScript(fsStub, true);
      const dp = await ctx.newPage();
      for (const q of ['', '?level=1&go&seed=1']) {
        await dp.goto(URL + q); await dp.waitForTimeout(400);
        if (q) await dp.evaluate(() => { G.L.creature.hold = G.L.creature.dist; G.L.text.objective = 'a long objective to see it keeps clear of the button'; UI.objective.textContent = G.L.text.objective; });
        const g = await dp.evaluate(() => { const b = UI.fsBtn.getBoundingClientRect(), c = UI.compass.getBoundingClientRect(), o = UI.objective.getBoundingClientRect(), hit = (a, z) => a.left < z.right && a.right > z.left && a.top < z.bottom && a.bottom > z.top; return { d: getComputedStyle(UI.fsBtn).display, r: Math.round(innerWidth - b.right), t: Math.round(b.top), compass: hit(b, c), obj: o.width > 0 && hit(b, o), objRight: Math.round(innerWidth - o.right) }; });
        const s0 = await dp.evaluate(() => ({ st: G.state, step: TITLE.step, inv: G.inv.length, d: G.cam.dirIdx }));
        await dp.click('#fsBtn'); await dp.waitForTimeout(250);
        const s1 = await dp.evaluate(() => ({ st: G.state, step: TITLE.step, inv: G.inv.length, d: G.cam.dirIdx, on: UI.fsBtn.classList.contains('on'), calls: window.__fsCalls.join() }));
        await dp.keyboard.press('f'); await dp.waitForTimeout(150);
        const s2 = await dp.evaluate(() => ({ on: UI.fsBtn.classList.contains('on'), calls: window.__fsCalls.join() }));
        await dp.keyboard.press('F'); await dp.waitForTimeout(150);
        const s3 = await dp.evaluate(() => ({ on: UI.fsBtn.classList.contains('on'), calls: window.__fsCalls.join(), st: G.state }));
        check(g.d === 'flex' && g.r < 30 && g.t < 24 && !g.compass && !g.obj && s1.on && s1.calls === 'page' && s1.st === s0.st && s1.step === s0.step && s1.inv === s0.inv && s1.d === s0.d && !s2.on && s2.calls === 'page,exit' && s3.on && s3.st === s0.st,
          'a desktop, ' + (q ? 'in a night' : 'on the title') + ': the full screen button top right, clear of the compass and objective; a click goes in and is nothing else, F comes out and goes in again (' + JSON.stringify([g, s0, s1, s2, s3]) + ')');
      }
      await ctx.close();
    }

    // an older save that had the touch buttons on the left: the setting is gone, and the rest kept
    const sp = await browser.newPage();
    await sp.goto(URL); await sp.waitForTimeout(200);
    r = await sp.evaluate(() => { const d = JSON.parse(JSON.stringify(SAVE.data)); d.settings.touchLeft = true; d.settings.captions = true; localStorage.setItem('itscoming.v2', JSON.stringify(d)); SAVE.load(); return { left: 'touchLeft' in SAVE.data.settings, rev: SAVE.data.settings.swipeReverse, cap: SAVE.data.settings.captions }; });
    check(!r.left && r.rev === false && r.cap === true, 'an older save with the touch buttons on the left loads without that setting, the rest kept (' + JSON.stringify(r) + ')');
    await sp.evaluate(() => { localStorage.clear(); }); await sp.close();
  }

  if (errors.length) { failures++; console.log('PAGE ERRORS:\n' + errors.join('\n')); }
  console.log(failures ? ('\n' + failures + ' FAILURES') : '\nALL CHECKS PASSED');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
