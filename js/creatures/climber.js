'use strict';
// The climber: grey, hook-fingered, its head bent right back so its face is always turned up to you. It climbs the
// outside of the tower (a lane that goes down: you only see it by looking over the rail): slowly while you watch it,
// fast while you do not. It climbs as a thing would: one hand reaches up and hooks into the stone while the opposite
// foot draws up and pushes, then the other side, and every push heaves it a step higher.
// Drawn as seen from above: the hands nearest, the face craned up at you on a stretched neck, the legs below.

// the height of a hand or foot against the body (0 low, 1 high) over one whole climbing cycle (psi 0..2pi), and whether
// it is off the stone: it reaches up, then is pulled down past the body as the body heaves up on it, holds while the other
// side reaches, and is pulled down again by the other side's push
function climbLimb(psi) {
  const q = (((psi % TAU) + TAU) % TAU) / (Math.PI / 2);
  if (q < 1) return { h: smoothstep(q), free: true };
  if (q < 2) return { h: 1 - 0.5 * smoothstep(q - 1), free: false };
  if (q < 3) return { h: 0.5, free: false };
  return { h: 0.5 - 0.5 * smoothstep(q - 3), free: false };
}
// two-bone limb from a to b, its joint bent out to the side `out` (+1 right, -1 left)
function climbJoint(a, b, l1, l2, out) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(Math.hypot(dx, dy), (l1 + l2) * 0.999) || 1e-3;
  const along = (d * d + l1 * l1 - l2 * l2) / (2 * d), side = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
  let nx = -uy, ny = ux; if (nx * out < 0) { nx = -nx; ny = -ny; }
  return [a[0] + ux * along + nx * side, a[1] + uy * along + ny * side];
}
CREATURES.climber = {
  name: 'the climber', h: 2.0, w: 1.7, faceY: 1.8, stepRate: 0.9, catchDist: 1.5, sound: 'climber',
  death: { delay: 0.12, dur: 0.35, sting: 'stingScrape' },
  voice: { kind: 'exhale', every: [6, 12] },
  init(c) { c.look = 0; c.slideTo = null; c.climbPh = 0; c.slip = 0; },
  onSeen(c) { c.look = 1; },
  // each half of the cycle is a reach, while the body hangs where it is, and then a push that heaves it up: the speed
  // follows it (a third of its pace through the reach, a surge through the push, its own pace over a whole step)
  speedMult(c, dt, seen) {
    c.look = Math.max(0, c.look - dt * 0.6);
    const sliding = !!c.distFn && c.slideTo !== null && c.slideTo - c.dist > 0.05;   // the light has knocked it back down the wall
    c.slip += ((sliding ? 1 : 0) - c.slip) * Math.min(1, dt * 8);
    if (c.frozen || c.dead || c.hold !== null || c.distFn) return 1;
    c.climbPh += dt * (seen ? 2.6 : 5.2);   // a reach about every 1.2 s while you watch it, twice as often while you do not
    const p = (c.climbPh / Math.PI) % 1;
    return p < 0.5 ? 0.35 : 0.35 + 2.04 * Math.sin((p - 0.5) * 2 * Math.PI);
  },
  draw(ctx, c, P) {
    const t = c.t, near = clamp(1 - c.dist / 16, 0, 1), lunge = c.lunge || 0, slip = c.slip || 0;
    const grey = P.col([118, 118, 124]), greyD = P.col([66, 66, 72]), greyL = P.col([140, 140, 146]), face = P.col([206, 202, 194]), faceD = P.col([150, 144, 136]);
    const black = P.col([10, 8, 10]), eye = P.col([236, 236, 230]);
    const ph = c.climbPh || 0, p = (ph / Math.PI) % 1, lead = (Math.floor(ph / Math.PI) & 1) ? 1 : -1;   // lead: the side whose hand reaches in this step
    const heave = (p > 0.5 ? Math.sin((p - 0.5) * 2 * Math.PI) : 0) * (1 - slip);
    const lean = (p < 0.5 ? Math.sin(p * 2 * Math.PI) : 0) * lead * 0.06 * (1 - slip);   // it leans into a reach
    const shY = 1.4 + heave * 0.15, shX = lean, hipX = -lead * 0.07 * heave, hipY = 0.8 + heave * 0.08;   // a heave big enough to read from the rail
    // legs: frog-bent, knees out, toes hooked into the stone; the one opposite the reaching hand draws up, then pushes
    for (const s of [-1, 1]) {
      const st = climbLimb(ph + (s < 0 ? Math.PI : 0)), h = lerp(st.h, 0, slip);
      const hip = [hipX + s * 0.11, hipY], foot = [s * (0.44 - 0.1 * h), 0.04 + 0.5 * h + Math.sin(t * 23 + s) * 0.03 * slip];
      const knee = climbJoint(hip, foot, 0.46, 0.46, s);
      P_limb(ctx, [hip, knee, foot], 0.075, greyD);
      fingers(ctx, foot[0], foot[1], -Math.PI / 2 + s * 0.35, 0.3, 0.1, 0.022, greyD);
    }
    // the body: broad at the shoulders and tapering away below, pressed to the wall, its back to you: the knuckled
    // spine, the ribs either side of it and the shoulder blades standing out
    P_poly(ctx, [[hipX - 0.15, hipY - 0.04], [hipX + 0.15, hipY - 0.04], [shX + 0.27, shY], [shX - 0.27, shY]], grey);
    const along = k => [lerp(hipX, shX, k), lerp(hipY, shY, k)];
    for (let i = 0; i < 3; i++) {
      const [x, y] = along(0.3 + i * 0.17), half = lerp(0.15, 0.27, 0.3 + i * 0.17) - 0.03;
      for (const s of [-1, 1]) P_limb(ctx, [[x + s * 0.03, y + 0.01], [x + s * half * 0.6, y - 0.02], [x + s * half, y - 0.08]], 0.018, greyD);
    }
    for (const s of [-1, 1]) P_poly(ctx, [[shX + s * 0.05, shY - 0.05], [shX + s * 0.21, shY - 0.05], [shX + s * 0.09, shY - 0.25]], greyD);   // shoulder blades
    P_line(ctx, hipX, hipY, shX, shY - 0.02, 0.03, greyD);
    for (let i = 0; i < 6; i++) { const [x, y] = along((i + 0.5) / 6); P_ell(ctx, x, y, 0.028, 0.017, greyL); }   // the spine, showing
    // arms: the reaching hand comes off the stone and goes up, fingers spread; a hooked hand stays where it bit, so the
    // body heaving up pulls it down past the shoulder
    for (const s of [-1, 1]) {
      const st = climbLimb(ph + (s > 0 ? Math.PI : 0)), h = lerp(st.h, 1, slip), free = st.free && slip < 0.5;
      const sh = [shX + s * 0.24, shY - 0.03];
      let hx = s * (0.4 + 0.13 * h), hy = shY + 0.2 + 0.55 * h + Math.sin(t * 29 + s) * 0.04 * slip;   // always above the shoulder: it hangs from them
      hx = lerp(hx, s * 0.36, lunge); hy = lerp(hy, 1.62, lunge);   // at the end it reaches for you
      const el = climbJoint(sh, [hx, hy], 0.37, 0.37, s);
      P_limb(ctx, [sh, el, [hx, hy]], 0.07, grey);
      const hs = 1 + lunge * 1.4;
      ctx.save(); ctx.translate(hx, hy); ctx.scale(hs, hs);
      P_ell(ctx, 0, 0, 0.07, 0.06, grey);
      const a0 = Math.PI / 2 + s * (free ? 0.45 : 0.2), spread = free ? 0.5 : 0.3, curl = free ? 0.5 : 1.9;   // spread open off the stone, hooked into it
      for (let i = 0; i < 4; i++) {
        const a = a0 + (i - 1.5) * spread, l = 0.19 * ((i === 0 || i === 3) ? 0.82 : 1), x1 = Math.cos(a) * l, y1 = Math.sin(a) * l;
        P_line(ctx, 0, 0, x1, y1, 0.026, greyD);
        P_line(ctx, x1, y1, x1 + Math.cos(a + s * curl) * 0.07, y1 + Math.sin(a + s * curl) * 0.07, 0.024, greyD);
      }
      ctx.restore();
    }
    // the head, bent right back on a stretched neck so the face is turned up to you; the body heaves under it and the
    // face does not move off you
    const hx0 = shX * 0.3, hy0 = 1.8, jerk = headTiltJerk(t, 3.1, 0.12) * (1 - lunge);
    P_poly(ctx, [[shX - 0.11, shY - 0.03], [shX + 0.11, shY - 0.03], [hx0 + 0.08, hy0 - 0.12], [hx0 - 0.08, hy0 - 0.12]], grey);   // the neck, stretched up
    for (const s of [-1, 1]) P_line(ctx, shX + s * 0.09, shY - 0.01, hx0 + s * 0.035, hy0 - 0.13, 0.02, greyD);   // its cords, pulled tight
    ctx.save(); ctx.translate(hx0, hy0); ctx.rotate(jerk);
    P_ell(ctx, 0, 0.04, 0.235, 0.22, greyD);                      // the skull, tipped back behind the face
    P_ell(ctx, 0, -0.12, 0.13, 0.07, faceD);                      // under the jaw, lifted toward you
    P_ell(ctx, 0, 0, 0.2, 0.21, face);
    for (const s of [-1, 1]) {
      P_ell(ctx, s * 0.077, 0.07, 0.064, 0.058, faceD);           // sunken sockets
      P_ell(ctx, s * 0.077, 0.07, 0.045, 0.04, eye);
      P_ell(ctx, s * 0.077, 0.091, 0.017, 0.017, black);          // the eyes rolled up to you, the whites under them
      P_ell(ctx, s * 0.022, -0.025, 0.013, 0.009, greyD);         // nostrils, seen from under the nose
    }
    const mo = 0.026 + near * 0.035 + lunge * 0.06 + c.look * 0.02;   // the mouth hangs open, wider the nearer it is: the jaw drops
    P_ell(ctx, 0, -0.085 - mo * 0.35, 0.048 + near * 0.017, mo, black);
    ctx.restore();
  }
};
