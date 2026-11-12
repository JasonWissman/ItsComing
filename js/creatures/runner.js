'use strict';
CREATURES.runner = {
  name: 'the runner', h: 2.05, w: 1.7, faceY: 1.8, stepRate: 0.7, catchDist: 1.4, sound: 'runner',
  // the night stands it on what is under its feet (c.stand, the height of the step or the deck, which it keeps in
  // c.yOff); the lunge starts from there, rather than from the ground under the boards
  death: { delay: 0.1, dur: 0.22, sting: 'stingHit', pose(c, k) { if (c.stand) c.yOff += c.stand * (1 - smoothstep(k)); } },
  voice: { kind: 'pant', every: [3, 6] },
  // It sprints at you, drops to all fours to watch, and sprints again. Out in the open, at the end of a sprint or of a
  // watch, it often breaks sideways to a new place instead (c.mode 'dart'), running side on, flat out and a little toward
  // you, and drops to watch again from there; from wherever it is it then comes straight at you (c.dartAng, the angle off
  // its way, closes as it nears). A bow drawn on it may make it break sideways the same way, nearer in too (dodge; the
  // night rolls for it). Hit once it goes down and gets back up faster (hurt); with all your arrows gone it stops watching
  // altogether (c.reckless). Killed, it falls the way it was going (kill) and lies in the snow, with whatever arrows are in
  // it (c.arrows).
  init(c) { c.mode = 'crouch'; c.modeT = -0.5; c.sprintFor = this.SPRINT[0]; c.hits = 0; c.wounded = false; c.dead = false; c.hurtFlash = 0; c.dartAng = 0; c.darts = 0; c.weave = 1; c.arrows = []; },
  speedMult(c, dt, seen) {
    if (c.dead) { c.deadT = (c.deadT || 0) + dt; return 0; }
    c.modeT += dt;
    if (c.hurtFlash > 0) c.hurtFlash -= dt;
    c.weave = clamp(c.weave + dt * (c.mode === 'dart' ? -3 : 1.5), 0, 1);   // no weaving while it runs side on
    if (c.mode === 'dart') {   // (wounded, it may still break sideways from a bow drawn on it, and it runs on from there)
      c.runGait = (c.runGait || 0) + dt * 17;
      const n = Math.floor(c.runGait / Math.PI);
      if (n !== c.runStep) { c.runStep = n; AUDIO.footstep('runner', clamp(2.4 / (c.dist + 1.6), 0, 0.85) * 0.6, Math.sin(wrapPi(c.yaw - G.cam.yaw)) * 0.85); }
      if (c.modeT >= c.dartDur) {   // and drops to watch, a little less long (wounded, or with nothing left to fear, it comes on)
        c.dartAng = c.dartTo;
        if (c.wounded || c.reckless) this.sprint(c); else { c.mode = 'crouch'; c.modeT = 0.35; }
      }
      return c.dartK || 0;
    }
    if (c.wounded || c.reckless) {
      if (c.mode === 'stumble') { if (c.modeT > 1.5) { c.mode = 'sprint'; c.modeT = 0; } return 0; }
      if (c.mode !== 'sprint') this.sprint(c);
      return c.reckless ? 2.3 : 2.0;
    }
    // a sprint of SPRINT seconds, then it breaks sideways (DART_SPRINT of the time) or drops to watch for CROUCH seconds,
    // then breaks sideways (DART_CROUCH) or sprints again
    if (c.mode === 'sprint' && c.modeT > c.sprintFor) { if (!this.dart(c, this.DART_SPRINT)) { c.mode = 'crouch'; c.modeT = 0; } }
    else if (c.mode === 'crouch' && c.modeT > this.CROUCH && !this.dart(c, this.DART_CROUCH)) this.sprint(c);
    return c.mode === 'sprint' ? this.RUN : 0;
  },
  RUN: 2.1, SPRINT: [1.4, 2.2], CROUCH: 0.8, DART_SPRINT: 0.4, DART_CROUCH: 0.6, DART_NEAR: 16,
  sprint(c) { c.mode = 'sprint'; c.modeT = 0; c.sprintFor = lerp(this.SPRINT[0], this.SPRINT[1], c.rand()); },
  // break sideways along the tree line (chance k), as often as it likes while it is out past DART_NEAR m (c.darts counts
  // them; a test that wants it to keep still sets it to Infinity): a few metres to one side, never more than MAX (7
  // degrees) off its way, which the porch leaves open on either side, at about 11 m/s, closing a little as it goes
  // (c.dartK; a dodge does too)
  dart(c, k) {
    if (c.darts === Infinity || c.dist < this.DART_NEAR || c.rand() >= k) return false;
    c.darts++;
    this.breakAway(c);
    return true;
  },
  breakAway(c) {
    const MAX = 0.13;
    const from = c.dartAng, step = () => 0.07 + c.rand() * 0.06;
    let to = from + (c.rand() < 0.5 ? -1 : 1) * step();
    if (Math.abs(to) > MAX) to = from - Math.sign(to) * step();
    to = clamp(to, -MAX, MAX);
    Object.assign(c, { mode: 'dart', modeT: 0, dartFrom: from, dartTo: to, runDir: to > from ? 1 : -1, dartK: 0.9, dartDur: clamp(Math.abs(to - from) * c.dist / 11, 0.45, 1.1) });
  },
  // a bow drawn on it (night 5): it may break sideways to a new place, as it does in the tree line, at least 4 degrees from
  // where it was (so the aim has to come after it), and drop to watch from there; wounded, it comes on from there. Not
  // while it is down, already running side on, lunging, or with nothing left to fear, nor once it is near enough that a
  // run to the side would barely move it in the view (DODGE_NEAR m). canDodge says whether it could now.
  DODGE_NEAR: 10,
  canDodge(c) { return !c.dead && !c.reckless && !c.lunge && !c.round && c.mode !== 'dart' && c.mode !== 'stumble' && c.dist >= this.DODGE_NEAR; },
  dodge(c) {
    if (!this.canDodge(c)) return false;
    this.breakAway(c);
    return true;
  },
  ang(c) { return c.mode === 'dart' ? lerp(c.dartFrom, c.dartTo, smoothstep(c.modeT / c.dartDur)) : c.dartAng; },
  settle(c) { if (c.mode === 'dart') c.dartAng = this.ang(c); },   // stopped part way through a run: it stays where it got to
  hurt(c) { this.settle(c); c.wounded = true; c.mode = 'stumble'; c.modeT = 0; },
  // killed: it falls the way it was going, and if it was sprinting its weight carries it on a metre or so through the snow
  kill(c) {
    c.deadFrom = c.mode === 'sprint' ? 'sprint' : 'crouch';
    this.settle(c);
    c.dead = true; c.deadT = 0; c.latHold = c.lat; c.hold = null;
    let v = c.deadFrom === 'crouch' ? 0 : 4.5;
    c.distFn = (cr, dt) => { v *= Math.exp(-dt * 3.5); return Math.max(Math.min(cr.dist, 1.8), cr.dist - v * dt); };
  },
  // the part of its box its pose fills, for aiming at it: crouched it is half its height, side on it is wider
  body(c) {
    if (c.mode === 'dart' && !c.lunge) return [-0.85, 0.85, 0, 1.85];
    if ((c.mode === 'crouch' || c.mode === 'stumble') && !c.lunge) return [-0.75, 0.75, 0, 1.0];
    return [-0.55, 0.55, 0, 2.0];
  },
  lateral(c) {
    if (c.dead) return c.latHold || 0;
    const near = clamp((c.dist - 3) / 12, 0, 1);
    return Math.tan(this.ang(c)) * c.dist * near + Math.sin(c.t * 1.3) * 1.1 * clamp((c.dist - 4) / 10, 0, 1) * c.weave;
  },
  // Hit, its body twitches: small sharp jerks, each a kick that comes in a frame or two and settles at once, at odd moments
  // and on each part of it apart (0 its trunk, 1 and 2 its limbs on the left and right, 3 its head, 4 and 5 the arrows in
  // it, which go with the trunk and shake on their own), the arrows going with the body they are in. twitch(c) is how
  // hard, 0..1: a little while it is up and coming on wounded, more while it is down from the first hit, and lying dead
  // hardest as it lands, fewer and weaker jerks after that, dying away over a few seconds. Reduced motion: a small part of
  // it. jerks(c) is each part's, about -1..1 at the most.
  twitch(c) {
    let k = 0;
    if (c.dead) { const e = (c.deadT || 0) - 0.85; k = e < 0 ? 0.8 : Math.exp(-e / 1.1); }
    else if (c.wounded) k = c.mode === 'stumble' ? 0.8 : 0.35;
    return k * (SAVE.data.settings.reducedMotion ? 0.15 : 1) * (1 - (c.lunge || 0));
  },
  jerks(c) {
    const k = this.twitch(c), t = c.t, out = [0, 0, 0, 0, 0, 0];
    if (k <= 0) return out;
    const live = Math.min(1, k / 0.8);   // as it weakens there are fewer of them
    for (let j = 0; j < 6; j++) {
      const rate = 2.6 + (j % 3) * 0.55, o = j * 0.37, n = Math.floor(t * rate + o);
      let v = 0;
      for (let m = n - 2; m <= n; m++) {   // one chance of a kick in each slot of 1/rate seconds; the last few are still settling
        const r = q => { const x = Math.sin(m * 12.9898 + j * 78.233 + q * 37.719) * 43758.5453; return x - Math.floor(x); };
        if (r(0) > 0.3 + 0.5 * live) continue;
        const e = t - (m + r(1) - o) / rate;
        if (e > 0) v += (r(2) < 0.5 ? -1 : 1) * (0.55 + 0.45 * r(3)) * Math.exp(-e * 8) * (1 - Math.exp(-e * 70));
      }
      out[j] = v * 1.45 * k;   // (the kick tops out at about seven tenths)
    }
    return out;
  },
  // turned by a about (x, y)
  about(ctx, x, y, a) { ctx.translate(x, y); ctx.rotate(a); ctx.translate(-x, -y); },
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
      const k = clamp((c.deadT || 0) / 0.85, 0, 1);
      if (k < 1) { this.drawFall(ctx, c, P, k); return; }
      // lying face-up in the snow, the arrows standing up out of it, its head the way it fell
      // (twitching: the trunk jerks up off the snow and back, the arm and the leg kick, the head knocks, the arrows go with it)
      if ((c.latHold || 0) >= 0) ctx.scale(-1, 1);
      const J = this.jerks(c);
      ctx.save(); ctx.translate(0, Math.abs(J[0]) * 0.06); this.about(ctx, 0, 0.12, J[0] * 0.07);
      P_ell(ctx, 0, 0.16, 0.95, 0.15, rags);
      const ax = -0.6 + Math.cos(2.45 + J[1] * 0.6) * 0.39, ay = 0.2 + Math.sin(2.45 + J[1] * 0.6) * 0.39;   // the arm flung out above its head
      P_line(ctx, -0.6, 0.2, ax, ay, 0.07, rags);
      fingers(ctx, ax, ay, 2.45 + J[1] * 0.8, 0.3 + Math.abs(J[1]) * 0.25, 0.11, 0.018, skin);
      const lx = 0.7 + Math.cos(-0.48 + J[2] * 0.6) * 0.28, ly = 0.18 + Math.sin(-0.48 + J[2] * 0.6) * 0.28;
      P_line(ctx, 0.7, 0.18, lx, ly, 0.07, rags);
      P_ell(ctx, -0.95 - Math.abs(J[3]) * 0.03, 0.2 + J[3] * 0.06, 0.16, 0.14, skin, J[3] * 0.2);
      P_ell(ctx, -0.5, 0.06, 0.55, 0.06, blood);
      c.arrows.forEach((a, i) => this.arrow(ctx, P, -0.3 + i * 0.32, 0.24, i, J[4 + i % 2] * 0.3));
      ctx.restore();
      return;
    }
    if (c.mode === 'dart' && !lunge) { this.drawRun(ctx, c, P); return; }
    const crouch = c.mode === 'crouch' || c.mode === 'stumble';
    if (crouch && !lunge) {
      const stumble = c.mode === 'stumble';
      const lift = smoothstep(Math.min(1, Math.max(0, c.modeT) / 0.4));
      const J = this.jerks(c);   // hit, it twitches: the knees and elbows kick out, the back and the arrows in it jerk, the head knocks
      // on all fours, head raised toward you
      for (const s of [-1, 1]) {
        const js = J[s > 0 ? 2 : 1];
        P_limb(ctx, [[s * 0.22, 0.62], [s * (0.6 + js * 0.07), 0.55 + js * 0.05], [s * 0.72, 0.02]], 0.08, rags);
        P_limb(ctx, [[s * 0.25, 0.75], [s * (0.48 - js * 0.08), 0.4 - js * 0.04], [s * 0.42, 0.02]], 0.07, skin);
        fingers(ctx, s * 0.42, 0.02, (s > 0 ? 0.3 : Math.PI - 0.3) + s * js * 0.25, 0.35 + Math.abs(js) * 0.12, 0.14, 0.02, skin);
      }
      ctx.save(); ctx.translate(0, Math.abs(J[0]) * 0.03); this.about(ctx, 0, 0.3, J[0] * 0.06);
      ctx.fillStyle = rags; ctx.beginPath(); ctx.moveTo(-0.34, 0.3); ctx.bezierCurveTo(-0.3, 1.0, 0.3, 1.0, 0.34, 0.3); ctx.closePath(); ctx.fill();
      if (stumble) P_ell(ctx, 0.1, 0.55, 0.14, 0.1, blood);
      c.arrows.forEach((a, i) => this.arrow(ctx, P, i ? -0.19 : 0.2, 0.47 + i * 0.05, i, J[4 + i % 2] * 0.3));   // in its back either side of its raised head, which hid them
      const hy = 0.55 + lift * 0.22;
      ctx.save(); ctx.translate(0, hy); ctx.rotate(Math.sin(t * 2.2) * 0.12 + J[3] * 0.18);
      strands(ctx, 0, 0.1, 9, 0.36, black, 5, t);
      P_ell(ctx, 0, 0, 0.14, 0.17, skin);
      P_ell(ctx, -0.055, 0.03, 0.036, 0.04, black); P_ell(ctx, 0.055, 0.03, 0.036, 0.04, black);
      P_ell(ctx, 0, -0.1, 0.045, 0.06 + near * 0.03, black);
      ctx.restore();
      ctx.restore();
      if (hurt) { ctx.globalAlpha = 0.5; P_ell(ctx, 0, 0.5, 0.9, 0.6, blood); ctx.globalAlpha = 1; }
      return;
    }
    // sprinting (or lunging)
    const bob = Math.abs(Math.sin(g)) * 0.09 * (1 - lunge);
    const lean = 0.12 * (1 - lunge);
    const wounded = c.wounded ? 1 : 0;
    const J = this.jerks(c);   // wounded, it twitches as it runs: its trunk, arms and head jerk, and the arrows in it
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? Math.PI : 0);
      const lift = Math.max(0, Math.sin(ph)) * 0.55 * (1 - lunge);
      const hx = s * 0.1, hy = 1.0 + bob;
      P_limb(ctx, [[hx, hy], [s * (0.2 + lift * 0.25), 0.55 + lift * 0.55], [s * (0.22 + lift * 0.1), lift * 0.65 + 0.03]], 0.085, rags);
      P_ell(ctx, s * (0.22 + lift * 0.1), lift * 0.65 + 0.03, 0.06, 0.04, skinD);
    }
    // torso leaning at you (and all above the hips with it, as it jerks)
    ctx.save(); this.about(ctx, 0, 1.0 + bob, J[0] * 0.05);
    P_poly(ctx, [[-0.2, 0.95 + bob], [0.2, 0.95 + bob], [0.27 + lean, 1.6 + bob - wounded * 0.1], [-0.27 + lean, 1.6 + bob - wounded * 0.1]], rags);
    P_poly(ctx, [[-0.08, 1.0 + bob], [0.1, 1.05 + bob], [0.14, 1.5 + bob], [-0.05, 1.45 + bob]], ragsL);
    if (c.wounded) P_ell(ctx, 0.12, 1.25 + bob, 0.12, 0.14, blood);
    c.arrows.forEach((a, i) => this.arrow(ctx, P, lean * 0.6 + 0.08 - i * 0.17, 1.27 + bob + i * 0.12, i, J[4 + i % 2] * 0.3));
    // arms: pumping wildly, elbows out; reaching when lunging
    for (const s of [-1, 1]) {
      const ph = g + (s > 0 ? 0 : Math.PI);
      const sw = Math.sin(ph) * (1 - lunge);
      const sx = s * 0.25 + lean, sy = 1.55 + bob;
      const js = J[s > 0 ? 2 : 1], ex = s * (lerp(0.42, 0.5, lunge) + js * 0.06) + sw * 0.05, ey = lerp(1.2 + sw * 0.25, 1.45, lunge) + js * 0.05;
      const hx = s * lerp(0.28, 0.3, lunge) + sw * 0.1, hy = lerp(1.35 + sw * 0.35, 1.35, lunge);
      P_limb(ctx, [[sx, sy], [ex, ey], [hx, hy]], 0.07, rags);
      P_ell(ctx, hx, hy, 0.045, 0.055, skin);
      fingers(ctx, hx, hy, lerp(-Math.PI / 2 + sw * 0.5, s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, lunge), 0.3, 0.12 + lunge * 0.06, 0.018, skin);
    }
    // head: sockets and a slack jaw
    ctx.save(); ctx.translate(lean * 0.8, 1.6 + bob); ctx.rotate(Math.sin(g * 0.5) * 0.08 * (1 - lunge) + J[3] * 0.15);
    P_line(ctx, 0, 0, 0, 0.08, 0.08, skin);
    strands(ctx, 0, 0.3, 9, 0.34, black, 5, t);
    P_ell(ctx, 0, 0.22, 0.13, 0.16, skin);
    P_ell(ctx, -0.052, 0.25, 0.036, 0.042, black); P_ell(ctx, 0.052, 0.25, 0.036, 0.042, black);
    P_ell(ctx, 0, 0.1, 0.045 + lunge * 0.01, 0.055 + near * 0.025 + lunge * 0.03, black);
    ctx.restore();
    ctx.restore();
    if (hurt) { ctx.globalAlpha = 0.5; P_ell(ctx, 0, 1.1, 0.7, 0.9, blood); ctx.globalAlpha = 1; }
  },
  // an arrow in it, coming out toward you: a short stub of shaft, the two vanes and the nock (exaggerated a little, so it
  // reads from the porch); tilt turns it about where it goes in (shaken as the body it is in jerks)
  arrow(ctx, P, x, y, i, tilt) {
    if (tilt) { ctx.save(); this.about(ctx, x, y, tilt); this.arrow(ctx, P, x, y, i); ctx.restore(); return; }
    const s = i % 2 ? -1 : 1, ex = x + s * 0.09, ey = y + 0.2;
    P_line(ctx, x, y, ex, ey, 0.03, P.col([176, 142, 98]));
    P_poly(ctx, [[ex - s * 0.03, ey - 0.07], [ex + s * 0.05, ey - 0.02], [ex + s * 0.02, ey + 0.03]], P.col([178, 46, 38]));
    P_poly(ctx, [[ex - s * 0.03, ey - 0.07], [ex - s * 0.08, ey - 0.01], [ex - s * 0.03, ey + 0.03]], P.col([224, 214, 192]));
    P_ell(ctx, ex, ey, 0.022, 0.022, P.col([40, 30, 24]));
  },
  // side on, flat out along the tree line: bent far forward, the rag-wound legs reaching and kicking up behind on bare
  // pale feet, the long pale arms pumping with the fingers spread, the head pushed out ahead with its hair streaming back,
  // one black socket and the jaw hanging open. c.runDir is +1 running to the right of the view, -1 to the left.
  drawRun(ctx, c, P) {
    const g = c.runGait || 0, t = c.t;
    const rags = P.col([26, 22, 22]), ragsL = P.col([48, 40, 38]), skin = P.col([196, 184, 172]), skinD = P.col([120, 104, 96]), black = P.col([6, 4, 6]);
    const farRags = P.col([16, 13, 13]), farSkin = P.col([150, 138, 128]);
    const lean = 0.55, thigh = 0.48, shin = 0.5, upper = 0.36, fore = 0.36;
    ctx.save(); ctx.scale(c.runDir || 1, 1);
    const legs = [0, Math.PI].map(o => {
      const ph = g + o, a = Math.sin(ph) * 0.9, bend = 0.3 + 1.7 * Math.max(0, Math.cos(ph));   // the knee folds as the leg swings through
      const kx = Math.sin(a) * thigh, ky = -Math.cos(a) * thigh;
      return { ph, kx, ky, fx: kx + Math.sin(a - bend) * shin, fy: ky - Math.cos(a - bend) * shin };
    });
    const hipX = -0.12, hipY = 0.04 - Math.min(legs[0].fy, legs[1].fy) + Math.abs(Math.sin(g)) * 0.04;   // whichever foot is lowest is on the ground
    const sx = hipX + Math.sin(lean) * 0.6, sy = hipY + Math.cos(lean) * 0.6;
    const limb = (l, far) => {
      const r = far ? farRags : rags, sk = far ? farSkin : skin;
      P_limb(ctx, [[hipX, hipY], [hipX + l.kx, hipY + l.ky], [hipX + l.fx, hipY + l.fy]], 0.085, r);
      P_line(ctx, hipX + l.fx - 0.03, hipY + l.fy, hipX + l.fx + 0.12, hipY + l.fy - 0.015, 0.06, far ? farSkin : skinD);   // the bare foot, toes forward
      // the arm on the other side swings against this leg: rags to the elbow, then the pale forearm and the long fingers
      const aa = -Math.sin(l.ph) * 1.1, ex = sx + Math.sin(aa) * upper, ey = sy - Math.cos(aa) * upper, fa = aa + 1.3;
      const hx = ex + Math.sin(fa) * fore, hy = ey - Math.cos(fa) * fore;
      P_line(ctx, sx, sy, ex, ey, 0.075, r);
      P_line(ctx, ex, ey, hx, hy, 0.055, sk);
      fingers(ctx, hx, hy, Math.atan2(hy - ey, hx - ex), 0.32, 0.13, 0.018, sk);
    };
    limb(legs[1], true);   // the far side first, a shade darker
    // the torso, side on and bent far over, in its rags; a lighter tear down its back
    P_poly(ctx, [[hipX - 0.16, hipY - 0.06], [hipX + 0.12, hipY - 0.08], [sx + 0.14, sy - 0.02], [sx - 0.12, sy + 0.08]], rags);
    P_line(ctx, hipX - 0.08, hipY + 0.05, sx - 0.08, sy + 0.04, 0.05, ragsL);
    const J = this.jerks(c);   // wounded, the arrows in it shake as it twitches
    (c.arrows || []).forEach((a, i) => this.arrow(ctx, P, lerp(hipX, sx, 0.55) - i * 0.12, lerp(hipY, sy, 0.55) + 0.05, i, J[4 + i % 2] * 0.3));
    limb(legs[0], false);
    // the neck and the head, thrust out ahead of the shoulders; the hair streams back behind it
    const nx = sx + Math.sin(lean + 0.45) * 0.14, ny = sy + Math.cos(lean + 0.45) * 0.14;
    P_line(ctx, sx, sy, nx, ny, 0.075, skin);
    const hx = nx + Math.sin(lean + 0.2) * 0.15, hy = ny + Math.cos(lean + 0.2) * 0.15;
    ctx.save(); ctx.translate(hx - 0.04, hy + 0.06); ctx.rotate(-1.05); strands(ctx, 0, 0, 9, 0.4, black, 5, t * 2.5); ctx.restore();
    P_ell(ctx, hx, hy, 0.15, 0.13, skin, -0.25);
    P_ell(ctx, hx + 0.07, hy + 0.03, 0.035, 0.04, black);                 // the socket
    P_ell(ctx, hx + 0.08, hy - 0.08, 0.04, 0.05 + Math.abs(Math.sin(g)) * 0.015, black);   // the jaw, hanging open
    ctx.restore();
  },
  // falling, killed (always by a second arrow, so it is sprinting, or still down from the first, or caught side on breaking
  // away from a draw, when it goes down as from all fours): its knees give, it sags onto them and topples sideways into the
  // snow (then it is drawn lying)
  drawFall(ctx, c, P, k) {
    if (c.deadFrom === 'crouch') {   // still down on all fours from the first: it sinks flat, its limbs going out from under it
      ctx.save(); ctx.scale(1 + 0.3 * smoothstep(k), 1 - 0.75 * easeIn(k));
      this.draw(ctx, Object.assign({}, c, { dead: false, mode: 'stumble', modeT: 1, hurtFlash: 0 }), P);
      ctx.restore();
      return;
    }
    const rags = P.col([26, 22, 22]), ragsL = P.col([48, 40, 38]), skin = P.col([196, 184, 172]), black = P.col([6, 4, 6]), blood = P.col([120, 10, 12]);
    const kb = smoothstep(k / 0.4), side = (c.latHold || 0) >= 0 ? 1 : -1, tip = smoothstep((k - 0.4) / 0.6) * 1.4;   // it goes over away from its way
    const crouched = c.deadFrom === 'crouch';
    const hip = lerp(crouched ? 0.62 : 1.0, 0.5, kb), sh = hip + lerp(0.62, 0.48, kb);
    ctx.save(); ctx.translate(side * 0.25, 0); ctx.rotate(-side * tip); ctx.translate(-side * 0.25, 0);
    for (const s of [-1, 1]) {   // the knees go down into the snow
      P_limb(ctx, [[s * 0.1, hip], [s * 0.24, lerp(0.5, 0.07, kb)], [s * 0.3, 0.03]], 0.085, rags);
    }
    P_poly(ctx, [[-0.2, hip - 0.05], [0.2, hip - 0.05], [0.26, sh], [-0.26, sh]], rags);
    P_poly(ctx, [[-0.07, hip], [0.09, hip + 0.03], [0.12, sh - 0.08], [-0.04, sh - 0.1]], ragsL);
    P_ell(ctx, 0.12, lerp(hip, sh, 0.45), 0.12, 0.14, blood);
    c.arrows.forEach((a, i) => this.arrow(ctx, P, 0.06 - i * 0.17, lerp(hip, sh, 0.5) + i * 0.1, i));
    for (const s of [-1, 1]) {   // the arms fly out as it drops, then hang
      const fl = Math.sin(Math.min(1, k / 0.4) * Math.PI) * 0.5;
      const ex = s * (0.42 + fl * 0.2), ey = sh - 0.28 + fl * 0.35, hx = s * (0.4 + fl * 0.3), hy = hip - 0.12 + fl * 0.6;
      P_limb(ctx, [[s * 0.25, sh - 0.03], [ex, ey], [hx, hy]], 0.07, rags);
      fingers(ctx, hx, hy, -Math.PI / 2 + s * fl, 0.3, 0.12, 0.018, skin);
    }
    ctx.save(); ctx.translate(0, sh); ctx.rotate(side * 0.6 * kb);   // the head lolls
    P_line(ctx, 0, 0, 0, 0.08, 0.08, skin);
    strands(ctx, 0, 0.3, 9, 0.34, black, 5, c.t);
    P_ell(ctx, 0, 0.2, 0.13, 0.16, skin);
    P_ell(ctx, -0.052, 0.23, 0.036, 0.042, black); P_ell(ctx, 0.052, 0.23, 0.036, 0.042, black);
    P_ell(ctx, 0, 0.08, 0.045, 0.07, black);
    ctx.restore();
    ctx.restore();
  },
};
