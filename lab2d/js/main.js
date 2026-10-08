'use strict';
// ---------- the 2D art lab: the game's renderer, the game's creatures and five new ones, and the passes ----------
// Everything on screen is drawn by js/render.js, so what works here ports by moving a function, not a renderer.
const LAB2 = (() => {
  const $ = id => document.getElementById(id);
  const q = new URLSearchParams(location.search);
  const settings = PANEL.load();
  if (q.has('scene')) settings.scene = q.get('scene');
  if (q.has('creature')) settings.creature = q.get('creature');
  if (q.has('lineup')) { settings.mode = 'lineup'; if (q.get('lineup')) settings.lineup = q.get('lineup'); }
  if (q.has('set')) for (const pair of q.get('set').split(',')) { const [k, raw] = pair.split(':'); if (!(k in PANEL.DEFAULTS)) continue; settings[k] = raw === 'true' ? true : raw === 'false' ? false : isNaN(parseFloat(raw)) ? raw : parseFloat(raw); }
  const S = { settings, ready: false, noRaf: q.has('nofr'), error: null, frames: 0, t: 0, paused: false, benchResult: null, sweepResult: null };
  const cam = { yaw: 0, pitch: 0, zoom: 1, tYaw: 0, tPitch: 0, dirIdx: 0, zoomHeld: false, shakeX: 0, shakeY: 0 };
  let L = null, panel = null, things = [], one = null, state = 'play', stateT = 0, danger = 0, flash = 0, shake = 0, fade = 0, toastT = 0, decals = [];
  const stats = { ring: new Float64Array(240), n: 0, head: 0, last: 0 };
  const EXTRA = {};   // creatures the lab adds at run time (dropped SVGs)
  const PITCH_DOWN = 45 * DEG;

  function showError(e) { S.error = String(e && e.stack || e); const el = $('error'); el.style.display = 'block'; el.textContent = 'Something broke\n' + S.error; console.error(e); }
  window.addEventListener('error', e => showError(e.error || e.message));
  window.addEventListener('unhandledrejection', e => showError(e.reason));
  function toast(msg, dur) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); toastT = dur || 2.6; }
  function overlay(html) { const el = $('overlay'); el.innerHTML = html; el.classList.toggle('show', !!html); }
  const registry = () => Object.assign({}, CREATURES, EXTRA);
  // a creature's drawing as an SVG of parts (lab2d/js/record.js): the editing master
  function exportSvg(id) { const CR = registry()[id]; if (!CR) throw new Error('no creature ' + id); return RECORD.exportSvg(id, CR); }
  function downloadText(text, name, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'image/svg+xml' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
  const labIds = () => Object.keys(CREATURES).filter(k => CREATURES[k].lab);
  const gameIds = () => Object.keys(CREATURES).filter(k => !CREATURES[k].lab);

  // ---------------- the things ----------------
  function makeThing(type, x, z) {
    const CR = registry()[type]; if (!CR) throw new Error('no creature ' + type);
    const c = { type, CR, x: x || 0, z: z || 0, lat: 0, yOff: 0, dist: 30, D0: settings.startDist, T: 60, gamma: 0.72, u: 0, gait: 0, t: 0, seen: true, visFrac: 1, moving: true, lunge: 0, frozen: false, dead: false, hits: 0, hurtFlash: 0, rand: mulberry32(((x || 0) * 97 + 13) | 0), yaw: 0, lastMove: 0 };
    CR.init(c);
    return c;
  }
  function resetThings() {
    things = []; decals = []; state = 'play'; stateT = 0; danger = 0; overlay('');
    if (settings.mode === 'lineup') {
      const ids = settings.lineup === 'lab' ? labIds() : settings.lineup === 'game' ? gameIds() : labIds().concat(gameIds());
      const all = ids.concat(Object.keys(EXTRA));
      const gap = settings.lineupGap;
      all.forEach((id, i) => { const c = makeThing(id, (i - (all.length - 1) / 2) * gap, 5); c.dist = settings.lineupDist; things.push(c); });
      one = null;
    } else {
      one = makeThing(settings.creature, 0, 0);
      one.D0 = settings.startDist; one.dist = one.D0;
      things = [one];
    }
  }
  function setDist(d) { if (!one) return; d = clamp(d, one.CR.catchDist + 0.05, one.D0); one.u = clamp(1 - Math.pow(d / one.D0, 1 / one.gamma), 0, 1); one.dist = one.D0 * Math.pow(1 - one.u, one.gamma); }
  // the game's visibility rule for a thing on the lane ahead, without apertures
  function visFrac(c) {
    const r = R.projectRect(c.x, c.yOff, c.z, c.CR.w, c.CR.h, null);
    if (!r) return 0;
    const w = Math.min(r.x + r.w, R.W) - Math.max(r.x, 0), h = Math.min(r.y + r.h, R.H) - Math.max(r.y, 0);
    return (w > 0 && h > 0) ? (w * h) / Math.max(1e-6, r.w * r.h) : 0;
  }
  function updateThings(dt) {
    for (const c of things) {
      c.t += dt * (c.CR.timeScale || 1);
      if (c.hurtFlash > 0) c.hurtFlash -= dt;
      if (settings.mode === 'lineup') {
        c.moving = true; const m = c.CR.speedMult(c, dt, true);
        c.gait += dt * 1.1 * Math.max(0.2, m) * c.CR.stepRate * Math.PI;
        c.dist = settings.lineupDist; c.seen = true; c.lunge = 0;
        continue;
      }
      if (state !== 'play') { c.gait += 0; continue; }
      c.visFrac = visFrac(c); c.seen = c.visFrac >= (c.CR.seenFrac === undefined ? 0.2 : c.CR.seenFrac);
      let m = c.CR.speedMult(c, dt, c.seen) * ((c.seen || !settings.gaze) ? 1 : 1.35) * settings.speed;
      if (c.hold !== undefined && c.hold !== null) m = 0;
      const prev = c.dist;
      c.u = clamp(c.u + dt * m / c.T, 0, 1); c.dist = c.D0 * Math.pow(1 - c.u, c.gamma);
      if (c.hold !== undefined && c.hold !== null) c.dist = c.hold;
      const moved = Math.abs(prev - c.dist);
      c.gait += moved * c.CR.stepRate * Math.PI;
      c.moving = moved > 0.024 * dt;
      if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
      c.lat = c.CR.lateral ? c.CR.lateral(c) : 0;
      c.x = c.lat; c.z = c.dist;
      if (c.CR.lab && c.type === 'sackhead' && c.moving && c.dist - c.lastMove < -0.9) { c.lastMove = c.dist; decals.push({ x: c.x + (c.rand() - 0.5) * 0.4, z: c.z, r: 0.08 + c.rand() * 0.1, seed: c.rand() * 100 }); if (decals.length > 40) decals.shift(); }
      if (c.dist <= c.CR.catchDist) { state = 'dying'; stateT = 0; c.lungeFrom = c.dist; cam.tYaw = cam.yaw + wrapPi(0 - cam.yaw); cam.tPitch = 0; cam.zoomHeld = false; cam.dirIdx = 0; shake = 1.4; HANDS.hit(); }
    }
    if (state === 'dying' && one) {
      stateT += dt;
      const delay = (one.CR.death && one.CR.death.delay !== undefined) ? one.CR.death.delay : 0.22, dur = (one.CR.death && one.CR.death.dur !== undefined) ? one.CR.death.dur : 0.5;
      const k = clamp((stateT - delay) / dur, 0, 1);
      one.lunge = k; one.lat = lerp(one.lat, 0, 0.3); one.x = one.lat;
      one.dist = lerp(one.lungeFrom, 0.55, easeIn(k)); one.z = one.dist;
      one.yOff = lerp(0, L.eyeH - one.CR.faceY, smoothstep(k));
      danger = Math.min(1, danger + dt * 3);
      if (stateT > delay + dur + 0.25) fade = Math.min(1, fade + dt * 2.5);
      if (stateT > delay + dur + 1.2) { state = 'caught'; overlay('<h1>It got you</h1><p class="prompt">R, Esc or click to start again</p>'); }
    }
  }
  function heartbeat(dt) {
    if (!one || state !== 'play' || !settings.danger) { if (!settings.danger) danger = 0; return; }
    const from = Math.min(50, one.D0 / 2), to = one.CR.catchDist, prox = clamp(1 - (one.dist - to) / Math.max(0.5, from - to), 0, 1);
    const interval = lerp(1.35, 0.32, Math.pow(prox, 1.5));
    if (S.t >= (S.hbNext || 0)) { S.hbLast = S.t; S.hbNext = S.t + interval; }
    const pulse = Math.exp(-(S.t - (S.hbLast || -10)) / 0.22);
    danger = Math.pow(prox, 2.2) * (0.35 + 0.65 * pulse);
  }

  // ---------------- the frame ----------------
  function update(dt) {
    S.t += dt; G.t = S.t; G.L.t = S.t; G.cam.yaw = cam.yaw;
    cam.yaw += wrapPi(cam.tYaw - cam.yaw) * (1 - Math.exp(-dt * 11));
    cam.pitch += (cam.tPitch - cam.pitch) * (1 - Math.exp(-dt * 10));
    const tz = cam.zoomHeld && state === 'play' ? 2.6 : 1;
    cam.zoom += (tz - cam.zoom) * (1 - Math.exp(-dt * 8));
    shake = Math.max(0, shake - dt * 2.2); flash = Math.max(0, flash - dt * 3);
    const sh = shake * 16 + danger * 2; cam.shakeX = (Math.random() - 0.5) * sh; cam.shakeY = (Math.random() - 0.5) * sh;
    updateThings(dt); heartbeat(dt);
    HANDS.update(dt, cam.yaw);
    // lights: the set's, plus the candles
    const lights = L.lights.slice();
    for (const c of things) if (c.flames && c.flames.length && c.type === 'candlebearer') {
      const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);   // the sprite faces the eye: its x runs along the screen's right
      for (const f of c.flames) lights.push({ x: c.x + rx * f.x, y: f.y + c.yOff, z: c.z + rz * f.x, r: 4.5, i: 0.16, color: [255, 170, 70], flicker: 0.6, seed: f.x * 10 });
    }
    LIGHT.set(lights); LIGHT.update(dt, S.t);
    WEATHER.update(dt, S.t);
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('show'); }
  }
  const glows = [];
  function render(enhanced) {
    const view = { yaw: cam.yaw, pitch: cam.pitch, zoom: cam.zoom, shakeX: cam.shakeX, shakeY: cam.shakeY };
    R.style.ink = enhanced ? settings.inkEdges : 0;
    R.begin(view, L, S.t);
    if (L.dynamic) L.dynamic();
    if (L.clouds) for (const cl of L.clouds) { const yaw = cl.yaw0 + S.t * cl.drift; const r = 800 * Math.cos(Math.asin(cl.y / 800)); cl.x = Math.sin(yaw) * r; cl.z = Math.cos(yaw) * r; R.add(cl); }
    for (const d of decals) R.add({ kind: 'sprite', flat: true, x: d.x, y: 0.004, z: d.z, w: d.r * 2, h: d.r * 1.4, layer: 0, noLight: false, draw: (ctx, P) => { ctx.scale(d.r * 2, d.r * 1.4); P_ell(ctx, 0, 0.5, 0.5, 0.5, (P.spot || P.col)([110, 10, 14])); P_ell(ctx, 0.3, 0.3, 0.15, 0.12, (P.spot || P.col)([110, 10, 14])); } });
    const o = enhanced ? settings : Object.assign({}, settings, { ink: 0, hatch: 0, tone: 0, rim: 0, boil: 0, mono: false, glow: 0 });
    for (const c of things) {
      const CR = c.CR, w = CR.w, h = CR.h;
      if (settings.shadow && enhanced) R.add({ kind: 'sprite', flat: true, x: c.x, y: 0.005, z: c.z, w: w * 0.9, h: 0.55, dist: Math.hypot(c.x, c.z), layer: 1, draw: (ctx, P) => { ctx.scale(w * 0.9, 0.55); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.cola([0, 0, 0], 0.5 * (1 - c.lunge))); } });
      R.add({
        kind: 'sprite', x: c.x, y: c.yOff, z: c.z, w, h, fogScale: 0.85, dist: Math.hypot(c.x, c.z), layer: 1, noLight: !!CR.selfLit,   // a thing that carries its own light is not lit by it
        draw: (ctx, P, s) => {
          const body = (cx, PP) => { cx.save(); if (!c.dead && !c.lunge) { cx.scale(1, 1 + 0.014 * Math.sin(c.t * 1.6)); if (!c.moving) cx.rotate(0.008 * Math.sin(c.t * 0.7)); } CR.draw(cx, c, PP); cx.restore(); };
          PASSES.drawEnhanced(ctx, P, s, body, w, h, o, S.t, glows);
        },
      });
    }
    R.flush();
    R.post({
      danger: settings.danger ? danger : 0, flash, fade, white: 0, dangerCap: 0.75, flashCap: 1,
      grain: settings.grain, vignette: settings.vignette,
      drawOverlay: (ctx, W, H) => {
        if (enhanced) POST2D.draw(ctx, settings, S.t);
        if (settings.hands) HANDS.draw(ctx, W, H, S.t, Object.assign({}, settings, { ink: o.ink, mono: o.mono }), null, settings.item || null);   // nearest of all: in front of the torch circle
      },
    });
  }
  function frame(dt) {
    const t0 = performance.now();
    PASSES.cost.ms = 0; PASSES.cost.sprites = 0; POST2D.cost.ms = 0;
    update(dt);
    if (settings.split) {
      const ctx = R.ctx, cv = ctx.canvas;
      render(true);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(0, 0, cv.width / 2, cv.height); ctx.clip();
      render(false);
      ctx.restore();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(239,230,210,0.5)'; ctx.fillRect(cv.width / 2 - 1, 0, 2, cv.height); ctx.restore();
    } else render(true);
    const ms = performance.now() - t0;
    stats.ring[stats.head] = ms; stats.head = (stats.head + 1) % 240; if (stats.n < 240) stats.n++; stats.last = ms;
    S.frames++;
    if ((S.frames & 7) === 0) hud();
  }
  function pct() {
    const a = Array.from(stats.ring.subarray(0, stats.n)).sort((x, y) => x - y), at = k => (a.length ? a[Math.min(a.length - 1, Math.floor(a.length * k))] : 0);
    return { n: a.length, p50: at(0.5), p95: at(0.95), max: a.length ? a[a.length - 1] : 0 };
  }
  let last = 0;
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!S.paused && !document.hidden && !S.error) { try { frame(dt); } catch (e) { showError(e); } }
    if (!S.noRaf) requestAnimationFrame(tick);
  }

  // ---------------- HUD ----------------
  function hud() {
    const p = pct();
    const c = one;
    $('status').textContent = state === 'play' && c ? (c.dist.toFixed(1) + ' m · ' + (c.seen ? 'seen' : 'unseen, it moves faster') + (c.hold !== undefined && c.hold !== null ? ' · held' : '')) : settings.mode === 'lineup' ? things.length + ' standing at ' + settings.lineupDist + ' m' : '';
    const line = 'frame p50 ' + p.p50.toFixed(1) + ' ms  p95 ' + p.p95.toFixed(1) + ' ms  max ' + p.max.toFixed(1) + ' ms\npasses ' + PASSES.cost.ms.toFixed(1) + ' ms on ' + PASSES.cost.sprites + ' sprite' + (PASSES.cost.sprites === 1 ? '' : 's') + '   scene passes ' + POST2D.cost.ms.toFixed(1) + ' ms\n' + R.W + '×' + R.H + '  ' + (settings.split ? 'compare  ' : '') + settings.scene + '  ' + (settings.mode === 'lineup' ? 'line-up' : (c ? c.CR.name : ''));
    $('stats').textContent = line; panel.setStats(line + (S.sweepResult ? '\n\n' + S.sweepText : ''));
  }

  // ---------------- input ----------------
  function onKeyDown(e) {
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'BUTTON')) return;
    const k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();
    if (e.repeat) return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { cam.dirIdx = (cam.dirIdx + 7) % 8; cam.tYaw = cam.yaw + wrapPi(cam.dirIdx * 45 * DEG - cam.yaw); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { cam.dirIdx = (cam.dirIdx + 1) % 8; cam.tYaw = cam.yaw + wrapPi(cam.dirIdx * 45 * DEG - cam.yaw); }
    else if (k === 'ArrowUp' || k === 'w' || k === 'W') cam.tPitch = 0;
    else if (k === 'ArrowDown' || k === 's' || k === 'S') cam.tPitch = PITCH_DOWN;
    else if (k === 'Shift' || k === 'z' || k === 'Z' || k === ' ') cam.zoomHeld = true;
    else if (k === 'r' || k === 'R' || (k === 'Escape' && state === 'caught')) action('reset');
    else if (k === 'f' || k === 'F') action('fire');
    else if (k === 'h' || k === 'H') { settings.panelHidden = !settings.panelHidden; panel.show(!settings.panelHidden); }
    else if (k === 'p' || k === 'P') { S.paused = !S.paused; toast(S.paused ? 'Paused.' : 'On.'); }
    else if (k === 'b' || k === 'B') action('bench');
    else if (k === 'c' || k === 'C') { settings.split = !settings.split; PANEL.save(settings); panel.refresh(); }
    else if (k === 'l' || k === 'L') { settings.mode = settings.mode === 'lineup' ? 'approach' : 'lineup'; PANEL.save(settings); panel.refresh(); resetThings(); }
  }
  function onKeyUp(e) { const k = e.key; if (k === 'Shift' || k === 'z' || k === 'Z' || k === ' ') cam.zoomHeld = false; }
  function action(act, arg) {
    switch (act) {
      case 'come': if (one) { one.hold = null; toast('It comes.'); } break;
      case 'hold': if (one) { one.hold = one.dist; toast('Held at ' + one.dist.toFixed(1) + ' m.'); } break;
      case 'reset': fade = 0; resetThings(); toast('Again.'); break;
      case 'fire': if (state === 'caught') action('reset'); else { HANDS.trigger(); flash = 0.25; shake = 0.3; if (one) one.hurtFlash = 0.35; } break;
      case 'distance': setDist(arg); break;
      case 'bench': bench().then(r => toast('bench: p50 ' + r.p50 + ' ms, p95 ' + r.p95 + ' ms', 6)).catch(showError); break;
      case 'sweep': sweep().then(() => toast('Cost sweep done: see the readout.', 4)).catch(showError); break;
      case 'defaults': Object.assign(settings, PANEL.DEFAULTS); PANEL.save(settings); panel.refresh(); setScene(settings.scene); resetThings(); break;
      case 'exportSvg': { const id = one ? one.type : settings.creature; try { downloadText(exportSvg(id), id + '.svg'); toast('Exported ' + id + '.svg: edit it, drop it back here.', 4); } catch (e) { showError(e); } break; }
      case 'exportAll': { for (const id of labIds().concat(gameIds())) { try { downloadText(exportSvg(id), id + '.svg'); } catch (e) { showError(e); } } toast('Exported every creature.', 4); break; }
      default: break;
    }
  }
  function onChange(key) {
    if (key === 'scene') setScene(settings.scene);
    else if (key === 'mode' || key === 'creature' || key === 'lineup' || key === 'lineupGap' || key === 'startDist') resetThings();
    else if (key === 'svgMode' || key === 'svgHeight') for (const id in EXTRA) EXTRA[id].apply();
  }

  // ---------------- scenes, creatures, SVGs ----------------
  function setScene(name) {
    L = SCENES.build(name);
    R.prepare(L.props);
    WEATHER.set(L.weather || null, 3);
    G.L = { won: false, t: 0 };
  }
  function creatureOptions() {
    const reg = registry();
    return Object.keys(reg).map(k => [k, reg[k].name + (reg[k].edited ? '' : reg[k].lab ? '  (new)' : reg[k].svg ? '  (svg)' : '')]);
  }
  // an edited export comes back as a rigged creature; any other SVG as a sprite
  function addRig(text, name) {
    const rig = RIG.parseRig(text);
    const baseId = rig.creature || Object.keys(CREATURES).find(k => name.toLowerCase().startsWith(k)) || null;
    const id = 'edit:' + name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    EXTRA[id] = RIG.makeCreature(rig, baseId, (baseId && CREATURES[baseId] ? CREATURES[baseId].name : name) + ' (edited)');
    panel.setOptions('creature', creatureOptions(), id);
    settings.creature = id; settings.mode = 'approach'; PANEL.save(settings); panel.refresh(); resetThings();
    toast(EXTRA[id].name + ': ' + rig.parts.length + ' part' + (rig.parts.length === 1 ? '' : 's') + ', ' + rig.count + ' shapes' + (baseId ? ', moving like the ' + baseId : '') + '.', 5);
    return id;
  }
  function addSvg(parsed, name) {
    const id = 'svg:' + name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const entry = { name: name, svg: true, sprite: null, h: 2, w: 1, faceY: 1.7, stepRate: 1, catchDist: 1.4, sound: null, init() {}, speedMult() { return 1; }, draw(ctx, c, P) { const sp = entry.sprite; if (settings.svgMode === 'live') sp.live(ctx, P); else sp.rasterDraw(ctx, P, (ctx.getTransform().a / (window.devicePixelRatio || 1)) || 1); }, parsed, count: parsed.count };
    entry.apply = () => { entry.sprite = SVGSPRITE.makeSprite(parsed, settings.svgHeight); entry.h = settings.svgHeight; entry.w = entry.sprite.w; entry.faceY = settings.svgHeight * 0.85; };
    entry.apply();
    EXTRA[id] = entry;
    panel.setOptions('creature', creatureOptions(), id);
    settings.creature = id; settings.mode = 'approach'; PANEL.save(settings); panel.refresh(); resetThings();
    toast(name + ': ' + parsed.count + ' paths.', 4);
    return id;
  }
  function bindDrop() {
    const dz = $('drop'); let depth = 0;
    window.addEventListener('dragenter', e => { e.preventDefault(); depth++; dz.classList.add('show'); });
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; dz.classList.remove('show'); } });
    window.addEventListener('drop', async e => {
      e.preventDefault(); depth = 0; dz.classList.remove('show');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (!file) return;
      try { const text = await file.text(), name = file.name.replace(/\.svg$/i, ''); if (RIG.hasParts(text)) addRig(text, name); else addSvg(SVGSPRITE.parse(text), name); } catch (err) { showError(err); }
    });
  }

  // ---------------- bench and the cost sweep ----------------
  function bench(perView) {
    const PER = perView || 60;
    return new Promise(resolve => {
      const views = []; for (let d = 0; d < 8; d++) for (const down of [false, true]) views.push({ d, down });
      const keep = { hold: one ? one.hold : null, dist: one ? one.dist : 0 };
      if (one) { one.hold = 8; setDist(8); }
      const samples = []; let f = 0;
      const run = () => {
        const v = views[Math.min(views.length - 1, Math.floor(f / PER))];
        cam.dirIdx = v.d; cam.tYaw = cam.yaw = v.d * 45 * DEG; cam.tPitch = cam.pitch = v.down ? PITCH_DOWN : 0;
        const t0 = performance.now(); frame(1 / 60); samples.push(performance.now() - t0);
        if (++f < views.length * PER) requestAnimationFrame(run);
        else {
          const s = samples.slice(Math.min(10, samples.length >> 2)).sort((a, b) => a - b);
          const r = { frames: s.length, mean: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2), p50: +s[Math.floor(s.length * 0.5)].toFixed(2), p95: +s[Math.floor(s.length * 0.95)].toFixed(2), max: +s[s.length - 1].toFixed(2), width: R.W, height: R.H, scene: settings.scene, creature: one ? one.type : settings.lineup };
          if (one) { one.hold = keep.hold; setDist(keep.dist); }
          S.benchResult = r; console.log('lab2d bench (ms per frame)', JSON.stringify(r)); resolve(r);
        }
      };
      requestAnimationFrame(run);
    });
  }
  // each pass alone against a plain frame, the thing held at 6 m, N frames each: what each one costs
  const SWEEP = [['ink', 'ink', 2], ['hatch', 'hatch', 0.6], ['tone', 'tone', 0.5], ['rim', 'rim', 0.6], ['boil', 'boil', 1], ['glow', 'glow', 1], ['shadow', 'shadow', true], ['inkEdges', 'inkEdges', 1.5], ['flash', 'flash', 0.8], ['misreg', 'misreg', 2], ['dither', 'dither', 1], ['paper', 'paper', 0.5], ['hands', 'hands', true], ['split', 'split', true]];
  function sweep(perPass) {
    const PER = perPass || 40;
    return new Promise(resolve => {
      const saved = Object.assign({}, settings);
      const off = { ink: 0, hatch: 0, tone: 0, rim: 0, boil: 0, glow: 0, shadow: false, inkEdges: 0, flash: 0, misreg: 0, dither: 0, paper: 0, hands: false, split: false };
      if (one) { one.hold = 6; setDist(6); }
      cam.dirIdx = 0; cam.tYaw = cam.yaw = 0; cam.tPitch = cam.pitch = 0;
      const results = [], steps = [['plain', {}]].concat(SWEEP.map(([name, key, v]) => [name, { [key]: v }]));
      let i = 0;
      const runStep = () => {
        const [name, patch] = steps[i];
        Object.assign(settings, off, patch);
        const samples = []; let f = 0;
        const run = () => {
          const t0 = performance.now(); frame(1 / 60); samples.push(performance.now() - t0);
          if (++f < PER) requestAnimationFrame(run);
          else {
            const s = samples.slice(5).sort((a, b) => a - b);
            results.push({ name, p50: +s[Math.floor(s.length * 0.5)].toFixed(2), p95: +s[Math.floor(s.length * 0.95)].toFixed(2) });
            if (++i < steps.length) requestAnimationFrame(runStep);
            else {
              Object.assign(settings, saved); if (one) { one.hold = saved.hold; }
              const base = results[0].p50;
              S.sweepResult = results.map(r => Object.assign(r, { adds: +(r.p50 - base).toFixed(2) }));
              S.sweepText = 'cost sweep (p50 ms, one thing at 6 m, ' + R.W + '×' + R.H + '):\n' + S.sweepResult.map(r => '  ' + r.name.padEnd(9) + ' ' + r.p50.toFixed(1).padStart(5) + (r.name === 'plain' ? '' : '  +' + r.adds.toFixed(1))).join('\n');
              console.log(S.sweepText); resolve(S.sweepResult);
            }
          }
        };
        requestAnimationFrame(run);
      };
      requestAnimationFrame(runStep);
    });
  }

  // ---------------- boot ----------------
  function boot() {
    try {
      R.attach($('view')); R.resize();
      window.addEventListener('resize', R.resize);
      RIG.installAll();   // edited creatures committed under lab2d/js/creatures/edited
      panel = PANEL.create($('panel'), settings, { change: onChange, action });
      panel.setOptions('creature', creatureOptions(), settings.creature);
      if (!registry()[settings.creature]) settings.creature = 'grinner';
      panel.show(!settings.panelHidden && !q.has('bare'));
      if (q.has('bare')) { $('hud').style.display = 'none'; $('panel').style.display = 'none'; }   // the picture alone, for screenshots
      setScene(settings.scene);
      resetThings();
      if (q.has('dist')) setDist(parseFloat(q.get('dist')));
      if (q.has('hold') && one) one.hold = one.dist;
      if (q.has('dir')) { const d = ((parseInt(q.get('dir'), 10) || 0) % 8 + 8) % 8; cam.dirIdx = d; cam.yaw = cam.tYaw = d * 45 * DEG; }
      if (q.has('down')) cam.pitch = cam.tPitch = PITCH_DOWN;
      window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
      window.addEventListener('blur', () => { cam.zoomHeld = false; });
      $('view').addEventListener('click', () => action('fire'));
      $('overlay').addEventListener('click', () => action('reset'));
      bindDrop();
      if (q.has('svg')) SVGSPRITE.fromUrl(q.get('svg')).then(p => addSvg(p, q.get('svg').split('/').pop().replace(/\.svg$/i, ''))).catch(showError);
      if (q.has('rig')) fetch(q.get('rig')).then(r => r.text()).then(t => addRig(t, q.get('rig').split('/').pop().replace(/\.svg$/i, ''))).catch(showError);
      S.ready = true; last = performance.now();
      if (!S.noRaf) requestAnimationFrame(tick);
      if (q.has('bench')) setTimeout(() => bench(parseInt(q.get('bench'), 10) || 60).catch(showError), 400);
      if (q.has('sweep')) setTimeout(() => sweep(parseInt(q.get('sweep'), 10) || 40).catch(showError), 400);
    } catch (e) { showError(e); }
  }
  window.addEventListener('DOMContentLoaded', boot);
  Object.defineProperties(S, { things: { get: () => things }, one: { get: () => one }, L: { get: () => L }, state: { get: () => state }, panel: { get: () => panel }, extra: { get: () => EXTRA } });
  return Object.assign(S, {
    settings, cam,
    step(dt, n) { for (let i = 0; i < (n || 1); i++) frame(dt === undefined ? 1 / 60 : dt); },
    setDist, reset: () => action('reset'), action, bench, sweep, pct, setScene, resetThings, addSvg, registry, labIds, gameIds,
    loadSvgText: (text, name) => addSvg(SVGSPRITE.parse(text), name || 'svg'),
    loadRigText: (text, name) => addRig(text, name || 'edit'), exportSvg,
  });
})();

window.LAB2 = LAB2;
