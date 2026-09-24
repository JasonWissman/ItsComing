'use strict';
// ---------- game state, input, interaction, HUD and the main loop ----------
const PITCH_DOWN = 58 * DEG;
const DIR_NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const SAVE_KEY = 'itscoming.unlocked';

const G = {
  state: 'title', levelIndex: 0, L: null,
  cam: { yaw: 0, pitch: 0, zoom: 1, tYaw: 0, tPitch: 0, dirIdx: 0, zoomHeld: false, shakeX: 0, shakeY: 0 },
  inv: [], active: 0, hover: null, mouse: { x: -1, y: -1 },
  t: 0, stateT: 0, shakeAmt: 0, flashAmt: 0, fade: 1, fadeTarget: 0, danger: 0,
  hb: { next: 0, last: -10 }, toastT: 0, unlocked: 0, invSig: '', debug: false, paused: false,
  shake(a) { G.shakeAmt = Math.max(G.shakeAmt, a); },
  flash(a) { G.flashAmt = Math.max(G.flashAmt, a); },
  hasItem(id) { return G.inv.some(i => i.id === id); },
  removeFromInv(it) { const i = G.inv.indexOf(it); if (i >= 0) G.inv.splice(i, 1); if (G.active >= G.inv.length) G.active = Math.max(0, G.inv.length - 1); },
  toast(msg, dur) { const el = UI.toast; el.textContent = msg; el.classList.add('show'); G.toastT = dur || 2.6; },
};

const UI = {};
function $(id) { return document.getElementById(id); }

// ---------------- level construction ----------------
function buildLevel(i) {
  const def = LEVELS[i];
  const L = {
    def, index: i, t: 0, facing: def.facing * DEG, eyeH: def.eyeH || 1.65, pal: def.pal,
    props: [], items: [], targets: [], flags: {}, won: false, aftermathT: 0,
  };
  L.pt = (x, y, z) => { const r = rotY(x, z, L.facing); return [r[0], y, r[1]]; };
  L.at = (deg, dist, y) => L.pt(Math.sin(deg * DEG) * dist, y, Math.cos(deg * DEG) * dist);
  def.build(L);
  const cd = def.creature, CR = CREATURES[cd.type];
  L.creature = {
    type: cd.type, CR, yaw: L.facing, D0: cd.startDist, T: cd.time, gamma: cd.gamma || 0.72,
    seenMult: cd.seenMult === undefined ? 1 : cd.seenMult, unseenMult: cd.unseenMult === undefined ? 1.3 : cd.unseenMult,
    u: 0, dist: cd.startDist, gait: 0, t: 0, visible: true, seenLast: true, lit: 0, lat: 0, yOff: 0, lunge: 0, frozen: false, reached: false, rect: null,
  };
  CR.init(L.creature);
  return L;
}

function startLevel(i, withCard) {
  if (G.L && G.L.onEnd) G.L.onEnd();
  AUDIO.stopLoop();
  G.levelIndex = i;
  G.L = buildLevel(i);
  G.inv = []; G.active = 0; G.hover = null; G.invSig = '';
  const c = G.cam;
  c.dirIdx = ((Math.round(G.L.facing / (45 * DEG)) % 8) + 8) % 8;
  c.tYaw = c.yaw = c.dirIdx * 45 * DEG; c.tPitch = c.pitch = 0; c.zoom = 1; c.zoomHeld = false;
  G.hb.next = 0; G.hb.last = -10; G.danger = 0; G.shakeAmt = 0; G.flashAmt = 0;
  G.fade = 1; G.fadeTarget = 0;
  if (withCard) {
    setState('card');
    showOverlay('<div class="kicker">Level ' + (i + 1) + ' of ' + LEVELS.length + '</div><h1>' + G.L.def.title + '</h1><p class="intro">' + G.L.def.intro + '</p><p class="hint">' + G.L.def.objective + '</p><p class="prompt">Click or press Enter when you are ready</p>');
  } else {
    setState('play');
    hideOverlay();
    beginPlay();
  }
}
function beginPlay() {
  const L = G.L;
  L.t = 0; L.creature.t = 0;
  if (AUDIO.on()) { AUDIO.resume(); AUDIO.startAmbient(L.def.ambient); }
  G.fadeTarget = 0;
}
function setState(s) { G.state = s; G.stateT = 0; }

