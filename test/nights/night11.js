// The Barn: a bottle and a rag, fill the bottle at the oil drum, stuff the rag in, light it with the matches and throw it
// into the hay it is coming past; it runs round to the other way in, so the second bottle goes into the other stack.
// The matches are picked up once and kept. The harness carries little: one bottle and one rag at a time.
// First the rule that both burning hold it wherever it is, unless it is already up in the loft, on its way in from the side
// window (the loft door, across the yard), with lit bottles put straight into your hands and thrown at a stack:
//  - the barn hay first (not its way: on it comes), then the yard hay with it already in the loft doorway: too late, and
//    the line says so;
//  - the yard hay while it is still out in the yard: it runs round to the barn floor; the barn hay goes up after it has
//    passed that way's fire line, in among the hay (once a death: the bug): you survive, and it rears back out of the fire;
//  - the barn hay first, then the yard hay once it is past the yard hay and on the chute, the fire at its back: you
//    survive, and it backs away down the chute into the smoke and sits there.
// Then the night itself, made and thrown by hand.
const bottle = [['pickup', 'bottle'], ['pickup', 'rag'], ['use', 'drum'], ['expect', "G.inv.some(i => i.id === 'bottle_oil')", 'bottle filled at the drum'],
  ['combine', 'bottle_oil', 'rag'], ['combine', 'cocktail', 'matches'], ['expect', "G.inv.some(i => i.id === 'cocktail_lit') && G.inv.some(i => i.id === 'matches')", 'bottle lit, matches kept']];
const into = (k, id) => [['use', id], ['waitUntil', 'G.L.s.fire[' + k + ']', 4000], ['expect', 'G.L.s.fire[' + k + ']', id + ' burning']];
const sideWindow = [['eval', 'for (let k = 0; k < 40 && G.L.creature.lane.idx !== 0; k++) restartLevel();'], ['wait', 300],
  ['expect', 'G.L.creature.lane.idx === 0 && G.state === "play"', 'it is coming from the side window: across the yard for the loft door']];
