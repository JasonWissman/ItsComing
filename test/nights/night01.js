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
  // clicked again while it hangs there: nothing more (its line stays said, and nothing else goes up under it)
  ['click', DOOR[k]], ['expect', target(DOOR[k]) + ".count === 0 && /rotten/i.test(G.lastToast.msg) && G.fumbling && G.fumbling.it === window.__it && !G.hand.reach", 'a second click while it is up there does nothing more'],
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
// the other doorway's cue (its footsteps from there) is heard once it has come round in front of that doorway and walks
// again, never while it is still going round or running in from the side
const cueHook = ['eval', "window.__cueAt = []; (s0 => { AUDIO.sfx = (n, p, so) => { if (/^footstep:/.test(n)) __cueAt.push(G.L.s.run ? (G.L.s.run.arrived ? 'in' : 'round') : G.L.creature.runPose ? 'run' : 'walk'); return s0(n, p, so); }; })(AUDIO.sfx)"];
const cueHeard = ['expect', "!__cueAt.some(w => w !== 'walk') && (G.L.s.cutShort || __cueAt.length >= 1)", 'its footsteps from the other doorway came once it was walking there, not while it ran round'];
const both = k => [cueHook].concat(board(k), [
  running(k), ...knock(k),
  ['waitUntil', 'G.L.creature.lane.idx === ' + (1 - k), 4000],
  ['expect', 'G.state === "play" && Math.abs(G.L.creature.dist - Math.max(G.L.s.ranFrom.dist, G.L.lane.barrierDist + 10)) < 4', 'it came round to the other doorway at about the same distance'],
], board(1 - k), [['expect', 'G.L.won', 'both doorways boarded: it is held'], cueHeard], resolves(1 - k));
const quick = k => [['eval', 'G.L.creature.u = 1 - 15 / G.L.creature.D0']].concat(board(k), [running(k)], board(1 - k), [
  ['expect', 'G.L.won && G.L.s.cutShort', 'both doorways boarded while it was still going round: won'],
  ['waitUntil', '!G.L.s.run && !G.L.creature.runPose && G.L.creature.lane.idx === ' + (1 - k) + ' && Math.abs(G.L.creature.dist - G.L.lanes[' + (1 - k) + '].barrierDist) < 0.05', 5000],
], resolves(1 - k));
// ---- the window, the bottle and the easter egg ----
// Before the night is played as above: where things lie is as it was (seeds 1 to 10, a sum of each layout); the window is
// no target until the bottle is the thing in hand; the bottle is thrown through it and the glass breaks (the bottle gone,
// the sound, the window no target any more). With the window broken and a doorway open the night goes on as ever (boarding
// the doorway it comes for sends it round the house; it comes in by the other and that is the death, with its own line).
// Then, the same night again: the window broken and both doorways boarded, the egg plays out by itself, in order (it
// charges the boards and pounds on them, stops, turns its head, runs to the window, climbs in through it, stands, lunges),
// the view on the window as it comes through, the egg kept in the save from the moment it starts through, and the death
// screen says "It got you" and the night's line alone, though something was said just before the last board went up. And
// the night again from the start, with the window whole, is won as it always was (the steps above).
const LAYOUTS = [3670514754, 3182466661, 666963135, 1014729768, 2157629576, 3291411627, 3930209026, 497375984, 3611011127, 392029248];
const layouts = ['expect', `(() => {
  const keep = [G.runSeed, G.attempt, JSON.stringify(G.lastLane)], out = [];
  for (let S = 1; S <= 10; S++) {
    G.runSeed = S; G.attempt = 0;
    const sig = buildLevelDef(LEVELS[0], 0).items.map(i => i.id + ':' + i.x.toFixed(3) + ',' + i.y.toFixed(2) + ',' + i.z.toFixed(3)).join('|');
    let h = 0; for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) >>> 0;
    out.push(h);
  }
  G.runSeed = keep[0]; G.attempt = keep[1]; G.lastLane = JSON.parse(keep[2]);
  return out.join() === '${LAYOUTS.join()}';
})()`, 'where things lie is unchanged, seeds 1 to 10'];
const WINDOW = 3;   // the window is to the south-east
const inHand = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const take = ids => ['eval', '(() => { for (const id of ' + JSON.stringify(ids) + ") for (const it of G.L.items.filter(i => i.id === id && !i.taken)) pickup(it); })()"];
// pointed at, where the window is: is it a target (in the hit list, and what the pointer is over)?
const windowIs = "(() => { const q = R.screenPos(1.85, 1.6, -2.4), hit = R.hits.some(r => r.kind === 'target' && r.ref.id === 'window'); G.mouse.x = q.x; G.mouse.y = q.y; updateHover(); const over = !!G.hover && G.hover.ref.id === 'window'; G.mouse.x = G.mouse.y = -1; updateHover(); return hit && over ? 'target' : !hit && !over ? 'none' : 'mixed'; })()";
const sfxHook = ['eval', "window.__sfx = []; (s0 => { AUDIO.sfx = (n, p, so) => { __sfx.push(n); return s0(n, p, so); }; })(AUDIO.sfx)"];
const again = [['eval', 'G.attempt = __att0 - 1; restartLevel()'], ['wait', 300],
  ['expect', "G.state === 'play' && !G.L.s.broken && !G.L.s.egg && !G.L.won && G.inv.length === 0", 'the same night again, from the start, the window whole']];
