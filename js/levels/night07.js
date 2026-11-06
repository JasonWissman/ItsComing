'use strict';
// ============================================================ 7. THE LIGHTHOUSE ============================================================
// You stand at the rail of the gallery. The thing climbs the outside of the tower, so the lanes go DOWN:
// you only see it by looking over the rail. It moves only while unseen. Get the lamp lit and turning.
LEVELS.push({
  id: 'lighthouse', title: 'The Lighthouse', facing: 315, eyeH: 1.65,
  pal: { skyTop: [10, 12, 22], fog: [50, 56, 70], ground: [44, 50, 62], fogDist: 70 },
  ambient: { wind: 1.6, drone: 0.5, droneFreq: 48, windFreq: 520, rain: 1.0 },
  weather: { kind: 'rain', density: 1.0, wind: 0.8, lightning: [7, 15] },
  text: {
    intro: 'The lamp went out an hour ago. Since then something has been climbing the outside of the tower.<br>You can hear it when you are not looking. Look over the rail.',
    hint: 'The bulb in the big lamp behind you has blown, and there is a spare lying about. Put it in, then turn the crank until the light goes round.',
    objective: 'New bulb in the lamp. Turn the crank.',
    death: { default: 'It came over the rail with its face already turned up to you.' },
    win: 'The beam went round and round. Every time it came past, the thing slid a little further down the wet stone. By morning it was in the water, still looking up.',
    fragment: 'There were scratches on the wardrobe door in the morning, high up, where nobody could reach.',
  },
  lanes: [
    { deg: 0, name: 'below the rail', elev: -65, barrierDist: 0, cue: 'scrape', default: true },
    { deg: 45, name: 'right face', elev: -65, barrierDist: 0, cue: 'scrape' },
    { deg: -45, name: 'left face', elev: -65, barrierDist: 0, cue: 'scrape' },
  ],
  creatures: [{ type: 'climber', startDist: 26, time: 65, seenMult: 0, unseenMult: 1 }],
  aftermath: { type: 'custom' },
  build(L) {
    const s = L.s;
    const AX = 0, AZ = -2.9;                        // the tower's axis: the player stands 2.9 m from it, toes at the rail
    const at = (th, r, y) => [AX + Math.cos(th) * r, y, AZ + Math.sin(th) * r];
    const N = 24, iron = [40, 42, 46], ironL = [62, 64, 70];
    const rad = y => 3.25 + 0.466 * Math.max(0, -y);   // the tower flares out below the gallery, 25 degrees from the vertical
    SC.stars(L, 71, 50, 0.3);
    SC.clouds(L, 72, 8, [30, 34, 46], 0.55);
    // the sea, far below, in rings so the fog is right
    const seaR = [12, 17, 30, 60, 120, 320];
    for (let k = 0; k < seaR.length - 1; k++) for (let i = 0; i < 12; i++) {
      const a0 = i / 12 * TAU, a1 = (i + 1) / 12 * TAU, r0 = seaR[k], r1 = seaR[k + 1], rm = (r0 + r1) / 2;
      SC.quad(L, at(a0, r0, -24.6), at(a1, r0, -24.6), at(a1, r1, -24.6), at(a0, r1, -24.6), k === 0 ? [30, 38, 48] : [18, 26, 36], { dist: Math.hypot(rm, 26.2), layer: 0 });
    }
    const rng = mulberry32(77);
    for (let i = 0; i < 26; i++) {
      const th = rng() * TAU, r = 15.5 + rng() * 12, size = 1.2 + rng() * 2.2, p = at(th, r, -24.6);
      const pts = []; for (let k = 0; k < 7; k++) { const a = Math.PI * (k / 6); pts.push([Math.cos(a) * 0.5 * (0.8 + rng() * 0.3), Math.sin(a) * (0.4 + rng() * 0.6)]); }
      const v = rng() * 20, col = [38 + v, 42 + v, 46 + v];
      SC.sprite(L, p[0], -24.6, p[2], size * 1.3, size, (ctx, P) => { ctx.scale(size * 1.3, size); P_poly(ctx, pts, P.col(col)); }, { dist: Math.hypot(p[0], p[2], 26.3) });
      SC.quad(L, at(th - 0.06, r + 1, -24.55), at(th + 0.06, r + 1, -24.55), at(th + 0.05, r + 2.5, -24.55), at(th - 0.05, r + 2.5, -24.55), [120, 130, 140], { dist: Math.hypot(p[0], p[2], 26.25), alpha: 0.25 });
    }
    // a town across the water: a scatter of lights low on the horizon
    for (let i = 0; i < 16; i++) { const th = (150 + rng() * 60) * DEG, d = 180 + rng() * 60, p = at(th, d, -22 + rng() * 2), w = 0.8 + rng() * 1.2; SC.sprite(L, p[0], p[1], p[2], w, w * 0.7, (ctx, P) => { ctx.scale(w, w * 0.7); P_rect(ctx, -0.5, 0, 1, 1, P.raw([230, 200, 140])); }, { noFog: true, noLight: true, dist: d }); }
    // the tower wall below the gallery, in bands sorted by their true distance from the eye so the climber draws over them
    const edges = [0, -0.7, -1.8, -3.5, -6, -9, -13, -18, -24.6];
    for (let b = 0; b < edges.length - 1; b++) {
      const y0 = edges[b], y1 = edges[b + 1], r0 = rad(y0), r1 = rad(y1), ym = (y0 + y1) / 2, rm = rad(ym), shade = 148 - b * 9;
      for (let i = 0; i < N; i++) {
        const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, am = (a0 + a1) / 2;
        const cx = AX + Math.cos(am) * rm, cz = AZ + Math.sin(am) * rm;
        const opts = { dist: Math.hypot(cx, cz, 1.65 - ym) + 0.7 };
        if (b < 5) { opts.tex = 'stone'; opts.texScale = 2.2; }
        SC.quad(L, at(a0, r0, y0), at(a1, r0, y0), at(a1, r1, y1), at(a0, r1, y1), [shade, shade - 2, shade - 6], opts);
      }
    }
    // the gallery floor, the rail, the lamp room and its roof
    for (let i = 0; i < N; i++) {
      const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, am = (a0 + a1) / 2;
      // the floor sorts by its true distance from the eye, like the tower below it, so it covers the tower where it overhangs
      const fc = at(am, 2.62, 0);
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), at(a1, 3.25, 0), at(a0, 3.25, 0), [58, 60, 64], { tex: 'tin', texScale: 1.6, dist: Math.hypot(fc[0], fc[2], 1.65) });
      SC.quad(L, at(a0, 3.25, 0), at(a1, 3.25, 0), at(a1, 3.25, -0.12), at(a0, 3.25, -0.12), ironL);
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), at(a1, 2.0, 0.85), at(a0, 2.0, 0.85), iron);
      SC.quad(L, at(a0, 2.0, 0.85), at(a1, 2.0, 0.85), at(a1, 2.0, 2.75), at(a0, 2.0, 2.75), [140, 165, 195], { alpha: 0.2 });
      SC.quad(L, at(a0 - 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 2.75), at(a0 - 0.012, 2.02, 2.75), [34, 36, 40]);
      SC.quad(L, at(a0, 2.15, 2.72), at(a1, 2.15, 2.72), at(a1, 2.15, 2.9), at(a0, 2.15, 2.9), iron);
      SC.quad(L, at(a0, 2.15, 2.9), at(a1, 2.15, 2.9), at(am, 0.05, 4.4), at(am, 0.05, 4.4), [30, 32, 36]);
      for (const yy of [0.5, 1.02]) SC.quad(L, at(a0, 3.25, yy), at(a1, 3.25, yy), at(a1, 3.25, yy + 0.05), at(a0, 3.25, yy + 0.05), ironL);
      // rail posts only at every third segment, and none near the three faces it climbs, so none stands between you and it
      const p = at(a0, 3.25, 0), az = Math.atan2(p[0], p[2]);
      if (i % 3 === 0 && [0, 45, -45].every(l => Math.abs(wrapPi(az - l * DEG)) > 22 * DEG)) SC.sprite(L, p[0], 0, p[2], 0.06, 1.07, (ctx, P) => { ctx.scale(0.06, 1.07); P_rect(ctx, -0.5, 0, 1, 1, P.col(ironL)); });
    }
    // stanchions on the lamp room that carry the crank and, on Nightmare, the fuse box
    const FB = 60 * DEG, WD = 120 * DEG;
    for (const th of L.nightmare ? [FB, WD] : [WD]) { const p = at(th, 2.0, 0); SC.box(L, p[0] - 0.19, p[0] + 0.19, 0, 2.75, p[2] - 0.19, p[2] + 0.19, iron); }
    const fb = at(FB, 2.24, 1.06), wd = at(WD, 2.24, 0.78);
    // the lens on its pedestal, inside the glass
    SC.box(L, AX - 0.45, AX + 0.45, 0, 0.9, AZ - 0.45, AZ + 0.45, [50, 50, 56]);
    { const lp = at(100 * DEG, 2.5, 0); STORY.lamp(L, lp[0], 0, lp[2], { scale: 0.8 }); }
    // items
    const decoy = !!L.diff.decoys;
    const spots = [
      { x: at(60 * DEG, 2.7, 0)[0], y: 0, z: at(60 * DEG, 2.7, 0)[2] },
      { x: at(120 * DEG, 2.7, 0)[0], y: 0, z: at(120 * DEG, 2.7, 0)[2] },
      { x: at(40 * DEG, 2.5, 0)[0], y: 0, z: at(40 * DEG, 2.5, 0)[2] },
      { x: at(140 * DEG, 2.5, 0)[0], y: 0, z: at(140 * DEG, 2.5, 0)[2] },
      { x: at(75 * DEG, 3.0, 0)[0], y: 0, z: at(75 * DEG, 3.0, 0)[2] },
      { x: at(108 * DEG, 3.0, 0)[0], y: 0, z: at(108 * DEG, 3.0, 0)[2] },
    ];
    // the lamp's bulb has blown: a spare lies about, and on Nightmare there is no power until a new fuse is in the box
    // (the new fuse is in the tool locker; a blown one lies about as well)
    const needFuse = L.nightmare;
    Object.assign(s, { open: false, bulb: false, fuse: !needFuse, power: false, turning: false, beamA: 0, beamSpeed: 1, crossing: false });
    mkItem(L, 'bulb', 'Bulb', spots, { w: 0.2, h: 0.3, flat: false });
    if (needFuse) mkContainer(L, { id: 'locker', name: 'Tool locker', w: 0.5, h: 0.42, color: [52, 56, 62], spot: spots.slice(0, 4), closedText: 'A tool locker.', emptyText: 'Rags and a tin of grease.', yields: [{ id: 'fuse', name: 'Fuse', opts: { w: 0.26, h: 0.26, flat: false } }] });
    if (needFuse && decoy) mkItem(L, 'oldfuse', 'Fuse', spots, { w: 0.3, h: 0.3, flat: true, icon: 'fuse', decoy: true, decoyText: 'This one is blown as well.' });
    const powerUp = () => { if (!(s.bulb && s.fuse) || s.power) return false; s.power = true; lamp.done = true; setTimeout(() => AUDIO.sfx('lampOn'), 250); return true; };
    // the lamp: the bulb goes in here
    const lamp = mkTarget(L, {
      id: 'lamp', name: 'Lamp', x: AX, y: 0.9, z: AZ, w: 1.1, h: 1.5, accepts: ['bulb'],
      hint() { return s.power ? 'Lit.' : s.bulb ? 'A new bulb in it, and no light: no power. The fuse box.' : 'The big lamp. Its bulb has blown.'; },
      onClick() { if (s.bulb && !s.power) { G.say('The bulb is in, but there is no power. Try the fuse box.', 'The new bulb is in. Still dark.'); return true; } return false; },
      use(item) {
        if (item.id !== 'bulb' || s.bulb) return false;
        s.bulb = true; lamp.accepts = []; AUDIO.sfx('fit');
        if (powerUp()) G.say(s.turning ? 'The lamp comes on.' : 'The lamp comes on. Now turn the crank.', s.turning ? 'Light.' : 'Light. It does not go round.');
        else G.say('The bulb is in. Nothing: there is no power. Try the fuse box.', 'The bulb is in. Nothing.');
        return true;
      },
    });
    // the fuse box (Nightmare): open it, put the new fuse in
    if (needFuse) {
      const box = mkTarget(L, {
        id: 'fusebox', name: 'Fuse box', x: fb[0], y: fb[1] - 0.22, z: fb[2], w: 0.36, h: 0.44, accepts: [],
        hint() { return s.fuse ? 'A good fuse in it.' : !s.open ? 'The fuse box. Shut.' : 'Open. The fuse in it is blown.'; },
        onClick() { if (!s.open) { s.open = true; box.accepts = ['fuse'].concat(decoy ? ['oldfuse'] : []); AUDIO.sfx('creak'); G.say('The fuse in it is black. Blown.', 'A blown fuse.'); return true; } return false; },
        use(item) {
          if (item.id !== 'fuse') return false;
          s.fuse = true; box.accepts = []; box.done = true; AUDIO.sfx('fit');
          if (powerUp()) G.say(s.turning ? 'The lamp comes on.' : 'The lamp comes on. Now turn the crank.', s.turning ? 'Light.' : 'Light. It does not go round.'); else G.say('The new fuse is in. Now the bulb.', 'It goes in. Still dark.');
          return true;
        },
      });
    }
    const need = L.tier(5, 8);
    const winder = mkTarget(L, {
      id: 'winder', name: 'Crank', x: wd[0], y: wd[1] - 0.25, z: wd[2], w: 0.5, h: 0.5,
      crank: { n: need, sfx: 'ratchet', onTurn() { G.shake(0.04); }, onComplete() { s.turning = true; s.beamA = L.creature.yaw + Math.PI; AUDIO.sfx('lever'); G.say(s.power ? 'The light begins to go round.' : 'The lamp goes round, dark.', 'It turns.'); } },
      hint() { return s.turning ? 'Turning.' : 'The crank that turns the lamp. Turn it. ' + Math.max(0, need - Math.floor(winder.count || 0)) + ' more.'; },
    });
    const onLane = () => Math.abs(wrapPi(s.beamA - L.creature.yaw)) < 22.5 * DEG;
    L.isWon = () => s.power && s.turning;
    L.objectiveText = () => (s.power ? 'Lit. ' : (s.bulb ? '' : 'Put the new bulb in the lamp. ') + (s.fuse ? '' : 'Put a new fuse in the fuse box. ')) + (s.turning ? 'Turning.' : 'Turn the crank (' + Math.min(need, Math.floor(winder.count || 0)) + '/' + need + ').');
    L.update = dt => { if (s.turning) s.beamA += dt * TAU / 12 * s.beamSpeed; };
    const lensW = L.pt(AX, 1.9, AZ);
    L.dynamic = () => {
      // the lens: dark glass, or a burning core
      R.add(SC.mkSprite(L, AX, 0.9, AZ, 1.1, 1.5, (ctx, P) => {
        ctx.scale(1.1, 1.5);
        P_ell(ctx, 0, 0.5, 0.42, 0.48, s.power ? P.cola([255, 236, 190], 0.55) : P.col([46, 52, 60]));
        for (let k = 0; k < 5; k++) P_line(ctx, -0.4 + k * 0.2, 0.05, -0.4 + k * 0.2, 0.95, 0.012, P.col([70, 72, 78]));
        if (s.bulb && !s.power) { ctx.save(); ctx.translate(0, 0.32); ctx.scale(0.22, 0.36); ICONS.bulb(ctx, P); ctx.restore(); } // the new bulb, dark
        if (s.power) { const g = ctx.createRadialGradient(0, 0.5, 0.02, 0, 0.5, 0.45); g.addColorStop(0, 'rgba(255,250,225,1)'); g.addColorStop(0.4, 'rgba(255,230,170,0.55)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); }
      }));
      // the beam itself, a long faint wedge, drawn over everything
      if (s.power && s.turning) {
        const A = s.beamA, far = 55, drop = 30;
        for (const [sp, al] of [[0.22, 0.08], [0.09, 0.11]]) {
          R.add({ kind: 'poly', pts: [lensW, [lensW[0] + Math.sin(A - sp) * far, lensW[1] - drop, lensW[2] + Math.cos(A - sp) * far], [lensW[0] + Math.sin(A + sp) * far, lensW[1] - drop, lensW[2] + Math.cos(A + sp) * far]], color: [255, 242, 205], alpha: al, noFog: true, noLight: true, dist: 0.3 });
        }
      }
      // the fuse box and the crank, showing their state
      if (needFuse) R.add(SC.mkSprite(L, fb[0], fb[1] - 0.22, fb[2], 0.36, 0.44, (ctx, P) => {
        ctx.scale(0.36, 0.44);
        P_rect(ctx, -0.5, 0, 1, 1, P.col([74, 76, 84])); P_rect(ctx, -0.44, 0.06, 0.88, 0.88, P.col(s.open ? [24, 24, 28] : [88, 90, 98]));
        if (s.open) { P_rect(ctx, -0.3, 0.4, 0.6, 0.2, P.col([50, 50, 56])); if (s.fuse) { ctx.scale(0.6, 0.5); ctx.translate(0, 0.7); ICONS.fuse(ctx, P); } else P_rect(ctx, -0.16, 0.44, 0.32, 0.12, P.col([20, 16, 14])); }
        else P_ell(ctx, 0.3, 0.5, 0.05, 0.05, P.col([30, 30, 34]));
      }));
      R.add(SC.mkSprite(L, wd[0], wd[1] - 0.25, wd[2], 0.5, 0.5, (ctx, P) => {
        ctx.scale(0.5, 0.5); ctx.translate(0, 0.5); ctx.rotate((winder.count || 0) * 1.1 + (s.turning ? L.t * 0.8 : 0));
        ctx.strokeStyle = P.col([120, 122, 130]); ctx.lineWidth = 0.08; ctx.beginPath(); ctx.arc(0, 0, 0.4, 0, TAU); ctx.stroke();
        for (let k = 0; k < 4; k++) P_line(ctx, 0, 0, Math.cos(k * Math.PI / 2) * 0.4, Math.sin(k * Math.PI / 2) * 0.4, 0.06, P.col([120, 122, 130]));
        P_line(ctx, 0.4, 0, 0.62, 0, 0.12, P.col([110, 80, 50]));
      }));
    };
    L.dynamicLights = () => {
      if (!s.power) return [];
      const out = [{ x: lensW[0], y: lensW[1], z: lensW[2], r: 5.5, i: 0.9, color: [255, 232, 176], flicker: 0.08, seed: 1 }];
      if (s.turning) { const A = s.beamA; out.push({ x: lensW[0], y: lensW[1], z: lensW[2], r: 60, i: 1.6, color: [255, 245, 210], cone: { x: Math.sin(A) * 0.714, y: -0.7, z: Math.cos(A) * 0.714, cos: Math.cos(36 * DEG) } }); }
      return out;
    };
    L.glows = () => s.power ? [{ x: lensW[0], y: lensW[1], z: lensW[2], r: 2.6 + Math.sin(L.t * 7) * 0.1, color: [255, 225, 160], a: 0.3 }] : null;
    // aftermath: the beam goes round faster and every pass slides it further down the wall
    L.aftermath = (t, dt) => {
      const c = L.creature;
      if (!c.distFn) { c.frozen = true; c.slideTo = c.dist; c.distFn = (cr, dt2) => cr.dist + (cr.slideTo - cr.dist) * Math.min(1, dt2 * 5); s.beamSpeed = 3; s.crossing = false; }
      const on = onLane();
      if (on && !s.crossing) { s.crossing = true; c.slideTo += 1.8; AUDIO.sfx('scrape', Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); G.shake(0.2); }
      if (!on) s.crossing = false;
      return t >= 8.5;
    };
    L.floor = { poly: [[-1.4, -0.9], [1.4, -0.9], [1.4, 0.0], [-1.4, 0.0]], y: 0 }; // inside the rail at every facing
  }
});
