'use strict';
// Writes every creature's editing master to lab2d/assets/creatures/<id>.svg: the drawing at rest, one group per
// part with its joint. `npm run lab2d:export`, or `node lab2d/tools/export-creatures.js grinner walker` for some.
const path = require('path');
const fs = require('fs');
const T = require('../../test/lib');
const OUT = path.join(__dirname, '..', 'assets', 'creatures');
(async () => {
  const { browser, page, errors } = await T.launch();
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html') + '?nofr&bare');
  await page.waitForFunction(() => window.LAB2 && (LAB2.ready || LAB2.error), null, { timeout: 30000 });
  const wanted = process.argv.slice(2);
  const ids = await page.evaluate(() => LAB2.labIds().concat(LAB2.gameIds()));
  fs.mkdirSync(OUT, { recursive: true });
  let n = 0;
  for (const id of ids) {
    if (wanted.length && !wanted.includes(id)) continue;
    const svg = await page.evaluate(id => LAB2.exportSvg(id), id);
    fs.writeFileSync(path.join(OUT, id + '.svg'), svg);
    const parts = (svg.match(/<g id="/g) || []).length, shapes = (svg.match(/<path /g) || []).length;
    console.log('  ' + id.padEnd(14) + parts + ' parts, ' + shapes + ' shapes -> ' + path.relative(process.cwd(), path.join(OUT, id + '.svg')));
    n++;
  }
  if (errors.length) console.log('page errors:\n' + errors.join('\n'));
  await browser.close();
  console.log(n + ' creatures exported');
  process.exit(errors.length ? 1 : 0);
})();
