'use strict';
// Settings' Calibrate dialogs: Volume (the main volume's slider between the quietest sound in the game and the loudest,
// each played five times from the left speaker over to the right) and Brightness (the thing on the title, the shape of it
// alone in The Void's dark). From the title, from a paused night (the sound still plays), from the warning before a new
// game, by keys, a pad and touch, on a desktop and on a phone on its side; and the two sounds rendered offline through the
// game's own chain, against the heartbeat and the sting as the game plays them.
// Run on its own (node test/settings.js) or from test/features.js, which hands it its browser and its check.
const path = require('path');
const fs = require('fs');
const T = require('./lib');
const ROOT = path.join(__dirname, '..');
const VOL_TEXT = 'Adjust your device and speaker volume and/or the slider below until you can hear both of these sounds comfortably.';
const BRIGHT_TEXT = 'Increase your device brightness until you can barely see the outline of this creature';

async function run(browser, check) {
  const shot = (page, n) => { fs.mkdirSync(T.SHOTS, { recursive: true }); return page.screenshot({ path: path.join(T.SHOTS, n + '.png') }); };
  const newPage = async (opts) => {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 760 } }, opts || {}));
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
    return { ctx, page, errors };
  };
  const focusAct = page => page.evaluate(() => document.activeElement && document.activeElement.dataset.act);
  // the volume dialog as it is laid out: its words, the slider, the two play buttons each with its word under it, Done
  const volLook = (page, sel) => page.evaluate(sel => {
    const root = document.querySelector(sel), r = e => e.getBoundingClientRect(), q = s => root.querySelector(s);
    const qb = q('button[data-act="calquiet"]'), lb = q('button[data-act="calloud"]'), qn = qb.parentElement.querySelector('.calnote'), ln = lb.parentElement.querySelector('.calnote'), sl = q('input[data-set="master"]'), done = q('button[data-act="caldone"]');
    const all = [q('.caltext'), sl, qb, lb, qn, ln, done].map(r);
    return { h: q('h1').textContent, text: q('.caltext').textContent, textColor: getComputedStyle(q('.caltext')).color, quiet: qb.firstChild.textContent, loud: lb.firstChild.textContent, qNote: qn.textContent, lNote: ln.textContent,
      dots: qb.querySelectorAll('.caldots i').length + lb.querySelectorAll('.caldots i').length, slider: !!sl && sl.type === 'range', pct: sl.parentElement.querySelector('.pct').textContent, done: done.textContent,
      order: r(q('.caltext')).bottom <= r(sl).top && r(sl).bottom <= r(qb).top && r(qb).bottom <= r(qn).top && r(qn).bottom <= r(done).top,
      side: Math.abs(r(qb).top - r(lb).top) < 2 && r(qb).right <= r(lb).left, under: r(qn).left >= r(qb).left - 2 && r(qn).right <= r(qb).right + 2 && r(ln).left >= r(lb).left - 2 && r(ln).right <= r(lb).right + 2,
      inView: all.every(b => b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth), targets: [qb, lb, done].every(b => r(b).height >= 36),
      ring: [...root.querySelectorAll('button[data-act], input[data-set]')].map(e => e.dataset.act || e.dataset.set).join(), focus: document.activeElement && (document.activeElement.dataset.act || document.activeElement.dataset.set) };
  }, sel);
  // the brightness dialog's shape, read back off its canvas: the background, the brightest and how much of it there is
  const brightLook = (page, sel) => page.evaluate(sel => {
    const root = document.querySelector(sel), cv = root.querySelector('canvas.calshape'), r = cv.getBoundingClientRect(), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
    let max = [0, 0, 0], robe = 0, other = 0, top = cv.height, bottom = 0;
    for (let i = 0; i < d.length; i += 4) {
      const c = [d[i], d[i + 1], d[i + 2]];
      if (c[0] + c[1] + c[2] > max[0] + max[1] + max[2]) max = c;
      if (c[0] === 12 && c[1] === 10 && c[2] === 15) { robe++; const y = Math.floor(i / 4 / cv.width); top = Math.min(top, y); bottom = Math.max(bottom, y); } else if (c[0] || c[1] || c[2]) other++;
    }
    const corner = [d[0], d[1], d[2]];
    return { h: root.querySelector('h1').textContent, text: root.querySelector('.caltext').textContent, w: r.width, hgt: r.height, inView: r.top >= 0 && r.bottom <= innerHeight && root.querySelector('button[data-act="caldone"]').getBoundingClientRect().bottom <= innerHeight,
      corner: corner.join(), max: max.join(), robeShare: robe / (d.length / 4), otherShare: other / (d.length / 4), tall: (bottom - top) / cv.height, done: root.querySelector('button[data-act="caldone"]').textContent, focus: document.activeElement && document.activeElement.dataset.act };
  }, sel);

  console.log('== Settings: Calibrate, from the title ==');
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(T.INDEX); await page.waitForTimeout(300);
    const panelLook = await page.evaluate(() => { MENU.show('howto', { from: 'title' }); const p = document.querySelector('#overlay .panel'), c = getComputedStyle(p), o = c.backgroundColor + ' ' + c.borderTopWidth + ' ' + c.borderTopColor; MENU.show('title'); return o; });
    await page.click('#overlay button[data-act="settings"]'); await page.waitForTimeout(150);
    await page.click('#overlay button[data-act="calvol"]'); await page.waitForTimeout(150);
    let v = await volLook(page, '#overlay .panel');
    const card = await page.evaluate(() => { const p = document.querySelector('#overlay .panel'), c = getComputedStyle(p); return { look: c.backgroundColor + ' ' + c.borderTopWidth + ' ' + c.borderTopColor, calp: p.classList.contains('calp'), role: p.getAttribute('role'), kind: MENU.kind, sub: MENU.sub }; });
    check(card.look === panelLook && card.calp && card.role === 'dialog' && card.kind === 'settings' && card.sub === 'volume', 'Volume\'s Calibrate opens its dialog, in the same card as the others (' + JSON.stringify([card, panelLook]) + ')');
    check(v.h === 'Volume' && v.text === VOL_TEXT && v.slider && v.pct === '100%' && v.quiet === 'Play the quietest sound in the game' && v.loud === 'Play the loudest sound in the game' && v.dots === 10 &&
      v.qNote === 'Increase volume until you can hear this comfortably' && v.lNote === 'Decrease volume until you can hear this comfortably' && v.done === 'Done',
      'its words at the top, the main volume\'s slider (its percentage beside it), the two play buttons, each with its word under it, and Done (' + JSON.stringify(v) + ')');
    check(v.order && v.side && v.under && v.inView && v.focus === 'calquiet' && v.ring === 'master,calquiet,calloud,caldone', 'laid out top to bottom, the play buttons side by side, each word under its own button, all in view; the first play button focused (' + JSON.stringify(v) + ')');
    await shot(page, 'settings-volume-desktop');
    // the slider moves the main volume, its percentage following
    await page.evaluate(() => document.querySelector('#overlay input[data-set="master"]').focus());
    await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(60);
    v = await page.evaluate(() => ({ m: SAVE.data.settings.master, pct: document.querySelector('#overlay .pct').textContent, aria: document.querySelector('#overlay input[data-set="master"]').getAttribute('aria-valuetext'), saved: JSON.parse(localStorage.getItem('itscoming.v2')).settings.master }));
    check(Math.abs(v.m - 0.95) < 1e-6 && v.pct === '95%' && v.aria === '95%' && Math.abs(v.saved - 0.95) < 1e-6, 'left on its slider turns the volume down, its percentage following, saved (' + JSON.stringify(v) + ')');
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60);
    // the quietest: five of the heartbeat's first beat, a steady 2 s apart, panned from the left over to the right
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(300);
    const q1 = await page.evaluate(() => ({ c: AUDIO.calibration, cls: document.querySelector('button[data-act="calquiet"]').classList.contains('playing'), lit: [...document.querySelectorAll('button[data-act="calquiet"] .caldots i')].map(i => +i.classList.contains('on')).join(''), running: AUDIO.running() }));
    await page.waitForTimeout(2000);
    const q2 = await page.evaluate(() => ({ c: AUDIO.calibration, lit: [...document.querySelectorAll('button[data-act="calquiet"] .caldots i')].map(i => +i.classList.contains('on')).join('') }));
    await page.waitForTimeout(6600);
    const q3 = await page.evaluate(() => ({ c: AUDIO.calibration, cls: document.querySelector('button[data-act="calquiet"]').classList.contains('playing'), lit: [...document.querySelectorAll('button[data-act="calquiet"] .caldots i')].map(i => +i.classList.contains('on')).join(''), gap: AUDIO.CAL.gap }));
    check(q1.c.which === 'quiet' && q1.c.playing && q1.c.pans.join() === '-1' && q1.cls && q1.lit === '10000' && q1.running && q2.c.pans.join() === '-1,-0.5' && q2.lit === '01000',
      'Play the quietest: it plays, from the left first, its first mark lit; 2 s on the second, a little right of it (' + JSON.stringify([q1, q2]) + ')');
    check(q3.c.pans.join() === '-1,-0.5,0,0.5,1' && !q3.c.playing && !q3.cls && q3.lit === '00000' && q3.gap === 2, 'five in all, a steady 2 s apart, left to right across them (-1, -0.5, 0, 0.5, 1); then it is done, the marks out (' + JSON.stringify(q3) + ')');
    // the loudest, pressed again while it plays: it starts over (no second one on top of the first); and the quietest
    // pressed while the loudest plays takes over from it
    await page.click('#overlay button[data-act="calloud"]'); await page.waitForTimeout(2300);
    const l1 = await page.evaluate(() => AUDIO.calibration);
    await page.click('#overlay button[data-act="calloud"]'); await page.waitForTimeout(300);
    const l2 = await page.evaluate(() => ({ c: AUDIO.calibration, lit: [...document.querySelectorAll('button[data-act="calloud"] .caldots i')].map(i => +i.classList.contains('on')).join('') }));
    await page.waitForTimeout(2000);
    const l3 = await page.evaluate(() => AUDIO.calibration);
    check(l1.which === 'loud' && l1.pans.join() === '-1,-0.5' && l2.c.playing && l2.c.pans.join() === '-1' && l2.lit === '10000' && l3.pans.join() === '-1,-0.5', 'Play the loudest, and again while it plays: it starts over from the left, one at a time, not one over the other (' + JSON.stringify([l1, l2, l3]) + ')');
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(300);
    const l4 = await page.evaluate(() => ({ c: AUDIO.calibration, loud: document.querySelector('button[data-act="calloud"]').classList.contains('playing'), quiet: document.querySelector('button[data-act="calquiet"]').classList.contains('playing') }));
    check(l4.c.which === 'quiet' && l4.c.pans.join() === '-1' && !l4.loud && l4.quiet, 'the quietest pressed while the loudest plays: the loudest stops, the quietest plays (' + JSON.stringify(l4) + ')');
    // Esc is Done: Settings again, the focus on Volume's Calibrate, the sound stopped
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    v = await page.evaluate(() => ({ kind: MENU.kind, sub: MENU.sub, h: document.querySelector('#overlay h1').textContent, focus: document.activeElement.dataset.act, playing: AUDIO.calibration.playing, st: G.state }));
    check(v.kind === 'settings' && !v.sub && v.h === 'Settings' && v.focus === 'calvol' && !v.playing && v.st === 'title', 'Esc in it: Settings again, Volume\'s Calibrate focused, the sound stopped (' + JSON.stringify(v) + ')');
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    const k1 = await page.evaluate(() => MENU.sub);
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); const k2 = await focusAct(page);
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    v = await page.evaluate(() => ({ sub: MENU.sub, focus: document.activeElement.dataset.act }));
    check(k1 === 'volume' && k2 === 'caldone' && !v.sub && v.focus === 'calvol', 'by the keys: Enter on Calibrate opens it, Tab goes round to Done, Enter on Done is Settings again, Calibrate focused (' + JSON.stringify([k1, k2, v]) + ')');
    // Brightness
    await page.click('#overlay button[data-act="calbright"]'); await page.waitForTimeout(200);
    let b = await brightLook(page, '#overlay .panel');
    check(b.h === 'Brightness' && b.text === BRIGHT_TEXT && b.done === 'Done' && b.focus === 'caldone', 'Brightness\'s Calibrate opens its dialog: its words, the creature, Done focused (' + JSON.stringify(b) + ')');
    check(b.corner === '0,0,0' && b.max === '12,10,15' && b.robeShare > 0.02 && b.tall > 0.8 && b.hgt >= 300 && b.w >= 400 && b.inView, 'the title\'s creature, the whole of it standing, in the demon\'s robe colour unlit (12, 10, 15) on the void\'s black, nothing lighter (no glow, no light behind it, no eyes), large (' + JSON.stringify(b) + ')');
    await shot(page, 'settings-brightness-desktop');
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    v = await page.evaluate(() => ({ sub: MENU.sub, focus: document.activeElement.dataset.act }));
    await page.click('#overlay button[data-act="calbright"]'); await page.waitForTimeout(150);
    await page.click('#overlay button[data-act="caldone"]'); await page.waitForTimeout(150);
    const v2 = await page.evaluate(() => ({ sub: MENU.sub, kind: MENU.kind, focus: document.activeElement.dataset.act }));
    check(!v.sub && v.focus === 'calbright' && !v2.sub && v2.kind === 'settings' && v2.focus === 'calbright', 'Esc or Done: Settings again, Brightness\'s Calibrate focused (' + JSON.stringify([v, v2]) + ')');
    const step0 = await page.evaluate(() => TITLE.step);
    await page.click('#overlay button[data-act="back"]'); await page.waitForTimeout(150);
    check(await page.evaluate(s0 => MENU.kind === 'title' && TITLE.step === s0 + 1, step0), 'and Back from Settings: the title, the thing a step nearer, as after any dialog');
    if (errors.length) check(false, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  }

  console.log('== Settings: Calibrate, from a paused night (the sound still plays) ==');
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(T.INDEX + '?level=13&go'); await page.waitForTimeout(800);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    await page.click('#overlay button[data-act="settings"]'); await page.waitForTimeout(150);
    await page.click('#overlay button[data-act="calvol"]'); await page.waitForTimeout(150);
    await page.evaluate(() => AUDIO.suspend()); await page.waitForTimeout(150);   // (paused: the sound is held)
    const before = await page.evaluate(() => ({ st: G.state, running: AUDIO.running(), sub: MENU.sub }));
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ st: G.state, running: AUDIO.running(), c: AUDIO.calibration }));
    check(before.st === 'paused' && !before.running && before.sub === 'volume' && after.st === 'paused' && after.running && after.c.playing && after.c.pans.join() === '-1', 'paused, the sound held: Play the quietest plays all the same, the night still paused (' + JSON.stringify([before, after]) + ')');
    await page.click('#overlay button[data-act="caldone"]'); await page.waitForTimeout(150);
    let v = await page.evaluate(() => ({ kind: MENU.kind, sub: MENU.sub, focus: document.activeElement.dataset.act, playing: AUDIO.calibration.playing, st: G.state }));
    check(v.kind === 'settings' && !v.sub && v.focus === 'calvol' && !v.playing && v.st === 'paused', 'Done: Settings again, over the paused night, Calibrate focused, the sound stopped (' + JSON.stringify(v) + ')');
    await page.click('#overlay button[data-act="calbright"]'); await page.waitForTimeout(150);
    const b = await brightLook(page, '#overlay .panel');
    check(b.max === '12,10,15' && b.robeShare > 0.02 && b.inView, 'and Brightness from there too (' + JSON.stringify(b) + ')');
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    v = await page.evaluate(() => ({ kind: MENU.kind, focus: document.activeElement.dataset.act, st: G.state }));
    check(v.kind === 'pause' && v.focus === 'settings' && v.st === 'paused', 'Esc, Esc: Settings, then the pause menu, Settings focused (' + JSON.stringify(v) + ')');
    if (errors.length) check(false, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  }

  console.log('== Settings: Calibrate, from the warning before a new game ==');
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(T.INDEX); await page.waitForTimeout(300);
    await page.evaluate(() => { window.DISCLAIMER_TEST = 'force'; window.PROLOGUE_TEST = true; });
    await page.click('#overlay button[data-act="begin"]'); await page.waitForTimeout(700);
    await page.click('#disclaimer .dsettings'); await page.waitForTimeout(200);
    await page.click('#disclaimer button[data-act="calvol"]'); await page.waitForTimeout(200);
    let v = await volLook(page, '#disclaimer .dcard');
    check(v.h === 'Volume' && v.text === VOL_TEXT && v.textColor === 'rgb(207, 200, 186)' && v.side && v.under && v.inView && v.focus === 'calquiet', 'from the warning\'s Adjust settings, Volume\'s Calibrate: the same dialog in its card (its words not the warning\'s red) (' + JSON.stringify(v) + ')');
    await page.click('#disclaimer button[data-act="calloud"]'); await page.waitForTimeout(300);
    const c = await page.evaluate(() => AUDIO.calibration);
    check(c.which === 'loud' && c.playing && c.pans.join() === '-1', 'and its sounds play there (' + JSON.stringify(c) + ')');
    await shot(page, 'settings-volume-warning');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    v = await page.evaluate(() => ({ h: document.querySelector('#disclaimer h1') && document.querySelector('#disclaimer h1').textContent, focus: document.activeElement.dataset.act, warn: !!document.querySelector('#disclaimer .daccept'), playing: AUDIO.calibration.playing }));
    check(v.h === 'Settings' && v.focus === 'calvol' && !v.warn && !v.playing, 'Esc in it: Settings again (not the warning), Calibrate focused, the sound stopped (' + JSON.stringify(v) + ')');
    // a pad: A on Brightness's Calibrate, B is Done; Start in it is Done too; B in Settings is the warning
    await page.evaluate(() => { window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad]; });
    const padTap = async i => { await page.evaluate(i => { window._pad.buttons[i].pressed = true; }, i); await page.waitForTimeout(80); await page.evaluate(i => { window._pad.buttons[i].pressed = false; }, i); await page.waitForTimeout(80); };
    await padTap(13); const p1 = await focusAct(page);
    await padTap(0); await page.waitForTimeout(150);
    const b = await brightLook(page, '#disclaimer .dcard');
    await padTap(1); await page.waitForTimeout(150);
    const p2 = await page.evaluate(() => ({ h: document.querySelector('#disclaimer h1').textContent, focus: document.activeElement.dataset.act }));
    await padTap(0); await page.waitForTimeout(150); await padTap(9); await page.waitForTimeout(150);
    const p3 = await page.evaluate(() => ({ h: document.querySelector('#disclaimer h1').textContent, focus: document.activeElement.dataset.act }));
    await padTap(13); const p4 = await page.evaluate(() => document.activeElement.closest('.seg') && document.activeElement.closest('.seg').dataset.set + ':' + document.activeElement.textContent);
    await padTap(15); const p5 = await page.evaluate(() => SAVE.data.settings.effects);
    await padTap(0); const p6 = await page.evaluate(() => ({ fx: SAVE.data.settings.effects, up: !!document.querySelector('#disclaimer .dset') }));
    await padTap(14);
    await padTap(1); await page.waitForTimeout(150);
    const p7 = await page.evaluate(() => ({ warn: !!document.querySelector('#disclaimer .daccept'), focus: document.activeElement.dataset.act, fx: SAVE.data.settings.effects }));
    await page.evaluate(() => { navigator.getGamepads = () => []; });
    check(p1 === 'calbright' && b.h === 'Brightness' && b.max === '12,10,15' && p2.h === 'Settings' && p2.focus === 'calbright' && p3.h === 'Settings' && p3.focus === 'calbright',
      'a pad there: the d-pad to Brightness\'s Calibrate, A opens it, B is Done (Calibrate focused); A and Start the same (' + JSON.stringify([p1, b.h, p2, p3]) + ')');
    check(p4 === 'effects:Normal' && p5 === 0.5 && p6.fx === 0.5 && p6.up && p7.warn && p7.focus === 'accept' && p7.fx === 1, 'and down to Effects, right chooses Quieter, A on it does nothing else, left Normal again; B in Settings is the warning (' + JSON.stringify([p4, p5, p6, p7]) + ')');
    if (errors.length) check(false, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  }

  console.log('== Settings: Calibrate, on a phone on its side (touch) ==');
  for (const from of ['title', 'warning']) {
    const { ctx, page, errors } = await newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    await page.goto(T.INDEX); await page.waitForTimeout(300);
    let sel = '#overlay .panel', root = '#overlay';
    if (from === 'warning') {
      await page.evaluate(() => { window.DISCLAIMER_TEST = 'force'; window.PROLOGUE_TEST = true; });
      await page.tap('#overlay button[data-act="begin"]'); await page.waitForTimeout(700);
      await page.tap('#disclaimer .dsettings'); await page.waitForTimeout(250);
      sel = '#disclaimer .dcard'; root = '#disclaimer';
    } else { await page.tap('#overlay button[data-act="settings"]'); await page.waitForTimeout(200); }
    const fits = () => page.evaluate(sel => { const p = document.querySelector(sel), sc = p.closest('#disclaimer') || p; return { scroll: sc.scrollHeight - sc.clientHeight, bottom: p.getBoundingClientRect().bottom <= innerHeight + 1 }; }, sel);
    let f0 = await fits();
    const segs = await page.evaluate(root => [...document.querySelectorAll(root + ' .seg [role="radio"], ' + root + ' .calbtn')].every(b => b.getBoundingClientRect().height >= 30), root);
    await page.tap(root + ' .seg[data-set="textSize"] [data-v="1.4"]'); await page.waitForTimeout(150);
    const big = await fits();
    const ts = await page.evaluate(() => SAVE.data.settings.textSize);
    await page.tap(root + ' .seg[data-set="textSize"] [data-v="1"]'); await page.waitForTimeout(100);
    check(f0.scroll <= 0 && f0.bottom && big.scroll <= 0 && ts === 1.4 && segs, from + ', on a phone: Settings fits, its choices tapped (Bigger text, and it still fits), each a fair target (' + JSON.stringify([f0, big, ts, segs]) + ')');
    await page.tap(root + ' button[data-act="calvol"]'); await page.waitForTimeout(250);
    const v = await volLook(page, sel); f0 = await fits();
    check(v.text === VOL_TEXT && v.side && v.under && v.inView && v.targets && f0.scroll <= 0, from + ', on a phone: the volume dialog fits, the play buttons side by side, full-size targets (' + JSON.stringify([v, f0]) + ')');
    await shot(page, 'settings-volume-phone-' + from);
    await page.tap(root + ' button[data-act="calquiet"]'); await page.waitForTimeout(300);
    const c = await page.evaluate(() => AUDIO.calibration);
    await page.tap(root + ' button[data-act="caldone"]'); await page.waitForTimeout(200);
    const back = await page.evaluate(root => ({ h: document.querySelector(root + ' h1').textContent, playing: AUDIO.calibration.playing }), root);
    check(c.which === 'quiet' && c.playing && back.h === 'Settings' && !back.playing, from + ', on a phone: a tap plays it, a tap on Done is Settings again (' + JSON.stringify([c, back]) + ')');
    await page.tap(root + ' button[data-act="calbright"]'); await page.waitForTimeout(250);
    const b = await brightLook(page, sel); f0 = await fits();
    check(b.text === BRIGHT_TEXT && b.max === '12,10,15' && b.hgt >= 150 && b.tall > 0.8 && b.inView && f0.scroll <= 0, from + ', on a phone: the brightness dialog fits, the creature large enough to judge (' + JSON.stringify([b, f0]) + ')');
    await shot(page, 'settings-brightness-phone-' + from);
    await page.tap(root + ' button[data-act="caldone"]'); await page.waitForTimeout(200);
    check(await page.evaluate(root => document.querySelector(root + ' h1').textContent === 'Settings', root), from + ', on a phone: Done, Settings again');
    if (errors.length) check(false, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  }

  console.log('== the calibration\'s sounds, rendered offline through the game\'s own chain ==');
  {
    const { ctx, page, errors } = await newPage();
    await page.goto('about:blank');
    for (const f of ['js/util.js', 'js/soundtune.js', 'js/audio.js']) await page.addScriptTag({ path: path.join(ROOT, f) });
    // each played half a second in (as the game plays them, mid-stream), on an offline context in place of the page's;
    // peak and the loudest 50 ms (RMS), in dBFS, of each channel
    const render = (what, secs, setup) => page.evaluate(async ([what, secs, setup]) => {
      const SR = 44100; let off;
      window.AudioContext = function () { off = new OfflineAudioContext(2, SR * secs, SR); return off; };
      AUDIO.init(); if (setup) new Function(setup)();
      const go = off.resume.bind(off); off.resume = () => Promise.resolve();   // (AUDIO.calibrate resumes the context: here that would render on before its first beat)
      off.suspend(0.5).then(() => { new Function(what)(); setTimeout(go, 80); });
      const buf = await off.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), win = Math.round(SR * 0.05);
      let pl = 0, pr = 0, rms = 0, at = 0, early = 0;
      for (let i = 0; i < L.length; i++) { pl = Math.max(pl, Math.abs(L[i])); pr = Math.max(pr, Math.abs(R[i])); }
      for (let s = 0; s + win <= L.length; s += Math.round(win / 2)) { let a = 0; for (let i = s; i < s + win; i++) a += (L[i] * L[i] + R[i] * R[i]) / 2; a = Math.sqrt(a / win); if (a > rms) { rms = a; at = s / SR; } if (s / SR < 1.5) early = Math.max(early, a); }
      const db = v => 20 * Math.log10(Math.max(1e-9, v));
      return { peak: db(Math.max(pl, pr)), pl: db(pl), pr: db(pr), rms: db(rms), at, early: db(early) };
    }, [what, secs, setup || '']);
    const runs = async (n, what, secs, setup) => { const out = []; for (let i = 0; i < n; i++) { await page.reload(); for (const f of ['js/util.js', 'js/soundtune.js', 'js/audio.js']) await page.addScriptTag({ path: path.join(ROOT, f) }); out.push(await render(what, secs, setup)); } return out; };
    const mean = (a, k) => a.reduce((s, x) => s + x[k], 0) / a.length;
    const fmt = x => +x.toFixed(2);
    const sting = await runs(4, "AUDIO.sfx('sting')", 4), cal = await runs(4, "AUDIO.sfx('stingCalibrate')", 5);
    const loud = { stingPeak: fmt(mean(sting, 'peak')), stingRms: fmt(mean(sting, 'rms')), calPeak: fmt(mean(cal, 'peak')), calRms: fmt(mean(cal, 'rms')), calAt: fmt(mean(cal, 'at')), calEarly: fmt(mean(cal, 'early')) };
    console.log('    sting: peak ' + loud.stingPeak + ' dBFS, loudest 50 ms ' + loud.stingRms + ' dBFS; stingCalibrate: peak ' + loud.calPeak + ', loudest 50 ms ' + loud.calRms + ' (at ' + loud.calAt + ' s; before 1 s in, ' + loud.calEarly + ')');
    check(loud.calRms <= loud.stingRms + 0.25 && loud.calPeak <= loud.stingPeak + 0.6, 'the loudest sound (stingCalibrate, tuned as the sting) is no louder than the sting as the game plays it (' + JSON.stringify(loud) + ')');
    check(loud.calAt > 0.5 + 1.5 && loud.calEarly < loud.calRms - 10, 'and it climbs to its peak: quiet for its first second, loudest after the climb (' + JSON.stringify(loud) + ')');
    const heart = await runs(1, 'AUDIO.heartbeat(0.05, false)', 1), lub = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 5, 0)');
    const lubL = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 5, -1)'), lubR = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 5, 1)');
    const lubQ = await runs(1, "AUDIO.calibrate('quiet')", 1, "AUDIO.CAL.pans.splice(0, 5, 0); AUDIO.setVolume('effects', 0.5)");
    const loudQ = await runs(1, "AUDIO.calibrate('loud')", 5, "AUDIO.CAL.pans.splice(0, 5, 0); AUDIO.setVolume('effects', 0.5)");
    const quiet = { heart: fmt(heart[0].peak), lub: fmt(lub[0].peak), lubLeft: [fmt(lubL[0].pl), fmt(lubL[0].pr)], lubRight: [fmt(lubR[0].pl), fmt(lubR[0].pr)], lubQuieter: fmt(lubQ[0].peak), loudQuieterRms: fmt(loudQ[0].rms) };
    console.log('    heartbeat as first heard (0.05): peak ' + quiet.heart + ' dBFS; the calibration\'s lub: ' + quiet.lub + ' (Effects Quieter: ' + quiet.lubQuieter + ')');
    check(Math.abs(quiet.heart - quiet.lub) < 0.05, 'the quietest sound is the heartbeat\'s first beat as loud as the game first plays it (' + JSON.stringify(quiet) + ')');
    check(Math.abs(quiet.lubLeft[0] - quiet.lub) < 0.05 && quiet.lubLeft[1] < -100 && quiet.lubRight[0] < -100 && Math.abs(quiet.lubRight[1] - quiet.lub) < 0.05, 'panned hard left it is in the left speaker only, hard right the right only (' + JSON.stringify(quiet) + ')');
    check(Math.abs(quiet.lubQuieter - (quiet.lub - 6.02)) < 0.1 && quiet.loudQuieterRms < loud.calRms - 3, 'both go through the effects volume: with Effects Quieter the lub is 6 dB down, the loudest quieter too (' + JSON.stringify(quiet) + ')');
    if (errors.length) check(false, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  }

  console.log('== the brightness dialog\'s colours are The Void\'s ==');
  {
    const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
    check(/robeC = mixc\(\[12, 10, 15\]/.test(src('js/creatures/demon.js')) && /const VOID_PAL = \{ skyTop: \[0, 0, 0\], fog: \[0, 0, 0\]/.test(src('js/levels/night13.js')) && /VOID_BLACK = '#000', ROBE_DARK = 'rgb\(12,10,15\)'/.test(src('js/menu.js')),
      'its black is the void\'s sky and fog, its creature the demon\'s robe unlit (js/creatures/demon.js robeC, js/levels/night13.js VOID_PAL)');
    check(/function shape\(g, x, feet, ppm, col\) \{\s*g\.save\(\); g\.translate\(x, feet\); g\.scale\(ppm, -ppm\); figure\(g, col/.test(src('js/title.js')), 'it is drawn by the title\'s own figure and head (js/title.js TITLE.shape)');
  }
}

module.exports = { run };
if (require.main === module) {
  (async () => {
    const { browser, errors } = await T.launch();
    await run(browser, T.check);
    await T.finish(browser, errors, 'settings');
  })();
}
