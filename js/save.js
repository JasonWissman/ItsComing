'use strict';
// ---------- saved progress and settings, versioned; migrates the v1 keys and the older saves with several difficulties ----------
// the two reduction settings start on when the system asks for reduced motion
function prefersReduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
const SAVE = (() => {
  const KEY = 'itscoming.v2';
  // there is one game now; every difficulty there used to be is folded into it, keeping how far any of them got
  const ONLY = 'nightmare', OLD = ['easy', 'normal', 'hard', 'nightmare'];
  function fresh() {
    return {
      v: 4,
      unlocked: { nightmare: 0 },                                // highest night index reached
      complete: {},                                              // complete[diff] = true once night 13 is won
      // bestRun[diff] = { t, nights: [seconds of each night, in order] }: the fastest full run and how its time was spent
      // night by night (game.js: the run). Only the whole run is a score: there are no best times for single nights
      bestRun: {},
      // reducedMotion and reducedFlash are the two flags the game reads; Settings has one switch for both (MENU), so they
      // are always the same. reduceTextures: plainer, faster walls and floors (render.js: R.detail is its opposite)
      settings: { muted: false, master: 1, effects: 1, ambient: 1, reducedFlash: prefersReduced(), reducedMotion: prefersReduced(), captions: false, textSize: 1, theme: 'night', swipeReverse: false, reduceTextures: false },
      warned: false,                                             // the warning about flashing lights has been accepted (game.js: disclaimer)
    };
  }
  let data = fresh();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  function migrate() {
    try {
      const u = parseInt(localStorage.getItem('itscoming.unlocked') || '0', 10) || 0;
      const d = parseInt(localStorage.getItem('itscoming.difficulty'), 10);
      const m = localStorage.getItem('itscoming.muted') === '1';
      data = fresh();
      data.unlocked[ONLY] = u;
      data.settings.muted = m;
      if (u || !isNaN(d) || m) persist();
    } catch (e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && (d.v === 2 || d.v === 3)) fold(d);
        if (d && d.v === 4) {
          // defaults first, then what was stored: a key added later still gets its default for an older save
          const f = fresh();
          const unlocked = Object.assign(f.unlocked, d.unlocked || {}), settings = Object.assign(f.settings, d.settings || {});
          data = Object.assign(f, d, { unlocked, settings, complete: d.complete || {}, bestRun: runs(d.bestRun) });
          delete data.best;        // an older save's best time for each night: scores are whole runs now, and none is made up from those
          delete data.fragments;   // an older save's list of fragments seen: there are none any more
          delete data.settings.touchLeft;   // the touch buttons' side: there are no touch buttons to move any more (swipes)
          tidy(data.settings, d.settings || {});
          data.warned = d.warned === true;
          return data;
        }
      }
      migrate();
    } catch (e) { data = fresh(); }
    return data;
  }
  // the best runs as kept now; an older save kept only a full run's whole time (a number): it is still the time to beat,
  // with no breakdown (nights null: the Scores show dashes for them)
  function runs(old) {
    const out = {};
    for (const k in (old || {})) {
      const r = old[k];
      if (typeof r === 'number' && isFinite(r) && r > 0) out[k] = { t: r, nights: null };
      else if (r && typeof r.t === 'number' && isFinite(r.t) && r.t > 0) out[k] = { t: r.t, nights: Array.isArray(r.nights) ? r.nights.map(n => (typeof n === 'number' && isFinite(n) ? n : null)) : null };
    }
    return out;
  }
  // settings saved before the switches were what they are now: surface detail off is reduced textures on, and reduced
  // motion and reduced flashing (once two settings) are one, on if either was
  function tidy(S, old) {
    if (old.reduceTextures === undefined && old.textures === false) S.reduceTextures = true;
    delete S.textures;
    S.reducedMotion = S.reducedFlash = !!(S.reducedMotion || S.reducedFlash);
  }
  // a v2 save had four difficulties and a v3 save two: fold them all into the one game, keeping the furthest reached
  function fold(d) {
    const unlocked = { [ONLY]: 0 }, complete = {};
    for (const o of OLD) {
      if (d.unlocked && d.unlocked[o] !== undefined) unlocked[ONLY] = Math.max(unlocked[ONLY], d.unlocked[o] || 0);
      if (d.complete && d.complete[o]) complete[ONLY] = true;
    }
    const settings = Object.assign({}, d.settings || {}); delete settings.difficulty;
    Object.assign(d, { v: 4, unlocked, complete, settings, bestRun: {} });   // (their best times for single nights are not kept)
  }
  function unlock(diff, levelIndex) { if (levelIndex > (data.unlocked[diff] || 0)) { data.unlocked[diff] = levelIndex; persist(); } }
  // a full run finished: kept, breakdown and all, only if it is the first or faster than the best (by the whole seconds
  // shown: a run that reads the same as the best is not a new best). True if it is the new best
  function recordRun(diff, time, nights) {
    const b = data.bestRun[diff];
    if (b && Math.round(time) >= Math.round(b.t)) return false;
    data.bestRun[diff] = { t: time, nights: (nights || []).slice() };
    persist(); return true;
  }
  function setSetting(k, v) { data.settings[k] = v; persist(); }
  // Settings' Set to default: every setting as a fresh save has it (the colour theme of the screen it is on aside: that
  // is not a setting anyone sets). Nothing else: progress, the best run and the accepted warning stay
  function defaults() { const theme = data.settings.theme; data.settings = Object.assign(fresh().settings, { theme }); persist(); return data.settings; }
  function markComplete(diff) { data.complete[diff] = true; persist(); }
  function markWarned() { data.warned = true; persist(); }
  function reset() { data = fresh(); persist(); }
  return { load, persist, unlock, recordRun, setSetting, defaults, markComplete, markWarned, reset, get data() { return data; } };
})();
