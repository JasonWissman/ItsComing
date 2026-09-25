'use strict';
// ---------- game state, input, interaction, HUD and the main loop ----------
const PITCH_DOWN = 58 * DEG;
const DIR_NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// difficulty is a table of knobs read by buildLevel and by each night's build(L) through L.tier()
const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', desc: 'It comes slower. Hints on.', tier: 0, time: 1.35, unseen: 0.85, hints: true, steps: 0, lane: 'default', tick: true, variance: 0.05, decoys: 0, hardShots: false },
  { id: 'normal', name: 'Normal', desc: 'As intended. No hints.', tier: 1, time: 1.0, unseen: 1.0, hints: false, steps: 0, lane: 'default', tick: true, variance: 0.1, decoys: 0, hardShots: false },
  { id: 'hard', name: 'Hard', desc: 'Faster, an extra step, and it may come another way. No hints.', tier: 2, time: 0.72, unseen: 1.25, hints: false, steps: 1, lane: 'seeded', tick: true, variance: 0.1, decoys: 0, hardShots: true },
  { id: 'nightmare', name: 'Nightmare', desc: 'Much less time, two extra steps, no compass mark. It comes from wherever it likes.', tier: 3, time: 0.6, unseen: 1.4, hints: false, steps: 2, lane: 'random', tick: false, variance: 0.15, decoys: 1, hardShots: true, laneSwitch: true },
];

const G = {
  state: 'title', levelIndex: 0, L: null,
  cam: { yaw: 0, pitch: 0, zoom: 1, tYaw: 0, tPitch: 0, dirIdx: 0, zoomHeld: false, shakeX: 0, shakeY: 0 },
  inv: [], active: 0, hover: null, mouse: { x: -1, y: -1 }, holding: null, throwing: null,
  t: 0, stateT: 0, shakeAmt: 0, flashAmt: 0, fade: 1, fadeTarget: 0, danger: 0,
  hb: { next: 0, last: -10 }, toastT: 0, lastToast: { msg: '', t: -10 }, invSig: '', debug: false, paused: false,
  difficulty: 1, muted: false, seed: null, runSeed: 0, attempt: 0, overlayArmed: 0, error: null, errorCount: 0, fps: 60,
  shake(a) { G.shakeAmt = Math.max(G.shakeAmt, a); },
  flash(a) { G.flashAmt = Math.max(G.flashAmt, a); },
  hasItem(id) { return G.inv.some(i => i.id === id); },
  removeFromInv(it) { const i = G.inv.indexOf(it); if (i >= 0) G.inv.splice(i, 1); if (G.active >= G.inv.length) G.active = Math.max(0, G.inv.length - 1); },
  toast(msg, dur) { const el = UI.toast; el.textContent = msg; el.classList.add('show'); G.toastT = dur || 2.6; G.lastToast = { msg, t: G.t }; },
  diff() { return DIFFICULTIES[G.difficulty]; },
  hints() { return DIFFICULTIES[G.difficulty].hints; },
  // the one place hints-mode is consulted for feedback text
  say(specific, vague, dur) { G.toast(G.hints() ? specific : (vague === undefined ? specific : vague), dur); },
  get unlocked() { return SAVE.data.unlocked[G.diff().id] || 0; },
};

const UI = {};
function $(id) { return document.getElementById(id); }

// ---------------- level construction ----------------
function pickLane(def, diff, L) {
  const n = L.lanes.length;
  if (n === 1) return 0;
  const mode = diff.tier === 0 ? 'default' : (def.laneMode || diff.lane);
  if (mode === 'default') { const d = L.lanes.findIndex(l => l.default); return d >= 0 ? d : 0; }
  return Math.floor(L.rand() * n);
}
function makeCreature(L, cd, k) {
  const CR = CREATURES[cd.type];
  if (!CR) throw new Error('unknown creature type "' + cd.type + '" in ' + L.def.id);
  const diff = L.diff;
  const vDist = 1 - diff.variance + L.rand() * 2 * diff.variance, vTime = 1 - diff.variance * 0.7 + L.rand() * 1.4 * diff.variance;
  const lane = L.lanes[cd.lane !== undefined ? cd.lane : L.laneIdx];
  const c = {
    type: cd.type, CR, lane, yaw: lane.yaw, idx: k,
    D0: cd.startDist * vDist, T: cd.time * diff.time * vTime, gamma: cd.gamma || 0.72,
    seenMult: cd.seenMult === undefined ? 1 : cd.seenMult, unseenMult: (cd.unseenMult === undefined ? 1.3 : cd.unseenMult) * diff.unseen,
    u: 0, dist: 0, gait: 0, t: 0, seen: true, seenLast: true, visFrac: 1, visible: true, lit: 0, lat: 0, yOff: 0, lunge: 0,
    frozen: false, reached: false, rect: null, hits: 0, dead: false, moving: false,
    timeScale: CR.timeScale || 1, rand: mulberry32((L.rand() * 4294967295) >>> 0), distFn: null, hold: null,
    catchDist: cd.catchDist || CR.catchDist,
    retarget(laneIdx) { const ln = L.lanes[laneIdx]; if (ln) { this.lane = ln; this.yaw = ln.yaw; } },
    pos() { return APPROACH.position(this.lane, this.dist, this.lat, L.eyeH); },
  };
  c.dist = c.D0;
  CR.init(c);
  return c;
}
function buildLevel(i) {
  const def = LEVELS[i], diff = DIFFICULTIES[G.difficulty];
  G.attempt++;
  const rand = mulberry32((G.runSeed * 7919 + i * 131 + G.attempt * 17) >>> 0);
  const L = {
    def, index: i, night: i + 1, t: 0, facing: def.facing * DEG, eyeH: def.eyeH || 1.65, pal: def.pal, diff,
    props: [], items: [], targets: [], creatures: [], recipes: [], s: {}, won: false, aftermathT: 0, after: null,
    rand, usedSpots: new Set(), placed: [],
    floor: { poly: def.floor ? def.floor.poly : null, y: def.floor && def.floor.y !== undefined ? def.floor.y : (def.floorY || 0) },
  };
  L.flags = L.s;   // older nights call it flags
  L.tier = (n, h, nm) => diff.tier >= 3 ? (nm !== undefined ? nm : (h !== undefined ? h : n)) : diff.tier === 2 ? (h !== undefined ? h : n) : n;
  L.extra = (minTier, fn) => { if (diff.tier >= minTier) fn(L); };
  L.pt = (x, y, z) => { const r = rotY(x, z, L.facing); return [r[0], y, r[1]]; };
  L.at = (deg, dist, y) => L.pt(Math.sin(deg * DEG) * dist, y, Math.cos(deg * DEG) * dist);
  L.text = Object.assign({ intro: def.intro || '', hint: def.hint || '', objective: def.objective || '', death: {}, win: '', fragment: '' }, def.text || {});
  if (typeof L.text.death === 'string') L.text.death = { default: L.text.death };
  const laneDefs = def.lanes && def.lanes.length ? def.lanes : [{ deg: 0 }];
  L.lanes = laneDefs.map((ld, k) => APPROACH.makeLane(L, ld, k));
  L.laneIdx = pickLane(def, diff, L);
  L.lane = L.lanes[L.laneIdx];
  L.addAperture = (laneIdx, ap) => { L.lanes[laneIdx].apertures.push(ap); return ap; };
  def.build(L);
  if (L.aftermathText && !(def.text && def.text.win)) L.text.win = L.aftermathText;
  if (L.floorY !== undefined && !def.floor) L.floor.y = L.floorY;
  const cds = def.creatures && def.creatures.length ? def.creatures : [def.creature];
  cds.forEach((cd, k) => L.creatures.push(makeCreature(L, cd, k)));
  L.creature = L.creatures[0];
  if (L.barrierDist === undefined) L.barrierDist = L.lane.barrierDist || 0;
  L.uses = def.uses || L.uses || [];
  if (def.startInv) for (const id of def.startInv) { const it = L.items.find(x => x.id === id); if (it) { it.taken = true; G.inv.push(it); } }
  return L;
}
// the whole content set, checked for problems: run under ?debug and from the tests
function validateContent() {
  const problems = [];
  const keep = { difficulty: G.difficulty, attempt: G.attempt, inv: G.inv };
  G.inv = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const def = LEVELS[i];
    try {
      const L = buildLevel(i);
      if (!L.creatures.length) problems.push(def.id + ': no creature');
      if (!L.isWon) problems.push(def.id + ': no isWon');
      for (const it of L.items) if (typeof it.icon !== 'function') problems.push(def.id + ': item ' + it.id + ' has no icon');
      for (const lane of L.lanes) for (const p of APPROACH.validateLane(L, lane)) problems.push(def.id + ': lane ' + p.lane + ' not fully visible at ' + p.dist + ' m (' + p.frac + ') for ' + p.creature + ' at ' + p.viewport);
      if (def.aftermath && !AFTERMATHS[def.aftermath.type]) problems.push(def.id + ': unknown aftermath ' + def.aftermath.type);
      if (L.onEnd) L.onEnd();
    } catch (e) { problems.push(def.id + ': build threw ' + e.message); }
  }
  G.difficulty = keep.difficulty; G.attempt = keep.attempt; G.inv = keep.inv;
  return problems;
}

