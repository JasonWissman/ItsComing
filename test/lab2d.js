'use strict';
// The ink lab (lab2d/): the game's own renderer with the passes. Loads from file:// like the game. Boots without
// errors, every creature in the registry (the game's thirteen and the lab's five) draws through the passes and
// leaves a hit-sized sprite, the passes toggle, an SVG becomes a creature in both modes, the three sets build,
// the compare split renders, it reaches you, screenshots, and the cost sweep for the record.
const T = require('./lib');
const { check } = T;
const path = require('path');
const INDEX = 'file://' + path.resolve(__dirname, '..', 'lab2d', 'index.html');
const TEST_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200" fill="none"><rect width="100" height="200" fill="black"/><g transform="translate(10 0)"><path fill="#803020" d="M20 190 L60 190 L50 60 L30 60 Z"/><circle cx="40" cy="40" r="22" fill="#c8b8a8"/><ellipse cx="32" cy="36" rx="4" ry="5" fill="#fff"/><ellipse cx="48" cy="36" rx="4" ry="5" fill="#fff"/><polygon points="25,190 20,160 30,165" fill="#402010"/></g></svg>';
(async () => {
  const { browser, page, errors } = await T.launch();
  try { await run(page, errors); } catch (e) { T.fail('threw: ' + (e && e.stack || e)); }
  await T.finish(browser, errors, 'lab2d');
})();
async function run(page, errors) {
  const open = async qs => { await page.goto(INDEX + '?nofr&' + (qs || '')); await page.waitForFunction(() => window.LAB2 && (LAB2.ready || LAB2.error), null, { timeout: 30000 }); };
  const step = (n, dt) => page.evaluate(([n, dt]) => LAB2.step(dt, n), [n, dt || 1 / 60]);
  const err = async () => { const e = await page.evaluate(() => LAB2.error); return e ? e.split('\n')[0] : null; };
  const hitOf = () => page.evaluate(() => { const c = LAB2.one; const r = R.projectRect(c.x, c.yOff, c.z, c.CR.w, c.CR.h, null); return r ? { w: +r.w.toFixed(0), h: +r.h.toFixed(0), ch: c.CR.h } : null; });

  console.log('== boots on the game\'s renderer ==');
  await open('scene=corridor&creature=grinner&dist=5&hold');
  check(!(await err()), 'no boot error' + ((await err()) ? ': ' + await err() : ''));
  await step(5);
  check(!(await err()), 'renders five frames');
  const ids = await page.evaluate(() => ({ lab: LAB2.labIds(), game: LAB2.gameIds() }));
  check(ids.lab.length === 5 && ids.game.length === 13, 'registry: ' + ids.game.length + ' game creatures and ' + ids.lab.length + ' new ones');

  console.log('== every creature draws through the passes ==');
  for (const id of ids.game.concat(ids.lab)) {
    await page.evaluate(id => { LAB2.settings.creature = id; LAB2.settings.mode = 'approach'; LAB2.resetThings(); LAB2.setDist(4); LAB2.one.hold = LAB2.one.dist; }, id);
    await step(3);
    const e = await err(), r = await hitOf();
    check(!e && r && r.h > r.ch * 90, id + (e ? ': ' + e : r ? ' (' + r.w + '×' + r.h + ' px at 4 m)' : ': not on screen'));   // about 158 px per metre at 4 m
    if (e) await page.evaluate(() => { LAB2.error = null; document.getElementById('error').style.display = 'none'; });
  }

  console.log('== the passes and the sets ==');
  const costs = {};
  for (const [name, patch] of [['plain', { ink: 0, hatch: 0, tone: 0, rim: 0, boil: 0, glow: 0, shadow: false }], ['ink', { ink: 2 }], ['hatch', { hatch: 0.6 }], ['tone', { tone: 0.5 }], ['rim', { rim: 0.6 }], ['boil', { boil: 1 }], ['mono', { mono: true }], ['inkEdges', { inkEdges: 1.5 }], ['flash', { flash: 0.8 }], ['misreg', { misreg: 2 }], ['dither', { dither: 1 }], ['paper', { paper: 0.5 }], ['hands', { hands: true, item: 'lantern' }], ['split', { split: true }]]) {
    await page.evaluate(([patch]) => Object.assign(LAB2.settings, patch), [patch]);
    await step(3);
    costs[name] = await page.evaluate(() => +LAB2.pct().p50.toFixed(1));
    check(!(await err()), 'pass ' + name + ' renders (' + costs[name] + ' ms a frame here, software canvas)');
    await page.evaluate(([patch]) => { for (const k in patch) LAB2.settings[k] = PANEL.DEFAULTS[k]; }, [patch]);
  }
  for (const scene of ['field', 'stage', 'corridor']) {
    await page.evaluate(s => LAB2.setScene(s), scene); await step(2);
    check(!(await err()) && (await page.evaluate(() => LAB2.L.props.length)) > 20, 'set "' + scene + '" builds and renders');
  }
  await page.evaluate(() => { LAB2.settings.mode = 'lineup'; LAB2.settings.lineup = 'all'; LAB2.resetThings(); }); await step(2);
  check(!(await err()) && (await page.evaluate(() => LAB2.things.length)) === 18, 'the line-up stands all eighteen in a row');

  console.log('== an SVG becomes a creature ==');
  await open('scene=stage');
  const id = await page.evaluate(t => LAB2.loadSvgText(t, 'test figure'), TEST_SVG);
  const info = await page.evaluate(id => { const e = LAB2.extra[id]; return { count: e.count, h: e.h, w: +e.w.toFixed(2), bbox: e.parsed.bbox }; }, id);
  check(info.count === 5 && info.bbox.w > 40 && info.bbox.w < 60 && info.bbox.h > 150, 'parsed: ' + info.count + ' shapes (the page-sized rect dropped), bounds ' + info.bbox.w.toFixed(0) + '×' + info.bbox.h.toFixed(0));
  check(Math.abs(info.h - 2) < 1e-9 && info.w > 0.4 && info.w < 0.8, 'sprite ' + info.w + ' × ' + info.h + ' m');
  for (const mode of ['raster', 'live']) {
    await page.evaluate(m => { LAB2.settings.svgMode = m; LAB2.setDist(4); LAB2.one.hold = LAB2.one.dist; }, mode); await step(3);
    const r = await hitOf();
    check(!(await err()) && r && r.h > 250, 'drawn as ' + mode + (r ? ' (' + r.w + '×' + r.h + ' px at 4 m)' : ''));
  }

  console.log('== out as an editing master, back as a rig ==');
  await open('scene=stage');
  const masters = await page.evaluate(() => { const out = {}; for (const id of LAB2.labIds().concat(LAB2.gameIds())) out[id] = LAB2.exportSvg(id); return out; });
  let okAll = true, parted = 0;
  for (const id in masters) { const svg = masters[id]; const ok = /^<\?xml/.test(svg) && /<svg /.test(svg) && /id="bounds"/.test(svg) && (svg.match(/<path /g) || []).length > 5; okAll = okAll && ok; if ((svg.match(/<g id="/g) || []).length > 1) parted++; }
  check(okAll, 'every creature exports as an SVG with #bounds and shapes (' + Object.keys(masters).length + ' files, ' + parted + ' with named parts)');
  const g = masters.grinner;
  check((g.match(/<g id="(legL|legR|armL|armR|head|body)">/g) || []).length === 6 && /head-pivot/.test(g) && /clipPath/.test(g), 'the grinner\'s master has its six parts, joints and clips');
  // a tool-style edit: the head scaled about its joint, as Figma or Illustrator would write it
  const edited = g.replace(/<g id="head">\s*<circle id="head-pivot" cx="([-\d.]+)" cy="([-\d.]+)"/, (m, cx, cy) => '<g id="head" transform="translate(' + cx + ' ' + cy + ') scale(1.5) translate(' + (-cx) + ' ' + (-cy) + ')"><circle id="head-pivot" cx="' + cx + '" cy="' + cy + '"');
  const rig = await page.evaluate(t => { const id = LAB2.loadRigText(t, 'grinner'); LAB2.setDist(4); LAB2.one.hold = LAB2.one.dist; LAB2.one.moving = true; LAB2.one.gait = 1; LAB2.step(1 / 60, 3); const e = LAB2.extra[id]; return { roles: e.rig.parts.map(p => p.role).sort().join(','), shapes: e.rig.count, h: e.h, name: e.name, clipped: e.rig.parts.some(p => p.paths.some(q => q.clips)), err: LAB2.error && LAB2.error.split('\n')[0] }; }, edited);
  check(!rig.err && rig.roles === 'armL,armR,body,head,legL,legR' && rig.shapes > 40 && rig.h === 1.35 && rig.clipped, 'back as a rig: ' + rig.name + ', ' + rig.shapes + ' shapes in six parts, the hatching still clipped' + (rig.err ? ': ' + rig.err : ''));
  const r2 = await hitOf();
  check(r2 && r2.h > 180, 'the edited grinner draws at its height (' + (r2 ? r2.w + '×' + r2.h : '?') + ' px at 4 m)');

  console.log('== it reaches you ==');
  await open('scene=corridor&creature=gaunt&dist=1.5');
  await step(4, 0.1);
  check(await page.evaluate(() => LAB2.state) === 'dying', 'caught -> dying');
  await step(22, 0.1);   // the lunge and the fade, in tenth-second steps (it fills the screen, and a software canvas is slow)
  check(await page.evaluate(() => LAB2.state === 'caught' && document.getElementById('overlay').classList.contains('show')), 'then the overlay');
  await page.evaluate(() => LAB2.reset()); await step(2);
  check(await page.evaluate(() => LAB2.state === 'play' && LAB2.one.dist > 30), 'reset: it starts over');

  console.log('== screenshots ==');
  for (const [name, qs] of [['lab2d-lineup', 'bare&scene=stage&lineup=lab&set=lineupDist:8,lineupGap:1.6,mono:true'], ['lab2d-corridor', 'bare&scene=corridor&creature=grinner&dist=5&hold&set=flash:0.8,mono:true'], ['lab2d-field', 'bare&scene=field&creature=gaunt&dist=4&hold'], ['lab2d-compare', 'bare&scene=corridor&creature=smiler&dist=3&hold&set=split:true,mono:true,inkEdges:1.5']]) {
    await open(qs); await step(3); await T.shot(page, name);
    check(!(await err()), name + '.png taken');
  }

  console.log('== cost sweep (software canvas: the order of the passes, not the time on a real machine) ==');
  await open('scene=corridor&creature=grinner&sweep=' + (process.env.SWEEP_FRAMES || 12));
  const t0 = Date.now();
  while (Date.now() - t0 < 240000 && !(await page.evaluate(() => !!LAB2.sweepResult))) await page.waitForTimeout(500);
  const sw = await page.evaluate(() => LAB2.sweepResult);
  check(!!sw && sw.length > 10, 'sweep finished');
  if (sw) console.log('  ' + sw.map(r => r.name + ' ' + r.p50 + (r.name === 'plain' ? '' : ' (+' + r.adds + ')')).join('  '));
}
