// The Mirror Maze: pull the dust sheets, pick up the music box and its crank (they lie in different places), try the crank
// first (nothing for it to turn), then put the box on a wrong pedestal (any pedestal takes it, with no penalty), fit the
// crank there and turn it: the notes come out wrong, the crank sticks, the doll in the glass turns angry (it weeps) and
// hops at you.
// A click on the box lifts it back off with its crank still in it; on the odd mirror's pedestal it goes down crank and all,
// and turning it until the tune plays brings the doll out through that glass to take the box. Like a player, it faces a
// mirror square on (which holds the thing while that glass is live) and clicks what is in front of it, rather than looking
// all round for each pedestal. Before any of that it watches the doll dance in every glass: drawn at one moment, the odd
// mirror's doll is in the mirror image of the others' pose and the others are in the same pose; each glass draws the pose
// it should; and held in a glass it dances on the spot.
// It happens in your hands: a sheet is pulled down by the hand, an empty pedestal clicked with nothing in hand is touched on
// its top, the crank tried on a pedestal with no box feels about its top
// and comes back to your hand, the hand turns the crank, wrenches at it when it jams, and the box lifted off comes up off
// the pedestal into your hand.
const ped = k => 'pedestal' + k;
// watch for something that may only be true for a moment (an animation under way), from now on, every frame; saw: it was
const watch = (k, expr) => ['eval', "window._seen = window._seen || {}; window._seen['" + k + "'] = false; (() => { const f = () => { if (" + expr + ") window._seen['" + k + "'] = true; else if (G.state === 'play') requestAnimationFrame(f); }; f(); })()"];
const saw = (k, msg) => [['waitUntil', "window._seen['" + k + "']", 3000], ['expect', "window._seen['" + k + "']", msg]];
const look = k => ['face', 2 * k, false];
const byOdd = f => [3, 2, 1, 0].reduce((otherwise, k) => [['branch', 'G.L.s.odd === ' + k, f(k), otherwise]], []);
const hold = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const sheets = [0, 1, 2, 3].map(k => ['branch', "G.L.targets.some(t => t.id === 'sheet" + k + "' && !t.hidden)", [look(k), watch('sheet' + k, "G.hand.reach && G.hand.reach.target.id === 'sheet" + k + "' && G.hand.reach.style === 'pull'"), ['click', 'sheet' + k], ['expect', 'G.L.s.mirrors[' + k + '].live', 'the sheet over mirror ' + k + ' pulled down'],
  ...saw('sheet' + k, 'the hand goes out to it and pulls'), ['waitUntil', 'G.L.s.sheetFall.k === ' + k + ' && G.L.s.sheetFall.hissed', 2000], ['expect', 'G.L.s.sheetFall.hissed', 'and it slides off the glass']]]);
