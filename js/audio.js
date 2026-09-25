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
      case 'hiss': noise(0.6, { type: 'bandpass', freq: 3000, q: 0.6, vol: 0.18, attack: 0.05 }); break;
      case 'sting':
        noise(1.4, { freq: 2500, vol: 1.0, attack: 0.002 });
        tone(400, 1.2, { vol: 0.5, type: 'sawtooth', endFreq: 40 });
        tone(40, 1.5, { vol: 0.7, endFreq: 25 });
        for (let i = 0; i < 6; i++) tone(1200 + Math.random() * 2000, 0.12, { vol: 0.2, type: 'square', delay: 0.05 + i * 0.09 });
        break;
      case 'win': for (const [f, d] of [[220, 0], [277, 0.25], [330, 0.5], [415, 0.9]]) tone(f, 2.2, { vol: 0.08, type: 'triangle', attack: 0.3, delay: d }); break;
      case 'thud': noise(0.15, { freq: 150, vol: 0.9 }); tone(45, 0.25, { vol: 0.8, endFreq: 30 }); break;
      case 'crack': noise(0.06, { freq: 2500, vol: 0.5 }); break;
      default: break;
    }
  }

  return { init, on, resume, suspend, setMuted, setVolume, startAmbient, stopAmbient, setLoop, stopLoop, heartbeat, footstep, sfx, get muted() { return muted; } };
})();
