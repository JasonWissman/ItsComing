'use strict';
// ---------- The things that come. Drawn procedurally, in meters, feet at (0,0), +y up ----------
// Every creature exposes: h, w (sprite box), faceY (where its face is, for the lunge),
// stepRate (steps per meter, drives footstep sounds), catchDist, init(c), speedMult(c,dt,seen), draw(ctx,c,P)

function headTiltJerk(t, period, amp) {
  const k = Math.floor(t / period);
  const side = (k & 1) ? 1 : -1;
  const frac = t - k * period;
  const snap = smoothstep(frac / 0.07);
  return side * amp * (2 * snap - 1);
}
function fingers(ctx, x, y, angle, spread, len, w, color) {
  for (let i = 0; i < 4; i++) {
    const a = angle + (i - 1.5) * spread;
    const l = len * ((i === 0 || i === 3) ? 0.82 : 1);
    P_line(ctx, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, w, color);
  }
}
function strands(ctx, x, y, n, len, color, seed, t) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.16 + Math.sin(t * 1.3 + i + seed) * 0.05;
    const l = len * (0.7 + 0.3 * Math.sin(i * 2.3 + seed));
    P_line(ctx, x + (i - (n - 1) / 2) * 0.03, y, x + Math.cos(a) * l + (i - (n - 1) / 2) * 0.04, y + Math.sin(a) * l, 0.012, color);
  }
}

