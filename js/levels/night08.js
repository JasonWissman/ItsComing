'use strict';
// ============================================================ 8. THE DINER ============================================================
// The inversion: it moves only while you are looking at it, and freely once the lights are gone.
LEVELS.push({
  id: 'diner', title: 'The Diner', facing: 180, eyeH: 1.65,
  pal: { skyTop: [5, 5, 10], fog: [20, 17, 24], ground: [18, 16, 20], fogDist: 90 },
  ambient: { wind: 0.25, drone: 1.0, droneFreq: 60, windFreq: 300 },
  lights: [
    { x: 6, y: 5.4, z: 12, r: 18, i: 0.9, color: [255, 172, 70] },
    { x: -8, y: 4.9, z: 15, r: 14, i: 0.8, color: [255, 70, 190], flicker: 0.12 },
    { x: 2.9, y: 2.2, z: 4.8, r: 3.5, i: 0.5, color: [255, 80, 200], flicker: 0.2 },
  ],
  text: {
    intro: 'The last customer left at ten. Something that is not a customer has been standing at the far end of the lot since, and every time you look up it is closer.<br>It only moves while you are looking at it. The lights keep going.',
    hint: 'Pull the shutter down over the window it is coming for, and hold on until it is all the way down. Then see to the breakers on the back wall: main off, reset the three, main on.',
    objective: 'Shutter the window. Keep the lights on.',
    death: { default: 'You looked.', dark: 'The lights went, and it did not need you to look any more.' },
    win: 'It stood under the sign until it got light, and then turned around and walked away like it had somewhere to be.',
    fragment: 'The bulb in the hall has been buzzing for weeks. You keep meaning to change it.',
  },
  lanes: [
    { deg: 0, name: 'window', barrierDist: 5.3, cue: 'glassTap', default: true },
    { deg: 330, name: 'door', barrierDist: 6.0, cue: 'bell' },
  ],
  creatures: [{ type: 'customer', startDist: 60, time: 70, gamma: 0.72, unseenMult: 1.3 }],
  aftermath: { type: 'away', dur: 6.5, wait: 3.0, speed: 1.2 },
  build(L) {
    const s = L.s;
    const cream = [96, 88, 72], creamD = [72, 65, 54], red = [104, 32, 32], chrome = [118, 120, 126], tileA = [82, 77, 70], tileB = [34, 31, 30], dark = [34, 34, 38];
    SC.stars(L, 81, 40, 0.25);
    // the room: tiles, walls, ceiling
    for (let x = -4; x < 4; x++) for (let z = -2.5; z < 5; z++) SC.floorQ(L, x, z, x + 1, Math.min(z + 1, 5), 0.004, ((x + Math.floor(z)) & 1) ? tileA : tileB);
    SC.quad(L, [-4, 3, -2.5], [4, 3, -2.5], [4, 3, 5], [-4, 3, 5], [70, 66, 60]);
    SC.wallV(L, -4, -2.5, 4, -2.5, 0, 3, cream); SC.wallV(L, -4, -2.49, 4, -2.49, 1.05, 1.2, red);
    SC.wallV(L, 4, -2.5, 4, 5, 0, 3, creamD); SC.wallV(L, -4, -2.5, -4, 5, 0, 3, creamD);
    SC.wallV(L, 3.99, -2.5, 3.99, 5, 1.05, 1.2, red); SC.wallV(L, -3.99, -2.5, -3.99, 5, 1.05, 1.2, red);
    SC.wallV(L, -3.99, 1.2, -3.99, 2.1, 0, 2.1, [58, 44, 36]);                                           // the door to the back
    SC.wallV(L, -1, -2.49, 1, -2.49, 1.0, 2.0, [14, 10, 10]); SC.box(L, -1.1, 1.1, 0.95, 1.02, -2.5, -2.3, chrome); // the kitchen pass
    SC.box(L, 1.2, 3.8, 1.9, 1.95, -2.5, -2.3, [90, 74, 56]);
    for (let x = 1.4; x < 3.7; x += 0.3) SC.box(L, x, x + 0.16, 1.95, 2.1, -2.48, -2.34, [230, 226, 214]);
    SC.box(L, 2.4, 3.8, 0, 0.9, -2.45, -1.85, [150, 138, 118]); SC.box(L, 3.0, 3.6, 0.9, 1.5, -2.4, -2.0, chrome); SC.box(L, 3.05, 3.55, 0.9, 1.0, -2.0, -1.9, [60, 40, 30]);
    SC.box(L, 1.92, 2.48, 1.0, 1.55, -2.5, -2.42, [88, 90, 96]);                                           // the breaker panel's box
    SC.sprite(L, -2.4, 2.1, -2.45, 0.42, 0.42, (ctx, P) => { ctx.scale(0.42, 0.42); P_ell(ctx, 0, 0.5, 0.5, 0.5, P.col([40, 40, 44])); P_ell(ctx, 0, 0.5, 0.44, 0.44, P.col([230, 226, 216])); P_line(ctx, 0, 0.5, 0, 0.82, 0.03, P.col([30, 30, 30])); P_line(ctx, 0, 0.5, 0.22, 0.38, 0.03, P.col([30, 30, 30])); });
    // the counter you stand behind, and the stools
    SC.box(L, -3.6, 3.6, 0, 0.95, 0.8, 1.4, [108, 34, 34]); SC.box(L, -3.7, 3.7, 0.95, 1.0, 0.75, 1.45, [130, 122, 104]);
    for (const x of [-3, -1.5, 0, 1.5, 3]) { SC.box(L, x - 0.04, x + 0.04, 0, 0.72, 1.96, 2.04, chrome); SC.box(L, x - 0.2, x + 0.2, 0.72, 0.84, 1.8, 2.2, red); }
    SC.box(L, -0.9, -0.65, 1.0, 1.16, 0.95, 1.1, chrome); SC.box(L, 0.4, 0.5, 1.0, 1.2, 1.0, 1.1, [150, 30, 20]); SC.box(L, 0.6, 0.7, 1.0, 1.14, 1.0, 1.1, [190, 170, 60]);
    SC.box(L, -3.4, -2.8, 1.0, 1.3, 0.85, 1.35, [60, 60, 66]); SC.box(L, -3.35, -2.85, 1.3, 1.34, 0.85, 1.35, [40, 40, 44]);
    STORY.lamp(L, -2.3, 1.0, 1.1, { scale: 0.8 });
    SC.sprite(L, 2.3, 1.0, 1.1, 0.4, 0.34, (ctx, P) => { ctx.scale(0.4, 0.34); P_rect(ctx, -0.5, 0, 1, 0.1, P.col(chrome)); P_ell(ctx, 0, 0.1, 0.45, 0.85, P.cola([200, 210, 220], 0.35)); P_rect(ctx, -0.3, 0.15, 0.6, 0.3, P.col([170, 120, 90])); });
    for (const x of [-3.3, 3.3]) { SC.box(L, x - 0.4, x + 0.4, 0.72, 0.78, 2.9, 3.7, [200, 190, 165]); SC.box(L, x - 0.04, x + 0.04, 0, 0.72, 3.26, 3.34, chrome); }
    // the window wall: floor-to-ceiling glass, a double glass door at the north-west, a neon in the glass
    for (const x of [-3.8, -2.0, 1.75, 4.0]) SC.box(L, x - 0.05, x + 0.05, 0, 3, 4.95, 5.05, dark);
    SC.box(L, -4, -3.8, 0, 3, 4.95, 5.05, creamD);
    SC.wallV(L, -4, 5, 4, 5, 2.7, 3.0, creamD);
    SC.wallV(L, -2.0, 5.02, 1.75, 5.02, 0.1, 2.7, [150, 170, 200], { alpha: 0.1 });
    SC.wallV(L, 1.75, 5.02, 4.0, 5.02, 0.1, 2.7, [150, 170, 200], { alpha: 0.1 });
    SC.wallV(L, -3.8, 5.02, -2.0, 5.02, 0.1, 2.4, [150, 170, 200], { alpha: 0.12 });
    SC.box(L, -2.0, 4.0, 0, 0.1, 4.95, 5.05, dark); SC.box(L, -3.8, -2.0, 2.4, 2.7, 4.95, 5.05, dark);
    SC.box(L, -2.93, -2.87, 0, 2.4, 4.96, 5.04, dark); SC.box(L, -3.7, -2.1, 1.02, 1.08, 4.97, 5.01, chrome);
    SC.sprite(L, -2.5, 2.2, 4.9, 0.14, 0.16, (ctx, P) => { ctx.scale(0.14, 0.16); P_ell(ctx, 0, 0.55, 0.45, 0.45, P.col([170, 140, 60])); P_line(ctx, 0, 0.95, 0, 1, 0.08, P.col([80, 70, 40])); });
    SC.sprite(L, 2.9, 1.95, 4.9, 1.0, 0.44, (ctx, P) => {
      ctx.scale(1.0, 0.44); ctx.strokeStyle = P.raw([255, 90, 210]); ctx.lineWidth = 0.05; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(-0.36, 0.5, 0.1, 0.32, 0, 0, TAU); ctx.moveTo(-0.16, 0.18); ctx.lineTo(-0.16, 0.82); ctx.lineTo(-0.02, 0.82); ctx.lineTo(-0.02, 0.5); ctx.lineTo(-0.16, 0.5);
      ctx.moveTo(0.22, 0.18); ctx.lineTo(0.08, 0.18); ctx.lineTo(0.08, 0.82); ctx.lineTo(0.22, 0.82); ctx.moveTo(0.08, 0.5); ctx.lineTo(0.2, 0.5);
      ctx.moveTo(0.3, 0.18); ctx.lineTo(0.3, 0.82); ctx.lineTo(0.46, 0.18); ctx.lineTo(0.46, 0.82); ctx.stroke();
    }, { noFog: true, noLight: true });
    // outside: the lot, a lamp, the sign, a parked car, the road, the dark beyond
    SC.floorQ(L, -30, 5.1, 30, 6.4, 0.0, [72, 70, 68]);
    SC.floorQ(L, -40, 6.4, 40, 30, -0.02, [30, 29, 31]);
    for (let x = -12; x <= 12; x += 2.8) SC.floorQ(L, x - 0.05, 7, x + 0.05, 11.5, -0.01, [150, 148, 130], { alpha: 0.45 });
    SC.floorQ(L, -80, 30, 80, 38, -0.02, [22, 22, 24]);
    for (let x = -60; x < 60; x += 6) SC.floorQ(L, x, 33.9, x + 3, 34.1, -0.01, [140, 140, 110], { alpha: 0.6 });
    SC.floorQ(L, -80, 38, 80, 95, -0.02, [26, 26, 26]);
    SC.box(L, 5.9, 6.1, 0, 5.4, 11.9, 12.1, dark);
    SC.sprite(L, 6, 5.3, 12, 0.7, 0.3, (ctx, P) => { ctx.scale(0.7, 0.3); P_rect(ctx, -0.5, 0, 1, 1, P.raw([255, 200, 120])); }, { noFog: true, noLight: true });
    SC.box(L, -8.1, -7.9, 0, 4.2, 14.9, 15.1, dark);
    SC.sprite(L, -8, 4.2, 15, 2.8, 1.5, (ctx, P) => { ctx.scale(2.8, 1.5); P_rect(ctx, -0.5, 0, 1, 1, P.col([26, 22, 30])); ctx.strokeStyle = P.raw([255, 90, 210]); ctx.lineWidth = 0.05; ctx.strokeRect(-0.45, 0.1, 0.9, 0.8); P_rect(ctx, -0.36, 0.42, 0.72, 0.16, P.raw([255, 120, 220])); P_rect(ctx, -0.3, 0.2, 0.6, 0.1, P.raw([255, 90, 210])); }, { noFog: true, noLight: true });
    SC.box(L, 4.2, 6.0, 0.25, 0.85, 8.2, 12.0, [38, 36, 46]); SC.box(L, 4.4, 5.8, 0.85, 1.35, 9.2, 11.0, [28, 28, 36]);
    for (const [x, z] of [[4.2, 9], [6.0, 9], [4.2, 11.2], [6.0, 11.2]]) SC.box(L, x - 0.12, x + 0.12, 0, 0.5, z - 0.3, z + 0.3, [14, 14, 16]);
    SC.box(L, 8.6, 10.2, 0, 1.3, 6.6, 7.6, [40, 60, 44]);
    // the far facades leave gaps where the two lanes cross them (deg 0 at x 0, deg 330 at x -27.7 by z 48), so it is in view from its first step
    SC.wallV(L, -40, 48, -29.5, 48, 0, 7, [22, 20, 24]); SC.wallV(L, -26, 48, -10, 48, 0, 7, [22, 20, 24]); SC.wallV(L, -6, 50, -1.5, 50, 0, 5, [20, 18, 22]); SC.wallV(L, 1.5, 50, 20, 50, 0, 5, [20, 18, 22]); SC.wallV(L, 24, 46, 50, 46, 0, 9, [24, 22, 26]);
    for (const [x, y, z] of [[-30, 4, 47.9], [-22, 2.5, 47.9], [10, 3, 49.9], [30, 6, 45.9]]) SC.sprite(L, x, y, z, 0.8, 1.1, (ctx, P) => { ctx.scale(0.8, 1.1); P_rect(ctx, -0.5, 0, 1, 1, P.raw([200, 170, 110])); }, { noFog: true, noLight: true });
    const rng = mulberry32(88);
    for (let i = 0; i < 14; i++) { const side = rng() < 0.5 ? -1 : 1, x = side * (14 + rng() * 26), z = 38 + rng() * 10; if (Math.abs(x) < 1.5 || Math.abs(x + 0.577 * z) < 1.5) continue; SC.tree(L, x, z, 6 + rng() * 6, 'bare', (rng() * 1e6) | 0); }
    // items: only the harder tiers have any
    const decoy = !!L.diff.decoys;
    const needCrank = L.diff.tier >= 2;
    if (needCrank) mkItem(L, 'crank', 'Shutter crank', [
      { x: 2.4, y: 0, z: -0.3 },                        // on the floor behind the counter
      { x: 1.3, y: 1.0, z: 1.05 },                      // on the counter, clear of the lamp
      { x: 2.7, y: 0.9, z: -2.15 },                     // on the back counter, beside the coffee machine
      { x: -0.5, y: 1.02, z: -2.4 },                    // on the ledge of the kitchen pass
      { x: -3.2, y: 0, z: 0.3 },                        // on the floor by the register
    ], { w: 0.42, h: 0.42, flat: true, tool: true });
    if (decoy) mkItem(L, 'bentcrank', 'Shutter crank', [{ x: 1.0, y: 0, z: -0.6 }, { x: 3.3, y: 1.5, z: -2.25 }], { w: 0.42, h: 0.42, flat: true, decoy: true, decoyText: 'Bent. It will not turn.' });
    Object.assign(s, { tubes: [1, 1, 1, 1], nextDie: 12 + L.rand() * 3, dying: -1, mainOn: true, fixed: false, brk: [false, false, false], panelOpen: false, shutN: false, shutD: false, dark: false, rang: false, tapped: false, amb: 1 });
    // the shutters: hold-click targets over the window and the door; on the harder tiers the crank comes first
    const apN = L.addAperture(0, { z: 5.0, x0: -2.0, x1: 1.75, y0: 0, y1: 2.7 });
    const apD = L.addAperture(1, { z: 5.77, x0: -0.78, x1: 0.78, y0: 0, y1: 2.4 });
    L.addAperture(0, { z: 1.0, x0: -9, x1: 9, y0: 0.95, y1: 99 }); L.addAperture(1, { z: 1.15, x0: -9, x1: 9, y0: 0.95, y1: 99 });
    const mkShutter = (id, name, x, z, w, h, flag) => {
      const t = mkTarget(L, {
        id, name, x, y: 0.1, z, w, h, hold: needCrank ? 0 : 2.5, accepts: needCrank ? ['crank'].concat(decoy ? ['bentcrank'] : []) : [],
        hint() { return t.done ? 'Down.' : t.hold ? 'Pull the shutter down. Hold on to it.' : 'The shutter. Its crank is missing.'; },
        use(item) {
          if (item === null) { s[flag] = true; AUDIO.sfx('bar'); G.say('The shutter is down.', 'Down.'); return true; }
          if (item.id !== 'crank') return false;
          t.hold = 2.5; t.accepts = []; AUDIO.sfx('fit'); G.say('The crank fits. Now pull it down and hold on.', 'It fits.'); return true;
        },
      });
      return t;
    };
    const shN = mkShutter('shutterN', 'Window shutter', -0.125, 4.85, 3.6, 2.55, 'shutN');
    const shD = mkShutter('shutterD', 'Door shutter', -2.9, 4.85, 1.9, 2.45, 'shutD');
    // the breaker panel: open it, then main off, reset the three, main on
    const panel = mkTarget(L, {
      id: 'panel', name: 'Breaker panel', x: 2.2, y: 1.0, z: -2.4, w: 0.56, h: 0.56,
      hint() { return 'The breaker panel. Shut.'; },
      onClick() { s.panelOpen = true; panel.hidden = true; for (const t of L.targets) if (t.brk !== undefined) t.hidden = false; AUDIO.sfx('creak'); G.say('Three breakers tripped, and the main.', 'Breakers.'); return true; },
    });
    mkTarget(L, {
      id: 'main', name: 'Main breaker', x: 2.2, y: 1.36, z: -2.4, w: 0.16, h: 0.2, hidden: true, brk: 'main',
      hint() { return s.mainOn ? 'The main. On, and humming.' : 'The main. Off.'; },
      onClick() {
        if (s.mainOn) { s.mainOn = false; AUDIO.sfx('clunk'); G.shake(0.1); G.say('Everything goes off. Now the three, then the main again.', 'Everything goes off.'); return true; }
        if (!s.brk.every(b => b)) { G.say('The main will not hold with a breaker still tripped.', 'It will not stay.'); AUDIO.sfx('nope'); return true; }
        s.mainOn = true; s.fixed = true; s.tubes = [1, 1, 1, 1]; s.dying = -1; AUDIO.sfx('clunk'); setTimeout(() => AUDIO.sfx('tubeOn'), 200); G.shake(0.1); G.say('The lights come back, all of them.', 'Light.');
        return true;
      },
    });
    ['brkA', 'brkB', 'brkC'].forEach((id, k) => mkTarget(L, {
      id, name: 'Breaker ' + (k + 1), x: 2.05 + k * 0.15, y: 1.08, z: -2.4, w: 0.12, h: 0.16, hidden: true, brk: k,
      hint() { return s.brk[k] ? 'Reset.' : 'Tripped.'; },
      onClick() {
        if (s.brk[k]) { G.say('Already reset.', 'Done.'); return true; }
        if (s.mainOn) { G.say('It will not move with the main on.', 'Stuck.'); AUDIO.sfx('nope'); return true; }
        s.brk[k] = true; AUDIO.sfx('lever'); G.say('Reset. ' + (s.brk.every(b => b) ? 'Now the main.' : ''), 'Click.'); return true;
      },
    }));
    const shut = lane => lane.idx === 0 ? s.shutN : s.shutD;
    L.sealed = lane => shut(lane);
    L.isWon = () => s.fixed && L.tier(shut(L.lane), shut(L.lane), s.shutN && s.shutD);
    L.objectiveText = () => {
      const sh = L.diff.tier >= 3 ? ((s.shutN ? 'Window shuttered. ' : 'Shutter the window. ') + (s.shutD ? 'Door shuttered. ' : 'Shutter the door. ')) : shut(L.lane) ? 'Shutter down. ' : 'Pull down the shutter on the ' + L.lane.name + '. ';
      return sh + (s.fixed ? 'Lights fixed.' : s.mainOn ? 'Breakers: main off, reset the three, main on.' : 'Main is off. Reset the three, then main on.');
    };
    L.update = dt => {
      // the tubes die one by one until the breakers are reset
      const alive = s.tubes.filter(t => t).length;
      if (!s.fixed && s.mainOn && alive > 0) {
        s.nextDie -= dt;
        if (s.nextDie < 1.6 && s.dying < 0) { const pool = s.tubes.map((t, k) => t ? k : -1).filter(k => k >= 0); s.dying = pool[Math.floor(L.rand() * pool.length)]; AUDIO.sfx('tubeDie'); }
        if (s.nextDie <= 0) { s.tubes[s.dying] = 0; s.dying = -1; s.nextDie = 12 + L.rand() * 3; if (alive === 1) G.toast('The last light goes.'); }
      }
      s.dark = !s.mainOn || !s.tubes.some(t => t);
      s.amb += ((s.dark ? 0.28 : 1) - s.amb) * Math.min(1, dt * 7); L.pal.ambient = s.amb;
      for (const c of L.creatures) c.dark = s.dark;
      apN.y1 = 2.7 * (1 - (shN.progress || 0)); apD.y1 = 2.4 * (1 - (shD.progress || 0));
      const c = L.creature;
      if (!L.won && c.lane.idx === 1 && c.dist < 6 && !s.rang) { s.rang = true; AUDIO.sfx('bell'); }
      if (!L.won && c.lane.idx === 0 && c.dist < 6.5 && !s.tapped) { s.tapped = true; AUDIO.sfx('glassTap'); }
    };
    L.deathCause = c => c.dark ? 'dark' : null;
    L.dynamic = () => {
      // the fluorescent tubes
      s.tubes.forEach((alive, k) => {
        const cx = k < 2 ? -2.2 : 2.2, cz = (k % 2) ? 3.2 : 0.2, on = alive && s.mainOn, dying = s.dying === k;
        const col = on ? (dying && Math.sin(L.t * 37 + k) > 0.2 ? [140, 146, 136] : [240, 246, 230]) : [70, 72, 68];
        R.add(SC.mkQuad(L, [cx - 0.65, 2.96, cz - 0.07], [cx + 0.65, 2.96, cz - 0.07], [cx + 0.65, 2.96, cz + 0.07], [cx - 0.65, 2.96, cz + 0.07], col, on ? { noFog: true, noLight: true } : {}));
      });
      // the shutters, coming down from the top
      for (const [t, x0, x1, top] of [[shN, -1.95, 1.7, 2.7], [shD, -3.75, -2.05, 2.4]]) {
        const p = t.done ? 1 : (t.progress || 0), cov = top * p;
        if (cov > 0.02) {
          R.add(SC.mkQuad(L, [x0, top - cov, 4.9], [x1, top - cov, 4.9], [x1, top, 4.9], [x0, top, 4.9], [120, 118, 110]));
          for (let y = top - 0.25; y > top - cov; y -= 0.25) R.add(SC.mkQuad(L, [x0, y, 4.89], [x1, y, 4.89], [x1, y + 0.03, 4.89], [x0, y + 0.03, 4.89], [70, 68, 62]));
        }
      }
      // the breaker panel: its door, or its switches
      if (!s.panelOpen) R.add(SC.mkSprite(L, 2.2, 1.0, -2.41, 0.56, 0.56, (ctx, P) => { ctx.scale(0.56, 0.56); P_rect(ctx, -0.5, 0, 1, 1, P.col([100, 102, 108])); P_rect(ctx, -0.44, 0.06, 0.88, 0.88, P.col([84, 86, 92])); P_rect(ctx, 0.3, 0.45, 0.1, 0.1, P.col([40, 40, 44])); }));
      else {
        R.add(SC.mkSprite(L, 2.2, 1.0, -2.41, 0.56, 0.56, (ctx, P) => { ctx.scale(0.56, 0.56); P_rect(ctx, -0.5, 0, 1, 1, P.col([100, 102, 108])); P_rect(ctx, -0.44, 0.06, 0.88, 0.88, P.col([30, 30, 34])); }));
        R.add(SC.mkSprite(L, 2.2, 1.36, -2.4, 0.16, 0.2, (ctx, P) => { ctx.scale(0.16, 0.2); P_rect(ctx, -0.5, 0, 1, 1, P.col([50, 50, 56])); P_rect(ctx, -0.3, s.mainOn ? 0.5 : 0.1, 0.6, 0.4, P.col(s.mainOn ? [190, 60, 50] : [120, 122, 130])); }));
        for (let k = 0; k < 3; k++) R.add(SC.mkSprite(L, 2.05 + k * 0.15, 1.08, -2.4, 0.12, 0.16, (ctx, P) => { ctx.scale(0.12, 0.16); P_rect(ctx, -0.5, 0, 1, 1, P.col([50, 50, 56])); P_rect(ctx, -0.3, s.brk[k] ? 0.5 : 0.1, 0.6, 0.4, P.col(s.brk[k] ? [120, 122, 130] : [200, 150, 50])); }));
      }
    };
    L.dynamicLights = () => {
      if (!s.mainOn) return [];
      const out = [];
      s.tubes.forEach((alive, k) => { if (alive) { const p = L.pt(k < 2 ? -2.2 : 2.2, 2.9, (k % 2) ? 3.2 : 0.2); out.push({ x: p[0], y: p[1], z: p[2], r: 8, i: 0.55, color: [205, 235, 215], flicker: s.dying === k ? 0.8 : 0.04, seed: k * 3 }); } });
      return out;
    };
    const gl = [[2.9, 2.17, 4.9, 1.3, [255, 80, 200], 0.3], [-8, 4.95, 15, 3.5, [255, 70, 190], 0.25], [6, 5.4, 12, 2.5, [255, 180, 80], 0.3]].map(([x, y, z, r, color, a]) => { const p = L.pt(x, y, z); return { x: p[0], y: p[1], z: p[2], r, color, a }; });
    L.glows = () => gl;
    L.floor = { poly: [[-3.8, -2.3], [3.8, -2.3], [3.8, 0.65], [-3.8, 0.65]], y: 0 };
  }
});
