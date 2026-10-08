// ---------- boot, input, the frame loop, the HUD and the bench ----------
// Input mutates the model at once (no frame, no promise in between), the loop steps the model at a fixed 60 Hz
// and renders an interpolated snapshot, and the DOM is touched every eighth frame: the shape the report draws
// from Typing Dead, in miniature. window.LAB is the handle the tests drive.
import { createModel, DIR_NAMES, DEG } from './model.js';
import { createView, TIER_ORDER } from './view.js';
import { createPanel, loadSettings, saveSettings, DEFAULTS } from './panel.js';
import { download } from './loader.js';

const $ = id => document.getElementById(id);
const q = new URLSearchParams(location.search);
const settings = loadSettings();
if (q.has('quality')) settings.quality = q.get('quality');
// ?set=ink:true,outlineWidth:4,fogDist:60 overrides settings for this load: a link that reproduces an experiment
if (q.has('set')) for (const pair of q.get('set').split(',')) { const [k, raw] = pair.split(':'); if (!(k in DEFAULTS)) continue; const v = raw === 'true' ? true : raw === 'false' ? false : isNaN(parseFloat(raw)) ? raw : parseFloat(raw); settings[k] = v; }
const model = createModel();
const STEP = 1 / 60;
const LAB = { model, settings, view: null, panel: null, ready: false, noRaf: q.has('nofr'), frames: 0, benchResult: null, error: null };
window.LAB = LAB;
let view = null, panel = null, acc = 0, last = 0, paused = false, toastT = 0, goodWindows = 0;

function showError(e) {
  LAB.error = String(e && e.stack || e);
  const el = $('error'); el.style.display = 'block'; el.textContent = 'Something broke\n' + LAB.error;
  console.error(e);
}
window.addEventListener('error', e => showError(e.error || e.message));
window.addEventListener('unhandledrejection', e => showError(e.reason));

function toast(msg, dur) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); toastT = dur || 2.6; }
function overlay(html) { const el = $('overlay'); el.innerHTML = html; el.classList.toggle('show', !!html); }

// ---------------- input: straight into the model ----------------
function onKeyDown(e) {
  const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || t.tagName === 'TEXTAREA')) return;
  const k = e.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') model.turn(-1);
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') model.turn(1);
  else if (k === 'ArrowUp' || k === 'w' || k === 'W') model.look(false);
  else if (k === 'ArrowDown' || k === 's' || k === 'S') model.look(true);
  else if (k === 'Shift' || k === 'z' || k === 'Z' || k === ' ') model.zoom(true);
  else if (k === 'r' || k === 'R') action('reset');
  else if (k === 'f' || k === 'F') action('fire');
  else if (k === 'x' || k === 'X') action('dissolve');
  else if (k === 'h' || k === 'H') { settings.panelHidden = !settings.panelHidden; panel.show(!settings.panelHidden); }
  else if (k === 'p' || k === 'P') { paused = !paused; toast(paused ? 'Paused.' : 'On.'); }
  else if (k === 'b' || k === 'B') action('bench');
  else if (k === 'Escape') { if (model.state === 'caught') action('reset'); }
}
function onKeyUp(e) { const k = e.key; if (k === 'Shift' || k === 'z' || k === 'Z' || k === ' ') model.zoom(false); }
function action(act, arg) {
  switch (act) {
    case 'come': model.holdAt = null; toast('It comes.'); break;
    case 'hold': model.holdAt = model.c.dist; toast('Held at ' + model.c.dist.toFixed(1) + ' m.'); break;
    case 'reset': model.reset(); overlay(''); toast('Again.'); break;
    case 'fire': if (model.state === 'caught') action('reset'); else if (model.shoot()) { /* the view sees the event */ } break;
    case 'dissolve': model.dissolve(); break;
    case 'distance': model.setDist(arg); break;
    case 'export': view.exportCurrent().then(buf => { download(buf, (view.character.name.replace(/[^a-z0-9]+/gi, '-') || 'character') + '.glb'); toast('Exported ' + (buf.byteLength / 1024).toFixed(0) + ' KB.'); }).catch(showError); break;
    case 'bench': bench().then(r => toast('bench: p50 ' + r.p50 + ' ms, p95 ' + r.p95 + ' ms, ' + r.calls + ' draws', 6)).catch(showError); break;
    case 'defaults': Object.assign(settings, DEFAULTS); saveSettings(settings); panel.refresh(); onChange('quality'); break;
    default: break;
  }
}
function onChange(key) {
  if (key === 'quality' || key === 'pixelRatio' || key === 'msaa') view.applyTier(settings.quality === 'auto' ? view.tier : settings.quality);
  else if (key === 'model') { const cv = view.characters[+settings.model]; if (cv) { view.setCharacter(cv); syncCharacter(); } }
  else if (key === 'clipWalk' || key === 'clipIdle' || key === 'clipReach') view.character.bind(key.slice(4).toLowerCase(), settings[key]);
  else if (key === 'stride') view.character.stride = settings.stride;
  else if (key === 'height') view.character.root.scale.setScalar(settings.height / view.character.height);
  else if (key === 'speed') model.speedScale = settings.speed;
  else if (key === 'gaze') model.gazeRule = settings.gaze;
  else view.applyLook();
}
// the panel's character section follows whichever character is on the lane
function syncCharacter() {
  const cv = view.character;
  panel.setOptions('model', view.characters.map((c, i) => [String(i), c.name]), String(view.characters.indexOf(cv)));
  const names = cv.clips.map(c => [c.name, c.name]).concat([['', '(none)']]);
  for (const r of ['walk', 'idle', 'reach']) { const key = 'clip' + r[0].toUpperCase() + r.slice(1); panel.setOptions(key, names, cv.roles[r] || ''); settings[key] = cv.roles[r] || ''; }
  settings.stride = cv.stride; settings.height = cv.height * cv.root.scale.x; panel.refresh();
}