const throwIt = [
  ['face', WINDOW], ['expect', windowIs + " === 'none'", 'with nothing in hand the window is no target'],
  take(['hammer']), ['face', WINDOW], ['expect', windowIs + " === 'none'", 'nor with the hammer in hand'],
  take(['bottle']), inHand('hammer'), ['face', WINDOW], ['expect', windowIs + " === 'none'", 'nor with the bottle carried and the hammer in hand'],
  inHand('bottle'), ['face', WINDOW], ['expect', windowIs + " === 'target'", 'with the bottle in hand the window is a target'],
  ['click', 'window'],
  ['expect', "!!G.throwing && G.throwing.it.id === 'bottle' && G.throwing.it.spin.turns >= 1 && G.throwing.it.spin.roll > 0 && !G.hasItem('bottle') && !G.L.s.broken", 'a click on it throws the bottle, which tumbles as it flies'],
  ['waitUntil', 'G.L.s.broken', 3000],
  ['expect', "!G.throwing && !G.hasItem('bottle') && !G.L.items.some(i => i.id === 'bottle' && !i.taken) && __sfx.includes('stingGlass') && G.L.s.crumbs.filter(c => c.shard).length > 20 && G.state === 'play' && !G.L.won",
    'it goes through the glass, which breaks: the sound of it, a burst of glass, and the bottle is gone'],
  ['wait', 150], ['expect', windowIs + " === 'none' && " + target('window') + '.hidden', 'broken, the window is no target any more'],
];
// broken, and a doorway open: the night as ever
const openDoor = k => [take(['nails', 'planks'])].concat(board(k), [
  ['expect', "G.state === 'play' && !G.L.won && !G.L.s.egg && G.L.s.ran && G.L.s.ranFrom.lane === " + k, 'the window broken and one doorway boarded: it runs round the house to the other, as ever'],
  ['waitUntil', '!G.L.s.run && G.L.creature.lane.idx === ' + (1 - k), 6000],
  ['eval', 'G.L.creature.u = 1 - 5 / G.L.creature.D0'],
  ['waitUntil', "G.state === 'dead'", 12000],
  ['expect', "G.deathCause === 'round' && !G.L.s.egg && G.deathScreen.title === 'It got you' && G.deathScreen.text === 'It came through the open door behind you.' && !SAVE.data.eggs.field",
    'and comes in by the open doorway: the death it always was, and no easter egg'],
]);
const stage = st => "G.L.s.egg && G.L.s.egg.stage === '" + st + "'";
const egg = k => [
  ['eval', "window.__stages = []; window.__at = {}; clearInterval(window.__eggT); window.__eggT = setInterval(() => { const e = G.L && G.L.s.egg; if (e && __stages[__stages.length - 1] !== e.stage) { __stages.push(e.stage); __at[e.stage] = G.stateT; } }, 10)"],
  take(['hammer', 'nails', 'planks', 'bottle']), inHand('bottle'), ['face', WINDOW], ['click', 'window'], ['waitUntil', 'G.L.s.broken', 3000],
].concat(board(k), [running(k), ['waitUntil', 'G.L.creature.lane.idx === ' + (1 - k), 4000],
  ['face', DIR[1 - k]], ['click', DOOR[1 - k]], ['wait', 150], ['click', DOOR[1 - k]], ['wait', 150],
  ['eval', "G.toast('Nearly there.')"],   // said just before the last board: it is not put in front of the death line
  ['click', DOOR[1 - k]],
  ['expect', "G.state === 'dying' && G.deathCause === 'window' && !G.L.won && " + stage('door') + ' && ' + DOOR.map(id => target(id) + '.done').join(' && '), 'the window broken and both doorways boarded: not won, and the rest plays by itself'],
  ['waitUntil', stage('pound'), 6000],
  ['expect', 'G.L.creature.lane.idx === ' + (1 - k) + ' && Math.abs(G.L.creature.dist - G.L.lanes[' + (1 - k) + '].barrierDist) < 0.05', 'it charged the boarded doorway and hit the boards'],
  ['waitUntil', '(G.L.s.bangs || 0) >= 3 && G.L.creature.peer >= 1', 4000],
  ['expect', "G.state === 'dying' && !SAVE.data.eggs.field && " + DOOR.map(id => target(id) + '.count === 3').join(' && '), 'it stooped to the gap and pounded on them, and they held'],
  ['waitUntil', stage('turn') + ' && Math.abs(G.L.creature.look) > 0.9', 4000],
  ['expect', 'G.L.s.bangs === 4 && Math.sign(G.L.creature.look) === ' + (k === 0 ? -1 : 1), 'after four blows it stopped, and its head turned toward the window'],
  ['waitUntil', stage('run') + ' && G.L.creature.runPose', 3000],
  ['waitUntil', stage('climb'), 6000],
  ['expect', "SAVE.data.eggs.field === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.field === true", 'it ran to the window, and as it starts through it the easter egg is found, and kept in the save'],
  ['expect', 'G.L.s.barsOut && G.L.creature.climb !== undefined && Math.abs(G.L.creature.pos().x - 1.85) < 0.05 && Math.abs(G.L.creature.pos().z + 2.4) < 0.05', 'it is at the window, the bars torn out of it'],
  ['waitUntil', 'G.L.creature.climb > 0.5', 6000],
  ['expect', "G.state === 'dying' && Math.abs(wrapPi(G.cam.yaw - Math.atan2(1.85, -2.4))) < 0.2 && !!R.screenPos(1.85, 1.6, -2.4)", 'the view has turned to the window as it comes through'],
  ['waitUntil', stage('stand'), 6000],
  ['expect', '(p => G.L.creature.climb === undefined && p.z > -2.3 && p.x > 1)(G.L.creature.pos())', 'it stands inside, under the window'],
  ['waitUntil', "G.state === 'dead'", 6000],
  ['expect', "__stages.join() === 'door,pound,still,turn,run,face,climb,stand,lunge'", 'in order: the boards, the pounding, its head turning, the run, the window, the climb, a moment standing, the lunge'],
  ['expect', "(SAVE.data.settings.reducedMotion ? [3.7, 4.3] : [2.4, 2.8]).every((v, i) => i ? __at.stand - __at.climb <= v : __at.stand - __at.climb >= v) && __at.lunge - __at.stand > 0.6 && __at.lunge - __at.stand < 0.85",
    'the bars torn out and the climb in are quick (about 2.6 s; 4 s with reduced motion), and it stands 0.7 s before it lunges'],
  ['expect', "G.deathScreen.title === 'It got you' && G.deathScreen.text === 'Was that necessary?' && /It got you/.test(UI.overlay.textContent) && /Was that necessary\\?/.test(UI.overlay.textContent) && !/Nearly there/.test(UI.overlay.textContent)",
    'the death screen: "It got you", and "Was that necessary?" alone'],
  ['eval', 'clearInterval(window.__eggT)'],
]);
const windowEgg = [layouts, ['eval', 'window.__att0 = G.attempt; delete SAVE.data.eggs.field; SAVE.persist()'], sfxHook].concat(throwIt,   // (the egg not found yet, whatever an earlier seed left in the save)
  [['branch', 'G.L.lane.idx === 0', openDoor(0), openDoor(1)]], again,
  [['branch', 'G.L.lane.idx === 0', egg(0), egg(1)]], again);
module.exports = {
  nightmare: windowEgg.concat([['branch', 'G.L.lane.idx === 0', tryLoose(0), tryLoose(1)],
    ['pickup', 'hammer'], ['pickup', 'nails'], ['pickup', 'rotten'],
    ['branch', 'G.L.lane.idx === 0', tryRotten(0), tryRotten(1)]].concat(planks(5, 6), [
    ['branch', 'G.seed % 2 === 0',
      [['branch', 'G.L.lane.idx === 0', quick(0), quick(1)]],
      [['branch', 'G.L.lane.idx === 0', both(0), both(1)]]],
    ['expect', "G.L.won && G.state === 'won' && !G.L.s.broken && !G.L.s.egg && !G.L.s.barsOut", 'the window whole: the night is won as ever']])),
};