// ---------------- overlays ----------------
function showOverlay(html) { UI.overlay.innerHTML = html; UI.overlay.classList.add('show'); UI.hud.classList.add('dim'); }
function hideOverlay() { UI.overlay.classList.remove('show'); UI.hud.classList.remove('dim'); }
function showTitle() {
  if (G.L && G.L.onEnd) G.L.onEnd();
  AUDIO.stopAmbient(); AUDIO.stopLoop();
  G.L = buildLevel(0);
  G.inv = [];
  const c = G.cam; c.tYaw = c.yaw = 0; c.tPitch = c.pitch = 0; c.zoom = 1;
  G.fade = 0.35; G.fadeTarget = 0.35;
  setState('title');
  let cont = '';
  if (G.unlocked > 0 && G.unlocked < LEVELS.length) cont = '<p class="prompt">Press Enter or click to begin from the start<br><span class="alt">Press <b>C</b> to continue from level ' + (G.unlocked + 1) + ' — ' + LEVELS[G.unlocked].title + '</span></p>';
  else cont = '<p class="prompt">Press Enter or click to begin</p>';
  showOverlay(
    '<div class="kicker">A short horror game</div><h1 class="big">IT\'S COMING</h1>' +
    '<p class="intro">Something is coming straight at you from a long way off. Every time you look away and look back, it is closer.<br>You have to look away to find what will keep it out.</p>' +
    '<div class="controls"><div><b>← →</b> turn (8 directions)</div><div><b>↑ ↓</b> look ahead / look down</div><div><b>hold Shift</b> zoom in</div><div><b>click</b> pick up, place, use</div><div><b>Esc</b> pause &nbsp; <b>M</b> mute</div></div>' +
    cont + '<p class="fine">Headphones recommended. Sound is synthesized in your browser.</p>'
  );
}
function showEnd() {
  setState('end');
  showOverlay('<div class="kicker">The end</div><h1>You saw all of them</h1><p class="intro">Five nights. Five things that came straight at you, and none of them got there.<br>You will keep checking the field, though. And the road. And the tree line.</p><p class="prompt">Press Enter or click to go back to the beginning</p>');
}

