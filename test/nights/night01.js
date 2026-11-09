// The Field. First what will not go up, played out at the doorway it is coming for: with nothing in hand the hand goes up
// to the doorway; a plank with no hammer and no nails goes up on it, falls off and lies on the floor in front of it, where
// looking down finds it and a click takes it again. Then the hammer and the nails, and a try of the rotten plank (it goes
// up, and as the nail goes in its end tears away in a shower of crumbs, a stub of it left on the nail; it drops to the
// floor, where it lies), then the rest of the loose planks (they stack in one slot), then the doorway it is coming for,
// three planks; a knock on the boards (they hold). It runs round the house to the other doorway, at about the distance it
// was; turn round and board that one too, and it is held there. On even seeds it is let come to 15 m first, and the second
// doorway goes up at once, while it is still going round: it comes round to that doorway anyway, and on to its boards.
// Either way, once the last board is up it runs at that doorway and hits the boards before the night fades, stoops to look
// in through the gap and pounds on them, and the boards stay up.
const DOOR = ['door', 'frontdoor'], DIR = [0, 4];
const target = id => "G.L.targets.find(t => t.id === '" + id + "')";
const board = k => [['face', DIR[k]], ['click', DOOR[k]], ['wait', 150], ['click', DOOR[k]], ['wait', 150], ['click', DOOR[k]], ['wait', 150],
  ['expect', target(DOOR[k]) + '.done && ' + target(DOOR[k]) + '.count === 3', DOOR[k] + ' boarded up with three planks']];
// a thing that has fallen (window.__it): looked at as a player would, facing its way and looking down, it is drawn on the floor
// and it is what a click there takes; then it is taken
const lookAt = "(() => { const it = window.__it; G.cam.dirIdx = ((Math.round(Math.atan2(it.x, it.z) / (45 * DEG)) % 8) + 8) % 8; G.cam.yaw = G.cam.tYaw = G.cam.dirIdx * 45 * DEG; G.cam.pitch = G.cam.tPitch = PITCH_DOWN; })()";
const takeBack = what => [['eval', lookAt], ['wait', 200],
  ['expect', "(() => { const it = window.__it, h = [...R.hits].reverse().find(r => r.kind === 'item' && r.ref === it); if (!h || h.w < 6 || h.h < 4) return false; G.mouse.x = h.x + h.w / 2; G.mouse.y = h.y + h.h / 2; updateHover(); return !!G.hover && G.hover.ref === it; })()", what + ' lies on the floor in sight, and a click there takes it'],
  ['eval', 'pickup(window.__it); G.mouse.x = -1;']];
// the empty hand, then a plank with nothing to fix it: it goes up where the first board goes and falls off to the floor
const tryLoose = k => [['face', DIR[k]], ['click', DOOR[k]],
  ['expect', "G.hand.reach && G.hand.reach.target === " + target(DOOR[k]) + " && !G.fumbling", 'with nothing in hand the hand goes up to the ' + DOOR[k]],
  ['pickup', 'planks'], ['face', DIR[k]], ['click', DOOR[k]],
  ['expect', "(fx => !!fx && fx.preset === 'slip' && fx.drop && Math.abs(fx.at.y - 1.23) < 0.1 && fx.size > 1.3 && !G.hasItem('planks') && " + target(DOOR[k]) + ".count === 0)(G.fumbling)", 'a plank with no hammer or nails goes up across the ' + DOOR[k] + ' where the first board goes, and leaves the hand'],
  ['eval', 'window.__it = G.fumbling.it'],
  ['waitUntil', '!G.fumbling && !window.__it.taken', 4000],
  ['expect', '(it => it.y === G.L.floor.y && Math.abs(it.z) > 1.2 && !G.hasItem("planks"))(window.__it)', 'it fell off, to the floor in front of the doorway'],
  ...takeBack('the plank'), ['expect', "G.inv.find(i => i.id === 'planks').uses === 1", 'the plank is back in hand']];
