'use strict';
// ---------- Sounds Audit: nudging a sound without touching js/audio.js ----------
// Every sound is synthesised by js/audio.js out of oscillators, noise, filters and gains, scheduled on the AudioContext's
// clock. While TWEAK.run(t, fn) runs fn (one AUDIO call), the Web Audio calls it makes are bent on the way through:
//   pitch (semitones): every oscillator's frequency (and a noise source's playback rate) and every filter's frequency
//     go up or down by that much, so tones and the colour of noise move together;
//   speed (x): every time it schedules (ramps, starts, stops, held notes) is squeezed toward or stretched away from the
//     moment it was played, so the whole sound is quicker or slower; slow wobbles (oscillators under 20 Hz) speed up
//     with it instead of following the pitch;
//   tone (octaves): every filter's frequency alone, so the sound is brighter or duller at the same pitch;
//   volume (dB): a gain put in where it joins the game's effects or ambient bus.
// A node remembers the nudge it was made under, so a value it is given later (a loop fading out) is bent the same way.
const TWEAK = (() => {
  const DEF = { pitch: 0, speed: 1, tone: 0, vol: 0 };
  let cur = null, t0 = 0, ctx = null;
  const buses = [];   // the game's effects and ambient buses (the 2nd and 3rd gains AUDIO.init makes)
  const pf = t => Math.pow(2, t.pitch / 12), ff = t => pf(t) * Math.pow(2, t.tone), gf = t => Math.pow(10, t.vol / 20);
  const isDefault = t => !t || (t.pitch === 0 && t.speed === 1 && t.tone === 0 && t.vol === 0);
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

  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
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
    wrap('createBiquadFilter', n => { mark(n.frequency, 'filt'); if (cur) n.frequency.value = 350; });
    // values and the times they are set for
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
    // the volume: a gain between what it made and the bus it joins
    const N = AudioNode.prototype, connect = N.connect;
    N.connect = function (dest, ...rest) {
      if (cur && cur.vol !== 0 && buses.includes(dest) && !this.__twGain) {
        const g = this.context.createGain(); g.__twGain = true; g.gain.value = gf(cur);
        connect.call(this, g); return connect.call(g, dest, ...rest);
      }
      return connect.call(this, dest, ...rest);
    };
  }
  // fn's Web Audio calls bent by t ({ pitch, speed, tone, vol }), as if it were played now
  function run(t, fn) {
    if (isDefault(t)) return fn();
    cur = t; t0 = ctx ? ctx.currentTime : 0;
    try { return fn(); } finally { cur = null; }
  }
  return { run, DEF, isDefault };
})();
