// ---------- the Three.js view: renderer, camera, the field, the thing, the post stack, quality tiers ----------
// It reads the model's snapshot and never writes to the model. Everything expensive lives here; the model and the
// input path do not know it exists.
import * as THREE from 'three';
import { patchFogToExponential, createSharedUniforms, createHullMaterial, srgb } from './materials.js';
import { buildField } from './scene.js';
import { buildWalker } from './walker.js';
import { createPost } from './post.js';
import { createLoader, characterFromGLTF, exportGLB } from './loader.js';
import { createStats } from './stats.js';

// what each tier switches: the levers the report lists, in the order they usually pay off
export const TIERS = {
  low: { maxRatio: 1, bloom: false, ink: false, shadows: false, mistScale: 0.45, msaa: false },
  medium: { maxRatio: 1.5, bloom: true, ink: false, shadows: false, mistScale: 0.7, msaa: true },
  high: { maxRatio: 3, bloom: true, ink: true, shadows: true, mistScale: 1, msaa: true },
};
export const TIER_ORDER = ['low', 'medium', 'high'];

// a pool of shell casings: never allocated after start, thrown to the right of the eye on every shot
function createCasings(scene, n) {
  const geo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.018, 6);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: srgb([190, 150, 70]), metalness: 0.7, roughness: 0.35 }), n);
  mesh.name = 'casings'; mesh.frustumCulled = false; mesh.castShadow = true;
  const slots = []; for (let i = 0; i < n; i++) slots.push({ live: false, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), w: new THREE.Vector3(), bounces: 0, life: 0 });
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), ZERO = new THREE.Vector3(0, 0, 0);
  let next = 0;
  for (let i = 0; i < n; i++) { M.compose(ZERO, Q, S.set(0, 0, 0)); mesh.setMatrixAt(i, M); }
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
  return {
    mesh,
    spawn(yaw) {
      const s = slots[next]; next = (next + 1) % n;
      const rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = Math.sin(yaw), fz = Math.cos(yaw);     // right and forward of the eye
      s.live = true; s.bounces = 0; s.life = 0;
      s.p.set(rx * 0.22 + fx * 0.35, 1.35, rz * 0.22 + fz * 0.35);
      const k = 1.3 + Math.random() * 0.8;
      s.v.set(rx * k + fx * (Math.random() - 0.5) * 0.5, 1.6 + Math.random() * 0.6, rz * k + fz * (Math.random() - 0.5) * 0.5);
      s.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); s.w.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);
    },
    update(dt) {
      let any = false;
      for (let i = 0; i < n; i++) {
        const s = slots[i]; if (!s.live) continue;
        any = true; s.life += dt;
        s.v.y -= 9.8 * dt; s.p.addScaledVector(s.v, dt);
        s.r.x += s.w.x * dt; s.r.y += s.w.y * dt; s.r.z += s.w.z * dt;
        if (s.p.y < 0.012) { s.p.y = 0.012; s.v.y = -s.v.y * 0.35; s.v.x *= 0.6; s.v.z *= 0.6; s.w.multiplyScalar(0.4); if (++s.bounces > 3) { s.v.set(0, 0, 0); s.w.set(0, 0, 0); } }
        if (s.life > 8) { s.live = false; S.set(0, 0, 0); } else S.set(1, 1, 1);
        M.compose(s.p, Q.setFromEuler(s.r), S); mesh.setMatrixAt(i, M);
      }
      if (any) mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

export function createView(o) {
  const canvas = o.canvas, model = o.model, settings = o.settings;
  patchFogToExponential();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, stencil: false, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.NeutralToneMapping;   // linear through the shadows: the palette's dark values come out as authored
  renderer.info.autoReset = false;      // the counters cover the whole frame (every pass), reset once per frame below
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 2000);
  camera.position.set(0, model.eyeH, 0);
  const field = buildField(scene);
  const shared = createSharedUniforms();
  shared.uMoonDir.value.copy(field.moonDir);
  const moonBase = shared.uMoonColor.value.clone(), lampBase = shared.uLightIntensity.value, moonLightBase = field.moonLight.intensity, lampLightBase = field.lamp.intensity;
  const hullMat = createHullMaterial({ width: settings.outlineWidth });
  const stats = createStats();
  const loader = createLoader(renderer);
  let post = createPost(renderer, scene, camera, { samples: settings.msaa ? 4 : 0 });
  const casings = createCasings(scene, 24);
  const flash = new THREE.PointLight(srgb([255, 225, 180]), 0, 7, 2); flash.position.set(0.3, 1.4, 0.4); scene.add(flash);
  const characters = []; let character = null;
  const pbr = new WeakMap();   // toon material -> its PBR stand-in, for the comparison toggle
  let W = 1, H = 1, tier = 'high';

  function setCharacter(cv) {
    if (character) scene.remove(character.root);
    character = cv; scene.add(cv.root); cv.root.rotation.y = Math.PI;   // it faces +z in its own frame; the player is at the origin, behind it
    applyLook();
  }
  function addCharacter(cv) { characters.push(cv); return cv; }
  function applyLook() {
    shared.uSteps.value = settings.steps; shared.uRim.value = settings.rim;
    shared.uMoonColor.value.copy(moonBase).multiplyScalar(settings.moon); shared.uLightIntensity.value = lampBase * settings.lamp;
    field.moonLight.intensity = moonLightBase * settings.moon; field.lamp.intensity = lampLightBase * settings.lamp; field.hemi.intensity = 0.7 * (0.6 + 0.4 * settings.moon);
    scene.fog.density = 1 / settings.fogDist;
    renderer.toneMappingExposure = settings.exposure;
    hullMat.uniforms.uWidth.value = settings.outlineWidth;
    post.configure(Object.assign({}, settings, { bloom: settings.bloom && TIERS[tier].bloom, ink: settings.ink && TIERS[tier].ink }));
    field.setMist(Math.round(26 * settings.mist * TIERS[tier].mistScale));
    field.setShadows(settings.shadows && TIERS[tier].shadows);
    if (character) {
      character.setOutline(settings.outline); character.jerk = settings.jerk;
      character.root.traverse(ob => {
        if (!ob.isMesh || ob.userData.hull) return;
        const mats = Array.isArray(ob.material) ? ob.material : [ob.material];
        const out = mats.map(m => {
          if (settings.pbr && m.userData.toon) { let s = pbr.get(m); if (!s) { s = new THREE.MeshStandardMaterial({ color: m.uniforms.uColor.value, map: m.uniforms.uMap.value, roughness: 0.85, metalness: 0 }); s.userData.pbrFor = m; pbr.set(m, s); } return s; }
          if (!settings.pbr && m.userData.pbrFor) return m.userData.pbrFor;
          return m;
        });
        ob.material = Array.isArray(ob.material) ? out : out[0];
      });
    }
  }
  function applyTier(t) {
    tier = TIERS[t] ? t : 'high';
    const q = TIERS[tier];
    const pr = Math.min(window.devicePixelRatio || 1, settings.pixelRatio, q.maxRatio);
    renderer.setPixelRatio(pr);
    const samples = settings.msaa && q.msaa ? 4 : 0;
    if (post.composer.renderTarget1.samples !== samples) { post.dispose(); post = createPost(renderer, scene, camera, { samples }); }
    resize(); applyLook();
  }
  function resize() {
    W = Math.max(1, window.innerWidth); H = Math.max(1, window.innerHeight);
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    post.setSize(W, H, pr);
    hullMat.uniforms.uResolution.value.set(W * pr, H * pr);
    model.setViewport(W, H);
  }

  const fwd = new THREE.Vector3(), at = new THREE.Vector3();
  let lampPulse = 0;
  function render(snap, dt, events) {
    stats.begin();
    renderer.info.reset();
    for (const e of events) {
      if (e.type === 'shot') { casings.spawn(snap.yaw); flash.intensity = 60; }
      else if (e.type === 'heartbeat') lampPulse = e.strength;
    }
    // the camera: the model's yaw and pitch, the zoom, and the shake as a small jitter of the view
    const j = snap.shake * 0.01;
    const yaw = snap.yaw + (Math.random() - 0.5) * j, pitch = snap.pitch + (Math.random() - 0.5) * j;
    fwd.set(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camera.position.set(0, model.eyeH, 0);
    camera.lookAt(at.copy(camera.position).add(fwd));
    if (camera.zoom !== snap.zoom) { camera.zoom = snap.zoom; camera.updateProjectionMatrix(); }
    // the thing, on the lane, its feet where the model says (and rising during the lunge)
    if (character) {
      character.root.position.set(0, snap.yOff, snap.dist);
      character.update(dt, snap, snap.t);
    }
    field.update(dt, snap.t, snap);
    flash.intensity *= Math.exp(-dt * 20);
    lampPulse *= Math.exp(-dt * 4);
    field.lamp.intensity = lampLightBase * settings.lamp * (1 + 0.35 * lampPulse);
    shared.uLightIntensity.value = lampBase * settings.lamp * (1 + 0.35 * lampPulse);
    casings.update(dt);
    const u = post.uniforms;
    u.uTime.value = snap.t; u.uDanger.value = snap.danger; u.uFlash.value = Math.min(1, snap.flash);
    u.uFade.value = snap.state === 'caught' ? 1 : snap.state === 'dying' && model.stateT > 0.97 ? Math.min(1, (model.stateT - 0.97) / 0.4) : 0;
    post.render(dt);
    stats.end();
  }
  async function loadModel(source, name) {
    const gltf = typeof source === 'string' ? await loader.load(source) : await loader.parse(source);
    const cv = characterFromGLTF(gltf, { shared, hullMat, name: name || (typeof source === 'string' ? source.split('/').pop() : 'dropped model') });
    addCharacter(cv); setCharacter(cv);
    return cv;
  }
  // export the current character to a GLB in memory and load that back: the whole pipeline without a file on disk
  async function roundtrip() {
    const buf = await exportGLB(character);
    const gltf = await loader.parse(buf.slice(0));
    let bones = 0, skinned = 0, meshes = 0;
    gltf.scene.traverse(ob => { if (ob.isBone) bones++; if (ob.isSkinnedMesh) skinned++; if (ob.isMesh) meshes++; });
    const cv = characterFromGLTF(gltf, { shared, hullMat, name: character.name + ' (reimported)' });
    addCharacter(cv); setCharacter(cv);
    return { bytes: buf.byteLength, clips: gltf.animations.map(c => c.name), bones, skinned, meshes, roles: Object.assign({}, cv.roles) };
  }
  function info() {
    const s = stats.sample(renderer);
    return Object.assign(s, { tier, pixelRatio: renderer.getPixelRatio(), width: W, height: H, bloom: post.bloom.enabled, ink: post.ink.enabled, shadows: field.moonLight.castShadow, character: character ? character.name : null });
  }
  const walker = addCharacter(buildWalker({ shared, hullMat }));
  setCharacter(walker);
  applyTier(settings.quality === 'auto' ? 'high' : settings.quality);
  return {
    renderer, scene, camera, field, shared, hullMat, stats, characters, loader, casings,
    get character() { return character; }, get post() { return post; }, get tier() { return tier; },
    setCharacter, applyLook, applyTier, resize, render, loadModel, roundtrip, info,
    exportCurrent: () => exportGLB(character),
  };
}
