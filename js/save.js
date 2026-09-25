'use strict';
// ---------- saved progress and settings, versioned; migrates the v1 keys ----------
const SAVE = (() => {
  const KEY = 'itscoming.v2';
  const DIFFS = ['easy', 'normal', 'hard', 'nightmare'];
  function fresh() {
    return {
      v: 2,
      unlocked: { easy: 0, normal: 0, hard: 0, nightmare: 0 },   // highest night index reached per difficulty
      best: {},                                                  // best[levelId][diff] = { time, wins, tries }
      fragments: [],                                             // ids of fragments seen
      complete: {},                                              // complete[diff] = true once night 13 is won
      settings: { difficulty: 1, muted: false, master: 1, effects: 1, ambient: 1, reducedFlash: false, reducedMotion: false, captions: false, textSize: 1, theme: 'night' },
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
      data.unlocked.normal = u;
      if (!isNaN(d)) data.settings.difficulty = clamp(d, 0, DIFFS.length - 1);
      data.settings.muted = m;
      if (u || !isNaN(d) || m) persist();
    } catch (e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.v === 2) {
          const f = fresh();
          data = Object.assign(f, d);
          data.unlocked = Object.assign(f.unlocked, d.unlocked || {});
          data.settings = Object.assign(f.settings, d.settings || {});
          data.best = d.best || {}; data.fragments = d.fragments || []; data.complete = d.complete || {};
          return data;
        }
      }
      migrate();
    } catch (e) { data = fresh(); }
    return data;
  }
  function unlock(diff, levelIndex) { if (levelIndex > (data.unlocked[diff] || 0)) { data.unlocked[diff] = levelIndex; persist(); } }
  function entry(levelId, diff) { const b = data.best[levelId] = data.best[levelId] || {}; return b[diff] = b[diff] || { time: null, wins: 0, tries: 0 }; }
  function recordTry(levelId, diff) { entry(levelId, diff).tries++; persist(); }
  function recordWin(levelId, diff, time) { const e = entry(levelId, diff); e.wins++; if (e.time === null || time < e.time) e.time = Math.round(time * 10) / 10; persist(); }
  function seeFragment(id) { if (!data.fragments.includes(id)) { data.fragments.push(id); persist(); } }
  function setSetting(k, v) { data.settings[k] = v; persist(); }
  function markComplete(diff) { data.complete[diff] = true; persist(); }
  function reset() { data = fresh(); persist(); }
  return { load, persist, unlock, recordTry, recordWin, seeFragment, setSetting, markComplete, reset, DIFFS, get data() { return data; } };
})();
