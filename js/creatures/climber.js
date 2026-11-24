'use strict';
// The climber: grey, hook-fingered, its head bent right back so its face is always turned up to you. It climbs the
// outside of the tower (a lane that goes down: you only see it by looking over the rail): slowly while you watch it,
// fast while you do not.
//
// It is on the stone. Its lane is a ray from your eye, which runs down beside the wall, so a night with a wall gives it
// c.wallAt(c) (the point on the stone it is at) and c.wallFrame(c) (that point, and the way up, out of and across the wall
// there), and it is drawn there as you see a thing on a wall you are looking straight down: lengthways it is end on to
// you, so you see its face turned up at you, its shoulders and the hump of its back behind it, its arms spread to the
// hands hooked into the stone either side of its head, the elbows standing out from the wall, and its legs further down,
// frog-bent, knees out. Its body is a little rig on the wall (x across, a up the wall, o out from the stone) projected
// with the wall's own directions on screen, so it lies the way the wall does from wherever you look at it.
//
// It climbs one limb at a time, hand over hand: one hand comes off the stone, reaches up and hooks in again while the
// other three hold, and it heaves itself up on all four; then the foot on the other side, then the other hand, then the
// other foot. A hand or foot on the stone stays where it bit: as the thing comes up the wall at you, it grows past its
// holds the way anything coming at you grows, and the holds stay put on the stone.
// The beam knocks its hooks out of the stone and it slides, clawing, back down the wall (c.slip). Going round the tower to
// another face (c.scuttle, +1 toward its right, -1 its left) it turns side on and runs across the stone.
// At the very end the night knocks it off the tower: sliding for the last time its hands and feet scrabble at the stone
// (c.scrabble, 0 to 1), then it peels away and falls (c.falling, 0 to 1: its limbs flail open at the air, and the night's
// frame turns it over as it drops), and once it is in the sea there is nothing to draw (c.gone).
// A thing dropped on it from the rail (the night's toolbox: knock) catches it full in its upturned face: its head snaps
// round, the hand on that side comes off the stone and both feet with it, and it hangs by the other arm, swinging, for
// about a second (c.dangle); then it swings back in, hooks on again and climbs on from where it was. It keeps the black
// eye (c.blackEye: which eye, +1 its right; c.bruise, 0 to 1, as it comes up): the lids swollen all but shut over the
// white, the socket purple-black and the bruise spread round it, in every pose after, the lunge over the rail too.

