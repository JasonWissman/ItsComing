'use strict';
// ---------- game state, input, interaction, HUD and the main loop ----------
const LIST_SCREENS = ['nights', 'settings', 'fragments']; // menu screens with their own buttons: not click-anywhere
const PITCH_DOWN = 58 * DEG;
const DIR_NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// difficulty is a table of knobs read by buildLevel and by each night's build(L) through L.tier()
const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', desc: 'It comes slower. Hints on.', tier: 0, time: 1.35, unseen: 0.85, hints: true, steps: 0, lane: 'default', tick: true, variance: 0.05, decoys: 0, hardShots: false },
  { id: 'normal', name: 'Normal', desc: 'As intended. No hints.', tier: 1, time: 1.0, unseen: 1.0, hints: false, steps: 0, lane: 'default', tick: true, variance: 0.1, decoys: 0, hardShots: false },
  { id: 'hard', name: 'Hard', desc: 'Faster, an extra step, and it may come another way. No hints. Out-of-range shots waste ammo.', tier: 2, time: 0.72, unseen: 1.25, hints: false, steps: 1, lane: 'seeded', tick: true, variance: 0.1, decoys: 0, hardShots: true },
  { id: 'nightmare', name: 'Nightmare', desc: 'Much less time, two extra steps, no compass mark. It comes from wherever it likes. Out-of-range shots waste ammo.', tier: 3, time: 0.6, unseen: 1.4, hints: false, steps: 2, lane: 'random', tick: false, variance: 0.15, decoys: 1, hardShots: true, laneSwitch: true },
];

