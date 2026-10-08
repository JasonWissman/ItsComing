// ---------- night 1's field in 3D: the house around you, the field, the fences, the trees, the moon ----------
// Built from the same numbers as js/levels/night01.js and the scenery builders in js/icons.js. Repeated things
// (trees, fence posts, tufts) are InstancedMeshes: one draw call per kind, as the report recommends for
// repeated scenery, and the stats panel shows the difference.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { srgb, createGradientMap } from './materials.js';

export const PAL = { skyTop: [6, 8, 18], fog: [46, 52, 68], ground: [36, 46, 32], fogDist: 105 };
const DEG = Math.PI / 180;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// ---- procedural textures (CanvasTexture): planks, a soft radial blob, a cloud, a ground noise ----
function canvas(n, draw) { const c = document.createElement('canvas'); c.width = c.height = n; draw(c.getContext('2d'), n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function planksTexture(boards, seed) {
  const rng = mulberry32(seed);
  const t = canvas(256, (x, n) => {
    const bh = n / boards;
    for (let i = 0; i < boards; i++) {
      const v = 205 + rng() * 50; x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
      x.fillRect(0, i * bh + 2, n, bh - 4);
      x.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 6; k++) x.fillRect(rng() * n, i * bh + 2 + rng() * (bh - 4), 20 + rng() * 60, 1);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function noiseTexture(seed) {
  const rng = mulberry32(seed);
  const t = canvas(256, (x, n) => {
    const img = x.createImageData(n, n);
    for (let i = 0; i < img.data.length; i += 4) { const v = 215 + rng() * 40; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function blobTexture(rgb) {
  return canvas(128, (x, n) => { const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); g.addColorStop(0, 'rgba(' + rgb + ',1)'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); x.fillStyle = g; x.fillRect(0, 0, n, n); });
}
function cloudTexture(seed) {
  const rng = mulberry32(seed);
  return canvas(256, (x, n) => {
    for (let k = 0; k < 5; k++) {
      const cx = n * (0.2 + rng() * 0.6), cy = n * (0.35 + rng() * 0.3), r = n * (0.14 + rng() * 0.16);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n);
    }
  });
}

export function buildField(scene, o) {
  const grad = createGradientMap(3);
  const toon = (rgb, extra) => new THREE.MeshToonMaterial(Object.assign({ color: srgb(rgb), gradientMap: grad }, extra || {}));
  const field = { update: null, setMist: null, setShadows: null, dispose: null };
  const disposables = [];
  scene.fog = new THREE.FogExp2(srgb(PAL.fog), 1 / PAL.fogDist);

  // ---- sky: a dome whose colour comes from the angle above the horizon, like the game's sky bands ----
  const sky = new THREE.Mesh(new THREE.SphereGeometry(950, 32, 16), new THREE.ShaderMaterial({
    uniforms: { uTop: { value: srgb(PAL.skyTop) }, uFog: { value: srgb(PAL.fog) } },
    vertexShader: 'varying vec3 vDir; void main() { vDir = normalize( position ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
    fragmentShader: 'uniform vec3 uTop, uFog; varying vec3 vDir; void main() { float ang = asin( clamp( vDir.y, -1.0, 1.0 ) ); float k = clamp( ang / ( 3.14159 / 2.6 ), 0.0, 1.0 ); gl_FragColor = vec4( mix( uFog, uTop, pow( k, 0.6 ) ), 1.0 ); }',
    side: THREE.BackSide, depthWrite: false, fog: false,
  }));
  sky.name = 'sky'; sky.userData.noInk = true; sky.renderOrder = -10; scene.add(sky);

  // ---- ground: one plane, a faint noise so the fog has something to swallow ----
  const groundTex = noiseTexture(5); groundTex.repeat.set(300, 300);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), toon(PAL.ground, { map: groundTex }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.name = 'ground'; scene.add(ground);

  // ---- the house you stand in (SC.doorway, SC.wallV, SC.box ... from night01) ----
  const house = new THREE.Group(); house.name = 'house'; scene.add(house);
  const wallTex = planksTexture(9, 3); wallTex.repeat.set(3, 1);
  const wood = toon([50, 40, 33], { map: wallTex }), woodD = toon([38, 30, 25], { map: wallTex }), frame = toon([96, 76, 52]);
  const floorTex = planksTexture(8, 7); floorTex.repeat.set(4, 4); floorTex.rotation = Math.PI / 2; floorTex.center.set(0.5, 0.5);
  const box = (x0, x1, y0, y1, z0, z1, mat, shadow) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = !!shadow; m.receiveShadow = true; house.add(m); return m;
  };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.0), toon([46, 37, 30], { map: floorTex }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.006, 0.1); floor.receiveShadow = true; house.add(floor);
  box(-2.8, 2.8, 2.7, 2.82, -2.4, 2.6, toon([30, 24, 20]));                         // ceiling
  // north wall with the back door (1.6 wide, 2.12 high), south wall with the front door (1.4 wide)
  box(-7, -0.8, 0, 2.7, 2.6, 2.72, wood, true); box(0.8, 7, 0, 2.7, 2.6, 2.72, wood, true); box(-0.8, 0.8, 2.12, 2.7, 2.6, 2.72, wood);
  box(-7, -0.7, 0, 2.7, -2.52, -2.4, woodD, true); box(0.7, 7, 0, 2.7, -2.52, -2.4, woodD, true); box(-0.7, 0.7, 2.12, 2.7, -2.52, -2.4, woodD);
  box(-2.92, -2.8, 0, 2.7, -2.4, 2.6, woodD, true); box(2.8, 2.92, 0, 2.7, -2.4, 2.6, woodD, true);   // side walls
  // door frames and the steps outside
  for (const [z, w, dz] of [[2.6, 0.8, 0.02], [-2.4, 0.7, -0.02]]) { box(-w - 0.12, -w, 0, 2.22, z - 0.08 + dz, z + 0.08 + dz, frame); box(w, w + 0.12, 0, 2.22, z - 0.08 + dz, z + 0.08 + dz, frame); box(-w - 0.12, w + 0.12, 2.1, 2.22, z - 0.08 + dz, z + 0.08 + dz, frame); }
  box(-1.1, 1.1, 0, 0.16, 2.6, 3.3, toon([74, 70, 64])); box(-1.0, 1.0, 0, 0.16, -3.1, -2.4, toon([74, 70, 64]));
  // the window beside the front door with a little moonlight in it
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), new THREE.MeshBasicMaterial({ color: srgb([36, 42, 60]) })); glass.position.set(1.85, 1.55, -2.39); house.add(glass);
  box(1.82, 1.88, 1.1, 2.0, -2.395, -2.385, woodD); box(1.3, 2.4, 1.52, 1.58, -2.395, -2.385, woodD);
  // furniture: the table east, the shelf west, the chair south-west, the lamp on the table (unlit, the thread through every night)
  box(1.5, 2.6, 0.72, 0.78, -0.55, 0.45, toon([74, 56, 42]), true);
  for (const [x, z] of [[1.55, -0.5], [2.55, -0.5], [1.55, 0.4], [2.55, 0.4]]) box(x - 0.04, x + 0.04, 0, 0.72, z - 0.04, z + 0.04, toon([62, 46, 34]));
  box(-2.78, -2.45, 1.22, 1.28, -0.2, 1.3, toon([66, 52, 40]), true);
  box(-2.2, -1.7, 0.42, 0.48, -2.1, -1.6, toon([68, 52, 40]), true); box(-2.2, -1.7, 0.48, 1.0, -2.1, -2.04, toon([68, 52, 40]));
  const lampMat = toon([70, 62, 50]);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 12), lampMat); lampBase.position.set(1.85, 0.795, -0.05); house.add(lampBase);
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), lampMat); lampStem.position.set(1.85, 0.93, -0.05); house.add(lampStem);
  const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.14, 12, 1, true), toon([120, 100, 70], { side: THREE.DoubleSide })); lampShade.position.set(1.85, 1.1, -0.05); lampShade.castShadow = true; house.add(lampShade);
  // the front door leaf, ajar in its frame
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.08, 0.05), toon([58, 46, 36])); leaf.position.set(0.7, 1.04, 0); leaf.castShadow = true;
  const hinge = new THREE.Group(); hinge.position.set(-0.7, 0, -2.36); hinge.rotation.y = -10 * DEG; hinge.add(leaf); house.add(hinge);

  // ---- outside: the lane and road to the south, the dark patches, the fences ----
  const flat = (x0, z0, x1, z1, y, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); return m; };
  flat(-1.1, -40, 1.1, -2.6, 0.012, toon([58, 54, 46]));
  flat(-80, -42, 80, -36, 0.01, toon([40, 40, 44]));
  const rng = mulberry32(11);
  const patchGeo = new THREE.CircleGeometry(1, 8); patchGeo.rotateX(-Math.PI / 2);
  const patches = new THREE.InstancedMesh(patchGeo, toon([30, 38, 26]), 90); patches.name = 'patches';
  const M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();
  let np = 0;
  for (let i = 0; i < 90; i++) { const x = (rng() - 0.5) * 100, z = -6 - Math.pow(rng(), 1.4) * 30; if (Math.abs(x) < 1.4) continue; const sz = 0.15 + rng() * 0.25; M.compose(P.set(x, 0.008, z), Q.identity(), S.set(sz, 1, sz * 0.4)); patches.setMatrixAt(np++, M); }
  patches.count = np; patches.receiveShadow = true; scene.add(patches);
  // grass tufts across the field (SC.groundDots: 220 of them in a 60 degree arc, 6 to 110 m out)
  const tuftGeo = new THREE.ConeGeometry(1, 1, 5); tuftGeo.translate(0, 0.5, 0);
  const tufts = new THREE.InstancedMesh(tuftGeo, toon([28, 36, 24]), 220); tufts.name = 'tufts';
  const trng = mulberry32(5);
  for (let i = 0; i < 220; i++) { const a = (trng() - 0.5) * 60 * DEG, d = 6 + Math.pow(trng(), 1.5) * 104; const s = 0.22 * (0.5 + trng()); M.compose(P.set(Math.sin(a) * d, 0, Math.cos(a) * d), Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), trng() * 6.28), S.set(s * 1.6, s * 1.2, s * 1.6)); tufts.setMatrixAt(i, M); }
  scene.add(tufts);
  // fences: instanced posts, rails merged into one mesh each
  function fence(x0, z0, x1, z1, spacing, postH, rgb) {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / spacing)), mat = toon(rgb);
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, postH, 0.14), mat, n + 1); posts.name = 'fencePosts';
    for (let i = 0; i <= n; i++) { M.compose(P.set(x0 + (x1 - x0) * i / n, postH / 2, z0 + (z1 - z0) * i / n), Q.identity(), S.set(1, 1, 1)); posts.setMatrixAt(i, M); }
    posts.castShadow = true; scene.add(posts);
    const rails = [];
    for (const yy of [postH * 0.45, postH * 0.85]) { const g = new THREE.BoxGeometry(len, 0.1, 0.06); g.rotateY(-Math.atan2(z1 - z0, x1 - x0)); g.translate((x0 + x1) / 2, yy, (z0 + z1) / 2); rails.push(g); }
    const r = new THREE.Mesh(mergeGeometries(rails), mat); r.name = 'fenceRails'; r.castShadow = true; scene.add(r);
  }
  fence(-45, 17, 45, 17, 2.7, 1.15, [44, 40, 34]);
  fence(-30, -14, -1.6, -14, 2.4, 1.05, [44, 40, 34]); fence(1.6, -14, 30, -14, 2.4, 1.05, [44, 40, 34]);
  for (const x of [-1.6, 1.6]) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 0.2), toon([52, 46, 38])); g.position.set(x, 0.65, -14); scene.add(g); }

  // ---- trees: a few variants of each kind, instanced, placed where the game places them ----
  const trunkC = srgb([26, 22, 20]), leafC = srgb([20, 18, 18]);
  function colored(g, c) { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
  function stick(a, b, r0, r1) { const d = b.clone().sub(a), len = d.length(); const g = new THREE.CylinderGeometry(r1, r0, len, 5, 1); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); return g; }
  function bareTree(seed) {   // unit height; the game's bare tree: a trunk, nine branches each with a twig, a spike on top
    const r = mulberry32(seed), parts = [], w = 0.8;
    parts.push(stick(new THREE.Vector3(0, -0.02, 0), new THREE.Vector3(0.02, 0.75, 0), 0.028, 0.014));
    parts.push(stick(new THREE.Vector3(0.02, 0.75, 0), new THREE.Vector3(0.05, 0.98, 0), 0.012, 0.004));
    for (let i = 0; i < 9; i++) {
      const y0 = 0.35 + r() * 0.45, a = (r() - 0.5) * 2.2, len = (0.18 + r() * 0.3) * w, a2 = (r() - 0.5) * 1.5, spin = r() * 6.28;
      const p0 = new THREE.Vector3(0.01, y0, 0), p1 = new THREE.Vector3(Math.sin(a) * len, y0 + Math.cos(a) * len, 0), p2 = p1.clone().add(new THREE.Vector3(Math.sin(a + a2) * len * 0.6, Math.cos(a + a2) * len * 0.6, 0));
      const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin);
      p1.applyQuaternion(rot); p2.applyQuaternion(rot);
      parts.push(stick(p0, p1, 0.012, 0.006)); parts.push(stick(p1, p2, 0.006, 0.002));
    }
    return colored(mergeGeometries(parts), trunkC);
  }
  function roundTree(seed) {
    const r = mulberry32(seed), parts = [];
    // icosahedra are non-indexed and cylinders indexed: mergeGeometries needs them alike
    parts.push(colored(stick(new THREE.Vector3(0, -0.02, 0), new THREE.Vector3(0, 0.55, 0), 0.04, 0.025).toNonIndexed(), trunkC));
    for (let i = 0; i < 6; i++) { const g = new THREE.IcosahedronGeometry(1, 1); const br = 0.18 + r() * 0.16; g.scale(br * 0.8, br * 0.9, br * 0.8); g.translate((r() - 0.5) * 0.5, 0.55 + r() * 0.35, (r() - 0.5) * 0.4); parts.push(colored(g, leafC)); }
    return mergeGeometries(parts);
  }
  const treeMat = new THREE.MeshToonMaterial({ color: 0xffffff, vertexColors: true, gradientMap: grad });
  const placements = { bare: [], round: [] };
  const place = (x, z, h, kind, seed) => placements[kind].push([x, z, h, seed]);
  const prng = mulberry32(11);
  for (let i = 0; i < 32; i++) { const x = (prng() * 2 - 1) * 120, z = 60 + prng() * 70; place(x, z, 7 + prng() * 7, 'bare', (prng() * 1e6) | 0); }
  for (let i = 0; i < 7; i++) { const x = (prng() * 2 - 1) * 60, z = 24 + prng() * 26; const h = 5 + prng() * 5, kind = prng() < 0.5 ? 'bare' : 'round', seed = (prng() * 1e6) | 0; if (Math.abs(x) > 6) place(x, z, h, kind, seed); }
  for (let i = 0; i < 30; i++) { const x = (prng() * 2 - 1) * 110, z = -45 - prng() * 80; const h = 7 + prng() * 7, kind = prng() < 0.6 ? 'bare' : 'round', seed = (prng() * 1e6) | 0; if (Math.abs(x) >= 5) place(x, z, h, kind, seed); }
  for (let i = 0; i < 8; i++) { const x = (prng() < 0.5 ? -1 : 1) * (5 + prng() * 30), z = -8 - prng() * 30; place(x, z, 5 + prng() * 6, 'round', (prng() * 1e6) | 0); }
  const treeMeshes = [];
  for (const kind of ['bare', 'round']) {
    const variants = [0, 1, 2].map(k => kind === 'bare' ? bareTree(100 + k) : roundTree(200 + k));
    const buckets = variants.map(() => []);
    placements[kind].forEach((p, i) => buckets[i % variants.length].push(p));
    variants.forEach((g, k) => {
      if (!buckets[k].length) return;
      const im = new THREE.InstancedMesh(g, treeMat, buckets[k].length); im.name = kind + 'Trees' + k;
      buckets[k].forEach((p, i) => { M.compose(P.set(p[0], 0, p[1]), Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (p[3] % 628) / 100), S.set(p[2], p[2], p[2])); im.setMatrixAt(i, M); });
      im.castShadow = true; scene.add(im); treeMeshes.push(im);
    });
  }

  // ---- the moon, the stars, the clouds ----
  const D = 700, my = 24 * DEG, me = 13 * DEG;
  const moonPos = new THREE.Vector3(Math.sin(my) * D * Math.cos(me), Math.sin(me) * D, Math.cos(my) * D * Math.cos(me));
  const moonC = srgb([228, 222, 200]);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(8, 40), new THREE.MeshBasicMaterial({ color: moonC.clone().multiplyScalar(1.6), fog: false }));
  moon.position.copy(moonPos); moon.lookAt(0, 0, 0); moon.name = 'moon'; moon.userData.noInk = true; scene.add(moon);
  for (const [dx, dy, r] of [[-2.4, -1.6, 1.7], [2.0, 2.4, 1.2]]) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 16), new THREE.MeshBasicMaterial({ color: moonC.clone().multiplyScalar(1.3), fog: false })); m.position.set(dx, dy, 0.5); m.userData.noInk = true; moon.add(m); }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobTexture('228,222,200'), color: 0xffffff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  glow.position.copy(moonPos); glow.scale.set(72, 72, 1); glow.userData.noInk = true; scene.add(glow);
  const srng = mulberry32(3), starPos = [], starCol = [];
  for (let i = 0; i < 170; i++) { const yaw = srng() * 6.283, el = (4 + srng() * 70) * DEG, R = 900; starPos.push(Math.sin(yaw) * R * Math.cos(el), Math.sin(el) * R, Math.cos(yaw) * R * Math.cos(el)); const b = (0.35 + srng() * 0.65) * 0.8; starCol.push(b * 0.86, b * 0.88, b); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3)); starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starCol, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, map: blobTexture('255,255,255'), vertexColors: true, transparent: true, depthWrite: false, fog: false }));
  stars.name = 'stars'; stars.userData.noInk = true; scene.add(stars);
  const cloudTex = cloudTexture(4), crng = mulberry32(4), clouds = [];
  for (let i = 0; i < 4; i++) {
    const yaw0 = crng() * 6.283, el = (8 + crng() * 30) * DEG, w = 120 + crng() * 260, h = w * (0.18 + crng() * 0.15), drift = (0.002 + crng() * 0.004) * (crng() < 0.5 ? -1 : 1);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: srgb([34, 38, 54]), transparent: true, opacity: 0.4, depthWrite: false, fog: false }));
    s.scale.set(w, h, 1); s.userData = { yaw0, el, drift, noInk: true }; s.position.y = Math.sin(el) * 800; clouds.push(s); scene.add(s);
  }

  // ---- mist: soft flat sprites drifting slowly round the eye, as in js/weather.js ----
  const mistTex = blobTexture('180,180,190'), mrng = mulberry32(100), mist = [];
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, transparent: true, opacity: 0, depthWrite: false, fog: true }));
    const w = 2 + mrng() * 4;
    s.userData = { a: mrng() * 6.283, r: 2 + mrng() * 7, y: 0.2 + mrng() * 1.6, w, s: 0.6 + mrng() * 0.8, noInk: true };
    s.scale.set(w, w * 0.22, 1); mist.push(s); scene.add(s);
  }
  let mistCount = 18;
  field.setMist = n => { mistCount = Math.round(n); mist.forEach((s, i) => { s.visible = i < mistCount; }); };
  field.setMist(mistCount);

  // ---- light: a hemisphere for the built-in materials, the moon as a directional (the shadow caster), the lamp by the door ----
  // the palette is display colour with the night already in it: the ambient shows a surface as authored (sky
  // side a touch blue, ground side dimmer) and the moon adds its banded shading on top of that
  const hemi = new THREE.HemisphereLight(new THREE.Color(0.9, 0.93, 1.0), new THREE.Color(0.6, 0.58, 0.52), 1.0); scene.add(hemi);
  const moonDir = moonPos.clone().normalize();
  const moonLight = new THREE.DirectionalLight(srgb([150, 165, 215]), 2.4);   // a strong, cool key, so its shadows read on the field
  moonLight.position.copy(moonDir).multiplyScalar(60); moonLight.target.position.set(0, 0, 0); scene.add(moonLight, moonLight.target);
  moonLight.shadow.mapSize.set(2048, 2048); moonLight.shadow.camera.near = 1; moonLight.shadow.camera.far = 200;
  moonLight.shadow.camera.left = moonLight.shadow.camera.bottom = -16; moonLight.shadow.camera.right = moonLight.shadow.camera.top = 16;
  moonLight.shadow.bias = -0.0006; moonLight.shadow.normalBias = 0.02;
  const lamp = new THREE.PointLight(srgb([140, 160, 220]), 3.2, 4.5, 2); lamp.position.set(0, 1.6, -0.2); scene.add(lamp);
  field.setShadows = on => { moonLight.castShadow = !!on; };

  const shadowFocus = new THREE.Vector3();
  field.update = (dt, t, snap) => {
    for (const s of clouds) { const yaw = s.userData.yaw0 + t * s.userData.drift, r = 800 * Math.cos(s.userData.el); s.position.set(Math.sin(yaw) * r, s.position.y, Math.cos(yaw) * r); }
    // the game draws its mist at 11% in display space; blended in linear space the same haze needs about a third of that
    for (let i = 0; i < mistCount; i++) { const s = mist[i], u = s.userData; u.a += (0.03 + 0.3 * 0.05) * dt; s.position.set(Math.sin(u.a) * u.r, u.y, Math.cos(u.a) * u.r); s.material.opacity = 0.04 * u.s; }
    // the shadow camera follows the thing once it is close enough for its shadow to matter
    const d = Math.min(snap ? snap.dist : 0, 28);
    shadowFocus.set(0, 0, d * 0.5);
    moonLight.target.position.copy(shadowFocus); moonLight.position.copy(moonDir).multiplyScalar(60).add(shadowFocus);
  };
  field.dispose = () => { for (const d of disposables) d.dispose(); };
  Object.assign(field, { sky, ground, moon, moonLight, moonDir, lamp, hemi, mist, clouds, stars, trees: treeMeshes, house, grad });
  return field;
}
