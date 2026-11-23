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
// 911. From the phone, lifted, 9-1-1 on its keys (with no coin, an emergency call is free; or with the coin in), stepped by
// hand. A dispatcher answers (the night's easter egg, kept in the save from that moment) and has three lines, one after
// another, each a crackle and its words: "911, what is your emergency?", "a WHAT?", "Ok, stay there. I'm sending a unit
// now."; with the last the police are sent, but nothing of them is seen or heard until it has got to the last
// lamp on its way in (called while it is skittering between lamps further out; or, past: called once it has left the last
// lamp, when she says only the last line, they come at once and it skitters back behind that post). Then the police car comes down its street, its light
// bar going and its siren wailing; screeches to a halt on the road by that post (its nose dipping); its siren winds down;
// a flashlight comes on at its window and finds it; from the instant that light is on it, it convulses for a second, with a shriek (where it
// stands, the flashlight on it; no tentacles drawn before, the first of them as it convulses); it jumps out in front of
// the post, facing the car, its head split open at it and its tentacles out, with a snarl, the growl far up (the lamp
// over it out by then, popped as it snarls if it still burned); the flashlight goes off; the car
// spins its tyres (smoke) and fishtails off down the road, faster and faster, until it is out of sight; and it shuts its
// head and comes on for you from there. All the while the car keeps to the road (every corner and side of it) and is
// never on a parked car or on the shade. Caught (its tentacles out as it comes at you), the screen says "Nice try" and
// "The police can't help you here."
// calm: reduced flashing and reduced motion: the flashlight and the light bar come up and go smoothly, it does not leap
// off the ground, and the car swerves less
const copGeom = `
  const box = (P, a, b) => [[a, b], [a, -b], [-a, -b], [-a, b]].map(([u, v]) => [P.x + u * P.fx - v * P.fz, P.z + u * P.fz + v * P.fx]);
  const sep = (A, B) => [A, B].some(Pg => Pg.some((p, i) => { const q = Pg[(i + 1) % Pg.length], nx = q[1] - p[1], nz = p[0] - q[0];
    const pa = A.map(v => v[0] * nx + v[1] * nz), pb = B.map(v => v[0] * nx + v[1] * nz); return Math.max(...pa) <= Math.min(...pb) || Math.max(...pb) <= Math.min(...pa); }));
  const onRoad = (x, z) => (z > 0.999 && z < 8.001) || (z >= 8 && Math.abs(x) < 3.501);
  const parked = G.L.s.parked.map(r => [[r.x0, r.z0], [r.x1, r.z0], [r.x1, r.z1], [r.x0, r.z1]]);
  // the car as it stands: every corner and the middle of every side on the road, and clear of every parked car
  const carOk = P => { const e = box(P, 2.27, 0.905), pts = e.concat(e.map((p, i) => [(p[0] + e[(i + 1) % 4][0]) / 2, (p[1] + e[(i + 1) % 4][1]) / 2])); return { road: pts.every(p => onRoad(p[0], p[1])), parked: parked.every(r => sep(e, r)) }; };
  const yaw = (x, z) => Math.atan2(x, z);`;
