// Lay out the spot screenshots for a level in a grid (rows = seeds, columns = items) and screenshot the grid.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const dir = path.join(__dirname, 'shots', 'spots');
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium' });
  const NLEVELS = Math.max(...fs.readdirSync(dir).map(f => (f.match(/^L(\d+)-/) || [0, 0])[1]).map(Number));
  for (let lvl = 1; lvl <= NLEVELS; lvl++) {
    const files = fs.readdirSync(dir).filter(f => f.startsWith('L' + lvl + '-')).sort();
    const seeds = [...new Set(files.map(f => f.split('-')[1]))].sort((a, b) => +a.slice(1) - +b.slice(1));
    const items = [...new Set(files.map(f => f.split('-')[2].replace('.png', '')))];
    let html = '<html><body style="margin:0;background:#000;font:12px monospace;color:#ccc"><table style="border-collapse:collapse">';
    html += '<tr><td></td>' + items.map(i => '<td style="padding:2px 4px">' + i + '</td>').join('') + '</tr>';
    for (const sd of seeds) {
      html += '<tr><td style="padding:2px 4px">' + sd + '</td>' + items.map(i => {
        const f = path.join(dir, 'L' + lvl + '-' + sd + '-' + i + '.png');
        return '<td style="padding:1px">' + (fs.existsSync(f) ? '<img src="file://' + f + '" width="320" height="200">' : '') + '</td>';
      }).join('') + '</tr>';
    }
    html += '</table></body></html>';
    const p = path.join(dir, 'montage-L' + lvl + '.html'); fs.writeFileSync(p, html);
    const page = await browser.newPage({ viewport: { width: 40 + 326 * items.length, height: 20 + 204 * seeds.length } });
    await page.goto('file://' + p); await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(__dirname, 'shots', 'spots-L' + lvl + '.png'), fullPage: true });
    await page.close();
    console.log('montage L' + lvl + ': ' + seeds.length + ' seeds x ' + items.join(','));
  }
  await browser.close();
})();
