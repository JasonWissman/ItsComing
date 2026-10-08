'use strict';
// Copies the parts of the pinned `three` package the lab imports into lab/vendor/three, so the lab runs from any
// static host (GitHub Pages included) with no build step and no CDN. Run `npm run lab:vendor` after changing the
// pinned version in package.json; the copy is committed. Only the files listed here are copied, and the script
// then checks that every relative import inside the copied addons resolves, so a missing dependency fails here
// rather than in the browser.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'node_modules', 'three');
const DST = path.join(__dirname, '..', 'vendor', 'three');

const FILES = [
  // the library itself (three.module.js imports ./three.core.js)
  ['build/three.module.js', 'three.module.js'],
  ['build/three.core.js', 'three.core.js'],
  ['LICENSE', 'LICENSE'],
  ['package.json', 'package.json'],
  // addons, kept at their examples/jsm paths under addons/ so `three/addons/...` import-map entries work
  'examples/jsm/loaders/GLTFLoader.js',
  'examples/jsm/loaders/DRACOLoader.js',
  'examples/jsm/loaders/KTX2Loader.js',
  'examples/jsm/exporters/GLTFExporter.js',
  'examples/jsm/postprocessing/EffectComposer.js',
  'examples/jsm/postprocessing/RenderPass.js',
  'examples/jsm/postprocessing/ShaderPass.js',
  'examples/jsm/postprocessing/MaskPass.js',
  'examples/jsm/postprocessing/Pass.js',
  'examples/jsm/postprocessing/UnrealBloomPass.js',
  'examples/jsm/postprocessing/OutputPass.js',
  'examples/jsm/shaders/CopyShader.js',
  'examples/jsm/shaders/LuminosityHighPassShader.js',
  'examples/jsm/shaders/OutputShader.js',
  'examples/jsm/utils/BufferGeometryUtils.js',
  'examples/jsm/utils/SkeletonUtils.js',
  'examples/jsm/utils/WorkerPool.js',
  'examples/jsm/math/ColorSpaces.js',
  'examples/jsm/libs/ktx-parse.module.js',
  'examples/jsm/libs/zstddec.module.js',
  'examples/jsm/libs/meshopt_decoder.module.js',
  // decoders: the glTF build of Draco (wasm only; the asm.js fallback is not shipped) and the Basis Universal transcoder
  'examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js',
  'examples/jsm/libs/draco/gltf/draco_decoder.wasm',
  'examples/jsm/libs/basis/basis_transcoder.js',
  'examples/jsm/libs/basis/basis_transcoder.wasm',
  'examples/jsm/libs/basis/README.md',
];

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

fs.rmSync(DST, { recursive: true, force: true });
const copied = [];
for (const f of FILES) {
  const [src, dst] = Array.isArray(f) ? f : [f, f.replace(/^examples\/jsm\//, 'addons/')];
  const from = path.join(SRC, src), to = path.join(DST, dst);
  if (!fs.existsSync(from)) { console.error('missing in node_modules/three: ' + src); process.exit(1); }
  copy(from, to);
  copied.push(to);
}
// closure check: every relative import in a copied module must point at a copied file
let bad = 0;
for (const file of copied) {
  if (!file.endsWith('.js')) continue;
  const text = fs.readFileSync(file, 'utf8');
  const re = /from\s+'(\.[^']+)'|import\s+'(\.[^']+)'|new URL\(\s*'(\.[^']+)'/g;
  let m;
  while ((m = re.exec(text))) {
    const rel = m[1] || m[2] || m[3];
    const target = path.resolve(path.dirname(file), rel);
    if (fs.existsSync(target)) continue;
    // a `new URL(...)` is a default resource path (a decoder the loader fetches lazily); the lab points the loaders at the
    // files it does ship with setDecoderPath / setTranscoderPath, so a missing default is noted, not fatal
    if (m[3]) { console.log('  (default resource not shipped, overridden by the lab: ' + path.relative(DST, file) + ' -> ' + rel + ')'); continue; }
    console.error('unresolved import in ' + path.relative(DST, file) + ': ' + rel); bad++;
  }
}
if (bad) process.exit(1);
const version = JSON.parse(fs.readFileSync(path.join(SRC, 'package.json'), 'utf8')).version;
fs.writeFileSync(path.join(DST, 'VERSION'), version + '\n');
let bytes = 0; for (const f of copied) bytes += fs.statSync(f).size;
console.log('vendored three ' + version + ': ' + copied.length + ' files, ' + (bytes / 1048576).toFixed(2) + ' MB -> ' + path.relative(process.cwd(), DST));
