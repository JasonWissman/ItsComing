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
  // night rolls for it). Unhurt it is bold: while the bow is drawn on it (c.drawnOn, the night's) it does not break away
  // by itself and its weave narrows, so the first shot is the easier one. Hit once (hurt) it falls, lies in the snow a
  // moment and gets up (c.mode 'stumble', through DOWN), and then it is wary: it comes on faster and never straight, its
  // weave wide, quick and uneven (WARY), breaking to one side every second or two (JINK) until it is near. With all your
  // arrows gone it stops watching altogether and comes straight (c.reckless). Killed, it falls the way it was going (kill)
  // and lies in the snow, with whatever arrows are in it (c.arrows).
  init(c) { c.mode = 'crouch'; c.modeT = -0.5; c.sprintFor = this.SPRINT[0]; c.hits = 0; c.wounded = false; c.dead = false; c.hurtFlash = 0; c.dartAng = 0; c.darts = 0; c.weave = 1; c.wv = 0; c.weaveA = this.WEAVE[0]; c.arrows = []; },
  speedMult(c, dt, seen) {
    if (c.dead) { c.deadT = (c.deadT || 0) + dt; return 0; }
    c.modeT += dt;
    if (c.hurtFlash > 0) c.hurtFlash -= dt;
    this.creep(c, dt);
    const down = c.mode === 'stumble', wary = c.wounded && !c.reckless;
    if (!down) {   // its weave goes on (c.wv), as wide as it now is (c.weaveA); down in the snow it lies where it fell
      const W = wary ? this.WARY : this.WEAVE;
      c.weave = clamp(c.weave + dt * (c.mode === 'dart' ? -3 : 1.5), 0, 1);   // no weaving while it runs side on
      c.wv += dt * W[1];
      c.weaveA += clamp(W[0] * (c.drawnOn && !c.wounded ? this.CALM : 1) - c.weaveA, -dt * 1.2, dt * 1.2);
    }
    if (c.mode === 'dart') {   // (wounded, it breaks sideways by itself and from a bow drawn on it, and it runs on from there)
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
      if (down) {
        const D = this.DOWN;
        if (c.slide) { c.dartAng = clamp(c.dartAng + c.slide * dt, -0.16, 0.16); c.slide *= Math.exp(-dt * 7); }   // brought down running side on, it tumbles on a little that way
        if (c.modeT >= D.fall + D.lie + D.rise) { this.sprint(c); return 0; }
        // falling out of a sprint its weight carries it on a metre or so through the snow (never as far as you)
        return c.downFrom === 'sprint' && c.dist > c.catchDist + 2 ? this.RUN * Math.pow(1 - Math.min(1, c.modeT / D.fall), 2) : 0;
      }
      if (c.mode !== 'sprint') this.sprint(c);
      if (wary && c.modeT >= c.sprintFor) {   // hurt and wary: a second or two straight (weaving), then it may break to one side
        this.sprint(c);
        if (c.darts !== Infinity && c.dist >= this.JINK_NEAR && c.rand() < this.JINK) { this.breakAway(c); return c.dartK; }
      }
      return c.reckless ? 2.3 : 2.0;
    }
    // a sprint of SPRINT seconds, then it breaks sideways (DART_SPRINT of the time) or drops to watch for CROUCH seconds,
    // then breaks sideways (DART_CROUCH) or sprints again
    if (c.mode === 'sprint' && c.modeT > c.sprintFor) { if (!this.dart(c, this.DART_SPRINT)) { c.mode = 'crouch'; c.modeT = 0; } }
    else if (c.mode === 'crouch' && c.modeT > this.CROUCH && !this.dart(c, this.DART_CROUCH)) this.sprint(c);
    return c.mode === 'sprint' ? this.RUN : 0;
  },
  // Down on all fours it still drifts from side to side (lateral: its weave, and where a run to the side left it), so it
  // creeps there on its hands and feet rather than gliding: c.crawlPh goes on with how far it has moved to the side (about
  // a stride a metre), c.crawlK (0..1) is how much it is creeping, eased in and out, and c.crawlDir the way it goes
  creep(c, dt) {
    const at = this.lateral(c), was = c.crawlLat === undefined ? at : c.crawlLat, d = at - was;
    c.crawlLat = at;
    const down = (c.mode === 'crouch' || c.mode === 'stumble') && !c.lunge;
    const v = dt > 0 ? Math.abs(d) / dt : 0;
    c.crawlK = lerp(c.crawlK || 0, down ? clamp(v / 0.35, 0, 1) : 0, Math.min(1, dt * 6));
    if (Math.abs(d) > 1e-5) c.crawlDir = Math.sign(d);
    c.crawlPh = (c.crawlPh || 0) + Math.abs(d) * 5.5;
  },
  RUN: 2.1, SPRINT: [1.4, 2.2], CROUCH: 0.8, DART_SPRINT: 0.4, DART_CROUCH: 0.6, DART_NEAR: 16,
  // its weave from side to side, [metres, radians a second]: unhurt (WEAVE; CALM of that while the bow is drawn on it),
  // and hurt and wary (WARY), when it also breaks to one side (JINK of the time) after each JINK_RUN seconds of running,
  // out past JINK_NEAR m; nearer than that it comes straight, its weave closing as it always has
  WEAVE: [1.1, 1.3], CALM: 0.5, WARY: [1.7, 2.0], JINK: 0.6, JINK_RUN: [1.1, 1.9], JINK_NEAR: 14,
  // the first arrow: it falls (fall seconds), lies in the snow (lie) and gets up (rise); downAt(c) is where it is in that
  DOWN: { fall: 0.5, lie: 0.9, rise: 0.7 },
  downAt(c) {
    const D = this.DOWN, t = Math.max(0, c.modeT);
    return t < D.fall ? { ph: 'fall', k: t / D.fall } : t < D.fall + D.lie ? { ph: 'lie', k: (t - D.fall) / D.lie } : { ph: 'rise', k: Math.min(1, (t - D.fall - D.lie) / D.rise) };
  },
  sprint(c) { const S = c.wounded && !c.reckless ? this.JINK_RUN : this.SPRINT; c.mode = 'sprint'; c.modeT = 0; c.sprintFor = lerp(S[0], S[1], c.rand()); },
  // break sideways along the tree line (chance k), as often as it likes while it is out past DART_NEAR m (c.darts counts
  // them; a test that wants it to keep still sets it to Infinity): a few metres to one side, never more than MAX (7
  // degrees) off its way, which the porch leaves open on either side, at about 11 m/s, closing a little as it goes
  // (c.dartK; a dodge does too). Not while the bow is drawn on it: unhurt, it holds its line and watches the arrow.
  dart(c, k) {
    if (c.darts === Infinity || c.drawnOn || c.dist < this.DART_NEAR || c.rand() >= k) return false;
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
  // what it was doing when an arrow took it ('sprint', 'run' side on, 'crouch' on all fours), and which way it goes over
  // (+1: its head to the right of the view): the way it was running side on, else away from its way
  fellFrom(c) { return c.mode === 'sprint' ? 'sprint' : c.mode === 'dart' ? 'run' : 'crouch'; },
  fellTo(c) { return c.mode === 'dart' ? (c.runDir || 1) : (c.lat || 0) >= 0 ? 1 : -1; },
  // the first arrow: it goes down where it is (c.downFrom, c.side), all the way into the snow, lies there a moment and
  // gets up (DOWN), wounded. It can be hit again while it is down: it is a low, flat thing to aim at (body), and a second
  // arrow then kills it where it lies
  hurt(c) {
    c.downFrom = this.fellFrom(c); c.side = this.fellTo(c);
    if (c.mode === 'dart') { const s = clamp(c.modeT / c.dartDur, 0, 1); c.slide = (c.dartTo - c.dartFrom) * 6 * s * (1 - s) / c.dartDur * 0.6; } else c.slide = 0;
    this.settle(c); c.wounded = true; c.mode = 'stumble'; c.modeT = 0;
  },
  // killed: it falls the way it was going, and if it was sprinting its weight carries it on a metre or so through the snow;
  // still down from the first arrow (c.deadFrom 'down', c.deadAt where it was in that), it drops back and lies where it is
  kill(c) {
    if (c.mode === 'stumble') { c.deadFrom = 'down'; c.deadAt = this.downAt(c); }
    else { c.deadFrom = this.fellFrom(c); c.side = this.fellTo(c); }
    this.settle(c);
    c.dead = true; c.deadT = 0; c.latHold = c.lat; c.hold = null;
    let v = c.deadFrom === 'sprint' ? 4.5 : 0;
    c.distFn = (cr, dt) => { v *= Math.exp(-dt * 3.5); return Math.max(Math.min(cr.dist, 1.8), cr.dist - v * dt); };
  },
  // the part of its box its pose fills, for aiming at it: crouched it is half its height, side on it is wider; going down
  // from the first arrow it shrinks to what lies in the snow (FLAT), and grows again as it gets up
  UP: { sprint: [-0.6, 0.6, 0, 1.55], run: [-0.85, 0.85, 0, 1.85], crouch: [-0.75, 0.75, 0, 1.0], rise: [-0.95, 0.95, 0, 1.1] }, FLAT: [-1.05, 1.05, 0, 0.45],
  body(c) {
    if (c.lunge) return [-0.55, 0.55, 0, 2.0];
    if (c.mode === 'stumble') {
      const d = this.downAt(c), up = d.ph === 'rise' ? this.UP.rise : this.UP[c.downFrom] || this.UP.crouch, flat = this.FLAT;
      const k = d.ph === 'fall' ? smoothstep(d.k) : d.ph === 'lie' ? 1 : 1 - smoothstep(d.k);
      return [lerp(up[0], flat[0], k), lerp(up[1], flat[1], k), 0, lerp(up[3], flat[3], k)];
    }
    return this.UP[c.mode === 'dart' ? 'run' : c.mode === 'crouch' ? 'crouch' : 'sprint'];   // (sprinting, low and wide)
  },
  lateral(c) {
    if (c.dead) return c.latHold || 0;
    const near = clamp((c.dist - 3) / 12, 0, 1), A = c.weaveA === undefined ? this.WEAVE[0] : c.weaveA, wv = c.wv === undefined ? c.t * this.WEAVE[1] : c.wv;
    const wary = clamp((A - this.WEAVE[0]) / (this.WARY[0] - this.WEAVE[0]), 0, 1);   // hurt, its weave is uneven as well as wide and quick
    return Math.tan(this.ang(c)) * c.dist * near + (Math.sin(wv) + 0.3 * wary * Math.sin(wv * 2.3 + 1)) * A * clamp((c.dist - 4) / 10, 0, 1) * c.weave;
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
    for (let j = 0; j < 6; j++) out[j] = this.kicks(t, j, live) * 1.45 * k;   // (the kick tops out at about seven tenths)
    return out;
  },
  // sharp kicks at odd moments, each coming in a frame or two and settling at once, about -0.7..0.7 at the most: one chance
  // of a kick in each slot of 1/rate seconds (more of them the higher live, 0..1), j picking which run of them
  kicks(t, j, live) {
    const rate = 2.6 + (j % 3) * 0.55, o = j * 0.37, n = Math.floor(t * rate + o);
    let v = 0;
    for (let m = n - 2; m <= n; m++) {   // the last few are still settling
      const r = q => { const x = Math.sin(m * 12.9898 + j * 78.233 + q * 37.719) * 43758.5453; return x - Math.floor(x); };
      if (r(0) > 0.3 + 0.5 * live) continue;
      const e = t - (m + r(1) - o) / rate;
      if (e > 0) v += (r(2) < 0.5 ? -1 : 1) * (0.55 + 0.45 * r(3)) * Math.exp(-e * 8) * (1 - Math.exp(-e * 70));
    }
    return v;
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
      if ((c.side || ((c.latHold || 0) >= 0 ? 1 : -1)) > 0) ctx.scale(-1, 1);
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
    if (c.mode === 'stumble' && !lunge) { this.drawDown(ctx, c, P); return; }   // the first arrow: down into the snow, and up again
    if (c.mode === 'dart' && !lunge) { this.drawRun(ctx, c, P); return; }
    const crouch = c.mode === 'crouch' || c.mode === 'stumble';
    if (crouch && !lunge) {
      const stumble = c.wounded;   // (on all fours with an arrow in it: only as it goes down from there, drawFall)
      const lift = smoothstep(Math.min(1, Math.max(0, c.modeT) / 0.4));
      const J = this.jerks(c);   // hit, it twitches: the knees and elbows kick out, the back and the arrows in it jerk, the head knocks
      // creeping to the side (c.crawlK): a hand and the foot on the other side lift and reach the way it goes together, then
      // the other pair, the body swaying over them a little (see creep)
      const ck = c.crawlK || 0, ph = c.crawlPh || 0, dir = c.crawlDir || 1;
      const up = p => Math.max(0, Math.sin(p)) * 0.07 * ck, reach = p => -Math.cos(p) * 0.065 * ck * dir;
      const sway = Math.sin(2 * ph) * 0.012 * ck, rock = Math.sin(ph) * 0.035 * ck;
      // on all fours, head raised toward you
      for (const s of [-1, 1]) {
        const js = J[s > 0 ? 2 : 1], pl = ph + (s > 0 ? 0 : Math.PI), pa = pl + Math.PI;   // (the leg on one side goes with the arm on the other)
        const lx = reach(pl), ly = up(pl), ax = reach(pa), ay = up(pa);
        P_limb(ctx, [[s * 0.22 + sway, 0.62], [s * (0.6 + js * 0.07) + lx * 0.6, 0.55 + js * 0.05 + ly * 0.8], [s * 0.72 + lx, 0.02 + ly]], 0.08, rags);
        P_limb(ctx, [[s * 0.25 + sway, 0.75], [s * (0.48 - js * 0.08) + ax * 0.6, 0.4 - js * 0.04 + ay * 1.2], [s * 0.42 + ax, 0.02 + ay]], 0.07, skin);
        fingers(ctx, s * 0.42 + ax, 0.02 + ay, (s > 0 ? 0.3 : Math.PI - 0.3) + s * js * 0.25 - s * ay * 2.5, 0.35 + Math.abs(js) * 0.12, 0.14, 0.02, skin);
      }
      ctx.save(); ctx.translate(sway, Math.abs(J[0]) * 0.03 - Math.abs(Math.sin(ph)) * 0.012 * ck); this.about(ctx, 0, 0.3, J[0] * 0.06 + rock);
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
    // sprinting straight at you (or lunging, up out of it): low and wide, bent hard forward, so from the front the trunk
    // is short and the head comes low out ahead of the hunched shoulders, the jaw hanging open. Each stride is heavy: the
    // foot slams down wide and the body drops onto the bent knee, then drives up off it, its weight thrown over the foot
    // that is down, while the other knee drives up at you. The arms pump hard against the legs, a hand clawing up at you
    // with the fingers hooked while the other goes back with the elbow up, the right one reaching further than the left.
    // The strides are uneven (one quicker than the other) and the head jerks at odd moments. Lunging, it comes upright.
    const run = 1 - lunge;
    const ga = g + 0.28 * Math.sin(g) + 0.12 * Math.sin(2 * g + 1);   // the uneven stride
    const down = Math.sin(ga) >= 0 ? 1 : -1;   // which foot is down (+1: the right of the view)
    const q = ((ga % Math.PI) + Math.PI) % Math.PI / Math.PI;   // through this stride, from the foot coming down
    const land = Math.sin(Math.PI * clamp(q / 0.4, 0, 1)), push = Math.sin(Math.PI * clamp((q - 0.4) / 0.6, 0, 1));
    const bob = (-0.07 * land + 0.04 * push) * run;
    const tic = this.kicks(t * 1.4, 7, 0.55) * run, tic2 = this.kicks(t * 1.1, 9, 0.4) * run;   // the jerks of its head and shoulders
    const wounded = c.wounded ? 1 : 0;
    const J = this.jerks(c);   // wounded, it twitches as it runs: its trunk, arms and head jerk, and the arrows in it
    const hipX = down * 0.045 * land * run, hipY = lerp(0.76, 1.0, lunge) + bob;
    const shY = lerp(1.26, 1.58, lunge) + bob * 0.8 - wounded * 0.05 * run;
    const roll = down * 0.08 * land * run + tic2 * 0.06;   // the shoulders dip over the foot that is down
    for (const s of [-1, 1]) {
      const sw = Math.sin(ga + (s > 0 ? Math.PI : 0)), hip = [hipX + s * 0.13, hipY];   // sw > 0: swinging through; < 0: down
      if (sw <= 0) {   // down: planted wide, the knee bowed out and bent under the weight, the bare foot slammed flat
        const k = -sw * run, bend = (down === s ? land : 0) * run, knee = [s * lerp(0.25 + 0.08 * k + 0.05 * bend, 0.24, lunge), lerp(0.4 - 0.06 * bend, 0.55, lunge)], foot = [s * lerp(0.3, 0.22, lunge), 0.03];
        P_limb(ctx, [hip, knee, foot], 0.09, rags);
        P_ell(ctx, foot[0], foot[1], 0.08, 0.035, skinD);
      } else {   // the knee driving up at you, the shin and the foot hanging under and behind it
        const lift = sw * (s > 0 ? 1 : 0.8) * run, knee = [s * lerp(0.26 - 0.03 * lift, 0.24, lunge), lerp(0.4 + 0.24 * lift, 0.55, lunge)], foot = [s * lerp(0.27, 0.22, lunge), 0.03 + 0.3 * lift];
        P_line(ctx, knee[0], knee[1], foot[0], foot[1], 0.08, rags);
        P_ell(ctx, foot[0], foot[1], 0.06, 0.03, skinD);
        P_line(ctx, hip[0], hip[1], knee[0], knee[1], 0.1, rags);
        P_ell(ctx, knee[0], knee[1], 0.06 * (1 + 0.3 * lift), 0.055 * (1 + 0.3 * lift), ragsL);   // the knee, nearest
      }
    }
    // the arms: one clawing forward and up at you, the other driven back, elbow high (the right one reaching further)
    const arms = [];
    for (const s of [-1, 1]) {
      const raw = Math.sin(ga + (s > 0 ? 0.35 : Math.PI)), snap = Math.sign(raw) * Math.pow(Math.abs(raw), 0.55);
      const sw = s > 0 ? 0.2 + 0.8 * snap : 0.85 * snap;
      const fwd = Math.max(0, sw) * run, back = Math.max(0, -sw) * run;
      const js = J[s > 0 ? 2 : 1];
      const N = [s * 0.47, shY - 0.24, s * 0.43, shY - 0.5], F = [s * 0.54, shY - 0.1, s * 0.3, shY - 0.2], B = [s * 0.52, shY + 0.03, s * 0.47, shY - 0.36];
      const U = [s * 0.5, 1.45, s * 0.3, 1.35];   // lunging: up at your face
      const at = i => lerp(N[i] + fwd * (F[i] - N[i]) + back * (B[i] - N[i]), U[i], lunge);
      const A = lerp(-Math.PI / 2 - 0.55 * fwd - back * 0.3, Math.PI * 0.8, lunge);   // where the fingers point (on the right; mirrored on the left)
      arms.push({ s, behind: back > 0.05, sx: s * 0.3, sy: shY - 0.03, ex: at(0) + s * js * 0.06, ey: at(1) + js * 0.05, hx: at(2), hy: at(3),
        ang: s > 0 ? A : Math.PI - A, sc: 1 + 0.6 * fwd - 0.15 * back, curl: lerp(0.3 + 0.5 * fwd, 0.3, lunge) });
    }
    const arm = a => {
      const col = a.behind ? skinD : skin;
      P_line(ctx, a.sx, a.sy, a.ex, a.ey, 0.085, rags);
      P_line(ctx, a.ex, a.ey, a.hx, a.hy, 0.05 * a.sc, col);
      P_ell(ctx, a.hx, a.hy, 0.045 * a.sc, 0.055 * a.sc, col);
      this.claw(ctx, a.hx, a.hy, a.ang, 0.32 + 0.08 * (a.sc - 1), (0.12 + lunge * 0.06) * a.sc * (1 + 0.2 * (a.sc - 1)), 0.02 * a.sc, a.curl, col);
    };
    // the trunk, short and wide, the shoulders hunched up behind the head (and all above the hips with it, as it jerks)
    ctx.save(); this.about(ctx, hipX, hipY, roll + J[0] * 0.05);
    arms.filter(a => a.behind).forEach(arm);
    const hunch = 0.16 * run;
    P_poly(ctx, [[hipX - 0.2, hipY - 0.06], [hipX + 0.2, hipY - 0.06], [0.33, shY - 0.05], [0.2, shY + hunch], [-0.2, shY + hunch], [-0.33, shY - 0.05]], rags);
    P_poly(ctx, [[hipX - 0.08, hipY], [hipX + 0.1, hipY + 0.04], [0.13, shY - 0.1], [-0.05, shY - 0.14]], ragsL);
    if (c.wounded) P_ell(ctx, 0.12, lerp(hipY, shY, 0.45), 0.12, 0.14, blood);
    c.arrows.forEach((a, i) => this.arrow(ctx, P, 0.08 - i * 0.17, lerp(hipY, shY, 0.4) + i * 0.1, i, J[4 + i % 2] * 0.3));
    // the head, thrust out low ahead of the shoulders, jerking; the black sockets and the slack jaw hanging open
    const hs = lerp(1.12, 1, lunge);
    ctx.save(); ctx.translate(tic * 0.03, lerp(1.02, 1.6, lunge) + bob * 0.4); ctx.rotate(-roll * 0.7 + tic * 0.18 + Math.sin(g * 0.5) * 0.08 * lunge + J[3] * 0.15); ctx.scale(hs, hs);
    if (lunge) P_line(ctx, 0, 0, 0, 0.08, 0.08 * lunge, skin);   // (sprinting, the head is out ahead of the neck)
    strands(ctx, 0, 0.3, 9, 0.34 + 0.06 * run, black, 5, t);
    if (lunge > 0) this.mane(ctx, black, t, lunge);   // up in your face its hair shows: a black mass over the crown, hanging round the face
    P_ell(ctx, 0, 0.22, 0.13, 0.16, skin);
    P_ell(ctx, -0.052, 0.25, 0.036, 0.042, black); P_ell(ctx, 0.052, 0.25, 0.036, 0.042, black);
    P_ell(ctx, 0, 0.1, 0.045 + lunge * 0.01, 0.055 + near * 0.025 + lunge * 0.03 + 0.02 * land * run, black);
    ctx.restore();
    arms.filter(a => !a.behind).forEach(arm);
    ctx.restore();
    if (hurt) { ctx.globalAlpha = 0.5; P_ell(ctx, 0, 1.0, 0.7, 0.85, blood); ctx.globalAlpha = 1; }
  },
  // its hair, seen close (the lunge, k 0..1 as it comes in): a black cap over the crown of the head (whose face, drawn over
  // it, is at 0, 0.22) and long lank locks from round the crown hanging down either side of the face to below the jaw,
  // flung out a little by the lunge and stirring; drawn behind the face, so only the crown and the sides show
  mane(ctx, col, t, k) {
    ctx.save(); ctx.globalAlpha *= clamp(k * 4, 0, 1);
    P_ell(ctx, 0, 0.29, 0.165, 0.125, col);
    for (let i = 0; i < 14; i++) {
      const u = i / 13, a = lerp(0.25, Math.PI - 0.25, u), side = Math.cos(a) >= 0 ? 1 : -1;   // round the crown, side to side
      const x0 = Math.cos(a) * 0.15, y0 = 0.25 + Math.sin(a) * 0.13;
      const len = 0.34 + 0.12 * (0.5 + 0.5 * Math.sin(i * 2.7 + 1)) + 0.08 * (1 - Math.sin(a));
      const fl = (0.05 + 0.07 * k) * side * (0.4 + Math.abs(Math.cos(a))), st = Math.sin(t * 2.1 + i * 1.3) * 0.02;
      const x2 = x0 + fl * 1.6 + st, y2 = y0 - len;
      ctx.strokeStyle = col; ctx.lineWidth = 0.022 - 0.008 * Math.abs(u - 0.5); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + side * 0.05 + st, y0 - len * 0.45, x2, y2); ctx.stroke();
    }
    ctx.restore();
  },
  // long pale fingers from (x, y) fanned about ang, each bent at the middle joint by curl toward the middle of the hand,
  // so they hook like claws
  claw(ctx, x, y, ang, spread, len, w, curl, col) {
    for (let i = 0; i < 4; i++) {
      const a = ang + (i - 1.5) * spread, l = len * (i === 0 || i === 3 ? 0.82 : 1), b = a + (ang - a) * curl;
      const mx = x + Math.cos(a) * l * 0.6, my = y + Math.sin(a) * l * 0.6;
      P_limb(ctx, [[x, y], [mx, my], [mx + Math.cos(b) * l * 0.45, my + Math.sin(b) * l * 0.45]], w, col);
    }
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
  // Going down with an arrow in it, k 0..1 (the first, which it gets up from: drawDown; or killed), from what it was doing
  // (from) and toward side (+1: its head ends to the right of the view). Out of a sprint: its knees give, it sags onto
  // them and topples sideways into the snow, sliding as it goes over so that it ends where it will lie. Side on, breaking
  // away: it pitches forward out of its run and skids on its side the way it was going. On all fours: its arms go from
  // under it, its head and chest drop, and it rolls over onto its side. Killed while still down from the first
  // (c.deadFrom 'down'): it drops back from however far up it had got. (Then it is drawn lying: drawRise at 0, or dead.)
  drawFall(ctx, c, P, k, from, side) {
    from = from || c.deadFrom; side = side || c.side || ((c.latHold || 0) >= 0 ? 1 : -1);
    if (from === 'down') {
      const at = c.deadAt || { ph: 'lie', k: 1 };
      if (at.ph === 'fall' && k < 0.6) this.drawFall(ctx, c, P, lerp(at.k, 1, smoothstep(k / 0.6)), c.downFrom, side);
      else this.drawRise(ctx, c, P, at.ph === 'rise' ? at.k * (1 - smoothstep(k / 0.5)) : 0, side, 1);
      return;
    }
    if (from === 'crouch') {
      const roll = smoothstep((k - 0.2) / 0.8), e = smoothstep(k);
      ctx.save(); ctx.translate(side * 0.2 * roll, 0); ctx.scale(1 + 0.22 * e, 1 - 0.6 * e); this.about(ctx, side * 0.5, 0, -side * 0.38 * roll);
      this.draw(ctx, Object.assign({}, c, { dead: false, mode: 'crouch', modeT: 0.4 * (1 - k * 1.6), hurtFlash: 0, crawlK: 0 }), P);
      ctx.restore();
      return;
    }
    if (from === 'run') {
      if (k < 0.45) {   // its legs go: it pitches forward out of the run
        const e = smoothstep(k / 0.45);
        ctx.save(); ctx.translate(side * 0.12 * e, -0.34 * e); this.about(ctx, -side * 0.1, 0.5, -side * 0.75 * e);
        this.drawRun(ctx, Object.assign({}, c, { runDir: side, runGait: (c.runGait || 0) + k * 6 }), P);
        ctx.restore();
      } else {          // and it is down, skidding on its side through the snow
        const e = (k - 0.45) / 0.55, skid = 1 - easeOut(e);
        ctx.save(); ctx.translate(-side * 0.55 * skid, 0.05 * Math.sin(Math.min(1, e * 2.2) * Math.PI));
        this.drawRise(ctx, c, P, 0, side, e * 0.3);
        ctx.restore();
      }
      return;
    }
    const rags = P.col([26, 22, 22]), ragsL = P.col([48, 40, 38]), skin = P.col([196, 184, 172]), black = P.col([6, 4, 6]), blood = P.col([120, 10, 12]);
    const kb = smoothstep(k / 0.4), over = smoothstep((k - 0.4) / 0.6), tip = over * 1.4;   // it goes over away from its way
    const hip = lerp(0.78, 0.5, kb), sh = hip + lerp(0.5, 0.48, kb);   // from low in its sprint
    ctx.save(); ctx.translate(side * (0.25 - 0.45 * over), 0); ctx.rotate(-side * tip); ctx.translate(-side * 0.25, 0);
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
  // The first arrow (c.mode 'stumble'): it falls (drawFall), lies in the snow, and gets up (drawRise), where downAt(c) says
  // it is in that; the red of the hit over it for a moment, low as it goes down
  drawDown(ctx, c, P) {
    const d = this.downAt(c);
    if (d.ph === 'fall') this.drawFall(ctx, c, P, d.k, c.downFrom, c.side || 1);
    else this.drawRise(ctx, c, P, d.ph === 'rise' ? d.k : 0, c.side || 1, d.ph === 'lie' ? d.k : 1);
    if (c.hurtFlash > 0) {
      const k = d.ph === 'fall' ? smoothstep(d.k) : 1, x = c.downFrom === 'run' ? (c.side || 1) * 0.25 * (1 - k) : 0;
      ctx.globalAlpha = 0.5; P_ell(ctx, x, lerp(c.downFrom === 'crouch' ? 0.5 : 0.95, 0.3, k), lerp(0.75, 1.0, k), lerp(0.8, 0.4, k), P.col([120, 10, 12])); ctx.globalAlpha = 1;
    }
  },
  // Down in the snow from the first arrow, and getting up, r 0..1: seen side on, its head toward the left of the view
  // (side +1: mirrored). Lying (r 0) it is flat on its side, an arm flung out past its head, as it will lie dead, twitching
  // hard. Then its head comes up and turns to you, the flung arm comes over and down and plants its hand, it pushes its
  // shoulders up off the snow, drags its knees in under it and comes up onto its hands and feet, gathered to launch itself
  // at you again (and from there it is drawn sprinting). settle (0..1 through its lying): just down, its legs are still
  // bent from the fall and slide out straight.
  drawRise(ctx, c, P, r, side, settle) {
    const rags = P.col([26, 22, 22]), ragsL = P.col([48, 40, 38]), skin = P.col([196, 184, 172]), skinD = P.col([120, 104, 96]), black = P.col([6, 4, 6]), blood = P.col([120, 10, 12]);
    const farRags = P.col([16, 13, 13]), farSkin = P.col([150, 138, 128]);
    const J = this.jerks(c), t = c.t;
    const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    const armK = smoothstep(r / 0.35), shK = smoothstep((r - 0.12) / 0.6), hipK = smoothstep((r - 0.38) / 0.62), legK = smoothstep((r - 0.25) / 0.6), headK = smoothstep(r / 0.4);
    const st = 1 - smoothstep((settle === undefined ? 1 : settle) / 0.3);
    ctx.save(); if (side > 0) ctx.scale(-1, 1);
    P_ell(ctx, -0.25, 0.045, 0.5, 0.05, blood);   // its blood in the snow where it lies
    const S = mix([-0.5, 0.2], [-0.3, 0.77], shK), H = mix([0.22, 0.17], [0.36, 0.65], hipK);
    S[1] += Math.abs(J[0]) * 0.05 * (1 - shK * 0.5); H[1] += Math.abs(J[0]) * 0.02;
    const leg = (knee, foot, far) => {
      P_limb(ctx, [H, knee, foot], 0.085, far ? farRags : rags);
      P_line(ctx, foot[0] - 0.02, foot[1], foot[0] + 0.1, foot[1] + 0.03 * (1 - legK), 0.055, far ? farSkin : skinD);   // the bare foot
    };
    const arm = (elbow, hand, ang, far) => {
      P_line(ctx, S[0], S[1], elbow[0], elbow[1], 0.075, far ? farRags : rags);
      P_line(ctx, elbow[0], elbow[1], hand[0], hand[1], 0.055, far ? farSkin : skin);
      fingers(ctx, hand[0], hand[1], ang, 0.3, 0.12, 0.018, far ? farSkin : skin);
    };
    // the far leg and arm, a shade darker: the leg stays out behind it, the hand is planted under it
    leg(mix([0.56 - st * 0.12, 0.21 + st * 0.2], [0.58, 0.3], legK), mix([0.9 - st * 0.2, 0.15 + st * 0.05], [0.86, 0.03], legK), true);
    arm(mix([-0.3, 0.1], [-0.2, 0.42], shK), mix([-0.12, 0.05], [-0.16, 0.02], armK), Math.PI + 0.25, true);
    // the trunk, in its rags, a lighter tear along its back, which humps as it pushes up
    const dx = H[0] - S[0], dy = H[1] - S[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, hump = 0.07 * Math.sin(Math.PI * shK) + 0.05 * shK;
    const on = (u, w) => [lerp(S[0], H[0], u) + nx * w, lerp(S[1], H[1], u) + ny * w];
    P_poly(ctx, [on(-0.07, -0.15), on(-0.06, 0.16), on(0.45, 0.17 + hump), on(1.06, 0.13), on(1.07, -0.13)], rags);
    const t0 = on(0.12, 0.07), t1 = on(0.8, 0.06);
    P_line(ctx, t0[0], t0[1], t1[0], t1[1], 0.045, ragsL);
    P_ell(ctx, lerp(S[0], H[0], 0.42), lerp(S[1], H[1], 0.42), 0.13, 0.09, blood, Math.atan2(dy, dx));
    c.arrows.forEach((a, i) => this.arrow(ctx, P, lerp(S[0], H[0], 0.36 + i * 0.3), lerp(S[1], H[1], 0.36 + i * 0.3) + 0.06, i, J[4 + i % 2] * 0.3));
    // the near leg: lying straight out behind it, then dragged in under it, the foot set to push off
    leg(mix([0.6 - st * 0.14, 0.13 + st * 0.22 + J[2] * 0.05], [0.14, 0.3], legK), mix([0.97 - st * 0.25, 0.07], [0.5, 0.03], legK), false);
    // the head: along the snow past its shoulder, then up, and turned to you (its sockets and its open jaw)
    const ho = mix([-0.43, 0], [-0.22, 0.09], headK), crane = 0.1 * Math.sin(Math.PI * clamp(r / 0.8, 0, 1));
    const hx = S[0] + ho[0] - Math.abs(J[3]) * 0.03 * (1 - headK), hy = S[1] + ho[1] + crane + J[3] * 0.05;
    P_line(ctx, S[0] - 0.04, S[1], hx, hy, 0.075, skin);   // the neck
    if (headK > 0) { ctx.save(); ctx.globalAlpha *= headK; strands(ctx, hx, hy + 0.1, 9, Math.min(0.36, hy + 0.06), black, 5, t); ctx.restore(); }
    P_ell(ctx, hx, hy, lerp(0.16, 0.14, headK), lerp(0.14, 0.17, headK), skin, J[3] * 0.2 * (1 - headK));
    if (headK > 0) {
      ctx.save(); ctx.globalAlpha *= headK;
      P_ell(ctx, hx - 0.055, hy + 0.03, 0.036, 0.04, black); P_ell(ctx, hx + 0.055, hy + 0.03, 0.036, 0.04, black);
      P_ell(ctx, hx, hy - 0.1, 0.045, 0.065, black);
      ctx.restore();
    }
    // the near arm: flung out past its head, then over and down, the hand planted in the snow under its shoulder
    const hand = mix([-0.9, 0.45], [-0.42, 0.02], armK), elbow = mix([-0.72, 0.36], [-0.46, 0.42], armK);
    hand[1] += 0.12 * Math.sin(Math.PI * armK) + Math.abs(J[1]) * 0.05 * (1 - armK); hand[0] += J[1] * 0.05 * (1 - armK); elbow[1] += J[1] * 0.05;
    arm(elbow, hand, lerp(2.45 + J[1] * 0.8, Math.PI + 0.3, armK), false);
    ctx.restore();
  },
};