function startLevel(i, withCard) {
  if (G.L && G.L.onEnd) G.L.onEnd();
  AUDIO.stopLoop(); Seq.clear();
  G.levelIndex = i;
  G.inv = []; G.active = 0; G.hover = null; G.invSig = ''; G.holding = null; G.throwing = null; G.error = null;
  G.L = buildLevel(i);
  const c = G.cam;
  c.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8;
  c.tYaw = c.yaw = c.dirIdx * 45 * DEG; c.tPitch = c.pitch = 0; c.zoom = 1; c.zoomHeld = false;
  G.hb.next = 0; G.hb.last = -10; G.danger = 0; G.shakeAmt = 0; G.flashAmt = 0;
  G.fade = 1; G.fadeTarget = 0;
  if (withCard) {
    setState('card');
    const d = G.diff(), T = G.L.text;
    showOverlay('<div class="kicker">Night ' + (i + 1) + ' of ' + LEVELS.length + ' &middot; ' + d.name + '</div><h1>' + G.L.def.title + '</h1><p class="intro">' + T.intro + (d.hints && T.hint ? '<br>' + T.hint : '') + '</p>' + (d.hints && T.objective ? '<p class="hint">' + T.objective + '</p>' : '') + '<p class="prompt">Click or press Enter when you are ready</p>');
  } else {
    setState('play');
    hideOverlay();
    beginPlay();
  }
}
function beginPlay() {
  const L = G.L;
  L.t = 0; for (const c of L.creatures) c.t = 0;
  if (AUDIO.on()) { AUDIO.resume(); AUDIO.startAmbient(L.def.ambient); }
  G.fadeTarget = 0;
}
function setState(s) { G.state = s; G.stateT = 0; }

// ---------------- overlays ----------------
function showOverlay(html) { UI.overlay.innerHTML = html; UI.overlay.classList.add('show'); UI.hud.classList.add('dim'); G.overlayArmed = G.t + 0.15; }
function hideOverlay() { UI.overlay.classList.remove('show'); UI.hud.classList.remove('dim'); }
function escapeHtml(s) { return String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch])); }
function showTitle() {
  if (G.L && G.L.onEnd) G.L.onEnd();
  AUDIO.stopAmbient(); AUDIO.stopLoop(); Seq.clear();
  G.inv = [];
  G.L = buildLevel(0);
  const c = G.cam; c.tYaw = c.yaw = 0; c.tPitch = c.pitch = 0; c.zoom = 1;
  G.fade = 0.35; G.fadeTarget = 0.35;
  setState('title');
  renderTitle();
}
function renderTitle() {
  const unlocked = G.unlocked;
  let cont = '';
  if (unlocked > 0 && unlocked < LEVELS.length) cont = '<p class="prompt">Press Enter or click to begin from the start<br><span class="alt"><button type="button" class="linkbtn" data-continue="1">Continue from night ' + (unlocked + 1) + ' &mdash; ' + LEVELS[unlocked].title + '</button> (or press <b>C</b>)</span></p>';
  else cont = '<p class="prompt">Press Enter or click to begin</p>';
  const diffs = '<div class="diffs">' + DIFFICULTIES.map((d, i) => '<button type="button" class="diff' + (i === G.difficulty ? ' sel' : '') + '" data-diff="' + i + '"><span class="key">' + (i + 1) + '</span>' + d.name + '<small>' + d.desc + '</small></button>').join('') + '</div>';
  showOverlay(
    '<div class="kicker">A short horror game</div><h1 class="big">IT\'S COMING</h1>' +
    '<p class="intro">Something is coming straight at you from a long way off. Every time you look away and look back, it is closer.<br>You have to look away to find what will keep it out.</p>' +
    '<div class="controls"><div><b>← →</b> turn (8 directions)</div><div><b>↑ ↓</b> look ahead / look down</div><div><b>hold Shift</b> zoom in</div><div><b>click</b> pick up, place, use</div><div><b>R</b> restart the night</div><div><b>Esc</b> pause &nbsp; <b>M</b> mute</div></div>' +
    diffs + cont + '<p class="fine">Headphones recommended. Sound is synthesized in your browser.</p>'
  );
}
function showEnd() {
  setState('end');
  showOverlay('<div class="kicker">The end</div><h1>You saw all of them</h1><p class="intro">' + LEVELS.length + ' nights. ' + LEVELS.length + ' things that came straight at you, and none of them got there.<br>You will keep checking the field, though. And the road. And the tree line.</p><p class="prompt">Press Enter or click to go back to the beginning</p>');
}

