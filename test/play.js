'use strict';
// Scripted playthrough of every night; finds things by looking around like a player would.
// SEED=n makes the layout reproducible.
const T = require('./lib');
(async () => {
  const { browser, page, errors } = await T.launch();
  const { check, st, face, findHit, clickAt, lookForAndClick } = T;
  async function start(n) {
    await T.open(page, 'level=' + n);
    check((await st(page)).state === 'card', 'night ' + n + ' card shown');
    await page.mouse.click(640, 380); await page.waitForTimeout(300);
    check((await st(page)).state === 'play', 'night ' + n + ' playing');
  }

  console.log('== title screen ==');
  await T.open(page, '');
  check((await st(page)).state === 'title', 'title state');
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check((await st(page)).state === 'card', 'Enter opens night 1 card');
  check(await page.evaluate(() => AUDIO.on()), 'audio context created on first gesture');

  console.log('== night 1: the field ==');
  await start(1);
  let where = await lookForAndClick(page, 'item', 'hammer');
  check((await st(page)).inv.includes('hammer:1'), 'picked up hammer at ' + JSON.stringify(where));
  where = await lookForAndClick(page, 'item', 'planks');
  check((await st(page)).inv.includes('planks:3'), 'picked up planks at ' + JSON.stringify(where));
  await face(page, 0, false);
  for (let i = 0; i < 3; i++) { const r = await findHit(page, 'target', 'door'); if (r) await clickAt(page, r); await page.waitForTimeout(150); }
  let s = await st(page);
  check(s.won && s.state === 'won', 'door boarded -> won'); check(!s.inv.some(i => i.startsWith('planks')), 'planks consumed');
  await page.waitForTimeout(6500);
  s = await st(page); check(s.state === 'survived', 'aftermath finished -> survived overlay');
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  s = await st(page); check(s.state === 'card' && s.level === 1, 'advanced to night 2 card');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('itscoming.v2')).unlocked.normal === 1), 'progress saved');

  console.log('== night 2: the road ==');
  await start(2);
  where = await lookForAndClick(page, 'item', 'keys');
  check((await st(page)).inv.includes('keys:1'), 'picked up keys at ' + JSON.stringify(where));
  await lookForAndClick(page, 'target', 'ignition');
  check(await page.evaluate(() => G.L.flags.keyIn), 'key inserted');
  const need = await page.evaluate(() => G.L.flags.cranksNeeded);
  for (let i = 0; i < 5 && !(await page.evaluate(() => G.L.flags.started)); i++) { const r = await findHit(page, 'target', 'ignition'); await clickAt(page, r); await page.waitForTimeout(1300); }
  s = await st(page); check(s.won && await page.evaluate(() => G.L.flags.cranks === G.L.flags.cranksNeeded), 'engine started after ' + need + ' cranks -> won');
  await page.waitForTimeout(5500);
  check((await st(page)).state === 'survived', 'night 2 survived overlay');

  console.log('== night 3: the graveyard ==');
  await start(3);
  await lookForAndClick(page, 'item', 'salt');
  await lookForAndClick(page, 'item', 'lantern');
  await lookForAndClick(page, 'item', 'matches');
  s = await st(page); check(s.inv.includes('salt:2') && s.inv.includes('lantern:1') && s.inv.includes('matches:1'), 'holding salt, lantern, matches: ' + s.inv.join(','));
  await lookForAndClick(page, 'target', 'threshold'); await clickAt(page, await findHit(page, 'target', 'threshold'));
  check(await page.evaluate(() => G.L.targets[0].done), 'threshold salted');
  await lookForAndClick(page, 'target', 'hook');
  check(await page.evaluate(() => G.L.targets[1].hung), 'lantern hung');
  await clickAt(page, await findHit(page, 'target', 'hook'));
  s = await st(page); check(s.won, 'lantern lit -> won');
  check(s.inv.includes('matches:1'), 'matches kept (tool)');

  console.log('== night 4: the quarry ==');
  await start(4);
  check(await page.evaluate(() => G.L.creature.visible), 'watcher visible at start');
  await lookForAndClick(page, 'item', 'chain');
  const d0 = (await st(page)).dist;
  await face(page, 2, true); await page.waitForTimeout(700);
  const d1 = (await st(page)).dist;
  check(d1 < d0, 'watcher moved while unseen (' + d0 + ' -> ' + d1 + ')');
  await lookForAndClick(page, 'item', 'padlock');
  await face(page, 6, false);
  const d2 = (await st(page)).dist; await page.waitForTimeout(700); const d3 = (await st(page)).dist;
  check(Math.abs(d2 - d3) < 0.01, 'watcher frozen while watched (' + d2 + ' -> ' + d3 + ')');
  await clickAt(page, await findHit(page, 'target', 'gate'));
  await page.waitForTimeout(1400);
  await clickAt(page, await findHit(page, 'target', 'gate'));
  s = await st(page); check(s.won, 'gate locked -> won');

  console.log('== night 5: the clearing ==');
  await start(5);
  where = await lookForAndClick(page, 'item', 'shotgun');
  await lookForAndClick(page, 'item', 'shells');
  s = await st(page); check(s.inv.includes('shotgun:1') && s.inv.includes('shells:3'), 'gun (at ' + JSON.stringify(where) + ') and shells: ' + s.inv.join(','));
  await face(page, 4, false);
  await page.evaluate(() => { G.L.creature.u = 0.94; });
  await page.waitForTimeout(400);
  let r = await findHit(page, 'creature'); check(!!r, 'creature is a click target'); if (r) await clickAt(page, r);
  s = await st(page); check(s.inv.includes('shells:2') && await page.evaluate(() => G.L.creature.wounded), 'first shot wounded it, 2 shells left');
  await page.waitForTimeout(500);
  r = await findHit(page, 'creature'); if (r) await clickAt(page, r);
  s = await st(page); check(s.won && await page.evaluate(() => G.L.creature.dead), 'second shot -> dead -> won');
  await page.waitForTimeout(5500);
  check((await st(page)).state === 'survived', 'night 5 survived');
  await page.mouse.click(640, 380); await page.waitForTimeout(300);
  check((await st(page)).state === 'end', 'end screen after night 5');

  console.log('== death and retry ==');
  await T.open(page, 'level=1&go');
  await page.evaluate(() => { G.L.creature.u = 0.996; });
  await page.waitForTimeout(3400);
  s = await st(page); check(s.state === 'dead', 'caught -> dead overlay (state ' + s.state + ')');
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

  await T.finish(browser, errors, 'play');
})();
