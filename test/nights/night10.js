// The Mirror Maze: pull the dust sheets, pick up the music box and its crank (they lie in different places), try the crank
// first (nothing for it to turn), then put the box on a wrong pedestal (any pedestal takes it, with no penalty), fit the
// crank there and turn it: the notes come out wrong, the crank sticks, the doll in the glass turns angry (it weeps) and
// hops at you.
// A click on the box lifts it back off with its crank still in it; on the odd mirror's pedestal it goes down crank and all,
// and turning it until the tune plays brings the doll out through that glass to take the box. Like a player, it faces a
// mirror square on (which holds the thing while that glass is live) and clicks what is in front of it, rather than looking
// all round for each pedestal. A wrong mirror costs three tenths of the night's clock. Before any of that it watches the doll dance in every glass: drawn at one moment, the odd
// mirror's doll is in the mirror image of the others' pose and the others are in the same pose; each move snaps in and
// holds still, and none is its own mirror image; each glass draws the pose it should; and held in a glass it dances on the
// spot, coming a little nearer only in the snap of each move (the night's clock), and faster looking away.
// It happens in your hands: a sheet is pulled down by the hand, an empty pedestal clicked with nothing in hand is touched on
// its top, the crank tried on a pedestal with no box feels about its top
// and comes back to your hand, the hand turns the crank, wrenches at it when it jams, and the box lifted off comes up off
// the pedestal into your hand.
// The dust sheets (on a night of its own): the night's dice are rolled as they always were (for seeds 1 to
// 10 the box, the crank, the odd mirror, the sheeted mirrors and the doll's side are where the night before the sheets
// could be picked up put them, and the next roll is the same); two folded sheets lie on top of the lamp's table; one in hand,
// a bare mirror takes it (the glass shows nothing under it, and before it the thing is unseen), it is pulled down again,
// its heap taken up and thrown back over; and the last bare mirror covered is the easter egg: found and saved at once,
// nothing to press, a hush, its face and then its hands pressed out through that sheet, the other sheets bulging, and
// then the sheet itself comes at you with it inside (no sheet torn down, no doll: the sheet leaves its mirror, its hem
// growing from the sheet's own size to past the edges of the view): "Nice try", "It does not like to be ignored.". Later, with every sheet down, the odd mirror is covered
// again and uncovered, and the box still plays before it.
const ped = k => 'pedestal' + k;
// watch for something that may only be true for a moment (an animation under way), from now on, every frame; saw: it was
const watch = (k, expr) => ['eval', "window._seen = window._seen || {}; window._seen['" + k + "'] = false; (() => { const f = () => { if (" + expr + ") window._seen['" + k + "'] = true; else if (G.state === 'play') requestAnimationFrame(f); }; f(); })()"];
const saw = (k, msg) => [['waitUntil', "window._seen['" + k + "']", 3000], ['expect', "window._seen['" + k + "']", msg]];
const look = k => ['face', 2 * k, false];
const byOdd = f => [3, 2, 1, 0].reduce((otherwise, k) => [['branch', 'G.L.s.odd === ' + k, f(k), otherwise]], []);
const hold = id => ['eval', "G.active = G.inv.findIndex(i => i.id === '" + id + "')"];
const sheetCount = "G.inv.filter(i => i.id === 'dustsheet').length";
const shownAgo = k => '(G.L.s.shown[' + k + '] ? G.L.t - G.L.s.shown[' + k + '].at : 99)';
// the night as its dice roll it for seeds 1 to 10 (each: the box, the crank, the odd mirror, which mirrors are bare, the
// side it comes out to, the arm it leads with, and the next roll after the night is built), as it was before the sheets
// could be picked up: nothing about them takes a roll (the crank's place on the lamp's table is the left of its top now,
// the sheets lying folded on the right of it: the same roll, 0.45 m over and 0.5 m back)
const LAYOUT = '[[[1.89,0,-2.553],[2.461,1.03,2.854],1,"0011",1,-1,0.219],[[-2.596,0,-2.614],[-2.902,0,2.806],2,"0110",-1,1,0.498],[[2.587,1.03,3.082],[-3.12,0,-1.084],0,"0011",1,-1,0.138],[[-2.818,0,-2.677],[2.81,0,-2.798],3,"0011",-1,1,0.106],[[-2.667,0,1.505],[3.091,0,1.135],3,"0110",-1,-1,0.804],[[2.692,1.03,2.998],[1.291,0,-3.098],1,"1010",1,-1,0.947],[[1.885,0,-2.533],[3.157,0,1.263],2,"0110",-1,-1,0.734],[[-1.402,0,2.912],[2.478,1.03,2.886],2,"1010",-1,1,0.104],[[-2.68,0,-2.589],[2.428,1.03,2.9],0,"1001",-1,1,0.464],[[-2.561,0,1.457],[3.159,0,1.12],1,"0011",1,1,0.774]]';
const layout = [
  ['eval', `window._layout = (() => {
    const keep = [G.runSeed, G.attempt, G.inv], out = [], spare = [];
    for (let S = 1; S <= 10; S++) {
      G.runSeed = S; G.attempt = 0; G.inv = [];
      const L = buildLevelDef(LEVELS[9], 9), r = v => +v.toFixed(3), at = id => { const i = L.items.find(q => q.id === id); return [r(i.x), r(i.y), r(i.z)]; };
      spare.push(JSON.stringify(L.items.filter(i => i.id === 'dustsheet').map(i => [r(i.x), r(i.y), r(i.z), i.taken])));
      out.push([at('musicbox'), at('crank'), L.s.odd, L.s.mirrors.map(m => (m.live ? 1 : 0)).join(''), L.s.side, L.s.lead, r(L.rand())]);
    }
    [G.runSeed, G.attempt, G.inv] = keep;
    return { rolled: JSON.stringify(out), spare };
  })()`],
  ['expect', "window._layout.rolled === '" + LAYOUT + "'", 'for seeds 1 to 10 the box, the crank, the odd mirror, the sheeted mirrors and its side are where they were before, and the next roll is the same'],
  ['expect', "window._layout.spare.every(q => q === '[[2.97,1.03,2.69,false],[3.22,1.03,2.43,false]]')", 'and on every one the two spare sheets lie folded on top of the lamp\'s table (not under it), in the same two places'],
  ['expect', "G.L.text.egg === 'Cover every mirror.' && G.L.text.eggs.includes('ignored') && G.L.s.mirrors.filter(m => m.live).length === 2 && G.L.targets.filter(t => /^sheet/.test(t.id) && !t.hidden).length === 2", 'two mirrors under sheets, two bare (nothing to click on a bare one with empty hands)'],
];
// a bare mirror (not the last one): a sheet thrown over it, pulled down again, its heap taken up and thrown back over
const coverAgain = k => [look(k), ['wait', 200],
  ['expect', "(t => !t.hidden && t.name === 'Mirror' && t.accepts.includes('dustsheet'))(G.L.targets.find(t => t.id === 'sheet" + k + "')) && " + shownAgo(k) + ' < 0.25 && G.L.creature.seen', 'with a sheet in hand the bare mirror ' + k + ' is a thing to click; its glass shows the doll, held'],
  ['eval', 'window._n = ' + sheetCount],
  ['click', 'sheet' + k],
  ['expect', '!G.L.s.mirrors[' + k + '].live && G.L.s.mirrors[' + k + '].anim.up && ' + sheetCount + " === window._n - 1 && G.state === 'play' && !G.L.s.egg", 'a click throws the sheet up over it: covered, and the sheet has left your hands'],
  ['wait', 950],   // (the glass shows it until the cloth is over it, half a second)
  ['expect', shownAgo(k) + " > 0.25 && !G.L.creature.seen && (t => !t.hidden && t.name === 'Dust sheet')(G.L.targets.find(t => t.id === 'sheet" + k + "'))", 'under the sheet the glass shows nothing, and before it the thing is unseen (it comes on as it does when you look away)'],
  ['click', 'sheet' + k],
  ['expect', 'G.L.s.mirrors[' + k + '].live && G.L.s.mirrors[' + k + '].heap === 1', 'pulled down again'],
  ['waitUntil', 'G.L.s.sheetFall.k === ' + k + ' && G.L.s.sheetFall.hissed && !G.hand.reach && !G.L.targets.find(t => t.id === "heap' + k + 'r").hidden', 3000],
  ['expect', shownAgo(k) + ' < 0.25 && G.L.creature.seen', 'and the glass shows it again'],
  watch('heap', "G.hand.fly && G.hand.fly.it.id === 'dustsheet'"),
  ['click', 'heap' + k + 'r'],
  ['expect', sheetCount + ' === window._n && G.L.s.mirrors[' + k + "].heap === 0 && G.inv[G.active].id === 'dustsheet' && G.L.targets.filter(t => /^heap" + k + "/.test(t.id)).every(t => t.hidden)", 'a click on the heap takes the sheet up: in your hand, the heap gone'],
  ...saw('heap', 'it comes up off the floor into your hand'),
  ['click', 'sheet' + k], ['wait', 650],
  ['expect', '!G.L.s.mirrors[' + k + '].live && ' + sheetCount + ' === window._n - 1 && !G.L.s.egg', 'and it goes back over the same mirror'],
];
// the last bare mirror covered: the easter egg
const lastSheet = k => [look(k), ['wait', 200],
  ['eval', `delete SAVE.data.eggs.mirrors; window._eg = { hush: 0, face: 0, hands: 0, others: 0, lungeAt: -1, shake: 0, bare: 0, early: 0, hung: 0, heaps: 0, rim0: -1, rim1: 0, near: 9, othersEnd: 0 };
    (function w() {
      const e = window._eg, s = G.L.s, T = G.stateT, c = G.L.creature;
      if (G.state === 'dying' && s.egg) {
        const own = s.egg.shown[s.egg.k], oth = Math.max(0, ...s.egg.shown.map((p, k) => (k !== s.egg.k && p ? p.k : 0)));
        if (T < 0.9) { e.hush = Math.max(e.hush, own ? own.k : 0, oth); e.shake = Math.max(e.shake, G.shakeAmt); }
        if (own) { e.face = Math.max(e.face, own.k); e.hands = Math.max(e.hands, own.hands); }
        e.others = Math.max(e.others, oth);
        if (c.lunge > 0 && e.lungeAt < 0) e.lungeAt = T;
        const sh = c.shroud, m = s.mirrors[s.egg.k];
        if (!sh) e.bare++;                                   // the doll itself would be drawn
        else if (!c.lunge) { if (!sh.hidden) e.early++; }    // before the lunge nothing is drawn of it: the sheet hangs
        else if (!sh.hidden) {                               // lunging: the sheet is off its mirror and is what comes
          if (!m.live || m.anim) e.hung++;
          if (m.heap) e.heaps++;
          const view = sh.rim / c.dist;                      // how far its hem reaches from its face, in the view (1: the side edges)
          if (e.rim0 < 0) e.rim0 = view;
          e.rim1 = Math.max(e.rim1, view); e.near = Math.min(e.near, c.dist);
          e.othersEnd = oth;
        }
      }
      if (G.state === 'play' || G.state === 'dying') requestAnimationFrame(w);
    })()`],
  ['click', 'sheet' + k],
  ['expect', "G.state === 'dying' && G.deathCause === 'ignored' && G.L.s.egg.k === " + k + ' && G.L.s.mirrors.every(m => !m.live) && G.L.creature.lane.idx === ' + (1 + k), 'the last mirror covered: the night is over at once, and it is behind that sheet'],
  ['expect', "SAVE.data.eggs.mirrors === true && JSON.parse(localStorage.getItem('itscoming.v2')).eggs.mirrors === true", "the night's easter egg is found, and kept in the save, the moment the sheet goes up"],
  // nothing can be pressed: a turn, a click on the view
  ['eval', "window._lk = [G.cam.tYaw, G.cam.dirIdx, G.inv.length]; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); UI.canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 640, clientY: 380 }))"],
  ['wait', 200],
  ['expect', "G.state === 'dying' && G.cam.tYaw === window._lk[0] && G.cam.dirIdx === window._lk[1] && G.inv.length === window._lk[2] && !G.hover && G.L.targets.filter(t => /^(sheet|heap)/.test(t.id)).every(t => t.hidden)", 'nothing can be pressed: a turn and a click do nothing'],
  ['waitUntil', "G.state === 'dead'", 8000],
  ['expect', '(e => e.hush === 0 && e.shake === 0)(window._eg)', 'first a hush: for most of a second nothing shows in any sheet, and nothing shakes'],
  ['expect', '(e => e.face > 0.95 && e.hands > 0.95 && e.others > 0.6)(window._eg)', 'then its face presses out through that sheet, and its two hands, and the other sheets bulge too'],
  ['expect', '(e => e.lungeAt > 2.85 && e.lungeAt < 3.1 && !e.bare && !e.early && e.rim0 > 0)(window._eg)', 'and at 2.9 s it comes at you in the sheet: the doll itself is never drawn, and nothing of it before then'],
  ['expect', '(e => !e.hung && !e.heaps && e.othersEnd > 0.6)(window._eg)', 'the sheet leaves its mirror with it (not torn down: no sheet hangs there and none lies in a heap), the other three still bulging'],
  ['expect', '(e => e.rim0 < 0.6 && e.rim1 > 1.25 && e.near < 0.7)(window._eg)', 'the sheet streams back from its face, its hem growing from the sheet\'s own size on the mirror to past every edge of the view as it reaches you'],
  ['expect', "G.state === 'dead' && G.deathCause === 'ignored' && G.deathScreen.title === 'Nice try' && G.deathScreen.text === 'It does not like to be ignored.'", 'the screen says "Nice try": "It does not like to be ignored."'],
];
const bare = k => 'G.L.s.mirrors[' + k + '].live && !G.L.s.egg';
const egg = [['eval', 'window.__att0 = G.attempt']].concat(layout,
  [['pickup', 'dustsheet'], ['expect', sheetCount + " === 1 && G.L.items.some(i => i.id === 'dustsheet' && !i.taken)", 'one folded sheet taken from the top of the table, the other still there'], ['pickup', 'dustsheet'],
    ['expect', sheetCount + " === 2 && G.inv[G.active].id === 'dustsheet'", 'and the other: two sheets in hand']],
  ...[0, 1, 2, 3].map(k => [['branch', bare(k) + ' && G.L.s.mirrors.filter(m => m.live).length > 1', coverAgain(k)]]),
  ...[0, 1, 2, 3].map(k => [['branch', bare(k), lastSheet(k)]]),
  [['expect', "G.state === 'dead' && !!G.L.s.egg", 'all four covered'],
    ['eval', 'G.attempt = __att0 - 1; restartLevel()'], ['wait', 300],
    ['expect', "G.state === 'play' && !G.L.s.egg && G.L.s.mirrors.filter(m => m.live).length === 2 && G.L.items.filter(i => i.id === 'dustsheet' && !i.taken).length === 2 && !G.inv.length && G.L.creature.lane.follow === 'behind'", 'the same night again, from the start: two sheets up, two folded under the table, the doll behind you']]);
