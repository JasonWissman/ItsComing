'use strict';
// Settings' Calibrate dialogs: Volume (two sections, Sound effects and Ambience, each its own slider and the two ends of
// what it plays: the effects' quietest and loudest sound, each seven times from the left ear over to the right in about
// two seconds; the ambience's quietest and loudest bed, a few seconds of each; the ambience playing faded out while the
// dialog is open) and Brightness (the thing on the title, the shape of it alone in The Void's dark). From the title, from
// a paused night, from the warning before a new game, by keys, a pad and touch, on a desktop and on a phone on its side;
// and the sounds rendered offline through the game's own chain, against the heartbeat, the sting and the beds as the game
// plays them; every sound through one of the two volumes.
// Run on its own (node test/settings.js) or from test/features.js, which hands it its browser and its check.
const path = require('path');
const fs = require('fs');
const T = require('./lib');
const ROOT = path.join(__dirname, '..');
const VOL_TEXT = 'Adjust your device volume and/or the sliders below until you can hear each of these comfortably.';
const BRIGHT_TEXT = 'Increase your device brightness until you can barely see the outline of this creature';
const QUIET_NOTE = 'Increase volume until you can hear this comfortably', LOUD_NOTE = 'Decrease volume until you can hear this comfortably';
const PANS = '-1,-1,-0.5,0,0.5,1,1';

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
  // the volume dialog as it is laid out: its words; two sections, each its name, its slider and its two play buttons,
  // each with its word under it; Done
  const volLook = (page, sel) => page.evaluate(sel => {
    const root = document.querySelector(sel), r = e => e.getBoundingClientRect(), q = s => root.querySelector(s);
    const secs = [...root.querySelectorAll('.calsec')].map(s => {
      const bs = [...s.querySelectorAll('button.calplay')], sl = s.querySelector('input[type=range]'), notes = bs.map(b => b.parentElement.querySelector('.calnote'));
      return { name: s.querySelector('h2').textContent, label: s.getAttribute('aria-labelledby') && document.getElementById(s.getAttribute('aria-labelledby')).textContent, set: sl && sl.dataset.set, aria: sl && sl.getAttribute('aria-label'), pct: sl && sl.parentElement.querySelector('.pct').textContent,
        acts: bs.map(b => b.dataset.act).join(), labels: bs.map(b => b.firstChild.textContent), notes: notes.map(n => n.textContent), dots: bs.map(b => b.querySelectorAll('.caldots i').length).join(), bars: bs.filter(b => b.querySelector('.calbar')).length,
        order: r(s.querySelector('h2')).top <= r(sl).top && r(sl).bottom <= r(bs[0]).top && r(bs[0]).bottom <= r(notes[0]).top && r(notes[0]).bottom <= r(bs[1]).top && r(bs[1]).bottom <= r(notes[1]).top,
        under: bs.every((b, i) => r(notes[i]).left >= r(b).left - 2 && r(notes[i]).right <= r(b).right + 2), inside: [sl, ...bs, ...notes].every(e => r(e).left >= r(s).left - 1 && r(e).right <= r(s).right + 1),
        targets: bs.every(b => r(b).height >= 32) };
    });
    const S = [...root.querySelectorAll('.calsec')].map(r), done = q('button[data-act="caldone"]');
    const all = [q('.caltext'), ...root.querySelectorAll('.calsec button, .calsec input, .calnote'), done].map(r);
    return { h: q('h1').textContent, text: q('.caltext').textContent, textColor: getComputedStyle(q('.caltext')).color, secs, done: done.textContent,
      side: S.length === 2 && Math.abs(S[0].top - S[1].top) < 2 && S[0].right <= S[1].left, below: S.every(s => s.top >= r(q('.caltext')).bottom && s.bottom <= r(done).top),
      inView: all.every(b => b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth), sliders: root.querySelectorAll('input[type=range]').length, master: !!q('input[data-set="master"]'),
      ring: [...root.querySelectorAll('button[data-act], input[data-set]')].map(e => e.dataset.act || e.dataset.set).join(), focus: document.activeElement && (document.activeElement.dataset.act || document.activeElement.dataset.set) };
  }, sel);
  const volOK = v => v.h === 'Volume' && v.text === VOL_TEXT && v.secs.length === 2 && v.sliders === 2 && !v.master && v.done === 'Done' &&
    v.secs[0].name === 'Sound effects' && v.secs[0].label === 'Sound effects' && v.secs[0].set === 'effects' && v.secs[0].aria === 'Sound effects volume' && v.secs[0].acts === 'calquiet,calloud' &&
    v.secs[0].labels.join('|') === 'Play the quietest sound in the game|Play the loudest sound in the game' && v.secs[0].dots === '7,7' && !v.secs[0].bars &&
    v.secs[1].name === 'Ambience' && v.secs[1].label === 'Ambience' && v.secs[1].set === 'ambient' && v.secs[1].aria === 'Ambience volume' && v.secs[1].acts === 'ambquiet,ambloud' &&
    v.secs[1].labels.join('|') === 'Play the quietest ambience in the game|Play the loudest ambience in the game' && v.secs[1].dots === '0,0' && v.secs[1].bars === 2 &&
    v.secs.every(s => s.notes.join('|') === QUIET_NOTE + '|' + LOUD_NOTE && s.order && s.under && s.inside) && v.ring === 'effects,calquiet,calloud,ambient,ambquiet,ambloud,caldone';
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
  // a calibration pressed and watched: when each of its beats came (ms after the press) and its pans, until it is over
  const watchCal = (page, act, ms) => page.evaluate(([act, ms]) => new Promise(done => {
    const b = document.querySelector('button[data-act="' + act + '"]'), t0 = performance.now(), at = [];
    b.click();
    const iv = setInterval(() => {
      const c = AUDIO.calibration;
      while (c && at.length < c.pans.length) at.push(Math.round(performance.now() - t0));
      if (performance.now() - t0 > ms) { clearInterval(iv); done({ at, pans: c && c.pans.join(), which: c && c.which, playing: c && c.playing, cls: b.classList.contains('playing'), lit: [...b.querySelectorAll('.caldots i')].map(i => +i.classList.contains('on')).join('') }); }
    }, 10);
  }), [act, ms]);
  const lit = (page, act) => page.evaluate(act => [...document.querySelectorAll('button[data-act="' + act + '"] .caldots i')].map(i => +i.classList.contains('on')).join(''), act);
  const levels = page => page.evaluate(() => Object.assign({ hushed: AUDIO.hushed, bed: AUDIO.bed }, AUDIO.levels));

  console.log('== Settings: Calibrate, from the title ==');
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(T.INDEX); await page.waitForTimeout(300);
    const panelLook = await page.evaluate(() => { MENU.show('howto', { from: 'title' }); const p = document.querySelector('#overlay .panel'), c = getComputedStyle(p), o = c.backgroundColor + ' ' + c.borderTopWidth + ' ' + c.borderTopColor; MENU.show('title'); return o; });
    await page.click('#overlay button[data-act="settings"]'); await page.waitForTimeout(150);
    // the title's drone playing under Settings, at the ambience's volume
    await page.waitForTimeout(1200);
    const lv0 = await levels(page);
    await page.click('#overlay button[data-act="calvol"]'); await page.waitForTimeout(150);
    let v = await volLook(page, '#overlay .panel');
    const card = await page.evaluate(() => { const p = document.querySelector('#overlay .panel'), c = getComputedStyle(p); return { look: c.backgroundColor + ' ' + c.borderTopWidth + ' ' + c.borderTopColor, calp: p.classList.contains('calp'), role: p.getAttribute('role'), kind: MENU.kind, sub: MENU.sub }; });
    check(card.look === panelLook && card.calp && card.role === 'dialog' && card.kind === 'settings' && card.sub === 'volume', 'Volume\'s Calibrate opens its dialog, in the same card as the others (' + JSON.stringify([card, panelLook]) + ')');
    check(volOK(v) && v.secs.every(s => s.pct === '100%'), 'its words at the top; two sections, Sound effects and Ambience, each its slider (its percentage beside it, at 100%) and its two play buttons, each with its word under it; Done; no main volume (' + JSON.stringify(v) + ')');
    check(v.side && v.below && v.inView && v.focus === 'calquiet', 'the two sections side by side under the words, all in view; the first play button focused (' + JSON.stringify(v) + ')');
    await shot(page, 'settings-volume-desktop');
    // the ambience faded out of the way while the dialog is open (the title's drone still there under it, silent)
    const lv1 = await levels(page);
    await page.waitForTimeout(1600);
    const lv2 = await levels(page);
    check(lv0.ambient > 0.95 && !lv0.hushed && lv1.hushed && lv2.hushed && lv2.ambient < 0.02 && lv2.bed && lv2.bed.title && lv2.effects > 0.95, 'in it, the title\'s drone fades out (the ambience bus from ' + lv0.ambient.toFixed(2) + ' to ' + lv2.ambient.toFixed(4) + ' in a second and a half), the effects as they were (' + JSON.stringify([lv0, lv1, lv2]) + ')');
    // each slider moves its own volume, its percentage following, saved (the ambience's held down while it is hushed)
    for (const [k, other] of [['effects', 'ambient'], ['ambient', 'effects']]) {
      await page.evaluate(k => document.querySelector('#overlay input[data-set="' + k + '"]').focus(), k);
      await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(200);
      v = await page.evaluate(([k, o]) => { const i = document.querySelector('#overlay input[data-set="' + k + '"]'); return { v: SAVE.data.settings[k], o: SAVE.data.settings[o], pct: i.parentElement.querySelector('.pct').textContent, aria: i.getAttribute('aria-valuetext'), saved: JSON.parse(localStorage.getItem('itscoming.v2')).settings[k], audio: AUDIO.levels.volume[k], cal: AUDIO.levels[k === 'effects' ? 'cal' : 'calAmb'], bus: AUDIO.levels[k] }; }, [k, other]);
      check(Math.abs(v.v - 0.95) < 1e-6 && v.o === 1 && v.pct === '95%' && v.aria === '95%' && Math.abs(v.saved - 0.95) < 1e-6 && Math.abs(v.audio - 0.95) < 1e-6 && Math.abs(v.cal - 0.95) < 0.01 && (k === 'effects' ? Math.abs(v.bus - 0.95) < 0.01 : v.bus < 0.02),
        'left on the ' + k + ' slider turns that volume down (and only that one), its percentage following, saved, heard at once (' + JSON.stringify(v) + ')');
      await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60);
    }
    // the quietest: the heartbeat's lub seven times in about two seconds, twice left, three across, twice right
    const q = await watchCal(page, 'calquiet', 2600);
    const spread = q.at[6] - q.at[0];
    check(q.which === 'quiet' && q.pans === PANS && q.at.length === 7 && spread > 1600 && spread < 2100 && !q.playing && !q.cls && q.lit === '0000000',
      'Play the quietest: seven, ' + spread + ' ms from the first to the last (about two seconds): twice in the left ear, left of centre, centre, right of centre, twice in the right; then done, the marks out (' + JSON.stringify(q) + ')');
    const steps = q.at.map(t => t - q.at[0]);   // (each one's time from the first: on its own timer, so one late does not push the rest)
    check(steps.every((t, i) => Math.abs(t - i * 300) < 160), 'a steady 0.3 s apart (' + steps.join(', ') + ' ms from the first)');
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(120);
    const q1 = await page.evaluate(() => ({ c: AUDIO.calibration, cls: document.querySelector('button[data-act="calquiet"]').classList.contains('playing') }));
    const q1lit = await lit(page, 'calquiet');
    check(q1.c.pans.join() === '-1' && q1.cls && q1lit === '1000000' && q1.c.playing, 'it plays from the left first, its first mark lit (' + JSON.stringify([q1, q1lit]) + ')');
    // the loudest, pressed again while it plays: it starts over; the quietest pressed while the loudest plays takes over
    await page.click('#overlay button[data-act="calloud"]'); await page.waitForTimeout(450);
    const l1 = await page.evaluate(() => AUDIO.calibration);
    await page.click('#overlay button[data-act="calloud"]'); await page.waitForTimeout(100);
    const l2 = await page.evaluate(() => AUDIO.calibration), l2lit = await lit(page, 'calloud');
    check(l1.which === 'loud' && l1.pans.length >= 2 && l1.pans.length < 7 && l2.playing && l2.pans.join() === '-1' && l2lit === '1000000', 'Play the loudest, and again while it plays: it starts over from the left, not one over the other (' + JSON.stringify([l1, l2, l2lit]) + ')');
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(100);
    const l4 = await page.evaluate(() => ({ c: AUDIO.calibration, loud: document.querySelector('button[data-act="calloud"]').classList.contains('playing'), quiet: document.querySelector('button[data-act="calquiet"]').classList.contains('playing') }));
    check(l4.c.which === 'quiet' && l4.c.pans.join() === '-1' && !l4.loud && l4.quiet, 'the quietest pressed while the loudest plays: the loudest stops, the quietest plays (' + JSON.stringify(l4) + ')');
    // the ambience's two: a few seconds of a bed each, its bar filling; one at a time, across the two sections too
    await page.click('#overlay button[data-act="ambquiet"]'); await page.waitForTimeout(1500);
    const a1 = await page.evaluate(() => ({ c: AUDIO.calibration, cls: document.querySelector('button[data-act="ambquiet"]').classList.contains('playing'), fx: document.querySelector('button[data-act="calquiet"]').classList.contains('playing'), bar: parseFloat(getComputedStyle(document.querySelector('button[data-act="ambquiet"] .calbar i')).width) / document.querySelector('button[data-act="ambquiet"] .calbar').clientWidth, lv: AUDIO.levels }));
    check(a1.c.which === 'ambientQuiet' && a1.c.playing && a1.cls && !a1.fx && a1.bar > 0.1 && a1.bar < 0.5 && a1.lv.effects < 0.05 && a1.lv.ambient < 0.02, 'Play the quietest ambience: it plays (the effects calibration stopped), its bar filling; the rest ducked (' + JSON.stringify(a1) + ')');
    await page.click('#overlay button[data-act="calloud"]'); await page.waitForTimeout(100);
    const a2 = await page.evaluate(() => ({ c: AUDIO.calibration, amb: document.querySelector('button[data-act="ambquiet"]').classList.contains('playing'), bar: document.querySelector('button[data-act="ambquiet"] .calbar i').style.width }));
    check(a2.c.which === 'loud' && a2.c.playing && !a2.amb && a2.bar === '0px', 'the loudest sound pressed while it plays: the ambience stops, its bar emptied, the sound plays (' + JSON.stringify(a2) + ')');
    await page.click('#overlay button[data-act="ambloud"]'); await page.waitForTimeout(300);
    const a3 = await page.evaluate(() => ({ c: AUDIO.calibration, len: AUDIO.CAL.bed.len }));
    await page.waitForTimeout(a3.len * 1000);
    const a4 = await page.evaluate(() => ({ c: AUDIO.calibration, cls: document.querySelector('button[data-act="ambloud"]').classList.contains('playing'), lv: AUDIO.levels }));
    check(a3.c.which === 'ambientLoud' && a3.c.playing && !a4.c.playing && !a4.cls && a4.lv.effects > 0.5 && a4.lv.ambient < 0.02 && a3.len >= 4 && a3.len <= 8, 'Play the loudest ambience: a few seconds of it (' + a3.len + ' s), then done; the effects back, the ambience still faded out of the way (' + JSON.stringify([a3, a4]) + ')');
    // Esc is Done: Settings again, the focus on Volume's Calibrate, the sound stopped, the ambience back
    await page.click('#overlay button[data-act="ambquiet"]'); await page.waitForTimeout(200);
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    v = await page.evaluate(() => ({ kind: MENU.kind, sub: MENU.sub, h: document.querySelector('#overlay h1').textContent, focus: document.activeElement.dataset.act, playing: AUDIO.calibration.playing, st: G.state, hushed: AUDIO.hushed }));
    await page.waitForTimeout(1800);
    const lv3 = await levels(page);
    check(v.kind === 'settings' && !v.sub && v.h === 'Settings' && v.focus === 'calvol' && !v.playing && v.st === 'title' && !v.hushed && lv3.ambient > 0.9 && lv3.bed && lv3.bed.title, 'Esc in it: Settings again, Volume\'s Calibrate focused, the sound stopped, the title\'s drone faded back in (' + JSON.stringify([v, lv3]) + ')');
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    const k1 = await page.evaluate(() => MENU.sub);
    for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
    const k2 = await focusAct(page);
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    v = await page.evaluate(() => ({ sub: MENU.sub, focus: document.activeElement.dataset.act }));
    check(k1 === 'volume' && k2 === 'caldone' && !v.sub && v.focus === 'calvol', 'by the keys: Enter on Calibrate opens it, Tab goes round both sections to Done, Enter on Done is Settings again, Calibrate focused (' + JSON.stringify([k1, k2, v]) + ')');
    // Brightness
    await page.click('#overlay button[data-act="calbright"]'); await page.waitForTimeout(200);
    let b = await brightLook(page, '#overlay .panel');
    check(b.h === 'Brightness' && b.text === BRIGHT_TEXT && b.done === 'Done' && b.focus === 'caldone' && !(await page.evaluate(() => AUDIO.hushed)), 'Brightness\'s Calibrate opens its dialog: its words, the creature, Done focused (the ambience not faded for it) (' + JSON.stringify(b) + ')');
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
    check(await page.evaluate(s0 => MENU.kind === 'title' && TITLE.step === s0 + 1, step0), 'and Done in Settings: the title, the thing a step nearer, as after any dialog');
    // at each text size, the volume dialog in view on a laptop's screen
    for (const ts of [1, 1.4, 1.8]) {
      await page.evaluate(ts => { MENU.applySetting('textSize', ts); MENU.show('settings', { from: 'title', sub: 'volume' }); }, ts); await page.waitForTimeout(150);
      v = await volLook(page, '#overlay .panel');
      const sc = await page.evaluate(() => { const p = document.querySelector('#overlay .panel'); return p.scrollHeight - p.clientHeight; });
      check(volOK(v) && v.side && v.inView && sc <= 0, 'text size ' + ts + ': the volume dialog fits a 1280 x 760 screen, its two sections side by side (' + JSON.stringify([sc, v.inView, v.side]) + ')');
      if (ts === 1.8) await shot(page, 'settings-volume-desktop-bigger');
    }
    await page.evaluate(() => { MENU.applySetting('textSize', 1.4); MENU.show('title'); });
    if (errors.length) check(false, 'no page errors: ' + errors.join(' | '));
    await ctx.close();
  }

  console.log('== Settings: Calibrate, from a paused night (the sound still plays; the night\'s ambience faded out of the way) ==');
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(T.INDEX + '?level=7&go'); await page.waitForTimeout(800);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    await page.click('#overlay button[data-act="settings"]'); await page.waitForTimeout(1200);
    const lv0 = await levels(page);
    await page.click('#overlay button[data-act="calvol"]'); await page.waitForTimeout(1800);
    const lv1 = await levels(page);
    check(lv0.ambient > 0.95 && lv0.bed && !lv0.bed.title && lv1.hushed && lv1.ambient < 0.02 && lv1.bed && !lv1.bed.title, 'the night\'s bed (the lighthouse\'s storm) fades out as the volume dialog opens over the paused night (' + JSON.stringify([lv0, lv1]) + ')');
    await page.evaluate(() => AUDIO.suspend()); await page.waitForTimeout(150);   // (paused: the sound is held)
    const before = await page.evaluate(() => ({ st: G.state, running: AUDIO.running(), sub: MENU.sub }));
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(150);
    const after = await page.evaluate(() => ({ st: G.state, running: AUDIO.running(), c: AUDIO.calibration }));
    check(before.st === 'paused' && !before.running && before.sub === 'volume' && after.st === 'paused' && after.running && after.c.playing && after.c.pans[0] === -1, 'paused, the sound held: Play the quietest plays all the same, the night still paused (' + JSON.stringify([before, after]) + ')');
    await page.click('#overlay button[data-act="ambloud"]'); await page.waitForTimeout(300);
    const amb = await page.evaluate(() => AUDIO.calibration);
    check(amb.which === 'ambientLoud' && amb.playing, 'and the loudest ambience there too (' + JSON.stringify(amb) + ')');
    await page.click('#overlay button[data-act="caldone"]'); await page.waitForTimeout(1800);
    let v = await page.evaluate(() => ({ kind: MENU.kind, sub: MENU.sub, focus: document.activeElement.dataset.act, playing: AUDIO.calibration.playing, st: G.state }));
    const lv2 = await levels(page);
    check(v.kind === 'settings' && !v.sub && v.focus === 'calvol' && !v.playing && v.st === 'paused' && !lv2.hushed && lv2.ambient > 0.9, 'Done: Settings again, over the paused night, Calibrate focused, the sound stopped, the night\'s bed faded back in (' + JSON.stringify([v, lv2]) + ')');
    await page.click('#overlay button[data-act="calbright"]'); await page.waitForTimeout(150);
    const b = await brightLook(page, '#overlay .panel');
    check(b.max === '12,10,15' && b.robeShare > 0.02 && b.inView, 'and Brightness from there too (' + JSON.stringify(b) + ')');
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    v = await page.evaluate(() => ({ kind: MENU.kind, focus: document.activeElement.dataset.act, st: G.state }));
    check(v.kind === 'pause' && v.focus === 'settings' && v.st === 'paused', 'Esc, Esc: Settings, then the pause menu, Settings focused (' + JSON.stringify(v) + ')');
    // and never left faded: into the volume dialog and straight out to the title (Quit), the ambience is back
    await page.click('#overlay button[data-act="settings"]'); await page.waitForTimeout(100);
    await page.click('#overlay button[data-act="calvol"]'); await page.waitForTimeout(100);
    await page.evaluate(() => MENU.act('title')); await page.waitForTimeout(200);
    check(await page.evaluate(() => !AUDIO.hushed && MENU.kind === 'title'), 'out of the volume dialog by another way (to the title): the ambience is not left faded');
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
    check(volOK(v) && v.textColor === 'rgb(207, 200, 186)' && v.side && v.inView && v.focus === 'calquiet', 'from the warning\'s Adjust settings, Volume\'s Calibrate: the same dialog in its card (its words not the warning\'s red) (' + JSON.stringify(v) + ')');
    check(await page.evaluate(() => AUDIO.hushed), 'and the ambience faded out of the way there too');
    await page.click('#disclaimer button[data-act="calloud"]'); await page.waitForTimeout(150);
    const c = await page.evaluate(() => AUDIO.calibration);
    check(c.which === 'loud' && c.playing && c.pans.join() === '-1', 'and its sounds play there (' + JSON.stringify(c) + ')');
    await shot(page, 'settings-volume-warning');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    v = await page.evaluate(() => ({ h: document.querySelector('#disclaimer h1') && document.querySelector('#disclaimer h1').textContent, focus: document.activeElement.dataset.act, warn: !!document.querySelector('#disclaimer .daccept'), playing: AUDIO.calibration.playing, hushed: AUDIO.hushed }));
    check(v.h === 'Settings' && v.focus === 'calvol' && !v.warn && !v.playing && !v.hushed, 'Esc in it: Settings again (not the warning), Calibrate focused, the sound stopped, the ambience back (' + JSON.stringify(v) + ')');
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
    await page.evaluate(() => document.querySelector('#disclaimer .seg[data-set="textSize"] [aria-checked="true"]').focus());
    const p4 = await page.evaluate(() => document.activeElement.closest('.seg').dataset.set + ':' + document.activeElement.textContent);
    await padTap(15); const p5 = await page.evaluate(() => SAVE.data.settings.textSize);
    await padTap(0); const p6 = await page.evaluate(() => ({ ts: SAVE.data.settings.textSize, up: !!document.querySelector('#disclaimer .dset') }));
    await padTap(14);
    await padTap(1); await page.waitForTimeout(150);
    const p7 = await page.evaluate(() => ({ warn: !!document.querySelector('#disclaimer .daccept'), focus: document.activeElement.dataset.act, ts: SAVE.data.settings.textSize }));
    await page.evaluate(() => { navigator.getGamepads = () => []; });
    check(p1 === 'calbright' && b.h === 'Brightness' && b.max === '12,10,15' && p2.h === 'Settings' && p2.focus === 'calbright' && p3.h === 'Settings' && p3.focus === 'calbright',
      'a pad there: the d-pad to Brightness\'s Calibrate, A opens it, B is Done (Calibrate focused); A and Start the same (' + JSON.stringify([p1, b.h, p2, p3]) + ')');
    check(p4 === 'textSize:Normal' && p5 === 1.8 && p6.ts === 1.8 && p6.up && p7.warn && p7.focus === 'accept' && p7.ts === 1.4, 'and on Text size, right chooses Bigger, A on it does nothing else, left Normal again; B in Settings is the warning (' + JSON.stringify([p4, p5, p6, p7]) + ')');
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
    const fits = () => page.evaluate(sel => { const p = document.querySelector(sel), sc = p.closest('#disclaimer') || p; return { scroll: sc.scrollHeight - sc.clientHeight, wide: sc.scrollWidth - sc.clientWidth, bottom: p.getBoundingClientRect().bottom <= innerHeight + 1 }; }, sel);
    let f0 = await fits();
    const segs = await page.evaluate(root => [...document.querySelectorAll(root + ' .seg [role="radio"], ' + root + ' .calbtn')].every(b => b.getBoundingClientRect().height >= 30), root);
    await page.tap(root + ' .seg[data-set="textSize"] [data-v="1.8"]'); await page.waitForTimeout(150);
    const big = await fits();
    const ts = await page.evaluate(() => SAVE.data.settings.textSize);
    await page.tap(root + ' .seg[data-set="textSize"] [data-v="1.4"]'); await page.waitForTimeout(100);
    check(f0.scroll <= 0 && f0.bottom && big.scroll <= 0 && big.wide <= 0 && ts === 1.8 && segs, from + ', on a phone: Settings fits, its choices tapped (Bigger text, and it still fits), each a fair target (' + JSON.stringify([f0, big, ts, segs]) + ')');
    await page.tap(root + ' button[data-act="calvol"]'); await page.waitForTimeout(250);
    let v = await volLook(page, sel); f0 = await fits();
    check(volOK(v) && v.side && v.inView && v.secs.every(s => s.targets) && f0.scroll <= 0 && f0.wide <= 0, from + ', on a phone: the volume dialog fits at the normal text size, its two sections side by side, full-size targets (' + JSON.stringify([v, f0]) + ')');
    await shot(page, 'settings-volume-phone-' + from);
    await page.tap(root + ' button[data-act="calquiet"]'); await page.waitForTimeout(150);
    const c = await page.evaluate(() => AUDIO.calibration);
    await page.tap(root + ' button[data-act="ambquiet"]'); await page.waitForTimeout(150);
    const c2 = await page.evaluate(() => AUDIO.calibration);
    // Bigger text: too much for the height of a phone on its side, so it scrolls (down, never across), Done reached
    await page.evaluate(() => MENU.applySetting('textSize', 1.8)); await page.waitForTimeout(150);
    const fb = await fits();
    await page.evaluate(sel => { const sc = document.querySelector(sel).closest('#disclaimer') || document.querySelector(sel); sc.scrollTop = sc.scrollHeight; }, sel); await page.waitForTimeout(100);
    const doneIn = await page.evaluate(root => { const r = document.querySelector(root + ' button[data-act="caldone"]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }, root);
    if (from === 'title') await shot(page, 'settings-volume-phone-bigger');
    await page.evaluate(() => MENU.applySetting('textSize', 1.4));
    check(fb.wide <= 0 && doneIn, from + ', on a phone with Bigger text: the volume dialog scrolls down (never across) to Done (' + JSON.stringify([fb, doneIn]) + ')');
    await page.tap(root + ' button[data-act="caldone"]'); await page.waitForTimeout(200);
    const back = await page.evaluate(root => ({ h: document.querySelector(root + ' h1').textContent, playing: AUDIO.calibration.playing }), root);
    check(c.which === 'quiet' && c.playing && c2.which === 'ambientQuiet' && c2.playing && back.h === 'Settings' && !back.playing, from + ', on a phone: a tap plays one, a tap on another plays that instead, a tap on Done is Settings again (' + JSON.stringify([c, c2, back]) + ')');
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
    const load = async () => { await page.reload(); for (const f of ['js/util.js', 'js/soundtune.js', 'js/audio.js']) await page.addScriptTag({ path: path.join(ROOT, f) }); };
    // played half a second in (as the game plays them, mid-stream), on an offline context in place of the page's; peak,
    // the loudest 50 ms (RMS) and the K-weighted loudness (BS.1770, 48 kHz, ungated) from `from` seconds on, in dB; at:
    // [[seconds, code], ...] run when the clock reaches them
    const render = (what, secs, setup, from, at) => page.evaluate(async ([what, secs, setup, from, at]) => {
      const SR = 48000; let off;
      window.AudioContext = function () { off = new OfflineAudioContext(2, SR * secs, SR); return off; };
      AUDIO.init(); if (setup) new Function(setup)();
      const go = off.resume.bind(off); off.resume = () => Promise.resolve();   // (AUDIO.calibrate resumes the context: here that would render on before its first beat)
      off.suspend(0.5).then(() => { new Function(what)(); setTimeout(go, 80); });
      for (const [t, code] of at || []) off.suspend(t).then(() => { new Function(code)(); setTimeout(go, 40); });
      const buf = await off.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), win = Math.round(SR * 0.05);
      let pl = 0, pr = 0, rms = 0, atT = 0;
      for (let i = 0; i < L.length; i++) { pl = Math.max(pl, Math.abs(L[i])); pr = Math.max(pr, Math.abs(R[i])); }
      for (let s = 0; s + win <= L.length; s += Math.round(win / 2)) { let a = 0; for (let i = s; i < s + win; i++) a += (L[i] * L[i] + R[i] * R[i]) / 2; a = Math.sqrt(a / win); if (a > rms) { rms = a; atT = s / SR; } }
      const st = (b0, b1, b2, a1, a2, x) => { const o = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; o[i] = v; } return o; };
      const kw = x => st(1, -2, 1, -1.99004745483398, 0.99007225036621, st(1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585, x));
      const kl = kw(L), kr = kw(R), seg = (a, b) => { let m = 0, n = 0; for (let i = Math.round(a * SR); i < Math.min(L.length, Math.round(b * SR)); i++) { m += kl[i] * kl[i] + kr[i] * kr[i]; n++; } return -0.691 + 10 * Math.log10(Math.max(1e-20, m / Math.max(1, n))); };
      const db = v => 20 * Math.log10(Math.max(1e-9, v));
      return { peak: db(Math.max(pl, pr)), pl: db(pl), pr: db(pr), rms: db(rms), at: atT, lufs: seg(from || 0, secs), seg: [[4, 5.9], [7.4, 9], [9.5, 10.9], [14, 16]].map(([a, b]) => seg(a, b)) };
    }, [what, secs, setup || '', from || 0, at || null]);
    const runs = async (n, what, secs, setup, from, at) => { const out = []; for (let i = 0; i < n; i++) { await load(); out.push(await render(what, secs, setup, from, at)); } return out; };
    const mean = (a, k) => a.reduce((s, x) => s + x[k], 0) / a.length;
    const fmt = x => +x.toFixed(2);
    // the loudest sound: the sting's crash alone, never louder than the sting itself; and the seven of it in a row (each
    // cutting the last short) no louder either: they do not pile up
    const sting = await runs(4, "AUDIO.sfx('sting')", 4), cal = await runs(4, "AUDIO.sfx('stingCalibrate')", 4), seven = await runs(3, "AUDIO.calibrate('loud')", 5);
    const loud = { stingPeak: fmt(mean(sting, 'peak')), stingRms: fmt(mean(sting, 'rms')), stingLufs: fmt(mean(sting, 'lufs')), calPeak: fmt(mean(cal, 'peak')), calRms: fmt(mean(cal, 'rms')), calLufs: fmt(mean(cal, 'lufs')), calAt: fmt(mean(cal, 'at')), sevenPeak: fmt(mean(seven, 'peak')), sevenRms: fmt(mean(seven, 'rms')) };
    console.log('    sting: peak ' + loud.stingPeak + ' dBFS, loudest 50 ms ' + loud.stingRms + ', loudness ' + loud.stingLufs + ' LUFS; the crash (stingCalibrate): peak ' + loud.calPeak + ', loudest 50 ms ' + loud.calRms + ' (at ' + loud.calAt + ' s), loudness ' + loud.calLufs + '; seven of it: peak ' + loud.sevenPeak + ', loudest 50 ms ' + loud.sevenRms);
    check(loud.calRms <= loud.stingRms + 0.25 && loud.calPeak <= loud.stingPeak + 0.6 && loud.calLufs <= loud.stingLufs, 'the loudest sound (the sting\'s crash, tuned as the sting) is no louder than the sting as the game plays it (' + JSON.stringify(loud) + ')');
    check(loud.calAt < 0.5 + 0.25, 'and it is loudest at its start, the crash itself: nothing climbs into it (' + loud.calAt + ' s)');
    check(loud.sevenRms <= loud.stingRms + 0.25 && loud.sevenPeak <= loud.stingPeak + 0.6, 'and the seven of it played as the calibration plays them are no louder: one at a time, not piled up (' + JSON.stringify(loud) + ')');
    const heart = await runs(1, 'AUDIO.heartbeat(0.05, false)', 1), lub = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 7, 0)');
    const lubL = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 7, -1)'), lubR = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 7, 1)');
    const lubQ = await runs(1, "AUDIO.calibrate('quiet')", 1, "AUDIO.CAL.pans.splice(0, 7, 0); AUDIO.setVolume('effects', 0.5)");
    const lubA = await runs(1, "AUDIO.calibrate('quiet')", 1, "AUDIO.CAL.pans.splice(0, 7, 0); AUDIO.setVolume('ambient', 0.1)");
    const loudQ = await runs(1, "AUDIO.calibrate('loud')", 5, "AUDIO.CAL.pans.splice(0, 7, 0); AUDIO.setVolume('effects', 0.5)");
    const quiet = { heart: fmt(heart[0].peak), lub: fmt(lub[0].peak), lubLeft: [fmt(lubL[0].pl), fmt(lubL[0].pr)], lubRight: [fmt(lubR[0].pl), fmt(lubR[0].pr)], lubHalf: fmt(lubQ[0].peak), lubAmbLow: fmt(lubA[0].peak), loudHalfRms: fmt(loudQ[0].rms) };
    console.log('    heartbeat as first heard (0.05): peak ' + quiet.heart + ' dBFS; the calibration\'s lub: ' + quiet.lub + ' (effects at 50%: ' + quiet.lubHalf + ')');
    check(Math.abs(quiet.heart - quiet.lub) < 0.05, 'the quietest sound is the heartbeat\'s first beat as loud as the game first plays it (' + JSON.stringify(quiet) + ')');
    check(Math.abs(quiet.lubLeft[0] - quiet.lub) < 0.05 && quiet.lubLeft[1] < -100 && quiet.lubRight[0] < -100 && Math.abs(quiet.lubRight[1] - quiet.lub) < 0.05, 'panned hard left it is in the left ear only, hard right the right only (' + JSON.stringify(quiet) + ')');
    check(Math.abs(quiet.lubHalf - (quiet.lub - 6.02)) < 0.1 && quiet.loudHalfRms < loud.calRms - 3 && Math.abs(quiet.lubAmbLow - quiet.lub) < 0.05, 'both go through the effects volume (at 50% the lub is 6 dB down, the loudest quieter too), not the ambience\'s (' + JSON.stringify(quiet) + ')');
    // the ambience's two ends: every bed in the game measured with its tune (K-weighted, once faded in); the quietest is
    // the one the calibration plays as the quietest; and each plays in the calibration as loud as in the game, through the
    // ambience volume
    const BEDS = [];   // [name, its params as the night's file has them]
    for (let n = 1; n <= 13; n++) {
      const s = fs.readFileSync(path.join(ROOT, 'js/levels/night' + String(n).padStart(2, '0') + '.js'), 'utf8'), m = s.match(/ambient: (\{ tune: 'ambient:\d+'[^}]*\})/);
      if (m) BEDS.push([String(n), m[1]]);
      if (n === 8) BEDS.push(['8off', 'Object.assign(' + m[1] + ", { drone: 0.12, tune: 'ambient:8off' })"]);
      if (n === 13) BEDS.push(['13dawn', "{ tune: 'ambient:13dawn', wind: 0.32, drone: 0, windFreq: 760 }"]);
    }
    BEDS.push(['title, far', "{ tune: 'ambient:title', near: 0 }"]);
    const loudness = {};
    for (const [n, p] of BEDS) { const r = await runs(1, 'AUDIO.startAmbient(' + p + ')', 16, '', 6); loudness[n] = fmt(r[0].lufs); }
    const order = Object.entries(loudness).sort((a, b) => a[1] - b[1]);
    console.log('    the beds, quietest first (LUFS): ' + order.map(([n, l]) => n + ' ' + l).join(', '));
    const calQ = await page.evaluate(() => AUDIO.CAL.beds.ambientQuiet.tune), calL = await page.evaluate(() => AUDIO.CAL.beds.ambientLoud.tune);
    check(order[0][0] === '8off' && calQ === 'ambient:8off', 'the quietest bed in the game is night 8\'s with its main off (' + order[0][1] + ' LUFS), and it is the calibration\'s quietest ambience (' + calQ + ')');
    check(calL === 'ambient:9' && order[order.length - 1][0] === '9', 'the calibration\'s loudest ambience is the loudest bed in the game by measure, night 9\'s rain (' + calL + ', ' + loudness['9'] + ' LUFS)');
    for (const [k, n] of [['ambientQuiet', '8off'], ['ambientLoud', '9']]) {
      const r = await runs(1, "AUDIO.calibrate('" + k + "')", 6.5, '', 2, null), r2 = await runs(1, "AUDIO.calibrate('" + k + "')", 6.5, "AUDIO.setVolume('ambient', 0.5); AUDIO.setVolume('effects', 0.1)", 2, null);
      // (held on for as long as the bed was measured in the game, over the same stretch of its slow swells: as loud as there)
      const full = await runs(1, "AUDIO.calibrate('" + k + "')", 16, 'AUDIO.CAL.bed.len = 16', 6, null);
      check(Math.abs(full[0].lufs - loudness[n]) < 0.5 && Math.abs((r2[0].lufs - r[0].lufs) + 6.02) < 0.6, k + ': the bed as loud as the game plays it (' + fmt(full[0].lufs) + ' LUFS; in the game ' + loudness[n] + '), through the ambience volume (at 50%: ' + fmt(r2[0].lufs - r[0].lufs) + ' dB; the effects volume not in it)');
    }
    // the ambience faded out of the way and back: a bed playing (night 10's drone, steady), hushed at 6 s, back at 11 s
    const h = await runs(1, "AUDIO.startAmbient({ tune: 'ambient:10', wind: 0, drone: 0.3, droneFreq: 55, windFreq: 340 })", 16, '', 0, [[6, 'AUDIO.hush(true)'], [11, 'AUDIO.hush(false)']]);
    const hs = h[0].seg.map(fmt);
    check(hs[1] < hs[0] - 15 && hs[2] < hs[0] - 40 && Math.abs(hs[3] - hs[0]) < 1, 'AUDIO.hush: the ambience fades out (' + (hs[1] - hs[0]).toFixed(1) + ' dB a second and a half on; ' + (hs[2] - hs[0]).toFixed(1) + ' dB after four) and back in to where it was (' + JSON.stringify(hs) + ')');
    // every sound through one of the two volumes: everything the game plays as an effect (every effect by name, the
    // footsteps, the voices, the loops and the heartbeat) silent with the effects volume at nothing, and the beds with the
    // ambience at nothing; each heard with the other at nothing
    const audioSrc = fs.readFileSync(path.join(ROOT, 'js/audio.js'), 'utf8'), body = n => { const a = audioSrc.indexOf('  function ' + n + '('); return audioSrc.slice(a, audioSrc.indexOf('\n  function ', a + 1)); };
    const caseNames = (s, re) => [...new Set([...s.matchAll(re)].map(m => m[1]))];
    const sfx = caseNames(body('sfx'), /case '([A-Za-z]+)'/g), steps = caseNames(body('footstep'), /case '([A-Za-z]+)'/g), voices = caseNames(body('voice'), /case '([A-Za-z]+)'/g), loops = caseNames(body('setLoop'), /kind === '([A-Za-z]+)'/g);
    const allFx = sfx.map(n => "AUDIO.sfx('" + n + "', 0.3);").join('') + steps.map(n => "AUDIO.footstep('" + n + "', 0.5, -0.3);").join('') + voices.map(n => "AUDIO.voice('" + n + "', 0.5, 0.2);").join('') + 'AUDIO.heartbeat(0.3, true);' + loops.map(n => "AUDIO.setLoop('" + n + "', 0.4, 0.1);").join('');
    const allBeds = BEDS.map(([, p]) => 'AUDIO.startAmbient(' + p + ');').join('');
    const fxOff = await runs(1, allFx, 3, "AUDIO.setVolume('effects', 0)"), fxOn = await runs(1, allFx, 3, "AUDIO.setVolume('ambient', 0)");
    const bedOff = await runs(1, allBeds, 4, "AUDIO.setVolume('ambient', 0)"), bedOn = await runs(1, allBeds, 4, "AUDIO.setVolume('effects', 0)");
    const route = { fxOff: fmt(fxOff[0].peak), fxOn: fmt(fxOn[0].peak), bedOff: fmt(bedOff[0].peak), bedOn: fmt(bedOn[0].peak), n: sfx.length + '/' + steps.length + '/' + voices.length + '/' + loops.length };
    check(route.fxOff < -100 && route.fxOn > -30 && route.bedOff < -100 && route.bedOn > -50, 'every sound is on one of the two volumes: all ' + route.n + ' effects, footsteps, voices and loops and the heartbeat silent with the effects at nothing (heard with the ambience at nothing), every bed silent with the ambience at nothing (' + JSON.stringify(route) + ')');
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