const CREATURES = {

  // ================= THE WALKER: tall, thin, too-long arms, jerking head. Level 1 =================
  walker: {
    name: 'the walker', h: 2.45, w: 1.5, faceY: 2.25, stepRate: 0.55, catchDist: 1.5, sound: 'walker',
    init(c) { },
    speedMult(c, dt, seen) { return 1; },
    draw(ctx, c, P) {
      const g = c.gait, t = c.t;
      const near = clamp(1 - c.dist / 22, 0, 1);
      const body = P.col([6, 6, 10]);
      const skin = P.col([92, 84, 88]);
      const eye = P.col([225, 218, 205]);
      const bob = Math.abs(Math.sin(g)) * 0.05;
      const sway = Math.sin(g) * 0.035;
      const hipY = 1.22 + bob;
      // legs (front view: feet lift alternately)
      for (const s of [-1, 1]) {
        const ph = g + (s > 0 ? Math.PI : 0);
        const lift = Math.max(0, Math.sin(ph)) * 0.24;
        const hx = s * 0.08 + sway, kx = s * 0.12 + sway * 0.6, fx = s * 0.15 + sway * 0.3;
        P_limb(ctx, [[hx, hipY], [kx, hipY * 0.5 + lift * 0.75], [fx, lift + 0.03]], 0.075, body);
        P_line(ctx, fx - 0.03, lift + 0.03, fx + s * 0.09, lift + 0.03, 0.07, body);
      }
      // torso: far too narrow
      P_poly(ctx, [[-0.15 + sway, hipY - 0.06], [0.15 + sway, hipY - 0.06], [0.22 + sway * 0.6, 2.0 + bob], [-0.22 + sway * 0.6, 2.0 + bob]], body);
      // arms: hang to the knees; rise toward you when close
      const raise = smoothstep(Math.max(near, c.lunge || 0));
      for (const s of [-1, 1]) {
        const ph = g + (s > 0 ? 0 : Math.PI);
        const swing = Math.sin(ph) * 0.05 * (1 - raise);
        const sx = s * 0.21 + sway * 0.6, sy = 1.95 + bob;
        const ex = s * lerp(0.24, 0.44, raise) + swing, ey = lerp(1.38, 1.72, raise);
        const hx = s * lerp(0.27, 0.24, raise) + swing * 2, hy = lerp(0.72, 1.52, raise);
        P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.055, body);
        const ang = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.85 : Math.PI * 0.15, raise);
        fingers(ctx, hx, hy, ang, lerp(0.16, 0.3, raise), 0.17 + raise * 0.05, 0.018, body);
      }
      // neck and head with a snapping tilt
      const tilt = headTiltJerk(t, 2.7, 0.33) * (1 - (c.lunge || 0));
      ctx.save();
      ctx.translate(sway * 0.6, 2.0 + bob);
      ctx.rotate(tilt);
      P_line(ctx, 0, 0, 0, 0.12, 0.07, body);
      P_ell(ctx, 0, 0.3, 0.115, 0.175, body);
      const faceA = clamp((26 - c.dist) / 22, 0, 1);
      if (faceA > 0) {
        ctx.globalAlpha = faceA;
        P_ell(ctx, 0, 0.285, 0.085, 0.13, skin);
        P_ell(ctx, -0.036, 0.315, 0.016, 0.012, eye);
        P_ell(ctx, 0.036, 0.315, 0.016, 0.012, eye);
        P_ell(ctx, -0.036, 0.315, 0.006, 0.006, body);
        P_ell(ctx, 0.036, 0.315, 0.006, 0.006, body);
        const mouth = 0.012 + near * 0.03 + (c.lunge || 0) * 0.045;
        P_ell(ctx, 0, 0.205, 0.028 + near * 0.012, mouth, body);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
  },

  // ================= THE CRAWLER: pale, on all fours, joints bent the wrong way. Bursts. Level 2 =================
  crawler: {
    name: 'the crawler', h: 1.1, w: 2.0, faceY: 0.3, stepRate: 2.4, catchDist: 1.3, sound: 'crawler',
    init(c) { c.mode = 'pause'; c.modeT = 0.4; },
    speedMult(c, dt, seen) {
      c.modeT += dt;
      if (c.mode === 'pause' && c.modeT > 1.05) { c.mode = 'scuttle'; c.modeT = 0; }
      else if (c.mode === 'scuttle' && c.modeT > 0.7) { c.mode = 'pause'; c.modeT = 0; }
      return c.mode === 'scuttle' ? 2.3 : 0.1;
    },
    draw(ctx, c, P) {
      const t = c.t;
      const scut = c.mode === 'scuttle' && !c.frozen;
      const near = clamp(1 - c.dist / 18, 0, 1);
      const lit = c.lit || 0;
      const skinC = mixc([150, 142, 130], [232, 224, 210], lit);
      const skin = P.col(skinC), skinD = P.col(scalec(skinC, 0.62));
      const dark = P.col([40, 30, 34]);
      const mouthC = P.col([12, 6, 8]);
      const j = k => (scut ? Math.sin(t * 57 + k * 7.3) * 0.035 + Math.sin(t * 91 + k * 3.1) * 0.02 : 0);
      const lift = c.mode === 'pause' ? smoothstep(Math.min(1, c.modeT / 0.5)) * 0.14 : 0;
      const lunge = c.lunge || 0;
      // rear legs (long, knees way out)
      for (const s of [-1, 1]) {
        P_limb(ctx, [[s * 0.2, 0.55 + j(1)], [s * 0.86 + j(2 + s), 0.78 + j(3)], [s * 0.98 + j(4 + s), 0.02]], 0.07, skinD);
        fingers(ctx, s * 0.98 + j(4 + s), 0.02, s > 0 ? 0.2 : Math.PI - 0.2, 0.35, 0.13, 0.02, skinD);
      }
      // hump of the back, spine showing
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.moveTo(-0.44, 0.26); ctx.bezierCurveTo(-0.4, 1.02 + j(5), 0.4, 1.02 + j(6), 0.44, 0.26); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 6; i++) { const a = -0.35 + i * 0.14; P_ell(ctx, a, 0.88 - Math.abs(a) * 1.15 + j(7 + i) * 0.5, 0.035, 0.028, skinD); }
      // front arms: elbows above the back
      for (const s of [-1, 1]) {
        const ex = s * 0.64 + j(8 + s), ey = 0.98 + j(9 + s), hx = s * 0.6 + j(10 + s);
        P_limb(ctx, [[s * 0.28, 0.6], [ex, ey], [hx, 0.02]], 0.075, skin);
        fingers(ctx, hx, 0.02, s > 0 ? 0.35 : Math.PI - 0.35, 0.4, 0.16, 0.022, skin);
      }
      // head: low, in front, no eyes, big mouth
      const hy = 0.3 + lift + lunge * 0.1;
      ctx.save(); ctx.translate(j(11) * 0.5, hy); ctx.rotate(lift * 1.2 + (scut ? Math.sin(t * 40) * 0.08 : 0));
      strands(ctx, 0, 0.06, 9, 0.28, dark, 3, t);
      P_ell(ctx, 0, 0, 0.16, 0.125, skin);
      P_ell(ctx, 0, 0.04, 0.12, 0.06, skinD);      // brow shadow
      const mw = 0.05 + (near * 0.5 + lunge) * 0.07, mh = 0.025 + (near * 0.5 + lunge) * 0.09;
      P_ell(ctx, 0, -0.045, mw, mh, mouthC);
      if (near > 0.2) for (let i = -2; i <= 2; i++) P_line(ctx, i * mw * 0.35, -0.045 + mh * 0.9, i * mw * 0.35, -0.045 + mh * 0.9 - mh * 0.45, 0.012, skin);
      ctx.restore();
    }
  },

  // ================= THE SMILER: walks calmly, arms dead still, grin far too wide. Hitches closer. Level 3 =================
  smiler: {
    name: 'the smiler', h: 1.95, w: 1.0, faceY: 1.72, stepRate: 1.3, catchDist: 1.4, sound: 'smiler',
    init(c) { c.nextHitch = 4.5; c.hitchT = 0; c.hitchFlash = 0; },
    speedMult(c, dt, seen) {
      c.hitchT += dt;
      if (c.hitchFlash > 0) c.hitchFlash -= dt;
      if (c.hitchT >= c.nextHitch && !c.frozen) {
        c.hitchT = 0; c.nextHitch = 3.2 + Math.random() * 3;
        c.u = Math.min(0.995, c.u + 0.02); c.hitchFlash = 0.18; c.hitched = true;
      }
      return 1;
    },
    draw(ctx, c, P) {
      const g = c.gait, t = c.t;
      const near = clamp(1 - c.dist / 22, 0, 1);
      const coat = P.col([16, 14, 20]), coatL = P.col([30, 27, 36]);
      const skin = P.col([216, 208, 198]);
      const white = P.col([246, 242, 236]);
      const black = P.col([4, 4, 6]);
      const bob = Math.abs(Math.sin(g)) * 0.028;
      const jx = c.hitchFlash > 0 ? (Math.random() - 0.5) * 0.09 : 0;
      const lunge = c.lunge || 0;
      ctx.save(); ctx.translate(jx, 0);
      // legs
      for (const s of [-1, 1]) {
        const ph = g + (s > 0 ? Math.PI : 0);
        const lift = Math.max(0, Math.sin(ph)) * 0.16;
        P_limb(ctx, [[s * 0.1, 0.95 + bob], [s * 0.12, 0.5 + lift * 0.6], [s * 0.13, lift + 0.03]], 0.11, coat);
        P_line(ctx, s * 0.1, lift + 0.03, s * 0.18, lift + 0.03, 0.06, black);
      }
      // long coat
      P_poly(ctx, [[-0.27, 0.62 + bob], [0.27, 0.62 + bob], [0.25, 1.62 + bob], [-0.25, 1.62 + bob]], coat);
      P_poly(ctx, [[-0.04, 1.0 + bob], [0.04, 1.0 + bob], [0.05, 1.6 + bob], [-0.05, 1.6 + bob]], coatL);
      // arms: perfectly still at the sides
      for (const s of [-1, 1]) {
        const ex = s * lerp(0.3, 0.36, lunge), hy = lerp(0.82, 1.35, lunge), hx = s * lerp(0.31, 0.22, lunge);
        P_limb(ctx, [[s * 0.26, 1.58 + bob], [ex, 1.15 + bob], [hx, hy + bob]], 0.075, coat);
        P_ell(ctx, hx, hy - 0.04 + bob, 0.04, 0.07, skin);
        if (near > 0.3 || lunge > 0) fingers(ctx, hx, hy - 0.08 + bob, lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, lunge), 0.2, 0.09 + near * 0.06, 0.016, skin);
      }
      // head, tilting further as it comes
      const tilt = (0.06 + near * 0.55 + lunge * 0.3) * (Math.floor(t / 7) % 2 ? -1 : 1);
      ctx.save(); ctx.translate(0, 1.62 + bob); ctx.rotate(tilt);
      P_line(ctx, 0, 0, 0, 0.08, 0.09, skin);
      P_ell(ctx, 0, 0.22, 0.125, 0.155, skin);
      // hair: slick, dark
      P_poly(ctx, [[-0.125, 0.25], [-0.1, 0.36], [0, 0.39], [0.1, 0.36], [0.125, 0.25], [0.06, 0.31], [-0.06, 0.31]], coat);
      // eyes: wide, whites showing
      const er = 0.026 + near * 0.014 + lunge * 0.01;
      P_ell(ctx, -0.047, 0.245, er, er * 1.05, white); P_ell(ctx, 0.047, 0.245, er, er * 1.05, white);
      P_ell(ctx, -0.047, 0.243, 0.008, 0.009, black); P_ell(ctx, 0.047, 0.243, 0.008, 0.009, black);
      // the grin
      const gw = 0.085 + near * 0.03 + lunge * 0.02, gd = 0.045 + near * 0.03 + lunge * 0.03;
      ctx.fillStyle = white; ctx.beginPath();
      ctx.moveTo(-gw, 0.15); ctx.quadraticCurveTo(0, 0.15 - gd * 0.25, gw, 0.15);
      ctx.quadraticCurveTo(0, 0.15 - gd * 2.2, -gw, 0.15); ctx.closePath(); ctx.fill();
      if (near > 0.15 || lunge > 0) {
        ctx.strokeStyle = P.cola([60, 40, 40], 0.8); ctx.lineWidth = 0.006; ctx.beginPath();
        for (let i = -3; i <= 3; i++) { const x = i * gw * 0.26; const d = gd * (1 - Math.abs(i) / 4.2); ctx.moveTo(x, 0.15 - d * 0.1); ctx.lineTo(x, 0.15 - d * 1.1); }
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();
    }
  },

  // ================= THE WATCHER: stone. Moves only when nothing is looking. Level 4 =================
  watcher: {
    name: 'the watcher', h: 2.15, w: 1.5, faceY: 1.8, stepRate: 0.8, catchDist: 1.6, sound: null, silentWhenSeen: true,
    init(c) { c.pose = 0; c.seenLast = true; },
    onSeen(c) {
      // it is never in the same pose twice in a row
      let p; do { p = 1 + Math.floor(Math.random() * 3); } while (p === c.pose);
      if (c.dist < 4) p = Math.random() < 0.5 ? 1 : 2;
      c.pose = p;
    },
    speedMult(c, dt, seen) { return seen ? 0 : 1; },
    draw(ctx, c, P) {
      const stone = P.col([104, 106, 108]), stoneD = P.col([58, 60, 64]), stoneL = P.col([132, 134, 136]);
      const hole = P.col([8, 8, 10]);
      const pale = P.col([200, 200, 196]);
      const pose = c.lunge ? 2 : c.pose;
      // robe
      P_poly(ctx, [[-0.55, 0], [0.55, 0], [0.3, 1.5], [-0.3, 1.5]], stone);
      P_poly(ctx, [[-0.12, 0], [0.02, 0], [0.06, 1.45], [-0.08, 1.45]], stoneD);
      P_poly(ctx, [[0.25, 0], [0.42, 0], [0.24, 1.42], [0.16, 1.42]], stoneD);
      // hood
      P_poly(ctx, [[-0.33, 1.42], [0.33, 1.42], [0.24, 2.05], [0, 2.15], [-0.24, 2.05]], stone);
      P_poly(ctx, [[-0.2, 1.5], [0.2, 1.5], [0.15, 2.0], [0, 2.06], [-0.15, 2.0]], hole);
      const shoulder = s => [s * 0.3, 1.45];
      if (pose === 0) {
        // covering its face
        for (const s of [-1, 1]) {
          P_limb(ctx, [shoulder(s), [s * 0.42, 1.1], [s * 0.1, 1.72]], 0.1, stone);
          P_ell(ctx, s * 0.07, 1.78, 0.085, 0.12, stoneL, s * 0.25);
        }
      } else if (pose === 1) {
        // reaching for you
        for (const s of [-1, 1]) {
          P_limb(ctx, [shoulder(s), [s * 0.5, 1.25], [s * 0.36, 1.05]], 0.1, stone);
          P_ell(ctx, s * 0.36, 1.05, 0.07, 0.06, stoneL);
          fingers(ctx, s * 0.36, 1.05, -Math.PI / 2 + s * 0.3, 0.35, 0.16, 0.03, stoneL);
        }
        P_ell(ctx, -0.055, 1.83, 0.02, 0.014, pale); P_ell(ctx, 0.055, 1.83, 0.02, 0.014, pale);
      } else if (pose === 2) {
        // screaming, head cocked
        for (const s of [-1, 1]) {
          P_limb(ctx, [shoulder(s), [s * 0.55, 1.3], [s * 0.62, 1.7]], 0.1, stone);
          fingers(ctx, s * 0.62, 1.7, Math.PI / 2 + s * 0.2, 0.35, 0.15, 0.03, stoneL);
        }
        ctx.save(); ctx.translate(0, 1.5); ctx.rotate(0.35);
        P_poly(ctx, [[-0.2, 0], [0.2, 0], [0.15, 0.5], [0, 0.56], [-0.15, 0.5]], hole);
        P_ell(ctx, -0.055, 0.33, 0.022, 0.016, pale); P_ell(ctx, 0.055, 0.33, 0.022, 0.016, pale);
        P_ell(ctx, 0, 0.15, 0.06, 0.09 + (c.lunge || 0) * 0.05, stoneD);
        P_ell(ctx, 0, 0.15, 0.045, 0.075 + (c.lunge || 0) * 0.05, hole);
        ctx.restore();
      } else {
        // pointing at you
        P_limb(ctx, [shoulder(-1), [-0.45, 1.15], [-0.36, 0.85]], 0.1, stone);
        P_limb(ctx, [shoulder(1), [0.5, 1.35], [0.28, 1.3]], 0.1, stone);
        P_ell(ctx, 0.28, 1.3, 0.07, 0.06, stoneL);
        P_line(ctx, 0.28, 1.3, 0.2, 1.27, 0.035, stoneL);
        P_ell(ctx, -0.055, 1.83, 0.02, 0.014, pale); P_ell(ctx, 0.055, 1.83, 0.02, 0.014, pale);
      }
      // cracks
      ctx.strokeStyle = stoneD; ctx.lineWidth = 0.012; ctx.beginPath();
      ctx.moveTo(-0.2, 0.3); ctx.lineTo(-0.1, 0.7); ctx.lineTo(-0.16, 0.95);
      ctx.moveTo(0.3, 0.2); ctx.lineTo(0.22, 0.55);
      ctx.stroke();
    }
  },

  // ================= THE RUNNER: sprints, drops to all fours to watch, sprints again. Level 5 =================
  runner: {
    name: 'the runner', h: 2.05, w: 1.7, faceY: 1.8, stepRate: 0.7, catchDist: 1.4, sound: 'runner',
    init(c) { c.mode = 'crouch'; c.modeT = -0.5; c.hits = 0; c.wounded = false; c.dead = false; c.hurtFlash = 0; },
    speedMult(c, dt, seen) {
      if (c.dead) return 0;
      c.modeT += dt;
      if (c.hurtFlash > 0) c.hurtFlash -= dt;
      if (c.wounded) {
        if (c.mode === 'stumble') { if (c.modeT > 1.5) { c.mode = 'sprint'; c.modeT = 0; } return 0; }
        return 1.6;
      }
      if (c.mode === 'sprint' && c.modeT > 2.3) { c.mode = 'crouch'; c.modeT = 0; }
      else if (c.mode === 'crouch' && c.modeT > 1.25) { c.mode = 'sprint'; c.modeT = 0; }
      return c.mode === 'sprint' ? 1.5 : 0;
    },
    lateral(c) { return c.dead ? c.latHold || 0 : Math.sin(c.t * 0.85) * 1.1 * clamp((c.dist - 4) / 10, 0, 1); },
    draw(ctx, c, P) {
      const g = c.gait, t = c.t;
      const near = clamp(1 - c.dist / 20, 0, 1);
      const rags = P.col([26, 22, 22]), ragsL = P.col([48, 40, 38]);
      const skin = P.col([196, 184, 172]), skinD = P.col([120, 104, 96]);
      const black = P.col([6, 4, 6]);
      const blood = P.col([120, 10, 12]);
      const lunge = c.lunge || 0;
      const hurt = c.hurtFlash > 0;
      if (c.dead) {
        // lying face-up in the snow
        P_ell(ctx, 0, 0.16, 0.95, 0.15, rags);
        P_line(ctx, -0.6, 0.2, -0.9, 0.45, 0.07, rags); P_line(ctx, 0.7, 0.18, 0.95, 0.05, 0.07, rags);
        P_ell(ctx, -0.95, 0.2, 0.16, 0.14, skin);
        P_ell(ctx, -0.5, 0.06, 0.55, 0.06, blood);
        return;
      }
      const crouch = c.mode === 'crouch' || c.mode === 'stumble';
      if (crouch && !lunge) {
        const stumble = c.mode === 'stumble';
        const lift = smoothstep(Math.min(1, Math.max(0, c.modeT) / 0.4));
        // on all fours, head raised toward you
        for (const s of [-1, 1]) {
          P_limb(ctx, [[s * 0.22, 0.62], [s * 0.6, 0.55], [s * 0.72, 0.02]], 0.08, rags);
          P_limb(ctx, [[s * 0.25, 0.75], [s * 0.48, 0.4], [s * 0.42, 0.02]], 0.07, skin);
          fingers(ctx, s * 0.42, 0.02, s > 0 ? 0.3 : Math.PI - 0.3, 0.35, 0.14, 0.02, skin);
        }
        ctx.fillStyle = rags; ctx.beginPath(); ctx.moveTo(-0.34, 0.3); ctx.bezierCurveTo(-0.3, 1.0, 0.3, 1.0, 0.34, 0.3); ctx.closePath(); ctx.fill();
        if (stumble) P_ell(ctx, 0.1, 0.55, 0.14, 0.1, blood);
        const hy = 0.55 + lift * 0.22;
        ctx.save(); ctx.translate(0, hy); ctx.rotate(Math.sin(t * 2.2) * 0.12);
        strands(ctx, 0, 0.1, 9, 0.36, black, 5, t);
        P_ell(ctx, 0, 0, 0.14, 0.17, skin);
        P_ell(ctx, -0.055, 0.03, 0.036, 0.04, black); P_ell(ctx, 0.055, 0.03, 0.036, 0.04, black);
        P_ell(ctx, 0, -0.1, 0.045, 0.06 + near * 0.03, black);
        ctx.restore();
        if (hurt) { ctx.globalAlpha = 0.5; P_ell(ctx, 0, 0.5, 0.9, 0.6, blood); ctx.globalAlpha = 1; }
        return;
      }
      // sprinting (or lunging)
      const bob = Math.abs(Math.sin(g)) * 0.09 * (1 - lunge);
      const lean = 0.12 * (1 - lunge);
      const wounded = c.wounded ? 1 : 0;
      for (const s of [-1, 1]) {
        const ph = g + (s > 0 ? Math.PI : 0);
        const lift = Math.max(0, Math.sin(ph)) * 0.55 * (1 - lunge);
        const hx = s * 0.1, hy = 1.0 + bob;
        P_limb(ctx, [[hx, hy], [s * (0.2 + lift * 0.25), 0.55 + lift * 0.55], [s * (0.22 + lift * 0.1), lift * 0.65 + 0.03]], 0.085, rags);
        P_ell(ctx, s * (0.22 + lift * 0.1), lift * 0.65 + 0.03, 0.06, 0.04, skinD);
      }
      // torso leaning at you
      P_poly(ctx, [[-0.2, 0.95 + bob], [0.2, 0.95 + bob], [0.27 + lean, 1.6 + bob - wounded * 0.1], [-0.27 + lean, 1.6 + bob - wounded * 0.1]], rags);
      P_poly(ctx, [[-0.08, 1.0 + bob], [0.1, 1.05 + bob], [0.14, 1.5 + bob], [-0.05, 1.45 + bob]], ragsL);
      if (c.wounded) P_ell(ctx, 0.12, 1.25 + bob, 0.12, 0.14, blood);
      // arms: pumping wildly, elbows out; reaching when lunging
      for (const s of [-1, 1]) {
        const ph = g + (s > 0 ? 0 : Math.PI);
        const sw = Math.sin(ph) * (1 - lunge);
        const sx = s * 0.25 + lean, sy = 1.55 + bob;
        const ex = s * lerp(0.42, 0.5, lunge) + sw * 0.05, ey = lerp(1.2 + sw * 0.25, 1.45, lunge);
        const hx = s * lerp(0.28, 0.3, lunge) + sw * 0.1, hy = lerp(1.35 + sw * 0.35, 1.35, lunge);
        P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.07, rags);
        P_ell(ctx, hx, hy, 0.045, 0.055, skin);
        fingers(ctx, hx, hy, lerp(-Math.PI / 2 + sw * 0.5, s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, lunge), 0.3, 0.12 + lunge * 0.06, 0.018, skin);
      }
      // head: sockets and a slack jaw
      ctx.save(); ctx.translate(lean * 0.8, 1.6 + bob); ctx.rotate(Math.sin(g * 0.5) * 0.08 * (1 - lunge));
      P_line(ctx, 0, 0, 0, 0.08, 0.08, skin);
      strands(ctx, 0, 0.3, 9, 0.34, black, 5, t);
      P_ell(ctx, 0, 0.22, 0.13, 0.16, skin);
      P_ell(ctx, -0.052, 0.25, 0.036, 0.042, black); P_ell(ctx, 0.052, 0.25, 0.036, 0.042, black);
      P_ell(ctx, 0, 0.1, 0.045, 0.06 + near * 0.04 + lunge * 0.05, black);
      ctx.restore();
      if (hurt) { ctx.globalAlpha = 0.5; P_ell(ctx, 0, 1.1, 0.7, 0.9, blood); ctx.globalAlpha = 1; }
    }
  }
};
