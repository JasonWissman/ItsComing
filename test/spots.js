// For each level and seed, screenshot every item at its chosen spot (camera aimed straight at it), then montage.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const T = require('./lib'); const URL = T.INDEX;
(async () => {
  const browser = await chromium.launch({ executablePath: require('./lib').CHROMIUM });
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  const dir = path.join(__dirname, 'shots', 'spots'); fs.mkdirSync(dir, { recursive: true });
  const seeds = [1, 2, 3, 4, 5, 6];
  await page.goto(URL); await page.waitForTimeout(200);
  const NLEVELS = await page.evaluate(() => LEVELS.length);
  for (let lvl = 1; lvl <= NLEVELS; lvl++) {
    const seen = {};
    for (const seed of seeds) {
      await page.goto(URL + '?level=' + lvl + '&go&seed=' + seed); await page.waitForTimeout(250);
      const items = await page.evaluate(() => G.L.items.map(it => {
        const dist = Math.hypot(it.x, it.z), yaw = Math.atan2(it.x, it.z);
        const d = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8;
        const yc = it.flat ? it.y : it.y + it.h / 2;
        const ang = Math.atan2(G.L.eyeH - yc, dist) / DEG;
        return { id: it.id, d, down: ang > 29, key: it.x.toFixed(1) + ',' + it.y.toFixed(2) + ',' + it.z.toFixed(1) };
      }));
      for (const it of items) {
        seen[it.id] = seen[it.id] || new Set(); seen[it.id].add(it.key);
        await page.evaluate(([d, down]) => { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; }, [it.d, it.down]);
        await page.waitForTimeout(150);
        const r = await page.evaluate(id => { const h = R.hits.find(h => h.kind === 'item' && h.ref.id === id); return h ? { x: h.x + h.w / 2, y: h.y + h.h / 2, w: h.w, h: h.h } : null; }, it.id);
        if (r) await page.mouse.move(r.x, r.y); else console.log('L' + lvl + ' seed ' + seed + ': ' + it.id + ' NOT VISIBLE from ' + it.d + (it.down ? ' down' : ' ahead'));
        await page.waitForTimeout(120);
        await page.screenshot({ path: path.join(dir, 'L' + lvl + '-s' + seed + '-' + it.id + '.png') });
      }
    }
    console.log('L' + lvl + ' distinct spots used: ' + Object.entries(seen).map(([k, v]) => k + '=' + v.size).join(', '));
  }
  await browser.close();
})();
