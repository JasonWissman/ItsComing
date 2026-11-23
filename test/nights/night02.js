// The Road: it stalled in drive. With nothing in hand the ignition is felt for with the empty hand. The house keys (red
// caps) are tried at the keyhole, will not go in, and drop to the floor at your feet, where looking down finds them and a
// click takes them again; trying them does not bring the thing on any faster. The car keys (green head) go in. The gas
// with the engine dead only goes down under your foot. The key does nothing until the gearstick is in park: the hand takes
// it and it strains a few degrees and goes back; the hand takes the stick's knob to move it. Turn the key until it
// catches, then the stick goes to reverse or drive, whichever way it is not in the road; the gas pedal takes the car off
// down the road, and the whole world slides past until the night fades out. In park, or in neutral (the stick goes round
// park, reverse, neutral, drive), the gas only revs.
//
// First, with it put in the road 12 m off and the car already running in drive, the gas: the car leaps at it as it comes
// down the road, and hits it (the night's easter egg, in the save from that moment). It is knocked back down the road,
// the way the car was going, and lies 15 m ahead (12 m behind, in reverse); the car lurches to a halt with its engine
// still running, the night goes on and the car answers again: the stick is clicked over to the other way and the gas
// takes the car away from it, which wins the night as ever. Then the same in reverse with it in the road behind, and
// this time nothing is done: it lies there, twitches, gets up, stands, looks, drops to all fours and comes on, each
// part in its order, and when it reaches the car the card says "It got you" and only "It got right back up."; the glass
// shows no crack until it is at the glass. Then from off a front corner (it leaps into the road and is hit), and driven
// at a second time as it lies there: it is not hit again. It is on all fours and looking at once, comes at the car as
// the car comes at it, and 6.5 m off it springs, over the bonnet and through the windshield: "It got you", and only
// "It was ready for that." (the glass cracks as it meets it, and bursts). The same in reverse once it is up and coming
// again: it stops, looks, and comes through the back window. Then
// caught with the engine running and the car not away, the card says exactly "The
// engine was running, but you couldn't get away fast enough." (with the engine dead, the window it came through, as
// before). Then things are put down from every way you can look, wherever in the view you click: the keys and the bottle
// land where all of them shows from the seat (never under the dash, a seat or the console) and a click takes them again.
// Then the same layout from the start, and it is sent round the car: it runs flat out round to the road behind, side-on.
// Then the same layout again from the start for the real run, where it goes round on its own; for the way out it is set
// down by the seed, so seeds 1-8 between them take every case: one more than a multiple of 4 on a verge ahead (reverse:
// driving on would be into it), two more in the road behind (drive away from it), three more squarely beside the car
// (reverse, or drive on seeds 7 more than a multiple of 8), a multiple of 4 in the road ahead (reverse).
// Before that, driving into it from off the road (it leaps into the road, and is hit), and every way it can be round the
// car in each gear (ways).
const again = ['eval', 'G.attempt = __att0 - 1; delete G.lastLane.road; restartLevel()'];   // the attempt number feeds the layout (and a retry avoids its last way in): the same night again
const fresh = ['expect', "G.state === 'play' && !G.L.s.started && !G.L.s.keyIn && G.L.s.gear === 'D' && !G.L.eye && __layout() === __lay0", 'the same night again, from the start'];
// driving into it: `gear` D with it in the road ahead, R with it in the road behind
// the glass: no crack shows before it is at the glass (how far off it was when the first one showed, against how far
// off it is when its hands meet that window), and the pane bursts a moment after
const GLASS = { front: 1.0, back: 1.15, passenger: 1.15, driver: 0.75 };
const crack = win => ['expect', "(g => g.win === '" + win + "' && g.broke && g.seenAt >= g.tc - 1e-6 && g.seenDist <= " + GLASS[win] + " + 1e-6 && g.seenDist > " + (GLASS[win] - 0.4) + " && g.tb - g.tc > 0.04 && g.tb - g.tc < 0.08 && g.tc > 0.15)(G.L.s.glass)",
  'the ' + win + ' glass shows nothing until it is at the glass (' + GLASS[win] + ' m from the seat), cracks as it meets it, and bursts a moment after'];
