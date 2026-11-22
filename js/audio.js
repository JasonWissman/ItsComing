'use strict';
// ---------- Web Audio: everything is synthesized, no sound files ----------
const AUDIO = (() => {
  let ac = null, master = null, noiseBuf = null, muted = false;
  // Every sound goes through one of two volumes (Settings, Volume, Calibrate), and nothing else sets how loud it is:
  //   the effects (bus.effects): every one-shot and sting, the footsteps and voices, the heartbeat, the creature loops
  //     (grind, engine, the farm's fire: they are the things, not the place), the music box, the menus' taps and clicks;
  //   the ambience (bus.ambient): the beds, a night's wind, rain and drone, and the title's drone.
  // There is no main volume over them: the master gain is fixed (MASTER), Mute aside. cal and calAmb are the volume
  // calibration's own ways in, as loud as the effects and as the ambience, never ducked
  const bus = { effects: null, ambient: null, cal: null, calAmb: null };
  const volume = { effects: 1, ambient: 1 };
  const MASTER = 0.85;
  let amb = null;     // ambient bed (wind + drone)
  let loopNode = null; // creature loop (stone grind / engine)
  let hushed = false; // the ambience faded out of the way while the volume calibration's dialog is open (hush)

  function init() {
    if (ac) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0.0001 : MASTER;
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.25;
      master.connect(comp); comp.connect(ac.destination);
      bus.effects = ac.createGain(); bus.effects.gain.value = volume.effects; bus.effects.connect(master);
      bus.ambient = ac.createGain(); bus.ambient.gain.value = hushed ? 0.0001 : volume.ambient; bus.ambient.connect(master);
      bus.cal = ac.createGain(); bus.cal.gain.value = volume.effects; bus.cal.connect(master);
      bus.calAmb = ac.createGain(); bus.calAmb.gain.value = volume.ambient; bus.calAmb.connect(master);
      const len = ac.sampleRate * 2;
      noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; return false; }
    return true;
  }
  const on = () => !!ac;
  const running = () => !!ac && ac.state === 'running';
  function resume() { if (ac && ac.state !== 'running') ac.resume().catch(() => {}); }
  function setMuted(m) {
    muted = !!m;
    if (master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(muted ? 0.0001 : MASTER, ac.currentTime, 0.03); }
  }
  // the effects or the ambience volume (0..1). A bus ducked under a calibration (or the ambience hushed) is left where it
  // is going and set to its volume when that ends; the calibration's own way in follows at once
  function setVolume(which, v) {
    if (!(which in volume)) return;
    volume[which] = clamp(+v || 0, 0, 1);
    if (!ac) return;
    const t = ac.currentTime, held = which === 'effects' ? !!cal : !!cal || hushed;
    if (!held) bus[which].gain.setTargetAtTime(volume[which], t, 0.03);
    bus[which === 'effects' ? 'cal' : 'calAmb'].gain.setTargetAtTime(volume[which], t, 0.03);
  }
  // the ambience faded out over a second or so (on), or back in to its volume (off): while the volume calibration's dialog
  // is open, so what it plays is heard on its own, in clean space (whatever bed is playing: the title's, a paused night's)
  function hush(on) {
    on = !!on;
    if (hushed === on) return;
    hushed = on;
    if (ac && !cal) glide(bus.ambient.gain, on ? 0.0001 : volume.ambient, on ? 0.3 : 0.45);
  }
  function suspend() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); }
  const now = () => ac.currentTime;
  // a gain moved smoothly to v from wherever it is now, whatever was scheduled on it before (a fade in still under way is
  // cut where it has got to, not jumped past): an exponential approach, tc seconds a step
  function glide(param, v, tc) {
    const t = now(), cur = param.value;
    param.cancelScheduledValues(t); param.setValueAtTime(Math.max(0.0001, cur), t); param.setTargetAtTime(v, t, tc);
  }
  // a fade in from silence over sec seconds, anchored at now (so a context that is still waiting for its first gesture,
  // its clock stopped at 0, plays the whole fade once it starts)
  function fadeIn(param, sec) { const t = now(); param.cancelScheduledValues(t); param.setValueAtTime(0.0001, t); param.exponentialRampToValueAtTime(1, t + sec); }

  function panNode(pan) {
    if (!pan || !ac.createStereoPanner) return null;
    const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); return p;
  }
  let out = null;   // where an effect goes: the effects bus, or (a calibration playing) that calibration's own gain
  function chain(last, pan) {
    const p = panNode(pan), dest = out || bus.effects;
    if (p) { last.connect(p); p.connect(dest); } else last.connect(dest);
  }

  // filtered noise burst
  function noise(dur, o) {
    if (!ac) return;
    o = o || {};
    const t0 = now() + (o.delay || 0);
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const flt = ac.createBiquadFilter();
    flt.type = o.type || 'lowpass'; flt.frequency.value = o.freq || 800; flt.Q.value = o.q || 0.8;
    const g = ac.createGain();
    const att = o.attack || 0.004, vol = o.vol === undefined ? 0.4 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + att + dur);
    src.connect(flt); flt.connect(g); chain(g, o.pan);
    src.start(t0, Math.random() * 1.2); src.stop(t0 + att + dur + 0.05);
  }
  // simple tone with optional pitch sweep
  function tone(freq, dur, o) {
    if (!ac) return;
    o = o || {};
    const t0 = now() + (o.delay || 0);
    const osc = ac.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.endFreq) osc.frequency.exponentialRampToValueAtTime(o.endFreq, t0 + dur);
    const g = ac.createGain();
    const att = o.attack || 0.004, vol = o.vol === undefined ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + att + dur);
    osc.connect(g); chain(g, o.pan);
    osc.start(t0); osc.stop(t0 + att + dur + 0.05);
  }

  // ---- ambient bed ----
  function startAmbient(p) {
    if (typeof CAPTIONS !== 'undefined' && !(p && p.near !== undefined)) CAPTIONS.ambient(p);   // (the title's drone has none: it is the title's, not a sound in the night)
    if (!ac) return;
    stopAmbient();
    const b = bed(p || {}, bus.ambient);
    fadeIn(b.g.gain, p && p.fade > 0 ? p.fade : b.title ? 4 : 3);
    amb = b;
  }
  // a bed made and started, silent (its gain, g, at nothing: the caller fades it in), into dest: { g, nodes } (and the
  // title's, { title, k, set } too)
  function bed(p, dest) {
    const g = ac.createGain(); g.gain.value = 0.0001; g.connect(dest);
    const nodes = [];
    if (p.near !== undefined) return titleBed(g, nodes, p);
    // wind: brown-ish noise through a slowly wandering low-pass
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = p.windFreq || 380; lp.Q.value = 0.7;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.11;
    const lfoG = ac.createGain(); lfoG.gain.value = (p.windFreq || 380) * 0.6;
    lfo.connect(lfoG); lfoG.connect(lp.frequency);
    const lfo2 = ac.createOscillator(); lfo2.frequency.value = 0.037;
    const wg = ac.createGain(); wg.gain.value = 0.22 * (p.wind === undefined ? 1 : p.wind);
    const lfo2G = ac.createGain(); lfo2G.gain.value = wg.gain.value * 0.5;
    lfo2.connect(lfo2G); lfo2G.connect(wg.gain);
    src.connect(lp); lp.connect(wg); wg.connect(g);
    nodes.push(src, lfo, lfo2);
    if (p.rain) {   // rain: bright hiss with a slow swell
      const rs = ac.createBufferSource(); rs.buffer = noiseBuf; rs.loop = true;
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2200;
      const rg = ac.createGain(); rg.gain.value = 0.09 * p.rain;
      const rl = ac.createOscillator(); rl.frequency.value = 0.07; const rlg = ac.createGain(); rlg.gain.value = 0.03 * p.rain; rl.connect(rlg); rlg.connect(rg.gain);
      rs.connect(hp); hp.connect(rg); rg.connect(g); nodes.push(rs, rl);   // started with the rest below, once
    }
    // drone: two detuned oscillators, very quiet
    const dg = ac.createGain(); dg.gain.value = 0.05 * (p.drone === undefined ? 1 : p.drone);
    const base = p.droneFreq || 52;
    for (const m of [1, 1.006, 1.498]) {
      const o = ac.createOscillator(); o.type = m > 1.4 ? 'sine' : 'triangle'; o.frequency.value = base * m;
      const og = ac.createGain(); og.gain.value = m > 1.4 ? 0.35 : 1;
      o.connect(og); og.connect(dg); nodes.push(o);
    }
    dg.connect(g);
    nodes.forEach(n => n.start());
    return { g, nodes };
  }
  // the title's bed (p.near, 0..1: how near the thing on the title is): no wind, only a deep drone, two low notes beating
  // slowly against each other with a breath of rumble under them, and over them a low hum in the throat (a buzzing note two
  // octaves up, beating against itself, a sour note a tritone over it and a breathing band of noise) so a laptop's small
  // speakers carry it too. As it nears it comes up, the filters over it open and a rougher fifth and octave come in above,
  // so it is nearer and thicker as well as louder (titleDrone(k) moves it)
  function titleBed(g, nodes, p) {
    const base = p.droneFreq || 41;
    const level = ac.createGain(); level.gain.value = 0.0001; level.connect(g);   // (how loud for how near, under the fade in)
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.9; lp.frequency.value = 170; lp.connect(level);
    const low = ac.createGain(); low.gain.value = 1; low.connect(lp);
    for (const [m, type, v] of [[1, 'triangle', 1], [1.0045, 'triangle', 0.8], [0.5, 'sine', 0.7]]) {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = base * m;
      const og = ac.createGain(); og.gain.value = v; o.connect(og); og.connect(low); nodes.push(o);
    }
    const thick = ac.createGain(); thick.gain.value = 0.0001; thick.connect(lp);   // the fifth and octave that come in as it nears
    for (const [m, v] of [[1.498, 0.5], [2.003, 0.35], [2.997, 0.12]]) {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = base * m;
      const og = ac.createGain(); og.gain.value = v; o.connect(og); og.connect(thick); nodes.push(o);
    }
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;   // the rumble, breathing slowly
    const nl = ac.createBiquadFilter(); nl.type = 'lowpass'; nl.frequency.value = 110; nl.Q.value = 0.5;
    const ng = ac.createGain(); ng.gain.value = 0.5;
    const br = ac.createOscillator(); br.frequency.value = 0.09; const brg = ac.createGain(); brg.gain.value = 0.35; br.connect(brg); brg.connect(ng.gain);
    src.connect(nl); nl.connect(ng); ng.connect(lp); nodes.push(src, br);
    // the hum in the throat, past the low filter: what small speakers can make of it
    const mlp = ac.createBiquadFilter(); mlp.type = 'lowpass'; mlp.Q.value = 1.4; mlp.frequency.value = 380; mlp.connect(level);
    const mid = ac.createGain(); mid.gain.value = 0.85; mid.connect(mlp);
    for (const [m, type, v] of [[4, 'sawtooth', 0.5], [4.028, 'sawtooth', 0.45], [5.657, 'triangle', 0.22]]) {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = base * m;
      const og = ac.createGain(); og.gain.value = v; o.connect(og); og.connect(mid); nodes.push(o);
    }
    const swell = ac.createOscillator(); swell.frequency.value = 0.061; const swg = ac.createGain(); swg.gain.value = 0.3; swell.connect(swg); swg.connect(mid.gain);
    const hs = ac.createBufferSource(); hs.buffer = noiseBuf; hs.loop = true;   // a breath of noise in the same band
    const hb = ac.createBiquadFilter(); hb.type = 'bandpass'; hb.frequency.value = 260; hb.Q.value = 1.6;
    const hg = ac.createGain(); hg.gain.value = 1.2;
    const hl = ac.createOscillator(); hl.frequency.value = 0.13; const hlg = ac.createGain(); hlg.gain.value = 0.6; hl.connect(hlg); hlg.connect(hg.gain);
    hs.connect(hb); hb.connect(hg); hg.connect(mlp); nodes.push(swell, hs, hl);
    nodes.forEach(n => n.start());
    // far off it is 2 dB up on how loud the line from far to near would have it, easing back to that line as it nears
    // (the near end as it was): FAR_DB at nearness 0, 0 dB at 1
    const FAR_DB = 2;
    const set = (k, tc) => {
      k = clamp(k, 0, 1);
      level.gain.setTargetAtTime((0.04 + 0.05 * k) * Math.pow(10, FAR_DB * (1 - smoothstep(k)) / 20), now(), tc);
      lp.frequency.setTargetAtTime(170 + 330 * k, now(), tc);
      mlp.frequency.setTargetAtTime(380 + 520 * k, now(), tc);
      mid.gain.setTargetAtTime(0.85 + 0.45 * k, now(), tc);
      thick.gain.setTargetAtTime(Math.max(0.0001, 0.45 * k * k), now(), tc);
    };
    set(p.near, 0.05);
    return { g, nodes, title: true, k: p.near, set };
  }
  // the title's drone at nearness k: started if it is not playing (fading in over fade seconds, else its usual four),
  // else moved there over a second or two
  function titleDrone(k, fade) {
    if (!ac) return;
    if (!amb || !amb.title) startAmbient({ tune: 'ambient:title', near: k, fade });   // (tuned as 'ambient:title', by AUDIO.titleDrone below)
    else if (Math.abs(amb.k - k) > 1e-3) { amb.k = k; amb.set(k, 1.2); }
  }
  // the bed faded out and let go: over about 1.6 s, or over sec seconds (the title's drone as the prologue comes up)
  function stopAmbient(sec) {
    if (!amb) return;
    const a = amb; amb = null;
    const len = sec > 0 ? sec : 1.6;
    if (ac.state === 'running') glide(a.g.gain, 0.0001, len / 4);
    else a.g.gain.value = 0.0001;   // (a context not started yet has no time to fade it in)
    setTimeout(() => { a.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { a.g.disconnect(); } catch (e) {} }, len * 1000 + 200);
  }

  // ---- a looping texture that can be switched on/off (stone grind, engine idle) ----
  function setLoop(kind, vol, pan) {
    if (!ac) return;
    if (!kind) { stopLoop(); return; }
    if (loopNode && loopNode.kind !== kind) stopLoop();
    if (!loopNode) {
      const g = ac.createGain(); g.gain.value = 0.0001;
      const p = ac.createStereoPanner ? ac.createStereoPanner() : null; if (p) p.pan.value = clamp(pan || 0, -1, 1); // always a panner, so a loop born centred can still move
      if (p) { g.connect(p); p.connect(bus.effects); } else g.connect(bus.effects);
      const nodes = [];
      if (kind === 'grind') {
        const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 240; bp.Q.value = 2.5;
        const lfo = ac.createOscillator(); lfo.frequency.value = 6; const lg = ac.createGain(); lg.gain.value = 90;
        lfo.connect(lg); lg.connect(bp.frequency);
        src.connect(bp); bp.connect(g); nodes.push(src, lfo);
      } else if (kind === 'engine') {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 38;
        const o2 = ac.createOscillator(); o2.type = 'square'; o2.frequency.value = 76.5;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
        const g2 = ac.createGain(); g2.gain.value = 0.3;
        o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); nodes.push(o, o2);
      } else if (kind === 'fire') {   // night 11's farm burning: a low rushing roar breathing slowly, a brighter hiss over it
        const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.8;
        const lfo = ac.createOscillator(); lfo.frequency.value = 0.7; const lg = ac.createGain(); lg.gain.value = 160;
        lfo.connect(lg); lg.connect(lp.frequency);
        const src2 = ac.createBufferSource(); src2.buffer = noiseBuf; src2.loop = true;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.6;
        const g2 = ac.createGain(); g2.gain.value = 0.25;
        const lfo2 = ac.createOscillator(); lfo2.frequency.value = 2.3; const lg2 = ac.createGain(); lg2.gain.value = 0.12;
        lfo2.connect(lg2); lg2.connect(g2.gain);
        src.connect(lp); lp.connect(g); src2.connect(bp); bp.connect(g2); g2.connect(g); nodes.push(src, src2, lfo, lfo2);
      }
      nodes.forEach(n => n.start());
      loopNode = { kind, g, nodes, pan: p };
    }
    if (loopNode.pan && pan !== undefined) loopNode.pan.pan.setTargetAtTime(clamp(pan, -1, 1), now(), 0.1);
    loopNode.g.gain.setTargetAtTime(Math.max(0.0001, vol), now(), 0.08);
  }
  function stopLoop() {
    if (!loopNode) return;
    const l = loopNode; loopNode = null;
    l.g.gain.setTargetAtTime(0.0001, now(), 0.1);
    setTimeout(() => { l.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { l.g.disconnect(); } catch (e) {} }, 600);
  }

  // ---- one-shots ----
  function heartbeat(vol, fast) {
    tone(54, 0.13, { vol: vol, endFreq: 36 });
    tone(48, 0.17, { vol: vol * 0.8, endFreq: 32, delay: fast ? 0.13 : 0.19 });
  }
  function footstep(kind, vol, pan) {
    if (typeof CAPTIONS !== 'undefined' && vol >= 0.08) CAPTIONS.footstep(kind, pan);
    if (!ac || vol < 0.003) return;
    switch (kind) {
      case 'walker':
        noise(0.12, { freq: 180, vol: vol, pan }); tone(58, 0.09, { vol: vol * 0.7, endFreq: 40, pan }); break;
      case 'crawler':
        for (let i = 0; i < 3; i++) noise(0.03, { type: 'bandpass', freq: 1400 + Math.random() * 900, q: 3, vol: vol * 0.7, pan, delay: i * 0.035 });
        break;
      case 'smiler':
        noise(0.04, { type: 'highpass', freq: 1800, vol: vol * 0.5, pan }); tone(140, 0.05, { vol: vol * 0.35, endFreq: 90, pan }); break;
      case 'runner':
        noise(0.08, { freq: 260, vol: vol, pan }); tone(90, 0.06, { vol: vol * 0.6, endFreq: 50, pan }); break;
      case 'climber':
        noise(0.1, { type: 'bandpass', freq: 2200, q: 3, vol: vol * 0.6, pan }); tone(160, 0.08, { vol: vol * 0.3, endFreq: 120, pan, delay: 0.04 }); break;
      case 'tall':
        noise(0.4, { freq: 90, vol: vol * 1.2, attack: 0.03, pan }); tone(34, 0.5, { vol: vol * 0.9, endFreq: 24, attack: 0.02, pan }); break;
      case 'shoes':
        noise(0.025, { type: 'highpass', freq: 2200, vol: vol * 0.9, pan }); tone(420, 0.04, { vol: vol * 0.35, type: 'square', endFreq: 300, pan }); break;
      case 'shoesRun':   // hard heels, running: the click struck harder, with the weight coming down behind it
        noise(0.03, { type: 'highpass', freq: 2000, vol: vol, pan }); tone(380, 0.04, { vol: vol * 0.4, type: 'square', endFreq: 260, pan }); noise(0.06, { freq: 240, vol: vol * 0.6, pan, delay: 0.01 }); break;
      default: break;
    }
  }
  // creature voices: quiet, panned, sparse
  function voice(kind, vol, pan) {
    if (typeof CAPTIONS !== 'undefined' && vol >= 0.06) CAPTIONS.voice(kind, pan);
    if (!ac || vol < 0.004) return;
    switch (kind) {
      case 'exhale': noise(0.9, { freq: 260, q: 0.6, vol: vol * 0.7, attack: 0.25, pan }); tone(58, 0.8, { vol: vol * 0.25, endFreq: 42, attack: 0.2, pan }); break;
      case 'hum': { const notes = [196, 220, 233, 262, 294]; const f = notes[Math.floor(Math.random() * notes.length)]; tone(f, 1.4, { vol: vol * 0.35, type: 'sine', attack: 0.3, pan }); tone(f * 1.5, 1.2, { vol: vol * 0.12, type: 'sine', attack: 0.4, pan, delay: 0.2 }); break; }
      case 'clicks': for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) noise(0.018, { type: 'bandpass', freq: 2600 + Math.random() * 1500, q: 6, vol: vol * 0.8, delay: i * (0.05 + Math.random() * 0.04), pan }); break;
      case 'pant': for (let i = 0; i < 2; i++) { noise(0.16, { freq: 900, q: 0.8, vol: vol * 0.55, attack: 0.03, delay: i * 0.32, pan }); tone(110, 0.12, { vol: vol * 0.15, endFreq: 80, delay: i * 0.32, pan }); } break;
      case 'gurgle': for (let i = 0; i < 5; i++) noise(0.12, { type: 'bandpass', freq: 300 + Math.random() * 300, q: 3, vol: vol * 0.6, delay: i * 0.13, attack: 0.03, pan }); tone(70, 0.7, { vol: vol * 0.25, endFreq: 50, attack: 0.15, pan }); break;
      case 'slow': noise(2.4, { freq: 140, q: 0.5, vol: vol * 0.8, attack: 0.9, pan }); tone(36, 2.2, { vol: vol * 0.3, endFreq: 28, attack: 0.6, pan }); break;
      default: break;
    }
  }
  function sfx(name, pan, soft) { // soft: a background sound whose caption never replaces one that is still up
    if (typeof CAPTIONS !== 'undefined') CAPTIONS.sfx(name, pan, soft);
    if (!ac) return;
    switch (name) {
      case 'ui': tone(660, 0.05, { vol: 0.08, type: 'triangle' }); break;
      case 'tap': noise(0.016, { type: 'bandpass', freq: 1700, q: 1.6, vol: 0.06 }); tone(210, 0.03, { vol: 0.045, endFreq: 150 }); break;   // a menu button: a soft, short tap
      case 'pickup': tone(420, 0.06, { vol: 0.12, type: 'triangle', endFreq: 520 }); noise(0.05, { type: 'highpass', freq: 3000, vol: 0.06 }); break;
      case 'drop': noise(0.08, { freq: 500, vol: 0.2 }); tone(120, 0.07, { vol: 0.15, endFreq: 70 }); break;
      case 'nope': tone(160, 0.12, { vol: 0.1, type: 'square', endFreq: 110 }); break;
      // a thing tried where it will not go (a fumble), and the empty hand: a light metal tick, a wooden clunk, a thing
      // clattering down on the floor, a soft thing dropping, a hand laid on something, a rattle
      case 'tink': tone(2900, 0.06, { vol: 0.09, type: 'triangle', endFreq: 2650, pan }); tone(4300, 0.03, { vol: 0.04, type: 'sine', pan }); noise(0.015, { type: 'bandpass', freq: 4200, q: 5, vol: 0.12, pan }); break;
      case 'woodKnock': noise(0.05, { type: 'bandpass', freq: 750, q: 1.6, vol: 0.4, pan }); tone(200, 0.09, { vol: 0.22, type: 'triangle', endFreq: 150, pan }); break;
      case 'clatter': for (const [d, f, v] of [[0, 1, 1], [0.07, 1.25, 0.65], [0.12, 0.85, 0.5], [0.2, 1.1, 0.35], [0.26, 1.3, 0.2]]) { noise(0.04, { type: 'bandpass', freq: 1500 * f, q: 2.5, vol: 0.3 * v, delay: d, pan }); tone(310 * f, 0.05, { vol: 0.08 * v, type: 'triangle', endFreq: 260 * f, delay: d, pan }); } noise(0.08, { freq: 300, vol: 0.18, pan }); break;
      case 'flop': noise(0.14, { freq: 320, vol: 0.3, attack: 0.005, pan }); tone(80, 0.1, { vol: 0.12, endFreq: 55, pan }); break;
      case 'page': noise(0.18, { type: 'bandpass', freq: 2600, q: 0.6, vol: 0.13, attack: 0.03, pan }); noise(0.05, { type: 'highpass', freq: 4800, vol: 0.07, delay: 0.14, pan }); break;   // a page turned over
      case 'pat': noise(0.06, { type: 'bandpass', freq: 900, q: 1, vol: 0.2, pan }); tone(140, 0.05, { vol: 0.07, endFreq: 100, pan }); break;
      case 'rattle': for (let i = 0; i < 5; i++) { noise(0.03, { type: 'bandpass', freq: 900 + Math.random() * 700, q: 4, vol: 0.26 * (1 - i * 0.14), delay: i * 0.06, pan }); tone(180 + Math.random() * 60, 0.04, { vol: 0.07, type: 'square', endFreq: 140, delay: i * 0.06, pan }); } break;
      case 'hammer':
        for (let i = 0; i < 3; i++) { noise(0.05, { freq: 1200, vol: 0.5, delay: i * 0.22 }); tone(210, 0.08, { vol: 0.3, endFreq: 120, delay: i * 0.22 }); }
        break;
      case 'smash': noise(0.35, { freq: 900, vol: 0.7 }); tone(90, 0.3, { vol: 0.5, endFreq: 40 }); for (let i = 0; i < 5; i++) noise(0.04, { type: 'bandpass', freq: 2000 + i * 400, q: 4, vol: 0.3, delay: 0.05 + i * 0.04 }); break;
      case 'bang': noise(0.25, { freq: 300, vol: 0.8, pan }); tone(60, 0.25, { vol: 0.6, endFreq: 35, pan }); break;
      case 'boardRattle': for (let i = 0; i < 6; i++) noise(0.035, { type: 'bandpass', freq: 520 + Math.random() * 640, q: 5, vol: 0.42 * (1 - i * 0.12), pan, delay: 0.05 + i * (0.035 + Math.random() * 0.02) }); tone(110, 0.12, { vol: 0.2, endFreq: 70, pan, delay: 0.05 }); break;
      case 'keys': for (let i = 0; i < 4; i++) tone(2400 + Math.random() * 1500, 0.03, { vol: 0.06, type: 'triangle', delay: i * 0.05 }); break;
      case 'crank': {
        // starter motor: chugging sawtooth for ~1s
        const t0 = now();
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(30, t0);
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.28, t0 + 0.05);
        for (let i = 0; i < 6; i++) { g.gain.setValueAtTime(0.28, t0 + 0.05 + i * 0.16); g.gain.linearRampToValueAtTime(0.06, t0 + 0.05 + i * 0.16 + 0.08); }
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05);
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
        o.connect(lp); lp.connect(g); g.connect(bus.effects); o.start(t0); o.stop(t0 + 1.1);
        break;
      }
      case 'start': setLoop('engine', 0.35); tone(45, 1.2, { vol: 0.4, type: 'sawtooth', endFreq: 120 }); noise(0.6, { freq: 400, vol: 0.4 }); break;
      case 'pour': noise(0.9, { type: 'bandpass', freq: 5200, q: 1.2, vol: 0.22, attack: 0.1 }); break;
      case 'strike': noise(0.12, { type: 'highpass', freq: 2500, vol: 0.35 }); noise(0.5, { freq: 900, vol: 0.12, delay: 0.1, attack: 0.08 }); break;
      case 'cloth': noise(0.35, { type: 'bandpass', freq: 1400, q: 0.9, vol: 0.14, attack: 0.04 }); noise(0.2, { type: 'bandpass', freq: 900, q: 1.2, vol: 0.1, delay: 0.22, attack: 0.03 }); break;
      // a breaker tripping: a bang as the main snaps over, the clack of the lever hitting OFF, a spit of sparks, and the
      // hum of everything on it dying away
      case 'breakerTrip': noise(0.07, { type: 'highpass', freq: 1500, vol: 0.9, attack: 0.001, pan }); tone(70, 0.22, { vol: 0.6, endFreq: 38, pan }); noise(0.03, { type: 'highpass', freq: 900, vol: 0.55, delay: 0.05, pan }); tone(160, 0.05, { vol: 0.3, type: 'square', endFreq: 90, delay: 0.05, pan }); for (let i = 0; i < 6; i++) noise(0.022, { type: 'highpass', freq: 3200 + Math.random() * 2400, vol: 0.18 * (1 - i * 0.1), delay: 0.08 + i * (0.04 + Math.random() * 0.05), pan }); tone(120, 0.7, { vol: 0.12, type: 'sawtooth', endFreq: 40, delay: 0.04, pan }); break;
      // night 11's farm set alight (every switch on and the main pushed on): the box bursting, a building catching, the fire
      // crackling, the carrier burning, and caught by it burning
      case 'sparkBlast':   // a cracking bang off the box, a buzz dying under it, the sparks crackling away and the lamps round the farm popping
        noise(0.09, { type: 'highpass', freq: 1200, vol: 1.0, attack: 0.001, pan }); noise(0.5, { freq: 260, vol: 0.85, attack: 0.002, pan }); tone(48, 0.7, { vol: 0.75, endFreq: 26, pan });
        tone(100, 0.9, { vol: 0.16, type: 'sawtooth', endFreq: 55, delay: 0.02, pan }); tone(150, 0.6, { vol: 0.09, type: 'square', endFreq: 70, delay: 0.03, pan });
        for (let i = 0; i < 26; i++) noise(0.012 + Math.random() * 0.02, { type: 'highpass', freq: 2500 + Math.random() * 4000, vol: 0.3 * (1 - i / 30), delay: 0.04 + i * 0.045 + Math.random() * 0.04, pan: clamp((pan || 0) + (Math.random() - 0.5) * 0.8, -1, 1) });
        for (let i = 0; i < 4; i++) noise(0.05, { freq: 900, vol: 0.35, delay: 0.25 + i * 0.07 + Math.random() * 0.04, pan: (Math.random() - 0.5) * 1.6 });
        break;
      case 'fireCatch':   // a building catching: a deep whump, and the flames rushing up it, spitting
        noise(0.25, { freq: 180, vol: 0.7, attack: 0.01, pan }); tone(55, 0.5, { vol: 0.42, endFreq: 34, pan }); noise(1.1, { type: 'bandpass', freq: 700, q: 0.7, vol: 0.35, attack: 0.25, delay: 0.05, pan });
        for (let i = 0; i < 6; i++) noise(0.02, { type: 'bandpass', freq: 1800 + Math.random() * 2000, q: 3, vol: 0.2, delay: 0.15 + i * 0.09 + Math.random() * 0.05, pan });
        break;
      case 'fireCrackle':   // a few pops and snaps of burning wood
        for (let i = 0, n = 3 + Math.floor(Math.random() * 4); i < n; i++) noise(0.008 + Math.random() * 0.02, { type: 'bandpass', freq: 1200 + Math.random() * 3200, q: 2 + Math.random() * 3, vol: 0.12 + Math.random() * 0.2, delay: Math.random() * 0.25, pan });
        if (Math.random() < 0.3) noise(0.05, { freq: 400, vol: 0.2, delay: Math.random() * 0.2, pan });
        break;
      case 'burnShriek': {   // the carrier burning: a ragged shriek through its stitched mouth, rising and cracking
        const f0 = 620 + Math.random() * 200;
        tone(f0, 1.1, { vol: 0.3, type: 'sawtooth', endFreq: f0 * 2.3, attack: 0.04, pan }); tone(f0 * 1.06, 1.0, { vol: 0.18, type: 'sawtooth', endFreq: f0 * 1.7, attack: 0.06, pan });
        noise(1.1, { type: 'bandpass', freq: 2400, q: 1.6, vol: 0.45, attack: 0.03, pan }); noise(0.6, { type: 'bandpass', freq: 900, q: 1.2, vol: 0.28, attack: 0.02, pan });
        tone(f0 * 0.5, 0.9, { vol: 0.11, type: 'square', endFreq: f0 * 0.38, delay: 0.25, pan });
        break;
      }
      case 'stingBurn':   // caught by it burning: the roar of it in your face, its shriek over it, the sting's drop under it
        noise(1.4, { freq: 2200, vol: 0.95, attack: 0.002 }); noise(1.6, { freq: 300, vol: 0.65, attack: 0.04 }); tone(900, 1.1, { vol: 0.38, type: 'sawtooth', endFreq: 2600 }); tone(42, 1.5, { vol: 0.7, endFreq: 24 });
        for (let i = 0; i < 12; i++) noise(0.02, { type: 'bandpass', freq: 1500 + Math.random() * 3000, q: 3, vol: 0.28, delay: 0.05 + i * 0.08 + Math.random() * 0.04 });
        break;
      case 'candle': tone(880, 0.4, { vol: 0.05, type: 'sine', endFreq: 1200 }); break;
      case 'chain': for (let i = 0; i < 7; i++) { tone(1800 + Math.random() * 1200, 0.04, { vol: 0.08, type: 'square', delay: i * 0.07 }); noise(0.03, { type: 'highpass', freq: 4000, vol: 0.08, delay: i * 0.07 }); } break;
      case 'lock': tone(500, 0.05, { vol: 0.2, type: 'square', endFreq: 300 }); tone(220, 0.1, { vol: 0.25, type: 'square', endFreq: 200, delay: 0.09 }); break;
      case 'creak': tone(320, 0.7, { vol: 0.12, type: 'sawtooth', endFreq: 180, pan }); tone(325, 0.7, { vol: 0.06, type: 'sawtooth', endFreq: 260, delay: 0.05, pan }); break;
      case 'hinge': {   // a long iron hinge as a heavy gate swings: one reedy note, rising a little, steady, and gone as it stops
        const t0 = now(), dur = 1.15;
        const osc = ac.createOscillator(); osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(470, t0); osc.frequency.linearRampToValueAtTime(545, t0 + dur);   // (about 2.5 semitones up)
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 2.2;
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.1, t0 + 0.14); g.gain.linearRampToValueAtTime(0.1, t0 + dur - 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(bp); bp.connect(g); chain(g, pan);
        osc.start(t0); osc.stop(t0 + dur + 0.05);
        break;
      }
      case 'gate': noise(0.2, { freq: 400, vol: 0.5, pan }); tone(140, 0.4, { vol: 0.3, type: 'square', endFreq: 90, pan }); break;
      case 'shot': noise(0.5, { freq: 1500, vol: 1.0, attack: 0.002 }); tone(70, 0.5, { vol: 0.7, endFreq: 30 }); noise(1.2, { freq: 300, vol: 0.3, delay: 0.05, attack: 0.02 }); break;
      case 'empty': tone(900, 0.03, { vol: 0.15, type: 'square' }); tone(600, 0.04, { vol: 0.12, type: 'square', delay: 0.06 }); break;
      case 'bowCreak': tone(150 + Math.random() * 70, 0.16, { vol: 0.05, type: 'sawtooth', endFreq: 120 + Math.random() * 40 }); noise(0.12, { type: 'bandpass', freq: 700 + Math.random() * 500, q: 4, vol: 0.09, attack: 0.02 }); break;   // a grain of it: drawing plays one every few tenths of a second
      case 'bowFull': tone(260, 0.05, { vol: 0.1, type: 'square', endFreq: 190 }); noise(0.04, { type: 'bandpass', freq: 2600, q: 5, vol: 0.18 }); tone(118, 0.4, { vol: 0.06, type: 'sawtooth', endFreq: 104, delay: 0.03, attack: 0.02 }); break;   // drawn full: a small hard click as the string comes tight, and a low creak held under it
      case 'twang': tone(98, 0.45, { vol: 0.3, type: 'triangle', endFreq: 88 }); tone(196, 0.25, { vol: 0.12, type: 'triangle', endFreq: 180 }); noise(0.06, { type: 'highpass', freq: 2500, vol: 0.25 }); noise(0.35, { type: 'bandpass', freq: 1800, q: 1.5, vol: 0.12, delay: 0.03, attack: 0.03 }); break;
      case 'thunk': noise(0.09, { freq: 450, vol: 0.8, pan }); tone(85, 0.16, { vol: 0.6, endFreq: 55, pan }); noise(0.03, { type: 'bandpass', freq: 2200, q: 3, vol: 0.25, pan }); break;
      case 'batSqueak':   // a bat hit in the air (night 5's easter egg): the arrow's small tick, then three thin, high squeaks, each falling, the last the longest
        noise(0.02, { type: 'bandpass', freq: 2600, q: 3, vol: 0.12, pan });
        for (const [d, f, len] of [[0.02, 4700, 0.05], [0.09, 5500, 0.05], [0.17, 4200, 0.11]]) { tone(f, len, { vol: 0.07, type: 'triangle', endFreq: f * 0.68, delay: d, pan }); tone(f * 1.5, len * 0.7, { vol: 0.025, type: 'sine', endFreq: f, delay: d, pan }); }
        break;
      case 'load': tone(300, 0.06, { vol: 0.2, type: 'square', endFreq: 220 }); noise(0.05, { freq: 900, vol: 0.2, delay: 0.12 }); tone(400, 0.05, { vol: 0.2, type: 'square', endFreq: 260, delay: 0.2 }); break;
      case 'ratchet': tone(320, 0.04, { vol: 0.18, type: 'square', endFreq: 200 }); noise(0.05, { freq: 1400, vol: 0.25, delay: 0.03 }); break;
      case 'thunder': noise(2.2, { freq: 160, vol: 0.55, attack: 0.15 }); tone(38, 1.8, { vol: 0.45, endFreq: 22, attack: 0.1 }); noise(0.5, { freq: 700, vol: 0.25, delay: 0.3 }); break;
      case 'hiss': noise(0.6, { type: 'bandpass', freq: 3000, q: 0.6, vol: 0.18, attack: 0.05 }); break;
      case 'stingShriek': tone(900, 0.9, { vol: 0.5, type: 'sawtooth', endFreq: 2400 }); noise(1.0, { type: 'bandpass', freq: 3000, q: 2, vol: 0.9, attack: 0.002 }); tone(50, 1.2, { vol: 0.6, endFreq: 30, delay: 0.1 }); break;
      case 'stingHum': for (const f of [196, 233, 277, 330]) tone(f, 1.1, { vol: 0.18, type: 'sine', attack: 0.4 }); noise(0.3, { freq: 200, vol: 0.9, delay: 1.25 }); tone(40, 0.6, { vol: 0.8, endFreq: 26, delay: 1.25 }); break;
      case 'stingStone': noise(0.5, { type: 'bandpass', freq: 240, q: 3, vol: 0.9, attack: 0.002 }); noise(0.9, { freq: 900, vol: 0.6, delay: 0.08 }); tone(34, 1.4, { vol: 0.8, endFreq: 22 }); for (let i = 0; i < 5; i++) noise(0.04, { type: 'bandpass', freq: 1500 + i * 500, q: 5, vol: 0.4, delay: 0.1 + i * 0.05 }); break;
      case 'stingHit': noise(0.18, { freq: 500, vol: 1.0, attack: 0.001 }); tone(70, 0.4, { vol: 0.9, endFreq: 30 }); noise(1.2, { freq: 1200, vol: 0.5, delay: 0.05, attack: 0.05 }); tone(300, 0.9, { vol: 0.3, type: 'sawtooth', endFreq: 60, delay: 0.1 }); break;
      case 'sting':
        noise(1.4, { freq: 2500, vol: 1.0, attack: 0.002 });
        tone(400, 1.2, { vol: 0.5, type: 'sawtooth', endFreq: 40 });
        tone(40, 1.5, { vol: 0.7, endFreq: 25 });
        for (let i = 0; i < 6; i++) tone(1200 + Math.random() * 2000, 0.12, { vol: 0.2, type: 'square', delay: 0.05 + i * 0.09 });
        break;
      case 'win': for (const [f, d] of [[220, 0], [277, 0.25], [330, 0.5], [415, 0.9]]) tone(f, 2.2, { vol: 0.08, type: 'triangle', attack: 0.3, delay: d }); break;
      // stone rubbed on stone, once: a short dry grind, small and close, a little different each time (the watcher's fists at its eyes)
      case 'stoneRub': { const f = 520 + Math.random() * 160; noise(0.13, { type: 'bandpass', freq: f, q: 2.2, vol: 0.2, attack: 0.03, pan }); noise(0.09, { type: 'bandpass', freq: f * 3.1, q: 4, vol: 0.07, attack: 0.02, delay: 0.02, pan }); tone(118 + Math.random() * 14, 0.11, { vol: 0.05, type: 'triangle', endFreq: 96, attack: 0.02, pan }); break; }
      case 'thud': noise(0.15, { freq: 150, vol: 0.9 }); tone(45, 0.25, { vol: 0.8, endFreq: 30 }); break;
      case 'splash': noise(0.35, { freq: 1800, q: 0.7, vol: 0.5, attack: 0.005, pan }); noise(0.9, { type: 'bandpass', freq: 600, q: 0.8, vol: 0.25, delay: 0.08, attack: 0.05, pan }); tone(120, 0.25, { vol: 0.2, endFreq: 60, pan }); break;
      // something heavy into the sea far below: a deep thump, the water thrown up, and the spray coming back down on it
      case 'plunge': tone(52, 0.7, { vol: 0.5, endFreq: 30, pan }); noise(0.3, { freq: 900, vol: 0.45, attack: 0.01, pan }); noise(1.4, { type: 'bandpass', freq: 520, q: 0.6, vol: 0.32, delay: 0.06, attack: 0.08, pan }); noise(0.9, { type: 'highpass', freq: 2400, vol: 0.1, delay: 0.25, attack: 0.15, pan }); break;
      // a steel toolbox coming down on a skull: one hard, hollow knock, the box ringing short and dull over it, and the tools
      // left in it jumping
      case 'clonk':
        noise(0.045, { type: 'bandpass', freq: 1100, q: 1.4, vol: 0.75, attack: 0.001, pan });
        tone(190, 0.2, { vol: 0.6, type: 'triangle', endFreq: 105, pan }); tone(96, 0.16, { vol: 0.45, endFreq: 62, pan });
        tone(590, 0.12, { vol: 0.2, type: 'square', endFreq: 520, pan }); tone(884, 0.08, { vol: 0.08, type: 'square', endFreq: 800, pan });
        for (const d of [0.05, 0.1]) noise(0.025, { type: 'bandpass', freq: 3200, q: 4, vol: 0.14, delay: d, pan });
        break;
      case 'dive': noise(0.5, { type: 'bandpass', freq: 400, q: 1.2, vol: 0.3, attack: 0.02, pan }); tone(90, 0.4, { vol: 0.15, endFreq: 40, pan }); break;
      case 'wetThud': noise(0.2, { freq: 220, vol: 0.8, pan }); noise(0.3, { type: 'bandpass', freq: 900, q: 1, vol: 0.3, delay: 0.03, pan }); tone(50, 0.3, { vol: 0.6, endFreq: 32, pan }); break;
      // a body thrown against a barred door from the water: a deep boom, the wet slap of it, and the boards and the bar rattling
      case 'wetPound': noise(0.24, { freq: 240, vol: 1.0, attack: 0.002, pan }); tone(44, 0.45, { vol: 0.95, endFreq: 26, pan }); noise(0.4, { type: 'bandpass', freq: 750, q: 0.9, vol: 0.45, delay: 0.015, pan }); for (let i = 0; i < 5; i++) noise(0.03, { type: 'bandpass', freq: 1500 + i * 450, q: 5, vol: 0.24, delay: 0.05 + i * 0.03 + Math.random() * 0.02, pan }); break;
      case 'slosh': noise(0.12, { type: 'bandpass', freq: 1100, q: 0.9, vol: 0.42, attack: 0.004, pan }); noise(0.55, { type: 'bandpass', freq: 520, q: 0.7, vol: 0.3, delay: 0.05, attack: 0.03, pan }); noise(0.25, { type: 'highpass', freq: 2600, vol: 0.12, delay: 0.1, attack: 0.02, pan }); break;
      case 'bar': noise(0.15, { freq: 400, vol: 0.6 }); tone(80, 0.3, { vol: 0.5, endFreq: 45 }); noise(0.06, { freq: 1500, vol: 0.3, delay: 0.16 }); break;
      case 'fit': tone(520, 0.05, { vol: 0.18, type: 'square', endFreq: 380 }); noise(0.05, { freq: 1200, vol: 0.2, delay: 0.05 }); break;
      case 'clunk': tone(140, 0.08, { vol: 0.35, type: 'square', endFreq: 90, pan }); noise(0.06, { freq: 700, vol: 0.4, pan }); break;
      case 'lever': noise(0.12, { freq: 900, vol: 0.35 }); tone(180, 0.2, { vol: 0.3, type: 'square', endFreq: 110, delay: 0.08 }); noise(0.05, { freq: 500, vol: 0.5, delay: 0.25 }); break;
      case 'lampOn': tone(60, 1.6, { vol: 0.25, type: 'sine', endFreq: 90, attack: 0.3 }); noise(0.25, { freq: 900, vol: 0.2 }); tone(240, 0.5, { vol: 0.06, type: 'sawtooth', attack: 0.2, delay: 0.3 }); break;
      case 'drawer': noise(0.45, { type: 'bandpass', freq: 700, q: 1.5, vol: 0.22, attack: 0.05, pan }); tone(150, 0.12, { vol: 0.12, type: 'triangle', endFreq: 110, delay: 0.38, pan }); break;
      case 'tug': noise(0.24, { type: 'bandpass', freq: 520, q: 0.9, vol: 0.6, attack: 0.004, pan }); noise(0.4, { type: 'bandpass', freq: 1900, q: 0.7, vol: 0.2, attack: 0.01, delay: 0.03, pan }); tone(72, 0.25, { vol: 0.35, endFreq: 44, pan }); tone(240, 0.3, { vol: 0.05, type: 'sawtooth', endFreq: 170, delay: 0.06, pan }); break;   // the covers yanked hard, the bed creaking under it
      case 'scrape': noise(0.4, { type: 'bandpass', freq: 1800, q: 4, vol: 0.4, attack: 0.02, pan }); tone(230, 0.35, { vol: 0.12, type: 'sawtooth', endFreq: 180, pan }); break;
      case 'bell': for (const [f, d] of [[2093, 0], [2637, 0.05], [2093, 0.13], [2637, 0.2]]) tone(f, 0.7, { vol: 0.1, type: 'sine', delay: d, pan }); noise(0.03, { type: 'highpass', freq: 5000, vol: 0.15, pan }); break;
      case 'tubeDie': for (let i = 0; i < 5; i++) noise(0.03, { type: 'highpass', freq: 3500, vol: 0.18, delay: i * 0.07 + Math.random() * 0.03 }); tone(120, 0.5, { vol: 0.08, type: 'sawtooth', endFreq: 60, delay: 0.3 }); break;
      case 'tubeOn': tone(120, 0.35, { vol: 0.1, type: 'sawtooth', attack: 0.05 }); noise(0.08, { type: 'highpass', freq: 3000, vol: 0.15 }); break;
      case 'glassGive': tone(90, 0.9, { vol: 0.12, type: 'sawtooth', endFreq: 55, pan }); for (let i = 0; i < 6; i++) noise(0.025, { type: 'highpass', freq: 4200, vol: 0.16, delay: 0.1 + i * 0.09 + Math.random() * 0.04, pan }); tone(2400, 0.12, { vol: 0.06, type: 'triangle', endFreq: 1700, delay: 0.55, pan }); break;
      case 'glassTap': for (let i = 0; i < 3; i++) tone(1900, 0.04, { vol: 0.14, type: 'triangle', endFreq: 1500, delay: i * 0.28, pan }); break;
      // fists on a steel roller shutter, deep and heavy (the diner's last shutter): the boom of the blow low in the chest, the
      // dull slap of the fist, the curtain's low steel ring (inharmonic partials from 92 to 323 Hz, soft-edged), and its
      // slats knocking low in the rails, with no high rattle
      case 'shutterBang': noise(0.42, { freq: 170, vol: 0.9, attack: 0.002, pan }); noise(0.08, { type: 'bandpass', freq: 300, q: 1.1, vol: 0.4, pan }); tone(30, 0.62, { vol: 0.85, endFreq: 18, pan }); tone(60, 0.45, { vol: 0.55, type: 'triangle', endFreq: 36, pan }); for (const f of [92, 143, 216, 323]) tone(f, 0.75, { vol: 0.085, type: 'triangle', endFreq: f * 0.95, pan }); tone(143, 0.5, { vol: 0.035, type: 'square', endFreq: 136, pan }); for (let i = 0; i < 4; i++) noise(0.045, { type: 'bandpass', freq: 480 + i * 150, q: 3, vol: 0.14, delay: 0.06 + i * 0.05, pan }); break;
      // small hands taking hold of a roller shutter's bottom rail and tugging at it: the curtain jerking in its rails, a
      // short steel rattle of the slats and a dull knock
      case 'shutterGrab': noise(0.07, { freq: 260, vol: 0.5, attack: 0.002, pan }); tone(70, 0.18, { vol: 0.35, endFreq: 48, pan }); for (let i = 0; i < 6; i++) noise(0.03, { type: 'bandpass', freq: 900 + i * 210, q: 4, vol: 0.16, delay: 0.02 + i * 0.035, pan }); break;
      // a roller shutter shoved up hard, slamming into its housing: a huge metal crash,
      // the roll and the housing ringing, and the slats rattling on as it bounces
      case 'shutterSlam': noise(0.5, { freq: 380, vol: 1.0, attack: 0.002, pan }); noise(0.18, { type: 'bandpass', freq: 2400, q: 0.8, vol: 0.45, pan }); tone(38, 0.8, { vol: 0.9, endFreq: 22, pan }); for (const f of [173, 241, 389, 562, 811]) tone(f, 1.1, { vol: 0.07, type: 'triangle', endFreq: f * 0.97, pan }); for (let i = 0; i < 9; i++) noise(0.035, { type: 'bandpass', freq: 700 + (i % 3) * 400, q: 3, vol: 0.22 * (1 - i / 10), delay: 0.08 + i * 0.06 + i * i * 0.004, pan }); break;
      // the diner's soda fountain: the valve's click, the stream drumming into the cup and the fizz rising off it, and the
      // valve let go
      case 'sodaPour': tone(820, 0.025, { vol: 0.08, type: 'square', endFreq: 520, pan }); noise(0.75, { type: 'bandpass', freq: 1500, q: 0.9, vol: 0.2, attack: 0.04, pan }); noise(0.5, { type: 'bandpass', freq: 650, q: 1.2, vol: 0.12, attack: 0.05, pan }); for (let i = 0; i < 10; i++) noise(0.012, { type: 'highpass', freq: 5200 + Math.random() * 2000, vol: 0.05, delay: 0.25 + i * 0.07 + Math.random() * 0.04, pan }); noise(0.9, { type: 'highpass', freq: 6000, vol: 0.05, attack: 0.3, delay: 0.3, pan }); tone(600, 0.02, { vol: 0.06, type: 'square', endFreq: 420, delay: 0.78, pan }); break;
      // the fountain run dry: the valve's click, then air and a cough, a few spits of syrup and a low gurgle in the lines
      case 'sodaSputter': tone(820, 0.025, { vol: 0.08, type: 'square', endFreq: 520, pan }); noise(0.25, { type: 'bandpass', freq: 2400, q: 0.7, vol: 0.12, attack: 0.02, pan }); for (const d of [0.08, 0.2, 0.27, 0.45, 0.52, 0.74]) noise(0.05, { type: 'bandpass', freq: 700 + Math.random() * 600, q: 2.2, vol: 0.3, delay: d, attack: 0.003, pan }); tone(92, 0.5, { vol: 0.1, type: 'sawtooth', endFreq: 58, delay: 0.1, attack: 0.05, pan }); break;
      // a big swallow: the throat working, wet and low
      case 'gulp': noise(0.07, { type: 'bandpass', freq: 420, q: 2, vol: 0.28, attack: 0.01, pan }); tone(240, 0.11, { vol: 0.2, type: 'sine', endFreq: 120, pan }); tone(90, 0.16, { vol: 0.16, type: 'sine', endFreq: 60, delay: 0.04, pan }); break;
      // night 3's easter egg, the bag of sugar handed to the thing: a whole bag of grains running out of the paper into its
      // mouth (a dry rush, thinning as the bag empties, the paper crackling); the sugar taking hold (a buzz that climbs and
      // quickens, jittering, to a ping); its boots skidding to a stop on the gravel; and its last shudder, keys and all
      case 'sugarPour': noise(0.8, { type: 'bandpass', freq: 4300, q: 0.9, vol: 0.24, attack: 0.07, pan }); noise(0.55, { type: 'highpass', freq: 7000, vol: 0.08, attack: 0.3, delay: 0.3, pan }); for (let i = 0; i < 7; i++) noise(0.02, { type: 'bandpass', freq: 1500 + Math.random() * 1500, q: 3, vol: 0.09, delay: i * 0.12 + Math.random() * 0.06, pan }); break;
      case 'sugarBuzz': tone(70, 0.8, { vol: 0.1, type: 'sawtooth', endFreq: 520, attack: 0.25, pan }); for (let i = 0, d = 0; i < 16; i++) { tone(150 + i * 34, 0.035, { vol: 0.05 + i * 0.004, type: 'square', endFreq: 170 + i * 34, delay: d, pan }); d += 0.085 - i * 0.004; } tone(1560, 0.16, { vol: 0.1, type: 'triangle', delay: 0.8, pan }); break;
      case 'skid': noise(0.42, { type: 'bandpass', freq: 1900, q: 0.8, vol: 0.3, attack: 0.02, pan }); noise(0.3, { type: 'bandpass', freq: 700, q: 1.2, vol: 0.2, attack: 0.03, delay: 0.08, pan }); for (let i = 0; i < 5; i++) noise(0.02, { type: 'bandpass', freq: 2400 + Math.random() * 1600, q: 4, vol: 0.12, delay: 0.05 + i * 0.07 + Math.random() * 0.03, pan }); tone(70, 0.1, { vol: 0.14, endFreq: 45, delay: 0.44, pan }); break;
      case 'shudder': for (let i = 0; i < 7; i++) { tone(190 + (i % 2) * 70, 0.03, { vol: 0.07, type: 'square', endFreq: 150, delay: 0.14 + i * 0.045, pan }); tone(2500 + Math.random() * 1500, 0.025, { vol: 0.045, type: 'triangle', delay: 0.14 + i * 0.045 + 0.01, pan }); } noise(0.25, { type: 'bandpass', freq: 500, q: 1, vol: 0.08, attack: 0.1, delay: 0.1, pan }); break;
      // a fist brought down on the diner's counter: a heavy thump in the wood under the top, and the things on it jumping
      case 'counterPound': noise(0.2, { freq: 240, vol: 0.85, attack: 0.002, pan }); tone(68, 0.26, { vol: 0.6, endFreq: 42, pan }); noise(0.05, { type: 'bandpass', freq: 900, q: 1.3, vol: 0.28, pan }); for (let i = 0; i < 3; i++) noise(0.02, { type: 'bandpass', freq: 2400 + Math.random() * 1400, q: 6, vol: 0.07, delay: 0.03 + i * 0.035 + Math.random() * 0.02, pan }); break;
      // a paper cup set down on the counter
      case 'cupDown': noise(0.035, { type: 'bandpass', freq: 1150, q: 1.5, vol: 0.2, pan }); tone(310, 0.04, { vol: 0.05, type: 'triangle', endFreq: 230, pan }); break;
      case 'musicbox': [[880, 0], [1175, 0.25], [1319, 0.5], [1175, 0.75], [988, 1.0], [880, 1.3], [1319, 1.7], [1568, 1.95], [1319, 2.3], [1175, 2.55]].forEach(([f, d]) => tone(f, 0.55, { vol: 0.06, type: 'triangle', delay: d, pan })); break;
      case 'musicTurn': { // one turn of a music box's crank: a click, and the comb plucks the next few notes of that tune (from its start after a pause)
        const t0 = now(); if (!(t0 - (sfx.turnAt || -99) < 10)) sfx.turnN = 0; sfx.turnAt = t0;
        [[[880, 0], [1175, 0.25], [1319, 0.5]], [[1175, 0], [988, 0.25], [880, 0.55]], [[1319, 0], [1568, 0.25], [1319, 0.6]], [[1175, 0], [988, 0.25], [880, 0.5]]][sfx.turnN++ % 4].forEach(([f, d]) => tone(f, 0.55, { vol: 0.06, type: 'triangle', delay: d, pan }));
        noise(0.025, { type: 'bandpass', freq: 2400, q: 6, vol: 0.14, pan }); break;
      }
      // a turn of the crank where the box will not play: the comb drags its notes flat and out of tune against each other, and the crank sticks
      case 'musicSour': [[880, 0, 790], [1245, 0.26, 1050], [1109, 0.6, 930]].forEach(([f, d, e]) => { tone(f, 0.7, { vol: 0.06, type: 'triangle', delay: d, endFreq: e, pan }); tone(f * 1.06, 0.6, { vol: 0.04, type: 'triangle', delay: d + 0.02, endFreq: e * 1.04, pan }); });
      // night 10's easter egg (every mirror under a dust sheet): from inside the cloth it presses its face and hands out
      // through it. The sheet creaks as it stretches, three long strains, each tighter (higher) than the last, the weave
      // rasping under them; its sob, two short hitches, and then one that rises into a wail as it comes through; and the
      // thump as it has you. About 3.3 s, and it is the whole of that death's sound after the hush (night10.js: EGG)
      case 'sheetPress': {
        for (const [d, f, v] of [[0, 150, 0.6], [0.55, 190, 0.8], [1.1, 240, 1]]) {
          noise(0.5, { type: 'bandpass', freq: f * 3, q: 5, vol: 0.2 * v, attack: 0.25, delay: d, pan });
          tone(f, 0.45, { vol: 0.05 * v, type: 'sawtooth', endFreq: f * 1.5, attack: 0.12, delay: d + 0.05, pan });
          tone(f * 1.012, 0.45, { vol: 0.03 * v, type: 'sawtooth', endFreq: f * 1.56, attack: 0.12, delay: d + 0.08, pan });
        }
        for (const d of [0.5, 0.95]) tone(540, 0.16, { vol: 0.07, type: 'triangle', endFreq: 430, attack: 0.03, delay: d, pan });
        tone(470, 1.1, { vol: 0.16, type: 'triangle', endFreq: 960, attack: 0.35, delay: 1.35, pan }); tone(476, 1.1, { vol: 0.07, type: 'sine', endFreq: 1930, attack: 0.4, delay: 1.4, pan });
        noise(0.3, { freq: 200, vol: 0.9, delay: 2.7 }); tone(40, 0.6, { vol: 0.8, endFreq: 26, delay: 2.7 });
        break;
      }
        noise(0.025, { type: 'bandpass', freq: 2400, q: 6, vol: 0.14, pan }); tone(140, 0.08, { vol: 0.3, type: 'square', endFreq: 90, delay: 0.85, pan }); noise(0.06, { freq: 700, vol: 0.35, delay: 0.85, pan }); break;
      case 'tick': noise(0.012, { type: 'bandpass', freq: 3200, q: 4, vol: 0.14, pan }); tone(1600, 0.02, { vol: 0.05, type: 'square', pan }); break;
      case 'knock': for (const d of [0, 0.32]) { noise(0.06, { freq: 500, vol: 0.5, delay: d, pan }); tone(160, 0.12, { vol: 0.3, endFreq: 100, delay: d, pan }); } break;
      case 'hangers': for (let i = 0; i < 6; i++) tone(2200 + Math.random() * 1400, 0.05, { vol: 0.045, type: 'triangle', delay: i * 0.06 + Math.random() * 0.03, pan }); break;
      case 'switch': tone(900, 0.02, { vol: 0.14, type: 'square', endFreq: 500 }); noise(0.02, { freq: 2500, vol: 0.2, delay: 0.02 }); break;
      case 'flicker': for (let i = 0; i < 4; i++) noise(0.02, { type: 'highpass', freq: 3000, vol: 0.15, delay: i * 0.09 + Math.random() * 0.04 }); tone(120, 0.5, { vol: 0.06, type: 'sawtooth', endFreq: 40, delay: 0.3 }); break;
      // the demon enraged (night 13): a scraping shriek, rising and breaking, with a rasp of grit through it; never quite the
      // same twice. screechRage, beside itself: longer, two voices at odds and a growl under them
      case 'screech': {
        const f = 1300 + Math.random() * 500;
        tone(f, 0.42, { vol: 0.07, type: 'sawtooth', endFreq: f * 1.7, attack: 0.04, pan }); tone(f * 1.03, 0.4, { vol: 0.045, type: 'square', endFreq: f * 1.55, attack: 0.05, pan });
        tone(f * 1.7, 0.45, { vol: 0.06, type: 'sawtooth', endFreq: f * 0.8, delay: 0.4, pan });
        noise(0.75, { type: 'bandpass', freq: 3200 + Math.random() * 600, q: 3, vol: 0.2, attack: 0.06, pan });
        for (let i = 0; i < 9; i++) noise(0.04, { type: 'bandpass', freq: 2400 + Math.random() * 1800, q: 7, vol: 0.14, delay: 0.03 + i * 0.075, pan });
        break;
      }
      case 'screechRage': {
        const f = 1600 + Math.random() * 500;
        for (const [d, m] of [[0, 1], [0.08, 1.13]]) { tone(f * m, 0.55, { vol: 0.07, type: 'sawtooth', endFreq: f * m * 1.8, attack: 0.03, delay: d, pan }); tone(f * m * 1.8, 0.6, { vol: 0.055, type: 'sawtooth', endFreq: f * m * 0.7, delay: d + 0.52, pan }); }
        tone(72, 1.1, { vol: 0.18, type: 'sawtooth', endFreq: 52, attack: 0.05, pan });
        noise(1.1, { type: 'bandpass', freq: 3600 + Math.random() * 800, q: 2.5, vol: 0.26, attack: 0.04, pan });
        for (let i = 0; i < 14; i++) noise(0.04, { type: 'bandpass', freq: 2200 + Math.random() * 2400, q: 7, vol: 0.16, delay: 0.02 + i * 0.07, pan });
        break;
      }
      // the demon angry while it holds you (night 13, its first two angry faces): a deep, gravelly growl. A low voice and a rough
      // fifth over it and a breath of grit, all rattled by a fast, uneven flutter (the gravel), lifting a little and sinking
      // as it dies; a little different each time
      // (growl2, the second: the same growl, tuned apart from the first in js/soundtune.js; growlHigh: the same growl
      // again, tuned far up and quicker there into a shrill, gravelly snarl: the shade's, jumping out at the police, night 9)
      case 'growl': case 'growl2': case 'growlHigh': {
        const t0 = now(), T = 1.45 + Math.random() * 0.2, f = 55 + Math.random() * 8;
        const out = ac.createGain(), lp = ac.createBiquadFilter(), am = ac.createGain(), lfo = ac.createOscillator(), lfoG = ac.createGain();
        out.gain.setValueAtTime(0.0001, t0); out.gain.exponentialRampToValueAtTime(1, t0 + 0.16); out.gain.setValueAtTime(1, t0 + T * 0.55); out.gain.exponentialRampToValueAtTime(0.0001, t0 + T);
        lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(520, t0); lp.frequency.linearRampToValueAtTime(950, t0 + T * 0.3); lp.frequency.exponentialRampToValueAtTime(260, t0 + T);
        am.gain.value = 0.55; lfo.type = 'square'; lfoG.gain.value = 0.45;
        lfo.frequency.setValueAtTime(23, t0); lfo.frequency.linearRampToValueAtTime(34, t0 + T * 0.35); lfo.frequency.linearRampToValueAtTime(17, t0 + T);
        lfo.connect(lfoG); lfoG.connect(am.gain);
        const voice = (mul, type, vol) => {
          const o = ac.createOscillator(), g = ac.createGain(); o.type = type; g.gain.value = vol;
          o.frequency.setValueAtTime(f * mul * 0.92, t0); o.frequency.linearRampToValueAtTime(f * mul * 1.12, t0 + T * 0.35); o.frequency.linearRampToValueAtTime(f * mul * 0.78, t0 + T);
          o.connect(g); g.connect(am); o.start(t0); o.stop(t0 + T + 0.05);
        };
        voice(1, 'sawtooth', 0.34); voice(1.5 * 1.012, 'sawtooth', 0.14); voice(0.5, 'square', 0.12);
        const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain();
        src.buffer = noiseBuf; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 1.3; ng.gain.value = 0.42;
        src.connect(bp); bp.connect(ng); ng.connect(am); src.start(t0, Math.random() * 1.2); src.stop(t0 + T + 0.05);
        am.connect(lp); lp.connect(out); chain(out, pan);
        lfo.start(t0); lfo.stop(t0 + T + 0.05);
        break;
      }
      // the dark turning at the end of night 13: a rushing that swells and climbs for ten seconds, a low note rising under it
      case 'warp':
        for (let i = 0; i < 10; i++) noise(1.8, { type: 'bandpass', freq: 260 * Math.pow(1.27, i), q: 1.1, vol: 0.05 + 0.012 * i, attack: 0.7, delay: i * 1.0 });
        tone(46, 10.5, { vol: 0.14, type: 'triangle', endFreq: 120, attack: 3 });
        break;
      // night 13's scare: the faces of the others taken back into it, a rush of air drawn in, swelling, falling in pitch and
      // cut off short, a low note rising under it, and a soft blow as the last goes in
      case 'absorb': {
        const t0 = now(), T = 0.58, src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
        src.buffer = noiseBuf; src.loop = true; flt.type = 'bandpass'; flt.Q.value = 1.6;
        flt.frequency.setValueAtTime(3200, t0); flt.frequency.exponentialRampToValueAtTime(260, t0 + T);
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.5, t0 + T); g.gain.linearRampToValueAtTime(0.0001, t0 + T + 0.03);
        src.connect(flt); flt.connect(g); chain(g, pan);
        src.start(t0, Math.random() * 1.2); src.stop(t0 + T + 0.08);
        tone(42, T, { vol: 0.22, type: 'sawtooth', endFreq: 96, attack: T * 0.8, pan });
        noise(0.18, { freq: 160, vol: 0.6, delay: T, pan }); tone(58, 0.3, { vol: 0.45, endFreq: 32, delay: T, pan });
        break;
      }
      // a small bright flourish, as of many glad at once: a quick run up a major chord in clear notes, the last ringing over a
      // shimmer an octave up, with a breath of bright air swelling under it (night 13's easter egg: they all leap for joy)
      case 'cheer': {
        [523, 659, 784, 1047, 1319].forEach((f, i) => { tone(f, i === 4 ? 1.1 : 0.32, { vol: 0.07, type: 'triangle', attack: 0.01, delay: i * 0.075 }); tone(f * 2, i === 4 ? 0.9 : 0.2, { vol: 0.022, delay: i * 0.075 + 0.01 }); });
        noise(0.7, { type: 'bandpass', freq: 2600, q: 0.7, vol: 0.05, attack: 0.22 }); noise(0.5, { type: 'highpass', freq: 5200, vol: 0.025, attack: 0.3, delay: 0.1 });
        break;
      }
      case 'birds': { const f0 = 2200 + Math.random() * 1200; for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) tone(f0 + Math.random() * 600, 0.07, { vol: 0.05, type: 'sine', endFreq: f0 + 300 + Math.random() * 500, delay: i * 0.11, pan }); break; }
      case 'stingWet': noise(0.5, { freq: 1600, vol: 1.0, attack: 0.002 }); noise(1.4, { type: 'bandpass', freq: 500, q: 1, vol: 0.7, delay: 0.1, attack: 0.05 }); tone(42, 1.4, { vol: 0.7, endFreq: 26 }); tone(700, 0.9, { vol: 0.3, type: 'sawtooth', endFreq: 200, delay: 0.15 }); break;
      case 'stingScrape': noise(1.1, { type: 'bandpass', freq: 2400, q: 3, vol: 0.9, attack: 0.002 }); tone(1400, 0.8, { vol: 0.35, type: 'sawtooth', endFreq: 3000 }); tone(45, 1.3, { vol: 0.7, endFreq: 28, delay: 0.1 }); break;
      case 'stingGlass': noise(0.15, { type: 'highpass', freq: 3000, vol: 1.0, attack: 0.001 }); for (let i = 0; i < 9; i++) tone(2500 + Math.random() * 3500, 0.3 + Math.random() * 0.5, { vol: 0.14, type: 'triangle', delay: 0.02 + i * 0.05 }); tone(50, 1.4, { vol: 0.7, endFreq: 30, delay: 0.05 }); noise(1.2, { freq: 400, vol: 0.4, delay: 0.1, attack: 0.05 }); break;
      case 'crack': noise(0.06, { freq: 2500, vol: 0.5, pan }); break;
      // the phone booth
      case 'receiver': noise(0.05, { freq: 700, vol: 0.35 }); tone(260, 0.06, { vol: 0.2, type: 'square', endFreq: 180 }); tone(350, 0.9, { vol: 0.035, type: 'sine', delay: 0.12 }); tone(440, 0.9, { vol: 0.035, type: 'sine', delay: 0.12 }); break;
      case 'dial': { const lo = [697, 770, 852, 941][Math.floor(Math.random() * 4)], hi = [1209, 1336, 1477][Math.floor(Math.random() * 3)]; tone(lo, 0.13, { vol: 0.07, type: 'sine' }); tone(hi, 0.13, { vol: 0.07, type: 'sine' }); break; }
      case 'ringback': tone(440, 1.8, { vol: 0.05, type: 'sine', attack: 0.02 }); tone(480, 1.8, { vol: 0.05, type: 'sine', attack: 0.02 }); break;   // one ring: the caller rings again every 3 s, and can stop
      case 'noService': [[950, 0], [1400, 0.33], [1800, 0.66]].forEach(([f, d]) => tone(f, 0.28, { vol: 0.07, type: 'sine', delay: d })); break;
      case 'answer': noise(0.05, { freq: 900, vol: 0.3 }); for (let i = 0; i < 6; i++) noise(0.11 + Math.random() * 0.08, { type: 'bandpass', freq: 380 + Math.random() * 380, q: 2.5, vol: 0.16, attack: 0.03, delay: 0.35 + i * 0.2 }); break;
      case 'phoneRing': for (let i = 0; i < 16; i++) tone(i % 2 ? 1300 : 1000, 0.05, { vol: 0.06, type: 'square', delay: i * 0.055, pan }); break;
      case 'keyClick': noise(0.015, { type: 'bandpass', freq: 1800, q: 3, vol: 0.2 }); tone(300, 0.02, { vol: 0.06, type: 'square', endFreq: 200 }); break;   // a pay phone key with no line behind it
      case 'coin': tone(2600, 0.05, { vol: 0.12, type: 'triangle', endFreq: 2300 }); for (let i = 0; i < 4; i++) noise(0.025, { type: 'bandpass', freq: 3000 + Math.random() * 1500, q: 5, vol: 0.12, delay: 0.06 + i * 0.05 + Math.random() * 0.02 }); tone(180, 0.06, { vol: 0.16, type: 'square', endFreq: 120, delay: 0.3 }); tone(1046, 0.14, { vol: 0.05, type: 'sine', delay: 0.42 }); break;
      case 'coinReturn': for (let i = 0; i < 7; i++) noise(0.02, { type: 'bandpass', freq: 2600 + Math.random() * 1800, q: 5, vol: 0.12, delay: i * 0.045 + Math.random() * 0.015 }); tone(2900, 0.08, { vol: 0.1, type: 'triangle', endFreq: 2500, delay: 0.4 }); tone(3300, 0.06, { vol: 0.06, type: 'triangle', delay: 0.47 }); break;
      case 'lampBreak':   // a street lamp broken: a pop, glass coming down, the fizz of the sparks and a buzz as it dies
        noise(0.05, { freq: 900, vol: 0.5, pan }); tone(90, 0.12, { vol: 0.35, endFreq: 50, pan });
        for (let i = 0; i < 8; i++) tone(2400 + Math.random() * 3200, 0.12 + Math.random() * 0.25, { vol: 0.07, type: 'triangle', delay: 0.04 + i * 0.05 + Math.random() * 0.03, pan });
        noise(0.45, { type: 'highpass', freq: 5000, vol: 0.12, delay: 0.03, pan }); tone(100, 0.4, { vol: 0.05, type: 'sawtooth', endFreq: 60, delay: 0.02, pan }); break;
      // the car that comes for you at the phone booth
      case 'carCome': tone(48, 3.4, { vol: 0.22, type: 'sawtooth', endFreq: 74, attack: 2.4, pan }); noise(3.0, { type: 'bandpass', freq: 1500, q: 0.6, vol: 0.2, attack: 2.6, pan }); noise(3.2, { freq: 240, vol: 0.25, attack: 2.4, pan }); break;
      case 'brake': noise(1.1, { type: 'bandpass', freq: 2600, q: 1.2, vol: 0.3, attack: 0.05, pan }); tone(70, 1.0, { vol: 0.18, type: 'sawtooth', endFreq: 40, pan }); break;
      case 'horn': for (const d of [0, 0.32]) { tone(392, 0.22, { vol: 0.12, type: 'square', delay: d, pan }); tone(494, 0.22, { vol: 0.09, type: 'square', delay: d, pan }); } break;
      case 'carDoor': noise(0.05, { freq: 1600, vol: 0.35, pan }); tone(160, 0.08, { vol: 0.25, type: 'square', endFreq: 100, pan }); tone(240, 0.5, { vol: 0.05, type: 'sawtooth', endFreq: 200, delay: 0.08, pan }); break;
      // the police, called on 911 at the phone booth: the dispatcher answering, and the siren's wail (one rise and fall: the
      // night plays them back to back while the police car comes)
      case 'dispatch': {   // a click, then a few clipped, crackling bursts of a voice, too thin to make out, and the line's hiss under it
        noise(0.03, { type: 'highpass', freq: 2000, vol: 0.2 });
        noise(1.9, { type: 'bandpass', freq: 2600, q: 0.7, vol: 0.03, attack: 0.05 });
        let d = 0.12;
        for (let i = 0; i < 9; i++) {
          const len = 0.07 + Math.random() * 0.11;
          noise(len, { type: 'bandpass', freq: 700 + Math.random() * 900, q: 3, vol: 0.16, attack: 0.02, delay: d });
          tone(150 + Math.random() * 70, len, { vol: 0.025, type: 'sawtooth', endFreq: 130 + Math.random() * 50, attack: 0.02, delay: d });
          d += len + (i % 3 === 2 ? 0.16 : 0.03 + Math.random() * 0.05);
        }
        noise(0.04, { type: 'highpass', freq: 1800, vol: 0.12, delay: d + 0.05 });
        break;
      }
      // the dispatcher's lines (911, the phone booth), each a crackle of a voice too thin to make out, a burst to a syllable
      // ([how long, how high, how loud, the gap after]), over the line's hiss: asking what the emergency is (a click as the
      // line opens, then ten quick syllables, the last of them rising); "a WHAT?" (a short low one, and a long loud one
      // tearing upward); and telling you to stay there, a car is coming (three phrases, level, the last falling)
      case 'dispatchAsk': case 'dispatchWhat': case 'dispatchSend': {
        const said = {
          dispatchAsk: [[0.09, 1, 1, 0.02], [0.08, 0.95, 0.9, 0.02], [0.1, 0.9, 1, 0.13], [0.07, 1, 0.9, 0.02], [0.05, 0.95, 0.7, 0.02], [0.06, 0.95, 0.8, 0.02], [0.06, 1.05, 0.9, 0.02], [0.08, 1.15, 1, 0.02], [0.07, 1.25, 0.9, 0.02], [0.13, 1.5, 1.1, 0]],
          dispatchWhat: [[0.06, 0.85, 0.7, 0.05], [0.3, 1.25, 1.7, 0]],
          dispatchSend: [[0.08, 1.05, 1, 0.02], [0.12, 0.9, 1, 0.2], [0.11, 1, 1.1, 0.03], [0.14, 0.88, 1, 0.24], [0.06, 1, 0.8, 0.02], [0.08, 1.05, 1, 0.02], [0.06, 0.98, 0.8, 0.02], [0.05, 0.95, 0.7, 0.02], [0.08, 1, 0.9, 0.02], [0.06, 0.92, 0.8, 0.02], [0.15, 0.78, 1, 0]],
        }[name];
        let d = 0.02;
        if (name === 'dispatchAsk') { noise(0.03, { type: 'highpass', freq: 2000, vol: 0.2 }); d = 0.12; }
        noise(said.reduce((a, q) => a + q[0] + q[3], 0) + 0.25, { type: 'bandpass', freq: 2600, q: 0.7, vol: 0.03, attack: 0.05 });
        for (const [len, hi, loud, gap] of said) {
          const up = name === 'dispatchWhat' && len > 0.2;   // (the WHAT: torn upward as it goes)
          noise(len, { type: 'bandpass', freq: (800 + Math.random() * 500) * hi, q: 3, vol: 0.16 * loud, attack: 0.02, delay: d });
          if (up) noise(len * 0.6, { type: 'bandpass', freq: 1900 + Math.random() * 300, q: 4, vol: 0.2, attack: 0.05, delay: d + len * 0.4 });
          tone((150 + Math.random() * 40) * hi, len, { vol: 0.025 * loud, type: 'sawtooth', endFreq: (140 + Math.random() * 30) * hi * (up ? 1.7 : 1), attack: 0.02, delay: d });
          d += len + gap + (gap < 0.05 ? Math.random() * 0.03 : 0);
        }
        if (name === 'dispatchSend') noise(0.04, { type: 'highpass', freq: 1800, vol: 0.12, delay: d + 0.06 });   // (a tick on the line as the voice stops)
        break;
      }
      case 'siren': {   // one wail: up and down again in 1.6 s, a reedy sawtooth with a square an octave under it
        const t0 = now(), dur = 1.6, lp = ac.createBiquadFilter(), g = ac.createGain(), g2 = ac.createGain(), oscs = [];
        lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.7; g2.gain.value = 0.35;
        for (const [type, k] of [['sawtooth', 1], ['square', 0.5]]) {
          const o = ac.createOscillator(); o.type = type;
          o.frequency.setValueAtTime(620 * k, t0); o.frequency.linearRampToValueAtTime(1320 * k, t0 + dur * 0.5); o.frequency.linearRampToValueAtTime(620 * k, t0 + dur);
          o.connect(k < 1 ? g2 : lp); oscs.push(o);
        }
        g2.connect(lp); lp.connect(g);
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.07, t0 + 0.04); g.gain.setValueAtTime(0.07, t0 + dur - 0.04); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
        chain(g, pan);
        for (const o of oscs) { o.start(t0); o.stop(t0 + dur + 0.05); }
        break;
      }
      // the police car halting by the shade and fleeing it: its tyres screeching as it brakes hard, its siren switched off,
      // the shade's shriek at it, and the car slamming its foot down to get away
      case 'tireScreech': {   // tyres locked on the wet road: a high squeal wavering over a rough hiss, held, and cut off as it stops
        const t0 = now(), dur = 1.05, bp = ac.createBiquadFilter(), g = ac.createGain(), nodes = [];
        bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 2.2;
        for (const [f, type, v] of [[1180, 'sawtooth', 1], [1795, 'square', 0.45], [2410, 'sawtooth', 0.35]]) {
          const o = ac.createOscillator(), og = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
          o.type = type; o.frequency.setValueAtTime(f, t0); o.frequency.linearRampToValueAtTime(f * 0.86, t0 + dur);
          lfo.frequency.value = 13 + Math.random() * 6; lg.gain.value = f * 0.025; lfo.connect(lg); lg.connect(o.frequency);
          og.gain.value = v; o.connect(og); og.connect(bp); nodes.push(o, lfo);
        }
        bp.connect(g);
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.05, t0 + 0.05); g.gain.setValueAtTime(0.05, t0 + dur - 0.12); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
        chain(g, pan);
        for (const n of nodes) { n.start(t0); n.stop(t0 + dur + 0.05); }
        noise(dur, { type: 'bandpass', freq: 2600, q: 1.4, vol: 0.16, attack: 0.03, pan });   // the hiss of the wet road under it
        break;
      }
      case 'sirenOff': {   // the siren switched off: its wail sagging down from where it was, slower and slower, and gone
        const t0 = now(), dur = 1.3, lp = ac.createBiquadFilter(), g = ac.createGain(), g2 = ac.createGain(), oscs = [];
        lp.type = 'lowpass'; lp.Q.value = 0.7; g2.gain.value = 0.35;
        lp.frequency.setValueAtTime(2600, t0); lp.frequency.exponentialRampToValueAtTime(600, t0 + dur);
        for (const [type, k] of [['sawtooth', 1], ['square', 0.5]]) {
          const o = ac.createOscillator(); o.type = type;
          o.frequency.setValueAtTime(640 * k, t0); o.frequency.exponentialRampToValueAtTime(150 * k, t0 + dur);
          o.connect(k < 1 ? g2 : lp); oscs.push(o);
        }
        g2.connect(lp); lp.connect(g);
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.07, t0 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        chain(g, pan);
        for (const o of oscs) { o.start(t0); o.stop(t0 + dur + 0.05); }
        break;
      }
      case 'shadeShriek': {   // the shade, its head split open: voices at odds tearing upward, a rasp through them and something huge under them
        for (const [f, d] of [[610, 0], [905, 0.03], [1330, 0.07]]) { tone(f, 1.0, { vol: 0.08, type: 'sawtooth', endFreq: f * 2.1, attack: 0.02, delay: d, pan }); tone(f * 2.05, 0.5, { vol: 0.04, type: 'square', endFreq: f * 1.3, delay: d + 0.75, pan }); }
        noise(1.1, { type: 'bandpass', freq: 3100, q: 2.4, vol: 0.45, attack: 0.01, pan });
        tone(46, 1.3, { vol: 0.45, endFreq: 30, attack: 0.01, pan }); noise(0.5, { freq: 260, vol: 0.5, attack: 0.005, pan });
        for (let i = 0; i < 10; i++) noise(0.05, { type: 'bandpass', freq: 1800 + Math.random() * 2600, q: 6, vol: 0.2, delay: 0.04 + i * 0.09, pan });
        break;
      }
      case 'peelOut':   // away: the engine roaring up, the back tyres spinning and squealing, catching, squealing again, and the roar going off down the road
        tone(52, 2.8, { vol: 0.42, type: 'sawtooth', endFreq: 175, attack: 0.06, pan }); noise(2.6, { freq: 330, vol: 0.34, attack: 0.08, pan });
        for (const [d, l, v] of [[0, 0.55, 0.42], [0.5, 0.42, 0.34], [0.86, 0.36, 0.24]]) { noise(l, { type: 'bandpass', freq: 2250 + d * 300, q: 8, vol: v, attack: 0.02, delay: d, pan }); tone(1250 + d * 200, l, { vol: 0.04 * v / 0.42, type: 'sawtooth', endFreq: 1480 + d * 200, attack: 0.02, delay: d, pan }); }
        break;
      // the car pulling away
      case 'rev': tone(55, 2.4, { vol: 0.45, type: 'sawtooth', endFreq: 190, attack: 0.05 }); noise(1.6, { type: 'bandpass', freq: 2400, q: 6, vol: 0.35, attack: 0.02 }); noise(2.2, { freq: 300, vol: 0.35, attack: 0.1 }); break;
      // night 2, the car driven into it. carHit: the blow on the bumper, the bodywork giving and something breaking in it,
      // and the tyres biting for the moment it takes to stop
      case 'carHit':
        noise(0.22, { freq: 190, vol: 1.0, attack: 0.001 }); tone(54, 0.42, { vol: 0.9, endFreq: 28 });
        noise(0.1, { type: 'bandpass', freq: 1250, q: 1.1, vol: 0.55, attack: 0.001 });
        for (let i = 0; i < 4; i++) noise(0.03, { type: 'bandpass', freq: 2100 + Math.random() * 1900, q: 5, vol: 0.3, delay: 0.03 + i * 0.04 });
        noise(0.42, { type: 'bandpass', freq: 2500, q: 2.6, vol: 0.24, attack: 0.03, delay: 0.07 }); tone(1340, 0.38, { vol: 0.03, type: 'sawtooth', endFreq: 1120, attack: 0.03, delay: 0.07 });
        break;
      // stall: the engine dying under you: four turns, each slower and lower, and a tick as it settles
      case 'stall':
        [[0, 62], [0.17, 53], [0.38, 44], [0.66, 35]].forEach(([d, f], i) => { tone(f, 0.17 + i * 0.03, { vol: 0.34 - i * 0.05, type: 'sawtooth', endFreq: f * 0.78, delay: d }); noise(0.07, { freq: 380, vol: 0.22 - i * 0.04, delay: d }); });
        noise(0.03, { type: 'bandpass', freq: 1900, q: 3, vol: 0.12, delay: 1.05 });
        break;
      // bodyDrop: something heavy and soft coming down on a wet road, and sliding a little
      case 'bodyDrop': noise(0.2, { freq: 240, vol: 0.75, attack: 0.002, pan }); tone(48, 0.3, { vol: 0.55, endFreq: 30, pan }); noise(0.38, { type: 'bandpass', freq: 850, q: 0.8, vol: 0.2, attack: 0.03, delay: 0.05, pan }); break;
      // joints: two or three dry cracks close together, and something wet moving under them (it gets up, wrongly)
      case 'joints':
        for (let i = 0, n = 2 + Math.floor(Math.random() * 2); i < n; i++) { const d = i * (0.07 + Math.random() * 0.06); noise(0.022, { type: 'bandpass', freq: 1500 + Math.random() * 1400, q: 3.5, vol: 0.42, attack: 0.001, delay: d, pan }); tone(210 + Math.random() * 90, 0.04, { vol: 0.12, type: 'triangle', endFreq: 120, delay: d, pan }); }
        noise(0.1, { type: 'bandpass', freq: 600, q: 1.2, vol: 0.13, attack: 0.02, delay: 0.05, pan });
        break;
      default: break;
    }
  }

  // a lane's cue: three of its footsteps, a stride apart, from that way (soft: quieter). Played as footsteps are, tuned
  // as 'footstep:kind'
  function cueSteps(kind, pan, soft) {
    const v = soft ? 0.3 : 0.5;
    const step = k => typeof TUNE !== 'undefined' ? TUNE.run('footstep:' + kind, () => footstep(kind, v * k, pan)) : footstep(kind, v * k, pan);
    step(1); setTimeout(() => step(0.85), 330); setTimeout(() => step(1), 660);
  }
  // each played as it is tuned (js/soundtune.js: TUNES, by the sound's key; an ambient bed's key is its params' tune)
  const tuned = (key, fn) => (typeof TUNE !== 'undefined' ? TUNE.run(key, fn) : fn());

  // ---- the volume calibration (Settings: Volume, Calibrate) ----
  // Sound effects. The quietest sound in the game, seven times a steady CAL.gap seconds apart (all seven in about two
  // seconds): twice in the left ear, three times on the way across (left of centre, centre, right of centre: the centre
  // one not panned at all, as the game's own unpanned sounds are), twice in the right ear. Each cuts the one before it
  // short (a fade of a few tens of ms), so they never pile up; the last rings out. It is the first beat of the heartbeat
  // (its lub) as loud as the heartbeat is when it is first heard (game.js heartbeat: 0.04 + prox * 0.5, from prox 0.02).
  // The loudest sound in the game: the sting itself (the effect 'sting', as a death plays it), once, in the middle (not
  // panned), CAL.len.loud seconds of it (all of it, as it is tuned). Each is played as the game plays it, tuned as
  // 'heartbeat' and as 'sting' (js/soundtune.js), through the effects volume (bus.cal is kept at it).
  // Ambience: the quietest bed in the game or the loudest (CAL.beds), a few seconds of it (CAL.bed), faded in and out,
  // tuned as the game tunes it, through the ambience volume (bus.calAmb is kept at it). The quietest by loudness (rendered
  // offline with its tune, K-weighted: test/settings.js) is night 8's once the main is off ('ambient:8off'); the loudest
  // (by the user's choice) the lighthouse's storm, night 7's wind and rain ('ambient:7').
  // Mute is over all of it as over everything. While one plays, the rest (the effects bus and the ambient bed) is ducked
  // out of the way, and back when it ends; one plays at a time: another started stops it (what was still sounding faded
  // out at once). A context suspended (a paused night) is resumed for it
  const CAL = {
    pans: [-1, -1, -0.5, 0, 0.5, 1, 1], gap: 0.3, heart: 0.04 + 0.02 * 0.5, len: { quiet: 0.4, loud: 2.4 },
    beds: {   // (night08.js L.def.ambient with the hum gone, as its main switched off has it; night07.js L.def.ambient)
      ambientQuiet: { tune: 'ambient:8off', wind: 0.25, drone: 0.12, droneFreq: 60, windFreq: 300 },
      ambientLoud: { tune: 'ambient:9', wind: 0.35, rain: 1, drone: 0.45, droneFreq: 47, windFreq: 300 },
    },
    bed: { len: 6, fade: 1 },
  };
  let cal = null, calLast = null;
  // which: 'quiet' or 'loud' (sound effects), 'ambientQuiet' or 'ambientLoud' (ambience). onBeat(i) as each of the seven
  // plays (the sting and the ambience: onBeat(0) as it starts), onBeat(-1) once it is over
  function calibrate(which, onBeat) {
    if (!ac) return false;
    calStop();
    resume();
    const seq = ac.createGain(); seq.connect(CAL.beds[which] ? bus.calAmb : bus.cal);
    for (const b of [bus.effects, bus.ambient]) glide(b.gain, 0.0001, 0.05);
    const c = cal = calLast = { which, seq, timers: [], pans: [], beats: [], nodes: [] };
    const end = sec => c.timers.push(setTimeout(() => { if (cal !== c) return; calStop(); if (onBeat) onBeat(-1); }, sec * 1000));
    if (CAL.beds[which]) {
      const p = CAL.beds[which], t = now(), B = CAL.bed;
      if (typeof CAPTIONS !== 'undefined') CAPTIONS.ambient(p);
      const lane = ac.createGain(); lane.__tuneBus = true; lane.connect(seq);   // (a bus to TUNE: a tune's vol goes in before it)
      const b = tuned(p.tune, () => bed(p, lane));
      b.g.gain.value = 1; c.nodes = b.nodes; c.pans.push(0);
      seq.gain.setValueAtTime(0, t); seq.gain.linearRampToValueAtTime(1, t + B.fade);
      seq.gain.setValueAtTime(1, t + B.len - B.fade); seq.gain.linearRampToValueAtTime(0, t + B.len);
      if (onBeat) onBeat(0);
      end(B.len + 0.05);
      return true;
    }
    // (what it plays goes into a gain of its own, a bus to TUNE, on its way to the calibration's)
    const into = fn => { const beat = ac.createGain(); beat.__tuneBus = true; beat.connect(seq); c.beats.push(beat); out = beat; try { fn(); } finally { out = null; } };
    if (which === 'loud') {   // the sting, as a death plays it: once, in the middle
      c.pans.push(0);
      into(() => tuned('sting', () => sfx('sting')));
      if (onBeat) onBeat(0);
      end(CAL.len.loud);
      return true;
    }
    const play = pan => {
      const prev = c.beats[c.beats.length - 1]; if (prev) glide(prev.gain, 0.0001, 0.015);
      into(() => tuned('heartbeat', () => tone(54, 0.13, { vol: CAL.heart, endFreq: 36, pan })));
    };
    CAL.pans.forEach((pan, i) => c.timers.push(setTimeout(() => { if (cal !== c) return; c.pans.push(pan); play(pan); if (onBeat) onBeat(i); }, i * CAL.gap * 1000)));
    end((CAL.pans.length - 1) * CAL.gap + CAL.len.quiet);
    return true;
  }
  function calStop() {
    if (!cal) return;
    const c = cal; cal = null;
    c.timers.forEach(clearTimeout);
    glide(c.seq.gain, 0.0001, 0.02);
    setTimeout(() => { c.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { c.seq.disconnect(); } catch (e) {} }, 400);
    glide(bus.effects.gain, volume.effects, 0.15);
    if (!hushed) glide(bus.ambient.gain, volume.ambient, 0.15);
  }
  return {
    init, on, running, resume, suspend, setMuted, setVolume, stopAmbient, stopLoop,
    startAmbient: p => tuned(p && p.tune, () => startAmbient(p)),
    titleDrone: (k, fade) => (amb && amb.title ? titleDrone(k) : tuned('ambient:title', () => titleDrone(k, fade))),
    setLoop: (kind, vol, pan) => tuned(kind ? 'loop:' + kind : null, () => setLoop(kind, vol, pan)),
    heartbeat: (vol, fast) => tuned('heartbeat', () => heartbeat(vol, fast)),
    footstep: (kind, vol, pan) => tuned('footstep:' + kind, () => footstep(kind, vol, pan)),
    voice: (kind, vol, pan) => tuned('voice:' + kind, () => voice(kind, vol, pan)),
    // 'footstep:kind' (a lane's cue: game.js laneCues): a few of that thing's footsteps, that way
    sfx: (name, pan, soft) => (typeof name === 'string' && name.startsWith('footstep:') ? cueSteps(name.slice(9), pan, soft) : tuned(name, () => sfx(name, pan, soft))),
    calibrate, calStop, CAL, hush,
    get hushed() { return hushed; },
    // the two volumes' buses as they are now, and where the calibration's are (the tests' look at them)
    get levels() { return ac ? { effects: bus.effects.gain.value, ambient: bus.ambient.gain.value, cal: bus.cal.gain.value, calAmb: bus.calAmb.gain.value, volume: Object.assign({}, volume) } : null; },
    get calibration() { return calLast ? { which: calLast.which, pans: calLast.pans.slice(), playing: cal === calLast } : null; },   // (the tests' look at it)
    get muted() { return muted; },
    get bed() { return amb ? { title: !!amb.title, k: amb.k } : null; },   // the ambient bed playing (the tests' look at it)
  };
})();
