// The Phone Booth: nothing in hand; the notebook lies shut on the corner shelf under the phone (the only thing on it: no
// phone book, no panel over the view). The pay phone, a slim unit a size smaller than life on a backboard no wider than
// itself, stands across the north-east corner, between the two streets. Nothing is done to the view, ever: looking down at the notebook, clicking it, reading it and facing the
// phone leave the view as it is, and the zoom (Shift, Z, Space, the zoom button on a phone or a trigger) is the player's own. Look
// down at the notebook and click it: the cover goes back over the spiral; click (or tap it, or A on a gamepad) to
// turn each page over, until the one with the number scrawled large across it in red, alone on its page; with the zoom held
// it is read off (at 1280x760 the page then fills a good part of the view). Turning away, the notebook stays open where it
// lies. Find the coin (in the coin return, on the shelf under the phone or on the floor by the panes near it) and pick it
// up. Turn on to the last page and click: it shuts. Face the phone: a key does nothing with the receiver on its hook; lift
// the receiver; a key still does nothing without a coin; put the coin in; dial one of the ordinary numbers on the phone's
// own keys (not in service); hang up, and the coin comes back into the coin return. Take it; put it in with the receiver on
// its hook and it drops straight through, back into the return; take it again, lift the receiver, put it in. A key clicked
// with the zoom held is pressed as ever. A gamepad's d-pad moves a highlight over the phone's keys (and turns away past the
// last of them) and A presses the one highlighted. Dial the number with the number keys, and wait out the seven seconds of
// ringing while it keeps coming; then a car comes for you, pulls up and opens its door, and it has got off the road behind a
// lamp post and walks off. The notebook,
// the keys, the receiver and the coin slot are clicked where they are drawn, so their hit rects are tested as well; the
// number keys dial, not choose what you hold.
// What you do happens in your hands: a key is pressed by your fingertip (what you hold goes down meanwhile and comes back
// up after) and only goes down when the finger gets there; a key the phone will not take blinks its display at you; the
// lifted receiver is in your left hand until it goes back on its hook; the coin given back drops into the cup with a
// clink; the hand feels in the empty coin return; a coin put in on the hook goes from your fingers into the slot before it
// drops into the cup; keys typed faster than the finger can go are pressed in turn.
// The shade brings no light: none walks with it, and no glow is drawn on it. It goes from street lamp to street lamp along
// its own street, every one of them: it starts behind the last, the furthest down the street, lit by it (its face showing in
// that light), reaches up and breaks it (its light, glow and streak on the road go out for good), skitters on in the dark,
// its face gone, to the next one nearer, and so on; its whole way in takes the time its steady walk used to, so the race
// with the phone is as it was. From the phone it is in the view, at its edge, and not behind the phone.
const visible = sel => "(document.querySelector('" + sel + "') && document.querySelector('" + sel + "').style.display !== 'none')";
// click the phone's keys for a string of digits where they are drawn, as a mouse would
const clickKeys = digits => "(() => { for (const d of " + digits + ") { const h = [...R.hits].reverse().find(h => h.kind === 'target' && h.ref.id === 'key' + d); if (!h) return false; UI.canvas.dispatchEvent(new MouseEvent('click', { clientX: h.x + h.w / 2, clientY: h.y + h.h / 2, bubbles: true })); } return true; })()";
const coin = "G.L.items.find(i => i.id === 'coin')";
const inCup = '(!' + coin + '.taken && ' + coin + '.y > 1.2)';
const pad = (b, on) => "window._pad.buttons[" + b + "].pressed = " + on;
const tap = b => [['eval', pad(b, true)], ['wait', 90], ['eval', pad(b, false)], ['wait', 90]];
const padOn = ['eval', "window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad]"];
const padOff = ['eval', 'navigator.getGamepads = () => []'];
// watch for something that may only be true for a moment (an animation under way), from now on, every frame; saw: it was
const watch = (k, expr) => ['eval', "window._seen = window._seen || {}; window._seen['" + k + "'] = false; (() => { const f = () => { if (" + expr + ") window._seen['" + k + "'] = true; else if (G.state === 'play') requestAnimationFrame(f); }; f(); })()"];
const saw = (k, msg, ms) => [['waitUntil', "window._seen['" + k + "']", ms || 3000], ['expect', "window._seen['" + k + "']", msg]];
// the notebook: settled (nothing going over, nothing waiting to be done); and clicked where it is drawn, as a mouse would,
// once it has settled, until `until` (polled by waitUntil)
const nbS = 'G.L.s';
const settled = '(!' + nbS + '.nbAnims.length && !' + nbS + '.nbWant && !G.hand.reach)';
const clickNb = "(() => { const h = [...R.hits].reverse().find(h => h.kind === 'target' && h.ref.id === 'notebook'); if (h) UI.canvas.dispatchEvent(new MouseEvent('click', { clientX: h.x + h.w / 2, clientY: h.y + h.h / 2, bubbles: true })); })()";
const clickNbUntil = (until, ms) => ['waitUntil', '(() => { if (' + settled + ' && (' + until + ')) return true; if (' + settled + ') ' + clickNb + '; return false; })()', ms || 25000];
// blood-red pixels in the view, as a share of the page lying open
const redShare = "(() => { const r = G.L.s.nbRect, k = R.ctx.canvas.width / window.innerWidth, d = R.ctx.getImageData(Math.round(r.x * k), Math.round((r.y + R.viewY) * k), Math.round(r.w * k), Math.round(r.h * k)).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 90 && d[i] > 2.2 * d[i + 1] && d[i] > 2.2 * d[i + 2]) n++; return n / (d.length / 4); })()";
const inView = "(() => { const r = G.L.s.nbRect; return r.x >= 0 && r.y >= 0 && r.x + r.w <= R.W && r.y + r.h <= R.H; })()";
// the view as it always is: no zoom, and the pitch the arrow keys put it at
const plain = pitch => '(G.cam.zoom < 1.05 && Math.abs(G.cam.pitch - ' + pitch + ') < 0.02)';
// facing the phone, it is in the view (at its edge: the corner of your eye), and not hidden behind the phone
const periphery = "(() => { const p = G.L.creature.pos(), a = Math.abs(Math.atan2(p.x, p.z) / DEG - 45); return a < 44 && a > 16; })()";
const lamp0 = 'G.L.s.man.stops[0].lamp';
// the car coming for you, and the shade out of its way: from a place on its way in (frac of the way, on street k), the
// call answered there and the aftermath stepped by hand to its end. Every frame the shade is measured against the car (its
// body, bumpers and all, and its back door when open, with room to spare): it must never be inside it. It must get behind
// a lamp post on its own street, stand there still (a second at the least) until the car's door opens, and only then turn
// its back and walk off along the pavement.
const flee = (k, frac) => `(() => {
  const L = G.L, s = L.s, c = L.creature, save = [SAVE.recordWin, SAVE.unlock]; SAVE.recordWin = SAVE.unlock = () => {};
  c.lane = L.lanes[${k}]; L.lane = c.lane; L.laneIdx = ${k}; s.man = null; update(0.001);
  s.man.t0 = L.t - ${frac} * s.man.arrive; update(0.01);
  const startD = c.dist; win();
  const R0 = 0.35, out = { minSep: 99, hidAt: -1, still: 0, awayAt: -1, doorAt: -1, lampD: 99, onRoad: false, carSeen: false, endPose: null, startD: +startD.toFixed(1) };
  let last = null;
  for (let i = 0; i < 2500 && G.state === 'won' && !(s.end && L.aftermathT > s.end.done); i++) {
    update(0.01);
    const p = c.pos(), e = s.end, f = s.flee;
    if (e && e.pose) {
      out.carSeen = true;
      const P = e.pose, dx = p.x - P.x, dz = p.z - P.z, a = dx * P.fx + dz * P.fz, b = Math.abs(-dx * P.fz + dz * P.fx);
      const bw = e.doorT !== undefined ? 1.9 : 0.905;   // (its back door, open, standing out from its side)
      const sep = Math.hypot(Math.max(0, Math.abs(a) - 2.27), Math.max(0, b - bw)) - R0;
      out.minSep = Math.min(out.minSep, sep);
    }
    if (f && L.t - f.t0 >= f.rushT && !c.away) {
      if (out.hidAt < 0) { out.hidAt = +(L.t - f.t0).toFixed(2); out.lampD = Math.min(...s.man.stops.map(st => Math.hypot(p.x - st.lamp.x, p.z - st.lamp.z))); }
      if (last && Math.hypot(p.x - last.x, p.z - last.z) < 1e-6 && !c.rush) out.still += 0.01;
    }
    if (e && e.doorT !== undefined && out.doorAt < 0) out.doorAt = +(L.t - f.t0).toFixed(2);
    if (c.away && out.awayAt < 0) out.awayAt = +(L.t - f.t0).toFixed(2);
    if (out.hidAt >= 0 && (p.z > 1 && p.z < 8 || p.z >= 8 && Math.abs(p.x) < 3.5)) out.onRoad = true;
    last = p;
  }
  out.walked = +(c.dist - s.flee.to.d).toFixed(2); out.minSep = +out.minSep.toFixed(2); out.lampD = +out.lampD.toFixed(2); out.still = +out.still.toFixed(2);
  SAVE.recordWin = save[0]; SAVE.unlock = save[1];
  return out;
})()`;
// (played after the night is won, each on the night started over; the last is left to play out to the survived card)
const fleeCases = [0, 1].flatMap(k => [0, 0.25, 0.5, 0.7, 0.85, 0.93, 0.97, 0.995].flatMap(frac => [
  ['eval', 'restartLevel()'], ['wait', 300],
  ['eval', 'window.__fl = ' + flee(k, frac)],
  ['expect', '__fl.carSeen && __fl.minSep > 0.3', 'street ' + k + ', ' + frac + ' of the way in: the car came and it was never in the car'],
  ['expect', '__fl.hidAt >= 0 && __fl.hidAt < 2.2 && __fl.lampD < 1.2 && __fl.still >= 0.9 && __fl.awayAt >= __fl.hidAt + 0.95 && __fl.doorAt >= 0 && __fl.awayAt >= __fl.doorAt && __fl.walked > 2 && !__fl.onRoad', 'street ' + k + ', ' + frac + ': it scurried behind a lamp post, stood there facing you till the car door opened, and walked off along the pavement'],
]));
// The car's back door opening, from the booth, on either street: the door stands out from the kerb side between the car and
// you, so wherever on the view it overlaps a part of the car (its side, the lit doorway, the strip and seams along it, the
// cabin), it must be drawn after it, at every stage of its opening. Stepped by hand, the view held on the door (as the
// win's view turns to it, at its own zoom and a little either side), each frame drawn and measured on the screen
const doorOrder = k => `(() => {
  const L = G.L, s = L.s, c = L.creature, save = [SAVE.recordWin, SAVE.unlock]; SAVE.recordWin = SAVE.unlock = () => {};
  c.lane = L.lanes[${k}]; L.lane = c.lane; L.laneIdx = ${k}; s.man = null; update(0.001);
  s.man.t0 = L.t - 0.5 * s.man.arrive; update(0.01); win();
  // two convex polygons on the view overlap (by more than a hair): no line between them separates them
  const apart = (a, b) => [a, b].some(P => P.some((p, i) => { const q = P[(i + 1) % P.length], nx = q[1] - p[1], ny = p[0] - q[0], l = Math.hypot(nx, ny) || 1;
    const pa = a.map(v => (v[0] * nx + v[1] * ny) / l), pb = b.map(v => (v[0] * nx + v[1] * ny) / l);
    return Math.max(...pa) < Math.min(...pb) + 0.5 || Math.max(...pb) < Math.min(...pa) + 0.5; }));
  const out = { frames: 0, overlaps: 0, bad: 0, doorSeen: 0 };
  for (let i = 0; i < 2500 && G.state === 'won' && !(s.end && s.end.doorT !== undefined && L.aftermathT > s.end.doorT + 1); i++) {
    update(0.01);
    const e = s.end;
    if (!e || e.doorT === undefined || i % 4) continue;
    for (const dy of [-6, 0, 6]) {
      G.cam.yaw = G.cam.tYaw = e.doorYaw + dy * DEG; G.cam.pitch = G.cam.tPitch = e.doorPitch * 0.8; render();
      const drawn = (e.drawn || []).filter(p => p.alpha === undefined || p.alpha >= 0.5).map(p => ({ p, v: R.screenPoly(p.pts) })).filter(q => q.v);
      const door = drawn.filter(q => q.p.door && q.p.alpha === undefined), car = drawn.filter(q => !q.p.door);
      if (!door.length) continue;
      out.frames++; out.doorSeen++;
      for (const d of door) for (const q of car) if (!apart(d.v, q.v)) { out.overlaps++; if (!(d.p.sd < q.p.sd)) out.bad++; }
    }
  }
  SAVE.recordWin = save[0]; SAVE.unlock = save[1];
  return out;
})()`;
const doorCases = [0, 1].flatMap(k => [
  ['eval', 'restartLevel()'], ['wait', 300],
  ['eval', 'window.__door = ' + doorOrder(k)],
  ['expect', '__door.frames > 20 && __door.overlaps > 20 && __door.bad === 0', 'street ' + k + ': the open door is drawn over every part of the car behind it on the view, at every stage of its opening'],
]);
// 911, the other ending. From the phone, lifted, 9-1-1 on its keys (with no coin on the main street: an emergency call is
// free; with the coin in on the cross street), stepped by hand to the end: a dispatcher answers, and a police car comes
// instead of the other (s.cop), the same way, to the same place, its light bar going and its siren wailing; it goes to the
// car from behind its lamp post and in at a window, gone; the car rocks and thumps; the siren dies at the end of a wail and
// the light bar goes out; the back door opens and it comes out of it in the officer's cap, stands still looking at you a
// second or more, and comes at you: caught, and the night lost with its own line. calm: with reduced flashing, the light
// bar swells slowly from red to blue and back, and never flashes
const cop = (k, coin, calm) => `(() => {
  const L = G.L, s = L.s, c = L.creature, S = SAVE.data.settings, keep = [S.reducedFlash, SAVE.unlock];
  let unlocked = false; SAVE.unlock = () => { unlocked = true; }; S.reducedFlash = ${!!calm};
  c.lane = L.lanes[${k}]; L.lane = c.lane; L.laneIdx = ${k}; s.man = null; update(0.001);
  s.man.t0 = L.t - 0.6 * s.man.arrive; update(0.01);
  const T = id => L.targets.find(t => t.id === id), heard = [], sfx0 = AUDIO.sfx;
  AUDIO.sfx = (n, ...a) => { heard.push([n, L.aftermathT, !!s.cop]); return sfx0(n, ...a); };
  T('receiver').onClick();
  if (${!!coin}) T('slot').use();
  for (const d of '911') T('key' + d).onClick();
  const out = { dialled: s.dialed === '911' && s.line === 'calling911' && !!s.credit === ${!!coin}, answeredIn: -1, won: false, maxRoll: 0, atCar: 99, gone: false, hatIn: false,
    hatOut: false, nearDoor: 99, still: 0, lookRush: 1, red: 0, blue: 0, litAfter: 0, jump: 0, sirens: 0, sirenAfter: 0, minDist: 99 };
  const t0 = L.t; let lastLv = null, last = null;
  for (let i = 0; i < 4000 && G.state === 'play'; i++) {
    update(0.01);
    if (L.won) out.won = true;
    const K = s.cop; if (!K) continue;
    if (out.answeredIn < 0) out.answeredIn = +(L.t - t0).toFixed(2);
    const t = L.aftermathT, p = c.pos(), e = s.end;
    out.police = e && e.cop; out.minDist = Math.min(out.minDist, Math.hypot(p.x, p.z));
    const g = L.glows(), lv = [g.find(q => q.color[0] === 255 && q.color[1] === 60), g.find(q => q.color[0] === 90 && q.color[2] === 255)].map(q => (q ? q.a : 0));   // the light bar's red end and blue end
    if (e.pose && t > e.tStop - 1 && (K.shortAt === undefined || t < K.shortAt)) { out.red = Math.max(out.red, lv[0]); out.blue = Math.max(out.blue, lv[1]); if (lastLv) out.jump = Math.max(out.jump, Math.abs(lv[0] - lastLv[0]), Math.abs(lv[1] - lastLv[1])); }
    lastLv = e.pose && t > e.tStop - 1 ? lv : null;
    if (K.shortAt !== undefined && t > K.shortAt + 1.15) out.litAfter = Math.max(out.litAfter, lv[0], lv[1], L.dynamicLights().filter(q => q.color[2] === 40 || q.color[0] === 70).length);
    if (K.go && t >= K.leapT - 0.3 && t < K.leapT) out.atCar = Math.min(out.atCar, Math.hypot(p.x - e.pose.x, p.z - e.pose.z));
    if (K.gone) { out.gone = true; if (c.copHat) out.hatIn = true; }
    out.maxRoll = Math.max(out.maxRoll, Math.abs(K.rk.roll));
    if (K.lookT !== undefined && t > K.emergeT + 0.6 && t < K.chargeT) { out.hatOut = c.copHat && !K.gone; out.nearDoor = Math.min(out.nearDoor, Math.hypot(p.x - e.pose.x, p.z - e.pose.z)); }
    if (K.lookT !== undefined && t > K.lookT && t < K.chargeT) { if (last && Math.hypot(p.x - last.x, p.z - last.z) < 1e-6) out.still += 0.01; out.lookRush = Math.min(out.lookRush, c.rush); out.looked = K.looked && c.t - c.lookT < 2; }
    if (e.doorT !== undefined && out.doorAt === undefined) out.doorAt = +(t - K.shortAt).toFixed(2);
    last = p;
  }
  out.dying = G.state === 'dying' && G.deathCause === 'police' && G.deathCreature === c && !!c.copHat;
  for (let i = 0; i < 400 && G.state === 'dying'; i++) update(0.01);
  out.dead = G.state === 'dead' && /wearing the cap/.test(G.deathScreen.text) && !L.won && !unlocked;
  const K = s.cop || {};
  out.sirens = heard.filter(h => h[0] === 'siren').length; out.sirenAfter = heard.filter(h => h[0] === 'siren' && h[1] > K.shortAt).length;
  out.cut = heard.some(h => h[0] === 'sirenDie' && Math.abs(h[1] - K.shortAt) < 0.05); out.thumps = heard.filter(h => h[0] === 'carThump').length;
  out.dispatch = heard.some(h => h[0] === 'dispatch'); out.horn = heard.some(h => h[0] === 'horn');
  out.door = heard.some(h => h[0] === 'carDoor');
  for (const k of ['red', 'blue', 'jump', 'maxRoll', 'atCar', 'nearDoor', 'still', 'minDist']) out[k] = +out[k].toFixed(3);
  AUDIO.sfx = sfx0; S.reducedFlash = keep[0]; SAVE.unlock = keep[1];
  return out;
})()`;
const copCases = [[0, false, false], [1, true, false], [1, false, true]].flatMap(([k, coin, calm]) => {
  const at = 'street ' + k + (coin ? ', with the coin in' : ', no coin') + (calm ? ', reduced flashing' : '') + ': ';
  return [
    ['eval', 'restartLevel()'], ['wait', 300],
    ['eval', 'window.__cop = ' + cop(k, coin, calm)],
    ['expect', '__cop.dialled && __cop.dispatch && __cop.answeredIn > 2 && __cop.answeredIn < 3.5 && __cop.police && !__cop.horn', at + '9-1-1 calls, and a dispatcher answers at once; then the police car comes (and does not sound its horn)'],
    ['expect', calm ? '__cop.red > 0.15 && __cop.blue > 0.15 && __cop.jump < 0.02' : '__cop.red > 0.5 && __cop.blue > 0.5 && __cop.jump > 0.3', at + (calm ? 'its light bar swells slowly from red to blue, never flashing' : 'its light bar flashes red and blue')],
    ['expect', '__cop.sirens >= 4 && __cop.atCar < 2.6 && __cop.gone && !__cop.hatIn', at + 'it wails as it comes; it goes to the car and in at a window, and is gone'],
    ['expect', '__cop.maxRoll > 0.01 && __cop.thumps >= 5 && __cop.cut && __cop.sirenAfter === 0 && __cop.litAfter === 0', at + 'the car rocks and thumps; the siren dies with a crackle at the end of a wail and the light bar goes out for good'],
    ['expect', '__cop.door && __cop.doorAt > 1.5 && __cop.hatOut && __cop.nearDoor < 3.2 && __cop.still >= 0.9 && __cop.lookRush === 0 && __cop.looked', at + 'the door opens, and it comes out in the officer\'s cap and stands looking at you'],
    ['expect', '__cop.dying && __cop.dead && !__cop.won && __cop.minDist < 1.8', at + 'it comes at you, cap and all: caught, the night lost with its own line'],
  ];
});
// the instruction card's printing, drawn large on a canvas of its own (1 px a tenth of a mm): every letter of it inside the
// card, clear of its edges by most of the margin, and the heading inside the red band. Returns where the ink reaches (mm in
// from each edge)
const cardInk = `(() => {
  const A = G.L.cardArt, k = 10000, Wc = Math.round(A.w * k), Hc = Math.round(A.h * k), pad = 200;
  const cv = document.createElement('canvas'); cv.width = Wc + 2 * pad; cv.height = Hc + 2 * pad; const g = cv.getContext('2d');
  g.translate(pad + Wc / 2, pad + Hc); g.scale(k, -k);   // (the card's own units: metres, its foot in the middle, y up)
  A.draw(g, { col: c => 'rgb(' + c.join(',') + ')' });
  const d = g.getImageData(0, 0, cv.width, cv.height).data;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, h0 = 1e9, h1 = -1e9;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
    const i = (y * cv.width + x) * 4; if (d[i + 3] <= 40) continue;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    if (d[i] > 200 && d[i + 1] > 190) { h0 = Math.min(h0, y); h1 = Math.max(h1, y); }   // the heading: printed pale (on the red band)
  }
  const mm = v => +(v / 10).toFixed(1);
  return { left: mm(x0 - pad), right: mm(pad + Wc - x1), top: mm(y0 - pad), bottom: mm(pad + Hc - y1), headTop: mm(h0 - pad), headLow: mm(h1 - pad) };
})()`;
module.exports = {
  nightmare: [
    ['expect', '(r => r.left >= 4 && r.right >= 4 && r.top >= 2 && r.bottom >= 2 && r.headTop >= 2 && r.headLow <= 21 - 2)(' + cardInk + ')', 'the instruction card: all its printing inside the card, clear of its edges, the heading inside the red band'],
    ['expect', 'G.inv.length === 0', 'nothing in hand: the notebook is lying on the shelf'],
    ['expect', "!G.L.items.some(i => i.id === 'journal') && !G.L.targets.some(t => t.id === 'book') && G.L.targets.some(t => t.id === 'notebook') && !document.querySelector('.pb-nb')", 'only the notebook is on the shelf: no phone book, and no panel over the view'],
    ['expect', 'G.L.s.others.length >= 4', 'there are always a few ordinary numbers in the notebook'],
    ['expect', 'G.L.lanes.every(l => l.deg !== 270)', 'nothing comes from the west'],
    // the rain: seen only out through the glass (two panes a side, the rail between), never inside the booth, and never
    // over the pay phone: facing it, the middle of its keys is inside what covers the glass, and no pane is left uncut there
    ['expect', "(sh => WEATHER.kind === 'rain' && sh.openings.length === 8 && sh.hides(0.3, 1.5, 0.3) && sh.hides(-0.5, 0.2, -0.5) && !sh.hides(0.3, 1.5, 3) && !sh.hides(4, 1, 0.2))(G.L.weatherShelter())", 'the rain is seen through the eight panes of glass, and none of it falls inside the booth'],
    ['face', 1, false],
    ['expect', "(() => { const sh = G.L.weatherShelter(), q = R.screenPos(0.38, 1.6, 0.38); if (!q) return false; const inP = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }; return sh.covers.map(R.screenPoly).some(p => p && inP(q.x, q.y, p)); })()", 'facing the phone, its keys are covered: no rain is drawn over the phone'],
    ['expect', '!(G.L.dynamicLights() || []).length && !G.L.glows().some(g => g.color[0] === 255 && g.color[1] === 190)', 'it brings no light with it: no lantern, no glow'],
    // its way in: from lamp to lamp along its own street, every one of them from the last, fitted to the time it has
    ['expect', 'G.L.s.man && G.L.s.man.stops.length >= 6 && G.L.s.man.stops.every(st => st.lamp && st.lamp.street === (G.L.creature.lane.deg === 0 ? 0 : 1))', 'its way in goes by every lamp along its own street'],
    ['expect', 'G.L.s.man.stops[0].d > 90 && G.L.s.man.stops.every((st, i, a) => !i || st.d < a[i - 1].d) && Math.abs(G.L.creature.D0 - G.L.s.man.stops[0].d) < 0.01', 'it starts at the very last lamp down its street, and comes in lamp by lamp'],
    ['expect', "G.L.s.man.seg.kind === 'stop' && Math.abs(G.L.creature.dist - G.L.s.man.stops[0].d) < 0.01 && " + lamp0 + '.light.i > 0.5 && G.L.creature.lit > 0.1 && G.L.creature.lampLit > 0.9', 'it starts behind that lamp, lit by it (only its eyes showing)'],
    ['expect', 'Math.abs(G.L.s.man.arrive - G.L.creature.T) < 0.5 && G.L.s.man.wait >= 1.2 && G.L.s.man.wait <= 5', 'it gets to the glass when its steady walk would have, quick about each lamp'],
    ['face', 1, false],
    ['expect', plain(0) + ' && ' + periphery, 'facing the phone the view is as it always is, and it is at its edge, not behind the phone'],
    watch('reach', 'G.L.creature.reach > 0.9 && G.L.creature.reachTo && G.L.creature.reachTo.y > 3.5 && ' + lamp0 + '.outAt === undefined'),
    watch('break', lamp0 + '.outAt !== undefined && G.L.s.lampsOut === 1 && G.L.s.sparks.length > 10'),
    watch('rush', 'G.L.creature.rush > 0.6 && G.L.creature.dark && G.L.creature.moving && G.L.creature.lampLit === 0'),
    watch('next', "G.L.s.man.seg.kind === 'stop' && G.L.s.man.seg.st === G.L.s.man.stops[1] && " + periphery),
    ['face', 1, true],
    ['expect', '!G.L.s.nbOpen && ' + plain('PITCH_DOWN'), 'looking down at it, it lies shut and the view is as it always is'],
    watch('open', "G.L.s.nbAnims.some(a => a.item === 'cover') && G.L.s.nbOpen"),
    ['click', 'notebook'],
    ...saw('open', 'clicked, its cover is lifted and goes back over the spiral'),
    ['waitUntil', settled, 3000],
    ['wait', 300],
    ['expect', 'G.L.s.nbOpen && G.L.s.page === 0 && ' + plain('PITCH_DOWN') + ' && ' + inView, 'it lies open on the shelf, all of it in view, and nothing is done to the view'],
    ['expect', '!' + visible('.pb-nb'), 'there is no panel: it is read where it lies'],
    // its pages turn with a click, or a tap on it, or with A on a gamepad (whatever is nearest the middle of the view)
    watch('flip', "G.L.s.nbAnims.some(a => typeof a.item === 'number')"),
    ['click', 'notebook'],
    ...saw('flip', 'clicked again, the page is lifted by its corner and goes over the spiral'),
    ['waitUntil', settled, 3000],
    ['expect', 'G.L.s.page === 1 && ' + plain('PITCH_DOWN'), 'and the next page lies open, the view still as it was'],
    ['eval', "(() => { const h = [...R.hits].reverse().find(h => h.kind === 'target' && h.ref.id === 'notebook'), x = h.x + h.w / 2, y = h.y + h.h / 2; for (const type of ['touchstart', 'touchend']) { const t = new Touch({ identifier: 5, target: UI.canvas, clientX: x, clientY: y }); UI.canvas.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchstart' ? [t] : [], changedTouches: [t] })); } })()"],
    ['waitUntil', settled, 3000],
    ['expect', 'G.L.s.page === 2', 'a tap on it (a finger) turns the page too'],
    padOn, ...tap(0), padOff,
    ['waitUntil', settled, 3000],
    ['expect', 'G.L.s.page === 3', 'and so does A'],
    // it has been at its first lamp all this while: it reached up to it and broke it, and skittered on in the dark to the next
    ...saw('reach', 'it reached up to its lamp, its arm far too long', 8000),
    ...saw('break', 'and broke it: it popped, and glass and sparks came down'),
    ['wait', 700],
    ['expect', lamp0 + '.light.i === 0 && !G.L.glows().includes(' + lamp0 + '.glow) && ' + lamp0 + '.refl.every(q => q.alpha === 0)', 'it is out for good: no light, no glow, no streak on the road'],
    ...saw('rush', 'it skittered on in the dark, its face gone'),
    // on to the page with the number (round again past the last page, which shuts it, if it was passed)
    clickNbUntil('G.L.s.nbOpen && G.L.s.page === G.L.s.keyPage'),
    ['waitUntil', 'G.L.s.bloodDrawn', 3000],
    // read with the player's own zoom: big, and all of it still in view
    ['eval', 'G.cam.zoomHeld = true'],
    ['wait', 700],
    ['eval', "window.__num = G.L.s.pages[G.L.s.page][0].replace(/^%/, '').replace('-', ''); window.__red = " + redShare],
    ['expect', 'G.cam.zoom > 2.4 && G.L.s.nbRect.w > 230 && G.L.s.nbRect.h > 160 && ' + inView, 'with the zoom held, the page lying open is big in the view, and all of it is in it'],
    ['eval', 'G.cam.zoomHeld = false'],
    ['expect', 'window.__num === G.L.s.number && G.L.s.keyPage > 0', 'the number scrawled in red is the one, and it is not on the first page'],
    ['expect', "G.L.s.pages[G.L.s.keyPage].length === 1 && G.L.s.pages[G.L.s.keyPage][0][0] === '%' && window.__red > 0.04", 'it has the page to itself, written large across it in red'],
    ['expect', "G.L.s.pages.filter(p => p.some(l => l[0] === '%')).length === 1 && G.L.s.pages.every((p, i) => i === G.L.s.keyPage || !p.join(' ').includes(G.L.s.numberText))", 'no other page is scrawled in red, and the number is written nowhere else'],
    ...saw('next', 'it came to the next lamp, at the edge of the view from the phone', 8000),
    // turned away, it is still open where it lies
    ['face', 4, false],
    ['wait', 300],
    ['expect', 'G.L.s.nbOpen && G.L.s.page === G.L.s.keyPage && ' + plain(0), 'turned away, it stays open where it lies'],
    ['pickup', 'coin'],
    ['expect', "G.hasItem('coin')", 'the coin is in hand'],
    ['face', 1, true],
    ['wait', 300],
    ['expect', 'G.L.s.nbOpen && G.L.s.page === G.L.s.keyPage && ' + plain('PITCH_DOWN'), 'looking down at it again it lies open at the same page'],
    // on to the last page, and a click on it shuts it
    clickNbUntil('G.L.s.page === G.L.s.pages.length - 1'),
    watch('shut', "G.L.s.nbAnims.some(a => a.item === 'block')"),
    ['click', 'notebook'],
    ...saw('shut', 'a click on the last page brings the lot back down over it'),
    ['waitUntil', settled + ' && !G.L.s.nbOpen', 3000],
    ['expect', '!G.L.s.nbOpen && G.L.s.page === 0', 'it lies shut again'],
    ['waitUntil', "G.hand.cur && G.hand.cur.id === 'coin'", 2000],
    ['expect', "G.hand.cur && G.hand.cur.id === 'coin'", 'and the coin is up in your hand'],
    ['face', 1, false],
    ['wait', 700],
    ['expect', plain(0), 'facing the phone the view stays as it is: no close-up'],
    watch('finger', "G.hand.reach && G.hand.reach.target.id === 'key5' && G.L.s.keyHit['5'] !== undefined && (!G.hand.cur || G.hand.up < 0.1)"),
    ['click', 'key5'],
    ['expect', "/on its hook/.test(G.lastToast.msg) && G.L.s.dialed === ''", 'a key does nothing with the receiver on its hook'],
    ...saw('finger', 'your fingertip goes to the key and the key goes down as it gets there, the coin you hold lowered meanwhile'),
    ['waitUntil', "!G.hand.reach && G.hand.cur && G.hand.cur.id === 'coin' && G.hand.up > 0.9", 3000],
    ['expect', "!G.L.s.lands.length && G.hand.cur && G.hand.cur.id === 'coin'", 'and the coin comes back up into your hand'],
    ['click', 'receiver'],
    ['expect', "G.L.s.hook === 'off' && G.L.s.line === 'tone'", 'the receiver is lifted: a dial tone'],
    ['waitUntil', "G.hand.off.cur && G.hand.off.cur.id === 'handset' && G.hand.off.up > 0.9", 2000],
    ['expect', "G.hand.off.cur && G.hand.off.cur.id === 'handset' && G.hand.cur && G.hand.cur.id === 'coin'", 'it is in your left hand, the coin still in your right'],
    watch('blink', "G.L.s.blinkAt > 0 && G.L.t - G.L.s.blinkAt < 0.6"),
    ['click', 'key5'],
    ['expect', "/No credit/.test(G.lastToast.msg) && G.L.s.dialed === '' && G.L.s.keyT['5'] !== undefined", 'without a coin the key goes down and nothing is dialled'],
    ...saw('blink', 'the display blinks its credit at you'),
    ['click', 'slot'],
    ['expect', "G.L.s.credit > 0 && !G.hasItem('coin')", 'the coin goes in the slot'],
    ['click', 'return'],
    ['expect', "/Empty/.test(G.lastToast.msg) && G.hand.reach && G.hand.reach.target.id === 'return'", 'the hand feels in the coin return: nothing there'],
    ['waitUntil', '!G.hand.reach', 2000],
    ['waitUntil', "!document.getElementById('toast').classList.contains('show') || !/No credit/.test(document.getElementById('toast').textContent)", 1000],
    ['expect', clickKeys('G.L.s.others[0]'), 'the keys of an ordinary number are clicked on the phone'],
    ['expect', 'G.L.s.dialed === G.L.s.others[0]', 'the display has the number dialled'],
    ['waitUntil', "G.L.s.line === 'dead'", 3000],
    ['expect', "/not in service/.test(G.lastToast.msg) && !G.L.won", 'an ordinary number is not in service'],
    watch('clink', 'G.L.s.coinClink && ' + inCup),
    ['click', 'receiver'],
    ['expect', "G.L.s.hook === 'on' && G.L.s.credit === 0", 'hung up on the hook'],
    ['waitUntil', "!G.hand.off.cur && G.L.t - G.L.s.handsetT > 0.45", 2000],
    ['expect', '!G.hand.off.cur && G.hand.off.up === 0', 'the receiver goes back on its hook from your left hand'],
    ...saw('clink', 'the coin drops down into the cup with a clink'),
    ['waitUntil', inCup, 2000],
    ['pickup', 'coin'],
    ['expect', "G.hasItem('coin')", 'the coin came back into the coin return, and is taken out of it'],
    watch('inslot', "G.fumbling && G.fumbling.it.id === 'coin' && G.fumbling.target.id === 'slot' && G.fumbling.phase === 'contact'"),
    ['click', 'slot'],
    ['expect', "/drops straight through/.test(G.lastToast.msg) && G.L.s.credit === 0", 'a coin put in with the receiver on its hook drops straight through'],
    ...saw('inslot', 'the coin goes from your fingers into the slot'),
    ['waitUntil', inCup, 2000],
    ['expect', inCup + " && !G.hasItem('coin') && G.L.s.credit === 0 && !G.fumbling", 'and comes out in the coin return'],
    ['pickup', 'coin'],
    ['click', 'receiver'],
    ['click', 'slot'],
    ['expect', "G.L.s.hook === 'off' && G.L.s.line === 'tone' && G.L.s.credit > 0", 'the receiver lifted, then the coin in: ready to dial'],
    // with the zoom held the phone's keys are clicked as ever (the star: a beep, no digit)
    ['eval', 'G.cam.zoomHeld = true'],
    ['wait', 600],
    ['eval', "window.__starT = G.L.s.keyT['*']"],
    ['click', 'keystar'],
    ['expect', "G.cam.zoom > 2.4 && G.L.s.keyT['*'] !== window.__starT && G.L.s.dialed === ''", 'with the zoom held, a key is clicked where it is drawn'],
    ['eval', 'G.cam.zoomHeld = false'],
    ['wait', 500],
    // a gamepad: down, down, left goes from the middle of the keypad to the star key, A presses it (a beep, no digit); left
    // again, with no key further that way, turns the view
    padOn,
    ...tap(13), ...tap(13), ...tap(14),
    ['expect', "G.L.s.padSel && G.L.s.padSel.t.id === 'keystar' && G.cam.dirIdx === 1", 'the d-pad moves a highlight over the keys instead of turning'],
    ...tap(0),
    ['expect', "G.L.s.keyT['*'] !== undefined && G.L.t - G.L.s.keyT['*'] < 1 && G.L.s.dialed === ''", 'A presses the highlighted key'],
    ...tap(14),
    ['expect', 'G.cam.dirIdx === 0 && !G.L.s.padSel', 'past the last key that way the d-pad turns'],
    padOff,
    ['face', 1, false],
    ['wait', 500],
    ['eval', "for (const d of window.__num) document.body.dispatchEvent(new KeyboardEvent('keydown', { key: d, bubbles: true })); window.__dialT = G.L.t; window.__dialMs = Date.now(); window.__landAt = G.L.s.lands.map(l => l.at)"],
    ['expect', 'G.L.s.dialed === window.__num && G.inv.length === 0', 'the number keys dialled it'],
    ['expect', 'window.__landAt.length === 7 && window.__landAt.every((t, i, a) => !i || t - a[i - 1] > 0.08)', 'typed faster than the finger can go, it presses the keys in turn, one after another'],
    ['waitUntil', "!G.L.s.lands.length && G.L.s.lagN === 0", 3000],
    ['waitUntil', "G.L.s.line === 'ringing'", 3000],
    ['wait', 3000],
    ['expect', "G.L.s.line === 'ringing' && !G.L.won && G.state === 'play'", 'still ringing three seconds on, and it is still coming'],
    ['waitUntil', 'G.L.won', 8000],
    ['expect', 'G.L.s.answeredAt - window.__dialT >= 7 && Date.now() - window.__dialMs >= 6900', 'it rang for seven seconds after the last digit before anyone picked up'],
    ['expect', 'G.L.s.lampsOut >= 2', 'by then it had broken more than one lamp'],
    ['waitUntil', 'G.L.s.end && G.L.s.end.pose && G.L.s.end.doorT !== undefined', 8000],
    ['expect', "G.L.s.end.doorT >= G.L.s.end.tStop && G.state === 'won'", 'a car comes, pulls up and opens its door before the fade'],
    ['waitUntil', 'G.L.aftermathT > G.L.s.end.doorT + 0.6', 3000],
    ['expect', 'Math.abs(wrapPi(G.L.s.end.doorYaw - G.cam.yaw)) < 35 * DEG && Math.abs(wrapPi(G.L.s.end.doorYaw - 45 * DEG)) > 16 * DEG', 'the open door is in view, and not behind the pay phone'],
    ['waitUntil', 'G.L.creature.away', 4000],
    ['expect', '!G.L.s.cop && !G.L.s.end.cop', 'the right number brings the ordinary car: nothing of the police'],
    // a 9 pressed with no coin in is taken (911 is free) and the next key that is not the rest of it wipes it, as does a coin
    ['eval', 'restartLevel()'], ['wait', 300],
    ['expect', "(() => { const L = G.L, s = L.s, T = id => L.targets.find(t => t.id === id); T('receiver').onClick(); T('key9').onClick(); const a = s.dialed === '9'; T('key5').onClick(); const b = s.dialed === '' && s.line === 'tone' && s.deadKeys === 1; T('key9').onClick(); T('key1').onClick(); T('slot').use(); const c = s.dialed === '' && s.credit > 0; for (const d of s.number) T('key' + d).onClick(); return a && b && c && s.line === 'connecting' && !s.cop; })()", 'with no coin, a 9 is taken and a 5 after it wipes it; a coin wipes a 9-1 too; and the number dialled after rings as ever'],
    ...copCases,
    ...doorCases,
    ...fleeCases,
  ],
};