// its rig, in metres: x across (its right +), a up the wall (+ toward its head), o out from the stone
const CLIMB = {
  hand: [0.55, 0.55], foot: [0.45, -0.75],        // where a hand or foot hooks in, at rest (x per side)
  hip: [0.11, -0.45, 0.1], shoulder: [0.24, 0.12, 0.16], head: [0, 0.4, 0.2],
  arm: 0.34, leg: 0.36,                          // the length of each bone
  along: 0.55, out: 0.5,                         // how much of its length, and of its depth off the stone, shows from the rail
  vp: -1.2,                                      // where the wall runs away to, along it: its holds close on that as it nears
  mid: [0, -0.12, 0.1],                          // the middle of it, put on the point it is at
  order: ['h-1', 'f1', 'h1', 'f-1'],             // the limb that moves in each step of a cycle: a hand, the other foot, the other hand, its foot
  // knocked on the head, hanging by one hand: the blow (snap), a hand and both feet coming off the stone and its weight
  // dropping onto the other arm (drop), hanging there (hang), and swinging back in to hook on again (back), in seconds;
  // how far over it hangs under the one hand (lean, radians) and sags on that arm (sag, metres); the swing (radians a
  // second, and how fast it dies away)
  dangle: { snap: 0.1, drop: 0.3, hang: 1.0, back: 0.45, lean: 0.5, sag: 0.12, swing: 7, damp: 1.2 },
};
// a bent joint in the rig: half way from a to b, pushed out along `bend` far enough for two bones of length l
function climbJoint(a, b, l, bend) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], n = Math.hypot(d[0], d[1], d[2]) || 1e-3, u = d.map(v => v / n);
  const h = Math.sqrt(Math.max(0, l * l - n * n / 4)), k = bend[0] * u[0] + bend[1] * u[1] + bend[2] * u[2];
  const p = [bend[0] - k * u[0], bend[1] - k * u[1], bend[2] - k * u[2]], pn = Math.hypot(p[0], p[1], p[2]) || 1;
  return [(a[0] + b[0]) / 2 + p[0] / pn * h, (a[1] + b[1]) / 2 + p[1] / pn * h, (a[2] + b[2]) / 2 + p[2] / pn * h];
}
CREATURES.climber = {
  name: 'the climber', h: 2.0, w: 1.7, faceY: 1.8, stepRate: 0.9, catchDist: 1.5, sound: 'climber',
  death: {
    delay: 0.12, dur: 0.35, sting: 'stingScrape',
    // up off the stone and over the rail: from where it really is on the wall, not from its lane
    pose(c, k) { const L = G.L; if (c.wallAt && L) c.yOff = lerp(c.wallYOff || 0, L.eyeH - c.CR.faceY - c.pos().y, smoothstep(k)); },
  },
  voice: { kind: 'exhale', every: [6, 12] },
  init(c) {
    c.look = 0; c.slideTo = null; c.climbPh = 0; c.slip = 0; c.scuttle = 0; c.scutPh = 0; c.wallYOff = 0;
    c.grip = {}; this.regrip(c);   // every hand and foot starts on the stone
    // where it is: on the wall, when the night has one
    const lanePos = c.pos;
    c.pos = function () { return (this.wallAt && this.wallAt(this)) || lanePos.call(this); };
  },
  onSeen(c) { c.look = 1; },
  // each half of the cycle is a reach, while the body hangs where it is, and then a heave that takes it up: the speed
  // follows it (a third of its pace through the reach, a surge through the heave, its own pace over a whole step)
  speedMult(c, dt, seen) {
    c.look = Math.max(0, c.look - dt * 0.6);
    c.struck = Math.max(0, (c.struck || 0) - dt * 1.4);   // the beam on it, fading
    if (c.blackEye) c.bruise = Math.min(1, (c.bruise || 0) + dt * 0.8);   // the black eye coming up
    if (c.dangle && (c.dangle.t += dt) >= this.dangleFor) this.recover(c);   // hanging by one hand: back on the stone, and on up
    const sliding = !!c.distFn && c.slideTo !== null && c.slideTo - c.dist > 0.05;   // the light has knocked it back down the wall
    c.slip += ((sliding ? 1 : 0) - c.slip) * Math.min(1, dt * 8);
    if ((c.slip > 0.6 || c.scuttle) && !c.dangle) this.regrip(c);   // its holds are gone: when it stops it hooks in again wherever it is
    if (c.scuttle) c.scutPh += dt * 16;
    if (c.distFn) { if (c.climbRate && !c.dangle) this.stepTo(c, c.climbPh + dt * c.climbRate); return 1; }   // a night moving it itself says how fast it climbs
    if (c.frozen || c.dead || c.hold !== null) return 1;
    this.stepTo(c, c.climbPh + dt * (seen ? 2.6 : 5.2));   // a reach about every 1.2 s while you watch it, twice as often while you do not
    const p = (c.climbPh / Math.PI) % 1;
    return p < 0.5 ? 0.35 : 0.35 + 2.04 * Math.sin((p - 0.5) * 2 * Math.PI);
  },
  // move the climbing cycle on to phase ph: one limb lets go at the start of each step and hooks in again half way through
  stepTo(c, ph) {
    const k0 = Math.floor(c.climbPh / (Math.PI / 2)), k1 = Math.floor(ph / (Math.PI / 2));
    c.climbPh = ph;
    for (let k = Math.max(k0 + 1, k1 - 7); k <= k1; k++) {
      const key = CLIMB.order[(k >> 1) & 3], g = c.grip[key], s = +key.slice(1);
      if (k & 1) {   // half way: the reaching hand or foot hooks in where it reached, a little different every time
        const j = Math.sin(k * 12.9898) * 0.5;
        Object.assign(g, key[0] === 'h' ? { x: s * (CLIMB.hand[0] + j * 0.06), a: CLIMB.hand[1] + j * 0.08, d: c.dist } : { x: s * (CLIMB.foot[0] - j * 0.05), a: CLIMB.foot[1] - j * 0.06, d: c.dist });
      } else g.liftD = c.dist;   // the start of a step: it lets go from where it is
    }
  },
  // its holds, all at once, back on the stone where its hands and feet rest (after a slide or a run across)
  regrip(c) {
    for (const s of [-1, 1]) {
      c.grip['h' + s] = { x: s * CLIMB.hand[0], a: CLIMB.hand[1] - (s > 0 ? 0.1 : 0), d: c.dist, liftD: c.dist };
      c.grip['f' + s] = { x: s * CLIMB.foot[0], a: CLIMB.foot[1] - (s > 0 ? 0 : 0.1), d: c.dist, liftD: c.dist };
    }
  },
  // Hit on the head from above (side: which side of its face took it, +1 its right). Its head snaps round, the hand on
  // that side comes off the stone and its feet with it, and it hangs by the other arm, swinging, for about a second; then
  // it swings back in, hooks on again and climbs on. All the while it stays where it is on the wall (held, as anything
  // stopped somewhere is: it does not climb, and does not go round to another face), and it keeps the black eye. False if
  // it is hanging already.
  dangleFor: CLIMB.dangle.snap + CLIMB.dangle.drop + CLIMB.dangle.hang + CLIMB.dangle.back,
  knock(c, side) {
    if (c.dangle || c.dead || c.gone) return false;
    this.regrip(c); c.climbPh = Math.ceil(c.climbPh / Math.PI - 1e-6) * Math.PI + 1e-6;   // all four on the stone, between one step and the next
    c.dangle = { t: 0, side: side < 0 ? -1 : 1, held: c.hold === null };
    if (c.hold === null) c.hold = c.dist;
    if (!c.blackEye) { c.blackEye = c.dangle.side; c.bruise = 0; }
    c.look = 1;
    return true;
  },
  // back on the stone, all four hooked in where they rest, and free to climb on (at the end of the hang; or at once, if
  // the night knocks it down the wall meanwhile)
  recover(c) {
    const d = c.dangle; if (!d) return;
    c.dangle = null; if (d.held) c.hold = null;
    this.regrip(c);
  },
  // how it hangs just now (null on the stone): hold, the side of the hand that still holds; off, how far the other three
  // are off the stone and its weight on the one arm (0 to 1); sw, the swing (1 where it would hang still under its hand:
  // it swings out past that and back, less each time); vel, which way it is swinging and how fast (1 its fastest); imp,
  // the blow in its neck (its head snapped round, and coming back); jolt, the blow itself; back, how far it has swung
  // back in to hook on again (0 to 1)
  dangling(c) {
    const d = c.dangle; if (!d) return null;
    const D = CLIMB.dangle, t = d.t, tau = Math.max(0, t - D.snap), w = D.swing, e = Math.exp(-tau * D.damp);
    const back = smoothstep((tau - D.drop - D.hang) / D.back), on = 1 - back;
    return {
      hold: -d.side, side: d.side, t, back, off: smoothstep(tau / D.drop) * on, sw: (1 - Math.cos(tau * w) * e) * on,
      vel: e * (Math.sin(tau * w) + D.damp / w * Math.cos(tau * w)) * Math.min(1, tau * 10) * on,
      imp: (1 - Math.exp(-t * 50)) * Math.exp(-t * 3.5), jolt: Math.exp(-t * 9),
    };
  },
  // where a hold is now, in the rig: the thing has come nearer since it bit (r: how much nearer), so the hold has closed on
  // where the wall runs away to, which keeps it in the same place on the stone as you see it
  held(g, r) { return [g.x * r, CLIMB.vp + (g.a - CLIMB.vp) * r, 0]; },
  // how much of its length, and of its depth off the stone, shows from the rail at the distance it is at (see draw)
  seen(c) { const nearK = smoothstep((c.dist - 2.5) / 6); return { nearK, along: lerp(0.2, CLIMB.along, nearK), out: lerp(0.7, CLIMB.out, nearK) }; },
  // Where its head is as it is drawn, in the world, for an eye at `eye`: the point at its own distance that you see its
  // face at. It is drawn end on (its length up the wall shown as `along` of itself whatever the wall's slope to you), so
  // its drawn head is not where a body lying on the stone would have it: a thing meant to land on its face lands here.
  headAt(c, eye) {
    const fr = c.wallFrame(c), at = fr.at, v = this.seen(c);
    const sv = [at[0] - eye[0], at[1] - eye[1], at[2] - eye[2]], sl = Math.hypot(sv[0], sv[1], sv[2]) || 1, sd = sv.map(q => q / sl);
    const flat = u => { const d = u[0] * sd[0] + u[1] * sd[1] + u[2] * sd[2]; return u.map((q, i) => q - sd[i] * d); };   // as much of a direction as lies across the line of sight
    const up = flat(fr.up), ul = Math.hypot(up[0], up[1], up[2]) || 1, out = flat(fr.out);
    const a = (CLIMB.head[1] - CLIMB.mid[1]) * v.along / ul, o = (CLIMB.head[2] + 0.08 * (1 - v.nearK) - CLIMB.mid[2]) * v.out;
    return { p: at.map((q, i) => q + up[i] * a + out[i] * o), sight: sd, frame: fr };
  },
  draw(ctx, c, P) {
    if (c.gone) return;   // in the sea
    const lunge = c.lunge || 0, H = this.h;
    // the screen, in css pixels, from its box: the renderer's transform for the box, the box's foot and its scale there
    const m = ctx.getTransform(), fr = c.wallFrame && c.wallFrame(c);
    const at = fr ? fr.at : (() => { const p = c.pos(); return [p.x, p.y + (c.yOff || 0) + H / 2, p.z]; })();
    const foot = R.screenPos(at[0], at[1] - H / 2, at[2]), o = R.screenPos(at[0], at[1], at[2]);
    if (!foot || !o) return;
    const dpr = Math.hypot(m.a, m.b) / foot.scale, tx = m.e - foot.x * dpr, ty = m.f - foot.y * dpr, k = o.scale;
    // its axes on screen, in metres at its own distance: across, up (foreshortened, end on), and out from the stone. Further
    // off, more of its length shows (its back, its legs); near, it is end on, its face craned out over its hands at you
    const { along, out } = this.seen(c);
    let bx = [1, 0], bu = [0, -along], bn = [0, -0.9 * out];
    if (fr) {
      const S = (v, s) => R.screenPos(at[0] + v[0] * s, at[1] + v[1] * s, at[2] + v[2] * s), d2 = (a, b, s) => (a && b ? [(a.x - b.x) / (s * k), (a.y - b.y) / (s * k)] : null);
      // a frame's axes on screen: on the stone its length is shown end on (`along`, whatever the wall's slope); off it, as it lies
      const axes = (f, stone) => {
        const X = d2(S(f.across, 0.3), S(f.across, -0.3), 0.6), N = d2(S(f.out, 0.2), S(f.out, -0.2), 0.4), U = d2(S(f.up, 1), S(f.up, -1), 2);
        if (!(X && N && U)) return null;
        const ul = stone ? along / (Math.hypot(U[0], U[1]) || 1) : 1;
        return [X, [N[0] * out, N[1] * out], [U[0] * ul, U[1] * ul]];
      };
      // falling, the frame carries the stone's frame it let go in (fr.from), and how far it has come from that (fr.k)
      const A = axes(fr.from || fr, true), B = fr.from ? axes(fr, false) : null, q = fr.k || 0;
      if (A) [bx, bn, bu] = B ? A.map((v, i) => [lerp(v[0], B[i][0], q), lerp(v[1], B[i][1], q)]) : A;
    }
    // coming over the rail at you it rises off the stone and rights itself, face on, reaching for you
    if (lunge > 0) {
      const q = smoothstep(lunge * 2.5);
      bx = [lerp(bx[0], 1, q), lerp(bx[1], 0, q)]; bu = [lerp(bu[0], 0, q), lerp(bu[1], -0.85, q)]; bn = [lerp(bn[0], 0, q), lerp(bn[1], 0.2, q)];
    }
    // over the rail it brings its face up to yours: the rig is moved so its head is where the face of the thing is meant to be
    let ox = o.x, oy = o.y;
    if (lunge > 0) {
      const fy = R.screenPos(at[0], at[1] - H / 2 + this.faceY, at[2]), q = smoothstep(lunge * 2.5), hd = CLIMB.head, mid = CLIMB.mid;
      const hx = (hd[0] - mid[0]) * bx[0] + (hd[1] - mid[1]) * bu[0] + (hd[2] - mid[2]) * bn[0], hy = (hd[0] - mid[0]) * bx[1] + (hd[1] - mid[1]) * bu[1] + (hd[2] - mid[2]) * bn[1];
      if (fy) { ox = lerp(ox, fy.x - hx * k, q); oy = lerp(oy, fy.y - hy * k, q); }
    }
    // (c.squash: squashed down onto its feet, or stretched up off them, as it leaps for joy at the last night's end)
    const sq = c.squash || 1;
    ctx.setTransform(dpr * k, 0, 0, dpr * k * sq, ox * dpr + tx, (foot.y + (oy - foot.y) * sq) * dpr + ty);
    const pr = v => [(v[0] - CLIMB.mid[0]) * bx[0] + (v[1] - CLIMB.mid[1]) * bu[0] + (v[2] - CLIMB.mid[2]) * bn[0], (v[0] - CLIMB.mid[0]) * bx[1] + (v[1] - CLIMB.mid[1]) * bu[1] + (v[2] - CLIMB.mid[2]) * bn[1]];
    this.body(ctx, c, P, pr, bx, bn, bu);
  },
  // the whole of it: pr takes a point of the rig to the screen (in metres at its distance, y down)
  body(ctx, c, P, pr, bx, bn, bu) {
    const dg = this.dangling(c);   // knocked on the head and hanging by one hand (null on the stone)
    const t = c.t, near = clamp(1 - c.dist / 16, 0, 1), lunge = c.lunge || 0, slip = c.slip || 0, sc = dg ? 0 : c.scuttle || 0;
    const wh = c.struck || 0, K = v => P.col(wh ? mixc(v, [252, 248, 236], wh * 0.85) : v);   // caught in the beam, it goes white
    const grey = K([118, 118, 124]), greyD = K([66, 66, 72]), greyL = K([140, 140, 146]), face = K([206, 202, 194]), faceD = K([150, 144, 136]);
    const black = P.col([10, 8, 10]), eye = K([236, 236, 230]);
    const ph = c.climbPh || 0, step = Math.floor(ph / Math.PI), p = (ph / Math.PI) % 1, mover = CLIMB.order[step & 3], lead = +mover.slice(1), legs = mover[0] === 'f';
    const reach = p < 0.5 ? p / 0.5 : 1, live = (1 - slip) * (sc ? 0 : 1);
    // the body heaves up the wall toward its new hold through the second half of a step and hangs back on its holds
    // through the first, while a limb reaches: after a hand the head and shoulders pull up further than the hips, and the
    // shoulders hunch out from the stone as the arms pull; after a foot the hips push up further
    const surge = p < 0.5 ? 1 - smoothstep(reach) : smoothstep((p - 0.5) / 0.5), pull = p < 0.5 ? 0 : Math.sin((p - 0.5) / 0.5 * Math.PI);
    const bs = (surge * (legs ? 0.12 : 0.2) - (legs ? 0.06 : 0.1)) * live, bh = (surge * (legs ? 0.16 : 0.1) - (legs ? 0.08 : 0.05)) * live, hunch = pull * (legs ? 0.03 : 0.06) * live;
    const sway = (p < 0.5 ? Math.sin(reach * Math.PI) * lead * (legs ? 0.04 : 0.06) : 0) * live;   // it leans toward the side that reaches
    const run = sc ? Math.sin(c.scutPh) : 0, runB = sc ? Math.cos(c.scutPh) : 0;   // running across: its limbs in pairs, fast
    const jit = (s, f) => [Math.sin(t * f + s * 2.1) * 0.08 * slip, Math.cos(t * f * 1.3 + s) * 0.1 * slip, Math.max(0, Math.sin(t * f * 0.7 + s)) * 0.14 * slip];
    // its body turns side on to run across the stone
    const turn = sc * 0.9, ct = Math.cos(turn), st = Math.sin(turn);
    // hanging by one hand, all of it swings about that hand as it hangs: over until its weight is under the hand (and
    // out past that and back, as it swings), sagging on the arm, and knocked down the wall a little by the blow itself
    const DG = CLIMB.dangle, pv = dg && this.held(c.grip['h' + dg.hold], c.dist / (c.grip['h' + dg.hold].d || c.dist));
    const hang = v => {
      const a = dg.hold * DG.lean * dg.sw, ca = Math.cos(a), sa = Math.sin(a), x = v[0] - pv[0], y = v[1] - DG.sag * dg.off - 0.07 * dg.jolt - pv[1];
      return [pv[0] + x * ca - y * sa, pv[1] + x * sa + y * ca, v[2] + 0.05 * dg.off];
    };
    const T = v => (sc ? [v[0] * ct + v[1] * st, -v[0] * st + v[1] * ct, v[2]] : dg ? hang(v) : v);
    const hipC = T([sway * -0.5, CLIMB.hip[1] + bh, CLIMB.hip[2]]), shC = T([sway, CLIMB.shoulder[1] + bs, CLIMB.shoulder[2] + hunch]);
    const hipJ = s => T([sway * -0.5 + s * CLIMB.hip[0], CLIMB.hip[1] + bh, CLIMB.hip[2]]), shJ = s => T([sway + s * CLIMB.shoulder[0], CLIMB.shoulder[1] + bs, CLIMB.shoulder[2] + hunch]);
    // a hand or foot: on the stone where it bit; or reaching, from where it let go to where it will hook in, lifted off the
    // stone on the way and spread open; or knocked off and clawing; or running
    const limb0 = (key, s, isHand) => {
      const g = c.grip[key], r = c.dist / (g.d || c.dist), j = jit(s, isHand ? 29 : 23);
      if (sc) {   // running: a pair swings forward while the other pair pushes back, lifting off the stone as it comes through
        const w = (isHand ? 1 : -1) * s > 0 ? run : -run, lift = Math.max(0, (isHand ? 1 : -1) * s > 0 ? runB : -runB);
        const rest = isHand ? [s * 0.5, 0.42, 0] : [s * 0.5, -0.78, 0];
        return { at: T([rest[0] + w * 0.28, rest[1] + w * 0.1 * s, lift * 0.18]), lift };
      }
      const reaching = slip < 0.5 && p < 0.5 && key === mover;
      if (!reaching) { const h = this.held(g, r); return { at: [h[0] + j[0], h[1] + j[1], h[2] + j[2]], lift: slip }; }
      const q = smoothstep(reach), from = this.held(g, (g.liftD || c.dist) / (g.d || c.dist)), arc = Math.sin(q * Math.PI);
      const to = [s * (isHand ? CLIMB.hand[0] : CLIMB.foot[0]), isHand ? CLIMB.hand[1] : CLIMB.foot[1]];
      return { at: [lerp(from[0], to[0], q) + s * arc * (isHand ? 0.12 : 0.08), lerp(from[1], to[1], q) + arc * (isHand ? 0.24 : 0.1), arc * (isHand ? 0.3 : 0.16)], lift: arc };
    };
    // knocked loose for good, its hands and feet scrabble up and down the stone, in turn, catching at nothing; off the stone
    // they flail, open, at the air: the hands thrown up past its head, the legs kicking
    const scr = c.scrabble || 0, fl = c.falling || 0;
    const limb = (key, s, isHand) => {
      const m = limb0(key, s, isHand);
      if (scr > 0) {
        const w = Math.sin(t * (isHand ? 19 : 15) + s * 1.7 + (isHand ? 0 : 2));
        m.at = [m.at[0] + s * w * 0.05 * scr, m.at[1] + w * (isHand ? 0.2 : 0.1) * scr, m.at[2] + Math.max(0, w) * 0.12 * scr]; m.lift = Math.max(m.lift, scr * (0.5 + 0.5 * w));
      }
      if (fl > 0) {
        const ph = t * (isHand ? 8 : 6.5) + s * 2.1 + (isHand ? 0 : 1.3);
        const f = isHand ? [s * (0.5 + 0.1 * Math.sin(ph * 1.3)), 0.5 + 0.2 * Math.sin(ph), 0.2 + 0.15 * Math.cos(ph * 0.9)] : [s * (0.42 + 0.1 * Math.sin(ph * 1.1)), -0.8 + 0.15 * Math.sin(ph), 0.1 + 0.1 * Math.cos(ph)];
        m.at = m.at.map((v, i) => lerp(v, f[i], fl)); m.lift = lerp(m.lift, 1, fl);
      }
      // hanging by one hand: that hand stays hooked where it bit. The other is thrown out wide, clawing at the air; its
      // feet hang under its hips, trailing as it swings, and kick. Swinging back in, each is lifted over to its hold.
      if (dg && !(isHand && s === dg.hold)) {
        const j0 = isHand ? shJ(s) : hipJ(s), w = dg.t * (isHand ? 9 : 10) + s * 1.4, over = Math.sin(dg.back * Math.PI);
        const f = isHand ? [j0[0] + s * (0.4 + 0.08 * Math.sin(w * 0.7)), j0[1] + 0.05 + 0.2 * Math.sin(w), 0.3 + 0.1 * Math.cos(w * 0.8)]
          : [j0[0] + s * 0.07 - dg.hold * dg.vel * 0.22, j0[1] - 0.6 + 0.07 * Math.sin(w), 0.1 + 0.08 * Math.max(0, Math.sin(w))];
        m.at = [lerp(m.at[0], f[0], dg.off), lerp(m.at[1], f[1], dg.off) + (isHand ? over * 0.1 : 0), lerp(m.at[2], f[2], dg.off) + over * (isHand ? 0.22 : 0.1)];
        m.lift = Math.max(m.lift, dg.off, over);
      }
      return m;
    };
    const P2 = pr;
    // a hand or a foot, drawn in the rig so its long hooked fingers lie along the stone as the rest of it does: up the wall
    // for a hand, down it for a foot; spread open off the stone, and on it their tips curled down into the joints
    const claw = (at, s, dir, open, hs, n, len, w, palm) => {
      const spread = lerp(0.32, 0.62, open), curl = 1 - open, base = P2(at);
      P_ell(ctx, base[0], base[1], 0.065 * hs, 0.055 * hs, palm);
      for (let i = 0; i < n; i++) {
        const f = (i - (n - 1) / 2) * spread + s * 0.25 * dir, l = len * hs * ((i === 0 || i === n - 1) ? 0.82 : 1);
        const tip = [at[0] + Math.sin(f) * l, at[1] + dir * Math.cos(f) * l, at[2] + open * 0.05];
        const hook = [tip[0] + Math.sin(f) * 0.02, tip[1] - dir * 0.07 * curl + dir * 0.03 * open, tip[2] - 0.03 * curl];
        P_limb(ctx, [base, P2(tip), P2(hook)], w, greyD);
      }
    };
    // legs: frog-bent, knees standing out from the stone, toes hooked into it
    const outA = Math.atan2(bn[1], bn[0]);
    for (const s of [-1, 1]) {
      const L = limb('f' + s, s, false), hip = hipJ(s);
      let ft = L.at; if (lunge) ft = [lerp(ft[0], s * 0.3, lunge), lerp(ft[1], -0.6, lunge), lerp(ft[2], 0.1, lunge)];
      const knee = climbJoint(hip, ft, CLIMB.leg, dg ? [s * lerp(0.9, 0.35, dg.off), 0.35 * (1 - dg.off), lerp(0.3, 1, dg.off)] : [s * 0.9, 0.35, 0.3]);   // the knee out to the side, frog-fashion (hanging, out from the stone)
      P_limb(ctx, [P2(hip), P2(knee), P2(ft)], 0.075, greyD);
      claw(ft, s, -1, clamp(L.lift * 1.5, 0, 1), 1, 3, 0.13, 0.022, greyD);   // toes, pointing down the wall
    }
    // the back, end on: broad at the shoulders, narrowing to the hips further down the wall, humped out from the stone;
    // the knuckled spine along it, the ribs either side and the shoulder blades standing out
    const hump = T([0, (CLIMB.hip[1] + CLIMB.shoulder[1]) / 2 + (bs + bh) / 2, 0.22 + hunch]);
    const hl = hipJ(-1), hr = hipJ(1), sl = shJ(-1), sr = shJ(1);
    P_poly(ctx, [P2([hl[0] - 0.03, hl[1] - 0.04, hl[2]]), P2([hr[0] + 0.03, hr[1] - 0.04, hr[2]]), P2([hr[0] + 0.12, hump[1], hump[2] - 0.04]), P2([sr[0] + 0.06, sr[1], sr[2]]), P2([sl[0] - 0.06, sl[1], sl[2]]), P2([hl[0] - 0.12, hump[1], hump[2] - 0.04])], grey);
    const spine = q => (q < 0.5 ? [lerp(hipC[0], hump[0], q * 2), lerp(hipC[1], hump[1], q * 2), lerp(hipC[2] + 0.05, hump[2] + 0.02, q * 2)] : [lerp(hump[0], shC[0], q * 2 - 1), lerp(hump[1], shC[1], q * 2 - 1), lerp(hump[2] + 0.02, shC[2] + 0.06, q * 2 - 1)]);
    for (let i = 0; i < 3; i++) {
      const q = 0.35 + i * 0.18, sp = spine(q), half = lerp(0.14, 0.26, q);
      for (const s of [-1, 1]) P_limb(ctx, [P2([sp[0] + s * 0.03, sp[1], sp[2]]), P2([sp[0] + s * half * 0.6, sp[1] - 0.03, sp[2] - 0.06]), P2([sp[0] + s * half, sp[1] - 0.07, sp[2] - 0.14])], 0.018, greyD);
    }
    for (const s of [-1, 1]) { const b0 = shJ(s); P_poly(ctx, [P2([b0[0] - s * 0.18, b0[1] - 0.02, b0[2] + 0.06]), P2([b0[0] - s * 0.03, b0[1] - 0.02, b0[2] + 0.04]), P2([b0[0] - s * 0.14, b0[1] - 0.2, b0[2] + 0.07])], greyD); }   // shoulder blades
    for (let i = 0; i < 7; i++) { const sp = P2(spine((i + 0.5) / 7)); P_ell(ctx, sp[0], sp[1], 0.028, 0.02, greyL); }   // the spine, showing
    // arms: a hooked hand stays where it bit; the reaching one opens, comes up off the stone and reaches on up the wall
    for (const s of [-1, 1]) {
      const L = limb('h' + s, s, true), sho = shJ(s);
      let hd = L.at; if (lunge) hd = [lerp(hd[0], s * 0.42, lunge), lerp(hd[1], 0.75, lunge), lerp(hd[2], 0.6, lunge)];   // at the end it reaches for you
      if (c.cheer) hd = [lerp(hd[0], s * 0.4, c.cheer), lerp(hd[1], 1.02, c.cheer), lerp(hd[2], 0.12, c.cheer)];   // (or, leaping for joy, flings them up over its head)
      const el = climbJoint(sho, hd, CLIMB.arm, [s * 0.8, -0.2, 0.55]);
      P_limb(ctx, [P2(sho), P2(el), P2(hd)], 0.07, grey);
      const open = clamp(Math.max(L.lift * 1.6, slip, lunge), 0, 1), hs = (1 + L.lift * 0.35) * (1 + lunge * 1.4);
      claw(hd, s, 1, open, hs, 4, 0.19, 0.024, grey);
    }
    // the head, bent right back on a stretched neck so the face is turned up to you, its brow out from the wall and its
    // chin toward the stone. The body heaves under it and the face does not move off you
    const hc = T([sway * 0.4, CLIMB.head[1] + bs * 0.9, CLIMB.head[2] + hunch + 0.08 * (1 - smoothstep((c.dist - 2.5) / 6))]);
    if (dg) { hc[0] -= dg.side * 0.05 * dg.imp; hc[1] -= 0.1 * dg.imp; hc[2] -= 0.07 * dg.imp; }   // knocked down on its neck, and away from the blow
    const h2 = P2(hc), n0 = P2(shC);
    for (const s of [-1, 1]) P_line(ctx, n0[0] + s * 0.06 * bx[0], n0[1] + s * 0.06 * bx[1], h2[0] + s * 0.05 * bx[0], h2[1] + s * 0.05 * bx[1], 0.1, grey);   // the neck, stretched
    // (falling, the top of its head comes round from out of the stone to the end of it, the way its length now lies)
    const bnl = Math.hypot(bn[0], bn[1]) || 1, fallA = fl ? Math.atan2(bn[1] / bnl * (1 - fl) + bu[1] * fl * 2, bn[0] / bnl * (1 - fl) + bu[0] * fl * 2) : outA;
    const jerk = headTiltJerk(t, 3.1, 0.12) * (1 - lunge), brow = lerp(fallA, -Math.PI / 2, smoothstep(lunge * 2.5));
    // (the blow snaps its head round, and it comes back slowly; hanging, it lolls after the swing)
    const snap = dg ? -dg.side * 1.05 * dg.imp + dg.hold * 0.28 * dg.vel * dg.off : 0;
    ctx.save(); ctx.translate(h2[0], h2[1]); ctx.rotate(brow + Math.PI / 2 + jerk + snap); ctx.scale(1 + 0.05 * surge * live, 1 + 0.05 * surge * live);
    P_ell(ctx, 0, -0.06, 0.235, 0.22, greyD);                     // the skull, tipped back behind the face
    P_ell(ctx, 0, 0.12, 0.13, 0.07, faceD);                       // under the jaw, lifted toward you
    P_ell(ctx, 0, 0, 0.2, 0.21, face);
    // the eyes, blank whites staring up at you in sunken sockets: perfectly round as you see them, however the wall
    // foreshortens the face they are in (drawn in the canvas's own space, at the size the face's scale gives them)
    const roundAt = (x, y, r, col) => {
      const M = ctx.getTransform(), q = M.transformPoint({ x, y }), k = Math.sqrt(Math.abs(M.a * M.d - M.b * M.c));
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q.x, q.y, r * k, 0, TAU); ctx.fill(); ctx.restore();
    };
    // part of such a disc: between `from` and `to` down it (-1 its edge toward the brow, 1 its edge toward the chin)
    const bandAt = (x, y, r, col, from, to) => {
      const M = ctx.getTransform(), q = M.transformPoint({ x, y }), k = Math.sqrt(Math.abs(M.a * M.d - M.b * M.c));
      ctx.save(); ctx.setTransform(1, 0, 0, 1, q.x, q.y); ctx.rotate(Math.atan2(M.d, M.c) - Math.PI / 2);
      ctx.beginPath(); ctx.rect(-r * k * 1.1, from * r * k, r * k * 2.2, (to - from) * r * k); ctx.clip();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r * k, 0, TAU); ctx.fill(); ctx.restore();
    };
    // the black eye, once it has one (br: how far the bruise has come up): for a moment after the blow that eye is screwed
    // shut (wince). Its face is seen from in front: its right eye is the one on your left, as its right hand is on the wall
    const be = -(c.blackEye || 0), br = be ? (c.bruise === undefined ? 1 : c.bruise) : 0, wince = dg ? clamp(1 - (dg.t - 0.45) / 0.4, 0, 1) : 0;
    const KA = (v, a) => P.cola(wh ? mixc(v, [252, 248, 236], wh * 0.85) : v, a);
    for (const s of [-1, 1]) {
      const ex = s * 0.077, ey = -0.07;
      if (s !== be) {
        roundAt(ex, ey, 0.061, faceD);                             // sunken sockets
        roundAt(ex, ey, 0.043, eye);                               // the eyes
      } else {
        // the bruise, purple, spread round the socket, out over the cheekbone and up into the brow, darkest next the
        // eye (kept on its face); the socket purple-black; the lids swollen over the white, a slit of it left under
        // the upper one, a little bloodshot
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 0.2, 0.21, 0, 0, TAU); ctx.clip();
        roundAt(ex + s * 0.012, ey + 0.012, 0.1, KA([100, 60, 124], 0.5 * br));
        roundAt(ex + s * 0.032, ey + 0.052, 0.06, KA([100, 60, 124], 0.42 * br));
        roundAt(ex - s * 0.005, ey - 0.034, 0.07, KA([86, 48, 110], 0.4 * br));
        roundAt(ex, ey, 0.079, KA([52, 28, 68], 0.8 * br));
        ctx.restore();
        roundAt(ex, ey, 0.061, K(mixc([150, 144, 136], [26, 14, 32], br)));
        const mid = lerp(0, 0.34, br), top = lerp(lerp(-1, 0.08, br), mid, wince), bot = lerp(lerp(1, 0.6, br), mid, wince);
        roundAt(ex, ey, 0.048, KA([90, 54, 106], br));              // the lids, puffed up
        bandAt(ex, ey, 0.043, K(mixc([236, 236, 230], [216, 156, 152], 0.6 * br)), top, bot);   // what shows of the eye
        bandAt(ex, ey, 0.048, KA([30, 16, 38], br), top - 0.16, top);   // the crease under the swollen lid
      }
      P_ell(ctx, s * 0.022, 0.025, 0.013, 0.009, greyD);          // nostrils, seen from under the nose
    }
    const mo = 0.026 + near * 0.035 + lunge * 0.06 + c.look * 0.02 + (dg ? 0.05 * dg.jolt + 0.02 * dg.off : 0);   // the mouth hangs open, wider the nearer it is: the jaw drops (and at the blow)
    P_ell(ctx, 0, 0.085 + mo * 0.35, 0.048 + near * 0.017, mo, black);
    ctx.restore();
  },
};
