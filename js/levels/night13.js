'use strict';
// ============================================================ 13. THE VOID ============================================================
// Nothing at all: a faint floor that fades into black. Around you lies everything you ever held against it, and you
// begin the night holding some of it. It comes from anywhere. Holding anything makes it angrier. Put it all down.
const VOID_TOOLS = [
  ['hammer', 'Hammer', 0.42, 0.42], ['planks', 'Planks', 1.0, 0.7], ['salt', 'Bag of salt', 0.34, 0.42], ['lantern', 'Lantern', 0.3, 0.44], ['matches', 'Matches', 0.16, 0.16],
  ['chain', 'Chain', 0.6, 0.75], ['padlock', 'Padlock', 0.22, 0.26], ['shotgun', 'Shotgun', 1.1, 0.36], ['shells', 'Shells', 0.3, 0.3], ['handle', 'Winch handle', 0.45, 0.45],
  ['fuse', 'Fuse', 0.3, 0.3], ['crank', 'Shutter crank', 0.42, 0.42], ['musicbox', 'Music box', 0.34, 0.34], ['beam', 'Bar', 1.4, 0.45], ['oilcan', 'Oil can', 0.28, 0.36], ['bulb', 'Bulb', 0.14, 0.2],
];
LEVELS.push({
  id: 'void', title: 'The Void', facing: 0, eyeH: 1.65, laneMode: 'random', ending: true,
  pal: { skyTop: [0, 0, 0], fog: [0, 0, 0], ground: [10, 10, 12], fogDist: 14 },
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
    Object.assign(s, { extra: 0, ending: false });
    // a floor that is only a floor near you
    for (let r = 0; r < 12; r++) { const r0 = r * 1.2, r1 = r0 + 1.2, k = 1 - r / 12, col = [10 + 26 * k * k, 10 + 26 * k * k, 12 + 30 * k * k]; for (let i = 0; i < 16; i++) { const a0 = i / 16 * TAU, a1 = (i + 1) / 16 * TAU; SC.quad(L, [Math.sin(a0) * r0, 0, Math.cos(a0) * r0], [Math.sin(a1) * r0, 0, Math.cos(a1) * r0], [Math.sin(a1) * r1, 0, Math.cos(a1) * r1], [Math.sin(a0) * r1, 0, Math.cos(a0) * r1], col, { layer: 0, noLight: true }); } }
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
    STORY.lamp(L, 0, 0, 3.2, { lit: false, scale: 0.9 });
    const c0 = () => L.creatures[0];
    L.isWon = () => false;
    L.objectiveText = () => G.inv.length ? 'Put everything down (' + G.inv.length + ' still held).' : 'Empty-handed. Let it come.';
    L.update = dt => {
      const c = c0();
      c.anger = G.inv.length + s.extra;
      if (L.won) { c.calm = Math.min(1, c.calm + dt / 3); }
    };
    // being caught empty-handed is the ending, not a death
    L.onCatch = c => { if (G.inv.length > 0) return false; s.ending = true; c.hold = 1.25; c.frozen = true; AUDIO.sfx('stingHum'); win(); return true; };
    L.aftermath = (t, dt) => {
      L.pal.ambient = 1 + t * 0.35;
      if (t > 2.5) { G.whiteTarget = 1; }
      return t >= 6;
    };
    L.dynamicLights = () => { const c = c0(), p = c.pos(); return [{ x: p.x, y: 1.4, z: p.z, r: 3 + (c.anger || 0) * 0.6, i: 0.25 + (c.anger || 0) * 0.08, color: [200, 60, 60], flicker: 0.5, seed: 13 }]; };
    L.floor = { poly: [[-6, -6], [6, -6], [6, 6], [-6, 6]], y: 0 };
  }
});