// ---------------- input ----------------
function onKeyDown(e) {
  const k = e.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (k === 'm' || k === 'M') { toggleMute(); return; }
  if ((k === 'r' || k === 'R') && G.state !== 'title' && G.state !== 'end' && G.state !== 'card') { restartLevel(); return; }
  if (k === 'Escape') { if (G.state === 'play') pauseGame(); else if (G.state === 'paused') resumeGame(); return; }
  if (G.state === 'title' && k >= '1' && k <= String(DIFFICULTIES.length)) { setDifficulty(k.charCodeAt(0) - 49); return; }
  if (G.state !== 'play') {
    if (k === 'Enter') proceed();
    if ((k === 'c' || k === 'C') && G.state === 'title' && G.unlocked > 0 && G.unlocked < LEVELS.length) { ensureAudio(); startLevel(G.unlocked, true); }
    if (k === 'Shift' || k === 'z' || k === 'Z' || k === ' ') G.cam.zoomHeld = true;
    return;
  }
  const c = G.cam;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') { c.dirIdx = (c.dirIdx + 7) % 8; c.tYaw = c.yaw + wrapPi(c.dirIdx * 45 * DEG - c.yaw); }
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') { c.dirIdx = (c.dirIdx + 1) % 8; c.tYaw = c.yaw + wrapPi(c.dirIdx * 45 * DEG - c.yaw); }
  else if (k === 'ArrowUp' || k === 'w' || k === 'W') c.tPitch = 0;
  else if (k === 'ArrowDown' || k === 's' || k === 'S') c.tPitch = PITCH_DOWN;
  else if (k === 'Shift' || k === 'z' || k === 'Z' || k === ' ') c.zoomHeld = true;
  else if (k >= '1' && k <= '6') { const n = k.charCodeAt(0) - 49; if (n < G.inv.length) { G.active = n; AUDIO.sfx('ui'); } }
  else if (k === 'Tab') { e.preventDefault(); if (G.inv.length) { G.active = (G.active + 1) % G.inv.length; AUDIO.sfx('ui'); } }
}
function onKeyUp(e) { const k = e.key; if (k === 'Shift' || k === 'z' || k === 'Z' || k === ' ') G.cam.zoomHeld = false; }
function ensureAudio() { if (!AUDIO.on()) AUDIO.init(); AUDIO.resume(); }
function toggleMute() { setMuted(!G.muted); }
function setMuted(m) {
  G.muted = !!m;
  AUDIO.setMuted(G.muted);
  UI.mute.textContent = G.muted ? 'muted (M)' : 'sound on (M)';
  UI.mute.classList.toggle('off', G.muted);
  SAVE.setSetting('muted', G.muted);
}
function setDifficulty(i) {
  G.difficulty = clamp(i | 0, 0, DIFFICULTIES.length - 1);
  SAVE.setSetting('difficulty', G.difficulty);
  AUDIO.sfx('ui');
  if (G.state === 'title') { renderTitle(); G.overlayArmed = 0; }
  else UI.overlay.querySelectorAll('[data-diff]').forEach(b => b.classList.toggle('sel', +b.dataset.diff === G.difficulty));
}
function restartLevel() {
  if (!G.L) return;
  ensureAudio();
  startLevel(G.levelIndex, false);
  G.toast('Again.');
}
function pauseGame() { setState('paused'); showOverlay('<h1>Paused</h1><p class="intro">It is not.</p><p class="prompt">Press Esc to keep going<br><span class="alt"><b>R</b> to start the night over</span></p>'); }
function resumeGame() { setState('play'); hideOverlay(); }

function proceed() {
  if (G.t < G.overlayArmed) return;
  ensureAudio();
  switch (G.state) {
    case 'title': startLevel(0, true); break;
    case 'card': hideOverlay(); setState('play'); beginPlay(); break;
    case 'dead': startLevel(G.levelIndex, false); break;
    case 'survived': {
      const next = G.levelIndex + 1;
      if (next >= LEVELS.length) showEnd(); else startLevel(next, true);
      break;
    }
    case 'end': showTitle(); break;
    case 'paused': resumeGame(); break;
    case 'error': restartLevel(); break;
    default: break;
  }
}

function onMouseMove(e) { G.mouse.x = e.clientX; G.mouse.y = e.clientY; }
function onMouseDown(e) {
  if (G.state !== 'play' || e.button !== 0) return;
  G.mouse.x = e.clientX; G.mouse.y = e.clientY;
  updateHover();
  const h = G.hover;
  if (h && h.kind === 'target' && h.ref.hold) { G.holding = h.ref; e.preventDefault(); }
}
function onMouseUp() { G.holding = null; }
function onClick(e) {
  if (e.target.closest && e.target.closest('#touch')) return;
  if (G.state !== 'play') { proceed(); return; }
  ensureAudio();
  G.mouse.x = e.clientX; G.mouse.y = e.clientY;
  updateHover();
  const h = G.hover, L = G.L;
  if (h) {
    if (h.kind === 'item') pickup(h.ref);
    else if (h.kind === 'target') { if (!h.ref.hold) useTarget(h.ref); }
    else if (h.kind === 'creature') useOnCreature(L, h.ref);
    return;
  }
  // empty space: put something down while looking at the floor (never fires a weapon)
  if (G.cam.pitch > 0.5 && G.inv.length) dropActive();
}

