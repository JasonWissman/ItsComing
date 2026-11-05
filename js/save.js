'use strict';
// ---------- saved progress and settings, versioned; migrates the v1 keys and the four-difficulty v2 save ----------
// the two reduction settings start on when the system asks for reduced motion
function prefersReduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
const SAVE = (() => {
  const KEY = 'itscoming.v2';
  const DIFFS = ['normal', 'nightmare'];
  // the four difficulties there used to be, and the one each became: Easy and Normal are Normal now, Hard and Nightmare are Nightmare
  const OLD = ['easy', 'normal', 'hard', 'nightmare'], NOW = { easy: 'normal', normal: 'normal', hard: 'nightmare', nightmare: 'nightmare' };
  function fresh() {
    return {
      v: 3,
      unlocked: { normal: 0, nightmare: 0 },                     // highest night index reached per difficulty
      best: {},                                                  // best[levelId][diff] = { time, wins, tries }
      fragments: [],                                             // ids of fragments seen
      complete: {},                                              // complete[diff] = true once night 13 is won
      settings: { difficulty: 0, muted: false, master: 1, effects: 1, ambient: 1, reducedFlash: prefersReduced(), reducedMotion: prefersReduced(), captions: false, textSize: 1, theme: 'night', touchLeft: false, textures: true },
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
      if (!isNaN(d)) { const k = NOW[OLD[clamp(d, 0, OLD.length - 1)]]; data.settings.difficulty = DIFFS.indexOf(k); data.unlocked[k] = Math.max(data.unlocked[k] || 0, u); } // the difficulty they were on keeps its progress too
      data.settings.muted = m;
      if (u || !isNaN(d) || m) persist();
    } catch (e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.v === 2) fold(d);
        if (d && d.v === 3) {
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
  // a v2 save had four difficulties: fold each into the one it became, keeping the best of both
  function fold(d) {
    const unlocked = {}, best = {}, complete = {};
    for (const o of OLD) {
      const k = NOW[o];
      if (d.unlocked && d.unlocked[o] !== undefined) unlocked[k] = Math.max(unlocked[k] || 0, d.unlocked[o] || 0);
      if (d.complete && d.complete[o]) complete[k] = true;
      for (const id in (d.best || {})) {
        const e = d.best[id][o]; if (!e) continue;
        const b = (best[id] = best[id] || {}), m = b[k] || { time: null, wins: 0, tries: 0 };
        b[k] = { time: m.time === null ? e.time : (e.time === null ? m.time : Math.min(m.time, e.time)), wins: m.wins + (e.wins || 0), tries: m.tries + (e.tries || 0) };
      }
    }
    const settings = Object.assign({}, d.settings || {});
    settings.difficulty = DIFFS.indexOf(NOW[OLD[clamp(settings.difficulty | 0, 0, OLD.length - 1)]]);
    Object.assign(d, { v: 3, unlocked, best, complete, settings });
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
