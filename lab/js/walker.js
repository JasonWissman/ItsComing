// ---------- the walker, rigged: a skeleton, a skinned mesh built from capsules, and clips baked from poses ----------
// This is night 1's creature (js/creatures/walker.js) as a real character: the same proportions, the same gait, bob,
// sway, hanging arms, rising arms and snapping head, but as bones driving a skinned mesh, so it goes through the
// same pipeline a modelled, rigged GLB would (AnimationMixer, clips, blending, export). No asset files involved.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TAU, WALKER } from './model.js';
import { createToonMaterial, addHull } from './materials.js';
import { makeCharacterView } from './character.js';

// joints in the rest pose (metres, feet at y 0, facing +z like a glTF asset)
const J = {
  hips: [0, 1.22, 0], spine: [0, 1.47, 0], chest: [0, 1.75, 0], neck: [0, 2.0, 0], head: [0, 2.12, 0],
  shoulderL: [-0.21, 1.95, 0], shoulderR: [0.21, 1.95, 0], elbowL: [-0.24, 1.38, 0], elbowR: [0.24, 1.38, 0], handL: [-0.27, 0.72, 0], handR: [0.27, 0.72, 0],
  thighL: [-0.08, 1.22, 0], thighR: [0.08, 1.22, 0], kneeL: [-0.12, 0.61, 0], kneeR: [0.12, 0.61, 0], footL: [-0.15, 0.03, 0], footR: [0.15, 0.03, 0],
};
const PARENT = { spine: 'hips', chest: 'spine', neck: 'chest', head: 'neck', shoulderL: 'chest', shoulderR: 'chest', elbowL: 'shoulderL', elbowR: 'shoulderR', handL: 'elbowL', handR: 'elbowR', thighL: 'hips', thighR: 'hips', kneeL: 'thighL', kneeR: 'thighR', footL: 'kneeL', footR: 'kneeR' };
const FINGER_SPREAD = 0.16, FINGER_LEN = 0.17;

