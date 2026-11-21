'use strict';
// ---------- how each sound is tuned: a nudge laid over js/audio.js's own synthesis ----------
// Each sound js/audio.js makes is built from oscillators, noise, filters and gains scheduled on the AudioContext's clock.
// TUNE.run(t, fn) bends the Web Audio calls fn makes on the way through, by t = { pitch, speed, tone, vol }:
//   pitch (semitones): every oscillator's frequency (and a noise source's playback rate) and every filter's frequency
//     go up or down by that much, so tones and the colour of noise move together;
//   speed (x faster): every time it schedules (ramps, starts, stops, held notes) is squeezed toward or stretched away from
//     the moment it was played; slow wobbles (oscillators under 20 Hz) speed up with it instead of following the pitch;
//   tone (octaves): every filter's frequency alone, brighter or duller at the same pitch;
//   vol (dB): a gain put in where it joins the effects or ambient bus.
// A node remembers the nudge it was made under, so a value it is given later (a loop fading out) is bent the same way.
// Runs nest (the Sounds Audit lab, lab/sounds.html, nudges a sound on top of how it is tuned here): pitch, tone and vol
// add, speed multiplies. AUDIO looks each sound up in TUNES by its key: an effect or sting by its name, 'voice:kind',
// 'footstep:kind', 'loop:kind', 'heartbeat', and an ambient bed by the key in its params (ambient.tune, e.g. 'ambient:1').
// The values were set by ear in the Sounds Audit.
const TUNES = {
  'ambient:title': { pitch: -23.25, tone: -0.4, vol: 1 },   // (2 dB louder still far off: titleBed's own far gain)
  'footstep:shoesRun': { pitch: -12 },
  'hinge': { pitch: -11.5, speed: 1.27, tone: 2 },
  'screech': { pitch: 12, speed: 0.63, tone: -1 },
  'shadeShriek': { pitch: -3.5, speed: 0.93 },
  'growl': { pitch: -2.5, speed: 0.87, tone: 1 }, 'growl2': { pitch: 3, speed: 0.87, tone: 1 },
  'screechRage': { pitch: 12, speed: 0.63, tone: -1 },
  'ui': { pitch: -12 },
  'pickup': { pitch: -4.5 },
  'nope': { pitch: -11.5 },
  'tink': { pitch: -1.5 },
  'woodKnock': { pitch: -2.5 },
  'clatter': { pitch: -5.5 },
  'flop': { pitch: -1.5, speed: 0.79, vol: 5 },
  'pat': { pitch: -10.5, vol: 1 },
  'rattle': { pitch: -2 },
  'hiss': { pitch: -6.5 },
  'hammer': { pitch: -7 },
  'smash': { pitch: 1 },
  'bang': { pitch: 1.5, speed: 0.59, tone: 1, vol: 5 },
  'boardRattle': { pitch: -1 },
  'crack': { pitch: -2, speed: 0.56, vol: -1 },
  'thud': { pitch: -1.5, tone: 0.2, vol: 5 },
  'keys': { pitch: -9, speed: 0.81, vol: -1 },
  'crank': { pitch: -3, speed: 1.19, tone: 0.6, vol: 1 },
  'start': { pitch: -3, speed: 1.03 },
  'rev': { pitch: -5.5, tone: -0.7 },
  'lever': { pitch: -6.5, speed: 0.93, tone: 0.3, vol: -2 },
  'clunk': { pitch: -7 },
  'pour': { pitch: -6 },
  'strike': { pitch: 3.5, tone: 0.2 },
  'candle': { pitch: 1, speed: 0.62, vol: -3 },
  'chain': { pitch: -8.5 },
  'gate': { pitch: -14.5, speed: 0.64, tone: 4 },
  'creak': { pitch: -30, speed: 0.68, tone: 1 },
  'lock': { pitch: 5 },
  'scrape': { pitch: -7, speed: 1.03 },
  'bowFull': { pitch: -2.5 },
  'thunk': { pitch: 0.5 },
  'splash': { pitch: 1, speed: 0.8652, tone: -0.9, vol: -2 },
  'dive': { pitch: -3.5, speed: 0.64 },
  'wetPound': { pitch: -2, vol: 1 },
  'bar': { vol: 2 },
  'ratchet': { pitch: -11.5, tone: 1.7 },
  'fit': { pitch: -1.5 },
  'lampOn': { pitch: -2 },
  'thunder': { pitch: 4, tone: 1.6, vol: 4 },
  'glassTap': { pitch: -1.5 },
  'shutterBang': { pitch: -8, vol: 4 },
  'receiver': { pitch: -2 },
  'dial': { pitch: -4 },
  'keyClick': { pitch: 1.5, vol: 2 },
  'coin': { pitch: -1 },
  'coinReturn': { pitch: -1.5 },
  'answer': { pitch: -2.5 },
  'lampBreak': { pitch: -9, speed: 1.37, vol: -5 },
  'carCome': { pitch: -3 },
  'brake': { pitch: -2.5 },
  'horn': { pitch: -8.5 },
  'carDoor': { pitch: -10 },
  'musicbox': { pitch: -11.5, speed: 0.93 },
  'musicTurn': { pitch: -11.5 },
  'musicSour': { pitch: -11.5 },
  'breakerTrip': { pitch: -0.5 },
  'switch': { pitch: -12 },
  'drawer': { pitch: -6.5 },
  'cloth': { pitch: -4 },
  'tug': { pitch: -9 },
  'flicker': { pitch: -6 },
  'tick': { pitch: -34.5 },   // (14 semitones up on the -48.5 it was set to by ear: the ten ticks at the start of a night carry better)
  'knock': { pitch: -4 },
  'hangers': { pitch: -13.5 },
  'birds': { pitch: 3 },
  'win': { pitch: -3 },
  'bell': { pitch: -2 },
  'phoneRing': { pitch: -3 },
  'wetThud': { pitch: -3.5 },
  'sting': { pitch: -3.5, speed: 0.71 },
  'stingShriek': { pitch: 9, speed: 0.57 },
  'stingHum': { pitch: -7.5, speed: 0.87, tone: -1.9, vol: 9 },
  'stingStone': { pitch: -9, speed: 0.71 },
  'stingHit': { pitch: -5, speed: 0.66, tone: 1.3 },
  'stingWet': { pitch: 8, speed: 0.73 },
  'stingScrape': { pitch: 10, speed: 0.68, tone: -1.6 },
  'stingGlass': { pitch: 3, speed: 0.87, tone: -0.5, vol: 4 },
  'voice:exhale': { pitch: -2.5, vol: 7 },
  'voice:clicks': { speed: 0.97 },
  'voice:hum': { pitch: -5.5 },
  'voice:pant': { pitch: -18.5, vol: 4 },
  'voice:gurgle': { pitch: -0.5, vol: 1 },
  'voice:slow': { pitch: -7, speed: 1.68, tone: 1.7, vol: 3 },
  'footstep:walker': { pitch: -2, tone: 1.1, vol: 8 },
  'footstep:crawler': { pitch: -1.5, speed: 1.27, vol: 5 },
  'footstep:smiler': { pitch: -1, speed: 1.52 },
  'footstep:runner': { pitch: 0.5, vol: 8 },
  'footstep:climber': { pitch: -12 },
  'footstep:shoes': { pitch: -10.5, speed: 0.537, vol: -9, tone: -2 },
  'footstep:tall': { vol: 17 },
  'loop:grind': { pitch: -12, tone: -0.4, speed: 0.87 },
  'heartbeat': { pitch: -0.5, vol: 1 },
  'ambient:1': { pitch: -5, vol: -2 },
  'ambient:2': { pitch: -9, vol: -2 },
  'ambient:3': { vol: -2 },
  'ambient:4': { vol: -2 },
  'ambient:5': { pitch: -7, vol: -2 },
  'ambient:6': { pitch: -12, vol: -2 },
  'ambient:7': { pitch: -7.5, vol: -9 },
  'ambient:8': { pitch: 1, vol: -2 },
  'ambient:8off': { pitch: -1.5, vol: -2 },
  'ambient:9': { pitch: -10.5, vol: -2 },
  'ambient:10': { pitch: 2.5, vol: -2 },
  'ambient:11': { vol: -2 },
  'ambient:12': { pitch: -6.5, vol: 6 },
  'ambient:13': { pitch: -4.5, tone: -1.3, vol: 6 },
  'ambient:13dawn': { pitch: 12, vol: -3 },
};
const TUNE = (() => {
  const DEF = { pitch: 0, speed: 1, tone: 0, vol: 0 };
  let cur = null, t0 = 0, ctx = null;
  const buses = [];   // the effects and ambient buses: the 2nd and 3rd gains AUDIO.init makes (after the master)
  const pf = t => Math.pow(2, t.pitch / 12), ff = t => pf(t) * Math.pow(2, t.tone), gf = t => Math.pow(10, t.vol / 20);
  const isDefault = t => !t || (t.pitch === 0 && t.speed === 1 && t.tone === 0 && t.vol === 0);
  const full = t => Object.assign({}, DEF, t);
  // the tune for a sound's key (or a tune itself), filled out
  const of = k => (typeof k === 'string' ? (TUNES[k] ? full(TUNES[k]) : null) : k ? full(k) : null);
  // how a value is bent for the part it plays: 'osc' an oscillator's frequency, 'rate' a noise source's playback rate,
  // 'filt' a filter's frequency
  function bend(p, v) {
    const k = p.__tw;
    if (!k || isDefault(k.t)) return v;
    if (k.role === 'filt') return v * ff(k.t);
    if (k.role === 'rate') return v * pf(k.t);
    if (k.role === 'osc') return Math.abs(v) < 20 ? v * k.t.speed : v * pf(k.t);   // (a slow wobble keeps time instead)
    return v;
  }
  const when = t => (cur && cur.speed !== 1 && t > t0 ? t0 + (t - t0) / cur.speed : t);
  const dur = d => (cur && cur.speed !== 1 ? d / cur.speed : d);

  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (AC && typeof AudioParam !== 'undefined') {
    const B = Object.getPrototypeOf(AC.prototype);   // BaseAudioContext, where the create* methods live
    const mark = (param, role) => { if (cur && param) param.__tw = { role, t: cur }; };
    const wrap = (name, after) => {
      const f = B[name] || AC.prototype[name];
      if (!f) return;
      B[name] = function (...a) { ctx = this; const n = f.apply(this, a); after(n, this); return n; };
    };
    let gains = 0;
    wrap('createGain', n => { gains++; if (gains === 2 || gains === 3) buses.push(n); });
    wrap('createOscillator', n => { mark(n.frequency, 'osc'); if (cur) n.frequency.value = 440; });   // (440: its default, bent)
    wrap('createBufferSource', n => mark(n.playbackRate, 'rate'));
    wrap('createBiquadFilter', n => { mark(n.frequency, 'filt'); if (cur) n.frequency.value = 350; });   // (350: its default)
    const P = AudioParam.prototype, val = Object.getOwnPropertyDescriptor(P, 'value');
    Object.defineProperty(P, 'value', { configurable: true, enumerable: val.enumerable, get() { return val.get.call(this); }, set(v) { val.set.call(this, bend(this, v)); } });
    const sv = P.setValueAtTime, lr = P.linearRampToValueAtTime, er = P.exponentialRampToValueAtTime, st = P.setTargetAtTime, sc = P.setValueCurveAtTime, cs = P.cancelScheduledValues;
    P.setValueAtTime = function (v, t) { return sv.call(this, bend(this, v), when(t)); };
    P.linearRampToValueAtTime = function (v, t) { return lr.call(this, bend(this, v), when(t)); };
    P.exponentialRampToValueAtTime = function (v, t) { return er.call(this, bend(this, v), when(t)); };
    P.setTargetAtTime = function (v, t, c) { return st.call(this, bend(this, v), when(t), dur(c)); };
    if (sc) P.setValueCurveAtTime = function (c, t, d) { return sc.call(this, Float32Array.from(c, v => bend(this, v)), when(t), dur(d)); };
    P.cancelScheduledValues = function (t) { return cs.call(this, when(t)); };
    const S = (window.AudioScheduledSourceNode || AudioBufferSourceNode).prototype, start = S.start, stop = S.stop;
    S.start = function (t, off, d) { const a = [t === undefined ? 0 : when(t)]; if (off !== undefined) a.push(off); if (d !== undefined) a.push(dur(d)); return start.apply(this, a); };
    S.stop = function (t) { return stop.call(this, t === undefined ? 0 : when(t)); };
    // the volume: a gain between what it made and the bus it joins (or a gain marked __tuneBus, standing in for one:
    // the volume calibration's, js/audio.js calibrate)
    const N = AudioNode.prototype, connect = N.connect;
    N.connect = function (dest, ...rest) {
      if (cur && cur.vol !== 0 && (buses.includes(dest) || dest.__tuneBus)) {
        const g = this.context.createGain(); g.gain.value = gf(cur);
        connect.call(this, g); return connect.call(g, dest, ...rest);
      }
      return connect.call(this, dest, ...rest);
    };
  }
  // fn's Web Audio calls bent by t (a tune, or a sound's key in TUNES), on top of any run it is inside
  function run(t, fn) {
    t = of(t);
    if (isDefault(t)) return fn();
    const was = cur, wasT0 = t0;
    cur = was ? { pitch: was.pitch + t.pitch, speed: was.speed * t.speed, tone: was.tone + t.tone, vol: was.vol + t.vol } : t;
    if (!was) t0 = ctx ? ctx.currentTime : 0;
    try { return fn(); } finally { cur = was; t0 = wasT0; }
  }
  return { run, of, DEF, isDefault };
})();
