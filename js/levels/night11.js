'use strict';
// ============================================================ 11. THE FARM ============================================================
// Night on the farm. You stand in the yard, the electrical box on its post at your left hand (toward the stables), the
// house at your back with its porch light on. All round you, at the eight points of the compass but the one behind you,
// are the farm's places, each with a floodlight of its own, all of them dark: the tractor shed (SW), the shed (W), the
// stables (NW), the barn (N), the silo (NE), the coop (E) and the driveway (SE). They go round you in a ring, so each
// has a neighbour on either side; the driveway's and the tractor shed's meet behind the house.
// The thing is out there in the dark at one of them, in the shadow at its foot, two pale points of eyes. It cannot stand
// the light. Light the place it is at and it throws an arm over its face and runs, side on, to a neighbouring place that
// is dark. Light the places either side of it first, and then its own, and it has nowhere dark to go: it shrieks, its
// knees go, and it comes apart in the light.
// The box takes three lights at once. Throw a fourth and the main breaker at the top of the box trips: a bang, the main
// snaps over to OFF, every switch drops to off with it and every light on the farm goes out. Nothing comes on again until
// the main is pushed back over to ON, and it does not stop coming for you while you find it in the dark.
// The porch light is one of the three. While it is on, the yard round you is lit and the thing will come no nearer than
// the edge of that light; while it is off, nothing stands between you and it, and it comes. So to trap it, the house has
// to go dark first.
const FARM_RING = [   // round you clockwise from behind on your left; front: how far its near side is from you
  { key: 'tractor', label: 'TRACTOR', name: 'the tractor shed', deg: 225, front: 21 },
  { key: 'shed', label: 'SHED', name: 'the shed', deg: 270, front: 16 },
  { key: 'stables', label: 'STABLES', name: 'the stables', deg: 315, front: 24 },
  { key: 'barn', label: 'BARN', name: 'the barn', deg: 0, front: 30 },
  { key: 'silo', label: 'SILO', name: 'the silo', deg: 45, front: 25 },
  { key: 'coop', label: 'COOP', name: 'the coop', deg: 90, front: 16 },
  { key: 'drive', label: 'DRIVEWAY', name: 'the driveway', deg: 135, front: 20 },
];
const FARM_HIDE = 2.2;   // it stands this far out from the foot of its place, in the shadow there
LEVELS.push({
  id: 'barn', title: 'The Farm', facing: 0, eyeH: 1.65,
  startFacing: 0,   // you start facing the barn, wherever it is: finding it is up to you
  lookDown: 30,     // looking down toward the stables, the box before you (taller than your waist) is all in view, a little below the middle (zoomed, as near as all of it fits: build)
  laneSwitch: false,   // it changes places only by running from the light (build)
  pal: { skyTop: [5, 7, 17], fog: [24, 28, 40], ground: [20, 24, 18], fogDist: 125 },
  ambient: { tune: 'ambient:11', wind: 0.9, drone: 0.6, droneFreq: 44, windFreq: 300 },
  text: {
    intro: 'The lights are out across the farm.\nSomething is out there in the dark.',
    hint: 'It cannot stand the light. Light its place and it runs to a dark place next to it; light the places either side of it first, then its own, and it has nowhere to go. The box takes three lights at once, the porch light too: a fourth trips the main, and nothing comes on until you push the main back on.',
    objective: 'Find it. Light the places either side of it, then its own. No more than three lights at once.',
    where: 'It is out there in the dark, at one of the places. Find it.',
    death: { default: 'It came for you in the dark.', trip: 'The main tripped. In the dark, it came for you.' },
    win: 'It collapsed in the light, right in front of you.',
  },
  // one way in from each place: it stands at the foot of one, and comes in toward you from there (build)
  lanes: FARM_RING.map(p => ({ deg: p.deg, name: p.name, startDist: p.front - FARM_HIDE })),
  creatures: [{ type: 'carrier', time: 60, unseenMult: 1.15 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s, N = FARM_RING.length;
    const RING = FARM_RING.map((p, k) => Object.assign({ k, yaw: p.deg * DEG, hide: p.front - FARM_HIDE }, p));
    const W = (x, y, z) => { const p = L.pt(x, y, z); return { x: p[0], y: p[1], z: p[2] }; };   // a world point, in whatever frame is current
    const poly = (pts, color, opts) => { const p = Object.assign({ kind: 'poly', pts: pts.map(v => L.pt(v[0], v[1], v[2])), color }, opts || {}); L.props.push(p); return p; };
    const inFrame = (deg, fn) => SC.withYaw(L, deg, fn);
    L.pal.ambient = 0.42;

    // ---------------- the sky and the ground ----------------
    SC.stars(L, 1111, 230, 0.9);
    SC.moon(L, 28, 27, 6, [214, 220, 232]);
    // the ground: the grass of the yard, one smooth stretch of it out to the trees (the night's ground colour); the porch
    // light's pool is laid on it further down (POOL), and each place's light is a pool of its own (pools, below)
    // trees far off all round, and a line of fence posts here and there between the places
    {
      const rng = mulberry32(1108);
      for (let i = 0; i < 46; i++) {
        const a = rng() * TAU, r = 52 + rng() * 40, kind = rng() < 0.3 ? 'fir' : rng() < 0.5 ? 'bare' : 'round';
        SC.tree(L, Math.sin(a) * r, Math.cos(a) * r, 7 + rng() * 8, kind, (rng() * 1e6) | 0);
      }
      const fence = [62, 54, 44];
      SC.fenceLine(L, -14.5, 30, -7, 34, 2.4, 1.2, fence);     // the paddock between the stables and the barn
      SC.fenceLine(L, 8, 36, 15, 30.5, 2.4, 1.2, fence);       // behind, between the barn and the silo
      SC.fenceLine(L, 22, 6.5, 25, -4, 2.4, 1.2, fence);       // past the coop's run
      SC.fenceLine(L, -24, 4.5, -25, -6, 2.4, 1.2, fence);     // beyond the shed
    }

    // ---------------- the house, behind you ----------------
    // Two storeys of white boards, every window dark; the porch roof over the door, and on the wall by the door the porch
    // light, which is on.
    const HOUSE = {};
    inFrame(180, () => {
      const white = [150, 148, 136], trim = [190, 188, 178], roof = [46, 42, 44], glass = [18, 20, 28];
      SC.box(L, -4.6, 4.6, 0, 5.6, 7, 15, white);
      poly([[-5, 5.6, 6.6], [5, 5.6, 6.6], [5, 8.4, 11], [-5, 8.4, 11]], roof);
      poly([[-5, 5.6, 15.4], [5, 5.6, 15.4], [5, 8.4, 11], [-5, 8.4, 11]], roof);
      for (const x of [-4.6, 4.6]) poly([[x, 5.6, 7], [x, 5.6, 15], [x, 8.4, 11]], scalec(white, 0.8));
      SC.box(L, 2.2, 3.0, 7.6, 9.6, 11.5, 12.3, [70, 50, 44]);   // the chimney
      const win = (x, y0, y1) => { poly([[x - 0.62, y0 - 0.08, 6.97], [x + 0.62, y0 - 0.08, 6.97], [x + 0.62, y1 + 0.08, 6.97], [x - 0.62, y1 + 0.08, 6.97]], trim); poly([[x - 0.5, y0, 6.95], [x + 0.5, y0, 6.95], [x + 0.5, y1, 6.95], [x - 0.5, y1, 6.95]], glass); poly([[x - 0.03, y0, 6.94], [x + 0.03, y0, 6.94], [x + 0.03, y1, 6.94], [x - 0.03, y1, 6.94]], trim); };
      for (const x of [-3, 0, 3]) win(x, 3.3, 4.8);
      for (const x of [-3, 3]) win(x, 0.95, 2.4);
      poly([[-0.62, 0.35, 6.97], [0.62, 0.35, 6.97], [0.62, 2.62, 6.97], [-0.62, 2.62, 6.97]], trim);
      poly([[-0.52, 0.35, 6.95], [0.52, 0.35, 6.95], [0.52, 2.52, 6.95], [-0.52, 2.52, 6.95]], [62, 46, 36]);   // the front door
      SC.box(L, -2.8, 2.8, 0, 0.35, 5, 7, [86, 78, 66]);          // the porch
      SC.box(L, -0.9, 0.9, 0, 0.17, 4.6, 5, [86, 78, 66]);        // its step
      for (const x of [-2.65, 2.65]) SC.box(L, x - 0.07, x + 0.07, 0.35, 2.72, 5.05, 5.19, trim);
      poly([[-3, 2.88, 7], [3, 2.88, 7], [3, 2.62, 4.8], [-3, 2.62, 4.8]], roof);
      // the porch light: a lantern on its bracket by the door, lit or dark
      SC.sprite(L, 0.95, 1.86, 6.92, 0.2, 0.36, (ctx, P) => {
        ctx.scale(0.2, 0.36);
        const on = s.power && s.on[0], frame = P.col([30, 28, 26]);
        P_rect(ctx, -0.5, 0.82, 1, 0.1, frame); P_rect(ctx, -0.42, 0.12, 0.84, 0.72, on ? P.raw([255, 214, 150]) : P.col([46, 46, 50]));
        if (on) P_ell(ctx, 0, 0.45, 0.22, 0.24, P.raw([255, 246, 220]));
        P_rect(ctx, -0.5, 0.05, 1, 0.08, frame); P_rect(ctx, -0.04, 0.12, 0.08, 0.72, frame);
      }, { sortDist: 7.4, face: 0 });   // (fixed on the house wall by the door, looking out over the yard: it never turns with the view)
      HOUSE.lamp = W(0.95, 2.04, 6.85);
      HOUSE.door = W(0, 2.3, 6.2);
      HOUSE.aim = W(-0.95, -2.0, -6.85);   // (a direction: out over the yard toward you, and down)
    });

    // ---------------- the places ----------------
    // Each is built in its own frame, looking out at it from where you stand (+z toward it, +x to your right as you face
    // it), its near side at z = front. Each has a floodlight (lamp: the fixture, where its light comes from and its glow
    // shows) and the light of it (built further down).
    const lampArt = (k, x, y, z, w, h) => SC.sprite(L, x, y, z, w, h, (ctx, P) => {   // a floodlight's head: a dark hood, and under it the lamp, lit or dark
      ctx.scale(w, h);
      const on = lit(k);
      P_poly(ctx, [[-0.5, 0.35], [0.5, 0.35], [0.36, 1], [-0.36, 1]], P.col([40, 40, 44]));
      P_ell(ctx, 0, 0.32, 0.46, 0.26, on ? P.raw([255, 236, 196]) : P.col([58, 58, 62]));
      if (on) P_ell(ctx, 0, 0.32, 0.3, 0.15, P.raw([255, 252, 236]));
    });
    const PLACE = {};
    // the tractor shed (SW): open along its front, a tractor standing in it
    inFrame(225, () => {
      const F = 21, wood = [74, 62, 50], roof = [58, 60, 64];
      SC.wallV(L, -5.2, F + 6, 5.2, F + 6, 0, 3.4, scalec(wood, 0.8));
      SC.box(L, -5.3, -5.0, 0, 3.6, F, F + 6, wood); SC.box(L, 5.0, 5.3, 0, 3.6, F, F + 6, wood);
      for (const x of [-2.7, 2.7]) SC.box(L, x - 0.12, x + 0.12, 0, 4.1, F - 0.1, F + 0.14, wood);
      SC.box(L, -5.4, 5.4, 3.75, 4.15, F - 0.1, F + 0.14, wood);
      poly([[-5.6, 4.2, F - 0.5], [5.6, 4.2, F - 0.5], [5.6, 3.4, F + 6.4], [-5.6, 3.4, F + 6.4]], roof);
      SC.sprite(L, 0.8, 0, F + 3.2, 3.4, 2.7, (ctx, P) => {   // the tractor, side on, nose to the left
        ctx.scale(3.4 / 3.4, 2.7 / 2.7);
        const red = P.col([116, 36, 30]), redD = P.col([78, 24, 20]), tyre = P.col([18, 18, 20]), hub = P.col([150, 140, 110]), glassC = P.col([30, 36, 44]);
        P_rect(ctx, -1.5, 0.75, 1.9, 0.75, red); P_rect(ctx, -1.6, 0.9, 0.2, 0.5, redD);                 // the bonnet, the grille
        P_rect(ctx, 0.3, 0.7, 1.0, 1.95, glassC); P_rect(ctx, 0.25, 2.55, 1.15, 0.14, red); P_rect(ctx, 0.25, 0.7, 0.08, 1.9, red); P_rect(ctx, 1.25, 0.7, 0.08, 1.9, red);   // the cab
        P_line(ctx, -0.6, 1.5, -0.6, 2.1, 0.08, P.col([40, 40, 40]));                                  // the exhaust
        P_ell(ctx, 0.95, 0.72, 0.72, 0.72, tyre); P_ell(ctx, 0.95, 0.72, 0.36, 0.36, hub);             // the big back wheel
        P_ell(ctx, -1.15, 0.42, 0.42, 0.42, tyre); P_ell(ctx, -1.15, 0.42, 0.2, 0.2, hub);             // the small front one
      }, { face: 45 * DEG });   // (standing side on in the barn, square to the line out to it: it never turns with the view)
      lampArt(0, 0, 3.55, F - 0.2, 0.5, 0.36);
      PLACE[0] = { lamp: W(0, 3.6, F - 0.3), fill: W(0, 2.6, F - 2.2) };
    });
    // the shed (W): a small board shed, its gable end to you, a door and a window
    inFrame(270, () => {
      const F = 16, wood = [84, 70, 56], roof = [50, 46, 46];
      SC.box(L, -2.2, 2.2, 0, 2.6, F, F + 3.6, wood, { tex: 'planks', texScale: 1.2 });
      poly([[-2.2, 2.6, F - 0.01], [2.2, 2.6, F - 0.01], [0, 3.8, F - 0.01]], wood);
      poly([[-2.5, 2.45, F - 0.3], [0, 3.95, F - 0.3], [0, 3.95, F + 3.9], [-2.5, 2.45, F + 3.9]], roof);
      poly([[2.5, 2.45, F - 0.3], [0, 3.95, F - 0.3], [0, 3.95, F + 3.9], [2.5, 2.45, F + 3.9]], scalec(roof, 0.85));
      poly([[-0.55, 0, F - 0.03], [0.55, 0, F - 0.03], [0.55, 2.05, F - 0.03], [-0.55, 2.05, F - 0.03]], [52, 42, 34]);
      poly([[1.0, 1.2, F - 0.03], [1.7, 1.2, F - 0.03], [1.7, 1.8, F - 0.03], [1.0, 1.8, F - 0.03]], [16, 18, 24]);
      lampArt(1, 0, 2.48, F - 0.15, 0.36, 0.26);
      PLACE[1] = { lamp: W(0, 2.5, F - 0.25), fill: W(0, 2.2, F - 2.0) };
    });
    // the stables (NW): long and low, a row of stable doors with their tops open, black inside
    inFrame(315, () => {
      const F = 24, wood = [86, 66, 48], roof = [52, 48, 46];
      SC.box(L, -8, 8, 0, 3.1, F, F + 5, wood);
      poly([[-8.4, 3.1, F - 0.7], [8.4, 3.1, F - 0.7], [8.4, 4.7, F + 2.5], [-8.4, 4.7, F + 2.5]], roof);
      for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) {
        poly([[x - 0.6, 0, F - 0.02], [x + 0.6, 0, F - 0.02], [x + 0.6, 1.25, F - 0.02], [x - 0.6, 1.25, F - 0.02]], [64, 48, 36]);
        poly([[x - 0.6, 1.3, F - 0.02], [x + 0.6, 1.3, F - 0.02], [x + 0.6, 2.3, F - 0.02], [x - 0.6, 2.3, F - 0.02]], [10, 9, 9]);
        poly([[x - 0.6, 1.0, F - 0.03], [x + 0.6, 0.25, F - 0.03], [x + 0.6, 0.33, F - 0.03], [x - 0.6, 1.08, F - 0.03]], [104, 82, 60]);   // the brace on the lower door
      }
      lampArt(2, 0, 2.7, F - 0.4, 0.44, 0.3);
      PLACE[2] = { lamp: W(0, 2.75, F - 0.5), fill: W(0, 2.4, F - 2.2) };
    });
    // the barn (N): big and red, its gable end to you under a gambrel roof, the great doors and the loft door
    inFrame(0, () => {
      const F = 30, red = [116, 36, 30], redD = [76, 24, 20], trim = [176, 170, 156], roof = [46, 44, 46];
      SC.box(L, -6, 6, 0, 6, F, F + 14, red);
      poly([[-6, 6, F - 0.01], [6, 6, F - 0.01], [3.7, 9.2, F - 0.01], [-3.7, 9.2, F - 0.01]], red);
      poly([[-3.7, 9.2, F - 0.01], [3.7, 9.2, F - 0.01], [0, 10.9, F - 0.01]], red);
      for (const sx of [-1, 1]) {
        poly([[sx * 6.3, 5.8, F - 0.3], [sx * 3.75, 9.25, F - 0.3], [sx * 3.75, 9.25, F + 14.3], [sx * 6.3, 5.8, F + 14.3]], scalec(roof, sx < 0 ? 1 : 0.85));
        poly([[sx * 3.75, 9.25, F - 0.3], [0, 11.0, F - 0.3], [0, 11.0, F + 14.3], [sx * 3.75, 9.25, F + 14.3]], scalec(roof, sx < 0 ? 1.1 : 0.9));
      }
      poly([[-2.4, 0, F - 0.03], [2.4, 0, F - 0.03], [2.4, 4.3, F - 0.03], [-2.4, 4.3, F - 0.03]], redD);   // the great doors, shut
      const bar = (x0, y0, x1, y1, w) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l * w / 2, ny = dx / l * w / 2; poly([[x0 + nx, y0 + ny, F - 0.05], [x1 + nx, y1 + ny, F - 0.05], [x1 - nx, y1 - ny, F - 0.05], [x0 - nx, y0 - ny, F - 0.05]], trim); };
      for (const [x0, x1] of [[-2.4, 0], [0, 2.4]]) { bar(x0, 0.1, x1, 4.2, 0.16); bar(x0, 4.2, x1, 0.1, 0.16); }
      bar(-2.45, 4.3, 2.45, 4.3, 0.16); bar(-2.45, 0.08, 2.45, 0.08, 0.16); bar(0, 0, 0, 4.3, 0.14); bar(-2.45, 0, -2.45, 4.3, 0.14); bar(2.45, 0, 2.45, 4.3, 0.14);
      poly([[-1.0, 6.6, F - 0.03], [1.0, 6.6, F - 0.03], [1.0, 8.4, F - 0.03], [-1.0, 8.4, F - 0.03]], [14, 10, 10]);   // the loft door, open on the dark
      SC.box(L, -0.1, 0.1, 9.2, 9.4, F - 1.2, F, [40, 36, 34]);   // the hay hook's beam
      lampArt(3, 0, 5.0, F - 0.25, 0.6, 0.42);
      PLACE[3] = { lamp: W(0, 5.05, F - 0.4), fill: W(0, 3.0, F - 2.4) };
    });
    // the silo (NE): a tall round silo with a dome, and the low feed room at its foot
    inFrame(45, () => {
      const F = 25, conc = [72, 76, 80], band = [54, 58, 62], R0 = 2.5, cx = -2.2, cz = F + R0 + 0.2, SEG = 14;
      for (let i = 0; i < SEG; i++) {
        const a0 = i / SEG * TAU, a1 = (i + 1) / SEG * TAU, sh = 0.7 + 0.3 * Math.cos((a0 + a1) / 2 + 0.8);
        poly([[cx + Math.sin(a0) * R0, 0, cz - Math.cos(a0) * R0], [cx + Math.sin(a1) * R0, 0, cz - Math.cos(a1) * R0], [cx + Math.sin(a1) * R0, 13, cz - Math.cos(a1) * R0], [cx + Math.sin(a0) * R0, 13, cz - Math.cos(a0) * R0]], scalec(conc, sh));
        for (const y of [3, 6.5, 10]) poly([[cx + Math.sin(a0) * (R0 + 0.03), y, cz - Math.cos(a0) * (R0 + 0.03)], [cx + Math.sin(a1) * (R0 + 0.03), y, cz - Math.cos(a1) * (R0 + 0.03)], [cx + Math.sin(a1) * (R0 + 0.03), y + 0.18, cz - Math.cos(a1) * (R0 + 0.03)], [cx + Math.sin(a0) * (R0 + 0.03), y + 0.18, cz - Math.cos(a0) * (R0 + 0.03)]], scalec(band, sh));
      }
      SC.sprite(L, cx, 12.9, cz - R0 + 0.3, R0 * 2.04, 1.9, (ctx, P) => { ctx.scale(R0 * 2.04, 1.9); ctx.fillStyle = P.col([82, 86, 92]); ctx.beginPath(); ctx.ellipse(0, 0.05, 0.5, 0.95, 0, 0, Math.PI); ctx.fill(); P_ell(ctx, 0, 0.98, 0.05, 0.04, P.col([60, 60, 64])); });
      SC.box(L, 0.4, 5.2, 0, 3.2, F + 0.2, F + 4.6, [88, 72, 56]);   // the feed room
      poly([[0.2, 3.3, F - 0.2], [5.4, 3.3, F - 0.2], [5.4, 4.0, F + 4.8], [0.2, 4.0, F + 4.8]], [56, 54, 54]);
      poly([[2.2, 0, F + 0.18], [3.4, 0, F + 0.18], [3.4, 2.2, F + 0.18], [2.2, 2.2, F + 0.18]], [40, 32, 26]);
      SC.box(L, 0.95, 1.08, 0, 4.6, F - 0.3, F - 0.17, [50, 48, 46]);   // the lamp post
      lampArt(4, 1.02, 4.3, F - 0.4, 0.44, 0.3);
      PLACE[4] = { lamp: W(1.0, 4.35, F - 0.5), fill: W(0, 2.6, F - 2.2) };
    });
    // the coop (E): a little hen house up on legs with a ramp to its door, and the wire run beside it
    inFrame(90, () => {
      const F = 16, wood = [110, 92, 64], roof = [60, 50, 46];
      for (const x of [-1.5, 1.5]) for (const z of [F + 0.1, F + 2.4]) SC.box(L, x - 0.06, x + 0.06, 0, 0.7, z - 0.06, z + 0.06, scalec(wood, 0.7));
      SC.box(L, -1.7, 1.7, 0.7, 2.3, F, F + 2.5, wood, { tex: 'planks', texScale: 0.8 });
      poly([[-1.95, 2.55, F - 0.3], [1.95, 2.55, F - 0.3], [1.95, 2.1, F + 2.8], [-1.95, 2.1, F + 2.8]], roof);
      poly([[-1.7, 2.3, F - 0.01], [1.7, 2.3, F - 0.01], [1.7, 2.55, F - 0.01], [-1.7, 2.55, F - 0.01]], wood);
      poly([[-0.4, 0.75, F - 0.02], [0.4, 0.75, F - 0.02], [0.4, 1.55, F - 0.02], [-0.4, 1.55, F - 0.02]], [14, 12, 10]);   // its little door, open
      poly([[-0.35, 0.75, F - 0.03], [0.35, 0.75, F - 0.03], [0.35, 0.02, F - 1.6], [-0.35, 0.02, F - 1.6]], [96, 80, 58]);   // the ramp down
      // the run: posts and a wire mesh, the hens shut in for the night
      for (const [x, z] of [[1.9, F], [5.2, F], [5.2, F + 3.2], [1.9, F + 3.2]]) SC.box(L, x - 0.05, x + 0.05, 0, 1.8, z - 0.05, z + 0.05, [70, 60, 48]);
      SC.sprite(L, 3.55, 0, F - 0.02, 3.3, 1.8, (ctx, P) => {
        ctx.scale(3.3, 1.8); ctx.strokeStyle = P.cola([150, 150, 150], 0.55); ctx.lineWidth = 0.004;
        ctx.beginPath(); for (let i = 0; i <= 22; i++) { const x = -0.5 + i / 22; ctx.moveTo(x, 0); ctx.lineTo(x + 0.06, 1); ctx.moveTo(x, 0); ctx.lineTo(x - 0.06, 1); } ctx.stroke();
        P_rect(ctx, -0.5, 0.97, 1, 0.03, P.col([70, 60, 48]));
      }, { face: -90 * DEG });   // (the run's front, fixed where it stands, looking back at you)
      lampArt(5, 0, 2.62, F - 0.32, 0.34, 0.24);
      PLACE[5] = { lamp: W(0, 2.65, F - 0.4), fill: W(0, 2.0, F - 2.0) };
    });
    // the driveway (SE): gravel, the pickup parked on it, a yard light on a pole, and the garage beyond
    inFrame(135, () => {
      const F = 20;
      for (let z = 13; z < 31; z += 3) poly([[-4.5, 0.012, z], [4.5, 0.012, z], [4.5, 0.012, z + 3], [-4.5, 0.012, z + 3]], [66, 62, 56], { layer: 0 });
      // the pickup: nose toward you, to the right of the way in
      const body = [66, 80, 96], bodyD = [44, 54, 66], tyre = [16, 16, 18];
      for (const [x, z] of [[1.25, F + 0.9], [3.05, F + 0.9], [1.25, F + 4.1], [3.05, F + 4.1]]) SC.box(L, x - 0.15, x + 0.15, 0, 0.72, z - 0.36, z + 0.36, tyre);
      SC.box(L, 1.1, 3.2, 0.45, 1.3, F + 0.1, F + 5.2, body);                 // the body
      SC.box(L, 1.2, 3.1, 1.3, 2.0, F + 1.5, F + 2.9, bodyD);                 // the cab
      poly([[1.25, 1.35, F + 1.48], [3.05, 1.35, F + 1.48], [3.0, 1.95, F + 1.48], [1.3, 1.95, F + 1.48]], [22, 26, 34]);   // its windscreen
      for (const x of [1.4, 2.9]) poly([[x - 0.18, 0.8, F + 0.08], [x + 0.18, 0.8, F + 0.08], [x + 0.18, 1.0, F + 0.08], [x - 0.18, 1.0, F + 0.08]], [120, 118, 104]);   // headlamps, off
      // the garage at the end of the drive
      SC.box(L, -4.5, 4.5, 0, 3.2, F + 8, F + 14, [96, 92, 84]);
      poly([[-4.8, 3.2, F + 7.7], [4.8, 3.2, F + 7.7], [4.8, 4.4, F + 11], [-4.8, 4.4, F + 11]], [50, 48, 50]);
      poly([[-3.2, 0, F + 7.98], [-0.4, 0, F + 7.98], [-0.4, 2.5, F + 7.98], [-3.2, 2.5, F + 7.98]], [70, 70, 68]);   // its door, down
      // the yard light, on a pole by the drive
      SC.box(L, -2.36, -2.22, 0, 5.8, F - 0.1, F + 0.04, [56, 52, 48]);
      SC.box(L, -2.3, -1.4, 5.65, 5.75, F - 0.07, F + 0.01, [56, 52, 48]);
      lampArt(6, -1.35, 5.38, F - 0.05, 0.42, 0.3);
      PLACE[6] = { lamp: W(-1.35, 5.42, F - 0.1), fill: W(0, 2.6, F - 2.2) };
    });
    // a place's light: the floodlight's cone out over its yard toward you, and a fill on its front and the ground at its foot
    const LAMP_COL = [255, 214, 158];
    const lightsOf = RING.map(p => {
      const pl = PLACE[p.k], aimAt = { x: Math.sin(p.yaw) * p.front * 0.3, y: 0.3, z: Math.cos(p.yaw) * p.front * 0.3 };
      const dx = aimAt.x - pl.lamp.x, dy = aimAt.y - pl.lamp.y, dz = aimAt.z - pl.lamp.z, len = Math.hypot(dx, dy, dz);
      return [
        { x: pl.lamp.x, y: pl.lamp.y, z: pl.lamp.z, r: len + 4, i: 1.6, color: LAMP_COL, cone: { x: dx / len, y: dy / len, z: dz / len, cos: Math.cos(21 * DEG) }, seed: p.k * 3 },
        { x: pl.fill.x, y: pl.fill.y, z: pl.fill.z, r: 12, i: 1.05, color: LAMP_COL, seed: p.k * 3 + 1 },
      ];
    });
    // the porch light: out over the yard round you (and not round the sides of the house), and on the porch itself
    const houseLights = (() => {
      const a = HOUSE.aim, l = Math.hypot(a.x, a.y, a.z);
      return [
        { x: HOUSE.lamp.x, y: HOUSE.lamp.y, z: HOUSE.lamp.z, r: 18, i: 1.15, color: [255, 196, 128], cone: { x: a.x / l, y: a.y / l, z: a.z / l, cos: Math.cos(68 * DEG) }, seed: 1 },
        { x: HOUSE.door.x, y: HOUSE.door.y, z: HOUSE.door.z, r: 4.5, i: 0.7, color: [255, 196, 128], seed: 2 },
      ];
    })();
    // how much light falls at a point from a list of lights (as LIGHT.at has it)
    const lightAt = (list, x, y, z) => {
      let k = 0;
      for (const l of list) {
        const dx = x - l.x, dy = y - l.y, dz = z - l.z, d = Math.hypot(dx, dy, dz);
        if (d >= l.r) continue;
        let q = (1 - d / l.r) ** 2 * l.i;
        if (l.cone) { const c = ((dx * l.cone.x + dy * l.cone.y + dz * l.cone.z) / Math.max(1e-6, d) - l.cone.cos) / (1 - l.cone.cos); if (c <= 0) continue; q *= Math.min(1, c * 1.6); }
        k += q;
      }
      return k;
    };
    // the edge of the porch light on each way in: as near as it comes while the porch light is on
    const EDGE = RING.map(p => {
      let e = 3.5;
      for (let r = p.hide; r >= 3.5; r -= 0.1) if (lightAt(houseLights, Math.sin(p.yaw) * r, 0.9, Math.cos(p.yaw) * r) > 0.04) { e = r + 0.6; break; }
      return Math.min(p.hide, e);
    });

    // the porch light's pool on the grass round you: a smooth fall of warm light, brightest under the porch and fading out
    // across the yard. It is laid on as the contours of how much of the light reaches the ground, from the faintest out at
    // its edge to the brightest by the porch, each a thin wash of warm light over the last, so it fades with no edge
    // anywhere; L.update fades the lot in and out with the light
    const POOL = [];
    {
      let best = { k: -1, x: 0, z: 0 };
      for (let x = -6; x <= 6; x += 0.25) for (let z = -9; z <= 3; z += 0.25) { const k = lightAt(houseLights, x, 0, z); if (k > best.k) best = { k, x, z }; }
      const NC = 40, NR = 96, K0 = 0.012, cover = k => 0.6 * (1 - Math.exp(-1.7 * k)), POOL_COL = [222, 178, 116];
      let was = 0;
      for (let j = 0; j < NC; j++) {
        const k = K0 * Math.pow(best.k * 0.97 / K0, j / (NC - 1)), c = cover(k), a = (c - was) / (1 - was);
        was = c;
        const pts = [];
        for (let i = 0; i < NR; i++) {   // out along each ray from the brightest spot to where the light falls below k
          const a2 = i / NR * TAU, dx = Math.sin(a2), dz = Math.cos(a2);
          let r = 0, prev = best.k;
          for (let q = 0.1; q < 30; q += 0.1) { const v = lightAt(houseLights, best.x + dx * q, 0, best.z + dz * q); if (v < k) { r = q - 0.1 * (k - v) / Math.max(1e-6, prev - v); break; } prev = v; r = q; }
          pts.push([best.x + dx * r, 0.004, best.z + dz * r]);
        }
        const p = { kind: 'poly', pts, color: POOL_COL, alpha: a, a, layer: 0, sortDist: -0.1 - j * 0.01, noLight: true, noFog: true, noCull: true };
        L.props.push(p); POOL.push(p);
      }
    }
    const poolLight = dt => {
      s.pool += ((houseLit() ? 1 : 0) - s.pool) * Math.min(1, dt * 14);
      for (const p of POOL) p.alpha = p.a * s.pool;
    };
    // each place's light on its yard: a pool of warm light on the ground from the foot of the place out toward you
    RING.forEach(p => inFrame(p.deg, () => {
      const z0 = Math.max(p.front * 0.45, p.front - 12), z1 = p.front + 1.2, h = z1 - z0, w = 9 + (p.front - 16) * 0.3;
      SC.sprite(L, 0, 0.02, z0, w, h, (ctx, P) => {
        if (!lit(p.k)) return;
        const a = 0.5 * (1 - P.fog) * (L.t - s.litAt[p.k + 1] < 0.12 ? 0.4 : 1);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(0, h * 0.6); ctx.scale(w / 2, h * 0.6);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(255,206,140,' + a.toFixed(3) + ')'); g.addColorStop(0.5, 'rgba(255,196,128,' + (a * 0.45).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,190,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
      }, { flat: true, layer: 0, sortDist: -1, noLight: true, noFog: false });
    }));

    // ---------------- the electrical box ----------------
    // On its post at your left hand, its top at your chest: turn left from the barn to face the stables and it is right
    // there in front of you, in the middle of the view below them (too low to hide them or their way in), its front square to you
    // as you look that way. A grey steel box with a rain hood, standing open, no door on it. Inside, at the top, the main breaker: a big lever lying across, over to the right for ON and
    // to the left for OFF, a red tag over it marked MAIN and a green lamp beside it that is lit while it is on. Under it,
    // two rows of four big toggle switches, each with a red pilot lamp and a strip of tape under it with the place written
    // on it in marker. Up is on. A little lamp in the top of the box lights its inside while the main is on (the panel is
    // lit by it alone). The panel and every part of it are fixed flat on the front of the box (face: they never turn
    // toward you), so what you click is where it is drawn whichever way you look.
    // It is built in the frame looking out at the stables (BOX_DEG), BX across the way out (0: square in the middle of the
    // view as you face the stables; it stands too low to hide them or their way in) and BZ out along it;
    // FRONT, the way its front looks, is back along that way at you (in the night's frame: face is not turned by the frame)
    const BOX_DEG = 315, BX = 0, BZ = 0.98, FRONT = (BOX_DEG + 180) * DEG;
    const BY = 0.5, BW = 0.5, BH = 0.82, PY = BY + 0.02, PW = 0.46, PH = 0.78;
    const BN = Math.hypot(BX + BW / 2, BZ);   // how far the nearest edge of its front is: the panel is drawn after every part of that face
    const steel = [66, 74, 70];
    const inBox = fn => inFrame(BOX_DEG, fn);
    inBox(() => {
      SC.box(L, BX - 0.04, BX + 0.04, 0, BY, BZ + 0.06, BZ + 0.14, [50, 52, 50]);            // the post
      SC.box(L, BX + 0.12, BX + 0.16, 0, BY, BZ + 0.04, BZ + 0.08, [40, 42, 42]);             // the conduit down into the ground
      SC.box(L, BX - BW / 2, BX + BW / 2, BY, BY + BH, BZ, BZ + 0.2, steel);
      poly([[BX - BW / 2 - 0.02, BY + BH + 0.005, BZ - 0.03], [BX + BW / 2 + 0.02, BY + BH + 0.005, BZ - 0.03], [BX + BW / 2 + 0.02, BY + BH + 0.05, BZ + 0.21], [BX - BW / 2 - 0.02, BY + BH + 0.05, BZ + 0.21]], scalec(steel, 0.85));   // the rain hood
    });
    const LABELS = ['HOUSE'].concat(RING.map(p => p.label));
    const COLS = [-0.165, -0.055, 0.055, 0.165], ROWS = [0.43, 0.22], MY = 0.62;   // (MY: the main's lever, across the top)
    const swAt = i => [COLS[i % 4], ROWS[Math.floor(i / 4)]];
    const HANDF = "bold 42px 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Chalkboard SE', 'Liberation Sans', Arial, sans-serif";
    const PLATEF = "bold 40px 'Liberation Sans', Arial, sans-serif";
    // how far up a switch's lever stands (1 up, on; 0 down, off): flipped over quickly, all dropping at once when the main
    // trips, and a click with the main off pushing it up only for it to fall straight back
    const lever = i => {
      const ft = L.t - s.flipAt[i], want = s.on[i] ? 1 : 0;
      if (L.t - s.deadAt[i] < 0.35) { const u = (L.t - s.deadAt[i]) / 0.35; return Math.sin(Math.PI * u) * 0.8; }
      if (L.t - s.dropAt < 0.12 && s.wasOn[i]) return 1 - (L.t - s.dropAt) / 0.12;
      return ft < 0.08 ? lerp(1 - want, want, ft / 0.08) : want;
    };
    // how far over the main's lever is (1 over to ON, 0 to OFF): it snaps over when it trips and is pushed back over when
    // you put it on; pushed while it is on, it gives a little and settles back
    const mainLever = () => {
      const want = s.power ? 1 : 0, ft = L.t - s.mainAt, jt = L.t - s.mainJig;
      if (jt < 0.3) return 1 - Math.sin(Math.PI * jt / 0.3) * 0.12;
      return ft < 0.1 ? lerp(1 - want, want, ft / 0.1) : want;
    };
    // the box's own little lamp: on with the main, flickering up as it goes back on
    const boxLamp = () => { if (!s.power) return 0.22; const k = L.t - s.backAt; return k < 0.3 ? (Math.sin(k * 90) > 0 ? 0.85 : 0.3) : 0.85; };
    inBox(() => SC.sprite(L, BX, PY, BZ - 0.005, PW, PH, (ctx, P) => {
      const b = boxLamp(), C = c => P.col(scalec(c, b));
      const plate = C([150, 154, 146]), dark = C([30, 32, 32]), chrome = C([220, 224, 226]), tape = C([226, 212, 168]), ink = C([22, 20, 32]), paint = C([200, 200, 196]);
      P_rect(ctx, -PW / 2, 0, PW, PH, C(scalec(steel, 0.7)));
      P_rect(ctx, -0.205, 0.02, 0.41, PH - 0.04, plate);
      const g = ctx.createLinearGradient(0, PH, 0, 0); g.addColorStop(0, 'rgba(255,250,230,' + (0.12 * b).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,' + (0.25).toFixed(3) + ')');
      ctx.fillStyle = g; ctx.fillRect(-0.205, 0.02, 0.41, PH - 0.04);   // the lamp at the top: brighter up there, falling off down the panel
      const text = (t, x, y, k, font, col, max) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, -k); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(t, 0, 2, max); ctx.restore(); };
      // the main: its red tag, a black plate with OFF and ON at either end, the lever across it, and its green lamp
      P_rect(ctx, -0.06, MY + 0.05, 0.12, 0.036, C([150, 30, 26]));
      text('MAIN', 0, MY + 0.068, 0.00056, PLATEF, C([236, 230, 220]), 180);
      P_rect(ctx, -0.13, MY - 0.036, 0.26, 0.072, dark);
      P_rect(ctx, -0.075, MY - 0.009, 0.15, 0.018, C([10, 10, 10]));                                  // the slot the lever runs in
      text('OFF', -0.104, MY, 0.0003, PLATEF, paint, 120); text('ON', 0.106, MY, 0.0003, PLATEF, paint, 120);
      const mx = lerp(-0.055, 0.055, mainLever());
      P_rect(ctx, mx - 0.022, MY - 0.031, 0.044, 0.062, C([54, 56, 58])); P_rect(ctx, mx - 0.017, MY - 0.026, 0.034, 0.052, chrome);
      for (const dx of [-0.008, 0, 0.008]) P_line(ctx, mx + dx, MY - 0.018, mx + dx, MY + 0.018, 0.003, C([120, 122, 126]));   // the grip ridges on the lever
      P_ell(ctx, 0.168, MY, 0.011, 0.011, s.power ? P.raw([90, 255, 120]) : C([24, 60, 30]));          // the main's lamp
      if (s.power) P_ell(ctx, 0.168, MY, 0.022, 0.022, 'rgba(90,255,120,0.22)');
      for (let i = 0; i < 8; i++) {
        const [cx, ry] = swAt(i), up = lever(i), on = s.power && s.on[i];
        P_rect(ctx, -0.026 + cx, ry - 0.04, 0.052, 0.08, dark);                                  // its plate
        P_ell(ctx, cx, ry, 0.013, 0.013, C([80, 82, 84]));
        const ly = ry + lerp(-0.042, 0.042, up);                                                  // the lever, up or down
        P_line(ctx, cx, ry, cx, ly, 0.011, chrome); P_ell(ctx, cx, ly, 0.009, 0.009, chrome);
        P_ell(ctx, cx + 0.034, ry + 0.028, 0.0085, 0.0085, on ? P.raw([255, 70, 50]) : C([80, 26, 24]));   // the pilot lamp
        if (on) P_ell(ctx, cx + 0.034, ry + 0.028, 0.017, 0.017, 'rgba(255,70,50,0.25)');
        P_rect(ctx, cx - 0.048, ry - 0.072, 0.096, 0.026, tape);                                  // the tape, and the place in marker
        ctx.save(); ctx.translate(cx, ry - 0.059); ctx.rotate((i % 3 - 1) * 0.03); ctx.scale(0.00047, -0.00047);
        ctx.font = HANDF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink; ctx.fillText(LABELS[i], 0, 2, 190);
        ctx.restore();
      }
    }, { sortDist: BN - 0.02, noLight: true, face: FRONT }));
    // the main and the switches: each a target on the panel, flat on it as the panel is
    inBox(() => mkTarget(L, {
      id: 'main', name: 'Main', x: BX, y: PY + MY - 0.045, z: BZ - 0.012, w: 0.28, h: 0.135, face: FRONT,
      hint() { return s.power ? 'The main. On.' : 'The main. Off: push it back on.'; },
      onClick() { main(); return true; },
    }));
    LABELS.forEach((lab, i) => {
      const [cx, ry] = swAt(i);
      inBox(() => mkTarget(L, {
        id: 'sw' + i, name: lab.charAt(0) + lab.slice(1).toLowerCase(), x: BX + cx, y: PY + ry - 0.075, z: BZ - 0.012, w: 0.1, h: 0.13, face: FRONT,
        onClick() { flip(i); return true; },
      }));
    });

    // ---------------- the state of things ----------------
    Object.assign(s, { on: [true, false, false, false, false, false, false, false], wasOn: [], power: true, trips: 0, tripAt: -99, dropAt: -99, mainAt: -9, mainJig: -9, pool: 1,
      flipAt: Array(8).fill(-9), litAt: Array(8).fill(-9), backAt: -99, deadAt: Array(8).fill(-9), sparks: [], smoke: [], k: null, r: null, run: null, flinch: null, back: null, flushes: 0, trapped: false, ring: N, edge: EDGE, hideAt: RING.map(p => p.hide) });
    const lit = k => s.power && s.on[k + 1];
    const houseLit = () => s.power && s.on[0];
    const countOn = () => s.on.filter(Boolean).length;
    const nb = k => [(k + N - 1) % N, (k + 1) % N];
    L.nb = nb;   // (for the tests)
    const fxr = mulberry32((G.runSeed * 31 + 1111) >>> 0);
    const BOXP = inBox(() => W(BX + 0.06, PY + MY, BZ - 0.02));   // the main, where it trips
    const FLASH = inBox(() => W(BX + 0.06, PY + MY, BZ - 0.2));   // the flash as it trips, a little out in front of it
    const outOfBox = (x, z) => inBox(() => W(x, 0, z));         // a way across the box's front (x) and out of it toward you (-z), in the world
    // a fourth light: the main trips. A bang and a spit of sparks off it, it snaps over to OFF, every switch drops to off
    // with it, and every light on the farm goes out
    const trip = () => {
      s.wasOn = s.on.slice(); s.on.fill(false); s.power = false; s.trips++; s.tripAt = s.dropAt = s.mainAt = L.t;
      AUDIO.sfx('breakerTrip'); G.shake(0.55); G.flash(0.3);
      const fwd = outOfBox(0, -1);
      for (let i = 0; i < 22; i++) { const a = fxr() * TAU, v = 0.8 + fxr() * 2.0, d = outOfBox(Math.cos(a) * v * 0.7, -Math.abs(Math.sin(a)) * v * 0.6); s.sparks.push({ x: BOXP.x + fwd.x * 0.02, y: BOXP.y, z: BOXP.z + fwd.z * 0.02, vx: d.x, vy: 0.6 + fxr() * 2.2, vz: d.z, age: 0, life: 0.4 + fxr() * 0.6 }); }
      for (let i = 0; i < 4; i++) { const q = outOfBox((fxr() - 0.5) * 0.1, -0.05); s.smoke.push({ x: BOXP.x + q.x, y: BOXP.y + 0.05, z: BOXP.z + q.z, age: -i * 0.12, r: 0.05 + fxr() * 0.04 }); }
      G.say('The main trips. Every switch drops, and every light on the farm goes out.', 'The main trips.');
    };
    // the main: pushed back over to ON, with everything else off; pushed while it is on, it is on already
    const main = () => {
      if (L.won || G.state !== 'play') return;
      if (s.power) { s.mainJig = L.t; AUDIO.sfx('switch'); G.say('The main is on.', 'The main is on.'); return; }
      s.power = true; s.mainAt = s.backAt = L.t;
      AUDIO.sfx('lever'); AUDIO.sfx('clunk');
      G.say('The main goes back on. Everything else is off.', 'The main is on.');
    };
    const flip = i => {
      if (L.won || G.state !== 'play') return;
      if (!s.power) {   // the main is off: the lever goes up, nothing comes on, and it drops back
        s.deadAt[i] = L.t; AUDIO.sfx('clunk');
        G.say('Nothing comes on. The main is off.', 'The main is off.');
        return;
      }
      s.on[i] = !s.on[i]; s.flipAt[i] = L.t;
      AUDIO.sfx('switch'); AUDIO.sfx('clunk');
      if (s.on[i] && countOn() >= 4) { trip(); return; }
      if (s.on[i]) { s.litAt[i] = L.t; AUDIO.sfx('tubeOn'); }
    };
    L.flip = flip; L.main = main;   // (for the tests)

    // ---------------- the thing ----------------
    // It is always on a way of its own that turns to where it is (so it can run round you between the places); its
    // distance is s.r. At its place, in the dark: still at first, then creeping in toward you, no nearer than the edge of
    // the porch light while that is on, and all the way while it is not. Its place lit: it flinches and runs to a dark
    // neighbour, or, with both of them lit, it is caught.
    const CREEP = { wait: 5, lit: 0.2, dark: 0.62, back: 2.6 };   // (with the main tripped it is dark, and it comes at its own pace)
    const RUN = { speed: 6.5, min: 0.8, max: 3.4, flinch: 0.32, behind: 17 };
    let way = null;
    const place = (c, yaw, r) => { way.yaw = yaw; way.dirX = Math.sin(yaw); way.dirZ = Math.cos(yaw); c.yaw = yaw; s.r = r; };
    const panTo = yaw => Math.sin(wrapPi(yaw - G.cam.yaw)) * 0.85;
    const pathR = (yaw, r) => (r < 5.5 ? r : r + Math.max(0, RUN.behind - r) * smoothstep(1 - Math.abs(wrapPi(yaw - Math.PI)) / (50 * DEG)));   // round the back of the house, not through it
    const startRun = (c, to) => {
      const from = s.k, dir = to === (from + 1) % N ? 1 : -1;
      let dy = wrapPi(RING[to].yaw - RING[from].yaw); if (Math.sign(dy) !== dir) dy += dir * TAU;
      let len = 0; for (let q = 0; q < 12; q++) len += pathR(RING[from].yaw + dy * (q + 0.5) / 12, s.r) * Math.abs(dy) / 12;
      s.run = { from, to, dir, y0: RING[from].yaw, dy, r: s.r, t: 0, T: clamp(len / RUN.speed, RUN.min, RUN.max), steps: 0 };
      s.flushes++;
      Object.assign(c, { runPose: true, runDir: dir, runPace: 1, recoil: 0 });
    };
    const arrive = c => {
      const k = s.run.to;
      s.k = k; s.run = null; way.idx = k;
      place(c, RING[k].yaw, s.r);
      L.lane = L.lanes[k]; L.laneIdx = k;
      c.runPose = false;
    };
    // its place is lit: with a dark neighbour it flinches and then runs there; with none, it is caught
    const flushed = c => {
      const dark = nb(s.k).filter(q => !lit(q));
      if (!dark.length) { s.trapped = true; return; }
      s.flinch = { t: 0 }; c.recoil = 0;
      AUDIO.sfx('hiss', panTo(c.yaw));
    };
    const step = (c, dt) => {
      if (s.run) {   // running, side on, round to the next place at the same distance from you
        const r = s.run; r.t += dt;
        const u = clamp(r.t / r.T, 0, 1), e = u * u * (3 - 2 * u), yaw = r.y0 + r.dy * e;
        place(c, yaw, pathR(yaw, r.r));
        c.runGait = (c.runGait || 0) + dt * 15 * (0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.2 + 0.1)));
        const n = Math.floor(c.runGait / Math.PI);
        if (n !== r.steps) { r.steps = n; AUDIO.footstep('runner', clamp(4 / (s.r + 4), 0.12, 0.7), panTo(yaw)); }
        if (u >= 1) { s.r = r.r; arrive(c); }
        return;
      }
      if (s.flinch) {   // rearing back from the light, an arm over its face; then it goes
        s.flinch.t += dt; c.recoil = Math.min(1, s.flinch.t / 0.12);
        if (s.flinch.t < RUN.flinch) return;
        s.flinch = null; c.recoil = 0;
        if (!lit(s.k)) return;   // the light went off again before it ran
        const dark = nb(s.k).filter(q => !lit(q));
        if (!dark.length) { s.trapped = true; return; }
        startRun(c, dark[Math.floor(c.rand() * dark.length)]);
        return;
      }
      if (lit(s.k)) { flushed(c); return; }
      // in the dark: creeping in, or backing off out of the porch light
      const edge = EDGE[s.k], target = houseLit() ? edge : 0;
      if (s.back) {   // the porch light came on with it inside it: it rears back and backs off to its edge
        s.back.t += dt; c.recoil = s.back.t < 0.5 ? Math.min(1, s.back.t / 0.12) : Math.max(0, 1 - (s.back.t - 0.5) / 0.2);
        if (s.back.t > 0.3) s.r = Math.min(edge, s.r + CREEP.back * dt);
        if (!houseLit() || (s.r >= edge && s.back.t > 0.7)) { s.back = null; c.recoil = 0; }
        return;
      }
      if (houseLit() && s.r < edge - 0.05) { s.back = { t: 0 }; AUDIO.sfx('hiss', panTo(c.yaw)); return; }
      const v = (houseLit() ? (L.t < CREEP.wait ? 0 : CREEP.lit) : CREEP.dark) * (c.seen ? 1 : c.unseenMult);
      if (s.r > target) s.r = Math.max(target, s.r - v * dt);
    };
    // its colours: in the dark it is all but black, its eyes two pale points; in its own place's light, itself
    const shadeOf = c => {
      if (L.won) return 0;
      let k = s.k;
      if (s.run) { const y = c.yaw; k = RING.reduce((b, p) => (Math.abs(wrapPi(y - p.yaw)) < Math.abs(wrapPi(y - RING[b].yaw)) ? p.k : b), 0); }
      return lit(k) ? 0 : 1;
    };
    L.update = dt => {
      const c = L.creature;
      if (s.k === null) {   // the start: at the foot of its place (and you, facing the barn, the box at your left: startFacing)
        s.k = c.lane.idx; c.D0 = RING[s.k].hide;
        way = Object.assign({}, L.lanes[s.k], { apertures: [], blockers: [], name: 'round the yard' });
        c.lane = way; place(c, RING[s.k].yaw, RING[s.k].hide); c.dist = s.r;
        c.distFn = () => s.r; c.shade = 1;
      }
      if (!L.won && G.state === 'play') step(c, dt);
      c.u = clamp(1 - s.r / c.D0, 0, 1);
      c.shade += (shadeOf(c) - c.shade) * Math.min(1, dt * 7);
      // the ambient dark: a little darker still with the main off
      const amb = s.power ? 0.42 : 0.32;
      L.pal.ambient += (amb - L.pal.ambient) * Math.min(1, dt * 6);
      poolLight(dt);
      // the sparks and the smoke from the box
      for (const p of s.sparks) { p.age += dt; p.vy -= 9.8 * dt; p.x += p.vx * dt; p.y = Math.max(0.01, p.y + p.vy * dt); p.z += p.vz * dt; }
      s.sparks = s.sparks.filter(p => p.age < p.life);
      for (const p of s.smoke) { p.age += dt; if (p.age > 0) { p.y += dt * 0.35; p.r += dt * 0.12; } }
      s.smoke = s.smoke.filter(p => p.age < 2.6);
    };
    L.isWon = () => s.trapped;
    L.deathCause = () => (!s.power || L.t - s.backAt < 8 ? 'trip' : 'default');
    L.onCatch = c => { c.shade = 0.45; c.runPose = false; return false; };   // (in your face, a little of it shows)
    // caught: it shrieks, its knees go, and it comes apart in the light (carrier.drawFall); the view closes in on it
    const FALL = CREATURES.carrier.FALL, FALL_END = FALL.shriek + FALL.sink + FALL.apart + 1.8;
    L.aftermath = (t, dt) => {
      const c = L.creature;
      if (s.fallT === undefined) { s.fallT = 0; c.fallSide = c.rand() < 0.5 ? -1 : 1; c.runPose = false; c.recoil = 0; s.run = null; s.flinch = null; AUDIO.sfx('stingShriek', panTo(c.yaw)); G.shake(0.25); }
      c.fallT = t;
      const T2 = FALL.shriek + FALL.sink;
      if (!s.thud && t > T2) { s.thud = true; AUDIO.sfx('thud', panTo(c.yaw)); G.shake(0.2); }
      if (!s.flop && t > T2 + 0.5) { s.flop = true; AUDIO.sfx('flop', panTo(c.yaw)); }
      return t >= FALL_END;
    };
    // zoom held on the box: as close as keeps all of it in view (its hood, its panel and every strip of tape on it, clear
    // of the compass and its line at the top of the view), not the usual 2.6, which at arm's length shows only part of the
    // panel. Only while the whole of it is in the view unzoomed (you are looking at it); otherwise the usual zoom. The game
    // asks for it (L.heldZoom) and eases toward it as toward any zoom: it is judged from the unzoomed view, so it does not
    // move as the zoom does, and the view closes in once, smoothly, and stays
    const BOXC = inBox(() => [BX - BW / 2 - 0.02, BX + BW / 2 + 0.02].flatMap(x => [BY, BY + BH + 0.05].flatMap(y => [BZ - 0.03, BZ + 0.21].map(z => W(x, y, z)))));
    let lineAt = { W: 0, H: 0, y: 0 };
    const lineBottom = () => {   // the compass's line (looking down), in the view: measured once per size of the view
      if (lineAt.W !== R.W || lineAt.H !== R.H) {
        const el = document.getElementById('pitch'), r = el && el.getBoundingClientRect();
        lineAt = { W: R.W, H: R.H, y: r && r.height ? r.bottom - (R.viewY || 0) : 60 };
      }
      return lineAt.y;
    };
    const boxZoom = () => {
      const cam = { yaw: G.cam.yaw, pitch: G.cam.pitch, zoom: 1, W: R.W, H: R.H, eyeH: L.eyeH, eye: L.eye }, pts = BOXC.map(p => R.projectRect(p.x, p.y, p.z, 0, 0, cam));
      if (!R.W || pts.some(p => !p)) return null;
      const cx = R.W / 2, cy = R.H / 2, m = R.H * 0.015, top = Math.max(R.H * 0.06, lineBottom() + 6);
      const x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y)) + 0.5;
      if (x0 < 0 || x1 > R.W || y0 < 0 || y1 > R.H) return null;
      const fit = (room, out) => (out > 0 ? room / out : Infinity);
      return clamp(Math.min(fit(cx - m, cx - x0), fit(R.W - m - cx, x1 - cx), fit(cy - top, cy - y0), fit(R.H - m - cy, y1 - cy)), 1, 2.6);
    };
    L.boxZoom = boxZoom;   // (for the tests)
    L.heldZoom = boxZoom;
    L.watchPoint = () => { const c = L.creature, p = c.pos(); return { x: p.x, y: 0.7, z: p.z, zoom: clamp(s.r / 5.5, 1.35, 4) }; };

    // ---------------- light ----------------
    const lights = [];
    L.dynamicLights = () => {
      lights.length = 0;
      if (houseLit()) lights.push(houseLights[0], houseLights[1]);
      for (let k = 0; k < N; k++) if (lit(k)) lights.push(lightsOf[k][0], lightsOf[k][1]);
      if (L.t - s.tripAt < 0.25) lights.push(Object.assign({}, FLASH, { r: 6, i: 1.6 * (1 - (L.t - s.tripAt) / 0.25), color: [210, 220, 255] }));   // the flash as the main trips
      return lights;
    };
    const glows = [];
    L.glows = () => {
      glows.length = 0;
      if (houseLit()) { glows.push(Object.assign({}, HOUSE.lamp, { r: 0.9, color: [255, 210, 150], a: 0.55 }), Object.assign({}, HOUSE.lamp, { r: 3.2, color: [255, 190, 120], a: 0.12 })); }
      for (let k = 0; k < N; k++) if (lit(k)) { const l = PLACE[k].lamp; glows.push({ x: l.x, y: l.y, z: l.z, r: 1.3, color: [255, 236, 200], a: 0.6 }, { x: l.x, y: l.y, z: l.z, r: 5, color: [255, 214, 150], a: 0.14 }); }
      if (L.t - s.tripAt < 0.4) glows.push({ x: BOXP.x, y: BOXP.y, z: BOXP.z, r: 0.5, color: [220, 230, 255], a: 0.9 * (1 - (L.t - s.tripAt) / 0.4) });
      return glows;
    };
    // what moves: the sparks off the box and its smoke
    L.dynamic = () => {
      for (const p of s.sparks) {
        const a = 1 - p.age / p.life, sz = 0.005 + 0.004 * a;
        R.add({ kind: 'sprite', x: p.x, y: p.y, z: p.z, w: sz, h: sz, noFog: true, noLight: true, sortDist: Math.hypot(p.x, p.z) - 0.05, draw: ctx => { ctx.fillStyle = 'rgba(255,' + (236 - (1 - a) * 130 | 0) + ',' + (170 - (1 - a) * 120 | 0) + ',' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(0, sz / 2, sz / 2, 0, TAU); ctx.fill(); } });
      }
      for (const p of s.smoke) {
        if (p.age <= 0) continue;
        const a = 0.35 * (1 - p.age / 2.6), r = p.r;
        R.add({ kind: 'sprite', x: p.x, y: p.y, z: p.z, w: r * 2, h: r * 2, sortDist: Math.hypot(p.x, p.z) - 0.06, draw: (ctx, P) => { P_ell(ctx, 0, r, r, r, P.cola([110, 108, 104], a)); } });
      }
    };
  }
});
