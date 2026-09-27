// usage: node shoot.js <name> <url-query> [actions...]
// actions: key:ArrowLeft  wait:500  click:x,y  zoom:1  hold:Shift  release:Shift  set:js  shot:name
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [name, query, ...actions] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: require('./lib').CHROMIUM, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  await page.goto(require('./lib').INDEX + (query || ''));
  await page.waitForTimeout(400);
  const dir = path.join(__dirname, 'shots');
  for (const a of actions) {
    const [op, arg] = a.split(/:(.*)/s);
    if (op === 'key') await page.keyboard.press(arg);
    else if (op === 'hold') await page.keyboard.down(arg);
    else if (op === 'release') await page.keyboard.up(arg);
    else if (op === 'wait') await page.waitForTimeout(parseInt(arg));
    else if (op === 'click') { const [x, y] = arg.split(',').map(Number); await page.mouse.move(x, y); await page.waitForTimeout(80); await page.mouse.click(x, y); }
    else if (op === 'move') { const [x, y] = arg.split(',').map(Number); await page.mouse.move(x, y); }
    else if (op === 'set') await page.evaluate(arg);
    else if (op === 'shot') await page.screenshot({ path: path.join(dir, arg + '.png') });
    else if (op === 'eval') console.log(await page.evaluate(arg));
  }
  await page.screenshot({ path: path.join(dir, name + '.png') });
  if (errors.length) console.log(errors.join('\n')); else console.log('no errors');
  await browser.close();
})();
