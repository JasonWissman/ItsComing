'use strict';
// ============================================================ 5. THE CLEARING ============================================================
// The shotgun where it lies: a card 1.1 m long and 0.2 m high, the gun side on and drawn to its own proportions, its
// lowest points on what holds it. (The shared icon is drawn for a square slot: on the long card it came out a third as
// deep as a gun and hung in the middle of the card, floating over the woodpile and the crate.) On its rack it lies
// level, its barrels on one peg and its stock on the other (CLEARING_GUN.pegs: where, and how high the gun's underside
// is there); put down anywhere else it tips onto its muzzle and the toe of its butt, as a gun does. In a square slot in
// the hand it is the shared shotgun.
const CLEARING_GUN = { w: 1.1, h: 0.2, pegs: [[-0.42, 0.105], [0.33, 0.057]] };
{
  const steel = [76, 78, 86], steelL = [142, 144, 156], steelD = [34, 34, 40];
  const wood = [128, 84, 48], woodL = [172, 124, 76], woodD = [70, 44, 26];
  const gun = tilt => (ctx, P) => {
    const m = ctx.getTransform();
    if (Math.hypot(m.a, m.b) < 2 * Math.hypot(m.c, m.d)) { ICONS.shotgun(ctx, P); return; }   // a square slot, not the long card
    ctx.save();
    ctx.scale(1 / CLEARING_GUN.w, 1 / CLEARING_GUN.h);   // from here on, metres: x -0.55 (the muzzle) to 0.55 (the butt), y 0 to 0.2
    if (tilt) { ctx.translate(0.52, 0.005); ctx.rotate(tilt); ctx.translate(-0.52, -0.005); }   // about the toe of the butt
    // the barrels, the light along the rib on top and the dark line where the two meet
    P_rect(ctx, -0.55, 0.105, 0.7, 0.05, P.col(steel));
    P_rect(ctx, -0.55, 0.143, 0.7, 0.012, P.col(steelL));
    P_rect(ctx, -0.55, 0.125, 0.7, 0.005, P.col(steelD));
    P_rect(ctx, -0.55, 0.105, 0.01, 0.05, P.col(steelD));
    // the fore-end under them
    P_poly(ctx, [[-0.33, 0.108], [-0.03, 0.108], [-0.05, 0.07], [-0.31, 0.078]], P.col(wood));
    P_rect(ctx, -0.31, 0.096, 0.26, 0.007, P.col(woodL));
    // the stock, the light along its comb and the dark butt plate
    P_poly(ctx, [[0.25, 0.155], [0.36, 0.146], [0.55, 0.13], [0.55, 0.005], [0.49, 0.005], [0.36, 0.045], [0.27, 0.075]], P.col(wood));
    P_line(ctx, 0.3, 0.146, 0.52, 0.126, 0.008, P.col(woodL));
    P_rect(ctx, 0.535, 0.005, 0.017, 0.125, P.col(woodD));
    // the action with the hammers on top, the trigger guard and the trigger
    P_rect(ctx, 0.13, 0.07, 0.13, 0.09, P.col(steelD));
    P_poly(ctx, [[0.19, 0.158], [0.215, 0.158], [0.178, 0.19], [0.164, 0.185]], P.col(steelD));
    ctx.strokeStyle = P.col(steelD); ctx.lineWidth = 0.01; ctx.beginPath(); ctx.ellipse(0.205, 0.07, 0.05, 0.034, 0, Math.PI, TAU); ctx.stroke();
    P_line(ctx, 0.2, 0.07, 0.19, 0.046, 0.009, P.col(steelD));
    ctx.restore();
  };
  Object.assign(ICONS, { rackGun: gun(0), restGun: gun(0.093) });
}
LEVELS.push({
  id: 'clearing', title: 'The Clearing', facing: 180, eyeH: 2.0,
  pal: { skyTop: [6, 8, 16], fog: [54, 60, 74], ground: [126, 132, 148], fogDist: 120 },
  ambient: { wind: 1.1, drone: 0.6, droneFreq: 46, windFreq: 420 },
  weather: { kind: 'snow', density: 1, wind: 0.5 },
  lights: [{ x: 1.7, y: 1.7, z: -1.45, r: 6, i: 0.55, color: [255, 190, 110], flicker: 0.15 }],
  text: {
    intro: 'Something has been running the tree line all evening, watching the cabin.<br>Now it is coming for the porch.',
    hint: 'The shotgun is somewhere on the porch, and so are the shells. It takes two hits to put it down. Let it get close before you fire.',
    objective: 'Get the gun. Load it. Wait.',
    death: { default: 'It did not even slow down on the steps.', wounded: 'It got back up faster than you could fire again.' },
    win: 'You sat on the porch with the gun across your knees until it got light, and nothing else came out of the trees. This time.',
    fragment: 'Your shoulder was bruised in the morning, a neat oval, as if you had held something hard against it all night.',
  },
  // it comes at the steps, or round the open side of the porch
  lanes: [
    { deg: 0, name: 'porch steps', barrierDist: 0, cue: 'crack', default: true },
    { deg: 90, name: 'porch side', barrierDist: 0, cue: 'crack' },
  ],
  creatures: [{ type: 'runner', startDist: 115, time: 56, unseenMult: 1.3 }],
  aftermath: { type: 'down', dur: 3.6 },
  uses: [{
    tool: 'shotgun', ammo: 'shells', dudAmmo: 'duds', range: 32, sfx: 'shot', flash: 0.55, emptyText: () => (G.hasItem('duds') ? 'Click. The shell does not go off.' : 'Click.'), fireText: 'Fire.',
    onHit(c, hits, L) {
      if (hits === 1) { c.wounded = true; c.mode = 'stumble'; c.modeT = 0; G.toast('It went down. It is getting back up.'); }
      else { c.dead = true; c.latHold = c.lat; G.toast('It stopped.'); }
    },
    onMiss(L) { const s = G.inv.find(i => i.id === 'shells'); G.toast(s ? 'Too far. The shot went wide.' : 'Too far. That was the last one.'); },
  }],
  build(L) {
    const logs = [60, 44, 32], logsD = [42, 30, 22], porch = [76, 62, 50];
    SC.stars(L, 51, 220, 0.9);
    SC.clouds(L, 52, 4, [26, 30, 44], 0.4);
    SC.moon(L, 150, 21, 6, [220, 224, 235]);
    // the deck: boards running along the cabin. Everything under it (the skirt, the foot of the wall, the steps, which
    // tuck under its edge) is drawn first, in the ground layer, so the deck covers whatever of it is under the boards
    // from wherever you look; drawn after it, the skirt showed through the deck as a dark band along its edge
    SC.floorQ(L, -3.2, -1.6, 3.2, 1.6, 0.35, porch, { tex: 'planks', texScale: 1.3 });
    const under = { layer: 0, sortDist: 6 };
    SC.wallV(L, -3.2, 1.6, 3.2, 1.6, 0, 0.35, logsD, under);
    for (const x of [-3.2, 3.2]) SC.wallV(L, x, -1.6, x, 1.6, 0, 0.35, logsD, under);
    SC.wallV(L, -3.4, -1.6, 3.4, -1.6, 0, 0.35, logs, under);
    SC.box(L, -0.8, 0.8, 0, 0.18, 1.6, 2.2, porch, under);
    SC.box(L, 3.2, 3.8, 0, 0.18, -0.6, 0.6, porch, under);
    // the cabin wall, up to the porch roof (it stopped short of it, and the sky showed through between)
    SC.wallV(L, -3.4, -1.6, 3.4, -1.6, 0.35, 3.2, logs, { tex: 'logs', texScale: 1.0 });
    // the door, in its frame, with a latch; the lit window in its frame (lit from inside: the porch light does not tint it)
    const frame = [66, 50, 36];
    SC.wallV(L, -0.55, -1.58, 0.55, -1.58, 0.35, 2.3, [32, 24, 18]);
    for (const x of [-0.19, 0.175]) SC.wallV(L, x, -1.574, x + 0.015, -1.574, 0.38, 2.27, [22, 16, 12]);
    SC.wallV(L, -0.64, -1.57, -0.55, -1.57, 0.35, 2.39, frame); SC.wallV(L, 0.55, -1.57, 0.64, -1.57, 0.35, 2.39, frame); SC.wallV(L, -0.55, -1.57, 0.55, -1.57, 2.3, 2.39, frame);
    SC.wallV(L, 0.36, -1.57, 0.46, -1.57, 1.1, 1.15, [92, 88, 80]);
    SC.wallV(L, 1.2, -1.58, 2.2, -1.58, 1.3, 2.1, [222, 162, 82], { noFog: true, noLight: true });
    SC.wallV(L, 1.68, -1.57, 1.72, -1.57, 1.3, 2.1, logsD); SC.wallV(L, 1.2, -1.57, 2.2, -1.57, 1.68, 1.72, logsD);
    SC.wallV(L, 1.13, -1.565, 1.2, -1.565, 1.24, 2.17, frame); SC.wallV(L, 2.2, -1.565, 2.27, -1.565, 1.24, 2.17, frame);
    SC.wallV(L, 1.13, -1.565, 2.27, -1.565, 2.1, 2.17, frame); SC.wallV(L, 1.13, -1.565, 2.27, -1.565, 1.24, 1.3, frame);
    for (const x of [-3.0, 3.0]) SC.box(L, x - 0.08, x + 0.08, 0.35, 2.95, 1.42, 1.58, logsD);
    SC.box(L, 3.0, 3.16, 0.35, 2.95, -1.5, -1.34, logsD);
    SC.quad(L, [-3.4, 2.95, 1.75], [3.4, 2.95, 1.75], [3.4, 3.2, -1.6], [-3.4, 3.2, -1.6], [28, 20, 15]);
    // the railings: a post each side of the steps, rails between the posts, and the balusters spaced evenly between
    const rail = (a, b, at) => {   // from a to b along one axis at a fixed other coordinate; at(u) gives [x, z]
      for (const [y0, y1] of [[1.2, 1.3], [0.8, 0.85]]) { const p = at(a), q = at(b); SC.wallV(L, p[0], p[1], q[0], q[1], y0, y1, logsD); }
      const n = Math.max(2, Math.round(Math.abs(b - a) / 0.42));
      for (let i = 1; i < n; i++) { const u = a + (b - a) * i / n, p = at(u - 0.025), q = at(u + 0.025); SC.wallV(L, p[0], p[1], q[0], q[1], 0.36, 1.2, logsD); }
    };
    for (const s of [-1, 1]) {
      SC.box(L, s * 0.9 - 0.05, s * 0.9 + 0.05, 0.35, 1.36, 1.45, 1.55, logsD);
      rail(s * 2.92, s * 0.95, u => [u, 1.5]);
    }
    // the west side of the porch is railed, from the wall to the corner post; the east side is open where the steps down to the yard are
    rail(-1.6, 1.42, u => [-3.0, u]);
    // the woodpile, kept back against the wall and clear of the way it comes round the open side (its arms swung
    // through the old, deeper one), split logs stacked with their cut ends toward you; the lamp at its back corner
    const wood = [72, 54, 38];
    SC.box(L, 2.0, 3.0, 0.35, 1.1, -1.55, -1.0, wood);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
      const y = 0.445 + r * 0.165, z = -1.45 + k * 0.175 + (r % 2 ? 0.015 : -0.005), rad = 0.085 - ((r * 3 + k) % 3) * 0.006, sh = 0.9 + ((r * 7 + k * 5) % 4) * 0.06;
      L.props.push({ kind: 'poly', pts: Array.from({ length: 12 }, (_, i) => { const a = (i + 0.5) / 12 * TAU; return L.pt(1.99, y + Math.cos(a) * rad, z + Math.sin(a) * rad); }), color: scalec([132, 100, 66], sh) });
    }
    for (let r = 1; r < 4; r++) { const y = 0.445 + (r - 0.5) * 0.165; SC.wallV(L, 2.0, -0.99, 3.0, -0.99, y - 0.012, y + 0.012, scalec(wood, 0.5)); }   // the long sides, toward the yard
    STORY.lamp(L, 2.82, 1.1, -1.42, { scale: 0.8 });
    // a crate: boards round the edge of each side you can see, and a brace across
    const crate = [70, 56, 44], slat = [98, 80, 60];
    SC.box(L, -2.98, -2.3, 0.35, 0.85, -1.4, -0.9, crate);
    const slats = (A, B) => {   // a face from corner A to corner B (bottom), seen from the eye's side; pieces 1 cm proud of it
      const P = (u, y) => [A[0] + (B[0] - A[0]) * u, y, A[1] + (B[1] - A[1]) * u], w = 0.07 / Math.hypot(B[0] - A[0], B[1] - A[1]);
      const q = (a, b, c, d) => SC.quad(L, a, b, c, d, slat);
      q(P(0, 0.35), P(1, 0.35), P(1, 0.41), P(0, 0.41)); q(P(0, 0.79), P(1, 0.79), P(1, 0.85), P(0, 0.85));
      q(P(0, 0.41), P(w, 0.41), P(w, 0.79), P(0, 0.79)); q(P(1 - w, 0.41), P(1, 0.41), P(1, 0.79), P(1 - w, 0.79));
      q(P(w, 0.41), P(w + 0.1, 0.41), P(1 - w, 0.79), P(1 - w - 0.1, 0.79));
    };
    slats([-2.29, -0.9], [-2.29, -1.4]); slats([-2.3, -0.89], [-2.98, -0.89]);
    const rng = mulberry32(55);
    for (let i = 0; i < 90; i++) { const a = (rng() - 0.5) * 170 * DEG, d = 105 + rng() * 90; SC.tree(L, Math.sin(a) * d, Math.cos(a) * d, 10 + rng() * 10, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 14; i++) { const x = (rng() < 0.5 ? -1 : 1) * (9 + rng() * 30), z = 6 + rng() * 60; SC.tree(L, x, z, 7 + rng() * 6, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 22; i++) { const x = (rng() - 0.5) * 90, z = -8 - rng() * 45; SC.tree(L, x, z, 9 + rng() * 8, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 40; i++) { const a = (70 + rng() * 40) * DEG, d = 100 + rng() * 90; SC.tree(L, Math.sin(a) * d, Math.cos(a) * d, 10 + rng() * 10, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 12; i++) { const x = 10 + rng() * 60, z = (rng() < 0.5 ? -1 : 1) * (4 + rng() * 22); SC.tree(L, x, z, 7 + rng() * 6, 'fir', (rng() * 1e6) | 0); }
    for (let i = 0; i < 14; i++) { const x = (rng() - 0.5) * 50, z = 4 + rng() * 40; if (Math.abs(x) < 1.5) continue; SC.boulder(L, x, z, 0.3 + rng() * 0.5, (rng() * 1e6) | 0); }
    // the gun: on a rack of two pegs out of the wall (the barrels on one, the stock on the other), or lying side on
    // across the woodpile or the crate; its icon is the one that fits where it lies (see the top of the file).
    // The gun is a card square to the view, so seen from the side its length runs across the wall at a slant: each peg
    // goes where the gun's underside meets the wall as seen from the eye, facing the gun's way (the nearest of the eight
    // directions)
    const pegs = (L, sp) => {
      const yaw = Math.round(Math.atan2(sp.x, sp.z) / (45 * DEG)) * 45 * DEG, ux = Math.cos(yaw), uz = -Math.sin(yaw);
      for (const [dx, top] of CLEARING_GUN.pegs) {
        const qx = sp.x + dx * ux, qz = sp.z + dx * uz, qy = sp.y + top, k = -1.535 / qz, x = qx * k, y = L.eyeH + (qy - L.eyeH) * k;
        SC.box(L, x - 0.04, x + 0.04, y - 0.05, y, -1.6, -1.535, [100, 78, 54]);   // pale against the logs; its end just behind the gun, so the gun is drawn over it
      }
    };
    const onPegs = (L, sp) => { pegs(L, sp); L.s.gunRest = 'rackGun'; }, lying = L => { L.s.gunRest = 'restGun'; };
    const gun = mkItem(L, 'shotgun', 'Shotgun', [
      { x: 0, y: 2.42, z: -1.52, setup: onPegs },        // on pegs above the door
      { x: 1.6, y: 2.24, z: -1.52, setup: onPegs },      // on pegs above the window
      { x: -1.3, y: 1.9, z: -1.52, setup: onPegs },      // on pegs left of the door
      { x: 2.45, y: 1.1, z: -1.27, key: 'woodpile', setup: lying },   // lying on the woodpile
      { x: -2.64, y: 0.85, z: -1.15, key: 'crate', setup: lying },    // lying on the crate
    ], { w: CLEARING_GUN.w, h: CLEARING_GUN.h, tool: true });
    gun.icon = ICONS[L.s.gunRest];
    const shellSpots = [
      { deg: 90, dist: 1.5, y: 0.36 },                  // porch floor, right
      { x: -1.4, y: 0.36, z: 0.4 },                     // porch floor, left
      { x: 0.7, y: 0.36, z: -1.2 },                     // by the door
      { x: -2.65, y: 0.85, z: -1.15, jitter: 0.04, key: 'crate' },  // on the crate
      { x: 2.45, y: 1.1, z: -1.24, jitter: 0.05, key: 'woodpile' }, // on the woodpile
      { x: -2.2, y: 0.36, z: 1.2 },                     // porch floor, far left
    ];
    // shells: one box; on Nightmare two, and one of them is duds
    mkItem(L, 'shells', 'Shells', shellSpots, { w: 0.3, h: 0.3, flat: true, uses: 3, tool: true }); // three: a spare, since out-of-range shots waste on Nightmare
    if (L.nightmare) mkItem(L, 'duds', 'Shells', shellSpots, { w: 0.3, h: 0.3, flat: true, uses: 3, tool: true, icon: 'shells' }); // the same count as the real box, so the label gives nothing away
    L.floor = { poly: [[-3.1, -1.5], [3.1, -1.5], [3.1, 1.5], [-3.1, 1.5]], y: 0.36 };
    const box = id => id === 'shells' || id === 'duds'; // the dud box clicks in like the real one
    L.onPickup = it => { if ((it.id === 'shotgun' && (G.hasItem('shells') || G.hasItem('duds'))) || (box(it.id) && G.hasItem('shotgun'))) AUDIO.sfx('load'); };
    L.onDrop = it => { if (it.id === 'shotgun') it.icon = ICONS.restGun; };   // put down, it lies on the boards
    // it stands on what is under its feet: the ground its way runs along, then the step, then the deck. The renderer
    // and the gaze take the height from yOff; c.stand is kept for the lunge, which starts from there (see the runner)
    const standOn = (x, z) => (Math.abs(x) <= 3.2 && Math.abs(z) <= 1.6 ? 0.35 : (Math.abs(x) <= 0.8 && z > 1.6 && z <= 2.2) || (x > 3.2 && x <= 3.8 && Math.abs(z) <= 0.6) ? 0.18 : 0);
    L.update = () => { const c = L.creature, p = c.pos(), q = rotY(p.x, p.z, -L.facing); c.stand = standOn(q[0], q[1]); c.yOff = c.stand; };
    L.deathCause = c => (c.wounded ? 'wounded' : 'default');
    L.isWon = () => L.creature.dead;
    L.objectiveText = () => { const s = G.inv.filter(i => i.id === 'shells').reduce((a, i) => a + i.uses, 0); return L.creature.dead ? 'It is down.' : !G.hasItem('shotgun') ? 'Get the gun.' : !s ? 'Find the shells.' : (s + ' shell' + (s > 1 ? 's' : '') + '. Let it get close.'); };
  }
});