// with every sheet down: a heap taken up, the odd mirror covered again and uncovered (the box still plays before it, below)
const reSheet = [['eval', 'window._hk = G.L.s.mirrors.findIndex(m => m.heap > 0)'],
  ...[0, 1, 2, 3].map(j => ['branch', 'window._hk === ' + j, [look(j), ['wait', 150], ['click', 'heap' + j + 'l'], ['expect', sheetCount + ' === 1 && G.L.s.mirrors[' + j + '].heap === 0', 'a sheet taken up from the heap under mirror ' + j]]]),
  ...byOdd(k => [look(k), ['wait', 150], ['click', 'sheet' + k], ['wait', 950],
    ['expect', '!G.L.s.mirrors[' + k + '].live && ' + sheetCount + ' === 0 && ' + shownAgo(k) + ' > 0.25 && !G.L.creature.seen', 'the odd mirror covered again: nothing in its glass'],
    ['click', 'sheet' + k], ['waitUntil', 'G.L.s.sheetFall.k === ' + k + ' && G.L.s.sheetFall.hissed && !G.hand.reach', 3000], ['wait', 350],
    ['expect', 'G.L.s.mirrors[' + k + '].live && G.L.s.mirrors.every(m => m.live) && ' + shownAgo(k) + " < 0.25 && G.L.s.odd === " + k + " && G.L.targets.filter(t => /^sheet/.test(t.id)).every(t => t.hidden)", 'and uncovered: it dances in it again, every mirror bare, as the night was'],
  ])];
