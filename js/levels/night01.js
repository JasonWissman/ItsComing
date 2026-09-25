'use strict';
// ============================================================ 1. THE FIELD ============================================================
LEVELS.push({
  id: 'field', title: 'The Field', facing: 0, eyeH: 1.65, laneSwitch: false,
  pal: { skyTop: [6, 8, 18], fog: [46, 52, 68], ground: [36, 46, 32], fogDist: 105 },
  ambient: { wind: 1, drone: 0.8, droneFreq: 50, windFreq: 380 },
  weather: { kind: 'mist', density: 0.7, wind: 0.3 },
  lights: [{ x: 0, y: 1.6, z: -0.2, r: 4.5, i: 0.35, color: [140, 160, 220] }],
  text: {
    intro: 'You found yourself at the back door, and it was open. So was the front.<br>Something is walking toward the house. It has been walking for a while.',
    hint: 'There are planks somewhere in the house, and a hammer.',
    objective: 'Board up the door it is coming for.',
    death: { default: 'The boards were not enough, or were not there.', reached: 'It tore the boards off.' },
    win: 'It hit the boards until sunrise. They held.',
    fragment: 'In the morning there were three nails on the kitchen table, bent, and you could not remember owning a hammer.',
  },
  // the back door looks north over the field; the front door looks south down the lane
  lanes: [
    { deg: 0, name: 'back door', barrierDist: 2.75, cue: 'bang', default: true },
    { deg: 180, name: 'front door', barrierDist: 2.7, cue: 'creak' },
  ],
  creatures: [{ type: 'walker', startDist: 130, time: 80, gamma: 0.72, unseenMult: 1.35 }],
  aftermath: { type: 'held', dur: 3.8, every: 0.75, sfx: 'bang', shake: 0.5 },
  build(L) {
    const s = L.s;
    const wood = [50, 40, 33], woodD = [38, 30, 25], frame = [96, 76, 52], floor = [46, 37, 30];
    const tex = { tex: 'planks', texScale: 1.4 };
    SC.stars(L, 3, 170, 0.8);
    SC.clouds(L, 4, 5, [34, 38, 54], 0.4);
    SC.moon(L, 24, 13, 8, [228, 222, 200]);
    const rng = mulberry32(11);
    // the field to the north, the lane and the road to the south
    for (let i = 0; i < 32; i++) { const x = (rng() * 2 - 1) * 120, z = 60 + rng() * 70; SC.tree(L, x, z, 7 + rng() * 7, 'bare', (rng() * 1e6) | 0); }
    for (let i = 0; i < 7; i++) { const x = (rng() * 2 - 1) * 60, z = 24 + rng() * 26; if (Math.abs(x) > 6) SC.tree(L, x, z, 5 + rng() * 5, rng() < 0.5 ? 'bare' : 'round', (rng() * 1e6) | 0); }
    SC.fenceLine(L, -45, 17, 45, 17, 2.7, 1.15, [44, 40, 34]);
    SC.groundDots(L, 5, 220, 6, 60, 110, [28, 36, 24], 0.22);
    for (let i = 0; i < 30; i++) { const x = (rng() * 2 - 1) * 110, z = -45 - rng() * 80; if (Math.abs(x) < 5) continue; SC.tree(L, x, z, 7 + rng() * 7, rng() < 0.6 ? 'bare' : 'round', (rng() * 1e6) | 0); }
    for (let i = 0; i < 8; i++) { const x = (rng() < 0.5 ? -1 : 1) * (5 + rng() * 30), z = -8 - rng() * 30; SC.tree(L, x, z, 5 + rng() * 6, 'round', (rng() * 1e6) | 0); }
    SC.floorQ(L, -1.1, -40, 1.1, -2.6, 0.012, [58, 54, 46]);
    SC.fenceLine(L, -30, -14, -1.6, -14, 2.4, 1.05, [44, 40, 34]); SC.fenceLine(L, 1.6, -14, 30, -14, 2.4, 1.05, [44, 40, 34]);
    for (const x of [-1.6, 1.6]) SC.box(L, x - 0.1, x + 0.1, 0, 1.3, -14.1, -13.9, [52, 46, 38]);
    SC.floorQ(L, -80, -42, 80, -36, 0.01, [40, 40, 44]);
    for (let i = 0; i < 90; i++) { const x = (rng() - 0.5) * 100, z = -6 - Math.pow(rng(), 1.4) * 30; if (Math.abs(x) < 1.4) continue; const sz = 0.15 + rng() * 0.25; SC.floorQ(L, x - sz, z - sz * 0.4, x + sz, z + sz * 0.4, 0.008, [30, 38, 26]); }
    // the house you are standing in: the back door to the north, the front door to the south
    SC.floorQ(L, -2.8, -2.4, 2.8, 2.6, 0.006, floor, { tex: 'planks', texScale: 1.2 });
    SC.quad(L, [-2.8, 2.7, -2.4], [2.8, 2.7, -2.4], [2.8, 2.7, 2.6], [-2.8, 2.7, 2.6], [30, 24, 20]);
    const apN = SC.doorway(L, { z: 2.6, w: 1.6, h: 2.12, wallH: 2.7, left: -7, right: 7, color: wood, opts: tex });
    const apS = SC.doorway(L, { deg: 180, z: 2.4, w: 1.4, h: 2.12, wallH: 2.7, left: -7, right: 7, color: woodD, opts: tex });
    L.addAperture(0, apN); L.addAperture(1, apS);
    SC.wallV(L, -2.8, -2.4, -2.8, 2.6, 0, 2.7, woodD, tex);
    SC.wallV(L, 2.8, -2.4, 2.8, 2.6, 0, 2.7, woodD, tex);
    for (let y = 0.28; y < 2.7; y += 0.3) { SC.wallV(L, -7, 2.59, -0.8, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, 0.8, 2.59, 7, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, -2.79, -2.4, -2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, 2.79, -2.4, 2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, -2.8, -2.39, -0.7, -2.39, y, y + 0.03, [26, 21, 17]); SC.wallV(L, 0.7, -2.39, 2.8, -2.39, y, y + 0.03, [26, 21, 17]); }
    // a window beside the front door with a little moonlight in it
    SC.wallV(L, 1.3, -2.39, 2.4, -2.39, 1.1, 2.0, [36, 42, 60]);
    SC.wallV(L, 1.82, -2.38, 1.88, -2.38, 1.1, 2.0, woodD); SC.wallV(L, 1.3, -2.38, 2.4, -2.38, 1.52, 1.58, woodD);
    // door frames and the steps outside
    for (const [z, w] of [[2.55, 0.8], [-2.35, 0.7]]) { SC.wallV(L, -w - 0.12, z, -w, z, 0, 2.2, frame); SC.wallV(L, w, z, w + 0.12, z, 0, 2.2, frame); SC.wallV(L, -w - 0.12, z, w + 0.12, z, 2.1, 2.22, frame); }
    SC.box(L, -1.1, 1.1, 0, 0.16, 2.6, 3.3, [74, 70, 64]);
    SC.box(L, -1.0, 1.0, 0, 0.16, -3.1, -2.4, [74, 70, 64]);
    // furniture: table east, shelf west, chair south-west
    SC.box(L, 1.5, 2.6, 0.72, 0.78, -0.55, 0.45, [74, 56, 42]);
    for (const [x, z] of [[1.55, -0.5], [2.55, -0.5], [1.55, 0.4], [2.55, 0.4]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.72, z - 0.04, z + 0.04, [62, 46, 34]);
    SC.box(L, -2.78, -2.45, 1.22, 1.28, -0.2, 1.3, [66, 52, 40]);
    SC.box(L, -2.2, -1.7, 0.42, 0.48, -2.1, -1.6, [68, 52, 40]); SC.box(L, -2.2, -1.7, 0.48, 1.0, -2.1, -2.04, [68, 52, 40]);
    STORY.lamp(L, 1.85, 0.78, -0.05);                          // the lamp on the table, unlit
    // items
    const need = L.tier(3, 4, 4), nails = L.diff.tier >= 2, decoy = !!L.diff.decoys;
    mkItem(L, 'hammer', 'Hammer', [
      { x: 1.25, y: 0, z: 0.35 },                       // on the floor by the table
      { x: -2.2, y: 0, z: 0.7 },                        // under the shelf
      { x: -1.4, y: 0, z: -1.75 },                      // beside the chair
      { x: 1.9, y: 0, z: 1.85 },                        // in the corner by the back door
      { x: -2.55, y: 1.28, z: -0.05, flat: false },     // on the shelf
    ], { w: 0.42, h: 0.42, flat: true, tool: true });
    const plankSpots = [
      { deg: 225, dist: 1.75, y: 0 },                   // south-west corner
      { x: -1.5, y: 0, z: 1.6 },                        // north-west, by the back wall
      { x: 2.2, y: 0, z: -1.7 },                        // south-east
      { x: -0.6, y: 0, z: 1.9 },                        // along the back wall
      { x: 2.3, y: 0, z: 1.0 },                         // east wall
    ];
    mkItem(L, 'planks', 'Planks', plankSpots, { w: 1.0, h: 0.7, flat: true, uses: L.tier(3, 4, 4) });
    if (L.diff.tier >= 3) mkItem(L, 'planks', 'Planks', plankSpots, { w: 1.0, h: 0.7, flat: true, uses: 3 });
    if (nails) mkItem(L, 'nails', 'Nails', [
      { x: 2.05, y: 0.78, z: -0.35 },                   // on the table
      { x: -2.55, y: 1.28, z: 0.8 },                    // on the shelf
      { x: 0.9, y: 0, z: -1.9 },                        // on the floor by the front door
      { x: -1.95, y: 0.48, z: -1.85 },                  // on the chair
    ], { w: 0.22, h: 0.22, flat: true, tool: true });
    if (decoy) mkItem(L, 'rotten', 'Planks', [{ x: 0.6, y: 0, z: 0.9 }, { x: -1.9, y: 0, z: -0.6 }], { w: 1.0, h: 0.7, flat: true, icon: 'planks', decoy: true, decoyText: 'Rotten. They come apart in your hands.' });
    mkItem(L, 'bottle', 'Empty bottle', [
      { x: -2.55, y: 1.28, z: 1.0 },                     // on the shelf
      { x: 2.05, y: 0.78, z: 0.05 },                    // on the table
      { x: 1.85, y: 1.1, z: -2.3 },                     // on the windowsill
    ], { w: 0.13, h: 0.36 });
    // the two doorways; on Nightmare the front door has to be shut before it can be boarded
    Object.assign(s, { frontOpen: L.diff.tier >= 3, frontClosing: 0, frontA: 10 * DEG });
    const mkDoor = (id, name, deg, dist, w, lane) => {
      const t = mkTarget(L, {
        id, name, deg, dist, y: 0, w, h: 2.1, accepts: ['planks'].concat(decoy ? ['rotten'] : []), requires: nails ? ['hammer', 'nails'] : ['hammer'], needed: need, lane,
        hint() { return t.done ? 'Boarded up.' : (lane === 1 && s.frontOpen) ? 'The front door stands open.' : 'The ' + name.toLowerCase() + '. ' + (need - t.count) + ' more plank' + (need - t.count > 1 ? 's' : '') + ' would do it.'; },
        onClick() { if (lane === 1 && s.frontOpen) { s.frontOpen = false; s.frontClosing = 0.8; AUDIO.sfx('creak'); return true; } return false; },
        use() {
          if (lane === 1 && (s.frontOpen || s.frontClosing > 0)) { G.say('Shut it first.', 'Not like this.'); return false; }
          t.count++; AUDIO.sfx('hammer'); G.shake(0.15); if (t.count >= need) t.done = true; return true;
        },
      });
      return t;
    };
    const back = mkDoor('door', 'Back door', 0, 2.45, 1.75, 0), front = mkDoor('frontdoor', 'Front door', 180, 2.3, 1.55, 1);
    const doorOf = lane => lane.idx === 0 ? back : front;
    L.objectiveText = () => { const t = doorOf(L.lane); return t.done ? 'Boarded up. Hold on.' : (t === front && s.frontOpen ? 'Shut the front door, then board it up' : 'Board up the ' + t.name.toLowerCase()) + ' (' + t.count + '/' + need + ')'; };
    L.isWon = () => doorOf(L.lane).done;
    L.update = dt => { if (s.frontClosing > 0) { s.frontClosing -= dt; s.frontA = 90 * DEG - 80 * DEG * Math.pow(clamp(s.frontClosing / 0.8, 0, 1), 1.3); if (s.frontClosing <= 0) { s.frontA = 90 * DEG; AUDIO.sfx('thud'); G.shake(0.1); } } };
    const boards = (t, z, sign) => {
      for (let k = 0; k < t.count; k++) {
        const yc = 0.5 + k * 0.5, tl = (k % 2 ? 1 : -1) * 0.06, hw = t.w / 2 + 0.1;
        R.add(SC.mkQuad(L, [-hw, yc - 0.08 + tl, z], [hw, yc - 0.08 - tl, z], [hw, yc + 0.08 - tl, z], [-hw, yc + 0.08 + tl, z], [112, 86, 54]));
        for (const x of [-hw + 0.12, hw - 0.12]) R.add(SC.mkQuad(L, [x - 0.015, yc - 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), z + sign * 0.01], [x + 0.015, yc - 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), z + sign * 0.01], [x + 0.015, yc + 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), z + sign * 0.01], [x - 0.015, yc + 0.015 + tl * 0.9 * (x < 0 ? 1 : -1), z + sign * 0.01], [30, 28, 26]));
      }
    };
    L.dynamic = () => {
      boards(back, 2.42, -1); boards(front, -2.28, 1);
      // the front door leaf, swung into the room or shut in its frame (it only stands open on Nightmare)
      if (L.diff.tier >= 3) { const a = s.frontA, hx = -0.7, hz = -2.35; R.add(SC.mkWallV(L, hx, hz, hx + Math.sin(a) * 1.4, hz + Math.cos(a) * 1.4, 0, 2.08, [58, 46, 36])); }
      else R.add(SC.mkWallV(L, -0.7, -2.36, -0.7 + Math.sin(10 * DEG) * 1.4, -2.36 + Math.cos(10 * DEG) * 1.4, 0, 2.08, [58, 46, 36]));
    };
    L.onReach = c => { const t = doorOf(c.lane); if (t.count > 0 && !t.done) { t.count = 0; AUDIO.sfx('smash'); G.shake(0.8); G.toast('It tears the boards off.'); } };
    L.floor = { poly: [[-2.7, -2.3], [2.7, -2.3], [2.7, 2.5], [-2.7, 2.5]], y: 0 };
  }
});
