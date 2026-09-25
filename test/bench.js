'use strict';
// Frame-time sweep: ?bench=N plays night N and sweeps every direction and pitch, measuring update+render CPU time.
// Reports mean/p95/max per night at 1920x1080 and flags any night whose p95 is over budget.
const T = require('./lib');
(async () => {
  const { browser, page, errors } = await T.launch({ viewport: { width: 1920, height: 1080 } });
  await T.open(page, 'level=1&go');
  const n = await page.evaluate(() => LEVELS.length);
  const budget = parseFloat(process.env.BUDGET || '8');
  let worst = null, bad = 0;
  for (let lvl = 1; lvl <= n; lvl++) {
    await page.goto(T.INDEX + '?bench=' + lvl + '&seed=1'); await page.waitForTimeout(400);
    const t0 = Date.now();
    while (Date.now() - t0 < 40000 && !(await page.evaluate(() => !!G.bench))) await page.waitForTimeout(250);
    const b = await page.evaluate(() => G.bench);
    if (!b) { T.fail('night ' + lvl + ': bench did not finish'); continue; }
    console.log('  night ' + lvl + ': mean ' + b.mean + ' ms, p95 ' + b.p95 + ' ms, max ' + b.max + ' ms (' + b.frames + ' frames)');
    if (!worst || b.p95 > worst.p95) worst = Object.assign({ lvl }, b);
    if (b.p95 > budget) bad++;
  }
  T.check(bad === 0, 'every night keeps update+render p95 under ' + budget + ' ms (worst: night ' + (worst && worst.lvl) + ' at ' + (worst && worst.p95) + ' ms)');
  await T.finish(browser, errors, 'bench');
})();
