'use strict';
// Runs every night's declared solution (test/nights/nightNN.js) and asserts the win and the survived screen.
// NIGHTS=1,3 SEEDS=1,2 narrow the run; default is all nights, seeds 1 and 2. There is one game, Nightmare; each night's
// solution file names its steps under that key.
const T = require('./lib');
const fs = require('fs'); const path = require('path');
const { check, fail, st, face, findHit, clickAt, lookForAndClick } = T;
const NIGHTS = process.env.NIGHTS ? process.env.NIGHTS.split(',').map(Number) : null;
const TIERS = (process.env.TIERS || 'nightmare').split(',');
const SEEDS = (process.env.SEEDS || '1,2').split(',').map(Number);

// a bow (night 5): press and hold, then let go. `when`: 'click' (let go at once), 'short' (just past the least draw, below
// the green), 'good' (once the bar is in the green), 'over' (past the green), 'top' (hold until the string slips), or a number of
// ms; `where`: on the thing (its body, followed while drawing, as a player keeps it in the sights) or 'off' (well to one side
// of it); `via`: 'mouse' (default), 'touch' (the Use button) or 'pad' (A), which both aim at the middle of the view
async function drawBow(page, when, where, via) {
  via = via || 'mouse';
  const body = () => page.evaluate(() => { const b = creatureBox(G.L.creature); return b && { x: b.x + b.w / 2, y: b.y + b.h / 2 }; });
  const aim = async () => { const r = await body(); if (!r) return null; return where === 'off' ? { x: r.x + (r.x > 640 ? -260 : 260), y: r.y } : r; };
  const press = async down => {
    if (via === 'mouse') { if (down) await page.mouse.down(); else await page.mouse.up(); return; }
    if (via === 'touch') { await page.evaluate(dn => document.getElementById('tUse').dispatchEvent(new PointerEvent(dn ? 'pointerdown' : 'pointerup', { bubbles: true, cancelable: true })), down); return; }
    await page.evaluate(dn => {
      if (!window._pad) { window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad]; }
      window._pad.buttons[0].pressed = dn;
    }, down);
  };
  if (via === 'mouse') { const p = await aim(); check(!!p, 'the thing is in view to draw on'); if (!p) return; await page.mouse.move(p.x, p.y); await page.waitForTimeout(60); }
  await press(true);
  if (typeof when === 'number') await page.waitForTimeout(when);
  else if (when === 'click') await page.waitForTimeout(via === 'pad' ? 40 : 0);   // a pad is read once a frame
  else {   // one look per round (the draw and where it is now), so letting go follows the bar closely; 'good' goes early in the band
    const t0 = Date.now();
    while (Date.now() - t0 < 5000) {
      const st = await page.evaluate(w => {
        const d = G.draw, box = creatureBox(G.L.creature), at = box && { x: box.x + box.w / 2, y: box.y + box.h / 2 };
        if (!d || d.state !== 'drawing') return { done: w === 'top' && !!d && d.state === 'loosed', at };
        const b = d.band, p = d.power, m = (d.u.draw.min || 0.18) / (d.u.draw.fill || 1.5);
        return { done: w === 'short' ? p > m + 0.03 : w === 'good' ? !!b && p >= b[0] + 0.015 : w === 'over' ? (b ? p > b[1] + 0.05 : p > 0.95) : false, at };
      }, when);
      if (st.done) break;
      if (via === 'mouse' && st.at) await page.mouse.move(where === 'off' ? st.at.x + (st.at.x > 640 ? -260 : 260) : st.at.x, st.at.y);
      await page.waitForTimeout(5);
    }
  }
  await press(false);
  await page.waitForTimeout(120);
}
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
    case 'draw': await drawBow(page, a, b, c); break;
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
      const steps = sol[tier];
      for (const seed of SEEDS) {
        console.log('== night ' + n + ' (' + tier + ', seed ' + seed + ') ==');
        await page.goto(T.INDEX + '?level=' + n + '&go&seed=' + seed); await page.waitForTimeout(300);
        const s0 = await st(page);
        check(s0.state === 'play' && s0.level === n - 1, 'night ' + n + ' playing on ' + tier);
        check(await page.evaluate(() => G.L.diff.id) === tier, 'difficulty applied');
        const [id, ending] = await page.evaluate(() => [G.L.def.id, !!G.L.def.ending]);
        for (const step of steps) await runStep(page, step);
        if (ending) { // the last night ends in the morning and the Nights screen, not the survived card
          const t0 = Date.now();
          while (Date.now() - t0 < 30000 && (await st(page)).state !== 'end') await page.waitForTimeout(200);
          const s = await st(page);
          check(s.state === 'end', 'the ending played out -> end (' + s.state + ')');
          const done = await page.evaluate(tier => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); return d.complete && d.complete[tier] === true && d.best[LEVELS[LEVELS.length - 1].id] && d.best[LEVELS[LEVELS.length - 1].id][tier].wins >= 1; }, tier);
          check(done, 'campaign marked complete in the save');
          continue;
        }
        let s = await st(page);
        check(s.won, 'won');
        const t0 = Date.now();
        while (Date.now() - t0 < 12000 && (await st(page)).state !== 'survived') await page.waitForTimeout(200);
        s = await st(page);
        check(s.state === 'survived', 'aftermath finished -> survived (' + s.state + ')');
        const saved = await page.evaluate(([id, tier]) => { const d = JSON.parse(localStorage.getItem('itscoming.v2')); return d.best[id] && d.best[id][tier] && d.best[id][tier].wins >= 1 && d.unlocked[tier] >= 1; }, [id, tier]);
        check(saved, 'win recorded in the save');
      }
    }
  }
  await T.finish(browser, errors, 'play');
})();
