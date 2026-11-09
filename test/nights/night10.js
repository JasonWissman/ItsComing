// The Mirror Maze: pull the dust sheets, pick up the music box and its crank (they lie in different places), try the crank
// first (nothing for it to turn), then put the box on a wrong pedestal (any pedestal takes it, with no penalty), fit the
// crank there and turn it: the notes come out wrong, the crank sticks, the doll in the glass turns angry and hops at you.
// A click on the box lifts it back off with its crank still in it; on the odd mirror's pedestal it goes down crank and all,
// and turning it until the tune plays brings the doll out through that glass to take the box. Like a player, it faces a
// mirror square on (which holds the thing while that glass is live) and clicks what is in front of it, rather than looking
// all round for each pedestal. Before any of that it watches the doll dance in every glass: drawn at one moment, the odd
// mirror's doll is in the mirror image of the others' pose and the others are in the same pose; each glass draws the pose
// it should; and held in a glass it dances on the spot.
const ped = k => 'pedestal' + k;
const look = k => ['face', 2 * k, false];
const byOdd = f => [3, 2, 1, 0].reduce((otherwise, k) => [['branch', 'G.L.s.odd === ' + k, f(k), otherwise]], []);
const hold = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const sheets = [0, 1, 2, 3].map(k => ['branch', "G.L.targets.some(t => t.id === 'sheet" + k + "' && !t.hidden)", [look(k), ['click', 'sheet' + k], ['expect', 'G.L.s.mirrors[' + k + '].live', 'the sheet over mirror ' + k + ' pulled down']]]);
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
const crankFirst = k => [hold('crank'), look(k), ['click', ped(k)], ['expect', "!G.L.s.crankIn && G.L.s.placedAt < 0 && G.inv.some(i => i.id === 'crank')", 'the crank first: nothing for it to turn']];
const wrongPedestal = k => {
  const w = (k + 1) % 4;
  return [
    hold('musicbox'), look(w), ['click', ped(w)],
    ['expect', 'G.L.s.placedAt === ' + w + " && !G.inv.some(i => i.id === 'musicbox') && G.L.s.wrongAt < 0 && !G.L.creature.angry", 'a wrong pedestal takes the box too, and nothing happens yet'],
    ['click', ped(w)], ['expect', "G.L.s.crankIn && !G.inv.some(i => i.id === 'crank') && !G.L.s.sour", 'the crank fits it there too'],
    ['eval', 'window._d0 = G.L.creature.dist'],
    ['click', ped(w)],
    ['expect', 'G.L.s.sour && G.L.s.wrongAt > 0 && G.L.creature.angry === 1 && G.L.s.turns === 0', 'turning it before a wrong mirror plays wrong notes and the doll in the glass is angry'],
    ['expect', '!G.L.won && (G.L.creature.dist < window._d0 - 0.05 || G.L.creature.dist <= G.L.creature.catchDist + 1.51)', 'and it hops closer'],
    ['eval', 'window._dt = G.L.creature.danceT'], ['wait', 450],
    ['expect', 'G.L.creature.danceT === window._dt && G.L.creature.dance === 0', 'angry, it has stopped dancing dead and eased out of it'],
    ['click', ped(w)],
    ['expect', "G.L.s.placedAt < 0 && !G.L.s.crankIn && !G.L.s.sour && G.inv.some(i => i.id === 'musicbox' && i.withCrank) && !G.inv.some(i => i.id === 'crank')", 'a click on the box lifts it back off, its crank still in it'],
  ];
};
const right = k => [
  hold('musicbox'), look(k), ['click', ped(k)], ['expect', 'G.L.s.placedAt === ' + k + " && G.L.s.crankIn && !G.inv.some(i => i.id === 'musicbox')", 'the box, crank and all, on the odd mirror\'s pedestal'],
  ['click', ped(k)], ['click', ped(k)], ['click', ped(k)], ['expect', '!G.L.won && G.L.s.turns === 3 && !G.L.s.sour', 'three turns, a few notes each'],
  ['expect', 'G.L.creature.angry < 1', 'the right tune calms it'],
  ['click', ped(k)], ['expect', 'G.L.won && G.L.s.turns === 4', 'the fourth turn plays the tune'],
];
const fetched = [['waitUntil', 'G.L.s.held && G.L.creature.lane.idx === 1 + G.L.s.odd', 8000], ['expect', 'G.L.s.held && !G.L.creature.angry && G.L.creature.dance === 0 && G.L.creature.danceMir === -G.L.s.lead', 'it came out through the odd mirror and took the box, smiling, its dance over']];
module.exports = {
  nightmare: sheets.concat(dance, [['pickup', 'musicbox'], ['pickup', 'crank']], byOdd(k => crankFirst(k).concat(wrongPedestal(k), right(k))), fetched),
};
