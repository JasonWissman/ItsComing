// ---------- materials: a toon shader with dissolve, an inverted-hull outline, and the game's fog ----------
// The character shader is hand-written GLSL on top of Three's chunks, so it skins, fogs and tone-maps like a
// built-in material while the lighting is banded. Every uniform that is the same for all character materials
// (the moon, the lamp, the band count) lives in `shared`, so the panel changes one value and every material sees it.
import * as THREE from 'three';

export function srgb(c) { return new THREE.Color().setRGB(c[0] / 255, c[1] / 255, c[2] / 255, THREE.SRGBColorSpace); }

// The game's fog is 1 - exp(-d / fogDist): linear in distance. Three's FogExp2 is quadratic in distance, which
// reads very differently over 130 m, so the built-in chunk is replaced before any material compiles. fogDensity
// is then 1 / fogDist. (The first thing a port must get right is the fog: it is most of the picture.)
export function patchFogToExponential() {
  THREE.ShaderChunk.fog_fragment = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`;
}

// a gradient map for MeshToonMaterial (the environment): n bands, slightly lifted so black never goes fully flat
export function createGradientMap(n) {
  const data = new Uint8Array(n);
  for (let i = 0; i < n; i++) data[i] = Math.round(40 + (i / (n - 1)) * 215);
  const tex = new THREE.DataTexture(data, n, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.needsUpdate = true;
  return tex;
}

// uniforms shared by every character material (one object each, referenced by all)
export function createSharedUniforms() {
  return {
    uMoonDir: { value: new THREE.Vector3(0.4, 0.5, 0.75).normalize() },   // toward the moon
    uMoonColor: { value: srgb([150, 165, 215]).multiplyScalar(2.4) },
    uSkyColor: { value: new THREE.Color(0.9, 0.93, 1.0) },        // the same ambient as the field's hemisphere light
    uGroundColor: { value: new THREE.Color(0.6, 0.58, 0.52) },
    uLightPos: { value: new THREE.Vector3(0, 1.6, -0.2) },
    uLightColor: { value: srgb([140, 160, 220]) },
    uLightRadius: { value: 4.5 },
    uLightIntensity: { value: 0.9 },
    uSteps: { value: 3 },
    uRim: { value: 0.3 },
    uRimColor: { value: srgb([150, 165, 215]) },
    uDissolveColor: { value: new THREE.Color(1.6, 0.6, 0.25) },
    uTime: { value: 0 },
    uDissolve: { value: 0 },
    uHurt: { value: 0 },
  };
}

const TOON_VERT = `
#include <common>
#include <skinning_pars_vertex>
#include <fog_pars_vertex>
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vObjPos;
varying vec2 vUv;
void main() {
	vUv = uv;
	vObjPos = position;
	#include <beginnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <begin_vertex>
	#include <skinning_vertex>
	vec4 worldPos = modelMatrix * vec4( transformed, 1.0 );
	vWorldPos = worldPos.xyz;
	vWorldNormal = normalize( mat3( modelMatrix ) * objectNormal );
	vec4 mvPosition = viewMatrix * worldPos;
	gl_Position = projectionMatrix * mvPosition;
	#include <fog_vertex>
}`;

const TOON_FRAG = `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColor;
uniform sampler2D uMap;
uniform float uHasMap;
uniform vec3 uMoonDir, uMoonColor, uSkyColor, uGroundColor;
uniform vec3 uLightPos, uLightColor;
uniform float uLightRadius, uLightIntensity;
uniform float uSteps, uRim;
uniform vec3 uRimColor, uDissolveColor;
uniform float uDissolve, uHurt, uTime;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vObjPos;
varying vec2 vUv;
// value noise in object space: the burn pattern sticks to the body as it walks
float hash3( vec3 p ) { p = fract( p * 0.3183099 + vec3( 0.1, 0.2, 0.3 ) ); p *= 17.0; return fract( p.x * p.y * p.z * ( p.x + p.y + p.z ) ); }
float vnoise( vec3 x ) {
	vec3 i = floor( x ), f = fract( x ); f = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( mix( hash3( i ), hash3( i + vec3( 1, 0, 0 ) ), f.x ), mix( hash3( i + vec3( 0, 1, 0 ) ), hash3( i + vec3( 1, 1, 0 ) ), f.x ), f.y ),
	            mix( mix( hash3( i + vec3( 0, 0, 1 ) ), hash3( i + vec3( 1, 0, 1 ) ), f.x ), mix( hash3( i + vec3( 0, 1, 1 ) ), hash3( i + vec3( 1, 1, 1 ) ), f.x ), f.y ), f.z );
}
// quantise to bands, with the step edges anti-aliased by the screen-space derivative
float band( float x, float steps ) {
	float s = x * steps;
	float f = floor( s ), r = s - f;
	float w = clamp( fwidth( s ) * 1.2, 0.01, 0.5 );
	return clamp( ( f + smoothstep( 0.5 - w, 0.5 + w, r ) ) / steps, 0.0, 1.0 );
}
void main() {
	vec3 base = uColor;
	if ( uHasMap > 0.5 ) base *= texture2D( uMap, vUv ).rgb;
	vec3 N = normalize( vWorldNormal );
	vec3 V = normalize( cameraPosition - vWorldPos );
	vec3 emissive = vec3( 0.0 );
	if ( uDissolve > 0.0 ) {
		float n = vnoise( vObjPos * 7.0 ) * 0.7 + vnoise( vObjPos * 23.0 ) * 0.3;
		float edge = n - uDissolve * 1.15 + 0.08;
		if ( edge < 0.0 ) discard;
		emissive = uDissolveColor * smoothstep( 0.09, 0.0, edge ) * 2.5;
	}
	// hemisphere ambient, then the moon in bands, then the lamp by the door (its reach is short) in bands
	float up = N.y * 0.5 + 0.5;
	vec3 col = base * mix( uGroundColor, uSkyColor, up );
	float ndl = max( dot( N, uMoonDir ), 0.0 );
	col += base * uMoonColor * band( ndl, uSteps );
	vec3 Ld = uLightPos - vWorldPos;
	float d = length( Ld );
	float att = clamp( 1.0 - d / uLightRadius, 0.0, 1.0 ); att *= att;
	col += base * uLightColor * band( max( dot( N, Ld / max( d, 1e-4 ) ), 0.0 ) * att * uLightIntensity, uSteps ) * 2.0;
	// a hard rim so the silhouette reads against the fog; kept off the tops of things (feet, shoulders) seen edge-on
	float rim = 1.0 - max( dot( N, V ), 0.0 );
	col += uRimColor * uRim * smoothstep( 0.7, 0.78, rim ) * ( 0.3 + 0.7 * ndl ) * ( 1.0 - 0.8 * max( N.y, 0.0 ) );
	col = mix( col, vec3( 0.55, 0.04, 0.04 ), uHurt );
	col += emissive;
	gl_FragColor = vec4( col, 1.0 );
	#include <fog_fragment>
}`;

export function createToonMaterial(shared, opts) {
  const o = opts || {};
  const color = o.color instanceof THREE.Color ? o.color : srgb(o.color || [128, 128, 128]);
  const mat = new THREE.ShaderMaterial({
    name: o.name || 'toon',
    uniforms: Object.assign(THREE.UniformsUtils.merge([THREE.UniformsLib.fog]), shared, {
      uColor: { value: color },
      uMap: { value: o.map || null },
      uHasMap: { value: o.map ? 1 : 0 },
    }),
    vertexShader: TOON_VERT, fragmentShader: TOON_FRAG,
    fog: true,
  });
  mat.userData.toon = true;
  return mat;
}

// the classic ink outline: the same mesh again, back faces only, pushed out along its normals by a few pixels
const HULL_VERT = `
#include <common>
#include <skinning_pars_vertex>
#include <fog_pars_vertex>
uniform float uWidth;
uniform vec2 uResolution;
void main() {
	#include <beginnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <begin_vertex>
	#include <skinning_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
	vec3 vn = normalize( normalMatrix * objectNormal );
	vec4 clip = projectionMatrix * mvPosition;
	// a constant width in pixels up close, thinning with distance so a far silhouette is not all outline
	float px = max( 0.75, uWidth * min( 1.0, 14.0 / max( 1.0, - mvPosition.z ) ) );
	vec2 dir = vn.xy;
	float l = length( dir );
	dir = l > 1e-4 ? dir / max( l, 0.35 ) : vec2( 0.0 );
	clip.xy += dir * px * 2.0 / uResolution * clip.w;
	gl_Position = clip;
	#include <fog_vertex>
}`;
const HULL_FRAG = `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColor;
void main() {
	gl_FragColor = vec4( uColor, 1.0 );
	#include <fog_fragment>
}`;
export function createHullMaterial(opts) {
  const o = opts || {};
  return new THREE.ShaderMaterial({
    name: 'hull',
    uniforms: Object.assign(THREE.UniformsUtils.merge([THREE.UniformsLib.fog]), {
      uWidth: { value: o.width === undefined ? 2.5 : o.width },
      uResolution: { value: new THREE.Vector2(1280, 760) },
      uColor: { value: o.color instanceof THREE.Color ? o.color : srgb(o.color || [16, 18, 30]) },   // a shade lighter than the body, so a limb across the torso still reads
    }),
    vertexShader: HULL_VERT, fragmentShader: HULL_FRAG,
    side: THREE.BackSide, fog: true,
  });
}
// a hull for a mesh or skinned mesh: shares the geometry (and the skeleton), sits as a child so it moves with it
export function addHull(mesh, hullMat) {
  let hull;
  if (mesh.isSkinnedMesh) { hull = new THREE.SkinnedMesh(mesh.geometry, hullMat); mesh.add(hull); hull.bind(mesh.skeleton, mesh.bindMatrix); }
  else { hull = new THREE.Mesh(mesh.geometry, hullMat); mesh.add(hull); }
  hull.name = mesh.name + '.hull'; hull.frustumCulled = false; hull.castShadow = false; hull.userData.hull = true;
  return hull;
}
