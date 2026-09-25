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
    hint: 'The fuse box is on the lamp room, behind you. The clockwork wants winding.',
    objective: 'Get the light turning.',
    death: { default: 'It came over the rail with its face already turned up to you.' },
    win: 'The beam went round and round. Every time it came past, the thing slid a little further down the wet stone. By morning it was in the water, still looking up.',
    fragment: 'There were scratches on the wardrobe door in the morning, high up, where nobody could reach.',
  },
  lanes: [
    { deg: 0, name: 'below the rail', elev: -65, barrierDist: 0, default: true },
    { deg: 45, name: 'right face', elev: -65, barrierDist: 0 },
    { deg: -45, name: 'left face', elev: -65, barrierDist: 0 },
  ],
  creatures: [{ type: 'climber', startDist: 26, time: 65, gamma: 0.8, seenMult: 0, unseenMult: 1 }],
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
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), at(a1, 3.25, 0), at(a0, 3.25, 0), [58, 60, 64], { tex: 'tin', texScale: 1.6, layer: 0 });
      SC.quad(L, at(a0, 3.25, 0), at(a1, 3.25, 0), at(a1, 3.25, -0.12), at(a0, 3.25, -0.12), ironL);
      SC.quad(L, at(a0, 2.0, 0), at(a1, 2.0, 0), at(a1, 2.0, 0.85), at(a0, 2.0, 0.85), iron);
      SC.quad(L, at(a0, 2.0, 0.85), at(a1, 2.0, 0.85), at(a1, 2.0, 2.75), at(a0, 2.0, 2.75), [140, 165, 195], { alpha: 0.2 });
      SC.quad(L, at(a0 - 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 0.85), at(a0 + 0.012, 2.02, 2.75), at(a0 - 0.012, 2.02, 2.75), [34, 36, 40]);
      SC.quad(L, at(a0, 2.15, 2.72), at(a1, 2.15, 2.72), at(a1, 2.15, 2.9), at(a0, 2.15, 2.9), iron);
      SC.quad(L, at(a0, 2.15, 2.9), at(a1, 2.15, 2.9), at(am, 0.05, 4.4), at(am, 0.05, 4.4), [30, 32, 36]);
      for (const yy of [0.5, 1.02]) SC.quad(L, at(a0, 3.25, yy), at(a1, 3.25, yy), at(a1, 3.25, yy + 0.05), at(a0, 3.25, yy + 0.05), ironL);
      const p = at(a0, 3.25, 0);
      SC.sprite(L, p[0], 0, p[2], 0.06, 1.07, (ctx, P) => { ctx.scale(0.06, 1.07); P_rect(ctx, -0.5, 0, 1, 1, P.col(ironL)); });
    }
    // stanchions on the lamp room that carry the fuse box, the clockwork and the brake
    const FB = 60 * DEG, WD = 120 * DEG, BK = 97 * DEG;
    for (const th of [FB, WD, BK]) { const p = at(th, 2.0, 0); SC.box(L, p[0] - 0.19, p[0] + 0.19, 0, 2.75, p[2] - 0.19, p[2] + 0.19, iron); }
    const fb = at(FB, 2.24, 1.06), wd = at(WD, 2.24, 0.78), bk = at(BK, 2.24, 1.45);
    // the lens on its pedestal, inside the glass
    SC.box(L, AX - 0.45, AX + 0.45, 0, 0.9, AZ - 0.45, AZ + 0.45, [50, 50, 56]);
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
    Object.assign(s, { open: false, power: false, turning: false, beamA: 0, locked: false, wrongLock: 0, beamSpeed: 1, needBrake: L.diff.tier >= 2, crossing: false });
    if (!s.needBrake) mkItem(L, 'fuse', 'Fuse', spots, { w: 0.3, h: 0.3, flat: true });
    else {
      mkItem(L, 'fusebody', 'Blown fuse', spots, { w: 0.3, h: 0.3, flat: true });
      mkContainer(L, { id: 'locker', name: 'Tool locker', w: 0.5, h: 0.42, color: [52, 56, 62], spot: spots.slice(0, 4), closedText: 'A tool locker.', emptyText: 'Rags and a tin of grease.', yields: [{ id: 'wire', name: 'Fuse wire', opts: { w: 0.26, h: 0.26, flat: false } }] });
      mkRecipe(L, { parts: ['fusebody', 'wire'], result: { id: 'fuse', name: 'Fuse', opts: { w: 0.3, h: 0.3 } }, sfx: 'fit', text: 'A fuse, of a sort.' });
    }
    if (decoy) mkItem(L, 'oldfuse', 'Fuse', spots, { w: 0.3, h: 0.3, flat: true, icon: 'fuse', decoy: true, decoyText: 'This one is blown as well.' });
    // the fuse box: open it, fit the fuse
    const box = mkTarget(L, {
      id: 'fusebox', name: 'Fuse box', x: fb[0], y: fb[1] - 0.22, z: fb[2], w: 0.36, h: 0.44, accepts: [],
      hint() { return s.power ? 'Live.' : !s.open ? 'The fuse box. Shut.' : 'Open. The fuse holder is empty.'; },
      onClick() { if (!s.open) { s.open = true; box.accepts = ['fuse'].concat(decoy ? ['oldfuse'] : []); AUDIO.sfx('creak'); G.say('The fuse holder is empty.', 'Empty.'); return true; } return false; },
      use(item) { if (item.id !== 'fuse') return false; s.power = true; box.accepts = []; box.done = true; AUDIO.sfx('fit'); setTimeout(() => AUDIO.sfx('lampOn'), 250); G.say('The lamp comes on. Now it has to turn.', 'Light.'); return true; },
    });
    const need = L.tier(5, 5, 8);
    const winder = mkTarget(L, {
      id: 'winder', name: 'Clockwork', x: wd[0], y: wd[1] - 0.25, z: wd[2], w: 0.5, h: 0.5,
      crank: { n: need, sfx: 'ratchet', onTurn() { G.shake(0.04); }, onComplete() { s.turning = true; s.beamA = L.creature.yaw + Math.PI; AUDIO.sfx('lever'); G.say(s.power ? 'The lens begins to turn.' : 'The lens turns, dark.', 'It turns.'); } },
      hint() { return s.turning ? 'Turning.' : 'The clockwork that turns the lens. Wind it. ' + Math.max(0, need - Math.floor(winder.count || 0)) + ' more.'; },
    });
    const onLane = () => Math.abs(wrapPi(s.beamA - L.creature.yaw)) < 22.5 * DEG;
    s.beamOnLane = onLane;
    if (s.needBrake) mkTarget(L, {
      id: 'brake', name: 'Brake lever', x: bk[0], y: bk[1] - 0.22, z: bk[2], w: 0.3, h: 0.45,
      hint() { return s.locked ? 'On. The beam is held on it.' : s.wrongLock > 0 ? 'On. The beam is held on the wrong side.' : 'The brake. Pull it when the beam is on it.'; },
      onClick() {
        if (!s.turning || !s.power) { G.say('Nothing is turning.', 'Not yet.'); AUDIO.sfx('nope'); return true; }
        if (s.locked || s.wrongLock > 0) { G.say('The brake is on.', 'Stuck.'); AUDIO.sfx('nope'); return true; }
        AUDIO.sfx('lever'); G.shake(0.15);
        if (onLane()) { s.locked = true; G.toast('The beam stops on it.'); }
        else { s.wrongLock = 12; G.say('The beam is held on the wrong face. It will be a while before the brake lets go.', 'Wrong.'); }
        return true;
      },
    });
    L.isWon = () => s.power && s.turning && (!s.needBrake || s.locked);
    L.objectiveText = () => (s.power ? 'Lit. ' : !s.open ? 'Find the fuse. Open the fuse box. ' : 'Fit the fuse. ') + (s.turning ? 'Turning.' : 'Wind the clockwork (' + Math.min(need, Math.floor(winder.count || 0)) + '/' + need + ').') + (s.needBrake && s.turning && s.power ? (s.locked ? ' Held on it.' : ' Pull the brake when the beam is on it.') : '');
    L.update = dt => {
      if (s.wrongLock > 0) { s.wrongLock -= dt; if (s.wrongLock <= 0) { s.wrongLock = 0; AUDIO.sfx('clunk'); G.say('The brake lets go. The beam moves again.', 'It moves again.'); } }
      if (s.turning && !s.locked && s.wrongLock <= 0) s.beamA += dt * TAU / 12 * s.beamSpeed;
      if (s.locked) s.beamA = L.creature.yaw;
    };
    const lensW = L.pt(AX, 1.9, AZ);
    L.dynamic = () => {
      // the lens: dark glass, or a burning core
      R.add(SC.mkSprite(L, AX, 0.9, AZ, 1.1, 1.5, (ctx, P) => {
        ctx.scale(1.1, 1.5);
        P_ell(ctx, 0, 0.5, 0.42, 0.48, s.power ? P.cola([255, 236, 190], 0.55) : P.col([46, 52, 60]));
        for (let k = 0; k < 5; k++) P_line(ctx, -0.4 + k * 0.2, 0.05, -0.4 + k * 0.2, 0.95, 0.012, P.col([70, 72, 78]));
        if (s.power) { const g = ctx.createRadialGradient(0, 0.5, 0.02, 0, 0.5, 0.45); g.addColorStop(0, 'rgba(255,250,225,1)'); g.addColorStop(0.4, 'rgba(255,230,170,0.55)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-0.5, 0, 1, 1); }
      }));
      // the beam itself, a long faint wedge, drawn over everything
      if (s.power && s.turning) {
        const A = s.beamA, far = 55, drop = 30;
        for (const [sp, al] of [[0.22, 0.08], [0.09, 0.11]]) {
          R.add({ kind: 'poly', pts: [lensW, [lensW[0] + Math.sin(A - sp) * far, lensW[1] - drop, lensW[2] + Math.cos(A - sp) * far], [lensW[0] + Math.sin(A + sp) * far, lensW[1] - drop, lensW[2] + Math.cos(A + sp) * far]], color: [255, 242, 205], alpha: al, noFog: true, noLight: true, dist: 0.3 });
        }
      }
      // the fuse box, the clockwork and the brake, showing their state
      R.add(SC.mkSprite(L, fb[0], fb[1] - 0.22, fb[2], 0.36, 0.44, (ctx, P) => {
        ctx.scale(0.36, 0.44);
        P_rect(ctx, -0.5, 0, 1, 1, P.col([74, 76, 84])); P_rect(ctx, -0.44, 0.06, 0.88, 0.88, P.col(s.open ? [24, 24, 28] : [88, 90, 98]));
        if (s.open) { P_rect(ctx, -0.3, 0.4, 0.6, 0.2, P.col([50, 50, 56])); if (s.power) { ctx.scale(0.6, 0.5); ctx.translate(0, 0.7); ICONS.fuse(ctx, P); } }
        else P_ell(ctx, 0.3, 0.5, 0.05, 0.05, P.col([30, 30, 34]));
      }));
      R.add(SC.mkSprite(L, wd[0], wd[1] - 0.25, wd[2], 0.5, 0.5, (ctx, P) => {
        ctx.scale(0.5, 0.5); ctx.translate(0, 0.5); ctx.rotate((winder.count || 0) * 1.1 + (s.turning ? L.t * 0.8 : 0));
        ctx.strokeStyle = P.col([120, 122, 130]); ctx.lineWidth = 0.08; ctx.beginPath(); ctx.arc(0, 0, 0.4, 0, TAU); ctx.stroke();
        for (let k = 0; k < 4; k++) P_line(ctx, 0, 0, Math.cos(k * Math.PI / 2) * 0.4, Math.sin(k * Math.PI / 2) * 0.4, 0.06, P.col([120, 122, 130]));
        P_line(ctx, 0.4, 0, 0.62, 0, 0.12, P.col([110, 80, 50]));
      }));
      if (s.needBrake) R.add(SC.mkSprite(L, bk[0], bk[1] - 0.22, bk[2], 0.3, 0.45, (ctx, P) => {
        ctx.scale(0.3, 0.45);
        P_rect(ctx, -0.5, 0.35, 1, 0.14, P.col([60, 62, 68]));
        const on = s.locked || s.wrongLock > 0;
        ctx.save(); ctx.translate(0, 0.42); ctx.rotate(on ? 0.9 : -0.6); P_line(ctx, 0, 0, 0, 0.55, 0.16, P.col([130, 132, 140])); P_ell(ctx, 0, 0.55, 0.14, 0.1, P.col(on ? [150, 40, 40] : [90, 30, 30])); ctx.restore();
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
      if (!c.distFn) { c.frozen = true; c.slideTo = c.dist; c.distFn = (cr, dt2) => cr.dist + (cr.slideTo - cr.dist) * Math.min(1, dt2 * 5); s.beamSpeed = 3; s.locked = false; s.wrongLock = 0; s.crossing = false; }
      const on = onLane();
      if (on && !s.crossing) { s.crossing = true; c.slideTo += 1.8; AUDIO.sfx('scrape', Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); G.shake(0.2); }
      if (!on) s.crossing = false;
      return t >= 8.5;
    };
    L.floor = { poly: [[-1.4, -0.9], [1.4, -0.9], [1.4, 0.3], [-1.4, 0.3]], y: 0 };
  }
});
