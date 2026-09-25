'use strict';
// Every lane of every night is fully visible (validateContent), and on Nightmare every lane a creature can take
// gets taken: a creature with a fixed lane keeps it, one with its own list picks among those, a night that always
// starts on its default lane does so, and otherwise any lane that is not a lure destination (noSwitch) comes up.
const T = require('./lib');
const { check } = T;
(async () => {
  const { browser, page, errors } = await T.launch();
  await T.open(page, 'level=1&go');
  const probs = await page.evaluate(() => validateContent());
  check(probs.length === 0, 'content validates' + (probs.length ? ':\n    ' + probs.join('\n    ') : ''));
  const n = await page.evaluate(() => LEVELS.length);
  for (let lvl = 1; lvl <= n; lvl++) {
    const info = await page.evaluate(i => {
      G.difficulty = 3; G.inv = []; const def = LEVELS[i], L = buildLevel(i);
      const expected = new Set(), mode = def.laneMode || 'random';
      for (const cd of def.creatures) {
        if (cd.lane !== undefined) expected.add(cd.lane);
        else if (cd.lanes) cd.lanes.forEach(k => expected.add(k));
        else if (mode === 'default') { const d = L.lanes.findIndex(l => l.default); expected.add(d >= 0 ? d : 0); }
        else L.lanes.forEach((l, k) => { if (!l.noSwitch) expected.add(k); });
      }
      const names = L.lanes.map(l => l.name); if (L.onEnd) L.onEnd();
      return { expected: [...expected], names };
    }, lvl - 1);
    if (info.expected.length < 2) continue;
    const seen = new Set();
    for (let seed = 1; seed <= 30 && seen.size < info.expected.length; seed++) {
      await page.goto(T.INDEX + '?level=' + lvl + '&go&seed=' + seed + '&diff=nightmare'); await page.waitForTimeout(120);
      for (const k of await page.evaluate(() => G.L.creatures.map(c => c.lane.idx))) if (info.expected.includes(k)) seen.add(k);
    }
    check(seen.size === info.expected.length, 'night ' + lvl + ': every lane it can take gets taken on Nightmare (' + [...seen].map(k => info.names[k]).join(', ') + ')');
  }
  await T.finish(browser, errors, 'lanes');
})();