const G = {
  state: 'title', levelIndex: 0, L: null,
  cam: { yaw: 0, pitch: 0, zoom: 1, tYaw: 0, tPitch: 0, dirIdx: 0, zoomHeld: false, shakeX: 0, shakeY: 0 },
  inv: [], active: 0, hover: null, mouse: { x: -1, y: -1 }, holding: null, throwing: null,
  t: 0, stateT: 0, shakeAmt: 0, flashAmt: 0, fade: 1, fadeTarget: 0, white: 0, whiteTarget: 0, danger: 0,
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
// Hard ('seeded') keeps the same way for the whole run, retry after retry; Nightmare ('random') rolls again every attempt.
// The level's generator is drawn from either way, so item layouts do not depend on the mode.
function laneRoll(L, mode, salt) {
  const roll = L.rand();
  return mode === 'seeded' ? mulberry32((G.runSeed * 7919 + L.index * 131 + salt * 977 + 12345) >>> 0)() : roll;
}
function pickLane(def, diff, L) {
  const n = L.lanes.length;
  if (n === 1) return 0;
  const mode = diff.tier === 0 ? 'default' : (def.laneMode || diff.lane);
  if (mode === 'default') { const d = L.lanes.findIndex(l => l.default); return d >= 0 ? d : 0; }
  return Math.floor(laneRoll(L, mode, 0) * n);
}
function makeCreature(L, cd, k) {
  const CR = CREATURES[cd.type];
  if (!CR) throw new Error('unknown creature type "' + cd.type + '" in ' + L.def.id);
  const diff = L.diff;
  const vDist = 1 - diff.variance + L.rand() * 2 * diff.variance, vTime = 1 - diff.variance * 0.7 + L.rand() * 1.4 * diff.variance;
  let laneIdx = cd.lane !== undefined ? cd.lane : L.laneIdx;
  if (cd.lanes) { const mode = diff.tier === 0 ? 'default' : (L.def.laneMode || diff.lane); laneIdx = mode === 'default' ? cd.lanes[0] : cd.lanes[Math.floor(laneRoll(L, mode, k + 1) * cd.lanes.length)]; }
  const lane = L.lanes[laneIdx];
  const c = {
    type: cd.type, CR, lane, yaw: lane.yaw, idx: k,
    D0: cd.startDist * vDist, T: cd.time * diff.time * vTime, gamma: cd.gamma || 0.72,
    seenMult: cd.seenMult === undefined ? 1 : cd.seenMult, unseenMult: (cd.unseenMult === undefined ? 1.3 : cd.unseenMult) * diff.unseen,
    u: 0, dist: 0, gait: 0, t: 0, seen: true, seenLast: true, visFrac: 1, visible: true, lit: 0, lat: 0, yOff: 0, lunge: 0,
    frozen: false, reached: false, hits: 0, dead: false, moving: false,
    timeScale: CR.timeScale || 1, rand: mulberry32((L.rand() * 4294967295) >>> 0), distFn: null, hold: null,
    catchDist: cd.catchDist || CR.catchDist, laneOptions: cd.lanes || null, fixedLane: cd.lane !== undefined && !cd.lanes,
    retarget(laneIdx) { const ln = L.lanes[laneIdx]; if (ln) { this.lane = ln; this.yaw = ln.yaw; } },
    pos() { if (this.lane.follow) return { x: Math.sin(this.yaw) * this.dist, y: this.lane.y, z: Math.cos(this.yaw) * this.dist }; return APPROACH.position(this.lane, this.dist, this.lat, L.eyeH); },
  };
  c.dist = c.D0;
  CR.init(c);
  return c;
}
function buildLevel(i) { return buildLevelDef(LEVELS[i], i); }
function buildLevelDef(def, i) {
  const diff = DIFFICULTIES[G.difficulty];
  G.attempt++;
  const rand = mulberry32((G.runSeed * 7919 + i * 131 + G.attempt * 17) >>> 0);
  const L = {
    def, index: i, night: i + 1, t: 0, facing: def.facing * DEG, eyeH: def.eyeH || 1.65, pal: Object.assign({ id: def.id }, def.pal), diff,
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
  L.lane = L.creature.lane; L.laneIdx = L.lane.idx;   // the level's lane is the first creature's
  if (L.barrierDist === undefined) L.barrierDist = L.lane.barrierDist || 0;
  L.uses = def.uses || L.uses || [];
  if (def.startInv) for (const id of def.startInv) { const it = L.items.find(x => x.id === id); if (it) { it.taken = true; G.inv.push(it); } }
  // lights are declared in the local frame; cones carry a direction
  L.lights = (L.lights || []).concat((def.lights || []).map(l => worldLight(L, l)));
  return L;
}
function worldLight(L, l) {
  const p = L.pt(l.x, l.y, l.z);
  const w = Object.assign({}, l, { x: p[0], y: p[1], z: p[2], seed: L.rand() * 10 });
  if (l.cone) { const d = rotY(l.cone.x, l.cone.z, L.facing); const len = Math.hypot(d[0], l.cone.y, d[1]) || 1; w.cone = { x: d[0] / len, y: l.cone.y / len, z: d[1] / len, cos: Math.cos((l.cone.deg || 25) * DEG) }; }
  return w;
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
  STORY.theme(false); if (i === 0) SAVE.setSetting('theme', '');
  G.white = 0; G.whiteTarget = 0;
  AUDIO.stopLoop(); AUDIO.stopAmbient(); Seq.clear(); MENU.clear(); // nothing of the last screen or night carries over
  G.levelIndex = i;
  G.inv = []; G.active = 0; G.hover = null; G.invSig = ''; G.holding = null; G.throwing = null; G.error = null;
  G.L = buildLevel(i);
  R.prepare(G.L.props);
  WEATHER.set(G.L.def.weather, G.runSeed + i);
  const c = G.cam;
  c.dirIdx = ((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8;
  c.tYaw = c.yaw = c.dirIdx * 45 * DEG; c.tPitch = c.pitch = 0; c.zoom = 1; c.zoomHeld = false;
  G.hb.next = 0; G.hb.last = -10; G.danger = 0; G.shakeAmt = 0; G.flashAmt = 0;
  G.fade = 1; G.fadeTarget = 0;
  if (withCard) {
    setState('card');
    const d = G.diff(), T = G.L.text;
    const dirName = DIR_NAMES[((Math.round(G.L.creature.yaw / (45 * DEG)) % 8) + 8) % 8];
    showOverlay('<div class="kicker">Night ' + (i + 1) + ' of ' + LEVELS.length + ' &middot; ' + d.name + '</div><h1>' + G.L.def.title + '</h1><p class="intro">' + T.intro + (d.hints && T.hint ? '<br>' + T.hint : '') + (d.hints ? (G.L.lane.follow ? '<br>It is behind you. It is always behind you.' : '<br>It is coming from the ' + ({ N: 'north', NE: 'north-east', E: 'east', SE: 'south-east', S: 'south', SW: 'south-west', W: 'west', NW: 'north-west' }[dirName]) + (G.L.lane.elev < -0.3 ? ', below you' : '') + '.') : '') + '</p>' + (d.hints && T.objective ? '<p class="hint">' + T.objective + '</p>' : '') + '<p class="prompt">Click or press Enter when you are ready</p>');
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
  STORY.startNight(L);
}
function setState(s) { G.state = s; G.stateT = 0; }

// ---------------- overlays ----------------
function showOverlay(html) { UI.overlay.innerHTML = html; UI.overlay.classList.add('show'); UI.hud.classList.add('dim'); document.body.classList.add('menu'); G.overlayArmed = performance.now() + 350; } // a double-click cannot skip a card
function hideOverlay() { UI.overlay.classList.remove('show'); UI.hud.classList.remove('dim'); document.body.classList.remove('menu'); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
function escapeHtml(s) { return String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch])); }
function showTitle() {
  if (G.L && G.L.onEnd) G.L.onEnd();
  AUDIO.stopAmbient(); AUDIO.stopLoop(); Seq.clear();
  G.inv = [];
  G.L = buildLevel(0);
  R.prepare(G.L.props);
  WEATHER.set(G.L.def.weather, G.runSeed);
  const c = G.cam; c.tYaw = c.yaw = 0; c.tPitch = c.pitch = 0; c.zoom = 1;
  G.fade = 0.35; G.fadeTarget = 0.35; G.white = 0; G.whiteTarget = 0;
  STORY.theme(SAVE.data.settings.theme === 'day');
  setState('title');
  MENU.show('title'); G.overlayArmed = 0; // nothing on the title can be skipped by accident, so it takes a click or Enter at once
}
function startMorning() {
  const L = G.L; MENU.clear();
  SAVE.unlock(L.diff.id, LEVELS.length); SAVE.markComplete(L.diff.id); SAVE.setSetting('theme', 'day');
  if (L.onEnd) L.onEnd();
  AUDIO.stopLoop(); AUDIO.stopAmbient(); Seq.clear();
  G.inv = []; G.hover = null;
  const def = STORY.morningDef();
  G.L = buildLevelDef(def, LEVELS.length);
  R.prepare(G.L.props);
  WEATHER.set(def.weather, 7);
  const c = G.cam; c.dirIdx = 1; c.tYaw = c.yaw = 45 * DEG; c.tPitch = c.pitch = 0; c.zoom = 1; c.zoomHeld = false;
  G.danger = 0; G.fade = 0; G.fadeTarget = 0; G.white = 1; G.whiteTarget = 0;
  STORY.theme(true);
  setState('morning');
  hideOverlay();
  if (AUDIO.on()) AUDIO.startAmbient({ wind: 0.25, drone: 0 });
  Seq.play({ dur: 11, beats: [{ every: 2.2, from: 1, do: () => AUDIO.sfx('birds', Math.random() - 0.5) }, { at: 6.5, do: () => showOverlay('<h1 class="big">IT\'S MORNING.</h1>') }], then: () => { setState('end'); MENU.show('nights', { from: 'title' }); } });
}
function proceedFromSurvived() {
  const next = G.levelIndex + 1;
  if (next >= LEVELS.length) showTitle(); else startLevel(next, true); // the last night ends in the morning, not here
}

// ---------------- input ----------------
function onKeyDown(e) {
  const k = e.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k) && !(e.target && e.target.tagName === 'INPUT')) e.preventDefault(); // sliders and checkboxes keep their keys
  if (e.repeat) return;
  if (k === 'm' || k === 'M') { toggleMute(); return; }
  if ((k === 'r' || k === 'R') && G.state !== 'title' && G.state !== 'end' && G.state !== 'card' && G.state !== 'morning') { restartLevel(); return; }
  if (G.state !== 'play' && MENU.onKey(e)) return;
  if (k === 'Escape') { if (G.state === 'play') pauseGame(); else if (G.state === 'paused') resumeGame(); else if (G.state === 'card') showTitle(); return; }
  if (G.state === 'title' && k >= '1' && k <= String(DIFFICULTIES.length)) { setDifficulty(k.charCodeAt(0) - 49); return; }
  if (G.state !== 'play') {
    if (k === 'Enter' && !LIST_SCREENS.includes(MENU.kind)) proceed(); // on the button screens Enter only presses the focused button
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
  // the title and the Nights list are built per difficulty (Continue, unlocks), so they are rebuilt; focus lands on Begin, the next thing to press
  if (G.state === 'title' && (MENU.kind === 'title' || MENU.kind === 'nights')) { const kind = MENU.kind; MENU.show(kind, kind === 'nights' ? { from: 'title' } : undefined); G.overlayArmed = 0; const begin = UI.overlay.querySelector('button[data-act="begin"]'); if (begin) begin.focus(); }
  else UI.overlay.querySelectorAll('[data-diff]').forEach(b => b.classList.toggle('sel', +b.dataset.diff === G.difficulty));
}
function restartLevel() {
  if (!G.L) return;
  ensureAudio();
  startLevel(G.levelIndex, false);
  G.toast('Again.');
}
function pauseGame() { setState('paused'); MENU.show('pause'); AUDIO.suspend(); }
function resumeGame() { setState('play'); hideOverlay(); MENU.clear(); AUDIO.resume(); }

function proceed() {
  if (performance.now() < G.overlayArmed) return; // the arm is on the wall clock, so it is 350 ms whatever the frame rate
  ensureAudio();
  switch (G.state) {
    case 'title': startLevel(0, true); break;
    case 'card': hideOverlay(); setState('play'); beginPlay(); break;
    case 'dead': startLevel(G.levelIndex, false); break;
    case 'survived': proceedFromSurvived(); break;
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
  if (G.state !== 'play') { if (LIST_SCREENS.includes(MENU.kind)) return; proceed(); return; } // the list screens are not click-anywhere; the title and the cards are
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
  const act = G.inv[G.active];
  if (t.crank && !t.done && !(act && t.accepts.includes(act.id))) { crankTarget(t); return; }
  if (t.done && !t.accepts.length) { G.toast(G.hints() && t.hint ? t.hint() : 'Done.'); return; }
  let item = G.inv[G.active];
  if (!item || !t.accepts.includes(item.id)) item = G.inv.find(i => t.accepts.includes(i.id) && !i.decoy) || G.inv.find(i => t.accepts.includes(i.id)); // the genuine thing before a decoy, unless the decoy was chosen
  if (!item) {
    if (t.accepts.length) G.say(t.hint ? t.hint() : 'You need something for this.', 'Not with what you have.');
    else if (t.hint) G.say(t.hint(), t.name);
    AUDIO.sfx('nope'); return;
  }
  if (item.decoy) {
    const c = L.creature; c.u = Math.min(0.995, c.u + 0.03); c.hitched = true;
    G.toast(item.decoyText || 'That is not it.'); AUDIO.sfx('nope'); // decoys only exist where hints are off, so their line is feedback, not a hint
    if (L.onDecoy) L.onDecoy(t, item);
    return;
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
  held: (L, s) => ({ dur: s.dur || 3.8, seq: { dur: s.dur || 3.8, beats: s.beats || [{ every: s.every || 0.75, sfx: s.sfx || 'bang', shake: s.shake === undefined ? 0.5 : s.shake }] } }),
  away: (L, s) => {
    const c = L.creature, wait = s.wait === undefined ? 2.5 : s.wait;
    c.hold = c.dist;
    return { dur: s.dur || 6, seq: { dur: s.dur || 6, beats: (s.beats || []).concat([{ at: wait, sfx: s.sfx, do: () => { c.hold = null; c.away = true; c.frozen = true; c.distFn = (cr, dt) => cr.dist + dt * (s.speed || 1.1); if (s.toast) G.toast(s.toast); } }]) } };
  },
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
  for (const c of L.creatures) if (c.sealHold) { c.hold = null; c.sealHold = false; } // the aftermath decides where it stands now
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
  G.cam.tYaw = G.cam.yaw + wrapPi(c.yaw - G.cam.yaw); G.cam.tPitch = 0; G.cam.zoomHeld = false; // it rises to eye level, so the view comes up to meet it
  G.deathTime = L.t; G.deathAt = G.t; // the night clock for the card, the global clock for the toast test (toasts are stamped with G.t)
  SAVE.recordTry(L.def.id, L.diff.id);
}
function deathLine(L) {
  const T = L.text.death || {};
  let line = T[G.deathCause] || T.default || '';
  if (G.lastToast.msg && G.deathAt - G.lastToast.t < 1.2 && !line.includes(G.lastToast.msg)) line = G.lastToast.msg + (line ? ' ' + line : '');
  return line;
}

// ---------------- hover ----------------
function updateHover() {
  const hits = R.hits, mx = G.mouse.x, my = G.mouse.y;
  let h = null;
  if (G.state === 'play' && mx >= 0) {
    // prefer items and the creature over targets (whose boxes are big), and the smallest item under the cursor
    let best = null, bestArea = Infinity, target = null, targetArea = Infinity;
    for (let i = hits.length - 1; i >= 0; i--) {
      const r = hits[i];
      if (mx < r.x || mx > r.x + r.w || my < r.y || my > r.y + r.h) continue;
      // smaller wins; among things of a size, the one whose middle is nearest the cursor
      const dd = Math.hypot(mx - (r.x + r.w / 2), my - (r.y + r.h / 2)) / Math.max(1, Math.hypot(r.w, r.h));
      const area = r.w * r.h * (1 + dd);
      if (r.kind === 'target') { if (area < targetArea) { target = r; targetArea = area; } continue; }
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
  const S = SAVE.data.settings;
  const sh = S.reducedMotion ? G.shakeAmt * 6 : G.shakeAmt * 16 + G.danger * 2;
  c.shakeX = (Math.random() - 0.5) * sh; c.shakeY = (Math.random() - 0.5) * sh;
  G.flashAmt = Math.max(0, G.flashAmt - dt * 3);
  G.fade += (G.fadeTarget - G.fade) * (1 - Math.exp(-dt * 3.5));
  G.white += (G.whiteTarget - G.white) * (1 - Math.exp(-dt * (G.whiteTarget > G.white ? 1.2 : 0.9)));
  if (G.toastT > 0) { G.toastT -= dt; if (G.toastT <= 0) UI.toast.classList.remove('show'); }
  if (L.s.recoil > 0) L.s.recoil = Math.max(0, L.s.recoil - dt * 4);
  HANDS.update(dt);
  if (G.state !== 'paused') {
    // fog rolls: visibility breathes, and a scripted bank can swallow the thing for a while
    const fr = L.def.weather && L.def.weather.fogRoll;
    if (fr) L.pal.fogDist = L.def.pal.fogDist * (1 - fr.depth * 0.5 * (1 + Math.sin(G.t * TAU / fr.period + (fr.phase || 0))));
    LIGHT.set(L.dynamicLights ? L.lights.concat(L.dynamicLights()) : L.lights);
    LIGHT.update(dt, G.t);
    WEATHER.update(dt, G.t);
  }

  if (G.state === 'play' || G.state === 'won') {
    L.t += dt;
    if (L.update) L.update(dt);
    STORY.update(L, dt);
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
      if (done && L.def.ending) { if (G.white > 0.97) startMorning(); }
      else if (done) {
        if (G.fadeTarget < 1) { G.fadeTarget = 1; AUDIO.sfx('win'); AUDIO.stopAmbient(); }
        if (G.fade > 0.97) {
          setState('survived'); AUDIO.stopLoop(); Seq.clear();
          if (L.text.fragment) SAVE.seeFragment(L.def.id);
          G.survivedScreen = { title: L.def.title, text: L.text.win + (L.text.fragment ? '<br><em class="fragment">' + L.text.fragment + '</em>' : '') };
          MENU.show('survived', G.survivedScreen);
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
    cr.yOff = lerp(0, L.eyeH - CR.faceY - cr.pos().y, smoothstep(k)); // from wherever its feet really are (flat, raised, ramp or behind you) up to eye level
    if (spec.pose) spec.pose(cr, k);
    G.danger = Math.min(1, G.danger + dt * 3);
    if (G.stateT > delay + dur + 0.25) { G.fade = 1; G.fadeTarget = 1; }
    if (G.stateT > delay + dur + 1.2) {
      setState('dead');
      const secs = Math.max(1, Math.round(G.deathTime));
      G.deathScreen = { text: 'It reached you after ' + secs + ' second' + (secs > 1 ? 's' : '') + '.<br>' + deathLine(L) };
      MENU.show('dead', G.deathScreen);
    }
  } else if (G.state === 'title') {
    L.t += dt * 0.25; for (const cr of L.creatures) cr.t += dt * 0.25;
    c.tYaw = Math.sin(G.t * 0.05) * 0.25;
  } else if (G.state === 'morning') {
    L.t += dt; Seq.update(dt);
    c.tYaw = 45 * DEG + Math.sin(L.t * 0.12) * 0.35; c.tPitch = Math.max(0, Math.sin(L.t * 0.09)) * 0.15;
  }
}

function updateCreature(L, c, dt, live) {
  const CR = c.CR;
  c.t += dt * c.timeScale;
  if (c.lane.follow === 'behind' && !c.frozen && !c.dead) c.yaw = G.cam.yaw + Math.PI;
  c.visFrac = L.visFrac ? L.visFrac(c) : (CR.hidden && CR.hidden(c)) ? 0 : APPROACH.visFrac(L, c.lane, c, null);
  const seen = c.visFrac >= (CR.seenFrac === undefined ? 0.2 : CR.seenFrac);
  c.seen = seen; c.visible = seen;
  if (CR.onSeen && seen && !c.seenLast) CR.onSeen(c);
  c.seenLast = seen;
  let m = CR.speedMult(c, dt, seen) * ((CR.ignoresGaze || c.ignoresGaze) ? 1 : (seen ? c.seenMult : c.unseenMult));
  if (c.frozen || c.dead) m = 0;
  const prevDist = c.dist;
  let d;
  if (c.hold !== null) d = c.hold;
  else if (c.distFn) d = c.distFn(c, dt);
  else { c.u = clamp(c.u + dt * m / c.T, 0, 1); d = c.D0 * Math.pow(1 - c.u, c.gamma); }
  const barrier = c.idx === 0 ? L.barrierDist : (c.lane.barrierDist || 0);
  if (L.won && barrier && !c.distFn && c.hold === null) d = Math.max(d, Math.min(barrier, prevDist)); // held at the barrier, or where it already was if it got inside
  if (c.hitched) { c.hitched = false; G.shake(0.05); }
  c.dist = d;
  const moved = Math.abs(prevDist - d);
  const prevGait = c.gait;
  c.gait += moved * CR.stepRate * Math.PI;
  c.moving = moved > 0.024 * dt; // a rate, not a per-frame distance, so the slowest walkers step at any refresh rate
  if (!c.moving && !c.dead) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  if (CR.voice && !c.dead && live) { // muted or not: the captions still need these
    if (c.voiceT === undefined) c.voiceT = CR.voice.every[0] + c.rand() * (CR.voice.every[1] - CR.voice.every[0]);
    c.voiceT -= dt * (1 + clamp(1 - d / 40, 0, 1));
    if (c.voiceT <= 0) { c.voiceT = CR.voice.every[0] + c.rand() * (CR.voice.every[1] - CR.voice.every[0]); AUDIO.voice(CR.voice.kind, clamp(3 / (d + 2), 0, 0.7), Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); }
  }
  const pan = Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
  if (CR.sound && Math.floor(c.gait / Math.PI) !== Math.floor(prevGait / Math.PI)) AUDIO.footstep(CR.sound, clamp(2.4 / (d + 1.6), 0, 0.85) * 0.6, pan);
  if (CR.silentWhenSeen && !G.muted && c.idx === 0) AUDIO.setLoop((!seen && c.moving && !L.won) ? 'grind' : null, clamp(0.15 + 3 / (d + 2), 0, 0.6), pan);
  c.lat = CR.lateral ? CR.lateral(c) : 0;
  const cp = c.pos(), li = LIGHT.list.length ? LIGHT.at(cp.x, cp.y + CR.h * 0.5, cp.z) : null;
  c.lit = Math.max(L.creatureLit ? L.creatureLit(c) : 0, li ? Math.min(1, li.lit) : 0);
  if (live) maybeSwitchLane(L, c);
  if (live && !L.won && barrier && !c.reached && d <= barrier) { c.reached = true; if (L.onReach) L.onReach(c); }
  // a sealed way (L.sealed(lane)) holds it at the barrier, or where it already is if it got inside first, until the night is
  // won. On Nightmare, after a moment, it goes round to an open way if it has one (with that way's cue), starting outside that
  // way's barrier; below Nightmare, or on a night that opts out of changing ways (laneSwitch: false), it stands there.
  if (live && !L.won && barrier && L.sealed && !c.distFn && d <= barrier + 0.01) {
    if (c.hold === null && L.sealed(c.lane)) { c.hold = Math.min(barrier, d); c.sealHold = true; c.sealHeldAt = L.t; c.dist = d = c.hold; }
    else if (c.hold !== null && c.sealHeldAt !== undefined && L.t - c.sealHeldAt > 2.5) {
      c.sealHeldAt = undefined;
      const open = (c.fixedLane || !L.diff.laneSwitch || L.def.laneSwitch === false) ? [] : L.lanes.filter(l => l !== c.lane && !l.noSwitch && !L.sealed(l) && (!c.laneOptions || c.laneOptions.includes(l.idx)));
      if (open.length) {
        const ln = open[Math.floor(c.rand() * open.length)];
        c.hold = null; c.sealHold = false; c.retarget(ln.idx); c.reached = false;
        const dn = Math.max(d, (ln.barrierDist || 0) + 3); c.u = clamp(1 - Math.pow(dn / c.D0, 1 / c.gamma), 0, 1); c.dist = d = c.D0 * Math.pow(1 - c.u, c.gamma); // going round takes it back out
        if (c.idx === 0) { L.laneIdx = ln.idx; L.lane = ln; L.barrierDist = ln.barrierDist || 0; }
        if (ln.cue) AUDIO.sfx(ln.cue, Math.sin(wrapPi(ln.yaw - G.cam.yaw)) * 0.85);
        if (L.onLaneSwitch) L.onLaneSwitch(c, ln);
      }
    }
  }
  if (live && !L.won && d <= c.catchDist && !c.dead) {
    if (L.onCatch && L.onCatch(c)) return;
    die(c, (L.deathCause && L.deathCause(c)) || (c.reached && L.text.death.reached ? 'reached' : 'default'));
  }
}
// On Nightmare a flagged night lets the thing change its approach once, early on and only while it is
// unseen; the new lane's cue sound is the only warning. dist is a function of progress, so nothing jumps.
function maybeSwitchLane(L, c) {
  if (!L.diff.laneSwitch || L.def.laneSwitch === false || L.lanes.length < 2 || c.switched || c.fixedLane || L.won || c.dead || c.hold !== null) return; // never while it is held somewhere
  if (c.switchAt === undefined) c.switchAt = 0.12 + c.rand() * 0.28;
  if (c.u < c.switchAt || c.seen) return;
  const options = L.lanes.filter(l => l !== c.lane && !l.noSwitch && (!c.laneOptions || c.laneOptions.includes(l.idx)));
  c.switched = true;
  if (!options.length) return;
  const ln = options[Math.floor(c.rand() * options.length)];
  c.retarget(ln.idx); c.reached = false;
  if (c.idx === 0) { L.laneIdx = ln.idx; L.lane = ln; L.barrierDist = ln.barrierDist || 0; }
  if (ln.cue) AUDIO.sfx(ln.cue, Math.sin(wrapPi(ln.yaw - G.cam.yaw)) * 0.85);
  if (L.onLaneSwitch) L.onLaneSwitch(c, ln);
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
  G.danger = Math.pow(prox, 2.2) * (SAVE.data.settings.reducedFlash ? 0.6 : (0.35 + 0.65 * pulse));
}

// ---------------- render ----------------
function render() {
  const L = G.L; if (!L) return;
  const c = G.cam;
  const wob = SAVE.data.settings.reducedMotion ? 0 : (c.zoom - 1) * 0.0018;
  const view = { yaw: c.yaw + Math.sin(G.t * 1.7) * wob + Math.sin(G.t * 2.9) * wob * 0.5, pitch: c.pitch + Math.cos(G.t * 1.3) * wob, zoom: c.zoom, shakeX: c.shakeX, shakeY: c.shakeY };
  R.begin(view, L, G.t);
  const rend = L.rend || (L.rend = new Map());
  for (const it of L.items) if (!it.taken) {
    let p = rend.get(it);
    if (!p) { p = { kind: 'sprite', hit: { kind: 'item', ref: it }, hitPad: 8, draw: (ctx, P) => { ctx.scale(it.w, it.h); it.icon(ctx, P); } }; rend.set(it, p); }
    p.x = it.x; p.y = it.y; p.z = it.z; p.w = it.w; p.h = it.h; p.flat = it.flat; p.dist = Math.hypot(it.x, it.z); p.layer = 1;
    R.add(p);
  }
  for (const t of L.targets) if (!t.hidden) {
    let p = rend.get(t);
    if (!p) { p = { kind: 'sprite', hit: { kind: 'target', ref: t }, draw: () => {}, x: t.x, y: t.y, z: t.z, w: t.w, h: t.h, flat: t.flat, noHover: !t.flat && t.w > 1.5 }; rend.set(t, p); }
    R.add(p);
  }
  if (G.throwing) {
    const th = G.throwing, k = th.t / th.dur, arc = Math.sin(k * Math.PI) * 0.8;
    const x = lerp(th.from.x, th.to.x, k), y = lerp(th.from.y, th.to.y, k) + arc, z = lerp(th.from.z, th.to.z, k);
    R.add({ kind: 'sprite', x, y, z, w: th.it.w, h: th.it.h, draw: (ctx, P) => { ctx.scale(th.it.w, th.it.h); th.it.icon(ctx, P); } });
  }
  if (L.dynamic) L.dynamic();
  if (L.clouds) for (const cl of L.clouds) { const yaw = cl.yaw0 + G.t * cl.drift; const r = 800 * Math.cos(Math.asin(cl.y / 800)); cl.x = Math.sin(yaw) * r; cl.z = Math.cos(yaw) * r; R.add(cl); }
  const canUse = G.state === 'play' && !!activeUse(L);
  for (const cr of L.creatures) {
    const CR = cr.CR, pos = cr.pos();
    let p = rend.get(cr);
    if (!p) { p = { kind: 'sprite', w: CR.w, h: CR.h, fogScale: 0.85, hitPad: 12, noHover: true, hitRef: { kind: 'creature', ref: cr }, draw: (ctx, P) => { if (!cr.dead && !cr.lunge) { ctx.scale(1, 1 + 0.014 * Math.sin(cr.t * 1.6)); if (!cr.moving) ctx.rotate(0.008 * Math.sin(cr.t * 0.7)); } CR.draw(ctx, cr, P); } }; rend.set(cr, p); }
    p.x = pos.x; p.y = pos.y + cr.yOff; p.z = pos.z; p.dist = cr.dist; p.layer = 1;
    p.hit = (canUse && !cr.dead) ? p.hitRef : null;
    R.add(p);
  }
  R.hover = G.hover ? G.hover.ref : null;
  R.flush();
  const S = SAVE.data.settings;
  R.post({
    danger: G.danger, flash: G.flashAmt, fade: G.fade, white: G.white, dangerCap: S.reducedFlash ? 0.35 : 0.75, flashCap: S.reducedFlash ? 0.2 : 1,
    glows: L.glows ? L.glows() : null,
    drawOverlay: (ctx, W, H) => drawGunOverlay(ctx, W, H),
    grain: G.state === 'title' ? 0.05 : G.state === 'morning' ? 0.03 : 0.07 + G.danger * 0.05,
    vignette: G.state === 'morning' ? 0.25 : 0.9,
  });
  updateHover();
  updateHUD();
}

function drawGunOverlay(ctx, W, H) {
  const L = G.L;
  const u = activeUse(L);
  if (!u || G.state === 'dead' || G.state === 'dying') return;
  if (G.cam.pitch < 0.3 && G.state === 'play' && G.mouse.x >= 0 && (!u.ammo || G.hasItem(u.ammo) || (u.dudAmmo && G.hasItem(u.dudAmmo)))) {
    ctx.strokeStyle = 'rgba(255,230,200,0.5)'; ctx.lineWidth = 1;
    const mx = G.mouse.x, my = G.mouse.y - R.viewY;
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
      const dpr = Math.min(window.devicePixelRatio || 1, 3); const cv = document.createElement('canvas'); cv.width = cv.height = 64 * dpr; // sharp on phones and retina screens
      const x = cv.getContext('2d');
      x.scale(dpr, dpr); x.translate(32, 58); x.scale(52, -52);
      it.icon(x, { col: cc => rgba(cc), cola: (cc, a) => rgba(cc, a), raw: cc => rgba(cc), fog: 0, t: 0 });
      slot.appendChild(cv);
      const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = it.name + (it.uses > 1 ? ' ×' + it.uses : '');
      slot.appendChild(lab);
      slot.addEventListener('click', e => {
        e.stopPropagation();
        if (idx !== G.active && G.inv[G.active] && combine(G.inv[G.active], it)) { G.invSig = ''; return; }
        if (idx === G.active && G.state === 'play' && G.cam.pitch > 0.5) { dropActive(); G.invSig = ''; return; } // tap the held thing again while looking down: put it down (touch has no empty floor to tap on a crowded night)
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

// ---------------- gamepad ----------------
const PAD = { dir: 0, a: false, start: false, b: false, zoom: false };
function pollGamepad() {
  if (!navigator.getGamepads) return;
  const pads = navigator.getGamepads(); let pad = null;
  for (const p of pads) if (p && p.connected) { pad = p; break; }
  if (!pad) return;
  const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
  const left = pad.buttons[14] && pad.buttons[14].pressed || ax < -0.6, right = pad.buttons[15] && pad.buttons[15].pressed || ax > 0.6;
  const up = pad.buttons[12] && pad.buttons[12].pressed || ay < -0.6, down = pad.buttons[13] && pad.buttons[13].pressed || ay > 0.6;
  const dir = left ? 1 : right ? 2 : up ? 3 : down ? 4 : 0;
  const a = pad.buttons[0] && pad.buttons[0].pressed, b = pad.buttons[1] && pad.buttons[1].pressed, start = pad.buttons[9] && pad.buttons[9].pressed;
  const zoom = (pad.buttons[7] && pad.buttons[7].pressed) || (pad.buttons[6] && pad.buttons[6].pressed) || (pad.buttons[5] && pad.buttons[5].pressed);
  const fake = key => ({ key, preventDefault() {}, shiftKey: false });
  if (dir !== PAD.dir && dir) {
    if (G.state === 'play') onKeyDown(fake(['', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'][dir]));
    else {
      const f = document.activeElement;
      if (f && f.tagName === 'INPUT' && f.type === 'range' && dir <= 2) { if (dir === 1) f.stepDown(); else f.stepUp(); f.dispatchEvent(new Event('input')); } // left and right move a slider
      else MENU.onKey(fake(dir === 1 || dir === 3 ? 'ArrowUp' : 'ArrowDown'));
    }
  }
  PAD.dir = dir;
  if (a && !PAD.a) {
    if (G.state === 'play') gamepadUse();
    else { // A presses the focused button or ticks the focused box; only the click-anywhere screens go on with it
      const f = document.activeElement;
      if (f && (f.tagName === 'BUTTON' || (f.tagName === 'INPUT' && f.type === 'checkbox'))) f.click();
      else if (!(f && f.tagName === 'INPUT') && !LIST_SCREENS.includes(MENU.kind)) proceed();
    }
  }
  PAD.a = a;
  if (start && !PAD.start) { if (G.state === 'play') pauseGame(); else if (LIST_SCREENS.includes(MENU.kind)) MENU.onKey(fake('Escape')); else proceed(); }
  PAD.start = start;
  if (b && !PAD.b) { if (G.state === 'play' && G.inv.length) { G.cam.tPitch = PITCH_DOWN; dropActive(); } else if (G.state !== 'play') onKeyDown(fake('Escape')); } // B goes back, as Escape does
  PAD.b = b;
  if (!!zoom !== PAD.zoom) { PAD.zoom = !!zoom; if (G.state === 'play') G.cam.zoomHeld = PAD.zoom; }
}
// use whatever is nearest the middle of the view; with nothing there, put the held thing down when looking down
function gamepadUse() {
  ensureAudio();
  let best = null, bestD = Infinity;
  for (const r of R.hits) { const dx = r.x + r.w / 2 - R.W / 2, dy = r.y + r.h / 2 - R.viewY - R.H / 2, d = Math.hypot(dx, dy); if (d < bestD) { best = r; bestD = d; } }
  if (best && bestD < Math.min(R.W, R.H) * 0.45) {
    G.mouse.x = best.x + best.w / 2; G.mouse.y = best.y + best.h / 2; updateHover();
    const h = G.hover;
    if (h && h.kind === 'target' && h.ref.hold) { G.holding = h.ref; setTimeout(() => { if (G.holding === h.ref && !h.ref.done) G.holding = null; }, (h.ref.hold + 0.5) * 1000); return; }
    onClick({ clientX: G.mouse.x, clientY: G.mouse.y, target: UI.canvas, button: 0 });
    return;
  }
  if (G.cam.pitch > 0.5 && G.inv.length) dropActive();
}

// ---------------- touch controls ----------------
function bindTouch() {
  const press = (id, down, up) => {
    const el = $(id); if (!el) return;
    const d = e => { e.preventDefault(); e.stopPropagation(); ensureAudio(); if (G.state !== 'play') { if (!LIST_SCREENS.includes(MENU.kind)) proceed(); return; } down(); };
    const u = e => { e.preventDefault(); if (up) up(); };
    el.addEventListener('pointerdown', d); el.addEventListener('pointerup', u); el.addEventListener('pointercancel', u); el.addEventListener('pointerleave', u);
  };
  press('tLeft', () => onKeyDown({ key: 'ArrowLeft', preventDefault() {} }));
  press('tRight', () => onKeyDown({ key: 'ArrowRight', preventDefault() {} }));
  press('tUp', () => onKeyDown({ key: 'ArrowUp', preventDefault() {} }));
  press('tDown', () => onKeyDown({ key: 'ArrowDown', preventDefault() {} }));
  press('tZoom', () => { G.cam.zoomHeld = true; }, () => { G.cam.zoomHeld = false; });
  press('tUse', () => gamepadUse());
  press('tPause', () => pauseGame());
}

// ---------------- boot ----------------
function frame(now) {
  const dt = Math.min(0.05, (now - G._last) / 1000); G._last = now;
  G.fps = lerp(G.fps, 1 / Math.max(dt, 1e-3), 0.05);
  if (G.state === 'error') { try { pollGamepad(); } catch (e2) { void e2; } } // a pad can still restart
  if (!document.hidden && G.state !== 'error') {
    try { const t0 = G.benching ? performance.now() : 0; pollGamepad(); update(dt); render(); CAPTIONS.update(); if (G.benching) G.benching.push(performance.now() - t0); }
    catch (e) {
      G.errorCount++;
      console.error(e);
      G.error = e; setState('error'); MENU.clear(); // whatever screen was up, the error overlay is click-anywhere
      showOverlay('<h1 class="red">Something broke</h1><p class="intro">' + escapeHtml(e.message) + '<br>seed ' + G.runSeed + '</p><p class="prompt">Press R, click or tap to start the night over</p>');
      G.overlayArmed = 0; // the clock does not run in the error state, so the overlay must not wait on it
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
    onClick(e);
  });
  UI.mute.addEventListener('click', e => { e.stopPropagation(); ensureAudio(); toggleMute(); });
  bindTouch();
  SAVE.load();
  G.difficulty = clamp(SAVE.data.settings.difficulty | 0, 0, DIFFICULTIES.length - 1);
  setMuted(!!SAVE.data.settings.muted);
  MENU.applyAll();
  document.addEventListener('visibilitychange', () => { if (document.hidden) AUDIO.suspend(); else if (G.state !== 'paused') AUDIO.resume(); }); // only a paused game stays silent on return
  const q = new URLSearchParams(location.search);
  G.debug = q.has('debug');
  if (G.debug) UI.debug.style.display = 'block';
  G.noRaf = q.has('nofr');
  if (q.has('diff')) { const di = DIFFICULTIES.findIndex(d => d.id === q.get('diff')); if (di >= 0) G.difficulty = di; }
  const sd = parseInt(q.get('seed'), 10);
  G.seed = isNaN(sd) ? null : sd;
  G.runSeed = G.seed !== null ? G.seed : (Date.now() % 1000000);
  showTitle();
  if (q.has('bench')) startBench(parseInt(q.get('bench'), 10) || 1);
  if (q.has('level')) { const n = parseInt(q.get('level'), 10); if (!isNaN(n)) startLevel(clamp(n - 1, 0, LEVELS.length - 1), !q.has('go')); }
  if (G.debug) { const probs = validateContent(); if (probs.length) console.warn('content problems:\n' + probs.join('\n')); else console.log('content ok'); }
  G._last = performance.now();
  if (!G.noRaf) requestAnimationFrame(frame);
}
// ?bench=N: play night N and sweep every direction and pitch, measuring frame times; results in G.bench
function startBench(n) {
  startLevel(clamp(n - 1, 0, LEVELS.length - 1), false);
  G.benching = [];
  const views = []; for (let d = 0; d < 8; d++) for (const down of [false, true]) views.push({ d, down });
  let frames = 0;
  const tick = () => {
    frames++;
    const v = views[Math.min(views.length - 1, Math.floor(frames / 60))];
    G.cam.dirIdx = v.d; G.cam.tYaw = G.cam.yaw = v.d * 45 * DEG; G.cam.tPitch = G.cam.pitch = v.down ? PITCH_DOWN : 0;
    if (frames < views.length * 60) requestAnimationFrame(tick);
    else {
      const s = G.benching.slice(10).sort((a, b) => a - b); G.benching = null;
      G.bench = { night: n, frames: s.length, mean: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2), p50: +s[Math.floor(s.length * 0.5)].toFixed(2), p95: +s[Math.floor(s.length * 0.95)].toFixed(2), max: +s[s.length - 1].toFixed(2) };
      console.log('bench (ms of update+render per frame)', JSON.stringify(G.bench));
      if (G.debug) UI.debug.textContent = 'bench ' + JSON.stringify(G.bench);
    }
  };
  requestAnimationFrame(tick);
}
window.addEventListener('DOMContentLoaded', init);
