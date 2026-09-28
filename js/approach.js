'use strict';
// ---------- approach lanes: where a thing can come from, and how much of it you can see ----------
// A lane is a ray from the eye. Visibility along it is described by apertures: rectangular holes in
// planes perpendicular to the lane at lane-distance z (a doorway, a window, a gap between gate posts);
// an open side declares none. Blockers are distance intervals where the thing is hidden regardless
// (below a crest, behind the hood of a car). Everything here is pure geometry: no drawing involved.
const APPROACH = (() => {
  function makeLane(L, def, idx) {
    const deg = def.deg || 0, elev = (def.elev || 0) * DEG;
    const yaw = L.facing + deg * DEG;
    return {
      idx, name: def.name || ('lane' + idx), deg, elev, yaw, y: def.y || 0,
      apertures: (def.apertures || []).slice(), blockers: (def.blockers || []).slice(),
      barrierDist: def.barrierDist, startDist: def.startDist, maxStart: def.maxStart, cue: def.cue || null, follow: def.follow || null, ramp: !!def.ramp, noSwitch: !!def.noSwitch,
      dirX: Math.sin(yaw), dirZ: Math.cos(yaw),
    };
  }
  // world position of a thing `dist` metres along the lane, offset `lat` to its right
  function position(lane, dist, lat, eyeH) {
    const hor = dist * Math.cos(lane.elev);
    const rx = Math.cos(lane.yaw), rz = -Math.sin(lane.yaw);
    let y = lane.y + (lane.elev ? eyeH + dist * Math.sin(lane.elev) : 0);
    if (lane.ramp) y = Math.max(lane.y, eyeH + dist * Math.sin(lane.elev));
    return { x: lane.dirX * hor + rx * (lat || 0), z: lane.dirZ * hor + rz * (lat || 0), y };
  }
  function overlap(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
    const w = Math.min(ax1, bx1) - Math.max(ax0, bx0), h = Math.min(ay1, by1) - Math.max(ay0, by0);
    return (w > 0 && h > 0) ? w * h : 0;
  }
  // fraction of the silhouette (w x h, feet on the ground, offset lat) that passes every aperture, 0..1
  function apertureFrac(lane, dist, lat, w, h, eyeH) {
    for (const b of lane.blockers) if (dist >= b[0] && dist <= b[1]) return 0;
    if (!lane.apertures.length) return 1;
    let frac = 1;
    const x0 = (lat || 0) - w / 2, x1 = (lat || 0) + w / 2;
    const feet = lane.ramp ? position(lane, dist, 0, eyeH).y : lane.y;
    for (const a of lane.apertures) {
      if (dist <= a.z) continue;                // nearer than the opening: not clipped by it
      const k = a.z / dist;                     // project about the eye onto the aperture plane
      const px0 = x0 * k, px1 = x1 * k, py0 = eyeH + (feet - eyeH) * k, py1 = eyeH + (feet + h - eyeH) * k;
      const area = (px1 - px0) * (py1 - py0);
      if (area <= 0) return 0;
      frac *= overlap(px0, py0, px1, py1, a.x0, a.y0, a.x1, a.y1) / area;
      if (frac <= 0) return 0;
    }
    return frac;
  }
  // how much of the thing you can see right now: aperture fraction times the on-screen fraction
  function visFrac(L, lane, c, cam) {
    const CR = c.CR;
    const af = apertureFrac(lane, c.dist, c.lat, CR.w, CR.h, L.eyeH);
    if (af <= 0) return 0;
    const p = position(lane, c.dist, c.lat, L.eyeH);
    const r = R.projectRect(p.x, p.y + (c.yOff || 0), p.z, CR.w, CR.h, cam);
    if (!r) return 0;
    const W = cam ? cam.W : R.W, H = cam ? cam.H : R.H;
    return af * overlap(r.x, r.y, r.x + r.w, r.y + r.h, 0, 0, W, H) / Math.max(1e-6, r.w * r.h);
  }
  // how much of the thing the player can see by looking ahead and down: the aperture fraction times the part of
  // its height that appears on screen in either pitch (the screen edge is not an occluder, the walls are)
  function unionVisFrac(L, lane, c, vp) {
    const CR = c.CR;
    const af = apertureFrac(lane, c.dist, c.lat, CR.w, CR.h, L.eyeH);
    if (af <= 0) return 0;
    const p = position(lane, c.dist, c.lat, L.eyeH);
    let hx = 0; const vs = [];
    for (const pitch of [0, PITCH_DOWN]) {
      const cam = { yaw: lane.yaw, pitch, zoom: 1, W: vp.W, H: vp.H, eyeH: L.eyeH };
      const r = R.projectRect(p.x, p.y + (c.yOff || 0), p.z, CR.w, CR.h, cam);
      if (!r) continue;
      const x0 = Math.max(r.x, 0), x1 = Math.min(r.x + r.w, vp.W), y0 = Math.max(r.y, 0), y1 = Math.min(r.y + r.h, vp.H);
      if (x1 <= x0 || y1 <= y0) continue;
      hx = Math.max(hx, (x1 - x0) / r.w);
      vs.push([(y0 - r.y) / r.h, (y1 - r.y) / r.h]);
    }
    vs.sort((u, v) => u[0] - v[0]);
    let cover = 0, cur = null;
    for (const v of vs) { if (!cur || v[0] > cur[1]) { if (cur) cover += cur[1] - cur[0]; cur = v.slice(); } else cur[1] = Math.max(cur[1], v[1]); }
    if (cur) cover += cur[1] - cur[0];
    return af * hx * cover;
  }
  // "fully visible" as a machine-checked property: with the camera on the lane, the thing is at least
  // `min` visible at every whole metre from 3 m out to where it starts, outside declared blockers
  function validateLane(L, lane, opts) {
    const o = opts || {};
    const viewports = o.viewports || [{ W: 1280, H: 760 }];
    const problems = [];
    if (lane.follow) return problems;   // a lane that follows the camera is seen another way (in mirrors)
    const onLane = L.creatures.filter(c => c.lane === lane || (c.laneOptions && c.laneOptions.includes(lane.idx)));
    for (const cr of (onLane.length ? onLane : L.creatures)) {
      for (const vp of viewports) {
        for (let d = 3; d <= cr.D0; d += 1) {
          if (lane.blockers.some(b => d >= b[0] && d <= b[1])) continue;
          const f = unionVisFrac(L, lane, { CR: cr.CR, dist: d, lat: 0, yOff: 0 }, vp);
          if (f < (o.min || 0.85)) problems.push({ lane: lane.name, creature: cr.type, viewport: vp.W + 'x' + vp.H, dist: d, frac: +f.toFixed(2) });
        }
      }
    }
    return problems;
  }
  return { makeLane, position, apertureFrac, visFrac, unionVisFrac, validateLane };
})();
