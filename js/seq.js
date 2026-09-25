'use strict';
// ---------- a small beat sequencer for aftermaths, deaths and set pieces ----------
// Seq.play({ dur, beats: [{ at, sfx, shake, flash, toast, do }, { every, from, until, ... }], tick(t, dt), then(s) })
const Seq = (() => {
  const active = [];
  function play(spec) {
    const s = { spec, t: 0, done: false, stopped: false, fired: new Set(), last: new Map() };
    active.push(s);
    return s;
  }
  function fire(beat, s) {
    if (beat.sfx) AUDIO.sfx(beat.sfx, beat.pan || 0);
    if (beat.shake) G.shake(beat.shake);
    if (beat.flash) G.flash(beat.flash);
    if (beat.toast) G.toast(beat.toast);
    if (beat.do) beat.do(s.t, s);
  }
  function update(dt) {
    for (let i = active.length - 1; i >= 0; i--) {
      const s = active[i], spec = s.spec;
      if (s.stopped) { active.splice(i, 1); continue; }
      s.t += dt;
      const beats = spec.beats || [];
      for (let b = 0; b < beats.length; b++) {
        const beat = beats[b];
        if (beat.at !== undefined) {
          if (!s.fired.has(b) && s.t >= beat.at) { s.fired.add(b); fire(beat, s); }
        } else if (beat.every) {
          const from = beat.from || 0, until = beat.until === undefined ? Infinity : beat.until;
          if (s.t >= from && s.t <= until) {
            const last = s.last.has(b) ? s.last.get(b) : from - beat.every;
            if (s.t - last >= beat.every) { s.last.set(b, s.t); fire(beat, s); }
          }
        }
      }
      if (spec.tick) spec.tick(s.t, dt, s);
      if (spec.dur !== undefined && s.t >= spec.dur) {
        s.done = true; active.splice(i, 1);
        if (spec.then) spec.then(s);
      }
    }
  }
  function stop(s) { if (s) s.stopped = true; }
  function clear() { active.length = 0; }
  return { play, update, stop, clear, get count() { return active.length; } };
})();
