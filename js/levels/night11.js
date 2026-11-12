'use strict';
// ============================================================ 11. THE FARM ============================================================
// Night on the farm. You stand in the yard by the electrical box on its post, the house at your back with its porch light
// on. All round you, at the eight points of the compass but the one behind you, are the farm's places, each with a
// floodlight of its own, all of them dark: the tractor shed (SW), the shed (W), the stables (NW), the barn (N), the silo
// (NE), the coop (E) and the driveway (SE). They go round you in a ring, so each has a neighbour on either side; the
// driveway's and the tractor shed's meet behind the house.
// The thing is out there in the dark at one of them, in the shadow at its foot, two pale points of eyes. It cannot stand
// the light. Light the place it is at and it throws an arm over its face and runs, side on, to a neighbouring place that
// is dark. Light the places either side of it first, and then its own, and it has nowhere dark to go: it shrieks, its
// knees go, and it comes apart in the light.
// The box takes three lights at once. Throw a fourth and the fuse blows: a bang and sparks, every light on the farm goes
// out, the switches all drop back to off, and for a few seconds the box is dead while it comes for you in the dark. Then
// the breaker clicks back in with everything off.
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
  laneSwitch: false,   // it changes places only by running from the light (build)
  pal: { skyTop: [5, 7, 17], fog: [24, 28, 40], ground: [20, 24, 18], fogDist: 125 },
  ambient: { wind: 0.9, drone: 0.6, droneFreq: 44, windFreq: 300 },
  text: {
    intro: 'The lights are out across the farm. Something is out there in the dark.',
    death: { default: 'It came for you in the dark.', fuse: 'The fuse blew. In the dark, it came for you.' },
    win: 'It came apart in the light. In the morning there was only sacking and straw in the yard.',
    fragment: 'There is straw in the fuse box every morning, and you have never kept straw.',
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
    // the ground: rings round you cut into sectors (finer near you). Gravel round you in the yard, a worn track out to
    // each place, grass beyond. It takes no light of its own: the porch light's pool is laid on it tile by tile (GROUND,
    // coloured in L.update from how much of that light reaches each), and each place's light is a pool of its own laid
    // over it (pools, below)
    const GROUND = [];
    {
      const RR = [0, 1.6, 3.2, 5, 7, 9.5, 12.5, 16, 20, 25, 31, 38, 47, 60, 80, 115], rng = mulberry32(1107);
      for (let j = 0; j + 1 < RR.length; j++) {
        const STEP = RR[j] < 12 ? 7.5 : 15;
        for (let i = 0; i < 360 / STEP; i++) {
          const a0 = (i * STEP - STEP / 2) * DEG, a1 = a0 + STEP * DEG, am = (a0 + a1) / 2, r0 = RR[j], r1 = RR[j + 1], rm = (r0 + r1) / 2;
          const v = (rng() - 0.5) * 4;
          let col = [36 + v, 44 + v, 28 + v * 0.6];                                                               // grass
          if (rm < 8.5) col = [58 + v, 54 + v, 46 + v];                                                           // the yard's gravel
          else for (const p of RING) if (Math.abs(wrapPi(am - p.yaw)) < 0.07 && rm < p.front + 1) col = [54 + v, 46 + v, 36 + v];   // the track out to it
          if (Math.abs(wrapPi(am - Math.PI)) < 0.07 && rm < 8.5) col = [64 + v, 60 + v, 52 + v];                  // the path to the porch
          const pt = (a, r) => [Math.sin(a) * r, 0, Math.cos(a) * r];
          const g = poly(r0 > 0 ? [pt(a0, r0), pt(a0, r1), pt(a1, r1), pt(a1, r0)] : [pt(a0, r1), pt(a1, r1), [0, 0, 0]], col, { layer: 0, noLight: true });
          g.base = col; g.samples = [[am, rm], [lerp(a0, a1, 0.2), lerp(r0, r1, 0.2)], [lerp(a0, a1, 0.8), lerp(r0, r1, 0.2)], [lerp(a0, a1, 0.2), lerp(r0, r1, 0.8)], [lerp(a0, a1, 0.8), lerp(r0, r1, 0.8)]].map(([a, r]) => W(Math.sin(a) * r, 0, Math.cos(a) * r));
          GROUND.push(g);
        }
      }
    }
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
      }, { sortDist: 7.4 });
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
      });
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
      });
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

    // the porch light's pool on the ground round you: how much of it reaches each tile of the ground (L.update colours them)
    for (const g of GROUND) g.hk = g.samples.reduce((a, q) => a + lightAt(houseLights, q.x, 0, q.z), 0) / g.samples.length;
    const PORCH_COL = houseLights[0].color;
    const groundLight = () => {
      const amb = L.pal.ambient, on = houseLit();
      for (const g of GROUND) {
        const b = g.base, k = on ? Math.min(1.8, g.hk) : 0;
        if (k < 0.004) { g.color = [b[0] * amb, b[1] * amb, b[2] * amb]; continue; }
        const m = Math.min(0.55, 0.45 * k), br = 1 + 0.9 * k;
        g.color = [0, 1, 2].map(q => Math.min(255, (b[q] * amb + (PORCH_COL[q] - b[q] * amb) * m) * br));
      }
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
    // On its post in front of you, at your waist: a grey steel box with a rain hood, its door swung right back on its
    // hinges to the left. Inside, the main fuse in its holder at the top, and two rows of four big toggle switches, each
    // with a red pilot lamp and a strip of tape under it with the place written on it in marker. Up is on. A little lamp
    // in the top of the box lights its inside while there is power (the panel is lit by it alone).
    const BZ = 1.0, BY = 0.5, BW = 0.5, BH = 0.6, PY = BY + 0.02, PW = 0.46, PH = 0.56;
    const steel = [66, 74, 70];
    SC.box(L, -0.04, 0.04, 0, BY, BZ + 0.06, BZ + 0.14, [50, 52, 50]);                    // the post
    SC.box(L, 0.12, 0.16, 0, BY, BZ + 0.04, BZ + 0.08, [40, 42, 42]);                     // the conduit down into the ground
    SC.box(L, -BW / 2, BW / 2, BY, BY + BH, BZ, BZ + 0.2, steel);
    poly([[-BW / 2 - 0.02, BY + BH + 0.005, BZ - 0.03], [BW / 2 + 0.02, BY + BH + 0.005, BZ - 0.03], [BW / 2 + 0.02, BY + BH + 0.05, BZ + 0.21], [-BW / 2 - 0.02, BY + BH + 0.05, BZ + 0.21]], scalec(steel, 0.85));   // the rain hood
    {   // the door, swung right back on its hinges at the left, its inside toward you
      const a = 162 * DEG, ex = -BW / 2 + BW * Math.cos(a), ez = BZ - BW * Math.sin(a);
      poly([[-BW / 2, BY, BZ], [ex, BY, ez], [ex, BY + BH, ez], [-BW / 2, BY + BH, BZ]], scalec(steel, 0.9), { sortDist: BZ + 0.05 });
    }
    const LABELS = ['HOUSE'].concat(RING.map(p => p.label));
    const COLS = [-0.165, -0.055, 0.055, 0.165], ROWS = [0.33, 0.15];
    const swAt = i => [COLS[i % 4], ROWS[Math.floor(i / 4)]];
    const HANDF = "bold 42px 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Chalkboard SE', 'Liberation Sans', Arial, sans-serif";
    // how far up a switch's lever stands (1 up, on; 0 down, off): flipped over quickly, all dropping at once when the fuse
    // goes, and a click on a dead box pushing it up only for it to fall straight back
    const lever = i => {
      const ft = L.t - s.flipAt[i], want = s.on[i] ? 1 : 0;
      if (L.t - s.deadAt[i] < 0.35) { const u = (L.t - s.deadAt[i]) / 0.35; return Math.sin(Math.PI * u) * 0.8; }
      if (L.t - s.dropAt < 0.12 && s.wasOn[i]) return 1 - (L.t - s.dropAt) / 0.12;
      return ft < 0.08 ? lerp(1 - want, want, ft / 0.08) : want;
    };
    // the box's own little lamp: on with the power, flickering up as the breaker comes back in
    const boxLamp = () => { if (!s.power) return 0.16; const k = L.t - s.backAt; return k < 0.3 ? (Math.sin(k * 90) > 0 ? 0.85 : 0.3) : 0.85; };
    SC.sprite(L, 0, PY, BZ - 0.005, PW, PH, (ctx, P) => {
      const b = boxLamp(), C = c => P.col(scalec(c, b));
      const plate = C([150, 154, 146]), dark = C([30, 32, 32]), chrome = C([220, 224, 226]), tape = C([226, 212, 168]), ink = C([22, 20, 32]);
      P_rect(ctx, -PW / 2, 0, PW, PH, C(scalec(steel, 0.7)));
      P_rect(ctx, -0.205, 0.02, 0.41, 0.52, plate);
      const g = ctx.createLinearGradient(0, PH, 0, 0); g.addColorStop(0, 'rgba(255,250,230,' + (0.12 * b).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,' + (0.25).toFixed(3) + ')');
      ctx.fillStyle = g; ctx.fillRect(-0.205, 0.02, 0.41, 0.52);   // the lamp at the top: brighter up there, falling off down the panel
      // the main fuse: a ceramic holder, the cartridge in its clips; once it has blown, soot all round it
      P_rect(ctx, -0.1, 0.44, 0.2, 0.08, C([216, 210, 196]));
      if (s.blows) P_ell(ctx, 0, 0.48, 0.13 + 0.01 * Math.min(3, s.blows), 0.05, P.cola([20, 18, 16], 0.75));
      P_rect(ctx, -0.065, 0.465, 0.13, 0.03, s.blows ? C([46, 36, 26]) : C([176, 136, 76]));
      for (const x of [-0.07, 0.055]) P_rect(ctx, x, 0.46, 0.015, 0.04, C([196, 166, 92]));
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
    }, { sortDist: BZ - 0.02, noLight: true });
    // the switches: each a target on the panel, over its lever and its tape
    LABELS.forEach((lab, i) => {
      const [cx, ry] = swAt(i);
      mkTarget(L, {
        id: 'sw' + i, name: lab.charAt(0) + lab.slice(1).toLowerCase(), x: cx, y: PY + ry - 0.075, z: BZ - 0.012, w: 0.1, h: 0.13,
        onClick() { flip(i); return true; },
      });
    });

    // ---------------- the state of things ----------------
    const BLACKOUT = 5;   // how long the box is dead once the fuse has gone
    Object.assign(s, { on: [true, false, false, false, false, false, false, false], wasOn: [], power: true, blows: 0, blownAt: -99, dropAt: -99,
      flipAt: Array(8).fill(-9), litAt: Array(8).fill(-9), backAt: -9, deadAt: Array(8).fill(-9), sparks: [], smoke: [], k: null, r: null, run: null, flinch: null, back: null, flushes: 0, trapped: false, ring: N, edge: EDGE, hideAt: RING.map(p => p.hide) });
    const lit = k => s.power && s.on[k + 1];
    const houseLit = () => s.power && s.on[0];
    const countOn = () => s.on.filter(Boolean).length;
    const nb = k => [(k + N - 1) % N, (k + 1) % N];
    L.nb = nb;   // (for the tests)
    const fxr = mulberry32((G.runSeed * 31 + 1111) >>> 0);
    const BOXP = W(0, PY + 0.48, BZ - 0.02);   // the main fuse
    const blow = () => {
      s.wasOn = s.on.slice(); s.on.fill(false); s.power = false; s.blows++; s.blownAt = s.dropAt = L.t;
      AUDIO.sfx('fuseBlow'); G.shake(0.55); G.flash(0.3);
      for (let i = 0; i < 34; i++) { const a = fxr() * TAU, v = 0.8 + fxr() * 2.2; s.sparks.push({ x: BOXP.x, y: BOXP.y, z: BOXP.z - 0.02, vx: Math.cos(a) * v * 0.7, vy: 0.6 + fxr() * 2.4, vz: -Math.abs(Math.sin(a)) * v * 0.6, age: 0, life: 0.5 + fxr() * 0.7 }); }
      for (let i = 0; i < 7; i++) s.smoke.push({ x: BOXP.x + (fxr() - 0.5) * 0.1, y: BOXP.y + 0.05, z: BOXP.z - 0.05, age: -i * 0.12, r: 0.06 + fxr() * 0.05 });
      G.say('The fuse blows. Every light on the farm goes out.', 'The fuse blows.');
    };
    const flip = i => {
      if (L.won || G.state !== 'play') return;
      if (!s.power) {   // the box is dead: the lever goes up, nothing comes on, and it drops back
        s.deadAt[i] = L.t; AUDIO.sfx('switch');
        if (fxr() < 0.5) s.sparks.push({ x: BOXP.x + swAt(i)[0], y: PY + swAt(i)[1], z: BZ - 0.03, vx: (fxr() - 0.5) * 0.6, vy: 0.4, vz: -0.3, age: 0, life: 0.25 });
        G.say('Nothing comes on.', 'Nothing.');
        return;
      }
      s.on[i] = !s.on[i]; s.flipAt[i] = L.t;
      AUDIO.sfx('switch'); AUDIO.sfx('clunk');
      if (s.on[i] && countOn() >= 4) { blow(); return; }
      if (s.on[i]) { s.litAt[i] = L.t; AUDIO.sfx('tubeOn'); }
    };
    L.flip = flip;   // (for the tests)

    // ---------------- the thing ----------------
    // It is always on a way of its own that turns to where it is (so it can run round you between the places); its
    // distance is s.r. At its place, in the dark: still at first, then creeping in toward you, no nearer than the edge of
    // the porch light while that is on, and all the way while it is not. Its place lit: it flinches and runs to a dark
    // neighbour, or, with both of them lit, it is caught.
    const CREEP = { wait: 5, lit: 0.2, dark: 0.62, blackout: 2.4, back: 2.6 };
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
      const blackout = !s.power, seen = c.seen && !blackout;
      const edge = EDGE[s.k], target = houseLit() ? edge : 0;
      if (s.back) {   // the porch light came on with it inside it: it rears back and backs off to its edge
        s.back.t += dt; c.recoil = s.back.t < 0.5 ? Math.min(1, s.back.t / 0.12) : Math.max(0, 1 - (s.back.t - 0.5) / 0.2);
        if (s.back.t > 0.3) s.r = Math.min(edge, s.r + CREEP.back * dt);
        if (!houseLit() || (s.r >= edge && s.back.t > 0.7)) { s.back = null; c.recoil = 0; }
        return;
      }
      if (houseLit() && s.r < edge - 0.05) { s.back = { t: 0 }; AUDIO.sfx('hiss', panTo(c.yaw)); return; }
      const v = blackout ? CREEP.blackout : (houseLit() ? (L.t < CREEP.wait ? 0 : CREEP.lit) : CREEP.dark) * (seen ? 1 : c.unseenMult);
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
      if (s.k === null) {   // the start: at the foot of its place; and you, facing the box
        s.k = c.lane.idx; c.D0 = RING[s.k].hide;
        way = Object.assign({}, L.lanes[s.k], { apertures: [], blockers: [], name: 'round the yard' });
        c.lane = way; place(c, RING[s.k].yaw, RING[s.k].hide); c.dist = s.r;
        c.distFn = () => s.r; c.shade = 1;
        Object.assign(G.cam, { dirIdx: 0, yaw: 0, tYaw: 0, pitch: 0, tPitch: 0 });
      }
      if (!s.power && L.t - s.blownAt >= BLACKOUT) { s.power = true; s.backAt = L.t; AUDIO.sfx('clunk'); AUDIO.sfx('lever'); G.say('The breaker clicks back in. Everything is off.', 'The power is back.'); }
      if (!L.won && G.state === 'play') step(c, dt);
      c.u = clamp(1 - s.r / c.D0, 0, 1);
      c.shade += (shadeOf(c) - c.shade) * Math.min(1, dt * 7);
      // the ambient dark: a little darker still with the fuse gone
      const amb = s.power ? 0.42 : 0.32;
      L.pal.ambient += (amb - L.pal.ambient) * Math.min(1, dt * 6);
      groundLight();
      // the sparks and the smoke from the box
      for (const p of s.sparks) { p.age += dt; p.vy -= 9.8 * dt; p.x += p.vx * dt; p.y = Math.max(0.01, p.y + p.vy * dt); p.z += p.vz * dt; }
      s.sparks = s.sparks.filter(p => p.age < p.life);
      for (const p of s.smoke) { p.age += dt; if (p.age > 0) { p.y += dt * 0.35; p.r += dt * 0.12; } }
      s.smoke = s.smoke.filter(p => p.age < 2.6);
    };
    L.isWon = () => s.trapped;
    L.deathCause = () => (L.t - s.blownAt < BLACKOUT + 8 ? 'fuse' : 'default');
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
    L.watchPoint = () => { const c = L.creature, p = c.pos(); return { x: p.x, y: 0.7, z: p.z, zoom: clamp(s.r / 5.5, 1.35, 4) }; };

    // ---------------- light ----------------
    const lights = [];
    L.dynamicLights = () => {
      lights.length = 0;
      if (houseLit()) lights.push(houseLights[0], houseLights[1]);
      for (let k = 0; k < N; k++) if (lit(k)) lights.push(lightsOf[k][0], lightsOf[k][1]);
      if (L.t - s.blownAt < 0.25) lights.push(Object.assign(W(0, PY + 0.5, BZ - 0.2), { r: 6, i: 1.6 * (1 - (L.t - s.blownAt) / 0.25), color: [210, 220, 255] }));
      return lights;
    };
    const glows = [];
    L.glows = () => {
      glows.length = 0;
      if (houseLit()) { glows.push(Object.assign({}, HOUSE.lamp, { r: 0.9, color: [255, 210, 150], a: 0.55 }), Object.assign({}, HOUSE.lamp, { r: 3.2, color: [255, 190, 120], a: 0.12 })); }
      for (let k = 0; k < N; k++) if (lit(k)) { const l = PLACE[k].lamp; glows.push({ x: l.x, y: l.y, z: l.z, r: 1.3, color: [255, 236, 200], a: 0.6 }, { x: l.x, y: l.y, z: l.z, r: 5, color: [255, 214, 150], a: 0.14 }); }
      if (L.t - s.blownAt < 0.4) glows.push({ x: BOXP.x, y: BOXP.y, z: BOXP.z, r: 0.5, color: [220, 230, 255], a: 0.9 * (1 - (L.t - s.blownAt) / 0.4) });
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