// in the page: the mirror image of a dance pose, two poses alike, how lopsided a pose is, and what each glass draws
const danceHelpers = ['eval', `window._dance = (() => {
  const CR = CREATURES.other, s = G.L.s;
  const mir = p => ({ aL: p.aR, bL: p.bR, rL: p.rR, kL: p.kR, aR: p.aL, bR: p.bL, rR: p.rL, kR: p.kL, tilt: -p.tilt, sway: -p.sway });
  const same = (a, b) => !!a && !!b && Object.keys(a).length === 10 && Object.keys(a).every(k => typeof a[k] === 'number' && Math.abs(a[k] - b[k]) < 1e-9);
  // each hand, out from its shoulder; lopsided: one hand well away from where the other is, mirrored, or the head well over
  const hand = (a, b) => [0.13 * Math.sin(a) + 0.163 * Math.sin(a + b), -0.13 * Math.cos(a) - 0.163 * Math.cos(a + b)];
  const apart = p => { const l = hand(p.aL, p.bL), r = hand(p.aR, p.bR); return Math.hypot(l[0] - r[0], l[1] - r[1]); };
  const lop = p => apart(p) > 0.12 || Math.abs(p.tilt) > 0.2;
  return {
    mir, same, lop,
    // one moment, with no step of the game between: face each glass in turn, draw the view, and read back the pose that
    // glass drew (and the dance time it drew it at); then the view as it was
    atOnce() {
      const cam = G.cam, keep = [cam.yaw, cam.tYaw, cam.pitch, cam.tPitch, cam.dirIdx];
      const drawn = s.mirrors.map((m, k) => { s.shown[k] = null; cam.yaw = cam.tYaw = k * 90 * DEG; cam.pitch = cam.tPitch = 0; cam.dirIdx = 2 * k; render(); return s.shown[k]; });
      [cam.yaw, cam.tYaw, cam.pitch, cam.tPitch, cam.dirIdx] = keep; render();
      return drawn;
    },
    // at that moment the odd glass drew the mirror image of the others' pose, and the others drew the same pose (and with
    // visible: the pose was lopsided enough that the two ways round look different)
    inStep(visible) {
      const d = this.atOnce();
      if (d.some(x => !x || x.t !== d[0].t || !x.pose)) return false;
      const others = d.filter((x, k) => k !== s.odd).map(x => x.pose), odd = d[s.odd].pose;
      return others.length === 3 && others.every(p => same(p, others[0])) && same(odd, mir(others[0])) && !same(odd, others[0]) && (!visible || lop(others[0]));
    },
    // at every moment of two whole dances: mirrored exactly; lopsided much of the time; and standing nearly even now and
    // then (so a glance can miss it)
    always() {
      let n = 0, l = 0, even = 0;
      for (let t = 0; t < 2 * CR.danceKeys.length * CR.danceBeat; t += 0.05, n++) {
        const a = CR.dancePose(t, 1), b = CR.dancePose(t, -1);
        if (!same(b, mir(a))) return false;
        if (lop(a)) l++;
        if (apart(a) < 0.05 && Math.abs(a.tilt) < 0.15) even++;
      }
      return l > n * 0.5 && even > n * 0.05;
    },
    // what glass k drew last, this moment: the dance the right way round for it (the three alike lead with the arm the load
    // rolled, s.lead; the odd one the other way round)
    drew(k) {
      const d = s.shown[k];
      return !!d && G.L.t - d.at < 0.25 && Math.abs(s.lead) === 1 && d.mir === (k === s.odd ? -1 : 1) * s.lead && same(d.pose, CR.dancePose(d.t, d.mir));
    },
  };
})()`];
const dance = [danceHelpers,
  ['expect', 'window._dance.inStep()', "drawn at one moment: the odd mirror's doll is in the mirror image of the others' pose, and the other three are in the same pose"],
  ['waitUntil', 'window._dance.inStep(true)', 4000],
  ['expect', 'window._dance.always()', 'mirrored at every moment of the dance, which is lopsided enough to tell and now and then stands even'],
].concat(...[0, 1, 2, 3].map(k => [look(k), ['wait', 80], ['expect', 'window._dance.drew(' + k + ')', 'mirror ' + k + ' draws the dance ' + "the right way round (the odd one's mirrored)"]]), [
  ['eval', 'window._dz = { d: G.L.creature.dist, t: G.L.creature.danceT, p: JSON.stringify(G.L.s.shown[3].pose) }'], ['wait', 700],
  ['expect', 'window._dance.drew(3) && G.L.creature.dist === window._dz.d && G.L.creature.danceT > window._dz.t + 0.4 && JSON.stringify(G.L.s.shown[3].pose) !== window._dz.p', 'held in the glass it dances on the spot: its pose moves, it comes no nearer'],
]);
const crankFirst = k => [hold('crank'), look(k),
  watch('feel', "G.fumbling && G.fumbling.preset === 'bump' && !G.fumbling.drop && G.fumbling.target.id === '" + ped(k) + "' && G.fumbling.phase === 'contact'"),
  ['click', ped(k)], ['expect', "!G.L.s.crankIn && G.L.s.placedAt < 0 && G.inv.some(i => i.id === 'crank')", 'the crank first: nothing for it to turn'],
  ...saw('feel', 'its socket feels about the top of the bare pedestal'),
  ['waitUntil', '!G.fumbling', 3000],
  ['expect', "!G.fumbling && G.inv[G.active].id === 'crank' && !G.L.items.some(i => i.id === 'crank' && !i.taken)", 'and the crank comes back to your hand'],
];
const wrongPedestal = k => {
  const w = (k + 1) % 4;
  return [
    hold('musicbox'), look(w), ['click', ped(w)],
    ['expect', 'G.L.s.placedAt === ' + w + " && !G.inv.some(i => i.id === 'musicbox') && G.L.s.wrongAt < 0 && !G.L.creature.angry", 'a wrong pedestal takes the box too, and nothing happens yet'],
    ['click', ped(w)], ['expect', "G.L.s.crankIn && !G.inv.some(i => i.id === 'crank') && !G.L.s.sour", 'the crank fits it there too'],
    ['eval', 'window._d0 = G.L.creature.dist'],
    watch('jam', "G.hand.reach && G.hand.reach.style === 'rattle' && G.hand.reach.target.id === '" + ped(w) + "'"),
    ['click', ped(w)],
    ['expect', 'G.L.s.sour && G.L.s.wrongAt > 0 && G.L.creature.angry === 1 && G.L.s.turns === 0', 'turning it before a wrong mirror plays wrong notes and the doll in the glass is angry'],
    ...saw('jam', 'the crank jams, and the hand wrenches at it'),
    ['expect', '!G.L.won && (G.L.creature.dist < window._d0 - 0.05 || G.L.creature.dist <= G.L.creature.catchDist + 1.51)', 'and it hops closer'],
    ['eval', 'window._dt = G.L.creature.danceT'], ['wait', 450],
    ['expect', 'G.L.creature.danceT === window._dt && G.L.creature.dance === 0', 'angry, it has stopped dancing dead and eased out of it'],
    watch('fly', "G.hand.fly && G.hand.fly.it.id === 'musicbox'"),
    ['click', ped(w)],
    ...saw('fly', 'the box comes up off the pedestal into your hand'),
    ['expect', "G.L.s.placedAt < 0 && !G.L.s.crankIn && !G.L.s.sour && G.inv.some(i => i.id === 'musicbox' && i.withCrank) && !G.inv.some(i => i.id === 'crank')", 'a click on the box lifts it back off, its crank still in it'],
  ];
};
const right = k => [
  hold('musicbox'), look(k), ['click', ped(k)], ['expect', 'G.L.s.placedAt === ' + k + " && G.L.s.crankIn && !G.inv.some(i => i.id === 'musicbox')", 'the box, crank and all, on the odd mirror\'s pedestal'],
  watch('turn', "G.hand.reach && G.hand.reach.style === 'pull' && G.hand.reach.target.id === '" + ped(k) + "'"),
  ['click', ped(k)], ['click', ped(k)], ['click', ped(k)], ['expect', '!G.L.won && G.L.s.turns === 3 && !G.L.s.sour', 'three turns, a few notes each'],
  ...saw('turn', 'the hand is on the crank, turning it'),
  ['expect', 'G.L.creature.angry < 1', 'the right tune calms it'],
  ['click', ped(k)], ['expect', 'G.L.won && G.L.s.turns === 4', 'the fourth turn plays the tune'],
];
// with nothing in hand a click on an empty pedestal brings the hand out to its top
const emptyTouch = [look(0), ['click', ped(0)], ['expect', "!G.inv.length && G.L.s.placedAt < 0 && G.hand.reach && G.hand.reach.target.id === 'pedestal0' && Math.abs(G.hand.reach.at.y - 0.77) < 0.05", 'with nothing in hand, the hand goes out to the top of an empty pedestal'], ['waitUntil', '!G.hand.reach', 2000]];
const fetched = [['waitUntil', 'G.L.s.held && G.L.creature.lane.idx === 1 + G.L.s.odd', 8000], ['expect', 'G.L.s.held && !G.L.creature.angry && G.L.creature.dance === 0 && G.L.creature.danceMir === -G.L.s.lead', 'it came out through the odd mirror and took the box, smiling, its dance over']];
// First it is let reach you: when it comes out of the glass at you it is angry (weeping: the red eyes, the tears, the open
// sob) every frame of its lunge, all the way in to your face. Then the same night again from the start.
const caught = [
  ['eval', "window.__att0 = G.attempt; window.__angry = { n: 0, calm: 0, k: 0 }; (function w() { const c = G.L.creature; if (G.state === 'dying') { if (c.angry === 1 && !c.rush && !c.smile) window.__angry.n++; else window.__angry.calm++; window.__angry.k = Math.max(window.__angry.k, c.lunge || 0); } if (G.state === 'play' || G.state === 'dying') requestAnimationFrame(w); })(); G.L.creature.hold = 1.0;"],
  ['waitUntil', "G.state === 'dead'", 6000],
  ['expect', "G.state === 'dead' && G.deathCause === 'default' && window.__angry.n > 10 && !window.__angry.calm && window.__angry.k === 1", 'it reached you, and its face was angry all through the lunge'],
  ['eval', 'G.attempt = __att0 - 1; restartLevel()'], ['wait', 300],
  ['expect', "G.state === 'play' && !G.L.creature.angry && G.L.s.placedAt < 0", 'the same night again, from the start, the doll calm'],
];
module.exports = {
  nightmare: caught.concat(sheets,dance, emptyTouch, [['pickup', 'musicbox'], ['pickup', 'crank']], byOdd(k => crankFirst(k).concat(wrongPedestal(k), right(k))), fetched),
};
