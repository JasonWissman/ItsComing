'use strict';
// Shared helpers for the headless Playwright test scripts.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const INDEX = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = path.join(__dirname, 'shots');
const SEED = process.env.SEED ? '&seed=' + process.env.SEED : '';

let failures = 0;
function check(cond, msg) { if (!cond) { failures++; console.log('  FAIL: ' + msg); } else console.log('  ok: ' + msg); }
function fail(msg) { failures++; console.log('  FAIL: ' + msg); }
function failureCount() { return failures; }

async function launch(opts) {
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined),
    args: ['--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage({ viewport: (opts && opts.viewport) || { width: 1280, height: 760 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  return { browser, page, errors };
}
// query: the part after '?', e.g. 'level=3&go&debug'
async function open(page, query) {
  const q = (query || '') + (SEED ? (query ? SEED : SEED.slice(1)) : '');
  await page.goto(INDEX + (q ? '?' + q : '')); await page.waitForTimeout(300);
}
const st = page => page.evaluate(() => ({ state: G.state, level: G.levelIndex, inv: G.inv.map(i => i.id + ':' + i.uses), dist: +G.L.creature.dist.toFixed(1), won: G.L.won, dir: G.cam.dirIdx }));
// snap the camera to a compass direction (0 = N, clockwise) and pitch
async function face(page, d, down) {
  await page.evaluate(([d, down]) => { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; }, [d, !!down]);
  await page.waitForTimeout(120);
}
// the click point is the centre of the part of the thing that is on screen
async function findHit(page, kind, id) {
  return page.evaluate(([kind, id]) => {
    const h = [...R.hits].reverse().find(h => h.kind === kind && (kind === 'creature' || h.ref.id === id));
    if (!h) return null;
    const x0 = Math.max(0, h.x), y0 = Math.max(0, h.y), x1 = Math.min(R.W, h.x + h.w), y1 = Math.min(R.H, h.y + h.h);
    if (x1 - x0 < 4 || y1 - y0 < 4) return null;
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, frac: ((x1 - x0) * (y1 - y0)) / (h.w * h.h) };
  }, [kind, id]);
}
async function clickAt(page, r) { if (!r) { fail('nothing to click'); return; } await page.mouse.move(r.x, r.y); await page.waitForTimeout(60); await page.mouse.click(r.x, r.y); await page.waitForTimeout(120); }
async function hoverAt(page, r) { if (!r) { fail('nothing to hover'); return; } await page.mouse.move(r.x, r.y); await page.waitForTimeout(150); }
// look around like a player: pick the view where the thing is most fully in frame
async function lookFor(page, kind, id) {
  let best = null;
  for (const down of [true, false]) for (let d = 0; d < 8; d++) {
    await face(page, d, down);
    const r = await findHit(page, kind, id);
    if (r && (!best || r.frac > best.frac + 0.05)) best = { d, down, frac: r.frac };
    if (best && best.frac > 0.98) break;
  }
  if (!best) { fail('could not find ' + kind + ':' + id + ' anywhere'); return null; }
  await face(page, best.d, best.down);
  return { d: best.d, down: best.down, r: await findHit(page, kind, id) };
}
async function lookForAndClick(page, kind, id) {
  const w = await lookFor(page, kind, id);
  if (!w) return null;
  await clickAt(page, w.r);
  return { d: w.d, down: w.down };
}
async function finish(browser, errors, label) {
  if (errors.length) { failures++; console.log('PAGE ERRORS:\n' + errors.join('\n')); }
  console.log(failures ? ('\n' + failures + ' FAILURES' + (label ? ' in ' + label : '')) : ('\nALL CHECKS PASSED' + (label ? ' in ' + label : '')));
  await browser.close();
  process.exit(failures ? 1 : 0);
}
async function shot(page, name) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); }

module.exports = { INDEX, SHOTS, SEED, launch, open, st, face, findHit, clickAt, hoverAt, lookFor, lookForAndClick, check, fail, failureCount, finish, shot };
