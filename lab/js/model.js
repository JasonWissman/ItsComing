// ---------- the headless lab model: the thing's approach, the camera, what counts as seen ----------
// No Three.js and no DOM in here. This is the "GameModel" of the research report: the view reads snapshots from
// it and never writes to it, and input mutates it synchronously. The numbers are the game's own (night 1's
// walker: js/levels/night01.js, js/creatures/walker.js, the camera and heartbeat in js/game.js, the visibility
// rule in js/approach.js), so what the lab shows moves the way the game does.
export const TAU = Math.PI * 2, DEG = Math.PI / 180;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const easeIn = t => { t = clamp(t, 0, 1); return t * t * t; };
export function wrapPi(a) { a = a % TAU; if (a > Math.PI) a -= TAU; else if (a < -Math.PI) a += TAU; return a; }
// the same snapping head tilt as js/creatures.js
export function headTiltJerk(t, period, amp) {
  const k = Math.floor(t / period), side = (k & 1) ? 1 : -1, frac = t - k * period;
  const snap = smoothstep(frac / 0.07);
  return side * amp * (2 * snap - 1);
}

// night 1's walker, as declared in the game
export const WALKER = { h: 2.45, w: 1.5, faceY: 2.25, stepRate: 0.55, catchDist: 1.5, startDist: 130, time: 80, gamma: 0.72, unseenMult: 1.35, seenMult: 1 };
export const VIEW = { VFOV: 62 * DEG, PITCH_DOWN: 45 * DEG, NEAR: 0.05, ZOOM: 2.6 };
// the back doorway the lane passes through (SC.doorway in night01: z 2.6, 1.6 wide, 2.12 high)
export const DOOR = { z: 2.6, x0: -0.8, x1: 0.8, y0: 0, y1: 2.12 };
export const DIR_NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// screen rect of an upright billboard (w x h metres, base at x,y,z) for a camera {yaw, pitch, zoom, W, H, eyeH}:
// the game's R.projectRect, pure math
export function projectRect(x, y, z, w, h, cam) {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const ff = (cam.H / 2) / Math.tan(VIEW.VFOV / 2) * (cam.zoom || 1);
  const tc = (px, py, pz) => { const dy = py - cam.eyeH; const cx = px * cy - pz * sy; const cz = px * sy + pz * cy; return [cx, dy * cp + cz * sp, -dy * sp + cz * cp]; };
  const base = tc(x, y, z);
  if (base[2] < VIEW.NEAR) return null;
  const bx = cam.W / 2 + ff * base[0] / base[2], by = cam.H / 2 - ff * base[1] / base[2];
  const s = ff / base[2];
  const top = tc(x, y + h, z);
  let hpx = h * s;
  if (top[2] >= VIEW.NEAR) hpx = Math.max(0.5, by - (cam.H / 2 - ff * top[1] / top[2]));
  const wpx = w * s;
  return { x: bx - wpx / 2, y: by - hpx, w: wpx, h: hpx };
}
function overlap(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
  const w = Math.min(ax1, bx1) - Math.max(ax0, bx0), h = Math.min(ay1, by1) - Math.max(ay0, by0);
  return (w > 0 && h > 0) ? w * h : 0;
}
// fraction of the silhouette that passes the doorway (APPROACH.apertureFrac for one aperture on a flat lane)
export function apertureFrac(dist, w, h, eyeH) {
  if (dist <= DOOR.z) return 1;
  const k = DOOR.z / dist;
  const px0 = -w / 2 * k, px1 = w / 2 * k, py0 = eyeH * (1 - k), py1 = eyeH + (h - eyeH) * k;
  const area = (px1 - px0) * (py1 - py0);
  return area <= 0 ? 0 : overlap(px0, py0, px1, py1, DOOR.x0, DOOR.y0, DOOR.x1, DOOR.y1) / area;
}

