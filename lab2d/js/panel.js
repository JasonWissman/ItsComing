'use strict';
// ---------- the panel: every knob, bound to one settings object, persisted ----------
const PANEL = (() => {
  const KEY = 'itscoming.lab2d.v1';
  const DEFAULTS = Object.assign({
    scene: 'corridor', mode: 'approach', creature: 'grinner', lineup: 'lab', lineupDist: 24, lineupGap: 1.5,
    speed: 1, gaze: true, startDist: 40, split: false, shadow: true, hands: true, handScale: 1, item: 'lantern',
    inkEdges: 0, grain: 0.07, vignette: 0.9, danger: true, svgMode: 'raster', svgHeight: 2.0,
  }, PASSES.DEFAULTS, POST2D.DEFAULTS);
  delete DEFAULTS.inkColor; delete DEFAULTS.rimColor;
  function load() {
    const s = Object.assign({}, DEFAULTS);
    try { const j = JSON.parse(localStorage.getItem(KEY) || '{}'); for (const k in j) if (k in s) s[k] = j[k]; } catch (e) { void e; }
    return s;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { void e; } }
  const SECTIONS = [
    ['The set', [
      ['select', 'scene', 'scene', { options: [['corridor', 'the corridor'], ['field', 'the field (night 1)'], ['stage', 'a bare stage']] }],
      ['select', 'mode', 'mode', { options: [['approach', 'one thing, coming'], ['lineup', 'a line-up, standing']] }],
      ['select', 'creature', 'the thing', { options: [] }],
      ['select', 'lineup', 'line-up', { options: [['lab', 'the five new ones'], ['game', 'the game\'s thirteen'], ['all', 'all of them']] }],
      ['range', 'lineupDist', 'line-up: acts as if at', { min: 1.5, max: 40, step: 0.5, fmt: v => v + ' m' }],
      ['range', 'lineupGap', 'line-up spacing', { min: 0.8, max: 3, step: 0.1, fmt: v => v + ' m' }],
      ['buttons', null, null, [['Let it come', 'come'], ['Hold it there', 'hold'], ['Reset  R', 'reset']]],
      ['action-range', 'distance', 'distance', { min: 1.5, max: 130, step: 0.1, fmt: v => v.toFixed(1) + ' m' }],
      ['range', 'startDist', 'starts at', { min: 5, max: 130, step: 1, fmt: v => v + ' m' }],
      ['range', 'speed', 'pace ×', { min: 0.1, max: 8, step: 0.1 }],
      ['check', 'gaze', 'faster unseen'],
      ['check', 'split', 'compare: plain left, enhanced right  C'],
      ['note', null, 'Drop an <b>.svg</b> on the page and it joins the list as a creature; <b>?svg=url</b> loads one. A traced reference is hundreds of fills: the readout shows what that costs live, and as a sprite.'],
      ['select', 'svgMode', 'svg drawn as', { options: [['raster', 'a sprite, rendered once'], ['live', 'live paths, fogged per fill']] }],
      ['range', 'svgHeight', 'svg height', { min: 0.5, max: 4, step: 0.05, fmt: v => v.toFixed(2) + ' m' }],
    ]],
    ['The thing: ink', [
      ['range', 'ink', 'ink outline px', { min: 0, max: 6, step: 0.25 }],
      ['range', 'hatch', 'hatching', { min: 0, max: 1, step: 0.05 }],
      ['range', 'hatchSpacing', 'hatch spacing px', { min: 2, max: 14, step: 1 }],
      ['range', 'hatchWidth', 'hatch line px', { min: 0.5, max: 3, step: 0.1 }],
      ['range', 'tone', 'screentone', { min: 0, max: 1, step: 0.05 }],
      ['range', 'toneSize', 'tone size px', { min: 3, max: 16, step: 1 }],
      ['range', 'shadowSide', 'shadow side', { min: 0, max: 1, step: 0.05 }],
      ['range', 'rim', 'rim light', { min: 0, max: 1, step: 0.05 }],
      ['range', 'rimPx', 'rim px', { min: 1, max: 6, step: 0.5 }],
      ['range', 'lightAngle', 'light from (rad)', { min: 0, max: 6.28, step: 0.05 }],
      ['range', 'boil', 'line boil px', { min: 0, max: 3, step: 0.25 }],
      ['range', 'boilRate', 'boil rate /s', { min: 2, max: 24, step: 1 }],
      ['check', 'mono', 'monochrome, spot colour kept'],
      ['range', 'monoAmount', 'how monochrome', { min: 0, max: 1, step: 0.05 }],
      ['range', 'glow', 'glow (eyes, candles)', { min: 0, max: 3, step: 0.1 }],
      ['check', 'shadow', 'shadow on the ground'],
    ]],
    ['The set: scene passes', [
      ['range', 'inkEdges', 'ink edges on walls px', { min: 0, max: 4, step: 0.25 }],
      ['range', 'flash', 'torch circle', { min: 0, max: 1, step: 0.05 }],
      ['range', 'flashRadius', 'torch radius', { min: 0.15, max: 0.8, step: 0.01 }],
      ['range', 'flashSoft', 'torch softness', { min: 0.1, max: 2, step: 0.05 }],
      ['range', 'flashWarm', 'torch warmth', { min: 0, max: 1, step: 0.05 }],
      ['range', 'misreg', 'misregistration px', { min: 0, max: 6, step: 0.25 }],
      ['range', 'dither', 'dither', { min: 0, max: 1, step: 0.05 }],
      ['range', 'ditherScale', 'dither pixel size', { min: 2, max: 8, step: 1 }],
      ['range', 'ditherLevels', 'dither levels', { min: 2, max: 16, step: 1 }],
      ['range', 'paper', 'paper', { min: 0, max: 1, step: 0.05 }],
      ['range', 'grain', 'grain (the game\'s)', { min: 0, max: 0.3, step: 0.005 }],
      ['range', 'vignette', 'vignette (the game\'s)', { min: 0, max: 1.5, step: 0.05 }],
      ['check', 'danger', 'danger pulse (the game\'s)'],
    ]],
    ['Your hands', [
      ['check', 'hands', 'hands in view'],
      ['range', 'handScale', 'hand size', { min: 0.5, max: 1.6, step: 0.05 }],
      ['select', 'item', 'holding', { options: [['', 'nothing'], ['lantern', 'the lantern'], ['hammer', 'the hammer'], ['shotgun', 'the shotgun'], ['keys', 'the keys'], ['salt', 'the salt'], ['musicbox', 'the music box']] }],
      ['note', null, 'Click or <b>F</b>: the hands reach. In the game they would hold the active item and flinch on a hit.'],
    ]],
    ['Readout', [
      ['stats', null, null],
      ['buttons', null, null, [['Cost sweep', 'sweep'], ['Bench  B', 'bench'], ['Reset settings', 'defaults', 'danger']]],
      ['note', null, 'ms is update + render on the main thread. The sweep turns each pass on alone against a plain frame and reports what it adds; the bench sweeps every direction like the game\'s <b>?bench</b>.'],
    ]],
  ];
  function create(el, settings, api) {
    const inputs = {}, vals = {};
    const rowOf = key => { for (const s of SECTIONS) for (const r of s[1]) if (r[1] === key) return r; return null; };
    const fmt = (row, v) => (row && row[3] && row[3].fmt ? row[3].fmt(v) : (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : String(v)));
    let html = '';
    for (const [title, rows] of SECTIONS) {
      html += '<h2>' + title + '</h2>';
      for (const row of rows) {
        const [kind, key, label, x] = row;
        if (kind === 'range' || kind === 'action-range') html += '<div class="row"><span>' + label + '</span><input type="range" data-key="' + key + '" data-kind="' + kind + '" min="' + x.min + '" max="' + x.max + '" step="' + x.step + '"><span class="val" data-val="' + key + '"></span></div>';
        else if (kind === 'check') html += '<div class="row wide"><span>' + label + '</span><input type="checkbox" data-key="' + key + '" data-kind="check"></div>';
        else if (kind === 'select') html += '<div class="row wide"><span>' + label + '</span><select data-key="' + key + '" data-kind="select">' + x.options.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join('') + '</select></div>';
        else if (kind === 'buttons') html += '<div class="btns">' + x.map(b => '<button type="button" class="mbtn' + (b[2] ? ' ' + b[2] : '') + '" data-act="' + b[1] + '">' + b[0] + '</button>').join('') + '</div>';
        else if (kind === 'note') html += '<p class="note">' + (x || label) + '</p>';
        else if (kind === 'stats') html += '<pre class="note" id="pstats" style="margin:0;white-space:pre"></pre>';
      }
    }
    el.innerHTML = html;
    el.querySelectorAll('[data-key]').forEach(inp => {
      const key = inp.dataset.key, kind = inp.dataset.kind;
      inputs[key] = inp; vals[key] = el.querySelector('[data-val="' + key + '"]');
      const show = v => { if (vals[key]) vals[key].textContent = fmt(rowOf(key), v); };
      inp.addEventListener('input', () => {
        let v; if (kind === 'check') v = inp.checked; else if (kind === 'select') v = inp.value; else v = parseFloat(inp.value);
        if (kind === 'action-range') { show(v); api.action(key, v); return; }
        settings[key] = v; show(v); save(settings); api.change(key, v);
      });
      inp.addEventListener('change', () => inp.blur());
    });
    el.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); api.action(b.dataset.act); b.blur(); }));
    el.addEventListener('keydown', e => e.stopPropagation());
    el.addEventListener('click', e => e.stopPropagation());
    const pstats = el.querySelector('#pstats');
    function refresh() {
      for (const key in inputs) {
        const inp = inputs[key], kind = inp.dataset.kind;
        if (!(key in settings)) continue;
        if (kind === 'check') inp.checked = !!settings[key]; else inp.value = settings[key];
        if (vals[key]) vals[key].textContent = fmt(rowOf(key), settings[key]);
      }
    }
    function setOptions(key, options, value) { const sel = inputs[key]; if (!sel) return; sel.innerHTML = options.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join(''); if (value !== undefined) sel.value = value; }
    function setValue(key, v) { const inp = inputs[key]; if (!inp) return; inp.value = v; if (vals[key]) vals[key].textContent = fmt(rowOf(key), v); }
    function setStats(text) { if (pstats.textContent !== text) pstats.textContent = text; }
    refresh();
    return { refresh, setOptions, setValue, setStats, show(on) { el.classList.toggle('hidden', !on); } };
  }
  return { DEFAULTS, load, save, create };
})();
