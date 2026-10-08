'use strict';
// ---------- what the game's creature files expect to find: enough of G and AUDIO for them to run outside the game ----------
// The creatures only read these (the swimmer looks at G.L.won and G.cam.yaw; several call AUDIO.sfx on a mode change).
const G = { state: 'play', t: 0, L: { won: false, t: 0 }, cam: { yaw: 0 }, muted: true };
const AUDIO = { sfx() {}, footstep() {}, voice() {}, setLoop() {}, heartbeat() {}, on() { return false; } };
const SAVE = { data: { settings: { reducedFlash: false, reducedMotion: false, textures: true } } };
