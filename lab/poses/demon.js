'use strict';
// Night 13, The Void: the demon (js/creatures/demon.js; its moods and its ending are set by js/levels/night13.js)
(() => {
  const CR = CREATURES.demon;
  const PACE = 40 / 75;   // night 13's startDist / time: metres a second at speedMult 1 (seenMult 1)
  const span = (t, a, b) => smoothstep(clamp((t - a) / (b - a), 0, 1));
  // night 13's END, in seconds from when it reaches you
  const END = {
    settle: 1.0, stoop: [0.2, 2.2], near: [0.9, 3.0], lift: [0.8, 2.8], grab: [3.6, 3.95], unveil: [4.3, 5.1], moods: 6.0, lean: [8.8, 9.4, 10.4, 11.2], sad: 14.85,
    down: [19.5, 20.1], hush: 23.1, scare: [23.8, 25.7, 26.3], neutral: [26.3, 26.9], confused: [29.7, 30.5], mirror: [32.3, 33.1], light: [32.9, 39.9], content: [34.9, 35.9], happy: [36.9, 37.9],
    release: 39.9, walk: [40.9, 44.5], disrobe: [45.1, 47.7], dance: [47.3, 51.8],
  };
  // and of its easter egg's VOID_EGG (from the moment the last thing is taken up): the joy, its face, its robe, the light
  const EGG = { joy: 16.6, unveil: [16.6, 17.1], disrobe: [17.1, 19.7], light: [16.9, 22.4] };
  // the faces round it at the scare (END.scare): each of the others as it comes up into your face in its death lunge, as
  // night 13 draws them (VOID_RECAP's faceShot, and its FACES, copied here: how far into its lunge, k, and the square round
  // its face, s its side, x, y its middle off the middle of the view, all as much of the view's height), from the eye, 0.55 m
  // off, its face at eye level; each drawn once, alone, onto a square canvas of its own, its edges let go into the dark.
  // (But the climber: the night draws it off the wall at you, and far bigger than the lab's camera does)
  const OTHERS = ['walker', 'crawler', 'smiler', 'watcher', 'runner', 'swimmer', 'climber', 'customer', 'signalman', 'other', 'carrier', 'tall'];
  const FACES = {
    walker: { s: 0.42, y: 0.14 }, crawler: { s: 0.9, y: 0.3 }, smiler: { s: 0.6, x: -0.15, y: 0.03 }, watcher: { s: 0.74, x: -0.12, y: -0.06 },
    runner: { s: 0.62 }, swimmer: { s: 0.7, x: -0.07 }, climber: { s: 0.6, y: 0.1 }, customer: { s: 0.74, y: 0.1 },
    signalman: { s: 0.9, y: 0.05 }, other: { s: 0.56, y: -0.02 }, carrier: { s: 0.8 }, tall: { k: 0.45, s: 1.2, x: 0.1, y: -0.08 },
  };
  let faces = null;
  function othersFaces() {
    if (faces) return faces;
    const keep = { W: R.W, H: R.H, f: R.f, horizon: R.horizon, eyeH: R.eyeH, viewY: R.viewY }, eye0 = G.L.eyeH, PX = 240, D = 0.55;
    const P = { fog: 0, fogColor: [0, 0, 0], t: 0, lit: 0, col: k => rgba(k), cola: (k, a) => rgba(k, a), raw: k => rgba(k) };
    faces = OTHERS.map(type => {
      const entry = LAB.list.find(e => e.type === type), CR = CREATURES[type];
      if (!entry || !CR) return null;
      try {
        const F = Object.assign({ k: 1, s: 0.62, x: 0, y: 0 }, FACES[type]), c = new LAB.Card(entry, document.createElement('canvas')).c, spec = CR.death || {};
        const EYE = G.L.eyeH = type === 'tall' ? 1.15 : 1.65;   // (in bed, on night 12)
        for (const k of ['showX', 'showTop', 'headroom', 'peer']) delete c[k];   // (as it was set for the first of its own poses: where it stood, what hid it)
        c.frozen = true; c.lat = 0; c.lungeFrom = c.dist;
        for (const k of [0, F.k]) { c.lunge = k; c.dist = lerp(c.lungeFrom, D, easeIn(k)); c.yOff = lerp(0, EYE - CR.faceY, smoothstep(k)); if (spec.pose) spec.pose(c, k); }
        const Hv = PX / F.s, f = (Hv / 2) / Math.tan(31 * DEG), cx = PX / 2 - F.x * Hv, cy = PX / 2 + F.y * Hv, ppm = f / c.dist;
        Object.assign(R, { W: 2 * cx, H: Hv, f, horizon: cy, eyeH: EYE, viewY: 0 });
        const cv = document.createElement('canvas'); cv.width = cv.height = PX;
        const ctx = cv.getContext('2d');
        ctx.translate(cx, cy + ppm * (EYE - c.yOff)); ctx.scale(ppm, -ppm);
        CR.draw(ctx, c, P);
        return CREATURES.demon.vignette(cv);
      } catch (e) { console.error(e); return null; }
    });
    Object.assign(R, keep); G.L.eyeH = eye0;
    return faces;
  }
  const D0 = CR.catchDist;   // where it is when it reaches you
  const rageFor = anger => (anger > 0 ? Math.min(1, 0.6 + 0.4 * anger / 6) : 0);
  // the light it carries (night 13's dynamicLights): its own dull red, more as it rages; while it holds you, the light of
  // its face (moodLight); in the meadow the sun on it. As LIGHT.at has it at its middle, with the flicker LIGHT.update gives
  const DULL = [[200, 60, 60], 0.25, 0.5];
  const MOOD_LIGHT = [[[255, 46, 30], 0.6, 0.7], [[200, 176, 184], 0.34, 0.15], [[255, 46, 30], 0.6, 0.7], [[176, 170, 226], 0.4, 0.25], [[176, 170, 226], 0.4, 0.25], [[120, 140, 210], 0.36, 0.2],
    [[255, 40, 24], 0.85, 0.8], [[200, 176, 184], 0.34, 0.15], [[176, 170, 226], 0.4, 0.25], [[176, 170, 226], 0.4, 0.25], [[255, 206, 166], 0.45, 0.05], [[255, 226, 176], 0.6, 0.05]];
  const flick = (f, t) => 1 + f * 0.35 * (Math.sin(t * 17.3 + 13) + 0.6 * Math.sin(t * 29.1 + 26) + 0.4 * Math.sin(t * 7.7));
  function ownLight(c) {
    const reveal = c.meadow || 0, lv = c.leave || 0, out = [];
    if (c.endT !== undefined) {
      const m = c.mood || 0, i = Math.min(Math.floor(m), MOOD_LIGHT.length - 2), k = smoothstep(m - i), A = MOOD_LIGHT[i], B = MOOD_LIGHT[i + 1], u = c.unveil === undefined ? 1 : c.unveil;
      const more = 0.16 * span(c.endT, 0.3, 2.6) * (1 - Math.min(1, m));
      out.push({ r: 3, i: (lerp(DULL[1], lerp(A[1], B[1], k), u) * (1 - 0.45 * Math.max(0, c.nod || 0)) + more) * (1 - reveal) * c.fade, color: mixc(DULL[0], mixc(A[0], B[0], k), u), flicker: lerp(DULL[2], lerp(A[2], B[2], k), u), d: 0.1 });
    } else {
      const a = (c.rage || 0) * (1 - (c.calm || 0));
      out.push({ r: 3 + a * 4, i: (0.25 + a * 0.5) * c.fade, color: [200, 60, 60], flicker: 0.5, d: 0.1 });
    }
    if (reveal * (1 - lv) > 0.01) out.push({ r: 10, i: 0.32 * reveal * (1 - lv), color: [255, 238, 200], d: 4 });   // the sun, up and off to the side
    let lit = 0, col = [0, 0, 0];
    for (const l of out) {
      if (l.d >= l.r) continue;
      const q = (1 - l.d / l.r) ** 2 * l.i * (l.flicker ? flick(l.flicker, c.t) : 1);
      lit += q; col = col.map((v, j) => v + l.color[j] * q);
    }
    return lit > 0.002 ? { lit, color: col.map(v => v / lit) } : null;
  }
  // P with its light (and, far off, the void's black fog) put in before the lab's own light and fog
  function voidP(P, c, fog) {
    const li = ownLight(c), f = fog || 0, k = col => mixc(LIGHT.apply(col, li), [0, 0, 0], f);
    return Object.assign({}, P, {
      fog: f, fogColor: [0, 0, 0],
      col: (col, s) => P.col(mixc(LIGHT.apply(col, li && s !== undefined ? { lit: li.lit * s, color: li.color } : li), [0, 0, 0], f), s),
      cola: (col, a) => P.cola(k(col), a),
    });
  }
  // drawn where it really is: its jerks aside (CR.lateral) move it across the view
  const drawAt = fog => (ctx, c, P) => { ctx.translate(c.lat || 0, 0); CR.draw(ctx, c, voidP(P, c, fog && fog(c))); };
  const voidFog = c => 1 - Math.exp(-c.dist / 14);   // night 13's fogDist
  // its walk as updateCreature drives it: speedMult (fits and all, when enraged) sets how far it comes this frame, the gait
  // follows the distance, and standing still the stride settles
  function come(c, dt, closeIn, minD) {
    const v = PACE * CR.speedMult(c, dt, true), moved = v * dt;
    if (closeIn) c.dist = Math.max(minD || 1.5, c.dist - moved);
    c.gait += moved * CR.stepRate * Math.PI;
    c.moving = moved > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
    c.lat = CR.lateral(c);
  }
  const holdAnger = (c, dt) => { c.rage += (rageFor(c.anger) - c.rage) * Math.min(1, dt * 4); };
  // the ending as night 13's update plays it, t seconds after it reached you (CR.ending). Bent down to you as it was when
  // it got to you (Y0, as the night bends it over the last few metres). At the scare the faces of the others are round it
  // (scareBack, scareFront: as night 13 draws them round its face, in the view's own proportions, here the card's). (The
  // light, the shake and the meadow turning into place are the night's, not its: see night 13 itself)
  const Y0 = -0.42;
  function ending(c, t, dt) {
    const still = !!c.stillMode, prev = c.dist, o = CR.ending(END, t, D0, Y0, still);
    c.endT = t; c.still = still; c.frozen = true;
    for (const k of ['settle', 'hug', 'unveil', 'yOff', 'sob', 'calm', 'mood', 'nod', 'jolt', 'disrobe']) c[k] = o[k];
    c.dist = o.dist;
    c.meadow = span(t, END.light[0], END.light[1]); c.soft = c.meadow;
    c.scare = CR.scareAt(o.scare, OTHERS.length, still); c.gulp = c.scare.gulp;
    let dance = t > END.dance[0] && t < END.dance[1] ? Math.min(1, (t - END.dance[0]) * 2, (END.dance[1] - t) * 2) : 0;
    const u = (t - END.dance[1] - 7) % 12;
    if (t > END.dance[1] + 7 && u < 2.6 && !c.leaving) dance = 0.5 * Math.min(1, u * 2, (2.6 - u) * 2);
    c.dance = still ? 0 : dance;
    // (a night's distFn walks it, so its legs go with the distance even though it is frozen)
    const moved = Math.abs(c.dist - prev);
    c.gait += moved * CR.stepRate * Math.PI; c.moving = moved > 0.024 * dt;
    if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
  }
  // the faces at the scare, behind it or in front of it (layer), round the middle of its face, a unit the card's height
  const scareLayer = layer => (ctx, c) => {
    if (!c.scare || !c.scare.faces.length) return;
    const M = ctx.getTransform(), ppm = Math.hypot(M.c, M.d) / (ctx.canvas.width / R.W), vh = R.H / ppm;
    ctx.translate(0, CR.eyesY(c) - 0.03); ctx.scale(vh, -vh);
    CR.scareDraw(ctx, othersFaces(), c.scare, layer, 1, R.W / 2 / R.H);
  };
  // a stretch of the ending, from t0 on
  const endPart = (t0, extra) => Object.assign({
    still: true,
    set(c) { c.tilt0 = CR.tilt(c); c.settle = 0; c.mood = 0; c.unveil = 0; c.dist = D0; c.stillMode = !!extra.reduced; ending(c, t0, 0); c.gait = 0; c.moving = false; },
    tick(c, k, dt, T) { ending(c, extra.hold ? t0 : t0 + T, dt); },
    draw: drawAt(),
  }, extra);
  // the face, close up: as it holds you, bent down to your face, about 0.7 m off
  const FACE = { h: 2.25, y0: 1.45, w: 0.6 };
  // the whole ending, one stretch, framed as it goes: close on it as it takes hold of you, closer on its face while it holds
  // you, and out again as it lets you go, steps back, takes off its robe and dances (each frame eased into the next)
  const GRAB = { h: 2.8, y0: 1.35, w: 0.9 }, WIDE = { h: 2.8, y0: 0, w: 1.6 };
  const FRAMES = [[0, GRAB], [END.grab[1], GRAB], [END.moods + 0.2, FACE], [END.content[0] - 0.4, FACE], [END.release - 0.6, { h: 2.8, y0: 1.35, w: 1.2 }], [END.release + 0.4, { h: 2.8, y0: 1.35, w: 1.2 }], [END.walk[0] + 1.2, { h: 2.8, y0: 0, w: 1.3 }], [END.disrobe[0] - 0.4, { h: 2.8, y0: 0, w: 1.3 }], [END.disrobe[0] + 0.6, WIDE]];
  const frameAt = (c, T) => {
    let i = 0; while (i < FRAMES.length - 1 && T >= FRAMES[i + 1][0]) i++;
    const [t0, A] = FRAMES[i], nx = FRAMES[i + 1];
    if (!nx) return A;
    const [t1, B] = nx, k = smoothstep(clamp((T - t0) / (t1 - t0), 0, 1));
    return { h: lerp(A.h, B.h, k), y0: lerp(A.y0, B.y0, k), w: lerp(A.w, B.w, k) };
  };
  const base = LAB.lunge();
  // coming close it bends over toward you as night 13 has it (CR.stoopFor, from your eye 1.65 m up), so its face stays in the
  // view; and its death lunge comes up from as far down as it was (CR.death.pose: c.bend0)
  const bendTo = c => { c.stoop = CR.stoopFor(c, 1.65, c.yOff); };
  const lungeY = c => { const K = smoothstep(c.lunge); return (c.bend0 || 0) * (1 - K) - (CR.eyesY(c) - CR.faceY) * K; };
  LAB.creature('demon', {
    night: 13, stage: 'The Void', dist: 8, fit: { h: 2.75, w: 1.3 },
    anims: [
      { name: 'Far off in the dark', note: 'Empty-handed, far out in the void: the black fog has the robe, and all there is of it is two pale points (no haze round them).', dist: 24, dur: 6, draw: drawAt(voidFog),
        tick(c, k, dt) { come(c, dt, false); } },
      { name: 'Walking at you, empty-handed', note: 'Your hands empty, it only walks: from 8 m in to you, its arms rising toward you and bending down to you over the last few metres (so close in, its head stays in the view).', dur: 12, draw: drawAt(),
        tick(c, k, dt) { come(c, dt, true, 1.2); c.yOff = -0.42 * smoothstep(clamp((3.6 - c.dist) / 2.4, 0, 1)); bendTo(c); } },
      { name: 'Enraged, coming on in fits', note: 'Holding three things: red slit eyes, the snarl, the shaking, and its fits (stop dead, step, lurch) and jerks aside as it comes from 12 m in to you; taller enraged, it bends over toward you over the last few metres, its shoulders hunched, so its face stays in the view.', dist: 12, dur: 11, fit: { h: 3.4, w: 1.9 }, draw: drawAt(),
        set(c) { c.anger = 3; c.rage = rageFor(3); }, tick(c, k, dt) { holdAnger(c, dt); come(c, dt, true, 1.2); bendTo(c); } },
      { name: 'Taking something up, and putting it down', note: 'You pick one thing up at 1 s and put it down at 5 s: its rage comes on and goes off again at the rate the night eases it.', dist: 7, dur: 8.5, fit: { h: 3.3, w: 1.9 }, draw: drawAt(),
        tick(c, k, dt, T) { c.anger = T >= 1 && T < 5 ? 1 : 0; holdAnger(c, dt); come(c, dt, false); } },
      endPart(0, { name: 'The whole ending', note: 'The ending as the night plays it, in one go: from when it reaches you (it lifts its arms and takes hold of you, and then its face comes up) through its faces, crying, looking down and crying on, the scare and taking the faces back, grey and confused (and the same mirrored), content and happy as the meadow comes, letting you go, stepping back, taking off its robe, and dancing in the meadow. The frame follows it, close on its face while it holds you and out again after. (Its light changes with each face; the pale light, the meadow, the shake and the flash are the night\u2019s, not drawn here.)', dur: END.dance[1] + 1.2, fit: frameAt, back: scareLayer('back'), front: scareLayer('front') }),
      endPart(0, { name: 'It lifts its arms, and takes hold of you', note: 'Caught empty-handed and facing it (the ending): it stops, its head comes level, it bends down to you and its arms come up, the hands open, high either side of its head; then, quick, it reaches out and takes hold of you, the arms coming at you out of the bottom of the view and the hands gripping its bottom edge at the corners, the fingers curling in over your shoulders; a faint soft glow of its light about the dark arms and hands (no hard edge). Only once its hands are there does its angry face come up out of the hood.', dur: 5.6, fit: { h: 2.8, y0: 1.35, w: 0.9 } }),
      endPart(END.moods - 0.2, { name: 'Its faces, holding you', note: 'Holding you, its face goes through angry, neutral, angry again (leaning in close at you, and drawing back), confused, the same confused face mirrored (going smoothly over, its head righting itself and tipping the other way, each held as long), then a glitching flicker of faces (pain, envy, sorrow, grimace, terror, empty, shock, each snapped to the next) to sad, crying, its light changing with each.', dur: 9.4, fit: FACE }),
      endPart(END.moods - 0.2, { name: 'Its faces, reduced motion', note: 'The same with reduced motion on (c.still): every change of face a slow fade (into and out of its second angry face over 0.6 s, confused into the mirrored face over 0.9 s); from confused to sad no glitch, but pain, sorrow, terror and empty each fading in and out in turn over 1.6 s; no trembling, nothing snapped.', dur: 9.4, reduced: true, fit: FACE }),
      endPart(END.lean[3] - 0.2, { name: 'Confused, and mirrored', note: 'Confused (one brow up, the mouth twisted, its head on one side), held; then smoothly over into the same face mirrored (the other brow up, the mouth twisted the other way, its head on its other side), held as long; then the glitch.', dur: 3.2, fit: FACE }),
      endPart(END.lean[0] - 0.3, { name: 'Angry again, leaning in', note: 'Into its second angry face it leans right in at you, much closer (0.32 m) and lower, its face filling the view, holds it, and draws back to where it was as it goes confused.', dur: 3.4, fit: FACE }),
      endPart(END.sad - 0.2, { name: 'Crying, holding you', note: 'Sad, it cries a while, still holding you (the tears running, its shoulders heaving in sobs); then its head starts to go down.', dur: 5.2, fit: FACE }),
      endPart(END.sad + 1, { name: 'Crying, reduced motion', note: 'The same with reduced motion on (c.still): no heaving or trembling, the tears not running.', dur: 3, hold: true, reduced: true, fit: FACE }),
      endPart(END.down[0] - 0.4, { name: 'Looking down', note: 'Still crying and still holding you, its head goes down, bowed to the ground: lower, the opening of the hood lower and narrower, its sad face low in it and lost in the shadow of the hood, its light lower. It cries on a while, bowed, its shoulders heaving and its tears dropping out of the dark of the hood; then it stops, and is still a moment.', dur: END.scare[0] - END.down[0] + 0.2, fit: FACE }),
      endPart(END.scare[0] - 0.5, { name: 'The scare', note: 'All at once it throws its head back (in a tenth of a second), its face enraged, the jaw dropped, its head seizing; and round it in the dark, all at once, big, are the faces of all the others, each as it came up into your face in its death lunge, jittering and glitching, there nearly two seconds. (In the night: its screech, a blow under it, a shake and a soft flash.)', dur: END.scare[1] - END.scare[0] + 0.7, fit: FACE, back: scareLayer('back'), front: scareLayer('front') }),
      endPart(END.scare[1] - 0.15, { name: 'Taking them back', note: 'One after another the faces fly into the opening of its hood, turning and shrinking to nothing, in front of it as they go, the opening widening as each goes in; its head comes forward and level, and its face goes back to grey.', dur: 1.6, fit: FACE, back: scareLayer('back'), front: scareLayer('front') }),
      endPart(END.scare[0] - 0.6, { name: 'The scare, reduced motion', note: 'The same with reduced motion on: its head lifts slowly and not as far, no seizing; the faces fade in where they are, keep still, and fade out one after another.', dur: END.scare[2] - END.scare[0] + 1.0, reduced: true, fit: FACE, back: scareLayer('back'), front: scareLayer('front') }),
      endPart(END.scare[2] - 0.2, { name: 'Grey again, and confused', note: 'Its grey neutral face again, a few seconds, in the dark, still holding you; then confused, held; then smoothly over into the same face mirrored, held as long, as the pale light starts to come.', dur: END.content[0] - END.scare[2] + 0.2, fit: FACE }),
      endPart(END.content[0] - 0.4, { name: 'Content, happy, letting go', note: 'As the meadow comes out of the pale light and turns into place: content, then happy; then it lets you go (its hands open and its arms come away and down) and straightens, settled and smaller.', dur: 6.6, fit: { h: 2.8, y0: 1.35, w: 1.2 } }),
      endPart(END.release - 0.2, { name: 'Letting go, stepping back', note: 'It lets you go and straightens up, settled and smaller, and steps back to 3.3 m.', dur: 5.6, fit: { h: 2.8, w: 1.3 } }),
      endPart(END.disrobe[0] - 0.3, { name: 'Taking off its robe', note: 'In the meadow, as the music box starts: its hands go up and push the hood back, take the robe at the shoulders and let it drop, the sleeves and black gloves sliding off with it; it hops clear of the heap.', dur: 3.4, fit: { h: 2.8, w: 1.6 } }),
      endPart(END.dance[0] - 0.2, { name: 'Dancing in the meadow', note: 'Out of the robe, in a yellow striped shirt, red shorts, white socks and blue sneakers, it dances a little to the music box beside the heap of it: hops, kicks, hands up and waving, its head rocking.', dur: 4.9, fit: { h: 2.8, w: 1.6 } }),
      { name: 'Fading away', note: 'After your press in the meadow: it fades out over two seconds as the bedroom comes up, the robe on the grass with it.', dur: 3, still: true, fit: { h: 2.8, w: 1.6 }, draw: drawAt(),
        set(c) { c.tilt0 = 0; ending(c, END.dance[1] + 1.6, 0); c.leaving = true; }, tick(c, k, dt, T) { ending(c, END.dance[1] + 1.6 + T, dt); c.leave = span(T, 0, 3.0); c.fade = clamp(1 - (T - 0.3) / 2.0, 0, 1); } },
      // the easter egg (night 13's buildGathering, its VOID_EGG): everything taken up, it stands in the middle of the others,
      // calm; then, as they all leap for joy, its face comes up, it takes off its robe and dances as the light comes
      { name: 'Among the others: the joy', note: 'The easter egg (everything taken up): in the middle of the others it stands calm and hooded, two pale eyes, a few seconds; then, as they throw what they hold into the air and leap, its happy face comes up out of the hood, it pushes the hood back, drops the robe, hops clear and dances, the dark turning to the pale light and the meadow round it.', dist: 6, dur: 11, still: true, fit: { h: 2.8, w: 1.6 }, draw: drawAt(),
        tick(c, k, dt, T) {
          const t = EGG.joy - 2.5 + T;
          c.calm = span(t, EGG.joy, EGG.joy + 1.6); c.meadow = c.soft = span(t, EGG.light[0], EGG.light[1]);
          if (t >= EGG.joy) { c.mood = CR.moods - 1; c.unveil = span(t, EGG.unveil[0], EGG.unveil[1]); c.settle = 1; c.tilt0 = 0; }
          c.disrobe = clamp((t - EGG.disrobe[0]) / (EGG.disrobe[1] - EGG.disrobe[0]), 0, 1);
          c.dance = Math.min(1, Math.max(0, (t - EGG.disrobe[1] + 0.4) * 2));
        } },
      LAB.lunge({ note: 'Still holding something as it reaches you: enraged, bent over toward you as it came (so its face was in the view), it comes up into your face, lifted so its eyes end level with yours.', fit: { h: 3.4, w: 1.9 }, draw: drawAt(),
        set(c) { c.anger = 1; c.rage = rageFor(1); bendTo(c); base.set(c); c.bend0 = c.yOff; },
        tick(c, k, dt, T) { base.tick(c, k, dt, T); c.lat = lerp(c.lat, 0, 0.3); c.yOff = lungeY(c); } }),
      // drawn at with the bow: as night 13's rushStep has it, from where it was it is brought in on a steepening curve to reach
      // you as the draw comes to 0.8 (1.2 s); then the death lunge
      LAB.lunge({ name: 'Drawn at: it rushes you', note: 'The bow drawn at it (it is never loosed here): enraged, it comes for you from 14 m, slowly and then faster and faster as the string comes back, bending over toward you as it nears so its face stays in the view, and is on you before the bow is full: the death lunge, up from as low as it was bent.', dist: 14, dur: 2.4, fit: { h: 3.4, w: 1.9 }, draw: drawAt(),
        set(c) { c.anger = 2; c.rage = rageFor(2); c.frozen = true; c.from = c.dist; },
        tick(c, k, dt, T) {
          const q = clamp(T / 1.2, 0, 1), prev = c.dist;
          c.rage += (lerp(rageFor(2), 1, q) - c.rage) * Math.min(1, dt * (4 + 8 * q));
          if (q < 1) { c.dist = lerp(c.from, CR.catchDist * 0.9, q * q * (0.4 + 0.6 * q)); c.gait += (prev - c.dist) * CR.stepRate * Math.PI; c.moving = true; c.lat = CR.lateral(Object.assign({}, c, { frozen: false })); bendTo(c); return; }
          if (!c.lungeFrom) { c.dist = CR.catchDist * 0.9; bendTo(c); c.lungeFrom = c.dist; c.lat = 0; }
          base.tick(c, k, dt, T - 1.2); c.yOff = lungeY(c);
        } }),
    ],
  });
})();
