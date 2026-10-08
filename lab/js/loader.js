// ---------- the asset path: GLB in (Draco, KTX2 and Meshopt wired), the toon look applied, GLB out ----------
// Drop any .glb on the page (or ?model=url). A Mixamo character exported from Blender as glTF with its clips
// arrives here, gets its feet put on the floor, its materials swapped for the toon shader (keeping its colour
// and albedo map), an ink hull, and its clips mapped to walk / idle / reach. Export writes the current character
// back out as a .glb so the loader can be tested without any file in the repository.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createToonMaterial, addHull } from './materials.js';
import { makeCharacterView } from './character.js';

export function createLoader(renderer) {
  const base = new URL('../vendor/three/addons/libs/', import.meta.url).href;
  const draco = new DRACOLoader().setDecoderPath(base + 'draco/gltf/').setWorkerLimit(2);
  const ktx2 = new KTX2Loader().setTranscoderPath(base + 'basis/').setWorkerLimit(2);
  ktx2.detectSupport(renderer);
  const gltf = new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder);
  return {
    gltf,
    load(url) { return gltf.loadAsync(url); },
    parse(buffer) { return new Promise((ok, err) => gltf.parse(buffer, '', ok, err)); },
    dispose() { draco.dispose(); ktx2.dispose(); },
  };
}

// a loaded scene -> a character view the lab can drive
export function characterFromGLTF(gltf, o) {
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  // feet on the floor, centred; centimetre exports (a height over 10 m) scaled down; an explicit height wins
  const wrap = new THREE.Group(); wrap.name = 'glbRoot';
  let k = size.y > 10 ? 0.01 : 1;
  if (o.height) k = o.height / size.y;
  scene.position.set(-center.x * k, -box.min.y * k, -center.z * k); scene.scale.setScalar(k);
  wrap.add(scene);
  const materials = [], hulls = [], meshes = [];
  scene.traverse(ob => { if (ob.isMesh && !ob.userData.hull) meshes.push(ob); });   // collected first: a hull is a new child, and must not be visited
  for (const ob of meshes) {
    const mats = Array.isArray(ob.material) ? ob.material : [ob.material];
    const toons = mats.map(m => { const t = createToonMaterial(o.shared, { name: m.name || 'toon', color: m.color ? m.color.clone() : [128, 128, 128], map: m.map || null }); materials.push(t); return t; });
    ob.material = Array.isArray(ob.material) ? toons : toons[0];
    ob.castShadow = true; ob.frustumCulled = false;
    hulls.push(addHull(ob, o.hullMat));
  }
  let headBone = null, neck = null;
  scene.traverse(ob => { if (ob.isBone) { if (!headBone && /head/i.test(ob.name)) headBone = ob; if (!neck && /neck/i.test(ob.name)) neck = ob; } });
  const height = size.y * k;
  return makeCharacterView({
    name: o.name || 'dropped model', root: wrap, clips: gltf.animations || [], roles: o.roles, height, stride: o.stride || height * 0.75,
    materials, hulls, headBone: headBone || neck, additiveReach: false,
  });
}

// the current character as a binary glTF, clips included; the toon shaders go out as standard materials with the same colour and map
export async function exportGLB(view) {
  const swapped = [];
  view.root.traverse(ob => {
    if (!ob.isMesh || ob.userData.hull) return;
    const mats = Array.isArray(ob.material) ? ob.material : [ob.material];
    const std = mats.map(m => m.userData.toon ? new THREE.MeshStandardMaterial({ name: m.name, color: m.uniforms.uColor.value.clone(), map: m.uniforms.uMap.value, roughness: 0.9 }) : m);
    swapped.push([ob, ob.material]); ob.material = Array.isArray(ob.material) ? std : std[0];
  });
  const hidden = view.hulls.filter(h => h.visible); for (const h of hidden) h.visible = false;
  try {
    const exporter = new GLTFExporter();
    return await exporter.parseAsync(view.root, { binary: true, animations: view.exportClips || view.clips, onlyVisible: true });
  } finally {
    for (const [ob, m] of swapped) ob.material = m;
    for (const h of hidden) h.visible = true;
  }
}
export function download(buffer, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buffer], { type: 'model/gltf-binary' })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
