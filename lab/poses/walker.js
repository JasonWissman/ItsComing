'use strict';
// Night 1, The Road: the walker (js/creatures/walker.js; its moves are set by js/levels/night01.js). All black, starved,
// its skin pulled tight over its bones (CREATURES.walker.limb, chest, neck, face, claws): thin limbs knobbed at the knees
// and elbows, thinner wrists and ankles, a narrow torso sunk in under its ribs, a neck of tendons, bony fingers knotted at
// the knuckles with black nails. The bone shows in faint greys only close to (boneA); far off it is a black figure. Its
// proportions, poses and dark oval head with the pale grey face are its own: no sack, no hat.
(() => {
  const BOARDS = [[0.34, 0.88], [0.96, 1.5], [1.79, 2.29]];   // night 1's boards across the doorway (bottom, top), metres
  const LINTEL = 2.16;                                        // the doorways are a head too low for it
  const wood = P => P.col([92, 70, 48]), woodD = P => P.col([58, 44, 30]);
  const doorway = (ctx, c, P) => { P_rect(ctx, -0.62, 0, 0.1, LINTEL + 0.1, woodD(P)); P_rect(ctx, 0.52, 0, 0.1, LINTEL + 0.1, woodD(P)); P_rect(ctx, -0.62, LINTEL, 1.24, 0.12, woodD(P)); };
  const liftOf = f => (f < 0.3 ? 0 : f < 0.85 ? smoothstep((f - 0.3) / 0.55) : 1 - smoothstep((f - 0.85) / 0.15));
  LAB.creature('walker', {
    night: 1, stage: 'The Road', dist: 12,
    anims: [
      { name: 'Walking at you', note: 'Its walk down the road, far off: the snapping head tilt, the arms hanging to its knees; far off, only a tall thin black figure.', dist: 20, walk: 1.0, dur: 6 },
      { name: 'Closing in', note: 'From 24 m to 2 m: the arms rise toward you, and the gaunt face, the opening mouth and the bones under its skin come up as it nears.', walk: 1.0, dur: 7,
        tick(c, k) { c.dist = lerp(24, 2, k); } },
      { name: 'Ducking under the lintel', note: 'Coming in through a doorway a head too low for it: it bends down under the lintel, then straightens inside.', dist: 4, walk: 0.9, dur: 6, fit: { h: 2.8 },
        back: doorway,
        tick(c, k) { c.headroom = k < 0.3 ? lerp(2.7, LINTEL - 0.3, smoothstep(k / 0.3)) : k < 0.65 ? LINTEL - 0.3 : lerp(LINTEL - 0.3, 2.66, smoothstep((k - 0.65) / 0.3)); } },
      { name: 'Peering through the boards', note: 'The win: it stoops to look in through the gap between the boards and pounds on them, a hand at a time, its bony fingers hooked over the board.', dist: 3, dur: 4.6, fit: { h: 2.6, w: 1.6 },
        set(c) { c.peer = 0.35; c.blow = 1; },
        tick(c, k, dt, T) {
          c.peer = Math.min(1, c.peer + dt / 0.45); c.blow = Math.max(0, (c.blow || 0) - dt * 5);
          const phase = (T - 0.5) / 0.38;
          c.handLift = [0, 1].map(h => { const q = (phase - h) / 2; return q < -1 ? 0 : liftOf(q - Math.floor(q)); });
          const n = Math.floor(phase); if (n >= 0 && n >= (c.bangs || 0)) { c.bangs = n + 1; c.blow = 1; }
        },
        front(ctx, c, P) {
          for (const [y0, y1] of BOARDS) { P_rect(ctx, -0.7, y0, 1.4, y1 - y0, wood(P)); P_rect(ctx, -0.7, y0, 1.4, 0.025, woodD(P)); }
          for (const side of [-1, 1]) {   // its bony fingers over the board under the gap, unless that hand is up
            if (c.handLift && c.handLift[side > 0 ? 1 : 0] > 0.2) continue;
            CREATURES.walker.grip(ctx, P, side, side * 0.36, 1.4);
          }
        } },
      { name: 'Running round the house', note: 'Side on, flat out: the run round the house when it goes for another doorway.', dist: 10, dur: 3, fit: { w: 2.0 },
        set(c) { c.runPose = true; c.runDir = 1; c.moving = true; }, tick(c, k, dt) { c.runGait = (c.runGait || 0) + dt * 15; } },
      { name: 'Charging the boards', note: 'Once the night is won: straight at you, flat out, the arms coming up for the boards in the last few metres.', dur: 2.6,
        set(c) { c.charge = 1; c.moving = true; }, tick(c, k, dt) { c.gait += dt * 15; c.dist = lerp(14, 1.5, k); } },
      { name: 'Climbing in through the window', note: 'The easter egg: both doorways boarded and the window broken, it comes in by the window. Fingers over the sill, the head through on its side, an arm feeling down the wall, the body over the sill, a leg at a time, and it unfolds inside.', dist: 3, dur: 8, still: true, fit: { h: 2.75, w: 2.0 },
        set(c) { c.climb = 0; },
        tick(c, k) { c.climb = CREATURES.walker.climbAt(clamp((k - 0.05) / 0.8, 0, 1)); },
        // the wall round the window (what is still outside shows only in the frame), the frame and the sill; then what has come in
        front(ctx, c, P) {
          const F = CREATURES.walker.FRAME, top = 2.16;
          P_rect(ctx, -1.1, 0, 1.11 + F.l, 2.75, woodD(P)); P_rect(ctx, F.r - 0.01, 0, 1.11 - F.r, 2.75, woodD(P));
          P_rect(ctx, F.l, 0, F.r - F.l, F.sl, woodD(P)); P_rect(ctx, F.l, top, F.r - F.l, 2.75 - top, woodD(P));
          P_rect(ctx, F.l - 0.06, F.sl, 0.06, top - F.sl + 0.06, wood(P)); P_rect(ctx, F.r, F.sl, 0.06, top - F.sl + 0.06, wood(P)); P_rect(ctx, F.l, top, F.r - F.l, 0.06, wood(P));
          P_rect(ctx, F.l - 0.08, F.sl - 0.07, F.r - F.l + 0.16, 0.07, wood(P));
          CREATURES.walker.drawClimb(ctx, c, P, 'in');
        } },
      LAB.lunge({ note: 'It reaches you: the head and the hands come at you.' }),
    ],
  });
})();
