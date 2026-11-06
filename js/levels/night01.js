'use strict';
// ============================================================ 1. THE FIELD ============================================================
// The rotten plank: one board gone soft, split along its length, its ends dark and crumbling, flecked with mould. It is a
// decoy, and every decoy is drawn worn (wornc drains it toward rust-brown and darkens it), so these colours are pitched
// blue-green: they come out grey-green, nothing like the warm brown of a sound plank.
Object.assign(ICONS, {
  rottenPlank(ctx, P) {
    const body = P.col([53, 137, 123]), lite = P.col([75, 169, 158]), mid = P.col([40, 111, 102]), dark = P.col([24, 78, 73]), crack = P.col([0, 32, 39]), mould = P.col([107, 216, 207]);
    const edge = [[-0.47, 0.82], [-0.2, 0.84], [0.1, 0.82], [0.33, 0.85], [0.4, 0.8], [0.45, 0.71], [0.49, 0.66], [0.46, 0.57], [0.5, 0.47],
      [0.45, 0.36], [0.49, 0.26], [0.44, 0.17], [0.3, 0.15], [0.0, 0.18], [-0.3, 0.16], [-0.46, 0.19], [-0.5, 0.31], [-0.45, 0.43], [-0.5, 0.56], [-0.44, 0.68]];
    ctx.save(); ctx.rotate(-0.03);
    ctx.beginPath(); edge.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = body; ctx.fill();
    ctx.clip();
    for (const [y, w] of [[0.3, 0.014], [0.66, 0.012], [0.74, 0.01]]) P_line(ctx, -0.5, y, 0.5, y + 0.02, w, lite);   // the grain, raised and pale
    for (const [y, w] of [[0.24, 0.01], [0.4, 0.012], [0.6, 0.01]]) P_line(ctx, -0.5, y, 0.5, y - 0.015, w, mid);
    // both ends gone dark: a band of rot and then the black, ragged where it meets the sound wood
    P_poly(ctx, [[-0.5, 0.1], [-0.3, 0.1], [-0.33, 0.3], [-0.28, 0.52], [-0.34, 0.72], [-0.29, 0.9], [-0.5, 0.9]], mid);
    P_poly(ctx, [[-0.5, 0.1], [-0.4, 0.1], [-0.43, 0.28], [-0.38, 0.47], [-0.44, 0.66], [-0.39, 0.9], [-0.5, 0.9]], dark);
    P_poly(ctx, [[0.5, 0.1], [0.28, 0.1], [0.32, 0.32], [0.26, 0.5], [0.31, 0.7], [0.27, 0.9], [0.5, 0.9]], mid);
    P_poly(ctx, [[0.5, 0.1], [0.39, 0.1], [0.42, 0.3], [0.37, 0.5], [0.43, 0.68], [0.38, 0.9], [0.5, 0.9]], dark);
    // the split: a crack from the middle that opens wide toward the far end
    P_poly(ctx, [[-0.24, 0.5], [0.0, 0.485], [0.25, 0.46], [0.52, 0.4], [0.52, 0.61], [0.25, 0.54], [0.0, 0.515]], crack);
    P_line(ctx, -0.42, 0.36, -0.12, 0.34, 0.014, crack);   // and a smaller one at the other end
    // soft holes and pale mould
    for (const [x, y, r] of [[-0.05, 0.32, 0.03], [0.14, 0.7, 0.024], [0.06, 0.26, 0.02], [-0.16, 0.68, 0.018]]) P_ell(ctx, x, y, r * 1.2, r, crack);
    for (const [x, y, r] of [[-0.26, 0.72, 0.03], [-0.12, 0.25, 0.022], [0.1, 0.62, 0.026], [0.24, 0.24, 0.02], [0.02, 0.74, 0.016], [-0.18, 0.42, 0.014]]) P_ell(ctx, x, y, r * 1.3, r, mould);
    ctx.restore();
  },
});
LEVELS.push({
  id: 'field', title: 'The Field', facing: 0, eyeH: 1.65,
  laneSwitch: false,   // it changes doorways only by running round the house when the one it is coming for is boarded (build)
  pal: { skyTop: [6, 8, 18], fog: [46, 52, 68], ground: [36, 46, 32], fogDist: 105 },
  ambient: { wind: 1, drone: 0.8, droneFreq: 50, windFreq: 380 },
  weather: { kind: 'mist', density: 0.7, wind: 0.3 },
  lights: [{ x: 0, y: 1.6, z: -0.2, r: 4.5, i: 0.35, color: [140, 160, 220] }],
  text: {
    intro: 'The farmhouse has two doorways and no doors in them.<br>Something is walking toward the house. It has been walking for a while.',
    hint: 'There are loose planks all over the house, a hammer and nails. Board up both doorways.',
    objective: 'Board up both doorways.',
    death: { default: 'There were no boards across the way it came in.', reached: 'It tore the boards off and came in.', round: 'It ran round the house to the other doorway.' },
    win: 'It went round and round the house until sunrise, trying the boards. They held.',
    fragment: 'In the morning a path had been worn into the grass all the way round the house, and you could not remember owning a hammer.',
  },
  // the back doorway looks north over the field; the front doorway looks south down the lane. A cue is the creak of the
  // step as it comes up to a doorway it has run round to.
  lanes: [
    { deg: 0, name: 'back door', barrierDist: 2.75, cue: 'creak', default: true },
    { deg: 180, name: 'front door', barrierDist: 2.7, cue: 'creak' },
  ],
  creatures: [{ type: 'walker', startDist: 130, time: 80, unseenMult: 1.35 }],
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
    // the house you are standing in: the back doorway to the north, the front doorway to the south, neither with a door
    SC.floorQ(L, -2.8, -2.4, 2.8, 2.6, 0.006, floor, { tex: 'planks', texScale: 1.2 });
    SC.quad(L, [-2.8, 2.7, -2.4], [2.8, 2.7, -2.4], [2.8, 2.7, 2.6], [-2.8, 2.7, 2.6], [30, 24, 20]);
    const apN = SC.doorway(L, { z: 2.6, w: 1.6, h: 2.12, wallH: 2.7, left: -7, right: 7, color: wood, opts: tex });
    const apS = SC.doorway(L, { deg: 180, z: 2.4, w: 1.4, h: 2.12, wallH: 2.7, left: -7, right: 7, color: woodD, opts: tex });
    L.addAperture(0, apN); L.addAperture(1, apS);
    SC.wallV(L, -2.8, -2.4, -2.8, 2.6, 0, 2.7, woodD, tex);
    SC.wallV(L, 2.8, -2.4, 2.8, 2.6, 0, 2.7, woodD, tex);
    for (let y = 0.28; y < 2.7; y += 0.3) { SC.wallV(L, -7, 2.59, -0.8, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, 0.8, 2.59, 7, 2.59, y, y + 0.03, [30, 24, 20]); SC.wallV(L, -2.79, -2.4, -2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, 2.79, -2.4, 2.79, 2.6, y, y + 0.03, [26, 21, 17]); SC.wallV(L, -2.8, -2.39, -0.7, -2.39, y, y + 0.03, [26, 21, 17]); SC.wallV(L, 0.7, -2.39, 2.8, -2.39, y, y + 0.03, [26, 21, 17]); }
    // a window beside the front doorway with a little moonlight in it
    SC.wallV(L, 1.3, -2.39, 2.4, -2.39, 1.1, 2.0, [36, 42, 60]);
    SC.wallV(L, 1.82, -2.38, 1.88, -2.38, 1.1, 2.0, woodD); SC.wallV(L, 1.3, -2.38, 2.4, -2.38, 1.52, 1.58, woodD);
    // the empty door frames, the pale scars where hinges were, and the steps outside
    for (const [z, w] of [[2.55, 0.8], [-2.35, 0.7]]) {
      SC.wallV(L, -w - 0.12, z, -w, z, 0, 2.2, frame); SC.wallV(L, w, z, w + 0.12, z, 0, 2.2, frame); SC.wallV(L, -w - 0.12, z, w + 0.12, z, 2.1, 2.22, frame);
      const zi = z - Math.sign(z) * 0.01;
      for (const y of [0.3, 1.0, 1.75]) SC.wallV(L, -w - 0.1, zi, -w - 0.02, zi, y, y + 0.14, [100, 86, 64], { sortDist: Math.hypot(w + 0.06, z) - 0.03 });
    }
    SC.box(L, -1.1, 1.1, 0, 0.16, 2.6, 3.3, [74, 70, 64]);
    SC.box(L, -1.0, 1.0, 0, 0.16, -3.1, -2.4, [74, 70, 64]);
    // furniture: table east, shelf west, chair south-west
    SC.box(L, 1.5, 2.6, 0.72, 0.78, -0.55, 0.45, [74, 56, 42]);
    for (const [x, z] of [[1.55, -0.5], [2.55, -0.5], [1.55, 0.4], [2.55, 0.4]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.72, z - 0.04, z + 0.04, [62, 46, 34]);
    SC.box(L, -2.78, -2.45, 1.22, 1.28, -0.2, 1.3, [66, 52, 40]);
    SC.box(L, -2.2, -1.7, 0.42, 0.48, -2.1, -1.6, [68, 52, 40]); SC.box(L, -2.2, -1.7, 0.48, 1.0, -2.1, -2.04, [68, 52, 40]);
    STORY.lamp(L, 1.85, 0.78, -0.05);                          // the lamp on the table, unlit
    // items: three planks to a doorway, six in the house, lying about one by one
    const need = 3;
    mkItem(L, 'hammer', 'Hammer', [
      { x: 1.25, y: 0, z: 0.35 },                       // on the floor by the table
      { x: -2.2, y: 0, z: 0.7 },                        // under the shelf
      { x: -1.4, y: 0, z: -1.75 },                      // beside the chair
      { x: 1.9, y: 0, z: 1.85 },                        // in the corner by the back doorway
      { x: -2.55, y: 1.28, z: -0.05, flat: false },     // on the shelf
    ], { w: 0.42, h: 0.42, flat: true, tool: true });
    const plankSpots = [
      { deg: 225, dist: 1.75, y: 0 },                   // south-west corner
      { x: -1.5, y: 0, z: 1.6 },                        // north-west, by the back wall
      { x: 2.2, y: 0, z: -1.7 },                        // south-east
      { x: -0.6, y: 0, z: 1.9 },                        // along the back wall
      { x: 2.3, y: 0, z: 1.0 },                         // east wall
      { x: 0.35, y: 0, z: -1.75 },                      // by the front doorway
      { x: -2.25, y: 0, z: -0.8 },                      // along the west wall
      { x: 0.9, y: 0, z: 1.25 },                        // in the middle of the room, towards the back doorway
      { x: 1.1, y: 0, z: -1.05 },                       // between the table and the front doorway
      { x: -1.35, y: 0, z: 0.05 },                      // in the middle of the west side
      { x: -2.15, y: 0, z: 2.05 },                      // the north-west corner
    ];
    for (let k = 0; k < 2 * need; k++) mkItem(L, 'planks', 'Plank', plankSpots, { w: 1.1, h: 0.26, flat: true, stack: true, icon: 'planks' });
    mkItem(L, 'nails', 'Nails', [
      { x: 2.05, y: 0.78, z: -0.35 },                   // on the table
      { x: -2.55, y: 1.28, z: 0.8 },                    // on the shelf
      { x: 0.9, y: 0, z: -1.9 },                        // on the floor by the front doorway
      { x: -1.95, y: 0.48, z: -1.85 },                  // on the chair
    ], { w: 0.22, h: 0.22, flat: true, tool: true });
    mkItem(L, 'rotten', 'Plank', [{ x: 0.0, y: 0, z: -0.95 }, { x: 0.05, y: 0, z: 1.0 }],   // nearer than any sound plank's spot, so never lying across one
      { w: 1.1, h: 0.26, flat: true, icon: 'rottenPlank', decoy: true, decoyText: 'Rotten through. This one would never hold.' });
    mkItem(L, 'bottle', 'Empty bottle', [
      { x: -2.55, y: 1.28, z: 1.0 },                     // on the shelf
      { x: 2.05, y: 0.78, z: 0.05 },                    // on the table
      { x: 1.85, y: 1.1, z: -2.3 },                     // on the windowsill
    ], { w: 0.13, h: 0.36 });
    // the doorways: three planks across each, nailed. Boarding the one it is coming for sends it running round the house.
    const mkDoor = (id, name, deg, dist, w, lane) => {
      const t = mkTarget(L, {
        id, name, deg, dist, y: 0, w, h: 2.1, accepts: ['planks', 'rotten'], requires: ['hammer', 'nails'], needed: need, lane,
        hint() { return t.done ? 'Boarded up.' : 'The ' + name.toLowerCase() + '. ' + (need - t.count) + ' more plank' + (need - t.count > 1 ? 's' : '') + ' would do it.'; },
        onClick() { if (!t.done) return false; G.say('Boarded up.', 'It is boarded up.'); return true; },
        use() { t.count++; AUDIO.sfx('hammer'); G.shake(0.15); if (t.count >= need) { t.done = true; boarded(t); } return true; },
      });
      // what keeps the planks from going up is the state of things, not where the answer lies
      Object.defineProperty(t, 'missingText', { get: () => (G.hasItem('hammer') ? 'The hammer has nothing to drive.' : 'The planks will not stay up on their own.') });
      return t;
    };
    const back = mkDoor('door', 'Back door', 0, 2.45, 1.75, 0), front = mkDoor('frontdoor', 'Front door', 180, 2.3, 1.55, 1);
    const doorOf = lane => (lane.idx === 0 ? back : front);
    L.objectiveText = () => (back.done && front.done ? 'Boarded up. Hold on.' : 'Board up both doorways (' + (back.count + front.count) + '/' + 2 * need + ')');
    L.isWon = () => back.done && front.done;

    // ---- the run round the house ----
    // The moment the doorway it is coming for is boarded (and the other is not), it stops dead, breaks into a sprint
    // sideways out of that doorway's view, goes round the outside of the house (running feet, a blow on the side wall as
    // it passes), and comes up to the other doorway (the creak of its step) from the same side, at about the distance it
    // was: never nearer than RUN.gap metres outside that doorway, so there is time to turn round, but not much.
    const RUN = { stop: 0.35, out: 1.1, round: 1.0, in: 0.8, gap: 10 };
    const outLat = d => d * 0.42 + 2.5;   // far enough to the side to be wholly behind the wall at distance d
    const panTo = yaw => Math.sin(wrapPi(yaw - G.cam.yaw)) * 0.85;
    const boarded = t => {
      const c = L.creature, other = t === back ? front : back;
      if (other.done || s.run || c.lane.idx !== t.lane) return;   // both up (the night is won), already going round, or not coming this way
      s.run = { t: 0, from: c.lane, to: L.lanes[other.lane], side: c.rand() < 0.5 ? 1 : -1, d: c.dist, d2: c.dist, steps: 0, banged: false, arrived: false };
      s.ranFrom = { lane: c.lane.idx, dist: c.dist };
      s.ran = true;
      c.hold = c.dist;
    };
    L.update = dt => {
      const r = s.run; if (!r) return;
      const c = L.creature, T1 = RUN.stop, T2 = T1 + RUN.out, T3 = T2 + RUN.round, T4 = T3 + RUN.in;
      r.t += dt;
      if (r.t < T1) return;   // it stops dead in the field, as the last board goes up in front of it
      if (r.t >= T4) { c.runPose = false; c.runLat = 0; c.hold = null; s.run = null; return; }   // and walks on, at its own pace, from where it came round
      c.runPose = true; c.runDir = r.side;
      c.runGait = (c.runGait || 0) + dt * 15;
      let yaw;
      if (r.t < T2) {          // flat out to one side, across the doorway and out of it
        c.runLat = r.side * outLat(r.d) * Math.pow((r.t - T1) / RUN.out, 1.5);
        yaw = r.from.yaw + Math.atan2(c.runLat, r.d);
      } else if (r.t < T3) {   // out of sight, going round the house
        const a0 = Math.atan2(outLat(r.d), r.d), k = (r.t - T2) / RUN.round;
        c.runLat = r.side * outLat(r.d);
        yaw = r.from.yaw + r.side * lerp(a0, Math.PI - a0, k);
        if (!r.banged && k > 0.4) { r.banged = true; AUDIO.sfx('bang', panTo(r.from.yaw + r.side * Math.PI / 2)); G.shake(0.12); }
      } else {                 // round the corner and in front of the other doorway, then it turns to it
        if (!r.arrived) {
          r.arrived = true;
          r.d2 = Math.max(r.d, (r.to.barrierDist || 0) + RUN.gap);
          c.retarget(r.to.idx); c.reached = false;
          c.u = clamp(1 - Math.pow(r.d2 / c.D0, 1 / c.gamma), 0, 1); c.hold = c.dist = r.d2;
          L.lane = r.to; L.laneIdx = r.to.idx; L.barrierDist = r.to.barrierDist || 0;
          AUDIO.sfx(r.to.cue || 'creak', panTo(r.to.yaw));
        }
        // it comes in from the side it went round by, which is the other hand of this doorway
        c.runLat = -r.side * outLat(r.d2) * (1 - easeOut((r.t - T3) / RUN.in));
        yaw = r.to.yaw + Math.atan2(c.runLat, r.d2);
      }
      // running feet, loud enough to hear across the field
      const n = Math.floor(c.runGait / Math.PI);
      if (n !== r.steps) { r.steps = n; AUDIO.footstep('runner', clamp(4 / (c.dist + 4), 0.12, 0.7), panTo(yaw)); }
    };
    const BOARD_Y = [0.42, 1.0, 1.95];   // a gap left at eye level, so it can still be seen through the boards
    const boards = (t, z, sign) => {
      for (let k = 0; k < t.count; k++) {
        const yc = BOARD_Y[k], tl = (k % 2 ? 1 : -1) * 0.05, hw = t.w / 2 + 0.1, hh = 0.1;
        R.add(SC.mkQuad(L, [-hw, yc - hh + tl, z], [hw, yc - hh - tl, z], [hw, yc + hh - tl, z], [-hw, yc + hh + tl, z], k % 2 ? [104, 80, 50] : [116, 90, 56]));
        R.add(SC.mkQuad(L, [-hw, yc - 0.02 + tl, z + sign * 0.005], [hw, yc - 0.02 - tl, z + sign * 0.005], [hw, yc - 0.01 - tl, z + sign * 0.005], [-hw, yc - 0.01 + tl, z + sign * 0.005], [84, 64, 40]));   // a line of grain
        for (const x of [-hw + 0.1, hw - 0.1]) {   // two nails at each end
          const ty = tl * (x < 0 ? 0.8 : -0.8);
          for (const dy of [-0.045, 0.045]) R.add(SC.mkQuad(L, [x - 0.016, yc + dy + ty - 0.016, z + sign * 0.01], [x + 0.016, yc + dy + ty - 0.016, z + sign * 0.01], [x + 0.016, yc + dy + ty + 0.016, z + sign * 0.01], [x - 0.016, yc + dy + ty + 0.016, z + sign * 0.01], [30, 28, 26]));
        }
      }
    };
    L.dynamic = () => { boards(back, 2.42, -1); boards(front, -2.28, 1); };
    // it is on you a fraction of a second after it reaches a doorway, so the death line says what happened rather than a toast
    L.onReach = c => { const t = doorOf(c.lane); if (t.count > 0 && !t.done) { t.count = 0; s.torn = true; AUDIO.sfx('smash'); G.shake(0.8); } };
    L.deathCause = () => (s.torn ? 'reached' : s.ran ? 'round' : 'default');
    L.floor = { poly: [[-2.7, -2.3], [2.7, -2.3], [2.7, 2.5], [-2.7, 2.5]], y: 0 };
  }
});
