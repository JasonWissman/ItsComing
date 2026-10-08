// ---------- a character view: a rigged model, its clips, and how the model's state drives them ----------
// The same wrapper serves the procedural walker and any GLB dropped on the page. The view layer owns the mixer
// (the report's CharacterView); the model only knows a distance, a gait phase and how near the thing is.
import * as THREE from 'three';
import { TAU, smoothstep, headTiltJerk, WALKER } from './model.js';

export const ROLES = ['walk', 'idle', 'reach'];
const PATTERNS = { walk: /walk|shamble|limp|run|sprint|locomot/i, idle: /idle|breath|stand|sway/i, reach: /reach|attack|grab|lunge|scream|arms/i };
// which clip plays which role: by name first, then by position in the file
export function guessRoles(clips) {
  const roles = { walk: null, idle: null, reach: null };
  for (const r of ROLES) { const c = clips.find(c => PATTERNS[r].test(c.name)); if (c) roles[r] = c.name; }
  if (!roles.walk && clips.length) roles.walk = (clips.find(c => c.name !== roles.idle && c.name !== roles.reach) || clips[0]).name;
  return roles;
}

export function makeCharacterView(o) {
  const root = o.root, clips = o.clips || [];
  const mixer = new THREE.AnimationMixer(root);
  const actions = {};
  const roles = Object.assign(guessRoles(clips), o.roles || {});
  const weights = { walk: 1, idle: 0, reach: 0 };
  const view = {
    name: o.name || 'character', root, clips, roles, actions, mixer,
    height: o.height || WALKER.h,
    stride: o.stride || 2 / WALKER.stepRate,     // metres per walk cycle (two steps)
    materials: o.materials || [], hulls: o.hulls || [], headBone: o.headBone || null, mouth: o.mouth || null,
    headRest: null, jerk: true, additiveReach: !!o.additiveReach,   // the walker's reach is a delta laid over the walk; a file's reach clip is crossfaded
  };
  const tmpQ = new THREE.Quaternion(), zAxis = new THREE.Vector3(0, 0, 1);
  function bind(role, name) {
    if (actions[role]) { actions[role].stop(); delete actions[role]; }
    const clip = clips.find(c => c.name === name);
    roles[role] = clip ? clip.name : null;
    if (!clip) return;
    const a = mixer.clipAction(clip, root, role === 'reach' && view.additiveReach ? THREE.AdditiveAnimationBlendMode : THREE.NormalAnimationBlendMode);
    a.setLoop(THREE.LoopRepeat, Infinity); a.enabled = true; a.setEffectiveWeight(role === 'walk' ? 1 : 0); a.play();
    if (role === 'walk') a.timeScale = 0;     // the walk is driven by the gait phase, not the clock: no foot sliding
    actions[role] = a;
  }
  for (const r of ROLES) if (roles[r]) bind(r, roles[r]);
  if (view.headBone) view.headRest = view.headBone.quaternion.clone();
  // snap: the model's interpolated snapshot; dt: real seconds
  function update(dt, snap, t) {
    const reach = smoothstep(Math.max(snap.near, snap.lunge));
    const going = snap.moving || snap.lunge > 0;
    // additive: the walk keeps its full weight and the reach is added on top; crossfade: the reach takes over the body
    const keep = view.additiveReach ? 1 : 1 - reach * 0.85;
    const target = { walk: going ? keep : 0, idle: going ? 0 : keep, reach };
    const k = 1 - Math.exp(-dt * 8);
    for (const r of ROLES) { weights[r] += (target[r] - weights[r]) * k; if (actions[r]) actions[r].setEffectiveWeight(weights[r]); }
    const walk = actions.walk;
    if (walk) {
      const cycles = snap.gait / TAU * ((2 / WALKER.stepRate) / view.stride);   // the walker's cycle is 3.6 m; a clip's own stride rescales it
      const jolt = snap.stagger > 0 ? Math.sin(snap.stagger * 40) * 0.04 * snap.stagger : 0;
      walk.time = ((cycles + jolt) % 1 + 1) % 1 * walk.getClip().duration;
    }
    mixer.update(dt);
    // procedural layers on top of the clips: the snapping head tilt, the mouth that opens as it nears
    if (view.headBone) {
      const tilt = view.jerk ? headTiltJerk(snap.ct, 2.7, 0.33) * (1 - snap.lunge) : 0;
      const base = actions.walk || actions.idle || actions.reach ? view.headBone.quaternion : view.headRest;   // animated heads were just written by the mixer
      if (!(actions.walk || actions.idle || actions.reach)) view.headBone.quaternion.copy(view.headRest);
      tmpQ.setFromAxisAngle(zAxis, tilt);
      view.headBone.quaternion.copy(base).multiply(tmpQ);
    }
    if (view.mouth) {
      const b = view.mouth.userData.baseScale || (view.mouth.userData.baseScale = view.mouth.scale.clone());
      view.mouth.scale.set(b.x * (1 + snap.near * 0.4 + snap.lunge * 0.6), b.y * (1 + snap.near * 2.5 + snap.lunge * 4), b.z);
    }
    for (const m of view.materials) { m.uniforms.uDissolve.value = snap.dissolve; m.uniforms.uHurt.value = snap.hurt > 0 ? 0.6 : 0; m.uniforms.uTime.value = t; }
    root.visible = !snap.gone;
  }
  function setOutline(on, width, color) {
    for (const h of view.hulls) { h.visible = on; if (width !== undefined) h.material.uniforms.uWidth.value = width; if (color) h.material.uniforms.uColor.value.copy(color); }
  }
  function dispose() {
    mixer.stopAllAction(); mixer.uncacheRoot(root);
    root.traverse(ob => { if (ob.isMesh) { if (ob.geometry && !ob.userData.hull) ob.geometry.dispose(); } });
    for (const m of view.materials) m.dispose();
  }
  return Object.assign(view, { update, bind, setOutline, dispose });
}
