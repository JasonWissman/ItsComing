// For many seeds: from every direction/pitch, is every visible item actually clickable at its rect center?
const { chromium } = require('playwright');
const T = require('./lib'); const URL = T.INDEX;
(async () => {
  const browser = await chromium.launch({ executablePath: require('./lib').CHROMIUM });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  let problems = 0, checks = 0;
  const seeds = [...Array(parseInt(process.env.N || '24')).keys()].map(i => i + 1);
  const NIGHTS = process.env.NIGHTS ? process.env.NIGHTS.split(',').map(Number) : null; // NIGHTS=11,12 narrows it
  await page.goto(T.INDEX); await page.waitForTimeout(200);
  const NLEVELS = await page.evaluate(() => LEVELS.length);
  for (let lvl = 1; lvl <= NLEVELS; lvl++) {
    if (NIGHTS && !NIGHTS.includes(lvl)) continue;
    const found = {};
    for (const seed of seeds) {
      await page.goto(URL + '?level=' + lvl + '&go&seed=' + seed); await page.waitForTimeout(200);
      const ids = await page.evaluate(() => G.L.items.filter(i => !i.taken).map(i => i.id + '#' + G.L.items.indexOf(i))); // not what the night starts you holding; each one (night 5's three arrows share an id)
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
            out.push({ id: h.ref.id, key: h.ref.id + '#' + G.L.items.indexOf(h.ref), onscreen, ok: !!top && top.kind === 'item' && top.ref.id === h.ref.id, top: top ? top.kind + ':' + (top.ref.id || '') : 'none', w: Math.round(h.w), h: Math.round(h.h), x: Math.round(mx), y: Math.round(my) });
          }
          return out;
        });
        for (const r of res) {
          if (!r.onscreen) continue;
          checks++; seenFrom[r.key] = true;
          if (!r.ok) { problems++; console.log('L' + lvl + ' seed ' + seed + ' ' + (down ? 'down' : 'ahead') + ' dir ' + d + ': ' + r.id + ' center hits ' + r.top + ' (rect ' + r.w + 'x' + r.h + ' at ' + r.x + ',' + r.y + ')'); }
          if (r.w < 6 || r.h < 4) { console.log('L' + lvl + ' seed ' + seed + ' ' + (down ? 'down' : 'ahead') + ' dir ' + d + ': ' + r.id + ' is tiny (' + r.w + 'x' + r.h + ')'); }
        }
      }
      const unseen = ids.filter(k => !seenFrom[k]);
      for (const k of unseen) { problems++; console.log('L' + lvl + ' seed ' + seed + ': ' + k + ' is NOT VISIBLE from any direction'); }
      for (const id of new Set(ids.map(k => k.split('#')[0]))) found[id] = (found[id] || 0) + (unseen.some(k => k.split('#')[0] === id) ? 0 : 1);   // every one of them seen
    }
    console.log('L' + lvl + ': items visible in every layout: ' + Object.entries(found).map(([k, v]) => k + ' ' + v + '/' + seeds.length).join(', '));
  }
  if (errors.length) { problems += errors.length; console.log('PAGE ERRORS:\n' + errors.join('\n')); }
  console.log(checks + ' checks, ' + problems + ' problems');
  await browser.close();
  process.exit(problems ? 1 : 0);
})();