// ---------------- input ----------------
function onKeyDown(e) {
  const k = e.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();
  if (k === 'm' || k === 'M') { toggleMute(); return; }
  if (k === 'Escape') { if (G.state === 'play') pauseGame(); else if (G.state === 'paused') resumeGame(); return; }
  if (G.state !== 'play') {
    if (k === 'Enter' || k === ' ') proceed();
    if ((k === 'c' || k === 'C') && G.state === 'title' && G.unlocked > 0 && G.unlocked < LEVELS.length) { ensureAudio(); startLevel(G.unlocked, true); }
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
function ensureAudio() { if (!AUDIO.on()) { AUDIO.init(); if (G.muted) AUDIO.on(); } AUDIO.resume(); }
function toggleMute() { G.muted = !G.muted; UI.mute.textContent = G.muted ? 'muted (M)' : 'sound on (M)'; if (AUDIO.on()) AUDIO.resume(); document.documentElement.classList.toggle('muted', G.muted); }
function pauseGame() { setState('paused'); showOverlay('<h1>Paused</h1><p class="intro">It is not.</p><p class="prompt">Press Esc to keep going</p>'); }
function resumeGame() { setState('play'); hideOverlay(); }

function proceed() {
  ensureAudio();
  switch (G.state) {
    case 'title': startLevel(0, true); break;
    case 'card': hideOverlay(); setState('play'); beginPlay(); break;
    case 'dead': startLevel(G.levelIndex, false); break;
    case 'survived': {
      const next = G.levelIndex + 1;
      if (next >= LEVELS.length) { showEnd(); } else startLevel(next, true);
      break;
    }
    case 'end': showTitle(); break;
    case 'paused': resumeGame(); break;
    default: break;
  }
}

function onMouseMove(e) { G.mouse.x = e.clientX; G.mouse.y = e.clientY; }
function onClick(e) {
  if (e.target.closest && e.target.closest('#touch')) return;
  if (G.state !== 'play') { proceed(); return; }
  ensureAudio();
  G.mouse.x = e.clientX; G.mouse.y = e.clientY;
  updateHover();
  const h = G.hover, L = G.L;
  if (h) {
    if (h.kind === 'item') pickup(h.ref);
    else if (h.kind === 'target') useTarget(h.ref);
    else if (h.kind === 'creature') { if (L.shoot) L.shoot(true); }
    else if (h.kind === 'slot') { G.active = h.ref; AUDIO.sfx('ui'); }
    return;
  }
  // empty space: shoot, or put something down while looking at the floor
  if (L.shoot && L.gun.have && G.cam.pitch < 0.3) { L.shoot(false); return; }
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
function dropActive() {
  const it = G.inv[G.active]; if (!it) return;
  G.removeFromInv(it);
  const c = G.cam, L = G.L;
  const d = 1.3 + Math.random() * 0.3, a = c.yaw + (Math.random() - 0.5) * 0.4;
  it.x = Math.sin(a) * d; it.z = Math.cos(a) * d; it.y = L.floorY || 0; it.flat = true;
  it.taken = false;
  AUDIO.sfx('drop');
  G.hover = null;
}
function useTarget(t) {
  const L = G.L;
  if (t.onClick && t.onClick()) return;
  if (t.done && !t.accepts.length) { G.toast(t.hint ? t.hint() : 'Done.'); return; }
  // pick the item: the active one if it fits, otherwise anything that fits
  let item = G.inv[G.active];
  if (!item || !t.accepts.includes(item.id)) item = G.inv.find(i => t.accepts.includes(i.id));
  if (!item) {
    if (t.accepts.length) G.toast(t.hint ? t.hint() : 'You need something for this.');
    AUDIO.sfx('nope'); return;
  }
  const missing = (t.requires || []).filter(id => !G.hasItem(id));
  if (missing.length) { G.toast('You need the ' + missing[0] + ' for that.'); AUDIO.sfx('nope'); return; }
  const ok = t.use(item);
  if (!ok) { AUDIO.sfx('nope'); return; }
  if (!item.tool) { item.uses--; if (item.uses <= 0) G.removeFromInv(item); }
  if (t.count >= t.needed && t.needed > 1) t.done = true;
  if (!L.won && L.isWon && L.isWon()) win();
}
function win() {
  const L = G.L; L.won = true; L.aftermathT = 0;
  setState('won');
  G.unlocked = Math.max(G.unlocked, L.index + 1);
  try { localStorage.setItem(SAVE_KEY, String(G.unlocked)); } catch (e) {}
  AUDIO.stopLoop();
}
function die() {
  const L = G.L, c = L.creature;
  setState('dying');
  AUDIO.sfx('sting'); AUDIO.stopLoop(); AUDIO.stopAmbient();
  G.shake(1.4);
  c.lunge = 0; c.frozen = true; c.lungeFrom = c.dist;
  G.cam.tYaw = G.cam.yaw + wrapPi(c.yaw - G.cam.yaw); G.cam.tPitch = 0; G.cam.zoomHeld = false;
  G.deathTime = L.t;
}

// ---------------- hover ----------------
function updateHover() {
  const hits = R.hits, mx = G.mouse.x, my = G.mouse.y;
  let h = null;
  if (G.state === 'play' && mx >= 0) {
    for (let i = hits.length - 1; i >= 0; i--) { const r = hits[i]; if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) { h = r; break; } }
  }
  G.hover = h;
  // tooltip
  let tip = '';
  if (h) {
    if (h.kind === 'item') tip = h.ref.name + (h.ref.uses > 1 ? ' ×' + h.ref.uses : '');
    else if (h.kind === 'target') tip = h.ref.hint ? h.ref.hint() : h.ref.name;
    else if (h.kind === 'creature') tip = G.L.gunLoaded && G.L.gunLoaded() ? (G.L.creature.dist < 32 ? 'Fire.' : 'Too far.') : '';
  } else if (G.state === 'play' && G.cam.pitch > 0.5 && G.inv.length && !(G.L.shoot && G.L.gun.have && false)) tip = 'Put down the ' + G.inv[G.active].name.toLowerCase();
  UI.tooltip.textContent = tip;
  UI.tooltip.style.display = tip ? 'block' : 'none';
  UI.canvas.style.cursor = h ? 'pointer' : (G.L && G.L.gunLoaded && G.L.gunLoaded() && G.cam.pitch < 0.3 ? 'crosshair' : 'default');
}

// ---------------- update ----------------
function update(dt) {
  G.t += dt;
  const L = G.L; if (!L) return;
  const c = G.cam;
  // camera easing
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

  if (G.state === 'play' || G.state === 'won') {
    L.t += dt;
    if (L.update) L.update(dt);
    updateCreature(dt, G.state === 'play');
    if (G.state === 'play') { heartbeat(dt); if (!L.won && L.isWon && L.isWon()) win(); }
    else {
      L.aftermathT += dt;
      G.danger *= Math.exp(-dt * 2);
      if (L.aftermath(L.aftermathT, dt)) {
        if (L.aftermathT > 0 && G.fadeTarget < 1) { G.fadeTarget = 1; AUDIO.sfx('win'); AUDIO.stopAmbient(); }
        if (G.fade > 0.97) {
          setState('survived'); AUDIO.stopLoop();
          showOverlay('<div class="kicker">' + L.def.title + '</div><h1>You survived</h1><p class="intro">' + L.aftermathText + '</p><p class="prompt">' + (L.index + 1 < LEVELS.length ? 'Press Enter or click for the next night' : 'Press Enter or click') + '</p>');
        }
      }
    }
  } else if (G.state === 'dying') {
    G.stateT += dt;
    const cr = L.creature, CR = cr.CR;
    const k = clamp((G.stateT - 0.22) / 0.5, 0, 1);
    cr.lunge = k; cr.lat = lerp(cr.lat, 0, 0.3); cr.t += dt;
    cr.dist = lerp(cr.lungeFrom, 0.55, easeIn(k));
    cr.yOff = lerp(0, L.eyeH - CR.faceY, smoothstep(k));
    G.danger = Math.min(1, G.danger + dt * 3);
    if (G.stateT > 0.95) { G.fade = 1; G.fadeTarget = 1; }
    if (G.stateT > 1.9) {
      setState('dead');
      showOverlay('<h1 class="red">It got you</h1><p class="intro">It reached you after ' + Math.round(G.deathTime) + ' seconds.<br>' + deathLine(L) + '</p><p class="prompt">Press Enter or click to try that night again</p>');
    }
  } else if (G.state === 'title') {
    L.t += dt * 0.25; L.creature.t += dt * 0.25;
    c.tYaw = Math.sin(G.t * 0.05) * 0.25;
  }
}
function deathLine(L) {
  const lines = {
    field: 'The boards were not enough, or were not there.',
    road: 'It came through the windshield.',
    graveyard: 'It was still smiling when it stepped over the threshold.',
    quarry: 'You looked away. It only needed a moment.',
    clearing: 'The shells were in the box. The box was on the porch.',
  };
  return lines[L.def.id] || '';
}

function updateCreature(dt, live) {
  const L = G.L, c = L.creature, CR = c.CR;
  c.t += dt;
  const seen = c.visible;
  if (CR.onSeen && seen && !c.seenLast) CR.onSeen(c);
  c.seenLast = seen;
  let m = CR.speedMult(c, dt, seen) * (seen ? c.seenMult : c.unseenMult);
  if (c.frozen || c.dead) m = 0;
  const prevDist = c.dist;
  c.u = clamp(c.u + dt * m / c.T, 0, 1);
  let d = c.D0 * Math.pow(1 - c.u, c.gamma);
  if (L.won && L.barrierDist) d = Math.max(d, L.barrierDist);
  if (c.hitched) { c.hitched = false; G.shake(0.05); }
  c.dist = d;
  const moved = Math.max(0, prevDist - d);
  const prevGait = c.gait;
  c.gait += moved * CR.stepRate * Math.PI;
  c.moving = moved > 0.0004;
  const pan = Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85;
  if (CR.sound && Math.floor(c.gait / Math.PI) !== Math.floor(prevGait / Math.PI) && !G.muted) {
    AUDIO.footstep(CR.sound, clamp(2.4 / (d + 1.6), 0, 0.85) * 0.6, pan);
  }
  if (CR.silentWhenSeen && !G.muted) AUDIO.setLoop((!seen && c.moving && !L.won) ? 'grind' : null, clamp(0.15 + 3 / (d + 2), 0, 0.6), pan);
  c.lat = CR.lateral ? CR.lateral(c) : 0;
  c.lit = L.creatureLit ? L.creatureLit(c) : 0;
  if (live && !L.won && L.barrierDist && !c.reached && d <= L.barrierDist) { c.reached = true; if (L.onReach) L.onReach(); }
  if (live && !L.won && d <= CR.catchDist && !c.dead) die();
}

function heartbeat(dt) {
  const L = G.L, c = L.creature;
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
  for (const t of L.targets) R.add({ kind: 'sprite', x: t.x, y: t.y, z: t.z, w: t.w, h: t.h, flat: t.flat, hit: { kind: 'target', ref: t }, draw: () => {}, noHover: !t.flat && t.w > 1.5 });
  if (L.dynamic) L.dynamic();
  // the creature: a billboard on its approach line, plus any lateral weave
  const cr = L.creature, CR = cr.CR;
  const rx = Math.cos(cr.yaw), rz = -Math.sin(cr.yaw);
  const cx = Math.sin(cr.yaw) * cr.dist + rx * cr.lat, cz = Math.cos(cr.yaw) * cr.dist + rz * cr.lat;
  const hittable = G.state === 'play' && L.creatureHittable && L.creatureHittable() && !cr.dead;
  R.add({
    kind: 'sprite', x: cx, y: cr.yOff, z: cz, w: CR.w, h: CR.h, dist: cr.dist, fogScale: 0.85,
    hit: hittable ? { kind: 'creature', ref: cr } : null, hitPad: 12, noHover: true,
    draw: (ctx, P) => CR.draw(ctx, cr, P),
    onRect: rect => {
      cr.rect = rect;
      cr.visible = !!rect && rect.x < R.W && rect.x + rect.w > 0 && rect.y < R.H && rect.y + rect.h > 0;
    }
  });
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
  if (!L.gun || !L.gun.have || G.state === 'dead' || G.state === 'dying') return;
  const up = clamp(G.cam.pitch / PITCH_DOWN, 0, 1);
  const k = L.gun.recoil;
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
  if (L.gunLoaded && L.gunLoaded() && G.cam.pitch < 0.3 && G.state === 'play' && G.mouse.x >= 0) {
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
  // compass: current direction bright; the thing's direction ticked in red
  const cur = c.dirIdx, thing = ((Math.round(L.creature.yaw / (45 * DEG)) % 8) + 8) % 8;
  if (G._compassSig !== cur + ':' + thing) {
    G._compassSig = cur + ':' + thing;
    let html = '';
    for (let i = 0; i < 8; i++) html += '<span class="' + (i === cur ? 'cur' : '') + (i === thing ? ' thing' : '') + '">' + DIR_NAMES[i] + '</span>';
    UI.compass.innerHTML = html;
  }
  UI.pitch.textContent = c.tPitch > 0.1 ? '▼ looking down' : '▲ looking ahead';
  UI.zoom.style.opacity = c.zoom > 1.2 ? 1 : 0;
  const obj = L.objectiveText ? L.objectiveText() : L.def.objective;
  if (UI.objective.textContent !== obj) UI.objective.textContent = obj;
  // inventory
  const sig = G.inv.map(i => i.id + ':' + i.uses).join('|') + '#' + G.active;
  if (sig !== G.invSig) {
    G.invSig = sig;
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
      slot.addEventListener('click', e => { e.stopPropagation(); G.active = idx; G.invSig = ''; AUDIO.sfx('ui'); });
      UI.inv.appendChild(slot);
    });
  }
  if (G.debug) UI.debug.textContent = 'dist ' + L.creature.dist.toFixed(1) + 'm  u ' + L.creature.u.toFixed(3) + '  t ' + L.t.toFixed(1) + 's  seen ' + L.creature.visible + '  mode ' + (L.creature.mode || '-') + ' pose ' + (L.creature.pose === undefined ? '-' : L.creature.pose) + '  fps ' + G.fps.toFixed(0);
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
function init() {
  UI.canvas = $('game'); UI.hud = $('hud'); UI.compass = $('compass'); UI.objective = $('objective'); UI.pitch = $('pitch');
  UI.zoom = $('zoom'); UI.tooltip = $('tooltip'); UI.inv = $('inventory'); UI.overlay = $('overlay'); UI.toast = $('toast'); UI.debug = $('debug'); UI.mute = $('mute');
  R.attach(UI.canvas); R.resize();
  window.addEventListener('resize', R.resize);
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('blur', () => { G.cam.zoomHeld = false; });
  UI.canvas.addEventListener('click', onClick);
  UI.overlay.addEventListener('click', onClick);
  UI.mute.addEventListener('click', e => { e.stopPropagation(); toggleMute(); });
  bindTouch();
  try { G.unlocked = parseInt(localStorage.getItem(SAVE_KEY) || '0', 10) || 0; } catch (e) { G.unlocked = 0; }
  const q = new URLSearchParams(location.search);
  G.debug = q.has('debug');
  if (G.debug) UI.debug.style.display = 'block';
  G.fps = 60;
  showTitle();
  if (q.has('level')) { const n = clamp(parseInt(q.get('level'), 10) - 1, 0, LEVELS.length - 1); startLevel(n, !q.has('go')); }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    G.fps = lerp(G.fps, 1 / Math.max(dt, 1e-3), 0.05);
    if (!document.hidden) { update(dt); render(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
window.addEventListener('DOMContentLoaded', init);
