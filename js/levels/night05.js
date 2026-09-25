'use strict';
// ============================================================ 5. THE CLEARING ============================================================
LEVELS.push({
  id: 'clearing', title: 'The Clearing', facing: 180, eyeH: 2.0,
  pal: { skyTop: [6, 8, 16], fog: [54, 60, 74], ground: [126, 132, 148], fogDist: 120 },
  ambient: { wind: 1.1, drone: 0.6, droneFreq: 46, windFreq: 420 },
  weather: { kind: 'snow', density: 1, wind: 0.5 },
  lights: [{ x: 1.7, y: 1.7, z: -1.45, r: 6, i: 0.55, color: [255, 190, 110], flicker: 0.15 }],
  text: {
    intro: 'Something has been running the tree line all evening, watching the cabin.<br>Now it is coming for the porch.',
    hint: 'The shotgun is somewhere on the porch, and so are the shells. You will need two that fire.',
    objective: 'Get the gun. Load it. Wait.',
    death: { default: 'It did not even slow down on the steps.' },
    win: 'You sat on the porch with the gun across your knees until it got light, and nothing else came out of the trees. This time.',
    fragment: 'Your shoulder was bruised in the morning, a neat oval, as if you had held something hard against it all night.',
  },
  // it comes at the steps, or round the open side of the porch
  lanes: [
    { deg: 0, name: 'porch steps', barrierDist: 0, cue: 'crack', default: true },
    { deg: 90, name: 'porch side', barrierDist: 0, cue: 'crack' },
  ],
  creatures: [{ type: 'runner', startDist: 115, time: 56, gamma: 0.72, unseenMult: 1.3 }],
  aftermath: { type: 'down', dur: 3.6 },
  uses: [{
    tool: 'shotgun', ammo: 'shells', range: 32, sfx: 'shot', flash: 0.55, emptyText: 'Click. Nothing in it.', fireText: 'Fire.',
    onHit(c, hits, L) {
      if (hits === 1) { c.wounded = true; c.mode = 'stumble'; c.modeT = 0; G.toast('It went down. It is getting back up.'); }
      else { c.dead = true; c.latHold = c.lat; G.toast('It stopped.'); }
    },
    onMiss(L) { const s = G.inv.find(i => i.id === 'shells'); G.toast(s ? 'Missed.' : 'Missed. That was the last one.'); },
  }],
  build(L) {
    const logs = [60, 44, 32], logsD = [42, 30, 22], porch = [76, 62, 50];
    SC.stars(L, 51, 220, 0.9);
    SC.clouds(L, 52, 4, [26, 30, 44], 0.4);
    SC.moon(L, 150, 21, 6, [220, 224, 235]);
    SC.floorQ(L, -3.2, -1.6, 3.2, 1.6, 0.35, porch, { tex: 'planks', texScale: 1.3 });
    for (let x = -3.0; x < 3.2; x += 0.42) SC.floorQ(L, x, -1.6, x + 0.03, 1.6, 0.355, logsD);
    SC.wallV(L, -3.2, 1.6, 3.2, 1.6, 0, 0.35, logsD);
    SC.wallV(L, 3.2, -1.6, 3.2, 1.6, 0, 0.35, logsD);
    SC.box(L, -0.8, 0.8, 0, 0.18, 1.6, 2.2, porch);
    SC.box(L, 3.2, 3.8, 0, 0.18, -0.6, 0.6, porch);
    SC.wallV(L, -3.4, -1.6, 3.4, -1.6, 0, 3.0, logs, { tex: 'logs', texScale: 1.0 });
    for (let y = 0.3; y < 3; y += 0.32) SC.wallV(L, -3.4, -1.59, 3.4, -1.59, y, y + 0.05, logsD);
    SC.wallV(L, -0.55, -1.58, 0.55, -1.58, 0.35, 2.3, [32, 24, 18]);
    SC.wallV(L, 1.2, -1.58, 2.2, -1.58, 1.3, 2.1, [222, 162, 82], { noFog: true });
    SC.wallV(L, 1.68, -1.57, 1.72, -1.57, 1.3, 2.1, logsD); SC.wallV(L, 1.2, -1.57, 2.2, -1.57, 1.68, 1.72, logsD);
    for (const x of [-3.0, 3.0]) SC.box(L, x - 0.08, x + 0.08, 0.35, 2.95, 1.42, 1.58, logsD);
    SC.box(L, 3.0, 3.16, 0.35, 2.95, -1.5, -1.34, logsD);
    SC.quad(L, [-3.4, 2.95, 1.75], [3.4, 2.95, 1.75], [3.4, 3.2, -1.6], [-3.4, 3.2, -1.6], [28, 20, 15]);
    for (const [x0, x1] of [[-3.0, -0.9], [0.9, 3.0]]) {
      SC.wallV(L, x0, 1.5, x1, 1.5, 1.2, 1.3, logsD); SC.wallV(L, x0, 1.5, x1, 1.5, 0.8, 0.85, logsD);
      for (let x = x0 + 0.3; x < x1; x += 0.45) SC.wallV(L, x, 1.5, x + 0.05, 1.5, 0.36, 1.2, logsD);
    }
    // the west side of the porch is railed; the east side is open where the steps down to the yard are
    SC.wallV(L, -3.1, -1.5, -3.1, 1.5, 1.2, 1.3, logsD); SC.wallV(L, -3.1, -1.5, -3.1, 1.5, 0.8, 0.85, logsD);
    for (let z = -1.3; z < 1.5; z += 0.45) SC.wallV(L, -3.1, z, -3.1, z + 0.05, 0.36, 1.2, logsD);
    SC.box(L, 2.0, 3.0, 0.35, 1.1, -1.35, -0.3, [72, 54, 38]);
    STORY.lamp(L, 2.2, 1.1, -1.1, { scale: 0.8 });
    SC.box(L, -3.0, -2.3, 0.35, 0.85, -1.4, -0.9, [70, 56, 44]);
    const rng = mulberry32(55);
    for (let i = 0; i < 90; i++) { const a = (rng() - 0.5) * 170 * DEG, d = 105 + rng() * 90; SC.tree(L, Math.sin(a) * d, Math.cos(a) * d, 10 + rng() * 10, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 14; i++) { const x = (rng() < 0.5 ? -1 : 1) * (9 + rng() * 30), z = 6 + rng() * 60; SC.tree(L, x, z, 7 + rng() * 6, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 22; i++) { const x = (rng() - 0.5) * 90, z = -8 - rng() * 45; SC.tree(L, x, z, 9 + rng() * 8, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 40; i++) { const a = (70 + rng() * 40) * DEG, d = 100 + rng() * 90; SC.tree(L, Math.sin(a) * d, Math.cos(a) * d, 10 + rng() * 10, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 12; i++) { const x = 10 + rng() * 60, z = (rng() < 0.5 ? -1 : 1) * (4 + rng() * 22); SC.tree(L, x, z, 7 + rng() * 6, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 14; i++) { const x = (rng() - 0.5) * 50, z = 4 + rng() * 40; if (Math.abs(x) < 1.5) continue; SC.boulder(L, x, z, 0.3 + rng() * 0.5, (rng() * 1e6) | 0); }
    const pegs = (L, sp) => { for (const dx of [-0.4, 0.4]) SC.box(L, sp.x + dx - 0.05, sp.x + dx + 0.05, sp.y + 0.08, sp.y + 0.14, -1.62, -1.5, logsD); };
    mkItem(L, 'shotgun', 'Shotgun', [
      { x: 0, y: 2.28, z: -1.52, setup: pegs },         // on pegs above the door
      { x: 1.6, y: 2.05, z: -1.52, setup: pegs },       // on pegs by the window
      { x: -1.3, y: 1.9, z: -1.52, setup: pegs },       // on pegs left of the door
      { x: 2.5, y: 1.1, z: -0.8, flat: true, key: 'woodpile' },   // lying on the woodpile
      { x: -2.65, y: 0.85, z: -1.15, flat: true, key: 'crate' }, // lying on the crate
    ], { w: 1.1, h: 0.36, tool: true });
    const shellSpots = [
      { deg: 90, dist: 1.5, y: 0.36 },                  // porch floor, right
      { x: -1.4, y: 0.36, z: 0.4 },                     // porch floor, left
      { x: 0.7, y: 0.36, z: -1.2 },                     // by the door
      { x: -2.65, y: 0.85, z: -1.15, jitter: 0.04, key: 'crate' },  // on the crate
      { x: 2.5, y: 1.1, z: -0.5, jitter: 0.06, key: 'woodpile' },   // on the woodpile
      { x: -2.2, y: 0.36, z: 1.2 },                     // porch floor, far left
    ];
    // shells: one box; two boxes on Hard; on Nightmare one of the two is duds
    if (L.diff.tier < 2) mkItem(L, 'shells', 'Shells', shellSpots, { w: 0.3, h: 0.3, flat: true, uses: 3, tool: true });
    else {
      mkItem(L, 'shells', 'Shells', shellSpots, { w: 0.3, h: 0.3, flat: true, uses: 2, tool: true });
      if (L.diff.tier >= 3) mkItem(L, 'duds', 'Shells', shellSpots, { w: 0.3, h: 0.3, flat: true, uses: 2, tool: true, icon: 'shells' });
      else mkItem(L, 'shells', 'Shells', shellSpots, { w: 0.3, h: 0.3, flat: true, uses: 1, tool: true });
    }
    L.floor = { poly: [[-3.1, -1.5], [3.1, -1.5], [3.1, 1.5], [-3.1, 1.5]], y: 0.36 };
    L.onPickup = it => { if ((it.id === 'shotgun' && G.hasItem('shells')) || (it.id === 'shells' && G.hasItem('shotgun'))) AUDIO.sfx('load'); };
    L.isWon = () => L.creature.dead;
    L.objectiveText = () => { const s = G.inv.filter(i => i.id === 'shells').reduce((a, i) => a + i.uses, 0); return L.creature.dead ? 'It is down.' : !G.hasItem('shotgun') ? 'Get the gun.' : !s ? 'Load it.' : (s + ' shell' + (s > 1 ? 's' : '') + '. Let it get close.'); };
  }
});