const hay = k => "G.L.targets.find(t => t.id === '" + (k === 0 ? 'hayN' : 'hayE') + "')";
const litBottle = "(() => { const it = newItem(G.L, 'cocktail_lit', 'Lit bottle', { w: 0.2, h: 0.36, throwable: true, icon: 'barnCocktailLit' }); G.inv.push(it); G.active = G.inv.length - 1; return it; })()";
const throwAt = k => [['eval', litBottle + '; useTarget(' + hay(k) + ');'], ['waitUntil', 'G.L.s.fire[' + k + ']', 3000]];   // as a click on the stack does
const put = p => ['eval', 'G.L.creature.u = 1 - ' + p + ' / G.L.creature.S0;'];   // this many path metres from you on its way
const survived = [['waitUntil', "G.state === 'survived'", 15000], ['expect', "G.state === 'survived'", 'it never reached you: the night is survived']];
const again = [['eval', 'restartLevel()'], ['wait', 300]];
// how far it reared back, watched every frame from now until the night is over
const reared = ['eval', 'window.__reared = 0; (function w() { window.__reared = Math.max(window.__reared, G.L.creature.recoil || 0); if (G.state === "won" || G.state === "play") requestAnimationFrame(w); })();'];
const late = sideWindow.concat(throwAt(1), [
  ['expect', '!G.L.s.run && G.L.creature.lane.idx === 0 && !G.L.won', 'the barn hay first: it is not coming that way, so on it comes'],
  ['eval', put(3.6)[1] + ' G.L.creature.dist = 3.6; ' + litBottle + '; applyUse(' + hay(0) + ', G.inv[G.active]);'],
  ['expect', 'G.L.s.fire[0] && G.L.s.fire[1] && !G.L.won', 'both burning with it already in the loft doorway: nothing holds it now'],
  ['waitUntil', "G.state === 'dying' || G.state === 'dead'", 8000],
  ['expect', "G.deathCause === 'late' && /already up in the loft/.test(G.L.text.death.late)", 'it reaches you, and the line says it was already in the loft'],
], again);
const passedLine = sideWindow.concat(throwAt(0), [
  ['expect', '!!G.L.s.run && !G.L.won', 'the yard hay while it is out in the yard: it runs round'],
  ['waitUntil', '!G.L.s.run && G.L.creature.lane.idx === 1', 6000],
  ['expect', '!G.L.s.run && G.L.creature.lane.idx === 1', 'it has come round to the barn floor'],
  put(15.4), reared,
], throwAt(1), [
  ['expect', 'G.L.s.litAt[1].lane === 1 && G.L.s.litAt[1].path < G.L.s.litAt[1].bar', "the barn hay went up after it had passed that way's fire line"],
  ['waitUntil', '!!G.L.s.rush', 2000],   // (decided in the frame after the win)
  ['expect', "G.L.won && G.L.s.rush.mode !== 'line'", 'both burning: you are safe'],
  ['wait', 1500], ['expect', 'window.__reared > 0.9', 'it rears back from the fire where it stands'],
], survived, again);
const onChute = sideWindow.concat(throwAt(1), [put(8.5), reared], throwAt(0), [
  ['expect', 'G.L.s.litAt[0].lane === 0 && G.L.s.litAt[0].path < G.L.s.litAt[0].hay && G.L.creature.dist > 4.6', 'the yard hay went up behind it: it was past it, on the chute'],
  ['waitUntil', '!!G.L.s.rush', 2000],
  ['expect', "G.L.won && G.L.s.rush.mode === 'smoke'", 'both burning: you are safe, though it was between the fire and you'],
  ['waitUntil', 'G.L.creature.sitting', 8000],
  ['expect', 'G.L.creature.sitting && G.L.s.rush.to > G.L.s.rush.p0 + 1 && window.__reared > 0.9', 'it reared back, backed away down the chute, away from you, and sat down in the smoke'],
], survived, again);
// What will not go, shown in the world (js/hands.js), with it held where it is, each from a fresh start:
//  - an unlit bottle of oil at the hay is swung out toward it at arm's length and held back (only a lit one is let go of:
//    anything else would be lost down there), oil slopping out of its neck; an empty bottle the same; the matches: one is
//    struck and flicked out at the hay, and goes out as it falls, the box kept;
//  - at the drum a full bottle goes to the tap and comes back, the oil running over onto the boards; a lit one goes toward
//    it and is snatched back short of it; with nothing in hand the tap is turned and the oil runs out onto the boards;
//  - the wrong ways round in the hands leave both just as they were, the other thing (or a struck match) up in the other hand
//    a moment; a lit bottle put down is lowered toward the boards and kept.
const fresh = [['eval', 'restartLevel(); G.L.creature.hold = G.L.creature.dist;'], ['wait', 250]];
const T = id => "G.L.targets.find(t => t.id === '" + id + "')";
const take = (id, as) => "(() => { const it = G.L.items.find(i => i.id === '" + id + "' && !i.taken); it.taken = true; G.inv.push(it); G.active = G.inv.length - 1;" + (as ? ' Object.assign(it, ' + as + ');' : '') + ' return it; })()';
const OIL = "{ id: 'bottle_oil', name: 'Bottle of oil', icon: ICONS.barnBottleOil }";
const aim = id => 'G.cam.yaw = G.cam.tYaw = Math.atan2(' + T(id) + '.x, ' + T(id) + '.z); G.cam.pitch = G.cam.tPitch = 0;';
const inHand = id => "!G.fumbling && G.inv[G.active] && G.inv[G.active].id === '" + id + "' && G.hand.cur === G.inv[G.active] && G.hand.up > 0.9 && !G.hand.gone";
const near = (id, d) => 'Math.hypot(G.fumbling.at.x, G.fumbling.at.y - G.L.eyeH, G.fumbling.at.z) < ' + d;
const drops = ['eval', "window.__drops = 0; (function w() { window.__drops = Math.max(window.__drops, G.L.s.bits.filter(b => b.kind === 'drop').length); if (G.state === 'play') requestAnimationFrame(w); })();"];
const fumbles = [].concat(
  fresh, [drops, ['eval', take('bottle', OIL) + '; ' + aim('hayE') + ' useTarget(' + T('hayE') + ');'],
    ['expect', "G.fumbling && G.fumbling.preset === 'return' && !G.fumbling.drop && " + near('hayE', 2.2) + " && G.lastToast.msg === 'It is not lit.'", "an unlit bottle of oil at the hay is swung out at arm's length toward it"],
    ['waitUntil', inHand('bottle_oil'), 3000], ['expect', inHand('bottle_oil') + ' && window.__drops > 5 && !G.L.s.fire[1]', 'and held back: it is in your hand again, oil slopped out of its neck, and the hay is not alight']],
  fresh, [['eval', take('bottle') + '; ' + aim('hayN') + ' useTarget(' + T('hayN') + ');'],
    ['expect', "G.fumbling && G.fumbling.preset === 'return' && " + near('hayN', 2.2), 'an empty bottle at the hay: swung out toward it too'], ['waitUntil', inHand('bottle'), 3000], ['expect', inHand('bottle'), 'and kept']],
  fresh, [['eval', take('matches') + '; ' + aim('hayN') + ' useTarget(' + T('hayN') + '); useTarget(' + T('hayN') + ');'],
    ['expect', "!G.fumbling && G.L.s.bits.filter(b => b.kind === 'match').length === 1 && G.inv.some(i => i.id === 'matches')", 'the matches at the hay: one is struck and flicked out at it (one, however fast the clicks), the box kept'],
    ['waitUntil', "!G.L.s.bits.length", 3000], ['expect', '!G.L.s.fire[0] && !G.L.s.bits.length', 'it went out as it fell, and the hay is not alight']],
  fresh, [['eval', take('bottle', OIL) + '; ' + aim('drum') + ' useTarget(' + T('drum') + ');'],
    ['expect', "G.fumbling && Math.hypot(G.fumbling.at.x - " + T('drum') + ".x, G.fumbling.at.z - " + T('drum') + ".z) < 0.6 && G.lastToast.msg === 'Full already.'", 'a full bottle at the drum goes to the tap'],
    ['waitUntil', inHand('bottle_oil'), 3000], ['expect', inHand('bottle_oil') + ' && G.L.s.spill > 0', 'and comes back, the oil run over onto the boards']],
  fresh, [['eval', "const it = newItem(G.L, 'cocktail_lit', 'Lit bottle', { w: 0.2, h: 0.36, throwable: true, icon: 'barnCocktailLit' }); G.inv.push(it); G.active = 0; " + aim('drum') + ' useTarget(' + T('drum') + ');'],
    ['expect', 'G.fumbling && Math.hypot(G.fumbling.at.x - ' + T('drum') + '.x, G.fumbling.at.z - ' + T('drum') + '.z) > 0.9', 'a lit bottle at the drum goes toward it, and stops well short of it'],
    ['waitUntil', inHand('cocktail_lit'), 3000], ['expect', inHand('cocktail_lit'), 'and is snatched back']],
  fresh, [['eval', aim('drum') + ' useTarget(' + T('drum') + ');'], ['expect', "G.hand.reach && G.hand.reach.style === 'pull'", 'nothing in hand: the hand goes to the tap'],
    ['waitUntil', '!G.hand.reach', 3000], ['expect', 'G.L.s.spill > 0 && !G.inv.length', 'and the oil runs out onto the boards']],
  fresh, [['eval', take('bottle') + '; ' + take('rag') + '; ' + take('matches') + '; G.active = 0; window.__n = G.L.items.length; window.__inv = G.inv.slice();'], ['wait', 150],
    ['eval', "document.querySelectorAll('#inventory .slot')[1].click();"],
    ['expect', "G.lastToast.msg === 'The bottle is empty.' && G.inv.length === 3 && G.inv.every((i, k) => i === window.__inv[k]) && G.active === 0 && G.L.items.length === window.__n", 'the empty bottle and the rag: both still in your hands, just as they were'],
    ['waitUntil', "G.hand.off.cur && G.hand.off.cur.id === 'rag' && G.hand.off.up > 0.9", 1500], ['expect', "G.hand.off.cur.id === 'rag' && G.hand.cur.id === 'bottle'", 'the rag comes up in your other hand beside the bottle'],
    ['waitUntil', '!G.hand.off.cur', 3000], ['expect', '!G.hand.off.cur', 'and goes down again'],
    ['eval', 'G.active = 0;'], ['wait', 150], ['eval', "document.querySelectorAll('#inventory .slot')[2].click();"],
    ['expect', "G.lastToast.msg === 'There is nothing to light.' && G.inv.every((i, k) => i === window.__inv[k])", 'the empty bottle and the matches: as they were'],
    ['waitUntil', "G.hand.off.cur && G.hand.off.cur.id === 'match'", 1500], ['expect', "G.hand.off.cur.id === 'match'", 'a match is struck in your other hand']],
  fresh, [['eval', "const it = newItem(G.L, 'cocktail_lit', 'Lit bottle', { w: 0.2, h: 0.36, throwable: true, icon: 'barnCocktailLit' }); G.inv.push(it); G.active = 0; G.cam.dirIdx = 6; G.cam.yaw = G.cam.tYaw = -Math.PI / 2;"], ['wait', 300],
    ['eval', 'G.cam.pitch = G.cam.tPitch = PITCH_DOWN; dropActive();'],
    ['expect', "G.fumbling && G.fumbling.at.y < " + 'G.L.floor.y + 0.4' + " && G.inv.some(i => i.id === 'cocktail_lit') && G.lastToast.msg === 'Not in here.'", 'a lit bottle put down: it is lowered toward the boards'],
    ['waitUntil', inHand('cocktail_lit'), 3000], ['expect', inHand('cocktail_lit') + " && G.L.items.every(i => i.id !== 'cocktail_lit' || i.taken)", 'and kept: it is back in your hand, not on the floor']],
  [['eval', 'restartLevel();'], ['wait', 250]]);   // (and on from a fresh start, with nothing held back)
module.exports = {
  nightmare: fumbles.concat(late, passedLine, onChute, [['pickup', 'matches']], bottle, [
    ['branch', 'G.L.creature.lane.idx === 0', into(0, 'hayN'), into(1, 'hayE')],
    ['expect', '!!G.L.s.run && !G.L.won', 'the fire in its way sends it round, and one fire does not hold it'],
  ], bottle, [
    ['branch', 'G.L.s.fire[0]', into(1, 'hayE'), into(0, 'hayN')],
  ]),
};
