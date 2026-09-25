'use strict';
// Nightmare lane switches: on flagged nights the thing changes its approach once, only while unseen, early on,
// and its distance stays continuous across the switch. Nights that opt out never switch, nor does any lower tier.
const T = require('./lib');
const { check } = T;
(async () => {
  const { browser, page, errors } = await T.launch();
  await T.open(page, 'level=1&go');
  const n = await page.evaluate(() => LEVELS.length);
  for (let lvl = 1; lvl <= n; lvl++) {
    const info = await page.evaluate(i => ({ lanes: LEVELS[i].lanes ? LEVELS[i].lanes.length : 1, flagged: LEVELS[i].laneSwitch !== false, id: LEVELS[i].id }), lvl - 1);
    if (info.lanes < 2) continue;
    let switched = 0, jumps = 0, seenSwitch = 0, runs = 0;
    for (let seed = 1; seed <= 6; seed++) {
      await page.goto(T.INDEX + '?level=' + lvl + '&go&seed=' + seed + '&diff=nightmare&nofr'); await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        // look away from every lane it could take: face the direction furthest from all of them, and down
        const c = G.L.creature; let bestYaw = 0, bestGap = -1;
        for (let d = 0; d < 8; d++) { const y = d * 45 * DEG; const gap = Math.min(...G.L.lanes.map(l => Math.abs(wrapPi(l.yaw - y)))); if (gap > bestGap) { bestGap = gap; bestYaw = y; } }
        G.cam.dirIdx = Math.round(bestYaw / (45 * DEG)) % 8; G.cam.yaw = G.cam.tYaw = bestYaw; G.cam.pitch = G.cam.tPitch = PITCH_DOWN;
        // any creature on the night may switch; each is watched for a jump in distance and for being seen
        const cs = G.L.creatures, lanes = cs.map(x => x.lane.idx), out = { switched: false, jump: 0, seenAt: null, u: null };
        for (let k = 0; k < 2400 && G.state === 'play'; k++) {
          const before = cs.map(x => x.dist);
          G.step(0.04);
          cs.forEach((x, i) => { if (x.lane.idx !== lanes[i]) { out.switched = true; out.jump = Math.max(out.jump, Math.abs(x.dist - before[i])); out.seenAt = out.seenAt || x.seen; out.u = Math.max(out.u || 0, +x.u.toFixed(2)); lanes[i] = x.lane.idx; } });
        }
        void c;
        return out;
      });
      runs++;
      if (r.switched) { switched++; if (r.jump > 0.5) jumps++; if (r.seenAt) seenSwitch++; if (r.u > 0.5) jumps++; }
    }
    if (info.flagged) check(switched >= 3 && jumps === 0 && seenSwitch === 0, 'night ' + lvl + ' (' + info.id + '): switches lanes on Nightmare while unseen, early, without a jump (' + switched + '/' + runs + ' runs switched, jumps ' + jumps + ', seen ' + seenSwitch + ')');
    else check(switched === 0, 'night ' + lvl + ' (' + info.id + '): opted out of lane switches (' + switched + ' switched)');
  }
  // never on Normal
  await page.goto(T.INDEX + '?level=6&go&seed=1&diff=normal&nofr'); await page.waitForTimeout(150);
  const normalSwitch = await page.evaluate(() => { const c = G.L.creature; G.cam.dirIdx = 4; G.cam.yaw = G.cam.tYaw = Math.PI; const l0 = c.lane.idx; for (let k = 0; k < 1500 && G.state === 'play'; k++) G.step(0.04); return c.lane.idx !== l0; });
  check(!normalSwitch, 'no lane switch on Normal');
  await T.finish(browser, errors, 'switch');
})();
