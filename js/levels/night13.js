'use strict';
// ============================================================ 13. THE VOID ============================================================
// Nothing at all: a faint floor that fades into black. Around you lies everything you ever held against it, and you
// begin the night holding some of it. It comes from anywhere. Holding anything enrages it. Put it all down.
// The ending plays out here, without a cut: caught empty-handed, it stops, its face turns happy, and the dark lightens
// until it is plainly the bedroom, in the morning, and always was. It dances at the foot of the bed and glitters away.
const VOID_TOOLS = [
  ['hammer', 'Hammer', 0.42, 0.42], ['planks', 'Planks', 1.0, 0.7], ['salt', 'Bag of salt', 0.34, 0.42], ['lantern', 'Lantern', 0.3, 0.44], ['matches', 'Matches', 0.16, 0.16],
  ['chain', 'Chain', 0.6, 0.75], ['padlock', 'Padlock', 0.22, 0.26], ['shotgun', 'Shotgun', 1.1, 0.36], ['shells', 'Shells', 0.3, 0.3], ['handle', 'Winch handle', 0.45, 0.45],
  ['fuse', 'Fuse', 0.3, 0.3], ['crank', 'Shutter crank', 0.42, 0.42], ['musicbox', 'Music box', 0.34, 0.34], ['beam', 'Bar', 1.4, 0.45], ['oilcan', 'Oil can', 0.28, 0.36], ['bulb', 'Bulb', 0.14, 0.2],
];
// the void, and the same place in the morning (night 12's room with the sun in it)
const VOID_PAL = { skyTop: [0, 0, 0], fog: [0, 0, 0], ground: [10, 10, 12], fogDist: 14 };
const MORNING_PAL = { skyTop: [150, 190, 240], fog: [236, 236, 238], ground: [200, 190, 170], fogDist: 60 };
LEVELS.push({
  id: 'void', title: 'The Void', facing: 0, eyeH: 1.65, laneMode: 'random', ending: true,
  pal: Object.assign({}, VOID_PAL),
  ambient: { wind: 0.2, drone: 1.3, droneFreq: 34, windFreq: 160 },
  text: {
    intro: 'Nothing. No door, no field, no line. Around you on the floor lies everything you ever held against it.<br>It is coming, from wherever it likes, and it knows what you are holding.',
    hint: 'Put them down. All of them.',
    objective: 'Put everything down.',
    death: { default: 'You were still holding on.' },
    win: '',
    fragment: '',
  },
  lanes: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((name, k) => ({ deg: k * 45, name, barrierDist: 0, default: k === 0 })),
  creatures: [{ type: 'demon', startDist: 40, time: 75, gamma: 0.85, unseenMult: 1.3 }],
  aftermath: { type: 'custom' },
  uses: [{
    tool: 'shotgun', ammo: 'shells', range: 40, sfx: 'shot', flash: 0.45, emptyText: 'Click.', fireText: 'Fire.',
    onHit(c, hits, L) { L.s.extra += 1; G.toast('It does not slow. It is angrier.'); },
    onMiss(L) { L.s.extra += 1; G.toast('It heard that.'); },
  }],
  build(L) {
    const s = L.s;
    Object.assign(s, { extra: 0, ending: false, endT: 0, reveal: 0, gone: 0, glitterAt: -1 });
    // a floor that is only a floor near you (and the lamp, off, a little way out): the void's own props, which fade as the room comes
    const v0 = L.props.length;
    for (let r = 0; r < 12; r++) { const r0 = r * 1.2, r1 = r0 + 1.2, k = 1 - r / 12, col = [10 + 26 * k * k, 10 + 26 * k * k, 12 + 30 * k * k]; for (let i = 0; i < 16; i++) { const a0 = i / 16 * TAU, a1 = (i + 1) / 16 * TAU; SC.quad(L, [Math.sin(a0) * r0, 0, Math.cos(a0) * r0], [Math.sin(a1) * r0, 0, Math.cos(a1) * r0], [Math.sin(a1) * r1, 0, Math.cos(a1) * r1], [Math.sin(a0) * r1, 0, Math.cos(a0) * r1], col, { layer: 0, noLight: true }); } }
    STORY.lamp(L, 0, 0, 3.2, { lit: false, scale: 0.9 });
    const voidProps = L.props.slice(v0);
    // the room that was always here: built now, invisible until the light comes
    const r0 = L.props.length;
    STORY.buildBedroom(L, true);
    STORY.lamp(L, 1.2, 0.62, 0.15, { lit: false });
    const roomProps = L.props.slice(r0);
    for (const p of voidProps) p.alpha0 = p.alpha === undefined ? 1 : p.alpha;
    for (const p of roomProps) { p.alpha0 = p.alpha === undefined ? 1 : p.alpha; p.alpha = 0; }
    // the ring of everything, and what you start the night holding
    const hold = L.tier(3, 5, 6), ringR = L.tier(2.0, 1.7, 1.7);
    const rng = mulberry32((G.runSeed * 31 + 13) >>> 0);
    const order = VOID_TOOLS.slice().sort(() => rng() - 0.5);
    order.forEach(([id, name, w, h], k) => {
      const a = k / order.length * TAU + 0.2, r = ringR + (k % 2) * 0.5;
      const it = mkItem(L, id, name, { x: Math.sin(a) * r, y: 0, z: Math.cos(a) * r, flat: true }, { w, h, flat: true, tool: id === 'shotgun' || id === 'matches' || id === 'hammer', uses: id === 'shells' ? 3 : 1 });
      if (k < hold) { it.taken = true; G.inv.push(it); }
    });
    G.active = 0;
    const c0 = () => L.creatures[0];
    L.isWon = () => false;
    L.objectiveText = () => G.inv.length ? 'Put everything down (' + G.inv.length + ' still held).' : 'Empty-handed. Let it come.';
    // being caught empty-handed is the ending, not a death: it stops, and walks round to the foot of the bed
    L.onCatch = c => {
      if (G.inv.length > 0) return false;
      s.ending = true; s.endT = 0; c.frozen = true; c.hold = null;
      c.lane = Object.assign({}, c.lane, { follow: 'free', apertures: [], blockers: [] });   // placed by yaw and distance from here on
      const yaw0 = c.yaw, d0 = c.dist, yaw1 = L.facing;   // the foot of the bed is north
      c.distFn = (cr) => { const k = smoothstep(clamp(s.endT / 2.6, 0, 1)); cr.yaw = yaw0 + wrapPi(yaw1 - yaw0) * k; return lerp(d0, 2.7, k); };
      AUDIO.sfx('stingHum'); win(); return true;
    };
    const sun = (() => { const d = [-1, -0.45, -0.15], n = Math.hypot(d[0], d[1], d[2]); return { x: 3.4, y: 2.4, z: 1.6, r: 12, i: 0.55, color: [255, 244, 210], cone: { x: d[0] / n, y: d[1] / n, z: d[2] / n, cos: Math.cos(40 * DEG) } }; })();
    L.update = dt => {
      const c = c0();
      c.anger = G.inv.length + s.extra;
      c.rage += ((c.anger > 0 ? Math.min(1, 0.6 + 0.4 * c.anger / 6) : 0) - c.rage) * Math.min(1, dt * 4);   // anything held and it is plainly enraged
      if (!s.ending) return;
      s.endT += dt; const t = s.endT;
      c.calm = clamp((t - 0.4) / 1.8, 0, 1);
      // the light comes: the void's floor goes, the room is there, the eye settles to where you are sitting up in bed
      const rv = s.reveal = smoothstep(clamp((t - 2.2) / 6.5, 0, 1));
      for (const p of voidProps) p.alpha = p.alpha0 * (1 - rv);
      for (const p of roomProps) p.alpha = p.alpha0 * rv;
      for (const k of ['skyTop', 'fog', 'ground']) L.pal[k] = mixc(VOID_PAL[k], MORNING_PAL[k], rv);
      L.pal.fogDist = lerp(VOID_PAL.fogDist, MORNING_PAL.fogDist, rv);
      L.eyeH = lerp(1.65, 1.15, rv);
      c.soft = rv;
      // everything on the floor goes with the dark, one thing at a time
      const left = L.items.filter(i => !i.taken);
      if (rv > 0.08 && left.length && rv > s.gone) { left[0].taken = true; s.gone = rv + 0.5 / VOID_TOOLS.length; }
      if (rv > 0.05 && !s.dawn) { s.dawn = true; AUDIO.stopAmbient(); if (AUDIO.on()) AUDIO.startAmbient({ wind: 0.25, drone: 0 }); WEATHER.set({ kind: 'motes', density: 1.2, wind: 0.1 }, 7); Seq.play({ dur: 14, beats: [{ every: 2.3, from: 1.5, do: () => AUDIO.sfx('birds', Math.random() - 0.5) }] }); }
      // then it dances at the foot of the bed to the little tune, and glitters away
      c.dance = t > 8.4 && t < 12.9 ? Math.min(1, (t - 8.4) * 2, (12.9 - t) * 2) : 0;
      if (t > 8.4 && !s.tune) { s.tune = true; AUDIO.sfx('musicbox', 0); setTimeout(() => { if (G.state === 'won') AUDIO.sfx('musicbox', 0); }, 3200); }
      if (t > 12.6 && s.glitterAt < 0) { s.glitterAt = t; AUDIO.sfx('win'); }
      c.fade = s.glitterAt < 0 ? 1 : clamp(1 - (t - s.glitterAt) / 1.8, 0, 1);
    };
    L.aftermath = t => s.endT >= 16;
    L.dynamic = () => {
      if (s.glitterAt < 0) return;
      // the glitter: sparks spiralling up and out from where it stood, twinkling, gone in a few seconds
      const c = c0(), p = c.pos(), k = s.endT - s.glitterAt;
      if (k > 3.2) return;
      for (let i = 0; i < 46; i++) {
        const a = i * 2.39996 + k * (0.8 + (i % 5) * 0.2), r = 0.12 + (i % 7) * 0.06 + k * (0.25 + (i % 3) * 0.12), y = 0.2 + (i % 11) * 0.19 + k * (0.35 + (i % 4) * 0.18);
        const tw = 0.5 + 0.5 * Math.sin(k * 14 + i * 1.7), al = clamp(1.2 - k / 2.6, 0, 1) * (0.35 + 0.65 * tw), sz = 0.05 + (i % 3) * 0.025;
        const col = (i % 4) === 0 ? [255, 214, 120] : (i % 4) === 1 ? [255, 190, 220] : [255, 250, 236];
        R.add(SC.mkSprite(L, p.x + Math.sin(a) * r, y, p.z + Math.cos(a) * r, sz, sz, (ctx, P) => {
          ctx.globalAlpha *= al; ctx.scale(sz, sz); ctx.fillStyle = P.raw(col);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0.12, 0.38); ctx.lineTo(0.5, 0.5); ctx.lineTo(0.12, 0.62); ctx.lineTo(0, 1); ctx.lineTo(-0.12, 0.62); ctx.lineTo(-0.5, 0.5); ctx.lineTo(-0.12, 0.38); ctx.closePath(); ctx.fill();
        }, { noFog: true, noLight: true }));
      }
    };
    L.dynamicLights = () => {
      const c = c0(), p = c.pos(), a = (c.rage || 0) * (1 - (c.calm || 0)), out = [];
      if (c.fade > 0.05) out.push({ x: p.x, y: 1.4, z: p.z, r: 3 + a * 4, i: (0.25 + a * 0.5) * (1 - s.reveal) * c.fade, color: [200, 60, 60], flicker: 0.5, seed: 13 });
      if (s.reveal > 0.01) out.push(Object.assign({}, sun, { i: sun.i * s.reveal }));
      return out;
    };
    L.glows = () => s.reveal > 0.01 ? [{ x: 2.2, y: 1.45, z: 1.6, r: 2.2, color: [255, 246, 220], a: 0.4 * s.reveal }] : null;
    L.floor = { poly: [[-6, -6], [6, -6], [6, 6], [-6, 6]], y: 0 };
  }
});
