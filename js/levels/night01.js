'use strict';
// ============================================================ 1. THE FIELD ============================================================
LEVELS.push({
  id: 'field', title: 'The Field', facing: 0, eyeH: 1.65,
  pal: { skyTop: [6, 8, 18], fog: [46, 52, 68], ground: [36, 46, 32], fogDist: 105 },
  ambient: { wind: 1, drone: 0.8, droneFreq: 50, windFreq: 380 },
  text: {
    intro: 'You woke up at the back door, and it was open.<br>Something is walking across the field toward the house. It has been walking for a while.',
    hint: 'There are planks somewhere in the house, and a hammer.',
    objective: 'Board up the back door.',
    death: { default: 'The boards were not enough, or were not there.', reached: 'It tore the boards off.' },
    win: 'It hit the boards until sunrise. They held.',
  },
  lanes: [{ deg: 0, name: 'back door', barrierDist: 2.75, apertures: [{ z: 2.45, x0: -0.8, x1: 0.8, y0: 0, y1: 2.12 }] }],
  creatures: [{ type: 'walker', startDist: 130, time: 80, gamma: 0.72, unseenMult: 1.35 }],
  aftermath: { type: 'held', dur: 3.8, every: 0.75, sfx: 'bang', shake: 0.5 },
  build(L) {
    const wood = [50, 40, 33], woodD = [38, 30, 25], frame = [96, 76, 52], floor = [46, 37, 30];
    SC.stars(L, 3, 170, 0.8);
    SC.moon(L, 24, 13, 8, [228, 222, 200]);
    const rng = mulberry32(11);
    for (let i = 0; i < 32; i++) { const x = (rng() * 2 - 1) * 120, z = 60 + rng() * 70; SC.tree(L, x, z, 7 + rng() * 7, 'bare', (rng() * 1e6) | 0); }
    for (let i = 0; i < 7; i++) { const x = (rng() * 2 - 1) * 60, z = 24 + rng() * 26; if (Math.abs(x) > 6) SC.tree(L, x, z, 5 + rng() * 5, rng() < 0.5 ? 'bare' : 'round', (rng() * 1e6) | 0); }
    SC.fenceLine(L, -45, 17, 45, 17, 2.7, 1.15, [44, 40, 34]);
    SC.groundDots(L, 5, 220, 6, 60, 110, [28, 36, 24], 0.22);
    // the house you are standing in: the back door looks out over the field
    SC.floorQ(L, -2.8, -2.4, 2.8, 2.6, 0.006, floor);
    SC.quad(L, [-2.8, 2.7, -2.4], [2.8, 2.7, -2.4], [2.8, 2.7, 2.6], [-2.8, 2.7, 2.6], [30, 24, 20]);
    SC.wallV(L, -7, 2.6, -0.8, 2.6, 0, 2.7, wood);
    SC.wallV(L, 0.8, 2.6, 7, 2.6, 0, 2.7, wood);
    SC.wallV(L, -0.8, 2.6, 0.8, 2.6, 2.12, 2.7, wood);
    SC.wallV(L, -2.8, -2.4, -2.8, 2.6, 0, 2.7, woodD);
    SC.wallV(L, 2.8, -2.4, 2.8, 2.6, 0, 2.7, woodD);
    SC.wallV(L, -2.8, -2.4, 2.8, -2.4, 0, 2.7, woodD);
    for (let y = 0.28; y < 2.7; y += 0.3) { SC.wallV(L, -7, 2.59, -0.8, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, 0.8, 2.59, 7, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, -2.79, -2.4, -2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, 2.79, -2.4, 2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, -2.8, -2.39, 2.8, -2.39, y, y + 0.03, [26, 21, 17]); }
    // a window in the back wall with a little moonlight in it
    SC.wallV(L, -0.7, -2.39, 0.7, -2.39, 1.1, 2.0, [36, 42, 60]);
    SC.wallV(L, -0.04, -2.38, 0.04, -2.38, 1.1, 2.0, woodD); SC.wallV(L, -0.7, -2.38, 0.7, -2.38, 1.52, 1.58, woodD);
    // door frame and the step outside
    SC.wallV(L, -0.92, 2.55, -0.8, 2.55, 0, 2.2, frame); SC.wallV(L, 0.8, 2.55, 0.92, 2.55, 0, 2.2, frame); SC.wallV(L, -0.92, 2.55, 0.92, 2.55, 2.1, 2.22, frame);
    SC.box(L, -1.1, 1.1, 0, 0.16, 2.6, 3.3, [74, 70, 64]);
    // furniture: table east, shelf west, chair south
    SC.box(L, 1.5, 2.6, 0.72, 0.78, -0.55, 0.45, [74, 56, 42]);
    for (const [x, z] of [[1.55, -0.5], [2.55, -0.5], [1.55, 0.4], [2.55, 0.4]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.72, z - 0.04, z + 0.04, [62, 46, 34]);
    SC.box(L, -2.78, -2.45, 1.22, 1.28, -0.2, 1.3, [66, 52, 40]);
    SC.box(L, -0.8, -0.3, 0.42, 0.48, -2.1, -1.6, [68, 52, 40]); SC.box(L, -0.8, -0.3, 0.48, 1.0, -2.1, -2.04, [68, 52, 40]);
    SC.box(L, 1.7, 2.0, 0.78, 1.0, -0.2, 0.1, [40, 34, 30]);   // a lamp base on the table, unlit
    // items
    mkItem(L, 'hammer', 'Hammer', [
      { x: 1.25, y: 0, z: 0.35 },                       // on the floor by the table
      { x: -2.2, y: 0, z: 0.7 },                        // under the shelf
      { x: -0.1, y: 0, z: -1.75 },                      // beside the chair
      { x: 1.9, y: 0, z: 1.85 },                        // in the corner by the door
      { x: -2.55, y: 1.28, z: -0.05, flat: false },     // on the shelf
    ], { w: 0.42, h: 0.42, flat: true, tool: true });
    mkItem(L, 'planks', 'Planks', [
      { deg: 225, dist: 1.75, y: 0 },                   // south-west corner
      { x: -1.5, y: 0, z: 1.6 },                        // north-west, by the front wall
      { x: 1.4, y: 0, z: -1.7 },                        // south-east
      { x: 0.7, y: 0, z: -1.9 },                        // along the back wall
    ], { w: 1.0, h: 0.7, flat: true, uses: 3 });
    mkItem(L, 'bottle', 'Empty bottle', [
      { x: -2.55, y: 1.28, z: 1.0 },                     // on the shelf
      { x: 2.05, y: 0.78, z: 0.05 },                    // on the table
      { x: 0.45, y: 1.1, z: -2.3 },                     // on the windowsill
    ], { w: 0.13, h: 0.36 });
    // the doorway
    const door = mkTarget(L, {
      id: 'door', name: 'Back door', deg: 0, dist: 2.45, y: 0, w: 1.75, h: 2.1, accepts: ['planks'], requires: ['hammer'], needed: 3,
      hint() { return door.done ? 'Boarded up.' : 'The back door. ' + (3 - door.count) + ' more plank' + (3 - door.count > 1 ? 's' : '') + ' would do it.'; },
      use() { door.count++; AUDIO.sfx('hammer'); G.shake(0.15); if (door.count >= 3) door.done = true; return true; }
});
    L.objectiveText = () => door.done ? 'Boarded up. Hold on.' : 'Board up the back door (' + door.count + '/3)';
    L.isWon = () => door.done;
    L.barrierDist = 2.75;
    L.dynamic = () => {
      for (let k = 0; k < door.count; k++) {
        const yc = 0.5 + k * 0.62, tl = (k % 2 ? 1 : -1) * 0.06;
        R.add(SC.mkQuad(L, [-0.98, yc - 0.08 + tl, 2.42], [0.98, yc - 0.08 - tl, 2.42], [0.98, yc + 0.08 - tl, 2.42], [-0.98, yc + 0.08 + tl, 2.42], [112, 86, 54]));
        for (const x of [-0.86, 0.86]) R.add(SC.mkQuad(L, [x - 0.015, yc - 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [x + 0.015, yc - 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [x + 0.015, yc + 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [x - 0.015, yc + 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), 2.41], [30, 28, 26]));
      }
};
    L.onReach = () => { if (door.count > 0) { door.count = 0; AUDIO.sfx('smash'); G.shake(0.8); } };
    L.floor = { poly: [[-2.7, -2.3], [2.7, -2.3], [2.7, 2.5], [-2.7, 2.5]], y: 0 };
  }
});
