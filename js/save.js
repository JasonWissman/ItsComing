'use strict';
// ---------- saved progress and settings, versioned; migrates the v1 keys and the older saves with several difficulties ----------
// the two reduction settings start on when the system asks for reduced motion
function prefersReduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
const SAVE = (() => {
  const KEY = 'itscoming.v2';
  // The two volumes (Settings, Volume, Calibrate): the effects and the ambience, each a slider, 0 to 1 (there is no main
  // volume over them any more). The text size: Smaller, Normal or Bigger. Smaller is what Normal was (1), Normal what
  // Bigger was (1.4), and Bigger larger again
  const TEXT_SIZES = [['Smaller', 1], ['Normal', 1.4], ['Bigger', 1.8]];
  const TEXT_NORMAL = 1.4;
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
      settings: { muted: false, effects: 1, ambient: 1, reducedFlash: prefersReduced(), reducedMotion: prefersReduced(), captions: false, textSize: TEXT_NORMAL, theme: 'night', swipeReverse: false, reduceTextures: false },
      warned: false,                                             // the warning about flashing lights has been accepted (game.js: disclaimer)
      eggs: {},                                                  // eggs[night id] = true once that night's easter egg has been found (game.js: foundEgg; Scores)
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
          const folded = tidy(data.settings, d.settings || {});
          data.warned = d.warned === true;
          data.eggs = {}; for (const k in (d.eggs || {})) if (d.eggs[k] === true) data.eggs[k] = true;
          if (folded) persist();
          return data;
        }
      }
      migrate();
    } catch (e) { data = fresh(); }
    return data;
  }
  // the best runs as kept now: a whole time and every night's time in it. Anything else an older save kept (a whole time
  // alone, or a run with nights missing) is dropped: there was no release before this, so nothing is lost
  function runs(old) {
    const out = {}, num = n => typeof n === 'number' && isFinite(n) && n >= 0;
    for (const k in (old || {})) {
      const r = old[k];
      if (r && num(r.t) && r.t > 0 && Array.isArray(r.nights) && r.nights.length && r.nights.every(num)) out[k] = { t: r.t, nights: r.nights.slice() };
    }
    return out;
  }
  // settings saved before the switches were what they are now: surface detail off is reduced textures on, and reduced
  // motion and reduced flashing (once two settings) are one, on if either was
  // (and from when there was a main volume over the effects and the ambience, each of those Normal or Quieter, or before
  // that a slider: the main volume is gone, folded into the two, so each is the main volume times its own (Quieter is
  // half: 50% under a main volume at 100%). The text size to the nearest of its sizes now; a save from before they moved
  // up keeps its size's name (below). True if a main volume
  // was folded in, so the save is written again without it)
  function tidy(S, old) {
    if (old.reduceTextures === undefined && old.textures === false) S.reduceTextures = true;
    delete S.textures;
    S.reducedMotion = S.reducedFlash = !!(S.reducedMotion || S.reducedFlash);
    const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d), vol = v => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;
    const main = 'master' in old ? Math.min(1, Math.max(0, num(old.master, 1))) : 1;
    S.effects = vol(main * num(S.effects, 1)); S.ambient = vol(main * num(S.ambient, 1));
    delete S.master;
    // (a save from before the sizes moved up, the one with a main volume, keeps its size's name: Smaller, Normal or Bigger,
    // each now the bigger size it names)
    const ts = num(S.textSize, TEXT_NORMAL);
    const OLD = [['Smaller', 0.85], ['Normal', 1], ['Bigger', 1.4]];
    S.textSize = typeof S.textSize !== 'number' || !isFinite(S.textSize) ? TEXT_NORMAL : 'master' in old ? TEXT_SIZES[OLD.findIndex(o => o[1] === nearest(OLD, ts))][1] : nearest(TEXT_SIZES, ts);
    return 'master' in old;
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
  // the value of the choice nearest v (choices: [[label, value], ...])
  function nearest(choices, v) { let best = choices[0][1]; for (const [, c] of choices) if (Math.abs(c - v) < Math.abs(best - v)) best = c; return best; }
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
  // a night's easter egg found (id: the night's id): kept; true if it was not known before
  function egg(id) { if (!id || data.eggs[id]) return false; data.eggs[id] = true; persist(); return true; }
  function reset() { data = fresh(); persist(); }
  return { load, persist, unlock, recordRun, setSetting, defaults, markComplete, markWarned, egg, reset, nearest, TEXT_SIZES, get data() { return data; } };
})();