// driven at a second time (from where it lies, or once it is up and coming: `up`): no second blow. It gets ready, comes,
// springs from 6.5 m (or from where it is, if it is nearer) and comes through the glass that way: the death 'ready'
const sfxHook = ['eval', "window.__sfx = []; (s0 => { AUDIO.sfx = (n, p, so) => { __sfx.push(n); return s0(n, p, so); }; })(AUDIO.sfx)"];
const second = (R, up) => [
  ['face', 0, true], ['eval', "G.toast('Again.'); __sfx.length = 0; window.__d2 = G.L.creature.dist"], ['click', 'gas'],
  ['expect', "(r => !!r && r.again && r.hit < 0 && Math.abs(r.ready - " + (up ? 0.15 : 0.3) + ") < 1e-6 && r.T <= r.ready + 0.5 + 1e-6 && G.L.s.wasHit && !G.L.s.gone && (G.state === 'play' || G.deathCause === 'ready'))(G.L.s.ram)",
    'the gas again, at it ' + (up ? 'as it comes: it stops and looks' : 'as it lies there: it is getting onto all fours') + ', the car leaping at it, and it will spring in under a second'],
  ['waitUntil', "G.state === 'dying'", 4000],
  ['expect', "(r => G.deathCause === 'ready' && r.stage === 'spring' && r.hit < 0 && !G.L.s.knock && !G.L.creature.struck && Math.abs(r.sprangFrom - Math.min(6.5, __d2)) < 0.3 && r.sprangFrom <= __d2 && G.L.creature.pounce !== undefined && !__sfx.includes('carHit') && __sfx.includes('stingShriek'))(G.L.s.ram)",
    'it was not hit a second time: on all fours and coming, and 6.5 m off (or from where it was, nearer) it sprang at the glass'],
  ['waitUntil', "G.state === 'dead'", 4000],
  ['expect', "G.deathScreen.title === 'It got you' && G.deathScreen.text === 'It was ready for that.' && !G.L.text.eggs && /It got you/.test(UI.overlay.textContent) && /It was ready for that\\./.test(UI.overlay.textContent) && !/Nice try|Again\\.|got right back up/.test(UI.overlay.textContent)",
    'the card says It got you, and only: It was ready for that.'],
  ['expect', "__sfx.includes('stingGlass') && (G.L.eye.z - __eyeZ) * " + (R ? -1 : 1) + " > 0.2", 'the glass went with its own sound, and the car ran on under it meanwhile'],
  crack(R ? 'back' : 'front'),
];
const hit = (gear, end, deg) => { const R = gear === 'R', sign = R ? -1 : 1, lie = R ? 12 : 15, other = R ? 'D' : 'R'; return [
  ['eval', "(() => { G.L.s.roam.put(" + (deg !== undefined ? deg + ' * DEG' : R ? 'Math.PI' : '0') + ", 12); Object.assign(G.L.s, { keyIn: true, started: true, gear: '" + gear + "' }); delete SAVE.data.eggs.road; })()"],
  ['face', 0, true], ['eval', "G.toast('Drive.')"], ['click', 'gas'],
  R
    ? ['expect', "G.state === 'play' && G.L.s.ram && G.L.eye && G.L.eye.z < 0 && Math.abs(wrapPi(G.cam.tYaw - Math.PI)) < 0.1", 'in reverse with it in the road behind, the car leaps back at it, and you look round at it']
    : ['expect', "G.state === 'play' && G.L.s.ram && !G.L.s.gone && G.L.eye && G.L.eye.z > 0 && G.cam.tPitch < 0.2", 'in drive with it in the road, the car leaps at it, and you look up at the road'],
  ['waitUntil', 'G.L.s.wasHit', 4000],
  ['expect', '(r => ' + (deg === undefined ? '!r.leapt && r.landT < 0' : 'r.leapt && r.landT > 0.3 && r.landT < r.T && !r.leap && G.L.creature.leap === undefined') + ' && Math.abs(wrapPi(G.L.s.roam.b' + (R ? ' - Math.PI' : '') + ')) < 1e-6)(G.L.s.ram || G.L.s.rammed)',
    deg === undefined ? 'it was in the road already: no leap' : 'it was off the road: it sprang into the road in the car\'s path, and had landed there before the car hit it'],
  ['expect', "G.state === 'play' && SAVE.data.eggs.road === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.road === true", 'the car hits it: the easter egg is in the save from that moment, and the night goes on'],
  ['waitUntil', "!G.L.s.ram && G.L.s.knock && G.L.s.knock.stage === 'down'", 5000],
  ['expect', "(s => G.state === 'play' && !G.L.won && !s.gone && s.started && s.gear === '" + gear + "' && Math.abs(s.carZ) > 0.5 && Math.sign(s.carZ) === " + sign + ")(G.L.s)", 'the car has lurched to a halt a little way on, its engine still running and the stick where it was: the night is still in play'],
  ['expect', "(c => c.struck.down === 1 && c.yOff === 0 && Math.abs(c.dist - " + lie + ") < 0.05 && Math.abs((c.pos().z - G.L.eye.z) - " + sign * lie + ") < 0.1 && Math.abs(c.pos().x - G.L.eye.x) < 0.1 && c.visFrac > 0.3)(G.L.creature)",
    'it was knocked back down the road, the way the car was going: it lies in a heap ' + lie + ' m ' + (R ? 'behind, where it shows over the boot' : 'ahead, where it shows over the hood')],
  ['eval', "window.__yaw = G.cam.tYaw; lookKey('ArrowLeft')"], ['wait', 250],
  ['expect', "Math.abs(wrapPi(G.cam.tYaw - __yaw)) > 0.5 && G.cam.zoom < 1.05", 'the view is yours again: it turns, and is not closed in on the thing'],
  ...(end === 'again' ? [['eval', 'window.__eyeZ = G.L.eye.z'], ...second(R, false)] : end === 'againUp' ? [
    ['waitUntil', "!G.L.s.knock && G.L.s.knocked", 9000], ['wait', 600],
    ['expect', "G.state === 'play' && !G.L.creature.struck && G.L.creature.dist > 6.5", 'left alone it got up, and comes on down the road'],
    ['eval', 'window.__eyeZ = G.L.eye.z'], ...second(R, true),
  ] : end === 'caught' ? [
    ['waitUntil', "!G.L.s.knock && G.L.s.knocked", 9000],
    ['expect', "(c => G.state === 'play' && G.L.s.knocked.stages.join() === 'thrown,down,twitch,rise,look,leap,up' && !c.struck && !c.frozen && c.hold === null && c.dist > " + (lie - 1.5) + " && c.dist <= " + lie + " + 0.01 && G.L.s.sectorOf(G.L.s.roam.b) === '" + (R ? 'behind' : 'ahead') + "')(G.L.creature)",
      'each part in its order (knocked back, down, a twitch, getting up, the look, onto all fours), and it is let go where it landed, squarely ' + (R ? 'behind' : 'ahead of') + ' the car'],
    ['eval', 'window.__d1 = G.L.creature.dist'], ['wait', 2500],
    ['expect', "G.L.creature.dist < __d1 - 0.3 && Math.abs(wrapPi(G.L.s.roam.b - " + (R ? 'Math.PI' : '0') + ")) < 1e-6", 'it comes on down the road at the car, keeping to the road'],
    ['eval', '(c => { c.u = Math.max(c.u, 1 - Math.pow(2.2 / c.D0, 1 / c.gamma)); })(G.L.creature)'],
    ['waitUntil', "G.state === 'dying'", 20000],
    ['expect', "G.deathCause === 'gotup' && G.L.creature.lungeFrom < 1.4", 'it reaches the car: caught, having been hit'],
    ['waitUntil', "G.state === 'dead'", 4000],
    ['expect', "G.deathScreen.title === 'It got you' && G.deathScreen.text === 'It got right back up.' && !G.L.text.eggs && !G.L.text.death.drove && !G.L.text.death.reversed && !document.body.innerText.includes('Nice try') && document.body.innerText.includes('It got you') && document.body.innerText.includes('It got right back up.')",
      'the card says It got you, and only: It got right back up.'],
    crack(R ? 'back' : 'front'),
  ] : [
    ['clickUntil', 'gear', "G.L.s.gear === '" + other + "'", 200, 3],
    ['expect', "G.L.s.gear === '" + other + "' && G.state === 'play' && !G.L.s.gone", 'the stick answers: over to ' + (R ? 'drive' : 'reverse') + ', the other way'],
    ['click', 'gas'],
    ['expect', "(s => s.gone && s.dir === " + -sign + " && G.L.won && !s.ram && SAVE.data.eggs.road === true)(G.L.s)", 'and the gas: the car is away from it, and the night is won'],
    ['waitUntil', "G.state === 'won' && Math.sign(G.L.eye.z - G.L.s.carZ) === " + -sign, 6000],
    ['expect', "G.L.text.win === 'You drove off and did not look back.' && (p => Math.abs(p.z - G.L.eye.z) > 8)(G.L.creature.pos())", 'the usual win: You drove off and did not look back. It is left in the road'],
  ]),
  again, fresh,
]; };
// caught where it stands (set down beside the car, a step from catching you), the engine running or not
const caught = on => ['eval', "(() => { const c = G.L.creature; G.L.s.roam.put(Math.PI / 2, 2.5); " + (on ? "Object.assign(G.L.s, { keyIn: true, started: true, gear: 'P' }); G.toast('Park.'); " : '') + 'c.u = 1 - 1.29 / c.D0; })()'];
// a thing put down, from each of the eight ways you can look (looking down), at four places in the view: where a click
// there puts it down (nothing else under it to be clicked instead, and room that way), it must then be in sight from the
// seat, looking down or ahead some way: by the hittest's rule (in the view, a click on its middle its own) and by the
// picture itself (drawn as a plain marker, nearly all of it shows: against the same drawn over everything), and a click
// there takes it again
const PUT = `window.__putDown = async id => {
  const L = G.L, it = L.items.find(i => i.id === id), frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const look = async (d, down) => { G.cam.dirIdx = d; G.cam.yaw = G.cam.tYaw = d * 45 * DEG; G.cam.pitch = G.cam.tPitch = down ? PITCH_DOWN : 0; G.mouse.x = -1; await frame(); };
  const marked = () => { const cv = UI.canvas, px = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < px.length; i += 4) if (px[i] > 80 && px[i + 2] > 80 && px[i + 1] < px[i] * 0.45 && Math.abs(px[i] - px[i + 2]) < 70) n++; return n; };
  const seen = async () => {
    const icon = it.icon, p = L.rend.get(it);
    it.icon = ctx => { ctx.fillStyle = 'rgb(255,0,255)'; ctx.fillRect(-0.5, 0, 1, 1); };
    p.sortDist = 0.001; await frame(); const all = marked();
    delete p.sortDist; await frame(); const now = marked();
    it.icon = icon; await frame();
    const h = R.hits.find(h => h.kind === 'item' && h.ref === it);
    if (!h || all < 2000) return null;
    const x0 = Math.max(0, h.x), y0 = Math.max(0, h.y), x1 = Math.min(R.W, h.x + h.w), y1 = Math.min(R.H, h.y + h.h);
    if (x1 - x0 < 6 || y1 - y0 < 4) return null;
    const x = (x0 + x1) / 2, y = (y0 + y1) / 2;
    G.mouse.x = x; G.mouse.y = y; updateHover(); const mine = !!G.hover && G.hover.ref === it; G.mouse.x = -1; updateHover();
    return mine ? { frac: now / all, x, y } : null;
  };
  const out = { drops: 0, refused: 0, least: 1, bad: [], at: [] };
  for (let d = 0; d < 8; d++) for (const [u, v] of [[0.5, 0.62], [0.3, 0.8], [0.72, 0.74], [0.5, 0.9]]) {
    if (!G.inv.includes(it)) pickup(it);
    G.active = G.inv.indexOf(it);
    await look(d, true);
    const x = innerWidth * u, y = innerHeight * v;
    G.mouse.x = x; G.mouse.y = y; updateHover();
    if (G.hover) { G.mouse.x = -1; continue; }
    onClick({ clientX: x, clientY: y });
    G.mouse.x = -1;
    if (G.inv.includes(it)) { out.refused++; continue; }
    out.drops++; out.at.push([d, +it.x.toFixed(2), it.y, +it.z.toFixed(2)]);
    await frame();
    let s = await seen();
    for (let k = 0; k < 16 && !(s && s.frac > 0.9); k++) { await look(k % 8, k < 8); s = await seen(); }
    if (!s || s.frac <= 0.9) { out.bad.push('dir ' + d + ' at ' + u + ',' + v + ': at ' + it.x.toFixed(2) + ',' + it.y + ',' + it.z.toFixed(2) + ' ' + (s ? 'only ' + s.frac.toFixed(2) + ' of it shows' : 'not in sight')); continue; }
    out.least = Math.min(out.least, s.frac);
    onClick({ clientX: s.x, clientY: s.y });
    if (!G.inv.includes(it)) out.bad.push('dir ' + d + ' at ' + u + ',' + v + ': a click on it did not take it');
  }
  return out;
}`;
// every way it can be round the car (the road, the verges and off the corners, ahead and behind, and squarely beside it), in
// drive and in reverse: toward it (forward with it ahead, reversing with it behind) is the easter egg, with a leap into the
// road where it was off it, and none where it was in it; the opposite way, or either way with it squarely beside the car,
// gets away. The leap: 0.35 to 0.5 s, up off the road and down again, ending in the road in the car's path before the hit
const WAYS = [0, 11, -11, 66, -66, 90, -90, 114, -114, 169, -169, 180];
const ruleOf = (deg, gear) => { const a = Math.abs(deg), sec = a < 78 ? 'ahead' : a > 102 ? 'behind' : 'beside'; return sec !== (gear === 'D' ? 'ahead' : 'behind') ? 'win' : a === 0 || a === 180 ? 'egg' : 'egg+leap'; };
const WANT = WAYS.map(d => d + ':' + ruleOf(d, 'D') + '/' + ruleOf(d, 'R')).join(' ');
const ways = ['expect', `(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), out = [], bad = [];
  for (const deg of ${JSON.stringify(WAYS)}) {
    const got = [];
    for (const gear of ['D', 'R']) {
      G.attempt = __att0 - 1; delete G.lastLane.road; restartLevel();
      const L = G.L, s = L.s, c = L.creature, dir = gear === 'R' ? -1 : 1;
      delete SAVE.data.eggs.road;
      s.roam.put(deg * DEG, 12); Object.assign(s, { keyIn: true, started: true, gear });
      const sec = s.sectorOf(deg * DEG);
      L.targets.find(t => t.id === 'gas').onClick();
      if (!s.ram) { got.push(s.gone && L.won && !SAVE.data.eggs.road ? 'win' : '?'); if (s.dir !== dir) bad.push(deg + gear + ' went the wrong way'); continue; }
      const r = s.ram, leapT = r.leapT; let top = 0, t0 = performance.now();
      while (r.hit < 0 && performance.now() - t0 < 4000) { top = Math.max(top, c.yOff || 0); await wait(8); }
      const inRoad = Math.abs(wrapPi(s.roam.b - (dir > 0 ? 0 : Math.PI))) < 1e-6;
      if (r.hit < 0 || !inRoad || r.dir !== dir || SAVE.data.eggs.road !== true || s.gone || L.won) bad.push(deg + gear + ' not hit in the road');
      if (r.leapt && !(leapT >= 0.35 && leapT <= (SAVE.data.settings.reducedMotion ? 0.66 : 0.5) && r.landT >= leapT && r.landT < r.T && top > 0.3 && c.leap === undefined)) bad.push(deg + gear + ' leap ' + leapT + ' landed ' + r.landT + ' of ' + r.T + ' top ' + top);
      if (sec !== (dir > 0 ? 'ahead' : 'behind')) bad.push(deg + gear + ' sector ' + sec);
      got.push(r.leapt ? 'egg+leap' : 'egg');
    }
    out.push(deg + ':' + got.join('/'));
  }
  G.attempt = __att0 - 1; delete G.lastLane.road; restartLevel();
  window.__ways = out.join(' '); window.__waysBad = bad;
  return !bad.length && window.__ways === ${JSON.stringify(WANT)};
})()`, 'each of its twelve ways round the car, in drive and in reverse: toward it is the easter egg (it leaps into the road, in time, where it was off it), the opposite way or squarely beside it gets away'];
// the engine catches on the second turn of the key or the third, whatever the seed: never a fourth
const turns = ['expect', `(() => {
  const keep = [G.runSeed, G.attempt, JSON.stringify(G.lastLane)], seen = {};
  for (let S = 1; S <= 60; S++) for (let a = 0; a < 3; a++) { G.runSeed = S; G.attempt = a; seen[buildLevelDef(LEVELS[1], 1).s.cranksNeeded] = true; }
  G.runSeed = keep[0]; G.attempt = keep[1]; G.lastLane = JSON.parse(keep[2]);
  return Object.keys(seen).sort().join() === '2,3';
})()`, 'the engine catches on the second turn of the key or the third, on every seed (1 to 60, three tries of each): never later'];
const drove = [
  ['eval', "window.__layout = () => G.L.items.map(i => i.id + i.x.toFixed(2) + i.z.toFixed(2)).join() + ':' + G.L.creature.lane.idx; window.__lay0 = __layout(); window.__att0 = G.attempt"],
  turns, sfxHook,
  ...hit('D', 'away'),      // hit, the stick to reverse, and away
  ...hit('R', 'caught'),    // hit, and left to get up and come on
  ...hit('D', 'again', -66),   // off the front corner, on your side: it leaps into the road; driven at again as it lies there, it springs
  ...hit('R', 'againUp'),   // hit in reverse, left to get up, and driven at again: through the back window
  ...hit('D', 'caught'),    // (through the windshield)
  ways, fresh,
  caught(true),
  ['waitUntil', "G.state === 'dead'", 6000],
  ['expect', "G.deathCause === 'running' && G.deathScreen.title === 'It got you' && G.deathScreen.text === 'The engine was running, but you couldn\\'t get away fast enough.'", 'caught with the engine running: the card says exactly that (and not what the gearstick last said)'],
  again, fresh,
  ['wait', 1500],   // (past the night's opening line: a toast cut off by the catch goes in front of the card's line)
  caught(false),
  ['waitUntil', "G.state === 'dead'", 6000],
  ['expect', "G.deathCause === 'passenger' && G.deathScreen.title === 'It got you' && G.deathScreen.text === G.L.text.death.passenger", 'caught with the engine dead: the window it came through, as before'],
  crack('passenger'),
  again, fresh,
  ['eval', PUT],
  ['eval', 'G.L.creature.hold = G.L.creature.dist'],
  ['expect', "(async () => { const o = window.__put = [await __putDown('keys'), await __putDown('bottle')]; return o.every(r => r.drops >= 12 && !r.bad.length && r.least > 0.9); })()",
    'the keys and the bottle, put down every way you can look: each time they lie where they can be seen from the seat, and a click takes them again'],
  ['expect', "__put.every(r => r.at.every(([, x, y, z]) => (y === 0.66 ? x > 0.62 && z < 0.3 : z < 0.56 && z > -0.6 && !(x > 0.27 && z > -0.04 && z < 0.36) && !(x > 0.62 && z > -0.22 && z < 0.36))))", 'never under the dash, a seat or the console: on the open floor, or on the passenger seat'],
  again, fresh,
  // sent round the car (held where it is, so only its going round is seen): flat out, side-on, to the road behind
  ['eval', "(() => { const c = G.L.creature; G.L.s.roam.put(0, 30); c.frozen = true; Object.assign(G.L.s.roam, { circleU: 0, circleTo: 'back' }); window.__ran = false; window.__seen = []; })()"],
  ['waitUntil', "(window.__ran = window.__ran || G.L.creature.runPose, __seen.push(Math.round(G.L.s.roam.b / DEG)), !G.L.s.roam.rem && Math.abs(wrapPi(G.L.s.roam.b)) > 175 * DEG)", 9000],
  ['expect', "__ran && !G.L.creature.runPose && Math.abs(G.L.creature.dist - 30) < 0.01 && __seen.some(b => Math.abs(Math.abs(b) - 90) < 30) && Math.abs(wrapPi(G.L.creature.yaw - Math.PI)) < 0.1", 'it ran round the car, side-on, past one side, to the road behind, and stopped there'],
  again, fresh,
];
// where it is for the way out, by the seed: on a verge ahead, in the road behind, beside the car, in the road ahead
const place = ['eval', '(() => { const c = G.L.creature, k = G.runSeed % 4; G.L.s.roam.put([0, 11 * DEG * (c.lane.deg < 0 ? -1 : 1), Math.PI, (G.runSeed % 8 === 3 ? -1 : 1) * Math.PI / 2][k], Math.max(8, Math.min(c.dist, 30))); })()'];
const reverse = [['clickUntil', 'gear', "G.L.s.gear === 'R'", 200, 3], ['expect', "G.L.s.gear === 'R' && G.L.s.sectorOf(G.L.s.roam.b) !== 'behind'", 'it is not behind the car: into reverse']];
const forward = [['clickUntil', 'gear', "G.L.s.gear === 'D'", 200, 3], ['expect', "G.L.s.gear === 'D' && G.L.s.sectorOf(G.L.s.roam.b) !== 'ahead'", 'it is not ahead of the car: into drive']];
module.exports = {
  nightmare: [...drove,
    ['face', 0, false], ['click', 'ignition'],
    ['expect', "G.hand.reach && G.hand.reach.target.id === 'ignition' && !G.fumbling && G.lastToast.msg === 'There is no key in the ignition.'", 'nothing in hand: the hand goes to the lock and finds no key in it'],
    ['pickup', 'housekeys'],
    ['eval', '(() => { const c = G.L.creature; c.hold = c.dist; window.__u = c.u; })()'],   // held where it is, so any hurry the keys gave it would show
    ['use', 'ignition'],
    ['expect', "!G.L.s.keyIn && !G.hasItem('housekeys') && G.fumbling && G.fumbling.preset === 'bump' && !!G.fumbling.tip", 'house keys refused: tried at the keyhole blade first, and out of the hand'],
    ['expect', 'G.L.creature.u === window.__u', 'and trying them did not bring it on any nearer'],
    ['eval', 'G.L.creature.hold = null'],
    ['eval', 'window.__hk = G.fumbling.it'],
    ['click', 'ignition'], ['expect', "!G.L.s.keyIn && G.lastToast.msg === 'House keys. Not these.' && G.fumbling && G.fumbling.it === window.__hk && !G.hand.reach", 'clicked again while they are at the lock: nothing more'],
    ['waitUntil', '!G.fumbling && !window.__hk.taken', 4000],
    ['expect', '(k => k.y === G.L.floor.y && k.z > 0.1 && k.z < 0.42 && Math.abs(k.x) < 0.35)(window.__hk)', 'they dropped to the floor at your feet'],
    ['face', 0, true],
    ['expect', "(() => { const it = window.__hk, h = [...R.hits].reverse().find(r => r.kind === 'item' && r.ref === it); if (!h || h.w < 6 || h.h < 4) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2; updateHover(); const ok = !!G.hover && G.hover.ref === it; G.mouse.x = -1; return ok; })()", 'looking down they lie in sight, and a click there takes them'],
    ['pickup', 'keys'],
    // the ignition is in the dash beside the dials: in view looking straight ahead at the wheel, and the key goes in from there
    ['face', 0, false], ['expect', "(() => { const h = R.hits.find(h => h.kind === 'target' && h.ref.id === 'ignition'); return !!h && h.x >= 0 && h.y >= 0 && h.x + h.w <= R.W && h.y + h.h <= R.H; })()", 'looking straight ahead at the wheel, the ignition is in view'],
    ['use', 'ignition'], ['expect', 'G.L.s.keyIn && G.cam.dirIdx === 0 && G.cam.pitch < 0.1', 'key inserted, looking ahead'],
    ['use', 'gas'], ['expect', "!G.L.s.started && !G.L.s.gone && G.L.s.dead && G.state === 'play'", 'the gas with the engine dead: the pedal goes down under your foot, and nothing'],
    ['face', 0, false], ['click', 'ignition'], ['expect', "G.L.s.cranks === 0 && G.L.s.gear === 'D' && G.hand.reach && G.hand.reach.style === 'rattle'", 'in drive the key does nothing: the hand takes it'],
    ['waitUntil', 'G.L.s.keyAng > 8 * DEG', 1500], ['waitUntil', 'G.L.s.keyAng < 1 * DEG && !G.hand.reach', 2000],
    ['expect', 'G.L.s.cranks === 0 && !G.L.s.started', 'it strained a few degrees and went back, and the engine never turned'],
    // the plate at the edge of the view, looking down from the wheel: a click on it moves the stick, the hand going to the
    // knob. Then, looking down at the console, the knob is where the hand went: at the top of the stick as it is drawn
    // (the stick's own hit area, rising out of the plate lying flat on the console), and the plate lies flat under it
    ['face', 0, true], ['click', 'gear'],
    ['expect', "G.L.s.gear === 'P' && G.hand.reach && G.hand.reach.target.id === 'gear' && G.hand.reach.style === 'pull'", 'into park from the plate at the edge of the view: the hand takes the knob and pulls it over'],
    ['expect', "(async () => { const a = G.hand.reach && G.hand.reach.at; if (!a) return false; G.cam.dirIdx = 1; G.cam.yaw = G.cam.tYaw = 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); " +
      "const q = R.screenPos(a.x, a.y, a.z), hs = R.hits.filter(h => h.kind === 'target' && h.ref.id === 'gear' && h.poly && h.poly.length === 4); if (!q || hs.length !== 2) return false; " +
      "const top = h => Math.min(...h.poly.map(p => p[1])), bot = h => Math.max(...h.poly.map(p => p[1])), [stick, plate] = hs.slice().sort((x, y) => top(x) - top(y)), y = q.y + R.viewY; " +
      "return inPoly(q.x, y, stick.poly) && y < top(stick) + (bot(stick) - top(stick)) * 0.4 && !inPoly(q.x, y, plate.poly) && bot(plate) > bot(stick); })()", 'the hand is on the knob, up at the top of the stick where it is drawn, over the plate lying flat on the console'],
    ['clickUntil', 'ignition', 'G.L.s.started', 1300, 6], ['expect', 'G.L.s.started && G.L.s.cranks === G.L.s.cranksNeeded && G.L.s.cranks >= 2 && G.L.s.cranks <= 3', 'engine started, on the second turn of the key or the third'],
    ['use', 'gas'], ['expect', "!G.L.s.gone && G.L.s.gear === 'P' && G.state === 'play'", 'in park the gas only revs'],
    // the stick goes round P R N D: neutral is a place of its own on the plate, and in it the engine runs and the car stays put
    ['clickUntil', 'gear', "G.L.s.gear === 'N'", 200, 3],
    ['use', 'gas'], ['expect', "!G.L.s.gone && G.L.s.started && G.L.s.gear === 'N' && G.state === 'play' && !G.L.eye", 'into neutral (by way of reverse): the gas only revs, the car does not move'],
    place, ['branch', 'G.runSeed % 4 === 2 || G.runSeed % 8 === 7', forward, reverse],
    ['use', 'gas'], ['expect', 'G.L.won', 'the gas, in gear: away at once'],
    ['eval', 'window.__gap = () => { const p = G.L.creature.pos(), e = G.L.eye || { x: 0, z: 0 }; return Math.hypot(p.x - e.x, p.z - e.z); }; window.__d0 = window.__gap()'],
    ['expect', "G.L.s.gone && G.L.s.dir === (G.L.s.gear === 'R' ? -1 : 1)", 'the car pulls away the way it was put in gear'],
    ['waitUntil', 'G.L.eye && Math.abs(G.L.eye.z) > 25', 6000],
    ['expect', 'Math.abs(G.L.creature.dist - window.__gap()) < 1', 'how far it is goes by the car as it is now'],
    ['branch', 'G.L.s.dir < 0',
      [['expect', 'window.__gap() > window.__d0', 'backing away: the road slides away and it falls behind']],
      [['expect', '(() => { const p = G.L.creature.pos(); return Math.abs(p.x - 0.4) > 3 || p.z < G.L.eye.z; })()', 'driving on: it is off the road or behind the car']]],
    ['expect', "G.state === 'won' && G.L.text.win === 'You drove off and did not look back.'", 'the night ends: You drove off and did not look back.']],
};
