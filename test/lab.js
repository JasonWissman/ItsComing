'use strict';
// The 3D lab (lab/): served over HTTP (it is ES modules) and rendered headlessly on SwiftShader's WebGL2.
// Boot without errors, real draw calls, the walker comes (faster unseen), quality tiers change the render,
// three shots dissolve it and it comes back, it reaches you, a GLB export reloads with its skin and clips,
// screenshots for the eye, and the bench numbers for the record.
const T = require('./lib');
const { check } = T;
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png', '.glb': 'model/gltf-binary', '.md': 'text/markdown' };
function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, url: 'http://127.0.0.1:' + srv.address().port }));
  });
}
(async () => {
  const { srv, url } = await serve();
  const { browser, page, errors } = await T.launch();
  try { await run(srv, url, page, errors); } catch (e) { T.fail('threw: ' + (e && e.stack || e)); }
  srv.close();
  await T.finish(browser, errors, 'lab');
})();
async function run(srv, url, page, errors) {
  const open = async qs => { await page.goto(url + '/lab/index.html' + (qs ? '?' + qs : '')); await page.waitForFunction(() => window.LAB && (LAB.ready || LAB.error), null, { timeout: 60000 }); };
  const step = (n, dt) => page.evaluate(([n, dt]) => LAB.step(dt, n), [n, dt || 1 / 60]);
  // the simulation alone for n steps, then one rendered frame: what the behaviour sections need, at a fraction of the cost
  const sim = n => page.evaluate(n => { LAB.stepModel(1 / 60, n); LAB.step(1 / 60, 1); }, n);
  const model = () => page.evaluate(() => ({ state: LAB.model.state, dist: +LAB.model.c.dist.toFixed(2), seen: LAB.model.c.seen, dissolving: LAB.model.c.dissolving, dissolve: +LAB.model.c.dissolve.toFixed(2), hits: LAB.model.c.hits, u: LAB.model.c.u }));
  const info = () => page.evaluate(() => LAB.view.info());

  console.log('== boots and renders ==');
  await open('nofr&quality=high');
  const bootErr = await page.evaluate(() => LAB.error);
  check(!bootErr, 'no boot error' + (bootErr ? ': ' + bootErr.split('\n')[0] : ''));
  await step(12);
  let i = await info();
  check(i.calls > 10 && i.triangles > 5000, 'renders: ' + i.calls + ' draw calls, ' + i.triangles + ' triangles');
  check(i.bloom && i.shadows && !i.ink && i.pixelRatio === 1, 'high tier: bloom and shadows on, the screen-space ink pass off by default (ratio ' + i.pixelRatio + ')');
  const ch = await page.evaluate(() => ({ name: LAB.view.character.name, clips: LAB.view.character.clips.map(c => c.name), roles: LAB.view.character.roles, bones: LAB.view.character.bones.length, hulls: LAB.view.character.hulls.length }));
  check(ch.clips.join() === 'walk,idle,reach' && ch.roles.walk === 'walk' && ch.roles.reach === 'reach', 'the walker has walk, idle and reach clips (' + ch.name + ')');
  check(ch.bones === 25 && ch.hulls === 2, 'rigged with ' + ch.bones + ' bones and ' + ch.hulls + ' outline hulls');
  const labErr = await page.evaluate(() => LAB.error);
  check(!labErr, 'no error after rendering' + (labErr ? ': ' + labErr.split('\n')[0] : ''));

  console.log('== it comes, faster when unseen ==');
  let m0 = await model();
  await sim(120);
  let m1 = await model();
  check(m1.dist < m0.dist && m1.seen, 'facing it, it came from ' + m0.dist + ' m to ' + m1.dist + ' m in 2 s, seen');
  const seenDrop = m0.dist - m1.dist;
  await page.evaluate(() => { LAB.model.cam.dirIdx = 4; LAB.model.cam.yaw = LAB.model.cam.tYaw = Math.PI; });
  await sim(2); m0 = await model();
  await sim(120); m1 = await model();
  check(!m1.seen && (m0.dist - m1.dist) > seenDrop * 1.2, 'looking away, unseen, it came ' + (m0.dist - m1.dist).toFixed(2) + ' m (vs ' + seenDrop.toFixed(2) + ' m seen)');
  await page.evaluate(() => { LAB.model.cam.dirIdx = 0; LAB.model.cam.yaw = LAB.model.cam.tYaw = 0; });

  console.log('== quality tiers ==');
  await page.evaluate(() => { LAB.settings.quality = 'low'; LAB.view.applyTier('low'); });
  await step(3); i = await info();
  check(!i.bloom && !i.ink && !i.shadows && i.pixelRatio === 1, 'low tier: bloom, ink and shadows off');
  const lowCalls = i.calls;
  await page.evaluate(() => { LAB.settings.quality = 'high'; LAB.view.applyTier('high'); });
  await step(3); i = await info();
  check(i.bloom && i.shadows && i.calls > lowCalls, 'high tier draws more (' + lowCalls + ' -> ' + i.calls + ' calls: the shadow map and the bloom passes)');
  const highCalls = i.calls;
  await page.evaluate(() => { LAB.settings.ink = true; LAB.view.applyLook(); });
  await step(3); i = await info();
  check(i.ink && i.calls > highCalls, 'the ink edge pass draws the scene again (' + highCalls + ' -> ' + i.calls + ' calls)');
  await page.evaluate(() => { LAB.settings.ink = false; LAB.view.applyLook(); });
  await page.evaluate(() => { LAB.settings.outline = false; LAB.view.applyLook(); });
  await step(3); const noHull = (await info()).calls;
  await page.evaluate(() => { LAB.settings.outline = true; LAB.view.applyLook(); });
  await step(3); const withHull = (await info()).calls;
  check(withHull > noHull, 'the outline hulls cost ' + (withHull - noHull) + ' draw calls');
  await page.evaluate(() => { LAB.settings.pbr = true; LAB.view.applyLook(); });
  await step(3);
  check(await page.evaluate(() => LAB.view.character.skinnedMesh.material.isMeshStandardMaterial), 'PBR comparison swaps the character material');
  await page.evaluate(() => { LAB.settings.pbr = false; LAB.view.applyLook(); });
  await step(3);
  check(await page.evaluate(() => LAB.view.character.skinnedMesh.material.userData.toon === true), 'and back to toon');

  console.log('== three shots and it comes apart, then it is back ==');
  await page.evaluate(() => { LAB.model.setDist(12); LAB.model.shoot(); LAB.model.shoot(); });
  await sim(10); m0 = await model();
  check(m0.hits === 2 && !m0.dissolving, 'two hits, still coming');
  await page.evaluate(() => LAB.model.shoot());
  await sim(60); m0 = await model();
  check(m0.dissolving && m0.dissolve > 0.4 && m0.dissolve < 1, 'third hit: dissolving (' + m0.dissolve + ')');
  await sim(250); m1 = await model();
  check(!m1.dissolving && m1.dist > 100 && m1.hits === 0, 'gone, then back at ' + m1.dist + ' m');
  check(await page.evaluate(() => LAB.view.casings.mesh.count === 24), 'the shell casings came from a pool of 24');

  console.log('== it reaches you ==');
  await page.evaluate(() => LAB.model.setDist(1.6));
  await sim(30); m0 = await model();
  check(m0.state === 'dying', 'caught -> dying (' + m0.state + ')');
  await sim(130); m0 = await model();
  check(m0.state === 'caught', 'then the overlay (' + m0.state + ')');
  check(await page.evaluate(() => document.getElementById('overlay').classList.contains('show') && document.getElementById('overlay').textContent.includes('It got you')), 'overlay says it got you');
  await page.evaluate(() => LAB.model.reset());
  await sim(3); m0 = await model();
  check(m0.state === 'play' && m0.dist > 100, 'reset: it starts over at ' + m0.dist + ' m');

  console.log('== GLB out, GLB in ==');
  const rt = await page.evaluate(() => LAB.roundtrip());
  check(rt.bytes > 20000, 'exported ' + (rt.bytes / 1024).toFixed(0) + ' KB');
  check(rt.skinned >= 1 && rt.bones === 25, 'reimported: ' + rt.skinned + ' skinned mesh, ' + rt.bones + ' bones, ' + rt.meshes + ' meshes');
  check(rt.clips.join() === 'walk,idle,reach' && rt.roles.walk === 'walk' && rt.roles.idle === 'idle' && rt.roles.reach === 'reach', 'clips survive and map to roles: ' + rt.clips.join(', '));
  await step(3);
  const rtErr = await page.evaluate(() => LAB.error);
  check(!rtErr, 'the reimported character renders' + (rtErr ? ': ' + rtErr.split('\n')[0] : ''));
  check((await info()).character.includes('reimported'), 'and is the one on the lane');

  console.log('== screenshots ==');
  for (const [name, qs] of [['lab-far', 'quality=high&dist=40&hold'], ['lab-near', 'quality=high&dist=5&hold'], ['lab-reach', 'quality=high&dist=2.2&hold'], ['lab-ink', 'quality=high&dist=5&hold&set=ink:true']]) {
    await open('nofr&' + qs);
    await page.evaluate(() => { LAB.step(2, 1); LAB.step(1 / 60, 2); });   // one long frame settles the blends, then two real ones
    await T.shot(page, name);
    const e = await page.evaluate(() => LAB.error); check(!e, name + '.png taken' + (e ? ' with error: ' + e.split('\n')[0] : ''));
  }

  console.log('== bench (short: software GL draws a frame in half a second; the number that matters here is the CPU side) ==');
  const per = parseInt(process.env.BENCH_FRAMES || '8', 10);
  await open('bench=' + per + '&quality=low');
  const t0 = Date.now();
  while (Date.now() - t0 < 240000 && !(await page.evaluate(() => !!LAB.benchResult))) await page.waitForTimeout(500);
  const b = await page.evaluate(() => LAB.benchResult);
  check(!!b && b.frames > 0, 'bench finished');
  if (b) console.log('  lab bench (' + b.tier + ' tier, 1280x760, ' + per + ' frames per view): cpu mean ' + b.mean + ' ms, p50 ' + b.p50 + ' ms, p95 ' + b.p95 + ' ms, max ' + b.max + ' ms, ' + b.calls + ' draws, ' + b.triangles + ' tris');
}