export function createModel(opts) {
  const def = Object.assign({}, WALKER, (opts && opts.creature) || {});
  const m = {
    def, eyeH: 1.65, W: 1280, H: 760,
    t: 0, state: 'play', stateT: 0,       // play | dying | caught
    speedScale: 1, holdAt: null,          // lab knobs: a multiplier on its pace, and a distance to hold it at (null: it comes)
    gazeRule: true,                       // off: it moves at its seen pace whether you look or not
    cam: { yaw: 0, pitch: 0, zoom: 1, tYaw: 0, tPitch: 0, dirIdx: 0, zoomHeld: false },
    c: null, prev: null,
    hb: { next: 0, last: -10 }, danger: 0, flash: 0, shake: 0, lungeFrom: 0,
    events: [],                           // presentation events for the view, drained each frame
    steps: 0,
  };
  const freshCreature = () => ({
    D0: def.startDist, T: def.time, gamma: def.gamma, u: 0, dist: def.startDist, gait: 0, t: 0,
    seen: true, visFrac: 1, moving: true, lunge: 0, yOff: 0, near: 0, hurt: 0, hits: 0, stagger: 0,
    dissolve: 0, dissolving: false, gone: 0, respawnIn: 0,
  });
  function copyPrev() { const c = m.c, p = m.prev; p.dist = c.dist; p.gait = c.gait; p.yOff = c.yOff; p.lunge = c.lunge; p.yaw = m.cam.yaw; p.pitch = m.cam.pitch; p.zoom = m.cam.zoom; }
  function visFrac() {
    const c = m.c, cam = { yaw: m.cam.yaw, pitch: m.cam.pitch, zoom: m.cam.zoom, W: m.W, H: m.H, eyeH: m.eyeH };
    const af = apertureFrac(c.dist, def.w, def.h, m.eyeH);
    if (af <= 0) return 0;
    const r = projectRect(0, c.yOff, c.dist, def.w, def.h, cam);
    if (!r) return 0;
    return af * overlap(r.x, r.y, r.x + r.w, r.y + r.h, 0, 0, m.W, m.H) / Math.max(1e-6, r.w * r.h);
  }
  function heartbeat(dt) {
    const c = m.c, from = Math.min(50, c.D0 / 2), to = def.catchDist;
    const prox = clamp(1 - (c.dist - to) / Math.max(0.5, from - to), 0, 1);
    const interval = lerp(1.35, 0.32, Math.pow(prox, 1.5));
    if (m.t >= m.hb.next) { m.hb.last = m.t; m.hb.next = m.t + interval; if (prox > 0.02) m.events.push({ type: 'heartbeat', strength: prox }); }
    const pulse = Math.exp(-(m.t - m.hb.last) / 0.22);
    m.danger = Math.pow(prox, 2.2) * (0.35 + 0.65 * pulse);
  }
  function step(dt) {
    copyPrev();
    const cam = m.cam, c = m.c;
    m.t += dt; m.steps++;
    cam.yaw += wrapPi(cam.tYaw - cam.yaw) * (1 - Math.exp(-dt * 11));
    cam.pitch += (cam.tPitch - cam.pitch) * (1 - Math.exp(-dt * 10));
    const tz = cam.zoomHeld && m.state === 'play' ? VIEW.ZOOM : 1;
    cam.zoom += (tz - cam.zoom) * (1 - Math.exp(-dt * 8));
    m.shake = Math.max(0, m.shake - dt * 2.2);
    m.flash = Math.max(0, m.flash - dt * 3);
    c.t += dt;
    if (c.hurt > 0) c.hurt = Math.max(0, c.hurt - dt);
    if (c.stagger > 0) c.stagger = Math.max(0, c.stagger - dt);
    if (m.state === 'play') {
      c.visFrac = visFrac();
      c.seen = c.visFrac >= 0.2;
      const mult = ((c.seen || !m.gazeRule) ? def.seenMult : def.unseenMult) * m.speedScale;
      const prevDist = c.dist;
      if (c.dissolving) {
        c.dissolve = Math.min(1, c.dissolve + dt / 1.6);
        if (c.dissolve >= 1) { c.gone += dt; if (c.gone > 2) { m.events.push({ type: 'respawn' }); m.c = Object.assign(freshCreature(), { t: c.t }); copyPrev(); return; } }
      } else if (m.holdAt === null) {
        c.u = clamp(c.u + dt * mult / c.T, 0, 1);
        c.dist = c.D0 * Math.pow(1 - c.u, c.gamma);
      }
      const moved = Math.abs(prevDist - c.dist);
      c.gait += moved * def.stepRate * Math.PI;
      c.moving = moved > 0.024 * dt;
      if (!c.moving) { const rest = Math.round(c.gait / Math.PI) * Math.PI; c.gait += (rest - c.gait) * Math.min(1, dt * 4); }
      c.near = clamp(1 - c.dist / 22, 0, 1);
      heartbeat(dt);
      if (!c.dissolving && c.dist <= def.catchDist) {
        m.state = 'dying'; m.stateT = 0; m.lungeFrom = c.dist;
        cam.tYaw = cam.yaw + wrapPi(0 - cam.yaw); cam.tPitch = 0; cam.zoomHeld = false; cam.dirIdx = 0;
        m.shake = 1.4;
        m.events.push({ type: 'caught' });
      }
    } else if (m.state === 'dying') {
      m.stateT += dt;
      const delay = 0.22, dur = 0.5, k = clamp((m.stateT - delay) / dur, 0, 1);
      c.lunge = k;
      c.dist = lerp(m.lungeFrom, 0.55, easeIn(k));
      c.yOff = lerp(0, m.eyeH - def.faceY, smoothstep(k));
      c.near = 1;
      m.danger = Math.min(1, m.danger + dt * 3);
      if (m.stateT > delay + dur + 1.2) { m.state = 'caught'; m.events.push({ type: 'dead' }); }
    }
  }
  // ---- input: synchronous mutations, nothing waits for a frame ----
  function turn(dir) { const cam = m.cam; if (m.state !== 'play') return; cam.dirIdx = (cam.dirIdx + (dir < 0 ? 7 : 1)) % 8; cam.tYaw = cam.yaw + wrapPi(cam.dirIdx * 45 * DEG - cam.yaw); }
  function look(down) { if (m.state === 'play') m.cam.tPitch = down ? VIEW.PITCH_DOWN : 0; }
  function zoom(held) { m.cam.zoomHeld = !!held; }
  function shoot() {
    const c = m.c;
    if (m.state !== 'play' || c.dissolving) return false;
    c.hurt = 0.35; c.hits++; c.stagger = 0.35;
    m.flash = 0.5; m.shake = 0.7;
    m.events.push({ type: 'shot', dist: c.dist });
    if (c.hits >= 3) { c.dissolving = true; m.events.push({ type: 'dissolve' }); }
    return true;
  }
  function dissolve() { const c = m.c; if (m.state === 'play' && !c.dissolving) { c.dissolving = true; m.events.push({ type: 'dissolve' }); } }
  function setDist(d) { const c = m.c; d = clamp(d, def.catchDist + 0.05, c.D0); c.u = clamp(1 - Math.pow(d / c.D0, 1 / c.gamma), 0, 1); c.dist = c.D0 * Math.pow(1 - c.u, c.gamma); copyPrev(); }
  function reset() {
    m.c = freshCreature(); m.prev = {}; copyPrev();
    m.state = 'play'; m.stateT = 0; m.t = 0; m.danger = 0; m.flash = 0; m.shake = 0; m.hb.next = 0; m.hb.last = -10;
    const cam = m.cam; cam.dirIdx = 0; cam.yaw = cam.tYaw = 0; cam.pitch = cam.tPitch = 0; cam.zoom = 1; cam.zoomHeld = false;
    m.events.length = 0;
  }
  // an interpolated, read-only picture of the model for the view; the same object is reused every frame
  const snap = { dist: 0, gait: 0, yOff: 0, lunge: 0, yaw: 0, pitch: 0, zoom: 0, near: 0, seen: true, moving: true, hurt: 0, dissolve: 0, stagger: 0, t: 0, ct: 0, state: 'play', danger: 0, flash: 0, shake: 0, visFrac: 1, hits: 0, gone: false };
  function snapshot(alpha) {
    const c = m.c, p = m.prev, a = alpha === undefined ? 1 : clamp(alpha, 0, 1);
    snap.dist = lerp(p.dist, c.dist, a); snap.gait = lerp(p.gait, c.gait, a); snap.yOff = lerp(p.yOff, c.yOff, a); snap.lunge = lerp(p.lunge, c.lunge, a);
    snap.yaw = p.yaw + wrapPi(m.cam.yaw - p.yaw) * a; snap.pitch = lerp(p.pitch, m.cam.pitch, a); snap.zoom = lerp(p.zoom, m.cam.zoom, a);
    snap.near = c.near; snap.seen = c.seen; snap.moving = c.moving; snap.hurt = c.hurt; snap.dissolve = c.dissolve; snap.stagger = c.stagger;
    snap.t = m.t; snap.ct = c.t; snap.state = m.state; snap.danger = m.danger; snap.flash = m.flash; snap.shake = m.shake; snap.visFrac = c.visFrac; snap.hits = c.hits;
    snap.gone = c.dissolving && c.dissolve >= 1;
    return snap;
  }
  reset();
  return Object.assign(m, { step, turn, look, zoom, shoot, dissolve, setDist, reset, snapshot, setViewport(W, H) { m.W = W; m.H = H; } });
}
