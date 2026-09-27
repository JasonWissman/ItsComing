'use strict';
// ---------- captions for sounds: one short line, with a side marker from the pan, throttled per sound ----------
const CAPTIONS = (() => {
  const SFX = {
    bang: 'something hits the boards', crack: 'a board cracks', smash: 'the boards tear away', hammer: 'hammering', splash: 'a splash', dive: 'something goes under', wetThud: 'a wet blow',
    thunder: 'thunder', horn: 'a train horn', brakes: 'brakes screaming', bell: 'a bell', glassTap: 'a tap on the glass', tubeDie: 'a tube dies with a crackle', tubeOn: 'the lights hum on',
    clunk: 'a heavy click', lever: 'a lever goes over', creak: 'a creak', gate: 'iron on iron', chain: 'a chain', lock: 'a padlock', shot: 'a gunshot', empty: 'click',
    scrape: 'scratching', knock: 'two knocks on a pipe', hangers: 'coat hangers clinking', tick: 'a clock ticks', musicbox: 'a music box', birds: 'birdsong', start: 'the engine catches',
    crank: 'the starter turns', flicker: 'the bulb flickers', lampOn: 'a lamp hums on', thud: 'a thud', hiss: 'a hiss', pour: 'pouring', strike: 'a match', bar: 'a bar drops into place',
    fit: 'something clicks into place', ratchet: 'a ratchet', switch: 'a switch', keys: 'keys', load: 'the gun loads', win: 'a chord', drop: 'something set down',
    sting: 'a scream', stingShriek: 'a shriek', stingHum: 'a rising hum', stingStone: 'stone grinding', stingHit: 'a blow', stingWet: 'a wet scream', stingScrape: 'hooks on stone', stingGlass: 'glass breaking',
  };
  const STEPS = { walker: 'slow footsteps', crawler: 'scuttling', smiler: 'light footsteps', runner: 'running', climber: 'hooks on stone', shoes: 'hard heels', tall: 'a slow, heavy step' };
  const VOICES = { exhale: 'a long breath', hum: 'humming', clicks: 'clicking', pant: 'panting', slow: 'a very slow breath', gurgle: 'a gurgle' };
  const last = new Map();
  let el = null, hideAt = 0;
  function on() { return typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.settings.captions; }
  // soft: a background sound (the story's clock and hangers) that never replaces a caption still up. It is a property of
  // the call, not the sound, because the same sound can be a lane's warning on another night.
  function show(text, pan, gap, soft) {
    if (!on() || !text) return;
    const now = performance.now();
    if (soft && hideAt > now) return;
    if (last.has(text) && now - last.get(text) < (gap || 1500)) return;
    last.set(text, now);
    if (!el) el = document.getElementById('caption');
    if (!el) return;
    const side = pan < -0.3 ? '◀ ' : pan > 0.3 ? ' ▶' : '';
    el.textContent = (pan < -0.3 ? side : '') + text + (pan > 0.3 ? side : '');
    el.classList.add('show'); hideAt = now + 2200;
  }
  function update() { if (el && hideAt && performance.now() > hideAt) { el.classList.remove('show'); hideAt = 0; } }
  return { sfx: (name, pan, soft) => show(SFX[name], pan || 0, undefined, !!soft), footstep: (kind, pan) => show(STEPS[kind], pan || 0, 4000), voice: (kind, pan) => show(VOICES[kind], pan || 0, 3000), ambient: p => show(p && p.rain ? 'rain and wind' : 'wind', 0, 60000), update, show };
})();
