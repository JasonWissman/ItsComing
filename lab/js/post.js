// ---------- the post stack: bloom, an optional ink-edge pass, then the game's own screen effects ----------
// Order: scene -> ink edges (depth and normal discontinuities) -> bloom -> tone mapping and sRGB (OutputPass)
// -> film (grain, vignette, the red danger pulse, chromatic aberration, flash and fade). The film pass works in
// display space, after the OutputPass, exactly where the game's Canvas 2D post() draws its vignette and grain.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const FILM = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.07 }, uVignette: { value: 1 }, uDanger: { value: 0 }, uChroma: { value: 0.6 }, uFlash: { value: 0 }, uFade: { value: 0 }, uAspect: { value: 1.7 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float uTime, uGrain, uVignette, uDanger, uChroma, uFlash, uFade, uAspect;
varying vec2 vUv;
float hash( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }
void main() {
	vec2 c = vUv - 0.5;
	float r2 = dot( c, c );
	// the colour fringes grow with the danger pulse, from a touch to a smear as it reaches you
	float ca = uChroma * ( 0.004 + 0.03 * uDanger ) * r2 * 4.0;
	vec3 col;
	col.r = texture2D( tDiffuse, vUv + c * ca ).r;
	col.g = texture2D( tDiffuse, vUv ).g;
	col.b = texture2D( tDiffuse, vUv - c * ca ).b;
	// vignette, as the game's: clear in the middle, 85% dark in the corners
	float rr = length( c * vec2( uAspect, 1.0 ) ) / length( vec2( uAspect, 1.0 ) * 0.5 );
	col *= 1.0 - smoothstep( 0.35, 1.0, rr ) * 0.85 * uVignette;
	// the red edge
	float dk = smoothstep( 0.25, 0.75, rr ) * 0.75 * uDanger;
	col = mix( col, vec3( 0.47, 0.0, 0.0 ), dk );
	// grain, as the game's: half the pixels lifted toward a random light value, never darkened
	vec2 gp = floor( gl_FragCoord.xy ) + floor( fract( uTime * 7.0 ) * 100.0 );
	float on = step( 0.5, hash( gp + 17.0 ) );
	float v = 0.4 + 0.6 * hash( gp );
	col = mix( col, vec3( v ), uGrain * on );
	col = mix( col, vec3( 1.0 ), uFlash );
	col *= 1.0 - uFade;
	gl_FragColor = vec4( col, 1.0 );
}`,
};

// edges where depth or normals jump: a second, cheap render of the scene with a normal material, then a Sobel
class InkPass extends Pass {
  constructor(scene, camera) {
    super();
    this.scene = scene; this.camera = camera;
    this.target = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1), minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.normalMat = new THREE.MeshNormalMaterial();
    this.uniforms = { tDiffuse: { value: null }, tNormal: { value: this.target.texture }, tDepth: { value: this.target.depthTexture }, uResolution: { value: new THREE.Vector2(1, 1) }, uStrength: { value: 0.7 }, uNear: { value: 0.05 }, uFar: { value: 2000 }, uFade: { value: 30 } };
    this.quad = new FullScreenQuad(new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
      fragmentShader: `
#include <packing>
uniform sampler2D tDiffuse, tNormal, tDepth;
uniform vec2 uResolution;
uniform float uStrength, uNear, uFar, uFade;
varying vec2 vUv;
float viewZ( vec2 uv ) { return - perspectiveDepthToViewZ( texture2D( tDepth, uv ).x, uNear, uFar ); }
void main() {
	vec2 px = 1.0 / uResolution;
	float z = viewZ( vUv );
	vec3 n = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;
	float dz = 0.0, dn = 0.0;
	vec2 offs[4]; offs[0] = vec2( px.x, 0.0 ); offs[1] = vec2( - px.x, 0.0 ); offs[2] = vec2( 0.0, px.y ); offs[3] = vec2( 0.0, - px.y );
	for ( int i = 0; i < 4; i ++ ) {
		dz = max( dz, abs( viewZ( vUv + offs[ i ] ) - z ) );
		dn = max( dn, 1.0 - dot( n, texture2D( tNormal, vUv + offs[ i ] ).xyz * 2.0 - 1.0 ) );
	}
	float edge = max( smoothstep( 0.04 * z, 0.12 * z, dz ), smoothstep( 0.4, 0.75, dn ) );
	edge *= 1.0 - smoothstep( uFade * 0.3, uFade, z );     // far edges are fog, not ink
	vec4 col = texture2D( tDiffuse, vUv );
	col.rgb *= 1.0 - edge * uStrength;
	gl_FragColor = col;
}` }));
    this.hidden = [];
  }
  setSize(w, h) { this.target.setSize(w, h); this.uniforms.uResolution.value.set(w, h); }
  render(renderer, writeBuffer, readBuffer) {
    const scene = this.scene, hidden = this.hidden;
    hidden.length = 0;
    scene.traverse(ob => { if (ob.userData.noInk && ob.visible) { ob.visible = false; hidden.push(ob); } });
    const fog = scene.fog, bg = scene.background, override = scene.overrideMaterial;
    scene.fog = null; scene.background = null; scene.overrideMaterial = this.normalMat;
    renderer.setRenderTarget(this.target); renderer.clear(); renderer.render(scene, this.camera);
    scene.fog = fog; scene.background = bg; scene.overrideMaterial = override;
    for (const ob of hidden) ob.visible = true;
    this.uniforms.tDiffuse.value = readBuffer.texture;
    this.uniforms.uNear.value = this.camera.near; this.uniforms.uFar.value = this.camera.far;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) renderer.clear();
    this.quad.render(renderer);
  }
  dispose() { this.target.dispose(); this.normalMat.dispose(); this.quad.dispose(); }
}

export function createPost(renderer, scene, camera, opts) {
  const o = opts || {};
  const size = new THREE.Vector2(); renderer.getSize(size);
  const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: o.samples === undefined ? 4 : o.samples });
  const composer = new EffectComposer(renderer, target);
  const renderPass = new RenderPass(scene, camera);
  const ink = new InkPass(scene, camera); ink.enabled = false;
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.4, 0.5, 0.8);
  const output = new OutputPass();
  const film = new ShaderPass(FILM);
  composer.addPass(renderPass); composer.addPass(ink); composer.addPass(bloom); composer.addPass(output); composer.addPass(film);
  const post = {
    composer, renderPass, ink, bloom, output, film, uniforms: film.uniforms,
    setSize(w, h, pr) { composer.setPixelRatio(pr); composer.setSize(w, h); ink.setSize(Math.round(w * pr), Math.round(h * pr)); bloom.setSize(Math.round(w * pr / 2), Math.round(h * pr / 2)); film.uniforms.uAspect.value = w / h; },
    configure(s) {
      bloom.enabled = !!s.bloom; bloom.strength = s.bloomStrength; bloom.radius = s.bloomRadius; bloom.threshold = s.bloomThreshold;
      ink.enabled = !!s.ink; ink.uniforms.uStrength.value = s.inkStrength;
      film.uniforms.uGrain.value = s.grain; film.uniforms.uVignette.value = s.vignette; film.uniforms.uChroma.value = s.chroma;
    },
    render(dt) { composer.render(dt); },
    dispose() { composer.dispose(); ink.dispose(); target.dispose(); },
  };
  post.setSize(size.x, size.y, renderer.getPixelRatio());
  return post;
}
