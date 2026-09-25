'use strict';
// Screens and flow: title -> card -> play, advancing nights, death and retry, pause, mute, dropping items, the error overlay.
const T = require('./lib');
const { check, st, face, findHit, clickAt, lookForAndClick } = T;
(async () => {
  const { browser, page, errors } = await T.launch();
  console.log('== title -> card -> play ==');
  await T.open(page, '');
  check((await st(page)).state === 'title', 'title state');
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check((await st(page)).state === 'card', 'Enter opens night 1 card');
  check(await page.evaluate(() => AUDIO.on()), 'audio context created on first gesture');
  await page.keyboard.press(' '); await page.waitForTimeout(150);
  check((await st(page)).state === 'card', 'Space does not skip the card');
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  check((await st(page)).state === 'play', 'click starts the night');
  await lookForAndClick(page, 'item', 'hammer'); await lookForAndClick(page, 'item', 'planks');
  await face(page, 0, false);
  for (let i = 0; i < 3; i++) { await clickAt(page, await findHit(page, 'target', 'door')); await page.waitForTimeout(150); }
  check((await st(page)).won, 'night 1 won');
  const t0 = Date.now(); while (Date.now() - t0 < 12000 && (await st(page)).state !== 'survived') await page.waitForTimeout(200);
  await page.waitForTimeout(300);
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  let s = await st(page); check(s.state === 'card' && s.level === 1, 'advanced to night 2 card');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('itscoming.v2')).unlocked.normal === 1), 'progress saved');

  console.log('== death and retry ==');
  await T.open(page, 'level=1&go');
  await page.evaluate(() => { G.L.creature.u = 0.996; });
  await page.waitForTimeout(3400);
  s = await st(page); check(s.state === 'dead', 'caught -> dead overlay (state ' + s.state + ')');
  check(await page.evaluate(() => document.querySelector('#overlay .intro').textContent.includes('boards')), 'death line comes from the night text');
  await page.mouse.click(640, 380); await page.waitForTimeout(400);
  s = await st(page); check(s.state === 'play' && s.level === 0 && s.dist > 100, 'retry restarts night 1 fresh');

  console.log('== pause / mute / drop ==');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  check((await st(page)).state === 'paused', 'Esc pauses');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  check((await st(page)).state === 'play', 'Esc resumes');
  await page.keyboard.press('m'); check(await page.evaluate(() => G.muted && AUDIO.muted), 'M mutes'); await page.keyboard.press('m');
  await lookForAndClick(page, 'item', 'hammer');
  await face(page, 0, true);
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