// ---------------- the loop ----------------
function advance(dt) {
  view.stats.frame(dt);
  acc += dt;
  let n = 0;
  while (acc >= STEP && n < 8) { model.step(STEP); acc -= STEP; n++; }
  if (n === 8) acc = 0;       // a long stall is not caught up on, like the game's 50 ms clamp
  const snap = model.snapshot(acc / STEP);
  const events = model.events.splice(0);
  for (const e of events) {
    if (e.type === 'dead') overlay('<h1>It got you</h1><p>It reached you after ' + Math.max(1, Math.round(model.t)) + ' second' + (Math.round(model.t) === 1 ? '' : 's') + '.</p><p class="prompt">R, Esc or click to start again</p>');
    else if (e.type === 'respawn') toast('It is back.');
    else if (e.type === 'dissolve') toast('It comes apart.');
  }
  view.render(snap, dt, events);
  LAB.frames++;
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('show'); }
  if ((LAB.frames & 7) === 0) hud(snap);
  if (LAB.frames % 120 === 0) autoTier();
}
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!paused && !document.hidden && !LAB.error) { try { advance(dt); } catch (e) { showError(e); } }
  if (!LAB.noRaf) requestAnimationFrame(tick);
}
LAB.step = (dt, n) => { for (let i = 0; i < (n || 1); i++) advance(dt === undefined ? STEP : dt); };
LAB.stepModel = (dt, n) => { for (let i = 0; i < (n || 1); i++) model.step(dt === undefined ? STEP : dt); };   // the simulation alone, no frame: fast under software GL
// auto quality: a tier down when the tail is over the frame budget, up again only after it has stayed well under
function autoTier() {
  if (settings.quality !== 'auto') return;
  const p = view.stats.pct(); if (p.n < 60) return;
  let i = TIER_ORDER.indexOf(view.tier);
  if (p.p95 > 14 && i > 0) { view.applyTier(TIER_ORDER[--i]); goodWindows = 0; toast('Quality: ' + view.tier + ' (p95 ' + p.p95.toFixed(1) + ' ms)'); view.stats.reset(); }
  else if (p.p95 < 7) { if (++goodWindows >= 4 && i < TIER_ORDER.length - 1) { view.applyTier(TIER_ORDER[++i]); goodWindows = 0; toast('Quality: ' + view.tier); view.stats.reset(); } }
  else goodWindows = 0;
}

// ---------------- HUD, every eighth frame ----------------
const compassEl = $('compass'), pitchEl = $('pitch'), zoomEl = $('zoom'), statusEl = $('status'), statsEl = $('stats');
let compassSig = '';
function hud(snap) {
  const cur = model.cam.dirIdx, sig = cur + ':' + model.state;
  if (sig !== compassSig) { compassSig = sig; let h = ''; for (let i = 0; i < 8; i++) h += '<span class="' + (i === cur ? 'cur' : '') + (i === 0 ? ' thing' : '') + '">' + DIR_NAMES[i] + '</span>'; compassEl.innerHTML = h; }
  pitchEl.textContent = model.cam.tPitch > 0.1 ? '▼ looking down' : '▲ looking ahead';
  zoomEl.style.opacity = snap.zoom > 1.2 ? 1 : 0;
  const c = model.c;
  statusEl.textContent = model.state === 'play' ? (snap.gone ? 'It is gone.' : c.dist.toFixed(1) + ' m · ' + (c.seen ? 'seen' : 'unseen, it moves faster') + (model.holdAt !== null ? ' · held' : '') + (c.dissolving ? ' · dissolving' : '')) : model.state === 'dying' ? '' : '';
  const p = view.stats.pct(), i = view.info();
  const line = 'cpu p50 ' + p.p50.toFixed(1) + ' ms  p95 ' + p.p95.toFixed(1) + ' ms  max ' + p.max.toFixed(1) + ' ms   ' + p.fps.toFixed(0) + ' fps\n' + i.calls + ' draws  ' + (i.triangles / 1000).toFixed(1) + 'k tris  ' + i.geometries + ' geo  ' + i.textures + ' tex  ' + i.programs + ' prog\n' + i.tier + ' tier  ratio ' + i.pixelRatio.toFixed(2) + '  ' + Math.round(i.width * i.pixelRatio) + '×' + Math.round(i.height * i.pixelRatio) + (i.bloom ? '  bloom' : '') + (i.ink ? '  ink' : '') + (i.shadows ? '  shadows' : '');
  statsEl.textContent = line;
  panel.setStats(line);
}