const sheets = [0, 1, 2, 3].map(k => ['branch', "G.L.targets.some(t => t.id === 'sheet" + k + "' && !t.hidden)", [look(k), watch('sheet' + k, "G.hand.reach && G.hand.reach.target.id === 'sheet" + k + "' && G.hand.reach.style === 'pull'"), ['click', 'sheet' + k], ['expect', 'G.L.s.mirrors[' + k + '].live', 'the sheet over mirror ' + k + ' pulled down'],
  ...saw('sheet' + k, 'the hand goes out to it and pulls'), ['waitUntil', 'G.L.s.sheetFall.k === ' + k + ' && G.L.s.sheetFall.hissed', 2000], ['expect', 'G.L.s.sheetFall.hissed', 'and it slides off the glass']]]);
// in the page: the mirror image of a dance pose, two poses alike, how lopsided a pose is, and what each glass draws
const danceHelpers = ['eval', `window._dance = (() => {
  const CR = CREATURES.other, s = G.L.s;
  const mir = p => ({ aL: p.aR, bL: p.bR, rL: p.rR, kL: p.kR, xL: p.xR, aR: p.aL, bR: p.bL, rR: p.rL, kR: p.kL, xR: p.xL, tilt: -p.tilt, sway: -p.sway });
  const same = (a, b) => !!a && !!b && Object.keys(a).length === 12 && Object.keys(a).every(k => typeof a[k] === 'number' && Math.abs(a[k] - b[k]) < 1e-9);
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
    // each move snapped into within a fifth of a second and then held dead still until the next; and no move is its own
    // mirror image (where the arms and head stand even, the legs do not)
    held() {
      const B = CR.danceBeat;
      return CR.danceKeys.every((K, n) => { const p = CR.dancePose(n * B + 0.2, 1); return same(p, CR.dancePose((n + 1) * B - 0.01, 1)) && !same(p, mir(p)); });
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
  ['expect', 'window._dance.always()', 'mirrored at every moment of the dance, which is lopsided enough to tell and now and then stands with its arms and head even'],
  ['expect', 'window._dance.held()', 'each move is snapped into at once and held dead still until the next, and none is its own mirror image'],
].concat(...[0, 1, 2, 3].map(k => [look(k), ['wait', 80], ['expect', 'window._dance.drew(' + k + ')', 'mirror ' + k + ' draws the dance ' + "the right way round (the odd one's mirrored)"]]), [
  // (it holds each move a long beat: wait out more than one, so it has snapped into another)
  // (and it creeps in, only as each move snaps in: it is never seen to move between the snaps)
  ['eval', `window._dz = { d: G.L.creature.dist, t: G.L.creature.danceT, p: JSON.stringify(G.L.s.shown[3].pose), off: 0 };
    (function w() { const c = G.L.creature, B = CREATURES.other.danceBeat, ph = ((c.danceT % B) + B) % B; if (c.seen && c.moving && c.dance === 1 && ph > CREATURES.other.creepWin + 0.05) window._dz.off++; if (G.state === 'play' && performance.now() < window._dz.end) requestAnimationFrame(w); })(window._dz.end = performance.now() + 2300)`], ['wait', 2300],
  ['expect', 'window._dance.drew(3) && G.L.creature.danceT > window._dz.t + CREATURES.other.danceBeat && JSON.stringify(G.L.s.shown[3].pose) !== window._dz.p', 'held in the glass it dances on the spot: its pose moves'],
  ['expect', 'G.L.creature.dist < window._dz.d - 0.05 && G.L.creature.dist > window._dz.d - 1 && !window._dz.off', 'and it creeps in, a step with each snap of its dance and still between them'],
  // looking away (down at the floor) it comes on faster than held in the glass
  ['eval', 'G.cam.pitch = G.cam.tPitch = G.L.lookDown'], ['wait', 100], ['eval', 'window._dz2 = { d: G.L.creature.dist, t: G.L.t }'], ['wait', 1500],
  ['expect', '!G.L.creature.seen && (window._dz2.d - G.L.creature.dist) / (G.L.t - window._dz2.t) > (window._dz.d - window._dz2.d) / 2.3', 'looking away, it comes on faster'],
  ['eval', 'G.cam.pitch = G.cam.tPitch = 0'], ['wait', 300],
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
    ['expect', '!G.L.won && (G.L.creature.dist < window._d0 - 0.29 * G.L.creature.D0 || G.L.creature.dist <= G.L.creature.catchDist + 1.51)', 'and it hops closer, three tenths of its whole way (never right up to you)'],
    ['expect', "G.L.deathCause() === 'wrong' && G.L.text.death.wrong === 'You played for an illusion. The creature surprised you from behind.'", 'caught now, it is the illusion that did it'],
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
  ['expect', "G.state === 'dead' && G.deathCause === 'unplayed' && window.__angry.n > 10 && !window.__angry.calm && window.__angry.k === 1", 'it reached you, and its face was angry all through the lunge'],
  ['expect', "G.deathScreen.text === 'It just wants to hear its song.'", 'caught before the box ever played: it just wants to hear its song'],
  ['eval', 'G.attempt = __att0 - 1; restartLevel()'], ['wait', 300],
  ['expect', "G.state === 'play' && !G.L.creature.angry && G.L.s.placedAt < 0", 'the same night again, from the start, the doll calm'],
];
// Doing nothing is the end of you: it comes on all night, so standing still and doing nothing it has you in the end, the
// slowest way (square on before a live glass, holding it there) within three minutes, and sooner never facing a glass (the
// view down at the floor). Played out at once, a thirtieth of a second at a time, with nothing touched but where the view
// is held; then the same night again from the start
const idle = how => [
  ['eval', `window.__att0 = G.attempt; window.__idle = (() => {
    const c = G.L.creature, s = G.L.s, cam = G.cam, k = s.mirrors.findIndex(m => m.live), d0 = c.dist;
    let t = 0, steady = true, prev = c.dist, seen = 0, n = 0;
    const hold = () => { cam.yaw = cam.tYaw = k * 90 * DEG; cam.pitch = cam.tPitch = ${how === 'down' ? 'G.L.lookDown' : '0'}; cam.zoom = 1; };
    hold(); render();   // (the view drawn once held there, so what is seen is judged from it at once)
    while (G.state === 'play' && t < 400) {
      hold(); update(1 / 30); t += 1 / 30; n++;
      if (n % 30 === 0) render();
      if (G.state === 'play') { if (c.dist > prev + 1e-9) steady = false; prev = c.dist; if (c.seen) seen++; }
    }
    return { t, d0, steady, seen: seen / n, state: G.state, cause: G.deathCause };
  })()`],
  ['expect', `(r => (r.state === 'dying' || r.state === 'dead') && r.cause === 'unplayed' && r.steady && r.t > 40 && r.t < ${how === 'down' ? 90 : 180} && r.seen ${how === 'down' ? '=== 0' : '> 0.95'})(window.__idle)`,
    how === 'down' ? 'doing nothing, never facing a glass, it comes on all the while and has you in about a minute' : 'doing nothing square on before a live glass, it creeps in all the while and has you in under three minutes'],
  ['waitUntil', "G.state === 'dead'", 4000],
  ['eval', 'G.attempt = __att0 - 1; restartLevel()'], ['wait', 300],
  ['expect', "G.state === 'play' && G.L.creature.u < 0.02 && !G.L.creature.angry && G.L.s.placedAt < 0", 'the same night again, from the start'],
];
module.exports = {
  nightmare: caught.concat(egg, idle('glass'), idle('down'), sheets, reSheet, dance, emptyTouch, [['pickup', 'musicbox'], ['pickup', 'crank']], byOdd(k => crankFirst(k).concat(wrongPedestal(k), right(k))), fetched),
};
