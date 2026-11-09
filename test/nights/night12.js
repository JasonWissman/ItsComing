// The Bedroom: bulb from the drawer into the lamp, the switch (on Nightmare the cord first, and three clicks),
// then hold the covers up. The lamp is switched back on if it has gone out before the covers are up. Then the covers
// come up over your eyes and it plays out under them: it comes to the bed and pulls at them three times, and they hold.
// First, the mattress's top is one piece drawn before the covers, so no part of it is drawn over them as they come up.
const relight = ['waitUntil', "G.L.won ? true : (!G.L.s.lampOn && G.L.s.fitted && G.L.s.plugged ? (useTarget(G.L.targets.find(t => t.id === 'lamp')), false) : false)", 20000];
const lamp = [['use', 'drawer'], ['pickup', 'bulb'], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on']];
const mattress = ['expect', "(() => { const m = R.statics.filter(p => p.kind === 'poly' && p.pts.length >= 3 && p.pts.every(v => Math.abs(v[1] - 0.58) < 1e-6 && Math.abs(v[0]) <= 0.751) && p.pts.some(v => v[2] > 1)); return m.length === 1 && m[0].sd > 1.62; })()", 'the mattress top is one piece, drawn before the covers'];
const under = [['waitUntil', 'G.L.s.over >= 1 && G.L.s.tugs === 3', 9000], ['expect', "G.state === 'won' && G.L.creature.dist <= G.L.creature.lane.barrierDist + 0.01", 'under the covers: it came to the bed and pulled at them three times, and they held']];
// What will not go, shown (js/hands.js), with it held where it is: the wrong bulb is tried in the lamp's socket, will not go
// in, and drops onto the bed, where it can be seen and taken again (looked at as a player would, and clicked); with no bulb
// in, your hand pulls the lamp's chain and nothing comes of it; holding the covers, your hand is on their hem.
const fresh = [['eval', 'restartLevel(); G.L.creature.hold = G.L.creature.dist;'], ['wait', 250]];
const T = id => "G.L.targets.find(t => t.id === '" + id + "')";
const seeAndTake = "(() => { const it = G.L.items.find(i => i.id === 'bulb2'); const yaw = Math.atan2(it.x, it.z); G.cam.dirIdx = ((Math.round(yaw / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; return it; })()";
const clickable = "(() => { const it = G.L.items.find(i => i.id === 'bulb2'), h = [...R.hits].reverse().find(h => h.kind === 'item' && h.ref === it); if (!h) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2 + R.viewY; updateHover(); return !!G.hover && G.hover.ref === it; })()";
const fumbles = [].concat(
  fresh, [['eval', T('drawer') + '.onClick(); const b = G.L.items.find(i => i.id === "bulb2"); b.taken = true; G.inv.push(b); G.active = 0; G.hand.reach = null; G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300],
    ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.fumbling && G.fumbling.preset === 'bump' && G.fumbling.drop && !G.inv.length && /Wrong kind of bulb/.test(G.lastToast.msg)", 'the wrong bulb is tried in the lamp, and will not go in'],
    ['waitUntil', '!G.fumbling', 3000], ['expect', "(() => { const it = G.L.items.find(i => i.id === 'bulb2'); return !it.taken && it.y === G.L.floor.y && !G.L.s.fitted; })()", 'it drops onto the bed'],
    ['eval', seeAndTake], ['wait', 300], ['expect', clickable, 'where it can be seen and taken again'],
    ['eval', 'pickup(' + seeAndTake + ');'], ['expect', "G.inv.some(i => i.id === 'bulb2')", 'and taken']],
  fresh, [['eval', 'G.cam.dirIdx = 2; G.cam.yaw = G.cam.tYaw = Math.atan2(' + T('lamp') + '.x, ' + T('lamp') + '.z); G.cam.pitch = G.cam.tPitch = 0;'], ['wait', 300], ['eval', 'useTarget(' + T('lamp') + ');'],
    ['expect', "G.hand.reach && G.hand.reach.style === 'pull' && G.hand.reach.target === " + T('lamp'), 'no bulb in it, nothing in hand: your hand goes to the lamp\'s chain'],
    ['waitUntil', 'G.L.s.tugAt > 0', 2000], ['expect', 'G.L.s.tugAt > 0 && !G.L.s.lampOn', 'and pulls it, and nothing comes of it']],
  [['eval', 'restartLevel();'], ['wait', 250]]);
// holding the covers, your hand is on them (watched while the solution holds them)
const coverHand = ['eval', "window.__coverHand = false; (function w() { if (G.holding && G.holding.id === 'covers' && G.hand.reach && G.hand.reach.target === G.holding) window.__coverHand = true; if (G.state === 'play') requestAnimationFrame(w); })();"];
module.exports = {
  // Nightmare charges 3.5x speed for every second spent looking away, so the harness faces each thing directly instead of sweeping
  nightmare: fumbles.concat([mattress, ['face', 5, true], ['use', 'socket'], ['expect', 'G.L.s.plugged', 'cord plugged in'], ['face', 2, true], ['use', 'drawer'], ['pickup', 'bulb'], ['face', 2, false], ['use', 'lamp'], ['expect', 'G.L.s.fitted', 'bulb fitted'], ['clickUntil', 'lamp', 'G.L.s.lampOn', 250, 6], ['expect', 'G.L.s.lampOn', 'lamp on'], ['face', 4, false], coverHand, ['hold', 'covers', 9000], ['expect', 'G.L.s.coversUp', 'covers up'], ['expect', 'window.__coverHand', 'holding them, your hand was on the covers'], relight, ['expect', 'G.L.won', 'won'], ...under]),
};
