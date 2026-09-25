'use strict';
// Runs every night's declared solution (test/nights/nightNN.js) and asserts the win and the survived screen.
// NIGHTS=1,3 TIERS=normal,hard SEEDS=1,2 narrow the run; default is all nights, normal, seeds 1 and 2.
const T = require('./lib');
const fs = require('fs'); const path = require('path');
const { check, fail, st, face, findHit, clickAt, lookForAndClick } = T;
const NIGHTS = process.env.NIGHTS ? process.env.NIGHTS.split(',').map(Number) : null;
const TIERS = (process.env.TIERS || 'normal').split(',');
const SEEDS = (process.env.SEEDS || '1,2').split(',').map(Number);

async function runStep(page, step) {
  const [op, a, b, c, d] = step;
  switch (op) {
    case 'pickup': { const w = await lookForAndClick(page, 'item', a); check(!!w && await page.evaluate(id => G.inv.some(i => i.id === id), a), 'pick up ' + a + (w ? ' at ' + JSON.stringify(w) : '')); break; }
    case 'use': { const n = b || 1; for (let i = 0; i < n; i++) { if (i === 0) { if (!(await lookForAndClick(page, 'target', a))) return; } else await clickAt(page, await findHit(page, 'target', a)); await page.waitForTimeout(c || 150); } break; }
    case 'clickUntil': { // click target a until expression b is true, waiting c ms between, at most d tries
      await lookForAndClick(page, 'target', a); await page.waitForTimeout(c || 300);
      let tries = 1;
      while (!(await page.evaluate(b)) && tries < (d || 8)) { await clickAt(page, await findHit(page, 'target', a)); await page.waitForTimeout(c || 300); tries++; }
      check(await page.evaluate(b), 'clicked ' + a + ' until ' + b + ' (' + tries + ' clicks)'); break; }
    case 'hold': { // press and hold target a until it is done (or b ms)
      const w = await T.lookFor(page, 'target', a); if (!w) return;
      await page.mouse.move(w.r.x, w.r.y); await page.mouse.down();
      const t0 = Date.now();
      while (Date.now() - t0 < (b || 6000) && !(await page.evaluate(id => G.L.targets.find(t => t.id === id).done, a))) await page.waitForTimeout(100);
      await page.mouse.up();
      check(await page.evaluate(id => G.L.targets.find(t => t.id === id).done, a), 'held ' + a + ' until done'); break; }
    case 'face': await face(page, a, b); break;
    case 'wait': await page.waitForTimeout(a); break;
    case 'waitUntil': { const t0 = Date.now(); while (Date.now() - t0 < (b || 8000) && !(await page.evaluate(a))) await page.waitForTimeout(150); check(await page.evaluate(a), 'waited until ' + a); break; }
    case 'setU': await page.evaluate(u => { G.L.creature.u = u; }, a); break;
    case 'shoot': { const r = await findHit(page, 'creature'); check(!!r, 'the thing is a target'); if (r) await clickAt(page, r); break; }
    case 'eval': await page.evaluate(a); break;
    case 'click': { const r = await findHit(page, 'target', a); check(!!r, a + ' is in view'); if (r) await clickAt(page, r); break; }
    case 'combine': { const ok = await page.evaluate(([x, y]) => { const i = G.inv.findIndex(k => k.id === x), j = G.inv.find(k => k.id === y); if (i < 0 || !j) return false; G.active = i; return combine(G.inv[i], j); }, [a, b]); check(ok, 'combined ' + a + ' + ' + b); break; }
    case 'branch': { const which = await page.evaluate(a); for (const s of (which ? b : (c || []))) await runStep(page, s); break; }
    case 'expect': check(await page.evaluate(a), b || a); break;
    default: fail('unknown step ' + op);
  }
}

(async () => {
  const { browser, page, errors } = await T.launch();
  const files = fs.readdirSync(path.join(__dirname, 'nights')).filter(f => /^night\d+\.js$/.test(f)).sort();
  for (const f of files) {
    const n = parseInt(f.slice(5), 10);
    if (NIGHTS && !NIGHTS.includes(n)) continue;
    const sol = require('./nights/' + f);
    for (const tier of TIERS) {
      const steps = sol[tier] || sol.normal;
      for (const seed of SEEDS) {
        console.log('== night ' + n + ' (' + tier + ', seed ' + seed + ') ==');
        await page.goto(T.INDEX + '?level=' + n + '&go&seed=' + seed + '&diff=' + tier); await page.waitForTimeout(300);
        const s0 = await st(page);
        check(s0.state === 'play' && s0.level === n - 1, 'night ' + n + ' playing on ' + tier);
        check(await page.evaluate(() => G.L.diff.id) === tier, 'difficulty applied');
        for (const step of steps) await runStep(page, step);
        let s = await st(page);
        check(s.won, 'won');
        const t0 = Date.now();
        while (Date.now() - t0 < 12000 && (await st(page)).state !== 'survived') await page.waitForTimeout(200);
        s = await st(page);
        check(s.state === 'survived', 'aftermath finished -> survived (' + s.state + ')');
        const saved = await page.evaluate(([id, tier]) => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); return d.best[id] && d.best[id][tier] && d.best[id][tier].wins >= 1 && d.unlocked[tier] >= 1; }, [await page.evaluate(() => G.L.def.id), tier]);
        check(saved, 'win recorded in the save');
      }
    }
  }
  await T.finish(browser, errors, 'play');
})();