const cop = (k, coin, calm, past) => `(() => {
  const L = G.L, s = L.s, c = L.creature, S = SAVE.data.settings, keep = [S.reducedFlash, S.reducedMotion, SAVE.unlock];
  let unlocked = false; SAVE.unlock = () => { unlocked = true; }; S.reducedFlash = S.reducedMotion = ${!!calm};
  ${copGeom}
  c.lane = L.lanes[${k}]; L.lane = c.lane; L.laneIdx = ${k}; s.man = null; update(0.001);
  const segs = s.man.segs, walk = segs.findIndex(g => g.kind === 'walk'), lamp = s.man.stops[s.man.stops.length - 1].lamp;
  const at = ${!!past} ? segs[walk].t0 + 0.4 : (g => g.t0 + 0.4 * (g.t1 - g.t0))(segs.filter(g => g.kind === 'rush')[2]);
  s.man.t0 = L.t - at + 2.7; update(0.01);
  const T = id => L.targets.find(t => t.id === id), heard = [], sfx0 = AUDIO.sfx, said = [], toast0 = G.toast;
  AUDIO.sfx = (n, ...a) => { heard.push([n, +L.t.toFixed(2)]); return sfx0(n, ...a); };
  G.toast = (msg, ...a) => { said.push([msg, +L.t.toFixed(2)]); return toast0.call(G, msg, ...a); };
  // (the shade as it is drawn now, the view turned to it: how many tentacles it drew)
  const tentNow = () => { const q = c.pos(); G.cam.yaw = G.cam.tYaw = Math.atan2(q.x, q.z); c.tentacles = -1; render(); return c.tentacles; };
  delete SAVE.data.eggs.booth;
  T('receiver').onClick();
  if (${!!coin}) T('slot').use();
  for (const d of '911') T('key' + d).onClick();
  const out = { dialled: s.dialed === '911' && s.line === 'calling911' && !!s.credit === ${!!coin}, answeredIn: -1, sentIn: -1, eggBefore: SAVE.data.eggs.booth === true, egg: false, waitFrames: 0, waitSeen: false, atLast: false, back: false,
    offRoad: 0, onParked: 0, nearParked: 99, minSep: 99, maxDip: 0, haltPost: 99, aimErr: 99, torchJump: 0, front: false, facing: false, lampOut: false,
    maxV: 0, fish: 0, smoke: 0, maxHop: 0, comeOn: 0, farthest: 0, red: 0, blue: 0, barJump: 0, ev: {},
    convFor: 0, convLit: true, convMoved: 0, convScare: 0, tentStill: -1, tentConv: -1, tentScare: -1, tentLunge: -1, tentAfter: -1 };
  const ev = out.ev, mark = (key, cond) => { if (cond && ev[key] === undefined) ev[key] = +L.t.toFixed(2); };
  const t0 = L.t; let last = null, lastTorch = 0, lastLv = null, resumeD = 0, convAt = null;
  for (let i = 0; i < 12000 && G.state === 'play'; i++) {
    update(0.01);
    if (out.answeredIn < 0 && s.line === 'emergency') { out.answeredIn = +(L.t - t0).toFixed(2); out.egg = SAVE.data.eggs.booth === true; out.sentAtAnswer = !!s.cop; }
    const K = s.cop, p = c.pos(); if (!K) continue;
    if (out.sentIn < 0) out.sentIn = +(L.t - t0).toFixed(2);
    if (K.phase === 'wait') { out.waitFrames++; if (K.pose || heard.some(h => h[0] === 'siren')) out.waitSeen = true; continue; }
    if (ev.come === undefined) { out.atLast = segs.indexOf(s.man.seg) >= walk - 1 || !!K.back; out.back = !!K.back; }
    mark('come', true);
    const P = K.pose;
    if (P) {
      const ok = carOk(P); if (!ok.road) out.offRoad++; if (!ok.parked) out.onParked++;
      for (const r of s.parked) out.nearParked = Math.min(out.nearParked, Math.hypot(P.x - (r.x0 + r.x1) / 2, P.z - (r.z0 + r.z1) / 2));
      const dx = p.x - P.x, dz = p.z - P.z, a = dx * P.fx + dz * P.fz, b = Math.abs(-dx * P.fz + dz * P.fx);
      out.minSep = Math.min(out.minSep, Math.hypot(Math.max(0, Math.abs(a) - 2.27), Math.max(0, b - 0.905)) - 0.35);
      out.maxDip = Math.max(out.maxDip, P.dip || 0);
      if (K.phase === 'flee' && last) {
        const vx = (P.x - last.x) / 0.01, vz = (P.z - last.z) / 0.01, v = Math.hypot(vx, vz);
        out.maxV = Math.max(out.maxV, v);
        if (v > 3) out.fish = Math.max(out.fish, Math.acos(clamp((vx * P.fx + vz * P.fz) / v, -1, 1)) / DEG);   // pointing off the way it is going: its tail out
        out.farthest = Math.max(out.farthest, Math.hypot(P.x, P.z));
      }
      const g = L.glows(), lv = [g.find(q => q.color[0] === 255 && q.color[1] === 60), g.find(q => q.color[0] === 90 && q.color[2] === 255)].map(q => (q ? q.a : 0));   // the light bar's red end and blue end
      if (K.fade > 0.99) { out.red = Math.max(out.red, lv[0]); out.blue = Math.max(out.blue, lv[1]); if (lastLv) out.barJump = Math.max(out.barJump, Math.abs(lv[0] - lastLv[0]), Math.abs(lv[1] - lastLv[1])); }
      lastLv = K.fade > 0.99 ? lv : null;
    }
    last = P;
    if (K.phase === 'halt' && ev.halt === undefined) out.haltPost = +Math.hypot(P.x - lamp.x, P.z - lamp.z).toFixed(2);
    mark('halt', K.phase === 'halt');
    mark('torch', K.torch > 0.9);
    out.torchJump = Math.max(out.torchJump, Math.abs(K.torch - lastTorch)); lastTorch = K.torch;
    const lt = (L.dynamicLights() || []).find(l => l.cone && l.color[0] === 225);   // the flashlight's light: at the shade's chest, once it has found it
    if (lt && K.t < K.scareT) { const h = [p.x - lt.x, p.y + c.yOff + 1.6 - lt.y, p.z - lt.z], hl = Math.hypot(...h); mark('lit', Math.acos(clamp((h[0] * lt.cone.x + h[1] * lt.cone.y + h[2] * lt.cone.z) / hl, -1, 1)) / DEG <= 16); }   // its beam on the shade (inside its cone)
    if (lt && K.torch > 0.9 && K.t > K.torchOnT + 0.6) { const h = [p.x - lt.x, p.y + c.yOff + 1.6 - lt.y, p.z - lt.z], hl = Math.hypot(...h); out.aimErr = Math.min(out.aimErr, Math.acos(clamp((h[0] * lt.cone.x + h[1] * lt.cone.y + h[2] * lt.cone.z) / hl, -1, 1)) / DEG); }
    // in the flashlight, before it jumps: convulsing, where it stands, the light on it; and what it draws of its tentacles
    if (K.torch > 0.5 && K.t > K.torchOnT && !c.convulse && out.tentStill < 0 && ev.scare === undefined) out.tentStill = tentNow();
    if (c.convulse > 0.05 && K.t < K.scareT) {
      out.convFor += 0.01; if (K.torch < 0.9) out.convLit = false; out.convScare = Math.max(out.convScare, c.scare);
      if (!convAt) convAt = { x: p.x, z: p.z }; out.convMoved = Math.max(out.convMoved, Math.hypot(p.x - convAt.x, p.z - convAt.z));
      if (out.tentConv < 0 && c.convulse > 0.99) out.tentConv = tentNow();
    }
    mark('conv', c.convulse > 0.05);
    if (c.scare > 0.9 && ev.scare === undefined) {
      out.tentScare = tentNow();
      const dPost = Math.hypot(lamp.x, lamp.z), dIt = Math.hypot(p.x, p.z);
      out.front = dIt < dPost - 0.2 && Math.abs(wrapPi(yaw(p.x, p.z) - yaw(lamp.x, lamp.z))) < 3 * DEG;   // in front of the post as you see it
      out.facing = c.scareSide === Math.sign(wrapPi(yaw(P.x, P.z) - yaw(p.x, p.z)));                         // turned to the car on the view
      out.lampOut = lamp.outAt !== undefined;
    }
    mark('scare', c.scare > 0.9);
    mark('torchOff', ev.scare !== undefined && K.torch < 0.5);
    mark('flee', K.phase === 'flee');
    out.smoke = Math.max(out.smoke, s.smoke.length); out.maxHop = Math.max(out.maxHop, c.hop || 0);
    if (K.manDone && ev.resume === undefined) { resumeD = c.dist; out.tentAfter = tentNow(); }
    mark('resume', K.manDone);
    if (ev.resume !== undefined) out.comeOn = Math.max(out.comeOn, resumeD - c.dist);
    mark('gone', K.gone);
  }
  out.playing = !L.won && !unlocked;
  out.dying = G.state === 'dying' && G.deathCause === 'police' && G.deathCreature === c;
  for (let i = 0; i < 400 && G.state === 'dying'; i++) { update(0.01); if (out.tentLunge < 0 && c.lunge > 0.7) out.tentLunge = tentNow(); }
  out.dead = G.state === 'dead' && G.deathScreen.text === 'The police can\\'t help you here.' && G.deathScreen.title === 'Nice try' && !L.won && !unlocked;
  const first = n => (heard.find(h => h[0] === n) || [])[1], count = n => heard.filter(h => h[0] === n).length;
  for (const n of ['dispatch', 'dispatchAsk', 'dispatchWhat', 'dispatchSend', 'tireScreech', 'sirenOff', 'shadeShriek', 'growlHigh', 'peelOut']) ev[n] = first(n);
  // what the dispatcher said, and when (from her answering), each with its crackle as it was said
  const LINES = ['"911, what is your emergency?"', '"a WHAT?"', '"Ok, stay there. I\\'m sending a unit now."'], answered = t0 + out.answeredIn;
  out.lines = said.filter(q => LINES.includes(q[0])).map(q => [LINES.indexOf(q[0]), +(q[1] - answered).toFixed(2)]);
  out.crackles = ['dispatchAsk', 'dispatchWhat', 'dispatchSend'].map(n => (first(n) === undefined ? -1 : +(first(n) - answered).toFixed(2)));
  out.once = ['dispatchAsk', 'dispatchWhat', 'dispatchSend'].map(count).join() + ' ' + [count('shadeShriek'), count('growlHigh'), count('dispatch')].join();
  out.sentAfter = +(out.sentIn - out.answeredIn).toFixed(2);
  out.sirens = heard.filter(h => h[0] === 'siren' && h[1] < ev.halt).length; out.sirenAfter = heard.filter(h => h[0] === 'siren' && h[1] >= ev.sirenOff).length;
  out.horn = heard.some(h => h[0] === 'horn' || h[0] === 'carDoor' || h[0] === 'brake');
  out.order = ['come', 'tireScreech', 'halt', 'sirenOff', 'torch', 'shadeShriek', 'conv', 'growlHigh', 'scare', 'torchOff', 'peelOut', 'flee', 'resume', 'gone'].every((n, j, a) => ev[n] !== undefined && (!j || ev[n] >= ev[a[j - 1]])) && ev.halt > ev.tireScreech && ev.torch > ev.sirenOff && ev.torchOff > ev.scare && ev.resume > ev.peelOut;
  out.shriekToSnarl = +(ev.growlHigh - ev.shadeShriek).toFixed(2);
  for (const n of ['minSep', 'nearParked', 'maxDip', 'aimErr', 'torchJump', 'maxV', 'fish', 'maxHop', 'comeOn', 'farthest', 'red', 'blue', 'barJump', 'convFor', 'convMoved', 'convScare']) out[n] = +out[n].toFixed(3);
  AUDIO.sfx = sfx0; G.toast = toast0; S.reducedFlash = keep[0]; S.reducedMotion = keep[1]; SAVE.unlock = keep[2]; SAVE.persist();   // (the egg found saved the settings as they were mid-run: saved again as they are)
  return out;
})()`;
const copCases = [[0, false, false, false], [1, true, false, false], [1, false, true, true], [0, true, true, true]].flatMap(([k, coin, calm, past]) => {
  const at = 'street ' + k + (coin ? ', with the coin in' : ', no coin') + (past ? ', called once it had left its last lamp' : ', called while it was far off') + (calm ? ', reduced flashing and motion' : '') + ': ';
  return [
    ['eval', 'restartLevel()'], ['wait', 300],
    ['eval', 'window.__cop = ' + cop(k, coin, calm, past)],
    ['expect', '__cop.dialled && __cop.answeredIn > 2 && __cop.answeredIn < 3.5', at + '9-1-1 calls, and a dispatcher answers at once'],
    ['expect', '!__cop.eggBefore && __cop.egg && SAVE.data.eggs.booth === true', at + 'the night\'s easter egg is kept in the save the moment the dispatcher answers (not before)'],
    past
      ? ['expect', "__cop.lines.length === 1 && __cop.lines[0][0] === 2 && Math.abs(__cop.lines[0][1]) < 0.02 && __cop.crackles[0] === -1 && __cop.crackles[1] === -1 && Math.abs(__cop.crackles[2]) < 0.02 && __cop.once === '0,0,1 1,1,0' && __cop.sentAtAnswer && Math.abs(__cop.sentAfter) < 0.02", at + 'the dispatcher says only "Ok, stay there. I\'m sending a unit now.", at once, and the police are sent with it']
      : ['expect', "(l => l.length === 3 && l.every((q, j) => q[0] === j) && Math.abs(l[0][1]) < 0.02 && l[1][1] - l[0][1] >= 1.6 && l[1][1] - l[0][1] <= 2.2 && l[2][1] - l[1][1] >= 1.6 && l[2][1] - l[1][1] <= 2.2)(__cop.lines) && __cop.crackles.every((t, j) => Math.abs(t - __cop.lines[j][1]) < 0.025) && __cop.once === '1,1,1 1,1,0' && !__cop.sentAtAnswer && Math.abs(__cop.sentAfter - __cop.lines[2][1]) < 0.025", at + 'the dispatcher\'s three lines, in order, each with its crackle, a beat between them: "911, what is your emergency?", "a WHAT?", "Ok, stay there. I\'m sending a unit now."; the police are sent with the last'],
    ['expect', past ? '__cop.back && __cop.atLast && __cop.waitFrames <= 1' : '__cop.waitFrames > 200 && !__cop.waitSeen && __cop.atLast && !__cop.back', at + (past ? 'the police come at once, and it skitters back behind its last lamp post' : 'nothing of the police is seen or heard until it has got to its last lamp')],
    ['expect', '__cop.order && __cop.sirens >= 2 && __cop.sirenAfter === 0 && !__cop.horn', at + 'in order: siren, tyres screeching, halted, siren off, flashlight on, its shriek as it convulses, its snarl and its head open at the car, flashlight off, the car away, it comes on, the car gone'],
    ['expect', '__cop.convFor > 0.85 && __cop.convFor < 1.2 && __cop.convLit && __cop.convMoved < 0.01 && __cop.convScare === 0 && __cop.ev.conv - __cop.ev.shadeShriek < 0.15', at + 'in the flashlight it convulses for about a second where it stands, with its shriek, before it jumps'],
    ['expect', '__cop.ev.lit >= __cop.ev.torch && __cop.ev.lit - __cop.ev.torch <= 0.55 && __cop.ev.shadeShriek - __cop.ev.lit >= 0 && __cop.ev.shadeShriek - __cop.ev.lit <= 0.03 && __cop.ev.conv - __cop.ev.lit <= 0.12', at + 'it starts to convulse (and shrieks) the instant the flashlight\'s beam is on it as it sweeps in: no wait after'],
    ['expect', '__cop.shriekToSnarl > 1.05 && __cop.shriekToSnarl < 1.3 && __cop.ev.scare - __cop.ev.growlHigh >= 0 && __cop.ev.scare - __cop.ev.growlHigh < 0.4', at + 'the jump scare\'s sound is the high growl (growlHigh), as its head opens: the shriek was the convulsion\'s'],
    ['expect', '__cop.tentStill === 0 && __cop.tentConv === 7 && __cop.tentScare === 7 && __cop.tentAfter === 0 && __cop.tentLunge === 17', at + 'its tentacles: none while it stands in the light, the first of them as it convulses, seven out at the police, drawn back in after, and seventeen as it comes at you'],
    ['expect', '__cop.haltPost < 4 && __cop.maxDip > 0.02 && __cop.aimErr < 10', at + 'the car halted by the lamp post, nose dipping, and its flashlight found it'],
    ['expect', '__cop.front && __cop.facing && __cop.lampOut', at + 'it jumped out in front of the post, turned to the car, the lamp over it out'],
    ['expect', '__cop.maxV > 15 && __cop.smoke > 5 && __cop.farthest > 80 && __cop.ev.gone !== undefined && (' + (calm ? '__cop.fish > 1 && __cop.fish < 12' : '__cop.fish > 8') + ')', at + 'the car spun its tyres, smoking, and fishtailed away down the road out of sight'],
    ['expect', '__cop.offRoad === 0 && __cop.onParked === 0 && __cop.minSep > 0.3' + (k === 1 ? ' && __cop.nearParked < 4' : ''), at + 'all the way the car kept to the road, never on a parked car' + (k === 1 ? ' (passing close by the one along the cross street)' : '') + ' or on it'],
    ['expect', calm ? '__cop.torchJump < 0.1 && __cop.barJump < 0.02 && __cop.maxHop === 0' : '__cop.torchJump > 0.5 && __cop.red > 0.5 && __cop.blue > 0.5 && __cop.barJump > 0.3 && __cop.maxHop > 0.15', at + (calm ? 'the flashlight and the light bar come and go smoothly, and it does not leap' : 'the light bar flashes red and blue, the flashlight snaps on, and it leaps out')],
    ['expect', '__cop.comeOn > 5 && __cop.playing && __cop.dying && __cop.dead', at + 'then it came on, and no help came: caught, the night lost with "Nice try" and "The police can\'t help you here."'],
  ];
});
// the right number answered while the police are there (the car halted by the post): the shade still sees them off and the
// police car goes, and only then does the car that comes for you come, and pull up and open its door, while it stands
// behind the post; the two cars are never on each other, nor on a parked car
const copWin = k => `(() => {
  const L = G.L, s = L.s, c = L.creature, save = [SAVE.recordWin, SAVE.unlock]; SAVE.recordWin = SAVE.unlock = () => {};
  ${copGeom}
  c.lane = L.lanes[${k}]; L.lane = c.lane; L.laneIdx = ${k}; s.man = null; update(0.001);
  const segs = s.man.segs, walk = segs.findIndex(g => g.kind === 'walk');
  s.man.t0 = L.t - segs[walk - 1].t0 + 2.7; update(0.01);
  const T = id => L.targets.find(t => t.id === id);
  T('receiver').onClick(); for (const d of '911') T('key' + d).onClick();
  const out = { halted: false, scared: false, endAt: -1, copGoneOrAway: false, overlap: 0, parked: 0, door: false, away: false };
  for (let i = 0; i < 3000 && G.state === 'play' && !(s.cop && s.cop.phase === 'halt'); i++) update(0.01);
  out.halted = !!s.cop && s.cop.phase === 'halt';
  win();
  for (let i = 0; i < 4000 && G.state === 'won' && !(s.end && L.aftermathT > s.end.done); i++) {
    update(0.01);
    const K = s.cop, e = s.end;
    if (c.scare > 0.9) out.scared = true;
    if (e && out.endAt < 0) { out.endAt = i; out.copGoneOrAway = !!K && K.manDone && (K.gone || K.sv >= 30); }
    if (e && e.pose && K && K.pose && !sep(box(e.pose, 2.27, 0.905), box(K.pose, 2.27, 0.905))) out.overlap++;
    if (e && e.pose && !carOk(e.pose).parked) out.parked++;
    if (e && e.doorT !== undefined) out.door = true;
    if (c.away) out.away = true;
  }
  SAVE.recordWin = save[0]; SAVE.unlock = save[1];
  return out;
})()`;
const copWinCases = [0, 1].flatMap(k => [
  ['eval', 'restartLevel()'], ['wait', 300],
  ['eval', 'window.__cwin = ' + copWin(k)],
  ['expect', '__cwin.halted && __cwin.scared && __cwin.endAt > 0 && __cwin.copGoneOrAway && __cwin.overlap === 0 && __cwin.parked === 0 && __cwin.door && __cwin.away', 'street ' + k + ': the right number answered while the police are there: it sees them off, they go, and then the car comes for you and opens its door, and it walks off'],
]);
// after 911, the phone is still a phone. Hung up on while she is still talking (after her first line), the dispatcher is
// cut off: nothing more of hers is said, and no car is sent (a coin put in comes back: the call was free); 911 dialled
// again, she starts over, and with her last line the police are sent; then keys do nothing while she is on the line;
// hung up on and called a third time, she says a car has been sent already, and no second police car comes; and the
// right number, dialled after, still brings the car. (Won while they were still waiting for it to get to its last lamp,
// the police never come at all.)
const copThenWin = `(() => {
  const L = G.L, s = L.s, c = L.creature, save = [SAVE.recordWin, SAVE.unlock]; SAVE.recordWin = SAVE.unlock = () => {};
  c.lane = L.lanes[0]; L.lane = c.lane; L.laneIdx = 0; s.man = null; update(0.001);
  s.man.t0 = L.t - 0.08 * s.man.arrive; update(0.01);
  const T = id => L.targets.find(t => t.id === id), step = (n, until) => { for (let i = 0; i < n && G.state === 'play' && !(until && until()); i++) update(0.01); };
  const out = {}, said = [], toast0 = G.toast;
  G.toast = (msg, ...a) => { said.push(msg); return toast0.call(G, msg, ...a); };
  const lines = () => said.filter(m => /^"/.test(m)).map(m => (/what is your emergency/.test(m) ? 1 : /a WHAT/.test(m) ? 2 : /sending a unit/.test(m) ? 3 : 0)).join('');
  T('receiver').onClick(); T('slot').use(); for (const d of '911') T('key' + d).onClick();
  step(400, () => s.line === 'emergency');
  step(60);   // (her first line said, the second not yet)
  out.first = lines() === '1' && !s.cop && s.called911 && !!s.talk;
  T('receiver').onClick(); out.hungUp = s.hook === 'on' && s.line === 'idle' && s.credit === 0 && s.returnAt > 0 && /You hang up/.test(G.lastToast.msg) && !s.talk;
  step(100);
  out.coinBack = !${coin}.taken && ${coin}.y > 1.2;
  step(260);
  out.cutOff = lines() === '1' && !s.cop;   // (well past when the rest would have been said: nothing more of hers, and no car sent)
  T('receiver').onClick(); for (const d of '911') T('key' + d).onClick();
  step(400, () => s.line === 'emergency'); step(500, () => !!s.cop);
  const first = s.cop; out.sent = !!first && s.called911 && lines() === '1123';
  T('key5').onClick(); out.keysHeld = s.dialed === '911' && /still on the line/i.test(G.lastToast.msg);
  T('receiver').onClick();
  T('receiver').onClick(); for (const d of '911') T('key' + d).onClick();
  step(400, () => s.line === 'emergency');
  out.again = s.cop === first && /already been sent/.test(G.lastToast.msg) && lines() === '1123' && !s.talk;
  T('receiver').onClick(); T('receiver').onClick(); T('slot').use();
  for (const d of s.number) T('key' + d).onClick();
  step(1500, () => L.won);
  out.won = L.won && G.state === 'won' && first.phase === 'wait' && !first.pose;
  for (let i = 0; i < 2500 && G.state === 'won' && !(s.end && s.end.doorT !== undefined); i++) update(0.01);
  out.car = !!(s.end && s.end.pose && s.end.doorT !== undefined && !s.end.cop) && !s.cop;   // (and the police never came)
  SAVE.recordWin = save[0]; SAVE.unlock = save[1]; G.toast = toast0;
  return out;
})()`;
// the shade's convulsion (js/creatures/signalman.js, jerk): each joint's value held and then snapped to the next, several
// times a second, with a shudder through it; with reduced motion a slow, small writhe and nothing sudden. Sampled every
// hundredth of a second over two seconds, for a few of its joints
const jerks = `(() => {
  const CR = CREATURES.signalman, run = still => { let lo = 9, hi = -9, jump = 0; for (const [seed, rate] of [[1, 7], [8, 10], [11, 6], [34, 11]]) { let last = null; for (let t = 3; t < 5; t += 0.01) { const v = CR.jerk(t, seed, rate, still); lo = Math.min(lo, v); hi = Math.max(hi, v); if (last !== null) jump = Math.max(jump, Math.abs(v - last)); last = v; } } return { lo, hi, jump }; };
  return { wild: run(false), calm: run(true) };
})()`;
// the notebook, written many times by the night's own build on a bare L (as the Notebook Lab does: its canvases stand-ins
// that draw nothing; the build stops at the street, which needs the rest of the game): where the page with the number
// falls. And for one generator, the notebook as it was always written (its number and the ordinary ones), so the rest
// of the notebook still comes out as it did
const keySlots = `(() => {
  const DEF = LEVELS.find(d => d.id === 'booth'), stub = new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'measureText' ? () => ({ width: 12 }) : () => stub), set: (t, k, v) => { t[k] = v; return true; } });
  const orig = document.createElement, n = [0, 0, 0, 0, 0, 0, 0, 0];
  document.createElement = tag => (tag === 'canvas' ? { tagName: 'CANVAS', width: 0, height: 0, getContext: () => stub } : { tagName: 'IMG', style: {} });
  const write = seed => { const L = { s: {}, rand: mulberry32(seed) }; try { DEF.build(L); } catch (e) { /* (the street) */ } return L.s; };
  let same;
  try {
    for (let i = 1; i <= 900; i++) n[write((i * 2654435761) >>> 0).keyPage]++;
    const one = write(5 * 7919); same = one.numberText === '555-0132' && one.others.join() === '5550114,5550107,5550148,5550155' && one.keyPage === 3;
  } finally { document.createElement = orig; }
  return { n, same, ok: same && n[2] + n[3] + n[4] === 900 && [2, 3, 4].every(j => n[j] > 240 && n[j] < 360) };
})()`;
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
    ['expect', '(' + keySlots + ').ok', 'the number is always on page 3, 4 or 5 of the notebook, each about as often, and the rest of it written as it always was'],
    // under each street lamp only the pool of its light on the ground: no streak of it drawn on the road
    ['expect', "!G.L.props.some(p => p.kind === 'poly' && p.color && p.color.join() === '255,176,104') && G.L.lights.filter(l => l.color && l.color.join() === '255,172,96').length >= 11", 'under each street lamp the pool of its light, and no streak of it on the road'],
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
    padOn, ['wait', 200], ...tap(0), ['wait', 120], padOff,   // (a moment for the pad to be seen and its aim to be on the book before A, and for A to be read before it goes)
    ['waitUntil', settled, 3000],
    ['expect', 'G.L.s.page === 3', 'and so does A'],
    // it has been at its first lamp all this while: it reached up to it and broke it, and skittered on in the dark to the next
    ...saw('reach', 'it reached up to its lamp, its arm far too long', 8000),
    ...saw('break', 'and broke it: it popped, and glass and sparks came down'),
    ['wait', 700],
    ['expect', lamp0 + '.light.i === 0 && !G.L.glows().includes(' + lamp0 + '.glow)', 'it is out for good: no light, no glow'],
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
    ...copWinCases,
    ['eval', 'restartLevel()'], ['wait', 300],
    ['eval', 'window.__cw = ' + copThenWin],
    ['expect', '__cw.first && __cw.hungUp && __cw.coinBack && __cw.cutOff', 'hung up on after her first line, the dispatcher is cut off: no more of her lines, no car sent, and the coin put in for the call comes back into the return'],
    ['expect', '__cw.sent && __cw.keysHeld', '911 again: she starts over, the police are sent with her last line, and keys do nothing while she is on the line'],
    ['expect', '__cw.again', '911 a third time: a dispatcher says a car has been sent already, and no second police car comes'],
    ['expect', '(j => j.wild.jump > 0.25 && j.wild.hi - j.wild.lo > 1.4 && j.calm.jump < 0.02 && j.calm.hi <= 0.36 && j.calm.lo >= -0.36)(' + jerks + ')', 'its convulsion: every joint snapped somewhere new several times a second; with reduced motion a slow, small writhe, nothing sudden'],
    ['expect', '__cw.won && __cw.car', 'and the right number, dialled after, still brings the car'],
    ...doorCases,
    ...fleeCases,
  ],
};
