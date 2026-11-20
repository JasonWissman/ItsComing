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
// You can push the main over to OFF yourself, too, whenever you like: every light on the farm goes out, the porch light
// with them, but the switches stay where they are set. To the thing it is the dark, as when the main trips: it comes in
// for you at its own pace, all the way (no porch light to stop it), until the main goes back on.
// With the main off the switches can still be set, up or down; nothing comes on until the main goes back on, and then
// what is set comes on with it, as if each had been switched on there and then (so with its place and both neighbours
// set, it is caught the moment the main goes on). More than three set and the main trips straight back off.
// Every one of them set, the porch light too, and the main pushed on: the box cannot take it. It bursts in a spray of
// sparks, every lamp on the farm flares and blows, and big sparks fly out from the box to every place, the house and
// the thing: everything goes up, the box too, and the thing, burning, runs shrieking about the yard, then turns on you.
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
    hint: 'It cannot stand the light. Light its place and it runs to a dark place next to it; light the places either side of it first, then its own, and it has nowhere to go. The box takes three lights at once, the porch light too: a fourth trips the main, and nothing comes on until you push the main back on. You can push the main off yourself, too: every light goes out, the switches stay as they are set, and they come on with the main.',
    objective: 'Find it. Light the places either side of it, then its own. No more than three lights at once.',
    where: 'It is out there in the dark, at one of the places. Find it.',
    death: { default: 'It came for you in the dark.', trip: 'The main tripped. In the dark, it came for you.', off: 'You put the main off. In the dark, it came for you.', fire: 'Apparently the electrical box wasn\'t rated for that.' },
    eggs: ['fire'],   // (the easter egg: "Nice try", game.js deathLine)
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
    // trips. It stands where it is set whether the main is on or off (with it off, nothing it is set to comes on)
    const lever = i => {
      const ft = L.t - s.flipAt[i], want = s.on[i] ? 1 : 0;
      if (L.t - s.dropAt < 0.12 && s.wasOn[i]) return 1 - (L.t - s.dropAt) / 0.12;
      return ft < 0.08 ? lerp(1 - want, want, ft / 0.08) : want;
    };
    // how far over the main's lever is (1 over to ON, 0 to OFF): it snaps over when it trips, and is pushed over when you
    // put it off or on
    const mainLever = () => {
      const want = s.power ? 1 : 0, ft = L.t - s.mainAt;
      return ft < 0.1 ? lerp(1 - want, want, ft / 0.1) : want;
    };
    // the box's own little lamp: on with the main, flickering up as it goes back on. Off, the panel is dim, but not so dim
    // the levers cannot be made out. Burning, it is lit by its own fire
    const boxLamp = () => { if (s.fire && L.t - s.fire.at > FIRE.flare) return 0.62 + 0.16 * Math.sin(G.t * (rmK() < 1 ? 7 : 19)) * rmK(); if (!s.power) return 0.3; const k = L.t - s.backAt; return k < 0.3 ? (Math.sin(k * 90) > 0 ? 0.85 : 0.3) : 0.85; };
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
      hint() { return s.fire ? 'The box is burning.' : s.power ? 'The main. On: push it over to OFF and every light goes out.' : 'The main. Off: push it back on. Whatever switches are set come on with it.'; },
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
    Object.assign(s, { on: [true, false, false, false, false, false, false, false], wasOn: [], power: true, trips: 0, tripAt: -99, dropAt: -99, mainAt: -9, offBy: null, pool: 1,
      flipAt: Array(8).fill(-9), litAt: Array(8).fill(-9), backAt: -99, fire: null, sparks: [], smoke: [], k: null, r: null, run: null, flinch: null, back: null, flushes: 0, trapped: false, ring: N, edge: EDGE, hideAt: RING.map(p => p.hide) });
    const blown = () => !!s.fire && L.t - s.fire.at > FIRE.flare;   // (every lamp on the farm blown, the farm alight)
    const lit = k => s.power && s.on[k + 1] && !blown();
    const houseLit = () => s.power && s.on[0] && !blown();
    const countOn = () => s.on.filter(Boolean).length;
    const nb = k => [(k + N - 1) % N, (k + 1) % N];
    L.nb = nb;   // (for the tests)
    const fxr = mulberry32((G.runSeed * 31 + 1111) >>> 0);
    const BOXP = inBox(() => W(BX + 0.06, PY + MY, BZ - 0.02));   // the main, where it trips
    const FLASH = inBox(() => W(BX + 0.06, PY + MY, BZ - 0.2));   // the flash as it trips, a little out in front of it
    const outOfBox = (x, z) => inBox(() => W(x, 0, z));         // a way across the box's front (x) and out of it toward you (-z), in the world
    // a fourth light: the main trips. A bang and a spit of sparks off it, it snaps over to OFF, every switch drops to off
    // with it, and every light on the farm goes out
    const trip = msg => {
      s.wasOn = s.on.slice(); s.on.fill(false); s.power = false; s.offBy = 'trip'; s.trips++; s.tripAt = s.dropAt = s.mainAt = L.t;
      AUDIO.sfx('breakerTrip'); G.shake(0.55); G.flash(0.3);
      const fwd = outOfBox(0, -1);
      for (let i = 0; i < 22; i++) { const a = fxr() * TAU, v = 0.8 + fxr() * 2.0, d = outOfBox(Math.cos(a) * v * 0.7, -Math.abs(Math.sin(a)) * v * 0.6); s.sparks.push({ x: BOXP.x + fwd.x * 0.02, y: BOXP.y, z: BOXP.z + fwd.z * 0.02, vx: d.x, vy: 0.6 + fxr() * 2.2, vz: d.z, age: 0, life: 0.4 + fxr() * 0.6 }); }
      for (let i = 0; i < 4; i++) { const q = outOfBox((fxr() - 0.5) * 0.1, -0.05); s.smoke.push({ x: BOXP.x + q.x, y: BOXP.y + 0.05, z: BOXP.z + q.z, age: -i * 0.12, r: 0.05 + fxr() * 0.04 }); }
      G.say(msg || 'The main trips. Every switch drops, and every light on the farm goes out.', 'The main trips.');
    };
    // the main: pushed back over to ON, and whatever switches are set come on with it, as if each were switched on there
    // and then: more than three and it trips straight back off; every one of them and the box goes up (ignite). Pushed
    // while it is on, over to OFF (off): every light on the farm goes out, and the switches stay where they are set
    const off = () => {
      s.power = false; s.offBy = 'hand'; s.mainAt = L.t;
      AUDIO.sfx('lever'); AUDIO.sfx('clunk');
      G.say(countOn() ? 'You push the main over to OFF. Every light on the farm goes out; the switches stay as they are set.' : 'You push the main over to OFF. The farm is dark.', 'The main is off.');
    };
    const main = () => {
      if (L.won || G.state !== 'play' || s.fire) return;
      if (s.power) { off(); return; }
      const n = countOn();
      if (n === s.on.length) { ignite(); return; }
      s.power = true; s.mainAt = s.backAt = L.t;
      AUDIO.sfx('lever'); AUDIO.sfx('clunk');
      if (n > 3) { trip('The main goes on, and trips straight back off: too many switches on. Every switch drops, and every light goes out.'); return; }
      s.on.forEach((o, i) => { if (o) s.litAt[i] = L.t; });
      if (n) AUDIO.sfx('tubeOn');
      G.say(n ? 'The main goes back on, and the lights you set come on with it.' : 'The main goes back on. Everything else is off.', 'The main is on.');
    };
    const flip = i => {
      if (L.won || G.state !== 'play' || s.fire) return;
      if (!s.power) {   // the main is off: the switch is set, up or down, and nothing comes on until the main does
        s.on[i] = !s.on[i]; s.flipAt[i] = L.t;
        AUDIO.sfx('switch'); AUDIO.sfx('clunk');
        G.say(s.on[i] ? 'Set on. Nothing comes on while the main is off.' : 'Set off. The main is off.', 'The main is off.');
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
    const CREEP = { wait: 5, lit: 0.2, dark: 0.62, back: 2.6 };   // (with the main off, tripped or put off by you, it is dark, and it comes at its own pace)
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
      if (c.burn > 0) return 0;   // (lit by its own fire)
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
      if (!L.won && G.state === 'play') { if (s.fire) fireStep(c, dt); else step(c, dt); }
      c.u = clamp(1 - s.r / c.D0, 0, 1);
      c.shade += (shadeOf(c) - c.shade) * Math.min(1, dt * 7);
      // the ambient dark: a little darker still with the main off
      const amb = s.fire ? 0.36 + 0.12 * fireAll() : s.power ? 0.42 : 0.32;
      L.pal.ambient += (amb - L.pal.ambient) * Math.min(1, dt * 6);
      poolLight(dt);
      // the sparks and the smoke from the box
      for (const p of s.sparks) { p.age += dt; p.vy -= 9.8 * dt; p.x += p.vx * dt; p.y = Math.max(0.01, p.y + p.vy * dt); p.z += p.vz * dt; }
      s.sparks = s.sparks.filter(p => p.age < p.life);
      for (const p of s.smoke) { p.age += dt; if (p.age > 0) { p.y += dt * 0.35; p.r += dt * 0.12; } }
      s.smoke = s.smoke.filter(p => p.age < 2.6);
      if (s.fire) fireFx(dt);
    };
    L.isWon = () => s.trapped;
    L.deathCause = () => (s.fire ? 'fire' : !s.power || L.t - s.backAt < 8 ? (s.offBy === 'hand' ? 'off' : 'trip') : 'default');   // (the main off, or not long back on: tripped, or put off by you)
    L.onCatch = c => { c.shade = s.fire ? 0 : 0.45; c.runPose = false; return false; };   // (in your face, a little of it shows)
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

    // ---------------- the farm alight ----------------
    // Every switch set on with the main off, then the main pushed on: the box cannot take it. A cracking bang and a
    // spray of sparks off it, every lamp on the farm flaring for a moment (FIRE.flare) and blowing, and big sparks
    // flying out from the box in arcs, one to every place, one to the house and one to the thing: each catches where its
    // spark lands, the fire running out over it from there (FIRE.spread seconds a metre, each flame growing over
    // FIRE.spot), and the box goes up at once. The thing, burning, runs shrieking about the yard in the open, where you
    // are looking (at FIRE.runV, for FIRE.run seconds in view), turns on you, its arms over its head (FIRE.turn), and charges
    // (FIRE.charge metres a second) until it has you.
    const FIRE = { flare: 0.3, box: 0.12, grow: 2.2, spot: 1.1, spread: 0.22, run: 3.2, runMax: 9, turn: 0.6, runV: 7.2, charge: 8.5, maxSparks: 170 };
    const CR = CREATURES.carrier;
    const rmK = () => (SAVE.data.settings.reducedMotion ? 0.4 : 1);   // (reduced motion: the fires flicker less)
    const SITES = [];   // what burns: the seven places (0..6, as RING), the house (7) and the box (8)
    // each in its own frame: hit, where its spark lands; light, its fire's light out over its front (lr: how far it
    // reaches); glow, the bloom of it (gr: how big); top, where its smoke goes up from (wide: how wide a fire it is); pool,
    // the fire's light on the ground before it (z0, z1, w); spots, its flames [x, y, z, size], each fixed where it burns,
    // y the foot of it. Every flame's foot sits on something, seen from where you stand (and you never move, so it is
    // so whichever way you look and however you zoom): on a wall, a roof, a door, the pickup, or the ground. Its foot is
    // kept in from the edges of what it is on by the width of it (about size / 2 either side, and the lower flame beside
    // it out to 0.6 size on its own side), so none of it hangs off a corner or an eave into the air; the flame itself is
    // soft at its foot (CR.flameStrip), with no hard line along it. Along a roof or a gable the feet sit just under its
    // edge and the flames rise up over it. (test/nights/night11.js checks each foot against the building it is on)
    const FLAME_LO = 0.22, FLAME_LW = 0.75;   // the lower flame beside each: how far to its side (in sizes) and how big
    const site = (deg, o) => inFrame(deg, () => {
      const si = SITES.length, hit = W(...o.hit);
      const st = { si, yaw: deg * DEG, hit, light: Object.assign(W(...o.light), { r: o.lr, i: 0, color: [255, 136, 56], flicker: 0.7, seed: si * 5 + 3 }), glow: W(...o.glow), gr: o.gr, top: W(...o.top), wide: o.wide, spots: [] };
      o.spots.forEach(([x, y, z, sz], j) => {
        const p = W(x, y, z), w = sz, h = sz * 2, seed = si * 7.1 + j * 1.9, side = j % 2 ? 1 : -1;
        st.spots.push({ d: Math.hypot(p.x - hit.x, p.y - hit.y, p.z - hit.z) * FIRE.spread, at: [x, y, z], sz, side });
        SC.sprite(L, x, y, z, w, h, ctx => {
          const g = spotFire(si, j);
          if (g <= 0) return;
          const a = Math.min(1, g * 2), fw = w * (0.4 + 0.6 * g), fh = h * (0.35 + 0.65 * g);
          CR.flame(ctx, side * FLAME_LO * fw, 0, fw * FLAME_LW, fh * FLAME_LW, G.t * 1.1, seed + 3.3, a);   // a lower one beside it, flickering its own way
          CR.flame(ctx, 0, 0, fw, fh, G.t, seed, a * 0.85, true);   // and the main one, laid on as light, so where they overlap the fire burns hotter
        }, { noFog: true, noLight: true, sortDist: Math.hypot(p.x, p.z) - (o.sortK || 0.45) });
      });
      if (o.pool) {   // its fire's light on the ground before it
        const [z0, z1, pw] = o.pool, ph = z1 - z0;
        SC.sprite(L, 0, 0.02, z0, pw, ph, (ctx, P) => {
          const lv = siteFire(si);
          if (lv <= 0) return;
          const a = 0.5 * lv * (1 - P.fog * 0.6) * flick(si);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(0, ph * 0.62); ctx.scale(pw / 2, ph * 0.62);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(255,128,48,' + a.toFixed(3) + ')'); g.addColorStop(0.5, 'rgba(255,100,36,' + (a * 0.42).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,80,30,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
        }, { flat: true, layer: 0, sortDist: -0.9, noLight: true, noFog: false });
      }
      SITES.push(st);
    });
    const row = (x0, x1, n, y, z, sz) => Array.from({ length: n }, (_, i) => [lerp(x0, x1, n > 1 ? i / (n - 1) : 0.5), y, z, sz]);
    site(225, { hit: [0, 3.6, 20.7], light: [0, 2.6, 17.5], lr: 15, glow: [0, 2.5, 20.6], gr: 4.5, top: [0, 4.2, 23], wide: 10, pool: [12, 22.5, 15],   // the tractor shed: along the beam under its eave, on the ground at the feet of its posts and its side walls, and on the tractor
      spots: row(-4.4, 4.4, 7, 3.6, 20.8, 1.6).concat([[-2.7, 0, 20.75, 1.3], [2.7, 0, 20.75, 1.3], [-4.4, 0, 20.9, 1.2], [4.4, 0, 20.9, 1.2], [0.8, 0.45, 23.8, 1.8], [0.2, 1.7, 23.8, 1.3]]) });
    site(270, { hit: [0, 2.5, 15.75], light: [0, 2.2, 13.5], lr: 11, glow: [0, 2, 15.8], gr: 3, top: [0, 3.9, 17.8], wide: 4.4, pool: [7.5, 17, 10],   // the shed: its front, its door and window, and up its gable under the roof's edge
      spots: [[-1.7, 0, 15.65, 1.2], [1.55, 0.05, 15.65, 1.1], [0, 0.6, 15.65, 1.3], [1.35, 1.2, 15.65, 1.0], [-1.2, 1.5, 15.65, 1.2], [-1.5, 2.1, 15.65, 1.2], [-0.9, 2.6, 15.65, 1.2], [0, 3.1, 15.65, 1.25], [0.9, 2.6, 15.65, 1.2], [1.45, 2.1, 15.65, 1.2]] });
    site(315, { hit: [0, 2.75, 23.5], light: [0, 2.4, 21], lr: 16, glow: [0, 2.2, 23.4], gr: 6, top: [0, 4.5, 26], wide: 16, pool: [12, 25.2, 20],   // the stables: all along its roof, and its stable doors
      spots: row(-7, 7, 9, 2.95, 23.25, 1.7).concat(row(-5.6, 5.6, 5, 0.5, 23.9, 1.3)) });
    site(0, { hit: [0, 5.05, 29.6], light: [0, 4, 26.5], lr: 20, glow: [0, 5, 29.8], gr: 8, top: [0, 10.9, 32], wide: 12, pool: [18, 31.2, 18],   // the barn: its great doors, its front and up its gable to the peak
      spots: [[-4.9, 0, 29.6, 2.2], [4.9, 0, 29.6, 2.2], [-1.2, 0.15, 29.6, 2.4], [1.4, 0, 29.6, 2.2], [0, 2.5, 29.6, 2.0], [-4.2, 2.6, 29.6, 2.2], [4.3, 2.2, 29.6, 2.2], [-4.4, 5.3, 29.6, 2.4], [4.4, 5.3, 29.6, 2.4],
        [-2.6, 8.0, 29.6, 2.4], [2.6, 8.0, 29.6, 2.4], [0, 6.6, 29.6, 2.4], [-1.4, 9.1, 29.6, 1.8], [1.4, 9.1, 29.6, 1.8], [0, 9.7, 29.6, 2.6]] });
    site(45, { hit: [1.0, 4.35, 24.5], light: [-0.5, 4, 22], lr: 18, glow: [-1, 5, 25], gr: 7, top: [-2.2, 14.6, 26], wide: 8, pool: [13, 26.2, 16],   // the silo, up to its dome, and the roof and front of the feed room
      spots: [[-2.2, 12.3, 25.1, 2.6], [-3.2, 9.4, 25.9, 2.0], [-0.9, 7.4, 25.6, 2.0], [-3.4, 4.9, 25.6, 2.0], [-1.0, 2.4, 25.6, 2.0], [-2.4, 0, 25.1, 2.0],
        [1.3, 2.82, 24.75, 1.6], [2.75, 2.9, 24.75, 1.6], [4.2, 2.82, 24.75, 1.6], [2.8, 0.38, 25.1, 1.4], [1.1, 0.3, 25.1, 1.2], [4.4, 0.1, 25.1, 1.2]] });
    site(90, { hit: [0, 2.65, 15.6], light: [1.5, 2, 13.5], lr: 11, glow: [1.5, 1.6, 15.8], gr: 3.5, top: [0, 2.6, 17], wide: 7, pool: [7.5, 17, 11],   // the coop: under its roof's edge, its door, the ground under it and the straw in the run
      spots: [[-1.0, 2.12, 15.65, 1.1], [0, 2.1, 15.65, 1.3], [1.0, 2.12, 15.65, 1.1], [0, 0.85, 15.9, 1.0], [-1.4, 0, 16.0, 0.8], [1.4, 0, 16.0, 0.8], [2.6, 0, 15.9, 1.0], [3.6, 0, 15.9, 1.0], [4.7, 0, 15.9, 1.0]] });
    site(135, { hit: [-1.35, 5.42, 19.9], light: [0, 2.5, 18], lr: 16, glow: [1, 2.5, 22], gr: 6, top: [0, 4.4, 30], wide: 9, pool: [11, 21.5, 14],   // the driveway: the pickup, the garage, and the grass at the foot of the yard light's pole
      spots: [[2.15, 1.55, 21.4, 1.4], [1.75, 0.6, 20.0, 1.1], [2.6, 0.6, 20.0, 1.1], [2.2, 0.98, 23.5, 1.4], [-3.2, 2.6, 27.6, 1.6], [-1.6, 2.75, 27.6, 1.6], [0, 2.9, 27.6, 1.7], [1.6, 2.75, 27.6, 1.6], [3.2, 2.6, 27.6, 1.6],
        [-1.8, 0.42, 27.85, 1.6], [2.4, 0.55, 27.85, 1.5], [-2.3, 0, 19.8, 0.9]] });
    site(180, { hit: [0.95, 2.04, 6.85], light: [0, 2.6, 3.2], lr: 10, glow: [0, 3, 6], gr: 6, top: [0, 8.5, 11], wide: 10, pool: [1.2, 7.4, 13],   // the house behind you: along the porch roof, its windows, up its front and its roof, and the chimney
      spots: row(-2.2, 2.2, 5, 2.44, 4.75, 1.2).concat([[-2.65, 0.7, 5.0, 1.0], [2.65, 0.7, 5.0, 1.0], [-3, 3.42, 6.9, 1.6], [0, 3.55, 6.9, 1.5], [3, 3.42, 6.9, 1.6], [-3, 1.08, 6.9, 1.4], [3, 1.08, 6.9, 1.4], [-3.5, 4.82, 6.9, 1.6], [3.5, 4.82, 6.9, 1.6],
        [-2, 5.86, 8.6, 1.8], [2, 5.86, 8.6, 1.8], [-3.6, 5.49, 8.0, 1.7], [3.6, 5.49, 8.0, 1.7], [-3.5, 7.64, 11, 2.2], [0, 7.68, 11, 2.4], [3.5, 7.64, 11, 2.2], [2.55, 9.2, 11.9, 0.7]]) });
    site(BOX_DEG, { hit: [BX + 0.06, PY + MY, BZ - 0.02], light: [0, 1.1, BZ - 0.4], lr: 3.5, glow: [0, 1.05, BZ - 0.05], gr: 0.14, top: [0, 1.4, BZ + 0.1], wide: 0.5, sortK: 0.08,   // the box on its post, at your left hand
      spots: [[-0.14, 1.235, BZ - 0.04, 0.15], [0.12, 1.25, BZ - 0.04, 0.17], [0.03, 1.31, BZ + 0.1, 0.16], [0.14, 0.76, BZ - 0.05, 0.14], [-0.14, 0.62, BZ - 0.05, 0.14], [0.04, 0, BZ + 0.03, 0.18]] });   // (low: licking up its front and over its hood, not hiding the yard beyond it)
    const BOX_SITE = SITES.length - 1;
    L.fireSites = SITES;   // (for the tests)
    // how far the fire has taken a place (0..1), and one of its flames
    const siteFire = si => { const a = s.fire && s.fire.lit[si]; return a === null || a === undefined ? 0 : clamp((L.t - a) / FIRE.grow, 0, 1); };
    const spotFire = (si, j) => { const a = s.fire && s.fire.lit[si]; return a === null || a === undefined ? 0 : clamp((L.t - a - SITES[si].spots[j].d) / FIRE.spot, 0, 1); };
    const fireAll = () => (s.fire ? SITES.reduce((k, st) => k + siteFire(st.si), 0) / SITES.length : 0);
    const flick = si => 1 + (0.16 * Math.sin(G.t * 11 + si * 2.1) + 0.08 * Math.sin(G.t * 23 + si)) * rmK();
    const panAt = p => panTo(Math.atan2(p.x, p.z));
    // the thing's chest, where its spark lands
    const chest = () => { const p = L.creature.pos(); return { x: p.x, y: 1.0, z: p.z }; };
    const spray = (p, n, v, life) => {   // sparks thrown off a point, every way and up
      for (let i = 0; i < n && s.sparks.length < FIRE.maxSparks; i++) {
        const a = fxr() * TAU, sp = v * (0.3 + fxr() * 0.9);
        s.sparks.push({ x: p.x, y: p.y, z: p.z, vx: Math.cos(a) * sp, vy: v * (0.3 + fxr() * 1.1), vz: Math.sin(a) * sp, age: 0, life: life * (0.5 + fxr() * 0.8), big: true });
      }
    };
    // every switch on, and the main pushed on: the box goes up, and the farm with it
    const ignite = () => {
      const rf = SAVE.data.settings.reducedFlash, c = L.creature;
      s.power = true; s.mainAt = s.backAt = L.t;
      s.on.forEach((o, i) => { s.litAt[i] = L.t; });
      s.fire = { at: L.t, lit: SITES.map(() => null), embers: [], cr: null, crackle: 0.4 };
      s.run = null; s.flinch = null; s.back = null; c.runPose = false; c.recoil = 1;
      AUDIO.sfx('lever'); AUDIO.sfx('sparkBlast', panAt(BOXP));
      G.shake(1.1); if (!rf) G.flash(0.3);
      G.cam.zoomHeld = false; G.cam.tPitch = 0;   // (you start back from it, and look up)
      // the spray off the box: out of its front and up, every way
      const fwd = outOfBox(0, -1);
      for (let i = 0; i < 90; i++) {
        const a = fxr() * TAU, v = 1.2 + fxr() * 3.4, d = outOfBox(Math.cos(a) * v * 0.8, -Math.abs(Math.sin(a)) * v * 0.45 - 0.1);
        s.sparks.push({ x: BOXP.x + fwd.x * 0.03, y: BOXP.y, z: BOXP.z + fwd.z * 0.03, vx: d.x, vy: 0.8 + fxr() * 4.2, vz: d.z, age: 0, life: 0.6 + fxr() * 1.0, big: i % 3 === 0 });
      }
      for (let i = 0; i < 6; i++) { const q = outOfBox((fxr() - 0.5) * 0.2, -0.05); s.smoke.push({ x: BOXP.x + q.x, y: BOXP.y + 0.05, z: BOXP.z + q.z, age: -i * 0.1, r: 0.04 + fxr() * 0.03, dark: true }); }
      // the big sparks: out of the box in high arcs, one to every place and the house, and one to the thing
      SITES.forEach((st, si) => {
        if (si === BOX_SITE) return;
        const d = Math.hypot(st.hit.x - BOXP.x, st.hit.z - BOXP.z);
        s.fire.embers.push({ si, at: L.t + 0.05 + si * 0.035, T: 0.45 + d / 26, h: 1.4 + d * 0.22, to: st.hit, u: 0 });
      });
      { const p = chest(), d = Math.hypot(p.x - BOXP.x, p.z - BOXP.z); s.fire.embers.push({ si: -1, at: L.t + 0.1, T: 0.5 + d / 24, h: 1.2 + d * 0.18, to: p, u: 0 }); }
      s.fire.lit[BOX_SITE] = L.t + FIRE.box;
      AUDIO.setLoop('fire', 0.05, 0);
      G.say('Every switch on at once. The box bursts in a shower of sparks, and the farm goes up.', 'The box bursts.');
    };
    L.ignite = ignite;   // (for the tests)
    // where a spark in flight is (u: 0..1 of the way)
    const emberAt = (e, u) => ({ x: lerp(BOXP.x, e.to.x, u), y: lerp(BOXP.y, e.to.y, u) + Math.sin(Math.PI * u) * e.h, z: lerp(BOXP.z, e.to.z, u) });
    // the fire, from frame to frame: the sparks flying out and landing, the roar and the crackle, the box spitting
    const fireFx = dt => {
      const f = s.fire;
      for (const e of f.embers) {
        if (e.done || L.t < e.at) continue;
        if (e.si < 0) e.to = chest();   // (the thing's spark finds it wherever it has got to)
        e.u = clamp((L.t - e.at) / e.T, 0, 1);
        if (e.u < 1) continue;
        e.done = true;
        spray(e.to, 12, 3, 0.8);
        if (e.si < 0) { catchFire(); continue; }
        f.lit[e.si] = L.t;
        AUDIO.sfx('fireCatch', panAt(e.to));
        if (e.si === 7) G.shake(0.25);   // (the house, close behind you)
      }
      if (f.lit[BOX_SITE] !== null && L.t > f.lit[BOX_SITE] && fxr() < dt * 9) {   // the box spitting sparks as it burns
        const p = outOfBox((fxr() - 0.5) * 0.3, -0.05);
        spray({ x: BOXP.x + p.x, y: BOXP.y + (fxr() - 0.4) * 0.4, z: BOXP.z + p.z }, 2, 1.6, 0.6);
      }
      const all = fireAll();
      AUDIO.setLoop('fire', 0.05 + 0.4 * all, 0);
      f.crackle -= dt;
      if (f.crackle <= 0 && all > 0.05) { f.crackle = 0.07 + fxr() * 0.22 / (0.4 + all); AUDIO.sfx('fireCrackle', (fxr() - 0.5) * 1.8, true); }
      // the sky over the farm, and the haze, going red with it: in a few steps, not every frame (the sky is kept until its
      // colours change)
      const k = Math.round(all * 6) / 6;
      if (f.skyK !== k) { f.skyK = k; L.pal.fog = mixc(L.def.pal.fog, [78, 40, 28], k * 0.75).map(Math.round); L.pal.skyTop = mixc(L.def.pal.skyTop, [26, 12, 12], k * 0.6).map(Math.round); }
    };
    // its spark lands on it: it goes up, shrieking, and runs
    const catchFire = () => {
      const c = L.creature;
      s.fire.cr = { t: 0, phase: 'run', wp: null, side: c.rand() < 0.5 ? -1 : 1, yaw: c.yaw, r: s.r, shriek: 1.3, steps: 0, ran: 0, seenT: 0 };
      c.recoil = 0; c.burn = 0.01; c.char = 0;
      AUDIO.sfx('burnShriek', panTo(c.yaw)); G.shake(0.2);
    };
    // a place in the open yard to run to, where you are looking (it changes from one to the next), to and fro across the
    // view; the first, if it is far off where you are looking, straight out into the open from where it was. It runs
    // round you to it (yaw and distance), never through you, and in front of the house, not through it (houseR)
    const nextWaypoint = cr => {
      const c = L.creature, cam = G.cam.yaw;
      if (!cr.wp && cr.r > 10 && Math.abs(wrapPi(cr.yaw - cam)) < 70 * DEG) { cr.wp = { yaw: cr.yaw, r: 8.5 }; return; }
      cr.side = -cr.side;
      cr.wp = { yaw: cam + cr.side * (14 + c.rand() * 18) * DEG, r: 5 + c.rand() * 3 };
    };
    const houseR = (yaw, r) => lerp(r, Math.min(r, 4), smoothstep(1 - Math.abs(wrapPi(yaw - Math.PI)) / (48 * DEG)));
    // the thing on fire: waiting for its spark (rearing back from the flare), then running about in the open (until you
    // have had FIRE.run seconds of it in view, or FIRE.runMax in all), then turning on you and charging (the game catches
    // it as it reaches you: L.deathCause, 'fire')
    const fireStep = (c, dt) => {
      const f = s.fire, cr = f.cr;
      if (!cr) { c.recoil = L.t - f.at < 0.8 ? 1 : Math.max(0, c.recoil - dt * 3); return; }
      cr.t += dt;
      c.burn = Math.min(1, cr.t / 0.7); c.char = Math.min(0.85, 0.3 + cr.t / 4);
      cr.shriek -= dt;
      if (cr.phase === 'run') {
        if (!cr.wp) nextWaypoint(cr);
        if (c.seen) cr.seenT += dt;
        const dy = wrapPi(cr.wp.yaw - cr.yaw), dr = cr.wp.r - cr.r, arc = dy * Math.max(3, cr.r), d = Math.hypot(arc, dr), v = FIRE.runV * (0.85 + 0.15 * Math.sin(cr.t * 5.3)) * (c.seen ? 1 : 1.6);   // (out of sight, it tears round to where you are looking)
        if (d < 0.6) nextWaypoint(cr);
        else {
          const m = Math.min(d, v * dt);
          cr.yaw += dy * m / d; cr.r += dr * m / d; cr.ran += m;
          if (Math.abs(arc) > Math.abs(dr) * 0.3) c.runDir = dy > 0 ? 1 : -1;
          place(c, cr.yaw, houseR(cr.yaw, cr.r));
        }
        c.runPose = true; c.runPace = 1; c.runGait = (c.runGait || 0) + dt * 17;
        const n = Math.floor(c.runGait / Math.PI);
        if (n !== cr.steps) { cr.steps = n; AUDIO.footstep('runner', clamp(4 / (s.r + 4), 0.12, 0.7), panTo(c.yaw)); }
        if (cr.shriek <= 0) { cr.shriek = 1.1 + c.rand() * 0.6; AUDIO.sfx('burnShriek', panTo(c.yaw)); }
        if (cr.seenT > FIRE.run || cr.t > FIRE.runMax) { cr.phase = 'turn'; cr.pt = 0; c.runPose = false; c.flail = 1; AUDIO.sfx('burnShriek', panTo(c.yaw)); }
        return;
      }
      if (cr.phase === 'turn') {   // it stops, beats at itself, and turns on you
        cr.pt += dt;
        if (cr.pt < FIRE.turn) return;
        cr.phase = 'charge'; c.flail = 0; c.charge = 1;
        c.deathSpec = { delay: 0.08, dur: 0.36, sting: 'stingBurn' };
        return;
      }
      s.r = Math.max(0.5, s.r - FIRE.charge * dt);   // straight at you
    };

    // ---------------- light ----------------
    const lights = [];
    L.dynamicLights = () => {
      lights.length = 0;
      if (houseLit()) lights.push(houseLights[0], houseLights[1]);
      for (let k = 0; k < N; k++) if (lit(k)) lights.push(lightsOf[k][0], lightsOf[k][1]);
      if (L.t - s.tripAt < 0.25) lights.push(Object.assign({}, FLASH, { r: 6, i: 1.6 * (1 - (L.t - s.tripAt) / 0.25), color: [210, 220, 255] }));   // the flash as the main trips
      if (s.fire) {   // the fires: each place's, the house's and the box's, and the thing's own, and the burst off the box
        const fl = L.t - s.fire.at;
        if (fl < 0.35) lights.push(Object.assign({}, FLASH, { r: 9, i: (SAVE.data.settings.reducedFlash ? 0.6 : 1.4) * (1 - fl / 0.35), color: [255, 214, 170] }));
        for (const st of SITES) { const lv = siteFire(st.si); if (lv > 0) { st.light.i = (st.si === BOX_SITE ? 0.9 : st.si === 7 ? 0.6 : 1.7) * lv; lights.push(st.light); } }   // (the house is close: less of it, or its white boards burn out to white)
        const c = L.creature;
        if (c.burn > 0) { const p = c.pos(); crLight.x = p.x; crLight.y = 2.3; crLight.z = p.z; crLight.i = 1.1 * c.burn; lights.push(crLight); }
      }
      return lights;
    };
    const crLight = { x: 0, y: 0, z: 0, r: 7, i: 0, color: [255, 140, 60], flicker: 0.8, seed: 77 };
    const glows = [];
    L.glows = () => {
      glows.length = 0;
      if (houseLit()) { glows.push(Object.assign({}, HOUSE.lamp, { r: 0.9, color: [255, 210, 150], a: 0.55 }), Object.assign({}, HOUSE.lamp, { r: 3.2, color: [255, 190, 120], a: 0.12 })); }
      for (let k = 0; k < N; k++) if (lit(k)) { const l = PLACE[k].lamp; glows.push({ x: l.x, y: l.y, z: l.z, r: 1.3, color: [255, 236, 200], a: 0.6 }, { x: l.x, y: l.y, z: l.z, r: 5, color: [255, 214, 150], a: 0.14 }); }
      if (L.t - s.tripAt < 0.4) glows.push({ x: BOXP.x, y: BOXP.y, z: BOXP.z, r: 0.5, color: [220, 230, 255], a: 0.9 * (1 - (L.t - s.tripAt) / 0.4) });
      if (s.fire) {
        const fl = L.t - s.fire.at, rf = SAVE.data.settings.reducedFlash;
        if (fl < 0.5) glows.push({ x: BOXP.x, y: BOXP.y, z: BOXP.z, r: 0.16, color: [255, 214, 160], a: (rf ? 0.25 : 0.8) * (1 - fl / 0.5) });   // (at arm's length: a glow's size is in metres)   // the burst
        for (const st of SITES) {
          const lv = siteFire(st.si);
          if (lv > 0) glows.push({ x: st.glow.x, y: st.glow.y, z: st.glow.z, r: st.gr * (0.6 + 0.4 * lv), color: [255, 120, 44], a: 0.26 * lv * flick(st.si) }, { x: st.glow.x, y: st.glow.y, z: st.glow.z, r: st.gr * 2.4, color: [255, 90, 30], a: 0.08 * lv });
        }
        for (const e of s.fire.embers) if (!e.done && L.t >= e.at) { const p = emberAt(e, e.u); glows.push({ x: p.x, y: p.y, z: p.z, r: Math.min(1.1, 0.045 * (p.x * p.x + (p.y - L.eyeH) ** 2 + p.z * p.z)), color: [255, 170, 80], a: 0.55 }); }
        const c = L.creature;
        if (c.burn > 0) { const p = c.pos(); glows.push({ x: p.x, y: p.y + 1.1, z: p.z, r: 2.2, color: [255, 120, 44], a: 0.3 * c.burn * flick(9) }); }
      }
      return glows;
    };
    // what moves: the sparks off the box and its smoke
    L.dynamic = () => {
      for (const p of s.sparks) {
        if (Math.hypot(p.x, p.y - L.eyeH, p.z) < 0.75) continue;   // (one flying past your face is not drawn filling the view)
        const a = 1 - p.age / p.life, sz = p.big ? 0.01 + 0.012 * a : 0.005 + 0.004 * a;
        R.add({ kind: 'sprite', x: p.x, y: p.y, z: p.z, w: sz, h: sz, noFog: true, noLight: true, sortDist: Math.hypot(p.x, p.z) - 0.05, draw: ctx => { ctx.fillStyle = 'rgba(255,' + (236 - (1 - a) * 130 | 0) + ',' + (170 - (1 - a) * 120 | 0) + ',' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.arc(0, sz / 2, sz / 2, 0, TAU); ctx.fill(); } });
      }
      for (const p of s.smoke) {
        if (p.age <= 0) continue;
        const a = (p.dark ? 0.5 : 0.35) * (1 - p.age / 2.6), r = p.r;
        if (p.dark) R.add({ kind: 'sprite', x: p.x, y: p.y, z: p.z, w: r * 2, h: r * 2, noLight: true, noFog: true, sortDist: Math.hypot(p.x, p.z) - 0.06, draw: (ctx, P) => { P_ell(ctx, 0, r, r, r, P.cola([34, 28, 26], a)); } });   // (the box burning: sooty)
        else R.add({ kind: 'sprite', x: p.x, y: p.y, z: p.z, w: r * 2, h: r * 2, sortDist: Math.hypot(p.x, p.z) - 0.06, draw: (ctx, P) => { P_ell(ctx, 0, r, r, r, P.cola([110, 108, 104], a)); } });
      }
      if (s.fire) fireDraw();
    };
    // the fire's moving parts, made up from the clock each frame (nothing kept): the big sparks in flight with their
    // trails, smoke rolling up off each fire, embers going up from it, and the thing's light on the ground under it
    const SMOKE = 4, EMBERS = 5;
    const fireDraw = () => {
      if (G.state === 'dying') { const dt = Math.min(0.05, G.t - (s.fire.drawnAt || G.t)); for (const p of s.sparks) { p.age += dt; p.vy -= 9.8 * dt; p.x += p.vx * dt; p.y = Math.max(0.01, p.y + p.vy * dt); p.z += p.vz * dt; } }
      s.fire.drawnAt = G.t;
      const t = G.t, rk = rmK();
      for (const e of s.fire.embers) {
        if (e.done || L.t < e.at) continue;
        for (let k = 0; k < 8; k++) {   // the spark and its trail
          const u = e.u - k * 0.03;
          if (u < 0) break;
          const p = emberAt(e, u), sz = (k ? 0.26 : 0.42) * (1 - k * 0.1) * clamp(Math.hypot(p.x, p.y - L.eyeH, p.z) / 6, 0.12, 1), a = 1 - k * 0.12;   // (no bigger than a spark close by)
          R.add({ kind: 'sprite', x: p.x, y: p.y - sz / 2, z: p.z, w: sz, h: sz, noFog: true, noLight: true, sortDist: Math.hypot(p.x, p.z) - 0.1, draw: ctx => {
            ctx.fillStyle = k ? 'rgba(255,' + (170 - k * 12) + ',50,' + (a * 0.8).toFixed(2) + ')' : 'rgba(255,240,200,1)'; ctx.beginPath(); ctx.arc(0, sz / 2, sz / 2, 0, TAU); ctx.fill();
            if (!k) { ctx.fillStyle = 'rgba(255,160,60,0.45)'; ctx.beginPath(); ctx.arc(0, sz / 2, sz, 0, TAU); ctx.fill(); }
          } });
        }
      }
      for (const st of SITES) {
        const lv = siteFire(st.si);
        if (lv <= 0) continue;
        const box = st.si === BOX_SITE, sc = box ? 0.12 : 1, d0 = Math.hypot(st.top.x, st.top.z);
        for (let i = 0; i < (box ? 0 : SMOKE); i++) {   // (the box's own smoke is its puffs, s.smoke)   // smoke, rolling up off it and drifting away on the wind
          const q = (t * 0.16 * (0.7 + 0.3 * rk) + i / SMOKE + st.si * 0.13) % 1, r = (0.8 + q * 3.2) * sc * Math.sqrt(st.wide / 8 + 0.3), a = 0.42 * lv * (1 - q) * Math.min(1, q * 5);
          const x = st.top.x + (Math.sin(i * 2.7 + st.si) * st.wide * 0.25 + q * 4) * sc, y = st.top.y + q * 9 * sc, z = st.top.z + q * 1.5 * sc;
          R.add({ kind: 'sprite', x, y, z, w: r * 2, h: r * 2, noLight: false, sortDist: d0 + 0.6 * sc, draw: (ctx, P) => { P_ell(ctx, 0, r, r, r * 0.9, P.cola([46, 38, 36], a)); } });
        }
        for (let i = 0; i < EMBERS; i++) {   // embers going up off it
          const q = (t * 0.45 + i / EMBERS + st.si * 0.37) % 1, h = (i * 0.618 + st.si * 0.29) % 1, sz = 0.07 * (box ? 0.25 : 1) * (1 - q * 0.6);
          const x = st.top.x + (h - 0.5) * st.wide * 0.9 + Math.sin(t * 2 + i * 3) * 0.4 * sc, y = st.top.y - 2 * sc + q * 7 * sc, z = st.top.z - 0.5 * sc;
          R.add({ kind: 'sprite', x, y, z, w: sz, h: sz, noFog: true, noLight: true, sortDist: d0 - 0.5 * sc, draw: ctx => { ctx.fillStyle = 'rgba(255,' + (190 - q * 90 | 0) + ',70,' + (lv * (1 - q)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(0, sz / 2, sz / 2, 0, TAU); ctx.fill(); } });
        }
      }
      const c = L.creature;
      if (c.burn > 0) {   // its fire's light on the ground round its feet
        const p = c.pos(), b = c.burn, pr = 3.2, d = Math.max(0.5, Math.hypot(p.x, p.z));   // (a flat sprite runs on away from you from its foot)
        R.add({ kind: 'sprite', x: p.x - p.x / d * pr, y: 0.03, z: p.z - p.z / d * pr, w: pr * 2, h: pr * 2, flat: true, layer: 0, sortDist: -0.8, noLight: true, draw: ctx => {
          const a = 0.42 * b * flick(9);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(0, pr); ctx.scale(pr, pr);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(255,130,50,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,90,30,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
        } });
      }
    };
  }
});
