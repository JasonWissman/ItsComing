// ---------- the control panel: every knob the lab exposes, bound to one settings object ----------
// Settings persist in localStorage so an experiment survives a reload. The panel is plain DOM, updated on
// change and (for the readouts) every eighth frame: it is never in the frame loop's way.
export const DEFAULTS = {
  quality: 'auto', pixelRatio: 2, shadows: true, msaa: true,
  bloom: true, bloomStrength: 0.45, bloomThreshold: 0.75, bloomRadius: 0.5, ink: false, inkStrength: 0.7,
  outline: true, outlineWidth: 2.5, steps: 3, rim: 0.3, pbr: false, jerk: true,
  grain: 0.07, vignette: 1, chroma: 0.6, fogDist: 105, mist: 0.7, moon: 1, lamp: 1, exposure: 1,
  speed: 1, gaze: true, stride: 3.64, height: 2.45,
};
const KEY = 'itscoming.lab.v1';
export function loadSettings() {
  const s = Object.assign({}, DEFAULTS);
  try { const j = JSON.parse(localStorage.getItem(KEY) || '{}'); for (const k in j) if (k in s) s[k] = j[k]; } catch (e) { void e; }
  return s;
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { void e; } }

// rows: [kind, key, label, extra]  kind: range (min, max, step), check, select (options), buttons ([[label, action, cls]])
const SECTIONS = [
  ['The thing', [
    ['buttons', null, null, [['Let it come', 'come'], ['Hold it there', 'hold'], ['Reset  R', 'reset']]],
    ['action-range', 'distance', 'distance', { min: 1.6, max: 130, step: 0.1, fmt: v => v.toFixed(1) + ' m' }],
    ['range', 'speed', 'pace ×', { min: 0.1, max: 8, step: 0.1 }],
    ['check', 'gaze', 'faster unseen'],
    ['buttons', null, null, [['Fire  F', 'fire'], ['Dissolve  X', 'dissolve'], ['Export .glb', 'export']]],
    ['note', null, 'Three shots dissolve it; it comes back. Drop a <b>.glb</b> anywhere on the page to put a modelled character in its place; <b>?model=url</b> loads one.'],
    ['select', 'model', 'model', { options: [] }],
    ['select', 'clipWalk', 'walk clip', { options: [] }],
    ['select', 'clipIdle', 'idle clip', { options: [] }],
    ['select', 'clipReach', 'reach clip', { options: [] }],
    ['range', 'stride', 'stride (m / cycle)', { min: 0.4, max: 6, step: 0.02 }],
    ['range', 'height', 'height (m)', { min: 0.5, max: 4, step: 0.01 }],
    ['check', 'jerk', 'head jerk'],
  ]],
  ['The look', [
    ['check', 'outline', 'ink outline (hull)'],
    ['range', 'outlineWidth', 'outline px', { min: 0.5, max: 8, step: 0.1 }],
    ['check', 'ink', 'ink edges (screen pass)'],
    ['range', 'inkStrength', 'edge strength', { min: 0, max: 1, step: 0.05 }],
    ['range', 'steps', 'toon bands', { min: 1, max: 8, step: 1 }],
    ['range', 'rim', 'rim light', { min: 0, max: 1.5, step: 0.05 }],
    ['check', 'pbr', 'compare: PBR character'],
    ['range', 'fogDist', 'fog distance', { min: 15, max: 300, step: 1, fmt: v => v + ' m' }],
    ['range', 'mist', 'mist', { min: 0, max: 1.5, step: 0.05 }],
    ['range', 'moon', 'moonlight', { min: 0, max: 3, step: 0.05 }],
    ['range', 'lamp', 'lamp', { min: 0, max: 3, step: 0.05 }],
    ['range', 'exposure', 'exposure', { min: 0.3, max: 2.5, step: 0.05 }],
    ['check', 'bloom', 'bloom'],
    ['range', 'bloomStrength', 'bloom strength', { min: 0, max: 2, step: 0.05 }],
    ['range', 'bloomThreshold', 'bloom threshold', { min: 0, max: 1.5, step: 0.05 }],
    ['range', 'bloomRadius', 'bloom radius', { min: 0, max: 1, step: 0.05 }],
    ['range', 'grain', 'grain', { min: 0, max: 0.3, step: 0.005 }],
    ['range', 'vignette', 'vignette', { min: 0, max: 1.5, step: 0.05 }],
    ['range', 'chroma', 'chromatic', { min: 0, max: 2, step: 0.05 }],
  ]],
  ['Quality', [
    ['select', 'quality', 'tier', { options: [['auto', 'auto (by p95)'], ['low', 'low'], ['medium', 'medium'], ['high', 'high']] }],
    ['range', 'pixelRatio', 'pixel ratio cap', { min: 0.5, max: 3, step: 0.25 }],
    ['check', 'shadows', 'moon shadows'],
    ['check', 'msaa', 'MSAA ×4'],
    ['note', null, '<b>low</b>: ratio 1, no bloom, no shadows, no edge pass, 8 mist. <b>medium</b>: ratio ≤1.5, bloom at half size. <b>high</b>: everything. <b>auto</b> drops a tier when p95 goes over 14 ms and climbs back when it stays under 7.'],
    ['buttons', null, null, [['Run bench', 'bench'], ['Reset settings', 'defaults', 'danger']]],
  ]],
  ['Readout', [
    ['stats', null, null],
    ['note', null, 'CPU ms is update + the render call on the main thread; the GPU is not measured here. Watch <b>p95</b>, not the FPS.'],
  ]],
];