const tryRotten = k => [['face', DIR[k]], ['click', DOOR[k]], ['wait', 150],
  ['expect', target(DOOR[k]) + ".count === 0 && !G.hasItem('rotten') && /rotten/i.test(G.lastToast.msg) && G.fumbling && G.fumbling.preset === 'slip'", 'the rotten plank goes up on the ' + DOOR[k] + ' and leaves the hand'],
  ['eval', 'window.__it = G.fumbling.it'],
  ['waitUntil', "!G.fumbling && !G.L.items.find(i => i.id === 'rotten').taken", 4000],
  ['expect', "(it => it.y === G.L.floor.y && !G.hasItem('rotten'))(G.L.items.find(i => i.id === 'rotten'))", 'it dropped to the floor and lies there'],
  ['expect', 'G.L.s.crumbs.some(c => c.chunk) && G.L.s.crumbs.filter(c => !c.dust && !c.chunk).length >= 12', 'it tore away from the nail: a stub of it left there, and crumbs of rotten wood'],
  ...takeBack('the rotten plank'), ['eval', "G.cam.pitch = G.cam.tPitch = 0; G.mouse.x = -1;"]];
const planks = (n, all) => Array.from({ length: n }, () => ['pickup', 'planks']).concat([['expect', "G.inv.filter(i => i.id === 'planks').length === 1 && G.inv.find(i => i.id === 'planks').uses === " + all, all + ' planks in one pile']]);
const running = k => ['expect', '!G.L.won && G.L.s.ran && G.L.s.ranFrom.lane === ' + k, 'not won yet: it is running round the house'];
// a click on a doorway that is boarded: a knock on the boards, and they shudder on their nails
const knock = k => [['click', DOOR[k]], ['expect', "G.hand.reach && G.hand.reach.style === 'knock' && G.hand.reach.target === " + target(DOOR[k]), 'a click on the boarded ' + DOOR[k] + ': the hand knocks on the boards'],
  ['waitUntil', 'G.L.s.jolt && G.L.s.jolt.t === ' + target(DOOR[k]), 1000]];
// after the last board: it charges the doorway it was coming for and is at its boards, and pounding on them, while the
// night is still in view
const resolves = k => [
  ['waitUntil', 'G.L.s.hitAt !== undefined', 5000],
  ['expect', 'G.fadeTarget < 1 && G.L.creature.lane.idx === ' + k + ' && Math.abs(G.L.creature.dist - G.L.lanes[' + k + '].barrierDist) < 0.05', 'it ran at the boards and was stopped there, before the fade'],
  ['waitUntil', '(G.L.s.bangs || 0) >= 2 && G.L.creature.peer >= 1', 3000],
  ['expect', 'G.fadeTarget < 1 && ' + DOOR.map(id => target(id) + '.done && ' + target(id) + '.count === 3').join(' && '), 'it stooped to the gap and pounded on them, and every board held, before the fade'],
];
const both = k => board(k).concat([
  running(k), ...knock(k),
  ['waitUntil', 'G.L.creature.lane.idx === ' + (1 - k), 4000],
  ['expect', 'G.state === "play" && Math.abs(G.L.creature.dist - Math.max(G.L.s.ranFrom.dist, G.L.lane.barrierDist + 10)) < 4', 'it came round to the other doorway at about the same distance'],
], board(1 - k), [['expect', 'G.L.won', 'both doorways boarded: it is held']], resolves(1 - k));
const quick = k => [['eval', 'G.L.creature.u = 1 - 15 / G.L.creature.D0']].concat(board(k), [running(k)], board(1 - k), [
  ['expect', 'G.L.won && G.L.s.cutShort', 'both doorways boarded while it was still going round: won'],
  ['waitUntil', '!G.L.s.run && !G.L.creature.runPose && G.L.creature.lane.idx === ' + (1 - k) + ' && Math.abs(G.L.creature.dist - G.L.lanes[' + (1 - k) + '].barrierDist) < 0.05', 5000],
], resolves(1 - k));
module.exports = {
  nightmare: [['branch', 'G.L.lane.idx === 0', tryLoose(0), tryLoose(1)],
    ['pickup', 'hammer'], ['pickup', 'nails'], ['pickup', 'rotten'],
    ['branch', 'G.L.lane.idx === 0', tryRotten(0), tryRotten(1)]].concat(planks(5, 6), [
    ['branch', 'G.seed % 2 === 0',
      [['branch', 'G.L.lane.idx === 0', quick(0), quick(1)]],
      [['branch', 'G.L.lane.idx === 0', both(0), both(1)]]]]),
};
