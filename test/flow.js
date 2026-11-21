'use strict';
// Screens and flow: title -> card -> play, advancing nights, death and retry, pause, mute, dropping items, the error overlay.
const T = require('./lib');
const { check, st, face, findHit, clickAt, lookForAndClick } = T;
(async () => {
  const { browser, page, errors } = await T.launch();
  console.log('== title -> card -> play ==');
  await T.open(page, '');
  check((await st(page)).state === 'title', 'title state');
  await page.keyboard.press('Enter'); await page.waitForTimeout(450);
  check((await st(page)).state === 'card', 'Enter opens night 1 card');
  check(await page.evaluate(() => AUDIO.on()), 'audio context created on first gesture');
  await page.keyboard.press(' '); await page.waitForTimeout(150);
  check((await st(page)).state === 'card', 'Space does not skip the card');
  // the card takes no click until its words have faded in (game.js CARD_IN); then a click starts the night
  await page.mouse.click(640, 380); await page.waitForTimeout(100);
  const left = await page.evaluate(() => Math.round(G.overlayArmed - performance.now()));
  check((await st(page)).state === 'card' && left > 0 && left < 1450, 'a click while the card\'s words are still coming in does not start the night (' + left + ' ms to go)');
  // Esc on the card is the pause menu, never the title; Esc again is the card
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  const onCard = await page.evaluate(() => G.state + ' ' + G.pausedFrom + ' ' + MENU.kind);
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  check(onCard === 'paused card pause' && (await st(page)).state === 'card' && await page.evaluate(() => /Night 1 of/.test(document.querySelector('#overlay .kicker').textContent)), 'Esc on the card: the pause menu (' + onCard + '), and Esc again the card, not the title');
  await page.waitForTimeout(Math.max(400, left));
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  check((await st(page)).state === 'play', 'click starts the night');
  await lookForAndClick(page, 'item', 'hammer');
  await lookForAndClick(page, 'item', 'nails');
  const planks = await page.evaluate(() => G.L.items.filter(i => i.id === 'planks' && !i.taken).length);   // loose planks all round the house, every one needed
  for (let i = 0; i < planks; i++) await lookForAndClick(page, 'item', 'planks');
  // both doorways: the one it is coming for first, then the other, where it runs round to
  const first = await page.evaluate(() => G.L.creature.lane.idx);
  for (const [id, dir] of first === 0 ? [['door', 0], ['frontdoor', 4]] : [['frontdoor', 4], ['door', 0]]) {
    await face(page, dir, false);
    for (let i = 0; i < planks / 2; i++) { await clickAt(page, await findHit(page, 'target', id)); await page.waitForTimeout(150); }
  }
  check((await st(page)).won, 'night 1 won');
  const t0 = Date.now(); while (Date.now() - t0 < 12000 && (await st(page)).state !== 'survived') await page.waitForTimeout(200);
  await page.waitForTimeout(600); // overlays arm 350 ms after they show
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  let s = await st(page); check(s.state === 'card' && s.level === 1, 'advanced to night 2 card');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('itscoming.v2')).unlocked.nightmare === 1), 'progress saved');

  console.log('== death and retry ==');
  await T.open(page, 'level=1&go');
  await page.evaluate(() => { G.L.creature.u = 0.996; });
  await page.waitForTimeout(3400);
  s = await st(page); check(s.state === 'dead', 'caught -> dead overlay (state ' + s.state + ')');
  check(await page.evaluate(() => document.querySelector('#overlay .intro').textContent.includes('open door')), 'death line comes from the night text');
  check(await page.evaluate(() => [...document.querySelectorAll('#overlay button')].map(b => b.textContent).join() === 'Try again' && !/quit/i.test(UI.overlay.textContent)), 'the death screen offers Try again and nothing else (no Quit, no Nights)');
  // Esc there is the pause menu (where Quit is), not the title; Esc again is the death screen, as it was
  const line = await page.evaluate(() => document.querySelector('#overlay .intro').textContent);
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  const p1 = await page.evaluate(() => ({ st: G.state, from: G.pausedFrom, kind: MENU.kind, acts: [...document.querySelectorAll('#overlay button[data-act]')].map(b => b.dataset.act).join() }));
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  const p2 = await page.evaluate(() => ({ st: G.state, kind: MENU.kind, h: document.querySelector('#overlay h1').textContent, line: document.querySelector('#overlay .intro').textContent, btns: [...document.querySelectorAll('#overlay button')].map(b => b.textContent).join() }));
  check(p1.st === 'paused' && p1.from === 'dead' && p1.kind === 'pause' && p1.acts === 'resume,controls,settings,quit' && p2.st === 'dead' && p2.kind === 'dead' && p2.h === 'It got you' && p2.line === line && p2.btns === 'Try again',
    'Esc on the death screen: the pause menu, not the title; Esc again: the death screen, the same (' + JSON.stringify([p1, p2]) + ')');
  // the only way out to the title: the pause menu's Quit, and then only once its question is answered Quit
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await page.click('#overlay button[data-act="quit"]'); await page.waitForTimeout(150);
  const q1 = await page.evaluate(() => ({ st: G.state, text: (document.querySelector('#overlay .confirm p') || {}).textContent, focus: document.activeElement && document.activeElement.textContent }));
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  const q2 = await page.evaluate(() => ({ st: G.state, kind: MENU.kind, box: !!document.querySelector('#overlay .confirm'), focus: document.activeElement && document.activeElement.dataset.act }));
  check(q1.st === 'paused' && q1.text === 'Are you sure you want to quit? Your progress will be lost.' && q1.focus === 'Cancel' && q2.st === 'paused' && q2.kind === 'pause' && !q2.box && q2.focus === 'quit',
    'Quit asks first ("' + q1.text + '", Cancel focused); Esc is Cancel: the pause menu again (' + JSON.stringify([q1, q2]) + ')');
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);   // (Quit, focused: asks again)
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  check((await st(page)).state === 'title' && await page.evaluate(() => MENU.kind === 'title'), 'and its Quit (by the keys) goes out to the title');
  await T.open(page, 'level=1&go');
  await page.evaluate(() => { G.L.creature.u = 0.996; });
  await page.waitForTimeout(3400);
  await page.waitForTimeout(450); await page.mouse.click(640, 380); await page.waitForTimeout(400);
  s = await st(page); check(s.state === 'play' && s.level === 0 && s.dist > 100, 'retry restarts night 1 fresh');

  console.log('== pause / mute / drop ==');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  check((await st(page)).state === 'paused', 'Esc pauses');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  check((await st(page)).state === 'play', 'Esc resumes');
  await page.keyboard.press('m'); check(await page.evaluate(() => G.muted && AUDIO.muted), 'M mutes'); await page.keyboard.press('m');
  await lookForAndClick(page, 'item', 'hammer');
  await face(page, 0, true);
  await page.mouse.move(640, 600); await page.waitForTimeout(150);
  check(await page.evaluate(() => G.inv.length === 1 && !G.hover && document.getElementById('tooltip').style.display === 'none' && document.getElementById('tooltip').textContent === ''), 'over the floor with something held: no line about putting it down');
  await page.mouse.click(640, 600); await page.waitForTimeout(200);
  s = await st(page); check(s.inv.length === 0, 'clicking the floor drops the held item');
  check(await page.evaluate(() => R.hits.some(h => h.kind === 'item' && h.ref.id === 'hammer')), 'dropped hammer is visible and clickable again');
  check(await page.evaluate(() => { const it = G.L.items.find(i => i.id === 'hammer'); const l = rotY(it.x, it.z, -G.L.facing); return pointInPoly(l[0], l[1], G.L.floor.poly); }), 'dropped item is inside the floor');

  console.log('== bad input and errors ==');
  await page.goto(T.INDEX + '?level=abc'); await page.waitForTimeout(300);
  check((await st(page)).state === 'title', '?level=abc is ignored');
  await T.open(page, 'level=1&go');
  await page.evaluate(() => { G.L.update = () => { throw new Error('boom'); }; }); await page.waitForTimeout(200);
  check((await st(page)).state === 'error' && await page.evaluate(() => document.querySelector('#overlay h1').textContent.includes('Something broke')), 'a runtime error shows the error overlay');
  await page.keyboard.press('r'); await page.waitForTimeout(300);
  check((await st(page)).state === 'play', 'R recovers from the error overlay');

  const i = errors.findIndex(e => e.includes('boom')); if (i >= 0) errors.splice(i, 1);   // the error we threw on purpose
  await T.finish(browser, errors, 'flow');
})();