export function buildWalker(o) {
  const shared = o.shared, hullMat = o.hullMat;
  const body = createToonMaterial(shared, { name: 'body', color: [6, 6, 10] });
  const skin = createToonMaterial(shared, { name: 'skin', color: [92, 84, 88] });
  const eye = createToonMaterial(shared, { name: 'eye', color: [225, 218, 205] });

  // ---- skeleton ----
  const bones = [], byName = {};
  const v = a => new THREE.Vector3(a[0], a[1], a[2]);
  function bone(name, parent, pos) {
    const b = new THREE.Bone(); b.name = name;
    const p = parent ? byName[parent] : null;
    b.position.copy(pos); if (p) { b.position.sub(p.userData.world); p.add(b); }   // local = world minus the parent's world
    b.userData.world = pos.clone();
    bones.push(b); byName[name] = b; return b;
  }
  bone('hips', null, v(J.hips));
  for (const name of ['spine', 'chest', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'thighL', 'thighR', 'kneeL', 'kneeR', 'footL', 'footR']) bone(name, PARENT[name], v(J[name]));
  for (const s of ['L', 'R']) for (let i = 0; i < 4; i++) bone('finger' + s + i, 'hand' + s, v(J['hand' + s]));
  byName.hips.updateMatrixWorld(true);
  const index = name => bones.indexOf(byName[name]);

  // ---- geometry: capsules between joints, each bound to one bone (the torso blends three) ----
  const parts = [];
  function skinTo(g, bi, weightOf) {
    const n = g.attributes.position.count, idx = new Uint16Array(n * 4), wt = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      const w = weightOf ? weightOf(g.attributes.position.getY(i)) : [[bi, 1]];
      for (let k = 0; k < w.length && k < 4; k++) { idx[i * 4 + k] = w[k][0]; wt[i * 4 + k] = w[k][1]; }
    }
    g.setAttribute('skinIndex', new THREE.BufferAttribute(idx, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(wt, 4));
    parts.push(g); return g;
  }
  const up = new THREE.Vector3(0, 1, 0);
  function capsule(a, b, r, boneName, segs) {
    const pa = v(a), pb = v(b), dir = pb.clone().sub(pa), len = dir.length();
    const g = new THREE.CapsuleGeometry(r, len, 3, segs || 8);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()));
    g.translate((pa.x + pb.x) / 2, (pa.y + pb.y) / 2, (pa.z + pb.z) / 2);
    return skinTo(g, index(boneName));
  }
  // torso: far too narrow, a tapered cylinder flattened front to back, blended hips -> spine -> chest by height
  const torso = new THREE.CylinderGeometry(0.21, 0.15, 0.86, 12, 6);
  torso.scale(1, 1, 0.55); torso.translate(0, 1.59, 0);
  skinTo(torso, 0, y => {
    if (y < J.spine[1]) { const t = THREE.MathUtils.smoothstep(y, 1.28, J.spine[1]); return [[index('hips'), 1 - t], [index('spine'), t]]; }
    const t = THREE.MathUtils.smoothstep(y, J.spine[1], J.chest[1]); return [[index('spine'), 1 - t], [index('chest'), t]];
  });
  capsule(J.neck, J.head, 0.035, 'neck', 6);
  for (const s of ['L', 'R']) {
    capsule(J['shoulder' + s], J['elbow' + s], 0.0275, 'shoulder' + s);
    capsule(J['elbow' + s], J['hand' + s], 0.0275, 'elbow' + s);
    const palm = new THREE.SphereGeometry(0.035, 8, 6); palm.scale(1, 0.8, 0.6); palm.translate(J['hand' + s][0], J['hand' + s][1], 0); skinTo(palm, index('hand' + s));
    for (let i = 0; i < 4; i++) {
      const ang = (i - 1.5) * FINGER_SPREAD, len = FINGER_LEN * ((i === 0 || i === 3) ? 0.82 : 1);
      const h = J['hand' + s];
      capsule(h, [h[0] + Math.sin(ang) * len, h[1] - Math.cos(ang) * len, 0], 0.009, 'finger' + s + i, 5);
    }
    capsule(J['thigh' + s], J['knee' + s], 0.0375, 'thigh' + s);
    capsule(J['knee' + s], J['foot' + s], 0.0375, 'knee' + s);
    const foot = new THREE.BoxGeometry(0.09, 0.05, 0.24, 1, 1, 1); foot.translate(J['foot' + s][0], 0.025, 0.06); skinTo(foot, index('foot' + s));
  }
  const geometry = mergeGeometries(parts, false);
  geometry.computeBoundingSphere();
  const mesh = new THREE.SkinnedMesh(geometry, body);
  mesh.name = 'walker'; mesh.castShadow = true; mesh.frustumCulled = false;
  mesh.add(byName.hips);
  mesh.bind(new THREE.Skeleton(bones));

  // ---- the head: an ellipsoid on the head bone with the face on its front; not skinned, it just rides the bone ----
  const head = byName.head;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), body); skull.scale.set(0.115, 0.175, 0.125); skull.position.set(0, 0.18, 0); skull.castShadow = true; skull.name = 'skull';
  const face = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), skin); face.scale.set(0.085, 0.13, 0.05); face.position.set(0, 0.165, 0.085); face.name = 'face';
  const eyes = []; const pupils = [];
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), eye); e.scale.set(0.016, 0.012, 0.01); e.position.set(sx * 0.036, 0.195, 0.118); eyes.push(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4), body); p.scale.set(0.006, 0.006, 0.004); p.position.set(sx * 0.036, 0.195, 0.128); pupils.push(p);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), body); mouth.scale.set(0.028, 0.012, 0.012); mouth.position.set(0, 0.085, 0.115); mouth.name = 'mouth';
  head.add(skull, face, ...eyes, ...pupils, mouth);

  // ---- clips, baked from poses: the mixer plays them exactly as it would clips from a file ----
  const animated = ['hips', 'spine', 'chest', 'neck', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'thighL', 'thighR', 'kneeL', 'kneeR', 'footL', 'footR', 'fingerL0', 'fingerL1', 'fingerL2', 'fingerL3', 'fingerR0', 'fingerR1', 'fingerR2', 'fingerR3'];
  const upper = ['chest', 'neck', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'fingerL0', 'fingerL1', 'fingerL2', 'fingerL3', 'fingerR0', 'fingerR1', 'fingerR2', 'fingerR3'];
  const rest = {}; for (const n of animated) rest[n] = { p: byName[n].position.clone(), q: byName[n].quaternion.clone() };
  const E = new THREE.Euler();
  // rotations are relative to the hanging rest pose: a limb points down its bone, x swings it (negative = forward, +z), z spreads it outward
  const rot = (name, x, y, z) => byName[name].quaternion.setFromEuler(E.set(x, y || 0, z || 0, 'XYZ'));
  function resetPose() { for (const n of animated) { byName[n].position.copy(rest[n].p); byName[n].quaternion.copy(rest[n].q); } }
  function bake(name, duration, frames, poseFn, names) {
    const times = [], quats = {}, hipsPos = [];
    for (const n of names) quats[n] = [];
    for (let f = 0; f <= frames; f++) {
      const t = f / frames; times.push(t * duration);
      resetPose(); poseFn(t);
      for (const n of names) { const q = byName[n].quaternion; quats[n].push(q.x, q.y, q.z, q.w); }
      if (names.includes('hips')) hipsPos.push(byName.hips.position.x, byName.hips.position.y, byName.hips.position.z);
    }
    const tracks = names.map(n => new THREE.QuaternionKeyframeTrack(n + '.quaternion', times, quats[n]));
    if (names.includes('hips')) tracks.push(new THREE.VectorKeyframeTrack('hips.position', times, hipsPos));
    resetPose();
    return new THREE.AnimationClip(name, duration, tracks);
  }
  const walkPose = t => {
    const g = t * TAU;
    const bob = Math.abs(Math.sin(g)) * 0.05, sway = Math.sin(g) * 0.035;
    byName.hips.position.set(sway, J.hips[1] + bob, 0);
    rot('spine', -0.04, 0, -sway * 0.6);
    rot('chest', -0.06, Math.sin(g) * 0.06, 0);
    rot('neck', 0.04, 0, 0);
    for (const s of ['L', 'R']) {
      const sg = s === 'R' ? 1 : -1;
      const ph = g + (sg > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph));
      rot('thigh' + s, Math.cos(ph) * 0.42, 0, 0);          // forward at touch-down, back as it leaves the ground
      rot('knee' + s, lift * 0.95, 0, 0);                    // bends while it swings through
      rot('foot' + s, -lift * 0.35, 0, 0);
      const ap = g + (sg > 0 ? 0 : Math.PI);
      rot('shoulder' + s, Math.sin(ap) * 0.09, 0, sg * 0.02);   // arms hang to the knees and barely swing
      rot('elbow' + s, 0.03, 0, 0);
      rot('hand' + s, 0, 0, 0);
    }
  };
  const idlePose = t => {
    const g = t * TAU;
    byName.hips.position.set(0, J.hips[1] + Math.sin(g) * 0.012, 0);
    rot('spine', -0.03 + Math.sin(g) * 0.015, 0, 0);
    rot('chest', -0.05 + Math.sin(g + 1) * 0.02, 0, 0);
    rot('neck', 0.04, 0, 0);
    for (const s of ['L', 'R']) { const sg = s === 'R' ? 1 : -1; rot('shoulder' + s, Math.sin(g + sg) * 0.03, 0, sg * 0.02); rot('elbow' + s, 0.03, 0, 0); }
  };
  // the reach: arms up and forward, elbows out, fingers spread and curled toward you; baked as a delta over the rest pose
  const reachPose = () => {
    rot('chest', -0.16, 0, 0);
    rot('neck', 0.1, 0, 0);
    for (const s of ['L', 'R']) {
      const sg = s === 'R' ? 1 : -1;
      rot('shoulder' + s, -1.2, 0, sg * 0.4);
      rot('elbow' + s, -0.35, 0, -sg * 0.3);
      rot('hand' + s, -0.35, 0, 0);
      for (let i = 0; i < 4; i++) rot('finger' + s + i, -0.7, 0, (i - 1.5) * 0.14);
    }
  };
  const walk = bake('walk', 1, 32, walkPose, animated);
  const idle = bake('idle', 4, 48, idlePose, animated);
  const reach = bake('reach', 1, 1, reachPose, upper);
  const restClip = bake('rest', 1, 1, () => {}, upper);
  const exportClips = [walk, idle, reach.clone()];           // the pose itself, for a file; the mixer gets the additive version
  THREE.AnimationUtils.makeClipAdditive(reach, 0, restClip);

  const root = new THREE.Group(); root.name = 'walkerRoot'; root.add(mesh);
  const hulls = [addHull(mesh, hullMat), addHull(skull, hullMat)];
  const view = makeCharacterView({
    name: 'the walker (procedural)', root, clips: [walk, idle, reach], roles: { walk: 'walk', idle: 'idle', reach: 'reach' },
    height: WALKER.h, stride: 2 / WALKER.stepRate, materials: [body, skin, eye], hulls, headBone: head, mouth, additiveReach: true,
  });
  view.exportClips = exportClips; view.bones = bones; view.skinnedMesh = mesh;
  return view;
}
