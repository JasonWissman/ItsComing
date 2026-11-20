'use strict';
// The demon: every shape that came before, and the one under them: a tall thing in a black hooded robe that falls to the
// ground, its face lost in the dark of the hood but for two pale points, its eyes. c.anger (set by the night) is how much
// you are still holding and drives the pace; c.rage (the night eases it toward anger) is how it looks: anything at all in
// your hands and it is plainly enraged: its eyes burn red, a snarling mouth opens in the dark under them, it shakes, and it
// comes on in fits (demonFit): it lurches, stops dead, staggers aside, its head twitching. Empty-handed it is only tall,
// and it walks.
// Coming close it bends down toward you, its shoulders hunched over (c.stoop, metres: its shoulders and head that much
// lower, the robe under them shorter, its feet where they were), so its face stays in the view (demonStoop).
// For the ending the night also sets c.calm (it settles: no rage left in its body, a little smaller), c.soft (the dark
// lightens), c.disrobe (in the meadow it takes the robe off: see demonOff), c.dance and c.fade; c.mood, the face it makes
// while it holds you (see DEMON_MOODS), and c.unveil, how far that face has come up out of the dark of the hood (0: still
// only the two eyes); c.hug, its arms lifted up and then reaching out and taking hold of you (see demonHugArms); c.sob
// (crying: its shoulders heave); c.tilt0 and c.settle (its head comes level from where it was); c.nod (its head bowed to
// the ground, 1, or thrown back, -1), c.jolt (its head seizing, after it is thrown back) and c.gulp (the opening of its
// hood wider for a moment, taking something in); and c.still (reduced motion: no trembling, no heaving, no tear running).
// All of the ending's come from demonEnding.
// The faces it goes through, in order: angry, neutral, angry, confused, confused mirrored, sad, angry, neutral, confused,
// confused mirrored, content, happy. c.mood 0 is the first and 11 the last, and between two whole numbers it is part way from one to the next. Each is a set of numbers, so any two
// blend smoothly. Measured from fy (see draw): the eyes sit at fy + 0.03, brows bi (inner end) and bo (outer end) above
// them, bq one brow raised and the other lowered by that much; er, eh the eye's half width and height, open how far it is
// open, lid its slant (outer corner down), lidLine an upper lid drawn over it, sock a dark socket, glow red light in it, arc
// closed happy eyes (no face has pupils: the eyes are blank); the mouth: corners my below fy and mc higher than that, its
// upper lip's middle mu above the corners and its lower lip's md, mr how round it is, mk how far it is twisted
// (one corner up, the other down), teeth, joy (a red mouth with a tongue), tears, blush; jaw a longer face, fw a wider one,
// tilt of the head and trem a tremble.
// (angry, its eyes are round: two burning red circles in round dark sockets)
const DEMON_ANGRY = { skin: [156, 42, 36], fw: 0.004, jaw: 0.6, brow: 1, bi: 0.006, bo: 0.044, bw: 0.017, bq: 0, er: 0.015, eh: 0.015, open: 1, lid: -0.15, lidLine: 0, sock: 1, glow: 1, arc: 0, my: -0.098, mw: 0.056, mc: -0.008, mu: 0.03, md: -0.052, mr: 0.75, mk: 0, teeth: 1, joy: 0, tears: 0, blush: 0, tilt: 0.04, trem: 0.8 };
// confused: one brow up and the other down, the eyes wide, the head on one side, a small mouth twisted to one side
const DEMON_CONFUSED = { skin: [164, 154, 164], fw: 0, jaw: 0.1, brow: 1, bi: 0.044, bo: 0.05, bw: 0.012, bq: 0.024, er: 0.018, eh: 0.015, open: 1, lid: 0, lidLine: 0.6, sock: 0.1, glow: 0, arc: 0, my: -0.082, mw: 0.024, mc: 0, mu: 0.007, md: -0.009, mr: 0.55, mk: 0.32, teeth: 0, joy: 0, tears: 0, blush: 0, tilt: -0.2, trem: 0 };
// and the same face mirrored: the other brow up, the mouth twisted the other way, the head on its other side (all else in the
// face is the same either side, so blending one into the other it rights its head and its mouth and tips them over)
const DEMON_CONFUSED_M = Object.assign({}, DEMON_CONFUSED, { bq: -DEMON_CONFUSED.bq, mk: -DEMON_CONFUSED.mk, tilt: -DEMON_CONFUSED.tilt });
const DEMON_NEUTRAL = { skin: [150, 142, 148], fw: 0, jaw: 0, brow: 0.85, bi: 0.036, bo: 0.036, bw: 0.011, bq: 0, er: 0.017, eh: 0.011, open: 0.85, lid: 0, lidLine: 0.7, sock: 0.12, glow: 0, arc: 0, my: -0.078, mw: 0.034, mc: 0, mu: 0.003, md: -0.003, mr: 0.15, mk: 0, teeth: 0, joy: 0, tears: 0, blush: 0, tilt: 0, trem: 0 };
const DEMON_MOODS = [
  // angry: red, the eyes tall burning slits in dark sockets under brows driven down, a snarl full of teeth, shaking
  DEMON_ANGRY,
  // neutral: grey, the brows level, the eyes open and blank, the mouth a flat closed line
  DEMON_NEUTRAL,
  // angry again
  Object.assign({}, DEMON_ANGRY, { tilt: -0.03 }),
  // confused, and then the same face mirrored
  DEMON_CONFUSED, DEMON_CONFUSED_M,
  // sad: the brows up in the middle, heavy lids, tears running, the mouth turned down and trembling
  { skin: [168, 162, 182], fw: 0.004, jaw: 0, brow: 1, bi: 0.052, bo: 0.016, bw: 0.012, bq: 0, er: 0.018, eh: 0.012, open: 0.5, lid: 0.3, lidLine: 1, sock: 0.2, glow: 0, arc: 0, my: -0.086, mw: 0.032, mc: -0.018, mu: 0.005, md: -0.008, mr: 0.3, mk: 0, teeth: 0, joy: 0, tears: 1, blush: 0.15, tilt: 0.15, trem: 0.35 },
  // angry once more, the scare: its head thrown back, the faces of all the others round it (night 13), its jaw dropped
  // in a screech, shaking hard
  Object.assign({}, DEMON_ANGRY, { tilt: 0, trem: 1, jaw: 0.8, md: -0.068 }),
  // neutral again: the same grey face as before, the tears gone
  DEMON_NEUTRAL,
  // confused again, and mirrored again, as the light comes
  DEMON_CONFUSED, DEMON_CONFUSED_M,
  // content: warmer, the brows soft, the eyes half closed, the corners of the mouth turned up in a small closed smile
  { skin: [224, 202, 186], fw: 0.012, jaw: 0, brow: 0.6, bi: 0.038, bo: 0.032, bw: 0.01, bq: 0, er: 0.018, eh: 0.012, open: 0.45, lid: 0.1, lidLine: 1, sock: 0, glow: 0, arc: 0, my: -0.07, mw: 0.04, mc: 0.012, mu: -0.006, md: -0.013, mr: 0.3, mk: 0, teeth: 0, joy: 0.1, tears: 0, blush: 0.4, tilt: 0.05, trem: 0 },
  // happy: eyes closed in two arches under faint, soft brows, round pink cheeks, a wide open smile
  { skin: [240, 214, 186], fw: 0.02, jaw: 0, brow: 0.32, bi: 0.04, bo: 0.036, bw: 0.01, bq: 0, er: 0.016, eh: 0.012, open: 0, lid: 0, lidLine: 0, sock: 0, glow: 0, arc: 1, my: -0.045, mw: 0.05, mc: 0, mu: 0, md: -0.04, mr: 1, mk: 0, teeth: 0, joy: 1, tears: 0, blush: 1, tilt: 0, trem: 0 },
];
const DEMON_MOOD_NAMES = ['angry', 'neutral', 'angry', 'confused', 'confused mirrored', 'sad', 'angry', 'neutral', 'confused', 'confused mirrored', 'content', 'happy'];
// Between confused (mirrored) and sad it does not blend: it glitches, flicking through these faces one after another, each held a
// moment and snapped to the next, as if trying each on to understand what is happening, before it lands on sad (with
// reduced motion, some of them, each fading slowly into the next: DEMON_GLITCH_STILL). Each is the neutral face with these
// changes
const DEMON_GLITCH = [
  // pain: the brows knotted up in the middle, the eyes screwed shut, a wide grimace full of teeth, shaking
  { skin: [178, 120, 116], bi: 0.05, bo: 0.008, bw: 0.015, open: 0.12, lid: 0.25, lidLine: 1, sock: 0.6, my: -0.085, mw: 0.052, mc: -0.01, mu: 0.012, md: -0.02, mr: 0.15, teeth: 1, tilt: 0.12, trem: 1, jaw: 0.2 },
  // envy: sallow and green, one brow cocked, the eyes narrowed sidelong, the mouth pulled tight to one side
  { skin: [128, 156, 112], bq: 0.02, bi: 0.016, bo: 0.034, open: 0.35, lid: -0.12, lidLine: 1, sock: 0.4, mw: 0.026, mu: 0.002, md: -0.004, mr: 0.1, mk: -0.35, tilt: 0.16 },
  // sorrow: blue, the brows up in the middle, the eyes wet and heavy, the mouth sagging
  { skin: [134, 146, 192], bi: 0.06, bo: 0.01, open: 0.55, lid: 0.35, lidLine: 1, sock: 0.3, mw: 0.03, mc: -0.026, mu: 0.004, md: -0.01, mr: 0.3, tears: 1, tilt: -0.1, trem: 0.4 },
  // grimace: the brows down hard, the lips peeled back flat off clenched teeth
  { skin: [182, 160, 140], bi: 0.012, bo: 0.03, bw: 0.016, open: 0.45, lid: -0.05, lidLine: 1, sock: 0.5, mw: 0.064, mc: 0.004, mu: 0.013, md: -0.013, mr: 0.05, teeth: 1, tilt: -0.06, trem: 0.7, fw: 0.008 },
  // terror: bloodless, the brows shot up, the eyes huge, the mouth hanging open in a long scream
  { skin: [214, 214, 222], bi: 0.066, bo: 0.056, er: 0.022, eh: 0.025, open: 1, lidLine: 0, sock: 0.25, my: -0.09, mw: 0.028, mu: 0.016, md: -0.062, mr: 1, jaw: 0.7, tilt: 0.08, trem: 1 },
  // empty: grey and slack, no brows, the eyes two blank holes, a mouth that is barely there
  { skin: [112, 112, 118], brow: 0, er: 0.017, eh: 0.017, open: 0, lidLine: 0, sock: 1, mw: 0.012, mu: 0.001, md: -0.001, mr: 0.1, tilt: 0 },
  // shock: the brows high, the eyes wide, the mouth a round O, the jaw dropped
  { skin: [204, 192, 198], bi: 0.06, bo: 0.06, er: 0.021, eh: 0.022, open: 1, lidLine: 0, sock: 0.1, my: -0.088, mw: 0.022, mu: 0.024, md: -0.034, mr: 1, jaw: 0.45, tilt: -0.14, trem: 0.5 },
].map(d => Object.assign({}, DEMON_NEUTRAL, d));
const DEMON_GLITCH_FROM = 4;   // DEMON_MOODS[4] (confused, mirrored) to [5] (sad) is where it glitches
function demonBlend(A, B, k) {
  const F = {};
  for (const key in A) F[key] = Array.isArray(A[key]) ? mixc(A[key], B[key], k) : lerp(A[key], B[key], k);
  return F;
}
// How long it holds each face and how long it takes to go into the next (seconds), in the order of DEMON_MOODS, while it
// holds you, as far as sad: the first slow; into the second angry quick (and it is held longer, as it leans in at you), and
// out of it to confused quick; confused held, going smoothly over into the same face mirrored, held as long, and on into the
// glitch. From sad on the night times them (demonEnding): it cries a while, holding you still, bows its head and cries on,
// throws it back angry (the scare), and comes back to its grey neutral face
const DEMON_MOOD_TIME = [[1.0, 0.9], [1.0, 0.25], [1.6, 0.4], [1.0, 0.7], [1.0, 0.9]];
// with reduced motion: the same in all, but no quick turns: each goes into the next over at least 0.6 s, and the glitch
// from confused to sad is a slow run of cross-fades (see demonMood) over 1.6 s, its faces each come and gone in turn (the
// two confused faces held as long as each other, and the one fading into the other)
const DEMON_MOOD_TIME_STILL = [[1.0, 0.9], [0.65, 0.6], [1.4, 0.6], [0.55, 0.9], [0.55, 1.6]];
// which face it is making u seconds into its faces (0: the first, angry; a part-way number while it goes into the next;
// 5, sad, once it is there); still: reduced motion
function demonMoodAt(u, still) {
  const MT = still ? DEMON_MOOD_TIME_STILL : DEMON_MOOD_TIME;
  let t0 = 0;
  for (let j = 0; j < MT.length; j++) {
    const [h, b] = MT[j];
    if (u < t0 + h + b) return j + clamp((u - t0 - h) / b, 0, 1);
    t0 += h + b;
  }
  return MT.length;
}
// The ending, as night 13 plays it and the lab shows it: how it is t seconds after it reached you. E is the night's
// timeline (END in js/levels/night13.js; the lab keeps a copy), d0 how far off it was then and y0 how far it was already
// bent down to you; still, reduced motion. Its body (settle, hug, unveil, yOff, sob, calm, mood, nod, jolt, disrobe), how far
// off it is (dist, from where you stand), and scare: where it is in the scare (null outside it; see demonScareAt). It holds
// you from when it takes hold until it lets you go, after it is happy: its arms lifted first (hug.lift), then reaching out
// and taking hold of you (hug.grab), quick, its hands gripping the bottom edge of the view at its corners; and only once they
// are there does its face come up out of the dark of the hood (E.unveil). Crying, its head goes down, bowed toward the
// ground, its face lost in the shadow of the hood (E.down), and it cries on a while, bowed; it stops (E.hush), and is
// still; then (E.scare[0]) it throws
// its head back, fast, angry (with reduced motion it lifts it, slower and not as far), its head seizing while the faces of
// the others are all round it; they are taken back into it (E.scare[1] to [2]) and its head comes level again
function demonEnding(E, t, d0, y0, still) {
  const sp = (a, b) => smoothstep(clamp((t - a) / (b - a), 0, 1)), lin = (a, b) => clamp((t - a) / (b - a), 0, 1), rel = E.release;
  const go = sp(rel, rel + 0.9);   // letting you go: the hands open and come away, and the arms down
  const lift = sp(E.lift[0], E.lift[1]) * (1 - sp(rel + 0.3, rel + 1.5)), grab = (1 - Math.pow(1 - lin(E.grab[0], E.grab[1]), 3)) * (1 - go);
  const lean = sp(E.lean[0], E.lean[1]) * (1 - sp(E.lean[2], E.lean[3]));   // the second angry face: in at you, and back
  const walk = sp(E.walk[0], E.walk[1]), calm = sp(rel, rel + 1.6);
  const [s0, s1, s2] = E.scare, u = t - s0;
  // its head: bowed, then thrown back (in a tenth of a second) and held back as the faces are up; it comes forward as it
  // takes them back, and level
  let nod = sp(E.down[0], E.down[1]);
  if (u >= 0) {
    nod = still ? lerp(1, -0.35, sp(s0, s0 + 0.6)) : lerp(1, -1 + 0.25 * sp(s0 + 0.12, s1), 1 - Math.pow(1 - lin(s0, s0 + 0.1), 3));
    nod *= 1 - sp(s1, s2 + 0.3);
  }
  return {
    settle: sp(0, E.settle),
    hug: lift > 0.001 || grab > 0.001 ? { lift, grab } : null,
    unveil: sp(E.unveil[0], E.unveil[1]),
    // bent down to your face while it holds you (further as it leans in), and straight once it lets you go
    yOff: (lerp(y0 || 0, -0.72, sp(E.stoop[0], E.stoop[1])) - 0.1 * lean) * (1 - calm),
    dist: lerp(lerp(d0, 0.68, sp(E.near[0], E.near[1])) - 0.36 * lean, 3.3, walk),
    sob: sp(E.sad - 0.3, E.sad + 0.9) * (1 - sp(E.hush - 0.3, E.hush + 0.3)),
    calm,
    // sad until the scare; angry in a snap (with reduced motion over a third of a second); then neutral, confused, the same
    // mirrored, content and happy
    mood: t < E.moods ? 0 : u < 0 ? Math.min(5, demonMoodAt(t - E.moods, still)) : 5 + lin(s0, s0 + (still ? 0.3 : 0.03)) + lin(E.neutral[0], E.neutral[1]) + lin(E.confused[0], E.confused[1]) + lin(E.mirror[0], E.mirror[1]) + lin(E.content[0], E.content[1]) + lin(E.happy[0], E.happy[1]),
    nod,
    jolt: still || u < 0 ? 0 : Math.min(1, u / 0.06) * (1 - sp(s0 + 0.2, s1 + 0.2)),
    scare: u >= 0 && t < s2 + 0.05 ? { u, up: s1 - s0, take: s2 - s1 } : null,
    disrobe: clamp((t - E.disrobe[0]) / (E.disrobe[1] - E.disrobe[0]), 0, 1),
  };
}
// ---------- the scare ----------
// Its head thrown back, the faces of all the others (night 13: each as it came up into your face in its death lunge, a
// square picture, top down) are all round it at once, big, in the dark behind it: here, where each is from the middle of
// its face in the view (x right, as much of half the view's width; y up, as much of its height), how big (the side of its
// square, as much of the view's height) and how it is turned; and which face goes where (the most striking the biggest,
// out in the open)
const DEMON_SCARE_SLOTS = [
  [-0.64, 0.17, 0.5, -0.14], [0.66, 0.2, 0.54, 0.12], [-0.9, -0.24, 0.42, 0.2], [0.9, -0.2, 0.44, -0.18],
  [-0.3, 0.38, 0.36, 0.08], [0.3, 0.42, 0.4, -0.1], [-0.5, -0.36, 0.34, -0.24], [0.52, -0.38, 0.36, 0.22],
  [-1.0, 0.3, 0.4, 0.1], [1.0, 0.34, 0.42, -0.08], [-0.33, 0.02, 0.3, 0.3], [0.35, -0.02, 0.32, -0.26],
];
// (the walker, crawler, smiler, watcher, runner, swimmer, climber, customer, signalman, other, carrier, tall: the slot each has)
const DEMON_SCARE_AT = [10, 6, 0, 4, 3, 7, 8, 1, 2, 5, 9, 11];
// the faces in the scare (sc from demonEnding; n faces; still: reduced motion): each { i, x, y, s, r, back, front } (back
// and front: how much of it is there behind it and in front of it), and gulp, how far the opening of its hood is widened
// as they go into it. They come all at once in a snap, a little big and settling, and loom a little closer while they are
// there, each jittering and glitching on a beat of its own; then, one after another, each flies into the opening of its
// hood, turning and shrinking to nothing, in front of it as it goes. With reduced motion they come over a third of a
// second, keep still, and fade where they are, one after another.
function demonScareAt(sc, n, still) {
  const out = { faces: [], gulp: 0 };
  if (!sc) return out;
  const h = x => { const v = Math.sin(x * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
  const u = sc.u, fly = Math.max(0.1, sc.take * 0.55), late = sc.take - fly;
  for (let i = 0; i < n; i++) {
    const [x0, y0, s0, r0] = DEMON_SCARE_SLOTS[DEMON_SCARE_AT[i % DEMON_SCARE_AT.length] % DEMON_SCARE_SLOTS.length];
    const k = clamp((u - sc.up - late * ((i * 5) % n) / Math.max(1, n - 1)) / fly, 0, 1);   // (how far into it it has gone)
    let x = x0, y = y0, s = s0, r = r0, a, front = 0;
    if (still) a = smoothstep(clamp(u / 0.35, 0, 1)) * (1 - smoothstep(k));
    else {
      const pop = 1 + 0.3 * Math.pow(1 - clamp(u / 0.12, 0, 1), 2), loom = 1 + 0.08 * clamp(u / sc.up, 0, 1), b = Math.floor(u / 0.055) + i * 7.31;
      const glitch = h(b + 0.37) < 0.1 && k === 0;
      x += (h(b) - 0.5) * 0.02 + (glitch ? (h(b + 0.6) - 0.5) * 0.09 : 0); y += (h(b + 0.21) - 0.5) * 0.02; r += (h(b + 0.44) - 0.5) * 0.09;
      s *= pop * loom * (glitch ? 1.06 : 1);
      const e = k * k * k;
      x = lerp(x, 0, e); y = lerp(y, 0, e); s *= lerp(1, 0.04, e); r += (i % 2 ? 1 : -1) * 2.4 * k * k;
      a = 1 - smoothstep(clamp((k - 0.82) / 0.18, 0, 1));
      front = smoothstep(clamp(k / 0.15, 0, 1));
      if (k > 0.75 && k < 1) out.gulp = Math.max(out.gulp, Math.sin(Math.PI * (k - 0.75) / 0.25));
    }
    if (a > 0.004) out.faces.push({ i, x, y, s, r, back: a * (1 - front), front: a * front });
  }
  return out;
}
// the faces (imgs, by i) of those in the scare (sc: demonScareAt), behind it (layer 'back') or in front of it ('front'),
// drawn a of the way; ctx with its middle at the middle of its face, a unit the view's height, y down; wide, half the
// view's width as much of its height (spread no narrower than a square view)
function demonScareDraw(ctx, imgs, sc, layer, a, wide) {
  const a0 = ctx.globalAlpha, xw = Math.max(0.5, wide || 0.89);
  for (const f of sc.faces) {
    const img = imgs[f.i], al = f[layer] * a;
    if (!img || al < 0.004) continue;
    ctx.save(); ctx.translate(f.x * xw, -f.y); ctx.rotate(f.r); ctx.globalAlpha = a0 * al;
    ctx.drawImage(img, -f.s / 2, -f.s / 2, f.s, f.s);
    ctx.restore();
  }
  ctx.globalAlpha = a0;
}
// a face's picture for the scare, its edges let go into the dark: the square's corners and edges gone, soft
function demonVignette(cv) {
  if (!cv) return cv;
  const x = cv.getContext('2d'), w = cv.width, hh = cv.height, g = x.createRadialGradient(w / 2, hh / 2, Math.min(w, hh) * 0.3, w / 2, hh / 2, Math.min(w, hh) * 0.5);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'destination-in'; x.fillStyle = g; x.fillRect(0, 0, w, hh); x.restore();
  return cv;
}
// the faces it tries on, with reduced motion: pain, sorrow, terror and empty, each cross-faded slowly into the next
const DEMON_GLITCH_STILL = [0, 2, 4, 5];
// the face for mood m; still (reduced motion): no glitching: from confused to sad it goes through some of the same faces,
// but each fades into the next, nothing snapped
function demonMood(m, still) {
  const i = clamp(Math.floor(m), 0, DEMON_MOODS.length - 2), u = clamp(m - i, 0, 1);
  if (i === DEMON_GLITCH_FROM && u > 0 && u < 1) {
    // even steps through confused, the glitch faces, and sad: each held, then snapped to the next in the last fifth (with
    // reduced motion, the whole of each step a fade into the next)
    const seq = [DEMON_MOODS[i], ...(still ? DEMON_GLITCH_STILL.map(k => DEMON_GLITCH[k]) : DEMON_GLITCH), DEMON_MOODS[i + 1]], n = seq.length - 1, q = u * n, j = Math.min(n - 1, Math.floor(q));
    return demonBlend(seq[j], seq[j + 1], still ? smoothstep(q - j) : smoothstep((q - j - 0.8) / 0.2));
  }
  return demonBlend(DEMON_MOODS[i], DEMON_MOODS[i + 1], smoothstep(u));
}
// the top row of its teeth, left to right: how far each is off its place (as much of the mouth's half width), and its
// width and length (as much of the usual)
const DEMON_TEETH_TOP = [[0.05, 0.9, 0.78], [-0.07, 1.25, 1.22], [0.03, 0.85, 0.96], [0.08, 1.12, 1.38], [-0.04, 1.0, 0.7]];
// the face for c.mood, drawn in the head's frame (fy as draw() has it)
function demonMoodFace(ctx, c, P, fy, F) {
  const t = c.t, move = c.still ? 0 : 1;
  const fh = 0.13 + 0.045 * F.jaw, fc = fy - 0.03 * F.jaw, ey = fy + 0.03;
  P_ell(ctx, 0, fc, 0.085 + F.fw, fh, P.col(F.skin));
  // the mouth first, so the eyes are never under it: corners, the middle of each lip, and how round its ends are
  const q = move * F.trem * Math.sin(t * 23) * 0.003, w = F.mw, cy = fy + F.my + F.mc, uy = fy + F.my + F.mu + q, dy = fy + F.my + F.md - q, xr = lerp(0.3, 1, F.mr);
  const cu = (uy - 0.25 * cy) / 0.75, cd = (dy - 0.25 * cy) / 0.75;
  const mouth = () => { ctx.beginPath(); ctx.moveTo(-w, cy); ctx.bezierCurveTo(-w * xr, cu, w * xr, cu, w, cy); ctx.bezierCurveTo(w * xr, cd, -w * xr, cd, -w, cy); ctx.closePath(); };
  ctx.save(); if (Math.abs(F.mk) > 0.001) { ctx.translate(0, cy); ctx.rotate(F.mk); ctx.translate(0, -cy); }   // (twisted: one corner up, the other down)
  mouth(); ctx.fillStyle = P.col(mixc([0, 0, 0], [120, 34, 44], F.joy)); ctx.fill();
  if (F.teeth > 0.02 || F.joy > 0.02) {
    ctx.save(); mouth(); ctx.clip();
    const tooth = P.cola([224, 212, 200], Math.min(1, F.teeth * 1.5)), edge = (y0, x) => cy + (y0 - cy) * (1 - (x / w) * (x / w));
    // square teeth, the top row uneven (each its own width, length and place: the same every time), the bottom even
    if (F.teeth > 0.02) for (let i = -2; i <= 2; i++) {
      const x = i * w * 0.38, up = edge(uy, x), dn = edge(dy, x), gap = Math.abs(up - dn) * F.teeth, [ox, tw, tl] = DEMON_TEETH_TOP[i + 2];
      ctx.fillStyle = tooth;
      ctx.fillRect(x + ox * w - 0.0055 * tw, up - gap * 0.36 * tl, 0.011 * tw, gap * 0.36 * tl + 0.02);
      ctx.fillRect(x - 0.005, dn - 0.02, 0.01, gap * 0.26 + 0.02);
    }
    if (F.joy > 0.02) P_ell(ctx, 0, dy + 0.013, w * 0.44, 0.011, P.cola([230, 120, 130], F.joy));
    ctx.restore();
  }
  ctx.restore();
  if (F.blush > 0.02) for (const s of [-1, 1]) P_ell(ctx, s * 0.06, fy - 0.025, 0.02, 0.014, P.cola([236, 120, 130], 0.7 * F.blush));
  const er = [255, 50, 30], open = 1 - F.arc;
  for (const s of [-1, 1]) {
    const ex = s * 0.036, rot = -s * F.lid, ry = Math.max(0.0015, F.eh * F.open);
    // (enraged, the eyes are round: the socket and the glow round them are round with them)
    if (F.sock > 0.02) P_ell(ctx, ex, ey, lerp(0.032, 0.025, F.glow), lerp(0.02 + 0.004 * F.lid, 0.025, F.glow), P.cola([0, 0, 0], F.sock), rot);
    if (F.glow > 0.02) P_ell(ctx, ex, ey, 0.032, 0.032, rgba(er, 0.25 * F.glow), rot);
    if (open > 0.02) {
      ctx.save(); ctx.globalAlpha *= open;
      P_ell(ctx, ex, ey, F.er, ry, P.col([236, 232, 220]), rot);
      if (F.glow > 0.02) P_ell(ctx, ex, ey, F.er, ry, rgba(er, F.glow), rot);
      if (F.lidLine > 0.02) { ctx.strokeStyle = P.cola([20, 12, 16], F.lidLine); ctx.lineWidth = 0.007; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(ex, ey, F.er * 1.08, ry + 0.002, rot, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke(); }
      ctx.restore();
    }
    if (F.arc > 0.02) { ctx.strokeStyle = P.cola([0, 0, 0], F.arc); ctx.lineWidth = 0.012; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(ex, ey - 0.01, 0.02, 0.25, Math.PI - 0.25); ctx.stroke(); }
    if (F.brow > 0.02) P_line(ctx, s * 0.068, ey + F.bo + s * F.bq, s * 0.013, ey + F.bi + s * F.bq * 0.6, F.bw, P.cola([0, 0, 0], F.brow));   // (bq: the one raised, the other lowered)
    if (F.tears > 0.02) {
      // a wet line down from the lower lid, and a drop running down it
      const x0 = s * 0.04, y0 = ey - ry - 0.002, x1 = s * 0.054, y1 = ey - 0.085, tear = [200, 228, 255];
      ctx.strokeStyle = rgba(tear, 0.7 * F.tears); ctx.lineWidth = 0.006; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(s * 0.05, ey - 0.03, x1, y1); ctx.stroke();
      P_ell(ctx, ex, y0 + 0.001, F.er * 0.85, 0.003, rgba(tear, 0.6 * F.tears));
      const u = move ? (t * 0.42 + (s > 0 ? 0 : 0.5)) % 1 : 0.62, a = F.tears * Math.min(1, (1 - u) * 6), px = lerp(lerp(x0, s * 0.05, u), lerp(s * 0.05, x1, u), u), py = lerp(lerp(y0, ey - 0.03, u), lerp(ey - 0.03, y1, u), u);
      P_ell(ctx, px, py, 0.0065, 0.009, rgba(tear, 0.9 * a)); P_ell(ctx, px - 0.002, py + 0.003, 0.002, 0.003, rgba([255, 255, 255], a));
    }
  }
}
// its arms lifted and then taking hold of you (c.hug: lift 0..1, grab 0..1). A thing this close is drawn as you see it, in
// the view's own pixels: from its shoulders (where draw() has them) its arms come up, the hands open and the long fingers
// spread, high either side of its head; then it reaches out and takes hold of you, quick, as the tall thing in the bedroom
// did: the arms come at you out of the bottom of the view, the forearms up from below its sides, the hands low in its
// corners, gripping its bottom edge, big and near, the palms toward you and the fingers curling in over your shoulders. At lift 0 and grab 0 it is
// the arm as draw() has it.
let demonGlowCv = null;   // (the light about its arms, drawn small: see demonHugArms)
function demonHugArms(ctx, c, P, body, S0, E0, H0, wid, fing) {
  const h = c.hug, l = h.lift, w = h.grab, g = Math.max(l, w);
  const M = ctx.getTransform(), dpr = ctx.canvas.width / R.W, W = R.W, H = R.H, cx = W / 2;
  const scr = p => { const q = M.transformPoint({ x: p[0], y: p[1] }); return [q.x / dpr, q.y / dpr - R.viewY]; };
  const k = Math.hypot(M.a, M.b) / dpr;   // the view's pixels to one of its metres, across
  const mix2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const unit = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const turn = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const squeeze = (c.still ? 0 : Math.sin(c.t * 1.3) * 0.5 + 0.5) * w * 0.006 * W;   // holding on, it draws you in a little now and then
  // its own dark, as its light has it, and that light catching the inner edge of the arms
  const base = mixc([4, 3, 6], [104, 90, 126], c.soft || 0), rim = P.col(mixc(base, [150, 130, 140], 0.6));
  // a limb in the view: from a to b round the control point m, its width going from wa to wb, round at both ends
  let dc = ctx;   // (where the limbs go: the view, or the light round them)
  const limb = (a, m, b, wa, wb, col, dx) => {
    const n = 12, L = [], Rt = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * m[0] + u * u * b[0] + (dx || 0), y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * m[1] + u * u * b[1];
      const tx = 2 * (1 - u) * (m[0] - a[0]) + 2 * u * (b[0] - m[0]), ty = 2 * (1 - u) * (m[1] - a[1]) + 2 * u * (b[1] - m[1]), tl = Math.hypot(tx, ty) || 1, hw = lerp(wa, wb, u) / 2;
      L.push([x - ty / tl * hw, y + tx / tl * hw]); Rt.push([x + ty / tl * hw, y - tx / tl * hw]);
    }
    dc.fillStyle = col; dc.beginPath(); L.concat(Rt.reverse()).forEach((p, i) => (i ? dc.lineTo(p[0], p[1]) : dc.moveTo(p[0], p[1]))); dc.closePath(); dc.fill();
    dc.beginPath(); dc.arc(a[0] + (dx || 0), a[1], wa / 2, 0, TAU); dc.moveTo(b[0] + (dx || 0) + wb / 2, b[1]); dc.arc(b[0] + (dx || 0), b[1], wb / 2, 0, TAU); dc.fill();
  };
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, R.viewY * dpr);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // first its light about both arms and hands: their shapes, small, on a canvas of their own, only the soft blur of them
  // kept (thrown back from off the canvas as a shadow) and drawn up to size behind them, a faint glow rather than an edge;
  // then the arms and hands over it, so no edge shows across a wrist
  let gx = null;
  const GS = 0.25, gw = Math.ceil(W * GS) + 2, gh = Math.ceil(H * GS) + 2, OFF = gw + 40;
  if (g > 0.01) {
    if (!demonGlowCv) demonGlowCv = document.createElement('canvas');
    if (demonGlowCv.width < gw || demonGlowCv.height < gh) { demonGlowCv.width = Math.max(demonGlowCv.width, gw); demonGlowCv.height = Math.max(demonGlowCv.height, gh); }
    gx = demonGlowCv.getContext('2d');
    gx.setTransform(1, 0, 0, 1, 0, 0); gx.clearRect(0, 0, gw, gh);
    gx.setTransform(GS, 0, 0, GS, -OFF, 0); gx.shadowOffsetX = OFF; gx.shadowOffsetY = 0; gx.shadowBlur = 0.036 * H * GS; gx.shadowColor = rim;
    gx.lineCap = 'round'; gx.lineJoin = 'round';
  }
  for (const pass of gx ? [0, 1] : [1]) for (const s of [-1, 1]) {
    if (pass && gx && s < 0) {   // (the light, done: drawn up behind the arms)
      gx.shadowColor = 'rgba(0,0,0,0)'; gx.shadowOffsetX = 0;
      // (faint: a hint of light about them, no more)
      const a1 = ctx.globalAlpha; ctx.globalAlpha = a1 * 0.4 * g; ctx.drawImage(demonGlowCv, 0, 0, gw, gh, 0, 0, gw / GS, gh / GS); ctx.globalAlpha = a1;
    }
    const i = s > 0 ? 1 : 0, edge = s > 0 ? W : 0, X = u => edge - s * (u + squeeze);   // u: how far in from that edge
    // the shoulder where it is; lifted, the elbow out low beside it and the hand up beside its head; holding you, the elbow
    // well below the bottom of the view and out past its side, the wrist at the bottom edge in the corner and the hand
    // gripping that edge
    const S = scr(S0[i]);
    const E = mix2(mix2(scr(E0[i]), [cx + s * 0.64 * H, 0.82 * H], l), [X(-0.1 * W), 1.5 * H], w);
    const Wr = mix2(mix2(scr(H0[i]), [cx + s * 0.54 * H, 0.34 * H], l), [X(0.1 * W), 1.07 * H], w);
    const Cm = mix2(mix2(E, Wr, 0.5), [X(0.02 * W), 1.3 * H], w);
    if (pass) (h.wrists = h.wrists || [])[i] = [Wr[0] / W, Wr[1] / H];   // where its hands are in the view (for the tests)
    // nearer, it is bigger: an arm's own width at rest, a forearm's breadth lifted, and wider still holding you
    const wU = lerp(lerp(wid * k, 0.075 * H, l), 0.16 * H, w), wE = lerp(lerp(wid * k, 0.07 * H, l), 0.13 * W, w), wW = lerp(lerp(wid * k, 0.06 * H, l), 0.085 * W, w);
    const a0 = ctx.globalAlpha;
    if (pass === 0) {
      if (w > 0.01) { ctx.globalAlpha = a0 * 0.3 * w; limb(E, Cm, Wr, wE + 0.014 * W, wW + 0.014 * W, body); ctx.globalAlpha = a0; }   // soft at the edge: too near the eye to be sharp
      dc = gx; limb(E, Cm, Wr, wE, wW, '#fff', -s * 0.004 * W * w);   // its light about the forearm (a little more along the inside)
    } else { dc = ctx; limb(S, mix2(S, E, 0.5), E, wid * k, wU, body); limb(E, Cm, Wr, wE, wW, body); }
    // the hand: from the fingers hanging as draw() has them, to open and lifted with the fingers spread up and out, to
    // turned up and in at the corner of the view, the palm toward you and the fingers curled in over your shoulder
    const f0 = fing[i], rest = [Math.cos(f0.angle), -Math.sin(f0.angle)];
    const dir = unit(mix2(unit(mix2(rest, unit([s * 0.3, -1]), l)), unit([-s * 0.55, -1]), w)), out = turn(dir, s * Math.PI / 2);   // along the hand; across it, to the little finger
    const pl = lerp(0.07 * H * g, 0.12 * H, w), pw = lerp(0.075 * H * g, 0.13 * H, w), top = [Wr[0] + dir[0] * pl, Wr[1] + dir[1] * pl];
    const at = (p, u, v) => [p[0] + dir[0] * u + out[0] * v, p[1] + dir[1] * u + out[1] * v];
    const fl = lerp(lerp(f0.len * k, 0.15 * H, l), 0.2 * H, w), fw = lerp(lerp(0.018 * k, 0.026 * H, l), 0.042 * H, w);
    const sp = lerp(lerp(f0.spread, 0.24, l), 0.14, w), bend = lerp(0.1 * l, 0.95, w);   // how far the fingers fan, and curl
    const parts = [];   // [from, to, width] for each bone of the fingers and the thumb
    for (let j = 0; j < 4; j++) {   // the index finger nearest the thumb, the little finger outermost
      const L = fl * [0.9, 1, 0.95, 0.74][j], o = mix2(Wr, at(top, 0, pw * lerp(-0.36, 0.38, j / 3)), g), d1 = turn(dir, s * (j - 1.2) * sp), d2 = turn(d1, -s * bend);
      const m = [o[0] + d1[0] * L * 0.55, o[1] + d1[1] * L * 0.55];
      parts.push([o, m, fw], [m, [m[0] + d2[0] * L * 0.45, m[1] + d2[1] * L * 0.45], fw * 0.78]);
    }
    if (g > 0.01) {   // the thumb, from low on the inside of the palm, out and up (tucked in as it holds you)
      const o = at(Wr, pl * 0.25, -pw * 0.42), d1 = turn(dir, -s * lerp(0.95, 0.5, w)), d2 = turn(d1, s * 0.35), L = fl * 0.6 * g;
      const m = [o[0] + d1[0] * L * 0.5, o[1] + d1[1] * L * 0.5];
      parts.push([o, m, fw * 1.1], [m, [m[0] + d2[0] * L * 0.5, m[1] + d2[1] * L * 0.5], fw * 0.85]);
    }
    const palm = [at(Wr, 0, -pw * 0.32), at(Wr, 0, pw * 0.3), at(top, 0, pw * 0.5), at(top, pl * 0.08, 0), at(top, 0, -pw * 0.46)];
    const col = pass ? body : '#fff';   // its light about the hand, then the hand
    dc.strokeStyle = col; dc.fillStyle = col;
    if (g > 0.01) { dc.beginPath(); palm.forEach((p, n) => (n ? dc.lineTo(p[0], p[1]) : dc.moveTo(p[0], p[1]))); dc.closePath(); dc.fill(); }
    for (const [p, q, ww] of parts) { dc.lineWidth = ww; dc.beginPath(); dc.moveTo(p[0], p[1]); dc.lineTo(q[0], q[1]); dc.stroke(); }
    ctx.globalAlpha = a0;
  }
  ctx.restore();
}
// Enraged it comes on in fits, each beat (a third of a second) one of three: it stops dead, it steps, or it lurches (fast,
// pitching over to one side and dipping); each beat that it moves it may jerk aside to a new place; and its head, still a
// moment, snaps to a new angle, faster than its steps. All of it from c.t, so it is the same every time; it is scaled by how
// enraged it is (draw, speedMult, lateral). pace averages about 1, so in all it comes no faster than it walks.
function demonFit(c) {
  const h = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const t = c.t, B = 0.32, k = Math.floor(t / B), f = t - k * B, beat = h(k), b = beat < 0.34 ? 0 : beat < 0.66 ? 1 : 2;
  const snap = smoothstep(clamp(f / 0.06, 0, 1)), sideOf = j => (h(j + 0.31) < 0.34 ? 0 : h(j + 0.47) - 0.5) * 0.5;
  const bend = Math.sin(Math.PI * f / B);
  const H = 0.15, j = Math.floor(t / H), headOf = n => (h(n + 0.53) < 0.45 ? (h(n + 0.91) - 0.5) * 0.9 : 0);
  return {
    pace: [0.08, 1, 2.1][b],
    side: lerp(sideOf(k - 1), sideOf(k), snap),
    lean: b === 2 ? (h(k + 0.77) < 0.5 ? -1 : 1) * 0.13 * bend : 0,
    dip: b === 2 ? 0.08 * bend : 0,
    head: lerp(headOf(j - 1), headOf(j), smoothstep(clamp((t - j * H) / 0.035, 0, 1))),
  };
}
// ---------- out of the robe ----------
// In the meadow, as the music box starts (c.disrobe 0..1, set by the night), it takes the robe off: its hands go up to the
// hood and push it back, off its head (its happy face, all of it); it takes the robe at the
// shoulders and lets it go, and the robe drops to the ground, the long sleeves and the black gloves sliding off its arms
// with it; it hops out of the heap of black cloth and dances beside it. Under it: a yellow shirt striped sky blue, red
// shorts with a white stripe down each side, white socks, blue sneakers. Its arms and legs are long and thin, the colour of
// its face.
const DEMON_KIT = { shirt: [255, 204, 70], stripe: [84, 172, 236], shorts: [236, 84, 96], side: [255, 255, 255], sock: [250, 249, 244], cuff: [236, 84, 96], shoe: [64, 110, 222], sole: [250, 249, 244] };
const dspan = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
// how far each part of it has got: the hood pushed back, the sleeves sliding off, the robe falling, and slumping into a
// heap, the hop out of it
function demonOff(off) {
  return { hood: smoothstep(dspan(off, 0.16, 0.38)), slide: dspan(off, 0.5, 0.68), drop: dspan(off, 0.48, 0.68), slump: smoothstep(dspan(off, 0.62, 0.8)), hop: dspan(off, 0.72, 0.92) };
}
// where its elbows and hands are (|x| out from the middle, y from the shoulders) as it takes the robe off: up to the hood,
// pushing it back, down to the shoulders, out (and the robe drops), down at its sides as the sleeves slide off, out wide
// as it hops clear, and down again. The first is the arm as it was (rest)
const DEMON_OFF_ARMS = [[0, null], [0.12, [0.36, 0.02, 0.16, 0.3]], [0.22, [0.36, 0.06, 0.17, 0.36]], [0.36, [0.38, 0.12, 0.2, 0.44]], [0.46, [0.38, -0.2, 0.2, -0.02]],
  [0.52, [0.42, -0.18, 0.36, -0.1]], [0.66, [0.3, -0.42, 0.36, -0.78]], [0.76, [0.3, -0.45, 0.34, -0.84]], [0.84, [0.44, -0.08, 0.6, 0.14]], [1, [0.3, -0.44, 0.33, -0.82]]];
function demonOffArm(off, rest) {
  const K = DEMON_OFF_ARMS;
  let i = 0; while (i < K.length - 2 && off >= K[i + 1][0]) i++;
  const u = smoothstep(dspan(off, K[i][0], K[i + 1][0])), a = K[i][1] || rest, b = K[i + 1][1];
  return a.map((v, j) => lerp(v, b[j], u));
}
// a point part way along the polyline pts (u 0..1 by length)
function demonAlong(pts, u) {
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let r = clamp(u, 0, 1) * tot;
  for (let i = 0; i < L.length; i++) { if (r <= L[i] || i === L.length - 1) { const k = L[i] ? clamp(r / L[i], 0, 1) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } r -= L[i]; }
  return pts[pts.length - 1].slice();
}
// the part of the polyline pts from u0 to u1
function demonPart(pts, u0, u1) {
  const out = [demonAlong(pts, u0)], L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[L.length - 1] || 1;
  for (let i = 1; i < pts.length - 1; i++) if (L[i] / tot > u0 && L[i] / tot < u1) out.push(pts[i]);
  out.push(demonAlong(pts, u1));
  return out;
}
// the robe falling (drop 0..1: from on its shoulders to a heap on the ground) and slumping (slump: a heap, a little to its
// right of where it stood, a sleeve lying out and the hood in a fold at the back). In the frame of its feet
function demonRobeDown(ctx, P, K, top, legL, hemW0, g, drop, slump, cover) {
  const f = drop * drop, yT = lerp(top, 0.3, f) - 0.04 * slump, cx = -0.2 * slump;
  const tw = lerp(0.24, 0.3, drop), hw = lerp(hemW0, 0.4, drop) - 0.04 * slump, step = Math.sin(g) * 0.05 * (1 - drop), bump = Math.max(drop, slump);
  if (slump > 0.01) {   // the hood, in a round fold at the back of the heap, and a sleeve lying out on the grass
    ctx.save(); ctx.translate(cx + tw * 0.35, yT - 0.03); ctx.scale(1, slump);
    ctx.fillStyle = K.robe; ctx.beginPath(); ctx.moveTo(-0.15, 0); ctx.bezierCurveTo(-0.15, 0.11, -0.08, 0.17, 0, 0.17); ctx.bezierCurveTo(0.08, 0.17, 0.15, 0.11, 0.15, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = K.rim; ctx.lineWidth = 0.014; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-0.12, 0.06); ctx.quadraticCurveTo(-0.08, 0.12, 0.02, 0.13); ctx.stroke();
    ctx.restore();
    const sx = cx - tw * 0.7, ex = sx - 0.24 * slump;
    P_line(ctx, sx, 0.1, ex, 0.045, 0.085, K.robe);
    P_ell(ctx, ex - 0.01, 0.045, 0.02, 0.04 * slump, K.fold, -0.2);
  }
  ctx.fillStyle = K.robe; ctx.beginPath();
  ctx.moveTo(cx - tw, yT);
  ctx.quadraticCurveTo(cx - lerp(0.27, hw * 1.05, drop), lerp(legL * 0.55, yT * 0.4, drop), cx - hw + step, 0.03);
  for (let i = 1; i <= 8; i++) { const u = i / 8; ctx.lineTo(cx + lerp(-hw, hw, u) + step * (1 - Math.abs(u - 0.5)), 0.012 + 0.022 * Math.abs(Math.sin(i * 1.9 + g)) - 0.04 * cover); }   // (low enough, while its feet are behind it, to hide them)
  ctx.quadraticCurveTo(cx + lerp(0.27, hw * 1.05, drop), lerp(legL * 0.55, yT * 0.4, drop), cx + tw, yT);
  // the top: straight across under the shoulders, and then the lumpy top of a heap of cloth
  ctx.bezierCurveTo(cx + tw * 0.6, yT + 0.07 * bump, cx + tw * 0.2, yT - 0.02 * bump, cx, yT + 0.03 * bump);
  ctx.bezierCurveTo(cx - tw * 0.3, yT + 0.08 * bump, cx - tw * 0.7, yT - 0.01 * bump, cx - tw, yT);
  ctx.closePath(); ctx.fill();
  ctx.lineCap = 'round';
  for (const [x0, x1, w] of [[-0.1, -0.2, 0.026], [0.02, 0.05, 0.03], [0.12, 0.24, 0.022]]) {
    ctx.strokeStyle = K.fold; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(cx + x0 * lerp(0.6, 1.3, drop), yT - lerp(0.18, 0.05, drop)); ctx.quadraticCurveTo(cx + x0 * lerp(1, 1.6, drop), lerp(legL * 0.6, yT * 0.5, drop), cx + x1 * lerp(1, 1.5, drop) + step * 0.8, 0.06); ctx.stroke();
  }
  if (drop < 1) P_ell(ctx, cx, yT - 0.03, 0.26, 0.085 * (1 - drop), K.robe);   // its shoulders, as they were, going with it
  if (bump > 0.05) {   // its light along the top of the heap
    ctx.globalAlpha *= bump; ctx.strokeStyle = K.rim; ctx.lineWidth = 0.016;
    ctx.beginPath(); ctx.moveTo(cx + tw * 0.9, yT + 0.01); ctx.bezierCurveTo(cx + tw * 0.6, yT + 0.07 * bump, cx + tw * 0.2, yT - 0.02 * bump, cx, yT + 0.03 * bump); ctx.stroke();
  }
}
// its legs (in socks and sneakers), its shorts and its striped shirt, in the frame of its body (feet at 0, shoulders at
// top). up: how far each leg lifts (a kick in the dance, both tucked in the hop)
function demonKit(ctx, c, P, skin, top, sh, up) {
  const kit = k => P.col(DEMON_KIT[k]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of [-1, 1]) {
    const u = up[s > 0 ? 1 : 0], hip = [s * 0.095, top - 0.86], ank = [s * (0.11 + 0.06 * u), 0.11 + 0.36 * u], knee = [s * (0.13 + 0.17 * u), lerp(hip[1], ank[1], 0.5) + 0.14 * u];
    P_limb(ctx, [hip, knee, ank], 0.082, skin);
    const d = [knee[0] - ank[0], knee[1] - ank[1]], dl = Math.hypot(d[0], d[1]) || 1, at = k => [ank[0] + d[0] / dl * k, ank[1] + d[1] / dl * k];
    const band = (u0, u1, col) => { const p0 = at(u0), p1 = at(u1); ctx.strokeStyle = col; ctx.lineWidth = 0.09; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); };
    band(0, 0.16, kit('sock')); band(0.11, 0.145, kit('cuff'));   // a white sock, a red stripe round its top
    const rot = s * (0.1 + 0.5 * u);
    P_ell(ctx, ank[0] + s * 0.045, ank[1] - 0.06, 0.1, 0.05, kit('sole'), rot);
    P_ell(ctx, ank[0] + s * 0.04, ank[1] - 0.045, 0.092, 0.05, kit('shoe'), rot);
    P_ell(ctx, ank[0] + s * 0.085, ank[1] - 0.05, 0.03, 0.025, kit('sole'), rot);   // a white toe cap
  }
  // the shorts: a waistband under the shirt, and a leg each side
  const w = top - 0.62, b = top - 0.98;
  P_poly(ctx, [[-0.19, w], [0.19, w], [0.215, b], [0.02, b], [0, b + 0.1], [-0.02, b], [-0.215, b]], kit('shorts'));
  for (const s of [-1, 1]) P_line(ctx, s * 0.192, top - 0.7, s * 0.207, b + 0.02, 0.022, kit('side'));
  // the neck, then the shirt over it, striped
  P_line(ctx, sh, top + 0.14, sh, top, 0.075, skin);
  const shirt = () => {
    ctx.beginPath(); ctx.moveTo(-0.205, top - 0.01); ctx.quadraticCurveTo(-0.15, top + 0.04, sh - 0.06, top + 0.055); ctx.quadraticCurveTo(sh, top - 0.01, sh + 0.06, top + 0.055); ctx.quadraticCurveTo(0.15, top + 0.04, 0.205, top - 0.01);
    ctx.quadraticCurveTo(0.22, top - 0.3, 0.2, top - 0.7); ctx.lineTo(-0.2, top - 0.7); ctx.quadraticCurveTo(-0.22, top - 0.3, -0.205, top - 0.01); ctx.closePath();
  };
  for (const s of [-1, 1]) P_ell(ctx, s * 0.175 + sh * 0.5, top - 0.03, 0.06, 0.05, kit('shirt'));
  shirt(); ctx.fillStyle = kit('shirt'); ctx.fill();
  ctx.save(); shirt(); ctx.clip();
  ctx.fillStyle = kit('stripe');
  for (let y = top - 0.66; y < top; y += 0.11) ctx.fillRect(-0.3, y, 0.6, 0.05);
  ctx.restore();
}
// an arm out of the robe (or still in it): the skin, the shirt's short sleeve, the robe's long sleeve as far down the arm as
// it has slid (slide 0: where it always was), the black glove going with it, and a hand: a round palm and four short
// fingers. S, E, Hn: shoulder, elbow, hand; fa the way the fingers point
function demonOffArm2(ctx, c, P, K, skin, S, E, Hn, fa, slide) {
  const cuffU = 0.72, arm = [S, E, Hn], len = Math.hypot(E[0] - S[0], E[1] - S[1]) + Math.hypot(Hn[0] - E[0], Hn[1] - E[1]);
  const cuffAt = (Math.hypot(E[0] - S[0], E[1] - S[1]) + cuffU * Math.hypot(Hn[0] - E[0], Hn[1] - E[1])) / (len || 1);   // the cuff, by length
  const gk = dspan(slide, 0.45, 0.8);   // the glove off
  P_limb(ctx, demonPart(arm, 0, cuffAt), 0.066, skin);
  P_limb(ctx, demonPart(arm, cuffAt - 0.02, 1), lerp(0.04, 0.064, gk), K.mix(gk));   // (the forearm, gloved and then bare)
  const d = [E[0] - S[0], E[1] - S[1]], dl = Math.hypot(d[0], d[1]) || 1, sl = k => [S[0] + d[0] / dl * k, S[1] + d[1] / dl * k];
  P_line(ctx, S[0], S[1], ...sl(0.13), 0.096, P.col(DEMON_KIT.shirt));
  const b0 = sl(0.1), b1 = sl(0.135);   // a stripe round the end of the sleeve
  ctx.strokeStyle = P.col(DEMON_KIT.stripe); ctx.lineWidth = 0.098; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(b0[0], b0[1]); ctx.lineTo(b1[0], b1[1]); ctx.stroke();
  const hand = K.mix(gk), hl = lerp(0.18, 0.065, gk), hw = lerp(0.018, 0.024, gk);
  if (gk > 0.02) P_ell(ctx, Hn[0], Hn[1], 0.04 * gk, 0.04 * gk, hand);
  fingers(ctx, Hn[0], Hn[1], fa, lerp(0.16, 0.36, gk), hl, hw, hand);
  // the long sleeve, sliding down the arm and off the hand
  const u0 = slide, u1 = Math.min(1, cuffAt + slide * 1.2), sw = 0.1 * (1 - dspan(u0, 0.75, 1));
  if (sw > 0.004 && u1 > u0 + 0.01) {
    const seg = demonPart(arm, u0, u1), end = seg[seg.length - 1], prev = seg[seg.length - 2];
    P_limb(ctx, seg, sw, K.robe);
    P_ell(ctx, end[0], end[1], sw * 0.62, sw * 0.5, K.fold, Math.atan2(end[1] - prev[1], end[0] - prev[0]));
  }
}
// the top of the hood, from one side of the head (-hr, hc + 0.02) over to the other: a round dome, hh high, with no point
const DEMON_K = 0.5523;   // (a cubic's handles for a quarter of an ellipse)
function demonDome(ctx, hc, hr, hh) {
  const y0 = hc + 0.02, y1 = y0 + hh;
  ctx.bezierCurveTo(-hr, y0 + DEMON_K * hh, -DEMON_K * hr, y1, 0, y1);
  ctx.bezierCurveTo(DEMON_K * hr, y1, hr, y0 + DEMON_K * hh, hr, y0);
}
// its head as the hood goes back (hood 0..1): the hood behind it, in the head's frame (drawn before the robe and its arms);
// and drop, the robe falling, takes the hood down with it (dy, how far its top has fallen)
function demonHoodBack(ctx, c, P, K, a, hood, drop, dy) {
  const hc = 0.3 + a * 0.1, hr = 0.168 + a * 0.02, hh = 0.235 + a * 0.05, fy = 0.285 + a * 0.1;
  const sy = (1 - 0.5 * hood) * (1 - dspan(drop, 0, 0.35));
  if (sy < 0.01) return;
  ctx.save(); ctx.translate(0, -0.16 * hood - dy); ctx.scale(1 + 0.12 * hood, sy);
  ctx.fillStyle = K.robe; ctx.beginPath();
  ctx.moveTo(-0.25, -0.05);
  ctx.quadraticCurveTo(-hr * 1.2, hc - 0.08, -hr, hc + 0.02);
  demonDome(ctx, hc, hr, hh);
  ctx.quadraticCurveTo(hr * 1.2, hc - 0.08, 0.25, -0.05);
  ctx.closePath(); ctx.fill();
  const inside = 1 - smoothstep(clamp(hood * 2.2, 0, 1));   // the dark in it, gone as it turns away
  if (inside > 0.01) {
    const oy = fy - 0.015 - a * 0.015, orx = 0.098 + a * 0.012, ory = 0.152 + a * 0.04;
    ctx.globalAlpha *= inside;
    P_ell(ctx, 0, oy, orx + 0.014, ory + 0.014, K.rim);
    P_ell(ctx, 0, oy, orx, ory, K.black);
  }
  ctx.restore();
}
// fading (c.fade), it is drawn whole on a layer of its own and the layer fades, so it goes as one thing: no overlap of its
// limbs, clothes or the folds of the robe on the grass showing through as it goes
const demonLayer = { cv: null, busy: false };
function demonFaded(ctx, c, P) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  if (!demonLayer.cv) demonLayer.cv = document.createElement('canvas');
  const L = demonLayer.cv; if (L.width !== W || L.height !== H) { L.width = W; L.height = H; }
  const lc = L.getContext('2d');
  lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, W, H); lc.globalAlpha = 1; lc.setTransform(ctx.getTransform());
  demonLayer.busy = true;
  try { CREATURES.demon.draw(lc, c, P); } finally { demonLayer.busy = false; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= Math.max(0, c.fade); ctx.drawImage(L, 0, 0); ctx.restore();
}
// how enraged it is, as it looks (rage, less any calm)
const demonRage = c => clamp(c.rage || 0, 0, 1) * (1 - (c.calm || 0));
// how high its eyes are, from its feet, as draw() puts them (the robe, the bob of its step, the hood all grow with rage; a
// lurch dips it; bent down to you, c.stoop, they are that much lower)
function demonEyesY(c) {
  const calm = c.calm || 0, a = demonRage(c), dip = a > 0.001 ? demonFit(c).dip * a : 0;
  const top = 1.3 + a * 0.35 + 0.85 + Math.abs(Math.sin(c.gait)) * (0.04 + a * 0.06) - dip - (c.stoop || 0);
  return (top + 0.285 + a * 0.1 + 0.03) * (1 - 0.2 * calm);
}
// How far it bends down to you (c.stoop) so that its face stays in the view as it comes close: looked at straight ahead
// from eyeH (the view is 62 degrees high: js/render.js VFOV), its eyes at the top of its step are no more than STOOP_UP of
// the way from the middle of the view up to its top, whatever its rage (so the top of its hood is in the view too, with
// room to spare). sunk: how far down it is already (c.yOff, below 0: the night's own bend, empty-handed, over the last few
// metres). Far off it stands straight; it only bends as close as it must, and the closer, the further.
const STOOP_UP = 0.4;
function demonStoop(c, eyeH, sunk) {
  const calm = c.calm || 0, a = demonRage(c), ks = 1 - 0.2 * calm;
  const eyes = (1.3 + a * 0.35 + 0.85 + 0.04 + a * 0.06 + 0.285 + a * 0.1 + 0.03) * ks;   // (unbent, at the top of its step)
  const want = eyeH + Math.tan(31 * DEG) * STOOP_UP * Math.max(0.3, c.dist);
  return Math.max(0, eyes + (sunk || 0) - want) / ks;
}
// crying (c.sob), its shoulders heave: in fits, a few quick catches and then a breath (none with reduced motion)
function demonHeave(c) {
  const s = c.still ? 0 : c.sob || 0;
  return s > 0.001 ? s * 0.022 * Math.max(0, Math.sin(c.t * 7.3)) * smoothstep(clamp(Math.sin(c.t * 1.05 + 0.6) * 1.6, 0, 1)) : 0;
}
// how its head is tilted when it is making no face for the ending: now and then it cocks its head to the other side, more
// often and further enraged, and enraged it twitches
function demonTilt(c) {
  const a = demonRage(c), still = SAVE.data.settings.reducedMotion;
  return headTiltJerk(c.t, 2.7 - a * 1.5, 0.16 + a * 0.3) + (a > 0.001 && !still ? demonFit(c).head * a : 0);
}
// Enraged, once the death lunge has brought its face up into yours, its head will not keep still: it snaps from one angle
// to another and holds there a moment, jumps a little up or aside, and every so often shudders, fast and hard. Two runs of
// snaps at different beats, so they never fall into a rhythm, and the shudders in bursts between them. All of it from c.t,
// so it is the same every time; k is how much (0: none). Returns the head's added tilt and its jump [x, y]
function demonSeize(c, k) {
  if (k < 0.001) return { tilt: 0, x: 0, y: 0 };
  const h = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }, t = c.t;
  // a value that holds and then snaps to the next in a hundredth of a second or two, every P seconds (o: which run)
  const snaps = (P, o) => { const j = Math.floor(t / P), u = smoothstep(clamp((t - j * P) / 0.016, 0, 1)), v = n => h(n * 1.37 + o) - 0.5; return [lerp(v(j - 1), v(j), u), lerp(h(j * 0.7 + o + 0.3) - 0.5, h((j + 1) * 0.7 + o + 0.3) - 0.5, u)]; };
  const A = snaps(0.093, 0.11), B = snaps(0.157, 0.53);
  const burst = h(Math.floor(t / 0.26) + 0.81) < 0.45 ? 1 : 0, shud = burst * Math.sin(t * 97) * Math.sin(t * 61 + 1);
  return {
    tilt: k * (A[0] * 0.7 + B[0] * 0.38 + shud * 0.09),
    x: k * (B[1] * 0.07 + shud * 0.014),
    y: k * (Math.max(0, A[1]) * 0.07 - Math.max(0, -B[1]) * 0.03),
  };
}
CREATURES.demon = {
  name: 'the demon', h: 2.6, w: 1.6, faceY: 2.35, stepRate: 0.55, catchDist: 1.2, sound: 'walker',
  // the lunge brings faceY to eye level; enraged, it is taller and its face sits higher than that, so the pose lifts it the
  // rest of the way and the last thing you see is its face, not its chest
  // (and from where it was when it reached you, bent down to you, c.bend0: the night's c.yOff then; the lunge's own lift
  // starts from 0, which would put it back up, its face over the top of the view, for the moment before it comes)
  death: {
    delay: 0.25, dur: 0.5, sting: 'sting',
    pose(c, k) { const K = smoothstep(k); c.yOff += (c.bend0 || 0) * (1 - K) - (demonEyesY(c) - CREATURES.demon.faceY) * K; },
  },
  voice: { kind: 'exhale', every: [4, 8] },
  eyesY: demonEyesY, stoopFor: demonStoop, tilt: demonTilt, fit: demonFit, seize: demonSeize, moods: DEMON_MOODS.length, moodNames: DEMON_MOOD_NAMES, moodAt: demonMoodAt, mood: demonMood, ending: demonEnding, heave: demonHeave, scareAt: demonScareAt, scareDraw: demonScareDraw, vignette: demonVignette,   // for the ending and the tests
  // what of its box is it, to aim at (js/game.js creatureBox: the bow's draw bar on night 13): the robe and the hood, up to just above
  // its eyes, wider enraged
  body(c) { const a = demonRage(c); return [-0.42 - a * 0.08, 0.42 + a * 0.08, 0, demonEyesY(c) + 0.3]; },
  init(c) { c.anger = 0; c.rage = 0; c.calm = 0; c.soft = 0; c.dance = 0; c.disrobe = 0; c.fade = 1; c.stoop = 0; c.bend0 = 0; },
  // enraged, it comes in fits: stopping dead, stepping, lurching
  speedMult(c, dt, seen) { const a = demonRage(c); return (1 + 0.45 * (c.anger || 0)) * (a > 0.001 ? lerp(1, demonFit(c).pace, a) : 1); },
  // and jerks aside (less as it comes up to you)
  lateral(c) { const a = demonRage(c); return a > 0.001 && !c.frozen ? demonFit(c).side * a * clamp((c.dist - 1.5) / 2.5, 0, 1) : 0; },
  draw(ctx, c, P) {
    if (c.fade < 1 && !demonLayer.busy && typeof document !== 'undefined') { if (c.fade > 0) demonFaded(ctx, c, P); return; }
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 14, 0, 1), lunge = c.lunge || 0;
    const calm = c.calm || 0, soft = c.soft || 0, dance = c.dance || 0;
    const a = demonRage(c), still = SAVE.data.settings.reducedMotion;
    const fit = a > 0.001 ? demonFit(c) : null;
    ctx.save();
    if (c.fade < 1 && !demonLayer.busy) ctx.globalAlpha *= Math.max(0, c.fade);   // (with no page to draw a layer on)
    // enraged it shakes, pitches over as it lurches and dips; happy it shrinks to fit a bedroom; dancing it hops and swings
    const hop = dance * Math.abs(Math.sin(t * 5.2)) * 0.14, swing = dance * Math.sin(t * 5.2) * 0.1, shake = a * Math.sin(t * 47) * 0.014;
    const lean = fit && !still ? fit.lean * a : 0, dip = fit ? fit.dip * a : 0;
    // out of the robe (c.disrobe), it hops clear of the heap of it: the heap stays where it fell (Mo, its feet's frame)
    const off = clamp(c.disrobe || 0, 0, 1), O = off > 0 ? demonOff(off) : null, ks = 1 - 0.2 * calm;
    let Mo = null;
    if (O) { ctx.save(); ctx.scale(ks, ks); Mo = ctx.getTransform(); ctx.restore(); }
    const stepX = O ? 0.3 * smoothstep(O.hop) * ks : 0, stepUp = O ? Math.sin(Math.PI * O.hop) * 0.3 * ks : 0;
    ctx.translate(shake + stepX, hop - dip + stepUp); ctx.rotate(swing + lean); ctx.scale(ks, ks);
    // all of it black: the robe, a shade lighter at the edge of the hood where it catches what light there is, and blacker in
    // its folds; the dark in the hood blackest of all. As the light comes, it lightens with the dark
    // (taking only a little of the light it stands in, so its own red light does not make it red)
    const take = lerp(0.3, 1, soft), robeC = mixc([12, 10, 15], [34, 31, 40], soft);
    const robe = P.col(robeC, take), fold = P.col(mixc([3, 2, 5], [14, 12, 18], soft), take), rim = P.col(mixc([26, 23, 32], [62, 58, 72], soft), take * 1.6);
    const black = P.col([0, 0, 0], 0.1);
    const bob = Math.abs(Math.sin(g)) * (0.04 + a * 0.06), sway = Math.sin(g) * (0.03 + a * 0.05);
    // crying (c.sob), its shoulders heave, in fits
    const heave = demonHeave(c);
    // bent down to you (c.stoop): its shoulders and head lower, the robe under them shorter, and its back hunched up over its
    // shoulders (hk)
    const stoop = c.stoop || 0, hk = clamp(stoop / 0.9, 0, 1);
    const legL = 1.3 + a * 0.35, armL = 0.9 + a * 0.6, top = legL + 0.85 + bob + heave - stoop;
    // the robe, from the shoulders to the ground, flaring; its hem swings with each step and the folds with it
    const step = Math.sin(g) * (0.05 + a * 0.04), hemW = 0.36 + a * 0.1, sh = sway * 0.6;
    const sideX = 0.27, sideY = legL * 0.55;
    if (O) {
      // out of the robe, or on the way out of it: the heap (once it is clear of it), its legs, shorts and shirt, the hood
      // going back, the robe falling, its arms, and its face
      const F = demonMood(c.mood !== undefined && c.mood !== null ? c.mood : DEMON_MOODS.length - 1, c.still), skin = P.col(F.skin);
      const K = { robe, fold, rim, black, mix: k => P.col(mixc(robeC, F.skin, k), lerp(take, 1, k)) };
      const fall = top - lerp(top, 0.24, O.drop * O.drop);   // how far the top of the robe has fallen
      const robeDown = () => { ctx.save(); ctx.setTransform(Mo); demonRobeDown(ctx, P, K, top, legL, hemW, g, O.drop, O.slump, O.hop < 0.5 ? dspan(off, 0, 0.04) : 0); ctx.restore(); };
      if (O.hop >= 0.5) robeDown();   // (behind it, once its feet are up over the heap)
      const kick = dance * Math.sin(t * 5.2), tuck = Math.sin(Math.PI * O.hop) * 0.55;   // one leg and then the other kicks up; both tuck in the hop
      demonKit(ctx, c, P, skin, top, sh, [Math.max(0, -kick) + tuck, Math.max(0, kick) + tuck]);
      const tilt = lerp(c.tilt0 || 0, F.tilt + (c.still ? 0 : F.trem * Math.sin(t * 31) * 0.018), c.settle === undefined ? 1 : c.settle) + dance * Math.sin(t * 2.6) * 0.18;
      const head = fn => { ctx.save(); ctx.translate(sh, top); ctx.rotate(tilt); fn(); ctx.restore(); };
      head(() => demonHoodBack(ctx, c, P, K, a, O.hood, O.drop, fall));
      if (O.hop < 0.5) robeDown();
      const raise = smoothstep(near * (0.5 + a * 0.5));
      for (const s of [-1, 1]) {
        const rest = [lerp(0.28, 0.55 + a * 0.3, raise), lerp(-0.5, -0.3, raise), lerp(0.3, 0.42 + a * 0.35, raise), lerp(-armL, 0.05, raise)];
        const q = demonOffArm(off, rest);
        let ex = s * q[0], ey = top + q[1], hx = s * q[2], hy = top + q[3];
        if (dance) { const wave = Math.sin(t * 5.2 + s) * 0.12; ex = lerp(ex, s * 0.42, dance); ey = lerp(ey, top + 0.2 + wave, dance); hx = lerp(hx, s * (0.36 + wave), dance); hy = lerp(hy, top + 0.62, dance); }   // hands up, waving
        const fa0 = lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise), fa = lerp(fa0, Math.atan2(hy - ey, hx - ex), dspan(off, 0, 0.1));
        demonOffArm2(ctx, c, P, K, skin, [s * 0.22 + sh, top - 0.05], [ex, ey], [hx, hy], fa, O.slide);
      }
      // its face: as it was in the hood, and then all of it as the hood goes back, the hood's shadow going from its brow
      head(() => {
        const fy = 0.285 + a * 0.1, oy = fy - 0.015 - a * 0.015, orx = lerp(0.098 + a * 0.012, 0.3, O.hood), ory = lerp(0.152 + a * 0.04, 0.4, O.hood);
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, oy, orx, ory, 0, 0, TAU); ctx.clip();
        demonMoodFace(ctx, c, P, fy, F);
        if (O.hood < 0.99) {
          ctx.globalAlpha *= 1 - O.hood;
          const shade = ctx.createLinearGradient(0, oy + ory, 0, fy + 0.02);
          shade.addColorStop(0, P.cola([0, 0, 0], 0.85)); shade.addColorStop(0.45, P.cola([0, 0, 0], 0.3)); shade.addColorStop(1, P.cola([0, 0, 0], 0));
          ctx.beginPath(); ctx.ellipse(0, fy - 0.03 * F.jaw, 0.085 + F.fw, 0.13 + 0.045 * F.jaw, 0, 0, TAU); ctx.clip();
          ctx.fillStyle = shade; ctx.fillRect(-orx, fy + 0.02, orx * 2, ory * 2);
        }
        ctx.restore();
      });
      ctx.restore();
      return;
    }
    ctx.fillStyle = robe; ctx.beginPath();
    ctx.moveTo(-0.24 + sh, top);
    ctx.quadraticCurveTo(-sideX + sway * 0.4, sideY, -hemW + step, 0.03);
    for (let i = 1; i <= 8; i++) { const u = i / 8; ctx.lineTo(lerp(-hemW, hemW, u) + step * (1 - Math.abs(u - 0.5)), 0.012 + 0.022 * Math.abs(Math.sin(i * 1.9 + g))); }
    ctx.quadraticCurveTo(sideX + sway * 0.4, sideY, 0.24 + sh, top);
    ctx.closePath(); ctx.fill();
    for (const [x0, x1, w] of [[-0.1, -0.2, 0.026], [0.02, 0.05, 0.03], [0.12, 0.24, 0.022]]) {
      ctx.strokeStyle = fold; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0 * 0.6 + sh, top - 0.18); ctx.quadraticCurveTo(x0 + sway * 0.4, legL * 0.6, x1 + step * 0.8, 0.06); ctx.stroke();
    }
    // its shoulders under the fall of the hood
    P_ell(ctx, sh, top - 0.03 + 0.03 * hk, 0.26 + 0.04 * hk, 0.085 + 0.07 * hk, robe);
    // the arms in their long sleeves; enraged they are longer, and the hands, long-fingered and black, hang lower
    const raise = smoothstep(Math.max(near * (0.5 + a * 0.5), lunge));
    const sleeve = 0.1 - a * 0.012;
    const hug = c.hug ? { S: [], E: [], H: [], f: [] } : null;   // holding you: the arms are drawn last, over the head (see demonHugArms)
    for (const s of [-1, 1]) {
      const sx = s * 0.22 + sh, sy = top - 0.05;
      let ex = s * lerp(0.28, 0.55 + a * 0.3, raise), ey = lerp(top - 0.5, top - 0.3, raise);
      let hx = s * lerp(0.3, 0.42 + a * 0.35, raise), hy = lerp(top - armL, top + 0.05, raise);
      if (dance) { const wave = Math.sin(t * 5.2 + s) * 0.12; ex = lerp(ex, s * 0.42, dance); ey = lerp(ey, top + 0.2 + wave, dance); hx = lerp(hx, s * (0.36 + wave), dance); hy = lerp(hy, top + 0.62, dance); } // hands up, waving
      let fa = dance ? Math.PI / 2 : lerp(-Math.PI / 2, s > 0 ? Math.PI * 0.35 : Math.PI * 0.65, raise);
      const fs = lerp(0.16, 0.34 + a * 0.1, raise), fl = 0.18 + a * 0.16;
      if (hug) { const i = s > 0 ? 1 : 0; hug.S[i] = [sx, sy, 0]; hug.E[i] = [ex, ey, 0]; hug.H[i] = [hx, hy, 0]; hug.f[i] = { angle: fa, spread: fs, len: fl }; continue; }
      const cuff = [lerp(ex, hx, 0.72), lerp(ey, hy, 0.72)];
      P_line(ctx, cuff[0], cuff[1], hx, hy, 0.04, robe);   // the wrist, out of the sleeve
      fingers(ctx, hx, hy, fa, fs, fl, 0.018, robe);
      P_limb(ctx, [[sx, sy], [ex, ey], cuff], sleeve, robe);
      P_ell(ctx, cuff[0], cuff[1], sleeve * 0.62, sleeve * 0.5, fold, Math.atan2(hy - ey, hx - ex));   // the dark in the sleeve's mouth
    }
    // the head, in its hood. Making a face for the ending (c.mood), its head comes level from where it was and leans as the
    // face does
    const F = c.mood !== undefined && c.mood !== null ? demonMood(c.mood, c.still) : null;
    // (enraged, once the lunge has come up into your face, it seizes: demonSeize; and so, a little, as its head is thrown
    // back at the end, c.jolt)
    const sz = demonSeize(c, F ? (c.still ? 0 : 0.4 * (c.jolt || 0)) : still || c.still ? 0 : a * smoothstep(dspan(lunge, 0.55, 0.9)));
    const tilt = F ? lerp(c.tilt0 || 0, F.tilt + (c.still ? 0 : F.trem * Math.sin(t * 31) * 0.018), c.settle === undefined ? 1 : c.settle) + dance * Math.sin(t * 2.6) * 0.18
      : demonTilt(c) * (1 - lunge) * (1 - calm) + dance * Math.sin(t * 2.6) * 0.18 + sz.tilt;
    // (bowed, c.nod 1, its head is lower and further forward, the opening of the hood lower and narrower and its face low in
    // it, in the shadow of the hood; thrown back, -1, it is higher, the opening wider and its face up out of the shadow)
    const nod = F ? clamp(c.nod || 0, -1, 1) : 0, dn = Math.max(0, nod), bk = Math.max(0, -nod);
    ctx.save(); ctx.translate(sh + sz.x, top + sz.y - 0.06 * dn + 0.04 * bk); ctx.rotate(tilt + heave * 0.6 * Math.sin(t * 9.1));
    const hc = 0.3 + a * 0.1, hr = 0.168 + a * 0.02, hh = 0.235 + a * 0.05;
    // enraged, in your face, the hood falls: it slides down off the head onto the shoulders and is gone into the dark
    const drop = F ? 0 : a * smoothstep(dspan(lunge, 0.45, 0.8));
    ctx.save(); ctx.translate(0, -drop * 0.55); ctx.globalAlpha *= 1 - drop * 0.85;
    ctx.fillStyle = robe; ctx.beginPath();
    ctx.moveTo(-0.25, -0.05);
    ctx.quadraticCurveTo(-hr * 1.2, hc - 0.08, -hr, hc + 0.02);
    demonDome(ctx, hc, hr, hh);   // the top of the hood, round
    ctx.quadraticCurveTo(hr * 1.2, hc - 0.08, 0.25, -0.05);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // the opening of the hood, and the dark in it
    const lk = a * smoothstep(dspan(lunge, 0.25, 0.85));   // enraged and in your face: the opening stretches down with the jaw
    const lk3 = F ? 0 : a * smoothstep(dspan(lunge, 0.62, 0.95));   // and at the last: it shatters
    const go = F ? clamp(c.gulp || 0, 0, 1) : 0;   // (and the opening of its hood wider for a moment, taking something in)
    const fy = 0.285 + a * 0.1, oy = fy - 0.015 - a * 0.015 - lk * 0.05 - 0.006 * go - 0.045 * dn + 0.02 * bk;
    const orx = (0.098 + a * 0.012 + lk * 0.03 + 0.03 * go) * (1 + 0.06 * bk), ory = (0.152 + a * 0.04 + lk * 0.075 + 0.02 * go) * (1 - 0.14 * dn) * (1 + 0.1 * bk);
    // the face, all of it, as one piece: drawn once, or (shattering, in the lunge) once into each shard
    const drawFace = () => {
      if (drop < 0.99) { ctx.save(); ctx.globalAlpha *= 1 - drop; P_ell(ctx, 0, oy, orx + 0.014, ory + 0.014, rim); ctx.restore(); }
      P_ell(ctx, 0, oy, orx, ory, black);
      // the face it makes for the ending comes up out of the dark of the hood (c.unveil), and the hood's shadow lies over its brow
      const show = F ? (c.unveil === undefined ? 1 : clamp(c.unveil, 0, 1)) : 0;
      if (F && show > 0.004) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, oy, orx, ory, 0, 0, TAU); ctx.clip();
        ctx.globalAlpha *= show;
        // (bowed or thrown back, the face is lower or higher in the opening, and seen foreshortened)
        if (nod) { ctx.save(); ctx.translate(0, fy - 0.075 * dn + 0.03 * bk); ctx.scale(1, 1 - 0.3 * dn - 0.1 * bk); ctx.translate(0, -fy); }
        demonMoodFace(ctx, c, P, fy, F);
        if (nod) ctx.restore();
        const sy0 = fy + 0.02, shade = ctx.createLinearGradient(0, oy + ory, 0, sy0), sa = 1 - 0.8 * bk;
        shade.addColorStop(0, P.cola([0, 0, 0], 0.85 * sa)); shade.addColorStop(0.45, P.cola([0, 0, 0], 0.3 * sa)); shade.addColorStop(1, P.cola([0, 0, 0], 0));
        ctx.fillStyle = shade; ctx.fillRect(-orx, sy0, orx * 2, ory * 2);
        if (dn > 0.004) {   // bowed: the hood's shadow down over all of it but the mouth and chin
          const low = ctx.createLinearGradient(0, oy + ory, 0, oy - ory);
          low.addColorStop(0, P.cola([0, 0, 0], dn)); low.addColorStop(0.5, P.cola([0, 0, 0], 0.92 * dn)); low.addColorStop(1, P.cola([0, 0, 0], 0.45 * dn));
          ctx.fillStyle = low; ctx.fillRect(-orx, oy - ory, orx * 2, ory * 2);
        }
        ctx.restore();
      }
      if (show < 0.996) {
        ctx.save(); ctx.globalAlpha *= 1 - show;
        const er = mixc([228, 224, 214], [255, 44 + (1 - a) * 40, 24], smoothstep(clamp(a * 1.6, 0, 1)));
        // enraged: a mouth in the dark, wide and turned down in a snarl, lit from inside a dull red, teeth along its edges.
        // In the lunge (lk) it comes apart: red cracks split the dark of its face out from the eyes and the mouth, and the jaw
        // unhinges, dropping open into a black throat ringed with more teeth, long uneven fangs top and bottom
        if (a > 0.02) {
          ctx.save(); ctx.globalAlpha *= smoothstep(clamp(a * 1.4, 0, 1));
          ctx.save(); ctx.beginPath(); ctx.ellipse(0, oy, orx, ory, 0, 0, TAU); ctx.clip();
          if (lk > 0.02) {   // the cracks, glowing, jagged, the same every time (not flickering)
            const cr = rgba([255, 46, 22], 0.75 * lk), hz = rgba([255, 46, 22], 0.18 * lk);
            const crack = (x0, y0, ang, len, seed) => {
              let x = x0, y = y0; const pts = [[x, y]];
              for (let i = 1; i <= 5; i++) { const aa = ang + Math.sin(seed * 7.1 + i * 2.3) * 0.55; x += Math.cos(aa) * len / 5; y += Math.sin(aa) * len / 5; pts.push([x, y]); }
              P_limb(ctx, pts, 0.012 * lk, hz); P_limb(ctx, pts, 0.0045 * lk, cr);
            };
            const exl = 0.036 + lk * 0.03;
            for (const s of [-1, 1]) {
              crack(s * exl, fy + 0.06, Math.PI / 2 + s * 0.5, 0.12 * lk, 1 + s);             // up from each eye, across the brow
              crack(s * (exl + 0.014), fy + 0.03, Math.PI / 2 - s * 1.35, 0.1 * lk, 3 + s);   // out from each eye
              crack(s * 0.07, fy - 0.13, -Math.PI / 2 - s * 0.45, 0.12 * lk, 5 + s);          // down from each corner of the mouth
              crack(s * exl, fy - 0.0, -Math.PI / 2 + s * 0.35, 0.09 * lk, 7 + s);            // down from each eye to the mouth
            }
            // and at the last, cracks all over it
            if (lk3 > 0.02) for (let i = 0; i < 12; i++) {
              const an = i / 12 * TAU + 0.4, r = 0.03 + 0.07 * (0.5 + 0.5 * Math.sin(i * 2.9));
              crack(Math.cos(an) * r * 1.2, oy + Math.sin(an) * r * 1.6, an + Math.sin(i * 1.7) * 0.6, (0.06 + 0.06 * Math.abs(Math.sin(i * 4.1))) * lk3, 11 + i);
            }
          }
          // (its corners pulled down below the arch of its upper lip; the lower lip a little below the corners, more as it lunges)
          const mw = 0.05 + a * 0.012 + lunge * 0.006 + lk * 0.022, cy = fy - 0.112 - a * 0.012 - lk * 0.02, top = cy + 0.036 + a * 0.006 + lk * 0.06;
          const bot = Math.max(oy - ory + 0.02, cy - 0.012 - a * 0.008 - lunge * 0.03 - lk * 0.24);
          const mouth = () => { ctx.beginPath(); ctx.moveTo(-mw, cy); ctx.quadraticCurveTo(0, 2 * top - cy, mw, cy); ctx.quadraticCurveTo(0, 2 * bot - cy, -mw, cy); ctx.closePath(); };
          mouth(); ctx.fillStyle = rgba([150, 18, 12], 0.95); ctx.fill();
          ctx.save(); mouth(); ctx.clip();
          const th = (top + bot) / 2 - 0.004;
          P_ell(ctx, 0, th, mw * (0.6 + lk * 0.15), (top - bot) * (0.32 + lk * 0.12), rgba([40, 0, 0], 0.9));   // its throat
          if (lk > 0.3) {   // down in the black of the throat, another ring of teeth
            const q = smoothstep((lk - 0.3) / 0.5), rx = mw * 0.62, ry = (top - bot) * 0.4, tooth2 = P.cola([200, 180, 160], 0.85 * q);
            P_ell(ctx, 0, th, rx * 0.8, ry * 0.75, rgba([0, 0, 0], 0.95));
            ctx.fillStyle = tooth2; ctx.beginPath();
            for (let i = 0; i < 14; i++) {
              const an = i / 14 * TAU, x = Math.cos(an) * rx * 0.86, y = th + Math.sin(an) * ry * 0.86, l = 0.018 * q * (0.7 + 0.3 * Math.abs(Math.sin(i * 3.1)));
              const ix = -Math.cos(an), iy = -Math.sin(an), w = 0.005;
              ctx.moveTo(x - iy * w, y + ix * w); ctx.lineTo(x + iy * w, y - ix * w); ctx.lineTo(x + ix * l, y + iy * l);
            }
            ctx.fill();
          }
          const tooth = P.col([214, 204, 190]), edge = (y, x) => cy + (y - cy) * (1 - (x / mw) * (x / mw));
          const n = lk > 0.4 ? 5 : 3;
          for (let i = -n; i <= n; i++) {
            const x = i * mw * (0.81 / n), up = edge(top, x), dn = edge(bot, x), j = 0.6 + 0.4 * Math.abs(Math.sin(i * 2.7 + 1));
            const fang = Math.abs(i) === (n === 3 ? 2 : 3), shut = (top - bot) * (fang ? 0.55 : 0.36) * j;
            const long = lerp(shut, Math.min(shut, (fang ? 0.075 : 0.04) * j), lk), lo = lerp((top - bot) * 0.3, (fang ? 0.06 : 0.032) * j, lk);
            ctx.fillStyle = tooth; ctx.beginPath(); ctx.moveTo(x - 0.007, up + 0.01); ctx.lineTo(x + 0.007, up + 0.01); ctx.lineTo(x + (i % 2 ? 0.003 : -0.002) * lk, up - long); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - 0.006, dn - 0.01); ctx.lineTo(x + 0.006, dn - 0.01); ctx.lineTo(x - (i % 2 ? 0.003 : -0.002) * lk, dn + lo); ctx.closePath(); ctx.fill();
          }
          ctx.restore(); ctx.restore(); ctx.restore();
        }
        // the eyes: two small pale points, or, enraged, two tall red slits, burning. Far off in the dark
        // they are all there is of it: two points, set as far apart on its head as they always are (no haze round them)
        // (an eye too small to fill a pixel of the canvas would be smeared over the pixels round it, too faint to see, and
        // made any bigger the two would run together into one smudge: so far off each is one whole pixel, where its middle
        // falls, at its full light; they are where they always are on its head, a little more than a pixel apart at the
        // most it is ever off)
        const M = ctx.getTransform(), ppm = Math.hypot(M.a, M.b) || 1;
        for (const s of [-1, 1]) {
          const ex = s * (0.036 + lk * 0.03), ey = fy + 0.03 + lk * 0.012;   // in your face, the eyes pull apart
          if (a > 0.02) P_ell(ctx, ex, ey, 0.018 + lk * 0.008, 0.036 + a * 0.01 + lk * 0.02, rgba(er, (0.28 + 0.2 * lk) * a), s * 0.15 * a);
          const rx = lerp(0.011, 0.0075, a) + lk * 0.002, ry = lerp(0.011, 0.024, a) + lk * 0.012;   // enraged, tall burning slits, taller still in your face
          // (their own light: they show through the dark, the pale ones a little dimmed by it far off)
          const col = rgba(mixc(er, P.fogColor || [0, 0, 0], (1 - a) * 0.45 * (P.fog || 0)));
          if (Math.max(rx, ry) * ppm < 0.5) { const q = M.transformPoint({ x: ex, y: ey }); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.fillRect(Math.floor(q.x), Math.floor(q.y), 1, 1); ctx.restore(); }
          else P_ell(ctx, ex, ey, rx, ry, col, s * 0.15 * a);
        }
        ctx.restore();
      }
    };
    if (lk3 > 0.01) {
      // the face coming apart: red light behind it, showing through every gap, and the face broken into shards that
      // drift apart from each other, each turned a little, along jagged edges radiating from the middle of it
      const cx = 0, cy0 = oy - 0.01, N = 7;
      P_ell(ctx, cx, oy, orx * 1.25, ory * 1.15, rgba([255, 40, 20], 0.12 * lk3));   // a faint red haze round it
      const gl = ctx.createRadialGradient(cx, cy0, 0.01, cx, cy0, ory);
      gl.addColorStop(0, rgba([255, 150, 70], lk3)); gl.addColorStop(0.6, rgba([255, 50, 20], 0.95 * lk3)); gl.addColorStop(1, rgba([200, 20, 10], 0.9 * lk3));
      ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(cx, oy, orx * 1.04, ory * 1.03, 0, 0, TAU); ctx.fill();   // the light behind the face, in the gaps
      const ang = k => k / N * TAU + 0.35 + 0.18 * Math.sin(k * 4.7);
      const edge = k => {   // a jagged line from the middle out past the edge of the face
        const a0 = ang(k), pts = [[cx, cy0]];
        for (let j = 1; j <= 4; j++) { const r = j / 4 * 0.5, w = 0.18 * Math.sin(k * 3.3 + j * 1.9); pts.push([cx + Math.cos(a0 + w) * r, cy0 + Math.sin(a0 + w) * r]); }
        return pts;
      };
      for (let k = 0; k < N; k++) {
        const e0 = edge(k), e1 = edge(k + 1), mid = (ang(k) + ang(k + 1) + (k === N - 1 ? TAU : 0)) / 2, h = 0.5 + 0.5 * Math.sin(k * 5.1);
        const d = lk3 * (0.016 + 0.022 * h), rot = lk3 * 0.16 * (h - 0.5);
        ctx.save();
        ctx.translate(Math.cos(mid) * d, Math.sin(mid) * d); ctx.translate(cx, cy0); ctx.rotate(rot); ctx.translate(-cx, -cy0);
        ctx.beginPath(); e0.forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); for (let j = e1.length - 1; j >= 0; j--) ctx.lineTo(e1[j][0], e1[j][1]); ctx.closePath(); ctx.clip();
        drawFace();
        ctx.restore();
      }
    } else drawFace();
    // bowed and still crying, its tears drop out of the dark of the hood, now and then, falling past its chest (straight down,
    // however its head is tipped; none with reduced motion)
    const drip = F && !c.still ? dn * clamp(c.sob || 0, 0, 1) : 0;
    if (drip > 0.02) {
      const th = tilt + heave * 0.6 * Math.sin(t * 9.1), down = [-Math.sin(th), -Math.cos(th)], tear = [200, 228, 255];
      for (let j = 0; j < 3; j++) {
        const u = (t * 0.7 + j * 0.41) % 1, fall = 0.02 + 0.5 * u * u, a = drip * Math.min(1, u / 0.08) * (1 - smoothstep(clamp((u - 0.7) / 0.3, 0, 1)));
        const x = (j - 1) * 0.028 + down[0] * fall, y = oy - ory * 0.8 + down[1] * fall;
        P_ell(ctx, x, y, 0.0055, 0.0085 + 0.006 * u, rgba(tear, 0.7 * a), -th);
      }
    }
    ctx.restore();
    if (hug) demonHugArms(ctx, c, P, robe, hug.S, hug.E, hug.H, sleeve, hug.f);
    ctx.restore();
  }
};
