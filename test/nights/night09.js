// The Phone Booth: nothing in hand; the notebook lies shut on the corner shelf under the phone (the only thing on it: no
// phone book, no panel over the view). The pay phone hangs across the north-east corner, between the two streets, a size
// smaller than life. Nothing is done to the view, ever: looking down at the notebook, clicking it, reading it and facing the
// phone leave the view as it is, and the zoom (Shift, Z, Space, the touch button or a trigger) is the player's own. Look
// down at the notebook and click it: the cover goes back over the spiral; click (or the Use button, or A on a gamepad) to
// turn each page over, until the one with the number scrawled large across it in red, alone on its page; with the zoom held
// it is read off (at 1280x760 the page then fills a good part of the view). Turning away, the notebook stays open where it
// lies. Find the coin (in the coin return, on the shelf under the phone or on the floor by the panes near it) and pick it
// up. Turn on to the last page and click: it shuts. Face the phone: a key does nothing with the receiver on its hook; lift
// the receiver; a key still does nothing without a coin; put the coin in; dial one of the ordinary numbers on the phone's
// own keys (not in service); hang up, and the coin comes back into the coin return. Take it; put it in with the receiver on
// its hook and it drops straight through, back into the return; take it again, lift the receiver, put it in. A key clicked
// with the zoom held is pressed as ever. A gamepad's d-pad moves a highlight over the phone's keys (and turns away past the
// last of them) and A presses the one highlighted. Dial the number with the number keys, and wait out the seven seconds of
// ringing while he keeps coming; then a car comes for you, pulls up and opens its door, and he turns round. The notebook,
// the keys, the receiver and the coin slot are clicked where they are drawn, so their hit rects are tested as well; the
// number keys dial, not choose what you hold.
// What you do happens in your hands: a key is pressed by your fingertip (what you hold goes down meanwhile and comes back
// up after) and only goes down when the finger gets there; a key the phone will not take blinks its display at you; the
// lifted receiver is in your left hand until it goes back on its hook; the coin given back drops into the cup with a
// clink; the hand feels in the empty coin return; a coin put in on the hook goes from your fingers into the slot before it
// drops into the cup; keys typed faster than the finger can go are pressed in turn.
// He has no lantern: no light walks with him, and no glow is drawn on him. He goes from street lamp to street lamp along
// his own street: he starts behind one, lit by it, reaches up and breaks it (its light, glow and streak on the road go out
// for good), rushes on in the dark to the next one nearer, and so on; his whole way in takes the time his steady walk used
// to, so the race with the phone is as it was. From the phone he is in the view, at its edge, and not behind the phone.
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
// facing the phone, he is in the view (at its edge: the corner of your eye), and not hidden behind the phone's plate
const periphery = "(() => { const p = G.L.creature.pos(), a = Math.abs(Math.atan2(p.x, p.z) / DEG - 45); return a < 44 && a > 16; })()";
const lamp0 = 'G.L.s.man.stops[0].lamp';
module.exports = {
  nightmare: [
    ['expect', 'G.inv.length === 0', 'nothing in hand: the notebook is lying on the shelf'],
    ['expect', "!G.L.items.some(i => i.id === 'journal') && !G.L.targets.some(t => t.id === 'book') && G.L.targets.some(t => t.id === 'notebook') && !document.querySelector('.pb-nb')", 'only the notebook is on the shelf: no phone book, and no panel over the view'],
    ['expect', 'G.L.s.others.length >= 4', 'there are always a few ordinary numbers in the notebook'],
    ['expect', 'G.L.lanes.every(l => l.deg !== 270)', 'nothing comes from the west'],
    ['expect', '!(G.L.dynamicLights() || []).length && !G.L.glows().some(g => g.color[0] === 255 && g.color[1] === 190)', 'he brings no light with him: no lantern, no glow'],
    // his way in: from lamp to lamp along his own street, fitted to the time he has
    ['expect', 'G.L.s.man && G.L.s.man.stops.length >= 3 && G.L.s.man.stops.every(st => st.lamp && st.lamp.street === (G.L.creature.lane.deg === 0 ? 0 : 1))', 'his way in goes by the lamps along his own street'],
    ['expect', "G.L.s.man.seg.kind === 'stop' && Math.abs(G.L.creature.dist - G.L.s.man.stops[0].d) < 0.01 && " + lamp0 + '.light.i > 0.5 && G.L.creature.lit > 0.1', 'he starts behind a lamp, lit by it'],
    ['expect', 'Math.abs(G.L.s.man.arrive - G.L.creature.T) < 0.5 && G.L.s.man.wait >= 1.6 && G.L.s.man.wait <= 6.5', 'he gets to the glass when his steady walk would have, and waits a few seconds at each lamp'],
    ['face', 1, false],
    ['expect', plain(0) + ' && ' + periphery, 'facing the phone the view is as it always is, and he is at its edge, not behind the phone'],
    watch('reach', 'G.L.creature.reach > 0.9 && G.L.creature.reachTo && G.L.creature.reachTo.y > 3.5 && ' + lamp0 + '.outAt === undefined'),
    watch('break', lamp0 + '.outAt !== undefined && G.L.s.lampsOut === 1 && G.L.s.sparks.length > 10'),
    watch('rush', 'G.L.creature.rush > 0.6 && G.L.creature.dark && G.L.creature.moving'),
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
    // its pages turn with a click, or with the Use button, or with A on a gamepad (whatever is nearest the middle of the view)
    watch('flip', "G.L.s.nbAnims.some(a => typeof a.item === 'number')"),
    ['click', 'notebook'],
    ...saw('flip', 'clicked again, the page is lifted by its corner and goes over the spiral'),
    ['waitUntil', settled, 3000],
    ['expect', 'G.L.s.page === 1 && ' + plain('PITCH_DOWN'), 'and the next page lies open, the view still as it was'],
    ['eval', "for (const t of ['pointerdown', 'pointerup']) document.getElementById('tUse').dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true }))"],
    ['waitUntil', settled, 3000],
    ['expect', 'G.L.s.page === 2', 'the Use button turns the page too'],
    padOn, ...tap(0), padOff,
    ['waitUntil', settled, 3000],
    ['expect', 'G.L.s.page === 3', 'and so does A'],
    // he has been at his first lamp all this while: he reached up to it and broke it, and ran on in the dark to the next
    ...saw('reach', 'he reached up to his lamp, his arm far too long', 8000),
    ...saw('break', 'and broke it: it popped, and glass and sparks came down'),
    ['wait', 700],
    ['expect', lamp0 + '.light.i === 0 && !G.L.glows().includes(' + lamp0 + '.glow) && ' + lamp0 + '.refl.every(q => q.alpha === 0)', 'it is out for good: no light, no glow, no streak on the road'],
    ...saw('rush', 'he rushed on in the dark'),
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
    ...saw('next', 'he came to the next lamp, at the edge of the view from the phone', 8000),
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
    ['expect', "G.L.s.line === 'ringing' && !G.L.won && G.state === 'play'", 'still ringing three seconds on, and he is still coming'],
    ['waitUntil', 'G.L.won', 8000],
    ['expect', 'G.L.s.answeredAt - window.__dialT >= 7 && Date.now() - window.__dialMs >= 6900', 'it rang for seven seconds after the last digit before anyone picked up'],
    ['expect', 'G.L.s.lampsOut >= 2', 'by then he had broken more than one lamp'],
    ['waitUntil', 'G.L.s.end && G.L.s.end.pose && G.L.s.end.doorT !== undefined', 8000],
    ['expect', "G.L.s.end.doorT >= G.L.s.end.tStop && G.state === 'won'", 'a car comes, pulls up and opens its door before the fade'],
    ['waitUntil', 'G.L.aftermathT > G.L.s.end.doorT + 0.6', 3000],
    ['expect', 'Math.abs(wrapPi(G.L.s.end.doorYaw - G.cam.yaw)) < 35 * DEG && Math.abs(wrapPi(G.L.s.end.doorYaw - 45 * DEG)) > 16 * DEG', 'the open door is in view, and not behind the pay phone'],
    ['waitUntil', 'G.L.creature.away', 4000],
  ],
};