// ---------------- inventory / interaction ----------------
function pickup(it) {
  if (G.inv.length >= 6) { G.toast('Your hands are full.'); AUDIO.sfx('nope'); return; }
  it.taken = true; G.inv.push(it); G.active = G.inv.length - 1;
  AUDIO.sfx('pickup');
  if (G.L.onPickup) G.L.onPickup(it);
  G.hover = null;
}
function pointInPoly(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
function dropActive() {
  const it = G.inv[G.active]; if (!it) return;
  const L = G.L, c = G.cam;
  const a = c.yaw + (L.rand() - 0.5) * 0.4;
  let d = 1.3 + L.rand() * 0.3;
  const local = (dd) => rotY(Math.sin(a) * dd, Math.cos(a) * dd, -L.facing);
  while (d > 0.45 && L.floor.poly && !pointInPoly(local(d)[0], local(d)[1], L.floor.poly)) d -= 0.1;
  if (d <= 0.45) { G.toast('No room to put it down here.'); AUDIO.sfx('nope'); return; }
  G.removeFromInv(it);
  it.x = Math.sin(a) * d; it.z = Math.cos(a) * d; it.y = L.floor.y; it.flat = true; it.taken = false;
  AUDIO.sfx('drop');
  if (L.onDrop) L.onDrop(it);
  G.hover = null;
}
function newItem(L, id, name, opts) {
  const it = Object.assign({ id, name, w: 0.4, h: 0.4, flat: false, uses: 1, tool: false, taken: true, icon: id, x: 0, y: 0, z: 0 }, opts || {});
  if (typeof it.icon === 'string') it.icon = ICONS[it.icon];
  L.items.push(it);
  return it;
}
function combine(a, b) {
  const L = G.L;
  const r = (L.recipes || []).find(r => (r.parts[0] === a.id && r.parts[1] === b.id) || (r.parts[0] === b.id && r.parts[1] === a.id));
  if (!r) return false;
  G.removeFromInv(a); G.removeFromInv(b);
  const it = newItem(L, r.result.id, r.result.name, Object.assign({ taken: true }, r.result.opts || {}));
  G.inv.push(it); G.active = G.inv.length - 1;
  AUDIO.sfx(r.sfx || 'load');
  if (r.onCombine) r.onCombine(it, L);
  G.toast(r.text || (it.name + '.'));
  return true;
}
function useTarget(t) {
  const L = G.L;
  if (t.onClick && t.onClick()) return;
  if (t.crank && !t.done) { crankTarget(t); return; }
  if (t.done && !t.accepts.length) { G.toast(G.hints() && t.hint ? t.hint() : 'Done.'); return; }
  let item = G.inv[G.active];
  if (!item || !t.accepts.includes(item.id)) item = G.inv.find(i => t.accepts.includes(i.id));
  if (!item) {
    if (t.accepts.length) G.say(t.hint ? t.hint() : 'You need something for this.', 'Not with what you have.');
    else if (t.hint) G.say(t.hint(), t.name);
    AUDIO.sfx('nope'); return;
  }
  if (item.decoy) {
    const c = L.creature; c.u = Math.min(0.995, c.u + 0.03); c.hitched = true;
    G.say(item.decoyText || 'That is not it.', 'No.'); AUDIO.sfx('nope'); return;
  }
  const missing = (t.requires || []).filter(id => !G.hasItem(id));
  if (missing.length) {
    const m = L.items.find(i => i.id === missing[0]);
    G.say('You need the ' + (m ? m.name.toLowerCase() : missing[0]) + ' for that.', 'Not like this.'); AUDIO.sfx('nope'); return;
  }
  if (item.throwable && !t.noThrow) { throwItem(item, { x: t.x, y: t.y + t.h * 0.4, z: t.z }, () => applyUse(t, item)); return; }
  applyUse(t, item);
}
function applyUse(t, item) {
  const L = G.L;
  const ok = t.use(item);
  if (!ok) { AUDIO.sfx('nope'); return; }
  if (!item.tool) { item.uses--; if (item.uses <= 0) G.removeFromInv(item); }
  if (t.count >= t.needed && t.needed > 1) t.done = true;
  if (!L.won && L.isWon && L.isWon()) win();
}
function crankTarget(t) {
  const L = G.L;
  t.count = (t.count || 0) + 1; t.lastCrank = L.t;
  AUDIO.sfx(t.crank.sfx || 'ratchet'); G.shake(0.06);
  if (t.crank.onTurn) t.crank.onTurn(t.count, t);
  if (t.count >= t.crank.n) { t.done = true; t.count = t.crank.n; if (t.crank.onComplete) t.crank.onComplete(t); if (!L.won && L.isWon && L.isWon()) win(); }
}
function updateTargets(L, dt) {
  for (const t of L.targets) {
    if (t.crank && t.crank.decay && !t.done && t.count > 0 && L.t - (t.lastCrank || 0) > t.crank.decay.after) t.count = Math.max(0, t.count - dt * t.crank.decay.rate);
    if (t.hold && !t.done) {
      const active = G.holding === t && G.hover && G.hover.ref === t;
      if (active) { t.progress = Math.min(1, (t.progress || 0) + dt / t.hold); if (t.progress >= 1) { t.done = true; G.holding = null; if (t.use) t.use(null); if (!L.won && L.isWon && L.isWon()) win(); } }
      else if (t.progress > 0) t.progress = Math.max(0, t.progress - dt / t.hold * (t.holdDecay || 1.5));
    }
  }
}
// a thrown item flies from the hands to a point, then does its thing
function throwItem(it, to, onArrive) {
  if (G.throwing) return;
  G.removeFromInv(it);
  const from = { x: Math.sin(G.cam.yaw) * 0.4, y: G.L.eyeH - 0.3, z: Math.cos(G.cam.yaw) * 0.4 };
  G.throwing = { it, from, to, t: 0, dur: 0.55 + Math.hypot(to.x - from.x, to.z - from.z) * 0.03, onArrive };
  AUDIO.sfx('hiss');
}
function updateThrow(dt) {
  const th = G.throwing; if (!th) return;
  th.t += dt;
  if (th.t >= th.dur) { G.throwing = null; th.onArrive(th.it); }
}
// ---- weapons and anything else you use on the thing itself ----
function activeUse(L) { return (L.uses || []).find(u => G.hasItem(u.tool)) || null; }
function useOnCreature(L, c) {
  const u = activeUse(L);
  if (!u || c.dead) return false;
  const ammo = u.ammo ? G.inv.find(i => i.id === u.ammo) : null;
  if (u.ammo && !ammo) { AUDIO.sfx('empty'); G.toast(u.emptyText || 'Click. Nothing in it.'); return true; }
  if (c.dist > u.range) {
    if (!L.diff.hardShots) { G.toast('Too far.'); return true; }
    fireUse(L, u, ammo); if (u.onMiss) u.onMiss(L, c); else G.toast('Too far. That one is gone.'); return true;
  }
  fireUse(L, u, ammo);
  c.hits++; c.hurtFlash = 0.35;
  if (u.onHit) u.onHit(c, c.hits, L);
  if (!L.won && L.isWon && L.isWon()) win();
  return true;
}
function fireUse(L, u, ammo) {
  if (ammo) { ammo.uses--; if (ammo.uses <= 0) G.removeFromInv(ammo); }
  AUDIO.sfx(u.sfx || 'shot'); G.flash(u.flash === undefined ? 0.5 : u.flash); G.shake(u.shake === undefined ? 0.7 : u.shake); L.s.recoil = 1;
}

// ---- winning, dying ----
const AFTERMATHS = {
  stand: (L, s) => ({ dur: s.dur || 3.6 }),
  held: (L, s) => ({ dur: s.dur || 3.8, seq: { dur: s.dur || 3.8, beats: [{ every: s.every || 0.75, sfx: s.sfx || 'bang', shake: s.shake === undefined ? 0.5 : s.shake }] } }),
  retreat: (L, s) => {
    const c = L.creature; c.frozen = true;
    c.distFn = (cr, dt) => cr.dist + dt * (s.speed || 4) * (1 + L.aftermathT * (s.accel === undefined ? 1.5 : s.accel));
    return { dur: s.dur || 3.2, seq: { dur: s.dur || 3.2, tick: () => G.shake(s.shake === undefined ? 0.06 : s.shake) } };
  },
  down: (L, s) => ({ dur: s.dur || 3.6 }),
  custom: (L, s) => ({ dur: Infinity, custom: true }),
};
function startAftermath(L) {
  const spec = L.def.aftermath || (L.aftermath ? { type: 'custom' } : { type: 'stand', dur: 3.6 });
  const maker = AFTERMATHS[spec.type] || AFTERMATHS.stand;
  L.after = maker(L, spec);
  if (L.after.seq) Seq.play(L.after.seq);
}
function win() {
  const L = G.L; L.won = true; L.aftermathT = 0;
  setState('won');
  SAVE.unlock(L.diff.id, L.index + 1);
  SAVE.recordWin(L.def.id, L.diff.id, L.t);
  startAftermath(L);
}
function die(c, cause) {
  const L = G.L; c = c || L.creature;
  setState('dying');
  G.deathCause = cause || 'default'; G.deathCreature = c;
  const spec = c.CR.death || {};
  AUDIO.sfx(spec.sting || 'sting'); AUDIO.stopLoop(); AUDIO.stopAmbient(); Seq.clear();
  G.shake(1.4);
  c.lunge = 0; c.frozen = true; c.lungeFrom = c.dist;
  G.cam.tYaw = G.cam.yaw + wrapPi(c.yaw - G.cam.yaw); G.cam.tPitch = c.lane.elev < -0.3 ? PITCH_DOWN : 0; G.cam.zoomHeld = false;
  G.deathTime = L.t;
  SAVE.recordTry(L.def.id, L.diff.id);
}
function deathLine(L) {
  const T = L.text.death || {};
  let line = T[G.deathCause] || T.default || '';
  if (G.lastToast.msg && G.deathTime - G.lastToast.t < 1.2 && !line.includes(G.lastToast.msg)) line = G.lastToast.msg + (line ? ' ' + line : '');
  return line;
}

// ---------------- hover ----------------
function updateHover() {
  const hits = R.hits, mx = G.mouse.x, my = G.mouse.y;
  let h = null;
  if (G.state === 'play' && mx >= 0) {
    // prefer items and the creature over targets (whose boxes are big), and the smallest item under the cursor
    let best = null, bestArea = Infinity, target = null;
    for (let i = hits.length - 1; i >= 0; i--) {
      const r = hits[i];
      if (mx < r.x || mx > r.x + r.w || my < r.y || my > r.y + r.h) continue;
      if (r.kind === 'target') { if (!target) target = r; continue; }
      const area = r.w * r.h;
      if (area < bestArea) { best = r; bestArea = area; }
    }
    h = best || target;
  }
  G.hover = h;
  let tip = '';
  if (h) {
    if (h.kind === 'item') tip = h.ref.name + (h.ref.uses > 1 ? ' ×' + h.ref.uses : '');
    else if (h.kind === 'target') tip = (G.hints() && h.ref.hint) ? h.ref.hint() : (h.ref.hold && !h.ref.done ? h.ref.name + ' (hold)' : h.ref.name);
    else if (h.kind === 'creature') { const u = activeUse(G.L); tip = u ? (h.ref.dist < u.range ? (u.fireText || 'Fire.') : 'Too far.') : ''; }
  } else if (G.state === 'play' && G.cam.pitch > 0.5 && G.inv.length) tip = 'Put down the ' + G.inv[G.active].name.toLowerCase();
  UI.tooltip.textContent = tip;
  UI.tooltip.style.display = tip ? 'block' : 'none';
  const holdT = G.L && G.L.targets.find(t => t.hold && !t.done && t.progress > 0);
  UI.holdbar.style.display = holdT ? 'block' : 'none';
  if (holdT) UI.holdfill.style.width = (holdT.progress * 100).toFixed(1) + '%';
  UI.canvas.style.cursor = h ? 'pointer' : (G.L && activeUse(G.L) && G.cam.pitch < 0.3 ? 'crosshair' : 'default');
}

// ---------------- update ----------------
function update(dt) {
  G.t += dt;
  const L = G.L; if (!L) return;
  const c = G.cam;
  c.yaw += wrapPi(c.tYaw - c.yaw) * (1 - Math.exp(-dt * 11));
  c.pitch += (c.tPitch - c.pitch) * (1 - Math.exp(-dt * 10));
  const tz = (c.zoomHeld && G.state === 'play') ? 2.6 : 1;
  c.zoom += (tz - c.zoom) * (1 - Math.exp(-dt * 8));
  G.shakeAmt = Math.max(0, G.shakeAmt - dt * 2.2);
  const sh = G.shakeAmt * 16 + G.danger * 2;
  c.shakeX = (Math.random() - 0.5) * sh; c.shakeY = (Math.random() - 0.5) * sh;
  G.flashAmt = Math.max(0, G.flashAmt - dt * 3);
  G.fade += (G.fadeTarget - G.fade) * (1 - Math.exp(-dt * 3.5));
  if (G.toastT > 0) { G.toastT -= dt; if (G.toastT <= 0) UI.toast.classList.remove('show'); }
  if (L.s.recoil > 0) L.s.recoil = Math.max(0, L.s.recoil - dt * 4);

  if (G.state === 'play' || G.state === 'won') {
    L.t += dt;
    if (L.update) L.update(dt);
    updateTargets(L, dt);
    updateThrow(dt);
    Seq.update(dt);
    for (const cr of L.creatures) updateCreature(L, cr, dt, G.state === 'play');
    if (G.state === 'play') { heartbeat(dt); if (!L.won && L.isWon && L.isWon()) win(); }
    else if (G.state === 'won') {
      L.aftermathT += dt;
      G.danger *= Math.exp(-dt * 2);
      const a = L.after;
      const done = a.custom ? L.aftermath(L.aftermathT, dt) : L.aftermathT >= a.dur;
      if (done) {
        if (G.fadeTarget < 1) { G.fadeTarget = 1; AUDIO.sfx('win'); AUDIO.stopAmbient(); }
        if (G.fade > 0.97) {
          setState('survived'); AUDIO.stopLoop(); Seq.clear();
          if (L.text.fragment) SAVE.seeFragment(L.def.id);
          showOverlay('<div class="kicker">' + L.def.title + '</div><h1>You survived</h1><p class="intro">' + L.text.win + (L.text.fragment ? '<br><em class="fragment">' + L.text.fragment + '</em>' : '') + '</p><p class="prompt">' + (L.index + 1 < LEVELS.length ? 'Press Enter or click for the next night' : 'Press Enter or click') + '</p>');
        }
      }
    }
  } else if (G.state === 'dying') {
    G.stateT += dt;
    const cr = G.deathCreature, CR = cr.CR, spec = CR.death || {};
    const delay = spec.delay === undefined ? 0.22 : spec.delay, dur = spec.dur === undefined ? 0.5 : spec.dur;
    const k = clamp((G.stateT - delay) / dur, 0, 1);
    cr.lunge = k; cr.lat = lerp(cr.lat, 0, 0.3); cr.t += dt * cr.timeScale;
    cr.dist = lerp(cr.lungeFrom, 0.55, easeIn(k));
    cr.yOff = lerp(0, L.eyeH - CR.faceY - (cr.lane.elev ? cr.dist * Math.sin(cr.lane.elev) : 0), smoothstep(k));
    if (spec.pose) spec.pose(cr, k);
    G.danger = Math.min(1, G.danger + dt * 3);
    if (G.stateT > delay + dur + 0.25) { G.fade = 1; G.fadeTarget = 1; }
    if (G.stateT > delay + dur + 1.2) {
      setState('dead');
      const secs = Math.max(1, Math.round(G.deathTime));
      showOverlay('<h1 class="red">It got you</h1><p class="intro">It reached you after ' + secs + ' second' + (secs > 1 ? 's' : '') + '.<br>' + deathLine(L) + '</p><p class="prompt">Press Enter or click to try that night again</p>' + (G.debug ? '<p class="fine">seed ' + G.runSeed + '</p>' : ''));
    }
  } else if (G.state === 'title') {
    L.t += dt * 0.25; for (const cr of L.creatures) cr.t += dt * 0.25;
    c.tYaw = Math.sin(G.t * 0.05) * 0.25;
  }
}

function updateCreature(L, c, dt, live) {
  const CR = c.CR;
  c.t += dt * c.timeScale;
  c.visFrac = APPROACH.visFrac(L, c.lane, c, null);
  const seen = c.visFrac >= (CR.seenFrac === undefined ? 0.2 : CR.seenFrac);
  c.seen = seen; c.visible = seen;
  if (CR.onSeen && seen && !c.seenLast) CR.onSeen(c);
  c.seenLast = seen;
  let m = CR.speedMult(c, dt, seen) * (seen ? c.seenMult : c.unseenMult);
  if (c.frozen || c.dead) m = 0;
  const prevDist = c.dist;
  let d;
  if (c.hold !== null) d = c.hold;
  else if (c.distFn) d = c.distFn(c, dt);
  else { c.u = clamp(c.u + dt * m / c.T, 0, 1); d = c.D0 * Math.pow(1 - c.u, c.gamma); }
  if (L.won && L.barrierDist && !c.distFn && c.hold === null) d = Math.max(d, L.barrierDist);
  if (c.hitched) { c.hitched = false; G.shake(0.05); }
  c.dist = d;
  const moved = Math.max(0, prevDist - d);
  const prevGait = c.gait;
  c.gait += moved * CR.stepRate * Math.PI;
  c.moving = moved > 0.0004;
  const pan = Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
  if (CR.sound && Math.floor(c.gait / Math.PI) !== Math.floor(prevGait / Math.PI) && !G.muted) AUDIO.footstep(CR.sound, clamp(2.4 / (d + 1.6), 0, 0.85) * 0.6, pan);
  if (CR.silentWhenSeen && !G.muted && c.idx === 0) AUDIO.setLoop((!seen && c.moving && !L.won) ? 'grind' : null, clamp(0.15 + 3 / (d + 2), 0, 0.6), pan);
  c.lat = CR.lateral ? CR.lateral(c) : 0;
  c.lit = L.creatureLit ? L.creatureLit(c) : 0;
  if (live && !L.won && L.barrierDist && !c.reached && d <= L.barrierDist) { c.reached = true; if (L.onReach) L.onReach(c); }
  if (live && !L.won && d <= c.catchDist && !c.dead) {
    if (L.onCatch && L.onCatch(c)) return;
    die(c, c.reached && L.text.death.reached ? 'reached' : 'default');
  }
}
function nearestCreature(L) { let best = null; for (const c of L.creatures) if (!c.dead && (!best || c.dist < best.dist)) best = c; return best || L.creature; }
function heartbeat(dt) {
  const L = G.L, c = nearestCreature(L);
  const prox = clamp(1 - (c.dist - 2) / 48, 0, 1);
  const interval = lerp(1.35, 0.32, Math.pow(prox, 1.5));
  if (G.t >= G.hb.next) {
    if (!G.muted && prox > 0.02) AUDIO.heartbeat(0.04 + prox * 0.5, prox > 0.7);
    G.hb.last = G.t; G.hb.next = G.t + interval;
  }
  const pulse = Math.exp(-(G.t - G.hb.last) / 0.22);
  G.danger = Math.pow(prox, 2.2) * (0.35 + 0.65 * pulse);
}

// ---------------- render ----------------
function render() {
  const L = G.L; if (!L) return;
  const c = G.cam;
  const wob = (c.zoom - 1) * 0.0018;
  const view = { yaw: c.yaw + Math.sin(G.t * 1.7) * wob + Math.sin(G.t * 2.9) * wob * 0.5, pitch: c.pitch + Math.cos(G.t * 1.3) * wob, zoom: c.zoom, shakeX: c.shakeX, shakeY: c.shakeY };
  R.begin(view, L, G.t);
  for (let i = 0; i < L.props.length; i++) R.add(L.props[i]);
  for (const it of L.items) if (!it.taken) R.add({
    kind: 'sprite', x: it.x, y: it.y, z: it.z, w: it.w, h: it.h, flat: it.flat, hit: { kind: 'item', ref: it }, hitPad: 8,
    draw: (ctx, P) => { ctx.scale(it.w, it.h); it.icon(ctx, P); }
  });
  for (const t of L.targets) if (!t.hidden) R.add({ kind: 'sprite', x: t.x, y: t.y, z: t.z, w: t.w, h: t.h, flat: t.flat, hit: { kind: 'target', ref: t }, draw: () => {}, noHover: !t.flat && t.w > 1.5 });
  if (G.throwing) {
    const th = G.throwing, k = th.t / th.dur, arc = Math.sin(k * Math.PI) * 0.8;
    const x = lerp(th.from.x, th.to.x, k), y = lerp(th.from.y, th.to.y, k) + arc, z = lerp(th.from.z, th.to.z, k);
    R.add({ kind: 'sprite', x, y, z, w: th.it.w, h: th.it.h, draw: (ctx, P) => { ctx.scale(th.it.w, th.it.h); th.it.icon(ctx, P); } });
  }
  if (L.dynamic) L.dynamic();
  const canUse = G.state === 'play' && !!activeUse(L);
  for (const cr of L.creatures) {
    const CR = cr.CR, p = cr.pos();
    R.add({
      kind: 'sprite', x: p.x, y: p.y + cr.yOff, z: p.z, w: CR.w, h: CR.h, dist: cr.dist, fogScale: 0.85,
      hit: (canUse && !cr.dead) ? { kind: 'creature', ref: cr } : null, hitPad: 12, noHover: true,
      draw: (ctx, P) => CR.draw(ctx, cr, P),
      onRect: rect => { cr.rect = rect; }
    });
  }
  R.hover = G.hover ? G.hover.ref : null;
  R.flush();
  R.post({
    danger: G.danger, flash: G.flashAmt, fade: G.fade,
    glows: L.glows ? L.glows() : null,
    drawOverlay: (ctx, W, H) => drawGunOverlay(ctx, W, H),
    grain: G.state === 'title' ? 0.05 : 0.07 + G.danger * 0.05,
  });
  updateHover();
  updateHUD();
}

function drawGunOverlay(ctx, W, H) {
  const L = G.L;
  const u = activeUse(L);
  if (!u || u.tool !== 'shotgun' || G.state === 'dead' || G.state === 'dying') return;
  const up = clamp(G.cam.pitch / PITCH_DOWN, 0, 1);
  const k = L.s.recoil || 0;
  const bx = W * 0.72 + k * 20, by = H + up * 260 - k * 60;
  ctx.save();
  ctx.translate(bx, by); ctx.rotate(-0.55 + k * 0.12);
  const len = Math.min(W, H) * 0.7;
  ctx.fillStyle = '#0d0d10';
  ctx.fillRect(-28, -len, 26, len + 40); ctx.fillRect(2, -len, 26, len + 40);
  ctx.fillStyle = '#1a1a20';
  ctx.fillRect(-26, -len, 8, len); ctx.fillRect(4, -len, 8, len);
  ctx.fillStyle = '#3a2a1c'; ctx.fillRect(-40, -len * 0.35, 80, len * 0.4);
  ctx.restore();
  if (G.cam.pitch < 0.3 && G.state === 'play' && G.mouse.x >= 0 && (!u.ammo || G.hasItem(u.ammo))) {
    ctx.strokeStyle = 'rgba(255,230,200,0.5)'; ctx.lineWidth = 1;
    const mx = G.mouse.x, my = G.mouse.y;
    ctx.beginPath(); ctx.moveTo(mx - 12, my); ctx.lineTo(mx - 4, my); ctx.moveTo(mx + 4, my); ctx.lineTo(mx + 12, my); ctx.moveTo(mx, my - 12); ctx.lineTo(mx, my - 4); ctx.moveTo(mx, my + 4); ctx.lineTo(mx, my + 12); ctx.stroke();
  }
}

// ---------------- HUD ----------------
function updateHUD() {
  const L = G.L, c = G.cam;
  const playing = G.state === 'play' || G.state === 'won';
  UI.hud.style.opacity = playing ? 1 : 0;
  if (!playing) return;
  const cur = c.dirIdx;
  const ticks = L.diff.tick ? L.creatures.filter(cr => !cr.dead).map(cr => ((Math.round(cr.yaw / (45 * DEG)) % 8) + 8) % 8) : [];
  const sig = cur + ':' + ticks.join(',');
  if (G._compassSig !== sig) {
    G._compassSig = sig;
    let html = '';
    for (let i = 0; i < 8; i++) html += '<span class="' + (i === cur ? 'cur' : '') + (ticks.includes(i) ? ' thing' : '') + '">' + DIR_NAMES[i] + '</span>';
    UI.compass.innerHTML = html;
  }
  UI.pitch.textContent = c.tPitch > 0.1 ? '▼ looking down' : '▲ looking ahead';
  UI.zoom.style.opacity = c.zoom > 1.2 ? 1 : 0;
  const obj = G.hints() ? (L.objectiveText ? L.objectiveText() : L.text.objective) : '';
  if (UI.objective.textContent !== obj) UI.objective.textContent = obj;
  const isig = G.inv.map(i => i.id + ':' + i.uses).join('|') + '#' + G.active;
  if (isig !== G.invSig) {
    G.invSig = isig;
    UI.inv.innerHTML = '';
    G.inv.forEach((it, idx) => {
      const slot = document.createElement('div');
      slot.className = 'slot' + (idx === G.active ? ' active' : '');
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
      const x = cv.getContext('2d');
      x.translate(32, 58); x.scale(52, -52);
      it.icon(x, { col: cc => rgba(cc), cola: (cc, a) => rgba(cc, a), raw: cc => rgba(cc), fog: 0, t: 0 });
      slot.appendChild(cv);
      const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = it.name + (it.uses > 1 ? ' ×' + it.uses : '');
      slot.appendChild(lab);
      slot.addEventListener('click', e => {
        e.stopPropagation();
        if (idx !== G.active && G.inv[G.active] && combine(G.inv[G.active], it)) { G.invSig = ''; return; }
        G.active = idx; G.invSig = ''; AUDIO.sfx('ui');
      });
      UI.inv.appendChild(slot);
    });
  }
  if (G.debug) {
    const cr = L.creature;
    UI.debug.textContent = 'seed ' + G.runSeed + '  lane ' + L.lane.name + '  dist ' + cr.dist.toFixed(1) + 'm  u ' + cr.u.toFixed(3) + '  t ' + L.t.toFixed(1) + 's  vis ' + cr.visFrac.toFixed(2) + (cr.seen ? ' seen' : ' unseen') + '  mode ' + (cr.mode || '-') + ' pose ' + (cr.pose === undefined ? '-' : cr.pose) + '  fps ' + G.fps.toFixed(0);
  }
}

// ---------------- touch controls ----------------
function bindTouch() {
  const press = (id, down, up) => {
    const el = $(id); if (!el) return;
    const d = e => { e.preventDefault(); e.stopPropagation(); ensureAudio(); if (G.state !== 'play') { proceed(); return; } down(); };
    const u = e => { e.preventDefault(); if (up) up(); };
    el.addEventListener('pointerdown', d); el.addEventListener('pointerup', u); el.addEventListener('pointercancel', u); el.addEventListener('pointerleave', u);
  };
  press('tLeft', () => onKeyDown({ key: 'ArrowLeft', preventDefault() {} }));
  press('tRight', () => onKeyDown({ key: 'ArrowRight', preventDefault() {} }));
  press('tUp', () => onKeyDown({ key: 'ArrowUp', preventDefault() {} }));
  press('tDown', () => onKeyDown({ key: 'ArrowDown', preventDefault() {} }));
  press('tZoom', () => { G.cam.zoomHeld = true; }, () => { G.cam.zoomHeld = false; });
}

// ---------------- boot ----------------
function frame(now) {
  const dt = Math.min(0.05, (now - G._last) / 1000); G._last = now;
  G.fps = lerp(G.fps, 1 / Math.max(dt, 1e-3), 0.05);
  if (!document.hidden && G.state !== 'error') {
    try { update(dt); render(); }
    catch (e) {
      G.errorCount++;
      console.error(e);
      G.error = e; setState('error');
      showOverlay('<h1 class="red">Something broke</h1><p class="intro">' + escapeHtml(e.message) + '<br>seed ' + G.runSeed + '</p><p class="prompt">Press R to start the night over</p>');
    }
  }
  if (!G.noRaf) requestAnimationFrame(frame);
}
// deterministic stepping for tests: ?nofr disables requestAnimationFrame and G.step(dt) advances the game
G.step = function (dt, n) { for (let i = 0; i < (n || 1); i++) { update(dt); render(); } };
function init() {
  UI.canvas = $('game'); UI.hud = $('hud'); UI.compass = $('compass'); UI.objective = $('objective'); UI.pitch = $('pitch');
  UI.zoom = $('zoom'); UI.tooltip = $('tooltip'); UI.inv = $('inventory'); UI.overlay = $('overlay'); UI.toast = $('toast'); UI.debug = $('debug'); UI.mute = $('mute');
  UI.holdbar = $('holdbar'); UI.holdfill = $('holdfill');
  R.attach(UI.canvas); R.resize();
  window.addEventListener('resize', R.resize);
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('blur', () => { G.cam.zoomHeld = false; G.holding = null; });
  UI.canvas.addEventListener('mousedown', onMouseDown);
  UI.canvas.addEventListener('click', onClick);
  UI.overlay.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-diff]');
    if (b) { e.stopPropagation(); ensureAudio(); setDifficulty(+b.dataset.diff); return; }
    const cont = e.target.closest && e.target.closest('[data-continue]');
    if (cont) { e.stopPropagation(); ensureAudio(); startLevel(G.unlocked, true); return; }
    onClick(e);
  });
  UI.mute.addEventListener('click', e => { e.stopPropagation(); ensureAudio(); toggleMute(); });
  bindTouch();
  SAVE.load();
  G.difficulty = clamp(SAVE.data.settings.difficulty | 0, 0, DIFFICULTIES.length - 1);
  setMuted(!!SAVE.data.settings.muted);
  const q = new URLSearchParams(location.search);
  G.debug = q.has('debug');
  if (G.debug) UI.debug.style.display = 'block';
  G.noRaf = q.has('nofr');
  const sd = parseInt(q.get('seed'), 10);
  G.seed = isNaN(sd) ? null : sd;
  G.runSeed = G.seed !== null ? G.seed : (Date.now() % 1000000);
  showTitle();
  if (q.has('level')) { const n = parseInt(q.get('level'), 10); if (!isNaN(n)) startLevel(clamp(n - 1, 0, LEVELS.length - 1), !q.has('go')); }
  if (G.debug) { const probs = validateContent(); if (probs.length) console.warn('content problems:\n' + probs.join('\n')); else console.log('content ok'); }
  G._last = performance.now();
  if (!G.noRaf) requestAnimationFrame(frame);
}
window.addEventListener('DOMContentLoaded', init);
