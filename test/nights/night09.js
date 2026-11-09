// The Phone Booth: try the phone book (its pages are stuck), open the notebook from the inventory and turn its pages with
// the arrow keys until the one with the number scrawled large across it in red, alone on its page, read it off, shut it. Find the coin (in the coin return, on
// the shelf under the phone or on the floor in a corner by it) and pick it up. Face the phone, on the west wall: the view
// comes in close. A key does nothing with the receiver on its hook; lift the receiver; a key still does nothing without a
// coin; put the coin in; dial one of the ordinary numbers on the phone's own keys (not in service); hang up, and the coin
// comes back into the coin return. Take it; put it in with the receiver on its hook and it drops straight through, back into
// the return; take it again, lift the receiver, put it in. A gamepad's d-pad moves a highlight over the phone's keys (and
// turns away past the last of them) and A presses the one highlighted. Dial the number with the number keys, and wait out
// the seven seconds of ringing while he keeps coming; then a car comes for you, pulls up and opens its door, and he turns
// round. The keys, the receiver, the coin slot and the phone book are clicked where they are drawn, so their hit rects are
// tested as well; the arrow keys turn pages, not the view, and the number keys dial, not choose what you hold.
const key = k => "document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '" + k + "', bubbles: true }))";
const visible = sel => "(document.querySelector('" + sel + "') && document.querySelector('" + sel + "').style.display !== 'none')";
// click the phone's keys for a string of digits where they are drawn, as a mouse would
const clickKeys = digits => "(() => { for (const d of " + digits + ") { const h = [...R.hits].reverse().find(h => h.kind === 'target' && h.ref.id === 'key' + d); if (!h) return false; UI.canvas.dispatchEvent(new MouseEvent('click', { clientX: h.x + h.w / 2, clientY: h.y + h.h / 2, bubbles: true })); } return true; })()";
const coin = "G.L.items.find(i => i.id === 'coin')";
const inCup = '(!' + coin + '.taken && ' + coin + '.y > 1.2)';
const pad = (b, on) => "window._pad.buttons[" + b + "].pressed = " + on;
const tap = b => [['eval', pad(b, true)], ['wait', 90], ['eval', pad(b, false)], ['wait', 90]];
module.exports = {
  nightmare: [
    ['expect', "G.inv.length === 1 && G.inv[0].id === 'journal'", 'the notebook is in hand'],
    ['expect', 'G.L.s.others.length >= 4', 'there are always a few ordinary numbers in the notebook'],
    ['expect', 'G.L.lanes.every(l => l.deg !== 270)', 'nothing comes from the west, where the pay phone is'],
    ['face', 6, true],
    ['click', 'book'],
    ['expect', "/will not come apart/.test(G.lastToast.msg)", 'the phone book is no use: its pages are stuck'],
    ['eval', "window.__dir = G.cam.dirIdx; document.querySelector('#inventory .slot').click()"],
    ['expect', visible('.pb-nb'), 'clicking the notebook in the inventory opens it'],
    ['waitUntil', "(() => { const b = document.querySelector('.pb-page .pb-blood'); if (b) { const r = b.getBoundingClientRect(); window.__num = b.getAttribute('aria-label').replace('-', ''); window.__blood = { alone: !document.querySelector('.pb-page .pb-l') && document.querySelector('.pb-page').textContent.trim() === '', w: r.width, h: r.height, page: G.L.s.page }; return true; } " + key('ArrowRight') + "; return false; })()", 20000],
    ['expect', 'window.__num === G.L.s.number && __blood.page === G.L.s.keyPage && __blood.page > 0', 'the number scrawled in red is the one, and it is not on the first page'],
    ['expect', '__blood.alone && __blood.w > 300 && __blood.h > 150', 'it has the page to itself, written large across it'],
    ['expect', "G.L.s.pages.filter(p => p.some(l => l[0] === '%')).length === 1 && G.L.s.pages.every((p, i) => i === G.L.s.keyPage || !p.join(' ').includes(G.L.s.numberText))", 'no other page is scrawled in red, and the number is written nowhere else'],
    ['expect', 'G.cam.dirIdx === window.__dir', 'the arrow keys turned the pages, not the view'],
    ['eval', "document.querySelector('.pb-close').click()"],
    ['expect', '!' + visible('.pb-nb'), 'the notebook shuts'],
    // the coin: where it is in the coin return the phone is looked at close up, so the view is let settle before it is taken
    ['branch', coin + '.y > 1.2', [['face', 6, false], ['wait', 700], ['pickup', 'coin']], [['pickup', 'coin']]],
    ['expect', "G.hasItem('coin')", 'the coin is in hand'],
    ['face', 6, false],
    ['wait', 700],
    ['expect', 'G.cam.zoom > 1.25 && G.cam.pitch > 0.1', 'facing the phone brings the view in close to it'],
    ['click', 'key5'],
    ['expect', "/on its hook/.test(G.lastToast.msg) && G.L.s.dialed === ''", 'a key does nothing with the receiver on its hook'],
    ['click', 'receiver'],
    ['expect', "G.L.s.hook === 'off' && G.L.s.line === 'tone'", 'the receiver is lifted: a dial tone'],
    ['click', 'key5'],
    ['expect', "/No credit/.test(G.lastToast.msg) && G.L.s.dialed === '' && G.L.s.keyT['5'] !== undefined", 'without a coin the key goes down and nothing is dialled'],
    ['click', 'slot'],
    ['expect', "G.L.s.credit > 0 && !G.hasItem('coin')", 'the coin goes in the slot'],
    ['waitUntil', "!document.getElementById('toast').classList.contains('show') || !/No credit/.test(document.getElementById('toast').textContent)", 1000],
    ['expect', clickKeys('G.L.s.others[0]'), 'the keys of an ordinary number are clicked on the phone'],
    ['expect', 'G.L.s.dialed === G.L.s.others[0]', 'the display has the number dialled'],
    ['waitUntil', "G.L.s.line === 'dead'", 3000],
    ['expect', "/not in service/.test(G.lastToast.msg) && !G.L.won", 'an ordinary number is not in service'],
    ['click', 'receiver'],
    ['expect', "G.L.s.hook === 'on' && G.L.s.credit === 0", 'hung up on the hook'],
    ['waitUntil', inCup, 2000],
    ['pickup', 'coin'],
    ['expect', "G.hasItem('coin')", 'the coin came back into the coin return, and is taken out of it'],
    ['click', 'slot'],
    ['expect', "/drops straight through/.test(G.lastToast.msg) && G.L.s.credit === 0", 'a coin put in with the receiver on its hook drops straight through'],
    ['waitUntil', inCup, 2000],
    ['pickup', 'coin'],
    ['click', 'receiver'],
    ['click', 'slot'],
    ['expect', "G.L.s.hook === 'off' && G.L.s.line === 'tone' && G.L.s.credit > 0", 'the receiver lifted, then the coin in: ready to dial'],
    // a gamepad: down, down, left goes from the middle of the keypad to the star key, A presses it (a beep, no digit); left
    // again, with no key further that way, turns the view
    ['eval', "window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad]"],
    ...tap(13), ...tap(13), ...tap(14),
    ['expect', "G.L.s.padSel && G.L.s.padSel.t.id === 'keystar' && G.cam.dirIdx === 6", 'the d-pad moves a highlight over the keys instead of turning'],
    ...tap(0),
    ['expect', "G.L.s.keyT['*'] !== undefined && G.L.t - G.L.s.keyT['*'] < 1 && G.L.s.dialed === ''", 'A presses the highlighted key'],
    ...tap(14),
    ['expect', 'G.cam.dirIdx === 5 && !G.L.s.padSel', 'past the last key that way the d-pad turns'],
    ['eval', 'navigator.getGamepads = () => []'],
    ['face', 6, false],
    ['wait', 500],
    ['eval', "for (const d of window.__num) document.body.dispatchEvent(new KeyboardEvent('keydown', { key: d, bubbles: true })); window.__dialT = G.L.t; window.__dialMs = Date.now()"],
    ['expect', "G.L.s.dialed === window.__num && G.inv.every(i => i.id === 'journal')", 'the number keys dialled it'],
    ['waitUntil', "G.L.s.line === 'ringing'", 3000],
    ['wait', 3000],
    ['expect', "G.L.s.line === 'ringing' && !G.L.won && G.state === 'play'", 'still ringing three seconds on, and he is still coming'],
    ['waitUntil', 'G.L.won', 8000],
    ['expect', 'G.L.s.answeredAt - window.__dialT >= 7 && Date.now() - window.__dialMs >= 6900', 'it rang for seven seconds after the last digit before anyone picked up'],
    ['expect', '!' + visible('.pb-nb'), 'the notebook is put away'],
    ['waitUntil', 'G.L.s.end && G.L.s.end.pose && G.L.s.end.doorT !== undefined', 8000],
    ['expect', "G.L.s.end.doorT >= G.L.s.end.tStop && G.state === 'won'", 'a car comes, pulls up and opens its door before the fade'],
    ['waitUntil', 'G.L.aftermathT > G.L.s.end.doorT + 0.6', 3000],
    ['expect', 'Math.abs(wrapPi(G.L.s.end.doorYaw - G.cam.yaw)) < 35 * DEG && Math.abs(wrapPi(G.L.s.end.doorYaw + 90 * DEG)) > 25 * DEG', 'the open door is in view, and not behind the pay phone'],
    ['waitUntil', 'G.L.creature.away', 4000],
  ],
};
