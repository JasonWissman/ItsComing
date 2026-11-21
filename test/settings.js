'use strict';
// Settings' Calibrate dialogs: Volume (two sections, Sound effects and Ambience, each its own slider and the two ends of
// what it plays: the effects' quietest sound, seven times from the left ear over to the right in about two seconds, and
// its loudest, the sting itself, once, in the middle; the ambience's quietest and loudest bed, a few seconds of each;
// each a button with a play mark that is a stop mark while it plays, and no click of its own; the ambience playing
// faded out while the dialog is open) and Brightness (the thing on the title, the shape of it alone in The Void's dark,
// and the game's own brightness, a slider under it: a filter on the view only when it is not 100%). From the title, from
// a paused night, from the warning before a new game, by keys, a pad and touch, on a desktop and on a phone on its side;
// and the sounds rendered offline through the game's own chain, against the heartbeat, the sting and the beds as the game
// plays them; every sound through one of the two volumes.
// Run on its own (node test/settings.js) or from test/features.js, which hands it its browser and its check.
const path = require('path');
const fs = require('fs');
const T = require('./lib');
const ROOT = path.join(__dirname, '..');
const VOL_TEXT = 'Adjust your device volume and/or the sliders below until you can hear each of these comfortably.';
const BRIGHT_TEXT = 'Increase your device brightness, or the slider below, until you can barely see the outline of this creature';
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
  // each its play mark (a triangle; a square while it plays) at the left of its words, and nothing under it (no words, no
  // dots, no bar); Done
  const volLook = (page, sel) => page.evaluate(sel => {
    const root = document.querySelector(sel), r = e => e.getBoundingClientRect(), q = s => root.querySelector(s), vis = e => !!e && getComputedStyle(e).display !== 'none';
    const secs = [...root.querySelectorAll('.calsec')].map(s => {
      const bs = [...s.querySelectorAll('button.calplay')], sl = s.querySelector('input[type=range]');
      return { name: s.querySelector('h2').textContent, label: s.getAttribute('aria-labelledby') && document.getElementById(s.getAttribute('aria-labelledby')).textContent, set: sl && sl.dataset.set, aria: sl && sl.getAttribute('aria-label'), pct: sl && sl.parentElement.querySelector('.pct').textContent,
        acts: bs.map(b => b.dataset.act).join(), labels: bs.map(b => b.textContent), named: bs.every(b => b.querySelector('.callabel').textContent === b.textContent),
        // the mark: first in the button, at the left of its words and level with them; the triangle shown and the square not, at rest
        icons: bs.map(b => { const i = b.querySelector('.calico'), w = b.querySelector('.callabel'); return +(!!i && b.firstElementChild === i && i.getAttribute('aria-hidden') === 'true' && r(i).right <= r(w).left && r(i).left >= r(b).left && Math.abs((r(i).top + r(i).bottom) / 2 - (r(b).top + r(b).bottom) / 2) < 2 && r(i).width >= 20) + (vis(i && i.querySelector('.icoplay')) ? 'P' : '') + (vis(i && i.querySelector('.icostop')) ? 'S' : ''); }).join(),
        pressed: bs.map(b => b.getAttribute('aria-pressed')).join(), extras: s.querySelectorAll('.calnote, .caldots, .calbar, .calcol, p').length, kids: s.querySelector('.calplays').children.length,
        order: r(s.querySelector('h2')).top <= r(sl).top && r(sl).bottom <= r(bs[0]).top && r(bs[0]).bottom <= r(bs[1]).top, inside: [sl, ...bs].every(e => r(e).left >= r(s).left - 1 && r(e).right <= r(s).right + 1),
        targets: bs.every(b => r(b).height >= 32), heights: bs.map(b => Math.round(r(b).height)) };
    });
    const S = [...root.querySelectorAll('.calsec')].map(r), done = q('button[data-act="caldone"]');
    const all = [q('.caltext'), ...root.querySelectorAll('.calsec button, .calsec input'), done].map(r);
    return { h: q('h1').textContent, text: q('.caltext').textContent, all: root.textContent, textColor: getComputedStyle(q('.caltext')).color, secs, done: done.textContent,
      side: S.length === 2 && Math.abs(S[0].top - S[1].top) < 2 && S[0].right <= S[1].left, below: S.every(s => s.top >= r(q('.caltext')).bottom && s.bottom <= r(done).top),
      inView: all.every(b => b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth), sliders: root.querySelectorAll('input[type=range]').length, master: !!q('input[data-set="master"]'),
      ring: [...root.querySelectorAll('button[data-act], input[data-set]')].map(e => e.dataset.act || e.dataset.set).join(), focus: document.activeElement && (document.activeElement.dataset.act || document.activeElement.dataset.set) };
  }, sel);
  const volOK = v => v.h === 'Volume' && v.text === VOL_TEXT && v.secs.length === 2 && v.sliders === 2 && !v.master && v.done === 'Done' &&
    v.secs[0].name === 'Sound effects' && v.secs[0].label === 'Sound effects' && v.secs[0].set === 'effects' && v.secs[0].aria === 'Sound effects volume' && v.secs[0].acts === 'calquiet,calloud' &&
    v.secs[0].labels.join('|') === 'Play the quietest sound in the game|Play the loudest sound in the game' &&
    v.secs[1].name === 'Ambience' && v.secs[1].label === 'Ambience' && v.secs[1].set === 'ambient' && v.secs[1].aria === 'Ambience volume' && v.secs[1].acts === 'ambquiet,ambloud' &&
    v.secs[1].labels.join('|') === 'Play the quietest ambience in the game|Play the loudest ambience in the game' &&
    v.secs.every(s => s.named && s.icons === '1P,1P' && s.pressed === 'false,false' && s.extras === 0 && s.kids === 2 && s.order && s.inside) && !/Increase volume|Decrease volume/.test(v.all) && v.ring === 'effects,calquiet,calloud,ambient,ambquiet,ambloud,caldone';
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
    // its slider: under the creature, its name at its left and its percentage at its right, over Done (or beside it, on a short screen)
    const sl = root.querySelector('input[type=range][data-set="brightness"]'), sr = sl && sl.getBoundingClientRect(), opt = sl && sl.closest('.opt'), pct = opt && opt.querySelector('.pct'), name = opt && opt.querySelector('.olabel'), dr = root.querySelector('button[data-act="caldone"]').getBoundingClientRect();
    const slider = sl ? { min: +sl.min, max: +sl.max, step: +sl.step, value: +sl.value, pct: pct.textContent, aria: sl.getAttribute('aria-valuetext'), name: name.textContent, labelled: sl.closest('label') === opt, under: sr.top >= r.bottom - 1, nameLeft: name.getBoundingClientRect().right <= sr.left, pctRight: pct.getBoundingClientRect().left >= sr.right, beforeDone: sr.bottom <= dr.top + 1 || sr.right <= dr.left, w: Math.round(sr.width), inView: sr.top >= 0 && sr.bottom <= innerHeight && sr.left >= 0 && pct.getBoundingClientRect().right <= innerWidth } : null;
    const filt = e => e ? getComputedStyle(e).filter : null;
    return { h: root.querySelector('h1').textContent, text: root.querySelector('.caltext').textContent, w: r.width, hgt: r.height, inView: r.top >= 0 && r.bottom <= innerHeight && dr.bottom <= innerHeight,
      corner: corner.join(), max: max.join(), robeShare: robe / (d.length / 4), otherShare: other / (d.length / 4), tall: (bottom - top) / cv.height, done: root.querySelector('button[data-act="caldone"]').textContent, focus: document.activeElement && document.activeElement.dataset.act, slider,
      // what is under the brightness filter (the view, the title's scene, this creature) and what is not (the card, its words, the HUD)
      filters: { game: filt(document.getElementById('game')), title: filt(document.getElementById('titleScene')), shape: filt(cv), card: filt(root), words: filt(root.querySelector('.caltext')), overlay: filt(document.getElementById('overlay')), hud: filt(document.getElementById('hud')), html: filt(document.documentElement), body: filt(document.body) },
      cls: document.documentElement.classList.contains('bright'), v: SAVE.data.settings.brightness, saved: (JSON.parse(localStorage.getItem('itscoming.v2') || '{}').settings || {}).brightness };
  }, sel);
  const NOFILTER = f => ['game', 'title', 'shape', 'card', 'words', 'overlay', 'hud', 'html', 'body'].every(k => f[k] === 'none');
  const FILTERED = (f, x) => ['game', 'title', 'shape'].every(k => f[k] === 'brightness(' + x + ')') && ['card', 'words', 'overlay', 'hud', 'html', 'body'].every(k => f[k] === 'none');
  // a calibration pressed and watched: when each of its beats came (ms after the press) and its pans, until it is over
  const watchCal = (page, act, ms) => page.evaluate(([act, ms]) => new Promise(done => {
    const b = document.querySelector('button[data-act="' + act + '"]'), t0 = performance.now(), at = [];
    b.click();
    const iv = setInterval(() => {
      const c = AUDIO.calibration;
      while (c && at.length < c.pans.length) at.push(Math.round(performance.now() - t0));
      if (performance.now() - t0 > ms) { clearInterval(iv); done({ at, pans: c && c.pans.join(), which: c && c.which, playing: c && c.playing, cls: b.classList.contains('playing'), pressed: b.getAttribute('aria-pressed') }); }
    }, 10);
  }), [act, ms]);
  // a play button's mark as it is now: 'P' the triangle, 'S' the square (and '*' with the button marked playing, pressed)
  const icon = (page, act, root) => page.evaluate(([act, root]) => { const b = document.querySelector((root || '') + ' button[data-act="' + act + '"]'), vis = e => getComputedStyle(e).display !== 'none'; return (vis(b.querySelector('.icoplay')) ? 'P' : '') + (vis(b.querySelector('.icostop')) ? 'S' : '') + (b.classList.contains('playing') && b.getAttribute('aria-pressed') === 'true' ? '*' : ''); }, [act, root || '']);
  const icons = async (page, root) => { const o = []; for (const a of ['calquiet', 'calloud', 'ambquiet', 'ambloud']) o.push(await icon(page, a, root)); return o.join(); };
  // the menus' tap counted (AUDIO.sfx('tap')), and every other effect named, from now on: window.__sfx
  const spySfx = page => page.evaluate(() => { if (!window.__sfx) { window.__sfx = []; const f = AUDIO.sfx; AUDIO.sfx = (n, ...a) => { window.__sfx.push(n); return f(n, ...a); }; } window.__sfx.length = 0; });
  const heard = page => page.evaluate(() => window.__sfx.slice());
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
    check(volOK(v) && v.secs.every(s => s.pct === '100%'), 'its words at the top; two sections, Sound effects and Ambience, each its slider (its percentage beside it, at 100%) and its two play buttons, each a play mark at the left of its words, with nothing under it (no words, no dots, no bar); Done; no main volume (' + JSON.stringify(v) + ')');
    check(v.side && v.below && v.inView && v.focus === 'calquiet' && (h => Math.max(...h) - Math.min(...h) <= 1)(v.secs.flatMap(s => s.heights)), 'the two sections side by side under the words, all in view; the four buttons of a height; the first play button focused (' + JSON.stringify(v) + ')');
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
    await spySfx(page);
    const q = await watchCal(page, 'calquiet', 2600);
    const spread = q.at[6] - q.at[0];
    check(q.which === 'quiet' && q.pans === PANS && q.at.length === 7 && spread > 1600 && spread < 2100 && !q.playing && !q.cls && q.pressed === 'false' && await icon(page, 'calquiet') === 'P',
      'Play the quietest: seven, ' + spread + ' ms from the first to the last (about two seconds): twice in the left ear, left of centre, centre, right of centre, twice in the right; then done, its mark a play mark again (' + JSON.stringify(q) + ')');
    const steps = q.at.map(t => t - q.at[0]);   // (each one's time from the first: on its own timer, so one late does not push the rest)
    check(steps.every((t, i) => Math.abs(t - i * 300) < 160), 'a steady 0.3 s apart (' + steps.join(', ') + ' ms from the first)');
    const ic0 = await icons(page);
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(120);
    const q1 = await page.evaluate(() => ({ c: AUDIO.calibration, cls: document.querySelector('button[data-act="calquiet"]').classList.contains('playing') }));
    const ic1 = await icons(page);
    check(q1.c.pans.join() === '-1' && q1.cls && q1.c.playing && ic0 === 'P,P,P,P' && ic1 === 'S*,P,P,P', 'it plays from the left first; while it plays its mark is a stop mark (the other three still play marks) (' + JSON.stringify([q1, ic0, ic1]) + ')');
    // pressed again while it plays: it stops (the stop mark), its mark a play mark again
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(120);
    const q2 = await page.evaluate(() => ({ c: AUDIO.calibration, lv: AUDIO.levels })), ic2 = await icons(page);
    await page.waitForTimeout(700);
    const q3 = await page.evaluate(() => ({ n: AUDIO.calibration.pans.length, lv: AUDIO.levels }));
    check(!q2.c.playing && q2.c.pans.length >= 1 && q2.c.pans.length <= 3 && ic2 === 'P,P,P,P' && q3.n === q2.c.pans.length && q3.lv.effects > 0.9, 'pressed again while it plays, it stops (no more of the seven come), its mark a play mark again, the rest of the sound back (' + JSON.stringify([q2.c, ic2, q3]) + ')');
    // the loudest: the sting itself, once, in the middle; over in a couple of seconds, its mark a play mark again
    const l0 = await watchCal(page, 'calloud', 150);
    const ic3 = await icons(page);
    await page.waitForTimeout(900);
    const l1 = await page.evaluate(() => AUDIO.calibration), ic4 = await icons(page);
    await page.waitForTimeout(1700);
    const l2 = await page.evaluate(() => ({ c: AUDIO.calibration, len: AUDIO.CAL.len.loud })), ic5 = await icons(page);
    check(l0.which === 'loud' && l0.pans === '0' && l0.at.length === 1 && l0.playing && ic3 === 'P,S*,P,P' && l1.playing && l1.pans.join() === '0' && ic4 === 'P,S*,P,P' && !l2.c.playing && l2.c.pans.join() === '0' && ic5 === 'P,P,P,P' && l2.len > 2 && l2.len < 3.5,
      'Play the loudest: one sound (the sting), once, in the middle (pan 0), never a second; its mark a stop mark while it plays (' + l2.len + ' s), then a play mark again (' + JSON.stringify([l0, l1, l2, ic3, ic5]) + ')');
    // one at a time: the quietest pressed while the loudest plays takes over, and its mark with it
    await page.click('#overlay button[data-act="calloud"]'); await page.waitForTimeout(100);
    await page.click('#overlay button[data-act="calquiet"]'); await page.waitForTimeout(100);
    const l4 = await page.evaluate(() => AUDIO.calibration), ic6 = await icons(page);
    check(l4.which === 'quiet' && l4.pans.join() === '-1' && l4.playing && ic6 === 'S*,P,P,P', 'the quietest pressed while the loudest plays: the loudest stops, the quietest plays, the stop mark on it alone (' + JSON.stringify([l4, ic6]) + ')');
    // the ambience's two: a few seconds of a bed each; one at a time, across the two sections too
    await page.click('#overlay button[data-act="ambquiet"]'); await page.waitForTimeout(1500);
    const a1 = await page.evaluate(() => ({ c: AUDIO.calibration, lv: AUDIO.levels })), ic7 = await icons(page);
    check(a1.c.which === 'ambientQuiet' && a1.c.playing && ic7 === 'P,P,S*,P' && a1.lv.effects < 0.05 && a1.lv.ambient < 0.02, 'Play the quietest ambience: it plays (the effects calibration stopped), its mark the stop mark; the rest ducked (' + JSON.stringify([a1, ic7]) + ')');
    await page.click('#overlay button[data-act="calloud"]'); await page.waitForTimeout(100);
    const a2 = await page.evaluate(() => AUDIO.calibration), ic8 = await icons(page);
    check(a2.which === 'loud' && a2.playing && ic8 === 'P,S*,P,P', 'the loudest sound pressed while it plays: the ambience stops, its mark a play mark again, the sound plays (' + JSON.stringify([a2, ic8]) + ')');
    await page.click('#overlay button[data-act="ambloud"]'); await page.waitForTimeout(300);
    const a3 = await page.evaluate(() => ({ c: AUDIO.calibration, len: AUDIO.CAL.bed.len })), ic9 = await icons(page);
    await page.waitForTimeout(a3.len * 1000);
    const a4 = await page.evaluate(() => ({ c: AUDIO.calibration, lv: AUDIO.levels })), ic10 = await icons(page);
    check(a3.c.which === 'ambientLoud' && a3.c.playing && ic9 === 'P,P,P,S*' && !a4.c.playing && ic10 === 'P,P,P,P' && a4.lv.effects > 0.5 && a4.lv.ambient < 0.02 && a3.len >= 4 && a3.len <= 8, 'Play the loudest ambience: a few seconds of it (' + a3.len + ' s), its mark the stop mark, then done, a play mark again; the effects back, the ambience still faded out of the way (' + JSON.stringify([a3, a4, ic9, ic10]) + ')');
    await page.click('#overlay button[data-act="ambloud"]'); await page.waitForTimeout(200);
    await page.click('#overlay button[data-act="ambloud"]'); await page.waitForTimeout(200);
    const a5 = await page.evaluate(() => AUDIO.calibration), ic11 = await icons(page);
    check(a5.which === 'ambientLoud' && !a5.playing && ic11 === 'P,P,P,P', 'and an ambience pressed again while it plays stops too (' + JSON.stringify([a5, ic11]) + ')');
    // none of all that made the menus' click: not a press to play, not a press to stop, by the mouse or the keys
    const taps0 = await heard(page);
    await page.evaluate(() => document.querySelector('#overlay button[data-act="calquiet"]').focus());
    await page.keyboard.press('Enter'); await page.waitForTimeout(150); const kp = await page.evaluate(() => AUDIO.calibration.playing);
    await page.keyboard.press('Enter'); await page.waitForTimeout(150); const ks = await page.evaluate(() => AUDIO.calibration.playing);
    const taps1 = await heard(page);
    await page.evaluate(() => document.querySelector('#overlay input[data-set="effects"]').dispatchEvent(new Event('change')));
    const taps2 = await heard(page);
    check(taps0.length >= 0 && !taps0.includes('tap') && kp && !ks && !taps1.includes('tap') && taps2.filter(n => n === 'tap').length === 1, 'the four play buttons make no click of their own, pressed to play or to stop (' + taps1.length + ' effects heard through all of it, none the menus\' tap: ' + JSON.stringify([...new Set(taps1)]) + '); a slider let go still taps (' + JSON.stringify(taps2.filter(n => n === 'tap')) + ')');
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
    check(b.h === 'Brightness' && b.text === BRIGHT_TEXT && b.done === 'Done' && b.focus === 'caldone' && !(await page.evaluate(() => AUDIO.hushed)), 'Brightness\'s Calibrate opens its dialog: its words (the slider in them now), the creature, Done focused (the ambience not faded for it) (' + JSON.stringify(b) + ')');
    check(b.corner === '0,0,0' && b.max === '12,10,15' && b.robeShare > 0.02 && b.tall > 0.8 && b.hgt >= 300 && b.w >= 400 && b.inView, 'the title\'s creature, the whole of it standing, in the demon\'s robe colour unlit (12, 10, 15) on the void\'s black, nothing lighter (no glow, no light behind it, no eyes), large (' + JSON.stringify(b) + ')');
    // the game's own brightness: a slider under the creature, 60% to 160% in steps of 5%, at 100% to begin with, its
    // name at its left and its percentage at its right; at 100% no filter on anything at all
    const S = b.slider;
    check(S && S.name === 'Brightness' && S.labelled && S.min === 0.6 && S.max === 1.6 && Math.abs(S.step - 0.05) < 1e-9 && S.value === 1 && S.pct === '100%' && S.aria === '100%' && S.under && S.nameLeft && S.pctRight && S.beforeDone && S.inView && S.w >= 150,
      'under the creature, the brightness slider: Brightness, 60% to 160% by 5%, at 100%, its percentage beside it, over Done (' + JSON.stringify(S) + ')');
    check(b.v === 1 && !b.cls && NOFILTER(b.filters), 'at 100% there is no filter at all: not on the view, the title\'s scene or this creature, nor on anything else (' + JSON.stringify(b.filters) + ')');
    await shot(page, 'settings-brightness-desktop');
    // moved by the keys: its percentage follows as it goes, the view, the title's scene and the creature here are shown
    // through a brightness filter of that much (and nothing else is: not the card, its words, the menus or the HUD), saved
    await page.evaluate(() => document.querySelector('#overlay input[data-set="brightness"]').focus());
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    const b1 = await brightLook(page, '#overlay .panel');
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(80);
    const b2 = await brightLook(page, '#overlay .panel');
    check(Math.abs(b1.v - 1.05) < 1e-9 && b1.slider.pct === '105%' && b1.slider.aria === '105%' && b1.cls && FILTERED(b1.filters, 1.05) && Math.abs(b1.saved - 1.05) < 1e-9 && b1.h === 'Brightness',
      'right on it: 105%, its percentage following; the view, the title\'s scene and this creature under a brightness(1.05) filter, the card and the menus not; saved (' + JSON.stringify([b1.v, b1.slider.pct, b1.filters, b1.saved]) + ')');
    check(Math.abs(b2.v - 1.2) < 1e-9 && b2.slider.pct === '120%' && FILTERED(b2.filters, 1.2) && b2.max === '12,10,15', 'three more: 120%, the filter with it (the creature is drawn as ever: it is the filter that brightens it, as it does the game) (' + JSON.stringify([b2.v, b2.slider.pct, b2.filters.shape]) + ')');
    await shot(page, 'settings-brightness-desktop-120');
    await page.keyboard.press('End'); await page.waitForTimeout(60); const bmax = await brightLook(page, '#overlay .panel');
    await page.keyboard.press('Home'); await page.waitForTimeout(60); const bmin = await brightLook(page, '#overlay .panel');
    check(Math.abs(bmax.v - 1.6) < 1e-9 && bmax.slider.pct === '160%' && FILTERED(bmax.filters, 1.6) && Math.abs(bmin.v - 0.6) < 1e-9 && bmin.slider.pct === '60%' && FILTERED(bmin.filters, 0.6), 'its ends: 160% and 60% (' + JSON.stringify([bmax.slider.pct, bmin.slider.pct, bmin.filters.game]) + ')');
    // back at 100% the filter is gone again, not left on at brightness(1)
    await page.evaluate(() => { const i = document.querySelector('#overlay input[data-set="brightness"]'); i.value = 1; i.dispatchEvent(new Event('input', { bubbles: true })); }); await page.waitForTimeout(60);
    const b3 = await brightLook(page, '#overlay .panel');
    check(b3.v === 1 && b3.slider.pct === '100%' && !b3.cls && NOFILTER(b3.filters) && b3.saved === 1, 'back at 100%: no filter left on anything (' + JSON.stringify(b3.filters) + ')');
    // kept through a reload, on the title and in a night; Set to default (in Settings) puts it back to 100%, no filter
    await page.evaluate(() => MENU.applySetting('brightness', 1.3));
    await page.reload(); await page.waitForTimeout(400);
    const r1 = await page.evaluate(() => ({ v: SAVE.data.settings.brightness, cls: document.documentElement.classList.contains('bright'), title: getComputedStyle(document.getElementById('titleScene')).filter, game: getComputedStyle(UI.canvas).filter, overlay: getComputedStyle(UI.overlay).filter, mute: getComputedStyle(UI.mute).filter }));
    await page.evaluate(() => startLevel(1, false)); await page.waitForTimeout(300);
    const r2 = await page.evaluate(() => ({ st: G.state, game: getComputedStyle(UI.canvas).filter, hud: getComputedStyle(UI.hud).filter, inv: getComputedStyle(UI.inv).filter }));
    await page.evaluate(() => { showTitle(); MENU.show('settings', { from: 'title' }); }); await page.waitForTimeout(150);
    await page.click('#overlay button[data-act="defaults"]'); await page.waitForTimeout(150);
    const r3 = await page.evaluate(() => ({ v: SAVE.data.settings.brightness, saved: JSON.parse(localStorage.getItem('itscoming.v2')).settings.brightness, cls: document.documentElement.classList.contains('bright'), game: getComputedStyle(UI.canvas).filter, title: getComputedStyle(document.getElementById('titleScene')).filter, kind: MENU.kind }));
    await page.click('#overlay button[data-act="calbright"]'); await page.waitForTimeout(150);
    const r4 = await brightLook(page, '#overlay .panel');
    check(r1.v === 1.3 && r1.cls && r1.title === 'brightness(1.3)' && r1.game === 'brightness(1.3)' && r1.overlay === 'none' && r1.mute === 'none' && r2.st === 'play' && r2.game === 'brightness(1.3)' && r2.hud === 'none' && r2.inv === 'none',
      'set to 130%: kept through a reload, on the title\'s scene and on the view in a night (its HUD and the menus never under it) (' + JSON.stringify([r1, r2]) + ')');
    check(r3.v === 1 && r3.saved === 1 && !r3.cls && r3.game === 'none' && r3.title === 'none' && r3.kind === 'settings' && r4.slider.value === 1 && r4.slider.pct === '100%' && NOFILTER(r4.filters), 'Set to default puts it back to 100%, saved, no filter; its slider at 100% again (' + JSON.stringify([r3, r4.slider.pct]) + ')');
    // a save from before there was one, or with a value out of its range: 100%, or the nearest end
    const olds = [];
    for (const [val, want] of [[undefined, 1], [0.2, 0.6], [9, 1.6], ['x', 1], [1.25, 1.25]]) {
      await page.evaluate(val => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); if (val === undefined) delete d.settings.brightness; else d.settings.brightness = val; localStorage.setItem('itscoming.v2', JSON.stringify(d)); }, val);
      await page.reload(); await page.waitForTimeout(250);
      olds.push([val === undefined ? 'none' : val, await page.evaluate(() => SAVE.data.settings.brightness), want]);
    }
    check(olds.every(o => o[1] === o[2]), 'a save with no brightness is at 100%; one out of range is brought to the nearest end (' + JSON.stringify(olds) + ')');
    await page.evaluate(() => { MENU.applySetting('brightness', 1); MENU.show('settings', { from: 'title', sub: 'brightness' }); }); await page.waitForTimeout(150);
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
    check(b.max === '12,10,15' && b.robeShare > 0.02 && b.inView && b.slider && b.slider.pct === '100%' && NOFILTER(b.filters), 'and Brightness from there too, its slider at 100% and no filter on the paused view (' + JSON.stringify(b) + ')');
    await page.evaluate(() => document.querySelector('#overlay input[data-set="brightness"]').focus());
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(80);
    const bn = await brightLook(page, '#overlay .panel');
    check(Math.abs(bn.v - 0.9) < 1e-9 && bn.slider.pct === '90%' && FILTERED(bn.filters, 0.9) && await page.evaluate(() => G.state === 'paused'), 'turned down there: the paused night behind it darker at once (brightness(0.9) on the view), still paused (' + JSON.stringify([bn.v, bn.filters.game]) + ')');
    await page.evaluate(() => { const i = document.querySelector('#overlay input[data-set="brightness"]'); i.value = 1; i.dispatchEvent(new Event('input', { bubbles: true })); });
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
    const wic = await icons(page, '#disclaimer');
    check(c.which === 'loud' && c.playing && c.pans.join() === '0' && wic === 'P,S*,P,P', 'and its sounds play there, the loudest once in the middle, its mark a stop mark (' + JSON.stringify([c, wic]) + ')');
    await shot(page, 'settings-volume-warning');
    // and there too the play buttons make no click (to play or to stop), though the card's other buttons do
    await spySfx(page);
    await page.click('#disclaimer button[data-act="calloud"]'); await page.waitForTimeout(120);
    const wstop = await page.evaluate(() => AUDIO.calibration.playing), wic2 = await icons(page, '#disclaimer');
    await page.click('#disclaimer button[data-act="ambquiet"]'); await page.waitForTimeout(120);
    await page.click('#disclaimer button[data-act="ambquiet"]'); await page.waitForTimeout(120);
    const wt = await heard(page);
    check(!wstop && wic2 === 'P,P,P,P' && !wt.includes('tap'), 'pressed again there it stops, and none of the four clicks (' + JSON.stringify([wstop, wic2, wt]) + ')');
    await page.click('#disclaimer button[data-act="calloud"]'); await page.waitForTimeout(100);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    v = await page.evaluate(() => ({ h: document.querySelector('#disclaimer h1') && document.querySelector('#disclaimer h1').textContent, focus: document.activeElement.dataset.act, warn: !!document.querySelector('#disclaimer .daccept'), playing: AUDIO.calibration.playing, hushed: AUDIO.hushed }));
    check(v.h === 'Settings' && v.focus === 'calvol' && !v.warn && !v.playing && !v.hushed, 'Esc in it: Settings again (not the warning), Calibrate focused, the sound stopped, the ambience back (' + JSON.stringify(v) + ')');
    // a pad: A on Brightness's Calibrate, B is Done; Start in it is Done too; B in Settings is the warning
    await page.evaluate(() => { window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad]; });
    const padTap = async i => { await page.evaluate(i => { window._pad.buttons[i].pressed = true; }, i); await page.waitForTimeout(80); await page.evaluate(i => { window._pad.buttons[i].pressed = false; }, i); await page.waitForTimeout(80); };
    await padTap(13); const p1 = await focusAct(page);
    await padTap(0); await page.waitForTimeout(150);
    const b = await brightLook(page, '#disclaimer .dcard');
    // (the brightness slider there, by the pad: up from Done to it, right is a step brighter, the filter on at once)
    await padTap(12); const pb1 = await page.evaluate(() => document.activeElement.dataset.set);
    await padTap(15); await page.waitForTimeout(60);
    const pb2 = await brightLook(page, '#disclaimer .dcard');
    await padTap(14); await page.waitForTimeout(60);
    const pb3 = await brightLook(page, '#disclaimer .dcard');
    await padTap(13); const pb4 = await focusAct(page);
    check(b.slider && b.slider.pct === '100%' && b.slider.under && b.slider.inView && pb1 === 'brightness' && Math.abs(pb2.v - 1.05) < 1e-9 && pb2.slider.pct === '105%' && pb2.filters.shape === 'brightness(1.05)' && pb2.filters.game === 'brightness(1.05)' && pb2.filters.card === 'none' && pb3.v === 1 && pb3.filters.shape === 'none' && pb4 === 'caldone',
      'in the warning\'s card the brightness slider too: a pad\'s d-pad up to it, right a step brighter (the creature under the filter at once), left back to 100% and no filter, down to Done again (' + JSON.stringify([pb1, pb2.v, pb2.filters.shape, pb3.v, pb3.filters.shape, pb4]) + ')');
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
    check(b.text === BRIGHT_TEXT && b.max === '12,10,15' && b.hgt >= 150 && b.tall > 0.8 && b.inView && f0.scroll <= 0 && f0.wide <= 0, from + ', on a phone: the brightness dialog fits (nothing scrolled, down or across), the creature large enough to judge (' + JSON.stringify([b, f0]) + ')');
    check(b.slider && b.slider.name === 'Brightness' && b.slider.pct === '100%' && b.slider.under && b.slider.beforeDone && b.slider.inView && b.slider.w >= 120 && NOFILTER(b.filters), from + ', on a phone: its slider under the creature, beside Done, all in view, at 100% with no filter (' + JSON.stringify(b.slider) + ')');
    await shot(page, 'settings-brightness-phone-' + from);
    // dragged by a finger (as a tap along it): brighter, the filter on the creature and the view, its percentage following
    const box = await page.evaluate(root => { const r = document.querySelector(root + ' input[data-set="brightness"]').getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; }, root);
    await page.touchscreen.tap(box.x + box.w * 0.92, box.y); await page.waitForTimeout(150);
    const bt = await brightLook(page, sel), ft = await fits();
    check(bt.v > 1.4 && bt.slider.pct === Math.round(bt.v * 100) + '%' && bt.filters.shape === 'brightness(' + bt.v + ')' && bt.filters.game === bt.filters.shape && bt.filters.card === 'none' && ft.scroll <= 0 && ft.wide <= 0, from + ', on a phone: a tap along the slider sets it (' + bt.slider.pct + '), the creature and the view brighter at once, the dialog still fitting (' + JSON.stringify([bt.v, bt.filters.shape, ft]) + ')');
    await shot(page, 'settings-brightness-phone-' + from + '-bright');
    await page.evaluate(() => MENU.applySetting('brightness', 1));
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
    // the loudest sound: the sting itself, as a death plays it (the same effect with the same tune, through the effects
    // volume): as loud as the sting is; in the middle (both ears alike); and once (silence once it has rung out)
    const sting = await runs(4, "AUDIO.sfx('sting')", 4), cal = await runs(4, "AUDIO.calibrate('loud')", 4), once = await runs(1, "AUDIO.calibrate('loud')", 7, '', 3.6);
    const loud = { stingPeak: fmt(mean(sting, 'peak')), stingRms: fmt(mean(sting, 'rms')), stingLufs: fmt(mean(sting, 'lufs')), calPeak: fmt(mean(cal, 'peak')), calRms: fmt(mean(cal, 'rms')), calLufs: fmt(mean(cal, 'lufs')), calAt: fmt(mean(cal, 'at')), calLeft: fmt(mean(cal, 'pl')), calRight: fmt(mean(cal, 'pr')), after: fmt(once[0].lufs) };
    console.log('    sting: peak ' + loud.stingPeak + ' dBFS, loudest 50 ms ' + loud.stingRms + ', loudness ' + loud.stingLufs + ' LUFS; the calibration\'s loudest: peak ' + loud.calPeak + ' (left ' + loud.calLeft + ', right ' + loud.calRight + '), loudest 50 ms ' + loud.calRms + ' (at ' + loud.calAt + ' s), loudness ' + loud.calLufs + '; from 3.1 s after it began: ' + loud.after + ' LUFS');
    check(Math.abs(loud.calRms - loud.stingRms) < 1 && Math.abs(loud.calPeak - loud.stingPeak) < 1.5 && Math.abs(loud.calLufs - loud.stingLufs) < 1, 'the loudest sound is the sting as the game plays it: as loud, within the sting\'s own run-to-run difference (its glitter is random) (' + JSON.stringify(loud) + ')');
    check(Math.abs(loud.calLeft - loud.calRight) < 0.05 && loud.calLeft > -30, 'and it is in the middle: as loud in the left ear as in the right (' + loud.calLeft + ' / ' + loud.calRight + ' dBFS)');
    check(loud.after < -90 && loud.calAt < 0.5 + 0.4, 'and it is played once: loudest at its start, and nothing more once it has rung out (' + loud.after + ' LUFS from 3.1 s on)');
    const heart = await runs(1, 'AUDIO.heartbeat(0.05, false)', 1), lub = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 7, 0)');
    const lubL = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 7, -1)'), lubR = await runs(1, "AUDIO.calibrate('quiet')", 1, 'AUDIO.CAL.pans.splice(0, 7, 1)');
    const lubQ = await runs(1, "AUDIO.calibrate('quiet')", 1, "AUDIO.CAL.pans.splice(0, 7, 0); AUDIO.setVolume('effects', 0.5)");
    const lubA = await runs(1, "AUDIO.calibrate('quiet')", 1, "AUDIO.CAL.pans.splice(0, 7, 0); AUDIO.setVolume('ambient', 0.1)");
    const loudQ = await runs(1, "AUDIO.calibrate('loud')", 5, "AUDIO.CAL.pans.splice(0, 7, 0); AUDIO.setVolume('effects', 0.5)");
    const quiet = { heart: fmt(heart[0].peak), lub: fmt(lub[0].peak), lubLeft: [fmt(lubL[0].pl), fmt(lubL[0].pr)], lubRight: [fmt(lubR[0].pl), fmt(lubR[0].pr)], lubHalf: fmt(lubQ[0].peak), lubAmbLow: fmt(lubA[0].peak), loudHalfRms: fmt(loudQ[0].rms) };
    console.log('    heartbeat as first heard (0.05): peak ' + quiet.heart + ' dBFS; the calibration\'s lub: ' + quiet.lub + ' (effects at 50%: ' + quiet.lubHalf + ')');
    check(Math.abs(quiet.heart - quiet.lub) < 0.05, 'the quietest sound is the heartbeat\'s first beat as loud as the game first plays it (' + JSON.stringify(quiet) + ')');
    check(Math.abs(quiet.lubLeft[0] - quiet.lub) < 0.05 && quiet.lubLeft[1] < -100 && quiet.lubRight[0] < -100 && Math.abs(quiet.lubRight[1] - quiet.lub) < 0.05, 'panned hard left it is in the left ear only, hard right the right only (' + JSON.stringify(quiet) + ')');
    check(Math.abs(quiet.lubHalf - (quiet.lub - 6.02)) < 0.1 && quiet.loudHalfRms < loud.calRms - 3 && Math.abs(quiet.lubAmbLow - quiet.lub) < 0.05, 'both go through the effects volume (at 50% the lub is 6 dB down, the sting quieter too: less than 6, through the limiter), not the ambience\'s (' + JSON.stringify(quiet) + ')');
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