// ---------------- bench: every direction and pitch, 60 frames each, like the game's ?bench ----------------
function bench(perView) {
  const PER = perView || 60;
  return new Promise(resolve => {
    const views = []; for (let d = 0; d < 8; d++) for (const down of [false, true]) views.push({ d, down });
    const keep = { hold: model.holdAt, dist: model.c.dist };
    model.holdAt = 24; model.setDist(24);
    const samples = []; let f = 0;
    view.stats.reset();
    const run = () => {
      const v = views[Math.min(views.length - 1, Math.floor(f / PER))];
      model.cam.dirIdx = v.d; model.cam.tYaw = model.cam.yaw = v.d * 45 * DEG; model.cam.tPitch = model.cam.pitch = v.down ? 45 * DEG : 0;
      const t0 = performance.now(); advance(STEP); samples.push(performance.now() - t0);
      if (++f < views.length * PER) requestAnimationFrame(run);
      else {
        const s = samples.slice(Math.min(10, samples.length >> 2)).sort((a, b) => a - b);
        const r = { frames: s.length, mean: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2), p50: +s[Math.floor(s.length * 0.5)].toFixed(2), p95: +s[Math.floor(s.length * 0.95)].toFixed(2), max: +s[s.length - 1].toFixed(2) };
        Object.assign(r, view.info());
        model.holdAt = keep.hold; model.setDist(keep.dist);
        LAB.benchResult = r; console.log('lab bench (ms of update+render per frame)', JSON.stringify(r));
        resolve(r);
      }
    };
    requestAnimationFrame(run);
  });
}
LAB.bench = bench;

// ---------------- drop a model, or load one from the query ----------------
function bindDrop() {
  const dz = $('drop'); let depth = 0;
  window.addEventListener('dragenter', e => { e.preventDefault(); depth++; dz.classList.add('show'); });
  window.addEventListener('dragover', e => { e.preventDefault(); });
  window.addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; dz.classList.remove('show'); } });
  window.addEventListener('drop', async e => {
    e.preventDefault(); depth = 0; dz.classList.remove('show');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (!file) return;
    try { toast('Loading ' + file.name + '…'); const cv = await view.loadModel(await file.arrayBuffer(), file.name); syncCharacter(); toast(cv.name + ': ' + cv.clips.length + ' clip' + (cv.clips.length === 1 ? '' : 's') + ', ' + cv.height.toFixed(2) + ' m tall.', 4); }
    catch (err) { showError(err); }
  });
}
LAB.loadModel = async (url) => { const cv = await view.loadModel(url); syncCharacter(); return cv; };
LAB.roundtrip = async () => { const r = await view.roundtrip(); syncCharacter(); return r; };

// ---------------- boot ----------------
function boot() {
  try { view = createView({ canvas: $('view'), model, settings }); LAB.view = view; }
  catch (e) { showError(e); return; }
  panel = createPanel($('panel'), settings, { change: onChange, action }); LAB.panel = panel;
  panel.show(!settings.panelHidden && !q.has('bare'));
  if (q.has('bare')) $('hud').style.display = 'none';     // ?bare: the picture alone, for screenshots
  syncCharacter();
  model.speedScale = settings.speed; model.gazeRule = settings.gaze;
  window.addEventListener('resize', view.resize);
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => model.zoom(false));
  $('view').addEventListener('click', () => action('fire'));
  $('overlay').addEventListener('click', () => action('reset'));
  bindDrop();
  if (q.has('dist')) model.setDist(parseFloat(q.get('dist')));
  if (q.has('dir')) { const d = ((parseInt(q.get('dir'), 10) || 0) % 8 + 8) % 8; model.cam.dirIdx = d; model.cam.yaw = model.cam.tYaw = d * 45 * DEG; }   // ?dir=4 faces south
  if (q.has('down')) model.cam.pitch = model.cam.tPitch = 45 * DEG;
  if (q.has('hold')) model.holdAt = model.c.dist;
  if (q.has('model')) LAB.loadModel(q.get('model')).catch(showError);
  LAB.ready = true;
  last = performance.now();
  if (!LAB.noRaf) requestAnimationFrame(tick);
  if (q.has('bench')) setTimeout(() => bench(parseInt(q.get('bench'), 10) || 60).catch(showError), 500);
}
window.addEventListener('DOMContentLoaded', boot);
