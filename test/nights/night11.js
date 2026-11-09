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
  ['expect', "G.L.won && G.L.s.rush.mode !== 'line'", 'both burning: you are safe'],
  ['wait', 1500], ['expect', 'window.__reared > 0.9', 'it rears back from the fire where it stands'],
], survived, again);
const onChute = sideWindow.concat(throwAt(1), [put(8.5), reared], throwAt(0), [
  ['expect', 'G.L.s.litAt[0].lane === 0 && G.L.s.litAt[0].path < G.L.s.litAt[0].hay && G.L.creature.dist > 4.6', 'the yard hay went up behind it: it was past it, on the chute'],
  ['expect', "G.L.won && G.L.s.rush.mode === 'smoke'", 'both burning: you are safe, though it was between the fire and you'],
  ['waitUntil', 'G.L.creature.sitting', 8000],
  ['expect', 'G.L.creature.sitting && G.L.s.rush.to > G.L.s.rush.p0 + 1 && window.__reared > 0.9', 'it reared back, backed away down the chute, away from you, and sat down in the smoke'],
], survived, again);
module.exports = {
  nightmare: late.concat(passedLine, onChute, [['pickup', 'matches']], bottle, [
    ['branch', 'G.L.creature.lane.idx === 0', into(0, 'hayN'), into(1, 'hayE')],
    ['expect', '!!G.L.s.run && !G.L.won', 'the fire in its way sends it round, and one fire does not hold it'],
  ], bottle, [
    ['branch', 'G.L.s.fire[0]', into(1, 'hayE'), into(0, 'hayN')],
  ]),
};
