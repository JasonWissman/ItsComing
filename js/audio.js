'use strict';
// ---------- Web Audio: everything is synthesized, no sound files ----------
const AUDIO = (() => {
  let ac = null, master = null, noiseBuf = null, muted = false;
  const bus = { effects: null, ambient: null };
  const volume = { master: 1, effects: 1, ambient: 1 };
  let amb = null;     // ambient bed (wind + drone)
  let loopNode = null; // creature loop (stone grind / engine)

  function init() {
    if (ac) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0.0001 : 0.85 * volume.master;
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.25;
      master.connect(comp); comp.connect(ac.destination);
      bus.effects = ac.createGain(); bus.effects.gain.value = volume.effects; bus.effects.connect(master);
      bus.ambient = ac.createGain(); bus.ambient.gain.value = volume.ambient; bus.ambient.connect(master);
      const len = ac.sampleRate * 2;
      noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; return false; }
    return true;
  }
  const on = () => !!ac;
  function resume() { if (ac && ac.state !== 'running') ac.resume().catch(() => {}); }
  function setMuted(m) {
    muted = !!m;
    if (master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(muted ? 0.0001 : 0.85 * volume.master, ac.currentTime, 0.03); }
  }
  function setVolume(which, v) {
    volume[which] = clamp(+v || 0, 0, 1);
    if (!ac) return;
    if (which === 'master') setMuted(muted);
    else if (bus[which]) bus[which].gain.setTargetAtTime(Math.max(0.0001, volume[which]), ac.currentTime, 0.03);
  }
  function suspend() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); }
  const now = () => ac.currentTime;

  function panNode(pan) {
    if (!pan || !ac.createStereoPanner) return null;
    const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); return p;
  }
  function chain(last, pan) {
    const p = panNode(pan);
    if (p) { last.connect(p); p.connect(bus.effects); } else last.connect(bus.effects);
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
    if (!ac) return;
    stopAmbient();
    p = p || {};
    const g = ac.createGain(); g.gain.value = 0.0001; g.connect(bus.ambient);
    const nodes = [];
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
      rs.connect(hp); hp.connect(rg); rg.connect(g); rs.start(); rl.start(); nodes.push(rs, rl);
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
    g.gain.exponentialRampToValueAtTime(1, now() + 2.5);
    amb = { g, nodes };
  }
  function stopAmbient() {
    if (!amb) return;
    const a = amb; amb = null;
    a.g.gain.setTargetAtTime(0.0001, now(), 0.4);
    setTimeout(() => { a.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { a.g.disconnect(); } catch (e) {} }, 1600);
  }

  // ---- a looping texture that can be switched on/off (stone grind, engine idle) ----
  function setLoop(kind, vol, pan) {
    if (!ac) return;
    if (!kind) { stopLoop(); return; }
    if (loopNode && loopNode.kind !== kind) stopLoop();
    if (!loopNode) {
      const g = ac.createGain(); g.gain.value = 0.0001;
      const p = panNode(pan);
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
      default: break;
    }
  }
  // creature voices: quiet, panned, sparse
  function voice(kind, vol, pan) {
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
  function sfx(name, pan) {
    if (!ac) return;
    switch (name) {
      case 'ui': tone(660, 0.05, { vol: 0.08, type: 'triangle' }); break;
      case 'pickup': tone(420, 0.06, { vol: 0.12, type: 'triangle', endFreq: 520 }); noise(0.05, { type: 'highpass', freq: 3000, vol: 0.06 }); break;
      case 'drop': noise(0.08, { freq: 500, vol: 0.2 }); tone(120, 0.07, { vol: 0.15, endFreq: 70 }); break;
      case 'nope': tone(160, 0.12, { vol: 0.1, type: 'square', endFreq: 110 }); break;
      case 'hammer':
        for (let i = 0; i < 3; i++) { noise(0.05, { freq: 1200, vol: 0.5, delay: i * 0.22 }); tone(210, 0.08, { vol: 0.3, endFreq: 120, delay: i * 0.22 }); }
        break;
      case 'smash': noise(0.35, { freq: 900, vol: 0.7 }); tone(90, 0.3, { vol: 0.5, endFreq: 40 }); for (let i = 0; i < 5; i++) noise(0.04, { type: 'bandpass', freq: 2000 + i * 400, q: 4, vol: 0.3, delay: 0.05 + i * 0.04 }); break;
      case 'bang': noise(0.25, { freq: 300, vol: 0.8 }); tone(60, 0.25, { vol: 0.6, endFreq: 35 }); break;
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
      case 'candle': tone(880, 0.4, { vol: 0.05, type: 'sine', endFreq: 1200 }); break;
      case 'chain': for (let i = 0; i < 7; i++) { tone(1800 + Math.random() * 1200, 0.04, { vol: 0.08, type: 'square', delay: i * 0.07 }); noise(0.03, { type: 'highpass', freq: 4000, vol: 0.08, delay: i * 0.07 }); } break;
      case 'lock': tone(500, 0.05, { vol: 0.2, type: 'square', endFreq: 300 }); tone(220, 0.1, { vol: 0.25, type: 'square', endFreq: 200, delay: 0.09 }); break;
      case 'creak': tone(320, 0.7, { vol: 0.12, type: 'sawtooth', endFreq: 180 }); tone(325, 0.7, { vol: 0.06, type: 'sawtooth', endFreq: 260, delay: 0.05 }); break;
      case 'gate': noise(0.2, { freq: 400, vol: 0.5 }); tone(140, 0.4, { vol: 0.3, type: 'square', endFreq: 90 }); break;
      case 'shot': noise(0.5, { freq: 1500, vol: 1.0, attack: 0.002 }); tone(70, 0.5, { vol: 0.7, endFreq: 30 }); noise(1.2, { freq: 300, vol: 0.3, delay: 0.05, attack: 0.02 }); break;
      case 'empty': tone(900, 0.03, { vol: 0.15, type: 'square' }); tone(600, 0.04, { vol: 0.12, type: 'square', delay: 0.06 }); break;
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
      case 'thud': noise(0.15, { freq: 150, vol: 0.9 }); tone(45, 0.25, { vol: 0.8, endFreq: 30 }); break;
      case 'splash': noise(0.35, { freq: 1800, q: 0.7, vol: 0.5, attack: 0.005, pan }); noise(0.9, { type: 'bandpass', freq: 600, q: 0.8, vol: 0.25, delay: 0.08, attack: 0.05, pan }); tone(120, 0.25, { vol: 0.2, endFreq: 60, pan }); break;
      case 'dive': noise(0.5, { type: 'bandpass', freq: 400, q: 1.2, vol: 0.3, attack: 0.02, pan }); tone(90, 0.4, { vol: 0.15, endFreq: 40, pan }); break;
      case 'wetThud': noise(0.2, { freq: 220, vol: 0.8, pan }); noise(0.3, { type: 'bandpass', freq: 900, q: 1, vol: 0.3, delay: 0.03, pan }); tone(50, 0.3, { vol: 0.6, endFreq: 32, pan }); break;
      case 'bar': noise(0.15, { freq: 400, vol: 0.6 }); tone(80, 0.3, { vol: 0.5, endFreq: 45 }); noise(0.06, { freq: 1500, vol: 0.3, delay: 0.16 }); break;
      case 'fit': tone(520, 0.05, { vol: 0.18, type: 'square', endFreq: 380 }); noise(0.05, { freq: 1200, vol: 0.2, delay: 0.05 }); break;
      case 'clunk': tone(140, 0.08, { vol: 0.35, type: 'square', endFreq: 90 }); noise(0.06, { freq: 700, vol: 0.4 }); break;
      case 'lever': noise(0.12, { freq: 900, vol: 0.35 }); tone(180, 0.2, { vol: 0.3, type: 'square', endFreq: 110, delay: 0.08 }); noise(0.05, { freq: 500, vol: 0.5, delay: 0.25 }); break;
      case 'lampOn': tone(60, 1.6, { vol: 0.25, type: 'sine', endFreq: 90, attack: 0.3 }); noise(0.25, { freq: 900, vol: 0.2 }); tone(240, 0.5, { vol: 0.06, type: 'sawtooth', attack: 0.2, delay: 0.3 }); break;
      case 'scrape': noise(0.4, { type: 'bandpass', freq: 1800, q: 4, vol: 0.4, attack: 0.02, pan }); tone(230, 0.35, { vol: 0.12, type: 'sawtooth', endFreq: 180, pan }); break;
      case 'bell': for (const [f, d] of [[2093, 0], [2637, 0.05], [2093, 0.13], [2637, 0.2]]) tone(f, 0.7, { vol: 0.1, type: 'sine', delay: d }); noise(0.03, { type: 'highpass', freq: 5000, vol: 0.15 }); break;
      case 'tubeDie': for (let i = 0; i < 5; i++) noise(0.03, { type: 'highpass', freq: 3500, vol: 0.18, delay: i * 0.07 + Math.random() * 0.03 }); tone(120, 0.5, { vol: 0.08, type: 'sawtooth', endFreq: 60, delay: 0.3 }); break;
      case 'tubeOn': tone(120, 0.35, { vol: 0.1, type: 'sawtooth', attack: 0.05 }); noise(0.08, { type: 'highpass', freq: 3000, vol: 0.15 }); break;
      case 'glassTap': for (let i = 0; i < 3; i++) tone(1900, 0.04, { vol: 0.14, type: 'triangle', endFreq: 1500, delay: i * 0.28 }); break;
      case 'horn': for (const f of [311, 370, 466]) tone(f, 1.6, { vol: 0.14, type: 'sawtooth', attack: 0.15, pan }); noise(1.4, { type: 'bandpass', freq: 900, q: 1.5, vol: 0.12, attack: 0.2, pan }); break;
      case 'brakes': noise(2.4, { type: 'bandpass', freq: 2600, q: 5, vol: 0.55, attack: 0.1 }); tone(1900, 2.2, { vol: 0.12, type: 'sawtooth', endFreq: 1500, attack: 0.2 }); noise(1.8, { freq: 300, vol: 0.4, delay: 0.3, attack: 0.1 }); break;
      case 'musicbox': [[880, 0], [1175, 0.25], [1319, 0.5], [1175, 0.75], [988, 1.0], [880, 1.3], [1319, 1.7], [1568, 1.95], [1319, 2.3], [1175, 2.55]].forEach(([f, d]) => tone(f, 0.55, { vol: 0.06, type: 'triangle', delay: d, pan })); break;
      case 'tick': noise(0.012, { type: 'bandpass', freq: 3200, q: 4, vol: 0.14, pan }); tone(1600, 0.02, { vol: 0.05, type: 'square', pan }); break;
      case 'knock': for (const d of [0, 0.32]) { noise(0.06, { freq: 500, vol: 0.5, delay: d, pan }); tone(160, 0.12, { vol: 0.3, endFreq: 100, delay: d, pan }); } break;
      case 'hangers': for (let i = 0; i < 6; i++) tone(2200 + Math.random() * 1400, 0.05, { vol: 0.045, type: 'triangle', delay: i * 0.06 + Math.random() * 0.03, pan }); break;
      case 'switch': tone(900, 0.02, { vol: 0.14, type: 'square', endFreq: 500 }); noise(0.02, { freq: 2500, vol: 0.2, delay: 0.02 }); break;
      case 'flicker': for (let i = 0; i < 4; i++) noise(0.02, { type: 'highpass', freq: 3000, vol: 0.15, delay: i * 0.09 + Math.random() * 0.04 }); tone(120, 0.5, { vol: 0.06, type: 'sawtooth', endFreq: 40, delay: 0.3 }); break;
      case 'birds': { const f0 = 2200 + Math.random() * 1200; for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) tone(f0 + Math.random() * 600, 0.07, { vol: 0.05, type: 'sine', endFreq: f0 + 300 + Math.random() * 500, delay: i * 0.11, pan }); break; }
      case 'stingWet': noise(0.5, { freq: 1600, vol: 1.0, attack: 0.002 }); noise(1.4, { type: 'bandpass', freq: 500, q: 1, vol: 0.7, delay: 0.1, attack: 0.05 }); tone(42, 1.4, { vol: 0.7, endFreq: 26 }); tone(700, 0.9, { vol: 0.3, type: 'sawtooth', endFreq: 200, delay: 0.15 }); break;
      case 'stingScrape': noise(1.1, { type: 'bandpass', freq: 2400, q: 3, vol: 0.9, attack: 0.002 }); tone(1400, 0.8, { vol: 0.35, type: 'sawtooth', endFreq: 3000 }); tone(45, 1.3, { vol: 0.7, endFreq: 28, delay: 0.1 }); break;
      case 'stingGlass': noise(0.15, { type: 'highpass', freq: 3000, vol: 1.0, attack: 0.001 }); for (let i = 0; i < 9; i++) tone(2500 + Math.random() * 3500, 0.3 + Math.random() * 0.5, { vol: 0.14, type: 'triangle', delay: 0.02 + i * 0.05 }); tone(50, 1.4, { vol: 0.7, endFreq: 30, delay: 0.05 }); noise(1.2, { freq: 400, vol: 0.4, delay: 0.1, attack: 0.05 }); break;
      case 'crack': noise(0.06, { freq: 2500, vol: 0.5 }); break;
      default: break;
    }
  }

  return { init, on, resume, suspend, setMuted, setVolume, startAmbient, stopAmbient, setLoop, stopLoop, heartbeat, footstep, voice, sfx, get muted() { return muted; } };
})();
