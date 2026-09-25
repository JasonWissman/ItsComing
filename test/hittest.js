// For many seeds: from every direction/pitch, is every visible item actually clickable at its rect center?
const { chromium } = require('playwright');
const T = require('./lib'); const URL = T.INDEX;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  let problems = 0, checks = 0;
  const seeds = [...Array(parseInt(process.env.N || '24')).keys()].map(i => i + 1);
  await page.goto(T.INDEX); await page.waitForTimeout(200);
  const NLEVELS = await page.evaluate(() => LEVELS.length);
  for (let lvl = 1; lvl <= NLEVELS; lvl++) {
    const found = {};
    for (const seed of seeds) {
      await page.goto(URL + '?level=' + lvl + '&go&seed=' + seed + '&diff=' + (seed % 2 ? 'normal' : 'nightmare')); await page.waitForTimeout(200); // every other layout on Nightmare, so tier-only items are checked too
      const ids = await page.evaluate(() => G.L.items.filter(i => !i.taken).map(i => i.id)); // not what the night starts you holding
      const seenFrom = {};
      for (const down of [true, false]) for (let d = 0; d < 8; d++) {
        await page.evaluate(([d, down]) => { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; G.mouse.x = -1; }, [d, down]);
        await page.waitForTimeout(90);
        const res = await page.evaluate(() => {
          const out = [];
          for (const h of R.hits) {
            if (h.kind !== 'item') continue;
            const x0 = Math.max(0, h.x), y0 = Math.max(0, h.y), x1 = Math.min(R.W, h.x + h.w), y1 = Math.min(R.H, h.y + h.h);
            if (x1 - x0 < 4 || y1 - y0 < 4) continue;
            const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
            // replicate the hover rule
            let best = null, bestArea = Infinity, target = null;
            for (let i = R.hits.length - 1; i >= 0; i--) { const r = R.hits[i]; if (mx < r.x || mx > r.x + r.w || my < r.y || my > r.y + r.h) continue; if (r.kind === 'target') { if (!target) target = r; continue; } const a = r.w * r.h; if (a < bestArea) { best = r; bestArea = a; } }
            const top = best || target;
            const onscreen = true;
            out.push({ id: h.ref.id, onscreen, ok: !!top && top.kind === 'item' && top.ref.id === h.ref.id, top: top ? top.kind + ':' + (top.ref.id || '') : 'none', w: Math.round(h.w), h: Math.round(h.h), x: Math.round(mx), y: Math.round(my) });
          }
          return out;
        });
        for (const r of res) {
          if (!r.onscreen) continue;
          checks++; seenFrom[r.id] = true;
          if (!r.ok) { problems++; console.log('L' + lvl + ' seed ' + seed + ' ' + (down ? 'down' : 'ahead') + ' dir ' + d + ': ' + r.id + ' center hits ' + r.top + ' (rect ' + r.w + 'x' + r.h + ' at ' + r.x + ',' + r.y + ')'); }
          if (r.w < 6 || r.h < 4) { console.log('L' + lvl + ' seed ' + seed + ' ' + (down ? 'down' : 'ahead') + ' dir ' + d + ': ' + r.id + ' is tiny (' + r.w + 'x' + r.h + ')'); }
        }
      }
      for (const id of ids) { found[id] = found[id] || 0; if (seenFrom[id]) found[id]++; else { problems++; console.log('L' + lvl + ' seed ' + seed + ': ' + id + ' is NOT VISIBLE from any direction'); } }
    }
    console.log('L' + lvl + ': items visible in every layout: ' + Object.entries(found).map(([k, v]) => k + ' ' + v + '/' + seeds.length).join(', '));
  }
  console.log(checks + ' checks, ' + problems + ' problems');
  await browser.close();
})();
