'use strict';
// ---------- saved progress and settings, versioned; migrates the v1 keys and the older saves with several difficulties ----------
// the two reduction settings start on when the system asks for reduced motion
function prefersReduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
const SAVE = (() => {
  const KEY = 'itscoming.v2';
  // there is one game now; every difficulty there used to be is folded into it, keeping the best of each
  const ONLY = 'nightmare', OLD = ['easy', 'normal', 'hard', 'nightmare'];
  function fresh() {
    return {
      v: 4,
      unlocked: { nightmare: 0 },                                // highest night index reached
      best: {},                                                  // best[levelId][diff] = { time, wins, tries }
      fragments: [],                                             // ids of fragments seen
      complete: {},                                              // complete[diff] = true once night 13 is won
      settings: { muted: false, master: 1, effects: 1, ambient: 1, reducedFlash: prefersReduced(), reducedMotion: prefersReduced(), captions: false, textSize: 1, theme: 'night', touchLeft: false, textures: true },
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
          data = Object.assign(f, d, { unlocked, settings, best: d.best || {}, fragments: d.fragments || [], complete: d.complete || {} });
          return data;
        }
      }
      migrate();
    } catch (e) { data = fresh(); }
    return data;
  }
  // a v2 save had four difficulties and a v3 save two: fold them all into the one game, keeping the best of each
  function fold(d) {
    const unlocked = { [ONLY]: 0 }, best = {}, complete = {};
    for (const o of OLD) {
      if (d.unlocked && d.unlocked[o] !== undefined) unlocked[ONLY] = Math.max(unlocked[ONLY], d.unlocked[o] || 0);
      if (d.complete && d.complete[o]) complete[ONLY] = true;
      for (const id in (d.best || {})) {
        const e = d.best[id][o]; if (!e) continue;
        const b = (best[id] = best[id] || {}), m = b[ONLY] || { time: null, wins: 0, tries: 0 };
        b[ONLY] = { time: m.time === null ? e.time : (e.time === null ? m.time : Math.min(m.time, e.time)), wins: m.wins + (e.wins || 0), tries: m.tries + (e.tries || 0) };
      }
    }
    const settings = Object.assign({}, d.settings || {}); delete settings.difficulty;
    Object.assign(d, { v: 4, unlocked, best, complete, settings });
  }
  function unlock(diff, levelIndex) { if (levelIndex > (data.unlocked[diff] || 0)) { data.unlocked[diff] = levelIndex; persist(); } }
  function entry(levelId, diff) { const b = data.best[levelId] = data.best[levelId] || {}; return b[diff] = b[diff] || { time: null, wins: 0, tries: 0 }; }
  function recordTry(levelId, diff) { entry(levelId, diff).tries++; persist(); }
  function recordWin(levelId, diff, time) { const e = entry(levelId, diff); e.wins++; if (e.time === null || time < e.time) e.time = Math.round(time * 10) / 10; persist(); }
  function seeFragment(id) { if (!data.fragments.includes(id)) { data.fragments.push(id); persist(); } }
  function setSetting(k, v) { data.settings[k] = v; persist(); }
  function markComplete(diff) { data.complete[diff] = true; persist(); }
  function reset() { data = fresh(); persist(); }
  return { load, persist, unlock, recordTry, recordWin, seeFragment, setSetting, markComplete, reset, get data() { return data; } };
})();
