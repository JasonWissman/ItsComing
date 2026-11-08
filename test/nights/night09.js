// The Phone Booth: try the phone book (its pages are stuck), open the notebook from the inventory and turn its pages with
// the arrow keys until the one that says not to wait, read the number off it, shut it, lift the receiver, dial one of the
// ordinary numbers first (not in service), hang up, lift again, dial the number with the number keys, and wait out the
// seven seconds of ringing while he keeps coming. The arrow keys turn pages, not the view; the number keys dial, they do not
// choose what you hold. The receiver, the keypad and the phone book are clicked where they are drawn, from the two views a
// player has of the phone (looking at it, and looking down at the shelf), so their hit rects are tested as well.
const key = k => "document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '" + k + "', bubbles: true }))";
const visible = sel => "(document.querySelector('" + sel + "') && document.querySelector('" + sel + "').style.display !== 'none')";
module.exports = {
  nightmare: [
    ['expect', "G.inv.length === 1 && G.inv[0].id === 'journal'", 'the notebook is in hand'],
    ['expect', 'G.L.s.others.length >= 4', 'there are always a few ordinary numbers in the notebook'],
    ['face', 4, true],
    ['click', 'book'],
    ['expect', "/will not come apart/.test(G.lastToast.msg)", 'the phone book is no use: its pages are stuck'],
    ['face', 4, false],
    ['click', 'keypad'],
    ['expect', "/on its hook/.test(G.lastToast.msg) && !" + visible('.pb-kp'), 'the keypad does nothing with the receiver on its hook'],
    ['eval', "window.__dir = G.cam.dirIdx; document.querySelector('#inventory .slot').click()"],
    ['expect', visible('.pb-nb'), 'clicking the notebook in the inventory opens it'],
    ['waitUntil', "(() => { const t = document.querySelector('.pb-page').textContent, m = /wait/i.test(t) && t.match(/555-01\\d\\d/); if (m) { window.__num = m[0].replace('-', ''); return true; } " + key('ArrowRight') + "; return false; })()", 20000],
    ['expect', 'window.__num === G.L.s.number', 'the number on the page that says not to wait is the one'],
    ['expect', 'G.cam.dirIdx === window.__dir', 'the arrow keys turned the pages, not the view'],
    ['eval', "document.querySelector('.pb-close').click()"],
    ['expect', '!' + visible('.pb-nb'), 'the notebook shuts'],
    ['click', 'receiver'],
    ['expect', "G.L.s.hook === 'off' && " + visible('.pb-kp'), 'the receiver is lifted and the keypad is up'],
    ['eval', "for (const d of G.L.s.others[0]) document.querySelector('.pb-kp [data-k=\"' + d + '\"]').click()"],
    ['waitUntil', "G.L.s.line === 'dead'", 3000],
    ['expect', "/not in service/.test(G.lastToast.msg) && !G.L.won", 'an ordinary number is not in service'],
    ['click', 'receiver'],
    ['expect', "G.L.s.hook === 'on' && !" + visible('.pb-kp'), 'hung up on the hook'],
    ['click', 'receiver'],
    ['expect', "G.L.s.hook === 'off' && G.L.s.line === 'tone'", 'lifted again: a dial tone'],
    ['eval', "document.querySelector('.pb-kx').click(); " + key('1')],
    ['expect', "!" + visible('.pb-kp') + " && G.L.s.dialed === '' && G.L.s.line === 'tone'", 'with the keypad put away the number keys do not dial'],
    ['click', 'keypad'],
    ['expect', visible('.pb-kp'), 'clicking the phone\'s keypad brings it back'],
    ['eval', "for (const d of window.__num) document.body.dispatchEvent(new KeyboardEvent('keydown', { key: d, bubbles: true })); window.__dialT = G.L.t; window.__dialMs = Date.now()"],
    ['expect', "G.L.s.dialed === window.__num && G.active === 0", 'the number keys dialled it'],
    ['waitUntil', "G.L.s.line === 'ringing'", 3000],
    ['wait', 3000],
    ['expect', "G.L.s.line === 'ringing' && !G.L.won && G.state === 'play'", 'still ringing three seconds on, and he is still coming'],
    ['waitUntil', 'G.L.won', 8000],
    ['expect', 'G.L.s.answeredAt - window.__dialT >= 7 && Date.now() - window.__dialMs >= 6900', 'it rang for seven seconds after the last digit before anyone picked up'],
    ['expect', '!' + visible('.pb-kp') + ' && !' + visible('.pb-nb'), 'the panels are put away'],
  ],
};