export function createPanel(el, settings, api) {
  const inputs = {}, vals = {};
  const fmt = (row, v) => (row[3] && row[3].fmt ? row[3].fmt(v) : (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : String(v)));
  let html = '';
  for (const [title, rows] of SECTIONS) {
    html += '<h2>' + title + '</h2>';
    for (const row of rows) {
      const [kind, key, label, x] = row;
      if (kind === 'range' || kind === 'action-range') html += '<div class="row"><span>' + label + '</span><input type="range" data-key="' + key + '" data-kind="' + kind + '" min="' + x.min + '" max="' + x.max + '" step="' + x.step + '"><span class="val" data-val="' + key + '"></span></div>';
      else if (kind === 'check') html += '<div class="row wide"><span>' + label + '</span><input type="checkbox" data-key="' + key + '" data-kind="check"></div>';
      else if (kind === 'select') html += '<div class="row wide"><span>' + label + '</span><select data-key="' + key + '" data-kind="select">' + x.options.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join('') + '</select></div>';
      else if (kind === 'buttons') html += '<div class="btns">' + x.map(b => '<button type="button" class="mbtn' + (b[2] ? ' ' + b[2] : '') + '" data-act="' + b[1] + '">' + b[0] + '</button>').join('') + '</div>';
      else if (kind === 'note') html += '<p class="note">' + label + '</p>';
      else if (kind === 'stats') html += '<pre class="note" id="pstats" style="margin:0;white-space:pre"></pre>';
    }
  }
  el.innerHTML = html;
  el.querySelectorAll('[data-key]').forEach(inp => {
    const key = inp.dataset.key, kind = inp.dataset.kind;
    inputs[key] = inp;
    const row = SECTIONS.flatMap(s => s[1]).find(r => r[1] === key);
    vals[key] = el.querySelector('[data-val="' + key + '"]');
    const show = v => { if (vals[key]) vals[key].textContent = fmt(row, v); };
    inp.addEventListener('input', () => {
      let v;
      if (kind === 'check') v = inp.checked; else if (kind === 'select') v = inp.value; else v = parseFloat(inp.value);
      if (kind === 'action-range') { show(v); api.action(key, v); return; }
      settings[key] = v; show(v); saveSettings(settings); api.change(key, v);
    });
    // keys must not reach the game while a slider has focus (arrows move it); clicking a control then blurs it
    inp.addEventListener('change', () => inp.blur());
  });
  el.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); api.action(b.dataset.act); b.blur(); }));
  el.addEventListener('keydown', e => e.stopPropagation());
  el.addEventListener('click', e => e.stopPropagation());
  function refresh() {
    for (const key in inputs) {
      const inp = inputs[key], kind = inp.dataset.kind;
      if (!(key in settings)) continue;
      if (kind === 'check') inp.checked = !!settings[key]; else inp.value = settings[key];
      const row = SECTIONS.flatMap(s => s[1]).find(r => r[1] === key);
      if (vals[key]) vals[key].textContent = fmt(row, settings[key]);
    }
  }
  function setOptions(key, options, value) {
    const sel = inputs[key]; if (!sel) return;
    sel.innerHTML = options.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join('');
    if (value !== undefined) sel.value = value;
  }
  function setValue(key, v) { const inp = inputs[key]; if (!inp) return; inp.value = v; if (vals[key]) { const row = SECTIONS.flatMap(s => s[1]).find(r => r[1] === key); vals[key].textContent = fmt(row, v); } }
  const pstats = el.querySelector('#pstats');
  function setStats(text) { if (pstats.textContent !== text) pstats.textContent = text; }
  refresh();
  return { refresh, setOptions, setValue, setStats, show(on) { el.classList.toggle('hidden', !on); } };
}
