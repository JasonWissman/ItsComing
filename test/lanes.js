'use strict';
// Every lane of every night is fully visible (validateContent), and on Nightmare every lane gets picked.
const T = require('./lib');
const { check } = T;
(async () => {
  const { browser, page, errors } = await T.launch();
  await T.open(page, 'level=1&go');
  const probs = await page.evaluate(() => validateContent());
  check(probs.length === 0, 'content validates' + (probs.length ? ':\n    ' + probs.join('\n    ') : ''));
  const n = await page.evaluate(() => LEVELS.length);
  for (let lvl = 1; lvl <= n; lvl++) {
    const lanes = await page.evaluate(i => { G.difficulty = 3; const L = buildLevel(i); const names = L.lanes.map(l => l.name); if (L.onEnd) L.onEnd(); return names; }, lvl - 1);
    if (lanes.length < 2) continue;
    const seen = new Set();
    for (let seed = 1; seed <= 30 && seen.size < lanes.length; seed++) {
      await page.goto(T.INDEX + '?level=' + lvl + '&go&seed=' + seed + '&diff=nightmare'); await page.waitForTimeout(120);
      seen.add(await page.evaluate(() => G.L.lane.name));
    }
    check(seen.size === lanes.length, 'night ' + lvl + ': every lane gets picked on Nightmare (' + [...seen].join(', ') + ')');
  }
  await T.finish(browser, errors, 'lanes');
})();
