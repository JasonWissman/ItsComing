'use strict';
// ---------- captions for sounds: one short line, with a side marker from the pan, throttled per sound ----------
// The line (#caption, index.html) is in the top left corner, under the sound line (on a phone: under the menu button),
// a small speaker before its words (.ctx). Only what tells something of the night has one: the clock's tick at the
// start of a night has none
const CAPTIONS = (() => {
  const SFX = {
    bang: 'something hits the boards', crack: 'a board cracks', receiver: 'the receiver lifts, a dial tone', dial: 'a button beeps', ringback: 'ringing on the line', noService: 'three rising tones', answer: 'someone picks up', phoneRing: 'a phone rings', rev: 'the engine roars', smash: 'the boards tear away', hammer: 'hammering', splash: 'a splash', plunge: 'a splash, far below', clonk: 'a hollow clonk', dive: 'something goes under', wetThud: 'a wet blow', wetPound: 'something pounds on the door', slosh: 'water slapping', ringThrow: 'something spins away through the air', ringPlop: 'a small splash', paddle: 'paddling',
    keyClick: 'a key clicks', coin: 'a coin drops in', coinReturn: 'a coin rattles into the return', carCome: 'a car, coming fast', brake: 'tyres hiss on the wet road', horn: 'a car horn, twice', carDoor: 'a car door opens', lampBreak: 'a street lamp pops, and glass falls',   // the pay phone's keys and coin, the car that comes, the lamps he breaks
    dispatch: 'a dispatcher\'s voice, crackling', siren: 'a police siren wails', sirenIn: 'a police siren, far off, coming nearer', tireScreech: 'tyres screech', sirenOff: 'the siren winds down', shadeShriek: 'an inhuman shriek', peelOut: 'tyres squeal, an engine roars away',   // the police, on 911 (the phone booth)
    dispatchAsk: 'a dispatcher\'s voice, crackling: a question', dispatchDescribe: 'the dispatcher\'s voice, careful: another question', dispatchSee: 'the dispatcher\'s voice, flat', dispatchSend: 'the dispatcher\'s voice, brisk', growlHigh: 'a shrill, gravelly snarl',   // (the dispatcher's four lines; the shade's snarl at the police)
    boardRattle: 'the boards rattle on their nails',
    carHit: 'the car hits something heavy', bodyDrop: 'something heavy lands on the road', joints: 'joints crack',   // the road: the car driven into it
    sparkBlast: 'the box bursts in a shower of sparks', fireCatch: 'flames rush up', fireCrackle: 'fire crackling', burnShriek: 'a burning shriek', stingBurn: 'a burning scream',   // night 11's farm set alight
    thunder: 'thunder', bell: 'a bell', glassTap: 'a tap on the glass', glassGive: 'the glass gives', tubeDie: 'a tube dies with a crackle', tubeOn: 'the lights hum on',
    sodaPour: 'soda pours, fizzing', sodaSputter: 'the soda fountain sputters, empty', gulp: 'gulping', counterPound: 'a fist pounds the counter', cupDown: 'a paper cup set down',
    shutterBang: 'fists pound on the shutter', shutterGrab: 'the shutter rattles in its rails', shutterSlam: 'a shutter slams up into its housing',
    clunk: 'a heavy click', lever: 'a lever goes over', creak: 'a creak', hinge: 'a hinge squeals', gate: 'iron on iron', chain: 'a chain', lock: 'a padlock', shot: 'a gunshot', empty: 'click', twang: 'a bowstring twangs', bowCreak: 'a bowstring creaks', bowFull: 'the bowstring comes tight', thunk: 'an arrow thunks home',
    batSqueak: 'a bat squeaks',   // night 5's easter egg: one shot out of the sky
    sugarPour: 'sugar pours out of a bag', sugarBuzz: 'a buzzing, rising', skid: 'boots skid on gravel', shudder: 'a shudder, keys jangling',   // night 3's easter egg: the bag of sugar, handed to it
    scrape: 'scratching', drawer: 'a drawer slides open', tug: 'the covers are yanked', knock: 'two knocks on a pipe', hangers: 'coat hangers clinking', musicbox: 'a music box', musicTurn: 'a few notes of a music box', birds: 'birdsong', start: 'the engine catches',
    musicSour: 'a music box plays wrong notes', sheetPress: 'cloth creaks, stretching, and a sob rises to a wail', sheetWhoosh: 'a rush of air',   // (night 10's easter egg: every mirror covered)
    growlLow: 'a very low growl', wingWhoosh: 'a great soft beat of wings', fairyDust: 'a shimmer of tiny bells', fairyRumble: 'a deep, low rumbling',   // the tall one's own death (night 12); night 12's easter egg: the tooth fairy
    bonk: 'bonk!',   // night 5: the empty bow, thrown at the vampire's head
    crank: 'the starter turns', flicker: 'the bulb flickers', lampOn: 'a lamp hums on', thud: 'a thud', hiss: 'a hiss', pour: 'pouring', strike: 'a match', cloth: 'cloth twisting', breakerTrip: 'a breaker trips with a bang', bar: 'a bar drops into place',
    fit: 'something clicks into place', ratchet: 'a ratchet', switch: 'a switch', keys: 'keys', load: 'the gun loads', win: 'a chord', drop: 'something set down',
    tink: 'metal taps on something', woodKnock: 'wood knocks against wood', clatter: 'something clatters to the floor', flop: 'something soft drops', pat: 'a hand on it', page: 'a page turns', rattle: 'a rattle',
    screech: 'a screech', growl: 'a deep growl', growl2: 'a deep growl', screechRage: 'a wild screech', warp: 'a rushing, rising', absorb: 'a rush of air, drawn in', cheer: 'ta-da!', twinkle: 'a party popper', sting: 'a scream', stingShriek: 'a shriek', stingHum: 'a rising hum', stingStone: 'stone grinding', stoneRub: 'stone rubbing on stone', stingHit: 'a blow', stingWet: 'a wet scream', stingScrape: 'hooks on stone', stingGlass: 'glass breaking',
  };
  const STEPS = { walker: 'slow footsteps', crawler: 'scuttling', smiler: 'light footsteps', runner: 'running', climber: 'hooks on stone', shoes: 'hard heels', shoesRun: 'hard heels, running', tall: 'a slow, heavy step' };
  const VOICES = { exhale: 'a long breath', hum: 'humming', clicks: 'clicking', pant: 'panting', slow: 'a very slow breath', gurgle: 'a gurgle' };
  const last = new Map();
  let el = null, words = null, hideAt = 0, calUp = false;
  function on() { return typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.settings.captions; }
  // soft: a background sound (the story's clock and hangers) that never replaces a caption still up. It is a property of
  // the call, not the sound, because the same sound can be a lane's warning on another night.
  function show(text, pan, gap, soft) {
    if (!on() || !text) return;
    const now = performance.now();
    if (soft && hideAt > now) return;
    if (last.has(text) && now - last.get(text) < (gap || 1500)) return;
    last.set(text, now);
    put(text, pan, now); calUp = false; if (el) el.classList.remove('cal');
  }
  function put(text, pan, now) {
    if (!el) { el = document.getElementById('caption'); words = el && el.querySelector('.ctx'); }
    if (!el) return;
    const side = pan < -0.3 ? '◀ ' : pan > 0.3 ? ' ▶' : '';
    words.textContent = (pan < -0.3 ? side : '') + text + (pan > 0.3 ? side : '');
    // its one line is kept short of the middle of the page (index.html): a line too long for that is set smaller, to fit, not cut
    el.style.fontSize = '';
    if (words.scrollWidth > words.clientWidth + 1) el.style.fontSize = Math.max(10, parseFloat(getComputedStyle(el).fontSize) * words.clientWidth / words.scrollWidth * 0.98).toFixed(2) + 'px';
    el.classList.add('show'); hideAt = now + 2200;
  }
  function hide() { if (el) el.classList.remove('show'); hideAt = 0; calUp = false; }
  function update() { if (el && hideAt && performance.now() > hideAt) hide(); }
  // the volume dialog's quietest sound (js/menu.js calPlay): "footsteps" for as long as it plays, the side marker going
  // over from the left to the right with it. Each of its beats says it again (cal: never held back as a repeat), and
  // when it is over or stopped the line goes at once (calOver: only if it is still this one that is up)
  function cal(pan) { if (!on()) return; put('footsteps', pan || 0, performance.now()); calUp = true; if (el) el.classList.add('cal'); }
  function calOver() { if (calUp) hide(); }
  // every line there is (the tests measure them against the page)
  const all = () => [...Object.values(SFX), ...Object.values(STEPS), ...Object.values(VOICES), 'rain and wind', 'a low hum', 'wind', 'footsteps'];
  return { all, cal, calOver, sfx: (name, pan, soft) => show(SFX[name], pan || 0, undefined, !!soft), footstep: (kind, pan) => show(STEPS[kind], pan || 0, 4000), voice: (kind, pan) => show(VOICES[kind], pan || 0, 3000), ambient: p => show(p && p.rain ? 'rain and wind' : p && p.wind === 0 ? 'a low hum' : 'wind', 0, 60000), update, show };
})();
